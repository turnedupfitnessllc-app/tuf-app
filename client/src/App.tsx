import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TufHeader } from "./components/TufHeader";
import { TufBottomNav } from "./components/TufBottomNav";

// Core Panther UX System screens
import Home from "./pages/Home";
import Assess from "./pages/Assess";
import Train from "./pages/Train";
import Correct from "./pages/Correct";
import Profile from "./pages/Profile";

// Feature screens
import JarvisChat from "./pages/JarvisChat";
import LiveCoaching from "./pages/LiveCoaching";

// Legacy screens (still accessible via Profile quick links)
import Move from "./pages/Move";
import Fuel from "./pages/Fuel";
import Feast from "./pages/Feast";
import Vault from "./pages/Vault";
import Progress from "./pages/Progress";
import ComponentShowcase from "./pages/ComponentShowcase";

function Router() {
  return (
    <>
      <TufHeader />
      <Switch>
        {/* ── Panther UX System ─────────────────────────────── */}
        <Route path={"/"} component={Home} />
        <Route path={"/assess"} component={Assess} />
        <Route path={"/train"} component={Train} />
        <Route path={"/correct"} component={Correct} />
        <Route path={"/profile"} component={Profile} />

        {/* ── Feature screens ───────────────────────────────── */}
        <Route path={"/jarvis"} component={JarvisChat} />
        <Route path={"/live"} component={LiveCoaching} />

        {/* ── Legacy screens ────────────────────────────────── */}
        <Route path={"/move"} component={Move} />
        <Route path={"/fuel"} component={Fuel} />
        <Route path={"/feast"} component={Feast} />
        <Route path={"/vault"} component={Vault} />
        <Route path={"/progress"} component={Progress} />
        <Route path={"/showcase"} component={ComponentShowcase} />

        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
      <TufBottomNav />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
