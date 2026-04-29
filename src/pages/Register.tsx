import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Phone, Activity, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';

export default function Register() {
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [fee, setFee] = useState('');
  const [qualification, setQualification] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const specializations = [
    'General Physician', 'Dermatologist', 'Cardiologist', 'Neurologist',
    'Orthopedic', 'Gastroenterologist', 'Endocrinologist', 'Pulmonologist',
    'Hepatologist', 'Allergist', 'Urologist', 'Proctologist',
    'Infectious Disease Specialist', 'Pediatrician', 'Gynecologist',
    'Psychiatrist', 'Ophthalmologist', 'ENT Specialist', 'Dentist',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    if (role === 'doctor' && !specialization) {
      toast({ title: 'Please select a specialization', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const formData: any = { name, email, password, role, phone, gender };
    if (role === 'doctor') {
      formData.specialization = specialization;
      formData.experience = parseInt(experience) || 0;
      formData.fee = parseInt(fee) || 500;
      formData.qualification = qualification;
    }

    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      toast({ title: '✅ ' + result.message });
      if (role === 'doctor') {
        navigate('/login');
      } else {
        navigate('/dashboard/patient');
      }
    } else {
      toast({ title: result.message, variant: 'destructive' });
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    const result = await googleLogin();
    setGoogleLoading(false);

    if (result.success) {
      toast({ title: '✅ ' + result.message });
      const user = JSON.parse(localStorage.getItem('mediai_user') || '{}');
      const dashboardPaths: Record<string, string> = {
        patient: '/dashboard/patient',
        doctor: '/dashboard/doctor',
        admin: '/dashboard/admin',
      };
      navigate(dashboardPaths[user.role] || from, { replace: true });
    } else {
      if (result.message !== 'Google sign-in was cancelled.') {
        toast({ title: result.message, variant: 'destructive' });
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 relative">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="gradient-primary rounded-xl p-2.5">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-heading text-2xl font-bold text-foreground">
              Medi<span className="gradient-text">AI</span>
            </span>
          </Link>
          <h1 className="font-heading text-3xl font-bold text-foreground">Create Account</h1>
          <p className="mt-2 text-muted-foreground">Join MediAI today — it's free</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 glass-card rounded-2xl p-7">
          {/* Role selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Register as</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`group flex items-center justify-center gap-2.5 rounded-xl border-2 px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                  role === 'patient'
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-border/60 bg-background/50 text-muted-foreground hover:border-muted-foreground/30'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Patient</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`group flex items-center justify-center gap-2.5 rounded-xl border-2 px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                  role === 'doctor'
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-border/60 bg-background/50 text-muted-foreground hover:border-muted-foreground/30'
                }`}
              >
                <Stethoscope className="h-4 w-4" />
                <span>Doctor</span>
              </button>
            </div>
          </div>

          {/* Common fields */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Full Name *</label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input className="h-12 pl-11 rounded-xl border-border/60 bg-background/50 focus:border-primary/40 transition-all" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Email *</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input type="email" className="h-12 pl-11 rounded-xl border-border/60 bg-background/50 focus:border-primary/40 transition-all" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Password *</label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input type="password" className="h-12 pl-11 rounded-xl border-border/60 bg-background/50 focus:border-primary/40 transition-all" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Phone</label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input className="h-12 pl-11 rounded-xl border-border/60 bg-background/50 focus:border-primary/40 transition-all" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Gender</label>
              <select
                className="flex h-12 w-full items-center rounded-xl border border-border/60 bg-background/50 px-3.5 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Doctor-specific fields */}
          {role === 'doctor' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.4 }}
              className="space-y-4 border-t border-border/40 pt-4"
            >
              <p className="text-sm font-semibold gradient-text inline-block">Doctor Details</p>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Specialization *</label>
                <select
                  className="flex h-12 w-full items-center rounded-xl border border-border/60 bg-background/50 px-3.5 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                >
                  <option value="">Select specialization</option>
                  {specializations.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Experience (years)</label>
                  <Input type="number" className="h-12 rounded-xl border-border/60 bg-background/50 focus:border-primary/40 transition-all" placeholder="5" value={experience} onChange={(e) => setExperience(e.target.value)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Fee (₹)</label>
                  <Input type="number" className="h-12 rounded-xl border-border/60 bg-background/50 focus:border-primary/40 transition-all" placeholder="500" value={fee} onChange={(e) => setFee(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Qualification</label>
                <Input className="h-12 rounded-xl border-border/60 bg-background/50 focus:border-primary/40 transition-all" placeholder="MBBS, MD" value={qualification} onChange={(e) => setQualification(e.target.value)} />
              </div>
            </motion.div>
          )}

          <Button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full h-12 gradient-primary border-0 text-primary-foreground text-base btn-premium rounded-xl"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Account...
              </span>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" /> Create Account
              </>
            )}
          </Button>

          {/* Google Sign-Up — only for patients */}
          {role === 'patient' && (
            <>
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-border/60" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-border/60" />
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={loading || googleLoading}
                onClick={handleGoogleSignUp}
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
                    Sign up with Google
                  </>
                )}
              </Button>
            </>
          )}

          {role === 'doctor' && (
            <p className="text-xs text-center text-muted-foreground">
              Doctor accounts require admin approval before you can login.
            </p>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
