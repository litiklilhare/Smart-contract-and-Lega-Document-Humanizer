import React, { useState, useRef } from "react";
import { UploadCloud, FileText, Code2, AlertCircle, RefreshCw, Clipboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UploadSectionProps {
  onAnalyzeFile: (file: File) => Promise<void>;
  onAnalyzeText: (text: string, title: string) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
  setError: (err: string | null) => void;
}

export default function UploadSection({
  onAnalyzeFile,
  onAnalyzeText,
  isProcessing,
  error,
  setError,
}: UploadSectionProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [pastedText, setPastedText] = useState("");
  const [pastedTitle, setPastedTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["pdf", "docx", "txt", "sol", "rs"];
    const validMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (
      validExtensions.includes(extension || "") ||
      validMimeTypes.includes(file.type)
    ) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      setError(
        "Unsupported file format. Please upload PDF, DOCX, Solidity (.sol), Rust (.rs), or TXT files."
      );
    }
  };

  const executeFileAnalysis = async () => {
    if (!selectedFile) return;
    try {
      await onAnalyzeFile(selectedFile);
    } catch (err: any) {
      // parent catches, but safeguard just in case
    }
  };

  const executeTextAnalysis = async () => {
    if (!pastedText.trim()) {
      setError("Please paste contract code or some legal text to analyze.");
      return;
    }
    setError(null);
    try {
      await onAnalyzeText(
        pastedText,
        pastedTitle.trim() || "Pasted Contract Code"
      );
    } catch (err: any) {
      // parent handles
    }
  };

  const pastePlaceholderText = () => {
    setPastedTitle("Sample Smart Contract");
    setPastedText(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TermLiquidationBackdoor {
    address public owner;
    uint256 public constant LIQUIDATION_FEE_PERCENT = 45; // EXTREME liquidator fee

    modifier onlyOwner() {
        require(msg.sender == owner, "Not absolute owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Backdoor trap: Unlimited owner withdraw of any state token balance
    function emergencyWithdrawalAll() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // Subsidized loan lockout clause
    function checkRegulatoryWaiver(address client) external view returns (bool) {
        // Obfuscated lockup loop
        return true;
    }
}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-2">
        <button
          onClick={() => {
            setActiveTab("upload");
            setError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
            activeTab === "upload"
              ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/30 dark:border-slate-700/50"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          File Upload Option
        </button>
        <button
          onClick={() => {
            setActiveTab("paste");
            setError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
            activeTab === "paste"
              ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/30 dark:border-slate-700/50"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Code2 className="w-4 h-4" />
          Paste Code or Legalese
        </button>
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          {activeTab === "upload" ? (
            <motion.div
              key="upload-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Drag n Drop Box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20"
                    : "border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.txt,.sol,.rs"
                />

                <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                  Drag & Drop Contract
                </h3>
                <p className="text-sm text-slate-400 dark:text-slate-400 mb-4 max-w-sm mx-auto">
                  Supports <span className="font-semibold text-slate-600 dark:text-slate-300">PDF, DOCX, Solidity (.sol), Rust (.rs)</span> or standard TXT text files (up to 15MB).
                </p>

                <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                  Browse Files
                </span>
              </div>

              {/* Selected File Details */}
              {selectedFile && (
                <div className="p-4 bg-indigo-50/40 dark:bg-slate-800/50 border border-indigo-100/65 dark:border-slate-700/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate max-w-md">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-slate-400 hover:text-red-500 font-medium transition cursor-pointer"
                  >
                    Remove File
                  </button>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={executeFileAnalysis}
                disabled={isProcessing || !selectedFile}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2.5 font-bold transition duration-200 cursor-pointer ${
                  selectedFile && !isProcessing
                    ? "bg-slate-900 border border-slate-950 dark:bg-indigo-600 dark:border-indigo-500 text-white shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Parsing & Auditing with Gemini Core...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Analyze & Humanize Document
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="paste-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Document Title (e.g. Solidity Escrow / Lease Agreement)"
                  value={pastedTitle}
                  onChange={(e) => setPastedTitle(e.target.value)}
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm bg-slate-50 focus:bg-white dark:bg-slate-800/50 dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-450 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={pastePlaceholderText}
                  className="px-4 py-3 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  Load Solidity Sandbox Code
                </button>
              </div>

              <div className="relative">
                <textarea
                  placeholder="Paste your smart contract code (Solidity/Rust) or raw legal terms..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={9}
                  className="w-full px-4 py-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono bg-slate-50 focus:bg-white dark:bg-slate-800/30 dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-450 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition resize-y leading-relaxed"
                />
                <div className="absolute bottom-3 right-4 text-[10px] font-mono text-slate-400">
                  {pastedText.length} characters
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={executeTextAnalysis}
                disabled={isProcessing || !pastedText.trim()}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2.5 font-bold transition duration-200 cursor-pointer ${
                  pastedText.trim() && !isProcessing
                    ? "bg-slate-900 border border-slate-950 dark:bg-indigo-600 dark:border-indigo-500 text-white shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Running AI Audit & Deobfuscator...
                  </>
                ) : (
                  <>
                    <Code2 className="w-5 h-5" />
                    Deobfuscate pasted Code
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Feedback Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden"
            >
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-300 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Analysis Guard Blocked</h4>
                  <p className="text-xs mt-0.5 leading-relaxed">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
