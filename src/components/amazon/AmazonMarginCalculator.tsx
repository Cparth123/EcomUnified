'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  HelpCircle, 
  CheckCircle, 
  ArrowRight, 
  Bookmark, 
  RefreshCw, 
  PieChart as PieIcon,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  calculateAmazonFees, 
  AMAZON_CATEGORIES 
} from '@/lib/calculators/amazonFeeEngine';
import { formatINR, formatINRWithDecimals } from '@/lib/utils';
import { AmazonFeeCalculationInput } from '@/types';

export const AmazonMarginCalculator: React.FC = () => {
  const [category, setCategory] = useState<string>('electronics_accessories');
  const [costPrice, setCostPrice] = useState<number>(350);
  const [sellingPrice, setSellingPrice] = useState<number>(999);
  const [weightGrams, setWeightGrams] = useState<number>(350);
  const [shippingZone, setShippingZone] = useState<'local' | 'regional' | 'national'>('national');
  const [fulfillmentType, setFulfillmentType] = useState<'easyship' | 'fba' | 'selfship'>('easyship');
  const [savedPresets, setSavedPresets] = useState<{ name: string; price: number; cost: number; category: string }[]>([
    { name: 'Wireless Earbuds', price: 799, cost: 280, category: 'electronics_accessories' },
    { name: 'Memory Foam Pillow', price: 1299, cost: 420, category: 'home_kitchen' },
    { name: 'Cotton T-Shirt', price: 599, cost: 190, category: 'fashion_apparel' },
  ]);
  const [presetFeedback, setPresetFeedback] = useState<string | null>(null);

  const calcResult = useMemo(() => {
    return calculateAmazonFees({
      category,
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      weightGrams: Number(weightGrams) || 100,
      shippingZone,
      fulfillmentType,
    });
  }, [category, costPrice, sellingPrice, weightGrams, shippingZone, fulfillmentType]);

  const handleSavePreset = () => {
    const name = prompt('Enter a name for this calculator preset (e.g. "Smart Watch 44mm"):');
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
            <Calculator className="h-5 w-5 text-[#FF9900]" />
            <span>Amazon India Margin & Fee Calculator</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Accurate real-time fee slabs: Referral (category-wise), Closing Slabs, Easy Ship & FBA Weight Slabs, and 18% GST
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick Presets:</span>
          {savedPresets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(p)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#FF9900]/15 hover:text-[#FF9900] border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
            >
              {p.name}
            </button>
          ))}
          <button
            onClick={handleSavePreset}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/40 hover:bg-[#FF9900]/25 transition-colors shadow-sm"
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

      {/* Main Grid: Inputs vs Calculation Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input parameters */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 sm:p-6 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
            Product & Fulfillment Parameters
          </h3>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Marketplace Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 text-xs text-slate-900 dark:text-white focus:border-[#FF9900] focus:outline-none"
            >
              {Object.entries(AMAZON_CATEGORIES).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.name} ({val.referralRate * 100}% referral)
                </option>
              ))}
            </select>
          </div>

          {/* Cost Price vs Selling Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Product Cost Price (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                <input
                  type="number"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-8 pr-4 text-xs font-bold text-slate-900 dark:text-white focus:border-[#FF9900] focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500">Sourcing / Manufacturing cost</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Listing Selling Price (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF9900] text-xs font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#FF9900]/40 pl-8 pr-4 text-xs font-bold text-slate-900 dark:text-white focus:border-[#FF9900] focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500">Customer checkout price</p>
            </div>
          </div>

          {/* Weight in Grams */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Package Weight (Grams)</label>
              <span className="text-xs font-bold text-[#FF9900]">{weightGrams} g ({(weightGrams / 1000).toFixed(2)} kg)</span>
            </div>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={weightGrams}
              onChange={(e) => setWeightGrams(Number(e.target.value))}
              className="w-full accent-[#FF9900] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>50g (Small)</span>
              <span>500g (Standard Slab)</span>
              <span>2kg</span>
              <span>5000g (Heavy)</span>
            </div>
          </div>

          {/* Shipping Zone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Delivery Zone</label>
            <div className="grid grid-cols-3 gap-2">
              {(['local', 'regional', 'national'] as const).map((zone) => (
                <button
                  key={zone}
                  type="button"
                  onClick={() => setShippingZone(zone)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    shippingZone === zone
                      ? 'bg-[#FF9900]/15 text-[#FF9900] border-[#FF9900] font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>

          {/* Fulfillment Model */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Fulfillment Model</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFulfillmentType('easyship')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  fulfillmentType === 'easyship'
                    ? 'bg-[#FF9900]/15 text-[#FF9900] border-[#FF9900] font-bold shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Easy Ship
              </button>
              <button
                type="button"
                onClick={() => setFulfillmentType('fba')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  fulfillmentType === 'fba'
                    ? 'bg-[#FF9900]/15 text-[#FF9900] border-[#FF9900] font-bold shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                FBA Prime (+₹14)
              </button>
              <button
                type="button"
                onClick={() => setFulfillmentType('selfship')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  fulfillmentType === 'selfship'
                    ? 'bg-[#FF9900]/15 text-[#FF9900] border-[#FF9900] font-bold shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Self Ship
              </button>
            </div>
          </div>
        </div>

        {/* Right: Real-time calculation outputs */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Profit Card */}
          <div className={`rounded-2xl border p-6 shadow-sm transition-all ${
            calcResult.isProfitable
              ? 'bg-gradient-to-br from-emerald-500/10 via-white to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border-emerald-200 dark:border-emerald-500/40'
              : 'bg-gradient-to-br from-rose-500/10 via-white to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900 border-rose-200 dark:border-rose-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Net Profit Per Unit
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

            {/* Break-even pill */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Calculated Break-Even Price:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{formatINR(calcResult.breakEvenPrice)}</span>
            </div>
          </div>

          {/* Detailed Fee Breakdown Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 sm:p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              Amazon Deductions Breakdown
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Referral Fee ({calcResult.referralFeePercent}%):</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatINRWithDecimals(calcResult.referralFee)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Closing Fee (Price Slab):</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatINRWithDecimals(calcResult.closingFee)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Shipping / Weight Handling ({weightGrams}g):</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatINRWithDecimals(calcResult.shippingFee)}</span>
              </div>

              {calcResult.pickAndPackFee > 0 && (
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span>Pick & Pack Fee:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatINRWithDecimals(calcResult.pickAndPackFee)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>GST on Amazon Fees (18%):</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatINRWithDecimals(calcResult.gstOnFees)}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-bold text-amber-600 dark:text-amber-400">
                <span>Total Amazon Deductions:</span>
                <span>{formatINRWithDecimals(calcResult.totalAmazonFees)}</span>
              </div>

              <div className="flex items-center justify-between font-bold text-[#FF9900]">
                <span>Net Bank Payout from Amazon:</span>
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
