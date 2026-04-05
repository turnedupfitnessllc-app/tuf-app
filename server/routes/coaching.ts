// server/routes/coaching.ts
// Real-time AI coaching pipeline:
// Camera frame → fal.ai vision → Claude JARVIS analysis → ElevenLabs TTS
import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

// ─── JARVIS System Prompt (NASM Corrective Exercise Framework) ───────────────
const JARVIS_COACHING_PROMPT = `You are JARVIS — the AI coaching intelligence behind Turned Up Fitness (TUF). You speak in Marc's voice: direct, no fluff, former Marine energy. You train adults 40+ and you know exactly what their bodies need.

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

HOW YOU SPEAK:
- Short sentences. No walls of text.
- Ask one sharp diagnostic question at a time before prescribing
- Use "we" — this is a team effort
- Call out form breaks directly but without shame
- Celebrate good reps loudly
- Never talk down. They are 40+, not done.
- Reference science briefly, then immediately translate to action

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

// ─── fal.ai Vision Analysis ──────────────────────────────────────────────────
async function analyzeFrameWithFal(imageBase64: string, exerciseContext?: string): Promise<string> {
  const falKey = process.env.FAL_KEY;
  if (!falKey) throw new Error("FAL_KEY not configured");

  // Use fal.ai's fast image understanding model
  const prompt = exerciseContext
    ? `Analyze this exercise frame. The person is doing: ${exerciseContext}. Describe their form, body position, alignment, and any visible issues in 2-3 sentences. Be specific about joint angles, spine position, and muscle engagement.`
    : `Analyze this exercise/movement frame. Describe what exercise is being performed, the person's form, body position, alignment, and any visible issues in 2-3 sentences. Be specific about joint angles, spine position, and muscle engagement.`;

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

// ─── Claude JARVIS Coaching Analysis ─────────────────────────────────────────
async function getJarvisCoachingCue(
  movementDescription: string,
  memberContext?: string
): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const anthropic = new Anthropic({ apiKey: anthropicKey });

  let system = JARVIS_COACHING_PROMPT;
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
 * Step 2: Movement description → Claude JARVIS → coaching cue text
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

    const cue = await getJarvisCoachingCue(description, memberContext);
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

    // Step 2: Claude coaching cue
    const cue = await getJarvisCoachingCue(description, memberContext);

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
