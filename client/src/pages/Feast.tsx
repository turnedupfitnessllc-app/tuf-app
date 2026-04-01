/**
 * TUF FEAST Page — Recipes
 * Design System: Recipe cards with macros, prep time, ingredients
 */

import { TUF_DATA, type Recipe } from "@/lib/tuf-data";

export default function Feast() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#f2f2f2] pb-20">
      {/* Header */}
      <section className="px-4 pt-6 pb-4 border-b border-[#1e1e1e]">
        <div className="text-xs tracking-widest uppercase text-[#888888] mb-1">Recipes</div>
        <h1 className="font-bebas text-3xl tracking-wider text-white">
          <span className="text-[#f97316]">FEAST</span>
        </h1>
      </section>

      {/* Recipe Cards */}
      <section className="py-4">
        {TUF_DATA.recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </section>

      {/* CTA */}
      <section className="px-4 py-6">
        <button className="tuf-btn gold">BROWSE RECIPES</button>
      </section>
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <div className="tuf-card mx-4 mb-4">
      {/* Recipe Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bebas text-xl tracking-wider text-white">{recipe.name}</h3>
          <div className="text-xs text-[#888888] mt-1">Serves {recipe.servings}</div>
        </div>
        <div className="text-2xl">🍗</div>
      </div>

      {/* Time Info */}
      <div className="flex gap-4 mb-4 text-xs">
        <div>
          <div className="text-[#888888]">Prep</div>
          <div className="font-bebas text-[#C8973A] tracking-wider">{recipe.prepTime}</div>
        </div>
        <div>
          <div className="text-[#888888]">Cook</div>
          <div className="font-bebas text-[#C8973A] tracking-wider">{recipe.cookTime}</div>
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "Protein", value: recipe.macros.protein, unit: "g" },
          { label: "Carbs", value: recipe.macros.carbs, unit: "g" },
          { label: "Fat", value: recipe.macros.fat, unit: "g" },
          { label: "Cal", value: recipe.macros.calories, unit: "" },
        ].map((macro) => (
          <div key={macro.label} className="bg-[#0e0e0e] border border-[#1e1e1e] p-2 text-center">
            <div className="font-bebas text-sm text-[#C8973A] tracking-wider">
              {macro.value}
              {macro.unit}
            </div>
            <div className="text-xs text-[#333333] uppercase tracking-wider mt-1">{macro.label}</div>
          </div>
        ))}
      </div>

      {/* Ingredients */}
      <div className="mb-4">
        <div className="text-xs font-bold uppercase tracking-widest text-[#C8973A] mb-2">Ingredients</div>
        {recipe.ingredients.map((ingredient, idx) => (
          <div key={idx} className="flex gap-2 text-xs text-[#888888] mb-1">
            <span className="text-[#C8973A]">•</span>
            <span>{ingredient}</span>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-[#4caf50] mb-2">Instructions</div>
        {recipe.instructions.map((instruction, idx) => (
          <div key={idx} className="flex gap-2 text-xs text-[#888888] mb-2">
            <span className="text-[#4caf50] font-bold flex-shrink-0">{idx + 1}.</span>
            <span>{instruction}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
