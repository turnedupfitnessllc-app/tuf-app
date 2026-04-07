/**
 * TUF Biomechanical Overlay Architecture (BOA)
 * MediaPipe Pose — real-time joint angle detection + NASM compensation pattern recognition
 *
 * Landmark indices (MediaPipe BlazePose 33-point model):
 * 0=nose, 11=L_shoulder, 12=R_shoulder, 13=L_elbow, 14=R_elbow,
 * 15=L_wrist, 16=R_wrist, 23=L_hip, 24=R_hip, 25=L_knee, 26=R_knee,
 * 27=L_ankle, 28=R_ankle, 29=L_heel, 30=R_heel, 31=L_foot, 32=R_foot
 */

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Landmark {
  x: number; // normalized 0-1
  y: number; // normalized 0-1
  z: number; // depth
  visibility?: number;
}

export type CompensationPattern =
  | "knee_valgus"           // knees caving in — tight adductors / weak glute med
  | "hip_not_extended"      // hip not reaching full extension — tight hip flexors
  | "lumbar_hyperextension" // low back arching — weak core / tight hip flexors
  | "forward_head"          // head forward of shoulders — UCS
  | "shoulder_elevation"    // shoulders shrugging — upper trap dominance
  | "knee_over_toe"         // knee tracking past toes — LCS
  | "feet_turning_out"      // feet externally rotating — tight calves / weak glutes
  | "arms_falling_forward"  // overhead arms falling — tight lats / weak lower traps
  | "spinal_flexion"        // spine rounding — weak erectors / tight hamstrings
  | "lateral_trunk_shift";  // shifting to one side — hip weakness

export interface CompensationAlert {
  pattern: CompensationPattern;
  severity: "mild" | "moderate" | "severe";
  cue: string;           // Panther coaching cue
  side?: "left" | "right" | "bilateral";
  angle?: number;        // measured angle in degrees
  threshold?: number;    // expected threshold
}

export interface JointAngles {
  leftKnee: number;
  rightKnee: number;
  leftHip: number;
  rightHip: number;
  leftAnkle: number;
  rightAnkle: number;
  leftElbow: number;
  rightElbow: number;
  trunkAngle: number;    // torso lean from vertical
  hipExtension: number;  // max hip extension angle
  kneeValgusLeft: number;  // lateral knee deviation
  kneeValgusRight: number;
}

export interface BOAState {
  isActive: boolean;
  isLoading: boolean;
  landmarks: Landmark[] | null;
  angles: JointAngles | null;
  compensations: CompensationAlert[];
  repCount: number;
  phase: "down" | "up" | "hold" | "idle";
  formScore: number; // 0-100
  error: string | null;
}

// ─── NASM Compensation Thresholds ─────────────────────────────────────────────
// Based on NASM Corrective Exercise Specialist standards
export const NASM_THRESHOLDS = {
  // Glute Bridge
  gluteBridge: {
    hipExtensionTarget: 170,    // degrees — full hip extension at top
    hipExtensionMin: 155,       // below this = incomplete extension
    lumbarHyperextensionMax: 20, // trunk deviation from neutral
    kneeValgusMax: 15,          // lateral deviation in degrees
    kneeAngleBottom: 90,        // knee angle at bottom position
    kneeAngleTop: 160,          // knee angle at top (near full extension)
  },
  // Squat
  squat: {
    kneeFlexionTarget: 90,
    kneeValgusMax: 10,
    trunkLeanMax: 45,
    heelRiseThreshold: 0.05,    // normalized y-delta
  },
  // Dead Bug
  deadBug: {
    lumbarFlatMax: 10,          // deviation from neutral
    shoulderFlexionTarget: 180,
  },
  // Hip Hinge
  hipHinge: {
    hipFlexionTarget: 80,
    spinalFlexionMax: 15,
    kneeFlexionMax: 30,
  },
  // Overhead Squat Assessment (OHSA)
  ohsa: {
    armsParallelMin: 160,       // arm angle — below = falling forward
    kneeValgusMax: 10,
    trunkLeanMax: 30,
    feetRotationMax: 20,
  },
};

