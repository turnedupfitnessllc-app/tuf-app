/**
 * TUF ASSESS — v4.0
 * Arc: Hook(pain) → Problem(what's wrong) → Fix(mechanism)
 *      → Demo(correctives) → Cues(Panther) → CTA(build plan)
 * Step 0: 8-region pain selector
 * Step 1: Diagnosis + corrective sequence + CTA
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { PantherPresence, PantherMessage, V4Card, SceneHeader } from "@/components/v4Components";
import { ISSUES, PHASE_COLORS, ls, type Issue } from "@/data/v4constants";

export default function Assess() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSelect(iss: Issue) {
    setIssue(iss);
    setStep(1);
    ls.set("tuf_correctives", {
      issue: {
        id: iss.id,
        label: iss.label,
        color: iss.color,
        correctives: iss.correctives,
        pattern: iss.pattern,
        cue: iss.cue,
      },
    });
    const logs = ls.get<Array<{ location: string; level: number; date: string }>>("tuf_pain_logs", []);
    logs.push({ location: iss.label, level: 5, date: new Date().toISOString() });
    ls.set("tuf_pain_logs", logs);
  }

  function handleStartPlan() {
    setSaved(true);
    setTimeout(() => navigate("/program"), 800);
  }

  const hexRgbLocal = (hex: string): string => {
    const m: Record<string, string> = {
      "#FF6600": "255,69,0", "#2563eb": "37,99,235", "#C8973A": "200,151,58",
      "#7c3aed": "124,58,237", "#0d9488": "13,148,136", "#16a34a": "22,163,74",
      "#dc2626": "220,38,38", "#9333ea": "147,51,234",
    };
    return m[hex] || "255,255,255";
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 96 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes ambient { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
        @keyframes ring    { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.05);opacity:1} }
        @keyframes scan    { 0%{top:-2%;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:102%;opacity:0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "80px 16px 0", position: "relative" }}>

        {/* Back to Home */}
        <button
          onClick={() => navigate("/")}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", marginBottom: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", cursor: "pointer" }}
        >
          ← HOME
        </button>

        {step === 0 && (
          <>
            {/* SCENE 1 — HOOK */}
            <div style={{ marginBottom: 20, animation: "fadeUp 0.4s ease forwards" }}>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.18em", color: "#FF6600", marginBottom: 4,
              }}>
                MOVEMENT ASSESSMENT
              </p>
              <h1 style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: "0.07em",
                color: "var(--text-primary)", lineHeight: 1.05,
              }}>
                ASSESS YOUR <span style={{ color: "#FF6600" }}>MOVEMENT</span>
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>
                Find the root cause. Build the corrective plan. Fix it permanently.
              </p>
            </div>

            {/* SCENE 2 — PROBLEM: Pain selector */}
            <V4Card accent="#FF6600" style={{ marginBottom: 16 }}>
              <SceneHeader num="02" label="WHERE IS YOUR PAIN?" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {ISSUES.map(iss => (
                  <button
                    key={iss.id}
                    onClick={() => handleSelect(iss)}
                    style={{
                      padding: "14px 10px", borderRadius: 14,
                      border: `1px solid rgba(${hexRgbLocal(iss.color)},0.3)`,
                      background: `rgba(${hexRgbLocal(iss.color)},0.06)`,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{iss.icon}</span>
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
                      letterSpacing: "0.08em", color: iss.color, textAlign: "center",
                    }}>
                      {iss.label.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            </V4Card>

            {/* Panther idle */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <PantherPresence state="idle" size={100} />
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)",
              }}>
                PANTHER IS READY TO DIAGNOSE
              </p>
            </div>
          </>
        )}

        {step === 1 && issue && (
          <>
            {/* Back */}
            <button
              onClick={() => { setStep(0); setIssue(null); setSaved(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 6, marginBottom: 16,
                background: "transparent", border: "none", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)",
              }}
            >
              ← BACK TO REGIONS
            </button>

            {/* SCENE 1 — Panther locked in */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <PantherPresence state="locked_in" size={120} showScan />
            </div>

            {/* SCENE 2 — PROBLEM: Verdict */}
            <V4Card accent={issue.color} style={{ marginBottom: 12 }}>
              <SceneHeader num="02" label="WHAT'S WRONG" color={issue.color} />
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{issue.icon}</span>
                <div>
                  <p style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900,
                    letterSpacing: "0.04em", color: "var(--text-primary)", lineHeight: 1.2, marginBottom: 4,
                  }}>
                    {issue.verdict}
                  </p>
                  <p style={{ fontSize: 12, color: `rgba(${hexRgbLocal(issue.color)},0.9)`, fontWeight: 600 }}>
                    {issue.pattern}
                  </p>
                </div>
              </div>
            </V4Card>

            {/* SCENE 3 — FIX: NASM Continuum */}
            <V4Card style={{ marginBottom: 12 }}>
              <SceneHeader num="03" label="THE FIX — NASM CORRECTIVE CONTINUUM" />
              <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                {(["INHIBIT", "LENGTHEN", "ACTIVATE", "INTEGRATE"] as const).map((phase, i) => (
                  <div key={phase} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.1em", color: PHASE_COLORS[phase],
                      padding: "3px 8px", borderRadius: 6,
                      background: `${PHASE_COLORS[phase]}18`,
                      border: `1px solid ${PHASE_COLORS[phase]}44`,
                    }}>
                      {phase}
                    </span>
                    {i < 3 && <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>→</span>}
                  </div>
                ))}
              </div>
            </V4Card>

            {/* SCENE 4 — DEMO: Exercise list */}
            <V4Card style={{ marginBottom: 12 }}>
              <SceneHeader num="04" label="YOUR CORRECTIVE PLAN" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {issue.correctives.map((ex, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 12px", borderRadius: 12,
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${PHASE_COLORS[ex.phase] || "rgba(255,255,255,0.06)"}22`,
                    }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: `${PHASE_COLORS[ex.phase] || "#FF6600"}22`,
                      border: `1px solid ${PHASE_COLORS[ex.phase] || "#FF6600"}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span style={{
                        fontFamily: "'Bebas Neue', sans-serif", fontSize: 10,
                        color: PHASE_COLORS[ex.phase] || "#FF6600",
                      }}>
                        {i + 1}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700,
                        color: "var(--text-primary)",
                      }}>
                        {ex.name}
                      </p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{ex.sets}</p>
                    </div>
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700,
                      letterSpacing: "0.1em", color: PHASE_COLORS[ex.phase] || "#FF6600",
                      padding: "2px 6px", borderRadius: 4,
                      background: `${PHASE_COLORS[ex.phase] || "#FF6600"}18`,
                    }}>
                      {ex.phase}
                    </span>
                  </div>
                ))}
              </div>
            </V4Card>

            {/* SCENE 5 — CUES: Panther message */}
            <PantherMessage
              headline="I SEE THE WEAKNESS."
              body={`${issue.pattern}. That's the root. Not where you feel the pain — where the movement broke down.`}
              directive={issue.cue}
            />

            {/* SCENE 6 — CTA */}
            <button
              onClick={handleStartPlan}
              style={{
                width: "100%", padding: "18px", borderRadius: 20, border: "none",
                background: saved
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : "linear-gradient(135deg, #FF6600, #8B0000)",
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.1em",
                color: "var(--text-primary)", cursor: "pointer",
                boxShadow: "0 4px 32px rgba(255,102,0,0.35)",
                transition: "background 0.3s ease",
              }}
            >
              {saved ? "✓ PLAN SAVED — LOADING PROGRAM" : "BUILD MY CORRECTIVE PROGRAM →"}
            </button>
          </>
        )}

      </main>
    </div>
  );
}
