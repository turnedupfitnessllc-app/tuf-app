/**
 * MEALS OF THE WEEK CARD — Home Screen Feature
 * Showcases 4 weekly featured meals: Breakfast · Lunch · Dinner · Snack
 * Auto-refreshed every Friday by the Manus scheduled task.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import currentMealsOfWeek, { type WeeklyMeal } from "@/data/mealsOfWeek";

// ─── Meal Detail Modal ────────────────────────────────────────────────────────
function MealModal({ meal, onClose }: { meal: WeeklyMeal; onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#111", borderRadius: "20px 20px 0 0",
          width: "100%", maxWidth: 480, maxHeight: "90vh",
          overflowY: "auto", paddingBottom: 32,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Hero image */}
        <div style={{ position: "relative", height: 220, overflow: "hidden", borderRadius: "20px 20px 0 0" }}>
          <img
            src={meal.image}
            alt={meal.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80"; }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 40%, #111 100%)",
          }} />
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 14, right: 14,
              background: "rgba(0,0,0,0.6)", border: "none",
              color: "#fff", borderRadius: "50%", width: 32, height: 32,
              fontSize: 18, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
          <div style={{
            position: "absolute", bottom: 12, left: 16,
            background: `${meal.typeColor}22`,
            border: `1px solid ${meal.typeColor}55`,
            borderRadius: 6, padding: "3px 10px",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, fontWeight: 800, letterSpacing: 2, color: meal.typeColor,
          }}>
            {meal.typeIcon} {meal.typeLabel}
          </div>
        </div>

        <div style={{ padding: "16px 20px 0" }}>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 22, fontWeight: 800, color: "#fff",
            letterSpacing: "0.04em", textTransform: "uppercase",
            margin: "0 0 6px",
          }}>{meal.name}</h2>
          <p style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: 14, color: "rgba(255,255,255,0.6)",
            lineHeight: 1.6, margin: "0 0 16px",
          }}>{meal.description}</p>

          {/* Macros */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8, marginBottom: 20,
          }}>
            {[
              { label: "CALS", value: meal.macros.calories, color: "#FF9500" },
              { label: "PROTEIN", value: `${meal.macros.protein}g`, color: "#00FFC6" },
              { label: "CARBS", value: `${meal.macros.carbs}g`, color: "#7B61FF" },
              { label: "FAT", value: `${meal.macros.fat}g`, color: "#FF6600" },
            ].map(m => (
              <div key={m.label} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: "10px 6px", textAlign: "center",
              }}>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 20, color: m.color, lineHeight: 1,
                }}>{m.value}</div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 9, fontWeight: 700, letterSpacing: 2,
                  color: "rgba(255,255,255,0.3)", marginTop: 3,
                }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Ingredients */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.3)", marginBottom: 10,
            }}>INGREDIENTS</div>
            {meal.ingredients.map((ing, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 0",
                borderBottom: i < meal.ingredients.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: meal.typeColor, flexShrink: 0 }} />
                <span style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 14, color: "rgba(255,255,255,0.75)",
                }}>{ing}</span>
              </div>
            ))}
          </div>

          {/* Prep time */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 16 }}>⏱</span>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 14, color: "rgba(255,255,255,0.5)",
            }}>Prep time: <strong style={{ color: "#fff" }}>{meal.prepTime}</strong></span>
          </div>

          {/* Panther Note */}
          <div style={{
            background: "rgba(0,255,198,0.04)",
            border: "1px solid rgba(0,255,198,0.15)",
            borderLeft: "3px solid #00FFC6",
            borderRadius: 10, padding: "12px 14px",
          }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
              color: "#00FFC6", marginBottom: 4,
            }}>🐆 PANTHER NOTE</div>
            <div style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6,
            }}>{meal.whyItFits}</div>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
            {meal.tags.map(tag => (
              <span key={tag} style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 11, color: "rgba(255,255,255,0.35)",
                background: "rgba(255,255,255,0.05)",
                borderRadius: 4, padding: "2px 8px",
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Card ────────────────────────────────────────────────────────────────
export default function MealsOfWeekCard() {
  const [, navigate] = useLocation();
  const [activeMeal, setActiveMeal] = useState<WeeklyMeal | null>(null);
  const { weekLabel, meals } = currentMealsOfWeek;

  return (
    <>
      {activeMeal && <MealModal meal={activeMeal} onClose={() => setActiveMeal(null)} />}

      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, padding: "16px 16px 12px",
        marginBottom: 20,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.22em",
              color: "rgba(255,255,255,0.25)", marginBottom: 2,
            }}>🍽️ MEALS OF THE WEEK</div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.45)",
            }}>{weekLabel}</div>
          </div>
          <button
            onClick={() => navigate("/feast")}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
              color: "#00FFC6", background: "transparent",
              border: "1px solid rgba(0,255,198,0.3)",
              borderRadius: 6, padding: "4px 10px", cursor: "pointer",
            }}
          >ALL RECIPES →</button>
        </div>

        {/* Meal tiles — horizontal scroll on mobile */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 8,
        }}>
          {meals.map(meal => (
            <button
              key={meal.id}
              onClick={() => setActiveMeal(meal)}
              style={{
                position: "relative", overflow: "hidden",
                borderRadius: 12, border: `1px solid ${meal.typeColor}22`,
                background: "transparent", cursor: "pointer",
                padding: 0, textAlign: "left",
                height: 120,
              }}
            >
              {/* Background image */}
              <img
                src={meal.image}
                alt={meal.name}
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%", objectFit: "cover",
                }}
                onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80"; }}
              />
              {/* Gradient overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.82) 100%)",
              }} />
              {/* Content */}
              <div style={{ position: "relative", padding: "8px 10px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.2em",
                  color: meal.typeColor, marginBottom: 3,
                }}>{meal.typeIcon} {meal.typeLabel}</div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 13, fontWeight: 700,
                  color: "#fff", lineHeight: 1.2,
                  textTransform: "uppercase",
                }}>{meal.name}</div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 11, color: "rgba(255,255,255,0.55)",
                  marginTop: 3,
                }}>{meal.macros.protein}g protein · {meal.prepTime}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer note */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 10, color: "rgba(255,255,255,0.2)",
          textAlign: "center", marginTop: 10, letterSpacing: "0.1em",
        }}>Updated every Friday by PANTHER AI · Tap any meal for full recipe</div>
      </div>
    </>
  );
}
