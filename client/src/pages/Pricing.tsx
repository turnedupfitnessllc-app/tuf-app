/**
 * TUF PRICING — v2.0
 * 4 membership tiers aligned to the Panther Stage Ladder
 * Monthly / Annual toggle  |  Stripe Checkout  |  Prestige Labs affiliate
 */
import { useState } from "react";
import { useLocation } from "wouter";

const PRESTIGE_AFFILIATE = "https://refer.prestigelabs.com/?af=wg2ztkai";

interface Tier {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  annualMonthly: number; // annual / 12 for display
  color: string;
  glow: string;
  badge?: string;
  features: string[];
}

const TIERS: Tier[] = [
  {
    id: "cub",
    name: "CUB",
    tagline: "Start your movement journey",
    monthlyPrice: 9.99,
    annualPrice: 95,
    annualMonthly: 7.92,
    color: "#A0A0A0",
    glow: "rgba(160,160,160,0.12)",
    features: [
      "Pain & movement assessment",
      "Basic 4-week corrective program",
      "XP tracking & stage system",
      "Movement streak tracking",
      "Community access",
    ],
  },
  {
    id: "stealth",
    name: "STEALTH",
    tagline: "Build your corrective foundation",
    monthlyPrice: 19.99,
    annualPrice: 191,
    annualMonthly: 15.92,
    color: "#4a9eff",
    glow: "rgba(74,158,255,0.15)",
    features: [
      "Everything in CUB",
      "Panther Brain AI coach (Claude)",
      "BOA Scan — biomechanical analysis",
      "Evolve stage unlocks",
      "Unlimited AI coaching sessions",
    ],
  },
  {
    id: "controlled",
    name: "CONTROLLED",
    tagline: "Precision training at full capacity",
    monthlyPrice: 34.99,
    annualPrice: 335,
    annualMonthly: 27.92,
    color: "#C8973A",
    glow: "rgba(200,151,58,0.18)",
    badge: "MOST POPULAR",
    features: [
      "Everything in STEALTH",
      "30-Day Panther Mindset Challenge",
      "Advanced program variations",
      "Nutrition & supplementation guidance",
      "Priority AI response speed",
    ],
  },
  {
    id: "apex",
    name: "APEX PREDATOR",
    tagline: "Elite performance — no limits",
    monthlyPrice: 59.99,
    annualPrice: 575,
    annualMonthly: 47.92,
    color: "#FF4500",
    glow: "rgba(255,69,0,0.18)",
    badge: "ELITE",
    features: [
      "Everything in CONTROLLED",
      "Live coaching session queue",
      "Custom program builds",
      "Direct trainer access",
      "Early access to new features",
    ],
  },
];

