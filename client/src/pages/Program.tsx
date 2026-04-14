/**
 * TUF PROGRAM — v4.1
 * Arc: Hook → Week selector → Day-by-day calendar → Session player
 * Features: 4-week view, rest day indicators, exercise checklist,
 *           session feedback chips, XP award, Panther coaching
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { PantherPresence, PantherMessage, V4Card, SceneHeader, XPBar } from "@/components/v4Components";
import { PROGRAM_WEEKS, ls, getStageFromXP } from "@/data/v4constants";
import { useProgress } from "@/hooks/useProgress";

// Program catalog entry for the selector
const PROGRAM_CATALOG = [
  {
    id: "corrective-4wk",
    title: "4-WEEK CORRECTIVE",
    subtitle: "Foundation Program",
    description: "Mobility, stability, and corrective movement. Fix the patterns before you load them.",
    duration: "4 Weeks · 3 days/week",
    tier: "CUB",
    color: "#4a9eff",
    phase: "FOUNDATION",
  },
  {
    id: "panther-30",
    title: "PANTHER 30-DAY SYSTEM",
    subtitle: "Performance Program",
    description: "Control → Stability → Strength → Explosion → Evolution. 30 days. 5 phases. One transformation.",
    duration: "30 Days · Daily",
    tier: "STEALTH",
    color: "#FF6600",
    phase: "PERFORMANCE",
  },
  {
    id: "maximum-overdrive",
    title: "MAXIMUM OVERDRIVE",
    subtitle: "6-Week HIIT",
    description: "High-intensity. 4 rounds. 30 sec on / 10 sec off. 30 minutes. Maximum output.",
    duration: "6 Weeks · 4 days/week",
    tier: "CONTROLLED",
    color: "#C8973A",
    phase: "HIIT",
  },
  {
    id: "ass-assassination",
    title: "ASS-ASSASSINATION",
    subtitle: "6-Week Glute Program",
    description: "Targeted glute development. Progressive overload. Built for results.",
    duration: "6 Weeks · 4 days/week",
    tier: "CONTROLLED",
    color: "#22c55e",
    phase: "SCULPT",
  },
];

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const FEEDBACK_CHIPS = [
  { id: "easy",    label: "Too Easy",   emoji: "😤", xp: 5  },
  { id: "good",    label: "On Point",   emoji: "💪", xp: 20 },
  { id: "hard",    label: "Too Hard",   emoji: "🥵", xp: 15 },
  { id: "pain",    label: "Pain Felt",  emoji: "⚠️", xp: 10 },
  { id: "form",    label: "Form Broke", emoji: "🔧", xp: 10 },
];

export default function Program() {
  const [, navigate] = useLocation();
  const [view, setView] = useState<"catalog" | "overview" | "session">("catalog");
  const [activeWeek, setWeek] = useState(0);
  const [activeSession, setSess] = useState<typeof PROGRAM_WEEKS[0]["sessions"][0] | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<string[]>([]);
  const [showFeedback, setShowFB] = useState(false);
  const [sessionDone, setSessDone] = useState<Record<string, boolean>>(
    () => ls.get<Record<string, boolean>>("tuf_prog_done", {})
  );

  const week = PROGRAM_WEEKS[activeWeek];
  const correctives = ls.get<{ issue?: { label: string; color?: string } } | null>("tuf_correctives", null);
  const { progress, completeSession: recordSession } = useProgress();

  // Build 7-day calendar: map sessions to weekdays (Mon=0, Wed=2, Fri=4)
  const SESSION_DAYS = [0, 2, 4]; // Mon, Wed, Fri
  const calendarDays = DAY_LABELS.map((label, i) => {
    const sessionIdx = SESSION_DAYS.indexOf(i);
    const session = sessionIdx >= 0 ? week.sessions[sessionIdx] : null;
    const key = session ? `w${activeWeek + 1}_d${session.day}` : "";
    const isDone = key ? !!sessionDone[key] : false;
    return { label, isSession: !!session, session, isDone };
  });

  function startSession(session: typeof PROGRAM_WEEKS[0]["sessions"][0]) {
    setSess(session);
    setCompleted(new Set());
    setShowFB(false);
    setFeedback([]);
    setView("session");
  }

  function toggleExercise(idx: number) {
    setCompleted(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  function toggleFeedback(id: string) {
    setFeedback(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  }

  function completeSession() {
    if (!activeSession) return;
    const key = `w${activeWeek + 1}_d${activeSession.day}`;
    const updated = { ...sessionDone, [key]: true };
    setSessDone(updated);
    ls.set("tuf_prog_done", updated);
    // XP award based on feedback
    const bonusXP = feedback.reduce((sum, id) => {
      const chip = FEEDBACK_CHIPS.find(c => c.id === id);
      return sum + (chip?.xp || 0);
    }, 0);
    const baseXP = 20;
    const totalXP = baseXP + bonusXP;
    // Record session to DB via useProgress
    recordSession([], 30, totalXP);
    setShowFB(true);
  }

  // ── CATALOG VIEW ─────────────────────────────────────────────────────────────
  if (view === "catalog") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 96 }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
          @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
        <main style={{ maxWidth: 480, margin: "0 auto", padding: "72px 16px 0" }}>
          <button
            onClick={() => navigate("/")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", marginBottom: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", cursor: "pointer" }}
          >
            ← HOME
          </button>

          <div style={{ marginBottom: 20, animation: "fadeUp 0.4s ease forwards" }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "#FF6600", marginBottom: 2 }}>PANTHER SYSTEM</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: "0.07em", color: "var(--text-primary)", lineHeight: 1 }}>SELECT YOUR PROGRAM</h1>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Choose the program that matches your tier</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PROGRAM_CATALOG.map((prog, i) => (
              <button
                key={prog.id}
                onClick={() => {
                  if (prog.id === "corrective-4wk") setView("overview");
                  else if (prog.id === "panther-30") navigate("/panther-30");
                  else if (prog.id === "maximum-overdrive") navigate("/train");
                  else if (prog.id === "ass-assassination") navigate("/train");
                }}
                style={{
                  padding: "18px", borderRadius: 16, border: "none",
                  background: "rgba(13,13,13,0.95)",
                  outline: `1px solid ${prog.color}33`,
                  display: "flex", alignItems: "flex-start", gap: 14,
                  cursor: "pointer", textAlign: "left",
                  animation: `fadeUp 0.3s ease ${i * 0.08}s both`,
                }}
              >
                <div style={{ width: 4, height: "100%", minHeight: 60, borderRadius: 2, background: prog.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "var(--text-primary)", letterSpacing: "0.06em", lineHeight: 1 }}>{prog.title}</span>
                    <span style={{ fontSize: 9, padding: "2px 7px", background: `${prog.color}20`, border: `1px solid ${prog.color}50`, borderRadius: 3, color: prog.color, letterSpacing: "0.08em", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>{prog.phase}</span>
                  </div>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6, lineHeight: 1.4 }}>{prog.description}</p>
                  <div style={{ display: "flex", gap: 12, fontSize: 10, letterSpacing: "0.08em" }}>
                    <span style={{ color: prog.color }}>{prog.duration}</span>
                    <span style={{ color: "rgba(255,255,255,0.25)" }}>TIER: {prog.tier}+</span>
                  </div>
                </div>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 20, flexShrink: 0 }}>›</span>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ── SESSION PLAYER VIEW ────────────────────────────────────────────────────
  if (view === "session" && activeSession) {
    const allIds = activeSession.exercises.map((_, i) => i);
    const pct = Math.round((completed.size / allIds.length) * 100);
    const allDone = completed.size === allIds.length;

    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 96 }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
          @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
          @keyframes pulse  { 0%,100%{opacity:0.6} 50%{opacity:1} }
          @keyframes fill   { from{width:0} to{width:var(--pct)} }
        `}</style>
        <main style={{ maxWidth: 480, margin: "0 auto", padding: "80px 16px 0" }}>

          {/* Back + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <button
              onClick={() => setView("overview")}
              style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
            >
              ← BACK
            </button>
            <div>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: week.color }}>
                WEEK {week.week} · DAY {activeSession.day}
              </p>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "var(--text-primary)", letterSpacing: "0.06em", lineHeight: 1 }}>
                {activeSession.label}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <V4Card style={{ marginBottom: 14, padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>
                SESSION PROGRESS
              </p>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: week.color }}>
                {completed.size}/{allIds.length}
              </p>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 3,
                background: `linear-gradient(90deg, ${week.color}, ${week.color}88)`,
                width: `${pct}%`,
                transition: "width 0.4s ease",
              }} />
            </div>
          </V4Card>

          {/* Exercise checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {activeSession.exercises.map((ex, i) => {
              const done = completed.has(i);
              return (
                <button
                  key={i}
                  onClick={() => toggleExercise(i)}
                  style={{
                    padding: "14px 16px", borderRadius: 16,
                    background: done ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${done ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.07)"}`,
                    display: "flex", alignItems: "center", gap: 12,
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.2s ease",
                    animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
                  }}
                >
                  {/* Checkbox */}
                  <div style={{
                    width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                    background: done ? "#22c55e" : "rgba(255,255,255,0.05)",
                    border: `2px solid ${done ? "#22c55e" : "rgba(255,255,255,0.15)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}>
                    {done && <span style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700 }}>✓</span>}
                  </div>

                  {/* Exercise info */}
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700,
                      letterSpacing: "0.04em",
                      color: done ? "rgba(255,255,255,0.4)" : "#fff",
                      textDecoration: done ? "line-through" : "none",
                    }}>
                      {ex.name}
                    </p>
                    <p style={{ fontSize: 11, color: done ? "rgba(255,255,255,0.2)" : week.color, marginTop: 1 }}>
                      {ex.sets}
                    </p>
                    {ex.cue && !done && (
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3, lineHeight: 1.4 }}>
                        "{ex.cue}"
                      </p>
                    )}
                  </div>

                  {/* Phase dot */}
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: done ? "#22c55e" : week.color,
                    animation: done ? "none" : "pulse 2s ease-in-out infinite",
                  }} />
                </button>
              );
            })}
          </div>

          {/* Feedback chips (show when all done) */}
          {allDone && !showFeedback && (
            <V4Card accent={week.color} style={{ marginBottom: 14 }}>
              <SceneHeader num="FB" label="HOW DID IT FEEL?" color={week.color} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                {FEEDBACK_CHIPS.map(chip => (
                  <button
                    key={chip.id}
                    onClick={() => toggleFeedback(chip.id)}
                    style={{
                      padding: "8px 14px", borderRadius: 20, border: "none",
                    background: feedback.includes(chip.id) ? `${week.color}22` : "rgba(255,255,255,0.04)",
                    outline: `1px solid ${feedback.includes(chip.id) ? week.color + "66" : "rgba(255,255,255,0.1)"}`,
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: feedback.includes(chip.id) ? week.color : "rgba(255,255,255,0.5)",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <span>{chip.emoji}</span> {chip.label}
                  </button>
                ))}
              </div>
              <button
                onClick={completeSession}
                style={{
                  width: "100%", padding: "14px", borderRadius: 14, border: "none",
                  background: `linear-gradient(135deg, ${week.color}, ${week.color}88)`,
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: "0.1em",
                  color: "var(--text-primary)", cursor: "pointer",
                }}
              >
                COMPLETE SESSION +{20 + feedback.reduce((s, id) => s + (FEEDBACK_CHIPS.find(c => c.id === id)?.xp || 0), 0)} XP
              </button>
            </V4Card>
          )}

          {/* Session complete state */}
          {showFeedback && (
            <V4Card accent="#22c55e" style={{ marginBottom: 14 }}>
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#22c55e", letterSpacing: "0.06em", lineHeight: 1 }}>
                  SESSION COMPLETE
                </p>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                  XP AWARDED · PANTHER WATCHING
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button
                  onClick={() => setView("overview")}
                  style={{
                    flex: 1, padding: "12px", borderRadius: 14, border: "none",
                    background: "rgba(255,255,255,0.06)",
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
                    letterSpacing: "0.08em", color: "rgba(255,255,255,0.6)", cursor: "pointer",
                  }}
                >
                  BACK TO PROGRAM
                </button>
                <button
                  onClick={() => navigate("/boa")}
                  style={{
                    flex: 1, padding: "12px", borderRadius: 14, border: "none",
                    background: "linear-gradient(135deg, #FF6600, #8B0000)",
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
                    letterSpacing: "0.08em", color: "var(--text-primary)", cursor: "pointer",
                  }}
                >
                  ANALYZE FORM →
                </button>
              </div>
            </V4Card>
          )}

          {/* Panther coaching cue */}
          <PantherMessage
            headline={allDone ? "WORK DONE." : "EXECUTE THE REPS."}
            body={
              allDone
                ? "Every checked box is a deposit. You're building something that compounds."
                : `${activeSession.exercises.length - completed.size} exercises remaining. Form over speed. Control the movement.`
            }
            directive={allDone ? "Log your feedback. Collect your XP." : "Tap each exercise when complete."}
          />
        </main>
      </div>
    );
  }

  // ── OVERVIEW ───────────────────────────────────────────────────────────────
  const totalSessions = PROGRAM_WEEKS.reduce((s, w) => s + w.sessions.length, 0);
  const completedCount = Object.keys(sessionDone).filter(k => sessionDone[k]).length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 96 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.6} 50%{opacity:1} }
      `}</style>
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "72px 16px 0" }}>

        {/* Back to Programs */}
        <button
          onClick={() => setView("catalog")}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", marginBottom: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", cursor: "pointer" }}
        >
          ← PROGRAMS
        </button>

        {/* SCENE 1 — HOOK: Header */}
        <div style={{ marginBottom: 16, animation: "fadeUp 0.4s ease forwards" }}>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "#FF6600", marginBottom: 2 }}>
            YOUR PROGRAM
          </p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: "0.07em", color: "var(--text-primary)", lineHeight: 1 }}>
            4-WEEK <span style={{ color: week.color }}>CORRECTIVE</span>
          </h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
            {completedCount}/{totalSessions} sessions complete
          </p>
        </div>

        {/* Overall progress bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              background: `linear-gradient(90deg, #FF6600, #C8973A)`,
              width: `${Math.round((completedCount / totalSessions) * 100)}%`,
              transition: "width 0.6s ease",
            }} />
          </div>
        </div>

        {/* SCENE 2 — Week selector */}
        <V4Card style={{ marginBottom: 14 }}>
          <SceneHeader num="02" label="SELECT WEEK" />
          <div style={{ display: "flex", gap: 8 }}>
            {PROGRAM_WEEKS.map((w, i) => {
              const weekSessions = w.sessions.map((_, si) => `w${i + 1}_d${si + 1}`);
              const weekDone = weekSessions.filter(k => sessionDone[k]).length;
              const weekComplete = weekDone === w.sessions.length;
              return (
                <button
                  key={w.week}
                  onClick={() => setWeek(i)}
                  style={{
                    flex: 1, padding: "12px 4px", borderRadius: 14,
                    border: `1px solid ${activeWeek === i ? w.color : "rgba(255,255,255,0.07)"}`,
                    background: activeWeek === i ? `${w.color}18` : "transparent",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                    cursor: "pointer", position: "relative",
                  }}
                >
                  {weekComplete && (
                    <div style={{
                      position: "absolute", top: -4, right: -4, width: 12, height: 12,
                      borderRadius: "50%", background: "#22c55e", border: "2px solid var(--bg-primary)",
                    }} />
                  )}
                  <span style={{ fontSize: 16 }}>{w.icon}</span>
                  <span style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 18,
                    color: activeWeek === i ? w.color : "rgba(255,255,255,0.35)",
                    lineHeight: 1,
                  }}>
                    W{w.week}
                  </span>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.06em",
                    color: activeWeek === i ? `${w.color}88` : "rgba(255,255,255,0.2)",
                  }}>
                    {weekDone}/{w.sessions.length}
                  </span>
                </button>
              );
            })}
          </div>
        </V4Card>

        {/* Week theme banner */}
        <V4Card accent={week.color} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 22 }}>{week.icon}</span>
            <div>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", color: week.color }}>
                WEEK {week.week}: {week.label}
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{week.focus}</p>
            </div>
          </div>
        </V4Card>

        {/* SCENE 3 — 7-day calendar */}
        <V4Card style={{ marginBottom: 14 }}>
          <SceneHeader num="03" label="WEEKLY SCHEDULE" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {calendarDays.map((day, i) => (
              <button
                key={i}
                onClick={() => day.session && startSession(day.session)}
                disabled={!day.isSession}
                style={{
                  padding: "8px 2px", borderRadius: 10,
                  background: day.isDone
                    ? "rgba(34,197,94,0.08)"
                    : day.isSession
                    ? `${week.color}12`
                    : "rgba(255,255,255,0.02)",
                  border: `1px solid ${
                    day.isDone
                      ? "rgba(34,197,94,0.3)"
                      : day.isSession
                      ? `${week.color}44`
                      : "rgba(255,255,255,0.04)"
                  }`,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  cursor: day.isSession ? "pointer" : "default",
                }}
              >
                <p style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: day.isSession ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)",
                }}>
                  {day.label}
                </p>
                <div style={{
                  width: 20, height: 20, borderRadius: 6,
                  background: day.isDone
                    ? "#22c55e"
                    : day.isSession
                    ? week.color
                    : "rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 9, color: day.isSession || day.isDone ? "#fff" : "rgba(255,255,255,0.15)" }}>
                    {day.isDone ? "✓" : day.isSession ? "▶" : "—"}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.2)", marginTop: 8, textAlign: "center" }}>
            MON · WED · FRI — REST DAYS IN BETWEEN
          </p>
        </V4Card>

        {/* SCENE 4 — Session cards */}
        <SceneHeader num="04" label="THIS WEEK'S SESSIONS" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {week.sessions.map(session => {
            const key = `w${activeWeek + 1}_d${session.day}`;
            const isDone = !!sessionDone[key];
            return (
              <button
                key={session.day}
                onClick={() => startSession(session)}
                style={{
                  padding: "16px", borderRadius: 16, border: "none",
                  background: isDone ? "rgba(34,197,94,0.04)" : "rgba(13,13,13,0.95)",
                  outline: `1px solid ${isDone ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.07)"}`,
                  display: "flex", alignItems: "center", gap: 12,
                  cursor: "pointer", textAlign: "left",
                  animation: `fadeUp 0.3s ease ${session.day * 0.08}s both`,
                }}
              >
                {/* Day badge */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: isDone ? "rgba(34,197,94,0.12)" : `${week.color}18`,
                  border: `1px solid ${isDone ? "rgba(34,197,94,0.35)" : `${week.color}44`}`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: isDone ? "#22c55e" : week.color, lineHeight: 1 }}>
                    {isDone ? "✓" : `D${session.day}`}
                  </span>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: "0.06em", color: isDone ? "rgba(34,197,94,0.5)" : `${week.color}88` }}>
                    {isDone ? "DONE" : DAY_LABELS[SESSION_DAYS[session.day - 1]] || "DAY"}
                  </span>
                </div>

                {/* Session info */}
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: isDone ? "rgba(255,255,255,0.4)" : "#fff",
                  }}>
                    {session.label}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                    {session.exercises.length} exercises · {session.duration}
                  </p>
                </div>

                <span style={{ fontSize: 20, color: isDone ? "#22c55e" : "rgba(255,255,255,0.25)" }}>
                  {isDone ? "✓" : "›"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Corrective program notice */}
        {correctives?.issue && (
          <V4Card accent={correctives.issue.color || "#FF6600"} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: correctives.issue.color || "#FF6600", animation: "pulse 1.5s ease-in-out infinite" }} />
              <div>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: correctives.issue.color || "#FF6600" }}>
                  ACTIVE CORRECTIVE PROTOCOL
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
                  {correctives.issue.label} — complete correctives before each session
                </p>
              </div>
            </div>
          </V4Card>
        )}

        {/* SCENE 5 — Panther + XP */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <PantherPresence state="coaching" size={60} />
          <div style={{ flex: 1 }}>
            <XPBar xp={progress.xp || 0} stage={getStageFromXP(progress.xp || 0)} />
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
              {progress.sessionsCompleted || 0} sessions completed · {progress.xp || 0} XP earned
            </p>
          </div>
        </div>

        <PantherMessage
          headline="EXECUTE THE SEQUENCE."
          body="Week by week. Session by session. The program is the mechanism. Trust it. The body adapts when you show up consistently."
          directive="Select a session above. Start the work."
        />

      </main>
    </div>
  );
}
