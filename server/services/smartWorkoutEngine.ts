/**
 * TUF — Smart Workout Engine v2.0
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 *
 * Features:
 *  - Excludes exercises from last 3 workout sessions
 *  - Fatigue gate: blocks muscles with fatigue >= 7 (relaxes to 9 as fallback)
 *  - Scores exercises by goal + compound/isolation tags
 *  - Shuffles within top 2× scored pool for variety
 *  - Muscle conflict guard: no same primary muscle back-to-back
 *  - Progressive overload: suggests weight based on last performance
 *  - Time-based fatigue recovery (full recovery in 48 hrs)
 *  - Corrective injection into cooldown from user dysfunction profile
 */

import { EXERCISE_DATABASE } from "../../shared/panther-library";
import type { Exercise } from "../../shared/panther-library";
import { getSessions, getUser } from "../db";
import { getProtocol } from "../exerciseLibrary";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SmartWorkoutInput {
  userId: string;
  level: "initiate" | "intermediate" | "advanced" | "athlete";
  goal: "strength" | "hypertrophy" | "endurance" | "explosive" | "fat_loss" | "mobility";
  muscles: string[];          // target muscle groups e.g. ["shoulders", "biceps"]
  duration: number;           // minutes
  equipment: string[];        // e.g. ["dumbbell", "bodyweight"]
  age?: number;
}

export interface UserState {
  fatigue: Record<string, number>;          // muscle → fatigue 0–10
  performance: Record<string, {
    last_weight: number;
    last_reps: number;
    progression_level: number;
    last_performed: string;
  }>;
  lastWorkoutDate?: string;
}

export interface SmartExercise {
  exercise_id: string;
  name: string;
  sets: number;
  reps: string;
  rest: number;             // seconds
  tempo: string;
  recommended_weight?: number;
  progression_level?: number;
  pantherCue: string;
  primaryMuscles: string[];
  tags: string[];
}

export interface SmartWorkout {
  type: "full" | "recovery";
  level: string;
  goal: string;
  duration: number;
  warmup: SmartExercise[];
  mainBlock: SmartExercise[];
  cooldown: SmartExercise[];
  message?: string;
}

// ─── Level mapping ─────────────────────────────────────────────────────────────

const LEVEL_MAP: Record<string, string[]> = {
  initiate:     ["beginner"],
  intermediate: ["beginner", "intermediate"],
  advanced:     ["intermediate", "advanced"],
  athlete:      ["advanced", "athlete"],
};

// ─── Goal config ───────────────────────────────────────────────────────────────

