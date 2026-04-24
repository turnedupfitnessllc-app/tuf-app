/**
 * TUF Food Library Service
 * Wraps the 1,802-item food database (from Turned Up Fitness meal planner Excel)
 * with search, filtering, and unit-aware display helpers.
 *
 * Data source: Google Drive — "Copy of Meal Planner_Turnedup_Fitness .xlsx"
 * Groups: Poultry, Beef, Pork, Fish, Vegetables, Fruits, Grains, Dairy,
 *         Legumes, Nuts, Fats, Spices & Herbs, Baked, Sweets, Beverages
 *
 * Storage rule: All macros are stored per 100g (canonical).
 * Serving sizes are pre-calculated for common measures.
 * Imperial display uses oz/lbs via shared/units.ts helpers.
 */

import type { UnitSystem } from "./units.js";
import { gToOz, formatFoodWeightDual } from "./units.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FoodMacros {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface FoodItem {
  food_group: string;
  name: string;
  serve_g: number;          // canonical serving size in grams
  serve_oz: number;         // same serving in oz (pre-calculated)
  common_measure: string;   // e.g. "4 oz", "1 cup", "1 tsp"
  per_100g: FoodMacros;
  per_serving: FoodMacros;
  custom?: boolean;
}

export interface FoodSearchResult extends FoodItem {
  display_serving: string;  // formatted for user's unit preference
  display_macros: string;   // compact macro string e.g. "135 cal | 25g P | 0g C | 3g F"
}

// ─── Load Data ────────────────────────────────────────────────────────────────

// Dynamic import for Node.js server-side use
let _library: FoodItem[] | null = null;

export async function getFoodLibrary(): Promise<FoodItem[]> {
  if (_library) return _library;
  const { createRequire } = await import("module");
  const require = createRequire(import.meta.url);
  _library = require("./foodLibrary.json") as FoodItem[];
  return _library;
}

// Synchronous version for client-side (Vite handles JSON imports)
export function getFoodLibrarySync(): FoodItem[] {
  if (_library) return _library;
  // In browser context, this is handled by Vite's JSON import
  throw new Error("Use getFoodLibrary() on the server or import foodLibrary.json directly in client code");
}

// ─── Search ───────────────────────────────────────────────────────────────────

/**
 * Search the food library by name (case-insensitive, partial match).
 * Returns up to `limit` results sorted by relevance (exact match first).
 */
export async function searchFoods(
  query: string,
  options: {
    group?: string;
    limit?: number;
    unitSystem?: UnitSystem;
  } = {}
): Promise<FoodSearchResult[]> {
  const library = await getFoodLibrary();
  const { group, limit = 20, unitSystem = "imperial" } = options;
  const q = query.toLowerCase().trim();

  if (!q) return [];

  let results = library.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(q);
    const groupMatch = !group || item.food_group === group;
    return nameMatch && groupMatch;
  });

  // Sort: exact name match first, then starts-with, then contains
  results.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aExact = aName === q ? 0 : aName.startsWith(q) ? 1 : 2;
    const bExact = bName === q ? 0 : bName.startsWith(q) ? 1 : 2;
    return aExact - bExact || a.name.localeCompare(b.name);
  });

  return results.slice(0, limit).map((item) => formatFoodResult(item, unitSystem));
}

/**
 * Get all items in a specific food group.
 */
export async function getFoodsByGroup(
  group: string,
  unitSystem: UnitSystem = "imperial"
): Promise<FoodSearchResult[]> {
  const library = await getFoodLibrary();
  return library
    .filter((item) => item.food_group === group)
    .map((item) => formatFoodResult(item, unitSystem));
}

/**
 * Get all available food groups.
 */
export async function getFoodGroups(): Promise<string[]> {
  const library = await getFoodLibrary();
  const groups = new Set(library.map((item) => item.food_group));
  return Array.from(groups).sort();
}

/**
 * Get a single food item by exact name match.
 */
export async function getFoodByName(
  name: string,
  unitSystem: UnitSystem = "imperial"
): Promise<FoodSearchResult | null> {
  const library = await getFoodLibrary();
  const item = library.find(
    (f) => f.name.toLowerCase() === name.toLowerCase()
  );
  return item ? formatFoodResult(item, unitSystem) : null;
}

