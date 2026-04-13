/**
 * TUF Pricing Screen — v1.0
 * 4 subscription tiers + 4 add-ons
 * Stripe-ready: swap STRIPE_PRICE_IDs when keys are added
 */
import { useState } from "react";
import { useLocation } from "wouter";

// ─── Tier definitions ──────────────────────────────────────────────────────────

interface Tier {
  id: "free" | "core" | "elite" | "pro";
  name: string;
  price: number;
  interval: string;
  tagline: string;
  color: string;
  glow: string;
  badge?: string;
  stripePriceId: string; // fill in when Stripe keys are added
  features: string[];
  locked: string[];
}

const TIERS: Tier[] = [
  {
    id: "free",
    name: "FREE",
    price: 0,
    interval: "forever",
    tagline: "Start your movement journey",
    color: "#A0A0A0",
    glow: "rgba(160,160,160,0.15)",
    stripePriceId: "", // no charge
    features: [
      "Pain assessment (3 regions)",
      "Week 1 corrective program",
      "Basic Panther Brain (5 msgs/day)",
      "Body composition tracker",
      "Movement streak tracking",
    ],
    locked: [
      "Full 4-week corrective program",
      "Biomechanical Overlay (BOA)",
      "Unlimited Panther Brain AI",
      "Live coaching camera",
      "Custom programs",
    ],
  },
  {
    id: "core",
    name: "CORE",
    price: 19.99,
    interval: "month",
    tagline: "Build your corrective foundation",
    color: "#4a9eff",
    glow: "rgba(74,158,255,0.2)",
    stripePriceId: "price_core_monthly", // replace with real Stripe price ID
    features: [
      "Everything in Free",
      "Full 4-week corrective program",
      "All 8 pain assessment regions",
      "50 Panther Brain messages/day",
      "Progress tracking & history",
      "Exercise library (50+ movements)",
    ],
    locked: [
      "Biomechanical Overlay (BOA)",
      "Live coaching camera",
      "Custom program builder",
      "Priority AI responses",
    ],
  },
  {
    id: "elite",
    name: "ELITE",
    price: 39.99,
    interval: "month",
    tagline: "Train with precision AI coaching",
    color: "#FF4500",
    glow: "rgba(255,69,0,0.25)",
    badge: "MOST POPULAR",
    stripePriceId: "price_elite_monthly", // replace with real Stripe price ID
    features: [
      "Everything in Core",
      "Biomechanical Overlay (BOA)",
      "5 scan modes (Posture/Squat/Hinge/Push/Lunge)",
      "Unlimited Panther Brain AI",
      "Live coaching camera feed",
      "NASM corrective link-outs",
      "Movement score tracking",
    ],
    locked: [
      "Custom program builder",
      "1-on-1 Panther coaching sessions",
    ],
  },
  {
    id: "pro",
    name: "PRO",
    price: 79.99,
    interval: "month",
    tagline: "The full Panther experience",
    color: "#C8973A",
    glow: "rgba(200,151,58,0.25)",
    badge: "APEX",
    stripePriceId: "price_pro_monthly", // replace with real Stripe price ID
    features: [
      "Everything in Elite",
      "Custom program builder",
      "1-on-1 Panther AI coaching sessions",
      "Priority AI (fastest responses)",
      "Early access to new features",
      "TUF community access",
      "Monthly progress report PDF",
      "Cancel anytime",
    ],
    locked: [],
  },
];

// ─── Add-on definitions ────────────────────────────────────────────────────────

interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  stripePriceId: string;
  requiresTier: Tier["id"];
}

const ADD_ONS: AddOn[] = [
  {
    id: "nutrition",
    name: "FUEL PACK",
    price: 9.99,
    description: "TUF recipe book, shopping lists, and restaurant guide",
    icon: "🥗",
    stripePriceId: "price_addon_nutrition",
    requiresTier: "free",
  },
  {
    id: "vault",
    name: "VAULT ACCESS",
    price: 14.99,
    description: "Full TUF program library — Maximum Overdrive, Ass-Assassination, and more",
    icon: "🗄️",
    stripePriceId: "price_addon_vault",
    requiresTier: "core",
  },
  {
    id: "voice",
    name: "PANTHER VOICE",
    price: 7.99,
    description: "Panther Brain speaks — AI voice coaching during workouts",
    icon: "🎙️",
    stripePriceId: "price_addon_voice",
    requiresTier: "core",
  },
  {
    id: "kling",
    name: "MOTION COACHING",
    price: 19.99,
    description: "AI-generated movement demonstrations tailored to your form faults",
    icon: "🎬",
    stripePriceId: "price_addon_kling",
    requiresTier: "elite",
  },
];

