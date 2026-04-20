/**
 * TUF AppShell — Global Layout Wrapper
 * Provides the persistent header with HamburgerDrawer for all screens.
 * Screens simply wrap their content in <AppShell> or <AppShell title="...">
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */
import { ReactNode } from "react";
import { useLocation } from "wouter";
import HamburgerDrawer from "./HamburgerDrawer";

interface AppShellProps {
  /** Optional page title shown in the center of the header */
  title?: string;
  /** Optional right-side action element */
  rightAction?: ReactNode;
  /** Whether to show a back arrow instead of hamburger (for deep screens) */
  showBack?: boolean;
  /** Extra padding at the bottom (default 80px for safe area) */
  bottomPad?: number;
  children: ReactNode;
}

export default function AppShell({
  title,
  rightAction,
  showBack = false,
  bottomPad = 80,
  children,
}: AppShellProps) {
  const [, navigate] = useLocation();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary, #0B0B0B)", color: "#fff" }}>
      {/* ── Sticky header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 200,
        background: "rgba(11,11,11,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,255,198,0.1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px",
        height: 56,
      }}>
        {/* Left — hamburger or back */}
        <div style={{ width: 44, display: "flex", alignItems: "center" }}>
          {showBack ? (
            <button
              onClick={() => navigate("/")}
              aria-label="Go back"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#00FFC6", fontSize: 20, padding: 0,
                display: "flex", alignItems: "center",
              }}
            >
              ←
            </button>
          ) : (
            <HamburgerDrawer />
          )}
        </div>

        {/* Center — title or TUF wordmark */}
        <div style={{ flex: 1, textAlign: "center" }}>
          {title ? (
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 15, fontWeight: 800, letterSpacing: "0.14em",
              color: "#fff", textTransform: "uppercase",
            }}>
              {title}
            </span>
          ) : (
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 22, letterSpacing: "0.12em", color: "#00FFC6",
            }}>
              TUF
            </span>
          )}
        </div>

        {/* Right — optional action or spacer */}
        <div style={{ width: 44, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          {rightAction ?? null}
        </div>
      </header>

      {/* ── Page content ── */}
      <main style={{ paddingBottom: bottomPad }}>
        {children}
      </main>
    </div>
  );
}
