/**
 * TUF THEME CONTEXT — v3.0
 * Supports: "dark" | "neon" | "light"
 * Uses data-theme attribute on documentElement
 * localStorage key: "tuf-theme"
 * Default: neon
 */
import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "neon";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isNeon: boolean;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "neon",
  switchable = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (switchable) {
      const stored =
        (localStorage.getItem("tuf-theme") as Theme) ||
        (localStorage.getItem("theme") as Theme);
      // Migrate old "dark" stored value to "neon" on first load
      if (stored === "dark" || stored === "neon" || stored === "light") return stored;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);

    // Keep .dark class for Tailwind @custom-variant dark compatibility
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (switchable) {
      localStorage.setItem("tuf-theme", theme);
    }
  }, [theme, switchable]);

  const setTheme = (t: Theme) => {
    if (switchable) setThemeState(t);
  };

  const toggleTheme = () => {
    if (switchable) {
      setThemeState(prev =>
        prev === "neon" ? "dark" : prev === "dark" ? "light" : "neon"
      );
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === "dark",
        isNeon: theme === "neon",
        switchable: switchable ?? true,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

export default ThemeContext;
