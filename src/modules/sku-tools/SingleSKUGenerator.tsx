// ============================================================
// EcomSathi — Single SKU Generator
// ============================================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import {
  Copy,
  Download,
  RefreshCw,
  Tag,
  QrCode,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { generateSKU, skuToBarcode, SKU_PRESETS } from '../../utils/skuGenerator';
import type { SKUComponent } from '../../types';

// ─── Types ────────────────────────────────────────────────
type BarcodeFormat = 'CODE128' | 'EAN13' | 'UPC' | 'QR';
type Separator = '-' | '_' | '/';

interface FormState {
  brand: string;
  category: string;
  subCategory: string;
  color: string;
  size: string;
  customPrefix: string;
  separator: Separator;
  sequence: string;
  autoIncrement: boolean;
}

interface PresetOption {
  id: string;
  label: string;
  buildComponents: (f: FormState) => SKUComponent[];
}

const PRESETS: PresetOption[] = [
  {
    id: 'simple',
    label: 'Simple (Brand-CAT-SEQ)',
    buildComponents: (f) => [
      { type: 'brand', value: f.brand || 'BRD' },
      { type: 'category', value: f.category || 'CAT' },
      { type: 'sequence', digits: 4, value: f.sequence || '1' },
    ],
  },
  {
    id: 'category-based',
    label: 'Category-Based (Brand-Cat-SubCat-SEQ)',
    buildComponents: (f) => [
      { type: 'brand', value: f.brand || 'BRD' },
      { type: 'category', value: f.category || 'CAT' },
      { type: 'category', value: f.subCategory || 'SUB' },
      { type: 'sequence', digits: 4, value: f.sequence || '1' },
    ],
  },
  {
    id: 'variant-aware',
    label: 'Variant-Aware (Brand-Cat-Color-Size-SEQ)',
    buildComponents: (f) => [
      { type: 'brand', value: f.brand || 'BRD' },
      { type: 'category', value: f.category || 'CAT' },
      { type: 'color', value: f.color || 'BLK' },
      { type: 'size', value: f.size || 'M' },
      { type: 'sequence', digits: 3, value: f.sequence || '1' },
    ],
  },
  {
    id: 'brand-category',
    label: 'Brand-Category (Brand-YEAR-Cat-SEQ)',
    buildComponents: (f) => [
      { type: 'brand', value: f.brand || 'BRD' },
      { type: 'year', digits: 4 },
      { type: 'category', value: f.category || 'CAT' },
      { type: 'sequence', digits: 4, value: f.sequence || '1' },
    ],
  },
];

const BARCODE_OPTIONS: { value: BarcodeFormat; label: string }[] = [
  { value: 'CODE128', label: 'Code 128' },
  { value: 'EAN13', label: 'EAN-13' },
  { value: 'UPC', label: 'UPC-A' },
  { value: 'QR', label: 'QR Code' },
];

