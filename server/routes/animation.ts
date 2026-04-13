/**
 * Panther Animation API
 * POST /api/animation/generate  — generate one animation (async, returns job_id)
 * GET  /api/animation/:job_id   — poll job status → { status, url }
 * POST /api/animation/preload   — batch-generate all 8 animations
 *
 * Uses FAL.ai Kling v1.6 text-to-video (same model as video.ts).
 * Jobs are persisted in lowdb so generated videos survive restarts.
 *
 * © 2026 Turned Up Fitness LLC | Confidential
 */
import { Router, Request, Response } from "express";
import {
  createAnimationJob,
  updateAnimationJob,
  getAnimationJob,
  getCachedAnimation,
  getAllCachedAnimations,
} from "../db.js";

const router = Router();

// ─── Animation Library (mirrors client/src/data/pantherAnimations.ts) ─────────
const ANIMATION_LIBRARY: Record<string, { prompt: string; label: string }> = {
  panther_idle: {
    label: "Panther Idle",
    prompt: "humanoid black panther breathing slowly in dark gym, glowing eyes, cinematic lighting, loopable",
  },
  panther_squat_control: {
    label: "Squat Control",
    prompt: "black panther humanoid performing slow controlled squat, 5 second descent, intense focus, cinematic shadows",
  },
  panther_pushup_control: {
    label: "Push-Up Control",
    prompt: "panther humanoid doing slow push-ups, controlled movement, glowing eyes, dark gym",
  },
  panther_plank_hold: {
    label: "Plank Hold",
    prompt: "panther humanoid holding plank position, strong core tension, dramatic lighting",
  },
  panther_explosive_jump: {
    label: "Explosive Jump",
    prompt: "panther humanoid exploding into jump squat, high speed motion, dust particles, cinematic impact",
  },
  panther_crawl: {
    label: "Panther Crawl",
    prompt: "panther humanoid performing slow crawl, low stealth movement, muscles engaged",
  },
  panther_sprint: {
    label: "Sprint",
    prompt: "panther humanoid sprinting explosively in dark gym, motion blur, high intensity",
  },
  panther_recovery: {
    label: "Recovery",
    prompt: "panther humanoid stretching and breathing calmly, low light, recovery mode",
  },
};

// ─── Difficulty modifiers ─────────────────────────────────────────────────────
const DIFFICULTY_SUFFIX: Record<string, string> = {
  beginner: ", slower movement, controlled pace, gentle lighting",
  normal: ", steady controlled movement, cinematic quality",
  intermediate: ", focused intensity, precise technique, dramatic shadows",
  advanced: ", explosive power, fast motion, high intensity cinematic",
};

// ─── FAL.ai Kling video generation (async, non-blocking) ─────────────────────
async function submitKlingJob(prompt: string): Promise<string> {
  const falKey = process.env.FAL_KEY || process.env.FAL_API_KEY;
  if (!falKey) throw new Error("FAL_KEY not configured");

  const res = await fetch(
    "https://queue.fal.run/fal-ai/kling-video/v1.6/standard/text-to-video",
    {
      method: "POST",
      headers: {
        Authorization: `Key ${falKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        duration: "5",
        aspect_ratio: "9:16",
        negative_prompt: "blurry, low quality, distorted, cartoon, anime, unrealistic",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Kling submit error: ${res.status} — ${err}`);
  }

  const data = (await res.json()) as { request_id: string };
  if (!data.request_id) throw new Error("No request_id returned from Kling");
  return data.request_id;
}

async function pollKlingJob(requestId: string): Promise<string> {
  const falKey = process.env.FAL_KEY || process.env.FAL_API_KEY;
  const statusUrl = `https://queue.fal.run/fal-ai/kling-video/v1.6/standard/text-to-video/requests/${requestId}`;
  const maxAttempts = 36; // 36 × 5s = 3 minutes

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const statusRes = await fetch(statusUrl, {
      headers: { Authorization: `Key ${falKey}` },
    });
    if (!statusRes.ok) continue;

    const status = (await statusRes.json()) as {
      status: string;
      video?: { url: string };
      output?: { video?: { url: string } };
    };

    if (
      status.status === "COMPLETED" ||
      status.video?.url ||
      status.output?.video?.url
    ) {
      const url = status.video?.url || status.output?.video?.url;
      if (!url) throw new Error("Completed but no video URL");
      return url;
    }

    if (status.status === "FAILED") {
      throw new Error("Kling job failed");
    }
  }

  throw new Error("Kling job timed out after 3 minutes");
}

