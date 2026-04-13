import { useState } from "react";
import { Play, X, Dumbbell, Zap, Wind, Flame } from "lucide-react";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";

interface Exercise {
  id: string;
  name: string;
  category: "Strength" | "Cardio" | "Mobility" | "Full Body" | "Motivation";
  description: string;
  reps?: string;
  duration?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  videoUrl: string;
  muscleGroup: string;
}

const EXERCISES: Exercise[] = [
  { id: "1", name: "Panther Squat", category: "Strength", description: "Explosive bodyweight squat with full depth. Drive through your heels, keep chest tall.", reps: "3 × 12-15", difficulty: "Beginner", muscleGroup: "Legs", videoUrl: `${CDN}/jarvis-squat_29894acb.mp4` },
  { id: "2", name: "Strength Montage", category: "Strength", description: "Full strength circuit — dumbbell lifts, barbell squats, and deadlifts back to back.", reps: "4 × 8-10", difficulty: "Advanced", muscleGroup: "Full Body", videoUrl: `${CDN}/jarvis-strength-montage_89d7eee5.mp4` },
  { id: "3", name: "Squat-Lunge-Flex Combo", category: "Full Body", description: "Dynamic sequence combining squats, lunges, and power flexes. Build total-body strength and coordination.", reps: "3 × 10 each", difficulty: "Intermediate", muscleGroup: "Full Body", videoUrl: `${CDN}/jarvis-squat-lunge-flex_96c7bdc9.mp4` },
  { id: "4", name: "High Knees Cardio Blast", category: "Cardio", description: "Vigorous high knees in place — elevate your heart rate and ignite your core.", duration: "4 × 45 sec", difficulty: "Intermediate", muscleGroup: "Core / Cardio", videoUrl: `${CDN}/jarvis-high-knees_39ea0db8.mp4` },
  { id: "5", name: "Sprint Stance Drill", category: "Cardio", description: "Explosive sprint stance transitions. Build fast-twitch power and athletic acceleration.", duration: "6 × 20 sec", difficulty: "Advanced", muscleGroup: "Legs / Cardio", videoUrl: `${CDN}/jarvis-sprint-stance_a110b221.mp4` },
  { id: "6", name: "Lunge & Stretch Flow", category: "Mobility", description: "Dynamic lunge with hip flexor stretch. Improve mobility, reduce injury risk, and prime your body.", reps: "3 × 10 each leg", difficulty: "Beginner", muscleGroup: "Hips / Legs", videoUrl: `${CDN}/jarvis-lunge-stretch_5b0b7c7f.mp4` },
  { id: "7", name: "Martial Arts Strike", category: "Full Body", description: "Spinning martial arts strike sequence. Builds rotational power, coordination, and explosive speed.", reps: "3 × 8 each side", difficulty: "Advanced", muscleGroup: "Core / Full Body", videoUrl: `${CDN}/jarvis-martial-arts_e0b5e10f.mp4` },
  { id: "8", name: "Run-Kick-Flex Sequence", category: "Full Body", description: "Running burst into a high kick and double bicep flex. Agility meets raw power.", reps: "4 × 6", difficulty: "Advanced", muscleGroup: "Full Body", videoUrl: `${CDN}/jarvis-run-kick-flex_e7629990.mp4` },
  { id: "9", name: "Combat Stance Walk", category: "Motivation", description: "Walk forward with authority, double bicep flex, drop into combat stance. Own the room.", duration: "Use as warm-up ritual", difficulty: "Beginner", muscleGroup: "Mental / Activation", videoUrl: `${CDN}/jarvis-combat-stance_aae0a723.mp4` },
  { id: "10", name: "Power Pose Hold", category: "Motivation", description: "Static power pose — control your breathing, visualize your goal, activate your mindset.", duration: "3 × 60 sec", difficulty: "Beginner", muscleGroup: "Mental / Core", videoUrl: `${CDN}/jarvis-power-pose_05e6e1f9.mp4` },
  { id: "11", name: "Walk Forward Activation", category: "Mobility", description: "Confident forward walk to prime your body and mind before a heavy session.", duration: "Use as warm-up", difficulty: "Beginner", muscleGroup: "Full Body Activation", videoUrl: `${CDN}/jarvis-walk-forward_7a4d2ac5.mp4` },
  { id: "12", name: "Idle Flex Hold", category: "Motivation", description: "Subtle flex and head turn — a reminder of what you're building. Use between sets.", duration: "Between sets", difficulty: "Beginner", muscleGroup: "Mental", videoUrl: `${CDN}/jarvis-idle-flex_ba34833b.mp4` },
  { id: "13", name: "PANTHER Roar Activation", category: "Motivation", description: "Fierce roar to ignite your session. Play this before your heaviest lift.", duration: "Pre-workout ritual", difficulty: "Beginner", muscleGroup: "Mental / CNS", videoUrl: `${CDN}/jarvis-roar_c3a368a6.mp4` },
  { id: "14", name: "PANTHER Snarl Focus", category: "Motivation", description: "Intense snarl and stare — lock in your focus before a competition or max effort set.", duration: "Pre-set ritual", difficulty: "Beginner", muscleGroup: "Mental", videoUrl: `${CDN}/jarvis-snarl_d63dad14.mp4` },
];

