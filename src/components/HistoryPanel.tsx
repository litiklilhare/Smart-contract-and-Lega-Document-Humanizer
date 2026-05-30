import React from "react";
import { History, Trash2, Calendar, ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";
import { HistoryItem } from "../types";

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onRemoveItem: (id: string, e: React.MouseEvent) => void;
}

export default function HistoryPanel({
  history,
  onSelect,
  onClear,
  onRemoveItem,
}: HistoryPanelProps) {
  if (history.length === 0) return null;

  const getStatusBadge = (status: HistoryItem["status"]) => {
    switch (status) {
      case "Legal":
        return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-150 dark:border-emerald-900";
      case "Illegal":
        return "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-150 dark:border-rose-900";
      case "High-Risk Suspicious":
      default:
        return "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-150 dark:border-amber-900";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-slate-800 rounded-xl text-indigo-600 dark:text-indigo-400">
            <History className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Audit History Logs
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Reload previously audited agreements instantly from local cache.
            </p>
          </div>
        </div>

        <button
          onClick={onClear}
          className="text-xs font-semibold text-slate-400 hover:text-red-500 flex items-center gap-1 cursor-pointer transition py-1 px-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="group relative p-4 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/60 rounded-2xl bg-slate-50/40 dark:bg-slate-950/10 hover:bg-slate-50 dark:hover:bg-slate-800/20 cursor-pointer transition duration-200 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${getStatusBadge(item.status)}`}>
                  {item.status}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate pr-4">
                {item.name}
              </h4>
            </div>

            <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Compliance:</span>
                <span
                  className={`text-sm font-black ${
                    item.compliance_score >= 80
                      ? "text-emerald-500"
                      : item.compliance_score >= 50
                      ? "text-amber-500"
                      : "text-rose-500"
                  }`}
                >
                  {item.compliance_score}%
                </span>
              </div>
              <span className="text-xs font-bold text-indigo-500 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                Assess
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Remove item button */}
            <button
              onClick={(e) => onRemoveItem(item.id, e)}
              className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 dark:text-slate-700 dark:hover:text-red-400 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-150"
              title="Delete log"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