// ─── Geometry Helpers ─────────────────────────────────────────────────────────
export function angleBetweenThreePoints(
  a: Landmark,
  b: Landmark, // vertex
  c: Landmark
): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
  const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);
  if (magAB === 0 || magCB === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

export function verticalAngle(a: Landmark, b: Landmark): number {
  // Angle of segment a→b from vertical axis
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return (Math.atan2(Math.abs(dx), Math.abs(dy)) * 180) / Math.PI;
}

export function lateralDeviation(
  hip: Landmark,
  knee: Landmark,
  ankle: Landmark
): number {
  // How much the knee deviates medially from the hip-ankle line
  const lineX = ankle.x + ((knee.y - ankle.y) / (hip.y - ankle.y)) * (hip.x - ankle.x);
  return (knee.x - lineX) * 100; // positive = valgus (caving in for right leg)
}

// ─── Joint Angle Calculator ───────────────────────────────────────────────────
export function calculateJointAngles(lm: Landmark[]): JointAngles {
  const get = (i: number) => lm[i] || { x: 0, y: 0, z: 0, visibility: 0 };

  const lShoulder = get(11), rShoulder = get(12);
  const lElbow = get(13), rElbow = get(14);
  const lWrist = get(15), rWrist = get(16);
  const lHip = get(23), rHip = get(24);
  const lKnee = get(25), rKnee = get(26);
  const lAnkle = get(27), rAnkle = get(28);

  // Mid-points
  const midShoulder = { x: (lShoulder.x + rShoulder.x) / 2, y: (lShoulder.y + rShoulder.y) / 2, z: 0 };
  const midHip = { x: (lHip.x + rHip.x) / 2, y: (lHip.y + rHip.y) / 2, z: 0 };

  return {
    leftKnee: angleBetweenThreePoints(lHip, lKnee, lAnkle),
    rightKnee: angleBetweenThreePoints(rHip, rKnee, rAnkle),
    leftHip: angleBetweenThreePoints(lShoulder, lHip, lKnee),
    rightHip: angleBetweenThreePoints(rShoulder, rHip, rKnee),
    leftAnkle: angleBetweenThreePoints(lKnee, lAnkle, { x: lAnkle.x, y: lAnkle.y + 0.1, z: 0 }),
    rightAnkle: angleBetweenThreePoints(rKnee, rAnkle, { x: rAnkle.x, y: rAnkle.y + 0.1, z: 0 }),
    leftElbow: angleBetweenThreePoints(lShoulder, lElbow, lWrist),
    rightElbow: angleBetweenThreePoints(rShoulder, rElbow, rWrist),
    trunkAngle: verticalAngle(midHip, midShoulder),
    hipExtension: angleBetweenThreePoints(
      { x: midShoulder.x, y: midShoulder.y - 0.1, z: 0 },
      midHip,
      { x: (lKnee.x + rKnee.x) / 2, y: (lKnee.y + rKnee.y) / 2, z: 0 }
    ),
    kneeValgusLeft: lateralDeviation(lHip, lKnee, lAnkle),
    kneeValgusRight: -lateralDeviation(rHip, rKnee, rAnkle), // flip for right side
  };
}

// ─── NASM Compensation Detector ───────────────────────────────────────────────
export type ExerciseKey = "gluteBridge" | "squat" | "deadBug" | "hipHinge" | "ohsa";

export function detectCompensations(
  angles: JointAngles,
  exercise: ExerciseKey
): CompensationAlert[] {
  const alerts: CompensationAlert[] = [];
  const t = NASM_THRESHOLDS[exercise];

  if (exercise === "gluteBridge") {
    const gb = t as typeof NASM_THRESHOLDS.gluteBridge;

    // Knee valgus — left
    if (angles.kneeValgusLeft > gb.kneeValgusMax) {
      alerts.push({
        pattern: "knee_valgus",
        severity: angles.kneeValgusLeft > gb.kneeValgusMax * 2 ? "severe" : "moderate",
        side: "left",
        angle: angles.kneeValgusLeft,
        threshold: gb.kneeValgusMax,
        cue: "Left knee is caving. Drive it out — push your knee toward your pinky toe.",
      });
    }

    // Knee valgus — right
    if (angles.kneeValgusRight > gb.kneeValgusMax) {
      alerts.push({
        pattern: "knee_valgus",
        severity: angles.kneeValgusRight > gb.kneeValgusMax * 2 ? "severe" : "moderate",
        side: "right",
        angle: angles.kneeValgusRight,
        threshold: gb.kneeValgusMax,
        cue: "Right knee is caving. Drive it out — push your knee toward your pinky toe.",
      });
    }

    // Hip not reaching full extension
    if (angles.hipExtension < gb.hipExtensionMin) {
      alerts.push({
        pattern: "hip_not_extended",
        severity: angles.hipExtension < gb.hipExtensionMin - 20 ? "severe" : "mild",
        angle: angles.hipExtension,
        threshold: gb.hipExtensionTarget,
        cue: "Drive your hips higher. Squeeze your glutes at the top — full extension.",
      });
    }

    // Lumbar hyperextension
    if (angles.trunkAngle > gb.lumbarHyperextensionMax) {
      alerts.push({
        pattern: "lumbar_hyperextension",
        severity: "moderate",
        angle: angles.trunkAngle,
        threshold: gb.lumbarHyperextensionMax,
        cue: "Low back is arching. Brace your core — ribs down, neutral spine.",
      });
    }
  }

  if (exercise === "squat") {
    const sq = t as typeof NASM_THRESHOLDS.squat;

    if (angles.kneeValgusLeft > sq.kneeValgusMax || angles.kneeValgusRight > sq.kneeValgusMax) {
      alerts.push({
        pattern: "knee_valgus",
        severity: "moderate",
        side: "bilateral",
        cue: "Knees are caving. Screw your feet into the floor — push knees out over toes.",
      });
    }

    if (angles.trunkAngle > sq.trunkLeanMax) {
      alerts.push({
        pattern: "spinal_flexion",
        severity: "mild",
        angle: angles.trunkAngle,
        threshold: sq.trunkLeanMax,
        cue: "Chest is falling forward. Keep your torso upright — brace and sit back.",
      });
    }
  }

  if (exercise === "hipHinge") {
    const hh = t as typeof NASM_THRESHOLDS.hipHinge;

    if (angles.trunkAngle > hh.spinalFlexionMax) {
      alerts.push({
        pattern: "spinal_flexion",
        severity: "moderate",
        angle: angles.trunkAngle,
        threshold: hh.spinalFlexionMax,
        cue: "Spine is rounding. Neutral spine — chest up, hinge at the hip not the back.",
      });
    }
  }

  if (exercise === "ohsa") {
    const oh = t as typeof NASM_THRESHOLDS.ohsa;

    if (angles.leftElbow < oh.armsParallelMin || angles.rightElbow < oh.armsParallelMin) {
      alerts.push({
        pattern: "arms_falling_forward",
        severity: "mild",
        cue: "Arms are falling forward. Tight lats. Keep arms locked overhead — reach for the ceiling.",
      });
    }

    if (angles.kneeValgusLeft > oh.kneeValgusMax || angles.kneeValgusRight > oh.kneeValgusMax) {
      alerts.push({
        pattern: "knee_valgus",
        severity: "moderate",
        side: "bilateral",
        cue: "Knees caving on the descent. Glute medius is weak — drive knees out.",
      });
    }
  }

  return alerts;
}

// ─── Form Score Calculator ────────────────────────────────────────────────────
export function calculateFormScore(compensations: CompensationAlert[]): number {
  if (compensations.length === 0) return 100;
  const deductions = compensations.reduce((sum, c) => {
    if (c.severity === "severe") return sum + 25;
    if (c.severity === "moderate") return sum + 15;
    return sum + 8;
  }, 0);
  return Math.max(0, 100 - deductions);
}

// ─── Skeleton Drawing ─────────────────────────────────────────────────────────
const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // arms
  [11, 23], [12, 24], [23, 24],                       // torso
  [23, 25], [25, 27], [24, 26], [26, 28],             // legs
  [27, 29], [28, 30], [29, 31], [30, 32],             // feet
];

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  canvasWidth: number,
  canvasHeight: number,
  compensations: CompensationAlert[]
) {
  const hasKneeValgus = compensations.some((c) => c.pattern === "knee_valgus");
  const hasHipIssue = compensations.some((c) => c.pattern === "hip_not_extended");

  // Draw connections
  ctx.lineWidth = 3;
  for (const [i, j] of POSE_CONNECTIONS) {
    const a = landmarks[i];
    const b = landmarks[j];
    if (!a || !b) continue;
    if ((a.visibility ?? 1) < 0.5 || (b.visibility ?? 1) < 0.5) continue;

    // Color knee connections red if valgus detected
    const isKneeConnection = [25, 26, 27, 28].includes(i) || [25, 26, 27, 28].includes(j);
    const isHipConnection = [23, 24].includes(i) || [23, 24].includes(j);

    if (isKneeConnection && hasKneeValgus) {
      ctx.strokeStyle = "rgba(255, 69, 0, 0.9)";
    } else if (isHipConnection && hasHipIssue) {
      ctx.strokeStyle = "rgba(200, 151, 58, 0.9)";
    } else {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    }

    ctx.beginPath();
    ctx.moveTo(a.x * canvasWidth, a.y * canvasHeight);
    ctx.lineTo(b.x * canvasWidth, b.y * canvasHeight);
    ctx.stroke();
  }

  // Draw joints
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    if (!lm || (lm.visibility ?? 1) < 0.5) continue;

    const isKeyJoint = [23, 24, 25, 26, 27, 28, 11, 12].includes(i);
    const isKnee = [25, 26].includes(i);

    ctx.beginPath();
    ctx.arc(lm.x * canvasWidth, lm.y * canvasHeight, isKeyJoint ? 6 : 4, 0, Math.PI * 2);
    ctx.fillStyle = isKnee && hasKneeValgus
      ? "rgba(255, 69, 0, 1)"
      : "rgba(255, 255, 255, 0.9)";
    ctx.fill();
  }
}

