/**
 * TUF Splash Screen
 * Full-screen UP mark intro video — takes over the entire display,
 * then dissolves to reveal the home screen.
 * Only shown once per session (sessionStorage flag).
 */
import { useEffect, useRef, useState } from "react";

const INTRO_VIDEO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/tuf-intro_4f95ca8f.mp4";

const UP_MARK_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/tuf-up-mark_24c33eef.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const finishRef = useRef(false);

  const finish = () => {
    if (finishRef.current) return;
    finishRef.current = true;
    setFadeOut(true);
    setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 800);
  };

  useEffect(() => {
    // Show logo after a short delay for cinematic effect
    const logoTimer = setTimeout(() => setLogoVisible(true), 400);

    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      // Autoplay blocked — show static splash then auto-advance after 3s
      setTimeout(finish, 3000);
    });

    video.addEventListener("ended", finish);

    return () => {
      clearTimeout(logoTimer);
      video.removeEventListener("ended", finish);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.8s ease-out",
      }}
    >
      {/* Full-screen video — object-cover fills entire viewport */}
      <video
        ref={videoRef}
        src={INTRO_VIDEO_URL}
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: "cover", objectPosition: "center" }}
        playsInline
        muted
        preload="auto"
      />

      {/* Dark vignette overlay — edges only, keeps center bright */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Bottom gradient for button legibility */}
      <div
        className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
        }}
      />

      {/* UP mark logo — center, fades in */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: logoVisible ? 1 : 0,
          transition: "opacity 0.8s ease-in",
        }}
      >
        <img
          src={UP_MARK_URL}
          alt="TUF UP"
          style={{
            width: "min(180px, 40vw)",
            height: "auto",
            filter: "drop-shadow(0 0 32px rgba(255,69,0,0.6))",
          }}
        />
      </div>

      {/* Brand name — bottom center */}
      <div
        className="absolute bottom-20 inset-x-0 flex flex-col items-center gap-1"
        style={{
          opacity: logoVisible ? 1 : 0,
          transition: "opacity 0.8s ease-in 0.3s",
        }}
      >
        <p
          className="text-white font-black tracking-[0.25em] text-base"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          TURNED <span style={{ color: "#FF4500" }}>UP</span> FITNESS
        </p>
        <p
          className="text-xs tracking-widest"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          AI THAT GROWS WITH YOU
        </p>
      </div>

      {/* Tap to enter — bottom */}
      <button
        onClick={finish}
        className="absolute bottom-6 inset-x-0 mx-auto w-fit px-8 py-2.5 rounded-full text-sm font-bold text-white"
        style={{
          background: "rgba(255,69,0,0.18)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,69,0,0.4)",
          letterSpacing: "0.12em",
          opacity: logoVisible ? 1 : 0,
          transition: "opacity 0.8s ease-in 0.6s",
        }}
      >
        TAP TO ENTER →
      </button>
    </div>
  );
}
