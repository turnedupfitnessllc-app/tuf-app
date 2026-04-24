/**
 * MovementCueDisplay — Video Awareness & Movement Display System
 *
 * Shows real-time phase-by-phase movement cues during a workout set.
 * Designed to sit below the exercise video in WorkoutPlayer.
 *
 * Features:
 *   - Phase indicator (setup → brace → descent → bottom → ascent → lockout)
 *   - Active cue text with priority color coding
 *   - Tap-to-expand for full coaching detail
 *   - Critical cue flash (red border pulse)
 *   - Focus area indicator ("watch your knees", "bar path", etc.)
 *   - Rep tempo display
 *   - Breathing pattern reminder
 *
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */
import { useState, useEffect, useCallback } from "react";
import {
  getCuesForExercise,
  getCriticalCues,
  getCuesForPhase,
  type MovementCue,
  type MovementPhase,
  type ExerciseCueSet,
} from "@shared/movementCues";

// ─── Phase cycle order ────────────────────────────────────────────────────────
const PHASE_ORDER: MovementPhase[] = [
  "setup",
  "brace",
  "descent",
  "bottom",
  "ascent",
  "lockout",
  "reset",
];

const PHASE_LABELS: Record<MovementPhase, string> = {
  setup:     "SETUP",
  brace:     "BRACE",
  descent:   "DOWN",
  bottom:    "HOLD",
  ascent:    "DRIVE",
  lockout:   "LOCK",
  reset:     "RESET",
  breathing: "BREATHE",
};

const PHASE_COLORS: Record<MovementPhase, string> = {
  setup:     "#4a9eff",
  brace:     "#C8973A",
  descent:   "#FF6600",
  bottom:    "#ef4444",
  ascent:    "#FF6600",
  lockout:   "#22c55e",
  reset:     "#4a9eff",
  breathing: "#a78bfa",
};

