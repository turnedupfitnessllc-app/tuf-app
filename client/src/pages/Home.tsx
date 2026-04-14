/**
 * TUF HOME — v5.0 Command Center
 * Doc 14 — Button Design Fix
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 *
 * Layout (corrected order per Doc 14):
 *   1. Header — TUF logo + theme toggle + M button (TufHeader handles this)
 *   2. PANTHER BRAIN hero card — full width, orange border 2px + glow
 *   3. EVOLVE card — full width, gold border
 *   4. 30-Day Panther Mindset Challenge — full width, image card
 *   5. BOA SCAN — NavCard, green border
 *   6. FUEL TRACKER — NavCard, orange border (reference standard)
 *   7. HEALTH INTELLIGENCE — NavCard, blue border
 *   8. MEMBERSHIP — NavCard, gold border (moved to bottom)
 *   9. Social media icons row
 */
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { XPBar } from "@/components/v4Components";
import { ls, getStageFromXP } from "@/data/v4constants";
import { useProgress } from "@/hooks/useProgress";
import { TufSocialStickyStrip } from "@/components/TufSocialFooter";
import NavCard from "@/components/NavCard";
import PantherBrainCard from "@/components/PantherBrainCard";
import EvolveCard from "@/components/EvolveCard";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";
const PANTHER_MASCOT = `${CDN}/panther-mascot-gym_27e64ae1.png`;
const CHALLENGE_IMG  = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/challenge-hero-panther_60538eb1.jpg";

// ── SVG ICONS ──────────────────────────────────────────────────────────────────

const BoaIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="7" width="20" height="14" rx="2" stroke="#00CC66" strokeWidth="1.5"/>
    <circle cx="12" cy="14" r="3.5" stroke="#00CC66" strokeWidth="1.5"/>
    <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" stroke="#00CC66" strokeWidth="1.5"/>
    <path d="M5 5h1M5 19h1M18 5h1M18 19h1" stroke="#00CC66" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

const FuelIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="#00CC66" strokeWidth="1.5" fill="rgba(0,204,102,0.08)"/>
    <path d="M12 8v4l2.5 2.5" stroke="#00CC66" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.5 4.5C8.8 3.6 10.3 3 12 3" stroke="#00CC66" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const HealthIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12h4l3-9 4 18 3-9h4" stroke="#4488FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="9" stroke="#4488FF" strokeWidth="1" opacity="0.2"/>
  </svg>
);

const MembershipIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke="#C8973A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      fill="rgba(200,151,58,0.08)"/>
  </svg>
);

