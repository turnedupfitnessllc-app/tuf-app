/**
 * TUF HOME — v4.0
 * Arc: Hook(dashboard) → Problem(today's gap) → Fix(today's plan)
 *      → Demo(quick actions) → Cues(Panther) → CTA(start)
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { PantherPresence, XPBar, PantherMessage, V4Card, SceneHeader } from "@/components/v4Components";
import { ls, getStageFromXP } from "@/data/v4constants";

const FOCUS_PILLS = [
  { label: "LOWER BODY",  color: "#FF4500", day: [1, 4] },
  { label: "MOBILITY",    color: "#4a9eff", day: [2, 5] },
  { label: "RECOVERY",    color: "#22c55e", day: [0, 3] },
  { label: "UPPER BODY",  color: "#C8973A", day: [1, 4] },
  { label: "CORE",        color: "#7c3aed", day: [2, 6] },
];

const QUIPS = [
  "Seven days straight. That's discipline.",
  "Three days in. Keep the chain.",
  "You showed up. That's the whole game.",
  "The body adapts to what you demand of it.",
  "Consistency over intensity. Always.",
];

const FOCUS_RGB: Record<string, string> = {
  "#FF4500": "255,69,0",
  "#4a9eff": "74,158,255",
  "#22c55e": "34,197,94",
  "#C8973A": "200,151,58",
  "#7c3aed": "124,58,237",
};

export default function Home() {
  const [, navigate] = useLocation();
  const [quip] = useState(() => QUIPS[Math.floor(Math.random() * QUIPS.length)]);

  const profile  = ls.get<{ name: string; goal: string }>("tuf_profile", { name: "", goal: "" });
  const progress = ls.get<{ xp: number; streakDays: number; sessionsCompleted: number }>(
    "tuf_progress", { xp: 0, streakDays: 0, sessionsCompleted: 0 }
  );
  const painLogs = ls.get<Array<{ location: string; level: number }>>("tuf_pain_logs", []);
  const correctives = ls.get<{ issue?: { label: string } } | null>("tuf_correctives", null);

  const xp       = progress.xp || 0;
  const streak   = progress.streakDays || 0;
  const sessions = progress.sessionsCompleted || 0;
  const stage    = getStageFromXP(xp);
  const isNew    = sessions === 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 5  ? "Still up?" :
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
    hour < 21 ? "Good evening" : "Late session?";

  const todayDow = new Date().getDay();
  const latestPain = painLogs.length > 0 ? painLogs[painLogs.length - 1] : null;

  const handleStart = () => {
    if (isNew) navigate("/assess");
    else if (correctives?.issue) navigate("/program");
    else navigate("/assess");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", paddingBottom: 96 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes ambient { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
        @keyframes ring    { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.05);opacity:1} }
        @keyframes scan    { 0%{top:-2%;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:102%;opacity:0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes streakPulse { 0%,100%{opacity:0.8} 50%{opacity:1;filter:brightness(1.3)} }
      `}</style>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "80px 16px 0", position: "relative" }}>

        {/* ── SCENE 1 — HOOK: Greeting + Panther ── */}
        <div style={{ marginBottom: 20, animation: "fadeUp 0.5s ease forwards" }}>
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.18em", color: "#FF4500", marginBottom: 4,
          }}>
            {greeting.toUpperCase()}{profile.name ? `, ${profile.name.toUpperCase()}` : ""}
          </p>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: "0.07em",
            color: "#fff", lineHeight: 1.05, marginBottom: 12,
          }}>
            READY TO MOVE WITH <span style={{ color: "#FF4500" }}>PRECISION?</span>
          </h1>

          {/* Panther + XP row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
            <PantherPresence state="idle" size={72} />
            <div style={{ flex: 1 }}>
              <XPBar xp={xp} stage={stage} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)",
                }}>
                  {sessions} SESSIONS
                </span>
                {streak > 0 && (
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
                    color: "#C8973A", animation: "streakPulse 2s ease-in-out infinite",
                  }}>
                    🔥 {streak}-DAY STREAK
                  </span>
                )}
              </div>
            </div>
          </div>

          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12,
            color: "rgba(255,255,255,0.4)", fontStyle: "italic",
          }}>
            "{quip}"
          </p>
        </div>

        {/* ── SCENE 6 — CTA: Start Workout ── */}
        <button
          onClick={handleStart}
          style={{
            width: "100%", padding: "18px", borderRadius: 20, border: "none",
            background: "linear-gradient(135deg, #FF4500, #8B0000)",
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.1em",
            color: "#fff", cursor: "pointer", marginBottom: 20,
            boxShadow: "0 4px 32px rgba(255,69,0,0.35)",
          }}
        >
          {isNew ? "START YOUR ASSESSMENT →" : "START TODAY'S SESSION →"}
        </button>

        {/* ── SCENE 2 — PROBLEM: Today's Focus ── */}
        <V4Card accent="#4a9eff" style={{ marginBottom: 14 }}>
          <SceneHeader num="02" label="TODAY'S FOCUS" color="#4a9eff" />
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {FOCUS_PILLS.map(pill => {
              const isToday = pill.day.includes(todayDow);
              const rgb = FOCUS_RGB[pill.color] || "255,255,255";
              return (
                <button
                  key={pill.label}
                  onClick={() => navigate("/program")}
                  style={{
                    flexShrink: 0, padding: "8px 14px", borderRadius: 20,
                    border: `1px solid ${isToday ? pill.color : "rgba(255,255,255,0.08)"}`,
                    background: isToday ? `rgba(${rgb},0.12)` : "transparent",
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.1em", color: isToday ? pill.color : "rgba(255,255,255,0.35)",
                    cursor: "pointer",
                  }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </V4Card>

        {/* ── SCENE 3 — FIX: Pain Status ── */}
        <V4Card accent={latestPain ? "#FF4500" : "#22c55e"} style={{ marginBottom: 14 }}>
          <SceneHeader num="03" label="PAIN STATUS" color={latestPain ? "#FF4500" : "#22c55e"} />
          {latestPain ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <p style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700,
                  color: "#FF4500",
                }}>
                  {latestPain.location.toUpperCase()} — LEVEL {latestPain.level}/10
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                  Corrective plan active. Address before loading.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700,
                color: "#22c55e",
              }}>
                NO PAIN DETECTED
              </p>
            </div>
          )}
        </V4Card>

        {/* ── SCENE 4 — DEMO: Quick Actions ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { icon: "🏋️", label: "TRAIN",    sub: "Start session",  path: "/program" },
            { icon: "🔴", label: "LOG PAIN",  sub: "Track symptoms", path: "/assess" },
            { icon: "🧠", label: "ASSESS",    sub: "Find the root",  path: "/assess" },
          ].map(({ icon, label, sub, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{
                padding: "16px 8px", borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(13,13,13,0.95)", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              }}
            >
              <span style={{ fontSize: 22 }}>{icon}</span>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700,
                letterSpacing: "0.08em", color: "#fff",
              }}>
                {label}
              </p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{sub}</p>
            </button>
          ))}
        </div>

        {/* ── SCENE 5 — CUES: Panther Brain teaser ── */}
        <V4Card accent="#FF4500" style={{ marginBottom: 14 }}>
          <SceneHeader num="05" label="PANTHER BRAIN" />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <PantherPresence state="coaching" size={48} />
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
                color: "#fff", marginBottom: 4,
              }}>
                "My shoulder hurts when I press overhead"
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                Ask Panther anything about your movement
              </p>
            </div>
            <button
              onClick={() => navigate("/jarvis")}
              style={{
                padding: "8px 14px", borderRadius: 12,
                border: "1px solid rgba(255,69,0,0.4)",
                background: "rgba(255,69,0,0.1)",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
                color: "#FF4500", cursor: "pointer", flexShrink: 0,
              }}
            >
              ASK →
            </button>
          </div>
        </V4Card>

        {/* Corrective plan reminder */}
        {correctives?.issue && (
          <PantherMessage
            headline={`ACTIVE PLAN: ${(correctives.issue.label || "").toUpperCase()}`}
            body="Your corrective sequence is loaded. Execute it before every session. Consistency is the mechanism."
            directive="Open PROGRAM to see your full corrective plan."
          />
        )}

      </main>
    </div>
  );
}
