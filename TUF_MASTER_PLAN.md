# TUF App — Master Plan
**Turned Up Fitness LLC © 2026**
_From current state → soft testing → soft launch_

---

## Ground Rules

- **One upgrade per day.** No stacking new features on top of broken ones.
- **Fix before forward.** Every known bug is resolved before the next day begins.
- **Delegate smartly.** Manus handles implementation. Claude handles AI logic design. You handle content, voice, and final approval.
- **Gate at soft test.** Nothing goes to real users until every item in the Soft Test Checklist passes.

---

## Current State Snapshot (Apr 21, 2026)

| Area | Status |
|---|---|
| Hamburger navigation | ✅ Live — portal fix applied |
| Home screen | ✅ Redesigned — hero, stats, quick actions |
| WorkoutPlayer + Coach Mode | ✅ Live — 4 modes, Panther cue overlay |
| Panther Brain | ✅ Live — cinematic entrance, AI chat |
| PvP Challenge | ⚠️ UI works, bot opponent not appearing |
| TUTK / Feast | ✅ Recipes load, no food images |
| Fuel Tracker | ✅ Working |
| Voice cues (ElevenLabs) | ⚠️ Waiting on Voice ID from Marc |
| Stripe checkout | ⚠️ Scaffolded, not wired to live sessions |
| Adaptive Coach engine | ❌ Not yet built |
| AI Referee (BOA upgrade) | ⚠️ Basic pose detection, not exercise-specific |
| Schedule page | ⚠️ Hidden — calendar bugs |

---

## Day-by-Day Roadmap

### Day 1 — Fix PvP Bot (Today)
**Owner: Manus**
The Socket.io WebSocket proxy is configured. The remaining issue is the bot spawn timing on the server side. Manus will debug the `join_challenge` event flow and confirm the bot fires within 5 seconds.

**Done when:** Enter the Arena → bot appears within 5 seconds → live rep counter updates on both sides.

---

### Day 2 — TUTK Food Images
**Owner: Manus**
Source and wire food images for all 31 TUTK items (18 meals, 6 breakfasts, 4 shakes, 3 dressings). Images will be uploaded to S3 and referenced in `tutkRecipes.ts`. The Feast/TUTK page will display a card image per recipe.

**Done when:** Every recipe card in TUTK shows a food photo.

---

### Day 3 — ElevenLabs Voice
**Owner: Marc + Manus**
Marc provides the ElevenLabs Voice ID from his recording session. Manus wires it into `server/routes/voice.ts`, updates the voice route, and confirms voice cues fire during workouts.

**Done when:** Start a workout → Panther speaks the cue in Marc's voice.

---

### Day 4 — Adaptive Coach Engine
**Owner: Claude (design) + Manus (integration)**
Claude's `adaptiveCoach.js` provides the scoring algorithms. Manus ports `computeStrengthScore`, `computeEnduranceScore`, `detectFatigue`, and `adjustWorkout` into the TUF App server as a new service. The WorkoutPlayer will display a live Adaptive Level (1–5) that updates after each session.

**See:** `CLAUDE_BRIEF_01_AdaptiveCoach.md` for the exact brief to send Claude.

**Done when:** After a session, the user's Adaptive Level updates on their profile.

---

### Day 5 — Exercise Database Upgrade
**Owner: Claude (content) + Manus (integration)**
Merge Claude's richer exercise metadata (progressions, regressions, coaching cues, compensation patterns) into the existing TUF exercise database. This powers smarter workout generation and corrective suggestions.

**See:** `CLAUDE_BRIEF_02_ExerciseDB.md` for the exact brief to send Claude.

**Done when:** WorkoutPlayer shows exercise-specific coaching cues and can suggest a regression when form drops.

---

### Day 6 — Stripe Live Checkout
**Owner: Manus**
Wire the 4 subscription tiers (Cub $19/mo, Stealth $79/mo, Controlled $20/mo, Apex custom) to real Stripe Checkout Sessions. Success/cancel redirects already exist. Marc claims the Stripe sandbox and provides live keys when ready.

**Done when:** Tap a pricing tier → Stripe checkout opens → payment completes → tier updates on user profile.

---

### Day 7 — Schedule Page Fix
**Owner: Manus**
Diagnose and fix the calendar bugs that caused the Schedule page to be hidden. Re-enable the route in `App.tsx`.

**Done when:** `/schedule` loads without errors, user can view their workout calendar.

---

### Day 8 — AI Referee Upgrade (BOA)
**Owner: Claude (logic) + Manus (integration)**
Upgrade the BOA (Biomechanical Overlay Analysis) with Claude's exercise-specific joint angle validation for squats, push-ups, and planks. The AI Referee calls good/bad reps based on actual joint angles from MediaPipe.

**See:** `CLAUDE_BRIEF_03_AIReferee.md` for the exact brief to send Claude.

**Done when:** BOA correctly flags a bad squat rep based on knee angle, not just motion detection.

---

### Day 9 — Full Soft Test
**Owner: Marc + Manus**
Marc runs through every screen on a real device. Manus monitors logs in real time and fixes anything that breaks. No new features — fixes only.

**Soft Test Checklist:**
- [ ] Onboarding flow completes without errors
- [ ] Home screen loads with correct user data
- [ ] Hamburger menu opens all routes
- [ ] Start a workout → reps count → Panther cue fires → voice plays
- [ ] PvP → bot appears → battle runs to completion → XP awarded
- [ ] TUTK → all 31 recipes show with images
- [ ] Fuel tracker → log a meal → macros update
- [ ] Panther Brain → AI responds → history saves
- [ ] Health Intel → data displays
- [ ] Leaderboard → MPS scores show
- [ ] Pricing → Stripe checkout opens
- [ ] Profile → tier and stats correct
- [ ] Progress → charts render

---

### Day 10 — Soft Launch Prep
**Owner: Manus**
- Save final checkpoint
- Confirm all environment variables are production-ready
- Guide Marc through clicking Publish in the Management UI
- Prepare the invite link for soft launch testers

---

## Delegation Summary

| Item | Who Does It | File |
|---|---|---|
| Adaptive Coach engine design | Claude | `CLAUDE_BRIEF_01_AdaptiveCoach.md` |
| Exercise metadata expansion | Claude | `CLAUDE_BRIEF_02_ExerciseDB.md` |
| AI Referee joint angle logic | Claude | `CLAUDE_BRIEF_03_AIReferee.md` |
| All implementation / integration | Manus | — |
| Voice ID recording | Marc | ElevenLabs dashboard |
| Stripe live keys | Marc | Settings → Payment in Management UI |
| Soft test device testing | Marc | Day 9 checklist above |

---

## What Manus Does Not Need From You Right Now

The following items are queued and will be executed without input:
- Day 1: PvP bot fix
- Day 2: TUTK food images
- Day 6: Stripe checkout wiring (once keys are ready)
- Day 7: Schedule page fix

---

_Last updated: Apr 21, 2026_
