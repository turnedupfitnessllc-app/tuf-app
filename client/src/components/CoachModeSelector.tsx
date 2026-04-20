import React from "react";
import { CoachMode, COACH_MODE_CONFIGS } from "@shared/panther-library";

interface CoachModeSelectorProps {
  currentMode: CoachMode;
  preferredMode?: CoachMode;
  onSelect: (mode: CoachMode) => void;
  compact?: boolean;
}

const MODES: CoachMode[] = ["intensity", "technical", "motivational", "panther"];

export default function CoachModeSelector({
  currentMode,
  preferredMode,
  onSelect,
  compact = false,
}: CoachModeSelectorProps) {
  if (compact) {
    return (
      <div className="flex gap-2 flex-wrap">
        {MODES.map(mode => {
          const cfg = COACH_MODE_CONFIGS[mode];
          const isActive = mode === currentMode;
          return (
            <button
              key={mode}
              onClick={() => onSelect(mode)}
              className="relative px-3 py-1.5 rounded text-xs font-bold tracking-widest transition-all duration-200"
              style={{
                background: isActive ? cfg.color + "22" : "transparent",
                border: `1px solid ${isActive ? cfg.color : "#333"}`,
                color: isActive ? cfg.color : "#666",
              }}
            >
              {cfg.icon} {cfg.label}
              {mode === preferredMode && mode !== currentMode && (
                <span
                  className="absolute -top-1 -right-1 text-[8px] px-1 rounded-full font-bold"
                  style={{ background: cfg.color, color: "#000" }}
                >
                  ★
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs tracking-widest" style={{ color: "#666", fontFamily: "'Barlow Condensed', sans-serif" }}>
          COACH MODE
        </p>
        {preferredMode && (
          <p className="text-xs" style={{ color: "#555" }}>
            Preferred: <span style={{ color: COACH_MODE_CONFIGS[preferredMode].color }}>{preferredMode.toUpperCase()}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {MODES.map(mode => {
          const cfg = COACH_MODE_CONFIGS[mode];
          const isActive = mode === currentMode;
          const isPreferred = mode === preferredMode;

          return (
            <button
              key={mode}
              onClick={() => onSelect(mode)}
              className="relative p-3 rounded-lg text-left transition-all duration-200 active:scale-95"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${cfg.color}18, ${cfg.color}08)`
                  : "#111111",
                border: `1px solid ${isActive ? cfg.color : "#222"}`,
                boxShadow: isActive ? `0 0 12px ${cfg.color}30` : "none",
              }}
            >
              {/* Preferred badge */}
              {isPreferred && !isActive && (
                <span
                  className="absolute top-1.5 right-1.5 text-[8px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: cfg.color + "33", color: cfg.color, border: `1px solid ${cfg.color}55` }}
                >
                  PREFERRED
                </span>
              )}

              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{cfg.icon}</span>
                <span
                  className="text-xs font-bold tracking-widest"
                  style={{
                    color: isActive ? cfg.color : "#888",
                    fontFamily: "'Bebas Neue', sans-serif",
                    letterSpacing: "0.12em",
                  }}
                >
                  {cfg.label}
                </span>
              </div>

              <p
                className="text-[10px] leading-tight"
                style={{ color: isActive ? "#aaa" : "#555" }}
              >
                {cfg.description}
              </p>

              {/* Active indicator */}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg"
                  style={{ background: cfg.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Current mode cue preview */}
      <div
        className="mt-3 p-2 rounded text-center text-xs italic"
        style={{
          background: COACH_MODE_CONFIGS[currentMode].color + "0a",
          border: `1px solid ${COACH_MODE_CONFIGS[currentMode].color}22`,
          color: COACH_MODE_CONFIGS[currentMode].color,
          fontFamily: "'Barlow Condensed', sans-serif",
        }}
      >
        "{COACH_MODE_CONFIGS[currentMode].description}"
      </div>
    </div>
  );
}
