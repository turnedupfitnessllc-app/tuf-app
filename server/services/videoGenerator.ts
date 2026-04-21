/**
 * Panther Brain — Video Generator Service
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 *
 * Video Pipeline:
 *   1. User selects workout
 *   2. Panther Brain selects exercises
 *   3. video_prompt sent to AI generator
 *   4. Video returned + cached
 *   5. Served in workout player
 */

import { PANTHER_AI_VOICE_RULES as PANTHER_AI, EXERCISE_DATABASE as EXERCISE_DB } from "../../shared/panther-library";

export interface VideoScript {
  exercise_id: string;
  exercise_name: string;
  scene_1: string;
  scene_2: string;
  scene_3: string;
  scene_4: string;
  voiceover: {
    start: string;
    during: string;
    finish: string;
  };
  full_prompt: string;
  cached_url?: string;
}

// In-memory cache (replace with DB/S3 in production)
const videoCache = new Map<string, string>();

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateVideoScript(exerciseId: string): VideoScript {
  const exercise = EXERCISE_DB.find(e => e.id === exerciseId);
  if (!exercise) {
    throw new Error(`Exercise not found: ${exerciseId}`);
  }

  const voiceover = {
    start:  pickRandom(PANTHER_AI.voice_lines.start),
    during: pickRandom(PANTHER_AI.voice_lines.during),
    finish: pickRandom(PANTHER_AI.voice_lines.finish),
  };

  const script: VideoScript = {
    exercise_id: exercise.id,
    exercise_name: exercise.name,
    scene_1: `Panther appears in dark gym — low angle shot, ${exercise.name} setup position, dramatic shadows, neon accent lighting`,
    scene_2: `Slow demonstration of ${exercise.name} — perfect form, controlled tempo ${exercise.tempo ?? "2-1-2"}, cinematic slow motion`,
    scene_3: `Common mistakes highlighted — ${exercise.primary_muscles?.join(", ")} activation errors, red overlay on compensation patterns`,
    scene_4: `Explosive final rep — maximum power output, ${exercise.panther_mode?.intent ?? "full_effort"}, cinematic finish`,
    voiceover,
    full_prompt: `Cinematic fitness video of ${exercise.name}. Style: dark, neon, high-performance athlete. Focus: perfect form demonstration. ${exercise.video_prompt ?? ""}`,
    cached_url: videoCache.get(exerciseId),
  };

  return script;
}

export async function generateExerciseVideo(exercise: { id: string; name: string; video_prompt?: string }) {
  // Check cache first
  if (videoCache.has(exercise.id)) {
    return { video_url: videoCache.get(exercise.id)!, prompt_used: "", cached: true };
  }

  const prompt = `
    Cinematic fitness video of ${exercise.name}.
    Style: dark, neon, high-performance athlete.
    Focus: perfect form demonstration.
    ${exercise.video_prompt ?? ""}
  `.trim();

  // In production: call FAL/Runway/Sora API here
  // const response = await fal.run("fal-ai/video-generation", { input: { prompt } });
  // const video_url = response.video.url;

  // For now return a placeholder — wire to real AI video API when ready
  const video_url = `https://placeholder.video/${exercise.id}`;
  videoCache.set(exercise.id, video_url);

  return { video_url, prompt_used: prompt, cached: false };
}
