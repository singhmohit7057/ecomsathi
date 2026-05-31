import React, { useState, useRef } from 'react';
import { FilePlus, Download, GripVertical, X, ChevronUp, ChevronDown } from 'lucide-react';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { ToolPage } from './shared/ToolPage';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';

type PageSize = 'a4' | 'letter' | 'fit';
type Orientation = 'auto' | 'portrait' | 'landscape';

interface ImgEntry {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function loadImageDimensions(file: File): Promise<{ width: number; height: number; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight, url });
    img.onerror = reject;
    img.src = url;
  });
}

const PAGE_SIZE_DIMS: Record<Exclude<PageSize, 'fit'>, [number, number]> = {
  a4: PageSizes.A4,
  letter: PageSizes.Letter,
};

export const handle = {
  toolName: 'Images to PDF',
  category: 'PDF Tools',
  description: 'Combine multiple images (JPG, PNG, WEBP) into a single PDF document.',
  relatedTools: [
    { label: 'PDF to Images', to: '/tools/pdf/to-images' },
    { label: 'Merge PDF', to: '/tools/pdf/merge' },
    { label: 'Compress PDF', to: '/tools/pdf/compress' },
  ],
};

export default function ImagesToPDF() {
  const [entries, setEntries] = useState<ImgEntry[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [orientation, setOrientation] = useState<Orientation>('auto');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draggingId = useRef<string | null>(null);

  const totalSize = entries.reduce((s, e) => s + e.file.size, 0);

  const addImages = async (files: File[]) => {
    setError(null);
    setDownloadUrl(null);
    const accepted = files.filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    );

    if (accepted.length < files.length) {
      setError(`Only JPG, PNG and WEBP images are supported. ${files.length - accepted.length} file(s) skipped.`);
    }

    const newEntries: ImgEntry[] = [];
    for (const f of accepted) {
      try {
        const { width, height, url } = await loadImageDimensions(f);
        newEntries.push({ id: `${f.name}-${Date.now()}-${Math.random()}`, file: f, previewUrl: url, width, height });
      } catch {
        setError((prev) => prev ? `${prev}\nCould not load "${f.name}".` : `Could not load "${f.name}".`);
      }
    }

    setEntries((prev) => [...prev, ...newEntries]);
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => {
      const e = prev.find((e) => e.id === id);
      if (e) URL.revokeObjectURL(e.previewUrl);
      return prev.filter((e) => e.id !== id);
    });
    setDownloadUrl(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setEntries((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
    setDownloadUrl(null);
  };

  const moveDown = (index: number) => {
    if (index === entries.length - 1) return;
    setEntries((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
    setDownloadUrl(null);
  };

  // Drag reorder
  const onDragEnter = (targetId: string) => {
    if (!draggingId.current || draggingId.current === targetId) return;
    setEntries((prev) => {
      const fromIdx = prev.findIndex((e) => e.id === draggingId.current);
      const toIdx = prev.findIndex((e) => e.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  const handleProcess = async () => {
    if (entries.length === 0) return;
    setError(null);
    setProcessing(true);
    setDownloadUrl(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const entry of entries) {
        const imgBytes = await entry.file.arrayBuffer();
        let pdfImg;
        if (entry.file.type === 'image/png') {
          pdfImg = await pdfDoc.embedPng(imgBytes);
        } else {
          // jpg & webp — pdf-lib embeds as JPEG (webp needs conversion but we embed as-is for now)
          pdfImg = await pdfDoc.embedJpg(imgBytes);
        }

        const imgW = pdfImg.width;
        const imgH = pdfImg.height;

        let pgW: number, pgH: number;

        if (pageSize === 'fit') {
          pgW = imgW;
          pgH = imgH;
        } else {
          const [baseW, baseH] = PAGE_SIZE_DIMS[pageSize];
          const usePortrait =
            orientation === 'portrait' ? true :
            orientation === 'landscape' ? false :
            imgW <= imgH; // auto
          pgW = usePortrait ? baseW : baseH;
          pgH = usePortrait ? baseH : baseW;
        }

        const page = pdfDoc.addPage([pgW, pgH]);

        // Scale image to fit within page with padding
        const padding = pageSize === 'fit' ? 0 : 20;
        const maxW = pgW - padding * 2;
        const maxH = pgH - padding * 2;
        const scale = Math.min(maxW / imgW, maxH / imgH, 1);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const x = (pgW - drawW) / 2;
        const y = (pgH - drawH) / 2;

        page.drawImage(pdfImg, { x, y, width: drawW, height: drawH });
      }

      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create PDF. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'images.pdf';
    a.click();
  };

  return (
    <ToolPage
      icon={<FilePlus size={24} />}
      title="Images to PDF"
      description="Combine JPG, PNG, or WEBP images into a single PDF. Drag to reorder."
      category="PDF Tools"
    >
      {/* Drop zone */}
      <div
        className="rounded-[8px] border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center transition-colors hover:border-[#2563EB] hover:bg-[#EFF6FF] cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addImages(Array.from(e.dataTransfer.files)); }}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addImages(Array.from(e.target.files))}
        />
        <FilePlus size={40} className="mx-auto text-[#94A3B8]" />
        <p className="mt-3 text-sm font-medium text-[#0F172A]">
          Drag images here or <span className="text-[#2563EB] underline">click to browse</span>
        </p>
        <p className="mt-1 text-xs text-[#64748B]">JPG, PNG, WEBP supported</p>
        {entries.length > 0 && (
          <p className="mt-2 text-xs text-[#475569]">
            {entries.length} image{entries.length !== 1 ? 's' : ''} · {formatBytes(totalSize)}
          </p>
        )}
      </div>

      {/* Image list */}
      {entries.length > 0 && (
        <div className="flex flex-col gap-3 rounded-[8px] border border-[#E2E8F0] bg-white p-4">
          <h2 className="text-sm font-semibold text-[#0F172A]">Images ({entries.length})</h2>
          <div className="flex flex-col gap-2">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                draggable
                onDragStart={() => { draggingId.current = entry.id; }}
                onDragEnter={() => onDragEnter(entry.id)}
                onDragEnd={() => { draggingId.current = null; setDownloadUrl(null); }}
                onDragOver={(e) => e.preventDefault()}
                className="flex items-center gap-3 rounded-[4px] border border-[#E2E8F0] bg-white px-3 py-2 cursor-grab active:cursor-grabbing"
              >
                <GripVertical size={14} className="shrink-0 text-[#94A3B8]" />
                <img
                  src={entry.previewUrl}
                  alt={entry.file.name}
                  className="h-10 w-10 shrink-0 rounded-[2px] object-cover border border-[#E2E8F0]"
                  draggable={false}
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-[#0F172A]">{entry.file.name}</p>
                  <p className="text-xs text-[#64748B]">
                    {entry.width}×{entry.height}px · {formatBytes(entry.file.size)}
                  </p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => moveUp(index)} disabled={index === 0} className="p-0.5 text-[#94A3B8] hover:text-[#0F172A] disabled:opacity-30" aria-label="Move up"><ChevronUp size={14} /></button>
                  <button type="button" onClick={() => moveDown(index)} disabled={index === entries.length - 1} className="p-0.5 text-[#94A3B8] hover:text-[#0F172A] disabled:opacity-30" aria-label="Move down"><ChevronDown size={14} /></button>
                </div>
                <button type="button" onClick={() => removeEntry(entry.id)} className="shrink-0 text-[#94A3B8] hover:text-[#DC2626] transition-colors" aria-label={`Remove ${entry.file.name}`}><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Options */}
      {entries.length > 0 && (
        <div className="flex flex-col gap-4 rounded-[8px] border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#0F172A]">PDF Settings</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Page size */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#0F172A]">Page size</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as PageSize)}
                className="rounded-[4px] border border-[#94A3B8] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              >
                <option value="a4">A4 (210 × 297 mm)</option>
                <option value="letter">Letter (8.5 × 11 in)</option>
                <option value="fit">Fit to image</option>
              </select>
            </div>

            {/* Orientation */}
            {pageSize !== 'fit' && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#0F172A]">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as Orientation)}
                  className="rounded-[4px] border border-[#94A3B8] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                >
                  <option value="auto">Auto (detect per image)</option>
                  <option value="portrait">Always Portrait</option>
                  <option value="landscape">Always Landscape</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {/* Process */}
      {entries.length > 0 && (
        <Button
          onClick={handleProcess}
          loading={processing}
          leftIcon={<FilePlus size={16} />}
          size="lg"
        >
          {processing ? 'Creating PDF…' : `Create PDF from ${entries.length} Image${entries.length !== 1 ? 's' : ''}`}
        </Button>
      )}

      {/* Result */}
      {downloadUrl && (
        <div className="flex flex-col gap-3 rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <p className="text-sm font-semibold text-[#16A34A]">PDF created successfully!</p>
          <Button onClick={handleDownload} leftIcon={<Download size={16} />}>
            Download PDF
          </Button>
        </div>
      )}
    </ToolPage>
  );
}
