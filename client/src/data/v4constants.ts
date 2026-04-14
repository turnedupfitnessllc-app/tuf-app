/**
 * TUF APP — PANTHER UX SYSTEM v4.0
 * Shared constants, data structures, and utilities
 * Five screens · 6-scene arc · State-based Panther · Full clinical brain
 */

// ── WEEK THEMES ───────────────────────────────────────────────────────────────
export const WEEK_THEMES: Record<number, { label: string; color: string; focus: string; icon: string }> = {
  1: { label: "MOBILITY + ACTIVATION", color: "#4a9eff", focus: "Tissue quality. Motor pattern. Move without restriction.", icon: "💧" },
  2: { label: "STABILITY + CONTROL",   color: "#C8973A", focus: "Neuromuscular control. Single leg. Anti-rotation.", icon: "⚖️" },
  3: { label: "STRENGTH",              color: "#FF6600", focus: "Progressive load. Compound movements. Mechanical tension.", icon: "🔥" },
  4: { label: "PERFORMANCE",           color: "#22c55e", focus: "Top-end intensity. Power expression. Test your output.", icon: "⚡" },
};

// ── QUICK ISSUES ──────────────────────────────────────────────────────────────
export interface Issue {
  id: string;
  label: string;
  icon: string;
  color: string;
  verdict: string;
  pattern: string;
  cue: string;
  correctives: Array<{ name: string; sets: string; phase: string }>;
}

