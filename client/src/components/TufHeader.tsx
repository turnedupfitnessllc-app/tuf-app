import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export function TufHeader() {
  const { theme, toggleTheme } = useTheme();

  // Fix 4: read user's name initial from localStorage instead of hardcoded 'A'
  const [initial, setInitial] = useState("A");
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("tuf_profile") || "{}");
      if (p.name) setInitial(p.name.trim()[0].toUpperCase());
    } catch {}
  }, []);

  return (
    <header style={{ background: 'rgba(8,8,8,0.95)', borderBottom: '1px solid rgba(255,69,0,0.15)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/tuf-up-mark_24c33eef.png"
            alt="Turned Up Fitness"
            className="h-10 w-auto"
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,40,40,0.5))' }}
          />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-foreground" />
            ) : (
              <Sun className="w-5 h-5 text-foreground" />
            )}
          </button>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold cursor-pointer hover:shadow-lg transition-shadow">
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
