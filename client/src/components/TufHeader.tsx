/**
 * TUF Header — v4.3
 * Theme-aware: uses CSS variable tokens (--nav-bg, --text-primary, etc.)
 * Logo: panther mascot image with blended overlay treatment
 *  - Full panther visible (darkened)
 *  - Red glow halo spotlights the UP logo on the jersey
 *  - Pulsing scan ring frames the UP mark
 */
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from 'wouter';
import { Moon, Sun, Settings } from 'lucide-react';

const PANTHER_MASCOT =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/panther-mascot-gym_27e64ae1.png";

export function TufHeader() {
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();
  const [initial, setInitial] = useState("A");

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("tuf_profile") || "{}");
      if (p.name) setInitial(p.name.trim()[0].toUpperCase());
    } catch {}
  }, []);

  const isDark = theme === 'dark';

  return (
    <>
      <style>{`
        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(255,102,0,0.5), inset 0 0 8px rgba(255,102,0,0.08); }
          50%       { box-shadow: 0 0 20px rgba(255,102,0,0.85), inset 0 0 12px rgba(255,102,0,0.15); }
        }
        @keyframes haloPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.65; }
        }
        .tuf-logo-ring {
          animation: ringPulse 2.5s ease-in-out infinite;
        }
        .tuf-logo-halo {
          animation: haloPulse 2.5s ease-in-out infinite;
        }
      `}</style>
      <header style={{
        background: isDark
          ? 'rgba(8,8,8,0.95)'
          : 'rgba(255,255,255,0.95)',
        borderBottom: isDark
          ? '1px solid rgba(255,102,0,0.15)'
          : '1px solid rgba(255,102,0,0.12)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}>
        <div style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>

          {/* ── LOGO: panther mascot + blended overlay ── */}
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            overflow: 'hidden',
            position: 'relative',
            flexShrink: 0,
            border: '1px solid rgba(255,102,0,0.2)',
          }}>
            {/* Panther image — full body, gently darkened */}
            <img
              src={PANTHER_MASCOT}
              alt="TUF"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 20%',
                filter: 'brightness(0.5) saturate(1.15)',
              }}
            />
            {/* Edge vignette */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: isDark
                ? 'radial-gradient(ellipse 65% 60% at 50% 45%, transparent 0%, rgba(8,8,8,0.4) 60%, rgba(8,8,8,0.8) 100%)'
                : 'radial-gradient(ellipse 65% 60% at 50% 45%, transparent 0%, rgba(255,255,255,0.2) 60%, rgba(255,255,255,0.5) 100%)',
              pointerEvents: 'none',
            }} />
            {/* Spotlight on chest */}
            <div style={{
              position: 'absolute',
              left: '50%', top: '58%',
              transform: 'translate(-50%, -50%)',
              width: 40, height: 28,
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }} />
            {/* Red glow halo */}
            <div
              className="tuf-logo-halo"
              style={{
                position: 'absolute',
                left: '50%', top: '58%',
                transform: 'translate(-50%, -50%)',
                width: 34, height: 24,
                background: 'radial-gradient(ellipse at center, rgba(255,102,0,0.55) 0%, rgba(255,102,0,0.15) 55%, transparent 80%)',
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />
            {/* Scan ring */}
            <div
              className="tuf-logo-ring"
              style={{
                position: 'absolute',
                left: '50%', top: '58%',
                transform: 'translate(-50%, -50%)',
                width: 28, height: 20,
                border: '1px solid rgba(255,102,0,0.65)',
                borderRadius: 4,
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* App name */}
          <div style={{ flex: 1, paddingLeft: 10 }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 18,
              letterSpacing: '0.06em',
              color: 'var(--text-primary)',
              lineHeight: 1,
              textShadow: isDark ? '0 0 8px rgba(255,102,0,0.4)' : '0 0 8px rgba(255,102,0,0.2)',
              transition: 'color 0.3s ease',
            }}>
              TURNED UP FITNESS
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: 'var(--text-tertiary)',
              marginTop: 2,
              transition: 'color 0.3s ease',
            }}>
              AI PERFORMANCE COACHING
            </div>
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={toggleTheme}
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                padding: 6,
                borderRadius: 8,
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.2s ease, color 0.2s ease',
              }}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark
                ? <Sun style={{ width: 18, height: 18 }} />
                : <Moon style={{ width: 18, height: 18 }} />
              }
            </button>
            {/* Settings gear — always visible */}
            <button
              onClick={() => navigate('/settings')}
              aria-label="Settings"
              title="Settings"
              style={{
                background: isDark ? 'rgba(255,102,0,0.12)' : 'rgba(255,102,0,0.08)',
                border: '1px solid rgba(255,102,0,0.25)',
                padding: 7,
                borderRadius: 9,
                cursor: 'pointer',
                color: 'rgba(255,102,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <Settings style={{ width: 18, height: 18 }} />
            </button>
            {/* Avatar — navigates to profile */}
            <div
              onClick={() => navigate('/profile')}
              title="Profile"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(255,102,0,0.4)',
              }}
            >
              {initial}
            </div>
          </div>

        </div>
      </header>
    </>
  );
}
