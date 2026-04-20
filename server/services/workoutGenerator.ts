/**
 * Panther Brain — Workout Generator Service
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */

import { EXERCISE_DB } from "../../shared/panther-library";

export interface WorkoutUser {
  goal: "fat_loss" | "muscle_gain" | "athletic_performance" | "mobility";
  level: "beginner" | "intermediate" | "advanced" | "athlete";
  equipment: string[];
  age?: number;
}

export interface GeneratedExercise {
  id: string;
  name: string;
  pattern: string;
  sets: number;
  reps: string;
  rest: number; // seconds
  pantherCue: string;
  videoPrompt: string;
}

export interface GeneratedWorkout {
  goal: string;
  level: string;
  structure: string[];
  exercises: GeneratedExercise[];
  estimatedDuration: number; // minutes
  weeklySplit: string[];
}

// ── Goal templates ─────────────────────────────────────────────────────────────
const GOAL_TEMPLATES = {
  fat_loss: {
    structure: ["full_body", "conditioning", "core"],
    repRange: "12-20",
    rest: 35,
    patterns: ["squat", "hinge", "push", "pull", "locomotion"],
  },
  muscle_gain: {
    structure: ["upper", "lower"],
    repRange: "6-12",
    rest: 75,
    patterns: ["squat", "hinge", "push", "pull"],
  },
  athletic_performance: {
    structure: ["power", "agility", "strength"],
    repRange: "3-8",
    rest: 105,
    patterns: ["squat", "hinge", "locomotion", "rotation", "stability"],
  },
  mobility: {
    structure: ["full_body"],
    repRange: "8-12",
    rest: 30,
    patterns: ["hinge", "rotation", "stability", "lunge"],
  },
};

const WEEKLY_SPLITS = {
  beginner:     ["full_body", "rest", "full_body", "rest", "full_body", "rest", "rest"],
  intermediate: ["upper", "lower", "rest", "full_body", "rest", "conditioning", "rest"],
  advanced:     ["push", "pull", "legs", "conditioning", "upper", "lower", "rest"],
  athlete:      ["power", "strength", "agility", "conditioning", "power", "strength", "rest"],
};

// ── Selection logic ────────────────────────────────────────────────────────────
function matchesEquipment(exercise: any, equipment: string[]): boolean {
  if (!exercise.equipment || exercise.equipment.length === 0) return true;
  return exercise.equipment.some((e: string) =>
    equipment.includes(e) || e === "bodyweight"
  );
}

function matchesDifficulty(exercise: any, level: string): boolean {
  const map: Record<string, string[]> = {
    beginner:     ["beginner"],
    intermediate: ["beginner", "beginner_intermediate", "intermediate"],
    advanced:     ["intermediate", "advanced"],
    athlete:      ["advanced", "athlete"],
  };
  return map[level]?.includes(exercise.difficulty) ?? true;
}

function applyAgeScaling(exercise: any, age?: number): string {
  if (!age || !exercise.age_scaling) return exercise.volume?.reps ?? "10-12";
  if (age < 18) return exercise.age_scaling.youth ?? exercise.volume?.reps ?? "10-12";
  if (age >= 55) return exercise.age_scaling.senior ?? exercise.volume?.reps ?? "10-12";
  return exercise.age_scaling.adult ?? exercise.volume?.reps ?? "10-12";
}

// ── Main generator ─────────────────────────────────────────────────────────────
export function generateWorkout(user: WorkoutUser): GeneratedWorkout {
  const template = GOAL_TEMPLATES[user.goal] ?? GOAL_TEMPLATES.fat_loss;
  const split = WEEKLY_SPLITS[user.level] ?? WEEKLY_SPLITS.beginner;

  // Filter exercises by pattern, equipment, difficulty
  const pool = EXERCISE_DB.filter(ex =>
    template.patterns.includes(ex.pattern) &&
    matchesEquipment(ex, user.equipment.length ? user.equipment : ["bodyweight"]) &&
    matchesDifficulty(ex, user.level)
  );

  // Pick up to 6 exercises, one per pattern where possible
  const selected: typeof pool = [];
  const usedPatterns = new Set<string>();
  for (const pattern of template.patterns) {
    const candidates = pool.filter(e => e.pattern === pattern && !usedPatterns.has(e.pattern));
    if (candidates.length) {
      selected.push(candidates[Math.floor(Math.random() * candidates.length)]);
      usedPatterns.add(pattern);
    }
    if (selected.length >= 6) break;
  }

  // Add explosive movement for advanced
  if (user.level === "advanced" || user.level === "athlete") {
    const explosive = EXERCISE_DB.find(e => e.tags?.includes("explosive") && !selected.includes(e));
    if (explosive) selected.push(explosive);
  }

  const exercises: GeneratedExercise[] = selected.map(ex => ({
    id: ex.id,
    name: ex.name,
    pattern: ex.pattern,
    sets: parseInt(ex.volume?.sets?.split("-")[0] ?? "3"),
    reps: applyAgeScaling(ex, user.age) || template.repRange,
    rest: template.rest,
    pantherCue: ex.panther_mode?.cue ?? "Execute with precision.",
    videoPrompt: ex.video_prompt ?? `${ex.name} demonstration, cinematic dark gym lighting`,
  }));

  const estimatedDuration = exercises.reduce((sum, e) => {
    const avgReps = 12;
    const timePerSet = (avgReps * 3) + e.rest;
    return sum + (e.sets * timePerSet) / 60;
  }, 5); // 5 min warmup

  return {
    goal: user.goal,
    level: user.level,
    structure: template.structure,
    exercises,
    estimatedDuration: Math.round(estimatedDuration),
    weeklySplit: split,
  };
}
