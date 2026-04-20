/**
 * THE PANTHER SYSTEM — DIRECTIVE DISPLAY COMPONENT
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 *
 * Renders HEADLINE / BODY / DIRECTIVE output consistently across all four pillars.
 * Uses CSS variable tokens — switches correctly with theme toggle.
 */

import React from 'react';
import type { PantherDirective } from '../api/pantherAPI';

interface Props {
  directive: PantherDirective | null;
  loading?: boolean;
  className?: string;
  compact?: boolean;
}

const PantherDirectiveCard: React.FC<Props> = ({
  directive,
  loading = false,
  className = '',
  compact = false,
}) => {
  // ── LOADING STATE (Doc 18 shimmer standard) ─────────────────────────────────
  if (loading) {
    return (
      <div
        className={className}
        style={{
          backgroundColor: '#111111',
          borderLeft: '3px solid #FF6600',
          borderRadius: '12px',
          padding: compact ? '14px' : '16px',
          marginBottom: '16px',
        }}
      >
        <div style={{ color: '#FF6600', fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '1px', marginBottom: '8px' }}>
          THE PANTHER SYSTEM IS ANALYZING
        </div>
        <div className="skeleton-shimmer" style={{ height: '10px', width: '100%', borderRadius: '6px' }} />
        <div style={{ height: '4px' }} />
        <div className="skeleton-shimmer" style={{ height: '10px', width: '75%', borderRadius: '6px' }} />
      </div>
    );
  }

  // ── EMPTY STATE ──────────────────────────────────────────────────────────────
  if (!directive) {
    return null;
  }
  // ── DIRECTIVE CARD (Doc 17/18 standard) ──────────────────────────────────────────
  return (
    <div
      className={className}
      style={{
        backgroundColor: '#111111',
        borderLeft: '3px solid #FF6600',
        borderRadius: '12px',
        padding: compact ? '14px' : '16px',
        marginBottom: '16px',
      }}
    >
      {/* HEADLINE */}
      <div style={{ color: '#FF6600', fontFamily: "'Bebas Neue', sans-serif", fontSize: compact ? '16px' : '18px', letterSpacing: '1px', marginBottom: '6px', textTransform: 'uppercase' }}>
        {directive.headline}
      </div>

      {/* BODY */}
      {directive.body && (
        <div style={{ color: '#AAAAAA', fontFamily: "'Barlow Condensed', sans-serif", fontSize: compact ? '13px' : '14px', lineHeight: 1.5, marginBottom: directive.directive ? '10px' : '8px' }}>
          {directive.body}
        </div>
      )}

      {/* DIRECTIVE */}
      {directive.directive && (
        <div style={{ color: '#FFFFFF', backgroundColor: '#1A1A1A', fontFamily: "'Barlow Condensed', sans-serif", fontSize: compact ? '13px' : '14px', fontWeight: 600, paddingLeft: '12px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '6px', marginBottom: '8px' }}>
          {directive.directive}
        </div>
      )}

      {/* ENGINE BADGE */}
      <div style={{ color: '#555', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', textAlign: 'right', letterSpacing: '1px' }}>
        THE PANTHER SYSTEM — {directive.engine}
      </div>
    </div>
  );
};

export default PantherDirectiveCard;
