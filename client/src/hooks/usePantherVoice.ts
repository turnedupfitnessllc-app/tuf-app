/**
 * usePantherVoice — ElevenLabs TTS hook
 * Calls /api/voice/speak and plays the returned audio/mpeg stream.
 * Voice: "panther" (calm_intense, directive, minimal words)
 */
import { useRef, useCallback, useState } from "react";

type VoiceKey = "panther" | "marcus" | "coach" | "overdrive";

interface UsePantherVoiceOptions {
  voiceKey?: VoiceKey;
  /** Prevent overlapping playback — stops current audio before speaking */
  interruptible?: boolean;
}

export function usePantherVoice(options: UsePantherVoiceOptions = {}) {
  const { voiceKey = "panther", interruptible = true } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(
    async (text: string) => {
      if (!text?.trim()) return;

      // Stop current audio if interruptible
      if (interruptible && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }

      setSpeaking(true);

      try {
        const res = await fetch("/api/voice/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voiceKey }),
        });

        if (!res.ok) {
          console.warn("[PantherVoice] TTS request failed:", res.status);
          setSpeaking(false);
          return;
        }

        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setSpeaking(false);
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };

        audio.onerror = () => {
          setSpeaking(false);
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };

        await audio.play();
      } catch (err) {
        console.warn("[PantherVoice] Error:", err);
        setSpeaking(false);
      }
    },
    [voiceKey, interruptible]
  );

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking };
}
