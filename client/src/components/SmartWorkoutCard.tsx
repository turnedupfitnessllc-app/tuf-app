/**
 * SmartWorkoutCard — AI Adaptive Workout Generator
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 *
 * Calls POST /api/panther/workout/smart with user preferences
 * Returns a personalized workout based on fatigue, history, and progression
 */
import { useState } from 'react';
import { useLocation } from 'wouter';

const MUSCLE_GROUPS = [
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'triceps', label: 'Triceps' },
  { id: 'quads', label: 'Quads' },
  { id: 'hamstrings', label: 'Hamstrings' },
  { id: 'glutes', label: 'Glutes' },
  { id: 'core', label: 'Core' },
  { id: 'calves', label: 'Calves' },
];

const GOALS = [
  { id: 'hypertrophy', label: 'Build Muscle', icon: '💪' },
  { id: 'strength', label: 'Get Stronger', icon: '🏋️' },
  { id: 'fat_loss', label: 'Burn Fat', icon: '🔥' },
  { id: 'endurance', label: 'Endurance', icon: '⚡' },
  { id: 'explosive', label: 'Explosive', icon: '💥' },
];

const DURATIONS = [20, 30, 45, 60];

interface GeneratedWorkout {
  type: string;
  level: string;
  goal: string;
  duration: number;
  warmup: WorkoutExercise[];
  mainBlock: WorkoutExercise[];
  cooldown: WorkoutExercise[];
  message?: string;
}

interface WorkoutExercise {
  exercise_id: string;
  name: string;
  sets: number;
  reps: string;
  rest: number;
  tempo: string;
  recommended_weight?: number;
  progression_level?: number;
  pantherCue: string;
  primaryMuscles: string[];
  tags: string[];
}

