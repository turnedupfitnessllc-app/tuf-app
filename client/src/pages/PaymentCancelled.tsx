/**
 * TUF PAYMENT CANCELLED — Doc 16 §8.2
 * Shown when user cancels/abandons Stripe Checkout.
 */
import { useLocation } from "wouter";

export default function PaymentCancelled() {
  const [, navigate] = useLocation();

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
        .cancel-content { animation: fadeUp 0.5s ease both; }
      `}</style>

      <div className="cancel-content">
        <div style={{ fontSize: 64, marginBottom: 20, lineHeight: 1 }}>💪</div>

        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 42, letterSpacing: "0.04em",
          color: "var(--text-primary)",
          margin: "0 0 8px", lineHeight: 1,
        }}>
          NOT TODAY.
        </h1>

        <p style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 16, letterSpacing: "0.04em",
          color: "var(--text-secondary)",
          margin: "0 0 40px",
          maxWidth: 300,
          lineHeight: 1.5,
        }}>
          Payment was cancelled. When you're ready to level up, your stage is waiting.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 280 }}>
          <button
            onClick={() => navigate("/pricing")}
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "#FFFFFF",
              padding: "14px 32px",
              borderRadius: 12,
              border: "none",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: 16,
              letterSpacing: "0.1em",
              cursor: "pointer",
            }}
          >
            VIEW PLANS →
          </button>

          <button
            onClick={() => navigate("/")}
            style={{
              backgroundColor: "transparent",
              color: "var(--text-tertiary)",
              padding: "14px 32px",
              borderRadius: 12,
              border: "1px solid var(--border-primary)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.1em",
              cursor: "pointer",
            }}
          >
            BACK TO HOME
          </button>
        </div>
      </div>
    </div>
  );
}
