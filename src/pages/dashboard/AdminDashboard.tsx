import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Stethoscope, Calendar, DollarSign, Clock, CheckCircle,
  ShieldCheck, Brain, TrendingUp, Star, Lightbulb, BarChart3,
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashRes, analyticsRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAnalytics(),
      ]);
      setStats(dashRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    { label: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Total Doctors', value: stats.totalDoctors, icon: Stethoscope, color: 'text-green-500 bg-green-500/10' },
    { label: 'Pending Approvals', value: stats.pendingDoctors, icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Total Appointments', value: stats.totalAppointments, icon: Calendar, color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Completed', value: stats.completedAppointments, icon: CheckCircle, color: 'text-teal-500 bg-teal-500/10' },
    { label: 'Revenue', value: `₹${stats.totalRevenue || 0}`, icon: DollarSign, color: 'text-emerald-500 bg-emerald-500/10' },
  ] : [];

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
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-red-500/10 p-2">
            <ShieldCheck className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">Admin AI Dashboard</h1>
            <p className="text-muted-foreground">System overview with intelligent analytics</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))
        ) : (
          statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-4 shadow-card"
            >
              <div className={`mb-3 inline-flex rounded-lg p-2 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))
        )}
      </div>

      {/* AI Insights */}
      {analytics?.insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-lg font-bold text-foreground">AI-Generated Insights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analytics.insights.map((insight: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">{insight}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts Row 1: Trends + Pie */}
      {analytics && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointment Trends — Line Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-heading font-bold text-foreground">Appointment Trends</h3>
            </div>
            {analytics.appointmentTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={analytics.appointmentTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} name="Total" />
                  <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} name="Completed" />
                  <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} name="Cancelled" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No trend data available yet</p>
            )}
          </motion.div>

          {/* Appointment Status — Donut Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card flex flex-col"
          >
            <h3 className="font-heading font-bold text-foreground mb-4">Status Distribution</h3>
            {analytics.appointmentsByStatus.length > 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={analytics.appointmentsByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                    >
                      {analytics.appointmentsByStatus.map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                      formatter={(value: number, name: string) => [`${value}`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  {analytics.appointmentsByStatus.map((entry: any, i: number) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="text-xs text-muted-foreground capitalize">{entry.name}</span>
                      <span className="text-xs font-semibold text-foreground">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">No status data yet</p>
            )}
          </motion.div>
        </div>
      )}

      {/* Charts Row 2: Bar Chart + Top Doctors */}
      {analytics && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Specializations — Bar Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="font-heading font-bold text-foreground">Top Specializations</h3>
            </div>
            {analytics.topSpecializations.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics.topSpecializations} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Bar dataKey="appointments" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No specialization data yet</p>
            )}
          </motion.div>

          {/* Top Doctors */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-amber-500" />
              <h3 className="font-heading font-bold text-foreground">Top Rated Doctors</h3>
            </div>
            {analytics.topDoctors.length > 0 ? (
              <div className="space-y-3">
                {analytics.topDoctors.map((doc: any, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm ${
                        i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                          : i === 1 ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        #{i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{doc.name}</p>
                        <p className="text-xs text-primary">{doc.specialization}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-foreground">{doc.rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({doc.totalRatings})</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">No doctor data yet</p>
            )}
          </motion.div>
        </div>
      )}

      {/* Recent Appointments Table */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Recent Appointments</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : !stats?.recentAppointments?.length ? (
          <p className="text-muted-foreground text-center py-8">No appointments yet</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Patient</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Doctor</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recentAppointments.map((apt: any) => (
                  <tr key={apt._id} className="bg-card">
                    <td className="px-4 py-3 font-medium text-foreground">{apt.patient?.name || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{apt.doctor?.name || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{apt.date} {apt.time}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[apt.status] || ''}`}>
                        {apt.status}
                      </span>
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
