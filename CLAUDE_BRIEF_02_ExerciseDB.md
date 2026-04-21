# Claude Brief 02 — Exercise Database Expansion
**Send this to Claude when ready for Day 5**

---

## Context

The TUF App has an existing exercise database in `shared/panther-library.ts`. It currently has ~40 exercises with basic fields (name, muscles, sets, reps, cues). I need to expand it with richer metadata to power smarter workout generation, corrective suggestions, and AI coaching cues.

## What I Need From You

Expand the exercise database by adding the following fields to **every existing exercise** and adding any missing foundational exercises. Return the result as a **TypeScript object** that I can merge into the existing file.

## Fields to Add Per Exercise

```ts
{
  // Already exists — keep as-is:
  id: string,
  name: string,
  category: string,
  muscles_main: string[],
  muscles_secondary: string[],

  // ADD THESE:
  nasm_phases: number[],          // which NASM phases this exercise is appropriate for [1,2,3,4,5]
  difficulty: 1 | 2 | 3,         // 1=beginner, 2=intermediate, 3=advanced
  equipment: string[],            // [] = bodyweight
  corrective: boolean,            // true if used in corrective exercise programming
  progressions: string[],         // exercise IDs that are harder versions
  regressions: string[],          // exercise IDs that are easier versions
  substitutions: string[],        // exercise IDs that can replace this one
  coaching_cues: string[],        // 3 short cues a coach would say
  compensations: string[],        // movement compensations to watch for
  ucs_risk: boolean,              // Upper Crossed Syndrome contraindication
  lcs_risk: boolean,              // Lower Crossed Syndrome contraindication
  cal_per_rep: number,            // estimated calories burned per rep
}
```

## Exercise Categories to Cover

Make sure these categories are represented with at least 3 exercises each:
- LEGS (squat, hinge, lunge patterns)
- PUSH (horizontal and vertical push)
- PULL (horizontal and vertical pull)
- CORE (anti-rotation, flexion, extension)
- GLUTES (isolation and compound)
- SHOULDERS
- CORRECTIVE (mobility, activation)
- CARDIO (bodyweight conditioning)

## Constraints

- TypeScript format, exported as `const EXERCISE_DATABASE: Record<string, Exercise>`
- Exercise IDs follow pattern: `CAT_001`, `CAT_002` (e.g., `LEG_001`, `PUSH_001`)
- All exercises must be **equipment-free or resistance band only** — the TUF App targets home/gym users 40+
- No barbell exercises — dumbbells and kettlebells are acceptable
- Every exercise needs at least one regression (except the most basic bodyweight moves)

## Output Format

Return a single TypeScript file. No test files, no README. I will merge it into the existing database manually.

---
_TUF App — Turned Up Fitness LLC © 2026_
