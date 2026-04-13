/**
 * THE PANTHER SYSTEM — CORRECTIVE EXERCISE LIBRARY
 * 74 Exercises | 4 Dysfunction Patterns | NASM Corrective Continuum
 * Doc 09 — Panther System Library Clinical | April 2026
 * © 2026 Turned Up Fitness LLC | Confidential
 *
 * NASM CORRECTIVE CONTINUUM ORDER (always enforce):
 * Phase 1: Inhibit (SMR / foam rolling)
 * Phase 2: Lengthen (static / neuromuscular stretching)
 * Phase 3: Activate (isolated strengthening)
 * Phase 4: Integrate (dynamic movement integration)
 */

export type NasmPhase = "Inhibit" | "Lengthen" | "Activate" | "Integrate";
export type DysfunctionPattern = "UCS" | "LCS" | "Knee" | "Shoulder";

export interface CorrExercise {
  name: string;
  phase: NasmPhase;
  phaseNumber: 1 | 2 | 3 | 4;
  sets: number;
  repsOrDuration: string;
  cue: string;
  dysfunction: DysfunctionPattern;
}

export interface DysfunctionProfile {
  id: DysfunctionPattern;
  label: string;
  overactive: string[];
  underactive: string[];
  posturalPresentation: string;
  primaryDriver40Plus: string;
  clinicalOutcome: string;
  assessmentTrigger: string;
  exercises: CorrExercise[];
}

// ─── UPPER CROSSED SYNDROME (UCS) ────────────────────────────────────────────
const UCS_EXERCISES: CorrExercise[] = [
  // Phase 1 — Inhibit
  { name: "Suboccipital Release", phase: "Inhibit", phaseNumber: 1, sets: 1, repsOrDuration: "60-90 sec", cue: "Chin tucked. Pressure at base of skull. Breathe through tension.", dysfunction: "UCS" },
  { name: "Levator Scapulae SMR", phase: "Inhibit", phaseNumber: 1, sets: 1, repsOrDuration: "60-90 sec", cue: "Roll from neck base to shoulder blade. Pause on tender points.", dysfunction: "UCS" },
  { name: "Pec Minor SMR (Lacrosse Ball)", phase: "Inhibit", phaseNumber: 1, sets: 1, repsOrDuration: "60-90 sec", cue: "Ball just below clavicle. Arm hanging relaxed. No breath holding.", dysfunction: "UCS" },
  { name: "Upper Trapezius SMR", phase: "Inhibit", phaseNumber: 1, sets: 1, repsOrDuration: "60-90 sec", cue: "Supported head. Slow roll along trap. Stop at trigger points.", dysfunction: "UCS" },
  { name: "Thoracic Spine Foam Roll", phase: "Inhibit", phaseNumber: 1, sets: 1, repsOrDuration: "10 passes", cue: "Arms crossed chest. Roll T4-T9 only. No lumbar rolling.", dysfunction: "UCS" },
  // Phase 2 — Lengthen
  { name: "Cervical Flexion Stretch", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "30 sec hold", cue: "Chin to chest. No rotation. Hands light on occiput — no pulling.", dysfunction: "UCS" },
  { name: "Doorway Pec Stretch", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "30 sec hold", cue: "Elbow at 90 degrees. Step through until chest tension felt. No shoulder impingement.", dysfunction: "UCS" },
  { name: "Levator Scapulae Stretch", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "30 sec each", cue: "Hand behind back. Ear to opposite shoulder. Rotate chin down 45 degrees.", dysfunction: "UCS" },
  { name: "Thoracic Extension Over Roller", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "30 sec", cue: "Roller at T6. Arms overhead. Let gravity extend — do not force.", dysfunction: "UCS" },
  { name: "Upper Trap Side Bend Stretch", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "30 sec each", cue: "Seated or standing. Ear to shoulder. Opposite hand presses down. No shrug.", dysfunction: "UCS" },
  // Phase 3 — Activate
  { name: "Deep Cervical Flexor Activation", phase: "Activate", phaseNumber: 3, sets: 2, repsOrDuration: "10 reps", cue: "Chin tuck only — no neck flexion. Longus colli target. 5 sec hold each.", dysfunction: "UCS" },
  { name: "Prone Cobra", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "15 reps", cue: "Arms externally rotated, thumbs up. Lift chest. Squeeze scapulae together and down.", dysfunction: "UCS" },
  { name: "Wall Angel", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "12 reps", cue: "Full contact: head, thoracic, glutes, heels. Slide arms — maintain contact throughout.", dysfunction: "UCS" },
  { name: "Serratus Anterior Activation", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "12 reps", cue: "Cable or band. Protract at top. No shoulder elevation. Feel lateral ribcage engagement.", dysfunction: "UCS" },
  { name: "Lower Trapezius Y-Raise", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "12 reps", cue: "Prone. Thumbs up. Raise to Y position. Scapulae retract and depress before lift.", dysfunction: "UCS" },
  // Phase 4 — Integrate
  { name: "Band Pull-Apart", phase: "Integrate", phaseNumber: 4, sets: 3, repsOrDuration: "15 reps", cue: "Band at chest height. Full retraction at end range. Control return — 3 sec eccentric.", dysfunction: "UCS" },
  { name: "Cable Face Pull", phase: "Integrate", phaseNumber: 4, sets: 3, repsOrDuration: "15 reps", cue: "Rope at eye level. Pull to forehead. External rotation at end. No forward head lean.", dysfunction: "UCS" },
  { name: "Single Arm Cable Row", phase: "Integrate", phaseNumber: 4, sets: 3, repsOrDuration: "12 each", cue: "Neutral spine. Scapula retract first, then arm pulls. No torso rotation.", dysfunction: "UCS" },
  { name: "Push-Up Plus", phase: "Integrate", phaseNumber: 4, sets: 3, repsOrDuration: "12 reps", cue: "Full push-up + serratus protraction at top. Scapulae move — do not lock.", dysfunction: "UCS" },
];

