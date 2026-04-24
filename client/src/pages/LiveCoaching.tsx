// client/src/pages/LiveCoaching.tsx — v4.0
// Fixes: camera permission state machine, Grok-only pipeline, streaming voice, premium UX
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Video, VideoOff, Mic, MicOff, Zap, Activity,
  ChevronLeft, Settings, CameraOff, AlertTriangle,
  CheckCircle, RefreshCw, FlipHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";
const PANTHER_IDLE = `${CDN}/jarvis_idle_420b45a0.mp4`;

function getMemberContext(): string {
  try {
    const raw = localStorage.getItem("tuf_member") || localStorage.getItem("tuf_profile");
    if (!raw) return "";
    const data = JSON.parse(raw) as Record<string, string>;
    const lines: string[] = [];
    if (data.name) lines.push(`Name: ${data.name}`);
    if (data.goal) lines.push(`Goal: ${data.goal}`);
    if (data.conditions) lines.push(`Health notes: ${data.conditions}`);
    return lines.join(", ");
  } catch { return ""; }
}

type CameraPermission = "unknown" | "requesting" | "granted" | "denied" | "unavailable" | "error";
type CoachingState = "idle" | "capturing" | "analyzing" | "coaching" | "speaking" | "error";

interface CoachingCycle {
  id: string;
  cue: string;
  formScore?: number;
  timestamp: Date;
}

const EXERCISE_OPTIONS = [
  "General movement","Squats","Deadlifts","Push-ups","Lunges",
  "Rows","Shoulder Press","Hip Hinges","Plank","Step-ups",
  "RDL","Bulgarian Split Squat",
];

const PERMISSION_MESSAGES: Record<string, { title: string; body: string; action: string }> = {
  NotAllowedError: {
    title: "Camera Permission Denied",
    body: "Panther needs your camera to coach your form. Tap the camera icon in your browser address bar and allow access.",
    action: "Try Again",
  },
  NotFoundError: {
    title: "No Camera Found",
    body: "No camera was detected. Use the app on a phone or laptop with a built-in camera for live coaching.",
    action: "Try Again",
  },
  NotReadableError: {
    title: "Camera In Use",
    body: "Your camera is being used by another app. Close other apps using the camera and try again.",
    action: "Try Again",
  },
  default: {
    title: "Camera Error",
    body: "Could not access your camera. Make sure you are using Chrome or Safari and have granted camera permission.",
    action: "Try Again",
  },
};

