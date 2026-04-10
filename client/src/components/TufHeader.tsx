/**
 * TUF Header — v4.2
 * Logo: panther mascot image with blended overlay treatment
 *  - Full panther visible (darkened)
 *  - Red glow halo spotlights the UP logo on the jersey
 *  - Pulsing scan ring frames the UP mark
 */
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const PANTHER_MASCOT =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/panther-mascot-gym_27e64ae1.png";

export function TufHeader() {
  const { theme, toggleTheme } = useTheme();
  const [initial, setInitial] = useState("A");

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("tuf_profile") || "{}");
      if (p.name) setInitial(p.name.trim()[0].toUpperCase());
    } catch {}
  }, []);

  return (
    <>
      <style>{`
        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(255,69,0,0.5), inset 0 0 8px rgba(255,69,0,0.08); }
          50%       { box-shadow: 0 0 20px rgba(255,69,0,0.85), inset 0 0 12px rgba(255,69,0,0.15); }
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
        background: 'rgba(8,8,8,0.95)',
        borderBottom: '1px solid rgba(255,69,0,0.15)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
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
            border: '1px solid rgba(255,69,0,0.2)',
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
              background: 'radial-gradient(ellipse 65% 60% at 50% 45%, transparent 0%, rgba(8,8,8,0.4) 60%, rgba(8,8,8,0.8) 100%)',
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
                background: 'radial-gradient(ellipse at center, rgba(255,69,0,0.55) 0%, rgba(255,69,0,0.15) 55%, transparent 80%)',
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
                border: '1px solid rgba(255,69,0,0.65)',
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
              color: '#fff',
              lineHeight: 1,
              textShadow: '0 0 8px rgba(255,69,0,0.4)',
            }}>
              TURNED UP FITNESS
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: 'rgba(255,255,255,0.3)',
              marginTop: 2,
            }}>
              AI PERFORMANCE COACHING
            </div>
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 6,
                borderRadius: 8,
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.5)',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Toggle theme"
            >
              {theme === 'light'
                ? <Moon style={{ width: 18, height: 18 }} />
                : <Sun style={{ width: 18, height: 18 }} />
              }
            </button>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#FF4500',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 15,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(255,69,0,0.4)',
            }}>
              {initial}
            </div>
          </div>

        </div>
      </header>
    </>
  );
}
