/**
 * TUF Membership & Live Training Screen
 * Shows tier benefits, live session schedule, and upgrade CTA
 * Funnel: Free → $19 Starter → $79 Advanced → $20/mo Member
 */
import { useState } from "react";
import { useLocation } from "wouter";
import HamburgerDrawer from "@/components/HamburgerDrawer";

// ── Data ─────────────────────────────────────────────────────────────────────

const TIERS = [
  {
    id: "free",
    name: "FREE",
    price: "$0",
    period: "",
    color: "#888",
    glow: "rgba(136,136,136,0.1)",
    features: ["7-Day Starter Plan", "Basic corrective protocols", "Streak tracking", "Panther Brain daily tips"],
    cta: "CURRENT PLAN",
    ctaRoute: null,
    highlight: false,
  },
  {
    id: "starter",
    name: "STARTER",
    price: "$19",
    period: "one-time",
    color: "#FF6600",
    glow: "rgba(255,102,0,0.15)",
    features: ["30-Day Panther Program", "4-phase progression", "Panther Brain AI analysis", "XP & badge system", "Leaderboard access", "SuccessScreen celebrations"],
    cta: "GET STARTER →",
    ctaRoute: "/pricing",
    highlight: false,
  },
  {
    id: "advanced",
    name: "ADVANCED",
    price: "$79",
    period: "one-time",
    color: "#C8973A",
    glow: "rgba(200,151,58,0.15)",
    features: ["12-Week Advanced System", "Periodized programming", "BOA biomechanical analysis", "Strength + power focus", "Priority AI coaching", "Exclusive badges"],
    cta: "GET ADVANCED →",
    ctaRoute: "/pricing",
    highlight: true,
  },
  {
    id: "member",
    name: "MEMBER",
    price: "$20",
    period: "per month",
    color: "#9B59B6",
    glow: "rgba(155,89,182,0.2)",
    features: ["Everything in Advanced", "Live coaching sessions", "New programs monthly", "Season leaderboard", "PvP challenges", "Full AI coaching suite", "Exclusive member badges", "Early access to new features"],
    cta: "JOIN MEMBERSHIP →",
    ctaRoute: "/pricing",
    highlight: false,
  },
];

const LIVE_SESSIONS = [
  { day: "MON", time: "6:00 AM EST", title: "Morning Mobility Flow", coach: "Coach Marcus", tier: "member", spots: 12 },
  { day: "WED", time: "7:00 PM EST", title: "Strength Foundations", coach: "Coach Marcus", tier: "advanced", spots: 8 },
  { day: "FRI", time: "6:00 AM EST", title: "Panther Power Session", coach: "Coach Marcus", tier: "member", spots: 15 },
  { day: "SAT", time: "9:00 AM EST", title: "Weekend Warrior", coach: "Coach Marcus", tier: "member", spots: 20 },
];

