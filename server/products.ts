/**
 * TUF Membership Products
 * Prices are created dynamically in Stripe on first checkout.
 * Once created, replace the placeholder priceId values with real Stripe Price IDs
 * from your Stripe Dashboard → Products.
 */

export interface TufProduct {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;   // USD cents
  annualPrice: number;    // USD cents (total for year)
  monthlyPriceId: string; // Stripe Price ID — fill after first creation
  annualPriceId: string;  // Stripe Price ID — fill after first creation
  features: string[];
  color: string;
  badge?: string;
}

export const TUF_PRODUCTS: TufProduct[] = [
  {
    id: "cub",
    name: "CUB",
    tagline: "Start your movement journey",
    monthlyPrice: 999,   // $9.99
    annualPrice: 9500,   // $95.00
    monthlyPriceId: process.env.STRIPE_PRICE_CUB_MONTHLY || "",
    annualPriceId: process.env.STRIPE_PRICE_CUB_ANNUAL || "",
    color: "#A0A0A0",
    features: [
      "Pain & movement assessment",
      "Basic 4-week corrective program",
      "XP tracking & stage system",
      "Movement streak tracking",
      "Community access",
    ],
  },
  {
    id: "stealth",
    name: "STEALTH",
    tagline: "Build your corrective foundation",
    monthlyPrice: 1999,  // $19.99
    annualPrice: 19100,  // $191.00
    monthlyPriceId: process.env.STRIPE_PRICE_STEALTH_MONTHLY || "",
    annualPriceId: process.env.STRIPE_PRICE_STEALTH_ANNUAL || "",
    color: "#4a9eff",
    features: [
      "Everything in CUB",
      "Panther Brain AI coach (Claude)",
      "BOA Scan — biomechanical analysis",
      "Evolve stage unlocks",
      "Unlimited AI coaching sessions",
    ],
  },
  {
    id: "controlled",
    name: "CONTROLLED",
    tagline: "Precision training at full capacity",
    monthlyPrice: 3499,  // $34.99
    annualPrice: 33500,  // $335.00
    monthlyPriceId: process.env.STRIPE_PRICE_CONTROLLED_MONTHLY || "",
    annualPriceId: process.env.STRIPE_PRICE_CONTROLLED_ANNUAL || "",
    color: "#C8973A",
    badge: "MOST POPULAR",
    features: [
      "Everything in STEALTH",
      "30-Day Panther Mindset Challenge",
      "Advanced program variations",
      "Nutrition & supplementation guidance",
      "Priority AI response speed",
    ],
  },
  {
    id: "apex",
    name: "APEX PREDATOR",
    tagline: "Elite performance, no limits",
    monthlyPrice: 5999,  // $59.99
    annualPrice: 57500,  // $575.00
    monthlyPriceId: process.env.STRIPE_PRICE_APEX_MONTHLY || "",
    annualPriceId: process.env.STRIPE_PRICE_APEX_ANNUAL || "",
    color: "#FF4500",
    badge: "ELITE",
    features: [
      "Everything in CONTROLLED",
      "Live coaching session queue",
      "Custom program builds",
      "Direct trainer access",
      "Early access to new features",
    ],
  },
];
