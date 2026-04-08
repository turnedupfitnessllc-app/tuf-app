/**
 * PantherBrain.tsx — Panther Live AI Coaching Interface
 * Full implementation per panther-live.pdf spec
 * Neural paths: Claude via /api/jarvis/stream (server-side, secure)
 * Features: Client Memory System, XP/Stage progression, 6 emotional states,
 *           dynamic system prompt, streak tracking, image transitions
 */
import { useState, useEffect, useRef, useCallback } from "react";

// ─── CDN Base ─────────────────────────────────────────────────────────────────
const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";

// ─── Panther State Library ────────────────────────────────────────────────────
type PantherStateName = "IDLE" | "LOCKED_IN" | "ANALYZING" | "DOMINANT" | "ACTIVATED" | "COACHING";

const PANTHER_STATES: Record<PantherStateName, {
  img: string; label: string; glow: string; border: string;
}> = {
  IDLE:      { img: `${CDN}/panther-up_950a85bd.png`, label: "READY",      glow: "rgba(255,69,0,0.15)",   border: "rgba(255,69,0,0.2)"  },
  LOCKED_IN: { img: `${CDN}/panther-up_950a85bd.png`, label: "LOCKED IN",  glow: "rgba(200,151,58,0.35)", border: "rgba(200,151,58,0.5)"},
  ANALYZING: { img: `${CDN}/panther-up_950a85bd.png`, label: "ANALYZING",  glow: "rgba(200,151,58,0.4)",  border: "rgba(200,151,58,0.6)"},
  DOMINANT:  { img: `${CDN}/panther-up_950a85bd.png`, label: "DOMINANT",   glow: "rgba(139,0,0,0.5)",     border: "rgba(255,69,0,0.7)"  },
  ACTIVATED: { img: `${CDN}/panther-up_950a85bd.png`, label: "ACTIVATED",  glow: "rgba(255,69,0,0.55)",   border: "rgba(255,69,0,0.9)"  },
  COACHING:  { img: `${CDN}/panther-up_950a85bd.png`, label: "COACHING",   glow: "rgba(255,69,0,0.4)",    border: "rgba(255,69,0,0.6)"  },
};

// ─── Client Memory System ─────────────────────────────────────────────────────
const MEMORY_KEY = "tuf_panther_client";
const USER_ID_KEY = "tuf_user_id";

// ─── DB Sync Helpers ─────────────────────────────────────────────────────────
function getOrCreateUserId(): string {
  let uid = localStorage.getItem(USER_ID_KEY);
  if (!uid) {
    uid = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, uid);
  }
  return uid;
}

