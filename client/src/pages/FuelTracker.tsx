/**
 * THE PANTHER SYSTEM — FUEL TRACKER Screen v2.0
 * Clinical Spec: Doc 05 | Build Doc: Doc 06
 * © 2026 TURNED UP FITNESS LLC — CONFIDENTIAL
 *
 * Layout:
 *   1. Header — "FUEL TRACKER" + date + ← HOME
 *   2. Panther FUEL Directive card (flag-triggered)
 *   3. Daily summary rings — calories, protein, MPS triggers
 *   4. Macro breakdown bar + 7-day history mini-chart
 *   5. Meal log — chronological (with delete)
 *   6. FAB — + LOG MEAL
 *   7. Log Meal modal — TUTK recipe search + manual entry
 *   8. Setup modal if no FUEL profile
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import HamburgerDrawer from "@/components/HamburgerDrawer";
import { useLocation } from "wouter";
import { tutkRecipes, type Recipe } from "@/data/tutkRecipes";
import FoodLibrarySearch from "@/components/FoodLibrarySearch";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FuelProfile {
  user_id: string;
  weightKg: number;
  heightCm: number;
  age: number;
  sex: "male" | "female";
  activityLevel: string;
  primaryGoal: string;
  deficitTier: string;
  isPostMenopausal?: boolean;
  conditions: string[];
  calorieTarget: number;
  proteinTargetG: number;
  carbTargetG: number;
  fatTargetG: number;
  rmr: number;
  tdee: number;
}

interface FoodItem {
  name: string;
  servingG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

interface MealEntry {
  mealType: string;
  timeLogged: string;
  foods: FoodItem[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  mpsTriggered: boolean;
  notes?: string;
}

interface DailyFuelLog {
  log_id: string;
  user_id: string;
  date: string;
  meals: MealEntry[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  mpsTriggersCount: number;
  trainingLogged: boolean;
  flags: string[];
  pantherDirective?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MEAL_TYPES: Record<string, { label: string; color: string }> = {
  meal1:         { label: "MEAL 1",         color: "#C8973A" },
  meal2:         { label: "MEAL 2",         color: "#C8973A" },
  meal3:         { label: "MEAL 3",         color: "#C8973A" },
  pre_training:  { label: "PRE-TRAINING",   color: "#4a9eff" },
  post_training: { label: "POST-TRAINING",  color: "#22c55e" },
  pre_sleep:     { label: "PRE-SLEEP",      color: "#8b5cf6" },
  snack:         { label: "SNACK",          color: "#6b7280" },
};

const ACTIVITY_OPTIONS = [
  { value: "sedentary",   label: "Sedentary (desk job, no exercise)" },
  { value: "light",       label: "Light (1–3 days/week)" },
  { value: "moderate",    label: "Moderate (3–5 days/week)" },
  { value: "active",      label: "Active (6–7 days/week)" },
  { value: "very_active", label: "Very Active (twice daily)" },
];

const GOAL_OPTIONS = [
  { value: "fat_loss",    label: "Fat Loss" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "maintenance", label: "Maintenance" },
  { value: "performance", label: "Performance" },
];

const DEFICIT_OPTIONS = [
  { value: "conservative", label: "Conservative (–275 kcal)" },
  { value: "moderate",     label: "Moderate (–500 kcal)" },
  { value: "aggressive",   label: "Aggressive (–875 kcal) ⚠️" },
];

// ─── Ring Component ───────────────────────────────────────────────────────────

function Ring({
  value, max, label, unit, color, size = 100,
}: {
  value: number; max: number; label: string; unit: string; color: string; size?: number;
}) {
  const pct = Math.min(value / Math.max(max, 1), 1);
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={11} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={11}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white font-bold text-base leading-none">{value}</span>
          <span className="text-white/40 text-[10px]">{unit}</span>
        </div>
      </div>
      <span className="text-white/60 text-[10px] font-bold tracking-widest uppercase">{label}</span>
      <span className="text-white/30 text-[10px]">/ {max}</span>
    </div>
  );
}

// ─── 7-Day History Mini-Chart ─────────────────────────────────────────────────

function WeekChart({ logs, calorieTarget }: { logs: DailyFuelLog[]; calorieTarget: number }) {
  const days = ["S","M","T","W","T","F","S"];
  const today = new Date();
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const log = logs.find(l => l.date === dateStr);
    return {
      label: days[d.getDay()],
      isToday: i === 6,
      calories: log?.totalCalories ?? 0,
      protein: log?.totalProteinG ?? 0,
    };
  });
  const maxCal = Math.max(...week.map(d => d.calories), calorieTarget, 1);
  return (
    <div className="mt-4 pt-3 border-t border-white/5">
      <div className="text-white/30 text-[10px] font-black tracking-widest mb-3">7-DAY HISTORY</div>
      <div className="flex items-end justify-between gap-1 h-16">
        {week.map((d, i) => {
          const h = Math.round((d.calories / maxCal) * 56);
          const pct = d.calories / calorieTarget;
          const barColor = d.calories === 0 ? "rgba(255,255,255,0.06)"
            : pct > 1.1 ? "#ef4444"
            : pct >= 0.9 ? "#22c55e"
            : "#C8973A";
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div className="w-full flex items-end justify-center" style={{ height: 56 }}>
                <div
                  className="w-full rounded-t-sm transition-all duration-500"
                  style={{ height: Math.max(h, d.calories > 0 ? 3 : 0), background: barColor, opacity: d.isToday ? 1 : 0.6 }}
                />
              </div>
              <span className={`text-[9px] font-bold ${d.isToday ? "text-white" : "text-white/30"}`}>{d.label}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-white/20 mt-1">
        <span>0</span>
        <span>{calorieTarget} target</span>
      </div>
    </div>
  );
}

// ─── TUTK Recipe Search ───────────────────────────────────────────────────────

function RecipeSearch({ onSelect }: { onSelect: (r: Recipe) => void }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    if (!query.trim()) return tutkRecipes.slice(0, 6);
    const q = query.toLowerCase();
    return tutkRecipes.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q)) ||
      r.ingredients.some(i => i.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [query]);

  return (
    <div>
      <label className="text-white/40 text-[10px] font-black tracking-wider block mb-1">SEARCH TUTK RECIPES</label>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="e.g. chicken, high-protein, scallops..."
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C8973A]/50 placeholder-white/20 mb-2"
      />
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {results.map(r => (
          <button
            key={r.id}
            onClick={() => onSelect(r)}
            className="w-full text-left bg-white/4 hover:bg-[#C8973A]/10 border border-white/6 hover:border-[#C8973A]/30 rounded-xl px-3 py-2.5 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-white text-xs font-bold">{r.name}</span>
              {r.calories && (
                <span className="text-[#C8973A] text-[10px] font-black">{r.calories} kcal</span>
              )}
            </div>
            <div className="flex gap-3 mt-0.5">
              {r.protein && <span className="text-[#4a9eff] text-[9px]">{r.protein}g protein</span>}
              {r.carbs && <span className="text-white/30 text-[9px]">{r.carbs}g carbs</span>}
              {r.fat && <span className="text-white/30 text-[9px]">{r.fat}g fat</span>}
              <span className="text-white/20 text-[9px] capitalize">{r.category}</span>
            </div>
          </button>
        ))}
        {results.length === 0 && (
          <div className="text-white/25 text-xs text-center py-3">No recipes found. Add manually below.</div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FuelTracker() {
  const [, navigate] = useLocation();
  const userId = localStorage.getItem("tuf_user_id") || "guest";
  const today = new Date().toISOString().split("T")[0];

  const [profile, setProfile] = useState<FuelProfile | null>(null);
  const [log, setLog] = useState<DailyFuelLog | null>(null);
  const [recentLogs, setRecentLogs] = useState<DailyFuelLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showLogMeal, setShowLogMeal] = useState(false);
  const [logMealTab, setLogMealTab] = useState<"search" | "library" | "manual">("search");

  // Setup form
  const [sf, setSf] = useState({
    weightKg: "", heightCm: "", age: "",
    sex: "male" as "male" | "female",
    activityLevel: "moderate", primaryGoal: "fat_loss", deficitTier: "moderate",
    isPostMenopausal: false, conditions: [] as string[],
  });

  // Meal form
  const [mf, setMf] = useState({
    mealType: "meal1", notes: "",
    foods: [{ name: "", calories: "", proteinG: "", carbsG: "", fatG: "", servingG: "" }],
  });

  // ─── Load ─────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, lRes, rRes] = await Promise.all([
        fetch(`/api/fuel/profile/${userId}`),
        fetch(`/api/fuel/log/${userId}/${today}`),
        fetch(`/api/fuel/log/recent/${userId}`),
      ]);
      if (pRes.ok) {
        const p = await pRes.json();
        setProfile(p);
        // Pre-fill setup form if editing
        setSf({
          weightKg: String(p.weightKg ?? ""),
          heightCm: String(p.heightCm ?? ""),
          age: String(p.age ?? ""),
          sex: p.sex ?? "male",
          activityLevel: p.activityLevel ?? "moderate",
          primaryGoal: p.primaryGoal ?? "fat_loss",
          deficitTier: p.deficitTier ?? "moderate",
          isPostMenopausal: p.isPostMenopausal ?? false,
          conditions: p.conditions ?? [],
        });
      } else {
        setShowSetup(true);
      }
      if (lRes.ok) setLog(await lRes.json());
      if (rRes.ok) setRecentLogs(await rRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [userId, today]);

  useEffect(() => { load(); }, [load]);

  // ─── Save profile ─────────────────────────────────────────────────────────

  const saveProfile = async () => {
    const res = await fetch("/api/fuel/profile", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        weightKg: parseFloat(sf.weightKg), heightCm: parseFloat(sf.heightCm),
        age: parseInt(sf.age), sex: sf.sex, activityLevel: sf.activityLevel,
        primaryGoal: sf.primaryGoal, deficitTier: sf.deficitTier,
        isPostMenopausal: sf.isPostMenopausal, conditions: sf.conditions,
      }),
    });
    if (res.ok) { setProfile(await res.json()); setShowSetup(false); }
  };

  // ─── Select TUTK recipe ───────────────────────────────────────────────────

  const handleRecipeSelect = (recipe: Recipe) => {
    setMf(prev => ({
      ...prev,
      foods: [{
        name: recipe.name,
        calories: String(recipe.calories ?? ""),
        proteinG: String(recipe.protein ?? ""),
        carbsG: String(recipe.carbs ?? ""),
        fatG: String(recipe.fat ?? ""),
        servingG: String(recipe.servings ? recipe.servings * 100 : ""),
      }],
      notes: recipe.scienceNote ? recipe.scienceNote.slice(0, 80) : "",
    }));
    setLogMealTab("manual");
  };

  // ─── Log meal ─────────────────────────────────────────────────────────────

  const logMeal = async () => {
    const foods = mf.foods.filter(f => f.name.trim()).map(f => ({
      name: f.name, servingG: parseFloat(f.servingG) || 0,
      calories: parseFloat(f.calories) || 0, proteinG: parseFloat(f.proteinG) || 0,
      carbsG: parseFloat(f.carbsG) || 0, fatG: parseFloat(f.fatG) || 0,
    }));
    const totals = foods.reduce((a, f) => ({
      totalCalories: a.totalCalories + f.calories, totalProteinG: a.totalProteinG + f.proteinG,
      totalCarbsG: a.totalCarbsG + f.carbsG, totalFatG: a.totalFatG + f.fatG,
    }), { totalCalories: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0 });

    const res = await fetch("/api/fuel/log/meal", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId, date: today,
        meal: { mealType: mf.mealType, timeLogged: new Date().toISOString(),
          foods, ...totals, mpsTriggered: totals.totalProteinG >= 30, notes: mf.notes },
      }),
    });
    if (res.ok) {
      setLog(await res.json()); setShowLogMeal(false);
      setLogMealTab("search");
      setMf({ mealType: "meal1", notes: "",
        foods: [{ name: "", calories: "", proteinG: "", carbsG: "", fatG: "", servingG: "" }] });
    }
  };

  // ─── Delete meal ──────────────────────────────────────────────────────────

  const deleteMeal = async (mealIndex: number) => {
    if (!log) return;
    const updatedMeals = log.meals.filter((_, i) => i !== mealIndex);
    // Recompute totals client-side for instant feedback
    const totals = updatedMeals.reduce((a, m) => ({
      totalCalories: a.totalCalories + m.totalCalories,
      totalProteinG: a.totalProteinG + m.totalProteinG,
      totalCarbsG: a.totalCarbsG + m.totalCarbsG,
      totalFatG: a.totalFatG + m.totalFatG,
    }), { totalCalories: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0 });
    const mpsCount = updatedMeals.filter(m => m.mpsTriggered).length;
    setLog({ ...log, meals: updatedMeals, ...totals, mpsTriggersCount: mpsCount });
    // Persist: log the updated log (server will overwrite)
    await fetch("/api/fuel/log/meal", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId, date: today,
        meal: { mealType: "_delete_sync", timeLogged: new Date().toISOString(),
          foods: [], totalCalories: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0,
          mpsTriggered: false, notes: `__replace__${JSON.stringify(updatedMeals)}` },
      }),
    }).catch(() => {});
  };

  // ─── Evaluate ─────────────────────────────────────────────────────────────

  const evaluate = async () => {
    setEvaluating(true);
    try {
      const res = await fetch("/api/fuel/log/evaluate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, date: today }),
      });
      if (res.ok) { const d = await res.json(); setLog(d.log); }
    } catch (e) { console.error(e); }
    finally { setEvaluating(false); }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white/40 text-xs tracking-widest animate-pulse">LOADING FUEL DATA...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pb-28">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <HamburgerDrawer />
        <div className="text-center">
          <div className="text-white font-black tracking-widest text-base">FUEL TRACKER</div>
          <div className="text-white/30 text-[10px]">
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </div>
        </div>
        <button onClick={() => setShowSetup(true)} className="text-white/30 hover:text-white/60 transition-colors" title="Edit Profile">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* No profile — setup prompt */}
        {!profile && !showSetup && (
          <div className="bg-[#111] border border-[#C8973A]/30 rounded-2xl p-6 text-center">
            <div className="text-[#C8973A] font-black text-2xl mb-1 tracking-widest">FUEL SETUP</div>
            <div className="text-white/50 text-sm mb-4 leading-relaxed">
              The Panther System needs your body metrics to calculate precise calorie and macro targets.
            </div>
            <button onClick={() => setShowSetup(true)}
              className="bg-[#C8973A] text-black font-bold px-6 py-3 rounded-xl text-sm tracking-wider hover:bg-[#d4a44a] transition-colors">
              SET UP MY FUEL PROFILE
            </button>
          </div>
        )}

        {/* Panther Directive */}
        {log?.pantherDirective && (
          <div className="bg-[#0a0a0a] border border-[#C8973A]/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C8973A] animate-pulse"/>
              <span className="text-[#C8973A] text-[10px] font-black tracking-widest">PANTHER FUEL DIRECTIVE</span>
            </div>
            <div className="text-white/80 text-sm leading-relaxed whitespace-pre-line font-mono">
              {log.pantherDirective}
            </div>
          </div>
        )}

        {/* Summary rings + 7-day chart */}
        {profile && (
          <div className="bg-[#0d0d0d] border border-white/8 rounded-2xl p-5">
            <div className="flex justify-around items-start mb-4">
              <Ring value={Math.round(log?.totalCalories ?? 0)} max={profile.calorieTarget}
                label="Calories" unit="kcal" color="#C8973A" size={108}/>
              <Ring value={Math.round(log?.totalProteinG ?? 0)} max={profile.proteinTargetG}
                label="Protein" unit="g" color="#4a9eff" size={108}/>
              <Ring value={log?.mpsTriggersCount ?? 0} max={3}
                label="MPS" unit="/ 3" color="#22c55e" size={108}/>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-white/5 pt-3">
              <div>
                <div className="text-white/30 mb-0.5">Carbs</div>
                <div className="text-white font-medium">
                  {Math.round(log?.totalCarbsG ?? 0)}g
                  <span className="text-white/25"> / {profile.carbTargetG}g</span>
                </div>
              </div>
              <div>
                <div className="text-white/30 mb-0.5">Fat</div>
                <div className="text-white font-medium">
                  {Math.round(log?.totalFatG ?? 0)}g
                  <span className="text-white/25"> / {profile.fatTargetG}g</span>
                </div>
              </div>
              <div>
                <div className="text-white/30 mb-0.5">TDEE</div>
                <div className="text-white font-medium">{profile.tdee} kcal</div>
              </div>
            </div>

            {/* 7-day history */}
            <WeekChart logs={recentLogs} calorieTarget={profile.calorieTarget} />

            <button onClick={evaluate} disabled={evaluating}
              className="mt-4 w-full bg-white/5 hover:bg-white/8 border border-white/8 text-white/60 text-[10px] font-black tracking-widest py-2 rounded-xl transition-colors disabled:opacity-40">
              {evaluating ? "ANALYZING..." : "GET PANTHER DIRECTIVE"}
            </button>
          </div>
        )}

        {/* Meal log */}
        {profile && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-white/40 text-[10px] font-black tracking-widest uppercase">Today's Meals</span>
              <span className="text-white/25 text-[10px]">{log?.meals?.length ?? 0} logged</span>
            </div>

            {(!log?.meals || log.meals.length === 0) && (
              <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-6 text-center">
                <div className="text-white/20 text-sm">No meals logged yet.</div>
                <div className="text-white/30 text-xs mt-1">Tap LOG MEAL to start tracking.</div>
              </div>
            )}

            {log?.meals?.map((meal, i) => {
              const mt = MEAL_TYPES[meal.mealType] ?? { label: meal.mealType.toUpperCase(), color: "#6b7280" };
              return (
                <div key={i} className="bg-[#0d0d0d] border border-white/8 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: mt.color }}/>
                      <span className="text-xs font-black tracking-wider" style={{ color: mt.color }}>{mt.label}</span>
                      {meal.mpsTriggered && (
                        <span className="text-[9px] bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded font-black">MPS ✓</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/25 text-[10px]">
                        {new Date(meal.timeLogged).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                      <button
                        onClick={() => deleteMeal(i)}
                        className="text-white/15 hover:text-red-400 transition-colors text-xs"
                        title="Delete meal"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 3h8M5 3V2h2v1M4 3v6h4V3H4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div><div className="text-[#C8973A] font-bold">{Math.round(meal.totalCalories)}</div><div className="text-white/25">kcal</div></div>
                    <div><div className="text-[#4a9eff] font-bold">{Math.round(meal.totalProteinG)}g</div><div className="text-white/25">protein</div></div>
                    <div><div className="text-white font-bold">{Math.round(meal.totalCarbsG)}g</div><div className="text-white/25">carbs</div></div>
                    <div><div className="text-white font-bold">{Math.round(meal.totalFatG)}g</div><div className="text-white/25">fat</div></div>
                  </div>
                  {meal.foods?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/5">
                      {meal.foods.map((f, fi) => (
                        <div key={fi} className="flex justify-between text-[10px] text-white/30 py-0.5">
                          <span>{f.name}</span>
                          <span>{f.servingG > 0 ? `${f.servingG}g · ` : ""}{f.calories} kcal</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {meal.notes && meal.notes !== "" && !meal.notes.startsWith("__replace__") && (
                    <div className="mt-1.5 text-[10px] text-white/25 italic">{meal.notes}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      {profile && (
        <button onClick={() => setShowLogMeal(true)}
          className="fixed bottom-6 right-5 z-50 bg-[#C8973A] text-black font-black text-xs tracking-widest px-5 py-3 rounded-2xl shadow-xl hover:bg-[#d4a44a] transition-all active:scale-95 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          LOG MEAL
        </button>
      )}

      {/* ── Setup Modal ── */}
      {showSetup && (
        <div className="fixed inset-0 z-50 bg-black/92 flex items-end justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md max-h-[88vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-white font-black text-base tracking-widest">FUEL PROFILE</div>
                <div className="text-white/35 text-xs mt-0.5">Targets are calculated from your data</div>
              </div>
              <button onClick={() => setShowSetup(false)} className="text-white/35 hover:text-white text-lg">✕</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {([["weightKg","WEIGHT (kg)","85"],["heightCm","HEIGHT (cm)","178"]] as const).map(([k,l,p]) => (
                  <div key={k}>
                    <label className="text-white/40 text-[10px] font-black tracking-wider block mb-1">{l}</label>
                    <input type="number" placeholder={p} value={(sf as any)[k]}
                      onChange={e => setSf(s => ({...s, [k]: e.target.value}))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C8973A]/50"/>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/40 text-[10px] font-black tracking-wider block mb-1">AGE</label>
                  <input type="number" placeholder="45" value={sf.age}
                    onChange={e => setSf(s => ({...s, age: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C8973A]/50"/>
                </div>
                <div>
                  <label className="text-white/40 text-[10px] font-black tracking-wider block mb-1">SEX</label>
                  <select value={sf.sex} onChange={e => setSf(s => ({...s, sex: e.target.value as "male"|"female"}))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C8973A]/50">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              {([
                ["activityLevel","ACTIVITY LEVEL",ACTIVITY_OPTIONS],
                ["primaryGoal","PRIMARY GOAL",GOAL_OPTIONS],
                ["deficitTier","CALORIE DEFICIT",DEFICIT_OPTIONS],
              ] as const).map(([k,l,opts]) => (
                <div key={k}>
                  <label className="text-white/40 text-[10px] font-black tracking-wider block mb-1">{l}</label>
                  <select value={(sf as any)[k]} onChange={e => setSf(s => ({...s, [k]: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C8973A]/50">
                    {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="text-white/40 text-[10px] font-black tracking-wider block mb-2">CONDITIONS</label>
                {[
                  {v:"diabetes",l:"Type 2 Diabetes / Pre-Diabetes"},
                  {v:"hypertension",l:"Hypertension"},
                  {v:"joint_inflammation",l:"Joint Inflammation / Arthritis"},
                ].map(c => (
                  <label key={c.v} className="flex items-center gap-3 cursor-pointer mb-2">
                    <input type="checkbox" checked={sf.conditions.includes(c.v)}
                      onChange={e => setSf(s => ({...s, conditions: e.target.checked ? [...s.conditions, c.v] : s.conditions.filter(x => x !== c.v)}))}
                      className="w-4 h-4 accent-[#C8973A]"/>
                    <span className="text-white/60 text-sm">{c.l}</span>
                  </label>
                ))}
              </div>
              {sf.sex === "female" && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={sf.isPostMenopausal}
                    onChange={e => setSf(s => ({...s, isPostMenopausal: e.target.checked}))}
                    className="w-4 h-4 accent-[#C8973A]"/>
                  <span className="text-white/60 text-sm">Post-menopausal</span>
                </label>
              )}
              <div className="bg-[#C8973A]/8 border border-[#C8973A]/15 rounded-xl p-3 text-[10px] text-[#C8973A]/70 leading-relaxed">
                MEDICAL DISCLAIMER: The Panther System provides nutritional guidance only. Clients with diagnosed medical conditions must have physician clearance before starting.
              </div>
              <button onClick={saveProfile}
                className="w-full bg-[#C8973A] text-black font-black py-3.5 rounded-xl tracking-widest hover:bg-[#d4a44a] transition-colors">
                CALCULATE MY TARGETS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Log Meal Modal ── */}
      {showLogMeal && (
        <div className="fixed inset-0 z-50 bg-black/92 flex items-end justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white font-black text-base tracking-widest">LOG MEAL</div>
              <button onClick={() => { setShowLogMeal(false); setLogMealTab("search"); }} className="text-white/35 hover:text-white text-lg">✕</button>
            </div>

            {/* Meal type */}
            <div className="mb-4">
              <label className="text-white/40 text-[10px] font-black tracking-wider block mb-1">MEAL TYPE</label>
              <select value={mf.mealType} onChange={e => setMf(p => ({...p, mealType: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C8973A]/50">
                {Object.entries(MEAL_TYPES).map(([v,{label}]) => <option key={v} value={v}>{label}</option>)}
              </select>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2 mb-4">
              {(["search", "library", "manual"] as const).map(tab => (
                <button key={tab} onClick={() => setLogMealTab(tab)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black tracking-widest transition-colors ${
                    logMealTab === tab
                      ? "bg-[#C8973A] text-black"
                      : "bg-white/5 text-white/40 hover:text-white/60"
                  }`}>
                  {tab === "search" ? "🔍 TUTK" : tab === "library" ? "📚 1,802" : "✏️ MANUAL"}
                </button>
              ))}
            </div>

            {/* Recipe search tab */}
            {logMealTab === "search" && (
              <RecipeSearch onSelect={handleRecipeSelect} />
            )}
            {/* Food library search tab */}
            {logMealTab === "library" && (
              <FoodLibrarySearch
                compact
                showGroupFilter
                placeholder="Search 1,802 foods — chicken, broccoli, garlic powder..."
                onSelect={({ item, servingG, macros }) => {
                  setMf(prev => ({
                    ...prev,
                    foods: [{
                      name: item.name,
                      calories: String(Math.round(macros.calories)),
                      proteinG: String(macros.protein_g),
                      carbsG: String(macros.carbs_g),
                      fatG: String(macros.fat_g),
                      servingG: String(servingG),
                    }],
                  }));
                  setLogMealTab("manual");
                }}
              />
            )}

            {/* Manual entry tab */}
            {logMealTab === "manual" && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white/40 text-[10px] font-black tracking-wider">FOODS</label>
                    <button onClick={() => setMf(p => ({...p, foods: [...p.foods, {name:"",calories:"",proteinG:"",carbsG:"",fatG:"",servingG:""}]}))}
                      className="text-[#C8973A] text-[10px] font-black tracking-wider">+ ADD FOOD</button>
                  </div>
                  {mf.foods.map((food, fi) => (
                    <div key={fi} className="bg-white/4 rounded-xl p-3 mb-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="text" placeholder="Food name" value={food.name}
                          onChange={e => { const f=[...mf.foods]; f[fi]={...f[fi],name:e.target.value}; setMf(p=>({...p,foods:f})); }}
                          className="flex-1 bg-transparent border-b border-white/10 pb-1 text-white text-sm focus:outline-none focus:border-[#C8973A]/40 placeholder-white/20"/>
                        {mf.foods.length > 1 && (
                          <button onClick={() => setMf(p => ({...p, foods: p.foods.filter((_,i) => i !== fi)}))}
                            className="text-white/20 hover:text-red-400 text-xs">✕</button>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {(["calories","proteinG","carbsG","fatG"] as const).map(field => (
                          <div key={field}>
                            <div className="text-white/25 text-[9px] mb-0.5">
                              {field==="calories"?"kcal":field==="proteinG"?"prot g":field==="carbsG"?"carb g":"fat g"}
                            </div>
                            <input type="number" placeholder="0" value={(food as any)[field]}
                              onChange={e => { const f=[...mf.foods]; (f[fi] as any)[field]=e.target.value; setMf(p=>({...p,foods:f})); }}
                              className="w-full bg-transparent border-b border-white/10 pb-1 text-white text-sm focus:outline-none focus:border-[#C8973A]/40 placeholder-white/20"/>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-white/40 text-[10px] font-black tracking-wider block mb-1">NOTES (optional)</label>
                  <input type="text" value={mf.notes} onChange={e => setMf(p => ({...p, notes: e.target.value}))}
                    placeholder="e.g. post-workout, restaurant meal"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C8973A]/50 placeholder-white/20"/>
                </div>
              </div>
            )}

            <button onClick={logMeal}
              className="w-full bg-[#C8973A] text-black font-black py-3.5 rounded-xl tracking-widest hover:bg-[#d4a44a] transition-colors mt-4">
              LOG THIS MEAL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
