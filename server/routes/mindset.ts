/**
 * THE PANTHER SYSTEM — MINDSET API Routes
 * Doc 08 — MINDSET Pillar Build Doc
 * © 2026 TURNED UP FITNESS LLC — CONFIDENTIAL
 *
 * Routes:
 *   GET  /api/mindset/challenge/:userId          → get current challenge state
 *   POST /api/mindset/challenge/start            → start a new challenge
 *   POST /api/mindset/challenge/checkin          → process daily check-in
 *   GET  /api/mindset/challenge/:userId/status   → missed day evaluation
 *   POST /api/mindset/challenge/reset            → reset challenge (admin/testing)
 */

import { Router } from "express";
import {
  getMindsetChallenge,
  upsertMindsetChallenge,
} from "../db.js";
import {
  processCheckIn,
  evaluateMissedCheckIn,
  createNewChallenge,
  generatePantherDirective,
} from "../mindsetEngine.js";
import { getCurrentPhase, PHASE_CONFIGS } from "../mindsetConfig.js";

const router = Router();

// ─── GET challenge state ──────────────────────────────────────────────────────

router.get("/challenge/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const challenge = await getMindsetChallenge(userId);
    if (!challenge) {
      return res.status(404).json({ error: "No active challenge found." });
    }
    const phaseCfg = getCurrentPhase(challenge.currentDay);
    res.json({ challenge, phaseCfg });
  } catch (err) {
    console.error("[Mindset] GET challenge error:", err);
    res.status(500).json({ error: "Failed to load challenge." });
  }
});

// ─── Start new challenge ──────────────────────────────────────────────────────

router.post("/challenge/start", async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id required." });

    // Check if already active
    const existing = await getMindsetChallenge(user_id);
    if (existing && existing.isActive && !existing.isCompleted) {
      return res.status(409).json({
        error: "Challenge already active.",
        challenge: existing,
        phaseCfg: getCurrentPhase(existing.currentDay),
      });
    }

    const newChallenge = createNewChallenge(user_id);
    const saved = await upsertMindsetChallenge(newChallenge);
    const phaseCfg = PHASE_CONFIGS[0]; // Phase 1

    res.json({ challenge: saved, phaseCfg, started: true });
  } catch (err) {
    console.error("[Mindset] Start challenge error:", err);
    res.status(500).json({ error: "Failed to start challenge." });
  }
});

// ─── Daily check-in ───────────────────────────────────────────────────────────

router.post("/challenge/checkin", async (req, res) => {
  try {
    const {
      user_id,
      intentionalDecision,
      journalEntry,
      moveAnchorComplete = false,
      fuelAnchorComplete = false,
    } = req.body;

    if (!user_id) return res.status(400).json({ error: "user_id required." });

    const challenge = await getMindsetChallenge(user_id);
    if (!challenge) {
      return res.status(404).json({ error: "No active challenge. Start one first." });
    }
    if (challenge.isCompleted) {
      return res.status(400).json({ error: "Challenge already completed." });
    }

    const result = await processCheckIn(challenge, {
      intentionalDecision,
      journalEntry,
      moveAnchorComplete,
      fuelAnchorComplete,
    });

    await upsertMindsetChallenge(result.challenge);

    res.json(result);
  } catch (err: any) {
    if (err?.message === "Already checked in today.") {
      return res.status(409).json({ error: err.message });
    }
    console.error("[Mindset] Check-in error:", err);
    res.status(500).json({ error: "Check-in failed." });
  }
});

// ─── Missed day status ────────────────────────────────────────────────────────

router.get("/challenge/:userId/status", async (req, res) => {
  try {
    const { userId } = req.params;
    const challenge = await getMindsetChallenge(userId);
    if (!challenge) {
      return res.status(404).json({ error: "No challenge found." });
    }

    const today = new Date().toISOString().split("T")[0];
    const checkedInToday = challenge.lastCheckInDate === today;

    if (checkedInToday) {
      return res.json({ status: "checked_in", challenge });
    }

    const action = evaluateMissedCheckIn(challenge);
    res.json({ status: "missed", action, challenge });
  } catch (err) {
    console.error("[Mindset] Status error:", err);
    res.status(500).json({ error: "Failed to check status." });
  }
});

// ─── Get today's directive (standalone) ──────────────────────────────────────

router.post("/directive", async (req, res) => {
  try {
    const { day, phase, intentionalDecision } = req.body;
    if (!day || !phase) return res.status(400).json({ error: "day and phase required." });

    const directive = await generatePantherDirective(day, phase, intentionalDecision);
    res.json({ directive });
  } catch (err) {
    console.error("[Mindset] Directive error:", err);
    res.status(500).json({ error: "Failed to generate directive." });
  }
});

// ─── Reset challenge (dev/testing) ───────────────────────────────────────────

router.post("/challenge/reset", async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id required." });

    const newChallenge = createNewChallenge(user_id);
    const saved = await upsertMindsetChallenge(newChallenge);
    res.json({ challenge: saved, reset: true });
  } catch (err) {
    console.error("[Mindset] Reset error:", err);
    res.status(500).json({ error: "Failed to reset challenge." });
  }
});

// ─── Get all phase configs ────────────────────────────────────────────────────

router.get("/phases", (_req, res) => {
  res.json({ phases: PHASE_CONFIGS });
});

export default router;
