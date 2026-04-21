/**
 * PaywallGate — tier-based feature gating component
 *
 * Usage:
 *   <PaywallGate requiredTier="elite" feature="Biomechanical Overlay">
 *     <BioOverlayContent />
 *   </PaywallGate>
 *
 * Tiers in ascending order: free → core → elite → pro
 */
import { useLocation } from "wouter";

type Tier = "free" | "core" | "elite" | "pro";

const TIER_ORDER: Tier[] = ["free", "core", "elite", "pro"];

const TIER_COLORS: Record<Tier, string> = {
  free:  "#A0A0A0",
  core:  "#4a9eff",
  elite: "#FF6600",
  pro:   "#C8973A",
};

const TIER_PRICES: Record<Tier, string> = {
  free:  "Free",
  core:  "$19.99/mo",
  elite: "$39.99/mo",
  pro:   "$79.99/mo",
};

function getCurrentTier(): Tier {
  // Dev mode bypass — unlock all pages for testing
  if (localStorage.getItem("tuf_dev_mode") === "true") return "pro";
  return (localStorage.getItem("tuf_tier") as Tier) || "free";
}

function hasAccess(current: Tier, required: Tier): boolean {
  return TIER_ORDER.indexOf(current) >= TIER_ORDER.indexOf(required);
}

interface PaywallGateProps {
  requiredTier: Tier;
  feature: string;
  description?: string;
  children: React.ReactNode;
  /** If true, renders a compact inline lock badge instead of full-screen gate */
  inline?: boolean;
}

export function PaywallGate({
  requiredTier,
  feature,
  description,
  children,
  inline = false,
}: PaywallGateProps) {
  const [, navigate] = useLocation();
  const currentTier = getCurrentTier();
  const allowed = hasAccess(currentTier, requiredTier);

  if (allowed) return <>{children}</>;

  const color = TIER_COLORS[requiredTier];
  const price = TIER_PRICES[requiredTier];

  // ── Inline lock badge (for partial feature gating inside a screen) ──────────
  if (inline) {
    return (
      <div
        className="relative rounded-xl overflow-hidden"
        style={{ border: `1px solid ${color}40` }}
      >
        {/* Blurred preview */}
        <div className="pointer-events-none select-none" style={{ filter: "blur(4px)", opacity: 0.3 }}>
          {children}
        </div>
        {/* Lock overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4"
          style={{ background: "rgba(8,8,8,0.85)" }}
        >
          <div className="text-2xl">🔒</div>
          <div
            className="text-xs font-black tracking-widest text-center"
            style={{ color }}
          >
            {requiredTier.toUpperCase()} REQUIRED
          </div>
          <button
            onClick={() => navigate("/pricing")}
            className="px-4 py-1.5 rounded-full text-xs font-black tracking-wider text-white mt-1"
            style={{ background: color }}
          >
            UPGRADE TO {requiredTier.toUpperCase()} →
          </button>
        </div>
      </div>
    );
  }

  // ── Full-screen gate ─────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center pb-24"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Panther icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
          border: `2px solid ${color}40`,
          fontSize: "2.5rem",
        }}
      >
        🐆
      </div>

      {/* Tier badge */}
      <div
        className="text-xs font-black tracking-[0.3em] px-3 py-1 rounded-full mb-4"
        style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
      >
        {requiredTier.toUpperCase()} PLAN
      </div>

      {/* Headline */}
      <h2
        className="text-2xl font-black text-white mb-2"
        style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}
      >
        {feature.toUpperCase()} IS LOCKED
      </h2>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-2 max-w-xs leading-relaxed">
        {description ||
          `Unlock ${feature} and more with the ${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} plan.`}
      </p>

      {/* Price */}
      <div className="text-lg font-black mb-8" style={{ color }}>
        {price}
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate("/pricing")}
        className="w-full max-w-xs py-4 rounded-2xl font-black text-sm tracking-widest text-white mb-4"
        style={{
          background: color,
          boxShadow: `0 8px 32px ${color}40`,
        }}
      >
        UPGRADE TO {requiredTier.toUpperCase()} →
      </button>

      {/* Back link */}
      <button
        onClick={() => navigate(-1 as any)}
        className="text-xs text-muted-foreground underline underline-offset-4"
      >
        Go back
      </button>
    </div>
  );
}

// ── Convenience hook ──────────────────────────────────────────────────────────

export function useTier() {
  const tier = getCurrentTier();
  return {
    tier,
    isFree:  tier === "free",
    isCore:  TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf("core"),
    isElite: TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf("elite"),
    isPro:   TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf("pro"),
    hasAccess: (required: Tier) => hasAccess(tier, required),
  };
}
