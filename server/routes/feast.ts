/**
 * TUF App — FEAST Pillar API Routes
 * The Panther System FEAST Engine — Food Intelligence Layer
 *
 * Routes:
 *   POST /api/feast/generate-plan    — Generate a 7-day meal plan from FUEL profile
 *   GET  /api/feast/plan/:userId      — Get the latest meal plan for a user
 *   POST /api/feast/swap-meal         — Swap one meal in the plan
 *   POST /api/feast/check-item        — Toggle a shopping list item
 *   POST /api/feast/directive         — Generate a Panther FEAST directive
 *   GET  /api/feast/recipes           — Get all TUTK recipes (with optional filters)
 */

import express from "express";
import {
  getFuelProfile,
  saveMealPlan,
  getLatestMealPlan,
  getMealPlan,
  swapPlannedMeal,
  updateMealPlanShoppingItem,
  markMealPlanViewed,
  type PlannedMeal,
} from "../db.js";
import {
  generateWeeklyPlan,
  generateFeastDirective,
  findSwapRecipe,
  generateShoppingList,
} from "../feastEngine.js";

const router = express.Router();

// ─── Helper: Load TUTK Recipes ────────────────────────────────────────────────
// Recipes live in the client data file — we import them dynamically so the
// server doesn't need a separate copy.

let _recipes: any[] | null = null;

async function getRecipes(): Promise<any[]> {
  if (_recipes) return _recipes;
  try {
    // Dynamic import of the compiled client data (available in dev via tsx)
    const mod = await import("../../client/src/data/tutkRecipes.js");
    _recipes = mod.tutkRecipes ?? [];
  } catch {
    // Fallback: try the .ts path (tsx resolves it)
    try {
      const mod = await import("../../client/src/data/tutkRecipes.ts");
      _recipes = (mod as any).tutkRecipes ?? [];
    } catch (e) {
      console.error("[FEAST] Could not load TUTK recipes:", e);
      _recipes = [];
    }
  }
  return _recipes!;
}

// ─── POST /api/feast/generate-plan ───────────────────────────────────────────

router.post("/generate-plan", async (req, res) => {
  try {
    const { userId, weekStartDate } = req.body as {
      userId: string;
      weekStartDate?: string;
    };

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const fuelProfile = await getFuelProfile(userId);
    if (!fuelProfile) {
      return res.status(404).json({
        error: "No FUEL profile found. Complete FUEL setup first.",
      });
    }

    // Default to current Monday
    const startDate =
      weekStartDate ?? getMondayISO(new Date());

    const recipes = await getRecipes();
    const plan = await generateWeeklyPlan(
      userId,
      fuelProfile,
      recipes,
      startDate
    );

    await saveMealPlan(plan);

    console.log(
      `[FEAST] Generated 7-day plan for user ${userId} — planId: ${plan.planId}`
    );
    res.json({ plan });
  } catch (err) {
    console.error("[FEAST] generate-plan error:", err);
    res.status(500).json({ error: "Failed to generate meal plan" });
  }
});

// ─── GET /api/feast/plan/:userId ──────────────────────────────────────────────

router.get("/plan/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const plan = await getLatestMealPlan(userId);

    if (!plan) {
      return res.status(404).json({ error: "No meal plan found" });
    }

    await markMealPlanViewed(plan.planId);
    res.json({ plan });
  } catch (err) {
    console.error("[FEAST] get-plan error:", err);
    res.status(500).json({ error: "Failed to get meal plan" });
  }
});

// ─── POST /api/feast/swap-meal ────────────────────────────────────────────────

