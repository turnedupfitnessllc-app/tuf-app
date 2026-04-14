// ═══════════════════════════════════════════════════════════════════════════════
// TUF PROGRAM ENGINE — v4.0
// 4-Week Progressive Overload · Clinical Corrective Integration
// Shoulder · Knee · Back · Hip · Cervical · Thoracic · Ankle
// ═══════════════════════════════════════════════════════════════════════════════

import { EXERCISE_LIBRARY, PAIN_ENGINE, type Exercise } from './PANTHER_KNOWLEDGE_BASE';

// ── TYPES ─────────────────────────────────────────────────────────────────────

export type FitnessLevel   = 'beginner' | 'intermediate' | 'advanced';
export type GoalType       = 'move_better' | 'lose_fat' | 'build_muscle' | 'performance';
export type EquipmentType  = 'bodyweight' | 'bands' | 'dumbbells' | 'barbell' | 'cables' | 'full_gym';

export interface UserInput {
  painLocation:     string;
  triggerMovement?: string;
  fitnessLevel:     FitnessLevel;
  goal:             GoalType;
  equipment:        EquipmentType[];
  painLevel:        number; // 0-10
  sessionsPerWeek?: number;
  name?:            string;
}

export interface ProgramExercise extends Exercise {
  weekSets:      number;
  weekReps:      string;
  weekRest:      number;
  intensityNote: string;
  progressNote?: string;
}

export interface SessionBlock {
  label:     string;
  phase:     'INHIBIT' | 'LENGTHEN' | 'ACTIVATE' | 'INTEGRATE';
  color:     string;
  exercises: ProgramExercise[];
}

export interface ProgramSession {
  day:      number;
  label:    string;
  focus:    string;
  duration: string;
  blocks:   SessionBlock[];
}

export interface ProgramWeek {
  week:        number;
  label:       string;
  theme:       string;
  volumeMod:   number;
  intensityMod:number;
  restMod:     number;
  sessions:    ProgramSession[];
}

export interface ClientProgram {
  id:            string;
  createdAt:     number;
  clientName?:   string;
  fitnessLevel:  FitnessLevel;
  goal:          GoalType;
  painLocation:  string;
  diagnosis:     string;
  verdict:       string;
  syndrome?:     string;
  warning?:      string;
  weeks:         ProgramWeek[];
  correctiveIds: string[];
}

// ── WEEK PROGRESSION STRUCTURE ────────────────────────────────────────────────

const WEEK_STRUCTURE = [
  {
    week:1, label:"ESTABLISH",
    theme:"Perfect form. Zero compensation. Every movement dialed in. The foundation.",
    volumeMod:1.0, intensityMod:0.65, restMod:1.25,
    note:"This week is not easy — it's precise. Quality over everything.",
  },
  {
    week:2, label:"REINFORCE",
    theme:"Same movements. Execution tightens. Add one set per compound exercise.",
    volumeMod:1.15, intensityMod:0.72, restMod:1.1,
    note:"The form you built in week 1 gets tested here. Hold the standard.",
  },
  {
    week:3, label:"LOAD",
    theme:"Increase resistance 5-10%. Your mechanics must hold under new load.",
    volumeMod:1.25, intensityMod:0.83, restMod:1.0,
    note:"Load reveals everything. If form breaks, reduce weight — do not reduce standards.",
  },
  {
    week:4, label:"PERFORM",
    theme:"Top-end intensity. Demonstrate what you built. This is the test.",
    volumeMod:1.3, intensityMod:0.94, restMod:0.88,
    note:"Week 4 is not the end — it is the baseline for the next 4 weeks.",
  },
];

// ── CORRECTIVE BLOCK BUILDER ──────────────────────────────────────────────────

const CORRECTIVE_MAP: Record<string, string[]> = {
  front_shoulder: ['wall_slide','band_pull_apart','face_pull'],
  anterior_knee:  ['glute_bridge','clamshell','lateral_band_walk'],
  lower_back:     ['dead_bug','glute_bridge','bird_dog'],
  anterior_hip:   ['hip_flexor_stretch','glute_bridge','quadruped_hip_extension'],
  deep_glute:     ['pigeon_pose','ninety_ninety_stretch','clamshell'],
  lateral_hip:    ['clamshell','side_lying_hip_abduction','lateral_band_walk'],
  neck:           ['chin_tuck','suboccipital_release','wall_angel'],
  upper_back:     ['thoracic_extension_foam_roller','book_openings','prone_cobra'],
  ankle_foot:     ['gastroc_stretch','banded_dorsiflexion','short_foot_exercise'],
  none:           ['glute_bridge','dead_bug','bird_dog'],
};

