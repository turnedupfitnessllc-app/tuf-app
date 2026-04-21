/**
 * TUF MPS (Movement Performance Score) Service
 * Ported from ChatGPT TUFPantherBrainBackend → adapted for lowdb.
 * Calculates session metrics, awards MPS points, maintains leaderboard.
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */
import { randomUUID } from "crypto";
import * as dbModule from "../db.js";
import type { MPSEntry } from "../db.js";

// ── calcSessionMetrics — ported from ChatGPT pantherEngine.js ─────────────────

interface SetData {
  repScores: number[];
  dropResult?: { detected: boolean };
}

export interface SessionMetrics {
  totalSets: number;
  totalReps: number;
  avgFormScore: number;
  interventions: number;
  mpsPoints: number;
  formGrade: "A" | "B" | "C" | "D" | "F";
}

export function calcSessionMetrics(sets: SetData[]): SessionMetrics | null {
  if (!sets || sets.length === 0) return null;

  const allScores  = sets.flatMap(s => s.repScores ?? []);
  const avgScore   = allScores.length
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 0;
  const interventions = sets.filter(s => s.dropResult?.detected).length;
  const mpsPoints = sets.length * 2 + Math.round(avgScore / 10);

  return {
    totalSets:    sets.length,
    totalReps:    allScores.length,
    avgFormScore: avgScore,
    interventions,
    mpsPoints,
    formGrade:
      avgScore >= 85 ? "A" :
      avgScore >= 75 ? "B" :
      avgScore >= 65 ? "C" :
      avgScore >= 50 ? "D" : "F",
  };
}

// ── detectFormDrop — enhanced server-side version from ChatGPT backend ─────────

interface ClientProfile {
  age?: number;
  nasmPhase?: number;
  dysfunctionFlags?: string[];
}

export interface FormDropResult {
  detected: boolean;
  severity: "NONE" | "MODERATE" | "HIGH" | "CRITICAL" | "INSUFFICIENT_DATA";
  action: "CUE" | "MODIFY" | "STOP" | null;
  mode: "STEALTH" | "PRECISION" | "ATTACK";
  windowAvg: number | null;
  threshold: number | null;
  trendDrop: number | null;
  repCount: number;
  pantherPayload: {
    headline: string;
    body: string;
    directive: string;
  } | null;
}

export function detectFormDropEnhanced(
  repScores: number[],
  clientProfile: ClientProfile = {}
): FormDropResult {
  const { age = 40, nasmPhase = 1, dysfunctionFlags = [] } = clientProfile;

  if (!Array.isArray(repScores) || repScores.length < 3) {
    return {
      detected: false, severity: "INSUFFICIENT_DATA", action: null,
      mode: "STEALTH", windowAvg: null, threshold: null,
      trendDrop: null, repCount: repScores?.length ?? 0, pantherPayload: null,
    };
  }

  const baseThreshold = 65;
  const ageAdjust   = age >= 50 ? 5 : age >= 40 ? 3 : 0;
  const phaseAdjust = nasmPhase <= 1 ? 5 : 0;
  const ucsAdjust   = dysfunctionFlags.includes("UCS") ? 3 : 0;
  const lcsAdjust   = dysfunctionFlags.includes("LCS") ? 3 : 0;
  const threshold   = baseThreshold + ageAdjust + phaseAdjust + ucsAdjust + lcsAdjust;

  const window    = repScores.slice(-5);
  const windowAvg = window.reduce((a, b) => a + b, 0) / window.length;
  const mid       = Math.floor(repScores.length / 2);
  const firstHalf = repScores.slice(0, mid);
  const secondHalf= repScores.slice(mid);
  const firstAvg  = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const trendDrop = firstAvg - secondAvg;

  let severity: FormDropResult["severity"] = "NONE";
  let action:   FormDropResult["action"]   = null;
  let mode:     FormDropResult["mode"]     = "STEALTH";

  if (windowAvg < threshold - 20 || trendDrop > 20) {
    severity = "CRITICAL"; action = "STOP";   mode = "ATTACK";
  } else if (windowAvg < threshold - 10 || trendDrop > 12) {
    severity = "HIGH";     action = "MODIFY"; mode = "ATTACK";
  } else if (windowAvg < threshold || trendDrop > 6) {
    severity = "MODERATE"; action = "CUE";    mode = "PRECISION";
  }

  const detected = severity !== "NONE";
  return {
    detected, severity, action, mode,
    windowAvg:  Math.round(windowAvg),
    threshold,
    trendDrop:  Math.round(trendDrop),
    repCount:   repScores.length,
    pantherPayload: detected ? {
      headline:
        action === "STOP"   ? "STOP THE SET."       :
        action === "MODIFY" ? "FORM BREAKING DOWN." : "STAY SHARP.",
      body:
        `Rep quality at ${Math.round(windowAvg)}/100. ` +
        (trendDrop > 6 ? `Declining ${Math.round(trendDrop)} pts across session. ` : "") +
        `Threshold: ${threshold}.`,
      directive:
        action === "STOP"   ? "Put it down. Reset your position. Don't chase reps with broken form." :
        action === "MODIFY" ? "Drop load 20%. Slow the eccentric. Every rep has to count."           :
                              "Brace your core. Control the descent. Panther is watching.",
    } : null,
  };
}

