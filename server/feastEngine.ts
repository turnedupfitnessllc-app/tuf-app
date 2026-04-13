/**
 * TUF App — FEAST Engine v1.0
 * The Panther System FEAST Pillar — Food Intelligence Layer
 * Powered by Turned Up In The Kitchen (TUTK)
 *
 * Responsibilities:
 *   - Generate 7-day meal plans from FUEL profile + TUTK recipe database
 *   - Swap individual meals while respecting condition rules
 *   - Build categorized shopping lists from weekly plans
 *   - Evaluate meal logs and generate Panther FEAST directives via Claude
 *   - Apply Southern modification rules and condition overlays
 */

import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "crypto";
import type { StoredFuelProfile } from "./db.js";
import type {
  WeeklyMealPlan,
  DayPlan,
  PlannedMeal,
  ShoppingItem,
} from "./db.js";

// ─── Anthropic Client ─────────────────────────────────────────────────────────

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

// ─── FEAST System Prompt (PANTHERFEASTPROMPT.pdf v1.0) ───────────────────────

export const FEAST_SYSTEM_PROMPT = `THE PANTHER SYSTEM — FEAST PILLAR PROMPT FILE
Version 1.0 | April 2026 | Turned Up Fitness LLC | Powered by TUTK

## FEAST IDENTITY
You are The Panther System FEAST engine — the food intelligence layer of Turned Up Fitness,
powered by Turned Up In The Kitchen (TUTK). You do not suggest food. You prescribe meals.
Every output: HEADLINE / BODY / DIRECTIVE. No softening. Science + precision.

## FEAST VOICE LAWS
1. FOOD IS FUEL FIRST, CULTURE SECOND — BUT BOTH MATTER. Optimize culture, do not erase it.
2. SPECIFICITY OVER GENERALITY. Never "eat more protein." Say "35g — blackened catfish and grits — now."
3. THE PLATE IS A PRESCRIPTION. Every recommendation anchored to the client's FUEL profile.
4. REGIONAL INTELLIGENCE IS NON-NEGOTIABLE. Default to Georgia/Southern-available ingredients.
5. MODIFICATION NOT ELIMINATION. Teach Southern clients to make their food work for their body.

## RESPONSE FORMAT
HEADLINE: [One clinical food truth. Max 10 words.]
BODY: [Why it matters clinically. 2-3 sentences. Science-backed.]
DIRECTIVE: [One specific meal, recipe, or food action. Named. Quantified.]

## CONDITION RULES
DIABETES: No recipe > 60g net carbs. Always protein-anchor carb meals. Low-GI priority.
HYPERTENSION: No recipe > 600mg sodium. DASH framework. Potassium-rich sides.
JOINT INFLAMMATION: Omega-3 proteins 4x/week minimum. Turmeric + ginger 3 meals/week. No fried foods.

## SOUTHERN MODIFICATION QUICK REFERENCE
Fried Chicken → Air-fried almond flour | 35g protein | 60% less fat
Collard Greens → Turkey neck, no salt | anti-inflammatory | potassium-rich
BBQ Pork → Low-sodium rub, no-sugar sauce | hypertension-safe
Shrimp + Grits → Double shrimp, protein grits | 35g+ MPS trigger
Catfish → Blackened or baked | lean protein | omega-3 source
Cornbread → Protein powder + almond flour | lower GI
Peach Cobbler → Greek yogurt topping, reduced sugar | pre-sleep casein

## MEAL TIMING RULES
MEAL 1: 35g+ protein within 1hr waking — MPS trigger
PRE-TRAINING: 25-35g protein + 30-50g complex carbs — 60-90min before
POST-TRAINING: 35-45g fast protein — within 2hrs
PRE-SLEEP: 30-40g casein-rich — cottage cheese, Greek yogurt, TUTK cobbler

## WHAT FEAST NEVER SAYS
NEVER "Try to eat more vegetables!" — Name the vegetable, preparation, clinical reason, meal.
NEVER "Here are some healthy recipe ideas!" — One specific recipe. Named. Protein count. Timing.
NEVER "Consider substituting healthier options." — Name traditional dish, TUTK modification, macro gap.

© 2026 Turned Up Fitness LLC | The Panther System | TUTK`;

