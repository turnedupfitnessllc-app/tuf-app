/**
 * PantherPipeline.tsx — AI Workout Generation Engine
 * Implements the 8-step pipeline from panther-pipeline.pdf:
 * 1. Collect user input
 * 2. Check pain database
 * 3. Run diagnosis engine
 * 4. Select movement pattern focus
 * 5. Pull exercises from DB
 * 6. Modify based on pain/dysfunction
 * 7. Return structured workout
 * 8. Store feedback
 */
import { useState, useCallback } from "react";

// ─── Pain Substitution Rules Engine ──────────────────────────────────────────
interface SubstitutionRule {
  condition: string;
  blocked: string[];
  replacements: string[];
  focus: string;
  rationale: string;
}

const SUBSTITUTION_RULES: SubstitutionRule[] = [
  {
    condition: "shoulder_front",
    blocked: ["overhead_press", "dips", "upright_row", "front_raise"],
    replacements: ["landmine_press", "wall_slide", "band_pull_apart", "face_pull"],
    focus: "posterior_shoulder",
    rationale: "Anterior shoulder pain = impingement risk with overhead loading. Landmine press keeps shoulder in safe scapular plane.",
  },
  {
    condition: "knee",
    blocked: ["jumping", "deep_squats", "leg_extension", "running"],
    replacements: ["glute_bridge", "step_ups", "terminal_knee_extension", "wall_sit"],
    focus: "glute_activation",
    rationale: "Knee pain under load = glute inhibition + quad dominance. Activate glutes first, load knee second.",
  },
  {
    condition: "lower_back",
    blocked: ["heavy_deadlift", "good_morning", "back_extension", "sit_up"],
    replacements: ["dead_bug", "bird_dog", "pallof_press", "hip_hinge_bodyweight"],
    focus: "core_stability",
    rationale: "Lower back pain = lumbar instability or hip flexor tightness. Stabilize spine before loading.",
  },
  {
    condition: "hip_flexor",
    blocked: ["sprint", "high_knee", "leg_raise", "hip_flexion_loaded"],
    replacements: ["kneeling_hip_flexor_stretch", "glute_bridge", "dead_bug", "hip_hinge"],
    focus: "hip_extension",
    rationale: "Tight hip flexors reciprocally inhibit glutes. Inhibit, lengthen, activate — in that order.",
  },
  {
    condition: "shoulder_rotator_cuff",
    blocked: ["bench_press_heavy", "dips", "behind_neck_press"],
    replacements: ["external_rotation_band", "face_pull", "side_lying_ER", "scapular_retraction"],
    focus: "rotator_cuff_stability",
    rationale: "RC involvement = internal rotation dominance. Restore ER strength ratio before pressing.",
  },
  {
    condition: "ankle",
    blocked: ["box_jump", "single_leg_jump", "running"],
    replacements: ["seated_calf_raise", "ankle_circles", "balance_board", "step_up_slow"],
    focus: "ankle_stability",
    rationale: "Ankle instability = compensatory knee and hip patterns. Restore dorsiflexion and proprioception first.",
  },
];

// ─── Movement Pattern Library ─────────────────────────────────────────────────
interface Exercise {
  name: string;
  displayName: string;
  sets: number;
  reps: string;
  rest: string;
  cues: string[];
  category: "inhibit" | "lengthen" | "activate" | "integrate";
  pattern: string;
}

