/**
 * Panther Design Test Lab
 * Route: /design-test
 *
 * Isolated sandbox to compare DARK vs NEON themes side-by-side.
 * Zero impact on existing screens — toggle applies only to this page wrapper.
 */

import { useState } from "react";
import { Link } from "wouter";

// ── Panther AI voice lines (from spec) ────────────────────────────────────────
const PANTHER_VOICE = {
  start:   ["Lock in.", "Focus. Hunt begins now."],
  during:  ["Control it.", "Stay low. Stay ready."],
  failure: ["Reset. Go again.", "No hesitation."],
  finish:  ["Strong finish.", "You earned that."],
};

// ── Video types (from spec) ───────────────────────────────────────────────────
const VIDEO_TYPES = ["exercise_demo", "form_correction", "motivation_clip", "challenge_video"];

// ── Workout template (from spec) ──────────────────────────────────────────────
const WORKOUT_TEMPLATE = {
  name: "Panther Full Body Initiation",
  duration: "20 min",
  exercises: ["bodyweight_squat", "pushup", "band_row", "plank", "bear_crawl"],
  style: "low_rest_high_control",
};

// ── Success metrics (from spec) ───────────────────────────────────────────────
const SUCCESS_METRICS = [
  { key: "did_user_finish",  label: "Finished",  value: true },
  { key: "did_user_sweat",   label: "Sweat",     value: true },
  { key: "did_user_repeat",  label: "Repeated",  value: false },
  { key: "did_user_share",   label: "Shared",    value: false },
];

// ── Fatigue / form feedback logic (from spec) ─────────────────────────────────
function getPantherCue(fatigue: number, formBreak: boolean, setDone: boolean): string {
  if (fatigue > 80)   return "Slow it down.";
  if (formBreak)      return "Fix your posture.";
  if (setDone)        return "Good. Again.";
  return "Stay locked.";
}

