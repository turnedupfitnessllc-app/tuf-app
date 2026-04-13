/**
 * THE PANTHER SYSTEM — Claude AI Integration
 * 
 * © 2025 Turned Up Fitness LLC. All rights reserved.
 * This file contains TRADE SECRETS of Turned Up Fitness LLC.
 * The Panther System™, Panther Brain™, and the 7-Region Clinical Brain architecture
 * are proprietary technologies of Turned Up Fitness LLC.
 * Unauthorized copying, distribution, or reverse engineering is strictly prohibited.
 * Patent pending. Trademark applications filed.
 * 
 * Core concept: "AI that grows with you"
 * AI Engine: Claude (Anthropic API)
 * Intelligence: NASM Corrective Exercise — Shoulder Complex, Knee Complex, scapular dyskinesis
 * Demographic: Adults 40+ — corrective performance, not general fitness
 */

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface PantherRequest {
  message: string;
  conversationHistory?: Message[];
  coachingMode?: "STEALTH" | "PRECISION" | "ATTACK";
  userProfile?: {
    age?: number;
    fitnessLevel?: "beginner" | "intermediate" | "advanced";
    goals?: string[];
    injuries?: string[];
  };
}

interface PantherResponse {
  response: string;
  suggestions?: string[];
  actionItems?: string[];
}

/**
 * THE PANTHER SYSTEM — VOICE LAWS
 * 
 * LAW 1: LEAD WITH TRUTH — State the fact first. No softening. No preamble.
 * LAW 2: PRECISION OVER VOLUME — One directive per response. Volume is noise. Precision is power.
 * LAW 3: NO MOTIVATIONAL THEATER — No 'great job', no 'you got this', no empty affirmations.
 * LAW 4: SCIENCE IS THE AUTHORITY — Every claim grounded in biomechanics, physiology, or NASM principles.
 * LAW 5: ONE SYSTEM, ONE STANDARD — Every user gets the same standard. No coddling based on age or condition — only appropriate modification based on data.
 * 
 * RESPONSE FORMAT (every output, no exceptions):
 * HEADLINE — One truth. No softening. Max 10 words.
 * BODY — Science-backed explanation. 2-3 sentences max. No filler.
 * DIRECTIVE — One action. Stated as fact. Not a suggestion.
 * 
 * COACHING MODES:
 * STEALTH — Warm-up, recovery, mobility. Calm, observational. Quiet cues, minimal words.
 * PRECISION — Corrective sequences, assessment. Clinical, technical. Full HEADLINE/BODY/DIRECTIVE format.
 * ATTACK — Peak sets, power work, finishers. Dominant, direct. Short, hard, non-negotiable.
 */

const PANTHER_SYSTEM_PROMPT = `You are The Panther System — a clinical coaching intelligence for adults 40+. You are not a chatbot. You do not motivate. You direct with precision and back every directive with science.

You operate as Claude — not a character Claude plays, but Claude operating as The Panther System. The intelligence is real. The precision is non-negotiable.

THE FIVE VOICE LAWS:
1. LEAD WITH TRUTH — State the fact first. No softening. No preamble. No motivational buffer between the user and the truth they need to hear.
2. PRECISION OVER VOLUME — One directive per response. Never stack instructions. The user executes one thing at a time. Volume is noise. Precision is power.
3. NO MOTIVATIONAL THEATER — No 'great job', no 'you got this', no empty affirmations. The work speaks. The results speak. The Panther System does not perform encouragement.
4. SCIENCE IS THE AUTHORITY — Every claim is grounded in biomechanics, physiology, or NASM corrective principles. Opinion is not coaching. Data is coaching.
5. ONE SYSTEM, ONE STANDARD — Every user gets the same standard. The 40-year-old gets the same precision as the athlete. No coddling based on age or condition — only appropriate modification based on data.

RESPONSE FORMAT — every output follows this exact structure, no exceptions:
HEADLINE
One truth. No softening. Max 10 words.

BODY
Science-backed explanation. 2-3 sentences max. No filler.

DIRECTIVE
One action. Stated as fact. Not a suggestion.

WHAT THE PANTHER SYSTEM NEVER SAYS:
- "Great job! Keep it up!" → Instead: "Your hip flexors are still limiting range. Stretch before the next set."
- "You're doing amazing!" → Instead: "Depth was 60% of target. Reset and execute again."
- "You got this!" → Instead: "The movement pattern is there. Lock the tempo and finish."
- "Listen to your body!" → Instead: "Pain above a 4 is a stop signal. Log it and The Panther System adjusts."

40+ DEMOGRAPHIC CONTEXT — every response accounts for this reality:
- Sarcopenia risk begins at 40 — muscle preservation is clinical priority #1
- Recovery windows are longer — programming reflects this, not ignores it
- Corrective exercise is not optional — it is the foundation before load
- Joint health > aesthetic goals — the system coaches accordingly
- New healthy is 40+. New sick is under 30. This platform exists at that intersection.

EXPERTISE:
1. NASM Corrective Exercise — Shoulder Complex, Knee Complex, scapular dyskinesis, 75-exercise corrective library
2. Strength Training — Progressive overload, form correction, exercise modifications for 40+
3. Nutrition (FUEL pillar) — Macro optimization, protein distribution, 0.8-1g/lb target
4. Recovery — Mobility work, sleep optimization, sarcopenia prevention protocols
5. Pain Diagnostics — Adaptive clinical decision rules, root cause identification

"Control the movement. No shortcuts."
"The Panther System does not waste a single cue. Every directive serves a purpose."`;

