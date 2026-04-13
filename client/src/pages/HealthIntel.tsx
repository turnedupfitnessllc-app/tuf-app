/**
 * TUF HEALTH INTELLIGENCE — v1.0
 * Real public health data from Yale PopHIVE (Epic Cosmos EHR + CDC)
 * Connects fitness training to population health outcomes.
 *
 * Sections:
 *   1. Why You Train — obesity prevalence by age group (national)
 *   2. Metabolic Risk — diabetes prevalence by age group
 *   3. Illness Alert — current week respiratory ED visits
 *   4. Panther Insight — AI-generated coaching context
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AgeGroupStat {
  age_group: string;
  year: number;
  prevalence_rate: number;
  patient_count: number;
}

interface RespiratoryAlert {
  virus: string;
  date: string;
  ed_visits: number;
  ed_visits_per_100k: number;
  percent_change: number;
  trend: "rising" | "falling" | "stable";
}

interface HealthSummary {
  obesity: AgeGroupStat[] | null;
  diabetes: AgeGroupStat[] | null;
  respiratory: RespiratoryAlert[] | null;
  source: string;
  last_updated: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function trendIcon(trend: string) {
  if (trend === "rising") return "↑";
  if (trend === "falling") return "↓";
  return "→";
}

function trendColor(trend: string) {
  if (trend === "rising") return "#ef4444";
  if (trend === "falling") return "#22c55e";
  return "#f59e0b";
}

function virusColor(virus: string) {
  if (virus === "COVID-19") return "#6366f1";
  if (virus === "Influenza") return "#f59e0b";
  if (virus === "RSV") return "#3b82f6";
  return "#888";
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HealthIntel() {
  const [, navigate] = useLocation();
  const [data, setData] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"obesity" | "diabetes" | "respiratory">("obesity");

  useEffect(() => {
    setLoading(true);
    fetch("/api/healthintel/summary")
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(json => { setData(json); setLoading(false); })
      .catch(err => { setError(String(err)); setLoading(false); });
  }, []);

  // ── Panther insight copy based on data ──────────────────────────────────────
  function getPantherInsight(): string {
    if (!data) return "";
    const obesity2024 = data.obesity?.find(d => d.age_group === "35-49")?.prevalence_rate;
    const risingVirus = data.respiratory?.find(r => r.trend === "rising")?.virus;
    if (obesity2024 && obesity2024 > 30) {
      return `${obesity2024.toFixed(1)}% of adults 35-49 are clinically obese. That's not a statistic — that's a direction. Every session you complete moves you the other way. The data doesn't lie. Neither does the Panther.`;
    }
    if (risingVirus) {
      return `${risingVirus} ED visits are rising this week. Strong immune function is built in the gym, not the pharmacy. Your training is your defense system. Keep showing up.`;
    }
    return "The data confirms what the Panther already knows: the gap between where most people are and where you're going is built one session at a time. Keep moving.";
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingBottom: 96 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .hi-card { background: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: 16px; padding: 20px; margin-bottom: 16px; animation: fadeUp 0.4s ease both; }
        .hi-tab { padding: 8px 16px; border-radius: 20px; border: none; cursor: pointer; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 0.08em; transition: all 0.2s; }
        .hi-tab.active { background: var(--accent-primary); color: #fff; }
        .hi-tab.inactive { background: transparent; color: var(--text-secondary); border: 1px solid var(--border-primary); }
        .hi-bar-bg { background: rgba(128,128,128,0.15); border-radius: 4px; height: 8px; overflow: hidden; }
        .hi-bar-fill { height: 8px; border-radius: 4px; transition: width 0.8s ease; }
        .hi-pill { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; }
      `}</style>

      {/* ─── HEADER ─── */}
      <div style={{ padding: "16px 20px 8px", maxWidth: 480, margin: "0 auto" }}>
        <button
          onClick={() => navigate("/")}
          style={{ background: "none", border: "none", color: "var(--text-tertiary)", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", cursor: "pointer", padding: 0, marginBottom: 16 }}
        >
          ← HOME
        </button>

        <div style={{ marginBottom: 4 }}>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "var(--accent-primary)", letterSpacing: "0.05em" }}>
            HEALTH INTELLIGENCE
          </span>
        </div>
        <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, color: "var(--text-secondary)", margin: "0 0 20px", letterSpacing: "0.04em" }}>
          Real population health data · Yale PopHIVE · Epic Cosmos EHR + CDC
        </p>

        {/* ─── TABS ─── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {(["obesity", "diabetes", "respiratory"] as const).map(tab => (
            <button
              key={tab}
              className={`hi-tab ${activeTab === tab ? "active" : "inactive"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "obesity" ? "OBESITY" : tab === "diabetes" ? "DIABETES" : "ILLNESS ALERT"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>

        {/* ─── LOADING ─── */}
        {loading && (
          <div className="hi-card" style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: "var(--text-secondary)", letterSpacing: "0.1em" }}>
              LOADING HEALTH DATA...
            </div>
            <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, color: "var(--text-tertiary)", marginTop: 8 }}>
              Connecting to Yale PopHIVE
            </p>
          </div>
        )}

        {/* ─── ERROR ─── */}
        {error && !loading && (
          <div className="hi-card" style={{ borderColor: "#ef4444" }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: "#ef4444", letterSpacing: "0.08em" }}>
              DATA UNAVAILABLE
            </div>
            <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>
              Could not connect to PopHIVE. Check server logs.
            </p>
          </div>
        )}

        {/* ─── OBESITY TAB ─── */}
        {!loading && !error && data && activeTab === "obesity" && (
          <>
            <div className="hi-card">
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "var(--text-primary)", letterSpacing: "0.06em", marginBottom: 4 }}>
                OBESITY PREVALENCE BY AGE
              </div>
              <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, color: "var(--text-tertiary)", margin: "0 0 16px" }}>
                % of US adults with BMI ≥30 · Source: Epic Cosmos EHR · {data.obesity?.[0]?.year ?? "2024"}
              </p>
              {data.obesity ? (
                data.obesity.map((item, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.04em" }}>
                        {item.age_group}
                      </span>
                      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: item.prevalence_rate > 35 ? "#ef4444" : item.prevalence_rate > 25 ? "#f59e0b" : "#22c55e", letterSpacing: "0.06em" }}>
                        {item.prevalence_rate}%
                      </span>
                    </div>
                    <div className="hi-bar-bg">
                      <div
                        className="hi-bar-fill"
                        style={{
                          width: `${Math.min(100, item.prevalence_rate * 2)}%`,
                          background: item.prevalence_rate > 35 ? "#ef4444" : item.prevalence_rate > 25 ? "#f59e0b" : "#22c55e",
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontFamily: "'Barlow Condensed',sans-serif", color: "var(--text-secondary)", fontSize: 13 }}>No data available</p>
              )}
            </div>

            <div className="hi-card" style={{ borderColor: "rgba(255,69,0,0.3)", background: "rgba(255,69,0,0.05)" }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: "var(--accent-primary)", letterSpacing: "0.1em", marginBottom: 8 }}>
                🐆 PANTHER READS THE DATA
              </div>
              <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5, margin: 0, fontWeight: 600 }}>
                {getPantherInsight()}
              </p>
            </div>
          </>
        )}

        {/* ─── DIABETES TAB ─── */}
        {!loading && !error && data && activeTab === "diabetes" && (
          <>
            <div className="hi-card">
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "var(--text-primary)", letterSpacing: "0.06em", marginBottom: 4 }}>
                DIABETES PREVALENCE BY AGE
              </div>
              <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, color: "var(--text-tertiary)", margin: "0 0 16px" }}>
                % of US adults with HbA1c ≥7% · Source: Epic Cosmos EHR · {data.diabetes?.[0]?.year ?? "2024"}
              </p>
              {data.diabetes ? (
                data.diabetes.map((item, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.04em" }}>
                        {item.age_group}
                      </span>
                      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: item.prevalence_rate > 15 ? "#ef4444" : item.prevalence_rate > 8 ? "#f59e0b" : "#22c55e", letterSpacing: "0.06em" }}>
                        {item.prevalence_rate}%
                      </span>
                    </div>
                    <div className="hi-bar-bg">
                      <div
                        className="hi-bar-fill"
                        style={{
                          width: `${Math.min(100, item.prevalence_rate * 4)}%`,
                          background: item.prevalence_rate > 15 ? "#ef4444" : item.prevalence_rate > 8 ? "#f59e0b" : "#22c55e",
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontFamily: "'Barlow Condensed',sans-serif", color: "var(--text-secondary)", fontSize: 13 }}>No data available</p>
              )}
            </div>

            <div className="hi-card" style={{ borderColor: "rgba(255,69,0,0.3)", background: "rgba(255,69,0,0.05)" }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: "var(--accent-primary)", letterSpacing: "0.1em", marginBottom: 8 }}>
                🐆 METABOLIC TRUTH
              </div>
              <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5, margin: 0, fontWeight: 600 }}>
                Resistance training is the most evidence-backed intervention for insulin sensitivity. Every rep you do is metabolic medicine. The data shows the cost of inaction. You're choosing differently.
              </p>
            </div>
          </>
        )}

        {/* ─── RESPIRATORY TAB ─── */}
        {!loading && !error && data && activeTab === "respiratory" && (
          <>
            <div className="hi-card">
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "var(--text-primary)", letterSpacing: "0.06em", marginBottom: 4 }}>
                RESPIRATORY ILLNESS ALERT
              </div>
              <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, color: "var(--text-tertiary)", margin: "0 0 16px" }}>
                Current week ED visits · Source: Epic Cosmos + CDC NSSP
              </p>
              {data.respiratory ? (
                data.respiratory.map((item, i) => (
                  <div key={i} className="hi-card" style={{ marginBottom: 12, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: virusColor(item.virus), letterSpacing: "0.08em" }}>
                        {item.virus}
                      </span>
                      <span
                        className="hi-pill"
                        style={{ background: trendColor(item.trend) + "22", color: trendColor(item.trend), border: `1px solid ${trendColor(item.trend)}44` }}
                      >
                        {trendIcon(item.trend)} {item.trend.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 20 }}>
                      <div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: "var(--text-tertiary)", letterSpacing: "0.06em" }}>ED VISITS</div>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "var(--text-primary)", letterSpacing: "0.04em" }}>
                          {item.ed_visits.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: "var(--text-tertiary)", letterSpacing: "0.06em" }}>PER 100K</div>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "var(--text-primary)", letterSpacing: "0.04em" }}>
                          {item.ed_visits_per_100k}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: "var(--text-tertiary)", letterSpacing: "0.06em" }}>WK CHANGE</div>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: trendColor(item.trend), letterSpacing: "0.04em" }}>
                          {item.percent_change > 0 ? "+" : ""}{item.percent_change}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontFamily: "'Barlow Condensed',sans-serif", color: "var(--text-secondary)", fontSize: 13 }}>No data available</p>
              )}
            </div>

            <div className="hi-card" style={{ borderColor: "rgba(255,69,0,0.3)", background: "rgba(255,69,0,0.05)" }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: "var(--accent-primary)", letterSpacing: "0.1em", marginBottom: 8 }}>
                🐆 IMMUNE INTELLIGENCE
              </div>
              <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5, margin: 0, fontWeight: 600 }}>
                Consistent training elevates NK cell activity, reduces systemic inflammation, and improves respiratory capacity. Your immune system is a muscle. Train it.
              </p>
            </div>
          </>
        )}

        {/* ─── DATA SOURCE FOOTER ─── */}
        {!loading && data && (
          <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
            <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, color: "var(--text-tertiary)", margin: 0, letterSpacing: "0.04em" }}>
              Data: {data.source}
            </p>
            <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: "var(--text-tertiary)", margin: "2px 0 0", letterSpacing: "0.04em" }}>
              Updated: {new Date(data.last_updated).toLocaleDateString()}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
