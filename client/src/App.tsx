import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Unsubscribe from "./pages/Unsubscribe";
import NotionEmbed from "./pages/NotionEmbed";
import NotionTemplate from "./pages/NotionTemplate";
import ApiDocs from "./pages/ApiDocs";
// import Portals from "./pages/Portals"; // silenced — re-enable when feature is ready

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/embed"} component={NotionEmbed} />
      <Route path={"/notion-template"} component={NotionTemplate} />
      <Route path={"/api-docs"} component={ApiDocs} />
      {/* <Route path={"/portals"} component={Portals} /> */}
      <Route path={"/unsubscribe"} component={Unsubscribe} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
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
        defaultTheme="light"
        // switchable
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
