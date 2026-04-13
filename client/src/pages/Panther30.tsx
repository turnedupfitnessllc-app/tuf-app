/**
 * Panther 30-Day Training System — Session Player
 * 5 phases: Control → Stability → Strength → Explosion → Evolution
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getAnimationForDay } from "@/data/pantherAnimations";

const PHASE_COLORS: Record<string, string> = {
  Control: "#4a9eff",
  Stability: "#C8973A",
  Strength: "#FF4500",
  Explosion: "#ff6b00",
  Evolution: "#22c55e",
};

interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  duration_sec?: number;
  duration_min?: number;
  tempo?: string;
  rest_sec?: number;
  cue?: string;
}

interface ProgramDay {
  day: number;
  phase: string;
  focus: string;
  duration_min: number;
  exercises: Exercise[];
  message: string;
  content_hook: string;
}

export default function Panther30() {
  const [, navigate] = useLocation();
  const [days, setDays] = useState<ProgramDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"overview" | "session">("overview");
  const [activeDay, setActiveDay] = useState<ProgramDay | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [doneDays, setDoneDays] = useState<Set<number>>(() => {
    try {
      const arr: number[] = JSON.parse(localStorage.getItem("tuf_p30_done") || "[]");
      return new Set(arr);
    } catch { return new Set<number>(); }
  });
  const [coaching, setCoaching] = useState<string>("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [activePhase, setActivePhase] = useState<string>("Control");

  useEffect(() => {
    fetch("/api/program/days")
      .then(r => r.json())
      .then(data => { setDays(data.days || data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const phases = ["Control", "Stability", "Strength", "Explosion", "Evolution"];
  const phaseDays = days.filter(d => d.phase === activePhase);

  function startSession(summary: ProgramDay) {
    // Fetch full day data (with exercises) before entering session view
    setCoachLoading(true);
    setCoaching("");
    fetch(`/api/program/day/${summary.day}`)
      .then(r => r.json())
      .then(data => {
        const fullDay = data.day || summary;
        setActiveDay(fullDay);
        setCompleted(new Set());
        setView("session");
        // Fetch Claude coaching
        return fetch("/api/program/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dayNum: fullDay.day }),
        });
      })
      .then(r => r.json())
      .then(d => { setCoaching(d.coaching || ""); setCoachLoading(false); })
      .catch(() => { setCoachLoading(false); });
  }

  function toggleExercise(idx: number) {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }

  function completeSession() {
    if (!activeDay) return;
    const next = new Set(doneDays);
    next.add(activeDay.day);
    setDoneDays(next);
    localStorage.setItem("tuf_p30_done", JSON.stringify(Array.from(next)));
    setView("overview");
  }

  function formatExercise(ex: Exercise): string {
    const parts: string[] = [];
    if (ex.sets) parts.push(`${ex.sets} sets`);
    if (ex.reps) parts.push(`${ex.reps} reps`);
    if (ex.duration_sec) parts.push(`${ex.duration_sec} sec`);
    if (ex.duration_min) parts.push(`${ex.duration_min} min`);
    if (ex.tempo) parts.push(`Tempo: ${ex.tempo}`);
    if (ex.rest_sec) parts.push(`Rest: ${ex.rest_sec}s`);
    return parts.join(" · ");
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>LOADING PROGRAM...</p>
      </div>
    );
  }

  // ── SESSION VIEW ─────────────────────────────────────────────────────────────
  if (view === "session" && activeDay) {
    const color = PHASE_COLORS[activeDay.phase] || "#FF4500";
    const allDone = completed.size === activeDay.exercises.length;
    // Determine animation context for this session
    const anim = getAnimationForDay(
      activeDay.phase,
      activeDay.focus,
      activeDay.exercises[0]?.name?.toLowerCase().replace(/\s+/g, "_")
    );

    return (
      <div style={{ minHeight: "100vh", background: "#080808", paddingBottom: 96 }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
          @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
          @keyframes animGlow { 0%,100%{opacity:0.6} 50%{opacity:1} }
        `}</style>
        <main style={{ maxWidth: 480, margin: "0 auto", padding: "72px 16px 0" }}>
          <button onClick={() => setView("overview")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", marginBottom: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", cursor: "pointer" }}>
            ← BACK
          </button>

          {/* Animation Context Banner */}
          <div style={{
            borderRadius: 14, marginBottom: 14, overflow: "hidden",
            background: anim.gradient,
            border: `1px solid ${color}20`,
            padding: "16px",
            display: "flex", alignItems: "center", gap: 14,
            animation: "animGlow 3s ease-in-out infinite",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: `${color}15`,
              border: `1px solid ${color}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, flexShrink: 0,
            }}>
              {anim.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color, marginBottom: 3 }}>
                PANTHER MODE
              </p>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: "0.06em", color: "#fff", lineHeight: 1 }}>
                {anim.label.toUpperCase()}
              </p>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 3, letterSpacing: "0.04em", fontStyle: "italic" }}>
                {anim.prompt.slice(0, 60)}...
              </p>
            </div>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color, marginBottom: 2 }}>
              DAY {activeDay.day} · {activeDay.phase.toUpperCase()}
            </p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: "0.07em", color: "#fff", lineHeight: 1 }}>
              {activeDay.focus.toUpperCase()}
            </h1>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
              ~{activeDay.duration_min} min · {activeDay.exercises.length} exercises
            </p>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 16 }}>
            <div style={{ height: "100%", borderRadius: 2, background: color, width: `${Math.round((completed.size / activeDay.exercises.length) * 100)}%`, transition: "width 0.4s ease" }} />
          </div>

          {/* Panther coaching */}
          {(coachLoading || coaching) && (
            <div style={{ padding: "14px 16px", borderRadius: 14, background: `${color}10`, border: `1px solid ${color}30`, marginBottom: 14 }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color, marginBottom: 6 }}>PANTHER SAYS</p>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                {coachLoading ? "Loading coaching..." : coaching}
              </p>
            </div>
          )}

          {/* Message */}
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 14 }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>
              "{activeDay.message}"
            </p>
          </div>

          {/* Exercise list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {activeDay.exercises.map((ex, i) => {
              const done = completed.has(i);
              return (
                <button
                  key={i}
                  onClick={() => toggleExercise(i)}
                  style={{
                    padding: "14px 16px", borderRadius: 14, border: "none",
                    background: done ? `${color}12` : "rgba(13,13,13,0.95)",
                    outline: `1px solid ${done ? color + "44" : "rgba(255,255,255,0.07)"}`,
                    display: "flex", alignItems: "center", gap: 12,
                    cursor: "pointer", textAlign: "left",
                    animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
                  }}
                >
                  <div style={{ width: 24, height: 24, borderRadius: 8, background: done ? color : "rgba(255,255,255,0.06)", border: `1px solid ${done ? color : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {done && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, color: done ? "rgba(255,255,255,0.5)" : "#fff", letterSpacing: "0.04em", textDecoration: done ? "line-through" : "none" }}>
                      {ex.name}
                    </p>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: done ? "rgba(255,255,255,0.2)" : color, marginTop: 1 }}>
                      {formatExercise(ex)}
                    </p>
                    {ex.cue && (
                      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3, fontStyle: "italic" }}>
                        {ex.cue}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Complete button */}
          {allDone && (
            <button
              onClick={completeSession}
              style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${color}, ${color}88)`, fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.1em", color: "#fff", cursor: "pointer" }}
            >
              COMPLETE DAY {activeDay.day} +50 XP
            </button>
          )}
        </main>
      </div>
    );
  }

  // ── OVERVIEW ─────────────────────────────────────────────────────────────────
  const totalDone = doneDays.size;
  const currentDay = totalDone + 1;

  return (
    <div style={{ minHeight: "100vh", background: "#080808", paddingBottom: 96 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "72px 16px 0" }}>
        <button onClick={() => navigate("/program")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", marginBottom: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", cursor: "pointer" }}>
          ← PROGRAMS
        </button>

        {/* Header */}
        <div style={{ marginBottom: 16, animation: "fadeUp 0.4s ease forwards" }}>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "#FF4500", marginBottom: 2 }}>PANTHER SYSTEM</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: "0.07em", color: "#fff", lineHeight: 1 }}>30-DAY PROGRAM</h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
            Day {Math.min(currentDay, 30)} of 30 · {totalDone} sessions complete
          </p>
        </div>

        {/* Overall progress */}
        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #FF4500, #22c55e)", width: `${Math.round((totalDone / 30) * 100)}%`, transition: "width 0.6s ease" }} />
        </div>

        {/* Phase tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
          {phases.map(p => (
            <button
              key={p}
              onClick={() => setActivePhase(p)}
              style={{
                padding: "8px 14px", borderRadius: 20, border: "none", flexShrink: 0,
                background: activePhase === p ? PHASE_COLORS[p] : "rgba(255,255,255,0.05)",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.08em", color: activePhase === p ? "#fff" : "rgba(255,255,255,0.4)",
                cursor: "pointer",
              }}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Day cards for active phase */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {phaseDays.map((day, i) => {
            const done = doneDays.has(day.day);
            const isNext = day.day === currentDay;
            const color = PHASE_COLORS[day.phase] || "#FF4500";
            return (
              <button
                key={day.day}
                onClick={() => startSession(day)}
                style={{
                  padding: "16px", borderRadius: 16, border: "none",
                  background: done ? "rgba(34,197,94,0.04)" : isNext ? `${color}08` : "rgba(13,13,13,0.95)",
                  outline: `1px solid ${done ? "rgba(34,197,94,0.25)" : isNext ? `${color}44` : "rgba(255,255,255,0.07)"}`,
                  display: "flex", alignItems: "center", gap: 12,
                  cursor: "pointer", textAlign: "left",
                  animation: `fadeUp 0.3s ease ${i * 0.06}s both`,
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: done ? "rgba(34,197,94,0.12)" : isNext ? `${color}15` : "rgba(255,255,255,0.04)", border: `1px solid ${done ? "rgba(34,197,94,0.3)" : isNext ? `${color}40` : "rgba(255,255,255,0.06)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: done ? "#22c55e" : isNext ? color : "rgba(255,255,255,0.3)", lineHeight: 1 }}>{done ? "✓" : day.day}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, color: done ? "rgba(255,255,255,0.4)" : "#fff", letterSpacing: "0.04em" }}>
                    {day.focus.toUpperCase()}
                    {isNext && <span style={{ marginLeft: 8, fontSize: 9, padding: "2px 6px", background: `${color}20`, border: `1px solid ${color}40`, borderRadius: 3, color, letterSpacing: "0.08em" }}>TODAY</span>}
                  </p>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                    ~{day.duration_min} min · {day.exercises.length} exercises
                  </p>
                </div>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 20 }}>›</span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
