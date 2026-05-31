// ============================================================
// EcomSathi — Bulk SKU Generator
// ============================================================
import React, { useState, useRef, useCallback, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import { read as xlsxRead, utils as xlsxUtils } from 'xlsx';
import toast from 'react-hot-toast';
import {
  Upload,
  Download,
  Copy,
  Layers,
  FileText,
  ChevronDown,
  X,
  Edit2,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { generateSKU, skuToBarcode } from '../../utils/skuGenerator';
import type { SKUComponent } from '../../types';

// ─── Types ────────────────────────────────────────────────
type Mode = 'form' | 'csv';
type Separator = '-' | '_' | '/';

interface FormFields {
  brand: string;
  category: string;
  color: string;
  size: string;
  separator: Separator;
  startSeq: number;
  count: number;
}

interface GeneratedRow {
  index: number;
  sku: string;
  barcode: string;
  editing: boolean;
  editValue: string;
}

interface CSVRow {
  brand?: string;
  category?: string;
  color?: string;
  size?: string;
  name?: string;
  [key: string]: string | undefined;
}

const DEFAULT_FORM: FormFields = {
  brand: '',
  category: '',
  color: '',
  size: '',
  separator: '-',
  startSeq: 1,
  count: 10,
};

// ─── Mini barcode helper (renders svg → data URL) ─────────
function renderBarcodeDataURL(value: string): string {
  try {
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    JsBarcode(svgEl, value, {
      format: 'CODE128',
      displayValue: false,
      height: 30,
      width: 1.2,
      margin: 2,
    });
    return 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(svgEl));
  } catch {
    return '';
  }
}

// ─── Component ────────────────────────────────────────────
export const BulkSKUGenerator: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<Mode>('form');
  const [form, setForm] = useState<FormFields>(DEFAULT_FORM);
  const [rows, setRows] = useState<GeneratedRow[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // CSV state
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');

  const update = (key: keyof FormFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: key === 'count' || key === 'startSeq' ? Number(e.target.value) : e.target.value }));

  // ── Form Generation ────────────────────────────────────
  const handleFormGenerate = useCallback(async () => {
    setGenerating(true);
    setProgress(0);
    const newRows: GeneratedRow[] = [];
    const count = Math.min(Math.max(form.count, 1), 1000);

    for (let i = 0; i < count; i++) {
      const seq = form.startSeq + i;
      const components: SKUComponent[] = [];
      if (form.brand) components.push({ type: 'brand', value: form.brand });
      if (form.category) components.push({ type: 'category', value: form.category });
      if (form.color) components.push({ type: 'color', value: form.color });
      if (form.size) components.push({ type: 'size', value: form.size });
      components.push({ type: 'sequence', digits: 4, value: String(seq) });

      const sku = generateSKU(components, form.separator);
      const barcode = skuToBarcode(sku);

      newRows.push({ index: i + 1, sku, barcode, editing: false, editValue: sku });

      // Update progress every 50 items
      if (i % 50 === 0) {
        setProgress(Math.round(((i + 1) / count) * 100));
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    setProgress(100);
    setRows(newRows);
    setGenerating(false);
    toast.success(`Generated ${count} SKUs`);
  }, [form]);

  // ── CSV Generation ─────────────────────────────────────
  const handleCSVGenerate = useCallback(async () => {
    if (!csvData.length) { toast.error('Upload a CSV first'); return; }
    setGenerating(true);
    setProgress(0);
    const newRows: GeneratedRow[] = [];

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const brand = (row[columnMap.brand || 'brand'] || '').toUpperCase();
      const cat = (row[columnMap.category || 'category'] || '').toUpperCase();
      const color = (row[columnMap.color || 'color'] || '').toUpperCase();
      const size = (row[columnMap.size || 'size'] || '').toUpperCase();

      const parts: string[] = [];
      if (brand) parts.push(brand.replace(/\s+/g, '').slice(0, 6));
      if (cat) parts.push(cat.replace(/\s+/g, '').slice(0, 6));
      if (color) parts.push(color.replace(/\s+/g, '').slice(0, 3));
      if (size) parts.push(size.replace(/\s+/g, ''));
      parts.push(String(i + 1).padStart(4, '0'));

      const sku = parts.join('-') || `SKU-${String(i + 1).padStart(4, '0')}`;
      const barcode = skuToBarcode(sku);

      newRows.push({ index: i + 1, sku, barcode, editing: false, editValue: sku });

      if (i % 50 === 0) {
        setProgress(Math.round(((i + 1) / csvData.length) * 100));
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    setProgress(100);
    setRows(newRows);
    setGenerating(false);
    toast.success(`Generated ${csvData.length} SKUs from CSV`);
  }, [csvData, columnMap]);

  // ── File Handling ──────────────────────────────────────
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (file.name.endsWith('.csv')) {
          const text = typeof data === 'string' ? data : new TextDecoder().decode(data as ArrayBuffer);
          const lines = text.trim().split('\n');
          const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
          const parsed: CSVRow[] = lines.slice(1).map((line) => {
            const vals = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
            return Object.fromEntries(headers.map((h, i) => [h, vals[i] || '']));
          });
          setCsvHeaders(headers);
          setCsvData(parsed);
          const autoMap: Record<string, string> = {};
          ['brand', 'category', 'color', 'size'].forEach((key) => {
            const match = headers.find((h) => h.toLowerCase().includes(key));
            if (match) autoMap[key] = match;
          });
          setColumnMap(autoMap);
          setCsvFileName(file.name);
          toast.success(`Loaded ${parsed.length} rows`);
        } else {
          // Excel
          const wb = xlsxRead(data, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const jsonData = xlsxUtils.sheet_to_json<CSVRow>(ws);
          if (jsonData.length > 0) {
            const headers = Object.keys(jsonData[0]);
            setCsvHeaders(headers);
            setCsvData(jsonData);
            setCsvFileName(file.name);
            toast.success(`Loaded ${jsonData.length} rows`);
          }
        }
      } catch {
        toast.error('Failed to parse file');
      }
    };
    if (file.name.endsWith('.csv')) reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  // ── Edit Inline ────────────────────────────────────────
  const startEdit = (idx: number) =>
    setRows((prev) => prev.map((r) => (r.index === idx ? { ...r, editing: true, editValue: r.sku } : r)));

  const saveEdit = (idx: number) =>
    setRows((prev) =>
      prev.map((r) =>
        r.index === idx
          ? { ...r, sku: r.editValue, barcode: skuToBarcode(r.editValue), editing: false }
          : r,
      ),
    );

  // ── Export CSV ─────────────────────────────────────────
  const downloadCSV = () => {
    const header = 'Index,SKU,Barcode\n';
    const body = rows.map((r) => `${r.index},${r.sku},${r.barcode}`).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bulk-skus.csv';
    a.click();
    toast.success('CSV downloaded');
  };

  // ── Export PDF ─────────────────────────────────────────
  const downloadPDF = async () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const perRow = 3;
    const labelW = 60;
    const labelH = 30;
    const marginX = 15;
    const marginY = 15;
    const gapX = 5;
    const gapY = 5;

    let col = 0;
    let row = 0;

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (i > 0 && col === 0 && row === 0) doc.addPage();

      const x = marginX + col * (labelW + gapX);
      const y = marginY + row * (labelH + gapY);

      doc.setFontSize(7);
      doc.rect(x, y, labelW, labelH);
      doc.text(r.sku, x + labelW / 2, y + 8, { align: 'center' });
      doc.setFontSize(6);
      doc.text(r.barcode, x + labelW / 2, y + 14, { align: 'center' });

      col++;
      if (col >= perRow) {
        col = 0;
        row++;
        if (row >= 9) {
          row = 0;
          if (i < rows.length - 1) doc.addPage();
        }
      }
    }

    doc.save('bulk-labels.pdf');
    toast.success('PDF downloaded');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
          <Layers className="w-6 h-6 text-[#2563EB]" />
          Bulk SKU Generator
        </h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Generate hundreds of SKUs from a form or CSV upload.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        {(['form', 'csv'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-[6px] text-sm font-medium border transition-colors ${
              mode === m
                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                : 'bg-white text-[#374151] border-[#E2E8F0] hover:border-[#2563EB]'
            }`}
          >
            {m === 'form' ? 'Form Mode' : 'CSV Upload Mode'}
          </button>
        ))}
      </div>

      {/* Form Mode */}
      {mode === 'form' && (
        <Card variant="shadowed" padding="md">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Brand" placeholder="NIKE" value={form.brand} onChange={update('brand')} />
            <Input label="Category" placeholder="SHOE" value={form.category} onChange={update('category')} />
            <Input label="Color" placeholder="RED" value={form.color} onChange={update('color')} />
            <Input label="Size" placeholder="42" value={form.size} onChange={update('size')} />

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Separator</label>
              <div className="relative">
                <select
                  value={form.separator}
                  onChange={update('separator')}
                  className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2.5 text-sm appearance-none bg-white focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="-">Hyphen (-)</option>
                  <option value="_">Underscore (_)</option>
                  <option value="/">Slash (/)</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
              </div>
            </div>

            <Input label="Start Sequence" type="number" min="1" value={String(form.startSeq)} onChange={update('startSeq')} />
            <Input label="Count (1–1000)" type="number" min="1" max="1000" value={String(form.count)} onChange={update('count')} />
          </div>
          <div className="mt-4">
            <Button onClick={handleFormGenerate} loading={generating}>
              Generate {form.count} SKUs
            </Button>
          </div>
        </Card>
      )}

      {/* CSV Mode */}
      {mode === 'csv' && (
        <Card variant="shadowed" padding="md">
          {/* Drop Zone */}
          <div
            ref={dropZoneRef}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[8px] p-8 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#E2E8F0] hover:border-[#93C5FD]'
            }`}
          >
            <Upload className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
            <p className="text-sm text-[#374151] font-medium">
              {csvFileName || 'Drop CSV / Excel here or click to browse'}
            </p>
            <p className="text-xs text-[#94A3B8] mt-1">Supports .csv and .xlsx</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
            />
          </div>

          {/* Column Mapping */}
          {csvHeaders.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Column Mapping</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['brand', 'category', 'color', 'size'].map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-[#374151] mb-1 capitalize">{field}</label>
                    <div className="relative">
                      <select
                        value={columnMap[field] || ''}
                        onChange={(e) => setColumnMap((prev) => ({ ...prev, [field]: e.target.value }))}
                        className="w-full border border-[#E2E8F0] rounded-[6px] px-2 py-2 text-xs appearance-none bg-white focus:outline-none focus:border-[#2563EB]"
                      >
                        <option value="">-- none --</option>
                        {csvHeaders.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#64748B] pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Preview first 5 rows */}
              <div className="mt-4 overflow-x-auto">
                <p className="text-xs font-semibold text-[#374151] mb-2">Preview (first 5 rows)</p>
                <table className="text-xs border border-[#E2E8F0] rounded-[6px] w-full">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      {csvHeaders.slice(0, 6).map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-[#374151] border-b border-[#E2E8F0]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-[#F1F5F9]">
                        {csvHeaders.slice(0, 6).map((h) => (
                          <td key={h} className="px-3 py-1.5 text-[#374151]">{row[h] || '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <Button onClick={handleCSVGenerate} loading={generating}>
                  Generate SKUs from CSV ({csvData.length} rows)
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Progress */}
      {generating && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-[#64748B]">
            <span>Generating…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2563EB] rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Results Table */}
      {rows.length > 0 && !generating && (
        <Card variant="shadowed" padding="none">
          <div className="p-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#0F172A]">{rows.length} SKUs Generated</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={downloadCSV} leftIcon={<FileText className="w-3.5 h-3.5" />}>
                Download CSV
              </Button>
              <Button variant="ghost" size="sm" onClick={downloadPDF} leftIcon={<Download className="w-3.5 h-3.5" />}>
                Download PDF Labels
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#374151] border-b border-[#E2E8F0]">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#374151] border-b border-[#E2E8F0]">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#374151] border-b border-[#E2E8F0]">Barcode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#374151] border-b border-[#E2E8F0]">Mini Preview</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#374151] border-b border-[#E2E8F0]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.index} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                    <td className="px-4 py-2 text-[#94A3B8] text-xs">{r.index}</td>
                    <td className="px-4 py-2">
                      {r.editing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={r.editValue}
                            onChange={(e) =>
                              setRows((prev) =>
                                prev.map((row) => row.index === r.index ? { ...row, editValue: e.target.value } : row)
                              )
                            }
                            className="border border-[#2563EB] rounded px-2 py-0.5 text-xs font-mono w-40 focus:outline-none"
                          />
                          <button onClick={() => saveEdit(r.index)} className="text-green-600 hover:text-green-700">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRows((prev) => prev.map((row) => row.index === r.index ? { ...row, editing: false } : row))}
                            className="text-[#94A3B8] hover:text-[#374151]"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono text-[#0F172A] text-xs font-semibold">{r.sku}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-[#64748B]">{r.barcode}</td>
                    <td className="px-4 py-2">
                      <MiniBarcode value={r.sku} />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { navigator.clipboard.writeText(r.sku); toast.success('Copied!'); }}
                          className="text-[#94A3B8] hover:text-[#2563EB]"
                          title="Copy SKU"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => startEdit(r.index)}
                          className="text-[#94A3B8] hover:text-[#2563EB]"
                          title="Edit SKU"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─── Mini Barcode Component ────────────────────────────────
const MiniBarcode: React.FC<{ value: string }> = ({ value }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    try {
      JsBarcode(svgRef.current, value, {
        format: 'CODE128',
        displayValue: false,
        height: 24,
        width: 1,
        margin: 2,
      });
    } catch {
      // ignore
    }
  }, [value]);

  return <svg ref={svgRef} className="h-6" />;
};

export default BulkSKUGenerator;
