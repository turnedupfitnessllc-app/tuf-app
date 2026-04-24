
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

## FEAST Pillar (Docs 10 + 11 + Prompt — April 2026)

- [ ] WeeklyMealPlan, DayPlan, PlannedMeal, ShoppingItem types in db.ts + CRUD helpers
- [ ] feastEngine.ts — generateWeeklyPlan, swapMeal, generateShoppingList, evaluateFeastLog
- [ ] Panther FEAST system prompt (PANTHERFEASTPROMPT.pdf) wired into feastEngine.ts
- [ ] /api/feast server route — generate plan, swap meal, get plan, shopping list, FEAST directive
- [ ] Feast.tsx v2.0 — 4-tab screen: THIS WEEK, RECIPES, SHOPPING, DATABASE
- [ ] THIS WEEK tab — 7-day calendar, 5 meal slots/day, macro bar, swap button, Panther directive
- [ ] RECIPES tab — filter bar, recipe cards, recipe detail with pantherNote, save/add to week
- [ ] SHOPPING tab — weekly list grouped by category, check-off, budget filter, share
- [ ] DATABASE tab — 1,800-food search, filter by category/condition/regional, log to FUEL
- [ ] FEAST + FUEL cross-pillar condition flag sync
- [ ] Core tier upgrade prompt on FEAST nav icon

## Bugs (April 2026)

- [ ] Purchase error — "reading error" when trying to buy a program/subscription on Pricing/Billing screen

## Voice API (April 2026)

- [ ] POST /api/voice/generate — ElevenLabs TTS, async job, returns { voice_id, status }
- [ ] GET /api/voice/:id — poll job status, returns { status, url } when audio ready
- [ ] Client-side useVoicePlayer hook — polls until complete, plays audio

## BOA Biomechanical Overlay Analysis (April 2026)

- [x] Install @tensorflow/tfjs and @tensorflow-models/pose-detection
- [x] BOA.tsx — camera feed + MoveNet pose detection + keypoint canvas overlay
- [ ] Rep counter — getAngle(a,b,c) joint angle function in BiomechanicalOverlay.tsx
- [ ] Stage tracking (up/down) per exercise mode using knee/hip/elbow angles
- [ ] repCount state + stageRef wired into analyzePose loop
- [ ] Voice cue trigger on rep completion (playVoiceCue via /api/voice/generate)
- [ ] Rep counter UI card: live count, stage indicator, reset button
- [ ] Dysfunction scoring — UCS/LCS/knee/shoulder flags from keypoint deviations

## Theme Toggle Fix (Doc 12 — April 2026)

- [ ] ThemeContext.tsx — toggleTheme(), isDark, localStorage persistence
- [ ] CSS variable system in index.css — 17 dark + 17 light tokens
- [ ] Theme toggle button — calls toggleTheme() from context, Sun/Moon icon swap
- [ ] Nav bar — use var(--nav-bg), var(--nav-active), var(--nav-inactive) tokens
- [ ] Screen backgrounds — replace hardcoded #0A0A0A with var(--bg-primary)
- [ ] Text colors — replace hardcoded #FFFFFF/#AAAAAA with var(--text-primary)/var(--text-secondary)
- [ ] Verification checklist: toggle works, persists on reload, all screens respond

## Full 7-Screen Architecture + Monetization Funnel (April 2026)

### Monetization Tiers
- Free → 7-Day Plan (auto-assigned on onboarding)
- $19 → 30-Day Panther Program
- $79 → Advanced System (12-week)
- $20/month → Membership (live sessions + AI coaching + exclusive programs)

### Upsell Trigger Logic
- [ ] useUpsell hook — checks tier + workouts_completed, fires modal at right time
- [ ] Free user completes 3 workouts → UpsellModal("starter") → $19 Stripe checkout
- [ ] Starter user completes 14 workouts → UpsellModal("advanced") → $79 Stripe checkout
- [ ] Advanced user 30+ days active → UpsellModal("member") → $20/mo Stripe subscription
- [ ] UpsellModal dismiss stores tuf_upsell_dismissed_{tier} (re-shows after 3 days)

