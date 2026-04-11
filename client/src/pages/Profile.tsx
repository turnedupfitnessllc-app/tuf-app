/**
 * TUF Profile Screen — Progression
 * Mobility · Strength · Stability scores
 * Panther evolution: Weak → Controlled → Dominant
 */
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { PantherAvatar } from '@/components/PantherAvatar';

interface UserProfile {
  name: string;
  goal: string;
  age: string;
  healthConditions: string[];
  joinDate: number;
}

interface ProgressScores {
  mobility: number;
  strength: number;
  stability: number;
  sessionsCompleted: number;
  streakDays: number;
  totalMinutes: number;
}

type PantherStage = 'Cub' | 'Stealth' | 'Controlled' | 'Dominant' | 'Apex Predator';

function getPantherStage(totalScore: number): { stage: PantherStage; next: PantherStage | null; progress: number } {
  if (totalScore < 100) return { stage: 'Cub', next: 'Stealth', progress: totalScore };
  if (totalScore < 200) return { stage: 'Stealth', next: 'Controlled', progress: totalScore - 100 };
  if (totalScore < 300) return { stage: 'Controlled', next: 'Dominant', progress: totalScore - 200 };
  if (totalScore < 400) return { stage: 'Dominant', next: 'Apex Predator', progress: totalScore - 300 };
  return { stage: 'Apex Predator', next: null, progress: 100 };
}

const STAGE_DESCRIPTIONS: Record<PantherStage, string> = {
  'Cub': 'Just getting started. Building the foundation.',
  'Stealth': 'Movement patterns improving. Compensations reducing.',
  'Controlled': 'Solid base. Strength and stability developing.',
  'Dominant': 'High performance. Movement is clean and powerful.',
  'Apex Predator': 'Elite. You move like a machine.',
};

const STAGE_COLORS: Record<PantherStage, string> = {
  'Cub': 'text-muted-foreground',
  'Stealth': 'text-blue-400',
  'Controlled': 'text-primary',
  'Dominant': 'text-amber-400',
  'Apex Predator': 'text-emerald-400',
};

export default function Profile() {
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    goal: '',
    age: '',
    healthConditions: [],
    joinDate: Date.now(),
  });
  const [scores] = useState<ProgressScores>({
    mobility: 62,
    strength: 48,
    stability: 71,
    sessionsCompleted: 12,
    streakDays: 5,
    totalMinutes: 480,
  });
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGoal, setEditGoal] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('tuf_profile');
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setProfile(p);
        setEditName(p.name || '');
        setEditGoal(p.goal || '');
      } catch {}
    }
  }, []);

  const handleSave = () => {
    const updated = { ...profile, name: editName, goal: editGoal };
    setProfile(updated);
    localStorage.setItem('tuf_profile', JSON.stringify(updated));
    setEditing(false);
  };

  const totalScore = scores.mobility + scores.strength + scores.stability;
  const { stage, next, progress } = getPantherStage(totalScore);

  const scoreItems = [
    { label: 'MOBILITY', value: scores.mobility, color: 'bg-blue-500', description: 'Joint range of motion & tissue quality' },
    { label: 'STRENGTH', value: scores.strength, color: 'bg-primary', description: 'Functional force production' },
    { label: 'STABILITY', value: scores.stability, color: 'bg-emerald-500', description: 'Motor control & joint stability' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-[480px] mx-auto px-4 pt-6">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-xs font-black tracking-widest text-muted-foreground mb-1">STEP 4 OF 4</p>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            YOUR <span className="text-primary">EVOLUTION</span>
          </h1>
        </div>

        {/* ── Panther Evolution ─────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-8 p-6 rounded-2xl bg-card border border-border">
          <PantherAvatar
            state={stage === 'Apex Predator' ? 'active' : stage === 'Dominant' ? 'coaching' : 'idle'}
            size="lg"
          />
          <div className="mt-4 text-center">
            <p className={`text-xl font-black tracking-wide ${STAGE_COLORS[stage]}`}>
              {stage.toUpperCase()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{STAGE_DESCRIPTIONS[stage]}</p>
          </div>

          {/* Evolution progress */}
          {next && (
            <div className="w-full mt-4">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className={STAGE_COLORS[stage]}>{stage}</span>
                <span className="text-muted-foreground">{next}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {100 - progress} points to unlock {next}
              </p>
            </div>
          )}
        </div>

        {/* ── Score Cards ───────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-xs font-black tracking-widest text-muted-foreground mb-3">PERFORMANCE SCORES</p>
          <div className="space-y-3">
            {scoreItems.map(({ label, value, color, description }) => (
              <div key={label} className="p-4 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-black text-sm tracking-wide text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <span className="text-2xl font-black text-foreground">{value}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-700`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'SESSIONS', value: scores.sessionsCompleted },
            { label: 'STREAK', value: `${scores.streakDays}d` },
            { label: 'MINUTES', value: scores.totalMinutes },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 rounded-2xl bg-card border border-border text-center">
              <p className="text-xl font-black text-primary">{value}</p>
              <p className="text-xs font-bold text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Profile Info ──────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black tracking-widest text-muted-foreground">YOUR PROFILE</p>
            <button
              onClick={() => setEditing(!editing)}
              className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">NAME</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card text-foreground font-bold focus:border-primary outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">PRIMARY GOAL</label>
                <input
                  value={editGoal}
                  onChange={e => setEditGoal(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card text-foreground font-bold focus:border-primary outline-none transition-colors"
                  placeholder="e.g. Build strength, Fix my back, Move better"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full py-3 rounded-xl bg-primary text-white font-black tracking-wide"
              >
                SAVE
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {[
                { label: 'Name', value: profile.name || 'Not set' },
                { label: 'Goal', value: profile.goal || 'Not set' },
                { label: 'Age', value: profile.age || 'Not set' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                  <span className="text-xs font-bold text-muted-foreground">{label}</span>
                  <span className="text-sm font-bold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Quick Links ───────────────────────────────────────────── */}
        <div className="space-y-2">
          {[
            { label: 'Body Composition', icon: '📏', path: '/body-comp' },
            { label: 'Panther Brain', icon: '🐆', path: '/panther' },
            { label: 'Live Coaching', icon: '📷', path: '/live' },
            { label: 'Nutrition (FUEL)', icon: '🥗', path: '/fuel' },
            { label: 'Recipes (FEAST)', icon: '🍽️', path: '/feast' },
          ].map(({ label, icon, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 active:scale-[0.98] transition-all text-left"
            >
              <span className="text-xl">{icon}</span>
              <span className="text-sm font-bold text-foreground">{label}</span>
              <span className="ml-auto text-muted-foreground">›</span>
            </button>
          ))}
        </div>

      </main>
    </div>
  );
}
