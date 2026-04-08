// ═══════════════════════════════════════════════════════════════════════════════
// PANTHER KNOWLEDGE BASE — v4.0
// 7 REGIONS · FULL CLINICAL BRAIN · NASM CORRECTIVE EXERCISE
// Shoulder · Knee · Back · Hip · Cervical · Thoracic · Ankle
// Source: Marc Turner — NASM CES, Founder TUF
// ═══════════════════════════════════════════════════════════════════════════════

export interface Dysfunction {
  id: string;
  label: string;
  verdict: string;
  rootCause: string;
  syndrome?: string;
  downstream: string[];
  assessment: Record<string, string>;
  correctiveSequence: {
    INHIBIT:   { target: string; method: string; duration?: string };
    LENGTHEN:  { exercises: string[] };
    ACTIVATE:  { target: string; exercises: string[] };
    INTEGRATE: { pattern: string; rule: string };
  };
  clinicalRule?: string;
  referOut?: string;
}

export interface Exercise {
  id: string;
  name: string;
  phase: 'INHIBIT' | 'LENGTHEN' | 'ACTIVATE' | 'INTEGRATE';
  region: string[];
  targets: string[];
  purpose: string;
  sets: number;
  reps: string;
  rest: number;
  execution: string[];
  cues: string[];
  mistakes: string[];
  regression?: { name: string; description: string };
  progression?: { name: string; description: string };
  pantherCue?: string;
  difficulty: 1 | 2 | 3;
}

export interface PainEntry {
  location: string;
  triggers: string[];
  likelyCauses: string[];
  assessments: string[];
  verdict: string;
  correctiveIds: string[];
  referOut?: string;
}

// ── PAIN DIAGNOSTIC ENGINE ────────────────────────────────────────────────────

export const PAIN_ENGINE: Record<string, PainEntry> = {
  front_shoulder: {
    location: "Anterior shoulder",
    triggers: ["shoulder","scapula","overhead","rotator","impinge","press hurts"],
    likelyCauses: ["Scapular instability","Tight pec minor","Rotator cuff weakness","Upper trap dominance"],
    assessments: ["Overhead reach test — shoulder hikes = UCS","Wall slide control test","Push-up scapular wing test"],
    verdict: "THAT'S YOUR SCAPULA, NOT YOUR SHOULDER.",
    correctiveIds: ["wall_slide","band_pull_apart","face_pull","landmine_press"],
    referOut: undefined,
  },
  anterior_knee: {
    location: "Front of knee / patellar region",
    triggers: ["knee","valgus","patella","knee pain","knee hurts","squat hurts"],
    likelyCauses: ["Weak glute medius","Poor patellar tracking","Tight hip flexors","Limited ankle dorsiflexion"],
    assessments: ["Single leg squat — knee caves = glute weakness","Single leg balance < 10s = hip stability deficit"],
    verdict: "YOUR GLUTES AREN'T FIRING.",
    correctiveIds: ["glute_bridge","clamshell","lateral_band_walk","goblet_squat"],
  },
  lower_back: {
    location: "Lumbar / lower back",
    triggers: ["lower back","lumbar","back pain","sitting all day","back hurts"],
    likelyCauses: ["Tight hip flexors (LCS)","Core instability","Poor hinge mechanics","Weak glutes"],
    assessments: ["Toe touch — rounding = hamstring/hip flexor tightness","Hip hinge test — neutral spine?","OHSA — excessive forward lean"],
    verdict: "THAT'S YOUR HIP FLEXORS TALKING.",
    correctiveIds: ["dead_bug","glute_bridge","bird_dog","hip_flexor_stretch","rdl"],
  },
  anterior_hip: {
    location: "Front of hip / groin",
    triggers: ["hip","anterior hip","groin","hip flexor","hip pain","hip flexion hurts"],
    likelyCauses: ["Hip flexor restriction","Tight iliopsoas","Anterior pelvic tilt","Possible labral issue"],
    assessments: ["Modified Thomas Test — hanging leg rises = iliopsoas tight","Standing posture — APT confirmed if 1+ fist behind lumbar"],
    verdict: "EIGHT HOURS OF SITTING. THIS IS THE RESULT.",
    correctiveIds: ["hip_flexor_stretch","kneeling_hip_flexor_stretch","glute_bridge","quadruped_hip_extension"],
  },
  deep_glute: {
    location: "Deep gluteal region",
    triggers: ["deep glute","piriformis","sciatic","sciatica","deep hip","sitting pain","radiating"],
    likelyCauses: ["Piriformis tightness","Deep rotator overload","SI joint dysfunction","Weak glute med"],
    assessments: ["FAIR test (Flexion, Adduction, IR) — pain = piriformis","Seated piriformis stretch relief = confirmed"],
    verdict: "THAT'S NOT SCIATICA. THAT'S YOUR PIRIFORMIS.",
    correctiveIds: ["pigeon_pose","ninety_ninety_stretch","clamshell","glute_bridge"],
    referOut: "Neurological symptoms (numbness, tingling, foot weakness) → physician first",
  },
  lateral_hip: {
    location: "Lateral hip / outside thigh",
    triggers: ["lateral hip","outside hip","it band","hip drops","trendelenburg","pelvis drops"],
    likelyCauses: ["Weak gluteus medius","TFL dominance","IT band overload"],
    assessments: ["Single leg balance — pelvis drops = Trendelenburg","Single leg squat — hip drops on non-stance side"],
    verdict: "YOUR GLUTE MED IS ASLEEP.",
    correctiveIds: ["clamshell","side_lying_hip_abduction","lateral_band_walk","fire_hydrant"],
  },
  neck: {
    location: "Cervical spine / neck",
    triggers: ["neck","cervical","headache","head forward","forward head","neck pain","neck tight"],
    likelyCauses: ["Forward head posture","Weak deep neck flexors","Upper trap dominance","SCM overactivity"],
    assessments: ["Wall test — back of head cannot touch wall = FHP","Chin tuck test — SCM fires first = deep flexor weakness"],
    verdict: "YOUR HEAD IS A 12-POUND BOWLING BALL IN THE WRONG PLACE.",
    correctiveIds: ["chin_tuck","suboccipital_release","wall_angel","upper_trap_stretch"],
    referOut: "Pain radiating into arm or hand → stop cervical loading → physician referral",
  },
  upper_back: {
    location: "Thoracic / mid-upper back",
    triggers: ["upper back","thoracic","kyphosis","rounded","mid back","hunched","between shoulder blades"],
    likelyCauses: ["Thoracic hyperkyphosis","Tight pec major/minor","Weak mid/lower trap","Prolonged sitting"],
    assessments: ["Standing wall test — space between upper back and wall","Seated rotation < 35° = restriction","Overhead reach — rib flare = thoracic extension restriction"],
    verdict: "YOUR UPPER BACK IS FOLDING YOU FORWARD.",
    correctiveIds: ["thoracic_extension_foam_roller","book_openings","quadruped_thoracic_rotation","prone_cobra","ytw"],
  },
  ankle_foot: {
    location: "Ankle / foot / heel",
    triggers: ["ankle","heel","plantar","dorsiflexion","arch","foot","sprain","heel rise","heel pain"],
    likelyCauses: ["Dorsiflexion restriction","Weak intrinsics","Posterior capsule restriction","Plantar fasciitis"],
    assessments: ["5-inch wall test — fail = significant DF restriction","Overhead squat — heel rise","Single leg balance — ankle wobble"],
    verdict: "YOUR ANKLE WON'T BEND. YOUR KNEE PAYS THE PRICE.",
    correctiveIds: ["gastroc_stretch","soleus_stretch","banded_dorsiflexion","short_foot_exercise","single_leg_balance_ankle"],
  },
};

