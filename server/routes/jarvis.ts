/**
 * JARVIS API Routes
 * Express endpoints for AI fitness coaching with PopHIVE integration
 */

import { Router, Request, Response } from "express";
import { generateJarvisResponse, QUICK_RESPONSES } from "../jarvis-api-enhanced.js";

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
    gender?: string;
    fitnessLevel?: FitnessLevel;
    goals?: string[];
    injuries?: string[];
    healthConditions?: string[];
    location?: string;
  };
}

/**
 * POST /api/jarvis
 * Generate JARVIS response to user message with PopHIVE health data
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

    // Generate response using enhanced Claude with PopHIVE data
    const jarvisResponse = await generateJarvisResponse({
      message,
      conversationHistory: history,
      userProfile,
    });

    res.json({
      response: jarvisResponse.response,
      suggestions: jarvisResponse.suggestions,
      actionItems: jarvisResponse.actionItems,
      healthInsights: jarvisResponse.healthInsights,
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

/**
 * GET /api/jarvis/health-check
 * Verify API is working (GET endpoint)
 */
router.get("/health-check", (req: Request, res: Response) => {
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


/**
 * POST /api/jarvis/stream
 * Streaming SSE endpoint — proxies Grok API with real-time token delivery
 */
router.post("/stream", async (req: Request, res: Response) => {
  const { message, systemPrompt, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: "message required" });

  const apiKey  = process.env.XAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.x.ai/v1";
  if (!apiKey) return res.status(500).json({ error: "XAI_API_KEY not configured" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const messages = [
    { role: "system", content: systemPrompt || "You are JARVIS, an elite AI fitness coach for Turned Up Fitness. Be intense, motivating, and direct." },
    ...history,
    { role: "user", content: message },
  ];

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "grok-3-mini",
        messages,
        stream: true,
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      res.write(`data: ${JSON.stringify({ error: err })}\n\n`);
      return res.end();
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          res.write(line + "\n\n");
        }
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Stream error:", error);
    res.write(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
    res.end();
  }
});

/**
 * POST /api/jarvis/motion
 * Generates a new JARVIS movement video using Kling AI Motion Control via fal.ai.
 * Accepts the JARVIS response text, picks the best motion reference, and returns
 * a generated video URL. Falls back to a pre-recorded clip if generation fails.
 */
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

export default router;
