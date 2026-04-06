/**
 * TUF FUEL Page — Nutrition Tracking + Meal Plan + Principles
 * Design System: Protein ring, meal distribution, daily targets
 * Enhanced with 30-day meal plan and 40+ nutrition principles from TUF Drive
 */

import { useState } from "react";
import { TUF_DATA } from "@/lib/tuf-data";
import { Plus, CalendarDays, Flame } from 'lucide-react';
import { AngleButton } from '@/components/ui/angle-button';

// ── MEAL PLAN DATA (from TUF Drive — 30-Day Meal Plan) ───────────────────────

const MEAL_PLAN_WEEK = [
  {
    day: "Monday",
    meals: [
      { type: "Breakfast", food: "Greek yogurt with mixed berries and nuts" },
      { type: "Snack", food: "Carrot sticks with hummus" },
      { type: "Lunch", food: "Grilled chicken, mixed greens, avocado, balsamic vinaigrette" },
      { type: "Snack", food: "Hard-boiled egg with grape tomatoes" },
      { type: "Dinner", food: "Baked salmon with roasted vegetables and quinoa" },
    ],
  },
  {
    day: "Tuesday",
    meals: [
      { type: "Breakfast", food: "Oatmeal with mixed berries and nuts" },
      { type: "Snack", food: "Apple slices with almond butter" },
      { type: "Lunch", food: "Turkey lettuce wraps with cucumber and carrot sticks" },
      { type: "Snack", food: "Greek yogurt with honey" },
      { type: "Dinner", food: "Grilled shrimp with roasted vegetables and brown rice" },
    ],
  },
  {
    day: "Wednesday",
    meals: [
      { type: "Breakfast", food: "Scrambled eggs with spinach and whole wheat toast" },
      { type: "Snack", food: "Baby carrots with hummus" },
      { type: "Lunch", food: "Grilled chicken, mixed greens, avocado, balsamic vinaigrette" },
      { type: "Snack", food: "Pear and almonds" },
      { type: "Dinner", food: "Baked chicken with roasted sweet potato and green beans" },
    ],
  },
  {
    day: "Thursday",
    meals: [
      { type: "Breakfast", food: "Green smoothie — spinach, banana, almond milk, protein powder" },
      { type: "Snack", food: "Hard-boiled egg with cucumber slices" },
      { type: "Lunch", food: "Grilled salmon salad with mixed greens, cucumber, tomato" },
      { type: "Snack", food: "Greek yogurt with mixed berries" },
      { type: "Dinner", food: "Turkey meatballs with zucchini noodles and tomato sauce" },
    ],
  },
  {
    day: "Friday",
    meals: [
      { type: "Breakfast", food: "Whole wheat English muffin with scrambled eggs and avocado" },
      { type: "Snack", food: "Sliced apple with almond butter" },
      { type: "Lunch", food: "Grilled chicken sandwich on whole wheat with mixed greens" },
      { type: "Snack", food: "Greek yogurt with honey" },
      { type: "Dinner", food: "Grilled steak with roasted vegetables and quinoa" },
    ],
  },
  {
    day: "Saturday",
    meals: [
      { type: "Breakfast", food: "Greek yogurt parfait with berries and granola" },
      { type: "Snack", food: "Baby carrots with hummus" },
      { type: "Lunch", food: "Turkey burger on whole wheat bun with mixed greens and avocado" },
      { type: "Snack", food: "Mixed nuts and seeds" },
      { type: "Dinner", food: "Baked salmon with roasted sweet potato and Brussels sprouts" },
    ],
  },
  {
    day: "Sunday",
    meals: [
      { type: "Breakfast", food: "Omelet with spinach, tomatoes, and whole wheat toast" },
      { type: "Snack", food: "Sliced apple with almond butter" },
      { type: "Lunch", food: "Turkey chili with mixed greens and avocado" },
      { type: "Snack", food: "Greek yogurt with mixed berries" },
      { type: "Dinner", food: "Grilled chicken with roasted vegetables and brown rice" },
    ],
  },
];

