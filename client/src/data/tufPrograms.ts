/**
 * TUF Programs — Imported from Google Drive
 * Maximum Overdrive (6-week HIIT) + Ass-Assassination (6-week Glute)
 * Parsed from original program documents.
 */

export interface Exercise {
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  note?: string;
}

export interface Workout {
  id: string;
  title: string;
  focus: string;
  warmup: string;
  exercises: Exercise[];
  totalTime?: string;
}

export interface ProgramWeek {
  week: number;
  label: string;
  focus: string;
  workouts: Workout[];
}

export interface TufProgram {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  daysPerWeek: number;
  level: "beginner" | "intermediate" | "advanced";
  category: string;
  tags: string[];
  schedule: string;
  weeks: ProgramWeek[];
}

// ─── MAXIMUM OVERDRIVE ────────────────────────────────────────────────────────
export const maximumOverdrive: TufProgram = {
  id: "maximum-overdrive",
  title: "Maximum Overdrive",
  subtitle: "6-Week High-Intensity Program",
  description:
    "Fast-paced, high-intensity workouts designed to push you to your limits and maximize results. 4 rounds per session, 4 exercises per round, 30 seconds on / 10 seconds off. Every workout is 30 minutes.",
  duration: "6 Weeks",
  daysPerWeek: 4,
  level: "intermediate",
  category: "HIIT / Full Body",
  tags: ["HIIT", "Full Body", "Strength", "Cardio", "30 Min"],
  schedule: "Mon: Full Body · Tue: Upper Body · Thu: Lower Body · Fri: Core",
  weeks: Array.from({ length: 6 }, (_, i) => ({
    week: i + 1,
    label: `Week ${i + 1}`,
    focus:
      i < 2
        ? "Build the base — establish form and work capacity"
        : i < 4
        ? "Increase intensity — push past your comfort zone"
        : "Peak performance — maximum output",
    workouts: [
      {
        id: `mo-w${i + 1}-full-body`,
        title: "Full Body",
        focus: "Total body conditioning",
        warmup: "5-min dynamic warm-up: arm circles, leg swings, hip rotations",
        totalTime: "30 min",
        exercises: [
          {
            name: "Round 1",
            note: "30 sec on / 10 sec rest each exercise, 30 sec rest after round",
          },
          { name: "Squat Jumps", duration: "30 sec" },
          { name: "Push-Ups", duration: "30 sec" },
          { name: "Alternating Lunges", duration: "30 sec" },
          { name: "Plank Hold", duration: "30 sec" },
          { name: "Round 2", note: "30 sec on / 10 sec rest each exercise" },
          { name: "Burpees", duration: "30 sec" },
          { name: "Dumbbell Curls", duration: "30 sec" },
          { name: "Mountain Climbers", duration: "30 sec" },
          { name: "Russian Twists", duration: "30 sec" },
          { name: "Round 3", note: "30 sec on / 10 sec rest each exercise" },
          { name: "High Knees", duration: "30 sec" },
          { name: "Tricep Dips", duration: "30 sec" },
          { name: "Jumping Jacks", duration: "30 sec" },
          { name: "Leg Raises", duration: "30 sec" },
          { name: "Round 4", note: "30 sec on / 10 sec rest each exercise" },
          { name: "Box Jumps", duration: "30 sec" },
          { name: "Shoulder Press", duration: "30 sec" },
          { name: "Bicycle Crunches", duration: "30 sec" },
          { name: "Superman Holds", duration: "30 sec" },
        ],
      },
      {
        id: `mo-w${i + 1}-upper`,
        title: "Upper Body",
        focus: "Push / Pull strength",
        warmup: "5-min dynamic warm-up: shoulder rolls, band pull-aparts",
        totalTime: "30 min",
        exercises: [
          { name: "Round 1", note: "30 sec on / 10 sec rest" },
          { name: "Push-Ups", duration: "30 sec" },
          { name: "Bent-Over Rows", duration: "30 sec" },
          { name: "Shoulder Press", duration: "30 sec" },
          { name: "Bicep Curls", duration: "30 sec" },
          { name: "Round 2", note: "30 sec on / 10 sec rest" },
          { name: "Tricep Dips", duration: "30 sec" },
          { name: "Chest Flyes", duration: "30 sec" },
          { name: "Upright Rows", duration: "30 sec" },
          { name: "Hammer Curls", duration: "30 sec" },
          { name: "Round 3", note: "30 sec on / 10 sec rest" },
          { name: "Diamond Push-Ups", duration: "30 sec" },
          { name: "Lat Pulldowns", duration: "30 sec" },
          { name: "Lateral Raises", duration: "30 sec" },
          { name: "Concentration Curls", duration: "30 sec" },
          { name: "Round 4", note: "30 sec on / 10 sec rest" },
          { name: "Pike Push-Ups", duration: "30 sec" },
          { name: "Single-Arm Row", duration: "30 sec" },
          { name: "Front Raises", duration: "30 sec" },
          { name: "Reverse Curls", duration: "30 sec" },
        ],
      },
      {
        id: `mo-w${i + 1}-lower`,
        title: "Lower Body",
        focus: "Legs and glutes",
        warmup: "5-min dynamic warm-up: leg swings, hip circles, bodyweight squats",
        totalTime: "30 min",
        exercises: [
          { name: "Round 1", note: "30 sec on / 10 sec rest" },
          { name: "Squat Jumps", duration: "30 sec" },
          { name: "Reverse Lunges", duration: "30 sec" },
          { name: "Glute Bridges", duration: "30 sec" },
          { name: "Wall Sit", duration: "30 sec" },
          { name: "Round 2", note: "30 sec on / 10 sec rest" },
          { name: "Sumo Squats", duration: "30 sec" },
          { name: "Step-Ups", duration: "30 sec" },
          { name: "Hip Thrusts", duration: "30 sec" },
          { name: "Calf Raises", duration: "30 sec" },
          { name: "Round 3", note: "30 sec on / 10 sec rest" },
          { name: "Bulgarian Split Squats", duration: "30 sec" },
          { name: "Romanian Deadlifts", duration: "30 sec" },
          { name: "Donkey Kicks", duration: "30 sec" },
          { name: "Fire Hydrants", duration: "30 sec" },
          { name: "Round 4", note: "30 sec on / 10 sec rest" },
          { name: "Box Jumps", duration: "30 sec" },
          { name: "Lateral Lunges", duration: "30 sec" },
          { name: "Hamstring Curls", duration: "30 sec" },
          { name: "Single-Leg Deadlift", duration: "30 sec" },
        ],
      },
      {
        id: `mo-w${i + 1}-core`,
        title: "Core",
        focus: "Core strength and stability",
        warmup: "5-min dynamic warm-up: cat-cow, bird dog, dead bug",
        totalTime: "30 min",
        exercises: [
          { name: "Round 1", note: "30 sec on / 10 sec rest" },
          { name: "Plank Hold", duration: "30 sec" },
          { name: "Bicycle Crunches", duration: "30 sec" },
          { name: "Russian Twists", duration: "30 sec" },
          { name: "Leg Raises", duration: "30 sec" },
          { name: "Round 2", note: "30 sec on / 10 sec rest" },
          { name: "Side Plank (L)", duration: "30 sec" },
          { name: "Side Plank (R)", duration: "30 sec" },
          { name: "Dead Bug", duration: "30 sec" },
          { name: "Flutter Kicks", duration: "30 sec" },
          { name: "Round 3", note: "30 sec on / 10 sec rest" },
          { name: "Mountain Climbers", duration: "30 sec" },
          { name: "V-Ups", duration: "30 sec" },
          { name: "Superman Holds", duration: "30 sec" },
          { name: "Hollow Body Hold", duration: "30 sec" },
          { name: "Round 4", note: "30 sec on / 10 sec rest" },
          { name: "Plank to Push-Up", duration: "30 sec" },
          { name: "Toe Touches", duration: "30 sec" },
          { name: "Bird Dog", duration: "30 sec" },
          { name: "Ab Wheel Rollout", duration: "30 sec" },
        ],
      },
    ],
  })),
};

