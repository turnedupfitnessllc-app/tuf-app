/**
 * video.ts — Kling AI Video Generation via FAL
 * Generates exercise demonstration videos on demand.
 * Uses fal-ai/kling-video/v1.6/standard/text-to-video model.
 */
import { Router, Request, Response } from "express";

const router = Router();

// ─── Kling via FAL ────────────────────────────────────────────────────────────
async function generateExerciseVideo(
  prompt: string,
  duration: "5" | "10" = "5"
): Promise<{ videoUrl: string; thumbnailUrl?: string }> {
  const falKey = process.env.FAL_KEY;
  if (!falKey) throw new Error("FAL_KEY not configured");

  // Submit the generation job
  const submitRes = await fetch("https://queue.fal.run/fal-ai/kling-video/v1.6/standard/text-to-video", {
    method: "POST",
    headers: {
      "Authorization": `Key ${falKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      duration,
      aspect_ratio: "9:16",
      negative_prompt: "blurry, low quality, distorted, cartoon, animation, unrealistic",
    }),
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`Kling submit error: ${submitRes.status} — ${err}`);
  }

  const submitData = await submitRes.json() as { request_id: string; status_url?: string };
  const requestId = submitData.request_id;
  if (!requestId) throw new Error("No request_id returned from Kling");

  // Poll for completion (max 3 minutes)
  const statusUrl = `https://queue.fal.run/fal-ai/kling-video/v1.6/standard/text-to-video/requests/${requestId}`;
  const maxAttempts = 36; // 36 × 5s = 3 minutes
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const statusRes = await fetch(statusUrl, {
      headers: { "Authorization": `Key ${falKey}` },
    });
    if (!statusRes.ok) continue;
    const status = await statusRes.json() as {
      status: string;
      video?: { url: string };
      output?: { video?: { url: string } };
    };

    if (status.status === "COMPLETED" || status.video || status.output?.video) {
      const videoUrl = status.video?.url || status.output?.video?.url;
      if (!videoUrl) throw new Error("Completed but no video URL returned");
      return { videoUrl };
    }
    if (status.status === "FAILED") {
      throw new Error("Kling video generation failed");
    }
  }
  throw new Error("Kling video generation timed out after 3 minutes");
}

// ─── Exercise Video Prompt Builder ───────────────────────────────────────────
function buildExercisePrompt(exerciseName: string, cues?: string[]): string {
  const cueText = cues && cues.length > 0
    ? ` Key coaching cues: ${cues.slice(0, 3).join(", ")}.`
    : "";

  return `Professional fitness trainer demonstrating ${exerciseName} exercise with perfect form. ` +
    `Clear view of full body movement. Slow, controlled motion. Athletic wear. ` +
    `Clean gym background. High quality, realistic human movement.${cueText} ` +
    `Smooth 5-second demonstration loop. No text overlays.`;
}

// ─── POST /api/video/exercise ─────────────────────────────────────────────────
// Generate an exercise demo video
router.post("/exercise", async (req: Request, res: Response) => {
  try {
    const { exerciseName, cues, duration = "5" } = req.body as {
      exerciseName: string;
      cues?: string[];
      duration?: "5" | "10";
    };

    if (!exerciseName) {
      return res.status(400).json({ error: "exerciseName is required" });
    }

    const prompt = buildExercisePrompt(exerciseName, cues);
    const result = await generateExerciseVideo(prompt, duration);

    return res.json({
      success: true,
      videoUrl: result.videoUrl,
      exerciseName,
      prompt,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Video generation failed";
    console.error("[video] Exercise video error:", msg);
    return res.status(500).json({ error: msg });
  }
});

// ─── POST /api/video/custom ───────────────────────────────────────────────────
// Generate a video from a custom prompt
router.post("/custom", async (req: Request, res: Response) => {
  try {
    const { prompt, duration = "5" } = req.body as {
      prompt: string;
      duration?: "5" | "10";
    };

    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const result = await generateExerciseVideo(prompt, duration);
    return res.json({ success: true, videoUrl: result.videoUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Video generation failed";
    console.error("[video] Custom video error:", msg);
    return res.status(500).json({ error: msg });
  }
});

// ─── GET /api/video/status ────────────────────────────────────────────────────
// Check if video generation is available
router.get("/status", (_req: Request, res: Response) => {
  res.json({
    available: !!process.env.FAL_KEY,
    provider: "Kling AI via FAL",
    model: "fal-ai/kling-video/v1.6/standard/text-to-video",
    maxDuration: "10s",
    aspectRatio: "9:16",
    estimatedTime: "60-180 seconds",
  });
});

export default router;
