/**
 * TUF MOVE Page — Exercise Library
 * Design System: Exercise cards with video placeholders, coaching cues, stats
 * Muscle group filtering with sticky nav
 */

import { useState } from "react";
import { TUF_DATA, type Exercise } from "@/lib/tuf-data";

const muscleGroups = ["All", "Chest", "Back", "Shoulders"];

export default function Move() {
  const [selectedMuscle, setSelectedMuscle] = useState("All");

  const filteredExercises = TUF_DATA.exercises.filter((ex) => {
    if (selectedMuscle === "All") return true;
    return ex.muscle === selectedMuscle.toLowerCase();
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "B":
        return "badge-green";
      case "I":
        return "badge-gold";
      case "A":
        return "badge-red";
      default:
        return "badge-gray";
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "B":
        return "Beginner";
      case "I":
        return "Intermediate";
      case "A":
        return "Advanced";
      default:
        return level;
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#f2f2f2] pb-20">
      {/* Header */}
      <section className="px-4 pt-6 pb-4 border-b border-[#1e1e1e]">
        <div className="text-xs tracking-widest uppercase text-[#888888] mb-1">Exercise Library</div>
        <h1 className="font-bebas text-3xl tracking-wider text-white">
          <span className="text-[#C8973A]">MOVE</span>
        </h1>
      </section>

      {/* Muscle Group Filter */}
      <div className="sticky top-14 z-40 bg-[#0e0e0e] border-b border-[#1e1e1e] px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {muscleGroups.map((muscle) => (
          <button
            key={muscle}
            onClick={() => setSelectedMuscle(muscle)}
            className={`flex-shrink-0 px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              selectedMuscle === muscle
                ? "bg-gradient-to-r from-[#8B0000] to-[#b30000] text-white shadow-lg"
                : "bg-[#1c1c1c] text-[#888888] hover:text-white"
            }`}
            style={{
              clipPath: "polygon(0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%)",
            }}
          >
            {muscle}
          </button>
        ))}
      </div>

      {/* Exercise Cards */}
      <section className="py-4">
        {filteredExercises.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className="text-3xl mb-3">🤔</div>
            <div className="font-bebas text-lg tracking-wider text-[#333333] mb-2">NO EXERCISES</div>
            <div className="text-xs text-[#555555]">Try selecting a different muscle group</div>
          </div>
        ) : (
          filteredExercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} levelColor={getLevelColor(exercise.level)} levelLabel={getLevelLabel(exercise.level)} />
          ))
        )}
      </section>
    </div>
  );
}

function ExerciseCard({
  exercise,
  levelColor,
  levelLabel,
}: {
  exercise: Exercise;
  levelColor: string;
  levelLabel: string;
}) {
  return (
    <div className="tuf-card mx-4 mb-4">
      {/* Video Placeholder */}
      <div className="w-full bg-[#080808] relative overflow-hidden mb-4" style={{ paddingTop: "56.25%" }}>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{ background: "linear-gradient(160deg, rgba(139,0,0,0.08) 0%, #080808 100%)" }}
        >
          <div
            className="w-14 h-14 bg-[rgba(139,0,0,0.18)] border-2 border-[#C8973A] flex items-center justify-center text-white text-xl"
            style={{ clipPath: "polygon(0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%)" }}
          >
            ▶
          </div>
          <div className="text-xs text-[#555555] tracking-widest uppercase">Video</div>
          <div className="font-bebas text-sm text-[#333333] text-center px-4">{exercise.name}</div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`tuf-badge ${levelColor}`}>{levelLabel}</span>
        <span className="tuf-badge badge-gold">{exercise.equipment}</span>
      </div>

      {/* Exercise Name */}
      <h3 className="font-bebas text-2xl tracking-wider text-white mb-1">{exercise.name}</h3>

      {/* Muscles */}
      <div className="text-xs text-[#888888] mb-3">
        <div className="font-bold text-white">{exercise.primaryMuscle}</div>
        <div className="text-[#555555]">{exercise.secondaryMuscle}</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "Sets", value: exercise.sets },
          { label: "Reps", value: exercise.reps },
          { label: "Rest", value: exercise.rest },
          { label: "Tempo", value: exercise.tempo },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#0e0e0e] border border-[#1e1e1e] p-2 text-center relative">
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C8973A] opacity-30"
            />
            <div className="font-bebas text-sm text-[#C8973A] tracking-wider">{stat.value}</div>
            <div className="text-xs text-[#333333] uppercase tracking-wider mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Coaching Cue */}
      <div className="bg-[#0e0e0e] border border-[#1e1e1e] border-l-4 border-l-[#C8973A] p-3 mb-3">
        <div className="text-xs font-bold uppercase tracking-widest text-[#C8973A] mb-2">Coaching Cue</div>
        <div className="text-xs text-[#888888] leading-relaxed">{exercise.coachingCue}</div>
      </div>

      {/* Modifications */}
      {exercise.modifications.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#4caf50] mb-2">Modifications</div>
          {exercise.modifications.map((mod, idx) => (
            <div key={idx} className="flex gap-2 mb-2 text-xs">
              <div className="w-1 h-1 rounded-full bg-[#4caf50] flex-shrink-0 mt-1.5" />
              <div className="text-[#888888]">
                <span className="text-white font-bold">{mod.condition}:</span> {mod.mod}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
