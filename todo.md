
## Claude AI Integration
- [ ] Replace THE PANTHER SYSTEM mock responses with real Claude API calls (Anthropic SDK)
- [ ] Add Claude system prompt with TUF fitness coaching persona
- [ ] Wire PopHIVE health context into Claude system prompt
- [ ] Add streaming support to THE PANTHER SYSTEM chat interface
- [ ] Add ANTHROPIC_API_KEY to TUF App environment
- [ ] "Powered by Grok" card in THE PANTHER SYSTEM section linking to Grok Explorer

## Banner Refinement
- [x] Minimize Powered by Grok banner — compact subtle badge, does not compete with TUF branding

## THE PANTHER SYSTEM Alive — Phase 1 (Full Build)
- [ ] Upload THE PANTHER SYSTEM videos to CDN
- [ ] Dark theme variant — cinematic black/orange gym aesthetic
- [ ] Light theme variant — clean premium white/orange
- [ ] Theme toggle so users can switch between dark and light
- [ ] THE PANTHER SYSTEM video avatar integrated into chat page (idle loop + action clips)
- [ ] Real Grok AI streaming responses (grok-4.20-reasoning)
- [ ] THE PANTHER SYSTEM onboarding — 3 questions on first visit to build user profile
- [ ] Store user profile in database for personalized context
- [ ] Voice input (Web Speech API mic button)
- [ ] Voice output (TTS — THE PANTHER SYSTEM speaks responses)
- [ ] Jotform survey for theme feedback collection

## OLD THE PANTHER SYSTEM Alive — Phase 1
- [ ] Wire real Grok AI (grok-4.20-reasoning) streaming responses into THE PANTHER SYSTEM
- [ ] THE PANTHER SYSTEM system prompt with TUF fitness coaching persona and PopHIVE health context
- [ ] Data gathering — THE PANTHER SYSTEM asks onboarding questions (age, goals, health conditions, fitness level)
- [ ] Store user profile in database for personalized context on every message
- [ ] THE PANTHER SYSTEM video avatar — animated idle and speaking states
- [ ] Voice input — microphone button with speech-to-text (Web Speech API)
- [ ] Voice output — THE PANTHER SYSTEM speaks responses aloud (text-to-speech)
- [ ] Push/pull toggle between text and voice modes

## THE PANTHER SYSTEM Motion Generation — Kling AI Phase 1
- [ ] Set up fal.ai API key secret in TUF App
- [ ] Extract best THE PANTHER SYSTEM still frame from panther video for motion reference image
- [ ] Build server-side /api/panther/motion endpoint calling Kling v3 motion control
- [ ] Motion keyword mapper — detect topic in THE PANTHER SYSTEM response and select matching reference video
- [ ] Update THE PANTHER SYSTEM chat UI to trigger motion generation asynchronously while streaming response
- [ ] Display generated motion clip when ready, fallback to pre-recorded clips if generation fails
- [ ] Commit and push all changes to GitHub

## Live Coaching Pipeline — Real-Time AI Vision
- [ ] Build camera capture module (getUserMedia, canvas frame every 3s, base64 JPEG)
- [ ] Build /api/live-coach/analyze endpoint: fal.ai vision → movement description
- [ ] Build /api/live-coach/coach endpoint: Claude Sonnet 4.5 → coaching cue from movement
- [ ] Build /api/live-coach/speak endpoint: ElevenLabs TTS → audio stream
- [ ] Build LiveCoach.tsx page: camera feed + THE PANTHER SYSTEM overlay + real-time coaching cues
- [ ] Wire Claude THE PANTHER SYSTEM system prompt (NASM framework) into live coaching
- [ ] Add ANTHROPIC_API_KEY secret
- [ ] Add ELEVENLABS_API_KEY secret
- [ ] Integrate Claude-designed The Panther SystemChat.tsx (clean chat UI with memberData)
- [ ] Update server/routes/panther.ts with Claude Sonnet 4.5 backend
- [ ] Commit and push all changes to GitHub

