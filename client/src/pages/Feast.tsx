import { useState } from "react";
import { TufHeader } from "@/components/TufHeader";
import { TufBottomNav } from "@/components/TufBottomNav";
import { ChevronDown, Clock, Flame, Droplets } from "lucide-react";
import { TUTK_RECIPES } from "@/lib/tutk-recipes";

interface RecipeDetailProps {
  recipe: typeof TUTK_RECIPES[number];
  onClose: () => void;
}

function RecipeDetail({ recipe, onClose }: RecipeDetailProps) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-4">
      <div className="w-full md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto bg-card border border-border rounded-t-2xl md:rounded-2xl">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full mb-3">
                {recipe.category}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{recipe.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-2xl text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-secondary p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground mb-1 font-semibold">TIME</div>
              <div className="font-semibold text-sm">{recipe.time}</div>
            </div>
            <div className="bg-secondary p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground mb-1 font-semibold">CALS</div>
              <div className="font-semibold text-sm text-accent">{recipe.calories}</div>
            </div>
            <div className="bg-secondary p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground mb-1 font-semibold">PROTEIN</div>
              <div className="font-semibold text-sm text-primary">{recipe.protein}g</div>
            </div>
            <div className="bg-secondary p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground mb-1 font-semibold">CARBS</div>
              <div className="font-semibold text-sm">{recipe.carbs}g</div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <h3 className="text-label text-accent mb-3">INGREDIENTS</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span className="text-foreground">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Directions */}
          <div className="mb-6">
            <h3 className="text-label text-accent mb-3">DIRECTIONS</h3>
            <ol className="space-y-3">
              {recipe.directions.map((direction, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <span className="font-semibold text-accent min-w-6">{idx + 1}.</span>
                  <span className="text-foreground">{direction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Science Note */}
          {recipe.scienceNote && (
            <div className="mb-6 p-4 bg-secondary/50 border-l-4 border-accent rounded-lg">
              <h4 className="font-semibold text-sm text-foreground mb-2">🧬 40+ SCIENCE</h4>
              <p className="text-sm text-muted-foreground">{recipe.scienceNote}</p>
            </div>
          )}

          {/* Pro Tip */}
          {recipe.proTip && (
            <div className="p-4 bg-secondary/50 border-l-4 border-primary rounded-lg mb-6">
              <h4 className="font-semibold text-sm text-foreground mb-2">💡 PRO TIP</h4>
              <p className="text-sm text-muted-foreground">{recipe.proTip}</p>
            </div>
          )}

          {/* Action Button */}
          <button className="btn-accent w-full">
            Add to Meal Plan
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * FEAST — Nutrition & Recipe Library
 * 43 TUTK recipes optimized for 40+ bodies
 * Full ingredients, directions, macros, and science-backed guidance
 */
export default function Feast() {
  const [selectedRecipe, setSelectedRecipe] = useState<typeof TUTK_RECIPES[number] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("BREAKFAST");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ["BREAKFAST", "MAINS", "SHAKES", "DRESSINGS"];
  const filteredRecipes = TUTK_RECIPES.filter((r) => r.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TufHeader />

      <main className="pb-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-card to-background px-4 py-8 border-b border-border">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-headline mb-2">FEAST</h1>
            <p className="text-muted-foreground">43 recipes • Full macros • 40+ science notes</p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="px-4 py-6 border-b border-border sticky top-0 bg-background z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === cat
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-foreground hover:bg-opacity-80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Recipe Grid */}
        <section className="px-4 py-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="card-tuf cursor-pointer group"
              >
                <button
                  onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
                  className="w-full text-left"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="inline-block px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded mb-2">
                        {recipe.id}
                      </span>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {recipe.name}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-accent transition-transform duration-300 ${
                        expandedId === recipe.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                    <div className="bg-secondary/50 p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground font-semibold">CALS</div>
                      <div className="font-semibold text-sm text-accent">{recipe.calories}</div>
                    </div>
                    <div className="bg-secondary/50 p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground font-semibold">PROTEIN</div>
                      <div className="font-semibold text-sm text-primary">{recipe.protein}g</div>
                    </div>
                    <div className="bg-secondary/50 p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground font-semibold">CARBS</div>
                      <div className="font-semibold text-sm">{recipe.carbs}g</div>
                    </div>
                  </div>

                  {/* Science Note Preview */}
                  {recipe.scienceNote && (
                    <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                      {recipe.scienceNote}
                    </p>
                  )}
                </button>

                {/* Expanded Content */}
                {expandedId === recipe.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4 animate-in fade-in duration-200">
                    <div className="flex gap-2 text-sm">
                      <Clock className="w-4 h-4 text-accent flex-shrink-0" />
                      <span>{recipe.time}</span>
                    </div>

                    <div>
                      <h4 className="text-label text-accent mb-2">INGREDIENTS</h4>
                      <ul className="space-y-1 text-sm">
                        {recipe.ingredients.slice(0, 5).map((ingredient, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-accent font-bold">•</span>
                            {ingredient}
                          </li>
                        ))}
                        {recipe.ingredients.length > 5 && (
                          <li className="text-muted-foreground text-xs">
                            +{recipe.ingredients.length - 5} more
                          </li>
                        )}
                      </ul>
                    </div>

                    {recipe.scienceNote && (
                      <div className="bg-secondary/50 rounded p-3 border-l-4 border-accent">
                        <h4 className="text-label text-accent mb-1">🧬 SCIENCE</h4>
                        <p className="text-xs text-foreground line-clamp-2">{recipe.scienceNote}</p>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedRecipe(recipe)}
                      className="btn-accent w-full text-sm"
                    >
                      View Full Recipe
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Nutrition Info Footer */}
        <section className="px-4 py-8">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-tuf">
              <Flame className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-bold text-foreground mb-2">High Protein</h3>
              <p className="text-sm text-muted-foreground">
                Every recipe hits 24-48g protein to support muscle maintenance after 40
              </p>
            </div>
            <div className="card-tuf">
              <Droplets className="w-6 h-6 text-accent mb-3" />
              <h3 className="font-bold text-foreground mb-2">Anti-Inflammatory</h3>
              <p className="text-sm text-muted-foreground">
                Omega-3s, colorful vegetables, and strategic carbs to fight chronic inflammation
              </p>
            </div>
            <div className="card-tuf">
              <Clock className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-bold text-foreground mb-2">Quick & Simple</h3>
              <p className="text-sm text-muted-foreground">
                Most recipes take 15-20 minutes. No complicated techniques or hard-to-find ingredients
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}

      <TufBottomNav />
    </div>
  );
}
