'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Upload,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Tag,
  Boxes,
  HelpCircle,
  FileImage,
  X,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ManualProductSearchPage() {
  const router = useRouter();

  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [asin, setAsin] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [additionalKeywords, setAdditionalKeywords] = useState('');
  
  // Image handling
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [aiExtractedInfo, setAiExtractedInfo] = useState<any>(null);

  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchStep, setSearchStep] = useState<string>('');
  const [searchProgress, setSearchProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      setImagePreview(base64Data);
      setImageBase64(base64Data);

      // Trigger Gemini AI Image Analysis
      setIsAnalyzingImage(true);
      try {
        const res = await fetch('/api/search/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type,
            productName: productName || undefined,
          }),
        });
        const data = await res.json();
        if (data.success && data.analysis) {
          const ai = data.analysis;
          setAiExtractedInfo(ai);
          if (!productName) setProductName(ai.productName || '');
          if (!brand && ai.brand) setBrand(ai.brand);
          if (!model && ai.model) setModel(ai.model);
          if (!category && ai.category) setCategory(ai.category);
          if (ai.keywords && ai.keywords.length > 0) {
            setAdditionalKeywords(ai.keywords.join(', '));
          }
        }
      } catch (err: any) {
        console.warn('Image analysis error:', err);
      } finally {
        setIsAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setAiExtractedInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!productName.trim() && !imageBase64) {
      setError('Please provide either a product name or upload a product image.');
      return;
    }

    setError(null);
    setIsSearching(true);
    setSearchProgress(15);
    setSearchStep('Analyzing product specifications...');

    // Progress simulation steps
    const stepTimer1 = setTimeout(() => {
      setSearchProgress(40);
      setSearchStep('Mapping Telegram wholesale supplier channels...');
    }, 600);

    const stepTimer2 = setTimeout(() => {
      setSearchProgress(70);
      setSearchStep('Searching Telegram channels & extracting unit prices...');
    }, 1200);

    const stepTimer3 = setTimeout(() => {
      setSearchProgress(90);
      setSearchStep('Checking stock availability & ranking suppliers low-to-high...');
    }, 1800);

    try {
      const keywordsArray = additionalKeywords
        ? additionalKeywords.split(',').map(k => k.trim()).filter(Boolean)
        : [];

      const res = await fetch('/api/search/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: productName.trim(),
          imageBufferBase64: imageBase64 || undefined,
          sku: sku.trim() || undefined,
          asin: asin.trim() || undefined,
          brand: brand.trim() || undefined,
          model: model.trim() || undefined,
          category: category.trim() || undefined,
          additionalKeywords: keywordsArray,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Search failed.');
      }

      setSearchProgress(100);
      setSearchStep('Suppliers found! Redirecting to price comparison...');

      setTimeout(() => {
        router.push(`/search/${data.searchId}`);
      }, 500);
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setError(err.message || 'Failed to search suppliers. Please try again.');
      setIsSearching(false);
    }
  };

  const fillExample = (sampleName: string, sampleCat: string, sampleModel: string) => {
    setProductName(sampleName);
    setCategory(sampleCat);
    setModel(sampleModel);
    setBrand('Apple Compatible');
    setAdditionalKeywords(`${sampleModel} cover, ${sampleModel} case wholesale, transparent case`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-950 p-8 sm:p-10 text-white shadow-2xl border border-indigo-500/20">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1 text-xs font-semibold text-indigo-200">
            <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
            <span>AI Multimodal Wholesale Sourcing Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Find Telegram Wholesale Suppliers
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Upload an Amazon product image or enter product details. Gemini AI analyzes attributes and queries Telegram wholesale channels across Surat, Delhi, and Mumbai to find the lowest available unit prices.
          </p>

          {/* Quick Pre-fill Tags */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Try popular searches:</span>
            <button
              type="button"
              onClick={() => fillExample('iPhone 15 Transparent Mobile Cover', 'Mobile Accessories', 'iPhone 15')}
              className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 px-2.5 py-1 text-slate-200 transition-colors"
            >
              📱 iPhone 15 Transparent Case
            </button>
            <button
              type="button"
              onClick={() => fillExample('Samsung Galaxy S24 Ultra Matte Armor Case', 'Mobile Accessories', 'Galaxy S24 Ultra')}
              className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 px-2.5 py-1 text-slate-200 transition-colors"
            >
              🛡️ Galaxy S24 Ultra Case
            </button>
            <button
              type="button"
              onClick={() => fillExample('9D Edge-to-Edge Tempered Glass for iPhone 15', 'Screen Protectors', 'iPhone 15 9D Glass')}
              className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 px-2.5 py-1 text-slate-200 transition-colors"
            >
              ✨ 9D Tempered Glass
            </button>
          </div>
        </div>
      </div>

      {/* Main Search Card Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          {error && (
            <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 p-4 text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-6">
            {/* Image Upload Zone */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                1. Product Image (Optional - Gemini AI Vision Analysis)
              </label>

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 p-8 text-center hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform mb-3 shadow-inner">
                    <Upload className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Click to upload or drag and drop Amazon product image
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Supports JPG, PNG, WEBP. AI will extract model, color, material & wholesale keywords.
                  </p>
                </div>
              ) : (
                <div className="relative rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <img src={imagePreview} alt="Uploaded preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Image Loaded
                      </span>
                      {isAnalyzingImage && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 animate-pulse">
                          <Sparkles className="h-3 w-3" /> AI Analyzing...
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {aiExtractedInfo?.productName || productName || 'Product Image Ready'}
                    </p>
                    {aiExtractedInfo && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Detected: {aiExtractedInfo.brand} {aiExtractedInfo.model} • {aiExtractedInfo.category}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Product Name Input */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                2. Product Title / Name <span className="text-indigo-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. iPhone 15 Transparent Mobile Cover"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Granular Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Brand / Compatibility
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Apple Compatible, Samsung, Generic"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Specific Model
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. iPhone 15, S24 Ultra, M34"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Amazon ASIN (Optional)
                </label>
                <input
                  type="text"
                  value={asin}
                  onChange={(e) => setAsin(e.target.value)}
                  placeholder="e.g. B0CHX1W3F9"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Mobile Accessories, Screen Protectors"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Additional Keywords */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Additional Search Keywords (Comma separated)
              </label>
              <input
                type="text"
                value={additionalKeywords}
                onChange={(e) => setAdditionalKeywords(e.target.value)}
                placeholder="e.g. tpu case, surat wholesale, ready stock, crystal clear"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Action Buttons & Live Progress */}
            {isSearching ? (
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {searchStep}
                    </span>
                  </div>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                    {searchProgress}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 ease-out"
                    style={{ width: `${searchProgress}%` }}
                  />
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Querying configured wholesale Telegram channels across Surat, Delhi, Mumbai, and Gujarat...
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 active:scale-[0.99] transition-all"
                >
                  <Search className="h-4 w-4" />
                  <span>Search Wholesale Suppliers</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProductName('');
                    setSku('');
                    setAsin('');
                    setBrand('');
                    setModel('');
                    setCategory('');
                    setAdditionalKeywords('');
                    removeImage();
                    setError(null);
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: AI & Telegram Sourcing Guide Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              How Supplier Discovery Works
            </h2>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold">
                  1
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Multimodal Gemini AI</p>
                  <p className="mt-0.5">Scans image textures, colors, and title to extract high-yield wholesale keywords.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold">
                  2
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Channel Mapping Lookup</p>
                  <p className="mt-0.5">Checks your configured supplier channels first for direct product mappings.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold">
                  3
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Deterministic Price & Stock Parser</p>
                  <p className="mt-0.5">Normalizes prices (e.g. ₹350/10pcs → ₹35/unit) and detects genuine stock statuses.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                  4
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Lowest-to-Highest Ranking</p>
                  <p className="mt-0.5">Identifies Best Available, Lowest Price, and provides direct Telegram post links.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">Telegram MTProto Architecture</span>
              <p>All searches run securely server-side. No Telegram API keys are ever exposed in client browsers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
