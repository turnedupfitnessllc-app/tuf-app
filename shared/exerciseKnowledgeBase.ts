/**
 * TUF Exercise Knowledge Base — v2.0
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 *
 * The Panther's visual intelligence library.
 * 30 foundational movements with form standards, cues, mistakes,
 * regression/progression logic, and vision checkpoints.
 *
 * Used by:
 * - Panther Vision Engine (real-time form analysis via Grok Vision)
 * - Smart Workout Generator (exercise selection + progression)
 * - Autonomous Decision Engine (regress/progress/stop logic)
 */

export interface ExerciseKnowledge {
  id: string;
  name: string;
  category: string;
  movement_type: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string[];
  short_description: string;
  instructions: string[];
  key_cues: string[];
  common_mistakes: string[];
  regression: string;
  progression: string;
  vision_checkpoints?: string[];
  fatigue_signals?: string[];
  risk_flags?: string[];
}

export const EXERCISE_KNOWLEDGE_BASE: ExerciseKnowledge[] = [
  {
    id: "shoulder_press",
    name: "Shoulder Press",
    category: "Basic Moves",
    movement_type: "Push",
    primary_muscles: ["Shoulders"],
    secondary_muscles: ["Triceps", "Core"],
    equipment: ["Dumbbell", "Barbell", "Machine"],
    short_description: "Vertical pressing movement for shoulder strength.",
    instructions: ["Start at shoulders", "Brace core", "Press overhead", "Lower controlled"],
    key_cues: ["Press vertical", "Core tight", "No momentum"],
    common_mistakes: ["Back arch", "Flaring elbows", "Partial reps"],
    regression: "Machine press",
    progression: "Single-arm press",
    vision_checkpoints: ["Spine neutral at lockout", "Bar path vertical", "Elbows at 90° start", "Wrists over elbows"],
    fatigue_signals: ["Bar drifting forward", "Lumbar arch increasing", "Elbows flaring wider"],
    risk_flags: ["Severe lumbar hyperextension — stop set"]
  },
  {
    id: "bench_press",
    name: "Bench Press",
    category: "Basic Moves",
    movement_type: "Push",
    primary_muscles: ["Chest"],
    secondary_muscles: ["Triceps", "Shoulders"],
    equipment: ["Barbell", "Dumbbell"],
    short_description: "Horizontal press for upper body strength.",
    instructions: ["Lie on bench", "Lower to chest", "Press up", "Control down"],
    key_cues: ["Feet planted", "Elbows 45°", "Stable shoulders"],
    common_mistakes: ["Bouncing bar", "Elbow flare"],
    regression: "Push-up",
    progression: "Pause bench",
    vision_checkpoints: ["Feet flat on floor", "Elbows at 45° not 90°", "Bar to lower chest", "Hips on bench"],
    fatigue_signals: ["Elbows flaring wider", "Bar path inconsistent", "Hips rising"],
    risk_flags: ["Elbows fully flared 90° — shoulder impingement risk"]
  },
  {
    id: "squat",
    name: "Squat",
    category: "Basic Moves",
    movement_type: "Lower Body",
    primary_muscles: ["Quadriceps", "Glutes"],
    secondary_muscles: ["Hamstrings", "Core"],
    equipment: ["Bodyweight", "Barbell", "Dumbbell"],
    short_description: "Foundational lower body strength movement.",
    instructions: ["Feet shoulder width", "Hips back/down", "Chest up", "Drive up"],
    key_cues: ["Knees track toes", "Sit back", "Full depth"],
    common_mistakes: ["Knee collapse", "Heel lift"],
    regression: "Box squat",
    progression: "Jump squat",
    vision_checkpoints: ["Knee valgus check — most critical", "Heels planted throughout", "Spine neutral", "Hip crease below parallel"],
    fatigue_signals: ["Knee valgus increasing", "Forward trunk lean increasing", "Depth decreasing"],
    risk_flags: ["Severe knee valgus — ACL risk — stop set", "Heel rise — overload or mobility issue"]
  },
  {
    id: "deadlift",
    name: "Deadlift",
    category: "Basic Moves",
    movement_type: "Pull",
    primary_muscles: ["Glutes", "Hamstrings"],
    secondary_muscles: ["Lower Back", "Core"],
    equipment: ["Barbell", "Dumbbell"],
    short_description: "Hip hinge strength movement.",
    instructions: ["Hinge hips", "Grip weight", "Drive up", "Lower controlled"],
    key_cues: ["Bar close", "Flat back"],
    common_mistakes: ["Rounded spine", "Arm pulling"],
    regression: "RDL",
    progression: "Single-leg deadlift",
    vision_checkpoints: ["Lumbar neutral throughout", "Bar within 1 inch of body", "Hips and shoulders rise together", "No hyperextension at lockout"],
    fatigue_signals: ["Lumbar rounding increasing", "Bar drifting forward", "Good morning pattern emerging"],
    risk_flags: ["Lumbar flexion under load — disc risk — stop set immediately"]
  },
  {
    id: "push_up",
    name: "Push-Up",
    category: "Basic Moves",
    movement_type: "Push",
    primary_muscles: ["Chest"],
    secondary_muscles: ["Triceps", "Core"],
    equipment: ["Bodyweight"],
    short_description: "Bodyweight upper body press.",
    instructions: ["Plank position", "Lower chest", "Press up", "Stay straight"],
    key_cues: ["Core tight", "Elbows 45°"],
    common_mistakes: ["Hip sag", "Half reps"],
    regression: "Incline push-up",
    progression: "Decline push-up",
    vision_checkpoints: ["Straight line head to heels", "Elbows at 45° not 90°", "Chest near floor", "Head neutral"],
    fatigue_signals: ["Hip sag increasing", "Range decreasing", "Head dropping"],
    risk_flags: ["Severe hip sag — regress to incline push-up"]
  },
  {
    id: "pull_up",
    name: "Pull-Up",
    category: "Basic Moves",
    movement_type: "Pull",
    primary_muscles: ["Back"],
    secondary_muscles: ["Biceps", "Core"],
    equipment: ["Pull-up bar"],
    short_description: "Vertical pulling movement.",
    instructions: ["Hang", "Pull chest up", "Lower slow"],
    key_cues: ["No swing", "Chest to bar"],
    common_mistakes: ["Kipping", "Partial reps"],
    regression: "Assisted pull-up",
    progression: "Weighted pull-up",
    vision_checkpoints: ["Full dead hang at bottom", "Chin clears bar", "No kipping", "Shoulders depressed"],
    fatigue_signals: ["Range decreasing", "Kipping beginning", "Shoulder shrug emerging"],
    risk_flags: ["Severe kipping — shoulder impingement risk"]
  },
  {
    id: "lunge",
    name: "Lunge",
    category: "Basic Moves",
    movement_type: "Lower Body",
    primary_muscles: ["Quadriceps", "Glutes"],
    secondary_muscles: ["Hamstrings"],
    equipment: ["Bodyweight", "Dumbbell"],
    short_description: "Unilateral leg strength movement.",
    instructions: ["Step forward", "Lower down", "Push back", "Repeat"],
    key_cues: ["Upright torso", "Front heel drive"],
    common_mistakes: ["Knee collapse", "Leaning forward"],
    regression: "Split squat",
    progression: "Walking lunge",
    vision_checkpoints: ["Front knee tracks over toe", "Torso upright", "Rear knee 1-2 inches from floor", "Hips square"],
    fatigue_signals: ["Forward trunk lean increasing", "Front knee valgus", "Balance deteriorating"],
    risk_flags: ["Front knee valgus — ACL risk"]
  },
  {
    id: "plank",
    name: "Plank",
    category: "Basic Moves",
    movement_type: "Core",
    primary_muscles: ["Core"],
    secondary_muscles: ["Shoulders", "Glutes"],
    equipment: ["Bodyweight"],
    short_description: "Core stability hold.",
    instructions: ["Forearms down", "Straight body", "Hold tension"],
    key_cues: ["Brace core", "Neutral spine"],
    common_mistakes: ["Hip drop", "Hip raise"],
    regression: "Knee plank",
    progression: "Weighted plank",
    vision_checkpoints: ["Straight line head to heels", "Hips level", "Head neutral", "Scapulae flat"],
    fatigue_signals: ["Hip sag beginning", "Head dropping", "Visible shaking"],
    risk_flags: ["Severe hip sag — regress to knee plank"]
  },
  {
    id: "bent_over_row",
    name: "Bent Over Row",
    category: "Basic Moves",
    movement_type: "Pull",
    primary_muscles: ["Back"],
    secondary_muscles: ["Biceps"],
    equipment: ["Barbell", "Dumbbell"],
    short_description: "Horizontal pull for back development.",
    instructions: ["Hinge hips", "Pull to torso", "Lower slow"],
    key_cues: ["Flat back", "Elbows back"],
    common_mistakes: ["Rounded back"],
    regression: "Seated row",
    progression: "Single-arm row",
    vision_checkpoints: ["Spine neutral throughout", "Elbows drive back", "Shoulder blades retract", "No torso rotation"],
    fatigue_signals: ["Torso rising", "Momentum increasing", "Range decreasing"],
    risk_flags: ["Lumbar flexion under load — stop set"]
  },
  {
    id: "glute_bridge",
    name: "Glute Bridge",
    category: "Basic Moves",
    movement_type: "Lower Body",
    primary_muscles: ["Glutes"],
    secondary_muscles: ["Hamstrings"],
    equipment: ["Bodyweight"],
    short_description: "Glute activation hip lift.",
    instructions: ["Lie down", "Drive hips up", "Squeeze glutes", "Lower"],
    key_cues: ["Heels drive", "Glute squeeze"],
    common_mistakes: ["Back arching"],
    regression: "Partial bridge",
    progression: "Single-leg bridge",
    vision_checkpoints: ["Full hip extension at top", "No lumbar hyperextension", "Heels planted", "Hips level"],
    fatigue_signals: ["Bridge height decreasing", "Pause disappearing", "Hip rotation appearing"],
    risk_flags: ["Severe lumbar hyperextension — hamstring dominant pattern"]
  },
  {
    id: "incline_bench_press",
    name: "Incline Bench Press",
    category: "Basic Moves",
    movement_type: "Push",
    primary_muscles: ["Upper Chest"],
    secondary_muscles: ["Triceps", "Shoulders"],
    equipment: ["Barbell", "Dumbbell"],
    short_description: "Upper chest pressing variation.",
    instructions: ["Set incline", "Lower to upper chest", "Press up"],
    key_cues: ["Controlled tempo", "No bounce"],
    common_mistakes: ["Too steep angle"],
    regression: "Flat press",
    progression: "Paused incline"
  },
  {
    id: "decline_bench_press",
    name: "Decline Bench Press",
    category: "Basic Moves",
    movement_type: "Push",
    primary_muscles: ["Lower Chest"],
    secondary_muscles: ["Triceps"],
    equipment: ["Barbell", "Dumbbell"],
    short_description: "Lower chest emphasis press.",
    instructions: ["Set decline", "Lower bar", "Press up"],
    key_cues: ["Stable shoulders"],
    common_mistakes: ["Rushing reps"],
    regression: "Flat press",
    progression: "Weighted decline"
  },
  {
    id: "dumbbell_fly",
    name: "Dumbbell Fly",
    category: "Basic Moves",
    movement_type: "Push",
    primary_muscles: ["Chest"],
    secondary_muscles: ["Shoulders"],
    equipment: ["Dumbbell"],
    short_description: "Chest isolation stretch movement.",
    instructions: ["Open arms wide", "Slight bend elbows", "Bring together"],
    key_cues: ["Slow stretch", "No lockout"],
    common_mistakes: ["Too heavy load"],
    regression: "Cable fly",
    progression: "Deep stretch fly"
  },
  {
    id: "arnold_press",
    name: "Arnold Press",
    category: "Basic Moves",
    movement_type: "Push",
    primary_muscles: ["Shoulders"],
    secondary_muscles: ["Triceps"],
    equipment: ["Dumbbell"],
    short_description: "Rotational shoulder press.",
    instructions: ["Rotate palms", "Press overhead", "Return rotation"],
    key_cues: ["Smooth rotation"],
    common_mistakes: ["Fast reps"],
    regression: "Standard press",
    progression: "Single-arm rotation press"
  },
  {
    id: "lateral_raise",
    name: "Lateral Raise",
    category: "Basic Moves",
    movement_type: "Isolation",
    primary_muscles: ["Side Shoulders"],
    secondary_muscles: [],
    equipment: ["Dumbbell"],
    short_description: "Shoulder width isolation movement.",
    instructions: ["Lift arms sideways", "Control down"],
    key_cues: ["No swing", "Soft elbows"],
    common_mistakes: ["Momentum"],
    regression: "Cable raise",
    progression: "Pause raise"
  },
  {
    id: "front_raise",
    name: "Front Raise",
    category: "Basic Moves",
    movement_type: "Isolation",
    primary_muscles: ["Front Shoulders"],
    secondary_muscles: [],
    equipment: ["Dumbbell"],
    short_description: "Anterior shoulder isolation.",
    instructions: ["Lift forward", "Control down"],
    key_cues: ["No swing"],
    common_mistakes: ["Too heavy"],
    regression: "Band raise",
    progression: "Plate raise"
  },
  {
    id: "triceps_dip",
    name: "Triceps Dip",
    category: "Basic Moves",
    movement_type: "Push",
    primary_muscles: ["Triceps"],
    secondary_muscles: ["Chest", "Shoulders"],
    equipment: ["Bodyweight"],
    short_description: "Bodyweight triceps strength movement.",
    instructions: ["Lower body", "Push up"],
    key_cues: ["Elbows back"],
    common_mistakes: ["Shoulder strain"],
    regression: "Bench dip",
    progression: "Weighted dip"
  },
  {
    id: "lat_pulldown",
    name: "Lat Pulldown",
    category: "Basic Moves",
    movement_type: "Pull",
    primary_muscles: ["Back"],
    secondary_muscles: ["Biceps"],
    equipment: ["Cable machine"],
    short_description: "Vertical pull for lat development.",
    instructions: ["Pull bar to chest", "Control up"],
    key_cues: ["Chest up", "No swing"],
    common_mistakes: ["Leaning too far"],
    regression: "Band pulldown",
    progression: "Pull-up"
  },
  {
    id: "seated_row",
    name: "Seated Cable Row",
    category: "Basic Moves",
    movement_type: "Pull",
    primary_muscles: ["Back"],
    secondary_muscles: ["Biceps"],
    equipment: ["Cable machine"],
    short_description: "Horizontal cable row.",
    instructions: ["Pull handle to torso", "Return slow"],
    key_cues: ["Squeeze back"],
    common_mistakes: ["Using momentum"],
    regression: "Band row",
    progression: "Heavy cable row"
  },
  {
    id: "face_pull",
    name: "Face Pull",
    category: "Basic Moves",
    movement_type: "Pull",
    primary_muscles: ["Rear Shoulders"],
    secondary_muscles: ["Upper Back"],
    equipment: ["Cable"],
    short_description: "Rear delt and posture movement.",
    instructions: ["Pull rope to face", "Squeeze shoulders"],
    key_cues: ["Elbows high"],
    common_mistakes: ["Shrugging"],
    regression: "Band pull",
    progression: "Paused face pull"
  },
  {
    id: "hip_thrust",
    name: "Hip Thrust",
    category: "Basic Moves",
    movement_type: "Lower Body",
    primary_muscles: ["Glutes"],
    secondary_muscles: ["Hamstrings"],
    equipment: ["Barbell", "Bench"],
    short_description: "Glute strength peak contraction movement.",
    instructions: ["Back on bench", "Drive hips up", "Squeeze glutes"],
    key_cues: ["Full hip extension"],
    common_mistakes: ["Overarching"],
    regression: "Glute bridge",
    progression: "Single-leg thrust"
  },
  {
    id: "leg_press",
    name: "Leg Press",
    category: "Basic Moves",
    movement_type: "Lower Body",
    primary_muscles: ["Quadriceps", "Glutes"],
    secondary_muscles: ["Hamstrings"],
    equipment: ["Machine"],
    short_description: "Machine-based squat pattern.",
    instructions: ["Lower platform", "Press up"],
    key_cues: ["Control depth"],
    common_mistakes: ["Locking knees"],
    regression: "Body squat",
    progression: "Single-leg press"
  },
  {
    id: "hamstring_curl",
    name: "Hamstring Curl",
    category: "Basic Moves",
    movement_type: "Isolation",
    primary_muscles: ["Hamstrings"],
    secondary_muscles: [],
    equipment: ["Machine"],
    short_description: "Hamstring isolation curl.",
    instructions: ["Curl weight", "Lower slow"],
    key_cues: ["Full squeeze"],
    common_mistakes: ["Fast reps"],
    regression: "Band curl",
    progression: "Single-leg curl"
  },
  {
    id: "calf_raise",
    name: "Calf Raise",
    category: "Basic Moves",
    movement_type: "Lower Body",
    primary_muscles: ["Calves"],
    secondary_muscles: [],
    equipment: ["Bodyweight", "Dumbbell"],
    short_description: "Lower leg strength movement.",
    instructions: ["Rise on toes", "Lower slow"],
    key_cues: ["Full stretch"],
    common_mistakes: ["Bouncing"],
    regression: "Seated calf raise",
    progression: "Single-leg raise"
  },
  {
    id: "step_up",
    name: "Step-Up",
    category: "Basic Moves",
    movement_type: "Lower Body",
    primary_muscles: ["Quadriceps", "Glutes"],
    secondary_muscles: ["Hamstrings"],
    equipment: ["Dumbbell", "Bench"],
    short_description: "Functional stepping strength movement.",
    instructions: ["Step onto platform", "Drive up", "Step down"],
    key_cues: ["Control balance"],
    common_mistakes: ["Pushing off trailing leg"],
    regression: "Low step",
    progression: "Weighted step-up"
  },
  {
    id: "russian_twist",
    name: "Russian Twist",
    category: "Basic Moves",
    movement_type: "Core",
    primary_muscles: ["Obliques"],
    secondary_muscles: ["Core"],
    equipment: ["Bodyweight", "Weight"],
    short_description: "Rotational core movement.",
    instructions: ["Rotate torso side to side"],
    key_cues: ["Controlled twist"],
    common_mistakes: ["Momentum"],
    regression: "Feet down twist",
    progression: "Weighted twist"
  },
  {
    id: "mountain_climbers",
    name: "Mountain Climbers",
    category: "Basic Moves",
    movement_type: "Core",
    primary_muscles: ["Core"],
    secondary_muscles: ["Shoulders"],
    equipment: ["Bodyweight"],
    short_description: "Dynamic core conditioning movement.",
    instructions: ["Drive knees alternately"],
    key_cues: ["Stable hips"],
    common_mistakes: ["Hip bounce"],
    regression: "Slow climber",
    progression: "Fast climber"
  },
  {
    id: "bicep_curl",
    name: "Bicep Curl",
    category: "Basic Moves",
    movement_type: "Isolation",
    primary_muscles: ["Biceps"],
    secondary_muscles: [],
    equipment: ["Dumbbell", "Barbell"],
    short_description: "Elbow flexion for bicep strength.",
    instructions: ["Curl weight upward", "Lower controlled"],
    key_cues: ["Elbows fixed", "No swing"],
    common_mistakes: ["Swinging body", "Partial reps"],
    regression: "Cable curl",
    progression: "Incline curl"
  },
  {
    id: "tricep_extension",
    name: "Tricep Extension",
    category: "Basic Moves",
    movement_type: "Isolation",
    primary_muscles: ["Triceps"],
    secondary_muscles: [],
    equipment: ["Dumbbell", "Cable"],
    short_description: "Elbow extension for tricep isolation.",
    instructions: ["Extend arm overhead or down", "Control return"],
    key_cues: ["Elbows fixed", "Full extension"],
    common_mistakes: ["Moving elbows", "Partial range"],
    regression: "Band pushdown",
    progression: "Weighted overhead extension"
  },
  {
    id: "romanian_deadlift",
    name: "Romanian Deadlift",
    category: "Basic Moves",
    movement_type: "Pull",
    primary_muscles: ["Hamstrings", "Glutes"],
    secondary_muscles: ["Lower Back"],
    equipment: ["Barbell", "Dumbbell"],
    short_description: "Hip hinge with hamstring emphasis.",
    instructions: ["Hinge at hips", "Lower weight along legs", "Drive hips forward"],
    key_cues: ["Soft knees", "Bar close to legs", "Feel hamstring stretch"],
    common_mistakes: ["Squatting the movement", "Rounding back"],
    regression: "Bodyweight hip hinge",
    progression: "Single-leg RDL",
    vision_checkpoints: ["Soft knee bend maintained", "Bar tracks along shins/thighs", "Neutral spine throughout"],
    fatigue_signals: ["Back rounding", "Knees bending more each rep"],
    risk_flags: ["Lumbar flexion under load — stop set"]
  },
  {
    id: "sumo_deadlift",
    name: "Sumo Deadlift",
    category: "Basic Moves",
    movement_type: "Pull",
    primary_muscles: ["Glutes", "Inner Thighs"],
    secondary_muscles: ["Hamstrings", "Core"],
    equipment: ["Barbell"],
    short_description: "Wide-stance deadlift for glute and inner thigh emphasis.",
    instructions: ["Wide stance, toes out", "Grip inside legs", "Drive knees out", "Stand tall"],
    key_cues: ["Knees track over toes", "Chest up", "Drive floor apart"],
    common_mistakes: ["Knee cave", "Rounding back"],
    regression: "Conventional deadlift",
    progression: "Deficit sumo deadlift"
  }
];

