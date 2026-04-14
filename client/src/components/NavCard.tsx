/**
 * THE PANTHER SYSTEM — NAV CARD COMPONENT
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 * Doc 14 — Button Design Fix
 *
 * Single reusable component for all Home screen navigation buttons.
 * The FUEL TRACKER is the reference standard — this component matches it exactly.
 */

import React from 'react';

interface NavCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  titleColor?: string;   // defaults to var(--accent-primary) = #FF6600
  borderColor?: string;  // defaults to var(--border-accent) = #FF6600
  onClick: () => void;
  locked?: boolean;      // shows padlock for Panther Elite features
  style?: React.CSSProperties;
}

const NavCard: React.FC<NavCardProps> = ({
  icon,
  title,
  subtitle,
  titleColor,
  borderColor,
  onClick,
  locked = false,
  style,
}) => {
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
        minHeight: '76px',
        backgroundColor: pressed ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
        border: `1.5px solid ${borderColor || 'var(--border-accent)'}`,
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.1s ease',
        textAlign: 'left',
        marginBottom: '8px',
        ...style,
      }}
    >
      {/* ICON */}
      <div style={{
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: titleColor || 'var(--accent-primary)',
        fontSize: '24px',
      }}>
        {icon}
      </div>

      {/* TEXT */}
      <div style={{ flex: 1 }}>
        <div style={{
          color: titleColor || 'var(--accent-primary)',
          fontWeight: '700',
          fontSize: '15px',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          marginBottom: '3px',
          fontFamily: "'Bebas Neue', sans-serif",
          lineHeight: 1.2,
        }}>
          {title}
        </div>
        <div style={{
          color: 'var(--text-secondary)',
          fontSize: '12px',
          fontWeight: '400',
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: '0.08em',
        }}>
          {subtitle}
        </div>
      </div>

      {/* CHEVRON OR LOCK */}
      <div style={{
        color: 'var(--text-tertiary)',
        fontSize: '20px',
        flexShrink: 0,
        lineHeight: 1,
      }}>
        {locked ? '🔒' : '›'}
      </div>
    </button>
  );
};

export default NavCard;