/** Fire-and-forget background generation — updates DB when done */
async function runGenerationJob(job_id: string, prompt: string): Promise<void> {
  try {
    await updateAnimationJob(job_id, { status: "processing" });
    const requestId = await submitKlingJob(prompt);
    const videoUrl = await pollKlingJob(requestId);
    await updateAnimationJob(job_id, {
      status: "complete",
      url: videoUrl,
      source: "generated",
    });
    console.log(`[Animation] Job ${job_id} complete → ${videoUrl}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[Animation] Job ${job_id} failed: ${message}`);
    await updateAnimationJob(job_id, { status: "failed", error: message });
  }
}

// ─── POST /api/animation/generate ────────────────────────────────────────────
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { animation_id, difficulty = "normal" } = req.body as {
      animation_id: string;
      difficulty?: string;
    };

    if (!animation_id || !ANIMATION_LIBRARY[animation_id]) {
      return res.status(404).json({ error: `Animation '${animation_id}' not found` });
    }

    // 1. Check cache first
    const cached = await getCachedAnimation(animation_id, difficulty);
    if (cached?.url) {
      return res.json({
        job_id: cached.job_id,
        status: "complete",
        source: "cache",
        url: cached.url,
      });
    }

    // 2. Build prompt with difficulty modifier
    const base = ANIMATION_LIBRARY[animation_id].prompt;
    const suffix = DIFFICULTY_SUFFIX[difficulty] || DIFFICULTY_SUFFIX.normal;
    const prompt_used = base + suffix;

    // 3. Create job record
    const job = await createAnimationJob({
      animation_id,
      difficulty,
      prompt_used,
      status: "pending",
      source: "generated",
    });

    // 4. Start generation in background (non-blocking)
    runGenerationJob(job.job_id, prompt_used).catch(() => {});

    return res.json({
      job_id: job.job_id,
      status: "pending",
      source: "generated",
      animation_id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Animation] Generate error:", message);
    return res.status(500).json({ error: message });
  }
});

// ─── GET /api/animation/:job_id ───────────────────────────────────────────────
router.get("/:job_id", async (req: Request, res: Response) => {
  try {
    const { job_id } = req.params;
    const job = await getAnimationJob(job_id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    return res.json({
      job_id: job.job_id,
      animation_id: job.animation_id,
      status: job.status,
      url: job.url || null,
      source: job.source,
      error: job.error || null,
      created_at: job.created_at,
      updated_at: job.updated_at,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

// ─── POST /api/animation/preload ──────────────────────────────────────────────
// Batch-generate all 8 animations. Called on app load / after login.
// Returns immediately with job IDs; client polls each one.
router.post("/preload", async (req: Request, res: Response) => {
  try {
    const { difficulty = "normal" } = req.body as { difficulty?: string };

    const jobs: Array<{
      animation_id: string;
      job_id: string;
      status: string;
      source: string;
      url?: string;
    }> = [];

    for (const animation_id of Object.keys(ANIMATION_LIBRARY)) {
      // Check cache first
      const cached = await getCachedAnimation(animation_id, difficulty);
      if (cached?.url) {
        jobs.push({
          animation_id,
          job_id: cached.job_id,
          status: "complete",
          source: "cache",
          url: cached.url,
        });
        continue;
      }

      // Create job and fire background generation
      const base = ANIMATION_LIBRARY[animation_id].prompt;
      const suffix = DIFFICULTY_SUFFIX[difficulty] || DIFFICULTY_SUFFIX.normal;
      const prompt_used = base + suffix;

      const job = await createAnimationJob({
        animation_id,
        difficulty,
        prompt_used,
        status: "pending",
        source: "generated",
      });

      runGenerationJob(job.job_id, prompt_used).catch(() => {});

      jobs.push({
        animation_id,
        job_id: job.job_id,
        status: "pending",
        source: "generated",
      });
    }

    console.log(`[Animation] Preload started — ${jobs.length} animations (difficulty: ${difficulty})`);
    return res.json({ jobs, total: jobs.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Animation] Preload error:", message);
    return res.status(500).json({ error: message });
  }
});

// ─── GET /api/animation/library/all ──────────────────────────────────────────
// Returns all cached (complete) animations — useful for status dashboard
router.get("/library/all", async (_req: Request, res: Response) => {
  try {
    const cached = await getAllCachedAnimations();
    const result = Object.entries(ANIMATION_LIBRARY).map(([id, meta]) => {
      const job = cached.find((j) => j.animation_id === id);
      return {
        animation_id: id,
        label: meta.label,
        status: job ? "complete" : "not_generated",
        url: job?.url || null,
        job_id: job?.job_id || null,
      };
    });
    return res.json({ animations: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

export default router;
