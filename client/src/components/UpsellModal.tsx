/**
 * UpsellModal — Tier-aware upgrade prompt
 * Shown at: day 3 (free→starter $19), day 14 (starter→advanced $79), day 30+ (advanced→member $20/mo)
 */
import { useLocation } from "wouter";
import type { UpsellTier } from "@/hooks/useUpsell";

interface UpsellModalProps {
  tier: UpsellTier;
  onDismiss: () => void;
}

const UPSELL_DATA = {
  starter: {
    badge: "YOU'VE EARNED THIS",
    headline: "UNLOCK THE\nFULL PROGRAM",
    sub: "You've completed 3 workouts. The real transformation starts now.",
    price: "$19",
    priceLabel: "one-time",
    features: ["30-Day Panther Program", "Full corrective system", "Phase-by-phase progression", "Panther Brain AI coaching"],
    cta: "GET 30-DAY PROGRAM →",
    route: "/pricing",
    color: "#FF6600",
  },
  advanced: {
    badge: "14 DAYS STRONG",
    headline: "GO ELITE.\nGO ADVANCED.",
    sub: "You've built the foundation. The Advanced System takes you to the next level.",
    price: "$79",
    priceLabel: "one-time",
    features: ["12-Week Advanced System", "Strength + power protocols", "BOA biomechanical analysis", "Priority AI coaching"],
    cta: "GET ADVANCED SYSTEM →",
    route: "/pricing",
    color: "#C8973A",
  },
  member: {
    badge: "30 DAYS IN",
    headline: "JOIN THE\nPANTHER ELITE",
    sub: "You're consistent. Membership gives you live coaching, exclusive programs, and the full AI system.",
    price: "$20",
    priceLabel: "per month",
    features: ["Live coaching sessions", "Exclusive programs", "Full AI coaching suite", "Season leaderboard access"],
    cta: "JOIN MEMBERSHIP →",
    route: "/pricing",
    color: "#FF6600",
  },
};

export default function UpsellModal({ tier, onDismiss }: UpsellModalProps) {
  const [, navigate] = useLocation();
  if (!tier) return null;

  const data = UPSELL_DATA[tier];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
      onClick={onDismiss}
    >
      <div
        style={{
          width: "100%", maxWidth: 480,
          background: "linear-gradient(180deg, #111 0%, #0a0a0a 100%)",
          borderRadius: "24px 24px 0 0",
          border: `1px solid ${data.color}40`,
          borderBottom: "none",
          padding: "32px 24px 40px",
          boxShadow: `0 -8px 60px ${data.color}25`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Badge */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 10, fontWeight: 700, letterSpacing: 4,
          color: data.color, marginBottom: 12, textAlign: "center",
        }}>
          {data.badge}
        </div>

        {/* Headline */}
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 40, letterSpacing: 2, color: "#fff",
          lineHeight: 1, textAlign: "center", marginBottom: 12,
          whiteSpace: "pre-line",
        }}>
          {data.headline}
        </h2>

        {/* Sub */}
        <p style={{ fontSize: 13, color: "#888", textAlign: "center", marginBottom: 24, lineHeight: 1.5 }}>
          {data.sub}
        </p>

        {/* Features */}
        <div style={{ marginBottom: 24 }}>
          {data.features.map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                background: `${data.color}20`, border: `1px solid ${data.color}60`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 10, color: data.color }}>✓</span>
              </div>
              <span style={{ fontSize: 13, color: "#ccc", fontWeight: 600 }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Price + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 48, color: data.color, lineHeight: 1,
            }}>{data.price}</span>
            <span style={{ fontSize: 12, color: "#666", marginLeft: 4 }}>{data.priceLabel}</span>
          </div>
          <button
            onClick={() => { onDismiss(); navigate(data.route); }}
            style={{
              flex: 1, padding: "16px 20px",
              background: `linear-gradient(135deg, ${data.color}, ${data.color}bb)`,
              border: "none", borderRadius: 14,
              color: "#fff",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 16, fontWeight: 900, letterSpacing: 2,
              cursor: "pointer",
            }}
          >
            {data.cta}
          </button>
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          style={{
            width: "100%", padding: "12px",
            background: "transparent", border: "none",
            color: "#555", fontSize: 12, cursor: "pointer",
            fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 2,
          }}
        >
          NOT NOW — REMIND ME LATER
        </button>
      </div>
    </div>
  );
}
