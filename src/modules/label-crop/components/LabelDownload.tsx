import React from 'react';
import { CheckCircle2, RotateCcw, Package, FileText, FolderDown, Ruler } from 'lucide-react';
import { Button } from '@/components/common/Button';
import type { CropPreview, CropSize, LabelCropSettings, BatchMergeResult } from '../types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href    = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function PreviewThumb({
  url, label, size,
}: {
  url: string; label: string; size?: CropSize;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Header row: label + size badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-[#475569] uppercase tracking-wide">
          {label}
        </span>
        {size && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] px-2 py-0.5 text-[10px] font-medium text-[#475569]">
            <Ruler size={9} />
            {size.widthMm} × {size.heightMm} mm
          </span>
        )}
      </div>
      {/* Thumbnail */}
      <div className="rounded-[6px] border border-[#E2E8F0] overflow-hidden bg-[#F8FAFC] shadow-sm">
        <img
          src={url}
          alt={label}
          className="w-full max-h-56 object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single-file result
// ---------------------------------------------------------------------------

interface SingleDownloadProps {
  filename:     string;
  labelBlob:    Blob;
  invoiceBlob?: Blob;
  preview:      CropPreview;
  settings:     LabelCropSettings;
  onReset:      () => void;
}

export const SingleDownload: React.FC<SingleDownloadProps> = ({
  filename, labelBlob, invoiceBlob, preview, settings, onReset,
}) => {
  const fmt = settings.outputFormat === 'thermal' ? 'thermal' : 'a4';

  const dlLabel   = () => downloadBlob(labelBlob,    `${filename}-label-${fmt}.pdf`);
  const dlInvoice = () => downloadBlob(invoiceBlob!, `${filename}-invoice-${fmt}.pdf`);
  const dlBoth    = () => { dlLabel(); setTimeout(dlInvoice, 250); };

  return (
    <div className="rounded-[10px] border border-[#BBF7D0] bg-[#F0FDF4] flex flex-col gap-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 bg-[#DCFCE7]">
        <CheckCircle2 size={15} className="text-[#16A34A] shrink-0" />
        <span className="text-sm font-semibold text-[#166534] flex-1">{filename}</span>
        <span className="text-xs text-[#16A34A]">{settings.outputFormat === 'thermal' ? 'Thermal 4×6' : 'A4 sheet'}</span>
      </div>

      {/* Crop previews */}
      <div className={`p-5 grid gap-4 ${preview.invoiceUrl ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <PreviewThumb url={preview.labelUrl}   label="Label"   size={preview.labelSize} />
        {preview.invoiceUrl && (
          <PreviewThumb url={preview.invoiceUrl} label="Invoice" size={preview.invoiceSize} />
        )}
      </div>

      {/* Download buttons */}
      <div className="px-5 pb-5 flex flex-wrap gap-3 items-center border-t border-[#BBF7D0] pt-4">
        <Button leftIcon={<Package size={15} />} onClick={dlLabel}>
          Download Label
        </Button>
        {invoiceBlob && (
          <Button variant="outline" leftIcon={<FileText size={15} />} onClick={dlInvoice}>
            Download Invoice
          </Button>
        )}
        {invoiceBlob && (
          <Button variant="ghost" leftIcon={<FolderDown size={15} />} onClick={dlBoth}>
            Download Both
          </Button>
        )}
        <button type="button" onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#2563EB] transition-colors ml-auto">
          <RotateCcw size={12} /> Process another
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Batch result
// ---------------------------------------------------------------------------

interface BatchDownloadProps {
  result:          BatchMergeResult;
  settings:        LabelCropSettings;
  onReset:         () => void;
  marketplaceName: string;
}

export const BatchDownload: React.FC<BatchDownloadProps> = ({
  result, settings, onReset, marketplaceName,
}) => {
  const name = marketplaceName.toLowerCase();
  const fmt  = settings.outputFormat;

  const dlLabels   = () => downloadBlob(result.labelsPdf,    `${name}-labels-${fmt}.pdf`);
  const dlInvoices = () => downloadBlob(result.invoicesPdf!, `${name}-invoices-${fmt}.pdf`);
  const dlBoth     = () => { dlLabels(); setTimeout(dlInvoices, 250); };

  return (
    <div className="rounded-[10px] border border-[#BBF7D0] bg-[#F0FDF4] flex flex-col gap-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 bg-[#DCFCE7]">
        <CheckCircle2 size={15} className="text-[#16A34A] shrink-0" />
        <span className="text-sm font-semibold text-[#166534] flex-1">
          {result.fileCount} file{result.fileCount !== 1 ? 's' : ''} · {result.labelCount} label{result.labelCount !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-[#16A34A]">Merged into single PDFs</span>
      </div>

      {/* Crop previews */}
      <div className={`p-5 grid gap-4 ${result.preview.invoiceUrl ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <PreviewThumb url={result.preview.labelUrl}   label={`Labels (${result.labelCount} total)`} size={result.preview.labelSize} />
        {result.preview.invoiceUrl && (
          <PreviewThumb url={result.preview.invoiceUrl} label="Invoices" size={result.preview.invoiceSize} />
        )}
      </div>

      {/* Pills */}
      <div className="px-5 flex flex-wrap gap-2 pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#BBF7D0] px-3 py-1 text-xs font-medium text-[#166534]">
          <Package size={11} /> {result.labelCount} labels → 1 PDF
        </span>
        {result.invoicesPdf && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#BBF7D0] px-3 py-1 text-xs font-medium text-[#166534]">
            <FileText size={11} /> {result.labelCount} invoices → 1 PDF
          </span>
        )}
      </div>

      {/* Download buttons */}
      <div className="px-5 pb-5 flex flex-wrap gap-3 items-center border-t border-[#BBF7D0] pt-4">
        <Button leftIcon={<Package size={15} />} onClick={dlLabels}>
          Download Labels PDF
        </Button>
        {result.invoicesPdf && (
          <Button variant="outline" leftIcon={<FileText size={15} />} onClick={dlInvoices}>
            Download Invoices PDF
          </Button>
        )}
        {result.invoicesPdf && (
          <Button variant="ghost" leftIcon={<FolderDown size={15} />} onClick={dlBoth}>
            Download Both
          </Button>
        )}
        <button type="button" onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#2563EB] transition-colors ml-auto">
          <RotateCcw size={12} /> New batch
        </button>
      </div>
    </div>
  );
};
