import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Leaf, AlertTriangle, Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { aiAPI } from "@/lib/api";

interface HomeRemediesProps {
  symptoms: string[];
}

interface RemediesData {
  cause: string;
  remedies: string[];
  warning: string[];
}

export default function HomeRemedies({ symptoms }: HomeRemediesProps) {
  const [data, setData] = useState<RemediesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (symptoms.length === 0) {
      setData(null);
      setFetched(false);
      return;
    }

    // Only auto-fetch once when symptoms are present
    if (!fetched && symptoms.length > 0) {
      fetchRemedies();
    }
  }, [symptoms, fetched]);

  const fetchRemedies = async () => {
    setLoading(true);
    setError(null);
    setFetched(true);

    try {
      const response = await aiAPI.homeRemedies(symptoms);
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError("Could not generate remedies. Please try again.");
      }
    } catch (e: any) {
      console.error("Home remedies error:", e);
      if (e.code === "ECONNABORTED") {
        setError("AI service is taking too long. Please try again later.");
      } else {
        setError("AI service unavailable. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if no symptoms
  if (symptoms.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Section Header */}
      <div
        className="flex items-center justify-between cursor-pointer mb-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
            <Leaf className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground">
            Before Your Appointment
          </h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            AI-Powered
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Loading State */}
            {loading && (
              <div className="rounded-xl border border-border bg-card p-8 shadow-card text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Generating safe home remedies...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This may take a moment (AI processing)
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">{error}</p>
                <button
                  onClick={() => { setFetched(false); }}
                  className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-300 underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Results */}
            {data && !loading && (
              <div className="grid gap-4 md:grid-cols-3">
                {/* 🧠 Possible Cause */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                      <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-heading font-semibold text-foreground">
                      Possible Cause
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {data.cause}
                  </p>
                </motion.div>

                {/* 🌿 Home Remedies */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 p-5 shadow-card hover:shadow-elevated transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                      <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-heading font-semibold text-foreground">
                      Home Remedies
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {data.remedies.map((remedy, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {remedy}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                {/* ⚠️ Warning Signs */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 p-5 shadow-card hover:shadow-elevated transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="font-heading font-semibold text-foreground">
                      Warning Signs
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {data.warning.map((warn, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        {warn}
                      </motion.li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 font-medium">
                    See a doctor immediately if you experience any of these
                  </p>
                </motion.div>
              </div>
            )}

            {/* Safety Disclaimer */}
            {data && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-3 rounded-lg bg-muted/50 px-4 py-2 text-center"
              >
                <p className="text-xs text-muted-foreground">
                  ⚠️ These are general wellness suggestions only — not medical advice. No medicines prescribed. Always consult a qualified healthcare professional.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
