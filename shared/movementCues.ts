/**
 * TUF Video Awareness — Movement Cues Database
 *
 * This is the data layer for the Video Awareness & Movement Display system.
 * It defines what the user sees on screen during a workout:
 *   - Phase cues (what to do at each stage of the movement)
 *   - Visual indicators (where to focus, what to watch)
 *   - Timing cues (when to breathe, brace, push, etc.)
 *   - Common errors and corrections
 *
 * Data storage decision:
 *   - This static cue data lives here in code (no spreadsheet needed for this part)
 *   - User performance logs (reps, form scores, corrections given) go in the DB
 *   - New exercises can be added via the spreadsheet template in /tuf-food-data/
 *     and imported — but the cue structure is defined here
 *
 * Spreadsheet format for adding new exercises:
 *   Column A: exercise_id (slug, e.g. "barbell_squat")
 *   Column B: exercise_name
 *   Column C: phase (setup/descent/bottom/ascent/lockout)
 *   Column D: cue_text (what to display on screen)
 *   Column E: focus_area (where the camera/user should look)
 *   Column F: timing (e.g. "on the way down", "at the bottom", "on the push")
 *   Column G: error_flag (what this cue is checking against)
 */

export type MovementPhase =
  | "setup"
  | "brace"
  | "descent"
  | "bottom"
  | "ascent"
  | "lockout"
  | "reset"
  | "breathing";

export type CuePriority = "critical" | "important" | "coaching";

export interface MovementCue {
  phase: MovementPhase;
  text: string;           // Short display text shown on screen
  detail?: string;        // Longer coaching note (shown on tap/hover)
  focus_area?: string;    // e.g. "knees", "spine", "bar path"
  timing?: string;        // When to show this cue
  priority: CuePriority;
  error_flag?: string;    // What compensation this prevents
}

export interface ExerciseCueSet {
  exercise_id: string;
  name: string;
  category: "squat" | "hinge" | "push" | "pull" | "carry" | "core" | "cardio";
  equipment: string[];
  cues: MovementCue[];
  rep_tempo?: string;     // e.g. "3-1-2-0" (eccentric-pause-concentric-pause)
  breathing_pattern?: string;
  panther_focus: string;  // What Panther Vision watches for
}

// ─── Exercise Cue Database ────────────────────────────────────────────────────