// ── COMPONENT ──────────────────────────────────────────────────────────────────

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

  const { progress } = useProgress();
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
        @keyframes glowPulse { 0%,100%{box-shadow:0 4px 24px rgba(255,102,0,0.4)} 50%{box-shadow:0 4px 56px rgba(255,102,0,0.75)} }
        @keyframes ringPulse {
          0%,100% { box-shadow: 0 0 14px rgba(255,102,0,0.5), inset 0 0 10px rgba(255,102,0,0.08); }
          50%     { box-shadow: 0 0 30px rgba(255,102,0,0.9), inset 0 0 18px rgba(255,102,0,0.18); }
        }
        @keyframes haloPulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .tuf-home  { animation: fadeUp 0.45s ease both; }

        .btn-primary {
          display: block; width: 100%;
          padding: 18px 24px;
          background: #FF6600;
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

        .logo-ring { animation: ringPulse 2.5s ease-in-out infinite; }
        .logo-halo { animation: haloPulse 2.5s ease-in-out infinite; }

        /* Challenge card */
        .challenge-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid rgba(255,102,0,0.3);
          transition: transform 0.15s ease;
          background: var(--bg-secondary);
          width: 100%;
          display: block;
          margin-bottom: 8px;
        }
        .challenge-card:active { transform: scale(0.98); }

        /* 2-col assess/program cards */
        .cmd-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.07);
          transition: transform 0.15s ease, border-color 0.15s ease;
          background: var(--bg-secondary);
        }
        .cmd-card:active { transform: scale(0.97); }
        .cmd-card:hover  { border-color: rgba(255,102,0,0.3); }
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
            border: "1px solid rgba(255,102,0,0.2)",
            boxShadow: "0 0 40px rgba(255,102,0,0.12), 0 12px 40px rgba(0,0,0,0.6)",
          }}>
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
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to right, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.3) 50%, transparent 100%)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0,
              height: "35%",
              background: "linear-gradient(to top, rgba(8,8,8,0.9) 0%, transparent 100%)",
              pointerEvents: "none",
            }} />
            <div
              className="logo-halo"
              style={{
                position: "absolute",
                right: "30%", top: "55%",
                transform: "translate(50%, -50%)",
                width: 100, height: 70,
                background: "radial-gradient(ellipse at center, rgba(255,102,0,0.45) 0%, rgba(255,102,0,0.1) 55%, transparent 80%)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />
            <div
              className="logo-ring"
              style={{
                position: "absolute",
                right: "30%", top: "55%",
                transform: "translate(50%, -50%)",
                width: 72, height: 50,
                border: "1.5px solid rgba(255,102,0,0.6)",
                borderRadius: 8,
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "absolute", left: 18, bottom: 18 }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 9, fontWeight: 700,
                letterSpacing: "0.22em",
                color: "rgba(255,102,0,0.85)",
                marginBottom: 3,
              }}>
                TURNED UP FITNESS
              </div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 28, letterSpacing: "0.06em",
                color: "var(--text-primary)", lineHeight: 1,
              }}>
                THE PANTHER <span style={{ color: "#FF6600" }}>SYSTEM</span>
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
            color: "var(--text-tertiary)",
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
            <span style={{ color: "#FF6600" }}>WITH PRECISION?</span>
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
                color: "var(--text-tertiary)",
              }}>
                {sessions} SESSION{sessions !== 1 ? "S" : ""}
              </span>
            </div>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", color: "#FF6600",
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

        {/* ─── 2-COL CARDS: ASSESS | PROGRAM ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <button className="cmd-card" onClick={() => navigate("/assess")} style={{ height: 110 }}>
            <div style={{ padding: "18px 14px" }}>
              <div style={{ marginBottom: 6 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="3" width="16" height="18" rx="2" stroke="#FF6600" strokeWidth="1.5"/>
                  <path d="M8 8h8M8 12h8M8 16h5" stroke="#FF6600" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="17" cy="16" r="3" fill="#FF6600" opacity="0.3" stroke="#FF6600" strokeWidth="1"/>
                  <path d="M15.5 16l1 1 2-2" stroke="#FF6600" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
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
                color: "var(--text-tertiary)",
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
                color: "var(--text-tertiary)",
                marginTop: 2,
              }}>4-Week Plan</div>
            </div>
          </button>
        </div>

        {/* ─── SECTION LABEL ─── */}
        <p style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 10, fontWeight: 700,
          letterSpacing: "0.2em",
          color: "var(--text-tertiary)",
          marginBottom: 10,
          marginTop: 0,
        }}>
          COMMAND CENTER
        </p>

        {/* ── 1. PANTHER BRAIN — Hero Card (most important) ── */}
        <PantherBrainCard onClick={() => navigate("/panther")} />

        {/* ── 2. EVOLVE — Full-width gold card ── */}
        <EvolveCard
          xpPoints={xp}
          xpLevel={stage}
          onClick={() => navigate("/evolve")}
        />

        {/* ── 3. 30-DAY PANTHER MINDSET CHALLENGE — Image card ── */}
        <button
          className="challenge-card"
          onClick={() => navigate("/challenge")}
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
                color: "#FF6600",
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

        {/* ── 4. BOA SCAN — Green border ── */}
        <NavCard
          icon={<BoaIcon />}
          title="BOA SCAN"
          subtitle="Biomechanical Overlay Analysis"
          titleColor="#00CC66"
          borderColor="#00CC66"
          onClick={() => navigate("/boa")}
        />

        {/* ── 5. FUEL TRACKER — Orange border (reference standard) ── */}
        {(fuelDirective || fuelSummary) && (
          <button
            onClick={() => navigate("/fuel-track")}
            style={{
              width: "100%", display: "block",
              background: "linear-gradient(135deg, rgba(0,204,102,0.08) 0%, rgba(0,204,102,0.03) 100%)",
              border: "1px solid rgba(0,204,102,0.25)",
              borderRadius: 12, padding: "12px 16px", cursor: "pointer", textAlign: "left",
              marginBottom: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: fuelDirective ? 6 : 0 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00CC66" }}/>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#00CC66" }}>PANTHER FUEL DIRECTIVE</span>
              {fuelSummary && (
                <span style={{ marginLeft: "auto", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "var(--text-tertiary)" }}>
                  {fuelSummary.calories} / {fuelSummary.target} kcal · {fuelSummary.protein}g protein
                </span>
              )}
            </div>
            {fuelDirective && (
              <div style={{
                fontFamily: "'Barlow', sans-serif", fontSize: 12,
                color: "var(--text-secondary)", lineHeight: 1.5,
                display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {fuelDirective}
              </div>
            )}
          </button>
        )}

        <NavCard
          icon={<FuelIcon />}
          title="FUEL TRACKER"
          subtitle="Macros · Meals · Panther Directive"
          titleColor="#FF6600"
          borderColor="#FF6600"
          onClick={() => navigate("/fuel-track")}
        />

        {/* ── 6. HEALTH INTELLIGENCE — Blue border ── */}
        <NavCard
          icon={<HealthIcon />}
          title="HEALTH INTELLIGENCE"
          subtitle="PopHIVE · Obesity · Diabetes · Illness Alerts"
          titleColor="#4488FF"
          borderColor="#4488FF"
          onClick={() => navigate("/health-intel")}
        />

        {/* ── 7. MEMBERSHIP — Gold border (moved to bottom) ── */}
        <NavCard
          icon={<MembershipIcon />}
          title="MEMBERSHIP"
          subtitle="Plans · Pricing · Prestige Labs"
          titleColor="#C8973A"
          borderColor="#C8973A"
          onClick={() => navigate("/pricing")}
        />

      </main>

      {/* ─── STICKY STRIP ─── */}
      <TufSocialStickyStrip />
    </div>
  );
}
