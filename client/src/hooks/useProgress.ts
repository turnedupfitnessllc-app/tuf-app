/**
 * useProgress — Shared progress tracking hook
 * Persists to localStorage, drives Home screen scores and Profile evolution
 *
 * Score system:
 *  - Mobility: +3 per LENGTHEN/INHIBIT exercise completed
 *  - Strength:  +3 per INTEGRATE exercise completed
 *  - Stability: +3 per ACTIVATE exercise completed
 *  - Each score caps at 100
 *  - Total score drives Panther evolution stage
 */
import { useState, useCallback, useEffect } from "react";

export interface ProgressData {
  mobility: number;
  strength: number;
  stability: number;
  sessionsCompleted: number;
  streakDays: number;
  lastSessionDate: string | null; // ISO date string YYYY-MM-DD
  totalMinutes: number;
  lastIssueId: string | null;
  lastCorrectivePlan: string[] | null;
  joinDate: number;
}

const STORAGE_KEY = "tuf_progress";
const DEFAULT: ProgressData = {
  mobility: 0,
  strength: 0,
  stability: 0,
  sessionsCompleted: 0,
  streakDays: 0,
  lastSessionDate: null,
  totalMinutes: 0,
  lastIssueId: null,
  lastCorrectivePlan: null,
  joinDate: Date.now(),
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function load(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT };
}

function save(data: ProgressData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>(load);

  // Sync to localStorage on every change
  useEffect(() => {
    save(progress);
  }, [progress]);

  /**
   * Call this when a Correct session is completed.
   * @param exercisePhases  Array of NASM phases for each exercise done
   * @param durationMinutes Approximate session duration in minutes
   */
  const completeSession = useCallback(
    (exercisePhases: Array<"INHIBIT" | "LENGTHEN" | "ACTIVATE" | "INTEGRATE">, durationMinutes = 15) => {
      setProgress((prev) => {
        const today = todayStr();
        const yesterday = yesterdayStr();

        // Score deltas
        let mobilityDelta = 0;
        let strengthDelta = 0;
        let stabilityDelta = 0;
        for (const phase of exercisePhases) {
          if (phase === "INHIBIT" || phase === "LENGTHEN") mobilityDelta += 3;
          else if (phase === "ACTIVATE") stabilityDelta += 3;
          else if (phase === "INTEGRATE") strengthDelta += 3;
        }

        // Streak logic
        let newStreak = prev.streakDays;
        if (prev.lastSessionDate === today) {
          // Already trained today — no streak change
        } else if (prev.lastSessionDate === yesterday) {
          newStreak += 1;
        } else {
          newStreak = 1; // Reset streak
        }

        return {
          ...prev,
          mobility: Math.min(100, prev.mobility + mobilityDelta),
          strength: Math.min(100, prev.strength + strengthDelta),
          stability: Math.min(100, prev.stability + stabilityDelta),
          sessionsCompleted: prev.sessionsCompleted + 1,
          streakDays: newStreak,
          lastSessionDate: today,
          totalMinutes: prev.totalMinutes + durationMinutes,
        };
      });
    },
    []
  );

  /**
   * Store the latest corrective plan from the Assess screen
   */
  const setCorrectivePlan = useCallback((issueId: string, correctives: string[]) => {
    setProgress((prev) => ({
      ...prev,
      lastIssueId: issueId,
      lastCorrectivePlan: correctives,
    }));
  }, []);

  /**
   * Reset all progress (for testing / re-onboarding)
   */
  const resetProgress = useCallback(() => {
    const fresh = { ...DEFAULT, joinDate: Date.now() };
    setProgress(fresh);
    save(fresh);
  }, []);

  const totalScore = progress.mobility + progress.strength + progress.stability;

  return {
    progress,
    totalScore,
    completeSession,
    setCorrectivePlan,
    resetProgress,
  };
}
