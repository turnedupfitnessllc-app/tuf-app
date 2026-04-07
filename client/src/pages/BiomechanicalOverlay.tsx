/**
 * TUF Biomechanical Overlay Architecture (BOA) Screen
 * Real-time pose detection + NASM compensation pattern recognition + Panther voice coaching
 */
import { useState, useEffect, useRef, useCallback } from "react";
import {
  useBiomechanics,
  type ExerciseKey,
  type CompensationAlert,
} from "../hooks/useBiomechanics";

// ─── Exercise Config ──────────────────────────────────────────────────────────
const EXERCISES: { key: ExerciseKey; name: string; icon: string; description: string; cues: string[] }[] = [
  {
    key: "gluteBridge",
    name: "Glute Bridge",
    icon: "🍑",
    description: "Lie on your back, knees bent, feet flat. Drive hips to ceiling.",
    cues: ["Feet hip-width apart", "Drive through heels", "Squeeze glutes at top", "Neutral spine throughout"],
  },
  {
    key: "squat",
    name: "Bodyweight Squat",
    icon: "⬇️",
    description: "Stand feet shoulder-width. Sit back and down, knees tracking toes.",
    cues: ["Feet shoulder-width", "Knees track over toes", "Chest up, brace core", "Drive through heels"],
  },
  {
    key: "hipHinge",
    name: "Hip Hinge",
    icon: "🔄",
    description: "Stand hip-width. Push hips back, maintain neutral spine.",
    cues: ["Soft knee bend", "Push hips back — not down", "Neutral spine throughout", "Feel hamstring tension"],
  },
  {
    key: "ohsa",
    name: "Overhead Squat",
    icon: "🙌",
    description: "Arms overhead, squat to parallel. Assessment movement.",
    cues: ["Arms locked overhead", "Feet shoulder-width", "Knees track toes", "Chest stays up"],
  },
];

// ─── Severity Colors ──────────────────────────────────────────────────────────
const SEVERITY_COLORS = {
  mild: { bg: "rgba(200,151,58,0.15)", border: "rgba(200,151,58,0.4)", text: "#C8973A" },
  moderate: { bg: "rgba(255,69,0,0.15)", border: "rgba(255,69,0,0.4)", text: "#FF4500" },
  severe: { bg: "rgba(139,0,0,0.25)", border: "rgba(139,0,0,0.6)", text: "#FF2020" },
};