router.post("/swap-meal", async (req, res) => {
  try {
    const {
      planId,
      dayOfWeek,
      mealType,
      conditions = [],
    } = req.body as {
      planId: string;
      dayOfWeek: number;
      mealType: PlannedMeal["mealType"];
      conditions?: string[];
    };

    if (!planId || dayOfWeek === undefined || !mealType) {
      return res.status(400).json({ error: "planId, dayOfWeek, mealType required" });
    }

    const plan = await getMealPlan(planId);
    if (!plan) {
      return res.status(404).json({ error: "Meal plan not found" });
    }

    const day = plan.days.find((d) => d.dayOfWeek === dayOfWeek);
    const currentMeal = day?.meals.find((m) => m.mealType === mealType);
    if (!currentMeal) {
      return res.status(404).json({ error: "Meal not found in plan" });
    }

    const recipes = await getRecipes();
    const swapRecipe = findSwapRecipe(
      currentMeal.recipeId,
      mealType,
      conditions,
      recipes
    );

    if (!swapRecipe) {
      return res.status(404).json({ error: "No suitable swap recipe found" });
    }

    const newMeal: PlannedMeal = {
      mealType,
      recipeId: swapRecipe.id,
      recipeName: swapRecipe.name,
      calories: swapRecipe.calories ?? 420,
      proteinG: swapRecipe.protein ?? 35,
      carbsG: swapRecipe.carbs ?? 30,
      fatG: swapRecipe.fat ?? 15,
      mpsTriggered: (swapRecipe.protein ?? 35) >= 30,
      swapped: true,
    };

    const updatedPlan = await swapPlannedMeal(planId, dayOfWeek, mealType, newMeal);
    res.json({ plan: updatedPlan, swappedTo: swapRecipe.name });
  } catch (err) {
    console.error("[FEAST] swap-meal error:", err);
    res.status(500).json({ error: "Failed to swap meal" });
  }
});

// ─── POST /api/feast/check-item ───────────────────────────────────────────────

router.post("/check-item", async (req, res) => {
  try {
    const { planId, itemName, checked } = req.body as {
      planId: string;
      itemName: string;
      checked: boolean;
    };

    const success = await updateMealPlanShoppingItem(planId, itemName, checked);
    if (!success) {
      return res.status(404).json({ error: "Plan or item not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("[FEAST] check-item error:", err);
    res.status(500).json({ error: "Failed to update shopping item" });
  }
});

// ─── POST /api/feast/directive ────────────────────────────────────────────────

router.post("/directive", async (req, res) => {
  try {
    const {
      userId,
      todayCalories = 0,
      todayProteinG = 0,
      todayCarbsG = 0,
      todayFatG = 0,
      mealsLogged = 0,
      trainingToday = false,
      lastMealTime,
    } = req.body as {
      userId: string;
      todayCalories?: number;
      todayProteinG?: number;
      todayCarbsG?: number;
      todayFatG?: number;
      mealsLogged?: number;
      trainingToday?: boolean;
      lastMealTime?: string;
    };

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const fuelProfile = await getFuelProfile(userId);
    if (!fuelProfile) {
      return res.status(404).json({ error: "No FUEL profile found" });
    }

    const directive = await generateFeastDirective({
      fuelProfile,
      todayCalories,
      todayProteinG,
      todayCarbsG,
      todayFatG,
      mealsLogged,
      trainingToday,
      lastMealTime,
      conditions: fuelProfile.conditions ?? [],
    });

    res.json({ directive });
  } catch (err) {
    console.error("[FEAST] directive error:", err);
    res.status(500).json({ error: "Failed to generate directive" });
  }
});

// ─── GET /api/feast/recipes ───────────────────────────────────────────────────

router.get("/recipes", async (req, res) => {
  try {
    const { category, condition, search } = req.query as {
      category?: string;
      condition?: string;
      search?: string;
    };

    let recipes = await getRecipes();

    if (category) {
      recipes = recipes.filter((r) => r.category === category);
    }

    if (condition) {
      recipes = recipes.filter((r) =>
        (r.conditionFriendly ?? []).includes(condition)
      );
    }

    if (search) {
      const q = search.toLowerCase();
      recipes = recipes.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.tags.some((t: string) => t.toLowerCase().includes(q)) ||
          r.ingredients.some((i: string) => i.toLowerCase().includes(q))
      );
    }

    res.json({ recipes, total: recipes.length });
  } catch (err) {
    console.error("[FEAST] recipes error:", err);
    res.status(500).json({ error: "Failed to load recipes" });
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMondayISO(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

export default router;
