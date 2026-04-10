/**
 * TUF HOME — v4.2 Command Center
 * Logo: panther mascot image with blended overlay (full body + glow halo + scan ring)
 * Layout:
 *   - Hero logo (panther mascot with UP overlay)
 *   - Greeting + tagline
 *   - XP / Stage bar
 *   - Full-width START WORKOUT CTA
 *   - 2-col section cards: ASSESS | PROGRAM
 *   - 2-col section cards: JARVIS | EVOLVE
 *   - Full-width: 30-DAY CHALLENGE
 */
import { useLocation } from "wouter";
import { XPBar } from "@/components/v4Components";
import { ls, getStageFromXP } from "@/data/v4constants";
import { TufSocialStickyStrip } from "@/components/TufSocialFooter";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";
const PANTHER_MASCOT = `${CDN}/panther-mascot-gym_27e64ae1.png`;
const CHALLENGE_IMG  = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/challenge-hero-panther_60538eb1.jpg";

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
    <div style={{ minHeight: "100vh", background: "#080808", paddingBottom: 80 }}>
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

        {/* ─── HERO LOGO ─── */}
        <div style={{ paddingTop: 24, marginBottom: 20, display: "flex", justifyContent: "center" }}>
          <div style={{
            width: 160,
            height: 200,
            borderRadius: 20,
            overflow: "hidden",
            position: "relative",
            border: "1px solid rgba(255,69,0,0.25)",
            boxShadow: "0 0 40px rgba(255,69,0,0.15), 0 12px 40px rgba(0,0,0,0.6)",
          }}>
            {/* Panther mascot — full body, darkened */}
            <img
              src={PANTHER_MASCOT}
              alt="TUF Panther"
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover",
                objectPosition: "center 18%",
                filter: "brightness(0.5) saturate(1.2)",
              }}
            />
            {/* Edge vignette */}
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse 65% 60% at 50% 45%, transparent 0%, rgba(8,8,8,0.4) 60%, rgba(8,8,8,0.75) 100%)",
              pointerEvents: "none",
            }} />
            {/* Spotlight on chest */}
            <div style={{
              position: "absolute",
              left: "50%", top: "60%",
              transform: "translate(-50%, -50%)",
              width: 90, height: 60,
              background: "radial-gradient(ellipse at center, rgba(255,255,255,0.22) 0%, transparent 70%)",
              borderRadius: "50%",
              pointerEvents: "none",
            }} />
            {/* Red glow halo */}
            <div
              className="logo-halo"
              style={{
                position: "absolute",
                left: "50%", top: "60%",
                transform: "translate(-50%, -50%)",
                width: 80, height: 52,
                background: "radial-gradient(ellipse at center, rgba(255,69,0,0.55) 0%, rgba(255,69,0,0.15) 55%, transparent 80%)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />
            {/* Scan ring */}
            <div
              className="logo-ring"
              style={{
                position: "absolute",
                left: "50%", top: "60%",
                transform: "translate(-50%, -50%)",
                width: 64, height: 44,
                border: "1.5px solid rgba(255,69,0,0.65)",
                borderRadius: 8,
                pointerEvents: "none",
              }}
            />
            {/* Scan label */}
            <div style={{
              position: "absolute",
              left: "50%", top: "calc(60% + 26px)",
              transform: "translateX(-50%)",
              fontSize: 7, fontWeight: 700,
              letterSpacing: "0.2em",
              color: "rgba(255,69,0,0.6)",
              whiteSpace: "nowrap",
              fontFamily: "'Barlow Condensed', sans-serif",
              pointerEvents: "none",
            }}>
              ▸ UP MARK
            </div>
            {/* Bottom fade */}
            <div style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0,
              height: "30%",
              background: "linear-gradient(to top, rgba(8,8,8,0.95) 0%, transparent 100%)",
              pointerEvents: "none",
            }} />
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
            color: "#fff", lineHeight: 1.08, margin: 0,
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
              <div style={{ fontSize: 28, marginBottom: 6 }}>📋</div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 18, letterSpacing: "0.06em", color: "#fff",
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
              <div style={{ fontSize: 28, marginBottom: 6 }}>🗓</div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 18, letterSpacing: "0.06em", color: "#fff",
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

        {/* ─── 2-COL CARDS: JARVIS | EVOLVE ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <button className="cmd-card" onClick={() => navigate("/jarvis")} style={{ height: 110 }}>
            <div style={{ padding: "18px 14px" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🐆</div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 18, letterSpacing: "0.06em", color: "#4a9eff",
              }}>JARVIS</div>
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
              <div style={{ fontSize: 28, marginBottom: 6 }}>⚡</div>
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
                color: "#fff", lineHeight: 1,
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
            <div style={{ fontSize: 32 }}>📷</div>
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

      </main>

      {/* ─── STICKY STRIP (Option A) ─── */}
      <TufSocialStickyStrip />
    </div>
  );
}
