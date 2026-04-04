/**
 * TURNED UP IN THE KITCHEN — 40+ WELLNESS APP
 * React Display Framework — Phase 1 (Content Display Layer)
 *
 * ARCHITECTURE OVERVIEW:
 * This is the display module only. It renders all content sections of the app
 * including the welcome screen, questionnaire, workout program, nutrition module,
 * and recipe library. Backend authentication, database, and AI personalization
 * logic will be added in Phase 2.
 *
 * PERSONALIZATION LOGIC (Phase 1 simulation):
 * The questionnaire answers are stored in local React state and passed down
 * through the component tree to simulate how the real personalization engine
 * will work. In Phase 2, this state will be replaced by API calls to the
 * backend personalization engine built from the Day 3 Nutrition Framework.
 *
 * COLOR SYSTEM:
 * Primary Red:    #C0392B
 * Black:          #0D0D0D
 * Dark Gray:      #1C1C1C
 * Mid Gray:       #707070
 * Light Gray:     #F0F0F0
 * White:          #FFFFFF
 */

import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DATA LAYER — All content lives here, separate from the UI components.
// In Phase 2 this will be replaced by API calls to the backend.
// ─────────────────────────────────────────────────────────────────────────────

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
    regions: ["all"],
    why40: "Rich in selenium, B12, and omega-3s that reduce joint inflammation. Brussels sprouts deliver antioxidants and fiber for gut health.",
    ingredients: [
      "170g scallops (6 oz) — pat completely dry before cooking",
      "2 tbsp olive oil, divided",
      "1 cup diced brussels sprouts",
      "2 tbsp rice wine vinegar",
      "Salt and pepper to taste",
      "Optional: 1/2 cup sauerkraut for gut health"
    ],
    steps: [
      { title: "Prep", detail: "Pat scallops completely dry with paper towels. Season both sides with salt and pepper. This step is critical — moisture prevents the sear." },
      { title: "Cook Brussels Sprouts", detail: "Heat 1 tbsp olive oil until shimmering. Add sprouts, season, cook stirring for 5 to 6 minutes until golden and tender-crisp." },
      { title: "Deglaze", detail: "Add rice wine vinegar and scrape up brown bits from the pan. Transfer sprouts to a plate." },
      { title: "Sear Scallops", detail: "Heat remaining oil until shimmering. Place scallops flat side down — do not move for 2 to 3 minutes until a golden crust forms." },
      { title: "Finish and Plate", detail: "Flip scallops, cook 2 more minutes. Arrange over brussels sprouts. Serve immediately." }
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
    regions: ["southern_us", "east_asian"],
    why40: "Cabbage provides vitamin K for bone density. Kerry Gold butter supplies healthy fats. Bragg's Liquid Aminos is lower sodium than soy sauce — better for blood pressure management.",
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
      { title: "Prep Everything First", detail: "Shred pork, chop celery, shred cabbage, chop onion. Having everything ready before you start is essential for this fast-cooking dish." },
      { title: "Heat Butter", detail: "Heat Kerry Gold butter until bubbly and hot. Fully melted and beginning to foam before adding anything." },
      { title: "Cook Celery", detail: "Add celery and cook for exactly 1 minute, stirring. This head start ensures everything finishes at the same time." },
      { title: "Add Cabbage and Onion", detail: "Fry while stirring continuously until tender-crisp, about 2 to 3 minutes. You want texture, not mush." },
      { title: "Add Pork and Season", detail: "Add pork, pour in Bragg's, add salt. Stir thoroughly. Cook 1 minute longer then remove from heat. Serve hot." }
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
    regions: ["all"],
    why40: "Almonds deliver vitamin E, magnesium, and healthy fats. Greek yogurt adds probiotics and calcium for bone density. Lemon supports collagen production for joint and skin health.",
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
      { title: "Preheat and Season", detail: "Preheat oven to 400°F. Coat chicken with lemon pepper, sea salt, and olive oil. Ensure every surface is covered." },
      { title: "Roast Chicken", detail: "Roast 20 to 25 minutes until internal temperature reaches 165°F. Rest 5 minutes before cutting — this locks in the juices." },
      { title: "Toast Almonds", detail: "Heat olive oil over medium-low heat. Add almonds and stir constantly for 4 to 5 minutes until golden. Watch carefully — they burn quickly. Let cool completely." },
      { title: "Combine", detail: "Slice chicken. Add chicken, almonds, lemon juice, green onion, and parsley to a bowl. Stir to combine." },
      { title: "Fold in Yogurt", detail: "Add greek yogurt and fold gently until every piece is moistened. Season with additional salt and pepper if desired. Serve immediately or refrigerate up to 2 days." }
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
    tags: ["High Protein", "Clean Fats", "Quick Prep"],
    conditions: ["blood_sugar", "weight_management"],
    regions: ["southern_us", "all"],
    why40: "Spinach provides iron, folate, and vitamin K. Stevia keeps the dressing sugar-free — critical for blood sugar management. Olive oil supports cardiovascular health.",
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
      { title: "Cook Chicken", detail: "Season and grill or bake at 400°F for 18 to 20 minutes. Rest 5 minutes then slice or dice." },
      { title: "Make Dressing", detail: "Whisk mustard, olive oil, and stevia until thoroughly combined and slightly thickened." },
      { title: "Build Salad", detail: "Place spinach in a large bowl. Add tomatoes and red onion on top." },
      { title: "Add Chicken", detail: "Place warm sliced chicken on top of the greens. The warmth slightly wilts the spinach in a good way." },
      { title: "Dress and Serve", detail: "Pour dressing over the bowl. Toss gently to coat. Serve immediately — best enjoyed fresh." }
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
    regions: ["all"],
    why40: "Egg whites are pure protein with virtually zero fat. Sweet potato releases energy slowly preventing blood sugar spikes. Cinnamon actively improves insulin sensitivity — a metabolically smart breakfast.",
    ingredients: [
      "1 and 1/4 cup egg whites",
      "Handful of fresh spinach, torn into pieces",
      "2/3 cup raw chopped sweet potato",
      "Pico de gallo to taste",
      "Dash of cinnamon",
      "2 stevia packets",
      "Cooking spray"
    ],
    steps: [
      { title: "Cook Sweet Potato", detail: "Place chopped sweet potato in microwavable bowl. Poke holes with a fork. Spray with cooking spray. Microwave on potato setting — count as 1 potato. Should be fork-tender." },
      { title: "Sauté Spinach", detail: "Bring cooking-sprayed skillet to medium heat. Add torn spinach and sauté until wilted, about 2 to 3 minutes." },
      { title: "Add Egg Whites", detail: "Pour egg whites directly over the spinach. Spread evenly. Let the bottom set before moving — about 3 to 4 minutes." },
      { title: "Flip and Finish", detail: "When edges look set and center is mostly cooked, flip carefully. Cook 1 to 2 more minutes until fully done with no runny whites." },
      { title: "Top and Serve", detail: "Top omelet with pico de gallo. Top sweet potato with cinnamon and 2 stevia packets. Serve immediately alongside each other." }
    ],
    videoSearch: "Egg White Omelet Spinach Healthy Breakfast Fit Men Cook"
  }
];

