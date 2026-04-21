/**
 * Leaderboard — Panther System
 * Top 50 users ranked by XP. Black background, #FF6600 accent.
 * Fetches from GET /api/panther-program/leaderboard
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import HamburgerDrawer from "@/components/HamburgerDrawer";

interface LeaderboardEntry {
  user_id: string;
  name: string;
  xp: number;
  streak: number;
  workouts_completed: number;
  rank: number;
}

export default function Leaderboard() {
  const [, navigate] = useLocation();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = localStorage.getItem("tuf_user_id") || "guest";

  useEffect(() => {
    fetch("/api/panther-program/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setEntries(data.top_users ?? []);
        } else {
          setError("Failed to load leaderboard.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Could not connect to server.");
        setLoading(false);
      });
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "👑";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "#FFD700";
    if (rank === 2) return "#C0C0C0";
    if (rank === 3) return "#CD7F32";
    return "rgba(255,255,255,0.3)";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", paddingBottom: 96 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
      `}</style>

      {/* Sticky header with hamburger */}
      <div style={{ position: "sticky", top: 0, zIndex: 200, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,255,198,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 56 }}>
        <HamburgerDrawer />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 800, letterSpacing: "0.14em", color: "#fff", textTransform: "uppercase" }}>LEADERBOARD</span>
        <div style={{ width: 44 }} />
      </div>
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 0" }}>

        {/* Header */}
        <div style={{ marginBottom: 24, animation: "fadeUp 0.4s ease forwards" }}>
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
            fontWeight: 700, letterSpacing: "0.18em", color: "#FF6600", marginBottom: 2,
          }}>
            PANTHER SYSTEM
          </p>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 36,
            letterSpacing: "0.07em", color: "#fff", lineHeight: 1,
          }}>
            LEADERBOARD
          </h1>
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11,
            color: "rgba(255,255,255,0.3)", marginTop: 4,
          }}>
            Top 50 Panther athletes ranked by XP
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13,
              letterSpacing: "0.12em", color: "rgba(255,102,0,0.6)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}>
              LOADING RANKINGS...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{
            padding: "20px", borderRadius: 12,
            background: "rgba(255,45,45,0.06)",
            border: "1px solid rgba(255,45,45,0.2)",
            textAlign: "center",
          }}>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13,
              color: "rgba(255,255,255,0.5)",
            }}>
              {error}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && entries.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🐆</p>
            <p style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 20,
              letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)",
            }}>
              No athletes yet
            </p>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12,
              color: "rgba(255,255,255,0.25)", marginTop: 6,
            }}>
              Complete your first session to appear here
            </p>
          </div>
        )}

        {/* Leaderboard entries */}
        {!loading && entries.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {entries.map((entry, i) => {
              const isMe = entry.user_id === currentUserId;
              const rankColor = getRankColor(entry.rank);
              const isTop3 = entry.rank <= 3;

              return (
                <div
                  key={entry.user_id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", borderRadius: 14,
                    background: isMe
                      ? "rgba(255,102,0,0.06)"
                      : isTop3
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(255,255,255,0.015)",
                    border: `1px solid ${isMe ? "rgba(255,102,0,0.3)" : isTop3 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
                    animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Top-3 glow line */}
                  {isTop3 && (
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: 1,
                      background: `linear-gradient(90deg, transparent, ${rankColor}60, transparent)`,
                    }} />
                  )}

                  {/* Rank */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: isTop3 ? `${rankColor}12` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isTop3 ? `${rankColor}30` : "rgba(255,255,255,0.06)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{
                      fontFamily: isTop3 ? "inherit" : "'Bebas Neue', sans-serif",
                      fontSize: isTop3 ? 20 : 14,
                      color: rankColor,
                    }}>
                      {getRankIcon(entry.rank)}
                    </span>
                  </div>

                  {/* Name + stats */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <p style={{
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15,
                        fontWeight: 700, letterSpacing: "0.04em",
                        color: isMe ? "#FF6600" : "#fff",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {entry.name}
                      </p>
                      {isMe && (
                        <span style={{
                          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9,
                          fontWeight: 700, letterSpacing: "0.1em",
                          color: "#FF6600", background: "rgba(255,102,0,0.12)",
                          border: "1px solid rgba(255,102,0,0.3)",
                          borderRadius: 3, padding: "1px 5px",
                        }}>
                          YOU
                        </span>
                      )}
                    </div>
                    <p style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
                      color: "rgba(255,255,255,0.3)", marginTop: 1,
                    }}>
                      {entry.workouts_completed} sessions · 🔥 {entry.streak} day streak
                    </p>
                  </div>

                  {/* XP */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: 20,
                      color: isTop3 ? rankColor : "rgba(255,255,255,0.7)",
                      letterSpacing: "0.04em",
                    }}>
                      {entry.xp.toLocaleString()}
                    </p>
                    <p style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9,
                      fontWeight: 700, letterSpacing: "0.1em",
                      color: "rgba(255,255,255,0.25)",
                    }}>
                      XP 🔥
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA to start training */}
        {!loading && (
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <button
              onClick={() => navigate("/challenge")}
              style={{
                padding: "16px 40px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #FF6600, #cc4400)",
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 18,
                letterSpacing: "0.1em", color: "#fff", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(255,102,0,0.25)",
              }}
            >
              Start Training to Climb
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
