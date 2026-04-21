/**
 * usePvPSocket — TUF PvP real-time challenge hook
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 *
 * Connects to the Socket.io server, joins a challenge room,
 * emits rep updates, and receives live state from the server.
 * Falls back gracefully if the socket cannot connect.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PvPParticipant {
  user_id: string;
  name: string;
  reps: number;
  status: "active" | "done";
  isBot?: boolean;
}

export type PvPConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface UsePvPSocketOptions {
  challenge_id: string;
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
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<PvPConnectionStatus>("connecting");
  const [isBotMode, setIsBotMode] = useState(false);

  useEffect(() => {
    // Connect to the same origin — Socket.io path matches server config
    const socket = io(window.location.origin, {
      path: "/socket.io",
      transports: ["polling"],   // polling-only: reliable through all reverse proxies
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
      // Join the challenge room immediately on connect
      socket.emit("join_challenge", { challenge_id, user_id, name });
    });

    socket.on("disconnect", () => {
      setStatus("disconnected");
    });

    socket.on("connect_error", () => {
      setStatus("error");
    });

    socket.on("challenge_update", ({ participants }: { participants: PvPParticipant[] }) => {
      onChallengeUpdate?.(participants);
    });

    socket.on("challenge_end", ({ winner }: { winner: PvPParticipant }) => {
      onChallengeEnd?.(winner);
    });

    socket.on("opponent_joined", ({ name: oppName }: { name: string }) => {
      onOpponentJoined?.(oppName);
    });

    socket.on("bot_mode", ({ botName }: { botName: string }) => {
      setIsBotMode(true);
      onBotMode?.(botName);
    });

    return () => {
      socket.emit("leave_challenge", { challenge_id, user_id });
      socket.disconnect();
    };
    // Only run on mount — challenge_id/user_id/name are stable for a session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendRepUpdate = useCallback((reps: number) => {
    socketRef.current?.emit("rep_update", { challenge_id, user_id, reps });
  }, [challenge_id, user_id]);

  const leaveChallenge = useCallback(() => {
    socketRef.current?.emit("leave_challenge", { challenge_id, user_id });
    socketRef.current?.disconnect();
  }, [challenge_id, user_id]);

  return {
    status,
    isConnected: status === "connected",
    isBotMode,
    sendRepUpdate,
    leaveChallenge,
  };
}
