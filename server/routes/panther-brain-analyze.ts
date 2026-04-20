/**
 * Panther Brain Post-Workout Analysis
 * POST /api/panther-brain/analyze
 * Accepts workout performance data, returns AI feedback + adaptation directive
 */
import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ANALYSIS_PROMPT = `You are PANTHER BRAIN — the post-workout AI analysis engine of Turned Up Fitness.
You receive an athlete's session performance data and return a precise clinical analysis.

ALWAYS respond in this exact JSON format:
{
  "headline": "ALL CAPS, 4-8 words, the core truth about this session",
  "feedback": "2-3 sentences of clinical analysis about their performance",
  "directive": "One specific actionable instruction for next session, starting with a verb",
  "adaptation": {
    "reps_modifier": -1 | 0 | 1,
    "tempo": "NORMAL" | "SLOW" | "EXPLOSIVE",
    "focus": "FORM" | "STRENGTH" | "MOBILITY" | "ENDURANCE",
    "note": "One sentence explaining the adaptation"
  },
  "xp_award": 10-50,
  "panther_mode": "STEALTH" | "PRECISION" | "ATTACK"
}

ADAPTATION RULES:
- form_score < 5: reps_modifier = -1, tempo = SLOW, focus = FORM
- form_score 5-7: reps_modifier = 0, tempo = NORMAL, focus = FORM or STRENGTH
- form_score >= 8: reps_modifier = 1, tempo = EXPLOSIVE or NORMAL, focus = STRENGTH
- streak >= 14: panther_mode = ATTACK
- streak >= 7: panther_mode = PRECISION
- streak < 7: panther_mode = STEALTH
- mobility_score < 6: always include mobility work in directive
- strength_score < 6: focus on activation before loading

TONE: Clinical, direct, no fluff. Like a world-class coach reviewing film.`;

router.post("/analyze", async (req, res) => {
  try {
    const { streak = 0, workouts_completed = 0, mobility_score = 7, strength_score = 6, form_score = 7, workout_name = "Session" } = req.body;

    const userMessage = `SESSION DATA:
Workout: ${workout_name}
Form Score: ${form_score}/10
Streak: ${streak} days
Total Workouts: ${workouts_completed}
Mobility Score: ${mobility_score}/10
Strength Score: ${strength_score}/10

Analyze this session and provide adaptation for next workout.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 600,
      system: ANALYSIS_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    let analysis;
    try {
      // Extract JSON from response (Claude sometimes wraps in markdown)
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content.text);
    } catch {
      // Fallback if JSON parse fails
      analysis = {
        headline: "SESSION LOGGED",
        feedback: "Your session has been recorded. Keep showing up — consistency is the foundation.",
        directive: "Complete your next scheduled session with full focus on form.",
        adaptation: { reps_modifier: 0, tempo: "NORMAL", focus: "FORM", note: "Maintain current intensity." },
        xp_award: 15,
        panther_mode: streak >= 7 ? "PRECISION" : "STEALTH",
      };
    }

    // Update scores based on session (gradual improvement model)
    const newMobilityScore = Math.min(10, Math.max(1, Math.round(
      mobility_score * 0.9 + (form_score >= 7 ? 0.5 : 0)
    )));
    const newStrengthScore = Math.min(10, Math.max(1, Math.round(
      strength_score * 0.9 + (form_score >= 6 ? 0.5 : 0)
    )));

    res.json({
      success: true,
      analysis,
      updated_scores: {
        mobility_score: newMobilityScore,
        strength_score: newStrengthScore,
      },
    });
  } catch (err) {
    console.error("[PantherBrainAnalyze]", err);
    res.status(500).json({
      success: false,
      analysis: {
        headline: "SESSION COMPLETE",
        feedback: "You showed up. That's the foundation. The Panther System is tracking your progress.",
        directive: "Rest 24-48 hours, then return for your next session.",
        adaptation: { reps_modifier: 0, tempo: "NORMAL", focus: "FORM", note: "Maintain current intensity." },
        xp_award: 10,
        panther_mode: "STEALTH",
      },
    });
  }
});

export default router;
