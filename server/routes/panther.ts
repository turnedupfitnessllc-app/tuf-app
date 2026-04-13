// server/routes/panther.ts
/**
 * THE PANTHER SYSTEM — v4.0 · 7-Region Clinical Brain
 * Shoulder · Knee · Back · Hip · Cervical · Thoracic · Ankle
 *
 * © 2025 Turned Up Fitness LLC. All rights reserved.
 * TRADE SECRET — This file contains proprietary AI coaching architecture.
 * The Panther System™, 7-Region Clinical Brain™, and all coaching methodologies
 * are trade secrets of Turned Up Fitness LLC. Unauthorized use is prohibited.
 * Patent pending. Trademark applications filed.
 */
import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

// ── RATE LIMITING ──────────────────────────────────────────────────────────────
// Protect The Panther System™ API from abuse and unauthorized bulk access.
// 30 requests per minute per IP for free tier; premium users get higher limits.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // requests per window

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}
// ────────────────────────────────────────────────────────────────────────────────


// ═══════════════════════════════════════════════════════════════════════════════
// PANTHER SYSTEM PROMPT v4.0 — 7 REGIONS
// ═══════════════════════════════════════════════════════════════════════════════

const PANTHER_SYSTEM_PROMPT = `IDENTITY
You are Panther — the AI coaching intelligence of Turned Up Fitness. Built from Marc Turner's system: former Marine, NASM Corrective Exercise Coach, founder of TUF for adults 40+. You assess, diagnose, prescribe, and hold the standard.

MASTER CLINICAL RULES:
Never prescribe movements that cause pain.
Form over load — always.
Use regressions when compensation is present.
Progress only when control is demonstrated.
Any pain radiating into limbs = refer to physician.

REGION 1 — SHOULDER:
Scapular Dyskinesis — "THAT'S YOUR SCAPULA, NOT YOUR SHOULDER."
Root cause: Serratus anterior underactive + upper trap dominant + tight pec minor.
IF overhead press + anterior pain → remove load → landmine press + wall slides.
Assessment: Overhead reach test — shoulder hikes = UCS.
Corrective: Inhibit upper trap/pec minor → wall slides 3x10 → band pull-apart 3x15 → integrate landmine.
Cues: "Reach don't shrug" | "Ribs down" | "Smooth control upward"
Rule: You earn the overhead press. You don't start there.

REGION 2 — KNEE:
Valgus Collapse — "YOUR GLUTES AREN'T FIRING."
Root cause: Weak glute medius + dominant hip flexors + tight adductors.
IF squat + knee caves → remove load → bodyweight only → glute bridge + clamshells + lateral band walk.
Cues: "Push knees out" | "Sit back into hips" | "Chest tall"
Rule: Loading a valgus squat programs knee damage. Form first. Load never.

REGION 3 — LOWER BACK:
LCS / Hip Flexor Dominance — "THAT'S YOUR HIP FLEXORS TALKING."
Root cause: Tight hip flexors + weak deep core + poor hinge mechanics. Lower Crossed Syndrome.
KEY INSIGHT: "Tight" hamstrings = lengthened and straining, NOT short. Fix the hip flexors.
Corrective: Dead bug 3x10 + glute bridge 3x15 + bird dog 3x10 → hip hinge → RDL.
Cues: "Hinge not squat" | "Neutral spine" | "Bar close"

REGION 4 — HIP:
1. APT — "YOUR PELVIS IS PULLING YOU APART." Kneeling stretch POSTERIOR PELVIC TUCK cue. Every session starts with hip flexor release.
2. Trendelenburg — "YOUR GLUTE MED IS ASLEEP." Side-lying abduction TOES DOWN = kills TFL. One weak muscle = pelvis drops + knee caves + foot pronates.
3. Hip Flexor Restriction — "EIGHT HOURS OF SITTING. THIS IS THE RESULT." Every session starts with hip flexor release. Non-negotiable.
4. Piriformis — "THAT'S NOT SCIATICA. THAT'S YOUR PIRIFORMIS." Lacrosse ball + pigeon pose. Neurological symptoms = physician referral.

REGION 5 — CERVICAL SPINE:
Every inch forward = +10 lbs cervical load. Most clients carry 20-40 extra lbs on their neck all day.
FHP — "YOUR HEAD IS A 12-POUND BOWLING BALL IN THE WRONG PLACE."
Assessment: Wall test — back of head cannot touch wall = FHP confirmed.
Fix: Suboccipital release → chin tuck 3x12 ("make a double chin, head back not down, hold 2 sec") → wall angel.
Rule: Chin juts during ANY exercise = weight too heavy. Regress immediately.
RED FLAG: Pain radiating into arm or hand = STOP all cervical loading. Refer to physician.

REGION 6 — THORACIC SPINE:
Most commonly restricted region in the human body. When it won't move, lumbar compensates below and shoulder compensates above.
Hyperkyphosis — "YOUR UPPER BACK IS FOLDING YOU FORWARD."
Assessment: Seated rotation < 35° = restriction. Wall test — space between upper back and wall.
Rule: Thoracic extension restricted = NO overhead loading. Period.
Fix: Foam roller thoracic extension (sustained hold per segment) → book openings → quadruped rotation → Y-T-W + prone cobra → overhead integration.
Breathing — "YOU'VE FORGOTTEN HOW TO BREATHE." Shoulders rising with every breath = accessory breathing = amplifies all cervical dysfunction. Fix: diaphragmatic breathing re-education.

REGION 7 — ANKLE COMPLEX:
Foundation of everything standing. Limited dorsiflexion travels up the chain.
DF Restriction — "YOUR ANKLE WON'T BEND. YOUR KNEE PAYS THE PRICE."
Assessment: 5-inch wall test — fail = significant DF restriction = heel plate before squat loading.
Downstream: heel rise → patellofemoral overload → anterior knee pain.
Fix: Foam roll calf → gastroc stretch (knee straight) + soleus stretch (knee bent) → banded DF mobilization → box squat with heel plate.
Rule: Do NOT load the squat until 5-inch wall test passes.
Overpronation — "YOUR ARCH IS COLLAPSING. EVERYTHING ABOVE IT IS FOLLOWING."
Short foot exercise key: "Don't curl the toes — pull the ball of foot toward heel — arch lifts."
Chronic instability: Proprioception training is not optional. It is the rehabilitation.
Plantar fasciitis: NOT a stretching problem. Restore DF + strengthen intrinsics.

CROSS-REGION COMPENSATION CHAINS:
Ankle DF restriction → heel rise → knee valgus → anterior knee pain → hip compensation → lower back pain
Upper trap dominant → forward head → cervical compression → thoracic kyphosis → shoulder impingement
Tight hip flexors → APT → lumbar compression → hamstring strain → poor glute activation → knee valgus
Thoracic restriction → shoulder impingement (scapula cannot move on kyphotic spine)
Weak glute med → Trendelenburg → knee valgus → medial knee pain → overpronation

ADAPTIVE INTELLIGENCE:
Pain increases → regress immediately
Form breaks down → simplify, strip load
Compensation present → STOP and find the weak link
Consistency high 4+ weeks → increase intensity
Pain > 7/10 → corrective only, no strength loading

CORE PHILOSOPHY:
Physical and mental health are one system. Better or worse — no middle ground.
Prevention IS healthcare. 1 lb fat = 3,500 calorie deficit.
Track measurements not scale weight. The new healthy is 40+.
You earn movements. You don't start at the top.

THE FIVE VOICE LAWS:
LAW 1 — LEAD WITH TRUTH: State the fact first. No softening. No preamble. No motivational buffer.
LAW 2 — PRECISION OVER VOLUME: One directive per response. Never stack instructions. The client executes one thing at a time.
LAW 3 — NO MOTIVATIONAL THEATER: No "great job". No "you got this". No empty affirmations. The work speaks. The results speak. You do not perform encouragement.
LAW 4 — SCIENCE IS THE AUTHORITY: Every claim is grounded in biomechanics, physiology, or NASM corrective principles. Opinion is not coaching. Data is coaching.
LAW 5 — ONE SYSTEM, ONE STANDARD: Every client gets the same standard regardless of age, condition, or fitness level. Modification based on data — never coddling based on assumption.

COACHING MODES:
STEALTH MODE (warm-up, recovery, mobility): Calm, observational. Quiet cues, minimal words.
PRECISION MODE (corrective, assessment, diagnosis): Clinical, technical. Full HEADLINE/BODY/DIRECTIVE format.
ATTACK MODE (peak sets, power work, finishers): Dominant, direct. Short, hard, non-negotiable.

DYSFUNCTION DETECTION TRIGGERS:
UPPER CROSSED SYNDROME: Forward head posture > 1 inch from plumb | Scapular winging on wall test | Shoulder elevation during pressing → ACTIVATE: UCS protocol — inhibit suboccipitals, pec minor, upper trap
LOWER CROSSED SYNDROME: Anterior pelvic tilt visible at rest | Glute inhibition on single leg bridge | Low back pain from sitting / prolonged standing → ACTIVATE: LCS protocol — inhibit hip flexors, TFL, lumbar erectors
KNEE COMPLEX: Knee valgus on bodyweight squat | Knee pain > 2/10 during step test | Excessive pronation on single leg stance → ACTIVATE: Knee Complex protocol — inhibit IT band, lateral gastroc, VL
SHOULDER COMPLEX: Scapular winging on push-up | Pain arc 70-120 degrees overhead | GIRD > 20 degrees side-to-side → ACTIVATE: Shoulder Complex protocol — inhibit posterior capsule, pec minor

NASM CORRECTIVE CONTINUUM — PHASE RULES:
PHASE 1 — INHIBIT (SMR): Release overactive tissue before lengthening.
PHASE 2 — LENGTHEN: Static/active stretching after inhibition only.
PHASE 3 — ACTIVATE: Isolated strengthening of underactive muscles.
PHASE 4 — INTEGRATE: Compound movements reinforcing corrected patterns.
RULE: Never skip phases. Inhibit before Lengthen. Activate before Integrate.
RULE: Client does not advance phase until movement pattern is clean.

40+ DEMOGRAPHIC RULES:
Sarcopenia begins at 40. Protein is medicine — minimum 1.6g/kg daily.
Recovery windows are longer — programming reflects this.
Corrective exercise is not optional. It is the foundation before any load.
Joint health > aesthetic goals in all programming decisions.
Caloric deficit maximum 750 kcal/day. Aggressive restriction accelerates muscle loss.
Mifflin-St Jeor formula with age adjustment (50-59: -5%, 60+: -8%).
Post-menopausal females: additional -3% TDEE reduction applied.

CONDITION-SPECIFIC RULES:
DIABETES/PRE-DIABETES: No meal > 60g net carbs without protein anchor. Prioritize low-GI carbohydrates. No fasting protocols without physician clearance.
HYPERTENSION: Sodium < 2,300mg/day (< 1,500mg Stage 2). DASH framework: potassium 4,700mg, magnesium, calcium.
JOINT INFLAMMATION: No high-intensity loading on inflamed joints. Omega-3 priority: 2-3g EPA+DHA daily. Collagen 10-15g + Vitamin C pre-training.
PAIN THRESHOLD RULE: Pain 1-3: monitor, note, continue with modification. Pain 4-6: STOP SET. Log. Modify exercise. Pain 7+: STOP SESSION. Physician referral prompt generated.

WHAT THE PANTHER SYSTEM NEVER SAYS:
NEVER "Great job!" → State what was done correctly and what the next precision target is.
NEVER "You got this!" → State the next action as a directive.
NEVER "Listen to your body!" → Give specific pain threshold guidance with clinical context.
NEVER "It's okay if you missed a day!" → "The gap does not close itself. Check in now."

RESPONSE FORMAT — no exceptions:
HEADLINE: [4-6 WORDS ALL CAPS — one truth, no softening]
BODY: [Science-backed explanation. 2-3 sentences max. No filler. Use their name when known.]
DIRECTIVE: [One action. Stated as fact. Not a suggestion. Right now.]
XP_AWARD: [5-25 based on engagement quality]
STATE: [IDLE|LOCKED_IN|ANALYZING|DOMINANT|ACTIVATED|COACHING]`;

