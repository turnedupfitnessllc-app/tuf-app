/**
 * Panther Program Routes — 30-Day Engine v2
 *
 * GET  /api/panther-program/:userId/state      — get user program state
 * POST /api/panther-program/:userId/state      — upsert user program state
 * POST /api/panther-program/:userId/complete   — complete today (XP multiplier + badge unlocks)
 * GET  /api/panther-program/leaderboard        — top 50 users by XP
 * POST /api/panther-program/share/video        — generate shareable video summary
 */

import { Router } from "express";
import {
  getUserProgramState,
  upsertUserProgramState,
  getLeaderboard,
  type UserProgramState,
} from "../db.js";

const router = Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

/** XP multiplier based on streak */
function calculateXP(baseXP: number, streak: number): number {
  let multiplier = 1;
  if (streak >= 14) multiplier = 2;
  else if (streak >= 7) multiplier = 1.5;
  return Math.round(baseXP * multiplier);
}

/** Phase-based coach message */
function getCoachMessage(phase: string): string {
  const messages: Record<string, string> = {
    Control:   "Control is improving.",
    Stability: "Your balance is stronger.",
    Strength:  "You're building real power.",
    Explosion: "Speed is increasing.",
    Evolution: "You've transformed.",
  };
  return messages[phase] || "Keep going.";
}

/** Streak-based motivation for share text */
function getMotivation(streak: number): string {
  if (streak >= 14) return "Apex discipline unlocked.";
  if (streak >= 7)  return "Momentum is building.";
  return "Consistency is power.";
}

/** Phase badge unlocks — triggered on the COMPLETING day (before advancing) */
const PHASE_UNLOCK_DAYS: Record<number, string> = {
  7:  "Phase 2 Badge — Stability Unlocked",
  14: "Phase 3 Badge — Strength Unlocked",
  21: "Phase 4 Badge — Explosion Unlocked",
  29: "Phase 5 Badge — Evolution Unlocked",
  30: "Final Badge — Apex Predator",
};

/** Streak badge unlocks */
function getStreakBadge(newStreak: number): string | null {
  if (newStreak === 7)  return "Hunter Mode";
  if (newStreak === 14) return "Apex Discipline";
  if (newStreak === 21) return "Panther Elite";
  if (newStreak === 30) return "Legendary Streak";
  return null;
}

// ── GET /api/panther-program/leaderboard ─────────────────────────────────────
router.get("/leaderboard", async (_req, res) => {
  try {
    const top = await getLeaderboard(50);
    return res.json({ success: true, top_users: top });
  } catch (err) {
    console.error("[PantherProgram] GET leaderboard error:", err);
    return res.status(500).json({ success: false, error: "Failed to get leaderboard" });
  }
});

// ── GET /api/panther-program/:userId/state ────────────────────────────────────
router.get("/:userId/state", async (req, res) => {
  try {
    const { userId } = req.params;
    const state = await getUserProgramState(userId);
    if (!state) {
      const defaultState: Omit<UserProgramState, "updated_at"> = {
        user_id:               userId,
        level:                 "Hunter",
        goal:                  "Athletic Performance",
        days_per_week:         4,
        session_length:        30,
        current_day:           1,
        phase:                 "Control",
        start_date:            new Date().toISOString().split("T")[0],
        completed_days:        [],
        streak:                0,
        xp:                    0,
        earned_badges:         [],
        last_performance_score: null,
        workouts_completed:    0,
        name:                  "",
      };
      return res.json({ success: true, data: defaultState, isNew: true });
    }
    return res.json({ success: true, data: state });
  } catch (err) {
    console.error("[PantherProgram] GET state error:", err);
    return res.status(500).json({ success: false, error: "Failed to get program state" });
  }
});

// ── POST /api/panther-program/:userId/state ───────────────────────────────────
router.post("/:userId/state", async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body as Partial<Omit<UserProgramState, "user_id">>;
    const state = await upsertUserProgramState(userId, data);
    return res.json({ success: true, data: state });
  } catch (err) {
    console.error("[PantherProgram] POST state error:", err);
    return res.status(500).json({ success: false, error: "Failed to save program state" });
  }
});

