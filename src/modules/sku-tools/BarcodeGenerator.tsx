// ============================================================
// EcomSathi — Barcode Generator
// ============================================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { QrCode, Download, Copy, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';

// ─── Types ────────────────────────────────────────────────
type BarcodeFormat = 'CODE128' | 'EAN13' | 'UPC' | 'CODE39';

interface DisplayOptions {
  showText: boolean;
  fontSize: number;
  barHeight: number;
  bgColor: string;
  barColor: string;
  margin: number;
}

const FORMAT_OPTIONS: { value: BarcodeFormat; label: string; hint: string }[] = [
  { value: 'CODE128', label: 'Code 128', hint: 'Universal alphanumeric — best for SKUs' },
  { value: 'EAN13',   label: 'EAN-13',   hint: '13-digit numeric (auto-computes check digit)' },
  { value: 'UPC',     label: 'UPC-A',    hint: '12-digit numeric retail standard' },
  { value: 'CODE39',  label: 'Code 39',  hint: 'Alphanumeric, widely supported' },
];

// ─── EAN-13 helpers ───────────────────────────────────────
function computeEAN13Check(digits12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(digits12[i], 10) * (i % 2 === 0 ? 1 : 3);
  return (10 - (sum % 10)) % 10;
}

function validateEAN13(raw: string): { value: string; valid: boolean; message: string } {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 12) return { value: raw, valid: false, message: 'Need at least 12 digits' };
  const base12 = digits.slice(0, 12);
  const check = computeEAN13Check(base12);
  const value = base12 + check;
  if (digits.length === 13 && parseInt(digits[12], 10) !== check) {
    return { value, valid: false, message: `Check digit corrected: ${digits[12]} → ${check}` };
  }
  return { value, valid: true, message: `Valid EAN-13 (check digit: ${check})` };
}