// ─── LOWER CROSSED SYNDROME (LCS) ────────────────────────────────────────────
const LCS_EXERCISES: CorrExercise[] = [
  // Phase 1 — Inhibit
  { name: "Hip Flexor SMR (Rectus Femoris)", phase: "Inhibit", phaseNumber: 1, sets: 1, repsOrDuration: "60-90 sec", cue: "Roll anterior thigh. Target proximal RF. Bend knee to increase pressure.", dysfunction: "LCS" },
  { name: "TFL / IT Band SMR", phase: "Inhibit", phaseNumber: 1, sets: 1, repsOrDuration: "60-90 sec", cue: "Lateral thigh. Roll from hip to knee. Pause at tender points — do not race.", dysfunction: "LCS" },
  { name: "Lumbar Erector SMR", phase: "Inhibit", phaseNumber: 1, sets: 1, repsOrDuration: "60-90 sec", cue: "Roller parallel to spine. Upper glute to mid-back. Avoid direct spinal pressure.", dysfunction: "LCS" },
  { name: "Adductor SMR", phase: "Inhibit", phaseNumber: 1, sets: 1, repsOrDuration: "60-90 sec", cue: "Inside thigh. Supported on elbows. Medial femur — not groin.", dysfunction: "LCS" },
  // Phase 2 — Lengthen
  { name: "Half-Kneeling Hip Flexor Stretch", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "30 sec each", cue: "Posterior pelvic tilt before stretch. Squeeze glute of back leg. No anterior tilt.", dysfunction: "LCS" },
  { name: "Standing TFL Stretch", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "30 sec each", cue: "Cross leg behind. Lean away from tight side. Feel lateral hip tension.", dysfunction: "LCS" },
  { name: "Supine Lumbar Rotation Stretch", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "30 sec each", cue: "Knees together. Rotate to floor. Opposite shoulder stays down. Breathe into rotation.", dysfunction: "LCS" },
  { name: "Adductor Side Lunge Stretch", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "30 sec each", cue: "Straight leg extended. Sit into hip. Foot flat. No forward lean.", dysfunction: "LCS" },
  { name: "90/90 Hip Stretch", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "60 sec each", cue: "Both hips at 90 degrees. Sit tall — no rounding. Lean forward from hip, not spine.", dysfunction: "LCS" },
  // Phase 3 — Activate
  { name: "Glute Bridge", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "15 reps", cue: "Drive through heels. Squeeze glutes at top. Pelvis neutral — no anterior tilt.", dysfunction: "LCS" },
  { name: "Clamshell", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "15 each", cue: "Hips stacked. Feet together. Rotate from hip — not from lumbar spine.", dysfunction: "LCS" },
  { name: "Side-Lying Hip Abduction", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "15 each", cue: "Leg in line with body. Toe slightly down. Lift from glute med — not hip flexor.", dysfunction: "LCS" },
  { name: "Dead Bug", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "10 each side", cue: "Low back pressed to floor throughout. Exhale on extension. No rib flare.", dysfunction: "LCS" },
  { name: "Bird Dog", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "10 each side", cue: "Neutral spine. Extend opposite arm and leg simultaneously. No rotation. Hold 3 sec.", dysfunction: "LCS" },
  // Phase 4 — Integrate
  { name: "Single Leg Deadlift", phase: "Integrate", phaseNumber: 4, sets: 3, repsOrDuration: "10 each", cue: "Hip hinge — not squat. Neutral spine. Glute of standing leg fires throughout.", dysfunction: "LCS" },
  { name: "Reverse Lunge with Knee Drive", phase: "Integrate", phaseNumber: 4, sets: 3, repsOrDuration: "12 each", cue: "Step back — land softly. Drive knee up on return. Glute of front leg controls descent.", dysfunction: "LCS" },
  { name: "Cable Pull-Through", phase: "Integrate", phaseNumber: 4, sets: 3, repsOrDuration: "15 reps", cue: "Hip hinge. Cable between legs. Drive hips forward — not lower back extension.", dysfunction: "LCS" },
  { name: "Lateral Band Walk", phase: "Integrate", phaseNumber: 4, sets: 3, repsOrDuration: "15 steps each", cue: "Band above knees. Slight squat. Steps controlled — no inward knee collapse.", dysfunction: "LCS" },
  { name: "Goblet Squat", phase: "Integrate", phaseNumber: 4, sets: 3, repsOrDuration: "12 reps", cue: "Weight at chest. Elbows inside knees. Chest up. Sit between heels — not forward.", dysfunction: "LCS" },
];

