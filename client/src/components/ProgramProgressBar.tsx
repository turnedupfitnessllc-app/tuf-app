/**
 * ProgramProgressBar — Panther System
 * 30-day progress bar with phase milestone icons.
 *
 * Milestones:
 *   [🐾] Day 1  — Start
 *   [🔥] Day 7  — Stability unlocked
 *   [🐆] Day 14 — Strength unlocked
 *   [⚡] Day 21 — Explosion unlocked
 *   [👑] Day 30 — Evolution / Apex
 *
 * Web equivalent of the React Native ProgressBar component.
 */

import React from "react";

interface ProgramProgressBarProps {
  day: number;           // current day (1-30)
  totalDone?: number;    // completed sessions count
  style?: React.CSSProperties;
}

const MILESTONES = [
  { day: 1,  icon: "🐾", label: "Start" },
  { day: 7,  icon: "🔥", label: "Stability" },
  { day: 14, icon: "🐆", label: "Strength" },
  { day: 21, icon: "⚡", label: "Explosion" },
  { day: 30, icon: "👑", label: "Evolution" },
];

export default function ProgramProgressBar({
  day,
  totalDone = 0,
  style,
}: ProgramProgressBarProps) {
  const progress = Math.min((Math.max(totalDone, day - 1) / 30) * 100, 100);

  return (
    <div style={{ width: "100%", ...style }}>
      {/* Milestone icons row */}
      <div style={{ position: "relative", height: 32, marginBottom: 6 }}>
        {MILESTONES.map((m) => {
          const pct = ((m.day - 1) / 29) * 100;
          const reached = totalDone >= m.day || day > m.day;
          return (
            <div
              key={m.day}
              style={{
                position: "absolute",
                left: `${pct}%`,
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  filter: reached ? "none" : "grayscale(100%) opacity(0.3)",
                  transition: "filter 0.4s ease",
                }}
              >
                {m.icon}
              </span>
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: reached ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)",
                }}
              >
                {m.label.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress track */}
      <div
        style={{
          height: 8,
          backgroundColor: "rgba(255,255,255,0.06)",
          borderRadius: 10,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            borderRadius: 10,
            background: "linear-gradient(90deg, #FF6600, #FF2D2D)",
            transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: progress > 0 ? "0 0 8px rgba(255,102,0,0.4)" : "none",
          }}
        />
      </div>

      {/* Day label */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 4,
        }}
      >
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          Day {Math.max(day, 1)} of 30
        </span>
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          {Math.round(progress)}% complete
        </span>
      </div>
    </div>
  );
}
