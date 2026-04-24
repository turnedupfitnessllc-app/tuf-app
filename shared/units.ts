/**
 * TUF Unit Conversion Utility
 * Canonical source of truth for all unit conversions in the app.
 *
 * Storage rule: ALL measurements are stored in metric (kg / cm) in the database.
 * These functions are used at the display layer only.
 */

export type UnitSystem = "imperial" | "metric";

// ─── Weight ──────────────────────────────────────────────────────────────────

/** Kilograms → Pounds (1 decimal place) */
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

/** Pounds → Kilograms (2 decimal places) */
export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 100) / 100;
}

// ─── Height ──────────────────────────────────────────────────────────────────

/** Centimeters → Inches (1 decimal place) */
export function cmToInches(cm: number): number {
  return Math.round((cm / 2.54) * 10) / 10;
}

/** Inches → Centimeters (1 decimal place) */
export function inchesToCm(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10;
}

/** Centimeters → { ft, in } object */
export function cmToFtIn(cm: number): { ft: number; in: number } {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { ft, in: inches };
}

/** { ft, in } → Centimeters */
export function ftInToCm(ft: number, inches: number): number {
  return Math.round((ft * 12 + inches) * 2.54 * 10) / 10;
}

// ─── Food / Volume ───────────────────────────────────────────────────────────

/** Grams → Ounces (1 decimal place) */
export function gToOz(g: number): number {
  return Math.round((g / 28.3495) * 10) / 10;
}

/** Ounces → Grams (1 decimal place) */
export function ozToG(oz: number): number {
  return Math.round(oz * 28.3495 * 10) / 10;
}

/** Milliliters → Fluid ounces (1 decimal place) */
export function mlToFlOz(ml: number): number {
  return Math.round((ml / 29.5735) * 10) / 10;
}

/** Fluid ounces → Milliliters (1 decimal place) */
export function flOzToMl(flOz: number): number {
  return Math.round(flOz * 29.5735 * 10) / 10;
}

// ─── Display Helpers ─────────────────────────────────────────────────────────

/**
 * Format a weight value for display based on user's unit preference.
 * Input is always in kg (canonical storage unit).
 *
 * @example formatWeight(90, "imperial") → "198.4 lbs"
 * @example formatWeight(90, "metric")   → "90 kg"
 */
export function formatWeight(kg: number, system: UnitSystem): string {
  if (system === "imperial") {
    return `${kgToLbs(kg)} lbs`;
  }
  return `${kg} kg`;
}

/**
 * Format a height value for display based on user's unit preference.
 * Input is always in cm (canonical storage unit).
 *
 * @example formatHeight(175, "imperial") → "5'9\""
 * @example formatHeight(175, "metric")   → "175 cm"
 */
export function formatHeight(cm: number, system: UnitSystem): string {
  if (system === "imperial") {
    const { ft, in: inches } = cmToFtIn(cm);
    return `${ft}'${inches}"`;
  }
  return `${cm} cm`;
}

/**
 * Format a food weight for display based on user's unit preference.
 * Input is always in grams.
 *
 * @example formatFoodWeight(113, "imperial") → "4 oz"
 * @example formatFoodWeight(113, "metric")   → "113 g"
 */
export function formatFoodWeight(grams: number, system: UnitSystem): string {
  if (system === "imperial") {
    return `${gToOz(grams)} oz`;
  }
  return `${grams} g`;
}

/**
 * Format a food weight showing BOTH units — used in TUTK recipes and FEAST.
 * Always shows imperial first, metric in parentheses.
 *
 * @example formatFoodWeightDual(113) → "4 oz (113g)"
 * @example formatFoodWeightDual(28)  → "1 oz (28g)"
 */
export function formatFoodWeightDual(grams: number): string {
  return `${gToOz(grams)} oz (${grams}g)`;
}

/**
 * Parse a user-entered weight string and return canonical kg value.
 * Handles "185 lbs", "185lbs", "84 kg", "84kg", bare numbers (assumed lbs if imperial).
 */
export function parseWeightInput(
  input: string,
  defaultSystem: UnitSystem = "imperial"
): number | null {
  const clean = input.trim().toLowerCase();
  const lbsMatch = clean.match(/^([\d.]+)\s*lbs?$/);
  const kgMatch = clean.match(/^([\d.]+)\s*kg$/);
  const bareMatch = clean.match(/^([\d.]+)$/);

  if (lbsMatch) return lbsToKg(parseFloat(lbsMatch[1]));
  if (kgMatch) return parseFloat(kgMatch[1]);
  if (bareMatch) {
    const val = parseFloat(bareMatch[1]);
    return defaultSystem === "imperial" ? lbsToKg(val) : val;
  }
  return null;
}