// ─── Macro Estimation Defaults ────────────────────────────────────────────────
// Used when a recipe doesn't have explicit macro data

interface MacroEstimate {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  mpsTriggered: boolean;
}

function estimateMacros(tags: string[], category: string): MacroEstimate {
  const isHighProtein = tags.includes("high-protein");
  const isLowCarb = tags.includes("low-carb");
  const isShake = category === "shakes";
  const isBreakfast = category === "breakfast";
  const isDressing = category === "dressings";

  if (isDressing) return { calories: 80, proteinG: 2, carbsG: 4, fatG: 7, mpsTriggered: false };
  if (isShake) return { calories: 320, proteinG: 35, carbsG: 28, fatG: 8, mpsTriggered: true };
  if (isBreakfast && isHighProtein) return { calories: 380, proteinG: 32, carbsG: 22, fatG: 16, mpsTriggered: true };
  if (isBreakfast) return { calories: 290, proteinG: 18, carbsG: 30, fatG: 10, mpsTriggered: false };
  if (isHighProtein && isLowCarb) return { calories: 420, proteinG: 42, carbsG: 10, fatG: 18, mpsTriggered: true };
  if (isHighProtein) return { calories: 480, proteinG: 38, carbsG: 32, fatG: 16, mpsTriggered: true };
  if (isLowCarb) return { calories: 350, proteinG: 28, carbsG: 12, fatG: 20, mpsTriggered: false };
  return { calories: 440, proteinG: 30, carbsG: 38, fatG: 14, mpsTriggered: false };
}

// ─── Recipe → PlannedMeal Converter ──────────────────────────────────────────

interface TutkRecipe {
  id: string;
  name: string;
  category: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  tags: string[];
  conditionFriendly?: string[];
  ingredients: string[];
}

function recipeToPlan(
  recipe: TutkRecipe,
  mealType: PlannedMeal["mealType"]
): PlannedMeal {
  const est = estimateMacros(recipe.tags, recipe.category);
  return {
    mealType,
    recipeId: recipe.id,
    recipeName: recipe.name,
    calories: recipe.calories ?? est.calories,
    proteinG: recipe.protein ?? est.proteinG,
    carbsG: recipe.carbs ?? est.carbsG,
    fatG: recipe.fat ?? est.fatG,
    mpsTriggered: (recipe.protein ?? est.proteinG) >= 30,
  };
}

// ─── Condition Filter ─────────────────────────────────────────────────────────

function recipePassesConditions(
  recipe: TutkRecipe,
  conditions: string[]
): boolean {
  const tags = recipe.tags.map((t) => t.toLowerCase());
  const condFriendly = (recipe.conditionFriendly ?? []).map((c) => c.toLowerCase());

  if (conditions.includes("diabetes")) {
    // Exclude high-carb recipes
    const est = estimateMacros(recipe.tags, recipe.category);
    const carbs = recipe.carbs ?? est.carbsG;
    if (carbs > 60) return false;
  }

  if (conditions.includes("hypertension")) {
    // Exclude fried foods
    if (tags.includes("fried") || tags.includes("high-sodium")) return false;
  }

  if (conditions.includes("joint_inflammation")) {
    // Exclude fried foods
    if (tags.includes("fried")) return false;
  }

  return true;
}

// ─── Meal Type Selector ───────────────────────────────────────────────────────

