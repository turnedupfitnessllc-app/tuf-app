/**
 * THE PANTHER SYSTEM — EVOLVE CARD
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 * Doc 14 — Button Design Fix
 *
 * Full-width gold border card for XP/Stages.
 * Upgraded from half-width box to full-width hero card.
 */

import React from 'react';

interface EvolveCardProps {
  xpPoints?: number;
  xpLevel?: string;
  onClick: () => void;
}

const EvolveCard: React.FC<EvolveCardProps> = ({ xpPoints, xpLevel, onClick }) => {
  const [pressed, setPressed] = React.useState(false);

  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: '88px',
        backgroundColor: pressed ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
        border: '1.5px solid #C8973A',
        borderRadius: '14px',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        cursor: 'pointer',
        marginBottom: '8px',
        textAlign: 'left',
        transition: 'background-color 0.1s ease',
      }}
    >
      {/* LIGHTNING ICON */}
      <div style={{ fontSize: '30px', flexShrink: 0, lineHeight: 1 }}>⚡</div>

      {/* TEXT */}
      <div style={{ flex: 1 }}>
        <div style={{
          color: '#C8973A',
          fontWeight: '700',
          fontSize: '15px',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          marginBottom: '3px',
          fontFamily: "'Bebas Neue', sans-serif",
          lineHeight: 1.2,
        }}>
          EVOLVE
        </div>
        <div style={{
          color: 'var(--text-secondary)',
          fontSize: '12px',
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: '0.08em',
        }}>
          XP · Stages ·{' '}
          {xpPoints != null && xpPoints > 0
            ? `${xpPoints.toLocaleString()} pts`
            : xpLevel
            ? xpLevel
            : 'Level Up'}
        </div>
      </div>

      {/* CHEVRON */}
      <div style={{
        color: '#C8973A',
        fontSize: '22px',
        flexShrink: 0,
        lineHeight: 1,
      }}>
        ›
      </div>
    </button>
  );
};

export default EvolveCard;
