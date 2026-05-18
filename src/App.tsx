import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Pricing from "./pages/Pricing";
import ForHomes from "./pages/ForHomes";
import ForBrands from "./pages/ForBrands";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Demo from "./pages/Demo";
import DemoV2 from "./pages/DemoV2";
import BookDemo from "./pages/BookDemo";
import Viz2dDemo from "./visualizer-demo";
import Dashboard from "./pages/app/Dashboard";
import Editor from "./pages/app/Editor";
import Admin from "./pages/app/Admin";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Security from "./pages/Security";

const queryClient = new QueryClient();

function AppRoutes() {
  const { initialize } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/login" element={<Navigate to="/demo" replace />} />
        <Route path="/signup" element={<Navigate to="/demo" replace />} />
        <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
        <Route path="/for-homes" element={<PageTransition><ForHomes /></PageTransition>} />
        <Route path="/for-brands" element={<PageTransition><ForBrands /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/book-demo" element={<PageTransition><BookDemo /></PageTransition>} />
        <Route path="/demo" element={<PageTransition><Viz2dDemo /></PageTransition>} />
        <Route path="/demo-v2" element={<PageTransition><DemoV2 /></PageTransition>} />
        <Route path="/demo-layers" element={<PageTransition><Demo /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/security" element={<PageTransition><Security /></PageTransition>} />

        {/* Protected Routes */}
        <Route path="/app" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/app/projects" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/app/editor/:projectId" element={<ProtectedRoute><PageTransition><Editor /></PageTransition></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><PageTransition><Admin /></PageTransition></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      console.error("Unhandled rejection:", event.reason);
      event.preventDefault();
    };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
