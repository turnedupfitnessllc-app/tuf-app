/**
 * TUF Splash Screen
 * Full-screen panther cinematic intro — plays once per session,
 * then dissolves into the Home screen.
 * The video itself carries the "TURNED UP FITNESS" branding,
 * so no overlay logo is needed.
 */
import { useEffect, useRef, useState } from "react";

const PANTHER_VIDEO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/panther-hero-splash_c4752aa3.mp4";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
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

  useEffect(() => {
    // Show skip button after 2s so user can bypass if needed
    const skipTimer = setTimeout(() => setSkipVisible(true), 2000);

    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      // Autoplay blocked — auto-advance after 3s
      setTimeout(finish, 3000);
    });

    video.addEventListener("ended", finish);

    return () => {
      clearTimeout(skipTimer);
      video.removeEventListener("ended", finish);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.9s ease-out",
        cursor: "pointer",
      }}
      onClick={finish}
    >
      {/* Full-screen panther cinematic — object-cover fills entire viewport */}
      <video
        ref={videoRef}
        src={PANTHER_VIDEO_URL}
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: "cover", objectPosition: "center top" }}
        playsInline
        muted
        preload="auto"
      />

      {/* Subtle bottom vignette for depth */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
        }}
      />

      {/* Skip button — appears after 2s */}
      <div
        className="absolute bottom-8 inset-x-0 flex justify-center"
        style={{
          opacity: skipVisible ? 1 : 0,
          transition: "opacity 0.6s ease-in",
          pointerEvents: skipVisible ? "auto" : "none",
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); finish(); }}
          style={{
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 40,
            padding: "10px 28px",
            color: "rgba(255,255,255,0.6)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            fontFamily: "'Barlow Condensed', sans-serif",
          }}
        >
          TAP TO ENTER
        </button>
      </div>
    </div>
  );
}
