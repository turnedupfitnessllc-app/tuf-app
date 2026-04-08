// ═══════════════════════════════════════════════════════════════════════════════
// PANTHER KNOWLEDGE BASE — HIP COMPLEX MODULE
// Version: 1.0 | Region: Hip Complex
// Source: Marc Turner — NASM Corrective Exercise Coach, TUF
// ═══════════════════════════════════════════════════════════════════════════════

export const HIP_COMPLEX = {

  region: "Hip Complex",
  priority: "CRITICAL", // #1 region for 40+ population

  // ── STRUCTURES ──────────────────────────────────────────────────────────────
  structures: {
    joints: {
      iliofemoral:    "Ball-and-socket — deepest joint in the body. Most stable. When it fails, everything above and below compensates.",
      sacroiliac:     "SI joint — transfers load between spine and lower extremity. Dysfunction here creates both back pain AND hip pain.",
      pubicSymphysis: "Anterior stability — holds the pelvis together at the front.",
    },
  },

  // ── PRIMARY MUSCLES ─────────────────────────────────────────────────────────
  muscles: {

    hipFlexors: {
      iliopsoas: {
        role:     "Primary hip flexor. Attaches directly to lumbar spine (L1-L5).",
        critical: "When tight — pulls lumbar into extension, creates anterior pelvic tilt, reciprocally INHIBITS the glutes. One tight muscle shuts down your most important muscle.",
        clientContext: "Every client who sits 8+ hours per day has a tight iliopsoas. That is most of your 40+ population.",
      },
      rectusFemoris: {
        role:     "Crosses BOTH hip and knee. Tight RF limits hip extension AND loads the knee.",
        critical: "Modified Thomas Test — knee straightens when hip flexes = RF tightness confirmed.",
      },
      tfl: {
        role:     "Abducts and internally rotates. Often overactive.",
        critical: "Dominant TFL = IT band compression = lateral knee pain. TFL overworks when glute med is weak.",
      },
    },

    hipExtensors: {
      gluteusMaximus: {
        role:     "Primary hip extensor. The most important muscle in the human body for movement.",
        critical: "When weak — everything downstream compensates. Hamstrings overload, lower back takes over, knee mechanics break down.",
        pantherLaw: "Every session. Every client. Glute activation is non-negotiable.",
      },
      hamstrings: {
        role:     "Secondary hip extensors.",
        critical: "Often 'tight' because they're LENGTHENED and straining — compensating for weak glutes and anterior pelvic tilt. Stretching them alone doesn't fix it. Activating the glutes does.",
      },
    },

    hipAbductors: {
      gluteusMedius: {
        role:     "Stabilizes pelvis during single leg stance. Controls femoral position. Prevents valgus.",
        critical: "ONE weak glute med = pelvis drops + knee caves + foot pronates. Three compensation patterns from one weak muscle.",
        assessment: "Single leg balance — pelvis drops on non-stance side = Trendelenburg = glute med weakness confirmed.",
      },
      tfl_abductor: "Synergist — abducts but also internally rotates. When dominant over glute med, creates valgus collapse.",
    },

    hipAdductors: {
      collective: "Adductor magnus, longus, brevis — often tight, contributing to valgus collapse.",
      clinical:   "Tight adductors + weak glute med = the classic knee-valgus combo. Fix both or you've only fixed half the problem.",
    },

    deepSixExternalRotators: {
      muscles:   ["Piriformis","Obturator Internus","Obturator Externus","Gemellus Superior","Gemellus Inferior","Quadratus Femoris"],
      piriformis: {
        role:    "External rotator and abductor of hip.",
        clinical:"Most commonly overactive of the six. When tight — limits internal rotation, compresses sciatic nerve, creates deep gluteal pain that mimics sciatica.",
        test:    "FAIR test (Flexion, Adduction, Internal Rotation) — pain reproduction = piriformis involvement.",
        verdict: "NOT SCIATICA. YOUR PIRIFORMIS.",
      },
    },
  },

  // ── FUNCTIONS ────────────────────────────────────────────────────────────────
  functions: {
    flexion:          { range:"0–120°+ (knee bent)", primary:"Iliopsoas, Rectus Femoris" },
    extension:        { range:"0–30°",               primary:"Gluteus Maximus, Hamstrings" },
    abduction:        { range:"0–45°",               primary:"Gluteus Medius, Minimus, TFL" },
    adduction:        { range:"0–30°",               primary:"Adductors" },
    internalRotation: { range:"0–40°",               primary:"Glute Med (ant), TFL, Adductors" },
    externalRotation: { range:"0–45°",               primary:"Deep Six Rotators, Glute Max" },
  },

  // ── DYSFUNCTIONS ─────────────────────────────────────────────────────────────
  dysfunctions: {

    anteriorPelvicTilt: {
      label:   "Anterior Pelvic Tilt (APT)",
      verdict: "YOUR PELVIS IS PULLING YOU APART.",
      visual:  "Butt sticks out. Lower back arches. Belly protrudes even on lean clients.",
      rootCause: "Tight hip flexors (iliopsoas + rectus femoris) pulling anterior pelvis down. Weak glutes and core can't resist the pull.",
      syndrome: "Lower Crossed Syndrome",
      downstream: [
        "Lower back pain — lumbar in constant extension",
        "Knee pain — altered femoral mechanics",
        "Hamstring tightness — lengthened and straining, not actually short",
        "Poor glute activation — glutes can't fire efficiently from tilted pelvis",
      ],
      assessment: {
        standing: "Standing posture — fit more than one fist between lumbar spine and wall = APT confirmed",
        ohsa:     "OHSA — excessive lumbar arch at bottom of squat",
        thomas:   "Modified Thomas Test — hanging leg rises = hip flexor restriction",
      },
      correctiveSequence: {
        INHIBIT:   { muscles:["Iliopsoas","TFL","Rectus Femoris"], method:"Foam roll front of hip + lateral thigh", duration:"60-90 sec each" },
        LENGTHEN:  { exercises:["Kneeling hip flexor stretch 30sx3","Couch stretch 30sx3","90/90 hip stretch 45sx2"] },
        ACTIVATE:  { muscles:["Glutes","TVA","Multifidus"], exercises:["Glute bridge 3x15","Dead bug 3x10","Posterior pelvic tilt holds 3x10"] },
        INTEGRATE: { pattern:"Hip hinge → RDL → Split squat", rule:"Posterior pelvic tilt cue in EVERY standing exercise" },
      },
    },

    lateralPelvicTilt: {
      label:   "Lateral Pelvic Tilt / Trendelenburg",
      verdict: "YOUR GLUTE MED IS ASLEEP.",
      visual:  "During single leg stance or walking — pelvis drops on the non-stance side. Body leans toward stance leg.",
      rootCause: "Weak gluteus medius on stance leg. Cannot maintain pelvic level against gravity.",
      syndrome: "Lower Crossed Syndrome",
      downstream: [
        "IT band syndrome — TFL overworks to compensate",
        "Knee valgus — femoral adduction + internal rotation",
        "Lower back pain — QL overloads to hike the pelvis",
        "Foot overpronation — entire chain collapses from one weak muscle",
      ],
      assessment: {
        singleLegBalance: "Single leg balance — does pelvis stay horizontal? Drop = Trendelenburg = glute med weakness",
        singleLegSquat:   "Single leg squat — does hip drop or knee cave?",
        walking:          "Observe gait — does trunk sway to one side each step?",
      },
      correctiveSequence: {
        INHIBIT:   { muscles:["TFL","IT Band","Adductors"], method:"Foam roll lateral hip + inner thigh", duration:"60 sec each" },
        LENGTHEN:  { exercises:["Lateral lunge 3x8","Pigeon pose 45sx2","Hip flexor stretch 30sx3"] },
        ACTIVATE:  { muscles:["Gluteus Medius","Gluteus Minimus"], exercises:["Clamshells 3x15","Side-lying hip abduction 3x15","Lateral band walk 3x12","Fire hydrant 3x12"] },
        INTEGRATE: { pattern:"Single leg RDL → Step-up → Single leg squat", rule:"Cue 'push knees out' on every bilateral squat until valgus is gone" },
      },
    },

    hipFlexorRestriction: {
      label:   "Hip Flexor Restriction",
      verdict: "EIGHT HOURS OF SITTING. THIS IS THE RESULT.",
      visual:  "Can't achieve hip extension. Shortened stride. Foot never gets behind center of mass. Compensates with lumbar extension.",
      rootCause: "Tight iliopsoas + rectus femoris from prolonged sitting. For every hour of sitting, hip flexors adaptively shorten.",
      clientContext: "Most 40+ clients sit 8-10 hours per day. This is not an injury — it's a lifestyle pattern. Fix the tissue AND change the behavior.",
      downstream: [
        "Anterior pelvic tilt",
        "Reduced glute activation — hip flexors reciprocally inhibit glutes",
        "Lower back pain — lumbar overextension compensating for restricted extension",
        "Reduced power — hip extension range is the engine of athletic performance",
      ],
      assessment: {
        thomas:     "Modified Thomas Test — client supine at table edge, pull one knee to chest. Hanging leg rises = iliopsoas tight. Rotates out = TFL tight. Knee straightens = rectus femoris tight.",
        floorModified: "Floor version — supine, pull one knee to chest. Opposite leg stays flat = hip flexors fine. Rises = restriction confirmed.",
        functional: "Watch their walking gait — do they get full hip extension before pushing off?",
      },
      correctiveSequence: {
        INHIBIT:   { muscles:["Iliopsoas","TFL","Rectus Femoris"], method:"Foam roll front of hip 60-90 sec + sustained pressure at inguinal crease" },
        LENGTHEN:  { exercises:["Kneeling hip flexor stretch 30sx3 — POSTERIOR PELVIC TUCK CUE","Couch stretch 30sx3","Lateral lunge 3x8"] },
        ACTIVATE:  { muscles:["Gluteus Maximus","Core"], exercises:["Glute bridge 3x15","Quadruped hip extension 3x12","Dead bug 3x10"] },
        INTEGRATE: { pattern:"Hip hinge → Single leg RDL → Hip thrust", rule:"Every session starts with hip flexor release. Non-negotiable." },
      },
    },

    piriformisSyndrome: {
      label:   "Piriformis Syndrome / Deep Hip Rotator Tightness",
      verdict: "THAT'S NOT SCIATICA. THAT'S YOUR PIRIFORMIS.",
      visual:  "Deep gluteal pain. Sometimes radiates down the leg — mimics sciatica. Worse with sitting, crossing legs, prolonged hip flexion.",
      rootCause: "Overactive/tight piriformis compressing sciatic nerve or creating SI joint dysfunction. Often occurs alongside weak glute med — piriformis overcompensates for lateral stability.",
      clinicalNote: "True sciatica = disc pathology = needs physician clearance. Piriformis syndrome = soft tissue = trainable. Key differentiator: piriformis pain is worse with ACTIVE hip external rotation and sitting. Disc pain is worse with spinal flexion.",
      downstream: [
        "Sciatic-like symptoms without disc pathology",
        "SI joint pain — compression from rotator tightness",
        "Limited hip internal rotation — toe-out posture",
        "Altered squat mechanics — can't track knees properly",
      ],
      assessment: {
        fair:      "FAIR Test — Flexion, Adduction, Internal Rotation. Pain reproduction = piriformis involvement confirmed.",
        seated:    "Seated piriformis stretch — does it relieve the pain? Yes = piriformis is the source.",
        observation:"Toe-out resting posture = chronic external rotation dominance = piriformis likely overactive",
      },
      correctiveSequence: {
        INHIBIT:   { muscles:["Piriformis","Deep Six Rotators"], method:"Lacrosse ball in deep glute — find the tender spot, hold 90 seconds. Not foam roll — the ball gets deeper." },
        LENGTHEN:  { exercises:["Pigeon pose 45sx2 each","90/90 hip stretch 45sx2","Figure-4 stretch 30sx3"] },
        ACTIVATE:  { muscles:["Gluteus Medius","Gluteus Maximus"], exercises:["Clamshells 3x15","Glute bridge 3x15","Side-lying hip abduction 3x15"] },
        INTEGRATE: { pattern:"Goblet squat → Hip thrust → Split squat", rule:"Avoid deep hip flexion under load until piriformis release is complete and pain is gone" },
      },
    },
  },

  // ── PAIN PATTERN MAP ─────────────────────────────────────────────────────────
  painPatterns: {
    anterior_hip:   { location:"Groin / front of hip",       trigger:"Hip flexion, squat, sitting",          cause:"Hip flexor strain, tight iliopsoas, possible labral issue" },
    lateral_hip:    { location:"Outside of hip / thigh",     trigger:"Walking, stairs, single leg stance",   cause:"Glute med weakness, IT band, Trendelenburg" },
    posterior_hip:  { location:"Deep glute / SI region",     trigger:"Sitting, crossing legs, hip IR",       cause:"Piriformis, SI joint dysfunction, deep rotator tightness" },
    referred_pain:  { location:"Down the leg / posterior thigh", trigger:"Sitting, hip IR, prolonged flex", cause:"Piriformis compressing sciatic nerve" },
    low_back_hip:   { location:"Lumbar + SI region",         trigger:"Bending, lifting, prolonged sitting",  cause:"APT, LCS, SI joint dysfunction, hip flexor tightness" },
  },

  // ── CLINICAL DECISION LOGIC ─────────────────────────────────────────────────
  clinicalLogic: [
    {
      condition: "hip pain = anterior AND trigger = squat OR hip flexion",
      assessment: "Modified Thomas Test",
      finding:    "Hip flexor restriction confirmed",
      action:     ["Remove loaded squat","Replace with hip hinge pattern","Add hip flexor stretch before every session","Glute bridge activation mandatory"],
      pantherResponse: "EIGHT HOURS OF SITTING. THIS IS THE RESULT.",
    },
    {
      condition: "pelvis drops during single leg stance OR knee caves in squat",
      assessment: "Single leg balance test",
      finding:    "Glute med weakness / Trendelenburg confirmed",
      action:     ["Add clamshells, lateral band walk, side-lying abduction","Cue 'push knees out' every squat rep","No single-leg loading until stability demonstrated"],
      pantherResponse: "YOUR GLUTE MED IS ASLEEP.",
    },
    {
      condition: "deep gluteal pain AND worse with sitting AND no disc pathology",
      assessment: "FAIR test",
      finding:    "Piriformis syndrome",
      action:     ["Lacrosse ball piriformis release","Pigeon pose + 90/90 stretch","Avoid deep hip flexion under load","Physician referral if neurological symptoms present"],
      pantherResponse: "THAT'S NOT SCIATICA. THAT'S YOUR PIRIFORMIS.",
    },
    {
      condition: "lower back pain AND anterior pelvic tilt confirmed",
      assessment: "Standing posture + OHSA",
      finding:    "APT — Lower Crossed Syndrome",
      action:     ["Inhibit hip flexors first — always","Posterior pelvic tuck cue in every standing exercise","Dead bug + glute bridge every session","No loaded spinal extension"],
      pantherResponse: "YOUR PELVIS IS PULLING YOU APART.",
    },
  ],

  // ── EXERCISE LIBRARY — HIP COMPLEX ──────────────────────────────────────────
  exercises: {

    kneeling_hip_flexor_stretch: {
      name: "Kneeling Hip Flexor Stretch",
      phase: "LENGTHEN",
      targets: ["Iliopsoas","Rectus Femoris"],
      purpose: "Restore hip extension range — the prerequisite for glute activation",
      sets: 3, reps: "30s",
      execution: [
        "Half-kneeling position — back knee on floor",
        "Posterior pelvic tilt FIRST — flatten your lower back before moving forward",
        "Tall spine — no forward lean of the torso",
        "Drive the hips forward slowly and gently",
        "Hold at first point of tension — don't force range",
      ],
      cues: [
        "Tall spine — no forward lean",
        "Posterior pelvic tuck — flatten your lower back",
        "Drive the hips forward slowly — don't just sit into it",
      ],
      mistakes: [
        "Arching lower back to get more range — you're compressing the lumbar, not stretching the hip flexor",
        "Leaning forward — torso collapses, stretch is lost",
        "Skipping the posterior tuck — the iliopsoas doesn't lengthen without it",
      ],
      regression: { name:"Supine hip flexor stretch", description:"Lying on back, pull one knee to chest — passive, gravity-assisted" },
      progression: { name:"Couch stretch", description:"Back foot elevated on couch — increases rectus femoris stretch dramatically" },
    },

    pigeon_pose: {
      name: "Pigeon Pose",
      phase: "LENGTHEN",
      targets: ["Piriformis","External Rotators","Glute Max"],
      purpose: "Release deep hip rotator tightness — the piriformis and the deep six",
      sets: 2, reps: "45s",
      execution: [
        "From quadruped — bring one shin forward, parallel to the front of the mat",
        "Lower the hips toward the floor",
        "Keep hips square — don't let the stance hip drop to one side",
        "Tall torso or walk hands forward for deeper stretch",
        "Breathe into the hip — exhale releases deeper",
      ],
      cues: [
        "Square your hips — both pointed at the floor",
        "Breathe into it — exhale and let the tissue release",
        "No forcing — let gravity do the work",
      ],
      mistakes: [
        "Letting the hip drop to one side — loses the stretch, strains the SI joint",
        "Forcing depth — creates impingement not stretch",
        "Holding the breath — tension blocks the release",
      ],
      regression: { name:"Figure-4 stretch on back", description:"Supine, cross ankle over opposite knee, pull both legs to chest — same targets, less load" },
      progression: { name:"90/90 hip stretch", description:"Both hips at 90 degrees — trains both IR and ER simultaneously" },
    },

    ninety_ninety_stretch: {
      name: "90/90 Hip Stretch",
      phase: "LENGTHEN",
      targets: ["Hip Internal Rotators","Hip External Rotators","Adductors"],
      purpose: "Most complete hip mobility exercise — trains both rotation directions",
      sets: 2, reps: "45s each side",
      execution: [
        "Sit on floor — one leg in front at 90 degrees, one leg to the side at 90 degrees",
        "Sit tall — don't collapse the spine",
        "Lean toward the front shin for external rotator stretch",
        "Lean back and internally rotate for IR stretch",
        "Keep both sit bones attempting to contact the floor",
      ],
      cues: [
        "Tall spine — this isn't a forward fold",
        "Both hips reaching for the floor",
        "Breathe into the tightest spot",
      ],
      mistakes: [
        "Collapsing the spine — loses the hip target entirely",
        "Only doing one direction — you need both IR and ER",
        "Rushing — 45 seconds minimum per position",
      ],
    },

    side_lying_hip_abduction: {
      name: "Side-Lying Hip Abduction",
      phase: "ACTIVATE",
      targets: ["Gluteus Medius","Gluteus Minimus"],
      purpose: "Pure glute med isolation — zero TFL compensation possible in this position",
      sets: 3, reps: "15",
      execution: [
        "Lie on side — body in a straight line",
        "Bottom leg can be slightly bent for stability",
        "Top leg straight — toes pointed slightly DOWN (not up)",
        "Lift the top leg to about 30-40 degrees",
        "Pause 1 second at top",
        "Lower with control — don't let gravity drop it",
      ],
      cues: [
        "Toes down — this kills TFL compensation",
        "Don't let the hip roll forward — stay stacked",
        "Slow and controlled — if it's fast, TFL is firing",
      ],
      mistakes: [
        "Toes pointed up — TFL takes over, glute med disengages",
        "Hip rolling forward — compensation, not isolation",
        "Lifting too high — past 40 degrees and TFL dominates",
      ],
      regression: { name:"Reduced range with hold", description:"Lift to 20 degrees only, hold 3 seconds — re-learns the recruitment pattern" },
      progression: { name:"Banded side-lying abduction", description:"Band above knee adds resistance — increases glute med demand" },
      pantherCue: "Toes DOWN. That one cue is the difference between glute med and TFL. Own it.",
    },

    fire_hydrant: {
      name: "Fire Hydrant",
      phase: "ACTIVATE",
      targets: ["Gluteus Medius","Hip External Rotators"],
      purpose: "Glute med activation with external rotation demand — mimics single leg stance mechanics",
      sets: 3, reps: "12",
      execution: [
        "Quadruped position — hands under shoulders, knees under hips",
        "Brace the core — don't let the spine move",
        "Lift one knee out to the side — like a dog at a fire hydrant",
        "Keep the knee bent at 90 degrees throughout",
        "Hip stays level — don't hike or rotate",
        "Pause at top, lower with control",
      ],
      cues: [
        "Core braced — the spine doesn't move, only the hip",
        "Don't hike the hip — the pelvis stays level",
        "Squeeze at the top — feel the outer glute",
      ],
      mistakes: [
        "Rotating the whole pelvis — compensation, not activation",
        "Going too fast — glute med needs slow controlled activation",
        "Not bracing core — spine moves instead of hip",
      ],
    },

    hip_thrust: {
      name: "Hip Thrust",
      phase: "INTEGRATE",
      targets: ["Gluteus Maximus","Hamstrings","Core"],
      purpose: "Maximum glute loading in full hip extension — the king of glute exercises",
      sets: 3, reps: "10",
      execution: [
        "Upper back against bench — shoulder blades on the pad",
        "Feet flat, hip width, toes slightly out",
        "Bar or weight across hip crease — use pad for comfort",
        "Drive through full foot — heels don't rise",
        "Hips extend to full — body forms straight line from knees to shoulders",
        "Squeeze glutes HARD at top — hold 1-2 seconds",
        "Lower with control — don't drop",
      ],
      cues: [
        "Full extension — don't shortchange the top",
        "Squeeze at the top — if you're not feeling glutes, you're not there yet",
        "Ribs down — chin slightly tucked, not looking at the ceiling",
        "Drive through the full foot — not just the heels",
      ],
      mistakes: [
        "Hyperextending the lumbar — hips haven't extended, the back has",
        "Not reaching full extension — half reps = half results",
        "Looking up at the ceiling — cervical strain + loss of core tension",
        "Feet too far out — transfers work to hamstrings",
      ],
      regression: { name:"Glute bridge on floor", description:"Floor removes the range demand — master here first" },
      progression: { name:"Barbell hip thrust", description:"Load progressively — this is the primary glute strength builder" },
      pantherCue: "Full extension. Every rep. If you're not squeezing at the top, you haven't finished the rep.",
    },

    quadruped_hip_extension: {
      name: "Quadruped Hip Extension",
      phase: "ACTIVATE",
      targets: ["Gluteus Maximus"],
      purpose: "Isolated glute max activation without lumbar compensation",
      sets: 3, reps: "12",
      execution: [
        "Quadruped — hands under shoulders, knees under hips",
        "Brace core — flatten the lower back",
        "Squeeze the glute BEFORE moving the leg",
        "Extend one leg straight back — stop at hip height",
        "Don't arch the back to get more range",
        "Hold 2 seconds, lower with control",
      ],
      cues: [
        "Squeeze the glute first — then move the leg",
        "Hip height only — going higher is a lumbar arch",
        "Core stays braced — the spine is neutral the entire set",
      ],
      mistakes: [
        "Arching the lower back — lumbar extension instead of hip extension",
        "Kicking the leg up — momentum replaces muscle",
        "Not squeezing before moving — glute never fires",
      ],
      progression: { name:"Bird dog → Single leg RDL", description:"Progress from supported to standing to loaded" },
    },

    single_leg_rdl_hip: {
      name: "Single Leg RDL",
      phase: "INTEGRATE",
      targets: ["Gluteus Maximus","Hamstrings","Glute Med (stability)"],
      purpose: "Hip hinge + single leg stability — the most functional hip exercise in the library",
      sets: 3, reps: "8 each",
      execution: [
        "Stand on one leg — soft knee, not locked",
        "Hinge at the hip — push the hip back",
        "The trailing leg and torso form a see-saw around the hip",
        "Reach toward the floor — back leg reaches long behind you",
        "Both hip bones pointing at the floor throughout",
        "3-count descent, 1-count return",
        "Drive through the heel to return — squeeze the glute",
      ],
      cues: [
        "Hinge don't squat — push the hip back",
        "Soft knee on the stance leg — not locked, not bent",
        "Reach long — the trailing leg and torso are a see-saw",
        "Slow the descent — 3 count down, 1 count up",
        "Hip bones level — don't let the hip open",
      ],
      mistakes: [
        "Rotating the hip open — hip bone raises on the trailing leg side",
        "Bending the stance knee too much — becomes a squat",
        "Rushing the descent — momentum hides instability",
        "Not reaching full hip extension at the top — half rep",
      ],
      regression: { name:"TRX-assisted or hand on wall", description:"Takes away balance demand — builds the hinge pattern first" },
      progression: { name:"Loaded SLRDL — KB or DB", description:"Add load when pattern is clean for 3x8 with no compensation" },
    },
  },

  // ── ADAPTIVE FLAGS ───────────────────────────────────────────────────────────
  adaptiveFlags: {
    anterior_hip_pain_squat: {
      trigger:  "hip pain = anterior AND trigger = squat",
      action:   ["Remove loaded squat","Thomas Test assessment","Add hip flexor stretch before every session","Glute bridge activation mandatory","Replace with hip hinge pattern"],
      response: "EIGHT HOURS OF SITTING. THIS IS THE RESULT.",
    },
    trendelenburg: {
      trigger:  "pelvis drops during single leg stance OR knee caves in squat",
      action:   ["Clamshells + lateral band walk + side-lying abduction","Cue 'push knees out' every squat rep","No single-leg loading until stability demonstrated"],
      response: "YOUR GLUTE MED IS ASLEEP.",
    },
    piriformis: {
      trigger:  "deep gluteal pain AND worse with sitting AND no disc pathology",
      action:   ["Lacrosse ball piriformis release","Pigeon pose + 90/90","Avoid deep hip flexion under load","Refer to physician if neurological symptoms"],
      response: "THAT'S NOT SCIATICA. THAT'S YOUR PIRIFORMIS.",
    },
    apt_lower_back: {
      trigger:  "lower back pain AND anterior pelvic tilt confirmed",
      action:   ["Inhibit hip flexors first","Posterior pelvic tuck cue every standing exercise","Dead bug + glute bridge every session","No loaded spinal extension"],
      response: "YOUR PELVIS IS PULLING YOU APART.",
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT INJECTION — Hip Complex Addition
// Add this block to buildSystemPrompt() in panther-v3.jsx
// ═══════════════════════════════════════════════════════════════════════════════

export const HIP_SYSTEM_PROMPT_BLOCK = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HIP COMPLEX — CLINICAL KNOWLEDGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THE #1 REGION FOR YOUR 40+ POPULATION. Every client who sits 8+ hours a day has hip dysfunction. That's most of them.

FOUR DYSFUNCTIONS YOU SEE EVERY DAY:

1. ANTERIOR PELVIC TILT (APT) — Lower Crossed Syndrome
Verdict: "YOUR PELVIS IS PULLING YOU APART."
Root cause: Tight iliopsoas + RF pulling pelvis forward. Weak glutes + core can't resist.
Downstream: Lower back pain, knee pain, hamstring tightness, poor glute activation.
Assessment: Standing — can fit more than one fist behind lumbar = APT. OHSA — lumbar arch at bottom.
Fix: Inhibit hip flexors → Lengthen RF/iliopsoas → Activate glutes + deep core → Integrate hip hinge.
Cue every standing exercise: "Posterior pelvic tilt."

2. LATERAL PELVIC TILT / TRENDELENBURG — Glute Med Weakness
Verdict: "YOUR GLUTE MED IS ASLEEP."
Root cause: Weak gluteus medius — can't stabilize pelvis against gravity.
Downstream: IT band, knee valgus, lower back pain (QL overload), foot pronation.
Assessment: Single leg balance — pelvis drops on non-stance side = confirmed.
Fix: Clamshells → Side-lying abduction → Lateral band walk → Single leg RDL.
Rule: Cue "push knees out" every bilateral squat until valgus is gone.

3. HIP FLEXOR RESTRICTION — Sitting Pattern
Verdict: "EIGHT HOURS OF SITTING. THIS IS THE RESULT."
Root cause: Tight iliopsoas + RF from prolonged sitting. Reciprocally inhibits glutes.
Clinical key: "Tight" hamstrings are often lengthened and straining — NOT short. Fix the hip flexors and glutes. Not the hamstrings.
Assessment: Modified Thomas Test — hanging leg rises = iliopsoas. Rotates out = TFL. Knee extends = RF.
Fix: Foam roll hip flexors → Kneeling stretch (posterior pelvic tuck cue) → Glute activation → Hip hinge.
Every session starts with hip flexor release. Non-negotiable.

4. PIRIFORMIS SYNDROME — Deep Rotator Tightness
Verdict: "THAT'S NOT SCIATICA. THAT'S YOUR PIRIFORMIS."
Root cause: Tight piriformis compressing sciatic nerve. Often occurs when glute med is weak.
Differentiator: Piriformis = worse with sitting + hip IR. True sciatica = worse with spinal flexion.
Assessment: FAIR test (Flexion, Adduction, Internal Rotation) — pain = piriformis confirmed.
Fix: Lacrosse ball in deep glute → Pigeon pose + 90/90 → Glute bridge + clamshells.
Rule: Avoid deep hip flexion under load until pain is resolved. Refer to physician if neurological symptoms present.

HIP EXERCISE CUES:
Kneeling Hip Flexor Stretch: "Tall spine · posterior pelvic tuck · drive hips forward slowly"
  Mistake: Arching lower back — compressing lumbar not stretching hip flexor
Side-Lying Hip Abduction: "Toes DOWN — this kills TFL compensation · don't let hip roll forward"
  Mistake: Toes up — TFL fires, glute med disengages
Fire Hydrant: "Core braced · don't hike the hip · squeeze at top"
  Mistake: Rotating the whole pelvis
Hip Thrust: "Full extension · squeeze at the top · ribs down"
  Mistake: Hyperextending lumbar instead of extending the hip
Single Leg RDL: "Hinge don't squat · soft knee · hip bones level · 3 count down"
  Mistake: Hip rotating open on trailing leg side

PAIN PATTERN MAP:
Anterior hip pain + squat trigger → Hip flexor restriction → Thomas Test → Remove squat load
Lateral hip + walking trigger → Glute med weakness → Single leg test → Clamshells + lateral walk
Deep glute + sitting trigger → Piriformis → FAIR test → Lacrosse ball + pigeon pose
Lower back + APT → LCS → OHSA → Hip flexor inhibition + posterior pelvic tilt cue
`;
