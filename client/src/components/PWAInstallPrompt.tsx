import { useState, useEffect } from "react";
import { X, Download, Share, Plus } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently (don't show again for 7 days)
    const dismissed = localStorage.getItem("tuf_pwa_dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    if (ios) {
      // Show iOS instructions after 3 seconds
      setTimeout(() => setShowBanner(true), 3000);
    }

    // Listen for Android/Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 2000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("tuf_pwa_dismissed", Date.now().toString());
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div
        className="rounded-2xl border border-orange-500/30 bg-black/95 backdrop-blur-xl shadow-2xl shadow-orange-500/10 p-4"
        style={{ boxShadow: "0 0 30px rgba(249,115,22,0.15), 0 8px 32px rgba(0,0,0,0.8)" }}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-orange-500/20">
            <img src="/icon-192.png" alt="TUF" className="w-full h-full object-cover" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-white font-bold text-sm tracking-wide">INSTALL TUF APP</p>
              <button
                onClick={handleDismiss}
                className="text-zinc-500 hover:text-white transition-colors p-1 -mr-1 -mt-1"
              >
                <X size={14} />
              </button>
            </div>

            {isIOS ? (
              <div>
                <p className="text-zinc-400 text-xs mb-2">
                  Add to your home screen for the full Panther experience.
                </p>
                <div className="flex items-center gap-2 text-xs text-orange-400">
                  <Share size={12} />
                  <span>Tap Share</span>
                  <span className="text-zinc-600">→</span>
                  <Plus size={12} />
                  <span>Add to Home Screen</span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-zinc-400 text-xs mb-3">
                  Install for offline access, push notifications, and the full Panther experience.
                </p>
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                >
                  <Download size={12} />
                  ADD TO HOME SCREEN
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