// ─── Current tier (from localStorage — will be DB-backed when Stripe is live) ──

function getCurrentTier(): Tier["id"] {
  return (localStorage.getItem("tuf_tier") as Tier["id"]) || "free";
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Pricing() {
  const [, navigate] = useLocation();
  const [selectedTier, setSelectedTier] = useState<Tier["id"]>(getCurrentTier());
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const currentTier = getCurrentTier();

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getAnnualPrice = (monthly: number) =>
    monthly > 0 ? (monthly * 10).toFixed(2) : "0";

  const handleSubscribe = (tier: Tier) => {
    if (tier.id === "free") {
      localStorage.setItem("tuf_tier", "free");
      navigate("/");
      return;
    }
    // TODO: Replace with real Stripe Checkout when keys are added
    // const res = await fetch("/api/stripe/create-checkout", {
    //   method: "POST",
    //   body: JSON.stringify({ priceId: tier.stripePriceId, addOns: [...selectedAddOns] })
    // });
    // const { url } = await res.json();
    // window.location.href = url;

    // Temporary: simulate upgrade for UI testing
    localStorage.setItem("tuf_tier", tier.id);
    setSelectedTier(tier.id);
    alert(`✅ Simulated upgrade to ${tier.name}. Add Stripe keys to go live.`);
  };

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "#080808" }}
    >
      {/* ── Header ── */}
      <div className="px-4 pt-6 pb-4 text-center">
        <button
          onClick={() => navigate(-1 as any)}
          className="absolute top-6 left-4 text-muted-foreground text-sm flex items-center gap-1"
        >
          ← BACK
        </button>
        <div
          className="text-xs font-black tracking-[0.3em] mb-1"
          style={{ color: "#FF4500" }}
        >
          TURNED UP FITNESS
        </div>
        <h1
          className="text-3xl font-black tracking-tight text-white mb-1"
          style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}
        >
          CHOOSE YOUR TIER
        </h1>
        <p className="text-sm text-muted-foreground">
          Train smarter. Move without pain. Evolve.
        </p>
      </div>

      {/* ── Billing toggle ── */}
      <div className="flex justify-center mb-6 px-4">
        <div
          className="flex rounded-full p-1 gap-1"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {(["monthly", "annual"] as const).map(cycle => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className="px-5 py-1.5 rounded-full text-xs font-black tracking-wider transition-all"
              style={{
                background: billingCycle === cycle ? "#FF4500" : "transparent",
                color: billingCycle === cycle ? "#fff" : "#A0A0A0",
              }}
            >
              {cycle === "monthly" ? "MONTHLY" : "ANNUAL (SAVE 17%)"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tier cards ── */}
      <div className="px-4 flex flex-col gap-4 mb-8">
        {TIERS.map(tier => {
          const isCurrentPlan = tier.id === currentTier;
          const isSelected = tier.id === selectedTier;
          const displayPrice = billingCycle === "annual" && tier.price > 0
            ? getAnnualPrice(tier.price)
            : tier.price.toFixed(2);
          const displayInterval = billingCycle === "annual" ? "year" : tier.interval;

          return (
            <div
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className="rounded-2xl p-5 cursor-pointer transition-all relative overflow-hidden"
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)`
                  : "rgba(255,255,255,0.02)",
                border: `1.5px solid ${isSelected ? tier.color : "rgba(255,255,255,0.07)"}`,
                boxShadow: isSelected ? `0 0 32px ${tier.glow}` : "none",
              }}
            >
              {/* Badge */}
              {tier.badge && (
                <div
                  className="absolute top-3 right-3 text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: tier.color, color: "#fff" }}
                >
                  {tier.badge}
                </div>
              )}

              {/* Current plan indicator */}
              {isCurrentPlan && (
                <div
                  className="absolute top-3 left-3 text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.1)", color: "#A0A0A0" }}
                >
                  CURRENT PLAN
                </div>
              )}

              {/* Tier header */}
              <div className={`flex items-end gap-3 ${isCurrentPlan || tier.badge ? "mt-6" : ""}`}>
                <div>
                  <div
                    className="text-xl font-black tracking-widest"
                    style={{ color: tier.color, fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {tier.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{tier.tagline}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-2xl font-black text-white">
                    {tier.price === 0 ? "FREE" : `$${displayPrice}`}
                  </div>
                  {tier.price > 0 && (
                    <div className="text-[10px] text-muted-foreground">/ {displayInterval}</div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="mt-4 space-y-1.5">
                {tier.features.map(f => (
                  <div key={f} className="flex items-start gap-2 text-sm text-white">
                    <span style={{ color: tier.color }} className="mt-0.5 shrink-0">✓</span>
                    <span>{f}</span>
                  </div>
                ))}
                {tier.locked.map(f => (
                  <div key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-0.5 shrink-0 opacity-40">✗</span>
                    <span className="opacity-40">{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={(e) => { e.stopPropagation(); handleSubscribe(tier); }}
                className="mt-5 w-full py-3 rounded-xl font-black text-sm tracking-widest transition-all"
                style={{
                  background: isCurrentPlan
                    ? "rgba(255,255,255,0.05)"
                    : tier.id === "free"
                    ? "rgba(255,255,255,0.08)"
                    : tier.color,
                  color: isCurrentPlan ? "#A0A0A0" : "#fff",
                  cursor: isCurrentPlan ? "default" : "pointer",
                  boxShadow: !isCurrentPlan && tier.price > 0 ? `0 4px 20px ${tier.glow}` : "none",
                }}
                disabled={isCurrentPlan}
              >
                {isCurrentPlan
                  ? "CURRENT PLAN"
                  : tier.id === "free"
                  ? "START FREE"
                  : `GET ${tier.name} →`}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Add-ons ── */}
      <div className="px-4 mb-8">
        <div
          className="text-xs font-black tracking-[0.3em] mb-4"
          style={{ color: "#FF4500" }}
        >
          POWER-UPS & ADD-ONS
        </div>
        <div className="flex flex-col gap-3">
          {ADD_ONS.map(addon => {
            const isSelected = selectedAddOns.has(addon.id);
            const tierOrder: Tier["id"][] = ["free", "core", "elite", "pro"];
            const isAvailable = tierOrder.indexOf(currentTier) >= tierOrder.indexOf(addon.requiresTier);

            return (
              <div
                key={addon.id}
                onClick={() => isAvailable && toggleAddOn(addon.id)}
                className="rounded-xl p-4 flex items-center gap-4 transition-all"
                style={{
                  background: isSelected
                    ? "rgba(255,69,0,0.08)"
                    : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isSelected ? "#FF4500" : "rgba(255,255,255,0.07)"}`,
                  opacity: isAvailable ? 1 : 0.5,
                  cursor: isAvailable ? "pointer" : "not-allowed",
                }}
              >
                <div className="text-2xl">{addon.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-white tracking-wider">{addon.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{addon.description}</div>
                  {!isAvailable && (
                    <div className="text-[10px] mt-1" style={{ color: "#FF4500" }}>
                      Requires {addon.requiresTier.toUpperCase()} plan
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-white">${addon.price}/mo</div>
                  {isSelected && (
                    <div className="text-[10px] mt-0.5" style={{ color: "#FF4500" }}>ADDED</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Trust signals ── */}
      <div className="px-4 mb-8">
        <div
          className="rounded-2xl p-5 text-center"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="text-xs font-black tracking-widest text-muted-foreground mb-3">
            THE PANTHER PROMISE
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: "🔒", label: "Cancel Anytime" },
              { icon: "💳", label: "Secure Checkout" },
              { icon: "🐆", label: "AI That Grows With You" },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="px-4 mb-8 space-y-3">
        <div className="text-xs font-black tracking-[0.3em] mb-4" style={{ color: "#FF4500" }}>
          COMMON QUESTIONS
        </div>
        {[
          {
            q: "Can I switch plans?",
            a: "Yes — upgrade or downgrade anytime. Changes take effect at the next billing cycle.",
          },
          {
            q: "What happens when I cancel?",
            a: "You keep access until the end of your billing period. No hidden fees.",
          },
          {
            q: "Is my data safe?",
            a: "All movement and health data is stored locally on your device. We never sell your data.",
          },
          {
            q: "When will Stripe billing go live?",
            a: "Billing is in final testing. You'll be notified when payment processing is enabled.",
          },
        ].map(item => (
          <div
            key={item.q}
            className="rounded-xl p-4"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="text-sm font-black text-white mb-1">{item.q}</div>
            <div className="text-xs text-muted-foreground leading-relaxed">{item.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
