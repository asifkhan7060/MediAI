import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Phone, Mail, MapPin, Edit, Save, X, Info, Loader2, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supportAPI } from '@/lib/api';

interface HospitalData {
  name: string;
  address: string;
  phone: string;
  email: string;
  about: string;
  status: string;
}

const defaultData: HospitalData = {
  name: "MediAI Central Hospital",
  address: "123 Healthcare Ave, Medical District",
  phone: "+1 (555) 012-3456",
  email: "support@mediai.health",
  about: "MediAI Central Hospital is a state-of-the-art facility dedicated to providing comprehensive and advanced medical care.",
  status: "Active"
};

export default function AdminSupport() {
  const [hospitalData, setHospitalData] = useState<HospitalData>(defaultData);
  const [editForm, setEditForm] = useState<HospitalData>(defaultData);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supportAPI.get();
      if (data.success && data.data) {
        const s = data.data;
        const settings: HospitalData = {
          name: s.name || defaultData.name,
          address: s.address || defaultData.address,
          phone: s.phone || defaultData.phone,
          email: s.email || defaultData.email,
          about: s.about || defaultData.about,
          status: s.status || defaultData.status,
        };
        setHospitalData(settings);
        setEditForm(settings);
      }
    } catch (error) {
      console.error('Failed to load support settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await supportAPI.update(editForm);
      if (data.success) {
        setHospitalData(editForm);
        setIsEditing(false);
        toast({ title: '✅ Updated!', description: 'Hospital information saved successfully.' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update settings.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(hospitalData);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Support & Hospital Info</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage contact information visible to all users</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="gap-2 gradient-primary border-0 text-primary-foreground btn-premium rounded-xl">
              <Edit className="h-4 w-4" /> Edit Details
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-2 text-muted-foreground rounded-xl">
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2 gradient-primary btn-premium rounded-xl">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      <div className="space-y-5">
        {/* Hospital Name & Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-card"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl shrink-0">
              <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </div>
            {isEditing ? (
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Hospital Name</label>
                  <Input
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    className="h-10 font-semibold text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                  <Input
                    value={editForm.status}
                    onChange={e => setEditForm({...editForm, status: e.target.value})}
                    className="h-9 text-sm w-40"
                  />
                </div>
              </div>
            ) : (
              <div className="min-w-0">
                <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground truncate">{hospitalData.name}</h2>
                <span className="inline-flex items-center mt-1 gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-3 w-3" /> {hospitalData.status}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-card"
        >
          <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-primary shrink-0" /> About Hospital
          </h3>
          {isEditing ? (
            <Textarea
              value={editForm.about}
              onChange={e => setEditForm({...editForm, about: e.target.value})}
              rows={4}
              className="resize-none text-sm"
              placeholder="Describe the hospital..."
            />
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">{hospitalData.about}</p>
          )}
        </motion.div>

        {/* Contact Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-card"
        >
          <h3 className="font-semibold text-sm sm:text-base mb-4">Contact Details</h3>
          <div className="space-y-4">
            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-primary/10 rounded-lg shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              {isEditing ? (
                <div className="min-w-0 flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Address</label>
                  <Input
                    value={editForm.address}
                    onChange={e => setEditForm({...editForm, address: e.target.value})}
                    className="h-10 text-sm"
                  />
                </div>
              ) : (
                <div className="min-w-0">
                  <span className="text-xs text-muted-foreground block mb-0.5">Address</span>
                  <span className="font-medium text-sm">{hospitalData.address}</span>
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-primary/10 rounded-lg shrink-0">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              {isEditing ? (
                <div className="min-w-0 flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                  <Input
                    value={editForm.phone}
                    onChange={e => setEditForm({...editForm, phone: e.target.value})}
                    className="h-10 text-sm"
                  />
                </div>
              ) : (
                <div className="min-w-0">
                  <span className="text-xs text-muted-foreground block mb-0.5">Phone</span>
                  <span className="font-medium text-sm">{hospitalData.phone}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-primary/10 rounded-lg shrink-0">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              {isEditing ? (
                <div className="min-w-0 flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                  <Input
                    value={editForm.email}
                    onChange={e => setEditForm({...editForm, email: e.target.value})}
                    className="h-10 text-sm"
                  />
                </div>
              ) : (
                <div className="min-w-0">
                  <span className="text-xs text-muted-foreground block mb-0.5">Email</span>
                  <span className="font-medium text-sm break-all">{hospitalData.email}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
