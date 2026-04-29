import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { doctorsAPI, authAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function DoctorProfile() {
  const { user } = useAuth();
  // Fields are now at root level in the Doctor collection (no more doctorProfile nesting)
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialization, setSpecialization] = useState(user?.specialization || user?.doctorProfile?.specialization || '');
  const [experience, setExperience] = useState(String(user?.experience ?? user?.doctorProfile?.experience ?? 0));
  const [fee, setFee] = useState(String(user?.fee ?? user?.doctorProfile?.fee ?? 500));
  const [bio, setBio] = useState(user?.bio || user?.doctorProfile?.bio || '');
  const [qualification, setQualification] = useState(user?.qualification || user?.doctorProfile?.qualification || '');
  const [clinicAddress, setClinicAddress] = useState(user?.clinicAddress || user?.doctorProfile?.clinicAddress || '');
  const [available, setAvailable] = useState(user?.available ?? user?.doctorProfile?.available ?? true);
  const [loading, setLoading] = useState(false);

  const rating = user?.rating ?? user?.doctorProfile?.rating ?? 4.0;
  const totalRatings = user?.totalRatings ?? user?.doctorProfile?.totalRatings ?? 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile({ name, phone });
      await doctorsAPI.updateProfile({
        specialization, experience: parseInt(experience), fee: parseInt(fee),
        bio, qualification, clinicAddress,
      });
      await doctorsAPI.updateAvailability({ available });
      toast({ title: '✅ Profile updated successfully' });
    } catch (error: any) {
      toast({ title: error.response?.data?.message || 'Failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold text-foreground">Doctor Profile</h1>
        <p className="mt-1 text-muted-foreground">Update your professional information</p>
      </motion.div>

      <form onSubmit={handleSave} className="mt-6 w-full space-y-5 rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
            {name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="font-heading text-lg font-semibold text-foreground">{name}</p>
            <p className="text-sm text-primary">{specialization}</p>
            <p className="text-xs text-muted-foreground">Rating: ⭐ {rating} ({totalRatings} reviews)</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
            <Input className="h-11" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Phone</label>
            <Input className="h-11" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Specialization</label>
            <Input className="h-11" value={specialization} onChange={e => setSpecialization(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Qualification</label>
            <Input className="h-11" value={qualification} onChange={e => setQualification(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Experience (years)</label>
            <Input type="number" className="h-11" value={experience} onChange={e => setExperience(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Consultation Fee (₹)</label>
            <Input type="number" className="h-11" value={fee} onChange={e => setFee(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Clinic Address</label>
          <Input className="h-11" value={clinicAddress} onChange={e => setClinicAddress(e.target.value)} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Bio</label>
          <textarea
            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell patients about yourself..."
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground">Available for Appointments:</label>
          <button
            type="button"
            onClick={() => setAvailable(!available)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none ${available ? 'bg-green-500' : 'bg-muted'}`}
          >
            <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${available ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className={`text-sm ${available ? 'text-green-600' : 'text-muted-foreground'}`}>
            {available ? 'Available' : 'Not Available'}
          </span>
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
