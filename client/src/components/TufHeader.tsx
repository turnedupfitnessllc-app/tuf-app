import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export function TufHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header-exec">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">
            <span className="text-foreground">TUF</span>
            <span className="text-gradient ml-1">MOVE</span>
          </div>
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
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold cursor-pointer hover:shadow-lg transition-shadow">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
