import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Send, Mic, MicOff, Volume2, VolumeX, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";
const JARVIS_VIDEOS = {
  // Original states
  idle:            `${CDN}/jarvis_idle_420b45a0.mp4`,
  stomp:           `${CDN}/jarvis_stomp_061292f0.mp4`,
  ready:           `${CDN}/jarvis_ready_22d685b1.mp4`,
  materialize:     `${CDN}/jarvis_materialize_4799f0eb.mp4`,
  // New movement states
  idleFlex:        `${CDN}/jarvis-idle-flex_ba34833b.mp4`,
  squat:           `${CDN}/jarvis-squat_29894acb.mp4`,
  martialArts:     `${CDN}/jarvis-martial-arts_e0b5e10f.mp4`,
  sprintStance:    `${CDN}/jarvis-sprint-stance_a110b221.mp4`,
  highKnees:       `${CDN}/jarvis-high-knees_39ea0db8.mp4`,
  walkForward:     `${CDN}/jarvis-walk-forward_7a4d2ac5.mp4`,
  powerPose:       `${CDN}/jarvis-power-pose_05e6e1f9.mp4`,
  lungeStretch:    `${CDN}/jarvis-lunge-stretch_5b0b7c7f.mp4`,
  squatLungeFlex:  `${CDN}/jarvis-squat-lunge-flex_96c7bdc9.mp4`,
  snarl:           `${CDN}/jarvis-snarl_d63dad14.mp4`,
  roar:            `${CDN}/jarvis-roar_c3a368a6.mp4`,
  combatStance:    `${CDN}/jarvis-combat-stance_aae0a723.mp4`,
  runKickFlex:     `${CDN}/jarvis-run-kick-flex_e7629990.mp4`,
  strengthMontage: `${CDN}/jarvis-strength-montage_89d7eee5.mp4`,
} as const;

// Pick a contextual response video based on the user's message keywords
function pickResponseVideo(msg: string): keyof typeof JARVIS_VIDEOS {
  const m = msg.toLowerCase();
  if (/squat|leg|quad|glute|lower body/.test(m))           return "squat";
  if (/cardio|run|sprint|hiit|endurance|fast/.test(m))     return "sprintStance";
  if (/jump|explosive|power|plyometric|high knee/.test(m)) return "highKnees";
  if (/stretch|flex|mobility|recovery|yoga/.test(m))       return "lungeStretch";
  if (/fight|combat|martial|kick|punch/.test(m))           return "martialArts";
  if (/strength|lift|deadlift|bench|barbell|dumbbell/.test(m)) return "strengthMontage";
  if (/motivat|hype|pump|let.s go|fire|push/.test(m))     return "roar";
  if (/walk|move|start|begin|warm/.test(m))                return "walkForward";
  if (/pose|show|look|body/.test(m))                       return "powerPose";
  if (/full body|circuit|combo|total/.test(m))             return "squatLungeFlex";
  const defaults = ["stomp", "idleFlex", "combatStance", "runKickFlex", "snarl"] as const;
  return defaults[Math.floor(Math.random() * defaults.length)];
}

const ONBOARDING = [
  { key: "name",       q: "What's your name? I'll personalize everything for you." },
  { key: "goal",       q: "What's your primary fitness goal — build muscle, lose fat, improve endurance, or something else?" },
  { key: "conditions", q: "Any health conditions or injuries I should know about? (e.g. arthritis, diabetes, bad knees — or just say none)" },
];

type Message = { id: string; role: "user" | "jarvis"; content: string; timestamp: Date };
type Profile = { name?: string; goal?: string; conditions?: string };
type VideoState = keyof typeof JARVIS_VIDEOS;

