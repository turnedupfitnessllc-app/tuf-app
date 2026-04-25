/**
 * TUF HOME — v8.0 Command Center
 * Hamburger nav replaces nav cards — full real estate for content.
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { XPBar } from "@/components/v4Components";
import { ls, getStageFromXP } from "@/data/v4constants";
import { useProgress } from "@/hooks/useProgress";
import { TufSocialStickyStrip } from "@/components/TufSocialFooter";
import { useUpsell } from "@/hooks/useUpsell";
import UpsellModal from "@/components/UpsellModal";
import MealsOfWeekCard from "@/components/MealsOfWeekCard";
import { PantherGreeting } from "@/components/PantherGreeting";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";
const PANTHER_MASCOT = `${CDN}/panther-mascot-gym_27e64ae1.png`;

// ── Quick action shortcuts (replaces nav cards) ──────────────────────────────
const QUICK_ACTIONS = [
  { label: "TRAIN",  icon: "🏋️", route: "/move",          color: "#FF6600" },
  { label: "ASSESS", icon: "👁️", route: "/boa",           color: "#00FFC6" },
  { label: "FUEL",   icon: "🔥", route: "/fuel",          color: "#FF6600" },
  { label: "BRAIN",  icon: "🐆", route: "/panther-brain", color: "#00FFC6" },
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
  const timeGreeting =
    hour < 5  ? "STILL UP" :
    hour < 12 ? "GOOD MORNING" :
    hour < 17 ? "GOOD AFTERNOON" :
    hour < 21 ? "GOOD EVENING" : "LATE SESSION";

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
    <AppShell bottomPad={80}>
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
        @keyframes heroBreathe {
          0%,100% { transform: scale(1);    filter: brightness(0.4) saturate(1.2); }
          50%     { transform: scale(1.025); filter: brightness(0.45) saturate(1.4); }
        }
        @keyframes heroScanLine {
          0%   { top: 0%;   opacity: 0; }
          5%   { opacity: 0.4; }
          95%  { opacity: 0.4; }
          100% { top: 100%; opacity: 0; }
        }
        .hero-breathe  { animation: heroBreathe 5s ease-in-out infinite; }
        .hero-scanline { animation: heroScanLine 6s ease-in-out 3s infinite; }

        .tuf-home { animation: fadeUp 0.4s ease both; }
        .quick-action {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 6px; padding: 14px 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.1s;
          flex: 1;
        }
        .quick-action:active { transform: scale(0.94); }

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

      <div className="tuf-home" style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* ─── LIVING PANTHER GREETING ─── */}
        <div style={{ paddingTop: 16, marginBottom: 20 }}>
          <PantherGreeting className="w-full" />
        </div>

        {/* ─── STATS ROW ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "STREAK",   value: `${streak}🔥`, color: streak >= 7 ? "#FF3B3B" : streak >= 3 ? "#00FFC6" : "#555" },
            { label: "SESSIONS", value: sessions,       color: "#fff" },
            { label: "XP",       value: xp,             color: "#00FFC6" },
            { label: "STAGE",    value: stage.split(" ")[0], color: "#00FFC6" },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "rgba(0,255,198,0.04)",
              border: "1px solid rgba(0,255,198,0.1)",
              borderRadius: 12, padding: "10px 8px", textAlign: "center",
            }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
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

        {/* ─── QUICK ACTIONS ─── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.2)", marginBottom: 10,
          }}>QUICK ACCESS</div>
          <div style={{ display: "flex", gap: 8 }}>
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.route}
                className="quick-action"
                onClick={() => navigate(action.route)}
              >
                <span style={{ fontSize: 22 }}>{action.icon}</span>
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.18em",
                  color: action.color,
                }}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── MEALS OF THE WEEK ─── */}
        <MealsOfWeekCard />

        {/* ─── RECENT ACTIVITY ─── */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16, padding: 16, marginBottom: 20,
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.2)", marginBottom: 12,
          }}>RECENT ACTIVITY</div>
          {sessions === 0 ? (
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 14, color: "rgba(255,255,255,0.3)",
              textAlign: "center", padding: "12px 0",
            }}>No sessions yet — start your first workout above.</div>
          ) : (
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span>{sessions} session{sessions !== 1 ? "s" : ""} completed</span>
                <span style={{ color: "#00FFC6" }}>{xp} XP</span>
              </div>
              <div style={{ paddingTop: 8, color: "#FF6600" }}>
                {streak > 0 ? `🔥 ${streak}-day streak — keep it going` : "Start a streak today"}
              </div>
            </div>
          )}
        </div>

      </div>

      <TufSocialStickyStrip />
    </AppShell>
  );
}
