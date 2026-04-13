/**
 * BOA — Biomechanical Overlay Analysis
 *
 * Real-time pose detection using TensorFlow.js MoveNet.
 * Features:
 *   - Camera feed with keypoint skeleton overlay
 *   - Joint angle calculation (hip-knee-ankle for squats)
 *   - Rep counter with stage detection (up/down)
 *   - Voice cue on rep completion via /api/voice/generate
 *   - Dysfunction scoring (UCS / LCS / Knee / Shoulder flags)
 *   - Exercise selector: squat, pushup, plank, lunge, rdl
 */

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";

// ─── Types ────────────────────────────────────────────────────────────────────

type ExerciseMode = "squat" | "pushup" | "plank" | "lunge" | "rdl";
type DysfunctionFlag = "UCS" | "LCS" | "KNEE" | "SHOULDER";

interface DysfunctionScore {
  flag: DysfunctionFlag;
  label: string;
  detected: boolean;
  detail: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EXERCISE_CONFIGS: Record<
  ExerciseMode,
  {
    label: string;
    voiceId: string;
    depthAngleThreshold: number; // angle at "down" position
    topAngleThreshold: number;   // angle at "up" / top position
    joints: [string, string, string]; // [a, b, c] for getAngle
    cueText: string;
  }
> = {
  squat: {
    label: "Squat",
    voiceId: "sq_slow",
    depthAngleThreshold: 100,
    topAngleThreshold: 160,
    joints: ["left_hip", "left_knee", "left_ankle"],
    cueText: "Control the descent. Own every inch.",
  },
  lunge: {
    label: "Lunge",
    voiceId: "split_squat",
    depthAngleThreshold: 100,
    topAngleThreshold: 160,
    joints: ["left_hip", "left_knee", "left_ankle"],
    cueText: "Front shin vertical. Back knee drives down.",
  },
  rdl: {
    label: "RDL",
    voiceId: "rdl",
    depthAngleThreshold: 70,
    topAngleThreshold: 150,
    joints: ["left_shoulder", "left_hip", "left_knee"],
    cueText: "Push your hips back. Feel the hamstrings load.",
  },
  pushup: {
    label: "Push-Up",
    voiceId: "pushup_slow",
    depthAngleThreshold: 90,
    topAngleThreshold: 160,
    joints: ["left_shoulder", "left_elbow", "left_wrist"],
    cueText: "Stay tight. Body moves as one unit.",
  },
  plank: {
    label: "Plank",
    voiceId: "plank",
    depthAngleThreshold: 0,   // not used for plank (time-based)
    topAngleThreshold: 0,
    joints: ["left_shoulder", "left_hip", "left_ankle"],
    cueText: "Hold strong. Squeeze everything.",
  },
};

// MoveNet skeleton connections for drawing
const SKELETON_CONNECTIONS: [string, string][] = [
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
];

// ─── Utility: Joint Angle ─────────────────────────────────────────────────────

function getAngle(
  a: poseDetection.Keypoint,
  b: poseDetection.Keypoint,
  c: poseDetection.Keypoint
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) -
    Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

// ─── Utility: Dysfunction Scoring ────────────────────────────────────────────

function scoreDysfunction(
  keypoints: poseDetection.Keypoint[]
): DysfunctionScore[] {
  const kp = (name: string) =>
    keypoints.find((k) => k.name === name);

  const leftShoulder = kp("left_shoulder");
  const rightShoulder = kp("right_shoulder");
  const leftEar = kp("left_ear");
  const rightEar = kp("right_ear");
  const leftHip = kp("left_hip");
  const rightHip = kp("right_hip");
  const leftKnee = kp("left_knee");
  const rightKnee = kp("right_knee");
  const leftAnkle = kp("left_ankle");
  const rightAnkle = kp("right_ankle");

  const scores: DysfunctionScore[] = [];

  // UCS — Upper Crossed Syndrome
  // Forward head: ear x significantly forward of shoulder x
  let ucsDetected = false;
  let ucsDetail = "No forward head posture detected";
  if (leftEar && leftShoulder && leftEar.score && leftEar.score > 0.4) {
    const headForward = leftEar.x - leftShoulder.x;
    if (headForward > 30) {
      ucsDetected = true;
      ucsDetail = `Forward head posture detected (${Math.round(headForward)}px offset)`;
    }
  }
  scores.push({
    flag: "UCS",
    label: "Upper Crossed Syndrome",
    detected: ucsDetected,
    detail: ucsDetail,
  });

  // LCS — Lower Crossed Syndrome
  // Anterior pelvic tilt: hip significantly lower than shoulder midpoint
  let lcsDetected = false;
  let lcsDetail = "No anterior pelvic tilt detected";
  if (leftShoulder && rightShoulder && leftHip && rightHip) {
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipMidY = (leftHip.y + rightHip.y) / 2;
    const hipForwardOffset =
      Math.abs(
        (leftHip.x + rightHip.x) / 2 - (leftShoulder.x + rightShoulder.x) / 2
      );
    if (hipForwardOffset > 40 && hipMidY > shoulderMidY + 100) {
      lcsDetected = true;
      lcsDetail = `Anterior pelvic tilt detected (${Math.round(hipForwardOffset)}px forward)`;
    }
  }
  scores.push({
    flag: "LCS",
    label: "Lower Crossed Syndrome",
    detected: lcsDetected,
    detail: lcsDetail,
  });

  // KNEE — Valgus collapse
  // Knee x significantly inside ankle x during squat
  let kneeDetected = false;
  let kneeDetail = "No knee valgus detected";
  if (leftKnee && leftAnkle && leftKnee.score && leftKnee.score > 0.4) {
    const valgus = leftAnkle.x - leftKnee.x;
    if (valgus > 25) {
      kneeDetected = true;
      kneeDetail = `Left knee valgus detected (${Math.round(valgus)}px inward collapse)`;
    }
  }
  if (!kneeDetected && rightKnee && rightAnkle && rightKnee.score && rightKnee.score > 0.4) {
    const valgus = rightKnee.x - rightAnkle.x;
    if (valgus > 25) {
      kneeDetected = true;
      kneeDetail = `Right knee valgus detected (${Math.round(valgus)}px inward collapse)`;
    }
  }
  scores.push({
    flag: "KNEE",
    label: "Knee Valgus",
    detected: kneeDetected,
    detail: kneeDetail,
  });

  // SHOULDER — Asymmetry / elevation
  // One shoulder significantly higher than the other
  let shoulderDetected = false;
  let shoulderDetail = "No shoulder asymmetry detected";
  if (leftShoulder && rightShoulder) {
    const asymmetry = Math.abs(leftShoulder.y - rightShoulder.y);
    if (asymmetry > 20) {
      shoulderDetected = true;
      const higher = leftShoulder.y < rightShoulder.y ? "Left" : "Right";
      shoulderDetail = `${higher} shoulder elevated (${Math.round(asymmetry)}px asymmetry)`;
    }
  }
  scores.push({
    flag: "SHOULDER",
    label: "Shoulder Asymmetry",
    detected: shoulderDetected,
    detail: shoulderDetail,
  });

  return scores;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BOA() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const rafRef = useRef<number | null>(null);
  const stageRef = useRef<"up" | "down">("up");
  const lastVoiceRef = useRef<number>(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exerciseMode, setExerciseMode] = useState<ExerciseMode>("squat");
  const [repCount, setRepCount] = useState(0);
  const [currentAngle, setCurrentAngle] = useState<number | null>(null);
  const [stage, setStage] = useState<"up" | "down">("up");
  const [dysfunctions, setDysfunctions] = useState<DysfunctionScore[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [plankSeconds, setPlankSeconds] = useState(0);
  const plankTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Init TF + MoveNet ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function initPose() {
      try {
        await tf.ready();
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          }
        );
        if (!cancelled) {
          detectorRef.current = detector;
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load pose detection model. Please refresh.");
          setIsLoading(false);
        }
      }
    }
    initPose();
    return () => { cancelled = true; };
  }, []);

  // ── Camera ─────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsRunning(true);
        setRepCount(0);
        stageRef.current = "up";
        setStage("up");
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (plankTimerRef.current) clearInterval(plankTimerRef.current);
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsRunning(false);
    setPlankSeconds(0);
  }, []);

  // ── Voice Cue ──────────────────────────────────────────────────────────────
  const playVoiceCue = useCallback(
    async (exerciseId: string) => {
      if (!voiceEnabled) return;
      const now = Date.now();
      if (now - lastVoiceRef.current < 3000) return; // debounce 3s
      lastVoiceRef.current = now;
      try {
        const res = await fetch("/api/voice/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exercise_id: exerciseId,
            difficulty: "normal",
          }),
        });
        const data = await res.json();
        if (data.audio_url) {
          const audio = new Audio(data.audio_url);
          audio.play().catch(() => {});
        }
      } catch {
        // Silent fail — voice is non-critical
      }
    },
    [voiceEnabled]
  );

  // ── Pose Detection Loop ────────────────────────────────────────────────────
  const detectPose = useCallback(
    async (video: HTMLVideoElement) => {
      if (!detectorRef.current || !canvasRef.current) return;
      const poses = await detectorRef.current.estimatePoses(video);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (poses.length === 0) return;

      const keypoints = poses[0].keypoints;
      const kpMap = new Map(keypoints.map((k) => [k.name!, k]));

      // Draw skeleton
      ctx.strokeStyle = "#ef4444"; // red
      ctx.lineWidth = 2;
      for (const [nameA, nameB] of SKELETON_CONNECTIONS) {
        const a = kpMap.get(nameA);
        const b = kpMap.get(nameB);
        if (a && b && (a.score ?? 0) > 0.3 && (b.score ?? 0) > 0.3) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Draw keypoints
      for (const kp of keypoints) {
        if ((kp.score ?? 0) > 0.3) {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = "#facc15"; // yellow
          ctx.fill();
        }
      }

      // Rep counting (non-plank)
      if (exerciseMode !== "plank") {
        const config = EXERCISE_CONFIGS[exerciseMode];
        const [nameA, nameB, nameC] = config.joints;
        const ptA = kpMap.get(nameA);
        const ptB = kpMap.get(nameB);
        const ptC = kpMap.get(nameC);

        if (
          ptA && ptB && ptC &&
          (ptA.score ?? 0) > 0.4 &&
          (ptB.score ?? 0) > 0.4 &&
          (ptC.score ?? 0) > 0.4
        ) {
          const angle = getAngle(ptA, ptB, ptC);
          setCurrentAngle(Math.round(angle));

          // Draw angle label at joint B
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 16px monospace";
          ctx.fillText(`${Math.round(angle)}°`, ptB.x + 10, ptB.y);

          // Stage detection
          if (angle < config.depthAngleThreshold && stageRef.current === "up") {
            stageRef.current = "down";
            setStage("down");
          }
          if (angle > config.topAngleThreshold && stageRef.current === "down") {
            stageRef.current = "up";
            setStage("up");
            setRepCount((prev) => {
              const newCount = prev + 1;
              // Voice cue on rep completion
              playVoiceCue(config.voiceId);
              return newCount;
            });
          }
        }
      }

      // Dysfunction scoring (every 30 frames would be ideal but we do it every frame for simplicity)
      const scores = scoreDysfunction(keypoints);
      setDysfunctions(scores);
    },
    [exerciseMode, playVoiceCue]
  );

  // ── rAF Loop ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning || !videoRef.current) return;

    const video = videoRef.current;

    async function runDetection() {
      if (video.readyState >= 2) {
        await detectPose(video);
      }
      rafRef.current = requestAnimationFrame(runDetection);
    }

    rafRef.current = requestAnimationFrame(runDetection);

    // Plank timer
    if (exerciseMode === "plank") {
      plankTimerRef.current = setInterval(() => {
        setPlankSeconds((s) => s + 1);
      }, 1000);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (plankTimerRef.current) clearInterval(plankTimerRef.current);
    };
  }, [isRunning, detectPose, exerciseMode]);

  // ── Reset on exercise change ───────────────────────────────────────────────
  useEffect(() => {
    setRepCount(0);
    setCurrentAngle(null);
    stageRef.current = "up";
    setStage("up");
    setPlankSeconds(0);
  }, [exerciseMode]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-red-900/40 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-widest text-red-400">
            BOA
          </h1>
          <p className="text-xs text-zinc-500 tracking-wider">
            BIOMECHANICAL OVERLAY ANALYSIS
          </p>
        </div>
        <button
          onClick={() => setVoiceEnabled((v) => !v)}
          className={`text-xs px-3 py-1 rounded border ${
            voiceEnabled
              ? "border-red-600 text-red-400"
              : "border-zinc-700 text-zinc-500"
          }`}
        >
          {voiceEnabled ? "🔈 VOICE ON" : "🔇 VOICE OFF"}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Exercise Selector */}
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(EXERCISE_CONFIGS) as ExerciseMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setExerciseMode(mode)}
              className={`px-3 py-1 text-xs rounded border tracking-wider transition-colors ${
                exerciseMode === mode
                  ? "bg-red-600 border-red-600 text-white"
                  : "border-zinc-700 text-zinc-400 hover:border-red-700"
              }`}
            >
              {EXERCISE_CONFIGS[mode].label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Camera + Canvas */}
        <div className="relative rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-zinc-400">Loading MoveNet...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80">
              <p className="text-red-400 text-sm text-center px-4">{error}</p>
            </div>
          )}
          <video
            ref={videoRef}
            className="w-full"
            style={{ transform: "scaleX(-1)" }} // mirror for selfie view
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ transform: "scaleX(-1)" }}
          />

          {/* Angle overlay */}
          {currentAngle !== null && exerciseMode !== "plank" && (
            <div className="absolute top-3 left-3 bg-black/70 px-2 py-1 rounded text-xs font-mono text-yellow-400">
              ANGLE: {currentAngle}°
            </div>
          )}

          {/* Plank timer overlay */}
          {exerciseMode === "plank" && isRunning && (
            <div className="absolute top-3 left-3 bg-black/70 px-2 py-1 rounded text-xs font-mono text-yellow-400">
              HOLD: {plankSeconds}s
            </div>
          )}

          {/* Stage badge */}
          {isRunning && exerciseMode !== "plank" && (
            <div
              className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold tracking-widest ${
                stage === "down"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {stage.toUpperCase()}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!isRunning ? (
            <button
              onClick={startCamera}
              disabled={isLoading || !!error}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-40 rounded text-sm font-bold tracking-widest transition-colors"
            >
              START SCAN
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded text-sm font-bold tracking-widest transition-colors"
            >
              STOP
            </button>
          )}
          <button
            onClick={() => {
              setRepCount(0);
              stageRef.current = "up";
              setStage("up");
              setPlankSeconds(0);
            }}
            className="px-4 py-3 border border-zinc-700 hover:border-zinc-500 rounded text-sm text-zinc-400 transition-colors"
          >
            RESET
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">
              {exerciseMode === "plank" ? `${plankSeconds}s` : repCount}
            </div>
            <div className="text-xs text-zinc-500 tracking-wider mt-1">
              {exerciseMode === "plank" ? "HOLD TIME" : "REPS"}
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {currentAngle !== null ? `${currentAngle}°` : "--"}
            </div>
            <div className="text-xs text-zinc-500 tracking-wider mt-1">ANGLE</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
            <div
              className={`text-2xl font-bold ${
                stage === "down" ? "text-red-400" : "text-green-400"
              }`}
            >
              {exerciseMode === "plank" ? "HOLD" : stage.toUpperCase()}
            </div>
            <div className="text-xs text-zinc-500 tracking-wider mt-1">STAGE</div>
          </div>
        </div>

        {/* Dysfunction Scores */}
        {dysfunctions.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-xs font-bold tracking-widest text-zinc-400 mb-3">
              DYSFUNCTION SCAN
            </h3>
            <div className="space-y-2">
              {dysfunctions.map((d) => (
                <div
                  key={d.flag}
                  className="flex items-start gap-3"
                >
                  <div
                    className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      d.detected ? "bg-red-500" : "bg-green-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          d.detected ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {d.flag}
                      </span>
                      <span className="text-xs text-zinc-500">{d.label}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{d.detail}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
                      d.detected
                        ? "bg-red-900/40 text-red-400"
                        : "bg-green-900/40 text-green-400"
                    }`}
                  >
                    {d.detected ? "DETECTED" : "CLEAR"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coaching Cue */}
        <div className="bg-zinc-900 border border-red-900/30 rounded-lg p-4">
          <p className="text-xs text-zinc-500 tracking-wider mb-1">
            PANTHER CUE — {EXERCISE_CONFIGS[exerciseMode].label.toUpperCase()}
          </p>
          <p className="text-sm text-red-300 font-medium leading-relaxed">
            {EXERCISE_CONFIGS[exerciseMode].cueText}
          </p>
        </div>

        {/* Instructions */}
        {!isRunning && (
          <div className="text-center text-xs text-zinc-600 pb-4">
            Position yourself so your full body is visible in frame.
            Stand 6–8 feet from the camera for best results.
          </div>
        )}
      </div>
    </div>
  );
}
