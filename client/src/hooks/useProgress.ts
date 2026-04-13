/**
 * useProgress — v2.0
 * XP / Streak / NASM Score tracking hook.
 *
 * Architecture:
 *  - localStorage (`tuf_progress`) is the fast local cache for instant reads
 *  - DB (`/api/progress/:userId`) is the source of truth — synced on mount and after writes
 *  - One-time migration: if localStorage has data and DB has none, push localStorage → DB
 *
 * Score system:
 *  - Mobility: +3 per LENGTHEN/INHIBIT exercise completed
 *  - Strength:  +3 per INTEGRATE exercise completed
 *  - Stability: +3 per ACTIVATE exercise completed
 *  - Each score caps at 100
 *  - Total score drives Panther evolution stage
 */
import { useState, useCallback, useEffect, useRef } from "react";

export interface ProgressData {
  mobility: number;
  strength: number;
  stability: number;
  sessionsCompleted: number;
  streakDays: number;
  longestStreak: number;
  lastSessionDate: string | null;
  totalMinutes: number;
  xp: number;
  lastIssueId: string | null;
  lastCorrectivePlan: string[] | null;
  joinDate: number;
}

const STORAGE_KEY = "tuf_progress";
const MIGRATION_KEY = "tuf_progress_migrated_v2";

const DEFAULT: ProgressData = {
  mobility: 0,
  strength: 0,
  stability: 0,
  sessionsCompleted: 0,
  streakDays: 0,
  longestStreak: 0,
  lastSessionDate: null,
  totalMinutes: 0,
  xp: 0,
  lastIssueId: null,
  lastCorrectivePlan: null,
  joinDate: Date.now(),
};

function getUserId(): string {
  try {
    const p = JSON.parse(localStorage.getItem("tuf_profile") || "{}");
    return p.user_id || p.id || "anonymous";
  } catch {
    return "anonymous";
  }
}

function loadLocal(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT };
}

