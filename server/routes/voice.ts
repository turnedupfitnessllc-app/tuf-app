/**
 * TUF Voice Routes — ElevenLabs TTS Integration v2.0
 * Powers Panther's spoken coaching responses and workout audio cues
 *
 * Key upgrades in v2.0:
 * - /speak/stream  — chunked streaming for low-latency playback
 * - /speak         — standard blob (unchanged, backward-compat)
 * - /cue           — pre-formatted exercise cue
 * - /generate      — cached exercise audio
 * - /voices        — list available voices
 * - Personality presets: calm_intense · motivational · drill_sergeant · recovery
 */
import { Router, Request, Response } from "express";

const router = Router();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";

// ─── Runtime Voice ID Override ───────────────────────────────────────────────
// Set via POST /api/voice/set-voice-id without restarting the server
let runtimePantherVoiceId: string | null = null;

/** Returns the active Panther Voice ID — runtime override → env var → Adam fallback */
export function getActivePantherVoiceId(): string {
  return runtimePantherVoiceId || process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJgB";
}

// ─── Available TUF Voices ─────────────────────────────────────────────────────
export const TUF_VOICES = {
  // Primary — Marc Turner's custom recorded Panther voice
  // Once Marc records in ElevenLabs, set ELEVENLABS_VOICE_ID env var to his real Voice ID
  panther: {
    get id() { return runtimePantherVoiceId || process.env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJgB"; }, // runtime override → env var → Adam fallback
    name: "Panther (Marc)",
    description: "Marc Turner's voice — authentic Panther Brain coaching",
  },
  marcus: {
    id: "VR6AewLTigWG4xSOukaG",
    name: "Marcus",
    description: "Strong, confident — motivational cues",
  },
  coach: {
    id: "EXAVITQu4vr4xnSDxMaL",
    name: "Coach",
    description: "Clear, warm — female coaching option",
  },
  overdrive: {
    id: "ErXwobaYiN019PkySvjV",
    name: "Overdrive",
    description: "High energy — intensity moments",
  },
};

// ─── Personality Presets ──────────────────────────────────────────────────────
// Each preset maps to specific ElevenLabs voice_settings values and a text transform
export const VOICE_PERSONALITIES = {
  calm_intense: {
    stability: 0.72,
    similarity_boost: 0.85,
    style: 0.12,
    use_speaker_boost: true,
    description: "Controlled, directive. Minimal words. Maximum weight.",
    textTransform: (t: string) => t, // no transform — Panther's default
  },
  motivational: {
    stability: 0.55,
    similarity_boost: 0.80,
    style: 0.35,
    use_speaker_boost: true,
    description: "Energetic, encouraging. Builds momentum.",
    textTransform: (t: string) => t,
  },
  drill_sergeant: {
    stability: 0.45,
    similarity_boost: 0.75,
    style: 0.50,
    use_speaker_boost: true,
    description: "Intense, demanding. No excuses.",
    textTransform: (t: string) => t.toUpperCase().replace(/\./g, "!"),
  },
  recovery: {
    stability: 0.85,
    similarity_boost: 0.90,
    style: 0.05,
    use_speaker_boost: false,
    description: "Calm, slow, restorative. Breathe and reset.",
    textTransform: (t: string) => t.replace(/!/g, "."),
  },
  technical: {
    stability: 0.78,
    similarity_boost: 0.88,
    style: 0.08,
    use_speaker_boost: true,
    description: "Precise, educational. Biomechanics-focused.",
    textTransform: (t: string) => t,
  },
};

type PersonalityKey = keyof typeof VOICE_PERSONALITIES;
const DEFAULT_PERSONALITY: PersonalityKey = "calm_intense";
const DEFAULT_MODEL = "eleven_turbo_v2_5";

// ─── Helper: build voice settings from personality ────────────────────────────
function getVoiceSettings(personality: PersonalityKey = DEFAULT_PERSONALITY) {
  const p = VOICE_PERSONALITIES[personality] || VOICE_PERSONALITIES.calm_intense;
  return {
    stability: p.stability,
    similarity_boost: p.similarity_boost,
    style: p.style,
    use_speaker_boost: p.use_speaker_boost,
  };
}

// ─── Helper: apply personality text transform ─────────────────────────────────
function applyPersonality(text: string, personality: PersonalityKey = DEFAULT_PERSONALITY): string {
  const p = VOICE_PERSONALITIES[personality] || VOICE_PERSONALITIES.calm_intense;
  return p.textTransform(text);
}

// ─── Shared TTS helper (blob response) ───────────────────────────────────────
async function synthesizeSpeech(
  text: string,
  voiceKey: keyof typeof TUF_VOICES = "panther",
  personality: PersonalityKey = DEFAULT_PERSONALITY,
  res: Response
) {
  if (!ELEVENLABS_API_KEY) {
    return res.status(500).json({ error: "ElevenLabs API key not configured" });
  }
  const processedText = applyPersonality(text.slice(0, 500), personality);
  const voice = TUF_VOICES[voiceKey] || TUF_VOICES.panther;
  const voiceSettings = getVoiceSettings(personality);

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
        text: processedText,
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
  res.setHeader("X-Voice-Personality", personality);
  const audioBuffer = await response.arrayBuffer();
  res.send(Buffer.from(audioBuffer));
}

// ─── POST /api/voice/speak ────────────────────────────────────────────────────
// Standard blob TTS — backward compatible
router.post("/speak", async (req: Request, res: Response) => {
  try {
    const {
      text,
      voiceKey = "panther",
      personality = "calm_intense",
      // Legacy params — still accepted
      stability,
      similarity_boost,
    } = req.body as {
      text: string;
      voiceKey?: keyof typeof TUF_VOICES;
      personality?: PersonalityKey;
      stability?: number;
      similarity_boost?: number;
    };

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "text is required" });
    }

    // If legacy stability/similarity_boost passed, override personality settings
    if (stability !== undefined || similarity_boost !== undefined) {
      if (!ELEVENLABS_API_KEY) {
        return res.status(500).json({ error: "ElevenLabs API key not configured" });
      }
      const voice = TUF_VOICES[voiceKey] || TUF_VOICES.panther;
      const base = getVoiceSettings(personality as PersonalityKey);
      const voiceSettings = {
        ...base,
        ...(stability !== undefined && { stability }),
        ...(similarity_boost !== undefined && { similarity_boost }),
      };
      const response = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voice.id}`, {
        method: "POST",
        headers: { "xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
        body: JSON.stringify({ text: text.slice(0, 500), model_id: DEFAULT_MODEL, voice_settings: voiceSettings }),
      });
      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: "TTS generation failed", detail: errText });
      }
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "no-cache");
      const audioBuffer = await response.arrayBuffer();
      return res.send(Buffer.from(audioBuffer));
    }

    await synthesizeSpeech(text, voiceKey as keyof typeof TUF_VOICES, personality as PersonalityKey, res);
  } catch (err) {
    console.error("[Voice] Error:", err);
    res.status(500).json({ error: "Voice synthesis failed" });
  }
});

// ─── POST /api/voice/speak/stream ─────────────────────────────────────────────
// Streaming TTS — pipes ElevenLabs audio stream directly to client
// Use this for long responses (chat, coaching) to start playback immediately
// while the rest of the audio is still being generated (~300ms first byte)
router.post("/speak/stream", async (req: Request, res: Response) => {
  try {
    const {
      text,
      voiceKey = "panther",
      personality = "calm_intense",
    } = req.body as {
      text: string;
      voiceKey?: keyof typeof TUF_VOICES;
      personality?: PersonalityKey;
    };

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "text is required" });
    }
    if (!ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: "ElevenLabs API key not configured" });
    }

    const processedText = applyPersonality(text.slice(0, 1000), personality as PersonalityKey);
    const voice = TUF_VOICES[voiceKey as keyof typeof TUF_VOICES] || TUF_VOICES.panther;
    const voiceSettings = getVoiceSettings(personality as PersonalityKey);

    // Use ElevenLabs streaming endpoint for low-latency first-byte
    const elResponse = await fetch(
      `${ELEVENLABS_BASE}/text-to-speech/${voice.id}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: processedText,
          model_id: DEFAULT_MODEL,
          voice_settings: voiceSettings,
          // Optimize for streaming: smaller chunks
          optimize_streaming_latency: 3, // 0-4, higher = lower latency but slightly less quality
        }),
      }
    );

    if (!elResponse.ok) {
      const errText = await elResponse.text();
      console.error("[Voice Stream] ElevenLabs error:", elResponse.status, errText);
      return res.status(elResponse.status).json({ error: "TTS stream failed", detail: errText });
    }

    // Pipe the stream directly — no buffering
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Voice-Name", voice.name);
    res.setHeader("X-Voice-Personality", personality);

    if (elResponse.body) {
      const reader = elResponse.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) { res.end(); break; }
          if (!res.write(Buffer.from(value))) {
            await new Promise(resolve => res.once("drain", resolve));
          }
        }
      };
      pump().catch(err => {
        console.error("[Voice Stream] Pipe error:", err);
        if (!res.headersSent) res.status(500).end();
        else res.end();
      });
    } else {
      // Fallback: buffer the whole response
      const audioBuffer = await elResponse.arrayBuffer();
      res.send(Buffer.from(audioBuffer));
    }
  } catch (err) {
    console.error("[Voice Stream] Error:", err);
    if (!res.headersSent) res.status(500).json({ error: "Voice stream failed" });
    else res.end();
  }
});