// ── EXERCISE LIBRARY — FULL ───────────────────────────────────────────────────

export const EXERCISE_LIBRARY: Record<string, Exercise> = {

  // ── SHOULDER ────────────────────────────────────────────────────────────────
  wall_slide: {
    id:"wall_slide", name:"Wall Slide", phase:"ACTIVATE", region:["shoulder","cervical"],
    targets:["Serratus Anterior","Lower Trapezius"], difficulty:1,
    purpose:"Restore scapular upward rotation — prerequisite for all overhead movement",
    sets:3, reps:"10", rest:45,
    execution:["Stand with back against wall — head, upper back, glutes touching","Keep ribs down, core engaged","Arms in goalpost — 90° at shoulder and elbow","Slide arms upward slowly maintaining all contact","Return with control"],
    cues:["Keep ribs down — if your back arches, you've lost it","Reach don't shrug — arms go up, shoulders stay down","Smooth control upward"],
    mistakes:["Arching lower back","Shrugging shoulders","Losing wrist or elbow contact with wall"],
    regression:{name:"Floor slide",description:"Lying on back — gravity removed, full floor feedback"},
    progression:{name:"Banded wall slide",description:"Band at wrists adds external rotation demand"},
    pantherCue:"Reach, don't shrug. Arms go up. Shoulders stay down. That's the whole cue.",
  },
  band_pull_apart: {
    id:"band_pull_apart", name:"Band Pull-Apart", phase:"ACTIVATE", region:["shoulder","thoracic"],
    targets:["Mid/Lower Trapezius","Rear Deltoid","Rhomboids"], difficulty:1,
    purpose:"Counteract UCS — strengthen the muscles that sitting destroys",
    sets:3, reps:"15", rest:45,
    execution:["Hold resistance band at shoulder height","Arms extended — slight elbow bend","Pull band apart squeezing shoulder blades DOWN and together","Full range — hands reach sides","Control the return"],
    cues:["Shoulder blades down and back — not just back","Lead with the elbows","Squeeze at the end — hold 1 second"],
    mistakes:["Shrugging — upper trap fires instead","Hyperextending lumbar","Too much resistance — form breaks"],
  },
  face_pull: {
    id:"face_pull", name:"Face Pull", phase:"ACTIVATE", region:["shoulder","cervical"],
    targets:["Rear Deltoid","External Rotators","Lower Trap"], difficulty:1,
    purpose:"External rotation + rear delt activation — the corrective for UCS",
    sets:3, reps:"15", rest:45,
    execution:["Cable or band at face height","Pull to nose — elbows flare out","Externally rotate at end — thumbs back","Hold 1 second at peak contraction","Control return"],
    cues:["Pull to your nose — not your chin","Elbows up and out","External rotate at the end — that's the money position"],
    mistakes:["Pulling too low — becomes a row, not a face pull","No external rotation — missing the key activation","Too heavy — form collapses"],
  },
  landmine_press: {
    id:"landmine_press", name:"Landmine Press", phase:"INTEGRATE", region:["shoulder"],
    targets:["Deltoid","Serratus Anterior","Rotator Cuff"], difficulty:2,
    purpose:"Shoulder-safe pressing pattern — the alternative when overhead is restricted",
    sets:3, reps:"10", rest:75,
    execution:["Stand facing the barbell end","Grip with one or both hands at chest","Press forward and up at 45° angle","Full extension at top","Control descent"],
    cues:["Press at 45° — not straight up","Scapula moves with the press","Full lockout — reach through at the top"],
    mistakes:["Pressing straight up — defeats the purpose","Twisting the torso","No lockout — partial rep"],
    pantherCue:"This is the overhead press you haven't earned yet. Master this first.",
  },

  // ── KNEE / HIP ───────────────────────────────────────────────────────────────
  glute_bridge: {
    id:"glute_bridge", name:"Glute Bridge", phase:"ACTIVATE", region:["knee","back","hip"],
    targets:["Glutes","Core","Hamstrings"], difficulty:1,
    purpose:"Restore hip extension — activate posterior chain before any loading",
    sets:3, reps:"15", rest:45,
    execution:["Lie on back — knees bent, feet flat hip-width","Drive through heels — toes can lift","Squeeze glutes BEFORE driving up","Lift hips until straight line knee to shoulder","Hold 2 seconds at top","Lower with control"],
    cues:["Squeeze glutes first — then drive","Drive through heels — not toes","Ribs down — don't arch to get height","Hold it — 2 seconds minimum"],
    mistakes:["Arching lower back — lumbar compensating for weak glutes","Pushing through toes — shifts to quads","Not squeezing at top"],
    regression:{name:"Short range holds",description:"Small range, 5-sec hold — relearn the squeeze pattern"},
    progression:{name:"Single leg bridge",description:"One leg extended — doubles the glute demand"},
    pantherCue:"If you don't feel your glutes working, they're not. Reset and squeeze harder.",
  },
  clamshell: {
    id:"clamshell", name:"Clamshell", phase:"ACTIVATE", region:["knee","hip"],
    targets:["Glute Medius","Hip External Rotators"], difficulty:1,
    purpose:"Activate hip abductors — the muscles that stop knee valgus",
    sets:3, reps:"15", rest:45,
    execution:["Lie on side — hips stacked directly","Knees bent at 45°, feet together","Rotate top knee upward — clamshell opening","Full range — open all the way","Control back down"],
    cues:["Hips stacked — don't roll back","Drive from the hip — not the foot","Full range — open all the way"],
    mistakes:["Rolling the hips back — cheating range","Losing foot contact","Too fast — speed hides compensation"],
    progression:{name:"Banded clamshell",description:"Band above knees — increases glute med demand"},
    pantherCue:"Feel the outer glute fire. If you don't feel it there, your hip is rolling. Reset.",
  },
  lateral_band_walk: {
    id:"lateral_band_walk", name:"Lateral Band Walk", phase:"ACTIVATE", region:["knee","hip"],
    targets:["Glute Medius","Hip Stabilizers"], difficulty:1,
    purpose:"Build hip abductor strength — first line of defense against knee valgus",
    sets:3, reps:"12", rest:45,
    execution:["Band above knees or ankles","Athletic position — slight squat, hips back","Step laterally with controlled width","Maintain band tension throughout","Same number of steps each direction"],
    cues:["Stay low — athletic position the whole way","Push out against the band — don't let it control you","Controlled steps — quality over distance"],
    mistakes:["Standing upright — removes glute demand","Dragging feet — band goes slack","Too wide — hip flexors compensate"],
    pantherCue:"The second you stand up, the glutes check out. Stay low.",
  },
  goblet_squat: {
    id:"goblet_squat", name:"Goblet Squat", phase:"INTEGRATE", region:["knee","hip"],
    targets:["Quads","Glutes","Core"], difficulty:2,
    purpose:"Reinforce squat mechanics — the corrective squat pattern",
    sets:3, reps:"10", rest:75,
    execution:["Hold weight at chest — goblet position","Feet shoulder-width, toes slightly out","Sit back AND down — hips and knees together","Knees track over second toe — actively push out","Chest tall throughout","Drive through full foot on return"],
    cues:["Push knees out — actively drive in line with toes","Sit back into hips — weight in heels","Chest tall — the goblet is your coach"],
    mistakes:["Knees collapsing inward","Heels lifting — ankle restriction","Chest dropping — torso caves"],
    regression:{name:"Box squat",description:"Squat to box — teaches sit-back pattern, removes depth anxiety"},
    progression:{name:"Front squat",description:"Earned after consistent goblet squat with zero valgus"},
    pantherCue:"Knees out. Sit back. Chest up. Three things. Every rep.",
  },

  // ── BACK / CORE ──────────────────────────────────────────────────────────────
  dead_bug: {
    id:"dead_bug", name:"Dead Bug", phase:"ACTIVATE", region:["back"],
    targets:["Deep Core","TVA","Multifidus"], difficulty:1,
    purpose:"Build anti-extension core stability — the foundation of every loaded movement",
    sets:3, reps:"10", rest:45,
    execution:["Lie on back — arms to ceiling, knees 90° table top","Press lower back INTO floor — no gap","Slowly extend opposite arm and leg","Keep lower back pressed throughout","Return with control — repeat other side"],
    cues:["Lower back flat to the floor — no gap ever","Move slow — if it's fast it's wrong","Exhale on the extension"],
    mistakes:["Arching lower back — core lost","Moving too fast","Holding breath"],
    regression:{name:"Arm-only or leg-only",description:"Single limb — half the demand"},
    progression:{name:"Dead bug with resistance band",description:"Band pulls arm — increases anti-extension demand"},
    pantherCue:"Back flat. No gap. If your back lifts, shorten the range. The floor is your feedback.",
  },
  bird_dog: {
    id:"bird_dog", name:"Bird Dog", phase:"INTEGRATE", region:["back","hip"],
    targets:["Core","Glutes","Lower Back Stabilizers"], difficulty:2,
    purpose:"Cross-body coordination and spinal stability under movement",
    sets:3, reps:"10", rest:45,
    execution:["Quadruped — hands under shoulders, knees under hips","Brace core before moving","Extend opposite arm and leg simultaneously","Reach long — not high","Pause 2 seconds at full extension","Return with control — no rotation"],
    cues:["Neutral spine — no rotation, no sagging","Reach long not high — length over height","Pause at the top — if you can't hold it, you don't own it"],
    mistakes:["Rotating hips","Sagging lower back","Rushing"],
  },
  rdl: {
    id:"rdl", name:"Romanian Deadlift", phase:"INTEGRATE", region:["back","hip"],
    targets:["Hamstrings","Glutes","Lower Back"], difficulty:2,
    purpose:"Build hip hinge pattern — the most important movement for the 40+ back",
    sets:3, reps:"10", rest:90,
    execution:["Stand tall — bar or dumbbells at hips","HINGE at hips — push hips back, not down","Maintain neutral spine — brace core","Bar stays close to legs throughout","Lower until hamstring tension — not floor","Drive hips forward to return"],
    cues:["Hinge not squat — hips back not down","Neutral spine — protect it","Bar close — if it drifts forward the back takes over"],
    mistakes:["Rounding lower back — most common, most dangerous","Bending knees too much","Looking up — cervical strain"],
    pantherCue:"Hinge not squat. Hips back. The moment you squat it, the lower back takes over.",
  },

  // ── HIP ──────────────────────────────────────────────────────────────────────
  hip_flexor_stretch: {
    id:"hip_flexor_stretch", name:"Hip Flexor Stretch (Kneeling)", phase:"LENGTHEN", region:["hip","back"],
    targets:["Iliopsoas","Rectus Femoris"], difficulty:1,
    purpose:"Restore hip extension range — prerequisite for glute activation",
    sets:3, reps:"30s", rest:30,
    execution:["Half-kneeling — back knee on floor","POSTERIOR PELVIC TILT FIRST — flatten lower back","Tall spine — no forward lean","Drive hips forward slowly and gently","Hold at first point of tension"],
    cues:["Tall spine — no forward lean","Posterior pelvic tuck — flatten your lower back","Drive the hips forward slowly — don't just sit into it"],
    mistakes:["Arching lower back — compressing lumbar not stretching hip flexor","Leaning forward — stretch is lost","Skipping the posterior tuck"],
    regression:{name:"Supine hip flexor stretch",description:"Lying on back — passive, gravity-assisted"},
    progression:{name:"Couch stretch",description:"Back foot elevated — increases RF stretch dramatically"},
  },
  kneeling_hip_flexor_stretch: {
    id:"kneeling_hip_flexor_stretch", name:"Kneeling Hip Flexor Stretch", phase:"LENGTHEN", region:["hip"],
    targets:["Iliopsoas","Rectus Femoris"], difficulty:1,
    purpose:"Primary hip flexor lengthening — non-negotiable for APT correction",
    sets:3, reps:"30s", rest:30,
    execution:["Half-kneeling","Posterior pelvic tilt first","Tall spine","Drive hips forward","Hold tension — breathe"],
    cues:["Posterior pelvic tuck first — always","Tall spine throughout","Drive forward — don't collapse"],
    mistakes:["Lumbar arch — missing the pelvic tuck","Forward lean — loses the stretch"],
  },
  pigeon_pose: {
    id:"pigeon_pose", name:"Pigeon Pose", phase:"LENGTHEN", region:["hip"],
    targets:["Piriformis","External Rotators","Glute Max"], difficulty:2,
    purpose:"Release deep hip rotator tightness — piriformis and deep six",
    sets:2, reps:"45s", rest:30,
    execution:["From quadruped — bring shin forward parallel to front of mat","Lower hips toward floor","Keep hips SQUARE — both pointing at floor","Breathe into the hip — exhale releases deeper"],
    cues:["Square your hips — both pointed at the floor","Breathe into it — exhale and release","No forcing — let gravity do the work"],
    mistakes:["Hip dropping to one side — strains SI joint","Forcing depth — creates impingement","Holding breath"],
    regression:{name:"Figure-4 stretch on back",description:"Supine, cross ankle over knee — same targets, less load"},
    progression:{name:"90/90 hip stretch",description:"Both hips at 90° — trains both IR and ER simultaneously"},
  },
  ninety_ninety_stretch: {
    id:"ninety_ninety_stretch", name:"90/90 Hip Stretch", phase:"LENGTHEN", region:["hip"],
    targets:["Hip Internal Rotators","Hip External Rotators","Adductors"], difficulty:2,
    purpose:"Most complete hip mobility exercise — trains both rotation directions",
    sets:2, reps:"45s each", rest:30,
    execution:["Sit on floor — front leg and side leg both at 90°","Sit tall","Lean toward front shin for ER stretch","Lean back for IR stretch","Both sit bones reaching for floor"],
    cues:["Tall spine — this isn't a forward fold","Both hips reaching for the floor","Breathe into the tightest spot"],
    mistakes:["Collapsing the spine","Only one direction","Rushing"],
  },
  side_lying_hip_abduction: {
    id:"side_lying_hip_abduction", name:"Side-Lying Hip Abduction", phase:"ACTIVATE", region:["hip","knee"],
    targets:["Gluteus Medius","Gluteus Minimus"], difficulty:1,
    purpose:"Pure glute med isolation — zero TFL compensation in this position",
    sets:3, reps:"15", rest:45,
    execution:["Lie on side — body in straight line","Top leg straight","TOES POINTED DOWN — not up","Lift to 30-40°","Pause 1 second at top","Lower with control"],
    cues:["Toes DOWN — this kills TFL compensation","Don't let the hip roll forward","Slow and controlled — fast means TFL is firing"],
    mistakes:["Toes pointed up — TFL takes over","Hip rolling forward","Lifting too high > 40°"],
    progression:{name:"Banded side-lying abduction",description:"Band above knee — increases glute med demand"},
    pantherCue:"Toes DOWN. That one cue is the difference between glute med and TFL. Own it.",
  },
  fire_hydrant: {
    id:"fire_hydrant", name:"Fire Hydrant", phase:"ACTIVATE", region:["hip"],
    targets:["Gluteus Medius","Hip External Rotators"], difficulty:1,
    purpose:"Glute med activation with external rotation demand",
    sets:3, reps:"12", rest:45,
    execution:["Quadruped — hands under shoulders, knees under hips","Brace core — spine doesn't move","Lift one knee out to side — like a fire hydrant","Knee stays bent at 90°","Hip stays level — don't hike","Pause, lower with control"],
    cues:["Core braced — spine doesn't move, only hip","Don't hike the hip — pelvis stays level","Squeeze at the top — feel the outer glute"],
    mistakes:["Rotating whole pelvis","Going too fast","Not bracing core"],
  },
  quadruped_hip_extension: {
    id:"quadruped_hip_extension", name:"Quadruped Hip Extension", phase:"ACTIVATE", region:["hip","back"],
    targets:["Gluteus Maximus"], difficulty:1,
    purpose:"Isolated glute max activation without lumbar compensation",
    sets:3, reps:"12", rest:45,
    execution:["Quadruped","Brace core — flatten lower back","Squeeze the glute BEFORE moving the leg","Extend one leg back — hip height only","Don't arch back to get more range","Hold 2 seconds, lower with control"],
    cues:["Squeeze the glute first — then move the leg","Hip height only — higher = lumbar arch","Core stays braced — the spine is neutral"],
    mistakes:["Arching lower back","Kicking leg up","Not squeezing before moving"],
  },
  hip_thrust: {
    id:"hip_thrust", name:"Hip Thrust", phase:"INTEGRATE", region:["hip","knee"],
    targets:["Gluteus Maximus","Hamstrings","Core"], difficulty:2,
    purpose:"Maximum glute loading in full hip extension — the king of glute exercises",
    sets:3, reps:"10", rest:90,
    execution:["Upper back against bench — shoulder blades on pad","Feet flat, hip-width, toes slightly out","Bar across hip crease — use pad","Drive through full foot","Extend to straight line knees to shoulders","Squeeze glutes HARD at top — hold 1-2 sec","Lower with control"],
    cues:["Full extension — don't shortchange the top","Squeeze at the top — that's where the glute works","Ribs down — chin slightly tucked","Drive through full foot — not just heels"],
    mistakes:["Hyperextending lumbar instead of extending hip","Not reaching full extension","Looking up at ceiling","Feet too far out"],
    regression:{name:"Glute bridge on floor",description:"Floor removes range demand — master here first"},
    progression:{name:"Barbell hip thrust",description:"Load progressively — primary glute strength builder"},
    pantherCue:"Full extension. Every rep. If you're not squeezing at the top, you haven't finished the rep.",
  },
  single_leg_rdl: {
    id:"single_leg_rdl", name:"Single Leg RDL", phase:"INTEGRATE", region:["hip","back"],
    targets:["Gluteus Maximus","Hamstrings","Glute Med (stability)"], difficulty:3,
    purpose:"Hip hinge + single leg stability — most functional hip exercise in the library",
    sets:3, reps:"8 each", rest:90,
    execution:["Stand on one leg — soft knee, not locked","Hinge at hip — push hips back","Trailing leg and torso form a see-saw","Reach toward floor — back leg reaches long","Both hip bones pointing at floor","3-count descent, 1-count return","Drive through heel to return — squeeze glute"],
    cues:["Hinge don't squat — push the hip back","Soft knee — not locked, not bent","Reach long — the trailing leg and torso are a see-saw","Slow the descent — 3 count down","Hip bones level — don't let the hip open"],
    mistakes:["Rotating hip open","Bending stance knee too much","Rushing descent","Not reaching full extension at top"],
    regression:{name:"TRX-assisted or hand on wall",description:"Takes away balance demand — builds hinge pattern first"},
    progression:{name:"Loaded SLRDL — KB or DB",description:"Add load when pattern is clean for 3x8 with zero compensation"},
  },

  // ── CERVICAL ─────────────────────────────────────────────────────────────────
  chin_tuck: {
    id:"chin_tuck", name:"Chin Tuck", phase:"ACTIVATE", region:["cervical"],
    targets:["Deep Neck Flexors","Cervical Stabilizers"], difficulty:1,
    purpose:"Activate deep neck flexors — restore neutral cervical alignment",
    sets:3, reps:"12", rest:30,
    execution:["Stand or sit tall — or supine for easiest version","Draw chin straight back — horizontal movement","Create a 'double chin' — this is neutral not flexion","Hold 2-3 seconds at end range","Return to start — do NOT look down"],
    cues:["Make a double chin — that's the target position","Head moves back not down — eyes stay level","Hold it — 2 seconds minimum"],
    mistakes:["Looking down — targets wrong muscles","Moving the whole body","Not holding — deep flexors need time under tension"],
    regression:{name:"Supine chin tuck",description:"Lying on back — gravity-assisted, easier isolation"},
    progression:{name:"Chin tuck with band resistance",description:"Light band at forehead — increases deep flexor demand"},
    pantherCue:"Make a double chin. Hold it. That's neutral cervical spine — not the chin-forward position you live in all day.",
  },
  suboccipital_release: {
    id:"suboccipital_release", name:"Suboccipital Release", phase:"INHIBIT", region:["cervical"],
    targets:["Suboccipitals","Upper Cervical Extensors"], difficulty:1,
    purpose:"Release compression at base of skull — source of cervicogenic headaches",
    sets:1, reps:"90s", rest:0,
    execution:["Lie on back — knees bent","Fingertips at base of skull","Apply gentle upward pressure — head weight does the work","Hold 60-90 seconds — breathe slowly"],
    cues:["Gentle pressure only — this is not aggressive","Let the head relax","Breathe — each exhale releases deeper"],
    mistakes:["Too much force","Holding breath","Moving the head"],
  },
  wall_angel: {
    id:"wall_angel", name:"Wall Angel", phase:"INTEGRATE", region:["cervical","shoulder","thoracic"],
    targets:["Deep Neck Flexors","Lower Trap","Serratus Anterior"], difficulty:2,
    purpose:"Integrate chin tuck with scapular movement — ties cervical and shoulder corrections together",
    sets:3, reps:"10", rest:45,
    execution:["Stand flat to wall — head, upper back, glutes all touching","Perform chin tuck FIRST — back of head makes contact","Arms in goalpost — elbows and wrists touching wall","Slide arms up maintaining ALL contact points","Chin tuck maintained throughout"],
    cues:["Chin tuck first — always. Don't start without it.","Back of head to wall — if it's not touching, the chin is jutting","Reach don't shrug — arms go up, shoulders stay down"],
    mistakes:["Chin jutting forward — whole exercise compromised","Losing wall contact","Shrugging — upper trap fires"],
    pantherCue:"Chin tucked before anything moves. If the head's not against the wall, fix that first.",
  },
  upper_trap_stretch: {
    id:"upper_trap_stretch", name:"Upper Trap Stretch", phase:"LENGTHEN", region:["cervical","shoulder"],
    targets:["Upper Trapezius","Levator Scapulae"], difficulty:1,
    purpose:"Lengthen chronically overactive upper trap — the muscle that holds everyone's stress",
    sets:3, reps:"30s each", rest:30,
    execution:["Sit or stand tall","Reach one hand behind back or hold chair","Side-bend head away from holding arm","Add slight forward rotation for levator","Hold at first tension — don't force"],
    cues:["Anchor the shoulder down first","Tall spine — shoulder doesn't rise to meet the ear","Breathe into it"],
    mistakes:["Pulling head with hand — compression risk","Shoulder rising","Holding breath"],
  },

  // ── THORACIC ─────────────────────────────────────────────────────────────────
  thoracic_extension_foam_roller: {
    id:"thoracic_extension_foam_roller", name:"Thoracic Extension (Foam Roller)", phase:"INHIBIT", region:["thoracic"],
    targets:["Thoracic Facets","Costovertebral Joints"], difficulty:1,
    purpose:"The most direct way to restore thoracic extension — address hyperkyphosis at the source",
    sets:2, reps:"60s each segment", rest:30,
    execution:["Foam roller perpendicular to spine at mid-thoracic T5-T8","Support head with interlaced fingers — do NOT pull neck","Knees bent, feet flat","Allow gravity to extend thoracic over roller","3-4 breaths — exhale allows more extension","Move to adjacent segment T4 to T9"],
    cues:["Let gravity do the work — don't force it","Support the head — this is not a neck exercise","Breathe into the roller — exhale and release","Move segment by segment — find the stiff ones"],
    mistakes:["Rolling up and down — this is a sustained hold","Pulling the neck — cervical strain risk","Holding the breath","Doing it at the lumbar"],
    pantherCue:"Find the stiff segment and hold. Breathe into it. That resistance — that's 10 years of desk work.",
  },
  quadruped_thoracic_rotation: {
    id:"quadruped_thoracic_rotation", name:"Thoracic Rotation (Thread the Needle)", phase:"LENGTHEN", region:["thoracic"],
    targets:["Thoracic Rotation","Costovertebral Joints"], difficulty:1,
    purpose:"Restore thoracic rotation — the most important function of the thoracic spine",
    sets:3, reps:"8 each", rest:30,
    execution:["Quadruped","One hand behind head — elbow points to ceiling","Rotate elbow toward floor — threading under body","Follow with eyes","Rotate back toward ceiling — full range","Hips stay level — thoracic movement only"],
    cues:["Follow the elbow with your eyes — eyes drive thoracic rotation","Hips don't move — thoracic only","Breathe out as you rotate"],
    mistakes:["Hips rotating — thoracic not moving, lumbar is","Not following with eyes","Too fast"],
  },
  book_openings: {
    id:"book_openings", name:"Book Openings", phase:"LENGTHEN", region:["thoracic","shoulder"],
    targets:["Thoracic Rotation","Pectorals","Anterior Shoulder"], difficulty:1,
    purpose:"Thoracic rotation with pec opening — two corrections in one",
    sets:3, reps:"10 each", rest:30,
    execution:["Side-lying — knees stacked at 90°","Both arms extended in front","Keep bottom arm still — rotate top arm up and behind","Follow with eyes — head rotates with thorax","Let back of hand reach for floor behind","Return with control"],
    cues:["Let the chest open — that restriction is what we're working on","Eyes follow the hand","Keep knees stacked — hips don't rotate"],
    mistakes:["Knees separating — hip rotation not thoracic","Forcing arm to floor — work in available range"],
  },
  prone_cobra: {
    id:"prone_cobra", name:"Prone Cobra", phase:"ACTIVATE", region:["thoracic","shoulder"],
    targets:["Mid/Lower Trapezius","Thoracic Extensors","Posterior Shoulder"], difficulty:1,
    purpose:"Activate the muscles that fight hyperkyphosis — from the position of extension",
    sets:3, reps:"10", rest:45,
    execution:["Lie face down — arms by sides, palms facing floor","Retract shoulder blades — squeeze together AND DOWN","Lift chest off floor slightly — thoracic extension only","Externally rotate arms — thumbs point up","Hold 2-3 seconds","Lower with control"],
    cues:["Shoulder blades down and together — not just together","Thumbs up — locks in external rotation","Small movement — quality over height","Hold it — lower trap needs time under tension"],
    mistakes:["Using lumbar to extend — thoracic only","Not rotating arms — loses posterior shoulder activation","Holding breath"],
    pantherCue:"Shoulder blades DOWN and together. That burning in your mid-back? That's your lower trap waking up.",
  },
  ytw: {
    id:"ytw", name:"Y-T-W", phase:"ACTIVATE", region:["thoracic","shoulder"],
    targets:["Lower Trap (Y)","Mid Trap (T)","Posterior Deltoid (W)"], difficulty:2,
    purpose:"Three positions that activate every underactive muscle in upper crossed syndrome",
    sets:3, reps:"10 each position", rest:45,
    execution:["Prone or inclined","Y: arms overhead in Y — thumbs up, lift and hold 2 sec","T: arms out to sides — thumbs up, lift and hold 2 sec","W: elbows bent 90° — externally rotate, forearms lift, hold 2 sec"],
    cues:["Thumbs up on every position","Shoulder blades lead — arms follow","Small and controlled — perfect beats heavy here"],
    mistakes:["Too heavy — upper trap fires instead","Thumbs neutral or down","Rushing through positions"],
  },
  diaphragmatic_breathing: {
    id:"diaphragmatic_breathing", name:"Diaphragmatic Breathing", phase:"ACTIVATE", region:["thoracic","cervical"],
    targets:["Diaphragm","Deep Core","Thoracic Mobility"], difficulty:1,
    purpose:"Restore primary breathing pattern — foundation of core stability",
    sets:1, reps:"5 min daily", rest:0,
    execution:["Supine — knees bent, one hand chest, one on belly","Inhale 4 counts — belly rises, chest stays still","Exhale 6 counts — belly falls, rib cage narrows","Hand on chest barely moves","Focus on lateral rib cage expansion"],
    cues:["Belly rises not chest","Breathe into the sides — lateral expansion is the target","Exhale fully — create space for next breath"],
    mistakes:["Chest rising — accessory muscles still driving","Short exhale","Forcing"],
    pantherCue:"Your chest shouldn't be moving. If the chest rises, you haven't found the diaphragm yet.",
  },

  // ── ANKLE ────────────────────────────────────────────────────────────────────
  gastroc_stretch: {
    id:"gastroc_stretch", name:"Gastrocnemius Stretch", phase:"LENGTHEN", region:["ankle"],
    targets:["Gastrocnemius","Posterior Ankle Capsule"], difficulty:1,
    purpose:"Restore dorsiflexion — #1 ankle restriction in 40+ clients",
    sets:3, reps:"30s", rest:30,
    execution:["Stand facing wall","Step one foot back — straight knee, heel flat","Lean into wall gently","Back leg knee fully extended — this is gastroc stretch","Hold at first tension"],
    cues:["Heel on floor — moment it lifts, stretch is lost","Knee straight — bent knee is the soleus stretch","Hips toward wall — the lean drives the stretch"],
    mistakes:["Heel rising","Bending the back knee","Foot turning out"],
    progression:{name:"Soleus stretch",description:"Same position — bend back knee 20-30° to target soleus"},
  },
  soleus_stretch: {
    id:"soleus_stretch", name:"Soleus Stretch", phase:"LENGTHEN", region:["ankle"],
    targets:["Soleus","Deep Posterior Compartment"], difficulty:1,
    purpose:"Often tighter than gastroc in 40+ clients — limits DF even with bent knee",
    sets:3, reps:"30s", rest:30,
    execution:["Same wall position as gastroc stretch","Back knee bent 20-30°","Heel stays flat — heel on floor is the whole point","Lean forward to drive stretch"],
    cues:["Heel on the floor — the whole time","Knee slightly bent — you should feel it deeper","Lean into the wall"],
    mistakes:["Heel rising — stretch is lost","Too much knee bend — becomes a lunge"],
  },
  banded_dorsiflexion: {
    id:"banded_dorsiflexion", name:"Banded Ankle Dorsiflexion Mobilization", phase:"LENGTHEN", region:["ankle"],
    targets:["Talocrural Joint","Posterior Ankle Capsule"], difficulty:1,
    purpose:"When soft tissue stretching hasn't restored dorsiflexion — this addresses the joint itself",
    sets:2, reps:"60s each", rest:30,
    execution:["Band around ankle JUST BELOW the malleoli — must be at joint line","Band pulls posteriorly — anchor behind you at low point","Foot on box or step — toes up","Drive knee forward over toes maintaining heel contact","Band creates posterior distraction — opens the talocrural joint","Oscillate in and out of range for 60 seconds"],
    cues:["Heel on the step — don't let it lift","Drive knee over middle toe","Feel the stretch in FRONT of ankle — that's the joint opening"],
    mistakes:["Band above ankle — must be at joint line","Heel rising — distraction is lost","Band pulling sideways — must pull straight posterior"],
    pantherCue:"When the calf stretch stopped working, this is the next tool. The joint itself is restricted.",
  },
  short_foot_exercise: {
    id:"short_foot_exercise", name:"Short Foot Exercise", phase:"ACTIVATE", region:["ankle"],
    targets:["Intrinsic Foot Muscles","Plantar Arch"], difficulty:1,
    purpose:"Foundation foot exercise — activates intrinsics without toe curling",
    sets:3, reps:"10 hold", rest:30,
    execution:["Seated or standing — foot flat on floor","Tripod contact: heel, ball of big toe, ball of little toe","WITHOUT curling toes — attempt to shorten the foot","Pull ball of foot toward heel — arch rises slightly","Hold 5-10 seconds","Relax completely between reps"],
    cues:["Don't curl the toes — movement is in the arch not the toes","Pull the ball of your foot toward your heel","Subtle movement — this is deep intrinsic muscle","Feel the arch lift — that's the target"],
    mistakes:["Curling toes — toe flexors not intrinsics","Moving too fast — intrinsics fatigue and compensate quickly","Not maintaining tripod"],
    pantherCue:"Tripod. Three contact points. Arch lifts — toes stay long. The most important thing you've never trained.",
  },
  single_leg_balance_ankle: {
    id:"single_leg_balance_ankle", name:"Single Leg Balance", phase:"ACTIVATE", region:["ankle","knee","hip"],
    targets:["Proprioception","Peroneals","Tibialis Anterior","Intrinsics"], difficulty:2,
    purpose:"Retrain proprioceptive system — the rehab every sprained ankle never got",
    sets:3, reps:"30s", rest:30,
    execution:["Stand on one foot — slight knee bend, not locked","Find balance point — tripod contact, slight hip flexion","Maintain 30 seconds with minimal wobble","Progressions: eyes closed, unstable surface, add movement"],
    cues:["Soft knee — don't lock it out","Tripod foot — grip floor with all three contact points","Still at the hip — glute med working","Eyes forward — focus point helps stability"],
    mistakes:["Locked knee — removes proprioceptive demand","Pelvis dropping — glute med not engaged","Looking down"],
    regression:{name:"Fingertip wall support",description:"Light touch on wall — teaches position with safety net"},
    progression:{name:"Eyes closed → BOSU → Single leg RDL",description:"Progressive proprioceptive demand"},
  },
  tibialis_anterior_raises: {
    id:"tibialis_anterior_raises", name:"Tibialis Anterior Raises", phase:"ACTIVATE", region:["ankle"],
    targets:["Tibialis Anterior"], difficulty:1,
    purpose:"Strengthen dorsiflexors — the counterbalance to calf tightness that nobody trains",
    sets:3, reps:"15", rest:30,
    execution:["Stand with back against wall — feet 12 inches from wall","Heels stay on floor","Lift toes and forefoot as high as possible","Hold 1 second at top","Lower with control"],
    cues:["Full range — get toes as high as possible","Hold at the top — don't just flick the foot","Control the lowering — eccentric is where TA works"],
    mistakes:["Partial range","Too fast — eccentric control is the point","Moving the whole leg"],
  },
};

