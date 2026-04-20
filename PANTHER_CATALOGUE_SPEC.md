# Panther Brain Catalogue + TUF App Complete — Spec Notes
# Extracted from PantherBrainCatalogue.pdf (28 pages) + TUFAppComplete.pdf (20 pages)

## PantherBrainCatalogue.pdf — Full React Component Spec

### Design System
- Background: #080808 (not #0B0B0B — catalogue uses #080808)
- Primary text: #F2F2F2
- Accent blue: rgba(0,180,255) / #00aaff / #00ccff
- Corrective green: #00ff88
- Warning gold: #ff6b35 / #ffb933
- Danger red: #ff9933
- Font: Bebas Neue (headers), Barlow Condensed (body/labels)
- Neural canvas BG: 40 animated nodes with connecting lines, rgba(0,180,255)
- Deep blue glow overlay: radial-gradient ellipse rgba(0,100,255,0.08)

### Main Screen: PantherBrainCatalogue
- Header: 🐆 emoji + "PANTHER BRAIN" (Bebas Neue, gradient #00aaff→#0066ff→#00ccff, clamp 42px-72px)
- Subtitle: "WORKOUT CATALOGUE" (Barlow Condensed, #F2F2F2, clamp 28px-48px, letter-spacing 12)
- Stat line: "AI CLINICAL KNOWLEDGE BASE · {count} EXERCISES" (rgba(0,180,255,0.7))

### Search + Filters
- Search input: rgba(255,255,255,0.04) bg, 1px solid rgba(0,150,255,0.3) border, #F2F2F2 text
- Filter toggles: "✏️ CORRECTIVE ONLY" + "🦴 40+ OPTIMIZED"
  - Active: rgba(0,150,255,0.2) bg, rgba(0,150,255,0.8) border, #00aaff text
  - Inactive: rgba(255,255,255,0.03) bg, rgba(255,255,255,0.1) border, #aaa text

### Category Nav
- Categories: ALL, STRENGTH, MOBILITY, CORRECTIVE, CONDITIONING, RECOVERY
- Category icons: CATEGORY_ICONS map
- Active: linear-gradient(135deg, rgba(0,100,255,0.4), rgba(0,180,255,0.2)) + #00aaff border
- Inactive: rgba(255,255,255,0.03) + rgba(255,255,255,0.1) border

### Exercise Grid
- gridTemplateColumns: repeat(auto-fill, minmax(280px, 1fr)), gap 16
- Pulse animation on category change (opacity 0.6 → 1, 0.3s)
- Count line: "{filtered.length} EXERCISES IN PANTHER'S ACTIVE MEMORY"

### Brain Stats Bar
- Background: rgba(0,0,0,0.6), border rgba(0,150,255,0.2), borderRadius 12
- Stats: TOTAL EXERCISES, CORRECTIVE PROTOCOLS, 40+ OPTIMIZED, MOVEMENT PATTERNS, CATEGORIES
- Values in Bebas Neue 36px #00aaff with drop-shadow

### ExerciseCard Component
- Hover: rgba(0,80,200,0.12) bg, rgba(0,150,255,0.5) border, 0 0 28px rgba(0,100,255,0.2) shadow
- Default: rgba(255,255,255,0.02) bg, rgba(255,255,255,0.06) border
- Glow corner on hover: radial-gradient circle at top right rgba(0,150,255,0.15)
- ID badge: rgba(0,180,255,0.5) text, Barlow Condensed
- CORRECTIVE badge: rgba(0,200,100,0.12) bg, rgba(0,200,100,0.3) border, #00ff88 text
- Name: Bebas Neue 22px #F2F2F2
- Category tag: rgba(0,150,255,0.7)
- Movement pattern tag: rgba(200,151,58,0.8)
- Difficulty dot colors: DIFFICULTY_COLOR map
- NASM phases: rgba(0,100,255,0.15) bg, rgba(0,150,255,0.3) border, #00aaff text
- Clinical flags: UCS RISK #ff6b35, LCS RISK #ff9933, 40+ ✓ #00aaff
- Sarcopenia weight bar: linear-gradient(90deg, #0066ff, #00ccff), height 3px
- "TAP FOR CLINICAL DATA →" footer

### ExerciseModal Component
- Backdrop: rgba(0,0,0,0.85) + blur(8px)
- Modal: linear-gradient(145deg, #0a0a14, #070710), border rgba(0,150,255,0.4)
- Max width 640, max height 90vh, borderRadius 16
- Box shadow: 0 0 60px rgba(0,100,255,0.3)
- Animation: modalIn 0.3s ease (scale 0.95 → 1, opacity 0)
- Header: "{ex.id} · PANTHER CLINICAL RECORD"
- Name: Bebas Neue 36px, gradient #fff→rgba(0,180,255,0.9)
- Tags: category (rgba(0,150,255,0.7)), subcategory (rgba(200,151,58,0.8)), movementPattern (rgba(255,255,255,0.3)), CORRECTIVE (rgba(0,220,100,0.7))
- Sections: NASM PHASES, ACTIVATION CUES, COMPENSATIONS TO WATCH, INHIBIT TARGETS, ACTIVATE TARGETS, CLINICAL RISK FLAGS, PANTHER INTELLIGENCE SCORES, EQUIPMENT, TAGS
- Intelligence scores: Anti-Sarcopenia Index + 40+ Suitability Score — bar: linear-gradient(90deg, #0066ff, #00ccff), height 6px
- Footer: "◎ PANTHER LEARNS FROM EVERY CLIENT ENCOUNTER · OUTCOME SCORING ACTIVE"

### Helper Components
- Tag({ color, children }): span, fontSize 11, letterSpacing 2, padding "4px 10px", bg color at 0.12 opacity, border 1px solid color
- FlagPill({ color, children }): same but bg at 0.1 opacity, border color+44 (hex alpha)
- Section({ title, children }): title in rgba(0,180,255,0.5), borderBottom rgba(255,255,255,0.05)

### Exercise Data Schema (per card)
```
{
  id: string,
  name: string,
  category: string,        // STRENGTH | MOBILITY | CORRECTIVE | CONDITIONING | RECOVERY
  subcategory: string,
  movementPattern: string,
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ATHLETE",
  corrective: boolean,
  over40Suitability: number,  // 0-1
  sarcopeniaWeight: number,   // 0-1
  nasmPhase: string[],        // e.g. ["1","2"]
  clinicalFlags: {
    upperCrossedRisk: boolean,
    lowerCrossedRisk: boolean,
    activationCues: string[],
    compensationsToWatch: string[],
    inhibitTargets: string[],
    activateTargets: string[],
  },
  equipment: string[],
  tags: string[],
}
```

### NASM Phase Labels
- NASM_PHASE_LABEL: { "1": "PHASE 1: STABILIZATION", "2": "PHASE 2: STRENGTH ENDURANCE", "3": "PHASE 3: HYPERTROPHY", "4": "PHASE 4: MAXIMAL STRENGTH", "5": "PHASE 5: POWER" }

### Difficulty Colors
- BEGINNER: #00ff88, INTERMEDIATE: #00aaff, ADVANCED: #ff9933, ATHLETE: #ff6b35

## TUFAppComplete.pdf — App Architecture Notes
(20 pages — covers the same 7-screen architecture already implemented)
- Confirms: Onboarding → Dashboard → Daily Workout → Progress → AI Coach → Program Library → Membership
- Monetization: Free/7-day → $19/30-day → $79/Advanced → $20/mo Membership
- Success metrics: did_user_finish, did_user_sweat, did_user_repeat, did_user_share
- Panther Brain voice: calm_intense, short commands, always directive
