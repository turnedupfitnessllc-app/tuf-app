import { TufHeader } from '@/components/TufHeader';
import { TufBottomNav } from '@/components/TufBottomNav';
import { Flame, Zap, TrendingUp, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TufHeader />

      <main className="pb-24">
        {/* Hero Section */}
        <section className="px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="fade-in">
              <p className="text-sm font-semibold text-accent tracking-wide mb-2">WELCOME BACK</p>
              <h1 className="text-5xl md:text-6xl font-bold mb-2">
                Hey <span className="text-gradient">Alex</span>
              </h1>
              <p className="text-lg text-muted-foreground">Ready to build muscle and strength today?</p>
            </div>

            {/* Streak Badge */}
            <div className="mt-8 card-glass scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">🔥 CURRENT STREAK</p>
                  <p className="text-3xl font-bold">8 Days</p>
                  <p className="text-xs text-muted-foreground mt-1">Keep the momentum going</p>
                </div>
                <div className="text-5xl">🔥</div>
              </div>
            </div>
          </div>
        </section>

        {/* Three Pillars */}
        <section className="px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-4">TODAY'S FOCUS</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* MOVE */}
              <div className="card-glass group hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-accent mb-1">MOVE</p>
                    <h3 className="text-xl font-bold">Strength</h3>
                  </div>
                  <Zap className="w-6 h-6 text-accent opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">7 exercises • 45 min</p>
                <div className="flex items-center text-accent text-sm font-semibold">
                  Start <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              {/* FUEL */}
              <div className="card-glass group hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-accent mb-1">FUEL</p>
                    <h3 className="text-xl font-bold">Nutrition</h3>
                  </div>
                  <Flame className="w-6 h-6 text-accent opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">Track macros • 2,200 cal</p>
                <div className="flex items-center text-accent text-sm font-semibold">
                  Log <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              {/* FEAST */}
              <div className="card-glass group hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-accent mb-1">FEAST</p>
                    <h3 className="text-xl font-bold">Recipes</h3>
                  </div>
                  <TrendingUp className="w-6 h-6 text-accent opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">43 recipes • High protein</p>
                <div className="flex items-center text-accent text-sm font-semibold">
                  Browse <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-4">YOUR STATS</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="stat-card">
                <p className="text-xs text-muted-foreground mb-2">WORKOUTS</p>
                <p className="text-3xl font-bold">24</p>
                <p className="text-xs text-muted-foreground mt-1">this month</p>
              </div>

              <div className="stat-card">
                <p className="text-xs text-muted-foreground mb-2">MINUTES</p>
                <p className="text-3xl font-bold">1,440</p>
                <p className="text-xs text-muted-foreground mt-1">total time</p>
              </div>

              <div className="stat-card">
                <p className="text-xs text-muted-foreground mb-2">STREAK</p>
                <p className="text-3xl font-bold text-primary">8</p>
                <p className="text-xs text-muted-foreground mt-1">days</p>
              </div>

              <div className="stat-card">
                <p className="text-xs text-muted-foreground mb-2">PRS</p>
                <p className="text-3xl font-bold text-accent">3</p>
                <p className="text-xs text-muted-foreground mt-1">new records</p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Coach Section */}
        <section className="px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="card-glass border-primary/30 hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-accent mb-2">AI COACH</p>
                  <h3 className="text-2xl font-bold">JARVIS</h3>
                </div>
                <div className="text-4xl">🐆</div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Your personal AI coach is ready. Get personalized guidance, real-time feedback, and adaptive programming.
              </p>
              <div className="flex items-center text-primary text-sm font-semibold">
                Chat with JARVIS <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        </section>

        {/* Insights Section */}
        <section className="px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-4">INSIGHTS</p>
            
            <div className="space-y-3">
              <div className="card-glass">
                <p className="text-sm font-semibold text-foreground mb-1">💪 Strength Gains</p>
                <p className="text-sm text-muted-foreground">
                  Your deadlift increased 15 lbs. This is real progress.
                </p>
              </div>

              <div className="card-glass">
                <p className="text-sm font-semibold text-foreground mb-1">🎯 Consistency Win</p>
                <p className="text-sm text-muted-foreground">
                  8-day streak. This is the foundation of transformation.
                </p>
              </div>

              <div className="card-glass">
                <p className="text-sm font-semibold text-foreground mb-1">📈 Next Milestone</p>
                <p className="text-sm text-muted-foreground">
                  Reach 80 MHI by day 60 to unlock Advanced workouts.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <TufBottomNav />
    </div>
  );
}
