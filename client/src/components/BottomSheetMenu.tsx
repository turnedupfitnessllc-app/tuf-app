/**
 * TUF BottomSheetMenu — Option B Navigation
 * Slim 4-tab bottom bar + "MORE" bottom sheet for secondary routes
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */
import { useState } from "react";
import { useLocation } from "wouter";

// ── Primary tabs (always visible) ────────────────────────────────────────────
const PRIMARY_TABS = [
  { label: "HOME",    path: "/",             icon: "⚡" },
  { label: "TRAIN",   path: "/move",          icon: "🏋️" },
  { label: "FUEL",    path: "/fuel",          icon: "🔥" },
  { label: "PANTHER", path: "/panther-brain", icon: "🐆" },
];

// ── Secondary items (in the MORE sheet) ──────────────────────────────────────
const MORE_ITEMS = [
  { label: "PROGRAMS",      path: "/programmes",    icon: "📋", color: "#FF6600" },
  { label: "BOA SCAN",      path: "/boa",           icon: "👁️", color: "#00FFC6" },
  { label: "PvP CHALLENGE", path: "/pvp",           icon: "⚔️", color: "#FF3B3B" },
  { label: "SEASON BOARD",  path: "/season",        icon: "🏆", color: "#C8973A" },
  { label: "PROGRESS",      path: "/progress",      icon: "📈", color: "#00FFC6" },
  { label: "CATALOGUE",     path: "/catalogue",     icon: "🗂️", color: "#888" },
  { label: "SCHEDULE",      path: "/schedule",      icon: "📅", color: "#888" },
  { label: "MEMBERSHIP",    path: "/membership",    icon: "💎", color: "#C8973A" },
];

interface BottomSheetMenuProps {
  /** If true, renders as a standalone demo (no real navigation) */
  demoMode?: boolean;
}

export default function BottomSheetMenu({ demoMode = false }: BottomSheetMenuProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [, navigate] = useLocation();
  const [demoActive, setDemoActive] = useState("/");

  const handleNav = (path: string) => {
    setSheetOpen(false);
    if (demoMode) {
      setDemoActive(path);
    } else {
      navigate(path);
    }
  };

  const isActive = (path: string) => demoMode ? demoActive === path : false;

  return (
    <>
      <style>{`
        @keyframes sheetSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes sheetOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        .bottom-tab-btn:active { transform: scale(0.92); }
      `}</style>

      {/* ── BOTTOM TAB BAR ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 900,
        background: "rgba(8,8,8,0.97)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(0,255,198,0.12)",
        display: "flex", alignItems: "stretch",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}>
        {PRIMARY_TABS.map(tab => (
          <button
            key={tab.path}
            className="bottom-tab-btn"
            onClick={() => handleNav(tab.path)}
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 3, padding: "10px 4px 8px",
              background: "transparent", border: "none", cursor: "pointer",
              transition: "transform 0.1s",
              borderTop: isActive(tab.path) ? "2px solid #00FFC6" : "2px solid transparent",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{tab.icon}</span>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 9, letterSpacing: 2, fontWeight: 700,
              color: isActive(tab.path) ? "#00FFC6" : "#555",
              transition: "color 0.15s",
            }}>
              {tab.label}
            </span>
          </button>
        ))}

        {/* MORE tab */}
        <button
          className="bottom-tab-btn"
          onClick={() => setSheetOpen(s => !s)}
          style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 3, padding: "10px 4px 8px",
            background: "transparent", border: "none", cursor: "pointer",
            transition: "transform 0.1s",
            borderTop: sheetOpen ? "2px solid #FF6600" : "2px solid transparent",
          }}
        >
          {/* 3-dot icon */}
          <div style={{ display: "flex", gap: 3, alignItems: "center", height: 18 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                width: 4, height: 4, borderRadius: "50%",
                background: sheetOpen ? "#FF6600" : "#555",
                transition: "background 0.15s",
              }} />
            ))}
          </div>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 9, letterSpacing: 2, fontWeight: 700,
            color: sheetOpen ? "#FF6600" : "#555",
            transition: "color 0.15s",
          }}>
            MORE
          </span>
        </button>
      </div>

      {/* ── OVERLAY ── */}
      {sheetOpen && (
        <div
          onClick={() => setSheetOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 901,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            animation: "sheetOverlayIn 0.2s ease",
          }}
        />
      )}

      {/* ── BOTTOM SHEET ── */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 902,
        background: "linear-gradient(180deg, #111 0%, #0A0A0A 100%)",
        borderTop: "1px solid rgba(0,255,198,0.15)",
        borderRadius: "20px 20px 0 0",
        padding: "0 0 calc(72px + env(safe-area-inset-bottom, 0px))",
        transform: sheetOpen ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.8)",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#333" }} />
        </div>

        {/* Section label */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 9, letterSpacing: 4, color: "#444",
          padding: "4px 20px 12px",
        }}>
          ALL SECTIONS
        </div>

        {/* Grid of items */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 10, padding: "0 16px",
        }}>
          {MORE_ITEMS.map(item => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 16px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid rgba(255,255,255,0.07)`,
                borderRadius: 14,
                cursor: "pointer",
                transition: "background 0.15s, border-color 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = `${item.color}12`;
                (e.currentTarget as HTMLButtonElement).style.borderColor = `${item.color}40`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
              }}
            >
              <span style={{
                fontSize: 20, width: 28, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `${item.color}18`, borderRadius: 8,
              }}>
                {item.icon}
              </span>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 13, fontWeight: 700, letterSpacing: 1.5,
                color: "#ccc",
              }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
