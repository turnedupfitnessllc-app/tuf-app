/**
 * TUF PvP Challenge Service
 * Ported from ChatGPT TUFPantherBrainBackend → adapted for lowdb persistence.
 * Handles: issue, accept/decline, submit score, wager settlement, leaderboard.
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */
import { randomUUID } from "crypto";
import {
  PvPChallenge,
  ChallengeStatus,
  MPSEntry,
  getUserProgress,
  upsertUserProgress,
} from "../db.js";

// ── Helpers ────────────────────────────────────────────────────────────────────

async function getDb() {
  // Lazy import to avoid circular deps with db singleton
  const { default: mod } = await import("../db.js") as unknown as { default: never };
  return mod;
}

async function getChallenges(): Promise<PvPChallenge[]> {
  const { Low } = await import("lowdb");
  const { JSONFile } = await import("lowdb/node");
  const { join, dirname } = await import("path");
  const { fileURLToPath } = await import("url");
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const DB_PATH = join(__dirname, "../../data/tuf-db.json");
  const db = new Low(new JSONFile<{ pvp_challenges: PvPChallenge[] }>(DB_PATH), { pvp_challenges: [] });
  await db.read();
  return db.data.pvp_challenges ?? [];
}

// Re-use the shared db module directly
import * as dbModule from "../db.js";

// ── Issue a challenge ──────────────────────────────────────────────────────────

export async function issueChallenge(data: {
  challenger_id: string;
  challenger_name: string;
  opponent_id: string;
  opponent_name: string;
  exercise_id: string;
  exercise_name: string;
  target_reps: number;
  time_limit_seconds?: number;
  wager_xp?: number;
}): Promise<PvPChallenge> {
  const now = Date.now();
  const challenge: PvPChallenge = {
    challenge_id: randomUUID(),
    challenger_id: data.challenger_id,
    challenger_name: data.challenger_name,
    opponent_id: data.opponent_id,
    opponent_name: data.opponent_name,
    exercise_id: data.exercise_id,
    exercise_name: data.exercise_name,
    target_reps: data.target_reps,
    time_limit_seconds: data.time_limit_seconds ?? 60,
    wager_xp: data.wager_xp ?? 0,
    status: "pending",
    created_at: now,
    expires_at: now + 24 * 60 * 60 * 1000, // 24 hours
  };
  await dbModule.savePvPChallenge(challenge);
  return challenge;
}

// ── Respond to a challenge ─────────────────────────────────────────────────────

export async function respondToChallenge(
  challenge_id: string,
  user_id: string,
  accept: boolean
): Promise<PvPChallenge> {
  const challenge = await dbModule.getPvPChallenge(challenge_id);
  if (!challenge) throw new Error("Challenge not found");
  if (challenge.opponent_id !== user_id) throw new Error("Not your challenge");
  if (challenge.status !== "pending") throw new Error("Challenge already resolved");

  const updated: PvPChallenge = {
    ...challenge,
    status: accept ? "active" : "declined",
  };
  await dbModule.savePvPChallenge(updated);
  return updated;
}

// ── Submit a score ─────────────────────────────────────────────────────────────

export async function submitScore(
  challenge_id: string,
  user_id: string,
  score: number
): Promise<PvPChallenge> {
  const challenge = await dbModule.getPvPChallenge(challenge_id);
  if (!challenge) throw new Error("Challenge not found");
  if (challenge.status !== "active" && challenge.status !== "pending") {
    throw new Error("Challenge is not active");
  }
  if (challenge.challenger_id !== user_id && challenge.opponent_id !== user_id) {
    throw new Error("Not a participant");
  }

  const isChallenger = challenge.challenger_id === user_id;
  const updated: PvPChallenge = {
    ...challenge,
    challenger_score: isChallenger ? score : challenge.challenger_score,
    opponent_score:   !isChallenger ? score : challenge.opponent_score,
  };

  // Determine winner if both scores are in
  const chalScore = updated.challenger_score;
  const oppScore  = updated.opponent_score;
  if (chalScore !== undefined && oppScore !== undefined) {
    updated.status = "completed";
    updated.completed_at = Date.now();
    if (chalScore > oppScore)      updated.winner_id = challenge.challenger_id;
    else if (oppScore > chalScore) updated.winner_id = challenge.opponent_id;
    // tie: no winner_id set

    // Settle wager
    if (challenge.wager_xp > 0 && updated.winner_id) {
      await settleWager(challenge, updated.winner_id);
    }
  }

  await dbModule.savePvPChallenge(updated);
  return updated;
}

// ── Wager settlement ───────────────────────────────────────────────────────────

async function settleWager(challenge: PvPChallenge, winnerId: string) {
  const loserId = winnerId === challenge.challenger_id
    ? challenge.opponent_id
    : challenge.challenger_id;

  const winner = await getUserProgress(winnerId);
  const loser  = await getUserProgress(loserId);

  if (winner) {
    await upsertUserProgress(winnerId, { xp: (winner.xp ?? 0) + challenge.wager_xp });
  }
  if (loser) {
    await upsertUserProgress(loserId, { xp: Math.max(0, (loser.xp ?? 0) - challenge.wager_xp) });
  }
}

// ── Get challenges for a user ──────────────────────────────────────────────────

export async function getMyChallenges(
  user_id: string,
  status?: ChallengeStatus
): Promise<Array<PvPChallenge & { myRole: "challenger" | "opponent"; myScore?: number; theirScore?: number; isExpired: boolean }>> {
  const all = await dbModule.getAllPvPChallenges(user_id);
  const filtered = status ? all.filter(c => c.status === status) : all;
  return filtered
    .sort((a, b) => b.created_at - a.created_at)
    .map(c => ({
      ...c,
      myRole:    c.challenger_id === user_id ? "challenger" : "opponent",
      myScore:   c.challenger_id === user_id ? c.challenger_score : c.opponent_score,
      theirScore:c.challenger_id === user_id ? c.opponent_score   : c.challenger_score,
      isExpired: c.expires_at < Date.now(),
    }));
}

// ── PvP Win Leaderboard ────────────────────────────────────────────────────────

export async function getChallengeWins(limit = 25): Promise<Array<{ user_id: string; name: string; wins: number; rank: number }>> {
  const all = await dbModule.getAllPvPChallengesGlobal();
  const completed = all.filter(c => c.status === "completed" && c.winner_id);

  const winMap: Record<string, { name: string; wins: number }> = {};
  for (const c of completed) {
    const wid = c.winner_id!;
    const name = wid === c.challenger_id ? c.challenger_name : c.opponent_name;
    if (!winMap[wid]) winMap[wid] = { name, wins: 0 };
    winMap[wid].wins++;
  }

  return Object.entries(winMap)
    .map(([user_id, v]) => ({ user_id, ...v }))
    .sort((a, b) => b.wins - a.wins)
    .slice(0, limit)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}
