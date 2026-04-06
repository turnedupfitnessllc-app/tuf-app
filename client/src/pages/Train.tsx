/**
 * TUF Train Screen — Integration
 * Apply corrected movement into workouts
 * Each workout starts with corrective warm-up → moves into strength
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
    id: 'lower-body',
    name: 'LOWER BODY DAY',
    subtitle: 'Glutes · Quads · Hamstrings',
    icon: '🦵',
    focus: ['Glutes', 'Quads', 'Hamstrings', 'Core'],
    duration: '45 min',
    difficulty: 'Build',
    color: 'from-primary to-red-700',
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
    id: 'core-stability',
    name: 'CORE STABILITY',
    subtitle: 'Deep Core · Anti-Rotation · Bracing',
    icon: '🧱',
    focus: ['Core', 'Stability', 'Posture'],
    duration: '30 min',
    difficulty: 'Foundation',
    color: 'from-blue-600 to-blue-800',
    warmup: ['dead-bug', 'bird-dog', 'chin-tuck'],
    exercises: [
      { name: 'Plank Hold', sets: 3, reps: '45s', rest: '45s', cue: 'Neutral spine — no hip sag' },
      { name: 'Pallof Press', sets: 3, reps: '12 each', rest: '60s', cue: 'Resist rotation — brace hard' },
      { name: 'Suitcase Carry', sets: 3, reps: '30m each', rest: '60s', cue: 'Tall spine, no lean' },
      { name: 'Ab Wheel Rollout', sets: 3, reps: '8-10', rest: '90s', cue: 'Hips don\'t drop — core stays braced' },
      { name: 'Copenhagen Plank', sets: 2, reps: '20s each', rest: '45s', cue: 'Hip stays up — adductors fire' },
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
    color: 'from-emerald-600 to-emerald-800',
    warmup: ['glute-bridge', 'wall-angel', 'thoracic-extension'],
    exercises: [
      { name: 'Trap Bar Deadlift', sets: 4, reps: '6-8', rest: '2min', cue: 'Neutral spine, hips and shoulders rise together' },
      { name: 'Incline Dumbbell Press', sets: 4, reps: '10', rest: '90s', cue: 'Elbows 45° — no flare' },
      { name: 'Single Arm Row', sets: 3, reps: '10 each', rest: '60s', cue: 'Drive elbow back, not up' },
      { name: 'Goblet Squat', sets: 3, reps: '12', rest: '60s', cue: 'Chest tall, knees track toes' },
      { name: 'Farmer\'s Carry', sets: 3, reps: '40m', rest: '90s', cue: 'Tall, tight, and controlled' },
    ],
  },
  // ── TUF PROGRAMS FROM DRIVE ────────────────────────────────────────────────
  {
    id: 'tuf-6-week-challenge',
    name: 'TUF 6-WEEK CHALLENGE',
    subtitle: 'Marc’s Original Program · 3 Days/Week',
    icon: '🔥',
    focus: ['Full Body', 'Strength', 'Cardio', 'Core'],
    duration: '45-55 min',
    difficulty: 'Build' as const,
    color: 'from-primary to-orange-600',
    warmup: ['glute-bridge', 'hip-flexor-stretch', 'thoracic-extension'],
    exercises: [
      { name: 'Kettlebell Goblet Squat', sets: 3, reps: '12', rest: '60s', cue: 'Chest tall, knees track toes, elbows between knees at depth.' },
      { name: 'Kettlebell Swing', sets: 3, reps: '15', rest: '60s', cue: 'Hip hinge — not a squat. Drive hips forward, let the bell float.' },
      { name: 'Dumbbell Chest Press', sets: 3, reps: '10', rest: '90s', cue: 'Elbows 45°. Lower to chest. Press up and in.' },
      { name: 'Dumbbell Bent Over Row', sets: 3, reps: '10', rest: '90s', cue: 'Hinge at hip. Drive elbow back, not up. Squeeze at top.' },
      { name: 'Swiss Ball Hamstring Curl', sets: 3, reps: '12', rest: '60s', cue: 'Hips up. Curl heels to glutes. Don\'t let hips drop.' },
      { name: 'Burpees', sets: 3, reps: '10', rest: '60s', cue: 'Controlled down. Explosive up. Land soft.' },
    ],
    weeks: [
      { label: 'Weeks 1–2 — Foundation', note: 'Build the base. Focus on form over weight.' },
      { label: 'Weeks 3–4 — Build', note: 'Add load. Keep the form you built.' },
      { label: 'Weeks 5–6 — Perform', note: 'Push the intensity. You\'ve earned it.' },
    ],
  } as WorkoutProgram,
  {
    id: 'tuf-busy-people',
    name: 'BUSY PEOPLE PROGRAM',
    subtitle: 'No Excuses · Anywhere · Any Time',
    icon: '⏱️',
    focus: ['Full Body', 'Efficiency', 'Minimal Equipment'],
    duration: '20-30 min',
    difficulty: 'Foundation' as const,
    color: 'from-slate-600 to-slate-800',
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
  // ── NEW PROGRAMS ──────────────────────────────────────────────────────────
  {
    id: 'upper-body',
    name: 'UPPER BODY DAY',
    subtitle: 'Push · Pull · Shoulder Health',
    icon: '💪',
    focus: ['Chest', 'Back', 'Shoulders', 'Arms'],
    duration: '45 min',
    difficulty: 'Build' as const,
    color: 'from-violet-600 to-violet-800',
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
    id: 'mobility-flow',
    name: 'MOBILITY FLOW',
    subtitle: 'Move Better · Feel Better · Recover Faster',
    icon: '🧘',
    focus: ['Mobility', 'Flexibility', 'Recovery'],
    duration: '25 min',
    difficulty: 'Foundation' as const,
    color: 'from-teal-600 to-teal-800',
    warmup: ['cat-cow', 'hip-flexor-stretch', 'thoracic-extension'],
    exercises: [
      { name: 'World’s Greatest Stretch', sets: 2, reps: '5 each side', rest: '30s', cue: 'Hip flexor, thoracic rotation, hamstring — all in one.' },
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
    difficulty: 'Foundation' as const,
    color: 'from-amber-600 to-amber-800',
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

const DIFFICULTY_COLORS = {
  Foundation: 'bg-blue-500/20 text-blue-400',
  Build: 'bg-primary/20 text-primary',
  Perform: 'bg-emerald-500/20 text-emerald-400',
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
      // Store warmup correctives for the Correct screen
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

  if (view === 'detail' && selectedProgram) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <main className="max-w-[480px] mx-auto px-4 pt-6">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors"
          >
            ← Back
          </button>

          {/* Header */}
          <div className={`rounded-2xl bg-gradient-to-r ${selectedProgram.color} p-6 mb-6`}>
            <div className="text-4xl mb-2">{selectedProgram.icon}</div>
            <h1 className="text-2xl font-black text-white tracking-tight">{selectedProgram.name}</h1>
            <p className="text-white/80 text-sm mt-1">{selectedProgram.subtitle}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs font-bold text-white/70">{selectedProgram.duration}</span>
              <span className="text-xs font-bold text-white/70">·</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full bg-white/20 text-white`}>
                {selectedProgram.difficulty}
              </span>
            </div>
          </div>

          {/* Corrective Warm-up */}
          <div className="mb-6">
            <p className="text-xs font-black tracking-widest text-muted-foreground mb-3">CORRECTIVE WARM-UP</p>
            <div className="space-y-2">
              {selectedProgram.warmup.map((id, i) => (
                <div key={id} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-black flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm font-bold text-foreground capitalize">
                    {id.replace(/-/g, ' ')}
                  </p>
                  <span className="ml-auto text-xs text-primary font-bold">CORRECTIVE</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Workout */}
          <div className="mb-6">
            <p className="text-xs font-black tracking-widest text-muted-foreground mb-3">MAIN WORKOUT</p>
            <div className="space-y-3">
              {selectedProgram.exercises.map((ex, i) => (
                <div key={i} className="p-4 rounded-2xl bg-card border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-black text-sm text-foreground">{ex.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{ex.sets} × {ex.reps}</span>
                      <span>·</span>
                      <span>{ex.rest}</span>
                    </div>
                  </div>
                  <p className="text-xs text-primary font-bold">"{ex.cue}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleStartWorkout}
            className="w-full py-4 rounded-2xl bg-primary text-white font-black text-base tracking-wide shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
          >
            START WARM-UP →
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-[480px] mx-auto px-4 pt-6">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-black tracking-widest text-muted-foreground mb-1">STEP 3 OF 4</p>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            TRAIN <span className="text-primary">WITH PURPOSE</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Every workout starts with corrective prep.</p>
        </div>

        {/* Program Cards */}
        <div className="space-y-4">
          {PROGRAMS.map((program) => (
            <button
              key={program.id}
              onClick={() => handleSelectProgram(program)}
              className="w-full text-left rounded-2xl overflow-hidden shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
            >
              <div className={`bg-gradient-to-r ${program.color} p-5`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-3xl mb-2">{program.icon}</div>
                    <h2 className="font-black text-lg text-white tracking-tight">{program.name}</h2>
                    <p className="text-white/80 text-sm">{program.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-black px-2 py-1 rounded-full bg-white/20 text-white`}>
                      {program.difficulty}
                    </span>
                    <p className="text-white/70 text-xs mt-2">{program.duration}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border-x border-b border-border p-3 flex items-center gap-2">
                <span className="text-xs font-bold text-primary">CORRECTIVE WARM-UP INCLUDED</span>
                <span className="ml-auto text-muted-foreground">›</span>
              </div>
            </button>
          ))}
        </div>

        {/* Live Coaching CTA */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/live')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/60 active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
              📷
            </div>
            <div className="flex-1 text-left">
              <p className="font-black text-sm tracking-wide text-foreground">LIVE FORM CHECK</p>
              <p className="text-xs text-muted-foreground">Camera · Real-time AI coaching</p>
            </div>
            <span className="text-muted-foreground">›</span>
          </button>
        </div>

      </main>
    </div>
  );
}
