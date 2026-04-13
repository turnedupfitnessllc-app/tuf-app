/**
 * Panther System Motion Generation Service
 * Uses Kling AI v3 Motion Control via fal.ai to generate new Panther System movements on demand.
 * The panther character image is used as the base, and a motion reference video drives the animation.
 *
 * IMPORTANT: The motion reference videos must be uploaded to fal.ai storage first
 * because the CDN videos are not publicly accessible by fal.ai's servers.
 * We use fal_client.upload_file() equivalent via the fal.ai upload API.
 */

// Panther character reference image — full-body panther with UP logo, clear walking pose
// This CDN URL IS publicly accessible (returns HTTP 200)
const PANTHER_CHARACTER_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis_character_reference_6c19ec1b.jpg";

/**
 * Pre-uploaded motion reference videos on fal.ai storage — publicly accessible.
 * These were uploaded via fal_client.upload_file() to bypass CDN access restrictions.
 * The original CDN videos return 403 for external requests.
 *
 * To add more motion types:
 * 1. Download the video from CDN
 * 2. Upload to fal.ai: python3 -c "import fal_client; print(fal_client.upload_file('video.mp4'))"
 * 3. Add the returned URL here
 */
const MOTION_REFERENCES_FAL: Record<string, string> = {
  // Squat motion — uploaded and verified working
  squat: "https://v3b.fal.media/files/b/0a95126f/SOWpfQMWCkddexA1SwFp5__users_e72db2bb-567c-4ca9-8c2a-17e00854da58_generated_4538a065-6614-4381-9f9d-d0fa81cf0c40_generated_video.mp4",
};

// Fallback CDN URLs for the pre-recorded Panther System videos (used when motion generation fails)
// These are the 18 Panther System videos already integrated into the app
const PANTHER_FALLBACK_VIDEOS: Record<string, string> = {
  squat: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis-squat.mp4",
  sprint: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis-sprint-stance.mp4",
  highknees: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis-high-knees.mp4",
  lunge: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis-lunge-stretch.mp4",
  combat: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis-combat-stance.mp4",
  strength: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis-strength-montage.mp4",
  walk: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis-walk-forward.mp4",
  flex: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis-idle-flex.mp4",
  kick: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis-run-kick-flex.mp4",
  roar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis-roar.mp4",
  stomp: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis-power-pose.mp4",
  circuit: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis-squat-lunge-flex.mp4",
  runkick: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis-run-kick-flex.mp4",
  snarl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis-snarl.mp4",
  martialarts: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis-martial-arts.mp4",
  idle: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis_idle.mp4",
};

/**
 * Picks the best motion type based on keywords in the Panther System response text.
 */
export function pickMotionForResponse(responseText: string): string {
  const text = responseText.toLowerCase();

  if (/squat|leg day|quad|glute|lower body/.test(text)) return "squat";
  if (/sprint|cardio|run|hiit|interval|fast/.test(text)) return "sprint";
  if (/jump|high knee|explosive|plyometric/.test(text)) return "highknees";
  if (/lunge|stretch|mobility|flexibility|hip/.test(text)) return "lunge";
  if (/fight|combat|kick|punch|martial|strike/.test(text)) return "combat";
  if (/deadlift|bench|lift|barbell|strength|heavy/.test(text)) return "strength";
  if (/walk|warm.?up|begin|start|cool.?down/.test(text)) return "walk";
  if (/flex|pose|show|muscle|bicep|arm/.test(text)) return "flex";
  if (/kick|karate|roundhouse|side kick/.test(text)) return "kick";
  if (/roar|fire|let.?s go|hype|pump|energy|beast/.test(text)) return "roar";
  if (/stomp|power|dominate|crush|destroy/.test(text)) return "stomp";
  if (/circuit|full.?body|combo|total/.test(text)) return "circuit";
  if (/motivation|push|grind|hustle|never stop/.test(text)) return "runkick";
  if (/snarl|growl|fierce|aggressive/.test(text)) return "snarl";
  if (/martial|karate|taekwondo|judo|mma/.test(text)) return "martialarts";

  // Default: pick randomly from high-energy options
  const defaults = ["roar", "stomp", "flex", "walk", "snarl"];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export interface MotionGenerationResult {
  success: boolean;
  videoUrl?: string;
  motionType?: string;
  error?: string;
  fallbackVideoUrl?: string;
  /** true if the video was AI-generated (Kling), false if it's a pre-recorded fallback */
  isGenerated?: boolean;
}

/**
 * Uploads a video from a URL to fal.ai storage so it can be used as a motion reference.
 * This is needed because the CDN videos are not publicly accessible by fal.ai's servers.
 */
async function uploadVideoToFal(videoUrl: string, falApiKey: string): Promise<string | null> {
  try {
    // Download the video
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      console.error("[Motion] Failed to download video:", videoUrl, videoResponse.status);
      return null;
    }
    const videoBuffer = await videoResponse.arrayBuffer();

    // Upload to fal.ai storage
    const formData = new FormData();
    const blob = new Blob([videoBuffer], { type: "video/mp4" });
    formData.append("file", blob, "motion_reference.mp4");

    const uploadResponse = await fetch("https://rest.alpha.fal.ai/storage/upload", {
      method: "POST",
      headers: { Authorization: `Key ${falApiKey}` },
      body: formData,
    });

    if (!uploadResponse.ok) {
      console.error("[Motion] Failed to upload to fal.ai:", await uploadResponse.text());
      return null;
    }

    const uploadData = await uploadResponse.json() as { url?: string; file_url?: string };
    return uploadData.url || uploadData.file_url || null;
  } catch (error) {
    console.error("[Motion] Upload error:", error);
    return null;
  }
}

