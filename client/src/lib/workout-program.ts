/**
 * TurnedUp Fitness — 12-Week Workout Program
 * © 2026 Turned Up Fitness LLC — All Rights Reserved
 * Target: 40+ Beginner · 3 Days/Week · Strength + Movement + Conditioning
 */

export const WORKOUT_PROGRAM = {
  meta: {
    title: "The Complete 12-Week Program for 40+",
    subtitle: "Beginner · 3 Days Per Week · Strength + Movement + Conditioning",
    duration: "12 Weeks",
    frequency: "3 Days/Week",
    level: "Beginner 40+",
    sessionLength: "45-60 min",
    equipment: "Minimal",
    modifications: "Built In",
  },
  phases: [
    {
      id: 1,
      name: "FOUNDATION",
      weeks: "1-4",
      goal: "Movement Quality — Learn to move correctly with complete control and zero pain.",
      description: "Every rep should be performed with complete control and zero pain. Weights are intentionally light. Your ego might tell you to go heavier — your body will thank you for listening to the program instead.",
    },
    {
      id: 2,
      name: "BUILD",
      weeks: "5-8",
      goal: "Progressive Load — Add load and volume as patterns become automatic.",
      description: "The patterns are now automatic. You progressively add load and volume, building real strength on top of solid mechanics.",
    },
    {
      id: 3,
      name: "STRENGTHEN",
      weeks: "9-12",
      goal: "True Capacity — Push toward your true capacity with solid mechanics underneath.",
      description: "You push toward your true capacity with the confidence of solid mechanics underneath you. This is where real transformation happens.",
    },
  ],
  weeks: [
    {
      week: 1,
      phase: "Foundation",
      focus: "Movement Quality — Learning the Six Patterns",
      days: [
        {
          day: 1,
          focus: "Push and Core",
          exercises: [
            { type: "Strength", name: "Wall Push-Ups", sets: 3, reps: "12", notes: "Focus on chest to wall, elbows at 45 degrees, full range" },
            { type: "Movement", name: "Knee Plank", sets: 3, reps: "20 seconds", notes: "Hips level, core braced, breathe normally throughout" },
            { type: "Conditioning", name: "10-minute walk", sets: 1, reps: "10 min", notes: "Comfortable pace — conversational pace, not a stroll" },
          ],
          modification: "If wrists hurt, use fists on the floor for push-ups",
        },
        {
          day: 2,
          focus: "Hinge and Pull",
          exercises: [
            { type: "Strength", name: "Glute Bridge", sets: 3, reps: "15", notes: "Two-second hold at the top, squeeze glutes fully each rep" },
            { type: "Movement", name: "Band Row or Table Row", sets: 3, reps: "10", notes: "Chest proud, elbows close to body, squeeze shoulder blades" },
            { type: "Conditioning", name: "Interval Walk", sets: 2, reps: "5 min", notes: "5-minute walk, rest 2 minutes, 5-minute walk — controlled breathing" },
          ],
          modification: "Elevate feet on a chair for glute bridges to increase range",
        },
        {
          day: 3,
          focus: "Squat and Carry",
          exercises: [
            { type: "Strength", name: "High Box Squat", sets: 3, reps: "10", notes: "Sit to box gently, stand tall — do not crash onto the box" },
            { type: "Movement", name: "Farmer Carry", sets: 3, reps: "30 seconds", notes: "Light dumbbells or water jugs, tall posture, core engaged" },
            { type: "Conditioning", name: "Continuous Walk", sets: 1, reps: "8 min", notes: "Aim to maintain a steady comfortable pace for the full 8 minutes" },
          ],
          modification: "Use a higher box or chair if knee pain occurs during descent",
        },
      ],
    },
    {
      week: 2,
      phase: "Foundation",
      focus: "Refining Patterns — Adding Slight Intensity",
      days: [
        {
          day: 1,
          focus: "Push and Core",
          exercises: [
            { type: "Strength", name: "Incline Push-Up", sets: 3, reps: "10", notes: "Hands on counter height, body straight diagonal line" },
            { type: "Movement", name: "Full Plank", sets: 3, reps: "20 seconds", notes: "Arms extended, body straight, breathe steadily" },
            { type: "Conditioning", name: "Walk", sets: 1, reps: "12 min", notes: "Slightly faster pace than Week 1" },
          ],
          modification: "Return to knee plank if full plank causes lower back pain",
        },
        {
          day: 2,
          focus: "Hinge and Pull",
          exercises: [
            { type: "Strength", name: "Glute Bridge with Hold", sets: 3, reps: "12", notes: "3-second hold at top — squeeze hard" },
            { type: "Movement", name: "DB Row", sets: 3, reps: "10 each", notes: "Light dumbbell, elbow close to body, full range" },
            { type: "Conditioning", name: "Interval Walk", sets: 2, reps: "6 min", notes: "6 min walk, 90 sec rest, 6 min walk" },
          ],
          modification: "Use table row if no dumbbells available",
        },
        {
          day: 3,
          focus: "Squat and Carry",
          exercises: [
            { type: "Strength", name: "Box Squat", sets: 3, reps: "10", notes: "Slightly lower box than Week 1 if comfortable" },
            { type: "Movement", name: "Farmer Carry", sets: 3, reps: "40 seconds", notes: "Slightly heavier than Week 1" },
            { type: "Conditioning", name: "Continuous Walk", sets: 1, reps: "10 min", notes: "Maintain steady pace" },
          ],
          modification: "Keep box height high if any knee discomfort",
        },
      ],
    },
    {
      week: 3,
      phase: "Foundation",
      focus: "Building Confidence — Patterns Becoming Automatic",
      days: [
        {
          day: 1,
          focus: "Push and Core",
          exercises: [
            { type: "Strength", name: "Incline Push-Up", sets: 3, reps: "12", notes: "Lower surface than Week 2 if strength allows" },
            { type: "Movement", name: "Plank", sets: 3, reps: "30 seconds", notes: "Focus on breathing — don't hold breath" },
            { type: "Conditioning", name: "Walk", sets: 1, reps: "15 min", notes: "Brisk pace — you should be able to talk but feel slightly breathless" },
          ],
          modification: "Incline push-up on counter if floor is too challenging",
        },
        {
          day: 2,
          focus: "Hinge and Pull",
          exercises: [
            { type: "Strength", name: "Single Leg Glute Bridge", sets: 3, reps: "10 each", notes: "One foot elevated, drive through heel" },
            { type: "Movement", name: "DB Row", sets: 3, reps: "12 each", notes: "Same weight as Week 2, focus on form" },
            { type: "Conditioning", name: "Interval Walk", sets: 3, reps: "5 min", notes: "5 min walk, 1 min rest x3" },
          ],
          modification: "Use two-leg bridge if single leg is too challenging",
        },
        {
          day: 3,
          focus: "Squat and Carry",
          exercises: [
            { type: "Strength", name: "Goblet Squat", sets: 3, reps: "8", notes: "Light weight, chest tall, knees track over toes" },
            { type: "Movement", name: "Farmer Carry", sets: 3, reps: "45 seconds", notes: "Heavier than Week 2" },
            { type: "Conditioning", name: "Continuous Walk", sets: 1, reps: "12 min", notes: "Brisk pace throughout" },
          ],
          modification: "Return to box squat if goblet squat causes discomfort",
        },
      ],
    },
    {
      week: 4,
      phase: "Foundation",
      focus: "Consolidation — Proving the Foundation is Solid",
      days: [
        {
          day: 1,
          focus: "Push and Core",
          exercises: [
            { type: "Strength", name: "Push-Up (floor or incline)", sets: 4, reps: "10", notes: "Choose the hardest variation you can do with perfect form" },
            { type: "Movement", name: "Plank", sets: 3, reps: "40 seconds", notes: "Longest hold yet — breathe steadily" },
            { type: "Conditioning", name: "Walk", sets: 1, reps: "20 min", notes: "Continuous brisk walk" },
          ],
          modification: "Any push-up variation is acceptable — form over difficulty",
        },
        {
          day: 2,
          focus: "Hinge and Pull",
          exercises: [
            { type: "Strength", name: "Romanian Deadlift", sets: 3, reps: "10", notes: "Light dumbbells, hinge at hips, slight knee bend, back flat" },
            { type: "Movement", name: "DB Row", sets: 4, reps: "10 each", notes: "Slight increase in weight if Week 3 felt easy" },
            { type: "Conditioning", name: "Interval Walk", sets: 2, reps: "8 min", notes: "8 min walk, 1 min rest x2" },
          ],
          modification: "Use glute bridge if RDL causes lower back discomfort",
        },
        {
          day: 3,
          focus: "Squat and Carry",
          exercises: [
            { type: "Strength", name: "Goblet Squat", sets: 4, reps: "10", notes: "Slightly heavier than Week 3" },
            { type: "Movement", name: "Farmer Carry", sets: 3, reps: "60 seconds", notes: "Heaviest carry yet — tall posture throughout" },
            { type: "Conditioning", name: "Continuous Walk", sets: 1, reps: "15 min", notes: "Brisk pace — Phase 1 complete" },
          ],
          modification: "Reduce weight if form breaks down",
        },
      ],
    },
    {
      week: 5,
      phase: "Build",
      focus: "Loading the Patterns — First Real Strength Work",
      days: [
        {
          day: 1,
          focus: "Push and Core",
          exercises: [
            { type: "Strength", name: "DB Bench Press", sets: 3, reps: "10", notes: "Light-moderate dumbbells, elbows at 45 degrees" },
            { type: "Movement", name: "Plank with Shoulder Tap", sets: 3, reps: "8 each side", notes: "Hips stable, slow and controlled" },
            { type: "Conditioning", name: "Bike or Walk", sets: 1, reps: "20 min", notes: "Moderate intensity — slightly breathless" },
          ],
          modification: "Return to incline push-up if bench press is unavailable",
        },
        {
          day: 2,
          focus: "Hinge and Pull",
          exercises: [
            { type: "Strength", name: "Romanian Deadlift", sets: 3, reps: "12", notes: "Moderate weight — feel the hamstring stretch" },
            { type: "Movement", name: "Seated Cable Row or DB Row", sets: 3, reps: "12", notes: "Full range, squeeze shoulder blades at top" },
            { type: "Conditioning", name: "Interval Walk/Bike", sets: 3, reps: "6 min", notes: "6 min moderate, 2 min easy x3" },
          ],
          modification: "Reduce weight if lower back rounds during RDL",
        },
        {
          day: 3,
          focus: "Squat and Carry",
          exercises: [
            { type: "Strength", name: "Goblet Squat", sets: 4, reps: "10", notes: "Heavier than Phase 1 — controlled descent" },
            { type: "Movement", name: "Suitcase Carry", sets: 3, reps: "30 seconds each side", notes: "One dumbbell, resist lateral lean" },
            { type: "Conditioning", name: "Continuous Walk/Bike", sets: 1, reps: "20 min", notes: "Moderate intensity" },
          ],
          modification: "Box squat if goblet squat causes knee discomfort",
        },
      ],
    },
  ],
} as const;

