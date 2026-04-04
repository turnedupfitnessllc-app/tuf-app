/**
 * TUF Bottom Navigation Component
 * Design System: Fixed bottom nav with pillar icons
 * Gold accent for active state, red top border
 */

import { useLocation } from "wouter";

interface NavItem {
  id: string;
  icon: string;
  label: string;
  path: string;
  color: string;
}

const navItems: NavItem[] = [
  { id: "home", icon: "🏠", label: "HOME", path: "/", color: "gold" },
  { id: "move", icon: "💪", label: "MOVE", path: "/move", color: "gold" },
  { id: "fuel", icon: "🥗", label: "FUEL", path: "/fuel", color: "green" },
  { id: "feast", icon: "🍽️", label: "FEAST", path: "/feast", color: "orange" },
  { id: "vault", icon: "📊", label: "VAULT", path: "/vault", color: "purple" },
];

export function TufBottomNav() {
  const [location] = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background border-t-2 border-primary flex z-50"
      style={{ boxShadow: "0 -4px 24px rgba(0,0,0,0.7)" }}
    >
      {navItems.map((item) => {
        const isActive = location === item.path;
        return (
          <a
            key={item.id}
            href={item.path}
            className={`flex-1 py-2 px-1 border-t-2 border-transparent -mt-0.5 flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
              isActive ? "text-accent border-t-accent" : "text-muted-foreground"
            }`}
            style={
              isActive
                ? {
                    background: "linear-gradient(180deg, rgba(245,166,35,0.06) 0%, transparent 100%)",
                    filter: "drop-shadow(0 0 6px rgba(245,166,35,0.5))",
                  }
                : {}
            }
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-xs uppercase tracking-wider font-bold font-barlow">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
