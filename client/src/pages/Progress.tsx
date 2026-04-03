import { TufHeader } from '@/components/TufHeader';
import { TufBottomNav } from '@/components/TufBottomNav';
import { TrendingUp, Award, Zap, Target } from 'lucide-react';

export default function Progress() {
  const progressData = {
    mhiRing: 72,
    weeklyAverage: 4.2,
    totalWorkouts: 24,
    totalMinutes: 1440,
    streak: 8,
    prs: 3,
  };

  const trajectory = [
    { week: 'W1', value: 45 },
    { week: 'W2', value: 52 },
    { week: 'W3', value: 58 },
    { week: 'W4', value: 65 },
    { week: 'W5', value: 68 },
    { week: 'W6', value: 72 },
  ];

  const maxValue = 100;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TufHeader />

      <main className="pb-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-card to-background px-4 py-8 border-b border-border">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-headline mb-2">PROGRESS</h1>
            <p className="text-muted-foreground">Track your 90-day transformation</p>
          </div>
        </section>

        {/* MHI Ring */}
        <section className="px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="card-tuf text-center">
              <h2 className="text-label text-accent mb-6">MUSCLE HEALTH INDEX</h2>
              
              {/* Ring Visualization */}
              <div className="flex justify-center mb-6">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${(progressData.mhiRing / maxValue) * 282.7} 282.7`}
                      strokeLinecap="round"
                      className="text-primary transition-all duration-1000"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-primary">{progressData.mhiRing}</span>
                    <span className="text-xs text-muted-foreground mt-1">/ 100</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                Your muscle health is improving. Keep the momentum going!
              </p>

              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">WEEKLY AVG</p>
                  <p className="font-bold text-primary">{progressData.weeklyAverage}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">TOTAL WORKOUTS</p>
                  <p className="font-bold text-accent">{progressData.totalWorkouts}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">TOTAL MINUTES</p>
                  <p className="font-bold">{progressData.totalMinutes}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 90-Day Trajectory */}
        <section className="px-4 py-8 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-label text-accent mb-6">90-DAY TRAJECTORY</h2>
            
            <div className="card-tuf">
              {/* Chart */}
              <div className="flex items-end justify-between h-48 gap-2 mb-4 px-2">
                {trajectory.map((point, idx) => {
                  const height = (point.value / maxValue) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gradient-to-t from-primary to-accent rounded-t" style={{ height: `${height}%` }} />
                      <span className="text-xs text-muted-foreground mt-2">{point.week}</span>
                    </div>
                  );
                })}
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Consistent progress. You're on track for a 60+ MHI by day 90.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="px-4 py-8 border-t border-border">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-tuf">
              <div className="flex items-start justify-between mb-3">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Current Streak</h3>
              <p className="text-3xl font-bold text-primary mb-2">{progressData.streak}</p>
              <p className="text-xs text-muted-foreground">days of consistency</p>
            </div>

            <div className="card-tuf">
              <div className="flex items-start justify-between mb-3">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Personal Records</h3>
              <p className="text-3xl font-bold text-accent mb-2">{progressData.prs}</p>
              <p className="text-xs text-muted-foreground">new PRs this month</p>
            </div>

            <div className="card-tuf">
              <div className="flex items-start justify-between mb-3">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Trend</h3>
              <p className="text-3xl font-bold text-primary mb-2">↗ 8%</p>
              <p className="text-xs text-muted-foreground">vs last 30 days</p>
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="px-4 py-8 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-label text-accent mb-4">MILESTONES</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card-tuf">
                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground">First Week Complete</h3>
                    <p className="text-xs text-muted-foreground">Unlocked on Day 7</p>
                  </div>
                </div>
              </div>

              <div className="card-tuf">
                <div className="flex items-start gap-3">
                  <Target className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground">10 Workouts</h3>
                    <p className="text-xs text-muted-foreground">Unlocked on Day 15</p>
                  </div>
                </div>
              </div>

              <div className="card-tuf opacity-60">
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground">30-Day Streak</h3>
                    <p className="text-xs text-muted-foreground">Unlock on Day 30</p>
                  </div>
                </div>
              </div>

              <div className="card-tuf opacity-60">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground">Phase Complete</h3>
                    <p className="text-xs text-muted-foreground">Unlock on Day 30</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NSV Logging */}
        <section className="px-4 py-8 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-label text-accent mb-4">NON-SCALE VICTORIES (NSVs)</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Track the wins that matter most — strength, mobility, energy, and how you feel
            </p>
            
            <div className="space-y-3">
              <div className="card-tuf">
                <div className="font-semibold text-foreground mb-1">💪 Did 10 push-ups without stopping</div>
                <div className="text-xs text-muted-foreground">Day 28 • 2 days ago</div>
              </div>

              <div className="card-tuf">
                <div className="font-semibold text-foreground mb-1">🦵 Woke up with less joint pain</div>
                <div className="text-xs text-muted-foreground">Day 25 • 5 days ago</div>
              </div>

              <div className="card-tuf">
                <div className="font-semibold text-foreground mb-1">🏃 Climbed stairs without breathing hard</div>
                <div className="text-xs text-muted-foreground">Day 20 • 10 days ago</div>
              </div>

              <button className="btn-accent w-full mt-4">
                Log a New Victory
              </button>
            </div>
          </div>
        </section>
      </main>

      <TufBottomNav />
    </div>
  );
}
