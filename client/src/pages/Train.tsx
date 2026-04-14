/**
 * TUF Train Screen — Premium Dark Edition
 * Integrates Maximum Overdrive + Ass-Assassination from Google Drive
 */
import { useState } from 'react';
import { useLocation } from 'wouter';
import { TUF_PROGRAMS, type TufProgram, type ProgramWeek, type Workout } from '@/data/tufPrograms';

// ─── Legacy quick-access programs (kept for corrective warm-up flow) ──────────
interface QuickProgram {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  focus: string[];
  duration: string;
  difficulty: 'Foundation' | 'Build' | 'Perform';
  warmup: string[];
  exercises: { name: string; sets: number; reps: string; rest: string; cue: string }[];
  color: string;
  glow: string;
  accent: string;
}

const QUICK_PROGRAMS: QuickProgram[] = [
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
      { name: 'Bird Dog', sets: 3, reps: '8 each', rest: '45s', cue: 'Neutral spine. Reach long, not high.' },
    ],
  },
];

const DIFFICULTY_STYLES = {
  Foundation: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
  Build: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30' },
  Perform: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
};

const PROGRAM_STYLES: Record<string, { color: string; glow: string; accent: string; icon: string }> = {
  'maximum-overdrive': {
    color: 'from-red-700 via-orange-600 to-amber-500',
    glow: 'rgba(220,38,38,0.35)',
    accent: '#FF6600',
    icon: '⚡',
  },
  'ass-assassination': {
    color: 'from-rose-700 via-pink-600 to-fuchsia-700',
    glow: 'rgba(190,18,60,0.35)',
    accent: '#e11d48',
    icon: '🔥',
  },
};

type ViewState =
  | { mode: 'list' }
  | { mode: 'program'; program: TufProgram }
  | { mode: 'week'; program: TufProgram; week: ProgramWeek }
  | { mode: 'workout'; program: TufProgram; week: ProgramWeek; workout: Workout }
  | { mode: 'quick'; program: QuickProgram };

