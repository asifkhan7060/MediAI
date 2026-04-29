import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, MessageCircle, Banknote, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { appointmentsAPI, paymentsAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await appointmentsAPI.getDoctor({ limit: 100 });
      setAppointments(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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

  const handleCashPaid = async (id: string) => {
    try {
      await paymentsAPI.markCashPaid(id);
      toast({ title: '✅ Cash payment recorded' });
      loadData();
    } catch (error: any) {
      toast({ title: error.response?.data?.message || 'Failed', variant: 'destructive' });
    }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);
  const filters = ['all', 'pending', 'confirmed', 'completed', 'rejected', 'cancelled'];

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
        <h1 className="font-heading text-2xl font-bold text-foreground">Manage Appointments</h1>
        <p className="mt-1 text-muted-foreground">Accept, reject, or complete appointments</p>
      </motion.div>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${
              filter === f ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {f} ({f === 'all' ? appointments.length : appointments.filter(a => a.status === f).length})
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No {filter !== 'all' ? filter : ''} appointments</p>
          </div>
        ) : (
          filtered.map(apt => (
            <div key={apt._id} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full gradient-accent flex items-center justify-center text-lg font-bold text-primary-foreground">
                    {apt.patient?.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{apt.patient?.name}</p>
                    <p className="text-xs text-muted-foreground">{apt.patient?.email} • {apt.patient?.phone}</p>
                    <p className="text-xs text-muted-foreground">{apt.date} at {apt.time}</p>
                    {apt.symptoms && <p className="text-xs text-primary mt-0.5">Symptoms: {apt.symptoms}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor[apt.status]}`}>{apt.status}</span>
                  {/* Payment Badge */}
                  {apt.paymentStatus === 'paid' ? (
                    <span className="rounded-full px-3 py-1 text-xs font-medium bg-green-500/10 text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Paid
                    </span>
                  ) : ['confirmed', 'completed'].includes(apt.status) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCashPaid(apt._id)}
                      className="text-green-600 border-green-600/30 hover:bg-green-600/10"
                    >
                      <Banknote className="mr-1 h-3.5 w-3.5" /> Mark Cash Received
                    </Button>
                  ) : null}
                  {apt.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => handleStatus(apt._id, 'confirmed')} className="gradient-primary border-0 text-primary-foreground">
                        <CheckCircle className="mr-1 h-3.5 w-3.5" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleStatus(apt._id, 'rejected')} className="text-destructive border-destructive/30">
                        <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                      </Button>
                    </>
                  )}
                  {apt.status === 'confirmed' && (
                    <Button size="sm" variant="outline" onClick={() => handleStatus(apt._id, 'completed')}>
                      <CheckCircle className="mr-1 h-3.5 w-3.5" /> Complete
                    </Button>
                  )}
                  {['confirmed', 'completed'].includes(apt.status) && apt.patient?._id && (
                    <Link to={`/dashboard/doctor/chat/${apt.patient._id}`} className="relative inline-block">
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
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
