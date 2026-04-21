# Claude Brief 01 — Adaptive Coach Engine
**Send this to Claude when ready for Day 4**

---

## Context

I am building the TUF App (Turned Up Fitness) — a fitness platform for adults 40+ built around the NASM OPT model. The app uses a Node.js/Express backend with a JSON file database (lowdb). There is no Supabase or PostgreSQL — all data is stored in `tuf-db.json`.

The app already has:
- `WorkoutSession` records with `total_sets`, `avg_reps`, `avg_form_score`, `duration_seconds`
- `User` records with `age`, `nasm_phase` (1–5), `dysfunction_flags` (UCS/LCS/etc.), `tier`
- A `detectFormDrop()` function that returns severity and action based on rep scores
- An MPS (Movement Performance Score) system that awards points per session

## What I Need From You

I need a **complete, production-ready JavaScript module** (ES module, `.js` file) called `adaptiveCoach.js` that I will drop into `server/services/adaptiveCoach.js`.

The module must export these 4 functions:

### 1. `computeStrengthScore({ sessionHistory, bodyWeightKg, nasmPhase })`
- `sessionHistory`: array of last N WorkoutSession objects
- Returns: integer 0–100
- Algorithm: recency-weighted volume × form quality, NASM phase modifier

### 2. `computeEnduranceScore({ sessionHistory, nasmPhase })`
- Based on: session duration, rep completion rate, rest compliance
- Returns: integer 0–100

### 3. `detectFatigue({ sessionHistory, currentSession })`
- Compares current session metrics against rolling 7-session average
- Returns: `{ fatigueLevel: 0–10, recommendation: 'proceed'|'reduce'|'stop', reason: string }`

### 4. `adjustWorkout({ workout, performanceProfile, fatigueLevel })`
- `workout`: array of exercise objects `{ exerciseId, sets, reps, rest }`
- `performanceProfile`: `{ strength_score, endurance_score, nasm_phase, adaptive_level }`
- `fatigueLevel`: 0–10
- Returns: modified workout array with adjusted sets/reps/rest + `{ adjustmentsMade: string[] }`

## Data Shapes (use these exactly)

```js
// WorkoutSession (what exists in the database)
{
  session_id: string,
  user_id: string,
  date: string, // ISO
  total_sets: number,
  avg_reps: number,
  avg_form_score: number,   // 0–100
  duration_seconds: number,
  mps_points: number,
  form_grade: string,       // 'A'|'B'|'C'|'D'|'F'
}

// PerformanceProfile (what the function should return/build)
{
  user_id: string,
  strength_score: number,   // 0–100
  endurance_score: number,  // 0–100
  fatigue_level: number,    // 0–10
  adaptive_level: number,   // 1–5 (derived from strength + endurance avg)
  last_computed_at: string, // ISO timestamp
}
```

## Constraints

- Pure JavaScript (no TypeScript, no external dependencies)
- No database calls inside the module — accept data as parameters, return results
- Must handle edge cases: empty session history, single session, null values
- `adaptive_level` 1–5 maps as: 1=beginner (score 0–20), 2=developing (21–40), 3=intermediate (41–60), 4=advanced (61–80), 5=elite (81–100)
- NASM phase modifiers: Phase 1 (stabilization) = conservative thresholds, Phase 3+ = progressive thresholds

## Output Format

Return a single `.js` file with JSDoc comments. No test files needed — I have a test suite. No README needed.

---
_TUF App — Turned Up Fitness LLC © 2026_
