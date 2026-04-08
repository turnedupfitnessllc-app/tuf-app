/**
 * TUF Bottom Navigation — v4.0
 * Home · Assess · Program · Jarvis · Evolve
 */
import { useLocation } from "wouter";

interface NavItem {
  id: string;
  icon: string;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { id: "home",    icon: "🏠", label: "HOME",    path: "/" },
  { id: "assess",  icon: "🧠", label: "ASSESS",  path: "/assess" },
  { id: "program", icon: "📋", label: "PROGRAM", path: "/program" },
  { id: "jarvis",  icon: "🐆", label: "JARVIS",  path: "/jarvis" },
  { id: "evolve",  icon: "⚡", label: "EVOLVE",  path: "/evolve" },
];

export function TufBottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background border-t border-border flex z-50"
      style={{ boxShadow: "0 -4px 32px rgba(0,0,0,0.12)" }}
    >
      {navItems.map((item) => {
        const isActive =
          item.path === "/"
            ? location === "/"
            : location.startsWith(item.path);

        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex-1 py-3 px-1 flex flex-col items-center gap-0.5 cursor-pointer transition-all relative ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
            <span className={`text-xl leading-none transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>
              {item.icon}
            </span>
            <span className={`text-[10px] uppercase tracking-wider font-black ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