export default function LiveCoaching() {
  const [cameraPermission, setCameraPermission] = useState<CameraPermission>("unknown");
  const [cameraError, setCameraError] = useState<{ name: string } | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isMirrored, setIsMirrored] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [coachingActive, setCoachingActive] = useState(false);
  const [coachingState, setCoachingState] = useState<CoachingState>("idle");
  const [currentCue, setCurrentCue] = useState<string>("");
  const [history, setHistory] = useState<CoachingCycle[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("General movement");
  const [showSettings, setShowSettings] = useState(false);
  const [intervalSecs, setIntervalSecs] = useState(5);
  const [consecutiveMistakes, setConsecutiveMistakes] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const pantherVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const coachingStateRef = useRef<CoachingState>("idle");

  useEffect(() => { coachingStateRef.current = coachingState; }, [coachingState]);
  const memberContext = getMemberContext();
  const cameraGranted = cameraPermission === "granted";

  const startCamera = useCallback(async (facing: "user" | "environment" = "user") => {
    setCameraPermission("requesting");
    setCameraError(null);
    const constraints: MediaStreamConstraints[] = [
      { video: { facingMode: facing, width: { ideal: 640 }, height: { ideal: 480 } }, audio: false },
      { video: { facingMode: facing }, audio: false },
      { video: true, audio: false },
    ];
    for (const constraint of constraints) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraint);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraPermission("granted");
        return;
      } catch (err: any) {
        const isLast = constraint === constraints[constraints.length - 1];
        if (!isLast && (err.name === "OverconstrainedError" || err.name === "NotFoundError")) continue;
        setCameraError({ name: err.name });
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") setCameraPermission("denied");
        else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") setCameraPermission("unavailable");
        else setCameraPermission("error");
        return;
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraPermission("unknown");
    setCameraError(null);
  }, []);

  const flipCamera = useCallback(async () => {
    const newFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacing);
    setIsMirrored(newFacing === "user");
    if (cameraGranted) { stopCamera(); await startCamera(newFacing); }
  }, [facingMode, cameraGranted, stopCamera, startCamera]);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;
    canvas.width = 640; canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    if (isMirrored) {
      ctx.save(); ctx.scale(-1, 1); ctx.drawImage(video, -640, 0, 640, 480); ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0, 640, 480);
    }
    return canvas.toDataURL("image/jpeg", 0.7).replace(/^data:image\/jpeg;base64,/, "");
  }, [isMirrored]);

  const speakCue = useCallback(async (text: string) => {
    if (!audioEnabled) return;
    try {
      const res = await fetch("/api/voice/speak/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, personality: "calm_intense" }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { URL.revokeObjectURL(url); setCoachingState("idle"); };
      audio.onerror = () => { URL.revokeObjectURL(url); setCoachingState("idle"); };
      await audio.play();
    } catch {
      if ("speechSynthesis" in window) {
        const utt = new SpeechSynthesisUtterance(text);
        utt.rate = 0.95; utt.pitch = 0.85;
        utt.onend = () => setCoachingState("idle");
        window.speechSynthesis.speak(utt);
      } else { setCoachingState("idle"); }
    }
  }, [audioEnabled]);

  const runCoachingCycle = useCallback(async () => {
    if (coachingStateRef.current === "analyzing" || coachingStateRef.current === "speaking") return;
    const frame = captureFrame();
    if (!frame) return;
    setCoachingState("analyzing");
    try {
      const res = await fetch("/api/coaching/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frame,
          exerciseContext: selectedExercise !== "General movement" ? selectedExercise : undefined,
          memberContext: memberContext || undefined,
          audioEnabled: false,
          consecutiveMistakes,
        }),
      });
      if (!res.ok) { const err = await res.json() as { error?: string }; throw new Error(err.error || "Pipeline failed"); }
      const data = await res.json() as {
        cue: string;
        decision?: { action: string; urgency: string };
        analysis?: { form_score?: number };
      };
      setCoachingState("coaching");
      setCurrentCue(data.cue);
      if (data.decision?.action === "correct" || data.decision?.action === "regress") setConsecutiveMistakes(p => p + 1);
      else setConsecutiveMistakes(0);
      setHistory(prev => [{ id: crypto.randomUUID(), cue: data.cue, formScore: data.analysis?.form_score, timestamp: new Date() }, ...prev.slice(0, 9)]);
      if (audioEnabled && data.cue && data.decision?.action !== "silence") {
        setCoachingState("speaking");
        await speakCue(data.cue);
      } else { setTimeout(() => setCoachingState("idle"), 2500); }
    } catch (err: any) {
      console.error("[LiveCoaching] cycle error:", err);
      setCoachingState("error");
      const msg = err.message?.includes("XAI_API_KEY") ? "Grok Vision not configured."
        : err.message?.includes("ANTHROPIC") ? "Panther Brain not configured."
        : "Analysis failed — retrying...";
      setCurrentCue(msg);
      setTimeout(() => { setCoachingState("idle"); setCurrentCue(""); }, 3000);
    }
  }, [captureFrame, selectedExercise, memberContext, audioEnabled, consecutiveMistakes, speakCue]);

  const toggleCoaching = useCallback(() => {
    if (coachingActive) {
      setCoachingActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.speechSynthesis?.cancel();
      setCoachingState("idle"); setCurrentCue(""); setConsecutiveMistakes(0);
    } else {
      setCoachingActive(true);
      setCoachingState("capturing");
      if (audioEnabled) speakCue(`Starting live coaching for ${selectedExercise}. Show me your form.`);
      setTimeout(runCoachingCycle, 1500);
      intervalRef.current = setInterval(runCoachingCycle, intervalSecs * 1000);
    }
  }, [coachingActive, runCoachingCycle, intervalSecs, audioEnabled, selectedExercise, speakCue]);

  useEffect(() => {
    return () => { stopCamera(); if (intervalRef.current) clearInterval(intervalRef.current); window.speechSynthesis?.cancel(); };
  }, [stopCamera]);

  const stateColor: Record<CoachingState, string> = {
    idle: "text-muted-foreground", capturing: "text-blue-400", analyzing: "text-yellow-400",
    coaching: "text-green-400", speaking: "text-orange-400", error: "text-red-400",
  };
  const stateLabel: Record<CoachingState, string> = {
    idle: "READY", capturing: "CAPTURING", analyzing: "ANALYZING",
    coaching: "COACHING", speaking: "SPEAKING", error: "ERROR",
  };
  const permInfo = cameraError ? (PERMISSION_MESSAGES[cameraError.name] ?? PERMISSION_MESSAGES.default) : null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <canvas ref={canvasRef} className="hidden" />
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/panther"><button className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><ChevronLeft className="w-5 h-5" /></button></Link>
          <div>
            <h1 className="font-bold text-sm tracking-wide" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}>LIVE COACHING</h1>
            <p className="text-[10px] text-muted-foreground">Camera · Panther Brain · Voice</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-full border ${coachingState === "error" ? "border-red-500/30 bg-red-500/10 text-red-400" : coachingActive ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground"}`}>
            <Activity className={`w-3 h-3 ${coachingActive ? "animate-pulse" : ""}`} />
            <span className={stateColor[coachingState]}>{stateLabel[coachingState]}</span>
          </div>
          <button onClick={() => setShowSettings(s => !s)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Settings className="w-4 h-4 text-muted-foreground" /></button>
        </div>
      </div>

      {showSettings && (
        <div className="mx-4 mt-3 rounded-2xl bg-card border border-border p-4 space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Session Settings</h3>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Exercise</label>
            <div className="flex flex-wrap gap-1.5">
              {EXERCISE_OPTIONS.map(ex => (
                <button key={ex} onClick={() => setSelectedExercise(ex)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${selectedExercise === ex ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{ex}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Analysis interval: every {intervalSecs}s</label>
            <input type="range" min={3} max={15} step={1} value={intervalSecs} onChange={e => setIntervalSecs(Number(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>3s (intense)</span><span>15s (relaxed)</span></div>
          </div>
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-2" style={{ height: 280 }}>
          <div className="relative bg-black rounded-xl overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" style={{ transform: isMirrored ? "scaleX(-1)" : "none" }} playsInline muted autoPlay />
            {!cameraGranted && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80">
                {cameraPermission === "requesting" ? (<><RefreshCw className="w-6 h-6 text-primary animate-spin" /><p className="text-xs text-muted-foreground">Requesting...</p></>)
                  : cameraPermission === "denied" ? (<><AlertTriangle className="w-6 h-6 text-red-400" /><p className="text-xs text-red-400 text-center px-2">Camera blocked</p><p className="text-[10px] text-muted-foreground text-center px-2">Allow in browser settings</p></>)
                  : cameraPermission === "unavailable" ? (<><CameraOff className="w-6 h-6 text-muted-foreground" /><p className="text-xs text-muted-foreground text-center px-2">No camera found</p><p className="text-[10px] text-muted-foreground text-center px-2">Use on phone or laptop</p></>)
                  : (<><VideoOff className="w-6 h-6 text-muted-foreground" /><p className="text-xs text-muted-foreground">Camera off</p></>)}
              </div>
            )}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-bold tracking-wider text-white">YOU</div>
            {cameraGranted && (<button onClick={flipCamera} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"><FlipHorizontal className="w-3.5 h-3.5" /></button>)}
            {coachingState === "analyzing" && (<div className="absolute inset-0 rounded-xl border-2 border-yellow-400 animate-pulse pointer-events-none" />)}
          </div>
          <div className="relative bg-black rounded-xl overflow-hidden">
            <video ref={pantherVideoRef} src={PANTHER_IDLE} className="w-full h-full object-cover" autoPlay loop muted playsInline />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-bold tracking-wider text-primary">PANTHER BRAIN</div>
            {coachingState === "speaking" && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-0.5 items-end">
                {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="w-1 bg-primary rounded-full animate-pulse" style={{ height: `${6 + (i % 3) * 5}px`, animationDelay: `${i * 60}ms` }} />))}
              </div>
            )}
            {coachingState === "analyzing" && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/30">
                  <RefreshCw className="w-3 h-3 text-yellow-400 animate-spin" />
                  <span className="text-[10px] text-yellow-400 font-mono">ANALYZING</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {permInfo && !cameraGranted && cameraPermission !== "unknown" && cameraPermission !== "requesting" && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" /><p className="text-sm font-bold text-red-400">{permInfo.title}</p></div>
            <p className="text-xs text-muted-foreground leading-relaxed">{permInfo.body}</p>
            <button onClick={() => startCamera(facingMode)} className="text-xs font-bold text-primary hover:underline">{permInfo.action} →</button>
          </div>
        )}

        <div className={`rounded-2xl p-4 border transition-all duration-300 min-h-[72px] flex items-center ${coachingState === "coaching" || coachingState === "speaking" ? "bg-card border-primary/40 shadow-[0_0_20px_rgba(255,102,0,0.08)]" : coachingState === "error" ? "bg-red-500/5 border-red-500/20" : "bg-secondary border-border"}`}>
          {currentCue ? (
            <div className="space-y-1 w-full">
              <p className="text-sm leading-relaxed font-medium">{currentCue}</p>
              {coachingActive && (<div className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-primary" /><p className="text-[10px] text-muted-foreground font-mono">{selectedExercise} · every {intervalSecs}s</p></div>)}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{cameraGranted ? coachingActive ? "Watching your form..." : "Camera ready. Start coaching to get real-time feedback." : "Turn on your camera to begin live coaching."}</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button onClick={cameraGranted ? stopCamera : () => startCamera(facingMode)} variant={cameraGranted ? "destructive" : "outline"} className="flex-1 rounded-xl" disabled={cameraPermission === "requesting"}>
            {cameraPermission === "requesting" ? (<><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Requesting...</>) : cameraGranted ? (<><VideoOff className="w-4 h-4 mr-2" /> Camera Off</>) : (<><Video className="w-4 h-4 mr-2" /> Camera On</>)}
          </Button>
          <Button onClick={() => setAudioEnabled(a => !a)} variant="outline" size="icon" className={`rounded-xl flex-shrink-0 ${audioEnabled ? "border-primary/30 text-primary" : "opacity-50"}`}>
            {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>
        </div>

        <Button onClick={toggleCoaching} disabled={!cameraGranted}
          className={`w-full rounded-xl font-black tracking-widest h-12 text-sm transition-all ${coachingActive ? "bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]" : cameraGranted ? "bg-primary text-white shadow-[0_0_20px_rgba(255,102,0,0.3)]" : "bg-secondary text-muted-foreground"}`}
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          {coachingActive ? (<><Activity className="w-4 h-4 mr-2 animate-pulse" /> STOP COACHING</>) : (<><Zap className="w-4 h-4 mr-2" /> START COACHING</>)}
        </Button>

        {history.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Session Log</h3>
            <div className="space-y-2">
              {history.map((item, idx) => (
                <div key={item.id} className={`rounded-xl p-3 border border-border ${idx === 0 ? "bg-card" : "bg-secondary/40"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm leading-relaxed flex-1">{item.cue}</p>
                    {item.formScore !== undefined && (<span className={`text-xs font-bold flex-shrink-0 ${item.formScore >= 80 ? "text-green-400" : item.formScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>{item.formScore}</span>)}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">{item.timestamp.toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-secondary/50 p-4 border border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">AI Pipeline</p>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[{ label: "Camera", ok: cameraGranted }, { label: "Grok Vision", ok: true }, { label: "Panther Brain", ok: true }, { label: "ElevenLabs", ok: audioEnabled }].map((item, i, arr) => (
              <span key={i} className="contents">
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${item.ok ? "bg-background border-border text-foreground" : "bg-background border-border text-muted-foreground/50"}`}>
                  {item.ok && <CheckCircle className="w-2.5 h-2.5 text-green-400" />}{item.label}
                </span>
                {i < arr.length - 1 && <span className="text-muted-foreground/40">→</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
