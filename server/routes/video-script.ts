/**
 * VIDEO SCRIPT ENGINE — /api/video-script
 * Generates 4-scene Panther video scripts from exercise IDs
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */
import { Router } from "express";
import { generateVideoScript, EXERCISE_DATABASE, generateWorkout } from "../../shared/panther-library.js";
import type { Goal, DifficultyLevel, EquipmentType } from "../../shared/panther-library.js";

const router = Router();

// GET /api/video-script/:exerciseId — generate script for a single exercise
router.get("/:exerciseId", (req, res) => {
  const { exerciseId } = req.params;
  const script = generateVideoScript(exerciseId);
  if (!script) {
    return res.status(404).json({ error: `Exercise '${exerciseId}' not found in Panther Brain Library.` });
  }
  res.json({ success: true, script });
});

// GET /api/video-script — list all exercise IDs and names
router.get("/", (_req, res) => {
  const list = EXERCISE_DATABASE.map(ex => ({
    id: ex.id,
    name: ex.name,
    pattern: ex.pattern,
    difficulty: ex.difficulty,
  }));
  res.json({ success: true, count: list.length, exercises: list });
});

// POST /api/video-script/generate-workout — generate a workout and return scripts
router.post("/generate-workout", (req, res) => {
  const { goal = "fat_loss", difficulty = "intermediate", equipment = ["bodyweight"], exerciseCount = 5 } = req.body as {
    goal?: Goal;
    difficulty?: DifficultyLevel;
    equipment?: EquipmentType[];
    exerciseCount?: number;
  };

  const exercises = generateWorkout({ goal, difficulty, equipment, exerciseCount });
  const scripts = exercises.map(ex => generateVideoScript(ex.id)).filter(Boolean);

  res.json({
    success: true,
    workout: {
      goal,
      difficulty,
      exercise_count: exercises.length,
      exercises: exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        pattern: ex.pattern,
        volume: ex.volume,
        panther_cue: ex.panther_mode.cue,
      })),
    },
    scripts,
  });
});

export default router;