const WORKOUT_PHASES = [
  {
    phase: 1,
    name: "Foundation",
    weeks: "1 through 4",
    goal: "Learn to move correctly — quality above everything else",
    color: "#C0392B",
    days: [
      { day: "Day 1", focus: "Push and Core", strength: "Wall Push-Ups 3x12", movement: "Knee Plank 3x20 sec", conditioning: "10-minute walk" },
      { day: "Day 2", focus: "Hinge and Pull", strength: "Glute Bridge 3x15", movement: "Band Row 3x10", conditioning: "5-min walk, rest 2 min, 5-min walk" },
      { day: "Day 3", focus: "Squat and Carry", strength: "High Box Squat 3x10", movement: "Farmer Carry 3x30 sec", conditioning: "8-minute continuous walk" }
    ]
  },
  {
    phase: 2,
    name: "Build",
    weeks: "5 through 8",
    goal: "Add progressive load — same perfect patterns, more challenge",
    color: "#1C1C1C",
    days: [
      { day: "Day 1", focus: "Push, Core, and Shoulder", strength: "Push-Ups 3x10", movement: "Plank 3x40 sec", conditioning: "3 rounds: 5-min brisk walk, 2-min rest" },
      { day: "Day 2", focus: "Hinge and Pull", strength: "Romanian Deadlift 3x12", movement: "Dumbbell Row 3x10 each side", conditioning: "Interval walk: 20 min alternating 2 min brisk, 1 min easy" },
      { day: "Day 3", focus: "Squat, Carry, and Full Body", strength: "Goblet Squat 3x12", movement: "Farmer Carry 3x50 sec", conditioning: "2 rounds: 8-min brisk walk, 2-min rest" }
    ]
  },
  {
    phase: 3,
    name: "Strengthen",
    weeks: "9 through 12",
    goal: "Push toward your true capacity — measure your progress",
    color: "#C0392B",
    days: [
      { day: "Day 1", focus: "Push, Pull, and Core", strength: "Push-Up to Row Superset: 10 + 10", movement: "Plank to Down Dog 3x8", conditioning: "40-minute walk" },
      { day: "Day 2", focus: "Hinge and Single Leg", strength: "Romanian Deadlift 4x10", movement: "Reverse Lunge 3x10 each leg", conditioning: "5 rounds: 3-min brisk, 90-sec easy" },
      { day: "Day 3", focus: "Full Body Strength", strength: "Goblet Squat 4x12 (3 sec tempo)", movement: "Farmer Carry 4x60 sec", conditioning: "3 rounds: 8-min brisk, 1-min fast" }
    ]
  }
];

const HEALTH_CONDITIONS = [
  { id: "blood_pressure", label: "Blood Pressure", icon: "🫀" },
  { id: "joint_health", label: "Joint Health", icon: "🦴" },
  { id: "blood_sugar", label: "Blood Sugar", icon: "🩸" },
  { id: "weight_management", label: "Weight Management", icon: "⚖️" },
  { id: "heart_health", label: "Heart Health", icon: "❤️" },
  { id: "bone_density", label: "Bone Density", icon: "💪" }
];

// ─────────────────────────────────────────────────────────────────────────────
// STYLE SYSTEM — Inline styles that match the brand's red/black/white/gray scheme
// ─────────────────────────────────────────────────────────────────────────────

