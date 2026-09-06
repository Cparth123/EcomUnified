'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Package, 
  Calculator, 
  Layers, 
  TrendingUp, 
  ExternalLink,
  ShieldCheck,
  KeyRound,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { AmazonOrdersTable } from './AmazonOrdersTable';
import { AmazonProductsTable } from './AmazonProductsTable';
import { AmazonMarginCalculator } from './AmazonMarginCalculator';
import globalStore from '@/lib/store';

export const AmazonPortal: React.FC = () => {
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

  const isConnected = Boolean(credentials.amazon?.isConnected || credentials.amazon?.clientId);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-amber-200 dark:border-[#FF9900]/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-[#131921] p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-700 dark:text-[#FF9900] font-black text-2xl tracking-tight">amazon</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-[#FF9900]/20 text-amber-800 dark:text-[#FF9900] border border-amber-300 dark:border-[#FF9900]/40">
                Seller Central SP-API
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">Amazon India Operations Portal</h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
              Manage FBA & Easy Ship orders, inventory velocity, automated referral/closing fee deductions, and unit profit calculations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3.5 text-center shadow-xs">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">SP-API Status</div>
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
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Marketplace</div>
              <div className="text-xs font-bold text-amber-700 dark:text-[#FF9900] mt-1">Amazon.in</div>
            </div>
          </div>
        </div>

        {/* Ambient glow accent */}
        <div className="absolute right-0 top-0 h-48 w-48 bg-[#FF9900]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Connection Callout when official key is missing */}
      {!isConnected && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Official Amazon SP-API Key Required</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Dummy data removed. Add your official Amazon Developer LWA Client ID, Client Secret, and Refresh Token in Settings to stream live orders.
              </p>
            </div>
          </div>

          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex-shrink-0"
          >
            <span>Enter Amazon Keys</span>
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
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
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
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Product Catalog & ASINs</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'calculator'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>Margin & Fee Calculator</span>
        </button>
      </div>

      {/* Active Tab View */}
      <div>
        {activeTab === 'orders' && <AmazonOrdersTable />}
        {activeTab === 'products' && <AmazonProductsTable />}
        {activeTab === 'calculator' && <AmazonMarginCalculator />}
      </div>
    </div>
  );
};