const GOAL_CONFIG: Record<string, { sets: number; reps: string; rest: number; step: number }> = {
  strength:    { sets: 4, reps: "4-6",   rest: 180, step: 10 },
  hypertrophy: { sets: 4, reps: "8-12",  rest: 60,  step: 5  },
  endurance:   { sets: 3, reps: "15-20", rest: 30,  step: 2.5 },
  explosive:   { sets: 5, reps: "3-5",   rest: 120, step: 10 },
  fat_loss:    { sets: 3, reps: "12-20", rest: 35,  step: 2.5 },
  mobility:    { sets: 2, reps: "8-12",  rest: 30,  step: 0  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function filterRecentExercises(exercises: Exercise[], history: { exercises: string[] }[]): Exercise[] {
  const recentIds = new Set(
    history.slice(-3).flatMap(w => w.exercises)
  );
  return exercises.filter(ex => !recentIds.has(ex.id));
}

function recoverFatigue(fatigue: Record<string, number>, lastWorkoutDate?: string): Record<string, number> {
  if (!lastWorkoutDate) return fatigue;
  const hoursSince = (Date.now() - new Date(lastWorkoutDate).getTime()) / 3_600_000;
  const recoveryRate = Math.min(hoursSince / 48, 1); // full recovery in 48 hrs
  const updated: Record<string, number> = {};
  Object.keys(fatigue).forEach(muscle => {
    updated[muscle] = Math.max(0, Math.round(fatigue[muscle] * (1 - recoveryRate)));
  });
  return updated;
}

function scoreExercise(ex: Exercise, goal: string): number {
  let score = 0;
  if (ex.tags.includes(goal)) score += 3;
  if (ex.tags.includes("compound")) score += 2;
  if (ex.tags.includes("strength")) score += goal === "strength" ? 2 : 0;
  if (ex.tags.includes("isolation")) score += 1;
  if (ex.tags.includes("control")) score += 1;
  return score;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function applyProgression(
  ex: Exercise,
  performance: UserState["performance"],
  goal: string
): SmartExercise {
  const config = GOAL_CONFIG[goal] ?? GOAL_CONFIG.hypertrophy;
  const perf = performance[ex.id];

  let recommendedWeight: number | undefined;
  let progressionLevel = 0;

  if (perf) {
    const { last_weight, last_reps, progression_level } = perf;
    const repRangeTop = parseInt(config.reps.split("-")[1] ?? config.reps);
    const repRangeBottom = parseInt(config.reps.split("-")[0]);

    if (last_reps >= repRangeTop) {
      recommendedWeight = last_weight + config.step;
      progressionLevel = progression_level + 1;
    } else if (last_reps < repRangeBottom) {
      recommendedWeight = Math.max(0, last_weight - config.step);
      progressionLevel = Math.max(0, progression_level - 1);
    } else {
      recommendedWeight = last_weight;
      progressionLevel = progression_level;
    }
  }

  return {
    exercise_id: ex.id,
    name: ex.name,
    sets: config.sets,
    reps: config.reps,
    rest: config.rest,
    tempo: ex.tempo ?? "2-1-2",
    recommended_weight: recommendedWeight,
    progression_level: progressionLevel,
    pantherCue: ex.panther_mode?.cue ?? "Execute with precision.",
    primaryMuscles: ex.primary_muscles ?? [],
    tags: ex.tags ?? [],
  };
}

function selectWithMuscleGuard(pool: Exercise[], count: number): Exercise[] {
  const selected: Exercise[] = [];
  const recentMuscles: string[] = [];

  for (const ex of pool) {
    const conflict = (ex.primary_muscles ?? []).some(m =>
      recentMuscles.slice(-2).includes(m)
    );
    if (!conflict) {
      selected.push(ex);
      recentMuscles.push(...(ex.primary_muscles ?? []));
    }
    if (selected.length >= count) break;
  }
  return selected;
}

// ─── Update fatigue after workout ─────────────────────────────────────────────

export function updateFatigue(
  currentFatigue: Record<string, number>,
  workout: SmartExercise[]
): Record<string, number> {
  const updated = { ...currentFatigue };
  workout.forEach(ex => {
    const cost = ex.tags.includes("compound") ? 3
               : ex.tags.includes("isolation") ? 2 : 1;
    ex.primaryMuscles.forEach(m => {
      updated[m] = Math.min(10, (updated[m] ?? 0) + cost);
    });
  });
  return updated;
}

// ─── Main engine ───────────────────────────────────────────────────────────────

export function smartWorkoutGenerator(
  userState: UserState,
  input: Omit<SmartWorkoutInput, "userId">
): SmartWorkout {
  const { level, goal, muscles, duration, equipment } = input;
  const config = GOAL_CONFIG[goal] ?? GOAL_CONFIG.hypertrophy;
  const allowedDifficulties = LEVEL_MAP[level] ?? ["beginner"];

  // Recover fatigue based on time since last workout
  const recoveredFatigue = recoverFatigue(userState.fatigue, userState.lastWorkoutDate);

  // 1. Filter by difficulty
  let filtered = EXERCISE_DATABASE.filter(ex =>
    allowedDifficulties.includes(ex.difficulty)
  );

  // 2. Remove recently used exercises
  const history = (userState as any).history ?? [];
  filtered = filterRecentExercises(filtered, history);

  // 3. Fatigue gate — every primary muscle must be below 7
  filtered = filtered.filter(ex =>
    (ex.primary_muscles ?? []).every(m => (recoveredFatigue[m] ?? 0) < 7)
  );

  // 4. Filter by target muscle group
  filtered = filtered.filter(ex =>
    (ex.primary_muscles ?? []).some(m => muscles.includes(m)) ||
    (ex.tags ?? []).some(t => muscles.includes(t))
  );

  // 5. Filter by equipment
  if (equipment?.length) {
    filtered = filtered.filter(ex =>
      !ex.equipment?.length ||
      ex.equipment.some(eq => equipment.includes(eq) || eq === "bodyweight")
    );
  }

  // Safety fallback — relax fatigue gate to 9 if pool too small
  if (filtered.length < 3) {
    filtered = EXERCISE_DATABASE.filter(ex =>
      allowedDifficulties.includes(ex.difficulty) &&
      ((ex.primary_muscles ?? []).some(m => muscles.includes(m)) ||
       (ex.tags ?? []).some(t => muscles.includes(t))) &&
      (ex.primary_muscles ?? []).every(m => (recoveredFatigue[m] ?? 0) < 9)
    );
  }

  // Last resort — return recovery workout
  if (filtered.length === 0) {
    return {
      type: "recovery",
      level,
      goal,
      duration,
      warmup: [],
      mainBlock: [],
      cooldown: [],
      message: "Your muscles need rest. Here's a corrective recovery session instead.",
    };
  }

  // 6. Score exercises
  const scored = filtered
    .map(ex => ({ ...ex, _score: scoreExercise(ex, goal) }))
    .sort((a, b) => b._score - a._score);

  // 7. Determine exercise count from duration
  const exerciseCount = duration <= 30 ? 4 : duration <= 45 ? 6 : 8;

  // 8. Shuffle within top 2× pool
  const pool = shuffleArray(scored.slice(0, exerciseCount * 2));

  // 9. Apply muscle conflict guard
  const selected = selectWithMuscleGuard(pool, exerciseCount);

  // 10. Apply progression
  const mainBlock = selected.map(ex => applyProgression(ex, userState.performance, goal));

  // 11. Build warmup (2 corrective exercises matching target muscles)
  const warmupExercises = EXERCISE_DATABASE.filter(ex =>
    ex.difficulty === "beginner" &&
    ex.tags.includes("rehab") &&
    (ex.primary_muscles ?? []).some(m => muscles.includes(m))
  ).slice(0, 2).map(ex => applyProgression(ex, {}, "mobility"));

  // 12. Build cooldown from corrective library
  // Determine relevant dysfunction from target muscles
  const dysfunctionMap: Record<string, "UCS" | "LCS" | "Knee" | "Shoulder"> = {
    shoulders: "UCS", chest: "UCS", neck: "UCS", upper_back: "UCS",
    glutes: "LCS", hips: "LCS", lower_back: "LCS", quads: "LCS",
    hamstrings: "Knee", calves: "Knee", knees: "Knee",
    biceps: "Shoulder", rotator_cuff: "Shoulder",
  };
  const primaryDysfunction = muscles.map(m => dysfunctionMap[m]).find(Boolean) ?? "UCS";
  const cooldownPool = getProtocol(primaryDysfunction);
  const cooldownExercises: SmartExercise[] = cooldownPool
    .filter(ex => ex.phase === "Lengthen" || ex.phase === "Inhibit")
    .slice(0, 3)
    .map(ex => ({
      exercise_id: ex.name.toLowerCase().replace(/\s+/g, "_"),
      name: ex.name,
      sets: ex.sets,
      reps: ex.repsOrDuration,
      rest: 20,
      tempo: "hold",
      pantherCue: ex.cue,
      primaryMuscles: [],
      tags: ["corrective", "cooldown"],
    }));

  return {
    type: "full",
    level,
    goal,
    duration,
    warmup: warmupExercises,
    mainBlock,
    cooldown: cooldownExercises,
  };
}

// ─── Server-side wrapper (loads user state from DB) ────────────────────────────

export async function generateSmartWorkout(input: SmartWorkoutInput): Promise<SmartWorkout> {
  const { userId, ...workoutInput } = input;

  // Load user from DB
  const user = await getUser(userId);
  const sessions = await getSessions(userId, 10);

  // Build history array from sessions
  const history = sessions.map(s => ({
    date: new Date(s.date).toISOString().split("T")[0],
    exercises: s.exercises_completed ?? [],
  }));

  // Build user state (fatigue and performance stored in user extended fields)
  const userAny = user as any;
  const userState: UserState = {
    fatigue: userAny?.fatigue ?? {},
    performance: userAny?.performance ?? {},
    lastWorkoutDate: sessions[0]
      ? new Date(sessions[0].date).toISOString().split("T")[0]
      : undefined,
    ...(({ history }) => ({ history }))({ history }),
  };

  return smartWorkoutGenerator(userState, workoutInput);
}
