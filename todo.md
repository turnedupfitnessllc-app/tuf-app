
## Claude AI Integration
- [ ] Replace JARVIS mock responses with real Claude API calls (Anthropic SDK)
- [ ] Add Claude system prompt with TUF fitness coaching persona
- [ ] Wire PopHIVE health context into Claude system prompt
- [ ] Add streaming support to JARVIS chat interface
- [ ] Add ANTHROPIC_API_KEY to TUF App environment
- [ ] "Powered by Grok" card in JARVIS section linking to Grok Explorer

## Banner Refinement
- [x] Minimize Powered by Grok banner — compact subtle badge, does not compete with TUF branding

## JARVIS Alive — Phase 1 (Full Build)
- [ ] Upload JARVIS videos to CDN
- [ ] Dark theme variant — cinematic black/orange gym aesthetic
- [ ] Light theme variant — clean premium white/orange
- [ ] Theme toggle so users can switch between dark and light
- [ ] JARVIS video avatar integrated into chat page (idle loop + action clips)
- [ ] Real Grok AI streaming responses (grok-4.20-reasoning)
- [ ] JARVIS onboarding — 3 questions on first visit to build user profile
- [ ] Store user profile in database for personalized context
- [ ] Voice input (Web Speech API mic button)
- [ ] Voice output (TTS — JARVIS speaks responses)
- [ ] Jotform survey for theme feedback collection

## OLD JARVIS Alive — Phase 1
- [ ] Wire real Grok AI (grok-4.20-reasoning) streaming responses into JARVIS
- [ ] JARVIS system prompt with TUF fitness coaching persona and PopHIVE health context
- [ ] Data gathering — JARVIS asks onboarding questions (age, goals, health conditions, fitness level)
- [ ] Store user profile in database for personalized context on every message
- [ ] JARVIS video avatar — animated idle and speaking states
- [ ] Voice input — microphone button with speech-to-text (Web Speech API)
- [ ] Voice output — JARVIS speaks responses aloud (text-to-speech)
- [ ] Push/pull toggle between text and voice modes

## JARVIS Motion Generation — Kling AI Phase 1
- [ ] Set up fal.ai API key secret in TUF App
- [ ] Extract best JARVIS still frame from panther video for motion reference image
- [ ] Build server-side /api/jarvis/motion endpoint calling Kling v3 motion control
- [ ] Motion keyword mapper — detect topic in JARVIS response and select matching reference video
- [ ] Update JARVIS chat UI to trigger motion generation asynchronously while streaming response
- [ ] Display generated motion clip when ready, fallback to pre-recorded clips if generation fails
- [ ] Commit and push all changes to GitHub

## Live Coaching Pipeline — Real-Time AI Vision
- [ ] Build camera capture module (getUserMedia, canvas frame every 3s, base64 JPEG)
- [ ] Build /api/live-coach/analyze endpoint: fal.ai vision → movement description
- [ ] Build /api/live-coach/coach endpoint: Claude Sonnet 4.5 → coaching cue from movement
- [ ] Build /api/live-coach/speak endpoint: ElevenLabs TTS → audio stream
- [ ] Build LiveCoach.tsx page: camera feed + JARVIS overlay + real-time coaching cues
- [ ] Wire Claude JARVIS system prompt (NASM framework) into live coaching
- [ ] Add ANTHROPIC_API_KEY secret
- [ ] Add ELEVENLABS_API_KEY secret
- [ ] Integrate Claude-designed JarvisChat.tsx (clean chat UI with memberData)
- [ ] Update server/routes/jarvis.ts with Claude Sonnet 4.5 backend
- [ ] Commit and push all changes to GitHub

## Home Screen — Real Data Integration
- [x] useProgress hook (localStorage scores, streak, sessions)
- [x] Home.tsx live scores from hook
- [x] Dynamic JARVIS greeting (time of day + name)
- [x] Today's corrective plan card (from last Assess)
- [x] Streak tracking card
- [x] Score increments when Correct session completes

## Body Composition Tracker
- [x] BodyComposition.tsx page — BMI, body fat %, 9 measurements form
- [x] U.S. Navy body fat % calculation (neck + waist + hips)
- [x] Measurement history chart (last 20 entries)
- [x] Wire into Profile screen as a tab
- [x] useBodyComp hook for localStorage persistence
