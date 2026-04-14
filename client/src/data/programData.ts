/**
 * THE PANTHER SYSTEM — 30-Day Program Data
 * © Turned Up Fitness LLC — All Rights Reserved
 *
 * Phase Structure:
 *   Control   — Days  1–7   (foundation, pain-free movement)
 *   Stability — Days  8–14  (joint stability, balance)
 *   Strength  — Days 15–21  (load progression, power base)
 *   Explosion — Days 22–29  (athletic output, speed)
 *   Evolution — Day   30    (full integration test)
 *
 * Rep Scaling:
 *   Cub    → 70% of base reps
 *   Hunter → 100% (base)
 *   Apex   → 130% of base reps
 */

export type Level = "Cub" | "Hunter" | "Apex";
export type Phase = "Control" | "Stability" | "Strength" | "Explosion" | "Evolution";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;       // base reps (Hunter level)
  duration?: number;  // seconds, if time-based instead of reps
  rest: number;       // seconds between sets
  cue: string;        // voice coaching cue
  focus: string;      // muscle/movement focus
  media: {
    animation_id: string;
    thumbnail: string; // placeholder key
  };
}

export interface WorkoutDay {
  day: number;
  phase: Phase;
  title: string;
  focus: string;
  warmup_minutes: number;
  exercises: Exercise[];
}

// ─── EXERCISE LIBRARY ────────────────────────────────────────────────────────

