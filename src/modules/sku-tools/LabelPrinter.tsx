// ============================================================
// EcomSathi — Label Printer (Print-ready viewer)
// ============================================================
import React, { useState, useRef, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { Printer, Upload, Download, FileText, Layout, ChevronDown } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

// ─── Types ────────────────────────────────────────────────
type LayoutOption = '1up' | '2up' | '4up-a4' | 'thermal-4x6';

interface LayoutConfig {
  id: LayoutOption;
  name: string;
  cols: number;
  rows: number;
  pageFormat: string | [number, number];
  labelW: number; // mm
  labelH: number; // mm
  marginX: number;
  marginY: number;
  gapX: number;
  gapY: number;
  description: string;
}

const LAYOUTS: LayoutConfig[] = [
  {
    id: '1up',
    name: '1-up (Full Page)',
    cols: 1, rows: 1,
    pageFormat: 'a4',
    labelW: 190, labelH: 277,
    marginX: 10, marginY: 10,
    gapX: 0, gapY: 0,
    description: 'One label per A4 page',
  },
  {
    id: '2up',
    name: '2-up (A4)',
    cols: 2, rows: 1,
    pageFormat: 'a4',
    labelW: 92, labelH: 277,
    marginX: 8, marginY: 10,
    gapX: 6, gapY: 0,
    description: 'Two labels side by side on A4',
  },
  {
    id: '4up-a4',
    name: '4-up (A4)',
    cols: 2, rows: 2,
    pageFormat: 'a4',
    labelW: 92, labelH: 134,
    marginX: 8, marginY: 10,
    gapX: 6, gapY: 5,
    description: 'Four labels per A4 page',
  },
  {
    id: 'thermal-4x6',
    name: 'Thermal 4×6 in',
    cols: 1, rows: 1,
    pageFormat: [101.6, 152.4],
    labelW: 95.6, labelH: 146.4,
    marginX: 3, marginY: 3,
    gapX: 0, gapY: 0,
    description: 'Single thermal label 4×6 inches',
  },
];

interface UploadedPage {
  dataUrl: string;
  name: string;
}

// ─── Component ────────────────────────────────────────────
export const LabelPrinter: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const [layout, setLayout] = useState<LayoutOption>('4up-a4');
  const [pages, setPages] = useState<UploadedPage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);

  const layoutConfig = LAYOUTS.find((l) => l.id === layout)!;

  // ── File Upload ────────────────────────────────────────
  const processFile = useCallback((file: File) => {
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      toast.error('Please upload a PDF or image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      if (file.type.includes('image')) {
        setPages([{ dataUrl: url, name: file.name }]);
        toast.success('Image loaded');
      } else {
        // For PDF, show as iframe/embed preview
        setPages([{ dataUrl: url, name: file.name }]);
        toast.success('PDF loaded');
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  // ── Print ──────────────────────────────────────────────
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { toast.error('Could not open print window'); return; }

    const cfg = layoutConfig;
    const perPage = cfg.cols * cfg.rows;
    const totalItems = pages.length;

    const styles = `
      @page {
        size: ${Array.isArray(cfg.pageFormat) ? `${cfg.pageFormat[0]}mm ${cfg.pageFormat[1]}mm` : cfg.pageFormat} portrait;
        margin: 0;
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { width: 100%; }
      .print-sheet {
        display: grid;
        grid-template-columns: repeat(${cfg.cols}, ${cfg.labelW}mm);
        grid-template-rows: repeat(${cfg.rows}, ${cfg.labelH}mm);
        gap: ${cfg.gapY}mm ${cfg.gapX}mm;
        padding: ${cfg.marginY}mm ${cfg.marginX}mm;
        page-break-after: always;
        break-after: page;
      }
      .label-cell {
        width: ${cfg.labelW}mm;
        height: ${cfg.labelH}mm;
        overflow: hidden;
        border: 0.5pt dashed #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .label-cell img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
      .label-cell embed {
        width: 100%;
        height: 100%;
      }
      @media print {
        .label-cell { border-color: transparent; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `;

    let sheetsHtml = '';
    const sheets = Math.ceil(totalItems / perPage);

    for (let s = 0; s < sheets; s++) {
      let cells = '';
      for (let c = 0; c < perPage; c++) {
        const idx = s * perPage + c;
        if (idx < pages.length) {
          const p = pages[idx];
          if (p.dataUrl.includes('data:application/pdf') || p.dataUrl.includes('data:application/octet')) {
            cells += `<div class="label-cell"><embed src="${p.dataUrl}" type="application/pdf" /></div>`;
          } else {
            cells += `<div class="label-cell"><img src="${p.dataUrl}" alt="${p.name}" /></div>`;
          }
        } else {
          cells += '<div class="label-cell"></div>';
        }
      }
      sheetsHtml += `<div class="print-sheet">${cells}</div>`;
    }

    printWindow.document.write(`<!DOCTYPE html><html><head><style>${styles}</style></head><body>${sheetsHtml}</body></html>`);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  // ── Generate PDF ───────────────────────────────────────
  const generatePDF = async () => {
    if (!pages.length) { toast.error('Upload labels first'); return; }
    setProcessing(true);
    const cfg = layoutConfig;
    const doc = new jsPDF({
      unit: 'mm',
      format: Array.isArray(cfg.pageFormat) ? cfg.pageFormat : 'a4',
    });

    const perPage = cfg.cols * cfg.rows;

    for (let i = 0; i < pages.length; i++) {
      const pageIdx = Math.floor(i / perPage);
      const cellIdx = i % perPage;
      if (i > 0 && cellIdx === 0) doc.addPage();

      const col = cellIdx % cfg.cols;
      const row = Math.floor(cellIdx / cfg.cols);
      const x = cfg.marginX + col * (cfg.labelW + cfg.gapX);
      const y = cfg.marginY + row * (cfg.labelH + cfg.gapY);

      const p = pages[i];
      if (p.dataUrl.startsWith('data:image')) {
        const imgType = p.dataUrl.includes('png') ? 'PNG' : 'JPEG';
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            doc.addImage(img, imgType, x, y, cfg.labelW, cfg.labelH);
            resolve();
          };
          img.src = p.dataUrl;
        });
      }
    }

    doc.save('print-ready-labels.pdf');
    setProcessing(false);
    toast.success('Print-ready PDF downloaded');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
          <Printer className="w-6 h-6 text-[#2563EB]" />
          Label Printer
        </h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Arrange labels on print sheets and send to printer or download print-ready PDF.
        </p>
      </div>

      {/* Layout Selector */}
      <Card variant="shadowed" padding="md">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Page Layout</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLayout(l.id)}
              className={`p-3 rounded-[8px] border text-left transition-colors ${
                layout === l.id
                  ? 'border-[#2563EB] bg-[#EFF6FF]'
                  : 'border-[#E2E8F0] bg-white hover:border-[#93C5FD]'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <LayoutIcon cols={l.cols} rows={l.rows} />
              </div>
              <p className={`text-xs font-semibold ${layout === l.id ? 'text-[#1E40AF]' : 'text-[#374151]'}`}>
                {l.name}
              </p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">{l.description}</p>
            </button>
          ))}
        </div>

        {/* Upload Zone */}
        <div
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
            {pages.length > 0
              ? `${pages.length} label${pages.length > 1 ? 's' : ''} loaded — click to replace`
              : 'Upload PDF or image labels'}
          </p>
          <p className="text-xs text-[#94A3B8] mt-1">Supports PDF, PNG, JPG</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              files.forEach(processFile);
            }}
          />
        </div>
      </Card>

      {/* Print Sheet Preview */}
      {pages.length > 0 && (
        <Card variant="shadowed" padding="md">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-3">
            Print Sheet Preview ({layoutConfig.name})
          </h2>

          {/* Visual grid preview */}
          <div className="overflow-auto border border-[#E2E8F0] rounded-[6px] p-4 bg-[#F8FAFC]">
            <div
              className="bg-white shadow-md mx-auto"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${layoutConfig.cols}, 1fr)`,
                gap: `${layoutConfig.gapY * 2}px ${layoutConfig.gapX * 2}px`,
                padding: `${layoutConfig.marginY * 2}px ${layoutConfig.marginX * 2}px`,
                maxWidth: '500px',
                aspectRatio: Array.isArray(layoutConfig.pageFormat)
                  ? `${layoutConfig.pageFormat[0]} / ${layoutConfig.pageFormat[1]}`
                  : '210/297',
              }}
            >
              {Array.from({ length: layoutConfig.cols * layoutConfig.rows }).map((_, i) => {
                const page = pages[i];
                return (
                  <div
                    key={i}
                    className="border border-dashed border-[#CBD5E1] rounded overflow-hidden bg-white flex items-center justify-center"
                    style={{ aspectRatio: `${layoutConfig.labelW} / ${layoutConfig.labelH}` }}
                  >
                    {page ? (
                      page.dataUrl.includes('data:image') ? (
                        <img src={page.dataUrl} alt={page.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 text-[#94A3B8]">
                          <FileText className="w-5 h-5" />
                          <span className="text-[10px]">{page.name}</span>
                        </div>
                      )
                    ) : (
                      <span className="text-[10px] text-[#E2E8F0] font-medium">empty</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Print CSS for print button */}
          <style>{`
            @media print {
              body > *:not(#print-labels) { display: none !important; }
              #print-labels { display: block !important; }
            }
          `}</style>
        </Card>
      )}

      {/* Actions */}
      {pages.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <Button onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />} size="md">
            Print Now
          </Button>
          <Button
            variant="ghost"
            onClick={generatePDF}
            loading={processing}
            leftIcon={<Download className="w-4 h-4" />}
            size="md"
          >
            Download Print-Ready PDF
          </Button>
        </div>
      )}

      {/* Tips */}
      <Card variant="sky" padding="md">
        <h3 className="text-sm font-semibold text-[#0C4A6E] mb-2">Printing Tips</h3>
        <ul className="text-xs text-[#0C4A6E] space-y-1 list-disc list-inside">
          <li>Use "Fit to page" OFF in print dialog for accurate label sizes</li>
          <li>For thermal printers, select "Thermal 4×6" layout and set paper size in printer settings</li>
          <li>Print on sticker sheets: select "4-up A4" and use A4 label sticker paper</li>
          <li>Check "Print at 100% scale" to avoid size distortion</li>
        </ul>
      </Card>
    </div>
  );
};

// ─── Layout Icon Component ─────────────────────────────────
const LayoutIcon: React.FC<{ cols: number; rows: number }> = ({ cols, rows }) => {
  const cells = cols * rows;
  return (
    <div
      className="grid gap-0.5 bg-[#E2E8F0] p-1 rounded"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, width: 32, height: 32 }}
    >
      {Array.from({ length: cells }).map((_, i) => (
        <div key={i} className="bg-[#93C5FD] rounded-[1px]" />
      ))}
    </div>
  );
};

export default LabelPrinter;