export const MOVEMENT_CUES: ExerciseCueSet[] = [
  // ── SQUATS ──────────────────────────────────────────────────────────────────
  {
    exercise_id: "barbell_squat",
    name: "Barbell Back Squat",
    category: "squat",
    equipment: ["barbell", "rack"],
    rep_tempo: "3-1-2-0",
    breathing_pattern: "Inhale at top, brace, hold through descent and ascent, exhale at lockout",
    panther_focus: "Knee cave, forward lean, depth, bar path",
    cues: [
      { phase: "setup", text: "BAR ACROSS TRAPS", detail: "Bar sits on rear delts, not neck. Hands just outside shoulder width.", focus_area: "bar position", priority: "critical" },
      { phase: "setup", text: "FEET SHOULDER-WIDTH", detail: "Toes pointed 15–30° out. Weight through mid-foot.", focus_area: "foot position", priority: "critical" },
      { phase: "brace", text: "BIG BREATH — BRACE", detail: "360° brace. Belly out, ribs down. Hold through the rep.", focus_area: "core", priority: "critical", error_flag: "lumbar_flexion" },
      { phase: "descent", text: "PUSH KNEES OUT", detail: "Track knees over pinky toe. Don't let them cave in.", focus_area: "knees", priority: "critical", error_flag: "knee_valgus" },
      { phase: "descent", text: "CHEST UP", detail: "Maintain upright torso. Don't let chest drop forward.", focus_area: "torso", priority: "important", error_flag: "forward_lean" },
      { phase: "bottom", text: "HIPS BELOW PARALLEL", detail: "Hip crease below knee. Full depth unless mobility limits.", focus_area: "hip depth", priority: "important" },
      { phase: "ascent", text: "DRIVE THROUGH HEELS", detail: "Push the floor away. Lead with chest, not hips.", focus_area: "feet", priority: "critical", error_flag: "hip_rise" },
      { phase: "lockout", text: "SQUEEZE GLUTES", detail: "Full lockout at top. Don't hyperextend the lower back.", focus_area: "hips", priority: "coaching" },
    ],
  },
  {
    exercise_id: "goblet_squat",
    name: "Goblet Squat",
    category: "squat",
    equipment: ["dumbbell", "kettlebell"],
    rep_tempo: "3-1-2-0",
    breathing_pattern: "Inhale at top, brace, exhale on the way up",
    panther_focus: "Knee tracking, depth, elbow position",
    cues: [
      { phase: "setup", text: "HOLD WEIGHT AT CHEST", detail: "Elbows point down. Weight close to body.", focus_area: "arms", priority: "important" },
      { phase: "setup", text: "FEET SHOULDER-WIDTH", detail: "Toes out 30°. Heels on the floor.", focus_area: "feet", priority: "critical" },
      { phase: "brace", text: "BRACE YOUR CORE", detail: "Tight belly. Ribs down.", focus_area: "core", priority: "critical" },
      { phase: "descent", text: "ELBOWS INSIDE KNEES", detail: "Use elbows to push knees out as you descend.", focus_area: "knees", priority: "critical", error_flag: "knee_valgus" },
      { phase: "bottom", text: "SIT INTO IT", detail: "Pause at the bottom. Hips below parallel.", focus_area: "hips", priority: "important" },
      { phase: "ascent", text: "STAND TALL", detail: "Drive through the whole foot. Full extension at top.", focus_area: "full body", priority: "coaching" },
    ],
  },
  {
    exercise_id: "split_squat",
    name: "Bulgarian Split Squat",
    category: "squat",
    equipment: ["bench", "dumbbells"],
    rep_tempo: "3-0-2-0",
    breathing_pattern: "Inhale at top, exhale on ascent",
    panther_focus: "Front knee tracking, torso angle, rear foot position",
    cues: [
      { phase: "setup", text: "REAR FOOT ON BENCH", detail: "Laces down on bench. Front foot 2–3 feet forward.", focus_area: "foot position", priority: "critical" },
      { phase: "descent", text: "KNEE OVER TOE", detail: "Front knee tracks over pinky toe. Don't let it cave.", focus_area: "front knee", priority: "critical", error_flag: "knee_valgus" },
      { phase: "descent", text: "TORSO UPRIGHT", detail: "Slight forward lean is OK. Don't collapse forward.", focus_area: "torso", priority: "important" },
      { phase: "bottom", text: "BACK KNEE NEAR FLOOR", detail: "Don't touch the floor. 1 inch above.", focus_area: "rear knee", priority: "coaching" },
      { phase: "ascent", text: "DRIVE THROUGH FRONT HEEL", detail: "Push through the heel of the front foot.", focus_area: "front foot", priority: "critical" },
    ],
  },

  // ── HINGES ──────────────────────────────────────────────────────────────────
  {
    exercise_id: "romanian_deadlift",
    name: "Romanian Deadlift (RDL)",
    category: "hinge",
    equipment: ["barbell", "dumbbells"],
    rep_tempo: "3-1-2-0",
    breathing_pattern: "Inhale at top, brace, hold through descent, exhale at top",
    panther_focus: "Spine neutral, hamstring stretch, bar path close to body",
    cues: [
      { phase: "setup", text: "HIP-WIDTH STANCE", detail: "Feet hip-width. Soft bend in knees.", focus_area: "feet", priority: "important" },
      { phase: "brace", text: "BRACE AND HINGE", detail: "Big breath, brace core, push hips back — not down.", focus_area: "hips", priority: "critical" },
      { phase: "descent", text: "BAR STAYS CLOSE", detail: "Bar drags down the legs. Don't let it drift forward.", focus_area: "bar path", priority: "critical", error_flag: "bar_drift" },
      { phase: "descent", text: "FLAT BACK", detail: "Neutral spine throughout. No rounding of the lower back.", focus_area: "spine", priority: "critical", error_flag: "lumbar_flexion" },
      { phase: "bottom", text: "FEEL THE HAMSTRINGS", detail: "Stop when you feel a strong stretch. Usually mid-shin.", focus_area: "hamstrings", priority: "important" },
      { phase: "ascent", text: "DRIVE HIPS FORWARD", detail: "Squeeze glutes. Push hips through to stand.", focus_area: "hips", priority: "critical" },
      { phase: "lockout", text: "STAND TALL", detail: "Full hip extension. Don't hyperextend.", focus_area: "full body", priority: "coaching" },
    ],
  },
  {
    exercise_id: "hip_hinge",
    name: "Hip Hinge (Bodyweight)",
    category: "hinge",
    equipment: [],
    rep_tempo: "2-1-2-0",
    breathing_pattern: "Inhale at top, exhale on return",
    panther_focus: "Spine neutral, hip crease, knee bend",
    cues: [
      { phase: "setup", text: "FEET HIP-WIDTH", detail: "Soft bend in knees. Weight through mid-foot.", focus_area: "feet", priority: "important" },
      { phase: "descent", text: "PUSH HIPS BACK", detail: "Imagine a wall behind you. Push your hips toward it.", focus_area: "hips", priority: "critical" },
      { phase: "descent", text: "SPINE NEUTRAL", detail: "Long spine from head to tailbone. No rounding.", focus_area: "spine", priority: "critical", error_flag: "lumbar_flexion" },
      { phase: "ascent", text: "SQUEEZE GLUTES", detail: "Drive hips forward. Glutes finish the movement.", focus_area: "glutes", priority: "critical" },
    ],
  },

  // ── PUSH ────────────────────────────────────────────────────────────────────
  {
    exercise_id: "push_up",
    name: "Push-Up",
    category: "push",
    equipment: [],
    rep_tempo: "3-1-1-0",
    breathing_pattern: "Inhale on descent, exhale on push",
    panther_focus: "Elbow flare, hip sag, head position",
    cues: [
      { phase: "setup", text: "HANDS OUTSIDE SHOULDERS", detail: "Hands slightly wider than shoulders. Fingers forward.", focus_area: "hands", priority: "important" },
      { phase: "brace", text: "PLANK POSITION", detail: "Tight core, glutes, quads. Body is a straight line.", focus_area: "full body", priority: "critical", error_flag: "hip_sag" },
      { phase: "descent", text: "ELBOWS 45°", detail: "Elbows angle back at 45°. Not flared out wide.", focus_area: "elbows", priority: "critical", error_flag: "elbow_flare" },
      { phase: "bottom", text: "CHEST TO FLOOR", detail: "Full range of motion. Chest touches or nearly touches.", focus_area: "chest", priority: "important" },
      { phase: "ascent", text: "PUSH THE FLOOR AWAY", detail: "Full lockout at top. Spread the floor with your hands.", focus_area: "arms", priority: "coaching" },
    ],
  },
  {
    exercise_id: "dumbbell_press",
    name: "Dumbbell Bench Press",
    category: "push",
    equipment: ["dumbbells", "bench"],
    rep_tempo: "3-1-2-0",
    breathing_pattern: "Inhale on descent, exhale on press",
    panther_focus: "Elbow angle, wrist alignment, arch control",
    cues: [
      { phase: "setup", text: "FEET FLAT ON FLOOR", detail: "Feet planted. Slight arch in lower back. Shoulder blades retracted.", focus_area: "full body", priority: "critical" },
      { phase: "descent", text: "ELBOWS 45–75°", detail: "Not straight out (90°). Not tucked tight. 45–75° from torso.", focus_area: "elbows", priority: "critical", error_flag: "elbow_flare" },
      { phase: "bottom", text: "DUMBBELLS AT CHEST LEVEL", detail: "Dumbbells level with lower chest. Full stretch.", focus_area: "chest", priority: "important" },
      { phase: "ascent", text: "PRESS AND ROTATE", detail: "Press up and slightly in. Slight rotation at top is OK.", focus_area: "arms", priority: "coaching" },
      { phase: "lockout", text: "DON'T LOCK OUT HARD", detail: "Soft lockout at top. Keep tension on chest.", focus_area: "elbows", priority: "coaching" },
    ],
  },

  // ── PULL ────────────────────────────────────────────────────────────────────
  {
    exercise_id: "dumbbell_row",
    name: "Dumbbell Row",
    category: "pull",
    equipment: ["dumbbell", "bench"],
    rep_tempo: "2-1-3-0",
    breathing_pattern: "Exhale on pull, inhale on lower",
    panther_focus: "Elbow path, rotation, shoulder blade movement",
    cues: [
      { phase: "setup", text: "FLAT BACK", detail: "Neutral spine. Brace core. Don't round.", focus_area: "spine", priority: "critical" },
      { phase: "ascent", text: "PULL ELBOW TO HIP", detail: "Drive elbow back and up. Lead with the elbow, not the hand.", focus_area: "elbow", priority: "critical", error_flag: "bicep_dominant" },
      { phase: "ascent", text: "SQUEEZE SHOULDER BLADE", detail: "Retract and depress the shoulder blade at the top.", focus_area: "shoulder blade", priority: "important" },
      { phase: "descent", text: "CONTROL THE LOWER", detail: "3-second lower. Full stretch at the bottom.", focus_area: "lats", priority: "important" },
    ],
  },
  {
    exercise_id: "lat_pulldown",
    name: "Lat Pulldown",
    category: "pull",
    equipment: ["cable_machine"],
    rep_tempo: "2-1-3-0",
    breathing_pattern: "Exhale on pull, inhale on return",
    panther_focus: "Elbow path, lean angle, shoulder blade depression",
    cues: [
      { phase: "setup", text: "GRIP JUST OUTSIDE SHOULDERS", detail: "Overhand grip. Thumbless grip optional.", focus_area: "hands", priority: "important" },
      { phase: "brace", text: "SLIGHT LEAN BACK", detail: "10–15° lean. Not 45°. Chest up.", focus_area: "torso", priority: "important" },
      { phase: "ascent", text: "PULL TO UPPER CHEST", detail: "Bar comes to upper chest/collarbone. Not behind neck.", focus_area: "bar path", priority: "critical" },
      { phase: "ascent", text: "ELBOWS DOWN AND BACK", detail: "Drive elbows toward your back pockets.", focus_area: "elbows", priority: "critical" },
      { phase: "descent", text: "CONTROL THE STRETCH", detail: "Full arm extension at top. Feel the lat stretch.", focus_area: "lats", priority: "important" },
    ],
  },

  // ── CORE ────────────────────────────────────────────────────────────────────
  {
    exercise_id: "dead_bug",
    name: "Dead Bug",
    category: "core",
    equipment: [],
    rep_tempo: "3-1-3-0",
    breathing_pattern: "Exhale fully as you lower limbs, inhale to reset",
    panther_focus: "Lower back contact, limb control, breathing",
    cues: [
      { phase: "setup", text: "BACK FLAT ON FLOOR", detail: "Lower back pressed into the floor. No gap.", focus_area: "lower back", priority: "critical", error_flag: "lumbar_extension" },
      { phase: "brace", text: "EXHALE AND BRACE", detail: "Exhale fully. Rib cage down. Core tight.", focus_area: "core", priority: "critical" },
      { phase: "descent", text: "SLOW AND CONTROLLED", detail: "3 seconds to lower. Don't rush.", focus_area: "limbs", priority: "important" },
      { phase: "descent", text: "BACK STAYS FLAT", detail: "If your back lifts, you've gone too far.", focus_area: "lower back", priority: "critical", error_flag: "lumbar_extension" },
      { phase: "reset", text: "RESET BEFORE NEXT REP", detail: "Return to start. Exhale again before next rep.", focus_area: "breathing", priority: "coaching" },
    ],
  },
  {
    exercise_id: "plank",
    name: "Plank",
    category: "core",
    equipment: [],
    rep_tempo: "hold",
    breathing_pattern: "Steady breathing throughout. Don't hold breath.",
    panther_focus: "Hip height, head position, shoulder stability",
    cues: [
      { phase: "setup", text: "FOREARMS PARALLEL", detail: "Elbows under shoulders. Forearms parallel or clasped.", focus_area: "arms", priority: "important" },
      { phase: "brace", text: "SQUEEZE EVERYTHING", detail: "Glutes, quads, core, lats. Full body tension.", focus_area: "full body", priority: "critical" },
      { phase: "brace", text: "HIPS LEVEL", detail: "Not too high, not sagging. Straight line from head to heels.", focus_area: "hips", priority: "critical", error_flag: "hip_sag" },
      { phase: "breathing", text: "BREATHE STEADY", detail: "Don't hold your breath. Steady inhale/exhale.", focus_area: "breathing", priority: "important" },
    ],
  },
];

