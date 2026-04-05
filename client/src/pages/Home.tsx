import { useLocation } from 'wouter';
import { Flame, TrendingUp, Zap, Trophy, ArrowRight } from 'lucide-react';
import { AngleButton } from '@/components/ui/angle-button';

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* Welcome Section */}
        <section className="mb-12">
          <div className="text-sm font-bold text-muted-foreground mb-2 tracking-widest">
            WELCOME BACK
          </div>
          <h1 className="heading-blade-lg mb-2">
            <span className="text-black">HEY </span>
            <span className="text-primary">ALEX</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to build muscle and strength today?
          </p>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {/* Current Streak */}
          <div className="card-exec p-6 border-l-4 border-primary">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-1 tracking-widest">
                  CURRENT STREAK
                </p>
                <h2 className="heading-blade-md text-primary">8 DAYS</h2>
              </div>
              <Flame className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Keep the momentum going</p>
          </div>

          {/* This Week */}
          <div className="card-exec p-6 border-l-4 border-accent">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-1 tracking-widest">
                  THIS WEEK
                </p>
                <h2 className="heading-blade-md text-accent">5/7</h2>
              </div>
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground">Workouts completed</p>
          </div>
          </section>

        {/* Today's Focus */}
        <section className="mb-12">
          <h2 className="heading-blade-md mb-6">
            <span className="text-black">TODAY'S </span>
            <span className="text-primary">FOCUS</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* MOVE */}
            <button
              onClick={() => navigate('/move')}
              className="card-exec p-6 text-left hover:shadow-lg transition-all group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">💪</div>
              <h3 className="heading-blade-sm text-black mb-2">MOVE</h3>
              <p className="text-sm text-muted-foreground">Strength & conditioning</p>
            </button>

            {/* FUEL */}
            <button
              onClick={() => navigate('/fuel')}
              className="card-exec p-6 text-left hover:shadow-lg transition-all group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🥗</div>
              <h3 className="heading-blade-sm text-black mb-2">FUEL</h3>
              <p className="text-sm text-muted-foreground">Nutrition tracking</p>
            </button>

            {/* FEAST */}
            <button
              onClick={() => navigate('/feast')}
              className="card-exec p-6 text-left hover:shadow-lg transition-all group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🍽️</div>
              <h3 className="heading-blade-sm text-black mb-2">FEAST</h3>
              <p className="text-sm text-muted-foreground">Recipe library</p>
            </button>
          </div>
        </section>

        {/* Quick Stats */}
        <section>
          <h2 className="heading-blade-md mb-6">
            <span className="text-black">YOUR </span>
            <span className="text-primary">STATS</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-exec p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">24</div>
              <p className="text-xs text-muted-foreground font-bold">WORKOUTS</p>
            </div>
            <div className="card-exec p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">1,240</div>
              <p className="text-xs text-muted-foreground font-bold">MINUTES</p>
            </div>
            <div className="card-exec p-4 text-center">
              <div className="text-2xl font-bold text-accent mb-1">8</div>
              <p className="text-xs text-muted-foreground font-bold">STREAK</p>
            </div>
            <div className="card-exec p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">12</div>
              <p className="text-xs text-muted-foreground font-bold">PRS</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary to-red-700 rounded-lg p-8 text-center">
          <h2 className="heading-blade-md text-white mb-3">Ready to Transform?</h2>
          <p className="text-white/90 mb-6">Get personalized coaching from JARVIS and track your progress</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AngleButton 
              variant="learn-more" 
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
              onClick={() => navigate('/jarvis')}
            >
              Ask JARVIS
            </AngleButton>
            <AngleButton 
              variant="buy-now" 
              size="lg"
              onClick={() => navigate('/move')}
            >
              Start Workout
            </AngleButton>
          </div>
        </section>
      </main>
    </div>
  );
}
