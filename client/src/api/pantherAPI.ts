/**
 * THE PANTHER SYSTEM — BASE API CLIENT
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 * TRADE SECRET — Proprietary AI coaching architecture.
 * The Panther System™ is a trademark of Turned Up Fitness LLC.
 *
 * This is the single shared API client for all four coaching engines.
 * All engine files import from this file — never duplicate fetch logic.
 *
 * Architecture: Client → Server routes → Claude API (server-side only)
 * The Anthropic API key NEVER touches the client. All Claude calls go through
 * the Express server, which holds the key securely.
 */

// ── TYPES ──────────────────────────────────────────────────────────────────────

export interface PantherDirective {
  headline: string;
  body: string;
  directive: string;
  raw?: string;
  engine: 'MOVE' | 'FUEL' | 'MINDSET' | 'FEAST';
  generatedAt: string;
}

export interface APICallOptions {
  endpoint: string;           // Server route path, e.g. '/api/fuel/log/evaluate'
  payload: Record<string, unknown>;
  engine: 'MOVE' | 'FUEL' | 'MINDSET' | 'FEAST';
}

// ── FALLBACK DIRECTIVES ────────────────────────────────────────────────────────
// The app NEVER crashes on API failure — always returns a fallback directive.

const FALLBACKS: Record<string, Omit<PantherDirective, 'generatedAt'>> = {
  MOVE: {
    headline: 'Execute the protocol.',
    body: 'The system is recalibrating. Your program is unchanged.',
    directive: 'Continue your current corrective sequence.',
    engine: 'MOVE',
  },
  FUEL: {
    headline: 'Hit your protein target.',
    body: 'Regardless of system status — 35g protein at your next meal is non-negotiable.',
    directive: 'Log your next meal now.',
    engine: 'FUEL',
  },
  MINDSET: {
    headline: 'Check in. Stay in sequence.',
    body: 'The challenge does not pause. The system is recalibrating.',
    directive: 'Complete your MOVE and FUEL anchors for today.',
    engine: 'MINDSET',
  },
  FEAST: {
    headline: 'Protein first. Always.',
    body: 'The system is recalibrating. Your targets are unchanged.',
    directive: 'Open your FEAST screen and log your next meal.',
    engine: 'FEAST',
  },
};

function getFallbackDirective(engine: string): PantherDirective {
  const fb = FALLBACKS[engine] ?? FALLBACKS.MOVE;
  return { ...fb, raw: '', generatedAt: new Date().toISOString() };
}

// ── BASE CALL ──────────────────────────────────────────────────────────────────

/**
 * callPantherSystem
 * Sends a request to the server-side Claude endpoint and returns a PantherDirective.
 * Falls back gracefully on any network or API error.
 */
export async function callPantherSystem(options: APICallOptions): Promise<PantherDirective> {
  try {
    const res = await fetch(options.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options.payload),
    });

    if (!res.ok) {
      console.error(`[Panther ${options.engine}] HTTP ${res.status} from ${options.endpoint}`);
      return getFallbackDirective(options.engine);
    }

    const data = await res.json();

    // Normalize: server may return { directive: {...} } or the directive directly
    const raw = data.directive ?? data;

    if (raw && typeof raw === 'object' && raw.headline) {
      return {
        headline: raw.headline ?? '',
        body: raw.body ?? '',
        directive: raw.directive ?? '',
        raw: raw.raw ?? '',
        engine: options.engine,
        generatedAt: raw.generatedAt ?? new Date().toISOString(),
      };
    }

    // Server returned unexpected shape — use fallback
    console.warn(`[Panther ${options.engine}] Unexpected response shape`, data);
    return getFallbackDirective(options.engine);

  } catch (error) {
    console.error(`[Panther ${options.engine}] API error:`, error);
    return getFallbackDirective(options.engine);
  }
}
