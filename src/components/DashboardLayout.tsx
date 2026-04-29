import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Activity, LayoutDashboard, Calendar, User, LogOut,
  Stethoscope, Clock, Star, Users, ShieldCheck, CreditCard,
  Menu, X, FileText, ChevronRight, Brain, MessageCircle, MapPin, LifeBuoy,
  Sun, Moon, AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmergencyModal from '@/components/EmergencyModal';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

const patientNav: NavItem[] = [
  { to: '/dashboard/patient', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/patient/appointments', label: 'My Appointments', icon: Calendar },
  { to: '/dashboard/patient/payments', label: 'Payments', icon: CreditCard },
  { to: '/dashboard/patient/profile', label: 'Profile', icon: User },
];

const doctorNav: NavItem[] = [
  { to: '/dashboard/doctor', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/doctor/appointments', label: 'Appointments', icon: Calendar },
  { to: '/dashboard/doctor/schedule', label: 'Schedule', icon: Clock },
  { to: '/dashboard/doctor/profile', label: 'Profile', icon: User },
];

const adminNav: NavItem[] = [
  { to: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/admin/doctors', label: 'Manage Doctors', icon: Stethoscope },
  { to: '/dashboard/admin/users', label: 'Manage Users', icon: Users },
  { to: '/dashboard/admin/appointments', label: 'Appointments', icon: Calendar },
  { to: '/dashboard/admin/support', label: 'Support', icon: LifeBuoy },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { isOnline } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const userIsOnline = user?._id ? isOnline(user._id) : false;

  const navItems = user?.role === 'admin' ? adminNav
    : user?.role === 'doctor' ? doctorNav
    : patientNav;

  const roleLabel = user?.role === 'admin' ? 'Administrator'
    : user?.role === 'doctor' ? 'Doctor'
    : 'Patient';

  const roleBadgeClass = user?.role === 'admin'
    ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20'
    : user?.role === 'doctor'
    ? 'bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20'
    : 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20';

  return (
    <>
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — glass effect with accent line */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[270px] flex flex-col glass-card border-r-0 rounded-none transition-transform duration-300 ease-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Gradient accent line */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-accent/20 to-primary/10" />

        {/* Logo */}
        <div className="flex items-center justify-between border-b border-border/40 px-5 py-4 shrink-0">
          <Link to={navItems[0]?.to || '/'} className="group flex items-center gap-2.5">
            <div className="gradient-primary rounded-xl p-2 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground tracking-tight">
              Medi<span className="gradient-text">AI</span>
            </span>
          </Link>
          <button className="md:hidden text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        <div className="border-b border-border/40 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-11 w-11 rounded-full gradient-primary flex items-center justify-center text-lg font-bold text-primary-foreground shadow-md">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              {/* Status dot — dynamic online/offline */}
              <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card transition-colors duration-300 ${userIsOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeClass}`}>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-primary bg-primary/8'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full gradient-primary"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <item.icon className={`h-4 w-4 transition-colors ${isActive ? 'text-primary' : ''}`} />
                  {item.label}
                  {isActive && (
                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary/50" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Features — only for patients */}
          {user?.role === 'patient' && (
            <div className="mt-6 border-t border-border/40 pt-4">
              <p className="mb-2 px-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Features
              </p>
              {[
                { to: '/', label: 'Home', icon: Activity },
                { to: '/symptom-checker', label: 'Symptom Checker', icon: Brain },
                { to: '/doctors', label: 'Doctors', icon: Stethoscope },
                { to: '/chatbot', label: 'AI Assistant', icon: MessageCircle },
                { to: '/report-analyzer', label: 'Report Analyzer', icon: FileText },
                { to: '/nearby-doctors', label: 'Nearby Hospitals', icon: MapPin },
                { to: '/support', label: 'Support', icon: LifeBuoy },
              ].map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-primary bg-primary/8'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full gradient-primary"
                      />
                    )}
                    <link.icon className={`h-4 w-4 transition-colors ${isActive ? 'text-primary' : ''}`} />
                    {link.label}
                    {isActive && (
                      <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary/50" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Emergency + Theme Toggle + Sign Out */}
        <div className="border-t border-border/40 p-3 shrink-0 space-y-1">
          <button
            onClick={() => { setSidebarOpen(false); setEmergencyOpen(true); }}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-md"
          >
            <AlertTriangle className="h-4 w-4" />
            🚨 Emergency
          </button>
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={() => { logout(); setSidebarOpen(false); }}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/8 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center justify-between glass-navbar px-4 py-3 md:hidden shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-heading text-lg font-bold text-foreground tracking-tight">
            Medi<span className="gradient-text">AI</span>
          </span>
          <button
            onClick={() => setEmergencyOpen(true)}
            className="rounded-xl p-2 bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-sm"
            title="Emergency"
          >
            <AlertTriangle className="h-5 w-5" />
          </button>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>

    {/* Emergency Modal */}
    <EmergencyModal open={emergencyOpen} onOpenChange={setEmergencyOpen} />
    </>
  );
}
