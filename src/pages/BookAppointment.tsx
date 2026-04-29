import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Clock, ArrowLeft, CheckCircle, Stethoscope, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { doctorsAPI, appointmentsAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00"];

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  fee: number;
}

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isPatient } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    loadDoctor();
  }, [doctorId]);

  const loadDoctor = async () => {
    try {
      const { data } = await doctorsAPI.getById(doctorId!);
      const d = data.data;
      setDoctor({
        id: d.id || d._id,
        name: d.name,
        specialization: d.specialization,
        experience: d.experience,
        fee: d.fee,
      });
    } catch (error) {
      console.error("Failed to load doctor:", error);
    }
  };

  const handleBook = async () => {
    if (!isAuthenticated) {
      toast({ title: "Please login to book an appointment", variant: "destructive" });
      navigate("/login");
      return;
    }

    if (!isPatient) {
      toast({ title: "Only patients can book appointments", variant: "destructive" });
      return;
    }

    if (!date || !time) {
      toast({ title: "Please select date and time", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data } = await appointmentsAPI.book({
        doctorId,
        date,
        time,
        symptoms,
      });
      if (data.success) {
        setBooked(true);
      }
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || "Booking failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (booked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 relative">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative text-center glass-card rounded-3xl p-6 sm:p-10 w-full max-w-md"
        >
          <div className="mx-auto mb-4 sm:mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-emerald-500/10 ring-4 ring-emerald-500/20">
            <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-500" />
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Appointment Booked!</h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Your appointment with <span className="font-semibold text-foreground">{doctor?.name}</span> on{" "}
            <span className="font-semibold text-foreground">{date}</span> at{" "}
            <span className="font-semibold text-foreground">{time}</span> is pending doctor confirmation.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate("/dashboard/patient/appointments")} className="gradient-primary border-0 text-primary-foreground btn-premium rounded-xl text-sm">
              View My Appointments
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" className="rounded-xl glass border-border/50 text-sm">
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />

      <div className="container relative mx-auto max-w-2xl px-4 py-8 md:py-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Doctor info card */}
          <div className="mb-6 glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-lg ring-2 ring-primary/20 ring-offset-2 ring-offset-card">
                  {doctor.name.charAt(0)}
                </div>
              </div>
              <div>
                <h1 className="font-heading text-xl font-bold text-foreground">{doctor.name}</h1>
                <p className="text-primary font-medium">{doctor.specialization}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {doctor.experience} years experience · ₹{doctor.fee} consultation
                </p>
              </div>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-center">
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-3">
                Please login to book an appointment
              </p>
              <Button onClick={() => navigate("/login")} variant="outline" size="sm" className="rounded-xl">
                Login Now
              </Button>
            </div>
          )}

          {/* Booking form */}
          <div className="space-y-5 glass-card rounded-2xl p-7">
            <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" /> Book Appointment
            </h2>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Select Date *</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="h-12 rounded-xl border-border/60 bg-background/50 focus:border-primary/40 transition-all"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                <Clock className="mr-1 inline h-4 w-4" /> Select Time Slot *
              </label>
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                      time === t
                        ? "gradient-primary text-primary-foreground shadow-md"
                        : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Symptoms (optional)</label>
              <Input
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms..."
                className="h-12 rounded-xl border-border/60 bg-background/50 focus:border-primary/40 transition-all"
              />
            </div>

            <Button
              onClick={handleBook}
              disabled={loading || !isAuthenticated}
              className="w-full h-13 gradient-primary border-0 text-primary-foreground text-base btn-premium rounded-xl"
              style={{ height: 52 }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Booking...
                </span>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Confirm Booking · ₹{doctor.fee}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
