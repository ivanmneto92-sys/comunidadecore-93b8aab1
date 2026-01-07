import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Results from "./pages/Results";
import Community from "./pages/Community";
import Academy from "./pages/Academy";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Affiliates from "./pages/Affiliates";
import StreakHistory from "./pages/StreakHistory";
import Achievements from "./pages/Achievements";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/termos" element={<Terms />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/results" element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            } />
            <Route path="/community" element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            } />
            <Route path="/academy" element={
              <ProtectedRoute>
                <Academy />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/affiliates" element={
              <ProtectedRoute>
                <Affiliates />
              </ProtectedRoute>
            } />
            <Route path="/streaks" element={
              <ProtectedRoute>
                <StreakHistory />
              </ProtectedRoute>
            } />
            <Route path="/achievements" element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
