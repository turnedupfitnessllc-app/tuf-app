/**
 * ============================================================================
 * TURNED UP FITNESS — COMPLETE APP FRAMEWORK V2
 * React Display Layer — Phase 1 (Content + Premium Membership Gate)
 * ============================================================================
 *
 * BRAND ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────┐
 * │  TURNED UP FITNESS (Parent Brand)                   │
 * │  — Workout Program (Free with membership)           │
 * │  — Health Condition Modifications (Free)            │
 * │  — Basic Nutrition Guide (Free)                     │
 * │                                                     │
 * │  ┌───────────────────────────────────────────────┐  │
 * │  │  TURNED UP IN THE KITCHEN (Premium Add-On)    │  │
 * │  │  — Full Recipe Library (Premium only)         │  │
 * │  │  — Personalized Meal Plans (Premium only)     │  │
 * │  │  — Condition-Specific Nutrition (Premium only)│  │
 * │  └───────────────────────────────────────────────┘  │
 * └─────────────────────────────────────────────────────┘
 *
 * MONETIZATION MODEL:
 * Turned Up Fitness membership = base subscription (workout access)
 * Turned Up In The Kitchen = premium upsell (nutrition + recipes)
 * This mirrors how the best health apps structure revenue — get users
 * invested in the fitness side first, then upsell the nutrition layer
 * once they are seeing results and are emotionally committed.
 *
 * PHASE 2 ADDITIONS (not in this display layer):
 * — Backend authentication (user login / signup)
 * — Payment processing (Stripe or similar)
 * — Database persistence (user profiles, progress tracking)
 * — AI personalization engine (from Day 3 Nutrition Framework)
 * — Push notifications (workout reminders, meal plan updates)
 *
 * COLOR SYSTEM:
 * Primary Red:      #C0392B  (Turned Up brand red)
 * Dark Red:         #7B241C  (depth and shadow)
 * Black:            #0D0D0D  (backgrounds)
 * Charcoal:         #1C1C1C  (card backgrounds)
 * Dark Gray:        #2C2C2C  (borders and dividers)
 * Mid Gray:         #707070  (secondary text)
 * Light Gray:       #F0F0F0  (stat panels)
 * White:            #FFFFFF  (primary text on dark)
 * Premium Gold:     #F5A623  (premium membership accents)
 */

import { useState } from "react";

// ============================================================================
// CONTENT DATA LAYER
// In Phase 2, all of this data will be fetched from a backend API.
// Keeping it here in Phase 1 makes the app fully self-contained and
// allows a developer to see exactly what data structures the backend needs.
// ============================================================================

// The MEMBERSHIP_TIERS object defines what each tier unlocks.
// This drives the premium gate logic throughout the entire app.
const MEMBERSHIP_TIERS = {
  free: {
    id: "free",
    name: "Basic",
    price: "Free",
    description: "Start your Turned Up Fitness journey",
    features: [
      "12-Week Beginner Workout Program",
      "Health Condition Modifications Guide",
      "Basic Nutrition Overview",
      "Community Access"
    ],
    unlocks: ["workout", "modifications", "basic_nutrition"]
  },
  fitness: {
    id: "fitness",
    name: "Turned Up Fitness",
    price: "$19.99/mo",
    description: "The complete fitness membership",
    features: [
      "Everything in Basic",
      "All 12 workout phases with progressions",
      "Personalized workout plan",
      "Progress tracking",
      "Video demonstrations library"
    ],
    unlocks: ["workout", "modifications", "basic_nutrition", "full_workout", "progress"]
  },
  premium: {
    id: "premium",
    name: "Fitness + Kitchen Bundle",
    price: "$34.99/mo",
    description: "The complete health and wellness system",
    badge: "BEST VALUE",
    features: [
      "Everything in Turned Up Fitness",
      "Full Turned Up In The Kitchen access",
      "Personalized meal plans",
      "Region-specific recipe library",
      "Condition-targeted nutrition guidance",
      "Weekly meal prep guides",
      "Priority support"
    ],
    unlocks: ["workout", "modifications", "basic_nutrition", "full_workout", "progress", "kitchen", "recipes", "meal_plans"]
  }
};

