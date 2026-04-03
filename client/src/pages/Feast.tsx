import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Clock, Flame, Droplets } from "lucide-react";
import { TUTK_RECIPES } from "@/lib/tutk-recipes";

interface RecipeDetailProps {
  recipe: typeof TUTK_RECIPES[number];
  onClose: () => void;
}

function RecipeDetail({ recipe, onClose }: RecipeDetailProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
      <Card className="w-full md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto bg-card border-border rounded-t-2xl md:rounded-2xl">
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
              className="text-2xl text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-secondary p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground mb-1">Time</div>
              <div className="font-semibold text-sm">{recipe.time}</div>
            </div>
            <div className="bg-secondary p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground mb-1">Calories</div>
              <div className="font-semibold text-sm">{recipe.calories}</div>
            </div>
            <div className="bg-secondary p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground mb-1">Protein</div>
              <div className="font-semibold text-sm text-primary">{recipe.protein}g</div>
            </div>
            <div className="bg-secondary p-3 rounded-lg text-center">
              <div className="text-xs text-muted-foreground mb-1">Carbs</div>
              <div className="font-semibold text-sm">{recipe.carbs}g</div>
            </div>
          </div>

          {/* Macros */}
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-3">Nutrition Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Protein</span>
                <div className="flex-1 mx-3 bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(recipe.protein / 50) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{recipe.protein}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Fat</span>
                <div className="flex-1 mx-3 bg-secondary rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{ width: `${(recipe.fat / 30) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{recipe.fat}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Carbs</span>
                <div className="flex-1 mx-3 bg-secondary rounded-full h-2">
                  <div
                    className="bg-destructive h-2 rounded-full"
                    style={{ width: `${(recipe.carbs / 50) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{recipe.carbs}g</span>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-3">Ingredients</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span className="text-muted-foreground">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Directions */}
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-3">Directions</h3>
            <ol className="space-y-3">
              {recipe.directions.map((direction, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <span className="font-semibold text-primary min-w-6">{idx + 1}.</span>
                  <span className="text-muted-foreground">{direction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Science Note */}
          {recipe.scienceNote && (
            <div className="mb-6 p-4 bg-secondary/50 border border-border rounded-lg">
              <h4 className="font-semibold text-sm text-foreground mb-2">🔬 40+ Science</h4>
              <p className="text-sm text-muted-foreground">{recipe.scienceNote}</p>
            </div>
          )}

          {/* Pro Tip */}
          {recipe.proTip && (
            <div className="p-4 bg-accent/10 border border-accent rounded-lg">
              <h4 className="font-semibold text-sm text-foreground mb-2">💡 Pro Tip</h4>
              <p className="text-sm text-muted-foreground">{recipe.proTip}</p>
            </div>
          )}

          {/* Action Button */}
          <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
            Add to Meal Plan
          </Button>
        </div>
      </Card>
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

  const categories = ["BREAKFAST", "MAINS", "SHAKES", "DRESSINGS"];
  const filteredRecipes = TUTK_RECIPES.filter((r) => r.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">FEAST</h1>
        <p className="text-muted-foreground text-lg">
          43 nutrition-forward recipes engineered for the 40+ body
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
        <TabsList className="grid w-full grid-cols-4 bg-secondary border border-border">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="text-xs md:text-sm">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredRecipes.map((recipe) => (
          <Card
            key={recipe.id}
            className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer overflow-hidden group"
            onClick={() => setSelectedRecipe(recipe)}
          >
            <div className="p-4 md:p-6">
              {/* ID Badge */}
              <div className="flex justify-between items-start mb-3">
                <span className="inline-block px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded">
                  {recipe.id}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">{recipe.time}</span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-lg md:text-xl text-foreground mb-3 group-hover:text-primary transition-colors">
                {recipe.name}
              </h3>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-secondary/50 p-2 rounded text-center">
                  <div className="text-xs text-muted-foreground">Calories</div>
                  <div className="font-semibold text-sm">{recipe.calories}</div>
                </div>
                <div className="bg-secondary/50 p-2 rounded text-center">
                  <div className="text-xs text-muted-foreground">Protein</div>
                  <div className="font-semibold text-sm text-primary">{recipe.protein}g</div>
                </div>
                <div className="bg-secondary/50 p-2 rounded text-center">
                  <div className="text-xs text-muted-foreground">Carbs</div>
                  <div className="font-semibold text-sm">{recipe.carbs}g</div>
                </div>
              </div>

              {/* Science Note Preview */}
              {recipe.scienceNote && (
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                  {recipe.scienceNote}
                </p>
              )}

              {/* CTA */}
              <Button
                variant="outline"
                className="w-full border-border hover:bg-primary/10 text-foreground"
              >
                View Recipe <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}

      {/* Nutrition Info Footer */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-card border-border">
          <Flame className="w-6 h-6 text-primary mb-3" />
          <h3 className="font-semibold text-foreground mb-2">High Protein</h3>
          <p className="text-sm text-muted-foreground">
            Every recipe hits 24-48g protein to support muscle maintenance after 40
          </p>
        </Card>
        <Card className="p-6 bg-card border-border">
          <Droplets className="w-6 h-6 text-accent mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Anti-Inflammatory</h3>
          <p className="text-sm text-muted-foreground">
            Omega-3s, colorful vegetables, and strategic carbs to fight chronic inflammation
          </p>
        </Card>
        <Card className="p-6 bg-card border-border">
          <Clock className="w-6 h-6 text-destructive mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Quick & Simple</h3>
          <p className="text-sm text-muted-foreground">
            Most recipes take 15-20 minutes. No complicated techniques or hard-to-find ingredients
          </p>
        </Card>
      </div>
    </div>
  );
}
