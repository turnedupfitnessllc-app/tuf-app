import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Award, Target, Zap } from "lucide-react";

/**
 * PROGRESS — Member Health Index & Trajectory
 * MHI ring visualization + 90-day progress tracking
 * NSV (Non-Scale Victory) logging and milestone tracking
 */
export default function Progress() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">PROGRESS</h1>
        <p className="text-muted-foreground text-lg">Your 90-day transformation journey</p>
      </div>

      {/* MHI Ring */}
      <Card className="bg-card border-border p-6 md:p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">Member Health Index (MHI)</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Ring Visualization */}
          <div className="relative w-48 h-48 md:w-56 md:h-56">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background ring */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-secondary"
              />
              {/* Progress ring */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={`${(75 / 100) * 565.48} 565.48`}
                className="text-primary transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl md:text-5xl font-bold text-primary">75</div>
              <div className="text-xs md:text-sm text-muted-foreground">out of 100</div>
            </div>
          </div>

          {/* MHI Breakdown */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold">Strength</span>
                <span className="text-sm text-primary font-bold">85%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "85%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold">Mobility</span>
                <span className="text-sm text-accent font-bold">72%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: "72%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold">Nutrition</span>
                <span className="text-sm text-destructive font-bold">68%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-destructive h-2 rounded-full" style={{ width: "68%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold">Recovery</span>
                <span className="text-sm text-chart-1 font-bold">78%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-chart-1 h-2 rounded-full" style={{ width: "78%" }} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 90-Day Trajectory */}
      <Card className="bg-card border-border p-6 md:p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">90-Day Trajectory</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <div className="font-semibold text-foreground">Days Completed</div>
              <div className="text-sm text-muted-foreground">You're 32 days into your journey</div>
            </div>
            <div className="text-3xl font-bold text-primary">32/90</div>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div className="bg-primary h-3 rounded-full" style={{ width: "35.5%" }} />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Phase</div>
              <div className="font-bold text-lg">Foundation</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Workouts</div>
              <div className="font-bold text-lg">28/30</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Adherence</div>
              <div className="font-bold text-lg text-primary">93%</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Milestones */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Milestones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card border-border p-4 md:p-6">
            <div className="flex items-start gap-4">
              <Award className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">First Week Complete</h3>
                <p className="text-sm text-muted-foreground">Unlocked on Day 7</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-4 md:p-6">
            <div className="flex items-start gap-4">
              <Target className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">10 Workouts</h3>
                <p className="text-sm text-muted-foreground">Unlocked on Day 15</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-4 md:p-6 opacity-50">
            <div className="flex items-start gap-4">
              <Zap className="w-6 h-6 text-destructive mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">30-Day Streak</h3>
                <p className="text-sm text-muted-foreground">Unlock on Day 30</p>
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border p-4 md:p-6 opacity-50">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-6 h-6 text-chart-1 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">Phase Complete</h3>
                <p className="text-sm text-muted-foreground">Unlock on Day 30</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* NSV Logging */}
      <Card className="bg-card border-border p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-4">Non-Scale Victories (NSVs)</h2>
        <p className="text-muted-foreground mb-6">
          Track the wins that matter most — strength, mobility, energy, and how you feel
        </p>
        <div className="space-y-3 mb-6">
          <div className="p-4 bg-secondary/50 rounded-lg border border-border">
            <div className="font-semibold text-foreground mb-1">Did 10 push-ups without stopping</div>
            <div className="text-xs text-muted-foreground">Day 28 • 2 days ago</div>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg border border-border">
            <div className="font-semibold text-foreground mb-1">Woke up with less joint pain</div>
            <div className="text-xs text-muted-foreground">Day 25 • 5 days ago</div>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg border border-border">
            <div className="font-semibold text-foreground mb-1">Climbed stairs without breathing hard</div>
            <div className="text-xs text-muted-foreground">Day 20 • 10 days ago</div>
          </div>
        </div>
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          Log a New Victory
        </Button>
      </Card>
    </div>
  );
}
