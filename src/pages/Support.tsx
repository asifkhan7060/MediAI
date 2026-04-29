import { useState, useEffect } from 'react';
import { Building2, Phone, Mail, MapPin, Edit, Save, X, Info, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supportAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

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

export default function Support() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

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
        toast.success("Hospital information updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update. Only admins can edit.");
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />

      <div className="container relative mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold font-heading mb-2 sm:mb-4 text-foreground">Contact & Support</h1>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
            Get in touch with our primary care facility.
          </p>
        </div>

        <Card className="glass-card shadow-elevated">
          <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/50 bg-primary/5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="p-2 sm:p-3 bg-primary/10 rounded-xl shrink-0">
                  <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                {isEditing ? (
                  <div className="space-y-1 min-w-0 flex-1">
                    <Input 
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      className="font-bold text-base sm:text-xl h-10"
                    />
                    <div className="flex gap-2 text-sm mt-2 items-center">
                       Status: 
                       <Input 
                          value={editForm.status} 
                          onChange={e => setEditForm({...editForm, status: e.target.value})}
                          className="h-7 w-24 text-xs"
                       />
                    </div>
                  </div>
                ) : (
                  <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-2xl truncate">{hospitalData.name}</CardTitle>
                    <span className="inline-flex items-center mt-1 sm:mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                      {hospitalData.status}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Edit button — admin only */}
              {isAdmin && (
                <>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2 shrink-0 self-start">
                      <Edit className="h-4 w-4" /> Edit Details
                    </Button>
                  ) : (
                    <div className="flex gap-2 shrink-0 self-start">
                      <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-2 text-muted-foreground">
                        <X className="h-4 w-4" /> Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2 gradient-primary btn-premium">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-6 pt-5 sm:pt-6 space-y-6 sm:space-y-8">
            {/* About Section */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary shrink-0" /> About Us
              </h3>
              {isEditing ? (
                <Textarea 
                  value={editForm.about}
                  onChange={e => setEditForm({...editForm, about: e.target.value})}
                  rows={4}
                  className="resize-none text-sm"
                />
              ) : (
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {hospitalData.about}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-5 sm:pt-6 border-t border-border/50">
              {/* Contact Details */}
              <div className="space-y-4 sm:space-y-5">
                <h3 className="font-semibold text-base sm:text-lg">Contact Information</h3>
                
                <div className="space-y-3 sm:space-y-4">
                  {/* Address */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="mt-0.5 p-2 bg-primary/10 rounded-lg shrink-0">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
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
                          <span className="text-xs sm:text-sm text-muted-foreground block mb-0.5">Address</span>
                          <span className="font-medium text-sm sm:text-base">{hospitalData.address}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Phone */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="mt-0.5 p-2 bg-primary/10 rounded-lg shrink-0">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
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
                          <span className="text-xs sm:text-sm text-muted-foreground block mb-0.5">Phone</span>
                          <span className="font-medium text-sm sm:text-base">{hospitalData.phone}</span>
                       </div>
                    )}
                  </div>
                  
                  {/* Email */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="mt-0.5 p-2 bg-primary/10 rounded-lg shrink-0">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
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
                          <span className="text-xs sm:text-sm text-muted-foreground block mb-0.5">Email</span>
                          <span className="font-medium text-sm sm:text-base break-all">{hospitalData.email}</span>
                       </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3 sm:space-y-4">
                 <h3 className="font-semibold text-base sm:text-lg">Quick Support</h3>
                 <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 sm:p-5 space-y-4 sm:space-y-5">
                    <p className="text-xs sm:text-sm text-muted-foreground">Our support team is available 24/7 for urgent clinical or technical inquiries. Reach out to us anytime.</p>
                    <div className="flex flex-col gap-3">
                      <Button 
                          className="w-full gap-2 gradient-primary text-primary-foreground btn-premium text-sm" 
                          onClick={() => toast.success("Calling Support Center...")}
                       >
                        <Phone className="h-4 w-4" /> Call Support Now
                      </Button>
                      <Button 
                          variant="outline" 
                          className="w-full gap-2 glass text-sm" 
                          onClick={() => {
                             window.location.href = `mailto:${hospitalData.email}`;
                             toast.info("Opening default email client...");
                          }}
                       >
                        <Mail className="h-4 w-4" /> Send Email
                      </Button>
                    </div>
                 </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
