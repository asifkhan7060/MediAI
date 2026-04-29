import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Stethoscope, Activity, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { appointmentsAPI } from '@/lib/api';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await appointmentsAPI.getMy({ limit: 5 });
      const appts = data.data || [];
      setAppointments(appts);
      setStats({
        total: data.pagination?.total || appts.length,
        pending: appts.filter((a: any) => a.status === 'pending').length,
        confirmed: appts.filter((a: any) => a.status === 'confirmed').length,
        completed: appts.filter((a: any) => a.status === 'completed').length,
      });
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Appointments', value: stats.total, icon: Calendar, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Confirmed', value: stats.confirmed, icon: Activity, color: 'text-green-500 bg-green-500/10' },
    { label: 'Completed', value: stats.completed, icon: Stethoscope, color: 'text-purple-500 bg-purple-500/10' },
  ];

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600',
    confirmed: 'bg-green-500/10 text-green-600',
    completed: 'bg-blue-500/10 text-blue-600',
    cancelled: 'bg-red-500/10 text-red-600',
    rejected: 'bg-red-500/10 text-red-600',
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
          Welcome, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="mt-1 text-muted-foreground">Here's an overview of your health journey</p>
      </motion.div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-border bg-card p-4 shadow-card"
          >
            <div className={`mb-3 inline-flex rounded-lg p-2 ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{loading ? '—' : s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link to="/symptom-checker" className="group rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-all">
          <Stethoscope className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-heading font-semibold text-foreground">Check Symptoms</h3>
          <p className="mt-1 text-sm text-muted-foreground">AI-powered disease prediction</p>
          <span className="mt-3 inline-flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Start <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </span>
        </Link>
        <Link to="/doctors" className="group rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-all">
          <Calendar className="h-8 w-8 text-secondary mb-3" />
          <h3 className="font-heading font-semibold text-foreground">Book Appointment</h3>
          <p className="mt-1 text-sm text-muted-foreground">Find & book with a doctor</p>
          <span className="mt-3 inline-flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Browse <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </span>
        </Link>
        <Link to="/chatbot" className="group rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-all">
          <Activity className="h-8 w-8 text-accent mb-3" />
          <h3 className="font-heading font-semibold text-foreground">AI Assistant</h3>
          <p className="mt-1 text-sm text-muted-foreground">Chat for health guidance</p>
          <span className="mt-3 inline-flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Chat <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </span>
        </Link>
      </div>

      {/* Recent Appointments */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">Recent Appointments</h2>
          <Link to="/dashboard/patient/appointments" className="text-sm font-medium text-primary hover:underline">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No appointments yet</p>
            <Link to="/doctors">
              <Button className="mt-4 gradient-primary border-0 text-primary-foreground">
                Book Your First Appointment
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt._id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {apt.doctor?.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{apt.doctor?.name || 'Doctor'}</p>
                    <p className="text-xs text-muted-foreground">
                      {apt.doctor?.doctorProfile?.specialization} • {apt.date} at {apt.time}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor[apt.status] || ''}`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
