/**
 * JARVIS API Routes
 * Express endpoints for AI fitness coaching
 */

import { Router, Request, Response } from "express";
import { generateJarvisResponse, QUICK_RESPONSES } from "../jarvis-api";

const router = Router();

type FitnessLevel = "beginner" | "intermediate" | "advanced";

interface JarvisRequestBody {
  message: string;
  conversationHistory?: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  userProfile?: {
    age?: number;
    fitnessLevel?: FitnessLevel;
    goals?: string[];
    injuries?: string[];
  };
}

/**
 * POST /api/jarvis
 * Generate JARVIS response to user message
 */
router.post("/", async (req: Request<{}, {}, JarvisRequestBody>, res: Response) => {
  try {
    const { message, conversationHistory, userProfile } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Check for quick response patterns
    const quickResponse = checkQuickResponse(message, userProfile?.fitnessLevel);
    if (quickResponse) {
      return res.json({
        response: quickResponse,
        isQuick: true,
      });
    }

    // Convert conversation history timestamps back to Date objects
    const history = conversationHistory?.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));

    // Generate response using Claude
    const jarvisResponse = await generateJarvisResponse({
      message,
      conversationHistory: history,
      userProfile,
    });

    res.json({
      response: jarvisResponse.response,
      suggestions: jarvisResponse.suggestions,
      actionItems: jarvisResponse.actionItems,
      isQuick: false,
    });
  } catch (error) {
    console.error("JARVIS endpoint error:", error);
    res.status(500).json({
      error: "Failed to generate response",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/jarvis/quick
 * Get quick response templates (no API call)
 */
router.post("/quick", (req: Request<{}, {}, { topic: string; level?: string }>, res: Response) => {
  const { topic, level = "beginner" } = req.body;

  const topicKey = topic as keyof typeof QUICK_RESPONSES;
  const topicData = QUICK_RESPONSES[topicKey];
  
  if (!topicData || typeof topicData === "string") {
    return res.status(404).json({ error: "Quick response not found" });
  }

  const response = (topicData as Record<string, string>)[level];

  if (!response) {
    return res.status(404).json({ error: "Quick response not found" });
  }

  res.json({ response });
});

/**
 * POST /api/jarvis/health-check
 * Verify API is working
 */
router.post("/health-check", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "JARVIS",
    timestamp: new Date().toISOString(),
  });
});

function checkQuickResponse(message: string, fitnessLevel?: FitnessLevel): string | null {
  const lowerMessage = message.toLowerCase();
  const level: FitnessLevel = fitnessLevel || "beginner";

  // Workout-related quick responses
  if (
    lowerMessage.includes("workout") ||
    lowerMessage.includes("exercise") ||
    lowerMessage.includes("training")
  ) {
    const workoutMap = QUICK_RESPONSES.workout as unknown as Record<FitnessLevel, string>;
    return workoutMap[level];
  }

  // Nutrition-related quick responses
  if (
    lowerMessage.includes("nutrition") ||
    lowerMessage.includes("meal") ||
    lowerMessage.includes("protein") ||
    lowerMessage.includes("diet")
  ) {
    const nutritionMap = QUICK_RESPONSES.nutrition as unknown as Record<FitnessLevel, string>;
    return nutritionMap[level];
  }

  // Recovery-related quick responses
  if (
    lowerMessage.includes("recovery") ||
    lowerMessage.includes("sleep") ||
    lowerMessage.includes("rest") ||
    lowerMessage.includes("mobility")
  ) {
    return QUICK_RESPONSES.recovery;
  }

  return null;
}

export default router;
