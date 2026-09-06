'use client';

import React from 'react';
import { Sparkles, Trash2, ArrowRight, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ProductAnalysisReport } from '@/types';
import { formatINR, formatDate } from '@/lib/utils';
import globalStore from '@/lib/store';

interface AnalysisHistoryListProps {
  reports: ProductAnalysisReport[];
  selectedReportId?: string;
  onSelectReport: (report: ProductAnalysisReport) => void;
  onDeleteReport: (id: string) => void;
}

export const AnalysisHistoryList: React.FC<AnalysisHistoryListProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
  onDeleteReport,
}) => {
  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-8 text-center text-xs text-slate-500 dark:text-slate-400">
        No product research history yet. Submit a product above to generate your first intelligence report.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Saved Research Reports ({reports.length})
        </h4>
        <span className="text-[11px] text-slate-400">Click to inspect and compare</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => {
          const isSelected = selectedReportId === r.id;
          const isStrongGo = r.overallVerdict === 'STRONG_GO';
          const isCaution = r.overallVerdict === 'PROCEED_WITH_CAUTION';

          return (
            <div
              key={r.id}
              onClick={() => onSelectReport(r)}
              className={`group relative rounded-2xl border p-4 backdrop-blur-md cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-xs ${
                isSelected
                  ? 'border-purple-400 bg-purple-50/70 dark:border-purple-500 dark:bg-purple-950/20 shadow-md ring-1 ring-purple-400'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      isStrongGo
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                        : isCaution
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
                        : 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30'
                    }`}
                  >
                    {r.overallVerdict.replace('_', ' ')}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteReport(r.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                    title="Delete report"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h5 className="font-bold text-slate-900 dark:text-white text-xs mt-2 line-clamp-2">
                  {r.productName}
                </h5>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span>Cost: {formatINR(r.proposedCostPrice)}</span>
                  <span>•</span>
                  <span className="text-slate-900 dark:text-white font-bold">Retail: {formatINR(r.proposedSellingPrice)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    +{r.amazonEconomics.profitMarginPercent}% Net
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className={r.returnRiskScore > 50 ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-slate-500 dark:text-slate-400'}>
                    Risk: {r.returnRiskScore}/100
                  </span>
                </div>

                <ArrowRight className="h-3.5 w-3.5 text-indigo-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