export default function SmartWorkoutCard() {
  const [, navigate] = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [step, setStep] = useState<'config' | 'result'>('config');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);

  // Config state
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(['shoulders', 'biceps']);
  const [selectedGoal, setSelectedGoal] = useState('hypertrophy');
  const [selectedDuration, setSelectedDuration] = useState(30);

  const toggleMuscle = (id: string) => {
    setSelectedMuscles(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (selectedMuscles.length === 0) {
      setError('Select at least one muscle group');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userId = localStorage.getItem('tuf_user_id') || 'guest';
      const level = localStorage.getItem('tuf_fitness_level') || 'intermediate';
      const equipment = JSON.parse(localStorage.getItem('tuf_equipment') || '["dumbbell","bodyweight"]');

      const res = await fetch('/api/panther/workout/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          level,
          goal: selectedGoal,
          muscles: selectedMuscles,
          duration: selectedDuration,
          equipment,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Generation failed');
      setWorkout(data.workout);
      setStep('result');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = () => {
    if (!workout) return;
    // Convert smart workout to the format WorkoutPlayer expects (tuf_workout_exercises)
    const allExercises = [
      ...workout.warmup,
      ...workout.mainBlock,
      ...workout.cooldown,
    ].map(ex => ({
      id: ex.exercise_id,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.rest,
      tempo: ex.tempo,
      pantherCue: ex.pantherCue,
      recommended_weight: ex.recommended_weight,
      tags: ex.tags,
      primary_muscles: ex.primaryMuscles,
      // Required fields for WorkoutPlayer Exercise type
      pattern: 'compound',
      difficulty: 'intermediate',
      equipment: [],
      secondary_muscles: [],
      volume: { sets: String(ex.sets), reps: ex.reps },
      panther_mode: { intent: 'execute', cue: ex.pantherCue },
    }));
    localStorage.setItem('tuf_workout_exercises', JSON.stringify(allExercises));
    navigate('/workout-player');
  };

  const handleReset = () => {
    setStep('config');
    setWorkout(null);
    setError(null);
  };

  if (!expanded) {
    return (
      <div className="mt-7">
        <button
          onClick={() => setExpanded(true)}
          className="w-full text-left rounded-2xl overflow-hidden active:scale-[0.98] transition-all"
          style={{ background: 'linear-gradient(135deg, rgba(255,102,0,0.12) 0%, rgba(255,60,0,0.06) 100%)', border: '1.5px solid rgba(255,102,0,0.3)', boxShadow: '0 4px 24px rgba(255,102,0,0.15)' }}
        >
          <div className="px-5 py-4 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(255,102,0,0.15)' }}
            >
              🧠
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-black text-white leading-none"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', letterSpacing: '0.08em' }}
              >
                AI SMART WORKOUT
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Adapts to your fatigue · Tracks progression · Never repeats
              </p>
            </div>
            <div className="flex-shrink-0">
              <span
                className="text-xs font-black px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,102,0,0.2)', color: '#FF6600', border: '1px solid rgba(255,102,0,0.4)' }}
              >
                NEW
              </span>
            </div>
          </div>
          <div
            className="px-5 py-2.5 flex items-center gap-2"
            style={{ background: 'rgba(255,102,0,0.06)', borderTop: '1px solid rgba(255,102,0,0.2)' }}
          >
            <span className="text-xs font-bold text-primary">BUILD MY WORKOUT →</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-7">
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,102,0,0.06)', border: '1.5px solid rgba(255,102,0,0.25)' }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,102,0,0.15)' }}>
          <span className="text-xl">🧠</span>
          <div className="flex-1">
            <p className="font-black text-white text-sm tracking-widest" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>
              AI SMART WORKOUT
            </p>
            <p className="text-xs text-muted-foreground">Adaptive · Progressive · Personalized</p>
          </div>
          <button
            onClick={() => { setExpanded(false); handleReset(); }}
            className="text-muted-foreground text-lg leading-none hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        {step === 'config' && (
          <div className="px-5 py-4 space-y-5">
            {/* Goal selection */}
            <div>
              <p className="text-xs font-black tracking-widest text-muted-foreground mb-2">TRAINING GOAL</p>
              <div className="flex flex-wrap gap-2">
                {GOALS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGoal(g.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={selectedGoal === g.id
                      ? { background: 'rgba(255,102,0,0.25)', color: '#FF6600', border: '1px solid rgba(255,102,0,0.6)' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
                    }
                  >
                    <span>{g.icon}</span>
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Muscle group selection */}
            <div>
              <p className="text-xs font-black tracking-widest text-muted-foreground mb-2">TARGET MUSCLES</p>
              <div className="flex flex-wrap gap-2">
                {MUSCLE_GROUPS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => toggleMuscle(m.id)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={selectedMuscles.includes(m.id)
                      ? { background: 'rgba(255,102,0,0.25)', color: '#FF6600', border: '1px solid rgba(255,102,0,0.6)' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
                    }
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <p className="text-xs font-black tracking-widest text-muted-foreground mb-2">DURATION</p>
              <div className="flex gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDuration(d)}
                    className="flex-1 py-2 rounded-xl text-xs font-black transition-all"
                    style={selectedDuration === d
                      ? { background: 'rgba(255,102,0,0.25)', color: '#FF6600', border: '1px solid rgba(255,102,0,0.6)' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
                    }
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-sm tracking-widest transition-all active:scale-[0.98]"
              style={{
                background: loading ? 'rgba(255,102,0,0.3)' : 'linear-gradient(135deg, #FF6600, #FF3300)',
                color: 'white',
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '0.1em',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'BUILDING YOUR WORKOUT...' : 'GENERATE SMART WORKOUT →'}
            </button>
          </div>
        )}

        {step === 'result' && workout && (
          <div className="px-5 py-4 space-y-4">
            {workout.type === 'recovery' ? (
              <div className="text-center py-4">
                <p className="text-3xl mb-2">😴</p>
                <p className="text-white font-bold text-sm">{workout.message}</p>
                <p className="text-xs text-muted-foreground mt-1">Your muscles need 48hrs to recover.</p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex-1">
                    <p className="text-white font-black text-sm tracking-widest" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {workout.mainBlock.length} EXERCISES · {workout.duration} MIN
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{workout.goal.replace('_', ' ')} · {workout.level}</p>
                  </div>
                  <button onClick={handleReset} className="text-xs text-primary font-bold">
                    REBUILD
                  </button>
                </div>

                {/* Warmup */}
                {workout.warmup.length > 0 && (
                  <div>
                    <p className="text-xs font-black tracking-widest text-muted-foreground mb-2">WARM-UP</p>
                    <div className="space-y-2">
                      {workout.warmup.map((ex, i) => (
                        <ExerciseRow key={i} ex={ex} accent="rgba(59,130,246,0.3)" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Block */}
                <div>
                  <p className="text-xs font-black tracking-widest text-muted-foreground mb-2">MAIN BLOCK</p>
                  <div className="space-y-2">
                    {workout.mainBlock.map((ex, i) => (
                      <ExerciseRow key={i} ex={ex} accent="rgba(255,102,0,0.2)" />
                    ))}
                  </div>
                </div>

                {/* Cooldown */}
                {workout.cooldown.length > 0 && (
                  <div>
                    <p className="text-xs font-black tracking-widest text-muted-foreground mb-2">COOLDOWN</p>
                    <div className="space-y-2">
                      {workout.cooldown.map((ex, i) => (
                        <ExerciseRow key={i} ex={ex} accent="rgba(16,185,129,0.2)" />
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleStartWorkout}
                  className="w-full py-3.5 rounded-xl font-black text-sm tracking-widest transition-all active:scale-[0.98] mt-2"
                  style={{
                    background: 'linear-gradient(135deg, #FF6600, #FF3300)',
                    color: 'white',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: '0.1em',
                  }}
                >
                  START WORKOUT →
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ExerciseRow({ ex, accent }: { ex: WorkoutExercise; accent: string }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
      style={{ background: accent }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-bold truncate">{ex.name}</p>
        <p className="text-muted-foreground text-xs">{ex.sets} × {ex.reps}</p>
      </div>
      <div className="text-right flex-shrink-0">
        {ex.recommended_weight ? (
          <p className="text-primary text-xs font-bold">{ex.recommended_weight}lb</p>
        ) : null}
        <p className="text-muted-foreground text-xs">{ex.rest}s rest</p>
      </div>
    </div>
  );
}
