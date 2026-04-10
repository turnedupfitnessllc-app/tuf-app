/**
 * 30-Day Panther Mindset Challenge
 * 6 phases based on user's reference images:
 *   Days 1–7   : CONTROL > CHAOS
 *   Days 8–14  : PATIENCE
 *   Days 15–20 : PRECISION > SPEED
 *   Days 21–25 : EVERY REP HAS INTENTION
 *   Days 26–28 : POWER WHEN IT COUNTS
 *   Days 29–30 : BECOME DANGEROUS
 */
import { useLocation } from "wouter";
import { ls } from "@/data/v4constants";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";

const PHASES = [
  {
    id: "control",
    days: [1, 7],
    label: "CONTROL > CHAOS",
    sub: "Days 1–7",
    color: "#FF4500",
    img: `${CDN}/days-1-7-control_c943c70a.jpg`,
    quote: "Chaos is the enemy of progress. Control your breath, your form, your mind.",
    focus: ["Breathing mechanics", "Movement patterns", "Morning routine discipline"],
  },
  {
    id: "patience",
    days: [8, 14],
    label: "PATIENCE",
    sub: "Days 8–14",
    color: "#4a9eff",
    img: `${CDN}/days-8-14-patience_9ff96c07.jpg`,
    quote: "The panther doesn't rush the hunt. Every movement is deliberate.",
    focus: ["Slow eccentric reps", "Rest period discipline", "Recovery protocols"],
  },
  {
    id: "precision",
    days: [15, 20],
    label: "PRECISION > SPEED",
    sub: "Days 15–20",
    color: "#22c55e",
    img: `${CDN}/days-15-20-precision_76a2985d.jpg`,
    quote: "Speed is earned. Precision is trained. Master the form before the pace.",
    focus: ["Tempo training", "Mind-muscle connection", "Joint alignment"],
  },
  {
    id: "intention",
    days: [21, 25],
    label: "EVERY REP HAS INTENTION",
    sub: "Days 21–25",
    color: "#C8973A",
    img: `${CDN}/days-21-25-intention_5a025f31.jpg`,
    quote: "Mindless reps build nothing. Every rep is a decision. Make it count.",
    focus: ["Intentional contraction", "Visualization", "Progressive overload"],
  },
  {
    id: "power",
    days: [26, 28],
    label: "POWER WHEN IT COUNTS",
    sub: "Days 26–28",
    color: "#7c3aed",
    img: `${CDN}/days-26-28-power_2110e16b.jpg`,
    quote: "Power is not constant force. It is precise force at the right moment.",
    focus: ["Explosive movements", "Peak output training", "CNS activation"],
  },
  {
    id: "dangerous",
    days: [29, 30],
    label: "BECOME DANGEROUS",
    sub: "Days 29–30",
    color: "#FF4500",
    img: `${CDN}/days-29-30-dangerous_9858af1a.jpg`,
    quote: "You are not the same athlete who started Day 1. You are dangerous now.",
    focus: ["Max effort testing", "Full integration", "Celebrate the evolution"],
  },
];

function getDayRange(phase: typeof PHASES[0]) {
  return Array.from(
    { length: phase.days[1] - phase.days[0] + 1 },
    (_, i) => phase.days[0] + i
  );
}