// ── MOVEMENT PATTERN MATRIX ───────────────────────────────────────────────────

const PATTERN_MATRIX: Record<string, {primary:string;secondary:string;avoid?:string}> = {
  front_shoulder: { primary:'pull',  secondary:'hinge',  avoid:'overhead_press' },
  anterior_knee:  { primary:'hinge', secondary:'pull',   avoid:'loaded_squat'   },
  lower_back:     { primary:'hinge', secondary:'pull',   avoid:'forward_bend'   },
  anterior_hip:   { primary:'hinge', secondary:'pull',   avoid:'loaded_squat'   },
  deep_glute:     { primary:'hinge', secondary:'squat',  avoid:'deep_hip_flexion'},
  lateral_hip:    { primary:'hinge', secondary:'pull',   avoid:undefined        },
  neck:           { primary:'hinge', secondary:'squat',  avoid:'overhead_press' },
  upper_back:     { primary:'pull',  secondary:'hinge',  avoid:'overhead_press' },
  ankle_foot:     { primary:'hinge', secondary:'pull',   avoid:'full_squat'     },
  none:           { primary:'squat', secondary:'push',   avoid:undefined        },
};

// ── EXERCISE SELECTOR ─────────────────────────────────────────────────────────

function selectByLevel(options: {b:string[];i:string[];a:string[]}, level: FitnessLevel): string[] {
  return level === 'beginner' ? options.b : level === 'intermediate' ? options.i : options.a;
}

function getExercise(id: string, week: typeof WEEK_STRUCTURE[0]): ProgramExercise | null {
  const ex = EXERCISE_LIBRARY[id];
  if (!ex) return null;
  const weekSets  = Math.round(ex.sets * week.volumeMod);
  const weekRest  = Math.round(ex.rest  * week.restMod);
  const pct       = Math.round(week.intensityMod * 100);
  return {
    ...ex,
    weekSets,
    weekReps:      ex.reps,
    weekRest,
    intensityNote: `${pct}% effort`,
    progressNote:  week.week === 3 ? "↑ Increase load 5-10% if form is clean" : week.week === 4 ? "↑ Challenge top-end load" : undefined,
  };
}

// ── PROGRAM BUILDER — MAIN ────────────────────────────────────────────────────

export function buildClientProgram(input: UserInput): ClientProgram {
  const painData  = PAIN_ENGINE[input.painLocation] || PAIN_ENGINE['none'];
  const patterns  = PATTERN_MATRIX[input.painLocation] || PATTERN_MATRIX['none'];
  const corrIds   = CORRECTIVE_MAP[input.painLocation] || CORRECTIVE_MAP['none'];
  const spw       = input.sessionsPerWeek || (input.fitnessLevel === 'beginner' ? 3 : input.fitnessLevel === 'intermediate' ? 4 : 5);
  const highPain  = input.painLevel >= 7;

  // Build session templates
  const sessionTemplates = buildSessionTemplates(input, patterns, corrIds, highPain);

  // Build 4 weeks
  const weeks: ProgramWeek[] = WEEK_STRUCTURE.map(wk => ({
    ...wk,
    sessions: sessionTemplates.slice(0, spw).map((tmpl, i) => buildSession(tmpl, wk, i + 1)),
  }));

  return {
    id:           `program_${Date.now()}`,
    createdAt:    Date.now(),
    clientName:   input.name,
    fitnessLevel: input.fitnessLevel,
    goal:         input.goal,
    painLocation: input.painLocation,
    diagnosis:    painData.likelyCauses[0] || 'General movement optimization',
    verdict:      painData.verdict,
    syndrome:     input.painLocation === 'lower_back' || input.painLocation === 'anterior_knee' || input.painLocation === 'anterior_hip' ? 'Lower Crossed Syndrome' :
                  input.painLocation === 'front_shoulder' || input.painLocation === 'neck' || input.painLocation === 'upper_back' ? 'Upper Crossed Syndrome' : undefined,
    warning:      highPain ? `Pain level ${input.painLevel}/10 — corrective focus only this week. No strength loading until pain < 5/10.` : undefined,
    weeks,
    correctiveIds: corrIds,
  };
}