// ── Award MPS after a session ──────────────────────────────────────────────────

export async function awardMPS(
  user_id: string,
  session_id: string,
  metrics: SessionMetrics
): Promise<MPSEntry> {
  const entry: MPSEntry = {
    entry_id:       randomUUID(),
    user_id,
    session_id,
    mps_points:     metrics.mpsPoints,
    form_grade:     metrics.formGrade,
    avg_form_score: metrics.avgFormScore,
    total_reps:     metrics.totalReps,
    interventions:  metrics.interventions,
    date:           Date.now(),
  };
  await dbModule.saveMPSEntry(entry);

  // Also add MPS points to user XP
  const progress = await dbModule.getUserProgress(user_id);
  if (progress) {
    await dbModule.upsertUserProgress(user_id, { xp: (progress.xp ?? 0) + metrics.mpsPoints });
  }

  return entry;
}

// ── MPS Leaderboard ────────────────────────────────────────────────────────────

export async function getMPSLeaderboard(limit = 25): Promise<Array<{
  user_id: string;
  name: string;
  total_mps: number;
  sessions: number;
  avg_grade: string;
  rank: number;
}>> {
  const entries = await dbModule.getAllMPSEntries();
  const map: Record<string, { total_mps: number; sessions: number; grades: string[] }> = {};

  for (const e of entries) {
    if (!map[e.user_id]) map[e.user_id] = { total_mps: 0, sessions: 0, grades: [] };
    map[e.user_id].total_mps += e.mps_points;
    map[e.user_id].sessions++;
    map[e.user_id].grades.push(e.form_grade);
  }

  // Get user names from progress
  const allProgress = await dbModule.getAllUserProgress();
  const nameMap: Record<string, string> = {};
  for (const p of allProgress) {
    nameMap[p.user_id] = (p as unknown as { name?: string }).name ?? `Panther ${p.user_id.slice(0, 6)}`;
  }

  return Object.entries(map)
    .map(([user_id, v]) => {
      const gradeScore = (g: string) => ({ A: 4, B: 3, C: 2, D: 1, F: 0 }[g] ?? 0);
      const avgGradeNum = v.grades.reduce((a, g) => a + gradeScore(g), 0) / v.grades.length;
      const avg_grade = avgGradeNum >= 3.5 ? "A" : avgGradeNum >= 2.5 ? "B" : avgGradeNum >= 1.5 ? "C" : avgGradeNum >= 0.5 ? "D" : "F";
      return { user_id, name: nameMap[user_id] ?? `Panther ${user_id.slice(0, 6)}`, total_mps: v.total_mps, sessions: v.sessions, avg_grade };
    })
    .sort((a, b) => b.total_mps - a.total_mps)
    .slice(0, limit)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}