// ─── ASS-ASSASSINATION ────────────────────────────────────────────────────────
const aaWeekConfig = [
  { sets: 3, reps: 12, focus: "Foundation — establish movement patterns" },
  { sets: 4, reps: 12, focus: "Volume increase — add one set to every exercise" },
  { sets: 3, reps: 15, focus: "Rep increase — same sets, push the reps" },
  { sets: 4, reps: 15, focus: "Peak volume — 4 sets at 15 reps" },
  { sets: 3, reps: 20, focus: "Endurance phase — high rep, metabolic stress" },
  { sets: 4, reps: 20, focus: "Final push — maximum volume, maximum gains" },
];

export const assAssassination: TufProgram = {
  id: "ass-assassination",
  title: "Ass-Assassination",
  subtitle: "6-Week Glute Development Program",
  description:
    "A targeted 6-week program designed to build and shape the glutes through progressive overload. Three workouts per week with weekly accountability check-ins. Progressive overload built in — sets and reps increase each week.",
  duration: "6 Weeks",
  daysPerWeek: 3,
  level: "beginner",
  category: "Glute / Lower Body",
  tags: ["Glutes", "Lower Body", "Progressive Overload", "Women", "Strength"],
  schedule: "3 days per week — Mon / Wed / Fri recommended",
  weeks: aaWeekConfig.map((config, i) => ({
    week: i + 1,
    label: `Week ${i + 1}`,
    focus: config.focus,
    workouts: [
      {
        id: `aa-w${i + 1}-workout1`,
        title: "Workout 1 — Squat Focus",
        focus: "Quad-dominant glute activation",
        warmup: "5-minute walk or jog",
        exercises: [
          { name: "Squats", sets: config.sets, reps: `${config.reps} reps` },
          { name: "Lunges", sets: config.sets, reps: `${config.reps} reps each leg` },
          { name: "Glute Bridges", sets: config.sets, reps: `${config.reps} reps` },
          { name: "Leg Press", sets: config.sets, reps: `${config.reps} reps` },
        ],
      },
      {
        id: `aa-w${i + 1}-workout2`,
        title: "Workout 2 — Hip Hinge Focus",
        focus: "Posterior chain and hip extension",
        warmup: "5-minute walk or jog",
        exercises: [
          { name: "Deadlifts", sets: config.sets, reps: `${config.reps} reps` },
          { name: "Step-Ups", sets: config.sets, reps: `${config.reps} reps each leg` },
          { name: "Hip Thrusts", sets: config.sets, reps: `${config.reps} reps` },
          { name: "Cable Kickbacks", sets: config.sets, reps: `${config.reps} reps each leg` },
        ],
      },
      {
        id: `aa-w${i + 1}-workout3`,
        title: "Workout 3 — Isolation Focus",
        focus: "Glute isolation and mind-muscle connection",
        warmup: "5-minute walk or jog",
        exercises: [
          { name: "Bulgarian Split Squats", sets: config.sets, reps: `${config.reps} reps each leg` },
          { name: "Romanian Deadlifts", sets: config.sets, reps: `${config.reps} reps` },
          { name: "Donkey Kicks", sets: config.sets, reps: `${config.reps} reps each leg` },
          { name: "Fire Hydrants", sets: config.sets, reps: `${config.reps} reps each leg` },
        ],
      },
    ],
  })),
};

export const TUF_PROGRAMS: TufProgram[] = [maximumOverdrive, assAssassination];
