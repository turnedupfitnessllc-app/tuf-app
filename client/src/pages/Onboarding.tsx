/**
 * TUF Onboarding — First-Launch Flow
 * Step 1: Name  →  Step 2: Goal  →  Step 3: Primary Issue
 * Stores profile + corrective plan in localStorage, then redirects to Home.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { PantherAvatar } from "@/components/PantherAvatar";

// ── Data ─────────────────────────────────────────────────────────────────────

const GOALS = [
  { id: "lose-fat",      label: "Lose Body Fat",        icon: "🔥", desc: "Burn fat, keep muscle" },
  { id: "build-muscle",  label: "Build Muscle",          icon: "💪", desc: "Strength & hypertrophy" },
  { id: "move-better",   label: "Move Without Pain",     icon: "🧘", desc: "Correct & restore" },
  { id: "performance",   label: "Athletic Performance",  icon: "⚡", desc: "Speed, power, agility" },
  { id: "general",       label: "General Fitness",       icon: "🏃", desc: "Stay active & healthy" },
  { id: "recover",       label: "Injury Recovery",       icon: "🩺", desc: "Rehab & rebuild" },
];

const ISSUES = [
  { id: "knee-valgus",   label: "Knees cave in",            icon: "🦵", correctives: ["glute-bridge","clamshell","lateral-band-walk","squat-with-pause"], pattern: "Lower Crossed Syndrome — weak glutes, tight adductors" },
  { id: "low-back-pain", label: "Lower back pain",          icon: "🔴", correctives: ["hip-flexor-stretch","dead-bug","glute-bridge","bird-dog"], pattern: "LCS — tight hip flexors, weak core/glutes" },
  { id: "tight-hips",    label: "Tight hips",               icon: "🔒", correctives: ["hip-flexor-stretch","pigeon-pose","hip-hinge","lateral-lunge"], pattern: "Hip flexor dominance — sedentary pattern" },
  { id: "forward-head",  label: "Head forward posture",     icon: "😤", correctives: ["chin-tuck","wall-angel","face-pull","thoracic-extension"], pattern: "Upper Crossed Syndrome" },
  { id: "shoulder-pain", label: "Shoulder pain",            icon: "💪", correctives: ["pec-stretch","wall-angel","band-pull-apart","y-t-w"], pattern: "UCS — tight pec minor, weak lower traps" },
  { id: "heel-rise",     label: "Heels rise in squat",      icon: "👟", correctives: ["calf-stretch","ankle-mobility","box-squat","goblet-squat"], pattern: "Tight calves, limited ankle dorsiflexion" },
  { id: "forward-lean",  label: "Excessive forward lean",   icon: "📐", correctives: ["thoracic-extension","hip-flexor-stretch","goblet-squat","rdl"], pattern: "LCS — tight hip flexors, weak thoracic extensors" },
  { id: "none",          label: "No specific issue",        icon: "✅", correctives: ["glute-bridge","dead-bug","thoracic-extension","bird-dog"], pattern: "General corrective maintenance" },
];

// ── Step indicator ────────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < current
              ? "w-6 h-2 bg-primary"
              : i === current
              ? "w-6 h-2 bg-primary"
              : "w-2 h-2 bg-border"
          }`}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0); // 0=welcome, 1=name, 2=goal, 3=issue
  const [name, setName] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<typeof ISSUES[0] | null>(null);
  const [pantherMsg, setPantherMsg] = useState<string | undefined>(undefined);

  const totalSteps = 3;

  const handleComplete = () => {
    // Save profile
    const profile = {
      name: name.trim() || "Athlete",
      goal: selectedGoal,
      primaryIssue: selectedIssue?.id || null,
      onboardedAt: Date.now(),
    };
    localStorage.setItem("tuf_profile", JSON.stringify(profile));

    // Pre-load corrective plan if issue selected
    if (selectedIssue && selectedIssue.id !== "none") {
      localStorage.setItem("tuf_correctives", JSON.stringify({
        issue: selectedIssue,
        timestamp: Date.now(),
      }));
    }

    // Mark onboarding complete
    localStorage.setItem("tuf_onboarded", "true");

    navigate("/");
  };

  // ── Welcome screen ──────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-[400px] w-full">

          {/* Glowing UP logo */}
          <div className="flex justify-center mb-6" style={{ position: "relative" }}>
            {/* Ambient glow */}
            <div style={{
              position: "absolute", inset: -40,
              background: "radial-gradient(circle, rgba(255,69,0,0.18) 0%, transparent 65%)",
              borderRadius: "50%",
              pointerEvents: "none",
            }} />
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 120,
              lineHeight: 1,
              color: "#FF4500",
              letterSpacing: "-0.02em",
              textShadow: [
                "0 0 20px rgba(255,69,0,0.95)",
                "0 0 50px rgba(255,69,0,0.65)",
                "0 0 100px rgba(255,69,0,0.35)",
              ].join(", "),
              position: "relative",
            }}>
              UP
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            AI-powered coaching built for the 40+ athlete.
          </p>
          <p className="text-xs text-muted-foreground mb-8">
            Assess your movement. Correct the root cause. Train without limits.
          </p>

          <button
            onClick={() => setStep(1)}
            className="w-full py-4 rounded-2xl text-white font-black text-base tracking-wide active:scale-[0.98] transition-all"
            style={{
              background: 'linear-gradient(135deg, #FF4500, #DC2626)',
              boxShadow: '0 4px 24px rgba(255,69,0,0.4)',
            }}
          >
            GET STARTED →
          </button>

          <button
            onClick={handleComplete}
            className="w-full mt-3 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip setup
          </button>
        </div>
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
            <PantherAvatar
              state="coaching"
              size="md"
              message="What do I call you?"
            />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-foreground mb-1">
            WHAT'S YOUR <span className="text-primary">NAME?</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            The Panther System will use this to personalize your coaching.
          </p>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name"
            maxLength={30}
            autoFocus
            className="w-full px-4 py-4 rounded-2xl border-2 border-border bg-card text-foreground font-bold text-lg placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />

          <div className="mt-auto pt-8 space-y-3">
            <button
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black text-base tracking-wide shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
            >
              {name.trim() ? `NICE TO MEET YOU, ${name.trim().toUpperCase()} →` : "CONTINUE →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Goal ────────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 pt-12 pb-8">
        <div className="max-w-[480px] mx-auto w-full flex-1 flex flex-col">
          <StepDots current={1} total={totalSteps} />

          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors self-start"
          >
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
                  selectedGoal === goal.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <span className="text-2xl">{goal.icon}</span>
                <p className="font-black text-xs tracking-wide text-foreground leading-tight">
                  {goal.label}
                </p>
                <p className="text-xs text-muted-foreground">{goal.desc}</p>
              </button>
            ))}
          </div>

          <div className="pt-6 space-y-3">
            <button
              onClick={() => selectedGoal && setStep(3)}
              disabled={!selectedGoal}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black text-base tracking-wide shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              CONTINUE →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 3: Primary Issue ───────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 pt-12 pb-8">
        <div className="max-w-[480px] mx-auto w-full flex-1 flex flex-col">
          <StepDots current={2} total={totalSteps} />

          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors self-start"
          >
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
                onClick={() => {
                  setSelectedIssue(issue);
                  setPantherMsg(
                    issue.id === "none"
                      ? "Good. We'll keep you moving clean."
                      : "I see the weakness. Let's fix it."
                  );
                }}
                className={`flex flex-col items-start gap-2 p-4 rounded-2xl border-2 transition-all active:scale-[0.97] text-left ${
                  selectedIssue?.id === issue.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <span className="text-2xl">{issue.icon}</span>
                <p className="font-black text-xs tracking-wide text-foreground leading-tight">
                  {issue.label}
                </p>
              </button>
            ))}
          </div>

          {selectedIssue && (
            <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs font-bold text-primary">{selectedIssue.pattern}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedIssue.correctives.length} corrective exercises prescribed
              </p>
            </div>
          )}

          <div className="pt-4 space-y-3">
            <button
              onClick={() => selectedIssue && handleComplete()}
              disabled={!selectedIssue}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black text-base tracking-wide shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              START MY PLAN →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
