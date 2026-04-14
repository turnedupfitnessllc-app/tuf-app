/**
 * Panther 30-Day Training System — v5.0
 * 5 phases: Control → Stability → Strength → Explosion → Evolution
 * Features: DB-backed progress, rep tracker, level scaling (Cub/Hunter/Apex)
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { getAnimationForDay, type PantherAnimation } from "@/data/pantherAnimations";
import { useAnimationPlayer, FALLBACK_VIDEO_URL } from "@/hooks/useAnimationPlayer";
import SuccessScreen from "@/components/SuccessScreen";
import { useReferral } from "@/hooks/useReferral";

const PANTHER_MASCOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/panther-mascot-gym_27e64ae1.png";

// ─── Rep Scale by Level ───────────────────────────────────────────────────────
type Level = "Cub" | "Hunter" | "Apex";
const REP_SCALE: Record<Level, number> = { Cub: 0.7, Hunter: 1.0, Apex: 1.3 };

function scaleReps(reps: number | undefined, level: Level): number | undefined {
  if (reps === undefined) return undefined;
  return Math.round(reps * REP_SCALE[level]);
}

// ─── Phase → Day range ───────────────────────────────────────────────────────
function getPhaseForDay(day: number): string {
  if (day <= 7) return "Control";
  if (day <= 14) return "Stability";
  if (day <= 21) return "Strength";
  if (day <= 29) return "Explosion";
  return "Evolution";
}

// ─── AnimationCard ────────────────────────────────────────────────────────────
function AnimationCard({ anim, color, animationId, difficulty }: {
  anim: PantherAnimation;
  color: string;
  animationId: string;
  difficulty?: "beginner" | "normal" | "intermediate" | "advanced";
}) {
  const player = useAnimationPlayer(animationId, difficulty || "normal", true);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (player.url && videoRef.current) videoRef.current.play().catch(() => {});
  }, [player.url]);
  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", height: 160, marginBottom: 14, background: anim.gradient, border: `1px solid ${color}30` }}>
      {player.url && (
        <video ref={videoRef} src={player.url} loop muted playsInline autoPlay
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }} />
      )}
      {(!player.url || player.source === "fallback") && (
        <video src={FALLBACK_VIDEO_URL} loop muted playsInline autoPlay
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.22 }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.55) 50%, transparent 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 64, height: 64, border: `2px solid ${color}`, borderRadius: "50%", opacity: 0.35, animation: "animRing 2s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, animation: "animGlow 3s ease-in-out infinite" }}>{anim.emoji}</div>
      <div style={{ position: "absolute", left: 96, top: "50%", transform: "translateY(-50%)", right: 16 }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color, marginBottom: 4, textTransform: "uppercase" }}>PANTHER MODE</p>
        <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: "0.06em", color: "var(--text-primary)", lineHeight: 1, marginBottom: 6 }}>{anim.label.toUpperCase()}</p>
        {player.status === "loading" && <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color, letterSpacing: "0.1em", animation: "animGlow 1.5s ease-in-out infinite" }}>GENERATING VIDEO...</p>}
        {player.status === "complete" && <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color, letterSpacing: "0.04em" }}>LIVE · {player.source === "cache" ? "CACHED" : "AI GENERATED"}</p>}
        {(player.status === "failed" || player.status === "idle") && <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: "0.04em", fontStyle: "italic", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{anim.prompt}</p>}
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right, transparent, ${color}80, transparent)`, animation: "scanLine 3s ease-in-out infinite" }} />
    </div>
  );
}

// ─── Rep Tracker Component ────────────────────────────────────────────────────
function RepTracker({ target, onComplete }: { target: number; onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const done = count >= target;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
      <button
        onClick={() => { if (!done) { const next = count + 1; setCount(next); if (next >= target) onComplete(); } }}
        style={{
          width: 44, height: 44, borderRadius: 12,
          background: done ? "rgba(34,197,94,0.15)" : "rgba(255,102,0,0.12)",
          border: `1px solid ${done ? "rgba(34,197,94,0.4)" : "rgba(255,102,0,0.35)"}`,
          color: done ? "#22c55e" : "#FF6600",
          fontSize: 20, fontWeight: 700, cursor: done ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s ease",
        }}
      >
        {done ? "✓" : "+"}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 2, background: done ? "#22c55e" : "#FF6600", width: `${Math.min((count / target) * 100, 100)}%`, transition: "width 0.2s ease" }} />
        </div>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: done ? "#22c55e" : "rgba(255,255,255,0.4)", marginTop: 3, letterSpacing: "0.06em" }}>
          {count} / {target} reps {done ? "✓ DONE" : ""}
        </p>
      </div>
      {count > 0 && !done && (
        <button onClick={() => setCount(0)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 12, cursor: "pointer", padding: "4px 6px" }}>↺</button>
      )}
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PHASE_COLORS: Record<string, string> = {
  Control: "#4a9eff",
  Stability: "#C8973A",
  Strength: "#FF6600",
  Explosion: "#ff6b00",
  Evolution: "#22c55e",
};

interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  duration_sec?: number;
  duration_min?: number;
  tempo?: string;
  rest_sec?: number;
  cue?: string;
}

interface ProgramDay {
  day: number;
  phase: string;
  focus: string;
  duration_min: number;
  exercises: Exercise[];
  message: string;
  content_hook: string;
}

interface ProgramState {
  user_id: string;
  level: Level;
  goal: string;
  current_day: number;
  phase: string;
  completed_days: number[];
  streak: number;
  last_completed_date?: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Panther30() {
  const [, navigate] = useLocation();
  const [days, setDays] = useState<ProgramDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"overview" | "session">("overview");
  const [activeDay, setActiveDay] = useState<ProgramDay | null>(null);
  const [repsDone, setRepsDone] = useState<Set<number>>(new Set()); // exercise indices with reps complete
  const [coaching, setCoaching] = useState<string>("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [activePhase, setActivePhase] = useState<string>("Control");
  const [completing, setCompleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{ xpAwarded: number; xpMultiplier: number; unlockedBadges: string[]; performanceScore: number; completedDay: number; streak: number } | null>(null);

  // Program state (DB-backed)
  const [programState, setProgramState] = useState<ProgramState | null>(null);
  const userId = localStorage.getItem("tuf_user_id") || "guest";
  const { refCode } = useReferral(userId !== "guest" ? userId : null);

  // Derived
  const doneDays = new Set<number>(programState?.completed_days ?? []);
  const currentDay = programState?.current_day ?? 1;
  const level: Level = programState?.level ?? "Hunter";
  const totalDone = doneDays.size;

  // ── Fetch program days from server ──────────────────────────────────────────
  useEffect(() => {
    fetch("/api/program/days")
      .then(r => r.json())
      .then(data => { setDays(data.days || data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // ── Fetch DB program state ──────────────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/panther-program/${userId}/state`)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setProgramState(res.data);
          setActivePhase(getPhaseForDay(res.data.current_day));
        }
      })
      .catch(() => {
        // Fall back to localStorage for offline/guest
        try {
          const arr: number[] = JSON.parse(localStorage.getItem("tuf_p30_done") || "[]");
          setProgramState({
            user_id: userId,
            level: "Hunter",
            goal: "Athletic Performance",
            current_day: arr.length + 1,
            phase: getPhaseForDay(arr.length + 1),
            completed_days: arr,
            streak: 0,
          });
        } catch { /* ignore */ }
      });
  }, [userId]);

  const phases = ["Control", "Stability", "Strength", "Explosion", "Evolution"];
  const phaseDays = days.filter(d => d.phase === activePhase);

  // ── Start session ───────────────────────────────────────────────────────────
  function startSession(summary: ProgramDay) {
    setCoachLoading(true);
    setCoaching("");
    setRepsDone(new Set());
    fetch(`/api/program/day/${summary.day}`)
      .then(r => r.json())
      .then(data => {
        const fullDay = data.day || summary;
        setActiveDay(fullDay);
        setView("session");
        return fetch("/api/program/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dayNum: fullDay.day }),
        });
      })
      .then(r => r.json())
      .then(d => { setCoaching(d.coaching || ""); setCoachLoading(false); })
      .catch(() => { setCoachLoading(false); });
  }

  // ── Mark rep set complete ───────────────────────────────────────────────────
  const markRepsDone = useCallback((idx: number) => {
    setRepsDone(prev => { const next = new Set(prev); next.add(idx); return next; });
  }, []);

  // ── Complete session ────────────────────────────────────────────────────────
  async function completeSession() {
    if (!activeDay || completing) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/panther-program/${userId}/complete`, { method: "POST" });
      const data = await res.json();
        if (data.success) {
        setProgramState(data.data);
        localStorage.setItem("tuf_p30_done", JSON.stringify(data.data.completed_days));
        setSuccessData({
          xpAwarded: data.xpAwarded ?? 50,
          xpMultiplier: data.xpMultiplier ?? 1,
          unlockedBadges: data.unlockedBadges ?? [],
          performanceScore: data.performanceScore ?? 85,
          completedDay: activeDay?.day ?? 1,
          streak: data.data.streak ?? 1,
        });
        setShowSuccess(true);
      }
    } catch {
      // Offline fallback
      const next = new Set(doneDays);
      next.add(activeDay.day);
      const arr = Array.from(next);
      localStorage.setItem("tuf_p30_done", JSON.stringify(arr));
      setProgramState(prev => prev ? { ...prev, completed_days: arr, current_day: Math.min(activeDay.day + 1, 30) } : null);
      setSuccessData({
        xpAwarded: 50,
        xpMultiplier: 1,
        unlockedBadges: [],
        performanceScore: 85,
        completedDay: activeDay?.day ?? 1,
        streak: 1,
      });
      setShowSuccess(true);
    } finally {
      setCompleting(false);
    }
  }

  function formatExercise(ex: Exercise, lvl: Level): string {
    const parts: string[] = [];
    if (ex.sets) parts.push(`${ex.sets} sets`);
    const scaledReps = scaleReps(ex.reps, lvl);
    if (scaledReps !== undefined) parts.push(`${scaledReps} reps`);
    if (ex.duration_sec) parts.push(`${ex.duration_sec} sec`);
    if (ex.duration_min) parts.push(`${ex.duration_min} min`);
    if (ex.tempo) parts.push(`Tempo: ${ex.tempo}`);
    if (ex.rest_sec) parts.push(`Rest: ${ex.rest_sec}s`);
    return parts.join(" · ");
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>LOADING PROGRAM...</p>
      </div>
    );
  }

  // ── SESSION VIEW ─────────────────────────────────────────────────────────────
  if (view === "session" && activeDay) {
    const color = PHASE_COLORS[activeDay.phase] || "#FF6600";
    const allRepsTracked = repsDone.size >= activeDay.exercises.filter(e => e.reps).length;
    const anim = getAnimationForDay(activeDay.phase, activeDay.focus, activeDay.exercises[0]?.name?.toLowerCase().replace(/\s+/g, "_"));
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 96 }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
          @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
          @keyframes animGlow { 0%,100%{opacity:0.6} 50%{opacity:1} }
          @keyframes animRing { 0%,100%{transform:translateY(-50%) scale(1);opacity:0.35} 50%{transform:translateY(-50%) scale(1.18);opacity:0.7} }
          @keyframes scanLine { 0%{opacity:0.3} 50%{opacity:0.9} 100%{opacity:0.3} }
          @keyframes successPop { 0%{opacity:0;transform:scale(0.8)} 20%{opacity:1;transform:scale(1.08)} 100%{opacity:1;transform:scale(1)} }
        `}</style>
        <main style={{ maxWidth: 480, margin: "0 auto", padding: "72px 16px 0" }}>
          <button onClick={() => setView("overview")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", marginBottom: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", cursor: "pointer" }}>
            ← BACK
          </button>

          {/* ── Full Success Screen ── */}
          {showSuccess && successData && (
            <SuccessScreen
              completedDay={successData.completedDay}
              xpAwarded={successData.xpAwarded}
              xpMultiplier={successData.xpMultiplier}
              unlockedBadges={successData.unlockedBadges}
              performanceScore={successData.performanceScore}
              streak={successData.streak}
              totalDone={doneDays.size}
              phase={activeDay?.phase ?? "Control"}
              workoutStats={{ reps: repsDone.size * 10, time: activeDay?.duration_min ?? 30 }}
              refCode={refCode}
              onContinue={() => {
                setShowSuccess(false);
                setSuccessData(null);
                setView("overview");
                setActivePhase(getPhaseForDay(programState?.current_day ?? 1));
              }}
            />
          )}

          {/* Animation card */}
          <AnimationCard anim={anim} color={color} animationId={anim.key} />

          {/* Header */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color, padding: "3px 8px", border: `1px solid ${color}40`, borderRadius: 4 }}>{activeDay.phase.toUpperCase()}</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>DAY {activeDay.day} · {activeDay.duration_min} MIN</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: level === "Apex" ? "#FF6600" : level === "Cub" ? "#4a9eff" : "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginLeft: "auto" }}>{level.toUpperCase()}</span>
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: "0.06em", color: "var(--text-primary)", lineHeight: 1 }}>{activeDay.focus.toUpperCase()}</h1>
          </div>

          {/* Coaching */}
          {(coaching || coachLoading) && (
            <div style={{ padding: "12px 14px", borderRadius: 12, background: `${color}08`, border: `1px solid ${color}20`, marginBottom: 16 }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color, marginBottom: 4 }}>PANTHER DIRECTIVE</p>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
                {coachLoading ? "Generating coaching..." : coaching}
              </p>
            </div>
          )}

          {/* Exercises */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {activeDay.exercises.map((ex, i) => {
              const scaledReps = scaleReps(ex.reps, level);
              const hasReps = scaledReps !== undefined && scaledReps > 0;
              const repComplete = repsDone.has(i);
              return (
                <div key={i} style={{ padding: "14px 16px", borderRadius: 14, background: repComplete ? "rgba(34,197,94,0.04)" : "rgba(255,255,255,0.02)", border: `1px solid ${repComplete ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.07)"}`, animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: repComplete ? "rgba(34,197,94,0.12)" : `${color}12`, border: `1px solid ${repComplete ? "rgba(34,197,94,0.3)" : `${color}30`}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, color: repComplete ? "#22c55e" : color }}>{repComplete ? "✓" : i + 1}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, color: repComplete ? "rgba(255,255,255,0.45)" : "var(--text-primary)", letterSpacing: "0.03em" }}>{ex.name}</p>
                      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{formatExercise(ex, level)}</p>
                      {ex.cue && <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: `${color}80`, marginTop: 3, fontStyle: "italic" }}>{ex.cue}</p>}
                    </div>
                  </div>
                  {/* Rep Tracker */}
                  {hasReps && !repComplete && (
                    <RepTracker target={scaledReps!} onComplete={() => markRepsDone(i)} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Complete Button */}
          <button
            onClick={completeSession}
            disabled={completing}
            style={{
              width: "100%", padding: "18px", borderRadius: 16, border: "none",
              background: allRepsTracked ? "linear-gradient(135deg, #22c55e, #16a34a)" : "linear-gradient(135deg, #FF6600, #cc4400)",
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.1em",
              color: "#fff", cursor: completing ? "not-allowed" : "pointer",
              opacity: completing ? 0.6 : 1, transition: "all 0.2s ease",
              boxShadow: allRepsTracked ? "0 4px 20px rgba(34,197,94,0.3)" : "0 4px 20px rgba(255,102,0,0.25)",
            }}
          >
            {completing ? "SAVING..." : allRepsTracked ? "✓ COMPLETE DAY" : "COMPLETE DAY"}
          </button>
        </main>
      </div>
    );
  }

  // ── OVERVIEW ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 96 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes animGlow { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes animRing { 0%,100%{transform:translateY(-50%) scale(1);opacity:0.35} 50%{transform:translateY(-50%) scale(1.18);opacity:0.7} }
        @keyframes scanLine { 0%{opacity:0.3} 50%{opacity:0.9} 100%{opacity:0.3} }
      `}</style>
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "72px 16px 0" }}>
        <button onClick={() => navigate("/program")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", marginBottom: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", cursor: "pointer" }}>
          ← PROGRAMS
        </button>

        {/* Header */}
        <div style={{ marginBottom: 16, animation: "fadeUp 0.4s ease forwards" }}>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "#FF6600", marginBottom: 2 }}>PANTHER SYSTEM</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: "0.07em", color: "var(--text-primary)", lineHeight: 1 }}>30-DAY PROGRAM</h1>
          <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              Day {Math.min(currentDay, 30)} of 30 · {totalDone} sessions complete
            </p>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#FF6600" }}>
              🔥 {programState?.streak ?? 0} day streak
            </p>
          </div>
        </div>

        {/* Level badge */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {(["Cub", "Hunter", "Apex"] as Level[]).map(lvl => (
            <button
              key={lvl}
              onClick={() => {
                setProgramState(prev => prev ? { ...prev, level: lvl } : null);
                fetch(`/api/panther-program/${userId}/state`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ level: lvl }),
                }).catch(() => {});
              }}
              style={{
                padding: "6px 12px", borderRadius: 16, border: "none", flexShrink: 0,
                background: level === lvl ? (lvl === "Apex" ? "#FF6600" : lvl === "Cub" ? "#4a9eff" : "rgba(255,255,255,0.12)") : "rgba(255,255,255,0.04)",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.08em", color: level === lvl ? "#fff" : "rgba(255,255,255,0.35)",
                cursor: "pointer",
              }}
            >{lvl.toUpperCase()}</button>
          ))}
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.25)", alignSelf: "center", marginLeft: 4 }}>
            {level === "Cub" ? "70% reps" : level === "Apex" ? "130% reps" : "100% reps"}
          </span>
        </div>

        {/* Overall progress bar */}
        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #FF6600, #22c55e)", width: `${Math.round((totalDone / 30) * 100)}%`, transition: "width 0.6s ease" }} />
        </div>

        {/* Phase tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
          {phases.map(p => (
            <button key={p} onClick={() => setActivePhase(p)} style={{ padding: "8px 14px", borderRadius: 20, border: "none", flexShrink: 0, background: activePhase === p ? PHASE_COLORS[p] : "rgba(255,255,255,0.05)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: activePhase === p ? "#fff" : "rgba(255,255,255,0.4)", cursor: "pointer" }}>
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Day cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {phaseDays.map((day, i) => {
            const done = doneDays.has(day.day);
            const isNext = day.day === currentDay;
            const color = PHASE_COLORS[day.phase] || "#FF6600";
            return (
              <button key={day.day} onClick={() => startSession(day)} style={{ padding: "16px", borderRadius: 16, border: "none", background: done ? "rgba(34,197,94,0.04)" : isNext ? `${color}08` : "rgba(13,13,13,0.95)", outline: `1px solid ${done ? "rgba(34,197,94,0.25)" : isNext ? `${color}44` : "rgba(255,255,255,0.07)"}`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left", animation: `fadeUp 0.3s ease ${i * 0.06}s both` }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: done ? "rgba(34,197,94,0.12)" : isNext ? `${color}15` : "rgba(255,255,255,0.04)", border: `1px solid ${done ? "rgba(34,197,94,0.3)" : isNext ? `${color}40` : "rgba(255,255,255,0.06)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: done ? "#22c55e" : isNext ? color : "rgba(255,255,255,0.3)", lineHeight: 1 }}>{done ? "✓" : day.day}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, color: done ? "rgba(255,255,255,0.4)" : "var(--text-primary)", letterSpacing: "0.04em" }}>
                    {day.focus.toUpperCase()}
                    {isNext && <span style={{ marginLeft: 8, fontSize: 9, padding: "2px 6px", background: `${color}20`, border: `1px solid ${color}40`, borderRadius: 3, color, letterSpacing: "0.08em" }}>TODAY</span>}
                  </p>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                    ~{day.duration_min} min · {day.exercises.length} exercises
                  </p>
                </div>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 20 }}>›</span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
