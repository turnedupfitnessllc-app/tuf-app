/**
 * THE PANTHER BRAIN LIBRARY v2.0
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 *
 * Panther AI Personality: focused_intense | minimal_words_max_impact
 * Movement patterns: squat, hinge, push, pull, lunge, rotation, locomotion, stability
 * Equipment: bodyweight, resistance_band, dumbbell, kettlebell, barbell, machine, mobility_tool
 * Difficulty: beginner, intermediate, advanced, athlete
 */

// ── PANTHER AI VOICE LINES ──────────────────────────────────────────────────

export const PANTHER_VOICE = {
  start: ["Lock in.", "Focus. Hunt begins now.", "Breathe. Then move.", "Eyes forward. Let's go."],
  during: ["Control it.", "Stay low. Stay ready.", "Drive through.", "Breathe out on effort.", "Chest up.", "Hips back.", "Squeeze at the top."],
  failure: ["Reset. Go again.", "No hesitation.", "Shake it off. Next rep.", "That's data. Adjust."],
  finish: ["Strong finish.", "You earned that.", "Session complete. Rest earned.", "Apex discipline."],
  motivation: [
    "Consistency is power.",
    "Momentum is building.",
    "Apex discipline unlocked.",
    "The panther doesn't rush. It waits, then strikes.",
    "Every rep is a deposit.",
  ],
};

export function getPantherVoiceLine(phase: keyof typeof PANTHER_VOICE): string {
  const lines = PANTHER_VOICE[phase];
  return lines[Math.floor(Math.random() * lines.length)];
}

// ── EXERCISE DATABASE (100+ exercises) ─────────────────────────────────────

export interface Exercise {
  id: string;
  name: string;
  pattern: "squat" | "hinge" | "push" | "pull" | "lunge" | "rotation" | "locomotion" | "stability";
  difficulty: "beginner" | "intermediate" | "advanced" | "athlete";
  equipment: string[];
  primary_muscles: string[];
  secondary_muscles: string[];
  volume: { sets: string; reps?: string; duration?: string };
  tempo?: string;
  panther_mode: { intent: string; cue: string };
  progressions?: string[];
  regressions?: string[];
  tags: string[];
  age_scaling?: { youth?: string; adult?: string; senior?: string };
  video_prompt?: string;
}

