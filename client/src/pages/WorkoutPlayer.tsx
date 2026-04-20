/**
 * TUF WORKOUT PLAYER
 * Components: exercise_video, rep_counter, timer, panther_voice_prompt, form_feedback_indicator
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { haptics } from "@/utils/haptics";
import {
  EXERCISE_DATABASE, PANTHER_VOICE, getPantherVoiceLine, generateWorkout,
  detectFormDrop, isHighRisk, getRecoverySubstitution, getPantherRealtimeCue,
  regressExercise, injectCorrective, calculateMovementQuality,
  type RiskProfile,
} from "@shared/panther-library";
import type { Exercise } from "@shared/panther-library";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";

// Map exercise IDs to CDN videos where available
const VIDEO_MAP: Record<string, string> = {
  squat_001: `${CDN}/jarvis-squat_29894acb.mp4`,
  squat_002: `${CDN}/jarvis-squat_29894acb.mp4`,
  squat_003: `${CDN}/jarvis-strength-montage_89d7eee5.mp4`,
  locomotion_005: `${CDN}/jarvis-high-knees_39ea0db8.mp4`,
  locomotion_006: `${CDN}/jarvis-sprint-stance_a110b221.mp4`,
  lunge_001: `${CDN}/jarvis-lunge-stretch_5b0b7c7f.mp4`,
  lunge_003: `${CDN}/jarvis-lunge-stretch_5b0b7c7f.mp4`,
};

type FormScore = "excellent" | "good" | "check_form" | null;

const FORM_COLORS: Record<string, string> = {
  excellent: "#00CC66",
  good: "#FF6600",
  check_form: "#FF4444",
};

const FORM_LABELS: Record<string, string> = {
  excellent: "EXCELLENT FORM",
  good: "GOOD — MINOR ADJUSTMENTS",
  check_form: "CHECK YOUR FORM",
};

export default function WorkoutPlayer() {
  const [, navigate] = useLocation();

  // Generate a quick workout on mount
  const [exercises] = useState<Exercise[]>(() => {
    const stored = localStorage.getItem("tuf_workout_exercises");
    if (stored) {
      try { return JSON.parse(stored); } catch { /* fall through */ }
    }
    return generateWorkout({ goal: "fat_loss", difficulty: "intermediate", equipment: ["bodyweight", "dumbbell"], exerciseCount: 5 });
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [reps, setReps] = useState(0);
  const [sets, setSets] = useState(1);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [voiceLine, setVoiceLine] = useState<string>("Lock in.");
  const [formScore, setFormScore] = useState<FormScore>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Risk Detection + Adaptive Engine State ───────────────────────────────────
  const [repScores, setRepScores] = useState<number[]>([]);
  const [fatigue, setFatigue] = useState(0);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [riskWarning, setRiskWarning] = useState<string | null>(null);
  const riskWarningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [correctivesInjected, setCorrectivesInjected] = useState<string[]>([]);
  const [regressedExercise, setRegressedExercise] = useState<string | null>(null);
  const [movementQuality, setMovementQuality] = useState<number | null>(null);

  const currentEx = exercises[currentIdx];

  // Timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  // Rest timer
  useEffect(() => {
    if (restTimer !== null && restTimer > 0) {
      restRef.current = setInterval(() => setRestTimer(t => t !== null ? t - 1 : null), 1000);
    } else if (restTimer === 0) {
      setRestTimer(null);
      setVoiceLine(getPantherVoiceLine("start"));
    }
    return () => { if (restRef.current) clearInterval(restRef.current); };
  }, [restTimer]);

  // Start timer on mount
  useEffect(() => {
    setTimerRunning(true);
    setVoiceLine(getPantherVoiceLine("start"));
  }, []);

  // Simulate form feedback every 8 seconds + full risk detection pipeline
  useEffect(() => {
    const scores: FormScore[] = ["excellent", "good", "check_form"];
    const interval = setInterval(() => {
      const score = scores[Math.floor(Math.random() * scores.length)];
      setFormScore(score);

      const numericScore = score === "excellent" ? 85 + Math.random() * 15
                         : score === "good"      ? 70 + Math.random() * 15
                         :                         50 + Math.random() * 15;
      const rounded = Math.round(numericScore);

      setRepScores(prev => {
        const next = [...prev, rounded];
        const newFatigue = Math.min(100, Math.round((next.length / 30) * 100));
        setFatigue(newFatigue);

        // Movement quality (7-day rolling — simulated here as session rolling)
        setMovementQuality(calculateMovementQuality(next));

        const profile: RiskProfile = { fatigue_level: newFatigue, form_score: rounded };

        // Corrective injection
        if (rounded < 70) {
          const correctives = injectCorrective({ form_score: rounded });
          setCorrectivesInjected(correctives);
        }

        // Exercise regression on form drop
        if (detectFormDrop(next)) {
          const regressed = regressExercise(currentEx?.id ?? "");
          if (regressed !== currentEx?.id) setRegressedExercise(regressed);
        }

        // Panther real-time cue
        const cue = getPantherRealtimeCue({
          repScores: next,
          fatigue: newFatigue,
          formScore: rounded,
          kneeCollapse: score === "check_form" && Math.random() > 0.6,
          backRounding: score === "check_form" && Math.random() > 0.7,
          setCompleted: false,
        });

        if (cue) {
          setVoiceLine(cue);
          setRiskWarning(cue);
          haptics.medium();
          if (riskWarningTimer.current) clearTimeout(riskWarningTimer.current);
          riskWarningTimer.current = setTimeout(() => setRiskWarning(null), 4000);
        }

        if (isHighRisk(profile)) {
          setRecoveryMode(true);
          haptics.heavy();
        }

        return next;
      });

      if (score === "check_form") haptics.medium();
    }, 8000);
    return () => {
      clearInterval(interval);
      if (riskWarningTimer.current) clearTimeout(riskWarningTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEx?.id]);

  const handleRep = useCallback(() => {
    haptics.light();
    setReps(r => {
      const next = r + 1;
      if (next % 5 === 0) setVoiceLine(getPantherVoiceLine("during"));
      return next;
    });
    setTotalXP(xp => xp + 2);
    setFatigue(f => Math.min(100, f + 1.5));
  }, []);

  const handleSetComplete = useCallback(() => {
    haptics.medium();
    const targetSets = parseInt(currentEx?.volume.sets?.split("-")[0] || "3");
    if (sets >= targetSets) {
      // Move to next exercise
      if (currentIdx < exercises.length - 1) {
        setVoiceLine(getPantherVoiceLine("finish"));
        setRestTimer(45);
        setTimeout(() => {
          setCurrentIdx(i => i + 1);
          setSets(1);
          setReps(0);
          setFormScore(null);
          setVoiceLine(getPantherVoiceLine("start"));
        }, 45000);
      } else {
        // Workout complete
        setTimerRunning(false);
        setShowComplete(true);
        setVoiceLine("You earned that.");
        haptics.heavy();
      }
    } else {
      setSets(s => s + 1);
      setReps(0);
      setRestTimer(45);
      setVoiceLine(getPantherVoiceLine("during"));
    }
  }, [sets, currentIdx, exercises.length, currentEx]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (!currentEx) return null;

  const videoUrl = VIDEO_MAP[currentEx.id] || `${CDN}/jarvis-squat_29894acb.mp4`;
  const targetSets = parseInt(currentEx.volume.sets?.split("-")[0] || "3");
  const targetReps = currentEx.volume.reps || currentEx.volume.duration || "—";
  const recoverySubstitution = recoveryMode ? getRecoverySubstitution(currentEx.pattern) : null;
  const formDropDetected = detectFormDrop(repScores);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080808", color: "#fff", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes repPulse { 0%{transform:scale(1)} 50%{transform:scale(1.08)} 100%{transform:scale(1)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .rep-btn { transition: transform 0.1s ease; }
        .rep-btn:active { transform: scale(0.94); animation: repPulse 0.2s ease; }
        .form-badge { animation: fadeIn 0.3s ease; }
      `}</style>

      {/* ─── HEADER ─── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #1A1A1A" }}>
        <button onClick={() => navigate("/move")} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 22 }}>✕</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 3, color: "#888" }}>EXERCISE {currentIdx + 1} OF {exercises.length}</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 1 }}>{currentEx.name}</div>
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#FF6600" }}>{formatTime(timer)}</div>
      </div>

      {/* ─── RISK WARNING BANNER ─── */}
      {riskWarning && (
        <div style={{
          background: "linear-gradient(90deg, rgba(139,0,0,0.95), rgba(180,0,0,0.95))",
          borderBottom: "2px solid #FF4444",
          padding: "10px 20px",
          display: "flex", alignItems: "center", gap: 12,
          animation: "fadeIn 0.3s ease",
        }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 2, color: "#FF9999" }}>PANTHER ALERT</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#fff", letterSpacing: 1 }}>{riskWarning}</div>
          </div>
          {movementQuality !== null && (
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.4)" }}>MOVEMENT QUALITY</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: movementQuality >= 70 ? "#00CC66" : "#FF4444" }}>{movementQuality}</div>
            </div>
          )}
        </div>
      )}

      {/* ─── RECOVERY MODE BANNER ─── */}
      {recoveryMode && (
        <div style={{
          background: "linear-gradient(90deg, rgba(0,80,0,0.95), rgba(0,120,0,0.95))",
          borderBottom: "2px solid #00CC66",
          padding: "10px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🛡️</span>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 2, color: "#00FF88" }}>RECOVERY MODE ACTIVE</div>
              {recoverySubstitution && (
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.7)", letterSpacing: 1 }}>
                  Substituted: {recoverySubstitution}
                </div>
              )}
              {regressedExercise && regressedExercise !== currentEx.id && (
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(0,255,136,0.7)", letterSpacing: 1 }}>
                  Regressed to: {regressedExercise.replace(/_/g, " ")}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => { setRecoveryMode(false); setRegressedExercise(null); }}
            style={{ background: "none", border: "1px solid #00CC66", borderRadius: 6, color: "#00CC66", fontSize: 11, letterSpacing: 2, padding: "4px 10px", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            DISMISS
          </button>
        </div>
      )}

      {/* ─── CORRECTIVE INJECTION BANNER ─── */}
      {correctivesInjected.length > 0 && formDropDetected && (
        <div style={{
          background: "rgba(200,151,58,0.12)",
          borderBottom: "1px solid rgba(200,151,58,0.3)",
          padding: "8px 20px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 14 }}>🦴</span>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#C8973A", letterSpacing: 1 }}>
            Correctives queued: {correctivesInjected.slice(0, 3).map(c => c.replace(/_/g, " ")).join(" · ")}
          </div>
        </div>
      )}

      {/* ─── EXERCISE VIDEO ─── */}
      <div style={{ position: "relative", backgroundColor: "#000", aspectRatio: "16/9" }}>
        <video
          ref={videoRef}
          src={videoUrl}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Form feedback indicator (BOA) */}
        {formScore && (
          <div className="form-badge" style={{ position: "absolute", top: 12, right: 12, padding: "6px 12px", borderRadius: 100, backgroundColor: `${FORM_COLORS[formScore]}20`, border: `1px solid ${FORM_COLORS[formScore]}60`, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: FORM_COLORS[formScore] }}>
            {FORM_LABELS[formScore]}
          </div>
        )}
        {/* Rest timer overlay */}
        {restTimer !== null && (
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: 4, color: "#888", marginBottom: 8 }}>REST</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, color: "#FF6600", lineHeight: 1 }}>{restTimer}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#555", marginTop: 8 }}>NEXT: {exercises[currentIdx + 1]?.name || "FINISH"}</div>
          </div>
        )}
      </div>

      {/* ─── PANTHER VOICE PROMPT ─── */}
      <div style={{ backgroundColor: "#111", borderBottom: "1px solid #1A1A1A", padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>🐆</span>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "#C8973A", letterSpacing: 1, fontStyle: "italic" }}>"{voiceLine}"</div>
      </div>

      {/* ─── STATS ROW ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, backgroundColor: "#1A1A1A" }}>
        {[
          { label: "REPS", value: reps, color: "#FF6600" },
          { label: `SET ${sets} / ${targetSets}`, value: targetReps, color: "#C8973A" },
          { label: "XP EARNED", value: `+${totalXP}`, color: "#00CC66" },
        ].map(stat => (
          <div key={stat.label} style={{ backgroundColor: "#111", padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 2, color: "#555", marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ─── REP COUNTER BUTTON ─── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", gap: 16 }}>
        <button
          className="rep-btn"
          onClick={handleRep}
          style={{ width: 160, height: 160, borderRadius: "50%", backgroundColor: "#8B0000", border: "4px solid #FF6600", fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: "#C8973A", cursor: "pointer", boxShadow: "0 0 40px rgba(139,0,0,0.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}
        >
          <span style={{ fontSize: 36 }}>+1</span>
          <span style={{ fontSize: 12, color: "#FF6600" }}>TAP = REP</span>
        </button>

        <button
          onClick={handleSetComplete}
          style={{ padding: "16px 40px", borderRadius: 8, backgroundColor: "#1A1A1A", border: "1px solid #333", fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, color: "#888", cursor: "pointer" }}
        >
          SET COMPLETE →
        </button>
      </div>

      {/* ─── EXERCISE QUEUE ─── */}
      <div style={{ borderTop: "1px solid #1A1A1A", padding: "12px 20px" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 3, color: "#555", marginBottom: 8 }}>UP NEXT</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {exercises.map((ex, i) => (
            <div key={ex.id} style={{ flexShrink: 0, padding: "8px 12px", borderRadius: 8, backgroundColor: i === currentIdx ? "#8B0000" : i < currentIdx ? "#0A0A0A" : "#111", border: `1px solid ${i === currentIdx ? "#FF6600" : "#222"}`, opacity: i < currentIdx ? 0.4 : 1 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, color: i === currentIdx ? "#C8973A" : "#888", letterSpacing: 1 }}>{ex.name}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#555" }}>{ex.volume.sets} sets</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── WORKOUT COMPLETE OVERLAY ─── */}
      {showComplete && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(0,0,0,0.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: "#C8973A", letterSpacing: 3, textAlign: "center", marginBottom: 8 }}>WORKOUT COMPLETE</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, color: "#FF6600", marginBottom: 32 }}>🐆 "You earned that."</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 }}>
            {[
              { label: "EXERCISES", value: exercises.length },
              { label: "TOTAL REPS", value: reps },
              { label: "XP EARNED", value: totalXP },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center", backgroundColor: "#111", borderRadius: 12, padding: "16px 12px" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#FF6600" }}>{s.value}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 2, color: "#555" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/progress")}
            style={{ width: "100%", maxWidth: 320, padding: "18px 24px", borderRadius: 8, backgroundColor: "#8B0000", border: "none", fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, color: "#C8973A", cursor: "pointer" }}
          >
            VIEW PROGRESS →
          </button>
          <button
            onClick={() => navigate("/move")}
            style={{ marginTop: 12, background: "none", border: "none", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: 2, color: "#555", cursor: "pointer" }}
          >
            BACK TO LIBRARY
          </button>
        </div>
      )}
    </div>
  );
}
