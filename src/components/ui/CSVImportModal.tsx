'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Loader2,
  Table as TableIcon
} from 'lucide-react';
import { Modal } from './Modal';
import { parseOrderFile, convertRowsToOrderItems, ParsedOrderRow, generateSampleCsv } from '@/lib/csvParser';
import { formatINR } from '@/lib/utils';
import globalStore from '@/lib/store';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: 'amazon' | 'flipkart';
  onImportComplete: (count: number) => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  platform,
  onImportComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedOrderRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError(null);
    setIsParsing(true);

    try {
      const rows = await parseOrderFile(selected);
      if (rows.length === 0) {
        setError('No valid order rows found in the uploaded file.');
      } else {
        setParsedRows(rows);
      }
    } catch (err: any) {
      setError(`Failed to parse file: ${err.message || 'Invalid format'}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvData = generateSampleCsv(platform);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${platform}_orders_sample_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0) return;

    const orderItems = convertRowsToOrderItems(parsedRows, platform);
    orderItems.forEach(item => globalStore.addOrder(item));

    onImportComplete(orderItems.length);
    onClose();
    // Reset state
    setFile(null);
    setParsedRows([]);
  };

  const handleClear = () => {
    setFile(null);
    setParsedRows([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Import ${platform === 'amazon' ? 'Amazon' : 'Flipkart'} Orders (CSV / Excel)`}
      subtitle="Upload your marketplace settlement or orders sheet. Automatically calculates referral, closing, shipping fees & net profits."
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs">
        {/* Template Download Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div>
            <div className="font-bold text-slate-900 dark:text-white">Need a reference format?</div>
            <div className="text-slate-600 dark:text-slate-400 text-[11px]">Download our pre-formatted CSV template with standard column headers</div>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-blue-400 font-semibold border border-indigo-200 dark:border-blue-500/30 transition-colors self-start sm:self-auto shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Sample CSV</span>
          </button>
        </div>

        {/* Upload Dropzone */}
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-blue-500/60 rounded-2xl p-8 text-center bg-slate-50/70 dark:bg-slate-950/60 hover:bg-slate-100/70 dark:hover:bg-slate-950 cursor-pointer transition-all space-y-3"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv, .xlsx, .xls"
              className="hidden"
            />
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-blue-500/10 text-indigo-600 dark:text-blue-400 border border-indigo-200 dark:border-blue-500/20">
                <Upload className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Click to browse or drag & drop order files</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Supports .CSV, .XLSX, and .XLS files (Any marketplace order export)</p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">{file.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} rows parsed
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-900 transition-colors"
              title="Remove file"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {isParsing && (
          <div className="p-4 text-center text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-blue-400" />
            <span>Parsing Excel / CSV rows and mapping columns...</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <TableIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Preview Data ({parsedRows.length} Orders Ready to Import)</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Showing first 5 rows</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto">
              <table className="w-full text-left text-[11px] text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950 uppercase font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 sticky top-0">
                  <tr>
                    <th className="p-2.5">Order ID</th>
                    <th className="p-2.5">Product</th>
                    <th className="p-2.5">SKU</th>
                    <th className="p-2.5 text-right">Selling Price</th>
                    <th className="p-2.5 text-right">Cost Price</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5">City</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900/50">
                  {parsedRows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white">{row.orderId}</td>
                      <td className="p-2.5 max-w-[140px] truncate">{row.productName}</td>
                      <td className="p-2.5 font-mono">{row.sku}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatINR(row.sellingPrice)}</td>
                      <td className="p-2.5 text-right text-slate-500 dark:text-slate-400">{formatINR(row.costPrice || row.sellingPrice * 0.4)}</td>
                      <td className="p-2.5 text-center capitalize">{row.status || 'Delivered'}</td>
                      <td className="p-2.5 text-slate-500 dark:text-slate-400">{row.buyerCity || 'Mumbai'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExecuteImport}
            disabled={parsedRows.length === 0 || isParsing}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20 disabled:opacity-40 transition-all"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Import {parsedRows.length > 0 ? `${parsedRows.length} Orders` : 'Orders'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
