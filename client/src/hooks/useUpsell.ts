/**
 * useUpsell — Tier-aware upsell trigger hook
 * Fires the right upsell modal at the right time:
 *   Free user completes 3 workouts → show $19 Starter upgrade
 *   Starter user completes 14 workouts → show $79 Advanced upgrade
 *   Advanced user active 30+ days → show $20/mo Membership
 */
import { useState, useEffect } from "react";

export type UpsellTier = "starter" | "advanced" | "member" | null;

export interface UpsellState {
  shouldShow: boolean;
  tier: UpsellTier;
  dismiss: () => void;
}

const DISMISS_KEY = (tier: string) => `tuf_upsell_dismissed_${tier}`;
const DISMISS_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export function useUpsell(): UpsellState {
  const [activeTier, setActiveTier] = useState<UpsellTier>(null);

  useEffect(() => {
    const raw = localStorage.getItem("tuf_profile");
    if (!raw) return;
    const profile = JSON.parse(raw);
    const tier = localStorage.getItem("tuf_tier") || "free";
    const workouts = profile.workoutsCompleted || 0;
    const joinDate = profile.joinDate || Date.now();
    const daysActive = Math.floor((Date.now() - joinDate) / (1000 * 60 * 60 * 24));

    let target: UpsellTier = null;

    if (tier === "free" && workouts >= 3) {
      target = "starter";
    } else if (tier === "starter" && workouts >= 14) {
      target = "advanced";
    } else if (tier === "advanced" && daysActive >= 30) {
      target = "member";
    }

    if (!target) return;

    // Check if dismissed recently
    const dismissedAt = parseInt(localStorage.getItem(DISMISS_KEY(target)) || "0");
    if (Date.now() - dismissedAt < DISMISS_DURATION_MS) return;

    setActiveTier(target);
  }, []);

  const dismiss = () => {
    if (activeTier) {
      localStorage.setItem(DISMISS_KEY(activeTier), Date.now().toString());
    }
    setActiveTier(null);
  };

  return {
    shouldShow: activeTier !== null,
    tier: activeTier,
    dismiss,
  };
}