const EXERCISES = {
  // CONTROL PHASE
  diaphragmatic_breathing: {
    id: "diaphragmatic_breathing",
    name: "Diaphragmatic Breathing",
    sets: 3, reps: 10, rest: 30,
    cue: "Breathe into your belly. Ribs stay still. This is your reset.",
    focus: "Nervous system, core activation",
    media: { animation_id: "breathing_diaphragm", thumbnail: "breathing" },
  },
  dead_bug: {
    id: "dead_bug",
    name: "Dead Bug",
    sets: 3, reps: 8, rest: 45,
    cue: "Keep your lower back pressed flat. Slow and controlled — no arching.",
    focus: "Deep core, lumbar stability",
    media: { animation_id: "dead_bug", thumbnail: "dead_bug" },
  },
  cat_cow: {
    id: "cat_cow",
    name: "Cat-Cow Mobility",
    sets: 2, reps: 10, rest: 30,
    cue: "Move through your full spine. Breathe out on the cat, in on the cow.",
    focus: "Spinal mobility, thoracic extension",
    media: { animation_id: "cat_cow", thumbnail: "cat_cow" },
  },
  glute_bridge: {
    id: "glute_bridge",
    name: "Glute Bridge",
    sets: 3, reps: 12, rest: 45,
    cue: "Drive through your heels. Squeeze at the top for two seconds.",
    focus: "Glutes, posterior chain activation",
    media: { animation_id: "glute_bridge", thumbnail: "glute_bridge" },
  },
  wall_slide: {
    id: "wall_slide",
    name: "Wall Slide",
    sets: 3, reps: 10, rest: 30,
    cue: "Keep your lower back against the wall the entire time. Slow and smooth.",
    focus: "Shoulder mobility, scapular control",
    media: { animation_id: "wall_slide", thumbnail: "wall_slide" },
  },
  hip_90_90: {
    id: "hip_90_90",
    name: "Hip 90/90 Stretch",
    sets: 2, reps: 8, duration: 30, rest: 30,
    cue: "Sit tall. Rotate into the stretch — don't force it.",
    focus: "Hip internal/external rotation",
    media: { animation_id: "hip_90_90", thumbnail: "hip_90_90" },
  },
  bird_dog: {
    id: "bird_dog",
    name: "Bird Dog",
    sets: 3, reps: 10, rest: 45,
    cue: "Extend opposite arm and leg. Hold two seconds. Don't rotate your hips.",
    focus: "Core stability, anti-rotation",
    media: { animation_id: "bird_dog", thumbnail: "bird_dog" },
  },
  thoracic_rotation: {
    id: "thoracic_rotation",
    name: "Thoracic Rotation",
    sets: 2, reps: 10, rest: 30,
    cue: "Rotate from your mid-back — not your lower back. Keep hips still.",
    focus: "Thoracic spine mobility",
    media: { animation_id: "thoracic_rotation", thumbnail: "thoracic_rotation" },
  },
  // STABILITY PHASE
  single_leg_deadlift: {
    id: "single_leg_deadlift",
    name: "Single-Leg Deadlift (Bodyweight)",
    sets: 3, reps: 8, rest: 60,
    cue: "Hinge at the hip. Keep your back flat. Feel the hamstring load.",
    focus: "Hip hinge, single-leg stability",
    media: { animation_id: "single_leg_rdl", thumbnail: "single_leg_rdl" },
  },
  side_plank: {
    id: "side_plank",
    name: "Side Plank",
    sets: 3, reps: 1, duration: 30, rest: 45,
    cue: "Stack your feet. Drive your hip up. Don't let it sag.",
    focus: "Lateral core, hip abductors",
    media: { animation_id: "side_plank", thumbnail: "side_plank" },
  },
  pallof_press: {
    id: "pallof_press",
    name: "Pallof Press (Band)",
    sets: 3, reps: 10, rest: 45,
    cue: "Press out and hold. Resist the rotation. This is anti-rotation strength.",
    focus: "Core anti-rotation, obliques",
    media: { animation_id: "pallof_press", thumbnail: "pallof_press" },
  },
  single_leg_glute_bridge: {
    id: "single_leg_glute_bridge",
    name: "Single-Leg Glute Bridge",
    sets: 3, reps: 10, rest: 45,
    cue: "Drive through one heel. Keep your hips level — don't let one side drop.",
    focus: "Glute med, hip stability",
    media: { animation_id: "single_leg_glute_bridge", thumbnail: "slgb" },
  },
  copenhagen_plank: {
    id: "copenhagen_plank",
    name: "Copenhagen Plank",
    sets: 3, reps: 1, duration: 20, rest: 60,
    cue: "Top leg drives the work. Keep your hips stacked and spine neutral.",
    focus: "Hip adductors, lateral stability",
    media: { animation_id: "copenhagen_plank", thumbnail: "copenhagen" },
  },
  y_t_w: {
    id: "y_t_w",
    name: "Y-T-W (Prone)",
    sets: 3, reps: 10, rest: 45,
    cue: "Lift from your shoulder blades — not your traps. Light and controlled.",
    focus: "Lower trapezius, rotator cuff",
    media: { animation_id: "y_t_w", thumbnail: "y_t_w" },
  },
  step_up: {
    id: "step_up",
    name: "Step-Up",
    sets: 3, reps: 10, rest: 45,
    cue: "Drive through the heel of the top foot. Don't push off the bottom foot.",
    focus: "Quad, glute, single-leg control",
    media: { animation_id: "step_up", thumbnail: "step_up" },
  },
  // STRENGTH PHASE
  goblet_squat: {
    id: "goblet_squat",
    name: "Goblet Squat",
    sets: 4, reps: 10, rest: 60,
    cue: "Chest up, knees track over toes. Sit into it — don't just bend your knees.",
    focus: "Quads, glutes, thoracic extension",
    media: { animation_id: "goblet_squat", thumbnail: "goblet_squat" },
  },
  romanian_deadlift: {
    id: "romanian_deadlift",
    name: "Romanian Deadlift (RDL)",
    sets: 4, reps: 10, rest: 60,
    cue: "Push your hips back — not down. Feel the hamstrings load before you return.",
    focus: "Hamstrings, glutes, hip hinge pattern",
    media: { animation_id: "rdl", thumbnail: "rdl" },
  },
  push_up: {
    id: "push_up",
    name: "Push-Up",
    sets: 4, reps: 12, rest: 60,
    cue: "Body is one plank. Lower your chest — not your hips. Explode up.",
    focus: "Chest, triceps, anterior core",
    media: { animation_id: "push_up", thumbnail: "push_up" },
  },
  inverted_row: {
    id: "inverted_row",
    name: "Inverted Row",
    sets: 4, reps: 10, rest: 60,
    cue: "Pull your chest to the bar. Squeeze your shoulder blades together at the top.",
    focus: "Upper back, biceps, scapular retraction",
    media: { animation_id: "inverted_row", thumbnail: "inverted_row" },
  },
  split_squat: {
    id: "split_squat",
    name: "Bulgarian Split Squat",
    sets: 3, reps: 8, rest: 75,
    cue: "Front shin stays vertical. Drop your back knee straight down.",
    focus: "Quads, glutes, hip flexor stretch",
    media: { animation_id: "split_squat", thumbnail: "split_squat" },
  },
  hip_thrust: {
    id: "hip_thrust",
    name: "Hip Thrust",
    sets: 4, reps: 12, rest: 60,
    cue: "Drive through your heels. Full hip extension at the top — squeeze hard.",
    focus: "Glutes, hamstrings, hip extension",
    media: { animation_id: "hip_thrust", thumbnail: "hip_thrust" },
  },
  // EXPLOSION PHASE
  box_jump: {
    id: "box_jump",
    name: "Box Jump",
    sets: 4, reps: 6, rest: 90,
    cue: "Load your hips, explode up. Land soft — absorb the impact through your hips.",
    focus: "Power, reactive strength, landing mechanics",
    media: { animation_id: "box_jump", thumbnail: "box_jump" },
  },
  sprint_drill: {
    id: "sprint_drill",
    name: "Sprint Drill (A-Skip)",
    sets: 4, reps: 1, duration: 20, rest: 60,
    cue: "Drive your knee up. Arm swing matches your legs. Stay on the balls of your feet.",
    focus: "Sprint mechanics, hip flexor power",
    media: { animation_id: "a_skip", thumbnail: "sprint" },
  },
  med_ball_slam: {
    id: "med_ball_slam",
    name: "Med Ball Slam",
    sets: 4, reps: 8, rest: 60,
    cue: "Reach overhead — full extension. Slam with your whole body. Catch low.",
    focus: "Full body power, core stiffness",
    media: { animation_id: "med_ball_slam", thumbnail: "med_ball_slam" },
  },
  lateral_bound: {
    id: "lateral_bound",
    name: "Lateral Bound",
    sets: 4, reps: 8, rest: 60,
    cue: "Push off one leg, land on the other. Stick the landing for one second.",
    focus: "Lateral power, single-leg landing",
    media: { animation_id: "lateral_bound", thumbnail: "lateral_bound" },
  },
  broad_jump: {
    id: "broad_jump",
    name: "Broad Jump",
    sets: 4, reps: 5, rest: 90,
    cue: "Load your hips, swing your arms, explode forward. Land balanced — stick it.",
    focus: "Horizontal power, triple extension",
    media: { animation_id: "broad_jump", thumbnail: "broad_jump" },
  },
  rotational_throw: {
    id: "rotational_throw",
    name: "Rotational Med Ball Throw",
    sets: 3, reps: 8, rest: 60,
    cue: "Rotate from your hips — not your arms. Hips lead, shoulders follow.",
    focus: "Rotational power, athletic transfer",
    media: { animation_id: "rotational_throw", thumbnail: "rotational_throw" },
  },
  // EVOLUTION PHASE
  panther_complex: {
    id: "panther_complex",
    name: "Panther Complex",
    sets: 3, reps: 5, rest: 90,
    cue: "This is everything you've built. RDL → Row → Clean → Press. Move with intention.",
    focus: "Full body integration, movement quality",
    media: { animation_id: "panther_complex", thumbnail: "panther_complex" },
  },
  flow_sequence: {
    id: "flow_sequence",
    name: "Panther Flow Sequence",
    sets: 2, reps: 1, duration: 120, rest: 60,
    cue: "Move through the sequence without stopping. This is your evolution.",
    focus: "Movement integration, body awareness",
    media: { animation_id: "flow_sequence", thumbnail: "flow" },
  },
} as const;

