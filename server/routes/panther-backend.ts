/**
 * Panther Backend — Route Registration
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 *
 * Mounts at: /api/panther
 */
import { Router } from "express";
import { getGeneratedWorkout, getVideoScript } from "../controllers/workoutController";
import { generateVideo, getScript } from "../controllers/videoController";
import { rateLimit } from "../middleware/rateLimit";
import { generateSmartWorkout, updateFatigue } from "../services/smartWorkoutEngine";
import { addSession, getUser, upsertUser } from "../db";

const router = Router();

// ── Workout routes ─────────────────────────────────────────────────────────────
// POST /api/panther/workout/generate  — legacy basic generator
router.post("/workout/generate", rateLimit(30), getGeneratedWorkout);

// GET  /api/panther/workout/generate  — legacy, via query params
router.get("/workout/generate", rateLimit(30), getGeneratedWorkout);

// POST /api/panther/workout/smart  — smart adaptive generator v2
// Body: { userId, level, goal, muscles, duration, equipment?, age? }
router.post("/workout/smart", rateLimit(30), async (req, res) => {
  try {
    const { userId, level, goal, muscles, duration, equipment, age } = req.body;
    if (!userId || !level || !goal || !muscles || !duration) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userId, level, goal, muscles, duration",
      });
    }
    const workout = await generateSmartWorkout({
      userId,
      level,
      goal,
      muscles,
      duration,
      equipment: equipment ?? [],
      age,
    });
    res.json({ success: true, workout });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/panther/workout/complete  — save completed workout + update fatigue
// Body: { userId, exerciseIds, exerciseObjects, durationMinutes, feedbackRating?, notes? }
router.post("/workout/complete", async (req, res) => {
  try {
    const { userId, exerciseIds, exerciseObjects, durationMinutes, feedbackRating, notes } = req.body;
    if (!userId || !exerciseIds) {
      return res.status(400).json({ success: false, error: "userId and exerciseIds required" });
    }

    // Save session to history
    const session = await addSession({
      user_id: userId,
      session_label: `Smart Workout — ${new Date().toLocaleDateString()}`,
      exercises_completed: exerciseIds,
      duration_minutes: durationMinutes,
      feedback_rating: feedbackRating,
      notes,
      date: Date.now(),
    });

    // Update fatigue on user record
    if (exerciseObjects?.length) {
      const user = await getUser(userId) as any;
      const currentFatigue = user?.fatigue ?? {};
      const updatedFatigue = updateFatigue(currentFatigue, exerciseObjects);
      await upsertUser({
        ...(user ?? {
          user_id: userId,
          name: "",
          fitness_level: "beginner",
          goals: [],
          injuries: [],
          equipment: [],
          created_at: Date.now(),
          updated_at: Date.now(),
        }),
        fatigue: updatedFatigue,
        updated_at: Date.now(),
      });
    }

    res.json({ success: true, session_id: session.session_id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Video routes ───────────────────────────────────────────────────────────────
// GET  /api/panther/video/script/:exerciseId  — 4-scene video script
router.get("/video/script/:exerciseId", getVideoScript);

// POST /api/panther/video/generate  — trigger AI video generation
router.post("/video/generate", rateLimit(10), generateVideo);

// GET  /api/panther/video/script-v2/:exerciseId  — extended script via video controller
router.get("/video/script-v2/:exerciseId", getScript);

export default router;