/**
 * Look up exercise knowledge by ID or name (case-insensitive)
 */
export function getExerciseKnowledge(idOrName: string): ExerciseKnowledge | null {
  const query = idOrName.toLowerCase().replace(/[\s\-]/g, '_');
  return EXERCISE_KNOWLEDGE_BASE.find(
    ex => ex.id === query ||
          ex.name.toLowerCase().replace(/[\s\-]/g, '_') === query ||
          ex.id.includes(query) ||
          query.includes(ex.id)
  ) || null;
}

/**
 * Build a Grok Vision analysis prompt for a specific exercise
 */
export function buildVisionPrompt(exercise: ExerciseKnowledge): string {
  const checkpoints = exercise.vision_checkpoints || exercise.key_cues;
  const fatigue = exercise.fatigue_signals || ["Watch for form breakdown across reps"];
  const risks = exercise.risk_flags || ["Severe form breakdown"];

  return `You are a biomechanics analyst for The Panther System — a clinical AI coaching platform for adults 40+.
The person is performing: ${exercise.name}

FORM CHECKPOINTS (what correct looks like):
${checkpoints.map((c, i) => `${i + 1}. ${c}`).join('\n')}

COMMON MISTAKES TO DETECT:
${exercise.common_mistakes.map((m, i) => `${i + 1}. ${m}`).join('\n')}

FATIGUE SIGNALS (indicates overload):
${fatigue.map((f, i) => `${i + 1}. ${f}`).join('\n')}

RISK FLAGS (requires immediate intervention):
${risks.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Analyze this camera frame. Return ONLY a JSON object:
{
  "form_score": <0-100>,
  "mistakes_detected": [<mistakes from the list above that you see>],
  "risk_flags_triggered": [<risk flags you see — empty if none>],
  "fatigue_signals": [<fatigue signals you observe — empty if none>],
  "primary_cue": "<single most important correction, or empty string if form is good>",
  "positive_observation": "<one thing they are doing correctly, or empty string>"
}`;
}