const EXERCISE_LIBRARY: Record<string, Exercise[]> = {
  lower_back: [
    { name: "foam_roll_hip_flexors", displayName: "Foam Roll — Hip Flexors", sets: 1, reps: "60s each", rest: "0s", cues: ["Slow, sustained pressure", "Pause on tender spots"], category: "inhibit", pattern: "hip_flexion" },
    { name: "kneeling_hip_flexor_stretch", displayName: "Kneeling Hip Flexor Stretch", sets: 3, reps: "30s each", rest: "15s", cues: ["Posterior pelvic tuck", "Tall spine", "Drive hips forward slowly"], category: "lengthen", pattern: "hip_flexion" },
    { name: "dead_bug", displayName: "Dead Bug", sets: 3, reps: "10 each side", rest: "30s", cues: ["Lower back pressed to floor", "Exhale as you extend", "Slow and controlled"], category: "activate", pattern: "core_stability" },
    { name: "glute_bridge", displayName: "Glute Bridge", sets: 3, reps: "15", rest: "30s", cues: ["Drive through heels", "Squeeze glutes at top", "Ribs down"], category: "activate", pattern: "hip_extension" },
    { name: "bird_dog", displayName: "Bird Dog", sets: 3, reps: "10 each side", rest: "30s", cues: ["Spine neutral", "No hip rotation", "Reach long"], category: "activate", pattern: "core_stability" },
    { name: "hip_hinge", displayName: "Hip Hinge — Bodyweight", sets: 3, reps: "12", rest: "45s", cues: ["Hinge at hip not waist", "Soft knee", "Feel hamstring stretch"], category: "integrate", pattern: "hip_hinge" },
  ],
  knee: [
    { name: "foam_roll_it_band", displayName: "Foam Roll — IT Band / TFL", sets: 1, reps: "60s each", rest: "0s", cues: ["Slow passes", "Pause on tender spots", "Breathe through it"], category: "inhibit", pattern: "lateral_hip" },
    { name: "clamshells", displayName: "Clamshells", sets: 3, reps: "15 each", rest: "30s", cues: ["Feet together", "Don't let hip roll back", "Feel glute med working"], category: "activate", pattern: "hip_abduction" },
    { name: "glute_bridge", displayName: "Glute Bridge", sets: 3, reps: "15", rest: "30s", cues: ["Drive through heels", "Squeeze glutes at top", "Knees tracking over toes"], category: "activate", pattern: "hip_extension" },
    { name: "terminal_knee_extension", displayName: "Terminal Knee Extension — Band", sets: 3, reps: "15 each", rest: "30s", cues: ["Small movement", "Full extension at end", "Quad squeeze"], category: "activate", pattern: "knee_extension" },
    { name: "step_up", displayName: "Step-Up", sets: 3, reps: "10 each", rest: "45s", cues: ["Drive through heel", "Don't push off back foot", "Control the descent"], category: "integrate", pattern: "single_leg" },
  ],
  shoulder: [
    { name: "foam_roll_thoracic", displayName: "Foam Roll — Thoracic Spine", sets: 1, reps: "60s", rest: "0s", cues: ["Segment by segment", "Arms crossed over chest", "Breathe into extension"], category: "inhibit", pattern: "thoracic_mobility" },
    { name: "doorway_chest_stretch", displayName: "Doorway Chest Stretch", sets: 3, reps: "30s each", rest: "15s", cues: ["Elbow at 90°", "Lean forward gently", "Feel pec stretch"], category: "lengthen", pattern: "shoulder_flexion" },
    { name: "band_pull_apart", displayName: "Band Pull-Apart", sets: 3, reps: "15", rest: "30s", cues: ["Arms straight", "Retract scapulae", "Slow return"], category: "activate", pattern: "horizontal_pull" },
    { name: "face_pull", displayName: "Face Pull — Band", sets: 3, reps: "15", rest: "30s", cues: ["Pull to nose height", "External rotate at end", "Elbows high"], category: "activate", pattern: "horizontal_pull" },
    { name: "landmine_press", displayName: "Landmine Press", sets: 3, reps: "10 each", rest: "45s", cues: ["Scapular plane", "Full extension", "Control return"], category: "integrate", pattern: "push" },
  ],
  hip: [
    { name: "foam_roll_hip_flexors", displayName: "Foam Roll — Hip Flexors", sets: 1, reps: "60s each", rest: "0s", cues: ["Slow, sustained pressure", "Pause on tender spots"], category: "inhibit", pattern: "hip_flexion" },
    { name: "pigeon_pose", displayName: "Pigeon Pose", sets: 2, reps: "45s each", rest: "15s", cues: ["Square hips", "Breathe into the stretch", "No forcing"], category: "lengthen", pattern: "hip_ER" },
    { name: "fire_hydrant", displayName: "Fire Hydrant", sets: 3, reps: "12 each", rest: "30s", cues: ["Core braced", "Don't hike the hip", "Squeeze at top"], category: "activate", pattern: "hip_abduction" },
    { name: "lateral_band_walk", displayName: "Lateral Band Walk", sets: 3, reps: "12 each direction", rest: "30s", cues: ["Slight squat position", "Toes forward", "Push knees out"], category: "activate", pattern: "hip_abduction" },
    { name: "single_leg_rdl", displayName: "Single Leg RDL", sets: 3, reps: "10 each", rest: "45s", cues: ["Hinge don't squat", "Hip bones level", "3 count down"], category: "integrate", pattern: "hip_hinge" },
  ],
  general: [
    { name: "foam_roll_full_body", displayName: "Foam Roll — Full Body", sets: 1, reps: "5 min", rest: "0s", cues: ["Slow passes", "Pause on tender spots", "Breathe"], category: "inhibit", pattern: "general" },
    { name: "world_greatest_stretch", displayName: "World's Greatest Stretch", sets: 2, reps: "5 each side", rest: "30s", cues: ["Full range", "Slow and deliberate", "Breathe into each position"], category: "lengthen", pattern: "multi_joint" },
    { name: "glute_bridge", displayName: "Glute Bridge", sets: 3, reps: "15", rest: "30s", cues: ["Drive through heels", "Squeeze glutes at top", "Ribs down"], category: "activate", pattern: "hip_extension" },
    { name: "dead_bug", displayName: "Dead Bug", sets: 3, reps: "10 each side", rest: "30s", cues: ["Lower back pressed to floor", "Exhale as you extend", "Slow"], category: "activate", pattern: "core_stability" },
    { name: "goblet_squat", displayName: "Goblet Squat", sets: 3, reps: "12", rest: "45s", cues: ["Chest up", "Knees out", "Full depth if able"], category: "integrate", pattern: "squat" },
    { name: "rdl", displayName: "Romanian Deadlift", sets: 3, reps: "10", rest: "60s", cues: ["Hinge at hip", "Soft knee", "Bar close to body"], category: "integrate", pattern: "hip_hinge" },
  ],
};

