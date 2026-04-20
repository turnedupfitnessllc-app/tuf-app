/**
 * Panther Brain — Exercise Model
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */

export interface PantherMode {
  intent: string;
  cue: string;
}

export interface AgeScaling {
  youth?: string;
  adult?: string;
  senior?: string;
}

export interface Volume {
  sets: string;
  reps: string;
}

export interface PantherExercise {
  id: string;
  name: string;
  pattern: "squat" | "hinge" | "push" | "pull" | "lunge" | "rotation" | "locomotion" | "stability";
  difficulty: "beginner" | "beginner_intermediate" | "intermediate" | "advanced" | "athlete";
  equipment: string[];
  primary_muscles: string[];
  secondary_muscles?: string[];
  volume: Volume;
  tempo?: string;
  duration?: string;
  age_scaling?: AgeScaling;
  progressions?: string[];
  regressions?: string[];
  panther_mode: PantherMode;
  video_prompt: string;
  tags: string[];
}
