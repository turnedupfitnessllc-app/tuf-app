/**
 * PantherSkeleton — Shimmer loading states
 * PantherThinking — AI generation loading state
 * Doc 18 Sections 6.1 + 6.2
 */
import React from "react";

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const PantherSkeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = "20px",
  borderRadius = "8px",
  className = "",
}) => (
  <div
    className={`skeleton-shimmer ${className}`}
    style={{ width, height, borderRadius }}
  />
);

export const SkeletonCard: React.FC = () => (
  <div
    style={{
      backgroundColor: "#111",
      borderRadius: "14px",
      padding: "20px",
      border: "1px solid #222",
    }}
  >
    <PantherSkeleton height="14px" width="40%" />
    <div style={{ height: "8px" }} />
    <PantherSkeleton height="48px" width="60%" />
    <div style={{ height: "12px" }} />
    <PantherSkeleton height="12px" width="80%" />
    <div style={{ height: "6px" }} />
    <PantherSkeleton height="12px" width="65%" />
  </div>
);

export const PantherThinking: React.FC<{ message?: string }> = ({
  message = "THE PANTHER SYSTEM IS ANALYZING",
}) => (
  <div
    style={{
      backgroundColor: "#111",
      border: "1px solid rgba(255,102,0,0.2)",
      borderRadius: "14px",
      padding: "20px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}
  >
    <div style={{ fontSize: "24px", animation: "glow-pulse 1.5s infinite" }}>
      🐆
    </div>
    <div style={{ flex: 1 }}>
      <div
        style={{
          color: "#FF6600",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "16px",
          letterSpacing: "1px",
          marginBottom: "8px",
        }}
      >
        {message}
      </div>
      <PantherSkeleton height="10px" width="100%" />
      <div style={{ height: "4px" }} />
      <PantherSkeleton height="10px" width="75%" />
    </div>
  </div>
);

export default PantherSkeleton;
