import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Phone, MapPin, Heart, Hospital, Siren, Shield,
  Plus, X, Loader2, User, Droplets, Navigation, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emergencyAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface EmergencyData {
  patient: { name: string; phone: string; bloodGroup: string };
  emergencyNumbers: Record<string, string>;
  nearestHospitals: any[];
  nearestDoctors: any[];
  emergencyContacts: any[];
}

export default function Emergency() {
  const { isAuthenticated } = useAuth();
  const [activated, setActivated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EmergencyData | null>(null);

  // Emergency contacts management
  const [contacts, setContacts] = useState<any[]>([]);
  const [bloodGroup, setBloodGroup] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relation: "" });
  const [loadingContacts, setLoadingContacts] = useState(false);

  useEffect(() => {
    if (isAuthenticated) loadContacts();
  }, [isAuthenticated]);

  const loadContacts = async () => {
    try {
      const { data: res } = await emergencyAPI.getContacts();
      setContacts(res.data.emergencyContacts || []);
      setBloodGroup(res.data.bloodGroup || "");
    } catch {}
  };

  const activateEmergency = async () => {
    if (!isAuthenticated) {
      toast({ title: "Please log in to use Emergency Mode", variant: "destructive" });
      return;
    }

    setLoading(true);

    // Get location
    let lat: number | undefined, lng: number | undefined;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 })
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch {
      // Continue without location
    }

    try {
      const { data: res } = await emergencyAPI.activate({ lat, lng });
      setData(res.data);
      setActivated(true);
      toast({ title: "🚨 Emergency Mode Activated" });
    } catch (err: any) {
      toast({ title: err.response?.data?.message || "Emergency activation failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addContact = async () => {
    if (!newContact.name || !newContact.phone) return;
    const updatedContacts = [...contacts, newContact];
    setLoadingContacts(true);
    try {
      await emergencyAPI.updateContacts({ emergencyContacts: updatedContacts, bloodGroup });
      setContacts(updatedContacts);
      setNewContact({ name: "", phone: "", relation: "" });
      setShowContactForm(false);
      toast({ title: "Emergency contact added" });
    } catch {
      toast({ title: "Failed to save contact", variant: "destructive" });
    } finally {
      setLoadingContacts(false);
    }
  };

  const removeContact = async (index: number) => {
    const updated = contacts.filter((_, i) => i !== index);
    try {
      await emergencyAPI.updateContacts({ emergencyContacts: updated, bloodGroup });
      setContacts(updated);
    } catch {}
  };

  const saveBloodGroup = async (bg: string) => {
    setBloodGroup(bg);
    try {
      await emergencyAPI.updateContacts({ emergencyContacts: contacts, bloodGroup: bg });
    } catch {}
  };

  const getDirectionsUrl = (lat: number, lng: number) =>
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <AnimatePresence mode="wait">
          {!activated ? (
            <motion.div
              key="pre"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Emergency Button */}
              <div className="text-center py-12">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-red-500/10 border-4 border-red-500/30"
                >
                  <Siren className="h-16 w-16 text-red-500" />
                </motion.div>
                <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
                  Emergency Mode
                </h1>
                <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                  Instantly find nearest hospitals, call ambulance, and notify your emergency contacts
                </p>
                <Button
                  onClick={activateEmergency}
                  disabled={loading}
                  className="mt-6 h-16 px-12 text-lg font-bold bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Activating...</>
                  ) : (
                    <><AlertTriangle className="mr-2 h-6 w-6" /> 🚨 ACTIVATE EMERGENCY</>
                  )}
                </Button>
              </div>

              {/* Quick Dial */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-red-500" /> Quick Dial Emergency Numbers
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Ambulance", number: "102", icon: "🚑" },
                    { label: "Police", number: "100", icon: "🚔" },
                    { label: "Emergency", number: "112", icon: "🆘" },
                    { label: "Fire", number: "101", icon: "🚒" },
                  ].map((n) => (
                    <a
                      key={n.number}
                      href={`tel:${n.number}`}
                      className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 hover:bg-red-500/5 hover:border-red-500/30 transition-all text-center"
                    >
                      <span className="text-2xl">{n.icon}</span>
                      <span className="text-sm font-semibold text-foreground">{n.label}</span>
                      <span className="font-heading text-xl font-bold text-red-500">{n.number}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" /> Emergency Contacts
                  </h2>
                  <Button size="sm" variant="outline" onClick={() => setShowContactForm(true)}>
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </Button>
                </div>

                {/* Blood Group */}
                <div className="mb-4 flex items-center gap-3">
                  <Droplets className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">Blood Group:</span>
                  <select
                    value={bloodGroup}
                    onChange={(e) => saveBloodGroup(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1 text-sm"
                  >
                    <option value="">Not set</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                {contacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No emergency contacts added yet. Add contacts so they can be notified in emergencies.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {contacts.map((c, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div>
                          <p className="font-medium text-foreground text-sm">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.phone} {c.relation && `• ${c.relation}`}</p>
                        </div>
                        <div className="flex gap-2">
                          <a href={`tel:${c.phone}`}>
                            <Button size="sm" variant="outline" className="text-green-600 border-green-600/30 h-8">
                              <Phone className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                          <Button size="sm" variant="outline" onClick={() => removeContact(i)} className="text-red-500 border-red-500/30 h-8">
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Contact Form */}
                {showContactForm && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3 border-t border-border pt-4">
                    <Input placeholder="Contact Name" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} />
                    <Input placeholder="Phone Number" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
                    <Input placeholder="Relation (e.g., Father, Spouse)" value={newContact.relation} onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })} />
                    <div className="flex gap-2">
                      <Button onClick={addContact} disabled={loadingContacts} className="gradient-primary text-primary-foreground border-0">
                        {loadingContacts ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Save
                      </Button>
                      <Button variant="outline" onClick={() => setShowContactForm(false)}>Cancel</Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            /* ─── ACTIVATED STATE ─── */
            <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Alert Banner */}
              <motion.div
                animate={{ scale: [1, 1.01, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="rounded-2xl bg-red-600 text-white p-6 text-center shadow-lg shadow-red-500/25"
              >
                <Siren className="h-10 w-10 mx-auto mb-2" />
                <h1 className="font-heading text-2xl font-bold">🚨 EMERGENCY MODE ACTIVE</h1>
                <p className="mt-1 text-red-100">
                  Patient: {data?.patient.name} • Blood Group: {data?.patient.bloodGroup}
                </p>
                <Button onClick={() => setActivated(false)} variant="outline" className="mt-4 text-white border-white/30 hover:bg-white/10">
                  Deactivate
                </Button>
              </motion.div>

              {/* Call Ambulance */}
              <a href="tel:102" className="block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-xl bg-green-600 text-white p-6 flex items-center justify-between shadow-card cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="h-8 w-8" />
                    <div>
                      <p className="font-heading text-xl font-bold">📞 Call Ambulance Now</p>
                      <p className="text-green-100">Dial 102 — National Ambulance Service</p>
                    </div>
                  </div>
                  <span className="text-3xl font-bold">102</span>
                </motion.div>
              </a>

              {/* Nearest Hospitals */}
              {data?.nearestHospitals && data.nearestHospitals.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <h2 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Hospital className="h-5 w-5 text-red-500" /> Nearest Hospitals
                  </h2>
                  <div className="space-y-3">
                    {data.nearestHospitals.map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${
                            i === 0 ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'bg-muted text-muted-foreground'
                          }`}>
                            #{i + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{h.name}</p>
                            <p className="text-xs text-muted-foreground">{h.type} • {h.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {h.distance !== null && (
                            <span className="text-sm font-bold gradient-text">{h.distance} km</span>
                          )}
                          <a href={`tel:${h.phone}`}>
                            <Button size="sm" variant="outline" className="text-green-600 border-green-600/30">
                              <Phone className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                          <a href={getDirectionsUrl(h.lat, h.lng)} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline" className="text-blue-600 border-blue-600/30">
                              <Navigation className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notify Emergency Contacts */}
              {data?.emergencyContacts && data.emergencyContacts.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <h2 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" /> Emergency Contacts — Notify Now
                  </h2>
                  <div className="space-y-2">
                    {data.emergencyContacts.map((c: any, i: number) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div>
                          <p className="font-semibold text-foreground">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.phone} {c.relation && `• ${c.relation}`}</p>
                        </div>
                        <a href={`tel:${c.phone}`}>
                          <Button className="bg-red-600 hover:bg-red-700 text-white">
                            <Phone className="mr-1 h-4 w-4" /> Call Now
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Emergency Numbers */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-red-500" /> All Emergency Helplines
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {data?.emergencyNumbers && Object.entries(data.emergencyNumbers).map(([key, num]) => (
                    <a key={key} href={`tel:${num}`} className="flex flex-col items-center gap-1 rounded-xl border border-border p-3 hover:bg-red-500/5 transition-colors text-center">
                      <span className="text-xl font-bold text-red-500">{num as string}</span>
                      <span className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
