/**
 * SuccessScreen — Panther System
 * Full-screen day completion celebration.
 *
 * Shows:
 *   - Panther video loop
 *   - "Day X Complete" title
 *   - Stats: reps, time, calories, performance score
 *   - StreakCard with color-coded streak
 *   - XP earned (with multiplier badge)
 *   - Badge unlock animation (if any)
 *   - 30-day progress bar with milestone icons
 *   - Phase coach message
 *   - Share button (Web Share API) — uses exact generateShareText() spec
 *   - Continue CTA
 *
 * Web equivalent of the React Native SuccessScreen component.
 */

import React, { useEffect, useState } from "react";
import StreakCard from "./StreakCard";
import ProgramProgressBar from "./ProgramProgressBar";

const PANTHER_VIDEO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/panther-hero-splash_7a05a834.mp4";

// ── Share text functions (exact spec from user) ───────────────────────────────

function getMotivation(streak: number): string {
  if (streak >= 14) return "Apex discipline unlocked.";
  if (streak >= 7)  return "Momentum is building.";
  return "Consistency is power.";
}

function generateShareText(user: {
  day: number;
  streak: number;
  xp_earned: number;
  ref_link?: string;
}): string {
  const refLine = user.ref_link ? `\n\n🔗 Join me: ${user.ref_link}` : "";
  return `🐆 Panther Training Update:\n\nDay ${user.day} Complete\n🔥 Streak: ${user.streak}\n⚡ XP: ${user.xp_earned}\n\n"${getMotivation(user.streak)}"${refLine}`;
}

// ── Phase coach messages ──────────────────────────────────────────────────────

