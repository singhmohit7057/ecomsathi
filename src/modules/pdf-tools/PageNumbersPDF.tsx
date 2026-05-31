import React, { useState } from 'react';
import { Hash, Download } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ToolPage } from './shared/ToolPage';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { FileUploader } from '@/components/common/FileUploader';

type NumberStyle = 'n' | 'n/total' | 'page-n' | 'page-n-of-total';
type Position = 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'top-center';

const STYLE_LABELS: Record<NumberStyle, string> = {
  'n': '1',
  'n/total': '1 / 12',
  'page-n': 'Page 1',
  'page-n-of-total': 'Page 1 of 12',
};

const POSITION_LABELS: Record<Position, string> = {
  'bottom-center': 'Bottom Center',
  'bottom-right': 'Bottom Right',
  'bottom-left': 'Bottom Left',
  'top-right': 'Top Right',
  'top-left': 'Top Left',
  'top-center': 'Top Center',
};

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? { r: parseInt(r[1], 16) / 255, g: parseInt(r[2], 16) / 255, b: parseInt(r[3], 16) / 255 }
    : { r: 0, g: 0, b: 0 };
}

function formatPageNum(
  style: NumberStyle,
  current: number,
  total: number
): string {
  switch (style) {
    case 'n': return String(current);
    case 'n/total': return `${current} / ${total}`;
    case 'page-n': return `Page ${current}`;
    case 'page-n-of-total': return `Page ${current} of ${total}`;
  }
}

function getXY(
  pos: Position,
  pageW: number,
  pageH: number,
  textW: number,
  fontSize: number,
  margin: number
): { x: number; y: number } {
  const isBottom = pos.startsWith('bottom');
  const y = isBottom ? margin : pageH - margin - fontSize;
  let x: number;
  if (pos.includes('center')) x = (pageW - textW) / 2;
  else if (pos.includes('right')) x = pageW - textW - margin;
  else x = margin;
  return { x, y };
}

export const handle = {
  toolName: 'Add Page Numbers',
  category: 'PDF Tools',
  description: 'Add page numbers to your PDF with custom position, style, and font.',
  relatedTools: [
    { label: 'Watermark PDF', to: '/tools/pdf/watermark' },
    { label: 'Merge PDF', to: '/tools/pdf/merge' },
    { label: 'Extract Pages', to: '/tools/pdf/extract-pages' },
  ],
};

export default function PageNumbersPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [style, setStyle] = useState<NumberStyle>('page-n-of-total');
  const [position, setPosition] = useState<Position>('bottom-center');
  const [startNumber, setStartNumber] = useState(1);
  const [firstPageToNumber, setFirstPageToNumber] = useState(1);
  const [fontSize, setFontSize] = useState(11);
  const [color, setColor] = useState('#555555');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setDownloadUrl(null);
    setPageCount(null);

    try {
      const bytes = await f.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      setPageCount(pdfDoc.getPageCount());
    } catch {
      setError('Could not read this PDF.');
    }
  };

  const handleProcess = async () => {
    if (!file || !pageCount) return;
    setError(null);
    setProcessing(true);
    setDownloadUrl(null);

    try {
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const { r, g, b } = hexToRgb(color);
      const pages = pdfDoc.getPages();
      const total = pageCount;
      const margin = 24;

      pages.forEach((page, idx) => {
        const pageNum = idx + 1;
        if (pageNum < firstPageToNumber) return;

        const displayNum = startNumber + (pageNum - firstPageToNumber);
        const text = formatPageNum(style, displayNum, total - firstPageToNumber + startNumber);
        const { width, height } = page.getSize();
        const textW = font.widthOfTextAtSize(text, fontSize);
        const { x, y } = getXY(position, width, height, textW, fontSize, margin);

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(r, g, b),
        });
      });

      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add page numbers. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace(/\.pdf$/i, '_numbered.pdf');
    a.click();
  };

  return (
    <ToolPage
      icon={<Hash size={24} />}
      title="Add Page Numbers"
      description="Add page numbers to your PDF with customizable style and position."
      category="PDF Tools"
    >
      {/* Upload */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6">
        <FileUploader
          accept={{ 'application/pdf': ['.pdf'] }}
          maxSizeMB={50}
          multiple={false}
          onFiles={handleFile}
          label="Upload PDF"
        />
        {pageCount != null && (
          <p className="mt-2 text-xs text-[#475569]">{pageCount} pages detected</p>
        )}
      </div>

      {/* Options */}
      {file && (
        <div className="flex flex-col gap-5 rounded-[8px] border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#0F172A]">Page Number Settings</h2>

          {/* Number style */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0F172A]">Number style</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(STYLE_LABELS) as NumberStyle[]).map((s) => (
                <label
                  key={s}
                  className={[
                    'flex cursor-pointer flex-col items-center gap-1 rounded-[4px] border p-3 text-center transition-colors',
                    style === s
                      ? 'border-[#2563EB] bg-[#EFF6FF]'
                      : 'border-[#E2E8F0] hover:border-[#94A3B8]',
                  ].join(' ')}
                >
                  <input type="radio" name="style" value={s} checked={style === s} onChange={() => setStyle(s)} className="hidden" />
                  <span className="text-sm font-semibold text-[#0F172A]">{STYLE_LABELS[s]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Position */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0F172A]">Position</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as Position)}
              className="rounded-[4px] border border-[#94A3B8] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            >
              {(Object.keys(POSITION_LABELS) as Position[]).map((p) => (
                <option key={p} value={p}>{POSITION_LABELS[p]}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Start number */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#0F172A]">Start number</label>
              <input
                type="number"
                min={1}
                value={startNumber}
                onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="rounded-[4px] border border-[#94A3B8] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            {/* First page to number */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#0F172A]">
                Start from page
                <span className="ml-1 text-xs text-[#64748B]">(skip cover page)</span>
              </label>
              <input
                type="number"
                min={1}
                max={pageCount ?? 1}
                value={firstPageToNumber}
                onChange={(e) => setFirstPageToNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="rounded-[4px] border border-[#94A3B8] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            {/* Font size */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#0F172A]">Font size: {fontSize}pt</label>
              <input
                type="range"
                min={8}
                max={24}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="accent-[#2563EB]"
              />
            </div>

            {/* Color */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#0F172A]">Text color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-[4px] border border-[#94A3B8] p-0.5"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-28 rounded-[4px] border border-[#94A3B8] px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center justify-center rounded-[4px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-3">
            <span style={{ color, fontSize, fontFamily: 'Helvetica, sans-serif' }}>
              {formatPageNum(style, startNumber, (pageCount ?? 12) - firstPageToNumber + startNumber + 5)}
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {/* Process */}
      {file && (
        <Button
          onClick={handleProcess}
          loading={processing}
          leftIcon={<Hash size={16} />}
          size="lg"
        >
          {processing ? 'Adding page numbers…' : 'Add Page Numbers'}
        </Button>
      )}

      {/* Result */}
      {downloadUrl && (
        <div className="flex flex-col gap-3 rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <p className="text-sm font-semibold text-[#16A34A]">Page numbers added!</p>
          <Button onClick={handleDownload} leftIcon={<Download size={16} />}>
            Download Numbered PDF
          </Button>
        </div>
      )}
    </ToolPage>
  );
}
