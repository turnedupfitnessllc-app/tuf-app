/**
 * PopHIVE Service Layer
 * Abstraction layer for querying PopHIVE MCP health data
 * Provides methods to retrieve prevalence, guidelines, and health metrics
 */

import { execSync } from "child_process";

interface PopHIVEResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

interface PrevalenceData {
  condition: string;
  ageGroup: string;
  year: number;
  prevalenceRate: number;
  patientCount?: number;
}

interface HealthMetrics {
  metric: string;
  value: number;
  unit: string;
  source: string;
}

/**
 * Execute MCP CLI command and parse JSON response
 */
function executeMCPCommand(toolName: string, input: Record<string, unknown>): PopHIVEResponse {
  try {
    const inputJson = JSON.stringify(input);
    const command = `manus-mcp-cli tool call ${toolName} --server pophive --input '${inputJson}'`;

    const result = execSync(command, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    // Parse the result - it may contain both text and JSON
    // Look for JSON in the output
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return { success: true, data: parsed };
      } catch {
        // If JSON parsing fails, return the raw result
        return { success: true, data: result };
      }
    }

    return { success: true, data: result };
  } catch (error) {
    console.error(`PopHIVE MCP Error for ${toolName}:`, error);
    return {
      success: false,
      error: `Failed to query PopHIVE: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Get obesity prevalence data by age group
 */
export async function getObesityPrevalence(
  ageGroup: string,
  year?: number
): Promise<PrevalenceData | null> {
  const input: Record<string, unknown> = {
    dataset: "chronic_obesity",
    age_group: ageGroup,
  };

  if (year) {
    input.year = year;
  }

  const response = executeMCPCommand("filter_data", input);

  if (response.success && response.data) {
    // Extract the first matching record
    const data = response.data as Record<string, unknown>;
    if (typeof data === "object" && data !== null) {
      return {
        condition: "Obesity",
        ageGroup,
        year: year || new Date().getFullYear(),
        prevalenceRate: (data.prevalence_rate as number) || 0,
        patientCount: (data.patient_count as number) || 0,
      };
    }
  }

  return null;
}

/**
 * Get diabetes prevalence data by age group
 */
export async function getDiabetesPrevalence(
  ageGroup: string,
  year?: number
): Promise<PrevalenceData | null> {
  const input: Record<string, unknown> = {
    dataset: "chronic_diabetes",
    age_group: ageGroup,
  };

  if (year) {
    input.year = year;
  }

  const response = executeMCPCommand("filter_data", input);

  if (response.success && response.data) {
    const data = response.data as Record<string, unknown>;
    if (typeof data === "object" && data !== null) {
      return {
        condition: "Diabetes",
        ageGroup,
        year: year || new Date().getFullYear(),
        prevalenceRate: (data.prevalence_rate as number) || 0,
        patientCount: (data.patient_count as number) || 0,
      };
    }
  }

  return null;
}

/**
 * Search for health data by condition or keyword
 */
export async function searchHealthData(query: string, geography?: string): Promise<unknown> {
  const input: Record<string, unknown> = {
    query,
  };

  if (geography) {
    input.geography = geography;
  }

  const response = executeMCPCommand("search_health_data", input);
  return response.data || null;
}

/**
 * Filter health data by various criteria
 */
export async function filterHealthData(
  dataset: string,
  criteria: {
    condition?: string;
    state?: string;
    ageGroup?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<unknown> {
  const input: Record<string, unknown> = {
    dataset,
    ...criteria,
  };

  const response = executeMCPCommand("filter_data", input);
  return response.data || null;
}

/**
 * Compare health metrics across multiple states
 */
export async function compareStates(
  dataset: string,
  states: string[],
  metric: string,
  timePeriod?: string
): Promise<unknown> {
  const input: Record<string, unknown> = {
    dataset,
    states,
    metric,
  };

  if (timePeriod) {
    input.time_period = timePeriod;
  }

  const response = executeMCPCommand("compare_states", input);
  return response.data || null;
}

/**
 * Analyze health trends over time
 */
export async function analyzeTimeSeries(
  dataset: string,
  metric: string,
  geography?: string,
  startDate?: string,
  endDate?: string
): Promise<unknown> {
  const input: Record<string, unknown> = {
    dataset,
    metric,
  };

  if (geography) {
    input.geography = geography;
  }
  if (startDate) {
    input.start_date = startDate;
  }
  if (endDate) {
    input.end_date = endDate;
  }

  const response = executeMCPCommand("time_series_analysis", input);
  return response.data || null;
}

/**
 * Get all available PopHIVE datasets
 */
export async function getAvailableDatasets(includeSample: boolean = false): Promise<unknown> {
  const input: Record<string, unknown> = {
    include_sample: includeSample,
  };

  const response = executeMCPCommand("get_available_datasets", input);
  return response.data || null;
}

/**
 * Get prevalence data for common 40+ health conditions
 */
export async function getConditionPrevalence(
  condition: string,
  ageGroup: string
): Promise<PrevalenceData | null> {
  const normalizedCondition = condition.toLowerCase().trim();

  switch (normalizedCondition) {
    case "obesity":
    case "overweight":
      return getObesityPrevalence(ageGroup);

    case "diabetes":
    case "type 2 diabetes":
      return getDiabetesPrevalence(ageGroup);

    default:
      // For other conditions, try generic search
      const searchResult = await searchHealthData(condition, undefined);
      if (searchResult) {
        return {
          condition,
          ageGroup,
          year: new Date().getFullYear(),
          prevalenceRate: 0, // Will be populated from search result
        };
      }
      return null;
  }
}

/**
 * Get health insights for a user profile
 */
export async function getUserHealthInsights(userProfile: {
  age: number;
  gender?: string;
  healthConditions?: string[];
  location?: string;
}): Promise<Record<string, unknown>> {
  const insights: Record<string, unknown> = {
    age: userProfile.age,
    ageGroup: getAgeGroup(userProfile.age),
    conditions: userProfile.healthConditions || [],
    insights: [],
  };

  // Get prevalence data for each condition
  if (userProfile.healthConditions && userProfile.healthConditions.length > 0) {
    const ageGroup = getAgeGroup(userProfile.age);
    const conditionInsights = [];

    for (const condition of userProfile.healthConditions) {
      const prevalence = await getConditionPrevalence(condition, ageGroup);
      if (prevalence) {
        conditionInsights.push(prevalence);
      }
    }

    (insights.insights as unknown[]) = conditionInsights;
  }

  return insights;
}

/**
 * Helper: Convert age to age group string
 */
function getAgeGroup(age: number): string {
  if (age < 18) return "0-17";
  if (age < 35) return "18-34";
  if (age < 50) return "35-49";
  if (age < 65) return "50-64";
  if (age < 80) return "65-79";
  return "80+";
}

/**
 * Get sarcopenia risk context for age group
 */
export async function getSarcopeniaContext(age: number): Promise<Record<string, unknown>> {
  const ageGroup = getAgeGroup(age);

  return {
    age,
    ageGroup,
    riskLevel: age >= 60 ? "high" : age >= 50 ? "moderate" : "low",
    context: {
      description: `Sarcopenia (age-related muscle loss) affects approximately 10% of adults 60+, increasing to 30% by age 80.`,
      prevalenceInAgeGroup: age >= 60 ? "10-30%" : age >= 50 ? "5-10%" : "< 5%",
      preventionBenefit: "Regular strength training can reduce sarcopenia risk by 40-50%",
      proteinNeed: `${Math.round(age >= 65 ? 1.2 : 1.0)} g/kg body weight daily`,
    },
  };
}

/**
 * Get exercise modification recommendations based on health condition
 */
export async function getExerciseModifications(
  condition: string,
  ageGroup: string
): Promise<Record<string, unknown>> {
  const normalizedCondition = condition.toLowerCase().trim();

  // Return evidence-based modifications for common conditions
  const modifications: Record<string, Record<string, unknown>> = {
    arthritis: {
      condition: "Arthritis",
      frequency: "3-5 days/week",
      intensity: "Low to moderate",
      duration: "30 minutes",
      bestTypes: ["Water aerobics", "Tai Chi", "Resistance training", "Swimming"],
      avoid: ["High-impact activities", "Heavy lifting", "Repetitive stress"],
      benefits: {
        painReduction: "30-40% with regular exercise",
        mobilityImprovement: "25% with resistance training",
        qualityOfLife: "Significant improvement",
      },
    },
    diabetes: {
      condition: "Type 2 Diabetes",
      frequency: "150 minutes moderate/week or 75 minutes vigorous/week",
      intensity: "Moderate to vigorous",
      duration: "30-45 minutes",
      bestTypes: ["Brisk walking", "Cycling", "Swimming", "Resistance training"],
      timing: "Exercise 1-2 hours after meals for blood sugar control",
      benefits: {
        bloodSugarControl: "10-20% improvement in HbA1c",
        insulinSensitivity: "Improved insulin response",
        cardiovascularHealth: "Reduced heart disease risk",
      },
    },
    hypertension: {
      condition: "Hypertension",
      frequency: "150 minutes moderate/week",
      intensity: "Moderate",
      duration: "30 minutes",
      bestTypes: ["Brisk walking", "Jogging", "Cycling", "Swimming"],
      avoid: ["Heavy isometric exercises", "Breath holding"],
      benefits: {
        bpReduction: "5-8 mmHg reduction with moderate cardio",
        medicationReduction: "May reduce medication needs",
        longTermOutcome: "Reduced stroke and heart attack risk",
      },
    },
    osteoporosis: {
      condition: "Osteoporosis",
      frequency: "3-4 days/week",
      intensity: "Moderate to high",
      duration: "30-45 minutes",
      bestTypes: ["Weight-bearing exercises", "Resistance training", "Balance work"],
      avoid: ["High-impact if severe", "Spinal flexion"],
      benefits: {
        boneDensity: "Increased bone mineral density",
        fallPrevention: "40% reduction in fall risk",
        fracturePrevention: "Reduced fracture risk",
      },
    },
  };

  return (
    modifications[normalizedCondition] || {
      condition,
      note: "Consult with healthcare provider for specific modifications",
      generalRecommendation: "150 minutes moderate activity per week",
    }
  );
}

/**
 * Get nutrition recommendations for health condition
 */
export async function getNutritionRecommendations(
  condition: string,
  ageGroup: string
): Promise<Record<string, unknown>> {
  const normalizedCondition = condition.toLowerCase().trim();

  const recommendations: Record<string, Record<string, unknown>> = {
    diabetes: {
      condition: "Type 2 Diabetes",
      protein: "1.2-1.6 g/kg body weight",
      carbohydrates: "Low glycemic index foods",
      fiber: "25-30g daily",
      keyNutrients: ["Chromium", "Magnesium", "Zinc"],
      antiInflammatoryFoods: ["Fatty fish", "Berries", "Leafy greens", "Nuts"],
      avoidFoods: ["Refined carbs", "Sugary drinks", "Processed foods"],
    },
    arthritis: {
      condition: "Arthritis",
      protein: "1.0-1.2 g/kg body weight",
      keyNutrients: ["Omega-3 fatty acids", "Vitamin D", "Calcium"],
      antiInflammatoryFoods: ["Fatty fish", "Berries", "Leafy greens", "Turmeric", "Ginger"],
      avoidFoods: ["Processed foods", "Trans fats", "Excess sugar"],
      supplements: ["Fish oil", "Vitamin D", "Glucosamine (if tolerated)"],
    },
    osteoporosis: {
      condition: "Osteoporosis",
      calcium: "1200-1500 mg daily",
      vitaminD: "800-1000 IU daily (or 20-25 mcg)",
      protein: "1.0-1.2 g/kg body weight",
      keyNutrients: ["Calcium", "Vitamin D", "Magnesium", "Vitamin K"],
      calciumRichFoods: ["Dairy", "Leafy greens", "Fortified foods", "Almonds"],
      avoidFoods: ["Excess caffeine", "Excess salt", "Alcohol"],
    },
  };

  return (
    recommendations[normalizedCondition] || {
      condition,
      protein: "0.8-1.0 g/kg body weight",
      note: "Consult with registered dietitian for personalized recommendations",
    }
  );
}

export default {
  getObesityPrevalence,
  getDiabetesPrevalence,
  searchHealthData,
  filterHealthData,
  compareStates,
  analyzeTimeSeries,
  getAvailableDatasets,
  getConditionPrevalence,
  getUserHealthInsights,
  getSarcopeniaContext,
  getExerciseModifications,
  getNutritionRecommendations,
};
