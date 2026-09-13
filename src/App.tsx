import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/app/AppShell";
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
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Overview from "./pages/app/Overview";
import Templates from "./pages/app/Templates";
import Library from "./pages/app/Library";
import Create from "./pages/app/Create";
import Settings from "./pages/app/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

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

        {/* Journal admin — signed-out visitors go to the CMS login, not the customer one */}
        <Route path="/admin" element={<AdminAuth />} />
        <Route path="/admin/blog" element={<ProtectedRoute redirectTo="/admin"><BlogAdmin /></ProtectedRoute>} />
        <Route path="/admin/blog/:id" element={<ProtectedRoute redirectTo="/admin"><BlogEditor /></ProtectedRoute>} />
        <Route path="/admin/leads" element={<ProtectedRoute redirectTo="/admin"><Leads /></ProtectedRoute>} />

        {/* Live product demo */}
        <Route path="/demo" element={<PageTransition><Viz2dDemo /></PageTransition>} />

        {/* Customer auth */}
        <Route path="/login" element={<GuestRoute><PageTransition><Login /></PageTransition></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><PageTransition><Signup /></PageTransition></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><PageTransition><ForgotPassword /></PageTransition></GuestRoute>} />
        {/* Not a GuestRoute: the reset link signs the visitor in, and they must stay here to set a password */}
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />

        {/* Signed-in app */}
        <Route path="/app" element={<ProtectedRoute><AppShell><Overview /></AppShell></ProtectedRoute>} />
        <Route path="/app/templates" element={<ProtectedRoute><AppShell><Templates /></AppShell></ProtectedRoute>} />
        <Route path="/app/library" element={<ProtectedRoute><AppShell><Library /></AppShell></ProtectedRoute>} />
        <Route path="/app/create" element={<ProtectedRoute><AppShell><Create /></AppShell></ProtectedRoute>} />
        <Route path="/app/settings" element={<ProtectedRoute><AppShell><Settings /></AppShell></ProtectedRoute>} />
        {/* Old editor URLs (/app/projects, /app/editor/…) land on the new overview */}
        <Route path="/app/*" element={<Navigate to="/app" replace />} />

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