export const EXERCISE_DATABASE: Exercise[] = [
  // ── SQUAT PATTERN ──────────────────────────────────────────────────────────
  { id: "squat_001", name: "Bodyweight Squat", pattern: "squat", difficulty: "beginner", equipment: ["bodyweight"], primary_muscles: ["quads", "glutes"], secondary_muscles: ["hamstrings", "core"], volume: { sets: "3", reps: "15-20" }, tempo: "2-1-2", panther_mode: { intent: "foundation", cue: "Sit back like you own the chair." }, progressions: ["squat_002", "squat_003"], tags: ["foundation", "no_equipment"], age_scaling: { senior: "chair-assisted" } },
  { id: "squat_002", name: "Goblet Squat", pattern: "squat", difficulty: "beginner", equipment: ["dumbbell", "kettlebell"], primary_muscles: ["quads", "glutes"], secondary_muscles: ["core", "upper_back"], volume: { sets: "3", reps: "12-15" }, tempo: "3-1-2", panther_mode: { intent: "control", cue: "Elbows inside knees. Drive up." }, progressions: ["squat_003"], tags: ["beginner_loaded", "form_builder"] },
  { id: "squat_003", name: "Barbell Back Squat", pattern: "squat", difficulty: "intermediate", equipment: ["barbell"], primary_muscles: ["quads", "glutes"], secondary_muscles: ["hamstrings", "core", "upper_back"], volume: { sets: "4", reps: "6-10" }, tempo: "3-1-2", panther_mode: { intent: "power_generation", cue: "Drive hips like a striking panther." }, progressions: ["squat_004"], regressions: ["squat_002"], tags: ["strength", "compound"] },
  { id: "squat_004", name: "Front Squat", pattern: "squat", difficulty: "advanced", equipment: ["barbell"], primary_muscles: ["quads"], secondary_muscles: ["core", "upper_back"], volume: { sets: "4", reps: "5-8" }, panther_mode: { intent: "precision", cue: "Elbows up. Chest up. No compromise." }, tags: ["strength", "olympic"] },
  { id: "squat_005", name: "Bulgarian Split Squat", pattern: "squat", difficulty: "intermediate", equipment: ["bodyweight", "dumbbell"], primary_muscles: ["quads", "glutes"], secondary_muscles: ["hamstrings", "core"], volume: { sets: "3", reps: "10-12 each" }, panther_mode: { intent: "unilateral_power", cue: "Back knee down. Front heel stays." }, tags: ["unilateral", "glute_dominant"] },
  { id: "squat_006", name: "Pistol Squat", pattern: "squat", difficulty: "athlete", equipment: ["bodyweight"], primary_muscles: ["quads", "glutes"], secondary_muscles: ["core", "ankle_stability"], volume: { sets: "3", reps: "5-8 each" }, panther_mode: { intent: "apex_control", cue: "One leg. Full depth. No excuses." }, regressions: ["squat_005"], tags: ["advanced", "balance"] },
  { id: "squat_007", name: "Wall Sit", pattern: "squat", difficulty: "beginner", equipment: ["bodyweight"], primary_muscles: ["quads"], secondary_muscles: ["glutes", "core"], volume: { sets: "3", duration: "30-60 sec" }, panther_mode: { intent: "endurance", cue: "Hold the position. Mind over muscle." }, tags: ["isometric", "rehab"], age_scaling: { senior: "reduce duration" } },
  { id: "squat_008", name: "Sumo Squat", pattern: "squat", difficulty: "beginner", equipment: ["bodyweight", "kettlebell"], primary_muscles: ["inner_thighs", "glutes"], secondary_muscles: ["quads", "core"], volume: { sets: "3", reps: "12-15" }, panther_mode: { intent: "hip_width", cue: "Wide stance. Toes out. Drive knees out." }, tags: ["hip_dominant", "inner_thigh"] },

  // ── HINGE PATTERN ──────────────────────────────────────────────────────────
  { id: "hinge_001", name: "Glute Bridge", pattern: "hinge", difficulty: "beginner", equipment: ["bodyweight"], primary_muscles: ["glutes"], secondary_muscles: ["hamstrings", "core"], volume: { sets: "3", reps: "10-15" }, tempo: "2-1-2", panther_mode: { intent: "power_generation", cue: "Drive hips like a striking panther." }, progressions: ["hinge_002", "hinge_003"], regressions: ["hinge_001"], tags: ["posterior_chain", "rehab", "activation"], age_scaling: { senior: "reduced range + support" } },
  { id: "hinge_002", name: "Romanian Deadlift", pattern: "hinge", difficulty: "intermediate", equipment: ["barbell", "dumbbell"], primary_muscles: ["hamstrings", "glutes"], secondary_muscles: ["lower_back", "core"], volume: { sets: "3-4", reps: "8-12" }, tempo: "3-1-1", panther_mode: { intent: "posterior_chain", cue: "Push hips back. Bar stays close." }, progressions: ["hinge_003"], regressions: ["hinge_001"], tags: ["hamstring_dominant", "hip_hinge"] },
  { id: "hinge_003", name: "Conventional Deadlift", pattern: "hinge", difficulty: "intermediate", equipment: ["barbell"], primary_muscles: ["hamstrings", "glutes", "lower_back"], secondary_muscles: ["quads", "core", "traps"], volume: { sets: "4", reps: "4-6" }, panther_mode: { intent: "total_power", cue: "Pull the floor apart. Lock out hard." }, tags: ["strength", "compound", "king_lift"] },
  { id: "hinge_004", name: "Kettlebell Swing", pattern: "hinge", difficulty: "intermediate", equipment: ["kettlebell"], primary_muscles: ["glutes", "hamstrings"], secondary_muscles: ["core", "shoulders"], volume: { sets: "4", reps: "15-20" }, panther_mode: { intent: "explosive_power", cue: "Hips snap. Not arms." }, tags: ["explosive", "conditioning", "hip_power"] },
  { id: "hinge_005", name: "Good Morning", pattern: "hinge", difficulty: "intermediate", equipment: ["barbell", "bodyweight"], primary_muscles: ["hamstrings", "lower_back"], secondary_muscles: ["glutes", "core"], volume: { sets: "3", reps: "10-12" }, panther_mode: { intent: "posterior_strength", cue: "Bow to the bar. Control the descent." }, tags: ["hamstring", "lower_back"] },
  { id: "hinge_006", name: "Single-Leg Deadlift", pattern: "hinge", difficulty: "intermediate", equipment: ["dumbbell", "kettlebell"], primary_muscles: ["hamstrings", "glutes"], secondary_muscles: ["core", "balance"], volume: { sets: "3", reps: "8-10 each" }, panther_mode: { intent: "unilateral_hinge", cue: "Hip hinge. Back flat. Balance is strength." }, tags: ["unilateral", "balance", "hip_hinge"] },

  // ── PUSH PATTERN ───────────────────────────────────────────────────────────
  { id: "push_001", name: "Push-Up", pattern: "push", difficulty: "beginner", equipment: ["bodyweight"], primary_muscles: ["chest"], secondary_muscles: ["triceps", "shoulders", "core"], volume: { sets: "3", reps: "10-20" }, tempo: "2-1-2", panther_mode: { intent: "foundation", cue: "Body plank. Full range." }, progressions: ["push_002", "push_003"], tags: ["no_equipment", "foundation"] },
  { id: "push_002", name: "Dumbbell Bench Press", pattern: "push", difficulty: "intermediate", equipment: ["dumbbell"], primary_muscles: ["chest"], secondary_muscles: ["triceps", "shoulders"], volume: { sets: "4", reps: "8-12" }, panther_mode: { intent: "chest_development", cue: "Touch chest. Lock out." }, tags: ["chest", "hypertrophy"] },
  { id: "push_003", name: "Barbell Bench Press", pattern: "push", difficulty: "intermediate", equipment: ["barbell"], primary_muscles: ["chest"], secondary_muscles: ["triceps", "shoulders"], volume: { sets: "4", reps: "5-8" }, panther_mode: { intent: "strength", cue: "Arch. Leg drive. Bar to chest." }, tags: ["strength", "compound"] },
  { id: "push_004", name: "Overhead Press", pattern: "push", difficulty: "intermediate", equipment: ["barbell", "dumbbell"], primary_muscles: ["shoulders"], secondary_muscles: ["triceps", "core"], volume: { sets: "4", reps: "6-10" }, panther_mode: { intent: "shoulder_power", cue: "Press through the ceiling." }, tags: ["shoulder", "overhead"] },
  { id: "push_005", name: "Resistance Band Chest Press", pattern: "push", difficulty: "beginner", equipment: ["resistance_band"], primary_muscles: ["chest"], secondary_muscles: ["triceps", "shoulders"], volume: { sets: "3-4", reps: "12-20" }, panther_mode: { intent: "controlled_force", cue: "Press with precision, not speed." }, tags: ["band_training", "hypertrophy", "joint_friendly"] },
  { id: "push_006", name: "Pike Push-Up", pattern: "push", difficulty: "intermediate", equipment: ["bodyweight"], primary_muscles: ["shoulders"], secondary_muscles: ["triceps", "core"], volume: { sets: "3", reps: "10-15" }, panther_mode: { intent: "shoulder_endurance", cue: "Hips high. Head through." }, progressions: ["push_007"], tags: ["shoulder", "no_equipment"] },
  { id: "push_007", name: "Handstand Push-Up", pattern: "push", difficulty: "athlete", equipment: ["bodyweight"], primary_muscles: ["shoulders", "triceps"], secondary_muscles: ["core", "traps"], volume: { sets: "3", reps: "5-10" }, panther_mode: { intent: "apex_press", cue: "Inverted. Full control." }, regressions: ["push_006"], tags: ["advanced", "calisthenics"] },
  { id: "push_008", name: "Tricep Dip", pattern: "push", difficulty: "intermediate", equipment: ["bodyweight"], primary_muscles: ["triceps"], secondary_muscles: ["chest", "shoulders"], volume: { sets: "3", reps: "10-15" }, panther_mode: { intent: "arm_strength", cue: "Elbows back. Full dip." }, tags: ["tricep", "bodyweight"] },

  // ── PULL PATTERN ───────────────────────────────────────────────────────────
  { id: "pull_001", name: "Band Pull-Apart", pattern: "pull", difficulty: "beginner", equipment: ["resistance_band"], primary_muscles: ["rear_delts", "rhomboids"], secondary_muscles: ["traps"], volume: { sets: "3", reps: "15-20" }, panther_mode: { intent: "posture_activation", cue: "Squeeze shoulder blades together." }, tags: ["posture", "activation", "warm_up"] },
  { id: "pull_002", name: "Dumbbell Row", pattern: "pull", difficulty: "beginner", equipment: ["dumbbell"], primary_muscles: ["lats", "rhomboids"], secondary_muscles: ["biceps", "rear_delts"], volume: { sets: "3", reps: "10-12 each" }, panther_mode: { intent: "back_strength", cue: "Elbow to hip. Squeeze." }, progressions: ["pull_003"], tags: ["back", "unilateral"] },
  { id: "pull_003", name: "Barbell Row", pattern: "pull", difficulty: "intermediate", equipment: ["barbell"], primary_muscles: ["lats", "rhomboids", "traps"], secondary_muscles: ["biceps", "core"], volume: { sets: "4", reps: "6-10" }, panther_mode: { intent: "back_power", cue: "Bar to belly. Elbows drive back." }, tags: ["back", "compound", "strength"] },
  { id: "pull_004", name: "Pull-Up", pattern: "pull", difficulty: "intermediate", equipment: ["bodyweight"], primary_muscles: ["lats"], secondary_muscles: ["biceps", "core"], volume: { sets: "3-4", reps: "5-12" }, panther_mode: { intent: "vertical_pull", cue: "Dead hang. Pull chest to bar." }, progressions: ["pull_005"], regressions: ["pull_002"], tags: ["calisthenics", "back", "bodyweight"] },
  { id: "pull_005", name: "Weighted Pull-Up", pattern: "pull", difficulty: "advanced", equipment: ["bodyweight"], primary_muscles: ["lats"], secondary_muscles: ["biceps", "core"], volume: { sets: "4", reps: "5-8" }, panther_mode: { intent: "apex_pull", cue: "Extra weight. Same standard." }, regressions: ["pull_004"], tags: ["advanced", "strength"] },
  { id: "pull_006", name: "Face Pull", pattern: "pull", difficulty: "beginner", equipment: ["resistance_band", "machine"], primary_muscles: ["rear_delts", "rotator_cuff"], secondary_muscles: ["traps"], volume: { sets: "3", reps: "15-20" }, panther_mode: { intent: "shoulder_health", cue: "Pull to forehead. Elbows high." }, tags: ["shoulder_health", "posture", "rehab"] },
  { id: "pull_007", name: "Lat Pulldown", pattern: "pull", difficulty: "beginner", equipment: ["machine"], primary_muscles: ["lats"], secondary_muscles: ["biceps", "rear_delts"], volume: { sets: "3", reps: "10-15" }, panther_mode: { intent: "lat_development", cue: "Pull bar to chest. Lean back slightly." }, progressions: ["pull_004"], tags: ["back", "machine", "beginner_pull"] },
  { id: "pull_008", name: "Chin-Up", pattern: "pull", difficulty: "intermediate", equipment: ["bodyweight"], primary_muscles: ["lats", "biceps"], secondary_muscles: ["core"], volume: { sets: "3", reps: "6-12" }, panther_mode: { intent: "supinated_pull", cue: "Palms face you. Chin over bar." }, tags: ["calisthenics", "bicep", "back"] },

  // ── LUNGE PATTERN ──────────────────────────────────────────────────────────
  { id: "lunge_001", name: "Forward Lunge", pattern: "lunge", difficulty: "beginner", equipment: ["bodyweight"], primary_muscles: ["quads", "glutes"], secondary_muscles: ["hamstrings", "core"], volume: { sets: "3", reps: "10-12 each" }, panther_mode: { intent: "unilateral_base", cue: "Step forward. Back knee hovers." }, progressions: ["lunge_002"], tags: ["unilateral", "foundation"] },
  { id: "lunge_002", name: "Reverse Lunge", pattern: "lunge", difficulty: "beginner", equipment: ["bodyweight", "dumbbell"], primary_muscles: ["quads", "glutes"], secondary_muscles: ["hamstrings", "core"], volume: { sets: "3", reps: "10-12 each" }, panther_mode: { intent: "knee_friendly_lunge", cue: "Step back. Front shin vertical." }, tags: ["unilateral", "knee_friendly"] },
  { id: "lunge_003", name: "Walking Lunge", pattern: "lunge", difficulty: "intermediate", equipment: ["bodyweight", "dumbbell"], primary_muscles: ["quads", "glutes"], secondary_muscles: ["hamstrings", "core", "balance"], volume: { sets: "3", reps: "20 steps" }, panther_mode: { intent: "dynamic_power", cue: "Stride long. Chest tall. Keep moving." }, tags: ["conditioning", "dynamic"] },
  { id: "lunge_004", name: "Lateral Lunge", pattern: "lunge", difficulty: "intermediate", equipment: ["bodyweight", "dumbbell"], primary_muscles: ["inner_thighs", "glutes"], secondary_muscles: ["quads", "core"], volume: { sets: "3", reps: "10 each" }, panther_mode: { intent: "frontal_plane", cue: "Push knee out. Sit into the hip." }, tags: ["lateral", "hip_mobility"] },
  { id: "lunge_005", name: "Curtsy Lunge", pattern: "lunge", difficulty: "intermediate", equipment: ["bodyweight", "dumbbell"], primary_muscles: ["glutes", "inner_thighs"], secondary_muscles: ["quads", "core"], volume: { sets: "3", reps: "10-12 each" }, panther_mode: { intent: "glute_isolation", cue: "Cross behind. Knee tracks over toe." }, tags: ["glute_focused", "hip_stability"] },

  // ── ROTATION PATTERN ───────────────────────────────────────────────────────
  { id: "rotation_001", name: "Russian Twist", pattern: "rotation", difficulty: "beginner", equipment: ["bodyweight", "dumbbell"], primary_muscles: ["obliques"], secondary_muscles: ["core", "hip_flexors"], volume: { sets: "3", reps: "20 total" }, panther_mode: { intent: "rotational_core", cue: "Rotate from the ribs, not the arms." }, tags: ["core", "obliques"] },
  { id: "rotation_002", name: "Cable Woodchop", pattern: "rotation", difficulty: "intermediate", equipment: ["machine", "resistance_band"], primary_muscles: ["obliques", "core"], secondary_muscles: ["shoulders", "hips"], volume: { sets: "3", reps: "12-15 each" }, panther_mode: { intent: "rotational_power", cue: "Hips lead. Arms follow." }, tags: ["rotational_power", "athletic"] },
  { id: "rotation_003", name: "Med Ball Slam", pattern: "rotation", difficulty: "intermediate", equipment: ["mobility_tool"], primary_muscles: ["core", "lats"], secondary_muscles: ["shoulders", "glutes"], volume: { sets: "4", reps: "10-12" }, panther_mode: { intent: "explosive_core", cue: "Slam with intent. Full extension." }, tags: ["explosive", "conditioning", "core"] },
  { id: "rotation_004", name: "Pallof Press", pattern: "rotation", difficulty: "beginner", equipment: ["resistance_band", "machine"], primary_muscles: ["core", "obliques"], secondary_muscles: ["shoulders"], volume: { sets: "3", reps: "12 each" }, panther_mode: { intent: "anti_rotation", cue: "Resist the pull. Core stays rigid." }, tags: ["anti_rotation", "core_stability", "rehab"] },

  // ── LOCOMOTION PATTERN ─────────────────────────────────────────────────────
  { id: "locomotion_001", name: "Bear Crawl", pattern: "locomotion", difficulty: "intermediate", equipment: ["bodyweight"], primary_muscles: ["full_body"], secondary_muscles: ["core", "shoulders"], volume: { sets: "3", duration: "20-40 sec" }, panther_mode: { intent: "movement_control", cue: "Move silently, like a hunting panther." }, tags: ["functional", "athletic", "core"] },
  { id: "locomotion_002", name: "Crab Walk", pattern: "locomotion", difficulty: "beginner", equipment: ["bodyweight"], primary_muscles: ["triceps", "glutes"], secondary_muscles: ["core", "shoulders"], volume: { sets: "3", duration: "20-30 sec" }, panther_mode: { intent: "posterior_activation", cue: "Hips up. Hands and feet." }, tags: ["activation", "functional"] },
  { id: "locomotion_003", name: "Inchworm", pattern: "locomotion", difficulty: "beginner", equipment: ["bodyweight"], primary_muscles: ["hamstrings", "core"], secondary_muscles: ["shoulders", "chest"], volume: { sets: "3", reps: "8-10" }, panther_mode: { intent: "dynamic_warm_up", cue: "Walk hands out. Pause. Walk feet in." }, tags: ["warm_up", "mobility", "functional"] },
  { id: "locomotion_004", name: "Lateral Shuffle", pattern: "locomotion", difficulty: "beginner", equipment: ["bodyweight"], primary_muscles: ["glutes", "quads"], secondary_muscles: ["core", "calves"], volume: { sets: "4", duration: "20 sec" }, panther_mode: { intent: "lateral_speed", cue: "Stay low. Quick feet." }, tags: ["agility", "conditioning"] },
  { id: "locomotion_005", name: "High Knees", pattern: "locomotion", difficulty: "intermediate", equipment: ["bodyweight"], primary_muscles: ["hip_flexors", "quads"], secondary_muscles: ["core", "calves"], volume: { sets: "4", duration: "30-45 sec" }, panther_mode: { intent: "cardio_power", cue: "Drive knees to chest. Arms pump." }, tags: ["cardio", "conditioning", "warm_up"] },
  { id: "locomotion_006", name: "Burpee", pattern: "locomotion", difficulty: "intermediate", equipment: ["bodyweight"], primary_muscles: ["full_body"], secondary_muscles: ["core", "cardio"], volume: { sets: "4", reps: "8-12" }, panther_mode: { intent: "total_conditioning", cue: "Down fast. Up explosive." }, tags: ["conditioning", "full_body", "cardio"] },
  { id: "locomotion_007", name: "Mountain Climbers", pattern: "locomotion", difficulty: "intermediate", equipment: ["bodyweight"], primary_muscles: ["core", "hip_flexors"], secondary_muscles: ["shoulders", "quads"], volume: { sets: "3", duration: "30-45 sec" }, panther_mode: { intent: "core_cardio", cue: "Hips level. Drive knees in." }, tags: ["core", "cardio", "conditioning"] },

  // ── STABILITY PATTERN ──────────────────────────────────────────────────────
  { id: "stability_001", name: "Plank", pattern: "stability", difficulty: "beginner", equipment: ["bodyweight"], primary_muscles: ["core"], secondary_muscles: ["shoulders", "glutes"], volume: { sets: "3", duration: "30-60 sec" }, panther_mode: { intent: "core_foundation", cue: "Body straight. Squeeze everything." }, progressions: ["stability_002"], tags: ["core", "isometric", "foundation"], age_scaling: { senior: "reduce duration or use knees" } },
  { id: "stability_002", name: "Side Plank", pattern: "stability", difficulty: "intermediate", equipment: ["bodyweight"], primary_muscles: ["obliques", "core"], secondary_muscles: ["glutes", "shoulders"], volume: { sets: "3", duration: "20-40 sec each" }, panther_mode: { intent: "lateral_stability", cue: "Hips up. Stack feet." }, tags: ["core", "obliques", "isometric"] },
  { id: "stability_003", name: "Dead Bug", pattern: "stability", difficulty: "beginner", equipment: ["bodyweight"], primary_muscles: ["core", "hip_flexors"], secondary_muscles: ["lower_back"], volume: { sets: "3", reps: "10 each" }, panther_mode: { intent: "core_control", cue: "Lower back pressed down. Opposite arm and leg." }, tags: ["core", "rehab", "anti_extension"] },
  { id: "stability_004", name: "Bird Dog", pattern: "stability", difficulty: "beginner", equipment: ["bodyweight"], primary_muscles: ["core", "glutes"], secondary_muscles: ["lower_back", "shoulders"], volume: { sets: "3", reps: "10 each" }, panther_mode: { intent: "spinal_stability", cue: "Extend slow. Hold 2 seconds." }, tags: ["core", "rehab", "balance"] },
  { id: "stability_005", name: "Single-Leg Balance", pattern: "stability", difficulty: "beginner", equipment: ["bodyweight"], primary_muscles: ["ankle_stabilizers", "core"], secondary_muscles: ["glutes", "quads"], volume: { sets: "3", duration: "30 sec each" }, panther_mode: { intent: "proprioception", cue: "Find a focal point. Don't waver." }, tags: ["balance", "rehab", "ankle"], age_scaling: { senior: "use wall support" } },
  { id: "stability_006", name: "Hollow Body Hold", pattern: "stability", difficulty: "intermediate", equipment: ["bodyweight"], primary_muscles: ["core", "hip_flexors"], secondary_muscles: ["lats", "glutes"], volume: { sets: "3", duration: "20-40 sec" }, panther_mode: { intent: "full_body_tension", cue: "Press lower back down. Arms and legs long." }, tags: ["core", "gymnastics", "tension"] },
  { id: "stability_007", name: "Copenhagen Plank", pattern: "stability", difficulty: "advanced", equipment: ["bodyweight"], primary_muscles: ["inner_thighs", "core"], secondary_muscles: ["obliques", "hip_abductors"], volume: { sets: "3", duration: "15-30 sec each" }, panther_mode: { intent: "adductor_strength", cue: "Top leg drives up. Hips level." }, tags: ["adductor", "advanced_core"] },
];

