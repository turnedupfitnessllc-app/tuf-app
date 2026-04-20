import { useState, useCallback, useEffect } from "react";
import {
  CoachMode,
  CueContext,
  getCoachCue,
  autoAdjustCoach,
  getRealtimeCoachMode,
  mostUsedMode,
  AutoAdjustProfile,
  COACH_MODE_CONFIGS,
} from "@shared/panther-library";

const STORAGE_KEY = "panther_coach_mode";
const USAGE_LOG_KEY = "panther_coach_usage_log";

export function useCoachMode(initialMode: CoachMode = "panther") {
  const [mode, setModeState] = useState<CoachMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as CoachMode | null;
      return stored ?? initialMode;
    } catch {
      return initialMode;
    }
  });

  const [modeHistory, setModeHistory] = useState<CoachMode[]>(() => {
    try {
      const stored = localStorage.getItem(USAGE_LOG_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist mode changes
  const setMode = useCallback((newMode: CoachMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
      setModeHistory(prev => {
        const updated = [...prev, newMode].slice(-50); // keep last 50
        localStorage.setItem(USAGE_LOG_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Auto-adjust based on user stats
  const autoAdjust = useCallback((profile: AutoAdjustProfile) => {
    const recommended = autoAdjustCoach(profile);
    if (recommended !== mode) setMode(recommended);
    return recommended;
  }, [mode, setMode]);

  // Real-time in-workout switching
  const realtimeAdjust = useCallback((formScore: number, isSlowingDown: boolean) => {
    const newMode = getRealtimeCoachMode(mode, formScore, isSlowingDown);
    if (newMode !== mode) setMode(newMode);
    return newMode;
  }, [mode, setMode]);

  // Get cue for current mode
  const getCue = useCallback((context: CueContext): string => {
    return getCoachCue(mode, context);
  }, [mode]);

  // Preferred mode derived from usage history
  const preferredMode = mostUsedMode(modeHistory);

  const config = COACH_MODE_CONFIGS[mode];

  return {
    mode,
    setMode,
    getCue,
    autoAdjust,
    realtimeAdjust,
    preferredMode,
    config,
    modeHistory,
  };
}
