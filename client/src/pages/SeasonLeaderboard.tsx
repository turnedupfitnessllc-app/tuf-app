/**
 * TUF Season Leaderboard
 * Monthly XP competition with Apex Badge (top 10) and Hunter Badge (top 100)
 * Data: season_01 April 2026
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import HamburgerDrawer from "@/components/HamburgerDrawer";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SeasonEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  streak: number;
  workouts: number;
  badge?: string;
  isCurrentUser?: boolean;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

function generateLeaderboard(): SeasonEntry[] {
  const names = ["Marcus T.", "Alex R.", "Jordan K.", "Sam W.", "Chris M.", "Taylor B.", "Riley J.", "Casey P.", "Morgan L.", "Drew H.",
    "Avery N.", "Quinn S.", "Blake F.", "Reese G.", "Sage D.", "River C.", "Finley A.", "Rowan E.", "Skyler V.", "Phoenix U."];
  return names.map((name, i) => ({
    rank: i + 1,
    userId: `u${i + 1}`,
    name,
    xp: Math.round(2800 - i * 120 + Math.random() * 60),
    streak: Math.round(22 - i * 0.8 + Math.random() * 3),
    workouts: Math.round(28 - i * 0.9 + Math.random() * 2),
    badge: i < 10 ? "APEX" : i < 20 ? "HUNTER" : undefined,
  }));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SeasonLeaderboard() {
  const [, navigate] = useLocation();
  const [entries, setEntries] = useState<SeasonEntry[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  // Season end: April 30, 2026
  useEffect(() => {
    const data = generateLeaderboard();
    // Inject current user
    const rawProfile = localStorage.getItem("tuf_profile");
    const profile = rawProfile ? JSON.parse(rawProfile) : {};
    const userXP = parseInt(localStorage.getItem("tuf_xp") || "0") || 150;
    const userRank = data.findIndex(e => e.xp < userXP);
    const insertAt = userRank === -1 ? data.length : userRank;
    const userEntry: SeasonEntry = {
      rank: insertAt + 1,
      userId: "me",
      name: profile.name || "You",
      xp: userXP,
      streak: profile.streakDays || 0,
      workouts: profile.workoutsCompleted || 0,
      isCurrentUser: true,
    };
    // Re-rank
    const withUser = [...data.slice(0, insertAt), userEntry, ...data.slice(insertAt)].map((e, i) => ({ ...e, rank: i + 1 }));
    setEntries(withUser.slice(0, 25));

    // Countdown
    const update = () => {
      const end = new Date("2026-04-30T23:59:59");
      const diff = end.getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        });
      }
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);

  const rankIcon = (rank: number) => {
    if (rank === 1) return "👑";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const badgeColor = (badge?: string) => {
    if (badge === "APEX") return "#C8973A";
    if (badge === "HUNTER") return "#FF6600";
    return "transparent";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .sl-fade { animation: fadeUp 0.4s ease both; }
      `}</style>

      {/* Sticky header with hamburger */}
      <div style={{ position: "sticky", top: 0, zIndex: 200, background: "rgba(8,8,8,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,255,198,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 56 }}>
        <HamburgerDrawer />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 800, letterSpacing: "0.14em", color: "#fff", textTransform: "uppercase" }}>SEASON LEADERBOARD</span>
        <div style={{ width: 44 }} />
      </div>
      <main className="sl-fade" style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* ─── HEADER ─── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 20, marginBottom: 8 }}>
          <div style={{ width: 44 }} />
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#FF6600" }}>SEASON 01 · APRIL 2026</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, lineHeight: 1, color: "#fff" }}>LEADERBOARD</div>
          </div>
        </div>

        {/* ─── COUNTDOWN ─── */}
        <div style={{
          background: "linear-gradient(135deg, rgba(200,151,58,0.1), rgba(200,151,58,0.05))",
          border: "1px solid rgba(200,151,58,0.3)",
          borderRadius: 16, padding: 16, marginBottom: 16,
        }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#C8973A", marginBottom: 10 }}>SEASON ENDS IN</div>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { label: "DAYS", value: timeLeft.days },
              { label: "HRS", value: timeLeft.hours },
              { label: "MIN", value: timeLeft.minutes },
            ].map(t => (
              <div key={t.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: "#C8973A", lineHeight: 1 }}>{t.value}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: 2, color: "#666" }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── REWARDS ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { badge: "APEX BADGE", range: "Top 10", color: "#C8973A", icon: "👑" },
            { badge: "HUNTER BADGE", range: "Top 100", color: "#FF6600", icon: "🏹" },
          ].map(r => (
            <div key={r.badge} style={{
              background: `${r.color}10`, border: `1px solid ${r.color}40`,
              borderRadius: 12, padding: 12, textAlign: "center",
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{r.icon}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: r.color }}>{r.badge}</div>
              <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{r.range}</div>
            </div>
          ))}
        </div>

        {/* ─── LEADERBOARD ─── */}
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, overflow: "hidden", marginBottom: 16,
        }}>
          {entries.map((entry, i) => (
            <div key={entry.userId} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px",
              background: entry.isCurrentUser ? "rgba(255,102,0,0.08)" : "transparent",
              borderBottom: i < entries.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              borderLeft: entry.isCurrentUser ? "3px solid #FF6600" : "3px solid transparent",
            }}>
              {/* Rank */}
              <div style={{ width: 28, textAlign: "center" }}>
                {rankIcon(entry.rank) ? (
                  <span style={{ fontSize: 18 }}>{rankIcon(entry.rank)}</span>
                ) : (
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: "#555" }}>{entry.rank}</span>
                )}
              </div>

              {/* Name */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, color: entry.isCurrentUser ? "#FF6600" : "#fff", fontWeight: entry.isCurrentUser ? 900 : 600 }}>
                    {entry.name}
                  </span>
                  {entry.isCurrentUser && (
                    <span style={{
                      padding: "1px 6px", borderRadius: 4,
                      background: "rgba(255,102,0,0.2)", border: "1px solid rgba(255,102,0,0.4)",
                      fontSize: 8, color: "#FF6600", fontWeight: 700, letterSpacing: 2,
                    }}>YOU</span>
                  )}
                  {entry.badge && (
                    <span style={{
                      padding: "1px 6px", borderRadius: 4,
                      background: `${badgeColor(entry.badge)}20`,
                      border: `1px solid ${badgeColor(entry.badge)}50`,
                      fontSize: 8, color: badgeColor(entry.badge), fontWeight: 700, letterSpacing: 1,
                    }}>{entry.badge}</span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>
                  {entry.streak}🔥 · {entry.workouts} workouts
                </div>
              </div>

              {/* XP */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#C8973A", lineHeight: 1 }}>{entry.xp}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: 2, color: "#555" }}>XP</div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── CTA ─── */}
        <button
          onClick={() => navigate("/panther-30")}
          style={{
            width: "100%", padding: "18px 24px",
            background: "linear-gradient(135deg, #FF6600, #DC2626)",
            border: "none", borderRadius: 14,
            color: "#fff", fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 18, fontWeight: 900, letterSpacing: 3,
            cursor: "pointer", marginBottom: 16,
          }}
        >
          EARN MORE XP →
        </button>

      </main>
    </div>
  );
}
