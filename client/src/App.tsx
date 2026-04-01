import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TufHeader } from "./components/TufHeader";
import { TufBottomNav } from "./components/TufBottomNav";
import Home from "./pages/Home";
import Move from "./pages/Move";
import Fuel from "./pages/Fuel";
import Feast from "./pages/Feast";
import Vault from "./pages/Vault";

function Router() {
  return (
    <>
      <TufHeader />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/move"} component={Move} />
        <Route path={"/fuel"} component={Fuel} />
        <Route path={"/feast"} component={Feast} />
        <Route path={"/vault"} component={Vault} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
      <TufBottomNav />
    </>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
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
