/**
 * Join — Panther System Referral Landing Page
 *
 * Handles: /join?ref=CODE
 *
 * Flow:
 *   1. Extract ?ref= param from URL
 *   2. Store ref_code in localStorage (tuf_ref_code)
 *   3. POST /api/referral/track to increment visit count
 *   4. Show a brief "You've been invited" splash
 *   5. Redirect to /onboarding after 2.5 seconds (or on CTA click)
 *
 * On onboarding completion, the app reads tuf_ref_code and calls
 * POST /api/referral/convert to award XP to both parties.
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const PANTHER_MASCOT =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/panther-mascot-gym_27e64ae1.png";

export default function Join() {
  const [, navigate] = useLocation();
  const [refCode, setRefCode] = useState<string | null>(null);
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    // Parse ?ref= from current URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get("ref");

    if (code) {
      setRefCode(code);
      // Persist for use after onboarding
      localStorage.setItem("tuf_ref_code", code);

      // Track the visit server-side (fire-and-forget)
      fetch("/api/referral/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref_code: code }),
      })
        .then(() => setTracked(true))
        .catch(() => setTracked(true)); // don't block on error
    }

    // Auto-redirect after 2.8 seconds
    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, 2800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pantherGlow { 0%,100%{filter:drop-shadow(0 0 12px rgba(255,102,0,0.3))} 50%{filter:drop-shadow(0 0 28px rgba(255,102,0,0.7))} }
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes barFill { from{width:0%} to{width:100%} }
      `}</style>

      {/* Panther mascot */}
      <div style={{ animation: "pantherGlow 2.5s ease-in-out infinite", marginBottom: 24 }}>
        <img
          src={PANTHER_MASCOT}
          alt="Panther"
          style={{ width: 100, height: 100, objectFit: "contain" }}
        />
      </div>

      {/* Headline */}
      <div style={{ animation: "fadeUp 0.5s ease 0.1s both" }}>
        <p style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11,
          fontWeight: 700, letterSpacing: "0.2em", color: "#FF6600", marginBottom: 6,
        }}>
          YOU'VE BEEN INVITED
        </p>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 42,
          letterSpacing: "0.06em", color: "#fff", lineHeight: 1,
        }}>
          Join the Panther System
        </h1>
        <p style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15,
          color: "rgba(255,255,255,0.5)", marginTop: 8, lineHeight: 1.5,
        }}>
          Your training partner invited you to the<br />
          30-Day Panther Evolution Program.
        </p>
      </div>

      {/* Ref code badge */}
      {refCode && (
        <div style={{
          marginTop: 20, padding: "10px 20px",
          background: "rgba(255,102,0,0.08)",
          border: "1px solid rgba(255,102,0,0.3)",
          borderRadius: 10, animation: "fadeUp 0.5s ease 0.3s both",
        }}>
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12,
            color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em",
          }}>
            REFERRAL CODE
          </p>
          <p style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 22,
            color: "#FF6600", letterSpacing: "0.12em",
          }}>
            {refCode}
          </p>
        </div>
      )}

      {/* Bonus XP callout */}
      <div style={{
        marginTop: 20, padding: "14px 20px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12, animation: "fadeUp 0.5s ease 0.4s both",
        maxWidth: 280,
      }}>
        <p style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 20,
          color: "#FF6600", letterSpacing: "0.06em",
        }}>
          +25 XP BONUS
        </p>
        <p style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11,
          color: "rgba(255,255,255,0.35)", marginTop: 2,
        }}>
          Awarded when you complete onboarding
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate("/onboarding")}
        style={{
          marginTop: 28, padding: "18px 48px",
          borderRadius: 16, border: "none",
          background: "linear-gradient(135deg, #FF6600, #cc4400)",
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 20,
          letterSpacing: "0.1em", color: "#fff", cursor: "pointer",
          boxShadow: "0 4px 24px rgba(255,102,0,0.35)",
          animation: "fadeUp 0.5s ease 0.5s both",
        }}
      >
        Start My Evolution →
      </button>

      {/* Auto-redirect progress bar */}
      <div style={{
        marginTop: 24, width: 200, height: 2,
        background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden",
        animation: "fadeUp 0.5s ease 0.6s both",
      }}>
        <div style={{
          height: "100%", borderRadius: 2,
          background: "#FF6600",
          animation: "barFill 2.8s linear forwards",
        }} />
      </div>
      <p style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
        color: "rgba(255,255,255,0.2)", marginTop: 6,
        letterSpacing: "0.08em",
        animation: "pulse 1.5s ease-in-out infinite",
      }}>
        Redirecting to onboarding...
      </p>
    </div>
  );
}
