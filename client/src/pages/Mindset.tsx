/**
 * THE PANTHER SYSTEM — MINDSET Screen
 * 30-Day Panther Mindset Challenge
 * Doc 08 — MINDSET Pillar Build Doc
 * © 2026 TURNED UP FITNESS LLC — CONFIDENTIAL
 */
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

const USER_ID_KEY = "tuf_mindset_user_id";
const ANON_ID = () => {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) { id = `anon_${Date.now()}`; localStorage.setItem(USER_ID_KEY, id); }
  return id;
};

const PHASE_COLORS: Record<number, string> = {
  1: "#FF6600",
  2: "#C8973A",
  3: "#4a9eff",
  4: "#8b5cf6",
  5: "#22c55e",
  6: "#FF6600",
};

interface PhaseConfig {
  phase: number;
  days: [number, number];
  theme: string;
  identityStatement: string;
  moveAnchor: string;
  fuelAnchor: string;
  color: string;
}

interface Challenge {
  user_id: string;
  currentDay: number;
  currentPhase: number;
  streakCurrent: number;
  streakBest: number;
  totalCheckIns: number;
  lastCheckInDate: string | null;
  isActive: boolean;
  isCompleted: boolean;
  checkIns: CheckIn[];
}

interface CheckIn {
  day: number;
  phase: number;
  completedAt: string;
  pantherDirective: string;
  moveAnchorComplete: boolean;
  fuelAnchorComplete: boolean;
}

type Screen = "loading" | "start" | "daily" | "phase_unlock" | "completed";

