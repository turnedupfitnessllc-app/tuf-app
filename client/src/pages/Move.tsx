/**
 * TUF MOVE — v3.0 Panther System Redesign
 * Doc 17 §4 — Frosted glass WorkoutCards, RPE slider, AI-VA badge
 * Doc 18 — PantherHeader, PantherActionButton, haptics
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { haptics } from "@/utils/haptics";
import AppShell from "@/components/AppShell";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";

interface Exercise {
  id: string;
  name: string;
  category: "Strength" | "Cardio" | "Mobility" | "Full Body" | "Motivation";
  description: string;
  reps?: string;
  duration?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  videoUrl: string;
  muscleGroup: string;
  pantherCue?: string;
}

const EXERCISES: Exercise[] = [
  { id: "1", name: "Panther Squat", category: "Strength", description: "Explosive bodyweight squat with full depth. Drive through your heels, keep chest tall.", reps: "3 × 12-15", difficulty: "Beginner", muscleGroup: "Legs", videoUrl: `${CDN}/jarvis-squat_29894acb.mp4`, pantherCue: "Drive hips like a striking panther." },
  { id: "2", name: "Strength Montage", category: "Strength", description: "Full strength circuit — dumbbell lifts, barbell squats, and deadlifts back to back.", reps: "4 × 8-10", difficulty: "Advanced", muscleGroup: "Full Body", videoUrl: `${CDN}/jarvis-strength-montage_89d7eee5.mp4`, pantherCue: "Control it." },
  { id: "3", name: "Squat-Lunge-Flex Combo", category: "Full Body", description: "Dynamic sequence combining squats, lunges, and power flexes.", reps: "3 × 10 each", difficulty: "Intermediate", muscleGroup: "Full Body", videoUrl: `${CDN}/jarvis-squat-lunge-flex_96c7bdc9.mp4`, pantherCue: "Stay low. Stay ready." },
  { id: "4", name: "High Knees Cardio Blast", category: "Cardio", description: "Vigorous high knees in place — elevate your heart rate and ignite your core.", duration: "4 × 45 sec", difficulty: "Intermediate", muscleGroup: "Core / Cardio", videoUrl: `${CDN}/jarvis-high-knees_39ea0db8.mp4`, pantherCue: "Move silently, like a hunting panther." },
  { id: "5", name: "Sprint Stance Drill", category: "Cardio", description: "Explosive sprint stance transitions. Build fast-twitch power and athletic acceleration.", duration: "6 × 20 sec", difficulty: "Advanced", muscleGroup: "Legs / Cardio", videoUrl: `${CDN}/jarvis-sprint-stance_a110b221.mp4`, pantherCue: "Focus. Hunt begins now." },
  { id: "6", name: "Lunge & Stretch Flow", category: "Mobility", description: "Dynamic lunge with hip flexor stretch. Improve mobility and reduce injury risk.", reps: "3 × 10 each leg", difficulty: "Beginner", muscleGroup: "Hips / Legs", videoUrl: `${CDN}/jarvis-lunge-stretch_5b0b7c7f.mp4`, pantherCue: "Press with precision, not speed." },
  { id: "7", name: "Martial Arts Strike", category: "Full Body", description: "Spinning martial arts strike sequence. Builds rotational power and explosive speed.", reps: "3 × 8 each side", difficulty: "Advanced", muscleGroup: "Core / Full Body", videoUrl: `${CDN}/jarvis-martial-arts_e0b5e10f.mp4`, pantherCue: "No hesitation." },
  { id: "8", name: "Run-Kick-Flex Sequence", category: "Full Body", description: "Running burst into a high kick and double bicep flex. Agility meets raw power.", reps: "4 × 6", difficulty: "Advanced", muscleGroup: "Full Body", videoUrl: `${CDN}/jarvis-run-kick-flex_e7629990.mp4`, pantherCue: "Strong finish." },
  { id: "9", name: "Combat Stance Walk", category: "Motivation", description: "Walk forward with authority, double bicep flex, drop into combat stance. Own the room.", duration: "Use as warm-up ritual", difficulty: "Beginner", muscleGroup: "Mental / Activation", videoUrl: `${CDN}/jarvis-combat-stance_aae0a723.mp4`, pantherCue: "Lock in." },
  { id: "10", name: "Power Pose Hold", category: "Motivation", description: "Static power pose — control your breathing, visualize your goal, activate your mindset.", duration: "3 × 60 sec", difficulty: "Beginner", muscleGroup: "Mental / Core", videoUrl: `${CDN}/jarvis-power-pose_05e6e1f9.mp4`, pantherCue: "You earned that." },
  { id: "11", name: "Walk Forward Activation", category: "Mobility", description: "Confident forward walk to prime your body and mind before a heavy session.", duration: "Use as warm-up", difficulty: "Beginner", muscleGroup: "Full Body Activation", videoUrl: `${CDN}/jarvis-walk-forward_7a4d2ac5.mp4`, pantherCue: "Momentum is building." },
  { id: "12", name: "Idle Flex Hold", category: "Motivation", description: "Subtle flex and head turn — a reminder of what you're building. Use between sets.", duration: "Between sets", difficulty: "Beginner", muscleGroup: "Mental", videoUrl: `${CDN}/jarvis-idle-flex_ba34833b.mp4`, pantherCue: "Consistency is power." },
  { id: "13", name: "PANTHER Roar Activation", category: "Motivation", description: "Fierce roar to ignite your session. Play this before your heaviest lift.", duration: "Pre-workout ritual", difficulty: "Beginner", muscleGroup: "Mental / CNS", videoUrl: `${CDN}/jarvis-roar_c3a368a6.mp4`, pantherCue: "Apex discipline unlocked." },
  { id: "14", name: "PANTHER Snarl Focus", category: "Motivation", description: "Intense snarl and stare — lock in your focus before a competition or max effort set.", duration: "Pre-set ritual", difficulty: "Beginner", muscleGroup: "Mental", videoUrl: `${CDN}/jarvis-snarl_d63dad14.mp4`, pantherCue: "Reset. Go again." },
];

const CATEGORIES = ["All", "Strength", "Cardio", "Full Body", "Mobility", "Motivation"] as const;
type Category = typeof CATEGORIES[number];

const DIFF_COLORS: Record<string, string> = {
  Beginner: "#00CC66",
  Intermediate: "#FF6600",
  Advanced: "#FF4444",
};

export default function Move() {
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [activeVideo, setActiveVideo] = useState<Exercise | null>(null);
  const [rpe, setRpe] = useState(7);
  const [loggedIds, setLoggedIds] = useState<Set<string>>(new Set());

  const filtered = activeCategory === "All"
    ? EXERCISES
    : EXERCISES.filter(e => e.category === activeCategory);

  const handleLog = (ex: Exercise) => {
    haptics.medium();
    setLoggedIds(prev => new Set([...prev, ex.id]));
  };

  const handleStart = (ex: Exercise) => {
    haptics.light();
    setActiveVideo(ex);
  };

  return (
    <AppShell title="LET'S MOVE" showBack bottomPad={80}>
    <div style={{ backgroundColor: "#080808", color: "#fff" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .move-fade { animation: fadeUp 0.4s ease both; }
        .workout-card { background: rgba(17,17,17,0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; cursor: pointer; transition: border-color 0.2s ease, transform 0.15s ease; }
        .workout-card:hover { border-color: rgba(255,102,0,0.4); transform: translateY(-2px); }
        .workout-card:active { transform: scale(0.98); }
        .cat-pill { flex-shrink: 0; padding: 8px 16px; border-radius: 100px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 2px; border: 1px solid; cursor: pointer; transition: all 0.15s ease; }
        .cat-pill-active { background: #FF6600; color: #fff; border-color: #FF6600; }
        .cat-pill-inactive { background: transparent; color: #666; border-color: #333; }
        .rpe-slider { -webkit-appearance: none; width: 100%; height: 4px; border-radius: 2px; outline: none; cursor: pointer; }
        .rpe-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #FF6600; cursor: pointer; box-shadow: 0 0 8px rgba(255,102,0,0.6); }
        .ai-va-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 100px; background: rgba(200,151,58,0.12); border: 1px solid rgba(200,151,58,0.3); font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 1px; color: #C8973A; }
      `}</style>

      <main className="move-fade" style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* header handled by AppShell */}
        <div style={{ paddingTop: 16 }} />

        {/* ─── RPE SLIDER (Doc 17 §4.2) ─── */}
        <div style={{ backgroundColor: "#111", border: "1px solid #222", borderRadius: 14, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 3, color: "#888" }}>RATE OF PERCEIVED EXERTION</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: rpe >= 8 ? "#FF4444" : rpe >= 6 ? "#FF6600" : "#00CC66" }}>{rpe}/10</div>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={rpe}
            onChange={e => setRpe(Number(e.target.value))}
            className="rpe-slider"
            style={{ background: `linear-gradient(to right, #FF6600 ${rpe * 10}%, #333 ${rpe * 10}%)` }}
          />
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#555", marginTop: 6 }}>
            {rpe >= 9 ? "MAXIMUM EFFORT — Panther Mode" : rpe >= 7 ? "HARD — Optimal training zone" : rpe >= 5 ? "MODERATE — Building base" : "EASY — Active recovery"}
          </div>
        </div>

        {/* ─── CATEGORY PILLS ─── */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 16 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { haptics.light(); setActiveCategory(cat); }}
              className={`cat-pill ${activeCategory === cat ? "cat-pill-active" : "cat-pill-inactive"}`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ─── EXERCISE CARDS ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(ex => (
            <div key={ex.id} className="workout-card" onClick={() => handleStart(ex)}>
              {/* Video thumbnail */}
              <div style={{ position: "relative", aspectRatio: "16/9", backgroundColor: "#000", overflow: "hidden" }}>
                <video
                  src={ex.videoUrl}
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }}
                  muted
                  loop
                  playsInline
                  onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                  onMouseLeave={e => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                />
                {/* Play button */}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "rgba(255,102,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(255,102,0,0.5)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                  </div>
                </div>
                {/* Difficulty badge */}
                <div style={{ position: "absolute", top: 8, right: 8, padding: "3px 8px", borderRadius: 100, backgroundColor: `${DIFF_COLORS[ex.difficulty]}20`, border: `1px solid ${DIFF_COLORS[ex.difficulty]}60`, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: DIFF_COLORS[ex.difficulty] }}>
                  {ex.difficulty.toUpperCase()}
                </div>
                {/* Muscle group */}
                <div style={{ position: "absolute", bottom: 8, left: 8, padding: "3px 8px", borderRadius: 100, backgroundColor: "rgba(0,0,0,0.6)", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                  {ex.muscleGroup}
                </div>
              </div>

              {/* Card content */}
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 1, color: "#fff" }}>{ex.name}</div>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#FF6600", backgroundColor: "rgba(255,102,0,0.1)", padding: "3px 8px", borderRadius: 100 }}>{ex.category.toUpperCase()}</span>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#888", lineHeight: 1.5, marginBottom: 10 }}>{ex.description}</div>

                {/* Panther voice cue */}
                {ex.pantherCue && (
                  <div style={{ borderLeft: "2px solid #FF6600", paddingLeft: 10, marginBottom: 12 }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#FF6600", letterSpacing: 1 }}>🐆 "{ex.pantherCue}"</div>
                  </div>
                )}

                {/* Action row */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: "#FF6600", flex: 1 }}>{ex.reps || ex.duration}</div>
                  <button
                    onClick={e => { e.stopPropagation(); handleLog(ex); }}
                    style={{
                      padding: "8px 16px", borderRadius: 8,
                      backgroundColor: loggedIds.has(ex.id) ? "rgba(0,204,102,0.15)" : "rgba(255,102,0,0.12)",
                      border: `1px solid ${loggedIds.has(ex.id) ? "#00CC66" : "rgba(255,102,0,0.3)"}`,
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2,
                      color: loggedIds.has(ex.id) ? "#00CC66" : "#FF6600",
                      cursor: "pointer",
                    }}
                  >
                    {loggedIds.has(ex.id) ? "✓ LOGGED" : "LOG SET"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── PANTHER ACTION BUTTON STACK (Doc 17 §4.4) ─── */}
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => { haptics.heavy(); navigate("/train"); }}
            style={{ width: "100%", minHeight: 64, borderRadius: 8, fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, backgroundColor: "#8B0000", color: "#C8973A", border: "none", cursor: "pointer" }}
          >
            START FULL PROGRAM →
          </button>
          <button
            onClick={() => { haptics.light(); navigate("/panther-30"); }}
            style={{ width: "100%", minHeight: 56, borderRadius: 8, fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, backgroundColor: "#1A1A1A", color: "#C8973A", border: "1px solid #8B0000", cursor: "pointer" }}
          >
            30-DAY PANTHER CHALLENGE
          </button>
          <button
            onClick={() => { haptics.light(); navigate("/pvp"); }}
            style={{ width: "100%", minHeight: 48, borderRadius: 8, fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 2, backgroundColor: "transparent", color: "#C8973A", border: "1px solid rgba(200,151,58,0.2)", cursor: "pointer" }}
          >
            ⚔️ PVP CHALLENGE
          </button>
        </div>

      </main>

      {/* ─── FULL-SCREEN VIDEO MODAL ─── */}
      {activeVideo && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setActiveVideo(null)}
        >
          <div style={{ width: "100%", maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            {/* Close */}
            <button
              onClick={() => setActiveVideo(null)}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: 2, marginBottom: 12 }}
            >
              ✕ CLOSE
            </button>
            {/* Video */}
            <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
              <video src={activeVideo.videoUrl} style={{ width: "100%" }} autoPlay loop playsInline controls />
            </div>
            {/* Info */}
            <div style={{ marginTop: 16, padding: "0 4px" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 2, color: "#fff", marginBottom: 4 }}>{activeVideo.name}</div>
              {activeVideo.pantherCue && (
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "#FF6600", marginBottom: 8 }}>🐆 "{activeVideo.pantherCue}"</div>
              )}
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#888", lineHeight: 1.5, marginBottom: 12 }}>{activeVideo.description}</div>
              <div style={{ display: "flex", gap: 16, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12 }}>
                <span style={{ color: "#FF6600" }}>{activeVideo.reps || activeVideo.duration}</span>
                <span style={{ color: "#555" }}>{activeVideo.muscleGroup}</span>
              </div>
              {/* Log button */}
              <button
                onClick={() => { handleLog(activeVideo); setActiveVideo(null); }}
                style={{ width: "100%", marginTop: 16, minHeight: 56, borderRadius: 8, fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, backgroundColor: loggedIds.has(activeVideo.id) ? "rgba(0,204,102,0.15)" : "#8B0000", color: loggedIds.has(activeVideo.id) ? "#00CC66" : "#C8973A", border: loggedIds.has(activeVideo.id) ? "1px solid #00CC66" : "none", cursor: "pointer" }}
              >
                {loggedIds.has(activeVideo.id) ? "✓ SET LOGGED" : "LOG THIS SET"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AppShell>
  );
}
