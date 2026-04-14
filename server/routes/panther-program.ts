/**
 * Panther Program Routes — 30-Day Engine
 * GET  /api/panther-program/:userId/state      — get user program state
 * POST /api/panther-program/:userId/state      — upsert user program state
 * GET  /api/panther-program/:userId/today      — get today's scaled workout
 * POST /api/panther-program/:userId/complete   — complete today's day
 */

import { Router } from "express";
import {
  getUserProgramState,
  upsertUserProgramState,
  type UserProgramState,
} from "../db.js";

const router = Router();

// GET /api/panther-program/:userId/state
router.get("/:userId/state", async (req, res) => {
  try {
    const { userId } = req.params;
    const state = await getUserProgramState(userId);
    if (!state) {
      // Return default state for new users
      const defaultState: Omit<UserProgramState, "updated_at"> = {
        user_id: userId,
        level: "Hunter",
        goal: "Athletic Performance",
        days_per_week: 4,
        session_length: 30,
        current_day: 1,
        phase: "Control",
        start_date: new Date().toISOString().split("T")[0],
        completed_days: [],
        streak: 0,
      };
      return res.json({ success: true, data: defaultState, isNew: true });
    }
    return res.json({ success: true, data: state });
  } catch (err) {
    console.error("[PantherProgram] GET state error:", err);
    return res.status(500).json({ success: false, error: "Failed to get program state" });
  }
});

// POST /api/panther-program/:userId/state
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

// POST /api/panther-program/:userId/complete
// Applies the completeDay() logic server-side and persists the result
router.post("/:userId/complete", async (req, res) => {
  try {
    const { userId } = req.params;
    const existing = await getUserProgramState(userId);

    const user = existing ?? {
      user_id: userId,
      level: "Hunter" as const,
      goal: "Athletic Performance",
      days_per_week: 4,
      session_length: 30,
      current_day: 1,
      phase: "Control",
      start_date: new Date().toISOString().split("T")[0],
      completed_days: [],
      streak: 0,
      updated_at: Date.now(),
    };

    // Idempotent check
    if (user.completed_days.includes(user.current_day)) {
      return res.json({ success: true, data: user, alreadyCompleted: true });
    }

    const today = new Date().toISOString().split("T")[0];
    const updatedCompletedDays = [...user.completed_days, user.current_day];

    let newStreak = user.streak || 0;
    if (user.last_completed_date) {
      const lastDate = new Date(user.last_completed_date);
      const diffDays = Math.floor(
        (new Date(today).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) newStreak += 1;
      else if (diffDays > 1) newStreak = 1;
    } else {
      newStreak = 1;
    }

    const nextDay = Math.min(user.current_day + 1, 30);
    let phase = "Control";
    if (nextDay <= 7) phase = "Control";
    else if (nextDay <= 14) phase = "Stability";
    else if (nextDay <= 21) phase = "Strength";
    else if (nextDay <= 29) phase = "Explosion";
    else phase = "Evolution";

    const updated = await upsertUserProgramState(userId, {
      completed_days: updatedCompletedDays,
      current_day: nextDay,
      phase,
      streak: newStreak,
      last_completed_date: today,
    });

    return res.json({ success: true, data: updated, xpAwarded: 50 });
  } catch (err) {
    console.error("[PantherProgram] POST complete error:", err);
    return res.status(500).json({ success: false, error: "Failed to complete day" });
  }
});

export default router;
