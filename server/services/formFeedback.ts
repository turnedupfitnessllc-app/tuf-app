/**
 * Panther Brain — Form Feedback Service
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */

export interface PoseLandmarks {
  headForward?: number;
  shoulderRound?: number;
  hipFlexion?: number;
  kneeValgus?: number;
  pelvicTilt?: number;
  trunkLateral?: number;
  backRounding?: number;
  heelRise?: number;
}

export interface FormFeedback {
  score: number;           // 1-10
  compensations: string[];
  directives: string[];
  ucs_score: number;       // 0-1
  lcs_score: number;       // 0-1
  panther_mode: string;
}

export function analyzeForm(landmarks: PoseLandmarks, exerciseName?: string): FormFeedback {
  const feedback: string[] = [];
  const directives: string[] = [];

  // ── Compensation detection (per spec) ──────────────────────────────────────
  if (landmarks.kneeValgus && landmarks.kneeValgus > 0.25) {
    feedback.push("knee valgus");
    directives.push("Drive knees outward");
  }

  if (landmarks.backRounding && landmarks.backRounding > 0.3) {
    feedback.push("back rounding");
    directives.push("Keep chest up");
  }

  if (landmarks.headForward && landmarks.headForward > 0.45) {
    feedback.push("forward head posture");
    directives.push("Chin tuck — retract head");
  }

  if (landmarks.shoulderRound && landmarks.shoulderRound > 0.45) {
    feedback.push("shoulder rounding");
    directives.push("Retract scapula — pull shoulders back");
  }

  if (landmarks.hipFlexion && landmarks.hipFlexion > 0.55) {
    feedback.push("hip flexion dominance");
    directives.push("Activate glutes — drive hips through");
  }

  if (landmarks.pelvicTilt && landmarks.pelvicTilt > 0.5) {
    feedback.push("anterior pelvic tilt");
    directives.push("Brace core — neutral spine");
  }

  if (landmarks.heelRise && landmarks.heelRise > 0.3) {
    feedback.push("heel rise");
    directives.push("Ground through heels");
  }

  if (landmarks.trunkLateral && landmarks.trunkLateral > 0.3) {
    feedback.push("lateral trunk lean");
    directives.push("Keep torso upright");
  }

  // ── UCS / LCS scores ───────────────────────────────────────────────────────
  const ucs = Math.min(1,
    (landmarks.headForward ?? 0) * 0.4 +
    (landmarks.shoulderRound ?? 0) * 0.35 +
    (1 - (landmarks.hipFlexion ?? 0.5)) * 0.25
  );

  const lcs = Math.min(1,
    (landmarks.hipFlexion ?? 0) * 0.4 +
    (landmarks.pelvicTilt ?? 0) * 0.35 +
    (landmarks.kneeValgus ?? 0) * 0.25
  );

  const maxScore = Math.max(ucs, lcs);
  const pantherMode = maxScore > 0.65 ? "ATTACK" : maxScore > 0.4 ? "PRECISION" : "STEALTH";

  // ── Form score (inverse of compensation severity) ─────────────────────────
  const penaltyPerCompensation = 1.2;
  const rawScore = 10 - (feedback.length * penaltyPerCompensation);
  const score = Math.max(1, Math.min(10, Math.round(rawScore)));

  return {
    score,
    compensations: feedback,
    directives,
    ucs_score: Math.round(ucs * 100) / 100,
    lcs_score: Math.round(lcs * 100) / 100,
    panther_mode: pantherMode,
  };
}