type ExerciseKey = keyof typeof EXERCISES;

function ex(key: ExerciseKey): Exercise {
  return EXERCISES[key] as Exercise;
}

// ─── 30-DAY PROGRAM ──────────────────────────────────────────────────────────

export const PROGRAM_DATA: { days: WorkoutDay[] } = {
  days: [
    // ── PHASE 1: CONTROL (Days 1–7) ─────────────────────────────────────────
    {
      day: 1, phase: "Control",
      title: "Foundation Reset",
      focus: "Breathing + Core Activation",
      warmup_minutes: 5,
      exercises: [ex("diaphragmatic_breathing"), ex("cat_cow"), ex("dead_bug"), ex("glute_bridge")],
    },
    {
      day: 2, phase: "Control",
      title: "Spinal Mobility",
      focus: "Thoracic + Hip Mobility",
      warmup_minutes: 5,
      exercises: [ex("cat_cow"), ex("thoracic_rotation"), ex("hip_90_90"), ex("bird_dog")],
    },
    {
      day: 3, phase: "Control",
      title: "Shoulder Reset",
      focus: "Scapular Control + Shoulder Mobility",
      warmup_minutes: 5,
      exercises: [ex("wall_slide"), ex("y_t_w"), ex("dead_bug"), ex("glute_bridge")],
    },
    {
      day: 4, phase: "Control",
      title: "Active Recovery",
      focus: "Full Body Mobility Flow",
      warmup_minutes: 5,
      exercises: [ex("diaphragmatic_breathing"), ex("cat_cow"), ex("hip_90_90"), ex("thoracic_rotation")],
    },
    {
      day: 5, phase: "Control",
      title: "Core Foundation",
      focus: "Anti-Extension + Anti-Rotation",
      warmup_minutes: 5,
      exercises: [ex("dead_bug"), ex("bird_dog"), ex("glute_bridge"), ex("wall_slide")],
    },
    {
      day: 6, phase: "Control",
      title: "Hip Mobility Day",
      focus: "Hip Capsule + Posterior Chain",
      warmup_minutes: 5,
      exercises: [ex("hip_90_90"), ex("glute_bridge"), ex("bird_dog"), ex("cat_cow")],
    },
    {
      day: 7, phase: "Control",
      title: "Control Benchmark",
      focus: "Phase 1 Integration Test",
      warmup_minutes: 5,
      exercises: [ex("diaphragmatic_breathing"), ex("dead_bug"), ex("bird_dog"), ex("glute_bridge"), ex("wall_slide")],
    },

    // ── PHASE 2: STABILITY (Days 8–14) ──────────────────────────────────────
    {
      day: 8, phase: "Stability",
      title: "Single-Leg Foundation",
      focus: "Hip Stability + Balance",
      warmup_minutes: 5,
      exercises: [ex("single_leg_glute_bridge"), ex("single_leg_deadlift"), ex("bird_dog"), ex("side_plank")],
    },
    {
      day: 9, phase: "Stability",
      title: "Anti-Rotation Day",
      focus: "Core Anti-Rotation + Lateral Stability",
      warmup_minutes: 5,
      exercises: [ex("pallof_press"), ex("side_plank"), ex("copenhagen_plank"), ex("dead_bug")],
    },
    {
      day: 10, phase: "Stability",
      title: "Shoulder Stability",
      focus: "Rotator Cuff + Scapular Stability",
      warmup_minutes: 5,
      exercises: [ex("y_t_w"), ex("wall_slide"), ex("pallof_press"), ex("bird_dog")],
    },
    {
      day: 11, phase: "Stability",
      title: "Lower Body Stability",
      focus: "Knee + Hip Stability",
      warmup_minutes: 5,
      exercises: [ex("step_up"), ex("single_leg_deadlift"), ex("single_leg_glute_bridge"), ex("side_plank")],
    },
    {
      day: 12, phase: "Stability",
      title: "Active Recovery",
      focus: "Mobility + Light Stability",
      warmup_minutes: 5,
      exercises: [ex("hip_90_90"), ex("thoracic_rotation"), ex("cat_cow"), ex("diaphragmatic_breathing")],
    },
    {
      day: 13, phase: "Stability",
      title: "Full Stability Circuit",
      focus: "All Planes of Stability",
      warmup_minutes: 5,
      exercises: [ex("pallof_press"), ex("single_leg_deadlift"), ex("copenhagen_plank"), ex("y_t_w"), ex("step_up")],
    },
    {
      day: 14, phase: "Stability",
      title: "Stability Benchmark",
      focus: "Phase 2 Integration Test",
      warmup_minutes: 5,
      exercises: [ex("single_leg_glute_bridge"), ex("side_plank"), ex("pallof_press"), ex("single_leg_deadlift"), ex("step_up")],
    },

    // ── PHASE 3: STRENGTH (Days 15–21) ──────────────────────────────────────
    {
      day: 15, phase: "Strength",
      title: "Lower Body Strength",
      focus: "Squat + Hip Hinge Pattern",
      warmup_minutes: 7,
      exercises: [ex("goblet_squat"), ex("romanian_deadlift"), ex("single_leg_glute_bridge"), ex("bird_dog")],
    },
    {
      day: 16, phase: "Strength",
      title: "Upper Body Strength",
      focus: "Push + Pull Balance",
      warmup_minutes: 7,
      exercises: [ex("push_up"), ex("inverted_row"), ex("y_t_w"), ex("dead_bug")],
    },
    {
      day: 17, phase: "Strength",
      title: "Posterior Chain",
      focus: "Glutes + Hamstrings + Back",
      warmup_minutes: 7,
      exercises: [ex("hip_thrust"), ex("romanian_deadlift"), ex("inverted_row"), ex("single_leg_deadlift")],
    },
    {
      day: 18, phase: "Strength",
      title: "Active Recovery",
      focus: "Mobility + Tissue Quality",
      warmup_minutes: 5,
      exercises: [ex("cat_cow"), ex("hip_90_90"), ex("thoracic_rotation"), ex("diaphragmatic_breathing")],
    },
    {
      day: 19, phase: "Strength",
      title: "Single-Leg Strength",
      focus: "Unilateral Lower Body",
      warmup_minutes: 7,
      exercises: [ex("split_squat"), ex("step_up"), ex("single_leg_deadlift"), ex("hip_thrust")],
    },
    {
      day: 20, phase: "Strength",
      title: "Full Body Strength",
      focus: "Compound Movement Integration",
      warmup_minutes: 7,
      exercises: [ex("goblet_squat"), ex("push_up"), ex("romanian_deadlift"), ex("inverted_row"), ex("hip_thrust")],
    },
    {
      day: 21, phase: "Strength",
      title: "Strength Benchmark",
      focus: "Phase 3 Integration Test",
      warmup_minutes: 7,
      exercises: [ex("goblet_squat"), ex("hip_thrust"), ex("push_up"), ex("inverted_row"), ex("split_squat")],
    },

    // ── PHASE 4: EXPLOSION (Days 22–29) ─────────────────────────────────────
    {
      day: 22, phase: "Explosion",
      title: "Power Introduction",
      focus: "Reactive Strength + Landing Mechanics",
      warmup_minutes: 10,
      exercises: [ex("box_jump"), ex("broad_jump"), ex("goblet_squat"), ex("bird_dog")],
    },
    {
      day: 23, phase: "Explosion",
      title: "Lateral Power",
      focus: "Lateral Explosiveness",
      warmup_minutes: 10,
      exercises: [ex("lateral_bound"), ex("side_plank"), ex("step_up"), ex("single_leg_deadlift")],
    },
    {
      day: 24, phase: "Explosion",
      title: "Upper Body Power",
      focus: "Rotational + Pushing Power",
      warmup_minutes: 10,
      exercises: [ex("med_ball_slam"), ex("rotational_throw"), ex("push_up"), ex("inverted_row")],
    },
    {
      day: 25, phase: "Explosion",
      title: "Sprint Mechanics",
      focus: "Speed + Acceleration",
      warmup_minutes: 10,
      exercises: [ex("sprint_drill"), ex("broad_jump"), ex("hip_thrust"), ex("single_leg_glute_bridge")],
    },
    {
      day: 26, phase: "Explosion",
      title: "Active Recovery",
      focus: "Mobility + CNS Recovery",
      warmup_minutes: 5,
      exercises: [ex("diaphragmatic_breathing"), ex("hip_90_90"), ex("cat_cow"), ex("thoracic_rotation")],
    },
    {
      day: 27, phase: "Explosion",
      title: "Full Power Circuit",
      focus: "All Power Vectors",
      warmup_minutes: 10,
      exercises: [ex("box_jump"), ex("lateral_bound"), ex("med_ball_slam"), ex("sprint_drill"), ex("broad_jump")],
    },
    {
      day: 28, phase: "Explosion",
      title: "Athletic Integration",
      focus: "Sport-Specific Power",
      warmup_minutes: 10,
      exercises: [ex("rotational_throw"), ex("box_jump"), ex("split_squat"), ex("inverted_row"), ex("hip_thrust")],
    },
    {
      day: 29, phase: "Explosion",
      title: "Explosion Benchmark",
      focus: "Phase 4 Integration Test",
      warmup_minutes: 10,
      exercises: [ex("box_jump"), ex("broad_jump"), ex("lateral_bound"), ex("med_ball_slam"), ex("sprint_drill")],
    },

    // ── PHASE 5: EVOLUTION (Day 30) ──────────────────────────────────────────
    {
      day: 30, phase: "Evolution",
      title: "Evolution Day",
      focus: "Full System Integration — You Are the Panther",
      warmup_minutes: 10,
      exercises: [ex("panther_complex"), ex("flow_sequence"), ex("box_jump"), ex("rotational_throw"), ex("diaphragmatic_breathing")],
    },
  ],
};