// ── SESSION TEMPLATE BUILDER ──────────────────────────────────────────────────

interface SessionTemplate {
  label:  string;
  focus:  string;
  duration: string;
  blockDefs: { label: string; phase: string; color: string; exIds: string[] }[];
}

function buildSessionTemplates(input: UserInput, patterns: any, corrIds: string[], highPain: boolean): SessionTemplate[] {
  const { fitnessLevel: level, equipment } = input;
  const hasEquip = (e: string) => equipment.includes('full_gym') || equipment.includes(e as EquipmentType);

  // PULL options
  const pullOpts = {
    b: ['lat_pulldown','face_pull'],
    i: hasEquip('cables') ? ['face_pull','band_pull_apart'] : ['band_pull_apart','face_pull'],
    a: hasEquip('cables') ? ['face_pull','band_pull_apart','wall_angel'] : ['band_pull_apart','wall_angel'],
  };

  // HINGE options
  const hingeOpts = {
    b: ['rdl','glute_bridge'],
    i: ['rdl','single_leg_rdl'],
    a: ['rdl','single_leg_rdl','hip_thrust'],
  };

  // SQUAT options (with pain modification)
  const squatOpts = {
    b: ['goblet_squat'],
    i: ['goblet_squat','lateral_band_walk'],
    a: ['goblet_squat','hip_thrust'],
  };

  const pullExs   = selectByLevel(pullOpts, level);
  const hingeExs  = selectByLevel(hingeOpts, level);
  const squatExs  = selectByLevel(squatOpts, level);

  if (highPain) {
    // High pain — corrective only program
    return [
      {
        label:"CORRECTIVE A", focus:"Pain reduction. Movement restoration. Nothing else.",
        duration:"25-30 min",
        blockDefs:[
          { label:"INHIBIT + LENGTHEN", phase:"INHIBIT",   color:"#C8973A", exIds:corrIds.slice(0,2) },
          { label:"ACTIVATION BLOCK",  phase:"ACTIVATE",   color:"#FF6600", exIds:corrIds.slice(2)   },
        ],
      },
      {
        label:"CORRECTIVE B", focus:"Reinforce the activation. Add one more exercise.",
        duration:"25-30 min",
        blockDefs:[
          { label:"CORRECTIVE SEQUENCE", phase:"ACTIVATE",  color:"#FF6600", exIds:corrIds },
          { label:"CORE STABILITY",      phase:"INTEGRATE",  color:"#2563eb", exIds:['dead_bug','bird_dog'] },
        ],
      },
      {
        label:"CORRECTIVE + GENTLE MOVEMENT", focus:"Begin integrating pattern. Pain < 3/10 to proceed.",
        duration:"30 min",
        blockDefs:[
          { label:"CORRECTIVE WARM-UP", phase:"ACTIVATE",  color:"#C8973A", exIds:corrIds.slice(0,2) },
          { label:"PATTERN INTEGRATION",phase:"INTEGRATE", color:"#16a34a", exIds:patterns.primary === 'hinge' ? ['rdl'] : ['goblet_squat'] },
        ],
      },
    ];
  }

  // Standard program
  return [
    {
      label:"SESSION 1 — CORRECTIVE + LOWER",
      focus:"Corrective foundation. Lower body movement pattern.",
      duration:"45-50 min",
      blockDefs:[
        { label:"CORRECTIVE BLOCK",  phase:"ACTIVATE",  color:"#C8973A", exIds:corrIds           },
        { label:"PRIMARY PATTERN",   phase:"INTEGRATE", color:"#FF6600", exIds:hingeExs           },
        { label:"GLUTE FINISHER",    phase:"INTEGRATE", color:"#7c3aed", exIds:['hip_thrust','lateral_band_walk'] },
      ],
    },
    {
      label:"SESSION 2 — PUSH + PULL",
      focus:"Upper body strength. Shoulder health maintained throughout.",
      duration:"45 min",
      blockDefs:[
        { label:"SHOULDER CORRECTIVE",phase:"ACTIVATE",  color:"#C8973A", exIds:['wall_slide','band_pull_apart'] },
        { label:"PULL PATTERN",       phase:"INTEGRATE", color:"#2563eb", exIds:pullExs             },
        { label:"PUSH PATTERN",       phase:"INTEGRATE", color:"#FF6600", exIds:patterns.avoid === 'overhead_press' ? ['landmine_press'] : ['landmine_press'] },
      ],
    },
    {
      label:"SESSION 3 — FULL BODY INTEGRATE",
      focus:"All patterns. Demonstrate everything you've built.",
      duration:"50 min",
      blockDefs:[
        { label:"CORRECTIVE WARM-UP", phase:"ACTIVATE",  color:"#C8973A", exIds:corrIds.slice(0,2) },
        { label:"LOWER BODY",         phase:"INTEGRATE", color:"#FF6600", exIds:squatExs            },
        { label:"UPPER BODY",         phase:"INTEGRATE", color:"#2563eb", exIds:pullExs.slice(0,1)  },
        { label:"CORE FINISHER",      phase:"INTEGRATE", color:"#16a34a", exIds:['dead_bug','bird_dog'] },
      ],
    },
    {
      label:"SESSION 4 — CORRECTIVE + UPPER",
      focus:"Thoracic and cervical correction. Upper body volume.",
      duration:"45 min",
      blockDefs:[
        { label:"THORACIC CORRECTIVE",phase:"INHIBIT",   color:"#C8973A", exIds:['thoracic_extension_foam_roller','book_openings'] },
        { label:"CERVICAL + POSTURE", phase:"ACTIVATE",  color:"#0d9488", exIds:['chin_tuck','wall_angel','ytw']                   },
        { label:"PULL STRENGTH",      phase:"INTEGRATE", color:"#2563eb", exIds:pullExs                                            },
      ],
    },
    {
      label:"SESSION 5 — PERFORMANCE + POWER",
      focus:"Top-end output. Every rep counts.",
      duration:"50 min",
      blockDefs:[
        { label:"ACTIVATION PREP",   phase:"ACTIVATE",  color:"#C8973A", exIds:corrIds.slice(0,2)  },
        { label:"COMPOUND LOWER",    phase:"INTEGRATE", color:"#FF6600", exIds:hingeExs             },
        { label:"COMPOUND UPPER",    phase:"INTEGRATE", color:"#2563eb", exIds:pullExs              },
        { label:"LOADED CARRY",      phase:"INTEGRATE", color:"#16a34a", exIds:['single_leg_balance_ankle'] },
      ],
    },
  ];
}