export default function JarvisChat() {
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState("");
  const [isLoading, setIsLoading]       = useState(false);
  const [isStreaming, setIsStreaming]   = useState(false);
  const [videoState, setVideoState]     = useState<VideoState>("materialize");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGeneratingMotion, setIsGeneratingMotion] = useState(false);
  const [isListening, setIsListening]   = useState(false);
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [profile, setProfile]           = useState<Profile>({});
  const [onboardStep, setOnboardStep]   = useState<number | null>(0);

  const videoRef       = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const abortRef       = useRef<AbortController | null>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const t = setTimeout(() => {
      setVideoState("idle");
      setTimeout(() => {
        const intro: Message = {
          id: "intro", role: "jarvis",
          content: "I'm JARVIS — your AI coach built for pressure. Let's build something real. " + ONBOARDING[0].q,
          timestamp: new Date(),
        };
        setMessages([intro]);
      }, 1200);
    }, 3200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.src = JARVIS_VIDEOS[videoState];
    v.loop = videoState === "idle";
    v.play().catch(() => {});
    if (videoState !== "idle") {
      v.onended = () => { setVideoState("idle"); v.onended = null; };
    }
  }, [videoState]);

  // ElevenLabs TTS — Panther's real voice
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakText = useCallback(async (text: string) => {
    if (!voiceEnabled) return;
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(true);
    try {
      const res = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 500), voiceKey: "panther" }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };
      await audio.play();
    } catch {
      // Fallback to browser TTS if ElevenLabs fails
      if (window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(text.slice(0, 300));
        utt.rate = 0.9; utt.pitch = 0.8; utt.volume = 1;
        utt.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utt);
      } else {
        setIsSpeaking(false);
      }
    }
  }, [voiceEnabled]);

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US"; rec.interimResults = false;
    rec.onresult = (e: any) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    rec.onerror  = () => setIsListening(false);
    rec.onend    = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => { recognitionRef.current?.stop(); setIsListening(false); }, []);

  const handleOnboard = useCallback((userText: string, currentStep: number, currentProfile: Profile) => {
    const keys = ["name", "goal", "conditions"] as const;
    const key  = keys[currentStep];
    const newProfile = { ...currentProfile, [key]: userText };
    setProfile(newProfile);
    const nextStep = currentStep + 1;
    if (nextStep < ONBOARDING.length) {
      setOnboardStep(nextStep);
      const reply: Message = { id: Date.now().toString(), role: "jarvis", content: ONBOARDING[nextStep].q, timestamp: new Date() };
      setMessages(prev => [...prev, reply]);
      if (voiceEnabled) speakText(reply.content);
    } else {
      setOnboardStep(null);
      const name = newProfile.name || "champ";
      const reply: Message = {
        id: Date.now().toString(), role: "jarvis",
        content: `Let's get to work, ${name}. Profile locked in. Ask me anything — workouts, nutrition, recovery. I'm built for this.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, reply]);
      if (voiceEnabled) speakText(reply.content);
    }
  }, [voiceEnabled, speakText]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    if (onboardStep !== null) {
      handleOnboard(text, onboardStep, profile);
      return;
    }

    setIsLoading(true);
    setIsStreaming(true);
    setVideoState("ready");

    // Build message history for Claude (last 8 exchanges)
    const history = messages.slice(-8).map(m => ({
      role: m.role === "user" ? "user" as const : "assistant" as const,
      content: m.content,
    }));
    // Add current user message
    const claudeMessages = [...history, { role: "user" as const, content: text }];

    // Build memberData from onboarding profile
    const memberData = {
      name: profile.name,
      goals: profile.goal,
      conditions: profile.conditions,
    };

    const jarvisId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: jarvisId, role: "jarvis", content: "", timestamp: new Date() }]);

    try {
      abortRef.current = new AbortController();
      const res = await fetch("/api/jarvis/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: claudeMessages, memberData }),
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error("Stream failed");
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content ?? "";
            // Skip reasoning_content tokens (internal thinking), only show final content
            if (!delta && parsed.choices?.[0]?.delta?.reasoning_content) continue;
            if (delta) {
              fullText += delta;
              setMessages(prev => prev.map(m => m.id === jarvisId ? { ...m, content: fullText } : m));
            }
          } catch {}
        }
      }
      if (voiceEnabled && fullText) speakText(fullText);
      // Play fallback pre-recorded clip immediately for responsiveness
      setVideoState(pickResponseVideo(text));
      // Asynchronously generate a brand-new Kling AI motion clip in the background
      if (fullText) {
        setIsGeneratingMotion(true);
        setGeneratedVideoUrl(null);
        fetch("/api/jarvis/motion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responseText: fullText }),
        })
          .then(r => r.json())
          .then((result: { success: boolean; videoUrl?: string }) => {
            if (result.success && result.videoUrl) {
              setGeneratedVideoUrl(result.videoUrl);
            }
          })
          .catch(() => {})
          .finally(() => setIsGeneratingMotion(false));
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages(prev => prev.map(m => m.id === jarvisId ? { ...m, content: "Connection issue. Try again." } : m));
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [isLoading, onboardStep, handleOnboard, messages, profile, voiceEnabled, speakText]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };

  const statusLabel = isGeneratingMotion ? "GENERATING MOTION" : isStreaming ? "RESPONDING" : isSpeaking ? "SPEAKING" : isListening ? "LISTENING" : "READY";
  const statusColor = isGeneratingMotion ? "bg-yellow-400 glow-pulse" : isStreaming ? "bg-primary glow-pulse" : isSpeaking ? "bg-accent glow-pulse" : "bg-green-400";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* JARVIS Video Avatar */}
        <div className="relative mb-5 rounded-2xl overflow-hidden border border-border shadow-2xl" style={{ aspectRatio: "9/16", maxHeight: "52vh" }}>
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
            <div className={`w-2 h-2 rounded-full ${statusColor}`} />
            <span className="text-[10px] font-mono text-white tracking-widest">{statusLabel}</span>
          </div>
          <button onClick={() => setVoiceEnabled(v => !v)} className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/80 transition-colors">
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-40" />}
          </button>
          <div className="absolute bottom-4 left-4">
            <div className="accent-line mb-1.5 w-12" />
            <h2 className="heading-blade-sm text-white drop-shadow-lg">JARVIS</h2>
            <p className="text-[10px] text-white/60 font-mono tracking-widest">AI COACH · TURNED UP FITNESS</p>
          </div>
        </div>

        {/* Generated Motion Preview — shows new Kling AI clip when ready */}
        {(isGeneratingMotion || generatedVideoUrl) && (
          <div className="mb-4 rounded-xl overflow-hidden border border-yellow-500/30 bg-black/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-yellow-500/20">
              <div className={`w-1.5 h-1.5 rounded-full ${isGeneratingMotion ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
              <span className="text-[9px] font-mono tracking-widest text-yellow-400/80">
                {isGeneratingMotion ? 'GENERATING NEW MOTION...' : '✦ AI-GENERATED MOVEMENT READY'}
              </span>
            </div>
            {generatedVideoUrl ? (
              <video
                key={generatedVideoUrl}
                src={generatedVideoUrl}
                className="w-full"
                style={{ maxHeight: '220px', objectFit: 'cover' }}
                autoPlay
                loop
                muted
                playsInline
                controls
              />
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-6 h-6 border-2 border-yellow-400/60 border-t-yellow-400 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-[9px] font-mono text-yellow-400/60 tracking-widest">KLING AI RENDERING...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat */}
        <div className="card-jarvis flex flex-col overflow-hidden" style={{ minHeight: "280px", maxHeight: "380px" }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Zap className="w-7 h-7 text-primary mx-auto mb-2 glow-pulse" />
                  <p className="text-xs text-muted-foreground font-mono tracking-widest">INITIALIZING JARVIS...</p>
                </div>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "jarvis" && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-white rounded-br-sm" : "bg-secondary text-foreground rounded-bl-sm border border-border"}`}>
                  {msg.content || (
                    <span className="flex gap-1 items-center py-0.5">
                      <span className="typing-dot w-1.5 h-1.5 bg-primary rounded-full inline-block" />
                      <span className="typing-dot w-1.5 h-1.5 bg-primary rounded-full inline-block" />
                      <span className="typing-dot w-1.5 h-1.5 bg-primary rounded-full inline-block" />
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border p-3">
            {onboardStep === null && messages.length > 0 && !isLoading && (
              <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                {["Today's workout", "What should I eat?", "Recovery tips"].map(p => (
                  <button key={p} onClick={() => sendMessage(p)} className="flex-shrink-0 text-xs bg-secondary border border-border rounded-full px-3 py-1 text-muted-foreground hover:text-foreground hover:border-primary transition-colors flex items-center gap-1">
                    {p} <ChevronRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input value={input} onChange={e => setInput(e.target.value)} placeholder={onboardStep !== null ? "Type your answer..." : "Ask JARVIS anything..."} disabled={isLoading} className="flex-1 bg-input border-border text-sm rounded-xl" />
              <Button type="button" variant="outline" size="icon" onClick={isListening ? stopListening : startListening} className={`rounded-xl border-border flex-shrink-0 ${isListening ? "voice-pulse bg-primary text-white border-primary" : ""}`}>
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button type="submit" disabled={isLoading || !input.trim()} className="btn-glow rounded-xl flex-shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[{ icon: "💪", label: "Strength Focus" }, { icon: "🧠", label: "Smart Adapt" }, { icon: "📊", label: "Track Progress" }].map(f => (
            <div key={f.label} className="card-exec p-3 text-center">
              <div className="text-xl mb-1">{f.icon}</div>
              <p className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">{f.label}</p>
            </div>
          ))}
        </div>

        <Link href="/live">
          <div className="mt-3 card-exec p-3 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-lg">📷</span>
              <div>
                <p className="text-xs font-bold tracking-wider uppercase">Live Coaching</p>
                <p className="text-[10px] text-muted-foreground">Camera · JARVIS · Voice</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Link>

        <div className="mt-3 flex items-center justify-center gap-1">
          <span className="text-[10px] text-muted-foreground/40 font-mono">AI powered by</span>
          <a href="https://x.ai" target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors font-mono">Grok xAI</a>
        </div>
      </div>
    </div>
  );
}
