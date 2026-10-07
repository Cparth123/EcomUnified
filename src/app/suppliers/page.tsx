'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Search,
  Upload,
  FileSpreadsheet,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MapPin,
  Send,
  PhoneCall,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  X,
  FileDown,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SupplierChannel, SupplierProductMapping } from '@/types/supplierSearch';
import * as XLSX from 'xlsx';

export default function SuppliersManagementPage() {
  const [activeTab, setActiveTab] = useState<'channels' | 'mappings' | 'import'>('channels');

  // Channels state
  const [channels, setChannels] = useState<SupplierChannel[]>([]);
  const [channelSearch, setChannelSearch] = useState('');
  const [channelCategoryFilter, setChannelCategoryFilter] = useState('all');
  const [isAddChannelModalOpen, setIsAddChannelModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<SupplierChannel | null>(null);

  // Mappings state
  const [mappings, setMappings] = useState<SupplierProductMapping[]>([]);
  const [mappingSearch, setMappingSearch] = useState('');
  const [isAddMappingModalOpen, setIsAddMappingModalOpen] = useState(false);

  // Import state
  const [importRows, setImportRows] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for Channel Modal
  const [channelForm, setChannelForm] = useState({
    name: '',
    username: '',
    category: 'Mobile Accessories',
    location: 'Surat, Gujarat',
    channelType: 'PUBLIC_CHANNEL' as any,
    keywords: '',
    priority: 8,
    contactNumber: '',
    description: '',
    isActive: true,
  });

  // Form state for Mapping Modal
  const [mappingForm, setMappingForm] = useState({
    productName: '',
    supplierChannelUsername: '',
    category: 'Mobile Accessories',
    keywords: '',
    priority: 8,
  });

  const fetchData = async () => {
    try {
      const [chanRes, mapRes] = await Promise.all([
        fetch('/api/suppliers'),
        fetch('/api/suppliers/mappings'),
      ]);
      const chanData = await chanRes.json();
      const mapData = await mapRes.json();

      if (chanData.success) setChannels(chanData.suppliers || []);
      if (mapData.success) setMappings(mapData.mappings || []);
    } catch (err) {
      console.error('Failed to load supplier data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...channelForm,
        keywords: channelForm.keywords.split(',').map(k => k.trim()).filter(Boolean),
      };

      if (editingChannel) {
        await fetch(`/api/suppliers/${editingChannel.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setIsAddChannelModalOpen(false);
      setEditingChannel(null);
      setChannelForm({
        name: '',
        username: '',
        category: 'Mobile Accessories',
        location: 'Surat, Gujarat',
        channelType: 'PUBLIC_CHANNEL',
        keywords: '',
        priority: 8,
        contactNumber: '',
        description: '',
        isActive: true,
      });
      fetchData();
    } catch (err) {
      console.error('Error saving channel:', err);
    }
  };

  const handleDeleteChannel = async (id: string) => {
    if (!confirm('Are you sure you want to remove this supplier channel?')) return;
    try {
      await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Error deleting channel:', err);
    }
  };

  const handleSaveMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/suppliers/mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mappingForm),
      });
      setIsAddMappingModalOpen(false);
      setMappingForm({
        productName: '',
        supplierChannelUsername: '',
        category: 'Mobile Accessories',
        keywords: '',
        priority: 8,
      });
      fetchData();
    } catch (err) {
      console.error('Error adding mapping:', err);
    }
  };

  const handleDeleteMapping = async (id: string) => {
    try {
      await fetch(`/api/suppliers/mappings?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Error deleting mapping:', err);
    }
  };

  // Excel / CSV File Parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsedRows: any[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

        const mapped = parsedRows.map((r, i) => {
          const productName = r['product_name'] || r['Product Name'] || r['product'] || '';
          const channel = r['telegram_channel'] || r['telegram_username'] || r['Telegram Channel'] || '';
          const keywords = r['keywords'] || r['Keywords'] || '';
          const category = r['category'] || r['Category'] || 'General';
          const priority = parseInt(r['priority'] || '5', 10) || 5;

          const isValid = Boolean(productName && channel);
          return {
            rowNumber: i + 2,
            productName,
            telegramChannel: channel.startsWith('@') ? channel : channel ? `@${channel}` : '',
            keywords,
            category,
            priority,
            isValid,
            errors: !productName ? ['Missing product name'] : !channel ? ['Missing Telegram channel'] : [],
          };
        });

        setImportRows(mapped);
      } catch (err: any) {
        setImportError(`Failed to parse file: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExecuteImport = async () => {
    if (importRows.length === 0) return;
    setIsImporting(true);
    setImportError(null);
    try {
      const res = await fetch('/api/suppliers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: importRows }),
      });
      const data = await res.json();
      if (data.success) {
        setImportSuccessMessage(`Successfully imported ${data.importedCount} supplier mappings.`);
        setImportRows([]);
        fetchData();
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setImportError(data.error || 'Import failed.');
      }
    } catch (err: any) {
      setImportError(err.message || 'Failed to import mappings.');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        product_name: 'iPhone 15 Transparent Cover',
        telegram_channel: '@mobile_wholesale',
        keywords: 'iPhone 15, transparent cover, tpu case',
        category: 'Mobile Accessories',
        priority: 10,
      },
      {
        product_name: 'Samsung S24 Ultra Matte Armor Case',
        telegram_channel: '@surat_mobile',
        keywords: 's24 ultra, matte case, bumper cover',
        category: 'Mobile Accessories',
        priority: 9,
      },
      {
        product_name: '9D Full Curved Tempered Glass',
        telegram_channel: '@iphone_accessories',
        keywords: 'tempered glass, 9D glass, screen protector',
        category: 'Screen Protectors',
        priority: 8,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SupplierMappings');
    XLSX.writeFile(wb, 'Supplier_Mapping_Sample.xlsx');
  };

  const filteredChannels = channels.filter(c => {
    const matchesSearch =
      !channelSearch ||
      c.name.toLowerCase().includes(channelSearch.toLowerCase()) ||
      c.username.toLowerCase().includes(channelSearch.toLowerCase()) ||
      c.location.toLowerCase().includes(channelSearch.toLowerCase());
    const matchesCategory =
      channelCategoryFilter === 'all' ||
      c.category.toLowerCase().includes(channelCategoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const filteredMappings = mappings.filter(m => {
    return (
      !mappingSearch ||
      m.productName.toLowerCase().includes(mappingSearch.toLowerCase()) ||
      m.supplierChannelUsername.toLowerCase().includes(mappingSearch.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-3 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-2">
            <Layers className="h-3.5 w-3.5" />
            <span>Wholesale Database & Mapping Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Supplier Channel Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure Telegram supplier channels, map specific Amazon products to top wholesale groups, or bulk import via Excel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
          >
            <Search className="h-4 w-4" /> Run Sourcing Search
          </Link>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('channels')}
          className={cn(
            'flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-all',
            activeTab === 'channels'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          )}
        >
          <Layers className="h-4 w-4" />
          <span>Supplier Channels ({channels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mappings')}
          className={cn(
            'flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-all',
            activeTab === 'mappings'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          )}
        >
          <Sparkles className="h-4 w-4" />
          <span>Product → Channel Mappings ({mappings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={cn(
            'flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-all',
            activeTab === 'import'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          )}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Excel / CSV Bulk Import</span>
        </button>
      </div>

      {/* TAB 1: SUPPLIER CHANNELS */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  placeholder="Search channels, @usernames, locations..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>

              <select
                value={channelCategoryFilter}
                onChange={(e) => setChannelCategoryFilter(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none shadow-sm"
              >
                <option value="all">All Categories</option>
                <option value="Mobile Accessories">Mobile Accessories</option>
                <option value="Electronics">Electronics & Cables</option>
                <option value="Screen Protectors">Screen Protectors</option>
                <option value="Audio">Audio & TWS</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEditingChannel(null);
                setChannelForm({
                  name: '',
                  username: '',
                  category: 'Mobile Accessories',
                  location: 'Surat, Gujarat',
                  channelType: 'PUBLIC_CHANNEL',
                  keywords: '',
                  priority: 8,
                  contactNumber: '',
                  description: '',
                  isActive: true,
                });
                setIsAddChannelModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Telegram Channel
            </button>
          </div>

          {/* Channels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredChannels.map((channel) => (
              <div
                key={channel.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {channel.name}
                      </h3>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {channel.username}
                      </span>
                    </div>

                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                        channel.isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      )}
                    >
                      {channel.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {channel.description || 'Wholesale supplier channel with regular stock updates.'}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {channel.keywords.slice(0, 4).map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> {channel.location}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://t.me/${channel.username.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                      title="Open Telegram"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => {
                        setEditingChannel(channel);
                        setChannelForm({
                          name: channel.name,
                          username: channel.username,
                          category: channel.category,
                          location: channel.location,
                          channelType: channel.channelType,
                          keywords: channel.keywords.join(', '),
                          priority: channel.priority,
                          contactNumber: channel.contactNumber || '',
                          description: channel.description || '',
                          isActive: channel.isActive,
                        });
                        setIsAddChannelModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteChannel(channel.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT MAPPINGS */}
      {activeTab === 'mappings' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={mappingSearch}
                onChange={(e) => setMappingSearch(e.target.value)}
                placeholder="Search mapped products or channels..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>

            <button
              onClick={() => setIsAddMappingModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Product Mapping
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Amazon Product Name</th>
                  <th className="px-5 py-3.5">Mapped Telegram Channel</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Keywords</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredMappings.map((map) => (
                  <tr key={map.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      {map.productName}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">
                        <Send className="h-3 w-3" /> {map.supplierChannelUsername}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{map.category}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {map.keywords.map((k, i) => (
                          <span key={i} className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-slate-400">
                            {k}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{map.priority}/10</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDeleteMapping(map.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EXCEL / CSV BULK IMPORT */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Bulk Upload Supplier Mappings (Excel / CSV)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Upload an Excel spreadsheet containing your known products and corresponding Telegram channels.
                </p>
              </div>

              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <FileDown className="h-4 w-4 text-indigo-500" /> Download Sample .XLSX Template
              </button>
            </div>

            {importSuccessMessage && (
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{importSuccessMessage}</span>
              </div>
            )}

            {importError && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-4 text-xs font-bold text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {/* Drag and Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 p-10 text-center hover:border-indigo-500 hover:bg-indigo-50/20 cursor-pointer transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-3 shadow-inner">
                <FileSpreadsheet className="h-7 w-7" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Select or Drop Excel (.XLSX) or CSV File Here
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Columns: <code className="text-indigo-600 font-mono">product_name, telegram_channel, keywords, category, priority</code>
              </p>
            </div>

            {/* Parsed Rows Preview Table */}
            {importRows.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Previewing {importRows.length} Rows (Ready to Import)
                  </span>

                  <button
                    onClick={handleExecuteImport}
                    disabled={isImporting}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50 transition-all"
                  >
                    {isImporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <span>Confirm & Import Mappings</span>
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 sticky top-0 font-bold">
                      <tr>
                        <th className="px-4 py-2.5">Row</th>
                        <th className="px-4 py-2.5">Product Name</th>
                        <th className="px-4 py-2.5">Telegram Channel</th>
                        <th className="px-4 py-2.5">Category</th>
                        <th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {importRows.map((r, i) => (
                        <tr key={i} className={cn(r.isValid ? 'bg-white dark:bg-slate-900' : 'bg-red-50/50 dark:bg-red-950/20')}>
                          <td className="px-4 py-2 text-slate-400">#{r.rowNumber}</td>
                          <td className="px-4 py-2 font-bold text-slate-800 dark:text-slate-200">{r.productName}</td>
                          <td className="px-4 py-2 text-indigo-600 dark:text-indigo-400">{r.telegramChannel}</td>
                          <td className="px-4 py-2 text-slate-500">{r.category}</td>
                          <td className="px-4 py-2">
                            {r.isValid ? (
                              <span className="text-emerald-600 font-bold">Valid</span>
                            ) : (
                              <span className="text-red-500 font-bold">{r.errors.join(', ')}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Channel */}
      {isAddChannelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                {editingChannel ? 'Edit Supplier Channel' : 'Add New Supplier Channel'}
              </h3>
              <button
                onClick={() => setIsAddChannelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChannel} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier / Channel Name *
                </label>
                <input
                  type="text"
                  required
                  value={channelForm.name}
                  onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })}
                  placeholder="e.g. Surat Mobile Wholesale Hub"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Telegram @username *
                  </label>
                  <input
                    type="text"
                    required
                    value={channelForm.username}
                    onChange={(e) => setChannelForm({ ...channelForm, username: e.target.value })}
                    placeholder="@mobile_wholesale"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={channelForm.category}
                    onChange={(e) => setChannelForm({ ...channelForm, category: e.target.value })}
                    placeholder="Mobile Accessories"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={channelForm.location}
                    onChange={(e) => setChannelForm({ ...channelForm, location: e.target.value })}
                    placeholder="Surat, Gujarat"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority (1-10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={channelForm.priority}
                    onChange={(e) => setChannelForm({ ...channelForm, priority: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Wholesale Keywords (Comma separated)
                </label>
                <input
                  type="text"
                  value={channelForm.keywords}
                  onChange={(e) => setChannelForm({ ...channelForm, keywords: e.target.value })}
                  placeholder="mobile cover, iphone cover, tempered glass, tpu case"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
                >
                  Save Channel
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddChannelModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Mapping */}
      {isAddMappingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                Map Product to Telegram Channel
              </h3>
              <button
                onClick={() => setIsAddMappingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMapping} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Amazon Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={mappingForm.productName}
                  onChange={(e) => setMappingForm({ ...mappingForm, productName: e.target.value })}
                  placeholder="e.g. iPhone 15 Transparent Cover"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Telegram @channel Username *
                </label>
                <input
                  type="text"
                  required
                  value={mappingForm.supplierChannelUsername}
                  onChange={(e) => setMappingForm({ ...mappingForm, supplierChannelUsername: e.target.value })}
                  placeholder="@mobile_wholesale"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={mappingForm.category}
                    onChange={(e) => setMappingForm({ ...mappingForm, category: e.target.value })}
                    placeholder="Mobile Accessories"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority (1-10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={mappingForm.priority}
                    onChange={(e) => setMappingForm({ ...mappingForm, priority: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
                >
                  Save Mapping
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddMappingModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