/**
 * Parse a user-entered height string and return canonical cm value.
 * Handles "5'9\"", "5 ft 9 in", "175 cm", "175cm", bare numbers (assumed cm if metric).
 */
export function parseHeightInput(
  input: string,
  defaultSystem: UnitSystem = "imperial"
): number | null {
  const clean = input.trim().toLowerCase();
  // 5'9" or 5'9 or 5' 9"
  const ftInMatch = clean.match(/^(\d+)['\s](?:ft\s?)?(\d+)?(?:"|in)?$/);
  const cmMatch = clean.match(/^([\d.]+)\s*cm$/);
  const bareMatch = clean.match(/^([\d.]+)$/);

  if (ftInMatch) {
    const ft = parseInt(ftInMatch[1]);
    const inches = parseInt(ftInMatch[2] ?? "0");
    return ftInToCm(ft, inches);
  }
  if (cmMatch) return parseFloat(cmMatch[1]);
  if (bareMatch) {
    const val = parseFloat(bareMatch[1]);
    return defaultSystem === "metric" ? val : null; // bare number is ambiguous for height
  }
  return null;
}

// ─── Common Measure Conversions ──────────────────────────────────────────────

/**
 * Common kitchen measures → grams for typical ingredients.
 * These are approximate averages — actual density varies by ingredient.
 * Used for food library display and recipe conversions.
 */
export const COMMON_MEASURES: Record<
  string,
  { grams: number; label: string }
> = {
  tsp: { grams: 5, label: "1 tsp" },
  tbsp: { grams: 15, label: "1 tbsp" },
  "1/4 cup": { grams: 60, label: "¼ cup" },
  "1/3 cup": { grams: 80, label: "⅓ cup" },
  "1/2 cup": { grams: 120, label: "½ cup" },
  cup: { grams: 240, label: "1 cup" },
  oz: { grams: 28.35, label: "1 oz" },
  "4 oz": { grams: 113, label: "4 oz" },
  "6 oz": { grams: 170, label: "6 oz" },
  "8 oz": { grams: 227, label: "8 oz" },
  "12 oz": { grams: 340, label: "12 oz" },
  lb: { grams: 454, label: "1 lb" },
  slice: { grams: 30, label: "1 slice" },
  piece: { grams: 50, label: "1 piece" },
  "medium piece": { grams: 120, label: "1 medium piece" },
  "large piece": { grams: 200, label: "1 large piece" },
  scoop: { grams: 30, label: "1 scoop (protein)" },
};

/**
 * Seasoning-specific gram weights per common measure.
 * Seasonings are typically used in tsp/tbsp — this table gives accurate gram weights.
 */
export const SEASONING_MEASURES: Record<
  string,
  { tsp_g: number; tbsp_g: number }
> = {
  salt: { tsp_g: 6, tbsp_g: 18 },
  "black pepper": { tsp_g: 2.3, tbsp_g: 6.9 },
  "garlic powder": { tsp_g: 3.1, tbsp_g: 9.3 },
  "onion powder": { tsp_g: 2.5, tbsp_g: 7.5 },
  paprika: { tsp_g: 2.3, tbsp_g: 6.9 },
  "smoked paprika": { tsp_g: 2.3, tbsp_g: 6.9 },
  "cayenne pepper": { tsp_g: 1.8, tbsp_g: 5.4 },
  "chili powder": { tsp_g: 2.7, tbsp_g: 8.1 },
  cumin: { tsp_g: 2.1, tbsp_g: 6.3 },
  oregano: { tsp_g: 1.5, tbsp_g: 4.5 },
  thyme: { tsp_g: 1.4, tbsp_g: 4.2 },
  "cajun seasoning": { tsp_g: 2.5, tbsp_g: 7.5 },
  "old bay": { tsp_g: 2.4, tbsp_g: 7.2 },
  "lemon pepper": { tsp_g: 2.2, tbsp_g: 6.6 },
  "italian seasoning": { tsp_g: 1.5, tbsp_g: 4.5 },
  cinnamon: { tsp_g: 2.6, tbsp_g: 7.8 },
  "garlic salt": { tsp_g: 5.5, tbsp_g: 16.5 },
  "seasoned salt": { tsp_g: 5.5, tbsp_g: 16.5 },
  "tony chachere's": { tsp_g: 2.5, tbsp_g: 7.5 },
};
