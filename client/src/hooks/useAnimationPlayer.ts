/**
 * useAnimationPlayer
 *
 * Three-layer caching strategy:
 *   1. Client-side in-memory cache (animationCache) — instant, no network call
 *   2. Server DB cache — checked on POST /api/animation/generate
 *   3. FAL.ai Kling generation — async, polled via GET /api/animation/:job_id
 *
 * Falls back to FALLBACK_VIDEO_URL if generation fails or times out.
 *
 * Compatible with both React web and React Native patterns.
 * © 2026 Turned Up Fitness LLC | Confidential
 */
import { useState, useEffect, useRef } from "react";

// ─── Fallback video (panther idle loop) ──────────────────────────────────────
// Shown immediately while generation runs, and permanently on failure.
export const FALLBACK_VIDEO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/panther-hero-splash_c1ad9e37.mp4";

// ─── Client-side in-memory cache ─────────────────────────────────────────────
// Key: `${animationId}__${difficulty}` → CDN video URL
// Persists for the lifetime of the browser session (cleared on page refresh).
const animationCache: Record<string, string> = {};

export type AnimationStatus = "idle" | "loading" | "complete" | "failed";

export interface AnimationPlayerState {
  status: AnimationStatus;
  /** Resolved video URL (generated, cached, or fallback) */
  url: string | null;
  jobId: string | null;
  source: "cache" | "generated" | "fallback" | null;
  error: string | null;
}

const POLL_INTERVAL_MS = 4000;  // poll every 4 seconds
const MAX_POLL_ATTEMPTS = 45;   // 45 × 4s = 3 minutes max

/**
 * Fetch an animation URL for the given animationId + difficulty.
 * Checks client cache first, then server, then generates via FAL.ai.
 *
 * Usage (React web):
 *   const { status, url } = useAnimationPlayer("panther_squat_control", "intermediate");
 *
 * Usage (React Native — same hook, just use `url` in <Video source={{ uri: url }} />):
 *   const { url, status } = useAnimationPlayer(animationId, day.difficulty);
 */
export function useAnimationPlayer(
  animationId: string | null,
  difficulty: "beginner" | "normal" | "intermediate" | "advanced" = "normal",
  enabled = true
): AnimationPlayerState {
  const [state, setState] = useState<AnimationPlayerState>({
    status: "idle",
    url: null,
    jobId: null,
    source: null,
    error: null,
  });

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);
  const jobIdRef = useRef<string | null>(null);

  // Cleanup on unmount or animationId change
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [animationId]);

  useEffect(() => {
    if (!animationId || !enabled) return;

    const cacheKey = `${animationId}__${difficulty}`;

    // ── Layer 1: Client in-memory cache (instant) ─────────────────────────
    if (animationCache[cacheKey]) {
      setState({
        status: "complete",
        url: animationCache[cacheKey],
        jobId: null,
        source: "cache",
        error: null,
      });
      return;
    }

    // ── Start loading (show fallback while waiting) ────────────────────────
    setState({
      status: "loading",
      url: FALLBACK_VIDEO_URL,   // immediate fallback — never a blank screen
      jobId: null,
      source: "fallback",
      error: null,
    });

    attemptsRef.current = 0;
    jobIdRef.current = null;
    if (pollRef.current) clearInterval(pollRef.current);

    // ── Layer 2+3: POST to server (checks DB cache, then generates) ────────
    fetch("/api/animation/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animation_id: animationId, difficulty }),
    })
      .then((r) => r.json())
      .then(
        (data: {
          job_id?: string;
          status?: string;
          url?: string;
          source?: string;
          error?: string;
        }) => {
          if (data.error) {
            // Server error — keep fallback video, mark failed
            setState((prev) => ({
              ...prev,
              status: "failed",
              error: data.error!,
            }));
            return;
          }

          const jobId = data.job_id!;
          jobIdRef.current = jobId;

          // Cache hit on server — done immediately
          if (data.status === "complete" && data.url) {
            animationCache[cacheKey] = data.url;  // store in client cache
            setState({
              status: "complete",
              url: data.url,
              jobId,
              source: "cache",
              error: null,
            });
            return;
          }

          setState((prev) => ({ ...prev, jobId }));

          // ── Poll for completion ──────────────────────────────────────────
          pollRef.current = setInterval(async () => {
            attemptsRef.current += 1;

            if (attemptsRef.current > MAX_POLL_ATTEMPTS) {
              clearInterval(pollRef.current!);
              // Keep fallback video, mark failed
              setState((prev) => ({
                ...prev,
                status: "failed",
                error: "Animation generation timed out",
              }));
              return;
            }

            try {
              const r = await fetch(`/api/animation/${jobIdRef.current}`);
              const job = (await r.json()) as {
                status: string;
                url?: string;
                source?: string;
                error?: string;
              };

              if (job.status === "complete" && job.url) {
                clearInterval(pollRef.current!);
                animationCache[cacheKey] = job.url;  // store in client cache
                setState({
                  status: "complete",
                  url: job.url,
                  jobId: jobIdRef.current,
                  source: "generated",
                  error: null,
                });
              } else if (job.status === "failed") {
                clearInterval(pollRef.current!);
                // Keep fallback video, mark failed
                setState((prev) => ({
                  ...prev,
                  status: "failed",
                  error: job.error || "Generation failed",
                }));
              }
              // else still pending/processing — keep polling
            } catch {
              // Network hiccup — keep polling
            }
          }, POLL_INTERVAL_MS);
        }
      )
      .catch((err: Error) => {
        // Network error — keep fallback video
        setState((prev) => ({
          ...prev,
          status: "failed",
          error: err.message,
        }));
      });
  }, [animationId, difficulty, enabled]);

  return state;
}

/**
 * Standalone async helper for React Native / non-hook contexts.
 * Mirrors the WorkoutScreen pattern: call once, get URL back.
 *
 * const url = await fetchAnimation("panther_squat_control", "intermediate");
 */
export async function fetchAnimation(
  animationId: string,
  difficulty: "beginner" | "normal" | "intermediate" | "advanced" = "normal",
  baseUrl = ""
): Promise<string> {
  const cacheKey = `${animationId}__${difficulty}`;

  // Client cache hit
  if (animationCache[cacheKey]) return animationCache[cacheKey];

  const res = await fetch(`${baseUrl}/api/animation/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ animation_id: animationId, difficulty }),
  });

  const data = (await res.json()) as {
    job_id?: string;
    status?: string;
    url?: string;
    error?: string;
  };

  if (data.error) throw new Error(data.error);

  // Immediate cache hit
  if (data.status === "complete" && data.url) {
    animationCache[cacheKey] = data.url;
    return data.url;
  }

  // Poll until complete
  const jobId = data.job_id!;
  const maxAttempts = 45;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 4000));
    const statusRes = await fetch(`${baseUrl}/api/animation/${jobId}`);
    const job = (await statusRes.json()) as { status: string; url?: string; error?: string };
    if (job.status === "complete" && job.url) {
      animationCache[cacheKey] = job.url;
      return job.url;
    }
    if (job.status === "failed") throw new Error(job.error || "Generation failed");
  }

  throw new Error("Animation generation timed out");
}
