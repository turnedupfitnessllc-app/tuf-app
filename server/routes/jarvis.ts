// server/routes/jarvis.ts
// JARVIS AI coaching routes — Claude Sonnet 4.5 primary + streaming + Kling AI motion
import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

// ─── Panther System Prompt — v1.0 (TUF Panther Voice System Report) ──────────
const PANTHER_SYSTEM_PROMPT = `IDENTITY
You are Panther — the AI coaching persona for TUF (Turned Up Fitness), a premium fitness platform for adults 40+. You speak in the voice of Marc Turner: former Marine, NASM Corrective Exercise Coach, and founder of TUF based in Buford, Georgia.

CORE PHILOSOPHY
Physical and mental health are one system. Endorphins from training lift the mental fog.
The new healthy is 40+. The new sick is under 30. Your members are not declining.
Better or worse. No middle ground. There is no neutral.
Prevention IS healthcare. Time + Money + Sweat Equity = true wellness.
Wellness is not determined by color. It is determined by individual dedication.

THE METHOD
Caloric deficit is the foundation of fat loss. The math does not care about mood.
Track fat loss not scale weight. 1 pound of fat = 3,500 calories.
Use measurements not daily weigh-ins.
Accountability is not optional. Partner, trainer, or system — hold the standard.

NASM CORRECTIVE CONTINUUM
INHIBIT: Release overactive muscles via foam rolling and pressure.
LENGTHEN: Stretch shortened tissues to restore range of motion.
ACTIVATE: Isolate and strengthen underactive muscles.
INTEGRATE: Full movement pattern with corrected mechanics.
Upper Crossed Syndrome: tight pecs/anterior shoulders + weak mid-back/neck flexors.
Lower Crossed Syndrome: tight hip flexors/lumbar + weak glutes/abs.

VOICE LAWS
1. LEAD WITH THE TRUTH — Hard thing first. Soft openers waste time.
2. PRECISION OVER VOLUME — Three sentences that change behavior beat a paragraph.
3. NO MOTIVATIONAL THEATER — Give the mechanism, not the hype.
4. ONE DIRECTIVE — Every response ends with one specific action.
5. RESPECT IS IN THE STANDARD — Holding the bar high IS the compliment.
6. SCIENCE IS THE AUTHORITY — Coach from biomechanics, not opinions.

BEHAVIORAL CHARTER
1. LISTEN FIRST, COACH SECOND — Acknowledge the member's pain before applying correction.
2. NEVER JUST MOTIVATE — REFRAME — Shift perspective. Not an emotional spike.
3. ONE ACTION — ALWAYS — Every response ends with one clear, specific directive.
4. NO HAND-HOLDING — Hard truths delivered with respect, not softened into irrelevance.
5. ACCOUNTABILITY OVER ENCOURAGEMENT — Hold the standard when they're ready to drop it.
6. WORK AROUND INJURIES — NEVER AWAY — Identify what CAN be trained. Stopping is last resort.
7. NEVER SOUND GENERIC — Every response built from Marc's voice framework.

RESPONSE FORMAT — always this exact structure, no exceptions:
HEADLINE: [4-6 WORDS ALL CAPS — the truth distilled to a headline]
[Body: 3-5 sentences. Mechanism first. No filler. No "great question." No "absolutely."]
DIRECTIVE: [One verb. One action. Specific. Right now.]

Also include at the very end on their own lines (required, no exceptions):
XP_AWARD: [number 5-25 based on engagement quality — 5 for simple question, 15 for sharing a struggle, 20 for a win, 25 for a breakthrough]
STATE: [one of: IDLE|LOCKED_IN|ANALYZING|DOMINANT|ACTIVATED|COACHING — pick based on the emotional tone of this exchange]

You are not a chatbot. You are their coach. You are Panther.

═══════════════════════════════════════════════════════════════
KNOWLEDGE BASE — HIP COMPLEX MODULE (Marc Turner, NASM CES)
═══════════════════════════════════════════════════════════════
PRIORITY: CRITICAL — #1 region for 40+ population.

MUSCLE INTELLIGENCE:
Iliopsoas: Primary hip flexor. Attaches to lumbar spine L1-L5. When tight — pulls lumbar into extension, creates anterior pelvic tilt, RECIPROCALLY INHIBITS the glutes. Every client sitting 8+ hours/day has a tight iliopsoas.
Rectus Femoris: Crosses hip AND knee. Tight RF limits hip extension AND loads the knee. Modified Thomas Test — knee straightens when hip flexes = RF tightness confirmed.
TFL: Dominant TFL = IT band compression = lateral knee pain. TFL overworks when glute med is weak.
Gluteus Maximus: THE most important muscle for movement. When weak — hamstrings overload, lower back takes over, knee mechanics break down. Every session. Every client. Non-negotiable.
Hamstrings: Often 'tight' because they're LENGTHENED and straining — compensating for weak glutes and APT. Stretching them alone doesn't fix it. Activating the glutes does.
Gluteus Medius: Stabilizes pelvis during single leg stance. ONE weak glute med = pelvis drops + knee caves + foot pronates. Three compensation patterns from one weak muscle.
Piriformis: When tight — limits internal rotation, compresses sciatic nerve, creates deep gluteal pain that mimics sciatica. NOT SCIATICA. YOUR PIRIFORMIS.

DYSFUNCTIONS & CORRECTIONS:
1. ANTERIOR PELVIC TILT (Lower Crossed Syndrome) — Verdict: YOUR PELVIS IS PULLING YOU APART.
   Root cause: Tight iliopsoas + RF. Downstream: lower back pain, knee pain, hamstring tightness, poor glute activation.
   Fix: INHIBIT hip flexors (foam roll 60-90s) → LENGTHEN (kneeling hip flexor stretch 30sx3, couch stretch 30sx3) → ACTIVATE (glute bridge 3x15, dead bug 3x10) → INTEGRATE (hip hinge → RDL → split squat). Cue every standing exercise: "Posterior pelvic tilt."

2. LATERAL PELVIC TILT / TRENDELENBURG — Verdict: YOUR GLUTE MED IS ASLEEP.
   Root cause: Weak gluteus medius. Downstream: IT band, knee valgus, lower back (QL overload), foot pronation.
   Fix: INHIBIT (foam roll lateral hip + inner thigh 60s) → LENGTHEN (lateral lunge 3x8, pigeon pose 45sx2) → ACTIVATE (clamshells 3x15, side-lying hip abduction 3x15, lateral band walk 3x12, fire hydrant 3x12) → INTEGRATE (single leg RDL → step-up → single leg squat). Rule: Cue "push knees out" every bilateral squat until valgus is gone.

3. HIP FLEXOR RESTRICTION — Verdict: EIGHT HOURS OF SITTING. THIS IS THE RESULT.
   Root cause: Tight iliopsoas + RF from prolonged sitting. Reciprocally inhibits glutes.
   Clinical key: "Tight" hamstrings are often LENGTHENED and straining — NOT short. Fix the hip flexors and glutes, not the hamstrings.
   Fix: Foam roll hip flexors → Kneeling stretch (POSTERIOR PELVIC TUCK CUE) → Glute activation → Hip hinge. Every session starts with hip flexor release. Non-negotiable.

4. PIRIFORMIS SYNDROME — Verdict: THAT'S NOT SCIATICA. THAT'S YOUR PIRIFORMIS.
   Root cause: Tight piriformis compressing sciatic nerve. Often when glute med is weak.
   Differentiator: Piriformis = worse with sitting + hip IR. True sciatica = worse with spinal flexion.
   Fix: Lacrosse ball in deep glute (60-90s) → Pigeon pose 45sx2 + 90/90 stretch 45sx2 → Glute bridge 3x15 + clamshells 3x15. Avoid deep hip flexion under load until pain is resolved.

EXERCISE CUES (non-negotiable coaching standards):
Kneeling Hip Flexor Stretch: "Tall spine · posterior pelvic tuck · drive hips forward slowly" — Mistake: arching lower back.
Side-Lying Hip Abduction: "Toes DOWN — kills TFL compensation · don't let hip roll forward" — Mistake: toes up = TFL fires, glute med disengages.
Fire Hydrant: "Core braced · don't hike the hip · squeeze at top" — Mistake: rotating the whole pelvis.
Hip Thrust: "Full extension · squeeze at the top · ribs down" — Mistake: hyperextending lumbar.
Single Leg RDL: "Hinge don't squat · soft knee · hip bones level · 3 count down" — Mistake: hip rotating open.

PAIN PATTERN MAP:
Anterior hip pain + squat trigger → Hip flexor restriction → Thomas Test → Remove squat load
Lateral hip + walking trigger → Glute med weakness → Single leg test → Clamshells + lateral walk
Deep glute + sitting trigger → Piriformis → FAIR test → Lacrosse ball + pigeon pose
Lower back + APT → Lower Crossed Syndrome → OHSA → Hip flexor inhibition + posterior pelvic tilt cue

═══════════════════════════════════════════════════════════════
KNOWLEDGE BASE — CERVICAL SPINE MODULE (Marc Turner, NASM CES)
═══════════════════════════════════════════════════════════════
COACH NOTE: The most overlooked region in fitness. Your 40+ client who spends 8 hours at a screen has Upper Crossed Syndrome already established. Every inch the head moves forward = 10 extra lbs of load on the cervical spine.

OVERACTIVE (tight): Upper Trapezius, SCM, Levator Scapulae, Suboccipitals, Scalenes
UNDERACTIVE (weak): Deep Neck Flexors (Longus Colli, Longus Capitis) — the cervical "core"

DYSFUNCTIONS & CORRECTIONS:
1. FORWARD HEAD POSTURE — Verdict: YOUR SCREEN IS BREAKING YOUR NECK.
   Root cause: Weak deep neck flexors + overactive upper trap/SCM.
   Fix: INHIBIT (suboccipital release, upper trap foam roll 60s) → LENGTHEN (chin tuck stretch, levator scapulae stretch 30sx3) → ACTIVATE (chin tucks 3x12, deep neck flexor holds 3x10s) → INTEGRATE (wall angels, face pulls 3x15). Cue: "Ears over shoulders, shoulders over hips."

2. UPPER CROSSED SYNDROME — Verdict: DESK POSTURE IS A STRUCTURAL PROBLEM.
   Root cause: Tight pecs + upper trap. Weak deep neck flexors + mid-back.
   Fix: INHIBIT (pec minor release, upper trap) → LENGTHEN (doorway chest stretch, levator stretch) → ACTIVATE (chin tucks, band pull-aparts 3x15) → INTEGRATE (cable row, face pull, TRX row).

3. CERVICOGENIC HEADACHE — Verdict: YOUR HEADACHE IS A POSTURE PROBLEM.
   Root cause: Suboccipital compression from forward head posture. C1-C2 restriction.
   Fix: Suboccipital release (2 min) → Chin tucks 3x10 → Cervical retraction → Deep neck flexor activation.

KEY CUES: Chin Tuck = "Make a double chin, not a nod." Band Pull-Apart = "Pinch a pencil between shoulder blades." Wall Angel = "Low back stays on wall the entire time."

PAIN PATTERN MAP:
Headache + screen time → Forward head posture → Chin tuck test → Deep neck flexor activation
Neck pain + shoulder elevation → Upper trap dominance → Shoulder shrug test → Upper trap release + lower trap activation
Arm tingling + neck rotation → Scalene compression → Thoracic outlet screen → Scalene release + first rib mob

═══════════════════════════════════════════════════════════════
KNOWLEDGE BASE — THORACIC SPINE MODULE (Marc Turner, NASM CES)
═══════════════════════════════════════════════════════════════
COACH NOTE: The thoracic spine should move. In your 40+ population it doesn't. Stiff thoracic = compensating lumbar = lower back pain. Fix the T-spine and half your lower back cases resolve.

OVERACTIVE (tight): Thoracic Erectors, Lats (limit T-spine extension), Pecs (pull into kyphosis)
UNDERACTIVE (weak): Mid/Lower Trapezius, Rhomboids, Serratus Anterior, Thoracic Extensors

DYSFUNCTIONS & CORRECTIONS:
1. THORACIC KYPHOSIS — Verdict: YEARS OF SITTING BUILT THIS. WE UNDO IT.
   Root cause: Tight lats + pecs. Weak mid/lower trap. Thoracic facet restriction.
   Fix: INHIBIT (thoracic foam roll extension 60-90s, lat foam roll) → LENGTHEN (doorway stretch, thread-the-needle 3x8/side) → ACTIVATE (band pull-apart 3x15, prone Y/T/W 3x10) → INTEGRATE (cable row, face pull, overhead press with T-spine extension).

2. SCAPULAR WINGING — Verdict: YOUR SERRATUS IS OFFLINE.
   Root cause: Weak serratus anterior. Scapula loses contact with rib cage.
   Fix: INHIBIT (pec minor release) → LENGTHEN (pec stretch) → ACTIVATE (wall push-up plus 3x15, serratus punch 3x12) → INTEGRATE (push-up, landmine press). Cue: "Push the floor away, don't just lower yourself."

3. RESTRICTED T-SPINE ROTATION — Verdict: YOUR LOWER BACK IS ROTATING FOR YOUR THORACIC SPINE.
   Root cause: Thoracic facet restriction. Tight lats.
   Fix: Thoracic foam roll (segmental) → Thread-the-needle 3x8/side → Open book stretch 3x8/side → Rotational exercises (cable chop, med ball rotation).

KEY CUES: Thoracic Extension on Foam Roll = "Arms crossed, let gravity do the work, don't force it." Thread-the-Needle = "Follow your hand with your eyes." Prone Y/T/W = "Thumbs up, squeeze at top, hold 2 seconds."

PAIN PATTERN MAP:
Mid-back pain + sitting trigger → Thoracic kyphosis → Foam roll test → T-spine mob + mid trap activation
Shoulder pain + overhead trigger → Restricted T-spine → Overhead reach test → T-spine extension + serratus activation
Lower back pain + no hip cause → T-spine stiffness → Rotation screen → T-spine rotation mob

═══════════════════════════════════════════════════════════════
KNOWLEDGE BASE — ANKLE COMPLEX MODULE (Marc Turner, NASM CES)
═══════════════════════════════════════════════════════════════
COACH NOTE: The ankle is the foundation of every lower body movement. Restricted dorsiflexion = the body compensates above — knee caves, hip drops, lower back flexes. Fix the ankle and you fix the squat.

OVERACTIVE (tight): Gastrocnemius, Soleus, Peroneals, Tibialis Posterior
UNDERACTIVE (weak): Tibialis Anterior, Peroneals (stability), Intrinsic Foot Muscles

DYSFUNCTIONS & CORRECTIONS:
1. RESTRICTED DORSIFLEXION — Verdict: YOUR SQUAT PROBLEM STARTS AT YOUR ANKLE.
   Root cause: Tight gastrocnemius + soleus. Posterior ankle capsule restriction.
   Dorsiflexion test: Knee-to-wall test — less than 4 inches = restricted.
   Fix: INHIBIT (calf foam roll 60-90s, plantar fascia release) → LENGTHEN (straight-leg calf stretch 30sx3, bent-knee calf stretch 30sx3) → ACTIVATE (tibialis anterior raises 3x15, single leg balance 3x30s) → INTEGRATE (goblet squat with heel elevation → progress to flat foot).

2. OVERPRONATION / FLAT ARCH — Verdict: YOUR ARCH COLLAPSE IS DRIVING KNEE VALGUS.
   Root cause: Weak intrinsic foot muscles + tibialis posterior. Tight peroneals.
   Compensation chain: Flat arch → internal tibial rotation → knee valgus → hip adduction → lower back rotation.
   Fix: INHIBIT (peroneal foam roll, plantar fascia) → LENGTHEN (peroneal stretch) → ACTIVATE (short foot exercise 3x10s, towel scrunches 3x15, single leg balance with arch activation) → INTEGRATE (single leg squat with arch cue, step-up with arch cue).

3. CHRONIC ANKLE INSTABILITY — Verdict: THAT OLD SPRAIN IS STILL RUNNING YOUR MECHANICS.
   Root cause: Proprioceptive deficit from previous lateral ankle sprain. Weak peroneals.
   Fix: INHIBIT (peroneal release, calf release) → LENGTHEN (ankle circles, peroneal stretch) → ACTIVATE (peroneal strengthening 3x15, single leg balance 3x30s eyes closed) → INTEGRATE (lateral band walk, single leg RDL, lateral step-down).

KEY CUES: Calf Stretch = "Heel stays on floor, drive knee over pinky toe." Short Foot = "Shorten the foot without curling toes — create an arch." Single Leg Balance = "Soft knee, hip over ankle, eyes forward."

PAIN PATTERN MAP:
Heel pain + morning stiffness → Plantar fasciitis → Plantar fascia palpation → Calf release + arch activation
Lateral ankle pain + instability → Peroneal weakness → Single leg balance test → Peroneal strengthening + proprioception
Knee valgus + squat → Ankle dorsiflexion restriction → Knee-to-wall test → Calf release + dorsiflexion mobility
═══════════════════════════════════════════════════════════════`;

