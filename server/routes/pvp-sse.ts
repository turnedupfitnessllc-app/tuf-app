/**
 * TUF PvP Polling Route
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 *
 * Uses short-poll HTTP for real-time PvP state (works over any HTTPS tunnel).
 * Rooms are maintained in-memory on the server with bot simulation running server-side.
 *
 * POST /api/pvp/join      — { challenge_id, user_id, name } → join/create room
 * GET  /api/pvp/state/:challenge_id?user_id= — poll current room state
 * POST /api/pvp/action    — { type: "rep_update"|"leave", challenge_id, user_id, reps? }
 */

import { Router, Request, Response } from "express";

const router = Router();

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
  duration: number;
  target: number;
  startedAt: number | null;
  endsAt: number | null;
  timerHandle: ReturnType<typeof setTimeout> | null;
  botHandle: ReturnType<typeof setInterval> | null;
  botSpawnHandle: ReturnType<typeof setTimeout> | null;
  ended: boolean;
  winner: Participant | null;
  botName: string | null;
  opponentName: string | null;
  // Track last activity per user for timeout cleanup
  lastSeen: Map<string, number>;
}

// ── In-memory store ───────────────────────────────────────────────────────────
const rooms = new Map<string, ChallengeRoom>();

const BOT_NAMES = ["Shadow", "Apex", "Viper", "Blaze", "Ghost", "Titan"];
const BOT_JOIN_DELAY_MS = 5000;
const BOT_REP_INTERVAL_MS = 1800;
const DEFAULT_DURATION = 300;
const DEFAULT_TARGET = 100;
const USER_TIMEOUT_MS = 30_000; // remove user if no poll for 30s

// ── Helpers ───────────────────────────────────────────────────────────────────
function getOrCreateRoom(challenge_id: string): ChallengeRoom {
  if (!rooms.has(challenge_id)) {
    rooms.set(challenge_id, {
      challenge_id,
      participants: new Map(),
      duration: DEFAULT_DURATION,
      target: DEFAULT_TARGET,
      startedAt: null,
      endsAt: null,
      timerHandle: null,
      botHandle: null,
      botSpawnHandle: null,
      ended: false,
      winner: null,
      botName: null,
      opponentName: null,
      lastSeen: new Map(),
    });
  }
  return rooms.get(challenge_id)!;
}

function endChallenge(room: ChallengeRoom) {
  if (room.ended) return;
  room.ended = true;

  if (room.timerHandle) clearTimeout(room.timerHandle);
  if (room.botHandle) clearInterval(room.botHandle);
  if (room.botSpawnHandle) clearTimeout(room.botSpawnHandle);

  let winner: Participant | null = null;
  for (const p of Array.from(room.participants.values())) {
    if (!winner || p.reps > winner.reps) winner = p;
  }
  room.winner = winner;

  // Clean up after 2 minutes
  setTimeout(() => rooms.delete(room.challenge_id), 120_000);
  console.log(`[PvP] Challenge ended: ${room.challenge_id}, winner: ${winner?.name}`);
}

function spawnBot(room: ChallengeRoom) {
  if (room.ended) return;

  const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
  const botId = `bot_${Date.now()}`;
  const bot: Participant = { user_id: botId, name: botName, reps: 0, status: "active", isBot: true };
  room.participants.set(botId, bot);
  room.botName = botName;

  // Start challenge timer
  if (room.startedAt === null) {
    room.startedAt = Date.now();
    room.endsAt = room.startedAt + room.duration * 1000;
    room.timerHandle = setTimeout(() => endChallenge(room), room.duration * 1000);
  }

  room.botHandle = setInterval(() => {
    if (room.ended) return;
    const p = room.participants.get(botId);
    if (!p) return;
    const fatigueFactor = Math.max(0.5, 1 - p.reps / 200);
    if (Math.random() < 0.75 * fatigueFactor) {
      p.reps += 1;
      room.participants.set(botId, p);
      if (p.reps >= room.target) {
        p.status = "done";
        endChallenge(room);
      }
    }
  }, BOT_REP_INTERVAL_MS);

  console.log(`[PvP] Bot spawned: ${botName} in room ${room.challenge_id}`);
}