const RECIPES = [
  {
    id: 1,
    title: "Seared Scallops with Brussels Sprouts",
    category: "Dinner",
    prepTime: "5 min",
    cookTime: "12 min",
    protein: "26g",
    calories: "280",
    tags: ["Anti-Inflammatory", "High Protein", "Omega-3"],
    conditions: ["joint_health", "heart_health"],
    why40: "Rich in selenium, B12, and omega-3s that reduce joint inflammation. Brussels sprouts deliver antioxidants and fiber that support gut health.",
    ingredients: [
      "170g scallops (6 oz) — pat completely dry before cooking",
      "2 tbsp olive oil, divided",
      "1 cup diced brussels sprouts",
      "2 tbsp rice wine vinegar",
      "Salt and pepper to taste",
      "Optional: 1/2 cup sauerkraut for gut health"
    ],
    steps: [
      { title: "Prep", detail: "Pat scallops completely dry with paper towels. Season both sides with salt and pepper. Moisture prevents the sear — this step is non-negotiable." },
      { title: "Cook Brussels Sprouts", detail: "Heat 1 tbsp olive oil until shimmering. Add sprouts, season, and cook stirring continuously for 5 to 6 minutes until golden and tender-crisp." },
      { title: "Deglaze", detail: "Add rice wine vinegar and scrape up the brown bits from the pan bottom — this is where the flavor lives. Transfer sprouts to a plate." },
      { title: "Sear Scallops", detail: "Heat remaining oil. Place scallops flat side down and do not move them for 2 to 3 minutes until a golden crust forms on the edges." },
      { title: "Finish and Plate", detail: "Flip scallops and cook 2 more minutes. Arrange over brussels sprouts. Serve immediately." }
    ],
    videoSearch: "How to Sear Scallops Perfectly Food Network"
  },
  {
    id: 2,
    title: "Stir-Fry Cabbage with Pork",
    category: "Dinner",
    prepTime: "10 min",
    cookTime: "8 min",
    protein: "30g",
    calories: "310",
    tags: ["High Protein", "Gut Health", "Low Sodium"],
    conditions: ["blood_pressure", "gut_health"],
    why40: "Cabbage provides vitamin K for bone density. Kerry Gold butter delivers healthy fats. Bragg's Liquid Aminos is lower sodium than soy sauce — better for blood pressure management at 40+.",
    ingredients: [
      "170g pork (6 oz) — cooked and shredded",
      "2 tbsp Kerry Gold butter",
      "1/2 cup chopped celery",
      "2 cups shredded cabbage",
      "1/3 cup chopped onion",
      "4 tbsp Bragg's Liquid Aminos",
      "Salt to taste"
    ],
    steps: [
      { title: "Prep Everything First", detail: "Shred pork, chop celery, shred cabbage, chop onion, measure Bragg's. Everything ready before you start is essential — this cooks fast." },
      { title: "Heat Butter", detail: "Heat Kerry Gold butter until bubbly, hot, and beginning to foam before adding anything." },
      { title: "Cook Celery", detail: "Add celery and cook for exactly 1 minute, stirring. This head start ensures everything finishes at the same time." },
      { title: "Add Cabbage and Onion", detail: "Fry stirring continuously until tender-crisp, about 2 to 3 minutes. You want texture, not mush." },
      { title: "Add Pork, Season, and Serve", detail: "Add pork, pour in Bragg's, add salt. Stir well. Cook 1 minute longer then remove from heat. Serve hot." }
    ],
    videoSearch: "Pork and Cabbage Stir Fry Omnivore Cookbook"
  },
  {
    id: 3,
    title: "Lemon Almond Roasted Chicken Salad",
    category: "Lunch",
    prepTime: "10 min",
    cookTime: "25 min",
    protein: "32g",
    calories: "290",
    tags: ["Lean Protein", "Heart Healthy", "Bone Support"],
    conditions: ["bone_density", "heart_health", "weight_management"],
    why40: "Almonds deliver vitamin E, magnesium, and healthy fats. Greek yogurt adds probiotics and calcium for bone density. Lemon supports collagen production — critical for joint and skin health as we age.",
    ingredients: [
      "170g skinless chicken breasts (6 oz)",
      "1/3 cup plain greek yogurt",
      "1 tbsp olive oil",
      "12 pieces sliced almonds",
      "1 tbsp lemon juice",
      "1 green onion, diced",
      "1 tbsp chopped fresh parsley",
      "1 tbsp lemon pepper seasoning",
      "1/2 tsp coarse sea salt"
    ],
    steps: [
      { title: "Preheat and Season", detail: "Preheat oven to 400°F. Coat chicken with lemon pepper, sea salt, and olive oil. Cover every surface evenly." },
      { title: "Roast Chicken", detail: "Roast 20 to 25 minutes until internal temperature reaches 165°F. Rest 5 minutes before cutting to lock in the juices." },
      { title: "Toast Almonds", detail: "Heat olive oil over medium-low. Add almonds and stir constantly for 4 to 5 minutes until golden. They burn fast — watch carefully. Let cool completely." },
      { title: "Combine", detail: "Dice rested chicken. Add chicken, almonds, lemon juice, green onion, and parsley to a bowl. Stir to combine." },
      { title: "Fold in Yogurt and Serve", detail: "Add greek yogurt and fold gently until every piece is moistened. Season with salt and pepper. Serve immediately or refrigerate up to 2 days." }
    ],
    videoSearch: "Healthy Lemon Almond Chicken Salad Sweet Savory Steph"
  },
  {
    id: 4,
    title: "Honey Mustard Chicken Salad",
    category: "Lunch",
    prepTime: "10 min",
    cookTime: "20 min",
    protein: "34g",
    calories: "320",
    tags: ["High Protein", "Clean Fats", "Sugar-Free Dressing"],
    conditions: ["blood_sugar", "weight_management"],
    why40: "Spinach provides iron, folate, and vitamin K. Stevia keeps this dressing completely sugar-free — critical for blood sugar management when insulin sensitivity declines after 40. Olive oil supports cardiovascular health.",
    ingredients: [
      "170g boneless skinless chicken breast (6 oz)",
      "1 bag fresh spinach",
      "2 ripe tomatoes, diced",
      "1/3 cup red onion, thinly sliced",
      "1/3 cup mustard",
      "8 tbsp olive oil",
      "4 stevia packets"
    ],
    steps: [
      { title: "Cook Chicken", detail: "Season and grill or bake at 400°F for 18 to 20 minutes. Rest 5 minutes then slice." },
      { title: "Make Dressing", detail: "Whisk mustard, olive oil, and stevia until thoroughly combined and slightly thickened." },
      { title: "Build Salad", detail: "Place spinach in a large bowl. Add tomatoes and red onion." },
      { title: "Add Chicken", detail: "Place warm sliced chicken on top. The warmth slightly wilts the spinach — intentional and delicious." },
      { title: "Dress and Serve", detail: "Pour dressing over the bowl. Toss gently. Serve immediately while the chicken is still warm." }
    ],
    videoSearch: "Honey Mustard Chicken Salad Healthy Fitness Meals"
  },
  {
    id: 5,
    title: "Egg White Omelet with Sweet Potato",
    category: "Breakfast",
    prepTime: "5 min",
    cookTime: "15 min",
    protein: "28g",
    calories: "220",
    tags: ["Low Fat", "Blood Sugar Friendly", "High Protein"],
    conditions: ["blood_sugar", "weight_management", "heart_health"],
    why40: "Egg whites are pure protein with virtually zero fat. Sweet potato releases energy slowly preventing blood sugar spikes. Cinnamon actively improves insulin sensitivity — a metabolically smart choice for 40+ bodies.",
    ingredients: [
      "1 and 1/4 cup egg whites",
      "Handful of fresh spinach, torn",
      "2/3 cup raw chopped sweet potato",
      "Pico de gallo to taste",
      "Dash of cinnamon",
      "2 stevia packets",
      "Cooking spray"
    ],
    steps: [
      { title: "Cook Sweet Potato", detail: "Place in microwavable bowl, poke holes with a fork, spray with cooking spray, and microwave on potato setting. Should be fork-tender when done." },
      { title: "Sauté Spinach", detail: "Bring cooking-sprayed skillet to medium heat. Add torn spinach and sauté until wilted, about 2 to 3 minutes." },
      { title: "Add Egg Whites", detail: "Pour egg whites over the spinach. Spread evenly. Let the bottom set completely before moving — about 3 to 4 minutes." },
      { title: "Flip and Finish", detail: "When edges are set and center is mostly cooked, flip carefully. Cook 1 to 2 more minutes until fully done." },
      { title: "Top and Serve", detail: "Top omelet with pico de gallo. Top sweet potato with cinnamon and stevia. Serve immediately alongside each other." }
    ],
    videoSearch: "Egg White Omelet Spinach Healthy Breakfast Fit Men Cook"
  }
];

const WORKOUT_PHASES = [
  {
    phase: 1,
    name: "Foundation",
    weeks: "1 – 4",
    goal: "Master movement quality before adding any load",
    color: "#C0392B",
    days: [
      { day: "Day 1", focus: "Push & Core", strength: "Wall Push-Ups 3x12", movement: "Knee Plank 3x20 sec", conditioning: "10-minute walk" },
      { day: "Day 2", focus: "Hinge & Pull", strength: "Glute Bridge 3x15", movement: "Band Row 3x10", conditioning: "5-min walk · rest 2 min · 5-min walk" },
      { day: "Day 3", focus: "Squat & Carry", strength: "High Box Squat 3x10", movement: "Farmer Carry 3x30 sec", conditioning: "8-minute continuous walk" }
    ]
  },
  {
    phase: 2,
    name: "Build",
    weeks: "5 – 8",
    goal: "Add progressive load — same perfect patterns, more challenge",
    color: "#1C1C1C",
    days: [
      { day: "Day 1", focus: "Push, Core & Shoulder", strength: "Push-Ups 3x10", movement: "Plank 3x40 sec", conditioning: "3 rounds: 5-min brisk walk, 2-min rest" },
      { day: "Day 2", focus: "Hinge & Pull", strength: "Romanian Deadlift 3x12", movement: "Dumbbell Row 3x10 each side", conditioning: "Intervals: 20 min alternating 2-min brisk, 1-min easy" },
      { day: "Day 3", focus: "Squat, Carry & Full Body", strength: "Goblet Squat 3x12", movement: "Farmer Carry 3x50 sec", conditioning: "2 rounds: 8-min brisk walk, 2-min rest" }
    ]
  },
  {
    phase: 3,
    name: "Strengthen",
    weeks: "9 – 12",
    goal: "Push toward your true capacity — measure your transformation",
    color: "#C0392B",
    days: [
      { day: "Day 1", focus: "Push, Pull & Core", strength: "Push-Up to Row Superset: 10 + 10", movement: "Plank to Down Dog 3x8", conditioning: "40-minute walk" },
      { day: "Day 2", focus: "Hinge & Single Leg", strength: "Romanian Deadlift 4x10", movement: "Reverse Lunge 3x10 each leg", conditioning: "5 rounds: 3-min brisk, 90-sec easy" },
      { day: "Day 3", focus: "Full Body Strength", strength: "Goblet Squat 4x12 (3-sec tempo)", movement: "Farmer Carry 4x60 sec", conditioning: "3 rounds: 8-min brisk, 1-min fast" }
    ]
  }
];

