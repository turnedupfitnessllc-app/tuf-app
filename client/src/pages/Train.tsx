/**
 * TUF Train Screen — Premium Dark Edition
 */
import { useState } from 'react';
import { useLocation } from 'wouter';

interface WorkoutProgram {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  focus: string[];
  duration: string;
  difficulty: 'Foundation' | 'Build' | 'Perform';
  warmup: string[];
  exercises: WorkoutExercise[];
  color: string;
  glow: string;
  accent: string;
}

interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  cue: string;
}

const PROGRAMS: WorkoutProgram[] = [
  {
    id: 'tuf-6-week-challenge',
    name: 'TUF 6-WEEK CHALLENGE',
    subtitle: "Marc's Original Program · 3 Days/Week",
    icon: '🔥',
    focus: ['Full Body', 'Strength', 'Cardio', 'Core'],
    duration: '45–55 min',
    difficulty: 'Build',
    color: 'from-red-600 via-orange-600 to-amber-500',
    glow: 'rgba(220,38,38,0.35)',
    accent: '#FF4500',
    warmup: ['glute-bridge', 'hip-flexor-stretch', 'thoracic-extension'],
    exercises: [
      { name: 'Kettlebell Goblet Squat', sets: 3, reps: '12', rest: '60s', cue: 'Chest tall, knees track toes, elbows between knees at depth.' },
      { name: 'Kettlebell Swing', sets: 3, reps: '15', rest: '60s', cue: 'Hip hinge — not a squat. Drive hips forward, let the bell float.' },
      { name: 'Dumbbell Chest Press', sets: 3, reps: '10', rest: '90s', cue: 'Elbows 45°. Lower to chest. Press up and in.' },
      { name: 'Dumbbell Bent Over Row', sets: 3, reps: '10', rest: '90s', cue: 'Hinge at hip. Drive elbow back, not up. Squeeze at top.' },
      { name: 'Swiss Ball Hamstring Curl', sets: 3, reps: '12', rest: '60s', cue: "Hips up. Curl heels to glutes. Don't let hips drop." },
      { name: 'Burpees', sets: 3, reps: '10', rest: '60s', cue: 'Controlled down. Explosive up. Land soft.' },
    ],
  },
  {
    id: 'lower-body',
    name: 'LOWER BODY DAY',
    subtitle: 'Glutes · Quads · Hamstrings',
    icon: '🦵',
    focus: ['Glutes', 'Quads', 'Hamstrings', 'Core'],
    duration: '45 min',
    difficulty: 'Build',
    color: 'from-rose-700 via-red-600 to-red-800',
    glow: 'rgba(190,18,60,0.35)',
    accent: '#e11d48',
    warmup: ['glute-bridge', 'hip-flexor-stretch', 'lateral-band-walk'],
    exercises: [
      { name: 'Goblet Squat', sets: 4, reps: '10-12', rest: '60s', cue: 'Knees track over toes' },
      { name: 'Romanian Deadlift', sets: 3, reps: '10', rest: '90s', cue: 'Hip hinge — not a squat' },
      { name: 'Bulgarian Split Squat', sets: 3, reps: '8 each', rest: '90s', cue: 'Front shin vertical' },
      { name: 'Hip Thrust', sets: 4, reps: '12', rest: '60s', cue: 'Drive through heels, squeeze at top' },
      { name: 'Lateral Band Walk', sets: 3, reps: '15 each', rest: '45s', cue: 'Push out against the band' },
    ],
  },
  {
    id: 'upper-body',
    name: 'UPPER BODY DAY',
    subtitle: 'Push · Pull · Shoulder Health',
    icon: '💪',
    focus: ['Chest', 'Back', 'Shoulders', 'Arms'],
    duration: '45 min',
    difficulty: 'Build',
    color: 'from-violet-700 via-purple-600 to-indigo-700',
    glow: 'rgba(124,58,237,0.35)',
    accent: '#7c3aed',
    warmup: ['wall-angel', 'band-pull-apart', 'face-pull'],
    exercises: [
      { name: 'Dumbbell Bench Press', sets: 4, reps: '10-12', rest: '90s', cue: 'Elbows 45° — no flare. Chest to stretch.' },
      { name: 'Chest-Supported Row', sets: 4, reps: '10', rest: '90s', cue: 'Drive elbows back. Squeeze shoulder blades.' },
      { name: 'Overhead Press', sets: 3, reps: '8-10', rest: '90s', cue: 'Brace core. Press straight up — no arch.' },
      { name: 'Cable Pulldown', sets: 3, reps: '12', rest: '60s', cue: 'Pull to upper chest. Elbows drive down.' },
      { name: 'Lateral Raise', sets: 3, reps: '15', rest: '45s', cue: 'Lead with elbows. Stop at shoulder height.' },
      { name: 'Tricep Pushdown', sets: 3, reps: '15', rest: '45s', cue: 'Elbows locked at sides. Full extension.' },
    ],
  },
  {
    id: 'full-body-flow',
    name: 'FULL BODY FLOW',
    subtitle: 'Strength + Movement Integration',
    icon: '⚡',
    focus: ['Full Body', 'Strength', 'Movement'],
    duration: '55 min',
    difficulty: 'Perform',
    color: 'from-emerald-600 via-teal-600 to-cyan-700',
    glow: 'rgba(5,150,105,0.35)',
    accent: '#059669',
    warmup: ['glute-bridge', 'wall-angel', 'thoracic-extension'],
    exercises: [
      { name: 'Trap Bar Deadlift', sets: 4, reps: '6-8', rest: '2min', cue: 'Neutral spine, hips and shoulders rise together' },
      { name: 'Incline Dumbbell Press', sets: 4, reps: '10', rest: '90s', cue: 'Elbows 45° — no flare' },
      { name: 'Single Arm Row', sets: 3, reps: '10 each', rest: '60s', cue: 'Drive elbow back, not up' },
      { name: 'Goblet Squat', sets: 3, reps: '12', rest: '60s', cue: 'Chest tall, knees track toes' },
      { name: "Farmer's Carry", sets: 3, reps: '40m', rest: '90s', cue: 'Tall, tight, and controlled' },
    ],
  },
  {
    id: 'core-stability',
    name: 'CORE STABILITY',
    subtitle: 'Deep Core · Anti-Rotation · Bracing',
    icon: '🧱',
    focus: ['Core', 'Stability', 'Posture'],
    duration: '30 min',
    difficulty: 'Foundation',
    color: 'from-blue-700 via-blue-600 to-sky-700',
    glow: 'rgba(29,78,216,0.35)',
    accent: '#1d4ed8',
    warmup: ['dead-bug', 'bird-dog', 'chin-tuck'],
    exercises: [
      { name: 'Plank Hold', sets: 3, reps: '45s', rest: '45s', cue: 'Neutral spine — no hip sag' },
      { name: 'Pallof Press', sets: 3, reps: '12 each', rest: '60s', cue: 'Resist rotation — brace hard' },
      { name: 'Suitcase Carry', sets: 3, reps: '30m each', rest: '60s', cue: 'Tall spine, no lean' },
      { name: 'Ab Wheel Rollout', sets: 3, reps: '8-10', rest: '90s', cue: "Hips don't drop — core stays braced" },
      { name: 'Copenhagen Plank', sets: 2, reps: '20s each', rest: '45s', cue: 'Hip stays up — adductors fire' },
    ],
  },
  {
    id: 'tuf-busy-people',
    name: 'BUSY PEOPLE PROGRAM',
    subtitle: 'No Excuses · Anywhere · Any Time',
    icon: '⏱️',
    focus: ['Full Body', 'Efficiency', 'Minimal Equipment'],
    duration: '20–30 min',
    difficulty: 'Foundation',
    color: 'from-slate-600 via-slate-500 to-zinc-600',
    glow: 'rgba(71,85,105,0.35)',
    accent: '#475569',
    warmup: ['cat-cow', 'glute-bridge', 'chin-tuck'],
    exercises: [
      { name: 'Bodyweight Squat', sets: 3, reps: '15', rest: '45s', cue: 'Chest tall. Knees track toes. Full depth.' },
      { name: 'Push-Up', sets: 3, reps: '10-15', rest: '45s', cue: 'Rigid plank. Elbows 45°. Chest to floor.' },
      { name: 'Reverse Lunge', sets: 3, reps: '10 each', rest: '45s', cue: 'Front shin vertical. Torso upright.' },
      { name: 'Plank', sets: 3, reps: '30-45s', rest: '30s', cue: 'Neutral spine. Glutes braced. No sagging.' },
      { name: 'Glute Bridge', sets: 3, reps: '15', rest: '30s', cue: 'Drive through heels. Squeeze at top.' },
      { name: 'Mountain Climbers', sets: 3, reps: '20 each', rest: '45s', cue: 'Hips level. Drive knees in fast.' },
    ],
  },
  {
    id: 'mobility-flow',
    name: 'MOBILITY FLOW',
    subtitle: 'Move Better · Feel Better · Recover Faster',
    icon: '🧘',
    focus: ['Mobility', 'Flexibility', 'Recovery'],
    duration: '25 min',
    difficulty: 'Foundation',
    color: 'from-teal-700 via-teal-600 to-cyan-600',
    glow: 'rgba(15,118,110,0.35)',
    accent: '#0f766e',
    warmup: ['cat-cow', 'hip-flexor-stretch', 'thoracic-extension'],
    exercises: [
      { name: "World's Greatest Stretch", sets: 2, reps: '5 each side', rest: '30s', cue: 'Hip flexor, thoracic rotation, hamstring — all in one.' },
      { name: 'Pigeon Pose', sets: 1, reps: '60s each', rest: '15s', cue: 'Hips square. Breathe into the hip.' },
      { name: 'Lateral Lunge', sets: 2, reps: '8 each', rest: '30s', cue: 'Sit into it. Straight leg stays straight.' },
      { name: 'Ankle Mobility Drill', sets: 2, reps: '10 each', rest: '20s', cue: 'Heel down. Drive knee over toes.' },
      { name: 'Thoracic Rotation', sets: 2, reps: '8 each', rest: '20s', cue: 'Rotate from the T-spine. Hips stay still.' },
      { name: 'Hip 90/90 Stretch', sets: 2, reps: '45s each', rest: '15s', cue: 'Both hips at 90°. Sit tall — no lean.' },
    ],
  },
  {
    id: 'recovery-40-plus',
    name: '40+ RECOVERY DAY',
    subtitle: 'Designed for the 40+ Athlete',
    icon: '💆',
    focus: ['Recovery', 'Corrective', 'Longevity'],
    duration: '30 min',
    difficulty: 'Foundation',
    color: 'from-amber-700 via-amber-600 to-yellow-600',
    glow: 'rgba(180,83,9,0.35)',
    accent: '#b45309',
    warmup: ['foam-roll-hip-flexors', 'foam-roll-upper-back', 'foam-roll-calves'],
    exercises: [
      { name: 'Glute Bridge', sets: 3, reps: '15', rest: '45s', cue: 'Drive through heels. Squeeze at top.' },
      { name: 'Dead Bug', sets: 3, reps: '8 each', rest: '45s', cue: 'Low back flat. Slow and controlled.' },
      { name: 'Wall Angel', sets: 3, reps: '10', rest: '45s', cue: 'Head, back, glutes on wall. Earn every inch.' },
      { name: 'Chin Tuck', sets: 3, reps: '12', rest: '30s', cue: 'Double chin. Hold 5 seconds.' },
      { name: 'Bird Dog', sets: 3, reps: '8 each', rest: '45s', cue: 'Neutral spine. Reach long, not high.' },
      { name: 'Calf Stretch', sets: 2, reps: '30s each', rest: '15s', cue: 'Straight leg then bent knee. Both positions.' },
    ],
  },
];