function getRoomState(room: ChallengeRoom) {
  return {
    participants: Array.from(room.participants.values()),
    ended: room.ended,
    winner: room.winner,
    startedAt: room.startedAt,
    endsAt: room.endsAt,
    botName: room.botName,
    opponentName: room.opponentName,
  };
}

// ── Join endpoint ─────────────────────────────────────────────────────────────
router.post("/join", (req: Request, res: Response) => {
  const { challenge_id, user_id, name } = req.body;

  if (!challenge_id || !user_id || !name) {
    res.status(400).json({ error: "Missing challenge_id, user_id, or name" });
    return;
  }

  const room = getOrCreateRoom(challenge_id);

  if (room.ended) {
    res.json({ ...getRoomState(room), alreadyEnded: true });
    return;
  }

  // Add/update participant
  if (!room.participants.has(user_id)) {
    const participant: Participant = { user_id, name, reps: 0, status: "active" };
    room.participants.set(user_id, participant);
    console.log(`[PvP] User joined: ${name} (${user_id}) in room ${challenge_id}`);
  }

  room.lastSeen.set(user_id, Date.now());

  const realHumans = Array.from(room.participants.values()).filter(p => !p.isBot);

  if (realHumans.length >= 2) {
    // Two real players — start the challenge
    const opponent = realHumans.find(p => p.user_id !== user_id);
    if (opponent) room.opponentName = opponent.name;
    if (room.startedAt === null) {
      room.startedAt = Date.now();
      room.endsAt = room.startedAt + room.duration * 1000;
      room.timerHandle = setTimeout(() => endChallenge(room), room.duration * 1000);
    }
  } else if (!room.botSpawnHandle && !room.botName) {
    // Solo — schedule bot spawn
    room.botSpawnHandle = setTimeout(() => {
      if (room.ended) return;
      const humans = Array.from(room.participants.values()).filter(p => !p.isBot);
      if (humans.length < 2) {
        spawnBot(room);
      }
    }, BOT_JOIN_DELAY_MS);
  }

  res.json(getRoomState(room));
});

// ── Poll endpoint ─────────────────────────────────────────────────────────────
router.get("/state/:challenge_id", (req: Request, res: Response) => {
  const { challenge_id } = req.params;
  const { user_id } = req.query as { user_id: string };

  const room = rooms.get(challenge_id);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  // Update last seen
  if (user_id) {
    room.lastSeen.set(user_id, Date.now());

    // Clean up timed-out users
    const now = Date.now();
    for (const [uid, lastSeen] of Array.from(room.lastSeen.entries())) {
      if (now - lastSeen > USER_TIMEOUT_MS) {
        room.participants.delete(uid);
        room.lastSeen.delete(uid);
        console.log(`[PvP] User timed out: ${uid} from ${challenge_id}`);
      }
    }
  }

  res.json(getRoomState(room));
});

// ── Action endpoint ───────────────────────────────────────────────────────────
router.post("/action", (req: Request, res: Response) => {
  const { type, challenge_id, user_id, reps } = req.body;

  if (!type || !challenge_id || !user_id) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const room = rooms.get(challenge_id);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  if (type === "rep_update") {
    if (room.ended) { res.json({ ok: true, state: getRoomState(room) }); return; }
    const p = room.participants.get(user_id);
    if (p) {
      p.reps = reps ?? p.reps;
      room.participants.set(user_id, p);
      room.lastSeen.set(user_id, Date.now());
      if (p.reps >= room.target) {
        p.status = "done";
        endChallenge(room);
      }
    }
  } else if (type === "leave") {
    room.participants.delete(user_id);
    room.lastSeen.delete(user_id);
    const humans = Array.from(room.participants.values()).filter(p => !p.isBot);
    if (humans.length === 0 && !room.ended) {
      if (room.timerHandle) clearTimeout(room.timerHandle);
      if (room.botHandle) clearInterval(room.botHandle);
      if (room.botSpawnHandle) clearTimeout(room.botSpawnHandle);
      rooms.delete(challenge_id);
    }
    console.log(`[PvP] User left: ${user_id} from ${challenge_id}`);
  }

  res.json({ ok: true, state: room.ended || type === "leave" ? null : getRoomState(room) });
});

export default router;
