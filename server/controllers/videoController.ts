/**
 * Panther Brain — Video Controller
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */

import { Request, Response } from "express";
import { generateExerciseVideo, generateVideoScript } from "../services/videoGenerator";

export async function generateVideo(req: Request, res: Response) {
  try {
    const { exercise_id, exercise_name, video_prompt } = req.body;
    if (!exercise_id || !exercise_name) {
      return res.status(400).json({ success: false, error: "exercise_id and exercise_name required" });
    }
    const result = await generateExerciseVideo({ id: exercise_id, name: exercise_name, video_prompt });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getScript(req: Request, res: Response) {
  try {
    const script = generateVideoScript(req.params.exerciseId);
    res.json({ success: true, script });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
}
