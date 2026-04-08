/**
 * TUF App — Persistent Database Layer
 * Uses lowdb (JSON file) for zero-dependency persistence.
 * Schema mirrors the Supabase/PostgreSQL target for easy migration.
 *
 * Tables:
 *   users         — user profile, fitness level, goals, injuries, equipment
 *   pain_logs     — pain entries with location, level, trigger, notes
 *   assessments   — movement assessment results
 *   exercises     — exercise library with cues, progressions, regressions
 *   programs      — 4-week progressive programs per user
 *   panther_memory — persistent AI memory (replaces localStorage)
 *   sessions      — workout session history + feedback
 *   body_logs     — body composition measurements over time
 */

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "..", "data", "tuf-db.json");

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  user_id: string;
  name: string;
  email?: string;
  fitness_level: "beginner" | "intermediate" | "advanced";
  goals: string[];
  injuries: string[];
  equipment: string[];
  age?: number;
  weight?: number;
  height?: number;
  created_at: number;
  updated_at: number;
}

export interface PainLog {
  entry_id: string;
  user_id: string;
  pain_location: string;
  pain_level: number; // 1-10
  trigger_movement: string;
  notes: string;
  date: number; // UTC timestamp ms
}

export interface Assessment {
  assessment_id: string;
  user_id: string;
  type: string; // e.g. "overhead_reach", "single_leg_squat"
  result: "pass" | "fail" | "limited";
  notes: string;
  date: number;
}

export interface Exercise {
  exercise_id: string;
  name: string;
  category: string;
  movement_pattern: string;
  targets: string[];
  execution: string[];
  cues: string[];
  mistakes: string[];
  progressions: string[];
  regressions: string[];
}

export interface ProgramExercise {
  name: string;
  sets: number;
  reps: number | string;
  rest?: number;
  intensity?: string;
  notes?: string;
}

export interface ProgramSession {
  sessionNum: number;
  label: string;
  blocks: Array<{
    label: string;
    color: string;
    exercises: ProgramExercise[];
  }>;
}

export interface ProgramWeek {
  week: number;
  label: string;
  focus: string;
  sessions: ProgramSession[];
}

export interface Program {
  program_id: string;
  user_id: string;
  name: string;
  diagnosis?: string;
  pain_location?: string;
  fitness_level: string;
  goal: string;
  weeks: ProgramWeek[];
  active: boolean;
  created_at: number;
  updated_at: number;
}

export interface PantherMemory {
  memory_id: string;
  user_id: string;
  name: string;
  primary_goal: string;
  primary_issue: string;
  wins: string[];
  struggles: string[];
  streak_days: number;
  xp: number;
  stage: string;
  sessions_count: number;
  conversation_history: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: number;
  }>;
  last_seen: number;
  created_at: number;
  updated_at: number;
}

export interface WorkoutSession {
  session_id: string;
  user_id: string;
  program_id?: string;
  week?: number;
  session_label: string;
  exercises_completed: string[];
  duration_minutes?: number;
  feedback_rating?: number; // 1-5
  pain_response?: string;
  notes?: string;
  date: number;
}

export interface BodyLog {
  log_id: string;
  user_id: string;
  weight?: number;
  body_fat_percent?: number;
  muscle_mass?: number;
  waist?: number;
  hips?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  bmi?: number;
  date: number;
}

// ─── Database Schema ──────────────────────────────────────────────────────────

interface DbSchema {
  users: User[];
  pain_logs: PainLog[];
  assessments: Assessment[];
  exercises: Exercise[];
  programs: Program[];
  panther_memory: PantherMemory[];
  sessions: WorkoutSession[];
  body_logs: BodyLog[];
}

const defaultData: DbSchema = {
  users: [],
  pain_logs: [],
  assessments: [],
  exercises: [],
  programs: [],
  panther_memory: [],
  sessions: [],
  body_logs: [],
};

// ─── DB Singleton ─────────────────────────────────────────────────────────────

let _db: Low<DbSchema> | null = null;

