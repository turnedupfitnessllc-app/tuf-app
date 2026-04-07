import Anthropic from "@anthropic-ai/sdk";

const key = process.env.ANTHROPIC_API_KEY;
console.log("Key present:", !!key);
console.log("Key prefix:", key ? key.substring(0, 12) + "..." : "MISSING");

if (!key) {
  console.error("TEST FAILED: ANTHROPIC_API_KEY not set");
  process.exit(1);
}

const client = new Anthropic({ apiKey: key });

try {
  const response = await client.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 15,
    messages: [{ role: "user", content: "Say: JARVIS ONLINE" }],
  });
  const text = response.content[0].type === "text" ? response.content[0].text : "";
  console.log("Claude response:", text);
  console.log("TEST PASSED: API key is valid and JARVIS is online");
} catch (e) {
  console.error("TEST FAILED:", e.message);
  process.exit(1);
}