// ── POST /api/panther-program/:userId/complete ────────────────────────────────
// Body: { performance_score?: number; calories?: number; reps?: number; name?: string }
router.post("/:userId/complete", async (req, res) => {
  try {
    const { userId } = req.params;
    const body = req.body as {
      performance_score?: number;
      calories?: number;
      reps?: number;
      name?: string;
    };

    const existing = await getUserProgramState(userId);
    const user = existing ?? {
      user_id:               userId,
      level:                 "Hunter" as const,
      goal:                  "Athletic Performance",
      days_per_week:         4,
      session_length:        30,
      current_day:           1,
      phase:                 "Control",
      start_date:            new Date().toISOString().split("T")[0],
      completed_days:        [] as number[],
      streak:                0,
      xp:                    0,
      earned_badges:         [] as string[],
      last_performance_score: null as number | null,
      workouts_completed:    0,
      name:                  body.name ?? "",
      updated_at:            Date.now(),
    };

    // Idempotent — prevent duplicate completion
    if (user.completed_days.includes(user.current_day)) {
      return res.json({ success: true, data: user, alreadyCompleted: true });
    }

    const today = new Date().toISOString().split("T")[0];
    const updatedCompletedDays = [...user.completed_days, user.current_day];

    // ── Streak logic ──────────────────────────────────────────────────────────
    let newStreak = user.streak || 0;
    if (user.last_completed_date) {
      const lastDate = new Date(user.last_completed_date);
      const diffDays = Math.floor(
        (new Date(today).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) newStreak += 1;
      else if (diffDays > 1) newStreak = 1; // reset
    } else {
      newStreak = 1;
    }

    // ── Advance day & phase ───────────────────────────────────────────────────
    const nextDay = Math.min(user.current_day + 1, 30);
    let phase = "Control";
    if (nextDay <= 7)       phase = "Control";
    else if (nextDay <= 14) phase = "Stability";
    else if (nextDay <= 21) phase = "Strength";
    else if (nextDay <= 29) phase = "Explosion";
    else                    phase = "Evolution";

    // ── XP with multiplier ────────────────────────────────────────────────────
    const phaseBadge  = PHASE_UNLOCK_DAYS[user.current_day] ?? null;
    const streakBadge = getStreakBadge(newStreak);
    const bonusXP     = phaseBadge ? 100 : 0;
    const xpAwarded   = calculateXP(50, newStreak) + bonusXP;
    const newXp       = (user.xp ?? 0) + xpAwarded;

    // ── Badge collection ──────────────────────────────────────────────────────
    const earnedBadges = [...(user.earned_badges ?? [])];
    if (phaseBadge  && !earnedBadges.includes(phaseBadge))  earnedBadges.push(phaseBadge);
    if (streakBadge && !earnedBadges.includes(streakBadge)) earnedBadges.push(streakBadge);
    const newlyUnlocked = [phaseBadge, streakBadge].filter(Boolean) as string[];

    // ── Performance score ─────────────────────────────────────────────────────
    const performanceScore = typeof body.performance_score === "number"
      ? body.performance_score : 85;

    // ── Persist ───────────────────────────────────────────────────────────────
    const updated = await upsertUserProgramState(userId, {
      completed_days:        updatedCompletedDays,
      current_day:           nextDay,
      phase,
      streak:                newStreak,
      last_completed_date:   today,
      xp:                    newXp,
      earned_badges:         earnedBadges,
      last_performance_score: performanceScore,
      workouts_completed:    (user.workouts_completed ?? 0) + 1,
      name:                  body.name ?? user.name ?? "",
    });

    // ── Share text ────────────────────────────────────────────────────────────
    const shareText = `🐆 Panther Training Update:\n\nDay ${user.current_day} Complete\n🔥 Streak: ${newStreak}\n⚡ XP: +${xpAwarded}\n\n"${getMotivation(newStreak)}"`;

    console.log(
      `[PantherProgram] Day ${user.current_day} complete | ${userId} | XP +${xpAwarded} (total: ${newXp}) | Streak: ${newStreak} | Badges: ${newlyUnlocked.join(", ") || "none"}`
    );

    return res.json({
      success:        true,
      data:           updated,
      xpAwarded,
      xpMultiplier:   newStreak >= 14 ? 2 : newStreak >= 7 ? 1.5 : 1,
      unlockedBadges: newlyUnlocked,
      performanceScore,
      coachMessage:   getCoachMessage(updated?.phase ?? phase),
      shareText,
    });
  } catch (err) {
    console.error("[PantherProgram] POST complete error:", err);
    return res.status(500).json({ success: false, error: "Failed to complete day" });
  }
});

// ── POST /api/panther-program/share/video ─────────────────────────────────────
// Body: { user_id, day, streak, xp_earned, phase, calories, reps, badge }
// Returns: { video_url } — for now returns a static CDN asset per phase
router.post("/share/video", async (req, res) => {
  try {
    const body = req.body as {
      user_id?: string;
      day?: number;
      streak?: number;
      xp_earned?: number;
      phase?: string;
      calories?: number;
      reps?: number;
      badge?: string;
    };

    // Phase-specific share video assets
    const phaseVideos: Record<string, string> = {
      Control:   "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/panther-hero-splash_7a05a834.mp4",
      Stability: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/panther-hero-splash_7a05a834.mp4",
      Strength:  "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/panther-hero-splash_7a05a834.mp4",
      Explosion: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/panther-hero-splash_7a05a834.mp4",
      Evolution: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/panther-hero-splash_7a05a834.mp4",
    };

    const video_url = phaseVideos[body.phase ?? "Control"];
    const shareText = `🐆 Panther Training Update:\n\nDay ${body.day ?? 1} Complete\n🔥 Streak: ${body.streak ?? 1}\n⚡ XP: +${body.xp_earned ?? 50}\n\n"${getMotivation(body.streak ?? 1)}"`;

    return res.json({
      success:    true,
      video_url,
      share_text: shareText,
    });
  } catch (err) {
    console.error("[PantherProgram] POST share/video error:", err);
    return res.status(500).json({ success: false, error: "Failed to generate share video" });
  }
});

export default router;
