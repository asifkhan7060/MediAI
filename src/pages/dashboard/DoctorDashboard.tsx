import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { appointmentsAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await appointmentsAPI.getDoctor({ limit: 50 });
      const appts = data.data || [];
      setAppointments(appts);

      const completedAppts = appts.filter((a: any) => a.status === 'completed');
      const fee = user?.fee ?? user?.doctorProfile?.fee ?? 0;

      setStats({
        total: data.pagination?.total || appts.length,
        pending: appts.filter((a: any) => a.status === 'pending').length,
        confirmed: appts.filter((a: any) => a.status === 'confirmed').length,
        completed: completedAppts.length,
        earnings: completedAppts.length * fee,
      });
    } catch (error) {
      console.error('Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await appointmentsAPI.updateStatus(id, { status });
      toast({ title: `Appointment ${status}` });
      loadData();
    } catch (error: any) {
      toast({ title: error.response?.data?.message || 'Failed', variant: 'destructive' });
    }
  };

  const statCards = [
    { label: 'Total Appointments', value: stats.total, icon: Calendar, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-500 bg-green-500/10' },
    { label: 'Earnings', value: `₹${stats.earnings}`, icon: DollarSign, color: 'text-purple-500 bg-purple-500/10' },
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
        <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground md:text-3xl">
          Dr. {user?.name?.split(' ').slice(-1)[0]}'s Dashboard
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{user?.specialization || user?.doctorProfile?.specialization} • {user?.experience ?? user?.doctorProfile?.experience} years experience</p>
      </motion.div>

      {/* Stats */}
      <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-card"
          >
            <div className={`mb-2 sm:mb-3 inline-flex rounded-lg p-1.5 sm:p-2 ${s.color}`}>
              <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-foreground">{loading ? '—' : s.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Pending Appointments */}
      <div className="mt-6 sm:mt-8">
        <h2 className="font-heading text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
          Pending Appointments ({stats.pending})
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : appointments.filter(a => a.status === 'pending').length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 text-center">
            <CheckCircle className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-green-500 mb-2 sm:mb-3" />
            <p className="text-sm text-muted-foreground">No pending appointments! You're all caught up.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.filter(a => a.status === 'pending').map((apt) => (
              <div key={apt._id} className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-card">
                {/* Top: Patient info */}
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full gradient-accent flex items-center justify-center text-xs sm:text-sm font-bold text-primary-foreground shrink-0">
                    {apt.patient?.name?.charAt(0) || 'P'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-sm sm:text-base truncate">{apt.patient?.name}</p>
                    <p className="text-xs text-muted-foreground">{apt.date} at {apt.time}</p>
                    {apt.symptoms && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">Symptoms: {apt.symptoms}</p>
                    )}
                  </div>
                </div>
                {/* Bottom: Action buttons */}
                <div className="mt-2.5 pt-2.5 border-t border-border/30 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleStatus(apt._id, 'confirmed')}
                    className="flex-1 gradient-primary border-0 text-primary-foreground text-xs sm:text-sm rounded-lg"
                  >
                    <CheckCircle className="mr-1 h-3.5 w-3.5" /> Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatus(apt._id, 'rejected')}
                    className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10 text-xs sm:text-sm rounded-lg"
                  >
                    <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Appointments */}
      <div className="mt-6 sm:mt-8">
        <h2 className="font-heading text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">All Appointments</h2>
        {appointments.filter(a => a.status !== 'pending').length === 0 && !loading ? (
          <p className="text-muted-foreground text-center py-6 sm:py-8 text-sm">No appointments yet</p>
        ) : (
          <div className="space-y-3">
            {appointments.filter(a => a.status !== 'pending').slice(0, 10).map((apt) => (
              <div key={apt._id} className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-card">
                {/* Top: Patient + Status badge */}
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-muted flex items-center justify-center text-xs sm:text-sm font-bold text-foreground shrink-0">
                    {apt.patient?.name?.charAt(0) || 'P'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-foreground text-sm sm:text-base truncate">{apt.patient?.name}</p>
                      <span className={`rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium shrink-0 capitalize ${statusColor[apt.status] || ''}`}>
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{apt.date} at {apt.time}</p>
                  </div>
                </div>
                {/* Mark Complete button */}
                {apt.status === 'confirmed' && (
                  <div className="mt-2.5 pt-2.5 border-t border-border/30">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatus(apt._id, 'completed')}
                      className="w-full text-xs sm:text-sm rounded-lg"
                    >
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Mark as Complete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
