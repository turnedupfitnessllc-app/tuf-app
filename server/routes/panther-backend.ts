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

const router = Router();

// ── Workout routes ─────────────────────────────────────────────────────────────
// POST /api/panther/workout/generate  — generate workout from user profile
router.post("/workout/generate", rateLimit(30), getGeneratedWorkout);

// GET  /api/panther/workout/generate  — same, via query params
router.get("/workout/generate", rateLimit(30), getGeneratedWorkout);

// ── Video routes ───────────────────────────────────────────────────────────────
// GET  /api/panther/video/script/:exerciseId  — 4-scene video script
router.get("/video/script/:exerciseId", getVideoScript);

// POST /api/panther/video/generate  — trigger AI video generation
router.post("/video/generate", rateLimit(10), generateVideo);

// GET  /api/panther/video/script-v2/:exerciseId  — extended script via video controller
router.get("/video/script-v2/:exerciseId", getScript);

export default router;