export default function Mindset() {
  const [, navigate] = useLocation();
  const [screen, setScreen] = useState<Screen>("loading");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [phaseCfg, setPhaseCfg] = useState<PhaseConfig | null>(null);
  const [directive, setDirective] = useState<string>("");
  const [moveAnchor, setMoveAnchor] = useState(false);
  const [fuelAnchor, setFuelAnchor] = useState(false);
  const [journalEntry, setJournalEntry] = useState("");
  const [intentionalDecision, setIntentionalDecision] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phaseUnlockData, setPhaseUnlockData] = useState<{ phase: number; config: PhaseConfig } | null>(null);
  const userId = ANON_ID();

  const loadChallenge = useCallback(async () => {
    try {
      const res = await fetch(`/api/mindset/challenge/${userId}`);
      if (res.status === 404) { setScreen("start"); return; }
      if (!res.ok) throw new Error("Failed to load challenge");
      const data = await res.json();
      setChallenge(data.challenge);
      setPhaseCfg(data.phaseCfg);
      if (data.challenge.isCompleted) { setScreen("completed"); return; }
      // Parse last directive from most recent check-in
      const lastCheckIn = data.challenge.checkIns[data.challenge.checkIns.length - 1];
      if (lastCheckIn) setDirective(lastCheckIn.pantherDirective);
      setScreen("daily");
    } catch (err) {
      console.error(err);
      setScreen("start");
    }
  }, [userId]);

  useEffect(() => { loadChallenge(); }, [loadChallenge]);

  const handleStart = async () => {
    setError(null);
    try {
      const res = await fetch("/api/mindset/challenge/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok && res.status !== 409) throw new Error(data.error || "Failed to start");
      setChallenge(data.challenge);
      setPhaseCfg(data.phaseCfg);
      setScreen("daily");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCheckIn = async () => {
    if (!challenge) return;
    setIsCheckingIn(true);
    setError(null);
    try {
      const res = await fetch("/api/mindset/challenge/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          intentionalDecision,
          journalEntry,
          moveAnchorComplete: moveAnchor,
          fuelAnchorComplete: fuelAnchor,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Check-in failed");

      setChallenge(data.challenge);
      setDirective(data.directive);
      setMoveAnchor(false);
      setFuelAnchor(false);
      setJournalEntry("");
      setIntentionalDecision("");

      if (data.isCompleted) {
        setScreen("completed");
      } else if (data.phaseChanged && data.phaseConfig) {
        setPhaseUnlockData({ phase: data.newPhase, config: data.phaseConfig });
        setPhaseCfg(data.phaseConfig);
        setScreen("phase_unlock");
      } else {
        const nextPhaseCfg = data.challenge ? await fetch(`/api/mindset/challenge/${userId}`)
          .then(r => r.json()).then(d => d.phaseCfg) : phaseCfg;
        if (nextPhaseCfg) setPhaseCfg(nextPhaseCfg);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const phaseColor = phaseCfg ? PHASE_COLORS[phaseCfg.phase] : "#FF6600";
  const checkedInToday = challenge?.lastCheckInDate === new Date().toISOString().split("T")[0];

  // ─── LOADING ───────────────────────────────────────────────────────────────
  if (screen === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
          LOADING...
        </div>
      </div>
    );
  }

  // ─── START SCREEN ──────────────────────────────────────────────────────────
  if (screen === "start") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "0 16px 80px" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');`}</style>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          {/* Back */}
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", padding: "20px 0 0", cursor: "pointer" }}>
            ← HOME
          </button>

          {/* Hero */}
          <div style={{ textAlign: "center", padding: "48px 0 32px" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", color: "#FF6600", marginBottom: 12 }}>
              THE PANTHER SYSTEM
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: "0.04em", color: "var(--text-primary)", lineHeight: 1 }}>
              30-DAY MINDSET<br /><span style={{ color: "#FF6600" }}>CHALLENGE</span>
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.5)", marginTop: 16, lineHeight: 1.5 }}>
              Six phases. Thirty days.<br />One identity transformation.
            </div>
          </div>

          {/* Phase preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
            {[
              { phase: 1, days: "Days 1–7", theme: "Control > Chaos", color: "#FF6600" },
              { phase: 2, days: "Days 8–14", theme: "Patience", color: "#C8973A" },
              { phase: 3, days: "Days 15–20", theme: "Precision > Speed", color: "#4a9eff" },
              { phase: 4, days: "Days 21–25", theme: "Every Rep Has Intention", color: "#8b5cf6" },
              { phase: 5, days: "Days 26–28", theme: "Power When It Counts", color: "#22c55e" },
              { phase: 6, days: "Days 29–30", theme: "Become Dangerous", color: "#FF6600" },
            ].map(p => (
              <div key={p.phase} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: `1px solid rgba(255,255,255,0.06)` }}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: p.color }}>{p.days}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: "var(--text-primary)", letterSpacing: "0.04em" }}>{p.theme}</div>
                </div>
              </div>
            ))}
          </div>

          {error && <div style={{ color: "#ef4444", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{error}</div>}

          <button
            onClick={handleStart}
            style={{ width: "100%", padding: "18px 24px", background: "#FF6600", border: "none", borderRadius: 14, color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900, letterSpacing: "0.12em", cursor: "pointer" }}
          >
            BEGIN THE CHALLENGE →
          </button>
        </div>
      </div>
    );
  }

  // ─── PHASE UNLOCK SCREEN ───────────────────────────────────────────────────
  if (screen === "phase_unlock" && phaseUnlockData) {
    const { config } = phaseUnlockData;
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", textAlign: "center" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');`}</style>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", color: config.color, marginBottom: 16 }}>
          PHASE {config.phase} UNLOCKED
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: "var(--text-primary)", letterSpacing: "0.04em", lineHeight: 1, marginBottom: 24 }}>
          {config.theme.toUpperCase()}
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 320, lineHeight: 1.6, marginBottom: 32, fontStyle: "italic" }}>
          "{config.identityStatement}"
        </div>
        <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${config.color}30`, borderRadius: 12, padding: "16px 20px", marginBottom: 32, width: "100%", maxWidth: 360 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: config.color, marginBottom: 8 }}>TODAY'S ANCHORS</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>MOVE: {config.moveAnchor}</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.7)" }}>FUEL: {config.fuelAnchor}</div>
        </div>
        <button
          onClick={() => setScreen("daily")}
          style={{ padding: "16px 40px", background: config.color, border: "none", borderRadius: 12, color: "var(--text-primary)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 900, letterSpacing: "0.12em", cursor: "pointer" }}
        >
          ENTER PHASE {config.phase} →
        </button>
      </div>
    );
  }

  // ─── COMPLETED SCREEN ──────────────────────────────────────────────────────
  if (screen === "completed") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", textAlign: "center" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');`}</style>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", color: "#FF6600", marginBottom: 16 }}>
          DAY 30 COMPLETE
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: "var(--text-primary)", letterSpacing: "0.04em", lineHeight: 1, marginBottom: 8 }}>
          YOU BECAME<br /><span style={{ color: "#FF6600" }}>DANGEROUS.</span>
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.5)", marginTop: 16, marginBottom: 32, lineHeight: 1.6 }}>
          Thirty days. Six phases. One identity.<br />
          You finished what you started. That is rare.
        </div>
        {challenge && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32, width: "100%", maxWidth: 360 }}>
            {[
              { label: "TOTAL DAYS", value: challenge.totalCheckIns },
              { label: "BEST STREAK", value: challenge.streakBest },
              { label: "PHASE", value: 6 },
            ].map(stat => (
              <div key={stat.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#FF6600" }}>{stat.value}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => navigate("/")} style={{ padding: "16px 40px", background: "#FF6600", border: "none", borderRadius: 12, color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 900, letterSpacing: "0.12em", cursor: "pointer" }}>
          RETURN TO COMMAND CENTER
        </button>
      </div>
    );
  }

  // ─── DAILY CHECK-IN SCREEN ─────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .mindset-fade { animation: fadeUp 0.4s ease both; }
        .anchor-check { transition: all 0.15s ease; }
        .anchor-check:active { transform: scale(0.96); }
      `}</style>

      <div className="mindset-fade" style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>
        {/* Back */}
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", padding: "20px 0 0", cursor: "pointer" }}>
          ← HOME
        </button>

        {/* Phase Banner */}
        {phaseCfg && (
          <div style={{ marginTop: 16, padding: "14px 16px", background: `linear-gradient(135deg, ${phaseColor}18 0%, transparent 100%)`, border: `1px solid ${phaseColor}30`, borderRadius: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: phaseColor }}>
                  PHASE {phaseCfg.phase} · {phaseCfg.theme.toUpperCase()}
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em", marginTop: 2, fontStyle: "italic" }}>
                  "{phaseCfg.identityStatement}"
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: phaseColor, lineHeight: 1 }}>
                  {challenge?.currentDay ?? 0}
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)" }}>
                  / 30
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Day Progress Bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)" }}>
              PROGRESS
            </span>
            {challenge && challenge.streakCurrent > 0 && (
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, color: "#C8973A" }}>
                🔥 {challenge.streakCurrent} DAY STREAK
              </span>
            )}
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${((challenge?.currentDay ?? 0) / 30) * 100}%`, background: phaseColor, borderRadius: 2, transition: "width 0.6s ease" }} />
          </div>
        </div>

        {/* Panther Directive Card */}
        {directive && (
          <div style={{ marginBottom: 20, padding: "16px", background: "rgba(255,255,255,0.03)", border: `1px solid ${phaseColor}25`, borderRadius: 14 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: phaseColor, marginBottom: 10 }}>
              PANTHER DIRECTIVE
            </div>
            {directive.split("\n").map((line, i) => {
              const [label, ...rest] = line.split(": ");
              const text = rest.join(": ");
              if (!text) return <p key={i} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.6)", margin: "4px 0", lineHeight: 1.5 }}>{line}</p>;
              return (
                <div key={i} style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: phaseColor }}>{label}: </span>
                  <span style={{ fontFamily: label === "HEADLINE" ? "'Bebas Neue', sans-serif" : "'Barlow Condensed', sans-serif", fontSize: label === "HEADLINE" ? 18 : 14, color: "var(--text-primary)", letterSpacing: label === "HEADLINE" ? "0.04em" : "0" }}>{text}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Check-in form — only show if not checked in today */}
        {!checkedInToday ? (
          <>
            {/* Intentional Decision */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
                TODAY'S INTENTIONAL DECISION
              </div>
              <input
                type="text"
                value={intentionalDecision}
                onChange={e => setIntentionalDecision(e.target.value)}
                placeholder="What one decision defines today?"
                style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "var(--text-primary)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Anchor Checkboxes */}
            {phaseCfg && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
                  TODAY'S ANCHORS
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { key: "move", label: "MOVE", value: moveAnchor, set: setMoveAnchor, anchor: phaseCfg.moveAnchor, color: "#FF6600" },
                    { key: "fuel", label: "FUEL", value: fuelAnchor, set: setFuelAnchor, anchor: phaseCfg.fuelAnchor, color: "#22c55e" },
                  ].map(item => (
                    <button
                      key={item.key}
                      className="anchor-check"
                      onClick={() => item.set(!item.value)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: item.value ? `${item.color}15` : "rgba(255,255,255,0.03)", border: `1px solid ${item.value ? item.color + "50" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, cursor: "pointer", textAlign: "left" }}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${item.value ? item.color : "rgba(255,255,255,0.2)"}`, background: item.value ? item.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {item.value && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: item.color }}>{item.label}</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: item.value ? "#fff" : "rgba(255,255,255,0.5)" }}>{item.anchor}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Journal */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
                JOURNAL (OPTIONAL)
              </div>
              <textarea
                value={journalEntry}
                onChange={e => setJournalEntry(e.target.value)}
                placeholder="What did today teach you?"
                rows={3}
                style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "var(--text-primary)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, outline: "none", resize: "none", boxSizing: "border-box" }}
              />
            </div>

            {error && <div style={{ color: "#ef4444", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{error}</div>}

            {/* CHECK IN Button */}
            <button
              onClick={handleCheckIn}
              disabled={isCheckingIn}
              style={{ width: "100%", padding: "18px 24px", background: isCheckingIn ? "rgba(255,102,0,0.5)" : phaseColor, border: "none", borderRadius: 14, color: "var(--text-primary)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900, letterSpacing: "0.12em", cursor: isCheckingIn ? "not-allowed" : "pointer", transition: "background 0.15s ease" }}
            >
              {isCheckingIn ? "CHECKING IN..." : `CHECK IN — DAY ${(challenge?.currentDay ?? 0) + 1} →`}
            </button>
          </>
        ) : (
          /* Already checked in today */
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: phaseColor, letterSpacing: "0.04em", marginBottom: 8 }}>
              DAY {challenge?.currentDay} COMPLETE
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
              You've checked in today. Come back tomorrow.
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
              {[
                { label: "STREAK", value: challenge?.streakCurrent ?? 0 },
                { label: "TOTAL", value: challenge?.totalCheckIns ?? 0 },
                { label: "BEST", value: challenge?.streakBest ?? 0 },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: phaseColor }}>{stat.value}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