function saveLocal(data: ProgressData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

/** Map DB UserProgress shape → client ProgressData shape */
function fromDb(db: Record<string, unknown>): ProgressData {
  return {
    mobility: (db.mobility as number) ?? 0,
    strength: (db.strength as number) ?? 0,
    stability: (db.stability as number) ?? 0,
    sessionsCompleted: (db.sessions_completed as number) ?? 0,
    streakDays: (db.streak_days as number) ?? 0,
    longestStreak: (db.longest_streak as number) ?? 0,
    lastSessionDate: (db.last_session_date as string | null) ?? null,
    totalMinutes: (db.total_minutes as number) ?? 0,
    xp: (db.xp as number) ?? 0,
    lastIssueId: (db.last_issue_id as string | null) ?? null,
    lastCorrectivePlan: (db.last_corrective_plan as string[] | null) ?? null,
    joinDate: (db.join_date as number) ?? Date.now(),
  };
}

/** Map client ProgressData shape → DB UserProgress shape */
function toDb(data: ProgressData): Record<string, unknown> {
  return {
    mobility: data.mobility,
    strength: data.strength,
    stability: data.stability,
    sessions_completed: data.sessionsCompleted,
    streak_days: data.streakDays,
    longest_streak: data.longestStreak,
    last_session_date: data.lastSessionDate,
    total_minutes: data.totalMinutes,
    xp: data.xp,
    last_issue_id: data.lastIssueId,
    last_corrective_plan: data.lastCorrectivePlan,
    join_date: data.joinDate,
  };
}

async function fetchFromDb(userId: string): Promise<ProgressData | null> {
  try {
    const res = await fetch(`/api/progress/${userId}`);
    if (!res.ok) return null;
    const json = await res.json();
    return fromDb(json.progress);
  } catch {
    return null;
  }
}

async function pushToDb(userId: string, data: ProgressData): Promise<void> {
  try {
    await fetch(`/api/progress/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toDb(data)),
    });
  } catch {
    // Silent fail — localStorage is the fallback
  }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>(loadLocal);
  const userId = useRef(getUserId());
  const syncedRef = useRef(false);

  // ── On mount: fetch from DB, run one-time migration if needed ──────────────
  useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;

    const uid = userId.current;

    (async () => {
      const dbData = await fetchFromDb(uid);
      const localData = loadLocal();
      const alreadyMigrated = localStorage.getItem(MIGRATION_KEY) === "1";

      if (dbData && (dbData.sessionsCompleted > 0 || dbData.xp > 0)) {
        // DB has real data — use it as the source of truth
        // Merge: take whichever has more XP (in case local has unsynced data)
        const merged: ProgressData =
          localData.xp > dbData.xp
            ? { ...dbData, xp: localData.xp, sessionsCompleted: Math.max(localData.sessionsCompleted, dbData.sessionsCompleted) }
            : dbData;
        setProgress(merged);
        saveLocal(merged);
        if (localData.xp > dbData.xp) {
          // Push merged back to DB
          await pushToDb(uid, merged);
        }
      } else if (!alreadyMigrated && (localData.xp > 0 || localData.sessionsCompleted > 0)) {
        // One-time migration: push localStorage data to DB
        await pushToDb(uid, localData);
        localStorage.setItem(MIGRATION_KEY, "1");
      } else if (dbData) {
        setProgress(dbData);
        saveLocal(dbData);
      }
    })();
  }, []);

  // ── Sync to localStorage on every change ──────────────────────────────────
  useEffect(() => {
    saveLocal(progress);
  }, [progress]);

  /**
   * Call this when a session is completed.
   */
  const completeSession = useCallback(
    (exercisePhases: Array<"INHIBIT" | "LENGTHEN" | "ACTIVATE" | "INTEGRATE">, durationMinutes = 15, xpAward = 50) => {
      setProgress((prev) => {
        const today = todayStr();
        const yesterday = yesterdayStr();

        // Score deltas
        let mobilityDelta = 0, strengthDelta = 0, stabilityDelta = 0;
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
          newStreak = 1;
        }

        const updated: ProgressData = {
          ...prev,
          mobility: Math.min(100, prev.mobility + mobilityDelta),
          strength: Math.min(100, prev.strength + strengthDelta),
          stability: Math.min(100, prev.stability + stabilityDelta),
          sessionsCompleted: prev.sessionsCompleted + 1,
          streakDays: newStreak,
          longestStreak: Math.max(newStreak, prev.longestStreak),
          lastSessionDate: today,
          totalMinutes: prev.totalMinutes + durationMinutes,
          xp: prev.xp + xpAward,
        };

        // Async DB sync (fire and forget)
        pushToDb(userId.current, updated);

        return updated;
      });
    },
    []
  );

  /**
   * Award XP without recording a full session.
   */
  const awardXP = useCallback((amount: number) => {
    setProgress((prev) => {
      const updated = { ...prev, xp: prev.xp + amount };
      pushToDb(userId.current, updated);
      return updated;
    });
  }, []);

  /**
   * Store the latest corrective plan from the Assess screen.
   */
  const setCorrectivePlan = useCallback((issueId: string, correctives: string[]) => {
    setProgress((prev) => {
      const updated = { ...prev, lastIssueId: issueId, lastCorrectivePlan: correctives };
      pushToDb(userId.current, updated);
      return updated;
    });
  }, []);

  /**
   * Reset all progress (for testing / re-onboarding).
   */
  const resetProgress = useCallback(() => {
    const fresh: ProgressData = { ...DEFAULT, joinDate: Date.now() };
    setProgress(fresh);
    saveLocal(fresh);
    pushToDb(userId.current, fresh);
  }, []);

  const totalScore = progress.mobility + progress.strength + progress.stability;

  return {
    progress,
    totalScore,
    completeSession,
    awardXP,
    setCorrectivePlan,
    resetProgress,
  };
}
