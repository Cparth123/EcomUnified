'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Package, 
  Calculator, 
  ShieldCheck,
  KeyRound,
  ArrowUpRight
} from 'lucide-react';
import { FlipkartOrdersTable } from './FlipkartOrdersTable';
import { FlipkartProductsTable } from './FlipkartProductsTable';
import { FlipkartMarginCalculator } from './FlipkartMarginCalculator';
import globalStore from '@/lib/store';

export const FlipkartPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'calculator'>('orders');
  const [credentials, setCredentials] = useState(globalStore.getCredentials());

  useEffect(() => {
    const updateCreds = () => {
      setCredentials(globalStore.getCredentials());
    };
    updateCreds();
    window.addEventListener('storage', updateCreds);
    return () => window.removeEventListener('storage', updateCreds);
  }, []);

  const isConnected = Boolean(credentials.flipkart?.isConnected || credentials.flipkart?.appId);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-blue-200 dark:border-[#2874F0]/30 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-[#172337] p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-[#3b82f6] font-black text-2xl tracking-tight">flipkart</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-[#2874F0]/20 text-blue-700 dark:text-[#3b82f6] border border-blue-300 dark:border-[#2874F0]/40">
                Seller Hub API
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">Flipkart Marketplace Operations Portal</h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
              Track Flipkart Assured orders, COD collection settlements, tier shipping discounts, and profit margin after marketplace commissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3.5 text-center shadow-xs">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">API Status</div>
              <div className={`text-xs font-bold flex items-center justify-center gap-1.5 mt-1 ${
                isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
              }`}>
                <span className={`h-2 w-2 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'
                }`}></span>
                {isConnected ? 'Connected' : 'Key Required'}
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3.5 text-center shadow-xs">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Seller Tier</div>
              <div className="text-xs font-bold text-amber-600 dark:text-[#FFE500] mt-1">Silver Tier</div>
            </div>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute right-0 top-0 h-48 w-48 bg-[#2874F0]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Connection Callout when official key is missing */}
      {!isConnected && (
        <div className="rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/80 dark:bg-blue-950/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white font-bold">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Official Flipkart Seller API Key Required</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Dummy data removed. Add your official Flipkart Application ID, App Secret, and Seller ID in Settings to sync live orders.
              </p>
            </div>
          </div>

          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex-shrink-0"
          >
            <span>Enter Flipkart Keys</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-[#2874F0] text-white shadow-md shadow-[#2874F0]/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Orders Management</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'products'
              ? 'bg-[#2874F0] text-white shadow-md shadow-[#2874F0]/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Product Catalog & FSNs</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'calculator'
              ? 'bg-[#2874F0] text-white shadow-md shadow-[#2874F0]/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>Margin & Fee Calculator</span>
        </button>
      </div>

      {/* Active Tab View */}
      <div>
        {activeTab === 'orders' && <FlipkartOrdersTable />}
        {activeTab === 'products' && <FlipkartProductsTable />}
        {activeTab === 'calculator' && <FlipkartMarginCalculator />}
      </div>
    </div>
  );
};

