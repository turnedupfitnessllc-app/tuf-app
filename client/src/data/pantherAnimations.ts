/**
 * THE PANTHER SYSTEM — Animation Library v1.0
 * 8 cinematic AI video prompts for the workout player
 * Each animation maps to exercise type / phase context
 * © 2026 Turned Up Fitness LLC | Confidential
 *
 * Usage: getAnimationForExercise(exerciseId) → PantherAnimation
 *        getAnimationForPhase(phase) → PantherAnimation
 */

export interface PantherAnimation {
  key: string;
  label: string;
  prompt: string;
  /** Emoji fallback for when video is not yet generated */
  emoji: string;
  /** CSS gradient for the animated placeholder card */
  gradient: string;
}

// ─── ANIMATION LIBRARY ────────────────────────────────────────────────────────
export const PANTHER_ANIMATIONS: Record<string, PantherAnimation> = {
  panther_idle: {
    key: "panther_idle",
    label: "Panther Idle",
    prompt: "humanoid black panther breathing slowly in dark gym, glowing eyes, cinematic lighting, loopable",
    emoji: "🐆",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #1a0a00 50%, #0a0a0a 100%)",
  },
  panther_squat_control: {
    key: "panther_squat_control",
    label: "Squat Control",
    prompt: "black panther humanoid performing slow controlled squat, 5 second descent, intense focus, cinematic shadows",
    emoji: "🏋️",
    gradient: "linear-gradient(135deg, #0a0a14 0%, #1a0a2a 50%, #0a0a14 100%)",
  },
  panther_pushup_control: {
    key: "panther_pushup_control",
    label: "Push-Up Control",
    prompt: "panther humanoid doing slow push-ups, controlled movement, glowing eyes, dark gym",
    emoji: "💪",
    gradient: "linear-gradient(135deg, #0a0a14 0%, #1a1a00 50%, #0a0a14 100%)",
  },
  panther_plank_hold: {
    key: "panther_plank_hold",
    label: "Plank Hold",
    prompt: "panther humanoid holding plank position, strong core tension, dramatic lighting",
    emoji: "⚡",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #2a1a00 50%, #0a0a0a 100%)",
  },
  panther_explosive_jump: {
    key: "panther_explosive_jump",
    label: "Explosive Jump",
    prompt: "panther humanoid exploding into jump squat, high speed motion, dust particles, cinematic impact",
    emoji: "🚀",
    gradient: "linear-gradient(135deg, #1a0000 0%, #3a0a00 50%, #1a0000 100%)",
  },
  panther_crawl: {
    key: "panther_crawl",
    label: "Panther Crawl",
    prompt: "panther humanoid performing slow crawl, low stealth movement, muscles engaged",
    emoji: "🐾",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #0a1a0a 50%, #0a0a0a 100%)",
  },
  panther_sprint: {
    key: "panther_sprint",
    label: "Sprint",
    prompt: "panther humanoid sprinting explosively in dark gym, motion blur, high intensity",
    emoji: "⚡",
    gradient: "linear-gradient(135deg, #1a0a00 0%, #3a1a00 50%, #1a0a00 100%)",
  },
  panther_recovery: {
    key: "panther_recovery",
    label: "Recovery",
    prompt: "panther humanoid stretching and breathing calmly, low light, recovery mode",
    emoji: "🌙",
    gradient: "linear-gradient(135deg, #0a0a14 0%, #0a0a1a 50%, #0a0a14 100%)",
  },
};

