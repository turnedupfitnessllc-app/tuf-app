/**
 * TUF Home Screen — Panther UX System
 * "Assess → Correct → Perform → Evolve"
 * Control center: Panther avatar + dynamic action cards + progress bar
 */
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { PantherAvatar } from '@/components/PantherAvatar';

const GREETINGS = [
  "You ready to get Turned Up?",
  "Let's build something today.",
  "Your body is waiting. Move.",
  "No excuses. Let's work.",
  "Time to evolve.",
];

export default function Home() {
  const [, navigate] = useLocation();
  const [greeting, setGreeting] = useState(GREETINGS[0]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Load user name from localStorage (set during onboarding/profile)
    const profile = localStorage.getItem('tuf_profile');
    if (profile) {
      try {
        const p = JSON.parse(profile);
        setUserName(p.name?.split(' ')[0] || '');
      } catch {}
    }
    // Rotate greeting
    const idx = Math.floor(Math.random() * GREETINGS.length);
    setGreeting(GREETINGS[idx]);
  }, []);

  // Mock progress scores — will be real from DB later
  const scores = {
    mobility: 62,
    strength: 48,
    stability: 71,
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-[480px] mx-auto px-4 pt-6">

        {/* ── Panther Avatar Section ─────────────────────────────────── */}
        <section className="flex flex-col items-center mb-8">
          <PantherAvatar state="idle" size="lg" />
          <div className="mt-4 text-center">
            {userName && (
              <p className="text-xs font-bold tracking-widest text-muted-foreground mb-1">
                WELCOME BACK
              </p>
            )}
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              {userName ? (
                <>HEY <span className="text-primary">{userName.toUpperCase()}</span></>
              ) : (
                <span className="text-primary">TURNED UP FITNESS</span>
              )}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">{greeting}</p>
          </div>
        </section>

        {/* ── Dynamic Action Cards ───────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-3 mb-8">
          {/* Fix Your Movement */}
          <button
            onClick={() => navigate('/assess')}
            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-primary text-white shadow-lg hover:shadow-xl active:scale-[0.98] transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
              🔴
            </div>
            <div className="flex-1">
              <p className="font-black text-base tracking-wide">FIX YOUR MOVEMENT</p>
              <p className="text-white/80 text-sm">Assess your compensations</p>
            </div>
            <span className="text-white/60 text-xl">›</span>
          </button>

          {/* Start Workout */}
          <button
            onClick={() => navigate('/train')}
            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-foreground text-background shadow-lg hover:shadow-xl active:scale-[0.98] transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
              🔥
            </div>
            <div className="flex-1">
              <p className="font-black text-base tracking-wide">START WORKOUT</p>
              <p className="text-background/70 text-sm">Train with purpose</p>
            </div>
            <span className="text-background/40 text-xl">›</span>
          </button>

          {/* Today's Focus */}
          <button
            onClick={() => navigate('/correct')}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-border bg-card hover:bg-secondary active:scale-[0.98] transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
              🧠
            </div>
            <div className="flex-1">
              <p className="font-black text-base tracking-wide text-foreground">TODAY'S FOCUS</p>
              <p className="text-muted-foreground text-sm">Hips · Core · Posture</p>
            </div>
            <span className="text-muted-foreground text-xl">›</span>
          </button>
        </section>

        {/* ── Progress Bar Section ───────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-xs font-black tracking-widest text-muted-foreground mb-4">
            YOUR PROGRESS
          </h2>
          <div className="space-y-3">
            {[
              { label: 'MOBILITY', value: scores.mobility, color: 'bg-blue-500' },
              { label: 'STRENGTH', value: scores.strength, color: 'bg-primary' },
              { label: 'STABILITY', value: scores.stability, color: 'bg-emerald-500' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold tracking-wider text-muted-foreground">{label}</span>
                  <span className="text-xs font-black text-foreground">{value}%</span>
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
        </section>

        {/* ── JARVIS Quick Access ────────────────────────────────────── */}
        <section>
          <button
            onClick={() => navigate('/jarvis')}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-lg flex-shrink-0">
              🐆
            </div>
            <div className="flex-1 text-left">
              <p className="font-black text-sm tracking-wide text-foreground">ASK JARVIS</p>
              <p className="text-xs text-muted-foreground">AI coaching · Live form check</p>
            </div>
            <span className="text-muted-foreground text-lg">›</span>
          </button>
        </section>

      </main>
    </div>
  );
}
