/**
 * TUF BOA SYSTEM — Biomechanical Overlay Architecture · Tier 1 · MediaPipe
 * Posture assessment tool: UCS + LCS syndrome detection, 6 joint angles, Panther coaching
 */
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ScanMode = "FULL BODY" | "UPPER" | "LOWER";
type SyndromeStatus = "SCANNING" | "OFFLINE" | "DETECTED" | "CLEAR";

interface JointAngles {
  neck: number;
  shoulder: number;
  hip: number;
  knee: number;
  spine: number;
  ankle: number;
}

interface SyndromeMarker {
  label: string;
  angle: number | null;
  detected: boolean;
}

interface SyndromeResult {
  name: string;
  status: SyndromeStatus;
  markers: SyndromeMarker[];
}

interface SessionEntry {
  time: string;
  mode: ScanMode;
  ucs: boolean;
  lcs: boolean;
  angles: JointAngles;
  snapshot?: string; // base64 data URL
}

// ─── NASM Continuum Steps ─────────────────────────────────────────────────────
const NASM_STEPS = [
  { num: "01", label: "INHIBIT", desc: "Release overactive muscles via foam rolling and sustained pressure", color: "#3B82F6" },
  { num: "02", label: "LENGTHEN", desc: "Stretch shortened tissues to restore range of motion", color: "#EAB308" },
  { num: "03", label: "ACTIVATE", desc: "Isolate and strengthen underactive muscles", color: "#EF4444" },
  { num: "04", label: "INTEGRATE", desc: "Full movement pattern with corrected mechanics", color: "#22C55E" },
];

// ─── Panther Coaching Messages ────────────────────────────────────────────────
function getPantherMessage(
  isActive: boolean,
  ucsDetected: boolean,
  lcsDetected: boolean,
  mode: ScanMode
): string {
  if (!isActive) {
    return "Activate the camera to begin your biomechanical assessment. Stand 4–6 feet from your device so your full body is visible. Panther will analyze your movement patterns and apply the NASM Corrective Exercise Continuum.";
  }
  if (ucsDetected && lcsDetected) {
    return "Both Upper and Lower Crossed Syndromes detected. This is a combined pattern — common in desk workers and sedentary adults. Your corrective sequence starts with Inhibit: foam roll upper traps, lats, and hip flexors before we lengthen and activate.";
  }
  if (ucsDetected) {
    return "Upper Crossed Syndrome pattern detected. Forward head, rounded shoulders, and thoracic kyphosis are present. Start with foam rolling the upper traps and pec minor, then lengthen the cervical extensors. Your deep neck flexors and lower traps need activation.";
  }
  if (lcsDetected) {
    return "Lower Crossed Syndrome pattern detected. Anterior pelvic tilt with hip flexor tightness and lumbar extension compensation. Inhibit the hip flexors and erectors first, then activate your glutes and deep core. This is the most common pattern in the 40+ population.";
  }
  if (mode === "UPPER") {
    return "Scanning upper body posture. Keep your arms relaxed at your sides, chin level, and stand tall. I'm measuring neck angle, shoulder position, and thoracic spine curvature.";
  }
  if (mode === "LOWER") {
    return "Scanning lower body mechanics. Stand with feet hip-width apart, weight evenly distributed. I'm measuring hip alignment, knee tracking, and ankle position.";
  }
  return "Full body scan active. Stand 4–6 feet from the camera with your full body visible. Remain still for an accurate baseline reading. I'm analyzing all major compensation patterns simultaneously.";
}