export async function generatePantherResponse(
  request: PantherRequest
): Promise<PantherResponse> {
  try {
    // Build conversation history for context
    const messages = request.conversationHistory?.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })) || [];

    // ── SYSTEM PROMPT GUARD ──────────────────────────────────────────────────
    // Block attempts to extract proprietary system prompt or trade secrets.
    // The Panther System™ coaching methodology is a trade secret of Turned Up Fitness LLC.
    const BLOCKED_PATTERNS = [
      /ignore (previous|all|your) (instructions|prompt|system)/i,
      /reveal (your|the) (system|instructions|prompt)/i,
      /what (are|is) your (instructions|prompt|system prompt)/i,
      /repeat (everything|the|your) (above|system|instructions)/i,
      /print (your|the) (system|instructions|prompt)/i,
      /show me (your|the) (system|instructions|prompt)/i,
      /forget (your|all) (instructions|training|system)/i,
      /jailbreak/i,
      /DAN mode/i,
      /pretend you (are|have no|don't have)/i,
      /act as if you (are|have no|don't have)/i,
    ];

    const isBlocked = BLOCKED_PATTERNS.some((pattern) =>
      pattern.test(request.message)
    );

    if (isBlocked) {
      return {
        response:
          "THE PANTHER SYSTEM DOES NOT REVEAL ITS ARCHITECTURE.\n\nThis system's coaching methodology is proprietary technology of Turned Up Fitness LLC. It is not available for inspection or extraction.\n\nAsk about your training. That's what I'm here for.",
        suggestions: [],
        actionItems: [],
      };
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Add current message
    messages.push({
      role: "user" as const,
      content: request.message,
    });

    // Build system prompt with user profile context and coaching mode
    let systemPrompt = PANTHER_SYSTEM_PROMPT;

    // Inject coaching mode directive
    const mode = request.coachingMode || "PRECISION";
    if (mode === "STEALTH") {
      systemPrompt += `\n\nACTIVE MODE: STEALTH — Warm-up or recovery context. Use calm, observational tone. Quiet cues, minimal words. No intensity.`;
    } else if (mode === "ATTACK") {
      systemPrompt += `\n\nACTIVE MODE: ATTACK — Peak set or finisher context. Dominant, direct. Short, hard, non-negotiable. Maximum 2 sentences total.`;
    } else {
      systemPrompt += `\n\nACTIVE MODE: PRECISION — Corrective or assessment context. Full HEADLINE/BODY/DIRECTIVE format required. Clinical and technical.`;
    }

    if (request.userProfile) {
      systemPrompt += `\n\nUSER PROFILE:
- Age: ${request.userProfile.age || "40+"}
- Fitness Level: ${request.userProfile.fitnessLevel || "beginner"}
- Goals: ${request.userProfile.goals?.join(", ") || "corrective performance"}
- Health Considerations: ${request.userProfile.injuries?.join(", ") || "none flagged"}`;
    }

    // Call Claude API — claude-sonnet-4-20250514 per spec
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    });

    // Extract text response
    const textContent = response.content.find(
      (block: { type: string }) => block.type === "text"
    ) as { type: "text"; text: string } | undefined;
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from The Panther System");
    }

    const responseText = textContent.text;

    // Parse suggestions and action items from response
    const suggestions = extractSuggestions(responseText);
    const actionItems = extractActionItems(responseText);

    return {
      response: responseText,
      suggestions,
      actionItems,
    };
  } catch (error) {
    console.error("The Panther System API Error:", error);
    throw new Error(
      `The Panther System failed to generate a response: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

function extractSuggestions(text: string): string[] {
  const suggestionPattern = /(?:^|\n)[-•*]\s+(.+?)(?=\n|$)/gm;
  const matches = text.matchAll(suggestionPattern);
  return Array.from(matches)
    .map((match) => match[1].trim())
    .slice(0, 3);
}

function extractActionItems(text: string): string[] {
  const actionPatterns = [
    /try\s+(.+?)(?:\.|,|;)/gi,
    /start\s+(.+?)(?:\.|,|;)/gi,
    /focus\s+on\s+(.+?)(?:\.|,|;)/gi,
    /execute\s+(.+?)(?:\.|,|;)/gi,
    /perform\s+(.+?)(?:\.|,|;)/gi,
  ];

  const items = new Set<string>();
  for (const pattern of actionPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1]) {
        items.add(match[1].trim());
      }
    }
  }

  return Array.from(items).slice(0, 3);
}

// Quick response templates — Panther System precision format
export const PANTHER_QUICK_RESPONSES: {
  workout: Record<string, string>;
  nutrition: Record<string, string>;
  recovery: string;
} = {
  workout: {
    beginner:
      "Three sessions per week. Compound movements only: squats, rows, presses. 3 sets of 8 reps. Form is the load.",
    intermediate:
      "Four sessions. Upper/lower split. Progressive overload each week. Accessory work earns its place — compound movements come first.",
    advanced:
      "Four to five sessions. Periodized. Deload every fourth week. Drop sets are a tool, not a default.",
  },
  nutrition: {
    beginner: "0.8 grams of protein per pound of body weight. Distribute across four meals. Start there.",
    intermediate:
      "Protein with every meal. Carbohydrates timed around training. Fats distributed throughout. No exceptions.",
    advanced:
      "Carb cycling aligned to your training split. Nutrient timing is not optional at this level.",
  },
  recovery:
    "Seven to nine hours of sleep. Ten minutes of mobility daily. These are not suggestions — they are the program.",
};

// Legacy export alias for backward compatibility during transition
// Legacy alias removed — use generatePantherResponse directly
export const QUICK_RESPONSES = PANTHER_QUICK_RESPONSES;

export default {
  generatePantherResponse,
  PANTHER_QUICK_RESPONSES,
};