function buildSession(tmpl: SessionTemplate, week: typeof WEEK_STRUCTURE[0], day: number): ProgramSession {
  return {
    day,
    label:    tmpl.label,
    focus:    tmpl.focus,
    duration: tmpl.duration,
    blocks: tmpl.blockDefs.map(bd => ({
      label:     bd.label,
      phase:     bd.phase as SessionBlock['phase'],
      color:     bd.color,
      exercises: bd.exIds
        .map(id => getExercise(id, week))
        .filter((e): e is ProgramExercise => e !== null),
    })).filter(b => b.exercises.length > 0),
  };
}

// ── PROGRAM STORAGE ───────────────────────────────────────────────────────────

export function saveProgram(program: ClientProgram): void {
  try {
    const existing = JSON.parse(localStorage.getItem('tuf_programs') || '[]');
    const updated  = [program, ...existing].slice(0, 5); // keep last 5
    localStorage.setItem('tuf_programs', JSON.stringify(updated));
    localStorage.setItem('tuf_active_program', JSON.stringify(program));
  } catch {}
}

export function loadActiveProgram(): ClientProgram | null {
  try {
    const raw = localStorage.getItem('tuf_active_program');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function getWeekProgress(programId: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(`tuf_progress_${programId}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function markSessionComplete(programId: string, weekNum: number, sessionDay: number): void {
  try {
    const progress = getWeekProgress(programId);
    progress[`w${weekNum}_d${sessionDay}`] = true;
    localStorage.setItem(`tuf_progress_${programId}`, JSON.stringify(progress));
    // Update streak
    const profile = JSON.parse(localStorage.getItem('tuf_progress') || '{}');
    profile.sessionsCompleted = (profile.sessionsCompleted || 0) + 1;
    localStorage.setItem('tuf_progress', JSON.stringify(profile));
  } catch {}
}
