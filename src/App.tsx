import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Admin from "./pages/Admin.tsx";
import Maintenance from "./pages/Maintenance.tsx";
import Games from "./pages/Games.tsx";
import Apps from "./pages/Apps.tsx";
import Tools from "./pages/Tools.tsx";
import Settings from "./pages/Settings.tsx";
import Auth from "./pages/Auth.tsx";
import Messages from "./pages/Messages.tsx";
import Quests from "./pages/Quests.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import { AuthProvider } from "./hooks/useAuth";
import { useEffect, useState } from "react";
import { Onboarding, needsOnboarding } from "./pages/Onboarding.tsx";

const queryClient = new QueryClient();

const AppGate = ({ children }: { children: React.ReactNode }) => {
  const [show, setShow] = useState<boolean>(false);
  useEffect(() => { setShow(needsOnboarding()); }, []);
  return (
    <>
      {children}
      {show && <Onboarding onDone={() => setShow(false)} />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
        <AppGate>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/games" element={<Games />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/maintenance" element={<Maintenance />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AppGate>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
