/**
 * TUF THEME CONTEXT — v2.0
 * Doc 12 compliant: uses data-theme attribute on documentElement
 * localStorage key: "tuf-theme"
 * Default: dark
 */
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
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
  defaultTheme = "dark",
  switchable = true,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      // Support both old key ("theme") and new key ("tuf-theme") for migration
      const stored =
        (localStorage.getItem("tuf-theme") as Theme) ||
        (localStorage.getItem("theme") as Theme);
      return stored || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;

    // Doc 12 spec: set data-theme attribute
    root.setAttribute("data-theme", theme);

    // Also keep .dark class for Tailwind @custom-variant dark compatibility
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (switchable) {
      localStorage.setItem("tuf-theme", theme);
    }
  }, [theme, switchable]);

  const toggleTheme = () => {
    if (switchable) {
      setTheme(prev => (prev === "dark" ? "light" : "dark"));
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        isDark: theme === "dark",
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
