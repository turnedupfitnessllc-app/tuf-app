/**
 * TUF PvP Challenge — Real-time rep battle
 * Wired to /api/challenges/* REST + Socket.io for live rep sync.
 * Bot fallback: if no real opponent joins within 5 s, server spawns a bot.
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { usePvPSocket } from "../hooks/usePvPSocket";
import type { PvPParticipant } from "../hooks/usePvPSocket";

// ── Challenge presets ─────────────────────────────────────────────────────────

const CHALLENGES = [
  { id: "100_squat_sprint",   name: "100 Squat Sprint",   exercise: "squat",    target: 100, duration: 300 },
  { id: "50_pushup_blitz",    name: "50 Push-Up Blitz",   exercise: "pushup",   target: 50,  duration: 180 },
  { id: "75_lunge_gauntlet",  name: "75 Lunge Gauntlet",  exercise: "lunge",    target: 75,  duration: 240 },
  { id: "30_burpee_inferno",  name: "30 Burpee Inferno",  exercise: "burpee",   target: 30,  duration: 300 },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function PvPChallenge() {
  const [, navigate] = useLocation();

  // ── Identity ────────────────────────────────────────────────────────────────
  const rawProfile = localStorage.getItem("tuf_profile");
  const profile    = rawProfile ? JSON.parse(rawProfile) : {};
  const userId     = localStorage.getItem("tuf_user_id") || `guest_${Math.random().toString(36).slice(2, 8)}`;
  const userName   = profile.name || "Panther";

  // ── UI State ────────────────────────────────────────────────────────────────
  const [phase, setPhase]           = useState<"select" | "lobby" | "countdown" | "live" | "ended">("select");
  const [selectedChallenge, setSelectedChallenge] = useState(CHALLENGES[0]);
  const [challengeId, setChallengeId]             = useState<string | null>(null);
  const [participants, setParticipants]           = useState<PvPParticipant[]>([]);
  const [winner, setWinner]                       = useState<PvPParticipant | null>(null);
  const [countdown, setCountdown]                 = useState(3);
  const [timeLeft, setTimeLeft]                   = useState(selectedChallenge.duration);
  const [myReps, setMyReps]                       = useState(0);
  const [lastTap, setLastTap]                     = useState(0);
  const [tapFeedback, setTapFeedback]             = useState(false);
  const [statusMsg, setStatusMsg]                 = useState("");
  const [isBotMode, setIsBotMode]                 = useState(false);
  const [xpEarned, setXpEarned]                   = useState(0);
  const [issuingChallenge, setIssuingChallenge]   = useState(false);

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const myRepsRef   = useRef(0);

  // ── Socket hook — challenge_id=null = idle, real ID triggers connection ──────
  const { sendRepUpdate, leaveChallenge } = usePvPSocket({
    challenge_id: challengeId,   // null until challenge is issued
    user_id: userId,
    name: userName,
    onChallengeUpdate: (parts) => {
      setParticipants(parts);
    },
    onChallengeEnd: (w) => {
      setWinner(w);
      handleEnd(w);
    },
    onOpponentJoined: (oppName) => {
      setStatusMsg(`${oppName} joined — GET READY`);
      startCountdown();
    },
    onBotMode: (botName) => {
      setIsBotMode(true);
      setStatusMsg(`No opponent found — ${botName} (BOT) steps up`);
      startCountdown();
    },
  });

  // ── Issue challenge via API ────────────────────────────────────────────────
  const issueChallenge = useCallback(async () => {
    setIssuingChallenge(true);
    try {
      const res = await fetch("/api/challenges/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenger_id:   userId,
          challenger_name: userName,
          opponent_id:     "open",           // open matchmaking
          opponent_name:   "Opponent",
          exercise_id:     selectedChallenge.exercise,
          exercise_name:   selectedChallenge.name,
          target_reps:     selectedChallenge.target,
          time_limit_seconds: selectedChallenge.duration,
          wager_xp:        25,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChallengeId(data.challenge.challenge_id);
        setTimeLeft(selectedChallenge.duration);
        setMyReps(0);
        myRepsRef.current = 0;
        setPhase("lobby");
        setStatusMsg("Searching for opponent…");
      }
    } catch {
      setStatusMsg("Connection error — try again");
    } finally {
      setIssuingChallenge(false);
    }
  }, [userId, userName, selectedChallenge]);

  // ── Countdown ──────────────────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    setPhase("countdown");
    let c = 3;
    setCountdown(c);
    const cd = setInterval(() => {
      c--;
      setCountdown(c);
      if (c === 0) {
        clearInterval(cd);
        setPhase("live");
        // Start local countdown timer
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }, 1000);
  }, []);

  // ── Rep tap ────────────────────────────────────────────────────────────────
  const handleRep = useCallback(() => {
    if (phase !== "live") return;
    const now = Date.now();
    if (now - lastTap < 250) return; // debounce
    setLastTap(now);

    const newReps = myRepsRef.current + 1;
    myRepsRef.current = newReps;
    setMyReps(newReps);

    // Update local participant display
    setParticipants(prev =>
      prev.map(p => p.user_id === userId ? { ...p, reps: newReps } : p)
    );

    // Broadcast to server
    if (challengeId) sendRepUpdate(newReps);

    setTapFeedback(true);
    setTimeout(() => setTapFeedback(false), 150);
  }, [phase, lastTap, userId, challengeId, sendRepUpdate]);

  // ── End challenge ──────────────────────────────────────────────────────────
  const handleEnd = useCallback(async (w: PvPParticipant) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("ended");

    // Submit score to backend
    if (challengeId) {
      try {
        await fetch(`/api/challenges/${challengeId}/score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, score: myRepsRef.current }),
        });
        // Award MPS
        const xp = w.user_id === userId ? 50 + myRepsRef.current : 10;
        setXpEarned(xp);
      } catch { /* silent */ }
    }
  }, [challengeId, userId]);

  // Auto-end when timer hits 0
  useEffect(() => {
    if (phase === "live" && timeLeft === 0) {
      const me: PvPParticipant = { user_id: userId, name: userName, reps: myRepsRef.current, status: "done" };
      const opp = participants.find(p => p.user_id !== userId);
      const w = opp && opp.reps > myRepsRef.current ? opp : me;
      setWinner(w);
      handleEnd(w);
    }
  }, [timeLeft, phase, participants, userId, userName, handleEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (challengeId) leaveChallenge();
    };
  }, [challengeId, leaveChallenge]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const me  = participants.find(p => p.user_id === userId);
  const opp = participants.find(p => p.user_id !== userId);
  const isWinning = (me?.reps ?? myReps) >= (opp?.reps ?? 0);

  const resetToSelect = () => {
    if (challengeId) leaveChallenge();
    setChallengeId(null);
    setPhase("select");
    setMyReps(0);
    myRepsRef.current = 0;
    setParticipants([]);
    setWinner(null);
    setIsBotMode(false);
    setStatusMsg("");
    setXpEarned(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#080808", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tapPop { 0%{transform:scale(1)} 50%{transform:scale(0.95)} 100%{transform:scale(1)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .pvp-fade { animation: fadeUp 0.4s ease both; }
        .pvp-pulse { animation: pulse 1.5s ease infinite; }
      `}</style>

      <main className="pvp-fade" style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* ─── HEADER ─── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 20, marginBottom: 20 }}>
          <button onClick={() => { resetToSelect(); navigate("/"); }}
            style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 20 }}>←</button>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#FF6600" }}>
              {isBotMode ? "BOT CHALLENGE" : "LIVE CHALLENGE"}
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, lineHeight: 1, color: "#fff" }}>
              {selectedChallenge.name.toUpperCase()}
            </div>
          </div>
        </div>

        {/* ─── SELECT CHALLENGE ─── */}
        {phase === "select" && (
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 3, color: "#555", marginBottom: 12 }}>
              CHOOSE YOUR BATTLE
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {CHALLENGES.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => { setSelectedChallenge(ch); setTimeLeft(ch.duration); }}
                  style={{
                    padding: "16px 18px",
                    background: selectedChallenge.id === ch.id
                      ? "rgba(255,102,0,0.12)"
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selectedChallenge.id === ch.id ? "rgba(255,102,0,0.5)" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 14, cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>
                      {ch.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
                      {ch.target} reps · {formatTime(ch.duration)}
                    </div>
                  </div>
                  {selectedChallenge.id === ch.id && (
                    <div style={{ color: "#FF6600", fontSize: 18 }}>✓</div>
                  )}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: "TARGET", value: `${selectedChallenge.target} REPS` },
                { label: "TIME LIMIT", value: formatTime(selectedChallenge.duration) },
                { label: "WAGER", value: "25 XP" },
                { label: "WIN BONUS", value: "50+ XP" },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 12 }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: 3, color: "#555", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#FF6600" }}>{s.value}</div>
                </div>
              ))}
            </div>

            <button
              onClick={issueChallenge}
              disabled={issuingChallenge}
              style={{
                width: "100%", padding: "18px",
                background: issuingChallenge
                  ? "rgba(255,102,0,0.3)"
                  : "linear-gradient(135deg, #FF6600, #DC2626)",
                border: "none", borderRadius: 14,
                color: "#fff", fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 20, fontWeight: 900, letterSpacing: 3, cursor: issuingChallenge ? "not-allowed" : "pointer",
                boxShadow: "0 4px 24px rgba(255,102,0,0.4)",
              }}
            >
              {issuingChallenge ? "FINDING OPPONENT…" : "ENTER THE ARENA →"}
            </button>
          </div>
        )}

        {/* ─── LOBBY — waiting for opponent ─── */}
        {phase === "lobby" && (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div className="pvp-pulse" style={{ fontSize: 64, marginBottom: 20 }}>⚔️</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#FF6600", marginBottom: 8 }}>
              CHALLENGE ISSUED
            </div>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 24, lineHeight: 1.6 }}>
              {statusMsg || "Waiting for an opponent to join…"}
            </p>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#555", marginBottom: 24 }}>
              No opponent? A bot will step up in 5 seconds.
            </div>
            <button
              onClick={resetToSelect}
              style={{
                padding: "12px 28px",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, color: "#888",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, cursor: "pointer",
              }}
            >
              CANCEL
            </button>
          </div>
        )}

        {/* ─── COUNTDOWN ─── */}
        {phase === "countdown" && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 120, color: "#FF6600", lineHeight: 1, textShadow: "0 0 40px rgba(255,102,0,0.8)" }}>
              {countdown === 0 ? "GO!" : countdown}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, letterSpacing: 4, color: "#888", marginTop: 16 }}>
              {statusMsg || "GET READY"}
            </div>
          </div>
        )}

        {/* ─── LIVE ─── */}
        {phase === "live" && (
          <>
            {/* Timer */}
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, lineHeight: 1,
                color: timeLeft <= 30 ? "#FF4444" : "#fff",
              }}>
                {formatTime(timeLeft)}
              </div>
              {isBotMode && (
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 3, color: "#555", marginTop: 4 }}>
                  BOT MODE
                </div>
              )}
            </div>

            {/* Scoreboard */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", marginBottom: 24 }}>
              <div style={{
                background: isWinning ? "rgba(255,102,0,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${isWinning ? "rgba(255,102,0,0.4)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 16, padding: 16, textAlign: "center",
                boxShadow: isWinning ? "0 0 20px rgba(255,102,0,0.2)" : "none",
              }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 3, color: "#FF6600", marginBottom: 4 }}>YOU</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: "#FF6600", lineHeight: 1 }}>{me?.reps ?? myReps}</div>
                <div style={{ fontSize: 10, color: "#555" }}>REPS</div>
              </div>

              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#555" }}>VS</div>

              <div style={{
                background: !isWinning ? "rgba(200,151,58,0.08)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${!isWinning ? "rgba(200,151,58,0.3)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 16, padding: 16, textAlign: "center",
              }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 3, color: "#C8973A", marginBottom: 4 }}>
                  {opp ? opp.name.split(" ")[0].toUpperCase() : "—"}
                  {opp?.isBot && " 🤖"}
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: "#C8973A", lineHeight: 1 }}>{opp?.reps ?? 0}</div>
                <div style={{ fontSize: 10, color: "#555" }}>REPS</div>
              </div>
            </div>

            {/* REP BUTTON */}
            <button
              onPointerDown={handleRep}
              style={{
                width: "100%", padding: "32px",
                background: tapFeedback
                  ? "linear-gradient(135deg, #cc3700, #aa1a00)"
                  : "linear-gradient(135deg, #FF6600, #DC2626)",
                border: "none", borderRadius: 20,
                color: "#fff", fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 36, letterSpacing: 4,
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(255,102,0,0.5)",
                animation: tapFeedback ? "tapPop 0.15s ease" : "none",
                userSelect: "none", WebkitUserSelect: "none",
                touchAction: "manipulation",
              }}
            >
              TAP — REP
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: "#555", marginTop: 8 }}>
              Tap for each completed rep
            </p>
          </>
        )}

        {/* ─── ENDED ─── */}
        {phase === "ended" && winner && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>
              {winner.user_id === userId ? "🏆" : "💪"}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#FF6600", marginBottom: 8 }}>
              {winner.user_id === userId ? "VICTORY" : "GOOD BATTLE"}
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: "#fff", letterSpacing: 2, marginBottom: 20 }}>
              {winner.user_id === userId ? "YOU WIN!" : `${winner.name.split(" ")[0].toUpperCase()} WINS`}
            </div>

            {/* Final scores */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {participants.length > 0
                ? participants.map(p => (
                    <div key={p.user_id} style={{
                      background: p.user_id === winner.user_id ? "rgba(255,102,0,0.1)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${p.user_id === winner.user_id ? "rgba(255,102,0,0.4)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: 16, padding: 16, textAlign: "center",
                    }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 3, color: p.user_id === userId ? "#FF6600" : "#C8973A", marginBottom: 4 }}>
                        {p.user_id === userId ? "YOU" : p.name.split(" ")[0].toUpperCase()}
                        {p.user_id === winner.user_id && " 🏆"}
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: p.user_id === winner.user_id ? "#FF6600" : "#888", lineHeight: 1 }}>{p.reps}</div>
                      <div style={{ fontSize: 10, color: "#555" }}>REPS</div>
                    </div>
                  ))
                : (
                  <>
                    <div style={{ background: "rgba(255,102,0,0.1)", border: "1px solid rgba(255,102,0,0.4)", borderRadius: 16, padding: 16, textAlign: "center" }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 3, color: "#FF6600", marginBottom: 4 }}>YOU</div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: "#FF6600", lineHeight: 1 }}>{myReps}</div>
                      <div style={{ fontSize: 10, color: "#555" }}>REPS</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 16, textAlign: "center" }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 3, color: "#C8973A", marginBottom: 4 }}>
                        {winner.user_id !== userId ? winner.name.split(" ")[0].toUpperCase() : "OPP"}
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: "#888", lineHeight: 1 }}>{winner.reps}</div>
                      <div style={{ fontSize: 10, color: "#555" }}>REPS</div>
                    </div>
                  </>
                )
              }
            </div>

            {xpEarned > 0 && (
              <div style={{
                background: "rgba(200,151,58,0.1)", border: "1px solid rgba(200,151,58,0.3)",
                borderRadius: 12, padding: 12, marginBottom: 20,
              }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#C8973A", fontWeight: 700 }}>
                  +{xpEarned} XP EARNED
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={resetToSelect}
                style={{
                  flex: 1, padding: "14px",
                  background: "rgba(255,102,0,0.1)", border: "1px solid rgba(255,102,0,0.3)",
                  borderRadius: 12, color: "#FF6600",
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 900, letterSpacing: 2, cursor: "pointer",
                }}
              >
                REMATCH
              </button>
              <button
                onClick={() => navigate("/")}
                style={{
                  flex: 1, padding: "14px",
                  background: "linear-gradient(135deg, #FF6600, #DC2626)",
                  border: "none", borderRadius: 12, color: "#fff",
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 900, letterSpacing: 2, cursor: "pointer",
                }}
              >
                HOME
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
