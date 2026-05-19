import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
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
      <nav className="bg-white/80 backdrop-blur-md shadow-soft border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="shrink-0 flex items-center">
                <Link
                  to="/"
                  className="font-display text-2xl font-bold gradient-text"
                >
                  Applyt
                </Link>
              </div>
              {/* Desktop Navigation */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-2">
                {publicNavItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop Right Side - Sign Up Button */}
            <div className="hidden sm:flex items-center space-x-4">
              <Link
                to="/signup"
                className="inline-flex items-center px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 hover:shadow-elevation-2 hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-neutral-700 hover:text-brand-600 hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
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
          {mobileMenuOpen && (
            <div className="sm:hidden">
              <div className="pt-2 pb-3 space-y-1 border-t border-neutral-200">
                {publicNavItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={handleNavClick}
                    className="block px-4 py-3 text-base font-medium text-neutral-700 hover:text-brand-600 hover:bg-brand-50 transition-colors rounded-lg"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="pt-4 pb-3 border-t border-neutral-200">
                <Link
                  to="/signup"
                  onClick={handleNavClick}
                  className="block px-4 py-3 text-base font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors rounded-lg text-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-soft border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <Link
                to="/dashboard"
                className="font-display text-2xl font-bold gradient-text"
              >
                Applyt
              </Link>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-200"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden sm:flex items-center space-x-4">
            <Link
              to="/applications/new"
              className="inline-flex items-center px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 hover:shadow-elevation-2 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </Link>
            <div className="flex items-center space-x-3">
              <Link
                to="/settings"
                className="text-sm font-medium text-neutral-700 hover:text-brand-600 transition-colors"
              >
                {user?.name}
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-neutral-700 hover:text-error-dark hover:bg-error-light rounded-lg transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-1 cursor-pointer" />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-neutral-700 hover:text-brand-600 hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
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

      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 border-t border-neutral-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={handleNavClick}
                  className="flex items-center px-4 py-3 text-base font-medium text-neutral-700 hover:text-brand-600 hover:bg-brand-50 transition-colors rounded-lg"
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-neutral-200">
            <div className="flex items-center px-4 mb-3">
              <div className="text-base font-medium text-neutral-800">
                {user?.name}
              </div>
            </div>
            <div className="space-y-1">
              <Link
                to="/applications/new"
                onClick={handleNavClick}
                className="flex items-center px-4 py-3 text-base font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors rounded-lg"
              >
                <Plus className="w-5 h-5 mr-3" />
                New Application
              </Link>
              <Link
                to="/settings"
                onClick={handleNavClick}
                className="block px-4 py-3 text-base font-medium text-neutral-700 hover:text-brand-600 hover:bg-brand-50 transition-colors rounded-lg"
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  handleNavClick();
                  handleLogout();
                }}
                className="flex items-center w-full px-4 py-3 text-base font-medium text-error-dark hover:bg-error-light transition-colors rounded-lg"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
