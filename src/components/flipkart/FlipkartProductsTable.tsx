'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Package, 
  CheckCircle2, 
  Edit3
} from 'lucide-react';
import { ProductListing } from '@/types';
import globalStore from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { formatINR } from '@/lib/utils';
import { FLIPKART_CATEGORIES, calculateFlipkartFees } from '@/lib/calculators/flipkartFeeEngine';

export const FlipkartProductsTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<'all' | 'name' | 'sku' | 'fsn'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [fsn, setFsn] = useState('');
  const [category, setCategory] = useState('home_kitchen');
  const [costPrice, setCostPrice] = useState(320);
  const [sellingPrice, setSellingPrice] = useState(899);
  const [weightGrams, setWeightGrams] = useState(400);
  const [stock, setStock] = useState(60);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&auto=format&fit=crop&q=60');

  const products = useMemo(() => {
    const all = globalStore.getProducts('flipkart');
    if (!searchTerm.trim()) return all;
    const q = searchTerm.toLowerCase().trim();
    if (searchMode === 'sku') {
      return all.filter(p => p.sku && p.sku.toLowerCase().includes(q));
    }
    if (searchMode === 'fsn') {
      return all.filter(p => p.fsn && p.fsn.toLowerCase().includes(q));
    }
    if (searchMode === 'name') {
      return all.filter(p => p.name && p.name.toLowerCase().includes(q));
    }
    return all.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) || 
      (p.sku && p.sku.toLowerCase().includes(q)) || 
      (p.fsn && p.fsn.toLowerCase().includes(q))
    );
  }, [searchTerm, searchMode, notification]);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const fkCalc = calculateFlipkartFees({
      category,
      costPrice,
      sellingPrice,
      weightGrams,
      shippingTier: 'silver',
      shippingZone: 'national',
      paymentMode: 'prepaid',
    });

    const newProd: ProductListing = {
      id: `prod-fk-${Date.now()}`,
      sku: sku.trim().toUpperCase(),
      fsn: fsn.trim().toUpperCase() || `FSN${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      name: name.trim(),
      category,
      imageUrl,
      costPrice,
      sellingPrice,
      weightGrams,
      stock,
      platform: 'flipkart',
      status: stock > 0 ? 'active' : 'out_of_stock',
      estimatedMarginPercent: fkCalc.profitMarginPercent,
      createdAt: new Date().toISOString(),
    };

    globalStore.addProduct(newProd);
    setIsAddModalOpen(false);
    setNotification(`Product "${newProd.name}" added to Flipkart listings.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateStock = (id: string, currentStock: number, delta: number) => {
    const updated = Math.max(0, currentStock + delta);
    globalStore.updateProduct(id, {
      stock: updated,
      status: updated === 0 ? 'out_of_stock' : 'active',
    });
    setNotification(`Stock updated to ${updated} units.`);
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-[#2874F0]" />
            <span>Flipkart Listed Product Catalog</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Active FSNs, F-Assured stock allocation, and estimated unit margin realization
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2874F0] text-white text-xs font-bold hover:bg-[#2874F0]/90 transition-all shadow-md shadow-[#2874F0]/20 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add New Product</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search and Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <select
              value={searchMode}
              onChange={(e) => setSearchMode(e.target.value as any)}
              className="h-9 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:border-[#2874F0] focus:outline-none cursor-pointer"
            >
              <option value="all">All Fields</option>
              <option value="name">Title / Name</option>
              <option value="sku">SKU Code</option>
              <option value="fsn">Flipkart FSN</option>
            </select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={
                  searchMode === 'fsn' ? 'Search by FSN (e.g. FSN...)...' :
                  searchMode === 'sku' ? 'Search by SKU...' :
                  searchMode === 'name' ? 'Search by Product Title...' :
                  'Search FSN, SKU, Product Title...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-9 pr-8 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#2874F0] focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800 dark:text-slate-200">{products.length}</strong> Flipkart listings
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-4">FSN & SKU</th>
                <th className="py-3.5 px-4 text-right">Cost Price</th>
                <th className="py-3.5 px-4 text-right">Selling Price</th>
                <th className="py-3.5 px-4 text-right">Estimated Margin</th>
                <th className="py-3.5 px-4 text-center">F-Assured Stock</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900/40">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No Flipkart product listings in catalog</p>
                      <p className="text-xs text-slate-500">
                        Add your first FSN listing or analyze a product in the AI Dossier to automatically push to inventory.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="h-10 w-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0 bg-slate-100"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{prod.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{prod.category.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-[#2874F0]">{prod.fsn || 'FSN-ACTIVE'}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">SKU: {prod.sku}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-semibold text-slate-500 dark:text-slate-400">
                      {formatINR(prod.costPrice)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatINR(prod.sellingPrice)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                        {prod.estimatedMarginPercent}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        <button
                          onClick={() => handleUpdateStock(prod.id, prod.stock, -5)}
                          className="h-5 w-5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs border border-slate-200 dark:border-transparent"
                        >
                          -
                        </button>
                        <span className="font-bold text-slate-900 dark:text-white w-8 text-center">{prod.stock}</span>
                        <button
                          onClick={() => handleUpdateStock(prod.id, prod.stock, 5)}
                          className="h-5 w-5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs border border-slate-200 dark:border-transparent"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        prod.stock > 0
                          ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                      }`}>
                        {prod.stock > 0 ? 'Active' : 'Out of Stock'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Flipkart Product Listing"
          subtitle="Configure FSN, SKU, and target pricing"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Product Title</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Memory Foam Orthopedic Pillow"
                className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">SKU Code</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                  placeholder="e.g. PILW-ORTHO-01"
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Flipkart FSN</label>
                <input
                  type="text"
                  value={fsn}
                  onChange={(e) => setFsn(e.target.value)}
                  placeholder="e.g. FSNPLW12345"
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
              >
                {Object.entries(FLIPKART_CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.name}</option>
                ))}
              </select>
            </div>

            <ImageUpload
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
              label="Flipkart Product Image (Cloudinary)"
              helperText="Upload image for Flipkart listing. Stored and optimized via Cloudinary CDN."
            />

            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Cost (₹)</label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  required
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Selling (₹)</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  required
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Weight (g)</label>
                <input
                  type="number"
                  value={weightGrams}
                  onChange={(e) => setWeightGrams(Number(e.target.value))}
                  required
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Stock Qty</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  required
                  className="w-full h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-white focus:border-[#2874F0] focus:outline-none"
                />
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
                Create Listing
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