// ─── POST /api/voice/cue ─────────────────────────────────────────────────────
// Workout exercise cue — pre-formatted coaching line for an exercise
router.post("/cue", async (req: Request, res: Response) => {
  try {
    const {
      exerciseName,
      sets,
      reps,
      coachingCue,
      voiceKey = "panther",
      personality = "calm_intense",
    } = req.body as {
      exerciseName: string;
      sets?: number;
      reps?: string;
      coachingCue?: string;
      voiceKey?: keyof typeof TUF_VOICES;
      personality?: PersonalityKey;
    };

    if (!exerciseName) {
      return res.status(400).json({ error: "exerciseName is required" });
    }

    let spokenText = `Next up — ${exerciseName}.`;
    if (sets && reps) spokenText += ` ${sets} sets of ${reps}.`;
    if (coachingCue) spokenText += ` ${coachingCue}`;
    spokenText += " Let's go.";

    await synthesizeSpeech(spokenText, voiceKey, personality as PersonalityKey, res);
  } catch (err) {
    console.error("[Voice Cue] Error:", err);
    res.status(500).json({ error: "Voice cue generation failed" });
  }
});

// ─── Exercise Voice Library ───────────────────────────────────────────────────
const VOICE_LIBRARY: Record<string, {
  cues: { calm_intense: string[]; motivational: string[]; drill_sergeant: string[]; recovery: string[] };
  tempo?: string;
}> = {
  sq_slow: {
    cues: {
      calm_intense: ["Control the descent.", "Slow it down. Own the movement.", "Five count down. Feel every inch."],
      motivational: ["You've got this. Slow and strong. Own every rep.", "Control it. That's where the gains are."],
      drill_sergeant: ["DOWN SLOW! CONTROL IT! NO SHORTCUTS!", "FIVE COUNT! FEEL THE BURN!"],
      recovery: ["Breathe in on the way down. Slow and steady. No rush."],
    },
    tempo: "5-1-1",
  },
  sq_explosive: {
    cues: {
      calm_intense: ["Explode up.", "Power through the floor.", "Drive."],
      motivational: ["Explode! Show me what you've got!", "Drive up! Fast and powerful!"],
      drill_sergeant: ["EXPLODE! MOVE! NOW!", "POWER! DRIVE! GO!"],
      recovery: ["Gentle push up. No need to rush."],
    },
    tempo: "1-0-1",
  },
  push_slow: {
    cues: {
      calm_intense: ["Stay tight. Control your body.", "No wasted motion. Chest to floor.", "Slow and strong."],
      motivational: ["Controlled power. You're building real strength here.", "Slow reps, real gains. Keep going."],
      drill_sergeant: ["TIGHT! CONTROLLED! NO SAGGING!", "CHEST DOWN SLOW! HOLD IT!"],
      recovery: ["Lower slowly. Feel the stretch. No strain."],
    },
    tempo: "3-1-1",
  },
  push_explosive: {
    cues: {
      calm_intense: ["Push the floor away.", "Explosive.", "Fast hands."],
      motivational: ["Push hard! Explosive power!", "Drive those hands into the floor!"],
      drill_sergeant: ["EXPLODE OFF THE FLOOR! FAST!", "PUSH! PUSH! PUSH!"],
      recovery: ["Gentle push. Stay in control."],
    },
    tempo: "1-0-1",
  },
  plank: {
    cues: {
      calm_intense: ["Hold strong. Engage your core.", "Don't break. Breathe.", "Brace everything."],
      motivational: ["You're stronger than you think. Hold it.", "Almost there. Keep that core tight."],
      drill_sergeant: ["HOLD! DON'T YOU DARE BREAK! BRACE!", "TIGHT! TIGHTER! HOLD!"],
      recovery: ["Breathe steadily. Light tension. Hold gently."],
    },
  },
  rdl: {
    cues: {
      calm_intense: ["Hinge at the hip. Spine neutral.", "Push the floor back. Not down.", "Hamstrings loaded — control it."],
      motivational: ["Feel those hamstrings load up. That's the money.", "Hip hinge. You're doing great."],
      drill_sergeant: ["HINGE! SPINE NEUTRAL! DON'T ROUND!", "HAMSTRINGS! FEEL IT!"],
      recovery: ["Slow hinge. Feel the stretch. No strain on the lower back."],
    },
    tempo: "3-1-1",
  },
  split_squat: {
    cues: {
      calm_intense: ["Front knee tracks over toe.", "Drive the back knee down.", "Stay tall. Don't lean."],
      motivational: ["Single leg strength. This is where champions are made.", "Drive that back knee down. Own it."],
      drill_sergeant: ["KNEE OVER TOE! BACK KNEE DOWN! TALL!", "DRIVE IT! NO LEANING!"],
      recovery: ["Slow and controlled. Feel the balance. No rush."],
    },
    tempo: "3-1-1",
  },
  recovery: {
    cues: {
      calm_intense: ["Breathe. Let it go.", "Slow your heart rate down.", "Active recovery. Stay moving."],
      motivational: ["You earned this rest. Breathe it in.", "Recovery is part of the work. Own it."],
      drill_sergeant: ["BREATHE! STAY MOVING! DON'T STOP!", "ACTIVE RECOVERY! KEEP IT GOING!"],
      recovery: ["Breathe deeply. Let your body recover. You did the work."],
    },
  },
};

