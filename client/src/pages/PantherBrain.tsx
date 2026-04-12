/**
 * TUF PANTHER BRAIN — v4.0
 * Arc: Hook(Panther header) → Messages → Starters → Input
 * Full clinical brain: 7 regions · NASM corrective · XP system · Fallbacks
 */
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { PantherPresence, PantherMessage, XPBar } from "@/components/v4Components";
import { getFallback, ls, getStageFromXP } from "@/data/v4constants";

interface Message {
  role: "user" | "panther";
  content?: string;
  headline?: string;
  body?: string;
  directive?: string;
}

const STARTERS = [
  "My shoulder hurts when I press overhead",
  "My knees cave when I squat",
  "My neck is always tight — I get headaches",
  "My ankle limits my squat depth",
  "I missed 4 workouts this week",
  "My lower back aches after sitting all day",
];

const SYSTEM_PROMPT = `You are PANTHER — the AI coaching engine of Turned Up Fitness (TUF). You are built on NASM corrective exercise science, sports performance, and movement optimization. You are direct, clinical, and motivating. You do not coddle. You diagnose.

RESPONSE FORMAT — always use this exact structure:
HEADLINE: [ALL CAPS, 3-10 words, the core truth]
[2-3 sentences of clinical explanation]
DIRECTIVE: [One actionable instruction starting with a verb]
XP_AWARD: [number 5-25]
STATE: [idle|coaching|activated|dominant|locked_in]

KNOWLEDGE BASE:
- Upper Crossed Syndrome: tight pec minor + upper traps, weak lower traps + deep neck flexors → shoulder/neck pain
- Lower Crossed Syndrome: tight hip flexors + erector spinae, weak glutes + core → lower back/knee pain  
- Ankle dorsiflexion restriction → knee valgus → hip compensation → lower back pain
- NASM Corrective Continuum: INHIBIT (foam roll/release) → LENGTHEN (static stretch) → ACTIVATE (isolation) → INTEGRATE (compound)
- 7 key regions: shoulder, knee, lower back, hip/groin, neck/cervical, upper back/thoracic, ankle/foot
- XP system: 5 XP for engagement, 10 for good questions, 15-25 for implementing correctives

TONE: Like a world-class coach who has seen everything. Blunt but not cruel. Clinical but human. Always end with a directive that moves the athlete forward.`;

