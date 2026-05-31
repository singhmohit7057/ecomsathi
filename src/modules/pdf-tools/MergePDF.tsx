import React, { useState, useCallback, useRef } from 'react';
import { Merge, GripVertical, FileText, X, Download, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { ToolPage } from './shared/ToolPage';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'https://api.ecomsathi.in';
const MAX_FILES = 20;
const MAX_TOTAL_MB = 50;

interface PdfEntry {
  id: string;
  file: File;
  pageCount: number | null;
  thumbnail: string | null;
  loading: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function getPdfPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return pdf.numPages;
}

async function getPdfThumbnail(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 0.4 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/jpeg', 0.7);
}

export const handle = {
  toolName: 'Merge PDF',
  category: 'PDF Tools',
  description: 'Combine multiple PDF files into one. Drag to reorder before merging.',
  relatedTools: [
    { label: 'Split PDF', to: '/tools/pdf/split' },
    { label: 'Extract Pages', to: '/tools/pdf/extract-pages' },
    { label: 'Rearrange Pages', to: '/tools/pdf/rearrange' },
  ],
};

export default function MergePDF() {
  const [entries, setEntries] = useState<PdfEntry[]>([]);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragNode = useRef<string | null>(null);

  const totalSize = entries.reduce((sum, e) => sum + e.file.size, 0);
  const totalMB = totalSize / (1024 * 1024);

  const addFiles = useCallback(async (files: File[]) => {
    setError(null);
    setDownloadUrl(null);

    const pdfFiles = files.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (pdfFiles.length === 0) {
      setError('Please select PDF files only.');
      return;
    }

    const newTotal = entries.length + pdfFiles.length;
    if (newTotal > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed. You can add ${MAX_FILES - entries.length} more.`);
      return;
    }

    const newTotalSize = totalSize + pdfFiles.reduce((s, f) => s + f.size, 0);
    if (newTotalSize > MAX_TOTAL_MB * 1024 * 1024) {
      setError(`Total size cannot exceed ${MAX_TOTAL_MB}MB.`);
      return;
    }

    const newEntries: PdfEntry[] = pdfFiles.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      file: f,
      pageCount: null,
      thumbnail: null,
      loading: true,
    }));

    setEntries((prev) => [...prev, ...newEntries]);

    // Load metadata asynchronously
    for (const entry of newEntries) {
      try {
        const [pageCount, thumbnail] = await Promise.all([
          getPdfPageCount(entry.file),
          getPdfThumbnail(entry.file),
        ]);
        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, pageCount, thumbnail, loading: false } : e))
        );
      } catch {
        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, loading: false } : e))
        );
      }
    }
  }, [entries.length, totalSize]);

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDownloadUrl(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setEntries((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === entries.length - 1) return;
    setEntries((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  // Drag-to-reorder handlers
  const onDragStart = (id: string) => {
    setDraggingId(id);
    dragNode.current = id;
  };

  const onDragEnter = (id: string) => {
    if (dragNode.current === id) return;
    setDragOverId(id);
    setEntries((prev) => {
      const fromIdx = prev.findIndex((e) => e.id === dragNode.current);
      const toIdx = prev.findIndex((e) => e.id === id);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  const onDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
    dragNode.current = null;
  };

  const handleDropzone = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleMerge = async () => {
    if (entries.length < 2) {
      setError('Please add at least 2 PDF files to merge.');
      return;
    }
    setError(null);
    setProcessing(true);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      entries.forEach((e) => formData.append('files', e.file));

      const res = await fetch(`${BACKEND_URL}/api/pdf/merge`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? `Server error ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Merge failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'merged.pdf';
    a.click();
  };

  return (
    <ToolPage
      icon={<Merge size={24} />}
      title="Merge PDF"
      description="Combine multiple PDF files into a single document. Drag to reorder files."
      category="PDF Tools"
    >
      {/* Drop Zone */}
      <div
        className="rounded-[8px] border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center transition-colors hover:border-[#2563EB] hover:bg-[#EFF6FF]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropzone}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
        />
        <FileText size={40} className="mx-auto text-[#94A3B8]" />
        <p className="mt-3 text-sm font-medium text-[#0F172A]">
          Drag PDFs here or <span className="text-[#2563EB] underline">click to browse</span>
        </p>
        <p className="mt-1 text-xs text-[#64748B]">
          Up to {MAX_FILES} files · Max {MAX_TOTAL_MB}MB total
        </p>
        {entries.length > 0 && (
          <p className="mt-2 text-xs text-[#475569]">
            {entries.length} file{entries.length !== 1 ? 's' : ''} · {formatBytes(totalSize)}
          </p>
        )}
      </div>

      {/* Error */}
      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {/* File list */}
      {entries.length > 0 && (
        <div className="flex flex-col gap-3 rounded-[8px] border border-[#E2E8F0] bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0F172A]">
              Files to merge ({entries.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowThumbnails((v) => !v)}
              className="text-xs text-[#2563EB] hover:underline"
            >
              {showThumbnails ? 'Hide' : 'Show'} thumbnails
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                draggable
                onDragStart={() => onDragStart(entry.id)}
                onDragEnter={() => onDragEnter(entry.id)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={[
                  'flex items-center gap-3 rounded-[4px] border px-3 py-2 transition-all',
                  draggingId === entry.id ? 'opacity-40' : 'opacity-100',
                  dragOverId === entry.id ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#E2E8F0] bg-white',
                ].join(' ')}
              >
                {/* Drag handle */}
                <GripVertical size={16} className="shrink-0 cursor-grab text-[#94A3B8] active:cursor-grabbing" />

                {/* Thumbnail */}
                {showThumbnails && (
                  <div className="h-14 w-10 shrink-0 overflow-hidden rounded-[2px] border border-[#E2E8F0] bg-[#F8FAFC]">
                    {entry.loading ? (
                      <div className="h-full w-full animate-pulse bg-[#E2E8F0]" />
                    ) : entry.thumbnail ? (
                      <img src={entry.thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <FileText size={16} className="m-auto mt-3 text-[#94A3B8]" />
                    )}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-[#0F172A]">{entry.file.name}</p>
                  <p className="text-xs text-[#64748B]">
                    {formatBytes(entry.file.size)}
                    {entry.pageCount != null && ` · ${entry.pageCount} page${entry.pageCount !== 1 ? 's' : ''}`}
                    {entry.loading && ' · Loading…'}
                  </p>
                </div>

                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="rounded p-0.5 text-[#94A3B8] hover:text-[#0F172A] disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === entries.length - 1}
                    className="rounded p-0.5 text-[#94A3B8] hover:text-[#0F172A] disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="shrink-0 text-[#94A3B8] hover:text-[#DC2626] transition-colors"
                  aria-label={`Remove ${entry.file.name}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs text-[#64748B]">
            Tip: Drag rows or use the arrows to reorder files.
          </p>
        </div>
      )}

      {/* Merge button */}
      {entries.length >= 2 && (
        <Button
          onClick={handleMerge}
          loading={processing}
          leftIcon={<Merge size={16} />}
          size="lg"
        >
          {processing ? 'Merging…' : `Merge ${entries.length} PDFs`}
        </Button>
      )}

      {/* Result */}
      {downloadUrl && (
        <div className="flex flex-col gap-3 rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <div className="flex items-center gap-2 text-[#16A34A]">
            <Eye size={18} />
            <span className="text-sm font-semibold">Merge complete!</span>
          </div>
          <p className="text-sm text-[#15803D]">
            Your PDFs have been merged. Click below to download.
          </p>
          <Button
            onClick={handleDownload}
            leftIcon={<Download size={16} />}
            variant="primary"
          >
            Download Merged PDF
          </Button>
        </div>
      )}
    </ToolPage>
  );
}
