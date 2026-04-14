/**
 * useReferral — Panther System
 *
 * Fetches (or generates) the current user's referral code from the server.
 * Provides:
 *   - refCode: string | null
 *   - shareLink: string  (e.g. "https://pantherapp.com/join?ref=marc123a")
 *   - stats: { visits, conversions, xp_earned }
 *   - loading: boolean
 *
 * The share link uses window.location.origin so it works in dev and production.
 * When pantherapp.com is the live domain, the link will automatically resolve correctly.
 */

import { useState, useEffect } from "react";

interface ReferralStats {
  ref_code: string | null;
  visits: number;
  conversions: number;
  xp_earned: number;
}

interface UseReferralReturn {
  refCode: string | null;
  shareLink: string | null;
  stats: ReferralStats;
  loading: boolean;
}

export function useReferral(userId: string | null): UseReferralReturn {
  const [refCode, setRefCode] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats>({ ref_code: null, visits: 0, conversions: 0, xp_earned: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    // Fetch or create referral code
    fetch(`/api/referral/${userId}/code`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.ref_code) {
          setRefCode(data.ref_code);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch stats
    fetch(`/api/referral/${userId}/stats`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStats(data.stats);
      })
      .catch(() => {});
  }, [userId]);

  const shareLink = refCode
    ? `${window.location.origin}/join?ref=${refCode}`
    : null;

  return { refCode, shareLink, stats, loading };
}
