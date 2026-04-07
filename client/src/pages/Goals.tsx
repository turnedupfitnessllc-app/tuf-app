/**
 * TUF Goals Screen — Member Goal Tracking + BMI Calculator
 * Based on TUFGoalsProfilev1.pdf spec
 * Goal Types: Fat Loss · Muscle Gain · Strength · Endurance · Consistency · Body Measurements
 */
import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type GoalType =
  | "fat_loss"
  | "muscle_gain"
  | "strength"
  | "endurance"
  | "consistency"
  | "measurements";

interface Goal {
  id: string;
  type: GoalType;
  name: string;
  startValue: number;
  targetValue: number;
  currentValue: number;
  targetDate: string;
  createdAt: string;
  completed: boolean;
  unit: string;
}

const GOAL_TYPE_CONFIG: Record<
  GoalType,
  { label: string; icon: string; color: string; defaultUnit: string; examples: string[] }
> = {
  fat_loss: {
    label: "Fat Loss",
    icon: "🔥",
    color: "#FF4500",
    defaultUnit: "lbs",
    examples: ["Lose 20 lbs by June", "Drop to 185 lbs", "Lose 15% body fat"],
  },
  muscle_gain: {
    label: "Muscle Gain",
    icon: "💪",
    color: "#C8973A",
    defaultUnit: "lbs",
    examples: ["Gain 10 lbs of muscle", "Reach 200 lbs lean", "Add 2 inches to arms"],
  },
  strength: {
    label: "Strength",
    icon: "⚡",
    color: "#8B0000",
    defaultUnit: "lbs",
    examples: ["Deadlift 300 lbs", "Squat bodyweight x2", "Bench 225 lbs"],
  },
  endurance: {
    label: "Endurance",
    icon: "🏃",
    color: "#2563EB",
    defaultUnit: "min",
    examples: ["Run 5K in 30 min", "Complete 45 min HIIT", "Walk 10,000 steps daily"],
  },
  consistency: {
    label: "Consistency",
    icon: "📅",
    color: "#16A34A",
    defaultUnit: "days",
    examples: ["30-day workout streak", "Train 4x per week for 8 weeks", "Log meals 21 days straight"],
  },
  measurements: {
    label: "Body Measurements",
    icon: "📏",
    color: "#7C3AED",
    defaultUnit: "in",
    examples: ["Lose 4 inches waist", "Reduce hips to 38 in", "Shrink waist to 32 in"],
  },
};

