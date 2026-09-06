'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Bookmark, 
  CheckCircle, 
  HelpCircle,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { 
  calculateFlipkartFees, 
  FLIPKART_CATEGORIES 
} from '@/lib/calculators/flipkartFeeEngine';
import { formatINR, formatINRWithDecimals } from '@/lib/utils';

export const FlipkartMarginCalculator: React.FC = () => {
  const [category, setCategory] = useState<string>('electronics_accessories');
  const [costPrice, setCostPrice] = useState<number>(350);
  const [sellingPrice, setSellingPrice] = useState<number>(999);
  const [weightGrams, setWeightGrams] = useState<number>(350);
  const [shippingTier, setShippingTier] = useState<'bronze' | 'silver' | 'gold' | 'diamond'>('silver');
  const [shippingZone, setShippingZone] = useState<'local' | 'zonal' | 'national'>('national');
  const [paymentMode, setPaymentMode] = useState<'prepaid' | 'cod'>('prepaid');
  const [savedPresets, setSavedPresets] = useState<{ name: string; price: number; cost: number; category: string }[]>([
    { name: 'Wireless Earbuds', price: 799, cost: 280, category: 'electronics_accessories' },
    { name: 'Memory Foam Pillow', price: 1299, cost: 420, category: 'home_kitchen' },
    { name: 'Cotton T-Shirt', price: 599, cost: 190, category: 'fashion_apparel' },
  ]);
  const [presetFeedback, setPresetFeedback] = useState<string | null>(null);

  const calcResult = useMemo(() => {
    return calculateFlipkartFees({
      category,
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      weightGrams: Number(weightGrams) || 100,
      shippingTier,
      shippingZone,
      paymentMode,
    });
  }, [category, costPrice, sellingPrice, weightGrams, shippingTier, shippingZone, paymentMode]);

  const handleSavePreset = () => {
    const name = prompt('Enter a name for this calculator preset (e.g. "Flipkart Kurti Set"):');
    if (name && name.trim()) {
      setSavedPresets([
        ...savedPresets,
        { name: name.trim(), price: sellingPrice, cost: costPrice, category },
      ]);
      setPresetFeedback(`Preset "${name.trim()}" saved!`);
      setTimeout(() => setPresetFeedback(null), 3000);
    }
  };

  const loadPreset = (preset: { name: string; price: number; cost: number; category: string }) => {
    setSellingPrice(preset.price);
    setCostPrice(preset.cost);
    setCategory(preset.category);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="h-5 w-5 text-[#2874F0]" />
            <span>Flipkart Seller Margin & Fee Calculator</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Accurate fee structure: Category Commission %, Fixed Fee slab, Collection Fee (Prepaid vs COD), Tier Shipping, and 18% GST
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick Presets:</span>
          {savedPresets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(p)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#2874F0]/15 hover:text-[#2874F0] border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
            >
              {p.name}
            </button>
          ))}
          <button
            onClick={handleSavePreset}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#2874F0]/15 text-[#2874F0] border border-[#2874F0]/40 hover:bg-[#2874F0]/25 transition-colors shadow-sm"
          >
            <Bookmark className="h-3 w-3" />
            <span>Save Preset</span>
          </button>
        </div>
      </div>

      {presetFeedback && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{presetFeedback}</span>
        </div>
      )}

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input parameters */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 sm:p-6 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
            Flipkart Listing Parameters
          </h3>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category Commission Rate</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 text-xs text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
            >
              {Object.entries(FLIPKART_CATEGORIES).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.name} ({val.commissionRate * 100}% commission)
                </option>
              ))}
            </select>
          </div>

          {/* Cost Price vs Selling Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Product Cost Price (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                <input
                  type="number"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-8 pr-4 text-xs font-bold text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Listing Selling Price (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2874F0] text-xs font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#2874F0]/40 pl-8 pr-4 text-xs font-bold text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Weight in Grams */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Package Weight</label>
              <span className="text-xs font-bold text-[#2874F0]">{weightGrams} g ({(weightGrams / 1000).toFixed(2)} kg)</span>
            </div>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={weightGrams}
              onChange={(e) => setWeightGrams(Number(e.target.value))}
              className="w-full accent-[#2874F0] cursor-pointer"
            />
          </div>

          {/* Seller Tier */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Flipkart Seller Tier</label>
            <div className="grid grid-cols-4 gap-2">
              {(['bronze', 'silver', 'gold', 'diamond'] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setShippingTier(tier)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    shippingTier === tier
                      ? 'bg-[#2874F0]/15 text-[#2874F0] border-[#2874F0] font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Mode & Delivery Zone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Payment Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('prepaid')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    paymentMode === 'prepaid'
                      ? 'bg-[#2874F0]/15 text-[#2874F0] border-[#2874F0] font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Prepaid
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('cod')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    paymentMode === 'cod'
                      ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500 font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  COD
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Delivery Zone</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['local', 'zonal', 'national'] as const).map((zone) => (
                  <button
                    key={zone}
                    type="button"
                    onClick={() => setShippingZone(zone)}
                    className={`py-2 px-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                      shippingZone === zone
                        ? 'bg-[#2874F0]/15 text-[#2874F0] border-[#2874F0] font-bold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {zone}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Profit Card */}
          <div className={`rounded-2xl border p-6 shadow-sm transition-all ${
            calcResult.isProfitable
              ? 'bg-gradient-to-br from-blue-500/10 via-white to-white dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900 border-blue-200 dark:border-blue-500/40'
              : 'bg-gradient-to-br from-rose-500/10 via-white to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900 border-rose-200 dark:border-rose-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Flipkart Net Profit Per Unit
                </span>
                <div className={`text-3xl font-black mt-1 ${calcResult.isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {formatINR(calcResult.netProfit)}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Profit Margin
                </span>
                <div className={`text-2xl font-black mt-1 ${calcResult.isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {calcResult.profitMarginPercent}%
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Calculated Break-Even Price:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{formatINR(calcResult.breakEvenPrice)}</span>
            </div>
          </div>

          {/* Flipkart Fee Deductions List */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 sm:p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              Flipkart Deductions Breakdown
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Commission Fee ({calcResult.commissionFeePercent}%):</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatINRWithDecimals(calcResult.commissionFee)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Fixed Fee (Price Slab):</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatINRWithDecimals(calcResult.fixedFee)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Collection Fee ({paymentMode.toUpperCase()}):</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatINRWithDecimals(calcResult.collectionFee)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Shipping Fee ({shippingTier} tier • {weightGrams}g):</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatINRWithDecimals(calcResult.shippingFee)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>GST on Flipkart Fees (18%):</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatINRWithDecimals(calcResult.gstOnFees)}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-bold text-amber-600 dark:text-amber-400">
                <span>Total Flipkart Deductions:</span>
                <span>{formatINRWithDecimals(calcResult.totalFlipkartFees)}</span>
              </div>

              <div className="flex items-center justify-between font-bold text-[#2874F0]">
                <span>Net Bank Payout:</span>
                <span>{formatINRWithDecimals(calcResult.netPayout)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Less Cost Price:</span>
                <span className="text-rose-600 dark:text-rose-400">-{formatINR(costPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
