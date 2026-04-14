/**
 * Referral System — Panther App
 *
 * GET  /api/referral/:userId/code        — get or create ref code for user
 * POST /api/referral/track               — record a join visit (body: { ref_code })
 * POST /api/referral/convert             — mark referral converted + award XP (body: { ref_code, new_user_id })
 * GET  /api/referral/:userId/stats       — referral stats for user
 *
 * Referral link format: https://pantherapp.com/join?ref=<code>
 * (In dev: current origin + /join?ref=<code>)
 *
 * XP rewards:
 *   Referrer: +100 XP on successful conversion (new user completes onboarding)
 *   New user:  +25 XP bonus for joining via referral
 */

import { Router } from "express";
import { randomBytes } from "crypto";
import {
  getReferralCode,
  createReferralCode,
  trackReferralVisit,
  convertReferral,
  getReferralStats,
  upsertUserProgramState,
  getUserProgramState,
} from "../db.js";

const router = Router();

// ── GET /api/referral/:userId/code ────────────────────────────────────────────
// Returns existing code or creates one. Code is derived from userId prefix + random suffix.
router.get("/:userId/code", async (req, res) => {
  try {
    const { userId } = req.params;
    let code = await getReferralCode(userId);
    if (!code) {
      // Generate a human-readable code: first 4 chars of userId + 4 random hex chars
      const suffix = randomBytes(2).toString("hex");
      const prefix = userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toLowerCase();
      const rawCode = `${prefix}${suffix}`;
      code = await createReferralCode(userId, rawCode);
    }
    return res.json({ success: true, ref_code: code.ref_code, user_id: userId });
  } catch (err) {
    console.error("[Referral] GET code error:", err);
    return res.status(500).json({ success: false, error: "Failed to get referral code" });
  }
});

// ── POST /api/referral/track ──────────────────────────────────────────────────
// Called when someone visits /join?ref=CODE — increments visit count.
router.post("/track", async (req, res) => {
  try {
    const { ref_code } = req.body as { ref_code?: string };
    if (!ref_code) return res.status(400).json({ success: false, error: "ref_code required" });
    await trackReferralVisit(ref_code);
    return res.json({ success: true });
  } catch (err) {
    console.error("[Referral] POST track error:", err);
    return res.status(500).json({ success: false, error: "Failed to track referral" });
  }
});

// ── POST /api/referral/convert ────────────────────────────────────────────────
// Called after new user completes onboarding. Awards XP to both parties.
router.post("/convert", async (req, res) => {
  try {
    const { ref_code, new_user_id } = req.body as { ref_code?: string; new_user_id?: string };
    if (!ref_code || !new_user_id) {
      return res.status(400).json({ success: false, error: "ref_code and new_user_id required" });
    }

    const result = await convertReferral(ref_code, new_user_id);
    if (!result) {
      return res.status(404).json({ success: false, error: "Referral code not found" });
    }

    // Award +100 XP to referrer
    const referrerState = await getUserProgramState(result.referrer_id);
    if (referrerState) {
      await upsertUserProgramState(result.referrer_id, {
        xp: (referrerState.xp ?? 0) + 100,
      });
    }

    // Award +25 XP bonus to new user
    const newUserState = await getUserProgramState(new_user_id);
    await upsertUserProgramState(new_user_id, {
      xp: (newUserState?.xp ?? 0) + 25,
    });

    console.log(`[Referral] Converted: ${ref_code} → new user ${new_user_id} | Referrer ${result.referrer_id} +100 XP | New user +25 XP`);

    return res.json({
      success: true,
      referrer_id: result.referrer_id,
      referrer_xp_awarded: 100,
      new_user_xp_awarded: 25,
    });
  } catch (err) {
    console.error("[Referral] POST convert error:", err);
    return res.status(500).json({ success: false, error: "Failed to convert referral" });
  }
});

// ── GET /api/referral/:userId/stats ───────────────────────────────────────────
router.get("/:userId/stats", async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await getReferralStats(userId);
    return res.json({ success: true, stats });
  } catch (err) {
    console.error("[Referral] GET stats error:", err);
    return res.status(500).json({ success: false, error: "Failed to get referral stats" });
  }
});

export default router;