export default function Train() {
  const [, navigate] = useLocation();
  const [view, setView] = useState<ViewState>({ mode: 'list' });

  const handleStartWarmup = (warmupIds: string[], programName: string) => {
    localStorage.setItem('tuf_correctives', JSON.stringify({
      issue: {
        id: `warmup-${programName}`,
        label: `${programName} Warm-up`,
        correctives: warmupIds,
      },
      timestamp: Date.now(),
      returnTo: '/train',
    }));
    navigate('/correct');
  };

  // ─── WORKOUT DETAIL VIEW ───────────────────────────────────────────────────
  if (view.mode === 'workout') {
    const { program, week, workout } = view;
    const style = PROGRAM_STYLES[program.id] || PROGRAM_STYLES['maximum-overdrive'];
    const isRoundMarker = (name: string) => name.startsWith('Round');

    return (
      <div className="min-h-screen bg-[#080808] pb-28">
        <main className="max-w-[480px] mx-auto px-4 pt-6">
          <button
            onClick={() => setView({ mode: 'week', program, week })}
            className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground mb-6 hover:text-white transition-colors"
          >
            ← BACK TO WEEK {week.week}
          </button>

          {/* Hero */}
          <div
            className="relative rounded-3xl overflow-hidden mb-6"
            style={{ boxShadow: `0 8px 40px ${style.glow}, 0 2px 8px rgba(0,0,0,0.6)` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${style.color} opacity-90`} />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 12px)' }} />
            <div className="relative p-6">
              <p className="text-white/60 text-xs font-bold tracking-widest mb-1">
                {program.title.toUpperCase()} · WEEK {week.week}
              </p>
              <h1
                className="text-3xl font-black text-white leading-none mb-1"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.06em' }}
              >
                {workout.title.toUpperCase()}
              </h1>
              <p className="text-white/75 text-sm font-medium mb-3">{workout.focus}</p>
              {workout.totalTime && (
                <span className="text-xs font-black px-3 py-1 rounded-full bg-white/20 text-white border border-white/20">
                  {workout.totalTime}
                </span>
              )}
            </div>
          </div>

          {/* Warm-up */}
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4"
            style={{ background: 'rgba(255,102,0,0.08)', border: '1px solid rgba(255,102,0,0.2)' }}
          >
            <span className="text-xs font-black tracking-widest text-primary">WARM-UP</span>
            <span className="ml-auto text-xs text-muted-foreground">{workout.warmup}</span>
          </div>

          {/* Exercises */}
          <p className="text-xs font-black tracking-widest text-muted-foreground mb-3">EXERCISES</p>
          <div className="space-y-2 mb-8">
            {workout.exercises.map((ex, i) => {
              if (isRoundMarker(ex.name)) {
                return (
                  <div key={i} className="flex items-center gap-3 pt-3 pb-1">
                    <div className="h-px flex-1" style={{ background: `${style.glow}` }} />
                    <span className="text-xs font-black tracking-widest" style={{ color: style.accent }}>
                      {ex.name.toUpperCase()}
                    </span>
                    <div className="h-px flex-1" style={{ background: `${style.glow}` }} />
                  </div>
                );
              }
              return (
                <div
                  key={i}
                  className="p-4 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                >
                  <div className="flex items-start justify-between">
                    <p className="font-black text-sm text-white">{ex.name}</p>
                    {(ex.duration || (ex.sets && ex.reps)) && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 text-white"
                        style={{ background: style.glow }}
                      >
                        {ex.duration || `${ex.sets} × ${ex.reps}`}
                      </span>
                    )}
                  </div>
                  {ex.note && (
                    <p className="text-xs text-muted-foreground mt-1 italic">{ex.note}</p>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => handleStartWarmup(['glute-bridge', 'hip-flexor-stretch', 'thoracic-extension'], workout.title)}
            className="w-full py-4 rounded-2xl text-white font-black active:scale-[0.98] transition-all"
            style={{
              background: `linear-gradient(135deg, ${style.accent}, #FF6600)`,
              boxShadow: `0 4px 24px ${style.glow}`,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '1.1rem',
              letterSpacing: '0.1em',
            }}
          >
            START CORRECTIVE WARM-UP
          </button>
        </main>
      </div>
    );
  }

  // ─── WEEK DETAIL VIEW ─────────────────────────────────────────────────────
  if (view.mode === 'week') {
    const { program, week } = view;
    const style = PROGRAM_STYLES[program.id] || PROGRAM_STYLES['maximum-overdrive'];

    return (
      <div className="min-h-screen bg-[#080808] pb-28">
        <main className="max-w-[480px] mx-auto px-4 pt-6">
          <button
            onClick={() => setView({ mode: 'program', program })}
            className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground mb-6 hover:text-white transition-colors"
          >
            ← BACK TO {program.title.toUpperCase()}
          </button>

          <div className="mb-6">
            <p className="text-xs font-black tracking-widest text-muted-foreground mb-1">
              {program.title.toUpperCase()}
            </p>
            <h1
              className="font-black leading-none text-white mb-1"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.2rem', letterSpacing: '0.06em' }}
            >
              WEEK {week.week}
            </h1>
            <p className="text-sm text-muted-foreground">{week.focus}</p>
          </div>

          <div className="space-y-3">
            {week.workouts.map((workout) => (
              <button
                key={workout.id}
                onClick={() => setView({ mode: 'workout', program, week, workout })}
                className="w-full text-left rounded-2xl overflow-hidden active:scale-[0.98] transition-all"
                style={{ boxShadow: `0 4px 20px ${style.glow}` }}
              >
                <div className={`relative bg-gradient-to-r ${style.color} px-5 py-4`}>
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 10px)' }} />
                  <div className="relative">
                    <h3
                      className="text-white font-black leading-none"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.15rem', letterSpacing: '0.06em' }}
                    >
                      {workout.title.toUpperCase()}
                    </h3>
                    <p className="text-white/70 text-xs mt-0.5">{workout.focus}</p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-2 px-5 py-2.5"
                  style={{ background: 'rgba(255,255,255,0.03)', borderTop: `1px solid ${style.glow}` }}
                >
                  <span className="text-xs font-bold text-primary">
                    {workout.exercises.filter(e => !e.name.startsWith('Round')).length} EXERCISES
                  </span>
                  {workout.totalTime && (
                    <span className="text-xs text-muted-foreground ml-2">· {workout.totalTime}</span>
                  )}
                  <span className="ml-auto text-muted-foreground text-base">›</span>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ─── PROGRAM OVERVIEW VIEW ────────────────────────────────────────────────
  if (view.mode === 'program') {
    const { program } = view;
    const style = PROGRAM_STYLES[program.id] || PROGRAM_STYLES['maximum-overdrive'];

    return (
      <div className="min-h-screen bg-[#080808] pb-28">
        <main className="max-w-[480px] mx-auto px-4 pt-6">
          <button
            onClick={() => setView({ mode: 'list' })}
            className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground mb-6 hover:text-white transition-colors"
          >
            ← BACK TO PROGRAMS
          </button>

          {/* Hero */}
          <div
            className="relative rounded-3xl overflow-hidden mb-6"
            style={{ boxShadow: `0 8px 40px ${style.glow}, 0 2px 8px rgba(0,0,0,0.6)` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${style.color} opacity-90`} />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 12px)' }} />
            <div className="relative p-6">
              <div className="text-5xl mb-3 drop-shadow-lg">{style.icon}</div>
              <h1
                className="text-3xl font-black text-white leading-none mb-1"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.06em' }}
              >
                {program.title.toUpperCase()}
              </h1>
              <p className="text-white/75 text-sm font-medium mb-4">{program.subtitle}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black px-3 py-1 rounded-full bg-white/20 text-white border border-white/20">
                  {program.duration.toUpperCase()}
                </span>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-white/20 text-white border border-white/20">
                  {program.daysPerWeek}x / WEEK
                </span>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-white/20 text-white border border-white/20">
                  {program.level.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div
            className="p-4 rounded-2xl mb-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-sm text-muted-foreground leading-relaxed">{program.description}</p>
          </div>

          {/* Schedule */}
          <div
            className="flex items-start gap-3 p-4 rounded-2xl mb-6"
            style={{ background: 'rgba(255,102,0,0.06)', border: '1px solid rgba(255,102,0,0.15)' }}
          >
            <span className="text-primary text-lg flex-shrink-0">📅</span>
            <div>
              <p className="text-xs font-black tracking-widest text-primary mb-1">WEEKLY SCHEDULE</p>
              <p className="text-xs text-muted-foreground">{program.schedule}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {program.tags.map(tag => (
              <span
                key={tag}
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Weeks */}
          <p className="text-xs font-black tracking-widest text-muted-foreground mb-3">SELECT A WEEK</p>
          <div className="space-y-2">
            {program.weeks.map((week) => (
              <button
                key={week.week}
                onClick={() => setView({ mode: 'week', program, week })}
                className="w-full text-left p-4 rounded-2xl active:scale-[0.98] transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="font-black text-white"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', letterSpacing: '0.05em' }}
                    >
                      WEEK {week.week}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{week.focus}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: style.glow, color: 'white' }}
                    >
                      {week.workouts.length} WORKOUTS
                    </span>
                    <p className="text-muted-foreground text-base mt-1">›</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ─── QUICK PROGRAM DETAIL VIEW ────────────────────────────────────────────
  if (view.mode === 'quick') {
    const program = view.program;
    const diff = DIFFICULTY_STYLES[program.difficulty];
    return (
      <div className="min-h-screen bg-[#080808] pb-28">
        <main className="max-w-[480px] mx-auto px-4 pt-6">
          <button
            onClick={() => setView({ mode: 'list' })}
            className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground mb-6 hover:text-white transition-colors"
          >
            ← BACK TO PROGRAMS
          </button>
          <div
            className="relative rounded-3xl overflow-hidden mb-6"
            style={{ boxShadow: `0 8px 40px ${program.glow}, 0 2px 8px rgba(0,0,0,0.6)` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${program.color} opacity-90`} />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 12px)' }} />
            <div className="relative p-6">
              <div className="text-5xl mb-3 drop-shadow-lg">{program.icon}</div>
              <h1 className="text-3xl font-black text-white leading-none mb-1" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.06em' }}>
                {program.name}
              </h1>
              <p className="text-white/75 text-sm font-medium mb-4">{program.subtitle}</p>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${diff.bg} ${diff.text} ${diff.border}`}>
                  {program.difficulty.toUpperCase()}
                </span>
                <span className="text-white/70 text-xs font-bold">{program.duration}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs font-black tracking-widest text-muted-foreground mb-3">CORRECTIVE WARM-UP</p>
            <div className="space-y-2">
              {program.warmup.map((id, i) => (
                <div key={id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,102,0,0.05)', border: '1px solid rgba(255,102,0,0.15)' }}>
                  <span className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 text-white" style={{ background: program.accent }}>{i + 1}</span>
                  <p className="text-sm font-bold text-foreground capitalize">{id.replace(/-/g, ' ')}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xs font-black tracking-widest text-muted-foreground mb-3">MAIN WORKOUT</p>
            <div className="space-y-3">
              {program.exercises.map((ex, i) => (
                <div key={i} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-black text-sm text-white">{ex.name}</p>
                    <div className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 text-white" style={{ background: program.glow }}>
                      {ex.sets} x {ex.reps}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold italic" style={{ color: program.accent }}>{ex.cue}</p>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{ex.rest}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleStartWarmup(program.warmup, program.name)}
            className="w-full py-4 rounded-2xl text-white font-black active:scale-[0.98] transition-all"
            style={{ background: `linear-gradient(135deg, ${program.accent}, #FF6600)`, boxShadow: `0 4px 24px ${program.glow}`, fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', letterSpacing: '0.1em' }}
          >
            START WARM-UP
          </button>
        </main>
      </div>
    );
  }

  // ─── LIST VIEW ────────────────────────────────────────────────────────────
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

        {/* TUF PROGRAMS — from Google Drive */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs font-black tracking-widest text-muted-foreground">TUF PROGRAMS</p>
            <span
              className="text-xs font-black px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,102,0,0.15)', color: '#FF6600', border: '1px solid rgba(255,102,0,0.3)' }}
            >
              OFFICIAL
            </span>
          </div>
          <div className="space-y-4">
            {TUF_PROGRAMS.map((program) => {
              const style = PROGRAM_STYLES[program.id] || PROGRAM_STYLES['maximum-overdrive'];
              return (
                <button
                  key={program.id}
                  onClick={() => setView({ mode: 'program', program })}
                  className="w-full text-left rounded-3xl overflow-hidden active:scale-[0.98] transition-all"
                  style={{ boxShadow: `0 8px 48px ${style.glow}, 0 2px 12px rgba(0,0,0,0.7)` }}
                >
                  <div className={`relative bg-gradient-to-br ${style.color} p-6 pb-8`}>
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 1px, transparent 1px, transparent 14px)' }} />
                    <div className="absolute top-4 right-4 text-xs font-black px-3 py-1 rounded-full text-white" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }}>
                      {program.duration.toUpperCase()}
                    </div>
                    <div className="relative">
                      <div className="text-4xl mb-3 drop-shadow-lg">{style.icon}</div>
                      <h2
                        className="text-white font-black leading-none mb-1"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.8rem', letterSpacing: '0.06em' }}
                      >
                        {program.title.toUpperCase()}
                      </h2>
                      <p className="text-white/75 text-sm">{program.subtitle}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {program.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-2 px-5 py-3"
                    style={{ background: 'rgba(255,102,0,0.12)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,102,0,0.25)' }}
                  >
                    <span className="text-xs font-black tracking-widest text-primary">
                      {program.weeks.length} WEEKS · {program.daysPerWeek}x/WEEK · {program.level.toUpperCase()}
                    </span>
                    <span className="ml-auto text-white/50 text-base">›</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* QUICK WORKOUTS */}
        <div className="mt-7">
          <p className="text-xs font-black tracking-widest text-muted-foreground mb-3">QUICK WORKOUTS</p>
          <div className="space-y-3">
            {QUICK_PROGRAMS.map((program) => {
              const diff = DIFFICULTY_STYLES[program.difficulty];
              return (
                <button
                  key={program.id}
                  onClick={() => setView({ mode: 'quick', program })}
                  className="w-full text-left rounded-2xl overflow-hidden active:scale-[0.98] transition-all"
                  style={{ boxShadow: `0 4px 24px ${program.glow}, 0 1px 6px rgba(0,0,0,0.5)` }}
                >
                  <div className={`relative bg-gradient-to-r ${program.color} px-5 py-4`}>
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 10px)' }} />
                    <div className="relative flex items-center gap-4">
                      <span className="text-3xl drop-shadow">{program.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-black leading-none truncate" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.15rem', letterSpacing: '0.06em' }}>
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
                  <div className="flex items-center gap-2 px-5 py-2.5" style={{ background: 'rgba(255,255,255,0.03)', borderTop: `1px solid ${program.glow}` }}>
                    <span className="text-xs font-bold text-primary">CORRECTIVE WARM-UP</span>
                    <span className="ml-auto text-muted-foreground text-base">›</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Coaching CTA */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/live')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl active:scale-[0.98] transition-all"
            style={{ background: 'rgba(255,102,0,0.06)', border: '1.5px dashed rgba(255,102,0,0.35)' }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(255,102,0,0.12)' }}>
              📷
            </div>
            <div className="flex-1 text-left">
              <p className="font-black text-sm tracking-widest text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>
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
