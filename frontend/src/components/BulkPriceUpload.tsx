import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Download, Loader2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ParsedRow {
  medicineId: string;
  packId: string;
  price: number;
  stockQuantity: number;
  inStock?: boolean;
}

interface UploadReport {
  message: string;
  totalRows: number;
  successCount: number;
  failureCount: number;
  results: Array<{
    medicineId: string;
    packId: string;
    status: 'success' | 'failed';
    message: string;
  }>;
}

export const BulkPriceUpload: React.FC = () => {
  const { currentPharmacy, showToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [report, setReport] = useState<UploadReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleCsvContent = `medicineId,packId,price,stockQuantity
med-1,med-1-pack-10,48.50,150
med-2,med-2-pack-30,34.00,200
med-3,med-3-pack-10,65.00,80
med-4,med-4-pack-15,22.50,300`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'genericMed_inventory_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsv = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must contain a header row and at least one data row.');
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const medIdx = headers.indexOf('medicineid');
    const packIdx = headers.indexOf('packid');
    const priceIdx = headers.indexOf('price');
    const stockIdx = headers.indexOf('stockquantity');

    if (medIdx === -1 || packIdx === -1 || priceIdx === -1 || stockIdx === -1) {
      throw new Error('Required columns: medicineId, packId, price, stockQuantity');
    }

    const rows: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map((c) => c.trim());
      const price = parseFloat(cols[priceIdx]);
      const stockQuantity = parseInt(cols[stockIdx], 10);

      if (isNaN(price) || isNaN(stockQuantity)) {
        throw new Error(`Row ${i + 1} has invalid price or stock value.`);
      }

      rows.push({
        medicineId: cols[medIdx],
        packId: cols[packIdx],
        price,
        stockQuantity,
        inStock: stockQuantity > 0,
      });
    }

    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError(null);
    setReport(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCsv(text);
        setParsedRows(rows);
      } catch (err: any) {
        setError(err.message || 'Failed to parse CSV file.');
        setParsedRows([]);
      }
    };
    reader.readAsText(selected);
  };

  const handleUpload = async () => {
    if (parsedRows.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const res = await fetch('/api/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rows: parsedRows,
          pharmacyId: currentPharmacy?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Bulk upload failed');
      }

      setReport(data);
      showToast('success', 'Bulk Upload Completed', data.message);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      showToast('error', 'Upload Error', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Bulk Catalog Price & Stock Upload</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Update your pharmacy's prices and stock counts across multiple SKUs in a single batch.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition"
        >
          <Download className="h-4 w-4" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {/* Drag & Drop Area */}
      <div className="p-8 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-center bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-emerald-500 transition-colors">
        <UploadCloud className="h-10 w-10 mx-auto text-zinc-400 mb-3" />
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Upload your inventory CSV
        </h4>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          Files must follow the format: <code>medicineId, packId, price, stockQuantity</code>
        </p>

        <label className="mt-4 inline-block">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition inline-block">
            {file ? file.name : 'Select CSV File'}
          </span>
        </label>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-3 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview Table */}
      {parsedRows.length > 0 && !report && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Preview ({parsedRows.length} rows detected)
            </h4>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Updates...</span>
                </>
              ) : (
                <>
                  <span>Apply {parsedRows.length} Updates</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold">
                <tr>
                  <th className="p-3">Medicine ID</th>
                  <th className="p-3">Pack ID</th>
                  <th className="p-3">New Price (₹)</th>
                  <th className="p-3">Stock Quantity</th>
                  <th className="p-3">In Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {parsedRows.slice(0, 8).map((row, i) => (
                  <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                    <td className="p-3 font-mono">{row.medicineId}</td>
                    <td className="p-3 font-mono">{row.packId}</td>
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{row.price.toFixed(2)}
                    </td>
                    <td className="p-3">{row.stockQuantity}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        In Stock
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedRows.length > 8 && (
              <div className="p-2.5 text-center text-[11px] text-zinc-400 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800">
                Showing first 8 of {parsedRows.length} rows
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion Report */}
      {report && (
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Bulk Upload Processed
              </h4>
              <p className="text-xs text-zinc-500">{report.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 text-xs">
              <span className="font-bold text-base block text-emerald-700 dark:text-emerald-300">
                {report.successCount}
              </span>
              <span>Successfully Updated</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs">
              <span className="font-bold text-base block text-zinc-900 dark:text-zinc-100">
                {report.failureCount}
              </span>
              <span>Failed / Skipped</span>
            </div>
          </div>

          <button
            onClick={() => {
              setReport(null);
              setParsedRows([]);
              setFile(null);
            }}
            className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold"
          >
            Upload Another Batch
          </button>
        </div>
      )}
    </div>
  );
};
