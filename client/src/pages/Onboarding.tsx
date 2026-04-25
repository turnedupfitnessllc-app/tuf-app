/**
 * TUF Onboarding — v2.0 Full Funnel
 * Step 0: Welcome → 1: Name → 2: Age/Level → 3: Goal → 4: Issue → 5: Program Assignment
 * Stores full profile + tier + corrective plan in localStorage, then redirects to Home.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { PantherAvatar } from "@/components/PantherAvatar";

// ── Data ─────────────────────────────────────────────────────────────────────

const GOALS = [
  { id: "lose-fat",     label: "Lose Body Fat",       icon: "🔥", desc: "Burn fat, keep muscle" },
  { id: "build-muscle", label: "Build Muscle",         icon: "💪", desc: "Strength & hypertrophy" },
  { id: "move-better",  label: "Move Without Pain",    icon: "🧘", desc: "Correct & restore" },
  { id: "performance",  label: "Athletic Performance", icon: "⚡", desc: "Speed, power, agility" },
  { id: "general",      label: "General Fitness",      icon: "🏃", desc: "Stay active & healthy" },
  { id: "recover",      label: "Injury Recovery",      icon: "🩺", desc: "Rehab & rebuild" },
];

const ISSUES = [
  { id: "knee-valgus",   label: "Knees cave in",          icon: "🦵", correctives: ["glute-bridge","clamshell","lateral-band-walk","squat-with-pause"], pattern: "Lower Crossed Syndrome — weak glutes, tight adductors" },
  { id: "low-back-pain", label: "Lower back pain",         icon: "🔴", correctives: ["hip-flexor-stretch","dead-bug","glute-bridge","bird-dog"], pattern: "LCS — tight hip flexors, weak core/glutes" },
  { id: "tight-hips",    label: "Tight hips",              icon: "🔒", correctives: ["hip-flexor-stretch","pigeon-pose","hip-hinge","lateral-lunge"], pattern: "Hip flexor dominance — sedentary pattern" },
  { id: "forward-head",  label: "Head forward posture",    icon: "😤", correctives: ["chin-tuck","wall-angel","face-pull","thoracic-extension"], pattern: "Upper Crossed Syndrome" },
  { id: "shoulder-pain", label: "Shoulder pain",           icon: "💪", correctives: ["pec-stretch","wall-angel","band-pull-apart","y-t-w"], pattern: "UCS — tight pec minor, weak lower traps" },
  { id: "heel-rise",     label: "Heels rise in squat",     icon: "👟", correctives: ["calf-stretch","ankle-mobility","box-squat","goblet-squat"], pattern: "Tight calves, limited ankle dorsiflexion" },
  { id: "forward-lean",  label: "Excessive forward lean",  icon: "📐", correctives: ["thoracic-extension","hip-flexor-stretch","goblet-squat","rdl"], pattern: "LCS — tight hip flexors, weak thoracic extensors" },
  { id: "none",          label: "No specific issue",       icon: "✅", correctives: ["glute-bridge","dead-bug","thoracic-extension","bird-dog"], pattern: "General corrective maintenance" },
];

const FITNESS_LEVELS = [
  { id: "beginner",     label: "Beginner",     desc: "New to structured training" },
  { id: "intermediate", label: "Intermediate", desc: "Training 1–3 years" },
  { id: "advanced",     label: "Advanced",     desc: "4+ years, competitive" },
];

// Program assignment based on tier
const FREE_PROGRAM = {
  id: "free-7day",
  name: "7-Day Starter Plan",
  days: 7,
  tier: "free",
  desc: "Your free intro — 7 days of corrective movement and foundational strength.",
  color: "#888",
};

// ── Step indicator ────────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < current ? "w-6 h-2 bg-primary" : i === current ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-border"
          }`}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0); // 0=welcome, 1=name, 2=age/level, 3=goal, 4=issue, 5=program
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [fitnessLevel, setFitnessLevel] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<typeof ISSUES[0] | null>(null);

  const totalSteps = 4; // steps 1-4 (name, age/level, goal, issue)

  const handleComplete = async () => {
    // Generate a stable user_id (or reuse existing)
    const existingId = localStorage.getItem("tuf_user_id");
    const userId = existingId || `tuf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    if (!existingId) localStorage.setItem("tuf_user_id", userId);

    const profile = {
      name: name.trim() || "Athlete",
      age: parseInt(age) || null,
      fitnessLevel: fitnessLevel || "beginner",
      goal: selectedGoal,
      primaryIssue: selectedIssue?.id || null,
      tier: "free",
      joinDate: Date.now(),
      mobilityScore: 7,
      strengthScore: 6,
      workoutsCompleted: 0,
      streakDays: 0,
      assignedProgram: FREE_PROGRAM.id,
    };
    localStorage.setItem("tuf_profile", JSON.stringify(profile));
    localStorage.setItem("tuf_tier", "free");
    localStorage.setItem("tuf_onboarded", "true");

    if (selectedIssue && selectedIssue.id !== "none") {
      localStorage.setItem("tuf_correctives", JSON.stringify({
        issue: selectedIssue,
        timestamp: Date.now(),
      }));
    }

    // Persist to server DB (non-blocking — don't block navigation on failure)
    try {
      await fetch("/api/db/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          name: profile.name,
          age: profile.age,
          fitness_level: profile.fitnessLevel as "beginner" | "intermediate" | "advanced",
          goals: profile.goal ? [profile.goal] : [],
          injuries: selectedIssue && selectedIssue.id !== "none" ? [selectedIssue.id] : [],
          equipment: [],
          created_at: Date.now(),
          updated_at: Date.now(),
        }),
      });
    } catch (e) {
      // Non-fatal — localStorage is the source of truth for now
      console.warn("[Onboarding] DB save failed (non-fatal):", e);
    }

    navigate("/");
  };

  // ── Step 0: Welcome ─────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div
        style={{
          background: "#000",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* ── Cinematic: brand name drops in from top ── */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          textAlign: "center",
          paddingTop: 52,
          zIndex: 5,
          animation: "tufFadeDown 0.7s ease-out 0.7s both",
        }}>
          <p style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 13, letterSpacing: 7,
            color: "rgba(255,102,0,0.85)",
            textShadow: "0 0 12px rgba(255,102,0,0.5)",
          }}>
            TURNED UP FITNESS
          </p>
        </div>

        {/* ── Top spacer — pushes video to vertical center ── */}
        <div style={{ flex: "1.2", minHeight: 0 }} />

        {/* ── Fire video — square, padded, centered ── */}
        <div style={{
          width: "calc(100% - 48px)",
          maxWidth: 340,
          aspectRatio: "1 / 1",
          borderRadius: 16,
          overflow: "hidden",
          flexShrink: 0,
          position: "relative",
          zIndex: 2,
        }}>
          <video
            autoPlay muted playsInline loop
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/_users_e72db2bb-567c-4ca9-8c2a-17e00854da58_generated_034c96d4-9ddb-40f3-8e07-3b9307c66946_generated_video(1)_a553328f.mp4"
          />
        </div>

        {/* ── Gradient fade below video ── */}
        <div style={{
          width: "calc(100% - 48px)",
          maxWidth: 340,
          height: 56,
          marginTop: -28,
          flexShrink: 0,
          background: "linear-gradient(to bottom, transparent, #000)",
          pointerEvents: "none",
          position: "relative", zIndex: 3,
        }} />

        {/* ── UI fades up from bottom ── */}
        <div style={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 24px 44px",
          textAlign: "center",
          position: "relative", zIndex: 4,
          animation: "tufFadeUp 0.7s ease-out 1.6s both",
        }}>
          <p style={{ fontSize: 11, color: "#666", marginBottom: 22 }}>
            AI-powered coaching built for the 40+ athlete.
          </p>
          <button
            onClick={() => setStep(1)}
            style={{
              width: "100%", padding: "16px",
              borderRadius: 14, border: "none",
              background: "linear-gradient(135deg, #FF6600, #DC2626)",
              color: "#fff",
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 18, letterSpacing: 3,
              cursor: "pointer",
              boxShadow: "0 4px 24px rgba(255,102,0,0.45)",
            }}
          >
            GET STARTED →
          </button>
          <button
            onClick={handleComplete}
            style={{
              width: "100%", marginTop: 10, padding: "8px",
              background: "none", border: "none",
              fontSize: 11, color: "#333", cursor: "pointer",
            }}
          >
            Skip setup
          </button>
        </div>

        <style>{`
          @keyframes tufFadeDown {
            from { opacity: 0; transform: translateY(-14px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes tufFadeUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  // ── Step 1: Name ────────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 pt-12 pb-8">
        <div className="max-w-[480px] mx-auto w-full flex-1 flex flex-col">
          <StepDots current={0} total={totalSteps} />
          <div className="flex flex-col items-center mb-8">
            <PantherAvatar state="coaching" size="md" message="What do I call you?" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-foreground mb-1">
            WHAT'S YOUR <span className="text-primary">NAME?</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            The Panther System will use this to personalize your coaching.
          </p>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="First name" maxLength={30} autoFocus
            className="w-full px-4 py-4 rounded-2xl border-2 border-border bg-card text-foreground font-bold text-lg placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          <div className="mt-auto pt-8 space-y-3">
            <button
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black text-base tracking-wide shadow-lg active:scale-[0.98] transition-all"
            >
              {name.trim() ? `NICE TO MEET YOU, ${name.trim().toUpperCase()} →` : "CONTINUE →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Age + Fitness Level ─────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 pt-12 pb-8">
        <div className="max-w-[480px] mx-auto w-full flex-1 flex flex-col">
          <StepDots current={1} total={totalSteps} />
          <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors self-start">
            ← Back
          </button>
          <h2 className="text-2xl font-black tracking-tight text-foreground mb-1">
            YOUR <span className="text-primary">PROFILE</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            This shapes your program intensity and recovery protocols.
          </p>

          {/* Age input */}
          <label className="text-xs font-bold tracking-widest text-muted-foreground mb-2 block">AGE</label>
          <input
            type="number" value={age} onChange={(e) => setAge(e.target.value)}
            placeholder="Your age" min={18} max={99}
            className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-card text-foreground font-bold text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mb-6"
          />

          {/* Fitness level */}
          <label className="text-xs font-bold tracking-widest text-muted-foreground mb-3 block">FITNESS LEVEL</label>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {FITNESS_LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => setFitnessLevel(level.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all active:scale-[0.97] text-center ${
                  fitnessLevel === level.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <p className="font-black text-xs tracking-wide text-foreground">{level.label}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{level.desc}</p>
              </button>
            ))}
          </div>

          {/* 40+ note */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 mb-6">
            <p className="text-xs text-primary font-bold">BUILT FOR THE 40+ ATHLETE</p>
            <p className="text-xs text-muted-foreground mt-0.5">Programs adapt for recovery, joint health, and hormonal shifts after 40.</p>
          </div>

          <div className="mt-auto pt-4 space-y-3">
            <button
              onClick={() => setStep(3)}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black text-base tracking-wide shadow-lg active:scale-[0.98] transition-all"
            >
              CONTINUE →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 3: Goal ────────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 pt-12 pb-8">
        <div className="max-w-[480px] mx-auto w-full flex-1 flex flex-col">
          <StepDots current={2} total={totalSteps} />
          <button onClick={() => setStep(2)} className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors self-start">
            ← Back
          </button>
          <h2 className="text-2xl font-black tracking-tight text-foreground mb-1">
            WHAT'S YOUR <span className="text-primary">GOAL?</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {name.trim() ? `${name.trim()}, this` : "This"} shapes your entire training plan.
          </p>
          <div className="grid grid-cols-2 gap-3 flex-1">
            {GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`flex flex-col items-start gap-2 p-4 rounded-2xl border-2 transition-all active:scale-[0.97] text-left ${
                  selectedGoal === goal.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <span className="text-2xl">{goal.icon}</span>
                <p className="font-black text-xs tracking-wide text-foreground leading-tight">{goal.label}</p>
                <p className="text-xs text-muted-foreground">{goal.desc}</p>
              </button>
            ))}
          </div>
          <div className="pt-6 space-y-3">
            <button
              onClick={() => selectedGoal && setStep(4)}
              disabled={!selectedGoal}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black text-base tracking-wide shadow-lg active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              CONTINUE →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 4: Primary Issue ───────────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 pt-12 pb-8">
        <div className="max-w-[480px] mx-auto w-full flex-1 flex flex-col">
          <StepDots current={3} total={totalSteps} />
          <button onClick={() => setStep(3)} className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors self-start">
            ← Back
          </button>
          <h2 className="text-2xl font-black tracking-tight text-foreground mb-1">
            ANY <span className="text-primary">ISSUES?</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            The Panther System will build your corrective plan around this.
          </p>
          <div className="grid grid-cols-2 gap-3 flex-1">
            {ISSUES.map((issue) => (
              <button
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className={`flex flex-col items-start gap-2 p-4 rounded-2xl border-2 transition-all active:scale-[0.97] text-left ${
                  selectedIssue?.id === issue.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <span className="text-2xl">{issue.icon}</span>
                <p className="font-black text-xs tracking-wide text-foreground leading-tight">{issue.label}</p>
              </button>
            ))}
          </div>
          {selectedIssue && (
            <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs font-bold text-primary">{selectedIssue.pattern}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{selectedIssue.correctives.length} corrective exercises prescribed</p>
            </div>
          )}
          <div className="pt-4 space-y-3">
            <button
              onClick={() => selectedIssue && setStep(5)}
              disabled={!selectedIssue}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black text-base tracking-wide shadow-lg active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              CONTINUE →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 5: Program Assignment ──────────────────────────────────────────────
  if (step === 5) {
    const goalLabel = GOALS.find(g => g.id === selectedGoal)?.label || "your goal";
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col px-6 pt-12 pb-8">
        <div className="max-w-[480px] mx-auto w-full flex-1 flex flex-col">

          {/* Header */}
          <div className="text-center mb-8">
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 4, color: "#FF6600", marginBottom: 8 }}>
              PROGRAM ASSIGNED
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: "#fff", letterSpacing: 2, lineHeight: 1 }}>
              YOUR PLAN IS<br /><span style={{ color: "#FF6600" }}>READY</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              Based on your goal: <span className="text-white font-bold">{goalLabel}</span>
            </p>
          </div>

          {/* Free program card */}
          <div style={{
            background: "linear-gradient(135deg, #1a1a1a, #111)",
            border: "1px solid rgba(255,102,0,0.4)",
            borderRadius: 20, padding: 24, marginBottom: 16,
            boxShadow: "0 0 30px rgba(255,102,0,0.15)",
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, letterSpacing: 4, color: "#FF6600", marginBottom: 8 }}>
              FREE — INCLUDED
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#fff", letterSpacing: 2, marginBottom: 8 }}>
              7-DAY STARTER PLAN
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {FREE_PROGRAM.desc}
            </p>
            <div className="flex gap-4">
              {["7 Workouts", "Corrective Focus", "Daily Coaching"].map(tag => (
                <span key={tag} style={{ fontSize: 10, letterSpacing: 2, color: "#FF6600", fontWeight: 700 }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Upgrade teaser */}
          <div style={{
            background: "linear-gradient(135deg, rgba(139,0,0,0.15), rgba(255,102,0,0.08))",
            border: "1px solid rgba(255,102,0,0.2)",
            borderRadius: 16, padding: 16, marginBottom: 24,
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, letterSpacing: 3, color: "#888", marginBottom: 4 }}>
              UNLOCK MORE
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-white">30-Day Panther Program</p>
                <p className="text-xs text-muted-foreground">Full transformation system</p>
              </div>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#FF6600" }}>$19</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-sm font-black text-white">Advanced System</p>
                <p className="text-xs text-muted-foreground">12-week elite protocol</p>
              </div>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#FF6600" }}>$79</span>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-auto space-y-3">
            <button
              onClick={handleComplete}
              className="w-full py-4 rounded-2xl text-white font-black text-base tracking-wide active:scale-[0.98] transition-all"
              style={{ background: 'linear-gradient(135deg, #FF6600, #DC2626)', boxShadow: '0 4px 24px rgba(255,102,0,0.4)' }}
            >
              START MY FREE PLAN →
            </button>
            <p className="text-center text-xs text-muted-foreground">
              No credit card required · Upgrade anytime
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
