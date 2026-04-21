/**
 * TUF PvP Challenge Routes
 * Mounts at: /api/challenges
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */
import { Router, Request, Response } from "express";
import {
  issueChallenge,
  respondToChallenge,
  submitScore,
  getMyChallenges,
  getChallengeWins,
} from "../services/challengeService.js";
import { getMPSLeaderboard, awardMPS, calcSessionMetrics } from "../services/mpsService.js";

const router = Router();

// ── Issue a challenge ──────────────────────────────────────────────────────────
// POST /api/challenges/issue
router.post("/issue", async (req: Request, res: Response) => {
  try {
    const challenge = await issueChallenge(req.body);
    res.json({ success: true, challenge });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

// ── Respond to a challenge (accept/decline) ────────────────────────────────────
// POST /api/challenges/:id/respond
router.post("/:id/respond", async (req: Request, res: Response) => {
  try {
    const { user_id, accept } = req.body;
    const challenge = await respondToChallenge(req.params.id, user_id, accept);
    res.json({ success: true, challenge });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

// ── Submit a score ─────────────────────────────────────────────────────────────
// POST /api/challenges/:id/score
router.post("/:id/score", async (req: Request, res: Response) => {
  try {
    const { user_id, score } = req.body;
    const challenge = await submitScore(req.params.id, user_id, score);
    res.json({ success: true, challenge });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

// ── Get my challenges ──────────────────────────────────────────────────────────
// GET /api/challenges/mine?user_id=xxx&status=active
router.get("/mine", async (req: Request, res: Response) => {
  try {
    const { user_id, status } = req.query as { user_id: string; status?: string };
    if (!user_id) return res.status(400).json({ error: "user_id required" });
    const challenges = await getMyChallenges(user_id, status as never);
    res.json({ success: true, challenges });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// ── PvP Win Leaderboard ────────────────────────────────────────────────────────
// GET /api/challenges/leaderboard/wins
router.get("/leaderboard/wins", async (_req: Request, res: Response) => {
  try {
    const leaderboard = await getChallengeWins(25);
    res.json({ success: true, leaderboard });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// ── MPS Leaderboard ────────────────────────────────────────────────────────────
// GET /api/challenges/leaderboard/mps
router.get("/leaderboard/mps", async (_req: Request, res: Response) => {
  try {
    const leaderboard = await getMPSLeaderboard(25);
    res.json({ success: true, leaderboard });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// ── Award MPS after session ────────────────────────────────────────────────────
// POST /api/challenges/mps/award
router.post("/mps/award", async (req: Request, res: Response) => {
  try {
    const { user_id, session_id, sets } = req.body;
    const metrics = calcSessionMetrics(sets);
    if (!metrics) return res.status(400).json({ error: "No valid sets provided" });
    const entry = await awardMPS(user_id, session_id, metrics);
    res.json({ success: true, entry, metrics });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// ── Enhanced form drop analysis ────────────────────────────────────────────────
// POST /api/challenges/analyse/form-drop
router.post("/analyse/form-drop", async (req: Request, res: Response) => {
  try {
    const { detectFormDropEnhanced } = await import("../services/mpsService.js");
    const { repScores, clientProfile } = req.body;
    const result = detectFormDropEnhanced(repScores, clientProfile);
    res.json({ success: true, result });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

export default router;