// ─── Component ────────────────────────────────────────────
export const BarcodeGenerator: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const bulkContainerRef = useRef<HTMLDivElement>(null);

  const [format, setFormat] = useState<BarcodeFormat>('CODE128');
  const [inputValue, setInputValue] = useState('');
  const [ean13Info, setEan13Info] = useState<{ value: string; valid: boolean; message: string } | null>(null);
  const [displayOpts, setDisplayOpts] = useState<DisplayOptions>({
    showText: true,
    fontSize: 14,
    barHeight: 80,
    bgColor: '#ffffff',
    barColor: '#000000',
    margin: 10,
  });
  const [barcodeError, setBarcodeError] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [bulkValues, setBulkValues] = useState<string[]>([]);

  // ── EAN-13 auto-validate ───────────────────────────────
  useEffect(() => {
    if (format === 'EAN13') {
      const info = validateEAN13(inputValue);
      setEan13Info(info);
    } else {
      setEan13Info(null);
    }
  }, [inputValue, format]);

  // ── Barcode render ─────────────────────────────────────
  useEffect(() => {
    if (bulkMode || !svgRef.current || !inputValue) return;
    setBarcodeError('');

    const value = format === 'EAN13' && ean13Info?.valid ? ean13Info.value : inputValue;

    try {
      JsBarcode(svgRef.current, value, {
        format: format === 'UPC' ? 'UPC' : format,
        displayValue: displayOpts.showText,
        fontSize: displayOpts.fontSize,
        height: displayOpts.barHeight,
        margin: displayOpts.margin,
        background: displayOpts.bgColor,
        lineColor: displayOpts.barColor,
        width: 2,
      });
    } catch (e) {
      setBarcodeError(String(e));
    }
  }, [inputValue, format, displayOpts, bulkMode, ean13Info]);

  // ── Download SVG ───────────────────────────────────────
  const downloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `barcode-${inputValue}.svg`;
    a.click();
    toast.success('SVG downloaded');
  };

  const downloadPNG = () => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const w = svg.width?.baseVal?.value || 300;
    const h = svg.height?.baseVal?.value || 150;
    canvas.width = w * 2;
    canvas.height = h * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `barcode-${inputValue}.png`;
      a.click();
      toast.success('PNG downloaded');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const downloadPDF = () => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const doc = new jsPDF({ unit: 'mm', format: [100, 50] });
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 200;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, 400, 200);
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 80, 30);
      doc.setFontSize(8);
      doc.text(inputValue, 50, 48, { align: 'center' });
      doc.save(`barcode-${inputValue}.pdf`);
      toast.success('PDF downloaded');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  // ── Bulk Generation ────────────────────────────────────
  const handleBulkGenerate = useCallback(() => {
    const vals = bulkInput
      .split('\n')
      .map((v) => v.trim())
      .filter(Boolean);
    if (!vals.length) { toast.error('Enter at least one value'); return; }
    setBulkValues(vals);
    toast.success(`Generated ${vals.length} barcodes`);
  }, [bulkInput]);

  const handleBulkDownloadPDF = () => {
    if (!bulkValues.length) return;
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
    let pageCount = 0;

    const renderNext = (i: number) => {
      if (i >= bulkValues.length) {
        doc.save('barcodes-bulk.pdf');
        toast.success('Bulk PDF downloaded');
        return;
      }
      const val = bulkValues[i];
      try {
        const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        JsBarcode(svgEl, val, { format: format === 'UPC' ? 'UPC' : format, displayValue: true, height: 40, width: 1.5, margin: 4, fontSize: 10 });
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 100;
        const ctx = canvas.getContext('2d')!;
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 300, 100);
          if (pageCount > 0 && col === 0 && row === 0) doc.addPage();
          const x = marginX + col * (labelW + gapX);
          const y = marginY + row * (labelH + gapY);
          doc.rect(x, y, labelW, labelH);
          doc.addImage(canvas.toDataURL('image/png'), 'PNG', x + 2, y + 2, labelW - 4, labelH - 4);
          col++;
          if (col >= perRow) { col = 0; row++; }
          if (row >= 9) { row = 0; pageCount++; }
          renderNext(i + 1);
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      } catch {
        renderNext(i + 1);
      }
    };
    renderNext(0);
  };

  const updateOpt = <K extends keyof DisplayOptions>(key: K) =>
    (val: DisplayOptions[K]) => setDisplayOpts((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
          <QrCode className="w-6 h-6 text-[#2563EB]" />
          Barcode Generator
        </h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Generate EAN-13, Code 128, UPC-A, and Code 39 barcodes instantly.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        {[{ v: false, l: 'Single' }, { v: true, l: 'Bulk' }].map(({ v, l }) => (
          <button
            key={l}
            onClick={() => setBulkMode(v)}
            className={`px-4 py-2 rounded-[6px] text-sm font-medium border transition-colors ${
              bulkMode === v
                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                : 'bg-white text-[#374151] border-[#E2E8F0] hover:border-[#2563EB]'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {!bulkMode ? (
        <>
          {/* Format + Input */}
          <Card variant="shadowed" padding="md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Barcode Format</label>
                <div className="relative">
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as BarcodeFormat)}
                    className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2.5 text-sm appearance-none bg-white focus:outline-none focus:border-[#2563EB]"
                  >
                    {FORMAT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                </div>
                <p className="text-[10px] text-[#64748B] mt-1">
                  {FORMAT_OPTIONS.find((o) => o.value === format)?.hint}
                </p>
              </div>

              <div>
                <Input
                  label="Value / Data"
                  placeholder={format === 'EAN13' ? '690123456789 (12 digits)' : format === 'UPC' ? '01234567890' : 'NIKE-SHOE-0001'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                {ean13Info && (
                  <div className={`flex items-start gap-1.5 mt-1 text-xs ${ean13Info.valid ? 'text-green-600' : 'text-amber-600'}`}>
                    {ean13Info.valid
                      ? <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      : <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
                    <span>{ean13Info.message}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Display Options */}
          <Card variant="shadowed" padding="md">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Display Options</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer col-span-full sm:col-span-1">
                <input
                  type="checkbox"
                  checked={displayOpts.showText}
                  onChange={(e) => updateOpt('showText')(e.target.checked)}
                  className="rounded border-[#E2E8F0]"
                />
                Show text below
              </label>

              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Font Size</label>
                <input
                  type="range"
                  min="8"
                  max="24"
                  value={displayOpts.fontSize}
                  onChange={(e) => updateOpt('fontSize')(Number(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
                <span className="text-xs text-[#64748B]">{displayOpts.fontSize}px</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Bar Height</label>
                <input
                  type="range"
                  min="40"
                  max="160"
                  value={displayOpts.barHeight}
                  onChange={(e) => updateOpt('barHeight')(Number(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
                <span className="text-xs text-[#64748B]">{displayOpts.barHeight}px</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Background</label>
                <input
                  type="color"
                  value={displayOpts.bgColor}
                  onChange={(e) => updateOpt('bgColor')(e.target.value)}
                  className="h-9 w-full rounded-[6px] border border-[#E2E8F0] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Bar Color</label>
                <input
                  type="color"
                  value={displayOpts.barColor}
                  onChange={(e) => updateOpt('barColor')(e.target.value)}
                  className="h-9 w-full rounded-[6px] border border-[#E2E8F0] cursor-pointer"
                />
              </div>
            </div>
          </Card>

          {/* Preview */}
          <Card variant="shadowed" padding="md">
            <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Preview</h2>
            {!inputValue ? (
              <div className="text-center py-8 text-[#94A3B8] text-sm">
                Enter a value above to see the barcode
              </div>
            ) : barcodeError ? (
              <div className="flex items-center gap-2 text-red-500 text-sm p-4 bg-red-50 rounded-[6px]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{barcodeError}</span>
              </div>
            ) : (
              <div className="flex justify-center p-4 rounded-[6px]" style={{ backgroundColor: displayOpts.bgColor }}>
                <svg ref={svgRef} className="max-w-full" />
              </div>
            )}

            {inputValue && !barcodeError && (
              <div className="flex flex-wrap gap-2 mt-4">
                <Button variant="ghost" size="sm" onClick={downloadSVG} leftIcon={<Download className="w-3.5 h-3.5" />}>
                  SVG
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadPNG} leftIcon={<Download className="w-3.5 h-3.5" />}>
                  PNG
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadPDF} leftIcon={<Download className="w-3.5 h-3.5" />}>
                  PDF
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { navigator.clipboard.writeText(inputValue); toast.success('Copied!'); }}
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                >
                  Copy Value
                </Button>
              </div>
            )}
          </Card>
        </>
      ) : (
        /* Bulk Mode */
        <Card variant="shadowed" padding="md">
          <div className="mb-4">
            <label className="block text-xs font-medium text-[#374151] mb-1">Barcode Format</label>
            <div className="relative w-48">
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as BarcodeFormat)}
                className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2 text-sm appearance-none bg-white focus:outline-none focus:border-[#2563EB]"
              >
                {FORMAT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">
              Values (one per line)
            </label>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              rows={8}
              placeholder={'NIKE-SHOE-0001\nNIKE-SHOE-0002\nADIDAS-SHIRT-0001'}
              className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:border-[#2563EB] resize-y"
            />
          </div>

          <div className="flex gap-2 mt-3">
            <Button onClick={handleBulkGenerate}>Generate Barcodes</Button>
            {bulkValues.length > 0 && (
              <Button variant="ghost" onClick={handleBulkDownloadPDF} leftIcon={<Download className="w-4 h-4" />}>
                Download All PDF
              </Button>
            )}
          </div>

          {/* Bulk Preview */}
          {bulkValues.length > 0 && (
            <div ref={bulkContainerRef} className="mt-4 space-y-3 max-h-96 overflow-y-auto">
              {bulkValues.slice(0, 20).map((val, i) => (
                <BulkBarcodeItem key={i} value={val} format={format} />
              ))}
              {bulkValues.length > 20 && (
                <p className="text-xs text-[#64748B] text-center py-2">
                  Showing 20 of {bulkValues.length} barcodes. PDF will include all.
                </p>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

// ─── Bulk Barcode Item ─────────────────────────────────────
const BulkBarcodeItem: React.FC<{ value: string; format: BarcodeFormat }> = ({ value, format }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    try {
      JsBarcode(svgRef.current, value, {
        format: format === 'UPC' ? 'UPC' : format,
        displayValue: true,
        height: 50,
        width: 1.5,
        margin: 6,
        fontSize: 11,
      });
    } catch {
      // ignore invalid values
    }
  }, [value, format]);

  return (
    <div className="flex items-center gap-3 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px]">
      <span className="text-xs text-[#94A3B8] w-24 truncate font-mono">{value}</span>
      <svg ref={svgRef} className="h-12" />
    </div>
  );
};

export default BarcodeGenerator;