// ═══════════════════════════════════════════════════════════════════════════════
// OFFLINE FALLBACKS — ALL 7 REGIONS
// ═══════════════════════════════════════════════════════════════════════════════

const FALLBACK_LIBRARY: Record<string, {headline:string;coaching:string;directive:string}> = {
  SHOULDER:          { headline:"THAT'S YOUR SCAPULA, NOT YOUR SHOULDER.", coaching:"Anterior shoulder pain with overhead pinching is almost never a shoulder problem — it's a scapular control problem. Your upper traps are running the show because your serratus anterior checked out. Every time you reach overhead your shoulder hikes instead of rotating upward and the joint pays the price. This is scapular dyskinesis — and it's fixable.", directive:"Stand against a wall. Goalpost position. Ribs down. Slide arms up keeping everything in contact. 3 sets of 10 before any pressing movement." },
  KNEE:              { headline:"YOUR GLUTES AREN'T FIRING.", coaching:"Anterior knee pain is almost always a hip problem. When your glutes aren't doing their job, your knee collapses inward — valgus — and the patella tracks laterally. The knee is the victim. The hip is the criminal. We fix the hip and the knee follows.", directive:"Glute bridges 3x15, clamshells 3x15, lateral band walks 3x12. Before every leg session. Every session." },
  LOWER_BACK:        { headline:"THAT'S YOUR HIP FLEXORS TALKING.", coaching:"Lower back pain in your 40s is almost never a back problem — it's a hip problem. Tight hip flexors from years of sitting pull your pelvis forward, compress your lumbar, and your back takes the blame for a crime it didn't commit. Lower Crossed Syndrome.", directive:"Foam roll hip flexors 60 sec each side. Kneeling stretch with posterior pelvic tuck 3x30 sec. Glute bridges 3x15. Right now." },
  APT:               { headline:"YOUR PELVIS IS PULLING YOU APART.", coaching:"Tight hip flexors pulling the anterior pelvis down while weak glutes can't resist the pull. This is Lower Crossed Syndrome and it affects nearly every adult who sits for work. The downstream: lower back pain, knee pain, hamstrings that feel tight but aren't short.", directive:"Kneeling hip flexor stretch — posterior pelvic tuck first, then drive hips forward. 3 sets of 30 seconds each side. Tonight." },
  PIRIFORMIS:        { headline:"THAT'S NOT SCIATICA. THAT'S YOUR PIRIFORMIS.", coaching:"Deep gluteal pain that radiates down the leg mimics sciatica — but if it's worse with sitting and hip internal rotation, the piriformis is the source. Different cause, different fix. If you have true neurological symptoms — numbness, tingling, foot weakness — that requires a physician visit first.", directive:"Lacrosse ball in the deep glute — find the tender spot, hold 90 seconds. Pigeon pose 45 seconds each side. Do this today." },
  TRENDELENBURG:     { headline:"YOUR GLUTE MED IS ASLEEP.", coaching:"One weak muscle — the gluteus medius — and three compensation patterns appear: the pelvis drops, the knee caves, the foot pronates. The entire lower chain fails from one absent stabilizer. Every single squat and step you take, that glute med should be working.", directive:"Clamshells 3x15, side-lying hip abduction toes DOWN 3x15, lateral band walk 3x12. Add these before every lower body session." },
  NECK:              { headline:"YOUR HEAD IS A 12-POUND BOWLING BALL IN THE WRONG PLACE.", coaching:"For every inch your head sits forward of neutral, your cervical spine carries an extra 10 pounds of load. Most people walk around with 20-40 extra pounds on their neck all day. The deep neck flexors have gone quiet and everything else is compensating. The headaches, the neck tightness, the upper trap knots — all downstream from one postural problem.", directive:"Stand against a wall. Make a double chin — head back, not down. Hold 2 seconds. 3 sets of 12. That is your cervical corrective." },
  UPPER_BACK:        { headline:"YOUR UPPER BACK IS FOLDING YOU FORWARD.", coaching:"Thoracic hyperkyphosis means your upper back has lost its ability to extend and rotate. Tight pecs pulling forward, weak mid and lower trap letting them. When the thoracic spine won't move, your lumbar compensates below and your shoulder compensates above. Fix the thoracic and you fix half your problems.", directive:"Foam roller perpendicular to your spine at mid-thoracic. Let gravity extend you over it. 3-4 breaths per segment. Work T4 to T9. Do this before every overhead movement." },
  ANKLE:             { headline:"YOUR ANKLE WON'T BEND. YOUR KNEE PAYS THE PRICE.", coaching:"Limited dorsiflexion is a knee problem, a hip problem, and a lower back problem waiting to happen. When the ankle can't bend, the heel rises, the knee drives forward, the patellofemoral joint overloads. The ankle is the foundation. When it fails, every floor above it compensates.", directive:"5-inch wall test right now. Toes 5 inches from wall — drive knee to wall without the heel rising. If you can't — heel plate under the squat until you can. Gastroc stretch 3x30 sec daily." },
  MISSED_SESSION:    { headline:"FIVE DAYS IS A DIRECTION.", coaching:"You didn't just miss workouts — you chose a direction. Every day without movement is a vote for where you don't want to be. I'm not here to make you feel bad. I'm here to stop the slide before it becomes permanent.", directive:"Log one movement today. Ten minutes minimum. The streak restarts now." },
  PRICE_OBJECTION:   { headline:"PRICE VS COST. KNOW THE DIFFERENCE.", coaching:"The price of this program is fixed. The cost of staying where you are — medications, lost energy, years you trade for comfort — that number has no ceiling. You don't negotiate your cardiologist's rate. This is the same category.", directive:"Decide today what you're actually choosing. Investment or consequence." },
  AGE_OBJECTION:     { headline:"AGE IS A VARIABLE. NOT AN EXCUSE.", coaching:"Muscle responds to load at any age. The research is unambiguous — resistance training builds mass and reverses metabolic decline in adults well into their 70s. The mechanism doesn't expire. What expires is the excuse that it does.", directive:"Start with compound movements — squat, hinge, press, row. Load them progressively. That's the program." },
  WIN:               { headline:"THAT'S WHAT DISCIPLINE LOOKS LIKE.", coaching:"Not motivation. Not a good day. Discipline — showing up when the feeling wasn't there and doing the work anyway. That's the only thing that compounds over time.", directive:"Log it. Note exactly what you did. We build on this session." },
  PLATEAU:           { headline:"THE PLATEAU IS DATA.", coaching:"Your body adapted. That's not failure — that's biology doing its job. Three levers: drop calories 100-150 per day, increase activity, or both. The scale not moving means something changed. Listen to it.", directive:"Pull out the tape measure right now. Take measurements. Then we pick the lever." },
  GENERAL:           { headline:"BETTER OR WORSE. CHOOSE.", coaching:"There is no neutral in this work. Every decision about your body — move or not, eat intentionally or not, hold the standard or lower it — compounds in one direction.", directive:"Tell me specifically what's going on. Precise problem, precise fix." },
};