const HEALTH_CONDITIONS = [
  { id: "blood_pressure",    label: "Blood Pressure",    icon: "🫀" },
  { id: "joint_health",      label: "Joint Health",      icon: "🦴" },
  { id: "blood_sugar",       label: "Blood Sugar",       icon: "🩸" },
  { id: "weight_management", label: "Weight Management", icon: "⚖️" },
  { id: "heart_health",      label: "Heart Health",      icon: "❤️" },
  { id: "bone_density",      label: "Bone Density",      icon: "💪" }
];

// ============================================================================
// DESIGN SYSTEM
// All styling is defined here in one place so future developers can update
// the visual design without hunting through component code.
// ============================================================================

const C = {
  red:     "#C0392B",
  darkRed: "#7B241C",
  black:   "#0D0D0D",
  charcoal:"#1C1C1C",
  darkGray:"#2C2C2C",
  midGray: "#707070",
  lightGray:"#F0F0F0",
  white:   "#FFFFFF",
  gold:    "#F5A623",  // used exclusively for premium Kitchen branding
};

const S = {
  app: {
    minHeight: "100vh",
    background: `linear-gradient(180deg, #1a0000 0%, ${C.black} 50%, #1a1a1a 100%)`,
    color: "#e0e0e0",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    maxWidth: "480px",
    margin: "0 auto"
  },

  // Navigation
  nav: {
    background: C.black,
    borderBottom: `3px solid ${C.red}`,
    padding: "10px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 100
  },
  navBrand: { color: C.white, fontWeight: 900, fontSize: "15px", letterSpacing: "1px", margin: 0 },
  navSub: { color: C.red, fontSize: "9px", fontWeight: 700, letterSpacing: "2px", margin: 0 },
  navBtn: (active) => ({
    background: active ? C.red : "transparent",
    color: active ? C.white : "#999",
    border: `1px solid ${active ? C.red : "#333"}`,
    borderRadius: "4px",
    padding: "5px 10px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 700,
    transition: "all 0.2s"
  }),

  // Hero sections
  hero: {
    background: `linear-gradient(135deg, #1a0000 0%, ${C.black} 100%)`,
    borderBottom: `3px solid ${C.red}`,
    padding: "32px 20px",
    textAlign: "center"
  },
  heroTitle: { fontSize: "28px", fontWeight: 900, color: C.white, margin: "0 0 6px", letterSpacing: "2px" },
  heroSub: { fontSize: "11px", color: C.red, fontWeight: 700, letterSpacing: "3px", margin: "0 0 12px" },
  heroDesc: { fontSize: "13px", color: "#bbb", maxWidth: "420px", margin: "0 auto", lineHeight: 1.6 },

  // Kitchen premium hero — gold accented
  kitchenHero: {
    background: `linear-gradient(135deg, #1a1000 0%, ${C.black} 100%)`,
    borderBottom: `3px solid ${C.gold}`,
    padding: "32px 20px",
    textAlign: "center"
  },
  kitchenTitle: { fontSize: "24px", fontWeight: 900, color: C.white, margin: "0 0 6px", letterSpacing: "1px" },
  kitchenSub: { fontSize: "10px", color: C.gold, fontWeight: 700, letterSpacing: "3px", margin: "0 0 12px" },

  // Content sections
  section: { padding: "20px 16px" },
  sectionTitle: {
    color: C.red,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "2px",
    margin: "0 0 14px",
    paddingBottom: "8px",
    borderBottom: `1px solid ${C.darkGray}`
  },
  kitchenSectionTitle: {
    color: C.gold,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "2px",
    margin: "0 0 14px",
    paddingBottom: "8px",
    borderBottom: `1px solid #3d2d00`
  },

  // Cards
  card: {
    background: C.charcoal,
    border: `1px solid ${C.darkGray}`,
    borderRadius: "8px",
    padding: "14px",
    marginBottom: "10px"
  },
  cardHighlight: {
    background: C.charcoal,
    border: `1px solid ${C.red}`,
    borderRadius: "8px",
    padding: "14px",
    marginBottom: "10px"
  },
  premiumCard: {
    background: "#1a1000",
    border: `1px solid ${C.gold}`,
    borderRadius: "8px",
    padding: "14px",
    marginBottom: "10px"
  },
  cardTitle: { color: C.white, fontWeight: 700, fontSize: "14px", margin: "0 0 4px" },
  cardSub: { color: "#999", fontSize: "11px", margin: "0 0 10px" },

  // Tags
  tag: {
    display: "inline-block",
    background: "#2c0000",
    color: C.red,
    border: `1px solid ${C.red}`,
    borderRadius: "12px",
    padding: "2px 8px",
    fontSize: "10px",
    fontWeight: 700,
    marginRight: "5px",
    marginBottom: "5px"
  },
  premiumTag: {
    display: "inline-block",
    background: "#2d1f00",
    color: C.gold,
    border: `1px solid ${C.gold}`,
    borderRadius: "12px",
    padding: "2px 8px",
    fontSize: "10px",
    fontWeight: 700,
    marginRight: "5px",
    marginBottom: "5px"
  },

  // Stats
  statRow: { display: "flex", gap: "6px", marginBottom: "10px" },
  stat: {
    flex: 1,
    background: C.black,
    border: `1px solid ${C.darkGray}`,
    borderRadius: "6px",
    padding: "8px",
    textAlign: "center"
  },
  statVal: { color: C.red, fontWeight: 700, fontSize: "14px", display: "block" },
  statLbl: { color: "#666", fontSize: "9px", display: "block" },

  // Buttons
  btn: {
    background: C.red,
    color: C.white,
    border: "none",
    borderRadius: "6px",
    padding: "11px 20px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "12px",
    width: "100%",
    letterSpacing: "1px",
    transition: "opacity 0.2s"
  },
  btnOutline: {
    background: "transparent",
    color: C.red,
    border: `2px solid ${C.red}`,
    borderRadius: "6px",
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "11px",
    letterSpacing: "1px"
  },
  btnPremium: {
    background: C.gold,
    color: C.black,
    border: "none",
    borderRadius: "6px",
    padding: "11px 20px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: "12px",
    width: "100%",
    letterSpacing: "1px"
  },
  btnPremiumOutline: {
    background: "transparent",
    color: C.gold,
    border: `2px solid ${C.gold}`,
    borderRadius: "6px",
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "11px",
    letterSpacing: "1px"
  },

  // Steps
  stepItem: { display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" },
  stepNum: {
    minWidth: "22px", height: "22px",
    background: C.red, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "10px", fontWeight: 700, color: C.white
  },
  stepText: { fontSize: "12px", color: "#ddd", lineHeight: 1.5 },
  stepLabel: { color: C.red, fontWeight: 700, fontSize: "11px", marginBottom: "2px" },

  // Form elements
  input: {
    width: "100%",
    background: C.charcoal,
    border: `1px solid #333`,
    borderRadius: "6px",
    padding: "10px",
    color: "#e0e0e0",
    fontSize: "12px",
    boxSizing: "border-box"
  },
  select: {
    width: "100%",
    background: C.charcoal,
    border: `1px solid #333`,
    borderRadius: "6px",
    padding: "10px",
    color: "#e0e0e0",
    fontSize: "12px"
  },
  label: { color: "#bbb", fontSize: "11px", fontWeight: 600, display: "block", marginBottom: "6px" },

  // Workout
  phaseCard: (color) => ({
    background: C.charcoal,
    borderLeft: `4px solid ${color}`,
    borderRadius: "8px",
    padding: "14px",
    marginBottom: "10px"
  }),
  wodDay: { background: C.black, borderRadius: "6px", padding: "10px", marginBottom: "6px" },
  wodDayTitle: { color: C.red, fontWeight: 700, fontSize: "11px", letterSpacing: "1px", marginBottom: "6px" },
  wodRow: { display: "flex", justifyContent: "space-between", marginBottom: "3px" },
  wodLabel: { color: "#666", fontSize: "10px", minWidth: "90px" },
  wodValue: { color: "#ccc", fontSize: "10px", textAlign: "right", flex: 1 },

  // Condition badges
  condBadge: (selected) => ({
    background: selected ? "#2c0000" : C.charcoal,
    border: `1px solid ${selected ? C.red : "#333"}`,
    borderRadius: "8px",
    padding: "10px",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s"
  }),
  condIcon: { fontSize: "18px", display: "block", marginBottom: "3px" },
  condLabel: (selected) => ({ fontSize: "10px", color: selected ? C.red : "#777", fontWeight: 700 }),

  // Progress bar
  progressWrap: { height: "4px", background: C.darkGray, borderRadius: "2px", overflow: "hidden" },
  progressFill: (pct) => ({
    height: "100%",
    background: C.red,
    width: `${pct}%`,
    borderRadius: "2px",
    transition: "width 0.5s ease"
  }),

  // Premium gate overlay
  premiumGate: {
    background: "rgba(0,0,0,0.85)",
    border: `2px solid ${C.gold}`,
    borderRadius: "12px",
    padding: "24px 20px",
    textAlign: "center",
    margin: "16px"
  },

  // Disclaimer
  disclaimer: {
    background: "#1a1200",
    border: `1px solid #664400`,
    borderRadius: "6px",
    padding: "10px",
    fontSize: "10px",
    color: "#cc9900",
    lineHeight: 1.5,
    marginTop: "14px"
  }
};

// ============================================================================
// UTILITY COMPONENTS
// Small reusable pieces that appear throughout the app.
// ============================================================================

/**
 * PremiumGate — displayed whenever a non-premium user tries to access
 * Kitchen content. This is the key conversion point in the monetization funnel.
 */
function PremiumGate({ onUpgrade }) {
  return (
    <div style={S.premiumGate}>
      {/* Kitchen logo placeholder — replace with actual logo in production */}
      <div style={{ fontSize: "40px", marginBottom: "8px" }}>👨‍🍳</div>
      <p style={{ color: C.gold, fontWeight: 900, fontSize: "16px", margin: "0 0 4px", letterSpacing: "1px" }}>
        TURNED UP IN THE KITCHEN
      </p>
      <p style={{ color: "#999", fontSize: "11px", margin: "0 0 16px", lineHeight: 1.5 }}>
        Premium nutrition content, personalized meal plans, and the full recipe library require the Kitchen upgrade.
      </p>
      <div style={{ ...S.card, textAlign: "left", background: "#1a1000", borderColor: C.gold, marginBottom: "14px" }}>
        <p style={{ color: C.gold, fontWeight: 700, fontSize: "12px", margin: "0 0 8px" }}>
          WHAT YOU GET WITH KITCHEN ACCESS
        </p>
        {[
          "Full recipe library (5 recipes now, growing to 30+)",
          "Personalized meal plans based on your health conditions",
          "Region-specific nutrition guidance",
          "Condition-targeted food recommendations",
          "Weekly meal prep guides"
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "5px" }}>
            <span style={{ color: C.gold }}>✓</span>
            <span style={{ fontSize: "11px", color: "#ddd" }}>{f}</span>
          </div>
        ))}
      </div>
      <button style={S.btnPremium} onClick={onUpgrade}>
        UPGRADE TO FITNESS + KITCHEN — $34.99/mo
      </button>
      <p style={{ color: "#666", fontSize: "10px", marginTop: "8px" }}>
        Cancel anytime. No contracts.
      </p>
    </div>
  );
}

