/**
 * TUF App — Database REST API Routes
 * Exposes all 8 tables via /api/db/* endpoints.
 * All routes accept a user_id in body or query params.
 */

import { Router } from "express";
import {
  upsertUser,
  getUser,
  addPainLog,
  getPainLogs,
  getLatestPain,
  addAssessment,
  getAssessments,
  saveProgram,
  getActiveProgram,
  getPrograms,
  getPantherMemory,
  upsertPantherMemory,
  appendPantherConversation,
  addSession,
  getSessions,
  addBodyLog,
  getBodyLogs,
  getLatestBodyLog,
  getUserStats,
} from "../db.js";

const router = Router();

// ─── Users ────────────────────────────────────────────────────────────────────

router.get("/users/:user_id", async (req, res) => {
  try {
    const user = await getUser(req.params.user_id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/users", async (req, res) => {
  try {
    const user = await upsertUser(req.body);
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── Pain Logs ────────────────────────────────────────────────────────────────

router.get("/pain/:user_id", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const logs = await getPainLogs(req.params.user_id, limit);
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.get("/pain/:user_id/latest", async (req, res) => {
  try {
    const log = await getLatestPain(req.params.user_id);
    res.json(log ?? null);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/pain", async (req, res) => {
  try {
    const entry = await addPainLog({ ...req.body, date: req.body.date ?? Date.now() });
    res.json(entry);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── Assessments ─────────────────────────────────────────────────────────────

router.get("/assessments/:user_id", async (req, res) => {
  try {
    const results = await getAssessments(req.params.user_id);
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/assessments", async (req, res) => {
  try {
    const entry = await addAssessment({ ...req.body, date: req.body.date ?? Date.now() });
    res.json(entry);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── Programs ─────────────────────────────────────────────────────────────────

router.get("/programs/:user_id/active", async (req, res) => {
  try {
    const program = await getActiveProgram(req.params.user_id);
    res.json(program ?? null);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.get("/programs/:user_id", async (req, res) => {
  try {
    const programs = await getPrograms(req.params.user_id);
    res.json(programs);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/programs", async (req, res) => {
  try {
    const program = await saveProgram(req.body);
    res.json(program);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── Panther Memory ───────────────────────────────────────────────────────────

router.get("/memory/:user_id", async (req, res) => {
  try {
    const memory = await getPantherMemory(req.params.user_id);
    res.json(memory ?? null);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/memory", async (req, res) => {
  try {
    const { user_id, ...data } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id required" });
    const memory = await upsertPantherMemory(user_id, data);
    res.json(memory);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/memory/:user_id/conversation", async (req, res) => {
  try {
    const { role, content } = req.body;
    if (!role || !content) return res.status(400).json({ error: "role and content required" });
    await appendPantherConversation(req.params.user_id, role, content);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── Workout Sessions ─────────────────────────────────────────────────────────

router.get("/sessions/:user_id", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 30;
    const sessions = await getSessions(req.params.user_id, limit);
    res.json(sessions);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/sessions", async (req, res) => {
  try {
    const session = await addSession({ ...req.body, date: req.body.date ?? Date.now() });
    res.json(session);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── Body Logs ────────────────────────────────────────────────────────────────

router.get("/body/:user_id", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await getBodyLogs(req.params.user_id, limit);
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.get("/body/:user_id/latest", async (req, res) => {
  try {
    const log = await getLatestBodyLog(req.params.user_id);
    res.json(log ?? null);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/body", async (req, res) => {
  try {
    const log = await addBodyLog({ ...req.body, date: req.body.date ?? Date.now() });
    res.json(log);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── Stats ────────────────────────────────────────────────────────────────────

router.get("/stats/:user_id", async (req, res) => {
  try {
    const stats = await getUserStats(req.params.user_id);
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