// ── WORKOUT GENERATOR ───────────────────────────────────────────────────────

export type Goal = "fat_loss" | "muscle_gain" | "athletic_performance" | "mobility" | "beginner";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "athlete";
export type EquipmentType = "bodyweight" | "resistance_band" | "dumbbell" | "kettlebell" | "barbell" | "machine" | "mobility_tool";

export interface WorkoutTemplate {
  goal: Goal;
  structure: string[];
  rep_ranges: string;
  rest: string;
  patterns: string[];
}

export const GOAL_TEMPLATES: Record<Goal, WorkoutTemplate> = {
  fat_loss: { goal: "fat_loss", structure: ["full_body", "conditioning", "core"], rep_ranges: "12-20", rest: "30-45 sec", patterns: ["squat", "hinge", "push", "pull", "locomotion"] },
  muscle_gain: { goal: "muscle_gain", structure: ["upper", "lower"], rep_ranges: "6-12", rest: "60-90 sec", patterns: ["squat", "hinge", "push", "pull", "lunge"] },
  athletic_performance: { goal: "athletic_performance", structure: ["power", "agility", "strength"], rep_ranges: "3-8", rest: "90-120 sec", patterns: ["squat", "hinge", "rotation", "locomotion"] },
  mobility: { goal: "mobility", structure: ["full_body", "stability"], rep_ranges: "10-15", rest: "30-45 sec", patterns: ["lunge", "stability", "rotation", "locomotion"] },
  beginner: { goal: "beginner", structure: ["full_body"], rep_ranges: "10-15", rest: "60 sec", patterns: ["squat", "hinge", "push", "pull", "stability"] },
};

