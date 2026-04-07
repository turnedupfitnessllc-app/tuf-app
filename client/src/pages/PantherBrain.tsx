/**
 * PantherBrain.tsx — Panther AI Coaching Interface
 * Full implementation per panther-brain.pdf spec
 * Neural paths: Claude Sonnet via /api/jarvis/stream (server-side, secure)
 * Response format: HEADLINE / BODY / DIRECTIVE
 */
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type BrainState = "idle" | "thinking" | "coaching";

interface ParsedResponse {
  headline: string;
  body: string;
  directive: string;
}

interface PantherMessage {
  id: string;
  role: "panther" | "user";
  headline?: string;
  body?: string;
  directive?: string;
  text?: string; // user messages only
  timestamp: Date;
}

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── Panther Image CDN ────────────────────────────────────────────────────────
const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";
const PANTHER_IMG = `${CDN}/panther-up_950a85bd.png`;

// ─── Offline Fallbacks ────────────────────────────────────────────────────────
const FALLBACKS: { triggers: string[]; headline: string; body: string; directive: string }[] = [
  {
    triggers: ["back", "lumbar", "sitting", "spine"],
    headline: "THAT'S YOUR HIP FLEXORS.",
    body: "Lower back pain from sitting is almost never a back problem. Tight hip flexors from hours in a chair pull your pelvis forward and compress your lumbar. Lower Crossed Syndrome. The back is taking the load your glutes should be carrying.",
    directive: "Foam roll hip flexors 60 sec each side right now. Then 15 glute bridges. The back pain will shift.",
  },
  {
    triggers: ["missed", "skip", "haven't", "didn't", "days off", "no workout"],
    headline: "BETTER OR WORSE. CHOOSE.",
    body: "You've been away. That's not neutral — that's a direction. The fog you're feeling right now? That's exactly what consistent training fights. There is no middle ground.",
    directive: "Log one movement today. Five minutes minimum. The streak starts now.",
  },
  {
    triggers: ["weight", "lose", "fat", "scale", "calories", "diet", "eat", "food"],
    headline: "THE MATH DOESN'T CARE ABOUT MOOD.",
    body: "Caloric deficit is the foundation of fat loss. One pound of fat is 3,500 calories. Track fat loss, not scale weight — daily fluctuations are 2-5 lbs of water and timing, not fat. The mechanism is simple. The execution is the work.",
    directive: "Map out your meals for tomorrow before you sleep tonight. Times and portions, not just foods.",
  },
  {
    triggers: ["old", "age", "47", "48", "50", "40", "45", "too late", "can't build"],
    headline: "40+ IS WHERE IT STARTS.",
    body: "Most people show up after the diagnosis. You're here before it. You're not declining — you're building. The new healthy is 40+. Your body responds to progressive overload at any age. The science is clear.",
    directive: "Complete your profile with current measurements today. That's your baseline. Everything else is progress.",
  },
  {
    triggers: ["expensive", "cost", "price", "afford", "too much", "money"],
    headline: "PRICE VS COST. KNOW THE DIFFERENCE.",
    body: "The price is fixed. The cost of staying where you are — medications, lost energy, years you don't get back — that's the number you should be running. You don't negotiate your cardiologist's rate. Prevention IS healthcare.",
    directive: "Decide today. Not because of the price — because of what the alternative costs you.",
  },
  {
    triggers: ["shoulder", "neck", "posture", "rounded", "hunched", "upper"],
    headline: "UPPER CROSSED SYNDROME. FIXABLE.",
    body: "Tight pecs and anterior shoulders pulling your head forward. Weak mid-back and deep neck flexors doing nothing. Eight hours at a screen compounds it daily. This is a pattern, not a permanent condition.",
    directive: "Chin tucks 2x10, band pull-aparts 2x15, chest stretch 30 sec each side. Before anything else today.",
  },
  {
    triggers: ["knee", "squat", "glute", "hip", "leg", "valgus"],
    headline: "YOUR GLUTES ARE OFFLINE.",
    body: "Knee pain during squats is almost always a glute activation problem. Valgus collapse — knees caving in — means your glutes aren't firing to stabilize the hip. We fix the pattern, not just the symptom.",
    directive: "Clamshells 2x15 each side, single-leg glute bridges 2x12. Then retest your squat.",
  },
  {
    triggers: ["tired", "fog", "energy", "exhausted", "motivation", "unmotivated"],
    headline: "MOVE FIRST. CLARITY FOLLOWS.",
    body: "The fog isn't a sleep problem or a caffeine problem. It's a movement problem. Endorphins are the most effective fog-lifter available — no prescription required. Physical and mental health are one system.",
    directive: "20 minutes of movement today. Walk, circuit, anything. Do not negotiate the duration.",
  },
];

