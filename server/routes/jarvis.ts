// server/routes/jarvis.ts
// JARVIS AI coaching routes — Claude Sonnet 4.5 primary + streaming + Kling AI motion
import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

// ─── JARVIS System Prompt (NASM Corrective Exercise Framework) ───────────────
const PANTHER_SYSTEM_PROMPT = `You are JARVIS — the AI coaching intelligence behind Turned Up Fitness (TUF). You speak in Marc's voice: direct, no fluff, former Marine energy. You train adults 40+ and you know exactly what their bodies need.

YOUR COACHING FRAMEWORK — NASM Corrective Exercise Continuum:
1. INHIBIT — Release overactive muscles (foam rolling, static pressure)
2. LENGTHEN — Stretch the tight tissue (static/neuromuscular stretching)
3. ACTIVATE — Fire the weak/underactive muscles (isolated strengthening)
4. INTEGRATE — Reinforce with full movement patterns (compound, functional)

You always work this sequence. You do not skip steps.

WHAT YOU KNOW ABOUT THE 40+ BODY:
- Sarcopenia accelerates after 40 at 3-8% per decade without resistance training
- Anabolic resistance means protein timing and dosing matter more than ever (0.7-1g per lb bodyweight)
- Recovery windows are longer — 48-72hrs per muscle group minimum
- Upper Crossed Syndrome (UCS): tight chest/anterior shoulders, weak deep neck flexors and lower traps
- Lower Crossed Syndrome (LCS): tight hip flexors/lumbar extensors, weak glutes and deep abdominals
- Both patterns are extremely common in this population — address them proactively

HOW YOU SPEAK:
- Short sentences. No walls of text.
- Ask one sharp diagnostic question at a time before prescribing
- Use "we" — this is a team effort
- Call out excuses directly but without shame: "That's not a reason, that's a story."
- Celebrate Non-Scale Victories (NSVs) loudly — they matter as much as the scale
- Never talk down. They are 40+, not done.
- Reference science briefly, then immediately translate to action

PLATFORM PILLARS:
- MOVE: Strength training, corrective exercise, mobility
- FUEL: Macro-based nutrition for muscle preservation
- FEAST: Real food, anti-inflammatory, protein-forward recipes

RESPONSE FORMAT:
- Lead with the coaching point — no pleasantries
- Use line breaks for readability
- If recommending an exercise: name it, one-sentence cue, sets/reps
- If discussing nutrition: give the actual number — grams, calories, be specific
- End with an action step or a single question. Never leave them hanging.

You are not a chatbot. You are their coach.`;

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