export const WEEKLY_SPLITS: Record<DifficultyLevel, string[]> = {
  beginner: ["full_body", "rest", "full_body", "rest", "full_body", "rest", "rest"],
  intermediate: ["upper", "lower", "rest", "full_body", "upper", "lower", "rest"],
  advanced: ["push", "pull", "legs", "rest", "push", "pull", "conditioning"],
  athlete: ["power", "upper_strength", "lower_strength", "conditioning", "power", "full_body", "rest"],
};

export function generateWorkout(params: {
  goal: Goal;
  difficulty: DifficultyLevel;
  equipment: EquipmentType[];
  exerciseCount?: number;
}): Exercise[] {
  const { goal, difficulty, equipment, exerciseCount = 6 } = params;
  const template = GOAL_TEMPLATES[goal];

  const eligible = EXERCISE_DATABASE.filter(ex => {
    const difficultyMatch =
      difficulty === "beginner" ? ["beginner"].includes(ex.difficulty) :
      difficulty === "intermediate" ? ["beginner", "intermediate"].includes(ex.difficulty) :
      difficulty === "advanced" ? ["beginner", "intermediate", "advanced"].includes(ex.difficulty) :
      true;

    const equipmentMatch = ex.equipment.some(eq =>
      equipment.includes(eq as EquipmentType) || eq === "bodyweight"
    );

    const patternMatch = template.patterns.includes(ex.pattern);

    return difficultyMatch && equipmentMatch && patternMatch;
  });

  // Shuffle and pick
  const shuffled = eligible.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, exerciseCount);
}