// ─── WORKOUT ENGINE ───────────────────────────────────────────────────────────

export function getPhaseForDay(day: number): Phase {
  if (day <= 7) return "Control";
  if (day <= 14) return "Stability";
  if (day <= 21) return "Strength";
  if (day <= 29) return "Explosion";
  return "Evolution";
}

export function scaleWorkout(dayData: WorkoutDay, level: Level): WorkoutDay {
  const multiplier = level === "Cub" ? 0.7 : level === "Apex" ? 1.3 : 1.0;
  return {
    ...dayData,
    exercises: dayData.exercises.map((ex) => ({
      ...ex,
      reps: ex.duration ? ex.reps : Math.max(1, Math.floor(ex.reps * multiplier)),
    })),
  };
}

export function getTodayWorkout(currentDay: number, level: Level): WorkoutDay | null {
  const dayData = PROGRAM_DATA.days.find((d) => d.day === currentDay);
  if (!dayData) return null;
  return scaleWorkout(dayData, level);
}

export function completeDay(user: {
  current_day: number;
  completed_days: number[];
  streak: number;
  last_completed_date?: string;
}) {
  const today = new Date().toISOString().split("T")[0];

  if (user.completed_days.includes(user.current_day)) {
    return user; // idempotent
  }

  const updatedCompletedDays = [...user.completed_days, user.current_day];

  let newStreak = user.streak || 0;
  if (user.last_completed_date) {
    const lastDate = new Date(user.last_completed_date);
    const diffDays = Math.floor(
      (new Date(today).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) newStreak += 1;
    else if (diffDays > 1) newStreak = 1;
  } else {
    newStreak = 1;
  }

  const nextDay = Math.min(user.current_day + 1, 30);
  const phase = getPhaseForDay(nextDay);

  return {
    ...user,
    completed_days: updatedCompletedDays,
    current_day: nextDay,
    phase,
    streak: newStreak,
    last_completed_date: today,
  };
}

export const PHASE_COLORS: Record<Phase, string> = {
  Control: "#4488FF",
  Stability: "#44CC88",
  Strength: "#C8973A",
  Explosion: "#FF6600",
  Evolution: "#AA44FF",
};

export const PHASE_RANGES: Record<Phase, [number, number]> = {
  Control: [1, 7],
  Stability: [8, 14],
  Strength: [15, 21],
  Explosion: [22, 29],
  Evolution: [30, 30],
};
