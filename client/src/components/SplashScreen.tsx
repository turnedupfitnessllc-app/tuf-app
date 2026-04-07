/**
 * TUF Splash Screen
 * Plays the intro video full-screen on first app load.
 * Auto-advances after video ends or user taps to skip.
 * Only shown once per session (sessionStorage flag).
 */
import { useEffect, useRef, useState } from "react";

const INTRO_VIDEO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/tuf-intro_621b07f7.mp4";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const finish = () => {
    if (fadeOut) return;
    setFadeOut(true);
    setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 600);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      // Autoplay blocked — skip after 2s
      setTimeout(finish, 2000);
    });

    video.addEventListener("ended", finish);
    return () => video.removeEventListener("ended", finish);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.6s ease-out",
      }}
    >
      {/* Full-screen video */}
      <video
        ref={videoRef}
        src={INTRO_VIDEO_URL}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        preload="auto"
      />

      {/* Subtle bottom gradient */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
        }}
      />

      {/* TUF logo overlay — top */}
      <div className="absolute top-8 inset-x-0 flex justify-center">
        <div
          className="px-4 py-2 rounded-xl"
          style={{
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
          }}
        >
          <p
            className="text-white font-black text-xl tracking-widest"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            TURNED <span style={{ color: "#FF4500" }}>UP</span> FITNESS
          </p>
        </div>
      </div>

      {/* Skip button — bottom */}
      <button
        onClick={finish}
        className="absolute bottom-10 inset-x-0 mx-auto w-fit px-6 py-2 rounded-full text-sm font-bold text-white"
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        TAP TO ENTER →
      </button>
    </div>
  );
}
