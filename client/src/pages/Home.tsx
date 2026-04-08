/**
 * TUF Home Screen — Panther UX v3
 * Layout: Panther greeting → Today's Focus → Pain Status → Quick Actions
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

type PantherStage = "CUB" | "STEALTH" | "CONTROLLED" | "DOMINANT" | "APEX PREDATOR";

function getPantherStage(xp: number): PantherStage {
  if (xp < 100) return "CUB";
  if (xp < 300) return "STEALTH";
  if (xp < 600) return "CONTROLLED";
  if (xp < 1000) return "DOMINANT";
  return "APEX PREDATOR";
}

const STAGE_COLORS: Record<PantherStage, string> = {
  "CUB": "#888888",
  "STEALTH": "#4a9eff",
  "CONTROLLED": "#FF4500",
  "DOMINANT": "#C8973A",
  "APEX PREDATOR": "#22c55e",
};

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";

const FOCUS_OPTIONS = [
  { label: "Lower Body", icon: "🦵", color: "#FF4500" },
  { label: "Mobility", icon: "🌀", color: "#4a9eff" },
  { label: "Recovery", icon: "💤", color: "#22c55e" },
  { label: "Upper Body", icon: "💪", color: "#C8973A" },
  { label: "Core", icon: "⚡", color: "#a855f7" },
];

export default function Home() {
  const [, navigate] = useLocation();

  // User state
  const [userName, setUserName] = useState<string>("");
  const [pantherXP, setPantherXP] = useState<number>(0);
  const [streakDays, setStreakDays] = useState<number>(0);
  const [hasPlan, setHasPlan] = useState(false);
  const [lastPainLog, setLastPainLog] = useState<{ location: string; level: number } | null>(null);
  const [todayFocusIdx, setTodayFocusIdx] = useState(0);

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("tuf_profile") || "{}");
      setUserName(p.name || "");
    } catch {}
    try {
      const mem = JSON.parse(
        localStorage.getItem("tuf_panther_v3") ||
        localStorage.getItem("tuf_panther_client") || "{}"
      );
      setPantherXP(mem.xp || 0);
      setStreakDays(mem.streakDays || 0);
    } catch {}
    try {
      const stored = JSON.parse(localStorage.getItem("tuf_correctives") || "{}");
      if (stored?.issue?.correctives?.length || stored?.correctives?.length) {
        setHasPlan(true);
      }
    } catch {}
    try {
      const painLogs = JSON.parse(localStorage.getItem("tuf_pain_logs") || "[]");
      if (painLogs.length > 0) {
        const latest = painLogs[painLogs.length - 1];
        setLastPainLog({ location: latest.location || latest.pain_location, level: latest.level || latest.pain_level });
      }
    } catch {}
    // Rotate today's focus based on day of week
    setTodayFocusIdx(new Date().getDay() % FOCUS_OPTIONS.length);
  }, []);

  const stage = getPantherStage(pantherXP);
  const stageColor = STAGE_COLORS[stage];
  const isNewUser = !hasPlan && pantherXP === 0;
  const todayFocus = FOCUS_OPTIONS[todayFocusIdx];

  // XP bar
  const xpRanges: Record<PantherStage, [number, number]> = {
    "CUB": [0, 100], "STEALTH": [100, 300], "CONTROLLED": [300, 600],
    "DOMINANT": [600, 1000], "APEX PREDATOR": [1000, 1000],
  };
  const [mn, mx] = xpRanges[stage];
  const xpPct = stage === "APEX PREDATOR" ? 100 : Math.min(100, ((pantherXP - mn) / (mx - mn)) * 100);

  const hasPain = lastPainLog && lastPainLog.level >= 3;

  return (
    <div className="min-h-screen pb-28" style={{ background: '#080808' }}>
      <main className="max-w-[480px] mx-auto px-4 pt-5 space-y-4">

        {/* ── Panther Hero + Greeting ───────────────────────────────── */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            border: `1px solid ${stageColor}33`,
            boxShadow: `0 0 60px rgba(255,69,0,0.2), 0 4px 32px rgba(0,0,0,0.7)`,
          }}
        >
          {/* Panther image */}
          <img
            src={`${CDN}/panther-up_950a85bd.png`}
            alt="Panther"
            style={{
              width: '100%',
              height: '300px',
              objectFit: 'cover',
              objectPosition: 'center 20%',
              display: 'block',
            }}
          />

          {/* Bottom gradient */}
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: '160px',
              background: 'linear-gradient(to top, #080808 0%, rgba(8,8,8,0.85) 40%, transparent 100%)',
            }}
          />

          {/* Streak badge — top right */}
          {streakDays > 0 && (
            <div className="absolute top-3 right-3">
              <div
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl"
                style={{ background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.35)' }}
              >
                <span style={{ fontSize: '13px' }}>🔥</span>
                <span className="font-black text-xs" style={{ color: '#F5A623', fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {streakDays}d
                </span>
              </div>
            </div>
          )}

          {/* Stage + XP — top left */}
          <div className="absolute top-3 left-3">
            <div
              className="px-2.5 py-1.5 rounded-xl"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', border: `1px solid ${stageColor}44` }}
            >
              <p className="font-black text-xs tracking-widest" style={{ color: stageColor, fontFamily: "'Barlow Condensed', sans-serif" }}>
                {stage}
              </p>
            </div>
          </div>

          {/* Greeting + CTA — bottom overlay */}
          <div className="absolute bottom-0 inset-x-0 px-4 pb-4">
            {/* Greeting */}
            <p
              className="text-xs mb-0.5"
              style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.08em' }}
            >
              {userName ? `WELCOME BACK, ${userName.toUpperCase()}` : "WELCOME BACK"}
            </p>
            <h1
              className="font-black leading-none mb-3"
              style={{
                fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
                fontSize: '2rem',
                color: '#fff',
                letterSpacing: '0.04em',
              }}
            >
              READY TO MOVE WITH PRECISION?
            </h1>

            {/* XP bar */}
            <div className="mb-3">
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${xpPct}%`, background: stageColor }}
                />
              </div>
              <p className="mt-0.5 text-right" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: "'Barlow Condensed', sans-serif" }}>
                {pantherXP} XP
              </p>
            </div>

            {/* START WORKOUT button */}
            <button
              onClick={() => navigate(isNewUser ? "/assess" : hasPlan ? "/correct" : "/program")}
              className="w-full py-3.5 rounded-xl font-black text-white text-sm tracking-widest active:scale-[0.98] transition-all"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                background: 'linear-gradient(135deg, #FF4500, #DC2626)',
                boxShadow: '0 4px 20px rgba(255,69,0,0.45)',
                letterSpacing: '0.15em',
              }}
            >
              {isNewUser ? 'START ASSESSMENT' : 'START WORKOUT'}
            </button>
          </div>
        </div>

        {/* ── Today's Focus ─────────────────────────────────────────── */}
        <div
          className="p-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p
            className="text-xs font-black tracking-widest mb-3"
            style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.15em' }}
          >
            TODAY'S FOCUS
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {FOCUS_OPTIONS.map((f, i) => (
              <button
                key={f.label}
                onClick={() => setTodayFocusIdx(i)}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all active:scale-[0.97]"
                style={{
                  background: i === todayFocusIdx ? `${f.color}22` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${i === todayFocusIdx ? f.color + '55' : 'rgba(255,255,255,0.07)'}`,
                }}
              >
                <span style={{ fontSize: '20px' }}>{f.icon}</span>
                <span
                  className="font-black text-xs whitespace-nowrap"
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    color: i === todayFocusIdx ? f.color : 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {f.label.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Pain Status ───────────────────────────────────────────── */}
        <button
          onClick={() => navigate("/assess")}
          className="w-full p-4 rounded-2xl text-left active:scale-[0.98] transition-all"
          style={{
            background: hasPain
              ? 'rgba(220,38,38,0.08)'
              : 'rgba(34,197,94,0.06)',
            border: `1px solid ${hasPain ? 'rgba(220,38,38,0.3)' : 'rgba(34,197,94,0.2)'}`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: hasPain ? 'rgba(220,38,38,0.15)' : 'rgba(34,197,94,0.12)' }}
              >
                {hasPain ? '⚠️' : '✅'}
              </div>
              <div>
                <p
                  className="font-black text-sm text-white"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em' }}
                >
                  PAIN STATUS
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {hasPain
                    ? `${lastPainLog!.location} — Level ${lastPainLog!.level}/10 detected`
                    : "No pain detected — movement clear"}
                </p>
              </div>
            </div>
            <span style={{ color: hasPain ? '#DC2626' : '#22c55e', fontSize: '18px' }}>›</span>
          </div>
        </button>

        {/* ── Quick Actions ─────────────────────────────────────────── */}
        <div>
          <p
            className="text-xs font-black tracking-widest mb-3"
            style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.15em' }}
          >
            QUICK ACTIONS
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                path: hasPlan ? "/correct" : "/program",
                icon: '⚡',
                label: 'START TRAINING',
                color: '#FF4500',
                bg: 'rgba(255,69,0,0.1)',
                border: 'rgba(255,69,0,0.25)',
              },
              {
                path: '/assess',
                icon: '🩺',
                label: 'LOG PAIN',
                color: '#DC2626',
                bg: 'rgba(220,38,38,0.08)',
                border: 'rgba(220,38,38,0.2)',
              },
              {
                path: '/assess',
                icon: '🧠',
                label: 'ASSESS',
                color: '#4a9eff',
                bg: 'rgba(74,158,255,0.08)',
                border: 'rgba(74,158,255,0.2)',
              },
            ].map(({ path, icon, label, color, bg, border }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="flex flex-col items-center gap-2 p-3.5 rounded-2xl active:scale-[0.96] transition-all"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <span style={{ fontSize: '22px' }}>{icon}</span>
                <span
                  className="font-black text-center leading-tight"
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '10px',
                    color,
                    letterSpacing: '0.08em',
                  }}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Panther Brain teaser ──────────────────────────────────── */}
        <button
          onClick={() => navigate("/jarvis")}
          className="w-full p-4 rounded-2xl text-left active:scale-[0.98] transition-all"
          style={{
            background: 'rgba(255,69,0,0.05)',
            border: '1px solid rgba(255,69,0,0.18)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'rgba(255,69,0,0.12)' }}
            >
              🐆
            </div>
            <div className="flex-1">
              <p
                className="font-black text-sm text-white"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.06em' }}
              >
                ASK PANTHER BRAIN
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                "Why does my lower back hurt after squats?"
              </p>
            </div>
            <span style={{ color: '#FF4500', fontSize: '18px' }}>›</span>
          </div>
        </button>

      </main>
    </div>
  );
}
