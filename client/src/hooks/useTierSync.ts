/**
 * useTierSync — syncs the server-side subscription tier to localStorage on mount.
 *
 * This ensures PaywallGate (which reads localStorage) always reflects the
 * authoritative tier stored in the DB after a Stripe webhook event.
 *
 * Call once in App.tsx (or a top-level layout component).
 */
import { useEffect } from "react";

// Maps DB tier names → PaywallGate tier names
const TIER_MAP: Record<string, string> = {
  free:       "free",
  cub:        "core",
  stealth:    "core",
  controlled: "elite",
  apex:       "pro",
};

export function useTierSync() {
  useEffect(() => {
    const userId = localStorage.getItem("tuf_user_id");
    if (!userId) return;

    // Fetch authoritative tier from server (non-blocking)
    fetch(`/api/stripe/subscription/${userId}`)
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data: { tier?: string; status?: string } | null) => {
        if (!data) return;
        const serverTier = data.tier || "free";
        const gateTier = TIER_MAP[serverTier] ?? "free";
        // Only update if changed to avoid unnecessary re-renders
        const current = localStorage.getItem("tuf_tier");
        if (current !== gateTier) {
          localStorage.setItem("tuf_tier", gateTier);
          localStorage.setItem("tuf_tier_raw", serverTier);
          // Dispatch storage event so any listening components can react
          window.dispatchEvent(new StorageEvent("storage", {
            key: "tuf_tier",
            newValue: gateTier,
            oldValue: current,
          }));
        }
      })
      .catch(() => {
        // Silently fail — don't downgrade the user on network errors
      });
  }, []); // Run once on mount
}
