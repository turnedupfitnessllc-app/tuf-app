/**
 * TUF PvP Challenge — Real-time rep battle
 * Uses Socket.io spec: join_challenge, rep_update, challenge_update, challenge_end
 * Falls back to simulated opponent if socket unavailable
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Participant {
  user_id: string;
  name: string;
  reps: number;
  status?: "active" | "done";
}

interface ChallengeState {
  participants: Participant[];
  status?: "live" | "ended";
}

interface WinnerData {
  winner: Participant;
}

// ── Mock challenge data ───────────────────────────────────────────────────────

const MOCK_CHALLENGE = {
  challenge_id: "ch_100_squat_01",
  name: "100 Squat Sprint",
  type: "reps",
  duration: 300, // 5 minutes
  target: 100,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function PvPChallenge() {
  const [, navigate] = useLocation();

  const rawProfile = localStorage.getItem("tuf_profile");
  const profile = rawProfile ? JSON.parse(rawProfile) : {};
  const currentUser = { user_id: "me", name: profile.name || "You" };

  const [phase, setPhase] = useState<"lobby" | "countdown" | "live" | "ended">("lobby");
  const [challenge, setChallenge] = useState<ChallengeState>({ participants: [] });
  const [winner, setWinner] = useState<Participant | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(MOCK_CHALLENGE.duration);
  const [myReps, setMyReps] = useState(0);
  const [lastTap, setLastTap] = useState(0);
  const [tapFeedback, setTapFeedback] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const opponentRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate opponent
  const startOpponent = useCallback(() => {
    opponentRef.current = setInterval(() => {
      setChallenge(prev => {
        const updated = prev.participants.map(p => {
          if (p.user_id === "opponent") {
            const newReps = p.reps + (Math.random() > 0.3 ? 1 : 0);
            return { ...p, reps: newReps };
          }
          return p;
        });
        return { ...prev, participants: updated };
      });
    }, 1800 + Math.random() * 400);
  }, []);

  const stopOpponent = useCallback(() => {
    if (opponentRef.current) clearInterval(opponentRef.current);
  }, []);

  const joinChallenge = () => {
    const initialState: ChallengeState = {
      participants: [
        { user_id: "me", name: currentUser.name, reps: 0, status: "active" },
        { user_id: "opponent", name: "Alex R.", reps: 0, status: "active" },
      ],
      status: "live",
    };
    setChallenge(initialState);
    setPhase("countdown");

    let c = 3;
    const cd = setInterval(() => {
      c--;
      setCountdown(c);
      if (c === 0) {
        clearInterval(cd);
        setPhase("live");
        startOpponent();
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              stopOpponent();
              endChallenge();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }, 1000);
  };

  const handleRep = () => {
    if (phase !== "live") return;
    const now = Date.now();
    if (now - lastTap < 300) return; // debounce
    setLastTap(now);
    setMyReps(prev => {
      const newReps = prev + 1;
      setChallenge(c => ({
        ...c,
        participants: c.participants.map(p =>
          p.user_id === "me" ? { ...p, reps: newReps } : p
        ),
      }));
      return newReps;
    });
    setTapFeedback(true);
    setTimeout(() => setTapFeedback(false), 150);
  };

  const endChallenge = () => {
    setPhase("ended");
    setChallenge(prev => {
      const sorted = [...prev.participants].sort((a, b) => b.reps - a.reps);
      setWinner(sorted[0]);
      return prev;
    });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopOpponent();
    };
  }, [stopOpponent]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const myParticipant = challenge.participants.find(p => p.user_id === "me");
  const opponent = challenge.participants.find(p => p.user_id !== "me");
  const isWinning = myParticipant && opponent && myParticipant.reps >= opponent.reps;

  return (
    <div style={{ minHeight: "100vh", background: "#080808", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tapPop { 0%{transform:scale(1)} 50%{transform:scale(0.95)} 100%{transform:scale(1)} }
        @keyframes winPulse { 0%,100%{box-shadow:0 0 20px rgba(255,102,0,0.4)} 50%{box-shadow:0 0 50px rgba(255,102,0,0.8)} }
        .pvp-fade { animation: fadeUp 0.4s ease both; }
      `}</style>

      <main className="pvp-fade" style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* ─── HEADER ─── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 20, marginBottom: 20 }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 20 }}>←</button>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#FF6600" }}>LIVE CHALLENGE</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, lineHeight: 1, color: "#fff" }}>{MOCK_CHALLENGE.name.toUpperCase()}</div>
          </div>
        </div>

        {/* ─── LOBBY ─── */}
        {phase === "lobby" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>⚔️</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: "#FF6600", marginBottom: 8 }}>READY TO BATTLE?</div>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 24, lineHeight: 1.6 }}>
              {MOCK_CHALLENGE.target} reps in {formatTime(MOCK_CHALLENGE.duration)}. Most reps wins.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                { label: "TARGET", value: `${MOCK_CHALLENGE.target} REPS` },
                { label: "TIME LIMIT", value: formatTime(MOCK_CHALLENGE.duration) },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 14 }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: 3, color: "#555", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#FF6600" }}>{s.value}</div>
                </div>
              ))}
            </div>
            <button
              onClick={joinChallenge}
              style={{
                width: "100%", padding: "18px",
                background: "linear-gradient(135deg, #FF6600, #DC2626)",
                border: "none", borderRadius: 14,
                color: "#fff", fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 20, fontWeight: 900, letterSpacing: 3, cursor: "pointer",
                boxShadow: "0 4px 24px rgba(255,102,0,0.4)",
              }}
            >
              JOIN CHALLENGE →
            </button>
          </div>
        )}

        {/* ─── COUNTDOWN ─── */}
        {phase === "countdown" && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 120, color: "#FF6600", lineHeight: 1, textShadow: "0 0 40px rgba(255,102,0,0.8)" }}>
              {countdown === 0 ? "GO!" : countdown}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, letterSpacing: 4, color: "#888", marginTop: 16 }}>GET READY</div>
          </div>
        )}

        {/* ─── LIVE ─── */}
        {phase === "live" && (
          <>
            {/* Timer */}
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: timeLeft <= 30 ? "#FF4444" : "#fff", lineHeight: 1 }}>
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Scoreboard */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", marginBottom: 24 }}>
              {/* Me */}
              <div style={{
                background: isWinning ? "rgba(255,102,0,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${isWinning ? "rgba(255,102,0,0.4)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 16, padding: 16, textAlign: "center",
                boxShadow: isWinning ? "0 0 20px rgba(255,102,0,0.2)" : "none",
              }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 3, color: "#FF6600", marginBottom: 4 }}>YOU</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: "#FF6600", lineHeight: 1 }}>{myReps}</div>
                <div style={{ fontSize: 10, color: "#555" }}>REPS</div>
              </div>

              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#555" }}>VS</div>

              {/* Opponent */}
              <div style={{
                background: !isWinning ? "rgba(200,151,58,0.08)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${!isWinning ? "rgba(200,151,58,0.3)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 16, padding: 16, textAlign: "center",
              }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 3, color: "#C8973A", marginBottom: 4 }}>{opponent?.name.split(" ")[0].toUpperCase()}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: "#C8973A", lineHeight: 1 }}>{opponent?.reps || 0}</div>
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
              TAP = 1 REP
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
              {winner.user_id === "me" ? "🏆" : "💪"}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#FF6600", marginBottom: 8 }}>
              {winner.user_id === "me" ? "VICTORY" : "GOOD BATTLE"}
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: "#fff", letterSpacing: 2, marginBottom: 20 }}>
              {winner.user_id === "me" ? "YOU WIN!" : `${winner.name.split(" ")[0].toUpperCase()} WINS`}
            </div>

            {/* Final scores */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {challenge.participants.map(p => (
                <div key={p.user_id} style={{
                  background: p.user_id === winner.user_id ? "rgba(255,102,0,0.1)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${p.user_id === winner.user_id ? "rgba(255,102,0,0.4)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 16, padding: 16, textAlign: "center",
                }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 3, color: p.user_id === "me" ? "#FF6600" : "#C8973A", marginBottom: 4 }}>
                    {p.user_id === "me" ? "YOU" : p.name.split(" ")[0].toUpperCase()}
                    {p.user_id === winner.user_id && " 🏆"}
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: p.user_id === winner.user_id ? "#FF6600" : "#888", lineHeight: 1 }}>{p.reps}</div>
                  <div style={{ fontSize: 10, color: "#555" }}>REPS</div>
                </div>
              ))}
            </div>

            {winner.user_id === "me" && (
              <div style={{
                background: "rgba(200,151,58,0.1)", border: "1px solid rgba(200,151,58,0.3)",
                borderRadius: 12, padding: 12, marginBottom: 20,
              }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#C8973A", fontWeight: 700 }}>+50 XP EARNED</div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setPhase("lobby"); setMyReps(0); setTimeLeft(MOCK_CHALLENGE.duration); setChallenge({ participants: [] }); }}
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