// ─── KNEE COMPLEX ─────────────────────────────────────────────────────────────
const KNEE_EXERCISES: CorrExercise[] = [
  // Phase 1 — Inhibit
  { name: "IT Band SMR", phase: "Inhibit", phaseNumber: 1, sets: 1, repsOrDuration: "60-90 sec", cue: "Lateral thigh to lateral knee. Pause at tender points. Breathe through.", dysfunction: "Knee" },
  { name: "Lateral Gastrocnemius SMR", phase: "Inhibit", phaseNumber: 1, sets: 1, repsOrDuration: "60-90 sec", cue: "Roller at lateral calf. Cross opposite leg for pressure. Slow passes.", dysfunction: "Knee" },
  { name: "Vastus Lateralis SMR", phase: "Inhibit", phaseNumber: 1, sets: 1, repsOrDuration: "60-90 sec", cue: "Lateral quad. Roll from hip to knee. Pause at trigger points.", dysfunction: "Knee" },
  { name: "Peroneals SMR", phase: "Inhibit", phaseNumber: 1, sets: 1, repsOrDuration: "60-90 sec", cue: "Lateral lower leg. Foot in slight inversion. Slow pressure — not speed.", dysfunction: "Knee" },
  // Phase 2 — Lengthen
  { name: "Standing Calf Stretch", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "30 sec each", cue: "Heel on ground. Knee straight for gastroc. Slight bend for soleus. No rolling in.", dysfunction: "Knee" },
  { name: "Kneeling IT Band Stretch", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "30 sec each", cue: "Half-kneeling. Lean away from tight side. Hip stays square. No torso rotation.", dysfunction: "Knee" },
  { name: "Prone Quad Stretch", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "30 sec each", cue: "Lie prone. Pull heel to glute. Pelvis neutral — no anterior tilt. Hip stays down.", dysfunction: "Knee" },
  { name: "Supine Hamstring Stretch", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "30 sec each", cue: "Leg straight. Foot flexed. Pull toward face — not to ceiling. No knee bend.", dysfunction: "Knee" },
  // Phase 3 — Activate
  { name: "Terminal Knee Extension (TKE)", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "15 reps", cue: "Band behind knee. Extend fully. VMO fires at end range. No hyperextension.", dysfunction: "Knee" },
  { name: "VMO Squat (Narrow Stance)", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "15 reps", cue: "Feet close. Toes slightly out. Track knee over second toe. Slow descent.", dysfunction: "Knee" },
  { name: "Step-Up (Low Box)", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "12 each", cue: "Drive through heel of step leg. No push-off from trail leg. Control descent.", dysfunction: "Knee" },
  { name: "Glute Med Activation (Side-Lying)", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "15 each", cue: "Hips stacked. Leg in line with body. Rotate from hip. No lumbar compensation.", dysfunction: "Knee" },
  { name: "Single Leg Balance", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "30 sec each", cue: "Soft knee. Neutral spine. Eyes forward. Progress to eyes closed when stable.", dysfunction: "Knee" },
  // Phase 4 — Integrate
  { name: "Lateral Step-Down", phase: "Integrate", phaseNumber: 4, sets: 3, repsOrDuration: "10 each", cue: "Step laterally off box. Control valgus. Glute med fires throughout. No knee cave.", dysfunction: "Knee" },
  { name: "Reverse Lunge", phase: "Integrate", phaseNumber: 4, sets: 3, repsOrDuration: "12 each", cue: "Step back. Knee tracks over toe. Glute of front leg controls. No forward lean.", dysfunction: "Knee" },
  { name: "Single Leg Squat (Assisted)", phase: "Integrate", phaseNumber: 4, sets: 3, repsOrDuration: "10 each", cue: "Hold TRX or wall for balance. Sit into hip. Knee tracks second toe. Glute fires.", dysfunction: "Knee" },
  { name: "Lateral Band Walk", phase: "Integrate", phaseNumber: 4, sets: 3, repsOrDuration: "15 steps each", cue: "Band above knees. Slight squat. Controlled steps. No inward knee collapse.", dysfunction: "Knee" },
  { name: "Box Squat", phase: "Integrate", phaseNumber: 4, sets: 3, repsOrDuration: "12 reps", cue: "Sit back to box. Weight in heels. Knees track toes. Stand with glute drive.", dysfunction: "Knee" },
];

