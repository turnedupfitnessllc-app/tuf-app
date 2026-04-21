/**
 * PantherCueOverlay — Full-screen Panther flash during workout cues
 * Renders via React Portal so it sits above everything.
 * Usage: <PantherCueOverlay cue={voiceLine} visible={showOverlay} />
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";
const PANTHER_MASCOT = `${CDN}/panther-mascot-gym_27e64ae1.png`;

interface PantherCueOverlayProps {
  /** The cue text to display */
  cue: string;
  /** Whether the overlay is currently visible */
  visible: boolean;
  /** Called when the overlay finishes its animation and hides */
  onHide?: () => void;
}

export default function PantherCueOverlay({ cue, visible, onHide }: PantherCueOverlayProps) {
  const [phase, setPhase] = useState<"hidden" | "entering" | "holding" | "exiting">("hidden");
  const [displayCue, setDisplayCue] = useState(cue);

  useEffect(() => {
    if (visible && phase === "hidden") {
      setDisplayCue(cue);
      setPhase("entering");
      const holdTimer = setTimeout(() => setPhase("holding"), 300);
      const exitTimer = setTimeout(() => setPhase("exiting"), 2200);
      const hideTimer = setTimeout(() => {
        setPhase("hidden");
        onHide?.();
      }, 2700);
      return () => { clearTimeout(holdTimer); clearTimeout(exitTimer); clearTimeout(hideTimer); };
    }
  }, [visible, cue]);

  if (phase === "hidden") return null;

  const opacity =
    phase === "entering" ? 0 :
    phase === "holding"  ? 1 :
    phase === "exiting"  ? 0 : 0;

  return createPortal(
    <div style={{
      position: "fixed", inset: 0,
      zIndex: 19999,
      display: "flex", alignItems: "center", justifyContent: "center",
      pointerEvents: "none",
      opacity,
      transition: phase === "entering" ? "opacity 0.3s ease" : phase === "exiting" ? "opacity 0.5s ease" : "none",
    }}>
      {/* Dark vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.85) 100%)",
      }} />

      {/* Panther image — faded, full bleed */}
      <img
        src={PANTHER_MASCOT}
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition: "center 20%",
          filter: "brightness(0.25) saturate(1.4) hue-rotate(-10deg)",
          mixBlendMode: "luminosity",
        }}
      />

      {/* Neon radial glow behind text */}
      <div style={{
        position: "absolute",
        width: 320, height: 200,
        background: "radial-gradient(ellipse at center, rgba(0,255,198,0.18) 0%, transparent 70%)",
        borderRadius: "50%",
      }} />

      {/* Cue text */}
      <div style={{
        position: "relative",
        textAlign: "center",
        padding: "0 32px",
      }}>
        {/* Panther label */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 10, fontWeight: 800,
          letterSpacing: "0.3em",
          color: "rgba(0,255,198,0.6)",
          marginBottom: 10,
          textTransform: "uppercase",
        }}>
          PANTHER
        </div>

        {/* Main cue */}
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 38,
          letterSpacing: "0.06em",
          color: "#fff",
          lineHeight: 1.1,
          textShadow: "0 0 30px rgba(0,255,198,0.5), 0 2px 20px rgba(0,0,0,0.8)",
        }}>
          {displayCue}
        </div>

        {/* Neon underline */}
        <div style={{
          width: 60, height: 2,
          background: "linear-gradient(to right, transparent, #00FFC6, transparent)",
          margin: "12px auto 0",
          borderRadius: 1,
        }} />
      </div>
    </div>,
    document.body
  );
}
