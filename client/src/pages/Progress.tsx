/**
 * TUF Progress Tracker — v2.0
 * Real data from localStorage: streak calendar, mobility/strength scores,
 * phase progress, workout history, weekly summary
 */
import { useLocation } from "wouter";
import { useProgress } from "@/hooks/useProgress";
import { ls, getStageFromXP } from "@/data/v4constants";
import AppShell from "@/components/AppShell";

// ── Types ────────────────────────────────────────────────────────────────────

interface WorkoutLog {
  date: string;
  name: string;
  formScore: number;
  xpEarned: number;
  duration?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

const PHASES = [
  { id: "control",   label: "CONTROL",   threshold: 0,   color: "#888" },
  { id: "stability", label: "STABILITY", threshold: 7,   color: "#FF6600" },
  { id: "strength",  label: "STRENGTH",  threshold: 14,  color: "#C8973A" },
  { id: "explosion", label: "EXPLOSION", threshold: 21,  color: "#FF2D2D" },
  { id: "evolution", label: "EVOLUTION", threshold: 30,  color: "#9B59B6" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Progress() {
  const [, navigate] = useLocation();
  const { progress } = useProgress();

  const xp = progress.xp || 0;
  const streak = progress.streakDays || 0;
  const sessions = progress.sessionsCompleted || 0;
  const stage = getStageFromXP(xp);

  const rawProfile = localStorage.getItem("tuf_profile");
  const profile = rawProfile ? JSON.parse(rawProfile) : {};
  const mobilityScore = profile.mobilityScore ?? 7;
  const strengthScore = profile.strengthScore ?? 6;
  const workoutsCompleted = profile.workoutsCompleted ?? sessions;

  // Workout history from localStorage
  const workoutHistory = ls.get<WorkoutLog[]>("tuf_workout_history", []);
  const completedDates = new Set(workoutHistory.map(w => w.date));

  // 30-day calendar
  const last30 = getLast30Days();
  const today = new Date().toISOString().split("T")[0];

  // Current phase
  const currentPhaseIdx = PHASES.reduce((best, phase, i) => {
    return workoutsCompleted >= phase.threshold ? i : best;
  }, 0);
  const currentPhase = PHASES[currentPhaseIdx];
  const nextPhase = PHASES[currentPhaseIdx + 1];
  const phaseProgress = nextPhase
    ? Math.min(100, Math.round(((workoutsCompleted - currentPhase.threshold) / (nextPhase.threshold - currentPhase.threshold)) * 100))
    : 100;

  // Weekly summary
  const thisWeekDates = last30.slice(-7);
  const thisWeekWorkouts = thisWeekDates.filter(d => completedDates.has(d)).length;

  return (
    <AppShell title="PROGRESS" showBack bottomPad={80}>
    <div style={{ background: "#080808", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .prog-fade { animation: fadeUp 0.4s ease both; }
      `}</style>

      <main className="prog-fade" style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* header handled by AppShell */}
        <div style={{ paddingTop: 16 }} />

        {/* ─── WEEKLY SUMMARY ─── */}
        <div style={{
          background: "linear-gradient(135deg, #1a1a1a, #111)",
          border: "1px solid rgba(255,102,0,0.3)",
          borderRadius: 20, padding: 20, marginBottom: 16,
          boxShadow: "0 0 30px rgba(255,102,0,0.1)",
        }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#FF6600", marginBottom: 12 }}>THIS WEEK</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "WORKOUTS", value: thisWeekWorkouts, max: 7, color: "#FF6600" },
              { label: "STREAK", value: `${streak}🔥`, color: streak >= 7 ? "#FF2D2D" : "#FF6600" },
              { label: "STAGE", value: stage.split(" ")[0], color: "#C8973A" },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: 2, color: "#555", marginTop: 3 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── SCORES ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            { label: "MOBILITY SCORE", value: mobilityScore, color: mobilityScore >= 8 ? "#00cc66" : mobilityScore >= 6 ? "#FF6600" : "#FF4444", desc: mobilityScore >= 8 ? "Excellent" : mobilityScore >= 6 ? "Developing" : "Needs Work" },
            { label: "STRENGTH SCORE", value: strengthScore, color: strengthScore >= 8 ? "#00cc66" : strengthScore >= 6 ? "#FF6600" : "#FF4444", desc: strengthScore >= 8 ? "Excellent" : strengthScore >= 6 ? "Developing" : "Needs Work" },
          ].map(score => (
            <div key={score.label} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, padding: 16,
            }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: 3, color: "#555", marginBottom: 8 }}>{score.label}</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 8 }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: score.color, lineHeight: 1 }}>{score.value}</span>
                <span style={{ fontSize: 14, color: "#555", marginBottom: 4 }}>/10</span>
              </div>
              {/* Score bar */}
              <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${score.value * 10}%`, background: score.color, borderRadius: 2, transition: "width 1s ease" }} />
              </div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: score.color, marginTop: 6 }}>{score.desc}</div>
            </div>
          ))}
        </div>

        {/* ─── PHASE PROGRESS ─── */}
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, padding: 16, marginBottom: 16,
        }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#888", marginBottom: 12 }}>PROGRAM PHASE</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            {PHASES.map((phase, i) => (
              <div key={phase.id} style={{ textAlign: "center", flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: i <= currentPhaseIdx ? phase.color : "rgba(255,255,255,0.08)",
                  border: i === currentPhaseIdx ? `2px solid ${phase.color}` : "2px solid transparent",
                  margin: "0 auto 4px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: i === currentPhaseIdx ? `0 0 12px ${phase.color}60` : "none",
                }}>
                  {i < currentPhaseIdx && <span style={{ fontSize: 12 }}>✓</span>}
                  {i === currentPhaseIdx && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", display: "block" }} />}
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 7, letterSpacing: 1, color: i <= currentPhaseIdx ? phase.color : "#444" }}>
                  {phase.label}
                </div>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden", marginTop: 8 }}>
            <div style={{ height: "100%", width: `${phaseProgress}%`, background: currentPhase.color, borderRadius: 2, transition: "width 1s ease" }} />
          </div>
          {nextPhase && (
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "#666", marginTop: 6 }}>
              {nextPhase.threshold - workoutsCompleted} workouts to {nextPhase.label}
            </div>
          )}
        </div>

        {/* ─── 30-DAY STREAK CALENDAR ─── */}
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, padding: 16, marginBottom: 16,
        }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#888", marginBottom: 12 }}>30-DAY CALENDAR</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4 }}>
            {last30.map((date) => {
              const isToday = date === today;
              const isDone = completedDates.has(date);
              return (
                <div key={date} style={{
                  aspectRatio: "1",
                  borderRadius: 4,
                  background: isDone ? "#FF6600" : isToday ? "rgba(255,102,0,0.2)" : "rgba(255,255,255,0.06)",
                  border: isToday ? "1px solid rgba(255,102,0,0.6)" : "1px solid transparent",
                  boxShadow: isDone ? "0 0 6px rgba(255,102,0,0.4)" : "none",
                }} />
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "#FF6600" }} />
              <span style={{ fontSize: 10, color: "#666" }}>Completed</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(255,102,0,0.2)", border: "1px solid rgba(255,102,0,0.6)" }} />
              <span style={{ fontSize: 10, color: "#666" }}>Today</span>
            </div>
          </div>
        </div>

        {/* ─── SARCOPENIA RISK CHART (Doc 17 §3.2) ─── */}
        <div style={{ backgroundColor: '#111111', border: '1px solid #C8973A', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: '#C8973A', marginBottom: 12 }}>SARCOPENIA RISK ANALYSIS</div>
          {/* Bar chart: mobility, strength, endurance, recovery */}
          {[
            { label: 'MOBILITY', value: mobilityScore * 10, color: mobilityScore >= 8 ? '#00CC66' : mobilityScore >= 6 ? '#FF6600' : '#FF4444' },
            { label: 'STRENGTH', value: strengthScore * 10, color: strengthScore >= 8 ? '#00CC66' : strengthScore >= 6 ? '#FF6600' : '#FF4444' },
            { label: 'ENDURANCE', value: Math.min(100, sessions * 4), color: '#C8973A' },
            { label: 'RECOVERY', value: Math.min(100, streak * 7), color: streak >= 7 ? '#00CC66' : '#FF6600' },
          ].map(bar => (
            <div key={bar.label} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 2, color: '#888' }}>{bar.label}</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: bar.color }}>{bar.value}%</span>
              </div>
              <div style={{ height: 6, backgroundColor: '#1A1A1A', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${bar.value}%`, backgroundColor: bar.color, borderRadius: 3, transition: 'width 1.2s ease' }} />
              </div>
            </div>
          ))}
          {/* Risk level */}
          <div style={{ marginTop: 12, padding: '10px 14px', backgroundColor: '#1A1A1A', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: '#888', letterSpacing: 2 }}>OVERALL RISK</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: (mobilityScore + strengthScore) >= 14 ? '#00CC66' : (mobilityScore + strengthScore) >= 10 ? '#FF6600' : '#FF4444' }}>
              {(mobilityScore + strengthScore) >= 14 ? 'LOW' : (mobilityScore + strengthScore) >= 10 ? 'MODERATE' : 'HIGH'}
            </span>
          </div>
        </div>

        {/* ─── GOLD ACTION ROW: BREAKDOWN / MAINTAIN / DEFEND (Doc 17 §3.3) ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'BREAKDOWN', icon: '💥', color: '#FF4444', sub: 'Tear & Build', route: '/train' },
            { label: 'MAINTAIN', icon: '⚡', color: '#C8973A', sub: 'Hold Gains', route: '/move' },
            { label: 'DEFEND', icon: '🛡️', color: '#00CC66', sub: 'Protect Muscle', route: '/correct' },
          ].map(btn => (
            <button key={btn.label} onClick={() => navigate(btn.route)} style={{ backgroundColor: '#111111', border: `1px solid ${btn.color}33`, borderRadius: 12, padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <span style={{ fontSize: 22 }}>{btn.icon}</span>
              <span style={{ color: btn.color, fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: '1px' }}>{btn.label}</span>
              <span style={{ color: '#555', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: '1px' }}>{btn.sub}</span>
            </button>
          ))}
        </div>

        {/* ─── XP PROGRESS ─── */}
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, padding: 16, marginBottom: 16,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#888" }}>TOTAL XP</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: "#C8973A" }}>{xp} XP</div>
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#FF6600", marginBottom: 6 }}>{stage}</div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, (xp % 500) / 5)}%`, background: "linear-gradient(90deg, #C8973A, #FF6600)", borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 6 }}>{500 - (xp % 500)} XP to next stage</div>
        </div>

        {/* ─── WORKOUT HISTORY ─── */}
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, padding: 16, marginBottom: 16,
        }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#888", marginBottom: 12 }}>RECENT SESSIONS</div>
          {workoutHistory.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🐆</div>
              <p style={{ fontSize: 12, color: "#555" }}>No sessions logged yet. Complete your first workout to start tracking.</p>
              <button
                onClick={() => navigate("/train")}
                style={{
                  marginTop: 12, padding: "10px 20px", borderRadius: 10,
                  background: "rgba(255,102,0,0.15)", border: "1px solid rgba(255,102,0,0.4)",
                  color: "#FF6600", fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 13, fontWeight: 700, letterSpacing: 2, cursor: "pointer",
                }}
              >
                START FIRST WORKOUT →
              </button>
            </div>
          ) : (
            workoutHistory.slice(-10).reverse().map((log, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0", borderBottom: i < Math.min(workoutHistory.length, 10) - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}>
                <div>
                  <div style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>{log.name}</div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{log.date}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700,
                    color: log.formScore >= 8 ? "#00cc66" : log.formScore >= 6 ? "#FF6600" : "#FF4444",
                  }}>
                    FORM {log.formScore}/10
                  </div>
                  <div style={{ fontSize: 11, color: "#C8973A" }}>+{log.xpEarned} XP</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ─── CTA ─── */}
        <button
          onClick={() => navigate("/train")}
          style={{
            width: "100%", padding: "18px 24px",
            background: "linear-gradient(135deg, #FF6600, #DC2626)",
            border: "none", borderRadius: 14,
            color: "#fff", fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 18, fontWeight: 900, letterSpacing: 3,
            cursor: "pointer", marginBottom: 16,
          }}
        >
          TRAIN NOW →
        </button>

      </main>
    </div>
    </AppShell>
  );
}
