import React, { useState } from 'react';
import { Scissors, Download, FileText } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { ToolPage } from './shared/ToolPage';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { FileUploader } from '@/components/common/FileUploader';

type SplitMode = 'ranges' | 'every-n' | 'all';

function parseRanges(input: string, maxPage: number): Array<[number, number]> {
  const parts = input.split(',').map((s) => s.trim()).filter(Boolean);
  const ranges: Array<[number, number]> = [];

  for (const part of parts) {
    const match = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!match) throw new Error(`Invalid range: "${part}"`);
    const start = parseInt(match[1], 10);
    const end = match[2] ? parseInt(match[2], 10) : start;
    if (start < 1 || end > maxPage || start > end) {
      throw new Error(`Range "${part}" is out of bounds (1–${maxPage}).`);
    }
    ranges.push([start, end]);
  }

  if (ranges.length === 0) throw new Error('Please enter at least one page range.');
  return ranges;
}

export const handle = {
  toolName: 'Split PDF',
  category: 'PDF Tools',
  description: 'Split a PDF by page ranges, extract every N pages, or get each page separately.',
  relatedTools: [
    { label: 'Merge PDF', to: '/tools/pdf/merge' },
    { label: 'Extract Pages', to: '/tools/pdf/extract-pages' },
    { label: 'Rearrange Pages', to: '/tools/pdf/rearrange' },
  ],
};

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [mode, setMode] = useState<SplitMode>('ranges');
  const [rangeInput, setRangeInput] = useState('');
  const [everyN, setEveryN] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState('split.zip');

  const handleFile = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setDownloadUrl(null);
    setPageCount(null);

    try {
      const bytes = await f.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      setPageCount(pdf.getPageCount());
    } catch {
      setError('Could not read this PDF. It may be corrupted or password-protected.');
    }
  };

  const handleProcess = async () => {
    if (!file || !pageCount) return;
    setError(null);
    setProcessing(true);
    setDownloadUrl(null);

    try {
      const bytes = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(bytes);
      const zip = new JSZip();

      let parts: Array<number[]> = [];

      if (mode === 'all') {
        parts = Array.from({ length: pageCount }, (_, i) => [i]);
      } else if (mode === 'every-n') {
        for (let i = 0; i < pageCount; i += everyN) {
          const chunk: number[] = [];
          for (let j = i; j < Math.min(i + everyN, pageCount); j++) chunk.push(j);
          parts.push(chunk);
        }
      } else {
        // ranges mode
        const ranges = parseRanges(rangeInput, pageCount);
        parts = ranges.map(([start, end]) =>
          Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i)
        );
      }

      for (let idx = 0; idx < parts.length; idx++) {
        const pageIndices = parts[idx];
        const newPdf = await PDFDocument.create();
        const copied = await newPdf.copyPages(srcPdf, pageIndices);
        copied.forEach((p) => newPdf.addPage(p));
        const pdfBytes = await newPdf.save();
        const label = mode === 'ranges'
          ? `part_${idx + 1}_pages_${pageIndices[0] + 1}-${pageIndices[pageIndices.length - 1] + 1}`
          : `part_${String(idx + 1).padStart(3, '0')}`;
        zip.file(`${label}.pdf`, pdfBytes);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const name = `${file.name.replace(/\.pdf$/i, '')}_split.zip`;
      setDownloadUrl(url);
      setDownloadName(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Split failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = downloadName;
    a.click();
  };

  return (
    <ToolPage
      icon={<Scissors size={24} />}
      title="Split PDF"
      description="Split a PDF into multiple files by page ranges, chunk size, or individual pages."
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
          <p className="mt-3 text-sm text-[#475569]">
            <FileText size={14} className="mr-1 inline" />
            {file?.name} — <strong>{pageCount}</strong> page{pageCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Options */}
      {pageCount != null && (
        <div className="flex flex-col gap-4 rounded-[8px] border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#0F172A]">Split Options</h2>

          {/* Mode selector */}
          <div className="flex flex-col gap-2">
            {(
              [
                { value: 'ranges', label: 'By page ranges', hint: 'e.g. 1-3, 4-6, 7' },
                { value: 'every-n', label: 'Every N pages', hint: 'Split into equal chunks' },
                { value: 'all', label: 'Every page separately', hint: `Extract all ${pageCount} pages as individual files` },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className={[
                  'flex cursor-pointer items-start gap-3 rounded-[4px] border p-3 transition-colors',
                  mode === opt.value
                    ? 'border-[#2563EB] bg-[#EFF6FF]'
                    : 'border-[#E2E8F0] hover:border-[#94A3B8]',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="split-mode"
                  value={opt.value}
                  checked={mode === opt.value}
                  onChange={() => setMode(opt.value)}
                  className="mt-0.5 accent-[#2563EB]"
                />
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{opt.label}</p>
                  <p className="text-xs text-[#64748B]">{opt.hint}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Range input */}
          {mode === 'ranges' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#0F172A]">
                Page ranges <span className="text-[#64748B]">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder={`e.g. 1-3, 4-6, 7-${pageCount}`}
                className="rounded-[4px] border border-[#94A3B8] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
              <p className="text-xs text-[#64748B]">
                Each range becomes a separate PDF. Valid page numbers: 1–{pageCount}.
              </p>
            </div>
          )}

          {/* Every N */}
          {mode === 'every-n' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#0F172A]">Pages per chunk</label>
              <input
                type="number"
                min={1}
                max={pageCount - 1}
                value={everyN}
                onChange={(e) => setEveryN(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-32 rounded-[4px] border border-[#94A3B8] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
              <p className="text-xs text-[#64748B]">
                Will create {Math.ceil(pageCount / everyN)} files.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {/* Process */}
      {pageCount != null && (
        <Button
          onClick={handleProcess}
          loading={processing}
          leftIcon={<Scissors size={16} />}
          size="lg"
          disabled={mode === 'ranges' && !rangeInput.trim()}
        >
          {processing ? 'Splitting…' : 'Split PDF'}
        </Button>
      )}

      {/* Result */}
      {downloadUrl && (
        <div className="flex flex-col gap-3 rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <p className="text-sm font-semibold text-[#16A34A]">Split complete!</p>
          <p className="text-sm text-[#15803D]">Your split PDFs are packaged in a ZIP file.</p>
          <Button onClick={handleDownload} leftIcon={<Download size={16} />}>
            Download ZIP
          </Button>
        </div>
      )}
    </ToolPage>
  );
}
