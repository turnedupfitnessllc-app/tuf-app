/**
 * TUF FUEL Page — TUTK Recipe Browser + Condition Protocols + 40+ Science
 * Powered by Turned Up In The Kitchen cookbook data
 */

import { useState } from "react";
import HamburgerDrawer from "@/components/HamburgerDrawer";
import {
  tutkRecipes,
  conditionModifications,
  nutritionSciencePillars,
  getRecipesByCondition,
  categoryLabels,
  categoryIcons,
  type Recipe,
  type RecipeCategory,
} from "@/data/tutkRecipes";

type FuelTab = "recipes" | "conditions" | "science";
type ConditionFilter = "all" | "heart" | "diabetes" | "arthritis" | "bad-knees" | "lower-back" | "shoulder";

export default function Fuel() {
  const [activeTab, setActiveTab] = useState<FuelTab>("recipes");
  const [activeCategory, setActiveCategory] = useState<RecipeCategory | "all">("all");
  const [conditionFilter, setConditionFilter] = useState<ConditionFilter>("all");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);

  const categories: Array<{ key: RecipeCategory | "all"; label: string; icon: string }> = [
    { key: "all", label: "All", icon: "🍴" },
    { key: "mains", label: "Mains", icon: "🍽️" },
    { key: "breakfast", label: "Breakfast", icon: "🌅" },
    { key: "shakes", label: "Shakes", icon: "🥤" },
    { key: "dressings", label: "Dressings", icon: "🫙" },
  ];

  const conditionFilters: Array<{ key: ConditionFilter; label: string; icon: string }> = [
    { key: "all", label: "All Recipes", icon: "🍴" },
    { key: "heart", label: "Heart Health", icon: "❤️" },
    { key: "diabetes", label: "Blood Sugar", icon: "📊" },
    { key: "arthritis", label: "Arthritis", icon: "🦴" },
    { key: "bad-knees", label: "Bad Knees", icon: "🦵" },
    { key: "lower-back", label: "Lower Back", icon: "🔙" },
    { key: "shoulder", label: "Shoulder", icon: "💪" },
  ];

  const filteredRecipes = tutkRecipes.filter((recipe) => {
    const matchesCategory = activeCategory === "all" || recipe.category === activeCategory;
    const matchesCondition =
      conditionFilter === "all" || recipe.conditionFriendly?.includes(conditionFilter);
    const matchesSearch =
      searchQuery === "" ||
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      recipe.ingredients.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesCondition && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--bg-primary)" }}>
      {/* Sticky header with hamburger */}
      <div className="sticky top-0 z-30" style={{ background: "rgba(8,8,8,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,255,198,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 56 }}>
        <HamburgerDrawer />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 800, letterSpacing: "0.14em", color: "#fff", textTransform: "uppercase" }}>TUTK FUEL</span>
        <div style={{ width: 44 }} />
      </div>
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1
              className="text-3xl font-black tracking-wider text-white uppercase"
              style={{ fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.05em" }}
            >
              TURNED UP <span style={{ color: "#FF6600" }}>IN THE KITCHEN</span>
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
              {tutkRecipes.length} recipes · Optimized for 40+ athletes
            </p>
          </div>
          <div className="text-3xl">🔥</div>
        </div>
        {/* Panther quote */}
        <div
          className="mt-3 px-4 py-3 rounded-xl border text-sm italic"
          style={{
            background: "rgba(255,102,0,0.08)",
            borderColor: "rgba(255,102,0,0.25)",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          "Food is not the enemy. Ignorance is. Every meal is a decision about who you're becoming."
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mb-4">
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          {(
            [
              { key: "recipes" as FuelTab, label: "Recipes", icon: "📖" },
              { key: "conditions" as FuelTab, label: "Conditions", icon: "🏥" },
              { key: "science" as FuelTab, label: "40+ Science", icon: "🔬" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-2 px-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                background:
                  activeTab === tab.key
                    ? "linear-gradient(135deg, #FF6600, #DC2626)"
                    : "transparent",
                color: activeTab === tab.key ? "white" : "rgba(255,255,255,0.5)",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== RECIPES TAB ===== */}
      {activeTab === "recipes" && (
        <div className="px-4">
          {/* Search */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search recipes, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none border"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderColor: "rgba(255,255,255,0.1)",
              }}
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border"
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  background:
                    activeCategory === cat.key
                      ? "linear-gradient(135deg, #FF6600, #DC2626)"
                      : "rgba(255,255,255,0.05)",
                  borderColor:
                    activeCategory === cat.key ? "transparent" : "rgba(255,255,255,0.1)",
                  color: activeCategory === cat.key ? "white" : "rgba(255,255,255,0.6)",
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Condition Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {conditionFilters.map((cf) => (
              <button
                key={cf.key}
                onClick={() => setConditionFilter(cf.key)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border"
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  background:
                    conditionFilter === cf.key
                      ? "rgba(255,102,0,0.2)"
                      : "rgba(255,255,255,0.03)",
                  borderColor:
                    conditionFilter === cf.key
                      ? "rgba(255,102,0,0.5)"
                      : "rgba(255,255,255,0.08)",
                  color: conditionFilter === cf.key ? "#FF6B35" : "rgba(255,255,255,0.5)",
                }}
              >
                {cf.icon} {cf.label}
              </button>
            ))}
          </div>

          {/* Results count */}
          <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? "s" : ""} found
          </p>

          {/* Recipe Grid */}
          <div className="grid grid-cols-1 gap-3">
            {filteredRecipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className="text-left p-4 rounded-2xl border transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{categoryIcons[recipe.category]}</span>
                      <span
                        className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(255,102,0,0.15)",
                          color: "#FF6B35",
                          fontFamily: "Barlow Condensed, sans-serif",
                        }}
                      >
                        {categoryLabels[recipe.category]}
                      </span>
                    </div>
                    <h3
                      className="text-base font-bold text-white mb-1"
                      style={{
                        fontFamily: "Barlow Condensed, sans-serif",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {recipe.name}
                    </h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {recipe.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            color: "rgba(255,255,255,0.5)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {recipe.calories && (
                      <div
                        className="flex gap-3 text-xs"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        <span>🔥 {recipe.calories} cal</span>
                        {recipe.protein && <span>💪 {recipe.protein}g protein</span>}
                        {recipe.prepTime && <span>⏱ {recipe.prepTime} min</span>}
                      </div>
                    )}
                  </div>
                  <div className="text-white opacity-30 mt-1">›</div>
                </div>
                {recipe.conditionFriendly && recipe.conditionFriendly.length > 0 && (
                  <div
                    className="mt-2 pt-2 border-t flex flex-wrap gap-1"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    {recipe.conditionFriendly.slice(0, 3).map((c) => (
                      <span
                        key={c}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80" }}
                      >
                        ✓ {c.replace("-", " ")}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== CONDITIONS TAB ===== */}
      {activeTab === "conditions" && (
        <div className="px-4">
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
            NASM-based movement modifications for common 40+ conditions. Tap any condition for the
            full protocol.
          </p>

          {selectedCondition ? (
            (() => {
              const mod = conditionModifications.find((m) => m.id === selectedCondition);
              if (!mod) return null;
              return (
                <div>
                  <button
                    onClick={() => setSelectedCondition(null)}
                    className="flex items-center gap-2 text-sm mb-4"
                    style={{ color: "#FF6B35" }}
                  >
                    ← Back to conditions
                  </button>
                  <div
                    className="rounded-2xl p-4 mb-4 border"
                    style={{
                      background: "rgba(255,102,0,0.08)",
                      borderColor: "rgba(255,102,0,0.2)",
                    }}
                  >
                    <h2
                      className="text-2xl font-black text-white mb-1 uppercase"
                      style={{ fontFamily: "Barlow Condensed, sans-serif" }}
                    >
                      {mod.name}
                    </h2>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                      Affects {mod.affects}
                    </p>
                    <p className="text-sm mt-2 text-white">{mod.rootCause}</p>
                    <p className="text-xs mt-1" style={{ color: "#FF6B35" }}>
                      Recovery: {mod.recoveryTimeline}
                    </p>
                  </div>

                  <div
                    className="rounded-2xl p-4 mb-3 border"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <h3
                      className="text-sm font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#ef4444", fontFamily: "Barlow Condensed, sans-serif" }}
                    >
                      ⚠️ Exercises to Avoid
                    </h3>
                    {mod.exercisesToAvoid.map((ex, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <span style={{ color: "#ef4444" }}>✕</span>
                        <p className="text-sm text-white">{ex}</p>
                      </div>
                    ))}
                  </div>

                  <div
                    className="rounded-2xl p-4 mb-3 border"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <h3
                      className="text-sm font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#4ade80", fontFamily: "Barlow Condensed, sans-serif" }}
                    >
                      ✓ Safe Substitutions
                    </h3>
                    {mod.safeSubstitutions.map((sub, i) => (
                      <div
                        key={i}
                        className="mb-3 pb-3 border-b last:border-0 last:mb-0 last:pb-0"
                        style={{ borderColor: "rgba(255,255,255,0.06)" }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-xs line-through"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                          >
                            {sub.instead}
                          </span>
                          <span style={{ color: "#FF6B35" }}>→</span>
                          <span className="text-sm font-bold text-white">{sub.use}</span>
                        </div>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                          {sub.why}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div
                    className="rounded-2xl p-4 mb-3 border"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <h3
                      className="text-sm font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#FF6B35", fontFamily: "Barlow Condensed, sans-serif" }}
                    >
                      📅 NASM Progression
                    </h3>
                    {mod.weeklyProgression.map((phase, i) => (
                      <div key={i} className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(255,102,0,0.2)", color: "#FF6B35" }}
                          >
                            {phase.week}
                          </span>
                          <span className="text-sm font-bold text-white">{phase.focus}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 ml-2">
                          {phase.exercises.map((ex, j) => (
                            <span
                              key={j}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                background: "rgba(255,255,255,0.06)",
                                color: "rgba(255,255,255,0.6)",
                              }}
                            >
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className="rounded-2xl p-4 border"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <h3
                      className="text-sm font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#FF6B35", fontFamily: "Barlow Condensed, sans-serif" }}
                    >
                      🍽️ Recommended Recipes
                    </h3>
                    {getRecipesByCondition(mod.id)
                      .slice(0, 5)
                      .map((recipe) => (
                        <button
                          key={recipe.id}
                          onClick={() => {
                            setSelectedRecipe(recipe);
                            setSelectedCondition(null);
                          }}
                          className="w-full text-left flex items-center gap-3 py-2 border-b last:border-0"
                          style={{ borderColor: "rgba(255,255,255,0.06)" }}
                        >
                          <span>{categoryIcons[recipe.category]}</span>
                          <span className="text-sm text-white">{recipe.name}</span>
                          <span className="ml-auto text-white opacity-30">›</span>
                        </button>
                      ))}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {conditionModifications.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setSelectedCondition(mod.id)}
                  className="text-left p-4 rounded-2xl border transition-all"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className="text-lg font-black text-white uppercase mb-1"
                        style={{ fontFamily: "Barlow Condensed, sans-serif" }}
                      >
                        {mod.name}
                      </h3>
                      <p className="text-xs mb-2" style={{ color: "#FF6B35" }}>
                        Affects {mod.affects}
                      </p>
                      <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {mod.rootCause}
                      </p>
                    </div>
                    <span className="text-white opacity-30 ml-3">›</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ background: "rgba(255,102,0,0.15)", color: "#FF6B35" }}
                    >
                      ⏱ {mod.recoveryTimeline}
                    </span>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80" }}
                    >
                      {getRecipesByCondition(mod.id).length} recipes
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== 40+ SCIENCE TAB ===== */}
      {activeTab === "science" && (
        <div className="px-4">
          <div
            className="rounded-2xl p-4 mb-4 border"
            style={{ background: "rgba(255,102,0,0.08)", borderColor: "rgba(255,102,0,0.2)" }}
          >
            <h2
              className="text-xl font-black text-white uppercase mb-1"
              style={{ fontFamily: "Barlow Condensed, sans-serif" }}
            >
              Why These Recipes Work
            </h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              Every recipe in TUTK is engineered around 8 physiological priorities that change after
              40. This is not a diet. It is a fuel system.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {nutritionSciencePillars.map((pillar) => (
              <div
                key={pillar.id}
                className="p-4 rounded-2xl border"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{pillar.icon}</span>
                  <div>
                    <h3
                      className="text-base font-black text-white uppercase mb-1"
                      style={{ fontFamily: "Barlow Condensed, sans-serif" }}
                    >
                      {pillar.title}
                    </h3>
                    <p className="text-sm font-semibold mb-1" style={{ color: "#FF6B35" }}>
                      {pillar.summary}
                    </p>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {pillar.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-4 p-4 rounded-2xl border text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              TUTK — Turned Up In The Kitchen · Wilfred Edition v3.0
              <br />
              Optimized for Adults 40+ · Georgia · Global
              <br />
              © 2026 Turned Up Fitness LLC
            </p>
          </div>
        </div>
      )}

      {/* ===== RECIPE DETAIL MODAL ===== */}
      {selectedRecipe && (
        <div
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
          style={{ background: "var(--bg-primary)" }}
        >
          {/* Modal Header */}
          <div
            className="sticky top-0 z-10 px-4 py-4 flex items-center gap-3 border-b"
            style={{ background: "var(--bg-primary)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <button
              onClick={() => setSelectedRecipe(null)}
              className="p-2 rounded-xl border"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderColor: "rgba(255,255,255,0.1)",
                color: "white",
              }}
            >
              ←
            </button>
            <div>
              <h2
                className="text-xl font-black text-white uppercase"
                style={{ fontFamily: "Barlow Condensed, sans-serif" }}
              >
                {selectedRecipe.name}
              </h2>
              <p className="text-xs" style={{ color: "#FF6B35" }}>
                {categoryIcons[selectedRecipe.category]} {categoryLabels[selectedRecipe.category]}
              </p>
            </div>
          </div>

          <div className="px-4 py-4 pb-24">
            {/* Macros */}
            {selectedRecipe.calories && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: "Calories", value: selectedRecipe.calories, unit: "" },
                  { label: "Protein", value: selectedRecipe.protein, unit: "g" },
                  { label: "Fat", value: selectedRecipe.fat, unit: "g" },
                  { label: "Carbs", value: selectedRecipe.carbs, unit: "g" },
                ].map((macro) => (
                  <div
                    key={macro.label}
                    className="p-3 rounded-xl text-center border"
                    style={{
                      background: "rgba(255,102,0,0.08)",
                      borderColor: "rgba(255,102,0,0.2)",
                    }}
                  >
                    <div
                      className="text-lg font-black text-white"
                      style={{ fontFamily: "Barlow Condensed, sans-serif" }}
                    >
                      {macro.value}
                      {macro.unit}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {macro.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedRecipe.prepTime && (
                <span
                  className="text-xs px-3 py-1 rounded-full border"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  ⏱ {selectedRecipe.prepTime} min
                </span>
              )}
              {selectedRecipe.servings && (
                <span
                  className="text-xs px-3 py-1 rounded-full border"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  👤 {selectedRecipe.servings} serving{selectedRecipe.servings > 1 ? "s" : ""}
                </span>
              )}
              {selectedRecipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full border"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Ingredients */}
            <div
              className="rounded-2xl p-4 mb-3 border"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <h3
                className="text-sm font-black uppercase tracking-wider mb-3 text-white"
                style={{ fontFamily: "Barlow Condensed, sans-serif" }}
              >
                Ingredients
              </h3>
              {selectedRecipe.ingredients.map((ing, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span style={{ color: "#FF6600" }}>■</span>
                  <span className="text-sm text-white">{ing}</span>
                </div>
              ))}
            </div>

            {/* Directions */}
            <div
              className="rounded-2xl p-4 mb-3 border"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <h3
                className="text-sm font-black uppercase tracking-wider mb-3 text-white"
                style={{ fontFamily: "Barlow Condensed, sans-serif" }}
              >
                Directions
              </h3>
              {selectedRecipe.directions.map((step, i) => (
                <div key={i} className="flex gap-3 mb-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #FF6600, #DC2626)" }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-white">{step}</p>
                </div>
              ))}
            </div>

            {/* 40+ Science Note */}
            {selectedRecipe.scienceNote && (
              <div
                className="rounded-2xl p-4 mb-3 border"
                style={{
                  background: "rgba(255,102,0,0.08)",
                  borderColor: "rgba(255,102,0,0.2)",
                }}
              >
                <h3
                  className="text-xs font-black uppercase tracking-wider mb-2"
                  style={{ color: "#FF6B35", fontFamily: "Barlow Condensed, sans-serif" }}
                >
                  🔬 40+ Science
                </h3>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                  {selectedRecipe.scienceNote}
                </p>
              </div>
            )}

            {/* Condition Friendly */}
            {selectedRecipe.conditionFriendly && selectedRecipe.conditionFriendly.length > 0 && (
              <div
                className="rounded-2xl p-4 border"
                style={{
                  background: "rgba(34,197,94,0.05)",
                  borderColor: "rgba(34,197,94,0.15)",
                }}
              >
                <h3
                  className="text-xs font-black uppercase tracking-wider mb-2"
                  style={{ color: "#4ade80", fontFamily: "Barlow Condensed, sans-serif" }}
                >
                  ✓ Safe For
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRecipe.conditionFriendly.map((c) => (
                    <span
                      key={c}
                      className="text-xs px-3 py-1 rounded-full"
                      style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80" }}
                    >
                      {c.replace("-", " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
