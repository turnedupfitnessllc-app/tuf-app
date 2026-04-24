/**
 * useUnitPreference — React hook for TUF unit system preference.
 *
 * Reads the user's imperial/metric preference from localStorage
 * (set in Profile.tsx) and re-exports all unit helpers pre-bound
 * to that preference so pages don't need to pass it manually.
 *
 * Usage:
 *   const { system, formatWeight, formatHeight, formatFoodWeight, toggleSystem } = useUnitPreference();
 *   <span>{formatWeight(user.weightKg)}</span>   // "198.4 lbs" or "90.0 kg"
 *   <span>{formatHeight(user.heightCm)}</span>   // "5'11\"" or "180 cm"
 */

import { useState, useCallback } from "react";
import {
  kgToLbs, lbsToKg,
  cmToInches, inchesToCm, cmToFtIn, ftInToCm,
  gToOz, ozToG,
  formatWeight as _formatWeight,
  formatHeight as _formatHeight,
  formatFoodWeight as _formatFoodWeight,
  formatFoodWeightDual,
  parseWeightInput,
  parseHeightInput,
  type UnitSystem,
} from "../../../shared/units.js";

const STORAGE_KEY = "tuf_unit_preference";

function getStoredSystem(): UnitSystem {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "metric" || stored === "imperial") return stored;
  } catch {}
  return "imperial";
}

export function useUnitPreference() {
  const [system, setSystem] = useState<UnitSystem>(getStoredSystem);

  const toggleSystem = useCallback(() => {
    setSystem((prev) => {
      const next: UnitSystem = prev === "imperial" ? "metric" : "imperial";
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      return next;
    });
  }, []);

  const setSystemExplicit = useCallback((s: UnitSystem) => {
    setSystem(s);
    try { localStorage.setItem(STORAGE_KEY, s); } catch {}
  }, []);

  // ── Bound helpers ──────────────────────────────────────────────────────────

  /** Format a weight stored in kg for display. Returns "198.4 lbs" or "90.0 kg" */
  const formatWeight = useCallback(
    (kg: number, decimals = 1) => _formatWeight(kg, system, decimals),
    [system]
  );

  /** Format a height stored in cm for display. Returns "5'11\"" or "180 cm" */
  const formatHeight = useCallback(
    (cm: number) => _formatHeight(cm, system),
    [system]
  );

  /** Format a food weight stored in grams for display. Returns "4.0 oz" or "113 g" */
  const formatFoodWeight = useCallback(
    (g: number) => _formatFoodWeight(g, system),
    [system]
  );

  /** Format a body measurement stored in cm. Returns "14.2 in" or "36.1 cm" */
  const formatMeasurement = useCallback(
    (cm: number) => {
      if (system === "imperial") return `${cmToInches(cm).toFixed(1)} in`;
      return `${cm.toFixed(1)} cm`;
    },
    [system]
  );

  /** Unit label for weight inputs */
  const weightUnit = system === "imperial" ? "lbs" : "kg";

  /** Unit label for height inputs */
  const heightUnit = system === "imperial" ? "in" : "cm";

  /** Unit label for body measurements */
  const measureUnit = system === "imperial" ? "in" : "cm";

  /** Unit label for food weight */
  const foodWeightUnit = system === "imperial" ? "oz" : "g";

  /**
   * Convert a display value back to kg for storage.
   * Accepts "185 lbs", "84 kg", "84", etc.
   */
  const toStorageWeight = useCallback(
    (displayValue: string | number): number => {
      if (typeof displayValue === "number") {
        return system === "imperial" ? lbsToKg(displayValue) : displayValue;
      }
      return parseWeightInput(displayValue, system);
    },
    [system]
  );

  /**
   * Convert a display height value back to cm for storage.
   * Accepts "5'11\"", "71 in", "180 cm", "180", etc.
   */
  const toStorageHeight = useCallback(
    (displayValue: string | number): number => {
      if (typeof displayValue === "number") {
        return system === "imperial" ? inchesToCm(displayValue) : displayValue;
      }
      return parseHeightInput(displayValue, system);
    },
    [system]
  );

  /**
   * Convert a display measurement (in or cm) back to cm for storage.
   */
  const toStorageMeasurement = useCallback(
    (displayValue: number): number => {
      return system === "imperial" ? inchesToCm(displayValue) : displayValue;
    },
    [system]
  );

  /**
   * Convert a stored kg value to the display unit number (not formatted string).
   * Useful for pre-filling input fields.
   */
  const toDisplayWeight = useCallback(
    (kg: number): number => {
      return system === "imperial" ? Math.round(kgToLbs(kg) * 10) / 10 : Math.round(kg * 10) / 10;
    },
    [system]
  );

  /**
   * Convert a stored cm value to the display unit number.
   * For imperial, returns total inches (not ft+in).
   */
  const toDisplayHeight = useCallback(
    (cm: number): number => {
      return system === "imperial" ? Math.round(cmToInches(cm) * 10) / 10 : Math.round(cm * 10) / 10;
    },
    [system]
  );

  /**
   * Convert a stored cm measurement to display unit number.
   */
  const toDisplayMeasurement = useCallback(
    (cm: number): number => {
      return system === "imperial" ? Math.round(cmToInches(cm) * 10) / 10 : Math.round(cm * 10) / 10;
    },
    [system]
  );

  return {
    system,
    isImperial: system === "imperial",
    isMetric: system === "metric",
    toggleSystem,
    setSystem: setSystemExplicit,

    // Formatters (return display strings)
    formatWeight,
    formatHeight,
    formatFoodWeight,
    formatFoodWeightDual,
    formatMeasurement,

    // Unit labels for input fields
    weightUnit,
    heightUnit,
    measureUnit,
    foodWeightUnit,

    // Converters: display → storage (canonical metric)
    toStorageWeight,
    toStorageHeight,
    toStorageMeasurement,

    // Converters: storage → display number (for pre-filling inputs)
    toDisplayWeight,
    toDisplayHeight,
    toDisplayMeasurement,

    // Raw conversion functions (if needed)
    kgToLbs, lbsToKg,
    cmToInches, inchesToCm, cmToFtIn, ftInToCm,
    gToOz, ozToG,
  };
}
