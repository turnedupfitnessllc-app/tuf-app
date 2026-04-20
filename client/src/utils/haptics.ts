/**
 * Panther System Haptics Utility
 * Provides physical feedback for key interactions on mobile devices.
 * Doc 18 — Section 12
 */

export const haptics = {
  /** Light tap — navigation, selection */
  light: () => {
    if ("vibrate" in navigator) navigator.vibrate(10);
  },
  /** Medium — completing a rep, logging a meal */
  medium: () => {
    if ("vibrate" in navigator) navigator.vibrate(25);
  },
  /** Heavy — session complete, phase unlock, payment success */
  heavy: () => {
    if ("vibrate" in navigator) navigator.vibrate([30, 10, 30]);
  },
  /** Success pattern — Panther directive received */
  success: () => {
    if ("vibrate" in navigator) navigator.vibrate([10, 50, 20]);
  },
};