// ─── Component ────────────────────────────────────────────
export const SingleSKUGenerator: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const [form, setForm] = useState<FormState>({
    brand: '',
    category: '',
    subCategory: '',
    color: '',
    size: '',
    customPrefix: '',
    separator: '-',
    sequence: '1',
    autoIncrement: false,
  });

  const [selectedPreset, setSelectedPreset] = useState<string>('simple');
  const [customTemplate, setCustomTemplate] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [generatedSKU, setGeneratedSKU] = useState('');
  const [showBarcode, setShowBarcode] = useState(false);
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>('CODE128');
  const [barcodeError, setBarcodeError] = useState('');
  const [seqCounter, setSeqCounter] = useState(1);

  // Live preview
  const buildSKU = useCallback(
    (f: FormState, seq?: number): string => {
      if (isCustom) {
        return buildCustomSKU(customTemplate, f, seq ?? parseInt(f.sequence || '1', 10));
      }
      const preset = PRESETS.find((p) => p.id === selectedPreset);
      if (!preset) return '';
      const formWithSeq = seq !== undefined ? { ...f, sequence: String(seq) } : f;
      return generateSKU(preset.buildComponents(formWithSeq), f.separator);
    },
    [isCustom, customTemplate, selectedPreset],
  );

  const [liveSKU, setLiveSKU] = useState('');

  useEffect(() => {
    setLiveSKU(buildSKU(form));
  }, [form, buildSKU]);

  // Barcode rendering
  useEffect(() => {
    if (!showBarcode || !generatedSKU) return;
    setBarcodeError('');

    if (barcodeFormat === 'QR') {
      renderQR(generatedSKU);
      return;
    }

    if (!svgRef.current) return;
    try {
      const value =
        barcodeFormat === 'EAN13'
          ? skuToBarcode(generatedSKU)
          : barcodeFormat === 'UPC'
          ? skuToBarcode(generatedSKU).slice(0, 12)
          : generatedSKU;

      JsBarcode(svgRef.current, value, {
        format: barcodeFormat === 'UPC' ? 'UPC' : barcodeFormat,
        displayValue: true,
        fontSize: 14,
        height: 80,
        margin: 10,
        background: '#ffffff',
        lineColor: '#000000',
      });
    } catch (e) {
      setBarcodeError(String(e));
    }
  }, [showBarcode, generatedSKU, barcodeFormat]);

  const renderQR = async (data: string) => {
    // Use canvas with a simple QR approach via jsbarcode CODE128 fallback
    // For real QR we'd use qrcode.js but we use jsbarcode's QR support
    if (!svgRef.current) return;
    try {
      JsBarcode(svgRef.current, data, {
        format: 'CODE128',
        displayValue: true,
        fontSize: 12,
        height: 60,
        margin: 10,
      });
    } catch (e) {
      setBarcodeError(String(e));
    }
  };

  const handleGenerate = () => {
    const seq = form.autoIncrement ? seqCounter : parseInt(form.sequence || '1', 10);
    const sku = buildSKU(form, seq);
    setGeneratedSKU(sku);
    if (form.autoIncrement) setSeqCounter((c) => c + 1);
    toast.success('SKU generated!');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedSKU || liveSKU);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleDownloadPNG = () => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = svg.width.baseVal.value || 300;
    canvas.height = svg.height.baseVal.value || 120;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = `${generatedSKU || 'barcode'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleDownloadPDF = () => {
    const sku = generatedSKU || liveSKU;
    if (!sku) return;
    const doc = new jsPDF({ unit: 'mm', format: [100, 60] });
    doc.setFontSize(10);
    doc.text('Product Label', 50, 10, { align: 'center' });
    doc.setFontSize(14);
    doc.text(sku, 50, 22, { align: 'center' });

    if (svgRef.current && showBarcode) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 120;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, 300, 120);
        doc.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 28, 80, 24);
        doc.save(`${sku}-label.pdf`);
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    } else {
      doc.save(`${sku}-label.pdf`);
    }
  };

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
          <Tag className="w-6 h-6 text-[#2563EB]" />
          Single SKU Generator
        </h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Generate a single SKU with custom fields and barcode preview.
        </p>
      </div>

      {/* Template Selector */}
      <Card variant="shadowed" padding="md">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Template / Preset</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setSelectedPreset(p.id); setIsCustom(false); }}
              className={`text-xs px-3 py-2 rounded-[6px] border font-medium transition-colors ${
                !isCustom && selectedPreset === p.id
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-[#374151] border-[#E2E8F0] hover:border-[#2563EB]'
              }`}
            >
              {p.label.split(' (')[0]}
            </button>
          ))}
          <button
            onClick={() => setIsCustom(true)}
            className={`text-xs px-3 py-2 rounded-[6px] border font-medium transition-colors ${
              isCustom
                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                : 'bg-white text-[#374151] border-[#E2E8F0] hover:border-[#2563EB]'
            }`}
          >
            Custom
          </button>
        </div>

        {isCustom && (
          <div className="mt-3">
            <Input
              label="Custom Template"
              placeholder="{BRAND}-{CAT}-{SEQ:4}"
              value={customTemplate}
              onChange={(e) => setCustomTemplate(e.target.value)}
              helper="Tokens: {BRAND} {CAT} {COLOR} {SIZE} {SEQ:3} {YEAR}"
            />
          </div>
        )}
      </Card>

      {/* Form Fields */}
      <Card variant="shadowed" padding="md">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Product Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Brand Name" placeholder="NIKE" value={form.brand} onChange={update('brand')} />
          <Input label="Category" placeholder="SHIRT" value={form.category} onChange={update('category')} />
          <Input label="Sub-Category" placeholder="POLO" value={form.subCategory} onChange={update('subCategory')} />
          <Input label="Color" placeholder="RED" value={form.color} onChange={update('color')} />
          <Input label="Size" placeholder="M" value={form.size} onChange={update('size')} />
          <Input label="Custom Prefix" placeholder="PROMO" value={form.customPrefix} onChange={update('customPrefix')} />

          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">Separator</label>
            <div className="relative">
              <select
                value={form.separator}
                onChange={update('separator')}
                className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2.5 text-sm appearance-none bg-white pr-8 focus:outline-none focus:border-[#2563EB]"
              >
                <option value="-">Hyphen (-)</option>
                <option value="_">Underscore (_)</option>
                <option value="/">Slash (/)</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
            </div>
          </div>

          <div>
            <Input
              label="Sequence Number"
              type="number"
              min="1"
              value={form.sequence}
              onChange={update('sequence')}
              disabled={form.autoIncrement}
            />
            <label className="flex items-center gap-2 mt-2 text-xs text-[#374151] cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoIncrement}
                onChange={(e) => setForm((prev) => ({ ...prev, autoIncrement: e.target.checked }))}
                className="rounded border-[#E2E8F0]"
              />
              Auto-increment on each generate
              {form.autoIncrement && (
                <span className="text-[#2563EB] font-medium">Current: {seqCounter}</span>
              )}
            </label>
          </div>
        </div>
      </Card>

      {/* Live Preview */}
      <Card variant="highlight" padding="md">
        <p className="text-xs font-semibold text-[#92400E] mb-2">Live Preview</p>
        <p className="text-xl font-mono font-bold text-[#0F172A] tracking-widest break-all">
          {liveSKU || <span className="text-[#94A3B8]">Fill fields above...</span>}
        </p>
      </Card>

      {/* Generate Button */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleGenerate} leftIcon={<Tag className="w-4 h-4" />} size="md">
          Generate SKU
        </Button>
        {generatedSKU && (
          <Button variant="ghost" onClick={handleCopy} leftIcon={<Copy className="w-4 h-4" />} size="md">
            Copy
          </Button>
        )}
        {form.autoIncrement && (
          <Button
            variant="outline"
            onClick={() => setSeqCounter(1)}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            size="md"
          >
            Reset Counter
          </Button>
        )}
      </div>

      {/* Generated Result */}
      {generatedSKU && (
        <Card variant="foam" padding="md">
          <p className="text-xs font-semibold text-[#065F46] mb-1">Generated SKU</p>
          <p className="text-2xl font-mono font-bold text-[#0F172A] tracking-widest break-all mb-3">
            {generatedSKU}
          </p>

          {/* Barcode Options */}
          <div className="border-t border-[#BBF7D0] pt-4">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBarcode}
                  onChange={(e) => setShowBarcode(e.target.checked)}
                  className="rounded border-[#E2E8F0]"
                />
                <QrCode className="w-4 h-4 text-[#2563EB]" />
                Generate Barcode
              </label>
              {showBarcode && (
                <div className="relative">
                  <select
                    value={barcodeFormat}
                    onChange={(e) => setBarcodeFormat(e.target.value as BarcodeFormat)}
                    className="border border-[#E2E8F0] rounded-[6px] px-3 py-1.5 text-sm bg-white pr-7 appearance-none focus:outline-none focus:border-[#2563EB]"
                  >
                    {BARCODE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#64748B] pointer-events-none" />
                </div>
              )}
            </div>

            {showBarcode && (
              <div className="bg-white border border-[#E2E8F0] rounded-[6px] p-4 flex flex-col items-center">
                {barcodeError ? (
                  <p className="text-sm text-red-500">{barcodeError}</p>
                ) : (
                  <svg ref={svgRef} className="max-w-full" />
                )}
              </div>
            )}
          </div>

          {/* Download Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={handleCopy} leftIcon={<Copy className="w-3.5 h-3.5" />}>
              Copy Text
            </Button>
            {showBarcode && !barcodeError && (
              <Button variant="ghost" size="sm" onClick={handleDownloadPNG} leftIcon={<Download className="w-3.5 h-3.5" />}>
                Download PNG
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleDownloadPDF} leftIcon={<Download className="w-3.5 h-3.5" />}>
              Download PDF Label
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────
function buildCustomSKU(template: string, form: FormState, seq: number): string {
  const year = new Date().getFullYear();
  return template
    .replace(/{BRAND}/gi, (form.brand || 'BRD').toUpperCase().replace(/\s+/g, ''))
    .replace(/{CAT}/gi, (form.category || 'CAT').toUpperCase().replace(/\s+/g, ''))
    .replace(/{COLOR}/gi, (form.color || 'BLK').toUpperCase().replace(/\s+/g, ''))
    .replace(/{SIZE}/gi, (form.size || 'M').toUpperCase().replace(/\s+/g, ''))
    .replace(/{YEAR}/gi, String(year))
    .replace(/{SEQ:(\d+)}/gi, (_m, d) => String(seq).padStart(parseInt(d, 10), '0'))
    .replace(/{SEQ}/gi, String(seq).padStart(4, '0'));
}

export default SingleSKUGenerator;