// ─── Demo Goals (pre-populated examples) ─────────────────────────────────────
const DEMO_GOALS: Goal[] = [
  {
    id: "demo_1",
    type: "fat_loss",
    name: "Lose 20 lbs by June",
    startValue: 210,
    targetValue: 190,
    currentValue: 203,
    targetDate: "2026-06-01",
    createdAt: "2026-03-01",
    completed: false,
    unit: "lbs",
  },
  {
    id: "demo_2",
    type: "strength",
    name: "Deadlift 300 lbs",
    startValue: 185,
    targetValue: 300,
    currentValue: 245,
    targetDate: "2026-08-01",
    createdAt: "2026-02-15",
    completed: false,
    unit: "lbs",
  },
  {
    id: "demo_3",
    type: "consistency",
    name: "30-Day Workout Streak",
    startValue: 0,
    targetValue: 30,
    currentValue: 18,
    targetDate: "2026-05-01",
    createdAt: "2026-04-01",
    completed: false,
    unit: "days",
  },
  {
    id: "demo_4",
    type: "measurements",
    name: "Lose 4 Inches Off Waist",
    startValue: 42,
    targetValue: 38,
    currentValue: 40,
    targetDate: "2026-07-01",
    createdAt: "2026-03-15",
    completed: false,
    unit: "in",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcProgress(goal: Goal): number {
  const total = Math.abs(goal.targetValue - goal.startValue);
  if (total === 0) return 100;
  const done = Math.abs(goal.currentValue - goal.startValue);
  return Math.min(100, Math.round((done / total) * 100));
}

function daysLeft(targetDate: string): number {
  const diff = new Date(targetDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function calcBMI(weightLbs: number, heightIn: number): number {
  if (!weightLbs || !heightIn) return 0;
  return (703 * weightLbs) / (heightIn * heightIn);
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "#2563EB" };
  if (bmi < 25) return { label: "Normal Weight", color: "#16A34A" };
  if (bmi < 30) return { label: "Overweight", color: "#C8973A" };
  return { label: "Obese", color: "#FF4500" };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Goals() {
  const [activeTab, setActiveTab] = useState<"goals" | "bmi">("goals");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<GoalType>("fat_loss");
  const [formName, setFormName] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formTarget, setFormTarget] = useState("");
  const [formCurrent, setFormCurrent] = useState("");
  const [formDate, setFormDate] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  // BMI state
  const [bmiWeight, setBmiWeight] = useState("");
  const [bmiHeightFt, setBmiHeightFt] = useState("");
  const [bmiHeightIn, setBmiHeightIn] = useState("");

  // Load goals from localStorage or use demo goals
  useEffect(() => {
    const stored = localStorage.getItem("tuf_goals");
    if (stored) {
      try {
        setGoals(JSON.parse(stored));
      } catch {
        setGoals(DEMO_GOALS);
      }
    } else {
      setGoals(DEMO_GOALS);
    }
  }, []);

  function saveGoals(updated: Goal[]) {
    setGoals(updated);
    localStorage.setItem("tuf_goals", JSON.stringify(updated));
  }

  function handleAddGoal() {
    if (!formName || !formStart || !formTarget || !formCurrent) return;
    const cfg = GOAL_TYPE_CONFIG[formType];
    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      type: formType,
      name: formName,
      startValue: parseFloat(formStart),
      targetValue: parseFloat(formTarget),
      currentValue: parseFloat(formCurrent),
      targetDate: formDate,
      createdAt: new Date().toISOString(),
      completed: false,
      unit: cfg.defaultUnit,
    };
    saveGoals([newGoal, ...goals]);
    resetForm();
  }

  function handleUpdateCurrent(id: string, value: string) {
    const updated = goals.map((g) => {
      if (g.id !== id) return g;
      const current = parseFloat(value) || g.currentValue;
      const progress = calcProgress({ ...g, currentValue: current });
      return { ...g, currentValue: current, completed: progress >= 100 };
    });
    saveGoals(updated);
  }

  function handleDeleteGoal(id: string) {
    saveGoals(goals.filter((g) => g.id !== id));
  }

  function resetForm() {
    setFormName("");
    setFormStart("");
    setFormTarget("");
    setFormCurrent("");
    setFormDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setFormType("fat_loss");
    setShowForm(false);
    setEditingGoal(null);
  }

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);
  const avgProgress =
    activeGoals.length > 0
      ? Math.round(activeGoals.reduce((sum, g) => sum + calcProgress(g), 0) / activeGoals.length)
      : 0;
  const daysActive = goals.length > 0
    ? Math.ceil((Date.now() - new Date(goals[goals.length - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const bmiHeightTotalIn =
    (parseFloat(bmiHeightFt) || 0) * 12 + (parseFloat(bmiHeightIn) || 0);
  const bmiValue = calcBMI(parseFloat(bmiWeight) || 0, bmiHeightTotalIn);
  const bmiInfo = bmiValue > 0 ? bmiCategory(bmiValue) : null;

  return (
    <div
      className="min-h-screen pb-24 pt-16"
      style={{ background: "#080808" }}
    >
      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <div
        className="mx-4 mt-4 rounded-2xl p-4 grid grid-cols-4 gap-2"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {[
          { label: "ACTIVE GOALS", value: activeGoals.length },
          { label: "COMPLETED", value: completedGoals.length },
          { label: "AVG PROGRESS", value: `${avgProgress}%` },
          { label: "DAYS ACTIVE", value: daysActive },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1">
            <span className="text-2xl font-black text-white leading-none">{stat.value}</span>
            <span className="text-[9px] text-gray-500 uppercase tracking-wider text-center leading-tight">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Tab Switcher ──────────────────────────────────────────────────── */}
      <div className="mx-4 mt-4 flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        {(["goals", "bmi"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2.5 text-xs font-black uppercase tracking-widest transition-all"
            style={{
              background: activeTab === tab
                ? "linear-gradient(135deg, #FF4500, #DC2626)"
                : "rgba(255,255,255,0.02)",
              color: activeTab === tab ? "#fff" : "#888",
            }}
          >
            {tab === "goals" ? "🎯 Goals" : "📊 BMI Calculator"}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "goals" && (
        <div className="mx-4 mt-4 space-y-4">

          {/* ── Panther Quote ─────────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(139,0,0,0.12)",
              border: "1px solid rgba(139,0,0,0.3)",
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🐆</span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-1">
                  PANTHER ON GOALS
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Wanting to get healthy isn't a goal. What specifically are you committing to and by when?
                  A goal without a number and a date is a wish. Set both. Then show up every day and close the gap.
                </p>
              </div>
            </div>
          </div>

          {/* ── Add Goal Button ───────────────────────────────────────────── */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, #FF4500, #DC2626)" }}
            >
              + SET A NEW GOAL
            </button>
          )}

          {/* ── New Goal Form ─────────────────────────────────────────────── */}
          {showForm && (
            <div
              className="rounded-2xl p-4 space-y-4"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <p className="text-xs font-black uppercase tracking-widest text-white">SET A NEW GOAL</p>

              {/* Goal Type */}
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">
                  GOAL TYPE
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(GOAL_TYPE_CONFIG) as [GoalType, typeof GOAL_TYPE_CONFIG[GoalType]][]).map(
                    ([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => setFormType(key)}
                        className="py-2 px-1 rounded-xl text-center transition-all"
                        style={{
                          background:
                            formType === key
                              ? `${cfg.color}22`
                              : "rgba(255,255,255,0.03)",
                          border: `1px solid ${formType === key ? cfg.color : "rgba(255,255,255,0.06)"}`,
                        }}
                      >
                        <div className="text-lg">{cfg.icon}</div>
                        <div
                          className="text-[9px] font-black uppercase tracking-wide mt-0.5"
                          style={{ color: formType === key ? cfg.color : "#888" }}
                        >
                          {cfg.label}
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Goal Name */}
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                  GOAL NAME
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={GOAL_TYPE_CONFIG[formType].examples[0]}
                  className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                />
              </div>

              {/* Values row */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "START VALUE", val: formStart, set: setFormStart, placeholder: "e.g. 210" },
                  { label: "TARGET VALUE", val: formTarget, set: setFormTarget, placeholder: "e.g. 190" },
                  { label: "CURRENT VALUE", val: formCurrent, set: setFormCurrent, placeholder: "Where are you now?" },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      value={field.val}
                      onChange={(e) => field.set(e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Target Date */}
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                  TARGET DATE
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    colorScheme: "dark",
                  }}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleAddGoal}
                  disabled={!formName || !formStart || !formTarget || !formCurrent}
                  className="flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #FF4500, #DC2626)" }}
                >
                  ADD GOAL
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-gray-400 transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  CLEAR
                </button>
              </div>
            </div>
          )}

          {/* ── Active Goals List ─────────────────────────────────────────── */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
              YOUR ACTIVE GOALS
            </p>
            {activeGoals.length === 0 ? (
              <div
                className="rounded-2xl p-6 text-center"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="text-gray-600 text-sm">No goals set yet · Add your first goal above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeGoals.map((goal) => {
                  const cfg = GOAL_TYPE_CONFIG[goal.type];
                  const progress = calcProgress(goal);
                  const days = daysLeft(goal.targetDate);
                  return (
                    <div
                      key={goal.id}
                      className="rounded-2xl p-4"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${cfg.color}33`,
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{cfg.icon}</span>
                          <div>
                            <p className="text-sm font-black text-white leading-tight">{goal.name}</p>
                            <p className="text-[10px] uppercase tracking-wider" style={{ color: cfg.color }}>
                              {cfg.label}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-400">
                            {goal.currentValue} {goal.unit} → {goal.targetValue} {goal.unit}
                          </span>
                          <span className="text-xs font-black" style={{ color: cfg.color }}>
                            {progress}%
                          </span>
                        </div>
                        <div
                          className="h-2 rounded-full overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${progress}%`,
                              background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}cc)`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">
                          {days > 0 ? `${days} days left` : "Target date passed"}
                        </span>
                        {/* Quick update current value */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-500">Current:</span>
                          <input
                            type="number"
                            defaultValue={goal.currentValue}
                            onBlur={(e) => handleUpdateCurrent(goal.id, e.target.value)}
                            className="w-16 rounded-lg px-2 py-1 text-xs text-white text-center outline-none"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.1)",
                            }}
                          />
                          <span className="text-[10px] text-gray-500">{goal.unit}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Completed Goals ───────────────────────────────────────────── */}
          {completedGoals.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                ✅ COMPLETED GOALS ({completedGoals.length})
              </p>
              <div className="space-y-2">
                {completedGoals.map((goal) => {
                  const cfg = GOAL_TYPE_CONFIG[goal.type];
                  return (
                    <div
                      key={goal.id}
                      className="rounded-xl px-4 py-3 flex items-center justify-between"
                      style={{
                        background: "rgba(22,163,74,0.08)",
                        border: "1px solid rgba(22,163,74,0.2)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{cfg.icon}</span>
                        <span className="text-sm text-gray-300">{goal.name}</span>
                      </div>
                      <span className="text-xs font-black text-green-400">DONE</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "bmi" && (
        <div className="mx-4 mt-4 space-y-4">

          {/* Panther on BMI */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(139,0,0,0.12)",
              border: "1px solid rgba(139,0,0,0.3)",
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🐆</span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-1">
                  PANTHER ON BMI
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  BMI is a starting point, not a verdict. A 200-lb man with 10% body fat and a 200-lb man
                  with 35% body fat have the same BMI. Use it as one data point — not the whole story.
                </p>
              </div>
            </div>
          </div>

          {/* BMI Input */}
          <div
            className="rounded-2xl p-4 space-y-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p className="text-xs font-black uppercase tracking-widest text-white">BMI CALCULATOR</p>

            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                WEIGHT (LBS)
              </label>
              <input
                type="number"
                value={bmiWeight}
                onChange={(e) => setBmiWeight(e.target.value)}
                placeholder="e.g. 195"
                className="w-full rounded-xl px-3 py-3 text-sm text-white placeholder-gray-600 outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
                HEIGHT
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    value={bmiHeightFt}
                    onChange={(e) => setBmiHeightFt(e.target.value)}
                    placeholder="Feet"
                    className="w-full rounded-xl px-3 py-3 text-sm text-white placeholder-gray-600 outline-none"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={bmiHeightIn}
                    onChange={(e) => setBmiHeightIn(e.target.value)}
                    placeholder="Inches"
                    className="w-full rounded-xl px-3 py-3 text-sm text-white placeholder-gray-600 outline-none"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* BMI Result */}
            {bmiValue > 0 && bmiInfo && (
              <div
                className="rounded-xl p-4 text-center"
                style={{
                  background: `${bmiInfo.color}15`,
                  border: `1px solid ${bmiInfo.color}44`,
                }}
              >
                <p className="text-4xl font-black text-white mb-1">{bmiValue.toFixed(1)}</p>
                <p className="text-sm font-black uppercase tracking-widest" style={{ color: bmiInfo.color }}>
                  {bmiInfo.label}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {bmiWeight} lbs · {bmiHeightFt}'{bmiHeightIn}"
                </p>
              </div>
            )}
          </div>

          {/* BMI Scale Reference */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">BMI SCALE</p>
            <div className="space-y-2">
              {[
                { range: "Below 18.5", label: "Underweight", color: "#2563EB" },
                { range: "18.5 – 24.9", label: "Normal Weight", color: "#16A34A" },
                { range: "25.0 – 29.9", label: "Overweight", color: "#C8973A" },
                { range: "30.0+", label: "Obese", color: "#FF4500" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: row.color }} />
                    <span className="text-xs text-gray-400">{row.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">{row.range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ideal Weight Estimate */}
          {bmiValue > 0 && (
            <div
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                NORMAL WEIGHT RANGE FOR YOUR HEIGHT
              </p>
              {bmiHeightTotalIn > 0 && (
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <p className="text-xl font-black text-white">
                      {Math.round((18.5 * bmiHeightTotalIn * bmiHeightTotalIn) / 703)} lbs
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">MINIMUM</p>
                  </div>
                  <div className="text-gray-600 text-sm">—</div>
                  <div className="text-center">
                    <p className="text-xl font-black text-white">
                      {Math.round((24.9 * bmiHeightTotalIn * bmiHeightTotalIn) / 703)} lbs
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">MAXIMUM</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
