/**
 * PANTHER BRAIN CATALOGUE
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 *
 * AI Clinical Knowledge Base — full exercise catalogue with neural canvas,
 * NASM phase mapping, UCS/LCS risk flags, and Panther Intelligence Scores.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  PANTHER_BRAIN,
  CATEGORIES,
  CATEGORY_ICONS,
  DIFFICULTY_COLOR,
  DIFFICULTY_LABEL,
  NASM_PHASE_LABEL,
  type CatalogueExercise,
  type Category,
} from "@shared/panther-catalogue-data";

// ── Neural Canvas ─────────────────────────────────────────────────────────────

interface Node {
  x: number; y: number; vx: number; vy: number;
}

function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    nodesRef.current = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const nodes = nodesRef.current;

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0,180,255,${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,180,255,0.6)";
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0, opacity: 0.4,
      }}
    />
  );
}

// ── Helper Components ─────────────────────────────────────────────────────────

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  const bg = color.replace(/([\d.]+)\)$/, "0.12)");
  return (
    <span style={{
      fontSize: 11, letterSpacing: 2, padding: "4px 10px",
      background: bg, border: `1px solid ${color}`,
      borderRadius: 4, color, fontWeight: 700,
    }}>
      {children}
    </span>
  );
}

function FlagPill({ color, children }: { color: string; children: React.ReactNode }) {
  const bg = color.replace(/([\d.]+)\)$/, "0.10)");
  return (
    <span style={{
      fontSize: 10, letterSpacing: 2, padding: "4px 10px",
      background: bg, border: `1px solid ${color}44`,
      borderRadius: 4, color, fontWeight: 700,
    }}>
      {children}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 10, letterSpacing: 3, color: "rgba(0,180,255,0.5)",
        fontWeight: 700, marginBottom: 10,
        borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 6,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

// ── Exercise Modal ────────────────────────────────────────────────────────────

function ExerciseModal({ ex, onClose }: { ex: CatalogueExercise; onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "linear-gradient(145deg, #0a0a14, #070710)",
          border: "1px solid rgba(0,150,255,0.4)",
          borderRadius: 16, maxWidth: 640, width: "100%",
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 0 60px rgba(0,100,255,0.3)",
          animation: "modalIn 0.3s ease",
          padding: 24,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(0,180,255,0.5)", marginBottom: 6 }}>
              {ex.id} · PANTHER CLINICAL RECORD
            </div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(28px,5vw,36px)",
              background: "linear-gradient(90deg, #fff, rgba(0,180,255,0.9))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              lineHeight: 1,
            }}>
              {ex.name}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, color: "#fff", fontSize: 18, cursor: "pointer",
              width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Tags row */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <Tag color="rgba(0,150,255,0.7)">{ex.category}</Tag>
          <Tag color="rgba(200,151,58,0.8)">{ex.movementPattern}</Tag>
          <Tag color="rgba(255,255,255,0.3)">{ex.subcategory}</Tag>
          {ex.corrective && <Tag color="rgba(0,220,100,0.7)">CORRECTIVE</Tag>}
          <span style={{
            fontSize: 11, letterSpacing: 2, padding: "4px 10px",
            color: DIFFICULTY_COLOR[ex.difficulty], fontWeight: 700,
          }}>
            {DIFFICULTY_LABEL[ex.difficulty]}
          </span>
        </div>

        {/* NASM Phases */}
        <Section title="NASM PHASES">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ex.nasmPhase.map(p => (
              <span key={p} style={{
                fontSize: 10, letterSpacing: 2, padding: "4px 10px",
                background: "rgba(0,100,255,0.15)", border: "1px solid rgba(0,150,255,0.3)",
                borderRadius: 4, color: "#00aaff", fontWeight: 700,
              }}>
                {NASM_PHASE_LABEL[p]}
              </span>
            ))}
          </div>
        </Section>

        {/* Activation Cues */}
        {ex.clinicalFlags.activationCues.length > 0 && (
          <Section title="ACTIVATION CUES">
            {ex.clinicalFlags.activationCues.map((c, i) => (
              <div key={i} style={{ fontSize: 12, color: "#00ff88", marginBottom: 6, letterSpacing: 1 }}>
                → {c}
              </div>
            ))}
          </Section>
        )}

        {/* Compensations */}
        {ex.clinicalFlags.compensationsToWatch.length > 0 && (
          <Section title="COMPENSATIONS TO WATCH">
            {ex.clinicalFlags.compensationsToWatch.map((c, i) => (
              <div key={i} style={{ fontSize: 12, color: "#ff9933", marginBottom: 6, letterSpacing: 1 }}>
                ⚠ {c}
              </div>
            ))}
          </Section>
        )}

        {/* Inhibit / Activate */}
        {(ex.clinicalFlags.inhibitTargets.length > 0 || ex.clinicalFlags.activateTargets.length > 0) && (
          <Section title="INHIBIT / ACTIVATE TARGETS">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: "#ff6b35", marginBottom: 6 }}>INHIBIT</div>
                {ex.clinicalFlags.inhibitTargets.map((t, i) => (
                  <div key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>• {t}</div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: "#00ff88", marginBottom: 6 }}>ACTIVATE</div>
                {ex.clinicalFlags.activateTargets.map((t, i) => (
                  <div key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>• {t}</div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* Clinical Risk Flags */}
        <Section title="CLINICAL RISK FLAGS">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <FlagPill color={ex.clinicalFlags.upperCrossedRisk ? "#ff6b35" : "#00aaff"}>
              {ex.clinicalFlags.upperCrossedRisk ? "△ UCS RISK" : "✓ UCS CLEAR"}
            </FlagPill>
            <FlagPill color={ex.clinicalFlags.lowerCrossedRisk ? "#ff9933" : "#00aaff"}>
              {ex.clinicalFlags.lowerCrossedRisk ? "△ LCS RISK" : "✓ LCS CLEAR"}
            </FlagPill>
          </div>
        </Section>

        {/* Panther Intelligence Scores */}
        <Section title="PANTHER INTELLIGENCE SCORES">
          {[
            { label: "Anti-Sarcopenia Index", val: ex.sarcopeniaWeight },
            { label: "40+ Suitability Score", val: ex.over40Suitability },
          ].map(({ label, val }) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, letterSpacing: 2, color: "rgba(255,255,255,0.5)" }}>{label}</span>
                <span style={{ fontSize: 12, color: "#00aaff", fontWeight: 700 }}>{Math.round(val * 100)}%</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  width: `${val * 100}%`,
                  background: "linear-gradient(90deg, #0066ff, #00ccff)",
                  boxShadow: "0 0 8px rgba(0,150,255,0.5)",
                  transition: "width 0.8s ease",
                }} />
              </div>
            </div>
          ))}
        </Section>

        {/* Equipment */}
        <Section title="EQUIPMENT">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ex.equipment.map(eq => (
              <Tag key={eq} color="rgba(255,255,255,0.3)">{eq.replace(/_/g, " ").toUpperCase()}</Tag>
            ))}
          </div>
        </Section>

        {/* Tags */}
        <Section title="TAGS">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ex.tags.map(tag => (
              <span key={tag} style={{
                fontSize: 11, letterSpacing: 1, padding: "4px 10px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 4, color: "rgba(255,255,255,0.4)", fontWeight: 700,
              }}>
                #{tag}
              </span>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div style={{
          marginTop: 24, padding: 16,
          background: "rgba(0,100,255,0.06)", border: "1px solid rgba(0,150,255,0.15)",
          borderRadius: 10, fontSize: 11, letterSpacing: 2,
          color: "rgba(0,180,255,0.5)", fontWeight: 700, textAlign: "center",
        }}>
          ◎ PANTHER LEARNS FROM EVERY CLIENT ENCOUNTER · OUTCOME SCORING ACTIVE
        </div>
      </div>
    </div>
  );
}

