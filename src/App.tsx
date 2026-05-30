import React, { useState, useEffect } from "react";
import { Scale, Sparkles, ShieldCheck, Mail, Github, Heart, AlertCircle, RefreshCw } from "lucide-react";
import LandingHero from "./components/LandingHero";
import UploadSection from "./components/UploadSection";
import ResultsPanel from "./components/ResultsPanel";
import HistoryPanel from "./components/HistoryPanel";
import { AnalysisResult, HistoryItem } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeResult, setActiveResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Hydrate local logs on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("smart_contract_audit_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Local storage error:", err);
    }
  }, []);

  // Sync logs
  const syncHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem("smart_contract_audit_history", JSON.stringify(newHistory));
    } catch (err) {
      console.error("Local storage sync error:", err);
    }
  };

  const handleAnalyzeFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process target contract template file.");
      }

      if (data.analysis) {
        const result: AnalysisResult = {
          ...data.analysis,
          metadata: {
            ...data.metadata,
            documentType: file.type || "application/octet-stream",
          },
        };

        setActiveResult(result);
        appendHistory(file.name, result);
      } else {
        throw new Error("Invalid structure returned under analysis payload.");
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "An unexpected error occurred during document parsing. Try verifying server logs or keys."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyzeText = async (text: string, title: string) => {
    setError(null);
    setIsProcessing(true);

    try {
      const res = await fetch("/api/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, title }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze raw contract input.");
      }

      if (data.analysis) {
        const result: AnalysisResult = {
          ...data.analysis,
          metadata: data.metadata,
        };

        setActiveResult(result);
        appendHistory(title, result);
      } else {
        throw new Error("Invalid structure returned from parsing agent.");
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "An unexpected error occurred. Please ensure your Gemini API Key is configured in the secrets panel."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const appendHistory = (name: string, result: AnalysisResult) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      timestamp: new Date().toISOString(),
      status: result.status,
      compliance_score: result.compliance_score,
      result,
    };

    const updated = [newItem, ...history.filter((h) => h.name !== name)].slice(0, 8);
    syncHistory(updated);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setActiveResult(item.result);
    setError(null);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleRemoveHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = history.filter((h) => h.id !== id);
    syncHistory(filtered);
  };

  const handleClearHistory = () => {
    syncHistory([]);
  };

  const handleReset = () => {
    setActiveResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans transition-colors duration-300">
      {/* Absolute Navbar Header */}
      <header id="app-header" className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div
            onClick={() => setView("landing")}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Scale className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
                Contract Humanizer
                <span className="text-[9px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-600 px-2 py-0.5 rounded-full uppercase leading-none">
                  AI CORE v2.5
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Simplify terms, protect liabilities</p>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <button
              onClick={() => setView(view === "landing" ? "dashboard" : "landing")}
              id="lnk-dashboard-toggle"
              className="px-4.5 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition border border-transparent hover:border-slate-200/50 cursor-pointer"
            >
              {view === "landing" ? "Enter Studio Console" : "Explore Benefits"}
            </button>
            <button
              onClick={() => {
                setView("dashboard");
                setActiveResult(null);
                setError(null);
              }}
              className="px-4.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer border border-slate-950"
            >
              Console Tab
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container Views with Transitions */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {view === "landing" ? (
            <motion.div
              key="landing-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LandingHero onGetStarted={() => setView("dashboard")} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="py-12 px-6 max-w-7xl mx-auto space-y-12"
            >
              {/* Dynamic Content Panel */}
              {!activeResult ? (
                // Dashboard uploads view
                <div className="space-y-10 animate-slideUp">
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-[10px] font-bold tracking-wider uppercase mb-1">
                      <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                      Decompile backdoors instantly
                    </div>
                    <h2 className="text-3xl font-black text-slate-950 tracking-tight">
                      Deobfuscate Smart Contracts & Agreements
                    </h2>
                    <p className="text-slate-400 font-sans text-sm max-w-lg mx-auto">
                      Submit raw Rust/Solidity code files or upload legal templates. Gemini decompiles and breaks clauses down step-by-step.
                    </p>
                  </div>

                  {/* Document upload / code paste section */}
                  <UploadSection
                    onAnalyzeFile={handleAnalyzeFile}
                    onAnalyzeText={handleAnalyzeText}
                    isProcessing={isProcessing}
                    error={error}
                    setError={setError}
                  />

                  {/* Logs of previous items */}
                  <HistoryPanel
                    history={history}
                    onSelect={handleSelectHistoryItem}
                    onClear={handleClearHistory}
                    onRemoveItem={handleRemoveHistoryItem}
                  />
                </div>
              ) : (
                // Split Screen Result View
                <ResultsPanel result={activeResult} onReset={handleReset} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Trust reassurance banner if processing */}
      <AnimatePresence>
        {isProcessing && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-5 animate-scaleUp">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
                <Scale className="w-6 h-6 text-indigo-600 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-slate-800 text-lg">Decompiling Contract</h3>
                <p className="text-xs text-slate-405 font-medium leading-relaxed">
                  Scanning abstract syntax trees, identifying central ownership backdoors, computing compliance scores and humanizing clauses with Gemini core flash...
                </p>
              </div>
              <div className="text-[10px] bg-slate-50 text-slate-400 py-1.5 px-3 rounded-lg border border-slate-100 font-mono">
                Running token audits + heuristic safeguards
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Area */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-450 text-xs py-8 px-6 mt-16 leading-relaxed">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-slate-300">
            <Scale className="w-4.5 h-4.5 text-indigo-400" />
            <span className="font-bold text-sm tracking-tight text-white">Smart Contract & Legal Document Humanizer</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <span className="flex items-center gap-1.5">
              Securely powered by <strong className="text-white">Gemini 3.5 Core</strong>
            </span>
          </div>
          <p className="text-slate-500 text-[10px]">
            &copy; {new Date().getFullYear()} AI Studio. For informational audits only. Not a licensed lawyer offering binding counsel.
          </p>
        </div>
      </footer>
    </div>
  );
}