// ─── ElevenLabs Voice Cue ─────────────────────────────────────────────────────
async function speakCue(text: string) {
  try {
    const res = await fetch("/api/voice/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 300) }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play().catch(() => {});
    audio.onended = () => URL.revokeObjectURL(url);
  } catch {
    // Silent fallback
  }
}

// ─── Form Score Ring ──────────────────────────────────────────────────────────
function FormScoreRing({ score }: { score: number }) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const progress = (score / 100) * circumference;
  const color = score >= 80 ? "#16A34A" : score >= 60 ? "#C8973A" : "#FF4500";

  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
        <text x="36" y="40" textAnchor="middle" fill="white" fontSize="16" fontWeight="900">
          {score}
        </text>
      </svg>
      <span className="text-[9px] uppercase tracking-widest text-gray-500 font-black">FORM</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BiomechanicalOverlay() {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseKey>("gluteBridge");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showSetup, setShowSetup] = useState(true);
  const [sessionLog, setSessionLog] = useState<{ time: string; cue: string; severity: string }[]>([]);

  const { videoRef, canvasRef, state, start, stop } = useBiomechanics(selectedExercise);

  const lastCueRef = useRef<string>("");
  const lastCueTimeRef = useRef<number>(0);

  const exerciseConfig = EXERCISES.find((e) => e.key === selectedExercise)!;

  // Voice feedback — throttled to once every 5 seconds per unique cue
  useEffect(() => {
    if (!voiceEnabled || state.compensations.length === 0) return;
    const now = Date.now();
    if (now - lastCueTimeRef.current < 5000) return;

    const topAlert = state.compensations.sort((a, b) => {
      const order = { severe: 0, moderate: 1, mild: 2 };
      return order[a.severity] - order[b.severity];
    })[0];

    if (topAlert && topAlert.cue !== lastCueRef.current) {
      lastCueRef.current = topAlert.cue;
      lastCueTimeRef.current = now;
      speakCue(topAlert.cue);

      setSessionLog((prev) => [
        {
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          cue: topAlert.cue,
          severity: topAlert.severity,
        },
        ...prev.slice(0, 9),
      ]);
    }
  }, [state.compensations, voiceEnabled]);

  // Announce rep count
  const prevRepRef = useRef(0);
  useEffect(() => {
    if (state.repCount > prevRepRef.current && voiceEnabled) {
      prevRepRef.current = state.repCount;
      if (state.repCount % 5 === 0) {
        speakCue(`${state.repCount} reps. Keep going.`);
      }
    }
  }, [state.repCount, voiceEnabled]);

  function handleStart() {
    setShowSetup(false);
    setSessionLog([]);
    prevRepRef.current = 0;
    start();
  }

  function handleStop() {
    stop();
    setShowSetup(true);
  }

  return (
    <div className="min-h-screen pb-24 pt-16" style={{ background: "#080808" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase tracking-widest text-white leading-tight">
            FORM ANALYSIS
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
            Biomechanical Overlay · NASM Corrective Standard
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice toggle */}
          <button
            onClick={() => setVoiceEnabled((v) => !v)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: voiceEnabled ? "rgba(255,69,0,0.2)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${voiceEnabled ? "rgba(255,69,0,0.5)" : "rgba(255,255,255,0.08)"}`,
            }}
            title={voiceEnabled ? "Mute Panther" : "Unmute Panther"}
          >
            <span className="text-base">{voiceEnabled ? "🔊" : "🔇"}</span>
          </button>
        </div>
      </div>

      {/* ── Setup Screen ───────────────────────────────────────────────────── */}
      {showSetup && (
        <div className="px-4 space-y-4">

          {/* Exercise Selector */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
              SELECT EXERCISE
            </p>
            <div className="grid grid-cols-2 gap-2">
              {EXERCISES.map((ex) => (
                <button
                  key={ex.key}
                  onClick={() => setSelectedExercise(ex.key)}
                  className="rounded-xl p-3 text-left transition-all"
                  style={{
                    background:
                      selectedExercise === ex.key
                        ? "rgba(255,69,0,0.15)"
                        : "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      selectedExercise === ex.key
                        ? "rgba(255,69,0,0.5)"
                        : "rgba(255,255,255,0.06)"
                    }`,
                  }}
                >
                  <div className="text-2xl mb-1">{ex.icon}</div>
                  <div
                    className="text-xs font-black uppercase tracking-wide"
                    style={{ color: selectedExercise === ex.key ? "#FF4500" : "#fff" }}
                  >
                    {ex.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Setup Card */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{exerciseConfig.icon}</span>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-wide">
                  {exerciseConfig.name}
                </p>
                <p className="text-xs text-gray-400">{exerciseConfig.description}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {exerciseConfig.cues.map((cue, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="text-xs text-gray-300">{cue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Panther BOA Intro */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(139,0,0,0.12)",
              border: "1px solid rgba(139,0,0,0.3)",
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🐆</span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-1">
                  PANTHER FORM ANALYSIS
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  I'm watching your movement in real time. Joint angles are calculated against NASM
                  corrective standards. If I see a compensation, I'll call it out immediately — and tell
                  you exactly what to fix.
                </p>
              </div>
            </div>
          </div>

          {/* Camera Permission Note */}
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-2"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span className="text-base">📷</span>
            <p className="text-xs text-gray-400">
              Camera access required. Position yourself so your full body is visible.
            </p>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="w-full py-4 rounded-xl font-black text-base uppercase tracking-widest text-white transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #FF4500, #DC2626)" }}
          >
            START FORM ANALYSIS
          </button>
        </div>
      )}

      {/* ── Active Analysis Screen ──────────────────────────────────────────── */}
      {!showSetup && (
        <div className="px-4 space-y-3">

          {/* Camera + Overlay */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "#111",
              border: "1px solid rgba(255,255,255,0.08)",
              aspectRatio: "4/3",
            }}
          >
            {/* Hidden video element */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover opacity-0"
              playsInline
              muted
            />

            {/* Canvas overlay — shows mirrored video + skeleton */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              width={640}
              height={480}
            />

            {/* Loading state */}
            {state.isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80">
                <div
                  className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "#FF4500", borderTopColor: "transparent" }}
                />
                <p className="text-xs text-gray-400 uppercase tracking-widest">Loading MediaPipe...</p>
              </div>
            )}

            {/* Error state */}
            {state.error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-4">
                <span className="text-3xl">📷</span>
                <p className="text-sm text-red-400 text-center">{state.error}</p>
                <button
                  onClick={handleStop}
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white"
                  style={{ background: "rgba(255,69,0,0.3)" }}
                >
                  GO BACK
                </button>
              </div>
            )}

            {/* Live stats overlay — top bar */}
            {state.isActive && (
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)" }}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">LIVE</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white">
                  {exerciseConfig.name}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {state.phase.toUpperCase()}
                </span>
              </div>
            )}

            {/* Bottom stats overlay */}
            {state.isActive && (
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around px-3 py-2"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}
              >
                <div className="text-center">
                  <p className="text-xl font-black text-white leading-none">{state.repCount}</p>
                  <p className="text-[9px] uppercase tracking-widest text-gray-400">REPS</p>
                </div>
                <FormScoreRing score={state.formScore} />
                <div className="text-center">
                  <p className="text-xl font-black leading-none" style={{
                    color: state.compensations.length === 0 ? "#16A34A" : "#FF4500"
                  }}>
                    {state.compensations.length === 0 ? "✓" : state.compensations.length}
                  </p>
                  <p className="text-[9px] uppercase tracking-widest text-gray-400">
                    {state.compensations.length === 0 ? "CLEAN" : "ALERTS"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Compensation Alerts */}
          {state.isActive && state.compensations.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                PANTHER SEES
              </p>
              {state.compensations.map((alert, i) => {
                const colors = SEVERITY_COLORS[alert.severity];
                return (
                  <div
                    key={i}
                    className="rounded-xl px-4 py-3"
                    style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs font-black uppercase tracking-wide mb-0.5" style={{ color: colors.text }}>
                          {alert.pattern.replace(/_/g, " ")}
                          {alert.side ? ` — ${alert.side}` : ""}
                          {alert.angle ? ` (${Math.round(alert.angle)}°)` : ""}
                        </p>
                        <p className="text-xs text-gray-300 leading-snug">{alert.cue}</p>
                      </div>
                      <span
                        className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: colors.border, color: colors.text }}
                      >
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Clean form confirmation */}
          {state.isActive && state.compensations.length === 0 && state.landmarks && (
            <div
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{
                background: "rgba(22,163,74,0.1)",
                border: "1px solid rgba(22,163,74,0.3)",
              }}
            >
              <span className="text-xl">✅</span>
              <div>
                <p className="text-xs font-black text-green-400 uppercase tracking-wide">CLEAN FORM</p>
                <p className="text-xs text-gray-400">No compensations detected. Keep it up.</p>
              </div>
            </div>
          )}

          {/* Joint Angles Panel */}
          {state.isActive && state.angles && (
            <div
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                LIVE JOINT ANGLES
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "L KNEE", value: state.angles.leftKnee },
                  { label: "R KNEE", value: state.angles.rightKnee },
                  { label: "HIP EXT", value: state.angles.hipExtension },
                  { label: "L HIP", value: state.angles.leftHip },
                  { label: "R HIP", value: state.angles.rightHip },
                  { label: "TRUNK", value: state.angles.trunkAngle },
                ].map((joint) => (
                  <div key={joint.label} className="text-center">
                    <p className="text-lg font-black text-white leading-none">
                      {Math.round(joint.value)}°
                    </p>
                    <p className="text-[9px] uppercase tracking-wider text-gray-500 mt-0.5">
                      {joint.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session Log */}
          {sessionLog.length > 0 && (
            <div
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                SESSION LOG
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {sessionLog.map((entry, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[9px] text-gray-600 flex-shrink-0 mt-0.5">{entry.time}</span>
                    <span className="text-xs text-gray-400 leading-snug">{entry.cue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stop Button */}
          <button
            onClick={handleStop}
            className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#888",
            }}
          >
            END SESSION
          </button>
        </div>
      )}
    </div>
  );
}
