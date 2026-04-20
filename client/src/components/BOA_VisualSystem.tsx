/**
 * BOA Visual System — Biomechanical Observation & Analysis
 * Components:
 *   BOAWindow      — compact overlay widget, drop anywhere
 *   BOAEvalScreen  — full evaluation screen
 *   BOAWorkoutScreen — in-workout analysis overlay
 *
 * Usage:
 *   import { BOAWindow } from "./BOA_VisualSystem";
 *   <BOAWindow size="compact" onDetection={handleData} active />
 *
 *   import { BOAEvalScreen, BOAWorkoutScreen } from "./BOA_VisualSystem";
 */
import { useState, useRef, useCallback, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BOADetection {
  timestamp: number;
  formScore: number;       // 1-10
  compensations: string[]; // e.g. ["knee valgus", "forward lean"]
  directive: string;       // e.g. "Drive knees out"
  confidence: number;      // 0-1
  phase: string;           // "eccentric" | "concentric" | "isometric"
}

interface BOAWindowProps {
  size?: "compact" | "full";
  active?: boolean;
  onDetection?: (data: BOADetection) => void;
  exerciseName?: string;
}

interface BOAEvalScreenProps {
  onComplete?: (results: BOADetection[]) => void;
  onClose?: () => void;
}

interface BOAWorkoutScreenProps {
  exerciseName: string;
  repCount: number;
  onFormScore?: (score: number) => void;
  onClose?: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const COMPENSATIONS = [
  "knee valgus", "forward lean", "heel rise", "hip shift",
  "rounded back", "shoulder elevation", "head forward", "lateral trunk lean",
];

function simulateDetection(exerciseName: string): BOADetection {
  const formScore = Math.round(5 + Math.random() * 4.5);
  const numCompensations = formScore < 6 ? Math.floor(Math.random() * 3) + 1 : formScore < 8 ? Math.floor(Math.random() * 2) : 0;
  const compensations = COMPENSATIONS.sort(() => Math.random() - 0.5).slice(0, numCompensations);

  const directives: Record<string, string[]> = {
    squat: ["Drive knees out over toes", "Sit back into hips", "Keep chest tall", "Brace your core"],
    "push-up": ["Tuck elbows at 45°", "Squeeze glutes", "Neutral spine", "Full range of motion"],
    deadlift: ["Hinge at hips first", "Bar stays close to body", "Neutral spine throughout", "Drive floor away"],
    lunge: ["Front knee tracks toe", "Upright torso", "Drive through front heel", "Control descent"],
  };

  const exerciseKey = Object.keys(directives).find(k => exerciseName.toLowerCase().includes(k)) || "squat";
  const directive = directives[exerciseKey][Math.floor(Math.random() * directives[exerciseKey].length)];

  return {
    timestamp: Date.now(),
    formScore,
    compensations,
    directive,
    confidence: 0.7 + Math.random() * 0.25,
    phase: ["eccentric", "concentric", "isometric"][Math.floor(Math.random() * 3)],
  };
}

// ── Score color ───────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 8) return "#00cc66";
  if (score >= 6) return "#FF6600";
  return "#FF4444";
}

// ── BOAWindow ─────────────────────────────────────────────────────────────────

export function BOAWindow({ size = "compact", active = false, onDetection, exerciseName = "Exercise" }: BOAWindowProps) {
  const [detection, setDetection] = useState<BOADetection | null>(null);
  const [scanning, setScanning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startScan = useCallback(() => {
    if (!active) return;
    setScanning(true);
    intervalRef.current = setInterval(() => {
      const d = simulateDetection(exerciseName);
      setDetection(d);
      onDetection?.(d);
    }, 2000);
  }, [active, exerciseName, onDetection]);

  const stopScan = useCallback(() => {
    setScanning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (active) startScan();
    else stopScan();
    return stopScan;
  }, [active, startScan, stopScan]);

  if (size === "compact") {
    return (
      <div style={{
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
        border: `1px solid ${detection ? scoreColor(detection.formScore) : "rgba(255,102,0,0.4)"}`,
        borderRadius: 12, padding: "10px 14px",
        minWidth: 160,
        boxShadow: detection ? `0 0 16px ${scoreColor(detection.formScore)}30` : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: detection ? 6 : 0 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: scanning ? "#FF6600" : "#444",
            boxShadow: scanning ? "0 0 6px #FF6600" : "none",
            animation: scanning ? "pulse 1s ease-in-out infinite" : "none",
          }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 3, color: "#888" }}>
            BOA {scanning ? "LIVE" : "STANDBY"}
          </span>
        </div>
        {detection && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: scoreColor(detection.formScore), lineHeight: 1 }}>
                {detection.formScore}
              </span>
              <span style={{ fontSize: 12, color: "#555" }}>/10</span>
            </div>
            {detection.compensations.length > 0 && (
              <div style={{ fontSize: 10, color: "#FF4444", marginTop: 4 }}>⚠ {detection.compensations[0]}</div>
            )}
            <div style={{ fontSize: 10, color: "#aaa", marginTop: 4, fontStyle: "italic" }}>{detection.directive}</div>
          </>
        )}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </div>
    );
  }

  // Full size
  return (
    <div style={{
      background: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)",
      border: `1px solid ${detection ? scoreColor(detection.formScore) : "rgba(255,102,0,0.3)"}`,
      borderRadius: 16, padding: 16,
      boxShadow: detection ? `0 0 30px ${scoreColor(detection.formScore)}20` : "none",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#FF6600" }}>
          🐆 BOA VISUAL SYSTEM
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "3px 8px", borderRadius: 6,
          background: scanning ? "rgba(255,102,0,0.1)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${scanning ? "rgba(255,102,0,0.4)" : "rgba(255,255,255,0.1)"}`,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: scanning ? "#FF6600" : "#444", animation: scanning ? "pulse 1s ease-in-out infinite" : "none" }} />
          <span style={{ fontSize: 10, color: scanning ? "#FF6600" : "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 2 }}>
            {scanning ? "LIVE" : "STANDBY"}
          </span>
        </div>
      </div>

      {detection ? (
        <>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 12 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: scoreColor(detection.formScore), lineHeight: 1 }}>
              {detection.formScore}
            </span>
            <div style={{ paddingBottom: 8 }}>
              <div style={{ fontSize: 14, color: "#555" }}>/10 FORM</div>
              <div style={{ fontSize: 10, color: "#666", textTransform: "capitalize" }}>{detection.phase} phase</div>
            </div>
          </div>

          {detection.compensations.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: 3, color: "#FF4444", marginBottom: 4 }}>COMPENSATIONS</div>
              {detection.compensations.map(c => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: "#FF4444" }}>⚠</span>
                  <span style={{ fontSize: 11, color: "#ccc", textTransform: "capitalize" }}>{c}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{
            background: "rgba(255,102,0,0.08)", border: "1px solid rgba(255,102,0,0.2)",
            borderRadius: 8, padding: "8px 10px",
          }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: 3, color: "#FF6600", marginBottom: 2 }}>DIRECTIVE</div>
            <div style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>{detection.directive}</div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "20px 0", color: "#555" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👁</div>
          <p style={{ fontSize: 12 }}>Waiting for movement...</p>
        </div>
      )}
    </div>
  );
}