// ─── Lookup Helpers ───────────────────────────────────────────────────────────

/**
 * Get cues for a specific exercise by ID.
 */
export function getCuesForExercise(exerciseId: string): ExerciseCueSet | null {
  return MOVEMENT_CUES.find((e) => e.exercise_id === exerciseId) ?? null;
}

/**
 * Get only the critical cues for an exercise (for minimal display mode).
 */
export function getCriticalCues(exerciseId: string): MovementCue[] {
  const set = getCuesForExercise(exerciseId);
  if (!set) return [];
  return set.cues.filter((c) => c.priority === "critical");
}

/**
 * Get cues for a specific phase of an exercise.
 */
export function getCuesForPhase(
  exerciseId: string,
  phase: MovementPhase
): MovementCue[] {
  const set = getCuesForExercise(exerciseId);
  if (!set) return [];
  return set.cues.filter((c) => c.phase === phase);
}

/**
 * Get all exercise IDs available in the cue database.
 */
export function getAvailableExerciseIds(): string[] {
  return MOVEMENT_CUES.map((e) => e.exercise_id);
}

/**
 * Map a display exercise name to its cue set ID.
 * Used to bridge the exercise knowledge base with the cue database.
 */
export function findCuesByName(name: string): ExerciseCueSet | null {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
  return (
    MOVEMENT_CUES.find(
      (e) =>
        e.exercise_id === normalized ||
        e.name.toLowerCase().includes(name.toLowerCase())
    ) ?? null
  );
}

// ─── Spreadsheet Import Format ────────────────────────────────────────────────
/**
 * Template for adding new exercises via spreadsheet.
 * Save as CSV and import via the admin panel (future feature).
 *
 * Headers:
 * exercise_id | exercise_name | category | equipment | phase | cue_text |
 * detail | focus_area | timing | priority | error_flag | rep_tempo | breathing_pattern
 *
 * Example row:
 * barbell_squat | Barbell Back Squat | squat | barbell,rack | setup |
 * BAR ACROSS TRAPS | Bar sits on rear delts not neck | bar position | | critical | |
 * 3-1-2-0 | Inhale at top brace hold through descent exhale at lockout
 */
export const SPREADSHEET_TEMPLATE_HEADERS = [
  "exercise_id",
  "exercise_name",
  "category",
  "equipment",
  "phase",
  "cue_text",
  "detail",
  "focus_area",
  "timing",
  "priority",
  "error_flag",
  "rep_tempo",
  "breathing_pattern",
] as const;