export default function Pricing() {
  const [, navigate] = useLocation();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCheckout = async (tierId: string) => {
    setLoading(tierId);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId,
          interval: billing,
          origin: window.location.origin,
        }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        showToast("Redirecting to secure checkout…");
        setTimeout(() => window.open(data.url, "_blank"), 600);
      } else {
        showToast(data.error || "Checkout failed. Please try again.");
      }
    } catch {
      showToast("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 4px 24px rgba(255,69,0,0.4)} 50%{box-shadow:0 4px 56px rgba(255,69,0,0.75)} }
        .pricing-page { animation: fadeUp 0.4s ease both; }
        .tier-card {
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          padding: 24px 20px;
          position: relative;
          transition: border-color 0.2s ease, transform 0.15s ease;
        }
        .tier-card:hover { transform: translateY(-2px); }
        .checkout-btn {
          width: 100%; padding: 14px;
          border: none; border-radius: 12px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 16px; font-weight: 900;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: opacity 0.15s ease, transform 0.12s ease;
        }
        .checkout-btn:active { transform: scale(0.97); }
        .checkout-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .toggle-pill {
          display: flex; align-items: center;
          background: rgba(255,255,255,0.06);
          border-radius: 30px; padding: 4px;
          gap: 2px;
        }
        .toggle-option {
          padding: 8px 18px;
          border-radius: 26px;
          border: none;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .prestige-card {
          border-radius: 18px;
          border: 1px solid rgba(200,151,58,0.25);
          background: linear-gradient(135deg, rgba(200,151,58,0.06) 0%, rgba(8,8,8,0) 100%);
          padding: 24px 20px;
        }
        .toast {
          position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
          background: rgba(20,20,20,0.95);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px; padding: 12px 20px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 14px; font-weight: 600;
          color: #fff; letter-spacing: 0.06em;
          z-index: 999; white-space: nowrap;
          animation: fadeUp 0.3s ease both;
        }
      `}</style>

      {toast && <div className="toast">{toast}</div>}

      <div className="pricing-page" style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* ─── HEADER ─── */}
        <div style={{ paddingTop: 20, marginBottom: 8 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.14em",
              color: "rgba(255,255,255,0.35)",
              padding: 0, marginBottom: 20,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            ← HOME
          </button>
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
            color: "rgba(255,69,0,0.7)", margin: "0 0 6px",
          }}>
            TURNED UP FITNESS
          </p>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 38, letterSpacing: "0.04em",
            color: "#fff", lineHeight: 1.05, margin: "0 0 8px",
          }}>
            CHOOSE YOUR<br />
            <span style={{ color: "#FF4500" }}>STAGE</span>
          </h1>
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 14, color: "rgba(255,255,255,0.45)",
            margin: 0, letterSpacing: "0.04em",
          }}>
            Every tier is a real stage in your Panther journey. Upgrade as you evolve.
          </p>
        </div>

        {/* ─── BILLING TOGGLE ─── */}
        <div style={{ display: "flex", justifyContent: "center", margin: "24px 0" }}>
          <div className="toggle-pill">
            <button
              className="toggle-option"
              onClick={() => setBilling("monthly")}
              style={{
                background: billing === "monthly" ? "#FF4500" : "transparent",
                color: billing === "monthly" ? "#fff" : "rgba(255,255,255,0.4)",
              }}
            >
              MONTHLY
            </button>
            <button
              className="toggle-option"
              onClick={() => setBilling("annual")}
              style={{
                background: billing === "annual" ? "#FF4500" : "transparent",
                color: billing === "annual" ? "#fff" : "rgba(255,255,255,0.4)",
              }}
            >
              ANNUAL&nbsp;
              <span style={{
                background: "rgba(200,151,58,0.25)",
                color: "#C8973A",
                fontSize: 10, fontWeight: 700,
                padding: "2px 6px", borderRadius: 6,
              }}>
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* ─── TIER CARDS ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {TIERS.map((tier) => {
            const price = billing === "annual" ? tier.annualMonthly : tier.monthlyPrice;
            const total = billing === "annual" ? tier.annualPrice : null;
            const isLoading = loading === tier.id;

            return (
              <div
                key={tier.id}
                className="tier-card"
                style={{
                  borderColor: tier.badge ? `${tier.color}40` : "rgba(255,255,255,0.07)",
                  boxShadow: tier.badge ? `0 0 30px ${tier.glow}` : "none",
                }}
              >
                {/* Badge */}
                {tier.badge && (
                  <div style={{
                    position: "absolute", top: -10, right: 16,
                    background: tier.color,
                    color: tier.id === "controlled" ? "#000" : "#fff",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 10, fontWeight: 900, letterSpacing: "0.12em",
                    padding: "3px 10px", borderRadius: 6,
                  }}>
                    {tier.badge}
                  </div>
                )}

                {/* Tier name + tagline */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 24, letterSpacing: "0.06em",
                    color: tier.color, lineHeight: 1,
                  }}>
                    {tier.name}
                  </div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 12, color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.06em", marginTop: 2,
                  }}>
                    {tier.tagline}
                  </div>
                </div>

                {/* Price */}
                <div style={{ marginBottom: 18, display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 42, color: "#fff", lineHeight: 1,
                  }}>
                    ${price.toFixed(2)}
                  </span>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 13, color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.06em",
                  }}>
                    /mo{total ? ` · $${total}/yr` : ""}
                  </span>
                </div>

                {/* Features */}
                <ul style={{
                  listStyle: "none", padding: 0, margin: "0 0 20px",
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  {tier.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ color: tier.color, fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>✓</span>
                      <span style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 14, color: "rgba(255,255,255,0.7)",
                        letterSpacing: "0.03em", lineHeight: 1.4,
                      }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className="checkout-btn"
                  disabled={isLoading}
                  onClick={() => handleCheckout(tier.id)}
                  style={{
                    background: tier.badge ? tier.color : "transparent",
                    color: tier.badge ? (tier.id === "controlled" ? "#000" : "#fff") : tier.color,
                    border: tier.badge ? "none" : `1.5px solid ${tier.color}`,
                  }}
                >
                  {isLoading ? "LOADING…" : `GET ${tier.name} →`}
                </button>
              </div>
            );
          })}
        </div>

        {/* ─── PRESTIGE LABS AFFILIATE ─── */}
        <div style={{ marginTop: 32 }}>
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.25)", marginBottom: 12,
          }}>
            FUEL YOUR TRAINING
          </p>
          <div className="prestige-card">
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 10,
                background: "#fff",
                border: "1px solid rgba(200,151,58,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                overflow: "hidden",
                padding: 4,
              }}>
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/prestige-labs-logo_c463f182.jpg"
                  alt="Prestige Labs"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
              <div>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 20, letterSpacing: "0.06em", color: "#C8973A",
                }}>
                  PRESTIGE LABS
                </div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 11, color: "rgba(255,255,255,0.35)",
                  letterSpacing: "0.08em",
                }}>
                  Premium supplements — trusted by TUF athletes
                </div>
              </div>
            </div>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 14, color: "rgba(255,255,255,0.55)",
              lineHeight: 1.5, margin: "0 0 16px", letterSpacing: "0.03em",
            }}>
              The same supplements recommended by your Panther Brain AI coach. Pre-workout, protein, and recovery stacks built for precision athletes.
            </p>
            <a
              href={PRESTIGE_AFFILIATE}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block", width: "100%", padding: "13px",
                background: "rgba(200,151,58,0.12)",
                border: "1.5px solid rgba(200,151,58,0.4)",
                borderRadius: 12,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 15, fontWeight: 900, letterSpacing: "0.1em",
                color: "#C8973A", textAlign: "center", textDecoration: "none",
                boxSizing: "border-box",
              }}
            >
              SHOP PRESTIGE LABS →
            </a>
          </div>
        </div>

        {/* ─── TEST MODE NOTICE ─── */}
        <div style={{
          marginTop: 20, padding: "12px 16px",
          background: "rgba(74,158,255,0.06)",
          border: "1px solid rgba(74,158,255,0.15)",
          borderRadius: 10,
        }}>
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 12, color: "rgba(255,255,255,0.35)",
            margin: 0, letterSpacing: "0.04em", lineHeight: 1.5,
          }}>
            🔒 Payments secured by Stripe. Test with card{" "}
            <strong style={{ color: "rgba(255,255,255,0.5)" }}>4242 4242 4242 4242</strong>,
            any future expiry, any CVC.
          </p>
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
