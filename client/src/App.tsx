import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import { useState } from "react";
import { useTierSync } from "./hooks/useTierSync";
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
import PantherChat from "./components/PantherChat";
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
import Schedule from "./pages/Schedule";
import FuelTracker from "./pages/FuelTracker";
import Mindset from "./pages/Mindset";
import Panther30 from "./pages/Panther30";
import Billing from "./pages/Billing";
import HealthIntel from "./pages/HealthIntel";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import Leaderboard from "./pages/Leaderboard";
import Join from "./pages/Join";

// IP Protection
import { TufTermsModal } from "./components/TufTermsModal";
// Tier gating
import { PaywallGate } from "./components/PaywallGate";

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
        <Route path={"/billing"} component={Billing} />
        <Route path={"/challenge"} component={Challenge} />
        {/* <Route path={"/schedule"} component={Schedule} /> */}  {/* hidden — calendar bugs being fixed */}
        <Route path={"/mindset"} component={() => (
          <PaywallGate requiredTier="elite" feature="30-Day Mindset Challenge" description="The Panther Mindset Challenge is available on the CONTROLLED plan and above.">
            <Mindset />
          </PaywallGate>
        )} />
        <Route path={"/panther-30"} component={Panther30} />

        {/* ── Feature screens ───────────────────────────────── */}
        {/* BOA SCAN — accessible on all levels (tier gate removed per user request) */}
        <Route path={"/boa"} component={BiomechanicalOverlay} />

        <Route path={"/panther"} component={() => (
          <PaywallGate requiredTier="core" feature="Panther AI Brain" description="Full clinical AI coaching with 7 body regions and NASM corrective protocols requires the Core plan.">
            <PantherBrain />
          </PaywallGate>
        )} />
        <Route path={"/jarvis"} component={() => (
          <PaywallGate requiredTier="core" feature="Panther AI Brain" description="Full clinical AI coaching requires the Core plan.">
            <PantherBrain />
          </PaywallGate>
        )} />  {/* legacy route alias */}
        <Route path={"/panther-brain"} component={() => (
          <PaywallGate requiredTier="core" feature="Panther AI Brain" description="Full clinical AI coaching requires the Core plan.">
            <PantherBrain />
          </PaywallGate>
        )} />  {/* alias */}
        <Route path={"/panther-chat"} component={() => <PantherChat className="h-screen" />} />
        <Route path={"/live"} component={() => (
          <PaywallGate requiredTier="pro" feature="Live Coaching" description="Real-time 1-on-1 AI coaching sessions are exclusive to the Pro plan.">
            <LiveCoaching />
          </PaywallGate>
        )} />
        <Route path={"/body-comp"} component={() => (
          <PaywallGate requiredTier="core" feature="Body Composition Tracker" description="Advanced body composition analysis requires the Core plan.">
            <BodyComposition />
          </PaywallGate>
        )} />

        {/* ── Legacy screens ────────────────────────────────── */}
        <Route path={"/move"} component={Move} />
        <Route path={"/fuel"} component={Fuel} />
        <Route path={"/fuel-track"} component={FuelTracker} />
        <Route path={"/feast"} component={() => (
          <PaywallGate requiredTier="elite" feature="FEAST Regional Intelligence" description="FEAST regional food coaching is available on the CONTROLLED plan and above.">
            <Feast />
          </PaywallGate>
        )} />
        <Route path={"/vault"} component={Vault} />
        <Route path={"/progress"} component={Progress} />
        <Route path={"/showcase"} component={ComponentShowcase} />
        <Route path={"/pipeline"} component={PantherPipeline} />
        <Route path={"/health-intel"} component={HealthIntel} />
        <Route path={"/payment-success"} component={PaymentSuccess} />
        <Route path={"/payment-cancelled"} component={PaymentCancelled} />
        <Route path={"/leaderboard"} component={Leaderboard} />
        <Route path={"/join"} component={Join} />

        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
      {/* Bottom nav removed — Home IS the navigation hub */}
    </>
  );
}

function App() {
  // Sync subscription tier from server → localStorage on every app mount
  useTierSync();

  // Use sessionStorage so splash plays once per browser session.
  // Resets when the browser/tab is closed, but not on in-app navigation or URL changes.
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem("tuf_splash_shown") === "1"
  );

  const handleSplashComplete = () => {
    sessionStorage.setItem("tuf_splash_shown", "1");
    setSplashDone(true);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster />
          <TufTermsModal />
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
