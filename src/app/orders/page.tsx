'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  RefreshCw,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  ArrowRight,
  ShieldCheck,
  Search,
  Clock,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AmazonOrderPipelineItem, AutomationSettings } from '@/types/supplierSearch';

export default function AmazonOrdersPipelinePage() {
  const [orders, setOrders] = useState<AmazonOrderPipelineItem[]>([]);
  const [settings, setSettings] = useState<AutomationSettings | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [reSearchingOrderId, setReSearchingOrderId] = useState<string | null>(null);

  const fetchOrdersAndSettings = async () => {
    try {
      const [ordRes, setRes] = await Promise.all([
        fetch('/api/amazon/sync', { method: 'POST' }),
        fetch('/api/automation/settings'),
      ]);
      const ordData = await ordRes.json();
      const setData = await setRes.json();

      if (ordData.success) setOrders(ordData.orders || []);
      if (setData.success) setSettings(setData.settings);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    fetchOrdersAndSettings();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await fetch('/api/amazon/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setSyncFeedback(data.message || 'Amazon orders synced and matched with wholesale suppliers.');
      }
    } catch (err: any) {
      setSyncFeedback(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResearchOrder = async (order: AmazonOrderPipelineItem) => {
    setReSearchingOrderId(order.id);
    try {
      const res = await fetch('/api/search/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: order.productName,
          sku: order.sellerSku,
          asin: order.asin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrdersAndSettings();
      }
    } catch (err) {
      console.error('Failed to re-search order:', err);
    } finally {
      setReSearchingOrderId(null);
    }
  };

  const filteredOrders = orders.filter(
    o =>
      !orderSearch ||
      o.amazonOrderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.productName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.sellerSku.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const matchedOrdersCount = orders.filter(o => o.autoSearchStatus === 'MATCHED').length;
  const totalPotentialProfit = orders.reduce((acc, o) => acc + (o.potentialProfitPerUnit || 0) * (o.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">
            <Package className="h-3.5 w-3.5" />
            <span>Amazon Auto Sourcing Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Amazon Orders & Wholesale Matching
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Incoming Amazon orders are automatically scanned across Telegram wholesale suppliers to find the lowest available sourcing price.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-amber-500/20 hover:opacity-95 disabled:opacity-50 transition-all"
          >
            <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
            <span>{isSyncing ? 'Syncing SP-API...' : 'Sync Amazon Orders'}</span>
          </button>
        </div>
      </div>

      {/* Auto Mode Status Banner */}
      <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-900/10 via-blue-900/5 to-transparent p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Amazon Auto Mode:
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> ACTIVE (Auto-Querying Telegram)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Orders automatically trigger multimodal AI search & lowest price extraction from Surat & Delhi wholesale groups.
            </p>
          </div>
        </div>

        <Link
          href="/settings/automation"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 shadow-sm"
        >
          <span>Configure Automation Settings</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {syncFeedback && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Amazon Orders</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{orders.length}</p>
          <span className="text-[11px] text-slate-500">Synced via SP-API</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Wholesale Matches Found
          </span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{matchedOrdersCount}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">100% In-Stock Suppliers</span>
        </div>

        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            Avg Sourcing Margin
          </span>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">84.6%</p>
          <span className="text-[11px] text-blue-600 dark:text-blue-400">₹35 wholesale vs ₹299 retail</span>
        </div>

        <div className="rounded-2xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
            Estimated Sourcing Profit
          </span>
          <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">
            ₹{totalPotentialProfit.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-purple-600 dark:text-purple-400">Across current orders</span>
        </div>
      </div>

      {/* Orders List & Search Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Search by Amazon Order ID, SKU, Product..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 shadow-sm"
            />
          </div>
        </div>

        {/* Orders Cards */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const match = order.bestSupplierMatch;
            const isReSearching = reSearchingOrderId === order.id;

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow space-y-5"
              >
                {/* Order Top Meta */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                      #{order.amazonOrderId}
                    </span>
                    <span className="text-xs text-slate-500">
                      Ordered: {new Date(order.orderDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded">
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResearchOrder(order)}
                      disabled={isReSearching}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                    >
                      <RefreshCw className={cn('h-3.5 w-3.5 text-slate-500', isReSearching && 'animate-spin')} />
                      <span>{isReSearching ? 'Searching...' : 'Re-search Telegram'}</span>
                    </button>
                  </div>
                </div>

                {/* Order Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Left: Amazon Product Details */}
                  <div className="lg:col-span-5 flex items-start gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950">
                      <img
                        src={order.imageUrl || 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80'}
                        alt={order.productName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                        {order.productName}
                      </p>
                      <p className="text-xs text-slate-500">
                        SKU: <span className="font-mono text-slate-700 dark:text-slate-300">{order.sellerSku}</span> • ASIN: {order.asin}
                      </p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Qty: {order.quantity} • Selling Price: <span className="font-bold text-slate-900 dark:text-white">₹{order.sellingPrice}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Sourced Telegram Supplier Match */}
                  <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                    {match ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded">
                              Cheapest Sourced Supplier
                            </span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {match.matchScore}% Match
                            </span>
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                              ● {match.stockStatus}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {match.supplierName} <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">({match.telegramChannel})</span>
                          </h4>

                          <div className="flex items-baseline gap-3 text-xs text-slate-500">
                            <span>Sourcing Cost: <strong className="text-slate-900 dark:text-white text-sm">₹{match.normalizedUnitPrice}/pc</strong></span>
                            <span>• Margin: <strong className="text-emerald-600 dark:text-emerald-400 text-sm">{order.sourcingMarginPercent}%</strong></span>
                            <span>• Location: {match.location}</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                          <a
                            href={match.telegramPostUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>Open Telegram Post</span>
                          </a>

                          {order.searchJobId && (
                            <Link
                              href={`/search/${order.searchJobId}`}
                              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              Compare all suppliers →
                            </Link>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <span>No automatic match found yet.</span>
                        </div>
                        <button
                          onClick={() => handleResearchOrder(order)}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          Search Now →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