const PRIORITY_COLORS: Record<string, string> = {
  critical:  "#ef4444",
  important: "#FF6600",
  coaching:  "rgba(255,255,255,0.7)",
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface MovementCueDisplayProps {
  /** Exercise ID from panther-library (e.g. "squat_001") or a plain name */
  exerciseId: string;
  exerciseName?: string;
  /** Current rep count — used to auto-advance phases */
  repCount: number;
  /** Whether a set is actively in progress */
  isActive: boolean;
  /** Called when user taps the focus area chip */
  onFocusAreaTap?: (area: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MovementCueDisplay({
  exerciseId,
  exerciseName,
  repCount,
  isActive,
  onFocusAreaTap,
}: MovementCueDisplayProps) {
  const [cueSet, setCueSet] = useState<ExerciseCueSet | null>(null);
  const [currentPhase, setCurrentPhase] = useState<MovementPhase>("setup");
  const [activeCue, setActiveCue] = useState<MovementCue | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [criticalFlash, setCriticalFlash] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);

  // Load cues for this exercise
  useEffect(() => {
    // Try exact match first, then fuzzy by name
    const found = getCuesForExercise(exerciseId);
    setCueSet(found);
    setCurrentPhase("setup");
    setPhaseIdx(0);
  }, [exerciseId]);

  // Pick the best cue for the current phase
  const pickCue = useCallback((cs: ExerciseCueSet, phase: MovementPhase): MovementCue | null => {
    const phaseCues = getCuesForPhase(cs.exercise_id, phase);
    if (phaseCues.length === 0) {
      // Fall back to critical cues
      const critical = getCriticalCues(cs.exercise_id);
      return critical[0] ?? null;
    }
    // Prefer critical, then important, then coaching
    return (
      phaseCues.find(c => c.priority === "critical") ??
      phaseCues.find(c => c.priority === "important") ??
      phaseCues[0]
    );
  }, []);

  // Auto-advance phase on every rep
  useEffect(() => {
    if (!cueSet || !isActive || repCount === 0) return;
    // Cycle through phases: each rep advances one phase
    const availablePhases = PHASE_ORDER.filter(p =>
      getCuesForPhase(cueSet.exercise_id, p).length > 0
    );
    if (availablePhases.length === 0) return;
    const nextIdx = repCount % availablePhases.length;
    const nextPhase = availablePhases[nextIdx];
    setCurrentPhase(nextPhase);
    setPhaseIdx(nextIdx);
    const cue = pickCue(cueSet, nextPhase);
    setActiveCue(cue);
    if (cue?.priority === "critical") {
      setCriticalFlash(true);
      setTimeout(() => setCriticalFlash(false), 1200);
    }
    setExpanded(false);
  }, [repCount, cueSet, isActive, pickCue]);

  // On first load, show setup cue
  useEffect(() => {
    if (!cueSet) return;
    const cue = pickCue(cueSet, "setup");
    setActiveCue(cue);
  }, [cueSet, pickCue]);

  // Manual phase tap
  function handlePhaseTap(phase: MovementPhase) {
    if (!cueSet) return;
    setCurrentPhase(phase);
    const cue = pickCue(cueSet, phase);
    setActiveCue(cue);
    setExpanded(false);
  }

  if (!cueSet && !exerciseName) return null;

  const availablePhases = cueSet
    ? PHASE_ORDER.filter(p => getCuesForPhase(cueSet.exercise_id, p).length > 0)
    : [];

  const phaseColor = PHASE_COLORS[currentPhase] ?? "#FF6600";

  return (
    <div style={{
      background: "#0a0a0a",
      borderTop: `2px solid ${phaseColor}`,
      padding: "12px 16px",
      transition: "border-color 0.3s ease",
    }}>
      {/* ── Header row ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.35)",
          }}>
            MOVEMENT CUES
          </div>
          {cueSet?.rep_tempo && (
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.06)",
              borderRadius: 4, padding: "2px 6px",
            }}>
              {cueSet.rep_tempo}
            </div>
          )}
        </div>
        {cueSet?.breathing_pattern && (
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
            color: "#a78bfa",
          }}>
            🫁 {cueSet.breathing_pattern}
          </div>
        )}
      </div>

      {/* ── Phase selector pills ── */}
      {availablePhases.length > 0 && (
        <div style={{ display: "flex", gap: 5, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
          {availablePhases.map(phase => (
            <button
              key={phase}
              onClick={() => handlePhaseTap(phase)}
              style={{
                flexShrink: 0,
                padding: "4px 10px",
                borderRadius: 20,
                border: "1px solid",
                fontSize: 9,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                letterSpacing: "0.12em",
                cursor: "pointer",
                transition: "all 0.15s",
                background: currentPhase === phase ? PHASE_COLORS[phase] : "transparent",
                borderColor: currentPhase === phase ? PHASE_COLORS[phase] : "rgba(255,255,255,0.12)",
                color: currentPhase === phase ? "#fff" : "rgba(255,255,255,0.35)",
              }}
            >
              {PHASE_LABELS[phase]}
            </button>
          ))}
        </div>
      )}

      {/* ── Active cue card ── */}
      {activeCue ? (
        <div
          onClick={() => setExpanded(e => !e)}
          style={{
            background: criticalFlash
              ? "rgba(239,68,68,0.12)"
              : "rgba(255,255,255,0.04)",
            border: `1px solid ${criticalFlash ? "#ef4444" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 12,
            padding: "12px 14px",
            cursor: "pointer",
            transition: "border-color 0.3s, background 0.3s",
          }}
        >
          {/* Priority badge + cue text */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", flexShrink: 0, marginTop: 5,
              background: PRIORITY_COLORS[activeCue.priority],
            }} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 20, letterSpacing: "0.05em",
                color: "#fff", lineHeight: 1.1,
              }}>
                {activeCue.text}
              </div>
              {activeCue.focus_area && (
                <button
                  onClick={e => { e.stopPropagation(); onFocusAreaTap?.(activeCue.focus_area!); }}
                  style={{
                    marginTop: 6,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                    color: phaseColor,
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                  }}
                >
                  👁 FOCUS: {activeCue.focus_area.toUpperCase()}
                </button>
              )}
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.25)",
              marginTop: 2,
            }}>
              {expanded ? "▲" : "▼"}
            </div>
          </div>

          {/* Expanded detail */}
          {expanded && activeCue.detail && (
            <div style={{
              marginTop: 10, paddingTop: 10,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13, color: "rgba(255,255,255,0.55)",
              lineHeight: 1.5, letterSpacing: "0.02em",
            }}>
              {activeCue.detail}
            </div>
          )}

          {expanded && activeCue.timing && (
            <div style={{
              marginTop: 6,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.3)",
            }}>
              ⏱ {activeCue.timing.toUpperCase()}
            </div>
          )}

          {expanded && activeCue.error_flag && (
            <div style={{
              marginTop: 6, padding: "6px 10px",
              borderRadius: 8, background: "rgba(239,68,68,0.08)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
              color: "#ef4444",
            }}>
              ⚠ PREVENTS: {activeCue.error_flag.replace(/_/g, " ").toUpperCase()}
            </div>
          )}
        </div>
      ) : (
        /* No cues for this exercise — show Panther focus note */
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12, padding: "12px 14px",
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 12, color: "rgba(255,255,255,0.35)",
          }}>
            {cueSet?.panther_focus
              ? `🐾 ${cueSet.panther_focus}`
              : `🐾 FOCUS: ${exerciseName ?? exerciseId}`}
          </div>
        </div>
      )}

      {/* ── Panther focus line ── */}
      {cueSet?.panther_focus && activeCue && (
        <div style={{
          marginTop: 8,
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 9, fontWeight: 700, letterSpacing: "0.15em",
          color: "rgba(255,255,255,0.2)",
        }}>
          🐾 {cueSet.panther_focus}
        </div>
      )}
    </div>
  );
}