const DIFFICULTY_STYLES = {
  Foundation: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
  Build: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30' },
  Perform: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
};

export default function Train() {
  const [, navigate] = useLocation();
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);
  const [view, setView] = useState<'list' | 'detail'>('list');

  const handleSelectProgram = (program: WorkoutProgram) => {
    setSelectedProgram(program);
    setView('detail');
  };

  const handleStartWorkout = () => {
    if (selectedProgram) {
      localStorage.setItem('tuf_correctives', JSON.stringify({
        issue: {
          id: `warmup-${selectedProgram.id}`,
          label: `${selectedProgram.name} Warm-up`,
          correctives: selectedProgram.warmup,
        },
        timestamp: Date.now(),
        returnTo: '/train',
      }));
      navigate('/correct');
    }
  };

  // DETAIL VIEW
  if (view === 'detail' && selectedProgram) {
    const diff = DIFFICULTY_STYLES[selectedProgram.difficulty];
    return (
      <div className="min-h-screen bg-[#080808] pb-28">
        <main className="max-w-[480px] mx-auto px-4 pt-6">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground mb-6 hover:text-white transition-colors"
          >
            ← BACK TO PROGRAMS
          </button>

          {/* Hero Card */}
          <div
            className="relative rounded-3xl overflow-hidden mb-6"
            style={{ boxShadow: `0 8px 40px ${selectedProgram.glow}, 0 2px 8px rgba(0,0,0,0.6)` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${selectedProgram.color} opacity-90`} />
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 12px)',
              }}
            />
            <div className="relative p-6">
              <div className="text-5xl mb-3 drop-shadow-lg">{selectedProgram.icon}</div>
              <h1
                className="text-3xl font-black text-white leading-none mb-1"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.06em' }}
              >
                {selectedProgram.name}
              </h1>
              <p className="text-white/75 text-sm font-medium mb-4">{selectedProgram.subtitle}</p>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${diff.bg} ${diff.text} ${diff.border}`}>
                  {selectedProgram.difficulty.toUpperCase()}
                </span>
                <span className="text-white/60 text-xs font-bold">·</span>
                <span className="text-white/70 text-xs font-bold">{selectedProgram.duration}</span>
              </div>
            </div>
          </div>

          {/* Corrective Warm-Up Strip */}
          <div className="mb-6">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl mb-3"
              style={{
                background: 'rgba(255,69,0,0.08)',
                border: '1px solid rgba(255,69,0,0.2)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span className="text-xs font-black tracking-widest text-primary">CORRECTIVE WARM-UP</span>
              <span className="ml-auto text-xs text-muted-foreground">NASM Protocol</span>
            </div>
            <div className="space-y-2">
              {selectedProgram.warmup.map((id, i) => (
                <div
                  key={id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: 'rgba(255,69,0,0.05)',
                    border: '1px solid rgba(255,69,0,0.15)',
                  }}
                >
                  <span
                    className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 text-white"
                    style={{ background: selectedProgram.accent }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm font-bold text-foreground capitalize">
                    {id.replace(/-/g, ' ')}
                  </p>
                  <span className="ml-auto text-xs font-bold" style={{ color: selectedProgram.accent }}>
                    CORRECTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Workout */}
          <div className="mb-8">
            <p className="text-xs font-black tracking-widest text-muted-foreground mb-3">MAIN WORKOUT</p>
            <div className="space-y-3">
              {selectedProgram.exercises.map((ex, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-black text-sm text-white">{ex.name}</p>
                    <div
                      className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2"
                      style={{
                        background: selectedProgram.glow,
                        color: 'rgba(255,255,255,0.85)',
                      }}
                    >
                      {ex.sets} x {ex.reps}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold italic" style={{ color: selectedProgram.accent }}>
                      {ex.cue}
                    </p>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{ex.rest}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleStartWorkout}
            className="w-full py-4 rounded-2xl text-white font-black active:scale-[0.98] transition-all"
            style={{
              background: `linear-gradient(135deg, ${selectedProgram.accent}, #FF4500)`,
              boxShadow: `0 4px 24px ${selectedProgram.glow}`,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '1.1rem',
              letterSpacing: '0.1em',
            }}
          >
            START WARM-UP
          </button>
        </main>
      </div>
    );
  }

  // LIST VIEW
  const featured = PROGRAMS[0];

  return (
    <div className="min-h-screen bg-[#080808] pb-28">
      <main className="max-w-[480px] mx-auto px-4 pt-6">

        {/* Header */}
        <div className="mb-7">
          <p className="text-xs font-black tracking-widest text-muted-foreground mb-1">STEP 3 OF 4</p>
          <h1
            className="font-black leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.4rem', letterSpacing: '0.06em' }}
          >
            TRAIN <span className="text-primary">WITH PURPOSE</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Every workout starts with corrective prep.</p>
        </div>

        {/* FEATURED HERO CARD */}
        <button
          onClick={() => handleSelectProgram(featured)}
          className="w-full text-left rounded-3xl overflow-hidden mb-5 active:scale-[0.98] transition-all"
          style={{ boxShadow: `0 8px 48px ${featured.glow}, 0 2px 12px rgba(0,0,0,0.7)` }}
        >
          <div className="relative">
            <div className={`bg-gradient-to-br ${featured.color} p-6 pb-8`}>
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 1px, transparent 1px, transparent 14px)',
                }}
              />
              <div
                className="absolute top-4 right-4 text-xs font-black px-3 py-1 rounded-full text-white"
                style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }}
              >
                FEATURED
              </div>
              <div className="relative">
                <div className="text-5xl mb-3 drop-shadow-lg">{featured.icon}</div>
                <h2
                  className="text-white font-black leading-none mb-1"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.9rem', letterSpacing: '0.06em' }}
                >
                  {featured.name}
                </h2>
                <p className="text-white/75 text-sm">{featured.subtitle}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                    {featured.difficulty.toUpperCase()}
                  </span>
                  <span className="text-white/60 text-xs">·</span>
                  <span className="text-white/70 text-xs font-bold">{featured.duration}</span>
                  <span className="text-white/60 text-xs">·</span>
                  <span className="text-white/70 text-xs font-bold">{featured.exercises.length} exercises</span>
                </div>
              </div>
            </div>
            <div
              className="flex items-center gap-2 px-5 py-3"
              style={{
                background: 'rgba(255,69,0,0.12)',
                backdropFilter: 'blur(12px)',
                borderTop: '1px solid rgba(255,69,0,0.25)',
              }}
            >
              <span className="text-xs font-black tracking-widest text-primary">CORRECTIVE WARM-UP INCLUDED</span>
              <span className="ml-auto text-white/50 text-base">›</span>
            </div>
          </div>
        </button>

        {/* ALL PROGRAMS */}
        <p className="text-xs font-black tracking-widest text-muted-foreground mb-3">ALL PROGRAMS</p>
        <div className="space-y-3">
          {PROGRAMS.slice(1).map((program) => {
            const diff = DIFFICULTY_STYLES[program.difficulty];
            return (
              <button
                key={program.id}
                onClick={() => handleSelectProgram(program)}
                className="w-full text-left rounded-2xl overflow-hidden active:scale-[0.98] transition-all"
                style={{ boxShadow: `0 4px 24px ${program.glow}, 0 1px 6px rgba(0,0,0,0.5)` }}
              >
                <div className={`relative bg-gradient-to-r ${program.color} px-5 py-4`}>
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 10px)',
                    }}
                  />
                  <div className="relative flex items-center gap-4">
                    <span className="text-3xl drop-shadow">{program.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-white font-black leading-none truncate"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.15rem', letterSpacing: '0.06em' }}
                      >
                        {program.name}
                      </h3>
                      <p className="text-white/70 text-xs mt-0.5 truncate">{program.subtitle}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${diff.bg} ${diff.text} ${diff.border}`}>
                        {program.difficulty.toUpperCase()}
                      </span>
                      <p className="text-white/60 text-xs mt-1">{program.duration}</p>
                    </div>
                  </div>
                </div>
                <div
                  className="flex items-center gap-2 px-5 py-2.5"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderTop: `1px solid ${program.glow}`,
                  }}
                >
                  <span className="text-xs font-bold text-primary">CORRECTIVE WARM-UP</span>
                  <span className="ml-auto text-muted-foreground text-base">›</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Coaching CTA */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/live')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl active:scale-[0.98] transition-all"
            style={{
              background: 'rgba(255,69,0,0.06)',
              border: '1.5px dashed rgba(255,69,0,0.35)',
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'rgba(255,69,0,0.12)' }}
            >
              📷
            </div>
            <div className="flex-1 text-left">
              <p
                className="font-black text-sm tracking-widest text-white"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}
              >
                LIVE FORM CHECK
              </p>
              <p className="text-xs text-muted-foreground">Camera · Real-time AI coaching</p>
            </div>
            <span className="text-muted-foreground text-base">›</span>
          </button>
        </div>

      </main>
    </div>
  );
}
