/**
 * PantherHeader — Universal screen header
 * Doc 18 Section 7 — 56px sticky, identical on every screen
 */
import React from "react";
import { useLocation } from "wouter";

interface PantherHeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  onBack?: () => void;
}

const PantherHeader: React.FC<PantherHeaderProps> = ({
  title,
  showBack = false,
  rightElement,
  onBack,
}) => {
  const [, navigate] = useLocation();

  return (
    <div
      style={{
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        backgroundColor: "var(--bg-primary, #080808)",
        borderBottom: "1px solid #1A1A1A",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left: Back or spacer */}
      <div style={{ width: "40px" }}>
        {showBack && (
          <button
            onClick={onBack ?? (() => navigate("~-1" as string))}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#FFFFFF",
              fontSize: "24px",
              padding: "8px",
              lineHeight: 1,
            }}
            aria-label="Go back"
          >
            ‹
          </button>
        )}
      </div>

      {/* Center: Title */}
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "20px",
          letterSpacing: "2px",
          color: "#FFFFFF",
          textAlign: "center",
          flex: 1,
        }}
      >
        {title}
      </div>

      {/* Right: Optional element */}
      <div style={{ width: "40px", display: "flex", justifyContent: "flex-end" }}>
        {rightElement}
      </div>
    </div>
  );
};

export default PantherHeader;
