import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, googleLogin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Autoclean credentials on arriving at login page
  useEffect(() => {
    logout();
  }, [logout]);

  const from = (location.state as any)?.from?.pathname || '/';

  const navigateToDashboard = (user: any) => {
    const dashboardPaths: Record<string, string> = {
      patient: '/dashboard/patient',
      doctor: '/dashboard/doctor',
      admin: '/dashboard/admin',
    };
    navigate(dashboardPaths[user.role] || from, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast({ title: '✅ ' + result.message });
      const user = JSON.parse(localStorage.getItem('mediai_user') || '{}');
      navigateToDashboard(user);
    } else {
      toast({ title: result.message, variant: 'destructive' });
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const result = await googleLogin();
    setGoogleLoading(false);

    if (result.success) {
      toast({ title: '✅ ' + result.message });
      const user = JSON.parse(localStorage.getItem('mediai_user') || '{}');
      navigateToDashboard(user);
    } else {
      if (result.message !== 'Google sign-in was cancelled.') {
        toast({ title: result.message, variant: 'destructive' });
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="gradient-primary rounded-xl p-2.5">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-heading text-2xl font-bold text-foreground">
              Medi<span className="gradient-text">AI</span>
            </span>
          </Link>
          <h1 className="font-heading text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to continue to MediAI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 glass-card rounded-2xl p-7">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="email"
                className="h-12 pl-11 rounded-xl border-border/60 bg-background/50 focus:border-primary/40 focus:ring-primary/20 transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type={showPassword ? 'text' : 'password'}
                className="h-12 pl-11 pr-11 rounded-xl border-border/60 bg-background/50 focus:border-primary/40 focus:ring-primary/20 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full h-12 gradient-primary border-0 text-primary-foreground text-base btn-premium rounded-xl"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          {/* Google Sign-In */}
          <Button
            type="button"
            variant="outline"
            disabled={loading || googleLoading}
            onClick={handleGoogleLogin}
            className="w-full h-12 rounded-xl border-border/60 bg-background/50 hover:bg-muted/50 text-foreground font-medium transition-all duration-300 gap-3"
          >
            {googleLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create Account
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
