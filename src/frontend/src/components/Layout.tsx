import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu", ocid: "nav.menu_link" },
  { to: "/reservations", label: "Reservations", ocid: "nav.reservations_link" },
  { to: "/admin", label: "Admin", ocid: "nav.admin_link" },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center group"
              data-ocid="nav.home_link"
            >
              <div data-ocid="nav.logo">
                <img
                  src="/assets/uploads/Screenshot-2026-03-09-013815-1.png"
                  alt="Khatta Meetha Cloud Kitchen"
                  className="h-12 w-auto object-contain"
                />
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    data-ocid={link.ocid}
                    className={`px-4 py-2 rounded-md text-sm font-ui font-medium transition-all duration-200 ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Auth + Mobile toggle */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleAuth}
                disabled={loginStatus === "logging-in"}
                variant={isAuthenticated ? "outline" : "default"}
                size="sm"
                className="hidden md:flex font-ui"
              >
                {loginStatus === "logging-in"
                  ? "Signing in..."
                  : isAuthenticated
                    ? "Sign Out"
                    : "Sign In"}
              </Button>

              {/* Mobile hamburger */}
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border overflow-hidden"
            >
              <nav className="px-4 py-3 flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      data-ocid={link.ocid}
                      onClick={() => setMobileOpen(false)}
                      className={`px-4 py-3 rounded-md text-sm font-ui font-medium transition-all ${
                        isActive
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <Button
                  onClick={() => {
                    handleAuth();
                    setMobileOpen(false);
                  }}
                  disabled={loginStatus === "logging-in"}
                  variant={isAuthenticated ? "outline" : "default"}
                  className="mt-2 w-full font-ui"
                >
                  {loginStatus === "logging-in"
                    ? "Signing in..."
                    : isAuthenticated
                      ? "Sign Out"
                      : "Sign In"}
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center mb-3">
                <img
                  src="/assets/uploads/Screenshot-2026-03-09-013815-1.png"
                  alt="Khatta Meetha Cloud Kitchen"
                  className="h-16 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-ui">
                A symphony of sweet &amp; sour flavors. Authentic Indian cuisine
                crafted with love and tradition.
              </p>
            </div>

            {/* Hours */}
            <div>
              <h4 className="font-display text-foreground font-semibold mb-3">
                Opening Hours
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground font-ui">
                <li className="flex justify-between">
                  <span>Monday – Thursday</span>
                  <span>12:00 – 22:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Friday – Saturday</span>
                  <span>12:00 – 23:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday</span>
                  <span>13:00 – 21:00</span>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display text-foreground font-semibold mb-3">
                Find Us
              </h4>
              <address className="not-italic space-y-1 text-sm text-muted-foreground font-ui">
                <p>42 Spice Market Lane</p>
                <p>Old Delhi Quarter, ND 110001</p>
                <p className="mt-2">+91 98765 43210</p>
                <p>namaste@khattameetha.in</p>
              </address>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground font-ui">
            © {new Date().getFullYear()} KHATTA MEETHA. Built with{" "}
            <span className="text-primary">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