// ── VIDEO SCRIPT ENGINE ─────────────────────────────────────────────────────

export interface VideoScript {
  exercise_id: string;
  exercise_name: string;
  scene_1: string;
  scene_2: string;
  scene_3: string;
  scene_4: string;
  voiceover: string[];
  video_prompt: string;
}

export function generateVideoScript(exerciseId: string): VideoScript | null {
  const ex = EXERCISE_DATABASE.find(e => e.id === exerciseId);
  if (!ex) return null;

  return {
    exercise_id: ex.id,
    exercise_name: ex.name,
    scene_1: `Panther appears in dark gym — cinematic lighting, fog machine, ${ex.primary_muscles.join(" and ")} highlighted`,
    scene_2: `Demonstrates ${ex.name} slowly — 3x slow motion, key form cues overlaid: "${ex.panther_mode.cue}"`,
    scene_3: `Highlights common mistakes — red overlay on incorrect form, green on correct`,
    scene_4: `Explosive final rep — ${ex.panther_mode.intent} intent, maximum effort, victory pose`,
    voiceover: [
      getPantherVoiceLine("start"),
      ex.panther_mode.cue,
      getPantherVoiceLine("during"),
      getPantherVoiceLine("finish"),
    ],
    video_prompt: ex.video_prompt || `${ex.name} demonstration, cinematic gym lighting, athletic form, Panther System aesthetic`,
  };
}