export const HEALTH_MODIFICATIONS = {
  conditions: [
    {
      id: "bad-knees",
      name: "Bad Knees",
      affects: "65% of 40+",
      rootCause: "Weak Glutes & Quads",
      recoveryTime: "8-12 Weeks",
      description: "Most knee pain in people over 40 is not actually a knee problem — it is a strength problem. The solution is to move smarter and build the muscles that protect the joint.",
      avoidExercises: [
        "Deep squats below parallel",
        "Leg extensions on machine",
        "Running on hard surfaces",
        "Lunges with forward knee drive",
        "Box jumps or plyometrics",
      ],
      substitutions: [
        { instead: "Deep Squat", use: "Box Squat (high box)", why: "Limits knee flexion angle — keeps load in safe range while building quad strength" },
        { instead: "Standard Lunge", use: "Reverse Lunge", why: "Shifts load to hip extensors, dramatically reduces knee shear force" },
        { instead: "Leg Press (full range)", use: "Leg Press (partial — top half only)", why: "Maintains quad engagement while eliminating the deep compression zone" },
        { instead: "Running", use: "Walking on incline or cycling", why: "Same cardiovascular benefit with zero impact on the knee joint" },
        { instead: "Jump Squats", use: "Slow Eccentric Squats (4 seconds down)", why: "Builds quad strength safely — the slow lowering is where the real work happens" },
      ],
    },
    {
      id: "lower-back",
      name: "Lower Back Pain",
      affects: "80% of 40+",
      rootCause: "Weak Core & Hip Flexors",
      recoveryTime: "6-10 Weeks",
      description: "Lower back pain in adults over 40 is almost always a core stability problem. The spine needs the surrounding muscles to act as a corset — when those muscles are weak, the spine takes the load it was never designed to bear alone.",
      avoidExercises: [
        "Sit-ups and crunches",
        "Deadlifts with rounded back",
        "Heavy overhead pressing",
        "Toe touches with straight legs",
        "High-impact activities during flare-ups",
      ],
      substitutions: [
        { instead: "Sit-ups", use: "Dead Bug", why: "Builds deep core stability without spinal flexion — the safest core exercise for lower back issues" },
        { instead: "Conventional Deadlift", use: "Trap Bar Deadlift or Romanian Deadlift", why: "More upright torso position reduces lower back shear force significantly" },
        { instead: "Overhead Press (standing)", use: "Seated DB Press", why: "Seated position provides spinal support and reduces lumbar compression" },
        { instead: "Bent-over Row", use: "Chest-Supported Row", why: "Chest support eliminates the lower back stabilization demand entirely" },
      ],
    },
    {
      id: "shoulder-issues",
      name: "Shoulder Issues",
      affects: "55% of 40+",
      rootCause: "Rotator Cuff Weakness",
      recoveryTime: "8-16 Weeks",
      description: "The rotator cuff — four small muscles that stabilize the shoulder joint — weakens with age and inactivity. Most shoulder pain is impingement: the tendons get pinched between bones because the stabilizing muscles can no longer hold the joint in proper position.",
      avoidExercises: [
        "Behind-the-neck press",
        "Upright rows",
        "Wide-grip bench press",
        "Overhead throwing movements",
        "Any exercise that causes pain in the arc 60-120 degrees",
      ],
      substitutions: [
        { instead: "Barbell Overhead Press", use: "Neutral Grip DB Press", why: "Neutral grip reduces impingement — the most shoulder-friendly pressing position" },
        { instead: "Wide-grip Bench Press", use: "Close-grip or Neutral Grip Press", why: "Reduces the external rotation demand that causes impingement" },
        { instead: "Lat Pulldown behind neck", use: "Lat Pulldown to chest", why: "Eliminates the dangerous end-range position that strains the rotator cuff" },
        { instead: "Upright Row", use: "Face Pull or Band Pull-Apart", why: "Directly strengthens the rotator cuff in a pain-free range" },
      ],
    },
  ],
};

