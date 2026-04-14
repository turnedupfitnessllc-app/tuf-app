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
  // ── LOADING STATE ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className={className}
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: '12px',
          padding: compact ? '14px' : '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Animated pulse skeleton */}
        <div style={{
          height: '16px',
          width: '60%',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '4px',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
        <div style={{
          height: '12px',
          width: '90%',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '4px',
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: '0.2s',
        }} />
        <div style={{
          height: '12px',
          width: '75%',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '4px',
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: '0.4s',
        }} />
        <div style={{
          color: 'var(--text-tertiary)',
          fontSize: '12px',
          marginTop: '4px',
        }}>
          The Panther System is analyzing...
        </div>
      </div>
    );
  }

  // ── EMPTY STATE ──────────────────────────────────────────────────────────────
  if (!directive) {
    return null;
  }

  // ── DIRECTIVE CARD ───────────────────────────────────────────────────────────
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-accent)',
        borderRadius: '12px',
        padding: compact ? '14px' : '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? '8px' : '12px',
      }}
    >
      {/* HEADLINE */}
      <div
        style={{
          color: 'var(--accent-primary)',
          fontWeight: '700',
          fontSize: compact ? '14px' : '16px',
          lineHeight: 1.3,
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
        }}
      >
        {directive.headline}
      </div>

      {/* BODY */}
      {directive.body && (
        <div
          style={{
            color: 'var(--text-secondary)',
            fontSize: compact ? '12px' : '14px',
            lineHeight: 1.6,
          }}
        >
          {directive.body}
        </div>
      )}

      {/* DIRECTIVE */}
      {directive.directive && (
        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderLeft: '3px solid var(--accent-primary)',
            padding: compact ? '10px 12px' : '12px 16px',
            color: 'var(--text-primary)',
            fontSize: compact ? '12px' : '14px',
            fontWeight: '600',
            borderRadius: '0 6px 6px 0',
          }}
        >
          {directive.directive}
        </div>
      )}

      {/* ENGINE BADGE */}
      <div
        style={{
          color: 'var(--text-tertiary)',
          fontSize: '11px',
          textAlign: 'right',
          letterSpacing: '0.05em',
        }}
      >
        THE PANTHER SYSTEM — {directive.engine}
      </div>
    </div>
  );
};

export default PantherDirectiveCard;
