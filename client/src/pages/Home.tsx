/**
 * TUF HOME — v6.0 Command Center
 * Doc 15 — Gradient Image Buttons
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
import GradientNavCard from "@/components/GradientNavCard";
import { HOME_BUTTONS } from "@/config/homeButtonConfig";
import { Brain, Zap, Flame, Camera, Utensils, Activity, Star } from "lucide-react";

// Icon map for homeButtonConfig
const ICON_MAP: Record<string, React.ReactNode> = {
  Brain: <Brain size={28} />,
  Zap: <Zap size={24} />,
  Flame: <Flame size={24} />,
  Camera: <Camera size={24} />,
  Utensils: <Utensils size={24} />,
  Activity: <Activity size={24} />,
  Star: <Star size={24} />,
};

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";
const PANTHER_MASCOT = `${CDN}/panther-mascot-gym_27e64ae1.png`;


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

        {/* ── GRADIENT IMAGE BUTTONS — Doc 15 ── */}
        {HOME_BUTTONS.map((btn) => (
          <GradientNavCard
            key={btn.id}
            icon={ICON_MAP[btn.iconName] || <Brain size={24} />}
            title={btn.title}
            subtitle={btn.id === "evolve" ? `${stage} · ${xp} XP` : btn.subtitle}
            titleColor={btn.titleColor}
            borderColor={btn.borderColor}
            gradientColor={btn.gradientColor}
            imageSrc={btn.imageSrc}
            hero={btn.hero}
            locked={btn.locked}
            onClick={() => navigate(btn.route)}
          />
        ))}

      </main>

      {/* ─── STICKY STRIP ─── */}
      <TufSocialStickyStrip />
    </div>
  );
}
