// client/src/pages/LiveCoaching.tsx
// Real-time AI coaching: Camera → fal.ai vision → The Panther System → ElevenLabs TTS
import { useState, useRef, useEffect, useCallback } from "react";
import { Video, VideoOff, Mic, MicOff, Zap, Activity, ChevronLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";
const JARVIS_IDLE = `${CDN}/jarvis_idle_420b45a0.mp4`;

// Pull member data from localStorage (set during JARVIS onboarding)
function getMemberContext(): string {
  try {
    const raw = localStorage.getItem("tuf_member");
    if (!raw) return "";
    const data = JSON.parse(raw) as Record<string, string>;
    const lines: string[] = [];
    if (data.name) lines.push(`Name: ${data.name}`);
    if (data.goal) lines.push(`Goal: ${data.goal}`);
    if (data.conditions) lines.push(`Health notes: ${data.conditions}`);
    return lines.join(", ");
  } catch {
    return "";
  }
}

type CoachingState = "idle" | "capturing" | "analyzing" | "coaching" | "speaking" | "error";

interface CoachingCycle {
  id: string;
  description: string;
  cue: string;
  timestamp: Date;
}

const EXERCISE_OPTIONS = [
  "Squats",
  "Deadlifts",
  "Push-ups",
  "Lunges",
  "Rows",
  "Shoulder Press",
  "Hip Hinges",
  "Plank",
  "Step-ups",
  "General movement",
];

export default function LiveCoaching() {
  const [cameraActive, setCameraActive] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [coachingActive, setCoachingActive] = useState(false);
  const [state, setState] = useState<CoachingState>("idle");
  const [currentCue, setCurrentCue] = useState<string>("");
  const [history, setHistory] = useState<CoachingCycle[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("General movement");
  const [showSettings, setShowSettings] = useState(false);
  const [intervalSecs, setIntervalSecs] = useState(3);
  const [serviceStatus, setServiceStatus] = useState<{
    fal: boolean; anthropic: boolean; elevenlabs: boolean;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const jarvisVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const memberContext = getMemberContext();

  // Check service health on mount
  useEffect(() => {
    fetch("/api/coaching/health")
      .then(r => r.json())
      .then(data => setServiceStatus(data.services))
      .catch(() => {});
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Camera error:", err);
      setState("error");
      setCurrentCue("Camera access denied. Allow camera permissions and try again.");
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setCoachingActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // Capture a frame from the camera as base64 JPEG
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !cameraActive) return null;

    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, 640, 480);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    // Strip the data URL prefix to get raw base64
    return dataUrl.replace(/^data:image\/jpeg;base64,/, "");
  }, [cameraActive]);

  // Run one coaching cycle
  const runCoachingCycle = useCallback(async () => {
    if (state === "analyzing" || state === "speaking") return; // Don't overlap cycles

    const frame = captureFrame();
    if (!frame) return;

    setState("analyzing");

    try {
      const res = await fetch("/api/coaching/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frame,
          exerciseContext: selectedExercise !== "General movement" ? selectedExercise : undefined,
          memberContext: memberContext || undefined,
          audioEnabled,
        }),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error || "Pipeline failed");
      }

      const data = await res.json() as {
        description: string;
        cue: string;
        audioBase64?: string;
      };

      setState("coaching");
      setCurrentCue(data.cue);

      // Add to history
      setHistory(prev => [
        {
          id: crypto.randomUUID(),
          description: data.description,
          cue: data.cue,
          timestamp: new Date(),
        },
        ...prev.slice(0, 9), // Keep last 10
      ]);

      // Play audio if available
      if (data.audioBase64 && audioEnabled) {
        setState("speaking");
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioBase64), c => c.charCodeAt(0))],
          { type: "audio/mpeg" }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play().catch(() => {});
          audioRef.current.onended = () => {
            URL.revokeObjectURL(audioUrl);
            setState("idle");
          };
        } else {
          setState("idle");
        }
      } else {
        setTimeout(() => setState("idle"), 2000);
      }
    } catch (err: any) {
      console.error("[LiveCoaching] cycle error:", err);
      setState("error");
      setCurrentCue(err.message || "Analysis failed. Check API keys.");
      setTimeout(() => setState("idle"), 3000);
    }
  }, [state, captureFrame, selectedExercise, memberContext, audioEnabled]);

  // Start/stop coaching interval
  const toggleCoaching = useCallback(() => {
    if (coachingActive) {
      setCoachingActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setState("idle");
      setCurrentCue("");
    } else {
      setCoachingActive(true);
      setState("capturing");
      // Run immediately, then every N seconds
      runCoachingCycle();
      intervalRef.current = setInterval(runCoachingCycle, intervalSecs * 1000);
    }
  }, [coachingActive, runCoachingCycle, intervalSecs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [stopCamera]);

  const stateColors: Record<CoachingState, string> = {
    idle: "text-muted-foreground",
    capturing: "text-blue-500",
    analyzing: "text-yellow-500",
    coaching: "text-green-500",
    speaking: "text-primary",
    error: "text-red-500",
  };

  const stateLabels: Record<CoachingState, string> = {
    idle: "READY",
    capturing: "CAPTURING",
    analyzing: "ANALYZING",
    coaching: "COACHING",
    speaking: "SPEAKING",
    error: "ERROR",
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />
      {/* Hidden audio element */}
      <audio ref={audioRef} className="hidden" />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/panther">
            <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="font-bold text-sm" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              LIVE COACHING
            </h1>
            <p className="text-xs text-muted-foreground">Camera · Panther Brain · Voice</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Status indicator */}
          <div className={`flex items-center gap-1.5 text-xs font-mono ${stateColors[state]}`}>
            <Activity className="w-3.5 h-3.5" />
            {stateLabels[state]}
          </div>
          <button
            onClick={() => setShowSettings(s => !s)}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="mx-4 mt-3 p-4 rounded-2xl bg-card border border-border">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Coaching Settings
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Exercise</label>
              <select
                value={selectedExercise}
                onChange={e => setSelectedExercise(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
              >
                {EXERCISE_OPTIONS.map(ex => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Analysis interval: {intervalSecs}s
              </label>
              <input
                type="range"
                min={3}
                max={10}
                value={intervalSecs}
                onChange={e => setIntervalSecs(Number(e.target.value))}
                className="w-full"
              />
            </div>
            {serviceStatus && (
              <div className="pt-1 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1.5">API Status</p>
                <div className="flex gap-3 text-xs">
                  <span className={serviceStatus.fal ? "text-green-500" : "text-red-500"}>
                    {serviceStatus.fal ? "✓" : "✗"} fal.ai
                  </span>
                  <span className={serviceStatus.anthropic ? "text-green-500" : "text-red-500"}>
                    {serviceStatus.anthropic ? "✓" : "✗"} Claude
                  </span>
                  <span className={serviceStatus.elevenlabs ? "text-green-500" : "text-red-500"}>
                    {serviceStatus.elevenlabs ? "✓" : "✗"} ElevenLabs
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        {/* Main coaching area */}
        <div className="grid grid-cols-2 gap-3">
          {/* Camera feed */}
          <div className="relative rounded-2xl overflow-hidden bg-secondary aspect-[4/3]">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]" // Mirror for selfie view
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <VideoOff className="w-8 h-8 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Camera off</p>
              </div>
            )}
            {/* Camera label */}
            <div className="absolute top-2 left-2 bg-black/60 rounded-lg px-2 py-0.5">
              <p className="text-[10px] text-white font-mono">YOU</p>
            </div>
            {/* Analyzing overlay */}
            {(state === "analyzing") && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panther Brain avatar */}
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
            <video
              ref={jarvisVideoRef}
              src={JARVIS_IDLE}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Panther Brain label */}
            <div className="absolute top-2 left-2 bg-black/60 rounded-lg px-2 py-0.5">
              <p className="text-[10px] text-white font-mono" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                PANTHER BRAIN
              </p>
            </div>
            {/* Speaking pulse */}
            {state === "speaking" && (
              <div className="absolute bottom-2 left-2 right-2 flex justify-center">
                <div className="flex gap-0.5 items-center">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary rounded-full animate-pulse"
                      style={{
                        height: `${4 + Math.random() * 12}px`,
                        animationDelay: `${i * 80}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Current coaching cue */}
        <div className={`rounded-2xl p-4 border transition-all duration-300 ${
          state === "coaching" || state === "speaking"
            ? "bg-card border-primary/30 shadow-sm"
            : "bg-secondary border-border"
        }`}>
          {currentCue ? (
            <p className="text-sm leading-relaxed font-medium">{currentCue}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {cameraActive
                ? "Start coaching to get real-time form feedback."
                : "Turn on your camera to begin."}
            </p>
          )}
          {coachingActive && (
            <div className="flex items-center gap-1.5 mt-2">
              <Zap className="w-3 h-3 text-primary" />
              <p className="text-[10px] text-muted-foreground font-mono">
                Analyzing every {intervalSecs}s · {selectedExercise}
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <Button
            onClick={cameraActive ? stopCamera : startCamera}
            variant={cameraActive ? "destructive" : "outline"}
            className="flex-1 rounded-xl"
          >
            {cameraActive ? (
              <><VideoOff className="w-4 h-4 mr-2" /> Camera Off</>
            ) : (
              <><Video className="w-4 h-4 mr-2" /> Camera On</>
            )}
          </Button>

          <Button
            onClick={() => setAudioEnabled(a => !a)}
            variant="outline"
            size="icon"
            className={`rounded-xl flex-shrink-0 ${audioEnabled ? "" : "opacity-50"}`}
          >
            {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>
        </div>

        {/* Start/Stop coaching */}
        <Button
          onClick={toggleCoaching}
          disabled={!cameraActive}
          className={`w-full rounded-xl font-bold tracking-wide ${
            coachingActive
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-primary text-white"
          }`}
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          {coachingActive ? (
            <><Activity className="w-4 h-4 mr-2 animate-pulse" /> STOP COACHING</>
          ) : (
            <><Zap className="w-4 h-4 mr-2" /> START COACHING</>
          )}
        </Button>

        {/* Coaching history */}
        {history.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Session Log
            </h3>
            <div className="space-y-2">
              {history.map((item, idx) => (
                <div
                  key={item.id}
                  className={`rounded-xl p-3 border border-border ${idx === 0 ? "bg-card" : "bg-secondary/50"}`}
                >
                  <p className="text-sm leading-relaxed">{item.cue}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                    {item.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pipeline info */}
        <div className="rounded-2xl bg-secondary p-4 border border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            AI Pipeline
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="bg-background rounded px-1.5 py-0.5 border border-border">Camera</span>
            <span>→</span>
            <span className="bg-background rounded px-1.5 py-0.5 border border-border">fal.ai Vision</span>
            <span>→</span>
            <span className="bg-background rounded px-1.5 py-0.5 border border-border">The Panther System</span>
            <span>→</span>
            <span className="bg-background rounded px-1.5 py-0.5 border border-border">ElevenLabs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
