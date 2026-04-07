/**
 * TUF Voice Routes — ElevenLabs TTS Integration
 * Powers Panther's spoken coaching responses and workout audio cues
 */
import { Router, Request, Response } from "express";

const router = Router();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";

// ─── Available TUF Voices ─────────────────────────────────────────────────────
// Curated ElevenLabs voices that fit the TUF brand
export const TUF_VOICES = {
  // Primary — deep, authoritative, military energy (default Panther voice)
  panther: {
    id: "pNInz6obpgDQGcFmaJgB", // Adam — deep, authoritative American male
    name: "Panther (Adam)",
    description: "Deep, authoritative — primary coaching voice",
  },
  // Alternative — strong, confident male
  marcus: {
    id: "VR6AewLTigWG4xSOukaG", // Arnold — strong, confident
    name: "Marcus",
    description: "Strong, confident — motivational cues",
  },
  // Female option — strong, clear
  coach: {
    id: "EXAVITQu4vr4xnSDxMaL", // Bella — warm, clear female
    name: "Coach",
    description: "Clear, warm — female coaching option",
  },
  // High energy — for workout intensity moments
  overdrive: {
    id: "ErXwobaYiN019PkySvjV", // Antoni — energetic
    name: "Overdrive",
    description: "High energy — intensity moments",
  },
};

// Default voice model — eleven_turbo_v2_5 per Panther Voice System Report v1.0
const DEFAULT_MODEL = "eleven_turbo_v2_5";
const DEFAULT_VOICE_SETTINGS = {
  stability: 0.70,         // Per report: 0.65–0.75 for consistency with natural variance
  similarity_boost: 0.85,  // Per report: 0.80–0.90 — close to Marc's actual voice sample
  style: 0.15,             // Per report: 0.10–0.20 — minimal, Panther doesn't perform, he coaches
  use_speaker_boost: true, // Per report: ON — enhances clarity for coaching delivery
};

// ─── Shared TTS helper ──────────────────────────────────────────────────────
async function synthesizeSpeech(
  text: string,
  voiceKey: keyof typeof TUF_VOICES = "panther",
  res: Response,
  stability?: number,
  similarity_boost?: number
) {
  if (!ELEVENLABS_API_KEY) {
    return res.status(500).json({ error: "ElevenLabs API key not configured" });
  }
  const trimmedText = text.slice(0, 500);
  const voice = TUF_VOICES[voiceKey] || TUF_VOICES.panther;
  const voiceSettings = {
    ...DEFAULT_VOICE_SETTINGS,
    ...(stability !== undefined && { stability }),
    ...(similarity_boost !== undefined && { similarity_boost }),
  };
  const response = await fetch(
    `${ELEVENLABS_BASE}/text-to-speech/${voice.id}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: trimmedText,
        model_id: DEFAULT_MODEL,
        voice_settings: voiceSettings,
      }),
    }
  );
  if (!response.ok) {
    const errText = await response.text();
    console.error("[Voice] ElevenLabs error:", response.status, errText);
    return res.status(response.status).json({ error: "TTS generation failed", detail: errText });
  }
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("X-Voice-Name", voice.name);
  const audioBuffer = await response.arrayBuffer();
  res.send(Buffer.from(audioBuffer));
}

// ─── POST /api/voice/speak ────────────────────────────────────────────────────
// Convert text to speech — returns audio/mpeg stream
router.post("/speak", async (req: Request, res: Response) => {
  try {
    const {
      text,
      voiceKey = "panther",
      stability,
      similarity_boost,
    } = req.body as {
      text: string;
      voiceKey?: keyof typeof TUF_VOICES;
      stability?: number;
      similarity_boost?: number;
    };

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "text is required" });
    }
    await synthesizeSpeech(text, voiceKey, res, stability, similarity_boost);
  } catch (err) {
    console.error("[Voice] Error:", err);
    res.status(500).json({ error: "Voice synthesis failed" });
  }
});

// ─── POST /api/voice/cue ─────────────────────────────────────────────────────
// Workout exercise cue — pre-formatted coaching line for an exercise
router.post("/cue", async (req: Request, res: Response) => {
  try {
    const { exerciseName, sets, reps, coachingCue, voiceKey = "panther" } = req.body as {
      exerciseName: string;
      sets?: number;
      reps?: string;
      coachingCue?: string;
      voiceKey?: keyof typeof TUF_VOICES;
    };

    if (!exerciseName) {
      return res.status(400).json({ error: "exerciseName is required" });
    }

    // Build the spoken cue
    let spokenText = `Next up — ${exerciseName}.`;
    if (sets && reps) {
      spokenText += ` ${sets} sets of ${reps}.`;
    }
    if (coachingCue) {
      spokenText += ` ${coachingCue}`;
    }
    spokenText += " Let's go.";

    // Reuse the shared TTS helper
    await synthesizeSpeech(spokenText, voiceKey, res);
  } catch (err) {
    console.error("[Voice Cue] Error:", err);
    res.status(500).json({ error: "Voice cue generation failed" });
  }
});

// ─── GET /api/voice/voices ────────────────────────────────────────────────────
// Return available TUF voices (no API call needed — hardcoded)
router.get("/voices", (_req: Request, res: Response) => {
  res.json({
    voices: Object.entries(TUF_VOICES).map(([key, v]) => ({
      key,
      id: v.id,
      name: v.name,
      description: v.description,
    })),
    default: "panther",
  });
});

export default router;
