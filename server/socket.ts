/**
 * TUF PvP Socket.io Server
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 *
 * Events (server → client):
 *   challenge_update  — full participant list with live rep counts
 *   challenge_end     — { winner: Participant }
 *   opponent_joined   — a real opponent connected to the room
 *   bot_mode          — no real opponent found; bot will simulate
 *
 * Events (client → server):
 *   join_challenge    — { challenge_id, user_id, name }
 *   rep_update        — { challenge_id, user_id, reps }
 *   leave_challenge   — { challenge_id, user_id }
 */

import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Participant {
  user_id: string;
  name: string;
  reps: number;
  status: "active" | "done";
  isBot?: boolean;
}

interface ChallengeRoom {
  challenge_id: string;
  participants: Map<string, Participant>;
  duration: number;          // seconds
  target: number;            // rep target
  startedAt: number | null;  // Date.now() when live
  timerHandle: ReturnType<typeof setInterval> | null;
  botHandle: ReturnType<typeof setInterval> | null;
  ended: boolean;
}

// ── In-memory store ───────────────────────────────────────────────────────────
const rooms = new Map<string, ChallengeRoom>();

const BOT_NAMES = ["Shadow", "Apex", "Viper", "Blaze", "Ghost", "Titan"];
const BOT_JOIN_DELAY_MS = 5000;  // wait 5 s for a real opponent before spawning bot
const BOT_REP_INTERVAL_MS = 1800; // bot taps roughly every 1.8 s
const DEFAULT_DURATION = 300;     // 5 minutes
const DEFAULT_TARGET   = 100;

// ── Helpers ───────────────────────────────────────────────────────────────────
function getOrCreateRoom(challenge_id: string): ChallengeRoom {
  if (!rooms.has(challenge_id)) {
    rooms.set(challenge_id, {
      challenge_id,
      participants: new Map(),
      duration: DEFAULT_DURATION,
      target: DEFAULT_TARGET,
      startedAt: null,
      timerHandle: null,
      botHandle: null,
      ended: false,
    });
  }
  return rooms.get(challenge_id)!;
}

function broadcastState(io: SocketIOServer, room: ChallengeRoom) {
  io.to(room.challenge_id).emit("challenge_update", {
    participants: Array.from(room.participants.values()),
  });
}

function endChallenge(io: SocketIOServer, room: ChallengeRoom) {
  if (room.ended) return;
  room.ended = true;

  // Stop timers
  if (room.timerHandle) clearTimeout(room.timerHandle);
  if (room.botHandle)   clearInterval(room.botHandle);

  // Determine winner by highest reps
  let winner: Participant | null = null;
  for (const p of room.participants.values()) {
    if (!winner || p.reps > winner.reps) winner = p;
  }

  io.to(room.challenge_id).emit("challenge_end", { winner });

  // Clean up room after 30 s
  setTimeout(() => rooms.delete(room.challenge_id), 30_000);
}

function spawnBot(io: SocketIOServer, room: ChallengeRoom) {
  const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
  const botId = `bot_${Date.now()}`;
  const bot: Participant = { user_id: botId, name: botName, reps: 0, status: "active", isBot: true };
  room.participants.set(botId, bot);

  io.to(room.challenge_id).emit("bot_mode", { botName });
  broadcastState(io, room);

  // Bot taps at variable pace
  room.botHandle = setInterval(() => {
    if (room.ended) return;
    const p = room.participants.get(botId);
    if (!p) return;
    // Bot speed varies: fast early, slows with fatigue
    const fatigueFactor = Math.max(0.5, 1 - p.reps / 200);
    if (Math.random() < 0.75 * fatigueFactor) {
      p.reps += 1;
      room.participants.set(botId, p);
      broadcastState(io, room);

      if (p.reps >= room.target) {
        p.status = "done";
        endChallenge(io, room);
      }
    }
  }, BOT_REP_INTERVAL_MS);
}

function startChallengeTimer(io: SocketIOServer, room: ChallengeRoom) {
  if (room.startedAt !== null) return; // already started
  room.startedAt = Date.now();

  room.timerHandle = setTimeout(() => {
    endChallenge(io, room);
  }, room.duration * 1000);
}

// ── Attach to HTTP server ─────────────────────────────────────────────────────
export function attachSocketIO(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    console.log(`[PvP] Socket connected: ${socket.id}`);

    // ── join_challenge ──────────────────────────────────────────────────────
    socket.on("join_challenge", ({ challenge_id, user_id, name }: { challenge_id: string; user_id: string; name: string }) => {
      const room = getOrCreateRoom(challenge_id);
      if (room.ended) return;

      // Add participant
      const participant: Participant = { user_id, name, reps: 0, status: "active" };
      room.participants.set(user_id, participant);

      socket.join(challenge_id);
      socket.data.challenge_id = challenge_id;
      socket.data.user_id = user_id;

      broadcastState(io, room);

      const realHumans = Array.from(room.participants.values()).filter(p => !p.isBot);

      if (realHumans.length >= 2) {
        // Two real players — notify both and start
        io.to(challenge_id).emit("opponent_joined", { name: realHumans.find(p => p.user_id !== user_id)?.name });
        startChallengeTimer(io, room);
      } else {
        // Solo — wait for real opponent, then spawn bot if none arrives
        setTimeout(() => {
          if (room.ended) return;
          const humans = Array.from(room.participants.values()).filter(p => !p.isBot);
          if (humans.length < 2) {
            spawnBot(io, room);
            startChallengeTimer(io, room);
          }
        }, BOT_JOIN_DELAY_MS);
      }
    });

    // ── rep_update ──────────────────────────────────────────────────────────
    socket.on("rep_update", ({ challenge_id, user_id, reps }: { challenge_id: string; user_id: string; reps: number }) => {
      const room = rooms.get(challenge_id);
      if (!room || room.ended) return;

      const p = room.participants.get(user_id);
      if (!p) return;

      p.reps = reps;
      room.participants.set(user_id, p);
      broadcastState(io, room);

      // Check if target hit
      if (reps >= room.target) {
        p.status = "done";
        endChallenge(io, room);
      }
    });

    // ── leave_challenge ─────────────────────────────────────────────────────
    socket.on("leave_challenge", ({ challenge_id, user_id }: { challenge_id: string; user_id: string }) => {
      const room = rooms.get(challenge_id);
      if (room) {
        room.participants.delete(user_id);
        if (room.participants.size === 0) {
          if (room.timerHandle) clearTimeout(room.timerHandle);
          if (room.botHandle)   clearInterval(room.botHandle);
          rooms.delete(challenge_id);
        } else {
          broadcastState(io, room);
        }
      }
      socket.leave(challenge_id);
    });

    // ── disconnect ──────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      const { challenge_id, user_id } = socket.data;
      if (challenge_id && user_id) {
        const room = rooms.get(challenge_id);
        if (room && !room.ended) {
          room.participants.delete(user_id);
          if (room.participants.size === 0) {
            if (room.timerHandle) clearTimeout(room.timerHandle);
            if (room.botHandle)   clearInterval(room.botHandle);
            rooms.delete(challenge_id);
          } else {
            broadcastState(io, room);
          }
        }
      }
      console.log(`[PvP] Socket disconnected: ${socket.id}`);
    });
  });

  console.log("[PvP] Socket.io attached to HTTP server");
  return io;
}