// ─── Main Hook ────────────────────────────────────────────────────────────────
export function useBiomechanics(exercise: ExerciseKey = "gluteBridge") {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const lastCueTimeRef = useRef<number>(0);
  const lastRepPhaseRef = useRef<"down" | "up">("down");
  const repCountRef = useRef(0);

  const [state, setState] = useState<BOAState>({
    isActive: false,
    isLoading: false,
    landmarks: null,
    angles: null,
    compensations: [],
    repCount: 0,
    phase: "idle",
    formScore: 100,
    error: null,
  });

  const onResults = useCallback(
    (results: any) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Mirror the video feed
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);

      if (results.image) {
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      }

      if (results.poseLandmarks && results.poseLandmarks.length > 0) {
        const lm: Landmark[] = results.poseLandmarks;
        const angles = calculateJointAngles(lm);
        const compensations = detectCompensations(angles, exercise);
        const formScore = calculateFormScore(compensations);

        // Rep counting for Glute Bridge — detect hip extension cycle
        let phase: BOAState["phase"] = "idle";
        if (exercise === "gluteBridge") {
          const hipAngle = angles.hipExtension;
          if (hipAngle > 155) {
            phase = "up";
            if (lastRepPhaseRef.current === "down") {
              repCountRef.current += 1;
              lastRepPhaseRef.current = "up";
            }
          } else if (hipAngle < 120) {
            phase = "down";
            lastRepPhaseRef.current = "down";
          } else {
            phase = lastRepPhaseRef.current === "up" ? "hold" : "down";
          }
        }

        drawSkeleton(ctx, lm, canvas.width, canvas.height, compensations);

        // Angle labels
        ctx.restore();
        ctx.save();
        ctx.font = "bold 11px 'Barlow Condensed', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.9)";

        const lKnee = lm[25];
        const rKnee = lm[26];
        if (lKnee && (lKnee.visibility ?? 1) > 0.5) {
          ctx.fillText(
            `${Math.round(angles.leftKnee)}°`,
            (1 - lKnee.x) * canvas.width + 8,
            lKnee.y * canvas.height
          );
        }
        if (rKnee && (rKnee.visibility ?? 1) > 0.5) {
          ctx.fillText(
            `${Math.round(angles.rightKnee)}°`,
            (1 - rKnee.x) * canvas.width + 8,
            rKnee.y * canvas.height
          );
        }

        setState((prev) => ({
          ...prev,
          landmarks: lm,
          angles,
          compensations,
          repCount: repCountRef.current,
          phase,
          formScore,
        }));
      }

      ctx.restore();
    },
    [exercise]
  );

  const start = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Dynamically load MediaPipe from CDN
      if (!window.Pose) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load MediaPipe"));
          document.head.appendChild(script);
        });
      }

      const pose = new window.Pose({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(onResults);
      await pose.initialize();
      poseRef.current = pose;

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });

      const video = videoRef.current;
      if (!video) throw new Error("Video element not ready");
      video.srcObject = stream;
      await video.play();

      // Process frames
      const processFrame = async () => {
        if (video.readyState >= 2 && poseRef.current) {
          await poseRef.current.send({ image: video });
        }
        animFrameRef.current = requestAnimationFrame(processFrame);
      };

      animFrameRef.current = requestAnimationFrame(processFrame);
      cameraRef.current = stream;

      setState((prev) => ({ ...prev, isActive: true, isLoading: false }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || "Camera access failed",
      }));
    }
  }, [onResults]);

  const stop = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (cameraRef.current) {
      (cameraRef.current as MediaStream).getTracks().forEach((t) => t.stop());
      cameraRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    repCountRef.current = 0;
    lastRepPhaseRef.current = "down";
    setState({
      isActive: false,
      isLoading: false,
      landmarks: null,
      angles: null,
      compensations: [],
      repCount: 0,
      phase: "idle",
      formScore: 100,
      error: null,
    });
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (cameraRef.current) {
        (cameraRef.current as MediaStream).getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return { videoRef, canvasRef, state, start, stop };
}

// Extend window for MediaPipe global
declare global {
  interface Window {
    Pose: any;
  }
}
