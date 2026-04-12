/**
 * TUF PANTHER SCHEDULER v1.0
 * Training calendar with device push notifications, .ics export, and Panther roar triggers
 * 
 * Features:
 *   - Monthly calendar grid (training / rest / missed / today states)
 *   - Session creation with time, program, notes
 *   - Weekly goal setting (1–7 days)
 *   - Push notification permission + scheduling
 *   - .ics export for device calendar
 *   - Daily check-in with Panther roar response
 *   - Streak tracking + milestone roars
 */
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { ls } from "@/data/v4constants";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TrainingSession {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  program: string;
  notes: string;
  completed: boolean;
  rating?: number; // 1-5
  checkedIn: boolean;
}

interface SchedulerState {
  sessions: TrainingSession[];
  goalDaysPerWeek: number;
  notificationsEnabled: boolean;
  morningTime: string;   // HH:MM
  preWorkoutMins: number; // minutes before session
  streak: number;
  longestStreak: number;
  lastCheckIn: string; // YYYY-MM-DD
}

const DEFAULT_STATE: SchedulerState = {
  sessions: [],
  goalDaysPerWeek: 4,
  notificationsEnabled: false,
  morningTime: "07:00",
  preWorkoutMins: 60,
  streak: 0,
  longestStreak: 0,
  lastCheckIn: "",
};

const PROGRAMS = [
  "Maximum Overdrive",
  "Ass-Assassination",
  "30-Day Challenge",
  "Custom Workout",
  "BOA Assessment",
  "Recovery / Mobility",
  "Cardio",
];

const PANTHER_ROARS = {
  streak7:  "7 DAYS STRAIGHT. THE PANTHER DOESN'T STOP.",
  streak14: "14 DAYS. YOU'RE BUILDING SOMETHING REAL.",
  streak21: "21 DAYS. THIS IS WHO YOU ARE NOW.",
  streak30: "30 DAYS. YOU BECAME DANGEROUS.",
  missed:   "YOU MISSED YESTERDAY. THE PANTHER REMEMBERS. GET BACK.",
  checkin:  "SESSION LOGGED. XP EARNED. KEEP MOVING.",
  morning:  "IT'S TRAINING DAY. NO EXCUSES. LET'S GO.",
  preWork:  "ONE HOUR. GET YOUR MIND RIGHT.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function generateICS(session: TrainingSession): string {
  const [year, month, day] = session.date.split("-").map(Number);
  const [hour, min] = session.time.split(":").map(Number);
  const start = new Date(year, month - 1, day, hour, min);
  const end   = new Date(year, month - 1, day, hour + 1, min);

  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TUF//Panther Scheduler//EN",
    "BEGIN:VEVENT",
    `UID:tuf-${session.id}@turnedupfitness.com`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:TUF — ${session.program}`,
    `DESCRIPTION:Turned Up Fitness training session.${session.notes ? " " + session.notes : ""}`,
    "LOCATION:Turned Up Fitness",
    "BEGIN:VALARM",
    "TRIGGER:-PT60M",
    "ACTION:DISPLAY",
    "DESCRIPTION:PANTHER: One hour until training. Get your mind right.",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadICS(session: TrainingSession) {
  const content = generateICS(session);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `tuf-${session.program.replace(/\s+/g, "-").toLowerCase()}-${session.date}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Push Notification Helpers ────────────────────────────────────────────────
async function registerSW(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    return reg;
  } catch {
    return null;
  }
}

