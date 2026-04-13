# THE PANTHER SYSTEM
## TECHNICAL SPECIFICATION v2.0
**Turned Up Fitness LLC | April 2026**
**CONFIDENTIAL — NOT FOR DISTRIBUTION**

---

## 1. SYSTEM OVERVIEW

The Panther System is a Claude-powered corrective fitness and nutrition intelligence platform targeting adults 40+. It delivers personalized workouts, real-time pain diagnostics, and adaptive coaching through a unified **MOVE / FUEL / FEAST** architecture.

**Platform targets:**
- Mobile App (iOS / Android)
- Tablet
- Desktop
- Website

---

## 2. CORE ARCHITECTURE

| Layer | Technology |
|---|---|
| Frontend | React / TypeScript |
| Backend | Node.js / Express |
| AI Engine | Claude (Anthropic API — `claude-sonnet-4-20250514`) — **CLAUDE ONLY** |
| Vision Layer | fal.ai real-time movement analysis |
| Voice Layer | ElevenLabs TTS |
| Database | PostgreSQL + Vector DB |
| Storage | AWS S3 |
| Active Repo | GitHub — `feature/live-coaching` branch (PR #1 → main) |

---

## 3. AI ENGINE — THE PANTHER SYSTEM INTELLIGENCE FLOW

The Panther System operates a 9-step NASM-grounded corrective intelligence loop:

1. **Collect User Input** — Pain location, movement history, age, condition flags
2. **Real-Time Movement Analysis** — fal.ai vision captures live movement via device camera
3. **NASM Assessment** — Claude analyzes against NASM OPT model and corrective exercise principles
4. **Root Cause Diagnosis** — Adaptive clinical decision rules — Shoulder Complex, Knee Complex, scapular dyskinesis
5. **Corrective Strategy** — 75-exercise corrective library (`CORRECTIVE_LIBRARY.ts`) — smart matching engine (`coaching.ts`)
6. **Workout Generation** — Personalized corrective sequence with sets, reps, tempo, cues
7. **Panther System Coaching Mode** — Stealth (subtle cues) | Precision (technical breakdown) | Attack (high intensity)
8. **Capture Feedback** — Pain response, effort rating, completion data
9. **Adapt Program** — Claude adjusts future sessions based on feedback loop

---

## 4. THREE PILLARS — MOVE / FUEL / FEAST

The Panther System operates across three unified pillars. All three are personalized to the 40+ demographic.

| Pillar | Focus | Panther System Role |
|---|---|---|
| **MOVE** | Corrective exercise, mobility, strength | Live coaching, pain diagnostics, corrective library |
| **FUEL** | Nutrition, caloric strategy, protein optimization | Personalized nutrition plans, protein distribution tracker |
| **FEAST** | TUTK cookbook, meal planning, food database | 1,800-food searchable database, 16 categories |

---

## 5. SUBSCRIPTION MODEL

All tiers are built for adults 40+ — corrective performance, not general fitness.

| Tier | Price | Includes |
|---|---|---|
| **CUB** | $9.99/mo | Pain & movement assessment, basic 4-week corrective program, XP tracking & stage system, movement streak tracking, community access |
| **STEALTH** | $19.99/mo | Everything in CUB + Panther Brain AI coach (Claude), BOA Scan biomechanical analysis, Evolve stage unlocks, unlimited AI coaching sessions |
| **CONTROLLED** | $34.99/mo | Everything in STEALTH + 30-Day Panther Mindset Challenge, advanced program variations, nutrition & supplementation guidance, priority AI response speed |
| **APEX PREDATOR** | $59.99/mo | Everything in CONTROLLED + live coaching session queue, custom program builds, direct trainer access, early access to new features |

**Annual pricing:** 20% discount applied to all tiers.

---

## 6. UI FRAMEWORK

**Navigation:** Home | Train | Assess | Progress | Profile

| Screen | Purpose |
|---|---|
| **Home** | Daily Focus, Start Workout, Log Pain, Panther System status |
| **Train** | Exercise cards, video + cues, feedback buttons, coaching mode selector |
| **Assess** | Pain location selector, movement tests, Panther System AI diagnosis |
| **Progress** | Pain tracking, strength tracking, streaks, sarcopenia risk panel, protein distribution tracker |
| **Profile** | Goals/SMART builder, subscription tier, personal data |

---

## 7. BRAND & VOICE — THE PANTHER SYSTEM

**Tone:** Calm. Dominant. Precise. The Panther System does not motivate. It directs.

**Response format — every Panther System output follows this structure:**

```
HEADLINE — one truth, no softening (max 10 words)
BODY — science-backed explanation, 2-3 sentences max, no filler
DIRECTIVE — one action, stated as fact, not a suggestion
```

**Voice Laws (non-negotiable — attach to all prompt tasks):**
1. **Lead with truth** — no hype, no empty encouragement
2. **Precision over volume** — one directive at a time
3. **No motivational theater** — no "you got this" filler
4. **Science is the authority** — every claim grounded in biomechanics or physiology
5. **One system, one standard** — every user gets the same precision; modification is data-driven, not age-based coddling

**Brand voice examples:**
> "Control the movement. No shortcuts."
> "The Panther System does not waste a single cue. Every directive serves a purpose."

---

## 8. WHITE-LABEL FRAMEWORK

- Three licensing tiers: **Basic | Pro | Enterprise**
- Licensed trainers may swap the Panther mascot character — name TBD via community vote
- Engine logic, voice laws, and NASM intelligence layer are **non-swappable IP**
- Lottie/Rive animation architecture supports mascot swap without code changes
- All white-label deployments run on The Panther System engine

---

## 9. BUILD QUEUE — ACTIVE

Current sprint order (do not resequence without Marc approval):

1. `CORRECTIVE_LIBRARY.ts` — 75-exercise structured data layer
2. `coaching.ts` — smart matching engine rewrite
3. `LiveCoaching.tsx` — UI (slide-up drawer vs full-screen pause decision pending)
4. `PANTHER_PROMPTS.md` — finalized voice + clinical prompt library
5. App store submission prep
6. White-label licensing framework activation

---

## 10. 40+ DEMOGRAPHIC CONTEXT

Every Panther System response must account for the 40+ reality:

- **Sarcopenia risk begins at 40** — muscle preservation is clinical priority #1
- **Recovery windows are longer** — programming reflects this, not ignores it
- **Corrective exercise is not optional** — it is the foundation before load
- **Joint health > aesthetic goals** — the system coaches accordingly

> New healthy is 40+. New sick is under 30. This platform exists at that intersection.

---

## 11. CHARACTER NAME — OPEN ITEM

The Panther mascot character does not yet have a personal name. This will be determined via community vote after launch.

- The AI system = **The Panther System**
- The mascot = **Panther** (no personal name yet)
- **DO NOT** assign a character name in code, UI, or copy until Marc confirms

---

*© 2026 TURNED UP FITNESS LLC | THE PANTHER SYSTEM | CONFIDENTIAL — NOT FOR DISTRIBUTION*