// ─── Pipeline Step Types ──────────────────────────────────────────────────────
type PipelineStatus = "idle" | "running" | "complete" | "error";

interface PipelineStep {
  id: number;
  label: string;
  description: string;
  status: "pending" | "active" | "done" | "skipped";
  result?: string;
}

interface GeneratedWorkout {
  title: string;
  focus: string;
  totalTime: string;
  painAdaptations: string[];
  exercises: Exercise[];
  coachingNote: string;
  diagnosis: string;
}

// ─── Diagnosis Engine ─────────────────────────────────────────────────────────
function runDiagnosis(painLocation: string, painLevel: number, fitnessLevel: string): {
  primaryDysfunction: string;
  movementFocus: string;
  exerciseCategory: string;
  adaptations: string[];
  coachingNote: string;
} {
  const loc = painLocation.toLowerCase();

  if (loc.includes("lower back") || loc.includes("lumbar")) {
    return {
      primaryDysfunction: "Lower Crossed Syndrome — Hip flexor tightness + glute inhibition",
      movementFocus: "Hip extension and core stability",
      exerciseCategory: "lower_back",
      adaptations: ["Blocked: heavy deadlifts, sit-ups", "Added: hip flexor inhibition, glute activation"],
      coachingNote: "Your lower back is compensating for inactive glutes. Every session starts with hip flexor release.",
    };
  }
  if (loc.includes("knee")) {
    return {
      primaryDysfunction: "Glute inhibition — Quad dominance causing knee overload",
      movementFocus: "Glute activation and single-leg stability",
      exerciseCategory: "knee",
      adaptations: ["Blocked: jumping, deep squats", "Added: glute bridge, terminal knee extension"],
      coachingNote: "Knee pain is almost always a glute problem. Activate the glutes, protect the knee.",
    };
  }
  if (loc.includes("shoulder") || loc.includes("rotator")) {
    return {
      primaryDysfunction: "Upper Crossed Syndrome — Anterior shoulder dominance",
      movementFocus: "Posterior shoulder and scapular stability",
      exerciseCategory: "shoulder",
      adaptations: ["Blocked: overhead press, dips", "Added: face pull, band pull-apart, landmine press"],
      coachingNote: "Shoulder pain = internal rotation dominance. Restore the balance before loading overhead.",
    };
  }
  if (loc.includes("hip") || loc.includes("glute") || loc.includes("piriformis")) {
    return {
      primaryDysfunction: "Hip complex dysfunction — Possible piriformis or glute med weakness",
      movementFocus: "Hip mobility and glute med activation",
      exerciseCategory: "hip",
      adaptations: ["Added: pigeon pose, fire hydrant, lateral band walk", "Modified: single leg work"],
      coachingNote: "Deep hip pain is often piriformis, not sciatica. Foam roll, stretch, then activate.",
    };
  }

  // General / no specific pain
  return {
    primaryDysfunction: fitnessLevel === "beginner" ? "General deconditioning" : "Movement pattern refinement needed",
    movementFocus: "Full body movement quality",
    exerciseCategory: "general",
    adaptations: ["Full corrective continuum applied", "Progressive loading based on fitness level"],
    coachingNote: fitnessLevel === "beginner"
      ? "Foundation first. Master the patterns before adding load."
      : "Focus on quality over quantity. Every rep is a rep of your best form.",
  };
}