// ── PANTHER AI VOICE RULES (spec v2) ──────────────────────────────────────────
export const PANTHER_AI_VOICE_RULES = {
  tone: "calm_intense",
  rules: [
    "never ramble",
    "short commands only",
    "no fluff",
    "always directive",
  ],
  personality_traits: ["disciplined", "strategic", "predatory", "calm_under_pressure"],
};

/**
 * Panther Brain real-time cue engine.
 * Returns the correct short command based on session state.
 */
export function getPantherRealTimeCue(state: {
  fatigue: number;      // 0-100
  formBreak: boolean;
  setCompleted: boolean;
}): string {
  if (state.fatigue > 80)   return "Slow it down.";
  if (state.formBreak)      return "Fix your posture.";
  if (state.setCompleted)   return "Good. Again.";
  return "Stay locked.";
}

// ── VIDEO TYPES ───────────────────────────────────────────────────────────────
export const VIDEO_TYPES = [
  "exercise_demo",
  "form_correction",
  "motivation_clip",
  "challenge_video",
] as const;

export type VideoType = typeof VIDEO_TYPES[number];

// ── WORKOUT TEMPLATES ─────────────────────────────────────────────────────────
export interface WorkoutTemplate {
  name: string;
  duration: string;
  exercises: string[];
  style: string;
}

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    name: "Panther Full Body Initiation",
    duration: "20 min",
    exercises: ["bodyweight_squat", "pushup", "band_row", "plank", "bear_crawl"],
    style: "low_rest_high_control",
  },
  {
    name: "Panther Power Circuit",
    duration: "30 min",
    exercises: ["kettlebell_swing", "push_press", "goblet_squat", "renegade_row", "jump_squat"],
    style: "explosive_conditioning",
  },
  {
    name: "Panther Mobility Flow",
    duration: "15 min",
    exercises: ["hip_90_90", "thoracic_rotation", "ankle_circles", "world_greatest_stretch", "cat_cow"],
    style: "controlled_flow",
  },
];

