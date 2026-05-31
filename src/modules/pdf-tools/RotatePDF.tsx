import React, { useState, useEffect, useCallback } from 'react';
import { RotateCw, Download } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { ToolPage } from './shared/ToolPage';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { FileUploader } from '@/components/common/FileUploader';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

type RotationDeg = 90 | -90 | 180;
type PageMode = 'all' | 'specific';

interface PageThumb {
  index: number;
  dataUrl: string;
  currentRotation: number;
}

const ROTATION_LABELS: Record<number, string> = {
  90: '90° Clockwise',
  [-90]: '90° Counter-CW',
  180: '180°',
};

async function renderThumbnails(file: File, overrides: Map<number, number>): Promise<PageThumb[]> {
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const total = pdf.getPageCount();
  const thumbs: PageThumb[] = [];

  for (let i = 0; i < total; i++) {
    const page = await pdf.getPage(i + 1);
    const baseRot = page.rotate;
    const extra = overrides.get(i) ?? 0;
    const totalRot = (baseRot + extra + 360) % 360;
    const viewport = page.getViewport({ scale: 0.25, rotation: totalRot });
    const canvas = document.createElement('canvas');
    canvas.width = Math.abs(viewport.width);
    canvas.height = Math.abs(viewport.height);
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    thumbs.push({ index: i, dataUrl: canvas.toDataURL('image/jpeg', 0.6), currentRotation: totalRot });
  }

  return thumbs;
}

export const handle = {
  toolName: 'Rotate PDF',
  category: 'PDF Tools',
  description: 'Rotate all or specific pages of a PDF — 90° CW, 90° CCW, or 180°.',
  relatedTools: [
    { label: 'Crop PDF', to: '/tools/pdf/crop' },
    { label: 'Rearrange Pages', to: '/tools/pdf/rearrange' },
    { label: 'Extract Pages', to: '/tools/pdf/extract-pages' },
  ],
};

export default function RotatePDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [thumbs, setThumbs] = useState<PageThumb[]>([]);
  const [loadingThumbs, setLoadingThumbs] = useState(false);
  const [pageMode, setPageMode] = useState<PageMode>('all');
  const [specificPages, setSpecificPages] = useState('');
  const [rotation, setRotation] = useState<RotationDeg>(90);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  // Track per-page rotation overrides (in addition to PDF intrinsic rotation)
  const [rotationOverrides] = useState<Map<number, number>>(new Map());

  const loadThumbs = useCallback(async (f: File, overrides: Map<number, number>) => {
    setLoadingThumbs(true);
    try {
      const t = await renderThumbnails(f, overrides);
      setPageCount(t.length);
      setThumbs(t);
    } catch {
      setError('Could not render page previews.');
    } finally {
      setLoadingThumbs(false);
    }
  }, []);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setDownloadUrl(null);
    rotationOverrides.clear();
    await loadThumbs(f, rotationOverrides);
  };

  const parsePageList = (input: string): number[] => {
    const indices: number[] = [];
    const parts = input.split(',').map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      const m = part.match(/^(\d+)(?:-(\d+))?$/);
      if (!m) continue;
      const start = parseInt(m[1], 10);
      const end = m[2] ? parseInt(m[2], 10) : start;
      for (let p = start; p <= end; p++) {
        if (p >= 1 && p <= pageCount) indices.push(p - 1);
      }
    }
    return [...new Set(indices)];
  };

  const handleProcess = async () => {
    if (!file) return;
    setError(null);
    setProcessing(true);
    setDownloadUrl(null);

    try {
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();

      const pageIndices =
        pageMode === 'all'
          ? pages.map((_, i) => i)
          : parsePageList(specificPages);

      for (const idx of pageIndices) {
        const page = pages[idx];
        const current = page.getRotation().angle;
        page.setRotation(degrees((current + rotation + 360) % 360));
      }

      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rotation failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace(/\.pdf$/i, '_rotated.pdf');
    a.click();
  };

  return (
    <ToolPage
      icon={<RotateCw size={24} />}
      title="Rotate PDF"
      description="Rotate all or specific pages of your PDF by 90° or 180°."
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

      {/* Options */}
      {file && (
        <div className="flex flex-col gap-4 rounded-[8px] border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#0F172A]">Rotation Settings</h2>

          {/* Rotation angle */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0F172A]">Rotation angle</label>
            <div className="flex flex-wrap gap-2">
              {([90, -90, 180] as RotationDeg[]).map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => setRotation(deg)}
                  className={[
                    'flex items-center gap-2 rounded-[4px] border px-4 py-2 text-sm font-medium transition-colors',
                    rotation === deg
                      ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                      : 'border-[#E2E8F0] text-[#475569] hover:border-[#94A3B8]',
                  ].join(' ')}
                >
                  <RotateCw
                    size={14}
                    className={deg === -90 ? '-scale-x-100' : ''}
                    style={deg === 180 ? { transform: 'rotate(180deg)' } : undefined}
                  />
                  {ROTATION_LABELS[deg]}
                </button>
              ))}
            </div>
          </div>

          {/* Page selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0F172A]">Apply to</label>
            <div className="flex flex-col gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#0F172A]">
                <input
                  type="radio"
                  name="page-mode"
                  checked={pageMode === 'all'}
                  onChange={() => setPageMode('all')}
                  className="accent-[#2563EB]"
                />
                All pages ({pageCount})
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#0F172A]">
                <input
                  type="radio"
                  name="page-mode"
                  checked={pageMode === 'specific'}
                  onChange={() => setPageMode('specific')}
                  className="accent-[#2563EB]"
                />
                Specific pages
              </label>
            </div>

            {pageMode === 'specific' && (
              <input
                type="text"
                value={specificPages}
                onChange={(e) => setSpecificPages(e.target.value)}
                placeholder="e.g. 1, 3, 5-8"
                className="rounded-[4px] border border-[#94A3B8] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            )}
          </div>
        </div>
      )}

      {/* Thumbnails */}
      {file && thumbs.length > 0 && (
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-[#0F172A]">
            Page Preview{loadingThumbs ? ' (Loading…)' : ''}
          </h2>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
            {thumbs.map((t) => (
              <div key={t.index} className="flex flex-col items-center gap-1">
                <div className="relative overflow-hidden rounded-[4px] border border-[#E2E8F0]">
                  <img
                    src={t.dataUrl}
                    alt={`Page ${t.index + 1}`}
                    className="block w-full object-contain"
                  />
                </div>
                <span className="text-xs text-[#64748B]">{t.index + 1}</span>
              </div>
            ))}
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
          leftIcon={<RotateCw size={16} />}
          size="lg"
          disabled={pageMode === 'specific' && !specificPages.trim()}
        >
          {processing ? 'Rotating…' : 'Apply Rotation'}
        </Button>
      )}

      {/* Result */}
      {downloadUrl && (
        <div className="flex flex-col gap-3 rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <p className="text-sm font-semibold text-[#16A34A]">Rotation applied!</p>
          <Button onClick={handleDownload} leftIcon={<Download size={16} />}>
            Download Rotated PDF
          </Button>
        </div>
      )}
    </ToolPage>
  );
}