export const ISSUES: Issue[] = [
  {
    id: "front_shoulder",
    label: "Front Shoulder",
    icon: "💪",
    color: "#2563eb",
    verdict: "THAT'S YOUR ANTERIOR CHAIN PULLING FORWARD.",
    pattern: "Upper Crossed Syndrome — tight pec minor, weak lower traps/serratus anterior",
    cue: "Pull your shoulder blades DOWN and BACK before every press. Own the position before you load it.",
    correctives: [
      { name: "Pec Minor Release", sets: "60 sec/side", phase: "INHIBIT" },
      { name: "Thoracic Extension on Foam Roller", sets: "10 reps", phase: "LENGTHEN" },
      { name: "Wall Angel", sets: "3×10", phase: "ACTIVATE" },
      { name: "Y-T-W", sets: "3×12", phase: "ACTIVATE" },
      { name: "Band Pull-Apart", sets: "3×15", phase: "INTEGRATE" },
    ],
  },
  {
    id: "anterior_knee",
    label: "Anterior Knee",
    icon: "🦵",
    color: "#FF6600",
    verdict: "YOUR GLUTES AREN'T FIRING. YOUR KNEE IS PAYING.",
    pattern: "Lower Crossed Syndrome — weak glutes/VMO, tight TFL/IT band",
    cue: "Drive your knees OUT over your toes. Feel your glutes — if you don't, stop and reset.",
    correctives: [
      { name: "IT Band/TFL Release", sets: "60 sec/side", phase: "INHIBIT" },
      { name: "Hip Flexor Stretch", sets: "60 sec/side", phase: "LENGTHEN" },
      { name: "Clamshell", sets: "3×15/side", phase: "ACTIVATE" },
      { name: "Lateral Band Walk", sets: "3×15/side", phase: "ACTIVATE" },
      { name: "Single Leg Squat to Box", sets: "3×10/side", phase: "INTEGRATE" },
    ],
  },
  {
    id: "lower_back",
    label: "Lower Back",
    icon: "🔴",
    color: "#C8973A",
    verdict: "THAT'S YOUR HIP FLEXORS TALKING. NOT YOUR BACK.",
    pattern: "Lower Crossed Syndrome — tight hip flexors, weak glutes/core",
    cue: "Brace your core BEFORE you move. Posterior pelvic tilt. Your back is a symptom — your hips are the cause.",
    correctives: [
      { name: "Hip Flexor Release", sets: "60 sec/side", phase: "INHIBIT" },
      { name: "Kneeling Hip Flexor Stretch", sets: "60 sec/side", phase: "LENGTHEN" },
      { name: "Dead Bug", sets: "3×10/side", phase: "ACTIVATE" },
      { name: "Glute Bridge", sets: "3×15", phase: "ACTIVATE" },
      { name: "Bird Dog", sets: "3×10/side", phase: "INTEGRATE" },
    ],
  },
  {
    id: "anterior_hip",
    label: "Front Hip / Groin",
    icon: "🏃",
    color: "#7c3aed",
    verdict: "EIGHT HOURS SITTING. YOUR HIP FLEXORS ARE LOCKED.",
    pattern: "Hip flexor dominance — tight iliopsoas, weak posterior chain",
    cue: "Stand tall. Squeeze your glute on the back leg. Feel the stretch — that's the tissue you've been ignoring.",
    correctives: [
      { name: "Iliopsoas Release", sets: "60 sec/side", phase: "INHIBIT" },
      { name: "90/90 Hip Stretch", sets: "60 sec/side", phase: "LENGTHEN" },
      { name: "Fire Hydrant", sets: "3×15/side", phase: "ACTIVATE" },
      { name: "Hip Hinge", sets: "3×12", phase: "ACTIVATE" },
      { name: "Lateral Lunge", sets: "3×10/side", phase: "INTEGRATE" },
    ],
  },
  {
    id: "neck",
    label: "Neck / Cervical",
    icon: "🧠",
    color: "#0d9488",
    verdict: "YOUR HEAD WEIGHS 12 POUNDS. IT'S IN THE WRONG PLACE.",
    pattern: "Upper Crossed Syndrome — tight SCM/upper traps, weak deep neck flexors",
    cue: "Chin tuck. Every hour. Your screen is not worth a herniated disc.",
    correctives: [
      { name: "Upper Trap Release", sets: "60 sec/side", phase: "INHIBIT" },
      { name: "Levator Scapulae Stretch", sets: "60 sec/side", phase: "LENGTHEN" },
      { name: "Chin Tuck", sets: "3×15", phase: "ACTIVATE" },
      { name: "Deep Neck Flexor Hold", sets: "3×10 sec", phase: "ACTIVATE" },
      { name: "Wall Angel", sets: "3×10", phase: "INTEGRATE" },
    ],
  },
  {
    id: "upper_back",
    label: "Upper Back",
    icon: "🔧",
    color: "#16a34a",
    verdict: "YOUR UPPER BACK IS FOLDING YOU FORWARD.",
    pattern: "Thoracic kyphosis — tight anterior chain, weak thoracic extensors",
    cue: "Open your chest. Retract your scapulae. Your thoracic spine needs to EXTEND — not flex more.",
    correctives: [
      { name: "Thoracic Foam Roll", sets: "60 sec", phase: "INHIBIT" },
      { name: "Doorway Pec Stretch", sets: "60 sec/side", phase: "LENGTHEN" },
      { name: "Thoracic Extension over Roller", sets: "3×10", phase: "ACTIVATE" },
      { name: "Face Pull", sets: "3×15", phase: "ACTIVATE" },
      { name: "Overhead Squat", sets: "3×10", phase: "INTEGRATE" },
    ],
  },
  {
    id: "ankle_foot",
    label: "Ankle / Foot",
    icon: "👟",
    color: "#dc2626",
    verdict: "YOUR ANKLE WON'T BEND. YOUR KNEE PAYS THE PRICE.",
    pattern: "Limited ankle dorsiflexion — tight gastrocnemius/soleus, restricted joint mobility",
    cue: "Your squat depth is limited by your ankle, not your hip. Fix the ankle, unlock the pattern.",
    correctives: [
      { name: "Calf/Soleus Release", sets: "60 sec/side", phase: "INHIBIT" },
      { name: "Standing Calf Stretch", sets: "60 sec/side", phase: "LENGTHEN" },
      { name: "Ankle Circles", sets: "3×15/side", phase: "ACTIVATE" },
      { name: "Ankle Dorsiflexion Drill", sets: "3×10/side", phase: "ACTIVATE" },
      { name: "Goblet Squat with Heel Elevation", sets: "3×10", phase: "INTEGRATE" },
    ],
  },
  {
    id: "deep_glute",
    label: "Deep Glute",
    icon: "🍑",
    color: "#9333ea",
    verdict: "THAT'S YOUR PIRIFORMIS. IT'S BEEN IGNORED TOO LONG.",
    pattern: "Piriformis syndrome — tight external rotators, weak glute medius",
    cue: "Your deep glute is screaming because your glute medius isn't working. Activate the whole system.",
    correctives: [
      { name: "Piriformis Release", sets: "60 sec/side", phase: "INHIBIT" },
      { name: "Pigeon Pose", sets: "90 sec/side", phase: "LENGTHEN" },
      { name: "Clamshell", sets: "3×20/side", phase: "ACTIVATE" },
      { name: "Side-Lying Hip Abduction", sets: "3×15/side", phase: "ACTIVATE" },
      { name: "Single Leg Deadlift", sets: "3×10/side", phase: "INTEGRATE" },
    ],
  },
];