// ─── ElevenLabs Voice ─────────────────────────────────────────────────────────
async function speakCue(text: string) {
  try {
    const res = await fetch("/api/voice/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 400) }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play().catch(() => {});
    audio.onended = () => URL.revokeObjectURL(url);
  } catch { /* silent fallback */ }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BiomechanicalOverlay() {
  const [scanMode, setScanMode] = useState<ScanMode>("FULL BODY");
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sessionLog, setSessionLog] = useState<SessionEntry[]>([]);

  // Joint angles
  const [angles, setAngles] = useState<JointAngles>({ neck: 0, shoulder: 0, hip: 0, knee: 0, spine: 0, ankle: 0 });

  // Syndrome state
  const [syndromes, setSyndromes] = useState<SyndromeResult[]>([
    {
      name: "UPPER CROSSED SYNDROME",
      status: "OFFLINE",
      markers: [
        { label: "FORWARD HEAD", angle: null, detected: false },
        { label: "SHOULDER ROUND", angle: null, detected: false },
        { label: "THORACIC KYPHOSIS", angle: null, detected: false },
      ],
    },
    {
      name: "LOWER CROSSED SYNDROME",
      status: "OFFLINE",
      markers: [
        { label: "ANTERIOR PELVIC TILT", angle: null, detected: false },
        { label: "HIP FLEXOR TIGHTNESS", angle: null, detected: false },
        { label: "LUMBAR EXTENSION", angle: null, detected: false },
      ],
    },
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const poseRef = useRef<any>(null);
  const lastVoiceRef = useRef<number>(0);
  const lastVoiceTextRef = useRef<string>("");

  const ucsDetected = syndromes[0].markers.some((m) => m.detected);
  const lcsDetected = syndromes[1].markers.some((m) => m.detected);

  // ── Angle Math ──────────────────────────────────────────────────────────────
  function calcAngle(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180) / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
  }

  function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  // ── Pose Analysis ───────────────────────────────────────────────────────────
  const analyzePose = useCallback((landmarks: any[]) => {
    if (!landmarks || landmarks.length < 33) return;

    const lm = landmarks;
    // MediaPipe landmark indices
    const nose = lm[0], leftEar = lm[7], rightEar = lm[8];
    const leftShoulder = lm[11], rightShoulder = lm[12];
    const leftHip = lm[23], rightHip = lm[24];
    const leftKnee = lm[25], rightKnee = lm[26];
    const leftAnkle = lm[27], rightAnkle = lm[28];
    const leftElbow = lm[13], rightElbow = lm[14];

    // ── Joint Angles ──────────────────────────────────────────────────────────
    const midShoulder = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
    const midHip = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
    const midKnee = { x: (leftKnee.x + rightKnee.x) / 2, y: (leftKnee.y + rightKnee.y) / 2 };
    const midAnkle = { x: (leftAnkle.x + rightAnkle.x) / 2, y: (leftAnkle.y + rightAnkle.y) / 2 };

    // Neck angle: ear → shoulder → hip
    const neckAngle = calcAngle(rightEar, rightShoulder, rightHip);
    // Shoulder angle: elbow → shoulder → hip
    const shoulderAngle = calcAngle(rightElbow, rightShoulder, rightHip);
    // Hip angle: shoulder → hip → knee
    const hipAngle = calcAngle(midShoulder, midHip, midKnee);
    // Knee angle: hip → knee → ankle
    const kneeAngle = calcAngle(midHip, midKnee, midAnkle);
    // Spine: vertical deviation — nose vs midHip horizontal offset
    const spineDeviation = Math.abs(nose.x - midHip.x) * 100;
    // Ankle: knee → ankle → ground (approx)
    const ankleAngle = calcAngle(midKnee, midAnkle, { x: midAnkle.x, y: midAnkle.y + 0.1 });

    const newAngles: JointAngles = {
      neck: Math.round(neckAngle),
      shoulder: Math.round(shoulderAngle),
      hip: Math.round(hipAngle),
      knee: Math.round(kneeAngle),
      spine: Math.round(spineDeviation),
      ankle: Math.round(ankleAngle),
    };
    setAngles(newAngles);

    // ── UCS Detection ─────────────────────────────────────────────────────────
    // Forward Head: neck angle < 145° (head forward of shoulders)
    const forwardHead = neckAngle < 145;
    // Shoulder Round: shoulder angle < 160° (shoulders rolled forward)
    const shoulderRound = shoulderAngle < 160;
    // Thoracic Kyphosis: spine deviation > 8 (excessive forward curve)
    const thoracicKyphosis = spineDeviation > 8;

    // ── LCS Detection ─────────────────────────────────────────────────────────
    // Anterior Pelvic Tilt: hip angle < 165° (pelvis tilted forward)
    const anteriorPelvicTilt = hipAngle < 165;
    // Hip Flexor Tightness: hip angle < 160° (tight hip flexors pulling pelvis)
    const hipFlexorTightness = hipAngle < 160;
    // Lumbar Extension: combined hip + knee pattern
    const lumbarExtension = anteriorPelvicTilt && kneeAngle > 175;

    const ucsActive = scanMode === "FULL BODY" || scanMode === "UPPER";
    const lcsActive = scanMode === "FULL BODY" || scanMode === "LOWER";

    setSyndromes([
      {
        name: "UPPER CROSSED SYNDROME",
        status: ucsActive ? (forwardHead || shoulderRound || thoracicKyphosis ? "DETECTED" : "CLEAR") : "OFFLINE",
        markers: [
          { label: "FORWARD HEAD", angle: Math.round(neckAngle), detected: forwardHead && ucsActive },
          { label: "SHOULDER ROUND", angle: Math.round(shoulderAngle), detected: shoulderRound && ucsActive },
          { label: "THORACIC KYPHOSIS", angle: Math.round(spineDeviation), detected: thoracicKyphosis && ucsActive },
        ],
      },
      {
        name: "LOWER CROSSED SYNDROME",
        status: lcsActive ? (anteriorPelvicTilt || hipFlexorTightness || lumbarExtension ? "DETECTED" : "CLEAR") : "OFFLINE",
        markers: [
          { label: "ANTERIOR PELVIC TILT", angle: Math.round(hipAngle), detected: anteriorPelvicTilt && lcsActive },
          { label: "HIP FLEXOR TIGHTNESS", angle: Math.round(hipAngle), detected: hipFlexorTightness && lcsActive },
          { label: "LUMBAR EXTENSION", angle: Math.round(kneeAngle), detected: lumbarExtension && lcsActive },
        ],
      },
    ]);

    // ── Voice Feedback (throttled 8s) ─────────────────────────────────────────
    const now = Date.now();
    if (voiceEnabled && now - lastVoiceRef.current > 8000) {
      const msg = getPantherMessage(true, forwardHead || shoulderRound || thoracicKyphosis, anteriorPelvicTilt || hipFlexorTightness, scanMode);
      if (msg !== lastVoiceTextRef.current) {
        lastVoiceRef.current = now;
        lastVoiceTextRef.current = msg;
        speakCue(msg);
      }
    }
  }, [scanMode, voiceEnabled]);

  // ── Draw Skeleton on Canvas ─────────────────────────────────────────────────
  const drawSkeleton = useCallback((landmarks: any[], canvas: HTMLCanvasElement, video: HTMLVideoElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Mirror the video
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (!landmarks || landmarks.length < 33) return;

    const w = canvas.width;
    const h = canvas.height;

    // Connections to draw
    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24],
      [23, 25], [25, 27], [24, 26], [26, 28],
      [27, 29], [28, 30], [29, 31], [30, 32],
      [0, 7], [0, 8], [7, 11], [8, 12],
    ];

    // Draw connections
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-w, 0);
    connections.forEach(([a, b]) => {
      const lmA = landmarks[a];
      const lmB = landmarks[b];
      if (!lmA || !lmB || lmA.visibility < 0.3 || lmB.visibility < 0.3) return;
      ctx.beginPath();
      ctx.moveTo(lmA.x * w, lmA.y * h);
      ctx.lineTo(lmB.x * w, lmB.y * h);
      ctx.strokeStyle = "rgba(255, 69, 0, 0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw joints
    landmarks.forEach((lm) => {
      if (!lm || lm.visibility < 0.3) return;
      ctx.beginPath();
      ctx.arc(lm.x * w, lm.y * h, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#FF4500";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    ctx.restore();
  }, []);

  // ── Start Camera + MediaPipe ────────────────────────────────────────────────
  const handleActivate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Load MediaPipe Pose via CDN (avoids bundler issues)
      if (!(window as any).Pose) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js";
          script.crossOrigin = "anonymous";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load MediaPipe"));
          document.head.appendChild(script);
        });
      }
      const PoseClass = (window as any).Pose;
      const pose = new PoseClass({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults((results: any) => {
        if (results.poseLandmarks) {
          analyzePose(results.poseLandmarks);
          if (videoRef.current && canvasRef.current) {
            drawSkeleton(results.poseLandmarks, canvasRef.current, videoRef.current);
          }
        }
      });

      poseRef.current = pose;
      setIsActive(true);
      setIsLoading(false);

      // Update syndromes to SCANNING
      setSyndromes((prev) =>
        prev.map((s) => ({ ...s, status: "SCANNING" as SyndromeStatus }))
      );

      // Run pose detection loop
      const runLoop = async () => {
        if (videoRef.current && videoRef.current.readyState >= 2 && poseRef.current) {
          await poseRef.current.send({ image: videoRef.current });
        }
        animFrameRef.current = requestAnimationFrame(runLoop);
      };
      runLoop();

      if (voiceEnabled) {
        setTimeout(() => speakCue("BOA system activated. Stand 4 to 6 feet from the camera. I'm scanning your posture now."), 500);
      }
    } catch (err: any) {
      setIsLoading(false);
      if (err.name === "NotAllowedError") {
        setError("Camera access denied. Please allow camera access in your browser settings.");
      } else {
        setError("Could not start camera. Please check your device and try again.");
      }
    }
  }, [analyzePose, drawSkeleton, voiceEnabled]);

  // ── Stop ────────────────────────────────────────────────────────────────────
  const handleStop = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (poseRef.current) {
      poseRef.current.close?.();
      poseRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    // Log session
    const entry: SessionEntry = {
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mode: scanMode,
      ucs: ucsDetected,
      lcs: lcsDetected,
      angles: { ...angles },
    };
    setSessionLog((prev) => [entry, ...prev.slice(0, 9)]);

    setIsActive(false);
    setSyndromes((prev) => prev.map((s) => ({
      ...s,
      status: "OFFLINE" as SyndromeStatus,
      markers: s.markers.map((m) => ({ ...m, angle: null, detected: false })),
    })));
    setAngles({ neck: 0, shoulder: 0, hip: 0, knee: 0, spine: 0, ankle: 0 });
  }, [scanMode, ucsDetected, lcsDetected, angles]);

  // ── Snapshot ────────────────────────────────────────────────────────────────
  const handleSnapshot = useCallback(() => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `boa-snapshot-${Date.now()}.png`;
    link.click();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const pantherMessage = getPantherMessage(isActive, ucsDetected, lcsDetected, scanMode);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-24 pt-14" style={{ background: "#0A0A0A", color: "#E5E5E5" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🦴</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black uppercase tracking-widest text-white">TUF</span>
                <span className="text-sm font-black uppercase tracking-widest" style={{ color: "#DC2626" }}>BOA SYSTEM</span>
              </div>
              <p className="text-[9px] uppercase tracking-widest" style={{ color: "#555" }}>
                BIOMECHANICAL OVERLAY ARCHITECTURE · TIER 1 · MEDIAPIPE
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled((v) => !v)}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="text-sm">{voiceEnabled ? "🔊" : "🔇"}</span>
          </button>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-red-500 animate-pulse" : "bg-gray-600"}`} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: isActive ? "#EF4444" : "#555" }}>
              {isActive ? "LIVE" : "CAMERA OFF"}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* ── Camera Viewport ─────────────────────────────────────────────── */}
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            background: "#111",
            border: "1px solid rgba(255,255,255,0.08)",
            aspectRatio: "4/3",
          }}
        >
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-0" playsInline muted />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Idle state */}
          {!isActive && !isLoading && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <span className="text-6xl opacity-20">🦴</span>
              <div className="text-center">
                <p className="text-sm font-black uppercase tracking-widest text-white opacity-40">BIOMECHANICAL</p>
                <p className="text-sm font-black uppercase tracking-widest text-white opacity-40">OVERLAY SYSTEM</p>
              </div>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "#444" }}>
                PRESS ACTIVATE TO BEGIN SCANNING
              </p>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#DC2626", borderTopColor: "transparent" }} />
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "#888" }}>INITIALIZING MEDIAPIPE...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-6">
              <span className="text-3xl">📷</span>
              <p className="text-xs text-center" style={{ color: "#EF4444" }}>{error}</p>
            </div>
          )}
        </div>

        {/* ── Control Bar ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Activate / Stop */}
          {!isActive ? (
            <button
              onClick={handleActivate}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #DC2626, #991B1B)" }}
            >
              {isLoading ? "LOADING..." : "ACTIVATE BOA"}
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex-1 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all active:scale-95"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#aaa" }}
            >
              STOP
            </button>
          )}

          {/* Snapshot */}
          <button
            onClick={handleSnapshot}
            disabled={!isActive}
            className="px-4 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#aaa" }}
          >
            SNAPSHOT
          </button>

          {/* Scan mode tabs */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            {(["FULL BODY", "UPPER", "LOWER"] as ScanMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setScanMode(mode)}
                className="px-2.5 py-2 text-[9px] font-black uppercase tracking-widest transition-all"
                style={{
                  background: scanMode === mode ? "rgba(220,38,38,0.25)" : "rgba(255,255,255,0.02)",
                  color: scanMode === mode ? "#EF4444" : "#555",
                  borderRight: mode !== "LOWER" ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}
              >
                {mode === "FULL BODY" ? "FULL" : mode}
              </button>
            ))}
          </div>
        </div>

        {/* ── Pattern Detection ────────────────────────────────────────────── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-xs font-black uppercase tracking-widest text-white">
              PATTERN <span style={{ color: "#DC2626" }}>DETECTION</span>
            </span>
            <span
              className="text-[9px] font-black uppercase tracking-widest"
              style={{ color: isActive ? "#EAB308" : "#444" }}
            >
              {isActive ? "SCANNING" : "OFFLINE"}
            </span>
          </div>

          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {syndromes.map((syndrome) => {
              const isRelevant =
                syndrome.name.includes("UPPER") ? scanMode !== "LOWER" : scanMode !== "UPPER";
              return (
                <div key={syndrome.name} className="px-4 py-3" style={{ background: "rgba(255,255,255,0.01)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#888" }}>
                      {syndrome.name}
                    </span>
                    <span
                      className="text-[9px] font-black uppercase tracking-widest"
                      style={{
                        color: !isRelevant || syndrome.status === "OFFLINE" ? "#333"
                          : syndrome.status === "DETECTED" ? "#EF4444"
                          : syndrome.status === "CLEAR" ? "#22C55E"
                          : "#EAB308",
                      }}
                    >
                      {!isRelevant ? "N/A" : syndrome.status}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {syndrome.markers.map((marker) => (
                      <div key={marker.label} className="flex items-center justify-between">
                        <span
                          className="text-[10px] uppercase tracking-wider"
                          style={{ color: marker.detected ? "#EF4444" : "#444" }}
                        >
                          {marker.label}
                        </span>
                        <span
                          className="text-[10px] font-black tabular-nums"
                          style={{ color: marker.detected ? "#EF4444" : "#333" }}
                        >
                          {marker.angle !== null ? `${marker.angle}°` : "—°"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Live Joint Angles ────────────────────────────────────────────── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div
            className="px-4 py-2.5"
            style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#EAB308" }}>
              LIVE JOINT ANGLES
            </span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {[
              { label: "NECK", value: angles.neck },
              { label: "SHOULDER", value: angles.shoulder },
              { label: "HIP", value: angles.hip },
              { label: "KNEE", value: angles.knee },
              { label: "SPINE", value: angles.spine },
              { label: "ANKLE", value: angles.ankle },
            ].map((joint) => (
              <div
                key={joint.label}
                className="flex flex-col items-center justify-center py-4"
                style={{ background: "rgba(255,255,255,0.01)" }}
              >
                <span
                  className="text-2xl font-black tabular-nums leading-none"
                  style={{ color: isActive && joint.value > 0 ? "#E5E5E5" : "#333" }}
                >
                  {isActive && joint.value > 0 ? `${joint.value}°` : "—°"}
                </span>
                <span className="text-[9px] uppercase tracking-widest mt-1" style={{ color: "#444" }}>
                  {joint.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Panther BOA Coaching ─────────────────────────────────────────── */}
        <div
          className="rounded-xl p-4"
          style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🐆</span>
            <div>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#DC2626" }}>PANTHER</p>
              <p className="text-[9px] uppercase tracking-widest" style={{ color: "#444" }}>BOA CORRECTIVE COACHING</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#999" }}>
            {pantherMessage}
          </p>
        </div>

        {/* ── NASM Corrective Continuum ────────────────────────────────────── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div
            className="px-4 py-2.5"
            style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#666" }}>
              NASM CORRECTIVE CONTINUUM
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {NASM_STEPS.map((step) => (
              <div
                key={step.num}
                className="flex items-center gap-3 px-4 py-3"
                style={{ background: "rgba(255,255,255,0.01)" }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: step.color }}
                />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">
                    {step.num} · {step.label}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#555" }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Session Log ──────────────────────────────────────────────────── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#666" }}>
              SESSION LOG
            </span>
            {sessionLog.length > 0 && (
              <button
                onClick={() => setSessionLog([])}
                className="text-[9px] font-black uppercase tracking-widest"
                style={{ color: "#444" }}
              >
                CLEAR
              </button>
            )}
          </div>
          <div className="px-4 py-3">
            {sessionLog.length === 0 ? (
              <p className="text-xs" style={{ color: "#333" }}>No sessions recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {sessionLog.map((entry, i) => (
                  <div key={i} className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[9px] tabular-nums" style={{ color: "#555" }}>{entry.time}</span>
                      <span className="text-[9px] ml-2 uppercase" style={{ color: "#444" }}>{entry.mode}</span>
                    </div>
                    <div className="flex gap-1.5">
                      {entry.ucs && (
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>UCS</span>
                      )}
                      {entry.lcs && (
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(234,179,8,0.15)", color: "#EAB308" }}>LCS</span>
                      )}
                      {!entry.ucs && !entry.lcs && (
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>CLEAR</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
