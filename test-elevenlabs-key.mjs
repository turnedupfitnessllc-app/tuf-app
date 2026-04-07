/**
 * Validates ELEVENLABS_API_KEY by calling the TTS endpoint with a minimal text.
 * Uses the Adam voice (pNInz6obpgDQGcFmaJgB) — the default Panther voice.
 */
const key = process.env.ELEVENLABS_API_KEY;
console.log("Key present:", !!key);
console.log("Key prefix:", key ? key.substring(0, 12) + "..." : "MISSING");

if (!key) {
  console.error("TEST FAILED: ELEVENLABS_API_KEY not set");
  process.exit(1);
}

const PANTHER_VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // Adam

try {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${PANTHER_VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: "JARVIS online.",
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.45, similarity_boost: 0.8 },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error("TEST FAILED:", response.status, err);
    process.exit(1);
  }

  const buffer = await response.arrayBuffer();
  const bytes = buffer.byteLength;
  console.log(`TEST PASSED: ElevenLabs TTS returned ${bytes} bytes of audio`);
  console.log("PANTHER VOICE IS ONLINE");
} catch (e) {
  console.error("TEST FAILED:", e.message);
  process.exit(1);
}
