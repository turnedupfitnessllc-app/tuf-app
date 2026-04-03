import { Card } from "@/components/ui/card";
import { BookOpen, Award, Zap } from "lucide-react";

/**
 * VAULT — Science Library & Achievements
 * Research articles, science-backed guidance, and achievement tracking
 */
export default function Vault() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">VAULT</h1>
        <p className="text-muted-foreground text-lg">Your personal science library and achievement vault</p>
      </div>

      {/* Science Articles */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Science Articles</h2>
        <div className="space-y-4">
          {[
            {
              title: "Sarcopenia After 40: What You Need to Know",
              category: "Muscle Science",
              excerpt: "Understanding muscle loss and how to prevent it",
              icon: "💪",
            },
            {
              title: "The Anti-Inflammatory Diet for Joint Health",
              category: "Nutrition",
              excerpt: "Foods that reduce inflammation and support mobility",
              icon: "🥗",
            },
            {
              title: "Sleep, Recovery, and the 40+ Body",
              category: "Recovery",
              excerpt: "Why sleep becomes more critical after 40",
              icon: "😴",
            },
            {
              title: "Progressive Overload for Beginners",
              category: "Training",
              excerpt: "How to safely increase intensity without injury",
              icon: "📈",
            },
          ].map((article, i) => (
            <Card
              key={i}
              className="p-4 md:p-6 bg-card border-border hover:border-primary/50 cursor-pointer transition-colors"
            >
              <div className="flex gap-4">
                <div className="text-3xl flex-shrink-0">{article.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-foreground text-lg flex-1">{article.title}</h3>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded ml-3 flex-shrink-0 whitespace-nowrap">
                      {article.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { icon: "🏆", label: "First Workout", unlocked: true },
            { icon: "🔥", label: "7-Day Streak", unlocked: true },
            { icon: "💪", label: "Strength Milestone", unlocked: true },
            { icon: "🎯", label: "30-Day Streak", unlocked: false },
            { icon: "⚡", label: "Phase Complete", unlocked: false },
            { icon: "🚀", label: "90-Day Champion", unlocked: false },
          ].map((achievement, i) => (
            <Card
              key={i}
              className={`p-4 md:p-6 text-center transition-all ${
                achievement.unlocked
                  ? "bg-card border-border hover:border-primary/50"
                  : "bg-secondary/30 border-border/50 opacity-50"
              }`}
            >
              <div className="text-3xl md:text-4xl mb-3">{achievement.icon}</div>
              <p className="text-xs md:text-sm font-semibold text-foreground">{achievement.label}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-card border-border">
          <BookOpen className="w-6 h-6 text-primary mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Articles Read</h3>
          <p className="text-3xl font-bold text-primary">12</p>
          <p className="text-xs text-muted-foreground mt-1">Keep learning and growing</p>
        </Card>
        <Card className="p-6 bg-card border-border">
          <Award className="w-6 h-6 text-accent mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Achievements Unlocked</h3>
          <p className="text-3xl font-bold text-accent">3</p>
          <p className="text-xs text-muted-foreground mt-1">3 more to go!</p>
        </Card>
        <Card className="p-6 bg-card border-border">
          <Zap className="w-6 h-6 text-destructive mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Knowledge Score</h3>
          <p className="text-3xl font-bold text-destructive">82%</p>
          <p className="text-xs text-muted-foreground mt-1">You know your stuff!</p>
        </Card>
      </div>
    </div>
  );
}
