import React, { useState } from 'react';
import { FileArchive, Download, ArrowRight } from 'lucide-react';
import { ToolPage } from './shared/ToolPage';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { FileUploader } from '@/components/common/FileUploader';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'https://api.ecomsathi.in';

type Level = 'light' | 'balanced' | 'maximum';

const LEVEL_CONFIG: Record<Level, { label: string; ratio: number; hint: string }> = {
  light:    { label: 'Light',    ratio: 0.90, hint: 'Minor compression — best quality retained' },
  balanced: { label: 'Balanced', ratio: 0.70, hint: 'Good quality with significant size reduction' },
  maximum:  { label: 'Maximum',  ratio: 0.50, hint: 'Maximum reduction — some quality loss possible' },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const handle = {
  toolName: 'Compress PDF',
  category: 'PDF Tools',
  description: 'Reduce PDF file size with three compression levels.',
  relatedTools: [
    { label: 'Merge PDF', to: '/tools/pdf/merge' },
    { label: 'OCR PDF', to: '/tools/pdf/ocr' },
    { label: 'PDF to Images', to: '/tools/pdf/to-images' },
  ],
};

export default function CompressPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<Level>('balanced');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);

  const handleFile = (files: File[]) => {
    setFile(files[0] ?? null);
    setError(null);
    setDownloadUrl(null);
    setResultSize(null);
  };

  const estimatedSize = file
    ? Math.round(file.size * LEVEL_CONFIG[level].ratio)
    : null;

  const savings = file && estimatedSize
    ? Math.round((1 - estimatedSize / file.size) * 100)
    : null;

  const handleProcess = async () => {
    if (!file) return;
    setError(null);
    setProcessing(true);
    setDownloadUrl(null);
    setResultSize(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('level', level);

      const res = await fetch(`${BACKEND_URL}/api/pdf/compress`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? `Server error ${res.status}`);
      }

      const blob = await res.blob();
      setResultSize(blob.size);
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compression failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace(/\.pdf$/i, '_compressed.pdf');
    a.click();
  };

  return (
    <ToolPage
      icon={<FileArchive size={24} />}
      title="Compress PDF"
      description="Reduce your PDF file size for easier sharing and storage."
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
          <h2 className="text-sm font-semibold text-[#0F172A]">Compression Level</h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(Object.keys(LEVEL_CONFIG) as Level[]).map((lv) => {
              const cfg = LEVEL_CONFIG[lv];
              const est = file ? Math.round(file.size * cfg.ratio) : 0;
              return (
                <label
                  key={lv}
                  className={[
                    'flex cursor-pointer flex-col gap-1 rounded-[4px] border p-4 transition-colors',
                    level === lv
                      ? 'border-[#2563EB] bg-[#EFF6FF]'
                      : 'border-[#E2E8F0] hover:border-[#94A3B8]',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="level"
                      value={lv}
                      checked={level === lv}
                      onChange={() => setLevel(lv)}
                      className="accent-[#2563EB]"
                    />
                    <span className="text-sm font-semibold text-[#0F172A]">{cfg.label}</span>
                  </div>
                  <p className="text-xs text-[#64748B]">{cfg.hint}</p>
                  <p className="mt-1 text-xs font-medium text-[#475569]">
                    Est. size: ~{formatBytes(est)}
                  </p>
                </label>
              );
            })}
          </div>

          {/* Size preview bar */}
          {estimatedSize != null && (
            <div className="flex flex-col gap-2 rounded-[4px] bg-[#F8FAFC] p-3">
              <div className="flex items-center justify-between text-xs text-[#64748B]">
                <span>Original: <strong className="text-[#0F172A]">{formatBytes(file!.size)}</strong></span>
                <ArrowRight size={14} />
                <span>
                  Est. output: <strong className="text-[#2563EB]">{formatBytes(estimatedSize)}</strong>{' '}
                  <span className="text-[#16A34A]">(-{savings}%)</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                <div
                  className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
                  style={{ width: `${LEVEL_CONFIG[level].ratio * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {/* Process */}
      {file && (
        <Button
          onClick={handleProcess}
          loading={processing}
          leftIcon={<FileArchive size={16} />}
          size="lg"
        >
          {processing ? 'Compressing…' : 'Compress PDF'}
        </Button>
      )}

      {/* Result */}
      {downloadUrl && resultSize != null && file && (
        <div className="flex flex-col gap-3 rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <p className="text-sm font-semibold text-[#16A34A]">Compression complete!</p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-[4px] border border-[#E2E8F0] bg-white p-2">
              <p className="text-[#64748B]">Original</p>
              <p className="font-semibold text-[#0F172A]">{formatBytes(file.size)}</p>
            </div>
            <div className="flex items-center justify-center text-[#94A3B8]">
              <ArrowRight size={16} />
            </div>
            <div className="rounded-[4px] border border-[#BBF7D0] bg-[#F0FDF4] p-2">
              <p className="text-[#15803D]">Compressed</p>
              <p className="font-semibold text-[#0F172A]">{formatBytes(resultSize)}</p>
              <p className="text-[#16A34A]">
                -{Math.round((1 - resultSize / file.size) * 100)}%
              </p>
            </div>
          </div>
          <Button onClick={handleDownload} leftIcon={<Download size={16} />}>
            Download Compressed PDF
          </Button>
        </div>
      )}
    </ToolPage>
  );
}
