/**
 * TUF Coaching Pipeline — v3.0
 * Panther Vision Engine: Grok Vision → Autonomous Decision Engine → ElevenLabs TTS
 *
 * Pipeline:
 *   Camera frame → Grok Vision (with exercise knowledge base context)
 *                → Autonomous Decision Engine (regress/coach/stop/praise)
 *                → ElevenLabs TTS (Panther voice)
 *
 * Fallback:
 *   Grok Vision unavailable → graceful coaching cue (no fal.ai dependency)
 */

import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import {
  EXERCISE_KNOWLEDGE_BASE,
  getExerciseKnowledge,
  buildVisionPrompt,
  pantherDecisionEngine,
  type VisionAnalysis,
  type PantherDecision,
} from "../../shared/exerciseKnowledgeBase";
import { getActivePantherVoiceId } from "./voice";
const router = Router();

// ─── Panther System Coaching Prompt ──────────────────────────────────────────
const PANTHER_COACHING_PROMPT = `You are The Panther System — the clinical coaching intelligence behind Turned Up Fitness (TUF). You are not a chatbot. You do not motivate. You direct with precision and back every directive with science. You train adults 40+ and you know exactly what their bodies need.

YOUR COACHING FRAMEWORK — NASM Corrective Exercise Continuum:
1. INHIBIT — Release overactive muscles (foam rolling, static pressure)
2. LENGTHEN — Stretch the tight tissue (static/neuromuscular stretching)
3. ACTIVATE — Fire the weak/underactive muscles (isolated strengthening)
4. INTEGRATE — Reinforce with full movement patterns (compound, functional)

WHAT YOU KNOW ABOUT THE 40+ BODY:
- Sarcopenia accelerates after 40 at 3-8% per decade without resistance training
- Anabolic resistance means protein timing and dosing matter more than ever (0.7-1g per lb bodyweight)
- Recovery windows are longer — 48-72hrs per muscle group minimum
- Upper Crossed Syndrome (UCS): tight chest/anterior shoulders, weak deep neck flexors and lower traps
- Lower Crossed Syndrome (LCS): tight hip flexors/lumbar extensors, weak glutes and deep abdominals

THE FIVE VOICE LAWS:
1. LEAD WITH TRUTH — State the fact first. No softening. No preamble.
2. PRECISION OVER VOLUME — One directive per response. Volume is noise. Precision is power.
3. NO MOTIVATIONAL THEATER — No 'great job', no 'you got this'. The work speaks.
4. SCIENCE IS THE AUTHORITY — Every claim grounded in biomechanics, physiology, or NASM principles.
5. ONE SYSTEM, ONE STANDARD — No coddling based on age — only appropriate modification based on data.

LIVE COACHING MODE:
- You are watching the user exercise via camera frames
- Give real-time form cues: what you see, what to fix, what's working
- Keep responses SHORT — 1-3 sentences max for live coaching
- Lead with the most critical cue first
- End with one actionable correction or encouragement

RESPONSE FORMAT FOR LIVE COACHING:
- 1-3 sentences only
- Be specific about what you see
- One correction or one encouragement per response
- No lists, no headers — just direct coaching voice`;

// ─── Grok Vision Analysis (Primary) ──────────────────────────────────────────
async function analyzeFrameWithGrok(
  imageBase64: string,
  exerciseId?: string
): Promise<{ analysis: VisionAnalysis | null; rawDescription: string }> {
  const xaiKey = process.env.XAI_API_KEY;
  if (!xaiKey) throw new Error("XAI_API_KEY not configured");

  const exercise = exerciseId ? getExerciseKnowledge(exerciseId) : null;
  const prompt = exercise
    ? buildVisionPrompt(exercise)
    : `Analyze this exercise frame. Describe the movement, body position, joint alignment, and any visible compensation patterns or form breaks. Return a JSON object with keys: form_score (0-100), mistakes_detected (array), risk_flags_triggered (array), fatigue_signals (array), primary_cue (string), positive_observation (string).`;

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${xaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-2-vision-1212",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
      max_tokens: 400,
      temperature: 0.1, // Low temp for consistent form analysis
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Grok Vision error: ${response.status} — ${err}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content || "";

  // Try to parse structured JSON response
  let analysis: VisionAnalysis | null = null;
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[0]) as VisionAnalysis;
    }
  } catch {
    // Structured parsing failed — fall through to raw description
  }

  return { analysis, rawDescription: content };
}

