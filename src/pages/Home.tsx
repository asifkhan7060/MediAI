import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Stethoscope, MessageCircle, Calendar, Brain, ArrowRight,
  Shield, Zap, Heart, Sparkles, FileSearch, MapPin, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";

const features = [
  {
    icon: Brain,
    title: "AI Symptom Checker",
    desc: "Describe your symptoms and get AI-powered disease predictions with confidence scores.",
    to: "/symptom-checker",
    gradient: "from-primary to-teal-400",
    iconBg: "gradient-primary",
  },
  {
    icon: Stethoscope,
    title: "Smart Doctor Match",
    desc: "Get matched with the right specialist based on your predicted condition.",
    to: "/doctors",
    gradient: "from-violet-500 to-primary",
    iconBg: "gradient-accent",
  },
  {
    icon: MessageCircle,
    title: "AI Medical Assistant",
    desc: "Chat with our AI assistant for health guidance and doctor recommendations.",
    to: "/chatbot",
    gradient: "from-amber-500 to-orange-400",
    iconBg: "gradient-gold",
  },
  {
    icon: Calendar,
    title: "Easy Booking",
    desc: "Book appointments with recommended doctors in just a few clicks.",
    to: "/doctors",
    gradient: "from-primary to-emerald-400",
    iconBg: "gradient-primary",
  },
  {
    icon: FileSearch,
    title: "Report Analyzer",
    desc: "Upload medical reports and get AI-powered insights and analysis.",
    to: "/report-analyzer",
    gradient: "from-violet-500 to-pink-400",
    iconBg: "gradient-accent",
  },
  {
    icon: MapPin,
    title: "Nearby Hospitals",
    desc: "Find hospitals and clinics near you with real-time distance data.",
    to: "/nearby-doctors",
    gradient: "from-amber-500 to-yellow-400",
    iconBg: "gradient-gold",
  },
];

const stats = [
  { value: 42, suffix: "+", label: "Diseases Detected", icon: Sparkles },
  { value: 130, suffix: "+", label: "Symptoms Analyzed", icon: Brain },
  { value: 500, suffix: "+", label: "Doctors Available", icon: Stethoscope },
  { value: 99, suffix: "%", label: "Accuracy Rate", icon: CheckCircle2 },
];

const steps = [
  {
    step: "01",
    title: "Describe Symptoms",
    desc: "Enter symptoms in any language, use voice, or search from our database.",
  },
  {
    step: "02",
    title: "AI Analysis",
    desc: "Our AI predicts possible conditions with confidence scores.",
  },
  {
    step: "03",
    title: "Doctor Match",
    desc: "Get matched with the best specialist ranked by AI scoring.",
  },
  {
    step: "04",
    title: "Book & Consult",
    desc: "Book an appointment instantly and connect with your doctor.",
  },
];

// Animated counter hook
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, setStarted };
}