// In-memory cache
const voiceCache: Record<string, { text: string; audio_url: string; job_id: string }> = {};

// ─── POST /api/voice/generate ─────────────────────────────────────────────────
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const {
      exercise_id,
      difficulty = "normal",
      tempo,
      personality = "calm_intense",
    } = req.body as {
      exercise_id: string;
      difficulty?: "beginner" | "normal" | "advanced";
      tempo?: string;
      personality?: PersonalityKey;
    };

    if (!exercise_id) {
      return res.status(400).json({ error: "exercise_id is required" });
    }

    const cacheKey = `${exercise_id}_${difficulty}_${personality}`;
    if (voiceCache[cacheKey]) {
      return res.json({ source: "cache", ...voiceCache[cacheKey] });
    }

    const entry = VOICE_LIBRARY[exercise_id];
    const personalityCues = entry?.cues?.[personality as PersonalityKey] || entry?.cues?.calm_intense || ["Stay focused. Control the movement."];
    const resolvedTempo = tempo || entry?.tempo;
    let text = personalityCues[Math.floor(Math.random() * personalityCues.length)];

    if (difficulty === "beginner") text = "Take your time. " + text;

    if (resolvedTempo) {
      const parts = resolvedTempo.split("-");
      if (parts.length === 3) {
        const [down, hold, up] = parts;
        text += ` ${down} count down. ${hold} count hold. ${up} count up.`;
      }
    }

    if (!ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: "ElevenLabs API key not configured" });
    }

    const voice = TUF_VOICES.panther;
    const voiceSettings = getVoiceSettings(personality as PersonalityKey);
    const elResponse = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voice.id}`, {
      method: "POST",
      headers: { "xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text: text.slice(0, 300), model_id: DEFAULT_MODEL, voice_settings: voiceSettings }),
    });

    if (!elResponse.ok) {
      const errText = await elResponse.text();
      console.error("[Voice Generate] ElevenLabs error:", elResponse.status, errText);
      return res.status(500).json({ error: "TTS generation failed" });
    }

    const audioBuffer = Buffer.from(await elResponse.arrayBuffer());
    const audio_url = `data:audio/mpeg;base64,${audioBuffer.toString("base64")}`;
    const job_id = `${exercise_id}_${Date.now()}`;
    const result = { text, audio_url, job_id };
    voiceCache[cacheKey] = result;

    return res.json({ source: "generated", ...result });
  } catch (err) {
    console.error("[Voice Generate] Error:", err);
    res.status(500).json({ error: "Voice generation failed" });
  }
});

// ─── GET /api/voice/:id ───────────────────────────────────────────────────────
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = Object.values(voiceCache).find(v => v.job_id === id);
  if (entry) return res.json({ status: "complete", ...entry });
  return res.status(404).json({ status: "not_found", error: "Voice job not found" });
});

// ─── GET /api/voice/voices ────────────────────────────────────────────────────
router.get("/voices", (_req: Request, res: Response) => {
  res.json({
    voices: Object.entries(TUF_VOICES).map(([key, v]) => ({ key, id: v.id, name: v.name, description: v.description })),
    personalities: Object.entries(VOICE_PERSONALITIES).map(([key, p]) => ({
      key,
      description: p.description,
      stability: p.stability,
      style: p.style,
    })),
    default: "panther",
    default_personality: "calm_intense",
  });
});

// ─── POST /api/voice/set-voice-id ───────────────────────────────────────────
// Allows Marc to paste his ElevenLabs Voice ID from Settings without a server restart
router.post("/set-voice-id", (req: Request, res: Response) => {
  const { voiceId } = req.body as { voiceId?: string };
  if (!voiceId || typeof voiceId !== "string" || voiceId.trim().length < 10) {
    return res.status(400).json({ error: "Invalid voiceId — must be at least 10 characters" });
  }
  runtimePantherVoiceId = voiceId.trim();
  console.log(`[Voice] Runtime Panther Voice ID updated: ${runtimePantherVoiceId}`);
  res.json({
    success: true,
    voiceId: runtimePantherVoiceId,
    message: "Panther voice updated. All future TTS calls will use this voice.",
  });
});

export default router;