function selectRecipeForMealType(
  recipes: TutkRecipe[],
  mealType: PlannedMeal["mealType"],
  conditions: string[],
  usedIds: Set<string>
): TutkRecipe | null {
  const filtered = recipes.filter((r) => {
    if (usedIds.has(r.id)) return false;
    if (!recipePassesConditions(r, conditions)) return false;

    switch (mealType) {
      case "meal1":
        return r.category === "breakfast" || r.tags.includes("high-protein");
      case "pre_training":
        return r.category === "shakes" || r.tags.includes("pre-workout");
      case "post_training":
        return (
          r.tags.includes("high-protein") &&
          (r.category === "mains" || r.category === "shakes")
        );
      case "pre_sleep":
        return (
          r.tags.includes("casein") ||
          r.tags.includes("cottage-cheese") ||
          r.category === "shakes"
        );
      case "meal2":
        return r.category === "mains";
      default:
        return true;
    }
  });

  if (filtered.length === 0) {
    // Fallback: any passing recipe not yet used
    const fallback = recipes.filter(
      (r) => !usedIds.has(r.id) && recipePassesConditions(r, conditions)
    );
    if (fallback.length === 0) return null;
    return fallback[Math.floor(Math.random() * fallback.length)];
  }

  return filtered[Math.floor(Math.random() * filtered.length)];
}

// ─── Generate Weekly Plan ─────────────────────────────────────────────────────

export async function generateWeeklyPlan(
  userId: string,
  fuelProfile: StoredFuelProfile,
  recipes: TutkRecipe[],
  weekStartDate: string // ISO Monday date
): Promise<WeeklyMealPlan> {
  const days: DayPlan[] = [];
  const usedIds = new Set<string>();
  const conditions = fuelProfile.conditions ?? [];

  const MEAL_TYPES: PlannedMeal["mealType"][] = [
    "meal1",
    "meal2",
    "pre_training",
    "post_training",
    "pre_sleep",
  ];

  const startMs = new Date(weekStartDate).getTime();

  for (let d = 0; d < 7; d++) {
    const dateISO = new Date(startMs + d * 86400000).toISOString().split("T")[0];
    const meals: PlannedMeal[] = [];

    for (const mealType of MEAL_TYPES) {
      const recipe = selectRecipeForMealType(recipes, mealType, conditions, usedIds);
      if (recipe) {
        usedIds.add(recipe.id);
        meals.push(recipeToPlan(recipe, mealType));
      }
    }

    const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
    const totalProteinG = meals.reduce((s, m) => s + m.proteinG, 0);
    const totalCarbsG = meals.reduce((s, m) => s + m.carbsG, 0);
    const totalFatG = meals.reduce((s, m) => s + m.fatG, 0);

    days.push({
      dayOfWeek: d,
      dateISO,
      meals,
      totalCalories,
      totalProteinG,
      totalCarbsG,
      totalFatG,
      macroTargetMet:
        totalCalories >= fuelProfile.calorieTarget * 0.9 &&
        totalProteinG >= fuelProfile.proteinTargetG * 0.85,
    });
  }

  const weeklyCalories = days.reduce((s, d) => s + d.totalCalories, 0);
  const weeklyProteinG = days.reduce((s, d) => s + d.totalProteinG, 0);
  const weeklyCarbsG = days.reduce((s, d) => s + d.totalCarbsG, 0);
  const weeklyFatG = days.reduce((s, d) => s + d.totalFatG, 0);

  const shoppingList = generateShoppingList(days, recipes);

  return {
    planId: randomUUID(),
    userId,
    weekStartDate,
    days,
    weeklyCalories,
    weeklyProteinG,
    weeklyCarbsG,
    weeklyFatG,
    shoppingList,
    fuelProfileSnapshot: {
      calorieTarget: fuelProfile.calorieTarget,
      proteinTarget: fuelProfile.proteinTargetG,
      carbTarget: fuelProfile.carbTargetG,
      fatTarget: fuelProfile.fatTargetG,
      goal: fuelProfile.primaryGoal,
      conditions,
    },
    generatedAt: Date.now(),
  };
}

// ─── Generate Shopping List ───────────────────────────────────────────────────

