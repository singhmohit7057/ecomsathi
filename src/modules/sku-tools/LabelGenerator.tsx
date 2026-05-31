// ============================================================
// EcomSathi — Label Generator (Canvas-based with react-konva)
// ============================================================
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group, Transformer } from 'react-konva';
import Konva from 'konva';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import { read as xlsxRead, utils as xlsxUtils } from 'xlsx';
import toast from 'react-hot-toast';
import {
  Layout,
  Download,
  Upload,
  Eye,
  EyeOff,
  ChevronDown,
  Plus,
  Minus,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { skuToBarcode } from '../../utils/skuGenerator';

// ─── Types ────────────────────────────────────────────────
interface LabelSize {
  id: string;
  name: string;
  widthPx: number;
  heightPx: number;
  widthMm: number;
  heightMm: number;
}

interface LabelElement {
  id: string;
  type: 'text' | 'barcode';
  field: string;
  x: number;
  y: number;
  width: number;
  fontSize?: number;
  fontStyle?: 'normal' | 'bold';
  align?: 'left' | 'center' | 'right';
  visible: boolean;
  value: string;
}

interface LabelData {
  productName: string;
  sku: string;
  price: string;
  brand: string;
  mrp: string;
  weight: string;
}

const LABEL_SIZES: LabelSize[] = [
  { id: 'thermal-4x6', name: 'Thermal 4×6 in', widthPx: 384, heightPx: 576, widthMm: 101.6, heightMm: 152.4 },
  { id: 'label-3x5',   name: '3×5 in',          widthPx: 288, heightPx: 480, widthMm: 76.2,  heightMm: 127 },
  { id: 'label-2x3',   name: '2×3 in',           widthPx: 192, heightPx: 288, widthMm: 50.8,  heightMm: 76.2 },
  { id: 'a4-4up',      name: 'A4 (4 per page)',  widthPx: 357, heightPx: 505, widthMm: 94.6,  heightMm: 133.5 },
  { id: 'a4-6up',      name: 'A4 (6 per page)',  widthPx: 233, heightPx: 334, widthMm: 61.7,  heightMm: 88.5 },
];

const CANVAS_SCALE = 0.6; // display scale

const DEFAULT_ELEMENTS: LabelElement[] = [
  { id: 'brand',       type: 'text',    field: 'brand',       x: 10, y: 8,   width: 200, fontSize: 10, fontStyle: 'normal', align: 'left',   visible: true,  value: '' },
  { id: 'productName', type: 'text',    field: 'productName', x: 10, y: 28,  width: 250, fontSize: 16, fontStyle: 'bold',   align: 'left',   visible: true,  value: '' },
  { id: 'sku',         type: 'text',    field: 'sku',         x: 10, y: 56,  width: 200, fontSize: 11, fontStyle: 'normal', align: 'left',   visible: true,  value: '' },
  { id: 'mrp',         type: 'text',    field: 'mrp',         x: 10, y: 76,  width: 150, fontSize: 13, fontStyle: 'bold',   align: 'left',   visible: true,  value: '' },
  { id: 'price',       type: 'text',    field: 'price',       x: 10, y: 98,  width: 150, fontSize: 12, fontStyle: 'normal', align: 'left',   visible: true,  value: '' },
  { id: 'weight',      type: 'text',    field: 'weight',      x: 10, y: 118, width: 150, fontSize: 10, fontStyle: 'normal', align: 'left',   visible: true,  value: '' },
  { id: 'barcode',     type: 'barcode', field: 'sku',         x: 10, y: 140, width: 260, fontSize: 10, fontStyle: 'normal', align: 'center', visible: true,  value: '' },
];

// ─── Component ────────────────────────────────────────────
export const LabelGenerator: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedSize, setSelectedSize] = useState<LabelSize>(LABEL_SIZES[0]);
  const [elements, setElements] = useState<LabelElement[]>(DEFAULT_ELEMENTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [labelData, setLabelData] = useState<LabelData>({
    productName: 'Sample Product',
    sku: 'NIKE-SHOE-0001',
    price: '₹999',
    brand: 'NIKE',
    mrp: 'MRP: ₹1,299',
    weight: '500g',
  });
  const [barcodeImageEl, setBarcodeImageEl] = useState<HTMLImageElement | null>(null);
  const [bulkData, setBulkData] = useState<LabelData[]>([]);
  const [bulkFileName, setBulkFileName] = useState('');

  // ── Barcode Image Generation ───────────────────────────
  useEffect(() => {
    if (!labelData.sku) return;
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    try {
      JsBarcode(svgEl, labelData.sku, {
        format: 'CODE128',
        displayValue: true,
        height: 50,
        width: 1.8,
        margin: 5,
        fontSize: 11,
      });
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const img = new window.Image();
      img.onload = () => setBarcodeImageEl(img);
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    } catch {
      setBarcodeImageEl(null);
    }
  }, [labelData.sku]);

  const resolveValue = (el: LabelElement, data: LabelData): string => {
    const v = data[el.field as keyof LabelData] ?? el.value;
    return v || `[${el.field}]`;
  };

  const updateElement = (id: string, updates: Partial<LabelElement>) =>
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)));

  // ── Download Single PNG ────────────────────────────────
  const downloadPNG = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const a = document.createElement('a');
    a.href = uri;
    a.download = `label-${labelData.sku || 'product'}.png`;
    a.click();
    toast.success('PNG downloaded');
  };

  // ── Download Single PDF ────────────────────────────────
  const downloadPDF = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const doc = new jsPDF({
      unit: 'mm',
      format: [selectedSize.widthMm, selectedSize.heightMm],
    });
    doc.addImage(uri, 'PNG', 0, 0, selectedSize.widthMm, selectedSize.heightMm);
    doc.save(`label-${labelData.sku || 'product'}.pdf`);
    toast.success('PDF downloaded');
  };

  // ── Bulk CSV Upload ────────────────────────────────────
  const handleBulkFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let rows: LabelData[] = [];

        if (file.name.endsWith('.csv')) {
          const text = typeof data === 'string' ? data : new TextDecoder().decode(data as ArrayBuffer);
          const lines = text.trim().split('\n');
          const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
          rows = lines.slice(1).map((line) => {
            const vals = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
            const obj: Record<string, string> = {};
            headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
            return {
              productName: obj['productname'] || obj['product_name'] || obj['name'] || '',
              sku: obj['sku'] || '',
              price: obj['price'] || obj['selling_price'] || '',
              brand: obj['brand'] || '',
              mrp: obj['mrp'] || '',
              weight: obj['weight'] || '',
            };
          });
        } else {
          const wb = xlsxRead(data, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = xlsxUtils.sheet_to_json<Record<string, string>>(ws);
          rows = json.map((row) => ({
            productName: row['Product Name'] || row['productName'] || row['name'] || '',
            sku: row['SKU'] || row['sku'] || '',
            price: row['Price'] || row['price'] || '',
            brand: row['Brand'] || row['brand'] || '',
            mrp: row['MRP'] || row['mrp'] || '',
            weight: row['Weight'] || row['weight'] || '',
          }));
        }

        setBulkData(rows.filter((r) => r.sku || r.productName));
        setBulkFileName(file.name);
        toast.success(`Loaded ${rows.length} products`);
      } catch {
        toast.error('Failed to parse file');
      }
    };
    if (file.name.endsWith('.csv')) reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  };

  const downloadBulkPDF = async () => {
    if (!bulkData.length) { toast.error('Upload a CSV first'); return; }
    const doc = new jsPDF({ unit: 'mm', format: [selectedSize.widthMm, selectedSize.heightMm] });

    for (let i = 0; i < bulkData.length; i++) {
      if (i > 0) doc.addPage();
      const d = bulkData[i];
      doc.setFontSize(10);
      doc.text(d.brand, 5, 10);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(d.productName, 5, 20);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`SKU: ${d.sku}`, 5, 32);
      doc.setFontSize(12);
      doc.text(`MRP: ${d.mrp}`, 5, 42);
      doc.setFontSize(11);
      doc.text(`Price: ${d.price}`, 5, 52);
      if (d.weight) doc.text(`Weight: ${d.weight}`, 5, 62);

      // barcode
      try {
        const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        JsBarcode(svgEl, d.sku || 'NOSKU', { format: 'CODE128', displayValue: true, height: 40, width: 1.5, margin: 4, fontSize: 9 });
        const svgData = new XMLSerializer().serializeToString(svgEl);
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 300; canvas.height = 100;
            canvas.getContext('2d')!.drawImage(img, 0, 0, 300, 100);
            doc.addImage(canvas.toDataURL('image/png'), 'PNG', 5, 70, selectedSize.widthMm - 10, 20);
            resolve();
          };
          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        });
      } catch {
        // skip barcode for this item
      }
    }

    doc.save('bulk-labels.pdf');
    toast.success(`Downloaded ${bulkData.length} labels as PDF`);
  };

  const cW = Math.round(selectedSize.widthPx * CANVAS_SCALE);
  const cH = Math.round(selectedSize.heightPx * CANVAS_SCALE);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
          <Layout className="w-6 h-6 text-[#2563EB]" />
          Label Designer
        </h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Design product labels with a drag-and-drop canvas editor.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Controls */}
        <div className="space-y-4">
          {/* Size Selector */}
          <Card variant="shadowed" padding="md">
            <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Label Size</h3>
            <div className="relative">
              <select
                value={selectedSize.id}
                onChange={(e) => {
                  const sz = LABEL_SIZES.find((s) => s.id === e.target.value)!;
                  setSelectedSize(sz);
                }}
                className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2.5 text-sm appearance-none bg-white focus:outline-none focus:border-[#2563EB]"
              >
                {LABEL_SIZES.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              {selectedSize.widthMm}mm × {selectedSize.heightMm}mm
            </p>
          </Card>

          {/* Product Data */}
          <Card variant="shadowed" padding="md">
            <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Product Data</h3>
            <div className="space-y-2">
              {(Object.keys(labelData) as (keyof LabelData)[]).map((key) => (
                <Input
                  key={key}
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
                  value={labelData[key]}
                  onChange={(e) => setLabelData((prev) => ({ ...prev, [key]: e.target.value }))}
                  size="sm"
                />
              ))}
            </div>
          </Card>

          {/* Element Visibility */}
          <Card variant="shadowed" padding="md">
            <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Elements</h3>
            <div className="space-y-1.5">
              {elements.map((el) => (
                <div key={el.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateElement(el.id, { visible: !el.visible })}
                      className={`${el.visible ? 'text-[#2563EB]' : 'text-[#CBD5E1]'}`}
                    >
                      {el.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <span className="text-xs text-[#374151] capitalize">{el.field}</span>
                  </div>
                  {el.type === 'text' && selectedId === el.id && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateElement(el.id, { fontSize: Math.max(8, (el.fontSize ?? 12) - 1) })} className="p-0.5 hover:bg-[#F1F5F9] rounded">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs w-6 text-center">{el.fontSize}</span>
                      <button onClick={() => updateElement(el.id, { fontSize: Math.min(48, (el.fontSize ?? 12) + 1) })} className="p-0.5 hover:bg-[#F1F5F9] rounded">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Canvas + Actions */}
        <div className="lg:col-span-2 space-y-4">
          <Card variant="shadowed" padding="md">
            <h3 className="text-sm font-semibold text-[#0F172A] mb-3">
              Canvas Preview <span className="text-xs font-normal text-[#94A3B8]">(drag to reposition)</span>
            </h3>
            <div
              className="border border-[#E2E8F0] rounded-[6px] overflow-hidden bg-white inline-block"
              style={{ width: cW, height: cH }}
            >
              <Stage
                ref={stageRef}
                width={cW}
                height={cH}
                onMouseDown={(e) => {
                  if (e.target === e.target.getStage()) setSelectedId(null);
                }}
              >
                <Layer>
                  {/* Background */}
                  <Rect x={0} y={0} width={cW} height={cH} fill="white" />

                  {elements.filter((el) => el.visible).map((el) => {
                    const x = el.x * CANVAS_SCALE;
                    const y = el.y * CANVAS_SCALE;
                    const w = el.width * CANVAS_SCALE;

                    if (el.type === 'barcode' && barcodeImageEl) {
                      return (
                        <KonvaImage
                          key={el.id}
                          image={barcodeImageEl}
                          x={x}
                          y={y}
                          width={w}
                          height={50 * CANVAS_SCALE}
                          draggable
                          onClick={() => setSelectedId(el.id)}
                          onDragEnd={(e) =>
                            updateElement(el.id, {
                              x: Math.round(e.target.x() / CANVAS_SCALE),
                              y: Math.round(e.target.y() / CANVAS_SCALE),
                            })
                          }
                          stroke={selectedId === el.id ? '#2563EB' : undefined}
                          strokeWidth={selectedId === el.id ? 1 : 0}
                        />
                      );
                    }

                    if (el.type === 'text') {
                      const displayVal = resolveValue(el, labelData);
                      return (
                        <Text
                          key={el.id}
                          text={displayVal}
                          x={x}
                          y={y}
                          width={w}
                          fontSize={(el.fontSize ?? 12) * CANVAS_SCALE}
                          fontStyle={el.fontStyle === 'bold' ? 'bold' : 'normal'}
                          align={el.align || 'left'}
                          fill={selectedId === el.id ? '#2563EB' : '#0F172A'}
                          draggable
                          onClick={() => setSelectedId(el.id)}
                          onDragEnd={(e) =>
                            updateElement(el.id, {
                              x: Math.round(e.target.x() / CANVAS_SCALE),
                              y: Math.round(e.target.y() / CANVAS_SCALE),
                            })
                          }
                        />
                      );
                    }
                    return null;
                  })}
                </Layer>
              </Stage>
            </div>
          </Card>

          {/* Download Actions */}
          <Card variant="shadowed" padding="sm">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={downloadPNG} leftIcon={<Download className="w-3.5 h-3.5" />}>
                Download PNG
              </Button>
              <Button variant="ghost" size="sm" onClick={downloadPDF} leftIcon={<Download className="w-3.5 h-3.5" />}>
                Download PDF
              </Button>
            </div>
          </Card>

          {/* Bulk Labels */}
          <Card variant="shadowed" padding="md">
            <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Bulk Labels from CSV</h3>
            <div
              className="border-2 border-dashed border-[#E2E8F0] rounded-[8px] p-6 text-center cursor-pointer hover:border-[#93C5FD] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-6 h-6 text-[#94A3B8] mx-auto mb-1" />
              <p className="text-sm text-[#374151] font-medium">
                {bulkFileName || 'Upload CSV / Excel for bulk labels'}
              </p>
              <p className="text-xs text-[#94A3B8]">Columns: productName, sku, brand, price, mrp, weight</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBulkFile(f); }}
              />
            </div>
            {bulkData.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-[#374151] mb-2">{bulkData.length} products loaded</p>
                <Button onClick={downloadBulkPDF} leftIcon={<Download className="w-4 h-4" />}>
                  Download All Labels as PDF
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LabelGenerator;