// ─── SHOULDER COMPLEX ─────────────────────────────────────────────────────────
const SHOULDER_EXERCISES: CorrExercise[] = [
  // Phase 1 — Inhibit
  { name: "Posterior Capsule SMR (Sleeper Stretch Position)", phase: "Inhibit", phaseNumber: 1, sets: 1, repsOrDuration: "60-90 sec", cue: "Side-lying. Arm at 90 degrees. Gentle internal rotation pressure. No pain.", dysfunction: "Shoulder" },
  { name: "Pec Minor SMR (Lacrosse Ball)", phase: "Inhibit", phaseNumber: 1, sets: 1, repsOrDuration: "60-90 sec", cue: "Ball below clavicle. Arm relaxed. Breathe into pressure. No breath holding.", dysfunction: "Shoulder" },
  { name: "Thoracic Spine Foam Roll", phase: "Inhibit", phaseNumber: 1, sets: 1, repsOrDuration: "10 passes", cue: "Arms crossed. Roll T4-T9. Pause at stiff segments. No lumbar rolling.", dysfunction: "Shoulder" },
  { name: "Lat SMR", phase: "Inhibit", phaseNumber: 1, sets: 1, repsOrDuration: "60-90 sec", cue: "Side-lying. Roller at armpit. Arm overhead. Roll mid-lat to lower lat.", dysfunction: "Shoulder" },
  // Phase 2 — Lengthen
  { name: "Sleeper Stretch", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "30 sec each", cue: "Side-lying. Arm at 90 degrees. Gentle internal rotation. No pain arc. Stop at tension.", dysfunction: "Shoulder" },
  { name: "Cross-Body Shoulder Stretch", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "30 sec each", cue: "Pull arm across chest. Opposite hand at elbow — not wrist. No shoulder elevation.", dysfunction: "Shoulder" },
  { name: "Doorway Pec Stretch", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "30 sec hold", cue: "Elbow at 90 degrees. Step through. Feel chest — not shoulder. No impingement.", dysfunction: "Shoulder" },
  { name: "Thoracic Extension Over Roller", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "30 sec", cue: "Roller at T6. Arms overhead. Gravity extends — do not force. Breathe.", dysfunction: "Shoulder" },
  { name: "Lat Stretch (Doorway)", phase: "Lengthen", phaseNumber: 2, sets: 2, repsOrDuration: "30 sec each", cue: "Hold frame. Sit hips back. Feel lateral ribcage stretch. No shoulder elevation.", dysfunction: "Shoulder" },
  // Phase 3 — Activate
  { name: "External Rotation (Band)", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "15 reps", cue: "Elbow at side. 90 degrees. Rotate out. Scapula stable. No shoulder elevation.", dysfunction: "Shoulder" },
  { name: "Side-Lying External Rotation", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "12 reps", cue: "Elbow at 90. Rotate up. Towel under armpit. No momentum. Control both directions.", dysfunction: "Shoulder" },
  { name: "Prone T-Raise", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "12 reps", cue: "Prone. Arms at T. Thumbs up. Retract scapulae before lift. No upper trap.", dysfunction: "Shoulder" },
  { name: "Prone Y-Raise", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "12 reps", cue: "Prone. Arms to Y. Thumbs up. Depress scapulae. Lower trap target.", dysfunction: "Shoulder" },
  { name: "Wall Slide", phase: "Activate", phaseNumber: 3, sets: 3, repsOrDuration: "12 reps", cue: "Forearms on wall. Slide up. Scapulae upwardly rotate. No shrug. No rib flare.", dysfunction: "Shoulder" },
  // Phase 4 — Integrate
  { name: "Band Pull-Apart", phase: "Integrate", phaseNumber: 4, sets: 3, repsOrDuration: "15 reps", cue: "Band at chest. Full retraction. 3 sec eccentric return. No forward head.", dysfunction: "Shoulder" },
  { name: "Cable Face Pull", phase: "Integrate", phaseNumber: 4, sets: 3, repsOrDuration: "15 reps", cue: "Rope at eye level. Pull to forehead. External rotation at end. No forward head.", dysfunction: "Shoulder" },
  { name: "Half-Kneeling Single Arm Press", phase: "Integrate", phaseNumber: 4, sets: 3, repsOrDuration: "10 each", cue: "Kneeling. Core braced. Press straight up. Scapula upwardly rotates. No rib flare.", dysfunction: "Shoulder" },
  { name: "Push-Up Plus", phase: "Integrate", phaseNumber: 4, sets: 3, repsOrDuration: "12 reps", cue: "Full push-up + serratus protraction at top. Scapulae move — do not lock.", dysfunction: "Shoulder" },
];