// ─── fal.ai Vision Analysis (Fallback) ───────────────────────────────────────
async function analyzeFrameWithFal(imageBase64: string, exerciseContext?: string): Promise<string> {
  const falKey = process.env.FAL_KEY;
  if (!falKey) throw new Error("FAL_KEY not configured");

  const exercise = exerciseContext ? getExerciseKnowledge(exerciseContext) : null;
  const standard = exercise
    ? `CORRECT FORM: ${exercise.key_cues.join('. ')}. COMMON MISTAKES: ${exercise.common_mistakes.join(', ')}.`
    : null;

  const prompt = standard
    ? `You are a biomechanics analyst. The person is performing: ${exerciseContext}.\n${standard}\nAnalyze this frame. Identify what they are doing correctly and any compensation patterns. 2-3 sentences.`
    : `Analyze this exercise frame. Describe the movement, body position, joint alignment, and any visible compensation patterns. 2-3 sentences.`;

  const response = await fetch("https://fal.run/fal-ai/any-llm/vision", {
    method: "POST",
    headers: {
      "Authorization": `Key ${falKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-flash-1.5",
      prompt,
      image_url: `data:image/jpeg;base64,${imageBase64}`,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`fal.ai vision error: ${response.status} — ${err}`);
  }

  const data = await response.json() as { output?: string; error?: string };
  if (data.error) throw new Error(`fal.ai error: ${data.error}`);
  return data.output || "Unable to analyze frame";
}

// ─── Claude Coaching Cue (Fallback when Grok structured output fails) ─────────
async function getPantherCoachingCue(
  movementDescription: string,
  memberContext?: string
): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const anthropic = new Anthropic({ apiKey: anthropicKey });
  let system = PANTHER_COACHING_PROMPT;
  if (memberContext) system += `\n\nMEMBER CONTEXT:\n${memberContext}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 150,
    system,
    messages: [
      {
        role: "user",
        content: `Camera frame analysis: ${movementDescription}\n\nGive me your live coaching cue for this moment.`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

// ─── ElevenLabs TTS ───────────────────────────────────────────────────────────
async function synthesizeSpeech(text: string): Promise<Buffer> {
  const elevenKey = process.env.ELEVENLABS_API_KEY;
  if (!elevenKey) throw new Error("ELEVENLABS_API_KEY not configured");

  // Use the shared getter so runtime voice overrides (from Settings) are respected
  const voiceId = getActivePantherVoiceId();

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": elevenKey,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs error: ${response.status} — ${err}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/coaching/analyze
 * Step 1: Camera frame → Grok Vision → movement description
 * Body: { frame: string (base64 JPEG), exerciseContext?: string }
 * Returns: { description: string, analysis?: VisionAnalysis }
 */
router.post("/analyze", async (req: Request, res: Response) => {
  try {
    const { frame, exerciseContext } = req.body as {
      frame: string;
      exerciseContext?: string;
    };
    if (!frame) return res.status(400).json({ error: "frame (base64 JPEG) required" });

    try {
      const { analysis, rawDescription } = await analyzeFrameWithGrok(frame, exerciseContext);
      return res.json({ description: rawDescription, analysis });
    } catch (grokErr: any) {
      console.error("[Coaching/analyze] Grok Vision failed:", grokErr);
      // Graceful degradation — no fal.ai fallback needed
      const description = "Frame analysis unavailable. Continue with your current form.";
      return res.json({ description, analysis: null });
    }
  } catch (error: any) {
    console.error("[Coaching/analyze] Error:", error);
    return res.status(500).json({ error: error.message || "Vision analysis failed" });
  }
});

/**
 * POST /api/coaching/coach
 * Step 2: Movement description → Panther coaching cue
 * Body: { description: string, memberContext?: string }
 * Returns: { cue: string }
 */
router.post("/coach", async (req: Request, res: Response) => {
  try {
    const { description, memberContext } = req.body as {
      description: string;
      memberContext?: string;
    };
    if (!description) return res.status(400).json({ error: "description required" });

    const cue = await getPantherCoachingCue(description, memberContext);
    return res.json({ cue });
  } catch (error: any) {
    console.error("[Coaching/coach] Error:", error);
    return res.status(500).json({ error: error.message || "Coaching cue failed" });
  }
});

/**
 * POST /api/coaching/speak
 * Step 3: Coaching cue text → ElevenLabs TTS → audio/mpeg stream
 * Body: { text: string }
 * Returns: audio/mpeg binary
 */
router.post("/speak", async (req: Request, res: Response) => {
  try {
    const { text } = req.body as { text: string };
    if (!text) return res.status(400).json({ error: "text required" });

    const audioBuffer = await synthesizeSpeech(text);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.length);
    return res.send(audioBuffer);
  } catch (error: any) {
    console.error("[Coaching/speak] Error:", error);
    return res.status(500).json({ error: error.message || "TTS synthesis failed" });
  }
});

/**
 * POST /api/coaching/pipeline
 * Full pipeline: frame → Grok Vision → Autonomous Decision Engine → TTS
 * Body: {
 *   frame: string (base64),
 *   exerciseContext?: string,
 *   memberContext?: string,
 *   audioEnabled?: boolean,
 *   consecutiveMistakes?: number
 * }
 * Returns: { description, cue, decision, audioBase64? }
 */
router.post("/pipeline", async (req: Request, res: Response) => {
  try {
    const {
      frame,
      exerciseContext,
      memberContext,
      audioEnabled = false,
      consecutiveMistakes = 0,
    } = req.body as {
      frame: string;
      exerciseContext?: string;
      memberContext?: string;
      audioEnabled?: boolean;
      consecutiveMistakes?: number;
    };

    if (!frame) return res.status(400).json({ error: "frame (base64 JPEG) required" });

     let description = "";
    let analysis: VisionAnalysis | null = null;
    let decision: PantherDecision | null = null;
    let cue = "";
    // Step 1: Grok Vision analysis (Grok-only — no fal.ai dependency)
    try {
      const result = await analyzeFrameWithGrok(frame, exerciseContext);
      analysis = result.analysis;
      description = result.rawDescription;
    } catch (grokErr: any) {
      console.error("[Pipeline] Grok Vision failed:", grokErr);
      if (grokErr?.message?.includes("XAI_API_KEY")) {
        return res.status(500).json({ error: "Grok Vision API key not configured. Contact support." });
      }
      // Grok is configured but returned an error — keep session alive with a generic cue
      description = "Frame analysis unavailable. Continue with your current form.";
    }

    // Step 2: Autonomous Decision Engine (if structured analysis available)
    if (analysis && exerciseContext) {
      const exercise = getExerciseKnowledge(exerciseContext);
      if (exercise) {
        decision = pantherDecisionEngine(analysis, exercise, consecutiveMistakes);
        cue = decision.message;
      }
    }

    // Step 3: Fallback to Claude if no structured decision
    if (!cue) {
      cue = await getPantherCoachingCue(description, memberContext);
    }

    // Step 4: TTS (optional)
    let audioBase64: string | undefined;
    if (audioEnabled && cue && decision?.action !== 'silence') {
      try {
        const audioBuffer = await synthesizeSpeech(cue);
        audioBase64 = audioBuffer.toString("base64");
      } catch (ttsError) {
        console.error("[Pipeline] TTS failed, continuing without audio:", ttsError);
      }
    }

    return res.json({
      description,
      cue,
      decision,
      analysis,
      ...(audioBase64 ? { audioBase64 } : {}),
    });
  } catch (error: any) {
    console.error("[Coaching/pipeline] Error:", error);
    return res.status(500).json({ error: error.message || "Pipeline failed" });
  }
});

/**
 * POST /api/coaching/analyze-movement
 * BOA v4: Exercise-specific AI vision analysis with NASM corrective prompt
 * Body: { imageBase64: string, prompt: string, mode: string }
 * Returns: { content: string }
 */
router.post("/analyze-movement", async (req: Request, res: Response) => {
  try {
    const { imageBase64, prompt, mode } = req.body as {
      imageBase64: string;
      prompt: string;
      mode: string;
    };
    if (!imageBase64 || !prompt) {
      return res.status(400).json({ error: "imageBase64 and prompt required" });
    }

    // Try Grok Vision first
    let visionDescription = "";
    try {
      const { rawDescription } = await analyzeFrameWithGrok(imageBase64, mode);
      visionDescription = rawDescription;
    } catch (grokErr) {
      console.warn("[BOA] Grok Vision failed, falling back to fal.ai:", grokErr);
      const falKey = process.env.FAL_KEY;
      if (falKey) {
        try {
          visionDescription = await analyzeFrameWithFal(imageBase64, mode);
        } catch (falErr) {
          console.warn("[BOA] fal.ai also failed:", falErr);
        }
      }
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      if (!visionDescription) throw new Error("No vision API configured");
      return res.json({ content: visionDescription });
    }

    const client = new Anthropic({ apiKey: anthropicKey });
    const userContent = visionDescription
      ? `${prompt}\n\nVISION ANALYSIS FROM CAMERA:\n${visionDescription}`
      : prompt;

    const messages: Anthropic.MessageParam[] = visionDescription
      ? [{ role: "user", content: userContent }]
      : [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
            { type: "text", text: prompt },
          ],
        }];

    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 600,
      messages,
    });

    const content = response.content[0].type === "text" ? response.content[0].text : visionDescription;
    return res.json({ content });
  } catch (error: any) {
    console.error("[Coaching/analyze-movement] Error:", error);
    return res.status(500).json({ error: error.message || "Movement analysis failed" });
  }
});

/**
 * GET /api/coaching/exercises
 * Returns the full exercise knowledge base (for client-side use)
 */
router.get("/exercises", (_req: Request, res: Response) => {
  return res.json({ exercises: EXERCISE_KNOWLEDGE_BASE });
});

/**
 * GET /api/coaching/health
 * Check which services are configured
 */
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    services: {
      grok_vision: !!process.env.XAI_API_KEY,
      fal: !!process.env.FAL_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
    },
    exercise_library_count: EXERCISE_KNOWLEDGE_BASE.length,
    timestamp: new Date().toISOString(),
  });
});

export default router;
