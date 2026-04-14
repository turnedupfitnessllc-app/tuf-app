/**
 * THE PANTHER SYSTEM — PANTHER BRAIN HERO CARD
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 * Doc 14 — Button Design Fix
 *
 * The most visually dominant card on the home screen.
 * Full-width, 2px orange border, subtle glow — hero status.
 */

import React from 'react';

interface PantherBrainCardProps {
  onClick: () => void;
}

const PantherBrainCard: React.FC<PantherBrainCardProps> = ({ onClick }) => {
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
        minHeight: '100px',
        backgroundColor: pressed ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
        border: '2px solid var(--accent-primary)',
        borderRadius: '14px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        cursor: 'pointer',
        marginBottom: '8px',
        boxShadow: '0 0 20px rgba(255, 102, 0, 0.15)',
        textAlign: 'left',
        transition: 'background-color 0.1s ease',
      }}
    >
      {/* PANTHER ICON */}
      <div style={{ fontSize: '36px', flexShrink: 0, lineHeight: 1 }}>🐆</div>

      {/* TEXT */}
      <div style={{ flex: 1 }}>
        <div style={{
          color: 'var(--accent-primary)',
          fontWeight: '800',
          fontSize: '18px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '4px',
          fontFamily: "'Bebas Neue', sans-serif",
          lineHeight: 1.1,
        }}>
          PANTHER BRAIN
        </div>
        <div style={{
          color: 'var(--text-secondary)',
          fontSize: '13px',
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: '0.06em',
        }}>
          AI Performance Coach — Active
        </div>
      </div>

      {/* CHEVRON */}
      <div style={{
        color: 'var(--accent-primary)',
        fontSize: '22px',
        flexShrink: 0,
        lineHeight: 1,
      }}>
        ›
      </div>
    </button>
  );
};

export default PantherBrainCard;
