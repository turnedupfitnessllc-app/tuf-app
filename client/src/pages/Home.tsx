/**
 * TUF Home Screen — Panther UX System
 * Live data from useProgress hook
 * Dynamic greeting · Today's plan · Scores · Streak
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { PantherAvatar } from "@/components/PantherAvatar";
import { useProgress } from "@/hooks/useProgress";

type PantherStage = "Cub" | "Stealth" | "Controlled" | "Dominant" | "Apex Predator";

function getPantherStage(totalScore: number): PantherStage {
  if (totalScore < 100) return "Cub";
  if (totalScore < 200) return "Stealth";
  if (totalScore < 300) return "Controlled";
  if (totalScore < 400) return "Dominant";
  return "Apex Predator";
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up?";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Late session?";
}

function getJarvisQuip(stage: PantherStage, streak: number): string {
  if (streak >= 7) return "Seven days straight. That's discipline.";
  if (streak >= 3) return "Three days in a row. Keep the chain alive.";
  if (stage === "Apex Predator") return "You've built something real. Don't stop now.";
  if (stage === "Dominant") return "You're close to the top. One session at a time.";
  if (stage === "Controlled") return "Your movement is getting cleaner. I can see it.";
  if (stage === "Stealth") return "Foundation is building. Trust the process.";
  return "Every session counts. Start where you are.";
}

const STAGE_COLORS: Record<PantherStage, string> = {
  "Cub": "text-muted-foreground",
  "Stealth": "text-blue-500",
  "Controlled": "text-primary",
  "Dominant": "text-amber-500",
  "Apex Predator": "text-emerald-500",
};

interface ScoreBarProps {
  label: string;
  value: number;
  color: string;
  delay?: number;
}

function ScoreBar({ label, value, color, delay = 0 }: ScoreBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 100 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-black tracking-widest text-muted-foreground">{label}</span>
        <span className="text-xs font-black text-foreground tabular-nums">{value}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const { progress, totalScore } = useProgress();
  const stage = getPantherStage(totalScore);
  const greeting = getGreeting();
  const quip = getJarvisQuip(stage, progress.streakDays);

  // Load user profile for name
  const [userName, setUserName] = useState<string>("");
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("tuf_profile") || "{}");
      setUserName(p.name || "");
    } catch {}
  }, []);

  // Load last corrective plan
  const [lastPlan, setLastPlan] = useState<{ issueLabel: string; correctives: string[] } | null>(null);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("tuf_correctives") || "{}");
      if (stored?.issue?.correctives?.length) {
        setLastPlan({
          issueLabel: stored.issue.label || "Corrective Plan",
          correctives: stored.issue.correctives.slice(0, 3),
        });
      }
    } catch {}
  }, []);

  const isNewUser = progress.sessionsCompleted === 0;

  return (
    <div className="min-h-screen bg-[#080808] pb-24">
      <main className="max-w-[480px] mx-auto px-4 pt-6">

        {/* ── Greeting ──────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground font-bold">
            {greeting}{userName ? `, ${userName}` : ""}.
          </p>
          <h1
            className="font-black leading-none mt-0.5"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.2rem', letterSpacing: '0.06em' }}
          >
            TURNED UP <span className="text-primary">FITNESS</span>
          </h1>
        </div>

        {/* ── Panther Hero ──────────────────────────────────────────── */}
        <div
          className="relative mb-6 rounded-3xl overflow-hidden"
          style={{
            boxShadow: '0 0 60px rgba(255,69,0,0.35), 0 0 120px rgba(220,38,38,0.15), 0 4px 32px rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,69,0,0.25)',
          }}
        >
          {/* Panther UP image */}
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/panther-up_950a85bd.png"
            alt="Panther — Turned Up Fitness"
            className="w-full object-cover"
            style={{ maxHeight: '380px', objectPosition: 'top' }}
          />
          {/* Red glow overlay at bottom */}
          <div
            className="absolute inset-x-0 bottom-0 h-32"
            style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.5) 50%, transparent 100%)' }}
          />
          {/* Stage badge */}
          <div className="absolute bottom-4 inset-x-0 flex flex-col items-center">
            <p className={`text-sm font-black tracking-widest ${STAGE_COLORS[stage]}`}
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.15em' }}>
              {stage.toUpperCase()}
            </p>
            {!isNewUser && (
              <p className="text-xs text-muted-foreground mt-0.5">{totalScore} / 300 points</p>
            )}
          </div>
          {/* Quip overlay */}
          <div className="absolute top-4 inset-x-4">
            <div
              className="px-3 py-2 rounded-xl"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-xs text-white leading-snug">🐆 {quip}</p>
            </div>
          </div>
        </div>

        {/* ── Score Bars ────────────────────────────────────────────── */}
        {!isNewUser ? (
          <div
            className="p-4 rounded-2xl mb-4 space-y-3"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
            }}
          >
            <ScoreBar label="MOBILITY" value={progress.mobility} color="bg-blue-500" delay={0} />
            <ScoreBar label="STRENGTH" value={progress.strength} color="bg-primary" delay={100} />
            <ScoreBar label="STABILITY" value={progress.stability} color="bg-emerald-500" delay={200} />
          </div>
        ) : (
          <div
            className="p-4 rounded-2xl mb-4"
            style={{
              background: 'rgba(255,69,0,0.06)',
              border: '1px solid rgba(255,69,0,0.2)',
            }}
          >
            <p className="text-sm font-black text-white">Start your first assessment</p>
            <p className="text-xs text-muted-foreground mt-1">
              JARVIS will identify your compensation patterns and build your corrective plan.
            </p>
          </div>
        )}

        {/* ── Streak Card ───────────────────────────────────────────── */}
        {progress.streakDays > 0 && (
          <div
            className="flex items-center gap-3 p-4 rounded-2xl mb-4"
            style={{
              background: 'rgba(245,166,35,0.08)',
              border: '1px solid rgba(245,166,35,0.2)',
              boxShadow: '0 2px 16px rgba(245,166,35,0.08)',
            }}
          >
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-black text-sm text-white">
                {progress.streakDays} Day Streak
              </p>
              <p className="text-xs text-muted-foreground">
                {progress.sessionsCompleted} sessions · {progress.totalMinutes} min total
              </p>
            </div>
          </div>
        )}

        {/* ── Today's Plan (from last Assess) ───────────────────────── */}
        {lastPlan && (
          <div className="mb-4">
            <p className="text-xs font-black tracking-widest text-muted-foreground mb-2">
              YOUR CORRECTIVE PLAN
            </p>
            <button
              onClick={() => navigate("/correct")}
              className="w-full text-left p-4 rounded-2xl active:scale-[0.98] transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-black text-sm text-white">{lastPlan.issueLabel}</p>
                <span className="text-xs font-bold text-primary">START →</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {lastPlan.correctives.map((ex) => (
                  <span
                    key={ex}
                    className="text-xs px-2 py-0.5 rounded-full capitalize"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    {ex.replace(/-/g, " ")}
                  </span>
                ))}
                {(lastPlan.correctives.length < (JSON.parse(localStorage.getItem("tuf_correctives") || "{}").issue?.correctives?.length || 0)) && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    +more
                  </span>
                )}
              </div>
            </button>
          </div>
        )}

        {/* ── Action Cards ──────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Primary CTA */}
          {isNewUser ? (
            <button
              onClick={() => navigate("/assess")}
              className="w-full flex items-center gap-4 p-5 rounded-2xl text-white active:scale-[0.98] transition-all text-left"
              style={{
                background: 'linear-gradient(135deg, #FF4500, #DC2626)',
                boxShadow: '0 4px 24px rgba(255,69,0,0.35)',
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl flex-shrink-0">
                🧠
              </div>
              <div className="flex-1">
                <p
                  className="font-black text-base"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.08em' }}
                >
                  ASSESS YOUR MOVEMENT
                </p>
                <p className="text-white/70 text-sm">Find your weakness. Fix it at the root.</p>
              </div>
              <span className="text-white/50 text-xl">›</span>
            </button>
          ) : (
            <button
              onClick={() => navigate("/correct")}
              className="w-full flex items-center gap-4 p-5 rounded-2xl text-white active:scale-[0.98] transition-all text-left"
              style={{
                background: 'linear-gradient(135deg, #FF4500, #DC2626)',
                boxShadow: '0 4px 24px rgba(255,69,0,0.35)',
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl flex-shrink-0">
                ⚡
              </div>
              <div className="flex-1">
                <p
                  className="font-black text-base"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.08em' }}
                >
                  START CORRECTIVES
                </p>
                <p className="text-white/70 text-sm">
                  {lastPlan ? lastPlan.issueLabel : "Continue your plan"}
                </p>
              </div>
              <span className="text-white/50 text-xl">›</span>
            </button>
          )}

          {/* Secondary cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { path: '/train', icon: '🔥', label: 'TRAIN', sub: '8 programs ready' },
              { path: '/jarvis', icon: '🐆', label: 'JARVIS', sub: 'Ask anything' },
              { path: '/live', icon: '📷', label: 'LIVE FORM', sub: 'Camera coaching' },
              { path: '/assess', icon: '🧠', label: 'ASSESS', sub: isNewUser ? 'Start here' : 'Reassess' },
            ].map(({ path, icon, label, sub }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col gap-2 p-4 rounded-2xl active:scale-[0.97] transition-all text-left"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                <span className="text-2xl">{icon}</span>
                <p
                  className="font-black text-sm text-white"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.08em' }}
                >
                  {label}
                </p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </button>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
