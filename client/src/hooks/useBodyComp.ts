// useBodyComp.ts — Body composition tracking with localStorage persistence
import { useState, useCallback } from "react";

export interface BodyMeasurements {
  // Core metrics
  weight: number; // lbs
  height: number; // inches
  age: number;
  gender: "male" | "female";

  // Circumference measurements (inches)
  neck: number;
  chest: number;
  waist: number;
  hips: number;
  bicepRight: number;
  bicepLeft: number;
  thighRight: number;
  thighLeft: number;
  calfRight: number;
  calfLeft: number;
  wrist: number;

  // Calculated (stored for history)
  bmi: number;
  bodyFatPercent: number;
  leanMassLbs: number;
  fatMassLbs: number;

  // Meta
  date: string; // ISO string
  notes?: string;
}

export interface BodyCompHistory {
  entries: BodyMeasurements[];
}

const STORAGE_KEY = "tuf_body_comp";

// ─── Calculations ──────────────────────────────────────────────────────────

/**
 * BMI = (weight in lbs × 703) / (height in inches²)
 */
export function calculateBMI(weightLbs: number, heightIn: number): number {
  if (!weightLbs || !heightIn) return 0;
  return Math.round(((weightLbs * 703) / (heightIn * heightIn)) * 10) / 10;
}

/**
 * BMI category label
 */
export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "#60a5fa" };
  if (bmi < 25) return { label: "Healthy", color: "#34d399" };
  if (bmi < 30) return { label: "Overweight", color: "#fbbf24" };
  return { label: "Obese", color: "#f87171" };
}

/**
 * U.S. Navy Circumference Method for body fat %
 * Male:   %BF = 86.010 × log10(abdomen - neck) - 70.041 × log10(height) + 36.76
 * Female: %BF = 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387
 */
export function calculateBodyFatNavy(
  gender: "male" | "female",
  heightIn: number,
  waistIn: number,
  neckIn: number,
  hipsIn?: number
): number {
  if (!heightIn || !waistIn || !neckIn) return 0;

  let bf: number;
  if (gender === "male") {
    bf =
      86.01 * Math.log10(waistIn - neckIn) -
      70.041 * Math.log10(heightIn) +
      36.76;
  } else {
    if (!hipsIn) return 0;
    bf =
      163.205 * Math.log10(waistIn + hipsIn - neckIn) -
      97.684 * Math.log10(heightIn) -
      78.387;
  }

  return Math.max(3, Math.min(50, Math.round(bf * 10) / 10));
}

/**
 * Body fat category
 */
export function getBodyFatCategory(
  bf: number,
  gender: "male" | "female"
): { label: string; color: string } {
  if (gender === "male") {
    if (bf < 6) return { label: "Essential Fat", color: "#60a5fa" };
    if (bf < 14) return { label: "Athletic", color: "#34d399" };
    if (bf < 18) return { label: "Fitness", color: "#86efac" };
    if (bf < 25) return { label: "Average", color: "#fbbf24" };
    return { label: "Obese", color: "#f87171" };
  } else {
    if (bf < 14) return { label: "Essential Fat", color: "#60a5fa" };
    if (bf < 21) return { label: "Athletic", color: "#34d399" };
    if (bf < 25) return { label: "Fitness", color: "#86efac" };
    if (bf < 32) return { label: "Average", color: "#fbbf24" };
    return { label: "Obese", color: "#f87171" };
  }
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useBodyComp() {
  const [history, setHistory] = useState<BodyCompHistory>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { entries: [] };
    } catch {
      return { entries: [] };
    }
  });

  const saveEntry = useCallback(
    (
      raw: Omit<
        BodyMeasurements,
        "bmi" | "bodyFatPercent" | "leanMassLbs" | "fatMassLbs" | "date"
      >
    ) => {
      const bmi = calculateBMI(raw.weight, raw.height);
      const bodyFatPercent = calculateBodyFatNavy(
        raw.gender,
        raw.height,
        raw.waist,
        raw.neck,
        raw.hips
      );
      const fatMassLbs = Math.round(raw.weight * (bodyFatPercent / 100) * 10) / 10;
      const leanMassLbs = Math.round((raw.weight - fatMassLbs) * 10) / 10;

      const entry: BodyMeasurements = {
        ...raw,
        bmi,
        bodyFatPercent,
        leanMassLbs,
        fatMassLbs,
        date: new Date().toISOString(),
      };

      const updated: BodyCompHistory = {
        entries: [entry, ...history.entries].slice(0, 20), // keep last 20
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setHistory(updated);
      return entry;
    },
    [history]
  );

  const latestEntry = history.entries[0] ?? null;
  const previousEntry = history.entries[1] ?? null;

  const getDelta = (
    field: keyof Pick<
      BodyMeasurements,
      "weight" | "bmi" | "bodyFatPercent" | "leanMassLbs" | "fatMassLbs" | "waist" | "hips"
    >
  ) => {
    if (!latestEntry || !previousEntry) return null;
    const delta = (latestEntry[field] as number) - (previousEntry[field] as number);
    return Math.round(delta * 10) / 10;
  };

  return {
    history,
    latestEntry,
    previousEntry,
    saveEntry,
    getDelta,
    hasData: history.entries.length > 0,
  };
}
