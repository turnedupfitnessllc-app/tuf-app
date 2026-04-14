/**
 * useSubscription — Doc 16 §7
 * Reads the current subscription tier from localStorage.
 * Listens for storage events so the UI reacts immediately after
 * a Stripe webhook updates the tier (via useTierSync).
 *
 * Tier hierarchy:
 *   free < core (cub/stealth) < elite (controlled) < pro (apex)
 *
 * Raw tier names (from DB):  free | cub | stealth | controlled | apex
 * Gate tier names (PaywallGate): free | core | elite | pro
 */
import { useState, useEffect } from "react";

export type TierRaw = "free" | "cub" | "stealth" | "controlled" | "apex";
export type TierGate = "free" | "core" | "elite" | "pro";

export interface SubscriptionState {
  /** Raw tier from DB (e.g. "controlled") */
  tierRaw: TierRaw;
  /** Gate tier for PaywallGate checks (e.g. "elite") */
  tier: TierGate;
  /** True if user has any paid plan */
  isSubscribed: boolean;
  /** True if user has core or higher */
  hasCore: boolean;
  /** True if user has elite or higher */
  hasElite: boolean;
  /** True if user has pro */
  hasPro: boolean;
}

const TIER_MAP: Record<string, TierGate> = {
  free: "free",
  cub: "core",
  stealth: "core",
  controlled: "elite",
  apex: "pro",
};

const TIER_ORDER: Record<TierGate, number> = {
  free: 0, core: 1, elite: 2, pro: 3,
};

function readTierState(): SubscriptionState {
  const raw = (localStorage.getItem("tuf_tier_raw") || "free") as TierRaw;
  const gate = (localStorage.getItem("tuf_tier") || TIER_MAP[raw] || "free") as TierGate;
  const order = TIER_ORDER[gate] ?? 0;
  return {
    tierRaw: raw,
    tier: gate,
    isSubscribed: order > 0,
    hasCore: order >= 1,
    hasElite: order >= 2,
    hasPro: order >= 3,
  };
}

export function useSubscription(): SubscriptionState {
  const [state, setState] = useState<SubscriptionState>(readTierState);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "tuf_tier" || e.key === "tuf_tier_raw") {
        setState(readTierState());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return state;
}
