import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import { useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TufHeader } from "./components/TufHeader";
import SplashScreen from "./components/SplashScreen";

// Core Panther UX System screens
import Home from "./pages/Home";
import Assess from "./pages/Assess";
import Train from "./pages/Train";
import Correct from "./pages/Correct";
import Profile from "./pages/Profile";

// Onboarding
import Onboarding from "./pages/Onboarding";

// Feature screens
import Goals from "./pages/Goals";
import BiomechanicalOverlay from "./pages/BiomechanicalOverlay";
import JarvisChat from "./pages/JarvisChat";
import PantherBrain from "./pages/PantherBrain";
import LiveCoaching from "./pages/LiveCoaching";
import BodyComposition from "./pages/BodyComposition";

// Legacy screens
import Move from "./pages/Move";
import Fuel from "./pages/Fuel";
import Feast from "./pages/Feast";
import Vault from "./pages/Vault";
import Progress from "./pages/Progress";
import ComponentShowcase from "./pages/ComponentShowcase";
import PantherPipeline from "./pages/PantherPipeline";
import Program from "./pages/Program";
import Evolve from "./pages/Evolve";
import Pricing from "./pages/Pricing";

// New screens
import Challenge from "./pages/Challenge";

function Router() {
  const isOnboarded = localStorage.getItem("tuf_onboarded") === "true";

  return (
    <>
      <TufHeader />
      <Switch>
        {/* ── Onboarding ────────────────────────────────────── */}
        <Route path={"/onboarding"} component={Onboarding} />

        {/* ── Panther UX System ─────────────────────────────── */}
        <Route path={"/"} component={() => !isOnboarded ? <Redirect to="/onboarding" /> : <Home />} />
        <Route path={"/assess"} component={Assess} />
        <Route path={"/train"} component={Train} />
        <Route path={"/correct"} component={Correct} />
        <Route path={"/program"} component={Program} />
        <Route path={"/goals"} component={Goals} />
        <Route path={"/evolve"} component={Evolve} />
        <Route path={"/profile"} component={Profile} />
        <Route path={"/pricing"} component={Pricing} />
        <Route path={"/challenge"} component={Challenge} />

        {/* ── Feature screens ───────────────────────────────── */}
        <Route path={"/boa"} component={BiomechanicalOverlay} />
        <Route path={"/jarvis"} component={PantherBrain} />
        <Route path={"/jarvis-legacy"} component={JarvisChat} />
        <Route path={"/live"} component={LiveCoaching} />
        <Route path={"/body-comp"} component={BodyComposition} />

        {/* ── Legacy screens ────────────────────────────────── */}
        <Route path={"/move"} component={Move} />
        <Route path={"/fuel"} component={Fuel} />
        <Route path={"/feast"} component={Feast} />
        <Route path={"/vault"} component={Vault} />
        <Route path={"/progress"} component={Progress} />
        <Route path={"/showcase"} component={ComponentShowcase} />
        <Route path={"/pipeline"} component={PantherPipeline} />

        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
      {/* Bottom nav removed — Home IS the navigation hub */}
    </>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem("tuf_splash_shown") === "true"
  );

  const handleSplashComplete = () => {
    sessionStorage.setItem("tuf_splash_shown", "true");
    setSplashDone(true);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster />
          {!splashDone && (
            <SplashScreen onComplete={handleSplashComplete} />
          )}
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
