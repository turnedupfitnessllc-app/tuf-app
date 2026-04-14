/**
 * StreakCard — Panther System
 * Displays current streak with color-coded intensity.
 * Web equivalent of the React Native StreakCard component.
 *
 * Color logic:
 *   streak >= 14 → #FF2D2D (apex red)
 *   streak >= 7  → #FF5A5A (hunter red)
 *   streak >= 3  → #FF8888 (building)
 *   default      → #FFFFFF (starting)
 */

import React from "react";

interface StreakCardProps {
  streak: number;
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  style?: React.CSSProperties;
}

export default function StreakCard({
  streak,
  size = "md",
  showSubtitle = true,
  style,
}: StreakCardProps) {
  const getColor = () => {
    if (streak >= 14) return "#FF2D2D";
    if (streak >= 7)  return "#FF5A5A";
    if (streak >= 3)  return "#FF8888";
    return "#FFFFFF";
  };

  const getLabel = () => {
    if (streak >= 14) return "APEX DISCIPLINE";
    if (streak >= 7)  return "HUNTER MODE";
    if (streak >= 3)  return "MOMENTUM BUILDING";
    return "START YOUR STREAK";
  };

  const fontSize = size === "lg" ? 40 : size === "sm" ? 22 : 32;
  const subtitleSize = size === "lg" ? 13 : size === "sm" ? 10 : 11;
  const color = getColor();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: size === "sm" ? "12px 16px" : "20px 24px",
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize,
          color,
          letterSpacing: "0.04em",
          lineHeight: 1,
          textShadow: streak >= 7 ? `0 0 20px ${color}66` : "none",
          transition: "color 0.4s ease, text-shadow 0.4s ease",
        }}
      >
        🔥 {streak} DAY STREAK
      </div>

      {showSubtitle && (
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: subtitleSize,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: streak >= 3 ? color : "rgba(255,255,255,0.35)",
            marginTop: 4,
            opacity: 0.8,
          }}
        >
          {getLabel()}
        </div>
      )}

      {showSubtitle && (
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 10,
            color: "rgba(255,255,255,0.25)",
            marginTop: 2,
          }}
        >
          Consistency builds evolution
        </div>
      )}
    </div>
  );
}
