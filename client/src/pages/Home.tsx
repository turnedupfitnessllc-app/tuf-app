import { TufHeader } from '@/components/TufHeader';
import { TufBottomNav } from '@/components/TufBottomNav';
import { ArrowRight, Flame, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <TufHeader />

      <main className="pb-24">
        {/* Hero Section */}
        <section className="px-4 py-12 md:py-20 bg-gradient-to-b from-background to-secondary/30">
          <div className="max-w-4xl mx-auto fade-in">
            <p className="text-sm font-semibold text-accent tracking-widest mb-3 uppercase">Welcome back</p>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Hey <span className="text-gradient">Alex</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Ready to build muscle and strength today?
            </p>
          </div>
        </section>

        {/* Streak & Stats */}
        <section className="px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Streak Card */}
              <div className="card-exec border-l-4 border-primary hover-lift scale-in">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold mb-1">🔥 CURRENT STREAK</p>
                    <h3 className="text-4xl font-bold text-primary">8 Days</h3>
                  </div>
                  <div className="text-5xl">🔥</div>
                </div>
                <p className="text-sm text-muted-foreground">Keep the momentum going</p>
              </div>

              {/* Quick Stats */}
              <div className="card-exec border-l-4 border-accent hover-lift scale-in" style={{ animationDelay: '100ms' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold mb-1">📊 THIS WEEK</p>
                    <h3 className="text-4xl font-bold text-accent">5/7</h3>
                  </div>
                  <div className="text-5xl">📊</div>
                </div>
                <p className="text-sm text-muted-foreground">Workouts completed</p>
              </div>
            </div>
          </div>
        </section>

        {/* Today's Focus */}
        <section className="px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Today's Focus</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* MOVE */}
              <Link href="/move">
                <div className="card-exec hover-lift scale-in cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">MOVE</p>
                      <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">Strength</h3>
                    </div>
                    <div className="text-3xl">⚡</div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">7 exercises • 45 min</p>
                  <div className="flex items-center text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    Start <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>

              {/* FUEL */}
              <Link href="/fuel">
                <div className="card-exec hover-lift scale-in cursor-pointer group" style={{ animationDelay: '100ms' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">FUEL</p>
                      <h3 className="text-2xl font-bold group-hover:text-accent transition-colors">Nutrition</h3>
                    </div>
                    <div className="text-3xl">🍎</div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Track macros • 2,200 cal</p>
                  <div className="flex items-center text-accent font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    Log <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>

              {/* FEAST */}
              <Link href="/feast">
                <div className="card-exec hover-lift scale-in cursor-pointer group" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">FEAST</p>
                      <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">Recipes</h3>
                    </div>
                    <div className="text-3xl">🍽️</div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">43 recipes • High protein</p>
                  <div className="flex items-center text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    Browse <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Your Progress</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card-exec text-center hover-lift">
                <div className="text-3xl font-bold text-primary mb-2">24</div>
                <p className="text-xs text-muted-foreground font-semibold">Workouts</p>
              </div>
              <div className="card-exec text-center hover-lift" style={{ animationDelay: '50ms' }}>
                <div className="text-3xl font-bold text-accent mb-2">1,440</div>
                <p className="text-xs text-muted-foreground font-semibold">Minutes</p>
              </div>
              <div className="card-exec text-center hover-lift" style={{ animationDelay: '100ms' }}>
                <div className="text-3xl font-bold text-primary mb-2">8</div>
                <p className="text-xs text-muted-foreground font-semibold">Day Streak</p>
              </div>
              <div className="card-exec text-center hover-lift" style={{ animationDelay: '150ms' }}>
                <div className="text-3xl font-bold text-accent mb-2">12</div>
                <p className="text-xs text-muted-foreground font-semibold">PRs</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="card-exec bg-gradient-to-r from-primary/5 to-accent/5 border-l-4 border-primary">
              <div className="flex items-start gap-4">
                <div className="text-4xl">💪</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Ready to crush today?</h3>
                  <p className="text-muted-foreground mb-4">Start with MOVE to build strength, then log your nutrition in FUEL.</p>
                  <Link href="/move">
                    <button className="btn-premium">
                      Start Workout <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <TufBottomNav />
    </div>
  );
}