// ─── Macro Calculation ────────────────────────────────────────────────────────

/**
 * Calculate macros for a custom serving size.
 * @param food - The food item
 * @param servingG - The desired serving size in grams
 */
export function calcMacrosForServing(
  food: FoodItem,
  servingG: number
): FoodMacros {
  const ratio = servingG / 100;
  return {
    calories: Math.round(food.per_100g.calories * ratio * 10) / 10,
    protein_g: Math.round(food.per_100g.protein_g * ratio * 100) / 100,
    carbs_g: Math.round(food.per_100g.carbs_g * ratio * 100) / 100,
    fat_g: Math.round(food.per_100g.fat_g * ratio * 100) / 100,
  };
}

/**
 * Calculate macros from an oz amount.
 */
export function calcMacrosForOz(food: FoodItem, oz: number): FoodMacros {
  return calcMacrosForServing(food, oz * 28.3495);
}

// ─── Display Helpers ─────────────────────────────────────────────────────────

function formatFoodResult(item: FoodItem, unitSystem: UnitSystem): FoodSearchResult {
  const display_serving =
    unitSystem === "imperial"
      ? `${item.serve_oz} oz (${item.serve_g}g) — ${item.common_measure}`
      : `${item.serve_g}g — ${item.common_measure}`;

  const m = item.per_serving;
  const display_macros = `${Math.round(m.calories)} cal | ${m.protein_g}g P | ${m.carbs_g}g C | ${m.fat_g}g F`;

  return { ...item, display_serving, display_macros };
}

/**
 * Format a food item's serving for dual-unit display in recipes.
 * e.g. "4 oz (113g) chicken breast"
 */
export function formatRecipeIngredient(
  food: FoodItem,
  servingG: number,
  unitSystem: UnitSystem = "imperial"
): string {
  if (unitSystem === "imperial") {
    return formatFoodWeightDual(servingG);
  }
  return `${servingG}g`;
}

// ─── Seasoning Quick-Add ─────────────────────────────────────────────────────

/**
 * Common seasonings with pre-calculated macros for quick-add in FEAST/TUTK recipes.
 * These are the most common Southern/Cajun seasonings used in TUF recipes.
 */
export const SOUTHERN_SEASONINGS = [
  { name: "Cajun Seasoning", tsp_g: 2.5, cal_per_tsp: 8, sodium_mg: 310 },
  { name: "Old Bay Seasoning", tsp_g: 2.4, cal_per_tsp: 7, sodium_mg: 290 },
  { name: "Tony Chachere's Creole", tsp_g: 2.5, cal_per_tsp: 0, sodium_mg: 340 },
  { name: "Garlic Powder", tsp_g: 3.1, cal_per_tsp: 10, sodium_mg: 2 },
  { name: "Onion Powder", tsp_g: 2.5, cal_per_tsp: 8, sodium_mg: 2 },
  { name: "Smoked Paprika", tsp_g: 2.3, cal_per_tsp: 7, sodium_mg: 2 },
  { name: "Lemon Pepper", tsp_g: 2.2, cal_per_tsp: 6, sodium_mg: 230 },
  { name: "Seasoned Salt", tsp_g: 5.5, cal_per_tsp: 0, sodium_mg: 450 },
  { name: "Black Pepper", tsp_g: 2.3, cal_per_tsp: 6, sodium_mg: 1 },
  { name: "Cumin", tsp_g: 2.1, cal_per_tsp: 8, sodium_mg: 4 },
  { name: "Chili Powder", tsp_g: 2.7, cal_per_tsp: 8, sodium_mg: 76 },
  { name: "Cayenne Pepper", tsp_g: 1.8, cal_per_tsp: 6, sodium_mg: 1 },
  { name: "Cinnamon", tsp_g: 2.6, cal_per_tsp: 6, sodium_mg: 0 },
  { name: "Turmeric", tsp_g: 3.0, cal_per_tsp: 9, sodium_mg: 1 },
  { name: "Italian Seasoning", tsp_g: 1.5, cal_per_tsp: 4, sodium_mg: 2 },
] as const;