async function requestPushPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function scheduleLocalNotification(title: string, body: string, delayMs: number, url = "/schedule") {
  // Use setTimeout for in-session scheduling (up to ~24h)
  // For persistent scheduling across sessions, we store in localStorage and check on app open
  setTimeout(() => {
    if (Notification.permission === "granted") {
      const n = new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "tuf-scheduled",
        data: { url },
      });
      n.onclick = () => { window.focus(); n.close(); };
    }
  }, delayMs);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Schedule() {
  const [, navigate] = useLocation();
  const [state, setState] = useState<SchedulerState>(() =>
    ls.get<SchedulerState>("tuf_scheduler", DEFAULT_STATE)
  );

  const [viewYear,  setViewYear]  = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [showAdd,   setShowAdd]   = useState(false);
  const [showCheckin, setShowCheckin] = useState<TrainingSession | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [roarMsg,   setRoarMsg]   = useState<string | null>(null);
  const [notifStatus, setNotifStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");

  // New session form state
  const [newDate,    setNewDate]    = useState(todayStr());
  const [newTime,    setNewTime]    = useState("07:00");
  const [newProgram, setNewProgram] = useState(PROGRAMS[0]);
  const [newNotes,   setNewNotes]   = useState("");

  // Check-in state
  const [checkinRating, setCheckinRating] = useState(3);

  const save = useCallback((updated: SchedulerState) => {
    setState(updated);
    ls.set("tuf_scheduler", updated);
  }, []);

  // ── Check for missed sessions on load ──────────────────────────────────────
  useEffect(() => {
    const today = todayStr();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const missedYesterday = state.sessions.some(
      s => s.date === yesterday && !s.completed && !s.checkedIn
    );
    if (missedYesterday && state.lastCheckIn !== today) {
      setTimeout(() => setRoarMsg(PANTHER_ROARS.missed), 800);
    }
  }, []);

  // ── Register service worker on mount ──────────────────────────────────────
  useEffect(() => {
    registerSW();
    if (Notification.permission === "granted") setNotifStatus("granted");
    else if (Notification.permission === "denied") setNotifStatus("denied");
  }, []);

  // ── Calendar data ──────────────────────────────────────────────────────────
  const daysInMonth  = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfMonth = getFirstDayOfMonth(viewYear, viewMonth);
  const today = todayStr();

  function getDayState(dateStr: string): "training" | "completed" | "missed" | "rest" | "today" | "future" {
    const session = state.sessions.find(s => s.date === dateStr);
    const isPast  = dateStr < today;
    const isToday = dateStr === today;
    if (isToday) return session ? "training" : "today";
    if (session) {
      if (session.completed) return "completed";
      if (isPast) return "missed";
      return "training";
    }
    return isPast ? "rest" : "future";
  }

  const DAY_COLORS: Record<string, string> = {
    training:  "#FF4500",
    completed: "#22c55e",
    missed:    "#ef4444",
    rest:      "rgba(255,255,255,0.06)",
    today:     "#4a9eff",
    future:    "transparent",
  };

  // ── Add session ────────────────────────────────────────────────────────────
  function handleAddSession() {
    const session: TrainingSession = {
      id: Date.now().toString(),
      date: newDate,
      time: newTime,
      program: newProgram,
      notes: newNotes,
      completed: false,
      checkedIn: false,
    };
    const updated = { ...state, sessions: [...state.sessions, session].sort((a, b) => a.date.localeCompare(b.date)) };
    save(updated);
    setShowAdd(false);
    setNewNotes("");
  }

  // ── Delete session ─────────────────────────────────────────────────────────
  function handleDeleteSession(id: string) {
    save({ ...state, sessions: state.sessions.filter(s => s.id !== id) });
  }

  // ── Check-in ───────────────────────────────────────────────────────────────
  function handleCheckin(session: TrainingSession) {
    const newStreak = state.streak + 1;
    const updated: SchedulerState = {
      ...state,
      lastCheckIn: todayStr(),
      streak: newStreak,
      longestStreak: Math.max(newStreak, state.longestStreak),
      sessions: state.sessions.map(s =>
        s.id === session.id
          ? { ...s, completed: true, checkedIn: true, rating: checkinRating }
          : s
      ),
    };
    save(updated);
    setShowCheckin(null);
    setCheckinRating(3);

    // Roar on milestones
    let roar = PANTHER_ROARS.checkin;
    if (newStreak === 7)  roar = PANTHER_ROARS.streak7;
    if (newStreak === 14) roar = PANTHER_ROARS.streak14;
    if (newStreak === 21) roar = PANTHER_ROARS.streak21;
    if (newStreak === 30) roar = PANTHER_ROARS.streak30;
    setRoarMsg(roar);
  }

  // ── Push notifications ─────────────────────────────────────────────────────
  async function handleEnableNotifications() {
    setNotifStatus("requesting");
    const granted = await requestPushPermission();
    if (granted) {
      setNotifStatus("granted");
      save({ ...state, notificationsEnabled: true });
      // Schedule today's morning notification if not yet passed
      const [h, m] = state.morningTime.split(":").map(Number);
      const now = new Date();
      const morning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
      const delay = morning.getTime() - now.getTime();
      if (delay > 0) {
        scheduleLocalNotification("🐾 PANTHER", PANTHER_ROARS.morning, delay, "/schedule");
      }
      setRoarMsg("NOTIFICATIONS ACTIVATED. THE PANTHER WILL HOLD YOU ACCOUNTABLE.");
    } else {
      setNotifStatus("denied");
    }
  }

  // ── ICS Export ─────────────────────────────────────────────────────────────
  function handleExportICS(session: TrainingSession) {
    downloadICS(session);
  }

  // ── Week stats ─────────────────────────────────────────────────────────────
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });
  const weekCompleted = state.sessions.filter(s => weekDates.includes(s.date) && s.completed).length;
  const weekPct = Math.round((weekCompleted / state.goalDaysPerWeek) * 100);

  // ── Upcoming sessions ──────────────────────────────────────────────────────
  const upcoming = state.sessions
    .filter(s => s.date >= today && !s.completed)
    .slice(0, 5);

  const todaySessions = state.sessions.filter(s => s.date === today);

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAY_LABELS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  return (
    <div style={{ minHeight: "100vh", background: "#080808", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes roarIn { 0%{opacity:0;transform:scale(0.85)} 20%{opacity:1;transform:scale(1.04)} 100%{opacity:1;transform:scale(1)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(255,69,0,0.3)} 50%{box-shadow:0 0 40px rgba(255,69,0,0.6)} }
        .sched-page { animation: fadeUp 0.35s ease both; }
        .day-cell { transition: transform 0.12s; cursor: pointer; }
        .day-cell:active { transform: scale(0.92); }
        .roar-banner { animation: roarIn 0.4s ease both; }
        .modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:100;display:flex;align-items:flex-end;justify-content:center; }
        .modal-sheet { background:#111;border-radius:24px 24px 0 0;width:100%;max-width:480px;padding:24px 20px 40px;max-height:85vh;overflow-y:auto; }
        .input-field { width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px 14px;color:#fff;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:600;outline:none;box-sizing:border-box; }
        .input-field:focus { border-color:rgba(255,69,0,0.5); }
        select.input-field option { background:#111;color:#fff; }
      `}</style>

      <div className="sched-page" style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* ─── HEADER ─── */}
        <div style={{ paddingTop: 16, marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", cursor: "pointer", padding: 0 }}>
            ← HOME
          </button>
          <button onClick={() => setShowSettings(true)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", cursor: "pointer", padding: 0 }}>
            ⚙ SETTINGS
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: "#FF4500", marginBottom: 2 }}>
            TURNED UP FITNESS
          </div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, letterSpacing: "0.04em", color: "#fff", lineHeight: 1 }}>
            PANTHER SCHEDULER
          </div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
            Training calendar · Push alerts · Device sync
          </div>
        </div>

        {/* ─── PANTHER ROAR BANNER ─── */}
        {roarMsg && (
          <div
            className="roar-banner"
            onClick={() => setRoarMsg(null)}
            style={{
              marginBottom: 16, padding: "16px 20px", borderRadius: 16,
              background: "linear-gradient(135deg, rgba(255,69,0,0.2), rgba(139,0,0,0.3))",
              border: "1px solid rgba(255,69,0,0.4)",
              animation: "glowPulse 2s ease-in-out infinite",
              cursor: "pointer",
            }}
          >
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "#FF4500", marginBottom: 4 }}>
              🐾 PANTHER SAYS
            </div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: "0.06em", color: "#fff", lineHeight: 1.2 }}>
              {roarMsg}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
              TAP TO DISMISS
            </div>
          </div>
        )}

        {/* ─── PUSH NOTIFICATION PROMPT ─── */}
        {notifStatus !== "granted" && notifStatus !== "denied" && (
          <div style={{
            marginBottom: 16, padding: "14px 16px", borderRadius: 14,
            background: "rgba(74,158,255,0.08)", border: "1px solid rgba(74,158,255,0.2)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 24 }}>🔔</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "#4a9eff", marginBottom: 2 }}>
                LET PANTHER HOLD YOU ACCOUNTABLE
              </div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                Morning activation · Pre-workout alerts · Streak roars
              </div>
            </div>
            <button
              onClick={handleEnableNotifications}
              disabled={notifStatus === "requesting"}
              style={{
                padding: "8px 14px", borderRadius: 10, border: "none",
                background: "#4a9eff", color: "#fff",
                fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700,
                letterSpacing: "0.08em", cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              {notifStatus === "requesting" ? "..." : "ACTIVATE"}
            </button>
          </div>
        )}

        {notifStatus === "denied" && (
          <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#ef4444" }}>
              NOTIFICATIONS BLOCKED — Enable in browser settings to receive Panther alerts
            </div>
          </div>
        )}

        {/* ─── WEEK PROGRESS ─── */}
        <div style={{ marginBottom: 16, padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>
                THIS WEEK
              </div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#fff", lineHeight: 1 }}>
                {weekCompleted} / {state.goalDaysPerWeek} <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>SESSIONS</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>
                STREAK
              </div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#FF4500", lineHeight: 1 }}>
                {state.streak} <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>DAYS</span>
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3,
              width: `${Math.min(weekPct, 100)}%`,
              background: weekPct >= 100 ? "#22c55e" : "#FF4500",
              transition: "width 0.5s ease",
            }} />
          </div>
          {/* Week day dots */}
          <div style={{ display: "flex", gap: 6, marginTop: 10, justifyContent: "space-between" }}>
            {weekDates.map((d, i) => {
              const state_ = getDayState(d);
              return (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
                    {DAY_LABELS[i][0]}
                  </div>
                  <div style={{
                    width: "100%", aspectRatio: "1", borderRadius: "50%",
                    background: DAY_COLORS[state_] || "transparent",
                    border: d === today ? "2px solid #4a9eff" : "1px solid rgba(255,255,255,0.08)",
                    margin: "0 auto",
                    maxWidth: 28,
                  }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── TODAY'S SESSIONS ─── */}
        {todaySessions.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#4a9eff", marginBottom: 8 }}>
              TODAY
            </div>
            {todaySessions.map(s => (
              <div key={s.id} style={{
                padding: "14px 16px", borderRadius: 14, marginBottom: 8,
                background: s.completed ? "rgba(34,197,94,0.08)" : "rgba(74,158,255,0.08)",
                border: `1px solid ${s.completed ? "rgba(34,197,94,0.2)" : "rgba(74,158,255,0.25)"}`,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: "#fff", letterSpacing: "0.06em" }}>{s.program}</div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{s.time}{s.notes ? ` · ${s.notes}` : ""}</div>
                </div>
                {s.completed ? (
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: "0.08em" }}>✓ DONE</div>
                ) : (
                  <button
                    onClick={() => setShowCheckin(s)}
                    style={{
                      padding: "8px 14px", borderRadius: 10, border: "none",
                      background: "#FF4500", color: "#fff",
                      fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700,
                      letterSpacing: "0.08em", cursor: "pointer",
                    }}
                  >
                    CHECK IN
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ─── CALENDAR ─── */}
        <div style={{ marginBottom: 16, background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
          {/* Month nav */}
          <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 18, cursor: "pointer", padding: "0 8px" }}
            >‹</button>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: "#fff", letterSpacing: "0.08em" }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </div>
            <button
              onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 18, cursor: "pointer", padding: "0 8px" }}
            >›</button>
          </div>

          {/* Day labels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "8px 12px 4px" }}>
            {DAY_LABELS.map(d => (
              <div key={d} style={{ textAlign: "center", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)" }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, padding: "4px 12px 14px" }}>
            {/* Empty cells for first week offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e${i}`} />)}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum  = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const dayState = getDayState(dateStr);
              const hasSession = state.sessions.some(s => s.date === dateStr);
              return (
                <div
                  key={dayNum}
                  className="day-cell"
                  onClick={() => {
                    if (dateStr >= today) { setNewDate(dateStr); setShowAdd(true); }
                  }}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 8,
                    background: DAY_COLORS[dayState],
                    border: dateStr === today ? "2px solid #4a9eff" : "1px solid rgba(255,255,255,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <span style={{
                    fontFamily: "'Barlow Condensed',sans-serif",
                    fontSize: 12, fontWeight: 700,
                    color: dayState === "future" || dayState === "rest" ? "rgba(255,255,255,0.3)" : "#fff",
                  }}>
                    {dayNum}
                  </span>
                  {hasSession && dayState !== "completed" && dayState !== "missed" && (
                    <div style={{ position: "absolute", bottom: 2, right: 2, width: 4, height: 4, borderRadius: "50%", background: "#FF4500" }} />
                  )}
                </div>
              );
            })}
            {/* Trailing empty cells to complete the last row */}
            {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 }).map((_, i) => <div key={`t${i}`} />)}
          </div>

          {/* Legend */}
          <div style={{ padding: "0 16px 14px", display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { color: "#FF4500", label: "Scheduled" },
              { color: "#22c55e", label: "Completed" },
              { color: "#ef4444", label: "Missed" },
              { color: "#4a9eff", label: "Today" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── UPCOMING SESSIONS ─── */}
        {upcoming.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
              UPCOMING
            </div>
            {upcoming.map(s => (
              <div key={s.id} style={{
                padding: "12px 16px", borderRadius: 12, marginBottom: 6,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, color: "#fff", letterSpacing: "0.06em" }}>{s.program}</div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                    {formatDate(s.date)} · {s.time}
                  </div>
                </div>
                <button
                  onClick={() => handleExportICS(s)}
                  title="Add to device calendar"
                  style={{
                    padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)",
                    fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700,
                    letterSpacing: "0.06em", cursor: "pointer",
                  }}
                >
                  📅 ADD
                </button>
                <button
                  onClick={() => handleDeleteSession(s.id)}
                  style={{
                    padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)",
                    background: "rgba(239,68,68,0.06)", color: "#ef4444",
                    fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ─── ADD SESSION BUTTON ─── */}
        <button
          onClick={() => { setNewDate(todayStr()); setShowAdd(true); }}
          style={{
            width: "100%", padding: "16px", borderRadius: 16, border: "none",
            background: "linear-gradient(135deg, #FF4500, #8B0000)",
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: "0.1em",
            color: "#fff", cursor: "pointer",
            boxShadow: "0 4px 24px rgba(255,69,0,0.3)",
          }}
        >
          + SCHEDULE TRAINING SESSION
        </button>

      </div>

      {/* ─── ADD SESSION MODAL ─── */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#fff", letterSpacing: "0.06em", marginBottom: 20 }}>
              SCHEDULE SESSION
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>DATE</label>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="input-field" style={{ colorScheme: "dark" }} />
              </div>
              <div>
                <label style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>TIME</label>
                <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="input-field" style={{ colorScheme: "dark" }} />
              </div>
              <div>
                <label style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>PROGRAM</label>
                <select value={newProgram} onChange={e => setNewProgram(e.target.value)} className="input-field">
                  {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>NOTES (optional)</label>
                <input type="text" value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="e.g. Focus on form, leg day..." className="input-field" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer" }}>
                CANCEL
              </button>
              <button onClick={handleAddSession} style={{ flex: 2, padding: "14px", borderRadius: 12, border: "none", background: "#FF4500", color: "#fff", fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: "0.1em", cursor: "pointer" }}>
                ADD TO SCHEDULE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CHECK-IN MODAL ─── */}
      {showCheckin && (
        <div className="modal-overlay" onClick={() => setShowCheckin(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#FF4500", marginBottom: 4 }}>
              SESSION CHECK-IN
            </div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: "#fff", letterSpacing: "0.06em", marginBottom: 4 }}>
              {showCheckin.program}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
              {formatDate(showCheckin.date)} · {showCheckin.time}
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
                RATE YOUR SESSION
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {[1, 2, 3, 4, 5].map(r => (
                  <button
                    key={r}
                    onClick={() => setCheckinRating(r)}
                    style={{
                      width: 48, height: 48, borderRadius: 12,
                      border: checkinRating >= r ? "2px solid #FF4500" : "1px solid rgba(255,255,255,0.1)",
                      background: checkinRating >= r ? "rgba(255,69,0,0.2)" : "rgba(255,255,255,0.04)",
                      fontSize: 20, cursor: "pointer",
                    }}
                  >
                    {r <= 2 ? "😤" : r === 3 ? "💪" : r === 4 ? "🔥" : "⚡"}
                  </button>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 8, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>
                {checkinRating <= 2 ? "TOUGH SESSION" : checkinRating === 3 ? "SOLID WORK" : checkinRating === 4 ? "CRUSHED IT" : "PANTHER MODE"}
              </div>
            </div>

            <button
              onClick={() => handleCheckin(showCheckin)}
              style={{
                width: "100%", padding: "16px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #FF4500, #8B0000)",
                fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: "0.1em",
                color: "#fff", cursor: "pointer",
              }}
            >
              LOG SESSION + EARN XP
            </button>
          </div>
        </div>
      )}

      {/* ─── SETTINGS MODAL ─── */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#fff", letterSpacing: "0.06em", marginBottom: 20 }}>
              SCHEDULER SETTINGS
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>
                  WEEKLY GOAL — {state.goalDaysPerWeek} DAYS/WEEK
                </label>
                <input
                  type="range" min={1} max={7} value={state.goalDaysPerWeek}
                  onChange={e => save({ ...state, goalDaysPerWeek: Number(e.target.value) })}
                  style={{ width: "100%", accentColor: "#FF4500" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                  <span>1 DAY</span><span>7 DAYS</span>
                </div>
              </div>

              <div>
                <label style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>
                  MORNING ACTIVATION TIME
                </label>
                <input
                  type="time" value={state.morningTime}
                  onChange={e => save({ ...state, morningTime: e.target.value })}
                  className="input-field" style={{ colorScheme: "dark" }}
                />
              </div>

              <div>
                <label style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>
                  PRE-WORKOUT ALERT — {state.preWorkoutMins} MINUTES BEFORE
                </label>
                <select
                  value={state.preWorkoutMins}
                  onChange={e => save({ ...state, preWorkoutMins: Number(e.target.value) })}
                  className="input-field"
                >
                  {[15, 30, 45, 60, 90, 120].map(m => <option key={m} value={m}>{m} minutes</option>)}
                </select>
              </div>

              <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                  LONGEST STREAK
                </div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: "#FF4500" }}>
                  {state.longestStreak} DAYS
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              style={{ width: "100%", marginTop: 20, padding: "14px", borderRadius: 12, border: "none", background: "#FF4500", color: "#fff", fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: "0.1em", cursor: "pointer" }}
            >
              SAVE SETTINGS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
