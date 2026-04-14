/**
 * TUF BOA SYSTEM v4.0 — Biomechanical Overlay Architecture
 * 5 exercise modes · AI vision analysis · Movement scoring · NASM corrective link-out
 * MediaPipe Pose · ElevenLabs voice · Panther coaching
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { PantherPresence, PantherMessage, V4Card, SceneHeader } from "@/components/v4Components";
import { ISSUES, PHASE_COLORS } from "@/data/v4constants";

// ─── Types ────────────────────────────────────────────────────────────────────
type ScanMode = "POSTURE" | "SQUAT" | "HINGE" | "PUSH" | "LUNGE";
type SyndromeStatus = "SCANNING" | "OFFLINE" | "DETECTED" | "CLEAR";

interface JointAngles {
  neck: number;
  shoulder: number;
  hip: number;
  knee: number;
  spine: number;
  ankle: number;
}

interface MovementFault {
  label: string;
  detected: boolean;
  corrective: string; // maps to ISSUES id
  cue: string;
}

interface MovementAnalysis {
  mode: ScanMode;
  score: number; // 0-100
  faults: MovementFault[];
  status: SyndromeStatus;
}

interface SessionEntry {
  time: string;
  mode: ScanMode;
  score: number;
  faults: string[];
  snapshot?: string;
}

// ─── Exercise Mode Definitions ────────────────────────────────────────────────
interface ExerciseMode {
  id: ScanMode;
  icon: string;
  label: string;
  color: string;
  description: string;
  standingCue: string;
  faultDefinitions: Array<{
    label: string;
    corrective: string;
    cue: string;
    check: (a: JointAngles) => boolean;
  }>;
  aiPrompt: string;
}

const EXERCISE_MODES: ExerciseMode[] = [
  {
    id: "POSTURE",
    icon: "🧍",
    label: "POSTURE",
    color: "#4a9eff",
    description: "Static postural assessment — UCS + LCS detection",
    standingCue: "Stand 4–6 ft from camera. Full body visible. Arms relaxed.",
    faultDefinitions: [
      {
        label: "FORWARD HEAD",
        corrective: "neck",
        cue: "Chin tuck. Ears over shoulders. 10 reps every hour.",
        check: (a) => a.neck < 145,
      },
      {
        label: "ROUNDED SHOULDERS",
        corrective: "front_shoulder",
        cue: "Scapulae DOWN and BACK. Own the position before you load it.",
        check: (a) => a.shoulder < 160,
      },
      {
        label: "ANTERIOR PELVIC TILT",
        corrective: "lower_back",
        cue: "Posterior pelvic tilt. Brace core. Glutes ON.",
        check: (a) => a.hip < 160,
      },
      {
        label: "KNEE HYPEREXTENSION",
        corrective: "anterior_knee",
        cue: "Soft knee. Micro-bend. Stack the joint.",
        check: (a) => a.knee > 185,
      },
    ],
    aiPrompt: `You are PANTHER — TUF's AI coaching engine. Analyze this standing posture image for compensation patterns.

ASSESS THESE SPECIFIC MARKERS:
1. HEAD POSITION: Is the ear in line with the shoulder? Forward head = Upper Crossed Syndrome marker
2. SHOULDER POSITION: Are shoulders rolled forward? Rounded = pec minor tightness
3. THORACIC SPINE: Is there excessive kyphosis (rounding of upper back)?
4. LUMBAR SPINE: Is there anterior pelvic tilt (excessive arch)? = Lower Crossed Syndrome
5. KNEE ALIGNMENT: Are knees hyperextended or in valgus?

RESPONSE FORMAT:
VERDICT: [ALL CAPS — what you see in 5-8 words]
PATTERNS: [UCS detected: yes/no] [LCS detected: yes/no]
FAULTS: [list each fault on its own line with → corrective]
DIRECTIVE: [one action starting with a verb]`,
  },
  {
    id: "SQUAT",
    icon: "🏋️",
    label: "SQUAT",
    color: "#FF6600",
    description: "Squat pattern — depth, knee tracking, spine neutrality",
    standingCue: "Stand 6 ft from camera. Side view preferred. Feet hip-width.",
    faultDefinitions: [
      {
        label: "KNEE VALGUS",
        corrective: "anterior_knee",
        cue: "Drive knees OUT over toes. Feel your glutes. If you don't — stop.",
        check: (a) => a.knee < 155,
      },
      {
        label: "BUTT WINK",
        corrective: "lower_back",
        cue: "Brace core before descent. Posterior pelvic tilt at bottom = lumbar flexion under load.",
        check: (a) => a.hip < 70,
      },
      {
        label: "FORWARD LEAN",
        corrective: "upper_back",
        cue: "Chest tall. Thoracic extension. Elbows down and back.",
        check: (a) => a.spine > 15,
      },
      {
        label: "HEEL RISE",
        corrective: "ankle_foot",
        cue: "Ankle dorsiflexion is your limiting factor. Elevate heels or fix the ankle.",
        check: (a) => a.ankle < 60,
      },
    ],
    aiPrompt: `You are PANTHER — TUF's AI coaching engine. Analyze this squat image for movement faults.

SQUAT STANDARDS (NASM OPT Model):
- Feet: hip-width, toes slightly out (0-30°)
- Knees: track over 2nd-3rd toe, NO valgus collapse
- Hip crease: at or below parallel for full squat
- Spine: neutral — no excessive forward lean or lumbar flexion
- Heels: flat on floor throughout
- Chest: tall, thoracic spine extended

ASSESS THESE SPECIFIC FAULTS:
1. KNEE VALGUS: Do knees cave inward? = weak glutes/VMO, tight TFL
2. BUTT WINK: Does lumbar spine flex at bottom? = limited hip mobility or ankle restriction
3. EXCESSIVE FORWARD LEAN: Is torso angle > 45° from vertical? = tight hip flexors or weak thoracic extensors
4. HEEL RISE: Do heels lift? = limited ankle dorsiflexion
5. ASYMMETRY: Is one side compensating more than the other?

RESPONSE FORMAT:
VERDICT: [what you see — ALL CAPS, 5-8 words]
SCORE: [0-100 movement quality score]
FAULTS: [each fault on its own line]
CORRECTIVE: [primary corrective exercise needed]
DIRECTIVE: [one action starting with a verb]`,
  },
  {
    id: "HINGE",
    icon: "🔄",
    label: "HINGE",
    color: "#C8973A",
    description: "Hip hinge — RDL, deadlift, KB swing pattern",
    standingCue: "Stand 6 ft from camera. Side view. Feet hip-width.",
    faultDefinitions: [
      {
        label: "LUMBAR FLEXION",
        corrective: "lower_back",
        cue: "HINGE at the hip — not the spine. Neutral lumbar. Brace before you move.",
        check: (a) => a.spine > 20,
      },
      {
        label: "KNEE DOMINANT",
        corrective: "anterior_hip",
        cue: "Push the floor away — don't sit into it. This is a HINGE, not a squat.",
        check: (a) => a.knee < 130,
      },
      {
        label: "FORWARD HEAD",
        corrective: "neck",
        cue: "Neutral cervical spine. Eyes 10 feet ahead. Pack the neck.",
        check: (a) => a.neck < 140,
      },
      {
        label: "ROUNDED UPPER BACK",
        corrective: "upper_back",
        cue: "Retract scapulae. Thoracic extension. Lats engaged before the pull.",
        check: (a) => a.shoulder < 150,
      },
    ],
    aiPrompt: `You are PANTHER — TUF's AI coaching engine. Analyze this hip hinge movement image.

HIP HINGE STANDARDS (RDL/Deadlift):
- Spine: NEUTRAL throughout — no lumbar flexion, no excessive extension
- Hip: primary mover — hinge back, not down
- Knee: soft bend only (15-20°) — this is NOT a squat
- Bar/load path: close to body, vertical
- Scapulae: retracted and depressed — lats engaged
- Head: neutral — eyes 10 feet ahead, not up or down

ASSESS THESE SPECIFIC FAULTS:
1. LUMBAR FLEXION: Is the lower back rounding? = core not braced, hamstrings too tight
2. KNEE DOMINANT: Are knees bending excessively (squat pattern)? = not hinging at hip
3. FORWARD HEAD: Is neck flexing or extending excessively?
4. UPPER BACK ROUNDING: Are scapulae not retracted? = lat weakness
5. HIP SHIFT: Is there lateral shift? = asymmetry, hip mobility restriction

RESPONSE FORMAT:
VERDICT: [what you see — ALL CAPS, 5-8 words]
SCORE: [0-100 movement quality score]
FAULTS: [each fault on its own line]
CORRECTIVE: [primary corrective exercise needed]
DIRECTIVE: [one action starting with a verb]`,
  },
  {
    id: "PUSH",
    icon: "💪",
    label: "PUSH",
    color: "#22c55e",
    description: "Push pattern — press, push-up, overhead",
    standingCue: "Side view for overhead press. Front view for push-up.",
    faultDefinitions: [
      {
        label: "SHOULDER IMPINGEMENT",
        corrective: "front_shoulder",
        cue: "Scapula must upwardly rotate. Pack the shoulder BEFORE pressing. No internal rotation.",
        check: (a) => a.shoulder > 170 && a.neck < 150,
      },
      {
        label: "ELBOW FLARE",
        corrective: "front_shoulder",
        cue: "45° elbow angle. Not 90°. Protect the rotator cuff.",
        check: (a) => a.shoulder < 130,
      },
      {
        label: "LUMBAR EXTENSION",
        corrective: "lower_back",
        cue: "Rib cage DOWN. Core braced. No arch. Glutes ON.",
        check: (a) => a.hip > 195,
      },
      {
        label: "FORWARD HEAD",
        corrective: "neck",
        cue: "Chin tuck. Head doesn't lead the press. Bar clears the face — head moves THROUGH.",
        check: (a) => a.neck < 140,
      },
    ],
    aiPrompt: `You are PANTHER — TUF's AI coaching engine. Analyze this pushing movement image.

PUSH PATTERN STANDARDS:
Overhead Press:
- Scapular upward rotation throughout the press
- Bar path: vertical, close to face
- Elbows: 45° from torso at bottom, fully extended at top
- Core: braced, ribs down — no lumbar extension
- Head: neutral, moves through at lockout

Push-Up:
- Straight line from head to heel
- Elbows: 45° angle from torso (not 90°)
- Scapulae: full protraction at top (serratus anterior)
- No winging of scapulae
- No sagging hips

ASSESS THESE SPECIFIC FAULTS:
1. SHOULDER IMPINGEMENT POSITION: Is shoulder internally rotated at top?
2. ELBOW FLARE: Are elbows > 60° from torso?
3. LUMBAR EXTENSION: Is lower back arching excessively?
4. SCAPULAR WINGING: Are scapulae not retracting/protracting properly?
5. FORWARD HEAD: Is head jutting forward?

RESPONSE FORMAT:
VERDICT: [what you see — ALL CAPS, 5-8 words]
SCORE: [0-100 movement quality score]
FAULTS: [each fault on its own line]
CORRECTIVE: [primary corrective exercise needed]
DIRECTIVE: [one action starting with a verb]`,
  },
  {
    id: "LUNGE",
    icon: "🦵",
    label: "LUNGE",
    color: "#7c3aed",
    description: "Lunge pattern — split squat, step-up, single leg",
    standingCue: "Front or side view. Full body visible. Step forward.",
    faultDefinitions: [
      {
        label: "KNEE VALGUS",
        corrective: "anterior_knee",
        cue: "Front knee tracks over 2nd toe. Drive it OUT. Glute medius must fire.",
        check: (a) => a.knee < 150,
      },
      {
        label: "TRUNK LEAN",
        corrective: "anterior_hip",
        cue: "Torso upright. Hip flexor on back leg is tight — that's why you're leaning.",
        check: (a) => a.spine > 18,
      },
      {
        label: "HEEL RISE",
        corrective: "ankle_foot",
        cue: "Front heel stays DOWN. Ankle dorsiflexion is the limiter.",
        check: (a) => a.ankle < 65,
      },
      {
        label: "HIP DROP",
        corrective: "deep_glute",
        cue: "Level pelvis. Glute medius on stance leg must hold. Don't let the hip drop.",
        check: (a) => a.hip < 155,
      },
    ],
    aiPrompt: `You are PANTHER — TUF's AI coaching engine. Analyze this lunge/split squat image.

LUNGE STANDARDS (NASM):
- Front shin: vertical or slight forward lean (not past 45°)
- Front knee: tracks over 2nd-3rd toe — NO valgus
- Rear knee: approaches floor without touching
- Trunk: upright — minimal forward lean
- Pelvis: level — no hip drop (Trendelenburg)
- Front heel: flat on floor throughout

ASSESS THESE SPECIFIC FAULTS:
1. KNEE VALGUS: Does front knee cave inward? = weak glute medius/VMO
2. TRUNK LEAN: Is torso leaning forward excessively? = tight hip flexors
3. HEEL RISE: Does front heel lift? = ankle dorsiflexion restriction
4. HIP DROP: Does opposite hip drop? = weak glute medius on stance side
5. KNEE PAST TOE: Does front knee excessively pass the toe? = ankle restriction

RESPONSE FORMAT:
VERDICT: [what you see — ALL CAPS, 5-8 words]
SCORE: [0-100 movement quality score]
FAULTS: [each fault on its own line]
CORRECTIVE: [primary corrective exercise needed]
DIRECTIVE: [one action starting with a verb]`,
  },
];

// ─── NASM Continuum Steps ─────────────────────────────────────────────────────
const NASM_STEPS = [
  { num: "01", label: "INHIBIT",   desc: "Foam roll overactive muscles — release before you load", color: PHASE_COLORS.INHIBIT },
  { num: "02", label: "LENGTHEN",  desc: "Static stretch shortened tissues — restore ROM",          color: PHASE_COLORS.LENGTHEN },
  { num: "03", label: "ACTIVATE",  desc: "Isolate and fire underactive muscles — wake them up",     color: PHASE_COLORS.ACTIVATE },
  { num: "04", label: "INTEGRATE", desc: "Full movement pattern with corrected mechanics",           color: PHASE_COLORS.INTEGRATE },
];

// ─── Voice ────────────────────────────────────────────────────────────────────
async function speakCue(text: string) {
  try {
    const res = await fetch("/api/voice/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 200) }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play().catch(() => {});
    audio.onended = () => URL.revokeObjectURL(url);
  } catch { /* silent */ }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BiomechanicalOverlay() {
  const [, navigate] = useLocation();
  const [scanMode, setScanMode] = useState<ScanMode>("POSTURE");
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [sessionLog, setSessionLog] = useState<SessionEntry[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [movementScore, setMovementScore] = useState<number | null>(null);

  // Joint angles from MediaPipe
  const [angles, setAngles] = useState<JointAngles>({ neck: 0, shoulder: 0, hip: 0, knee: 0, spine: 0, ankle: 0 });

  // Movement analysis per mode
  const [analysis, setAnalysis] = useState<MovementAnalysis>({
    mode: "POSTURE",
    score: 0,
    faults: [],
    status: "OFFLINE",
  });

  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const poseRef = useRef<any>(null);
  const lastVoiceRef = useRef<number>(0);
  const lastVoiceTextRef = useRef<string>("");

  // ── Rep Counter ─────────────────────────────────────────────────────────────
  const [repCount, setRepCount] = useState(0);
  const [repStage, setRepStage] = useState<"up" | "down">("up");
  const repStageRef = useRef<"up" | "down">("up");
  const lastRepVoiceRef = useRef<number>(0);

  const currentMode = EXERCISE_MODES.find(m => m.id === scanMode)!;

  // ── Angle Math ──────────────────────────────────────────────────────────────
  function calcAngle(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180) / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
  }

  // ── Pose Analysis ───────────────────────────────────────────────────────────
  const analyzePose = useCallback((landmarks: any[]) => {
    if (!landmarks || landmarks.length < 33) return;
    const lm = landmarks;
    const nose = lm[0], rightEar = lm[8];
    const leftShoulder = lm[11], rightShoulder = lm[12];
    const leftHip = lm[23], rightHip = lm[24];
    const leftKnee = lm[25], rightKnee = lm[26];
    const leftAnkle = lm[27], rightAnkle = lm[28];
    const rightElbow = lm[14];

    const midShoulder = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
    const midHip = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
    const midKnee = { x: (leftKnee.x + rightKnee.x) / 2, y: (leftKnee.y + rightKnee.y) / 2 };
    const midAnkle = { x: (leftAnkle.x + rightAnkle.x) / 2, y: (leftAnkle.y + rightAnkle.y) / 2 };

    const neckAngle = calcAngle(rightEar, rightShoulder, rightHip);
    const shoulderAngle = calcAngle(rightElbow, rightShoulder, rightHip);
    const hipAngle = calcAngle(midShoulder, midHip, midKnee);
    const kneeAngle = calcAngle(midHip, midKnee, midAnkle);
    const spineDeviation = Math.abs(nose.x - midHip.x) * 100;
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

    // Evaluate faults for current mode
    const mode = EXERCISE_MODES.find(m => m.id === scanMode)!;
    const faults: MovementFault[] = mode.faultDefinitions.map(fd => ({
      label: fd.label,
      detected: fd.check(newAngles),
      corrective: fd.corrective,
      cue: fd.cue,
    }));
    const detectedCount = faults.filter(f => f.detected).length;
    const score = Math.max(0, Math.round(100 - (detectedCount / faults.length) * 100));

    setAnalysis({
      mode: scanMode,
      score,
      faults,
      status: detectedCount > 0 ? "DETECTED" : "CLEAR",
    });

    // ── Rep counting (SQUAT, LUNGE, HINGE modes) ──────────────────────────────
    if (scanMode === "SQUAT" || scanMode === "LUNGE" || scanMode === "HINGE") {
      // kneeAngle < 100 = bottom position; > 160 = top position
      const depthThreshold = scanMode === "HINGE" ? 80 : 100;
      const topThreshold = scanMode === "HINGE" ? 150 : 160;
      if (kneeAngle < depthThreshold && repStageRef.current === "up") {
        repStageRef.current = "down";
        setRepStage("down");
      }
      if (kneeAngle > topThreshold && repStageRef.current === "down") {
        repStageRef.current = "up";
        setRepStage("up");
        setRepCount(prev => prev + 1);
        // Voice cue on rep completion (debounced 3s)
        const repNow = Date.now();
        if (voiceEnabled && repNow - lastRepVoiceRef.current > 3000) {
          lastRepVoiceRef.current = repNow;
          const voiceId = scanMode === "SQUAT" ? "sq_slow" : scanMode === "HINGE" ? "rdl" : "split_squat";
          fetch("/api/voice/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exercise_id: voiceId, difficulty: "normal" }),
          }).then(r => r.json()).then(d => {
            if (d.audio_url) { const a = new Audio(d.audio_url); a.play().catch(() => {}); }
          }).catch(() => {});
        }
      }
    }

    // Voice cue throttle — 8 seconds between cues
    const now = Date.now();
    if (voiceEnabled && now - lastVoiceRef.current > 8000) {
      const primaryFault = faults.find(f => f.detected);
      if (primaryFault && primaryFault.cue !== lastVoiceTextRef.current) {
        lastVoiceRef.current = now;
        lastVoiceTextRef.current = primaryFault.cue;
        speakCue(primaryFault.cue);
      }
    }
  }, [scanMode, voiceEnabled]);

  // ── Draw Skeleton ───────────────────────────────────────────────────────────
  const drawSkeleton = useCallback((landmarks: any[], canvas: HTMLCanvasElement, video: HTMLVideoElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (!landmarks || landmarks.length < 33) return;
    const w = canvas.width, h = canvas.height;

    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24],
      [23, 25], [25, 27], [24, 26], [26, 28],
      [27, 29], [28, 30], [29, 31], [30, 32],
      [0, 7], [0, 8], [7, 11], [8, 12],
    ];

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-w, 0);
    connections.forEach(([a, b]) => {
      const lmA = landmarks[a], lmB = landmarks[b];
      if (!lmA || !lmB || lmA.visibility < 0.3 || lmB.visibility < 0.3) return;
      ctx.beginPath();
      ctx.moveTo(lmA.x * w, lmA.y * h);
      ctx.lineTo(lmB.x * w, lmB.y * h);
      ctx.strokeStyle = currentMode.color + "cc";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });
    landmarks.forEach((lm) => {
      if (!lm || lm.visibility < 0.3) return;
      ctx.beginPath();
      ctx.arc(lm.x * w, lm.y * h, 4, 0, 2 * Math.PI);
      ctx.fillStyle = currentMode.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    ctx.restore();
  }, [currentMode.color]);

  // ── Start Camera ────────────────────────────────────────────────────────────
  const handleActivate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
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
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
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
      setAnalysis(prev => ({ ...prev, status: "SCANNING" }));

      const runLoop = async () => {
        if (videoRef.current && videoRef.current.readyState >= 2 && poseRef.current) {
          await poseRef.current.send({ image: videoRef.current });
        }
        animFrameRef.current = requestAnimationFrame(runLoop);
      };
      runLoop();

      if (voiceEnabled) {
        setTimeout(() => speakCue(`BOA activated. ${currentMode.standingCue}`), 500);
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.name === "NotAllowedError"
        ? "Camera access denied. Allow camera access in browser settings."
        : "Could not start camera. Check your device and try again.");
    }
  }, [analyzePose, drawSkeleton, voiceEnabled, currentMode, facingMode]);

  // ── Flip Camera ─────────────────────────────────────────────────────────────
  const handleFlipCamera = useCallback(async () => {
    const newFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacing);
    if (!isActive) return; // will take effect on next activation
    // Stop current stream without resetting isActive
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    // Restart with new facing mode
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing, width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      if (poseRef.current) {
        const runLoop = async () => {
          if (videoRef.current && videoRef.current.readyState >= 2 && poseRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
          animFrameRef.current = requestAnimationFrame(runLoop);
        };
        runLoop();
      }
    } catch (err) {
      console.error("[BOA] Flip camera error:", err);
    }
  }, [facingMode, isActive]);

  // ── Stop ────────────────────────────────────────────────────────────────────
  const handleStop = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (poseRef.current) { poseRef.current.close?.(); poseRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setIsActive(false);
    setAnalysis(prev => ({ ...prev, status: "OFFLINE" }));
  }, []);

  // ── AI Snapshot Analysis ────────────────────────────────────────────────────
  const handleAiAnalysis = useCallback(async () => {
    if (!canvasRef.current || !isActive) return;
    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      const snapshot = canvasRef.current.toDataURL("image/jpeg", 0.8);
      const base64 = snapshot.split(",")[1];

      const res = await fetch("/api/coaching/analyze-movement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          prompt: currentMode.aiPrompt,
          mode: scanMode,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const content: string = data?.content || "";
      if (!content) throw new Error("Empty response");

      // Extract score from AI response
      const scoreMatch = content.match(/SCORE:\s*(\d+)/i);
      if (scoreMatch) setMovementScore(parseInt(scoreMatch[1]));

      setAiAnalysis(content);

      // Log session
      const faultLabels = analysis.faults.filter(f => f.detected).map(f => f.label);
      setSessionLog(prev => [{
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mode: scanMode,
        score: movementScore || analysis.score,
        faults: faultLabels,
        snapshot,
      }, ...prev.slice(0, 9)]);

    } catch {
      setAiAnalysis("PANTHER OFFLINE — Real-time sensor data is active. Check your connection for AI analysis.");
    }
    setIsAnalyzing(false);
  }, [isActive, currentMode, scanMode, analysis, movementScore]);

  // ── Cleanup ──────────────────────────────────────────────────────────────────
  useEffect(() => () => { handleStop(); }, [handleStop]);

  // ── Score Color ──────────────────────────────────────────────────────────────
  const scoreColor = (s: number) => s >= 80 ? "#22c55e" : s >= 60 ? "#C8973A" : "#FF6600";

  const detectedFaults = analysis.faults.filter(f => f.detected);
  const pantherState = !isActive ? "idle" : detectedFaults.length === 0 ? "coaching" : detectedFaults.length >= 2 ? "activated" : "coaching";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 96 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes ambient { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
        @keyframes ring    { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.05);opacity:1} }
        @keyframes scan    { 0%{top:-2%;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:102%;opacity:0} }
        @keyframes pulse   { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "72px 16px 0" }}>

        {/* SCENE 1 — HOOK: Header */}
        <div style={{ marginBottom: 16, animation: "fadeUp 0.4s ease forwards" }}>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "#FF6600", marginBottom: 2 }}>
            BIOMECHANICAL OVERLAY
          </p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: "0.07em", color: "var(--text-primary)", lineHeight: 1 }}>
            MOVEMENT <span style={{ color: currentMode.color }}>ANALYSIS</span>
          </h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
            {currentMode.description}
          </p>
        </div>

        {/* SCENE 2 — Exercise Mode Selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
          {EXERCISE_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => { if (!isActive) setScanMode(mode.id); }}
              style={{
                flexShrink: 0, padding: "8px 14px", borderRadius: 20,
                background: scanMode === mode.id ? `${mode.color}22` : "rgba(255,255,255,0.03)",
                border: `1px solid ${scanMode === mode.id ? mode.color + "66" : "rgba(255,255,255,0.07)"}`,
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.08em", color: scanMode === mode.id ? mode.color : "rgba(255,255,255,0.4)",
                cursor: isActive ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <span style={{ fontSize: 13 }}>{mode.icon}</span>
              {mode.label}
            </button>
          ))}
        </div>

        {/* SCENE 3 — Camera Feed */}
        <V4Card accent={currentMode.color} style={{ marginBottom: 14, padding: 0, overflow: "hidden" }}>
          <div style={{ position: "relative", width: "100%", paddingTop: "75%", background: "#0a0a0a" }}>
            <video
              ref={videoRef}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: facingMode === "user" ? "scaleX(-1)" : "none", opacity: isActive ? 1 : 0 }}
              playsInline muted autoPlay
            />
            <canvas
              ref={canvasRef}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />

            {/* Offline overlay */}
            {!isActive && !isLoading && (
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 12,
                background: "rgba(0,0,0,0.85)",
              }}>
                <PantherPresence state="idle" size={80} />
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", textAlign: "center", maxWidth: 200 }}>
                  {currentMode.standingCue}
                </p>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 40, height: 40, border: `3px solid ${currentMode.color}33`, borderTop: `3px solid ${currentMode.color}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)" }}>
                    LOADING MEDIAPIPE...
                  </p>
                </div>
              </div>
            )}

            {/* Score overlay when active */}
            {isActive && analysis.score > 0 && (
              <div style={{
                position: "absolute", top: 10, right: 10,
                background: "rgba(0,0,0,0.75)", borderRadius: 12, padding: "6px 12px",
                border: `1px solid ${scoreColor(analysis.score)}44`,
              }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: scoreColor(analysis.score), lineHeight: 1 }}>
                  {analysis.score}
                </p>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>
                  SCORE
                </p>
              </div>
            )}

            {/* Mode badge */}
            {isActive && (
              <div style={{
                position: "absolute", top: 10, left: 10,
                background: `${currentMode.color}22`, borderRadius: 8, padding: "4px 10px",
                border: `1px solid ${currentMode.color}44`,
              }}>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: currentMode.color }}>
                  {currentMode.icon} {scanMode}
                </p>
              </div>
            )}

            {/* Scan line */}
            {isActive && (
              <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                <div style={{
                  position: "absolute", left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, transparent, ${currentMode.color}88, transparent)`,
                  animation: "scan 3s linear infinite",
                }} />
              </div>
            )}
          </div>

          {/* Camera controls */}
          <div style={{ padding: "12px 16px", display: "flex", gap: 8, alignItems: "center" }}>
            {!isActive ? (
              <>
                <button
                  onClick={handleActivate}
                  disabled={isLoading}
                  style={{
                    flex: 1, padding: "12px", borderRadius: 14, border: "none",
                    background: `linear-gradient(135deg, ${currentMode.color}, ${currentMode.color}88)`,
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: "0.1em",
                    color: "var(--text-primary)", cursor: "pointer",
                  }}
                >
                  ACTIVATE {scanMode} SCAN
                </button>
                <button
                  onClick={handleFlipCamera}
                  title={facingMode === "user" ? "Switch to rear camera" : "Switch to front camera"}
                  style={{
                    padding: "12px", borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: facingMode === "environment" ? "rgba(255,102,0,0.12)" : "rgba(255,255,255,0.05)",
                    fontSize: 18, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    minWidth: 44,
                  }}
                >
                  🔄
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleAiAnalysis}
                  disabled={isAnalyzing}
                  style={{
                    flex: 1, padding: "12px", borderRadius: 14, border: "none",
                    background: isAnalyzing ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #FF6600, #8B0000)",
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: "0.1em",
                    color: "var(--text-primary)", cursor: isAnalyzing ? "not-allowed" : "pointer",
                  }}
                >
                  {isAnalyzing ? "ANALYZING..." : "AI SNAPSHOT"}
                </button>
                <button
                  onClick={handleStop}
                  style={{
                    padding: "12px 16px", borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700,
                    letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)", cursor: "pointer",
                  }}
                >
                  STOP
                </button>
                <button
                  onClick={handleFlipCamera}
                  title={facingMode === "user" ? "Switch to rear camera" : "Switch to front camera"}
                  style={{
                    padding: "12px", borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.05)",
                    fontSize: 18, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    minWidth: 44,
                  }}
                >
                  🔄
                </button>
                <button
                  onClick={() => setVoiceEnabled(v => !v)}
                  style={{
                    padding: "12px", borderRadius: 14,
                    border: `1px solid ${voiceEnabled ? "#FF660044" : "rgba(255,255,255,0.1)"}`,
                    background: voiceEnabled ? "rgba(255,102,0,0.1)" : "rgba(255,255,255,0.03)",
                    fontSize: 16, cursor: "pointer",
                  }}
                >
                  {voiceEnabled ? "🔊" : "🔇"}
                </button>
              </>
            )}
          </div>
        </V4Card>

        {error && (
          <div style={{ padding: "12px 16px", borderRadius: 14, background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", marginBottom: 14 }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#ef4444" }}>{error}</p>
          </div>
        )}

        {/* SCENE 4 — Movement Faults */}
        {isActive && analysis.faults.length > 0 && (
          <V4Card accent={currentMode.color} style={{ marginBottom: 14 }}>
            <SceneHeader num="04" label="MOVEMENT FAULTS" color={currentMode.color} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {analysis.faults.map((fault, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                    borderRadius: 12,
                    background: fault.detected ? "rgba(255,102,0,0.06)" : "rgba(34,197,94,0.04)",
                    border: `1px solid ${fault.detected ? "rgba(255,102,0,0.2)" : "rgba(34,197,94,0.15)"}`,
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: fault.detected ? "#FF6600" : "#22c55e",
                    animation: fault.detected ? "pulse 1.5s ease-in-out infinite" : "none",
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: fault.detected ? "#FF6600" : "#22c55e" }}>
                      {fault.label}
                    </p>
                    {fault.detected && (
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2, lineHeight: 1.4 }}>
                        {fault.cue}
                      </p>
                    )}
                  </div>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 4,
                    background: fault.detected ? "rgba(255,102,0,0.15)" : "rgba(34,197,94,0.1)",
                    color: fault.detected ? "#FF6600" : "#22c55e",
                  }}>
                    {fault.detected ? "FAULT" : "CLEAR"}
                  </span>
                </div>
              ))}
            </div>

            {/* Link to corrective plan */}
            {detectedFaults.length > 0 && (
              <button
                onClick={() => {
                  const primaryFault = detectedFaults[0];
                  const issue = ISSUES.find(i => i.id === primaryFault.corrective);
                  if (issue) {
                    localStorage.setItem("tuf_correctives", JSON.stringify({ issue }));
                    navigate("/assess");
                  }
                }}
                style={{
                  width: "100%", marginTop: 12, padding: "12px", borderRadius: 14,
                  background: `linear-gradient(135deg, ${currentMode.color}33, ${currentMode.color}11)`,
                  border: `1px solid ${currentMode.color}44`,
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
                  letterSpacing: "0.08em", color: currentMode.color, cursor: "pointer",
                }}
              >
                BUILD CORRECTIVE PLAN FOR {detectedFaults[0].label} →
              </button>
            )}
          </V4Card>
        )}

        {/* SCENE 5 — Joint Angles */}
        {isActive && (
          <V4Card style={{ marginBottom: 14 }}>
            <SceneHeader num="05" label="JOINT ANGLES" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                { label: "NECK", value: angles.neck, unit: "°" },
                { label: "SHOULDER", value: angles.shoulder, unit: "°" },
                { label: "HIP", value: angles.hip, unit: "°" },
                { label: "KNEE", value: angles.knee, unit: "°" },
                { label: "SPINE", value: angles.spine, unit: "" },
                { label: "ANKLE", value: angles.ankle, unit: "°" },
              ].map(j => (
                <div key={j.label} style={{ textAlign: "center", padding: "10px 8px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: j.value > 0 ? currentMode.color : "#333", lineHeight: 1 }}>
                    {j.value > 0 ? `${j.value}${j.unit}` : "—"}
                  </p>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                    {j.label}
                  </p>
                </div>
              ))}
            </div>
          </V4Card>
        )}

        {/* SCENE 5b — Rep Counter (SQUAT / LUNGE / HINGE) */}
        {isActive && (scanMode === "SQUAT" || scanMode === "LUNGE" || scanMode === "HINGE") && (
          <V4Card style={{ marginBottom: 14 }}>
            <SceneHeader num="05b" label="REP COUNTER" color={currentMode.color} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              <div style={{ textAlign: "center", padding: "10px 8px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${currentMode.color}44` }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: currentMode.color, lineHeight: 1 }}>
                  {repCount}
                </p>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>REPS</p>
              </div>
              <div style={{ textAlign: "center", padding: "10px 8px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: repStage === "down" ? "#ef4444" : "#22c55e", lineHeight: 1 }}>
                  {repStage.toUpperCase()}
                </p>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>STAGE</p>
              </div>
              <div style={{ textAlign: "center", padding: "10px 8px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: angles.knee > 0 ? "#facc15" : "#333", lineHeight: 1 }}>
                  {angles.knee > 0 ? `${angles.knee}°` : "—"}
                </p>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>KNEE ANGLE</p>
              </div>
            </div>
            <button
              onClick={() => { setRepCount(0); repStageRef.current = "up"; setRepStage("up"); }}
              style={{ marginTop: 10, width: "100%", padding: "6px 0", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
            >
              RESET REPS
            </button>
          </V4Card>
        )}

        {/* AI Analysis Result */}
        {aiAnalysis && (
          <V4Card accent="#FF6600" style={{ marginBottom: 14 }}>
            <SceneHeader num="AI" label="PANTHER ANALYSIS" color="#FF6600" />
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {aiAnalysis}
            </div>
          </V4Card>
        )}

        {/* SCENE 6 — Panther Coaching */}
        <PantherMessage
          headline={
            !isActive ? `ACTIVATE ${scanMode} SCAN.` :
            detectedFaults.length === 0 ? "MOVEMENT PATTERN CLEAN." :
            `${detectedFaults.length} FAULT${detectedFaults.length > 1 ? "S" : ""} DETECTED.`
          }
          body={
            !isActive ? currentMode.standingCue :
            detectedFaults.length === 0 ? "No compensation patterns detected in this mode. Your mechanics are clean. Load it." :
            detectedFaults.map(f => f.cue).join(" ")
          }
          directive={
            detectedFaults.length > 0
              ? `Go to ASSESS → ${ISSUES.find(i => i.id === detectedFaults[0].corrective)?.label || "Corrective Plan"}`
              : "Continue scanning or switch to a different movement mode."
          }
        />

        {/* NASM Continuum */}
        <V4Card style={{ marginBottom: 14 }}>
          <SceneHeader num="07" label="NASM CORRECTIVE CONTINUUM" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {NASM_STEPS.map(step => (
              <div key={step.num} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: step.color, flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: step.color }}>
                    {step.num} · {step.label}
                  </p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </V4Card>

        {/* Session Log */}
        {sessionLog.length > 0 && (
          <V4Card style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <SceneHeader num="08" label="SESSION LOG" />
              <button onClick={() => setSessionLog([])} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer" }}>
                CLEAR
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {sessionLog.map((entry, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
                      {entry.time} · {entry.mode}
                    </p>
                    {entry.faults.length > 0 && (
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
                        {entry.faults.join(" · ")}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: scoreColor(entry.score), lineHeight: 1 }}>
                      {entry.score}
                    </p>
                    <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>SCORE</p>
                  </div>
                </div>
              ))}
            </div>
          </V4Card>
        )}

      </main>
    </div>
  );
}
