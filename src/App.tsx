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

// Pages — single-page B2B landing + product demo + app
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refunds from "./pages/Refunds";
import BlogPostPage from "./pages/BlogPost";
import AdminAuth from "./pages/admin/AdminAuth";
import BlogAdmin from "./pages/admin/BlogAdmin";
import BlogEditor from "./pages/admin/BlogEditor";
import Leads from "./pages/admin/Leads";
import Viz2dDemo from "./visualizer-demo";
import Dashboard from "./pages/app/Dashboard";
import Editor from "./pages/app/Editor";
import Admin from "./pages/app/Admin";

const queryClient = new QueryClient();

function AppRoutes() {
  const { initialize } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Home - AI Measurement + Mantha AI */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />

        {/* Contact */}
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />

        {/* Pricing + checkout */}
        <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
        <Route path="/checkout/success" element={<PageTransition><CheckoutSuccess /></PageTransition>} />

        {/* Legal — Stripe expects these to be publicly reachable */}
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/refunds" element={<PageTransition><Refunds /></PageTransition>} />

        {/* Journal */}
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><BlogPostPage /></PageTransition>} />

        {/* Journal admin */}
        <Route path="/admin" element={<AdminAuth />} />
        <Route path="/admin/blog" element={<ProtectedRoute><BlogAdmin /></ProtectedRoute>} />
        <Route path="/admin/blog/:id" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
        <Route path="/admin/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />

        {/* Live product demo */}
        <Route path="/demo" element={<PageTransition><Viz2dDemo /></PageTransition>} />

        {/* Protected app routes */}
        <Route path="/app" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/app/projects" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/app/editor/:projectId" element={<ProtectedRoute><PageTransition><Editor /></PageTransition></ProtectedRoute>} />
        <Route path="/app/admin" element={<ProtectedRoute><PageTransition><Admin /></PageTransition></ProtectedRoute>} />

        {/* Everything else → landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
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