export function generateShoppingList(
  days: DayPlan[],
  recipes: TutkRecipe[]
): ShoppingItem[] {
  const recipeMap = new Map(recipes.map((r) => [r.id, r]));
  const ingredientCounts = new Map<string, number>();

  for (const day of days) {
    for (const meal of day.meals) {
      const recipe = recipeMap.get(meal.recipeId);
      if (!recipe) continue;
      for (const ingredient of recipe.ingredients) {
        const key = ingredient.toLowerCase().trim();
        ingredientCounts.set(key, (ingredientCounts.get(key) ?? 0) + 1);
      }
    }
  }

  const items: ShoppingItem[] = [];

  for (const [ingredient, count] of Array.from(ingredientCounts.entries())) {
    const category = categorizeIngredient(ingredient);
    const budgetTier = estimateBudgetTier(ingredient);
    items.push({
      name: ingredient,
      totalAmount: count > 1 ? `×${count}` : "1 serving",
      unit: "serving",
      category,
      budgetTier,
      checked: false,
    });
  }

  // Sort by category
  const categoryOrder: ShoppingItem["category"][] = [
    "protein",
    "produce",
    "dairy",
    "pantry",
    "supplements",
    "other",
  ];

  return items.sort(
    (a, b) =>
      categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
  );
}

function categorizeIngredient(ingredient: string): ShoppingItem["category"] {
  const lower = ingredient.toLowerCase();
  if (
    lower.includes("chicken") ||
    lower.includes("beef") ||
    lower.includes("pork") ||
    lower.includes("fish") ||
    lower.includes("salmon") ||
    lower.includes("tuna") ||
    lower.includes("shrimp") ||
    lower.includes("scallop") ||
    lower.includes("turkey") ||
    lower.includes("egg") ||
    lower.includes("catfish")
  )
    return "protein";
  if (
    lower.includes("milk") ||
    lower.includes("cheese") ||
    lower.includes("yogurt") ||
    lower.includes("butter") ||
    lower.includes("cottage") ||
    lower.includes("cream")
  )
    return "dairy";
  if (
    lower.includes("protein powder") ||
    lower.includes("creatine") ||
    lower.includes("supplement") ||
    lower.includes("bcaa")
  )
    return "supplements";
  if (
    lower.includes("spinach") ||
    lower.includes("kale") ||
    lower.includes("broccoli") ||
    lower.includes("pepper") ||
    lower.includes("onion") ||
    lower.includes("garlic") ||
    lower.includes("tomato") ||
    lower.includes("cabbage") ||
    lower.includes("sprout") ||
    lower.includes("celery") ||
    lower.includes("avocado") ||
    lower.includes("lemon") ||
    lower.includes("lime") ||
    lower.includes("berry") ||
    lower.includes("banana") ||
    lower.includes("apple") ||
    lower.includes("peach")
  )
    return "produce";
  if (
    lower.includes("oil") ||
    lower.includes("sauce") ||
    lower.includes("vinegar") ||
    lower.includes("salt") ||
    lower.includes("pepper") ||
    lower.includes("spice") ||
    lower.includes("flour") ||
    lower.includes("oat") ||
    lower.includes("rice") ||
    lower.includes("quinoa") ||
    lower.includes("pasta") ||
    lower.includes("grits") ||
    lower.includes("honey") ||
    lower.includes("syrup")
  )
    return "pantry";
  return "other";
}

function estimateBudgetTier(ingredient: string): ShoppingItem["budgetTier"] {
  const lower = ingredient.toLowerCase();
  if (
    lower.includes("salmon") ||
    lower.includes("scallop") ||
    lower.includes("grass-fed") ||
    lower.includes("kerrygold") ||
    lower.includes("wagyu") ||
    lower.includes("organic")
  )
    return "premium";
  if (
    lower.includes("chicken breast") ||
    lower.includes("ground turkey") ||
    lower.includes("shrimp") ||
    lower.includes("greek yogurt") ||
    lower.includes("almond")
  )
    return "mid";
  return "budget";
}

// ─── Evaluate Feast Log + Generate Directive ──────────────────────────────────

interface FeastEvalInput {
  fuelProfile: StoredFuelProfile;
  todayCalories: number;
  todayProteinG: number;
  todayCarbsG: number;
  todayFatG: number;
  mealsLogged: number;
  trainingToday: boolean;
  lastMealTime?: string;
  conditions: string[];
}

