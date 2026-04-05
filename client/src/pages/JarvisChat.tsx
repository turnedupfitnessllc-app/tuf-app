import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const JARVIS_VIDEOS = {
  idle:        "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis_idle_420b45a0.mp4",
  stomp:       "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis_stomp_061292f0.mp4",
  ready:       "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis_ready_22d685b1.mp4",
  materialize: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/jarvis_materialize_4799f0eb.mp4",
};

const ONBOARDING = [
  { key: "name",       q: "What's your name? I'll personalize everything for you." },
  { key: "goal",       q: "What's your primary fitness goal — build muscle, lose fat, improve endurance, or something else?" },
  { key: "conditions", q: "Any health conditions or injuries I should know about? (e.g. arthritis, diabetes, bad knees — or just say none)" },
];

type Message = { id: string; role: "user" | "jarvis"; content: string; timestamp: Date };
type Profile = { name?: string; goal?: string; conditions?: string };
type VideoState = "idle" | "stomp" | "ready" | "materialize";

export default function JarvisChat() {
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState("");
  const [isLoading, setIsLoading]       = useState(false);
  const [isStreaming, setIsStreaming]   = useState(false);
  const [videoState, setVideoState]     = useState<VideoState>("materialize");
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

  const speakText = useCallback((text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text.slice(0, 300));
    utt.rate = 0.9; utt.pitch = 0.8; utt.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const deep = voices.find(v => /male|daniel|alex|david/i.test(v.name));
    if (deep) utt.voice = deep;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend   = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
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

    const systemPrompt = `You are JARVIS — the elite AI fitness coach for Turned Up Fitness (TUF). You are embodied as a powerful black panther wearing TUF gear. You are intense, motivating, direct, and knowledgeable. User profile: Name: ${profile.name || "unknown"}, Goal: ${profile.goal || "general fitness"}, Health conditions: ${profile.conditions || "none"}. Keep responses concise (2-4 sentences), punchy, and motivating. Be specific and powerful.`;

    const history = messages.slice(-8).map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }));
    const jarvisId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: jarvisId, role: "jarvis", content: "", timestamp: new Date() }]);

    try {
      abortRef.current = new AbortController();
      const res = await fetch("/api/jarvis/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, systemPrompt, history }),
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
      setVideoState("stomp");
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

  const statusLabel = isStreaming ? "RESPONDING" : isSpeaking ? "SPEAKING" : isListening ? "LISTENING" : "READY";
  const statusColor = isStreaming ? "bg-primary glow-pulse" : isSpeaking ? "bg-accent glow-pulse" : "bg-green-400";

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

        <div className="mt-3 flex items-center justify-center gap-1">
          <span className="text-[10px] text-muted-foreground/40 font-mono">AI powered by</span>
          <a href="https://x.ai" target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors font-mono">Grok xAI</a>
        </div>
      </div>
    </div>
  );
}