### Onboarding Upgrade
- [ ] Add program assignment step — Free 7-day auto-assigned, paid tiers shown as upgrade
- [ ] Store tier: tuf_tier = "free" | "starter" | "advanced" | "member"
- [ ] Store full profile: { name, goal, issue, tier, joinDate, mobilityScore:7, strengthScore:6 }
- [ ] Add age + fitness level step (40+ athlete targeting)
- [ ] Show personalized program assignment screen at onboarding end

### Dashboard (Home) Upgrade
- [ ] Add "TODAY'S WORKOUT" card at top — pulls from assigned program day
- [ ] Add stats row: streak | workouts_completed | mobility_score | strength_score
- [ ] Add tier badge (FREE / STARTER / ADVANCED / MEMBER) with upgrade CTA
- [ ] Wire upsell triggers to dashboard load

### Daily Workout Upgrade
- [ ] Add performance logging: reps_completed, form_score (1-10), difficulty_felt
- [ ] Post-workout Panther Brain analysis card (AI feedback based on scores)
- [ ] Update mobility_score + strength_score in localStorage after each session
- [ ] Adapt program logic: if form_score < 6 → reduce reps next session
- [ ] Wire SuccessScreen to show Panther Brain feedback message

### Progress Tracker
- [ ] Streak calendar (30-day grid, completed days highlighted)
- [ ] mobility_score and strength_score as progress bars with history
- [ ] Phase progress bar (Control → Stability → Strength → Explosion → Evolution)
- [ ] Workout history list (date, workout name, form score, XP earned)
- [ ] Weekly summary card

### Program Library
- [ ] ProgramLibrary.tsx — 3 tiers: Free 7-day, $19 30-day, $79 Advanced
- [ ] Program detail screen with day-by-day breakdown
- [ ] Lock paywalled programs behind PaywallGate
- [ ] "Currently Active" badge on assigned program

### Membership / Live Training
- [ ] Upgrade LiveCoaching.tsx — show membership benefits clearly
- [ ] Live session schedule (calendar view)
- [ ] $20/mo membership CTA with Stripe checkout
- [ ] UpsellModal component (reusable, tier-aware)

### Panther Brain Post-Workout Analysis
- [ ] POST /api/panther-brain/analyze — accepts { streak, workouts_completed, mobility_score, strength_score, form_score }
- [ ] Returns { headline, feedback, directive, adaptation }
- [ ] Store adaptation in localStorage → next workout adjusts reps/tempo
- [ ] Display in SuccessScreen as "PANTHER ANALYSIS" card

