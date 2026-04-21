/**
 * TUF Program Library — Tiered program catalog
 * Free: 7-Day Starter Plan
 * $19 Starter: 30-Day Panther Program
 * $79 Advanced: 12-Week Advanced System
 * $20/mo Member: Exclusive member programs
 */
import { useLocation } from "wouter";
import HamburgerDrawer from "@/components/HamburgerDrawer";

// ── Data ─────────────────────────────────────────────────────────────────────

const PROGRAMS = [
  {
    id: "free-7day",
    tier: "free",
    price: "FREE",
    name: "7-DAY STARTER PLAN",
    subtitle: "Foundation & Corrective",
    days: 7,
    color: "#888",
    glow: "rgba(136,136,136,0.15)",
    badge: "INCLUDED",
    desc: "Build your movement foundation. Corrective protocols, daily coaching, and your first week of structured training.",
    features: ["7 guided workouts", "Corrective movement focus", "Daily Panther Brain tips", "Streak tracking"],
    phases: ["CONTROL"],
    route: "/panther-30",
    locked: false,
  },
  {
    id: "starter-30day",
    tier: "starter",
    price: "$19",
    name: "30-DAY PANTHER PROGRAM",
    subtitle: "Full Transformation System",
    days: 30,
    color: "#FF6600",
    glow: "rgba(255,102,0,0.15)",
    badge: "MOST POPULAR",
    desc: "The complete 30-day system. Four phases — Control, Stability, Strength, Explosion — with adaptive AI coaching throughout.",
    features: ["30 structured workouts", "4-phase progression", "Panther Brain AI analysis", "XP & badge system", "Leaderboard access", "SuccessScreen celebrations"],
    phases: ["CONTROL", "STABILITY", "STRENGTH", "EXPLOSION"],
    route: "/panther-30",
    locked: false, // unlocked for demo — check tier in real impl
  },
  {
    id: "advanced-12week",
    tier: "advanced",
    price: "$79",
    name: "ADVANCED SYSTEM",
    subtitle: "12-Week Elite Protocol",
    days: 84,
    color: "#C8973A",
    glow: "rgba(200,151,58,0.15)",
    badge: "ELITE",
    desc: "For athletes who have completed the 30-day program. Periodized strength, power, and performance protocols with BOA biomechanical analysis.",
    features: ["84 advanced workouts", "Periodized programming", "BOA biomechanical analysis", "Strength + power focus", "Priority AI coaching", "Exclusive badges"],
    phases: ["STRENGTH", "EXPLOSION", "EVOLUTION"],
    route: "/pricing",
    locked: true,
  },
  {
    id: "member-exclusive",
    tier: "member",
    price: "$20/mo",
    name: "MEMBER PROGRAMS",
    subtitle: "Live + Exclusive Content",
    days: 0,
    color: "#9B59B6",
    glow: "rgba(155,89,182,0.15)",
    badge: "MEMBERS ONLY",
    desc: "Exclusive programs released monthly. Live coaching sessions, seasonal challenges, and the full AI coaching suite.",
    features: ["New programs monthly", "Live coaching sessions", "Season leaderboard", "PvP challenges", "Full AI suite", "Exclusive badges"],
    phases: ["ALL PHASES"],
    route: "/pricing",
    locked: true,
  },
];

// ── Phase pill ────────────────────────────────────────────────────────────────

function PhasePill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 4,
      background: `${color}20`, border: `1px solid ${color}50`,
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: 9, fontWeight: 700, letterSpacing: 2,
      color,
    }}>
      {label}
    </span>
  );
}

// ── Program card ──────────────────────────────────────────────────────────────

