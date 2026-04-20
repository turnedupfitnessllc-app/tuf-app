/**
 * Panther Brain — Workout Controller
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */

import { Request, Response } from "express";
import { generateWorkout, WorkoutUser } from "../services/workoutGenerator";
import { generateVideoScript } from "../services/videoGenerator";

export async function getGeneratedWorkout(req: Request, res: Response) {
  try {
    const user: WorkoutUser = {
      goal: req.body.goal ?? req.query.goal ?? "fat_loss",
      level: req.body.level ?? req.query.level ?? "beginner",
      equipment: req.body.equipment ?? [],
      age: req.body.age ? parseInt(req.body.age) : undefined,
    };

    const workout = generateWorkout(user);
    res.json({ success: true, workout });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getVideoScript(req: Request, res: Response) {
  try {
    const { exerciseId } = req.params;
    const script = generateVideoScript(exerciseId);
    res.json({ success: true, script });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
}
