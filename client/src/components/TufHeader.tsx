import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export function TufHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header-exec">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Brand — UP logo from Panther chest */}
        <div className="flex items-center gap-2">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/tuf-up-logo-crop_dc03c5c7.png"
            alt="Turned Up Fitness"
            className="h-10 w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 8px rgba(255,69,0,0.6))' }}
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
            A
          </div>
        </div>
      </div>
    </header>
  );
}
