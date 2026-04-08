/**
 * TUF Home Screen — Panther UX System v2
 * Fixed: header added, hero gap removed, isNewUser logic, visual hierarchy
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useProgress } from "@/hooks/useProgress";

type PantherStage = "CUB" | "STEALTH" | "CONTROLLED" | "DOMINANT" | "APEX PREDATOR";

function getPantherStage(xp: number): PantherStage {
  if (xp < 100) return "CUB";
  if (xp < 300) return "STEALTH";
  if (xp < 600) return "CONTROLLED";
  if (xp < 1000) return "DOMINANT";
  return "APEX PREDATOR";
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
  if (stage === "APEX PREDATOR") return "You've built something real. Don't stop now.";
  if (stage === "DOMINANT") return "You're close to the top. One session at a time.";
  if (stage === "CONTROLLED") return "Your movement is getting cleaner. I can see it.";
  if (stage === "STEALTH") return "Foundation is building. Trust the process.";
  return "Every session counts. Start where you are.";
}

const STAGE_COLORS: Record<PantherStage, string> = {
  "CUB": "#888888",
  "STEALTH": "#4a9eff",
  "CONTROLLED": "#FF4500",
  "DOMINANT": "#C8973A",
  "APEX PREDATOR": "#22c55e",
};

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";

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
        <span className="text-xs font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Barlow Condensed', sans-serif" }}>{label}</span>
        <span className="text-xs font-black tabular-nums text-white">{value}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const { progress, totalScore } = useProgress();
  const greeting = getGreeting();

  // User profile
  const [userName, setUserName] = useState<string>("");
  const [pantherXP, setPantherXP] = useState<number>(0);
  const [streakDays, setStreakDays] = useState<number>(0);
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("tuf_profile") || "{}");
      setUserName(p.name || "");
    } catch {}
    try {
      const mem = JSON.parse(localStorage.getItem("tuf_panther_v3") || localStorage.getItem("tuf_panther_client") || "{}");
      setPantherXP(mem.xp || 0);
      setStreakDays(mem.streakDays || 0);
    } catch {}
  }, []);

  const stage = getPantherStage(pantherXP);
  const stageColor = STAGE_COLORS[stage];
  const quip = getJarvisQuip(stage, streakDays);

  // Corrective plan
  const [lastPlan, setLastPlan] = useState<{ issueLabel: string; correctives: string[]; totalCount: number } | null>(null);
  const [hasPlan, setHasPlan] = useState(false);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("tuf_correctives") || "{}");
      if (stored?.issue?.correctives?.length) {
        setHasPlan(true);
        setLastPlan({
          issueLabel: stored.issue.label || "Corrective Plan",
          correctives: stored.issue.correctives.slice(0, 3),
          totalCount: stored.issue.correctives.length,
        });
      } else if (stored?.correctives?.length) {
        // Legacy format
        setHasPlan(true);
        setLastPlan({
          issueLabel: stored.primaryIssue || "Corrective Plan",
          correctives: stored.correctives.slice(0, 3),
          totalCount: stored.correctives.length,
        });
      }
    } catch {}
  }, []);

  const isNewUser = !hasPlan && pantherXP === 0;

  // XP bar percentage within current stage
  const xpRanges: Record<PantherStage, [number, number]> = {
    "CUB": [0, 100], "STEALTH": [100, 300], "CONTROLLED": [300, 600],
    "DOMINANT": [600, 1000], "APEX PREDATOR": [1000, 1000],
  };
  const [mn, mx] = xpRanges[stage];
  const xpPct = stage === "APEX PREDATOR" ? 100 : Math.min(100, ((pantherXP - mn) / (mx - mn)) * 100);

  return (
    <div className="min-h-screen pb-24" style={{ background: '#080808' }}>
      <main className="max-w-[480px] mx-auto px-4 pt-5">

        {/* ── Greeting ──────────────────────────────────────────────── */}
        <div className="mb-5">
          <p
            className="text-sm font-bold"
            style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em' }}
          >
            {greeting}{userName ? `, ${userName}` : ""}.
          </p>
          <h1
            className="font-black leading-none mt-0.5"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.4rem', letterSpacing: '0.06em', color: '#fff' }}
          >
            TURNED UP <span style={{ color: '#FF4500' }}>FITNESS</span>
          </h1>
        </div>

        {/* ── Panther Hero ──────────────────────────────────────────── */}
        <div
          className="relative mb-5 rounded-2xl overflow-hidden"
          style={{
            boxShadow: `0 0 60px rgba(255,69,0,0.3), 0 0 120px rgba(220,38,38,0.12), 0 4px 32px rgba(0,0,0,0.7)`,
            border: `1px solid ${stageColor}44`,
            lineHeight: 0,
          }}
        >
          {/* Panther image — fills from top edge, no gap */}
          <img
            src={`${CDN}/panther-up_950a85bd.png`}
            alt="Panther — Turned Up Fitness"
            style={{ width: '100%', height: '340px', objectFit: 'cover', objectPosition: 'center 20%', display: 'block', verticalAlign: 'top' }}
          />

          {/* Bottom gradient fade */}
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: '120px',
              background: 'linear-gradient(to top, #080808 0%, rgba(8,8,8,0.7) 50%, transparent 100%)',
            }}
          />

          {/* Stage badge — bottom center */}
          <div className="absolute bottom-3 inset-x-0 flex flex-col items-center gap-1">
            <span
              className="font-black tracking-widest text-sm"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: stageColor, letterSpacing: '0.2em' }}
            >
              {stage}
            </span>
            {/* XP bar */}
            <div className="w-32">
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${xpPct}%`, background: stageColor }}
                />
              </div>
              <p className="text-center mt-0.5" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', fontFamily: "'Barlow Condensed', sans-serif" }}>
                {pantherXP} XP
              </p>
            </div>
          </div>

          {/* Quip — top overlay */}
          <div className="absolute top-3 inset-x-3">
            <div
              className="px-3 py-2 rounded-xl"
              style={{
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <p className="text-xs text-white leading-snug" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                🐆 {quip}
              </p>
            </div>
          </div>

          {/* Streak flame — top right if active */}
          {streakDays > 0 && (
            <div className="absolute top-3 right-3">
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-lg"
                style={{ background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)' }}
              >
                <span style={{ fontSize: '12px' }}>🔥</span>
                <span
                  className="font-black"
                  style={{ fontSize: '11px', color: '#F5A623', fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {streakDays}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Score Bars (returning user) ───────────────────────────── */}
        {!isNewUser && (
          <div
            className="p-4 rounded-2xl mb-4 space-y-3"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <ScoreBar label="MOBILITY" value={progress.mobility} color="#4a9eff" delay={0} />
            <ScoreBar label="STRENGTH" value={progress.strength} color="#FF4500" delay={100} />
            <ScoreBar label="STABILITY" value={progress.stability} color="#22c55e" delay={200} />
          </div>
        )}

        {/* ── New User CTA ──────────────────────────────────────────── */}
        {isNewUser && (
          <div
            className="p-4 rounded-2xl mb-4"
            style={{
              background: 'rgba(255,69,0,0.07)',
              border: '1px solid rgba(255,69,0,0.22)',
            }}
          >
            <p className="font-black text-sm text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em' }}>
              Start your first assessment
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
              JARVIS will identify your compensation patterns and build your corrective plan.
            </p>
          </div>
        )}

        {/* ── Today's Corrective Plan ───────────────────────────────── */}
        {lastPlan && (
          <div className="mb-4">
            <p
              className="text-xs font-black tracking-widest mb-2"
              style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.15em' }}
            >
              YOUR CORRECTIVE PLAN
            </p>
            <button
              onClick={() => navigate("/correct")}
              className="w-full text-left p-4 rounded-2xl active:scale-[0.98] transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-black text-sm text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {lastPlan.issueLabel}
                </p>
                <span className="text-xs font-bold" style={{ color: '#FF4500' }}>START →</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {lastPlan.correctives.map((ex) => (
                  <span
                    key={ex}
                    className="text-xs px-2 py-0.5 rounded-full capitalize"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)' }}
                  >
                    {ex.replace(/-/g, " ")}
                  </span>
                ))}
                {lastPlan.totalCount > 3 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,69,0,0.12)', color: 'rgba(255,69,0,0.8)' }}
                  >
                    +{lastPlan.totalCount - 3} more
                  </span>
                )}
              </div>
            </button>
          </div>
        )}

        {/* ── Primary Action CTA ────────────────────────────────────── */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(isNewUser ? "/assess" : "/correct")}
            className="w-full flex items-center gap-4 p-5 rounded-2xl text-white active:scale-[0.98] transition-all text-left"
            style={{
              background: 'linear-gradient(135deg, #FF4500, #DC2626)',
              boxShadow: '0 4px 24px rgba(255,69,0,0.4)',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              {isNewUser ? '🧠' : '⚡'}
            </div>
            <div className="flex-1">
              <p
                className="font-black text-base"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.08em' }}
              >
                {isNewUser ? 'ASSESS YOUR MOVEMENT' : 'START CORRECTIVES'}
              </p>
              <p className="text-white/70 text-sm">
                {isNewUser ? 'Find your weakness. Fix it at the root.' : (lastPlan ? lastPlan.issueLabel : 'Continue your plan')}
              </p>
            </div>
            <span className="text-white/50 text-xl">›</span>
          </button>

          {/* Secondary 2×2 grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { path: '/train', icon: '🔥', label: 'TRAIN', sub: '8 programs ready' },
              { path: '/jarvis', icon: '🐆', label: 'PANTHER', sub: 'Ask anything' },
              { path: '/live', icon: '📷', label: 'LIVE FORM', sub: 'Camera coaching' },
              { path: '/assess', icon: '🧠', label: 'ASSESS', sub: isNewUser ? 'Start here' : 'Reassess' },
            ].map(({ path, icon, label, sub }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col gap-2 p-4 rounded-2xl active:scale-[0.97] transition-all text-left"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <span className="text-2xl">{icon}</span>
                <p
                  className="font-black text-sm text-white"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.08em' }}
                >
                  {label}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{sub}</p>
              </button>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
