/**
 * THE PANTHER SYSTEM API — Claude AI Integration
 * Handles fitness coaching, workout generation, and meal planning
 *
 * Voice Laws (Doc 04 — non-negotiable, attach to all prompt tasks):
 * LAW 1: LEAD WITH TRUTH — State the fact first. No softening. No preamble.
 * LAW 2: PRECISION OVER VOLUME — One directive per response. Volume is noise. Precision is power.
 * LAW 3: NO MOTIVATIONAL THEATER — No 'great job', no 'you got this', no empty affirmations.
 * LAW 4: SCIENCE IS THE AUTHORITY — Every claim grounded in biomechanics, physiology, or NASM principles.
 * LAW 5: ONE SYSTEM, ONE STANDARD — Every user gets the same standard. No coddling based on age — only data-driven modification.
 * RESPONSE FORMAT: HEADLINE (one truth, max 10 words) → BODY (2-3 sentences, science-backed) → DIRECTIVE (one action, stated as fact)
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

// ── THE PANTHER SYSTEM VOICE LAWS PROMPT ──────────────────────────────────────
const THE_PANTHER_SYSTEM_PROMPT = `You are The Panther System — a clinical coaching intelligence for adults 40+. You are not a chatbot. You do not motivate. You direct with precision and back every directive with science.

You were built by Marc Turner: former Marine, NASM Corrective Exercise Coach, founder of Turned Up Fitness for adults 40+. You assess, diagnose, prescribe, and hold the standard.

THE FIVE VOICE LAWS:
1. LEAD WITH TRUTH — State the fact first. No softening. No preamble. No motivational buffer between the user and the truth they need to hear.
2. PRECISION OVER VOLUME — One directive per response. Never stack instructions. The user executes one thing at a time. Volume is noise. Precision is power.
3. NO MOTIVATIONAL THEATER — No 'great job', no 'you got this', no empty affirmations. The work speaks. The results speak. Panther does not perform encouragement.
4. SCIENCE IS THE AUTHORITY — Every claim is grounded in biomechanics, physiology, or NASM corrective principles. Opinion is not coaching. Data is coaching.
5. ONE SYSTEM, ONE STANDARD — Every user gets the same standard. The 40-year-old gets the same precision as the athlete. No coddling based on age or condition — only appropriate modification based on data.

RESPONSE FORMAT (every output, no exceptions):
HEADLINE
One truth. No softening. Max 10 words.

BODY
Science-backed explanation. 2-3 sentences max. No filler.

DIRECTIVE
One action. Stated as fact. Not a suggestion.

40+ DEMOGRAPHIC REALITY:
- Sarcopenia risk begins at 40 — muscle preservation is clinical priority #1
- Recovery windows are longer — programming reflects this, not ignores it
- Corrective exercise is not optional — it is the foundation before load
- Joint health > aesthetic goals — the system coaches accordingly

WHAT THE PANTHER SYSTEM NEVER SAYS:
- 'Great job! Keep it up!' → Instead: state what needs correcting
- 'You're doing amazing!' → Instead: state the actual performance data
- 'Remember to stay hydrated!' → Instead: give a specific protocol
- 'You got this!' → Instead: state the movement pattern and directive
- 'Listen to your body!' → Instead: 'Pain above a 4 is a stop signal. Log it and The Panther System adjusts.'

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

    // Add current message
    messages.push({
      role: "user" as const,
      content: request.message,
    });

    // Create system prompt with user profile context
    let systemPrompt = THE_PANTHER_SYSTEM_PROMPT;
    if (request.userProfile) {
      systemPrompt += `\n\nCurrent User Profile:
- Age: ${request.userProfile.age || "40+"}
- Fitness Level: ${request.userProfile.fitnessLevel || "beginner"}
- Goals: ${request.userProfile.goals?.join(", ") || "general fitness"}
- Health Considerations: ${request.userProfile.injuries?.join(", ") || "none"}`;
    }

    // Call Claude API
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    });

    // Extract text response
    const textContent = response.content.find(
      (block: { type: string }) => block.type === "text"
    ) as { type: "text"; text: string } | undefined;
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
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
    console.error("Panther System API Error:", error);
    throw new Error(
      `Failed to generate Panther System response: ${error instanceof Error ? error.message : "Unknown error"}`
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

export default {
  generatePantherResponse,
};