export async function generateFeastDirective(
  input: FeastEvalInput
): Promise<{ headline: string; body: string; directive: string }> {
  const {
    fuelProfile,
    todayCalories,
    todayProteinG,
    todayCarbsG,
    todayFatG,
    mealsLogged,
    trainingToday,
    lastMealTime,
    conditions,
  } = input;

  const proteinGap = fuelProfile.proteinTargetG - todayProteinG;
  const calorieGap = fuelProfile.calorieTarget - todayCalories;
  const postTrainingWindow =
    trainingToday && mealsLogged < 3 ? "post-training window open" : null;

  const conditionContext = conditions.length
    ? `Active conditions: ${conditions.join(", ")}.`
    : "No active conditions.";

  const userContext = `
FUEL Profile:
- Calorie target: ${fuelProfile.calorieTarget} kcal/day
- Protein target: ${fuelProfile.proteinTargetG}g/day
- Carb target: ${fuelProfile.carbTargetG}g/day
- Fat target: ${fuelProfile.fatTargetG}g/day
- Goal: ${fuelProfile.primaryGoal}
- ${conditionContext}

Today's intake so far:
- Calories: ${todayCalories} kcal (${calorieGap > 0 ? calorieGap + " remaining" : "target met"})
- Protein: ${todayProteinG}g (${proteinGap > 0 ? proteinGap + "g remaining" : "target met"})
- Carbs: ${todayCarbsG}g
- Fat: ${todayFatG}g
- Meals logged: ${mealsLogged}
- Training today: ${trainingToday ? "YES" : "NO"}
${lastMealTime ? `- Last meal: ${lastMealTime}` : ""}
${postTrainingWindow ? `- STATUS: ${postTrainingWindow}` : ""}
`;

  const userMessage = `Based on this client's FUEL profile and today's intake, generate a FEAST directive.

${userContext}

Respond in exactly this format:
HEADLINE: [One clinical food truth. Max 10 words.]
BODY: [Why it matters clinically. 2-3 sentences. Science-backed.]
DIRECTIVE: [One specific meal, recipe, or food action. Named. Quantified.]`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 300,
      system: FEAST_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    const headlineMatch = text.match(/HEADLINE:\s*(.+)/);
    const bodyMatch = text.match(/BODY:\s*([\s\S]+?)(?=DIRECTIVE:|$)/);
    const directiveMatch = text.match(/DIRECTIVE:\s*([\s\S]+?)$/);

    return {
      headline: headlineMatch?.[1]?.trim() ?? "Protein window is closing.",
      body:
        bodyMatch?.[1]?.trim() ??
        "MPS requires a leucine threshold trigger within 2 hours of training.",
      directive:
        directiveMatch?.[1]?.trim() ??
        "Log your next meal now — 35g protein minimum.",
    };
  } catch (err) {
    console.error("[FEAST] Directive generation failed:", err);
    return {
      headline: "Protein target not met today.",
      body: `You need ${proteinGap}g more protein to hit your daily target. Every gram counts for muscle protein synthesis.`,
      directive: `Next meal: 35g protein — blackened catfish, grilled chicken, or a TUTK protein shake — within the next 2 hours.`,
    };
  }
}

// ─── Swap Meal (condition-safe) ───────────────────────────────────────────────

export function findSwapRecipe(
  currentRecipeId: string,
  mealType: PlannedMeal["mealType"],
  conditions: string[],
  recipes: TutkRecipe[]
): TutkRecipe | null {
  const candidates = recipes.filter(
    (r) =>
      r.id !== currentRecipeId &&
      recipePassesConditions(r, conditions)
  );

  // Prefer same category
  const current = recipes.find((r) => r.id === currentRecipeId);
  const sameCategory = candidates.filter(
    (r) => r.category === current?.category
  );

  const pool = sameCategory.length > 0 ? sameCategory : candidates;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
