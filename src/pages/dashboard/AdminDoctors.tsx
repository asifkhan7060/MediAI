import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, CheckCircle, XCircle, Search, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Registration States
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, [filter, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (filter !== 'all') params.approval = filter;
      if (search) params.search = search;
      const { data } = await adminAPI.getDoctors(params);
      setDoctors(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApproval = async (id: string, status: string) => {
    try {
      await adminAPI.approveDoctor(id, status);
      toast({ title: `Doctor ${status}!` });
      loadData();
    } catch (error: any) {
      toast({ title: error.response?.data?.message || 'Failed', variant: 'destructive' });
    }
  };

  const filters = ['all', 'pending', 'approved', 'rejected'];
  const statusColor: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600',
    approved: 'bg-green-500/10 text-green-600',
    rejected: 'bg-red-500/10 text-red-600',
  };

  // Group and sort doctors by domain/specialization perfectly
  const rankingsByDomain = useMemo(() => {
    const approvedDocs = doctors.filter(d => d.doctorProfile?.isApproved === 'approved');
    const grouped: Record<string, any[]> = {};
    
    approvedDocs.forEach(doc => {
      const spec = doc.doctorProfile?.specialization || 'General Physician';
      if (!grouped[spec]) grouped[spec] = [];
      grouped[spec].push(doc);
    });

    Object.keys(grouped).forEach(spec => {
      grouped[spec].sort((a, b) => {
        const ratingA = a.doctorProfile?.rating || 0;
        const ratingB = b.doctorProfile?.rating || 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return (b.doctorProfile?.totalRatings || 0) - (a.doctorProfile?.totalRatings || 0);
      });
    });

    return grouped;
  }, [doctors]);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold text-foreground">Doctor Management</h1>
        <p className="mt-1 text-muted-foreground">Approve accounts or review public specialized rankings</p>
      </motion.div>

      <Tabs defaultValue="manage" className="mt-6 w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="manage">Manage Registrations</TabsTrigger>
          <TabsTrigger value="rankings">Specialization Rankings</TabsTrigger>
        </TabsList>

        {/* =====================
            REGISTRATIONS TAB
            ===================== */}
        <TabsContent value="manage">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-11 pl-10" placeholder="Search doctors..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
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
          </div>

          <div className="mt-6 space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)
            ) : doctors.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <Stethoscope className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No doctors found</p>
              </div>
            ) : (
              doctors.map(doc => (
                <div key={doc._id} className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    {/* Avatar — fixed size */}
                    <div className="h-12 w-12 shrink-0 rounded-full gradient-primary flex items-center justify-center text-lg font-bold text-primary-foreground">
                      {doc.name?.charAt(0)}
                    </div>

                    {/* Info — grows but truncates */}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{doc.name}</p>
                      <p className="text-sm text-primary truncate">{doc.doctorProfile?.specialization}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {doc.email} • {doc.doctorProfile?.experience}y exp • ₹{doc.doctorProfile?.fee}
                      </p>
                    </div>

                    {/* Status + Actions — fixed to right, never wraps */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize whitespace-nowrap ${statusColor[doc.doctorProfile?.isApproved] || ''}`}>
                        {doc.doctorProfile?.isApproved}
                      </span>
                      {doc.doctorProfile?.isApproved === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleApproval(doc._id, 'approved')} className="gradient-primary border-0 text-primary-foreground whitespace-nowrap">
                            <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleApproval(doc._id, 'rejected')} className="text-destructive border-destructive/30 whitespace-nowrap">
                            <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                          </Button>
                        </>
                      )}
                      {doc.doctorProfile?.isApproved === 'rejected' && (
                        <Button size="sm" variant="outline" onClick={() => handleApproval(doc._id, 'approved')} className="whitespace-nowrap">
                          Re-Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* =====================
            RANKINGS TAB
            ===================== */}
        <TabsContent value="rankings">
          <div className="space-y-8">
            {Object.keys(rankingsByDomain).length === 0 && !loading && (
              <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
                 No approved doctors available to rank yet.
              </div>
            )}
            
            {Object.entries(rankingsByDomain).map(([specialization, docs]) => (
              <div key={specialization} className="rounded-xl border border-border bg-card shadow-card p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                  <Award className="h-5 w-5 text-amber-500" />
                  <h3 className="font-heading text-lg font-bold text-foreground">Top {specialization}s</h3>
                </div>
                
                <div className="space-y-3">
                  {docs.map((doc, index) => (
                    <div key={doc._id} className="flex items-center justify-between p-3 transition-colors hover:bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-8 w-8 items-center justify-center font-bold rounded-lg ${
                            index === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20' : 
                            index === 1 ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-500/20' : 
                            index === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20' : 
                            'bg-muted text-muted-foreground'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.doctorProfile?.experience} years experience</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 rounded-full text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="font-bold">{doc.doctorProfile?.rating?.toFixed(1) || "New"}</span>
                        <span className="text-xs opacity-75 ml-1">({doc.doctorProfile?.totalRatings || 0})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}