/**
 * Vision analysis result from Grok Vision
 */
export interface VisionAnalysis {
  form_score: number;
  mistakes_detected: string[];
  risk_flags_triggered: string[];
  fatigue_signals: string[];
  primary_cue: string;
  positive_observation: string;
}

/**
 * Panther autonomous decision
 */
export interface PantherDecision {
  action: 'coach' | 'warn' | 'stop' | 'regress' | 'praise' | 'silence';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  should_regress: boolean;
  should_stop_set: boolean;
  regression_exercise?: string;
}

/**
 * Autonomous decision engine
 * Given vision analysis, decides what the Panther should do
 */
export function pantherDecisionEngine(
  analysis: VisionAnalysis,
  exercise: ExerciseKnowledge,
  consecutiveMistakes: number = 0
): PantherDecision {
  // CRITICAL: Risk flag — stop immediately
  if (analysis.risk_flags_triggered.length > 0) {
    return {
      action: 'stop',
      urgency: 'critical',
      message: `Stop. ${analysis.risk_flags_triggered[0]}. Rest and reset.`,
      should_regress: true,
      should_stop_set: true,
      regression_exercise: exercise.regression
    };
  }

  // HIGH: Same mistake 3 reps in a row — regress
  if (consecutiveMistakes >= 3 && analysis.mistakes_detected.length > 0) {
    return {
      action: 'regress',
      urgency: 'high',
      message: `Same pattern three reps running. Dropping to ${exercise.regression} to fix the foundation.`,
      should_regress: true,
      should_stop_set: true,
      regression_exercise: exercise.regression
    };
  }

  // HIGH: Fatigue + form breakdown
  if (analysis.fatigue_signals.length > 0 && analysis.form_score < 60) {
    return {
      action: 'warn',
      urgency: 'high',
      message: analysis.primary_cue || 'Form is breaking down. Reset before the next rep.',
      should_regress: false,
      should_stop_set: false
    };
  }

  // MEDIUM: Mistake detected — give correction
  if (analysis.mistakes_detected.length > 0 && analysis.primary_cue) {
    return {
      action: 'coach',
      urgency: 'medium',
      message: analysis.primary_cue,
      should_regress: false,
      should_stop_set: false
    };
  }

  // LOW: Good form — brief praise
  if (analysis.form_score >= 85) {
    return {
      action: 'praise',
      urgency: 'low',
      message: analysis.positive_observation || "Clean rep. That's the standard.",
      should_regress: false,
      should_stop_set: false
    };
  }

  // SILENCE: Minor issues, no cue needed
  if (analysis.form_score >= 70) {
    return {
      action: 'silence',
      urgency: 'low',
      message: '',
      should_regress: false,
      should_stop_set: false
    };
  }

  // DEFAULT: Light cue
  return {
    action: 'coach',
    urgency: 'low',
    message: analysis.primary_cue || exercise.key_cues[0],
    should_regress: false,
    should_stop_set: false
  };
}
