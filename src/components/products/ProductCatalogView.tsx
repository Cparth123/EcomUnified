'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Upload, 
  Download, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  ExternalLink,
  Sparkles,
  RefreshCw,
  LayoutGrid,
  List,
  FileSpreadsheet,
  Database,
  CloudLightning,
  Loader2,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Tag,
  Barcode,
  Hash,
  Percent,
  RotateCcw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ProductListing, PlatformType } from '@/types';
import globalStore from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { formatINR, cn } from '@/lib/utils';
import { calculateAmazonFees, AMAZON_CATEGORIES } from '@/lib/calculators/amazonFeeEngine';
import { calculateFlipkartFees, FLIPKART_CATEGORIES } from '@/lib/calculators/flipkartFeeEngine';

export const ProductCatalogView: React.FC = () => {
  const [productsList, setProductsList] = useState<ProductListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'mongodb' | 'store'>('store');

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<'all' | 'name' | 'sku' | 'asin' | 'fsn'>('all');
  const [skuFilter, setSkuFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [asinFilter, setAsinFilter] = useState('');
  const [fsnFilter, setFsnFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'amazon' | 'flipkart' | 'both'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'out_of_stock' | 'low_stock'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [marginFilter, setMarginFilter] = useState<'all' | 'high' | 'moderate' | 'low'>('all');
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  // View Mode & Notification
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductListing | null>(null);

  // Single Product Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [asin, setAsin] = useState('');
  const [fsn, setFsn] = useState('');
  const [category, setCategory] = useState('electronics_accessories');
  const [platform, setPlatform] = useState<'amazon' | 'flipkart' | 'both'>('both');
  const [costPrice, setCostPrice] = useState<number>(350);
  const [sellingPrice, setSellingPrice] = useState<number>(999);
  const [weightGrams, setWeightGrams] = useState<number>(350);
  const [stock, setStock] = useState<number>(50);
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60');

  // Bulk Upload State
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkPreviewData, setBulkPreviewData] = useState<any[]>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch products from MongoDB API
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setProductsList(data.data);
        if (data.source) setDataSource(data.source);
      } else {
        setProductsList(globalStore.getProducts());
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setProductsList(globalStore.getProducts());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtered products list with dedicated SKU, Name, ASIN, FSN filters
  const filteredProducts = useMemo(() => {
    let list = [...productsList];

    // Platform Filter
    if (platformFilter !== 'all') {
      if (platformFilter === 'both') {
        list = list.filter(p => p.platform === 'both');
      } else {
        list = list.filter(p => p.platform === platformFilter || p.platform === 'both');
      }
    }

    // Status Filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        list = list.filter(p => p.status === 'active' && p.stock > 0);
      } else if (statusFilter === 'out_of_stock') {
        list = list.filter(p => p.status === 'out_of_stock' || p.stock === 0);
      } else if (statusFilter === 'low_stock') {
        list = list.filter(p => p.stock > 0 && p.stock <= 20);
      }
    }

    // Category Filter
    if (categoryFilter !== 'all') {
      list = list.filter(p => p.category === categoryFilter);
    }

    // Profit Margin Filter
    if (marginFilter !== 'all') {
      if (marginFilter === 'high') {
        list = list.filter(p => (p.estimatedMarginPercent || 0) >= 25);
      } else if (marginFilter === 'moderate') {
        list = list.filter(p => (p.estimatedMarginPercent || 0) >= 10 && (p.estimatedMarginPercent || 0) < 25);
      } else if (marginFilter === 'low') {
        list = list.filter(p => (p.estimatedMarginPercent || 0) < 10);
      }
    }

    // Dedicated SKU Filter
    if (skuFilter.trim()) {
      const q = skuFilter.toLowerCase().trim();
      list = list.filter(p => p.sku && p.sku.toLowerCase().includes(q));
    }

    // Dedicated Name Filter
    if (nameFilter.trim()) {
      const q = nameFilter.toLowerCase().trim();
      list = list.filter(p => p.name && p.name.toLowerCase().includes(q));
    }

    // Dedicated ASIN Filter
    if (asinFilter.trim()) {
      const q = asinFilter.toLowerCase().trim();
      list = list.filter(p => p.asin && p.asin.toLowerCase().includes(q));
    }

    // Dedicated FSN Filter
    if (fsnFilter.trim()) {
      const q = fsnFilter.toLowerCase().trim();
      list = list.filter(p => p.fsn && p.fsn.toLowerCase().includes(q));
    }

    // Main Search Bar with Search Mode Target
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      if (searchMode === 'name') {
        list = list.filter(p => p.name && p.name.toLowerCase().includes(q));
      } else if (searchMode === 'sku') {
        list = list.filter(p => p.sku && p.sku.toLowerCase().includes(q));
      } else if (searchMode === 'asin') {
        list = list.filter(p => p.asin && p.asin.toLowerCase().includes(q));
      } else if (searchMode === 'fsn') {
        list = list.filter(p => p.fsn && p.fsn.toLowerCase().includes(q));
      } else {
        // 'all' search across title, sku, asin, fsn
        list = list.filter(p => 
          (p.name && p.name.toLowerCase().includes(q)) || 
          (p.sku && p.sku.toLowerCase().includes(q)) || 
          (p.asin && p.asin.toLowerCase().includes(q)) || 
          (p.fsn && p.fsn.toLowerCase().includes(q))
        );
      }
    }

    return list;
  }, [
    productsList, 
    platformFilter, 
    statusFilter, 
    categoryFilter, 
    marginFilter, 
    skuFilter, 
    nameFilter, 
    asinFilter, 
    fsnFilter, 
    searchTerm, 
    searchMode
  ]);

  // Active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (skuFilter.trim()) count++;
    if (nameFilter.trim()) count++;
    if (asinFilter.trim()) count++;
    if (fsnFilter.trim()) count++;
    if (platformFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (marginFilter !== 'all') count++;
    return count;
  }, [searchTerm, skuFilter, nameFilter, asinFilter, fsnFilter, platformFilter, statusFilter, categoryFilter, marginFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSearchMode('all');
    setSkuFilter('');
    setNameFilter('');
    setAsinFilter('');
    setFsnFilter('');
    setPlatformFilter('all');
    setStatusFilter('all');
    setCategoryFilter('all');
    setMarginFilter('all');
  };

  // Catalog Metrics
  const stats = useMemo(() => {
    const total = productsList.length;
    const active = productsList.filter(p => p.status === 'active' && p.stock > 0).length;
    const outOfStock = productsList.filter(p => p.status === 'out_of_stock' || p.stock === 0).length;
    const avgMargin = total > 0 
      ? (productsList.reduce((acc, p) => acc + (p.estimatedMarginPercent || 0), 0) / total).toFixed(1)
      : '0.0';

    return { total, active, outOfStock, avgMargin };
  }, [productsList]);

  // Real-time Fee & Margin Calculation
  const feeEstimates = useMemo(() => {
    let amazonRes = null;
    let flipkartRes = null;

    if (platform === 'amazon' || platform === 'both') {
      try {
        amazonRes = calculateAmazonFees({
          category,
          costPrice: Number(costPrice) || 0,
          sellingPrice: Number(sellingPrice) || 0,
          weightGrams: Number(weightGrams) || 300,
          shippingZone: 'national',
          fulfillmentType: 'easyship',
        });
      } catch (e) {}
    }

    if (platform === 'flipkart' || platform === 'both') {
      try {
        flipkartRes = calculateFlipkartFees({
          category,
          costPrice: Number(costPrice) || 0,
          sellingPrice: Number(sellingPrice) || 0,
          weightGrams: Number(weightGrams) || 300,
          shippingTier: 'silver',
          shippingZone: 'national',
          paymentMode: 'prepaid',
        });
      } catch (e) {}
    }

    return { amazonRes, flipkartRes };
  }, [platform, category, costPrice, sellingPrice, weightGrams]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenAddModal = () => {
    setName('');
    setSku(`SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    setAsin('');
    setFsn('');
    setCategory('electronics_accessories');
    setPlatform('both');
    setCostPrice(350);
    setSellingPrice(999);
    setWeightGrams(350);
    setStock(50);
    setImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60');
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (prod: ProductListing) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSku(prod.sku);
    setAsin(prod.asin || '');
    setFsn(prod.fsn || '');
    setCategory(prod.category);
    setPlatform(prod.platform);
    setCostPrice(prod.costPrice);
    setSellingPrice(prod.sellingPrice);
    setWeightGrams(prod.weightGrams);
    setStock(prod.stock);
    setImageUrl(prod.imageUrl || '');
    setIsAddModalOpen(true);
  };

  // CREATE or UPDATE product in MongoDB & Cloudinary
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let margin = 0;
    if (feeEstimates.amazonRes && feeEstimates.flipkartRes) {
      margin = (feeEstimates.amazonRes.profitMarginPercent + feeEstimates.flipkartRes.profitMarginPercent) / 2;
    } else if (feeEstimates.amazonRes) {
      margin = feeEstimates.amazonRes.profitMarginPercent;
    } else if (feeEstimates.flipkartRes) {
      margin = feeEstimates.flipkartRes.profitMarginPercent;
    }

    const payload: Partial<ProductListing> = {
      sku: sku.trim().toUpperCase(),
      asin: asin.trim().toUpperCase() || undefined,
      fsn: fsn.trim().toUpperCase() || undefined,
      name: name.trim(),
      category,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      weightGrams: Number(weightGrams),
      stock: Number(stock),
      platform,
      status: Number(stock) > 0 ? 'active' : 'out_of_stock',
      estimatedMarginPercent: Number(margin.toFixed(1)),
    };

    try {
      if (editingProduct) {
        // UPDATE (PUT)
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update product in MongoDB');

        showNotification(`Product "${payload.name}" updated successfully in MongoDB.`);
      } else {
        // CREATE (POST)
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create product in MongoDB');

        showNotification(`Product "${payload.name}" stored in MongoDB with Cloudinary image.`);
      }

      setIsAddModalOpen(false);
      await fetchProducts();
    } catch (err: any) {
      showNotification(err.message || 'Operation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE product from MongoDB
  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${prodName}" from MongoDB?`)) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete product');

      showNotification(`Product "${prodName}" deleted from MongoDB.`);
      await fetchProducts();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete product', 'error');
    }
  };

  // Quick Stock Adjustment (PUT)
  const handleUpdateStock = async (id: string, currentStock: number, delta: number) => {
    const updated = Math.max(0, currentStock + delta);
    const newStatus = updated === 0 ? 'out_of_stock' : 'active';

    try {
      setProductsList(prev => prev.map(p => p.id === id ? { ...p, stock: updated, status: newStatus } : p));

      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: updated, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update stock');

      showNotification(`Stock updated to ${updated} units.`);
    } catch (err: any) {
      showNotification(err.message || 'Stock update failed', 'error');
      fetchProducts();
    }
  };

  // Bulk Excel/CSV Import (POST array)
  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFile(file);
    setBulkError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          setBulkError('Uploaded file contains no data rows.');
          setBulkPreviewData([]);
          return;
        }

        setBulkPreviewData(data.slice(0, 10));
      } catch (err: any) {
        setBulkError('Failed to parse Excel/CSV file: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleProcessBulkUpload = async () => {
    if (!bulkFile) return;
    setIsProcessingBulk(true);

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const rows: any[] = XLSX.utils.sheet_to_json(ws);

          const formattedList = rows.map((row: any) => {
            const skuVal = row.sku || row.SKU || `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const nameVal = row.name || row.Name || row.title || row.Title || 'Imported Product';
            const costVal = Number(row.costPrice || row.cost || row.CostPrice || 300);
            const sellVal = Number(row.sellingPrice || row.price || row.SellingPrice || 899);
            const stockVal = Number(row.stock || row.Stock || row.quantity || 50);
            const catVal = row.category || row.Category || 'electronics_accessories';
            const platVal = (row.platform || row.Platform || 'both').toLowerCase();
            const imgVal = row.imageUrl || row.image || row.Image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';

            return {
              sku: String(skuVal).trim().toUpperCase(),
              asin: row.asin ? String(row.asin).trim().toUpperCase() : undefined,
              fsn: row.fsn ? String(row.fsn).trim().toUpperCase() : undefined,
              name: String(nameVal).trim(),
              category: catVal,
              imageUrl: imgVal,
              costPrice: costVal,
              sellingPrice: sellVal,
              weightGrams: Number(row.weightGrams || 350),
              stock: stockVal,
              platform: platVal === 'amazon' ? 'amazon' : platVal === 'flipkart' ? 'flipkart' : 'both',
              status: stockVal > 0 ? 'active' : 'out_of_stock',
              estimatedMarginPercent: Math.round(((sellVal - costVal) / sellVal) * 100 * 0.75),
            };
          });

          const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formattedList),
          });

          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.error || 'Bulk upload failed');

          setIsProcessingBulk(false);
          setIsBulkModalOpen(false);
          setBulkFile(null);
          setBulkPreviewData([]);
          showNotification(`Successfully imported ${formattedList.length} products to MongoDB catalog!`);
          await fetchProducts();
        } catch (err: any) {
          setIsProcessingBulk(false);
          setBulkError('Error during upload: ' + err.message);
        }
      };
      reader.readAsBinaryString(bulkFile);
    } catch (e: any) {
      setIsProcessingBulk(false);
      setBulkError(e.message);
    }
  };

  const handleExportCatalog = () => {
    const dataToExport = filteredProducts.map(p => ({
      'SKU': p.sku,
      'Product Name': p.name,
      'Platform': p.platform.toUpperCase(),
      'Category': p.category,
      'ASIN': p.asin || '',
      'FSN': p.fsn || '',
      'Cost Price (INR)': p.costPrice,
      'Selling Price (INR)': p.sellingPrice,
      'Stock': p.stock,
      'Status': p.status,
      'Est Margin %': p.estimatedMarginPercent,
      'Image URL': p.imageUrl,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ProductCatalog');
    XLSX.writeFile(wb, `EcomUnified_Products_${new Date().toISOString().split('T')[0]}.xlsx`);
    showNotification('Catalog exported to Excel successfully.');
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        sku: 'SAMPLE-SKU-001',
        name: 'Wireless Bluetooth Earbuds Pro',
        category: 'electronics_accessories',
        platform: 'both',
        asin: 'B09G9F5V4G',
        fsn: 'FSNBTPRO99',
        costPrice: 450,
        sellingPrice: 1299,
        weightGrams: 200,
        stock: 100,
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60',
      },
      {
        sku: 'SAMPLE-SKU-002',
        name: 'Stainless Steel Insulated Water Bottle 1L',
        category: 'home_kitchen',
        platform: 'amazon',
        asin: 'B08H7K2M9N',
        fsn: '',
        costPrice: 280,
        sellingPrice: 799,
        weightGrams: 450,
        stock: 75,
        imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'EcomUnified_Product_Upload_Template.xlsx');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header & Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Product Catalog & Media Store
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                  <Database className="h-3 w-3" />
                  <span>MongoDB Live</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30">
                  <CloudLightning className="h-3 w-3" />
                  <span>Cloudinary CDN</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Direct MongoDB CRUD operations, Cloudinary image hosting, and SKU/Name/ASIN/FSN filtering
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchProducts}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
            title="Refresh database"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            <span>Sync DB</span>
          </button>

          <button
            onClick={handleExportCatalog}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-all"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Bulk Import</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-500/25 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={cn(
          'p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-fade-in border shadow-xs',
          notification.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
            : 'bg-rose-50 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'
        )}>
          {notification.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Products</span>
            <Package className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{stats.total}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Stored in MongoDB database</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Listings</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">{stats.active}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">In stock & ready to ship</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Out of Stock</span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1.5">{stats.outOfStock}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Needs inventory restock</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Avg Profit Margin</span>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1.5">{stats.avgMargin}%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Post platform deductions</p>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Main Search Bar with Search Field Mode Selector */}
          <div className="flex items-center gap-2 flex-1 max-w-2xl">
            {/* Search Target Mode Dropdown */}
            <div className="relative shrink-0">
              <select
                value={searchMode}
                onChange={(e) => setSearchMode(e.target.value as any)}
                className="h-10 pl-3 pr-7 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="all">Search All</option>
                <option value="name">Product Name</option>
                <option value="sku">SKU Code</option>
                <option value="asin">Amazon ASIN</option>
                <option value="fsn">Flipkart FSN</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Main Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  searchMode === 'sku' ? 'Search by exact or partial SKU (e.g. MOU-ERGO-01)...' :
                  searchMode === 'asin' ? 'Search by Amazon ASIN (e.g. B09G9F5V4G)...' :
                  searchMode === 'fsn' ? 'Search by Flipkart FSN (e.g. FSNBTPRO99)...' :
                  searchMode === 'name' ? 'Search by Product Name / Keyword...' :
                  'Search across Title, SKU, ASIN, or FSN...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-10 pr-9 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Advanced Filters Toggle Button */}
            <button
              onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
              className={cn(
                'h-10 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all shrink-0',
                isAdvancedFilterOpen || activeFilterCount > 0
                  ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-300 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-indigo-600 text-white">
                  {activeFilterCount}
                </span>
              )}
              {isAdvancedFilterOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Platform Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
              <button
                onClick={() => setPlatformFilter('all')}
                className={cn('px-2.5 py-1.5 font-bold rounded-lg transition-all', platformFilter === 'all' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-500')}
              >
                All
              </button>
              <button
                onClick={() => setPlatformFilter('amazon')}
                className={cn('px-2.5 py-1.5 font-bold rounded-lg transition-all', platformFilter === 'amazon' ? 'bg-[#FF9900] text-slate-950 shadow-xs' : 'text-slate-500')}
              >
                Amazon
              </button>
              <button
                onClick={() => setPlatformFilter('flipkart')}
                className={cn('px-2.5 py-1.5 font-bold rounded-lg transition-all', platformFilter === 'flipkart' ? 'bg-[#2874F0] text-white shadow-xs' : 'text-slate-500')}
              >
                Flipkart
              </button>
              <button
                onClick={() => setPlatformFilter('both')}
                className={cn('px-2.5 py-1.5 font-bold rounded-lg transition-all', platformFilter === 'both' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500')}
              >
                Dual Channel
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <button
                onClick={() => setViewMode('table')}
                className={cn('p-1.5 rounded-lg transition-all', viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-400')}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn('p-1.5 rounded-lg transition-all', viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-400')}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Filters Panel */}
        {isAdvancedFilterOpen && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-500" />
                <span>Advanced Attribute & Identifier Filters</span>
              </span>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset All Filters</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Filter by SKU */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 text-[11px]">
                  <Barcode className="h-3.5 w-3.5 text-indigo-500" />
                  <span>SKU Code Filter</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter by SKU (e.g. SKU-001)..."
                    value={skuFilter}
                    onChange={(e) => setSkuFilter(e.target.value)}
                    className="w-full h-8.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                  {skuFilter && (
                    <button
                      onClick={() => setSkuFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter by Product Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 text-[11px]">
                  <Tag className="h-3.5 w-3.5 text-purple-500" />
                  <span>Product Name Filter</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter by Name keywords..."
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="w-full h-8.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                  />
                  {nameFilter && (
                    <button
                      onClick={() => setNameFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter by Amazon ASIN */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 text-[11px]">
                  <Hash className="h-3.5 w-3.5 text-amber-500" />
                  <span>Amazon ASIN Filter</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter by ASIN (e.g. B09...)..."
                    value={asinFilter}
                    onChange={(e) => setAsinFilter(e.target.value)}
                    className="w-full h-8.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-amber-500 focus:outline-none font-mono"
                  />
                  {asinFilter && (
                    <button
                      onClick={() => setAsinFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter by Flipkart FSN */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 text-[11px]">
                  <Hash className="h-3.5 w-3.5 text-blue-500" />
                  <span>Flipkart FSN Filter</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter by FSN (e.g. FSN...)..."
                    value={fsnFilter}
                    onChange={(e) => setFsnFilter(e.target.value)}
                    className="w-full h-8.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none font-mono"
                  />
                  {fsnFilter && (
                    <button
                      onClick={() => setFsnFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Second row of filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              {/* Category Filter */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400 text-[11px]">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full h-8.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none font-medium cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(AMAZON_CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>{v.name}</option>
                  ))}
                </select>
              </div>

              {/* Stock Status Filter */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400 text-[11px]">Stock Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full h-8.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none font-medium cursor-pointer"
                >
                  <option value="all">All Inventory Levels</option>
                  <option value="active">In Stock (&gt; 0 units)</option>
                  <option value="low_stock">Low Stock (1 - 20 units)</option>
                  <option value="out_of_stock">Out of Stock (0 units)</option>
                </select>
              </div>

              {/* Margin Filter */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 dark:text-slate-400 text-[11px]">Profit Margin Tier</label>
                <select
                  value={marginFilter}
                  onChange={(e) => setMarginFilter(e.target.value as any)}
                  className="w-full h-8.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none font-medium cursor-pointer"
                >
                  <option value="all">All Margin Ranges</option>
                  <option value="high">High Margin (&ge; 25%)</option>
                  <option value="moderate">Moderate Margin (10% - 25%)</option>
                  <option value="low">Low / Negative Margin (&lt; 10%)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Badges Bar */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
            <span className="text-[11px] font-bold text-slate-400">Active Filters:</span>

            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                <span>Search ({searchMode}): "{searchTerm}"</span>
                <button onClick={() => setSearchTerm('')} className="hover:text-indigo-900"><X className="h-3 w-3" /></button>
              </span>
            )}

            {skuFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-mono">
                <span>SKU: {skuFilter}</span>
                <button onClick={() => setSkuFilter('')} className="hover:text-indigo-900"><X className="h-3 w-3" /></button>
              </span>
            )}

            {nameFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                <span>Name: {nameFilter}</span>
                <button onClick={() => setNameFilter('')} className="hover:text-purple-900"><X className="h-3 w-3" /></button>
              </span>
            )}

            {asinFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-mono">
                <span>ASIN: {asinFilter}</span>
                <button onClick={() => setAsinFilter('')} className="hover:text-amber-900"><X className="h-3 w-3" /></button>
              </span>
            )}

            {fsnFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 font-mono">
                <span>FSN: {fsnFilter}</span>
                <button onClick={() => setFsnFilter('')} className="hover:text-blue-900"><X className="h-3 w-3" /></button>
              </span>
            )}

            {platformFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                <span>Platform: {platformFilter.toUpperCase()}</span>
                <button onClick={() => setPlatformFilter('all')}><X className="h-3 w-3" /></button>
              </span>
            )}

            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 capitalize">
                <span>Status: {statusFilter.replace('_', ' ')}</span>
                <button onClick={() => setStatusFilter('all')}><X className="h-3 w-3" /></button>
              </span>
            )}

            {categoryFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 capitalize">
                <span>Category: {categoryFilter.replace('_', ' ')}</span>
                <button onClick={() => setCategoryFilter('all')}><X className="h-3 w-3" /></button>
              </span>
            )}

            {marginFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 capitalize">
                <span>Margin: {marginFilter}</span>
                <button onClick={() => setMarginFilter('all')}><X className="h-3 w-3" /></button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline ml-auto"
            >
              Clear All ({activeFilterCount})
            </button>
          </div>
        )}

        {/* Filter Results Counter */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredProducts.length}</strong> of <strong className="text-slate-800 dark:text-slate-200">{productsList.length}</strong> listings
          </span>
          <span className="text-[10px] text-slate-400">
            {dataSource === 'mongodb' ? '✓ Synced with MongoDB' : '• Local Memory Catalog'}
          </span>
        </div>
      </div>

      {/* Catalog Display */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70">
          <Loader2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading products from MongoDB...</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Identifiers (SKU / ASIN / FSN)</th>
                  <th className="py-3.5 px-4">Platform</th>
                  <th className="py-3.5 px-4 text-right">Cost Price</th>
                  <th className="py-3.5 px-4 text-right">Selling Price</th>
                  <th className="py-3.5 px-4 text-right">Est Margin</th>
                  <th className="py-3.5 px-4 text-center">Stock</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900/40">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-14 text-center text-slate-500">
                      <Package className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No products matching the active filters</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Try adjusting your SKU, Name, ASIN, or category filters or click "Reset All Filters".
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition-colors text-xs"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Clear All Filters</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1 max-w-xs">{p.name}</p>
                            <span className="text-[10px] font-semibold text-slate-500 capitalize">{p.category?.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] space-y-0.5">
                        <div className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                          <Barcode className="h-3 w-3 shrink-0" />
                          <span>SKU: {p.sku}</span>
                        </div>
                        {p.asin && (
                          <div className="text-amber-600 dark:text-amber-400 text-[10px] flex items-center gap-1">
                            <span className="font-bold">ASIN:</span>
                            <span>{p.asin}</span>
                          </div>
                        )}
                        {p.fsn && (
                          <div className="text-blue-600 dark:text-blue-400 text-[10px] flex items-center gap-1">
                            <span className="font-bold">FSN:</span>
                            <span>{p.fsn}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {p.platform === 'amazon' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30">
                            Amazon
                          </span>
                        )}
                        {p.platform === 'flipkart' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2874F0]/15 text-[#2874F0] border border-[#2874F0]/30">
                            Flipkart
                          </span>
                        )}
                        {p.platform === 'both' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30">
                            Amazon + Flipkart
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-slate-600 dark:text-slate-400">
                        {formatINR(p.costPrice)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                        {formatINR(p.sellingPrice)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black',
                          p.estimatedMarginPercent >= 20 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' :
                          p.estimatedMarginPercent >= 10 ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' :
                          'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                        )}>
                          {p.estimatedMarginPercent}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => handleUpdateStock(p.id, p.stock, -5)}
                            className="h-5 w-5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300"
                            title="Decrease 5"
                          >
                            -
                          </button>
                          <span className={cn(
                            'font-black text-xs min-w-[2rem]',
                            p.stock === 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'
                          )}>
                            {p.stock}
                          </span>
                          <button
                            onClick={() => handleUpdateStock(p.id, p.stock, 5)}
                            className="h-5 w-5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300"
                            title="Add 5"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-colors"
                            title="Edit Listing in MongoDB"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition-colors"
                            title="Delete from MongoDB"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 border border-dashed rounded-2xl border-slate-300 dark:border-slate-800">
              <Package className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="font-bold text-slate-800 dark:text-slate-200">No products match current filter settings</p>
              <button
                onClick={handleResetFilters}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 text-xs shadow-md"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            filteredProducts.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      {p.platform === 'amazon' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9900] text-slate-950 shadow-xs">
                          Amazon
                        </span>
                      )}
                      {p.platform === 'flipkart' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2874F0] text-white shadow-xs">
                          Flipkart
                        </span>
                      )}
                      {p.platform === 'both' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white shadow-xs">
                          Amazon + Flipkart
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-black backdrop-blur-md shadow-xs',
                        p.estimatedMarginPercent >= 20 ? 'bg-emerald-500/90 text-white' :
                        p.estimatedMarginPercent >= 10 ? 'bg-amber-500/90 text-white' :
                        'bg-rose-500/90 text-white'
                      )}>
                        {p.estimatedMarginPercent}% Margin
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 capitalize">
                        {p.category?.replace('_', ' ')}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 text-sm leading-snug">
                        {p.name}
                      </h3>
                    </div>

                    <div className="font-mono text-[10px] text-slate-500 space-y-1 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1">
                        <Barcode className="h-3 w-3 text-indigo-500 shrink-0" />
                        <span>SKU: <strong className="text-slate-800 dark:text-slate-200">{p.sku}</strong></span>
                      </div>
                      {p.asin && (
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <span className="font-bold">ASIN:</span>
                          <span>{p.asin}</span>
                        </div>
                      )}
                      {p.fsn && (
                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <span className="font-bold">FSN:</span>
                          <span>{p.fsn}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400">Cost</span>
                        <p className="font-semibold text-slate-600 dark:text-slate-400 text-xs">{formatINR(p.costPrice)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400">Selling Price</span>
                        <p className="font-black text-slate-900 dark:text-white text-sm">{formatINR(p.sellingPrice)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">Stock:</span>
                    <span className={cn('font-bold text-xs', p.stock === 0 ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200')}>
                      {p.stock} units
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Single Product Add / Edit Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={editingProduct ? "Edit Product Listing (MongoDB)" : "Add Product to MongoDB & Cloudinary"}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
            {/* Cloudinary Image Uploader Component */}
            <ImageUpload
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
              label="Product Photo (Cloudinary CDN)"
              helperText="Upload image to Cloudinary store with auto CDN optimization for Amazon & Flipkart"
            />

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Product Title / Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Ergonomic Bluetooth Wireless Mouse (RGB Backlit)"
                className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Platform Channel</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none font-semibold"
                >
                  <option value="both">Amazon + Flipkart (Dual)</option>
                  <option value="amazon">Amazon Only</option>
                  <option value="flipkart">Flipkart Only</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none font-medium"
                >
                  {Object.entries(AMAZON_CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">SKU Code *</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                  placeholder="e.g. MOU-ERGO-01"
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none font-mono font-bold uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Amazon ASIN (Optional)</label>
                <input
                  type="text"
                  value={asin}
                  onChange={(e) => setAsin(e.target.value)}
                  placeholder="e.g. B09G9F5V4G"
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#FF9900] focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Flipkart FSN (Optional)</label>
                <input
                  type="text"
                  value={fsn}
                  onChange={(e) => setFsn(e.target.value)}
                  placeholder="e.g. FSNMOU998822"
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Cost Price (₹) *</label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  required
                  min={1}
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Selling Price (₹) *</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  required
                  min={1}
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Weight (grams)</label>
                <input
                  type="number"
                  value={weightGrams}
                  onChange={(e) => setWeightGrams(Number(e.target.value))}
                  min={10}
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Stock Qty *</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  required
                  min={0}
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none font-bold"
                />
              </div>
            </div>

            {/* Live Fee & Profit Preview Bar */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Real-Time Profitability Projection</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                {(platform === 'amazon' || platform === 'both') && feeEstimates.amazonRes && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-500/30 space-y-1">
                    <div className="flex items-center justify-between font-bold text-amber-700 dark:text-amber-400">
                      <span>Amazon Net Profit</span>
                      <span>{formatINR(feeEstimates.amazonRes.netProfit)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>Amazon Total Fees:</span>
                      <span>{formatINR(feeEstimates.amazonRes.totalAmazonFees)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>Estimated Margin:</span>
                      <span className="font-black text-amber-600">{feeEstimates.amazonRes.profitMarginPercent}%</span>
                    </div>
                  </div>
                )}

                {(platform === 'flipkart' || platform === 'both') && feeEstimates.flipkartRes && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-500/30 space-y-1">
                    <div className="flex items-center justify-between font-bold text-blue-700 dark:text-blue-400">
                      <span>Flipkart Net Profit</span>
                      <span>{formatINR(feeEstimates.flipkartRes.netProfit)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>Flipkart Total Fees:</span>
                      <span>{formatINR(feeEstimates.flipkartRes.totalFlipkartFees)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>Estimated Margin:</span>
                      <span className="font-black text-blue-600">{feeEstimates.flipkartRes.profitMarginPercent}%</span>
                    </div>
                  </div>
                )}
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
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-md shadow-indigo-500/25 transition-all flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{editingProduct ? "Update MongoDB" : "Save to MongoDB"}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bulk CSV / Excel Import Modal */}
      {isBulkModalOpen && (
        <Modal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          title="Bulk Upload Products to MongoDB via CSV / Excel"
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Download Sample Spreadsheet</p>
                <p className="text-[11px] text-slate-500">Includes required header columns and example product data</p>
              </div>
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Get Template (.xlsx)</span>
              </button>
            </div>

            {bulkError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{bulkError}</span>
              </div>
            )}

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/30 transition-all"
            >
              <Upload className="h-8 w-8 mx-auto text-indigo-500 mb-2" />
              <p className="font-bold text-slate-900 dark:text-white">
                {bulkFile ? bulkFile.name : "Click to select CSV or XLSX file"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {bulkFile ? `${(bulkFile.size / 1024).toFixed(1)} KB` : "Supports Excel (.xlsx, .xls) and CSV (.csv)"}
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleBulkFileChange}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />
            </div>

            {/* Parsed Preview Table */}
            {bulkPreviewData.length > 0 && (
              <div className="space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">
                  Preview ({bulkPreviewData.length} records detected)
                </p>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 dark:bg-slate-950 font-bold text-slate-600 dark:text-slate-400">
                      <tr>
                        <th className="p-2">SKU</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Cost</th>
                        <th className="p-2">Selling</th>
                        <th className="p-2">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {bulkPreviewData.map((row, i) => (
                        <tr key={i}>
                          <td className="p-2 font-mono">{row.sku || row.SKU || '-'}</td>
                          <td className="p-2 line-clamp-1">{row.name || row.Name || row.title || '-'}</td>
                          <td className="p-2">{row.costPrice || row.cost || '-'}</td>
                          <td className="p-2">{row.sellingPrice || row.price || '-'}</td>
                          <td className="p-2">{row.stock || row.quantity || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessBulkUpload}
                disabled={!bulkFile || isProcessingBulk}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                {isProcessingBulk && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Save All to MongoDB</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
