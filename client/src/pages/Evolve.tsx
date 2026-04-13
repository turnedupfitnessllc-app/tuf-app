/**
 * TUF EVOLVE — v4.0
 * Arc: Hook(your stage) → Problem(gap to next) → Fix(milestones)
 *      → Demo(achievements) → Cues(Panther) → CTA(train more)
 */
import { useLocation } from "wouter";
import { PantherPresence, PantherMessage, V4Card, SceneHeader, XPBar } from "@/components/v4Components";
import { STAGE_LADDER, ls, getStageFromXP } from "@/data/v4constants";
import { useProgress } from "@/hooks/useProgress";

const ACHIEVEMENTS = [
  { id: "first_session",   icon: "⚡", label: "FIRST STEP",       desc: "Completed first session",    xp: 10 },
  { id: "first_assess",    icon: "🧠", label: "SELF-AWARE",       desc: "Completed first assessment",  xp: 10 },
  { id: "streak_3",        icon: "🔥", label: "3-DAY STREAK",     desc: "3 consecutive training days", xp: 20 },
  { id: "streak_7",        icon: "🔥", label: "WEEK WARRIOR",     desc: "7-day streak",                xp: 50 },
  { id: "sessions_5",      icon: "🏋️", label: "CONSISTENT",      desc: "5 sessions completed",        xp: 25 },
  { id: "sessions_10",     icon: "🏋️", label: "DEDICATED",       desc: "10 sessions completed",       xp: 50 },
  { id: "stealth_stage",   icon: "🐆", label: "STEALTH MODE",     desc: "Reached Stealth stage",       xp: 0  },
  { id: "controlled_stage",icon: "🐆", label: "CONTROLLED",       desc: "Reached Controlled stage",    xp: 0  },
  { id: "dominant_stage",  icon: "🐆", label: "DOMINANT",         desc: "Reached Dominant stage",      xp: 0  },
  { id: "apex_stage",      icon: "🐆", label: "APEX PREDATOR",    desc: "Reached Apex Predator",       xp: 0  },
  { id: "week1_done",      icon: "📅", label: "WEEK 1 COMPLETE",  desc: "Finished Week 1 program",     xp: 30 },
  { id: "week4_done",      icon: "📅", label: "FULL CYCLE",       desc: "Completed 4-week program",    xp: 100},
];