function getFallback(text: string): ParsedResponse {
  const lower = text.toLowerCase();
  for (const f of FALLBACKS) {
    if (f.triggers.some((t) => lower.includes(t))) {
      return { headline: f.headline, body: f.body, directive: f.directive };
    }
  }
  return {
    headline: "BETTER OR WORSE. CHOOSE.",
    body: "There is no neutral in this. Every day you move is a deposit. Every day you don't is a withdrawal. The account doesn't lie.",
    directive: "Tell me what's actually going on. Movement issue, missed sessions, nutrition, or something else.",
  };
}

// ─── Parse Claude's streaming response into structured format ─────────────────
function parseResponse(text: string): ParsedResponse {
  const lines = text.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  let headline = "";
  let body: string[] = [];
  let directive = "";
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^HEADLINE:/i.test(l)) {
      headline = l.replace(/^HEADLINE:\s*/i, "").replace(/[\[\]]/g, "").trim();
      bodyStart = i + 1;
    } else if (!headline && l === l.toUpperCase() && l.length > 4 && l.length < 80 && /[A-Z]{3}/.test(l)) {
      headline = l;
      bodyStart = i + 1;
    }
  }
  if (!headline) { headline = lines[0] || "READ THIS."; bodyStart = 1; }

  let dIdx = -1;
  for (let i = lines.length - 1; i >= bodyStart; i--) {
    if (/^DIRECTIVE:/i.test(lines[i]) || lines[i].startsWith("→")) {
      directive = lines[i].replace(/^DIRECTIVE:\s*/i, "").replace(/^→\s*/, "").trim();
      dIdx = i;
      break;
    }
  }

  body = lines
    .slice(bodyStart, dIdx > -1 ? dIdx : lines.length)
    .filter((l) => !/^DIRECTIVE:/i.test(l) && !l.startsWith("→"));
  if (!directive && body.length > 0) directive = body.pop() || "";

  return {
    headline: headline || "READ THIS.",
    body: body.join(" "),
    directive,
  };
}

// ─── Panther Eye SVG ──────────────────────────────────────────────────────────
function PantherEye({ state }: { state: BrainState }) {
  const pupilY = state === "thinking" ? 8 : state === "coaching" ? 10 : 12;
  const glowColor = state === "thinking" ? "#C8973A" : "#FF4500";
  return (
    <svg viewBox="0 0 60 40" style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.6" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <ellipse cx="30" cy="20" rx="28" ry="18" fill="url(#eyeGlow)" />
      <ellipse cx="30" cy="20" rx="22" ry="14" fill="#0a0a0a" stroke={glowColor} strokeWidth="1" filter="url(#glow)" />
      <ellipse cx="30" cy={pupilY + 8} rx="10" ry="12" fill={glowColor} opacity="0.85" />
      <ellipse cx="30" cy={pupilY + 8} rx="3" ry="11" fill="#050505" />
      <ellipse cx="26" cy={pupilY + 4} rx="2.5" ry="3.5" fill="white" opacity="0.55" />
    </svg>
  );
}

// ─── Pulse Ring ───────────────────────────────────────────────────────────────
function PulseRing({ active }: { active: boolean }) {
  return (
    <div style={{
      position: "absolute", inset: -8,
      borderRadius: "50%",
      border: `1px solid rgba(255,69,0,${active ? 0.5 : 0.15})`,
      animation: active ? "pulseRing 1.5s ease-in-out infinite" : "none",
      pointerEvents: "none",
    }} />
  );
}

// ─── Think Particles ──────────────────────────────────────────────────────────
function ThinkParticles() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", borderRadius: "50%" }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 4, height: 4,
          borderRadius: "50%",
          background: i % 2 === 0 ? "#FF4500" : "#C8973A",
          left: `${20 + Math.sin(i * 1.05) * 60}%`,
          top: `${20 + Math.cos(i * 1.05) * 60}%`,
          animation: `float${i % 3} ${1.5 + i * 0.3}s ease-in-out infinite`,
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

// ─── Starter Chips ────────────────────────────────────────────────────────────
const STARTERS = [
  "My lower back kills me after sitting all day",
  "I missed my last 4 workouts",
  "I can't lose weight no matter what I eat",
  "I'm 47 — is it too late to build muscle?",
  "Your program costs too much",
];

// ─── CSS Keyframes (injected once) ───────────────────────────────────────────
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@400;600&display=swap');
  @keyframes pulseRing { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.08);opacity:0.15} }
  @keyframes float0 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(0,-8px)} }
  @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(4px,-6px)} }
  @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-4px,-7px)} }
  @keyframes scanLine { 0%{top:0%;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:100%;opacity:0} }
  @keyframes msgIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes thinkPulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
  @keyframes ambientGlow { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,69,0,0.3);border-radius:4px}
