import React, { useState } from 'react';
import { ImageIcon, Download } from 'lucide-react';
import { ToolPage } from './shared/ToolPage';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { FileUploader } from '@/components/common/FileUploader';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'https://api.ecomsathi.in';

type Dpi = 72 | 150 | 300;
type ImgFormat = 'png' | 'jpeg';

export const handle = {
  toolName: 'PDF to Images',
  category: 'PDF Tools',
  description: 'Convert PDF pages to PNG or JPEG images at various DPI settings.',
  relatedTools: [
    { label: 'Images to PDF', to: '/tools/pdf/images-to-pdf' },
    { label: 'OCR PDF', to: '/tools/pdf/ocr' },
    { label: 'Extract Pages', to: '/tools/pdf/extract-pages' },
  ],
};

export default function PDFToImages() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [dpi, setDpi] = useState<Dpi>(150);
  const [format, setFormat] = useState<ImgFormat>('png');
  const [pageRangeAll, setPageRangeAll] = useState(true);
  const [pageRange, setPageRange] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setDownloadUrl(null);
    setPageCount(null);

    // Quick page count via fetch-as-arraybuffer (dynamic import to avoid loading pdfjs upfront)
    try {
      const { getDocument } = await import('pdfjs-dist');
      const bytes = await f.arrayBuffer();
      const pdf = await getDocument({ data: bytes }).promise;
      setPageCount(pdf.numPages);
    } catch {
      // non-critical
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setError(null);
    setProcessing(true);
    setProgress(0);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dpi', String(dpi));
      formData.append('format', format);
      if (!pageRangeAll && pageRange.trim()) {
        formData.append('pages', pageRange.trim());
      }

      // Fake progress
      let fake = 0;
      const interval = window.setInterval(() => {
        fake = Math.min(fake + 4, 90);
        setProgress(fake);
      }, 600);

      const res = await fetch(`${BACKEND_URL}/api/pdf/to-images`, {
        method: 'POST',
        body: formData,
      });

      window.clearInterval(interval);
      setProgress(95);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? `Server error ${res.status}`);
      }

      const blob = await res.blob();
      setProgress(100);
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace(/\.pdf$/i, `_images.zip`);
    a.click();
  };

  const dpiOptions: Dpi[] = [72, 150, 300];
  const dpiHints: Record<Dpi, string> = {
    72: 'Screen / web quality',
    150: 'Good quality, balanced size',
    300: 'Print quality, larger files',
  };

  return (
    <ToolPage
      icon={<ImageIcon size={24} />}
      title="PDF to Images"
      description="Convert each page of a PDF to a PNG or JPEG image. Download as a ZIP."
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
          <h2 className="text-sm font-semibold text-[#0F172A]">Conversion Settings</h2>

          {/* DPI */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0F172A]">Resolution (DPI)</label>
            <div className="grid grid-cols-3 gap-3">
              {dpiOptions.map((d) => (
                <label
                  key={d}
                  className={[
                    'flex cursor-pointer flex-col gap-0.5 rounded-[4px] border p-3 transition-colors',
                    dpi === d
                      ? 'border-[#2563EB] bg-[#EFF6FF]'
                      : 'border-[#E2E8F0] hover:border-[#94A3B8]',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="dpi"
                      value={d}
                      checked={dpi === d}
                      onChange={() => setDpi(d)}
                      className="accent-[#2563EB]"
                    />
                    <span className="text-sm font-semibold text-[#0F172A]">{d} DPI</span>
                  </div>
                  <p className="pl-5 text-xs text-[#64748B]">{dpiHints[d]}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Format */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0F172A]">Image format</label>
            <div className="flex gap-3">
              {(['png', 'jpeg'] as ImgFormat[]).map((f) => (
                <label
                  key={f}
                  className={[
                    'flex cursor-pointer items-center gap-2 rounded-[4px] border px-4 py-2 text-sm font-medium transition-colors',
                    format === f
                      ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                      : 'border-[#E2E8F0] text-[#475569] hover:border-[#94A3B8]',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="format"
                    value={f}
                    checked={format === f}
                    onChange={() => setFormat(f)}
                    className="accent-[#2563EB]"
                  />
                  {f.toUpperCase()}
                  {f === 'png' && <span className="text-xs text-[#64748B]">(lossless)</span>}
                  {f === 'jpeg' && <span className="text-xs text-[#64748B]">(smaller)</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Page range */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0F172A]">Pages to convert</label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#0F172A]">
              <input
                type="radio"
                name="page-range"
                checked={pageRangeAll}
                onChange={() => setPageRangeAll(true)}
                className="accent-[#2563EB]"
              />
              All pages
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#0F172A]">
              <input
                type="radio"
                name="page-range"
                checked={!pageRangeAll}
                onChange={() => setPageRangeAll(false)}
                className="accent-[#2563EB]"
              />
              Page range
            </label>
            {!pageRangeAll && (
              <input
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="e.g. 1-5, 8, 10-12"
                className="rounded-[4px] border border-[#94A3B8] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {/* Progress */}
      {processing && (
        <div className="flex flex-col gap-2 rounded-[8px] border border-[#E2E8F0] bg-white p-4">
          <div className="flex items-center justify-between text-sm text-[#475569]">
            <span>Converting pages to images…</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
            <div
              className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Process */}
      {file && !processing && (
        <Button
          onClick={handleProcess}
          leftIcon={<ImageIcon size={16} />}
          size="lg"
        >
          Convert to Images
        </Button>
      )}

      {/* Result */}
      {downloadUrl && (
        <div className="flex flex-col gap-3 rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <p className="text-sm font-semibold text-[#16A34A]">Conversion complete!</p>
          <p className="text-sm text-[#15803D]">All page images are packaged in a ZIP file.</p>
          <Button onClick={handleDownload} leftIcon={<Download size={16} />}>
            Download Images ZIP
          </Button>
        </div>
      )}
    </ToolPage>
  );
}