function StatCard({ value, suffix, label, icon: Icon, index }: {
  value: number; suffix: string; label: string; icon: React.ElementType; index: number;
}) {
  const { count, setStarted } = useCounter(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onViewportEnter={() => setStarted(true)}
      className="group relative"
    >
      <div className="glass-card rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-elevated">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="font-heading text-3xl font-bold gradient-text md:text-4xl">
          {count}{suffix}
        </div>
        <p className="mt-1 text-sm text-muted-foreground font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ Hero Section ═══ */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Mesh gradient bg */}
        <div className="absolute inset-0 gradient-mesh" />

        {/* Animated CSS orbs — subtle floating background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/[0.07] blur-[100px] -top-20 -right-20 animate-float-slow" />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-accent/[0.06] blur-[80px] top-1/2 -left-32 animate-float-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute w-[350px] h-[350px] rounded-full bg-secondary/[0.05] blur-[90px] bottom-10 right-1/4 animate-float-slow" style={{ animationDelay: '4s' }} />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background z-[1]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[1]" />

        {/* Hero content */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="container relative z-[2] mx-auto px-4 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Premium badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium text-primary"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
              <Zap className="h-3.5 w-3.5" />
              AI-Powered Healthcare Platform
            </motion.div>

            {/* Headline */}
            <h1 className="mx-auto max-w-4xl font-heading text-4xl font-bold leading-[1.1] text-foreground sm:text-5xl md:text-7xl">
              Your Health, Powered by{" "}
              <span className="text-shimmer">
                Artificial Intelligence
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl leading-relaxed">
              Check symptoms, predict conditions, find the right doctor,
              and book appointments — all guided by advanced AI.
            </p>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/symptom-checker">
                <Button
                  size="lg"
                  className="gradient-primary border-0 text-primary-foreground h-14 px-8 text-base btn-premium rounded-xl"
                >
                  <Brain className="mr-2 h-5 w-5" />
                  Check Symptoms
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/doctors">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base rounded-xl glass border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                >
                  <Stethoscope className="mr-2 h-5 w-5" />
                  Find a Doctor
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Floating metric pills */}
          <div className="mt-16 hidden md:flex items-center justify-center gap-6">
            {[
              { label: "42+ Disease Detection", delay: 0.4 },
              { label: "99% AI Accuracy", delay: 0.5 },
              { label: "Instant Booking", delay: 0.6 },
            ].map((pill) => (
              <motion.div
                key={pill.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: pill.delay, duration: 0.5 }}
                className="glass-card rounded-full px-5 py-2.5 text-sm font-medium text-foreground/80 animate-float-slow"
                style={{ animationDelay: `${pill.delay}s` }}
              >
                <CheckCircle2 className="inline h-3.5 w-3.5 mr-1.5 text-primary" />
                {pill.label}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ Stats Section ═══ */}
      <section className="relative -mt-8 z-10 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {stats.map((s, i) => (
              <StatCard key={s.label} {...s} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How It Works — Timeline ═══ */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
              <Zap className="h-3 w-3" /> How It Works
            </span>
            <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
              Four Steps to Better Healthcare
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              From symptom check to doctor consultation — powered by AI every step of the way.
            </p>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-accent/30 to-primary/30 hidden md:block" />

            <div className="space-y-8">
              {steps.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative flex items-start gap-6"
                >
                  {/* Step number */}
                  <div className="hidden md:flex shrink-0 h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-primary-foreground font-heading text-lg font-bold shadow-lg relative z-10">
                    {s.step}
                  </div>

                  {/* Content card */}
                  <div className="flex-1 glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-elevated">
                    <span className="md:hidden inline-flex items-center gap-2 rounded-lg gradient-primary text-primary-foreground px-3 py-1 text-xs font-bold mb-3">
                      Step {s.step}
                    </span>
                    <h3 className="font-heading text-lg font-semibold text-foreground">{s.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Features Grid ═══ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent mb-4">
              <Sparkles className="h-3 w-3" /> Features
            </span>
            <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
              Everything You Need
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Comprehensive AI-powered tools for your complete healthcare journey.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <Link
                  to={f.to}
                  className="group relative block h-full rounded-2xl glass-card p-6 transition-all duration-500 hover:shadow-elevated hover:-translate-y-1"
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500" />

                  <div className={`mb-5 inline-flex rounded-xl ${f.iconBg} p-3.5 shadow-lg`}>
                    <f.icon className="h-6 w-6 text-primary-foreground" />
                  </div>

                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>

                  <span className="mt-5 inline-flex items-center text-sm font-medium text-primary opacity-0 translate-x-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                    Explore <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Trust / CTA ═══ */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute inset-0 gradient-mesh opacity-40" />
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mx-auto glass-card rounded-3xl p-8 md:p-12">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                Your Data, Your Trust
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                All predictions are AI-based suggestions, not medical diagnoses.
                Your health data is processed securely and never shared.
                Always consult a qualified healthcare professional.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/symptom-checker">
                  <Button className="gradient-primary border-0 text-primary-foreground h-12 px-7 btn-premium rounded-xl">
                    <Brain className="mr-2 h-4 w-4" /> Get Started Free
                  </Button>
                </Link>
                <Link to="/chatbot">
                  <Button variant="outline" className="h-12 px-7 rounded-xl glass border-border/50">
                    <MessageCircle className="mr-2 h-4 w-4" /> Talk to AI Assistant
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-border/50 py-8 relative">
        <div className="absolute inset-0 gradient-mesh opacity-20" />
        <div className="container relative mx-auto flex flex-col items-center gap-3 px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="gradient-primary rounded-lg p-1.5">
              <Heart className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-heading font-semibold text-foreground">MediAI</span>
            <span>— AI-Powered Healthcare Platform</span>
          </div>
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} MediAI. For educational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
