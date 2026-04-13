/**
 * THE PANTHER SYSTEM — FUEL Pillar API Routes
 * Build Doc: Doc 06 | Clinical Spec: Doc 05
 * © 2026 TURNED UP FITNESS LLC — CONFIDENTIAL
 *
 * Routes:
 *   GET  /api/fuel/profile/:user_id          — get stored fuel profile + targets
 *   POST /api/fuel/profile                   — save/update fuel profile (recalculates targets)
 *   GET  /api/fuel/log/:user_id/:date        — get daily fuel log (YYYY-MM-DD)
 *   POST /api/fuel/log/meal                  — add meal to today's log
 *   POST /api/fuel/log/evaluate              — run flag evaluation + generate Claude directive
 *   GET  /api/fuel/log/recent/:user_id       — get last 7 days of logs
 */

import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import {
  upsertFuelProfile,
  getFuelProfile,
  upsertDailyFuelLog,
  getDailyFuelLog,
  getRecentFuelLogs,
  StoredFuelProfile,
  StoredDailyFuelLog,
  StoredMealEntry,
} from "../db.js";
import {
  UserFuelProfile,
  calculateRMR,
  calculateTDEE,
  calculateDailyTargets,
  evaluateDailyLog,
  buildFuelDirectivePrompt,
  computeMealTotals,
  DailyFuelLog,
} from "../fuelCalculations.js";

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Helper: today's date string ─────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Helper: build empty daily log ───────────────────────────────────────────

function emptyLog(user_id: string, date: string): StoredDailyFuelLog {
  return {
    log_id: randomUUID(),
    user_id,
    date,
    meals: [],
    totalCalories: 0,
    totalProteinG: 0,
    totalCarbsG: 0,
    totalFatG: 0,
    mpsTriggersCount: 0,
    trainingLogged: false,
    flags: [],
    updated_at: Date.now(),
  };
}

// ─── Helper: recompute log totals from meals ─────────────────────────────────

function recomputeLogTotals(log: StoredDailyFuelLog): StoredDailyFuelLog {
  const totals = log.meals.reduce(
    (acc, m) => ({
      totalCalories: acc.totalCalories + m.totalCalories,
      totalProteinG: acc.totalProteinG + m.totalProteinG,
      totalCarbsG: acc.totalCarbsG + m.totalCarbsG,
      totalFatG: acc.totalFatG + m.totalFatG,
      mpsTriggersCount: acc.mpsTriggersCount + (m.mpsTriggered ? 1 : 0),
    }),
    { totalCalories: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0, mpsTriggersCount: 0 }
  );
  return { ...log, ...totals };
}

// ─── GET /api/fuel/profile/:user_id ──────────────────────────────────────────

