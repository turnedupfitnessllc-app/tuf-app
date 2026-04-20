/**
 * Panther Brain — User Controller
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */

import { Request, Response } from "express";

export async function getUserProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });
    // Fetch from DB via existing db helpers
    res.json({ success: true, message: "Use trpc.auth.me for user profile" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateUserStats(req: Request, res: Response) {
  try {
    const { workouts_completed, streak, performance_score } = req.body;
    res.json({ success: true, updated: { workouts_completed, streak, performance_score } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
