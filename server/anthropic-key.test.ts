/**
 * Vitest: Validate ANTHROPIC_API_KEY is set and functional
 * Calls Claude with a minimal 1-token request to confirm the key works.
 */
import { describe, it, expect } from "vitest";
import Anthropic from "@anthropic-ai/sdk";

describe("ANTHROPIC_API_KEY validation", () => {
  it("should have ANTHROPIC_API_KEY set in environment", () => {
    expect(process.env.ANTHROPIC_API_KEY).toBeTruthy();
    expect(process.env.ANTHROPIC_API_KEY?.startsWith("sk-ant-")).toBe(true);
  });

  it("should successfully call Claude API with the key", async () => {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 10,
      messages: [{ role: "user", content: "Say: OK" }],
    });
    expect(response.content[0].type).toBe("text");
    const text = (response.content[0] as { type: "text"; text: string }).text;
    expect(text.length).toBeGreaterThan(0);
  }, 15000);
});