## Home Screen — Real Data Integration
- [x] useProgress hook (localStorage scores, streak, sessions)
- [x] Home.tsx live scores from hook
- [x] Dynamic THE PANTHER SYSTEM greeting (time of day + name)
- [x] Today's corrective plan card (from last Assess)
- [x] Streak tracking card
- [x] Score increments when Correct session completes

## Body Composition Tracker
- [x] BodyComposition.tsx page — BMI, body fat %, 9 measurements form
- [x] U.S. Navy body fat % calculation (neck + waist + hips)
- [x] Measurement history chart (last 20 entries)
- [x] Wire into Profile screen as a tab
- [x] useBodyComp hook for localStorage persistence

## Feature Sprint — Tasks 1-5

### 1. Onboarding Flow
- [x] Onboarding.tsx — 3-step flow: Name → Goal → Primary Issue
- [x] First-launch detection (localStorage flag)
- [x] Pre-load corrective plan from selected issue
- [x] Wire THE PANTHER SYSTEM greeting to use entered name
- [x] Skip/back navigation between steps

### 2. Expanded Exercise Library
- [ ] 25+ corrective exercises with full NASM 4-phase progressions
- [ ] Cover all 8 compensation patterns from Assess screen
- [ ] Each exercise: sets, reps, hold time, coaching cue, NASM phase tag
- [ ] Update EXERCISE_STANDARDS in coaching.ts with new exercises

### 3. More Workout Programs
- [ ] Upper Body Day program (corrective warm-up + push/pull strength)
- [ ] Mobility Flow program (full-body corrective sequence)
- [ ] 40+ Recovery Day program (low-impact, joint-friendly)

### 4. Import TUF Programs from Drive
- [ ] Download and parse Maximum Overdrive program
- [ ] Download and parse Ass-Assassination 6-week program
- [ ] Structure both as week-by-week workout cards in Train screen

### 5. FUEL Section
- [ ] Fuel.tsx page — recipe browser with categories
- [ ] Import recipe book content from Drive
- [ ] Shopping list viewer (4 diet types)
- [ ] Restaurant guide viewer
- [ ] Wire FUEL nav item to new page

## CSS Premium Upgrade + Jotform Survey
- [ ] Dark premium CSS upgrade — Train page gradient cards, hierarchy, texture
- [ ] Carry CSS improvements to Home, Correct, Assess, Fuel screens
- [ ] Global CSS tokens — glow shadows, gradient utilities, card depth
- [ ] Jotform tester feedback survey (via MCP)

## Panther AI Trainer Spec (v4 Production)
- [ ] Generate real panther avatar image (replace emoji 🐆 across all screens)
- [ ] Upload panther avatar to CDN and wire into v4Components PantherPresence
- [ ] Replace emoji avatar in Home, Assess, Program, The Panther System, Evolve screens
- [ ] Align bottom nav to spec: Home | Train | Assess | Progress | Profile
- [ ] Add Progress screen stub (pain tracking, strength tracking, streaks)
- [ ] Add subscription tier badge to Evolve/Profile (Free / Core $19.99 / Elite $39.99 / Pro $79.99)
- [ ] Panther brand tone audit: ensure all copy matches "Calm. Dominant. Precise."
- [ ] Responsive layout: tablet split-screen, desktop 3-column
- [ ] Landing/marketing page: Hero + CTA + Features + Pricing
- [ ] Exercise library page with filters and detail cards

## Stripe Billing System
- [ ] Add Stripe npm packages (stripe, @stripe/stripe-js, @stripe/react-stripe-js)
- [ ] Add STRIPE_SECRET_KEY and VITE_STRIPE_PUBLISHABLE_KEY secrets
- [ ] Create Stripe products and prices (Free / Core $19.99 / Elite $39.99 / Pro $79.99)
- [ ] Create checkout session endpoint on server
- [ ] Create webhook endpoint for subscription status updates
- [ ] Add subscription tier to user table in DB
- [ ] Build Pricing screen with 4 tiers + 4 add-ons
- [ ] Build PaywallGate component for tier-based feature gating
- [ ] Build Billing Management screen (current plan, cancel, upgrade)
- [ ] Wire PaywallGate into BOA, Program, and Panther Brain screens