async function getDb(): Promise<Low<DbSchema>> {
  if (_db) return _db;
  // Ensure data directory exists
  const { mkdirSync } = await import("fs");
  mkdirSync(join(__dirname, "..", "data"), { recursive: true });
  _db = new Low<DbSchema>(new JSONFile<DbSchema>(DB_PATH), defaultData);
  await _db.read();
  // Ensure all tables exist (migration safety)
  _db.data = { ...defaultData, ..._db.data };
  await _db.write();
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(data: Partial<User> & { user_id: string }): Promise<User> {
  const db = await getDb();
  const now = Date.now();
  const idx = db.data.users.findIndex((u) => u.user_id === data.user_id);
  if (idx >= 0) {
    db.data.users[idx] = { ...db.data.users[idx], ...data, updated_at: now };
    await db.write();
    return db.data.users[idx];
  }
  const user: User = {
    name: data.name ?? "",
    fitness_level: data.fitness_level ?? "beginner",
    goals: data.goals ?? [],
    injuries: data.injuries ?? [],
    equipment: data.equipment ?? [],
    created_at: now,
    updated_at: now,
    ...data,
  };
  db.data.users.push(user);
  await db.write();
  return user;
}

export async function getUser(user_id: string): Promise<User | undefined> {
  const db = await getDb();
  return db.data.users.find((u) => u.user_id === user_id);
}

// ─── Pain Logs ────────────────────────────────────────────────────────────────

export async function addPainLog(data: Omit<PainLog, "entry_id">): Promise<PainLog> {
  const db = await getDb();
  const entry: PainLog = { entry_id: randomUUID(), ...data };
  db.data.pain_logs.push(entry);
  await db.write();
  return entry;
}

export async function getPainLogs(user_id: string, limit = 20): Promise<PainLog[]> {
  const db = await getDb();
  return db.data.pain_logs
    .filter((p) => p.user_id === user_id)
    .sort((a, b) => b.date - a.date)
    .slice(0, limit);
}

export async function getLatestPain(user_id: string): Promise<PainLog | undefined> {
  const logs = await getPainLogs(user_id, 1);
  return logs[0];
}

// ─── Assessments ─────────────────────────────────────────────────────────────

export async function addAssessment(data: Omit<Assessment, "assessment_id">): Promise<Assessment> {
  const db = await getDb();
  const entry: Assessment = { assessment_id: randomUUID(), ...data };
  db.data.assessments.push(entry);
  await db.write();
  return entry;
}

export async function getAssessments(user_id: string): Promise<Assessment[]> {
  const db = await getDb();
  return db.data.assessments
    .filter((a) => a.user_id === user_id)
    .sort((a, b) => b.date - a.date);
}

// ─── Exercises ────────────────────────────────────────────────────────────────

export async function upsertExercise(data: Omit<Exercise, "exercise_id"> & { exercise_id?: string }): Promise<Exercise> {
  const db = await getDb();
  const id = data.exercise_id ?? randomUUID();
  const idx = db.data.exercises.findIndex((e) => e.exercise_id === id);
  const exercise: Exercise = { exercise_id: id, ...data };
  if (idx >= 0) {
    db.data.exercises[idx] = exercise;
  } else {
    db.data.exercises.push(exercise);
  }
  await db.write();
  return exercise;
}

export async function getExercises(filter?: { category?: string; movement_pattern?: string }): Promise<Exercise[]> {
  const db = await getDb();
  let results = db.data.exercises;
  if (filter?.category) results = results.filter((e) => e.category === filter.category);
  if (filter?.movement_pattern) results = results.filter((e) => e.movement_pattern === filter.movement_pattern);
  return results;
}

export async function getExercise(name: string): Promise<Exercise | undefined> {
  const db = await getDb();
  return db.data.exercises.find((e) => e.name === name);
}

// ─── Programs ─────────────────────────────────────────────────────────────────

export async function saveProgram(data: Omit<Program, "program_id" | "created_at" | "updated_at"> & { program_id?: string }): Promise<Program> {
  const db = await getDb();
  const now = Date.now();
  const id = data.program_id ?? randomUUID();
  const idx = db.data.programs.findIndex((p) => p.program_id === id);
  const program: Program = { program_id: id, created_at: now, updated_at: now, ...data };
  if (idx >= 0) {
    db.data.programs[idx] = { ...db.data.programs[idx], ...program, updated_at: now };
  } else {
    // Deactivate other programs for this user
    db.data.programs.forEach((p) => { if (p.user_id === data.user_id) p.active = false; });
    db.data.programs.push(program);
  }
  await db.write();
  return program;
}

export async function getActiveProgram(user_id: string): Promise<Program | undefined> {
  const db = await getDb();
  return db.data.programs.find((p) => p.user_id === user_id && p.active);
}

export async function getPrograms(user_id: string): Promise<Program[]> {
  const db = await getDb();
  return db.data.programs
    .filter((p) => p.user_id === user_id)
    .sort((a, b) => b.created_at - a.created_at);
}

// ─── Panther Memory ───────────────────────────────────────────────────────────

export async function getPantherMemory(user_id: string): Promise<PantherMemory | undefined> {
  const db = await getDb();
  return db.data.panther_memory.find((m) => m.user_id === user_id);
}

export async function upsertPantherMemory(user_id: string, data: Partial<PantherMemory>): Promise<PantherMemory> {
  const db = await getDb();
  const now = Date.now();
  const idx = db.data.panther_memory.findIndex((m) => m.user_id === user_id);
  if (idx >= 0) {
    db.data.panther_memory[idx] = {
      ...db.data.panther_memory[idx],
      ...data,
      user_id,
      updated_at: now,
      last_seen: now,
    };
    await db.write();
    return db.data.panther_memory[idx];
  }
  const memory: PantherMemory = {
    memory_id: randomUUID(),
    user_id,
    name: data.name ?? "",
    primary_goal: data.primary_goal ?? "",
    primary_issue: data.primary_issue ?? "",
    wins: data.wins ?? [],
    struggles: data.struggles ?? [],
    streak_days: data.streak_days ?? 0,
    xp: data.xp ?? 0,
    stage: data.stage ?? "CUB",
    sessions_count: data.sessions_count ?? 0,
    conversation_history: data.conversation_history ?? [],
    last_seen: now,
    created_at: now,
    updated_at: now,
    ...data,
  };
  db.data.panther_memory.push(memory);
  await db.write();
  return memory;
}

export async function appendPantherConversation(
  user_id: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  const idx = db.data.panther_memory.findIndex((m) => m.user_id === user_id);
  const entry = { role, content, timestamp: now };
  if (idx >= 0) {
    const history = db.data.panther_memory[idx].conversation_history;
    history.push(entry);
    // Keep last 30 turns
    if (history.length > 30) history.splice(0, history.length - 30);
    db.data.panther_memory[idx].updated_at = now;
    db.data.panther_memory[idx].last_seen = now;
  } else {
    db.data.panther_memory.push({
      memory_id: randomUUID(),
      user_id,
      name: "",
      primary_goal: "",
      primary_issue: "",
      wins: [],
      struggles: [],
      streak_days: 0,
      xp: 0,
      stage: "CUB",
      sessions_count: 0,
      conversation_history: [entry],
      last_seen: now,
      created_at: now,
      updated_at: now,
    });
  }
  await db.write();
}

// ─── Workout Sessions ─────────────────────────────────────────────────────────

export async function addSession(data: Omit<WorkoutSession, "session_id">): Promise<WorkoutSession> {
  const db = await getDb();
  const session: WorkoutSession = { session_id: randomUUID(), ...data };
  db.data.sessions.push(session);
  await db.write();
  return session;
}

export async function getSessions(user_id: string, limit = 30): Promise<WorkoutSession[]> {
  const db = await getDb();
  return db.data.sessions
    .filter((s) => s.user_id === user_id)
    .sort((a, b) => b.date - a.date)
    .slice(0, limit);
}

// ─── Body Logs ────────────────────────────────────────────────────────────────

export async function addBodyLog(data: Omit<BodyLog, "log_id">): Promise<BodyLog> {
  const db = await getDb();
  const log: BodyLog = { log_id: randomUUID(), ...data };
  db.data.body_logs.push(log);
  await db.write();
  return log;
}

export async function getBodyLogs(user_id: string, limit = 50): Promise<BodyLog[]> {
  const db = await getDb();
  return db.data.body_logs
    .filter((b) => b.user_id === user_id)
    .sort((a, b) => b.date - a.date)
    .slice(0, limit);
}

export async function getLatestBodyLog(user_id: string): Promise<BodyLog | undefined> {
  const logs = await getBodyLogs(user_id, 1);
  return logs[0];
}

// ─── Stats / Summary ──────────────────────────────────────────────────────────

export async function getUserStats(user_id: string) {
  const db = await getDb();
  const sessions = db.data.sessions.filter((s) => s.user_id === user_id);
  const memory = db.data.panther_memory.find((m) => m.user_id === user_id);
  const latestBody = (await getBodyLogs(user_id, 1))[0];
  const latestPain = (await getPainLogs(user_id, 1))[0];

  return {
    total_sessions: sessions.length,
    xp: memory?.xp ?? 0,
    stage: memory?.stage ?? "CUB",
    streak_days: memory?.streak_days ?? 0,
    latest_weight: latestBody?.weight,
    latest_body_fat: latestBody?.body_fat_percent,
    latest_pain_level: latestPain?.pain_level,
    latest_pain_location: latestPain?.pain_location,
  };
}