/** MembershipBadge — small indicator showing the user's current tier */
function MembershipBadge({ tier }) {
  const colors = { free: "#555", fitness: C.red, premium: C.gold };
  const labels = { free: "BASIC", fitness: "FITNESS", premium: "FITNESS + KITCHEN" };
  return (
    <span style={{
      background: colors[tier] || "#555",
      color: C.white,
      fontSize: "9px",
      fontWeight: 900,
      padding: "2px 7px",
      borderRadius: "10px",
      letterSpacing: "1px"
    }}>
      {labels[tier] || "BASIC"}
    </span>
  );
}

// ============================================================================
// RECIPE COMPONENTS
// ============================================================================

function RecipeCard({ recipe, userConditions }) {
  const [expanded, setExpanded] = useState(false);
  // A recipe is "recommended" if it targets one of the user's health conditions.
  const isRecommended = recipe.conditions.some(c => userConditions.includes(c));

  return (
    <div style={isRecommended ? S.cardHighlight : S.card}>
      {isRecommended && (
        <div style={{
          background: "#2c0000", color: C.red,
          fontSize: "9px", fontWeight: 700,
          padding: "2px 7px", borderRadius: "4px",
          display: "inline-block", marginBottom: "6px", letterSpacing: "1px"
        }}>
          RECOMMENDED FOR YOU
        </div>
      )}

      <p style={S.cardTitle}>{recipe.title}</p>
      <p style={S.cardSub}>{recipe.category}</p>

      <div style={S.statRow}>
        {[
          [recipe.protein, "Protein"],
          [recipe.calories, "Calories"],
          [recipe.prepTime, "Prep"],
          [recipe.cookTime, "Cook"]
        ].map(([val, lbl]) => (
          <div key={lbl} style={S.stat}>
            <span style={S.statVal}>{val}</span>
            <span style={S.statLbl}>{lbl}</span>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "10px" }}>
        {recipe.tags.map(t => <span key={t} style={S.premiumTag}>{t}</span>)}
      </div>

      {/* "Why this works for 40+" panel — this is a key differentiator
          that makes your app feel like it truly understands its audience. */}
      <div style={{
        background: C.black, borderRadius: "6px", padding: "8px",
        marginBottom: "10px", borderLeft: `3px solid ${C.gold}`
      }}>
        <p style={{ margin: 0, fontSize: "11px", color: "#bbb", lineHeight: 1.5 }}>
          <span style={{ color: C.gold, fontWeight: 700 }}>WHY THIS WORKS FOR 40+: </span>
          {recipe.why40}
        </p>
      </div>

      <button style={S.btnPremiumOutline} onClick={() => setExpanded(!expanded)}>
        {expanded ? "HIDE RECIPE" : "VIEW FULL RECIPE"}
      </button>

      {expanded && (
        <div style={{ marginTop: "14px" }}>
          <p style={S.kitchenSectionTitle}>INGREDIENTS</p>
          {recipe.ingredients.map((ing, i) => (
            <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "5px" }}>
              <span style={{ color: C.gold }}>•</span>
              <span style={{ fontSize: "11px", color: "#ddd" }}>{ing}</span>
            </div>
          ))}

          <p style={{ ...S.kitchenSectionTitle, marginTop: "14px" }}>STEP-BY-STEP</p>
          {recipe.steps.map((step, i) => (
            <div key={i} style={S.stepItem}>
              <div style={{ ...S.stepNum, background: C.gold, color: C.black }}>{i + 1}</div>
              <div>
                <div style={{ ...S.stepLabel, color: C.gold }}>
                  STEP {i + 1}: {step.title.toUpperCase()}
                </div>
                <div style={S.stepText}>{step.detail}</div>
              </div>
            </div>
          ))}

          <div style={{
            background: "#0a1a0a", border: `1px solid #2e7d32`,
            borderRadius: "6px", padding: "8px", marginTop: "10px"
          }}>
            <p style={{ margin: 0, fontSize: "10px", color: "#4fc3f7" }}>
              <span style={{ fontWeight: 700 }}>VIDEO TUTORIAL: </span>
              Search YouTube: "{recipe.videoSearch}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// WORKOUT COMPONENTS
// ============================================================================

function WorkoutPhaseCard({ phase }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={S.phaseCard(phase.color)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
        <div>
          <p style={{ margin: 0, color: C.red, fontSize: "10px", fontWeight: 700, letterSpacing: "2px" }}>
            PHASE {phase.phase}
          </p>
          <p style={{ margin: "2px 0 0", color: C.white, fontWeight: 700, fontSize: "15px" }}>{phase.name}</p>
          <p style={{ margin: "1px 0 0", color: "#888", fontSize: "10px" }}>Weeks {phase.weeks}</p>
        </div>
        <button style={{ ...S.btnOutline, fontSize: "10px", padding: "5px 10px" }}
          onClick={() => setExpanded(!expanded)}>
          {expanded ? "COLLAPSE" : "VIEW WODS"}
        </button>
      </div>

      <p style={{ margin: "0 0 10px", fontSize: "11px", color: "#bbb", lineHeight: 1.5 }}>{phase.goal}</p>

      {expanded && phase.days.map((day, i) => (
        <div key={i} style={S.wodDay}>
          <p style={S.wodDayTitle}>{day.day} — {day.focus}</p>
          {[["STRENGTH", day.strength], ["MOVEMENT", day.movement], ["CONDITIONING", day.conditioning]].map(([lbl, val]) => (
            <div key={lbl} style={S.wodRow}>
              <span style={S.wodLabel}>{lbl}</span>
              <span style={S.wodValue}>{val}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// QUESTIONNAIRE COMPONENT
// The multi-step intake questionnaire that feeds the personalization engine.
// ============================================================================

const TOTAL_Q_STEPS = 5;

function Questionnaire({ data, onChange, onComplete, onSkip }) {
  const [step, setStep] = useState(1);
  const progress = Math.round((step / TOTAL_Q_STEPS) * 100);

  const next = () => step < TOTAL_Q_STEPS ? setStep(s => s + 1) : onComplete();
  const back = () => step > 1 && setStep(s => s - 1);

  return (
    <div style={{ padding: "20px" }}>
      {/* Progress indicator */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span style={{ fontSize: "10px", color: "#777" }}>Step {step} of {TOTAL_Q_STEPS}</span>
          <span style={{ fontSize: "10px", color: C.red, fontWeight: 700 }}>{progress}% Complete</span>
        </div>
        <div style={S.progressWrap}><div style={S.progressFill(progress)} /></div>
      </div>

      {/* Step 1 — Basic profile */}
      {step === 1 && (
        <div>
          <p style={{ color: C.white, fontWeight: 700, fontSize: "15px", marginBottom: "18px" }}>
            Let's build your personalized plan.
          </p>
          <div style={{ marginBottom: "14px" }}>
            <label style={S.label}>Your Age Range</label>
            <select style={S.select} value={data.ageRange || ""} onChange={e => onChange("ageRange", e.target.value)}>
              <option value="">Select your age range</option>
              {["40-44","45-49","50-54","55-59","60-64","65+"].map(r => (
                <option key={r} value={r}>{r.replace("-"," to ")} years</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label style={S.label}>Your Region</label>
            <select style={S.select} value={data.region || ""} onChange={e => onChange("region", e.target.value)}>
              <option value="">Select your region</option>
              <option value="georgia">Georgia, USA</option>
              <option value="southern_us">Other US Southern State</option>
              <option value="other_us">Other US State</option>
              <option value="caribbean">Caribbean or Latin America</option>
              <option value="south_asian">South Asia</option>
              <option value="east_asian">East Asia</option>
              <option value="mediterranean">Mediterranean</option>
              <option value="african">Africa or African Diaspora</option>
              <option value="middle_eastern">Middle East</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 2 — Health conditions */}
      {step === 2 && (
        <div>
          <p style={{ color: C.white, fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>
            Which health conditions are you managing?
          </p>
          <p style={{ color: "#888", fontSize: "11px", marginBottom: "18px" }}>
            Select all that apply — this directly personalizes your plan.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {HEALTH_CONDITIONS.map(cond => {
              const selected = (data.conditions || []).includes(cond.id);
              return (
                <div key={cond.id} style={S.condBadge(selected)} onClick={() => {
                  const curr = data.conditions || [];
                  onChange("conditions", selected ? curr.filter(c => c !== cond.id) : [...curr, cond.id]);
                }}>
                  <span style={S.condIcon}>{cond.icon}</span>
                  <span style={S.condLabel(selected)}>{cond.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3 — Primary goal */}
      {step === 3 && (
        <div>
          <p style={{ color: C.white, fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>
            What is your primary goal?
          </p>
          <p style={{ color: "#888", fontSize: "11px", marginBottom: "18px" }}>
            Be honest — your plan is built around your actual priority.
          </p>
          {[
            { val: "fat_loss",   label: "Lose body fat and improve body composition" },
            { val: "strength",   label: "Build strength and muscle mass" },
            { val: "condition",  label: "Manage or improve a specific health condition" },
            { val: "energy",     label: "Improve energy levels and reduce fatigue" },
            { val: "mobility",   label: "Improve mobility, flexibility, and reduce pain" },
            { val: "longevity",  label: "General health and longevity — age well" }
          ].map(opt => (
            <div key={opt.val}
              style={{ ...S.condBadge(data.goal === opt.val), textAlign: "left", marginBottom: "7px" }}
              onClick={() => onChange("goal", opt.val)}>
              <span style={S.condLabel(data.goal === opt.val)}>{opt.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Step 4 — Commitment level (the qualification gate) */}
      {step === 4 && (
        <div>
          <p style={{ color: C.white, fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>
            How committed are you — right now, honestly?
          </p>
          <p style={{ color: "#888", fontSize: "11px", marginBottom: "18px" }}>
            This program is designed for people who are ready to do the work. We want to make sure it is the right fit.
          </p>
          {[
            { val: "exploring", label: "1–4: I am interested but not fully committed yet" },
            { val: "motivated",  label: "5–7: I am motivated but realistic about my limits" },
            { val: "serious",    label: "8–9: I am serious and ready to do the work" },
            { val: "all_in",     label: "10: I am fully committed and need this to work" }
          ].map(opt => (
            <div key={opt.val}
              style={{ ...S.condBadge(data.commitment === opt.val), textAlign: "left", marginBottom: "7px" }}
              onClick={() => onChange("commitment", opt.val)}>
              <span style={S.condLabel(data.commitment === opt.val)}>{opt.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Step 5 — Profile summary and plan confirmation */}
      {step === 5 && (
        <div>
          <p style={{ color: C.white, fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>
            Your personalized plan is ready.
          </p>
          <p style={{ color: "#888", fontSize: "11px", marginBottom: "18px", lineHeight: 1.6 }}>
            Based on your answers, we have customized your workout program, nutrition recommendations, and recipe library.
          </p>
          <div style={S.card}>
            <p style={{ ...S.cardTitle, color: C.red, marginBottom: "10px" }}>YOUR PROFILE SUMMARY</p>
            {[
              ["Age Range", data.ageRange || "Not specified"],
              ["Region", data.region || "Not specified"],
              ["Health Focus", (data.conditions||[]).length > 0
                ? (data.conditions||[]).map(c => HEALTH_CONDITIONS.find(h=>h.id===c)?.label).join(", ")
                : "No specific conditions"],
              ["Primary Goal", data.goal || "Not specified"],
              ["Commitment", data.commitment || "Not specified"]
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ color: "#777", fontSize: "11px" }}>{lbl}</span>
                <span style={{ color: C.white, fontSize: "11px", fontWeight: 700, textAlign: "right", maxWidth: "60%" }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={S.disclaimer}>
            ⚠️ This program is educational and does not constitute medical advice. Always consult your physician before beginning any exercise or nutrition program, especially if you have a diagnosed medical condition.
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
        {step > 1 && (
          <button style={{ ...S.btnOutline, flex: 1 }} onClick={back}>BACK</button>
        )}
        <button style={{ ...S.btn, flex: 2 }} onClick={next}>
          {step === TOTAL_Q_STEPS ? "VIEW MY PLAN →" : "CONTINUE →"}
        </button>
      </div>
      <button style={{ background: "none", border: "none", color: "#555", fontSize: "11px", cursor: "pointer", width: "100%", marginTop: "10px" }} onClick={onSkip}>
        Skip for now
      </button>
    </div>
  );
}

// ============================================================================
// SCREEN COMPONENTS
// Each screen corresponds to a main navigation tab.
// ============================================================================

function HomeScreen({ userProfile, membershipTier, onStartQuestionnaire, onUpgrade }) {
  const hasProfile = userProfile.ageRange && userProfile.goal;
  const isPremium = membershipTier === "premium";

  return (
    <div>
      {/* Fitness hero — parent brand */}
      <div style={S.hero}>
        <p style={S.heroSub}>TURNED UP FITNESS</p>
        <h1 style={S.heroTitle}>BUILT FOR 40+</h1>
        <p style={S.heroDesc}>
          A complete health and wellness system — personalized workouts,
          targeted nutrition, and a recipe library built around your body, your region, and your goals.
        </p>
        {!hasProfile && (
          <button style={{ ...S.btn, marginTop: "18px", maxWidth: "260px", display: "block", margin: "18px auto 0" }}
            onClick={onStartQuestionnaire}>
            BUILD MY PERSONALIZED PLAN
          </button>
        )}
      </div>

      {/* Active profile badge */}
      {hasProfile && (
        <div style={{ padding: "14px 16px 0" }}>
          <div style={S.cardHighlight}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ ...S.cardTitle, fontSize: "12px" }}>YOUR ACTIVE PROFILE</p>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#888" }}>
                  {userProfile.ageRange} · {userProfile.region} · {userProfile.goal}
                </p>
              </div>
              <MembershipBadge tier={membershipTier} />
            </div>
          </div>
        </div>
      )}

      {/* Kitchen premium upsell — shown to non-premium users */}
      {!isPremium && (
        <div style={{ padding: "14px 16px 0" }}>
          <div style={S.premiumCard}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "24px" }}>👨‍🍳</span>
              <div>
                <p style={{ margin: 0, color: C.gold, fontWeight: 900, fontSize: "13px" }}>TURNED UP IN THE KITCHEN</p>
                <p style={{ margin: 0, color: "#888", fontSize: "10px" }}>Premium nutrition add-on</p>
              </div>
              <span style={{ marginLeft: "auto", background: C.gold, color: C.black, fontSize: "9px", fontWeight: 900, padding: "2px 7px", borderRadius: "10px" }}>
                UPGRADE
              </span>
            </div>
            <p style={{ margin: "0 0 10px", fontSize: "11px", color: "#bbb", lineHeight: 1.5 }}>
              Unlock the full recipe library, personalized meal plans, and condition-targeted nutrition guidance.
            </p>
            <button style={{ ...S.btnPremium, fontSize: "11px", padding: "8px" }} onClick={onUpgrade}>
              ADD KITCHEN ACCESS — $34.99/mo
            </button>
          </div>
        </div>
      )}

      {/* What's included overview */}
      <div style={S.section}>
        <p style={S.sectionTitle}>WHAT IS INCLUDED</p>
        {[
          { icon: "💪", title: "12-Week Workout Program", desc: "Three phases — Foundation, Build, and Strengthen. Three days per week. Every session has modifications built in for bad knees, lower back issues, and shoulders.", premium: false },
          { icon: "🦴", title: "Health Condition Modifications", desc: "Bad knees, lower back pain, shoulder issues — each condition gets a four-week strengthening progression, safe exercise substitutions, and coaching cues.", premium: false },
          { icon: "🥗", title: "Basic Nutrition Overview", desc: "The five metabolic shifts required after 40, explained in plain English with actionable guidance.", premium: false },
          { icon: "👨‍🍳", title: "Turned Up In The Kitchen", desc: "The full recipe library, personalized meal plans, and condition-specific nutrition guidance — region-aware and built for 40+ bodies.", premium: true }
        ].map((item, i) => (
          <div key={i} style={item.premium ? S.premiumCard : S.card}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "24px" }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ ...S.cardTitle, fontSize: "13px" }}>{item.title}</p>
                  {item.premium && <span style={S.premiumTag}>PREMIUM</span>}
                </div>
                <p style={{ margin: 0, fontSize: "11px", color: "#bbb", lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkoutScreen() {
  return (
    <div>
      <div style={{ ...S.hero, padding: "22px 16px" }}>
        <p style={S.heroSub}>TURNED UP FITNESS</p>
        <h2 style={{ ...S.heroTitle, fontSize: "22px" }}>12-WEEK PROGRAM</h2>
        <p style={{ ...S.heroDesc, fontSize: "11px" }}>3 days per week · 45–60 minutes · Built for 40+ bodies</p>
      </div>

      <div style={S.section}>
        <p style={S.sectionTitle}>PROGRAM OVERVIEW</p>
        <div style={S.statRow}>
          {[["12","Weeks"],["3","Days/Wk"],["3","Phases"],["36","Sessions"]].map(([v,l]) => (
            <div key={l} style={S.stat}><span style={S.statVal}>{v}</span><span style={S.statLbl}>{l}</span></div>
          ))}
        </div>
        <p style={{ fontSize: "12px", color: "#bbb", lineHeight: 1.6, margin: "0 0 14px" }}>
          Each training session has three components — Strength builds the muscle that protects your joints, Movement develops functional patterns your daily life requires, and Conditioning builds the cardiovascular foundation that supports energy, heart health, and recovery.
        </p>
      </div>

      <div style={S.section}>
        <p style={S.sectionTitle}>ALL THREE PHASES</p>
        {WORKOUT_PHASES.map(phase => <WorkoutPhaseCard key={phase.phase} phase={phase} />)}
      </div>

      <div style={{ padding: "0 16px 20px" }}>
        <div style={S.disclaimer}>
          ⚠️ Always consult your physician before beginning this or any exercise program. If you experience pain during any exercise, stop immediately and refer to the Health Condition Modifications module.
        </div>
      </div>
    </div>
  );
}

function NutritionScreen({ userProfile, membershipTier, onUpgrade }) {
  const isPremium = membershipTier === "premium";
  const userConditions = userProfile.conditions || [];

  const conditionGuidance = {
    blood_pressure: { title: "Blood Pressure Support", eat: "Potassium-rich foods, magnesium, omega-3s, beets, dark chocolate 70%+", avoid: "Sodium above 1500mg, processed meats, canned soups, alcohol" },
    joint_health:   { title: "Joint Health Support",   eat: "Fatty fish, tart cherry juice, turmeric, ginger, bone broth, citrus", avoid: "Processed foods, refined sugars, trans fats, omega-6 seed oils" },
    blood_sugar:    { title: "Blood Sugar Management",  eat: "Cinnamon, apple cider vinegar before meals, sweet potato, legumes, berries", avoid: "White rice, white bread, sugary beverages, fruit juice" },
    weight_management:{ title: "Weight Management",    eat: "Lean proteins, non-starchy vegetables, Greek yogurt, eggs, leafy greens", avoid: "Liquid calories, processed snacks, eating after 8pm" },
    heart_health:   { title: "Heart Health Support",   eat: "Oats with beta-glucan, fatty fish, walnuts, avocado, olive oil, flaxseed", avoid: "Trans fats, sodium excess, processed red meat, refined carbohydrates" },
    bone_density:   { title: "Bone Density Support",   eat: "Dairy or fortified plant milk, sardines with bones, dark leafy greens, almonds", avoid: "Excessive caffeine, alcohol, high-sodium foods, soft drinks" }
  };

  return (
    <div>
      <div style={{ ...S.hero, padding: "22px 16px" }}>
        <p style={S.heroSub}>TURNED UP FITNESS</p>
        <h2 style={{ ...S.heroTitle, fontSize: "22px" }}>NUTRITION FOUNDATION</h2>
        <p style={{ ...S.heroDesc, fontSize: "11px" }}>Age-based · Region-specific · Condition-targeted</p>
      </div>

      {/* Free content — available to all members */}
      <div style={S.section}>
        <p style={S.sectionTitle}>THE 5 SHIFTS REQUIRED AFTER 40</p>
        {[
          { num: "01", shift: "Increase Protein", detail: "1.2 to 1.6g per kg of bodyweight daily. Protein at every single meal without exception — this is the single most impactful change you can make." },
          { num: "02", shift: "Prioritize Anti-Inflammatory Foods", detail: "Omega-3s, colorful vegetables, dark leafy greens, and berries directly reduce the chronic inflammation that drives most age-related disease." },
          { num: "03", shift: "Manage Blood Sugar Aggressively", detail: "Insulin sensitivity naturally declines after 40. Choose complex carbohydrates that release glucose slowly. Eliminate liquid sugars entirely." },
          { num: "04", shift: "Support Bone and Joint Health", detail: "Calcium plus Vitamin D plus Vitamin K2 plus Magnesium — all four working together. Calcium alone is not enough." },
          { num: "05", shift: "Optimize Gut Health", detail: "Fermented foods and high-fiber vegetables rebuild the gut microbiome diversity that naturally erodes after 40, affecting everything from immunity to mood." }
        ].map((item, i) => (
          <div key={i} style={S.card}>
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <span style={{ color: C.red, fontWeight: 900, fontSize: "18px", minWidth: "28px" }}>{item.num}</span>
              <div>
                <p style={{ ...S.cardTitle, fontSize: "13px" }}>{item.shift}</p>
                <p style={{ margin: 0, fontSize: "11px", color: "#bbb", lineHeight: 1.5 }}>{item.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Premium content gate */}
      {!isPremium ? (
        <div style={{ padding: "0 16px 20px" }}>
          <p style={S.sectionTitle}>PERSONALIZED CONDITION GUIDANCE</p>
          <PremiumGate onUpgrade={onUpgrade} />
        </div>
      ) : (
        userConditions.length > 0 && (
          <div style={S.section}>
            <p style={S.kitchenSectionTitle}>YOUR CONDITION-SPECIFIC GUIDANCE</p>
            {userConditions.map(cond => {
              const g = conditionGuidance[cond];
              if (!g) return null;
              return (
                <div key={cond} style={S.premiumCard}>
                  <p style={{ ...S.cardTitle, color: C.gold }}>{g.title}</p>
                  <p style={{ margin: "0 0 4px", color: "#4caf50", fontSize: "10px", fontWeight: 700 }}>EAT MORE</p>
                  <p style={{ margin: "0 0 8px", fontSize: "11px", color: "#bbb" }}>{g.eat}</p>
                  <p style={{ margin: "0 0 4px", color: "#ff6b6b", fontSize: "10px", fontWeight: 700 }}>REDUCE</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#bbb" }}>{g.avoid}</p>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

function KitchenScreen({ userProfile, membershipTier, onUpgrade }) {
  const isPremium = membershipTier === "premium";
  const [filter, setFilter] = useState("All");
  const userConditions = userProfile.conditions || [];
  const categories = ["All", "Breakfast", "Lunch", "Dinner"];

  if (!isPremium) {
    return (
      <div>
        <div style={S.kitchenHero}>
          <p style={S.kitchenSub}>PREMIUM ADD-ON</p>
          <h2 style={S.kitchenTitle}>TURNED UP IN THE KITCHEN</h2>
          <p style={{ ...S.heroDesc, fontSize: "11px", color: "#bbb" }}>
            The full nutrition and recipe system — personalized to your body, your region, and your health conditions.
          </p>
        </div>
        <PremiumGate onUpgrade={onUpgrade} />
      </div>
    );
  }

  // Premium users see the full Kitchen — personalization active
  const filtered = RECIPES.filter(r => filter === "All" || r.category === filter);
  // Recipes relevant to user's conditions are sorted to the top
  const sorted = [...filtered].sort((a, b) => {
    const aRel = a.conditions.some(c => userConditions.includes(c));
    const bRel = b.conditions.some(c => userConditions.includes(c));
    return aRel === bRel ? 0 : aRel ? -1 : 1;
  });

  return (
    <div>
      <div style={S.kitchenHero}>
        <p style={S.kitchenSub}>PREMIUM · TURNED UP FITNESS</p>
        <h2 style={S.kitchenTitle}>TURNED UP IN THE KITCHEN</h2>
        <p style={{ ...S.heroDesc, fontSize: "11px", color: "#bbb" }}>
          Every recipe built for the 40+ body — high protein, anti-inflammatory, and personalized to you.
        </p>
      </div>

      {/* Category filter tabs */}
      <div style={{ padding: "14px 16px 0", display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {categories.map(cat => (
          <button key={cat}
            style={{
              background: filter === cat ? C.gold : "transparent",
              color: filter === cat ? C.black : "#888",
              border: `1px solid ${filter === cat ? C.gold : "#333"}`,
              borderRadius: "4px", padding: "5px 12px",
              cursor: "pointer", fontSize: "11px", fontWeight: 700
            }}
            onClick={() => setFilter(cat)}>
            {cat}
          </button>
        ))}
      </div>

      <div style={S.section}>
        <p style={S.kitchenSectionTitle}>
          {filter === "All" ? `ALL RECIPES (${sorted.length})` : filter.toUpperCase()}
        </p>
        {sorted.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} userConditions={userConditions} />
        ))}
        <div style={{ ...S.premiumCard, textAlign: "center", marginTop: "6px" }}>
          <p style={{ margin: "0 0 4px", color: C.gold, fontWeight: 700, fontSize: "12px" }}>MORE RECIPES COMING SOON</p>
          <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>New recipes added weekly — Southern, Mediterranean, Caribbean, South Asian, and more.</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MEMBERSHIP SCREEN
// Shows all tiers and handles upgrades.
// ============================================================================

function MembershipScreen({ membershipTier, onUpgrade }) {
  return (
    <div>
      <div style={{ ...S.hero, padding: "22px 16px" }}>
        <p style={S.heroSub}>TURNED UP FITNESS</p>
        <h2 style={{ ...S.heroTitle, fontSize: "22px" }}>MEMBERSHIP PLANS</h2>
        <p style={{ ...S.heroDesc, fontSize: "11px" }}>Choose the level that fits where you are right now</p>
      </div>

      <div style={S.section}>
        {Object.values(MEMBERSHIP_TIERS).map(tier => {
          const isActive = membershipTier === tier.id;
          const isPremiumTier = tier.id === "premium";

          return (
            <div key={tier.id} style={isPremiumTier ? S.premiumCard : (isActive ? S.cardHighlight : S.card)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <p style={{ margin: 0, color: isPremiumTier ? C.gold : C.white, fontWeight: 900, fontSize: "14px" }}>
                    {tier.name}
                  </p>
                  <p style={{ margin: "2px 0 0", color: "#888", fontSize: "11px" }}>{tier.description}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, color: isPremiumTier ? C.gold : C.red, fontWeight: 900, fontSize: "16px" }}>{tier.price}</p>
                  {tier.badge && (
                    <span style={{ background: C.gold, color: C.black, fontSize: "9px", fontWeight: 900, padding: "1px 5px", borderRadius: "8px" }}>
                      {tier.badge}
                    </span>
                  )}
                </div>
              </div>

              {tier.features.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
                  <span style={{ color: isPremiumTier ? C.gold : C.red }}>✓</span>
                  <span style={{ fontSize: "11px", color: "#ddd" }}>{f}</span>
                </div>
              ))}

              <div style={{ marginTop: "12px" }}>
                {isActive ? (
                  <div style={{ textAlign: "center", padding: "8px", background: "#0d1a00", borderRadius: "6px", color: "#4caf50", fontSize: "11px", fontWeight: 700 }}>
                    ✓ YOUR CURRENT PLAN
                  </div>
                ) : (
                  <button
                    style={isPremiumTier ? S.btnPremium : S.btn}
                    onClick={() => onUpgrade(tier.id)}>
                    {tier.id === "free" ? "DOWNGRADE TO BASIC" : `UPGRADE TO ${tier.name.toUpperCase()}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <div style={S.disclaimer}>
          ⚠️ All memberships are educational in nature and do not constitute medical advice. Payment processing, subscription management, and billing will be implemented in Phase 2 of the app development.
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ROOT APP COMPONENT
// Manages global navigation state and membership tier.
// This is the top-level component that orchestrates the entire app.
// ============================================================================

export default function App() {
  // activeScreen drives the main navigation
  const [activeScreen, setActiveScreen] = useState("home");

  // showQuestionnaire controls the intake flow overlay
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  // membershipTier controls what content each user can access.
  // In Phase 2 this will come from the authenticated user's backend record.
  // Toggle between "free", "fitness", and "premium" here to test the gates.
  const [membershipTier, setMembershipTier] = useState("free");

  // userProfile stores questionnaire answers and drives personalization.
  // In Phase 2 this will be persisted to the backend database.
  const [userProfile, setUserProfile] = useState({
    ageRange: "", region: "", conditions: [], goal: "", commitment: ""
  });

  const updateProfile = (key, value) =>
    setUserProfile(prev => ({ ...prev, [key]: value }));

  const handleUpgrade = (tier) => {
    // In Phase 2 this will trigger the Stripe payment flow.
    // For now it directly updates the local state for demonstration.
    setMembershipTier(tier || "premium");
    setActiveScreen("home");
  };

  const navItems = [
    { id: "home",       label: "Home"      },
    { id: "workout",    label: "Workout"   },
    { id: "nutrition",  label: "Nutrition" },
    { id: "kitchen",    label: "Kitchen ⭐" },
    { id: "membership", label: "Plans"     }
  ];

  // The questionnaire flow takes over the full screen when active
  if (showQuestionnaire) {
    return (
      <div style={S.app}>
        <div style={S.nav}>
          <div>
            <p style={S.navBrand}>TURNED UP FITNESS</p>
            <p style={S.navSub}>BUILDING YOUR PLAN</p>
          </div>
          <button style={{ ...S.btnOutline, fontSize: "10px", padding: "4px 8px" }}
            onClick={() => setShowQuestionnaire(false)}>
            SKIP
          </button>
        </div>
        <Questionnaire
          data={userProfile}
          onChange={updateProfile}
          onComplete={() => { setShowQuestionnaire(false); setActiveScreen("home"); }}
          onSkip={() => setShowQuestionnaire(false)}
        />
      </div>
    );
  }

  return (
    <div style={S.app}>
      {/* Global navigation bar */}
      <div style={S.nav}>
        <div>
          <p style={S.navBrand}>TURNED UP FITNESS</p>
          <p style={S.navSub}>40+ WELLNESS SYSTEM</p>
        </div>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {navItems.map(item => (
            <button key={item.id} style={S.navBtn(activeScreen === item.id)}
              onClick={() => setActiveScreen(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Screen router — renders the appropriate screen based on activeScreen */}
      {activeScreen === "home" && (
        <HomeScreen
          userProfile={userProfile}
          membershipTier={membershipTier}
          onStartQuestionnaire={() => setShowQuestionnaire(true)}
          onUpgrade={() => setActiveScreen("membership")}
        />
      )}
      {activeScreen === "workout" && <WorkoutScreen />}
      {activeScreen === "nutrition" && (
        <NutritionScreen
          userProfile={userProfile}
          membershipTier={membershipTier}
          onUpgrade={() => setActiveScreen("membership")}
        />
      )}
      {activeScreen === "kitchen" && (
        <KitchenScreen
          userProfile={userProfile}
          membershipTier={membershipTier}
          onUpgrade={() => setActiveScreen("membership")}
        />
      )}
      {activeScreen === "membership" && (
        <MembershipScreen
          membershipTier={membershipTier}
          onUpgrade={handleUpgrade}
        />
      )}
    </div>
  );
}