// ── BOAEvalScreen ─────────────────────────────────────────────────────────────

export function BOAEvalScreen({ onComplete, onClose }: BOAEvalScreenProps) {
  const [phase, setPhase] = useState<"intro" | "scanning" | "results">("intro");
  const [results, setResults] = useState<BOADetection[]>([]);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [progress, setProgress] = useState(0);

  const EVAL_EXERCISES = ["Squat", "Hip Hinge", "Lunge", "Push-Up"];

  const startEval = () => {
    setPhase("scanning");
    let ex = 0;
    let prog = 0;
    const collected: BOADetection[] = [];

    const tick = setInterval(() => {
      prog += 5;
      setProgress(prog);

      if (prog % 25 === 0 && ex < EVAL_EXERCISES.length) {
        const d = simulateDetection(EVAL_EXERCISES[ex]);
        collected.push(d);
        ex++;
        setCurrentExercise(ex);
      }

      if (prog >= 100) {
        clearInterval(tick);
        setResults(collected);
        setPhase("results");
        onComplete?.(collected);
      }
    }, 100);
  };

  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.formScore, 0) / results.length) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#080808", padding: "20px 16px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#fff", letterSpacing: 2 }}>BOA EVALUATION</div>
          {onClose && <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 20 }}>✕</button>}
        </div>

        {phase === "intro" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>👁</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#FF6600", marginBottom: 8 }}>BIOMECHANICAL SCAN</div>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 24, lineHeight: 1.6 }}>
              The BOA system will analyze your movement patterns across 4 fundamental exercises. This takes about 2 minutes.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
              {EVAL_EXERCISES.map(ex => (
                <div key={ex} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>{ex}</div>
                </div>
              ))}
            </div>
            <button
              onClick={startEval}
              style={{
                width: "100%", padding: "16px",
                background: "linear-gradient(135deg, #FF6600, #DC2626)",
                border: "none", borderRadius: 14,
                color: "#fff", fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 18, fontWeight: 900, letterSpacing: 3, cursor: "pointer",
              }}
            >
              START SCAN →
            </button>
          </div>
        )}

        {phase === "scanning" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#FF6600", marginBottom: 16 }}>
              ANALYZING: {EVAL_EXERCISES[Math.min(currentExercise, EVAL_EXERCISES.length - 1)].toUpperCase()}
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden", marginBottom: 24 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #FF6600, #DC2626)", borderRadius: 3, transition: "width 0.1s linear" }} />
            </div>
            <div style={{ fontSize: 48, marginBottom: 12, animation: "pulse 1s ease-in-out infinite" }}>🐆</div>
            <p style={{ fontSize: 12, color: "#666" }}>Processing movement data...</p>
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
          </div>
        )}

        {phase === "results" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: scoreColor(avgScore), lineHeight: 1 }}>{avgScore}</div>
              <div style={{ fontSize: 14, color: "#555" }}>/10 OVERALL FORM SCORE</div>
            </div>
            {results.map((r, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, padding: 14, marginBottom: 10,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>{EVAL_EXERCISES[i]}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: scoreColor(r.formScore) }}>{r.formScore}/10</div>
                </div>
                {r.compensations.length > 0 && (
                  <div style={{ fontSize: 11, color: "#FF4444" }}>⚠ {r.compensations.join(", ")}</div>
                )}
                <div style={{ fontSize: 11, color: "#888", marginTop: 4, fontStyle: "italic" }}>{r.directive}</div>
              </div>
            ))}
            <button
              onClick={() => onComplete?.(results)}
              style={{
                width: "100%", padding: "16px",
                background: "linear-gradient(135deg, #FF6600, #DC2626)",
                border: "none", borderRadius: 14,
                color: "#fff", fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 18, fontWeight: 900, letterSpacing: 3, cursor: "pointer", marginTop: 8,
              }}
            >
              VIEW CORRECTIVE PLAN →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── BOAWorkoutScreen ──────────────────────────────────────────────────────────