export default function Challenge() {
  const [, navigate] = useLocation();

  const progress = ls.get<{ challengeDay?: number; challengeStarted?: boolean }>(
    "tuf_challenge", { challengeDay: 0, challengeStarted: false }
  );

  const currentDay = progress.challengeDay || 0;
  const started    = progress.challengeStarted || false;

  const handleStart = () => {
    ls.set("tuf_challenge", { challengeDay: 1, challengeStarted: true });
    window.location.reload();
  };

  const handleCompleteDay = (day: number) => {
    if (day === currentDay) {
      ls.set("tuf_challenge", { challengeDay: day + 1, challengeStarted: true });
      window.location.reload();
    }
  };

  const pct = Math.round((currentDay / 30) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#080808", paddingBottom: 48 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 4px 24px rgba(255,69,0,0.4)} 50%{box-shadow:0 4px 56px rgba(255,69,0,0.75)} }
        .challenge-page { animation: fadeUp 0.4s ease both; }
        .btn-primary {
          display: block; width: 100%;
          padding: 18px 24px;
          background: #FF4500;
          border: none; border-radius: 14px;
          color: #fff;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 18px; font-weight: 900;
          letter-spacing: 0.12em;
          cursor: pointer;
          animation: glowPulse 3s ease-in-out infinite;
        }
        .btn-primary:active { transform: scale(0.97); background: #cc3700; animation: none; }
        .phase-card {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 12px;
          position: relative;
        }
        .day-dot {
          width: 28px; height: 28px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px; font-weight: 700;
          cursor: pointer;
          transition: transform 0.12s ease;
          flex-shrink: 0;
        }
        .day-dot:active { transform: scale(0.9); }
      `}</style>

      <main className="challenge-page" style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* ─── BACK ─── */}
        <div style={{ paddingTop: 16, marginBottom: 12 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none", border: "none",
              color: "rgba(255,255,255,0.45)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13, fontWeight: 700,
              letterSpacing: "0.12em",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              padding: 0,
            }}
          >
            ← HOME
          </button>
        </div>

        {/* ─── HERO BANNER ─── */}
        <div style={{
          borderRadius: 20, overflow: "hidden",
          position: "relative", height: 320,
          marginBottom: 20,
          border: "1px solid rgba(255,69,0,0.25)",
          boxShadow: "0 8px 40px rgba(255,69,0,0.2)",
        }}>
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/challenge-hero-panther_60538eb1.jpg"
            alt="30-Day Challenge"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              objectPosition: "center 15%",
              filter: "brightness(0.75) saturate(1.15)",
            }}
          />
          {/* bottom gradient so text is legible */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 30%, rgba(8,8,8,0.85) 100%)",
          }} />
          {/* bottom-left text block */}
          <div style={{
            position: "absolute",
            left: 20, bottom: 20, right: 20,
          }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.22em", color: "#FF4500",
              marginBottom: 4,
            }}>
              PANTHER MINDSET PROGRAM
            </div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 36, letterSpacing: "0.04em",
              color: "#fff", lineHeight: 1,
            }}>
              YOUR 30-DAY<br />CHALLENGE
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11, fontWeight: 700,
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.5)",
              marginTop: 6,
            }}>
              6 Phases · Control · Patience · Precision · Power
            </div>
            <div style={{
              marginTop: 10,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.3)",
            }}>
              #TurnedUpFitness  #PantherMindset  #BecomeDangerous
            </div>
          </div>
        </div>

        {/* ─── PROGRESS BAR ─── */}
        {started && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              marginBottom: 8,
            }}>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 11, fontWeight: 700,
                letterSpacing: "0.16em",
                color: "rgba(255,255,255,0.4)",
              }}>
                DAY {Math.min(currentDay, 30)} OF 30
              </span>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 11, fontWeight: 700,
                letterSpacing: "0.16em", color: "#FF4500",
              }}>
                {pct}% COMPLETE
              </span>
            </div>
            <div style={{
              height: 6, borderRadius: 3,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${pct}%`,
                background: "linear-gradient(to right, #FF4500, #ff6a35)",
                borderRadius: 3,
                transition: "width 0.6s ease",
              }} />
            </div>
          </div>
        )}

        {/* ─── START CTA (if not started) ─── */}
        {!started && (
          <div style={{ marginBottom: 24 }}>
            <button className="btn-primary" onClick={handleStart}>
              BEGIN THE CHALLENGE →
            </button>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11, fontWeight: 700,
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.25)",
              textAlign: "center",
              marginTop: 10,
            }}>
              30 days · 6 phases · Complete 1 session per day
            </p>
          </div>
        )}

        {/* ─── PHASE CARDS ─── */}
        {PHASES.map((phase) => {
          const days = getDayRange(phase);
          const phaseStart = phase.days[0];
          const phaseEnd   = phase.days[1];
          const isActive   = started && currentDay >= phaseStart && currentDay <= phaseEnd;
          const isComplete = started && currentDay > phaseEnd;
          const isLocked   = !started || currentDay < phaseStart;

          return (
            <div
              key={phase.id}
              className="phase-card"
              style={{
                opacity: isLocked ? 0.45 : 1,
                border: isActive
                  ? `1px solid ${phase.color}55`
                  : "1px solid rgba(255,255,255,0.07)",
                boxShadow: isActive
                  ? `0 0 20px ${phase.color}22`
                  : "none",
              }}
            >
              {/* Phase header image */}
              <div style={{ position: "relative", height: 100 }}>
                <img
                  src={phase.img}
                  alt={phase.label}
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 30%",
                    filter: isComplete
                      ? "brightness(0.35) saturate(0.5)"
                      : "brightness(0.45) saturate(1.1)",
                  }}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to right, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.4) 60%, transparent 100%)",
                }} />
                <div style={{
                  position: "absolute",
                  left: 16, top: "50%",
                  transform: "translateY(-50%)",
                }}>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.2em",
                    color: phase.color,
                    marginBottom: 3,
                    opacity: 0.8,
                  }}>
                    {phase.sub}
                  </div>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 20, letterSpacing: "0.05em",
                    color: "#fff", lineHeight: 1,
                  }}>
                    {phase.label}
                  </div>
                </div>
                {/* Status badge */}
                <div style={{
                  position: "absolute", right: 12, top: "50%",
                  transform: "translateY(-50%)",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.14em",
                  color: isComplete ? "#22c55e" : isActive ? phase.color : "rgba(255,255,255,0.2)",
                  padding: "4px 10px",
                  background: isComplete
                    ? "rgba(34,197,94,0.12)"
                    : isActive
                    ? `${phase.color}18`
                    : "rgba(255,255,255,0.04)",
                  borderRadius: 20,
                  border: `1px solid ${isComplete ? "rgba(34,197,94,0.3)" : isActive ? `${phase.color}40` : "rgba(255,255,255,0.08)"}`,
                }}>
                  {isComplete ? "✓ DONE" : isActive ? "ACTIVE" : "LOCKED"}
                </div>
              </div>

              {/* Phase body */}
              {(isActive || isComplete) && (
                <div style={{ padding: "14px 16px" }}>
                  {/* Quote */}
                  <p style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 13, fontWeight: 600,
                    color: "rgba(255,255,255,0.55)",
                    fontStyle: "italic",
                    lineHeight: 1.5,
                    marginBottom: 12,
                    borderLeft: `2px solid ${phase.color}55`,
                    paddingLeft: 10,
                  }}>
                    "{phase.quote}"
                  </p>

                  {/* Focus areas */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                    {phase.focus.map((f) => (
                      <span key={f} style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 10, fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: phase.color,
                        background: `${phase.color}12`,
                        border: `1px solid ${phase.color}30`,
                        borderRadius: 20,
                        padding: "4px 10px",
                      }}>
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Day dots */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {days.map((day) => {
                      const done    = currentDay > day;
                      const current = currentDay === day;
                      return (
                        <button
                          key={day}
                          className="day-dot"
                          onClick={() => handleCompleteDay(day)}
                          style={{
                            background: done
                              ? phase.color
                              : current
                              ? `${phase.color}22`
                              : "rgba(255,255,255,0.05)",
                            border: `1px solid ${done ? phase.color : current ? `${phase.color}55` : "rgba(255,255,255,0.1)"}`,
                            color: done ? "#fff" : current ? phase.color : "rgba(255,255,255,0.3)",
                            boxShadow: current ? `0 0 10px ${phase.color}55` : "none",
                          }}
                        >
                          {done ? "✓" : day}
                        </button>
                      );
                    })}
                  </div>
                  {isActive && (
                    <p style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.12em",
                      color: "rgba(255,255,255,0.25)",
                      marginTop: 10,
                    }}>
                      Tap your current day number to mark it complete
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

      </main>
    </div>
  );
}
