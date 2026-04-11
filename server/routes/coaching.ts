// server/routes/coaching.ts
// Real-time AI coaching pipeline:
// Camera frame → fal.ai vision → The Panther System (Claude) analysis → ElevenLabs TTS
import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

// ─── Panther System Coaching Prompt (NASM Corrective Exercise Framework) ───────
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

// ─── Exercise Form Standards (TUF Coaching Baselines) ───────────────────────
const EXERCISE_STANDARDS: Record<string, string> = {
  squat: "Feet shoulder-width, toes 15-30° out. Knees track over toes (not caving in = valgus). Neutral spine, chest tall. Hip crease below parallel at depth. Common LCS compensations: knee valgus, forward trunk lean, heel rise.",
  deadlift: "Hip hinge pattern. Neutral spine throughout — no rounding lumbar or thoracic. Bar stays close to body. Hips and shoulders rise at same rate. Glutes drive lockout. Common faults: lumbar flexion, bar drift, early hip rise.",
  "push-up": "Rigid plank — no hip sag or pike. Hands under shoulders. Elbows 45° from body. Chest to floor. Common UCS compensations: head forward, shoulder elevation, scapular winging.",
  lunge: "Front shin vertical, knee not past toe. Rear knee 1-2 inches from floor. Torso upright, no forward lean. Hips square — no rotation. Common LCS fault: hip drop (Trendelenburg), forward trunk lean.",
  "hip hinge": "Soft knee bend. Hinge at hip — not squat. Neutral spine. Hamstring stretch felt. Glutes drive return. Common fault: squatting the hinge, lumbar flexion.",
  "glute bridge": "Feet flat, hip-width. Drive through heels. Full hip extension at top — no lumbar hyperextension. Glutes squeezed hard at top. Common fault: hamstring dominance, lumbar arch instead of glute drive.",
  plank: "Neutral spine — no hip sag or pike. Head neutral, not forward. Glutes and core braced. Scapulae flat — no winging. Common UCS fault: head forward, shoulder elevation.",
};

// ─── fal.ai Vision Analysis ──────────────────────────────────────────────────
async function analyzeFrameWithFal(imageBase64: string, exerciseContext?: string): Promise<string> {
  const falKey = process.env.FAL_KEY;
  if (!falKey) throw new Error("FAL_KEY not configured");

  const standard = exerciseContext
    ? EXERCISE_STANDARDS[exerciseContext.toLowerCase()] || null
    : null;

  const prompt = standard
    ? `You are a biomechanics analyst. The person is performing: ${exerciseContext}.

CORRECT FORM STANDARD:
${standard}

Analyze this frame against that standard. Identify:
1. What they are doing correctly
2. Any compensation patterns or form breaks you see
3. The single most critical issue (if any)

Be specific: joint angles, spine position, alignment. 2-3 sentences.`
    : `Analyze this exercise frame. Describe the movement being performed, body position, joint alignment, and any visible compensation patterns or form breaks. Be specific. 2-3 sentences.`;

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

// ─── The Panther System Coaching Analysis (Claude) ─────────────────────────────
async function getPantherCoachingCue(
  movementDescription: string,
  memberContext?: string
): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const anthropic = new Anthropic({ apiKey: anthropicKey });

  let system = PANTHER_COACHING_PROMPT;
  if (memberContext) {
    system += `\n\nMEMBER CONTEXT:\n${memberContext}`;
  }

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

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return text;
}

// ─── ElevenLabs TTS ───────────────────────────────────────────────────────────
async function synthesizeSpeech(text: string): Promise<Buffer> {
  const elevenKey = process.env.ELEVENLABS_API_KEY;
  if (!elevenKey) throw new Error("ELEVENLABS_API_KEY not configured");

  // Use a strong, authoritative voice — "Adam" (deep male voice, good for coaching)
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJgB"; // Adam

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": elevenKey,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5", // Fast, low-latency model
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
 * Step 1: Camera frame → fal.ai vision → movement description
 * Body: { frame: string (base64 JPEG), exerciseContext?: string }
 * Returns: { description: string }
 */
router.post("/analyze", async (req: Request, res: Response) => {
  try {
    const { frame, exerciseContext } = req.body as {
      frame: string;
      exerciseContext?: string;
    };

    if (!frame) {
      return res.status(400).json({ error: "frame (base64 JPEG) required" });
    }

    const description = await analyzeFrameWithFal(frame, exerciseContext);
    return res.json({ description });
  } catch (error: any) {
    console.error("[Coaching/analyze] Error:", error);
    return res.status(500).json({ error: error.message || "Vision analysis failed" });
  }
});

/**
 * POST /api/coaching/coach
 * Step 2: Movement description → The Panther System (Claude) → coaching cue text
 * Body: { description: string, memberContext?: string }
 * Returns: { cue: string }
 */
router.post("/coach", async (req: Request, res: Response) => {
  try {
    const { description, memberContext } = req.body as {
      description: string;
      memberContext?: string;
    };

    if (!description) {
      return res.status(400).json({ error: "description required" });
    }

    const cue = await getPantherCoachingCue(description, memberContext);
    return res.json({ cue });
  } catch (error: any) {
    console.error("[Coaching/coach] Error:", error);
    return res.status(500).json({ error: error.message || "Coaching analysis failed" });
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

    if (!text) {
      return res.status(400).json({ error: "text required" });
    }

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
 * Full pipeline: frame → vision → Claude → TTS in one call
 * Body: { frame: string (base64), exerciseContext?: string, memberContext?: string, audioEnabled?: boolean }
 * Returns: { description, cue, audioUrl? } — audioUrl is a data URI if audioEnabled
 */
router.post("/pipeline", async (req: Request, res: Response) => {
  try {
    const { frame, exerciseContext, memberContext, audioEnabled = false } = req.body as {
      frame: string;
      exerciseContext?: string;
      memberContext?: string;
      audioEnabled?: boolean;
    };

    if (!frame) {
      return res.status(400).json({ error: "frame (base64 JPEG) required" });
    }

    // Step 1: Vision analysis
    const description = await analyzeFrameWithFal(frame, exerciseContext);

    // Step 2: The Panther System coaching cue
    const cue = await getPantherCoachingCue(description, memberContext);

    // Step 3: TTS (optional — only if audioEnabled to save latency)
    let audioBase64: string | undefined;
    if (audioEnabled) {
      try {
        const audioBuffer = await synthesizeSpeech(cue);
        audioBase64 = audioBuffer.toString("base64");
      } catch (ttsError) {
        console.error("[Coaching/pipeline] TTS failed, continuing without audio:", ttsError);
      }
    }

    return res.json({
      description,
      cue,
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

    // Try fal.ai first for vision, then fall back to Anthropic
    let visionDescription = "";
    const falKey = process.env.FAL_KEY;
    if (falKey) {
      try {
        visionDescription = await analyzeFrameWithFal(imageBase64, mode);
      } catch (falErr) {
        console.warn("[BOA] fal.ai failed, falling back to Anthropic vision:", falErr);
      }
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      if (!visionDescription) throw new Error("No vision API configured");
      return res.json({ content: visionDescription });
    }

    const client = new Anthropic({ apiKey: anthropicKey });

    // If we have a fal description, use it as context for the Panther prompt
    const userContent = visionDescription
      ? `${prompt}\n\nVISION ANALYSIS FROM CAMERA:\n${visionDescription}`
      : prompt;

    // If no fal vision, use Anthropic vision directly with the image
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
 * GET /api/coaching/health
 * Check which services are configured
 */
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    services: {
      fal: !!process.env.FAL_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
