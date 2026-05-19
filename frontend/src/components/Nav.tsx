import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  LogOut,
  Plus,
  Menu,
  X,
  SquareKanban,
  Briefcase,
  Settings,
} from "lucide-react";

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `applet-button inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-neutral-900 text-white shadow-soft"
        : "text-neutral-700 hover:bg-white/70 hover:text-neutral-950"
    }`;

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/applications", label: "Applications", icon: FileText },
    { to: "/board", label: "Board", icon: SquareKanban },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/open-jobs", label: "Open Jobs", icon: Briefcase },
  ];

  // Public navbar for unauthenticated users
  if (!user) {
    const publicNavItems = [
      { to: "/", label: "Home" },
      { to: "/features", label: "Features" },
      { to: "/about", label: "About" },
      { to: "/login", label: "Login" },
    ];

    return (
      <nav className="sticky top-0 z-40 border-b border-neutral-900/10 bg-neutral-50/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between min-h-16">
            <div className="flex">
              <div className="shrink-0 flex items-center">
                <Link
                  to="/"
                  className="applet-button inline-flex items-center rounded-full pr-3 font-display text-xl font-extrabold tracking-tight text-neutral-950"
                >
                  <span className="mr-2 grid h-8 w-8 place-items-center rounded-full bg-brand-700 text-sm text-white shadow-glow">
                    A
                  </span>
                  Applyt
                </Link>
              </div>
              {/* Desktop Navigation */}
              <div className="hidden sm:ml-8 sm:flex sm:items-center sm:gap-1">
                {publicNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={linkClass}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Desktop Right Side - Sign Up Button */}
            <div className="hidden sm:flex items-center space-x-4">
              <Link
                to="/signup"
                className="applet-button inline-flex items-center rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white shadow-soft-lg hover:bg-brand-700"
              >
                Start tracking
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="applet-button inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-neutral-800 hover:bg-white"
                aria-expanded={mobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                className="sm:hidden"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              >
              <div className="space-y-1 border-t border-neutral-900/10 py-3">
                {publicNavItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={handleNavClick}
                    className="applet-button block rounded-2xl px-4 py-3 text-base font-semibold text-neutral-800 hover:bg-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="border-t border-neutral-900/10 pb-3 pt-4">
                <Link
                  to="/signup"
                  onClick={handleNavClick}
                  className="applet-button block rounded-2xl bg-neutral-900 px-4 py-3 text-center text-base font-bold text-white hover:bg-brand-700"
                >
                  Start tracking
                </Link>
              </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-neutral-900/10 bg-neutral-50/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between min-h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <Link
                to="/dashboard"
                className="applet-button inline-flex items-center rounded-full pr-3 font-display text-xl font-extrabold tracking-tight text-neutral-950"
              >
                <span className="mr-2 grid h-8 w-8 place-items-center rounded-full bg-brand-700 text-sm text-white shadow-glow">
                  A
                </span>
                Applyt
              </Link>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:items-center sm:gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={linkClass}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden sm:flex items-center space-x-4">
            <Link
              to="/applications/new"
              className="applet-button inline-flex items-center rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white shadow-soft-lg hover:bg-brand-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </Link>
            <div className="flex items-center space-x-3">
              <Link
                to="/settings"
                className="applet-button inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-white hover:text-neutral-950"
              >
                <Settings className="mr-2 h-4 w-4" />
                {user?.name}
              </Link>
              <button
                onClick={handleLogout}
                className="applet-button inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-error-light hover:text-error-dark"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="applet-button inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-neutral-800 hover:bg-white"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="sm:hidden"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          >
          <div className="space-y-1 border-t border-neutral-900/10 px-4 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={handleNavClick}
                  className="applet-button flex items-center rounded-2xl px-4 py-3 text-base font-semibold text-neutral-800 hover:bg-white"
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="border-t border-neutral-900/10 px-4 pb-3 pt-4">
            <div className="flex items-center px-4 mb-3">
              <div className="text-base font-medium text-neutral-800">
                {user?.name}
              </div>
            </div>
            <div className="space-y-1">
              <Link
                to="/applications/new"
                onClick={handleNavClick}
                className="applet-button flex items-center rounded-2xl bg-neutral-900 px-4 py-3 text-base font-bold text-white hover:bg-brand-700"
              >
                <Plus className="w-5 h-5 mr-3" />
                New Application
              </Link>
              <Link
                to="/settings"
                onClick={handleNavClick}
                className="applet-button block rounded-2xl px-4 py-3 text-base font-semibold text-neutral-800 hover:bg-white"
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  handleNavClick();
                  handleLogout();
                }}
                className="applet-button flex w-full items-center rounded-2xl px-4 py-3 text-base font-semibold text-error-dark hover:bg-error-light"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
