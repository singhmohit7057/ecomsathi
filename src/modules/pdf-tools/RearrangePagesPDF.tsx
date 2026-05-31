import React, { useState, useRef } from 'react';
import { LayoutGrid, Download, GripVertical, X } from 'lucide-react';
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

interface PageThumb {
  id: string;
  originalIndex: number;
  dataUrl: string;
}

async function renderAllThumbs(file: File): Promise<PageThumb[]> {
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const total = pdf.getPageCount();
  const thumbs: PageThumb[] = [];

  for (let i = 0; i < total; i++) {
    const page = await pdf.getPage(i + 1);
    const viewport = page.getViewport({ scale: 0.28 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
    thumbs.push({
      id: `page-${i}-${Date.now()}`,
      originalIndex: i,
      dataUrl: canvas.toDataURL('image/jpeg', 0.6),
    });
  }

  return thumbs;
}

export const handle = {
  toolName: 'Rearrange Pages',
  category: 'PDF Tools',
  description: 'Drag and drop PDF page thumbnails to reorder them.',
  relatedTools: [
    { label: 'Extract Pages', to: '/tools/pdf/extract-pages' },
    { label: 'Merge PDF', to: '/tools/pdf/merge' },
    { label: 'Split PDF', to: '/tools/pdf/split' },
  ],
};

export default function RearrangePagesPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageThumb[]>([]);
  const [loadingThumbs, setLoadingThumbs] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragNode = useRef<string | null>(null);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setDownloadUrl(null);
    setLoadingThumbs(true);

    try {
      const t = await renderAllThumbs(f);
      setPages(t);
    } catch {
      setError('Could not render page previews. The PDF may be corrupted or password-protected.');
    } finally {
      setLoadingThumbs(false);
    }
  };

  const onDragStart = (id: string) => {
    setDraggingId(id);
    dragNode.current = id;
  };

  const onDragEnter = (id: string) => {
    if (dragNode.current === id) return;
    setDragOverId(id);
    setPages((prev) => {
      const fromIdx = prev.findIndex((p) => p.id === dragNode.current);
      const toIdx = prev.findIndex((p) => p.id === id);
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
    setDownloadUrl(null);
  };

  const removePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
    setDownloadUrl(null);
  };

  const resetOrder = () => {
    if (!file) return;
    setPages((prev) => [...prev].sort((a, b) => a.originalIndex - b.originalIndex));
    setDownloadUrl(null);
  };

  const handleProcess = async () => {
    if (!file || pages.length === 0) return;
    setError(null);
    setProcessing(true);
    setDownloadUrl(null);

    try {
      const bytes = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(bytes);
      const newPdf = await PDFDocument.create();

      const pageIndices = pages.map((p) => p.originalIndex);
      const copied = await newPdf.copyPages(srcPdf, pageIndices);
      copied.forEach((p) => newPdf.addPage(p));

      const outBytes = await newPdf.save();
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace(/\.pdf$/i, '_rearranged.pdf');
    a.click();
  };

  const isReordered =
    pages.length > 0 &&
    pages.some((p, i) => p.originalIndex !== i);

  return (
    <ToolPage
      icon={<LayoutGrid size={24} />}
      title="Rearrange Pages"
      description="Drag to reorder PDF pages. Remove unwanted pages too."
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

      {/* Page grid */}
      {(loadingThumbs || pages.length > 0) && (
        <div className="flex flex-col gap-4 rounded-[8px] border border-[#E2E8F0] bg-white p-4">
          {loadingThumbs ? (
            <p className="text-sm text-[#64748B]">Loading page previews…</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#0F172A]">
                  Drag to reorder — {pages.length} pages
                </h2>
                {isReordered && (
                  <button
                    type="button"
                    onClick={resetOrder}
                    className="text-xs text-[#64748B] hover:text-[#0F172A] hover:underline"
                  >
                    Reset order
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
                {pages.map((page, posIndex) => (
                  <div
                    key={page.id}
                    draggable
                    onDragStart={() => onDragStart(page.id)}
                    onDragEnter={() => onDragEnter(page.id)}
                    onDragEnd={onDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={[
                      'group relative flex flex-col items-center gap-1 rounded-[4px] border p-1 transition-all cursor-grab active:cursor-grabbing',
                      draggingId === page.id ? 'opacity-40' : 'opacity-100',
                      dragOverId === page.id
                        ? 'border-[#2563EB] bg-[#EFF6FF]'
                        : 'border-[#E2E8F0] hover:border-[#94A3B8]',
                    ].join(' ')}
                  >
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removePage(page.id); }}
                      className="absolute right-0.5 top-0.5 hidden rounded-full bg-[#DC2626] p-0.5 text-white group-hover:block"
                      aria-label={`Remove page ${posIndex + 1}`}
                    >
                      <X size={10} />
                    </button>

                    {/* Drag handle */}
                    <GripVertical size={12} className="mb-0.5 text-[#94A3B8]" />

                    {/* Thumbnail */}
                    <div className="w-full overflow-hidden rounded-[2px] border border-[#E2E8F0]">
                      <img
                        src={page.dataUrl}
                        alt={`Page ${posIndex + 1}`}
                        className="block w-full"
                        draggable={false}
                      />
                    </div>

                    <span className="text-xs text-[#64748B]">{posIndex + 1}</span>
                    {page.originalIndex !== posIndex && (
                      <span className="text-xs text-[#94A3B8]">(was {page.originalIndex + 1})</span>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#64748B]">
                Drag pages to reorder. Hover a page and click × to remove it.
              </p>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {/* Process */}
      {pages.length > 0 && (
        <Button
          onClick={handleProcess}
          loading={processing}
          leftIcon={<LayoutGrid size={16} />}
          size="lg"
        >
          {processing ? 'Building PDF…' : 'Save Rearranged PDF'}
        </Button>
      )}

      {/* Result */}
      {downloadUrl && (
        <div className="flex flex-col gap-3 rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <p className="text-sm font-semibold text-[#16A34A]">PDF rearranged successfully!</p>
          <Button onClick={handleDownload} leftIcon={<Download size={16} />}>
            Download Rearranged PDF
          </Button>
        </div>
      )}
    </ToolPage>
  );
}
