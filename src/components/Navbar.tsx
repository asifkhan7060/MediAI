import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Calendar, MessageCircle, Stethoscope, Menu, X,
  LogIn, LayoutDashboard, LogOut, FileText, MapPin, Brain, Sun, Moon, LifeBuoy, AlertTriangle, ChevronRight, User, CreditCard
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import EmergencyModal from "@/components/EmergencyModal";

const patientNavItems = [
  { to: "/", label: "Home", icon: Activity },
  { to: "/symptom-checker", label: "Symptom Checker", icon: Brain },
  { to: "/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/chatbot", label: "AI Assistant", icon: MessageCircle },
  { to: "/report-analyzer", label: "Report Analyzer", icon: FileText },
  { to: "/nearby-doctors", label: "Nearby Hospitals", icon: MapPin },
  { to: "/support", label: "Support", icon: LifeBuoy },
];

const patientDashboardItems = [
  { to: "/dashboard/patient", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/patient/appointments", label: "My Appointments", icon: Calendar },
  { to: "/dashboard/patient/payments", label: "Payments", icon: CreditCard },
  { to: "/dashboard/patient/profile", label: "Profile", icon: User },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const { isAuthenticated, user, logout, isDoctor, isAdmin } = useAuth();
  const { isOnline } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const userId = user?._id || (user as any)?.id || '';
  const userIsOnline = userId ? isOnline(userId) : false;

  // Track scroll for glass effect transition (must be before any conditional returns)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't show navbar on dashboard or emergency mode 
  if (location.pathname.startsWith('/dashboard') || location.pathname === '/emergency-mode') return null;

  const dashboardPath = user?.role === 'admin' ? '/dashboard/admin'
    : user?.role === 'doctor' ? '/dashboard/doctor'
    : '/dashboard/patient';

  // Admin and Doctor should only see Dashboard — hide patient-only pages
  const showPatientNav = !isAuthenticated || (!isDoctor && !isAdmin);
  const navItems = showPatientNav ? patientNavItems : [];

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-500 glass-navbar ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        {/* Gradient bottom line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(195, 90%, 38%, 0.2), hsl(262, 70%, 55%, 0.15), transparent)",
          }}
        />

        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          {/* Mobile: Hamburger left */}
          <button
            className="rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/5 md:hidden transition-all duration-200"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo — centered on mobile, left on desktop */}
          <Link
            to={isDoctor || isAdmin ? dashboardPath : "/"}
            className="group flex items-center gap-2.5"
          >
            <div className="relative">
              <div className="gradient-primary rounded-xl p-2 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              {/* Subtle glow ring on hover */}
              <div className="absolute inset-0 rounded-xl gradient-primary opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground tracking-tight">
              Medi<span className="gradient-text">AI</span>
            </span>
          </Link>

          {/* Desktop nav items */}
          <div className="hidden items-center gap-0.5 md:flex">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-300 ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{label}</span>
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-xl bg-primary/8 border border-primary/15"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  {/* Hover glow */}
                  {!active && (
                    <div className="absolute inset-0 rounded-xl bg-foreground/0 hover:bg-foreground/[0.03] transition-colors duration-300" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Theme toggle + Auth buttons — desktop */}
          <div className="hidden items-center gap-2 md:flex">
            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl glass border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-2 text-muted-foreground hover:text-destructive rounded-xl transition-all duration-300"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-300"
                  >
                    <LogIn className="h-4 w-4" /> Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="gradient-primary border-0 text-primary-foreground rounded-xl btn-premium"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: Emergency button — always visible on right side */}
          <button
            className="rounded-xl p-2 bg-red-600 hover:bg-red-700 text-white md:hidden transition-all duration-200 shadow-sm"
            onClick={() => setEmergencyOpen(true)}
            title="Emergency"
          >
            <AlertTriangle className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* ═══ Mobile Sidebar — dashboard-style slide-in ═══ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] md:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute inset-y-0 left-0 w-[280px] flex flex-col glass-card border-r-0 rounded-none shadow-elevated"
            >
              {/* Accent line */}
              <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-accent/20 to-primary/10" />

              {/* Header: Logo + Close */}
              <div className="flex items-center justify-between border-b border-border/40 px-5 py-4 shrink-0">
                <Link
                  to={isDoctor || isAdmin ? dashboardPath : "/"}
                  onClick={() => setMobileOpen(false)}
                  className="group flex items-center gap-2.5"
                >
                  <div className="gradient-primary rounded-xl p-2">
                    <Activity className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-heading text-lg font-bold text-foreground tracking-tight">
                    Medi<span className="gradient-text">AI</span>
                  </span>
                </Link>
                <button
                  className="text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User info (if authenticated) */}
              {isAuthenticated && user && (
                <div className="border-b border-border/40 px-5 py-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-11 w-11 rounded-full gradient-primary flex items-center justify-center text-lg font-bold text-primary-foreground shadow-md">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card transition-colors duration-300 ${userIsOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20'
                          : user.role === 'doctor'
                          ? 'bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20'
                      }`}>
                        {user.role === 'admin' ? 'Administrator' : user.role === 'doctor' ? 'Doctor' : 'Patient'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Nav items */}
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                {/* ── Patient Dashboard Links (top section) ── */}
                {isAuthenticated && user?.role === 'patient' && (
                  <>
                    <p className="mb-2 px-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                      My Account
                    </p>
                    <div className="space-y-1">
                      {patientDashboardItems.map(({ to, label, icon: Icon }, i) => {
                        const isActive = location.pathname === to;
                        return (
                          <motion.div
                            key={to}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                          >
                            <Link
                              to={to}
                              onClick={() => setMobileOpen(false)}
                              className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                                isActive
                                  ? "text-primary bg-primary/8"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              }`}
                            >
                              {isActive && (
                                <motion.div
                                  layoutId="mobile-dash-active"
                                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full gradient-primary"
                                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                />
                              )}
                              <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-primary' : ''}`} />
                              {label}
                              {isActive && (
                                <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary/50" />
                              )}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* ── Features Links (below dashboard links) ── */}
                {navItems.length > 0 && (
                  <>
                    {isAuthenticated && user?.role === 'patient' && (
                      <p className="mt-5 mb-2 px-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                        Features
                      </p>
                    )}
                    <div className="space-y-1">
                      {navItems.map(({ to, label, icon: Icon }, i) => {
                        const isActive = location.pathname === to;
                        return (
                          <motion.div
                            key={to}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (isAuthenticated && user?.role === 'patient' ? patientDashboardItems.length : 0 + i) * 0.03 }}
                          >
                            <Link
                              to={to}
                              onClick={() => setMobileOpen(false)}
                              className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                                isActive
                                  ? "text-primary bg-primary/8"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              }`}
                            >
                              {isActive && (
                                <motion.div
                                  layoutId="mobile-nav-active"
                                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full gradient-primary"
                                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                />
                              )}
                              <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-primary' : ''}`} />
                              {label}
                              {isActive && (
                                <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary/50" />
                              )}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Emergency Button — always visible for all roles */}
                <div className="mt-4 border-t border-border/40 pt-4">
                  <button
                    onClick={() => { setMobileOpen(false); setEmergencyOpen(true); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-md"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    🚨 Emergency
                  </button>
                </div>

                {/* Quick actions */}
                <div className="mt-4 border-t border-border/40 pt-4">
                  {/* Theme toggle */}
                  <button
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>

                  {isAuthenticated ? (
                    <>
                      {/* Dashboard link only for doctor/admin (patients already have it above) */}
                      {(isDoctor || isAdmin) && (
                        <Link
                          to={dashboardPath}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" /> Dashboard
                        </Link>
                      )}
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <LogIn className="h-4 w-4" /> Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium gradient-primary text-primary-foreground rounded-xl mt-1"
                      >
                        <User className="h-4 w-4" /> Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </nav>

              {/* Sign Out — bottom pinned (if authenticated) */}
              {isAuthenticated && (
                <div className="border-t border-border/40 p-3 shrink-0">
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/8 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Modal (triggered from mobile nav) */}
      <EmergencyModal open={emergencyOpen} onOpenChange={setEmergencyOpen} />
    </>
  );
}
