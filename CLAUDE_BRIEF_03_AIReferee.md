# Claude Brief 03 — AI Referee (BOA Upgrade)
**Send this to Claude when ready for Day 8**

---

## Context

The TUF App has a BOA (Biomechanical Overlay Analysis) page that uses the device camera and MediaPipe Pose to detect body landmarks. It currently does basic motion detection but does not validate exercise-specific form using joint angles.

I need a **React component** (TypeScript/TSX) that upgrades the BOA with an AI Referee — it watches the user perform an exercise and calls good/bad reps based on actual joint angles.

## What I Need From You

A complete `AIReferee.tsx` React component that I can drop into `client/src/components/AIReferee.tsx`.

## Requirements

### Input Props
```ts
interface AIRefereeProps {
  exercise: 'squat' | 'pushup' | 'plank' | 'lunge' | 'deadlift';
  landmarks: MediaPipeLandmark[] | null;  // 33 landmarks from MediaPipe Pose
  onRepCounted: (repData: RepData) => void;
  onFormFeedback: (feedback: FormFeedback) => void;
}

interface RepData {
  repNumber: number;
  formScore: number;    // 0–100
  phase: 'down' | 'up' | 'hold';
  jointAngles: Record<string, number>;
}

interface FormFeedback {
  severity: 'good' | 'warning' | 'error';
  message: string;       // Short cue e.g. "Drive knees out"
  joint: string;         // Which joint triggered it e.g. "left_knee"
}
```

### Exercise Validation Rules

**Squat:**
- Good rep: knee angle 90–110° at bottom, hip angle < 100°, knee tracks over toes
- Warning: knee valgus (knee angle asymmetry > 15°)
- Error: forward lean (torso angle > 45° from vertical)

**Push-up:**
- Good rep: elbow angle < 90° at bottom, body straight (hip angle 170–190°)
- Warning: hip sag (hip angle < 160°)
- Error: elbow flare (elbow angle > 90° at bottom with wide elbows)

**Plank:**
- Hold validation: hip angle 170–190° (straight line), no sag or pike
- Warning: hip drop below 160°
- Error: hip pike above 200°

**Lunge:**
- Good rep: front knee 90°, back knee near floor, torso upright
- Warning: front knee past toes
- Error: torso lean > 20°

### Rep Counting Logic
- State machine: `idle → descending → bottom → ascending → top → idle`
- Transition triggers based on primary joint angle thresholds per exercise
- Debounce: minimum 0.5 seconds between rep counts

### Visual Overlay
- Draw skeleton lines over the camera feed using SVG
- Color code joints: green = good, yellow = warning, red = error
- Display current joint angles as small labels near each joint
- Show rep counter and form score in top-right corner

## Technical Constraints

- React 19 + TypeScript
- MediaPipe landmarks are already computed by the parent BOA component — this component only receives them as props
- Use SVG for overlay rendering (no canvas)
- No external dependencies beyond React
- Must work on mobile browser (no native APIs)
- The component renders nothing when `landmarks` is null

## Output Format

Single `.tsx` file with full TypeScript types. No test file needed.

---
_TUF App — Turned Up Fitness LLC © 2026_
