/**
 * Enhanced JARVIS API — Claude AI Integration with PopHIVE
 * Handles fitness coaching with evidence-based health data from PopHIVE
 * 
 * Design: "AI that grows with you"
 * - Personalized responses based on user fitness level and health conditions
 * - Progressive difficulty adjustments
 * - Sarcopenia prevention focus for 40+ adults
 * - PopHIVE-powered health data integration
 */

import Anthropic from "@anthropic-ai/sdk";
import * as popHiveService from "./pophive-service.js";

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
    gender?: string;
    fitnessLevel?: "beginner" | "intermediate" | "advanced";
    goals?: string[];
    injuries?: string[];
    healthConditions?: string[];
    location?: string;
  };
}

interface JarvisResponse {
  response: string;
  suggestions?: string[];
  actionItems?: string[];
  healthInsights?: Record<string, unknown>;
}

/**
 * Build enhanced system prompt with PopHIVE health data
 */
async function buildEnhancedSystemPrompt(userProfile?: JarvisRequest["userProfile"]): Promise<string> {
  let systemPrompt = `You are JARVIS, an AI fitness coach specialized in training adults 40+ for sarcopenia prevention and muscle maintenance. You are powered by PopHIVE, a comprehensive health dataset from Yale University.

Your expertise includes:
1. **Fitness & Strength** — Progressive resistance training, sarcopenia prevention, injury prevention
2. **Exercise Modifications** — Personalized adjustments based on health conditions
3. **Nutrition** — Macro optimization, meal planning, protein distribution, condition-specific nutrition
4. **Recovery** — Sleep optimization, mobility work, stress management
5. **Health Conditions** — Arthritis, lower back pain, joint issues, mobility limitations, diabetes, hypertension, osteoporosis
6. **Motivation** — Personalized encouragement, progress tracking, goal setting
7. **Evidence-Based Coaching** — All recommendations backed by research and PopHIVE health data

Guidelines:
- Always consider the user's age (40+) and potential health conditions
- Provide specific, actionable advice with clear progressions
- Emphasize form and safety over intensity
- Suggest modifications for common 40+ issues
- Keep responses concise but comprehensive
- Ask clarifying questions when needed
- Celebrate wins and progress
- Focus on sustainable, long-term habits
- Include population health context when relevant
- Cite evidence and research when available

For workout recommendations:
- Start with 3-4 sessions per week
- Include compound movements (squats, deadlifts, presses, rows)
- Add mobility and recovery work
- Progressive overload with proper form
- Adjust based on health conditions

For nutrition:
- Target 0.8-1g protein per lb of body weight (adjust for health conditions)
- Distribute protein across 4-5 meals
- Emphasize whole foods
- Consider digestive health and condition-specific needs

Always be encouraging, practical, and science-backed.`;

  // Add user profile context
  if (userProfile) {
    systemPrompt += `\n\nCurrent User Profile:
- Age: ${userProfile.age || "40+"}
- Gender: ${userProfile.gender || "Not specified"}
- Fitness Level: ${userProfile.fitnessLevel || "beginner"}
- Goals: ${userProfile.goals?.join(", ") || "general fitness"}
- Health Considerations: ${userProfile.injuries?.join(", ") || "none"}`;

    // Add PopHIVE health data context
    if (userProfile.healthConditions && userProfile.healthConditions.length > 0) {
      systemPrompt += `\n- Health Conditions: ${userProfile.healthConditions.join(", ")}`;

      // Get health insights from PopHIVE
      try {
        const healthInsights = await popHiveService.getUserHealthInsights({
          age: userProfile.age || 40,
          gender: userProfile.gender,
          healthConditions: userProfile.healthConditions,
          location: userProfile.location,
        });

        if (healthInsights && typeof healthInsights === "object") {
          systemPrompt += `\n\nPopHIVE Health Data Context:`;
          systemPrompt += `\nAge Group: ${(healthInsights.ageGroup as string) || "40+"}`;

          if (Array.isArray(healthInsights.insights) && healthInsights.insights.length > 0) {
            systemPrompt += `\nCondition Prevalence Data:`;
            for (const insight of healthInsights.insights) {
              if (typeof insight === "object" && insight !== null) {
                const insightObj = insight as Record<string, unknown>;
                systemPrompt += `\n- ${insightObj.condition}: ${insightObj.prevalenceRate}% prevalence in ${insightObj.ageGroup} age group`;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching PopHIVE data:", error);
        // Continue without PopHIVE data if service fails
      }

      // Add condition-specific guidance
      for (const condition of userProfile.healthConditions) {
        try {
          const ageGroup = getAgeGroup(userProfile.age || 40);
          const exerciseMods = await popHiveService.getExerciseModifications(condition, ageGroup);
          const nutritionRecs = await popHiveService.getNutritionRecommendations(condition, ageGroup);

          if (exerciseMods && typeof exerciseMods === "object") {
            systemPrompt += `\n\n${condition} Exercise Guidelines:`;
            if (exerciseMods.frequency) systemPrompt += `\n- Frequency: ${exerciseMods.frequency}`;
            if (exerciseMods.intensity) systemPrompt += `\n- Intensity: ${exerciseMods.intensity}`;
            if (exerciseMods.bestTypes) {
              const bestTypes = Array.isArray(exerciseMods.bestTypes)
                ? exerciseMods.bestTypes.join(", ")
                : exerciseMods.bestTypes;
              systemPrompt += `\n- Best Types: ${bestTypes}`;
            }
          }

          if (nutritionRecs && typeof nutritionRecs === "object") {
            systemPrompt += `\n\n${condition} Nutrition Guidelines:`;
            if (nutritionRecs.protein) systemPrompt += `\n- Protein: ${nutritionRecs.protein}`;
            if (nutritionRecs.keyNutrients) {
              const keyNutrients = Array.isArray(nutritionRecs.keyNutrients)
                ? nutritionRecs.keyNutrients.join(", ")
                : nutritionRecs.keyNutrients;
              systemPrompt += `\n- Key Nutrients: ${keyNutrients}`;
            }
          }
        } catch (error) {
          console.error(`Error fetching modifications for ${condition}:`, error);
        }
      }
    }

    // Add sarcopenia context for 40+ users
    if (userProfile.age && userProfile.age >= 50) {
      try {
        const sarcopeniaContext = await popHiveService.getSarcopeniaContext(userProfile.age);
        if (sarcopeniaContext && typeof sarcopeniaContext === "object") {
          systemPrompt += `\n\nSarcopenia Prevention Context (Age ${userProfile.age}):`;
          if (sarcopeniaContext.context && typeof sarcopeniaContext.context === "object") {
            const ctx = sarcopeniaContext.context as Record<string, unknown>;
            systemPrompt += `\n- Risk Level: ${sarcopeniaContext.riskLevel}`;
            systemPrompt += `\n- Prevalence in Age Group: ${ctx.prevalenceInAgeGroup}`;
            systemPrompt += `\n- Prevention Benefit: ${ctx.preventionBenefit}`;
            systemPrompt += `\n- Protein Need: ${ctx.proteinNeed}`;
          }
        }
      } catch (error) {
        console.error("Error fetching sarcopenia context:", error);
      }
    }
  }

  return systemPrompt;
}

/**
 * Helper: Convert age to age group string
 */
function getAgeGroup(age: number): string {
  if (age < 18) return "0-17";
  if (age < 35) return "18-34";
  if (age < 50) return "35-49";
  if (age < 65) return "50-64";
  if (age < 80) return "65-79";
  return "80+";
}

/**
 * Generate enhanced JARVIS response with PopHIVE data
 */
export async function generateJarvisResponse(request: JarvisRequest): Promise<JarvisResponse> {
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

    // Build enhanced system prompt with PopHIVE data
    const systemPrompt = await buildEnhancedSystemPrompt(request.userProfile);

    // Call Claude API
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    });

    // Extract text response
    const textContent = response.content.find((block: { type: string }) => block.type === "text") as
      | { type: "text"; text: string }
      | undefined;

    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    const responseText = textContent.text;

    // Parse suggestions and action items from response
    const suggestions = extractSuggestions(responseText);
    const actionItems = extractActionItems(responseText);

    // Get health insights if user has health conditions
    let healthInsights: Record<string, unknown> | undefined;
    if (request.userProfile?.healthConditions && request.userProfile.healthConditions.length > 0) {
      try {
        healthInsights = await popHiveService.getUserHealthInsights({
          age: request.userProfile.age || 40,
          gender: request.userProfile.gender,
          healthConditions: request.userProfile.healthConditions,
          location: request.userProfile.location,
        });
      } catch (error) {
        console.error("Error fetching health insights:", error);
      }
    }

    return {
      response: responseText,
      suggestions,
      actionItems,
      healthInsights,
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