router.get("/profile/:user_id", async (req: Request, res: Response) => {
  try {
    const profile = await getFuelProfile(req.params.user_id);
    if (!profile) return res.status(404).json({ error: "No FUEL profile found" });
    res.json(profile);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── POST /api/fuel/profile ───────────────────────────────────────────────────
// Body: UserFuelProfile fields + user_id

router.post("/profile", async (req: Request, res: Response) => {
  try {
    const body = req.body as UserFuelProfile & { user_id: string };
    if (!body.user_id) return res.status(400).json({ error: "user_id required" });

    const profile: UserFuelProfile = {
      weightKg: body.weightKg,
      heightCm: body.heightCm,
      age: body.age,
      sex: body.sex,
      activityLevel: body.activityLevel,
      primaryGoal: body.primaryGoal,
      deficitTier: body.deficitTier,
      isPostMenopausal: body.isPostMenopausal,
      conditions: body.conditions ?? [],
    };

    const rmr = calculateRMR(profile);
    const tdee = calculateTDEE(rmr, profile);
    const targets = calculateDailyTargets(tdee, profile);

    const stored: StoredFuelProfile = {
      user_id: body.user_id,
      ...profile,
      ...targets,
      updated_at: Date.now(),
    };

    const saved = await upsertFuelProfile(stored);
    res.json(saved);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── GET /api/fuel/log/:user_id/:date ────────────────────────────────────────

router.get("/log/:user_id/:date", async (req: Request, res: Response) => {
  try {
    const { user_id, date } = req.params;
    const log = await getDailyFuelLog(user_id, date) ?? emptyLog(user_id, date);
    res.json(log);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── GET /api/fuel/log/recent/:user_id ───────────────────────────────────────

router.get("/log/recent/:user_id", async (req: Request, res: Response) => {
  try {
    const logs = await getRecentFuelLogs(req.params.user_id, 7);
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── POST /api/fuel/log/meal ──────────────────────────────────────────────────
// Body: { user_id, date?, meal: StoredMealEntry }

router.post("/log/meal", async (req: Request, res: Response) => {
  try {
    const { user_id, date, meal } = req.body as {
      user_id: string;
      date?: string;
      meal: StoredMealEntry;
    };
    if (!user_id || !meal) return res.status(400).json({ error: "user_id and meal required" });

    const logDate = date ?? todayStr();
    let log = await getDailyFuelLog(user_id, logDate) ?? emptyLog(user_id, logDate);

    // Compute meal totals from foods if not already provided
    if (meal.foods?.length > 0 && !meal.totalCalories) {
      const computed = computeMealTotals(meal.foods);
      meal.totalCalories = computed.totalCalories;
      meal.totalProteinG = computed.totalProteinG;
      meal.totalCarbsG = computed.totalCarbsG;
      meal.totalFatG = computed.totalFatG;
      meal.mpsTriggered = computed.mpsTriggered;
    }

    meal.timeLogged = meal.timeLogged ?? new Date().toISOString();
    log.meals.push(meal);
    log = recomputeLogTotals(log);

    const saved = await upsertDailyFuelLog(log);
    res.json(saved);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── POST /api/fuel/log/evaluate ─────────────────────────────────────────────
// Runs flag evaluation + generates Claude FUEL directive
// Body: { user_id, date? }

router.post("/log/evaluate", async (req: Request, res: Response) => {
  try {
    const { user_id, date } = req.body as { user_id: string; date?: string };
    if (!user_id) return res.status(400).json({ error: "user_id required" });

    const logDate = date ?? todayStr();
    const storedProfile = await getFuelProfile(user_id);
    if (!storedProfile) {
      return res.status(404).json({ error: "No FUEL profile found. Complete FUEL setup first." });
    }

    let log = await getDailyFuelLog(user_id, logDate) ?? emptyLog(user_id, logDate);

    // Build profile object for calculations
    const profile: UserFuelProfile = {
      weightKg: storedProfile.weightKg,
      heightCm: storedProfile.heightCm,
      age: storedProfile.age,
      sex: storedProfile.sex as "male" | "female",
      activityLevel: storedProfile.activityLevel as any,
      primaryGoal: storedProfile.primaryGoal as any,
      deficitTier: storedProfile.deficitTier as any,
      isPostMenopausal: storedProfile.isPostMenopausal,
      conditions: storedProfile.conditions as any,
    };

    const targets = {
      calorieTarget: storedProfile.calorieTarget,
      proteinTargetG: storedProfile.proteinTargetG,
      carbTargetG: storedProfile.carbTargetG,
      fatTargetG: storedProfile.fatTargetG,
      rmr: storedProfile.rmr,
      tdee: storedProfile.tdee,
    };

    // Cast log to DailyFuelLog for evaluation
    const evalLog: DailyFuelLog = {
      ...log,
      meals: log.meals as any,
      flags: log.flags as any,
    };

    const flags = evaluateDailyLog(evalLog, targets, profile);
    log.flags = flags.map((f) => f.code);

    // Generate Claude directive for the top-priority flag
    let directive = "";
    if (flags.length > 0) {
      const topFlag = flags[0];
      const systemPrompt = buildFuelDirectivePrompt(profile, topFlag);

      try {
        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5",
          max_tokens: 200,
          messages: [
            {
              role: "user",
              content: `Generate FUEL directive for today's top flag: ${topFlag.code}`,
            },
          ],
          system: systemPrompt,
        });
        directive =
          response.content[0].type === "text" ? response.content[0].text : "";
      } catch (aiErr) {
        // Fallback to flag message if Claude fails
        directive = `HEADLINE: ${topFlag.code.replace(/_/g, " ")}\nBODY: ${topFlag.message}\nDIRECTIVE: Address this before your next meal.`;
      }
    }

    log.pantherDirective = directive;
    const saved = await upsertDailyFuelLog(log);

    res.json({
      log: saved,
      flags,
      directive,
      topFlag: flags[0] ?? null,
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
