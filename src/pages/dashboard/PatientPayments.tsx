import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, Building2, Banknote, Calendar, CheckCircle2, Clock, X, ArrowDownLeft, Copy, Check } from 'lucide-react';
import { paymentsAPI } from '@/lib/api';

const methodIcons: Record<string, React.ElementType> = {
  card: CreditCard,
  upi: Smartphone,
  netbanking: Building2,
  cash: Banknote,
};

const methodLabels: Record<string, string> = {
  card: 'Card',
  upi: 'UPI',
  netbanking: 'Net Banking',
  cash: 'Cash',
};

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  success: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Completed' },
  created: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Pending' },
  failed: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Failed' },
  refunded: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Refunded' },
};

export default function PatientPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const { data } = await paymentsAPI.getMy();
      setPayments(data.data || []);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const copyTxnId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return dateStr; }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold text-foreground">Payment History</h1>
        <p className="mt-1 text-muted-foreground">View all your payment transactions</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-4 shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-lg font-bold text-foreground">₹{totalPaid}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-4 shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Transactions</p>
              <p className="text-lg font-bold text-foreground">{payments.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-4 shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Successful</p>
              <p className="text-lg font-bold text-foreground">{payments.filter(p => p.status === 'success').length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══ Transaction List (GPay-style) ═══ */}
      <div className="mt-6 space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-xl bg-muted" />
          ))
        ) : payments.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No payment history yet</p>
            <p className="text-sm text-muted-foreground mt-1">Payments will appear here after you complete a transaction</p>
          </div>
        ) : (
          payments.map((payment, index) => {
            const MethodIcon = methodIcons[payment.paymentMethod] || CreditCard;
            const status = statusStyles[payment.status] || statusStyles.created;
            return (
              <motion.button
                key={payment._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => { setSelected(payment); setCopied(false); }}
                className="w-full rounded-xl border border-border bg-card p-4 shadow-card hover:bg-muted/30 hover:border-primary/20 transition-all duration-200 text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={`h-11 w-11 shrink-0 rounded-full flex items-center justify-center ${payment.status === 'success' ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                    <ArrowDownLeft className={`h-5 w-5 ${payment.status === 'success' ? 'text-green-500' : 'text-primary'}`} />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                      {payment.doctor?.name || 'Doctor'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {payment.appointment?.date || ''} • {methodLabels[payment.paymentMethod] || 'Payment'}
                    </p>
                  </div>

                  {/* Amount + Status */}
                  <div className="shrink-0 text-right">
                    <p className={`text-base font-bold ${payment.status === 'success' ? 'text-foreground' : 'text-muted-foreground'}`}>
                      ₹{payment.amount}
                    </p>
                    <p className={`text-[11px] font-medium ${status.text}`}>
                      {status.label}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>

      {/* ═══ Transaction Detail Modal (GPay-style) ═══ */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />

            {/* Detail Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-elevated overflow-hidden"
            >
              {/* Header with status color */}
              <div className={`px-6 pt-6 pb-8 text-center ${
                selected.status === 'success' ? 'bg-green-500/5' : 
                selected.status === 'failed' ? 'bg-red-500/5' : 'bg-amber-500/5'
              }`}>
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Status Icon */}
                <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${
                  selected.status === 'success' ? 'bg-green-500/10' : 
                  selected.status === 'failed' ? 'bg-red-500/10' : 'bg-amber-500/10'
                }`}>
                  <CheckCircle2 className={`h-9 w-9 ${
                    selected.status === 'success' ? 'text-green-500' : 
                    selected.status === 'failed' ? 'text-red-500' : 'text-amber-500'
                  }`} />
                </div>

                {/* Amount */}
                <p className="text-3xl font-bold text-foreground">₹{selected.amount}</p>
                <p className={`text-sm font-medium mt-1 ${(statusStyles[selected.status] || statusStyles.created).text}`}>
                  {(statusStyles[selected.status] || statusStyles.created).label}
                </p>
              </div>

              {/* Details */}
              <div className="px-6 py-5 space-y-4">
                {/* Doctor */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {selected.doctor?.name?.charAt(0) || 'D'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-sm">{selected.doctor?.name || 'Doctor'}</p>
                    <p className="text-xs text-primary">{selected.doctor?.specialization || ''}</p>
                  </div>
                </div>

                <div className="border-t border-border/40" />

                {/* Detail rows */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time</span>
                    <span className="font-medium text-foreground">
                      {selected.appointment?.date || ''} at {selected.appointment?.time || ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium text-foreground capitalize">
                      {methodLabels[selected.paymentMethod] || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-medium capitalize ${(statusStyles[selected.status] || statusStyles.created).text}`}>
                      {(statusStyles[selected.status] || statusStyles.created).label}
                    </span>
                  </div>
                  {selected.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paid On</span>
                      <span className="font-medium text-foreground text-xs">
                        {formatDate(selected.createdAt)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Transaction ID — full, copyable */}
                {selected.razorpayPaymentId && (
                  <>
                    <div className="border-t border-border/40" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Transaction ID</p>
                      <div
                        className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2.5 border border-border/30 cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => copyTxnId(selected.razorpayPaymentId)}
                      >
                        <span className="font-mono text-xs text-foreground break-all flex-1 select-all">
                          {selected.razorpayPaymentId}
                        </span>
                        {copied ? (
                          <Check className="h-4 w-4 shrink-0 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                      </div>
                      {copied && (
                        <p className="text-[10px] text-green-500 mt-1 text-right">Copied!</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-5">
                <button
                  onClick={() => setSelected(null)}
                  className="w-full rounded-xl py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
