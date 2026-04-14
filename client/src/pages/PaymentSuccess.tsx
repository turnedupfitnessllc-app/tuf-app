/**
 * TUF PAYMENT SUCCESS — Doc 16 §8.1
 * Shown after successful Stripe Checkout redirect.
 * Syncs tier from server, updates localStorage, then shows the Panther message.
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

type SyncState = "syncing" | "done" | "error";

export default function PaymentSuccess() {
  const [, navigate] = useLocation();
  const [syncState, setSyncState] = useState<SyncState>("syncing");
  const [tierName, setTierName] = useState("");

  useEffect(() => {
    // Extract session_id from URL (Stripe appends it)
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    // Sync tier from server to localStorage
    const userId = localStorage.getItem("tuf_user_id") || "";
    if (userId) {
      fetch(`/api/stripe/subscription/${userId}`)
        .then(r => r.ok ? r.json() : null)
        .then((data: { tier?: string; status?: string } | null) => {
          if (data?.tier && data.tier !== "free") {
            // Update localStorage tier
            const TIER_MAP: Record<string, string> = {
              cub: "core", stealth: "core", controlled: "elite", apex: "pro",
            };
            const gateTier = TIER_MAP[data.tier] ?? data.tier;
            localStorage.setItem("tuf_tier", gateTier);
            localStorage.setItem("tuf_tier_raw", data.tier);
            window.dispatchEvent(new StorageEvent("storage", {
              key: "tuf_tier", newValue: gateTier,
            }));
            // Display tier name
            const TIER_DISPLAY: Record<string, string> = {
              cub: "CUB", stealth: "STEALTH", controlled: "CONTROLLED", apex: "APEX PREDATOR",
            };
            setTierName(TIER_DISPLAY[data.tier] || data.tier.toUpperCase());
          }
          setSyncState("done");
        })
        .catch(() => setSyncState("done")); // Show success even if sync fails
    } else {
      // No user ID — still show success
      setSyncState("done");
    }

    // Log session ID for debugging
    if (sessionId) {
      console.log("[PaymentSuccess] Stripe session:", sessionId);
    }
  }, []);

  return (
    <div style={{
      backgroundColor: "var(--bg-primary)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      textAlign: "center",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glowPulse {
          0%,100%{text-shadow:0 0 20px rgba(255,102,0,0.4)}
          50%{text-shadow:0 0 60px rgba(255,102,0,0.9)}
        }
        .success-content { animation: fadeUp 0.5s ease both; }
        .panther-title { animation: glowPulse 2.5s ease-in-out infinite; }
      `}</style>

      {syncState === "syncing" ? (
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 16, letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.4)",
        }}>
          ACTIVATING YOUR MEMBERSHIP…
        </div>
      ) : (
        <div className="success-content">
          {/* Panther emoji */}
          <div style={{ fontSize: 72, marginBottom: 20, lineHeight: 1 }}>🐆</div>

          {/* Main headline */}
          <h1
            className="panther-title"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 48, letterSpacing: "0.04em",
              color: "var(--accent-primary)",
              margin: "0 0 8px",
              lineHeight: 1,
            }}
          >
            YOU'RE IN.
          </h1>

          {/* Tier confirmation */}
          {tierName && (
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 14, fontWeight: 700, letterSpacing: "0.2em",
              color: "rgba(255,102,0,0.7)",
              marginBottom: 16,
            }}>
              {tierName} ACTIVATED
            </div>
          )}

          {/* Message */}
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 18, letterSpacing: "0.04em",
            color: "var(--text-secondary)",
            margin: "0 0 40px",
            maxWidth: 320,
            lineHeight: 1.5,
          }}>
            The Panther System is activated.<br />
            No shortcuts from here.
          </p>

          {/* CTA */}
          <button
            onClick={() => navigate("/")}
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "#FFFFFF",
              padding: "16px 40px",
              borderRadius: 12,
              border: "none",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: 18,
              letterSpacing: "0.1em",
              cursor: "pointer",
              boxShadow: "0 4px 24px rgba(255,102,0,0.4)",
            }}
          >
            START TRAINING →
          </button>

          {/* Billing portal link */}
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 12, letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.2)",
            marginTop: 32,
          }}>
            Manage your subscription anytime from the{" "}
            <span
              onClick={() => navigate("/pricing")}
              style={{ color: "rgba(255,255,255,0.35)", cursor: "pointer", textDecoration: "underline" }}
            >
              Membership screen
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