export default function Evolve() {
  const [, navigate] = useLocation();

  const { progress } = useProgress();
  const xp       = progress.xp || 0;
  const sessions = progress.sessionsCompleted || 0;
  const streak   = progress.streakDays || 0;
  const stage    = getStageFromXP(xp);

  const currentStageData = STAGE_LADDER.find(s => s.id === stage) || STAGE_LADDER[0];
  const nextStageData    = STAGE_LADDER.find(s => s.xpMin > xp);
  const xpToNext         = nextStageData ? nextStageData.xpMin - xp : 0;

  // Determine unlocked achievements
  const unlocked = new Set<string>();
  if (sessions >= 1)  unlocked.add("first_session");
  if (sessions >= 5)  unlocked.add("sessions_5");
  if (sessions >= 10) unlocked.add("sessions_10");
  if (streak >= 3)    unlocked.add("streak_3");
  if (streak >= 7)    unlocked.add("streak_7");
  if (xp >= 100)      unlocked.add("stealth_stage");
  if (xp >= 300)      unlocked.add("controlled_stage");
  if (xp >= 600)      unlocked.add("dominant_stage");
  if (xp >= 1000)     unlocked.add("apex_stage");
  const correctives = ls.get<{ issue?: object } | null>("tuf_correctives", null);
  if (correctives?.issue) unlocked.add("first_assess");
  const progDone = ls.get<Record<string, boolean>>("tuf_prog_done", {});
  if (Object.keys(progDone).filter(k => k.startsWith("w1_")).length >= 3) unlocked.add("week1_done");
  if (Object.keys(progDone).length >= 12) unlocked.add("week4_done");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 96 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes ambient { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
        @keyframes ring    { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.05);opacity:1} }
        @keyframes scan    { 0%{top:-2%;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:102%;opacity:0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes goldPulse { 0%,100%{opacity:0.8} 50%{opacity:1;filter:brightness(1.4)} }
      `}</style>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "80px 16px 0", position: "relative" }}>

        {/* Back to Home */}
        <button
          onClick={() => navigate("/")}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", marginBottom: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", cursor: "pointer" }}
        >
          ← HOME
        </button>

        {/* SCENE 1 — HOOK: Stage hero */}
        <div style={{ marginBottom: 20, animation: "fadeUp 0.4s ease forwards" }}>
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.18em", color: "#FF4500", marginBottom: 4,
          }}>
            YOUR EVOLUTION
          </p>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: "0.07em",
            color: "var(--text-primary)", lineHeight: 1.05,
          }}>
            STAGE: <span style={{ color: currentStageData.color }}>{stage}</span>
          </h1>
        </div>

        {/* Panther + XP */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <PantherPresence state="dominant" size={140} />
        </div>

        <V4Card accent={currentStageData.color} style={{ marginBottom: 14 }}>
          <XPBar xp={xp} stage={stage} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <div>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)",
              }}>
                TOTAL XP
              </p>
              <p style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: currentStageData.color,
              }}>
                {xp}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)",
              }}>
                SESSIONS
              </p>
              <p style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "var(--text-primary)",
              }}>
                {sessions}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)",
              }}>
                STREAK
              </p>
              <p style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#C8973A",
                animation: streak > 0 ? "goldPulse 2s ease-in-out infinite" : "none",
              }}>
                {streak}🔥
              </p>
            </div>
          </div>
        </V4Card>

        {/* SCENE 2 — PROBLEM: Stage ladder */}
        <V4Card style={{ marginBottom: 14 }}>
          <SceneHeader num="02" label="STAGE LADDER" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {STAGE_LADDER.map((s, i) => {
              const isActive  = s.id === stage;
              const isUnlocked = xp >= s.xpMin;
              return (
                <div
                  key={s.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", borderRadius: 12,
                    background: isActive ? `${s.color}18` : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isActive ? s.color + "55" : isUnlocked ? s.color + "22" : "rgba(255,255,255,0.05)"}`,
                    opacity: isUnlocked ? 1 : 0.4,
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: isUnlocked ? `${s.color}22` : "rgba(255,255,255,0.05)",
                    border: `1px solid ${isUnlocked ? s.color + "55" : "rgba(255,255,255,0.1)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 12 }}>{isUnlocked ? s.icon : "🔒"}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
                      letterSpacing: "0.06em", color: isActive ? s.color : isUnlocked ? "#fff" : "rgba(255,255,255,0.4)",
                    }}>
                      {s.id}
                    </p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                      {s.xpMin} XP {isActive ? "← YOU ARE HERE" : ""}
                    </p>
                  </div>
                  {isActive && (
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700,
                      letterSpacing: "0.1em", color: s.color,
                      padding: "2px 8px", borderRadius: 4,
                      background: `${s.color}18`,
                    }}>
                      ACTIVE
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </V4Card>

        {/* Next stage progress */}
        {nextStageData && (
          <V4Card accent="#C8973A" style={{ marginBottom: 14 }}>
            <SceneHeader num="03" label="NEXT EVOLUTION" color="#C8973A" />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700,
                color: nextStageData.color,
              }}>
                {nextStageData.id}
              </p>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700,
                color: "#C8973A",
              }}>
                {xpToNext} XP AWAY
              </p>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${Math.min(100, ((xp - currentStageData.xpMin) / (nextStageData.xpMin - currentStageData.xpMin)) * 100)}%`,
                background: `linear-gradient(90deg, ${currentStageData.color}88, ${nextStageData.color})`,
                borderRadius: 3, transition: "width 0.8s ease",
              }} />
            </div>
          </V4Card>
        )}

        {/* SCENE 4 — DEMO: Achievements */}
        <V4Card style={{ marginBottom: 14 }}>
          <SceneHeader num="04" label="ACHIEVEMENTS" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {ACHIEVEMENTS.map(a => {
              const isUnlocked = unlocked.has(a.id);
              return (
                <div
                  key={a.id}
                  style={{
                    padding: "12px 8px", borderRadius: 12,
                    border: `1px solid ${isUnlocked ? "rgba(200,151,58,0.3)" : "rgba(255,255,255,0.05)"}`,
                    background: isUnlocked ? "rgba(200,151,58,0.06)" : "rgba(255,255,255,0.02)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    opacity: isUnlocked ? 1 : 0.35,
                  }}
                >
                  <span style={{ fontSize: 18, filter: isUnlocked ? "none" : "grayscale(100%)" }}>
                    {a.icon}
                  </span>
                  <p style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.06em", color: isUnlocked ? "#C8973A" : "rgba(255,255,255,0.3)",
                    textAlign: "center", lineHeight: 1.2,
                  }}>
                    {a.label}
                  </p>
                </div>
              );
            })}
          </div>
        </V4Card>

        {/* SCENE 5 — CUES: Panther */}
        <PantherMessage
          headline={`${stage} — THIS IS WHERE YOU ARE.`}
          body={currentStageData.description}
          directive={nextStageData ? `${xpToNext} XP separates you from ${nextStageData.id}. Every session earns 20 XP. Every question to Panther earns 5-25 XP.` : "You have reached the pinnacle. Now help others get here."}
        />

        {/* SCENE 6 — CTA */}
        <button
          onClick={() => navigate("/program")}
          style={{
            width: "100%", padding: "18px", borderRadius: 20, border: "none",
            background: "linear-gradient(135deg, #FF4500, #8B0000)",
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.1em",
            color: "var(--text-primary)", cursor: "pointer",
            boxShadow: "0 4px 32px rgba(255,69,0,0.35)",
          }}
        >
          EARN MORE XP — TRAIN NOW →
        </button>

        {/* Upgrade plan button */}
        <button
          onClick={() => navigate("/pricing")}
          style={{
            width: "100%", padding: "14px", borderRadius: 20, marginTop: 12,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(200,151,58,0.3)",
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: "0.1em",
            color: "#C8973A", cursor: "pointer",
          }}
        >
          UPGRADE YOUR PLAN →
        </button>

      </main>
    </div>
  );
}