const styles = {
  app: { minHeight: "100vh", background: "linear-gradient(180deg, #1a0000 0%, #0d0d0d 50%, #1a1a1a 100%)", color: "#e0e0e0", fontFamily: "'Helvetica Neue', Arial, sans-serif" },
  nav: { background: "#0d0d0d", borderBottom: "3px solid #C0392B", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 },
  navBrand: { color: "#fff", fontWeight: "900", fontSize: "16px", letterSpacing: "1px" },
  navSub: { color: "#C0392B", fontSize: "11px", fontWeight: "700", letterSpacing: "2px" },
  navBtn: (active) => ({ background: active ? "#C0392B" : "transparent", color: active ? "#fff" : "#999", border: "1px solid " + (active ? "#C0392B" : "#333"), borderRadius: "4px", padding: "6px 14px", cursor: "pointer", fontSize: "12px", fontWeight: "600", transition: "all 0.2s" }),
  hero: { background: "linear-gradient(135deg, #1a0000 0%, #0d0d0d 100%)", borderBottom: "3px solid #C0392B", padding: "40px 20px", textAlign: "center" },
  heroTitle: { fontSize: "32px", fontWeight: "900", color: "#fff", margin: "0 0 8px 0", letterSpacing: "2px" },
  heroSub: { fontSize: "14px", color: "#C0392B", fontWeight: "700", letterSpacing: "3px", margin: "0 0 16px 0" },
  heroDesc: { fontSize: "14px", color: "#bbb", maxWidth: "500px", margin: "0 auto", lineHeight: "1.6" },
  section: { padding: "24px 20px" },
  sectionTitle: { color: "#C0392B", fontSize: "13px", fontWeight: "700", letterSpacing: "2px", margin: "0 0 16px 0", paddingBottom: "8px", borderBottom: "1px solid #2c2c2c" },
  card: { background: "#1c1c1c", border: "1px solid #2c2c2c", borderRadius: "8px", padding: "16px", marginBottom: "12px" },
  cardTitle: { color: "#fff", fontWeight: "700", fontSize: "15px", margin: "0 0 6px 0" },
  cardSub: { color: "#999", fontSize: "12px", margin: "0 0 12px 0" },
  tag: { display: "inline-block", background: "#2c0000", color: "#C0392B", border: "1px solid #C0392B", borderRadius: "12px", padding: "2px 10px", fontSize: "11px", fontWeight: "600", marginRight: "6px", marginBottom: "6px" },
  statRow: { display: "flex", gap: "8px", marginBottom: "12px" },
  stat: { flex: 1, background: "#0d0d0d", border: "1px solid #2c2c2c", borderRadius: "6px", padding: "8px", textAlign: "center" },
  statVal: { color: "#C0392B", fontWeight: "700", fontSize: "16px", display: "block" },
  statLbl: { color: "#777", fontSize: "10px", display: "block" },
  btn: { background: "#C0392B", color: "#fff", border: "none", borderRadius: "6px", padding: "10px 20px", cursor: "pointer", fontWeight: "700", fontSize: "13px", width: "100%", letterSpacing: "1px" },
  btnOutline: { background: "transparent", color: "#C0392B", border: "2px solid #C0392B", borderRadius: "6px", padding: "8px 16px", cursor: "pointer", fontWeight: "700", fontSize: "12px", letterSpacing: "1px" },
  stepItem: { display: "flex", gap: "12px", marginBottom: "12px", alignItems: "flex-start" },
  stepNum: { minWidth: "24px", height: "24px", background: "#C0392B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#fff" },
  stepText: { fontSize: "13px", color: "#ddd", lineHeight: "1.5" },
  stepLabel: { color: "#C0392B", fontWeight: "700", fontSize: "12px", marginBottom: "2px" },
  input: { width: "100%", background: "#1c1c1c", border: "1px solid #333", borderRadius: "6px", padding: "10px", color: "#e0e0e0", fontSize: "13px", boxSizing: "border-box" },
  select: { width: "100%", background: "#1c1c1c", border: "1px solid #333", borderRadius: "6px", padding: "10px", color: "#e0e0e0", fontSize: "13px", appearance: "none" },
  label: { color: "#bbb", fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px", letterSpacing: "0.5px" },
  phaseCard: (color) => ({ background: "#1c1c1c", borderLeft: "4px solid " + color, borderRadius: "8px", padding: "16px", marginBottom: "12px" }),
  workoutDay: { background: "#0d0d0d", borderRadius: "6px", padding: "12px", marginBottom: "8px" },
  workoutDayTitle: { color: "#C0392B", fontWeight: "700", fontSize: "12px", letterSpacing: "1px", marginBottom: "8px" },
  workoutRow: { display: "flex", justifyContent: "space-between", marginBottom: "4px" },
  workoutLabel: { color: "#777", fontSize: "11px", minWidth: "100px" },
  workoutValue: { color: "#ddd", fontSize: "11px", textAlign: "right", flex: 1 },
  conditionBadge: (selected) => ({ background: selected ? "#2c0000" : "#1c1c1c", border: "1px solid " + (selected ? "#C0392B" : "#333"), borderRadius: "8px", padding: "10px 12px", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }),
  conditionIcon: { fontSize: "20px", display: "block", marginBottom: "4px" },
  conditionLabel: (selected) => ({ fontSize: "11px", color: selected ? "#C0392B" : "#777", fontWeight: "600" }),
  progressBar: (pct) => ({ height: "4px", background: "#2c2c2c", borderRadius: "2px", overflow: "hidden", position: "relative" }),
  progressFill: (pct) => ({ height: "100%", background: "#C0392B", width: pct + "%", borderRadius: "2px", transition: "width 0.5s ease" }),
  disclaimer: { background: "#1a1200", border: "1px solid #996600", borderRadius: "6px", padding: "12px", fontSize: "11px", color: "#ccaa00", lineHeight: "1.5", marginTop: "16px" }
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * RecipeCard — displays a single recipe with expandable steps.
 * The isRelevant prop will be driven by the personalization engine in Phase 2.
 */
function RecipeCard({ recipe, isRelevant }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ ...styles.card, borderColor: isRelevant ? "#C0392B" : "#2c2c2c" }}>
      {isRelevant && (
        <div style={{ background: "#2c0000", color: "#C0392B", fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "4px", display: "inline-block", marginBottom: "8px", letterSpacing: "1px" }}>
          RECOMMENDED FOR YOU
        </div>
      )}
      <p style={styles.cardTitle}>{recipe.title}</p>
      <p style={styles.cardSub}>{recipe.category}</p>

      <div style={styles.statRow}>
        <div style={styles.stat}><span style={styles.statVal}>{recipe.protein}</span><span style={styles.statLbl}>Protein</span></div>
        <div style={styles.stat}><span style={styles.statVal}>{recipe.calories}</span><span style={styles.statLbl}>Calories</span></div>
        <div style={styles.stat}><span style={styles.statVal}>{recipe.prepTime}</span><span style={styles.statLbl}>Prep</span></div>
        <div style={styles.stat}><span style={styles.statVal}>{recipe.cookTime}</span><span style={styles.statLbl}>Cook</span></div>
      </div>

      <div style={{ marginBottom: "12px" }}>
        {recipe.tags.map(tag => <span key={tag} style={styles.tag}>{tag}</span>)}
      </div>

      <div style={{ background: "#0d0d0d", borderRadius: "6px", padding: "10px", marginBottom: "12px", borderLeft: "3px solid #C0392B" }}>
        <p style={{ margin: 0, fontSize: "12px", color: "#bbb", lineHeight: "1.5" }}>
          <span style={{ color: "#C0392B", fontWeight: "700" }}>WHY THIS WORKS FOR 40+: </span>
          {recipe.why40}
        </p>
      </div>

      <button style={styles.btnOutline} onClick={() => setExpanded(!expanded)}>
        {expanded ? "HIDE DETAILS" : "VIEW RECIPE"}
      </button>

      {expanded && (
        <div style={{ marginTop: "16px" }}>
          <p style={{ ...styles.sectionTitle, fontSize: "11px" }}>INGREDIENTS</p>
          {recipe.ingredients.map((ing, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
              <span style={{ color: "#C0392B", minWidth: "8px" }}>•</span>
              <span style={{ fontSize: "12px", color: "#ddd" }}>{ing}</span>
            </div>
          ))}

          <p style={{ ...styles.sectionTitle, fontSize: "11px", marginTop: "16px" }}>STEP-BY-STEP</p>
          {recipe.steps.map((step, i) => (
            <div key={i} style={styles.stepItem}>
              <div style={styles.stepNum}>{i + 1}</div>
              <div>
                <div style={styles.stepLabel}>STEP {i + 1}: {step.title.toUpperCase()}</div>
                <div style={styles.stepText}>{step.detail}</div>
              </div>
            </div>
          ))}

          <div style={{ background: "#0a1a0a", border: "1px solid #2e7d32", borderRadius: "6px", padding: "10px", marginTop: "12px" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#4fc3f7" }}>
              <span style={{ fontWeight: "700" }}>VIDEO TUTORIAL: </span>
              Search YouTube: "{recipe.videoSearch}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * WorkoutPhaseCard — displays a training phase with all three WODs.
 * Week number will be driven by user progress tracking in Phase 2.
 */
function WorkoutPhaseCard({ phase }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={styles.phaseCard(phase.color)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div>
          <p style={{ margin: 0, color: "#C0392B", fontSize: "11px", fontWeight: "700", letterSpacing: "2px" }}>
            PHASE {phase.phase}
          </p>
          <p style={{ margin: "2px 0 0 0", color: "#fff", fontWeight: "700", fontSize: "16px" }}>{phase.name}</p>
          <p style={{ margin: "2px 0 0 0", color: "#999", fontSize: "11px" }}>Weeks {phase.weeks}</p>
        </div>
        <button style={{ ...styles.btnOutline, width: "auto" }} onClick={() => setExpanded(!expanded)}>
          {expanded ? "COLLAPSE" : "VIEW WORKOUTS"}
        </button>
      </div>

      <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#bbb", lineHeight: "1.5" }}>{phase.goal}</p>

      {expanded && phase.days.map((day, i) => (
        <div key={i} style={styles.workoutDay}>
          <p style={styles.workoutDayTitle}>{day.day} — {day.focus}</p>
          <div style={styles.workoutRow}>
            <span style={styles.workoutLabel}>STRENGTH</span>
            <span style={styles.workoutValue}>{day.strength}</span>
          </div>
          <div style={styles.workoutRow}>
            <span style={styles.workoutLabel}>MOVEMENT</span>
            <span style={styles.workoutValue}>{day.movement}</span>
          </div>
          <div style={styles.workoutRow}>
            <span style={styles.workoutLabel}>CONDITIONING</span>
            <span style={styles.workoutValue}>{day.conditioning}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * QuestionnaireStep — a single step in the multi-step intake questionnaire.
 * In Phase 2, the answers feed into the personalization engine.
 */
function QuestionnaireStep({ step, totalSteps, data, onChange, onNext, onBack }) {
  const progress = Math.round(((step) / totalSteps) * 100);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", color: "#777" }}>Step {step} of {totalSteps}</span>
          <span style={{ fontSize: "11px", color: "#C0392B", fontWeight: "700" }}>{progress}% Complete</span>
        </div>
        <div style={styles.progressBar(progress)}>
          <div style={styles.progressFill(progress)} />
        </div>
      </div>

      {step === 1 && (
        <div>
          <p style={{ color: "#fff", fontWeight: "700", fontSize: "16px", marginBottom: "20px" }}>
            Let's build your personalized plan. First — tell us about yourself.
          </p>
          <div style={{ marginBottom: "16px" }}>
            <label style={styles.label}>Your Age Range</label>
            <select style={styles.select} value={data.ageRange || ""} onChange={e => onChange("ageRange", e.target.value)}>
              <option value="">Select your age range</option>
              <option value="40-44">40 to 44</option>
              <option value="45-49">45 to 49</option>
              <option value="50-54">50 to 54</option>
              <option value="55-59">55 to 59</option>
              <option value="60-64">60 to 64</option>
              <option value="65+">65 and above</option>
            </select>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={styles.label}>Your Region</label>
            <select style={styles.select} value={data.region || ""} onChange={e => onChange("region", e.target.value)}>
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

      {step === 2 && (
        <div>
          <p style={{ color: "#fff", fontWeight: "700", fontSize: "16px", marginBottom: "8px" }}>
            Which health conditions are you currently managing?
          </p>
          <p style={{ color: "#999", fontSize: "12px", marginBottom: "20px" }}>
            Select all that apply. This directly shapes your personalized plan.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {HEALTH_CONDITIONS.map(cond => {
              const selected = (data.conditions || []).includes(cond.id);
              return (
                <div key={cond.id} style={styles.conditionBadge(selected)} onClick={() => {
                  const current = data.conditions || [];
                  const updated = selected ? current.filter(c => c !== cond.id) : [...current, cond.id];
                  onChange("conditions", updated);
                }}>
                  <span style={styles.conditionIcon}>{cond.icon}</span>
                  <span style={styles.conditionLabel(selected)}>{cond.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <p style={{ color: "#fff", fontWeight: "700", fontSize: "16px", marginBottom: "8px" }}>
            What is your primary goal?
          </p>
          <p style={{ color: "#999", fontSize: "12px", marginBottom: "20px" }}>
            Be honest — your plan works best when it is built around your actual priority.
          </p>
          {[
            { val: "fat_loss", label: "Lose body fat and improve body composition" },
            { val: "strength", label: "Build strength and muscle mass" },
            { val: "condition", label: "Manage or improve a specific health condition" },
            { val: "energy", label: "Improve energy levels and reduce fatigue" },
            { val: "mobility", label: "Improve mobility, flexibility, and reduce pain" },
            { val: "longevity", label: "General health and longevity — I want to age well" }
          ].map(opt => (
            <div key={opt.val} style={{ ...styles.conditionBadge(data.goal === opt.val), marginBottom: "8px", textAlign: "left" }}
              onClick={() => onChange("goal", opt.val)}>
              <span style={styles.conditionLabel(data.goal === opt.val)}>{opt.label}</span>
            </div>
          ))}
        </div>
      )}

      {step === 4 && (
        <div>
          <p style={{ color: "#fff", fontWeight: "700", fontSize: "16px", marginBottom: "8px" }}>
            How committed are you — right now, honestly?
          </p>
          <p style={{ color: "#999", fontSize: "12px", marginBottom: "20px" }}>
            This program requires consistent effort. We want people who are ready.
          </p>
          {[
            { val: "exploring", label: "1-4: I am interested but not fully committed yet" },
            { val: "motivated", label: "5-7: I am motivated but realistic about my limitations" },
            { val: "serious", label: "8-9: I am serious and ready to do the work" },
            { val: "all_in", label: "10: I am fully committed and need this to work" }
          ].map(opt => (
            <div key={opt.val} style={{ ...styles.conditionBadge(data.commitment === opt.val), marginBottom: "8px", textAlign: "left" }}
              onClick={() => onChange("commitment", opt.val)}>
              <span style={styles.conditionLabel(data.commitment === opt.val)}>{opt.label}</span>
            </div>
          ))}
        </div>
      )}

      {step === 5 && (
        <div>
          <p style={{ color: "#fff", fontWeight: "700", fontSize: "16px", marginBottom: "8px" }}>
            Your personalized plan is ready.
          </p>
          <p style={{ color: "#999", fontSize: "12px", marginBottom: "20px", lineHeight: "1.6" }}>
            Based on your answers, we have customized your workout program, nutrition recommendations, and recipe library. Here is your profile summary.
          </p>

          <div style={styles.card}>
            <p style={{ ...styles.cardTitle, color: "#C0392B" }}>YOUR PROFILE</p>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ color: "#777", fontSize: "11px" }}>Age Range: </span>
              <span style={{ color: "#fff", fontSize: "11px", fontWeight: "700" }}>{data.ageRange || "Not specified"}</span>
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ color: "#777", fontSize: "11px" }}>Region: </span>
              <span style={{ color: "#fff", fontSize: "11px", fontWeight: "700" }}>{data.region || "Not specified"}</span>
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ color: "#777", fontSize: "11px" }}>Health Focus: </span>
              <span style={{ color: "#fff", fontSize: "11px", fontWeight: "700" }}>
                {(data.conditions || []).length > 0
                  ? (data.conditions || []).map(c => HEALTH_CONDITIONS.find(h => h.id === c)?.label).join(", ")
                  : "No specific conditions"}
              </span>
            </div>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ color: "#777", fontSize: "11px" }}>Primary Goal: </span>
              <span style={{ color: "#fff", fontSize: "11px", fontWeight: "700" }}>{data.goal || "Not specified"}</span>
            </div>
            <div>
              <span style={{ color: "#777", fontSize: "11px" }}>Commitment Level: </span>
              <span style={{ color: "#C0392B", fontSize: "11px", fontWeight: "700" }}>{data.commitment || "Not specified"}</span>
            </div>
          </div>

          <div style={styles.disclaimer}>
            ⚠️ This program is educational and does not constitute medical advice. Always consult your physician before beginning any exercise or nutrition program, especially if you have a diagnosed condition.
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        {step > 1 && (
          <button style={{ ...styles.btnOutline, flex: 1 }} onClick={onBack}>BACK</button>
        )}
        <button style={{ ...styles.btn, flex: 2 }} onClick={onNext}>
          {step === totalSteps ? "VIEW MY PLAN" : "CONTINUE"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN COMPONENTS — Each screen corresponds to a main navigation tab
// ─────────────────────────────────────────────────────────────────────────────

function HomeScreen({ userProfile, onStartQuestionnaire }) {
  const hasProfile = userProfile.ageRange && userProfile.goal;

  return (
    <div>
      <div style={styles.hero}>
        <p style={{ ...styles.navSub, marginBottom: "8px" }}>TURNED UP IN THE KITCHEN</p>
        <h1 style={styles.heroTitle}>HEALTHY FOR 40+</h1>
        <p style={styles.heroDesc}>
          A complete health and wellness system built specifically for the 40+ body —
          personalized workouts, targeted nutrition, and recipes that fit your life.
        </p>
        {!hasProfile && (
          <button style={{ ...styles.btn, marginTop: "20px", maxWidth: "280px", display: "block", margin: "20px auto 0" }} onClick={onStartQuestionnaire}>
            BUILD MY PERSONALIZED PLAN
          </button>
        )}
      </div>

      <div style={styles.section}>
        <p style={styles.sectionTitle}>WHAT IS INCLUDED</p>
        {[
          { icon: "💪", title: "12-Week Workout Program", desc: "Three phases — Foundation, Build, and Strengthen. Three days per week. Built for the 40+ beginner body with modifications for every condition." },
          { icon: "🥗", title: "Personalized Nutrition", desc: "Age-based, region-specific food recommendations tied to your health conditions. The same foods your culture knows, made smarter." },
          { icon: "👨‍🍳", title: "Recipe Library", desc: "Every recipe is designed for the 40+ body — high protein, anti-inflammatory, blood sugar friendly, and genuinely delicious." },
          { icon: "🩺", title: "Health Condition Modifications", desc: "Bad knees, lower back pain, shoulder issues — every exercise has a safe alternative with a four-week progression back to full strength." }
        ].map((item, i) => (
          <div key={i} style={styles.card}>
            <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "28px" }}>{item.icon}</span>
              <div>
                <p style={styles.cardTitle}>{item.title}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#bbb", lineHeight: "1.5" }}>{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasProfile && (
        <div style={styles.section}>
          <p style={styles.sectionTitle}>YOUR PERSONALIZED RECOMMENDATIONS</p>
          <div style={styles.card}>
            <p style={{ ...styles.cardTitle, color: "#C0392B" }}>ACTIVE PROFILE</p>
            <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#bbb" }}>Age: {userProfile.ageRange} · Region: {userProfile.region} · Goal: {userProfile.goal}</p>
            <p style={{ margin: 0, fontSize: "11px", color: "#777" }}>
              {(userProfile.conditions || []).length > 0
                ? "Health Focus: " + (userProfile.conditions || []).map(c => HEALTH_CONDITIONS.find(h => h.id === c)?.label).join(", ")
                : "No specific health conditions selected"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function WorkoutScreen() {
  return (
    <div>
      <div style={{ ...styles.hero, padding: "24px 20px" }}>
        <p style={{ ...styles.navSub, marginBottom: "4px" }}>12-WEEK PROGRAM</p>
        <h2 style={{ ...styles.heroTitle, fontSize: "24px" }}>YOUR WORKOUT PLAN</h2>
        <p style={{ ...styles.heroDesc, fontSize: "12px" }}>3 days per week · 45 to 60 minutes · Built for 40+ bodies</p>
      </div>

      <div style={styles.section}>
        <p style={styles.sectionTitle}>PROGRAM OVERVIEW</p>
        <div style={styles.statRow}>
          <div style={styles.stat}><span style={styles.statVal}>12</span><span style={styles.statLbl}>Weeks</span></div>
          <div style={styles.stat}><span style={styles.statVal}>3</span><span style={styles.statLbl}>Days/Week</span></div>
          <div style={styles.stat}><span style={styles.statVal}>3</span><span style={styles.statLbl}>Phases</span></div>
          <div style={styles.stat}><span style={styles.statVal}>36</span><span style={styles.statLbl}>Workouts</span></div>
        </div>
      </div>

      <div style={styles.section}>
        <p style={styles.sectionTitle}>ALL THREE PHASES</p>
        {WORKOUT_PHASES.map(phase => <WorkoutPhaseCard key={phase.phase} phase={phase} />)}
      </div>

      <div style={{ padding: "0 20px 24px" }}>
        <div style={styles.disclaimer}>
          ⚠️ Always consult your physician before beginning this or any exercise program. If you experience pain during any exercise, stop and refer to the Health Condition Modifications module.
        </div>
      </div>
    </div>
  );
}

function NutritionScreen({ userProfile }) {
  const userConditions = userProfile.conditions || [];

  const conditionGuidance = {
    blood_pressure: { title: "Blood Pressure Support", eat: "Potassium-rich foods, magnesium, omega-3s, beets, dark chocolate 70%+", avoid: "Sodium above 1500mg, processed meats, canned soups" },
    joint_health: { title: "Joint Health Support", eat: "Fatty fish, tart cherry juice, turmeric, ginger, bone broth, citrus", avoid: "Processed foods, refined sugars, trans fats, omega-6 seed oils" },
    blood_sugar: { title: "Blood Sugar Management", eat: "Cinnamon, apple cider vinegar before meals, sweet potato, legumes, berries", avoid: "White rice, white bread, sugary beverages, fruit juice, alcohol" },
    weight_management: { title: "Weight Management", eat: "Lean proteins, non-starchy vegetables, Greek yogurt, eggs, leafy greens", avoid: "Liquid calories, processed snacks, eating past 8pm" },
    heart_health: { title: "Heart Health Support", eat: "Oats with beta-glucan, fatty fish, walnuts, avocado, olive oil, flaxseed", avoid: "Trans fats, sodium excess, processed red meat, refined carbohydrates" },
    bone_density: { title: "Bone Density Support", eat: "Dairy or fortified plant milk, sardines with bones, dark leafy greens, almonds", avoid: "Excessive caffeine, alcohol, high-sodium foods, soft drinks" }
  };

  return (
    <div>
      <div style={{ ...styles.hero, padding: "24px 20px" }}>
        <p style={{ ...styles.navSub, marginBottom: "4px" }}>NUTRITION FRAMEWORK</p>
        <h2 style={{ ...styles.heroTitle, fontSize: "24px" }}>YOUR NUTRITION PLAN</h2>
        <p style={{ ...styles.heroDesc, fontSize: "12px" }}>Age-based · Region-specific · Condition-targeted</p>
      </div>

      <div style={styles.section}>
        <p style={styles.sectionTitle}>THE 5 SHIFTS REQUIRED AFTER 40</p>
        {[
          { num: "01", shift: "Increase Protein", detail: "1.2 to 1.6g per kg of bodyweight daily — protein at every single meal without exception." },
          { num: "02", shift: "Prioritize Anti-Inflammatory Foods", detail: "Omega-3s, colorful vegetables, dark leafy greens, and berries reduce the chronic inflammation that drives aging." },
          { num: "03", shift: "Manage Blood Sugar Aggressively", detail: "Choose complex carbohydrates that release glucose slowly. Eliminate liquid sugars entirely." },
          { num: "04", shift: "Support Bone and Joint Health", detail: "Calcium + Vitamin D + Vitamin K2 + Magnesium working together — not calcium alone." },
          { num: "05", shift: "Optimize Gut Health", detail: "Fermented foods and high-fiber vegetables rebuild the gut microbiome diversity that erodes after 40." }
        ].map((item, i) => (
          <div key={i} style={styles.card}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <span style={{ color: "#C0392B", fontWeight: "900", fontSize: "20px", minWidth: "30px" }}>{item.num}</span>
              <div>
                <p style={styles.cardTitle}>{item.shift}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#bbb", lineHeight: "1.5" }}>{item.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {userConditions.length > 0 && (
        <div style={styles.section}>
          <p style={styles.sectionTitle}>YOUR CONDITION-SPECIFIC GUIDANCE</p>
          {userConditions.map(cond => {
            const guidance = conditionGuidance[cond];
            if (!guidance) return null;
            return (
              <div key={cond} style={{ ...styles.card, borderColor: "#C0392B" }}>
                <p style={{ ...styles.cardTitle, color: "#C0392B" }}>{guidance.title}</p>
                <div style={{ marginBottom: "8px" }}>
                  <p style={{ margin: "0 0 4px 0", color: "#4caf50", fontSize: "11px", fontWeight: "700" }}>EAT MORE</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#bbb" }}>{guidance.eat}</p>
                </div>
                <div>
                  <p style={{ margin: "0 0 4px 0", color: "#ff6b6b", fontSize: "11px", fontWeight: "700" }}>REDUCE</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#bbb" }}>{guidance.avoid}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ padding: "0 20px 24px" }}>
        <div style={styles.disclaimer}>
          ⚠️ This nutrition guidance is educational and does not substitute for advice from a registered dietitian or physician. Users with diagnosed conditions should seek professional guidance before making significant dietary changes.
        </div>
      </div>
    </div>
  );
}

function RecipesScreen({ userProfile }) {
  const [filter, setFilter] = useState("All");
  const userConditions = userProfile.conditions || [];

  const categories = ["All", "Breakfast", "Lunch", "Dinner"];

  const filtered = RECIPES.filter(r =>
    filter === "All" || r.category === filter
  );

  // Personalization — recipes relevant to user's conditions rise to the top.
  // This simulates the Phase 2 AI recommendation engine.
  const sorted = [...filtered].sort((a, b) => {
    const aRelevant = a.conditions.some(c => userConditions.includes(c));
    const bRelevant = b.conditions.some(c => userConditions.includes(c));
    if (aRelevant && !bRelevant) return -1;
    if (!aRelevant && bRelevant) return 1;
    return 0;
  });

  return (
    <div>
      <div style={{ ...styles.hero, padding: "24px 20px" }}>
        <p style={{ ...styles.navSub, marginBottom: "4px" }}>RECIPE LIBRARY</p>
        <h2 style={{ ...styles.heroTitle, fontSize: "24px" }}>TURNED UP IN THE KITCHEN</h2>
        <p style={{ ...styles.heroDesc, fontSize: "12px" }}>Every recipe built for the 40+ body</p>
      </div>

      <div style={{ padding: "16px 20px 0", display: "flex", gap: "8px" }}>
        {categories.map(cat => (
          <button key={cat} style={styles.navBtn(filter === cat)} onClick={() => setFilter(cat)}>
            {cat}
          </button>
        ))}
      </div>

      <div style={styles.section}>
        {sorted.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isRelevant={recipe.conditions.some(c => userConditions.includes(c))}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP COMPONENT — Orchestrates navigation and global state
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  // activeScreen controls which main section the user sees
  const [activeScreen, setActiveScreen] = useState("home");

  // showQuestionnaire controls whether the intake questionnaire is displayed
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  // questionnaireStep tracks progress through the multi-step questionnaire
  const [questionnaireStep, setQuestionnaireStep] = useState(1);
  const TOTAL_STEPS = 5;

  // userProfile stores all questionnaire answers.
  // In Phase 2 this will be persisted to the backend and used by the AI engine.
  const [userProfile, setUserProfile] = useState({
    ageRange: "",
    region: "",
    conditions: [],
    goal: "",
    commitment: ""
  });

  const updateProfile = (key, value) => {
    setUserProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleQuestionnaireNext = () => {
    if (questionnaireStep < TOTAL_STEPS) {
      setQuestionnaireStep(prev => prev + 1);
    } else {
      setShowQuestionnaire(false);
      setQuestionnaireStep(1);
      setActiveScreen("home");
    }
  };

  const handleQuestionnaireBack = () => {
    if (questionnaireStep > 1) setQuestionnaireStep(prev => prev - 1);
  };

  const navItems = [
    { id: "home",      label: "Home"      },
    { id: "workout",   label: "Workout"   },
    { id: "nutrition", label: "Nutrition" },
    { id: "recipes",   label: "Recipes"   }
  ];

  if (showQuestionnaire) {
    return (
      <div style={styles.app}>
        <div style={styles.nav}>
          <div>
            <p style={{ ...styles.navBrand, margin: 0, fontSize: "13px" }}>TURNED UP</p>
            <p style={{ ...styles.navSub, margin: 0, fontSize: "9px" }}>SETUP YOUR PLAN</p>
          </div>
          <button style={{ ...styles.btnOutline, fontSize: "11px", padding: "4px 10px" }}
            onClick={() => { setShowQuestionnaire(false); setQuestionnaireStep(1); }}>
            SKIP
          </button>
        </div>
        <QuestionnaireStep
          step={questionnaireStep}
          totalSteps={TOTAL_STEPS}
          data={userProfile}
          onChange={updateProfile}
          onNext={handleQuestionnaireNext}
          onBack={handleQuestionnaireBack}
        />
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {/* Navigation Bar */}
      <div style={styles.nav}>
        <div>
          <p style={{ ...styles.navBrand, margin: 0 }}>TURNED UP</p>
          <p style={{ ...styles.navSub, margin: 0, fontSize: "9px" }}>IN THE KITCHEN</p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {navItems.map(item => (
            <button key={item.id} style={styles.navBtn(activeScreen === item.id)} onClick={() => setActiveScreen(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Screen Router */}
      {activeScreen === "home" && (
        <HomeScreen
          userProfile={userProfile}
          onStartQuestionnaire={() => setShowQuestionnaire(true)}
        />
      )}
      {activeScreen === "workout" && <WorkoutScreen />}
      {activeScreen === "nutrition" && <NutritionScreen userProfile={userProfile} />}
      {activeScreen === "recipes" && <RecipesScreen userProfile={userProfile} />}
    </div>
  );
}
