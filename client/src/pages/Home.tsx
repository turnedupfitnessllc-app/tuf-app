/**
 * TUF HOME — v7.0 Neon Minimal
 * Clean command center: hero → stats → 1 primary CTA → 4 nav cards
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { XPBar } from "@/components/v4Components";
import { ls, getStageFromXP } from "@/data/v4constants";
import { useProgress } from "@/hooks/useProgress";
import { TufSocialStickyStrip } from "@/components/TufSocialFooter";
import { useUpsell } from "@/hooks/useUpsell";
import UpsellModal from "@/components/UpsellModal";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";
const PANTHER_MASCOT = `${CDN}/panther-mascot-gym_27e64ae1.png`;

// ── 4 core nav destinations (reduced from 13 elements) ──────────────────────
const CORE_NAV = [
  {
    id: "panther",
    label: "PANTHER BRAIN",
    sub: "AI Performance Coach",
    icon: "🧠",
    color: "#00FFC6",
    route: "/panther",
    img: `${CDN}/btn_panther_brain_debd99f9.jpg`,
  },
  {
    id: "assess",
    label: "ASSESS",
    sub: "Pain · Movement · Form",
    icon: "📋",
    color: "#00FFC6",
    route: "/assess",
    img: `${CDN}/btn_boa_scan_ed4e58b5.jpg`,
  },
  {
    id: "fuel",
    label: "FUEL",
    sub: "Macros · Meals · Directive",
    icon: "⚡",
    color: "#00FFC6",
    route: "/fuel",
    img: `${CDN}/btn_fuel_tracker_a518a0fc.jpg`,
  },
  {
    id: "evolve",
    label: "EVOLVE",
    sub: "XP · Stages · Level Up",
    icon: "🐆",
    color: "#00FFC6",
    route: "/evolve",
    img: `${CDN}/btn_evolve_0c04bc54.jpg`,
  },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [fuelDirective, setFuelDirective] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("tuf_user_id") || "guest";
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/fuel/log/${userId}/${today}`)
      .then(r => r.ok ? r.json() : null)
      .then(log => { if (log?.pantherDirective) setFuelDirective(log.pantherDirective); })
      .catch(() => {});
  }, []);

  const { progress } = useProgress();
  const correctives = ls.get<{ issue?: { label: string } } | null>("tuf_correctives", null);

  const xp       = progress.xp || 0;
  const streak   = progress.streakDays || 0;
  const sessions = progress.sessionsCompleted || 0;
  const stage    = getStageFromXP(xp);
  const isNew    = sessions === 0;

  const { shouldShow: showUpsell, tier: upsellTier, dismiss: dismissUpsell } = useUpsell();

  const rawProfile = localStorage.getItem("tuf_profile");
  const profile    = rawProfile ? JSON.parse(rawProfile) : {};
  const tier       = localStorage.getItem("tuf_tier") || "free";
  const userName   = profile.name || "Athlete";

  const TIER_COLORS: Record<string, string> = {
    free: "#555", starter: "#00FFC6", advanced: "#00FFC6", member: "#00FFC6",
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 5  ? `STILL UP, ${userName.toUpperCase()}?` :
    hour < 12 ? `GOOD MORNING, ${userName.toUpperCase()}.` :
    hour < 17 ? `GOOD AFTERNOON, ${userName.toUpperCase()}.` :
    hour < 21 ? `GOOD EVENING, ${userName.toUpperCase()}.` : `LATE SESSION, ${userName.toUpperCase()}.`;

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
      {showUpsell && <UpsellModal tier={upsellTier} onDismiss={dismissUpsell} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');

        @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes neonPulse { 0%,100%{box-shadow:0 4px 24px rgba(0,255,198,0.35)} 50%{box-shadow:0 4px 56px rgba(0,255,198,0.65)} }
        @keyframes ringPulse {
          0%,100% { box-shadow: 0 0 14px rgba(0,255,198,0.4), inset 0 0 10px rgba(0,255,198,0.06); }
          50%     { box-shadow: 0 0 30px rgba(0,255,198,0.8), inset 0 0 18px rgba(0,255,198,0.14); }
        }
        @keyframes haloPulse { 0%,100%{opacity:1} 50%{opacity:0.55} }

        .tuf-home { animation: fadeUp 0.4s ease both; }

        .btn-start {
          display: block; width: 100%;
          padding: 18px 24px;
          background: transparent;
          border: 1.5px solid #00FFC6;
          border-radius: 14px;
          color: #00FFC6;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 18px; font-weight: 900;
          letter-spacing: 0.14em;
          cursor: pointer;
          animation: neonPulse 3s ease-in-out infinite;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .btn-start:active { transform: scale(0.97); background: rgba(0,255,198,0.08); animation: none; }

        .logo-ring { animation: ringPulse 2.5s ease-in-out infinite; }
        .logo-halo { animation: haloPulse 2.5s ease-in-out infinite; }

        .nav-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid rgba(0,255,198,0.18);
          transition: transform 0.12s ease, border-color 0.15s ease;
          background: #0D0D0D;
          height: 120px;
        }
        .nav-card:active { transform: scale(0.97); }
        .nav-card:hover  { border-color: rgba(0,255,198,0.45); }
      `}</style>

      <main className="tuf-home" style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* ─── HERO BANNER ─── */}
        <div style={{ paddingTop: 0, marginBottom: 20 }}>
          <div style={{
            width: "100%", height: 220,
            borderRadius: 20, overflow: "hidden",
            position: "relative",
            border: "1px solid rgba(0,255,198,0.2)",
            boxShadow: "0 0 40px rgba(0,255,198,0.1), 0 12px 40px rgba(0,0,0,0.7)",
          }}>
            <img
              src={PANTHER_MASCOT}
              alt="TUF Panther"
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center 15%",
                filter: "brightness(0.4) saturate(1.2)",
              }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to right, rgba(11,11,11,0.9) 0%, rgba(11,11,11,0.3) 55%, transparent 100%)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
              background: "linear-gradient(to top, rgba(11,11,11,0.95) 0%, transparent 100%)",
              pointerEvents: "none",
            }} />
            {/* Neon halo */}
            <div className="logo-halo" style={{
              position: "absolute", right: "28%", top: "52%",
              transform: "translate(50%, -50%)",
              width: 100, height: 70,
              background: "radial-gradient(ellipse at center, rgba(0,255,198,0.35) 0%, rgba(0,255,198,0.08) 55%, transparent 80%)",
              borderRadius: "50%", pointerEvents: "none",
            }} />
            <div className="logo-ring" style={{
              position: "absolute", right: "28%", top: "52%",
              transform: "translate(50%, -50%)",
              width: 72, height: 50,
              border: "1.5px solid rgba(0,255,198,0.55)",
              borderRadius: 8, pointerEvents: "none",
            }} />
            <div style={{ position: "absolute", left: 18, bottom: 18 }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 9, fontWeight: 700, letterSpacing: "0.22em",
                color: "rgba(0,255,198,0.75)", marginBottom: 3,
              }}>TURNED UP FITNESS</div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 28, letterSpacing: "0.06em",
                color: "#fff", lineHeight: 1,
              }}>
                THE PANTHER <span style={{ color: "#00FFC6" }}>SYSTEM</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── GREETING ─── */}
        <div style={{ marginBottom: 4, textAlign: "center" }}>
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.3)", margin: 0,
          }}>{greeting}</p>
        </div>

        {/* ─── TAGLINE ─── */}
        <div style={{ marginBottom: 18, textAlign: "center" }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 34, letterSpacing: "0.04em",
            color: "#fff", lineHeight: 1.08, margin: 0,
          }}>
            READY TO MOVE<br />
            <span style={{ color: "#00FFC6" }}>WITH PRECISION?</span>
          </h1>
        </div>

        {/* ─── STATS ROW (3 key metrics) ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "STREAK", value: `${streak}🔥`, color: streak >= 7 ? "#FF3B3B" : streak >= 3 ? "#00FFC6" : "#555" },
            { label: "SESSIONS", value: sessions, color: "#fff" },
            { label: "XP", value: xp, color: "#00FFC6" },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "rgba(0,255,198,0.04)",
              border: "1px solid rgba(0,255,198,0.1)",
              borderRadius: 12, padding: "10px 8px", textAlign: "center",
            }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "#444", marginTop: 3 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ─── TIER + XP BAR ─── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{
            padding: "3px 10px", borderRadius: 6,
            background: `${TIER_COLORS[tier]}15`,
            border: `1px solid ${TIER_COLORS[tier]}40`,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 10, fontWeight: 700, letterSpacing: 3,
            color: TIER_COLORS[tier],
          }}>
            {tier.toUpperCase()}
            {tier === "free" && (
              <span
                onClick={() => navigate("/pricing")}
                style={{ marginLeft: 8, color: "#00FFC6", cursor: "pointer", textDecoration: "underline" }}
              >UPGRADE</span>
            )}
          </div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#00FFC6" }}>
            {stage}
          </span>
        </div>
        <div style={{ marginBottom: 20 }}>
          <XPBar xp={xp} stage={stage} />
        </div>

        {/* ─── PRIMARY CTA ─── */}
        <div style={{ marginBottom: 20 }}>
          <button className="btn-start" onClick={handleStart}>
            {startLabel}
          </button>
        </div>

        {/* ─── PANTHER DIRECTIVE (conditional) ─── */}
        {fuelDirective && (
          <div style={{
            background: "rgba(0,255,198,0.04)",
            border: "1px solid rgba(0,255,198,0.15)",
            borderLeft: "3px solid #00FFC6",
            borderRadius: 12, padding: "14px 16px", marginBottom: 20,
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: "0.18em", color: "#00FFC6", marginBottom: 4 }}>
              TODAY'S DIRECTIVE
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
              {fuelDirective}
            </div>
          </div>
        )}

        {/* ─── 4 CORE NAV CARDS ─── */}
        <p style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.25)", marginBottom: 10, marginTop: 0,
        }}>COMMAND CENTER</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          {CORE_NAV.map(card => (
            <button key={card.id} className="nav-card" onClick={() => navigate(card.route)}>
              {/* Background image */}
              <img
                src={card.img}
                alt={card.label}
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "cover",
                  filter: "brightness(0.3) saturate(0.8)",
                }}
              />
              {/* Neon gradient overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: `linear-gradient(135deg, rgba(0,255,198,0.08) 0%, transparent 60%)`,
                pointerEvents: "none",
              }} />
              {/* Bottom fade */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: "60%",
                background: "linear-gradient(to top, rgba(11,11,11,0.95) 0%, transparent 100%)",
                pointerEvents: "none",
              }} />
              {/* Content */}
              <div style={{ position: "absolute", bottom: 14, left: 14, right: 14 }}>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 17, letterSpacing: "0.06em",
                  color: "#fff", lineHeight: 1, marginBottom: 2,
                }}>{card.label}</div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
                  color: "rgba(0,255,198,0.65)",
                }}>{card.sub}</div>
              </div>
            </button>
          ))}
        </div>

      </main>

      <TufSocialStickyStrip />
    </div>
  );
}
