/**
 * usePvPSocket — TUF PvP real-time challenge hook (polling transport)
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 *
 * Uses short-poll HTTP (every 1.5s) for real-time PvP state.
 * Works over any HTTPS tunnel — no WebSocket or SSE required.
 * Client→server actions use regular fetch POST requests.
 */
import { useEffect, useRef, useCallback, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PvPParticipant {
  user_id: string;
  name: string;
  reps: number;
  status: "active" | "done";
  isBot?: boolean;
}

export type PvPConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

interface RoomState {
  participants: PvPParticipant[];
  ended: boolean;
  winner: PvPParticipant | null;
  startedAt: number | null;
  endsAt: number | null;
  botName: string | null;
  opponentName: string | null;
}

interface UsePvPSocketOptions {
  challenge_id: string | null;
  user_id: string;
  name: string;
  onChallengeUpdate?: (participants: PvPParticipant[]) => void;
  onChallengeEnd?: (winner: PvPParticipant) => void;
  onOpponentJoined?: (opponentName: string) => void;
  onBotMode?: (botName: string) => void;
}

interface UsePvPSocketReturn {
  status: PvPConnectionStatus;
  isConnected: boolean;
  isBotMode: boolean;
  sendRepUpdate: (reps: number) => void;
  leaveChallenge: () => void;
}

const POLL_INTERVAL_MS = 1500;

// ── Hook ──────────────────────────────────────────────────────────────────────
export function usePvPSocket({
  challenge_id,
  user_id,
  name,
  onChallengeUpdate,
  onChallengeEnd,
  onOpponentJoined,
  onBotMode,
}: UsePvPSocketOptions): UsePvPSocketReturn {
  const [status, setStatus] = useState<PvPConnectionStatus>("idle");
  const [isBotMode, setIsBotMode] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevStateRef = useRef<RoomState | null>(null);
  const hasJoinedRef = useRef(false);

  // Stable callback refs
  const onChallengeUpdateRef = useRef(onChallengeUpdate);
  const onChallengeEndRef    = useRef(onChallengeEnd);
  const onOpponentJoinedRef  = useRef(onOpponentJoined);
  const onBotModeRef         = useRef(onBotMode);
  useEffect(() => { onChallengeUpdateRef.current = onChallengeUpdate; }, [onChallengeUpdate]);
  useEffect(() => { onChallengeEndRef.current    = onChallengeEnd;    }, [onChallengeEnd]);
  useEffect(() => { onOpponentJoinedRef.current  = onOpponentJoined;  }, [onOpponentJoined]);
  useEffect(() => { onBotModeRef.current         = onBotMode;         }, [onBotMode]);

  const processState = useCallback((state: RoomState) => {
    const prev = prevStateRef.current;

    // Notify on participant changes
    onChallengeUpdateRef.current?.(state.participants);

    // Detect bot spawn
    if (state.botName && (!prev?.botName)) {
      console.log("[PvP Poll] Bot mode activated:", state.botName);
      setIsBotMode(true);
      onBotModeRef.current?.(state.botName);
    }

    // Detect opponent joined
    if (state.opponentName && (!prev?.opponentName)) {
      console.log("[PvP Poll] Opponent joined:", state.opponentName);
      onOpponentJoinedRef.current?.(state.opponentName);
    }

    // Detect challenge end
    if (state.ended && !prev?.ended && state.winner) {
      console.log("[PvP Poll] Challenge ended, winner:", state.winner.name);
      onChallengeEndRef.current?.(state.winner);
    }

    prevStateRef.current = state;
  }, []);

  useEffect(() => {
    if (!challenge_id) {
      setStatus("idle");
      hasJoinedRef.current = false;
      prevStateRef.current = null;
      return;
    }

    setStatus("connecting");
    setIsBotMode(false);
    hasJoinedRef.current = false;
    prevStateRef.current = null;

    // Join the room first
    const joinRoom = async () => {
      try {
        const res = await fetch("/api/pvp/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challenge_id, user_id, name }),
        });
        if (!res.ok) throw new Error(`Join failed: ${res.status}`);
        const state: RoomState = await res.json();
        hasJoinedRef.current = true;
        setStatus("connected");
        console.log("[PvP Poll] Joined room:", challenge_id);
        processState(state);
      } catch (err) {
        console.error("[PvP Poll] Join error:", err);
        setStatus("error");
      }
    };

    joinRoom();

    // Start polling
    pollRef.current = setInterval(async () => {
      if (!hasJoinedRef.current) return;
      try {
        const res = await fetch(
          `/api/pvp/state/${challenge_id}?user_id=${encodeURIComponent(user_id)}`
        );
        if (res.status === 404) {
          // Room gone
          setStatus("disconnected");
          if (pollRef.current) clearInterval(pollRef.current);
          return;
        }
        if (!res.ok) return;
        const state: RoomState = await res.json();
        processState(state);

        // Stop polling if challenge ended
        if (state.ended) {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch (err) {
        console.warn("[PvP Poll] Poll error:", err);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      // Notify server we left
      if (challenge_id && user_id && hasJoinedRef.current) {
        fetch("/api/pvp/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "leave", challenge_id, user_id }),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, [challenge_id, user_id, name, processState]);

  const sendRepUpdate = useCallback((reps: number) => {
    if (!challenge_id || !hasJoinedRef.current) return;
    fetch("/api/pvp/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "rep_update", challenge_id, user_id, reps }),
    }).catch(err => console.error("[PvP Poll] rep_update error:", err));
  }, [challenge_id, user_id]);

  const leaveChallenge = useCallback(() => {
    if (!challenge_id) return;
    if (pollRef.current) clearInterval(pollRef.current);
    fetch("/api/pvp/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "leave", challenge_id, user_id }),
    }).catch(() => {});
  }, [challenge_id, user_id]);

  return {
    status,
    isConnected: status === "connected",
    isBotMode,
    sendRepUpdate,
    leaveChallenge,
  };
}
