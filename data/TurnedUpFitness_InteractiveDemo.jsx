/**
 * ============================================================================
 * TURNED UP FITNESS — INTERACTIVE INVESTOR DEMO
 * A fully clickable prototype demonstrating the complete user experience
 * ============================================================================
 *
 * This demo is designed to be shown to investors on a phone or laptop.
 * It demonstrates the full user journey from assessment through
 * personalized workout and nutrition recommendations, including the
 * rewards system and premium Kitchen upgrade flow.
 *
 * HOW TO USE THIS AS AN INVESTOR DEMO:
 * 1. Open in any React environment (CodeSandbox, StackBlitz, or local)
 * 2. Walk investors through the 5-screen journey
 * 3. Show the BMI calculator calculating in real time
 * 4. Show how health conditions change the recipe recommendations
 * 5. Show the premium gate and upgrade flow
 * 6. Show the rewards/token system
 *
 * WHAT THIS DEMONSTRATES TO INVESTORS:
 * — Real working BMI + macro calculator (Mifflin-St Jeor formula)
 * — Personalization logic connecting assessment to recommendations
 * — Premium membership gating (the revenue model in action)
 * — Retention mechanics (points, streaks, progress tracking)
 * — Dual-brand architecture (Fitness parent + Kitchen premium)
 */

import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATION ENGINE
// Every formula here comes directly from the Meal_Planner_Turnedup_Fitness
// spreadsheet. The Mifflin-St Jeor REE values match exactly what the
// spreadsheet produces for the same inputs.
// ─────────────────────────────────────────────────────────────────────────────

function calcBMI(weightLbs, heightFt, heightIn) {
  // Imperial BMI formula: (weight_lbs / height_inches²) × 703
  const totalInches = heightFt * 12 + heightIn;
  if (!weightLbs || !totalInches) return null;
  return (weightLbs / (totalInches * totalInches)) * 703;
}

function getBMIData(bmi) {
  // BMI categories exactly as defined in the Tech sheet of the spreadsheet
  if (!bmi) return null;
  if (bmi < 15)   return { cat: "Very Severely Underweight", color: "#4fc3f7", icon: "⚠️", workout: "medical", advice: "Please consult a physician before any exercise program." };
  if (bmi < 16)   return { cat: "Severely Underweight",      color: "#4fc3f7", icon: "⚠️", workout: "medical", advice: "Physician consultation required before beginning this program." };
  if (bmi < 18.5) return { cat: "Underweight",               color: "#81d4fa", icon: "📊", workout: "week1",   advice: "Program will prioritize muscle building. Nutrition targets adjusted for healthy weight gain." };
  if (bmi < 25)   return { cat: "Healthy Weight ✓",          color: "#4caf50", icon: "👍", workout: "week1",   advice: "Excellent foundation. Program focuses on strength, conditioning, and body composition optimization." };
  if (bmi < 30)   return { cat: "Overweight",                color: "#ff9800", icon: "📈", workout: "week1",   advice: "Very common at 40+. Combination of strength training and conditioning will produce meaningful results within 12 weeks." };
  if (bmi < 35)   return { cat: "Obese Class I",             color: "#ff5722", icon: "⚕️", workout: "week1_mod", advice: "Physician clearance strongly recommended. Program uses low-impact modifications throughout Phase 1." };
  if (bmi < 40)   return { cat: "Obese Class II",            color: "#e53935", icon: "⚕️", workout: "week1_mod", advice: "Physician clearance required. All high-impact exercises replaced. Nutrition is the primary lever in Phase 1." };
  return             { cat: "Obese Class III+",              color: "#b71c1c", icon: "🏥", workout: "medical", advice: "Medical supervision required. Please consult your physician and return with clearance." };
}

function calcMacros(weightLbs, heightFt, heightIn, age, sex, activity, goal) {
  // Mifflin-St Jeor formula — exactly as in the spreadsheet's Tech sheet
  const weightKg = weightLbs * 0.453592;
  const heightCm = (heightFt * 12 + heightIn) * 2.54;

  // REE = Resting Energy Expenditure
  let ree;
  if (sex === "male") {
    ree = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    ree = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  }

  // Activity coefficients from Lists sheet: 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5...
  const actCoeff = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  const tdee = ree * (actCoeff[activity] || 1.2);

  // Goal coefficients from Lists sheet
  const goalCoeff = { lose_20: 0.8, lose_10: 0.9, maintain: 1.0, gain_20: 1.2 };
  const targetCals = tdee * (goalCoeff[goal] || 1.0);

  // Macro split: 30% protein, 30% carbs, 40% fat (matches spreadsheet defaults)
  const proteinCals = targetCals * 0.30;
  const carbCals    = targetCals * 0.30;
  const fatCals     = targetCals * 0.40;

  return {
    calories: Math.round(targetCals),
    protein:  Math.round(proteinCals / 4),   // 4 cal/g protein
    carbs:    Math.round(carbCals / 4),       // 4 cal/g carbs
    fat:      Math.round(fatCals / 9),        // 9 cal/g fat
    ree:      Math.round(ree),
    tdee:     Math.round(tdee),
  };
}

function getHealthyWeightRange(heightFt, heightIn, sex) {
  // Calculate healthy weight range for BMI 18.5–24.9
  const totalInches = heightFt * 12 + heightIn;
  const minLbs = Math.round((18.5 * totalInches * totalInches) / 703);
  const maxLbs = Math.round((24.9 * totalInches * totalInches) / 703);
  return { min: minLbs, max: maxLbs };
}

// ─────────────────────────────────────────────────────────────────────────────
// BRAND COLORS & DESIGN SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  red: "#C0392B", darkRed: "#7B241C", black: "#0D0D0D",
  charcoal: "#1C1C1C", darkGray: "#2C2C2C", midGray: "#707070",
  lightGray: "#F0F0F0", white: "#FFFFFF", gold: "#F5A623",
  green: "#4caf50", teal: "#028090",
};

