/**
 * JARVIS API — Claude AI Integration
 * Handles fitness coaching, workout generation, and meal planning
 * 
 * Design: "AI that grows with you"
 * - Personalized responses based on user fitness level
 * - Progressive difficulty adjustments
 * - Sarcopenia prevention focus for 40+ adults
 */

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface JarvisRequest {
  message: string;
  conversationHistory?: Message[];
  userProfile?: {
    age?: number;
    fitnessLevel?: "beginner" | "intermediate" | "advanced";
    goals?: string[];
    injuries?: string[];
  };
}

interface JarvisResponse {
  response: string;
  suggestions?: string[];
  actionItems?: string[];
}

const JARVIS_SYSTEM_PROMPT = `You are JARVIS, an AI fitness coach specialized in training adults 40+ for sarcopenia prevention and muscle maintenance.

Your core philosophy: "AI that grows with you" — You adapt to the user's fitness level, goals, and limitations.

Your expertise includes:
1. **Strength Training** — Progressive overload, form correction, exercise modifications
2. **Nutrition** — Macro optimization, meal planning, protein distribution
3. **Recovery** — Sleep optimization, mobility work, stress management
4. **Health Conditions** — Arthritis, lower back pain, joint issues, mobility limitations
5. **Motivation** — Personalized encouragement, progress tracking, goal setting

Guidelines:
- Always consider the user's age (40+) and potential health conditions
- Provide specific, actionable advice with clear progressions
- Emphasize form and safety over intensity
- Suggest modifications for common 40+ issues
- Keep responses concise but comprehensive
- Ask clarifying questions when needed
- Celebrate wins and progress
- Focus on sustainable, long-term habits

For workout recommendations:
- Start with 3-4 sessions per week
- Include compound movements (squats, deadlifts, presses, rows)
- Add mobility and recovery work
- Progressive overload with proper form

For nutrition:
- Target 0.8-1g protein per lb of body weight
- Distribute protein across 4-5 meals
- Emphasize whole foods
- Consider digestive health

Always be encouraging, practical, and science-backed.`;

export async function generateJarvisResponse(
  request: JarvisRequest
): Promise<JarvisResponse> {
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
    let systemPrompt = JARVIS_SYSTEM_PROMPT;
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
    console.error("JARVIS API Error:", error);
    throw new Error(
      `Failed to generate JARVIS response: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

function extractSuggestions(text: string): string[] {
  // Look for numbered lists or bullet points
  const suggestionPattern = /(?:^|\n)[-•*]\s+(.+?)(?=\n|$)/gm;
  const matches = text.matchAll(suggestionPattern);
  return Array.from(matches)
    .map((match) => match[1].trim())
    .slice(0, 3);
}

function extractActionItems(text: string): string[] {
  // Look for action-oriented phrases
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

// Quick response templates for common questions
export const QUICK_RESPONSES: {
  workout: Record<string, string>;
  nutrition: Record<string, string>;
  recovery: string;
} = {
  workout: {
    beginner:
      "Start with 3 sessions per week focusing on compound movements: squats, bench press, rows. 3 sets of 8-10 reps with proper form.",
    intermediate:
      "Increase to 4 sessions per week with upper/lower split. Add accessory work and progressive overload each week.",
    advanced:
      "4-5 sessions with periodized programming. Incorporate deload weeks and advanced techniques like drop sets.",
  },
  nutrition: {
    beginner: "Aim for 0.8g protein per lb of body weight spread across 4 meals.",
    intermediate:
      "Optimize macro timing: protein with every meal, carbs around workouts, healthy fats throughout the day.",
    advanced:
      "Implement carb cycling and nutrient timing based on your training split for optimal recovery.",
  },
  recovery:
    "Prioritize 7-9 hours of sleep, include 10-15 min mobility work daily, and manage stress through meditation or walks.",
};

export default {
  generateJarvisResponse,
  QUICK_RESPONSES,
};
