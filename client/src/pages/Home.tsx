/**
 * TUF HOME — v4.2 Command Center
 * Logo: panther mascot image with blended overlay (full body + glow halo + scan ring)
 * Layout:
 *   - Hero logo (panther mascot with UP overlay)
 *   - Greeting + tagline
 *   - XP / Stage bar
 *   - Full-width START WORKOUT CTA
 *   - 2-col section cards: ASSESS | PROGRAM
 *   - 2-col section cards: PANTHER BRAIN | EVOLVE
 *   - Full-width: 30-DAY CHALLENGE
 */
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { XPBar } from "@/components/v4Components";
import { ls, getStageFromXP } from "@/data/v4constants";
import { TufSocialStickyStrip } from "@/components/TufSocialFooter";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";
const PANTHER_MASCOT = `${CDN}/panther-mascot-gym_27e64ae1.png`;
const CHALLENGE_IMG  = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/challenge-hero-panther_60538eb1.jpg";

export default function Home() {
  const [, navigate] = useLocation();
  const [fuelDirective, setFuelDirective] = useState<string | null>(null);
  const [fuelSummary, setFuelSummary] = useState<{ calories: number; protein: number; target: number } | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("tuf_user_id") || "guest";
    const today = new Date().toISOString().split("T")[0];
    Promise.all([
      fetch(`/api/fuel/log/${userId}/${today}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/fuel/profile/${userId}`).then(r => r.ok ? r.json() : null),
    ]).then(([log, profile]) => {
      if (log?.pantherDirective) setFuelDirective(log.pantherDirective);
      if (log && profile) {
        setFuelSummary({
          calories: Math.round(log.totalCalories ?? 0),
          protein: Math.round(log.totalProteinG ?? 0),
          target: profile.calorieTarget,
        });
      }
    }).catch(() => {});
  }, []);

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
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');

        @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 4px 24px rgba(255,69,0,0.4)} 50%{box-shadow:0 4px 56px rgba(255,69,0,0.75)} }
        @keyframes ringPulse {
          0%,100% { box-shadow: 0 0 14px rgba(255,69,0,0.5), inset 0 0 10px rgba(255,69,0,0.08); }
          50%     { box-shadow: 0 0 30px rgba(255,69,0,0.9), inset 0 0 18px rgba(255,69,0,0.18); }
        }
        @keyframes haloPulse { 0%,100%{opacity:1} 50%{opacity:0.6} }

        .tuf-home  { animation: fadeUp 0.45s ease both; }

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

        .cmd-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.07);
          transition: transform 0.15s ease, border-color 0.15s ease;
          background: rgba(255,255,255,0.03);
        }
        .cmd-card:active { transform: scale(0.97); }
        .cmd-card:hover  { border-color: rgba(255,69,0,0.3); }

        .logo-ring { animation: ringPulse 2.5s ease-in-out infinite; }
        .logo-halo { animation: haloPulse 2.5s ease-in-out infinite; }
      `}</style>

      <main className="tuf-home" style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* ─── HERO BANNER ─── */}
        <div style={{ paddingTop: 0, marginBottom: 20 }}>
          <div style={{
            width: "100%",
            height: 220,
            borderRadius: 20,
            overflow: "hidden",
            position: "relative",
            border: "1px solid rgba(255,69,0,0.2)",
            boxShadow: "0 0 40px rgba(255,69,0,0.12), 0 12px 40px rgba(0,0,0,0.6)",
          }}>
            {/* Panther mascot — full body, darkened */}
            <img
              src={PANTHER_MASCOT}
              alt="TUF Panther"
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover",
                objectPosition: "center 15%",
                filter: "brightness(0.45) saturate(1.3)",
              }}
            />
            {/* Left-to-right gradient overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to right, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.3) 50%, transparent 100%)",
              pointerEvents: "none",
            }} />
            {/* Bottom fade */}
            <div style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0,
              height: "35%",
              background: "linear-gradient(to top, rgba(8,8,8,0.9) 0%, transparent 100%)",
              pointerEvents: "none",
            }} />
            {/* Red glow halo on chest */}
            <div
              className="logo-halo"
              style={{
                position: "absolute",
                right: "30%", top: "55%",
                transform: "translate(50%, -50%)",
                width: 100, height: 70,
                background: "radial-gradient(ellipse at center, rgba(255,69,0,0.45) 0%, rgba(255,69,0,0.1) 55%, transparent 80%)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />
            {/* Scan ring */}
            <div
              className="logo-ring"
              style={{
                position: "absolute",
                right: "30%", top: "55%",
                transform: "translate(50%, -50%)",
                width: 72, height: 50,
                border: "1.5px solid rgba(255,69,0,0.6)",
                borderRadius: 8,
                pointerEvents: "none",
              }}
            />
            {/* TUF branding text — left side */}
            <div style={{
              position: "absolute",
              left: 18, bottom: 18,
            }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 9, fontWeight: 700,
                letterSpacing: "0.22em",
                color: "rgba(255,69,0,0.85)",
                marginBottom: 3,
              }}>
                TURNED UP FITNESS
              </div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 28, letterSpacing: "0.06em",
                color: "var(--text-primary)", lineHeight: 1,
              }}>
                THE PANTHER <span style={{ color: "#FF4500" }}>SYSTEM</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── GREETING ─── */}
        <div style={{ marginBottom: 4, textAlign: "center" }}>
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
        <div style={{ marginBottom: 18, textAlign: "center" }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 36, letterSpacing: "0.04em",
            color: "var(--text-primary)", lineHeight: 1.08, margin: 0,
          }}>
            READY TO MOVE<br />
            <span style={{ color: "#FF4500" }}>WITH PRECISION?</span>
          </h1>
        </div>

        {/* ─── XP / STAGE BAR ─── */}
        <div style={{ marginBottom: 18 }}>
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
        <div style={{ marginBottom: 16 }}>
          <button className="btn-primary" onClick={handleStart}>
            {startLabel}
          </button>
        </div>

        {/* ─── SECTION LABEL ─── */}
        <p style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 10, fontWeight: 700,
          letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.25)",
          marginBottom: 10,
        }}>
          COMMAND CENTER
        </p>

        {/* ─── 2-COL CARDS: ASSESS | PROGRAM ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <button className="cmd-card" onClick={() => navigate("/assess")} style={{ height: 110 }}>
            <div style={{ padding: "18px 14px" }}>
              <div style={{ marginBottom: 6 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="3" width="16" height="18" rx="2" stroke="#FF4500" strokeWidth="1.5"/>
                  <path d="M8 8h8M8 12h8M8 16h5" stroke="#FF4500" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="17" cy="16" r="3" fill="#FF4500" opacity="0.3" stroke="#FF4500" strokeWidth="1"/>
                  <path d="M15.5 16l1 1 2-2" stroke="#FF4500" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 18, letterSpacing: "0.06em", color: "var(--text-primary)",
              }}>ASSESS</div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
                marginTop: 2,
              }}>Pain · Movement</div>
            </div>
          </button>

          <button className="cmd-card" onClick={() => navigate("/program")} style={{ height: 110 }}>
            <div style={{ padding: "18px 14px" }}>
              <div style={{ marginBottom: 6 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="5" width="18" height="16" rx="2" stroke="#C8973A" strokeWidth="1.5"/>
                  <path d="M3 9h18" stroke="#C8973A" strokeWidth="1.5"/>
                  <path d="M8 3v4M16 3v4" stroke="#C8973A" strokeWidth="1.5" strokeLinecap="round"/>
                  <rect x="7" y="13" width="3" height="3" rx="0.5" fill="#C8973A" opacity="0.7"/>
                  <rect x="14" y="13" width="3" height="3" rx="0.5" fill="#C8973A" opacity="0.4"/>
                </svg>
              </div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 18, letterSpacing: "0.06em", color: "var(--text-primary)",
              }}>PROGRAM</div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
                marginTop: 2,
              }}>4-Week Plan</div>
            </div>
          </button>
        </div>

        {/* ─── 2-COL CARDS: PANTHER BRAIN | EVOLVE ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <button className="cmd-card" onClick={() => navigate("/panther")} style={{ height: 110 }}>
            <div style={{ padding: "18px 14px" }}>
              <div style={{ marginBottom: 6 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3C8.5 3 6 5.5 6 8.5c0 1.5.5 2.8 1.4 3.8C6.5 13.2 6 14.3 6 15.5 6 18 7.8 20 10 20h4c2.2 0 4-2 4-4.5 0-1.2-.5-2.3-1.4-3.2C17.5 11.3 18 10 18 8.5 18 5.5 15.5 3 12 3z" stroke="#4a9eff" strokeWidth="1.5"/>
                  <path d="M9 10.5c0 0 1-1 3-1s3 1 3 1" stroke="#4a9eff" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
                  <circle cx="12" cy="8" r="1" fill="#4a9eff" opacity="0.8"/>
                  <path d="M10 15h4" stroke="#4a9eff" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
                </svg>
              </div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 18, letterSpacing: "0.06em", color: "#4a9eff",
              }}>PANTHER BRAIN</div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
                marginTop: 2,
              }}>AI Coach</div>
            </div>
          </button>

          <button className="cmd-card" onClick={() => navigate("/evolve")} style={{ height: 110 }}>
            <div style={{ padding: "18px 14px" }}>
              <div style={{ marginBottom: 6 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 3L6 13h6l-1 8 9-10h-6l1-8z" stroke="#C8973A" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(200,151,58,0.15)"/>
                </svg>
              </div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 18, letterSpacing: "0.06em", color: "#C8973A",
              }}>EVOLVE</div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
                marginTop: 2,
              }}>XP · Stages</div>
            </div>
          </button>
        </div>

        {/* ─── FULL-WIDTH: 30-DAY CHALLENGE ─── */}
        <button
          className="cmd-card"
          onClick={() => navigate("/challenge")}
          style={{ width: "100%", marginBottom: 10, display: "block" }}
        >
          <div style={{ position: "relative", height: 120, overflow: "hidden" }}>
            <img
              src={CHALLENGE_IMG}
              alt="30-Day Challenge"
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover",
                objectPosition: "center 30%",
                filter: "brightness(0.45) saturate(1.1)",
              }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to right, rgba(8,8,8,0.9) 0%, rgba(8,8,8,0.4) 60%, transparent 100%)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute",
              left: 16, top: "50%",
              transform: "translateY(-50%)",
            }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 9, fontWeight: 700,
                letterSpacing: "0.22em",
                color: "#FF4500",
                marginBottom: 4,
              }}>
                NEW PROGRAM
              </div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 22, letterSpacing: "0.06em",
                color: "var(--text-primary)", lineHeight: 1,
              }}>
                30-DAY PANTHER<br />MINDSET CHALLENGE
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.4)",
                marginTop: 4,
              }}>
                Control · Patience · Precision · Power
              </div>
            </div>
          </div>
        </button>

        {/* ─── BOA SCAN ─── */}
        <button
          className="cmd-card"
          onClick={() => navigate("/boa")}
          style={{ width: "100%", display: "block" }}
        >
          <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ marginRight: 0 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="7" width="20" height="14" rx="2" stroke="#22c55e" strokeWidth="1.5"/>
                <circle cx="12" cy="14" r="3.5" stroke="#22c55e" strokeWidth="1.5"/>
                <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" stroke="#22c55e" strokeWidth="1.5"/>
                <path d="M5 5h1M5 19h1M18 5h1M18 19h1" stroke="#22c55e" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </div>
            <div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 18, letterSpacing: "0.06em",
                color: "#22c55e",
              }}>
                BOA SCAN
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
              }}>
                Biomechanical Overlay Analysis
              </div>
            </div>
            <div style={{ marginLeft: "auto", color: "rgba(255,255,255,0.2)", fontSize: 18 }}>›</div>
          </div>
        </button>

        {/* ─── MEMBERSHIP ─── */}
        <button
          className="cmd-card"
          onClick={() => navigate("/pricing")}
          style={{ width: "100%", display: "block" }}
        >
          <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ marginRight: 0 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  stroke="#FF4500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  fill="rgba(255,69,0,0.08)"/>
              </svg>
            </div>
            <div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 18, letterSpacing: "0.06em",
                color: "#FF4500",
              }}>
                MEMBERSHIP
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
              }}>
                Plans · Pricing · Prestige Labs
              </div>
            </div>
            <div style={{ marginLeft: "auto", color: "rgba(255,255,255,0.2)", fontSize: 18 }}>›</div>
          </div>
        </button>

        {/* ─── PANTHER SCHEDULER ─── hidden until calendar bugs resolved ─── */}

        {/* ─── FUEL DIRECTIVE MINI-CARD ─── */}
        {(fuelDirective || fuelSummary) && (
          <button
            onClick={() => navigate("/fuel-track")}
            style={{
              width: "100%", display: "block", marginTop: 10,
              background: "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.03) 100%)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: 16, padding: "14px 16px", cursor: "pointer", textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: fuelDirective ? 8 : 0 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }}/>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#22c55e" }}>PANTHER FUEL DIRECTIVE</span>
              {fuelSummary && (
                <span style={{ marginLeft: "auto", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  {fuelSummary.calories} / {fuelSummary.target} kcal · {fuelSummary.protein}g protein
                </span>
              )}
            </div>
            {fuelDirective && (
              <div style={{
                fontFamily: "'Barlow', sans-serif", fontSize: 12,
                color: "rgba(255,255,255,0.65)", lineHeight: 1.5,
                display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {fuelDirective}
              </div>
            )}
          </button>
        )}

        {/* ─── FUEL TRACKER ─── */}
        <button
          className="cmd-card"
          onClick={() => navigate("/fuel-track")}
          style={{ width: "100%", display: "block", marginTop: 10 }}
        >
          <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 14 }}>
            <div>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="#22c55e" strokeWidth="1.5" fill="rgba(34,197,94,0.08)"/>
                <path d="M12 8v4l2.5 2.5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.5 4.5C8.8 3.6 10.3 3 12 3" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 18, letterSpacing: "0.06em",
                color: "#22c55e",
              }}>
                FUEL TRACKER
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
              }}>
                Macros · Meals · Panther Directive
              </div>
            </div>
            <div style={{ marginLeft: "auto", color: "rgba(255,255,255,0.2)", fontSize: 18 }}>›</div>
          </div>
        </button>

        {/* ─── MINDSET CHALLENGE ─── */}
        <button
          className="cmd-card"
          onClick={() => navigate("/mindset")}
          style={{ width: "100%", display: "block", marginTop: 10 }}
        >
          <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 14 }}>
            <div>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="#8b5cf6" strokeWidth="1.5" fill="rgba(139,92,246,0.08)"/>
                <path d="M9 12l2 2 4-4" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 18, letterSpacing: "0.06em",
                color: "#8b5cf6",
              }}>
                MINDSET CHALLENGE
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
              }}>
                30 Days · 6 Phases · Identity Transformation
              </div>
            </div>
            <div style={{ marginLeft: "auto", color: "rgba(255,255,255,0.2)", fontSize: 18 }}>›</div>
          </div>
        </button>

      </main>

      {/* ─── STICKY STRIP (Option A) ─── */}
      <TufSocialStickyStrip />
    </div>
  );
}
