import React, { useState } from 'react';
import { ScanText, Download, Info } from 'lucide-react';
import { ToolPage } from './shared/ToolPage';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { FileUploader } from '@/components/common/FileUploader';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'https://api.ecomsathi.in';
const CLIENT_SIDE_LIMIT_MB = 5;

type OutputType = 'searchable-pdf' | 'plain-text';

export const handle = {
  toolName: 'OCR PDF',
  category: 'PDF Tools',
  description: 'Extract text from scanned/image-based PDFs using Optical Character Recognition.',
  relatedTools: [
    { label: 'Compress PDF', to: '/tools/pdf/compress' },
    { label: 'PDF to Images', to: '/tools/pdf/to-images' },
    { label: 'Merge PDF', to: '/tools/pdf/merge' },
  ],
};

export default function OcrPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [outputType, setOutputType] = useState<OutputType>('searchable-pdf');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState('');

  const handleFile = (files: File[]) => {
    setFile(files[0] ?? null);
    setError(null);
    setDownloadUrl(null);
    setProgress(0);
  };

  const runClientSideOcr = async (f: File) => {
    // Dynamic import to avoid loading tesseract.js on initial load
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          setProgress(Math.round(m.progress * 100));
          setProgressMsg(`Recognizing text… ${Math.round(m.progress * 100)}%`);
        } else {
          setProgressMsg(m.status);
        }
      },
    });

    setProgressMsg('Loading OCR engine…');
    setProgress(10);

    if (outputType === 'plain-text') {
      // For plain text we process each page
      const { createWorker: _cw, ..._ } = await import('tesseract.js');
      const { data } = await worker.recognize(f);
      await worker.terminate();
      const blob = new Blob([data.text], { type: 'text/plain' });
      return { url: URL.createObjectURL(blob), name: f.name.replace(/\.pdf$/i, '_ocr.txt') };
    } else {
      // For searchable PDF output — we generate hOCR and wrap in PDF
      // Basic approach: recognize and produce hOCR
      const { data } = await worker.recognize(f, {}, { hocr: true });
      await worker.terminate();
      // Return hOCR as text fallback (full server-side PDF embedding is backend)
      const blob = new Blob([data.hocr ?? data.text], { type: 'text/html' });
      return { url: URL.createObjectURL(blob), name: f.name.replace(/\.pdf$/i, '_ocr.hocr') };
    }
  };

  const runServerSideOcr = async (f: File) => {
    const formData = new FormData();
    formData.append('file', f);
    formData.append('language', 'eng');
    formData.append('output', outputType);

    // Simulate progress via polling interval
    let fake = 0;
    const interval = window.setInterval(() => {
      fake = Math.min(fake + 3, 90);
      setProgress(fake);
      setProgressMsg(fake < 30 ? 'Uploading file…' : fake < 60 ? 'Running OCR…' : 'Building output…');
    }, 800);

    try {
      const res = await fetch(`${BACKEND_URL}/api/pdf/ocr`, {
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
      const ext = outputType === 'plain-text' ? '.txt' : '.pdf';
      return {
        url: URL.createObjectURL(blob),
        name: f.name.replace(/\.pdf$/i, `_ocr${ext}`),
      };
    } finally {
      window.clearInterval(interval);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setError(null);
    setProcessing(true);
    setProgress(0);
    setProgressMsg('Starting…');
    setDownloadUrl(null);

    try {
      const fileSizeMB = file.size / (1024 * 1024);
      let result: { url: string; name: string };

      if (fileSizeMB <= CLIENT_SIDE_LIMIT_MB) {
        result = await runClientSideOcr(file);
      } else {
        result = await runServerSideOcr(file);
      }

      setProgress(100);
      setProgressMsg('Done!');
      setDownloadUrl(result.url);
      setDownloadName(result.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OCR failed. Please try again.');
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
      icon={<ScanText size={24} />}
      title="OCR PDF"
      description="Convert scanned or image-based PDFs into searchable text using OCR technology."
      category="PDF Tools"
    >
      {/* Upload */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6">
        <FileUploader
          accept={{ 'application/pdf': ['.pdf'] }}
          maxSizeMB={50}
          multiple={false}
          onFiles={handleFile}
          label="Upload PDF (scanned / image-based)"
        />
      </div>

      {/* Options */}
      {file && (
        <div className="flex flex-col gap-4 rounded-[8px] border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#0F172A]">OCR Options</h2>

          {/* Language */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#0F172A]">Language</label>
            <div className="flex items-center gap-2">
              <select
                disabled
                className="rounded-[4px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#475569]"
              >
                <option>English</option>
              </select>
              <span className="flex items-center gap-1 text-xs text-[#64748B]">
                <Info size={12} />
                More languages coming soon
              </span>
            </div>
          </div>

          {/* Output type */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0F172A]">Output format</label>
            {(
              [
                {
                  value: 'searchable-pdf',
                  label: 'Searchable PDF',
                  hint: 'Original PDF with invisible text layer added — copy/search enabled',
                },
                {
                  value: 'plain-text',
                  label: 'Plain Text (.txt)',
                  hint: 'Extracted text only, no formatting',
                },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className={[
                  'flex cursor-pointer items-start gap-3 rounded-[4px] border p-3 transition-colors',
                  outputType === opt.value
                    ? 'border-[#2563EB] bg-[#EFF6FF]'
                    : 'border-[#E2E8F0] hover:border-[#94A3B8]',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="output-type"
                  value={opt.value}
                  checked={outputType === opt.value}
                  onChange={() => setOutputType(opt.value)}
                  className="mt-0.5 accent-[#2563EB]"
                />
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{opt.label}</p>
                  <p className="text-xs text-[#64748B]">{opt.hint}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Processing note */}
          <Alert
            variant="info"
            message={
              file.size / (1024 * 1024) <= CLIENT_SIDE_LIMIT_MB
                ? `Small file (<${CLIENT_SIDE_LIMIT_MB}MB) — OCR will run in your browser using Tesseract.js.`
                : `Large file — OCR will be processed on our secure server. Your file is not stored permanently.`
            }
          />
        </div>
      )}

      {/* Error */}
      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {/* Progress */}
      {processing && (
        <div className="flex flex-col gap-2 rounded-[8px] border border-[#E2E8F0] bg-white p-4">
          <div className="flex items-center justify-between text-sm text-[#475569]">
            <span>{progressMsg}</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
            <div
              className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[#64748B]">
            OCR can take 1–3 minutes for multi-page documents. Please wait…
          </p>
        </div>
      )}

      {/* Process */}
      {file && !processing && (
        <Button
          onClick={handleProcess}
          leftIcon={<ScanText size={16} />}
          size="lg"
        >
          Run OCR
        </Button>
      )}

      {/* Result */}
      {downloadUrl && (
        <div className="flex flex-col gap-3 rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <p className="text-sm font-semibold text-[#16A34A]">OCR complete!</p>
          <Button onClick={handleDownload} leftIcon={<Download size={16} />}>
            Download Result
          </Button>
        </div>
      )}
    </ToolPage>
  );
}
