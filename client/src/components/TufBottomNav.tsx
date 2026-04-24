/**
 * TUF Bottom Navigation — v5.0
 * Home · Assess · Program · Panther · Evolve · Settings
 */
import { useLocation } from "wouter";

interface NavItem {
  id: string;
  icon: string;
  label: string;
  path: string;
  highlight?: boolean; // orange accent for special items
}

const navItems: NavItem[] = [
  { id: "home",     icon: "🏠", label: "HOME",     path: "/" },
  { id: "assess",   icon: "🧠", label: "ASSESS",   path: "/assess" },
  { id: "program",  icon: "📋", label: "PROGRAM",  path: "/program" },
  { id: "panther",  icon: "🐆", label: "PANTHER",  path: "/panther" },
  { id: "evolve",   icon: "⚡", label: "EVOLVE",   path: "/evolve" },
  { id: "settings", icon: "⚙️", label: "SETTINGS", path: "/settings" },
];

export function TufBottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background border-t border-border flex z-50"
      style={{ boxShadow: "0 -4px 32px rgba(0,0,0,0.18)" }}
    >
      {navItems.map((item) => {
        const isActive =
          item.path === "/"
            ? location === "/"
            : location.startsWith(item.path);

        const isSettings = item.id === "settings";

        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex-1 py-3 px-0.5 flex flex-col items-center gap-0.5 cursor-pointer transition-all relative ${
              isActive
                ? isSettings
                  ? "text-orange-400"
                  : "text-primary"
                : "text-muted-foreground"
            }`}
          >
            {/* Active indicator bar */}
            {isActive && (
              <span
                className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full ${
                  isSettings ? "bg-orange-400" : "bg-primary"
                }`}
              />
            )}

            {/* Icon */}
            <span
              className={`text-xl leading-none transition-transform ${
                isActive ? "scale-110" : "scale-100"
              }`}
              style={
                isSettings && isActive
                  ? { filter: "drop-shadow(0 0 6px rgba(249,115,22,0.7))" }
                  : undefined
              }
            >
              {item.icon}
            </span>

            {/* Label */}
            <span
              className={`text-[9px] uppercase tracking-wider font-black ${
                isActive
                  ? isSettings
                    ? "text-orange-400"
                    : "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
