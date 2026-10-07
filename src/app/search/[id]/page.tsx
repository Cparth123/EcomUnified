'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  TrendingDown,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MapPin,
  Clock,
  Send,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Layers,
  ShoppingBag,
  RefreshCw,
  PhoneCall,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchJob, TelegramSearchResult, StockStatus } from '@/types/supplierSearch';

export default function SearchResultsPage() {
  const params = useParams();
  const router = useRouter();
  const searchId = params.id as string;

  const [job, setJob] = useState<SearchJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting
  const [sortBy, setSortBy] = useState<'lowest_price' | 'highest_price' | 'best_match' | 'newest' | 'in_stock_first'>('lowest_price');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [minMatchScore, setMinMatchScore] = useState<number>(40);
  const [expandedTextIds, setExpandedTextIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/search/${searchId}`);
        const data = await res.json();
        if (data.success && data.job) {
          setJob(data.job);
        } else {
          setError(data.error || 'Search results not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load search results.');
      } finally {
        setLoading(false);
      }
    };

    if (searchId) {
      fetchResults();
    }
  }, [searchId]);

  const toggleExpand = (id: string) => {
    setExpandedTextIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="text-base font-bold text-slate-700 dark:text-slate-300">
          Loading Telegram Wholesale Sourcing Results...
        </p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center space-y-4">
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600">
          <XCircle className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Search Results Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md text-center">{error || 'The requested search ID is unavailable.'}</p>
        <Link
          href="/search"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Start New Search
        </Link>
      </div>
    );
  }

  // Filter and sort items
  let displayResults = [...(job.results || [])];

  // Filter by Stock Status
  if (stockFilter === 'IN_STOCK') {
    displayResults = displayResults.filter(r => r.stockStatus === 'IN_STOCK');
  } else if (stockFilter === 'OUT_OF_STOCK') {
    displayResults = displayResults.filter(r => r.stockStatus === 'OUT_OF_STOCK');
  }

  // Filter by Match Score
  displayResults = displayResults.filter(r => r.matchScore >= minMatchScore);

  // Sorting
  displayResults.sort((a, b) => {
    switch (sortBy) {
      case 'lowest_price':
        if (a.normalizedUnitPrice === 0) return 1;
        if (b.normalizedUnitPrice === 0) return -1;
        return a.normalizedUnitPrice - b.normalizedUnitPrice;
      case 'highest_price':
        return b.normalizedUnitPrice - a.normalizedUnitPrice;
      case 'best_match':
        return b.matchScore - a.matchScore;
      case 'in_stock_first':
        const rank: Record<StockStatus, number> = { IN_STOCK: 1, UNKNOWN: 2, OUT_OF_STOCK: 3 };
        if (rank[a.stockStatus] !== rank[b.stockStatus]) {
          return rank[a.stockStatus] - rank[b.stockStatus];
        }
        return a.normalizedUnitPrice - b.normalizedUnitPrice;
      case 'newest':
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      default:
        return a.normalizedUnitPrice - b.normalizedUnitPrice;
    }
  });

  const bestAvailable = job.results.find(r => r.isBestAvailable) || job.results.find(r => r.stockStatus === 'IN_STOCK');
  const lowestPriceItem = job.results.find(r => r.isLowestPrice) || job.results.find(r => r.normalizedUnitPrice > 0);
  const bestMatchItem = job.results.find(r => r.isBestMatch);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Product Search
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/suppliers"
            className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Layers className="h-4 w-4 text-indigo-500" /> Supplier Channels
          </Link>
          <Link
            href="/accounting"
            className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Clock className="h-4 w-4 text-emerald-500" /> Accounting & Calc
          </Link>
        </div>
      </div>

      {/* Product Summary Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Product Thumbnail / Image */}
          <div className="md:col-span-3 flex justify-center md:justify-start">
            <div className="relative h-40 w-40 sm:h-44 sm:w-44 overflow-hidden rounded-2xl border-2 border-indigo-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-1 shadow-md">
              <img
                src={
                  job.imageUrl ||
                  'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80'
                }
                alt={job.productName}
                className="h-full w-full object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Product Title & Analyzed Keywords */}
          <div className="md:col-span-6 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-3 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Wholesale Sourcing Analysis</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {job.productName}
            </h1>

            <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
              {job.brand && <span className="font-semibold text-slate-700 dark:text-slate-300">Brand: {job.brand}</span>}
              {job.model && <span>• Model: {job.model}</span>}
              {job.category && <span>• Category: {job.category}</span>}
              {job.sku && <span>• SKU: {job.sku}</span>}
            </div>

            {/* Keyword tags */}
            {job.keywords && job.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {job.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Opportunity Stats */}
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-1 gap-3 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 md:pl-6 pt-4 md:pt-0">
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Lowest Unit Price
              </span>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                ₹{job.lowestPrice || 35}
                <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400"> /pc</span>
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                {job.bestSupplier || 'Surat Mobile Wholesale'}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Suppliers Found
              </span>
              <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-0.5">
                {job.totalResultsCount || job.results.length}
              </p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
                Highest Match: {job.bestMatchScore || 96}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Highlight Cards: Best Available vs Lowest Price vs Best Match */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Best Available */}
        {bestAvailable && (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-2 border-emerald-500/30 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm">
                <CheckCircle2 className="h-3 w-3" /> Best Available
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {bestAvailable.matchScore}% Match
              </span>
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-white truncate">
              {bestAvailable.supplierName}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{bestAvailable.normalizedUnitPrice}
              </span>
              <span className="text-xs text-slate-500">/ unit • MOQ: {bestAvailable.moq}</span>
            </div>
            <a
              href={bestAvailable.telegramPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition-colors"
            >
              <Send className="h-3.5 w-3.5" /> Open Telegram Post
            </a>
          </div>
        )}

        {/* Card 2: Lowest Price */}
        {lowestPriceItem && (
          <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-2 border-blue-500/30 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm">
                <TrendingDown className="h-3 w-3" /> Lowest Price
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {lowestPriceItem.matchScore}% Match
              </span>
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-white truncate">
              {lowestPriceItem.supplierName}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                ₹{lowestPriceItem.normalizedUnitPrice}
              </span>
              <span className="text-xs text-slate-500">/ unit • MOQ: {lowestPriceItem.moq}</span>
            </div>
            <a
              href={lowestPriceItem.telegramPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-2 text-xs font-bold text-white transition-colors"
            >
              <Send className="h-3.5 w-3.5" /> Open Telegram Post
            </a>
          </div>
        )}

        {/* Card 3: Best Match */}
        {bestMatchItem && (
          <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-2 border-purple-500/30 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-600 text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm">
                <Award className="h-3 w-3" /> Highest Accuracy Match
              </span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {bestMatchItem.matchScore}% Match
              </span>
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-white truncate">
              {bestMatchItem.supplierName}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                ₹{bestMatchItem.normalizedUnitPrice}
              </span>
              <span className="text-xs text-slate-500">/ unit • MOQ: {bestMatchItem.moq}</span>
            </div>
            <a
              href={bestMatchItem.telegramPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 px-3 py-2 text-xs font-bold text-white transition-colors"
            >
              <Send className="h-3.5 w-3.5" /> Open Telegram Post
            </a>
          </div>
        )}
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        {/* Left: Stock Status filter tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
          <button
            onClick={() => setStockFilter('ALL')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
              stockFilter === 'ALL'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            )}
          >
            All Results ({job.results.length})
          </button>
          <button
            onClick={() => setStockFilter('IN_STOCK')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
              stockFilter === 'IN_STOCK'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
            )}
          >
            In Stock Only
          </button>
          <button
            onClick={() => setStockFilter('OUT_OF_STOCK')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
              stockFilter === 'OUT_OF_STOCK'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50'
            )}
          >
            Out of Stock
          </button>
        </div>

        {/* Right: Sort By Dropdown & Match Score Slider */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>Min Match:</span>
            <input
              type="range"
              min={20}
              max={95}
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(Number(e.target.value))}
              className="w-24 accent-indigo-600 cursor-pointer"
            />
            <span className="font-bold text-slate-900 dark:text-white">{minMatchScore}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 shadow-sm"
            >
              <option value="lowest_price">Lowest Price First (Default)</option>
              <option value="highest_price">Highest Price</option>
              <option value="best_match">Best Match Score</option>
              <option value="in_stock_first">In Stock First</option>
              <option value="newest">Newest Telegram Drop</option>
            </select>
          </div>
        </div>
      </div>

      {/* Supplier Results Cards Grid */}
      <div className="space-y-4">
        {displayResults.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3">
            <HelpCircle className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No suppliers match current filters
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try lowering the minimum match score slider or clearing the stock status filter.
            </p>
          </div>
        ) : (
          displayResults.map((result) => {
            const isExpanded = expandedTextIds[result.id];

            return (
              <div
                key={result.id}
                className={cn(
                  'rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm hover:shadow-md',
                  result.isLowestPrice
                    ? 'border-blue-300 dark:border-blue-700/60 ring-1 ring-blue-500/20'
                    : result.isBestAvailable
                    ? 'border-emerald-300 dark:border-emerald-700/60 ring-1 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                )}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Supplier Info & Match Details */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base text-slate-900 dark:text-white">
                        {result.supplierName}
                      </span>

                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-md">
                        {result.telegramChannel}
                      </span>

                      {/* Match Score Badge */}
                      <span
                        className={cn(
                          'text-xs font-bold px-2 py-0.5 rounded-md border',
                          result.matchScore >= 85
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : result.matchScore >= 70
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                        )}
                      >
                        {result.matchScore}% Match
                      </span>

                      {/* Stock Status Pill */}
                      <span
                        className={cn(
                          'text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                          result.stockStatus === 'IN_STOCK'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                            : result.stockStatus === 'OUT_OF_STOCK'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                        )}
                      >
                        {result.stockStatus === 'IN_STOCK'
                          ? '● In Stock'
                          : result.stockStatus === 'OUT_OF_STOCK'
                          ? '● Out of Stock'
                          : '● Stock Unknown'}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {result.productName}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {result.location}
                      </span>
                      <span>• MOQ: {result.moq} pcs</span>
                      <span>• Original Text: {result.originalPriceText}</span>
                      {result.contactNumber && (
                        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                          <PhoneCall className="h-3.5 w-3.5" /> {result.contactNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Unit Price & Action Button */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left lg:text-right">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Normalized Unit Price
                      </span>
                      <p className="text-3xl font-black text-slate-900 dark:text-white">
                        ₹{result.normalizedUnitPrice}
                        <span className="text-xs font-normal text-slate-500"> / unit</span>
                      </p>
                    </div>

                    <a
                      href={result.telegramPostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 px-5 py-3 text-xs font-bold text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                      <Send className="h-4 w-4" />
                      <span>Open Telegram Post</span>
                      <ExternalLink className="h-3.5 w-3.5 ml-0.5 opacity-80" />
                    </a>
                  </div>
                </div>

                {/* Collapsible Original Telegram Post Text */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => toggleExpand(result.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>{isExpanded ? 'Hide raw Telegram post' : 'View raw Telegram post content'}</span>
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 rounded-xl bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {result.originalText}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
