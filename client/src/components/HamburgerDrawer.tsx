/**
 * TUF HamburgerDrawer — Option A Navigation
 * Slide-in left drawer with full route tree
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";

interface NavItem {
  label: string;
  path: string;
  icon: string;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  // Primary
  { label: "HOME",           path: "/",              icon: "⚡", group: "PRIMARY" },
  { label: "DAILY WORKOUT",  path: "/move",           icon: "🏋️", group: "PRIMARY" },
  { label: "PANTHER BRAIN",  path: "/panther-brain",  icon: "🐆", group: "PRIMARY" },
  { label: "FUEL",           path: "/fuel",           icon: "🔥", group: "PRIMARY" },
  // Train
  { label: "PROGRAMS",       path: "/programmes",     icon: "📋", group: "TRAIN" },
  { label: "BOA SCAN",       path: "/boa",            icon: "👁️", group: "TRAIN" },
  { label: "PROGRESS",       path: "/progress",       icon: "📈", group: "TRAIN" },
  { label: "CATALOGUE",      path: "/catalogue",      icon: "🗂️", group: "TRAIN" },
  // Compete
  { label: "PvP CHALLENGE",  path: "/pvp",            icon: "⚔️", group: "COMPETE" },
  { label: "SEASON BOARD",   path: "/season",         icon: "🏆", group: "COMPETE" },
  // Account
  { label: "MEMBERSHIP",     path: "/membership",     icon: "💎", group: "ACCOUNT" },
  { label: "SCHEDULE",       path: "/schedule",       icon: "📅", group: "ACCOUNT" },
];

const GROUPS = ["PRIMARY", "TRAIN", "COMPETE", "ACCOUNT"];

interface HamburgerDrawerProps {
  /** If true, renders as a standalone demo (no real navigation) */
  demoMode?: boolean;
}

export default function HamburgerDrawer({ demoMode = false }: HamburgerDrawerProps) {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const [demoActive, setDemoActive] = useState("/");

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleNav = (path: string) => {
    setOpen(false);
    if (demoMode) {
      setDemoActive(path);
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes drawerSlideOut {
          from { transform: translateX(0);     opacity: 1; }
          to   { transform: translateX(-100%); opacity: 0; }
        }
        @keyframes overlayFadeIn  { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* ── HAMBURGER BUTTON ── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        style={{
          background: "rgba(0,255,198,0.08)",
          border: "1px solid rgba(0,255,198,0.25)",
          borderRadius: 10,
          width: 44, height: 44,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 5, cursor: "pointer", padding: 0,
          transition: "background 0.2s",
        }}
      >
        {[0,1,2].map(i => (
          <span key={i} style={{
            display: "block", width: i === 1 ? 14 : 20, height: 2,
            background: "#00FFC6", borderRadius: 2,
            transition: "width 0.2s",
          }} />
        ))}
      </button>

      {/* ── OVERLAY + DRAWER rendered via Portal — escapes all stacking contexts ── */}
      {createPortal(
        <>
          {/* Overlay */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0,
              zIndex: 9998,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              opacity: open ? 1 : 0,
              pointerEvents: open ? "auto" : "none",
              transition: "opacity 0.25s ease",
            }}
          />

          {/* Drawer */}
          <div style={{
            position: "fixed", top: 0, left: 0, bottom: 0,
            width: 280, zIndex: 9999,
            background: "linear-gradient(180deg, #0D0D0D 0%, #080808 100%)",
            borderRight: "1px solid rgba(0,255,198,0.12)",
            boxShadow: open ? "8px 0 40px rgba(0,0,0,0.8)" : "none",
            transform: open ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
            display: "flex", flexDirection: "column",
            overflowY: "auto",
          }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 20px 16px",
          borderBottom: "1px solid rgba(0,255,198,0.08)",
        }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#00FFC6", letterSpacing: 2 }}>TUF APP</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#555", letterSpacing: 3 }}>TURNED UP FITNESS</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer", padding: 4 }}
          >✕</button>
        </div>

        {/* Nav groups */}
        <div style={{ flex: 1, padding: "12px 0" }}>
          {GROUPS.map(group => {
            const items = NAV_ITEMS.filter(n => n.group === group);
            return (
              <div key={group} style={{ marginBottom: 8 }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 9, letterSpacing: 3, color: "#333",
                  padding: "8px 20px 4px",
                }}>
                  {group}
                </div>
                {items.map(item => {
                  const isActive = demoMode ? demoActive === item.path : false;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNav(item.path)}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        width: "100%", padding: "13px 20px",
                        background: isActive ? "rgba(0,255,198,0.08)" : "transparent",
                        border: "none",
                        borderLeft: isActive ? "3px solid #00FFC6" : "3px solid transparent",
                        cursor: "pointer",
                        transition: "background 0.15s",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>{item.icon}</span>
                      <span style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 14, fontWeight: 700, letterSpacing: 2,
                        color: isActive ? "#00FFC6" : "#ccc",
                      }}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#333", letterSpacing: 2 }}>
            © 2026 TURNED UP FITNESS LLC
          </div>
        </div>
      </div>
        </>,
        document.body
      )}
    </>
  );
}