// ─── EXERCISE → ANIMATION MAPPING ─────────────────────────────────────────────
const EXERCISE_ANIMATION_MAP: Record<string, string> = {
  // Squat family
  sq_slow: "panther_squat_control",
  split_sq: "panther_squat_control",
  squat_hold: "panther_squat_control",
  bulgarian: "panther_squat_control",
  squat: "panther_squat_control",
  single_sq: "panther_squat_control",
  goblet_sq: "panther_squat_control",
  box_squat: "panther_squat_control",
  wallsit: "panther_plank_hold",
  wallsit_long: "panther_plank_hold",

  // Push-up family
  push_slow: "panther_pushup_control",
  push_incline: "panther_pushup_control",
  push_hold: "panther_plank_hold",
  push_hold2: "panther_plank_hold",
  pike: "panther_pushup_control",
  pushup: "panther_pushup_control",
  plyo_push: "panther_explosive_jump",
  explosive_press: "panther_explosive_jump",
  single_push: "panther_pushup_control",

  // Core / plank family
  plank: "panther_plank_hold",
  plank_short: "panther_plank_hold",
  plank_long: "panther_plank_hold",
  plank_var: "panther_plank_hold",
  side_plank: "panther_plank_hold",
  hollow: "panther_plank_hold",
  deadbug: "panther_plank_hold",
  bird_dog: "panther_plank_hold",
  core_hold: "panther_plank_hold",
  core_stability: "panther_plank_hold",
  core_finisher: "panther_plank_hold",
  plank_jack: "panther_explosive_jump",
  vups: "panther_explosive_jump",
  sit_explode: "panther_explosive_jump",
  knee_raise: "panther_plank_hold",
  twist: "panther_plank_hold",

  // Glute / hip
  glute_hold: "panther_plank_hold",
  hip_thrust: "panther_squat_control",
  rdl_single: "panther_squat_control",

  // Crawl family
  crawl: "panther_crawl",
  crawl_panther: "panther_crawl",
  crawl_explode: "panther_crawl",

  // Balance / stability
  single_leg: "panther_plank_hold",
  balance_hold: "panther_plank_hold",
  shoulder_hold: "panther_plank_hold",
  shoulder_tap: "panther_pushup_control",

  // Lunge family
  lunges: "panther_squat_control",
  lunges_fw: "panther_squat_control",
  lateral_lunge: "panther_squat_control",
  jump_lunge: "panther_explosive_jump",

  // Explosive / power
  jump_sq: "panther_explosive_jump",
  broad_jump: "panther_explosive_jump",
  sprint: "panther_sprint",
  sprint_test: "panther_sprint",
  quick_feet: "panther_sprint",
  direction_change: "panther_sprint",
  reaction_jump: "panther_explosive_jump",
  power_circuit: "panther_explosive_jump",
  combo_sprint: "panther_sprint",

  // Combo / integration
  combo: "panther_squat_control",
  combo_sq_press: "panther_squat_control",
  push_row: "panther_pushup_control",
  slow_combo: "panther_squat_control",
  hold_combo: "panther_plank_hold",
  explode_combo: "panther_explosive_jump",

  // Recovery
  mobility: "panther_recovery",
  mobility2: "panther_recovery",
  mobility3: "panther_recovery",
  mobility4: "panther_recovery",
  stretch: "panther_recovery",
  stretch2: "panther_recovery",
  stretch3: "panther_recovery",
  stretch4: "panther_recovery",
  walk: "panther_recovery",
  walk2: "panther_recovery",
  walk3: "panther_recovery",

  // Final test
  max_push: "panther_pushup_control",
  max_sq: "panther_squat_control",
  plank_max: "panther_plank_hold",
};

// ─── PHASE → ANIMATION MAPPING ────────────────────────────────────────────────
const PHASE_ANIMATION_MAP: Record<string, string> = {
  Control: "panther_squat_control",
  Stability: "panther_plank_hold",
  Strength: "panther_pushup_control",
  Explosion: "panther_explosive_jump",
  Evolution: "panther_sprint",
};

// ─── FOCUS → ANIMATION MAPPING ────────────────────────────────────────────────
const FOCUS_ANIMATION_MAP: Record<string, string> = {
  Recovery: "panther_recovery",
  Reset: "panther_recovery",
  Balance: "panther_plank_hold",
  "Core Control": "panther_plank_hold",
  "Core Stability": "panther_plank_hold",
  "Core Strength": "panther_plank_hold",
  "Core Power": "panther_explosive_jump",
  "Lower Body Control": "panther_squat_control",
  "Lower Stability": "panther_squat_control",
  "Lower Strength": "panther_squat_control",
  "Lower Power": "panther_explosive_jump",
  "Upper Body Control": "panther_pushup_control",
  "Upper Stability": "panther_pushup_control",
  "Upper Strength": "panther_pushup_control",
  "Upper Power": "panther_explosive_jump",
  "Full Body Control": "panther_squat_control",
  "Full Body Strength": "panther_squat_control",
  "Full Athletic": "panther_sprint",
  "Movement Control": "panther_crawl",
  "Isometric Strength": "panther_plank_hold",
  "Unilateral Strength": "panther_squat_control",
  "Power Circuit": "panther_explosive_jump",
  Integration: "panther_squat_control",
  Reaction: "panther_sprint",
  "Final Test": "panther_sprint",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Get animation for a specific exercise ID */
export function getAnimationForExercise(exerciseId: string): PantherAnimation {
  const key = EXERCISE_ANIMATION_MAP[exerciseId] || "panther_idle";
  return PANTHER_ANIMATIONS[key];
}

/** Get animation for a phase name */
export function getAnimationForPhase(phase: string): PantherAnimation {
  const key = PHASE_ANIMATION_MAP[phase] || "panther_idle";
  return PANTHER_ANIMATIONS[key];
}

/** Get animation for a focus label */
export function getAnimationForFocus(focus: string): PantherAnimation {
  const key = FOCUS_ANIMATION_MAP[focus] || PHASE_ANIMATION_MAP[focus] || "panther_idle";
  return PANTHER_ANIMATIONS[key];
}

/** Get the best animation for a day (uses focus first, then phase) */
export function getAnimationForDay(phase: string, focus: string, firstExerciseId?: string): PantherAnimation {
  if (firstExerciseId && EXERCISE_ANIMATION_MAP[firstExerciseId]) {
    return PANTHER_ANIMATIONS[EXERCISE_ANIMATION_MAP[firstExerciseId]];
  }
  if (FOCUS_ANIMATION_MAP[focus]) {
    return PANTHER_ANIMATIONS[FOCUS_ANIMATION_MAP[focus]];
  }
  return getAnimationForPhase(phase);
}

/** All 8 animation keys for the library display */
export const ALL_ANIMATION_KEYS = Object.keys(PANTHER_ANIMATIONS);
