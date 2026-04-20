/**
 * PantherActionButton — The Panther System primary command button
 * Doc 17 Section 5 — Use for: session starts, directives, primary actions
 */
import React, { useState } from "react";
import { haptics } from "@/utils/haptics";

interface PantherActionButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}

const PantherActionButton: React.FC<PantherActionButtonProps> = ({
  label,
  onClick,
  disabled,
  loading,
  variant = "primary",
  className = "",
}) => {
  const [pressed, setPressed] = useState(false);

  const baseStyle: React.CSSProperties = {
    width: "100%",
    minHeight: "64px",
    borderRadius: "8px",
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "20px",
    letterSpacing: "2px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    marginBottom: "4px",
    transition: "background-color 0.1s ease, transform 0.1s ease",
    transform: pressed ? "scale(0.99)" : "scale(1)",
    display: "block",
    textAlign: "center",
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: pressed ? "#6B0000" : "#8B0000",
      color: "#C8973A",
      border: "none",
    },
    secondary: {
      backgroundColor: pressed ? "#111" : "#1A1A1A",
      color: "#C8973A",
      border: "1px solid #8B0000",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "#C8973A",
      border: "1px solid rgba(200,151,58,0.2)",
    },
  };

  const handleClick = () => {
    if (disabled || loading) return;
    haptics.light();
    onClick();
  };

  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onClick={handleClick}
      disabled={disabled || loading}
      style={{ ...baseStyle, ...variantStyles[variant] }}
      className={className}
    >
      {loading ? "LOADING..." : label}
    </button>
  );
};

export default PantherActionButton;
