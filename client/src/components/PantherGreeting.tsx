/**
 * PantherGreeting — Living TUF Panther home screen greeting
 *
 * Features:
 * - TUF Panther character with 3 pose images (forward, eyes-left, eyes-right)
 * - MediaPipe FaceMesh eye gaze tracking via useFaceTracking hook
 * - CSS animated pupils that follow user's actual eye movement
 * - Personalized voice greeting (ElevenLabs / Marc's voice)
 * - Time-of-day salutation, user name, streak, today's workout
 * - Waveform animation while Panther is speaking
 *
 * © Turned Up Fitness LLC — All rights reserved
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useFaceTracking } from "../hooks/useFaceTracking";

// TUF Panther CDN image assets
const PANTHER_IMAGES = {
  forward:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/tuf-panther-greeting-ESeBHyzR6SRGK7EVBdb9Yw.png",
  left: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/tuf-panther-greeting-eyes-left-XwSz9JaUDKrMa6oRfv7GDn.png",
  right:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/tuf-panther-greeting-eyes-right-fVQuAiL8KdEJGWxVchMy84.png",
};

// Gaze thresholds for image switching
const GAZE_LEFT_THRESHOLD = -0.25;
const GAZE_RIGHT_THRESHOLD = 0.25;

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function getUserName(): string {
  try {
    const profile = localStorage.getItem("tuf_profile");
    if (profile) {
      const parsed = JSON.parse(profile);
      if (parsed.name) return parsed.name.split(" ")[0];
    }
    const name = localStorage.getItem("tuf_user_name");
    if (name) return name.split(" ")[0];
  } catch {}
  return "Champion";
}

function getStreak(): number {
  try {
    const streak = localStorage.getItem("tuf_streak");
    return streak ? parseInt(streak, 10) : 0;
  } catch {}
  return 0;
}

function getTodayWorkout(): string | null {
  try {
    const schedule = localStorage.getItem("tuf_workout_schedule");
    if (!schedule) return null;
    const parsed = JSON.parse(schedule);
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return parsed[today] || null;
  } catch {}
  return null;
}

function buildGreetingScript(name: string, timeOfDay: string, streak: number, workout: string | null): string {
  let script = `Good ${timeOfDay}, ${name}.`;

  if (workout) {
    script += ` Today is ${workout} day.`;
  } else {
    script += ` Today is your recovery day — rest up and stay hydrated.`;
  }

  if (streak >= 7) {
    script += ` ${streak} days strong — you're on fire.`;
  } else if (streak >= 3) {
    script += ` ${streak}-day streak. Keep the momentum.`;
  } else if (streak >= 1) {
    script += ` Day ${streak} — let's build that streak.`;
  }

  script += ` Let's get after it.`;
  return script;
}

// Waveform bar component
function WaveformBar({ active, index }: { active: boolean; index: number }) {
  const heights = [16, 24, 32, 20, 28, 36, 22, 18, 30, 26];
  const h = heights[index % heights.length];
  return (
    <div
      className="rounded-full transition-all"
      style={{
        width: 3,
        height: active ? h : 4,
        backgroundColor: active ? "#f97316" : "#374151",
        transition: `height ${0.2 + (index % 3) * 0.1}s ease-in-out`,
        animation: active ? `waveform-pulse ${0.4 + (index % 4) * 0.15}s ease-in-out infinite alternate` : "none",
      }}
    />
  );
}

interface PantherGreetingProps {
  className?: string;
  onGreetingComplete?: () => void;
}

export function PantherGreeting({ className = "", onGreetingComplete }: PantherGreetingProps) {
  const { gaze, cameraActive } = useFaceTracking(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [greetingText, setGreetingText] = useState("");
  const [hasGreeted, setHasGreeted] = useState(false);
  const [pantherPose, setPantherPose] = useState<"forward" | "left" | "right">("forward");
  const [imageLoaded, setImageLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const greetingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine panther pose based on gaze direction
  useEffect(() => {
    if (gaze.x < GAZE_LEFT_THRESHOLD) {
      setPantherPose("left");
    } else if (gaze.x > GAZE_RIGHT_THRESHOLD) {
      setPantherPose("right");
    } else {
      setPantherPose("forward");
    }
  }, [gaze.x]);

  // Build and speak greeting on mount
  const speakGreeting = useCallback(async () => {
    if (hasGreeted) return;
    setHasGreeted(true);

    const name = getUserName();
    const timeOfDay = getTimeOfDay();
    const streak = getStreak();
    const workout = getTodayWorkout();
    const script = buildGreetingScript(name, timeOfDay, streak, workout);
    setGreetingText(script);

    // Small delay to let the component settle
    await new Promise((r) => setTimeout(r, 800));

    try {
      setIsSpeaking(true);

      const response = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: script,
          voiceKey: "panther",
          personality: "calm_intense",
        }),
      });

      if (!response.ok) throw new Error("Voice API error");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        onGreetingComplete?.();
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };

      await audio.play();
    } catch (err) {
      console.warn("[PantherGreeting] Voice failed, using silent mode:", err);
      setIsSpeaking(false);
      // Still show the text even if voice fails
    }
  }, [hasGreeted, onGreetingComplete]);

  // Trigger greeting after a short delay (allows user interaction first for autoplay policy)
  useEffect(() => {
    greetingTimerRef.current = setTimeout(() => {
      speakGreeting();
    }, 1200);

    return () => {
      if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [speakGreeting]);

  // Preload all panther images
  useEffect(() => {
    const imgs = Object.values(PANTHER_IMAGES);
    let loaded = 0;
    imgs.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (loaded === imgs.length) setImageLoaded(true);
      };
      img.src = src;
    });
  }, []);

  const currentImage = PANTHER_IMAGES[pantherPose];

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Dark gym atmosphere background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(249,115,22,0.12) 0%, rgba(0,0,0,0.95) 60%, #000 100%)",
        }}
      />

      {/* Ambient orange accent light from above */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #f97316 0%, transparent 70%)" }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-4 pt-6 pb-4">

        {/* Panther image with gaze-reactive pose switching */}
        <div
          className="relative w-full max-w-xs mx-auto"
          style={{ aspectRatio: "3/4" }}
        >
          {/* Camera status indicator */}
          {cameraActive && (
            <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400 font-medium">TRACKING</span>
            </div>
          )}

          {/* Panther image — switches between forward/left/right based on gaze */}
          <div className="relative w-full h-full">
            {/* Forward pose (base) */}
            <img
              src={PANTHER_IMAGES.forward}
              alt="TUF Panther"
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-150"
              style={{ opacity: pantherPose === "forward" ? 1 : 0 }}
              onLoad={() => setImageLoaded(true)}
            />
            {/* Eyes-left pose */}
            <img
              src={PANTHER_IMAGES.left}
              alt="TUF Panther looking left"
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-150"
              style={{ opacity: pantherPose === "left" ? 1 : 0 }}
            />
            {/* Eyes-right pose */}
            <img
              src={PANTHER_IMAGES.right}
              alt="TUF Panther looking right"
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-150"
              style={{ opacity: pantherPose === "right" ? 1 : 0 }}
            />

            {/* Speaking glow effect around panther when talking */}
            {isSpeaking && (
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  boxShadow: "0 0 40px 10px rgba(249,115,22,0.25)",
                  animation: "panther-glow 0.8s ease-in-out infinite alternate",
                }}
              />
            )}
          </div>
        </div>

        {/* Greeting text */}
        <div className="w-full mt-3 px-2">
          {greetingText ? (
            <p
              className="text-center text-sm leading-relaxed font-medium"
              style={{ color: isSpeaking ? "#f97316" : "#d1d5db" }}
            >
              {greetingText}
            </p>
          ) : (
            <div className="flex justify-center gap-1 py-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Waveform visualizer — shows when speaking */}
        <div
          className="flex items-center justify-center gap-0.5 mt-3 h-10"
          style={{ opacity: isSpeaking ? 1 : 0.2, transition: "opacity 0.3s" }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <WaveformBar key={i} active={isSpeaking} index={i} />
          ))}
        </div>

        {/* Tap to greet button — shown if greeting hasn't started yet */}
        {!hasGreeted && !greetingText && (
          <button
            onClick={speakGreeting}
            className="mt-3 px-6 py-2 rounded-full text-sm font-semibold text-black"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
          >
            Tap to Greet
          </button>
        )}

        {/* Replay button — shown after greeting completes */}
        {hasGreeted && !isSpeaking && greetingText && (
          <button
            onClick={() => {
              setHasGreeted(false);
              setGreetingText("");
              setTimeout(speakGreeting, 100);
            }}
            className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-400 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Replay
          </button>
        )}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes waveform-pulse {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }
        @keyframes panther-glow {
          from { box-shadow: 0 0 20px 5px rgba(249,115,22,0.15); }
          to { box-shadow: 0 0 60px 20px rgba(249,115,22,0.35); }
        }
      `}</style>
    </div>
  );
}

export default PantherGreeting;
