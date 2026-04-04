import { useState } from 'react';
import { TufHeader } from '@/components/TufHeader';
import { TufBottomNav } from '@/components/TufBottomNav';
import { ChevronDown, Play, Info } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  sets: number;
  reps: number;
  duration?: string;
  description: string;
  coachingCue: string;
  modification?: string;
}

const exercises: Exercise[] = [
  {
    id: '1',
    name: 'Glute Bridge',
    muscleGroup: 'Glutes',
    difficulty: 'Beginner',
    sets: 3,
    reps: 15,
    duration: '3 sec hold',
    description: 'Building time under tension at the top',
    coachingCue: 'Squeeze at the top for 3 seconds. Feel the glute contraction.',
    modification: 'Single leg for more challenge without adding weight',
  },
  {
    id: '2',
    name: 'Band Row',
    muscleGroup: 'Back',
    difficulty: 'Beginner',
    sets: 3,
    reps: 12,
    duration: '1 sec squeeze',
    description: 'Add a one-second squeeze at the end of each rep',
    coachingCue: 'Pull elbows back. Squeeze shoulder blades together.',
    modification: 'Use lighter band if form breaks down',
  },
  {
    id: '3',
    name: 'Box Squat',
    muscleGroup: 'Legs',
    difficulty: 'Intermediate',
    sets: 3,
    reps: 12,
    duration: 'Pause at bottom',
    description: 'Same high box, add a brief pause at the bottom before standing',
    coachingCue: 'Chest up. Knees track over toes. Pause 1 second at bottom.',
    modification: 'Reduce depth if knee discomfort',
  },
  {
    id: '4',
    name: 'Farmer Carry',
    muscleGroup: 'Core',
    difficulty: 'Intermediate',
    sets: 3,
    reps: 40,
    duration: 'seconds',
    description: 'Slightly longer hold than week one, same light weight',
    coachingCue: 'Stand tall. Shoulders back. Engage core.',
    modification: 'Reduce weight or time if grip fails',
  },
  {
    id: '5',
    name: 'Chest Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    sets: 4,
    reps: 8,
    duration: '2 sec lower',
    description: 'Control the descent. Tempo training builds strength.',
    coachingCue: 'Lower slowly. Press explosively. Full range of motion.',
    modification: 'Reduce weight by 10% if shoulder discomfort',
  },
  {
    id: '6',
    name: 'Deadlift',
    muscleGroup: 'Posterior Chain',
    difficulty: 'Advanced',
    sets: 5,
    reps: 5,
    duration: '2 sec hold',
    description: 'Master the hinge pattern. This builds total body strength.',
    coachingCue: 'Chest up. Hips back. Neutral spine. Drive through heels.',
    modification: 'Reduce weight. Focus on form over load.',
  },
  {
    id: '7',
    name: 'Pull-up',
    muscleGroup: 'Back',
    difficulty: 'Advanced',
    sets: 3,
    reps: 5,
    duration: '1 sec pause',
    description: 'Build pulling strength. Modify as needed.',
    coachingCue: 'Full range of motion. Chest to bar. Control the descent.',
    modification: 'Use assistance band or machine if needed',
  },
];

const muscleGroups = ['All', 'Glutes', 'Back', 'Legs', 'Chest', 'Core', 'Posterior Chain'];

export default function Move() {
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredExercises = selectedMuscle === 'All' 
    ? exercises 
    : exercises.filter(ex => ex.muscleGroup === selectedMuscle);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-900 text-green-100';
      case 'Intermediate':
        return 'bg-yellow-900 text-yellow-100';
      case 'Advanced':
        return 'bg-red-900 text-red-100';
      default:
        return 'bg-gray-700 text-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TufHeader />

      <main className="pb-24">
        {/* Hero Section */}
        <section className="px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto fade-in">
            <p className="text-sm font-semibold text-accent tracking-wide mb-2">TODAY'S WORKOUT</p>
            <h1 className="text-5xl md:text-6xl font-bold mb-2">
              <span className="text-gradient">MOVE</span>
            </h1>
            <p className="text-lg text-muted-foreground">33 exercises • Progressive difficulty • Strength focus</p>
          </div>
        </section>

        {/* Muscle Group Filter */}
        <section className="px-4 py-6 sticky top-20 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {muscleGroups.map(group => (
                <button
                  key={group}
                  onClick={() => setSelectedMuscle(group)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                    selectedMuscle === group
                      ? 'bg-primary text-white'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Exercise List */}
        <section className="px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredExercises.map((exercise, idx) => (
              <div key={exercise.id} className="card-glass group hover-lift scale-in" style={{ animationDelay: `${idx * 50}ms` }}>
                <button
                  onClick={() => setExpandedId(expandedId === exercise.id ? null : exercise.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{exercise.name}</h3>
                      <p className="text-sm text-muted-foreground">{exercise.muscleGroup}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-lg badge-apple`}>
                        {exercise.difficulty}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-primary transition-transform duration-300 ${
                          expandedId === exercise.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex gap-4 mt-3 pt-3 border-t border-border">
                    <div className="text-sm">
                      <p className="text-muted-foreground text-xs">SETS</p>
                      <p className="font-bold text-primary">{exercise.sets}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground text-xs">REPS</p>
                      <p className="font-bold text-primary">{exercise.reps}</p>
                    </div>
                    {exercise.duration && (
                      <div className="text-sm">
                        <p className="text-muted-foreground text-xs">TIMING</p>
                        <p className="font-bold text-primary">{exercise.duration}</p>
                      </div>
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedId === exercise.id && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-4 fade-in">
                    <div>
                      <h4 className="text-label text-primary mb-2">DESCRIPTION</h4>
                      <p className="text-sm text-foreground">{exercise.description}</p>
                    </div>

                    <div className="bg-secondary rounded p-3">
                      <h4 className="text-label text-accent mb-2">💡 COACHING CUE</h4>
                      <p className="text-sm text-foreground">{exercise.coachingCue}</p>
                    </div>

                    {exercise.modification && (
                      <div className="bg-secondary rounded p-3">
                        <h4 className="text-label text-primary mb-2">🔄 MODIFICATION</h4>
                        <p className="text-sm text-foreground">{exercise.modification}</p>
                      </div>
                    )}

                    <button className="btn-primary w-full">
                      <Play className="w-4 h-4 inline mr-2" />
                      Start Exercise
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Info Section */}
        <section className="px-4 py-6">
          <div className="max-w-4xl mx-auto bg-secondary rounded-lg p-6 border-l-4 border-primary flex gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold mb-1">Progressive Overload</h4>
              <p className="text-sm text-muted-foreground">Each week, add 1-2 reps or increase weight by 5%. Small increments build lasting strength.</p>
            </div>
          </div>
        </section>
      </main>

      <TufBottomNav />
    </div>
  );
}