// ── PROGRAM DATA ──────────────────────────────────────────────────────────────
export interface Exercise {
  name: string;
  sets: string;
  cue?: string;
}

export interface ProgramSession {
  day: number;
  label: string;
  duration: string;
  exercises: Exercise[];
}

export interface ProgramWeek {
  week: number;
  label: string;
  color: string;
  focus: string;
  icon: string;
  sessions: ProgramSession[];
}

export const PROGRAM_WEEKS: ProgramWeek[] = [
  {
    week: 1,
    ...WEEK_THEMES[1],
    sessions: [
      {
        day: 1,
        label: "CORRECTIVE + LOWER",
        duration: "40 min",
        exercises: [
          { name: "Hip Flexor Stretch", sets: "60 sec/side", cue: "Posterior pelvic tilt. Feel the front of the hip." },
          { name: "Glute Bridge", sets: "3×15", cue: "Drive through the heel. Squeeze at the top." },
          { name: "Goblet Squat", sets: "3×10", cue: "Chest tall. Knees track over toes." },
          { name: "Romanian Deadlift", sets: "3×10", cue: "Hinge at the hip. Soft knee. Feel the hamstring." },
          { name: "Lateral Band Walk", sets: "3×15/side", cue: "Stay low. Control the step." },
        ],
      },
      {
        day: 2,
        label: "POSTURE + UPPER",
        duration: "40 min",
        exercises: [
          { name: "Thoracic Extension", sets: "60 sec", cue: "Foam roller at mid-back. Arms overhead." },
          { name: "Wall Angel", sets: "3×10", cue: "Full contact with wall. Slow and controlled." },
          { name: "Face Pull", sets: "3×15", cue: "Pull to forehead. External rotation at end." },
          { name: "Band Pull-Apart", sets: "3×15", cue: "Straight arms. Squeeze scapulae." },
          { name: "Push-Up with Scapular Control", sets: "3×10", cue: "Protract fully at top. No winging." },
        ],
      },
      {
        day: 3,
        label: "FULL BODY MOBILITY",
        duration: "35 min",
        exercises: [
          { name: "90/90 Hip Stretch", sets: "90 sec/side", cue: "Sit tall. Rotate from the hip." },
          { name: "World's Greatest Stretch", sets: "5/side", cue: "Slow. Full range. Breathe into it." },
          { name: "Thoracic Rotation", sets: "10/side", cue: "Elbow to ceiling. Follow with eyes." },
          { name: "Ankle Mobility Drill", sets: "10/side", cue: "Knee over toe. Don't let heel rise." },
          { name: "Cat-Cow", sets: "10 reps", cue: "Full spinal flexion and extension." },
        ],
      },
    ],
  },
  {
    week: 2,
    ...WEEK_THEMES[2],
    sessions: [
      {
        day: 1,
        label: "SINGLE LEG STABILITY",
        duration: "45 min",
        exercises: [
          { name: "Single Leg Balance", sets: "3×30 sec/side", cue: "Soft knee. Eyes forward. Control the wobble." },
          { name: "Single Leg Deadlift", sets: "3×10/side", cue: "Hinge. Reach. Return under control." },
          { name: "Reverse Lunge", sets: "3×12/side", cue: "Front shin vertical. Knee stays behind toe." },
          { name: "Step-Up", sets: "3×12/side", cue: "Drive through the heel. Full hip extension at top." },
          { name: "Lateral Band Walk", sets: "3×20/side", cue: "Stay low. Constant tension on band." },
        ],
      },
      {
        day: 2,
        label: "ANTI-ROTATION + PUSH",
        duration: "45 min",
        exercises: [
          { name: "Pallof Press", sets: "3×12/side", cue: "Brace. Press. Don't rotate. Return slow." },
          { name: "Push-Up", sets: "3×15", cue: "Straight line. Scapular control. Full range." },
          { name: "Half-Kneeling Press", sets: "3×10/side", cue: "Brace the core. No lateral lean." },
          { name: "Dead Bug", sets: "3×10/side", cue: "Lower back stays flat. Slow the descent." },
          { name: "Plank", sets: "3×30 sec", cue: "Neutral spine. Squeeze everything." },
        ],
      },
      {
        day: 3,
        label: "HIP CONTROL + PULL",
        duration: "45 min",
        exercises: [
          { name: "Fire Hydrant", sets: "3×15/side", cue: "Stable pelvis. Move only at the hip." },
          { name: "Hip Hinge", sets: "3×12", cue: "Push hips back. Maintain neutral spine." },
          { name: "Seated Row", sets: "3×12", cue: "Retract scapulae first. Then pull." },
          { name: "Face Pull", sets: "3×15", cue: "High pull. External rotation. Slow eccentric." },
          { name: "Copenhagen Plank", sets: "3×20 sec/side", cue: "Adductor engagement. Don't sag." },
        ],
      },
    ],
  },
  {
    week: 3,
    ...WEEK_THEMES[3],
    sessions: [
      {
        day: 1,
        label: "LOWER STRENGTH",
        duration: "50 min",
        exercises: [
          { name: "Romanian Deadlift", sets: "4×8", cue: "Load the hamstring. Controlled descent." },
          { name: "Goblet Squat", sets: "4×10", cue: "Add load. Chest tall. Full depth." },
          { name: "Bulgarian Split Squat", sets: "3×10/side", cue: "Front foot forward. Vertical torso." },
          { name: "Hip Thrust", sets: "4×12", cue: "Full hip extension. Squeeze at top." },
          { name: "Calf Raise", sets: "3×15", cue: "Full range. Pause at top." },
        ],
      },
      {
        day: 2,
        label: "UPPER STRENGTH",
        duration: "50 min",
        exercises: [
          { name: "Overhead Press", sets: "4×8", cue: "Brace. Press vertical. Full lockout." },
          { name: "Bent-Over Row", sets: "4×10", cue: "Hinge. Pull to hip. Squeeze." },
          { name: "Incline Push-Up", sets: "3×12", cue: "Scapular control. Full range." },
          { name: "Lat Pulldown", sets: "3×12", cue: "Pull to chest. Retract first." },
          { name: "Y-T-W", sets: "3×10 each", cue: "Light load. Feel the lower traps." },
        ],
      },
      {
        day: 3,
        label: "FULL BODY STRENGTH",
        duration: "55 min",
        exercises: [
          { name: "Goblet Squat", sets: "4×10", cue: "Heavy. Chest tall. Knees out." },
          { name: "Single Arm Row", sets: "4×10/side", cue: "Full range. No rotation." },
          { name: "Hip Thrust", sets: "4×12", cue: "Drive. Squeeze. Control down." },
          { name: "Push-Up Variation", sets: "3×12", cue: "Choose your challenge." },
          { name: "Farmer Carry", sets: "3×30 sec", cue: "Tall. Tight. Walk with purpose." },
        ],
      },
    ],
  },
  {
    week: 4,
    ...WEEK_THEMES[4],
    sessions: [
      {
        day: 1,
        label: "POWER + LOWER",
        duration: "55 min",
        exercises: [
          { name: "Deadlift", sets: "4×5", cue: "Max intent. Brace. Pull the floor away." },
          { name: "Jump Squat", sets: "4×8", cue: "Absorb. Load. Explode. Land soft." },
          { name: "Lateral Bound", sets: "3×8/side", cue: "Push off. Stick the landing." },
          { name: "Hip Thrust", sets: "4×10", cue: "Explosive concentric. Controlled eccentric." },
          { name: "Sled Push", sets: "4×20 m", cue: "Low. Drive. Accelerate." },
        ],
      },
      {
        day: 2,
        label: "POWER + UPPER",
        duration: "55 min",
        exercises: [
          { name: "Overhead Press", sets: "4×5", cue: "Max intent. Brace. Press with authority." },
          { name: "Medicine Ball Slam", sets: "4×10", cue: "Full extension up. Slam with intent." },
          { name: "Explosive Push-Up", sets: "3×8", cue: "Leave the ground. Land controlled." },
          { name: "Bent-Over Row", sets: "4×8", cue: "Explosive pull. Controlled return." },
          { name: "Battle Ropes", sets: "4×20 sec", cue: "Max effort. Full body." },
        ],
      },
      {
        day: 3,
        label: "PERFORMANCE TEST",
        duration: "60 min",
        exercises: [
          { name: "Deadlift 1RM Test", sets: "Work to max", cue: "This is your benchmark. Own it." },
          { name: "Max Push-Ups", sets: "1 set to failure", cue: "Full range. No stopping." },
          { name: "Single Leg Balance", sets: "Max time/side", cue: "Eyes closed. How stable are you?" },
          { name: "Overhead Squat", sets: "3×10", cue: "The ultimate mobility test." },
          { name: "Farmer Carry Distance", sets: "Max distance", cue: "How far can you go?" },
        ],
      },
    ],
  },
];

