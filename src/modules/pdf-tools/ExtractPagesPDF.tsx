import React, { useState, useCallback } from 'react';
import { FileMinus, Download, CheckSquare, Square } from 'lucide-react';
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
  index: number;
  dataUrl: string;
}

async function renderAllThumbs(file: File): Promise<PageThumb[]> {
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const total = pdf.getPageCount();
  const thumbs: PageThumb[] = [];

  for (let i = 0; i < total; i++) {
    const page = await pdf.getPage(i + 1);
    const viewport = page.getViewport({ scale: 0.25 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
    thumbs.push({ index: i, dataUrl: canvas.toDataURL('image/jpeg', 0.6) });
  }

  return thumbs;
}

export const handle = {
  toolName: 'Extract Pages',
  category: 'PDF Tools',
  description: 'Select specific pages from a PDF and extract them into a new file.',
  relatedTools: [
    { label: 'Split PDF', to: '/tools/pdf/split' },
    { label: 'Rearrange Pages', to: '/tools/pdf/rearrange' },
    { label: 'Merge PDF', to: '/tools/pdf/merge' },
  ],
};

export default function ExtractPagesPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [thumbs, setThumbs] = useState<PageThumb[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loadingThumbs, setLoadingThumbs] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setDownloadUrl(null);
    setSelected(new Set());
    setLoadingThumbs(true);

    try {
      const t = await renderAllThumbs(f);
      setThumbs(t);
    } catch {
      setError('Could not render page previews. The PDF may be corrupted or password-protected.');
    } finally {
      setLoadingThumbs(false);
    }
  };

  const togglePage = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
    setDownloadUrl(null);
  };

  const selectAll = () => setSelected(new Set(thumbs.map((t) => t.index)));
  const selectNone = () => setSelected(new Set());

  const handleProcess = async () => {
    if (!file || selected.size === 0) return;
    setError(null);
    setProcessing(true);
    setDownloadUrl(null);

    try {
      const bytes = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(bytes);
      const newPdf = await PDFDocument.create();

      const pageIndices = Array.from(selected).sort((a, b) => a - b);
      const copied = await newPdf.copyPages(srcPdf, pageIndices);
      copied.forEach((p) => newPdf.addPage(p));

      const outBytes = await newPdf.save();
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace(/\.pdf$/i, '_extracted.pdf');
    a.click();
  };

  return (
    <ToolPage
      icon={<FileMinus size={24} />}
      title="Extract Pages"
      description="Select individual pages from your PDF and save them as a new document."
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
      {(loadingThumbs || thumbs.length > 0) && (
        <div className="flex flex-col gap-4 rounded-[8px] border border-[#E2E8F0] bg-white p-4">
          {loadingThumbs ? (
            <p className="text-sm text-[#64748B]">Loading page previews…</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#0F172A]">
                  Select pages to extract ({selected.size} selected)
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="flex items-center gap-1 text-xs text-[#2563EB] hover:underline"
                  >
                    <CheckSquare size={12} />
                    All
                  </button>
                  <button
                    type="button"
                    onClick={selectNone}
                    className="flex items-center gap-1 text-xs text-[#64748B] hover:underline"
                  >
                    <Square size={12} />
                    None
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
                {thumbs.map((t) => {
                  const isSelected = selected.has(t.index);
                  return (
                    <button
                      key={t.index}
                      type="button"
                      onClick={() => togglePage(t.index)}
                      className={[
                        'flex flex-col items-center gap-1 rounded-[4px] p-1 transition-all',
                        isSelected
                          ? 'bg-[#EFF6FF] ring-2 ring-[#2563EB]'
                          : 'hover:bg-[#F8FAFC]',
                      ].join(' ')}
                      aria-label={`${isSelected ? 'Deselect' : 'Select'} page ${t.index + 1}`}
                      aria-pressed={isSelected}
                    >
                      <div className="relative w-full overflow-hidden rounded-[2px] border border-[#E2E8F0]">
                        <img
                          src={t.dataUrl}
                          alt={`Page ${t.index + 1}`}
                          className="block w-full"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#2563EB]/20">
                            <CheckSquare size={20} className="text-[#2563EB]" />
                          </div>
                        )}
                      </div>
                      <span className={`text-xs ${isSelected ? 'font-semibold text-[#2563EB]' : 'text-[#64748B]'}`}>
                        {t.index + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {/* Process */}
      {file && selected.size > 0 && (
        <Button
          onClick={handleProcess}
          loading={processing}
          leftIcon={<FileMinus size={16} />}
          size="lg"
        >
          {processing ? 'Extracting…' : `Extract ${selected.size} Page${selected.size !== 1 ? 's' : ''}`}
        </Button>
      )}

      {file && thumbs.length > 0 && selected.size === 0 && (
        <Alert variant="info" message="Click pages above to select which ones to extract." />
      )}

      {/* Result */}
      {downloadUrl && (
        <div className="flex flex-col gap-3 rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <p className="text-sm font-semibold text-[#16A34A]">Pages extracted!</p>
          <Button onClick={handleDownload} leftIcon={<Download size={16} />}>
            Download Extracted PDF
          </Button>
        </div>
      )}
    </ToolPage>
  );
}
