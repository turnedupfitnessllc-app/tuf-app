/**
 * THE PANTHER SYSTEM — FUEL Pillar Calculation Engine
 * Clinical Spec: Doc 05 | Build Doc: Doc 06
 * © 2026 TURNED UP FITNESS LLC — CONFIDENTIAL
 *
 * Implements:
 *   - Mifflin-St Jeor RMR
 *   - TDEE with activity multiplier + 40+ age adjustment
 *   - Daily macro targets (protein/carbs/fat/calories)
 *   - Flag evaluation engine (7 flags, priority ordered)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActivityLevel =
  | "sedentary"       // 1.2  — desk job, no exercise
  | "light"           // 1.375 — 1-3 days/week light activity
  | "moderate"        // 1.55  — 3-5 days/week moderate
  | "active"          // 1.725 — 6-7 days/week hard training
  | "very_active";    // 1.9   — twice daily, physical job

export type PrimaryGoal =
  | "fat_loss"
  | "muscle_gain"
  | "maintenance"
  | "performance";

export type DeficitTier =
  | "conservative"    // -275 kcal
  | "moderate"        // -500 kcal
  | "aggressive";     // -875 kcal (system warning generated)

export type ConditionFlag =
  | "diabetes"
  | "hypertension"
  | "joint_inflammation";

export interface UserFuelProfile {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: "male" | "female";
  activityLevel: ActivityLevel;
  primaryGoal: PrimaryGoal;
  deficitTier: DeficitTier;
  isPostMenopausal?: boolean;         // female 40+ only
  conditions: ConditionFlag[];        // can stack
}

export interface FuelTargets {
  calorieTarget: number;
  proteinTargetG: number;
  carbTargetG: number;
  fatTargetG: number;
  rmr: number;
  tdee: number;
  aggressiveWarning?: boolean;        // true if deficitTier === "aggressive"
}

export type FuelFlagCode =
  | "FLAG_DIABETES_CARB_SPIKE"
  | "FLAG_LOW_PROTEIN"
  | "FLAG_MPS_DEFICIT"
  | "FLAG_NO_POST_TRAINING_MEAL"
  | "FLAG_CALORIE_UNDER"
  | "FLAG_CALORIE_OVER"
  | "FLAG_PRE_SLEEP_PROTEIN_MISSING";

export interface FuelFlag {
  code: FuelFlagCode;
  priority: number;         // 1 = highest
  message: string;
}

export interface MealEntry {
  mealType: "meal1" | "meal2" | "pre_training" | "post_training" | "pre_sleep" | "snack";
  timeLogged: string;       // ISO timestamp
  foods: FoodItem[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  mpsTriggered: boolean;    // true if totalProteinG >= 30
  notes?: string;
}

export interface FoodItem {
  name: string;
  servingG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface DailyFuelLog {
  log_id: string;
  user_id: string;
  date: string;             // YYYY-MM-DD
  meals: MealEntry[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  mpsTriggersCount: number;
  trainingLogged: boolean;
  flags: FuelFlagCode[];
  pantherDirective?: string;
}

// ─── Activity Multipliers ─────────────────────────────────────────────────────

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// ─── 1. calculateRMR ─────────────────────────────────────────────────────────
// Mifflin-St Jeor formula (most validated for 40+ adults)

export function calculateRMR(profile: UserFuelProfile): number {
  const { weightKg, heightCm, age, sex } = profile;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

// ─── 2. calculateTDEE ────────────────────────────────────────────────────────
// Activity multiplier + 40+ age adjustment + post-menopausal adjustment

export function calculateTDEE(rmr: number, profile: UserFuelProfile): number {
  const { age, activityLevel, isPostMenopausal } = profile;
  let tdee = rmr * ACTIVITY_MULTIPLIERS[activityLevel];

  // Age adjustments per Doc 05 §5.1
  if (age >= 60) {
    tdee *= 0.92;
  } else if (age >= 50) {
    tdee *= 0.95;
  }

  // Post-menopausal adjustment
  if (isPostMenopausal) {
    tdee *= 0.97;
  }

  return Math.round(tdee);
}

// ─── 3. calculateDailyTargets ────────────────────────────────────────────────
// Returns macro targets based on goal and deficit tier

export function calculateDailyTargets(
  tdee: number,
  profile: UserFuelProfile
): FuelTargets {
  const { weightKg, primaryGoal, deficitTier } = profile;

  // Calorie target
  const deficitMap: Record<DeficitTier, number> = {
    conservative: 275,
    moderate: 500,
    aggressive: 875,
  };
  const calorieTarget = tdee - deficitMap[deficitTier];
  const aggressiveWarning = deficitTier === "aggressive";

  // Protein: per Doc 06 §3.3
  let proteinPerKg: number;
  if (primaryGoal === "fat_loss") {
    proteinPerKg = 2.2;
  } else if (primaryGoal === "muscle_gain") {
    proteinPerKg = 2.0;
  } else {
    proteinPerKg = 1.6;
  }
  const proteinTargetG = Math.round(weightKg * proteinPerKg);

  // Fat: minimum 0.8g/kg — essential for hormonal health in 40+ client
  const fatTargetG = Math.round(Math.max(weightKg * 0.8, 50));

  // Carbs: remaining calories after protein and fat
  const proteinCals = proteinTargetG * 4;
  const fatCals = fatTargetG * 9;
  const carbCals = Math.max(calorieTarget - proteinCals - fatCals, 0);
  const carbTargetG = Math.round(carbCals / 4);

  const rmr = calculateRMR(profile);

  return {
    calorieTarget,
    proteinTargetG,
    carbTargetG,
    fatTargetG,
    rmr,
    tdee,
    aggressiveWarning,
  };
}

// ─── 4. evaluateDailyLog ─────────────────────────────────────────────────────
// Returns flags sorted by priority (1 = most critical)

export function evaluateDailyLog(
  log: DailyFuelLog,
  targets: FuelTargets,
  profile: UserFuelProfile
): FuelFlag[] {
  const flags: FuelFlag[] = [];
  const now = new Date();
  const hour = now.getHours();

  // FLAG_DIABETES_CARB_SPIKE — priority 1
  if (profile.conditions.includes("diabetes")) {
    const hasCarbSpike = log.meals.some((m) => m.totalCarbsG > 60);
    if (hasCarbSpike) {
      flags.push({
        code: "FLAG_DIABETES_CARB_SPIKE",
        priority: 1,
        message:
          "Meal logged with >60g net carbs. Glucose response will be elevated. Pair carbs with protein anchor next meal.",
      });
    }
  }

  // FLAG_LOW_PROTEIN — priority 2
  if (log.totalProteinG < targets.proteinTargetG * 0.85) {
    flags.push({
      code: "FLAG_LOW_PROTEIN",
      priority: 2,
      message: `Protein at ${log.totalProteinG}g — ${Math.round(targets.proteinTargetG - log.totalProteinG)}g short of target. That gap costs you muscle.`,
    });
  }

  // FLAG_MPS_DEFICIT — priority 3
  if (log.mpsTriggersCount < 3) {
    flags.push({
      code: "FLAG_MPS_DEFICIT",
      priority: 3,
      message: `Only ${log.mpsTriggersCount} MPS trigger${log.mpsTriggersCount === 1 ? "" : "s"} today. Muscle protein synthesis requires 3+ meals with ≥30g protein.`,
    });
  }

  // FLAG_NO_POST_TRAINING_MEAL — priority 4
  if (log.trainingLogged) {
    const hasPostTraining = log.meals.some((m) => m.mealType === "post_training");
    if (!hasPostTraining) {
      flags.push({
        code: "FLAG_NO_POST_TRAINING_MEAL",
        priority: 4,
        message:
          "Training logged. No post-training meal recorded. Recovery window is open — close it within 2 hours.",
      });
    }
  }

  // FLAG_CALORIE_UNDER — priority 5
  if (log.totalCalories < targets.calorieTarget * 0.75) {
    flags.push({
      code: "FLAG_CALORIE_UNDER",
      priority: 5,
      message: `Calories at ${log.totalCalories} — ${Math.round(targets.calorieTarget - log.totalCalories)} below target. Undereating suppresses metabolism and accelerates muscle loss.`,
    });
  }

  // FLAG_CALORIE_OVER — priority 6
  if (log.totalCalories > targets.calorieTarget * 1.1) {
    flags.push({
      code: "FLAG_CALORIE_OVER",
      priority: 6,
      message: `Calories at ${log.totalCalories} — ${Math.round(log.totalCalories - targets.calorieTarget)} over target. Deficit breached.`,
    });
  }

  // FLAG_PRE_SLEEP_PROTEIN_MISSING — priority 7 (only after 8pm)
  if (hour >= 20) {
    const hasPreSleep = log.meals.some((m) => m.mealType === "pre_sleep");
    if (!hasPreSleep) {
      flags.push({
        code: "FLAG_PRE_SLEEP_PROTEIN_MISSING",
        priority: 7,
        message:
          "No pre-sleep protein logged. 30-40g casein before bed prevents overnight catabolism.",
      });
    }
  }

  // Sort by priority ascending (1 = most critical first)
  return flags.sort((a, b) => a.priority - b.priority);
}

// ─── 5. buildFuelDirectivePrompt ─────────────────────────────────────────────
// Builds the Claude system prompt for FUEL directive generation

export function buildFuelDirectivePrompt(
  profile: UserFuelProfile,
  topFlag: FuelFlag
): string {
  const conditionStr =
    profile.conditions.length > 0
      ? profile.conditions.join(", ")
      : "none";

  return `You are The Panther System FUEL engine. Client is ${profile.age} years old, goal is ${profile.primaryGoal}, conditions: ${conditionStr}. Today's flag: ${topFlag.code} — ${topFlag.message}

Respond ONLY in this exact format:
HEADLINE: [one sentence, all caps, direct — no encouragement]
BODY: [max 2 sentences, clinical explanation only — no softening]
DIRECTIVE: [one specific action the client takes today]

No greetings. No encouragement. No "great job". Science only. Panther voice.`;
}

// ─── 6. computeMealTotals ────────────────────────────────────────────────────
// Utility: compute totals from a list of food items

export function computeMealTotals(foods: FoodItem[]): {
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  mpsTriggered: boolean;
} {
  const totals = foods.reduce(
    (acc, f) => ({
      totalCalories: acc.totalCalories + f.calories,
      totalProteinG: acc.totalProteinG + f.proteinG,
      totalCarbsG: acc.totalCarbsG + f.carbsG,
      totalFatG: acc.totalFatG + f.fatG,
    }),
    { totalCalories: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0 }
  );
  return {
    ...totals,
    mpsTriggered: totals.totalProteinG >= 30,
  };
}