// ── PANTHER FALLBACKS ─────────────────────────────────────────────────────────
export interface Fallback {
  t: string[];
  h: string;
  b: string;
  d?: string;
  s?: string;
}

export const FALLBACKS: Fallback[] = [
  { t: ["shoulder", "scapula", "overhead"], h: "THAT'S YOUR SCAPULA, NOT YOUR SHOULDER.", b: "Anterior chain dominance. Tight pec minor pulling the scapula forward. Your shoulder isn't broken — your posture is.", d: "Go to ASSESS → Front Shoulder. Build the corrective plan.", s: "coaching" },
  { t: ["knee", "valgus", "patella"],        h: "YOUR GLUTES AREN'T FIRING.",               b: "Knee valgus is a glute problem. Your TFL is compensating for a glute that won't turn on. Fix the root.", d: "Go to ASSESS → Anterior Knee. Start the corrective sequence.", s: "activated" },
  { t: ["back", "lumbar", "sitting"],        h: "THAT'S YOUR HIP FLEXORS TALKING.",         b: "Lower back pain is almost always a hip flexor and glute problem. You've been sitting too long. The back is the victim.", d: "Go to ASSESS → Lower Back. Address the root cause.", s: "coaching" },
  { t: ["neck", "cervical", "headache"],     h: "12-POUND BOWLING BALL. WRONG PLACE.",      b: "Every inch your head is forward adds 10 pounds of load to your cervical spine. That headache is a posture problem.", d: "Go to ASSESS → Neck / Cervical. Start today.", s: "coaching" },
  { t: ["upper back", "thoracic", "rounded"], h: "YOUR UPPER BACK IS FOLDING YOU FORWARD.",  b: "Thoracic kyphosis. Tight anterior chain. Your thoracic spine needs to extend — not flex more. Open the chest.", d: "Go to ASSESS → Upper Back. Build the corrective plan.", s: "coaching" },
  { t: ["ankle", "heel", "plantar", "foot"], h: "YOUR ANKLE WON'T BEND. KNEE PAYS THE PRICE.", b: "Limited ankle dorsiflexion forces compensation up the chain. Your squat depth is an ankle problem, not a hip problem.", d: "Go to ASSESS → Ankle / Foot. Fix the base.", s: "coaching" },
  { t: ["hip", "pelvis", "piriformis"],      h: "YOUR PELVIS IS PULLING YOU APART.",        b: "Tight hip flexors on one side, weak glute medius on the other. The piriformis is compensating for both.", d: "Go to ASSESS → Front Hip or Deep Glute. Start the sequence.", s: "coaching" },
  { t: ["miss", "skip", "didn't", "haven't"], h: "FIVE DAYS IS A DIRECTION.",               b: "You don't miss twice. One missed session is life. Two is a pattern. Three is a choice. Which one is this?", d: "Open PROGRAM. Start the next session. Right now.", s: "dominant" },
  { t: ["old", "age", "too late", "too old"], h: "AGE IS A VARIABLE. NOT AN EXCUSE.",       b: "Muscle responds to stimulus at any age. The research is clear. What changes is recovery time — not the ceiling.", d: "Start where you are. The adaptation is the same.", s: "activated" },
  { t: ["expensive", "cost", "afford"],      h: "PRICE VS COST. KNOW THE DIFFERENCE.",      b: "The price of this program is time and effort. The cost of not doing it is chronic pain, limited movement, and a body that quits on you.", d: "Invest in the system. It compounds.", s: "coaching" },
  { t: ["crushed", "pr", "win", "nailed"],   h: "THAT'S WHAT DISCIPLINE LOOKS LIKE.",       b: "Not motivation. Not inspiration. Discipline. You showed up when it was hard. That's the only variable that matters.", d: "Log it. Track it. Build on it.", s: "dominant" },
];

