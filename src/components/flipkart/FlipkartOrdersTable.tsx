'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Plus, 
  RefreshCw, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2,
  FileSpreadsheet,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal
} from 'lucide-react';
import { OrderItem, OrderStatus } from '@/types';
import globalStore from '@/lib/store';
import { StatusBadge, PlatformBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { CSVImportModal } from '@/components/ui/CSVImportModal';
import { formatINR, formatDate, formatDateTime } from '@/lib/utils';
import { calculateFlipkartFees, FLIPKART_CATEGORIES } from '@/lib/calculators/flipkartFeeEngine';

type DateFilterType = 'all' | 'today' | '15days' | '30days';
type SortField = 'date' | 'price' | 'profit' | 'margin' | 'status' | 'fees' | 'payment';
type SortOrder = 'asc' | 'desc';

export const FlipkartOrdersTable: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateFilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [newSku, setNewSku] = useState('PILWFOAM123456');
  const [newProductName, setNewProductName] = useState('Ergonomic Memory Foam Orthopedic Pillow');
  const [newCategory, setNewCategory] = useState('home_kitchen');
  const [newPrice, setNewPrice] = useState(1299);
  const [newCost, setNewCost] = useState(420);
  const [newQty, setNewQty] = useState(1);
  const [newBuyerName, setNewBuyerName] = useState('Priya Sharma');
  const [newBuyerCity, setNewBuyerCity] = useState('Bengaluru');
  const [newBuyerState, setNewBuyerState] = useState('Karnataka');
  const [newPaymentMode, setNewPaymentMode] = useState<'prepaid' | 'cod'>('prepaid');
  const [newStatus, setNewStatus] = useState<OrderStatus>('delivered');

  const allOrders = useMemo(() => {
    let orders = globalStore.getOrders({
      platform: 'flipkart',
      status: statusFilter,
      searchTerm,
      category: categoryFilter,
    });

    // Date Range Filtering
    if (dateRangeFilter !== 'all') {
      const now = new Date('2026-09-01T23:59:59Z').getTime();
      let daysLimit = 30;
      if (dateRangeFilter === 'today') daysLimit = 1;
      else if (dateRangeFilter === '15days') daysLimit = 15;
      else if (dateRangeFilter === '30days') daysLimit = 30;

      const cutoff = now - (daysLimit * 24 * 60 * 60 * 1000);
      orders = orders.filter(o => new Date(o.orderDate).getTime() >= cutoff);
    }

    // Sorting Logic
    orders.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
      } else if (sortField === 'price') {
        comparison = a.sellingPrice - b.sellingPrice;
      } else if (sortField === 'profit') {
        comparison = a.netProfit - b.netProfit;
      } else if (sortField === 'margin') {
        comparison = a.profitMarginPercent - b.profitMarginPercent;
      } else if (sortField === 'fees') {
        comparison = a.fees.totalDeductions - b.fees.totalDeductions;
      } else if (sortField === 'payment') {
        comparison = a.paymentMode.localeCompare(b.paymentMode);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return orders;
  }, [statusFilter, dateRangeFilter, searchTerm, categoryFilter, sortField, sortOrder, notification]);

  const totalPages = Math.ceil(allOrders.length / pageSize) || 1;
  const paginatedOrders = allOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleSyncFlipkartAPI = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setNotification('Flipkart Seller API: 3 new orders fetched from Flipkart Seller Hub.');
      setTimeout(() => setNotification(null), 4000);
    }, 1500);
  };

  const handleImportComplete = (count: number) => {
    setNotification(`Successfully imported and computed Flipkart fees for ${count} orders!`);
    setCurrentPage(1);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExportCSV = () => {
    const headers = ['Order ID,Date,Product,SKU,Category,Qty,Selling Price,Cost,Payment Mode,Net Profit,Margin %,Status,Buyer City,Buyer State'];
    const rows = allOrders.map(o => 
      `"${o.orderId}","${o.orderDate}","${o.productName.replace(/"/g, '""')}","${o.sku}","${o.category}",${o.quantity},${o.sellingPrice},${o.costPrice},"${o.paymentMode}",${o.netProfit},${o.profitMarginPercent}%,"${o.status}","${o.buyerCity}","${o.buyerState}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `flipkart_orders_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const sellingPriceTotal = newPrice * newQty;
    const costPriceTotal = newCost * newQty;

    const fkCalc = calculateFlipkartFees({
      category: newCategory,
      costPrice: costPriceTotal,
      sellingPrice: sellingPriceTotal,
      weightGrams: 400 * newQty,
      shippingTier: 'silver',
      shippingZone: newBuyerState === 'Karnataka' ? 'local' : 'national',
      paymentMode: newPaymentMode,
    });

    const newOrder: OrderItem = {
      id: `ord-fk-${Date.now()}`,
      platform: 'flipkart',
      orderId: `OD${Math.floor(100000000000000 + Math.random() * 900000000000000)}`,
      orderDate: new Date().toISOString(),
      sku: newSku,
      productName: newProductName,
      category: newCategory,
      quantity: newQty,
      sellingPrice: sellingPriceTotal,
      costPrice: costPriceTotal,
      grossRevenue: newStatus === 'delivered' ? sellingPriceTotal : 0,
      fees: {
        referralFee: fkCalc.commissionFee,
        closingFee: fkCalc.fixedFee,
        shippingFee: fkCalc.shippingFee,
        collectionFee: fkCalc.collectionFee,
        gstOnFees: fkCalc.gstOnFees,
        totalDeductions: fkCalc.totalFlipkartFees,
        netPayout: fkCalc.netPayout,
      },
      netProfit: newStatus === 'delivered' ? fkCalc.netProfit : (newStatus === 'returned' ? -(fkCalc.shippingFee * 1.4) : 0),
      profitMarginPercent: fkCalc.profitMarginPercent,
      status: newStatus,
      buyerName: newBuyerName,
      buyerCity: newBuyerCity,
      buyerState: newBuyerState,
      trackingNumber: `TRK-FK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      paymentMode: newPaymentMode,
    };

    globalStore.addOrder(newOrder);
    setIsAddModalOpen(false);
    setNotification(`Order ${newOrder.orderId} recorded with ₹${newOrder.netProfit} net profit.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="italic text-[#2874F0] font-black">fk</span>
            <span>Flipkart Marketplace Orders</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Monitor F-Assured dispatches, COD collections, courier weight slabs, and SPF claims
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSyncFlipkartAPI}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#2874F0] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Flipkart API</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-slate-700 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Import CSV / Excel</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-indigo-600 dark:text-blue-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2874F0] text-white text-xs font-bold hover:bg-[#2874F0]/90 transition-all shadow-md shadow-[#2874F0]/20 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Manual Order</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-blue-500/15 border border-indigo-200 dark:border-blue-500/30 text-indigo-700 dark:text-blue-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter and Table Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 sm:p-5 shadow-sm space-y-4">
        {/* ROW 1: Date Range Filter & Sort By Dropdown */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mr-1">
              <Calendar className="h-3.5 w-3.5 text-[#2874F0]" />
              <span>Timeframe:</span>
            </span>

            {(
              [
                { id: 'today', label: 'Today' },
                { id: '15days', label: 'Last 15 Days' },
                { id: '30days', label: 'Last 30 Days' },
                { id: 'all', label: 'All Time' },
              ] as const
            ).map((df) => (
              <button
                key={df.id}
                onClick={() => { setDateRangeFilter(df.id); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  dateRangeFilter === df.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-black'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {df.label}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Sort By:</span>
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-') as [SortField, SortOrder];
                setSortField(f);
                setSortOrder(o);
                setCurrentPage(1);
              }}
              className="h-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:border-[#2874F0] focus:outline-none"
            >
              <option value="date-desc">Newest Date First (↓)</option>
              <option value="date-asc">Oldest Date First (↑)</option>
              <option value="profit-desc">Highest Net Profit (₹)</option>
              <option value="profit-asc">Lowest Profit / Loss (₹)</option>
              <option value="margin-desc">Highest Margin (%)</option>
              <option value="margin-asc">Lowest Margin (%)</option>
              <option value="price-desc">Highest Selling Price (₹)</option>
              <option value="price-asc">Lowest Selling Price (₹)</option>
            </select>
          </div>
        </div>

        {/* ROW 2: Status Tabs, Category & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(['all', 'delivered', 'returned', 'rto', 'cancelled'] as const).map((st) => (
              <button
                key={st}
                onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-[#2874F0] text-white shadow-md shadow-[#2874F0]/20'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                {st === 'all' ? 'All Orders' : st === 'delivered' ? 'Delivered' : st === 'returned' ? 'Returns' : st.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search FSN, Order ID, City..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#2874F0] focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 text-xs text-slate-800 dark:text-slate-300 focus:border-[#2874F0] focus:outline-none"
            >
              <option value="all">All Categories</option>
              {Object.entries(FLIPKART_CATEGORIES).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 select-none">
              <tr>
                <th 
                  onClick={() => toggleSort('date')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Order ID & Date</span>
                    {sortField === 'date' ? (
                      sortOrder === 'desc' ? <ArrowDown className="h-3 w-3 text-[#2874F0]" /> : <ArrowUp className="h-3 w-3 text-[#2874F0]" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                    )}
                  </div>
                </th>

                <th className="py-3.5 px-4">Product Details</th>
                <th 
                  onClick={() => toggleSort('payment')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Payment & Buyer</span>
                    {sortField === 'payment' ? (
                      sortOrder === 'desc' ? <ArrowDown className="h-3 w-3 text-[#2874F0]" /> : <ArrowUp className="h-3 w-3 text-[#2874F0]" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                    )}
                  </div>
                </th>

                <th 
                  onClick={() => toggleSort('price')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Selling Price</span>
                    {sortField === 'price' ? (
                      sortOrder === 'desc' ? <ArrowDown className="h-3 w-3 text-[#2874F0]" /> : <ArrowUp className="h-3 w-3 text-[#2874F0]" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                    )}
                  </div>
                </th>

                <th 
                  onClick={() => toggleSort('fees')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Flipkart Fees</span>
                    {sortField === 'fees' ? (
                      sortOrder === 'desc' ? <ArrowDown className="h-3 w-3 text-[#2874F0]" /> : <ArrowUp className="h-3 w-3 text-[#2874F0]" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                    )}
                  </div>
                </th>

                <th 
                  onClick={() => toggleSort('profit')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Net Profit</span>
                    {sortField === 'profit' ? (
                      sortOrder === 'desc' ? <ArrowDown className="h-3 w-3 text-[#2874F0]" /> : <ArrowUp className="h-3 w-3 text-[#2874F0]" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                    )}
                  </div>
                </th>

                <th 
                  onClick={() => toggleSort('status')}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Status</span>
                    {sortField === 'status' ? (
                      sortOrder === 'desc' ? <ArrowDown className="h-3 w-3 text-[#2874F0]" /> : <ArrowUp className="h-3 w-3 text-[#2874F0]" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                    )}
                  </div>
                </th>

                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900/40">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No Flipkart orders found</p>
                      <p className="text-xs text-slate-500">
                        Connect your Flipkart Developer App ID in Settings, import an order settlement CSV, or add manual orders.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white font-mono">{order.orderId}</div>
                      <div className="text-[11px] text-slate-500">{formatDate(order.orderDate)}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{order.productName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span>FSN/SKU: {order.sku}</span>
                        <span>•</span>
                        <span>Qty: {order.quantity}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.paymentMode === 'prepaid' ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-transparent' : 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-transparent'
                        }`}>
                          {order.paymentMode}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{order.buyerCity}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{order.buyerState}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatINR(order.sellingPrice)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-semibold text-amber-600 dark:text-amber-400">
                        {formatINR(order.fees.totalDeductions)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Comm: {formatINR(order.fees.referralFee)} | Ship: {formatINR(order.fees.shippingFee)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className={`font-bold ${order.netProfit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {formatINR(order.netProfit)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {order.profitMarginPercent}% Margin
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="View Full Fee Breakdown"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
          <span>
            Showing {paginatedOrders.length} of {allOrders.length} orders
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-slate-900 dark:text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CSV / Excel Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        platform="flipkart"
        onImportComplete={handleImportComplete}
      />

      {/* Selected Order Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Flipkart Order: ${selectedOrder.orderId}`}
          subtitle={`Flipkart Assured • ${formatDateTime(selectedOrder.orderDate)}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white text-sm">{selectedOrder.productName}</div>
              <div className="text-slate-600 dark:text-slate-400 flex items-center gap-3">
                <span>FSN: {selectedOrder.sku}</span>
                <span>Payment: {selectedOrder.paymentMode.toUpperCase()}</span>
                <span>Buyer: {selectedOrder.buyerName} ({selectedOrder.buyerCity}, {selectedOrder.buyerState})</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5 uppercase tracking-wider text-[11px]">
                Flipkart Platform Fee Deductions
              </h4>

              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Commission Fee:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatINR(selectedOrder.fees.referralFee)}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Fixed Fee:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatINR(selectedOrder.fees.closingFee)}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Collection Fee ({selectedOrder.paymentMode.toUpperCase()}):</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatINR(selectedOrder.fees.collectionFee || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Shipping Fee:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatINR(selectedOrder.fees.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>GST on Fees (18%):</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatINR(selectedOrder.fees.gstOnFees)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-amber-600 dark:text-amber-400">
                <span>Total Flipkart Deductions:</span>
                <span>{formatINR(selectedOrder.fees.totalDeductions)}</span>
              </div>
              <div className="flex justify-between font-bold text-[#2874F0]">
                <span>Net Bank Payout:</span>
                <span>{formatINR(selectedOrder.fees.netPayout)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400 text-sm pt-1">
                <span>Net Realized Profit:</span>
                <span>{formatINR(selectedOrder.netProfit)} ({selectedOrder.profitMarginPercent}%)</span>
              </div>
            </div>

            {selectedOrder.returnReason && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300">
                <span className="font-bold">Return/RTO Reason:</span> {selectedOrder.returnReason}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Manual Order Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Flipkart Order (Manual Entry)"
          subtitle="Auto-calculates Flipkart fee slabs and net margin"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">FSN / SKU Code</label>
                <input
                  type="text"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  required
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
                >
                  {Object.entries(FLIPKART_CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Product Title</label>
              <input
                type="text"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                required
                className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Selling Price (₹)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  required
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Cost Price (₹)</label>
                <input
                  type="number"
                  value={newCost}
                  onChange={(e) => setNewCost(Number(e.target.value))}
                  required
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Payment Mode</label>
                <select
                  value={newPaymentMode}
                  onChange={(e) => setNewPaymentMode(e.target.value as 'prepaid' | 'cod')}
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
                >
                  <option value="prepaid">Prepaid (2%)</option>
                  <option value="cod">Cash on Delivery (COD)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Buyer Name</label>
                <input
                  type="text"
                  value={newBuyerName}
                  onChange={(e) => setNewBuyerName(e.target.value)}
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Buyer City</label>
                <input
                  type="text"
                  value={newBuyerCity}
                  onChange={(e) => setNewBuyerCity(e.target.value)}
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
                >
                  <option value="delivered">Delivered / Success</option>
                  <option value="returned">Returned</option>
                  <option value="rto">RTO (Refused)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#2874F0] text-white font-bold hover:bg-[#2874F0]/90 shadow-md transition-all"
              >
                Save Order & Compute Margin
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