const MEMBER_BENEFITS = [
  { icon: "🎯", title: "Live Coaching", desc: "Weekly live sessions with direct feedback" },
  { icon: "🤖", title: "Full AI Suite", desc: "Panther Brain + BOA + adaptive programming" },
  { icon: "🏆", title: "Season Leaderboard", desc: "Compete in monthly XP seasons" },
  { icon: "⚔️", title: "PvP Challenges", desc: "Real-time rep battles with other athletes" },
  { icon: "📱", title: "New Programs Monthly", desc: "Fresh content every month" },
  { icon: "🐆", title: "Panther Elite Badge", desc: "Exclusive member recognition" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Membership() {
  const [, navigate] = useLocation();
  const userTier = localStorage.getItem("tuf_tier") || "free";
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const tierOrder = ["free", "starter", "advanced", "member"];
  const userTierIdx = tierOrder.indexOf(userTier);

  return (
    <div style={{ minHeight: "100vh", background: "#080808", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .mem-fade { animation: fadeUp 0.4s ease both; }
        @keyframes glowPulse { 0%,100%{box-shadow:0 4px 24px rgba(155,89,182,0.3)} 50%{box-shadow:0 4px 48px rgba(155,89,182,0.6)} }
      `}</style>

      {/* Sticky header with hamburger */}
      <div style={{ position: "sticky", top: 0, zIndex: 200, background: "rgba(8,8,8,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,255,198,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 56 }}>
        <HamburgerDrawer />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 800, letterSpacing: "0.14em", color: "#fff", textTransform: "uppercase" }}>MEMBERSHIP</span>
        <div style={{ width: 44 }} />
      </div>
      <main className="mem-fade" style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* ─── HEADER ─── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 20, marginBottom: 8 }}>
          <div style={{ width: 44 }} />
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#FF6600" }}>TURNED UP FITNESS</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, lineHeight: 1, color: "#fff" }}>MEMBERSHIP</div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "#666", marginBottom: 24, paddingLeft: 4 }}>
          Upgrade your training. Unlock the full system.
        </p>

        {/* ─── MEMBER BENEFITS GRID ─── */}
        <div style={{
          background: "linear-gradient(135deg, rgba(155,89,182,0.1), rgba(155,89,182,0.05))",
          border: "1px solid rgba(155,89,182,0.3)",
          borderRadius: 20, padding: 20, marginBottom: 20,
        }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#9B59B6", marginBottom: 14 }}>
            MEMBER BENEFITS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {MEMBER_BENEFITS.map(b => (
              <div key={b.title} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>{b.title}</div>
                  <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── LIVE SESSION SCHEDULE ─── */}
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, padding: 16, marginBottom: 20,
        }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#888", marginBottom: 12 }}>
            LIVE SESSION SCHEDULE
          </div>
          {LIVE_SESSIONS.map((session, i) => {
            const sessionTierIdx = tierOrder.indexOf(session.tier);
            const isUnlocked = userTierIdx >= sessionTierIdx;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 0",
                borderBottom: i < LIVE_SESSIONS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                opacity: isUnlocked ? 1 : 0.5,
              }}>
                <div style={{
                  width: 40, textAlign: "center",
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 14,
                  color: "#FF6600",
                }}>
                  {session.day}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>{session.title}</div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{session.time} · {session.coach}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {isUnlocked ? (
                    <div style={{
                      padding: "4px 10px", borderRadius: 6,
                      background: "rgba(0,204,102,0.1)", border: "1px solid rgba(0,204,102,0.3)",
                      fontSize: 10, color: "#00cc66", fontWeight: 700,
                    }}>
                      {session.spots} SPOTS
                    </div>
                  ) : (
                    <div style={{ fontSize: 16 }}>🔒</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── TIER CARDS ─── */}
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#888", marginBottom: 12 }}>
          CHOOSE YOUR TIER
        </div>

        {TIERS.map((tier) => {
          const tierIdx = tierOrder.indexOf(tier.id);
          const isCurrent = tier.id === userTier;
          const isUpgrade = tierIdx > userTierIdx;
          const isSelected = selectedTier === tier.id;

          return (
            <div
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              style={{
                background: isSelected || tier.highlight ? `linear-gradient(135deg, #1a1a1a, #111)` : "rgba(255,255,255,0.03)",
                border: `1px solid ${isCurrent ? tier.color : isSelected ? tier.color : "rgba(255,255,255,0.08)"}`,
                borderRadius: 16, padding: 16, marginBottom: 10,
                cursor: "pointer",
                boxShadow: isCurrent || isSelected ? `0 0 20px ${tier.glow}` : "none",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{
                    display: "inline-block", padding: "2px 8px", borderRadius: 4,
                    background: `${tier.color}20`, border: `1px solid ${tier.color}50`,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 9, fontWeight: 700, letterSpacing: 3, color: tier.color,
                    marginBottom: 6,
                  }}>
                    {isCurrent ? "CURRENT" : tier.highlight ? "RECOMMENDED" : tier.name}
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#fff", letterSpacing: 2, lineHeight: 1 }}>
                    {tier.name}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: tier.color, lineHeight: 1 }}>{tier.price}</div>
                  {tier.period && <div style={{ fontSize: 10, color: "#666" }}>{tier.period}</div>}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 12 }}>
                {tier.features.slice(0, 4).map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 9, color: tier.color }}>✓</span>
                    <span style={{ fontSize: 10, color: "#888" }}>{f}</span>
                  </div>
                ))}
              </div>

              {!isCurrent && isUpgrade && (
                <button
                  onClick={(e) => { e.stopPropagation(); navigate("/pricing"); }}
                  style={{
                    width: "100%", padding: "10px",
                    background: `linear-gradient(135deg, ${tier.color}, ${tier.color}bb)`,
                    border: "none", borderRadius: 10,
                    color: "#fff", fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 13, fontWeight: 900, letterSpacing: 3,
                    cursor: "pointer",
                  }}
                >
                  {tier.cta}
                </button>
              )}

              {isCurrent && (
                <div style={{
                  width: "100%", padding: "10px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, textAlign: "center",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 13, fontWeight: 700, letterSpacing: 3, color: "#555",
                }}>
                  ✓ ACTIVE PLAN
                </div>
              )}
            </div>
          );
        })}

        {/* ─── GUARANTEE ─── */}
        <div style={{
          background: "rgba(0,204,102,0.05)", border: "1px solid rgba(0,204,102,0.15)",
          borderRadius: 14, padding: 16, marginBottom: 24, textAlign: "center",
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🛡️</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#00cc66", marginBottom: 4 }}>
            30-DAY GUARANTEE
          </div>
          <p style={{ fontSize: 11, color: "#666" }}>
            Not satisfied? Full refund within 30 days, no questions asked.
          </p>
        </div>

      </main>
    </div>
  );
}
