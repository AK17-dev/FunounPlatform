import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Facebook,
  Home,
  Instagram,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Shield,
  ShoppingCart,
  UserCircle,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

export function RightSidebar() {
  const { user, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isOwnerOrStaff = profile?.role === "owner" || profile?.role === "staff";
  const isSuperAdmin = profile?.role === "super_admin";

  // Build nav items based on role
  const navItems: NavItem[] = [
    { to: "/", icon: <Home className="h-5 w-5" />, label: "Home" },
  ];

  if (user) {
    navItems.push({
      to: "/account",
      icon: <UserCircle className="h-5 w-5" />,
      label: "Account",
    });
  } else {
    navItems.push({
      to: "/login",
      icon: <LogIn className="h-5 w-5" />,
      label: "Login",
    });
  }

  if (isSuperAdmin) {
    navItems.push({
      to: "/admin",
      icon: <Shield className="h-5 w-5" />,
      label: "Admin",
    });
  } else if (isOwnerOrStaff) {
    navItems.push({
      to: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
    });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          DESKTOP — fixed full-height right panel
          ═══════════════════════════════════════════════════════ */}
      <aside
        className="fixed right-0 top-0 z-50 hidden h-screen w-[220px] flex-col
                   border-l border-white/[0.06] lg:flex"
        style={{ background: "linear-gradient(180deg, #1a1025 0%, #0d0a12 100%)" }}
      >
        {/* ── Logo / Brand ───────────────────────────────────── */}
        <Link to="/" className="group flex flex-col items-center gap-1 px-4 pt-7 pb-5">
          <motion.img
            src="/logo-new.png"
            alt="Funoun Logo"
            className="h-16 w-16 object-contain"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <span className="text-base font-bold text-white/90 drop-shadow-sm">
              <span className="latin-part">Funoun/</span>
              <span className="arabic-part" dir="rtl" lang="ar">فنون</span>
            </span>
            <span className="text-[10px] text-white/40 font-light tracking-[0.15em] uppercase mt-0.5">
              Handmade with love
            </span>
          </motion.div>
        </Link>

        {/* thin divider */}
        <span className="mx-6 h-px bg-white/[0.08]" />

        {/* ── Nav Items ──────────────────────────────────────── */}
        <nav className="flex flex-col gap-1 px-3 pt-4">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-200 ${active
                    ? "bg-purple-500/20 text-white"
                    : "text-white/50 hover:bg-white/[0.05] hover:text-white/90"
                  }`}
              >
                <span className={`transition-transform duration-200 group-hover:scale-110 ${active ? "scale-110" : ""}`}>
                  {item.icon}
                </span>
                <span className="text-[13px] font-medium">{item.label}</span>
                {active && (
                  <motion.span
                    layoutId="panel-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-purple-400"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* thin divider */}
        <span className="mx-6 mt-4 h-px bg-white/[0.08]" />

        {/* ── Social / Utility Icons ─────────────────────────── */}
        <div className="flex flex-col gap-1 px-3 pt-4">
          {/* Cart */}
          <Link
            to="/cart"
            className={`group relative flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-200 ${isActive("/cart")
                ? "bg-purple-500/20 text-white"
                : "text-white/50 hover:bg-white/[0.05] hover:text-white/90"
              }`}
          >
            <span className="relative transition-transform duration-200 group-hover:scale-110">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full
                                 bg-purple-500 text-white text-[9px] leading-none font-bold
                                 flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </span>
            <span className="text-[13px] font-medium">Cart</span>
          </Link>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/abdelkaderkhanjii?igsh=MWk4dXdraDhjdDE2"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl px-4 py-2.5
                       text-white/50 transition-all duration-200 hover:bg-white/[0.05] hover:text-white/90"
          >
            <Instagram className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="text-[13px] font-medium">Instagram</span>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/96176511373"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl px-4 py-2.5
                       text-white/50 transition-all duration-200 hover:bg-white/[0.05] hover:text-white/90"
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F3e1cfa77093d456fa9220d6a72e6b46f%2F14aff025dfec4490b3e2c7a489b951f0?format=webp&width=800"
              alt="WhatsApp"
              className="h-5 w-5 object-contain transition-transform duration-200 group-hover:scale-110"
            />
            <span className="text-[13px] font-medium">WhatsApp</span>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/share/18pStMaAAX/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl px-4 py-2.5
                       text-white/50 transition-all duration-200 hover:bg-white/[0.05] hover:text-white/90"
          >
            <Facebook className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="text-[13px] font-medium">Facebook</span>
          </a>
        </div>

        {/* ── Logout (pinned bottom) ─────────────────────────── */}
        {user && (
          <div className="mt-auto px-3 pb-6">
            <button
              onClick={signOut}
              className="group flex w-full items-center gap-3 rounded-xl px-4 py-2.5
                         text-red-400/60 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-[13px] font-medium">Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* ═══════════════════════════════════════════════════════
          MOBILE — compact top bar + hamburger + drawer
          ═══════════════════════════════════════════════════════ */}

      {/* Top bar (mobile/tablet only) */}
      <header
        className="fixed top-0 left-0 w-full z-50 flex items-center justify-between
                   h-14 px-4 border-b border-white/[0.06] lg:hidden"
        style={{ background: "linear-gradient(135deg, #1a1025 0%, #0d0a12 100%)" }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo-new.png" alt="Funoun Logo" className="h-9 w-9 object-contain" />
          <span className="text-sm font-bold text-white/90">
            <span className="latin-part">Funoun/</span>
            <span className="arabic-part" dir="rtl" lang="ar">فنون</span>
          </span>
        </Link>

        {/* Hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center h-10 w-10 rounded-lg
                     text-white/60 transition-colors hover:text-white hover:bg-white/[0.06]"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Spacer so page content isn't hidden behind fixed mobile top bar */}
      <div className="h-14 lg:hidden" />

      {/* ── Mobile Slide-in Drawer ────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 flex h-screen w-72 flex-col
                         border-l border-white/[0.06] lg:hidden overflow-y-auto"
              style={{ background: "linear-gradient(180deg, #1a1025 0%, #0d0a12 100%)" }}
            >
              {/* Close + logo */}
              <div className="flex items-center justify-between px-4 pt-5 pb-3">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                  <img src="/logo-new.png" alt="Funoun Logo" className="h-10 w-10 object-contain" />
                  <span className="text-sm font-bold text-white/90">
                    <span className="latin-part">Funoun/</span>
                    <span className="arabic-part" dir="rtl" lang="ar">فنون</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 text-white/50 transition-colors hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <span className="mx-5 h-px bg-white/[0.08]" />

              {/* Nav items */}
              <nav className="flex flex-col gap-1 px-3 pt-4">
                {navItems.map((item) => {
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${active
                          ? "bg-purple-500/20 text-white"
                          : "text-white/50 hover:bg-white/[0.05] hover:text-white/90"
                        }`}
                    >
                      <span className="transition-transform duration-200 group-hover:scale-110">
                        {item.icon}
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                      {active && (
                        <motion.span
                          layoutId="mobile-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-purple-400"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <span className="mx-5 mt-3 h-px bg-white/[0.08]" />

              {/* Social / utility */}
              <div className="flex flex-col gap-1 px-3 pt-3">
                <Link
                  to="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="group relative flex items-center gap-3 rounded-xl px-4 py-3
                             text-white/50 transition-all duration-200 hover:bg-white/[0.05] hover:text-white/90"
                >
                  <span className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full
                                       bg-purple-500 text-white text-[9px] leading-none font-bold
                                       flex items-center justify-center">
                        {itemCount > 99 ? "99+" : itemCount}
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-medium">Cart</span>
                </Link>

                <a href="https://www.instagram.com/funoun_by_fatima?igsh=MXFvbWZ1eGh2djg4NA=="
                  target="_blank" rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl px-4 py-3
                              text-white/50 transition-all duration-200 hover:bg-white/[0.05] hover:text-white/90">
                  <Instagram className="h-5 w-5" />
                  <span className="text-sm font-medium">Instagram</span>
                </a>

                <a href="https://wa.me/96176511373" target="_blank" rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl px-4 py-3
                              text-white/50 transition-all duration-200 hover:bg-white/[0.05] hover:text-white/90">
                  <img src="https://cdn.builder.io/api/v1/image/assets%2F3e1cfa77093d456fa9220d6a72e6b46f%2F14aff025dfec4490b3e2c7a489b951f0?format=webp&width=800"
                    alt="WhatsApp" className="h-5 w-5 object-contain" />
                  <span className="text-sm font-medium">WhatsApp</span>
                </a>

                <a href="https://www.facebook.com/share/18pStMaAAX/" target="_blank" rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl px-4 py-3
                              text-white/50 transition-all duration-200 hover:bg-white/[0.05] hover:text-white/90">
                  <Facebook className="h-5 w-5" />
                  <span className="text-sm font-medium">Facebook</span>
                </a>
              </div>

              {/* Logout */}
              {user && (
                <div className="mt-auto px-3 pb-6 pt-4">
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="group flex w-full items-center gap-3 rounded-xl px-4 py-3
                               text-red-400/60 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
