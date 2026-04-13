import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { PROGRAM_DAYS, PROGRAM_META } from "../programData";
import { getUser, upsertUser } from "../db";

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// GET /api/program/days — return all program days (summary)
router.get("/days", (_req, res) => {
  const summary = PROGRAM_DAYS.map((d) => ({
    day: d.day,
    phase: d.phase,
    focus: d.focus,
    duration_min: d.duration_min,
    exercise_count: d.exercises.length,
    message: d.message,
    content_hook: d.content_hook,
  }));
  res.json({ ok: true, meta: PROGRAM_META, days: summary });
});

// GET /api/program/day/:day — return full day data
router.get("/day/:day", (req, res) => {
  const dayNum = parseInt(req.params.day, 10);
  const day = PROGRAM_DAYS.find((d) => d.day === dayNum);
  if (!day) return res.status(404).json({ ok: false, error: "Day not found" });
  res.json({ ok: true, day });
});

// POST /api/program/coach — get Claude coaching for a specific day/exercise
router.post("/coach", async (req, res) => {
  const { userId, dayNum, exerciseName, question } = req.body;
  if (!dayNum) return res.status(400).json({ ok: false, error: "dayNum required" });

  const day = PROGRAM_DAYS.find((d) => d.day === dayNum);
  if (!day) return res.status(404).json({ ok: false, error: "Day not found" });

  const exercise = exerciseName
    ? day.exercises.find((e) => e.name === exerciseName)
    : null;

  // getUser is async — await it; cast to any to access extended fields
  const userContext = userId ? (await getUser(userId) as any) : null;

  const systemPrompt = `You are THE PANTHER — a precision-trained AI performance coach built by Turned Up Fitness. You speak in short, direct, powerful sentences. No fluff. No filler. Every word earns its place.

VOICE LAWS:
- LAW 1: SHORT SENTENCES. Maximum 12 words per sentence. Break it if you must. Never ramble.
- LAW 2: ACTIVE VOICE ONLY. "You will build strength." Never "Strength will be built."
- LAW 3: COMMAND LANGUAGE. Use imperatives. "Drive through your heels." "Brace your core." "Own this rep."
- LAW 4: NO SOFTENING. Never say "try to" or "you might want to." Say "do it" or "don't."
- LAW 5: EARNED ENCOURAGEMENT ONLY. No empty praise. If they did the work, acknowledge it. If they didn't, call it.

CONTEXT:
- Program: Panther 30-Day Training System
- Day: ${day.day} / Phase: ${day.phase} / Focus: ${day.focus}
- Duration: ${day.duration_min} minutes
- Today's message: "${day.message}"
${exercise ? `- Current exercise: ${exercise.name}${exercise.sets ? ` — ${exercise.sets} sets` : ""}${exercise.reps ? ` x ${exercise.reps} reps` : ""}${exercise.duration_sec ? ` x ${exercise.duration_sec}s` : ""}${exercise.cue ? ` — Cue: "${exercise.cue}"` : ""}` : ""}
${userContext ? `- Athlete: ${userContext.name || "Athlete"} — Stage: ${userContext.stage || "CUB"} — Sessions: ${userContext.totalSessions || 0}` : ""}`;

  const userMessage = question || `Give me coaching for ${exercise ? exercise.name : `Day ${dayNum}`}. What do I need to know?`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    res.json({ ok: true, coaching: text });
  } catch (err: any) {
    console.error("[Program Coach] Error:", err.message);
    res.status(500).json({ ok: false, error: "Coach unavailable" });
  }
});

// POST /api/program/complete — mark a session as complete, award XP
router.post("/complete", async (req, res) => {
  const { userId, dayNum } = req.body;
  if (!userId || !dayNum) return res.status(400).json({ ok: false, error: "userId and dayNum required" });

  const day = PROGRAM_DAYS.find((d) => d.day === dayNum);
  if (!day) return res.status(404).json({ ok: false, error: "Day not found" });

  const user = await getUser(userId) as any;
  if (!user) return res.status(404).json({ ok: false, error: "User not found" });

  // XP per session type
  const xpMap: Record<string, number> = {
    Control: 50,
    Stability: 75,
    Strength: 100,
    Explosion: 125,
    Evolution: 200,
  };
  const xpEarned = xpMap[day.phase] || 50;

  const completedSessions: number[] = user.completedSessions || [];
  if (!completedSessions.includes(dayNum)) {
    completedSessions.push(dayNum);
  }

  const newXP = (user.xp || 0) + xpEarned;
  const newSessions = (user.totalSessions || 0) + 1;

  // Stage progression thresholds
  const stages = ["CUB", "STEALTH", "CONTROLLED", "DOMINANT", "APEX PREDATOR"];
  const stageThresholds = [0, 500, 1500, 3000, 6000];
  let newStage: string = user.stage || "CUB";
  for (let i = stageThresholds.length - 1; i >= 0; i--) {
    if (newXP >= stageThresholds[i]) {
      newStage = stages[i];
      break;
    }
  }

  // upsertUser only accepts known User fields — store extended data in goals array as JSON
  // For now, just update what we can; extended stats live in the JSON DB via the panther memory system
  await upsertUser({
    user_id: userId,
    name: user.name,
    fitness_level: user.fitness_level || "beginner",
    goals: user.goals || [],
    injuries: user.injuries || [],
    equipment: user.equipment || [],
  });

  res.json({
    ok: true,
    xpEarned,
    totalXP: newXP,
    stage: newStage,
    completedSessions,
    stageChanged: newStage !== user.stage,
  });
});

export default router;
