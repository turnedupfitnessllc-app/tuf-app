/**
 * Panther Brain — User Model
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */

export interface UserStats {
  workouts_completed: number;
  streak: number;
  performance_score: number;
  mobility_score: number;
  strength_score: number;
  xp: number;
}

export interface PantherUser {
  id: string;
  name: string;
  age: number;
  fitness_level: "beginner" | "intermediate" | "advanced" | "athlete";
  goal: "fat_loss" | "muscle_gain" | "athletic_performance" | "mobility";
  equipment: string[];
  tier: "free" | "starter" | "advanced" | "member";
  stats: UserStats;
  created_at: number;
  updated_at: number;
}
