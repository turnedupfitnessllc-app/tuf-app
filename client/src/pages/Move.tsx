import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  reps: string;
  sets: number;
  difficulty: 'B' | 'I' | 'A';
  muscleGroup: string;
}

const exercises: Exercise[] = [
  { id: '1', name: 'Dumbbell Bench Press', reps: '8-10', sets: 3, difficulty: 'B', muscleGroup: 'Chest' },
  { id: '2', name: 'Barbell Squat', reps: '6-8', sets: 4, difficulty: 'A', muscleGroup: 'Legs' },
  { id: '3', name: 'Bent-Over Row', reps: '8-10', sets: 3, difficulty: 'B', muscleGroup: 'Back' },
  { id: '4', name: 'Overhead Press', reps: '6-8', sets: 3, difficulty: 'I', muscleGroup: 'Shoulders' },
  { id: '5', name: 'Deadlift', reps: '5-6', sets: 3, difficulty: 'A', muscleGroup: 'Full Body' },
  { id: '6', name: 'Pull-ups', reps: '5-8', sets: 3, difficulty: 'I', muscleGroup: 'Back' },
  { id: '7', name: 'Dumbbell Curls', reps: '8-12', sets: 3, difficulty: 'B', muscleGroup: 'Arms' },
];

export default function Move() {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const muscleGroups = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Full Body'];

  const filteredExercises = selectedMuscle && selectedMuscle !== 'All'
    ? exercises.filter(ex => ex.muscleGroup === selectedMuscle)
    : exercises;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <section className="mb-8">
          <h1 className="heading-blade-lg mb-2">
            <span className="text-black">LET'S </span>
            <span className="text-primary">MOVE</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Build strength and muscle with progressive workouts
          </p>
        </section>

        {/* Muscle Group Filter */}
        <section className="mb-8">
          <h2 className="heading-blade-md mb-4 text-black">FILTER BY MUSCLE</h2>
          <div className="flex flex-wrap gap-2">
            {muscleGroups.map(muscle => (
              <button
                key={muscle}
                onClick={() => setSelectedMuscle(muscle === 'All' ? null : muscle)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  (selectedMuscle === muscle || (muscle === 'All' && !selectedMuscle))
                    ? 'bg-primary text-white'
                    : 'bg-secondary text-foreground hover:bg-muted'
                }`}
              >
                {muscle}
              </button>
            ))}
          </div>
        </section>

        {/* Exercises List */}
        <section>
          <h2 className="heading-blade-md mb-6">
            <span className="text-black">AVAILABLE </span>
            <span className="text-primary">EXERCISES</span>
          </h2>

          <div className="space-y-4">
            {filteredExercises.map(exercise => (
              <div
                key={exercise.id}
                className="card-exec p-6 hover:shadow-lg transition-all cursor-pointer group border-l-4 border-primary"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="heading-blade-sm text-black mb-1">{exercise.name}</h3>
                    <p className="text-sm text-muted-foreground">{exercise.muscleGroup}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded font-bold text-xs ${
                      exercise.difficulty === 'B' ? 'bg-blue-100 text-blue-800' :
                      exercise.difficulty === 'I' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {exercise.difficulty === 'B' ? 'BEGINNER' : exercise.difficulty === 'I' ? 'INTERMEDIATE' : 'ADVANCED'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground font-bold mb-1">REPS</p>
                    <p className="font-bold text-primary">{exercise.reps}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold mb-1">SETS</p>
                    <p className="font-bold text-primary">{exercise.sets}</p>
                  </div>
                  <button className="ml-auto px-4 py-2 bg-primary text-white rounded font-bold hover:bg-red-700 transition-colors">
                    START
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
