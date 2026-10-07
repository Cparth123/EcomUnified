'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  CheckCircle2, 
  RotateCcw, 
  AlertTriangle, 
  XCircle, 
  Percent, 
  TrendingUp, 
  ArrowUpRight,
  Filter,
  Calendar,
  Layers,
  Sparkles,
  Download,
  KeyRound,
  ShieldCheck,
  PackagePlus,
  Package
} from 'lucide-react';
import globalStore from '@/lib/store';
import { PlatformType } from '@/types';
import { MetricCard } from '@/components/ui/MetricCard';
import { RevenueProfitChart } from './RevenueProfitChart';
import { OrderStatusDonutChart } from './OrderStatusDonutChart';
import { PlatformComparisonBarChart } from './PlatformComparisonBarChart';
import { RecentAlertsList } from './RecentAlertsList';
import { formatINR } from '@/lib/utils';
import Link from 'next/link';

export const DashboardOverview: React.FC = () => {
  const [platformFilter, setPlatformFilter] = useState<PlatformType>('all');
  const [daysFilter, setDaysFilter] = useState<number>(30);
  const [credentials, setCredentials] = useState(globalStore.getCredentials());

  useEffect(() => {
    const updateCreds = () => {
      setCredentials(globalStore.getCredentials());
    };
    updateCreds();
    window.addEventListener('storage', updateCreds);
    return () => window.removeEventListener('storage', updateCreds);
  }, []);

  const isAmazonConnected = Boolean(credentials.amazon?.isConnected || credentials.amazon?.clientId);
  const isFlipkartConnected = Boolean(credentials.flipkart?.isConnected || credentials.flipkart?.appId);
  const hasAnyChannelConnected = isAmazonConnected || isFlipkartConnected;

  // Get reactive metrics from store
  const metrics = useMemo(() => {
    return globalStore.getDashboardMetrics(platformFilter, daysFilter);
  }, [platformFilter, daysFilter]);

  const recentOrders = useMemo(() => {
    return globalStore.getOrders({ platform: platformFilter });
  }, [platformFilter]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header & Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Seller Command Center
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-blue-500/20 text-indigo-700 dark:text-blue-400 border border-indigo-200 dark:border-blue-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-blue-400 animate-pulse"></span>
              {hasAnyChannelConnected ? 'Marketplaces Connected' : 'Ready for API Keys'}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-channel analytics for Amazon India & Flipkart Seller accounts
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Platform Toggle */}
          <div className="flex items-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 shadow-sm">
            <button
              onClick={() => setPlatformFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                platformFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Channels
            </button>
            <button
              onClick={() => setPlatformFilter('amazon')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                platformFilter === 'amazon'
                  ? 'bg-[#FF9900] text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Amazon</span>
            </button>
            <button
              onClick={() => setPlatformFilter('flipkart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                platformFilter === 'flipkart'
                  ? 'bg-[#2874F0] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Flipkart</span>
            </button>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 shadow-sm">
            {[
              { label: 'Today', val: 1 },
              { label: '7D', val: 7 },
              { label: '30D', val: 30 },
              { label: '90D', val: 90 },
            ].map(d => (
              <button
                key={d.val}
                onClick={() => setDaysFilter(d.val)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  daysFilter === d.val
                    ? 'bg-slate-900 text-white dark:bg-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Telegram Wholesale Sourcing Quick Banner */}
      <div className="rounded-3xl border border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 p-6 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-0.5 text-xs font-bold text-indigo-200">
            <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
            <span>AI Wholesale Sourcing & Margin Arbitrage</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Find Surat & Delhi Wholesale Suppliers for Amazon Products
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Scan Telegram wholesale channels using Gemini AI vision. Compare unit prices (₹35/pc wholesale vs ₹299 retail) with live stock verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-slate-900 shadow-lg hover:bg-slate-100 transition-all active:scale-95"
          >
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>Find Cheapest Supplier</span>
          </Link>

          <Link
            href="/orders"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-3 text-xs font-bold text-white transition-colors"
          >
            <Package className="h-4 w-4 text-amber-400" />
            <span>Auto Orders Pipeline</span>
          </Link>
        </div>
      </div>

      {/* Financial Core Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Financial & Profit Realization
          </h2>
          <span className="text-xs text-slate-500 font-medium">After Referral, Closing, Shipping & 18% GST</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Gross Revenue"
            value={formatINR(metrics.totalGrossRevenue)}
            icon={<DollarSign className="h-6 w-6" />}
            variant="default"
            subtitle={`${metrics.deliveredOrders} delivered units`}
          />

          <MetricCard
            title="Platform Fees Deducted"
            value={formatINR(metrics.totalPlatformFees)}
            icon={<Percent className="h-6 w-6" />}
            variant="amber"
            subtitle={`${metrics.feeToRevenuePercent}% of gross revenue`}
          />

          <MetricCard
            title="Real Net Profit"
            value={formatINR(metrics.totalNetProfit)}
            icon={<TrendingUp className="h-6 w-6" />}
            variant="emerald"
            subtitle="Actual in-pocket cash"
          />

          <MetricCard
            title="Net Profit Margin"
            value={`${metrics.overallMarginPercent}%`}
            icon={<Sparkles className="h-6 w-6" />}
            variant="purple"
            subtitle={`Avg Order Value: ${formatINR(metrics.averageOrderValue)}`}
          />
        </div>
      </div>

      {/* Order Status Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Order Fulfillment & Health Velocity
          </h2>
          <span className="text-xs text-slate-500 font-medium">{metrics.totalOrders} total processed</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Total Orders"
            value={metrics.totalOrders}
            icon={<ShoppingBag className="h-5 w-5" />}
            variant="default"
          />

          <MetricCard
            title="Successful / Delivered"
            value={metrics.deliveredOrders}
            icon={<CheckCircle2 className="h-5 w-5" />}
            variant="emerald"
            badgeText={`${((metrics.deliveredOrders / Math.max(1, metrics.totalOrders)) * 100).toFixed(0)}%`}
          />

          <MetricCard
            title="Returned Orders"
            value={metrics.returnedOrders}
            icon={<RotateCcw className="h-5 w-5" />}
            variant="rose"
            badgeText={`${metrics.returnRatePercent}% Rate`}
          />

          <MetricCard
            title="RTO (Return to Origin)"
            value={metrics.rtoOrders}
            icon={<AlertTriangle className="h-5 w-5" />}
            variant="amber"
            badgeText={`${metrics.rtoRatePercent}% Rate`}
          />

          <MetricCard
            title="Cancelled Orders"
            value={metrics.cancelledOrders}
            icon={<XCircle className="h-5 w-5" />}
            variant="default"
            badgeText="Pre-dispatch"
          />
        </div>
      </div>

      {/* Operational Efficiency Ratios Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
          <div className="px-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Customer Return Rate</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-xl font-black ${metrics.returnRatePercent > 18 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-200'}`}>
                {metrics.returnRatePercent}%
              </span>
              <span className="text-[10px] text-slate-400">Benchmark: &lt;15%</span>
            </div>
          </div>

          <div className="px-2 pt-2 sm:pt-0">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Courier RTO Friction</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-xl font-black ${metrics.rtoRatePercent > 10 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-200'}`}>
                {metrics.rtoRatePercent}%
              </span>
              <span className="text-[10px] text-slate-400">COD Refusals</span>
            </div>
          </div>

          <div className="px-2 pt-2 sm:pt-0">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Average Order Value (AOV)</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {formatINR(metrics.averageOrderValue)}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Per basket</span>
            </div>
          </div>

          <div className="px-2 pt-2 sm:pt-0">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Marketplace Fee Ratio</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                {metrics.feeToRevenuePercent}%
              </span>
              <span className="text-[10px] text-slate-400">Of sales deducted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueProfitChart data={metrics.timelineData} />
        </div>
        <div className="lg:col-span-1">
          <OrderStatusDonutChart
            delivered={metrics.deliveredOrders}
            returned={metrics.returnedOrders}
            rto={metrics.rtoOrders}
            cancelled={metrics.cancelledOrders}
          />
        </div>
      </div>

      {/* Secondary Row: Platform Comparison & Return Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlatformComparisonBarChart
          amazon={metrics.platformBreakdown.amazon}
          flipkart={metrics.platformBreakdown.flipkart}
        />
        <RecentAlertsList orders={recentOrders} />
      </div>
    </div>
  );
};

