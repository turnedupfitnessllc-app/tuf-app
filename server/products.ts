/**
 * TUF PRODUCTS — Doc 16 v2 (3-tier structure)
 * Panther Core | Panther Elite | Panther Pro
 *
 * Price IDs come from environment variables.
 * Set these in your .env file after creating products in the Stripe Dashboard:
 *   STRIPE_PRICE_CORE_MONTHLY, STRIPE_PRICE_CORE_ANNUAL
 *   STRIPE_PRICE_ELITE_MONTHLY, STRIPE_PRICE_ELITE_ANNUAL
 *   STRIPE_PRICE_PRO_MONTHLY, STRIPE_PRICE_PRO_ANNUAL
 *
 * Legacy 4-tier env vars (CUB/STEALTH/CONTROLLED/APEX) are still read as fallbacks
 * to avoid breaking any existing subscriptions.
 */

export interface TufProduct {
  id: string;           // tier identifier: 'core' | 'elite' | 'pro'
  name: string;         // display name
  color: string;        // accent color for UI
  monthlyPrice: number; // in cents
  annualPrice: number;  // in cents
  monthlyPriceId: string;
  annualPriceId: string;
  features: string[];
  recommended?: boolean;
}

export const TUF_PRODUCTS: TufProduct[] = [
  {
    id: "core",
    name: "PANTHER CORE",
    color: "#FF6600",
    monthlyPrice: 1999,   // $19.99
    annualPrice: 19900,   // $199.00
    monthlyPriceId: process.env.STRIPE_PRICE_CORE_MONTHLY || process.env.STRIPE_PRICE_STEALTH_MONTHLY || "",
    annualPriceId: process.env.STRIPE_PRICE_CORE_ANNUAL || process.env.STRIPE_PRICE_STEALTH_ANNUAL || "",
    features: [
      "AI Corrective Coaching",
      "MOVE Pillar",
      "FUEL Pillar",
      "Pain Diagnostics",
      "Full Exercise Library",
    ],
  },
  {
    id: "elite",
    name: "PANTHER ELITE",
    color: "#C8973A",
    monthlyPrice: 3999,   // $39.99
    annualPrice: 39900,   // $399.00
    monthlyPriceId: process.env.STRIPE_PRICE_ELITE_MONTHLY || process.env.STRIPE_PRICE_CONTROLLED_MONTHLY || "",
    annualPriceId: process.env.STRIPE_PRICE_ELITE_ANNUAL || process.env.STRIPE_PRICE_CONTROLLED_ANNUAL || "",
    features: [
      "Everything in Core",
      "FEAST Pillar — TUTK Recipes",
      "100-Recipe Library",
      "1,800-Food Database",
      "Georgia/Southern Food Intelligence",
    ],
    recommended: true,
  },
  {
    id: "pro",
    name: "PANTHER PRO",
    color: "#AA44FF",
    monthlyPrice: 7999,   // $79.99
    annualPrice: 79900,   // $799.00
    monthlyPriceId: process.env.STRIPE_PRICE_PRO_MONTHLY || process.env.STRIPE_PRICE_APEX_MONTHLY || "",
    annualPriceId: process.env.STRIPE_PRICE_PRO_ANNUAL || process.env.STRIPE_PRICE_APEX_ANNUAL || "",
    features: [
      "Everything in Elite",
      "MINDSET Pillar",
      "30-Day Challenge",
      "Trainer Tools",
      "Client Management",
    ],
  },
];
