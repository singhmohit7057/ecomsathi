// ============================================================
// EcomSathi — Variant SKU Generator
// ============================================================
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { Plus, Trash2, Download, Copy, GitBranch, ChevronDown } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { skuToBarcode } from '../../utils/skuGenerator';

// ─── Types ────────────────────────────────────────────────
interface Attribute {
  id: string;
  name: string;
  values: string; // comma-separated
}

interface VariantRow {
  sku: string;
  barcode: string;
  combo: Record<string, string>;
}

type Separator = '-' | '_' | '/';

let _id = 0;
const uid = () => `attr_${++_id}`;

// ─── Cartesian Product Helper ──────────────────────────────
function cartesian(arrays: string[][]): string[][] {
  return arrays.reduce<string[][]>(
    (acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])),
    [[]],
  );
}

// ─── Component ────────────────────────────────────────────
export const VariantSKUGenerator: React.FC = () => {
  const [baseSKU, setBaseSKU] = useState('');
  const [separator, setSeparator] = useState<Separator>('-');
  const [attributes, setAttributes] = useState<Attribute[]>([
    { id: uid(), name: 'Color', values: 'Red, Blue, Green' },
    { id: uid(), name: 'Size', values: 'S, M, L, XL' },
  ]);
  const [generated, setGenerated] = useState<VariantRow[]>([]);
  const [generating, setGenerating] = useState(false);

  // ── Attribute Handlers ─────────────────────────────────
  const addAttribute = () =>
    setAttributes((prev) => [...prev, { id: uid(), name: '', values: '' }]);

  const removeAttribute = (id: string) =>
    setAttributes((prev) => prev.filter((a) => a.id !== id));

  const updateAttribute = (id: string, field: keyof Omit<Attribute, 'id'>, value: string) =>
    setAttributes((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));

  // ── Matrix Preview ─────────────────────────────────────
  const matrixData = useMemo(() => {
    const validAttrs = attributes.filter((a) => a.name && a.values);
    if (validAttrs.length < 2) return null;

    const rowAttr = validAttrs[0];
    const colAttr = validAttrs[1];
    const rowVals = rowAttr.values.split(',').map((v) => v.trim()).filter(Boolean);
    const colVals = colAttr.values.split(',').map((v) => v.trim()).filter(Boolean);

    return { rowAttr, colAttr, rowVals, colVals };
  }, [attributes]);

  const getVariantSKU = useCallback(
    (combo: Record<string, string>): string => {
      const base = (baseSKU || 'SKU').toUpperCase().replace(/\s+/g, '');
      const parts = [base];
      attributes.forEach((attr) => {
        const val = combo[attr.name];
        if (val) parts.push(val.toUpperCase().replace(/\s+/g, '').slice(0, 4));
      });
      return parts.join(separator);
    },
    [baseSKU, attributes, separator],
  );

  // ── Generate All ───────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    const validAttrs = attributes.filter((a) => a.name.trim() && a.values.trim());
    if (!validAttrs.length) { toast.error('Add at least one attribute with values'); return; }

    setGenerating(true);
    const valueArrays = validAttrs.map((a) =>
      a.values.split(',').map((v) => v.trim()).filter(Boolean),
    );
    const combos = cartesian(valueArrays);

    const rows: VariantRow[] = [];
    for (let i = 0; i < combos.length; i++) {
      const combo: Record<string, string> = {};
      validAttrs.forEach((attr, j) => { combo[attr.name] = combos[i][j]; });
      const sku = getVariantSKU(combo);
      rows.push({ sku, barcode: skuToBarcode(sku), combo });
      if (i % 100 === 0) await new Promise((r) => setTimeout(r, 0));
    }

    setGenerated(rows);
    setGenerating(false);
    toast.success(`Generated ${rows.length} variants`);
  }, [attributes, getVariantSKU]);

  // ── Download CSV ───────────────────────────────────────
  const downloadCSV = () => {
    const attrNames = attributes.filter((a) => a.name).map((a) => a.name);
    const header = [...attrNames, 'SKU', 'Barcode'].join(',');
    const body = generated
      .map((r) => [...attrNames.map((n) => r.combo[n] || ''), r.sku, r.barcode].join(','))
      .join('\n');
    const blob = new Blob([header + '\n' + body], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'variant-skus.csv';
    a.click();
    toast.success('CSV downloaded');
  };

  // ── Download PDF ───────────────────────────────────────
  const downloadPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const perRow = 3;
    const labelW = 58;
    const labelH = 28;
    const marginX = 12;
    const marginY = 12;
    const gapX = 4;
    const gapY = 4;
    let col = 0;
    let row = 0;

    generated.forEach((r, i) => {
      if (i > 0 && col === 0 && row === 0) doc.addPage();
      const x = marginX + col * (labelW + gapX);
      const y = marginY + row * (labelH + gapY);
      doc.setFontSize(6);
      doc.rect(x, y, labelW, labelH);
      doc.setFontSize(9);
      doc.text(r.sku, x + labelW / 2, y + 8, { align: 'center' });
      doc.setFontSize(6);
      const attrs = Object.entries(r.combo)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ');
      doc.text(attrs, x + labelW / 2, y + 14, { align: 'center' });
      doc.text(r.barcode, x + labelW / 2, y + 20, { align: 'center' });
      col++;
      if (col >= perRow) { col = 0; row++; }
      if (row >= 9) { row = 0; }
    });

    doc.save('variant-labels.pdf');
    toast.success('PDF downloaded');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-[#2563EB]" />
          Variant SKU Generator
        </h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Generate all attribute combinations (Color × Size × Material…) automatically.
        </p>
      </div>

      {/* Base SKU + Separator */}
      <Card variant="shadowed" padding="md">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Base SKU"
              placeholder="NIKE-SHOE"
              value={baseSKU}
              onChange={(e) => setBaseSKU(e.target.value)}
              helper="Variant codes will be appended to this base"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">Separator</label>
            <div className="relative">
              <select
                value={separator}
                onChange={(e) => setSeparator(e.target.value as Separator)}
                className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2.5 text-sm appearance-none bg-white focus:outline-none focus:border-[#2563EB]"
              >
                <option value="-">Hyphen (-)</option>
                <option value="_">Underscore (_)</option>
                <option value="/">Slash (/)</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
            </div>
          </div>
        </div>
      </Card>

      {/* Attribute Builder */}
      <Card variant="shadowed" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#0F172A]">Variant Attributes</h2>
          <Button variant="outline" size="sm" onClick={addAttribute} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Attribute
          </Button>
        </div>

        <div className="space-y-3">
          {attributes.map((attr) => (
            <div key={attr.id} className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-[6px] border border-[#E2E8F0]">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Attribute Name"
                  placeholder="Color"
                  value={attr.name}
                  onChange={(e) => updateAttribute(attr.id, 'name', e.target.value)}
                />
                <Input
                  label="Values (comma-separated)"
                  placeholder="Red, Blue, Green"
                  value={attr.values}
                  onChange={(e) => updateAttribute(attr.id, 'values', e.target.value)}
                />
              </div>
              <button
                onClick={() => removeAttribute(attr.id)}
                className="mt-6 p-1.5 rounded-[6px] text-[#94A3B8] hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Combination Count Preview */}
        {attributes.filter((a) => a.name && a.values).length > 0 && (
          <div className="mt-4 p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[6px]">
            <p className="text-xs text-[#1E40AF]">
              <span className="font-semibold">
                {attributes
                  .filter((a) => a.name && a.values)
                  .reduce(
                    (acc, a) => acc * a.values.split(',').filter((v) => v.trim()).length,
                    1,
                  )}
              </span>{' '}
              total variants will be generated
            </p>
          </div>
        )}

        <div className="mt-4">
          <Button onClick={handleGenerate} loading={generating}>
            Generate All Variants
          </Button>
        </div>
      </Card>

      {/* Matrix Preview */}
      {matrixData && (
        <Card variant="sky" padding="md">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-3">
            Combination Matrix ({matrixData.rowAttr.name} × {matrixData.colAttr.name})
          </h2>
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse">
              <thead>
                <tr>
                  <th className="border border-[#BAE6FD] bg-[#BAE6FD] px-3 py-2 font-semibold text-[#0C4A6E]">
                    {matrixData.rowAttr.name} \ {matrixData.colAttr.name}
                  </th>
                  {matrixData.colVals.map((cv) => (
                    <th key={cv} className="border border-[#BAE6FD] bg-[#BAE6FD] px-3 py-2 font-semibold text-[#0C4A6E]">
                      {cv}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixData.rowVals.map((rv) => (
                  <tr key={rv}>
                    <td className="border border-[#BAE6FD] bg-[#E0F2FE] px-3 py-2 font-semibold text-[#0C4A6E]">
                      {rv}
                    </td>
                    {matrixData.colVals.map((cv) => {
                      const combo: Record<string, string> = {
                        [matrixData.rowAttr.name]: rv,
                        [matrixData.colAttr.name]: cv,
                      };
                      return (
                        <td key={cv} className="border border-[#BAE6FD] bg-white px-2 py-1.5 font-mono text-[#0F172A] text-center whitespace-nowrap">
                          {getVariantSKU(combo)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Results Table */}
      {generated.length > 0 && (
        <Card variant="shadowed" padding="none">
          <div className="p-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#0F172A]">{generated.length} Variants</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={downloadCSV} leftIcon={<Download className="w-3.5 h-3.5" />}>
                Download CSV
              </Button>
              <Button variant="ghost" size="sm" onClick={downloadPDF} leftIcon={<Download className="w-3.5 h-3.5" />}>
                Download PDF
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#374151] border-b border-[#E2E8F0]">#</th>
                  {attributes.filter((a) => a.name).map((a) => (
                    <th key={a.id} className="px-4 py-3 text-left text-xs font-semibold text-[#374151] border-b border-[#E2E8F0]">{a.name}</th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#374151] border-b border-[#E2E8F0]">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#374151] border-b border-[#E2E8F0]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {generated.map((r, i) => (
                  <tr key={i} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                    <td className="px-4 py-2 text-xs text-[#94A3B8]">{i + 1}</td>
                    {attributes.filter((a) => a.name).map((a) => (
                      <td key={a.id} className="px-4 py-2 text-xs text-[#374151]">
                        {r.combo[a.name] || '-'}
                      </td>
                    ))}
                    <td className="px-4 py-2 font-mono text-xs font-semibold text-[#0F172A]">{r.sku}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => { navigator.clipboard.writeText(r.sku); toast.success('Copied!'); }}
                        className="text-[#94A3B8] hover:text-[#2563EB] p-1"
                        title="Copy"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
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

export default VariantSKUGenerator;