export function getFallback(text: string): Fallback {
  const l = text.toLowerCase();
  for (const f of FALLBACKS) {
    if (f.t.some(t => l.includes(t))) return f;
  }
  return { t: [], h: "BETTER OR WORSE. CHOOSE.", b: "There is no neutral in this work. Every decision either builds the body or erodes it. Every session either compounds or resets. Choose.", d: "Open the app. Do the work.", s: "coaching" };
}

// ── PHASE COLORS ──────────────────────────────────────────────────────────────
export const PHASE_COLORS: Record<string, string> = {
  INHIBIT: "#C8973A",
  LENGTHEN: "#4a9eff",
  ACTIVATE: "#FF6600",
  INTEGRATE: "#22c55e",
};

// ── STORAGE HELPERS ───────────────────────────────────────────────────────────
export const ls = {
  get: <T>(k: string, d: T): T => {
    try { return JSON.parse(localStorage.getItem(k) || "null") || d; } catch { return d; }
  },
  set: <T>(k: string, v: T): void => {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* noop */ }
  },
};

// ── XP / STAGE ────────────────────────────────────────────────────────────────
export const STAGES: Record<string, [number, number, string]> = {
  "CUB":           [0,   100,  "#555"],
  "STEALTH":       [100, 300,  "#4a9eff"],
  "CONTROLLED":    [300, 600,  "#FF6600"],
  "DOMINANT":      [600, 1000, "#C8973A"],
  "APEX PREDATOR": [1000, 1000, "#22c55e"],
};

