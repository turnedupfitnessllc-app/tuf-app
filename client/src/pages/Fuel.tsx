/**
 * TUF FUEL Page — Nutrition Tracking
 * Design System: Protein ring, meal distribution, daily targets
 */

import { TUF_DATA } from "@/lib/tuf-data";

export default function Fuel() {
  const nutrition = TUF_DATA.nutrition;
  const targets = nutrition.dailyTargets;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <section className="px-4 pt-6 pb-4 border-b border-border">
        <div className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Nutrition</div>
        <h1 className="font-bebas text-3xl tracking-wider text-foreground">
          <span className="text-primary">FUEL</span>
        </h1>
      </section>

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
        <button className="tuf-btn primary">LOG MEAL</button>
      </section>
    </div>
  );
}
