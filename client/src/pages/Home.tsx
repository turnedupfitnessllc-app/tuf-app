/**
 * TUF HOME — v4.1 Mobile
 * Layout spec:
 *   - Logo (100px tall), centered
 *   - Large heading tagline
 *   - Full-width START WORKOUT button
 *   - Secondary buttons row (Log Pain, Assess, Panther)
 *   - 20px vertical spacing between each element
 *   - Today's Focus pills
 *   - Pain Status
 *   - Panther Brain teaser
 */
import { useLocation } from "wouter";
import { XPBar } from "@/components/v4Components";
import { ls, getStageFromXP } from "@/data/v4constants";

const FOCUS_PILLS = [
  { label: "LOWER BODY", color: "#FF4500", day: [1, 4] },
  { label: "MOBILITY",   color: "#4a9eff", day: [2, 5] },
  { label: "RECOVERY",   color: "#22c55e", day: [0, 3] },
  { label: "UPPER BODY", color: "#C8973A", day: [1, 4] },
  { label: "CORE",       color: "#7c3aed", day: [2, 6] },
];

export default function Home() {
  const [, navigate] = useLocation();

  const progress = ls.get<{ xp: number; streakDays: number; sessionsCompleted: number }>(
    "tuf_progress", { xp: 0, streakDays: 0, sessionsCompleted: 0 }
  );
  const painLogs    = ls.get<Array<{ location: string; level: number }>>("tuf_pain_logs", []);
  const correctives = ls.get<{ issue?: { label: string } } | null>("tuf_correctives", null);

  const xp       = progress.xp || 0;
  const streak   = progress.streakDays || 0;
  const sessions = progress.sessionsCompleted || 0;
  const stage    = getStageFromXP(xp);
  const isNew    = sessions === 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 5  ? "STILL UP, ATHLETE?" :
    hour < 12 ? "GOOD MORNING, ATHLETE." :
    hour < 17 ? "GOOD AFTERNOON, ATHLETE." :
    hour < 21 ? "GOOD EVENING, ATHLETE." : "LATE SESSION, ATHLETE.";

  const todayDow   = new Date().getDay();
  const latestPain = painLogs.length > 0 ? painLogs[painLogs.length - 1] : null;

  const handleStart = () => {
    if (isNew) navigate("/assess");
    else if (correctives?.issue) navigate("/program");
    else navigate("/assess");
  };

  const startLabel = isNew
    ? "START YOUR ASSESSMENT →"
    : correctives?.issue
    ? "CONTINUE PROGRAM →"
    : "START WORKOUT →";

  return (
    <div style={{ minHeight: "100vh", background: "#080808", paddingBottom: 100 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 4px 24px rgba(255,69,0,0.35)} 50%{box-shadow:0 4px 48px rgba(255,69,0,0.65)} }
        @keyframes flamePulse { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.2)} }
        .tuf-home { animation: fadeUp 0.45s ease both; }
        .btn-primary {
          display: block; width: 100%;
          padding: 18px 24px;
          background: #FF4500;
          border: none; border-radius: 14px;
          color: #fff;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 18px; font-weight: 900;
          letter-spacing: 0.12em;
          cursor: pointer;
          animation: glowPulse 3s ease-in-out infinite;
          transition: transform 0.12s ease, background 0.12s ease;
        }
        .btn-primary:active { transform: scale(0.97); background: #cc3700; animation: none; }
        .btn-sec {
          flex: 1;
          padding: 14px 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: rgba(255,255,255,0.8);
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          transition: background 0.12s ease, border-color 0.12s ease;
        }
        .btn-sec:active { background: rgba(255,255,255,0.09); }
        .pill {
          display: inline-flex; align-items: center;
          padding: 7px 14px; border-radius: 20px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          white-space: nowrap; cursor: pointer;
          transition: transform 0.12s ease;
        }
        .pill:active { transform: scale(0.95); }
      `}</style>

      <main
        className="tuf-home"
        style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}
      >

        {/* ─── LOGO — glowing UP mark, centered ─── */}
        <div style={{ paddingTop: 52, marginBottom: 20, textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            {/* Outer ambient glow */}
            <div style={{
              position: "absolute", inset: -24,
              background: "radial-gradient(circle, rgba(255,69,0,0.22) 0%, transparent 70%)",
              borderRadius: "50%",
              animation: "ambient 3s ease-in-out infinite",
              pointerEvents: "none",
            }} />
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 96,
              lineHeight: 1,
              color: "#FF4500",
              letterSpacing: "-0.02em",
              textShadow: [
                "0 0 20px rgba(255,69,0,0.9)",
                "0 0 40px rgba(255,69,0,0.6)",
                "0 0 80px rgba(255,69,0,0.3)",
              ].join(", "),
              animation: "flamePulse 2.5s ease-in-out infinite",
              position: "relative",
            }}>
              UP
            </span>
          </div>
        </div>

        {/* ─── GREETING ─── */}
        <div style={{ marginBottom: 8, textAlign: "center" }}>
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, fontWeight: 700,
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.35)",
            margin: 0,
          }}>
            {greeting}
          </p>
        </div>

        {/* ─── TAGLINE ─── */}
        <div style={{ marginBottom: 20, textAlign: "center" }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 38, letterSpacing: "0.04em",
            color: "#fff", lineHeight: 1.08, margin: 0,
          }}>
            READY TO MOVE<br />
            <span style={{ color: "#FF4500" }}>WITH PRECISION?</span>
          </h1>
        </div>

        {/* ─── XP / STAGE BAR ─── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {streak > 0 && (
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 13, fontWeight: 700, color: "#C8973A",
                  display: "flex", alignItems: "center", gap: 3,
                  animation: "flamePulse 1.8s ease-in-out infinite",
                }}>
                  🔥 {streak}
                </span>
              )}
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.3)",
              }}>
                {sessions} SESSION{sessions !== 1 ? "S" : ""}
              </span>
            </div>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", color: "#FF4500",
            }}>
              {stage}
            </span>
          </div>
          <XPBar xp={xp} stage={stage} />
        </div>

        {/* ─── START WORKOUT — full-width primary CTA ─── */}
        <div style={{ marginBottom: 20 }}>
          <button className="btn-primary" onClick={handleStart}>
            {startLabel}
          </button>
        </div>

        {/* ─── SECONDARY BUTTONS — evenly spaced ─── */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <button
            className="btn-sec"
            onClick={() => navigate("/assess")}
            style={{ borderColor: "rgba(255,69,0,0.25)" }}
          >
            <span style={{ fontSize: 20 }}>📋</span>
            <span>ASSESS</span>
          </button>
          <button
            className="btn-sec"
            onClick={() => navigate("/assess")}
            style={{ borderColor: "rgba(255,69,0,0.2)" }}
          >
            <span style={{ fontSize: 20 }}>🩺</span>
            <span>LOG PAIN</span>
          </button>
          <button
            className="btn-sec"
            onClick={() => navigate("/jarvis")}
            style={{ borderColor: "rgba(74,158,255,0.25)" }}
          >
            <span style={{ fontSize: 20 }}>🧠</span>
            <span>PANTHER</span>
          </button>
        </div>

        {/* ─── TODAY'S FOCUS PILLS ─── */}
        <div style={{ marginBottom: 20 }}>
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 10, fontWeight: 700,
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.28)",
            marginBottom: 10,
          }}>
            TODAY'S FOCUS
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FOCUS_PILLS.map(pill => {
              const active = pill.day.includes(todayDow);
              return (
                <button
                  key={pill.label}
                  className="pill"
                  onClick={() => navigate("/program")}
                  style={{
                    background: active ? `${pill.color}1a` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${active ? pill.color + "55" : "rgba(255,255,255,0.07)"}`,
                    color: active ? pill.color : "rgba(255,255,255,0.28)",
                  }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── PAIN STATUS ─── */}
        <div style={{ marginBottom: 20 }}>
          {latestPain ? (
            <div style={{
              background: "rgba(255,69,0,0.06)",
              border: "1px solid rgba(255,69,0,0.25)",
              borderRadius: 12, padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 12, fontWeight: 700,
                  color: "#FF4500", letterSpacing: "0.1em", margin: "0 0 2px",
                }}>
                  PAIN DETECTED
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: 0 }}>
                  {latestPain.location} · Level {latestPain.level}/10
                </p>
              </div>
              <button
                onClick={() => navigate("/assess")}
                style={{
                  background: "#FF4500", border: "none", borderRadius: 8,
                  padding: "7px 14px", color: "#fff",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                  cursor: "pointer", flexShrink: 0,
                }}
              >
                FIX IT
              </button>
            </div>
          ) : (
            <div style={{
              background: "rgba(34,197,94,0.05)",
              border: "1px solid rgba(34,197,94,0.18)",
              borderRadius: 12, padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 12, fontWeight: 700,
                color: "#22c55e", letterSpacing: "0.1em", margin: 0,
              }}>
                NO PAIN DETECTED
              </p>
            </div>
          )}
        </div>

        {/* ─── PANTHER BRAIN TEASER ─── */}
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => navigate("/jarvis")}
            style={{
              width: "100%",
              background: "rgba(13,13,13,0.95)",
              border: "1px solid rgba(74,158,255,0.18)",
              borderRadius: 14, padding: "14px 16px",
              textAlign: "left", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 12,
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "rgba(74,158,255,0.08)",
              border: "1px solid rgba(74,158,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0,
            }}>
              🧠
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.15em", color: "#4a9eff",
                margin: "0 0 3px",
              }}>
                PANTHER BRAIN
              </p>
              <p style={{
                fontSize: 13, color: "rgba(255,255,255,0.6)",
                margin: 0, lineHeight: 1.4,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                "Why does my lower back hurt after squats?"
              </p>
            </div>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 18, flexShrink: 0 }}>›</span>
          </button>
        </div>

      </main>
    </div>
  );
}