// ─── DYSFUNCTION PROFILES ─────────────────────────────────────────────────────
export const DYSFUNCTION_PROFILES: DysfunctionProfile[] = [
  {
    id: "UCS",
    label: "Upper Crossed Syndrome",
    overactive: ["upper trapezius", "levator scapulae", "sternocleidomastoid", "pec major/minor", "suboccipitals"],
    underactive: ["deep cervical flexors", "lower trapezius", "serratus anterior", "rhomboids"],
    posturalPresentation: "forward head, elevated/protracted scapulae, rounded shoulders, thoracic kyphosis",
    primaryDriver40Plus: "sustained desk posture, phone use, driving, computer work",
    clinicalOutcome: "cervicogenic headache, shoulder impingement, rotator cuff pathology, disc compression C4-C6",
    assessmentTrigger: "Forward head posture > 1 inch from plumb line OR scapular winging on wall test",
    exercises: UCS_EXERCISES,
  },
  {
    id: "LCS",
    label: "Lower Crossed Syndrome",
    overactive: ["hip flexors (iliopsoas, rectus femoris)", "TFL", "lumbar erectors", "adductors"],
    underactive: ["gluteus maximus", "gluteus medius", "transverse abdominis", "internal obliques"],
    posturalPresentation: "anterior pelvic tilt, increased lumbar lordosis, hip flexion at rest, knee hyperextension",
    primaryDriver40Plus: "prolonged sitting (8+ hours daily), sedentary lifestyle, remote work",
    clinicalOutcome: "chronic low back pain, SI joint dysfunction, hip impingement, hamstring injury",
    assessmentTrigger: "Anterior pelvic tilt visible at rest OR glute activation < 40% on single leg bridge",
    exercises: LCS_EXERCISES,
  },
  {
    id: "Knee",
    label: "Knee Complex",
    overactive: ["IT band", "lateral gastrocnemius", "vastus lateralis", "peroneals"],
    underactive: ["VMO (vastus medialis oblique)", "gluteus medius", "tibialis anterior"],
    posturalPresentation: "knee valgus, patellar maltracking, excessive pronation, lateral knee tightness",
    primaryDriver40Plus: "knee valgus on squat, knee pain > 2/10 during step test, excessive pronation on single leg stance",
    clinicalOutcome: "patellar tendinopathy, IT band syndrome, medial knee stress, ACL risk",
    assessmentTrigger: "Knee valgus on bodyweight squat OR knee pain > 2/10 during step test OR excessive pronation on single leg stance",
    exercises: KNEE_EXERCISES,
  },
  {
    id: "Shoulder",
    label: "Shoulder Complex",
    overactive: ["posterior capsule", "pec minor", "upper trapezius", "lats"],
    underactive: ["rotator cuff (infraspinatus, teres minor)", "lower trapezius", "serratus anterior"],
    posturalPresentation: "scapular winging, internal rotation deficit, shoulder elevation during pressing, impingement arc",
    primaryDriver40Plus: "scapular winging on push-up, pain arc 70-120 degrees overhead, GIRD > 20 degrees",
    clinicalOutcome: "rotator cuff pathology, shoulder impingement, labral irritation, biceps tendinopathy",
    assessmentTrigger: "Scapular winging on push-up OR pain arc 70-120 degrees overhead OR GIRD > 20 degrees side-to-side",
    exercises: SHOULDER_EXERCISES,
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Get all exercises for a dysfunction, in NASM phase order */
export function getProtocol(dysfunction: DysfunctionPattern): CorrExercise[] {
  const profile = DYSFUNCTION_PROFILES.find((p) => p.id === dysfunction);
  if (!profile) return [];
  return [...profile.exercises].sort((a, b) => a.phaseNumber - b.phaseNumber);
}

/** Get exercises for a specific phase of a dysfunction */
export function getPhaseExercises(dysfunction: DysfunctionPattern, phase: NasmPhase): CorrExercise[] {
  return getProtocol(dysfunction).filter((e) => e.phase === phase);
}

/** Get the dysfunction profile by ID */
export function getDysfunctionProfile(dysfunction: DysfunctionPattern): DysfunctionProfile | undefined {
  return DYSFUNCTION_PROFILES.find((p) => p.id === dysfunction);
}

/** Build a Claude context string for a given dysfunction + phase */
export function buildCorrectionContext(dysfunction: DysfunctionPattern, currentPhase?: NasmPhase): string {
  const profile = getDysfunctionProfile(dysfunction);
  if (!profile) return "";
  const exercises = currentPhase ? getPhaseExercises(dysfunction, currentPhase) : getProtocol(dysfunction);
  const exerciseList = exercises.map((e) => `  - ${e.name} (${e.sets} sets × ${e.repsOrDuration}): "${e.cue}"`).join("\n");
  return `DYSFUNCTION: ${profile.label}
OVERACTIVE: ${profile.overactive.join(", ")}
UNDERACTIVE: ${profile.underactive.join(", ")}
ASSESSMENT TRIGGER: ${profile.assessmentTrigger}
CLINICAL OUTCOME IF UNTREATED: ${profile.clinicalOutcome}
${currentPhase ? `CURRENT PHASE: ${currentPhase}` : "FULL PROTOCOL"}
EXERCISES:
${exerciseList}`;
}

export const TOTAL_EXERCISES = UCS_EXERCISES.length + LCS_EXERCISES.length + KNEE_EXERCISES.length + SHOULDER_EXERCISES.length;
