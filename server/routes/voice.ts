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
  // Primary — Marc Turner's custom recorded Panther voice
  panther: {
    id: "b00ceb71c65e463b9bd82ec96ee8df1e", // Marc Turner — custom cloned Panther Brain voice
    name: "Panther (Marc)",
    description: "Marc Turner's voice — authentic Panther Brain coaching",
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

// ─── Voice Library ──────────────────────────────────────────────────────────
// Exercise-specific coaching cues with tempo support
const VOICE_LIBRARY: Record<string, { cues: string[]; tempo?: string }> = {
  sq_slow:      { cues: ["Control the descent.", "Slow it down. Own the movement.", "Five count down. Feel every inch."], tempo: "5-1-1" },
  sq_explosive: { cues: ["Explode up!", "Power through the floor!", "Drive!"], tempo: "1-0-1" },
  push_slow:    { cues: ["Stay tight. Control your body.", "No wasted motion. Chest to floor.", "Slow and strong."], tempo: "3-1-1" },
  push_explosive: { cues: ["Push the floor away!", "Explosive!", "Fast hands!"], tempo: "1-0-1" },
  plank:        { cues: ["Hold strong. Engage your core.", "Don't break. Breathe.", "Brace everything."] },
  rdl:          { cues: ["Hinge at the hip. Spine neutral.", "Push the floor back. Not down.", "Hamstrings loaded — control it."], tempo: "3-1-1" },
  split_squat:  { cues: ["Front knee tracks over toe.", "Drive the back knee down.", "Stay tall. Don't lean."], tempo: "3-1-1" },
  jump_sq:      { cues: ["Explode up!", "Power!", "Move fast!"], tempo: "1-0-1" },
  sprint:       { cues: ["Go!", "Drive forward!", "Full speed!"] },
  crawl:        { cues: ["Low and slow. Stay tight.", "Opposite arm, opposite leg.", "Control the crawl."] },
  recovery:     { cues: ["Breathe. Let it go.", "Slow your heart rate down.", "Active recovery. Stay moving."] },
};

// In-memory cache: exercise_id+difficulty → { text, audio_url, job_id }
const voiceCache: Record<string, { text: string; audio_url: string; job_id: string }> = {};

// ─── POST /api/voice/generate ────────────────────────────────────────────────
// Generate or retrieve a voice cue for an exercise. Returns { text, audio_url, source }.
// Matches the client pattern: POST { exercise_id, difficulty?, tempo? }
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { exercise_id, difficulty = "normal", tempo } = req.body as {
      exercise_id: string;
      difficulty?: "beginner" | "normal" | "advanced";
      tempo?: string;
    };

    if (!exercise_id) {
      return res.status(400).json({ error: "exercise_id is required" });
    }

    const cacheKey = `${exercise_id}_${difficulty}`;

    // 1. Check in-memory cache
    if (voiceCache[cacheKey]) {
      return res.json({ source: "cache", ...voiceCache[cacheKey] });
    }

    // 2. Build cue text from library
    const entry = VOICE_LIBRARY[exercise_id];
    const cues = entry?.cues || ["Stay focused. Control the movement."];
    const resolvedTempo = tempo || entry?.tempo;
    let text = cues[Math.floor(Math.random() * cues.length)];

    // Modify based on difficulty
    if (difficulty === "beginner") {
      text = "Take your time. " + text;
    } else if (difficulty === "advanced") {
      text = text.toUpperCase();
    }

    // Append tempo if available
    if (resolvedTempo) {
      const parts = resolvedTempo.split("-");
      if (parts.length === 3) {
        const [down, hold, up] = parts;
        text += ` ${down} count down. ${hold} count hold. ${up} count up.`;
      }
    }

    // 3. Generate audio via ElevenLabs
    if (!ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: "ElevenLabs API key not configured" });
    }

    const voice = TUF_VOICES.panther;
    const elResponse = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voice.id}`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: text.slice(0, 300),
        model_id: DEFAULT_MODEL,
        voice_settings: DEFAULT_VOICE_SETTINGS,
      }),
    });

    if (!elResponse.ok) {
      const errText = await elResponse.text();
      console.error("[Voice Generate] ElevenLabs error:", elResponse.status, errText);
      return res.status(500).json({ error: "TTS generation failed" });
    }

    // 4. Convert to base64 data URL (no S3 needed for short coaching cues)
    const audioBuffer = Buffer.from(await elResponse.arrayBuffer());
    const audio_url = `data:audio/mpeg;base64,${audioBuffer.toString("base64")}`;

    const job_id = `${exercise_id}_${Date.now()}`;
    const result = { text, audio_url, job_id };

    // 5. Save to cache
    voiceCache[cacheKey] = result;

    return res.json({ source: "generated", ...result });
  } catch (err) {
    console.error("[Voice Generate] Error:", err);
    res.status(500).json({ error: "Voice generation failed" });
  }
});

// ─── GET /api/voice/:id ───────────────────────────────────────────────────────
// Poll a voice job by job_id. Returns { status, audio_url, text }.
// Since /generate is synchronous, status is always "complete" if found.
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  // Search cache by job_id
  const entry = Object.values(voiceCache).find(v => v.job_id === id);
  if (entry) {
    return res.json({ status: "complete", ...entry });
  }
  return res.status(404).json({ status: "not_found", error: "Voice job not found" });
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
