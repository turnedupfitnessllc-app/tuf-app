/**
 * usePantherVoice v2.0 — ElevenLabs TTS hook
 *
 * Features:
 * - Streaming audio via /api/voice/speak/stream for low-latency playback
 * - Personality presets: calm_intense · motivational · drill_sergeant · recovery · technical
 * - Web Audio API waveform analysis (amplitude data for visualizer)
 * - Priority queue — urgent cues interrupt; normal cues wait
 * - Browser speechSynthesis fallback if ElevenLabs fails
 */
import { useRef, useCallback, useState, useEffect } from "react";

export type VoiceKey = "panther" | "marcus" | "coach" | "overdrive";
export type PersonalityKey = "calm_intense" | "motivational" | "drill_sergeant" | "recovery" | "technical";

export interface SpeakOptions {
  voiceKey?: VoiceKey;
  personality?: PersonalityKey;
  /** true = interrupt current speech immediately (default for workout cues) */
  interrupt?: boolean;
  /** Callback when audio starts playing */
  onStart?: () => void;
  /** Callback when audio finishes */
  onEnd?: () => void;
}

interface QueueItem {
  text: string;
  options: SpeakOptions;
}

export function usePantherVoice(defaultOptions: SpeakOptions = {}) {
  const {
    voiceKey: defaultVoiceKey = "panther",
    personality: defaultPersonality = "calm_intense",
  } = defaultOptions;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const isPlayingRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);

  const [speaking, setSpeaking] = useState(false);
  const [amplitude, setAmplitude] = useState(0);
  const [currentPersonality, setCurrentPersonality] = useState<PersonalityKey>(defaultPersonality);

  const stopAnalysis = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setAmplitude(0);
  }, []);

  const startAnalysis = useCallback((audio: HTMLAudioElement) => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      if (!analyserRef.current) {
        analyserRef.current = ctx.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.connect(ctx.destination);
      }
      if (sourceRef.current) {
        try { sourceRef.current.disconnect(); } catch {}
      }
      const source = ctx.createMediaElementSource(audio);
      source.connect(analyserRef.current);
      sourceRef.current = source;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAmplitude(avg / 255);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);
    } catch {
      // AudioContext may fail in some environments — silently ignore
    }
  }, []);

  const playText = useCallback(async (text: string, opts: SpeakOptions = {}) => {
    const voiceKey = opts.voiceKey || defaultVoiceKey;
    const personality = opts.personality || defaultPersonality;
    const useStream = text.length > 80;

    setCurrentPersonality(personality);
    setSpeaking(true);
    isPlayingRef.current = true;
    opts.onStart?.();

    const endpoint = useStream ? "/api/voice/speak/stream" : "/api/voice/speak";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 800), voiceKey, personality }),
      });

      if (!res.ok) throw new Error(`TTS ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.crossOrigin = "anonymous";
      audioRef.current = audio;

      startAnalysis(audio);

      const onDone = () => {
        setSpeaking(false);
        isPlayingRef.current = false;
        stopAnalysis();
        URL.revokeObjectURL(url);
        audioRef.current = null;
        opts.onEnd?.();
        const next = queueRef.current.shift();
        if (next) playText(next.text, next.options);
      };

      audio.onended = onDone;
      audio.onerror = onDone;
      await audio.play();
    } catch {
      // Fallback to browser TTS
      if (window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(text.slice(0, 300));
        utt.rate = personality === "drill_sergeant" ? 1.1 : personality === "recovery" ? 0.85 : 0.92;
        utt.pitch = personality === "drill_sergeant" ? 1.1 : personality === "recovery" ? 0.75 : 0.85;
        utt.volume = 1;
        utt.onend = () => {
          setSpeaking(false);
          isPlayingRef.current = false;
          opts.onEnd?.();
          const next = queueRef.current.shift();
          if (next) playText(next.text, next.options);
        };
        window.speechSynthesis.speak(utt);
      } else {
        setSpeaking(false);
        isPlayingRef.current = false;
        opts.onEnd?.();
      }
    }
  }, [defaultVoiceKey, defaultPersonality, startAnalysis, stopAnalysis]);

  const speak = useCallback((text: string, opts: SpeakOptions = {}) => {
    if (!text?.trim()) return;
    const interrupt = opts.interrupt ?? true;

    if (interrupt) {
      queueRef.current = [];
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      if (window.speechSynthesis?.speaking) window.speechSynthesis.cancel();
      stopAnalysis();
      playText(text, opts);
    } else {
      if (isPlayingRef.current) {
        queueRef.current.push({ text, options: opts });
      } else {
        playText(text, opts);
      }
    }
  }, [playText, stopAnalysis]);

  const stop = useCallback(() => {
    queueRef.current = [];
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (window.speechSynthesis?.speaking) window.speechSynthesis.cancel();
    stopAnalysis();
    setSpeaking(false);
    isPlayingRef.current = false;
  }, [stopAnalysis]);

  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  return { speak, stop, speaking, amplitude, currentPersonality };
}
