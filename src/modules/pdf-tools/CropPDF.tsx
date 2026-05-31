import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Crop, Download } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { ToolPage } from './shared/ToolPage';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { FileUploader } from '@/components/common/FileUploader';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type ApplyMode = 'all' | 'range';

export const handle = {
  toolName: 'Crop PDF',
  category: 'PDF Tools',
  description: 'Crop PDF pages by drawing a selection rectangle on the preview.',
  relatedTools: [
    { label: 'Rotate PDF', to: '/tools/pdf/rotate' },
    { label: 'Merge PDF', to: '/tools/pdf/merge' },
    { label: 'Compress PDF', to: '/tools/pdf/compress' },
  ],
};

export default function CropPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pdfNaturalW, setPdfNaturalW] = useState(0);
  const [pdfNaturalH, setPdfNaturalH] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const dragging = useRef(false);
  const startPt = useRef({ x: 0, y: 0 });
  const [applyMode, setApplyMode] = useState<ApplyMode>('all');
  const [pageRange, setPageRange] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);

  const renderFirstPage = useCallback(async (f: File) => {
    const bytes = await f.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    setPageCount(pdf.getPageCount());
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    setPdfNaturalW(viewport.width);
    setPdfNaturalH(viewport.height);

    const maxW = Math.min(800, window.innerWidth - 80);
    const scale = maxW / viewport.width;
    setCanvasScale(scale);
    const scaledVp = page.getViewport({ scale });

    const canvas = canvasRef.current!;
    canvas.width = scaledVp.width;
    canvas.height = scaledVp.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport: scaledVp }).promise;

    // mirror size to overlay
    const overlay = overlayRef.current!;
    overlay.width = scaledVp.width;
    overlay.height = scaledVp.height;
  }, []);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setDownloadUrl(null);
    setCropRect(null);
    try {
      await renderFirstPage(f);
    } catch {
      setError('Could not render PDF preview. File may be corrupted or password-protected.');
    }
  };

  // Draw crop rectangle on overlay canvas
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d')!;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    if (!cropRect) return;

    // Dimming outside
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, overlay.width, overlay.height);
    ctx.clearRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);

    // Border
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);

    // Corner handles
    const hs = 8;
    ctx.fillStyle = '#2563EB';
    [[cropRect.x, cropRect.y], [cropRect.x + cropRect.w - hs, cropRect.y],
      [cropRect.x, cropRect.y + cropRect.h - hs], [cropRect.x + cropRect.w - hs, cropRect.y + cropRect.h - hs]
    ].forEach(([hx, hy]) => ctx.fillRect(hx, hy, hs, hs));
  }, [cropRect]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = overlayRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    dragging.current = true;
    startPt.current = getPos(e);
    setCropRect(null);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging.current) return;
    const cur = getPos(e);
    const x = Math.min(startPt.current.x, cur.x);
    const y = Math.min(startPt.current.y, cur.y);
    const w = Math.abs(cur.x - startPt.current.x);
    const h = Math.abs(cur.y - startPt.current.y);
    if (w > 4 && h > 4) setCropRect({ x, y, w, h });
  };

  const onMouseUp = () => {
    dragging.current = false;
  };

  const handleProcess = async () => {
    if (!file || !cropRect || !pageCount) return;
    setError(null);
    setProcessing(true);
    setDownloadUrl(null);

    try {
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);

      // Determine which pages to crop
      let pagesToCrop: number[] = [];
      if (applyMode === 'all') {
        pagesToCrop = Array.from({ length: pageCount }, (_, i) => i);
      } else {
        // parse range
        const parts = pageRange.split(',').map((s) => s.trim());
        for (const part of parts) {
          const m = part.match(/^(\d+)(?:-(\d+))?$/);
          if (!m) throw new Error(`Invalid page range: "${part}"`);
          const start = parseInt(m[1], 10);
          const end = m[2] ? parseInt(m[2], 10) : start;
          for (let p = start; p <= end; p++) {
            if (p >= 1 && p <= pageCount) pagesToCrop.push(p - 1);
          }
        }
      }

      // Convert canvas coords to PDF coords
      const scaleX = pdfNaturalW / (canvasRef.current!.width);
      const scaleY = pdfNaturalH / (canvasRef.current!.height);
      const pdfX = cropRect.x * scaleX;
      const pdfY = pdfNaturalH - (cropRect.y + cropRect.h) * scaleY;
      const pdfW = cropRect.w * scaleX;
      const pdfH = cropRect.h * scaleY;

      for (const idx of pagesToCrop) {
        const page = pdfDoc.getPage(idx);
        page.setCropBox(pdfX, pdfY, pdfW, pdfH);
      }

      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Crop failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace(/\.pdf$/i, '_cropped.pdf');
    a.click();
  };

  return (
    <ToolPage
      icon={<Crop size={24} />}
      title="Crop PDF"
      description="Draw a crop rectangle on the page preview to define the crop area."
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
      </div>

      {/* Preview + crop selector */}
      {file && (
        <div className="flex flex-col gap-3 rounded-[8px] border border-[#E2E8F0] bg-white p-4">
          <h2 className="text-sm font-semibold text-[#0F172A]">
            Draw crop region on preview{' '}
            <span className="text-xs font-normal text-[#64748B]">(drag to select)</span>
          </h2>
          <div className="relative inline-block max-w-full overflow-auto">
            <canvas ref={canvasRef} className="block max-w-full rounded-[4px]" />
            <canvas
              ref={overlayRef}
              className="absolute inset-0 cursor-crosshair"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            />
          </div>
          {cropRect && (
            <p className="text-xs text-[#475569]">
              Crop area: {Math.round(cropRect.w / canvasScale)} × {Math.round(cropRect.h / canvasScale)} pt
              (in PDF units)
            </p>
          )}
        </div>
      )}

      {/* Options */}
      {file && pageCount != null && (
        <div className="flex flex-col gap-4 rounded-[8px] border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#0F172A]">Apply crop to</h2>
          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#0F172A]">
              <input
                type="radio"
                name="apply-mode"
                checked={applyMode === 'all'}
                onChange={() => setApplyMode('all')}
                className="accent-[#2563EB]"
              />
              All {pageCount} pages
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#0F172A]">
              <input
                type="radio"
                name="apply-mode"
                checked={applyMode === 'range'}
                onChange={() => setApplyMode('range')}
                className="accent-[#2563EB]"
              />
              Specific pages
            </label>
          </div>

          {applyMode === 'range' && (
            <input
              type="text"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              placeholder={`e.g. 1, 3-5, 7`}
              className="rounded-[4px] border border-[#94A3B8] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
          )}
        </div>
      )}

      {/* Error */}
      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {/* Process */}
      {file && cropRect && (
        <Button
          onClick={handleProcess}
          loading={processing}
          leftIcon={<Crop size={16} />}
          size="lg"
        >
          {processing ? 'Cropping…' : 'Apply Crop'}
        </Button>
      )}

      {!cropRect && file && (
        <Alert variant="info" message="Draw a crop rectangle on the preview above to continue." />
      )}

      {/* Result */}
      {downloadUrl && (
        <div className="flex flex-col gap-3 rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <p className="text-sm font-semibold text-[#16A34A]">Crop applied successfully!</p>
          <Button onClick={handleDownload} leftIcon={<Download size={16} />}>
            Download Cropped PDF
          </Button>
        </div>
      )}
    </ToolPage>
  );
}
