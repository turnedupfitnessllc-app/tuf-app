// TUF Data Layer — Source of Truth
// TurnedUp Fitness LLC
// Pillars: MOVE (exercises) · FUEL (nutrition) · FEAST (recipes)

export const TUF_DATA = {
  meta: {
    version: "2.0",
    brand: "TurnedUp Fitness LLC",
    target: "40+",
    pillars: ["MOVE", "FUEL", "FEAST"],
  },

  exercises: [
    // ── CHEST ──
    {
      id: "chest-001",
      name: "Wall Push-Up",
      muscle: "chest",
      level: "B",
      equipment: "No Equipment",
      sets: "3",
      reps: "12",
      rest: "60s",
      tempo: "2-1-2",
      intensity: "Light",
      primaryMuscle: "Pectorals",
      secondaryMuscle: "Shoulders, Triceps",
      coachingCue:
        "Hands shoulder-width on wall, body in a straight line. Chest nearly touches wall on descent. Push back to full extension. 2 seconds down, pause, 2 seconds up.",
      modifications: [
        { condition: "Bad shoulder", mod: "Reduce range of motion" },
        { condition: "Wrist pain", mod: "Make fists instead of flat hands" },
      ],
      scienceNote:
        "Wall push-ups activate the serratus anterior — a muscle that stabilizes the shoulder blade, frequently weak in adults 40+ due to sedentary posture.",
      video: { type: null, url: null },
      published: true,
      pillar: "MOVE",
    },
    {
      id: "chest-002",
      name: "Incline Push-Up",
      muscle: "chest",
      level: "B",
      equipment: "Chair / Counter",
      sets: "3",
      reps: "10",
      rest: "60s",
      tempo: "2-1-2",
      intensity: "Light",
      primaryMuscle: "Lower Pectorals",
      secondaryMuscle: "Shoulders, Triceps",
      coachingCue:
        "Hands on sturdy surface at hip height. Body forms a straight diagonal line. Lower chest to surface with control. Elbows at 45 degrees. Drive through palms to full extension.",
      modifications: [
        { condition: "Progression", mod: "Lower the surface height as you get stronger" },
      ],
      scienceNote:
        "The incline angle reduces shoulder stress — the ideal bridge exercise for adults rebuilding pressing strength safely after 40.",
      video: { type: null, url: null },
      published: true,
      pillar: "MOVE",
    },
    {
      id: "chest-003",
      name: "DB Bench Press",
      muscle: "chest",
      level: "I",
      equipment: "Dumbbells",
      sets: "4",
      reps: "10",
      rest: "75s",
      tempo: "2-1-2",
      intensity: "Moderate",
      primaryMuscle: "Pectorals",
      secondaryMuscle: "Anterior Deltoid, Triceps",
      coachingCue:
        "Elbows at 45 degrees — never flared to 90. Lower dumbbells until arms are parallel to floor. Press up and slightly inward.",
      modifications: [],
      scienceNote:
        "Dumbbells allow each arm to move independently, correcting strength imbalances common after 40.",
      video: { type: null, url: null },
      published: true,
      pillar: "MOVE",
    },
    {
      id: "chest-004",
      name: "DB Chest Fly",
      muscle: "chest",
      level: "I",
      equipment: "Dumbbells",
      sets: "3",
      reps: "12",
      rest: "60s",
      tempo: "3-1-2",
      intensity: "Light",
      primaryMuscle: "Pectorals (stretch)",
      secondaryMuscle: "Anterior Deltoid",
      coachingCue:
        "Slight fixed bend in elbows throughout. Wide arc downward until deep chest stretch. Squeeze pecs to bring weights back. Control 3 full seconds.",
      modifications: [],
      scienceNote:
        "The fly stretches the pectoral muscle under load — one of the most powerful stimuli for muscle growth.",
      video: { type: null, url: null },
      published: true,
      pillar: "MOVE",
    },
    {
      id: "chest-005",
      name: "Decline Push-Up",
      muscle: "chest",
      level: "A",
      equipment: "Bodyweight",
      sets: "4",
      reps: "12",
      rest: "60s",
      tempo: "2-1-2",
      intensity: "High",
      primaryMuscle: "Upper Pectorals",
      secondaryMuscle: "Shoulders, Triceps, Core",
      coachingCue:
        "Feet elevated on chair or step. Body perfectly straight — brace core hard. Lower chest toward floor, elbows at 45 degrees. Push explosively back.",
      modifications: [],
      scienceNote:
        "Decline push-ups train upper chest and core simultaneously — two critical areas in one movement.",
      video: { type: null, url: null },
      published: true,
      pillar: "MOVE",
    },
    // ── BACK ──
    {
      id: "back-001",
      name: "Seated Band Row",
      muscle: "back",
      level: "B",
      equipment: "Resistance Band",
      sets: "3",
      reps: "12",
      rest: "60s",
      tempo: "2-1-2",
      intensity: "Light",
      primaryMuscle: "Rhomboids, Mid Traps",
      secondaryMuscle: "Biceps, Rear Delts",
      coachingCue:
        "Anchor band at foot level. Sit tall. Pull elbows past your torso. Squeeze shoulder blades together for 2 seconds. Slowly return to full extension.",
      modifications: [],
      scienceNote:
        "Seated rows directly strengthen rhomboids and mid-traps — responsible for pulling shoulders back into proper alignment.",
      video: { type: null, url: null },
      published: true,
      pillar: "MOVE",
    },
    {
      id: "back-002",
      name: "Band Pull-Apart",
      muscle: "back",
      level: "B",
      equipment: "Resistance Band",
      sets: "3",
      reps: "15",
      rest: "45s",
      tempo: "2-1-2",
      intensity: "Light",
      primaryMuscle: "Rear Delts, Rhomboids",
      secondaryMuscle: "Rotator Cuff",
      coachingCue:
        "Arms straight out at shoulder height. Pull band apart driving elbows back. Squeeze shoulder blades at end range for 1 second. No shrugging.",
      modifications: [],
      scienceNote:
        "The band pull-apart directly counters the internal rotation pattern causing shoulder impingement — the #1 shoulder injury in this age group.",
      video: { type: null, url: null },
      published: true,
      pillar: "MOVE",
    },
  ],

  nutrition: {
    dailyTargets: {
      protein: 150,
      carbs: 200,
      fat: 65,
      calories: 2000,
    },
    meals: [
      {
        id: "meal-001",
        name: "Breakfast",
        time: "08:00",
        target: 500,
        current: 0,
      },
      {
        id: "meal-002",
        name: "Lunch",
        time: "12:30",
        target: 600,
        current: 0,
      },
      {
        id: "meal-003",
        name: "Dinner",
        time: "18:00",
        target: 700,
        current: 0,
      },
      {
        id: "meal-004",
        name: "Snacks",
        time: "15:00",
        target: 200,
        current: 0,
      },
    ],
  },

  recipes: [
    {
      id: "recipe-001",
      name: "Grilled Chicken with Quinoa",
      pillar: "FEAST",
      servings: 2,
      prepTime: "15m",
      cookTime: "25m",
      macros: {
        protein: 45,
        carbs: 55,
        fat: 12,
        calories: 480,
      },
      ingredients: [
        "2x 6oz chicken breasts",
        "1 cup cooked quinoa",
        "2 cups broccoli",
        "1 tbsp olive oil",
      ],
      instructions: [
        "Preheat grill to medium-high",
        "Season chicken with salt, pepper, garlic",
        "Grill chicken 6-7 minutes per side",
        "Cook quinoa per package directions",
        "Steam broccoli 4-5 minutes",
        "Plate and serve",
      ],
    },
  ],

  memberProfile: {
    name: "Alex",
    age: 42,
    level: "Intermediate",
    joinDate: "2024-01-15",
    stats: {
      workoutsCompleted: 24,
      totalMinutes: 1440,
      currentStreak: 8,
      personalRecords: 3,
    },
  },
};

export type Exercise = (typeof TUF_DATA.exercises)[0];
export type Recipe = (typeof TUF_DATA.recipes)[0];
