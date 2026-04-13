/**
 * TUF Progress API — v1.0
 * Persists XP, streak, and NASM scores to the DB (replaces localStorage-only storage).
 *
 * Endpoints:
 *   GET  /api/progress/:userId        — fetch current progress for a user
 *   POST /api/progress/:userId        — upsert full progress object
 *   POST /api/progress/:userId/xp     — add XP delta (body: { amount: number })
 *   POST /api/progress/:userId/session — record a completed session
 */
import { Router, Request, Response } from "express";
import {
  getUserProgress,
  upsertUserProgress,
  addXP,
  UserProgress,
} from "../db.js";

const router = Router();

// ─── GET /api/progress/:userId ────────────────────────────────────────────────
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const progress = await getUserProgress(userId);
    return res.json({ progress });
  } catch (err) {
    console.error("[progress] GET error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/progress/:userId ───────────────────────────────────────────────
// Full upsert — client sends the entire ProgressData object
router.post("/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const data = req.body as Partial<Omit<UserProgress, "user_id">>;
    const progress = await upsertUserProgress(userId, data);
    return res.json({ progress });
  } catch (err) {
    console.error("[progress] POST error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/progress/:userId/xp ───────────────────────────────────────────
// Add XP delta — body: { amount: number }
router.post("/:userId/xp", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body as { amount?: number };
    if (!userId) return res.status(400).json({ error: "userId required" });
    if (typeof amount !== "number" || amount < 0) {
      return res.status(400).json({ error: "amount must be a non-negative number" });
    }
    const progress = await addXP(userId, amount);
    return res.json({ progress, awarded: amount });
  } catch (err) {
    console.error("[progress] POST /xp error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/progress/:userId/session ──────────────────────────────────────
// Record a completed session — updates streak, sessions_completed, total_minutes
// body: { durationMinutes?: number, exercisePhases?: string[], xpAward?: number }
router.post("/:userId/session", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const {
      durationMinutes = 15,
      exercisePhases = [] as string[],
      xpAward = 50,
    } = req.body as {
      durationMinutes?: number;
      exercisePhases?: string[];
      xpAward?: number;
    };

    const current = await getUserProgress(userId);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    // Streak logic
    let newStreak = current.streak_days;
    if (current.last_session_date === today) {
      // Already trained today — no streak change
    } else if (current.last_session_date === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1; // Reset streak
    }

    // NASM score deltas
    let mobilityDelta = 0, strengthDelta = 0, stabilityDelta = 0;
    for (const phase of exercisePhases) {
      if (phase === "INHIBIT" || phase === "LENGTHEN") mobilityDelta += 3;
      else if (phase === "ACTIVATE") stabilityDelta += 3;
      else if (phase === "INTEGRATE") strengthDelta += 3;
    }

    const updated = await upsertUserProgress(userId, {
      xp: current.xp + xpAward,
      streak_days: newStreak,
      longest_streak: Math.max(newStreak, current.longest_streak),
      sessions_completed: current.sessions_completed + 1,
      total_minutes: current.total_minutes + durationMinutes,
      mobility: Math.min(100, current.mobility + mobilityDelta),
      strength: Math.min(100, current.strength + strengthDelta),
      stability: Math.min(100, current.stability + stabilityDelta),
      last_session_date: today,
    });

    return res.json({ progress: updated, xpAwarded: xpAward, streakDays: newStreak });
  } catch (err) {
    console.error("[progress] POST /session error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
