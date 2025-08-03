import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CallProvider } from "@/contexts/CallContext";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";
import GlobalAuthError from "./components/GlobalAuthError";
import LazyLoader, { LazyCall, LazyRate, LazySettings, LazyOnboarding } from "./components/LazyLoader";
import MobileNavigation from "./components/MobileNavigation";
import { useMobile } from "./hooks/useMobile";
import Advanced from "./pages/Advanced";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const { isMobile } = useMobile();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CallProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <GlobalAuthError />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <LazyLoader>
                      <LazyOnboarding />
                    </LazyLoader>
                  </ProtectedRoute>
                } />
                <Route path="/call" element={
                  <ProtectedRoute>
                    <LazyLoader>
                      <LazyCall />
                    </LazyLoader>
                  </ProtectedRoute>
                } />
                <Route path="/rate" element={
                  <ProtectedRoute>
                    <LazyLoader>
                      <LazyRate />
                    </LazyLoader>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <LazyLoader>
                      <LazySettings />
                    </LazyLoader>
                  </ProtectedRoute>
                } />
                <Route path="/advanced" element={<Advanced />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Мобильная навигация */}
              {isMobile && <MobileNavigation />}
            </BrowserRouter>
          </TooltipProvider>
        </CallProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