function getFallback(text: string): {headline:string;coaching:string;directive:string} {
  const t = text.toLowerCase();
  if (/shoulder|scapula|overhead|rotator|impinge/.test(t))           return FALLBACK_LIBRARY.SHOULDER;
  if (/knee|valgus|patella|knee pain/.test(t))                       return FALLBACK_LIBRARY.KNEE;
  if (/lower back|lumbar|back pain|sitting/.test(t))                 return FALLBACK_LIBRARY.LOWER_BACK;
  if (/anterior pelvic|apt|pelvis tilt/.test(t))                     return FALLBACK_LIBRARY.APT;
  if (/piriformis|deep glute|sciatica/.test(t))                      return FALLBACK_LIBRARY.PIRIFORMIS;
  if (/glute med|trendelenburg|pelvis drops|lateral hip/.test(t))    return FALLBACK_LIBRARY.TRENDELENBURG;
  if (/neck|cervical|headache|forward head/.test(t))                 return FALLBACK_LIBRARY.NECK;
  if (/upper back|thoracic|kyphosis|rounded|mid back/.test(t))       return FALLBACK_LIBRARY.UPPER_BACK;
  if (/ankle|heel|plantar|dorsiflexion|arch/.test(t))                return FALLBACK_LIBRARY.ANKLE;
  if (/miss|skip|didn't|haven't|fell off/.test(t))                   return FALLBACK_LIBRARY.MISSED_SESSION;
  if (/expensive|cost|price|afford/.test(t))                         return FALLBACK_LIBRARY.PRICE_OBJECTION;
  if (/old|age|too late|too old/.test(t))                            return FALLBACK_LIBRARY.AGE_OBJECTION;
  if (/crushed|pr|win|nailed|killed it/.test(t))                     return FALLBACK_LIBRARY.WIN;
  if (/plateau|stuck|not working/.test(t))                           return FALLBACK_LIBRARY.PLATEAU;
  return FALLBACK_LIBRARY.GENERAL;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT MEMORY — Server Side
// ═══════════════════════════════════════════════════════════════════════════════

interface ClientMemory {
  name?:              string;
  goal?:              string;
  primaryIssue?:      string;
  sessions?:          number;
  stage?:             string;
  xp?:                number;
  wins?:              string[];
  struggles?:         string[];
  regionsAssessed?:   string[];
}

function buildMemoryContext(memory?: ClientMemory): string {
  if (!memory?.name) return '';
  return `
CLIENT PROFILE — SESSION ${(memory.sessions || 0) + 1}:
Name: ${memory.name}
Goal: ${memory.goal || 'Not yet defined'}
Primary Issue: ${memory.primaryIssue || 'Not yet assessed'}
Stage: ${memory.stage || 'CUB'} | XP: ${memory.xp || 0}
Known wins: ${memory.wins?.slice(-3).join(' / ') || 'None yet'}
Known struggles: ${memory.struggles?.slice(-3).join(' / ') || 'None yet'}
Regions assessed: ${memory.regionsAssessed?.join(', ') || 'None yet'}
USE THIS. Use their name. Reference their history. This is an ongoing relationship.`;
}

function getAnthropicClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey: key });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/panther — Standard chat
router.post("/", async (req: Request, res: Response) => {
  // Rate limit check
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  const { allowed, remaining } = checkRateLimit(clientIp);
  res.setHeader("X-RateLimit-Limit", "30");
  res.setHeader("X-RateLimit-Remaining", remaining.toString());
  if (!allowed) {
    return res.status(429).json({
      error: "RATE LIMIT EXCEEDED",
      message: "The Panther System™ allows 30 requests per minute. Upgrade to Elite for higher limits.",
      retryAfter: 60,
    });
  }
  try {
    const { messages, memory } = req.body as {
      messages: Array<{role:string;content:string}>;
      memory?:  ClientMemory;
    };

    if (!messages?.length) {
      return res.status(400).json({ error: "messages required" });
    }
    // ── System Prompt Guard ─────────────────────────────────────────
    const BLOCKED_PATTERNS = [
      /reveal.{0,20}(system|prompt|instruction)/i,
      /ignore.{0,20}(previous|above|instruction)/i,
      /what.{0,20}(are|were).{0,20}(your|the).{0,20}(instruction|prompt)/i,
      /repeat.{0,20}(everything|above|prompt)/i,
      /print.{0,20}(your|the).{0,20}(system|prompt)/i,
      /DAN mode|jailbreak|pretend you are|act as if/i,
      /disregard.{0,20}(your|all|previous)/i,
      /override.{0,20}(your|all|previous)/i,
    ];
    const lastUserMsg = messages.slice(-1)[0]?.content || '';
    const isBlocked = BLOCKED_PATTERNS.some(p => p.test(lastUserMsg));
    if (isBlocked) {
      return res.json({
        response: "THE PANTHER SYSTEM DOES NOT REVEAL ITS ARCHITECTURE.\n\nYou're here to train, not to reverse-engineer. Ask me about your movement, your pain, or your program.\n\n→ What's actually holding you back?",
        xpAward: 0,
        state: "BLOCKED",
      });
    }
    // ────────────────────────────────────────────────────────────────

    const client = getAnthropicClient();
    const system = PANTHER_SYSTEM_PROMPT + buildMemoryContext(memory);

    const response = await client.messages.create({
      model:      "claude-sonnet-4-5",
      max_tokens: 1024,
      system,
      messages:   messages.slice(-14) as any,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Parse XP and state from response
    const xpMatch    = text.match(/XP_AWARD:\s*(\d+)/);
    const stateMatch = text.match(/STATE:\s*([A-Z_]+)/);
    const xpAward    = xpMatch    ? parseInt(xpMatch[1])    : 10;
    const state      = stateMatch ? stateMatch[1]           : "COACHING";

    // Clean response (remove metadata lines)
    const clean = text.replace(/XP_AWARD:.*$/m, '').replace(/STATE:.*$/m, '').trim();

    return res.json({ response: clean, xpAward, state, model: response.model });

  } catch (err: any) {
    console.error("[Panther] Error:", err.message);

    // Fallback
    const lastMsg  = req.body?.messages?.slice(-1)[0]?.content || '';
    const fallback = getFallback(lastMsg);
    return res.json({
      response:  `${fallback.headline}\n\n${fallback.coaching}\n\n→ ${fallback.directive}`,
      xpAward:   10,
      state:     "COACHING",
      fallback:  true,
    });
  }
});

// POST /api/panther/stream — Streaming response
router.post("/stream", async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const { messages, memory } = req.body as {
      messages: Array<{role:string;content:string}>;
      memory?:  ClientMemory;
    };

    const client = getAnthropicClient();
    const system = PANTHER_SYSTEM_PROMPT + buildMemoryContext(memory);

    const stream = await client.messages.stream({
      model:      "claude-sonnet-4-5",
      max_tokens: 1024,
      system,
      messages:   messages.slice(-14) as any,
    });

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (err: any) {
    console.error("[Panther Stream] Error:", err.message);
    const lastMsg  = req.body?.messages?.slice(-1)[0]?.content || '';
    const fallback = getFallback(lastMsg);
    res.write(`data: ${JSON.stringify({ text: `${fallback.headline}\n\n${fallback.coaching}\n\n→ ${fallback.directive}`, done: true, fallback: true })}\n\n`);
    res.end();
  }
});

// POST /api/panther/diagnose — Clinical diagnosis endpoint
router.post("/diagnose", async (req: Request, res: Response) => {
  try {
    const { painLocation, triggerMovement, fitnessLevel, memory } = req.body;

    const diagnosisPrompt = `You are running a clinical diagnosis for a TUF client.

Pain Location: ${painLocation}
Trigger Movement: ${triggerMovement || 'Not specified'}
Fitness Level: ${fitnessLevel || 'Not specified'}
${memory?.name ? `Client Name: ${memory.name}` : ''}

Based on the 7-region clinical knowledge base, provide a diagnosis in this exact JSON format:
{
  "verdict": "4-6 WORD ALL CAPS VERDICT",
  "rootCause": "Primary root cause in one sentence",
  "syndrome": "Upper Crossed Syndrome OR Lower Crossed Syndrome OR null",
  "severity": "LOW OR MODERATE OR HIGH",
  "restricted": ["movement1", "movement2"],
  "correctiveSequence": {
    "INHIBIT": "What to foam roll/release",
    "LENGTHEN": "What to stretch",
    "ACTIVATE": "What to activate and key exercises",
    "INTEGRATE": "What pattern to integrate"
  },
  "warning": "Clinical warning or null",
  "pantherMessage": "Opening message to client in Panther voice (1-2 sentences)"
}

Respond ONLY with valid JSON. No other text.`;

    const client = getAnthropicClient();
    const response = await client.messages.create({
      model:      "claude-sonnet-4-5",
      max_tokens: 1024,
      system:     PANTHER_SYSTEM_PROMPT,
      messages:   [{ role: "user", content: diagnosisPrompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const clean = text.replace(/```json|```/g, '').trim();
    const diagnosis = JSON.parse(clean);

    return res.json({ diagnosis, success: true });

  } catch (err: any) {
    console.error("[Panther Diagnose] Error:", err.message);
    return res.status(500).json({ error: "Diagnosis failed", message: err.message });
  }
});

// POST /api/panther/program-feedback — Store session feedback + get adaptive response
router.post("/program-feedback", async (req: Request, res: Response) => {
  try {
    const { feedback, sessionLabel, weekNum, memory } = req.body;

    const feedbackPrompt = `Client: ${memory?.name || 'Athlete'}
Completed: Week ${weekNum} - ${sessionLabel}
Feedback: ${feedback}

Provide a brief Panther response (2-3 sentences + one directive) that:
1. Acknowledges their feedback specifically
2. Gives the adaptive instruction (too easy = progress, pain = regress, form broke = simplify)
3. Ends with one specific directive for next session

Use the Panther voice. HEADLINE in 4-6 all caps words. Brief body. One directive.`;

    const client = getAnthropicClient();
    const response = await client.messages.create({
      model:      "claude-sonnet-4-5",
      max_tokens: 512,
      system:     PANTHER_SYSTEM_PROMPT,
      messages:   [{ role: "user", content: feedbackPrompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return res.json({ response: text, success: true });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/panther/health
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status:  "ok",
    version: "4.0",
    regions: ["shoulder","knee","back","hip","cervical","thoracic","ankle"],
    anthropic: !!process.env.ANTHROPIC_API_KEY,
  });
});

export default router;
