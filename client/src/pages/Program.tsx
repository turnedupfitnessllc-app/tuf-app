/**
 * TUF PROGRAM — v4.0
 * Arc: Hook(your program) → Problem(week focus) → Fix(session list)
 *      → Demo(exercise cards) → Cues(Panther) → CTA(complete)
 * View: overview | session player
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { PantherPresence, PantherMessage, V4Card, SceneHeader, XPBar } from "@/components/v4Components";
import { PROGRAM_WEEKS, ls, getStageFromXP } from "@/data/v4constants";

export default function Program() {
  const [, navigate] = useLocation();
  const [view, setView] = useState<"overview" | "session">("overview");
  const [activeWeek, setWeek] = useState(0);
  const [activeSession, setSess] = useState<typeof PROGRAM_WEEKS[0]["sessions"][0] | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFB] = useState(false);
  const [sessionDone, setSessDone] = useState<Record<string, boolean>>({});

  const week = PROGRAM_WEEKS[activeWeek];
  const correctives = ls.get<{ issue?: { label: string; color?: string } } | null>("tuf_correctives", null);
  const progress = ls.get<{ xp: number; sessionsCompleted: number }>("tuf_progress", { xp: 0, sessionsCompleted: 0 });

  function startSession(session: typeof PROGRAM_WEEKS[0]["sessions"][0]) {
    setSess(session);
    setCompleted(new Set());
    setShowFB(false);
    setFeedback("");
    setView("session");
  }

  function completeSession() {
    if (!activeSession) return;
    const key = `w${activeWeek + 1}_d${activeSession.day}`;
    setSessDone(p => ({ ...p, [key]: true }));
    ls.set(`tuf_prog_done`, { ...ls.get("tuf_prog_done", {}), [key]: true });
    setShowFB(true);
    // Award XP
    const prog = ls.get<{ xp: number; sessionsCompleted: number }>("tuf_progress", { xp: 0, sessionsCompleted: 0 });
    prog.sessionsCompleted = (prog.sessionsCompleted || 0) + 1;
    prog.xp = (prog.xp || 0) + 20;
    ls.set("tuf_progress", prog);
  }

  // ── SESSION PLAYER VIEW ──────────────────────────────────────────────────
  if (view === "session" && activeSession) {
    const allIds = activeSession.exercises.map((_, i) => i);
    const pct = Math.round((completed.size / allIds.length) * 100);

    return (
      <div style={{ minHeight: "100vh", background: "#080808", paddingBottom: 96 }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
          @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
        <main style={{ maxWidth: 480, margin: "0 auto", padding: "80px 16px 0" }}>

          {/* Back */}
          <button
            onClick={() => { setView("overview"); setSess(null); }}
            style={{
              display: "flex", alignItems: "center", gap: 6, marginBottom: 16,
              background: "transparent", border: "none", cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)",
            }}
          >
            ← BACK TO PROGRAM
          </button>

          {/* Session title */}
          <div style={{ marginBottom: 16 }}>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.18em", color: week.color, marginBottom: 4,
            }}>
              WEEK {week.week} · DAY {activeSession.day}
            </p>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: "0.07em",
              color: "#fff", lineHeight: 1.05,
            }}>
              {activeSession.label}
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{activeSession.duration}</p>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)",
              }}>
                SESSION PROGRESS
              </span>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700,
                color: week.color,
              }}>
                {pct}%
              </span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${pct}%`,
                background: `linear-gradient(90deg, ${week.color}88, ${week.color})`,
                borderRadius: 2, transition: "width 0.5s ease",
              }} />
            </div>
          </div>

          {/* Week badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
            padding: "8px 12px", borderRadius: 10,
            background: `rgba(255,255,255,0.03)`,
            border: `1px solid ${week.color}33`,
          }}>
            <span style={{ fontSize: 14 }}>{week.icon}</span>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.1em", color: week.color,
            }}>
              {week.label}
            </span>
          </div>

          {/* Exercise cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {activeSession.exercises.map((ex, i) => {
              const done = completed.has(i);
              return (
                <div
                  key={i}
                  style={{
                    background: done ? "rgba(34,197,94,0.05)" : "rgba(13,13,13,0.95)",
                    border: `1px solid ${done ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 16, padding: "14px",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700,
                        color: done ? "rgba(255,255,255,0.5)" : "#fff",
                        textDecoration: done ? "line-through" : "none",
                      }}>
                        {ex.name}
                      </p>
                      {ex.cue && (
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                          "{ex.cue}"
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                      <p style={{
                        fontFamily: "'Bebas Neue', sans-serif", fontSize: 20,
                        color: done ? "#22c55e" : week.color,
                      }}>
                        {ex.sets}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const u = new Set(completed);
                      if (done) u.delete(i); else u.add(i);
                      setCompleted(u);
                    }}
                    style={{
                      width: "100%", padding: "9px", borderRadius: 12,
                      border: `1px solid ${done ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`,
                      background: done ? "rgba(34,197,94,0.1)" : "transparent",
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: done ? "#22c55e" : "rgba(255,255,255,0.6)",
                      cursor: "pointer",
                    }}
                  >
                    {done ? "✓ DONE" : "MARK COMPLETE"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Complete / Feedback */}
          {!showFeedback ? (
            <button
              onClick={completeSession}
              style={{
                width: "100%", padding: "18px", borderRadius: 20, border: "none",
                background: "linear-gradient(135deg, #FF4500, #8B0000)",
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.1em",
                color: "#fff", cursor: "pointer",
                boxShadow: "0 4px 32px rgba(255,69,0,0.35)",
              }}
            >
              COMPLETE SESSION ✓
            </button>
          ) : (
            <V4Card accent="#C8973A">
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.15em", color: "#C8973A", marginBottom: 10,
              }}>
                HOW WAS THE SESSION?
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {["Too Easy", "On Point", "Too Hard", "Pain Felt", "Form Broke"].map(f => (
                  <button
                    key={f}
                    onClick={() => setFeedback(f)}
                    style={{
                      padding: "8px 14px", borderRadius: 20,
                      border: `1px solid ${feedback === f ? "#C8973A" : "rgba(255,255,255,0.1)"}`,
                      background: feedback === f ? "rgba(200,151,58,0.15)" : "transparent",
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
                      color: feedback === f ? "#C8973A" : "rgba(255,255,255,0.5)",
                      cursor: "pointer",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setView("overview"); setSess(null); }}
                disabled={!feedback}
                style={{
                  width: "100%", padding: "12px", borderRadius: 14,
                  border: "1px solid rgba(200,151,58,0.4)",
                  background: feedback ? "rgba(200,151,58,0.15)" : "transparent",
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: feedback ? "#C8973A" : "rgba(255,255,255,0.2)",
                  cursor: feedback ? "pointer" : "not-allowed",
                }}
              >
                STORE FEEDBACK → ADAPT NEXT SESSION
              </button>
            </V4Card>
          )}
        </main>
      </div>
    );
  }

  // ── OVERVIEW ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#080808", paddingBottom: 96 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes ambient { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
        @keyframes ring    { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.05);opacity:1} }
        @keyframes scan    { 0%{top:-2%;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:102%;opacity:0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "80px 16px 0", position: "relative" }}>

        {/* SCENE 1 — HOOK */}
        <div style={{ marginBottom: 20, animation: "fadeUp 0.4s ease forwards" }}>
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.18em", color: "#FF4500", marginBottom: 4,
          }}>
            YOUR 4-WEEK PROGRAM
          </p>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: "0.07em",
            color: "#fff", lineHeight: 1.05,
          }}>
            YOUR <span style={{ color: "#FF4500" }}>PLAN</span>
          </h1>
        </div>

        {/* Diagnosis card */}
        {correctives?.issue && (
          <V4Card accent="#FF4500" style={{ marginBottom: 14 }}>
            <SceneHeader num="01" label="ACTIVE DIAGNOSIS" />
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700,
              color: "#fff",
            }}>
              {correctives.issue.label.toUpperCase()} — CORRECTIVE PLAN ACTIVE
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
              Execute your corrective sequence before each session.
            </p>
          </V4Card>
        )}

        {/* SCENE 2 — PROBLEM: Week selector */}
        <V4Card style={{ marginBottom: 14 }}>
          <SceneHeader num="02" label="SELECT WEEK" />
          <div style={{ display: "flex", gap: 8 }}>
            {PROGRAM_WEEKS.map((w, i) => (
              <button
                key={w.week}
                onClick={() => setWeek(i)}
                style={{
                  flex: 1, padding: "10px 4px", borderRadius: 12,
                  border: `1px solid ${activeWeek === i ? w.color : "rgba(255,255,255,0.08)"}`,
                  background: activeWeek === i ? `${w.color}18` : "transparent",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 16 }}>{w.icon}</span>
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 16,
                  color: activeWeek === i ? w.color : "rgba(255,255,255,0.4)",
                }}>
                  W{w.week}
                </span>
              </button>
            ))}
          </div>
        </V4Card>

        {/* Week theme */}
        <V4Card accent={week.color} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 20 }}>{week.icon}</span>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700,
              letterSpacing: "0.08em", color: week.color,
            }}>
              WEEK {week.week}: {week.label}
            </p>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{week.focus}</p>
        </V4Card>

        {/* SCENE 3 — FIX: Session cards */}
        <SceneHeader num="03" label="THIS WEEK'S SESSIONS" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {week.sessions.map(session => {
            const key = `w${activeWeek + 1}_d${session.day}`;
            const isDone = sessionDone[key] || ls.get<Record<string, boolean>>("tuf_prog_done", {})[key];
            return (
              <button
                key={session.day}
                onClick={() => startSession(session)}
                style={{
                  padding: "16px", borderRadius: 16,
                  border: `1px solid ${isDone ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                  background: isDone ? "rgba(34,197,94,0.05)" : "rgba(13,13,13,0.95)",
                  display: "flex", alignItems: "center", gap: 12,
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: isDone ? "rgba(34,197,94,0.15)" : `${week.color}18`,
                  border: `1px solid ${isDone ? "rgba(34,197,94,0.4)" : `${week.color}44`}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 16,
                    color: isDone ? "#22c55e" : week.color,
                  }}>
                    {isDone ? "✓" : `D${session.day}`}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700,
                    color: isDone ? "rgba(255,255,255,0.5)" : "#fff",
                  }}>
                    {session.label}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                    {session.exercises.length} exercises · {session.duration}
                  </p>
                </div>
                <span style={{ color: isDone ? "#22c55e" : "rgba(255,255,255,0.3)", fontSize: 18 }}>
                  {isDone ? "✓" : "›"}
                </span>
              </button>
            );
          })}
        </div>

        {/* SCENE 5 — CUES: Panther */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <PantherPresence state="coaching" size={60} />
          <div style={{ flex: 1 }}>
            <XPBar xp={progress.xp || 0} stage={getStageFromXP(progress.xp || 0)} />
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
              {progress.sessionsCompleted || 0} sessions completed
            </p>
          </div>
        </div>

        <PantherMessage
          headline="EXECUTE THE SEQUENCE."
          body="Week by week. Session by session. The program is the mechanism. Trust it."
          directive="Select a session above. Start the work."
        />

      </main>
    </div>
  );
}