const NUTRITION_PRINCIPLES = [
  {
    icon: "💪",
    title: "Protein First",
    rule: "0.7–1g per pound of bodyweight",
    detail: "At 40+, anabolic resistance means you need more protein per meal to trigger muscle protein synthesis. Aim for 30–40g per meal minimum.",
    accent: "text-accent",
  },
  {
    icon: "⏱️",
    title: "Timing Matters",
    rule: "Eat within 45 min post-workout",
    detail: "The post-exercise window is real. Protein + fast carbs within 45 minutes accelerates recovery and muscle repair.",
    accent: "text-blue-400",
  },
  {
    icon: "🔥",
    title: "Anti-Inflammatory Focus",
    rule: "Omega-3s daily, minimize processed foods",
    detail: "Chronic inflammation is the enemy at 40+. Salmon, walnuts, and olive oil fight it. Processed foods feed it.",
    accent: "text-orange-400",
  },
  {
    icon: "💧",
    title: "Hydration",
    rule: "Half your bodyweight in oz daily",
    detail: "Dehydration mimics hunger and impairs performance. 180lb person = 90oz minimum. More on training days.",
    accent: "text-cyan-400",
  },
];

const MEAL_TYPE_COLORS: Record<string, string> = {
  Breakfast: "text-yellow-400",
  Snack: "text-green-400",
  Lunch: "text-blue-400",
  Dinner: "text-accent",
};

type Tab = "today" | "plan" | "principles";

// ── COMPONENT ────────────────────────────────────────────────────────────────

