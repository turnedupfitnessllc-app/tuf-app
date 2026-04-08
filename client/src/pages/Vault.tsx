import { BookOpen, Award, Lock, ChevronRight } from 'lucide-react';

export default function Vault() {
  const articles = [
    {
      title: 'Sarcopenia After 40: What You Need to Know',
      category: 'Muscle Science',
      excerpt: 'Understanding muscle loss and how to prevent it',
      icon: '💪',
      locked: false,
    },
    {
      title: 'The Anti-Inflammatory Diet for Joint Health',
      category: 'Nutrition',
      excerpt: 'Foods that reduce inflammation and support mobility',
      icon: '🥗',
      locked: false,
    },
    {
      title: 'Sleep, Recovery, and the 40+ Body',
      category: 'Recovery',
      excerpt: 'Why sleep becomes more critical after 40',
      icon: '😴',
      locked: false,
    },
    {
      title: 'Progressive Overload for Beginners',
      category: 'Training',
      excerpt: 'How to safely increase intensity without injury',
      icon: '📈',
      locked: true,
    },
  ];

  const achievements = [
    { title: 'First Week Complete', icon: '🏆', unlocked: true },
    { title: '10 Workouts', icon: '💪', unlocked: true },
    { title: '30-Day Streak', icon: '🔥', unlocked: false },
    { title: 'Phase Complete', icon: '🎯', unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pb-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-card to-background px-4 py-8 border-b border-border">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-headline mb-2">VAULT</h1>
            <p className="text-muted-foreground">Science library & achievement tracking</p>
          </div>
        </section>

        {/* Science Articles */}
        <section className="px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-label text-accent mb-4">SCIENCE ARTICLES</h2>
            
            <div className="space-y-3">
              {articles.map((article, idx) => (
                <div key={idx} className={`card-tuf group ${article.locked ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{article.icon}</span>
                        <span className="text-xs font-semibold text-primary bg-primary/20 px-2 py-1 rounded">
                          {article.category}
                        </span>
                        {article.locked && (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="px-4 py-8 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-label text-accent mb-4">ACHIEVEMENTS</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {achievements.map((achievement, idx) => (
                <div
                  key={idx}
                  className={`card-tuf text-center ${achievement.unlocked ? '' : 'opacity-40'}`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <p className="text-xs font-semibold text-foreground">{achievement.title}</p>
                  {!achievement.unlocked && (
                    <p className="text-xs text-muted-foreground mt-1">Locked</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Unlockable Content */}
        <section className="px-4 py-8 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-label text-accent mb-4">UNLOCK WITH PROGRESS</h2>
            
            <div className="space-y-3">
              <div className="card-tuf opacity-60">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-foreground">Advanced Workout Tier</h3>
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Unlock when MHI reaches 80
                </p>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '72%' }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">72/80 MHI</p>
              </div>

              <div className="card-tuf opacity-60">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-foreground">Personalized Meal Plans</h3>
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Unlock when you complete 30 days
                </p>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: '28%' }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">28/30 Days</p>
              </div>

              <div className="card-tuf opacity-60">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-foreground">1-on-1 Coaching</h3>
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Unlock when you reach 90-day milestone
                </p>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '35%' }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">32/90 Days</p>
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="px-4 py-8 border-t border-border">
          <div className="max-w-4xl mx-auto bg-secondary rounded-lg p-6 border-l-4 border-accent">
            <div className="flex gap-3">
              <BookOpen className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold mb-1">Science-Backed Content</h4>
                <p className="text-sm text-muted-foreground">
                  All articles are written by fitness professionals and backed by peer-reviewed research. Your education is our priority.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
