import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Sparkles, Trophy, Star, Clock, BadgeCheck, Globe, Languages, ArrowRight, Zap, Brain, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ALL_SYMPTOMS, formatSymptom, matchSymptoms } from "@/lib/symptoms";
import { doctorsAPI, symptomsAPI } from "@/lib/api";
import Disclaimer from "@/components/Disclaimer";
import VoiceInput from "@/components/VoiceInput";
import HomeRemedies from "@/components/HomeRemedies";
import { Link } from "react-router-dom";

interface PredictionResult {
  disease: string;
  confidence: string;  // "low" | "medium" | "high"
  reason: string;
  doctorType: string;
}

interface ScoredDoctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  totalRatings: number;
  available: boolean;
  fee: number;
  bio: string;
  score: number;
}

export default function SymptomChecker() {
  const [input, setInput] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [doctors, setDoctors] = useState<ScoredDoctor[]>([]);
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Multimodal state
  const [rawInput, setRawInput] = useState("");
  const [normalizedDisplay, setNormalizedDisplay] = useState<string[]>([]);
  const [normalizing, setNormalizing] = useState(false);
  const [inputMode, setInputMode] = useState<"search" | "multimodal">("search");

  const handleInputChange = (val: string) => {
    setInput(val);
    if (val.length > 1 && inputMode === "search") {
      const matched = matchSymptoms(val).filter(s => !selectedSymptoms.includes(s)).slice(0, 8);
      setSuggestions(matched);
    } else {
      setSuggestions([]);
    }
  };

  const addSymptom = (s: string) => {
    if (!selectedSymptoms.includes(s)) {
      setSelectedSymptoms([...selectedSymptoms, s]);
    }
    setInput("");
    setSuggestions([]);
  };

  const removeSymptom = (s: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(x => x !== s));
  };

  // ── Multimodal: Normalize input (any language → English symptoms) ──
  const handleNormalize = async (text?: string) => {
    const inputText = text || input;
    if (!inputText.trim()) return;

    setNormalizing(true);
    setRawInput(inputText);
    setNormalizedDisplay([]);

    try {
      const { data } = await symptomsAPI.normalize(inputText);

      if (data.success && data.normalized.length > 0) {
        setNormalizedDisplay(data.normalized);

        // Auto-add normalized symptoms to selected
        const newSymptoms = [...selectedSymptoms];
        data.normalized.forEach((s: string) => {
          if (!newSymptoms.includes(s)) {
            newSymptoms.push(s);
          }
        });
        setSelectedSymptoms(newSymptoms);
      } else {
        setNormalizedDisplay([]);
      }
    } catch (e) {
      console.error("Normalization error:", e);
    } finally {
      setNormalizing(false);
      setInput("");
    }
  };

  // ── Voice: Receive transcript from VoiceInput ──
  const handleVoiceTranscript = useCallback((transcript: string) => {
    if (transcript.trim()) {
      setInput(transcript);
      // Auto-normalize voice input
      handleNormalize(transcript);
    }
  }, [selectedSymptoms]);
  const [errorMsg, setErrorMsg] = useState("");

  const predict = async () => {
    if (selectedSymptoms.length === 0) return;
    if (selectedSymptoms.length < 2) {
      setErrorMsg("Please select at least 2 symptoms for an accurate AI prediction.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setPredictions([]);
    setDoctors([]);
    setShowAllDoctors(false);
    try {
      // Use the LLM-powered recommend endpoint
      const { data } = await doctorsAPI.recommend(selectedSymptoms);
      const results = data.data;

      if (results.message && (!results.predictions || results.predictions.length === 0)) {
        setErrorMsg(results.message);
      }

      setPredictions(results.predictions || []);
      setDoctors(results.recommendedDoctors || []);
    } catch (e: any) {
      console.error("Prediction error:", e);
      const msg = e?.response?.data?.message || "Prediction failed. Please try again later.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 ring-2 ring-amber-200 dark:ring-amber-500/30";
    if (index === 1) return "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400 ring-2 ring-zinc-200 dark:ring-zinc-500/30";
    if (index === 2) return "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 ring-2 ring-orange-200 dark:ring-orange-500/30";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background mesh */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />

      <div className="container relative mx-auto max-w-4xl px-4 py-6 md:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* ── Header ── */}
          <div className="mb-8 md:mb-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-4 md:mb-5 flex items-center justify-center rounded-2xl gradient-accent p-3 md:p-4 shadow-lg"
              style={{ width: 60, height: 60 }}
            >
              <Sparkles className="h-7 w-7 md:h-9 md:w-9 text-primary-foreground" />
            </motion.div>
            <h1 className="font-heading text-2xl font-bold text-foreground md:text-4xl">
              AI Symptom <span className="gradient-text">Checker</span>
            </h1>
            <p className="mx-auto mt-2 md:mt-3 max-w-xl text-sm md:text-base text-muted-foreground leading-relaxed">
              Enter your symptoms in any language or use voice input — get AI-powered predictions with top doctor recommendations
            </p>
          </div>

          {/* ── Input Mode Toggle ── */}
          <div className="mb-5 flex items-center justify-center gap-2">
            <Button
              variant={inputMode === "search" ? "default" : "outline"}
              size="sm"
              onClick={() => setInputMode("search")}
              className={`rounded-xl text-xs sm:text-sm transition-all duration-300 ${
                inputMode === "search"
                  ? "gradient-primary border-0 text-primary-foreground shadow-lg"
                  : "glass border-border/50 hover:border-primary/30"
              }`}
            >
              <Search className="h-4 w-4 mr-1 sm:mr-1.5" />
              <span className="hidden sm:inline">Search </span>Symptoms
            </Button>
            <Button
              variant={inputMode === "multimodal" ? "default" : "outline"}
              size="sm"
              onClick={() => setInputMode("multimodal")}
              className={`rounded-xl text-xs sm:text-sm transition-all duration-300 ${
                inputMode === "multimodal"
                  ? "gradient-primary border-0 text-primary-foreground shadow-lg"
                  : "glass border-border/50 hover:border-primary/30"
              }`}
            >
              <Globe className="h-4 w-4 mr-1 sm:mr-1.5" />
              <span className="hidden sm:inline">Multilingual / </span>Voice
            </Button>
          </div>

          {/* ── Mode 1: Standard Search ── */}
          {inputMode === "search" && (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-13 pl-12 text-base rounded-xl glass-card border-border/40 focus:border-primary/40 focus:ring-primary/20 transition-all"
                  style={{ height: 52 }}
                  placeholder="Type a symptom (e.g., headache, fever, cough)..."
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && suggestions.length > 0) addSymptom(suggestions[0]);
                  }}
                />
              </div>

              {/* Suggestions */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-5 flex flex-wrap gap-2"
                  >
                    {suggestions.map((s) => (
                      <Badge
                        key={s}
                        variant="outline"
                        className="cursor-pointer rounded-lg glass border-border/40 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200 px-3 py-1.5"
                        onClick={() => addSymptom(s)}
                      >
                        + {formatSymptom(s)}
                      </Badge>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* ── Mode 2: Multimodal (Voice + Multilingual Text) ── */}
          {inputMode === "multimodal" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Languages className="h-5 w-5 text-primary" />
                  <h3 className="font-heading font-semibold text-foreground">
                    Describe Your Symptoms
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Type in Hindi, Hinglish, Marathi, or any language — or use the 🎤 mic button to speak
                </p>

                <div className="space-y-3">
                  <div className="relative group">
                    <Languages className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      className="h-12 pl-12 text-base rounded-xl border-border/40 bg-background/50 focus:border-primary/40 transition-all"
                      placeholder="e.g., mujhe sir dard aur bukhar hai..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleNormalize();
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <VoiceInput onTranscript={handleVoiceTranscript} disabled={normalizing} />
                    <Button
                      onClick={() => handleNormalize()}
                      disabled={!input.trim() || normalizing}
                      className="flex-1 h-11 gradient-primary border-0 text-primary-foreground btn-premium rounded-xl text-sm"
                    >
                      {normalizing ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing...</>
                      ) : (
                        <><ArrowRight className="h-4 w-4 mr-2" /> Analyze Symptoms</>
                      )}
                    </Button>
                  </div>
                </div>

                {/* ── Raw Input & Normalized Output Display ── */}
                <AnimatePresence>
                  {rawInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-3"
                    >
                      {/* Raw Input */}
                      <div className="rounded-xl bg-muted/30 p-3.5 border border-border/30">
                        <p className="text-xs font-medium text-muted-foreground mb-1">You said:</p>
                        <p className="text-sm text-foreground italic">"{rawInput}"</p>
                      </div>

                      {/* Normalized Output */}
                      {normalizing ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing symptoms...
                        </div>
                      ) : normalizedDisplay.length > 0 ? (
                        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3.5">
                          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-2">
                            ✅ Detected Symptoms:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {normalizedDisplay.map((s) => (
                              <Badge
                                key={s}
                                className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 rounded-lg"
                              >
                                {formatSymptom(s)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3.5">
                          <p className="text-xs text-amber-700 dark:text-amber-400">
                            ⚠️ Could not detect symptoms. Please try again or use the search mode.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Selected */}
          {selectedSymptoms.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <p className="mb-2.5 text-sm font-medium text-muted-foreground">Selected symptoms:</p>
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((s) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge
                      className="gradient-primary text-primary-foreground cursor-pointer hover:opacity-80 rounded-lg px-3 py-1.5 transition-all duration-200 hover:shadow-md"
                      onClick={() => removeSymptom(s)}
                    >
                      {formatSymptom(s)} ✕
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <Button
            onClick={predict}
            disabled={selectedSymptoms.length === 0 || loading}
            className="w-full gradient-primary border-0 text-primary-foreground h-13 text-base btn-premium rounded-xl"
            style={{ height: 52 }}
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing with AI...</>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" /> Predict & Recommend Doctors
              </>
            )}
          </Button>

          {/* Error / Warning Message */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{errorMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {predictions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-10 space-y-8"
              >
                <Disclaimer />

                {/* ── Home Remedies Section ── */}
                <HomeRemedies symptoms={selectedSymptoms} />

                {/* Predicted Conditions */}
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <Brain className="h-5 w-5 text-primary" />
                    <h2 className="font-heading text-xl font-bold text-foreground">
                      AI-Predicted Conditions
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {predictions.map((p, i) => {
                      const confidenceConfig = {
                        high: { color: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-500/30', bar: 'from-emerald-400 to-emerald-600', width: '90%' },
                        medium: { color: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-500/30', bar: 'from-amber-400 to-amber-600', width: '60%' },
                        low: { color: 'bg-zinc-100 dark:bg-zinc-500/20 text-zinc-600 dark:text-zinc-400 ring-zinc-200 dark:ring-zinc-500/30', bar: 'from-zinc-400 to-zinc-500', width: '30%' },
                      };
                      const conf = confidenceConfig[p.confidence as keyof typeof confidenceConfig] || confidenceConfig.medium;
                      return (
                        <motion.div
                          key={p.disease}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="glass-card rounded-2xl p-5 transition-all duration-300 hover:shadow-elevated"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-heading font-semibold text-foreground text-lg">{p.disease}</h3>
                              <p className="text-sm text-primary font-medium mt-0.5">Consult: {p.doctorType}</p>
                              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                <span className="font-medium text-foreground/80">Reason:</span> {p.reason}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <Badge className={`${conf.color} ring-1 font-semibold text-sm px-3 py-1 capitalize`}>
                                {p.confidence}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">confidence</p>
                            </div>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted/50">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: conf.width }}
                              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                              className={`h-full rounded-full bg-gradient-to-r ${conf.bar} shadow-sm`}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Recommended Doctors (AI Scored) */}
                {doctors.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      <h2 className="font-heading text-xl font-bold text-foreground">
                        AI-Recommended Doctors
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-5">
                      Ranked by AI Score = Rating (50%) + Experience (30%) + Availability (20%)
                    </p>
                    <div className="space-y-4">
                      {(showAllDoctors ? doctors : doctors.slice(0, 3)).map((doc, i) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.12 }}
                          className="group glass-card rounded-2xl p-4 md:p-6 transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5"
                        >
                          {/* Top: Rank + Avatar + Info */}
                          <div className="flex items-start gap-3">
                            {/* Rank Badge */}
                            <div className={`flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center font-bold rounded-xl text-sm md:text-lg ${getRankBadge(i)}`}>
                              #{i + 1}
                            </div>
                            {/* Avatar */}
                            <div className="h-10 w-10 md:h-[52px] md:w-[52px] shrink-0 overflow-hidden rounded-full gradient-primary flex items-center justify-center text-lg md:text-xl font-bold text-primary-foreground shadow-lg">
                              {doc.name.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-heading text-base md:text-lg font-semibold text-foreground truncate">{doc.name}</h3>
                              <p className="text-xs md:text-sm text-primary font-medium">{doc.specialization}</p>
                              <div className="mt-1 md:mt-1.5 flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 md:h-3.5 md:w-3.5 text-yellow-500 fill-yellow-500" />
                                  {doc.rating.toFixed(1)} ({doc.totalRatings})
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                  {doc.experience} yrs
                                </span>
                                <span className="flex items-center gap-1">
                                  <BadgeCheck className="h-3 w-3 md:h-3.5 md:w-3.5 text-emerald-500" />
                                  Available
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Bottom: AI Score + Fee + Book */}
                          <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <div className="text-[10px] md:text-xs text-muted-foreground">AI Score</div>
                                <div className="text-lg md:text-xl font-bold gradient-text">{(doc.score * 100).toFixed(0)}%</div>
                              </div>
                              <div>
                                <div className="text-[10px] md:text-xs text-muted-foreground">Fee</div>
                                <div className="text-lg md:text-xl font-bold text-foreground">₹{doc.fee}</div>
                              </div>
                            </div>
                            <Link to={`/book/${doc.id}`}>
                              <Button size="sm" className="gradient-primary border-0 text-primary-foreground btn-premium rounded-xl shadow-md text-xs md:text-sm">
                                Book Now
                              </Button>
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* See All Button */}
                    {doctors.length > 3 && (
                      <div className="pt-4 flex justify-center">
                        <Button
                          variant="outline"
                          onClick={() => setShowAllDoctors(!showAllDoctors)}
                          className="rounded-full px-6 bg-background/50 hover:bg-muted font-medium transition-all"
                        >
                          {showAllDoctors ? (
                            <>See Less <ChevronUp className="ml-2 h-4 w-4" /></>
                          ) : (
                            <>See All {doctors.length} Doctors <ChevronDown className="ml-2 h-4 w-4" /></>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
