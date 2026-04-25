/**
 * useFaceTracking — MediaPipe FaceMesh eye gaze detection
 *
 * Returns the user's normalized gaze direction (-1 to 1 on both axes)
 * so the Panther's eyes can follow the user's actual eye movement.
 *
 * Uses MediaPipe FaceMesh loaded from CDN — no npm install needed.
 * Falls back to mouse/pointer tracking if camera is unavailable.
 */

import { useEffect, useRef, useState, useCallback } from "react";

export type GazeDirection = {
  x: number; // -1 (left) to 1 (right)
  y: number; // -1 (up) to 1 (down)
  confidence: number; // 0-1, how confident we are in the reading
  source: "face" | "pointer" | "idle";
};

const IDLE_GAZE: GazeDirection = { x: 0, y: 0, confidence: 1, source: "idle" };

// MediaPipe FaceMesh landmark indices for eye centers
// Left eye center: landmark 468, Right eye center: landmark 473
// Iris landmarks give us precise gaze direction
const LEFT_IRIS_CENTER = 468;
const RIGHT_IRIS_CENTER = 473;
const LEFT_EYE_LEFT = 33;
const LEFT_EYE_RIGHT = 133;
const RIGHT_EYE_LEFT = 362;
const RIGHT_EYE_RIGHT = 263;

declare global {
  interface Window {
    FaceMesh: any;
    Camera: any;
  }
}

export function useFaceTracking(enabled: boolean = true) {
  const [gaze, setGaze] = useState<GazeDirection>(IDLE_GAZE);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceMeshRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastGazeRef = useRef<GazeDirection>(IDLE_GAZE);
  const pointerGazeRef = useRef<GazeDirection>(IDLE_GAZE);

  // Smooth gaze with lerp to avoid jitter
  const smoothGaze = useCallback((target: GazeDirection) => {
    const LERP = 0.15;
    const prev = lastGazeRef.current;
    const smoothed: GazeDirection = {
      x: prev.x + (target.x - prev.x) * LERP,
      y: prev.y + (target.y - prev.y) * LERP,
      confidence: target.confidence,
      source: target.source,
    };
    lastGazeRef.current = smoothed;
    setGaze(smoothed);
  }, []);

  // Pointer/mouse fallback tracking
  useEffect(() => {
    const handlePointer = (e: PointerEvent | MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const x = Math.max(-1, Math.min(1, (e.clientX - cx) / cx));
      const y = Math.max(-1, Math.min(1, (e.clientY - cy) / cy));
      pointerGazeRef.current = { x, y, confidence: 0.6, source: "pointer" };
    };

    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const x = Math.max(-1, Math.min(1, (touch.clientX - cx) / cx));
      const y = Math.max(-1, Math.min(1, (touch.clientY - cy) / cy));
      pointerGazeRef.current = { x, y, confidence: 0.6, source: "pointer" };
    };

    // DeviceOrientation for mobile gyroscope tracking
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      // gamma: left/right tilt (-90 to 90), beta: front/back tilt (-180 to 180)
      const x = Math.max(-1, Math.min(1, e.gamma / 30));
      const y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      pointerGazeRef.current = { x, y, confidence: 0.7, source: "pointer" };
    };

    window.addEventListener("pointermove", handlePointer, { passive: true });
    window.addEventListener("touchmove", handleTouch, { passive: true });
    window.addEventListener("deviceorientation", handleOrientation, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("touchmove", handleTouch);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  // Pointer fallback animation loop (when no face tracking)
  useEffect(() => {
    if (!enabled) return;

    let running = true;
    const tick = () => {
      if (!running) return;
      // Only use pointer if face tracking isn't active
      if (!cameraActive) {
        smoothGaze(pointerGazeRef.current);
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [enabled, cameraActive, smoothGaze]);

  // MediaPipe FaceMesh initialization
  useEffect(() => {
    if (!enabled) return;

    let scriptLoaded = false;

    const initFaceMesh = async () => {
      try {
        // Create hidden video element for camera feed
        const video = document.createElement("video");
        video.style.display = "none";
        video.setAttribute("playsinline", "true");
        document.body.appendChild(video);
        videoRef.current = video;

        // Load MediaPipe FaceMesh from CDN
        const loadScript = (src: string) =>
          new Promise<void>((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
              resolve();
              return;
            }
            const s = document.createElement("script");
            s.src = src;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(s);
          });

        await loadScript(
          "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
        );

        scriptLoaded = true;

        const FaceMesh = window.FaceMesh;
        const Camera = window.Camera;

        if (!FaceMesh || !Camera) {
          throw new Error("MediaPipe not available");
        }

        const faceMesh = new FaceMesh({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true, // Required for iris landmarks (468, 473)
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results: any) => {
          if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            // No face detected — fall back to pointer
            setCameraActive(false);
            return;
          }

          setCameraActive(true);
          const landmarks = results.multiFaceLandmarks[0];

          // Extract iris positions (requires refineLandmarks: true)
          const leftIris = landmarks[LEFT_IRIS_CENTER];
          const rightIris = landmarks[RIGHT_IRIS_CENTER];

          if (!leftIris || !rightIris) return;

          // Get eye corner landmarks to normalize iris position within eye
          const leftEyeLeft = landmarks[LEFT_EYE_LEFT];
          const leftEyeRight = landmarks[LEFT_EYE_RIGHT];
          const rightEyeLeft = landmarks[RIGHT_EYE_LEFT];
          const rightEyeRight = landmarks[RIGHT_EYE_RIGHT];

          // Calculate iris position relative to eye width
          const leftEyeWidth = Math.abs(leftEyeRight.x - leftEyeLeft.x);
          const rightEyeWidth = Math.abs(rightEyeRight.x - rightEyeLeft.x);

          const leftGazeX = leftEyeWidth > 0
            ? ((leftIris.x - leftEyeLeft.x) / leftEyeWidth - 0.5) * 2
            : 0;
          const rightGazeX = rightEyeWidth > 0
            ? ((rightIris.x - rightEyeLeft.x) / rightEyeWidth - 0.5) * 2
            : 0;

          // Average both eyes for more stable reading
          const gazeX = (leftGazeX + rightGazeX) / 2;

          // Y gaze: use face center vertical position as proxy
          const noseTip = landmarks[1]; // Nose tip
          const gazeY = noseTip ? (noseTip.y - 0.5) * 2 : 0;

          smoothGaze({
            x: Math.max(-1, Math.min(1, gazeX * 2)), // amplify slightly
            y: Math.max(-1, Math.min(1, gazeY)),
            confidence: 0.9,
            source: "face",
          });
        });

        faceMeshRef.current = faceMesh;

        // Start camera
        const camera = new Camera(video, {
          onFrame: async () => {
            await faceMesh.send({ image: video });
          },
          width: 320,
          height: 240,
          facingMode: "user",
        });

        await camera.start();
        cameraRef.current = camera;
        setCameraActive(true);
      } catch (err: any) {
        console.warn("[useFaceTracking] Face tracking unavailable:", err.message);
        setError(err.message);
        setCameraActive(false);
        // Silently fall back to pointer tracking — no error shown to user
      }
    };

    initFaceMesh();

    return () => {
      if (cameraRef.current) {
        try { cameraRef.current.stop(); } catch {}
      }
      if (faceMeshRef.current) {
        try { faceMeshRef.current.close(); } catch {}
      }
      if (videoRef.current) {
        videoRef.current.remove();
        videoRef.current = null;
      }
    };
  }, [enabled, smoothGaze]);

  return { gaze, cameraActive, error };
}