/**
 * Generates a new Panther System movement video using Kling AI Motion Control via fal.ai.
 * Submits the job to the fal.ai queue and polls for completion.
 *
 * The function uses pre-uploaded fal.ai storage URLs when available, falling back to
 * uploading CDN videos on-the-fly if needed.
 *
 * @param responseText - The Panther System AI response text (used to pick the right motion)
 * @returns A result object with the generated video URL or an error
 */
export async function generatePantherMotion(
  responseText: string
): Promise<MotionGenerationResult> {
  // Support both FAL_KEY (new) and FAL_API_KEY (legacy) env var names
  const falApiKey = process.env.FAL_KEY || process.env.FAL_API_KEY;

  const motionType = pickMotionForResponse(responseText);
  const fallbackVideoUrl = PANTHER_FALLBACK_VIDEOS[motionType] || PANTHER_FALLBACK_VIDEOS.idle;

  if (!falApiKey) {
    console.warn("[Motion] FAL_KEY not configured — using fallback video");
    return {
      success: false,
      error: "FAL_KEY not configured",
      motionType,
      fallbackVideoUrl,
      isGenerated: false,
    };
  }

  // Use pre-uploaded fal.ai URL if available, otherwise use the squat as default
  const motionVideoUrl = MOTION_REFERENCES_FAL[motionType] || MOTION_REFERENCES_FAL.squat;

  try {
    console.log(`[Motion] Generating Panther System motion: type=${motionType}`);

    // Submit job to fal.ai queue
    const submitResponse = await fetch(
      "https://queue.fal.run/fal-ai/kling-video/v3/standard/motion-control",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${falApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: PANTHER_CHARACTER_IMAGE,
          video_url: motionVideoUrl,
          character_orientation: "video",
          duration: "5",
          cfg_scale: 0.5,
        }),
      }
    );

    if (!submitResponse.ok) {
      const errText = await submitResponse.text();
      console.error("[Motion] fal.ai submit error:", errText);
      return {
        success: false,
        error: errText,
        motionType,
        fallbackVideoUrl,
        isGenerated: false,
      };
    }

    const submitData = await submitResponse.json() as { request_id: string; status: string };
    const requestId = submitData.request_id;

    if (!requestId) {
      return {
        success: false,
        error: "No request_id returned from fal.ai",
        motionType,
        fallbackVideoUrl,
        isGenerated: false,
      };
    }

    console.log(`[Motion] Submitted to fal.ai, request_id=${requestId}`);

    // Poll for completion (max 120 seconds, every 5 seconds)
    const statusUrl = `https://queue.fal.run/fal-ai/kling-video/requests/${requestId}/status`;

    for (let attempt = 0; attempt < 24; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const statusResponse = await fetch(statusUrl, {
        headers: { Authorization: `Key ${falApiKey}` },
      });

      if (!statusResponse.ok) continue;

      const statusData = await statusResponse.json() as { status: string };
      console.log(`[Motion] Poll ${attempt + 1}: status=${statusData.status}`);

      if (statusData.status === "COMPLETED") {
        // The result is embedded in the status response for COMPLETED requests
        // Also try fetching the response_url directly
        const resultResponse = await fetch(
          `https://queue.fal.run/fal-ai/kling-video/requests/${requestId}`,
          { headers: { Authorization: `Key ${falApiKey}` } }
        );

        if (!resultResponse.ok) {
          return {
            success: false,
            error: "Failed to fetch result",
            motionType,
            fallbackVideoUrl,
            isGenerated: false,
          };
        }

        const resultData = await resultResponse.json() as {
          video?: { url: string };
          output?: { video?: { url: string }; video_url?: string };
        };

        // Extract video URL from various possible response shapes
        const generatedVideoUrl =
          resultData.video?.url ||
          resultData.output?.video?.url ||
          resultData.output?.video_url;

        if (generatedVideoUrl) {
          console.log(`[Motion] SUCCESS! Generated video: ${generatedVideoUrl}`);
          return {
            success: true,
            videoUrl: generatedVideoUrl,
            motionType,
            fallbackVideoUrl,
            isGenerated: true,
          };
        }

        // COMPLETED but no video URL found — return fallback
        console.warn("[Motion] COMPLETED but no video URL in result:", JSON.stringify(resultData));
        return {
          success: false,
          error: "No video URL in completed result",
          motionType,
          fallbackVideoUrl,
          isGenerated: false,
        };
      }

      if (statusData.status === "FAILED") {
        console.error("[Motion] Generation failed on fal.ai");
        return {
          success: false,
          error: "Generation failed on fal.ai",
          motionType,
          fallbackVideoUrl,
          isGenerated: false,
        };
      }
    }

    // Timeout — return fallback
    console.warn("[Motion] Generation timed out after 120 seconds");
    return {
      success: false,
      error: "Generation timed out after 120 seconds",
      motionType,
      fallbackVideoUrl,
      isGenerated: false,
    };
  } catch (error) {
    console.error("[Motion] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      motionType,
      fallbackVideoUrl,
      isGenerated: false,
    };
  }
}
