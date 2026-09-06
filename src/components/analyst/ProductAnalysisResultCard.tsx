'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Sparkles, 
  DollarSign, 
  ShieldAlert, 
  PackagePlus, 
  Download, 
  Layers, 
  Scale, 
  FileText, 
  ArrowRight, 
  TrendingDown,
  Info,
  ExternalLink
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { ProductAnalysisReport, ProductListing } from '@/types';
import { PlatformBadge } from '@/components/ui/Badge';
import { formatINR, formatINRWithDecimals } from '@/lib/utils';
import { generatePolicyFeeComparison } from '@/lib/calculators/policyFeeEngine';
import globalStore from '@/lib/store';

interface ProductAnalysisResultCardProps {
  report: ProductAnalysisReport;
  onAddedToInventory?: () => void;
}

export const ProductAnalysisResultCard: React.FC<ProductAnalysisResultCardProps> = ({
  report,
  onAddedToInventory,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'policy' | 'market'>('overview');
  const [policyPlatform, setPolicyPlatform] = useState<'amazon' | 'flipkart'>('amazon');
  const [isAdded, setIsAdded] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Compute policy comparison if not already attached
  const policyData = report.policyComparison || generatePolicyFeeComparison(
    report.category,
    report.proposedSellingPrice,
    report.proposedCostPrice,
    report.weightGrams
  );

  const currentPolicy = policyPlatform === 'amazon' ? policyData.amazonPolicy : policyData.flipkartPolicy;

  const getVerdictBadge = () => {
    switch (report.overallVerdict) {
      case 'STRONG_GO':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>STRONG GO — HIGH COMMERCIAL VIABILITY</span>
          </div>
        );
      case 'PROCEED_WITH_CAUTION':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span>PROCEED WITH CAUTION — MODERATE RETURN RISK</span>
          </div>
        );
      case 'AVOID':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/40 shadow-sm">
            <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            <span>AVOID — HIGH RISK / THIN MARGINS</span>
          </div>
        );
    }
  };

  const handleAddDirectlyToInventory = () => {
    const skuCode = `AI-${report.category.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    
    const newProduct: ProductListing = {
      id: `prod-${Date.now()}`,
      sku: skuCode,
      asin: `B0${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      fsn: `FSN${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      name: report.productName,
      category: report.category,
      imageUrl: report.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
      costPrice: report.proposedCostPrice,
      sellingPrice: report.proposedSellingPrice,
      weightGrams: report.weightGrams,
      stock: 50,
      platform: 'both',
      status: 'active',
      estimatedMarginPercent: report.amazonEconomics.profitMarginPercent,
      createdAt: new Date().toISOString(),
    };

    globalStore.addProduct(newProduct);
    setIsAdded(true);
    setFeedback(`Product added to Catalog with SKU: ${skuCode}`);
    if (onAddedToInventory) onAddedToInventory();
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Product_Analysis_${report.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-sm dark:shadow-2xl space-y-7 animate-slide-up">
      {/* Top Banner & Verdict */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-200 dark:border-purple-500/20">
              REPORT #{report.id}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-bold capitalize">{report.category.replace('_', ' ')}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{report.weightGrams}g</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {report.productName}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {report.verdictSummary}
          </p>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-3 flex-shrink-0">
          {getVerdictBadge()}

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-indigo-600 dark:text-blue-400" />
              <span>Export Report</span>
            </button>

            <button
              onClick={handleAddDirectlyToInventory}
              disabled={isAdded}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                isAdded
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-600/30 dark:text-emerald-400 dark:border-emerald-500/50'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 shadow-blue-500/20'
              }`}
            >
              <PackagePlus className="h-4 w-4" />
              <span>{isAdded ? 'Listed in Catalog ✓' : 'Add to Inventory'}</span>
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Executive Overview & Economics</span>
        </button>

        <button
          onClick={() => setActiveTab('policy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'policy'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Fee Types & Policy Comparison (Current vs Latest)</span>
        </button>

        <button
          onClick={() => setActiveTab('market')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'market'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Competitor Landscape & Google Trends</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Gauges Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Return & RTO Risk */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Return & RTO Risk
                </span>
                <ShieldAlert className={`h-4 w-4 ${report.returnRiskScore > 50 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
              </div>

              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${
                  report.returnRiskScore > 60 ? 'text-rose-600 dark:text-rose-400' : report.returnRiskScore > 35 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {report.returnRiskScore}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">/ 100 Risk Index</span>
              </div>

              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    report.returnRiskScore > 60 ? 'bg-rose-500' : report.returnRiskScore > 35 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${report.returnRiskScore}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {report.returnRiskScore > 50
                  ? 'Elevated return risk due to category variances or impulse COD refusals.'
                  : 'Low return friction. Minimal customer return loss anticipated.'}
              </p>
            </div>

            {/* Demand Velocity */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Search Demand Score
                </span>
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-purple-700 dark:text-purple-400">
                  {report.demandScore}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">/ 100 Velocity</span>
              </div>

              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${report.demandScore}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Google Trends: <span className="font-bold text-slate-900 dark:text-white capitalize">{report.demandTrend} (+{report.trendGrowthPercent}% YoY)</span>
              </p>
            </div>

            {/* Price Benchmark */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Price Positioning
                </span>
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                  {report.marketPositioning}
                </span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-2">
                  {formatINR(report.proposedSellingPrice)}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sweet spot: <span className="font-bold text-amber-600 dark:text-amber-400">{formatINR(report.recommendedSellingPrice)}</span> (Market Avg: {formatINR(report.competitorPriceRange.average)})
              </p>
            </div>
          </div>

          {/* Side by Side Platform Economics */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 p-6 space-y-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
              Side-by-Side Dual Platform Unit Economics
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-amber-200 dark:border-[#FF9900]/30 bg-amber-50/40 dark:bg-slate-900/90 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <PlatformBadge platform="amazon" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {report.amazonEconomics.profitMarginPercent}% Net Margin
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Proposed Selling Price:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatINR(report.amazonEconomics.sellingPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Sourcing Cost:</span>
                    <span>-{formatINR(report.amazonEconomics.costPrice)}</span>
                  </div>
                  <div className="flex justify-between text-amber-700 dark:text-amber-400">
                    <span>Total Amazon Deductions + 18% GST:</span>
                    <span>-{formatINR(report.amazonEconomics.totalAmazonFees)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-black text-base text-emerald-700 dark:text-emerald-400">
                    <span>Amazon Net Profit / Unit:</span>
                    <span>{formatINR(report.amazonEconomics.netProfit)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 dark:border-[#2874F0]/30 bg-blue-50/40 dark:bg-slate-900/90 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <PlatformBadge platform="flipkart" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {report.flipkartEconomics.profitMarginPercent}% Net Margin
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Proposed Selling Price:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatINR(report.flipkartEconomics.sellingPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Sourcing Cost:</span>
                    <span>-{formatINR(report.flipkartEconomics.costPrice)}</span>
                  </div>
                  <div className="flex justify-between text-amber-700 dark:text-amber-400">
                    <span>Total Flipkart Deductions + 18% GST:</span>
                    <span>-{formatINR(report.flipkartEconomics.totalFlipkartFees)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-black text-base text-emerald-700 dark:text-emerald-400">
                    <span>Flipkart Net Profit / Unit:</span>
                    <span>{formatINR(report.flipkartEconomics.netProfit)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/10 p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Key Commercial Strengths</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {report.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/60 dark:bg-rose-950/10 p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                <span>Friction Points & Risk Factors</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {report.cons.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED FEE TYPES & POLICY COMPARISON */}
      {activeTab === 'policy' && (
        <div className="space-y-6 animate-fade-in">
          {/* Platform Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Exhaustive Marketplace Fee Slabs: Current vs Revised Policy</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Compare every charge type, referral revisions, weight slabs, return allocations, and GST impact.
              </p>
            </div>

            <div className="flex items-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setPolicyPlatform('amazon')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  policyPlatform === 'amazon'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Amazon SP-API Policy
              </button>
              <button
                type="button"
                onClick={() => setPolicyPlatform('flipkart')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  policyPlatform === 'flipkart'
                    ? 'bg-[#2874F0] text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Flipkart Seller Policy
              </button>
            </div>
          </div>

          {/* Quick Metrics Comparison Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold">Current Policy Deductions</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {formatINR(currentPolicy.currentTotalDeductions)}
              </div>
              <span className="text-[10px] text-slate-500">Margin: {currentPolicy.netMarginCurrent}%</span>
            </div>

            <div className="rounded-xl bg-purple-50/60 dark:bg-slate-950 p-4 border border-purple-200 dark:border-purple-500/40">
              <span className="text-[11px] text-purple-800 dark:text-purple-300 uppercase font-bold">Latest Policy Deductions</span>
              <div className="text-xl font-bold text-purple-800 dark:text-purple-300 mt-1">
                {formatINR(currentPolicy.latestTotalDeductions)}
              </div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Margin: {currentPolicy.netMarginLatest}%</span>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold">Net Policy Impact</span>
              <div className={`text-xl font-bold mt-1 ${
                currentPolicy.latestTotalDeductions <= currentPolicy.currentTotalDeductions
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-700 dark:text-rose-400'
              }`}>
                {currentPolicy.latestTotalDeductions <= currentPolicy.currentTotalDeductions ? '▼ ' : '▲ '}
                {formatINR(Math.abs(currentPolicy.latestTotalDeductions - currentPolicy.currentTotalDeductions))} per unit
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {currentPolicy.latestTotalDeductions <= currentPolicy.currentTotalDeductions ? 'Higher seller payout' : 'Increased platform fee'}
              </span>
            </div>
          </div>

          {/* Exhaustive Charge Types Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Charge / Fee Type</th>
                  <th className="py-3.5 px-4">Current Policy Schedule</th>
                  <th className="py-3.5 px-4">Latest / Revised Policy</th>
                  <th className="py-3.5 px-4 text-right">Fee Delta</th>
                  <th className="py-3.5 px-4">Policy Insights & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-900/50">
                {currentPolicy.charges.map((charge: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{charge.chargeType}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs">{charge.description}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{formatINRWithDecimals(charge.currentPolicyFee)}</div>
                      <div className="text-[10px] text-slate-500">{charge.currentPolicyRule}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-purple-700 dark:text-purple-300">{formatINRWithDecimals(charge.latestPolicyFee)}</div>
                      <div className="text-[10px] text-purple-600 dark:text-purple-400/80">{charge.latestPolicyRule}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold">
                      {charge.difference < 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">-{formatINRWithDecimals(Math.abs(charge.difference))}</span>
                      ) : charge.difference > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400">+{formatINRWithDecimals(charge.difference)}</span>
                      ) : (
                        <span className="text-slate-400">₹0.00</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">{charge.policyNote || 'Standard statutory schedule'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COMPETITOR & TRENDS */}
      {activeTab === 'market' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Competitor Price Cards */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Competitor Marketplace Benchmarks
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">Amazon, Flipkart, Meesho</span>
            </div>

            <div className="space-y-2.5">
              {report.competitors.map((comp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {comp.imageUrl && (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex-shrink-0">
                        <img 
                          src={comp.imageUrl} 
                          alt={comp.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <PlatformBadge platform={comp.platform} />
                        {comp.badge && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 px-1.5 py-0.5 rounded">
                            {comp.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-800 dark:text-slate-300 font-semibold truncate">{comp.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        ★ {comp.rating} ({comp.ratingsCount} reviews) • {comp.sellerName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900 dark:text-white">{formatINR(comp.price)}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Retail Price</div>
                    </div>

                    {comp.url && (
                      <a
                        href={comp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-xs"
                        title="View Live Listing"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Google Trends Search Velocity AreaChart */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-5 space-y-3 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  12-Month Search Interest (Google Trends)
                </h4>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-500/20">
                  {report.trendGrowthPercent > 0 ? `+${report.trendGrowthPercent}% YoY` : `${report.trendGrowthPercent}% YoY`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Consumer demand index and high-affinity regional states
              </p>
            </div>

            <div className="h-44 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report.trendHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTrends2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 text-xs text-slate-900 dark:text-white shadow-md">
                            <span className="font-bold">{label}:</span> {payload[0].value} / 100 Interest
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="interestScore"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTrends2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>High-Demand Regional Hubs:</span>
              <span className="text-slate-900 dark:text-slate-200 font-bold">{report.topDemandRegions.slice(0, 4).join(', ')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
