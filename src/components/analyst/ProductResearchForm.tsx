'use client';

import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  HelpCircle, 
  Loader2, 
  Layers, 
  Sliders, 
  Package, 
  Truck, 
  Box, 
  FileCheck, 
  Camera, 
  DollarSign,
  X,
  CheckCircle2,
  Zap,
  MessageSquare,
  Compass,
  FileText,
  BookmarkPlus,
  BookOpen,
  Copy,
  Check
} from 'lucide-react';
import { AMAZON_CATEGORIES } from '@/lib/calculators/amazonFeeEngine';
import { MasterProductInput } from '@/types/masterAnalysis';

interface ProductResearchFormProps {
  onAnalyze: (input: MasterProductInput) => void;
  isLoading: boolean;
}

export const ProductResearchForm: React.FC<ProductResearchFormProps> = ({
  onAnalyze,
  isLoading,
}) => {
  const [productName, setProductName] = useState('');
  const [brandModel, setBrandModel] = useState('');
  const [category, setCategory] = useState('electronics_accessories');
  const [buyingPrice, setBuyingPrice] = useState<number | ''>('');
  const [moq, setMoq] = useState<number | ''>('');
  const [weightGrams, setWeightGrams] = useState<number | ''>('');
  const [packType, setPackType] = useState('Single Unit');
  const [inboundFreight, setInboundFreight] = useState<number | ''>('');
  const [packagingCost, setPackagingCost] = useState<number | ''>('');
  const [supplierLocation, setSupplierLocation] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [promptMode, setPromptMode] = useState<'prompt1_master' | 'prompt2_volume_matrix' | 'custom_prompt'>('prompt1_master');
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [copiedModalText, setCopiedModalText] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasImage = Boolean(screenshotPreview);

  // Quick Preset Sourcing Samples
  const presets = [
    {
      label: '📱 Sample 1: Neckband ANC',
      name: 'Wireless Bluetooth Neckband Earphones with ANC',
      brand: 'Boat/OEM Neckband Pro',
      category: 'electronics_accessories',
      buying: 240,
      moq: 100,
      weight: 180,
      pack: 'Single Unit',
      freight: 15,
      packaging: 18,
      location: 'Delhi Wholesale Hub',
      img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60',
    },
    {
      label: '🛋️ Sample 2: Memory Foam Pillow',
      name: 'Ergonomic Memory Foam Orthopedic Cervical Pillow',
      brand: 'SleepWell / RestPro',
      category: 'home_kitchen',
      buying: 420,
      moq: 50,
      weight: 650,
      pack: 'Single Unit',
      freight: 35,
      packaging: 25,
      location: 'Surat Textile Hub',
      img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&auto=format&fit=crop&q=60',
    },
    {
      label: '🎒 Sample 3: Insulated Lunch Bag',
      name: 'Lunch Bag for Kids School, Women Lunch Bags for Office Caloric Insulated Thermal Cooler',
      brand: 'OEM Thermal Pro',
      category: 'home_kitchen',
      buying: 280,
      moq: 50,
      weight: 290,
      pack: 'Single Unit',
      freight: 20,
      packaging: 20,
      location: 'Surat Wholesale Hub',
      img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60',
    },
  ];

  // Prompt 2 Full 7-Step Template Text
  const prompt2Template = `Execute complete 7-Step Indian E-Commerce Sourcing Analysis:
Step 1: AI Vision Product Identification, Category & HSN Code Extraction (Product Title, Category taxonomy, Official Indian HSN Code, GST Tax Rate %, Recommended Marketplace Listing Category Node, Supplier Buying Price, Inbound Freight, Packaging, Total Landed Cost)
Step 2: Platform Fee Deductions Comparison (Amazon Referral + Closing + Easy Ship vs Flipkart Commission + Fixed + Shipping)
Step 3: Real In-Hand Bank Payout & Unit Margin
Step 4: Return Policy & RTO Risk Sensitivity (5%, 20%, 50% Return Scenarios)
Step 5: Market Demand & Competitor Matrix (Amazon vs Flipkart volume ratio & competitor benchmarks)
Step 6: Profit Projection at Different Sales Volumes (₹20,000, ₹30,000, ₹50,000, ₹90,000 in Markdown Table)
Step 7: Final Sourcing Verdict (Sell/Not Sell, Best Platform, Target Selling Price, Risk Level, One-line reasoning)`;

  // Custom Prompt Quick Directives
  const promptSuggestions = [
    {
      title: '📊 Full 7-Step Sourcing & Volume Matrix (Promt.md)',
      prompt: prompt2Template,
      mode: 'prompt2_volume_matrix' as const,
    },
    {
      title: '⚡ Tier-2/3 COD Return Stress Test',
      prompt: 'Stress-test COD return risk in Tier-2 and Tier-3 Indian cities. Calculate exact net margin if customer returns hit 22% and RTO hits 15%. Recommend whether to enable COD or prepaid only.',
      mode: 'custom_prompt' as const,
    },
    {
      title: '📦 2-Pack / Combo Bundle Margin Boost',
      prompt: 'Evaluate selling this product as a Pack of 2 combo vs Single Unit. Compare Amazon FBA and Flipkart Assured fee deductions, shipping bracket savings, and expected profit per order.',
      mode: 'custom_prompt' as const,
    },
    {
      title: '🎯 Diwali & Festive Q4 Peak Strategy',
      prompt: 'Evaluate demand surge and ad spend requirements during Diwali / Big Billion Days. Calculate maximum allowable ad spend (ACOS/TACOS) before slipping into a per-unit loss.',
      mode: 'custom_prompt' as const,
    },
    {
      title: '⚖️ Amazon FBA vs Easy Ship Profit Diff',
      prompt: 'Compare exact net profit per unit under Amazon FBA (Fulfillment by Amazon) vs Easy Ship Standard. Factor in pick & pack fees and weight slab variations.',
      mode: 'custom_prompt' as const,
    },
    {
      title: '🛡️ Hygiene & High-Defect Return Risk',
      prompt: 'Classify whether this product is considered non-returnable / hygiene write-off or 100% resalable. Calculate total financial loss per return if unsellable open-box items must be scrapped.',
      mode: 'custom_prompt' as const,
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setProductName(p.name);
    setBrandModel(p.brand);
    setCategory(p.category);
    setBuyingPrice(p.buying);
    setMoq(p.moq);
    setWeightGrams(p.weight);
    setPackType(p.pack);
    setInboundFreight(p.freight);
    setPackagingCost(p.packaging);
    setSupplierLocation(p.location);
    setScreenshotPreview(p.img);
  };

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setScreenshotPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectPromptMode = (mode: 'prompt1_master' | 'prompt2_volume_matrix' | 'custom_prompt') => {
    setPromptMode(mode);
    if (mode === 'prompt1_master') {
      setCustomPrompt('');
    } else if (mode === 'prompt2_volume_matrix') {
      setCustomPrompt(prompt2Template);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If no image is attached, require product name and buying price
    if (!hasImage) {
      if (!productName.trim() || buyingPrice === '' || Number(buyingPrice) <= 0) {
        return;
      }
    }

    const effectiveCustomPrompt = promptMode === 'prompt2_volume_matrix'
      ? (customPrompt.trim() || prompt2Template)
      : (customPrompt.trim() || undefined);

    onAnalyze({
      productName: productName.trim() || (hasImage ? '' : 'Wholesale Sourced Item'),
      brandModel: brandModel.trim() || undefined,
      skuCode: `SKU-${category.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      category,
      buyingPrice: buyingPrice !== '' ? Number(buyingPrice) : 0,
      moq: moq !== '' ? Number(moq) : 0,
      weightGrams: weightGrams !== '' ? Number(weightGrams) : 0,
      packType,
      inboundFreightPerUnit: inboundFreight !== '' ? Number(inboundFreight) : 0,
      packagingCostPerUnit: packagingCost !== '' ? Number(packagingCost) : 0,
      supplierLocation: supplierLocation.trim() || undefined,
      imageUrl: screenshotPreview || undefined,
      customPrompt: effectiveCustomPrompt,
      promptMode,
    });
  };

  const isSubmitDisabled = isLoading || (!hasImage && (!productName.trim() || buyingPrice === '' || Number(buyingPrice) <= 0));

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6 relative overflow-hidden">
      {/* Classical Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-800 dark:text-purple-300 text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>CONFIDENTIAL SOURCING ASSESSMENT • DUAL MARKETPLACE ENGINE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Wholesale Sourcing & Arbitrage Intelligence</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload supplier catalog screenshots for AI Vision auto-extraction or specify manual wholesale cost metrics.
          </p>
        </div>

        {/* Action toolbar with Promt.md template button and Telegram Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowPromptModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all shadow-xs"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>View Promt.md</span>
          </button>

          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Samples:</span>
          {presets.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-purple-700 dark:text-purple-300 border border-slate-200 dark:border-slate-800 transition-all active:scale-95 shadow-xs"
            >
              {p.label.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Screenshot Upload / Dropzone */}
        <div className={`p-5 rounded-2xl border transition-all ${
          hasImage 
            ? 'bg-purple-50/50 border-purple-300 dark:bg-purple-950/20 dark:border-purple-500/40 ring-1 ring-purple-500/20' 
            : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
        } flex flex-col sm:flex-row items-center gap-5`}>
          <div className="relative flex-shrink-0 w-28 h-28 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden group shadow-sm">
            {screenshotPreview ? (
              <>
                <img src={screenshotPreview} alt="Screenshot" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  title="Remove image"
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/85 text-rose-300 hover:bg-rose-500 hover:text-white transition-all shadow-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="text-center p-3 text-slate-400 dark:text-slate-500">
                <Camera className="h-7 w-7 mx-auto text-slate-400 dark:text-slate-600 mb-1" />
                <span className="text-[10px] font-semibold">Catalog Slip</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2 justify-center sm:justify-start">
              <Camera className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>Supplier Catalog / Telegram Sourcing Screenshot</span>
              {hasImage && (
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/30">
                  Image Attached ✓
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {hasImage ? (
                <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                  Screenshot attached! Form inputs below are optional — Google Gemini AI Vision will extract product name, wholesale rate, dimensions, weight, and live marketplace listings.
                </span>
              ) : (
                <span>
                  Attach supplier invoice, catalog picture, or WhatsApp/Telegram wholesale post. If no image is available, fill in the required fields below.
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 justify-center sm:justify-start pt-1">
              <label className="inline-block cursor-pointer">
                <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors inline-flex items-center gap-1.5 shadow-xs">
                  <Upload className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span>{hasImage ? 'Replace Image' : 'Upload Sourcing Pic'}</span>
                </span>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </label>

              {hasImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-500/30 transition-colors"
                >
                  Clear Image
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Information Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                Product Title / Specification {hasImage ? <span className="text-[11px] font-normal text-purple-600 dark:text-purple-300">(Optional with Image)</span> : <span className="text-rose-500 font-bold">*</span>}
              </label>
              {hasImage && !productName && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">Auto-detected from photo</span>
              )}
            </div>
            <input
              type="text"
              placeholder={hasImage ? "Optional: Auto-extracted from image" : "e.g. Wireless Bluetooth Neckband Earphones with ANC"}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required={!hasImage}
              className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200">Brand / Model / Sourcing Batch</label>
            <input
              type="text"
              placeholder={hasImage ? "e.g. OEM / Auto-detected" : "e.g. Boat Rockerz OEM / Pro Series"}
              value={brandModel}
              onChange={(e) => setBrandModel(e.target.value)}
              className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Sourcing Cost & Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="space-y-1.5">
            <label className="font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              <span>Buying Price (₹) {hasImage ? <span className="text-[10px] font-normal text-slate-500">(Optional)</span> : '*'}</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder={hasImage ? "Auto-detected" : "0"}
              value={buyingPrice === '' ? '' : buyingPrice}
              onChange={(e) => setBuyingPrice(e.target.value === '' ? '' : Number(e.target.value))}
              required={!hasImage}
              className="w-full h-10 rounded-xl bg-emerald-50/50 dark:bg-slate-950 border border-emerald-300 dark:border-emerald-500/40 px-3.5 text-slate-900 dark:text-white font-black text-sm focus:bg-white dark:focus:bg-slate-950 focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200">Category {hasImage ? '' : '*'}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-950 focus:border-purple-500 focus:outline-none transition-colors"
            >
              {Object.entries(AMAZON_CATEGORIES).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200">Weight (grams)</label>
            <input
              type="number"
              min="0"
              placeholder={hasImage ? "Auto-detected" : "0"}
              value={weightGrams === '' ? '' : weightGrams}
              onChange={(e) => setWeightGrams(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200">Packaging Format</label>
            <select
              value={packType}
              onChange={(e) => setPackType(e.target.value)}
              className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-950 focus:border-purple-500 focus:outline-none transition-colors"
            >
              <option value="Single Unit">Single Unit</option>
              <option value="Pack of 2">Pack of 2 (Combo)</option>
              <option value="Pack of 3">Pack of 3 (Bundle)</option>
              <option value="Pack of 5">Pack of 5 (Bulk)</option>
              <option value="Bundle / Combo">Custom Bundle</option>
            </select>
          </div>
        </div>

        {/* Inbound & Direct Costs */}
        <div className="grid grid-cols-3 gap-3.5">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Truck className="h-3.5 w-3.5 text-slate-400" />
              <span>Inbound Freight (₹/unit)</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={inboundFreight === '' ? '' : inboundFreight}
              onChange={(e) => setInboundFreight(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Box className="h-3.5 w-3.5 text-slate-400" />
              <span>Packaging Cost (₹/unit)</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={packagingCost === '' ? '' : packagingCost}
              onChange={(e) => setPackagingCost(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200">MOQ (Supplier Units)</label>
            <input
              type="number"
              min="0"
              placeholder={hasImage ? "Auto-detected" : "0"}
              value={moq === '' ? '' : moq}
              onChange={(e) => setMoq(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* PROMPT SELECTION & CUSTOM DIRECTIVES SECTION */}
        <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20 p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 dark:border-indigo-900/50 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm">
                  Select Analysis Prompt Mode
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Choose which analysis blueprint to run on this product
                </p>
              </div>
            </div>

            {/* Prompt Mode Buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
              <button
                type="button"
                onClick={() => handleSelectPromptMode('prompt1_master')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  promptMode === 'prompt1_master'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Prompt 1: Master Dossier
              </button>

              <button
                type="button"
                onClick={() => handleSelectPromptMode('prompt2_volume_matrix')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  promptMode === 'prompt2_volume_matrix'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Prompt 2: 7-Step Volume Matrix
              </button>

              <button
                type="button"
                onClick={() => handleSelectPromptMode('custom_prompt')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  promptMode === 'custom_prompt'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Custom Prompt
              </button>
            </div>
          </div>

          {/* Mode Summary Indicator */}
          <div className="text-xs">
            {promptMode === 'prompt1_master' && (
              <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-200 space-y-0.5">
                <span className="font-bold">🔵 Prompt 1 Active: Master 23-Dimension Dossier</span>
                <p className="text-[11px] text-purple-700 dark:text-purple-300">
                  Executes comprehensive institutional analysis covering landed costs, reverse logistics risk, Amazon & Flipkart fee engines, TACoS sensitivity, and 23-section break-even dossiers.
                </p>
              </div>
            )}

            {promptMode === 'prompt2_volume_matrix' && (
              <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 space-y-0.5">
                <span className="font-bold">🟢 Prompt 2 Active: Multi-Platform 7-Step Sourcing & Volume Matrix (Promt.md)</span>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                  Executes 7-step analysis with fee breakdowns, in-hand bank payouts, and Step 6 Sales Volume Profit Projections Table at ₹20K, ₹30K, ₹50K, and ₹90K.
                </p>
              </div>
            )}

            {promptMode === 'custom_prompt' && (
              <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 space-y-0.5">
                <span className="font-bold">✨ Custom Prompt Active: User-Defined Focus</span>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Type your custom questions below or select from quick strategy chips.
                </p>
              </div>
            )}
          </div>

          {/* Prompt Directives Quick Chips (Shown for Prompt 2 and Custom Prompt) */}
          {promptMode !== 'prompt1_master' && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Quick Strategy Chips:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {promptSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCustomPrompt(item.prompt);
                      setPromptMode(item.mode);
                    }}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                      customPrompt === item.prompt
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50'
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>

              {/* Prompt Textarea */}
              <div className="relative pt-1">
                <textarea
                  rows={4}
                  placeholder="Enter or edit prompt instructions..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full rounded-2xl bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-900/80 p-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none transition-all leading-relaxed font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-black text-sm shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>
                  {promptMode === 'prompt2_volume_matrix' 
                    ? 'Executing 7-Step Volume Matrix (Promt.md)...' 
                    : hasImage 
                    ? 'Gemini AI Vision Extracting & Computing Master Dossier...' 
                    : 'Running Complete Sourcing & Stress Calculations...'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>
                  {promptMode === 'prompt2_volume_matrix'
                    ? 'Execute 7-Step Multi-Platform & Volume Matrix Analysis (Promt.md)'
                    : hasImage 
                    ? 'Execute AI Vision Analysis & Live Amazon / Flipkart Comparison' 
                    : 'Execute Complete Amazon & Flipkart Master Profit Analysis (Prompt 1)'}
                </span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Promt.md Template Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <FileText className="h-4 w-4 text-indigo-600" />
                <span>Default Promt.md Blueprint Reference</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPromptModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 text-xs font-mono space-y-4 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">PROMPT 2: 7-Step Volume Matrix</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomPrompt(prompt2Template);
                      setPromptMode('prompt2_volume_matrix');
                      setShowPromptModal(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px]"
                  >
                    Load into Form
                  </button>
                </div>
                <pre className="text-[11px] whitespace-pre-wrap font-sans text-slate-600 dark:text-slate-400 leading-relaxed">
                  {prompt2Template}
                </pre>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-600 dark:text-purple-400">PROMPT 1: Master 23-Dimension Dossier</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPromptMode('prompt1_master');
                      setCustomPrompt('');
                      setShowPromptModal(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold text-[11px]"
                  >
                    Set Active
                  </button>
                </div>
                <p className="text-[11px] font-sans text-slate-600 dark:text-slate-400 leading-relaxed">
                  Institutional 23-dimension blueprint covering exact Amazon & Flipkart seller fee algorithms, reverse logistics resalability write-offs, 6-month demand signals, TACoS sensitivity, and break-even run-rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
