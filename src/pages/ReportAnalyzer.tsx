import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Brain, AlertTriangle, Loader2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface AnalysisResult {
  fileName: string;
  fileSize: number;
  extractedText: string;
  analysis: string;
}

export default function ReportAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showExtracted, setShowExtracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/bmp", "image/tiff", "image/webp"];

  const validateFile = (f: File): boolean => {
    if (!allowedTypes.includes(f.type)) {
      toast({ title: "Unsupported file type", description: "Please upload PNG, JPG, BMP, TIFF, or WebP images.", variant: "destructive" });
      return false;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleFile = (f: File) => {
    if (validateFile(f)) {
      setFile(f);
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    try {
      const { data } = await aiAPI.analyzeReport(file);
      setResult(data.data);
      toast({ title: "Report analyzed successfully!" });
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to analyze report. Please try again.";
      toast({ title: msg, variant: "destructive" });

      // If we got extracted text back despite error, show it
      if (error.response?.data?.extractedText) {
        setResult({
          fileName: file.name,
          fileSize: file.size,
          extractedText: error.response.data.extractedText,
          analysis: "Analysis could not be completed. Please try again later.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setResult(null);
    setShowExtracted(false);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />

      <div className="container relative mx-auto max-w-4xl px-4 py-8 md:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-5 flex items-center justify-center rounded-2xl gradient-accent p-4 shadow-lg"
              style={{ width: 72, height: 72 }}
            >
              <FileText className="h-9 w-9 text-primary-foreground" />
            </motion.div>
            <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
              AI Report <span className="gradient-text">Analyzer</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground leading-relaxed">
              Upload your medical report and get an AI-powered simplified explanation
            </p>
          </div>

          {/* Upload Zone */}
          {!result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all glass-card ${
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : file
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-border/50 hover:border-primary/50 hover:bg-primary/[0.02]"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.bmp,.tiff,.webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />

                {file ? (
                  <div className="space-y-3">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-green-500/10">
                      <FileText className="h-7 w-7 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB • Click to change
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <Upload className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Drop your medical report here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse • PNG, JPG, BMP, TIFF, WebP • Max 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Analyze Button */}
              <div className="mt-4 flex justify-center gap-3">
                {file && (
                  <Button variant="outline" onClick={resetAll} disabled={loading}>
                    <X className="mr-1 h-4 w-4" /> Clear
                  </Button>
                )}
                <Button
                  onClick={handleAnalyze}
                  disabled={!file || loading}
                  className="gradient-primary border-0 text-primary-foreground h-12 px-8 text-base btn-premium rounded-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing Report...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              </div>

              {loading && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Extracting text via OCR and running AI analysis... This may take 30–60 seconds.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Action bar */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-foreground">Analysis Results</h2>
                    <p className="text-sm text-muted-foreground">
                      {result.fileName} • {(result.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button variant="outline" onClick={resetAll}>
                    <Upload className="mr-1 h-4 w-4" /> Analyze Another
                  </Button>
                </div>

                {/* AI Analysis Card */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Brain className="h-5 w-5 text-primary" />
                    <h3 className="font-heading text-lg font-bold text-foreground">AI Analysis</h3>
                  </div>
                  <div className="report-content text-foreground text-sm leading-relaxed">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h2 className="text-xl font-bold text-foreground mt-6 mb-3 font-heading border-b border-border pb-2">{children}</h2>,
                        h2: ({ children }) => <h3 className="text-lg font-bold text-foreground mt-5 mb-2.5 font-heading">{children}</h3>,
                        h3: ({ children }) => <h4 className="text-base font-semibold text-foreground mt-4 mb-2 font-heading">{children}</h4>,
                        h4: ({ children }) => <h5 className="text-sm font-semibold text-foreground mt-3 mb-1.5">{children}</h5>,
                        p: ({ children }) => <p className="mb-3 leading-7 text-foreground/90">{children}</p>,
                        ul: ({ children }) => <ul className="mb-4 ml-4 space-y-1.5 list-disc list-outside marker:text-primary">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-4 ml-4 space-y-1.5 list-decimal list-outside marker:text-primary">{children}</ol>,
                        li: ({ children }) => <li className="pl-1.5 leading-6 text-foreground/90">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        em: ({ children }) => <em className="text-primary/80 italic">{children}</em>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-3 border-primary bg-primary/5 pl-4 py-2 my-3 rounded-r-lg italic text-muted-foreground">
                            {children}
                          </blockquote>
                        ),
                        code: ({ children }) => (
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-primary">{children}</code>
                        ),
                        hr: () => <hr className="my-5 border-border" />,
                        table: ({ children }) => (
                          <div className="my-4 overflow-x-auto rounded-lg border border-border">
                            <table className="w-full text-sm">{children}</table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
                        th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-foreground border-b border-border">{children}</th>,
                        td: ({ children }) => <td className="px-3 py-2 border-b border-border/50 text-foreground/80">{children}</td>,
                      }}
                    >
                      {result.analysis}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Extracted Text (collapsible) */}
                <div className="glass-card rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setShowExtracted(!showExtracted)}
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold text-foreground">Extracted Text (OCR)</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {showExtracted ? "Hide" : "Show"} • {result.extractedText.length} chars
                    </span>
                  </button>
                  {showExtracted && (
                    <div className="border-t border-border p-4">
                      <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/30 rounded-lg p-4 max-h-64 overflow-y-auto">
                        {result.extractedText}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Disclaimer */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-600 text-sm">Important Disclaimer</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This AI analysis is for informational purposes only and is NOT a medical diagnosis.
                      Always consult a qualified healthcare professional for proper interpretation and treatment.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