const CATEGORIES = ["All", "Strength", "Cardio", "Full Body", "Mobility", "Motivation"] as const;
type Category = typeof CATEGORIES[number];

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "text-green-400 bg-green-400/10 border-green-400/30",
  Intermediate: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  Advanced: "text-red-400 bg-red-400/10 border-red-400/30",
};

export default function Move() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [activeVideo, setActiveVideo] = useState<Exercise | null>(null);

  const filtered = activeCategory === "All"
    ? EXERCISES
    : EXERCISES.filter(e => e.category === activeCategory);

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <section className="mb-6">
          <h1 className="heading-blade-lg mb-1">
            <span className="text-foreground">LET'S </span>
            <span className="text-primary">MOVE</span>
          </h1>
          <p className="text-sm text-muted-foreground font-mono tracking-wider">
            {EXERCISES.length} PANTHER-POWERED MOVEMENTS · TAP TO PLAY
          </p>
        </section>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold tracking-wider border transition-all ${
                activeCategory === cat
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/30"
                  : "bg-secondary text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(ex => (
            <div
              key={ex.id}
              className="card-exec group cursor-pointer overflow-hidden hover:border-primary/60 transition-all hover:shadow-lg hover:shadow-primary/10"
              onClick={() => setActiveVideo(ex)}
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-3">
                <video
                  src={ex.videoUrl}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  muted
                  loop
                  playsInline
                  onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                  onMouseLeave={e => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[ex.difficulty]}`}>
                    {ex.difficulty.toUpperCase()}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="text-[10px] font-mono text-white/70 bg-black/60 px-2 py-0.5 rounded-full">
                    {ex.muscleGroup}
                  </span>
                </div>
              </div>
              {/* Info */}
              <div className="px-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-sm text-foreground leading-tight">{ex.name}</h3>
                  <span className="text-[10px] font-mono text-primary flex-shrink-0 bg-primary/10 px-2 py-0.5 rounded-full">{ex.category}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{ex.description}</p>
                <div className="text-xs font-bold text-primary font-mono">{ex.reps || ex.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Full-Screen Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setActiveVideo(null)}>
          <div className="relative w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveVideo(null)} className="absolute -top-12 right-0 text-white/60 hover:text-white flex items-center gap-2 text-sm font-mono">
              <X className="w-5 h-5" /> CLOSE
            </button>
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <video src={activeVideo.videoUrl} className="w-full" autoPlay loop playsInline controls />
            </div>
            <div className="mt-4 px-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="heading-blade-sm text-white">{activeVideo.name}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[activeVideo.difficulty]}`}>{activeVideo.difficulty.toUpperCase()}</span>
              </div>
              <p className="text-sm text-white/70 mb-3">{activeVideo.description}</p>
              <div className="flex gap-4 text-xs font-mono">
                <span className="text-primary">{activeVideo.reps || activeVideo.duration}</span>
                <span className="text-white/40">{activeVideo.muscleGroup}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
