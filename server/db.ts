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
  // ── Subscription / billing ──────────────────────────────────────────────────
  tier?: "free" | "cub" | "stealth" | "controlled" | "apex";
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: "active" | "cancelled" | "past_due" | "trialing";
  tier_updated_at?: number;
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

// ─── FUEL Pillar Types ───────────────────────────────────────────────────────
// Re-exported from fuelCalculations.ts for DB storage

export interface StoredFuelProfile {
  user_id: string;
  weightKg: number;
  heightCm: number;
  age: number;
  sex: "male" | "female";
  activityLevel: string;
  primaryGoal: string;
  deficitTier: string;
  isPostMenopausal?: boolean;
  conditions: string[];
  calorieTarget: number;
  proteinTargetG: number;
  carbTargetG: number;
  fatTargetG: number;
  rmr: number;
  tdee: number;
  updated_at: number;
}

export interface StoredDailyFuelLog {
  log_id: string;
  user_id: string;
  date: string;             // YYYY-MM-DD
  meals: StoredMealEntry[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  mpsTriggersCount: number;
  trainingLogged: boolean;
  flags: string[];
  pantherDirective?: string;
  updated_at: number;
}

export interface StoredMealEntry {
  mealType: string;
  timeLogged: string;
  foods: Array<{
    name: string;
    servingG: number;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  }>;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  mpsTriggered: boolean;
  notes?: string;
}

// ─── Animation Jobs ─────────────────────────────────────────────────────────

export interface AnimationJob {
  job_id: string;           // UUID
  animation_id: string;     // e.g. "panther_squat_control"
  difficulty: string;       // "beginner" | "normal" | "advanced"
  prompt_used: string;      // final prompt sent to generation API
  status: "pending" | "processing" | "complete" | "failed";
  url?: string;             // CDN URL when complete
  source: "cache" | "generated" | "fallback";
  error?: string;
  created_at: number;
  updated_at: number;
}

// ─── FEAST Pillar Types ───────────────────────────────────────────────────────

export interface PlannedMeal {
  mealType: "meal1" | "meal2" | "pre_training" | "post_training" | "pre_sleep";
  recipeId: string;
  recipeName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  mpsTriggered: boolean;
  swapped?: boolean;
}

export interface DayPlan {
  dayOfWeek: number; // 0 = Monday ... 6 = Sunday
  dateISO: string;
  meals: PlannedMeal[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  macroTargetMet: boolean;
}

export interface ShoppingItem {
  name: string;
  totalAmount: string;
  unit: string;
  category: "produce" | "protein" | "dairy" | "pantry" | "supplements" | "other";
  budgetTier: "budget" | "mid" | "premium";
  checked: boolean;
}

export interface WeeklyMealPlan {
  planId: string;
  userId: string;
  weekStartDate: string;
  days: DayPlan[];
  weeklyCalories: number;
  weeklyProteinG: number;
  weeklyCarbsG: number;
  weeklyFatG: number;
  shoppingList: ShoppingItem[];
  fuelProfileSnapshot: {
    calorieTarget: number;
    proteinTarget: number;
    carbTarget: number;
    fatTarget: number;
    goal: string;
    conditions: string[];
  };
  generatedAt: number;
  lastViewedAt?: number;
}

/// ─── User Progress (XP / Streak / Scores) ───────────────────────────────────
export interface UserProgress {
  user_id: string;
  xp: number;                          // total XP earned
  streak_days: number;                 // current consecutive training days
  longest_streak: number;              // all-time best streak
  sessions_completed: number;          // total sessions finished
  total_minutes: number;               // total training minutes
  mobility: number;                    // 0-100 NASM mobility score
  strength: number;                    // 0-100 NASM strength score
  stability: number;                   // 0-100 NASM stability score
  last_session_date: string | null;    // YYYY-MM-DD
  last_issue_id: string | null;        // last corrective issue
  last_corrective_plan: string[] | null;
  join_date: number;                   // UTC ms timestamp
  updated_at: number;
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
  fuel_profiles: StoredFuelProfile[];
  fuel_logs: StoredDailyFuelLog[];
  mindset_challenges: StoredMindsetChallenge[];
  animation_jobs: AnimationJob[];
  meal_plans: WeeklyMealPlan[];
  voice_jobs: VoiceJob[];
  user_progress: UserProgress[];
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
  fuel_profiles: [],
  fuel_logs: [],
  mindset_challenges: [],
  animation_jobs: [],
  meal_plans: [],
  voice_jobs: [],
  user_progress: [],
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
  // Ensure FUEL tables exist for existing DBs
  if (!_db.data.fuel_profiles) _db.data.fuel_profiles = [];
  if (!_db.data.fuel_logs) _db.data.fuel_logs = [];
  if (!_db.data.mindset_challenges) _db.data.mindset_challenges = [];
  if (!_db.data.animation_jobs) _db.data.animation_jobs = [];
  if (!_db.data.meal_plans) _db.data.meal_plans = [];
  if (!_db.data.voice_jobs) _db.data.voice_jobs = [];
  if (!_db.data.user_progress) _db.data.user_progress = [];
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

/** Update a user's subscription tier after a Stripe webhook event */
export async function updateUserTier(
  identifier: { email?: string; user_id?: string },
  update: {
    tier: User["tier"];
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    subscription_status?: User["subscription_status"];
  }
): Promise<User | null> {
  const db = await getDb();
  const now = Date.now();
  const idx = identifier.user_id
    ? db.data.users.findIndex((u) => u.user_id === identifier.user_id)
    : db.data.users.findIndex((u) => u.email === identifier.email);
  if (idx < 0) return null;
  db.data.users[idx] = {
    ...db.data.users[idx],
    ...update,
    tier_updated_at: now,
    updated_at: now,
  };
  await db.write();
  console.log(`[DB] Tier updated → user ${db.data.users[idx].user_id}: ${update.tier} (${update.subscription_status})`);
  return db.data.users[idx];
}

/** Look up a user by Stripe customer ID */
export async function getUserByStripeCustomer(stripe_customer_id: string): Promise<User | undefined> {
  const db = await getDb();
  return db.data.users.find((u) => u.stripe_customer_id === stripe_customer_id);
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

// ─── FUEL Pillar — Profile ────────────────────────────────────────────────────

export async function upsertFuelProfile(
  data: StoredFuelProfile
): Promise<StoredFuelProfile> {
  const db = await getDb();
  const idx = db.data.fuel_profiles.findIndex((p) => p.user_id === data.user_id);
  const record = { ...data, updated_at: Date.now() };
  if (idx >= 0) {
    db.data.fuel_profiles[idx] = record;
  } else {
    db.data.fuel_profiles.push(record);
  }
  await db.write();
  return record;
}

export async function getFuelProfile(
  user_id: string
): Promise<StoredFuelProfile | undefined> {
  const db = await getDb();
  return db.data.fuel_profiles.find((p) => p.user_id === user_id);
}

// ─── FUEL Pillar — Daily Logs ─────────────────────────────────────────────────

export async function upsertDailyFuelLog(
  data: StoredDailyFuelLog
): Promise<StoredDailyFuelLog> {
  const db = await getDb();
  const idx = db.data.fuel_logs.findIndex(
    (l) => l.user_id === data.user_id && l.date === data.date
  );
  const record = { ...data, updated_at: Date.now() };
  if (idx >= 0) {
    db.data.fuel_logs[idx] = record;
  } else {
    db.data.fuel_logs.push(record);
  }
  await db.write();
  return record;
}

export async function getDailyFuelLog(
  user_id: string,
  date: string
): Promise<StoredDailyFuelLog | undefined> {
  const db = await getDb();
  return db.data.fuel_logs.find(
    (l) => l.user_id === user_id && l.date === date
  );
}

export async function getRecentFuelLogs(
  user_id: string,
  limit = 7
): Promise<StoredDailyFuelLog[]> {
  const db = await getDb();
  return db.data.fuel_logs
    .filter((l) => l.user_id === user_id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

// ─── MINDSET Pillar — Types & CRUD ────────────────────────────────────────────

export interface StoredMindsetChallenge {
  user_id: string;
  startDate: string;
  currentDay: number;
  currentPhase: number;
  streakCurrent: number;
  streakBest: number;
  totalCheckIns: number;
  lastCheckInDate: string | null;
  isActive: boolean;
  isCompleted: boolean;
  checkIns: Array<{
    day: number;
    phase: number;
    completedAt: string;
    journalEntry: string | null;
    intentionalDecision: string | null;
    pantherDirective: string;
    moveAnchorComplete: boolean;
    fuelAnchorComplete: boolean;
    sharedSocial: boolean;
  }>;
  updated_at: number;
}

export async function upsertMindsetChallenge(
  data: Omit<StoredMindsetChallenge, "updated_at">
): Promise<StoredMindsetChallenge> {
  const db = await getDb();
  const idx = db.data.mindset_challenges.findIndex((c) => c.user_id === data.user_id);
  const record: StoredMindsetChallenge = { ...data, updated_at: Date.now() };
  if (idx >= 0) {
    db.data.mindset_challenges[idx] = record;
  } else {
    db.data.mindset_challenges.push(record);
  }
  await db.write();
  return record;
}

export async function getMindsetChallenge(
  user_id: string
): Promise<StoredMindsetChallenge | undefined> {
  const db = await getDb();
  return db.data.mindset_challenges.find((c) => c.user_id === user_id);
}

// ─── Animation Jobs ───────────────────────────────────────────────────────────

/** Create a new animation job record */
export async function createAnimationJob(
  data: Omit<AnimationJob, "job_id" | "created_at" | "updated_at">
): Promise<AnimationJob> {
  const db = await getDb();
  const job: AnimationJob = {
    job_id: randomUUID(),
    ...data,
    created_at: Date.now(),
    updated_at: Date.now(),
  };
  db.data.animation_jobs.push(job);
  await db.write();
  return job;
}

/** Update an existing animation job (status, url, error) */
export async function updateAnimationJob(
  job_id: string,
  update: Partial<Pick<AnimationJob, "status" | "url" | "error" | "source">>
): Promise<AnimationJob | null> {
  const db = await getDb();
  const idx = db.data.animation_jobs.findIndex((j) => j.job_id === job_id);
  if (idx < 0) return null;
  db.data.animation_jobs[idx] = {
    ...db.data.animation_jobs[idx],
    ...update,
    updated_at: Date.now(),
  };
  await db.write();
  return db.data.animation_jobs[idx];
}

/** Get a job by its UUID */
export async function getAnimationJob(job_id: string): Promise<AnimationJob | undefined> {
  const db = await getDb();
  return db.data.animation_jobs.find((j) => j.job_id === job_id);
}

/** Get the most recent completed job for an animation_id (cache lookup) */
export async function getCachedAnimation(
  animation_id: string,
  difficulty: string
): Promise<AnimationJob | undefined> {
  const db = await getDb();
  return db.data.animation_jobs
    .filter(
      (j) =>
        j.animation_id === animation_id &&
        j.difficulty === difficulty &&
        j.status === "complete" &&
        !!j.url
    )
    .sort((a, b) => b.created_at - a.created_at)[0];
}

/** Get all completed animation jobs (for preload status check) */
export async function getAllCachedAnimations(): Promise<AnimationJob[]> {
  const db = await getDb();
  return db.data.animation_jobs.filter((j) => j.status === "complete" && !!j.url);
}

// ─── FEAST Pillar — Meal Plan CRUD ────────────────────────────────────────────

export async function saveMealPlan(plan: WeeklyMealPlan): Promise<WeeklyMealPlan> {
  const db = await getDb();
  const idx = db.data.meal_plans.findIndex((p) => p.planId === plan.planId);
  if (idx >= 0) {
    db.data.meal_plans[idx] = plan;
  } else {
    db.data.meal_plans.push(plan);
  }
  await db.write();
  return plan;
}

export async function getMealPlan(planId: string): Promise<WeeklyMealPlan | undefined> {
  const db = await getDb();
  return db.data.meal_plans.find((p) => p.planId === planId);
}

export async function getLatestMealPlan(userId: string): Promise<WeeklyMealPlan | undefined> {
  const db = await getDb();
  const plans = db.data.meal_plans.filter((p) => p.userId === userId);
  return plans.sort((a, b) => b.generatedAt - a.generatedAt)[0];
}

export async function updateMealPlanShoppingItem(
  planId: string,
  itemName: string,
  checked: boolean
): Promise<boolean> {
  const db = await getDb();
  const plan = db.data.meal_plans.find((p) => p.planId === planId);
  if (!plan) return false;
  const item = plan.shoppingList.find((i) => i.name === itemName);
  if (item) item.checked = checked;
  await db.write();
  return true;
}

export async function swapPlannedMeal(
  planId: string,
  dayOfWeek: number,
  mealType: PlannedMeal["mealType"],
  newMeal: PlannedMeal
): Promise<WeeklyMealPlan | null> {
  const db = await getDb();
  const plan = db.data.meal_plans.find((p) => p.planId === planId);
  if (!plan) return null;
  const day = plan.days.find((d) => d.dayOfWeek === dayOfWeek);
  if (!day) return null;
  const mealIdx = day.meals.findIndex((m) => m.mealType === mealType);
  if (mealIdx >= 0) {
    day.meals[mealIdx] = { ...newMeal, swapped: true };
    day.totalCalories = day.meals.reduce((s, m) => s + m.calories, 0);
    day.totalProteinG = day.meals.reduce((s, m) => s + m.proteinG, 0);
    day.totalCarbsG = day.meals.reduce((s, m) => s + m.carbsG, 0);
    day.totalFatG = day.meals.reduce((s, m) => s + m.fatG, 0);
    day.macroTargetMet =
      day.totalCalories >= plan.fuelProfileSnapshot.calorieTarget * 0.9 &&
      day.totalProteinG >= plan.fuelProfileSnapshot.proteinTarget * 0.85;
  }
  await db.write();
  return plan;
}

export async function markMealPlanViewed(planId: string): Promise<void> {
  const db = await getDb();
  const plan = db.data.meal_plans.find((p) => p.planId === planId);
  if (plan) {
    plan.lastViewedAt = Date.now();
    await db.write();
  }
}

// ─── Voice Jobs ──────────────────────────────────────────────────────────────

export interface VoiceJob {
  job_id: string;
  exercise_id: string;
  difficulty: string;
  voice_key: string;
  text: string;
  status: "pending" | "complete" | "failed";
  url?: string;           // S3 URL once uploaded
  source?: "generated" | "cache";
  error?: string;
  created_at: number;
  updated_at: number;
}

export async function createVoiceJob(
  data: Omit<VoiceJob, "job_id" | "created_at" | "updated_at">
): Promise<VoiceJob> {
  const db = await getDb();
  const now = Date.now();
  const job: VoiceJob = {
    job_id: randomUUID(),
    created_at: now,
    updated_at: now,
    ...data,
  };
  if (!db.data.voice_jobs) db.data.voice_jobs = [];
  db.data.voice_jobs.push(job);
  await db.write();
  return job;
}

export async function updateVoiceJob(
  job_id: string,
  update: Partial<Pick<VoiceJob, "status" | "url" | "error" | "source">>
): Promise<VoiceJob | null> {
  const db = await getDb();
  if (!db.data.voice_jobs) db.data.voice_jobs = [];
  const idx = db.data.voice_jobs.findIndex((j) => j.job_id === job_id);
  if (idx < 0) return null;
  db.data.voice_jobs[idx] = {
    ...db.data.voice_jobs[idx],
    ...update,
    updated_at: Date.now(),
  };
  await db.write();
  return db.data.voice_jobs[idx];
}

export async function getVoiceJob(job_id: string): Promise<VoiceJob | undefined> {
  const db = await getDb();
  if (!db.data.voice_jobs) return undefined;
  return db.data.voice_jobs.find((j) => j.job_id === job_id);
}

export async function getCachedVoiceJob(
  exercise_id: string,
  difficulty: string
): Promise<VoiceJob | undefined> {
  const db = await getDb();
  if (!db.data.voice_jobs) return undefined;
  return db.data.voice_jobs
    .filter((j) => j.exercise_id === exercise_id && j.difficulty === difficulty && j.status === "complete" && j.url)
    .sort((a, b) => b.created_at - a.created_at)[0];
}

// ─── User Progress (XP / Streak / Scores) ────────────────────────────────────

const DEFAULT_PROGRESS: Omit<UserProgress, "user_id"> = {
  xp: 0,
  streak_days: 0,
  longest_streak: 0,
  sessions_completed: 0,
  total_minutes: 0,
  mobility: 0,
  strength: 0,
  stability: 0,
  last_session_date: null,
  last_issue_id: null,
  last_corrective_plan: null,
  join_date: Date.now(),
  updated_at: Date.now(),
};

export async function getUserProgress(user_id: string): Promise<UserProgress> {
  const db = await getDb();
  const existing = db.data.user_progress.find((p) => p.user_id === user_id);
  if (existing) return existing;
  // Return default without persisting — only write on first upsert
  return { user_id, ...DEFAULT_PROGRESS };
}

export async function upsertUserProgress(
  user_id: string,
  data: Partial<Omit<UserProgress, "user_id">>
): Promise<UserProgress> {
  const db = await getDb();
  const now = Date.now();
  const idx = db.data.user_progress.findIndex((p) => p.user_id === user_id);
  if (idx >= 0) {
    db.data.user_progress[idx] = {
      ...db.data.user_progress[idx],
      ...data,
      updated_at: now,
    };
    await db.write();
    return db.data.user_progress[idx];
  }
  const record: UserProgress = {
    user_id,
    ...DEFAULT_PROGRESS,
    ...data,
    join_date: data.join_date ?? now,
    updated_at: now,
  };
  db.data.user_progress.push(record);
  await db.write();
  return record;
}

export async function addXP(user_id: string, amount: number): Promise<UserProgress> {
  const current = await getUserProgress(user_id);
  return upsertUserProgress(user_id, { xp: current.xp + amount });
}
