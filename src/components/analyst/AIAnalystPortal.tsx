'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, History, Layers, CheckCircle2, FileText, BarChart2 } from 'lucide-react';
import { ProductResearchForm } from './ProductResearchForm';
import { ProductAnalysisResultCard } from './ProductAnalysisResultCard';
import { MasterAnalysisReportView } from './MasterAnalysisReportView';
import { AnalysisHistoryList } from './AnalysisHistoryList';
import { ProductAnalysisReport } from '@/types';
import { MasterProductInput, MasterProfitAnalysisReport } from '@/types/masterAnalysis';
import { runMasterProfitAnalysis } from '@/lib/ai/masterProfitEngine';
import { analyzeNewProduct } from '@/lib/ai/productResearchEngine';
import { generateDeterministicCustomPromptReport } from '@/lib/ai/geminiEngine';
import globalStore from '@/lib/store';

export const AIAnalystPortal: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStandardReport, setCurrentStandardReport] = useState<ProductAnalysisReport | null>(null);
  const [currentMasterReport, setCurrentMasterReport] = useState<MasterProfitAnalysisReport | null>(null);
  const [historyReports, setHistoryReports] = useState<ProductAnalysisReport[]>([]);
  const [viewMode, setViewMode] = useState<'master' | 'standard'>('master');
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  useEffect(() => {
    const loaded = globalStore.getAIReports();
    setHistoryReports(loaded);
  }, []);

  const handleAnalyze = async (input: MasterProductInput) => {
    setIsLoading(true);

    try {
      // Post to Gemini AI Backend
      const res = await fetch('/api/ai/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.masterReport) {
          setCurrentMasterReport(data.masterReport);
        }
        if (data.standardReport) {
          setCurrentStandardReport(data.standardReport);
        }
      } else {
        // Fallback to local execution
        const safeInput = {
          ...input,
          productName: input.productName || 'Wholesale Sourced Item',
          buyingPrice: input.buyingPrice > 0 ? input.buyingPrice : 280,
        };
        const masterReport = runMasterProfitAnalysis(safeInput);
        if (input.customPrompt && input.customPrompt.trim().length > 0) {
          masterReport.customPromptApplied = input.customPrompt.trim();
          masterReport.customPromptEvaluation = generateDeterministicCustomPromptReport(safeInput, masterReport);
        }
        setCurrentMasterReport(masterReport);

        const standardReport = await analyzeNewProduct({
          productName: safeInput.productName,
          category: safeInput.category,
          proposedCostPrice: masterReport.landedCostBreakdown.totalLandedCost,
          proposedSellingPrice: masterReport.finalRecommendation.bestBalancedSellingPrice,
          weightGrams: safeInput.weightGrams,
          imageUrl: safeInput.imageUrl,
        });

        setCurrentStandardReport(standardReport);
        globalStore.addAIReport(standardReport);
      }

      setHistoryReports(globalStore.getAIReports());
      setActiveTab('current');
    } catch (error) {
      console.error('Error analyzing product with Gemini:', error);
      const masterReport = runMasterProfitAnalysis(input);
      if (input.customPrompt && input.customPrompt.trim().length > 0) {
        masterReport.customPromptApplied = input.customPrompt.trim();
        masterReport.customPromptEvaluation = generateDeterministicCustomPromptReport(input, masterReport);
      }
      setCurrentMasterReport(masterReport);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryReport = (report: ProductAnalysisReport) => {
    setCurrentStandardReport(report);
    // Regenerate master report from historical data
    const regeneratedMaster = runMasterProfitAnalysis({
      productName: report.productName,
      category: report.category,
      buyingPrice: report.proposedCostPrice,
      weightGrams: report.weightGrams,
    });
    setCurrentMasterReport(regeneratedMaster);
    setActiveTab('current');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Classical Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-800 dark:text-purple-300 text-[11px] font-black uppercase tracking-wider mb-2 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>Google Gemini 1.5 Flash Vision & Intelligence Engine Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-purple-500/20">
              <Sparkles className="h-5 w-5" />
            </span>
            <span>AI Sourcing Analyst & Master Profit Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Data-driven product sourcing intelligence, custom directive testing, return classifications & 23-dimension master profit dossiers
          </p>
        </div>

        {/* View Mode & History Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 shadow-xs">
            <button
              onClick={() => setViewMode('master')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'master'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Master 23-Section Dossier</span>
            </button>

            <button
              onClick={() => setViewMode('standard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'standard'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              <span>Standard Dashboard</span>
            </button>
          </div>

          <div className="flex items-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 shadow-xs">
            <button
              onClick={() => setActiveTab('current')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'current'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Active Sourcing</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>Saved Dossiers ({historyReports.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'current' ? (
        <div className="space-y-8">
          {/* Research Input Form */}
          <ProductResearchForm onAnalyze={handleAnalyze} isLoading={isLoading} />

          {/* Render Result: Master Dossier or Standard, or Empty Starter State */}
          {currentMasterReport ? (
            <>
              {viewMode === 'master' && (
                <MasterAnalysisReportView
                  report={currentMasterReport}
                  onAddedToInventory={() => {}}
                />
              )}

              {viewMode === 'standard' && currentStandardReport && (
                <ProductAnalysisResultCard
                  report={currentStandardReport}
                  onAddedToInventory={() => {}}
                />
              )}
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Ready for AI Product Intelligence Analysis
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Upload a Telegram sourcing screenshot or enter your product details above, then click <strong className="text-purple-600 dark:text-purple-400">Execute Analysis</strong> to generate the comprehensive 23-section master profit dossier and Amazon/Flipkart market comparison.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-4 text-xs text-left">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px] font-black">1</span>
                    <span>Attach or Type</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Upload screenshot or enter wholesale price</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-black">2</span>
                    <span>AI Vision Computes</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Extracts specs, landed costs & fee engines</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-black">3</span>
                    <span>Live Market Compare</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Inspect real Amazon & Flipkart listings</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="h-5 w-5 text-blue-400" />
                <span>Historical Product Research Reports</span>
              </h2>
              <span className="text-xs text-slate-400">{historyReports.length} reports generated</span>
            </div>

            <AnalysisHistoryList
              reports={historyReports}
              onSelectReport={handleSelectHistoryReport}
              onDeleteReport={(id) => {
                globalStore.deleteAIReport(id);
                setHistoryReports(globalStore.getAIReports());
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
