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
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-[480px] mx-auto px-4 pt-6">

        {/* ── Greeting ──────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground font-bold">
            {greeting}{userName ? `, ${userName}` : ""}.
          </p>
          <h1 className="text-2xl font-black tracking-tight text-foreground mt-0.5">
            TURNED UP <span className="text-primary">FITNESS</span>
          </h1>
        </div>

        {/* ── Panther + Stage ───────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-6 py-4 rounded-2xl bg-card border border-border">
          <PantherAvatar
            state={progress.streakDays >= 3 ? "active" : "idle"}
            size="lg"
            message={quip}
          />
          <div className="mt-3 text-center">
            <p className={`text-sm font-black tracking-widest ${STAGE_COLORS[stage]}`}>
              {stage.toUpperCase()}
            </p>
            {!isNewUser && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalScore} / 300 points
              </p>
            )}
          </div>
        </div>

        {/* ── Score Bars ────────────────────────────────────────────── */}
        {!isNewUser ? (
          <div className="p-4 rounded-2xl bg-card border border-border mb-4 space-y-3">
            <ScoreBar label="MOBILITY" value={progress.mobility} color="bg-blue-500" delay={0} />
            <ScoreBar label="STRENGTH" value={progress.strength} color="bg-primary" delay={100} />
            <ScoreBar label="STABILITY" value={progress.stability} color="bg-emerald-500" delay={200} />
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 mb-4">
            <p className="text-sm font-black text-foreground">Start your first assessment</p>
            <p className="text-xs text-muted-foreground mt-1">
              JARVIS will identify your compensation patterns and build your corrective plan.
            </p>
          </div>
        )}

        {/* ── Streak Card ───────────────────────────────────────────── */}
        {progress.streakDays > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-black text-sm text-foreground">
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
              className="w-full text-left p-4 rounded-2xl bg-card border border-border hover:border-primary/40 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-black text-sm text-foreground">{lastPlan.issueLabel}</p>
                <span className="text-xs font-bold text-primary">START →</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {lastPlan.correctives.map((ex) => (
                  <span key={ex} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">
                    {ex.replace(/-/g, " ")}
                  </span>
                ))}
                {(lastPlan.correctives.length < (JSON.parse(localStorage.getItem("tuf_correctives") || "{}").issue?.correctives?.length || 0)) && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    +more
                  </span>
                )}
              </div>
            </button>
          </div>
        )}

        {/* ── Action Cards ──────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Primary CTA — changes based on user state */}
          {isNewUser ? (
            <button
              onClick={() => navigate("/assess")}
              className="w-full flex items-center gap-4 p-5 rounded-2xl bg-foreground text-background shadow-lg hover:shadow-xl active:scale-[0.98] transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                🧠
              </div>
              <div className="flex-1">
                <p className="font-black text-base tracking-wide">ASSESS YOUR MOVEMENT</p>
                <p className="text-background/70 text-sm">Find your weakness. Fix it at the root.</p>
              </div>
              <span className="text-background/40 text-xl">›</span>
            </button>
          ) : (
            <button
              onClick={() => navigate("/correct")}
              className="w-full flex items-center gap-4 p-5 rounded-2xl bg-foreground text-background shadow-lg hover:shadow-xl active:scale-[0.98] transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                ⚡
              </div>
              <div className="flex-1">
                <p className="font-black text-base tracking-wide">START CORRECTIVES</p>
                <p className="text-background/70 text-sm">
                  {lastPlan ? lastPlan.issueLabel : "Continue your plan"}
                </p>
              </div>
              <span className="text-background/40 text-xl">›</span>
            </button>
          )}

          {/* Secondary cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/train")}
              className="flex flex-col gap-2 p-4 rounded-2xl border-2 border-border bg-card hover:border-primary/40 active:scale-[0.97] transition-all text-left"
            >
              <span className="text-2xl">🔥</span>
              <p className="font-black text-sm tracking-wide text-foreground">TRAIN</p>
              <p className="text-xs text-muted-foreground">3 programs ready</p>
            </button>

            <button
              onClick={() => navigate("/jarvis")}
              className="flex flex-col gap-2 p-4 rounded-2xl border-2 border-border bg-card hover:border-primary/40 active:scale-[0.97] transition-all text-left"
            >
              <span className="text-2xl">🐆</span>
              <p className="font-black text-sm tracking-wide text-foreground">JARVIS</p>
              <p className="text-xs text-muted-foreground">Ask anything</p>
            </button>

            <button
              onClick={() => navigate("/live")}
              className="flex flex-col gap-2 p-4 rounded-2xl border-2 border-border bg-card hover:border-primary/40 active:scale-[0.97] transition-all text-left"
            >
              <span className="text-2xl">📷</span>
              <p className="font-black text-sm tracking-wide text-foreground">LIVE FORM</p>
              <p className="text-xs text-muted-foreground">Camera coaching</p>
            </button>

            <button
              onClick={() => navigate("/assess")}
              className="flex flex-col gap-2 p-4 rounded-2xl border-2 border-border bg-card hover:border-primary/40 active:scale-[0.97] transition-all text-left"
            >
              <span className="text-2xl">🧠</span>
              <p className="font-black text-sm tracking-wide text-foreground">ASSESS</p>
              <p className="text-xs text-muted-foreground">
                {isNewUser ? "Start here" : "Reassess"}
              </p>
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
