/**
 * MEALS OF THE WEEK — TUF Feature
 * Updated every Friday by the automated Manus task.
 * Each week: 1 Breakfast · 1 Lunch · 1 Dinner · 1 Healthy Snack
 * All meals are high-protein, macro-balanced, 40+ athlete aligned.
 */

export interface WeeklyMeal {
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  typeLabel: string;
  typeIcon: string;
  typeColor: string;
  name: string;
  description: string;
  ingredients: string[];
  macros: { calories: number; protein: number; carbs: number; fat: number };
  prepTime: string;
  image: string;
  tags: string[];
  whyItFits: string;
}

export interface MealsOfWeek {
  weekOf: string;       // ISO date of the Monday that week starts
  weekLabel: string;    // e.g. "April 21 – 27, 2026"
  meals: WeeklyMeal[];
}

// ─── Current Week (Apr 21 – 27, 2026) ────────────────────────────────────────
export const currentMealsOfWeek: MealsOfWeek = {
  weekOf: "2026-04-21",
  weekLabel: "April 21 – 27, 2026",
  meals: [
    {
      id: "motw-b-2026-04-21",
      type: "breakfast",
      typeLabel: "BREAKFAST",
      typeIcon: "🌅",
      typeColor: "#FF9500",
      name: "Ginger Salmon & Egg White Scramble",
      description: "Flaked ginger-glazed salmon over fluffy egg whites with spinach. A 40+ metabolism igniter — omega-3s, complete protein, and anti-inflammatory ginger in one pan.",
      ingredients: [
        "4 oz salmon fillet",
        "4 egg whites",
        "1 tsp fresh ginger, grated",
        "1 tsp Dijon mustard",
        "1 tsp honey",
        "1 cup fresh spinach",
        "Salt & pepper to taste",
      ],
      macros: { calories: 320, protein: 42, carbs: 8, fat: 12 },
      prepTime: "12 min",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80",
      tags: ["#omega-3", "#anti-inflammatory", "#high-protein", "#40-plus"],
      whyItFits: "Salmon provides omega-3s critical for joint health and hormone balance in athletes 40+. Egg whites add leucine-rich protein to trigger muscle protein synthesis first thing in the morning.",
    },
    {
      id: "motw-l-2026-04-21",
      type: "lunch",
      typeLabel: "LUNCH",
      typeIcon: "☀️",
      typeColor: "#00FFC6",
      name: "Spicy Garlic-Lime Chicken Bowl",
      description: "Juicy spiced chicken breast over brown rice with roasted bell peppers and avocado. Meal-prep friendly — make 4 servings Sunday and fuel your week.",
      ingredients: [
        "6 oz boneless chicken breast",
        "½ cup brown rice (cooked)",
        "1 bell pepper, sliced",
        "½ avocado",
        "2 tsp garlic powder",
        "1 tbsp lime juice",
        "¼ tsp cayenne pepper",
      ],
      macros: { calories: 480, protein: 45, carbs: 38, fat: 14 },
      prepTime: "20 min",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
      tags: ["#high-protein", "#meal-prep", "#lean", "#quick"],
      whyItFits: "Balanced macros for sustained afternoon energy. The healthy fats from avocado support testosterone production — key for 40+ male athletes. Cayenne boosts metabolism.",
    },
    {
      id: "motw-d-2026-04-21",
      type: "dinner",
      typeLabel: "DINNER",
      typeIcon: "🌙",
      typeColor: "#7B61FF",
      name: "Sesame Seared Tuna with Steamed Asparagus",
      description: "Restaurant-quality seared tuna with a sesame crust, served alongside steamed asparagus with garlic. Light, anti-inflammatory, and loaded with performance nutrients.",
      ingredients: [
        "6 oz tuna steak",
        "2 tbsp sesame seeds",
        "1 tbsp soy sauce (low sodium)",
        "1 tsp sesame oil",
        "1 bunch asparagus",
        "2 cloves garlic, minced",
        "1 tsp rice wine vinegar",
      ],
      macros: { calories: 390, protein: 48, carbs: 10, fat: 16 },
      prepTime: "15 min",
      image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=600&q=80",
      tags: ["#omega-3", "#seafood", "#anti-inflammatory", "#low-carb"],
      whyItFits: "Tuna is one of the highest protein-per-calorie foods available. Asparagus supports liver detox and reduces inflammation. Perfect recovery dinner after a hard training day.",
    },
    {
      id: "motw-s-2026-04-21",
      type: "snack",
      typeLabel: "SNACK",
      typeIcon: "⚡",
      typeColor: "#FF6600",
      name: "Almond Butter & Banana Protein Bites",
      description: "No-bake energy bites made with almond butter, banana, oats, and protein powder. 5 minutes, no cooking, 20g protein per serving.",
      ingredients: [
        "1 scoop vanilla protein powder",
        "2 tbsp almond butter",
        "½ banana, mashed",
        "¼ cup rolled oats",
        "1 tsp honey",
        "Pinch of cinnamon",
      ],
      macros: { calories: 240, protein: 22, carbs: 24, fat: 8 },
      prepTime: "5 min",
      image: "https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=600&q=80",
      tags: ["#quick", "#no-cook", "#high-protein", "#pre-workout"],
      whyItFits: "Ideal pre-workout or mid-afternoon snack. The banana provides fast-acting carbs for energy, almond butter delivers healthy fats and magnesium for muscle function, and protein powder ensures MPS support.",
    },
  ],
};

export default currentMealsOfWeek;