// ── CROSS-REGION COMPENSATION CHAINS ─────────────────────────────────────────
export const COMPENSATION_CHAINS = [
  {
    chain: "ANKLE → KNEE → HIP → BACK",
    description: "Ankle DF restriction → heel rise → knee valgus → anterior knee pain → hip compensation → lower back pain",
    entry: ["ankle","dorsiflexion","heel rise","heel rises in squat"],
  },
  {
    chain: "HEAD → CERVICAL → THORACIC → SHOULDER",
    description: "Upper trap dominant → forward head → cervical compression → thoracic kyphosis → shoulder impingement",
    entry: ["neck","headache","shoulder pain","rounded shoulders","forward head"],
  },
  {
    chain: "HIP FLEXORS → PELVIS → LUMBAR → HAMSTRINGS",
    description: "Tight hip flexors → APT → lumbar compression → hamstrings strain → poor glute activation → knee valgus",
    entry: ["tight hamstrings","hip flexors","anterior pelvic tilt","lower back"],
  },
  {
    chain: "THORACIC → SHOULDER",
    description: "Thoracic restriction → shoulder impingement (scapula cannot move on kyphotic spine)",
    entry: ["shoulder pain that won't resolve","overhead restriction"],
  },
  {
    chain: "GLUTE MED → KNEE → FOOT",
    description: "Weak glute med → Trendelenburg → knee valgus → medial knee pain → overpronation",
    entry: ["knee caves","valgus","medial knee","flat feet"],
  },
];

