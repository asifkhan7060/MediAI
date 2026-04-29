import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, XCircle, Star, MessageCircle, CreditCard, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { appointmentsAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import RateDoctorDialog from '@/components/RateDoctorDialog';

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // Rating Dialog State
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [rateAppointment, setRateAppointment] = useState<{ id: string; docName: string } | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await appointmentsAPI.getMy({ limit: 50 });
      setAppointments(data.data || []);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await appointmentsAPI.cancel(id);
      toast({ title: 'Appointment cancelled' });
      loadData();
    } catch (error: any) {
      toast({ title: error.response?.data?.message || 'Failed', variant: 'destructive' });
    }
  };

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter);

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600',
    confirmed: 'bg-green-500/10 text-green-600',
    completed: 'bg-blue-500/10 text-blue-600',
    cancelled: 'bg-red-500/10 text-red-600',
    rejected: 'bg-red-500/10 text-red-600',
  };

  const filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold text-foreground">My Appointments</h1>
        <p className="mt-1 text-muted-foreground">View and manage your appointments</p>
      </motion.div>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${
              filter === f
                ? 'gradient-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {f} ({f === 'all' ? appointments.length : appointments.filter(a => a.status === f).length})
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No {filter !== 'all' ? filter : ''} appointments found</p>
          </div>
        ) : (
          filtered.map((apt) => (
            <motion.div
              key={apt._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-border bg-card p-4 shadow-card"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-lg font-bold text-primary-foreground">
                    {apt.doctor?.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{apt.doctor?.name || 'Doctor'}</p>
                    <p className="text-sm text-primary">{apt.doctor?.doctorProfile?.specialization}</p>
                    <p className="text-xs text-muted-foreground">{apt.date} at {apt.time} • ₹{apt.amount || apt.doctor?.doctorProfile?.fee || 0}</p>
                    {apt.symptoms && (
                      <p className="text-xs text-muted-foreground mt-0.5">Symptoms: {apt.symptoms}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor[apt.status] || ''}`}>
                    {apt.status}
                  </span>
                  {/* Payment Badge / Pay Now */}
                  {apt.paymentStatus === 'paid' ? (
                    <span className="rounded-full px-3 py-1 text-xs font-medium bg-green-500/10 text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Paid
                    </span>
                  ) : ['confirmed', 'completed'].includes(apt.status) ? (
                    <Button
                      size="sm"
                      onClick={() => navigate(`/dashboard/patient/payment/${apt._id}`)}
                      className="gradient-primary text-primary-foreground border-0"
                    >
                      <CreditCard className="mr-1 h-3.5 w-3.5" /> Pay Now
                    </Button>
                  ) : null}
                  {['pending', 'confirmed'].includes(apt.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel(apt._id)}
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <XCircle className="mr-1 h-3.5 w-3.5" /> Cancel
                    </Button>
                  )}
                  {['confirmed', 'completed'].includes(apt.status) && apt.doctor?._id && (
                    <Link to={`/dashboard/patient/chat/${apt.doctor._id}`} className="relative inline-block">
                      <Button size="sm" variant="outline" className="text-primary border-primary/30 hover:bg-primary/10">
                        <MessageCircle className="mr-1 h-3.5 w-3.5" /> Chat
                      </Button>
                      {apt.unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background z-10 animate-pulse">
                          {apt.unreadCount > 9 ? '9+' : apt.unreadCount}
                        </span>
                      )}
                    </Link>
                  )}
                  {apt.status === 'completed' && !apt.isReviewed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRateAppointment({ id: apt._id, docName: apt.doctor?.name || 'Doctor' });
                        setRateDialogOpen(true);
                      }}
                      className="text-amber-600 border-amber-600/30 hover:bg-amber-600/10"
                    >
                      <Star className="mr-1 h-3.5 w-3.5" /> Rate Doctor
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {rateAppointment && (
        <RateDoctorDialog
          open={rateDialogOpen}
          onOpenChange={setRateDialogOpen}
          appointmentId={rateAppointment.id}
          doctorName={rateAppointment.docName}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
