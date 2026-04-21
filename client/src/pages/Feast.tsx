/**
 * FEAST — The Panther System Food Intelligence Screen
 * Powered by Turned Up In The Kitchen (TUTK)
 * 4 Tabs: THIS WEEK | RECIPES | SHOPPING | DATABASE
 */

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Calendar,
  ShoppingCart,
  BookOpen,
  Database,
  RefreshCw,
  ArrowLeft,
  Zap,
  Check,
  X,
  Search,
} from "lucide-react";
import { tutkRecipes, type Recipe } from "@/data/tutkRecipes";
import HamburgerDrawer from "@/components/HamburgerDrawer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlannedMeal {
  mealType: string;
  recipeId: string;
  recipeName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  mpsTriggered: boolean;
  swapped?: boolean;
}

interface DayPlan {
  dayOfWeek: number;
  dateISO: string;
  meals: PlannedMeal[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  macroTargetMet: boolean;
}

interface ShoppingItem {
  name: string;
  totalAmount: string;
  category: string;
  budgetTier: string;
  checked: boolean;
}

interface WeeklyMealPlan {
  planId: string;
  userId: string;
  weekStartDate: string;
  days: DayPlan[];
  weeklyCalories: number;
  weeklyProteinG: number;
  shoppingList: ShoppingItem[];
  fuelProfileSnapshot: {
    calorieTarget: number;
    proteinTarget: number;
    goal: string;
    conditions: string[];
  };
  generatedAt: number;
}

interface FeastDirective {
  headline: string;
  body: string;
  directive: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MEAL_LABELS: Record<string, string> = {
  meal1: "MEAL 1 — WAKE",
  meal2: "MEAL 2 — MAIN",
  pre_training: "PRE-TRAINING",
  post_training: "POST-TRAINING",
  pre_sleep: "PRE-SLEEP",
};

const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const CATEGORY_COLORS: Record<string, string> = {
  protein: "text-orange-400",
  produce: "text-green-400",
  dairy: "text-blue-300",
  pantry: "text-yellow-400",
  supplements: "text-purple-400",
  other: "text-gray-400",
};

// ─── Recipe Detail Modal ──────────────────────────────────────────────────────

function RecipeModal({
  recipe,
  onClose,
}: {
  recipe: Recipe;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4">
      <div className="w-full md:max-w-lg max-h-[90vh] overflow-y-auto bg-[#111] border border-white/10 rounded-2xl">
        {/* Hero Image */}
        {recipe.image && (
          <div className="w-full h-48 overflow-hidden rounded-t-2xl">
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                {recipe.category}
              </span>
              <h2 className="text-xl font-bold text-white mt-1">{recipe.name}</h2>
              <div className="flex flex-wrap gap-1 mt-2">
                {recipe.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
              <X size={20} />
            </button>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { label: "CALS", value: recipe.calories ?? "~420", color: "text-orange-400" },
              { label: "PROTEIN", value: `${recipe.protein ?? "~35"}g`, color: "text-green-400" },
              { label: "CARBS", value: `${recipe.carbs ?? "~30"}g`, color: "text-blue-300" },
              { label: "FAT", value: `${recipe.fat ?? "~15"}g`, color: "text-yellow-400" },
            ].map((m) => (
              <div key={m.label} className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-500 font-bold">{m.label}</div>
                <div className={`font-bold text-sm ${m.color}`}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Ingredients */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">
              Ingredients
            </h3>
            <ul className="space-y-1">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="text-sm text-gray-300 flex gap-2">
                  <span className="text-orange-400">•</span>
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Directions */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">
              Directions
            </h3>
            <ol className="space-y-2">
              {recipe.directions.map((dir, i) => (
                <li key={i} className="text-sm text-gray-300 flex gap-2">
                  <span className="text-orange-400 font-bold min-w-5">{i + 1}.</span>
                  {dir}
                </li>
              ))}
            </ol>
          </div>

          {/* Science Note */}
          {recipe.scienceNote && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
              <div className="text-xs font-bold text-orange-400 mb-1">PANTHER NOTE</div>
              <p className="text-xs text-gray-300">{recipe.scienceNote}</p>
            </div>
          )}

          {/* Condition Friendly */}
          {recipe.conditionFriendly && recipe.conditionFriendly.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {recipe.conditionFriendly.map((c) => (
                <span
                  key={c}
                  className="text-xs px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Feast() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"week" | "recipes" | "shopping" | "database">(
    "week"
  );

  // Plan state
  const [plan, setPlan] = useState<WeeklyMealPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);

  // Directive state
  const [directive, setDirective] = useState<FeastDirective | null>(null);
  const [loadingDirective, setLoadingDirective] = useState(false);

  // Recipe state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeSearch, setRecipeSearch] = useState("");
  const [recipeCategory, setRecipeCategory] = useState<string>("all");

  // Shopping state
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);

  // DB search state
  const [dbSearch, setDbSearch] = useState("");
  const [dbCondition, setDbCondition] = useState<string>("all");

  const userId = localStorage.getItem("tuf_user_id") ?? "guest";

  // ─── Load plan on mount ───────────────────────────────────────────────────

  const loadPlan = useCallback(async () => {
    setLoadingPlan(true);
    try {
      const res = await fetch(`/api/feast/plan/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan);
        setShoppingItems(data.plan.shoppingList ?? []);
      }
    } catch (e) {
      console.error("[FEAST] load plan error:", e);
    } finally {
      setLoadingPlan(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  // ─── Generate new plan ────────────────────────────────────────────────────

  const generatePlan = async () => {
    setLoadingPlan(true);
    try {
      const res = await fetch("/api/feast/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan);
        setShoppingItems(data.plan.shoppingList ?? []);
      } else {
        const err = await res.json();
        alert(err.error ?? "Failed to generate plan. Complete FUEL setup first.");
      }
    } catch {
      alert("Failed to generate plan. Check FUEL setup.");
    } finally {
      setLoadingPlan(false);
    }
  };

  // ─── Swap meal ────────────────────────────────────────────────────────────

  const swapMeal = async (mealType: string) => {
    if (!plan) return;
    try {
      const res = await fetch("/api/feast/swap-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.planId,
          dayOfWeek: selectedDay,
          mealType,
          conditions: plan.fuelProfileSnapshot.conditions ?? [],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan);
      }
    } catch (e) {
      console.error("[FEAST] swap error:", e);
    }
  };

  // ─── Toggle shopping item ─────────────────────────────────────────────────

  const toggleShoppingItem = async (itemName: string) => {
    if (!plan) return;
    const current = shoppingItems.find((i) => i.name === itemName);
    const updated = shoppingItems.map((i) =>
      i.name === itemName ? { ...i, checked: !i.checked } : i
    );
    setShoppingItems(updated);
    await fetch("/api/feast/check-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: plan.planId,
        itemName,
        checked: !current?.checked,
      }),
    });
  };

  // ─── Load directive ───────────────────────────────────────────────────────

  const loadDirective = async () => {
    setLoadingDirective(true);
    try {
      const res = await fetch("/api/feast/directive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setDirective(data.directive);
      }
    } catch (e) {
      console.error("[FEAST] directive error:", e);
    } finally {
      setLoadingDirective(false);
    }
  };

  // ─── Filtered recipes ─────────────────────────────────────────────────────

  const filteredRecipes = tutkRecipes.filter((r) => {
    const matchSearch =
      !recipeSearch ||
      r.name.toLowerCase().includes(recipeSearch.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(recipeSearch.toLowerCase()));
    const matchCategory = recipeCategory === "all" || r.category === recipeCategory;
    return matchSearch && matchCategory;
  });

  const filteredDb = tutkRecipes.filter((r) => {
    const matchSearch =
      !dbSearch ||
      r.name.toLowerCase().includes(dbSearch.toLowerCase()) ||
      r.ingredients.some((i) => i.toLowerCase().includes(dbSearch.toLowerCase()));
    const matchCondition =
      dbCondition === "all" ||
      (r.conditionFriendly ?? []).includes(dbCondition);
    return matchSearch && matchCondition;
  });

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <HamburgerDrawer />
          <div>
            <div className="text-xs font-bold text-orange-400 tracking-widest">THE PANTHER SYSTEM</div>
            <div className="text-lg font-black text-white leading-none">FEAST</div>
          </div>
          <div className="ml-auto text-xs text-gray-500 font-mono">POWERED BY TUTK</div>
        </div>

        {/* Tab Bar */}
        <div className="flex border-t border-white/5">
          {[
            { id: "week", icon: Calendar, label: "THIS WEEK" },
            { id: "recipes", icon: BookOpen, label: "RECIPES" },
            { id: "shopping", icon: ShoppingCart, label: "SHOPPING" },
            { id: "database", icon: Database, label: "DATABASE" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-bold transition-colors ${
                activeTab === tab.id
                  ? "text-orange-400 border-b-2 border-orange-400"
                  : "text-gray-500"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── THIS WEEK TAB ─────────────────────────────────────────────────── */}
      {activeTab === "week" && (
        <div className="px-4 pt-4">
          {/* Panther Directive Card */}
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 mb-4">
            {directive ? (
              <>
                <div className="text-xs font-bold text-orange-400 mb-1">PANTHER FEAST DIRECTIVE</div>
                <div className="font-bold text-white text-sm mb-1">{directive.headline}</div>
                <p className="text-xs text-gray-400 mb-2">{directive.body}</p>
                <div className="bg-orange-500/10 rounded-lg p-2">
                  <div className="text-xs font-bold text-orange-300">{directive.directive}</div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-orange-400 mb-1">PANTHER FEAST DIRECTIVE</div>
                  <div className="text-sm text-gray-400">Get your personalized food prescription</div>
                </div>
                <button
                  onClick={loadDirective}
                  disabled={loadingDirective}
                  className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-lg text-xs transition-colors disabled:opacity-50"
                >
                  {loadingDirective ? "..." : "GET DIRECTIVE"}
                </button>
              </div>
            )}
          </div>

          {/* Plan Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-gray-500 font-bold">WEEKLY MEAL PLAN</div>
              {plan && (
                <div className="text-xs text-gray-600">
                  Week of{" "}
                  {new Date(plan.weekStartDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              )}
            </div>
            <button
              onClick={generatePlan}
              disabled={loadingPlan}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
            >
              <RefreshCw size={12} className={loadingPlan ? "animate-spin" : ""} />
              {plan ? "REGENERATE" : "GENERATE PLAN"}
            </button>
          </div>

          {loadingPlan && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-2xl mb-2">🐆</div>
              <div className="text-sm font-bold">Generating your meal plan...</div>
              <div className="text-xs mt-1">Analyzing FUEL profile + TUTK database</div>
            </div>
          )}

          {!plan && !loadingPlan && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🍽️</div>
              <div className="text-white font-bold mb-1">No Meal Plan Yet</div>
              <div className="text-sm text-gray-500 mb-4">
                Complete your FUEL profile, then generate your first 7-day plan.
              </div>
              <button
                onClick={() => navigate("/fuel-track")}
                className="px-4 py-2 bg-orange-500 text-black font-bold rounded-xl text-sm"
              >
                SET UP FUEL PROFILE
              </button>
            </div>
          )}

          {plan && !loadingPlan && (
            <>
              {/* Day Selector */}
              <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
                {plan.days.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(i)}
                    className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      selectedDay === i
                        ? "bg-orange-500 text-black"
                        : day.macroTargetMet
                        ? "bg-green-500/10 border border-green-500/20 text-green-400"
                        : "bg-white/5 border border-white/10 text-gray-400"
                    }`}
                  >
                    <span>{DAY_NAMES[i]}</span>
                    <span className="text-xs opacity-70">
                      {new Date(day.dateISO).getDate()}
                    </span>
                    {day.macroTargetMet && selectedDay !== i && (
                      <Check size={8} className="text-green-400 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>

              {/* Day Macro Bar */}
              {plan.days[selectedDay] && (
                <div className="bg-white/5 rounded-xl p-3 mb-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400 font-bold">
                      {DAY_NAMES[selectedDay]} MACROS
                    </span>
                    <span
                      className={
                        plan.days[selectedDay].macroTargetMet
                          ? "text-green-400 font-bold"
                          : "text-orange-400 font-bold"
                      }
                    >
                      {plan.days[selectedDay].macroTargetMet ? "TARGET MET ✓" : "BELOW TARGET"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      {
                        label: "CALS",
                        value: plan.days[selectedDay].totalCalories,
                        color: "text-orange-400",
                      },
                      {
                        label: "PROTEIN",
                        value: `${plan.days[selectedDay].totalProteinG}g`,
                        color: "text-green-400",
                      },
                      {
                        label: "CARBS",
                        value: `${plan.days[selectedDay].totalCarbsG}g`,
                        color: "text-blue-300",
                      },
                      {
                        label: "FAT",
                        value: `${plan.days[selectedDay].totalFatG}g`,
                        color: "text-yellow-400",
                      },
                    ].map((m) => (
                      <div key={m.label}>
                        <div className="text-xs text-gray-500 font-bold">{m.label}</div>
                        <div className={`font-bold text-sm ${m.color}`}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meal Cards */}
              <div className="space-y-3">
                {plan.days[selectedDay]?.meals.map((meal) => (
                  <div
                    key={meal.mealType}
                    className={`bg-white/5 border rounded-xl p-3 ${
                      meal.swapped ? "border-orange-500/30" : "border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-xs font-bold text-orange-400 mb-0.5">
                          {MEAL_LABELS[meal.mealType] ?? meal.mealType.toUpperCase()}
                        </div>
                        <div className="font-bold text-white text-sm">{meal.recipeName}</div>
                        {meal.swapped && (
                          <span className="text-xs text-orange-400">↺ swapped</span>
                        )}
                      </div>
                      <button
                        onClick={() => swapMeal(meal.mealType)}
                        className="text-xs text-gray-500 hover:text-orange-400 transition-colors px-2 py-1 bg-white/5 rounded-lg"
                      >
                        SWAP
                      </button>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-orange-400 font-bold">{meal.calories} cal</span>
                      <span className="text-green-400">{meal.proteinG}g protein</span>
                      <span className="text-blue-300">{meal.carbsG}g carbs</span>
                      {meal.mpsTriggered && (
                        <span className="flex items-center gap-0.5 text-yellow-400">
                          <Zap size={10} />
                          MPS
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── RECIPES TAB ───────────────────────────────────────────────────── */}
      {activeTab === "recipes" && (
        <div className="px-4 pt-4">
          {/* Search */}
          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search recipes..."
              value={recipeSearch}
              onChange={(e) => setRecipeSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {["all", "mains", "breakfast", "shakes", "dressings", "challenge"].map((cat) => (
              <button
                key={cat}
                onClick={() => setRecipeCategory(cat)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  recipeCategory === cat
                    ? "bg-orange-500 text-black"
                    : "bg-white/5 text-gray-400 border border-white/10"
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Recipe List */}
          <div className="space-y-2">
            {filteredRecipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className="w-full text-left bg-white/5 border border-white/10 hover:border-orange-500/30 rounded-xl p-3 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {recipe.image && (
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-orange-400 mb-0.5">
                      {recipe.category.toUpperCase()}
                    </div>
                    <div className="font-bold text-white text-sm">{recipe.name}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {recipe.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs text-gray-500">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-green-400 font-bold">
                      {recipe.protein ?? "~35"}g
                    </div>
                    <div className="text-xs text-gray-500">protein</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center text-xs text-gray-600 mt-4 pb-4">
            {filteredRecipes.length} recipes · TUTK v3.0
          </div>
        </div>
      )}

      {/* ── SHOPPING TAB ──────────────────────────────────────────────────── */}
      {activeTab === "shopping" && (
        <div className="px-4 pt-4">
          {!plan ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🛒</div>
              <div className="text-white font-bold mb-1">No Shopping List Yet</div>
              <div className="text-sm text-gray-500 mb-4">
                Generate a weekly meal plan to create your shopping list.
              </div>
              <button
                onClick={() => setActiveTab("week")}
                className="px-4 py-2 bg-orange-500 text-black font-bold rounded-xl text-sm"
              >
                GO TO THIS WEEK
              </button>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-orange-400">
                    {shoppingItems.filter((i) => i.checked).length}
                  </div>
                  <div className="text-xs text-gray-500">CHECKED</div>
                </div>
                <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-white">{shoppingItems.length}</div>
                  <div className="text-xs text-gray-500">TOTAL</div>
                </div>
                <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-green-400">
                    {shoppingItems.filter((i) => !i.checked).length}
                  </div>
                  <div className="text-xs text-gray-500">REMAINING</div>
                </div>
              </div>

              {/* Grouped by category */}
              {(
                ["protein", "produce", "dairy", "pantry", "supplements", "other"] as const
              ).map((category) => {
                const items = shoppingItems.filter((i) => i.category === category);
                if (items.length === 0) return null;
                return (
                  <div key={category} className="mb-4">
                    <div
                      className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                        CATEGORY_COLORS[category] ?? "text-gray-400"
                      }`}
                    >
                      {category}
                    </div>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => toggleShoppingItem(item.name)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
                            item.checked
                              ? "opacity-40"
                              : "bg-white/5 border border-white/10"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              item.checked
                                ? "bg-green-500 border-green-500"
                                : "border-gray-600"
                            }`}
                          >
                            {item.checked && <Check size={10} className="text-black" />}
                          </div>
                          <div className="flex-1">
                            <div
                              className={`text-sm font-medium ${
                                item.checked ? "line-through text-gray-600" : "text-white"
                              }`}
                            >
                              {item.name}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">{item.totalAmount}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ── DATABASE TAB ──────────────────────────────────────────────────── */}
      {activeTab === "database" && (
        <div className="px-4 pt-4">
          <div className="text-xs text-gray-500 font-bold mb-3">
            TUTK RECIPE DATABASE — {tutkRecipes.length} RECIPES
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search by name or ingredient..."
              value={dbSearch}
              onChange={(e) => setDbSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          {/* Condition Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {["all", "diabetes", "heart", "arthritis", "bad-knees", "lower-back"].map(
              (cond) => (
                <button
                  key={cond}
                  onClick={() => setDbCondition(cond)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    dbCondition === cond
                      ? "bg-green-500 text-black"
                      : "bg-white/5 text-gray-400 border border-white/10"
                  }`}
                >
                  {cond === "all" ? "ALL CONDITIONS" : cond.toUpperCase()}
                </button>
              )
            )}
          </div>

          {/* Results */}
          <div className="space-y-2">
            {filteredDb.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className="w-full text-left bg-white/5 border border-white/10 hover:border-orange-500/30 rounded-xl p-3 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">{recipe.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {recipe.category} · {recipe.tags.slice(0, 2).join(", ")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-400 font-bold">
                      {recipe.protein ?? "~35"}g
                    </div>
                    <div className="text-xs text-gray-500">protein</div>
                  </div>
                </div>
                {recipe.conditionFriendly && recipe.conditionFriendly.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {recipe.conditionFriendly.map((c) => (
                      <span
                        key={c}
                        className="text-xs px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded-full"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>

          {filteredDb.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No recipes match your search.
            </div>
          )}
        </div>
      )}

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  );
}
