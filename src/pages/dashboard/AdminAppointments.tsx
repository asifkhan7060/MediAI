import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { adminAPI } from '@/lib/api';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadData(); }, [filter]);

  const loadData = async () => {
    try {
      const params: any = { limit: 100 };
      if (filter !== 'all') params.status = filter;
      const { data } = await adminAPI.getAppointments(params);
      setAppointments(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected'];
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
        <h1 className="font-heading text-2xl font-bold text-foreground">All Appointments</h1>
        <p className="mt-1 text-muted-foreground">View all appointments across the system</p>
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
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No appointments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Patient</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Doctor</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date & Time</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map(apt => (
                  <tr key={apt._id} className="bg-card">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{apt.patient?.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{apt.patient?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{apt.doctor?.name || '—'}</p>
                      <p className="text-xs text-primary">{apt.doctor?.doctorProfile?.specialization}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{apt.date} {apt.time}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[apt.status]}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        // Treat completed appointments as paid
                        // (legacy records may still have 'unpaid' before the backend fix)
                        const isPaid = apt.paymentStatus === 'paid' || apt.status === 'completed';
                        const isRefunded = apt.paymentStatus === 'refunded' || apt.status === 'cancelled';
                        return (
                          <span className={`text-xs font-medium ${
                            isPaid ? 'text-green-600' :
                            isRefunded ? 'text-amber-600' :
                            'text-muted-foreground'
                          }`}>
                            {isPaid ? 'paid' : isRefunded ? 'refunded' : 'unpaid'}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
