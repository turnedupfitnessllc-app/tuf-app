/**
 * GradientNavCard.tsx — Doc 15: Gradient Image Buttons
 * Cinematic 3-layer button: Panther photo + dark gradient + color wash
 *
 * Layer stack (back to front):
 *   1. Background image — Panther photo, right 65% of button
 *   2. Dark gradient — left solid dark → right transparent (text readability)
 *   3. Color wash — subtle accent tint for atmosphere
 *   4. Content — icon + text + chevron (always above gradients)
 *
 * © 2026 Turned Up Fitness LLC | The Panther System
 */

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface GradientNavCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  titleColor: string;   // accent color per button
  borderColor: string;  // border color per button
  gradientColor: string; // rgba color for the wash overlay
  imageSrc: string;     // CDN URL for button background image
  onClick: () => void;
  locked?: boolean;
  hero?: boolean;       // true for Panther Brain — larger card
}

const GradientNavCard: React.FC<GradientNavCardProps> = ({
  icon,
  title,
  subtitle,
  titleColor,
  borderColor,
  gradientColor,
  imageSrc,
  onClick,
  locked = false,
  hero = false,
}) => {
  const [pressed, setPressed] = React.useState(false);
  const { isDark } = useTheme();

  // Dark gradient adapts to theme — text must always be readable on the left
  const darkGradient = isDark
    ? "linear-gradient(to right, #0A0A0A 35%, #0A0A0A 50%, rgba(10,10,10,0.7) 65%, rgba(10,10,10,0) 100%)"
    : "linear-gradient(to right, #F5F5F5 35%, #F5F5F5 50%, rgba(245,245,245,0.8) 65%, rgba(245,245,245,0) 100%)";

  // In light mode, text on left needs to be dark for readability
  const textColor = isDark ? titleColor : titleColor;
  const subtitleColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)";

  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onClick={onClick}
      style={{
        width: "100%",
        minHeight: hero ? "100px" : "80px",
        position: "relative",
        overflow: "hidden",
        border: `${hero ? "2px" : "1.5px"} solid ${borderColor}`,
        borderRadius: "14px",
        cursor: "pointer",
        marginBottom: "8px",
        display: "flex",
        alignItems: "center",
        padding: hero ? "20px 24px" : "16px 20px",
        gap: "16px",
        textAlign: "left",
        background: "transparent",
        // Pressed state
        opacity: pressed ? 0.85 : 1,
        transform: pressed ? "scale(0.99)" : "scale(1)",
        transition: "opacity 0.1s ease, transform 0.1s ease",
        // Box shadow for hero
        boxShadow: hero
          ? `0 0 24px ${gradientColor.replace("0.20", "0.25").replace("0.15", "0.25")}`
          : "none",
      }}
    >
      {/* LAYER 1: Background image — right side, 65% width */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "65%",
          height: "100%",
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* LAYER 2: Dark gradient — left solid, right transparent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: darkGradient,
        }}
      />

      {/* LAYER 3: Color wash — accent atmosphere on right */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `linear-gradient(to right, transparent 40%, ${gradientColor} 100%)`,
        }}
      />

      {/* LAYER 4: Content — sits above all gradients */}

      {/* ICON */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: hero ? "48px" : "44px",
          height: hero ? "48px" : "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: textColor,
          fontSize: hero ? "28px" : "24px",
        }}
      >
        {icon}
      </div>

      {/* TEXT */}
      <div style={{ position: "relative", zIndex: 10, flex: 1 }}>
        <div
          style={{
            color: textColor,
            fontWeight: "800",
            fontSize: hero ? "18px" : "15px",
            letterSpacing: hero ? "1px" : "0.5px",
            textTransform: "uppercase",
            marginBottom: "4px",
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: subtitleColor,
            fontSize: "12px",
            fontWeight: "400",
            textShadow: "0 1px 3px rgba(0,0,0,0.9)",
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* CHEVRON */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          color: textColor,
          fontSize: hero ? "24px" : "20px",
          flexShrink: 0,
          opacity: 0.9,
        }}
      >
        {locked ? "🔒" : "›"}
      </div>
    </button>
  );
};

export default GradientNavCard;