// ── Exercise Card ─────────────────────────────────────────────────────────────

function ExerciseCard({ ex, onClick }: { ex: CatalogueExercise; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", overflow: "hidden",
        background: hovered ? "rgba(0,80,200,0.12)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${hovered ? "rgba(0,150,255,0.5)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 12, padding: 16, cursor: "pointer",
        boxShadow: hovered ? "0 0 28px rgba(0,100,255,0.2)" : "none",
        transition: "all 0.2s ease",
      }}
    >
      {hovered && (
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: 80, height: 80,
          background: "radial-gradient(circle at top right, rgba(0,150,255,0.15), transparent)",
          pointerEvents: "none",
        }} />
      )}

      {/* ID + Corrective badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 10, letterSpacing: 2, color: "rgba(0,180,255,0.5)", fontWeight: 700 }}>
          {ex.id}
        </span>
        {ex.corrective && (
          <span style={{
            fontSize: 9, letterSpacing: 2, padding: "2px 8px",
            background: "rgba(0,200,100,0.12)", border: "1px solid rgba(0,200,100,0.3)",
            borderRadius: 4, color: "#00ff88", fontWeight: 700,
          }}>
            CORRECTIVE
          </span>
        )}
      </div>

      {/* Name */}
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 22, color: "#F2F2F2", marginBottom: 8, lineHeight: 1.1,
      }}>
        {ex.name}
      </div>

      {/* Category + Pattern */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 10, letterSpacing: 2, color: "rgba(0,150,255,0.7)", fontWeight: 700 }}>
          {ex.category}
        </span>
        <span style={{ fontSize: 10, letterSpacing: 2, color: "rgba(200,151,58,0.8)", fontWeight: 700 }}>
          {ex.movementPattern.toUpperCase()}
        </span>
      </div>

      {/* Difficulty */}
      <div style={{ fontSize: 11, color: DIFFICULTY_COLOR[ex.difficulty], marginBottom: 10, letterSpacing: 1 }}>
        {DIFFICULTY_LABEL[ex.difficulty]}
      </div>

      {/* NASM Phases */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
        {ex.nasmPhase.map(p => (
          <span key={p} style={{
            fontSize: 9, letterSpacing: 1, padding: "2px 6px",
            background: "rgba(0,100,255,0.15)", border: "1px solid rgba(0,150,255,0.3)",
            borderRadius: 4, color: "#00aaff", fontWeight: 700,
          }}>
            P{p}
          </span>
        ))}
      </div>

      {/* Clinical Flags */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {ex.clinicalFlags.upperCrossedRisk && (
          <FlagPill color="#ff6b35">△ UCS RISK</FlagPill>
        )}
        {ex.clinicalFlags.lowerCrossedRisk && (
          <FlagPill color="#ff9933">△ LCS RISK</FlagPill>
        )}
        {ex.over40Suitability >= 0.85 && (
          <FlagPill color="#00aaff">40+ ✓</FlagPill>
        )}
      </div>

      {/* Sarcopenia bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
          SARCOPENIA INDEX
        </div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
          <div style={{
            height: "100%", borderRadius: 2,
            width: `${ex.sarcopeniaWeight * 100}%`,
            background: "linear-gradient(90deg, #0066ff, #00ccff)",
          }} />
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{
        fontSize: 9, letterSpacing: 3, color: "rgba(0,180,255,0.4)",
        fontWeight: 700, textAlign: "right",
      }}>
        TAP FOR CLINICAL DATA →
      </div>
    </div>
  );
}

// ── Main Catalogue Screen ─────────────────────────────────────────────────────

export default function PantherBrainCatalogue() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("ALL");
  const [correctiveOnly, setCorrectiveOnly] = useState(false);
  const [over40Only, setOver40Only] = useState(false);
  const [selected, setSelected] = useState<CatalogueExercise | null>(null);
  const [pulse, setPulse] = useState(false);

  const exercises = PANTHER_BRAIN.exercises;

  const filtered = exercises.filter(ex => {
    if (category !== "ALL" && ex.category !== category) return false;
    if (correctiveOnly && !ex.corrective) return false;
    if (over40Only && ex.over40Suitability < 0.85) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.id.toLowerCase().includes(q) ||
        ex.tags.some(t => t.includes(q)) ||
        ex.movementPattern.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCategory = useCallback((cat: Category) => {
    setCategory(cat);
    setPulse(true);
    setTimeout(() => setPulse(false), 350);
  }, []);

  const stats = {
    total: exercises.length,
    corrective: exercises.filter(e => e.corrective).length,
    over40: exercises.filter(e => e.over40Suitability >= 0.85).length,
    patterns: new Set(exercises.map(e => e.movementPattern)).size,
    categories: new Set(exercises.map(e => e.category)).size,
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080808",
      color: "#F2F2F2", fontFamily: "'Barlow Condensed', sans-serif",
      position: "relative",
    }}>
      <NeuralCanvas />

      {/* Deep blue glow overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,100,255,0.08), transparent)",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(42px,8vw,72px)",
            background: "linear-gradient(90deg, #00aaff, #0066ff, #00ccff)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            lineHeight: 1, marginBottom: 8,
          }}>
            🐆 PANTHER BRAIN
          </div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(28px,5vw,48px)",
            color: "#F2F2F2", letterSpacing: 12, marginBottom: 12,
          }}>
            WORKOUT CATALOGUE
          </div>
          <div style={{ fontSize: 12, letterSpacing: 3, color: "rgba(0,180,255,0.7)" }}>
            AI CLINICAL KNOWLEDGE BASE · {exercises.length} EXERCISES
          </div>
        </div>

        {/* Brain Stats Bar */}
        <div style={{
          background: "rgba(0,0,0,0.6)", border: "1px solid rgba(0,150,255,0.2)",
          borderRadius: 12, padding: "20px 24px", marginBottom: 32,
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 16,
          textAlign: "center",
        }}>
          {[
            { label: "TOTAL EXERCISES", val: stats.total },
            { label: "CORRECTIVE PROTOCOLS", val: stats.corrective },
            { label: "40+ OPTIMIZED", val: stats.over40 },
            { label: "MOVEMENT PATTERNS", val: stats.patterns },
            { label: "CATEGORIES", val: stats.categories },
          ].map(({ label, val }) => (
            <div key={label}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 36,
                color: "#00aaff", filter: "drop-shadow(0 0 8px rgba(0,180,255,0.4))",
              }}>
                {val}
              </div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.4)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="SEARCH EXERCISES, PATTERNS, TAGS..."
            style={{
              width: "100%", padding: "12px 16px", fontSize: 13, letterSpacing: 2,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,150,255,0.3)",
              borderRadius: 8, color: "#F2F2F2", outline: "none",
              fontFamily: "'Barlow Condensed', sans-serif",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { label: "✏️ CORRECTIVE ONLY", active: correctiveOnly, toggle: () => setCorrectiveOnly(v => !v) },
            { label: "🦴 40+ OPTIMIZED", active: over40Only, toggle: () => setOver40Only(v => !v) },
          ].map(({ label, active, toggle }) => (
            <button
              key={label}
              onClick={toggle}
              style={{
                padding: "8px 16px", fontSize: 11, letterSpacing: 2, fontWeight: 700,
                fontFamily: "'Barlow Condensed', sans-serif", cursor: "pointer", borderRadius: 8,
                background: active ? "rgba(0,150,255,0.2)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${active ? "rgba(0,150,255,0.8)" : "rgba(255,255,255,0.1)"}`,
                color: active ? "#00aaff" : "#aaa",
                transition: "all 0.15s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Category Nav */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              style={{
                padding: "8px 16px", fontSize: 11, letterSpacing: 2, fontWeight: 700,
                fontFamily: "'Barlow Condensed', sans-serif", cursor: "pointer", borderRadius: 8,
                background: category === cat
                  ? "linear-gradient(135deg, rgba(0,100,255,0.4), rgba(0,180,255,0.2))"
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${category === cat ? "#00aaff" : "rgba(255,255,255,0.1)"}`,
                color: category === cat ? "#00aaff" : "rgba(255,255,255,0.5)",
                transition: "all 0.15s ease",
              }}
            >
              {CATEGORY_ICONS[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Count */}
        <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(0,180,255,0.5)", marginBottom: 20 }}>
          {filtered.length} EXERCISES IN PANTHER'S ACTIVE MEMORY
        </div>

        {/* Exercise Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
          opacity: pulse ? 0.6 : 1,
          transition: "opacity 0.3s ease",
        }}>
          {filtered.map(ex => (
            <ExerciseCard key={ex.id} ex={ex} onClick={() => setSelected(ex)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            color: "rgba(255,255,255,0.3)", fontSize: 14, letterSpacing: 3,
          }}>
            NO EXERCISES MATCH YOUR FILTERS
          </div>
        )}

        {/* Back button */}
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <a href="/" style={{
            fontSize: 11, letterSpacing: 3, color: "rgba(0,180,255,0.5)",
            textDecoration: "none", fontWeight: 700,
          }}>
            ← RETURN TO DASHBOARD
          </a>
        </div>
      </div>

      {/* Modal */}
      {selected && <ExerciseModal ex={selected} onClose={() => setSelected(null)} />}

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        input::placeholder { color: rgba(255,255,255,0.3); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
        ::-webkit-scrollbar-thumb { background: rgba(0,150,255,0.3); border-radius: 2px; }
      `}</style>
    </div>
  );
}
