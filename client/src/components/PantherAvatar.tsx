/**
 * PantherAvatar — Animated Panther identity component
 * States: idle (breathing), active (glowing eyes), coaching (alert)
 * Used across Home, Correct, and JARVIS screens
 */
import { useEffect, useState } from 'react';

type PantherState = 'idle' | 'active' | 'coaching' | 'complete';
type PantherSize = 'sm' | 'md' | 'lg';

interface PantherAvatarProps {
  state?: PantherState;
  size?: PantherSize;
  message?: string;
  className?: string;
}

const SIZES = {
  sm: { container: 'w-16 h-16', emoji: 'text-4xl' },
  md: { container: 'w-24 h-24', emoji: 'text-5xl' },
  lg: { container: 'w-32 h-32', emoji: 'text-7xl' },
};

export function PantherAvatar({ state = 'idle', size = 'md', message, className = '' }: PantherAvatarProps) {
  const [pulse, setPulse] = useState(false);
  const sz = SIZES[size];

  useEffect(() => {
    if (state === 'idle') {
      // Slow breathing pulse
      const interval = setInterval(() => {
        setPulse(p => !p);
      }, 2000);
      return () => clearInterval(interval);
    }
    if (state === 'active' || state === 'coaching') {
      setPulse(true);
    }
  }, [state]);

  const glowColor = {
    idle: 'rgba(220, 38, 38, 0.15)',
    active: 'rgba(220, 38, 38, 0.5)',
    coaching: 'rgba(245, 166, 35, 0.5)',
    complete: 'rgba(16, 185, 129, 0.5)',
  }[state];

  const scaleClass = {
    idle: pulse ? 'scale-105' : 'scale-100',
    active: 'scale-110',
    coaching: 'scale-105',
    complete: 'scale-110',
  }[state];

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`${sz.container} rounded-full flex items-center justify-center relative transition-all duration-[2000ms] ${scaleClass}`}
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          boxShadow: state !== 'idle' ? `0 0 40px ${glowColor}` : undefined,
        }}
      >
        {/* Outer glow ring */}
        {(state === 'active' || state === 'coaching') && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ background: glowColor }}
          />
        )}

        {/* Panther emoji / icon */}
        <span
          className={`${sz.emoji} select-none transition-all duration-300`}
          role="img"
          aria-label="JARVIS Panther"
        >
          🐆
        </span>

        {/* Eye glow overlay for active state */}
        {state === 'active' && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center pointer-events-none">
            <div className="w-2 h-1 bg-red-500 rounded-full opacity-80 blur-[2px] mr-3 mt-1" />
            <div className="w-2 h-1 bg-red-500 rounded-full opacity-80 blur-[2px] ml-3 mt-1" />
          </div>
        )}
      </div>

      {/* Coaching message bubble */}
      {message && (
        <div className="max-w-[240px] text-center px-4 py-2 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
          "{message}"
        </div>
      )}
    </div>
  );
}
