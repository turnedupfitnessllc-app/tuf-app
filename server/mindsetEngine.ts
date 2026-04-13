/**
 * THE PANTHER SYSTEM — MINDSET Engine
 * Doc 08 — MINDSET Pillar Build Doc, Section 3
 * © 2026 TURNED UP FITNESS LLC — CONFIDENTIAL
 *
 * Core logic:
 *   - getCurrentPhase()     → which phase the client is in
 *   - processCheckIn()      → validate, increment day, update streak, generate directive
 *   - generatePantherDirective() → Claude API call with MINDSET system prompt
 *   - evaluateMissedCheckIn()    → re-engagement or coach alert based on missed days
 */

import Anthropic from "@anthropic-ai/sdk";
import { getCurrentPhase, getDaysRemainingInPhase } from "./mindsetConfig.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MindsetChallenge {
  user_id: string;
  startDate: string;       // ISO date string — Day 1
  currentDay: number;      // 1–30
  currentPhase: number;    // 1–6
  streakCurrent: number;
  streakBest: number;
  totalCheckIns: number;
  lastCheckInDate: string | null;
  isActive: boolean;
  isCompleted: boolean;
  checkIns: CheckInEntry[];
}

export interface CheckInEntry {
  day: number;
  phase: number;
  completedAt: string;
  journalEntry: string | null;
  intentionalDecision: string | null;
  pantherDirective: string;
  moveAnchorComplete: boolean;
  fuelAnchorComplete: boolean;
  sharedSocial: boolean;
}

export interface CheckInInput {
  intentionalDecision?: string;
  journalEntry?: string;
  moveAnchorComplete: boolean;
  fuelAnchorComplete: boolean;
}

export interface CheckInResult {
  challenge: MindsetChallenge;
  directive: string;
  phaseChanged: boolean;
  newPhase: number | null;
  phaseConfig: ReturnType<typeof getCurrentPhase> | null;
  isCompleted: boolean;
}

export type MissedCheckInAction =
  | { type: "re_engagement"; prompt: string }
  | { type: "urgency"; prompt: string }
  | { type: "coach_alert"; prompt: string; coachNotified: boolean }
  | { type: "paused"; prompt: string };

// ─── Directive Generation ─────────────────────────────────────────────────────

