import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Smartphone, Building2, ArrowLeft,
  CheckCircle2, Shield, Lock, Loader2, Calendar, User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { appointmentsAPI, paymentsAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

type PaymentMethod = 'card' | 'upi' | 'netbanking';

interface AppointmentData {
  _id: string;
  doctor: { name: string; specialization?: string; fee?: number; _id: string };
  date: string;
  time: string;
  amount: number;
  paymentStatus: string;
  status: string;
}

const BANKS = [
  'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
  'Kotak Mahindra Bank', 'Bank of Baroda', 'Punjab National Bank',
];

export default function PaymentGateway() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  // Form states
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardName, setCardName] = useState('Demo User');
  const [upiId, setUpiId] = useState('demo@upi');
  const [selectedBank, setSelectedBank] = useState(BANKS[0]);

  useEffect(() => {
    if (appointmentId) loadAppointment();
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      const { data } = await appointmentsAPI.getById(appointmentId!);
      const apt = data.data;
      if (apt.paymentStatus === 'paid') {
        toast({ title: 'Already paid', description: 'This appointment has already been paid for.', variant: 'destructive' });
        navigate(-1);
        return;
      }
      setAppointment(apt);
    } catch {
      toast({ title: 'Error', description: 'Failed to load appointment.', variant: 'destructive' });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!appointment) return;
    setProcessing(true);

    // Simulate processing delay for realism
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const { data } = await paymentsAPI.demoPay(appointment._id, method);
      setPaymentData(data.data);
      setSuccess(true);
      toast({ title: '✅ Payment Successful!' });
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.response?.data?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const amount = appointment?.amount || appointment?.doctor?.fee || 500;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ──────────────── SUCCESS SCREEN ────────────────
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg"
      >
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          {/* Animated Checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.5 }}
            >
              <CheckCircle2 className="h-14 w-14 text-green-500" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-1">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">Your appointment has been confirmed & paid</p>
          </motion.div>

          {/* Receipt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="rounded-xl border border-border bg-muted/30 p-5 text-left mb-6"
          >
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor</span>
                <span className="font-medium text-foreground">{appointment?.doctor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{appointment?.date} at {appointment?.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium text-foreground capitalize">{method === 'netbanking' ? 'Net Banking' : method.toUpperCase()}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-muted-foreground font-semibold">Amount Paid</span>
                <span className="font-bold text-lg text-green-600">₹{amount}</span>
              </div>
              {paymentData?.razorpayPaymentId && (
                <div className="border-t border-border pt-3">
                  <span className="text-muted-foreground text-xs">Transaction ID</span>
                  <p className="font-mono text-xs text-foreground mt-1 break-all select-all bg-card rounded-lg px-3 py-2 border border-border/50">
                    {paymentData.razorpayPaymentId}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <Button
            onClick={() => navigate('/dashboard/patient/appointments')}
            className="w-full gradient-primary text-primary-foreground"
          >
            Back to Appointments
          </Button>
        </div>
      </motion.div>
    );
  }

  // ──────────────── PAYMENT FORM ────────────────
  const methods: { key: PaymentMethod; label: string; icon: React.ElementType }[] = [
    { key: 'card', label: 'Card', icon: CreditCard },
    { key: 'upi', label: 'UPI', icon: Smartphone },
    { key: 'netbanking', label: 'Net Banking', icon: Building2 },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="font-heading text-2xl font-bold text-foreground">Payment</h1>
        <p className="mt-1 text-muted-foreground">Complete your appointment payment securely</p>
      </motion.div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Left — Appointment Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Order Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {appointment?.doctor?.name?.charAt(0) || 'D'}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{appointment?.doctor?.name}</p>
                  <p className="text-xs text-primary">{appointment?.doctor?.specialization}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {appointment?.date} at {appointment?.time}
              </div>
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Consultation Fee</span>
                <span className="text-sm font-medium">₹{amount}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">Tax</span>
                <span className="text-sm font-medium text-green-600">₹0</span>
              </div>
              <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">₹{amount}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              <span>Secure payment • 256-bit SSL encryption</span>
            </div>
          </div>
        </motion.div>

        {/* Right — Payment Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            {/* Method Tabs */}
            <div className="flex gap-2 mb-6">
              {methods.map(m => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                    method === m.key
                      ? 'gradient-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  }`}
                >
                  <m.icon className="h-4 w-4" />
                  {m.label}
                </button>
              ))}
            </div>

            {/* Card Form */}
            <AnimatePresence mode="wait">
              {method === 'card' && (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                        placeholder="1234 5678 9012 3456"
                      />
                      <CreditCard className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Name on card"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">CVV</label>
                      <div className="relative">
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                          placeholder="•••"
                          maxLength={4}
                        />
                        <Lock className="absolute right-3 top-3.5 h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Demo mode — pre-filled with test card details
                  </p>
                </motion.div>
              )}

              {method === 'upi' && (
                <motion.div
                  key="upi"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">UPI ID</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="yourname@upi"
                      />
                      <Smartphone className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-4 text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                      <Smartphone className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      A payment request will be sent to your UPI app
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Demo mode — any UPI ID will work
                  </p>
                </motion.div>
              )}

              {method === 'netbanking' && (
                <motion.div
                  key="netbanking"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={e => setSelectedBank(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {BANKS.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-4 text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You will be redirected to your bank's payment page
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Demo mode — no actual redirect
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pay Button */}
            <Button
              onClick={handlePay}
              disabled={processing}
              className="mt-6 w-full gradient-primary text-primary-foreground h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Pay ₹{amount}
                </span>
              )}
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              By proceeding, you agree to MediAI's payment terms
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