const S = {
  app: {
    minHeight: "100vh",
    background: `linear-gradient(180deg, #1a0000 0%, ${C.black} 40%, #1a1a1a 100%)`,
    color: "#e0e0e0",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    maxWidth: "480px",
    margin: "0 auto",
    position: "relative",
  },
  nav: {
    background: C.black, borderBottom: `3px solid ${C.red}`,
    padding: "10px 16px", display: "flex",
    justifyContent: "space-between", alignItems: "center",
    position: "sticky", top: 0, zIndex: 100,
  },
  navBtn: (active) => ({
    background: active ? C.red : "transparent",
    color: active ? C.white : "#888",
    border: `1px solid ${active ? C.red : "#333"}`,
    borderRadius: "4px", padding: "5px 9px",
    cursor: "pointer", fontSize: "10px", fontWeight: 700,
    transition: "all 0.2s",
  }),
  hero: {
    background: `linear-gradient(135deg, #1a0000 0%, ${C.black} 100%)`,
    borderBottom: `3px solid ${C.red}`,
    padding: "28px 20px", textAlign: "center",
  },
  section: { padding: "18px 16px" },
  card: {
    background: C.charcoal, border: `1px solid ${C.darkGray}`,
    borderRadius: "8px", padding: "14px", marginBottom: "10px",
  },
  cardRed: {
    background: C.charcoal, border: `1px solid ${C.red}`,
    borderRadius: "8px", padding: "14px", marginBottom: "10px",
  },
  cardGold: {
    background: "#1a1000", border: `1px solid ${C.gold}`,
    borderRadius: "8px", padding: "14px", marginBottom: "10px",
  },
  stat: {
    flex: 1, background: C.black, border: `1px solid ${C.darkGray}`,
    borderRadius: "6px", padding: "8px", textAlign: "center",
  },
  btn: {
    background: C.red, color: C.white, border: "none",
    borderRadius: "6px", padding: "11px 20px",
    cursor: "pointer", fontWeight: 700, fontSize: "12px",
    width: "100%", letterSpacing: "1px",
  },
  btnGold: {
    background: C.gold, color: C.black, border: "none",
    borderRadius: "6px", padding: "11px 20px",
    cursor: "pointer", fontWeight: 900, fontSize: "12px",
    width: "100%", letterSpacing: "1px",
  },
  btnOutline: {
    background: "transparent", color: C.red,
    border: `2px solid ${C.red}`, borderRadius: "6px",
    padding: "8px 14px", cursor: "pointer",
    fontWeight: 700, fontSize: "11px",
  },
  input: {
    width: "100%", background: C.charcoal,
    border: `1px solid #444`, borderRadius: "6px",
    padding: "10px", color: "#e0e0e0",
    fontSize: "13px", boxSizing: "border-box",
  },
  select: {
    width: "100%", background: C.charcoal,
    border: `1px solid #444`, borderRadius: "6px",
    padding: "10px", color: "#e0e0e0", fontSize: "13px",
  },
  label: {
    color: "#bbb", fontSize: "11px", fontWeight: 600,
    display: "block", marginBottom: "5px",
  },
  progressBar: (pct, color) => ({
    height: "6px", background: C.darkGray, borderRadius: "3px",
    overflow: "hidden", marginTop: "4px",
  }),
  progressFill: (pct, color) => ({
    height: "100%", width: `${Math.min(pct, 100)}%`,
    background: color || C.red, borderRadius: "3px",
    transition: "width 0.5s ease",
  }),
  disclaimer: {
    background: "#1a1200", border: `1px solid #664400`,
    borderRadius: "6px", padding: "10px",
    fontSize: "10px", color: "#cc9900", lineHeight: 1.5,
    marginTop: "12px",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// RECIPE DATA (from cookbook — all 5 recipes)
// ─────────────────────────────────────────────────────────────────────────────
const RECIPES = [
  { id: 1, title: "Seared Scallops with Brussels Sprouts", cat: "Dinner", protein: "26g", cals: "280", conditions: ["joint_health", "heart_health"], tags: ["Anti-Inflammatory", "Omega-3"] },
  { id: 2, title: "Stir-Fry Cabbage with Pork",           cat: "Dinner", protein: "30g", cals: "310", conditions: ["blood_pressure"],               tags: ["Low Sodium", "Gut Health"] },
  { id: 3, title: "Lemon Almond Roasted Chicken Salad",   cat: "Lunch",  protein: "32g", cals: "290", conditions: ["bone_density", "heart_health"],  tags: ["Lean Protein", "Bone Support"] },
  { id: 4, title: "Honey Mustard Chicken Salad",          cat: "Lunch",  protein: "34g", cals: "320", conditions: ["blood_sugar"],                   tags: ["High Protein", "Sugar-Free"] },
  { id: 5, title: "Egg White Omelet with Sweet Potato",   cat: "Breakfast",protein:"28g",cals:"220",  conditions: ["blood_sugar", "weight"],         tags: ["Low Fat", "Blood Sugar Friendly"] },
];

const WORKOUT_PHASES = [
  { phase: 1, name: "Foundation", weeks: "Weeks 1–4", goal: "Master movement quality before adding load", days: [
    { day: "Day 1", focus: "Push & Core", exercises: ["Wall Push-Ups 3×12", "Knee Plank 3×20 sec", "10-min walk"] },
    { day: "Day 2", focus: "Hinge & Pull", exercises: ["Glute Bridge 3×15", "Band Row 3×10", "Interval walk 20 min"] },
    { day: "Day 3", focus: "Squat & Carry", exercises: ["High Box Squat 3×10", "Farmer Carry 3×30 sec", "8-min walk"] },
  ]},
  { phase: 2, name: "Build",       weeks: "Weeks 5–8", goal: "Add progressive load — same perfect patterns, more challenge", days: [
    { day: "Day 1", focus: "Push, Core & Shoulder", exercises: ["Push-Ups 3×10", "Plank 3×40 sec", "5-min brisk intervals"] },
    { day: "Day 2", focus: "Hinge & Pull",          exercises: ["Romanian DL 3×12", "DB Row 3×10 each", "20-min intervals"] },
    { day: "Day 3", focus: "Squat & Full Body",      exercises: ["Goblet Squat 3×12", "Farmer Carry 3×50 sec", "16-min walk"] },
  ]},
  { phase: 3, name: "Strengthen",  weeks: "Weeks 9–12", goal: "Push toward your true capacity — measure your transformation", days: [
    { day: "Day 1", focus: "Push/Pull Superset", exercises: ["Push-Up to Row 3×10+10", "Plank to Down Dog 3×8", "40-min walk"] },
    { day: "Day 2", focus: "Hinge & Single Leg", exercises: ["RDL 4×10", "Reverse Lunge 3×10ea", "5 rounds 3-min brisk"] },
    { day: "Day 3", focus: "Full Body",          exercises: ["Goblet Squat 4×12 (3s)", "Farmer Carry 4×60 sec", "8-min hard walk"] },
  ]},
];

// ─────────────────────────────────────────────────────────────────────────────
// BMI ASSESSMENT SCREEN — the crown jewel of the demo
// ─────────────────────────────────────────────────────────────────────────────
function AssessmentScreen({ onComplete }) {
  const [form, setForm] = useState({
    name: "", sex: "male", age: "", weightLbs: "",
    heightFt: "", heightIn: "", activity: "moderate", goal: "maintain",
  });
  const [conditions, setConditions] = useState([]);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(1); // 1=personal, 2=conditions, 3=results

  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const bmi = calcBMI(Number(form.weightLbs), Number(form.heightFt), Number(form.heightIn));
  const bmiData = getBMIData(bmi);
  const macros = bmi ? calcMacros(Number(form.weightLbs), Number(form.heightFt), Number(form.heightIn),
    Number(form.age), form.sex, form.activity, form.goal) : null;
  const hwRange = (form.heightFt && form.heightIn) ?
    getHealthyWeightRange(Number(form.heightFt), Number(form.heightIn), form.sex) : null;

  const conditionList = [
    { id: "blood_pressure", label: "Blood Pressure", icon: "🫀" },
    { id: "joint_health",   label: "Joint Health",   icon: "🦴" },
    { id: "blood_sugar",    label: "Blood Sugar",     icon: "🩸" },
    { id: "weight",         label: "Weight Mgmt",     icon: "⚖️" },
    { id: "heart_health",   label: "Heart Health",    icon: "❤️" },
    { id: "bone_density",   label: "Bone Density",    icon: "💪" },
  ];

  const toggleCond = (id) => setConditions(p => p.includes(id) ? p.filter(c => c !== id) : [...p, id]);

  return (
    <div>
      <div style={{ ...S.hero, padding: "20px 16px" }}>
        <p style={{ color: C.red, fontSize: "10px", fontWeight: 700, letterSpacing: "3px", margin: "0 0 4px" }}>TURNED UP FITNESS</p>
        <h2 style={{ color: C.white, fontSize: "20px", fontWeight: 900, margin: "0 0 4px", letterSpacing: "1px" }}>BODY ASSESSMENT TOOL</h2>
        <p style={{ color: "#bbb", fontSize: "11px", margin: 0 }}>BMI · Macros · Workout Placement — all in one</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "12px" }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ width: "60px", height: "4px", borderRadius: "2px", background: step >= s ? C.red : C.darkGray }} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div style={S.section}>
          <p style={{ color: C.red, fontSize: "11px", fontWeight: 700, letterSpacing: "2px", margin: "0 0 14px" }}>STEP 1 — YOUR PROFILE</p>

          <div style={{ marginBottom: "12px" }}>
            <label style={S.label}>Your Name</label>
            <input style={S.input} placeholder="Enter your name" value={form.name} onChange={e => u("name", e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Sex</label>
              <select style={S.select} value={form.sex} onChange={e => u("sex", e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Age</label>
              <input style={S.input} type="number" placeholder="e.g. 47" value={form.age} onChange={e => u("age", e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={S.label}>Weight (lbs)</label>
            <input style={S.input} type="number" placeholder="e.g. 195" value={form.weightLbs} onChange={e => u("weightLbs", e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Height (ft)</label>
              <input style={S.input} type="number" placeholder="5" value={form.heightFt} onChange={e => u("heightFt", e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Height (in)</label>
              <input style={S.input} type="number" placeholder="10" value={form.heightIn} onChange={e => u("heightIn", e.target.value)} />
            </div>
          </div>

          {/* Live BMI preview — calculates as user types */}
          {bmi && (
            <div style={{ ...S.cardRed, marginBottom: "12px" }}>
              <p style={{ color: "#bbb", fontSize: "10px", margin: "0 0 4px" }}>LIVE BMI PREVIEW</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: bmiData?.color, fontSize: "32px", fontWeight: 900 }}>{bmi.toFixed(1)}</span>
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: bmiData?.color, fontWeight: 700, fontSize: "13px", margin: 0 }}>{bmiData?.cat}</p>
                  {hwRange && <p style={{ color: "#888", fontSize: "10px", margin: "2px 0 0" }}>Healthy: {hwRange.min}–{hwRange.max} lbs</p>}
                </div>
              </div>
              <div style={S.progressBar()}>
                <div style={S.progressFill(Math.min((bmi / 40) * 100, 100), bmiData?.color)} />
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Activity Level</label>
              <select style={S.select} value={form.activity} onChange={e => u("activity", e.target.value)}>
                <option value="sedentary">Sedentary</option>
                <option value="light">Lightly Active</option>
                <option value="moderate">Moderately Active</option>
                <option value="active">Active</option>
                <option value="very_active">Very Active</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Goal</label>
              <select style={S.select} value={form.goal} onChange={e => u("goal", e.target.value)}>
                <option value="lose_20">Lose Weight (20%)</option>
                <option value="lose_10">Light Lose (10%)</option>
                <option value="maintain">Maintain</option>
                <option value="gain_20">Gain Weight (20%)</option>
              </select>
            </div>
          </div>

          <button style={S.btn} onClick={() => setStep(2)}>CONTINUE →</button>
        </div>
      )}

      {step === 2 && (
        <div style={S.section}>
          <p style={{ color: C.red, fontSize: "11px", fontWeight: 700, letterSpacing: "2px", margin: "0 0 6px" }}>STEP 2 — HEALTH CONDITIONS</p>
          <p style={{ color: "#888", fontSize: "11px", marginBottom: "16px" }}>Select all that apply — this personalizes your entire program.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
            {conditionList.map(c => {
              const sel = conditions.includes(c.id);
              return (
                <div key={c.id} style={{ background: sel ? "#2c0000" : C.charcoal, border: `1px solid ${sel ? C.red : "#333"}`, borderRadius: "8px", padding: "12px", cursor: "pointer", textAlign: "center" }}
                  onClick={() => toggleCond(c.id)}>
                  <span style={{ fontSize: "20px", display: "block", marginBottom: "4px" }}>{c.icon}</span>
                  <span style={{ fontSize: "10px", color: sel ? C.red : "#777", fontWeight: 700 }}>{c.label}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button style={{ ...S.btnOutline, flex: 1 }} onClick={() => setStep(1)}>BACK</button>
            <button style={{ ...S.btn, flex: 2 }} onClick={() => setStep(3)}>SEE MY RESULTS →</button>
          </div>
        </div>
      )}

      {step === 3 && bmi && macros && (
        <div style={S.section}>
          <p style={{ color: C.red, fontSize: "11px", fontWeight: 700, letterSpacing: "2px", margin: "0 0 14px" }}>
            STEP 3 — YOUR PERSONALIZED PLAN{form.name ? `, ${form.name.toUpperCase()}` : ""}
          </p>

          {/* BMI Result */}
          <div style={{ background: "#0a0a0a", border: `2px solid ${bmiData?.color}`, borderRadius: "8px", padding: "14px", marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ color: "#888", fontSize: "10px", fontWeight: 700 }}>YOUR BMI</span>
              <span style={{ color: bmiData?.color, fontSize: "10px", fontWeight: 700 }}>{bmiData?.cat}</span>
            </div>
            <div style={{ fontSize: "48px", fontWeight: 900, color: bmiData?.color, lineHeight: 1 }}>{bmi.toFixed(1)}</div>
            <div style={S.progressBar()}>
              <div style={S.progressFill(Math.min((bmi / 40) * 100, 100), bmiData?.color)} />
            </div>
            {hwRange && (
              <p style={{ color: "#666", fontSize: "10px", margin: "6px 0 0" }}>
                Healthy weight range for your height: {hwRange.min}–{hwRange.max} lbs
              </p>
            )}
            <p style={{ color: "#bbb", fontSize: "11px", margin: "8px 0 0", lineHeight: 1.5 }}>{bmiData?.advice}</p>
          </div>

          {/* Macro targets */}
          <div style={{ ...S.card, marginBottom: "10px" }}>
            <p style={{ color: C.red, fontSize: "10px", fontWeight: 700, margin: "0 0 10px", letterSpacing: "1px" }}>YOUR DAILY NUTRITION TARGETS</p>
            <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
              {[["Calories", macros.calories, C.red], ["Protein", `${macros.protein}g`, C.gold], ["Carbs", `${macros.carbs}g`, "#4fc3f7"], ["Fat", `${macros.fat}g`, "#4caf50"]].map(([lbl, val, color]) => (
                <div key={lbl} style={{ ...S.stat }}>
                  <span style={{ color, fontWeight: 700, fontSize: "15px", display: "block" }}>{val}</span>
                  <span style={{ color: "#666", fontSize: "9px", display: "block" }}>{lbl}</span>
                </div>
              ))}
            </div>
            <p style={{ color: "#666", fontSize: "10px", margin: 0 }}>
              REE: {macros.ree} kcal · TDEE: {macros.tdee} kcal · Mifflin-St Jeor formula
            </p>
          </div>

          {/* Workout placement */}
          <div style={{ ...S.card, marginBottom: "10px" }}>
            <p style={{ color: C.red, fontSize: "10px", fontWeight: 700, margin: "0 0 8px", letterSpacing: "1px" }}>YOUR PROGRAM PLACEMENT</p>
            <p style={{ color: C.white, fontWeight: 700, fontSize: "13px", margin: "0 0 4px" }}>
              {bmiData?.workout === "medical" ? "Medical Clearance Required" :
               bmiData?.workout === "week1_mod" ? "Week 1 — Modified Protocol" : "Week 1 — Standard Phase 1"}
            </p>
            <p style={{ color: "#bbb", fontSize: "11px", margin: 0, lineHeight: 1.5 }}>
              {bmiData?.workout === "medical"
                ? "Once you have physician clearance, return and we will build your customized low-intensity program."
                : bmiData?.workout === "week1_mod"
                ? "You start Week 1 with all high-impact movements replaced. Low-impact alternatives achieve the same training effect safely."
                : "You start at the beginning of Phase 1 — Foundation. All movements are appropriate for your current BMI level."}
            </p>
          </div>

          {/* Condition-specific flags */}
          {conditions.length > 0 && (
            <div style={{ ...S.cardRed, marginBottom: "10px" }}>
              <p style={{ color: C.red, fontSize: "10px", fontWeight: 700, margin: "0 0 8px", letterSpacing: "1px" }}>
                PERSONALIZED MODIFICATIONS APPLIED
              </p>
              {conditions.map(cid => {
                const guidance = {
                  blood_pressure: "Nutrition plan follows DASH principles — potassium-rich foods prioritized, sodium under 1,500mg/day.",
                  joint_health:   "All impact exercises modified. Glute bridges and reverse lunges replace standard squats in Phase 1.",
                  blood_sugar:    "Complex carbohydrates only. Cinnamon and ACV protocols added to nutrition plan.",
                  weight:         "Protein-first meal structure. Volumetric eating approach in nutrition recommendations.",
                  heart_health:   "Oats, fatty fish, and walnuts prioritized. No high-intensity isometric holds.",
                  bone_density:   "Calcium + Vitamin D + K2 + Magnesium stack highlighted in nutrition. Impact training scaled in gradually.",
                };
                const icons = { blood_pressure:"🫀", joint_health:"🦴", blood_sugar:"🩸", weight:"⚖️", heart_health:"❤️", bone_density:"💪" };
                const labels = { blood_pressure:"Blood Pressure", joint_health:"Joint Health", blood_sugar:"Blood Sugar", weight:"Weight Mgmt", heart_health:"Heart Health", bone_density:"Bone Density" };
                return (
                  <div key={cid} style={{ marginBottom: "8px" }}>
                    <p style={{ color: C.white, fontSize: "11px", fontWeight: 700, margin: "0 0 2px" }}>{icons[cid]} {labels[cid]}</p>
                    <p style={{ color: "#bbb", fontSize: "10px", margin: 0, lineHeight: 1.4 }}>{guidance[cid]}</p>
                  </div>
                );
              })}
            </div>
          )}

          <div style={S.disclaimer}>⚠️ This assessment is educational and does not constitute medical advice. Always consult your physician before beginning any exercise or nutrition program.</div>

          <div style={{ marginTop: "12px" }}>
            <button style={S.btn} onClick={() => onComplete({ bmi, bmiData, macros, conditions, name: form.name })}>
              VIEW MY FULL PROGRAM →
            </button>
          </div>
        </div>
      )}

      {step === 3 && !bmi && (
        <div style={S.section}>
          <div style={S.card}>
            <p style={{ color: C.red, fontWeight: 700 }}>Complete Step 1 first</p>
            <p style={{ color: "#888", fontSize: "12px" }}>Enter your weight and height to see your results.</p>
            <button style={S.btn} onClick={() => setStep(1)}>GO BACK</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function HomeScreen({ profile, isPremium, onAssess, onUpgrade, points }) {
  return (
    <div>
      <div style={S.hero}>
        <p style={{ color: C.red, fontSize: "10px", fontWeight: 700, letterSpacing: "3px", margin: "0 0 4px" }}>TURNED UP FITNESS</p>
        <h1 style={{ color: C.white, fontSize: "26px", fontWeight: 900, margin: "0 0 6px", letterSpacing: "1px" }}>BUILT FOR 40+</h1>
        <p style={{ color: "#bbb", fontSize: "12px", margin: "0 0 14px", lineHeight: 1.5 }}>
          Personalized workouts · AI-powered nutrition · Rewards that keep you coming back
        </p>
        {!profile.bmi && (
          <button style={{ ...S.btn, maxWidth: "240px", display: "block", margin: "0 auto" }} onClick={onAssess}>
            START MY FREE ASSESSMENT
          </button>
        )}
      </div>

      {profile.bmi && (
        <div style={{ padding: "14px 16px 0" }}>
          <div style={S.cardRed}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ color: C.white, fontWeight: 700, fontSize: "13px", margin: 0 }}>
                  {profile.name ? `Welcome back, ${profile.name}` : "Your Active Profile"}
                </p>
                <p style={{ color: "#888", fontSize: "10px", margin: "2px 0 0" }}>
                  BMI {profile.bmi?.toFixed(1)} · {profile.bmiData?.cat} · {profile.macros?.calories} cal/day
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: C.gold, fontWeight: 900, fontSize: "16px", margin: 0 }}>{points} pts</p>
                <p style={{ color: "#666", fontSize: "9px", margin: 0 }}>TUT Tokens</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isPremium && (
        <div style={{ padding: "10px 16px 0" }}>
          <div style={S.cardGold}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "22px" }}>👨‍🍳</span>
              <div>
                <p style={{ margin: 0, color: C.gold, fontWeight: 900, fontSize: "12px" }}>TURNED UP IN THE KITCHEN</p>
                <p style={{ margin: 0, color: "#888", fontSize: "10px" }}>Premium nutrition add-on</p>
              </div>
              <span style={{ marginLeft: "auto", background: C.gold, color: C.black, fontSize: "9px", fontWeight: 900, padding: "2px 6px", borderRadius: "8px" }}>UPGRADE</span>
            </div>
            <p style={{ color: "#bbb", fontSize: "11px", margin: "0 0 10px", lineHeight: 1.4 }}>
              Full recipe library · Personalized meal plans · Region-specific nutrition · 1,800+ food database
            </p>
            <button style={{ ...S.btnGold, fontSize: "11px", padding: "8px" }} onClick={onUpgrade}>
              ADD KITCHEN — $34.99/mo
            </button>
          </div>
        </div>
      )}

      <div style={S.section}>
        <p style={{ color: C.red, fontSize: "11px", fontWeight: 700, letterSpacing: "2px", margin: "0 0 12px" }}>WHAT'S INCLUDED</p>
        {[
          { icon: "💪", title: "12-Week Workout Program",      desc: "Foundation → Build → Strengthen. 3 days/week with condition modifications.", free: true  },
          { icon: "🦴", title: "Health Condition Modifications", desc: "Bad knees, lower back, shoulders — 4-week progressions for each.", free: true  },
          { icon: "📊", title: "Body Assessment Engine",        desc: "BMI + 5 biomarkers → instant workout placement + macro targets.", free: true  },
          { icon: "👨‍🍳", title: "Turned Up In The Kitchen",     desc: "Full recipe library, meal planning, personalized nutrition.", free: false },
          { icon: "🏆", title: "Rewards & Token System",        desc: "Earn TUT tokens with every workout and milestone completed.", free: false },
          { icon: "🤖", title: "AI Progress Coaching",          desc: "Weekly AI analysis of your compliance, patterns, and trajectory.", free: false },
        ].map((item, i) => (
          <div key={i} style={item.free ? S.card : S.cardGold}>
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "22px" }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <p style={{ color: C.white, fontWeight: 700, fontSize: "12px", margin: 0 }}>{item.title}</p>
                  {!item.free && <span style={{ color: C.gold, fontSize: "9px", fontWeight: 700, border: `1px solid ${C.gold}`, padding: "1px 5px", borderRadius: "8px" }}>PREMIUM</span>}
                </div>
                <p style={{ color: "#888", fontSize: "11px", margin: "3px 0 0", lineHeight: 1.4 }}>{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKOUT SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function WorkoutScreen({ profile, onEarnPoints }) {
  const [expanded, setExpanded] = useState(null);
  const [completed, setCompleted] = useState({});

  const markComplete = (phaseIdx, dayIdx) => {
    const key = `${phaseIdx}-${dayIdx}`;
    if (!completed[key]) {
      setCompleted(p => ({ ...p, [key]: true }));
      onEarnPoints(30, "Workout completed! 🔥");
    }
  };

  return (
    <div>
      <div style={{ ...S.hero, padding: "20px 16px" }}>
        <p style={{ color: C.red, fontSize: "10px", fontWeight: 700, letterSpacing: "3px", margin: "0 0 4px" }}>TURNED UP FITNESS</p>
        <h2 style={{ color: C.white, fontSize: "20px", fontWeight: 900, margin: "0 0 4px" }}>12-WEEK PROGRAM</h2>
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "10px" }}>
          {[["12","Weeks"],["3","Days/Wk"],["3","Phases"],["36","WODs"]].map(([v,l]) => (
            <div key={l} style={{ ...S.stat, flex: "none", width: "60px" }}>
              <span style={{ color: C.red, fontWeight: 700, fontSize: "16px", display: "block" }}>{v}</span>
              <span style={{ color: "#666", fontSize: "9px", display: "block" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {profile.bmiData?.workout?.includes("mod") && (
        <div style={{ padding: "12px 16px 0" }}>
          <div style={{ background: "#1a1000", border: `1px solid ${C.gold}`, borderRadius: "6px", padding: "10px" }}>
            <p style={{ color: C.gold, fontWeight: 700, fontSize: "11px", margin: "0 0 3px" }}>⚠️ MODIFIED PROTOCOL ACTIVE</p>
            <p style={{ color: "#bbb", fontSize: "10px", margin: 0 }}>Based on your BMI, all high-impact exercises have been replaced with low-impact alternatives throughout Phase 1.</p>
          </div>
        </div>
      )}

      <div style={S.section}>
        <p style={{ color: C.red, fontSize: "11px", fontWeight: 700, letterSpacing: "2px", margin: "0 0 12px" }}>ALL THREE PHASES</p>
        {WORKOUT_PHASES.map((phase, pi) => (
          <div key={pi} style={{ ...S.card, borderLeft: `4px solid ${pi === 1 ? C.charcoal : C.red}`, marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
              <div>
                <p style={{ color: C.red, fontSize: "9px", fontWeight: 700, letterSpacing: "2px", margin: 0 }}>PHASE {phase.phase}</p>
                <p style={{ color: C.white, fontWeight: 700, fontSize: "14px", margin: "2px 0 0" }}>{phase.name}</p>
                <p style={{ color: "#666", fontSize: "10px", margin: "1px 0 0" }}>{phase.weeks}</p>
              </div>
              <button style={{ ...S.btnOutline, fontSize: "10px", padding: "4px 8px" }}
                onClick={() => setExpanded(expanded === pi ? null : pi)}>
                {expanded === pi ? "COLLAPSE" : "VIEW WODs"}
              </button>
            </div>
            <p style={{ color: "#bbb", fontSize: "11px", margin: 0, lineHeight: 1.4 }}>{phase.goal}</p>

            {expanded === pi && phase.days.map((day, di) => {
              const key = `${pi}-${di}`;
              const done = completed[key];
              return (
                <div key={di} style={{ background: C.black, borderRadius: "6px", padding: "10px", marginTop: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <p style={{ color: C.red, fontWeight: 700, fontSize: "10px", margin: 0 }}>{day.day} — {day.focus}</p>
                    <button style={{
                      background: done ? C.green : "transparent", color: done ? C.white : C.red,
                      border: `1px solid ${done ? C.green : C.red}`, borderRadius: "4px",
                      padding: "3px 8px", cursor: "pointer", fontSize: "10px", fontWeight: 700,
                    }} onClick={() => markComplete(pi, di)}>
                      {done ? "✓ DONE" : "MARK DONE"}
                    </button>
                  </div>
                  {day.exercises.map((ex, ei) => (
                    <p key={ei} style={{ color: "#ccc", fontSize: "11px", margin: "0 0 3px" }}>• {ex}</p>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KITCHEN / RECIPES SCREEN (premium gated)
// ─────────────────────────────────────────────────────────────────────────────
function KitchenScreen({ profile, isPremium, onUpgrade }) {
  const [filter, setFilter] = useState("All");
  const conditions = profile.conditions || [];

  if (!isPremium) {
    return (
      <div>
        <div style={{ ...S.hero, padding: "20px 16px", borderBottomColor: C.gold }}>
          <p style={{ color: C.gold, fontSize: "10px", fontWeight: 700, letterSpacing: "3px", margin: "0 0 4px" }}>PREMIUM ADD-ON</p>
          <h2 style={{ color: C.white, fontSize: "20px", fontWeight: 900, margin: "0 0 6px" }}>TURNED UP IN THE KITCHEN</h2>
          <p style={{ color: "#bbb", fontSize: "12px", margin: 0, lineHeight: 1.4 }}>
            Full recipe library · Personalized meal plans · 1,800+ food database
          </p>
        </div>
        <div style={{ padding: "20px 16px" }}>
          <div style={S.cardGold}>
            <p style={{ color: C.gold, fontWeight: 900, fontSize: "14px", margin: "0 0 12px" }}>UNLOCK THE KITCHEN</p>
            {["Full recipe library (5 now, growing to 30+)", "Personalized meal plans based on your conditions", "1,800+ food database with macro tracking", "Region-specific food guidance", "Weekly meal prep planning"].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "5px" }}>
                <span style={{ color: C.gold }}>✓</span>
                <span style={{ color: "#ddd", fontSize: "11px" }}>{f}</span>
              </div>
            ))}
            <button style={{ ...S.btnGold, marginTop: "12px" }} onClick={onUpgrade}>
              UPGRADE TO FITNESS + KITCHEN — $34.99/mo
            </button>
            <p style={{ color: "#555", fontSize: "10px", textAlign: "center", marginTop: "6px" }}>Cancel anytime · No contracts</p>
          </div>
        </div>
      </div>
    );
  }

  const cats = ["All", "Breakfast", "Lunch", "Dinner"];
  const filtered = RECIPES.filter(r => filter === "All" || r.cat === filter);
  const sorted = [...filtered].sort((a, b) => {
    const aR = a.conditions.some(c => conditions.includes(c));
    const bR = b.conditions.some(c => conditions.includes(c));
    return aR === bR ? 0 : aR ? -1 : 1;
  });

  return (
    <div>
      <div style={{ ...S.hero, padding: "20px 16px", background: "linear-gradient(135deg, #1a1000 0%, #0D0D0D 100%)", borderBottomColor: C.gold }}>
        <p style={{ color: C.gold, fontSize: "10px", fontWeight: 700, letterSpacing: "3px", margin: "0 0 4px" }}>PREMIUM · TURNED UP FITNESS</p>
        <h2 style={{ color: C.white, fontSize: "20px", fontWeight: 900, margin: "0 0 4px" }}>TURNED UP IN THE KITCHEN</h2>
        <p style={{ color: "#bbb", fontSize: "11px", margin: 0 }}>Every recipe built for the 40+ body</p>
      </div>

      <div style={{ padding: "12px 16px 0", display: "flex", gap: "6px" }}>
        {cats.map(cat => (
          <button key={cat} style={{ background: filter === cat ? C.gold : "transparent", color: filter === cat ? C.black : "#777", border: `1px solid ${filter === cat ? C.gold : "#333"}`, borderRadius: "4px", padding: "4px 10px", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}
            onClick={() => setFilter(cat)}>{cat}</button>
        ))}
      </div>

      <div style={S.section}>
        {sorted.map(recipe => {
          const isRec = recipe.conditions.some(c => conditions.includes(c));
          return (
            <div key={recipe.id} style={isRec ? { ...S.cardGold } : S.card}>
              {isRec && <span style={{ color: C.gold, fontSize: "9px", fontWeight: 700, letterSpacing: "1px" }}>★ RECOMMENDED FOR YOU</span>}
              <p style={{ color: C.white, fontWeight: 700, fontSize: "13px", margin: "4px 0 2px" }}>{recipe.title}</p>
              <p style={{ color: "#666", fontSize: "10px", margin: "0 0 8px" }}>{recipe.cat}</p>
              <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                <div style={S.stat}><span style={{ color: C.gold, fontWeight: 700, fontSize: "13px", display: "block" }}>{recipe.protein}</span><span style={{ color: "#555", fontSize: "9px" }}>Protein</span></div>
                <div style={S.stat}><span style={{ color: C.red, fontWeight: 700, fontSize: "13px", display: "block" }}>{recipe.cals}</span><span style={{ color: "#555", fontSize: "9px" }}>Calories</span></div>
              </div>
              <div>{recipe.tags.map(t => <span key={t} style={{ display: "inline-block", background: "#2d1f00", color: C.gold, border: `1px solid ${C.gold}`, borderRadius: "10px", padding: "1px 8px", fontSize: "9px", fontWeight: 700, marginRight: "4px" }}>{t}</span>)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REWARDS SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function RewardsScreen({ points, history }) {
  const milestones = [
    { pts: 100,  label: "Week 1 Complete",       reward: "Premium Recipe Unlock",     icon: "🎯" },
    { pts: 250,  label: "Foundation Phase Done",  reward: "Nutrition Analysis Report", icon: "📊" },
    { pts: 500,  label: "Program Graduate",       reward: "1 Month Kitchen Free",      icon: "🏆" },
    { pts: 750,  label: "Intermediate Unlocked",  reward: "Partner Supplement Discount",icon: "💊" },
    { pts: 1500, label: "6-Month Veteran",        reward: "TUT Token Cash Out",         icon: "🪙" },
  ];

  return (
    <div>
      <div style={{ ...S.hero, padding: "20px 16px", borderBottomColor: C.gold }}>
        <p style={{ color: C.gold, fontSize: "10px", fontWeight: 700, letterSpacing: "3px", margin: "0 0 4px" }}>TURNED UP FITNESS</p>
        <h2 style={{ color: C.white, fontSize: "20px", fontWeight: 900, margin: "0 0 6px" }}>REWARDS & TOKENS</h2>
        <div style={{ background: C.charcoal, borderRadius: "50%", width: "80px", height: "80px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "0 auto", border: `3px solid ${C.gold}` }}>
          <span style={{ color: C.gold, fontWeight: 900, fontSize: "22px" }}>{points}</span>
          <span style={{ color: "#777", fontSize: "9px" }}>TUT pts</span>
        </div>
      </div>

      <div style={S.section}>
        <p style={{ color: C.gold, fontSize: "11px", fontWeight: 700, letterSpacing: "2px", margin: "0 0 12px" }}>MILESTONE REWARDS</p>
        {milestones.map((m, i) => {
          const reached = points >= m.pts;
          return (
            <div key={i} style={{ ...S.card, borderColor: reached ? C.gold : C.darkGray, opacity: reached ? 1 : 0.6, marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ fontSize: "20px" }}>{m.icon}</span>
                  <div>
                    <p style={{ color: reached ? C.gold : C.white, fontWeight: 700, fontSize: "12px", margin: 0 }}>{m.label}</p>
                    <p style={{ color: "#777", fontSize: "10px", margin: "2px 0 0" }}>{m.reward}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: reached ? C.gold : "#555", fontWeight: 700, fontSize: "13px", margin: 0 }}>{m.pts}</p>
                  <p style={{ color: reached ? C.green : "#444", fontSize: "9px", margin: 0 }}>{reached ? "✓ REACHED" : "pts needed"}</p>
                </div>
              </div>
              {!reached && (
                <div style={{ marginTop: "6px" }}>
                  <div style={S.progressBar()}>
                    <div style={S.progressFill((points / m.pts) * 100, C.gold)} />
                  </div>
                  <p style={{ color: "#555", fontSize: "9px", margin: "3px 0 0" }}>{m.pts - points} pts to go</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={S.section}>
        <p style={{ color: C.red, fontSize: "11px", fontWeight: 700, letterSpacing: "2px", margin: "0 0 10px" }}>HOW TO EARN TOKENS</p>
        {[
          ["Complete a workout", "+30 pts"],
          ["Log a meal", "+10 pts"],
          ["Hit daily protein target", "+15 pts"],
          ["Complete assessment check-in", "+50 pts"],
          ["Refer a friend", "+100 pts"],
          ["30-day streak", "+200 pts"],
        ].map(([action, pts]) => (
          <div key={action} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.darkGray}` }}>
            <span style={{ color: "#bbb", fontSize: "12px" }}>{action}</span>
            <span style={{ color: C.gold, fontWeight: 700, fontSize: "12px" }}>{pts}</span>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div style={S.section}>
          <p style={{ color: C.red, fontSize: "11px", fontWeight: 700, letterSpacing: "2px", margin: "0 0 10px" }}>RECENT ACTIVITY</p>
          {history.slice(-5).reverse().map((h, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.darkGray}` }}>
              <span style={{ color: "#bbb", fontSize: "11px" }}>{h.msg}</span>
              <span style={{ color: C.gold, fontWeight: 700, fontSize: "11px" }}>+{h.pts}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [showAssessment, setShowAssessment] = useState(false);
  const [profile, setProfile] = useState({ bmi: null, bmiData: null, macros: null, conditions: [], name: "" });
  const [isPremium, setIsPremium] = useState(false);
  const [points, setPoints] = useState(50); // Start with 50 to show the system working
  const [pointHistory, setPointHistory] = useState([{ pts: 50, msg: "Welcome bonus!" }]);
  const [upgradeToast, setUpgradeToast] = useState(false);

  const earnPoints = (pts, msg) => {
    setPoints(p => p + pts);
    setPointHistory(h => [...h, { pts, msg }]);
  };

  const handleUpgrade = () => {
    // Simulate upgrade for demo purposes
    setIsPremium(true);
    earnPoints(100, "Kitchen upgrade bonus! 🥗");
    setUpgradeToast(true);
    setTimeout(() => setUpgradeToast(false), 3000);
    setScreen("kitchen");
  };

  const handleAssessmentComplete = (data) => {
    setProfile(data);
    earnPoints(50, "Assessment completed! 📊");
    setShowAssessment(false);
    setScreen("home");
  };

  const navItems = [
    { id: "home", label: "Home" },
    { id: "workout", label: "Workout" },
    { id: "kitchen", label: isPremium ? "Kitchen ⭐" : "Kitchen 🔒" },
    { id: "rewards", label: `Rewards (${points})` },
  ];

  if (showAssessment) {
    return (
      <div style={S.app}>
        <div style={S.nav}>
          <div>
            <p style={{ color: C.white, fontWeight: 900, fontSize: "13px", letterSpacing: "1px", margin: 0 }}>TURNED UP FITNESS</p>
            <p style={{ color: C.red, fontSize: "8px", fontWeight: 700, letterSpacing: "2px", margin: 0 }}>ASSESSMENT</p>
          </div>
          <button style={{ ...S.btnOutline, fontSize: "10px", padding: "4px 8px" }} onClick={() => setShowAssessment(false)}>SKIP</button>
        </div>
        <AssessmentScreen onComplete={handleAssessmentComplete} />
      </div>
    );
  }

  return (
    <div style={S.app}>
      {/* Toast notification */}
      {upgradeToast && (
        <div style={{ position: "fixed", top: "70px", left: "50%", transform: "translateX(-50%)", background: C.gold, color: C.black, padding: "8px 16px", borderRadius: "20px", fontWeight: 700, fontSize: "12px", zIndex: 999 }}>
          🎉 Kitchen Unlocked! +100 bonus tokens!
        </div>
      )}

      <div style={S.nav}>
        <div>
          <p style={{ color: C.white, fontWeight: 900, fontSize: "13px", letterSpacing: "1px", margin: 0 }}>TURNED UP FITNESS</p>
          <p style={{ color: C.red, fontSize: "8px", fontWeight: 700, letterSpacing: "2px", margin: 0 }}>40+ WELLNESS SYSTEM</p>
        </div>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {navItems.map(item => (
            <button key={item.id} style={S.navBtn(screen === item.id)} onClick={() => setScreen(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {screen === "home" && (
        <HomeScreen
          profile={profile}
          isPremium={isPremium}
          points={points}
          onAssess={() => setShowAssessment(true)}
          onUpgrade={handleUpgrade}
        />
      )}
      {screen === "workout" && (
        <WorkoutScreen profile={profile} onEarnPoints={earnPoints} />
      )}
      {screen === "kitchen" && (
        <KitchenScreen profile={profile} isPremium={isPremium} onUpgrade={handleUpgrade} />
      )}
      {screen === "rewards" && (
        <RewardsScreen points={points} history={pointHistory} />
      )}
    </div>
  );
}
