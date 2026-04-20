/**
 * Panther Brain — WorkoutSession Model
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */

export interface SessionPerformance {
  reps: number;
  duration: number;    // seconds
  score: number;       // 1-10
  xp_earned: number;
  calories_burned?: number;
}

export interface ExerciseLog {
  exercise_id: string;
  exercise_name: string;
  sets_completed: number;
  reps_per_set: number[];
  form_score: number;
  compensations: string[];
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  program_id?: string;
  day_number?: number;
  exercises: ExerciseLog[];
  completed: boolean;
  performance: SessionPerformance;
  panther_mode: string;
  started_at: number;
  completed_at?: number;
}