// ─── Workout Builder ──────────────────────────────────────────────────────────
function buildWorkout(
  painLocation: string,
  painLevel: number,
  fitnessLevel: string,
  goal: string
): GeneratedWorkout {
  const diagnosis = runDiagnosis(painLocation, painLevel, fitnessLevel);
  const exercises = EXERCISE_LIBRARY[diagnosis.exerciseCategory] || EXERCISE_LIBRARY.general;

  // Adjust volume based on pain level
  const adjustedExercises = exercises.map(ex => ({
    ...ex,
    sets: painLevel >= 7 ? Math.max(1, ex.sets - 1) : ex.sets,
  }));

  const totalSets = adjustedExercises.reduce((sum, ex) => sum + ex.sets, 0);
  const estimatedMinutes = totalSets * 2 + adjustedExercises.length * 1;

  return {
    title: `${diagnosis.movementFocus.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")} Session`,
    focus: diagnosis.movementFocus,
    totalTime: `${estimatedMinutes}–${estimatedMinutes + 5} min`,
    painAdaptations: diagnosis.adaptations,
    exercises: adjustedExercises,
    coachingNote: diagnosis.coachingNote,
    diagnosis: diagnosis.primaryDysfunction,
  };
}

// ─── Category Colors ──────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  inhibit:   { label: "INHIBIT",   color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  lengthen:  { label: "LENGTHEN",  color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  activate:  { label: "ACTIVATE",  color: "#FF4500", bg: "rgba(255,69,0,0.15)" },
  integrate: { label: "INTEGRATE", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PantherPipeline() {
  const [painLocation, setPainLocation] = useState("");
  const [painLevel, setPainLevel]       = useState(0);
  const [fitnessLevel, setFitnessLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [goal, setGoal]                 = useState("general_fitness");
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>("idle");
  const [currentStep, setCurrentStep]   = useState(0);
  const [workout, setWorkout]           = useState<GeneratedWorkout | null>(null);
  const [feedback, setFeedback]         = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const PIPELINE_STEPS: PipelineStep[] = [
    { id: 1, label: "Collecting Input",          description: "Reading pain location, level, and fitness profile", status: "pending" },
    { id: 2, label: "Checking Pain Database",    description: "Cross-referencing pain patterns and substitution rules", status: "pending" },
    { id: 3, label: "Running Diagnosis Engine",  description: "Identifying primary dysfunction and compensation patterns", status: "pending" },
    { id: 4, label: "Selecting Movement Focus",  description: "Determining corrective continuum priority", status: "pending" },
    { id: 5, label: "Pulling Exercise Library",  description: "Loading exercises matched to dysfunction pattern", status: "pending" },
    { id: 6, label: "Applying Pain Adaptations", description: "Blocking contraindicated movements, adding safe alternatives", status: "pending" },
    { id: 7, label: "Building Workout",          description: "Structuring INHIBIT → LENGTHEN → ACTIVATE → INTEGRATE sequence", status: "pending" },
    { id: 8, label: "Ready",                     description: "Your personalized corrective workout is ready", status: "pending" },
  ];

  const [steps, setSteps] = useState<PipelineStep[]>(PIPELINE_STEPS);

  const updateStep = useCallback((stepId: number, status: PipelineStep["status"], result?: string) => {
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, status, result } : s));
  }, []);

  const runPipeline = useCallback(async () => {
    if (!painLocation.trim()) return;
    setPipelineStatus("running");
    setWorkout(null);
    setFeedback(null);
    setFeedbackSubmitted(false);
    setSteps(PIPELINE_STEPS);

    const stepDelay = 600;

    // Step 1 — Collect input
    setCurrentStep(1);
    updateStep(1, "active");
    await new Promise(r => setTimeout(r, stepDelay));
    updateStep(1, "done", `Pain: ${painLocation} (${painLevel}/10) · Level: ${fitnessLevel} · Goal: ${goal.replace("_", " ")}`);

    // Step 2 — Check pain DB
    setCurrentStep(2);
    updateStep(2, "active");
    await new Promise(r => setTimeout(r, stepDelay));
    const rule = SUBSTITUTION_RULES.find(r =>
      painLocation.toLowerCase().includes(r.condition.replace("_", " ").split("_")[0])
    );
    updateStep(2, "done", rule ? `Substitution rule found: ${rule.condition}` : "No specific substitution rule — using general protocol");

    // Step 3 — Diagnosis
    setCurrentStep(3);
    updateStep(3, "active");
    await new Promise(r => setTimeout(r, stepDelay));
    const diag = runDiagnosis(painLocation, painLevel, fitnessLevel);
    updateStep(3, "done", diag.primaryDysfunction);

    // Step 4 — Movement focus
    setCurrentStep(4);
    updateStep(4, "active");
    await new Promise(r => setTimeout(r, stepDelay));
    updateStep(4, "done", `Focus: ${diag.movementFocus}`);

    // Step 5 — Pull exercises
    setCurrentStep(5);
    updateStep(5, "active");
    await new Promise(r => setTimeout(r, stepDelay));
    const exCount = (EXERCISE_LIBRARY[diag.exerciseCategory] || EXERCISE_LIBRARY.general).length;
    updateStep(5, "done", `${exCount} exercises loaded from ${diag.exerciseCategory} protocol`);

    // Step 6 — Apply adaptations
    setCurrentStep(6);
    updateStep(6, "active");
    await new Promise(r => setTimeout(r, stepDelay));
    updateStep(6, "done", diag.adaptations.join(" · "));

    // Step 7 — Build workout
    setCurrentStep(7);
    updateStep(7, "active");
    await new Promise(r => setTimeout(r, stepDelay));
    const generatedWorkout = buildWorkout(painLocation, painLevel, fitnessLevel, goal);
    updateStep(7, "done", `${generatedWorkout.exercises.length} exercises · ${generatedWorkout.totalTime}`);

    // Step 8 — Ready
    setCurrentStep(8);
    updateStep(8, "active");
    await new Promise(r => setTimeout(r, stepDelay));
    updateStep(8, "done", "Workout ready");

    setWorkout(generatedWorkout);
    setPipelineStatus("complete");
    setCurrentStep(0);

    // Save to DB
    try {
      const userId = localStorage.getItem("tuf_user_id") || "anonymous";
      await fetch("/api/db/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          session_type: "corrective",
          exercises_completed: generatedWorkout.exercises.map(e => e.name),
          pain_location: painLocation,
          pain_level_before: painLevel,
          notes: generatedWorkout.diagnosis,
          date: Date.now(),
        }),
      });
    } catch { /* silent */ }
  }, [painLocation, painLevel, fitnessLevel, goal, updateStep]);

  const submitFeedback = useCallback(async (rating: string) => {
    setFeedback(rating);
    setFeedbackSubmitted(true);
    try {
      const userId = localStorage.getItem("tuf_user_id") || "anonymous";
      await fetch("/api/db/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          session_type: "feedback",
          feedback_rating: rating,
          notes: `Pipeline feedback: ${rating}`,
          date: Date.now(),
        }),
      });
    } catch { /* silent */ }
  }, []);

  const reset = () => {
    setPipelineStatus("idle");
    setWorkout(null);
    setSteps(PIPELINE_STEPS);
    setCurrentStep(0);
    setFeedback(null);
    setFeedbackSubmitted(false);
    setPainLocation("");
    setPainLevel(0);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", paddingBottom: "100px" }}>

      {/* Header */}
      <div style={{ padding: "20px 20px 0", borderBottom: "1px solid rgba(255,69,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
          <div style={{ width: "8px", height: "32px", background: "#FF4500", borderRadius: "2px" }} />
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, letterSpacing: "0.1em", color: "#FF4500" }}>PANTHER PIPELINE</h1>
        </div>
        <p style={{ margin: "0 0 16px 20px", fontSize: "13px", color: "#888", letterSpacing: "0.05em" }}>AI WORKOUT GENERATION ENGINE · 8-STEP PROTOCOL</p>
      </div>

      <div style={{ padding: "20px" }}>

        {/* Input Form */}
        {pipelineStatus === "idle" && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,69,0,0.2)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "14px", letterSpacing: "0.15em", color: "#FF4500" }}>CLIENT INPUT</h2>

            {/* Pain Location */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.1em", color: "#888", marginBottom: "6px" }}>PAIN LOCATION</label>
              <input
                value={painLocation}
                onChange={e => setPainLocation(e.target.value)}
                placeholder="e.g. lower back, left knee, right shoulder..."
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Pain Level */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.1em", color: "#888", marginBottom: "6px" }}>
                PAIN LEVEL: <span style={{ color: painLevel >= 7 ? "#ef4444" : painLevel >= 4 ? "#f97316" : "#22c55e" }}>{painLevel}/10</span>
              </label>
              <input
                type="range" min={0} max={10} value={painLevel}
                onChange={e => setPainLevel(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "#FF4500" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#555", marginTop: "2px" }}>
                <span>NO PAIN</span><span>MODERATE</span><span>SEVERE</span>
              </div>
            </div>

            {/* Fitness Level */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.1em", color: "#888", marginBottom: "8px" }}>FITNESS LEVEL</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["beginner", "intermediate", "advanced"] as const).map(level => (
                  <button key={level} onClick={() => setFitnessLevel(level)}
                    style={{ flex: 1, padding: "8px", borderRadius: "6px", border: `1px solid ${fitnessLevel === level ? "#FF4500" : "rgba(255,255,255,0.1)"}`, background: fitnessLevel === level ? "rgba(255,69,0,0.15)" : "transparent", color: fitnessLevel === level ? "#FF4500" : "#888", fontSize: "11px", letterSpacing: "0.08em", cursor: "pointer", textTransform: "uppercase" }}>
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.1em", color: "#888", marginBottom: "8px" }}>PRIMARY GOAL</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {[
                  { value: "pain_relief", label: "PAIN RELIEF" },
                  { value: "fat_loss", label: "FAT LOSS" },
                  { value: "muscle_gain", label: "MUSCLE" },
                  { value: "mobility", label: "MOBILITY" },
                  { value: "general_fitness", label: "GENERAL" },
                ].map(g => (
                  <button key={g.value} onClick={() => setGoal(g.value)}
                    style={{ padding: "6px 12px", borderRadius: "6px", border: `1px solid ${goal === g.value ? "#FF4500" : "rgba(255,255,255,0.1)"}`, background: goal === g.value ? "rgba(255,69,0,0.15)" : "transparent", color: goal === g.value ? "#FF4500" : "#888", fontSize: "11px", letterSpacing: "0.08em", cursor: "pointer" }}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={runPipeline}
              disabled={!painLocation.trim()}
              style={{ width: "100%", padding: "14px", background: painLocation.trim() ? "#FF4500" : "#333", border: "none", borderRadius: "8px", color: "#fff", fontSize: "14px", fontWeight: 700, letterSpacing: "0.15em", cursor: painLocation.trim() ? "pointer" : "not-allowed" }}>
              RUN PIPELINE
            </button>
          </div>
        )}

        {/* Pipeline Progress */}
        {(pipelineStatus === "running" || pipelineStatus === "complete") && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,69,0,0.2)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "14px", letterSpacing: "0.15em", color: "#FF4500" }}>PIPELINE RUNNING</h2>
            {steps.map(step => (
              <div key={step.id} style={{ display: "flex", gap: "12px", marginBottom: "12px", opacity: step.status === "pending" ? 0.3 : 1, transition: "opacity 0.3s" }}>
                {/* Step indicator */}
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: `2px solid ${step.status === "done" ? "#22c55e" : step.status === "active" ? "#FF4500" : "rgba(255,255,255,0.2)"}`, background: step.status === "done" ? "rgba(34,197,94,0.15)" : step.status === "active" ? "rgba(255,69,0,0.15)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "11px", color: step.status === "done" ? "#22c55e" : step.status === "active" ? "#FF4500" : "#555" }}>
                  {step.status === "done" ? "✓" : step.status === "active" ? "●" : step.id}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: step.status === "active" ? "#FF4500" : step.status === "done" ? "#fff" : "#555" }}>{step.label}</div>
                  {step.result && <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{step.result}</div>}
                  {!step.result && step.status === "active" && <div style={{ fontSize: "11px", color: "#FF4500", marginTop: "2px" }}>{step.description}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Generated Workout */}
        {workout && pipelineStatus === "complete" && (
          <>
            {/* Diagnosis Card */}
            <div style={{ background: "rgba(255,69,0,0.08)", border: "1px solid rgba(255,69,0,0.3)", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.1em", color: "#FF4500", marginBottom: "6px" }}>DIAGNOSIS</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>{workout.diagnosis}</div>
              <div style={{ fontSize: "12px", color: "#aaa", fontStyle: "italic" }}>{workout.coachingNote}</div>
              {workout.painAdaptations.map((a, i) => (
                <div key={i} style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>· {a}</div>
              ))}
            </div>

            {/* Workout Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "0.05em" }}>{workout.title}</div>
                <div style={{ fontSize: "12px", color: "#888" }}>{workout.exercises.length} exercises · {workout.totalTime}</div>
              </div>
            </div>

            {/* Exercise List */}
            {workout.exercises.map((ex, i) => {
              const cat = CATEGORY_CONFIG[ex.category];
              return (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "14px", marginBottom: "10px", borderLeft: `3px solid ${cat.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700 }}>{ex.displayName}</div>
                    <span style={{ fontSize: "10px", letterSpacing: "0.1em", color: cat.color, background: cat.bg, padding: "2px 8px", borderRadius: "4px" }}>{cat.label}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#aaa", marginBottom: "8px" }}>
                    {ex.sets} sets · {ex.reps} · Rest: {ex.rest}
                  </div>
                  {ex.cues.map((cue, j) => (
                    <div key={j} style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>→ {cue}</div>
                  ))}
                </div>
              );
            })}

            {/* Feedback Loop (Step 8) */}
            {!feedbackSubmitted ? (
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "16px", marginTop: "16px" }}>
                <div style={{ fontSize: "12px", letterSpacing: "0.1em", color: "#888", marginBottom: "12px" }}>HOW DOES THIS WORKOUT FEEL?</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["Too Easy", "Just Right", "Too Hard"].map(r => (
                    <button key={r} onClick={() => submitFeedback(r)}
                      style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#fff", fontSize: "12px", cursor: "pointer" }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "12px", padding: "16px", marginTop: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "14px", color: "#22c55e", marginBottom: "4px" }}>✓ FEEDBACK LOGGED</div>
                <div style={{ fontSize: "12px", color: "#888" }}>Panther will adapt your next session based on this.</div>
              </div>
            )}

            {/* Reset */}
            <button onClick={reset}
              style={{ width: "100%", marginTop: "16px", padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#888", fontSize: "13px", letterSpacing: "0.1em", cursor: "pointer" }}>
              RUN NEW PIPELINE
            </button>
          </>
        )}
      </div>
    </div>
  );
}