async function loadMemoryFromDB(userId: string): Promise<Partial<ClientMemory> | null> {
  try {
    const res = await fetch(`/api/db/memory/${userId}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data) return null;
    return {
      name: data.client_name || null,
      goal: data.primary_goal || null,
      primaryIssue: data.primary_issue || null,
      sessions: data.sessions_count || 0,
      totalMessages: data.total_messages || 0,
      wins: data.wins || [],
      struggles: data.struggles || [],
      missedDays: data.missed_days || 0,
      lastSeen: data.last_seen || null,
      streakDays: data.streak_days || 0,
      pantherStage: data.panther_stage || "CUB",
      xp: data.xp || 0,
      conversationHistory: data.conversation_history || [],
      milestones: data.milestones || [],
    };
  } catch { return null; }
}

async function saveMemoryToDB(userId: string, mem: ClientMemory): Promise<void> {
  try {
    await fetch("/api/db/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        client_name: mem.name,
        primary_goal: mem.goal,
        primary_issue: mem.primaryIssue,
        sessions_count: mem.sessions,
        total_messages: mem.totalMessages,
        wins: mem.wins,
        struggles: mem.struggles,
        missed_days: mem.missedDays,
        last_seen: Date.now(),
        streak_days: mem.streakDays,
        panther_stage: mem.pantherStage,
        xp: mem.xp,
        conversation_history: mem.conversationHistory.slice(-20),
        milestones: mem.milestones,
      }),
    });
  } catch { /* silent fail — localStorage is the backup */ }
}

interface ClientMemory {
  name: string | null;
  goal: string | null;
  primaryIssue: string | null;
  sessions: number;
  totalMessages: number;
  wins: string[];
  struggles: string[];
  missedDays: number;
  lastSeen: number | null;
  streakDays: number;
  pantherStage: string;
  xp: number;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  milestones: string[];
}

function createFreshMemory(): ClientMemory {
  return {
    name: null, goal: null, primaryIssue: null,
    sessions: 0, totalMessages: 0,
    wins: [], struggles: [],
    missedDays: 0, lastSeen: null, streakDays: 0,
    pantherStage: "CUB", xp: 0,
    conversationHistory: [], milestones: [],
  };
}

function loadMemory(): ClientMemory {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(MEMORY_KEY) : null;
    return raw ? JSON.parse(raw) : createFreshMemory();
  } catch { return createFreshMemory(); }
}

function saveMemory(mem: ClientMemory) {
  try { localStorage.setItem(MEMORY_KEY, JSON.stringify({ ...mem, lastSeen: Date.now() })); } catch {}
}

// ─── XP / Stage System ────────────────────────────────────────────────────────
function getStage(xp: number): string {
  if (xp < 100)  return "CUB";
  if (xp < 300)  return "STEALTH";
  if (xp < 600)  return "CONTROLLED";
  if (xp < 1000) return "DOMINANT";
  return "APEX PREDATOR";
}

function getStageColor(stage: string): string {
  const map: Record<string, string> = {
    "CUB": "#888", "STEALTH": "#4a9eff", "CONTROLLED": "#FF4500",
    "DOMINANT": "#C8973A", "APEX PREDATOR": "#22c55e",
  };
  return map[stage] || "#888";
}

// ─── Emotional State Classifier ───────────────────────────────────────────────
function classifyEmotion(text: string): PantherStateName {
  const t = text.toLowerCase();
  if (/miss|skip|didn't|haven't|no workout|been gone|fell off|quit/.test(t)) return "LOCKED_IN";
  if (/pain|hurt|ache|injury|sore|back|knee|shoulder|tight/.test(t))         return "LOCKED_IN";
  if (/can't|too old|too late|expensive|cost|afford|worth it|why/.test(t))   return "LOCKED_IN";
  if (/plateau|stuck|same|not working|no progress|nothing/.test(t))          return "LOCKED_IN";
  if (/tired|fog|no energy|exhausted|unmotivated|burnt/.test(t))             return "LOCKED_IN";
  if (/crushed|hit|pr|personal record|milestone|win|killed it|nailed/.test(t)) return "ACTIVATED";
  if (/how|what|why|explain|tell me|teach/.test(t))                          return "COACHING";
  if (/help|need|struggling|problem|issue/.test(t))                          return "LOCKED_IN";
  return "COACHING";
}

// ─── Parse Response ───────────────────────────────────────────────────────────
interface ParsedResponse {
  headline: string;
  body: string;
  directive: string;
  xpAward: number;
  state: PantherStateName;
}

function parseResponse(text: string): ParsedResponse {
  const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean);
  let xpAward = 10;
  let state: PantherStateName = "COACHING";

  // Extract XP_AWARD and STATE metadata lines
  const xpLine = lines.find(l => l.startsWith("XP_AWARD:"));
  const stateLine = lines.find(l => l.startsWith("STATE:"));
  if (xpLine) xpAward = parseInt(xpLine.replace("XP_AWARD:", "").trim()) || 10;
  if (stateLine) {
    const s = stateLine.replace("STATE:", "").trim() as PantherStateName;
    if (PANTHER_STATES[s]) state = s;
  }

  const contentLines = lines.filter(l => !l.startsWith("XP_AWARD:") && !l.startsWith("STATE:"));

  let headline = "";
  let bodyStart = 0;
  for (let i = 0; i < contentLines.length; i++) {
    const l = contentLines[i];
    if (/^HEADLINE:/i.test(l)) {
      headline = l.replace(/^HEADLINE:\s*/i, "").replace(/[\[\]]/g, "").trim();
      bodyStart = i + 1;
      break;
    }
    if (l === l.toUpperCase() && l.length > 4 && l.length < 80 && /[A-Z]{3}/.test(l)) {
      headline = l;
      bodyStart = i + 1;
      break;
    }
  }
  if (!headline) { headline = contentLines[0] || "READ THIS."; bodyStart = 1; }

  let dIdx = -1;
  for (let i = contentLines.length - 1; i >= bodyStart; i--) {
    if (/^DIRECTIVE:/i.test(contentLines[i]) || contentLines[i].startsWith("→")) {
      dIdx = i;
      break;
    }
  }

  const directive = dIdx > -1
    ? contentLines[dIdx].replace(/^DIRECTIVE:\s*/i, "").replace(/^→\s*/, "").trim()
    : "";

  const bodyLines = contentLines
    .slice(bodyStart, dIdx > -1 ? dIdx : contentLines.length)
    .filter(l => !/^DIRECTIVE:/i.test(l) && !l.startsWith("→"));

  return {
    headline: headline || "READ THIS.",
    body: bodyLines.join(" "),
    directive: directive || (bodyLines.length > 0 ? bodyLines[bodyLines.length - 1] : "Take one step forward today."),
    xpAward,
    state,
  };
}

// ─── Offline Fallbacks ────────────────────────────────────────────────────────
const FALLBACKS: { triggers: string[]; headline: string; body: string; directive: string; state: PantherStateName }[] = [
  {
    triggers: ["back", "lumbar", "sitting", "spine", "lower back"],
    headline: "THAT'S YOUR HIP FLEXORS.",
    body: "Lower back pain from sitting is almost never a back problem. Tight hip flexors from hours in a chair pull your pelvis forward and compress your lumbar. Lower Crossed Syndrome. The back is taking the load your glutes should be carrying.",
    directive: "Foam roll hip flexors 60 sec each side right now. Then 15 glute bridges.",
    state: "LOCKED_IN",
  },
  {
    triggers: ["missed", "skip", "haven't", "didn't", "days off", "no workout", "fell off"],
    headline: "BETTER OR WORSE. CHOOSE.",
    body: "You've been away. That's not neutral — that's a direction. The fog you're feeling right now? That's exactly what consistent training fights. There is no middle ground.",
    directive: "Log one movement today. Five minutes minimum. The streak starts now.",
    state: "LOCKED_IN",
  },
  {
    triggers: ["weight", "lose", "fat", "scale", "calories", "diet", "eat", "food"],
    headline: "THE MATH DOESN'T CARE ABOUT MOOD.",
    body: "Caloric deficit is the foundation of fat loss. One pound of fat is 3,500 calories. Track fat loss, not scale weight — daily fluctuations are 2-5 lbs of water and timing, not fat.",
    directive: "Map out your meals for tomorrow before you sleep tonight. Times and portions.",
    state: "COACHING",
  },
  {
    triggers: ["old", "age", "47", "48", "50", "40", "45", "too late", "can't build"],
    headline: "40+ IS WHERE IT STARTS.",
    body: "Most people show up after the diagnosis. You're here before it. You're not declining — you're building. The new healthy is 40+. Your body responds to progressive overload at any age.",
    directive: "Complete your profile with current measurements today. That's your baseline.",
    state: "COACHING",
  },
  {
    triggers: ["expensive", "cost", "price", "afford", "too much", "money"],
    headline: "PRICE VS COST. KNOW THE DIFFERENCE.",
    body: "The price is fixed. The cost of staying where you are — medications, lost energy, years you don't get back — that's the number you should be running.",
    directive: "Decide today. Not because of the price — because of what the alternative costs you.",
    state: "LOCKED_IN",
  },
  {
    triggers: ["shoulder", "neck", "posture", "rounded", "hunched", "upper"],
    headline: "UPPER CROSSED SYNDROME. FIXABLE.",
    body: "Tight pecs and anterior shoulders pulling your head forward. Weak mid-back and deep neck flexors doing nothing. Eight hours at a screen compounds it daily. This is a pattern, not a permanent condition.",
    directive: "Chin tucks 2x10, band pull-aparts 2x15, chest stretch 30 sec each side. Before anything else today.",
    state: "LOCKED_IN",
  },
  {
    triggers: ["knee", "squat", "glute", "hip", "leg", "valgus"],
    headline: "YOUR GLUTES ARE OFFLINE.",
    body: "Knee pain during squats is almost always a glute activation problem. Valgus collapse — knees caving in — means your glutes aren't firing to stabilize the hip.",
    directive: "Clamshells 2x15 each side, single-leg glute bridges 2x12. Then retest your squat.",
    state: "LOCKED_IN",
  },
  {
    triggers: ["tired", "fog", "energy", "exhausted", "motivation", "unmotivated"],
    headline: "MOVE FIRST. CLARITY FOLLOWS.",
    body: "The fog isn't a sleep problem or a caffeine problem. It's a movement problem. Endorphins are the most effective fog-lifter available — no prescription required.",
    directive: "20 minutes of movement today. Walk, circuit, anything. Do not negotiate the duration.",
    state: "LOCKED_IN",
  },
  {
    triggers: ["plateau", "stuck", "same", "not working", "no progress"],
    headline: "PLATEAU IS A SIGNAL, NOT A CEILING.",
    body: "Your body adapted. That's not failure — that's biology. Progressive overload means the stimulus must change. Same weight, same reps, same result. The variable you haven't changed is the one that matters.",
    directive: "Add 5 lbs or 2 reps to one lift this week. One change. That's the unlock.",
    state: "COACHING",
  },
];

function getFallback(text: string): ParsedResponse {
  const lower = text.toLowerCase();
  for (const f of FALLBACKS) {
    if (f.triggers.some(t => lower.includes(t))) {
      return { headline: f.headline, body: f.body, directive: f.directive, xpAward: 10, state: f.state };
    }
  }
  return {
    headline: "BETTER OR WORSE. CHOOSE.",
    body: "There is no neutral in this. Every day you move is a deposit. Every day you don't is a withdrawal. The account doesn't lie.",
    directive: "Tell me what's actually going on. Movement issue, missed sessions, nutrition, or something else.",
    xpAward: 5,
    state: "COACHING",
  };
}

// ─── Message Types ────────────────────────────────────────────────────────────
interface PantherMessage {
  id: string;
  role: "panther" | "user";
  headline?: string;
  body?: string;
  directive?: string;
  text?: string;
}

// ─── XP Bar Component ─────────────────────────────────────────────────────────
function XPBar({ xp, stage }: { xp: number; stage: string }) {
  const thresholds: Record<string, [number, number]> = {
    "CUB": [0, 100], "STEALTH": [100, 300], "CONTROLLED": [300, 600],
    "DOMINANT": [600, 1000], "APEX PREDATOR": [1000, 1000],
  };
  const [min, max] = thresholds[stage] || [0, 100];
  const pct = stage === "APEX PREDATOR" ? 100 : Math.min(100, ((xp - min) / (max - min)) * 100);
  const color = getStageColor(stage);
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)" }}>
          {stage}
        </span>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>
          {xp} XP
        </span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 2,
          transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `0 0 8px ${color}66`,
        }} />
      </div>
    </div>
  );
}

// ─── Streak Flame Component ───────────────────────────────────────────────────
function StreakFlame({ days }: { days: number }) {
  if (days === 0) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 12,
      background: "rgba(255,69,0,0.1)",
      border: "1px solid rgba(255,69,0,0.25)",
    }}>
      <span style={{ fontSize: 12 }}>🔥</span>
      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.7)" }}>
        {days}D
      </span>
    </div>
  );
}

// ─── CSS Keyframes ────────────────────────────────────────────────────────────
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@400;600&display=swap');
  @keyframes msgIn        { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes thinkDot     { 0%,100%{opacity:0.2;transform:scale(0.7)} 50%{opacity:1;transform:scale(1)} }
  @keyframes xpPop        { 0%{opacity:0;transform:translateY(0) scale(0.8)} 30%{opacity:1;transform:translateY(-8px) scale(1)} 90%{opacity:1} 100%{opacity:0;transform:translateY(-20px)} }
  @keyframes ambientPulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
  @keyframes scanLine     { 0%{top:-2%;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:102%;opacity:0} }
  @keyframes stateRing    { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.04);opacity:0.2} }
  @keyframes imgFade      { 0%{opacity:1} 50%{opacity:0.2} 100%{opacity:1} }
  @keyframes headlineIn   { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
  @keyframes directiveIn  { from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,69,0,0.3);border-radius:4px}
`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PantherBrain() {
  const [memory, setMemory]               = useState<ClientMemory>(() => loadMemory());
  const [messages, setMessages]           = useState<PantherMessage[]>([]);
  const [input, setInput]                 = useState("");
  const [pantherState, setPantherState]   = useState<PantherStateName>("IDLE");
  const [isThinking, setIsThinking]       = useState(false);
  const [xpDelta, setXpDelta]             = useState<string | null>(null);
  const [imageTransition, setImageTransition] = useState(false);
  const [userId]                          = useState<string>(() => getOrCreateUserId());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const memRef    = useRef(memory);
  memRef.current  = memory;
  // Inject keyframes once
  useEffect(() => {
    const id = "panther-live-styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = KEYFRAMES;
      document.head.appendChild(style);
    }
  }, []);
  // Load memory from DB on mount (DB takes priority over localStorage)
  useEffect(() => {
    loadMemoryFromDB(userId).then(dbMem => {
      if (dbMem && (dbMem.sessions || 0) > 0) {
        setMemory(prev => ({ ...prev, ...dbMem }));
        saveMemory({ ...loadMemory(), ...dbMem });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
  // Memory update helper — saves to both localStorage and DB
  const updateMemory = useCallback((updates: Partial<ClientMemory>) => {
    setMemory(prev => {
      const next = { ...prev, ...updates };
      saveMemory(next);
      saveMemoryToDB(userId, next);
      return next;
    });
  }, [userId]);

  // Award XP with visual feedback
  const awardXP = useCallback((amount: number, mem: ClientMemory) => {
    const newXP    = (mem.xp || 0) + amount;
    const newStage = getStage(newXP);
    setXpDelta(`+${amount} XP`);
    setTimeout(() => setXpDelta(null), 2000);
    return { xp: newXP, pantherStage: newStage };
  }, []);

  // State transition with image flash
  const transitionToState = useCallback((newState: PantherStateName) => {
    setImageTransition(true);
    setTimeout(() => {
      setPantherState(newState);
      setImageTransition(false);
    }, 150);
  }, []);

  // Boot sequence
  useEffect(() => {
    const t = setTimeout(() => {
      const mem = memRef.current;
      if (mem.name && mem.sessions > 0) {
        const daysSince = mem.lastSeen
          ? Math.floor((Date.now() - mem.lastSeen) / 86400000)
          : 0;
        const returnMsg = daysSince > 3
          ? {
              headline: `${daysSince} DAYS. LET'S GET BACK.`,
              body: `${mem.name}, the body doesn't forget — but it does adapt to inactivity. You know what needs to happen. The only question is whether today is the day you decide to stop negotiating with yourself.`,
              directive: `Start with 10 minutes. Right now. Movement first, everything else second.`,
            }
          : {
              headline: `BACK IN THE GYM, ${(mem.name || "").toUpperCase()}.`,
              body: `You showed up. That's the first rep. Last time you were here you had ${mem.xp} XP and a streak of ${mem.streakDays} days. Let's build on that.`,
              directive: `Tell me what you're working on today.`,
            };
        setMessages([{ id: "welcome", role: "panther", ...returnMsg }]);
      } else {
        setMessages([{
          id: "welcome",
          role: "panther",
          headline: "YOU CAME TO THE RIGHT PLACE.",
          body: "I'm Panther — the AI coaching system inside Turned Up Fitness. I don't do motivation speeches. I give you the mechanism and the move. Built from NASM corrective science, real nutrition data, and the belief that 40+ is not decline — it's the build phase.",
          directive: "Tell me your name and what brought you here. Let's build something.",
        }]);
      }
      setPantherState("IDLE");
      updateMemory({ sessions: (mem.sessions || 0) + 1 });
    }, 500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isThinking) return;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    const mem = memRef.current;
    let memUpdates: Partial<ClientMemory> = { totalMessages: (mem.totalMessages || 0) + 1 };

    // Detect name
    if (!mem.name) {
      const nameMatch = text.match(/(?:i'm|i am|my name is|call me|it's)\s+([A-Z][a-z]+)/i);
      if (nameMatch) memUpdates.name = nameMatch[1];
    }

    // Detect wins
    if (/crushed|hit|pr|personal record|milestone|win|killed it|nailed|did it/.test(text.toLowerCase())) {
      memUpdates.wins = [...(mem.wins || []), text.slice(0, 60)];
    }

    // Detect struggles
    if (/pain|hurt|miss|skip|plateau|stuck|tired|fog/.test(text.toLowerCase())) {
      memUpdates.struggles = [...(mem.struggles || [])].slice(-4).concat(text.slice(0, 60));
    }

    // Classify emotion → transition state
    const emotionState = classifyEmotion(text);
    transitionToState(emotionState);

    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", text }]);
    setIsThinking(true);

    const updatedMem = { ...mem, ...memUpdates };
    updateMemory(memUpdates);

    // Build conversation history for API (last 12 turns)
    const apiHistory = [
      ...updatedMem.conversationHistory.slice(-12),
      { role: "user" as const, content: text },
    ];

    // Placeholder message
    const pantherMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: pantherMsgId, role: "panther", headline: "", body: "", directive: "" }]);

    try {
      const res = await fetch("/api/jarvis/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiHistory }),
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
              const live = parseResponse(fullText);
              setMessages(prev => prev.map(m => m.id === pantherMsgId ? { ...m, ...live } : m));
            }
          } catch {}
        }
      }

      const final = parseResponse(fullText);
      setMessages(prev => prev.map(m => m.id === pantherMsgId ? { ...m, ...final } : m));

      // Award XP + update memory
      const xpUpdates = awardXP(final.xpAward, updatedMem);
      const historyUpdates = {
        conversationHistory: [
          ...apiHistory,
          { role: "assistant" as const, content: fullText },
        ].slice(-20),
        ...xpUpdates,
      };
      updateMemory(historyUpdates);

      setIsThinking(false);
      transitionToState(final.state || emotionState);
      setTimeout(() => transitionToState("COACHING"), 3000);

    } catch {
      const fallback = getFallback(text);
      setMessages(prev => prev.map(m => m.id === pantherMsgId ? { ...m, ...fallback } : m));

      const xpUpdates = awardXP(fallback.xpAward, updatedMem);
      updateMemory({
        conversationHistory: [
          ...updatedMem.conversationHistory,
          { role: "user" as const, content: text },
          { role: "assistant" as const, content: `${fallback.headline}\n${fallback.body}\nDIRECTIVE: ${fallback.directive}` },
        ].slice(-20),
        ...xpUpdates,
      });

      setIsThinking(false);
      transitionToState(fallback.state);
      setTimeout(() => transitionToState("IDLE"), 3000);
    }
  }, [input, isThinking, updateMemory, awardXP, transitionToState]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const currentState = PANTHER_STATES[pantherState] || PANTHER_STATES.IDLE;
  const stage        = memory.pantherStage || "CUB";
  const starters     = memory.name ? null : [
    "My lower back kills me after sitting all day",
    "I missed my last 4 workouts",
    "I can't lose weight no matter what I eat",
    "I'm 47 — is it too late to build muscle?",
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#080808",
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "'Barlow', sans-serif",
      position: "relative", overflow: "hidden", paddingBottom: 80,
    }}>
      {/* Ambient glow — reacts to state */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 700, height: 400, pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% 0%, ${currentState.glow} 0%, transparent 60%)`,
        transition: "background 1s ease",
        animation: "ambientPulse 4s ease-in-out infinite",
        zIndex: 0,
      }} />

      {/* ── MAIN CONTAINER ── */}
      <div style={{ width: "100%", maxWidth: 640, position: "relative", zIndex: 1 }}>

        {/* TOP BAR */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px 8px",
        }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 11, letterSpacing: "0.3em", color: "rgba(255,255,255,0.25)" }}>
            TURNED UP FITNESS
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <StreakFlame days={memory.streakDays || 0} />
            {memory.name && (
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)" }}>
                {memory.name.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* PANTHER PRESENCE */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 20px 0" }}>

          {/* XP pop */}
          {xpDelta && (
            <div style={{
              position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)",
              fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#C8973A",
              animation: "xpPop 2s ease forwards", pointerEvents: "none", zIndex: 10,
              textShadow: "0 0 12px rgba(200,151,58,0.8)",
            }}>
              {xpDelta}
            </div>
          )}

          {/* State ring + image */}
          <div style={{ position: "relative", width: 220, height: 220 }}>
            {/* Outer state ring */}
            <div style={{
              position: "absolute", inset: -12, borderRadius: "50%",
              border: `1.5px solid ${currentState.border}`,
              animation: pantherState !== "IDLE" ? "stateRing 2s ease-in-out infinite" : "none",
              transition: "border-color 0.8s ease",
            }} />
            {/* Glow halo */}
            <div style={{
              position: "absolute", inset: -20, borderRadius: "50%",
              background: `radial-gradient(ellipse, ${currentState.glow} 0%, transparent 70%)`,
              transition: "background 0.8s ease",
            }} />
            {/* Image */}
            <div style={{
              width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden",
              border: `2px solid ${currentState.border}`,
              boxShadow: `0 0 30px ${currentState.glow}, 0 0 60px ${currentState.glow}`,
              transition: "border-color 0.6s ease, box-shadow 0.6s ease",
              animation: imageTransition ? "imgFade 0.3s ease" : "none",
              position: "relative",
            }}>
              <img
                src={currentState.img}
                alt="Panther"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              {/* Scan line when analyzing */}
              {(pantherState === "ANALYZING" || isThinking) && (
                <div style={{
                  position: "absolute", left: 0, right: 0, height: 2,
                  background: "linear-gradient(90deg, transparent, rgba(200,151,58,0.8), transparent)",
                  animation: "scanLine 1.8s linear infinite",
                  pointerEvents: "none",
                }} />
              )}
              {/* ACTIVATED flash */}
              {pantherState === "ACTIVATED" && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "radial-gradient(ellipse at 50% 40%, rgba(255,69,0,0.35), transparent)",
                  pointerEvents: "none",
                }} />
              )}
              {/* Bottom fade */}
              <div style={{
                position: "absolute", inset: "50% 0 0",
                background: "linear-gradient(to top, rgba(8,8,8,0.8), transparent)",
                pointerEvents: "none",
              }} />
            </div>

            {/* State badge */}
            <div style={{
              position: "absolute", bottom: -14, left: "50%", transform: "translateX(-50%)",
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 14px", borderRadius: 20,
              background: "rgba(8,8,8,0.95)",
              border: `1px solid ${currentState.border}`,
              backdropFilter: "blur(12px)",
              whiteSpace: "nowrap",
              transition: "border-color 0.6s ease",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: isThinking ? "#C8973A" : pantherState === "ACTIVATED" ? "#22c55e" : currentState.border,
                boxShadow: `0 0 6px ${isThinking ? "#C8973A" : currentState.border}`,
                transition: "background 0.4s",
              }} />
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "rgba(255,255,255,0.75)" }}>
                {isThinking ? "READING YOU..." : currentState.label}
              </span>
            </div>
          </div>

          {/* Name + XP bar */}
          <div style={{ marginTop: 28, textAlign: "center", width: "100%", maxWidth: 320 }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 42, letterSpacing: "0.1em", lineHeight: 1, color: "#fff" }}>
              PANTHER <span style={{ color: "#FF4500" }}>AI</span>
            </div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: "rgba(255,255,255,0.28)", marginBottom: 12 }}>
              NASM · CORRECTIVE · NUTRITION · ACCOUNTABILITY
            </div>
            <XPBar xp={memory.xp || 0} stage={stage} />
          </div>
        </div>

        {/* MESSAGES */}
        <div style={{
          flex: 1, overflowY: "auto",
          display: "flex", flexDirection: "column", gap: 14,
          padding: "20px 16px 12px",
          maxHeight: 380,
        }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ animation: "msgIn 0.35s ease forwards" }}>
              {msg.role === "panther" ? (
                <div style={{
                  background: "rgba(15,15,15,0.98)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 18, borderTopLeftRadius: 4,
                  padding: "16px 18px",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(to bottom, #8B0000, #FF4500)", borderRadius: "4px 0 0 4px" }} />
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", color: "#FF4500", marginBottom: 7 }}>
                    🐆 PANTHER
                  </div>
                  {msg.headline && (
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 19, fontWeight: 900, letterSpacing: "0.07em", color: "#fff", lineHeight: 1.15, marginBottom: 9, animation: "headlineIn 0.4s ease forwards" }}>
                      {msg.headline}
                    </div>
                  )}
                  {msg.body && (
                    <div style={{ fontSize: 13.5, lineHeight: 1.7, color: "rgba(255,255,255,0.75)", marginBottom: 11 }}>
                      {msg.body}
                    </div>
                  )}
                  {msg.directive && (
                    <div style={{ padding: "9px 13px", borderLeft: "2px solid #FF4500", background: "rgba(255,69,0,0.06)", borderRadius: "0 10px 10px 0", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.88)", animation: "directiveIn 0.5s ease 0.15s both" }}>
                      → {msg.directive}
                    </div>
                  )}
                  {/* Streaming dots when all fields empty */}
                  {!msg.headline && !msg.body && !msg.directive && (
                    <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "4px 0" }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#C8973A", animation: "thinkDot 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
                      ))}
                      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)" }}>
                        PANTHER IS READING YOU...
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{
                    background: "linear-gradient(135deg, rgba(139,0,0,0.3), rgba(255,69,0,0.18))",
                    border: "1px solid rgba(255,69,0,0.18)",
                    borderRadius: 18, borderTopRightRadius: 4,
                    padding: "11px 16px", maxWidth: "82%",
                    fontSize: 13.5, lineHeight: 1.65, color: "rgba(255,255,255,0.85)",
                  }}>
                    {msg.text}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Thinking row */}
          {isThinking && messages[messages.length - 1]?.role !== "panther" && (
            <div style={{ display: "flex", gap: 6, alignItems: "center", paddingLeft: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#C8973A", animation: "thinkDot 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
              ))}
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)" }}>
                PANTHER IS READING YOU...
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* STARTER CHIPS */}
        {starters && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "0 16px 12px" }}>
            {starters.map((s, i) => (
              <button key={i} onClick={() => { setInput(s); setTimeout(() => send(), 50); }}
                style={{
                  padding: "7px 14px", borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.03)",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 12, cursor: "pointer",
                  fontFamily: "'Barlow', sans-serif",
                  transition: "all 0.2s", whiteSpace: "nowrap",
                }}
                onMouseEnter={e => {
                  const b = e.target as HTMLButtonElement;
                  b.style.borderColor = "rgba(255,69,0,0.4)";
                  b.style.color = "rgba(255,255,255,0.85)";
                  b.style.background = "rgba(255,69,0,0.07)";
                }}
                onMouseLeave={e => {
                  const b = e.target as HTMLButtonElement;
                  b.style.borderColor = "rgba(255,255,255,0.1)";
                  b.style.color = "rgba(255,255,255,0.5)";
                  b.style.background = "rgba(255,255,255,0.03)";
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* INPUT BAR */}
        <div style={{ padding: "0 16px 16px" }}>
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
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              onInput={e => {
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
              onClick={send}
              disabled={isThinking || !input.trim()}
              style={{
                width: 40, height: 40, borderRadius: 10, border: "none",
                background: isThinking || !input.trim()
                  ? "rgba(255,69,0,0.2)"
                  : "linear-gradient(135deg, #8B0000, #FF4500)",
                color: "#fff",
                cursor: isThinking || !input.trim() ? "not-allowed" : "pointer",
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
          <div style={{ textAlign: "center", marginTop: 10, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.18)" }}>
            PANTHER · TURNED UP FITNESS · BUILT FOR THE 40+ ATHLETE
          </div>
        </div>

      </div>
    </div>
  );
}
