import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function PatientProfile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile({ name, phone, gender, address });
      if (data.success) {
        updateUser(data.data);
        toast({ title: '✅ Profile updated successfully' });
      }
    } catch (error: any) {
      toast({ title: error.response?.data?.message || 'Failed to update', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold text-foreground">My Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your personal information</p>
      </motion.div>

      <form onSubmit={handleSave} className="mt-6 w-full space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
            {name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-heading text-lg font-semibold text-foreground">{name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-11 pl-10" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-11 pl-10" value={user?.email || ''} disabled />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-11 pl-10" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Gender</label>
            <select
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Address</label>
          <Input className="h-11" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your address" />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 gradient-primary border-0 text-primary-foreground hover:opacity-90"
        >
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
