# Panther System — Master Spec Reference
© 2026 Turned Up Fitness LLC. All rights reserved.

---

## BOA Visual System v1.0

### Color Tokens
```js
const B = {
  bg: "#080808", red: "#8B0000", redLight: "#A50000",
  gold: "#C8973A", white: "#F2F2F2", dim: "rgba(242,242,242,0.45)",
  gray: "#1A1A1A", grayMid: "#242424"
};
```

### Panther Mode Color Map
```js
const MODE_COLOR = {
  STEALTH:   { primary:"#00aaff", glow:"rgba(0,150,255,0.5)",   label:"STEALTH" },
  PRECISION: { primary:B.gold,    glow:"rgba(200,151,58,0.5)",  label:"PRECISION" },
  ATTACK:    { primary:"#ff2222", glow:"rgba(255,30,30,0.6)",   label:"ATTACK" },
};
```

### Pose Landmarks (MediaPipe indices)
```js
const POSE_LANDMARKS = {
  NOSE:0, L_EYE:2, R_EYE:5, L_SHOULDER:11, R_SHOULDER:12,
  L_ELBOW:13, R_ELBOW:14, L_HIP:23, R_HIP:24,
  L_KNEE:25, R_KNEE:26, L_ANKLE:27, R_ANKLE:28,
};
```

### simulateDetection(frameCount)
Returns: `{ landmarks: { headForward, shoulderRound, hipFlexion, kneeValgus, pelvicTilt, trunkLateral }, confidence, fps }`

### calcUCS(d) / calcLCS(d) / derivePantherMode(ucs, lcs)
- UCS = headForward*0.4 + shoulderRound*0.35 + (1 - hipFlexion)*0.25
- LCS = hipFlexion*0.4 + pelvicTilt*0.35 + kneeValgus*0.25
- Mode: ATTACK if max>0.65, PRECISION if max>0.4, else STEALTH

### BOAWindow Props
- size: "full" | "compact" | "mini"
- showSkeleton: bool
- onDetection: callback(detectionResult)
- modeOverride: string
- label: string
- active: bool

### Canvas Dims
- full: w:100%, h:320, skeleton:true
- compact: w:100%, h:220, skeleton:true
- mini: w:100%, h:140, skeleton:false

### Canvas Render Loop
1. Fill #060608 base
2. Perspective grid (32px lines, rgba(0,0,0,0.6))
3. drawPoseSkeleton if showSkeleton && size!=="mini"
4. Scan line (linear gradient, 16px band)
5. Corner brackets (4 corners, bSize:18, bThick:2)
6. Mode badge top-left (90×22 roundRect, Barlow Condensed 10px)
7. Confidence+FPS top-right (W-80 position)
8. BOA label bottom (H-28 strip)
9. UCS/LCS bars bottom-right (barW:80, barH:5)

### drawPoseSkeleton(ctx, W, H, lm, color, frame)
Key points: head, neck, lSho, rSho, lElbow, rElbow, lWrist, rWrist, hip, lHip, rHip, lKnee, rKnee, lAnkle, rAnkle
Bones: head-neck, neck-lSho, neck-rSho, lSho-lElbow, lElbow-lWrist, rSho-rElbow, rElbow-rWrist, neck-hip, hip-lHip, hip-rHip, lHip-lKnee, lKnee-lAnkle, rHip-rKnee, rKnee-rAnkle
Annotations: FWD HEAD arrow (headForward>0.45), APT arc (pelvicTilt>0.45)

### Live Cues (from detection)
- headForward>0.45 → UCS: "CHIN TUCK — Head Forward Detected"
- shoulderRound>0.45 → UCS: "RETRACT SCAPULA — Shoulder Rounding"
- hipFlexion>0.55 → LCS: "ACTIVATE GLUTES — Hip Flexion Dominance"
- kneeValgus>0.25 → LCS: "DRIVE KNEES OUT — Valgus Collapse"
- pelvicTilt>0.5 → LCS: "BRACE CORE — Anterior Pelvic Tilt"
- none → OK: "FORM CLEAN — Panther Mode Active"

### BOAEvalScreen Phases
INTRO → SCAN (15s timer, 100ms tick) → ANALYSIS (2s) → RESULTS
- avgDetection = mean of history (last 60 frames)
- Shows: UCS score, LCS score, mode, corrective prescriptions

### BOAWorkoutScreen
- Left: BOAWindow compact + live cues
- Right: workout exercise list with completion tracking

---

## Panther Backend Architecture

### Directory Structure
```
server/
  services/
    workoutGenerator.ts   — generateWorkout(user)
    videoGenerator.ts     — generateExerciseVideo(exercise)
    formFeedback.ts       — analyzeForm(landmarks)
  controllers/
    workoutController.ts
    userController.ts
    videoController.ts
  models/
    User.ts               — name, age, fitness_level, goal, equipment, stats
    Exercise.ts           — name, pattern, difficulty, equipment, primary_muscles, video_prompt, tags
    WorkoutSession.ts     — user_id, exercises[], completed, performance{reps,duration,score}
  middleware/
    auth.ts               — JWT validation
    rateLimit.ts          — API rate limiting
    logger.ts             — request logging
```

### workoutGenerator.generateWorkout(user)
```js
{ goal, level, equipment } → workout[]
fat_loss → full_body_circuit
resistance_band → band_squat, band_row, band_press
else → pushup, squat, plank
advanced → explosive_jump_squat
```

### videoGenerator.generateExerciseVideo(exercise)
```js
prompt = `Cinematic fitness video of ${exercise.name}. Style: dark, neon, high-performance athlete. Focus: perfect form demonstration.`
returns { video_url, prompt_used }
```

### Video Pipeline
1. User selects workout
2. Panther Brain selects exercises
3. video_prompt sent to AI generator
4. Video returned + cached
5. Served in workout player

### Form Feedback Logic
```js
if (knees_caving_in) feedback.push("Drive knees outward")
if (back_rounding) feedback.push("Keep chest up")
```

### Stripe Subscription
```js
stripe.subscriptions.create({ customer: customerId, items: [{ price: "elite_plan_id" }] })
```

### Live Server (Socket.io)
```js
socket.on("rep_update", (data) => io.emit("leaderboard_update", data))
```

---

## React Native App Structure
```
panther-app/
├── screens/
│   ├── HomeScreen.js      — "Today's Hunt", Start Workout CTA
│   └── WorkoutScreen.js   — rep counter, Add Rep button
├── components/
├── navigation/
├── services/
└── assets/
```

---

## Data Models

### User
```js
{ name, age, fitness_level, goal, equipment: [], stats: { workouts_completed, streak, performance_score } }
```

### Exercise
```js
{ name, pattern, difficulty, equipment: [], primary_muscles: [], video_prompt, tags: [] }
```

### WorkoutSession
```js
{ user_id, exercises: [], completed, performance: { reps, duration, score } }
```
