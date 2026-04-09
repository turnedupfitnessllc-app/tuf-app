/**
 * TUF APP — PANTHER UX SYSTEM v4.0
 * Shared UI components used across all 5 screens
 */
import { STAGES, hexRgb } from "@/data/v4constants";

// Panther avatar CDN URLs per state
const PANTHER_IMAGES: Record<string, string> = {
  idle:      "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/panther-avatar-ready-bLbwtZmR5t5Rbd2FCeA4ib.webp",
  coaching:  "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/panther-avatar-coaching-Kx3TyL7JBnRCWhpSZjkVzr.webp",
  activated: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/panther-avatar-analyzing-VAQEPoajs2GTMFvyRyRSPQ.webp",
  dominant:  "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/panther-avatar-coaching-Kx3TyL7JBnRCWhpSZjkVzr.webp",
  locked_in: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/panther-avatar-analyzing-VAQEPoajs2GTMFvyRyRSPQ.webp",
};

// ── PANTHER PRESENCE ──────────────────────────────────────────────────────────
interface PantherPresenceProps {
  state?: "idle" | "coaching" | "activated" | "dominant" | "locked_in";
  size?: number;
  showScan?: boolean;
}

export function PantherPresence({ state = "idle", size = 180, showScan = false }: PantherPresenceProps) {
  const glows: Record<string, string> = {
    idle:      "rgba(255,69,0,0.12)",
    coaching:  "rgba(255,69,0,0.28)",
    activated: "rgba(255,69,0,0.45)",
    dominant:  "rgba(200,151,58,0.45)",
    locked_in: "rgba(255,69,0,0.55)",
  };
  const borders: Record<string, string> = {
    idle:      "rgba(255,69,0,0.2)",
    coaching:  "rgba(255,69,0,0.45)",
    activated: "rgba(255,69,0,0.7)",
    dominant:  "rgba(200,151,58,0.7)",
    locked_in: "rgba(255,69,0,0.85)",
  };
  const g = glows[state] || glows.idle;
  const b = borders[state] || borders.idle;
  const stateLabel: Record<string, string> = {
    idle:      "READY",
    coaching:  "COACHING",
    activated: "ACTIVATED",
    dominant:  "DOMINANT",
    locked_in: "ANALYZING",
  };

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {/* Outer ambient glow */}
      <div style={{
        position: "absolute", inset: -16, borderRadius: "50%",
        background: `radial-gradient(circle, ${g} 0%, transparent 70%)`,
        animation: "ambient 3s ease-in-out infinite",
      }} />
      {/* Border ring */}
      <div style={{
        position: "absolute", inset: -10, borderRadius: "50%",
        border: `1.5px solid ${b}`,
        animation: state !== "idle" ? "ring 2s ease-in-out infinite" : undefined,
      }} />
      {/* Avatar circle */}
      <div style={{
        width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden",
        border: `1px solid ${b}`,
        background: "#0d0d0d",
        position: "relative",
      }}>
        <img
          src={PANTHER_IMAGES[state] || PANTHER_IMAGES.idle}
          alt="Panther AI"
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center top",
            display: "block",
          }}
        />
        {/* Scan line for locked_in */}
        {(showScan || state === "locked_in") && (
          <div style={{
            position: "absolute", left: 0, right: 0, height: 2,
            background: "linear-gradient(90deg, transparent, #FF4500, transparent)",
            animation: "scan 2s linear infinite",
            top: "50%",
          }} />
        )}
        {/* Bottom fade */}
        <div style={{
          position: "absolute", inset: "55% 0 0 0",
          background: "linear-gradient(to bottom, transparent, rgba(8,8,8,0.7))",
          pointerEvents: "none",
        }} />
      </div>
      {/* State badge */}
      <div style={{
        position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 4,
        background: "rgba(8,8,8,0.9)", border: "1px solid rgba(255,69,0,0.3)",
        borderRadius: 20, padding: "2px 8px",
      }}>
        <div style={{
          width: 5, height: 5, borderRadius: "50%",
          background: state === "activated" || state === "dominant" ? "#C8973A" : "#FF4500",
          boxShadow: `0 0 6px ${state === "activated" || state === "dominant" ? "#C8973A" : "#FF4500"}`,
        }} />
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700,
          color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em",
        }}>
          {stateLabel[state] || "READY"}
        </span>
      </div>
    </div>
  );
}

// ── XP BAR ────────────────────────────────────────────────────────────────────
interface XPBarProps {
  xp?: number;
  stage?: string;
}

export function XPBar({ xp = 0, stage = "CUB" }: XPBarProps) {
  const [mn, mx, c] = STAGES[stage] || STAGES.CUB;
  const pct = stage === "APEX PREDATOR" ? 100 : Math.min(100, ((xp - mn) / (mx - mn)) * 100);
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700,
          color: c, letterSpacing: "0.12em",
        }}>
          {stage}
        </span>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9,
          color: "rgba(255,255,255,0.4)",
        }}>
          {xp} XP
        </span>
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: `linear-gradient(90deg, ${c}55, ${c})`,
          borderRadius: 2, transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

// ── PANTHER MESSAGE ───────────────────────────────────────────────────────────
interface PantherMessageProps {
  headline: string;
  body?: string;
  directive?: string;
  delay?: number;
}

export function PantherMessage({ headline, body, directive }: PantherMessageProps) {
  return (
    <div style={{
      background: "rgba(13,13,13,0.98)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16, padding: "16px 16px 16px 20px", marginBottom: 12,
      position: "relative", overflow: "hidden",
    }}>
      {/* Left accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
        background: "linear-gradient(to bottom, #FF4500, #8B0000)",
      }} />
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700,
        letterSpacing: "0.15em", color: "#FF4500", marginBottom: 4,
      }}>
        PANTHER SAYS
      </div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900,
        letterSpacing: "0.04em", color: "#fff", lineHeight: 1.2, marginBottom: body ? 8 : 0,
      }}>
        {headline}
      </div>
      {body && (
        <div style={{ fontSize: 13, lineHeight: 1.72, color: "rgba(255,255,255,0.73)", marginBottom: directive ? 10 : 0 }}>
          {body}
        </div>
      )}
      {directive && (
        <div style={{
          padding: "8px 12px", borderLeft: "2px solid #FF4500",
          background: "rgba(255,69,0,0.06)", borderRadius: "0 8px 8px 0",
          fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)",
          fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em",
        }}>
          → {directive}
        </div>
      )}
    </div>
  );
}

// ── SCENE HEADER ──────────────────────────────────────────────────────────────
interface SceneHeaderProps {
  num: string;
  label: string;
  color?: string;
}

export function SceneHeader({ num, label, color = "#FF4500" }: SceneHeaderProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <div style={{
        width: 22, height: 22, borderRadius: 6,
        background: `rgba(${hexRgb(color)},0.15)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, color,
        }}>
          {num}
        </span>
      </div>
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
        letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)",
      }}>
        {label}
      </span>
    </div>
  );
}

// ── CARD ──────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  glow?: boolean;
  accent?: string | null;
  style?: React.CSSProperties;
}

export function V4Card({ children, accent = null, style = {} }: CardProps) {
  return (
    <div style={{
      background: "rgba(13,13,13,0.95)",
      border: `1px solid ${accent ? `rgba(${hexRgb(accent)},0.3)` : "rgba(255,255,255,0.06)"}`,
      borderRadius: 16, padding: "14px 14px",
      position: "relative", overflow: "hidden",
      ...style,
    }}>
      {accent && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${accent}00, ${accent}, ${accent}00)`,
        }} />
      )}
      {children}
    </div>
  );
}
