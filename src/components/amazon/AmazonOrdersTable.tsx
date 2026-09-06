'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
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
import { calculateAmazonFees, AMAZON_CATEGORIES } from '@/lib/calculators/amazonFeeEngine';

type DateFilterType = 'all' | 'today' | '15days' | '30days';
type SortField = 'date' | 'price' | 'profit' | 'margin' | 'status' | 'fees';
type SortOrder = 'asc' | 'desc';

export const AmazonOrdersTable: React.FC = () => {
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

  // New Order Form state
  const [newSku, setNewSku] = useState('ANC-NB-BLK-01');
  const [newProductName, setNewProductName] = useState('Wireless Bluetooth Neckband Earphones');
  const [newCategory, setNewCategory] = useState('electronics_accessories');
  const [newPrice, setNewPrice] = useState(799);
  const [newCost, setNewCost] = useState(280);
  const [newQty, setNewQty] = useState(1);
  const [newBuyerName, setNewBuyerName] = useState('Ankit Sharma');
  const [newBuyerCity, setNewBuyerCity] = useState('Mumbai');
  const [newBuyerState, setNewBuyerState] = useState('Maharashtra');
  const [newStatus, setNewStatus] = useState<OrderStatus>('delivered');

  // Query and filter store
  const allOrders = useMemo(() => {
    let orders = globalStore.getOrders({
      platform: 'amazon',
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

  const handleSyncSPAPI = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setNotification('Amazon SP-API: 4 new orders imported from Amazon.in Seller Central.');
      setTimeout(() => setNotification(null), 4000);
    }, 1500);
  };

  const handleImportComplete = (count: number) => {
    setNotification(`Successfully imported and calculated fees for ${count} Amazon orders!`);
    setCurrentPage(1);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExportCSV = () => {
    const headers = ['Order ID,Date,Product,SKU,Category,Qty,Selling Price,Cost,Net Profit,Margin %,Status,Buyer City,Buyer State'];
    const rows = allOrders.map(o => 
      `"${o.orderId}","${o.orderDate}","${o.productName.replace(/"/g, '""')}","${o.sku}","${o.category}",${o.quantity},${o.sellingPrice},${o.costPrice},${o.netProfit},${o.profitMarginPercent}%,"${o.status}","${o.buyerCity}","${o.buyerState}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `amazon_orders_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const sellingPriceTotal = newPrice * newQty;
    const costPriceTotal = newCost * newQty;

    const amazonCalc = calculateAmazonFees({
      category: newCategory,
      costPrice: costPriceTotal,
      sellingPrice: sellingPriceTotal,
      weightGrams: 300 * newQty,
      shippingZone: newBuyerState === 'Maharashtra' ? 'regional' : 'national',
      fulfillmentType: 'easyship',
    });

    const newOrder: OrderItem = {
      id: `ord-amz-${Date.now()}`,
      platform: 'amazon',
      orderId: `403-${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(1000000 + Math.random() * 9000000)}`,
      orderDate: new Date().toISOString(),
      sku: newSku,
      productName: newProductName,
      category: newCategory,
      quantity: newQty,
      sellingPrice: sellingPriceTotal,
      costPrice: costPriceTotal,
      grossRevenue: newStatus === 'delivered' ? sellingPriceTotal : 0,
      fees: {
        referralFee: amazonCalc.referralFee,
        closingFee: amazonCalc.closingFee,
        shippingFee: amazonCalc.shippingFee,
        pickAndPackFee: amazonCalc.pickAndPackFee,
        gstOnFees: amazonCalc.gstOnFees,
        totalDeductions: amazonCalc.totalAmazonFees,
        netPayout: amazonCalc.netPayout,
      },
      netProfit: newStatus === 'delivered' ? amazonCalc.netProfit : (newStatus === 'returned' ? -(amazonCalc.shippingFee * 1.5) : 0),
      profitMarginPercent: amazonCalc.profitMarginPercent,
      status: newStatus,
      buyerName: newBuyerName,
      buyerCity: newBuyerCity,
      buyerState: newBuyerState,
      trackingNumber: `TRK-AMZ-${Math.floor(10000000 + Math.random() * 90000000)}`,
      paymentMode: 'prepaid',
    };

    globalStore.addOrder(newOrder);
    setIsAddModalOpen(false);
    setNotification(`Order ${newOrder.orderId} recorded with ₹${newOrder.netProfit} net margin.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Action and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-[#FF9900] font-black">a</span>
            <span>Amazon India Orders</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Track multi-state dispatch, net margin per order, returns & SAFE-T claims
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSyncSPAPI}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#FF9900] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync SP-API</span>
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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF9900] text-slate-950 text-xs font-bold hover:bg-[#FF9900]/90 transition-all shadow-md shadow-[#FF9900]/20 active:scale-95"
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

      {/* Filter Tabs & Search Controls */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 sm:p-5 shadow-sm space-y-4">
        {/* ROW 1: Date Filters & Status Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          {/* Date Range Sorting Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mr-1">
              <Calendar className="h-3.5 w-3.5 text-indigo-600 dark:text-blue-400" />
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
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
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
              className="h-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:border-[#FF9900] focus:outline-none"
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
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(['all', 'delivered', 'returned', 'rto', 'cancelled'] as const).map((st) => (
              <button
                key={st}
                onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                {st === 'all' ? 'All Status' : st === 'delivered' ? 'Delivered' : st === 'returned' ? 'Returns' : st.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search SKU, Order ID, City..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#FF9900] focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 text-xs text-slate-800 dark:text-slate-300 focus:border-[#FF9900] focus:outline-none"
            >
              <option value="all">All Categories</option>
              {Object.entries(AMAZON_CATEGORIES).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
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
                      sortOrder === 'desc' ? <ArrowDown className="h-3 w-3 text-[#FF9900]" /> : <ArrowUp className="h-3 w-3 text-[#FF9900]" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                    )}
                  </div>
                </th>

                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-4">Buyer Location</th>

                <th 
                  onClick={() => toggleSort('price')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Selling Price</span>
                    {sortField === 'price' ? (
                      sortOrder === 'desc' ? <ArrowDown className="h-3 w-3 text-[#FF9900]" /> : <ArrowUp className="h-3 w-3 text-[#FF9900]" />
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
                    <span>Amazon Fees</span>
                    {sortField === 'fees' ? (
                      sortOrder === 'desc' ? <ArrowDown className="h-3 w-3 text-[#FF9900]" /> : <ArrowUp className="h-3 w-3 text-[#FF9900]" />
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
                      sortOrder === 'desc' ? <ArrowDown className="h-3 w-3 text-[#FF9900]" /> : <ArrowUp className="h-3 w-3 text-[#FF9900]" />
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
                      sortOrder === 'desc' ? <ArrowDown className="h-3 w-3 text-[#FF9900]" /> : <ArrowUp className="h-3 w-3 text-[#FF9900]" />
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
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No Amazon orders found</p>
                      <p className="text-xs text-slate-500">
                        Connect your Amazon SP-API credentials in Settings, import a settlement CSV report, or add manual orders.
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
                        <span>SKU: {order.sku}</span>
                        <span>•</span>
                        <span>Qty: {order.quantity}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">{order.buyerCity}</div>
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
                        Ref: {formatINR(order.fees.referralFee)} | Ship: {formatINR(order.fees.shippingFee)}
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

        {/* Pagination Bar */}
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
        platform="amazon"
        onImportComplete={handleImportComplete}
      />

      {/* Order Details & Fee Breakdown Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Breakdown: ${selectedOrder.orderId}`}
          subtitle={`Amazon India • ${formatDateTime(selectedOrder.orderDate)}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white text-sm">{selectedOrder.productName}</div>
              <div className="text-slate-600 dark:text-slate-400 flex items-center gap-3">
                <span>SKU: {selectedOrder.sku}</span>
                <span>Qty: {selectedOrder.quantity}</span>
                <span>Buyer: {selectedOrder.buyerName} ({selectedOrder.buyerCity}, {selectedOrder.buyerState})</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5 uppercase tracking-wider text-[11px]">
                Platform Fee Deductions
              </h4>

              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Amazon Referral Fee:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatINR(selectedOrder.fees.referralFee)}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Fixed Closing Fee:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatINR(selectedOrder.fees.closingFee)}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Shipping / Easy Ship Fee:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatINR(selectedOrder.fees.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>GST on Amazon Fees (18%):</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatINR(selectedOrder.fees.gstOnFees)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-amber-600 dark:text-amber-400">
                <span>Total Deductions:</span>
                <span>{formatINR(selectedOrder.fees.totalDeductions)}</span>
              </div>
              <div className="flex justify-between font-bold text-[#FF9900]">
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
                <span className="font-bold">Return Reason:</span> {selectedOrder.returnReason}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Manual Order Creation Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Amazon Order (Manual Entry)"
          subtitle="Auto-calculates Amazon India fee slabs and net profit"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">SKU Code</label>
                <input
                  type="text"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  required
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#FF9900] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#FF9900] focus:outline-none"
                >
                  {Object.entries(AMAZON_CATEGORIES).map(([k, v]) => (
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
                className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#FF9900] focus:outline-none"
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
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#FF9900] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Cost Price (₹)</label>
                <input
                  type="number"
                  value={newCost}
                  onChange={(e) => setNewCost(Number(e.target.value))}
                  required
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#FF9900] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={newQty}
                  onChange={(e) => setNewQty(Number(e.target.value))}
                  required
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#FF9900] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Buyer Name</label>
                <input
                  type="text"
                  value={newBuyerName}
                  onChange={(e) => setNewBuyerName(e.target.value)}
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#FF9900] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Buyer City</label>
                <input
                  type="text"
                  value={newBuyerCity}
                  onChange={(e) => setNewBuyerCity(e.target.value)}
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#FF9900] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#FF9900] focus:outline-none"
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
                className="px-4 py-2 rounded-xl bg-[#FF9900] text-slate-950 font-bold hover:bg-[#FF9900]/90 shadow-md transition-all"
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