### BOA Visual System (from BOAVisualSystem.pdf)
- [ ] Build BOA_VisualSystem.tsx — BOAWindow (full/compact/mini sizes)
- [ ] BOAEvalScreen — INTRO → SCAN (15s) → ANALYSIS → RESULTS phases
- [ ] BOAWorkoutScreen — live BOA window + exercise tracker + set logger
- [ ] drawPoseSkeleton — MediaPipe-style stick figure on canvas
- [ ] Live cues: headForward, shoulderRound, hipFlexion, kneeValgus, pelvicTilt
- [ ] Panther mode colors: STEALTH (#00aaff) / PRECISION (gold) / ATTACK (#ff2222)
- [ ] Wire BOAEvalScreen into /boa route (replace current BiomechanicalOverlay)

### Season Leaderboard
- [ ] SeasonLeaderboard.tsx — monthly season with Apex Badge (top 10) / Hunter Badge (top 100)
- [ ] Server: GET /api/season/current — returns season_id, dates, leaderboard, rewards
- [ ] Server: POST /api/season/submit-score — updates user's season XP
- [ ] /season-leaderboard route in App.tsx

### PvP Live Challenge (Socket.io)
- [ ] server/socket.ts — Socket.io server integrated into Express
- [ ] Events: join_challenge, rep_update, endChallenge (winner = highest reps)
- [ ] Challenge state: { challenge_id, name, type, duration, participants, status }
- [ ] PvPScreen.tsx — live leaderboard, rep button, countdown timer, winner screen
- [ ] /pvp route in App.tsx
- [ ] PvP entry point on Home screen

### Final Polish + Push
- [ ] Commit all changes to GitHub
- [ ] Build check (npx vite build)

## Socket.io PvP — Real Opponent + Bot Fallback (April 2026)
- [ ] server/socket.ts — Socket.io attached to HTTP server, challenge rooms, rep broadcast, bot fallback
- [ ] client/src/hooks/usePvPSocket.ts — connect, join_challenge, rep_update, challenge_update, challenge_end
- [ ] Wire usePvPSocket into PvPChallenge.tsx — real opponent when matched, bot when solo
- [ ] Update ElevenLabs Voice ID in server/routes/voice.ts

## Unit Conversions & Food Library — Session Apr 24 2026
- [x] Create shared/units.ts with full kg/lbs/cm/inches/oz/g conversion utilities
- [x] Create client/src/hooks/useUnitPreference.ts React hook for global unit toggle
- [x] Wire unit toggle into BodyComposition.tsx (weight, height, body fat inputs + display)
- [x] Add unit_preference field to User interface in server/db.ts
- [x] Add IMPERIAL ⇄ METRIC toggle button to Profile.tsx
- [x] Export 1,802-item food library from Google Drive Excel to JSON (shared/foodLibrary.json)
- [x] Create shared/foodLibraryService.ts with searchFoods(), getFoodsByGroup(), getFoodMacros()
- [x] Create client/src/components/FoodLibrarySearch.tsx (search + serving size + macro display)
- [x] Wire FoodLibrarySearch into FuelTracker.tsx as third tab "📚 1,802" in log-meal modal

## Panther Alarm — Session Apr 24 2026
- [x] Add AlarmEntry interface to Schedule.tsx SchedulerState
- [x] Add scheduleAlarmViaSW() helper function using service worker SCHEDULE_ALARM message
- [x] Build Panther Alarm manager UI in Schedule settings panel (+ ADD ALARM button)
- [x] Alarm card: time picker (large Bebas Neue font), on/off toggle, label input
- [x] Alarm card: type selector (🌅 MORNING / 💪 PRE-WORK / 🔔 CUSTOM)
- [x] Alarm card: day-of-week selector pills (Su Mo Tu We Th Fr Sa)
- [x] Alarm card: SCHEDULE THIS ALARM button (fires service worker)
- [x] Upgrade sw.js to support SCHEDULE_ALARM with snooze, vibrate, requireInteraction

## Video Awareness & Movement Display — Session Apr 24 2026
- [x] Create shared/movementCues.ts with MovementCue, ExerciseCueSet types and 11-exercise database
- [x] Create client/src/components/MovementCueDisplay.tsx — phase-by-phase cue overlay
- [x] Wire MovementCueDisplay into WorkoutPlayer.tsx below exercise video
- [x] Phase selector pills (SETUP → BRACE → DOWN → HOLD → DRIVE → LOCK → RESET)
- [x] Auto-advance phases on each rep tap
- [x] Critical cue flash (red border pulse on priority=critical cues)
- [x] Focus area tap → speaks cue via Panther Voice
- [x] Tap-to-expand for full coaching detail + error_flag warning
- [x] Rep tempo + breathing pattern display
- [x] Spreadsheet column format documented for adding new exercises

## Settings System — Full Build (Apr 24 2026)

### Profile Setup
- [ ] Full profile setup flow: name, age, sex, height, weight (with unit toggle)
- [ ] Profile photo / avatar upload (stored in S3)
- [ ] Fitness goal selector: Fat Loss / Muscle Gain / Athletic Performance / Mobility / General Health
- [ ] Experience level: Beginner / Intermediate / Advanced / Athlete
- [ ] Health conditions multi-select: diabetes, hypertension, joint inflammation, heart condition, pregnancy, other
- [ ] Injury history: current injuries, movement restrictions (affects program recommendations)
- [ ] Emergency contact info (name + phone)

### Fitness Preferences
- [ ] Preferred workout days (day-of-week checkboxes)
- [ ] Preferred workout time: Morning / Midday / Evening / Late Night
- [ ] Session duration preference: 20 / 30 / 45 / 60 / 90 min
- [ ] Equipment available: bodyweight / dumbbells / barbell / resistance bands / cables / machines / kettlebells / pull-up bar
- [ ] Training environment: Home / Gym / Outdoor / Hotel
- [ ] Rest day activity: Active Recovery / Full Rest / Light Cardio / Yoga/Stretch

### Nutrition Preferences
- [ ] Dietary style: Standard / Vegetarian / Vegan / Keto / Paleo / Mediterranean / Gluten-Free
- [ ] Food allergies/intolerances: dairy, gluten, nuts, shellfish, eggs, soy
- [ ] Meal frequency preference: 2 / 3 / 4 / 5 / 6 meals per day
- [ ] Water intake goal (oz/day) with reminder toggle
- [ ] Supplement stack: protein powder, creatine, pre-workout, vitamins

### Smart Devices and Integrations
- [ ] Apple Health connect (Web API bridge - read steps, HR, sleep, active calories)
- [ ] Google Fit connect (OAuth - read steps, HR, workouts)
- [ ] Garmin connect (OAuth - read HR, VO2max, HRV, sleep)
- [ ] Fitbit connect (OAuth - read steps, HR, sleep stages)
- [ ] Whoop connect (API - read strain, recovery, sleep)
- [ ] Heart rate monitor pairing (Web Bluetooth API - HR strap)
- [ ] Smart scale integration: Withings / Renpho / Eufy
- [ ] Device connection status indicators (connected / not connected / last sync)

### Notifications and Reminders
- [ ] Workout reminder toggle + time picker
- [ ] Rest day reminder toggle
- [ ] Hydration reminders (every X hours toggle)
- [ ] Meal/nutrition reminder toggle + times
- [ ] Weekly progress report toggle (Sunday summary)
- [ ] Panther motivational push toggle (daily Panther quote)
- [ ] Streak at-risk warning toggle (no training in 2 days)
- [ ] Notification sound: Panther Roar / Standard / Silent

### App Preferences
- [ ] Unit system toggle: Imperial / Metric (move from Profile to here)
- [ ] Theme: Dark (default) / Light / System
- [ ] Language: English (placeholder for future localization)
- [ ] Coach voice: Marc (Panther) / Female / Neutral
- [ ] Coach mode: Motivational / Technical / Calm / Drill Sergeant
- [ ] Display density: Compact / Standard / Comfortable
- [ ] Haptic feedback toggle
- [ ] Auto-play exercise videos toggle
- [ ] Show movement cues toggle (Video Awareness on/off)

### Account and Privacy
- [ ] Account info: email, member since, subscription tier badge
- [ ] Change display name
- [ ] Subscription management link to /billing
- [ ] Data export: download all my data (JSON)
- [ ] Delete account with confirmation modal
- [ ] Privacy: analytics opt-out toggle
- [ ] Privacy: share progress with leaderboard toggle
- [ ] Terms of Service and Privacy Policy links
- [ ] Sign out button

### Settings Navigation
- [x] Create client/src/pages/Settings.tsx full settings screen
- [x] Settings sections: Profile / Fitness / Nutrition / Devices / Notifications / App / Account
- [x] Section headers with icons, tap to expand/collapse
- [x] Back button to Profile or Home
- [x] Wire /settings route in App.tsx
- [x] Add Settings gear icon to Profile screen header
- [x] Add Settings entry point to Home Command Center profile card


## Panther Voice System v2.0
- [x] Upgrade usePantherVoice hook — streaming TTS, Web Audio waveform, personality presets, queue
- [x] Upgrade /api/voice/speak/stream — ElevenLabs streaming endpoint for low-latency first-byte
- [x] Personality presets: calm_intense / motivational / drill_sergeant / recovery / technical
- [x] Per-personality voice_settings (stability, style, similarity_boost)
- [x] Per-personality exercise cue library (7 exercises x 4 personalities)
- [x] PantherVoiceBar component — floating waveform visualizer with personality badge
- [x] VoiceRecordingGuide component — step-by-step guide for Marc to record his voice in ElevenLabs
- [ ] Wire PantherVoiceBar into WorkoutPlayer, JarvisChat, LiveCoaching
- [ ] Wire VoiceRecordingGuide into Settings -> App Preferences -> Coach Voice
- [ ] Add personality selector to WorkoutPlayer (tap to switch mode mid-workout)
- [ ] Pre-warm voice cache on workout start (generate first 3 exercise cues in background)

## Missing and Unique Components — Research Findings

### HIGH PRIORITY (differentiators no other app has)
- [ ] AI Adaptive Workout Engine — detects fatigue from rep velocity drop, auto-adjusts weight/reps
- [ ] Predictive Burnout Detector — tracks trend + missed sessions, warns before dropout
- [ ] Biomechanical Risk Score — real-time injury risk score per exercise based on form + fatigue
- [ ] Voice-Activated Workout Control — next exercise, skip set, how many reps left via mic
- [ ] Panther Daily Brief — morning audio message from Panther (personalized to today workout + goals)
- [ ] Smart Rest Timer — auto-adjusts rest period based on heart rate recovery (wearable data)
- [ ] Workout Mood Check-In — pre-workout 1-tap mood selector, Panther adjusts intensity + cues

### MEDIUM PRIORITY (strong retention features)
- [ ] Progress Photo Timeline — side-by-side body comp photos with AI overlay comparison
- [ ] Strength Standards Tracker — shows where user ranks vs population per lift
- [ ] Weekly Readiness Score — composite score from sleep, soreness, mood — green/yellow/red
- [ ] Muscle Heat Map — body diagram showing which muscles were trained this week
- [ ] Personal Records Wall — trophy case for PRs with date, video clip, and Panther reaction
- [ ] Challenge Creator — user can create custom challenges and invite friends
- [ ] Workout Sharing Card — auto-generated shareable image of completed workout

### UNIQUE TO TUF (brand differentiators)
- [ ] Panther Roar Moment — special animation + voice when user hits a PR or streak milestone
- [ ] TUF Score — composite fitness score (strength + cardio + consistency + nutrition) weekly
- [ ] Coach Marc Live Sessions — scheduled live coaching sessions with push notification reminders
- [ ] Transformation Timeline — visual journey from Day 1 to today with key milestones marked
- [ ] Accountability Partner System — pair with another user for mutual check-ins and challenges

### SMART DEVICE INTEGRATIONS (when OAuth is ready)
- [ ] Apple Health sync — read HRV, sleep, steps, active calories; write workout data
- [ ] Google Fit sync — bidirectional workout and health data
- [ ] Garmin Connect sync — advanced metrics (VO2 max, training load, recovery advisor)
- [ ] Whoop integration — strain score, recovery, sleep performance feed into Panther AI
- [ ] Bluetooth HR Monitor — live heart rate during workout, smart rest timer + intensity zones

### CALENDAR AND PANTHER ALARM
- [ ] Alarm UI in Schedule settings — time picker, alarm type, snooze duration
- [ ] Alarm types: MORNING ACTIVATION / PRE-WORKOUT / RECOVERY / CUSTOM
- [ ] Panther speaks the alarm (ElevenLabs) instead of a standard beep
- [ ] Calendar view — monthly grid with workout sessions, rest days, streaks marked
- [ ] Recurring workout schedule builder — set M/W/F pattern, auto-populates calendar

### VIDEO AWARENESS SYSTEM
- [ ] MovementCueDisplay wired into WorkoutPlayer (done — needs testing)
- [ ] Camera-based rep counter using MediaPipe Pose (BiomechanicalOverlay already has this)
- [ ] Form error detection — Panther speaks correction immediately
- [ ] Post-workout form report — summary of form errors detected during session
- [ ] Exercise demo video library — short clips for each exercise (upload to S3)
- [ ] Split-screen mode — user camera + demo video side by side
- [ ] Data output: movement cue data exportable to Google Sheets / CSV for trainer review