export async function generatePantherDirective(
  day: number,
  phase: number,
  intentionalDecision: string = "not specified"
): Promise<string> {
  const phaseCfg = getCurrentPhase(day);

  const systemPrompt = `You are The Panther System MINDSET engine.
Client is on Day ${day} of 30, Phase ${phase}: ${phaseCfg.theme}.
Their intentional decision today: ${intentionalDecision}.

VOICE LAWS — NON-NEGOTIABLE:
- LAW 1: IDENTITY OVER MOTIVATION. Never say "stay motivated." Say "this is who you are now."
- LAW 2: PRECISION OVER INSPIRATION. No vague encouragement. Specific, tactical, direct.
- LAW 3: RESPECT THE INTELLIGENCE. Client is 40+, experienced, not a beginner.
- LAW 4: SHORT SENTENCES. Power comes from brevity. Never use more than 12 words per sentence.
- LAW 5: NO SOFTENING. No "maybe", "try to", "it's okay if". Panther does not hedge.

Respond ONLY in this exact format:
HEADLINE: [4-8 words — identity-level statement]
BODY: [1-2 sentences — tactical truth about today]
DIRECTIVE: [One specific action for today — imperative, no hedging]

No encouragement. No softening. Identity-level language only. Max 3 sentences total.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 200,
      messages: [{ role: "user", content: `Generate Day ${day} directive.` }],
      system: systemPrompt,
    });

    const content = response.content[0];
    if (content.type === "text") return content.text.trim();
    return `HEADLINE: Day ${day}. Phase ${phase}.\nBODY: The system is watching.\nDIRECTIVE: Show up.`;
  } catch (err) {
    console.error("[MindsetEngine] Claude directive error:", err);
    return `HEADLINE: Day ${day}. No excuses.\nBODY: The gap between who you are and who you want to be closes today.\nDIRECTIVE: Complete your ${phaseCfg.moveAnchor.toLowerCase()}.`;
  }
}

// ─── Check-In Processing ──────────────────────────────────────────────────────

export async function processCheckIn(
  challenge: MindsetChallenge,
  input: CheckInInput
): Promise<CheckInResult> {
  const today = new Date().toISOString().split("T")[0];

  // Prevent double check-in on same day
  if (challenge.lastCheckInDate === today) {
    throw new Error("Already checked in today.");
  }

  const prevPhase = challenge.currentPhase;
  const newDay = challenge.currentDay + 1;
  const newPhaseCfg = getCurrentPhase(newDay);
  const phaseChanged = newPhaseCfg.phase !== prevPhase;

  // Generate directive
  const directive = await generatePantherDirective(
    newDay,
    newPhaseCfg.phase,
    input.intentionalDecision
  );

  // Build check-in entry
  const entry: CheckInEntry = {
    day: newDay,
    phase: newPhaseCfg.phase,
    completedAt: new Date().toISOString(),
    journalEntry: input.journalEntry ?? null,
    intentionalDecision: input.intentionalDecision ?? null,
    pantherDirective: directive,
    moveAnchorComplete: input.moveAnchorComplete,
    fuelAnchorComplete: input.fuelAnchorComplete,
    sharedSocial: false,
  };

  // Update streak
  const lastDate = challenge.lastCheckInDate;
  let streakCurrent = challenge.streakCurrent;
  if (lastDate) {
    const last = new Date(lastDate);
    const now = new Date(today);
    const diffDays = Math.round((now.getTime() - last.getTime()) / 86400000);
    streakCurrent = diffDays === 1 ? streakCurrent + 1 : 1;
  } else {
    streakCurrent = 1;
  }
  const streakBest = Math.max(challenge.streakBest, streakCurrent);

  const isCompleted = newDay >= 30;

  const updated: MindsetChallenge = {
    ...challenge,
    currentDay: newDay,
    currentPhase: newPhaseCfg.phase,
    streakCurrent,
    streakBest,
    totalCheckIns: challenge.totalCheckIns + 1,
    lastCheckInDate: today,
    isCompleted,
    checkIns: [...challenge.checkIns, entry],
  };

  return {
    challenge: updated,
    directive,
    phaseChanged,
    newPhase: phaseChanged ? newPhaseCfg.phase : null,
    phaseConfig: phaseChanged ? newPhaseCfg : null,
    isCompleted,
  };
}

// ─── Missed Check-In Evaluation ───────────────────────────────────────────────

export function evaluateMissedCheckIn(challenge: MindsetChallenge): MissedCheckInAction {
  if (!challenge.lastCheckInDate) return {
    type: "re_engagement",
    prompt: "The challenge is waiting. Day 1 starts when you decide it does.",
  };

  const last = new Date(challenge.lastCheckInDate);
  const now = new Date();
  const missedDays = Math.floor((now.getTime() - last.getTime()) / 86400000);

  if (missedDays >= 5) return {
    type: "paused",
    prompt: "Five days dark. The challenge is paused. Resume from your current day when you're ready.",
  };

  if (missedDays >= 3) return {
    type: "coach_alert",
    prompt: `Three days missed. The Panther System has flagged your account. Day ${challenge.currentDay} is still here. The gap does not close itself.`,
    coachNotified: true,
  };

  if (missedDays >= 2) return {
    type: "urgency",
    prompt: `Two days dark. The system is waiting. Day ${challenge.currentDay} does not disappear — but momentum does.`,
  };

  return {
    type: "re_engagement",
    prompt: `The gap does not close itself. Day ${challenge.currentDay} is waiting.`,
  };
}

// ─── New Challenge Factory ────────────────────────────────────────────────────

export function createNewChallenge(userId: string): MindsetChallenge {
  return {
    user_id: userId,
    startDate: new Date().toISOString().split("T")[0],
    currentDay: 0,
    currentPhase: 1,
    streakCurrent: 0,
    streakBest: 0,
    totalCheckIns: 0,
    lastCheckInDate: null,
    isActive: true,
    isCompleted: false,
    checkIns: [],
  };
}
