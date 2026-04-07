import "./global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageTransition } from "@/components/PageTransition";
import { RightSidebar } from "@/components/RightSidebar";
import { HeroBird } from "@/components/HeroBird";

import Index from "./pages/Index";
import CustomOrder from "./pages/CustomOrder";
import TrackOrder from "./pages/TrackOrder";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Account from "./pages/Account";
import OwnerDashboard from "./pages/OwnerDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RecoveryRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;

    if (hash.includes("type=recovery")) {
      navigate(`/update-password${hash}`, { replace: true });
    }
  }, [navigate]);

  return null;
}

/**
 * AppRoutes — inner component that can call useLocation (inside BrowserRouter).
 * AnimatePresence wraps all routes so exit animations play before the next
 * page enters. mode="wait" ensures sequential: exit → enter.
 */
function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition locationKey="/"><Index /></PageTransition>} />
        <Route path="/products/:id" element={<PageTransition locationKey={location.pathname}><ProductDetails /></PageTransition>} />
        <Route path="/custom-order" element={<PageTransition locationKey="/custom-order"><CustomOrder /></PageTransition>} />
        <Route path="/track" element={<PageTransition locationKey="/track"><TrackOrder /></PageTransition>} />
        <Route path="/cart" element={<PageTransition locationKey="/cart"><Cart /></PageTransition>} />

        <Route path="/login" element={<PageTransition locationKey="/login"><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition locationKey="/register"><Register /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition locationKey="/reset-password"><ResetPassword /></PageTransition>} />
        <Route path="/update-password" element={<PageTransition locationKey="/update-password"><UpdatePassword /></PageTransition>} />

        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <PageTransition locationKey="/account"><Account /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["owner", "staff"]}>
              <PageTransition locationKey="/dashboard"><OwnerDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <PageTransition locationKey="/admin"><SuperAdminDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<PageTransition locationKey="notfound"><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RecoveryRedirect />
            <RightSidebar />
            <HeroBird />
            <div className="lg:pr-[220px]">
              <AppRoutes />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);

/*import "./global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import CustomOrder from "./pages/CustomOrder";
import TrackOrder from "./pages/TrackOrder";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Account from "./pages/Account";
import OwnerDashboard from "./pages/OwnerDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/custom-order" element={<CustomOrder />} />
              <Route path="/track" element={<TrackOrder />} />
              <Route path="/cart" element={<Cart />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/update-password" element={<UpdatePassword />} />

              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={["owner", "staff"]}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={["super_admin"]}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
/*  <Route path="*" element={<NotFound />} />
</Routes>
</BrowserRouter>
</TooltipProvider>
</CartProvider>
</AuthProvider>
</QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);*/
