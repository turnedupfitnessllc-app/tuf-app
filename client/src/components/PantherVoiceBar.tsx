/**
 * PantherVoiceBar — Persistent floating voice indicator
 *
 * Shows when Panther is speaking:
 * - Animated waveform bars (driven by Web Audio amplitude)
 * - Current personality badge
 * - Tap to stop / mute
 * - Subtle slide-up animation on appear
 *
 * Usage:
 *   const { speak, stop, speaking, amplitude } = usePantherVoice();
 *   <PantherVoiceBar speaking={speaking} amplitude={amplitude} onStop={stop} />
 */
import { useEffect, useRef } from "react";
import type { PersonalityKey } from "@/hooks/usePantherVoice";

interface PantherVoiceBarProps {
  speaking: boolean;
  amplitude: number;          // 0–1 from Web Audio analyser
  onStop: () => void;
  personality?: PersonalityKey;
  label?: string;             // Optional override text shown while speaking
}

const PERSONALITY_LABELS: Record<PersonalityKey, { label: string; color: string }> = {
  calm_intense:   { label: "PANTHER",      color: "#f97316" }, // orange
  motivational:   { label: "MOTIVATED",    color: "#22c55e" }, // green
  drill_sergeant: { label: "DRILL MODE",   color: "#ef4444" }, // red
  recovery:       { label: "RECOVERY",     color: "#60a5fa" }, // blue
  technical:      { label: "TECHNICAL",    color: "#a78bfa" }, // purple
};

const BAR_COUNT = 12;

export default function PantherVoiceBar({
  speaking,
  amplitude,
  onStop,
  personality = "calm_intense",
  label,
}: PantherVoiceBarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ampRef = useRef(amplitude);
  const frameRef = useRef<number | null>(null);

  // Keep ampRef in sync without re-running the animation loop
  useEffect(() => { ampRef.current = amplitude; }, [amplitude]);

  // Canvas waveform animation
  useEffect(() => {
    if (!speaking) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { color } = PERSONALITY_LABELS[personality] || PERSONALITY_LABELS.calm_intense;
    let phase = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const amp = ampRef.current;
      const barW = Math.floor(w / (BAR_COUNT * 2));
      const gap = barW;

      for (let i = 0; i < BAR_COUNT; i++) {
        // Each bar gets a slightly different phase offset for organic wave feel
        const wave = Math.sin(phase + i * 0.6) * 0.5 + 0.5;
        const barH = Math.max(4, (amp * 0.7 + wave * 0.3) * h * 0.85);
        const x = i * (barW + gap) + gap / 2;
        const y = (h - barH) / 2;

        // Gradient per bar
        const grad = ctx.createLinearGradient(x, y, x, y + barH);
        grad.addColorStop(0, color + "cc");
        grad.addColorStop(1, color + "44");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, barW / 2);
        ctx.fill();
      }

      phase += 0.08;
      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [speaking, personality]);

  if (!speaking) return null;

  const { label: personalityLabel, color } = PERSONALITY_LABELS[personality] || PERSONALITY_LABELS.calm_intense;

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full shadow-2xl border border-white/10 backdrop-blur-md"
      style={{
        background: "rgba(0,0,0,0.82)",
        animation: "slideUpFade 0.25s ease-out",
        minWidth: "220px",
      }}
    >
      {/* Pulsing dot */}
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{
          background: color,
          boxShadow: `0 0 8px ${color}`,
          animation: "pulse 1s ease-in-out infinite",
        }}
      />

      {/* Waveform canvas */}
      <canvas
        ref={canvasRef}
        width={120}
        height={28}
        className="flex-shrink-0"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Label */}
      <span
        className="text-xs font-bold tracking-widest flex-1 text-center"
        style={{ color, fontFamily: "monospace" }}
      >
        {label || personalityLabel}
      </span>

      {/* Stop button */}
      <button
        onClick={onStop}
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        style={{ background: "rgba(255,255,255,0.1)" }}
        aria-label="Stop Panther Voice"
      >
        <span className="text-white text-xs">✕</span>
      </button>

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
