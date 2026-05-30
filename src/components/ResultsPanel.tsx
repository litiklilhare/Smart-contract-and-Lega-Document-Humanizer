import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronRight,
  Sparkles,
  Search,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AnalysisResult } from "../types";

interface ResultsPanelProps {
  result: AnalysisResult;
  onReset: () => void;
}

export default function ResultsPanel({ result, onReset }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "compliance" | "flags">(
    "summary"
  );
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  const { summary, status, compliance_score, red_flags, segments, metadata } =
    result;

  // Compute status badge colors
  const getStatusConfig = (s: typeof status) => {
    switch (s) {
      case "Legal":
        return {
          textColor: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
          icon: <ShieldCheck className="w-5 h-5 flex-shrink-0" />,
          label: "Low-Risk / Verified Standard",
        };
      case "Illegal":
        return {
          textColor: "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800",
          icon: <ShieldAlert className="w-5 h-5 flex-shrink-0" />,
          label: "Highly Suspicious / Regulated Breaches",
        };
      case "High-Risk Suspicious":
      default:
        return {
          textColor: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
          icon: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
          label: "High Caution / Uncapped Backdoors",
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  // Compute circular score dash
  const strokeRadius = 45;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset =
    strokeCircumference - (compliance_score / 100) * strokeCircumference;

  // Determine score color
  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-emerald-500 stroke-emerald-500";
    if (val >= 50) return "text-amber-500 stroke-amber-500";
    return "text-rose-500 stroke-rose-500";
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wide text-indigo-600 dark:text-indigo-400 uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini Core Deobfuscation Result
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 truncate">
            {metadata?.documentName || "Analyzed Contract"}
          </h2>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
            <span>Type: <strong className="text-slate-600 dark:text-slate-300">{metadata?.documentType?.split("/")[1]?.toUpperCase() || "Plain Text"}</strong></span>
            <span>Est. Words: <strong className="text-slate-600 dark:text-slate-300">{metadata?.wordCount || 0}</strong></span>
            <span>Caution state: <strong className="text-slate-600 dark:text-slate-300">{status}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={onReset}
            className="w-full md:w-auto px-5 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-200/80 dark:border-slate-700 rounded-xl transition cursor-pointer"
          >
            Reset & Analyze Another
          </button>
        </div>
      </div>

      {/* Split Screen Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: HIGHLIGHTED CODE/TEXT VIEW (Took 5 columns) */}
        <div className="lg:col-span-6 flex flex-col h-[75vh] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden relative">
          <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Risk-Highlighted Contract Document
              </h3>
            </div>
            <div className="flex gap-2.5">
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                Risk
              </span>
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Caution
              </span>
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Safe
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed space-y-4 select-text selection:bg-indigo-200 selection:text-indigo-900">
            {segments && segments.length > 0 ? (
              <div className="whitespace-pre-wrap breakdown-paragraphs">
                {segments.map((seg, idx) => {
                  let styleClass = "";
                  switch (seg.risk) {
                    case "danger":
                      styleClass =
                        "bg-red-50 hover:bg-red-100 border-b-2 border-red-300 text-red-920 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:border-red-800 dark:text-red-300";
                      break;
                    case "caution":
                      styleClass =
                        "bg-amber-50 hover:bg-amber-100 border-b-2 border-amber-300 text-amber-920 dark:bg-amber-955/20 dark:hover:bg-amber-955/40 dark:border-amber-800 dark:text-amber-300";
                      break;
                    case "safe":
                      styleClass =
                        "bg-emerald-50 hover:bg-emerald-100 border-b-2 border-emerald-300 text-emerald-920 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300";
                      break;
                    case "none":
                    default:
                      styleClass = "text-slate-600 hover:bg-slate-50/50 dark:text-slate-300 dark:hover:bg-slate-800/20";
                      break;
                  }

                  return (
                    <span
                      key={idx}
                      onMouseEnter={() => setHoveredSegment(idx)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      className={`inline px-1 py-1 rounded transition-colors duration-150 cursor-help relative ${styleClass}`}
                    >
                      {seg.text}
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="text-slate-400 italic text-center pt-20 font-sans">
                No highlight segments generated. Re-analyzing might solve this.
              </div>
            )}
          </div>

          {/* Interactive Tooltip Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 text-slate-200 p-4 transition-all duration-300">
            {hoveredSegment !== null && segments[hoveredSegment]?.explanation ? (
              <div className="space-y-1.5 antialiased">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase">
                  {segments[hoveredSegment].risk === "danger" && (
                    <span className="text-rose-400">● AI Danger Warning</span>
                  )}
                  {segments[hoveredSegment].risk === "caution" && (
                    <span className="text-amber-400">● Caution Warning</span>
                  )}
                  {segments[hoveredSegment].risk === "safe" && (
                    <span className="text-emerald-400">● Safe Clause</span>
                  )}
                  {segments[hoveredSegment].risk === "none" && (
                    <span className="text-slate-350">● Neutral Clause</span>
                  )}
                </div>
                <p className="text-xs text-slate-300 font-sans leading-normal">
                  {segments[hoveredSegment].explanation}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-sans">
                <Info className="w-4 h-4 flex-shrink-0 text-slate-500 animate-pulse" />
                <span>Hover over any structural clause segment in the document above to decompile its legal risk instantly.</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: DIVIDED CONTROL/TABBED VIEW (Took 6 columns) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Tab Selection */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-1.5 flex shadow-sm">
            <button
              onClick={() => setActiveTab("summary")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "summary"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              Humanized Summary
            </button>
            <button
              onClick={() => setActiveTab("compliance")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "compliance"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              Risk & Compliance Score
            </button>
            <button
              onClick={() => setActiveTab("flags")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                activeTab === "flags"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              Red Flags & Backdoors
              {red_flags && red_flags.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                  {red_flags.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Screen Core Panels */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 min-h-[50vh] shadow-xl relative overflow-hidden">
            <AnimatePresence mode="wait">
              {/* Tab 1: "Humanized Summary" */}
              {activeTab === "summary" && (
                <motion.div
                  key="summary-tab-content"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        Plain English Humanization
                      </h4>
                      <p className="text-xs text-slate-400">
                        Non-legal plain translation of your obligations & rights.
                      </p>
                    </div>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800" />

                  {summary && summary.length > 0 ? (
                    <ul className="space-y-4">
                      {summary.map((point, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.08 }}
                          className="flex items-start gap-3.5"
                        >
                          <span className="w-6 h-6 mt-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold leading-none flex-shrink-0">
                            {idx + 1}
                          </span>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                            {point}
                          </p>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-slate-400 italic text-center py-20 font-sans">
                      Failed to compile humanized summary details.
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 2: "Legality & Risk Assessment" */}
              {activeTab === "compliance" && (
                <motion.div
                  key="compliance-tab-content"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        Compliance Severity & Health Analysis
                      </h4>
                      <p className="text-xs text-slate-400">
                        Safety metrics generated by combining heuristics and Gemini audits.
                      </p>
                    </div>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800" />

                  <div className="flex flex-col md:flex-row items-center justify-around gap-8 p-6 bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {/* Ring score */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          {/* Background Ring */}
                          <circle
                            cx="64"
                            cy="64"
                            r={strokeRadius}
                            className="stroke-slate-200 dark:stroke-slate-800"
                            strokeWidth="10"
                            fill="transparent"
                          />
                          {/* Active Ring */}
                          <circle
                            cx="64"
                            cy="64"
                            r={strokeRadius}
                            className={`transition-all duration-1000 ease-out ${getScoreColor(
                              compliance_score
                            )}`}
                            strokeWidth="10"
                            fill="transparent"
                            strokeDasharray={strokeCircumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span
                            className={`text-3xl font-black ${getScoreColor(
                              compliance_score
                            )}`}
                          >
                            {compliance_score}%
                          </span>
                          <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">
                            Health Score
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        Higher is fairer / less centralized
                      </span>
                    </div>

                    {/* Qualitative indicator details */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <span className="text-xs font-bold text-slate-400 block mb-1">
                          Audited Security Category
                        </span>
                        <div
                          className={`px-4 py-3 border rounded-xl flex items-center gap-2.5 font-bold text-sm ${statusConfig.textColor}`}
                        >
                          {statusConfig.icon}
                          <div>
                            <p className="leading-tight">{status}</p>
                            <span className="block text-[10px] font-medium opacity-80 mt-0.5">
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs leading-relaxed text-slate-500">
                        {status === "Legal" && (
                          <p>
                            This agreement represents balanced state conditions. No hidden loops, excessive liquidity locks, or absolute liability transfers were detected. This appears relatively direct and safe.
                          </p>
                        )}
                        {status === "High-Risk Suspicious" && (
                          <p>
                            Caution. This agreement integrates several asymmetric clauses. Some liability policies or owner backdoors present high centralization risk. Inspect Left highlights carefully.
                          </p>
                        )}
                        {status === "Illegal" && (
                          <p>
                            Warning. This content triggers severe policy violations, potentially regulatory non-compliant rules, or clauses that would fail enforcement in standard jurisdictions. Consult a legal expert before signing.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: "Red Flags & Anomalies" */}
              {activeTab === "flags" && (
                <motion.div
                  key="flags-tab-content"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-600 dark:text-rose-400">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        Critical Red Flags & Anomalies
                      </h4>
                      <p className="text-xs text-slate-400">
                        Highlighting hidden clauses or high-friction backdoors.
                      </p>
                    </div>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800" />

                  {red_flags && red_flags.length > 0 ? (
                    <div className="space-y-4 max-h-[48vh] overflow-y-auto pr-1">
                      {red_flags.map((flag, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-slate-50 dark:bg-slate-800/25 border border-slate-150 dark:border-slate-800 rounded-xl space-y-2.5 hover:border-rose-300 dark:hover:border-rose-950 transition duration-150"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 shrink-0 bg-rose-100 dark:bg-rose-950/80 rounded flex items-center justify-center text-xs font-bold text-rose-700 dark:text-rose-300 mt-0.5">
                              !
                            </span>
                            <div>
                              <h5 className="text-sm font-bold text-slate-850 dark:text-slate-200">
                                {flag.issue_detected}
                              </h5>
                              <p className="text-xs text-red-700 dark:text-rose-400/90 italic font-mono mt-1 pr-1 border-l-2 border-rose-200 pl-2">
                                &ldquo;{flag.clause}&rdquo;
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-3 rounded-lg flex gap-2 font-sans leading-relaxed">
                            <Info className="w-4.5 h-4.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-indigo-600 dark:text-indigo-400 mr-1 font-semibold">
                                Why it hurts you:
                              </strong>
                              {flag.why_it_is_bad}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <div className="max-w-sm space-y-1">
                        <h5 className="font-bold text-sm text-slate-850 dark:text-slate-200">
                          Absolutely Pristine Clean Health
                        </h5>
                        <p className="text-xs text-slate-400">
                          No red flags or dangerous anomalous clauses were isolated in this contract draft. Proceed with normal inspection.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
