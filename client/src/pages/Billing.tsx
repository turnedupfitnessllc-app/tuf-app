/**
 * Billing.tsx — TUF Subscription Management Screen
 * Shows current plan, billing status, manage/cancel via Stripe Customer Portal,
 * and upgrade options for lower-tier users.
 *
 * © 2026 Turned Up Fitness LLC | Confidential
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface SubscriptionStatus {
  tier: "free" | "core" | "elite" | "pro";
  status: "active" | "cancelled" | "past_due" | "trialing" | null;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
}

const TIER_META: Record<string, { name: string; color: string; price: string; tagline: string }> = {
  free:  { name: "FREE",          color: "#666",    price: "$0",     tagline: "Basic access" },
  core:  { name: "PANTHER CORE",  color: "#FF6600", price: "$19.99", tagline: "AI corrective coaching + nutrition" },
  elite: { name: "PANTHER ELITE", color: "#C8973A", price: "$39.99", tagline: "Adds full TUTK food system" },
  pro:   { name: "PANTHER PRO",   color: "#AA44FF", price: "$79.99", tagline: "All pillars + trainer tools" },
};

const UPGRADE_TIERS = ["core", "elite", "pro"] as const;
const TIER_ORDER = ["free", "core", "elite", "pro"];

// Map legacy DB tier names → canonical names
function normalizeTier(raw: string): "free" | "core" | "elite" | "pro" {
  const map: Record<string, "free" | "core" | "elite" | "pro"> = {
    free: "free", cub: "free", stealth: "core", controlled: "elite", apex: "pro",
    core: "core", elite: "elite", pro: "pro",
  };
  return map[raw] ?? "free";
}

function tierRank(tier: string): number {
  return TIER_ORDER.indexOf(tier);
}

export default function Billing() {
  const [, navigate] = useLocation();
  const [sub, setSub] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [successTier, setSuccessTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Read userId from localStorage (set during onboarding)
  const userId = localStorage.getItem("tuf_user_id") || "";

  useEffect(() => {
    // Check for success redirect from Stripe
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") {
      setSuccessTier(params.get("tier") || "");
      window.history.replaceState({}, "", "/billing");
    }

    if (!userId) { setLoading(false); return; }

    fetch(`/api/stripe/subscription/${userId}`)
      .then(r => r.json())
      .then((data: { tier?: string; status?: string; current_period_end?: number; cancel_at_period_end?: boolean }) => {
        const normalizedTier = normalizeTier(data.tier || "free");
        const normalized: SubscriptionStatus = {
          tier: normalizedTier,
          status: (data.status as SubscriptionStatus["status"]) || null,
          current_period_end: data.current_period_end,
          cancel_at_period_end: data.cancel_at_period_end,
        };
        setSub(normalized);
        setLoading(false);
        localStorage.setItem("tuf_tier", normalizedTier);
        localStorage.setItem("tuf_tier_raw", data.tier || "free");
      })
      .catch(() => { setSub({ tier: "free", status: null }); setLoading(false); });
  }, [userId]);

  async function openPortal() {
    setPortalLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, origin: window.location.origin }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        setError(data.error || "Could not open billing portal");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setPortalLoading(false);
    }
  }

  async function startCheckout(tierId: string) {
    setCheckoutLoading(tierId);
    setError(null);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId,
          interval: "monthly",
          origin: window.location.origin,
          userId,
        }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        setError(data.error || "Could not start checkout");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setCheckoutLoading(null);
    }
  }

  const currentTier = sub?.tier || "free";
  const meta = TIER_META[currentTier] || TIER_META.free;
  const isActive = sub?.status === "active" || sub?.status === "trialing";
  const isPastDue = sub?.status === "past_due";
  const isCancelled = sub?.status === "cancelled";

  const periodEnd = sub?.current_period_end
    ? new Date(sub.current_period_end * 1000).toLocaleDateString()
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "72px 16px 0" }}>
        {/* Back */}
        <button
          onClick={() => navigate("/profile")}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", marginBottom: 24, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", cursor: "pointer" }}
        >
          ← BACK
        </button>

        {/* Header */}
        <div style={{ marginBottom: 28, animation: "fadeUp 0.4s ease forwards" }}>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#FF6600", marginBottom: 4 }}>MEMBERSHIP</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: "0.07em", color: "#fff", lineHeight: 1 }}>BILLING & PLAN</h1>
        </div>

        {/* Success banner */}
        {successTier && (
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "#22c55e15", border: "1px solid #22c55e40", marginBottom: 20, animation: "fadeUp 0.4s ease forwards" }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#22c55e", fontWeight: 700 }}>
              ✓ Welcome to {TIER_META[successTier]?.name || successTier.toUpperCase()}! Your plan is now active.
            </p>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div style={{ padding: "12px 16px", borderRadius: 12, background: "#FF660015", border: "1px solid #FF660040", marginBottom: 16 }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#FF6600" }}>{error}</p>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", animation: "pulse 1.5s ease infinite" }}>LOADING PLAN...</p>
          </div>
        ) : (
          <>
            {/* Current Plan Card */}
            <div style={{ padding: "20px 20px", borderRadius: 18, background: `${meta.color}0d`, border: `1px solid ${meta.color}30`, marginBottom: 24, animation: "fadeUp 0.4s ease forwards" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: meta.color, marginBottom: 4 }}>CURRENT PLAN</p>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: "0.06em", color: "#fff", lineHeight: 1 }}>{meta.name}</p>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{meta.tagline}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: meta.color }}>{meta.price}<span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>/mo</span></p>
                  {/* Status badge */}
                  {isActive && (
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 20, background: "#22c55e20", border: "1px solid #22c55e40", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#22c55e" }}>ACTIVE</span>
                  )}
                  {isPastDue && (
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 20, background: "#FF660020", border: "1px solid #FF660040", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#FF6600" }}>PAST DUE</span>
                  )}
                  {isCancelled && (
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>CANCELLED</span>
                  )}
                  {currentTier === "free" && (
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>FREE</span>
                  )}
                </div>
              </div>

              {/* Period end */}
              {periodEnd && (
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>
                  {sub?.cancel_at_period_end ? "Cancels on" : "Renews on"}: {periodEnd}
                </p>
              )}

              {/* Past due warning */}
              {isPastDue && (
                <div style={{ padding: "10px 12px", borderRadius: 10, background: "#FF660015", border: "1px solid #FF660030", marginBottom: 12 }}>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#FF6600" }}>
                    ⚠ Payment failed. Update your payment method to keep access.
                  </p>
                </div>
              )}

              {/* Manage button (for paid users) */}
              {currentTier !== "free" && (
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: `1px solid ${meta.color}40`, background: `${meta.color}12`, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", color: meta.color, cursor: "pointer", opacity: portalLoading ? 0.6 : 1 }}
                >
                  {portalLoading ? "OPENING PORTAL..." : "MANAGE SUBSCRIPTION →"}
                </button>
              )}
            </div>

            {/* Upgrade options (only shown for lower tiers) */}
            {UPGRADE_TIERS.filter(t => tierRank(t) > tierRank(currentTier)).length > 0 && (
              <div style={{ animation: "fadeUp 0.5s ease 0.1s both" }}>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
                  {currentTier === "free" ? "CHOOSE YOUR PLAN" : "UPGRADE YOUR PLAN"}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {UPGRADE_TIERS.filter(t => tierRank(t) > tierRank(currentTier)).map((tierId) => {
                    const m = TIER_META[tierId];
                    const isLoading = checkoutLoading === tierId;
                    return (
                      <button
                        key={tierId}
                        onClick={() => startCheckout(tierId)}
                        disabled={!!checkoutLoading}
                        style={{ padding: "16px 18px", borderRadius: 14, border: `1px solid ${m.color}30`, background: `${m.color}08`, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", opacity: checkoutLoading && !isLoading ? 0.5 : 1 }}
                      >
                        <div style={{ textAlign: "left" }}>
                          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: "0.06em", color: m.color, lineHeight: 1, marginBottom: 2 }}>{m.name}</p>
                          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{m.tagline}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: "#fff" }}>{m.price}<span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>/mo</span></p>
                          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: m.color, fontWeight: 700, letterSpacing: "0.08em" }}>
                            {isLoading ? "REDIRECTING..." : "UPGRADE →"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Already on top tier */}
            {currentTier === "pro" && isActive && (
              <div style={{ padding: "16px", borderRadius: 14, background: "rgba(170,68,255,0.06)", border: "1px solid rgba(170,68,255,0.2)", textAlign: "center", animation: "fadeUp 0.5s ease 0.1s both" }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#AA44FF", letterSpacing: "0.06em" }}>PANTHER PRO</p>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>You're on the highest tier. No limits.</p>
              </div>
            )}

            {/* Test card reminder */}
            <div style={{ marginTop: 28, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.06em" }}>
                TEST MODE · Use card 4242 4242 4242 4242 · Any future date · Any CVV
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