function getCoachMessage(phase: string): string {
  const messages: Record<string, string> = {
    Control:   "Control is improving.",
    Stability: "Your balance is stronger.",
    Strength:  "You're building real power.",
    Explosion: "Speed is increasing.",
    Evolution: "You've transformed.",
  };
  return messages[phase] || "Keep going.";
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface WorkoutStats {
  reps: number;
  time: number;       // minutes
  calories?: number;
}

interface SuccessScreenProps {
  completedDay: number;
  xpAwarded: number;
  xpMultiplier?: number;
  unlockedBadges?: string[];
  performanceScore?: number;
  streak: number;
  totalDone: number;
  phase: string;
  workoutStats: WorkoutStats;
  coachMessage?: string;
  refCode?: string | null;   // referral code — appended to share text as join link
  onContinue: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SuccessScreen({
  completedDay,
  xpAwarded,
  xpMultiplier = 1,
  unlockedBadges = [],
  performanceScore = 85,
  streak,
  totalDone,
  phase,
  workoutStats,
  coachMessage,
  refCode,
  onContinue,
}: SuccessScreenProps) {
  const [visible, setVisible] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => setBadgeVisible(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const shareWorkout = async () => {
    const refLink = refCode
      ? `${window.location.origin}/join?ref=${refCode}`
      : undefined;

    const text = generateShareText({
      day:      completedDay,
      streak,
      xp_earned: xpAwarded,
      ref_link:  refLink,
    });

    try {
      if (navigator.share) {
        await navigator.share({ title: "Panther Training", text });
      } else {
        await navigator.clipboard.writeText(text);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      // user cancelled share
    }
  };

  const message = coachMessage ?? getCoachMessage(phase);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        zIndex: 9999,
        overflowY: "auto",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes badgePop { 0%{transform:scale(0.6);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes xpGlow { 0%,100%{text-shadow:0 0 10px rgba(255,102,0,0.4)} 50%{text-shadow:0 0 24px rgba(255,102,0,0.9)} }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 40 }}>

        {/* ── Panther Video ── */}
        <div style={{ position: "relative", width: "100%", height: 220, overflow: "hidden" }}>
          <video
            src={PANTHER_VIDEO_URL}
            autoPlay loop muted playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)",
          }} />
          <div style={{
            position: "absolute", top: 16, left: 16,
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.15em", color: "#FF6600",
            background: "rgba(0,0,0,0.6)", padding: "4px 10px", borderRadius: 4,
            border: "1px solid rgba(255,102,0,0.3)",
          }}>
            {phase.toUpperCase()} PHASE
          </div>
        </div>

        {/* ── Main Content ── */}
        <div style={{ padding: "0 20px" }}>

          {/* Title */}
          <div style={{ animation: "slideUp 0.4s ease 0.1s both" }}>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 42,
              color: "#fff", letterSpacing: "0.06em", lineHeight: 1, marginTop: 16,
            }}>
              Workout Complete
            </h1>
            <p style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 24,
              color: "#FF6600", letterSpacing: "0.06em", marginTop: 2,
            }}>
              Day {completedDay} Complete
            </p>
          </div>

          {/* Stats row */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10,
            marginTop: 20, animation: "slideUp 0.4s ease 0.2s both",
          }}>
            {[
              { label: "REPS", value: workoutStats.reps },
              { label: "TIME", value: `${workoutStats.time}m` },
              { label: workoutStats.calories ? "CALORIES" : "SCORE", value: workoutStats.calories ?? `${performanceScore}%` },
            ].map((s) => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.04)", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.07)", padding: "14px 10px",
                textAlign: "center",
              }}>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 26,
                  color: "#fff", letterSpacing: "0.04em",
                }}>{s.value}</div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9,
                  fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)",
                  marginTop: 2,
                }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Streak card */}
          <div style={{ animation: "slideUp 0.4s ease 0.3s both", marginTop: 4 }}>
            <StreakCard streak={streak} size="md" />
          </div>

          {/* XP earned */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            marginTop: 8, animation: "xpGlow 2s ease infinite",
          }}>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 32,
              color: "#FF6600", letterSpacing: "0.06em",
            }}>
              +{xpAwarded} XP
            </span>
            {xpMultiplier > 1 && (
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11,
                fontWeight: 700, letterSpacing: "0.1em",
                color: "#FF6600", background: "rgba(255,102,0,0.12)",
                border: "1px solid rgba(255,102,0,0.3)", borderRadius: 4,
                padding: "3px 8px",
              }}>
                {xpMultiplier}x STREAK BONUS
              </span>
            )}
          </div>

          {/* Badge unlocks */}
          {unlockedBadges.length > 0 && badgeVisible && (
            <div style={{ marginTop: 16, animation: "badgePop 0.5s ease forwards" }}>
              {unlockedBadges.map((badge) => (
                <div key={badge} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "linear-gradient(135deg, rgba(255,102,0,0.08), rgba(255,102,0,0.02))",
                  border: "1px solid rgba(255,102,0,0.3)", borderRadius: 12,
                  padding: "14px 16px", marginBottom: 8,
                }}>
                  <span style={{ fontSize: 28 }}>🏆</span>
                  <div>
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: 18,
                      color: "#FF6600", letterSpacing: "0.06em",
                    }}>
                      {badge.toUpperCase()} UNLOCKED
                    </div>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11,
                      color: "rgba(255,255,255,0.4)",
                    }}>
                      New achievement earned
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Progress bar */}
          <div style={{ marginTop: 20, animation: "slideUp 0.4s ease 0.4s both" }}>
            <ProgramProgressBar day={completedDay + 1} totalDone={totalDone} />
          </div>

          {/* Coach message */}
          <div style={{
            marginTop: 20, padding: "14px 16px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12,
            animation: "slideUp 0.4s ease 0.5s both",
          }}>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15,
              color: "rgba(255,255,255,0.7)", fontStyle: "italic", textAlign: "center",
            }}>
              "{message}"
            </p>
          </div>

          {/* Share button */}
          <button
            onClick={shareWorkout}
            style={{
              width: "100%", marginTop: 16, padding: "14px",
              borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
              fontWeight: 700, letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.6)", cursor: "pointer",
              animation: "slideUp 0.4s ease 0.6s both",
            }}
          >
            {shared ? "✓ COPIED TO CLIPBOARD" : "🐆 SHARE YOUR EVOLUTION"}
          </button>

          {/* Continue CTA */}
          <button
            onClick={onContinue}
            style={{
              width: "100%", marginTop: 12, padding: "18px",
              borderRadius: 16, border: "none",
              background: "linear-gradient(135deg, #FF6600, #cc4400)",
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 22,
              letterSpacing: "0.1em", color: "#fff", cursor: "pointer",
              boxShadow: "0 4px 24px rgba(255,102,0,0.3)",
              animation: "slideUp 0.4s ease 0.7s both",
            }}
          >
            Continue
          </button>

        </div>
      </div>
    </div>
  );
}