function ProgramCard({ program, userTier, onSelect }: {
  program: typeof PROGRAMS[0];
  userTier: string;
  onSelect: () => void;
}) {
  const tierOrder = ["free", "starter", "advanced", "member"];
  const userTierIdx = tierOrder.indexOf(userTier);
  const programTierIdx = tierOrder.indexOf(program.tier);
  const isUnlocked = userTierIdx >= programTierIdx;
  const isActive = userTier === program.tier || (program.tier === "free" && userTierIdx >= 0);

  return (
    <div
      onClick={onSelect}
      style={{
        background: `linear-gradient(135deg, #1a1a1a, #111)`,
        border: `1px solid ${isActive ? program.color : "rgba(255,255,255,0.08)"}`,
        borderRadius: 20, padding: 20, marginBottom: 12,
        boxShadow: isActive ? `0 0 30px ${program.glow}` : "none",
        cursor: "pointer", position: "relative", overflow: "hidden",
        opacity: !isUnlocked ? 0.7 : 1,
        transition: "transform 0.15s ease",
      }}
    >
      {/* Lock overlay */}
      {!isUnlocked && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          fontSize: 18, opacity: 0.6,
        }}>🔒</div>
      )}

      {/* Badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{
          padding: "3px 10px", borderRadius: 6,
          background: `${program.color}20`, border: `1px solid ${program.color}50`,
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 9, fontWeight: 700, letterSpacing: 3,
          color: program.color,
        }}>
          {program.badge}
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: program.color, lineHeight: 1 }}>
          {program.price}
        </div>
      </div>

      {/* Title */}
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: "#fff", letterSpacing: 2, lineHeight: 1, marginBottom: 4 }}>
        {program.name}
      </div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#888", letterSpacing: 2, marginBottom: 12 }}>
        {program.subtitle} {program.days > 0 && `· ${program.days} DAYS`}
      </div>

      {/* Description */}
      <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.6, marginBottom: 14 }}>
        {program.desc}
      </p>

      {/* Phases */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {program.phases.map(p => <PhasePill key={p} label={p} color={program.color} />)}
      </div>

      {/* Features */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
        {program.features.map(f => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: program.color }}>✓</span>
            <span style={{ fontSize: 11, color: "#888" }}>{f}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        width: "100%", padding: "12px 16px",
        background: isUnlocked ? `linear-gradient(135deg, ${program.color}, ${program.color}bb)` : "rgba(255,255,255,0.05)",
        border: isUnlocked ? "none" : "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12, textAlign: "center",
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 14, fontWeight: 900, letterSpacing: 3,
        color: isUnlocked ? "#fff" : "#555",
      }}>
        {isUnlocked ? (isActive ? "CONTINUE PROGRAM →" : "START PROGRAM →") : `UNLOCK FOR ${program.price} →`}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProgramLibrary() {
  const [, navigate] = useLocation();
  const userTier = localStorage.getItem("tuf_tier") || "free";

  const handleSelect = (program: typeof PROGRAMS[0]) => {
    if (program.locked) {
      navigate("/pricing");
    } else {
      navigate(program.route);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .lib-fade { animation: fadeUp 0.4s ease both; }
      `}</style>

      {/* Sticky header with hamburger */}
      <div style={{ position: "sticky", top: 0, zIndex: 200, background: "rgba(8,8,8,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,255,198,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 56 }}>
        <HamburgerDrawer />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 800, letterSpacing: "0.14em", color: "#fff", textTransform: "uppercase" }}>PROGRAMS</span>
        <div style={{ width: 44 }} />
      </div>
      <main className="lib-fade" style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* ─── HEADER ─── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 20, marginBottom: 8 }}>
          <div style={{ width: 44 }} />
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#FF6600" }}>TURNED UP FITNESS</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, lineHeight: 1, color: "#fff" }}>PROGRAMS</div>
          </div>
        </div>

        <p style={{ fontSize: 12, color: "#666", marginBottom: 24, paddingLeft: 4 }}>
          Choose your program. The system adapts as you progress.
        </p>

        {/* ─── PROGRAM CARDS ─── */}
        {PROGRAMS.map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
            userTier={userTier}
            onSelect={() => handleSelect(program)}
          />
        ))}

        {/* ─── COMPARISON NOTE ─── */}
        <div style={{
          background: "rgba(255,102,0,0.05)", border: "1px solid rgba(255,102,0,0.15)",
          borderRadius: 14, padding: 16, marginBottom: 24,
        }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 3, color: "#FF6600", marginBottom: 6 }}>
            THE PANTHER PATH
          </div>
          <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
            Start free. Build the habit. Unlock the full system when you're ready. Every program builds on the last — the AI adapts with you.
          </p>
        </div>

      </main>
    </div>
  );
}