export function getStageFromXP(xp: number): string {
  if (xp >= 1000) return "APEX PREDATOR";
  if (xp >= 600)  return "DOMINANT";
  if (xp >= 300)  return "CONTROLLED";
  if (xp >= 100)  return "STEALTH";
  return "CUB";
}

export function hexRgb(hex: string): string {
  const m: Record<string, string> = {
    "#FF6600": "255,69,0",
    "#8B0000": "139,0,0",
    "#C8973A": "200,151,58",
    "#4a9eff": "74,158,255",
    "#22c55e": "34,197,94",
    "#2563eb": "37,99,235",
    "#7c3aed": "124,58,237",
    "#0d9488": "13,148,136",
    "#16a34a": "22,163,74",
    "#dc2626": "220,38,38",
    "#9333ea": "147,51,234",
    "#555":    "85,85,85",
  };
  return m[hex] || "255,255,255";
}

// ── STAGE LADDER (for Evolve screen) ─────────────────────────────────────────
export interface StageLadderItem {
  id: string;
  xpMin: number;
  color: string;
  icon: string;
  description: string;
}
export const STAGE_LADDER: StageLadderItem[] = [
  {
    id: "CUB",
    xpMin: 0,
    color: "#555",
    icon: "🐾",
    description: "You're just starting. The foundation is being built. Every session matters more now than at any other stage.",
  },
  {
    id: "STEALTH",
    xpMin: 100,
    color: "#4a9eff",
    icon: "🌑",
    description: "You're moving with intention. Patterns are forming. The corrective work is starting to stick.",
  },
  {
    id: "CONTROLLED",
    xpMin: 300,
    color: "#FF6600",
    icon: "🔥",
    description: "You own your movement. Compensations are gone. You're loading patterns that are clean and powerful.",
  },
  {
    id: "DOMINANT",
    xpMin: 600,
    color: "#C8973A",
    icon: "👑",
    description: "You perform at a level most people never reach. Strength, mobility, and precision are unified.",
  },
  {
    id: "APEX PREDATOR",
    xpMin: 1000,
    color: "#22c55e",
    icon: "🐆",
    description: "The pinnacle. You move like a weapon. Every rep is intentional. Every session is a statement.",
  },
];