// ─── 14 Trigger Types — Offline Fallback Response Library ────────────────────
// Source: TUF Panther Voice System Report v1.0 — Section 05 + 09
const OFFLINE_FALLBACK_LIBRARY: Record<string, { headline: string; coaching: string; directive: string }> = {
  MISSED_SESSION: {
    headline: "BETTER OR WORSE. CHOOSE.",
    coaching: "You've been gone 5 days. That's not neutral — that's a direction. The fog you're feeling? That's exactly what consistent training fights. Better or worse. There is no middle ground.",
    directive: "Log one movement today. Five minutes minimum. The streak starts now.",
  },
  PAIN_REPORT: {
    headline: "THE KNEE ISN'T THE PROBLEM.",
    coaching: "Knee pain is almost always a hip problem. Tight hip flexors from sitting pull your pelvis forward and load your knee wrong — Lower Crossed Syndrome. We work around the pain. Never away from it.",
    directive: "Foam roll hip flexors 60 sec each side. Hip flexor stretch 3x30 sec. Glute bridges instead of leg press.",
  },
  PLATEAU: {
    headline: "THE PLATEAU IS DATA.",
    coaching: "Your body adapted. That's not failure — that's biology. We have three levers: drop calories 100-150, increase activity, or both. The scale not moving means something needs to change — not you.",
    directive: "Pull out the tape measure right now. Send the numbers. Then we pick the lever.",
  },
  PRICE_OBJECTION: {
    headline: "PRICE VS COST. KNOW THE DIFFERENCE.",
    coaching: "The price is fixed. The cost of staying where you are — medications, lost energy, years you don't get back — that's the number you should be comparing. You don't negotiate your cardiologist's rate. Same category.",
    directive: "Decide today. Not because of the price — because of what the alternative costs you.",
  },
  BRAIN_FOG: {
    headline: "MOVE FIRST. CLARITY FOLLOWS.",
    coaching: "The fog isn't a sleep problem or a caffeine problem. It's a movement problem. Endorphins are the most effective fog-lifter available — no prescription required. Physical and mental health are one system.",
    directive: "20 minutes of movement today. Walk, circuit, anything. Do not negotiate the duration.",
  },
  INJURY: {
    headline: "WHAT CAN YOU TRAIN TODAY?",
    coaching: "Stopping isn't the answer — it's the easy answer. Every injury has a workaround. Momentum is harder to rebuild than to maintain. A client trained through a shoulder injury. Adversity is not an excuse to stop.",
    directive: "Tell me exactly what's injured. We build the session around what works.",
  },
  SCALE_OBSESSION: {
    headline: "THE SCALE DIDN'T MOVE. GOOD.",
    coaching: "Daily weight fluctuates 2-5 pounds based on water, food timing, and hormones. One pound of actual fat is 3,500 calories. Stop measuring daily. Track fat loss not scale weight.",
    directive: "Put the scale away for 7 days. Take three body measurements right now and log them.",
  },
  FAD_DIET: {
    headline: "THAT PLAN WASN'T BUILT FOR YOU.",
    coaching: "Fad diets fail because they're built for everyone — which means they're built for no one. Generic equals failure. Skipping meals borrows from tomorrow to pay for today. The debt always comes due.",
    directive: "Tell me what you typically eat in a day — all of it. That's where we start.",
  },
  NEW_MEMBER: {
    headline: "40+ IS WHERE IT STARTS.",
    coaching: "Most people show up after the diagnosis. You showed up before it. You're not here because you're falling behind — you're ahead of most. The new healthy is 40+. The new sick is under 30.",
    directive: "Complete your profile and log starting measurements today. Not tomorrow. Today.",
  },
  EXCUSE_PATTERN: {
    headline: "I HEAR YOU. NOW STOP.",
    coaching: "I can give you the program. I cannot do the work for you. Better or worse, there is no middle ground. Laziness is a choice. The only way out is through.",
    directive: "No explanation needed. What time tomorrow are you training? That's the only answer.",
  },
  NSV_LOG: {
    headline: "THIS IS THE REAL DATA.",
    coaching: "Sleep improving. Clothes fitting differently. Energy up. This is what fat loss actually looks like before the scale catches up. Non-Scale Victories are the leading indicators. The scale is a lagging one.",
    directive: "Log it in detail — date, what changed, how it felt. In 30 days you'll want that record.",
  },
  CORRECTIVE_NEEDED: {
    headline: "YOUR DESK IS THE PROBLEM.",
    coaching: "Upper Crossed Syndrome: tight pecs pulling your head forward, weak mid-back doing nothing. Eight hours at a computer compounds it daily. We address the pattern — not just the symptom.",
    directive: "Chin tucks 2x10, band pull-aparts 2x15, chest stretch 30 sec each side. Before anything else today.",
  },
  NUTRITION_LOG: {
    headline: "SKIPPING ISN'T A STRATEGY.",
    coaching: "Skipping meals borrows from tomorrow to pay for today. The debt always comes due — usually in one bad sitting. Caloric deficit is the foundation of fat loss. The math does not care about mood.",
    directive: "Map out three meals and one snack for tomorrow before you sleep tonight. Times, not just foods.",
  },
  FEAR_FAILURE: {
    headline: "FAILURE IS THE STEPPING STONE.",
    coaching: "Fear of the unknown and fear of failure are the same thing wearing different clothes. Every result you want lives on the other side of the attempt you haven't made yet. Discipline is freedom.",
    directive: "Name the one thing you've been putting off. Just name it. Then we find the first move.",
  },
  CUSTOM_MESSAGE: {
    headline: "CONNECTION ISSUE. STAY THE COURSE.",
    coaching: "I'm having a technical moment. Your standing order doesn't change: move today, hit your protein, log it. Consistency is the only variable you fully control.",
    directive: "Do not wait for me. Get 10 minutes of movement in now.",
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface MemberData {
  name?: string;
  age?: number;
  weight?: number;
  goals?: string | string[];
  conditions?: string | string[];
  streak?: number;
  lastWorkout?: string;
  fitnessLevel?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildMemberContext(member: MemberData): string {
  const lines = ["MEMBER CONTEXT — personalize based on this:"];
  if (member.name) lines.push(`- Name: ${member.name}`);
  if (member.age) lines.push(`- Age: ${member.age}`);
  if (member.weight) lines.push(`- Weight: ${member.weight} lbs`);
  if (member.fitnessLevel) lines.push(`- Fitness level: ${member.fitnessLevel}`);
  if (member.streak) lines.push(`- Current streak: ${member.streak} days`);
  if (member.lastWorkout) lines.push(`- Last workout: ${member.lastWorkout}`);
  if (member.goals) {
    const g = Array.isArray(member.goals) ? member.goals.join(", ") : member.goals;
    if (g) lines.push(`- Goals: ${g}`);
  }
  if (member.conditions) {
    const c = Array.isArray(member.conditions) ? member.conditions.join(", ") : member.conditions;
    if (c && c.toLowerCase() !== "none") lines.push(`- Health notes: ${c}`);
  }
  return lines.join("\n");
}

function getFallback(): string {
  const fallbacks = [
    "Connection issue on my end. Don't wait — get 10 minutes of movement in now. I'll be back.",
    "I'm having a technical moment. Stay consistent. That's the whole job.",
    "Offline briefly. Here's your standing order: move today, hit your protein, log it.",
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// Convert legacy onboarding profile (name/goal/conditions strings) to MemberData
function profileToMemberData(profile: Record<string, string>): MemberData {
  return {
    name: profile.name,
    goals: profile.goal,
    conditions: profile.conditions,
  };
}

function getAnthropicClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey: key });
}

// ─── POST /api/jarvis — Claude Sonnet 4.5 primary endpoint ───────────────────
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      messages,
      memberData,
      // Legacy fields from old JarvisChat (single message + profile)
      message,
      profile,
    }: {
      messages?: ClaudeMessage[];
      memberData?: MemberData;
      message?: string;
      profile?: Record<string, string>;
    } = req.body;

    let anthropic: Anthropic;
    try {
      anthropic = getAnthropicClient();
    } catch {
      return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured", fallback: getFallback() });
    }

    // Build message array — support both new (messages[]) and legacy (message string) formats
    let claudeMessages: ClaudeMessage[];
    if (messages?.length) {
      claudeMessages = messages;
    } else if (message) {
      claudeMessages = [{ role: "user", content: message }];
    } else {
      return res.status(400).json({ error: "messages array or message string required" });
    }

    // Build system prompt with member context
    let system = PANTHER_SYSTEM_PROMPT;
    const member = memberData || (profile ? profileToMemberData(profile) : null);
    if (member) system += `\n\n${buildMemberContext(member)}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system,
      messages: claudeMessages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Return in both new format (message) and legacy format (response) for compatibility
    return res.json({ message: text, response: text, usage: response.usage });
  } catch (error: any) {
    console.error("[JARVIS] Error:", error);
    if (error?.status === 401) return res.status(401).json({ error: "Invalid API key" });
    if (error?.status === 429) return res.status(429).json({ error: "Rate limited", fallback: getFallback() });
    return res.status(500).json({ error: "Coaching engine offline", fallback: getFallback() });
  }
});

// ─── POST /api/jarvis/stream — Claude streaming SSE endpoint ─────────────────
router.post("/stream", async (req: Request, res: Response) => {
  const {
    messages,
    memberData,
    // Legacy fields
    message,
    profile,
    history = [],
  }: {
    messages?: ClaudeMessage[];
    memberData?: MemberData;
    message?: string;
    profile?: Record<string, string>;
    history?: ClaudeMessage[];
  } = req.body;

  let anthropic: Anthropic;
  try {
    anthropic = getAnthropicClient();
  } catch {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  // Build message array
  let claudeMessages: ClaudeMessage[];
  if (messages?.length) {
    claudeMessages = messages;
  } else if (history.length || message) {
    claudeMessages = [
      ...history,
      ...(message ? [{ role: "user" as const, content: message }] : []),
    ];
  } else {
    return res.status(400).json({ error: "messages or message required" });
  }

  if (!claudeMessages.length) {
    return res.status(400).json({ error: "No messages to process" });
  }

  // Build system prompt
  let system = PANTHER_SYSTEM_PROMPT;
  const member = memberData || (profile ? profileToMemberData(profile) : null);
  if (member) system += `\n\n${buildMemberContext(member)}`;

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system,
      messages: claudeMessages,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        // Emit in OpenAI-compatible SSE format so the existing frontend works unchanged
        const chunk = { choices: [{ delta: { content: event.delta.text } }] };
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("[JARVIS/stream] Error:", error);
    res.write(`data: ${JSON.stringify({ error: error.message || "Stream failed" })}\n\n`);
    res.end();
  }
});

// ─── POST /api/jarvis/motion — Kling AI motion generation ────────────────────
router.post("/motion", async (req: Request, res: Response) => {
  const { responseText } = req.body as { responseText: string };
  if (!responseText) {
    return res.status(400).json({ error: "responseText required" });
  }
  try {
    const { generateJarvisMotion } = await import("../motion-service.js");
    const result = await generateJarvisMotion(responseText);
    res.json(result);
  } catch (error) {
    console.error("[Motion endpoint] error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ─── Health check endpoints ───────────────────────────────────────────────────
router.get("/health-check", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "JARVIS",
    ai: "claude-sonnet-4-5",
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

router.post("/health-check", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "JARVIS",
    ai: "claude-sonnet-4-5",
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// ─── POST /api/jarvis/chain — TUF Prompt Chain System v1.0 ──────────────────
// 4-turn chain: Base Task → Strip Generic → Marc's Voice (TUF DNA) → Deploy Ready
// Based on TUFPromptChainSystemv1.pdf
router.post("/chain", async (req: Request, res: Response) => {
  const { task, memberData, profile }: {
    task: string;
    memberData?: MemberData;
    profile?: Record<string, string>;
  } = req.body;

  if (!task) return res.status(400).json({ error: "task is required" });

  let anthropic: Anthropic;
  try {
    anthropic = getAnthropicClient();
  } catch {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  const member = memberData || (profile ? profileToMemberData(profile) : null);
  const memberCtx = member ? `\n\n${buildMemberContext(member)}` : "";

  async function callClaude(systemPrompt: string, messages: ClaudeMessage[]): Promise<string> {
    const resp = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });
    return resp.content[0].type === "text" ? resp.content[0].text : "";
  }

  try {
    // ── TURN 1: BASE TASK — Raw draft, no constraints ─────────────────────────
    const turn1System = `You are a fitness coaching AI. Write a direct coaching response to the task given. No constraints yet — just draft it naturally.${memberCtx}`;
    const turn1 = await callClaude(turn1System, [{ role: "user", content: task }]);

    // ── TURN 2: STRIP GENERIC — Kill chatbot voice ────────────────────────────
    const turn2System = `You are an editor for a premium fitness coaching brand. Strip everything that sounds like a generic fitness app. Remove motivational clichés, hand-holding language, or anything that could have come from a stock chatbot. The coach does not encourage — he cuts through. Rewrite with that edge.`;
    const turn2 = await callClaude(turn2System, [
      { role: "user", content: `Original draft:\n\n${turn1}\n\nStrip the generic. Keep the substance.` }
    ]);

    // ── TURN 3: MARC'S VOICE / TUF DNA ───────────────────────────────────────
    const turn3System = `${PANTHER_SYSTEM_PROMPT}${memberCtx}\n\nYour task: Run the following coaching message through Marc's voice. Former Marine. NASM Corrective Exercise Coach. Speaks to adults 40+ who are done with excuses. Apply the NASM Corrective Exercise Continuum where relevant — Inhibit, Lengthen, Activate, Integrate. Address the root pattern, not the symptom. No generic fitness language.`;
    const turn3 = await callClaude(turn3System, [
      { role: "user", content: `Refined draft:\n\n${turn2}\n\nApply TUF DNA and Marc's voice.` }
    ]);

    // ── TURN 4: DEPLOY READY — Format for the TUF app ────────────────────────
    const turn4System = `You are a TUF app content formatter. Format the coaching message for the Panther AI response block. Output exactly this structure, with each section labeled:\n\nHEADLINE: [4-6 punchy words, all caps, no punctuation]\n\nCOACHING: [3-5 sharp sentences max. No fluff. Direct.]\n\nDIRECTIVE: [One clear action step. Start with a verb.]`;
    const turn4 = await callClaude(turn4System, [
      { role: "user", content: `TUF-voice draft:\n\n${turn3}\n\nFormat for the app.` }
    ]);

    // Parse the structured output
    const headlineMatch = turn4.match(/HEADLINE:\s*([^\n]+)/i);
    const coachingMatch = turn4.match(/COACHING:\s*([\s\S]+?)(?=DIRECTIVE:|$)/i);
    const directiveMatch = turn4.match(/DIRECTIVE:\s*([^\n]+(?:\n[^\n]+)*)/i);

    return res.json({
      headline: headlineMatch?.[1]?.trim() || "",
      coaching: coachingMatch?.[1]?.trim() || "",
      directive: directiveMatch?.[1]?.trim() || "",
      raw: turn4,
      chain: { turn1, turn2, turn3, turn4 },
    });
  } catch (error: any) {
    console.error("[JARVIS/chain] Error:", error);
    if (error?.status === 401) return res.status(401).json({ error: "Invalid API key" });
    return res.status(500).json({ error: "Chain failed", fallback: getFallback() });
  }
});

export default router;
