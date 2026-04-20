/**
 * PantherBrainAnalysisCard — Post-workout AI analysis display
 * Shows headline, feedback, directive, and adaptation from Panther Brain AI
 */
import { useState, useEffect } from "react";

interface AnalysisData {
  headline: string;
  feedback: string;
  directive: string;
  adaptation: {
    reps_modifier: number;
    tempo: string;
    focus: string;
    note: string;
  };
  xp_award: number;
  panther_mode: "STEALTH" | "PRECISION" | "ATTACK";
}

interface Props {
  streak: number;
  workoutsCompleted: number;
  mobilityScore: number;
  strengthScore: number;
  formScore: number;
  workoutName?: string;
  onAnalysisComplete?: (analysis: AnalysisData, updatedScores: { mobility_score: number; strength_score: number }) => void;
}

const MODE_COLORS = {
  STEALTH: "#00aaff",
  PRECISION: "#C8973A",
  ATTACK: "#FF2D2D",
};

const FOCUS_ICONS: Record<string, string> = {
  FORM: "🎯",
  STRENGTH: "💪",
  MOBILITY: "🧘",
  ENDURANCE: "⚡",
};

export default function PantherBrainAnalysisCard({
  streak, workoutsCompleted, mobilityScore, strengthScore, formScore, workoutName = "Session",
  onAnalysisComplete,
}: Props) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/panther-brain/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            streak, workouts_completed: workoutsCompleted,
            mobility_score: mobilityScore, strength_score: strengthScore,
            form_score: formScore, workout_name: workoutName,
          }),
        });
        const data = await res.json();
        if (data.success && data.analysis) {
          setAnalysis(data.analysis);
          // Store adaptation for next session
          localStorage.setItem("tuf_next_session_adaptation", JSON.stringify(data.analysis.adaptation));
          // Update scores
          if (data.updated_scores) {
            const raw = localStorage.getItem("tuf_profile");
            if (raw) {
              const profile = JSON.parse(raw);
              profile.mobilityScore = data.updated_scores.mobility_score;
              profile.strengthScore = data.updated_scores.strength_score;
              localStorage.setItem("tuf_profile", JSON.stringify(profile));
            }
          }
          onAnalysisComplete?.(data.analysis, data.updated_scores);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) {
    return (
      <div style={{
        background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,102,0,0.2)",
        borderRadius: 16, padding: 20, textAlign: "center",
      }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 4, color: "#FF6600", marginBottom: 12 }}>
          PANTHER BRAIN ANALYZING...
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#FF6600",
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div style={{
        background: "rgba(255,102,0,0.05)", border: "1px solid rgba(255,102,0,0.2)",
        borderRadius: 16, padding: 20,
      }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#FF6600", marginBottom: 8 }}>
          SESSION LOGGED
        </div>
        <p style={{ fontSize: 12, color: "#888" }}>Panther Brain is processing your session data.</p>
      </div>
    );
  }

  const modeColor = MODE_COLORS[analysis.panther_mode] || "#FF6600";

  return (
    <div style={{
      background: "linear-gradient(135deg, #0d0d0d, #111)",
      border: `1px solid ${modeColor}40`,
      borderRadius: 20, padding: 20,
      boxShadow: `0 0 30px ${modeColor}15`,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: 4, color: modeColor, marginBottom: 6 }}>
            🐆 PANTHER BRAIN · {analysis.panther_mode} MODE
          </div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#fff", letterSpacing: 2, lineHeight: 1 }}>
            {analysis.headline}
          </div>
        </div>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 28,
          color: "#C8973A", lineHeight: 1,
        }}>
          +{analysis.xp_award}<span style={{ fontSize: 12, color: "#666" }}>XP</span>
        </div>
      </div>

      {/* Feedback */}
      <p style={{ fontSize: 13, color: "#bbb", lineHeight: 1.6, marginBottom: 16 }}>
        {analysis.feedback}
      </p>

      {/* Directive */}
      <div style={{
        background: `${modeColor}10`,
        border: `1px solid ${modeColor}30`,
        borderRadius: 12, padding: "12px 14px", marginBottom: 16,
      }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: 3, color: modeColor, marginBottom: 4 }}>
          DIRECTIVE
        </div>
        <p style={{ fontSize: 13, color: "#fff", fontWeight: 700, margin: 0 }}>
          {analysis.directive}
        </p>
      </div>

      {/* Adaptation */}
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{
          flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px",
        }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: 2, color: "#555", marginBottom: 4 }}>NEXT SESSION</div>
          <div style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>
            {FOCUS_ICONS[analysis.adaptation.focus]} {analysis.adaptation.focus}
          </div>
          <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{analysis.adaptation.tempo} TEMPO</div>
        </div>
        <div style={{
          flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px",
        }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: 2, color: "#555", marginBottom: 4 }}>REPS ADJUST</div>
          <div style={{ fontSize: 20, color: analysis.adaptation.reps_modifier > 0 ? "#00cc66" : analysis.adaptation.reps_modifier < 0 ? "#FF4444" : "#888", fontFamily: "'Bebas Neue', sans-serif" }}>
            {analysis.adaptation.reps_modifier > 0 ? "+1 REP" : analysis.adaptation.reps_modifier < 0 ? "-1 REP" : "SAME"}
          </div>
        </div>
      </div>

      {analysis.adaptation.note && (
        <p style={{ fontSize: 11, color: "#555", marginTop: 10, fontStyle: "italic" }}>
          {analysis.adaptation.note}
        </p>
      )}
    </div>
  );
}