## 30-Day Challenge Image
- [x] Upload IMG_6650 (panther gym hero "YOUR 30-DAY CHALLENGE STARTS NOW") to CDN
- [x] Wire as hero banner on Challenge screen
- [x] Wire as Home card background for the challenge CTA

## Navigation Redesign — Command Center
- [x] Remove persistent bottom nav bar (TufBottomNav) from all screens
- [x] Rebuild Home as visual command center — full-width CTA + 2-col section cards with panther images
- [x] Upload panther character images to CDN for card backgrounds
- [x] Add back arrow on Challenge screen; other inner screens use header
- [x] 30-Day Challenge screen with day-by-day phase cards

## Panther Scheduler — Training Calendar + Push Notifications
- [x] Create Service Worker (public/sw.js) for push notification delivery
- [x] Build /schedule route — Panther Scheduler screen
- [x] Weekly calendar grid with training/rest/missed day states
- [x] Session creation modal — time, program, notes
- [x] Goal days per week setting (1–7)
- [x] Daily check-in system — Did you train? Rate session 1–5
- [x] Panther roar triggers — streak milestones, missed sessions, phase unlocks
- [x] .ics calendar export — one-tap "Add to Device Calendar"
- [x] Push notification permission flow with Panther framing
- [x] Schedule morning activation + pre-workout + post-session notifications
- [x] Add to Home Screen prompt for iOS push support (documented in settings)
- [x] Add Scheduler card to Home Command Center
- [x] Wire /schedule route in App.tsx

## Change Order: THE PANTHER SYSTEM → The Panther System (Doc 3 Execution)
- [ ] Rename panther-api.ts → panther-api.ts; update all exports, types, and QUICK_RESPONSES
- [ ] Update routes/coaching.ts — THE PANTHER SYSTEM_COACHING_PROMPT → PANTHER_COACHING_PROMPT, getThe Panther SystemCoachingCue → getPantherCoachingCue
- [ ] Rename routes/panther.ts → routes/panther.ts; update route paths /api/panther → /api/panther
- [ ] Update server/index.ts to import and mount new panther routes
- [ ] Rename The Panther SystemChat.tsx → PantherChat.tsx; update all UI strings and component name
- [ ] Update PantherAvatar.tsx aria-label from "THE PANTHER SYSTEM Panther" to "The Panther System"
- [ ] Update TufBottomNav.tsx nav item label THE PANTHER SYSTEM → PANTHER
- [ ] Update App.tsx routes /panther → /panther and import PantherChat
- [ ] Rewrite system prompt with full Panther Voice Laws (5 laws, HEADLINE/BODY/DIRECTIVE, 3 coaching modes, 40+ context)
- [ ] Update README.md — replace all The Panther System references with The Panther System
- [ ] Confirm zero The Panther System string references remain in codebase

## Full QA Pass
- [ ] Splash screen plays on fresh load
- [ ] Terms modal appears on first visit
- [ ] Home Command Center loads with all cards
- [ ] All nav cards route to correct screens
- [ ] Panther Brain returns real Claude AI response
- [ ] BOA Scan camera activates and flip works
- [ ] 30-Day Challenge screen loads with hero image
- [ ] Panther Scheduler loads and session creation works
- [ ] Social footer visible and links present
- [ ] Backend health endpoint returns anthropic: true
- [ ] Rate limiter returns 429 after 30 requests
- [ ] System prompt guard blocks jailbreak attempts
- [ ] TypeScript zero errors

## UX Fixes (QA Pass 2)
- [ ] Add ← HOME back navigation to Panther Brain, Assess, Program, and Evolve screens
- [ ] Replace emoji icons in Home Command Center cards with SVG icons
- [ ] Expand Home hero image to full-width banner
- [ ] Fill Panther Brain empty void with panther avatar background
- [ ] Fix Scheduler calendar date overflow bug (phantom dates 32-37)

## FUEL Pillar (Docs 05 + 06 — April 2026)

