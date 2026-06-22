import { lazy, Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CommandPalette } from "@/components/CommandPalette";
import { PageSkeleton } from "@/components/skeletons";

// Smart home: visitante vê a landing, logado vai pro Dashboard
const HomeRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return <PageSkeleton />;
  }
  return user ? <Navigate to="/app" replace /> : <Landing />;
};



// Lazy load all pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Landing = lazy(() => import("./pages/Landing"));
const Results = lazy(() => import("./pages/Results"));
const Community = lazy(() => import("./pages/Community"));
const Academy = lazy(() => import("./pages/Academy"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Affiliates = lazy(() => import("./pages/Affiliates"));
const StreakHistory = lazy(() => import("./pages/StreakHistory"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Journal = lazy(() => import("./pages/Journal"));
const Seasons = lazy(() => import("./pages/Seasons"));
const Plans = lazy(() => import("./pages/Plans"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Install = lazy(() => import("./pages/Install"));
const MT5 = lazy(() => import("./pages/MT5"));
const NotFound = lazy(() => import("./pages/NotFound"));



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute default
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      refetchOnWindowFocus: false, // Don't refetch when switching tabs
      retry: 1, // Only 1 retry on failure
    },
  },
});

// Skeleton fallback padronizado para qualquer rota lazy
const PageLoader = () => <PageSkeleton />;


const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="instituto-trader-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />

        <Sonner />
        <BrowserRouter>
          <CommandPalette />

          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/termos" element={<Terms />} />
              <Route path="/privacidade" element={<Privacy />} />
              <Route path="/install" element={<Install />} />
              <Route path="/planos" element={<Plans />} />
              <Route path="/" element={<HomeRoute />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/app" element={
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
              <Route path="/journal" element={
                <ProtectedRoute>
                  <Journal />
                </ProtectedRoute>
              } />
              <Route path="/seasons" element={
                <ProtectedRoute>
                  <Seasons />
                </ProtectedRoute>
              } />
              <Route path="/mt5" element={
                <ProtectedRoute>
                  <MT5 />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />

            </Routes>
          </Suspense>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);


export default App;