// ── Video prompts (from spec) ─────────────────────────────────────────────────
const VIDEO_PROMPTS = [
  { id: "squat",    text: "athletic male performing slow controlled squat, dark gym, cinematic lighting" },
  { id: "band_row", text: "resistance band row, strong posture, squeeze back muscles, neon lighting" },
  { id: "crawl",    text: "bear crawl low to ground, panther-like movement, intense focus" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function DesignTest() {
  const [theme, setTheme] = useState<"dark" | "neon">("dark");
  const [fatigue, setFatigue] = useState(40);
  const [formBreak, setFormBreak] = useState(false);
  const [setDone, setSetDone] = useState(false);
  const [activeMetrics, setActiveMetrics] = useState<Record<string, boolean>>({
    did_user_finish: true,
    did_user_sweat: true,
    did_user_repeat: false,
    did_user_share: false,
  });

  const cue = getPantherCue(fatigue, formBreak, setDone);
  const isNeon = theme === "neon";

  // Inline style helpers so the test page is fully self-contained
  const bg      = isNeon ? "#0B0B0B" : "#080808";
  const card    = isNeon ? "rgba(255,255,255,0.04)" : "#111111";
  const border  = isNeon ? "rgba(0,255,198,0.18)"  : "#2A2A2A";
  const accent  = isNeon ? "#00FFC6" : "#FF6600";
  const danger  = isNeon ? "#FF3B3B" : "#FF3333";
  const textPri = "#FFFFFF";
  const textSec = "#A0A0A0";
  const btnText = isNeon ? "#0B0B0B" : "#FFFFFF";
  const glowStyle = isNeon
    ? { boxShadow: "0 0 16px rgba(0,255,198,0.45), 0 0 40px rgba(0,255,198,0.15)" }
    : { boxShadow: "0 0 16px rgba(255,102,0,0.45), 0 0 40px rgba(255,102,0,0.15)" };

  return (
    <div style={{ minHeight: "100vh", background: bg, color: textPri, fontFamily: "'Barlow', sans-serif", padding: "0 0 80px" }}>

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: isNeon ? "rgba(11,11,11,0.92)" : "rgba(8,8,8,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${border}`,
        padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 11, color: textSec, letterSpacing: "0.12em", textTransform: "uppercase" }}>PANTHER DESIGN LAB</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", color: accent }}>
            THEME TEST
          </div>
        </div>

        {/* Theme toggle */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setTheme("dark")}
            style={{
              padding: "6px 16px", borderRadius: 100, fontSize: 12, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
              background: theme === "dark" ? "#FF6600" : "transparent",
              color: theme === "dark" ? "#fff" : textSec,
              border: `1px solid ${theme === "dark" ? "#FF6600" : border}`,
              transition: "all 0.2s",
            }}
          >DARK</button>
          <button
            onClick={() => setTheme("neon")}
            style={{
              padding: "6px 16px", borderRadius: 100, fontSize: 12, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
              background: theme === "neon" ? "#00FFC6" : "transparent",
              color: theme === "neon" ? "#0B0B0B" : textSec,
              border: `1px solid ${theme === "neon" ? "#00FFC6" : border}`,
              transition: "all 0.2s",
              ...(theme === "neon" ? { boxShadow: "0 0 12px rgba(0,255,198,0.5)" } : {}),
            }}
          >NEON</button>
          <Link href="/" style={{ color: textSec, fontSize: 12, marginLeft: 8 }}>← Back</Link>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Section: Color Palette ─────────────────────────────────────── */}
        <Section label="COLOR PALETTE" border={border} card={card}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
            {[
              { name: "BG",      color: bg },
              { name: "ACCENT",  color: accent },
              { name: "DANGER",  color: danger },
              { name: "TEXT",    color: textPri },
              { name: "MUTED",   color: textSec },
            ].map(s => (
              <div key={s.name} style={{ textAlign: "center" }}>
                <div style={{ width: "100%", aspectRatio: "1", borderRadius: 8, background: s.color, border: `1px solid ${border}`, marginBottom: 4 }} />
                <div style={{ fontSize: 9, color: textSec, letterSpacing: "0.08em" }}>{s.name}</div>
                <div style={{ fontSize: 8, color: textSec, opacity: 0.6 }}>{s.color}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Section: Typography ───────────────────────────────────────── */}
        <Section label="TYPOGRAPHY" border={border} card={card}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 36, letterSpacing: "0.04em", color: textPri, lineHeight: 1 }}>
            PANTHER BRAIN
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "0.03em", color: accent, marginTop: 4 }}>
            AI PERFORMANCE COACHING
          </div>
          <div style={{ fontSize: 14, color: textSec, marginTop: 8, lineHeight: 1.5 }}>
            Body copy — medium sans serif. Clear, readable, no fluff. Every word earns its place.
          </div>
          <div style={{ fontSize: 11, color: textSec, opacity: 0.6, marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            LABEL / CAPTION TEXT
          </div>
        </Section>

        {/* ── Section: Buttons ─────────────────────────────────────────── */}
        <Section label="BUTTONS" border={border} card={card}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Primary */}
            <button style={{
              width: "100%", padding: "14px 24px", borderRadius: 12, border: "none",
              background: accent, color: btnText, fontWeight: 800, fontSize: 14,
              letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
              ...glowStyle,
            }}>
              START WORKOUT — PRIMARY
            </button>
            {/* Secondary */}
            <button style={{
              width: "100%", padding: "14px 24px", borderRadius: 12,
              background: "transparent", color: accent, fontWeight: 700, fontSize: 14,
              letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
              border: `1.5px solid ${accent}`,
            }}>
              VIEW PROGRESS — SECONDARY
            </button>
            {/* Ghost */}
            <button style={{
              width: "100%", padding: "14px 24px", borderRadius: 12,
              background: "transparent", color: textSec, fontWeight: 600, fontSize: 14,
              letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer",
              border: `1px solid ${border}`,
            }}>
              SKIP — GHOST
            </button>
            {/* Danger */}
            <button style={{
              width: "100%", padding: "14px 24px", borderRadius: 12, border: "none",
              background: danger, color: "#fff", fontWeight: 800, fontSize: 14,
              letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
            }}>
              END SESSION — DANGER
            </button>
          </div>
        </Section>

        {/* ── Section: Cards ───────────────────────────────────────────── */}
        <Section label="CARDS" border={border} card={card}>
          {/* Workout card */}
          <div style={{
            background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 16,
            backdropFilter: "blur(16px)", marginBottom: 12,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: textSec, letterSpacing: "0.1em", textTransform: "uppercase" }}>TODAY'S WORKOUT</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em", color: textPri }}>
                  {WORKOUT_TEMPLATE.name}
                </div>
              </div>
              <div style={{ background: accent, color: btnText, fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 100, letterSpacing: "0.08em" }}>
                {WORKOUT_TEMPLATE.duration}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {WORKOUT_TEMPLATE.exercises.map(ex => (
                <span key={ex} style={{ fontSize: 10, color: accent, background: isNeon ? "rgba(0,255,198,0.08)" : "rgba(255,102,0,0.08)", padding: "3px 8px", borderRadius: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {ex.replace(/_/g, " ")}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: textSec, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Style: {WORKOUT_TEMPLATE.style.replace(/_/g, " ")}
            </div>
          </div>

          {/* Directive card */}
          <div style={{
            background: card, borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: 16,
            backdropFilter: "blur(16px)",
          }}>
            <div style={{ fontSize: 10, color: accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
              PANTHER DIRECTIVE
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: textPri }}>
              Focus on posterior chain activation today. Hip hinge pattern priority.
            </div>
          </div>
        </Section>

        {/* ── Section: Panther Brain Voice ─────────────────────────────── */}
        <Section label="PANTHER BRAIN VOICE" border={border} card={card}>
          {/* Fatigue slider */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: textSec, letterSpacing: "0.08em", textTransform: "uppercase" }}>Fatigue Level</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: fatigue > 80 ? danger : accent }}>{fatigue}%</span>
            </div>
            <input type="range" min={0} max={100} value={fatigue} onChange={e => setFatigue(+e.target.value)}
              style={{ width: "100%", accentColor: accent }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={() => setFormBreak(v => !v)} style={{
              flex: 1, padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
              background: formBreak ? danger : "transparent",
              color: formBreak ? "#fff" : textSec,
              border: `1px solid ${formBreak ? danger : border}`,
            }}>Form Break {formBreak ? "ON" : "OFF"}</button>
            <button onClick={() => setSetDone(v => !v)} style={{
              flex: 1, padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
              background: setDone ? accent : "transparent",
              color: setDone ? btnText : textSec,
              border: `1px solid ${setDone ? accent : border}`,
            }}>Set Done {setDone ? "ON" : "OFF"}</button>
          </div>
          {/* Live cue */}
          <div style={{
            background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16,
            textAlign: "center",
            ...(isNeon ? { boxShadow: "0 0 20px rgba(0,255,198,0.12)" } : {}),
          }}>
            <div style={{ fontSize: 11, color: textSec, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>PANTHER SAYS</div>
            <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em", color: accent }}>
              "{cue}"
            </div>
          </div>
          {/* Voice line grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
            {Object.entries(PANTHER_VOICE).map(([phase, lines]) => (
              <div key={phase} style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 9, color: accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{phase}</div>
                {lines.map(l => <div key={l} style={{ fontSize: 12, color: textPri, marginBottom: 2 }}>"{l}"</div>)}
              </div>
            ))}
          </div>
        </Section>

        {/* ── Section: Video Types ─────────────────────────────────────── */}
        <Section label="VIDEO TYPES" border={border} card={card}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {VIDEO_TYPES.map(vt => (
              <div key={vt} style={{
                background: card, border: `1px solid ${border}`, borderRadius: 10, padding: 12,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent, flexShrink: 0 }} />
                <div style={{ fontSize: 11, fontWeight: 700, color: textPri, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {vt.replace(/_/g, " ")}
                </div>
              </div>
            ))}
          </div>
          {/* Video prompts */}
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {VIDEO_PROMPTS.map((vp, i) => (
              <div key={vp.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 9, color: accent, letterSpacing: "0.1em", marginBottom: 4 }}>PROMPT {i + 1}</div>
                <div style={{ fontSize: 12, color: textSec, fontStyle: "italic", lineHeight: 1.4 }}>"{vp.text}"</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Section: Success Metrics ─────────────────────────────────── */}
        <Section label="SUCCESS METRICS" border={border} card={card}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {SUCCESS_METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => setActiveMetrics(prev => ({ ...prev, [m.key]: !prev[m.key] }))}
                style={{
                  background: activeMetrics[m.key] ? (isNeon ? "rgba(0,255,198,0.1)" : "rgba(255,102,0,0.1)") : card,
                  border: `1.5px solid ${activeMetrics[m.key] ? accent : border}`,
                  borderRadius: 10, padding: "12px 10px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "all 0.2s",
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 4,
                  background: activeMetrics[m.key] ? accent : "transparent",
                  border: `2px solid ${activeMetrics[m.key] ? accent : border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {activeMetrics[m.key] && <span style={{ fontSize: 10, color: btnText, fontWeight: 900 }}>✓</span>}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: activeMetrics[m.key] ? textPri : textSec, letterSpacing: "0.06em", textTransform: "uppercase", textAlign: "left" }}>
                  {m.label}
                </div>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: "10px 14px", background: card, border: `1px solid ${border}`, borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: textSec, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Session Score</div>
            <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif", color: accent }}>
              {Object.values(activeMetrics).filter(Boolean).length} / {SUCCESS_METRICS.length}
            </div>
          </div>
        </Section>

        {/* ── Section: Skeleton / Loading ───────────────────────────────── */}
        <Section label="LOADING STATES" border={border} card={card}>
          {[80, 60, 90, 40].map((w, i) => (
            <div key={i} style={{
              height: i === 0 ? 20 : 14, width: `${w}%`, borderRadius: 6, marginBottom: 8,
              background: isNeon
                ? "linear-gradient(90deg,#0F1A17 25%,#1A2E28 50%,#0F1A17 75%)"
                : "linear-gradient(90deg,#1A1A1A 25%,#2A2A2A 50%,#1A1A1A 75%)",
              backgroundSize: "400px 100%",
              animation: "shimmer 1.5s infinite linear",
            }} />
          ))}
          <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%", background: accent,
                animation: `typing-bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
            <span style={{ fontSize: 12, color: textSec }}>Panther Brain thinking...</span>
          </div>
        </Section>

        {/* ── Approve CTA ───────────────────────────────────────────────── */}
        <div style={{ padding: "20px 0", textAlign: "center" }}>
          <div style={{ fontSize: 12, color: textSec, marginBottom: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Approve this theme to apply globally
          </div>
          <button style={{
            padding: "14px 32px", borderRadius: 12, border: "none",
            background: accent, color: btnText, fontWeight: 800, fontSize: 14,
            letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
            ...glowStyle,
          }}>
            ✓ APPROVE {theme.toUpperCase()} THEME
          </button>
          <div style={{ marginTop: 8, fontSize: 11, color: textSec }}>
            Tell Manus "apply {theme} theme globally" to promote it
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Helper section wrapper ────────────────────────────────────────────────────
function Section({ label, border, card, children }: {
  label: string; border: string; card: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 16, backdropFilter: "blur(12px)" }}>
      <div style={{ fontSize: 10, color: "#A0A0A0", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${border}` }}>
        {label}
      </div>
      {children}
    </div>
  );
}
