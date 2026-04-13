/**
 * THE PANTHER SYSTEM — MINDSET Pillar
 * Phase Configuration (Static Data)
 * Doc 08 — MINDSET Pillar Build Doc, Section 2.3
 * © 2026 TURNED UP FITNESS LLC — CONFIDENTIAL
 */

export interface PhaseConfig {
  phase: number;
  days: [number, number]; // [start, end] inclusive
  theme: string;
  identityStatement: string;
  moveAnchor: string;
  fuelAnchor: string;
  color: string;
  socialCardTag: string;
}

export const PHASE_CONFIGS: PhaseConfig[] = [
  {
    phase: 1,
    days: [1, 7],
    theme: "Control > Chaos",
    identityStatement: "You are someone who shows up when it's inconvenient.",
    moveAnchor: "One structured workout — any intensity",
    fuelAnchor: "One meal with 35g+ protein",
    color: "#FF4500",
    socialCardTag: "control-chaos",
  },
  {
    phase: 2,
    days: [8, 14],
    theme: "Patience",
    identityStatement: "You are someone who trusts the process when results aren't visible yet.",
    moveAnchor: "Progressive overload — add 1 rep or 1 lb",
    fuelAnchor: "All 3 MPS triggers hit",
    color: "#C8973A",
    socialCardTag: "patience",
  },
  {
    phase: 3,
    days: [15, 20],
    theme: "Precision > Speed",
    identityStatement: "You are someone who values quality of movement over ego.",
    moveAnchor: "Tempo training — eccentric focus",
    fuelAnchor: "Macros within 10% of targets",
    color: "#4a9eff",
    socialCardTag: "precision-speed",
  },
  {
    phase: 4,
    days: [21, 25],
    theme: "Every Rep Has Intention",
    identityStatement: "You are someone who is present in every single rep.",
    moveAnchor: "Mind-muscle connection — log target muscle",
    fuelAnchor: "Pre-plan next day meals tonight",
    color: "#8b5cf6",
    socialCardTag: "every-rep",
  },
  {
    phase: 5,
    days: [26, 28],
    theme: "Power When It Counts",
    identityStatement: "You are someone who delivers when it matters most.",
    moveAnchor: "Peak set — max effort compound lift",
    fuelAnchor: "Carb timing around training window",
    color: "#22c55e",
    socialCardTag: "power-counts",
  },
  {
    phase: 6,
    days: [29, 30],
    theme: "Become Dangerous",
    identityStatement: "You are someone who finished what they started. That is rare.",
    moveAnchor: "Repeat Day 1 benchmark workout",
    fuelAnchor: "30-day nutrition summary review",
    color: "#FF4500",
    socialCardTag: "become-dangerous",
  },
];

export function getCurrentPhase(day: number): PhaseConfig {
  const cfg = PHASE_CONFIGS.find(p => day >= p.days[0] && day <= p.days[1]);
  return cfg ?? PHASE_CONFIGS[PHASE_CONFIGS.length - 1];
}

export function getDaysRemainingInPhase(day: number): number {
  const phase = getCurrentPhase(day);
  return phase.days[1] - day;
}
