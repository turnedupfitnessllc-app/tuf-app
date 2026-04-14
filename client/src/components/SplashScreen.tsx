/**
 * TUF Splash Screen — v4.3
 * Full-screen panther cinematic intro — plays once per browser session.
 * If the video is unavailable or autoplay is blocked, falls back to the
 * panther mascot still image with the blended logo overlay treatment.
 */
import { useEffect, useRef, useState } from "react";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR";
const PANTHER_VIDEO_URL   = `${CDN}/panther-hero-splash_c4752aa3.mp4`;
const PANTHER_MASCOT_URL  = `${CDN}/panther-mascot-gym_27e64ae1.png`;

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const [visible, setVisible]       = useState(true);
  const [fadeOut, setFadeOut]       = useState(false);
  const [needsTap, setNeedsTap]     = useState(false);
  const [skipVisible, setSkipVisible] = useState(false);
  const finishRef = useRef(false);

  const finish = () => {
    if (finishRef.current) return;
    finishRef.current = true;
    setFadeOut(true);
    setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 900);
  };

  const handleTap = () => {
    if (needsTap) {
      setNeedsTap(false);
      videoRef.current?.play().catch(() => finish());
    } else {
      finish();
    }
  };

  useEffect(() => {
    const skipTimer = setTimeout(() => setSkipVisible(true), 1500);
    const maxTimer  = setTimeout(finish, 12000);

    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      setNeedsTap(true);
      setSkipVisible(true);
    });

    video.addEventListener("ended", finish);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(maxTimer);
      video.removeEventListener("ended", finish);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@700;900&display=swap');
        @keyframes splashRingPulse {
          0%,100% { box-shadow: 0 0 20px rgba(255,102,0,0.5), inset 0 0 12px rgba(255,102,0,0.08); }
          50%     { box-shadow: 0 0 45px rgba(255,102,0,0.9), inset 0 0 22px rgba(255,102,0,0.18); }
        }
        @keyframes splashHaloPulse { 0%,100%{opacity:1} 50%{opacity:0.55} }
        @keyframes splashFadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .splash-ring { animation: splashRingPulse 2.2s ease-in-out infinite; }
        .splash-halo { animation: splashHaloPulse 2.2s ease-in-out infinite; }
        .splash-cta  { animation: splashFadeIn 0.6s ease both; }
      `}</style>

      <div
        className="fixed inset-0 z-[9999] bg-black"
        style={{
          opacity: fadeOut ? 0 : 1,
          transition: "opacity 0.9s ease-out",
          cursor: "pointer",
        }}
        onClick={handleTap}
      >
        {/* ── Primary: cinematic video ── */}
        <video
          ref={videoRef}
          src={PANTHER_VIDEO_URL}
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: "cover", objectPosition: "center top" }}
          playsInline
          muted
          preload="auto"
        />

        {/* ── Fallback still: panther mascot with blended overlay ── */}
        {needsTap && (
          <>
            <img
              src={PANTHER_MASCOT_URL}
              alt="TUF Panther"
              className="absolute inset-0 w-full h-full"
              style={{
                objectFit: "cover",
                objectPosition: "center 18%",
                filter: "brightness(0.45) saturate(1.2)",
              }}
            />
            {/* Edge vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(ellipse 70% 65% at 50% 42%, transparent 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.85) 100%)",
            }} />
            {/* Spotlight on chest */}
            <div className="absolute pointer-events-none" style={{
              left: "50%", top: "55%",
              transform: "translate(-50%, -50%)",
              width: 200, height: 130,
              background: "radial-gradient(ellipse at center, rgba(255,255,255,0.2) 0%, transparent 70%)",
              borderRadius: "50%",
            }} />
            {/* Red glow halo */}
            <div className="splash-halo absolute pointer-events-none" style={{
              left: "50%", top: "55%",
              transform: "translate(-50%, -50%)",
              width: 170, height: 110,
              background: "radial-gradient(ellipse at center, rgba(255,102,0,0.55) 0%, rgba(255,102,0,0.15) 55%, transparent 80%)",
              borderRadius: "50%",
            }} />
            {/* Scan ring */}
            <div className="splash-ring absolute pointer-events-none" style={{
              left: "50%", top: "55%",
              transform: "translate(-50%, -50%)",
              width: 130, height: 88,
              border: "2px solid rgba(255,102,0,0.7)",
              borderRadius: 14,
            }} />
            {/* Corner ticks */}
            <div className="absolute pointer-events-none" style={{
              left: "50%", top: "55%",
              transform: "translate(calc(-50% - 65px), calc(-50% - 44px))",
              width: 16, height: 16,
              borderTop: "2px solid #FF6600",
              borderLeft: "2px solid #FF6600",
              borderRadius: "4px 0 0 0",
            }} />
            <div className="absolute pointer-events-none" style={{
              left: "50%", top: "55%",
              transform: "translate(calc(-50% + 49px), calc(-50% + 28px))",
              width: 16, height: 16,
              borderBottom: "2px solid #FF6600",
              borderRight: "2px solid #FF6600",
              borderRadius: "0 0 4px 0",
            }} />
            {/* Scan label */}
            <div className="absolute pointer-events-none" style={{
              left: "50%", top: "calc(55% + 52px)",
              transform: "translateX(-50%)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.22em",
              color: "rgba(255,102,0,0.7)",
              whiteSpace: "nowrap",
            }}>
              ▸ UP MARK IDENTIFIED
            </div>
          </>
        )}

        {/* ── Gradient overlays (always present) ── */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 25%, transparent 55%, rgba(0,0,0,0.8) 100%)",
        }} />

        {/* ── Bottom CTA ── */}
        <div
          className="splash-cta absolute bottom-10 inset-x-0 flex flex-col items-center gap-3"
          style={{
            opacity: skipVisible ? 1 : 0,
            transition: "opacity 0.6s ease-in",
            pointerEvents: skipVisible ? "auto" : "none",
          }}
        >
          {/* Brand name */}
          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 28,
              letterSpacing: "0.1em",
              color: "#fff",
              textShadow: "0 0 16px rgba(255,102,0,0.7), 0 0 40px rgba(255,102,0,0.3)",
              lineHeight: 1,
            }}>
              TURNED UP FITNESS
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.22em",
              color: "rgba(255,255,255,0.35)",
              marginTop: 4,
            }}>
              AI PERFORMANCE COACHING
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); finish(); }}
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,102,0,0.45)",
              borderRadius: 40,
              padding: "12px 40px",
              color: "rgba(255,255,255,0.85)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.22em",
              fontFamily: "'Barlow Condensed', sans-serif",
              boxShadow: "0 0 24px rgba(255,102,0,0.2)",
              cursor: "pointer",
            }}
          >
            {needsTap ? "TAP TO BEGIN" : "TAP TO ENTER"}
          </button>
        </div>
      </div>
    </>
  );
}