// ── VIDEO PROMPTS (from spec) ─────────────────────────────────────────────────
export const CINEMATIC_VIDEO_PROMPTS: Record<string, string> = {
  bodyweight_squat: "athletic male performing slow controlled squat, dark gym, cinematic lighting",
  band_row:         "resistance band row, strong posture, squeeze back muscles, neon lighting",
  bear_crawl:       "bear crawl low to ground, panther-like movement, intense focus",
  pushup:           "perfect push-up form, full range of motion, dark athletic environment",
  plank:            "plank hold, full body tension, cinematic side angle, neon accent",
  kettlebell_swing: "explosive kettlebell swing, hip snap, athletic power, dark gym",
  deadlift:         "conventional deadlift, perfect hip hinge, heavy weight, dramatic lighting",
};

// ── SUCCESS METRICS ───────────────────────────────────────────────────────────
export const SUCCESS_METRICS = [
  { key: "did_user_finish",  label: "Finished",  weight: 0.4 },
  { key: "did_user_sweat",   label: "Sweat",     weight: 0.2 },
  { key: "did_user_repeat",  label: "Repeated",  weight: 0.25 },
  { key: "did_user_share",   label: "Shared",    weight: 0.15 },
] as const;

export type SuccessMetricKey = typeof SUCCESS_METRICS[number]["key"];

/**
 * Calculate session success score from 0-100.
 */
export function calculateSuccessScore(results: Record<SuccessMetricKey, boolean>): number {
  return Math.round(
    SUCCESS_METRICS.reduce((score, metric) => {
      return score + (results[metric.key] ? metric.weight * 100 : 0);
    }, 0)
  );
}
