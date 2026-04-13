/**
 * Panther 30-Day Training System
 * Program data — all 30 days across 5 phases
 * Voice Laws: Claude delivers coaching in Panther voice (see docs/PANTHER_PROMPTS.md)
 */

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  max_reps?: boolean;
  max_time?: boolean;
  duration_sec?: number;
  duration_min?: number;
  distance?: string;
  tempo?: string;
  rest_sec?: number;
  cue?: string;
}

export interface ProgramDay {
  day: number;
  phase: "Control" | "Stability" | "Strength" | "Explosion" | "Evolution";
  focus: string;
  duration_min: number;
  exercises: Exercise[];
  message: string;
  content_hook: string;
}

export const PROGRAM_DAYS: ProgramDay[] = [
  // ─── PHASE 1: CONTROL (Days 1–7) ─────────────────────────────────────────
  {
    day: 1,
    phase: "Control",
    focus: "Lower Body Control",
    duration_min: 20,
    exercises: [
      { name: "Slow Squats", sets: 4, reps: 10, tempo: "5-1-1", rest_sec: 60, cue: "Control the descent" },
      { name: "Split Squats", sets: 3, reps: 10, tempo: "3-1-1", rest_sec: 60, cue: "Stay balanced" },
      { name: "Glute Bridge Hold", sets: 3, duration_sec: 30, rest_sec: 45, cue: "Squeeze at top" }
    ],
    message: "Control builds strength.",
    content_hook: "Most people rush this…"
  },
  {
    day: 2,
    phase: "Control",
    focus: "Upper Body Control",
    duration_min: 20,
    exercises: [
      { name: "Slow Push-Ups", sets: 4, reps: 8, tempo: "4-1-1", rest_sec: 60, cue: "Full control" },
      { name: "Incline Push-Ups", sets: 3, reps: 10, rest_sec: 45, cue: "Keep core tight" },
      { name: "Shoulder Tap Hold", sets: 3, duration_sec: 20, rest_sec: 45, cue: "Minimize movement" }
    ],
    message: "Slow equals strong.",
    content_hook: "Your push-ups are too fast"
  },
  {
    day: 3,
    phase: "Control",
    focus: "Core Control",
    duration_min: 20,
    exercises: [
      { name: "Plank", sets: 3, duration_sec: 45, rest_sec: 45 },
      { name: "Dead Bug", sets: 3, reps: 10, rest_sec: 45 },
      { name: "Hollow Hold", sets: 3, duration_sec: 20, rest_sec: 45 }
    ],
    message: "Stability creates power.",
    content_hook: "Your core is your foundation"
  },
  {
    day: 4,
    phase: "Control",
    focus: "Recovery",
    duration_min: 15,
    exercises: [
      { name: "Mobility Flow", duration_min: 10 },
      { name: "Stretching", duration_min: 5 }
    ],
    message: "Recovery is training.",
    content_hook: "You grow when you recover"
  },
  {
    day: 5,
    phase: "Control",
    focus: "Full Body Control",
    duration_min: 25,
    exercises: [
      { name: "Squat to Push-Up", sets: 4, reps: 8, rest_sec: 60, cue: "Smooth transition" },
      { name: "Bear Crawl", sets: 3, distance: "10m", rest_sec: 45, cue: "Hips level, slow and deliberate" },
      { name: "Wall Sit", sets: 3, duration_sec: 45, rest_sec: 45, cue: "Thighs parallel to floor" }
    ],
    message: "Control every movement.",
    content_hook: "Train with intention"
  },
  {
    day: 6,
    phase: "Control",
    focus: "Balance",
    duration_min: 20,
    exercises: [
      { name: "Single-Leg Stand", sets: 3, duration_sec: 30, rest_sec: 30, cue: "Eyes forward, core braced" },
      { name: "Reverse Lunges", sets: 3, reps: 10, rest_sec: 45, cue: "Back knee hovers, don't touch" },
      { name: "Plank", sets: 3, duration_sec: 30, rest_sec: 45, cue: "Straight line head to heel" }
    ],
    message: "Balance reveals weakness.",
    content_hook: "Can you control this?"
  },
  {
    day: 7,
    phase: "Control",
    focus: "Reset",
    duration_min: 15,
    exercises: [
      { name: "Light Walk", duration_min: 10 },
      { name: "Stretch", duration_min: 5 }
    ],
    message: "Reset. Refocus.",
    content_hook: "Rest like a predator"
  },

  // ─── PHASE 2: STABILITY (Days 8–14) ──────────────────────────────────────
  {
    day: 8,
    phase: "Stability",
    focus: "Lower Stability",
    duration_min: 25,
    exercises: [
      { name: "Bulgarian Split Squat", sets: 4, reps: 8, rest_sec: 60, cue: "Front shin vertical" },
      { name: "Single-Leg RDL", sets: 3, reps: 10, rest_sec: 60, cue: "Hip hinge, flat back" },
      { name: "Wall Sit", sets: 3, duration_sec: 60, rest_sec: 45, cue: "Own the position" }
    ],
    message: "Own the position.",
    content_hook: "Can you hold this?"
  },
  {
    day: 9,
    phase: "Stability",
    focus: "Upper Stability",
    duration_min: 25,
    exercises: [
      { name: "Push-Up Hold", sets: 4, duration_sec: 20, rest_sec: 45, cue: "Midpoint — hold the tension" },
      { name: "Pike Push-Ups", sets: 3, reps: 8, rest_sec: 60, cue: "Drive crown of head toward floor" },
      { name: "Shoulder Taps", sets: 3, reps: 20, rest_sec: 45, cue: "Stop collapsing here" }
    ],
    message: "Strength in stillness.",
    content_hook: "Stop collapsing here"
  },
  {
    day: 10,
    phase: "Stability",
    focus: "Core Stability",
    duration_min: 20,
    exercises: [
      { name: "Plank Variations", sets: 4, duration_sec: 30, rest_sec: 30, cue: "Alternate: standard, wide, narrow" },
      { name: "Side Plank", sets: 3, duration_sec: 30, rest_sec: 30, cue: "Hips stacked, don't sag" },
      { name: "Bird Dog", sets: 3, reps: 10, rest_sec: 45, cue: "Opposite arm and leg, slow" }
    ],
    message: "Core is everything.",
    content_hook: "Fix your core"
  },
  {
    day: 11,
    phase: "Stability",
    focus: "Hip Stability",
    duration_min: 25,
    exercises: [
      { name: "Clamshells", sets: 3, reps: 15, rest_sec: 30, cue: "Band above knees, rotate from hip" },
      { name: "Lateral Band Walk", sets: 3, distance: "10m", rest_sec: 45, cue: "Stay low, constant tension" },
      { name: "Glute Bridge March", sets: 3, reps: 12, rest_sec: 45, cue: "Hold bridge, alternate knee drives" }
    ],
    message: "Hips that fire, protect the spine.",
    content_hook: "Your hips are the engine"
  },
  {
    day: 12,
    phase: "Stability",
    focus: "Shoulder Stability",
    duration_min: 20,
    exercises: [
      { name: "Band Pull-Aparts", sets: 4, reps: 15, rest_sec: 30, cue: "Squeeze shoulder blades together" },
      { name: "Wall Slides", sets: 3, reps: 10, rest_sec: 30, cue: "Keep wrists and elbows on wall" },
      { name: "Prone Y-T-W", sets: 3, reps: 10, rest_sec: 45, cue: "Lift from the upper back, not the neck" }
    ],
    message: "Shoulders built to last.",
    content_hook: "Most shoulder pain starts here"
  },
  {
    day: 13,
    phase: "Stability",
    focus: "Full Body Stability",
    duration_min: 25,
    exercises: [
      { name: "Single-Leg Glute Bridge", sets: 3, reps: 12, rest_sec: 45, cue: "Drive through heel, keep hips level" },
      { name: "Staggered Push-Up", sets: 3, reps: 8, rest_sec: 60, cue: "One hand forward, one back — alternate" },
      { name: "Pallof Press Hold", sets: 3, duration_sec: 20, rest_sec: 45, cue: "Resist rotation, brace the core" }
    ],
    message: "Stability is the foundation of power.",
    content_hook: "This is where athletes are made"
  },
  {
    day: 14,
    phase: "Stability",
    focus: "Reset",
    duration_min: 15,
    exercises: [
      { name: "Foam Roll", duration_min: 8 },
      { name: "Static Stretch", duration_min: 7 }
    ],
    message: "Recover with purpose.",
    content_hook: "The work continues in recovery"
  },

  // ─── PHASE 3: STRENGTH (Days 15–21) ──────────────────────────────────────
  {
    day: 15,
    phase: "Strength",
    focus: "Lower Strength",
    duration_min: 30,
    exercises: [
      { name: "Squats", sets: 4, reps: 8, rest_sec: 90, cue: "Chest up, drive through heels" },
      { name: "Lunges", sets: 3, reps: 12, rest_sec: 60, cue: "Step long, knee tracks over toe" },
      { name: "Hip Thrusts", sets: 3, reps: 12, rest_sec: 60, cue: "Full hip extension at top" }
    ],
    message: "Build real strength.",
    content_hook: "Now we build power"
  },
  {
    day: 16,
    phase: "Strength",
    focus: "Upper Strength",
    duration_min: 30,
    exercises: [
      { name: "Push-Ups", sets: 4, reps: 12, rest_sec: 60, cue: "Chest to floor, elbows 45 degrees" },
      { name: "Dips", sets: 3, reps: 8, rest_sec: 75, cue: "Lean slightly forward, full depth" },
      { name: "Diamond Push-Ups", sets: 3, reps: 10, rest_sec: 60, cue: "Hands form a diamond, elbows back" }
    ],
    message: "Upper body strength is earned.",
    content_hook: "Push harder than yesterday"
  },
  {
    day: 17,
    phase: "Strength",
    focus: "Core Strength",
    duration_min: 25,
    exercises: [
      { name: "Hanging Knee Raises", sets: 4, reps: 12, rest_sec: 45, cue: "Control the descent" },
      { name: "Ab Wheel Rollout", sets: 3, reps: 8, rest_sec: 60, cue: "Brace hard, don't let hips drop" },
      { name: "Russian Twists", sets: 3, reps: 20, rest_sec: 45, cue: "Rotate from the torso, not the arms" }
    ],
    message: "A strong core moves everything.",
    content_hook: "Your core is your armor"
  },
  {
    day: 18,
    phase: "Strength",
    focus: "Posterior Chain",
    duration_min: 30,
    exercises: [
      { name: "Romanian Deadlift", sets: 4, reps: 10, rest_sec: 90, cue: "Hinge at hips, bar close to legs" },
      { name: "Good Mornings", sets: 3, reps: 12, rest_sec: 60, cue: "Soft knee, hinge until you feel hamstrings" },
      { name: "Reverse Hyper", sets: 3, reps: 15, rest_sec: 45, cue: "Squeeze glutes at top" }
    ],
    message: "The back side is where power lives.",
    content_hook: "Train what you can't see"
  },
  {
    day: 19,
    phase: "Strength",
    focus: "Compound Strength",
    duration_min: 35,
    exercises: [
      { name: "Squat to Press", sets: 4, reps: 8, rest_sec: 90, cue: "Explode from squat into press" },
      { name: "Push-Up to Row", sets: 3, reps: 10, rest_sec: 75, cue: "Row at top, keep hips level" },
      { name: "Lunge with Rotation", sets: 3, reps: 10, rest_sec: 60, cue: "Rotate toward front leg" }
    ],
    message: "Compound movements build real athletes.",
    content_hook: "This is functional strength"
  },
  {
    day: 20,
    phase: "Strength",
    focus: "Grip and Carry",
    duration_min: 25,
    exercises: [
      { name: "Farmer Carry", sets: 4, distance: "20m", rest_sec: 60, cue: "Shoulders packed, walk tall" },
      { name: "Dead Hang", sets: 3, duration_sec: 30, rest_sec: 45, cue: "Full hang, shoulders active" },
      { name: "Plate Pinch", sets: 3, duration_sec: 20, rest_sec: 30, cue: "Pinch two plates together" }
    ],
    message: "Grip strength is life strength.",
    content_hook: "Weak grip, weak athlete"
  },
  {
    day: 21,
    phase: "Strength",
    focus: "Reset",
    duration_min: 15,
    exercises: [
      { name: "Foam Roll", duration_min: 8 },
      { name: "Static Stretch", duration_min: 7 }
    ],
    message: "Strength requires recovery.",
    content_hook: "You earned this rest"
  },

  // ─── PHASE 4: EXPLOSION (Days 22–28) ─────────────────────────────────────
  {
    day: 22,
    phase: "Explosion",
    focus: "Lower Body Power",
    duration_min: 25,
    exercises: [
      { name: "Jump Squats", sets: 4, reps: 8, rest_sec: 90, cue: "Land soft, absorb the force" },
      { name: "Broad Jumps", sets: 3, reps: 6, rest_sec: 90, cue: "Swing arms, max distance" },
      { name: "Sprints", sets: 5, distance: "20m", rest_sec: 90, cue: "Drive knees, pump arms" }
    ],
    message: "Explode with purpose.",
    content_hook: "Time to strike"
  },
  {
    day: 23,
    phase: "Explosion",
    focus: "Upper Body Power",
    duration_min: 25,
    exercises: [
      { name: "Explosive Push-Ups", sets: 4, reps: 8, rest_sec: 90, cue: "Push so hard your hands leave the floor" },
      { name: "Medicine Ball Slam", sets: 3, reps: 10, rest_sec: 60, cue: "Full extension overhead, slam with intent" },
      { name: "Clap Push-Ups", sets: 3, reps: 6, rest_sec: 90, cue: "Land soft, absorb through the chest" }
    ],
    message: "Power is speed times strength.",
    content_hook: "This is where it gets real"
  },
  {
    day: 24,
    phase: "Explosion",
    focus: "Reactive Power",
    duration_min: 25,
    exercises: [
      { name: "Box Jumps", sets: 4, reps: 6, rest_sec: 90, cue: "Land in squat position, step down" },
      { name: "Lateral Bounds", sets: 3, reps: 8, rest_sec: 75, cue: "Stick the landing, hold 1 second" },
      { name: "Depth Drop", sets: 3, reps: 6, rest_sec: 90, cue: "Step off, land and absorb immediately" }
    ],
    message: "React faster than your opponent.",
    content_hook: "Train your nervous system"
  },
  {
    day: 25,
    phase: "Explosion",
    focus: "Sprint Mechanics",
    duration_min: 25,
    exercises: [
      { name: "A-Skip", sets: 3, distance: "20m", rest_sec: 60, cue: "High knee, dorsiflexed foot" },
      { name: "B-Skip", sets: 3, distance: "20m", rest_sec: 60, cue: "Extend the leg at top of cycle" },
      { name: "Acceleration Sprints", sets: 6, distance: "30m", rest_sec: 90, cue: "Drive for 10m, then open up" }
    ],
    message: "Speed is a skill. Train it.",
    content_hook: "Most people never train this"
  },
  {
    day: 26,
    phase: "Explosion",
    focus: "Power Endurance",
    duration_min: 30,
    exercises: [
      { name: "Burpees", sets: 4, reps: 10, rest_sec: 60, cue: "Explosive jump at top, controlled descent" },
      { name: "Tuck Jumps", sets: 3, reps: 8, rest_sec: 75, cue: "Knees to chest, land soft" },
      { name: "Push-Up Burpee", sets: 3, reps: 8, rest_sec: 75, cue: "Full push-up, then explode up" }
    ],
    message: "Power that lasts is the goal.",
    content_hook: "Can you hold this intensity?"
  },
  {
    day: 27,
    phase: "Explosion",
    focus: "Rotational Power",
    duration_min: 25,
    exercises: [
      { name: "Med Ball Rotational Throw", sets: 4, reps: 8, rest_sec: 75, cue: "Hips lead, arms follow" },
      { name: "Cable Woodchop", sets: 3, reps: 10, rest_sec: 60, cue: "Rotate from hips, not shoulders" },
      { name: "Rotational Jumps", sets: 3, reps: 6, rest_sec: 90, cue: "90-degree rotation, stick the landing" }
    ],
    message: "Rotational power separates athletes.",
    content_hook: "This is athletic power"
  },
  {
    day: 28,
    phase: "Explosion",
    focus: "Reset",
    duration_min: 20,
    exercises: [
      { name: "Light Jog", duration_min: 10 },
      { name: "Dynamic Stretch", duration_min: 10 }
    ],
    message: "Prepare for Evolution.",
    content_hook: "The final phase begins tomorrow"
  },

  // ─── PHASE 5: EVOLUTION (Days 29–30) ─────────────────────────────────────
  {
    day: 29,
    phase: "Evolution",
    focus: "Full System Integration",
    duration_min: 30,
    exercises: [
      { name: "Squat to Jump", sets: 4, reps: 8, rest_sec: 75, cue: "Slow down, explode up" },
      { name: "Push-Up Complex", sets: 3, reps: 10, rest_sec: 60, cue: "Slow, hold, explode — three tempos" },
      { name: "Sprint to Plank", sets: 4, distance: "20m", rest_sec: 90, cue: "Sprint, drop to plank, hold 10 sec" }
    ],
    message: "You are the system now.",
    content_hook: "Everything you trained for — this is it"
  },
  {
    day: 30,
    phase: "Evolution",
    focus: "Final Test",
    duration_min: 30,
    exercises: [
      { name: "Max Push-Ups", sets: 1, max_reps: true, cue: "Go until failure — this is your number" },
      { name: "Max Squats", sets: 1, max_reps: true, cue: "Bodyweight, full depth, no stopping" },
      { name: "Sprint Test", sets: 3, distance: "40m", rest_sec: 120, cue: "Max effort every rep" },
      { name: "Plank Hold", sets: 1, max_time: true, cue: "Hold until you can't — that's your record" }
    ],
    message: "You've become the predator.",
    content_hook: "Final form unlocked"
  }
];

export const PROGRAM_META = {
  name: "Panther 30-Day Training System",
  phases: ["Control", "Stability", "Strength", "Explosion", "Evolution"],
  phase_ranges: {
    Control: [1, 7],
    Stability: [8, 14],
    Strength: [15, 21],
    Explosion: [22, 28],
    Evolution: [29, 30]
  },
  total_days: 30,
  tier_required: "CUB" // minimum tier to access
};