export default function Fuel() {
  const nutrition = TUF_DATA.nutrition;
  const targets = nutrition.dailyTargets;

  const [activeTab, setActiveTab] = useState<Tab>("today");
  const todayIndex = (() => {
    const d = new Date().getDay(); // 0=Sun
    return d === 0 ? 6 : d - 1;   // Mon=0 … Sun=6
  })();
  const [selectedDay, setSelectedDay] = useState(todayIndex);

  return (
    <div className="min-h-screen bg-[#080808] text-foreground pb-20">
      {/* Header */}
      <section className="px-4 pt-6 pb-4 border-b border-border">
        <div className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Nutrition</div>
        <h1 className="font-bebas text-3xl tracking-wider text-foreground">
          <span className="text-primary">FUEL</span>
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {([
            { id: "today" as Tab, label: "TODAY" },
            { id: "plan" as Tab, label: "MEAL PLAN", icon: <CalendarDays className="w-3 h-3" /> },
            { id: "principles" as Tab, label: "PRINCIPLES", icon: <Flame className="w-3 h-3" /> },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-black"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── TODAY TAB (existing tracker) ── */}
      {activeTab === "today" && (
        <>
          {/* Protein Hero */}
          <section className="px-4 py-6">
            <div className="tuf-card gold-border">
              <div className="text-xs tracking-widest uppercase text-accent mb-4">Daily Targets</div>

              {/* Protein Ring */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" opacity="0.2" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${(0 / targets.protein) * 283} 283`}
                      strokeLinecap="round"
                      style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", color: "var(--accent)" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="font-bebas text-lg text-accent tracking-wider">0</div>
                    <div className="text-xs text-muted-foreground">g</div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground">Protein</span>
                    <span className="font-bebas text-sm text-accent">{targets.protein}g</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground">Carbs</span>
                    <span className="font-bebas text-sm text-accent">{targets.carbs}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Fat</span>
                    <span className="font-bebas text-sm text-accent">{targets.fat}g</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Daily Calorie Target</div>
                <div className="font-bebas text-2xl text-accent tracking-wider">{targets.calories}</div>
              </div>
            </div>
          </section>

          {/* Meals */}
          <section className="px-4 py-4">
            <div className="font-bebas text-lg tracking-wider text-foreground border-l-4 border-l-primary pl-3 mb-4">
              TODAY'S <span className="text-primary">MEALS</span>
            </div>

            {nutrition.meals.map((meal) => (
              <div key={meal.id} className="tuf-card ok-border mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bebas text-sm tracking-wider text-foreground">{meal.name}</div>
                  <div className="text-xs text-muted-foreground">{meal.time}</div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill ok" style={{ width: `${(meal.current / meal.target) * 100}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {meal.current} / {meal.target} cal
                </div>
              </div>
            ))}
          </section>

          {/* CTA */}
          <section className="px-4 py-6">
            <AngleButton
              variant="book-now"
              size="lg"
              icon={<Plus className="w-5 h-5" />}
              className="w-full"
            >
              LOG MEAL
            </AngleButton>
          </section>
        </>
      )}

      {/* ── MEAL PLAN TAB ── */}
      {activeTab === "plan" && (
        <section className="px-4 py-4">
          {/* Today highlight */}
          <div className="tuf-card gold-border mb-4">
            <div className="text-xs tracking-widest uppercase text-accent mb-3">
              TODAY — {MEAL_PLAN_WEEK[todayIndex].day.toUpperCase()}
            </div>
            <div className="space-y-2">
              {MEAL_PLAN_WEEK[todayIndex].meals.map((meal, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`text-xs font-bold w-20 shrink-0 ${MEAL_TYPE_COLORS[meal.type]}`}>
                    {meal.type}
                  </span>
                  <span className="text-sm text-foreground/80">{meal.food}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Day selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {MEAL_PLAN_WEEK.map((day, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold tracking-wider transition-all ${
                  selectedDay === i
                    ? "bg-primary text-black"
                    : i === todayIndex
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {day.day.slice(0, 3).toUpperCase()}
              </button>
            ))}
          </div>

          {/* Selected day */}
          <div className="tuf-card ok-border">
            <div className="font-bebas text-lg tracking-wider mb-3">
              {MEAL_PLAN_WEEK[selectedDay].day.toUpperCase()}
            </div>
            <div className="space-y-3">
              {MEAL_PLAN_WEEK[selectedDay].meals.map((meal, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <span className={`text-xs font-bold w-20 shrink-0 pt-0.5 ${MEAL_TYPE_COLORS[meal.type]}`}>
                    {meal.type}
                  </span>
                  <span className="text-sm text-foreground/80 leading-relaxed">{meal.food}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            30-Day TUF Meal Plan · Week 1 of 4
          </p>
        </section>
      )}

      {/* ── PRINCIPLES TAB ── */}
      {activeTab === "principles" && (
        <section className="px-4 py-4 space-y-4">
          <div className="tuf-card ok-border">
            <p className="text-sm text-foreground/60 leading-relaxed">
              Nutrition for the 40+ athlete is different. Your hormones have shifted, your recovery takes longer, and your metabolism responds differently. These aren't excuses — they're variables to engineer around.
            </p>
          </div>

          {NUTRITION_PRINCIPLES.map((p) => (
            <div key={p.title} className="tuf-card gold-border">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <p className="font-bebas text-base tracking-wider">{p.title}</p>
                  <p className={`text-xs font-bold ${p.accent}`}>{p.rule}</p>
                </div>
              </div>
              <p className="text-sm text-foreground/60 leading-relaxed">{p.detail}</p>
            </div>
          ))}

          {/* Supplement stack */}
          <div className="tuf-card gold-border">
            <div className="font-bebas text-base tracking-wider border-l-4 border-l-primary pl-3 mb-3">
              SUPPLEMENT STACK
            </div>
            <div className="space-y-2 text-sm text-foreground/70">
              <p><span className="text-foreground font-bold">Burn AM/PM</span> — Metabolism support + fat loss</p>
              <p><span className="text-foreground font-bold">Intra/Test Storm</span> — Soreness, fatigue, and recovery</p>
              <p><span className="text-foreground font-bold">Sleep Multiplier</span> — Stress, sleep quality, and recovery</p>
              <p><span className="text-foreground font-bold">EFA Hormone Optimizer</span> — Hormonal balance + plateau breaking</p>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Ask your TUF coach for personalized supplement recommendations.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