`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PantherBrain() {
  const [messages, setMessages] = useState<PantherMessage[]>([]);
  const [input, setInput] = useState("");
  const [brainState, setBrainState] = useState<BrainState>("idle");
  const [history, setHistory] = useState<ClaudeMessage[]>([]);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Inject keyframes once
  useEffect(() => {
    const id = "panther-brain-styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = KEYFRAMES;
      document.head.appendChild(style);
    }
  }, []);

  // Welcome message
  useEffect(() => {
    const t = setTimeout(() => {
      setMessages([{
        id: "welcome",
        role: "panther",
        headline: "YOU CAME TO THE RIGHT PLACE.",
        body: "I'm Panther — the AI coaching system inside Turned Up Fitness. I don't do motivation speeches. I give you the mechanism and the move. Built from NASM corrective science, real nutrition data, and the belief that 40+ is not decline — it's the build phase.",
        directive: "Tell me what's going on. Movement issue, missed sessions, nutrition, or something else.",
        timestamp: new Date(),
      }]);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || brainState === "thinking") return;

    setStarted(true);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    const userMsg: PantherMessage = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setBrainState("thinking");

    const newHistory: ClaudeMessage[] = [...history, { role: "user", content: trimmed }];

    // Placeholder for streaming response
    const pantherMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, {
      id: pantherMsgId,
      role: "panther",
      headline: "",
      body: "",
      directive: "",
      timestamp: new Date(),
    }]);

    try {
      abortRef.current = new AbortController();
      const res = await fetch("/api/jarvis/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
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
            if (delta) {
              fullText += delta;
              // Live-parse as it streams so the UI updates progressively
              const live = parseResponse(fullText);
              setMessages((prev) =>
                prev.map((m) => m.id === pantherMsgId ? { ...m, ...live } : m)
              );
            }
          } catch {}
        }
      }

      // Final parse on complete text
      const final = parseResponse(fullText);
      setMessages((prev) =>
        prev.map((m) => m.id === pantherMsgId ? { ...m, ...final } : m)
      );
      setHistory([...newHistory, { role: "assistant", content: fullText }]);
      setBrainState("coaching");
      setTimeout(() => setBrainState("idle"), 2500);

    } catch (err: any) {
      if (err?.name === "AbortError") return;
      const fallback = getFallback(trimmed);
      setMessages((prev) =>
        prev.map((m) => m.id === pantherMsgId ? { ...m, ...fallback } : m)
      );
      setHistory([...newHistory, { role: "assistant", content: `${fallback.headline}\n${fallback.body}\nDIRECTIVE: ${fallback.directive}` }]);
      setBrainState("coaching");
      setTimeout(() => setBrainState("idle"), 2500);
    }
  }, [brainState, history]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const eyeSize = brainState === "thinking" ? 110 : brainState === "coaching" ? 105 : 100;

  const imgBoxShadow =
    brainState === "thinking"
      ? "0 0 30px rgba(200,151,58,0.4), 0 0 60px rgba(139,0,0,0.3)"
      : brainState === "coaching"
      ? "0 0 40px rgba(255,69,0,0.5), 0 0 80px rgba(139,0,0,0.25)"
      : "0 0 20px rgba(255,69,0,0.15)";

  const imgBorder =
    brainState === "idle"
      ? "2px solid rgba(255,69,0,0.2)"
      : "2px solid rgba(255,69,0,0.5)";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080808",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "'Barlow', sans-serif",
      position: "relative",
      overflow: "hidden",
      paddingBottom: 80,
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 300,
        background: "radial-gradient(ellipse, rgba(139,0,0,0.15) 0%, transparent 50%)",
        pointerEvents: "none",
        animation: "ambientGlow 4s ease-in-out infinite",
      }} />

      {/* ── PANTHER HEAD SECTION ── */}
      <div style={{
        width: "100%", maxWidth: 680,
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: 32, paddingBottom: 0,
        position: "relative", zIndex: 1,
      }}>
        {/* Wordmark */}
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 11, letterSpacing: "0.3em",
          color: "rgba(255,255,255,0.3)",
          marginBottom: 24,
        }}>
          TURNED UP FITNESS · AI COACHING SYSTEM
        </div>

        {/* Panther image + eye overlay */}
        <div style={{ position: "relative", width: 200, height: 200, marginBottom: 12 }}>
          {/* Outer glow ring */}
          <div style={{
            position: "absolute", inset: -16,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, rgba(255,69,0,${brainState === "idle" ? 0.08 : 0.18}) 0%, transparent 70%)`,
            transition: "all 0.8s ease",
          }} />

          {/* Image container */}
          <div style={{
            width: 200, height: 200,
            borderRadius: "50%",
            overflow: "hidden",
            border: imgBorder,
            boxShadow: imgBoxShadow,
            transition: "all 0.6s ease",
            position: "relative",
          }}>
            <img
              src={PANTHER_IMG}
              alt="Panther"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />

            {/* Scan line — thinking state */}
            {brainState === "thinking" && (
              <div style={{
                position: "absolute", left: 0, right: 0, height: 2,
                background: "linear-gradient(90deg, transparent, rgba(200,151,58,0.8), transparent)",
                animation: "scanLine 2s linear infinite",
              }} />
            )}

            {/* Coaching flash overlay */}
            {brainState === "coaching" && (
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, rgba(255,69,0,0.15), transparent)",
              }} />
            )}
          </div>

          {/* Pulse ring */}
          <PulseRing active={brainState === "thinking" || brainState === "coaching"} />

          {/* Think particles */}
          {brainState === "thinking" && <ThinkParticles />}

          {/* Panther Eye — positioned at top of image */}
          <div style={{
            position: "absolute",
            top: "18%", left: "50%",
            transform: "translateX(-50%)",
            width: eyeSize, height: eyeSize * 0.65,
            transition: "all 0.4s ease",
            pointerEvents: "none",
          }}>
            <PantherEye state={brainState} />
          </div>

          {/* State badge */}
          <div style={{
            position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 14px", borderRadius: 20,
            background: "rgba(8,8,8,0.9)",
            border: `1px solid rgba(255,69,0,${brainState === "idle" ? 0.2 : 0.5})`,
            backdropFilter: "blur(8px)",
            whiteSpace: "nowrap",
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: brainState === "thinking" ? "#C8973A" : brainState === "coaching" ? "#FF4500" : "rgba(255,255,255,0.3)",
              boxShadow: `0 0 6px ${brainState === "thinking" ? "#C8973A" : brainState === "coaching" ? "#FF4500" : "transparent"}`,
              transition: "all 0.4s",
            }} />
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.7)",
            }}>
              {brainState === "thinking" ? "ANALYZING..." : brainState === "coaching" ? "COACHING" : "READY"}
            </span>
          </div>
        </div>

        {/* Name */}
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 48, letterSpacing: "0.1em",
          lineHeight: 1, marginTop: 20,
          color: "#fff",
        }}>
          PANTHER <span style={{ color: "#FF4500" }}>AI</span>
        </div>

        {/* Subtitle */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.3)",
          marginTop: 4, marginBottom: 28,
        }}>
          NASM · CORRECTIVE EXERCISE · NUTRITION · ACCOUNTABILITY
        </div>
      </div>

      {/* ── CHAT AREA ── */}
      <div style={{
        width: "100%", maxWidth: 680,
        flex: 1, display: "flex", flexDirection: "column",
        padding: "0 20px 20px",
        position: "relative", zIndex: 1,
      }}>
        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto",
          display: "flex", flexDirection: "column", gap: 16,
          marginBottom: 16,
          maxHeight: 400,
          paddingRight: 4,
        }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ animation: "msgIn 0.35s ease forwards" }}>
              {msg.role === "panther" ? (
                <div style={{
                  background: "rgba(17,17,17,0.95)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 20, borderTopLeftRadius: 4,
                  padding: "18px 22px",
                  position: "relative", overflow: "hidden",
                }}>
                  {/* Left accent bar */}
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: 3,
                    background: "linear-gradient(to bottom, #8B0000, #FF4500)",
                  }} />

                  {/* Sender */}
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
                    color: "#FF4500", marginBottom: 8,
                  }}>
                    🐆 PANTHER
                  </div>

                  {/* Headline */}
                  {msg.headline && (
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 20, fontWeight: 900, letterSpacing: "0.08em",
                      color: "#fff", lineHeight: 1.2, marginBottom: 10,
                    }}>
                      {msg.headline}
                    </div>
                  )}

                  {/* Body */}
                  {msg.body && (
                    <div style={{
                      fontSize: 14, lineHeight: 1.7,
                      color: "rgba(255,255,255,0.78)",
                      marginBottom: 12,
                    }}>
                      {msg.body}
                    </div>
                  )}

                  {/* Directive */}
                  {msg.directive && (
                    <div style={{
                      padding: "10px 14px",
                      borderLeft: "2px solid #FF4500",
                      background: "rgba(255,69,0,0.07)",
                      borderRadius: "0 10px 10px 0",
                      fontSize: 13, fontWeight: 600,
                      color: "rgba(255,255,255,0.9)",
                    }}>
                      → {msg.directive}
                    </div>
                  )}

                  {/* Streaming indicator — show when all fields empty */}
                  {!msg.headline && !msg.body && !msg.directive && (
                    <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "4px 0" }}>
                      {[0, 1, 2].map((i) => (
                        <div key={i} style={{
                          width: 7, height: 7, borderRadius: "50%",
                          background: "#C8973A",
                          animation: "thinkPulse 1.2s ease-in-out infinite",
                          animationDelay: `${i * 0.2}s`,
                        }} />
                      ))}
                      <span style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
                        color: "rgba(255,255,255,0.3)",
                      }}>
                        PANTHER IS READING YOU...
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{
                    background: "linear-gradient(135deg, rgba(139,0,0,0.35), rgba(255,69,0,0.2))",
                    border: "1px solid rgba(255,69,0,0.2)",
                    borderRadius: 20, borderTopRightRadius: 4,
                    padding: "12px 18px",
                    maxWidth: "80%",
                    fontSize: 14, lineHeight: 1.65,
                    color: "rgba(255,255,255,0.88)",
                  }}>
                    {msg.text}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Thinking indicator row */}
          {brainState === "thinking" && messages[messages.length - 1]?.role !== "panther" && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", paddingLeft: 4 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#C8973A",
                  animation: "thinkPulse 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.3)",
              }}>
                PANTHER IS READING YOU...
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Starter chips */}
        {!started && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14,
          }}>
            {STARTERS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setInput(s); setTimeout(() => send(s), 50); }}
                style={{
                  padding: "7px 14px", borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.03)",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 12, cursor: "pointer",
                  fontFamily: "'Barlow', sans-serif",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.borderColor = "rgba(255,69,0,0.4)";
                  (e.target as HTMLButtonElement).style.color = "rgba(255,255,255,0.85)";
                  (e.target as HTMLButtonElement).style.background = "rgba(255,69,0,0.07)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                  (e.target as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
                  (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)";
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          background: "rgba(17,17,17,0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16, padding: "8px 8px 8px 16px",
          boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
          display: "flex", gap: 10, alignItems: "flex-end",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 100) + "px";
            }}
            placeholder="Tell Panther what's going on..."
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#fff", fontSize: 14, fontFamily: "'Barlow', sans-serif",
              lineHeight: 1.5, resize: "none", minHeight: 24, maxHeight: 100,
              padding: "6px 0",
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={brainState === "thinking" || !input.trim()}
            style={{
              width: 40, height: 40, borderRadius: 10, border: "none",
              background: brainState === "thinking" || !input.trim()
                ? "rgba(255,69,0,0.2)"
                : "linear-gradient(135deg, #8B0000, #FF4500)",
              color: "#fff", cursor: brainState === "thinking" || !input.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", flexShrink: 0,
              boxShadow: input.trim() ? "0 4px 16px rgba(255,69,0,0.3)" : "none",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center", marginTop: 12,
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 10, letterSpacing: "0.15em",
          color: "rgba(255,255,255,0.2)",
        }}>
          PANTHER · TURNED UP FITNESS · BUILT FOR THE 40+ ATHLETE
        </div>
      </div>
    </div>
  );
}