export const NUTRITION_FRAMEWORK = {
  title: "40+ Nutrition Framework",
  subtitle: "Five Nutritional Shifts Required After 40",
  sarcopeniaNote: "The body loses between 3 and 8 percent of its muscle mass every decade. Muscle is metabolically expensive tissue — it burns calories even at rest. As muscle decreases, metabolism slows.",
  shifts: [
    {
      id: 1,
      title: "Increase Protein",
      subtitle: "More Than You Think",
      target: "1.2–1.6g per kg of bodyweight",
      description: "Adults over 40 need between 1.2 and 1.6 grams of protein per kilogram of body weight to maintain muscle mass. For a 180-pound person that is between 98 and 130 grams of protein per day.",
      practical: "Protein at every single meal without exception. Chicken, fish, eggs, Greek yogurt, legumes — every meal needs an anchor protein source.",
      color: "#3A7BD5",
    },
    {
      id: 2,
      title: "Prioritize Anti-Inflammatory Foods",
      subtitle: "Fight Chronic Inflammation",
      target: "Omega-3s + Colorful Vegetables Daily",
      description: "Chronic low-grade inflammation is the underlying driver of most age-related diseases. The 40+ body produces more inflammatory markers and recovers more slowly.",
      practical: "Omega-3 fatty acids from fatty fish, walnuts, and flaxseed. Dark leafy greens, berries, and cruciferous vegetables provide polyphenols and antioxidants.",
      color: "#2DAA4F",
    },
    {
      id: 3,
      title: "Manage Blood Sugar",
      subtitle: "More Aggressively",
      target: "Complex Carbs Only",
      description: "Insulin sensitivity naturally declines with age. The same person eating the same diet they ate at 30 will gain weight in their 40s simply because their body handles carbohydrates differently.",
      practical: "Complex carbohydrates from sweet potatoes, legumes, oats, and vegetables. Avoid white bread, sugary drinks, and processed snacks.",
      color: "#E8651A",
    },
    {
      id: 4,
      title: "Support Bone and Joint Health",
      subtitle: "Proactively",
      target: "Calcium + Vitamin D + Collagen",
      description: "Bone density peaks in the late 20s and declines from there. Collagen production also declines sharply after 40.",
      practical: "Calcium and vitamin D are obvious. Magnesium from dark leafy greens, nuts, and seeds. Vitamin C from citrus and bell peppers supports collagen synthesis.",
      color: "#C8973A",
    },
    {
      id: 5,
      title: "Optimize Gut Health",
      subtitle: "The Foundation of Everything",
      target: "Fermented Foods + High Fiber",
      description: "The gut microbiome changes significantly after 40, becoming less diverse and less resilient. A healthy gut affects immune function, mood, sleep, and metabolic health.",
      practical: "Fermented foods like sauerkraut, Greek yogurt, kefir, and kimchi. High-fiber foods from vegetables, legumes, and whole grains.",
      color: "#9B59B6",
    },
  ],
};