- [x] fuelCalculations.ts — RMR (Mifflin-St Jeor), TDEE (activity multiplier + age adjustment), daily targets, flag evaluation engine
- [x] Extend db.ts — UserFuelProfile, DailyFuelLog, MealEntry schemas + CRUD helpers
- [x] FUEL server route — /api/fuel/* (profile, log meal, get daily log, generate directive)
- [x] Claude FUEL directive generation — flag priority order, FUEL system prompt template
- [x] FUEL standalone screen — daily summary rings, meal log, Panther directive card, + Log Meal FAB
- [x] FUEL onboarding flow — collect weight/height/age/sex/activity/goal/conditions
- [x] FUEL nav card on Home Command Center
- [x] /fuel route registered in App.tsx
- [x] Condition overlay logic — diabetes, hypertension, joint inflammation stacking
- [x] TUTK food database connection — 43-recipe TUTK search in Log Meal modal
- [x] PROFILE screen FUEL tab — targets display, edit button, condition flags
- [x] Daily coaching feed FUEL card — flag-triggered directive display on Home
- [x] FuelTracker v2.0 — TUTK recipe search, delete meal, 7-day history bar chart

## Auth + Tier Gating (April 2026)

- [ ] Login button on Home / TufHeader — Manus OAuth getLoginUrl()
- [ ] User session context — read auth state from server
- [ ] Subscription tier stored in user DB record
- [ ] Stripe webhook → update user tier in DB on subscription event
- [ ] Tier gating — lock STEALTH/CONTROLLED/APEX features with upgrade prompts
- [ ] Migrate XP/streak/stage from localStorage to DB (PantherMemory)

## Panther Brain Voice (April 2026)

- [x] Voice toggle button in PantherBrain UI (speaker icon)
- [x] Auto-speak Claude responses via /api/voice/speak when toggle is ON
- [x] Voice preference persisted in localStorage

## Panther Animation Library (April 2026)

- [x] pantherAnimations.ts — 8 cinematic prompts with getAnimationForDay() helper
- [x] Animation Context Banner in Panther30.tsx session view (phase-aware emoji + gradient + label)

## Subscription Tier Gating (April 2026)

- [x] PaywallGate wired to /panther, /jarvis, /panther-brain (core tier)
- [x] PaywallGate wired to /boa (elite tier)
- [x] PaywallGate wired to /live (pro tier)
- [x] PaywallGate wired to /body-comp (core tier)

## FUEL Pillar (Docs 05 + 06 — April 2026)

- [x] fuelCalculations.ts — RMR (Mifflin-St Jeor), TDEE (activity multiplier + age adjustment), daily targets, flag evaluation engine
- [x] Extend db.ts — UserFuelProfile, DailyFuelLog, MealEntry schemas + CRUD helpers
- [x] FUEL server route — /api/fuel/* (profile, log meal, get daily log, generate directive)
- [x] Claude FUEL directive generation — flag priority order, FUEL system prompt template
- [x] FUEL standalone screen — daily summary rings, meal log, Panther directive card, + Log Meal FAB
- [x] FUEL onboarding flow — collect weight/height/age/sex/activity/goal/conditions
- [x] FUEL nav card on Home Command Center
- [x] /fuel route registered in App.tsx
- [x] Condition overlay logic — diabetes, hypertension, joint inflammation stacking
- [x] TUTK food database connection — 43-recipe TUTK search in Log Meal modal
- [x] PROFILE screen FUEL tab — targets display, edit button, condition flags
- [x] Daily coaching feed FUEL card — flag-triggered directive display on Home
- [x] FuelTracker v2.0 — TUTK recipe search, delete meal, 7-day history bar chart

## Auth + Tier Gating (April 2026)

- [ ] Login button on Home / TufHeader — Manus OAuth getLoginUrl()
- [ ] User session context — read auth state from server
- [ ] Subscription tier stored in user DB record
- [ ] Stripe webhook updates user tier in DB on subscription event
- [ ] Tier gating — lock STEALTH/CONTROLLED/APEX features with upgrade prompts
- [ ] Migrate XP/streak/stage from localStorage to DB (PantherMemory)

## Panther Brain Voice (April 2026)

- [ ] Voice toggle button in PantherBrain UI (speaker icon)
- [ ] Auto-speak Claude responses via /api/voice/speak when toggle is ON
- [ ] Voice preference persisted in localStorage
