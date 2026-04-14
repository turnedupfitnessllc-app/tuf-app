/**
 * THE PANTHER SYSTEM — DIRECTIVE CACHE
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 *
 * In-memory cache to prevent duplicate Claude API calls.
 * Rate limits per Doc 13:
 *   MOVE:    1 call per exercise session (session-scoped TTL)
 *   FUEL:    1 call per day (24hr TTL)
 *   MINDSET: 1 call per daily check-in (24hr TTL)
 *   FEAST:   2 calls per day (12hr TTL per call)
 *   PHASE:   1 call per phase change (session-scoped)
 */

import type { PantherDirective } from './pantherAPI';

interface CacheEntry {
  directive: PantherDirective;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

// ── PUBLIC API ─────────────────────────────────────────────────────────────────

export function getCachedDirective(key: string): PantherDirective | null {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.directive;
  }
  // Expired — remove from cache
  if (entry) cache.delete(key);
  return null;
}

export function setCachedDirective(
  key: string,
  directive: PantherDirective,
  ttlMs: number
): void {
  cache.set(key, { directive, expiresAt: Date.now() + ttlMs });
}

export function clearCachedDirective(key: string): void {
  cache.delete(key);
}

export function clearAllDirectives(): void {
  cache.clear();
}

// ── TTL CONSTANTS ──────────────────────────────────────────────────────────────

export const TTL = {
  /** MOVE: 1 call per session — 4 hours */
  MOVE_SESSION: 4 * 60 * 60 * 1000,
  /** FUEL: 1 call per day — 24 hours */
  FUEL_DAILY: 24 * 60 * 60 * 1000,
  /** MINDSET: 1 call per check-in — 24 hours */
  MINDSET_DAILY: 24 * 60 * 60 * 1000,
  /** FEAST: 2 calls per day — 12 hours per call */
  FEAST_HALF_DAY: 12 * 60 * 60 * 1000,
  /** Phase transition: 1 per phase — 7 days */
  PHASE_TRANSITION: 7 * 24 * 60 * 60 * 1000,
} as const;

// ── CACHE KEY BUILDERS ─────────────────────────────────────────────────────────

export function buildCacheKey(
  engine: 'MOVE' | 'FUEL' | 'MINDSET' | 'FEAST',
  userId: string,
  scope?: string
): string {
  const today = new Date().toDateString(); // e.g. "Mon Apr 14 2026"
  return scope
    ? `${engine.toLowerCase()}-${userId}-${scope}-${today}`
    : `${engine.toLowerCase()}-${userId}-${today}`;
}