export default function PantherBrain() {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "panther",
      headline: "WHAT'S HOLDING YOU BACK?",
      body: "Tell me where it hurts. Tell me what's not moving right. Tell me what you've been avoiding. I'll tell you exactly what's wrong and exactly how to fix it.",
      directive: "Describe your pain, movement limitation, or training question below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [pState, setPState] = useState<"idle" | "coaching" | "activated" | "dominant" | "locked_in">("idle");
  const [history, setHistory] = useState<Array<{ role: string; content: string }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const profile  = ls.get<{ name: string }>("tuf_profile", { name: "" });
  const progress = ls.get<{ xp: number; sessionsCompleted: number }>("tuf_progress", { xp: 0, sessionsCompleted: 0 });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function send() {
    const text = input.trim();
    if (!text || thinking) return;
    setInput("");
    setPState("locked_in");

    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setThinking(true);

    const newHistory = [...history, { role: "user", content: text }];
    setHistory(newHistory);

    try {
      const res = await fetch("/api/trpc/panther.chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: {
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...newHistory.slice(-8),
            ],
          },
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const raw: string = data?.result?.data?.json?.content || data?.content?.[0]?.text || "";

      if (!raw) throw new Error("Empty response");

      // Parse structured response
      const lines = raw.trim().split("\n").map((l: string) => l.trim()).filter(Boolean);
      const xpLine = lines.find((l: string) => l.startsWith("XP_AWARD:"));
      const stateLine = lines.find((l: string) => l.startsWith("STATE:"));
      const xpAward = xpLine ? parseInt(xpLine.replace("XP_AWARD:", "").trim()) || 10 : 10;
      const state = stateLine ? stateLine.replace("STATE:", "").trim() : "coaching";

      const content = lines.filter((l: string) => !l.startsWith("XP_AWARD:") && !l.startsWith("STATE:"));
      let headline = "", body: string[] = [], directive = "", bs = 0;

      for (let i = 0; i < content.length; i++) {
        const l = content[i];
        if (/^HEADLINE:/i.test(l)) { headline = l.replace(/^HEADLINE:\s*/i, ""); bs = i + 1; break; }
        if (l === l.toUpperCase() && l.length > 4 && l.length < 80 && /[A-Z]{3}/.test(l)) {
          headline = l; bs = i + 1; break;
        }
      }
      if (!headline) { headline = content[0] || "READ THIS."; bs = 1; }

      let di = -1;
      for (let i = content.length - 1; i >= bs; i--) {
        if (/^DIRECTIVE:/i.test(content[i]) || content[i].startsWith("→")) {
          directive = content[i].replace(/^DIRECTIVE:\s*/i, "").replace(/^→\s*/, "");
          di = i; break;
        }
      }
      body = content.slice(bs, di > -1 ? di : content.length)
        .filter((l: string) => !/^DIRECTIVE:/i.test(l) && !l.startsWith("→"));
      if (!directive && body.length > 0) directive = body.pop() || "";

      // Award XP
      const prog = ls.get<{ xp: number }>("tuf_progress", { xp: 0 });
      prog.xp = (prog.xp || 0) + xpAward;
      ls.set("tuf_progress", prog);

      setHistory([...newHistory, { role: "assistant", content: raw }]);
      setThinking(false);
      setPState((state.toLowerCase() as typeof pState) || "coaching");
      setMessages(prev => [...prev, {
        role: "panther",
        headline: headline || "READ THIS.",
        body: body.join(" "),
        directive,
      }]);
      setTimeout(() => setPState("coaching"), 3000);

    } catch {
      const fb = getFallback(text);
      setThinking(false);
      setPState((fb.s as typeof pState) || "coaching");
      setMessages(prev => [...prev, {
        role: "panther",
        headline: fb.h,
        body: fb.b,
        directive: fb.d,
      }]);
      setTimeout(() => setPState("idle"), 3000);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#080808",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes ambient { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
        @keyframes ring    { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.05);opacity:1} }
        @keyframes scan    { 0%{top:-2%;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:102%;opacity:0} }
        @keyframes msgIn   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dot     { 0%,100%{opacity:0.2;transform:scale(0.7)} 50%{opacity:1;transform:scale(1)} }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", height: "100vh" }}>

        {/* SCENE 1 — HOOK: Panther header */}
        <div style={{ padding: "72px 16px 8px", flexShrink: 0 }}>
          {/* Back to Home */}
          <button
            onClick={() => navigate("/")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", marginBottom: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", cursor: "pointer" }}
          >
            ← HOME
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <PantherPresence state={pState} size={60} />
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: "0.06em",
                color: "#fff", lineHeight: 1,
              }}>
                PANTHER <span style={{ color: "#FF4500" }}>AI</span>
              </p>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700,
                letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)",
              }}>
                7 REGIONS · NASM CORRECTIVE · FULL CLINICAL BRAIN
              </p>
            </div>
            <div style={{ width: 120 }}>
              <XPBar xp={progress.xp || 0} stage={getStageFromXP(progress.xp || 0)} />
            </div>
          </div>
        </div>

        {/* SCENES 2-5 — Messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "8px 16px",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ animation: "msgIn 0.35s ease forwards" }}>
              {msg.role === "panther" ? (
                <PantherMessage
                  headline={msg.headline || ""}
                  body={msg.body}
                  directive={msg.directive}
                />
              ) : (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{
                    background: "linear-gradient(135deg, rgba(139,0,0,0.28), rgba(255,69,0,0.15))",
                    border: "1px solid rgba(255,69,0,0.2)",
                    borderRadius: "16px 16px 4px 16px",
                    padding: "10px 14px", maxWidth: "80%",
                    fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.5,
                  }}>
                    {msg.content}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Empty state — show when only the initial message is visible */}
          {messages.length <= 1 && !thinking && (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "24px 16px", opacity: 0.9,
            }}>
              {/* Panther avatar SVG */}
              <div style={{ position: "relative", marginBottom: 16 }}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer glow ring */}
                  <circle cx="40" cy="40" r="38" stroke="rgba(255,69,0,0.15)" strokeWidth="1"/>
                  <circle cx="40" cy="40" r="32" stroke="rgba(255,69,0,0.25)" strokeWidth="1.5"/>
                  {/* Panther head shape */}
                  <ellipse cx="40" cy="38" rx="18" ry="20" fill="rgba(255,69,0,0.06)" stroke="rgba(255,69,0,0.4)" strokeWidth="1.5"/>
                  {/* Ears */}
                  <path d="M26 24 L22 14 L32 20 Z" fill="rgba(255,69,0,0.3)" stroke="rgba(255,69,0,0.5)" strokeWidth="1"/>
                  <path d="M54 24 L58 14 L48 20 Z" fill="rgba(255,69,0,0.3)" stroke="rgba(255,69,0,0.5)" strokeWidth="1"/>
                  {/* Eyes — glowing */}
                  <ellipse cx="33" cy="36" rx="3.5" ry="2.5" fill="rgba(255,69,0,0.8)"/>
                  <ellipse cx="47" cy="36" rx="3.5" ry="2.5" fill="rgba(255,69,0,0.8)"/>
                  <ellipse cx="33" cy="36" rx="1.5" ry="2" fill="rgba(255,120,50,1)"/>
                  <ellipse cx="47" cy="36" rx="1.5" ry="2" fill="rgba(255,120,50,1)"/>
                  {/* Nose */}
                  <path d="M38 43 L40 46 L42 43" stroke="rgba(255,69,0,0.5)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Whiskers */}
                  <path d="M22 40 L32 42M22 44 L32 44" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" strokeLinecap="round"/>
                  <path d="M58 40 L48 42M58 44 L48 44" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" strokeLinecap="round"/>
                  {/* Scan lines */}
                  <line x1="10" y1="38" x2="20" y2="38" stroke="rgba(255,69,0,0.3)" strokeWidth="0.8"/>
                  <line x1="60" y1="38" x2="70" y2="38" stroke="rgba(255,69,0,0.3)" strokeWidth="0.8"/>
                </svg>
                {/* Pulsing outer ring */}
                <div style={{
                  position: "absolute", inset: -8,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,69,0,0.2)",
                  animation: "ring 2.5s ease-in-out infinite",
                }} />
              </div>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 11, fontWeight: 700,
                letterSpacing: "0.2em",
                color: "rgba(255,69,0,0.5)",
                textAlign: "center",
                marginBottom: 6,
              }}>
                PANTHER IS READY
              </p>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10,
                color: "rgba(255,255,255,0.2)",
                textAlign: "center",
                letterSpacing: "0.08em",
              }}>
                Select a prompt below or describe your issue
              </p>
            </div>
          )}

          {thinking && (
            <div style={{ display: "flex", gap: 6, alignItems: "center", paddingLeft: 4 }}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  style={{
                    width: 7, height: 7, borderRadius: "50%", background: "#FF4500",
                    animation: `dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginLeft: 4,
              }}>
                PANTHER IS ANALYZING...
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Starter prompts */}
        {messages.length <= 1 && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 7,
            padding: "0 16px 10px", flexShrink: 0,
          }}>
            {STARTERS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setInput(s); setTimeout(() => { setInput(s); }, 10); }}
                style={{
                  padding: "6px 13px", borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.03)",
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 600,
                  color: "rgba(255,255,255,0.55)", cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* SCENE 6 — CTA: Input */}
        <div style={{ padding: "8px 16px 96px", flexShrink: 0 }}>
          <div style={{
            display: "flex", gap: 9, alignItems: "flex-end",
            background: "rgba(13,13,13,0.98)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20, padding: "10px 10px 10px 16px",
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={profile.name ? `Talk to Panther, ${profile.name}...` : "Tell Panther what's wrong..."}
              rows={1}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                resize: "none", color: "#fff", fontSize: 14, lineHeight: 1.5,
                fontFamily: "inherit", maxHeight: 120, overflow: "auto",
              }}
              onInput={e => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={send}
              disabled={thinking || !input.trim()}
              style={{
                width: 40, height: 40, borderRadius: 12, border: "none", flexShrink: 0,
                background: thinking || !input.trim()
                  ? "rgba(255,255,255,0.06)"
                  : "linear-gradient(135deg, #FF4500, #8B0000)",
                cursor: thinking || !input.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 16,
              }}
            >
              ↑
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