export function BOAWorkoutScreen({ exerciseName, repCount, onFormScore, onClose }: BOAWorkoutScreenProps) {
  const [detection, setDetection] = useState<BOADetection | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    if (repCount > 0) {
      const d = simulateDetection(exerciseName);
      setDetection(d);
      setHistory(prev => [...prev.slice(-9), d.formScore]);
      onFormScore?.(d.formScore);
    }
  }, [repCount]);

  const avgScore = history.length > 0 ? Math.round(history.reduce((s, v) => s + v, 0) / history.length) : 0;

  return (
    <div style={{
      position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 32px)", maxWidth: 448,
      background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)",
      border: `1px solid ${detection ? scoreColor(detection.formScore) : "rgba(255,102,0,0.3)"}`,
      borderRadius: 16, padding: 16, zIndex: 100,
      boxShadow: detection ? `0 0 30px ${scoreColor(detection.formScore)}20` : "none",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: 4, color: "#FF6600", marginBottom: 4 }}>
            🐆 BOA · {exerciseName.toUpperCase()}
          </div>
          {detection ? (
            <>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: scoreColor(detection.formScore), lineHeight: 1 }}>
                  {detection.formScore}
                </span>
                <span style={{ fontSize: 12, color: "#555", paddingBottom: 4 }}>/10</span>
              </div>
              {detection.compensations.length > 0 && (
                <div style={{ fontSize: 10, color: "#FF4444", marginTop: 2 }}>⚠ {detection.compensations[0]}</div>
              )}
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 4, fontStyle: "italic" }}>{detection.directive}</div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: "#555" }}>Complete a rep to analyze...</div>
          )}
        </div>

        <div style={{ textAlign: "right" }}>
          {onClose && (
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16, display: "block", marginBottom: 8, marginLeft: "auto" }}>✕</button>
          )}
          {avgScore > 0 && (
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: 2, color: "#555" }}>AVG</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: scoreColor(avgScore) }}>{avgScore}</div>
            </div>
          )}
        </div>
      </div>

      {/* Mini history bar */}
      {history.length > 0 && (
        <div style={{ display: "flex", gap: 3, marginTop: 10, alignItems: "flex-end", height: 24 }}>
          {history.map((score, i) => (
            <div key={i} style={{
              flex: 1, background: scoreColor(score),
              borderRadius: 2, opacity: 0.4 + (i / history.length) * 0.6,
              height: `${(score / 10) * 100}%`, minHeight: 4,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
