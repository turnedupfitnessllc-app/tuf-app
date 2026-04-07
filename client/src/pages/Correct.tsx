/**
 * TUF Correct Screen — The Money Screen
 * Exercise player: Panther animation + coaching cues + timer + voice
 * "Assess → Correct → Perform → Evolve"
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { PantherAvatar } from '@/components/PantherAvatar';
import { useProgress } from '@/hooks/useProgress';

interface Exercise {
  id: string;
  name: string;
  targetArea: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; // seconds
  sets: number;
  cues: string[];
  feelThis: string[];
  pantherCue: string;
  phase: 'INHIBIT' | 'LENGTHEN' | 'ACTIVATE' | 'INTEGRATE';
}

const EXERCISE_LIBRARY: Record<string, Exercise> = {
  'glute-bridge': {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    targetArea: 'Glutes · Core',
    difficulty: 'Beginner',
    duration: 30,
    sets: 3,
    cues: ['Drive through your heels', 'Squeeze glutes hard at the top', 'No lumbar arch — hips drive up'],
    feelThis: ['Glutes', 'Core', 'Hamstrings'],
    pantherCue: 'Slow it down. Control every inch.',
    phase: 'ACTIVATE',
  },
  'hip-flexor-stretch': {
    id: 'hip-flexor-stretch',
    name: 'Hip Flexor Stretch',
    targetArea: 'Hip Flexors · Psoas',
    difficulty: 'Beginner',
    duration: 45,
    sets: 2,
    cues: ['Tall spine — no forward lean', 'Drive hips forward gently', 'Breathe into the stretch'],
    feelThis: ['Hip flexors', 'Front of hip', 'Quad'],
    pantherCue: 'Hold it. Let the tissue release.',
    phase: 'LENGTHEN',
  },
  'dead-bug': {
    id: 'dead-bug',
    name: 'Dead Bug',
    targetArea: 'Core · Deep Stabilizers',
    difficulty: 'Intermediate',
    duration: 40,
    sets: 3,
    cues: ['Low back FLAT to the floor', 'Opposite arm and leg extend slow', 'Exhale on the extension'],
    feelThis: ['Deep core', 'Transverse abdominis', 'Lower back'],
    pantherCue: 'Keep that back flat. No gaps.',
    phase: 'ACTIVATE',
  },
  'bird-dog': {
    id: 'bird-dog',
    name: 'Bird Dog',
    targetArea: 'Core · Glutes · Lower Back',
    difficulty: 'Intermediate',
    duration: 40,
    sets: 3,
    cues: ['Neutral spine — no rotation', 'Reach long, not high', 'Pause 2 seconds at full extension'],
    feelThis: ['Glutes', 'Core', 'Lower back stabilizers'],
    pantherCue: 'Stable. Controlled. Reach.',
    phase: 'INTEGRATE',
  },
  'clamshell': {
    id: 'clamshell',
    name: 'Clamshell',
    targetArea: 'Glute Med · Hip External Rotators',
    difficulty: 'Beginner',
    duration: 30,
    sets: 3,
    cues: ['Hips stacked — don\'t roll back', 'Drive from the hip, not the foot', 'Full range — open all the way'],
    feelThis: ['Outer glute', 'Hip external rotators'],
    pantherCue: 'Feel that outer glute fire.',
    phase: 'ACTIVATE',
  },
  'lateral-band-walk': {
    id: 'lateral-band-walk',
    name: 'Lateral Band Walk',
    targetArea: 'Glute Med · Hip Stabilizers',
    difficulty: 'Intermediate',
    duration: 45,
    sets: 3,
    cues: ['Stay low — athletic position', 'Push out against the band', 'Don\'t let knees cave in'],
    feelThis: ['Outer glutes', 'Hip abductors'],
    pantherCue: 'Push out. Stay low. Own it.',
    phase: 'INTEGRATE',
  },
  'chin-tuck': {
    id: 'chin-tuck',
    name: 'Chin Tuck',
    targetArea: 'Deep Neck Flexors · Cervical Spine',
    difficulty: 'Beginner',
    duration: 20,
    sets: 3,
    cues: ['Double chin — not chin down', 'Hold 5 seconds each rep', 'Tall spine throughout'],
    feelThis: ['Back of neck', 'Deep neck flexors'],
    pantherCue: 'Pull that head back. Own your posture.',
    phase: 'ACTIVATE',
  },
  'wall-angel': {
    id: 'wall-angel',
    name: 'Wall Angel',
    targetArea: 'Thoracic Spine · Lower Traps · Serratus',
    difficulty: 'Intermediate',
    duration: 30,
    sets: 3,
    cues: ['Head, upper back, and glutes on wall', 'Slide arms up — keep contact', 'If you lose contact, stop there'],
    feelThis: ['Upper back', 'Lower traps', 'Thoracic spine'],
    pantherCue: 'Keep everything on the wall. Earn it.',
    phase: 'ACTIVATE',
  },
  'squat-with-pause': {
    id: 'squat-with-pause',
    name: 'Pause Squat',
    targetArea: 'Full Lower Body · Core',
    difficulty: 'Intermediate',
    duration: 40,
    sets: 3,
    cues: ['Knees track over toes — no caving', 'Pause 3 seconds at depth', 'Drive through the whole foot'],
    feelThis: ['Quads', 'Glutes', 'Core'],
    pantherCue: 'Sit in it. Own the bottom.',
    phase: 'INTEGRATE',
  },
  'thoracic-extension': {
    id: 'thoracic-extension',
    name: 'Thoracic Extension',
    targetArea: 'Thoracic Spine · Upper Back',
    difficulty: 'Beginner',
    duration: 45,
    sets: 2,
    cues: ['Foam roller at mid-back', 'Arms crossed or behind head', 'Extend over the roller — breathe'],
    feelThis: ['Mid-upper back', 'Thoracic spine'],
    pantherCue: 'Open that chest. Breathe into it.',
    phase: 'LENGTHEN',
  },

  // ── KNEE VALGUS / LCS ──────────────────────────────────────────────────────
  'foam-roll-adductors': {
    id: 'foam-roll-adductors',
    name: 'Foam Roll Adductors',
    targetArea: 'Inner Thigh · Adductors',
    difficulty: 'Beginner',
    duration: 60,
    sets: 1,
    cues: ['Roll inner thigh from knee to groin', 'Pause on tender spots 20-30 seconds', 'Breathe — let the tissue release'],
    feelThis: ['Inner thigh', 'Adductors'],
    pantherCue: 'Find the tight spot. Breathe into it.',
    phase: 'INHIBIT',
  },
  'sumo-squat': {
    id: 'sumo-squat',
    name: 'Sumo Squat',
    targetArea: 'Glutes · Adductors · Quads',
    difficulty: 'Intermediate',
    duration: 40,
    sets: 3,
    cues: ['Wide stance, toes 45° out', 'Knees push out over toes — no caving', 'Chest tall, hips back and down'],
    feelThis: ['Inner thighs', 'Glutes', 'Quads'],
    pantherCue: 'Push those knees out. Own the width.',
    phase: 'INTEGRATE',
  },
  'single-leg-glute-bridge': {
    id: 'single-leg-glute-bridge',
    name: 'Single-Leg Glute Bridge',
    targetArea: 'Glutes · Hip Stabilizers',
    difficulty: 'Intermediate',
    duration: 35,
    sets: 3,
    cues: ['One leg extended, drive through heel', 'Hips level — no rotation', 'Full extension at top, squeeze hard'],
    feelThis: ['Working glute', 'Hip stabilizers', 'Core'],
    pantherCue: 'Level hips. No cheating.',
    phase: 'ACTIVATE',
  },

  // ── LOWER BACK PAIN / LCS ──────────────────────────────────────────────────
  'foam-roll-hip-flexors': {
    id: 'foam-roll-hip-flexors',
    name: 'Foam Roll Hip Flexors',
    targetArea: 'Hip Flexors · TFL',
    difficulty: 'Beginner',
    duration: 60,
    sets: 1,
    cues: ['Roll front of hip and TFL', 'Pause on tight spots', 'Rotate leg slightly to hit different fibers'],
    feelThis: ['Front of hip', 'TFL', 'Quad'],
    pantherCue: 'Slow down. Let it release.',
    phase: 'INHIBIT',
  },
  'cat-cow': {
    id: 'cat-cow',
    name: 'Cat-Cow',
    targetArea: 'Lumbar Spine · Thoracic Spine',
    difficulty: 'Beginner',
    duration: 40,
    sets: 2,
    cues: ['On hands and knees, wrists under shoulders', 'Exhale — round spine up (cat)', 'Inhale — arch spine down (cow)', 'Move through full range, slow'],
    feelThis: ['Entire spine', 'Core', 'Thoracic mobility'],
    pantherCue: 'Breathe with the movement. Full range.',
    phase: 'LENGTHEN',
  },
  'plank': {
    id: 'plank',
    name: 'Plank',
    targetArea: 'Core · Deep Stabilizers',
    difficulty: 'Intermediate',
    duration: 30,
    sets: 3,
    cues: ['Neutral spine — no hip sag or pike', 'Glutes and core braced hard', 'Head neutral — not forward', 'Scapulae flat — no winging'],
    feelThis: ['Deep core', 'Glutes', 'Shoulders'],
    pantherCue: 'Squeeze everything. Hold the line.',
    phase: 'ACTIVATE',
  },
  'rdl': {
    id: 'rdl',
    name: 'Romanian Deadlift',
    targetArea: 'Hamstrings · Glutes · Lower Back',
    difficulty: 'Intermediate',
    duration: 40,
    sets: 3,
    cues: ['Soft knee bend — this is a hinge not a squat', 'Push hips back, chest follows', 'Neutral spine throughout — no rounding', 'Feel hamstring stretch, drive hips forward to stand'],
    feelThis: ['Hamstrings', 'Glutes', 'Lower back'],
    pantherCue: 'Hinge at the hip. Neutral spine.',
    phase: 'INTEGRATE',
  },

  // ── TIGHT HIPS ─────────────────────────────────────────────────────────────
  'pigeon-pose': {
    id: 'pigeon-pose',
    name: 'Pigeon Pose',
    targetArea: 'Hip External Rotators · Piriformis',
    difficulty: 'Beginner',
    duration: 60,
    sets: 2,
    cues: ['Front shin parallel to top of mat', 'Hips square — don\'t let them tilt', 'Breathe into the hip — let it open'],
    feelThis: ['Deep hip', 'Piriformis', 'Glute'],
    pantherCue: 'Breathe into it. Let the hip open.',
    phase: 'LENGTHEN',
  },
  'hip-hinge': {
    id: 'hip-hinge',
    name: 'Hip Hinge Drill',
    targetArea: 'Posterior Chain · Hip Mechanics',
    difficulty: 'Beginner',
    duration: 35,
    sets: 3,
    cues: ['Soft knee bend — not a squat', 'Push hips back to the wall behind you', 'Neutral spine — feel hamstring stretch', 'Drive hips forward to stand'],
    feelThis: ['Hamstrings', 'Glutes', 'Lower back'],
    pantherCue: 'Push the hips back. That\'s the pattern.',
    phase: 'ACTIVATE',
  },
  'lateral-lunge': {
    id: 'lateral-lunge',
    name: 'Lateral Lunge',
    targetArea: 'Adductors · Glutes · Hip Mobility',
    difficulty: 'Intermediate',
    duration: 40,
    sets: 3,
    cues: ['Step wide, sit into the working leg', 'Straight leg stays straight', 'Chest tall, hips back', 'Push through heel to return'],
    feelThis: ['Inner thigh', 'Glutes', 'Hip flexors'],
    pantherCue: 'Sit into it. Chest tall.',
    phase: 'INTEGRATE',
  },

  // ── FORWARD HEAD / UCS ─────────────────────────────────────────────────────
  'foam-roll-upper-back': {
    id: 'foam-roll-upper-back',
    name: 'Foam Roll Upper Back',
    targetArea: 'Thoracic Spine · Upper Traps',
    difficulty: 'Beginner',
    duration: 60,
    sets: 1,
    cues: ['Roll T-spine — not lower back', 'Pause on stiff segments', 'Arms crossed to open scapulae'],
    feelThis: ['Upper back', 'Thoracic spine'],
    pantherCue: 'Find the stiff spots. Breathe through them.',
    phase: 'INHIBIT',
  },
  'pec-stretch': {
    id: 'pec-stretch',
    name: 'Doorway Pec Stretch',
    targetArea: 'Pec Minor · Anterior Shoulder',
    difficulty: 'Beginner',
    duration: 45,
    sets: 2,
    cues: ['Arm at 90° on doorframe', 'Step through — feel chest open', 'Tall spine — don\'t lean forward', 'Hold 30 seconds each side'],
    feelThis: ['Chest', 'Front of shoulder', 'Pec minor'],
    pantherCue: 'Open that chest. Stand tall.',
    phase: 'LENGTHEN',
  },
  'face-pull': {
    id: 'face-pull',
    name: 'Face Pull',
    targetArea: 'Rear Delts · External Rotators · Lower Traps',
    difficulty: 'Beginner',
    duration: 35,
    sets: 3,
    cues: ['Pull to face level — not neck', 'Elbows high and wide', 'External rotate at end — thumbs back', 'Control the return'],
    feelThis: ['Rear delts', 'Upper back', 'External rotators'],
    pantherCue: 'Pull to the face. Elbows high.',
    phase: 'ACTIVATE',
  },

  // ── SHOULDER PAIN / UCS ────────────────────────────────────────────────────
  'band-pull-apart': {
    id: 'band-pull-apart',
    name: 'Band Pull-Apart',
    targetArea: 'Rear Delts · Lower Traps · Rhomboids',
    difficulty: 'Beginner',
    duration: 30,
    sets: 3,
    cues: ['Arms straight, band at chest height', 'Pull band apart — squeeze shoulder blades', 'Control the return — don\'t snap back', 'Tall spine throughout'],
    feelThis: ['Rear delts', 'Between shoulder blades', 'Upper back'],
    pantherCue: 'Squeeze the blades. Own the posture.',
    phase: 'ACTIVATE',
  },
  'y-t-w': {
    id: 'y-t-w',
    name: 'Y-T-W Raises',
    targetArea: 'Lower Traps · Serratus · Rotator Cuff',
    difficulty: 'Intermediate',
    duration: 35,
    sets: 3,
    cues: ['Prone on bench or floor', 'Y: arms at 30° overhead', 'T: arms straight out to sides', 'W: elbows bent, pull to sides', 'Thumbs up throughout'],
    feelThis: ['Lower traps', 'Mid-back', 'Rear delts'],
    pantherCue: 'Slow and controlled. Feel the back work.',
    phase: 'ACTIVATE',
  },
  'lat-stretch': {
    id: 'lat-stretch',
    name: 'Lat Stretch',
    targetArea: 'Latissimus Dorsi · Thoracic Spine',
    difficulty: 'Beginner',
    duration: 45,
    sets: 2,
    cues: ['Kneel beside bench, arm extended on surface', 'Sit hips back — feel lat stretch', 'Breathe into the side body', 'Hold 30 seconds each side'],
    feelThis: ['Lats', 'Side body', 'Thoracic spine'],
    pantherCue: 'Breathe into the side. Let it open.',
    phase: 'LENGTHEN',
  },
  'overhead-squat': {
    id: 'overhead-squat',
    name: 'Overhead Squat',
    targetArea: 'Full Body · Mobility · Stability',
    difficulty: 'Advanced',
    duration: 40,
    sets: 3,
    cues: ['Arms overhead — wide grip', 'Squat to depth — arms stay up', 'Knees track over toes', 'Chest tall — no forward lean'],
    feelThis: ['Shoulders', 'Core', 'Hips', 'Full body'],
    pantherCue: 'Arms up. Chest tall. Own the depth.',
    phase: 'INTEGRATE',
  },

  // ── HEEL RISE / ANKLE ──────────────────────────────────────────────────────
  'foam-roll-calves': {
    id: 'foam-roll-calves',
    name: 'Foam Roll Calves',
    targetArea: 'Gastrocnemius · Soleus',
    difficulty: 'Beginner',
    duration: 60,
    sets: 1,
    cues: ['Roll from ankle to back of knee', 'Cross one leg over to add pressure', 'Pause on tight spots — breathe'],
    feelThis: ['Calves', 'Achilles area'],
    pantherCue: 'Find the tight spot. Breathe through it.',
    phase: 'INHIBIT',
  },
  'calf-stretch': {
    id: 'calf-stretch',
    name: 'Calf Stretch',
    targetArea: 'Gastrocnemius · Soleus',
    difficulty: 'Beginner',
    duration: 45,
    sets: 2,
    cues: ['Straight leg: stretch gastrocnemius', 'Bent knee: stretch soleus (deeper)', 'Heel stays flat on ground', 'Hold 30 seconds each position'],
    feelThis: ['Calf', 'Achilles', 'Back of ankle'],
    pantherCue: 'Heel down. Feel the stretch.',
    phase: 'LENGTHEN',
  },
  'ankle-mobility': {
    id: 'ankle-mobility',
    name: 'Ankle Mobility Drill',
    targetArea: 'Ankle · Dorsiflexion',
    difficulty: 'Beginner',
    duration: 40,
    sets: 3,
    cues: ['Foot flat, knee tracks over toes', 'Drive knee forward — heel stays down', '10 reps each side', 'Feel the front of ankle open'],
    feelThis: ['Front of ankle', 'Calf', 'Achilles'],
    pantherCue: 'Heel down. Drive that knee forward.',
    phase: 'LENGTHEN',
  },
  'box-squat': {
    id: 'box-squat',
    name: 'Box Squat',
    targetArea: 'Quads · Glutes · Ankle Mechanics',
    difficulty: 'Beginner',
    duration: 40,
    sets: 3,
    cues: ['Box at parallel or just below', 'Sit back to the box — don\'t plop', 'Heels flat throughout', 'Drive through whole foot to stand'],
    feelThis: ['Quads', 'Glutes', 'Hamstrings'],
    pantherCue: 'Sit back. Heels flat. Drive up.',
    phase: 'INTEGRATE',
  },
  'goblet-squat': {
    id: 'goblet-squat',
    name: 'Goblet Squat',
    targetArea: 'Full Lower Body · Thoracic Spine · Ankle',
    difficulty: 'Intermediate',
    duration: 40,
    sets: 3,
    cues: ['Hold weight at chest', 'Squat deep — elbows drive between knees', 'Chest tall — counterbalance opens hips', 'Heels flat throughout'],
    feelThis: ['Quads', 'Glutes', 'Hip flexors', 'Core'],
    pantherCue: 'Elbows between the knees. Chest tall.',
    phase: 'INTEGRATE',
  },

  // ── FORWARD LEAN ───────────────────────────────────────────────────────────
  'prone-cobra': {
    id: 'prone-cobra',
    name: 'Prone Cobra',
    targetArea: 'Thoracic Extensors · Lower Traps',
    difficulty: 'Beginner',
    duration: 35,
    sets: 3,
    cues: ['Lie face down, arms at sides', 'Lift chest and arms off floor', 'Thumbs up, squeeze shoulder blades', 'Hold 5 seconds — controlled'],
    feelThis: ['Upper back', 'Lower traps', 'Thoracic extensors'],
    pantherCue: 'Lift and hold. Feel the upper back work.',
    phase: 'ACTIVATE',
  },
};


const DEFAULT_CORRECTIVES = ['glute-bridge', 'hip-flexor-stretch', 'dead-bug', 'bird-dog'];

type ExerciseState = 'ready' | 'active' | 'rest' | 'complete';

export default function Correct() {
  const [, navigate] = useLocation();
  const [exerciseIds, setExerciseIds] = useState<string[]>(DEFAULT_CORRECTIVES);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [exerciseState, setExerciseState] = useState<ExerciseState>('ready');
  const [timeLeft, setTimeLeft] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ElevenLabs TTS — speak exercise cues
  const speakCue = useCallback(async (text: string) => {
    if (!voiceEnabled) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    try {
      const res = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 300), voiceKey: 'panther' }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { URL.revokeObjectURL(url); audioRef.current = null; };
      await audio.play();
    } catch {}
  }, [voiceEnabled]);
  const { completeSession } = useProgress();
  const sessionStartRef = useRef(Date.now());

  const currentExercise = EXERCISE_LIBRARY[exerciseIds[currentIdx]] || EXERCISE_LIBRARY['glute-bridge'];

  useEffect(() => {
    // Load correctives from Assess screen
    const stored = localStorage.getItem('tuf_correctives');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.issue?.correctives?.length) {
          const validIds = data.issue.correctives.filter((id: string) => EXERCISE_LIBRARY[id]);
          if (validIds.length > 0) setExerciseIds(validIds);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    setTimeLeft(currentExercise.duration);
    setExerciseState('ready');
  }, [currentIdx, currentExercise.duration]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          stopTimer();
          // Move to rest or next
          if (currentSet < currentExercise.sets) {
            setExerciseState('rest');
            setCurrentSet(s => s + 1);
            setTimeout(() => {
              setTimeLeft(currentExercise.duration);
              setExerciseState('ready');
            }, 10000); // 10s rest
          } else if (currentIdx < exerciseIds.length - 1) {
            setCurrentIdx(i => i + 1);
            setCurrentSet(1);
          } else {
            // Record session completion with phases for score calculation
            const phases = exerciseIds.map(id => EXERCISE_LIBRARY[id]?.phase ?? 'ACTIVATE') as Array<'INHIBIT' | 'LENGTHEN' | 'ACTIVATE' | 'INTEGRATE'>;
            const durationMinutes = Math.round((Date.now() - sessionStartRef.current) / 60000) || 15;
            completeSession(phases, durationMinutes);
            setShowComplete(true);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [stopTimer, currentSet, currentExercise.sets, currentExercise.duration, currentIdx, exerciseIds.length]);

  const handleStart = () => {
    setExerciseState('active');
    startTimer();
    // Speak the first coaching cue
    const cue = currentExercise.cues[0];
    if (cue) speakCue(`${currentExercise.name}. ${cue}`);
  };

  const handleNext = () => {
    stopTimer();
    if (currentIdx < exerciseIds.length - 1) {
      const nextId = exerciseIds[currentIdx + 1];
      const nextEx = EXERCISE_LIBRARY[nextId];
      if (nextEx) speakCue(`Next up. ${nextEx.name}. ${nextEx.cues[0] ?? ''}`);
      setCurrentIdx(i => i + 1);
      setCurrentSet(1);
    } else {
      const phases = exerciseIds.map(id => EXERCISE_LIBRARY[id]?.phase ?? 'ACTIVATE') as Array<'INHIBIT' | 'LENGTHEN' | 'ACTIVATE' | 'INTEGRATE'>;
      const durationMinutes = Math.round((Date.now() - sessionStartRef.current) / 60000) || 15;
      completeSession(phases, durationMinutes);
      setShowComplete(true);
    }
  };

  const handleReplay = () => {
    stopTimer();
    setTimeLeft(currentExercise.duration);
    setExerciseState('ready');
  };

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const phaseColors: Record<string, string> = {
    INHIBIT: 'bg-purple-500/20 text-purple-400',
    LENGTHEN: 'bg-blue-500/20 text-blue-400',
    ACTIVATE: 'bg-primary/20 text-primary',
    INTEGRATE: 'bg-emerald-500/20 text-emerald-400',
  };

  if (showComplete) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center pb-24 px-4">
        <div className="text-center">
          {/* Claw slash animation */}
          <div className="text-7xl mb-4 animate-bounce">🐆</div>
          <div className="text-6xl font-black text-primary mb-2 tracking-tighter">SESSION</div>
          <div className="text-6xl font-black text-foreground mb-6 tracking-tighter">COMPLETE</div>
          <p className="text-muted-foreground mb-8">
            {exerciseIds.length} exercises · {exerciseIds.reduce((sum, id) => sum + (EXERCISE_LIBRARY[id]?.sets || 3), 0)} sets total
          </p>
          <div className="flex flex-col gap-3 max-w-[280px] mx-auto">
            <button
              onClick={() => navigate('/train')}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black tracking-wide shadow-lg"
            >
              CONTINUE TO TRAIN →
            </button>
            <button
              onClick={() => { setShowComplete(false); setCurrentIdx(0); setCurrentSet(1); }}
              className="w-full py-3 rounded-2xl border-2 border-border text-muted-foreground font-bold text-sm"
            >
              Repeat Correctives
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] pb-24">
      <main className="max-w-[480px] mx-auto px-4 pt-6">

        {/* ── Progress Dots ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-6">
          {exerciseIds.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i < currentIdx ? 'bg-primary' :
                i === currentIdx ? 'bg-primary/60' :
                'bg-secondary'
              }`}
            />
          ))}
        </div>

        {/* ── Exercise Header ───────────────────────────────────────── */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${phaseColors[currentExercise.phase]}`}>
              {currentExercise.phase}
            </span>
            <span className="text-xs text-muted-foreground font-bold">
              Exercise {currentIdx + 1} of {exerciseIds.length}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            {currentExercise.name.toUpperCase()}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground">{currentExercise.targetArea}</span>
            <span className="text-xs font-bold text-primary">{currentExercise.difficulty}</span>
            <span className="text-xs text-muted-foreground">Set {currentSet}/{currentExercise.sets}</span>
          </div>
        </div>

        {/* ── Panther Animation (Main Focus) ────────────────────────── */}
        <div className="flex flex-col items-center py-6 mb-4">
          <PantherAvatar
            state={exerciseState === 'active' ? 'active' : exerciseState === 'rest' ? 'coaching' : 'idle'}
            size="lg"
            message={exerciseState === 'rest' ? 'Rest. Breathe. Reset.' : undefined}
          />

          {/* Timer */}
          <div className="mt-4 text-center">
            {exerciseState === 'active' && (
              <div className="text-5xl font-black text-primary tabular-nums">{timeLeft}s</div>
            )}
            {exerciseState === 'ready' && (
              <div className="text-sm text-muted-foreground font-bold">
                {currentExercise.duration}s · {currentExercise.sets} sets
              </div>
            )}
            {exerciseState === 'rest' && (
              <div className="text-sm font-bold text-blue-400">REST — next set in {timeLeft}s</div>
            )}
          </div>
        </div>

        {/* ── Coaching Cues ─────────────────────────────────────────── */}
        <div className="mb-4">
          <p className="text-xs font-black tracking-widest text-muted-foreground mb-2">COACHING CUES</p>
          <div className="space-y-2">
            {currentExercise.cues.map((cue, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground">{cue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Feel This ─────────────────────────────────────────────── */}
        <div className="mb-4">
          <p className="text-xs font-black tracking-widest text-muted-foreground mb-2">FEEL THIS</p>
          <div className="flex flex-wrap gap-2">
            {currentExercise.feelThis.map((muscle) => (
              <span key={muscle} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {muscle}
              </span>
            ))}
          </div>
        </div>

        {/* ── Panther Voice Prompt ──────────────────────────────────── */}
        <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10 mb-6">
          <p className="text-sm font-bold text-foreground italic">
            "{currentExercise.pantherCue}"
          </p>
          <p className="text-xs text-muted-foreground mt-1">— JARVIS</p>
        </div>

        {/* ── Controls ──────────────────────────────────────────────── */}
        <div className="flex gap-3 mb-4">
          {exerciseState === 'ready' && (
            <button
              onClick={handleStart}
              className="flex-1 py-4 rounded-2xl bg-primary text-white font-black text-base tracking-wide shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
            >
              ▶ START SET
            </button>
          )}
          {exerciseState === 'active' && (
            <>
              <button
                onClick={handleReplay}
                className="w-14 h-14 rounded-2xl border-2 border-border bg-card flex items-center justify-center text-xl hover:border-primary transition-colors"
                title="Replay"
              >
                🔁
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-4 rounded-2xl bg-foreground text-background font-black text-base tracking-wide active:scale-[0.98] transition-all"
              >
                NEXT →
              </button>
            </>
          )}
          {exerciseState === 'rest' && (
            <button
              onClick={() => { stopTimer(); setTimeLeft(currentExercise.duration); setExerciseState('ready'); }}
              className="flex-1 py-4 rounded-2xl border-2 border-primary text-primary font-black text-base tracking-wide active:scale-[0.98] transition-all"
            >
              SKIP REST →
            </button>
          )}
        </div>

        {/* ── Voice + Skip ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setVoiceEnabled(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
              voiceEnabled
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground'
            }`}
          >
            🎤 VOICE {voiceEnabled ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={handleNext}
            className="text-sm text-muted-foreground hover:text-foreground font-bold transition-colors"
          >
            Skip exercise →
          </button>
        </div>

      </main>
    </div>
  );
}