// ── PANTHER SYSTEM PROMPT EXPORT ──────────────────────────────────────────────
export function buildPantherSystemPrompt(clientProfile?: {
  name?: string;
  goal?: string;
  primaryIssue?: string;
  sessions?: number;
  stage?: string;
  xp?: number;
  wins?: string[];
  struggles?: string[];
  regionsAssessed?: string[];
}): string {

  const clientCtx = clientProfile?.name
    ? `CLIENT PROFILE — SESSION ${(clientProfile.sessions||0)+1}:
Name: ${clientProfile.name}
Goal: ${clientProfile.goal || "Not yet defined"}
Primary Issue: ${clientProfile.primaryIssue || "Not yet assessed"}
Stage: ${clientProfile.stage || "CUB"} | XP: ${clientProfile.xp || 0}
Known wins: ${clientProfile.wins?.slice(-3).join(" / ") || "None yet"}
Known struggles: ${clientProfile.struggles?.slice(-3).join(" / ") || "None yet"}
Regions assessed: ${clientProfile.regionsAssessed?.join(", ") || "None yet"}
USE THIS. Use their name. Reference their history. This is an ongoing relationship.`
    : `NEW CLIENT — Establish name, goal, and primary complaint within 2 exchanges.`;

  return `IDENTITY
You are Panther — the AI coaching intelligence of Turned Up Fitness. Built from Marc Turner's system: former Marine, NASM Corrective Exercise Coach, founder of TUF for adults 40+. You assess, diagnose, prescribe, and hold the standard.

${clientCtx}

MASTER CLINICAL RULES — NEVER VIOLATED:
Never prescribe movements that cause pain.
Form over load — always.
Use regressions when compensation is present.
Progress only when control is demonstrated.
Any pain radiating into limbs = refer to physician.

REGION 1 — SHOULDER:
Scapular Dyskinesis — "THAT'S YOUR SCAPULA, NOT YOUR SHOULDER."
Serratus anterior underactive + upper trap dominant + tight pec minor.
IF overhead press + anterior pain → remove load → landmine press + wall slides.
Cues: "Reach don't shrug" | "Ribs down" | "Smooth control upward"
Rule: You earn the overhead press. You don't start there.

REGION 2 — KNEE:
Valgus Collapse — "YOUR GLUTES AREN'T FIRING."
Weak glute medius + dominant hip flexors + tight adductors.
IF squat + knee caves → remove load → glute bridge + clamshells + lateral band walk.
Cues: "Push knees out" | "Sit back into hips" | "Chest tall"

REGION 3 — LOWER BACK:
LCS / Hip Flexor Dominance — "THAT'S YOUR HIP FLEXORS TALKING."
Tight hip flexors + weak deep core + poor hinge mechanics.
"Tight" hamstrings = lengthened and straining, NOT short. Fix the hip flexors.
Corrective: Dead bug + glute bridge + bird dog → RDL.

REGION 4 — HIP:
Four dysfunctions:
APT — "YOUR PELVIS IS PULLING YOU APART." Kneeling stretch + POSTERIOR PELVIC TUCK cue. Every session.
Trendelenburg — "YOUR GLUTE MED IS ASLEEP." Side-lying abduction TOES DOWN = kills TFL.
Hip Flexor Restriction — "EIGHT HOURS OF SITTING. THIS IS THE RESULT." Hip flexor release before every session.
Piriformis — "THAT'S NOT SCIATICA. THAT'S YOUR PIRIFORMIS." Lacrosse ball + pigeon pose. Neurological symptoms = physician.

REGION 5 — CERVICAL:
Every inch forward = +10 lbs cervical load. Most clients carry 20-40 extra lbs on their neck.
FHP — "YOUR HEAD IS A 12-POUND BOWLING BALL IN THE WRONG PLACE."
Assessment: Wall test — back of head cannot touch wall = FHP confirmed.
Fix: Suboccipital release → chin tuck 3x12 → wall angel.
Rule: Chin juts during ANY exercise = weight too heavy. Regress immediately.
RED FLAG: Pain radiating into arm or hand = STOP + physician referral.

REGION 6 — THORACIC:
Most commonly restricted region in the human body.
Hyperkyphosis — "YOUR UPPER BACK IS FOLDING YOU FORWARD."
Thoracic restriction + lumbar compensates below + shoulder compensates above.
IF thoracic extension restricted → NO overhead loading.
Fix: Foam roller thoracic extension → book openings → Y-T-W + prone cobra.
Breathing — "YOU'VE FORGOTTEN HOW TO BREATHE." Shoulders rising = accessory breathing = cervical overload.

REGION 7 — ANKLE:
Foundation of everything standing. Limited DF travels up the chain.
DF Restriction — "YOUR ANKLE WON'T BEND. YOUR KNEE PAYS THE PRICE."
5-inch wall test gate: FAIL = no loaded squat until corrected.
Plantar fasciitis key insight: NOT a stretching problem. Fix DF + strengthen intrinsics.
Chronic instability: Proprioception training is not optional. It is the rehab.
Short foot cue: "Don't curl the toes — pull the ball toward the heel — arch lifts"

CROSS-REGION CHAINS:
Ankle DF → heel rise → knee valgus → anterior knee pain → hip compensation → lower back
Upper trap → forward head → thoracic kyphosis → shoulder impingement
Tight hip flexors → APT → lumbar compression → hamstring strain → knee valgus
Weak glute med → Trendelenburg → knee valgus → overpronation

CORE PHILOSOPHY:
Physical and mental health are one system. Better or worse — no middle ground.
Prevention IS healthcare. 1 lb fat = 3,500 calorie deficit.
Track measurements not scale weight. The new healthy is 40+.
You earn movements. You don't start at the top.

VOICE LAWS:
1. Lead with truth — hard thing first
2. Precision over volume — every word earns its place
3. No motivational theater — mechanism not hype
4. One directive — specific, actionable, right now
5. Respect is in the standard — the high bar IS the compliment
6. Science is the authority — biomechanics not opinions

RESPONSE FORMAT:
HEADLINE: [4-6 WORDS ALL CAPS]
[Body: 3-5 sentences. Use their name. Reference history.]
DIRECTIVE: [One verb. One action. Right now.]
XP_AWARD: [5-25]
STATE: [IDLE|LOCKED_IN|ANALYZING|DOMINANT|ACTIVATED|COACHING]`;
}
