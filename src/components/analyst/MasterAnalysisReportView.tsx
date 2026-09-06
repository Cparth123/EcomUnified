'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  DollarSign, 
  ShieldAlert, 
  PackagePlus, 
  Download, 
  Layers, 
  FileText, 
  Copy, 
  Check, 
  ArrowRight,
  TrendingDown,
  Info,
  Scale,
  Award,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  ExternalLink,
  Search,
  ShoppingCart,
  MessageSquare,
  Compass,
  ShieldCheck,
  Calculator,
  SlidersHorizontal,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { MasterProfitAnalysisReport } from '@/types/masterAnalysis';
import { ProductListing } from '@/types';
import globalStore from '@/lib/store';
import { formatINR } from '@/lib/utils';
import { PlatformBadge } from '@/components/ui/Badge';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { generateDeterministicCustomPromptReport } from '@/lib/ai/geminiEngine';

interface MasterAnalysisReportViewProps {
  report: MasterProfitAnalysisReport;
  onAddedToInventory?: () => void;
}

export const MasterAnalysisReportView: React.FC<MasterAnalysisReportViewProps> = ({
  report,
  onAddedToInventory,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedPromptOutput, setCopiedPromptOutput] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Prompt View Mode Switcher state
  const [reportViewTab, setReportViewTab] = useState<'prompt1_dossier' | 'prompt2_volume_matrix' | 'live_calculator'>(
    report.promptModeApplied === 'prompt2_volume_matrix' ? 'prompt2_volume_matrix' : 'prompt1_dossier'
  );

  // Live Interactive Product Price & Net Profit Simulator State
  const initialSellingPrice = report.finalRecommendation?.bestBalancedSellingPrice || Math.round((report.productInfo?.buyingPrice || 280) * 2.5);
  const [calcSellingPrice, setCalcSellingPrice] = useState<number>(initialSellingPrice);
  const [calcReturnRate, setCalcReturnRate] = useState<number>(10);
  const [calcAdSpendPercent, setCalcAdSpendPercent] = useState<number>(0);

  // Compute Live Profit Simulation
  const landedCost = report.landedCostBreakdown?.totalLandedCost || (report.productInfo?.buyingPrice || 280) + 45;
  const sp = Number(calcSellingPrice) > 0 ? Number(calcSellingPrice) : initialSellingPrice;

  const amzRefFee = Math.round(sp * (report.marketplaceFees?.amazon?.referralFee ? (report.marketplaceFees.amazon.referralFee / initialSellingPrice) : 0.12));
  const amzCloseFee = report.marketplaceFees?.amazon?.closingFee || 25;
  const amzShipFee = report.marketplaceFees?.amazon?.weightHandlingShipping || 65;
  const amzGstFees = Math.round((amzRefFee + amzCloseFee + amzShipFee) * 0.18);
  const amzTotalFees = amzRefFee + amzCloseFee + amzShipFee + amzGstFees;
  const amzNetPayout = sp - amzTotalFees;
  const returnLossPerUnit = Math.round((calcReturnRate / 100) * (report.returnPolicyClassification?.amazon?.policyType === 'Non-Returnable' ? landedCost : 85));
  const adSpendPerUnit = Math.round((calcAdSpendPercent / 100) * sp);
  const amzRealNetProfit = Math.round(amzNetPayout - landedCost - returnLossPerUnit - adSpendPerUnit);
  const amzRealMargin = Number(((amzRealNetProfit / sp) * 100).toFixed(1));

  const fkCommFee = Math.round(sp * (report.marketplaceFees?.flipkart?.commissionFee ? (report.marketplaceFees.flipkart.commissionFee / initialSellingPrice) : 0.11));
  const fkFixedFee = report.marketplaceFees?.flipkart?.fixedFee || 20;
  const fkShipFee = report.marketplaceFees?.flipkart?.shippingWeightHandling || 60;
  const fkGstFees = Math.round((fkCommFee + fkFixedFee + fkShipFee) * 0.18);
  const fkTotalFees = fkCommFee + fkFixedFee + fkShipFee + fkGstFees;
  const fkNetPayout = sp - fkTotalFees;
  const fkRealNetProfit = Math.round(fkNetPayout - landedCost - returnLossPerUnit - adSpendPerUnit);
  const fkRealMargin = Number(((fkRealNetProfit / sp) * 100).toFixed(1));

  const bestSimulatedNetProfit = Math.max(amzRealNetProfit, fkRealNetProfit);
  const simSalesVolumes = [20000, 30000, 50000, 90000];
  const simVolumeRows = simSalesVolumes.map((vol) => {
    const units = Math.max(1, Math.round(vol / sp));
    const grossProfit = units * (sp - landedCost);
    const net5 = Math.round(units * 0.95 * bestSimulatedNetProfit - (units * 0.05 * 75) - (units * adSpendPerUnit));
    const net20 = Math.round(units * 0.80 * bestSimulatedNetProfit - (units * 0.20 * 85) - (units * adSpendPerUnit));
    const net50 = Math.round(units * 0.50 * bestSimulatedNetProfit - (units * 0.50 * 110) - (units * adSpendPerUnit));
    return { vol, units, grossProfit, net5, net20, net50 };
  });

  // Generated or attached Prompt 2 full report
  const prompt2ReportText = report.customPromptEvaluation || generateDeterministicCustomPromptReport(
    {
      productName: report.productInfo?.productName || '',
      category: report.productInfo?.category || '',
      buyingPrice: report.productInfo?.buyingPrice || 280,
      weightGrams: report.productInfo?.weightGrams || 350,
    },
    report
  );

  const handleCopyClosingSummary = () => {
    navigator.clipboard.writeText(report.mandatoryClosingSummaryBlock);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  const handleCopyPromptOutput = () => {
    navigator.clipboard.writeText(prompt2ReportText);
    setCopiedPromptOutput(true);
    setTimeout(() => setCopiedPromptOutput(false), 3000);
  };

  const handleExportMarkdown = () => {
    const mdContent = `# PRODUCT ANALYSIS: ${report.productInfo.productName}\n\n` +
      `## 1. PRODUCT INFORMATION EXTRACTION\n` +
      `- Product Name: ${report.productInfo.productName}\n` +
      `- Brand & Model: ${report.productInfo.brandModel}\n` +
      `- Supplier Buying Price: ₹${report.productInfo.buyingPrice}\n` +
      `- Total Landed Cost: ₹${report.landedCostBreakdown.totalLandedCost}\n\n` +
      (report.customPromptApplied ? `## CUSTOM DIRECTIVE EVALUATION\nPrompt: ${report.customPromptApplied}\nFindings: ${prompt2ReportText}\n\n` : '') +
      `## 23. CONCISE DECISION SUMMARY\n` +
      `\`\`\`\n${report.mandatoryClosingSummaryBlock}\n\`\`\``;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Master_Analysis_${report.id}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddDirectlyToInventory = () => {
    const newProduct: ProductListing = {
      id: `prod-mstr-${Date.now()}`,
      sku: report.productInfo.skuCode,
      asin: `B0${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      fsn: `FSN${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      name: report.productInfo.productName,
      category: report.productInfo.category,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
      costPrice: report.landedCostBreakdown.totalLandedCost,
      sellingPrice: report.finalRecommendation.bestBalancedSellingPrice,
      weightGrams: report.productInfo.weightGrams,
      stock: report.productInfo.moq || 50,
      platform: 'both',
      status: 'active',
      estimatedMarginPercent: report.finalRecommendation.expectedNetMarginPercent,
      createdAt: new Date().toISOString(),
    };

    globalStore.addProduct(newProduct);
    setIsAdded(true);
    setNotification(`Product listed with SKU: ${report.productInfo.skuCode}`);
    if (onAddedToInventory) onAddedToInventory();
    setTimeout(() => setNotification(null), 4000);
  };

  const getDecisionBadge = () => {
    switch (report.finalBusinessDecision) {
      case 'BUY':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 shadow-xs">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>DECISION: BUY — HIGHLY RECOMMENDED</span>
          </div>
        );
      case 'BUY WITH CAUTION':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 shadow-xs">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span>DECISION: BUY WITH CAUTION</span>
          </div>
        );
      case "DON'T BUY":
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 shadow-xs">
            <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            <span>DECISION: DON'T BUY</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Classical Top Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                MASTER DOSSIER #{report.id}
              </span>
              <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-mono font-bold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded border border-purple-200 dark:border-purple-800/60 uppercase tracking-wider">
                {report.productOpportunityRating}
              </span>
              <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                CONFIDENTIAL COMMERCIAL SOURCING ASSESSMENT
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {report.productInfo.productName}
            </h2>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800/80">
                <span>🏷️ Category:</span>
                <span className="capitalize font-mono">{report.productInfo.category.replace(/_/g, ' ')}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/80">
                <span>🔢 HSN Code:</span>
                <span className="font-mono font-black">{report.productInfo.hsnCode || (report.productInfo.gstHsnDetails?.includes('HSN') ? report.productInfo.gstHsnDetails.split('•')[0].trim() : 'HSN 4202.92')}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/80">
                <span>📋 GST Rate:</span>
                <span className="font-mono">{report.productInfo.gstRatePercent ? `${report.productInfo.gstRatePercent}% GST` : '18% GST'}</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed pt-1">
              {report.executiveSummaryText}
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3 flex-shrink-0">
            {getDecisionBadge()}

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCopyClosingSummary}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
              >
                {copiedSummary ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-indigo-600 dark:text-blue-400" />}
                <span>{copiedSummary ? 'Copied Summary ✓' : 'Copy Decision Summary'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportMarkdown}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
              >
                <Download className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span>Export Dossier (MD)</span>
              </button>

              <button
                type="button"
                onClick={handleAddDirectlyToInventory}
                disabled={isAdded}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                  isAdded
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-600/30 dark:text-emerald-400 dark:border-emerald-500/50'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 shadow-blue-500/20'
                }`}
              >
                <PackagePlus className="h-4 w-4" />
                <span>{isAdded ? 'Catalog Listed ✓' : 'Add to Inventory'}</span>
              </button>
            </div>
          </div>
        </div>

        {notification && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* PROMPT 1 & PROMPT 2 & LIVE CALCULATOR VIEW SWITCHER TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100/90 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Layers className="h-4 w-4 text-indigo-600" />
            <span>Select Dossier View:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setReportViewTab('prompt1_dossier')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                reportViewTab === 'prompt1_dossier'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Prompt 1: Master 23-Dimension Dossier</span>
            </button>

            <button
              type="button"
              onClick={() => setReportViewTab('prompt2_volume_matrix')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                reportViewTab === 'prompt2_volume_matrix'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Prompt 2: 7-Step Volume Matrix (Promt.md)</span>
            </button>

            <button
              type="button"
              onClick={() => setReportViewTab('live_calculator')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                reportViewTab === 'live_calculator'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>Live Price & Net Profit Simulator</span>
            </button>
          </div>
        </div>

        {/* TAB 1: PROMPT 2 7-STEP ANALYSIS & VOLUME PROJECTION MATRIX */}
        {reportViewTab === 'prompt2_volume_matrix' && (
          <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900/80 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30 p-6 sm:p-7 space-y-4 shadow-sm animate-fade-in">
            <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/60 pb-3">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-black text-xs sm:text-sm uppercase tracking-wider">
                <BarChart3 className="h-4 w-4" />
                <span>PROMPT 2: 7-STEP PROFITABILITY & SALES VOLUME MATRIX (PROMT.MD)</span>
              </div>

              <button
                type="button"
                onClick={handleCopyPromptOutput}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-all shadow-xs"
              >
                {copiedPromptOutput ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
                <span>{copiedPromptOutput ? 'Copied Prompt 2 ✓' : 'Copy 7-Step Report'}</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-950/90 border border-indigo-200/80 dark:border-indigo-900/60 shadow-xs">
              <MarkdownRenderer content={prompt2ReportText} />
            </div>
          </div>
        )}

        {/* TAB 2: LIVE INTERACTIVE PRODUCT PRICE & NET PROFIT SIMULATOR */}
        {reportViewTab === 'live_calculator' && (
          <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900/80 bg-gradient-to-br from-emerald-50/70 via-white to-blue-50/40 dark:from-emerald-950/40 dark:via-slate-900 dark:to-blue-950/30 p-6 sm:p-7 space-y-6 shadow-sm animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 dark:border-emerald-900/60 pb-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-black text-xs sm:text-sm uppercase tracking-wider">
                  <Calculator className="h-4 w-4" />
                  <span>INTERACTIVE PRODUCT SELLING PRICE & NET PROFIT SIMULATOR</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Adjust selling price, return risk, and advertising spend to recalculate real net profits live
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCalcSellingPrice(initialSellingPrice);
                  setCalcReturnRate(10);
                  setCalcAdSpendPercent(0);
                }}
                className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset to Baseline</span>
              </button>
            </div>

            {/* Interactive Form Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Selling Price Field */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Custom Selling Price (₹)</span>
                  <span className="text-emerald-600 font-black">{formatINR(sp)}</span>
                </label>
                <input
                  type="number"
                  min={landedCost + 50}
                  step="10"
                  value={calcSellingPrice}
                  onChange={(e) => setCalcSellingPrice(Number(e.target.value))}
                  className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 text-base font-black text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
                <div className="flex items-center gap-1.5 pt-1">
                  {[-100, -50, 50, 100].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => setCalcSellingPrice(prev => Math.max(landedCost + 10, prev + delta))}
                      className="flex-1 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700"
                    >
                      {delta > 0 ? `+₹${delta}` : `-₹${Math.abs(delta)}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assumed Return Rate */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Assumed Return Rate (%)</span>
                  <span className="text-amber-600 font-bold">{calcReturnRate}%</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[5, 10, 15, 20, 30, 50].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setCalcReturnRate(rate)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        calcReturnRate === rate
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Ad Spend / TACoS % */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Advertising Spend (TACoS %)</span>
                  <span className="text-indigo-600 font-bold">{calcAdSpendPercent}%</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[0, 5, 10, 15, 20, 25].map((ad) => (
                    <button
                      key={ad}
                      type="button"
                      onClick={() => setCalcAdSpendPercent(ad)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        calcAdSpendPercent === ad
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {ad === 0 ? '0% Organic' : `${ad}%`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Real-Time Net Profit Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Amazon Live Results Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-amber-200 dark:border-amber-900/60 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <PlatformBadge platform="amazon" />
                    <span>Amazon India Real Net Profit</span>
                  </div>
                  <span className={`text-sm font-black ${amzRealNetProfit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {amzRealMargin}% Net Margin
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Net Profit / Unit</span>
                    <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {formatINR(amzRealNetProfit)}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Bank Payout / Unit</span>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                      {formatINR(amzNetPayout)}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                  <div className="flex justify-between">
                    <span>Total Amazon Deductions:</span>
                    <span className="font-bold text-slate-900 dark:text-white">-{formatINR(amzTotalFees)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Landed Sourcing Cost:</span>
                    <span className="font-bold text-rose-600">-{formatINR(landedCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assumed Return + Ad Impact:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">-{formatINR(returnLossPerUnit + adSpendPerUnit)}</span>
                  </div>
                </div>
              </div>

              {/* Flipkart Live Results Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-blue-200 dark:border-blue-900/60 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <PlatformBadge platform="flipkart" />
                    <span>Flipkart India Real Net Profit</span>
                  </div>
                  <span className={`text-sm font-black ${fkRealNetProfit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {fkRealMargin}% Net Margin
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Net Profit / Unit</span>
                    <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {formatINR(fkRealNetProfit)}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Bank Payout / Unit</span>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                      {formatINR(fkNetPayout)}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                  <div className="flex justify-between">
                    <span>Total Flipkart Deductions:</span>
                    <span className="font-bold text-slate-900 dark:text-white">-{formatINR(fkTotalFees)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Landed Sourcing Cost:</span>
                    <span className="font-bold text-rose-600">-{formatINR(landedCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assumed Return + Ad Impact:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">-{formatINR(returnLossPerUnit + adSpendPerUnit)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Step 6 Volume Projection Table at Custom Price */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                <span>Dynamic Sales Volume Profit Projection at {formatINR(sp)}</span>
              </h4>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3 whitespace-nowrap">Total Sales Target</th>
                      <th className="p-3 whitespace-nowrap text-center">Estimated Units Sold</th>
                      <th className="p-3 whitespace-nowrap text-right">Gross Profit</th>
                      <th className="p-3 whitespace-nowrap text-right">Net Profit (5% Return)</th>
                      <th className="p-3 whitespace-nowrap text-right">Net Profit (20% Return)</th>
                      <th className="p-3 whitespace-nowrap text-right">Net Profit (50% Return)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-300">
                    {simVolumeRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-black text-slate-900 dark:text-white">{formatINR(row.vol)}</td>
                        <td className="p-3 font-mono text-center font-bold text-indigo-600 dark:text-indigo-400">{row.units} units</td>
                        <td className="p-3 font-bold text-right text-slate-900 dark:text-white">{formatINR(row.grossProfit)}</td>
                        <td className="p-3 font-bold text-right text-emerald-600 dark:text-emerald-400">{formatINR(row.net5)}</td>
                        <td className="p-3 font-bold text-right text-blue-600 dark:text-blue-400">{formatINR(row.net20)}</td>
                        <td className="p-3 font-bold text-right text-purple-600 dark:text-purple-400">{formatINR(row.net50)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROMPT 1 MASTER 23-DIMENSION DOSSIER BREAKDOWN */}
        <div className={`space-y-8 ${reportViewTab === 'prompt1_dossier' ? 'block' : 'hidden'}`}>
          {/* SECTION 1: PRODUCT INFORMATION EXTRACTION */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 text-[10px] font-black">1</span>
              <span>Product Information Extraction</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Supplier Buying Price</span>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{formatINR(report.productInfo.buyingPrice)}</div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">MOQ: {report.productInfo.moq} units</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Total Landed Cost</span>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{formatINR(report.landedCostBreakdown.totalLandedCost)}</div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Incl. freight & packaging</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Weight & Dimensions</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">{report.productInfo.weightGrams}g • {report.productInfo.packType}</div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{report.productInfo.dimensions.length}x{report.productInfo.dimensions.width}x{report.productInfo.dimensions.height} cm</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20">
                <span className="text-amber-800 dark:text-amber-300 text-[10px] uppercase font-black">Official HSN Code</span>
                <div className="text-base font-black font-mono text-amber-900 dark:text-amber-200 mt-0.5">{report.productInfo.hsnCode || (report.productInfo.gstHsnDetails?.includes('HSN') ? report.productInfo.gstHsnDetails.split('•')[0].trim() : 'HSN 4202.92')}</div>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">{report.productInfo.gstRatePercent ? `${report.productInfo.gstRatePercent}% GST Slab` : '18% GST Slab'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Category & Subcategory</span>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-1 capitalize truncate">{report.productInfo.category.replace(/_/g, ' ')}</div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">{report.productInfo.subCategory || 'General Merchandise'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/40 dark:bg-indigo-950/20">
                <span className="text-indigo-800 dark:text-indigo-300 text-[10px] uppercase font-black">Marketplace Node</span>
                <div className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 mt-1 line-clamp-2 leading-tight">
                  {report.productInfo.recommendedMarketplaceCategory || 'Storage & Organization > Kitchen Storage > Lunch Bags'}
                </div>
              </div>
            </div>
        </div>

        {/* SECTION 2: RETURN POLICY CLASSIFICATION */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-[10px] font-black">2</span>
            <span>Return Policy & Reverse Logistics Classification</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Marketplace</th>
                  <th className="p-3">Category Return Policy</th>
                  <th className="p-3 text-center">Window</th>
                  <th className="p-3">Resalability of Returns</th>
                  <th className="p-3 text-center">Overall Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-900/50">
                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <PlatformBadge platform="amazon" />
                    <span>Amazon India</span>
                  </td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{report.returnPolicyClassification.amazon.policyType}</td>
                  <td className="p-3 text-center font-mono">{report.returnPolicyClassification.amazon.windowDays} Days</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{report.returnPolicyClassification.amazon.resalability}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                      report.returnPolicyClassification.amazon.overallRiskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400'
                    }`}>
                      {report.returnPolicyClassification.amazon.overallRiskLevel}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <PlatformBadge platform="flipkart" />
                    <span>Flipkart India</span>
                  </td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{report.returnPolicyClassification.flipkart.policyType}</td>
                  <td className="p-3 text-center font-mono">{report.returnPolicyClassification.flipkart.windowDays} Days</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{report.returnPolicyClassification.flipkart.resalability}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                      report.returnPolicyClassification.flipkart.overallRiskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400'
                    }`}>
                      {report.returnPolicyClassification.flipkart.overallRiskLevel}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-bold text-slate-800 dark:text-slate-300">Reverse Logistics Insight:</span> {report.returnPolicyClassification.courierRtoVsReturnInsight}
          </div>
        </div>

        {/* SECTION 3: 6-MONTH MARKET DEMAND & TREND REPORT */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-[10px] font-black">3</span>
            <span>6-Month Market Demand & Trend Report</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Demand Trajectory</span>
              <div className="font-bold text-purple-700 dark:text-purple-400 mt-1">{report.marketDemand6M.trajectory}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Monthly Search Volume</span>
              <div className="font-bold text-slate-900 dark:text-white mt-1">{report.marketDemand6M.categorySearchVolume}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Sales Velocity</span>
              <div className="font-bold text-emerald-700 dark:text-emerald-400 mt-1">{report.marketDemand6M.salesVelocity}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Review Inflow (6M)</span>
              <div className="font-bold text-slate-900 dark:text-white mt-1">{report.marketDemand6M.reviewInflow}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Seasonality</span>
              <div className="font-bold text-amber-700 dark:text-amber-400 mt-1">{report.marketDemand6M.seasonalityProfile}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Saturation Level</span>
              <div className="font-bold text-slate-700 dark:text-slate-300 mt-1">{report.marketDemand6M.saturationIndex}</div>
            </div>
          </div>
        </div>

        {/* SECTION 4 & 5: MARKET PRICE COMPARISON & LIVE SIMILAR LISTINGS */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-[10px] font-black">4 & 5</span>
              <span>Amazon & Flipkart Same-Product Market Comparison & Live Listings</span>
            </h3>

            <div className="flex items-center gap-2">
              <a
                href={`https://www.amazon.in/s?k=${encodeURIComponent(report.productInfo.productName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-[#FF9900]/15 dark:hover:bg-[#FF9900]/25 dark:text-[#FF9900] text-[11px] font-bold border border-amber-200 dark:border-[#FF9900]/30 transition-colors shadow-xs"
              >
                <Search className="h-3 w-3" />
                <span>Search Amazon.in ↗</span>
              </a>
              <a
                href={`https://www.flipkart.com/search?q=${encodeURIComponent(report.productInfo.productName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 dark:bg-[#2874F0]/15 dark:hover:bg-[#2874F0]/25 dark:text-blue-400 text-[11px] font-bold border border-blue-200 dark:border-[#2874F0]/30 transition-colors shadow-xs"
              >
                <Search className="h-3 w-3" />
                <span>Search Flipkart ↗</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.competitors.map((comp, idx) => {
              const isAmz = comp.marketplace.toLowerCase() === 'amazon';
              const searchLink = comp.listingUrl || (isAmz 
                ? `https://www.amazon.in/s?k=${encodeURIComponent(comp.title || report.productInfo.productName)}`
                : `https://www.flipkart.com/search?q=${encodeURIComponent(comp.title || report.productInfo.productName)}`);

              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/90 p-4 flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all group shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail Image */}
                    <div className="relative w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 overflow-hidden flex items-center justify-center shadow-xs">
                      <img 
                        src={comp.imageUrl || (isAmz ? 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60' : 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60')} 
                        alt={comp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Listing Title & Badges */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <PlatformBadge platform={comp.marketplace.toLowerCase() as any} />
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                          {comp.matchType}
                        </span>
                        {comp.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                            {comp.badge}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {comp.title}
                      </h4>

                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        Seller: <span className="text-slate-700 dark:text-slate-300 font-medium">{comp.sellerName}</span> • {comp.fulfillmentModel}
                      </p>
                    </div>
                  </div>

                  {/* Pricing, Reviews & Direct Click Link */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{formatINR(comp.price)}</span>
                        <span className="text-xs text-slate-400 line-through">{formatINR(comp.mrp)}</span>
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{comp.discountPercent}% OFF</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                        <span className="text-amber-500">★ {comp.rating}</span>
                        <span>({comp.reviewsCount.toLocaleString()} ratings)</span>
                      </div>
                    </div>

                    <a
                      href={searchLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 flex-shrink-0 ${
                        isAmz
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                      }`}
                    >
                      <span>Check on {comp.marketplace}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold">Lowest Market Price</span>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{formatINR(report.marketPriceSummary.lowestMarketPrice)}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold">Average Market Price</span>
              <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">{formatINR(report.marketPriceSummary.averageMarketPrice)}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold">Highest Market Price</span>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{formatINR(report.marketPriceSummary.highestMarketPrice)}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-slate-950 border border-emerald-200 dark:border-emerald-500/30">
              <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">Recommended Range</span>
              <div className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                {formatINR(report.marketPriceSummary.recommendedMarketRange.min)} – {formatINR(report.marketPriceSummary.recommendedMarketRange.max)}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 9: SELLING PRICE SCENARIO TABLE */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-[10px] font-black">9</span>
            <span>Selling Price Scenario Table (Multi-Tier Profit Simulations)</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-2.5">Selling Price</th>
                  <th className="p-2.5 text-right">Landed Cost</th>
                  <th className="p-2.5 text-right">Marketplace Fees</th>
                  <th className="p-2.5 text-right">Shipping</th>
                  <th className="p-2.5 text-right">Return Reserve</th>
                  <th className="p-2.5 text-right">Ads (8%)</th>
                  <th className="p-2.5 text-right">Net Profit</th>
                  <th className="p-2.5 text-center">Margin %</th>
                  <th className="p-2.5 text-center">ROI %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-900/50">
                {report.priceScenarios.map((sc, i) => (
                  <tr key={i} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${sc.sellingPrice === report.finalRecommendation.bestBalancedSellingPrice ? 'bg-purple-50/70 dark:bg-purple-950/20 border-l-4 border-purple-600 dark:border-purple-500 font-semibold' : ''}`}>
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{formatINR(sc.sellingPrice)}</span>
                      {sc.sellingPrice === report.finalRecommendation.bestBalancedSellingPrice && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 font-bold rounded border border-purple-200 dark:border-purple-500/30">BEST</span>
                      )}
                    </td>
                    <td className="p-2.5 text-right text-slate-500 dark:text-slate-400">{formatINR(sc.landedCost)}</td>
                    <td className="p-2.5 text-right text-amber-700 dark:text-amber-400 font-medium">{formatINR(sc.marketplaceFees)}</td>
                    <td className="p-2.5 text-right text-slate-500 dark:text-slate-400">{formatINR(sc.shippingFee)}</td>
                    <td className="p-2.5 text-right text-slate-500 dark:text-slate-400">{formatINR(sc.returnReserve)}</td>
                    <td className="p-2.5 text-right text-slate-500 dark:text-slate-400">{formatINR(sc.adSpendAllocation)}</td>
                    <td className="p-2.5 text-right font-black text-emerald-600 dark:text-emerald-400">{formatINR(sc.netProfit)}</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600 dark:text-emerald-400">{sc.profitMarginPercent}%</td>
                    <td className="p-2.5 text-center font-bold text-blue-600 dark:text-blue-400">{sc.roiPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 10 & 11: STRATEGIC PRICING TIERS & QUALITY SCORE */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-[10px] font-black">10 & 11</span>
            <span>Strategic Pricing Tiers & Quality Scores (Out of 10)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {report.strategicPricingTiers.map((tier, idx) => (
              <div 
                key={idx} 
                className={`rounded-2xl p-4 border transition-all ${
                  tier.tierName === 'BEST / BALANCED' 
                    ? 'border-purple-300 dark:border-purple-500/60 bg-purple-50/60 dark:bg-purple-950/20 shadow-sm' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-300">{tier.tierName}</span>
                  <span className="text-xs font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
                    ★ {tier.qualityScoreOutOf10} / 10
                  </span>
                </div>

                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {formatINR(tier.sellingPrice)}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1 border-b border-slate-200 dark:border-slate-800/80 pb-2 font-medium">
                  <span>Net Profit: <strong className="text-emerald-600 dark:text-emerald-400">{formatINR(tier.netProfit)}</strong></span>
                  <span>Margin: <strong className="text-emerald-600 dark:text-emerald-400">{tier.marginPercent}%</strong></span>
                  <span>ROI: <strong className="text-blue-600 dark:text-blue-400">{tier.roiPercent}%</strong></span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2">{tier.description}</p>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-400 text-xs font-bold flex items-center gap-2 shadow-xs">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{report.finalRecommendation.floorPriceWarning}</span>
          </div>
        </div>

        {/* SECTION 13 & 14: RETURN / RTO SENSITIVITY & EXTREME STRESS TESTS */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-[10px] font-black">13 & 14</span>
            <span>Return / RTO Sensitivity & Extreme Stress Testing (100 Orders)</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-2.5">Return / RTO %</th>
                  <th className="p-2.5 text-center">Delivered</th>
                  <th className="p-2.5 text-center">Returned</th>
                  <th className="p-2.5 text-right">Gross Revenue</th>
                  <th className="p-2.5 text-right">Reverse Logistics Cost</th>
                  <th className="p-2.5 text-right">Total Net Profit</th>
                  <th className="p-2.5 text-right">Profit / Delivered Unit</th>
                  <th className="p-2.5 text-center">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-900/50">
                {report.returnSensitivity.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">{row.returnRatePercent}% Returns</td>
                    <td className="p-2.5 text-center text-emerald-600 dark:text-emerald-400 font-bold">{row.deliveredOrders}</td>
                    <td className="p-2.5 text-center text-rose-600 dark:text-rose-400 font-bold">{row.returnedOrders}</td>
                    <td className="p-2.5 text-right font-black text-slate-900 dark:text-white">{formatINR(row.grossRevenue)}</td>
                    <td className="p-2.5 text-right text-rose-600 dark:text-rose-400 font-medium">{formatINR(row.returnLogisticsCost)}</td>
                    <td className={`p-2.5 text-right font-black ${row.netProfit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {formatINR(row.netProfit)}
                    </td>
                    <td className="p-2.5 text-right font-bold text-slate-800 dark:text-slate-200">{formatINR(row.profitPerDeliveredUnit)}</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600 dark:text-emerald-400">{row.marginPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-slate-950 border border-amber-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-800 dark:text-amber-400 text-xs">50% Return Crash Scenario</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400">
                  {report.extremeStressTests.scenario50.resultStatus}
                </span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {formatINR(report.extremeStressTests.scenario50.netProfitOrLoss)}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Profit / Delivered Unit: {formatINR(report.extremeStressTests.scenario50.profitOrLossPerDeliveredUnit)} • Margin: {report.extremeStressTests.scenario50.marginPercent}%
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-800 dark:text-rose-400 text-xs">80% Extreme Return Scenario</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400">
                  {report.extremeStressTests.scenario80.resultStatus}
                </span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {formatINR(report.extremeStressTests.scenario80.netProfitOrLoss)}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Break-even return limit: <strong className="text-slate-900 dark:text-white">{report.extremeStressTests.breakEvenReturnRatePercent}%</strong> (Stop selling if &gt; {report.extremeStressTests.stopSellingReturnRatePercent}%)
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 15: HEAD TO HEAD AMAZON VS FLIPKART */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-[10px] font-black">15</span>
            <span>Head-to-Head: Amazon vs Flipkart Winner Marketplace</span>
          </h3>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50 dark:from-blue-950/40 dark:via-purple-950/30 dark:to-slate-950 border border-indigo-200 dark:border-purple-500/30 flex items-center justify-between flex-wrap gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="text-xs text-indigo-700 dark:text-purple-400 uppercase font-extrabold tracking-wider">Overall Winner Channel</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <PlatformBadge platform={report.headToHeadComparison.winnerMarketplace.toLowerCase() as any} />
                <span>{report.headToHeadComparison.winnerMarketplace}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{report.headToHeadComparison.winnerReasoning}</p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold">Amazon Net Profit</span>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400">{formatINR(report.unitEconomics.amazonNetProfit)} / unit</div>
                <span className="text-[10px] text-slate-500">Margin: {report.unitEconomics.amazonProfitMarginPercent}%</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold">Flipkart Net Profit</span>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400">{formatINR(report.unitEconomics.flipkartNetProfit)} / unit</div>
                <span className="text-[10px] text-slate-500">Margin: {report.unitEconomics.flipkartProfitMarginPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 16 & 17: EARNINGS TARGETS & WORKING CAPITAL */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-[10px] font-black">16 & 17</span>
            <span>Earnings Targets, Daily Run-Rates & Working Capital Allocation</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
            {/* Earnings Targets */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-3">
              <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Required Sales to Hit Profit Goals</span>
              <table className="w-full text-left">
                <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="pb-1.5">Target Profit</th>
                    <th className="pb-1.5 text-center">Units</th>
                    <th className="pb-1.5 text-right">Revenue</th>
                    <th className="pb-1.5 text-right">Capital</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-900">
                  {report.earningsTargets.map((et, i) => (
                    <tr key={i}>
                      <td className="py-2 font-bold text-emerald-600 dark:text-emerald-400">{formatINR(et.targetNetProfit)}</td>
                      <td className="py-2 text-center font-bold text-slate-900 dark:text-white">{et.unitsRequired} units</td>
                      <td className="py-2 text-right text-slate-700 dark:text-slate-300">{formatINR(et.monthlyRevenue)}</td>
                      <td className="py-2 text-right text-slate-500 dark:text-slate-400">{formatINR(et.sourcingCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Run Rate */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-3">
              <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Daily / Weekly Velocity Needed</span>
              <table className="w-full text-left">
                <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="pb-1.5">Goal</th>
                    <th className="pb-1.5 text-center">Month</th>
                    <th className="pb-1.5 text-center">Week</th>
                    <th className="pb-1.5 text-center">Day</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-900">
                  {report.monthlyRunRates.map((mr, i) => (
                    <tr key={i}>
                      <td className="py-2 font-bold text-slate-900 dark:text-white">{mr.targetProfitLabel}</td>
                      <td className="py-2 text-center font-bold text-purple-700 dark:text-purple-400">{mr.unitsPerMonth} units</td>
                      <td className="py-2 text-center text-slate-700 dark:text-slate-300">{mr.unitsPerWeek} / wk</td>
                      <td className="py-2 text-center text-emerald-600 dark:text-emerald-400 font-bold">{mr.unitsPerDay} / day</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION 23: MANDATORY CONCISE DECISION SUMMARY */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] font-black">23</span>
              <span>Mandatory Concise Decision Summary Dossier</span>
            </h3>

            <button
              type="button"
              onClick={handleCopyClosingSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-500/40 transition-colors shadow-xs"
            >
              {copiedSummary ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedSummary ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 font-mono text-xs text-slate-200 dark:text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner">
            {report.mandatoryClosingSummaryBlock}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
