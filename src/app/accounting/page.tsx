'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Upload,
  Download,
  Trash2,
  Edit,
  Save,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package,
  RotateCcw,
  X,
  Layers,
  Info,
  Database,
  Box,
  RefreshCw,
  Calendar,
  CalendarDays,
  Filter,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ExpenseRecord,
  ProductCostRecord,
  ReturnProductRecord,
  DashboardMetrics,
  AccountingData,
} from '@/types/accounting';

export default function AccountingCalcPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'products' | 'returns'>('expenses');

  // Master Data State
  const [data, setData] = useState<AccountingData>({
    expenses: [],
    productsCost: [],
    returns: [],
  });
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Search, Category and Status Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Date Range Filter States (Start - End Date across all tabs)
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'this_month' | 'last_30_days' | 'custom'>('all');

  // Selected row IDs for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Upload file state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<'replace' | 'merge'>('replace');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Add Form calculation helpers
  const [prdFormCost, setPrdFormCost] = useState<number>(0);
  const [prdFormPacking, setPrdFormPacking] = useState<number>(0);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch initial accounting data from MongoDB
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/accounting');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setMetrics(json.metrics);
      } else {
        showToast(json.error || 'Failed to load accounting data', 'error');
      }
    } catch (err: any) {
      console.error('Error fetching accounting data:', err);
      showToast('Network error loading data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save changes / Sync to MongoDB & Excel
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/accounting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulkData: data }),
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setMetrics(json.metrics);
        showToast('Synchronized dynamically in MongoDB & Excel!', 'success');
      } else {
        showToast(json.error || 'Failed to save changes', 'error');
      }
    } catch (err: any) {
      console.error('Error saving data:', err);
      showToast('Network error saving workbook', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      showToast('Please select an Excel or CSV file to upload', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('mode', uploadMode);

      const res = await fetch('/api/accounting/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        setData(json.data);
        setMetrics(json.metrics);
        setIsUploadModalOpen(false);
        setUploadFile(null);
        showToast(json.message || 'Spreadsheet imported and stored in MongoDB!', 'success');
      } else {
        showToast(json.error || 'Failed to import file', 'error');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      showToast('Upload failed due to network error', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Download Excel
  const handleDownloadExcel = () => {
    window.location.href = '/api/accounting/download';
    showToast('Exporting Account_Calc.xlsx...', 'info');
  };

  // Create single record via POST API directly into MongoDB
  const handleAddSubmit = async (e: React.FormEvent, formValues: any) => {
    e.preventDefault();
    try {
      let payloadType = '';
      let recordPayload = {};

      if (activeTab === 'expenses') {
        payloadType = 'expense';
        recordPayload = {
          date: formValues.date || new Date().toISOString().split('T')[0],
          expenseType: formValues.expenseType || 'Miscellaneous',
          description: formValues.description || '',
          amount: parseFloat(formValues.amount) || 0,
          paymentMethod: formValues.paymentMethod || 'UPI / Online',
          notes: formValues.notes || '',
        };
      } else if (activeTab === 'products') {
        payloadType = 'productCost';
        const cost = parseFloat(formValues.cost) || 0;
        const packingCharge = parseFloat(formValues.packingCharge) || 0;
        recordPayload = {
          date: formValues.date || new Date().toISOString().split('T')[0],
          productName: formValues.productName || '',
          sku: formValues.sku || `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
          cost,
          packingCharge,
          totalCost: cost + packingCharge,
          returnStatus: formValues.returnStatus || 'Delivered',
          returnConditions: formValues.returnConditions || 'Brand New',
        };
      } else if (activeTab === 'returns') {
        payloadType = 'returnProduct';
        recordPayload = {
          returnDate: formValues.returnDate || new Date().toISOString().split('T')[0],
          orderId: formValues.orderId || `OD-${Date.now().toString().slice(-6)}`,
          productName: formValues.productName || '',
          cost: parseFloat(formValues.cost) || 0,
          reuseStatus: formValues.reuseStatus || 'Restocked',
          reason: formValues.reason || '',
        };
      }

      const res = await fetch('/api/accounting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: payloadType, record: recordPayload }),
      });
      const json = await res.json();

      if (json.success) {
        setData(json.data);
        setMetrics(json.metrics);
        setIsAddModalOpen(false);
        showToast('New entry saved dynamically to MongoDB!');
      } else {
        showToast(json.error || 'Failed to add record', 'error');
      }
    } catch (err: any) {
      console.error('Error adding record:', err);
      showToast('Network error saving entry', 'error');
    }
  };

  // Update single record via PUT API in MongoDB
  const handleEditSubmit = async (e: React.FormEvent, formValues: any) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      let payloadType = '';
      let recordPayload = {};
      const itemId = editingItem._id || editingItem.id;

      if (activeTab === 'expenses') {
        payloadType = 'expense';
        recordPayload = {
          date: formValues.date,
          expenseType: formValues.expenseType,
          description: formValues.description,
          amount: parseFloat(formValues.amount) || 0,
          paymentMethod: formValues.paymentMethod,
          notes: formValues.notes,
        };
      } else if (activeTab === 'products') {
        payloadType = 'productCost';
        const cost = parseFloat(formValues.cost) || 0;
        const packingCharge = parseFloat(formValues.packingCharge) || 0;
        recordPayload = {
          date: formValues.date,
          productName: formValues.productName,
          sku: formValues.sku,
          cost,
          packingCharge,
          totalCost: cost + packingCharge,
          returnStatus: formValues.returnStatus,
          returnConditions: formValues.returnConditions,
        };
      } else if (activeTab === 'returns') {
        payloadType = 'returnProduct';
        recordPayload = {
          returnDate: formValues.returnDate,
          orderId: formValues.orderId,
          productName: formValues.productName,
          cost: parseFloat(formValues.cost) || 0,
          reuseStatus: formValues.reuseStatus,
          reason: formValues.reason,
        };
      }

      const res = await fetch('/api/accounting', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: payloadType, id: itemId, record: recordPayload }),
      });
      const json = await res.json();

      if (json.success) {
        setData(json.data);
        setMetrics(json.metrics);
        setIsEditModalOpen(false);
        setEditingItem(null);
        showToast('Record updated dynamically in MongoDB!');
      } else {
        showToast(json.error || 'Failed to update record', 'error');
      }
    } catch (err: any) {
      console.error('Error updating record:', err);
      showToast('Network error updating entry', 'error');
    }
  };

  // Delete single row via DELETE API
  const handleDeleteRow = async (tabKey: 'expenses' | 'products' | 'returns', id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const payloadType = tabKey === 'expenses' ? 'expense' : tabKey === 'products' ? 'productCost' : 'returnProduct';
      const res = await fetch(`/api/accounting?type=${payloadType}&id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (json.success) {
        setData(json.data);
        setMetrics(json.metrics);
        setSelectedIds((prev) => prev.filter((i) => i !== id));
        showToast('Record deleted dynamically from MongoDB');
      } else {
        showToast(json.error || 'Failed to delete record', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Network error deleting record', 'error');
    }
  };

  // Bulk delete selected rows via DELETE API
  const handleBulkDelete = async (tabKey: 'expenses' | 'products' | 'returns') => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected items?`)) return;

    try {
      const payloadType = tabKey === 'expenses' ? 'expense' : tabKey === 'products' ? 'productCost' : 'returnProduct';
      const res = await fetch(`/api/accounting?type=${payloadType}&ids=${selectedIds.join(',')}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (json.success) {
        setData(json.data);
        setMetrics(json.metrics);
        setSelectedIds([]);
        showToast(`${selectedIds.length} records deleted from MongoDB`);
      } else {
        showToast(json.error || 'Failed to delete records', 'error');
      }
    } catch (err) {
      console.error('Bulk delete error:', err);
      showToast('Network error during bulk delete', 'error');
    }
  };

  // Date Presets and helpers
  const handleDatePreset = (preset: 'all' | 'today' | 'this_month' | 'last_30_days') => {
    setDatePreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'this_month') {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const firstDay = `${year}-${month}-01`;
      setStartDate(firstDay);
      setEndDate(todayStr);
    } else if (preset === 'last_30_days') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const pastStr = past.toISOString().split('T')[0];
      setStartDate(pastStr);
      setEndDate(todayStr);
    }
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setDatePreset('all');
  };

  const isDateInRange = (dateStr?: string) => {
    if (!dateStr) return true;
    const cleanDate = dateStr.trim().substring(0, 10);
    if (startDate && startDate.trim() !== '' && cleanDate < startDate.trim()) return false;
    if (endDate && endDate.trim() !== '' && cleanDate > endDate.trim()) return false;
    return true;
  };

  // Dynamic Dashboard Metrics computed across filtered datasets
  const dynamicMetrics: DashboardMetrics = useMemo(() => {
    const expensesInRange = data.expenses.filter((e) => isDateInRange(e.date));
    const productsInRange = data.productsCost.filter((p) => isDateInRange(p.date));
    const returnsInRange = data.returns.filter((r) => isDateInRange(r.returnDate));

    const totalOperatingExpenses = expensesInRange.reduce((a, c) => a + Number(c.amount || 0), 0);
    const totalPackingCharges = productsInRange.reduce((a, c) => a + Number(c.packingCharge || 0), 0);
    const totalProductsCost = productsInRange.reduce(
      (a, c) => a + Number(c.totalCost || Number(c.cost || 0) + Number(c.packingCharge || 0)),
      0
    );

    const scrappedReturns = returnsInRange.filter((r) => r.reuseStatus.toLowerCase().includes('scrap'));
    const restockedReturns = returnsInRange.filter((r) => r.reuseStatus.toLowerCase().includes('restock'));
    const refurbishedReturns = returnsInRange.filter((r) => r.reuseStatus.toLowerCase().includes('refurbish'));
    const inspectionReturns = returnsInRange.filter(
      (r) =>
        !r.reuseStatus.toLowerCase().includes('scrap') &&
        !r.reuseStatus.toLowerCase().includes('restock') &&
        !r.reuseStatus.toLowerCase().includes('refurbish')
    );

    const returnedItemsLoss = scrappedReturns.reduce((a, c) => a + Number(c.cost || 0), 0);
    const restockedValue = restockedReturns.reduce((a, c) => a + Number(c.cost || 0), 0);
    const refurbishedValue = refurbishedReturns.reduce((a, c) => a + Number(c.cost || 0), 0);
    const inspectionValue = inspectionReturns.reduce((a, c) => a + Number(c.cost || 0), 0);

    return {
      totalOperatingExpenses,
      totalProductsCost,
      totalPackingCharges,
      returnedItemsLoss,
      totalGrossRevenue: 0,
      totalMarketplaceFees: 0,
      totalSourcedCostSold: 0,
      totalNetProfit: -(totalOperatingExpenses + totalProductsCost + returnedItemsLoss),
      overallMarginPercent: 0,
      totalCombinedOutlay: totalOperatingExpenses + totalProductsCost + returnedItemsLoss,
      expenseCount: expensesInRange.length,
      productCount: productsInRange.length,
      returnCount: returnsInRange.length,
      returnDispositions: {
        restocked: { count: restockedReturns.length, value: restockedValue },
        scrapped: { count: scrappedReturns.length, value: returnedItemsLoss },
        refurbished: { count: refurbishedReturns.length, value: refurbishedValue },
        underInspection: { count: inspectionReturns.length, value: inspectionValue },
      },
    };
  }, [data, startDate, endDate]);

  // Filtered lists with date range checks
  const filteredExpenses = useMemo(() => {
    return data.expenses.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.expenseType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'all' || item.expenseType === categoryFilter;
      const matchDate = isDateInRange(item.date);
      return matchSearch && matchCat && matchDate;
    });
  }, [data.expenses, searchQuery, categoryFilter, startDate, endDate]);

  const filteredProducts = useMemo(() => {
    return data.productsCost.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || item.returnStatus === statusFilter;
      const matchDate = isDateInRange(item.date);
      return matchSearch && matchStatus && matchDate;
    });
  }, [data.productsCost, searchQuery, statusFilter, startDate, endDate]);

  const filteredReturns = useMemo(() => {
    return data.returns.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || item.reuseStatus === statusFilter;
      const matchDate = isDateInRange(item.returnDate);
      return matchSearch && matchStatus && matchDate;
    });
  }, [data.returns, searchQuery, statusFilter, startDate, endDate]);

  const handleSelectAll = (list: any[]) => {
    if (selectedIds.length === list.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(list.map((item) => item.id || item._id));
    }
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-xs font-semibold transition-all duration-300 animate-in slide-in-from-bottom-5',
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
              : toastMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/40'
              : 'bg-indigo-950/90 text-indigo-200 border-indigo-500/40'
          )}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Header & Clean Executive Bar */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
            {/* Title, Subtitle, and Live Badges */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  MongoDB Dynamic Store
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Account Calc.xlsx
                </span>
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Accounting & Cost Calculator
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dynamic MongoDB tracking for Operating Expenses, Product Unit Costs, and Return Dispositions.
              </p>
            </div>

            {/* Action Buttons Group */}
            <div className="flex flex-wrap items-center gap-2 pt-1 lg:pt-0">
              <button
                onClick={handleDownloadExcel}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm hover:border-slate-400 active:scale-[0.98]"
                title="Download formatted Excel workbook"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="whitespace-nowrap">Export XLSX</span>
              </button>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm hover:border-slate-400 active:scale-[0.98]"
                title="Upload Excel or CSV file"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="whitespace-nowrap">Import Excel</span>
              </button>

              <button
                onClick={() => handleSaveAll()}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50"
                title="Sync dynamic updates across MongoDB and Excel"
              >
                <Save className={cn('w-3.5 h-3.5', isSaving && 'animate-spin')} />
                <span className="whitespace-nowrap">{isSaving ? 'Syncing...' : 'Sync MongoDB'}</span>
              </button>

              {activeTab !== 'dashboard' && (
                <button
                  onClick={() => {
                    if (activeTab === 'products') {
                      setPrdFormCost(150);
                      setPrdFormPacking(2);
                    }
                    setIsAddModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white transition-all shadow-md shadow-indigo-500/25 active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span className="whitespace-nowrap">
                    Add {activeTab === 'expenses' ? 'Expense' : activeTab === 'products' ? 'Product Cost' : 'Return Entry'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Sleek Segmented Tab Navigation */}
          <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <div className="bg-slate-100/90 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-md flex items-center gap-1 w-full sm:w-auto">
              <button
                onClick={() => { setActiveTab('dashboard'); setSelectedIds([]); }}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                  activeTab === 'dashboard'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/70 dark:border-slate-700/70'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
                )}
              >
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                <span>Financial Dashboard</span>
              </button>

              <button
                onClick={() => { setActiveTab('expenses'); setSelectedIds([]); }}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                  activeTab === 'expenses'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/70 dark:border-slate-700/70'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
                )}
              >
                <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                <span>Expense Tracker</span>
                <span className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-extrabold',
                  activeTab === 'expenses'
                    ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                )}>
                  {data.expenses.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('products'); setSelectedIds([]); }}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                  activeTab === 'products'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/70 dark:border-slate-700/70'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
                )}
              >
                <Package className="w-3.5 h-3.5 text-indigo-500" />
                <span>Products Cost Register</span>
                <span className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-extrabold',
                  activeTab === 'products'
                    ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                )}>
                  {data.productsCost.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('returns'); setSelectedIds([]); }}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
                  activeTab === 'returns'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/70 dark:border-slate-700/70'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
                )}
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                <span>Return Product List</span>
                <span className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-extrabold',
                  activeTab === 'returns'
                    ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                )}>
                  {data.returns.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-4">

        {/* ------------------------------------------------------------- */}
        {/* UNIVERSAL DATE FILTER BAR (Applies across all tabs) */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-3 transition-all">
          {/* Left: Filter Title & Quick Preset Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20 text-xs font-bold">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Date Scope</span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700/70 text-[11px] font-semibold">
              <button
                onClick={() => handleDatePreset('all')}
                className={cn(
                  'px-2.5 py-1 rounded-lg transition-all',
                  datePreset === 'all' && !startDate && !endDate
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                All Time
              </button>
              <button
                onClick={() => handleDatePreset('today')}
                className={cn(
                  'px-2.5 py-1 rounded-lg transition-all',
                  datePreset === 'today'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                Today
              </button>
              <button
                onClick={() => handleDatePreset('this_month')}
                className={cn(
                  'px-2.5 py-1 rounded-lg transition-all',
                  datePreset === 'this_month'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                This Month
              </button>
              <button
                onClick={() => handleDatePreset('last_30_days')}
                className={cn(
                  'px-2.5 py-1 rounded-lg transition-all',
                  datePreset === 'last_30_days'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                Last 30 Days
              </button>
            </div>
          </div>

          {/* Right: Start Date - End Date Inputs, Clear & Active Badge */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Start Date */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDatePreset('custom');
                }}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              />
            </div>

            {/* End Date */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDatePreset('custom');
                }}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              />
            </div>

            {/* Clear Filter Button */}
            {(startDate || endDate) && (
              <button
                onClick={clearDateFilter}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all shadow-xs"
                title="Reset date range filter"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}

            {/* Active Range Record Summary Pill */}
            {(startDate || endDate) && (
              <span className="text-[11px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 px-3 py-1.5 rounded-xl whitespace-nowrap">
                {activeTab === 'expenses'
                  ? `${filteredExpenses.length} Expenses`
                  : activeTab === 'products'
                  ? `${filteredProducts.length} Products`
                  : activeTab === 'returns'
                  ? `${filteredReturns.length} Returns`
                  : `${filteredExpenses.length + filteredProducts.length + filteredReturns.length} Records in range`}
              </span>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: FINANCIAL DASHBOARD ONLY */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Active Date Banner for Dashboard */}
            {(startDate || endDate) && (
              <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-semibold">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>
                    Dashboard metrics calculated for range: <strong className="font-extrabold">{startDate || 'Earliest'}</strong> to <strong className="font-extrabold">{endDate || 'Present'}</strong>
                  </span>
                </div>
                <button
                  onClick={clearDateFilter}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                >
                  View All-Time Analytics
                </button>
              </div>
            )}

            {/* KPI Cards on Dashboard Tab */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Operating Expenses</span>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹{dynamicMetrics.totalOperatingExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{dynamicMetrics.expenseCount} entries</span> recorded
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-blue-500/40 transition-all">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Products Cost</span>
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹{dynamicMetrics.totalProductsCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">₹{dynamicMetrics.totalPackingCharges.toFixed(0)}</span> packing included
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-indigo-500/40 transition-all">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Packaging</span>
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Box className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹{dynamicMetrics.totalPackingCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{dynamicMetrics.productCount} products</span> registered
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-rose-500/40 transition-all">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Return Loss</span>
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  ₹{dynamicMetrics.returnedItemsLoss.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{dynamicMetrics.returnDispositions.restocked.count} Restocked</span>
                </div>
              </div>
            </div>

            {/* Dashboard Breakdown Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-500" />
                  Cost Breakdown & Expenditure Shares
                </h3>
                <p className="text-xs text-slate-500 mb-4">Live dynamic reconciliation across date range</p>

                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Product Sourcing Costs</div>
                      <div className="text-xs text-slate-500">Products Cost Register ({dynamicMetrics.productCount} items)</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        ₹{(dynamicMetrics.totalProductsCost - dynamicMetrics.totalPackingCharges).toFixed(2)}
                      </div>
                      <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                        Base Procurement
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Packaging Outlay</div>
                      <div className="text-xs text-slate-500">Unit packing charges per product</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        ₹{dynamicMetrics.totalPackingCharges.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                        Packaging Total
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Operational & Admin Expenses</div>
                      <div className="text-xs text-slate-500">GST, Ads, Office, Shipping ({dynamicMetrics.expenseCount} entries)</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        ₹{dynamicMetrics.totalOperatingExpenses.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                        Operational Outlay
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Scrapped Return Losses</div>
                      <div className="text-xs text-slate-500">Damaged / unrecoverable return losses</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
                        ₹{dynamicMetrics.returnedItemsLoss.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-rose-500 font-semibold">
                        {dynamicMetrics.returnDispositions.scrapped.count} damaged items
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-emerald-500" />
                  Return Product Dispositions & Inventory Impact
                </h3>
                <p className="text-xs text-slate-500 mb-4">Categorized status from Return Product Management</p>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                    <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Restocked</div>
                    <div className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1">
                      {dynamicMetrics.returnDispositions.restocked.count} items
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      ₹{dynamicMetrics.returnDispositions.restocked.value.toFixed(2)} value salvaged
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                    <div className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase">Scrapped / Loss</div>
                    <div className="text-2xl font-black text-rose-800 dark:text-rose-300 mt-1">
                      {dynamicMetrics.returnDispositions.scrapped.count} items
                    </div>
                    <div className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                      ₹{dynamicMetrics.returnDispositions.scrapped.value.toFixed(2)} net loss
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
                    <div className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase">Refurbished</div>
                    <div className="text-2xl font-black text-purple-800 dark:text-purple-300 mt-1">
                      {dynamicMetrics.returnDispositions.refurbished.count} items
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      ₹{dynamicMetrics.returnDispositions.refurbished.value.toFixed(2)} for resale
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                    <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">Under Inspection</div>
                    <div className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-1">
                      {dynamicMetrics.returnDispositions.underInspection.count} items
                    </div>
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Pending vendor triage
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: EXPENSE TRACKER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            {/* Clean Integrated Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search expenses, descriptions, notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="all">All Expense Types</option>
                  <option value="Taxes / GST">Taxes / GST</option>
                  <option value="Marketing / Ads">Marketing / Ads</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Shipping / Logistics">Shipping / Logistics</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              {selectedIds.length > 0 && (
                <button
                  onClick={() => handleBulkDelete('expenses')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
              )}
            </div>

            {/* Expenses Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1E3989] text-white font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredExpenses.length > 0 && selectedIds.length === filteredExpenses.length}
                          onChange={() => handleSelectAll(filteredExpenses)}
                          className="rounded border-slate-300 text-blue-600"
                        />
                      </th>
                      <th className="p-3.5 whitespace-nowrap">Date</th>
                      <th className="p-3.5 whitespace-nowrap">Expense Type</th>
                      <th className="p-3.5">Description</th>
                      <th className="p-3.5 text-right whitespace-nowrap">Amount (₹)</th>
                      <th className="p-3.5 whitespace-nowrap">Payment Method</th>
                      <th className="p-3.5">Notes</th>
                      <th className="p-3.5 text-center whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          No expense records found for the selected filter & date range.
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map((exp) => {
                        const rowId = exp._id || exp.id;
                        return (
                          <tr
                            key={rowId}
                            className={cn(
                              'hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors',
                              selectedIds.includes(rowId) && 'bg-blue-50/50 dark:bg-blue-500/10'
                            )}
                          >
                            <td className="p-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(rowId)}
                                onChange={() => toggleSelectId(rowId)}
                                className="rounded border-slate-300 text-blue-600"
                              />
                            </td>
                            <td className="p-3.5 font-medium whitespace-nowrap text-slate-700 dark:text-slate-300">
                              {exp.date}
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                                {exp.expenseType}
                              </span>
                            </td>
                            <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                              {exp.description}
                            </td>
                            <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                              ₹{Number(exp.amount).toFixed(2)}
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {exp.paymentMethod}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-500 max-w-xs truncate" title={exp.notes}>
                              {exp.notes || '—'}
                            </td>
                            <td className="p-3.5 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingItem(exp);
                                    setIsEditModalOpen(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                  title="Edit Expense"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRow('expenses', rowId)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                                  title="Delete Expense"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-800/60 font-bold border-t border-slate-200 dark:border-slate-800">
                    <tr>
                      <td colSpan={4} className="p-3.5 text-right text-slate-700 dark:text-slate-300">
                        Total Expenses (Filtered Range):
                      </td>
                      <td className="p-3.5 text-right text-blue-700 dark:text-blue-400 font-extrabold text-sm">
                        ₹{filteredExpenses.reduce((a, c) => a + Number(c.amount || 0), 0).toFixed(2)}
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: PRODUCTS COST REGISTER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search product name, SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="all">All Delivery Statuses</option>
                  <option value="Delivered">Delivered</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Pending">Pending</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>

              {selectedIds.length > 0 && (
                <button
                  onClick={() => handleBulkDelete('products')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
              )}
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1E3989] text-white font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                          onChange={() => handleSelectAll(filteredProducts)}
                          className="rounded border-slate-300 text-blue-600"
                        />
                      </th>
                      <th className="p-3.5 whitespace-nowrap">Date</th>
                      <th className="p-3.5">Product Name</th>
                      <th className="p-3.5 whitespace-nowrap">SKU / ID</th>
                      <th className="p-3.5 text-right whitespace-nowrap">Base Cost (₹)</th>
                      <th className="p-3.5 text-right whitespace-nowrap">Packing Charge (₹)</th>
                      <th className="p-3.5 text-right whitespace-nowrap">Total Cost (₹)</th>
                      <th className="p-3.5 text-center whitespace-nowrap">Return Status</th>
                      <th className="p-3.5 text-center whitespace-nowrap">Condition</th>
                      <th className="p-3.5 text-center whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-500">
                          No product cost records found for the selected filter & date range.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prd) => {
                        const rowId = prd._id || prd.id;
                        return (
                          <tr
                            key={rowId}
                            className={cn(
                              'hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors',
                              selectedIds.includes(rowId) && 'bg-blue-50/50 dark:bg-blue-500/10'
                            )}
                          >
                            <td className="p-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(rowId)}
                                onChange={() => toggleSelectId(rowId)}
                                className="rounded border-slate-300 text-blue-600"
                              />
                            </td>
                            <td className="p-3.5 font-medium whitespace-nowrap text-slate-700 dark:text-slate-300">
                              {prd.date}
                            </td>
                            <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                              {prd.productName}
                            </td>
                            <td className="p-3.5 font-mono text-[11px] text-blue-600 dark:text-blue-400 whitespace-nowrap">
                              {prd.sku}
                            </td>
                            <td className="p-3.5 text-right font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              ₹{Number(prd.cost).toFixed(2)}
                            </td>
                            <td className="p-3.5 text-right font-medium text-slate-500 whitespace-nowrap">
                              ₹{Number(prd.packingCharge).toFixed(2)}
                            </td>
                            <td className="p-3.5 text-right font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              ₹{Number(prd.totalCost || Number(prd.cost) + Number(prd.packingCharge)).toFixed(2)}
                            </td>
                            <td className="p-3.5 text-center whitespace-nowrap">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                {prd.returnStatus}
                              </span>
                            </td>
                            <td className="p-3.5 text-center text-slate-500 whitespace-nowrap">
                              {prd.returnConditions || 'Brand New'}
                            </td>
                            <td className="p-3.5 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingItem(prd);
                                    setIsEditModalOpen(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRow('products', rowId)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-800/60 font-bold border-t border-slate-200 dark:border-slate-800">
                    <tr>
                      <td colSpan={4} className="p-3.5 text-right text-slate-700 dark:text-slate-300">
                        Total Product Spend (Filtered Range):
                      </td>
                      <td className="p-3.5 text-right text-slate-700 dark:text-slate-300">
                        ₹{filteredProducts.reduce((a, c) => a + Number(c.cost || 0), 0).toFixed(2)}
                      </td>
                      <td className="p-3.5 text-right text-slate-500">
                        ₹{filteredProducts.reduce((a, c) => a + Number(c.packingCharge || 0), 0).toFixed(2)}
                      </td>
                      <td className="p-3.5 text-right text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                        ₹{filteredProducts.reduce((a, c) => a + Number(c.totalCost || (Number(c.cost) + Number(c.packingCharge))), 0).toFixed(2)}
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: RETURN PRODUCT LIST */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'returns' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Order ID, product, reason..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="all">All Reuse Statuses</option>
                  <option value="Restocked">Restocked</option>
                  <option value="Scrapped / Loss">Scrapped / Loss</option>
                  <option value="Refurbished">Refurbished</option>
                  <option value="Under Inspection">Under Inspection</option>
                </select>
              </div>

              {selectedIds.length > 0 && (
                <button
                  onClick={() => handleBulkDelete('returns')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
              )}
            </div>

            {/* Returns Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1E3989] text-white font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredReturns.length > 0 && selectedIds.length === filteredReturns.length}
                          onChange={() => handleSelectAll(filteredReturns)}
                          className="rounded border-slate-300 text-blue-600"
                        />
                      </th>
                      <th className="p-3.5 whitespace-nowrap">Return Date</th>
                      <th className="p-3.5 whitespace-nowrap">Order ID</th>
                      <th className="p-3.5">Product Name</th>
                      <th className="p-3.5 text-right whitespace-nowrap">Cost (₹)</th>
                      <th className="p-3.5 text-center whitespace-nowrap">Reuse Status</th>
                      <th className="p-3.5">Reason / Notes</th>
                      <th className="p-3.5 text-center whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredReturns.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          No return entries found for the selected filter & date range.
                        </td>
                      </tr>
                    ) : (
                      filteredReturns.map((ret) => {
                        const rowId = ret._id || ret.id;
                        return (
                          <tr
                            key={rowId}
                            className={cn(
                              'hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors',
                              selectedIds.includes(rowId) && 'bg-blue-50/50 dark:bg-blue-500/10'
                            )}
                          >
                            <td className="p-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(rowId)}
                                onChange={() => toggleSelectId(rowId)}
                                className="rounded border-slate-300 text-blue-600"
                              />
                            </td>
                            <td className="p-3.5 font-medium whitespace-nowrap text-slate-700 dark:text-slate-300">
                              {ret.returnDate}
                            </td>
                            <td className="p-3.5 font-mono font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                              {ret.orderId}
                            </td>
                            <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                              {ret.productName}
                            </td>
                            <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                              ₹{Number(ret.cost).toFixed(2)}
                            </td>
                            <td className="p-3.5 text-center whitespace-nowrap">
                              <span
                                className={cn(
                                  'px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                                  ret.reuseStatus.toLowerCase().includes('restock')
                                    ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200'
                                    : ret.reuseStatus.toLowerCase().includes('scrap')
                                    ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200'
                                    : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200'
                                )}
                              >
                                {ret.reuseStatus}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-500 max-w-xs truncate" title={ret.reason}>
                              {ret.reason || '—'}
                            </td>
                            <td className="p-3.5 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingItem(ret);
                                    setIsEditModalOpen(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRow('returns', rowId)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD RECORD (CRUD Dynamic Form for MongoDB) */}
      {/* ------------------------------------------------------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    Add New {activeTab === 'expenses' ? 'Expense' : activeTab === 'products' ? 'Product Cost' : 'Return Record'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Directly saves to MongoDB database</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                const formData = new FormData(e.currentTarget);
                const values = Object.fromEntries(formData.entries());
                handleAddSubmit(e, values);
              }}
              className="space-y-4"
            >
              {/* Form fields for Expenses */}
              {activeTab === 'expenses' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Expense Type</label>
                      <select
                        name="expenseType"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="Taxes / GST">Taxes / GST</option>
                        <option value="Marketing / Ads">Marketing / Ads</option>
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="Packaging">Packaging</option>
                        <option value="Shipping / Logistics">Shipping / Logistics</option>
                        <option value="Miscellaneous">Miscellaneous</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                    <input
                      type="text"
                      name="description"
                      placeholder="e.g. Courier self-shipping charge"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="amount"
                        placeholder="0.00"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                      <select
                        name="paymentMethod"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="UPI / Online">UPI / Online</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Credit Card">Credit Card</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                    <textarea
                      name="notes"
                      rows={2}
                      placeholder="Additional remarks or invoice reference..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              {/* Form fields for Products Cost */}
              {activeTab === 'products' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">SKU / ID</label>
                      <input
                        type="text"
                        name="sku"
                        placeholder="PRD-9981"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                    <input
                      type="text"
                      name="productName"
                      placeholder="e.g. Silicone Round Mat Set 4pcs"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Base Sourcing Cost (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="cost"
                        placeholder="150"
                        value={prdFormCost || ''}
                        onChange={(e) => setPrdFormCost(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Packing Charge (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="packingCharge"
                        value={prdFormPacking || ''}
                        onChange={(e) => setPrdFormPacking(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Dynamic Total Cost Banner */}
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      Auto Computed Total Unit Cost:
                    </span>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                      ₹{(prdFormCost + prdFormPacking).toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Delivery Status</label>
                      <select
                        name="returnStatus"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="Delivered">Delivered</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Pending">Pending</option>
                        <option value="Returned">Returned</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Condition</label>
                      <select
                        name="returnConditions"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="Brand New">Brand New</option>
                        <option value="Good">Good</option>
                        <option value="Damaged">Damaged</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Form fields for Returns */}
              {activeTab === 'returns' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Return Date</label>
                      <input
                        type="date"
                        name="returnDate"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Order ID</label>
                      <input
                        type="text"
                        name="orderId"
                        placeholder="OD-AMZ-77182"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                    <input
                      type="text"
                      name="productName"
                      placeholder="e.g. 6 Layer Drawer"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cost Loss (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="cost"
                        placeholder="160"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reuse Status</label>
                      <select
                        name="reuseStatus"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="Restocked">Restocked</option>
                        <option value="Scrapped / Loss">Scrapped / Loss</option>
                        <option value="Refurbished">Refurbished</option>
                        <option value="Under Inspection">Under Inspection</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason / Notes</label>
                    <textarea
                      name="reason"
                      rows={2}
                      placeholder="Customer reason for return..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-500/20"
                >
                  Save to MongoDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT RECORD */}
      {/* ------------------------------------------------------------- */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    Edit Record
                  </h3>
                  <p className="text-[11px] text-slate-400">Updates directly in MongoDB</p>
                </div>
              </div>
              <button onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                const formData = new FormData(e.currentTarget);
                const values = Object.fromEntries(formData.entries());
                handleEditSubmit(e, values);
              }}
              className="space-y-4"
            >
              {activeTab === 'expenses' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        defaultValue={editingItem.date}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Expense Type</label>
                      <select
                        name="expenseType"
                        defaultValue={editingItem.expenseType}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="Taxes / GST">Taxes / GST</option>
                        <option value="Marketing / Ads">Marketing / Ads</option>
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="Packaging">Packaging</option>
                        <option value="Shipping / Logistics">Shipping / Logistics</option>
                        <option value="Miscellaneous">Miscellaneous</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                    <input
                      type="text"
                      name="description"
                      defaultValue={editingItem.description}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="amount"
                        defaultValue={editingItem.amount}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                      <select
                        name="paymentMethod"
                        defaultValue={editingItem.paymentMethod}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="UPI / Online">UPI / Online</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Credit Card">Credit Card</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                    <textarea
                      name="notes"
                      rows={2}
                      defaultValue={editingItem.notes}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              {activeTab === 'products' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        defaultValue={editingItem.date}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">SKU</label>
                      <input
                        type="text"
                        name="sku"
                        defaultValue={editingItem.sku}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                    <input
                      type="text"
                      name="productName"
                      defaultValue={editingItem.productName}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Base Cost (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="cost"
                        defaultValue={editingItem.cost}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Packing Charge (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="packingCharge"
                        defaultValue={editingItem.packingCharge}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Delivery Status</label>
                      <select
                        name="returnStatus"
                        defaultValue={editingItem.returnStatus}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="Delivered">Delivered</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Pending">Pending</option>
                        <option value="Returned">Returned</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Condition</label>
                      <select
                        name="returnConditions"
                        defaultValue={editingItem.returnConditions}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="Brand New">Brand New</option>
                        <option value="Good">Good</option>
                        <option value="Damaged">Damaged</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'returns' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Return Date</label>
                      <input
                        type="date"
                        name="returnDate"
                        defaultValue={editingItem.returnDate}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Order ID</label>
                      <input
                        type="text"
                        name="orderId"
                        defaultValue={editingItem.orderId}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                    <input
                      type="text"
                      name="productName"
                      defaultValue={editingItem.productName}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cost Loss (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="cost"
                        defaultValue={editingItem.cost}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reuse Status</label>
                      <select
                        name="reuseStatus"
                        defaultValue={editingItem.reuseStatus}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="Restocked">Restocked</option>
                        <option value="Scrapped / Loss">Scrapped / Loss</option>
                        <option value="Refurbished">Refurbished</option>
                        <option value="Under Inspection">Under Inspection</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason / Notes</label>
                    <textarea
                      name="reason"
                      rows={2}
                      defaultValue={editingItem.reason}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  Update & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: UPLOAD EXCEL / CSV */}
      {/* ------------------------------------------------------------- */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-500" />
                Import to MongoDB
              </h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40"
              >
                <FileSpreadsheet className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {uploadFile ? uploadFile.name : 'Click to select or drop Account Calc.xlsx'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports .xlsx, .xls, .csv with auto-sheet detection
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Import Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={cn(
                      'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all',
                      uploadMode === 'replace'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    )}
                  >
                    <input
                      type="radio"
                      name="uploadMode"
                      checked={uploadMode === 'replace'}
                      onChange={() => setUploadMode('replace')}
                      className="text-indigo-600"
                    />
                    <span>Replace Entire Data</span>
                  </label>

                  <label
                    className={cn(
                      'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all',
                      uploadMode === 'merge'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    )}
                  >
                    <input
                      type="radio"
                      name="uploadMode"
                      checked={uploadMode === 'merge'}
                      onChange={() => setUploadMode('merge')}
                      className="text-indigo-600"
                    />
                    <span>Merge / Append</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || isUploading}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Processing...' : 'Upload to MongoDB'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
