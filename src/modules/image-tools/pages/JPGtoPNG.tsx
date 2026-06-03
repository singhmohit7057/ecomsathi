import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Download, Trash2, FileImage, Archive } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import SEO from '@/components/common/SEO';
import { FAQPageSchema, BreadcrumbSchema, WebApplicationSchema } from '@/components/common/SchemaMarkup';
import ImageFAQ from '../components/ImageFAQ';

const FAQS = [
  { q: 'Why would I convert JPG to PNG?', a: 'PNG supports transparency and is lossless, making it ideal for product images with removed backgrounds, logos, and graphics where quality must be preserved.' },
  { q: 'Does converting JPG to PNG improve quality?', a: 'No. PNG is lossless but the original JPG quality is already locked in. Converting to PNG prevents further quality loss from re-saving as JPG.' },
  { q: 'Can I convert multiple files at once?', a: 'Yes. You can drag and drop multiple JPG files at once and they will all be converted to PNG in a batch.' },
  { q: 'Will the file size increase after conversion?', a: 'Usually yes. PNG is lossless and generally produces larger files than JPEG for photographic content.' },
  { q: 'Is the conversion done in the browser?', a: 'Yes, conversion uses the Canvas API locally in your browser. No images are uploaded to any server.' },
];

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ConvertedFile {
  originalName: string;
  originalSize: number;
  outputBlob: Blob;
  outputSize: number;
  outputUrl: string;
}

async function convertToPNG(file: File): Promise<ConvertedFile> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('Conversion failed')); return; }
        resolve({
          originalName: file.name,
          originalSize: file.size,
          outputBlob: blob,
          outputSize: blob.size,
          outputUrl: URL.createObjectURL(blob),
        });
      }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not load image')); };
    img.src = url;
  });
}

export const JPGtoPNG: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [converted, setConverted] = useState<ConvertedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': ['.jpg', '.jpeg'] },
    maxSize: MAX_SIZE_BYTES,
    multiple: true,
    onDrop: (accepted, rejected) => {
      if (rejected.length > 0) setError(`${rejected.length} file(s) were rejected. Only JPG/JPEG, max 20MB each.`);
      setFiles(prev => [...prev, ...accepted]);
      setConverted([]);
      setDone(false);
    },
  });

  const handleRemoveFile = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setConverted([]);
    setDone(false);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    setDone(false);
    converted.forEach(c => URL.revokeObjectURL(c.outputUrl));
    try {
      const results = await Promise.all(files.map(convertToPNG));
      setConverted(results);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Conversion failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadSingle = (c: ConvertedFile) => {
    const a = document.createElement('a');
    a.href = c.outputUrl;
    a.download = c.originalName.replace(/\.(jpg|jpeg)$/i, '') + '.png';
    a.click();
  };

  const handleDownloadAll = async () => {
    if (converted.length === 0) return;
    if (converted.length === 1) { handleDownloadSingle(converted[0]); return; }

    // Lazy-load JSZip from CDN is not available — use sequential downloads for multiple files
    // If JSZip were available we'd zip. For now download all sequentially.
    for (const c of converted) {
      handleDownloadSingle(c);
      await new Promise(r => setTimeout(r, 200));
    }
  };

  const handleReset = () => {
    converted.forEach(c => URL.revokeObjectURL(c.outputUrl));
    setFiles([]);
    setConverted([]);
    setDone(false);
    setError(null);
  };

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      WebApplicationSchema({ name: 'JPG to PNG', url: 'https://ecomsathi.vercel.app/image/jpg-to-png', description: 'Convert JPG/JPEG images to PNG format online for free. Supports batch conversion.' }),
      BreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Tools', url: '/tools' }, { name: 'JPG to PNG', url: '/image/jpg-to-png' }]),
      FAQPageSchema(FAQS.map(f => ({ question: f.q, answer: f.a }))),
    ],
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <SEO
        title="JPG to PNG Converter Free — EcomSathi"
        description="Convert JPG/JPEG images to PNG format online for free. Supports batch conversion of multiple files. Preserves image quality."
        keywords="jpg to png converter free, jpeg to png online, convert jpg to png, batch jpg to png"
        canonicalUrl="https://ecomsathi.vercel.app/image/jpg-to-png"
        schema={schema}
      />
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">JPG to PNG</h1>
        <p className="text-sm text-[#64748B] mt-1">Convert JPG/JPEG images to PNG format. Supports multiple files.</p>
      </div>

      <div
        {...getRootProps()}
        className={[
          'border-2 border-dashed rounded-[8px] p-10 flex flex-col items-center gap-3 cursor-pointer transition-all',
          isDragActive ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#2563EB] hover:bg-[#EFF6FF]',
        ].join(' ')}
      >
        <input {...getInputProps()} />
        <UploadCloud size={40} className={isDragActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'} />
        <div className="text-center">
          <p className="text-sm font-medium text-[#0F172A]">
            Drag JPG files here or <span className="text-[#2563EB] underline">click to browse</span>
          </p>
          <p className="text-xs text-[#64748B] mt-1">JPG, JPEG · Multiple files supported · Max 20MB each</p>
        </div>
      </div>

      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {files.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0F172A]">{files.length} file{files.length > 1 ? 's' : ''} selected</p>
            <button type="button" onClick={handleReset} className="text-xs text-[#94A3B8] hover:text-[#DC2626] flex items-center gap-1">
              <Trash2 size={13} /> Clear all
            </button>
          </div>

          {/* File list */}
          <div className="flex flex-col gap-2">
            {files.map((f, i) => {
              const c = converted[i];
              return (
                <div key={`${f.name}-${i}`} className="flex items-center gap-3 border border-[#E2E8F0] rounded-[6px] px-3 py-2 bg-[#F8FAFC]">
                  <FileImage size={16} className="text-[#F97316] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0F172A] truncate">{f.name}</p>
                    <p className="text-xs text-[#64748B]">
                      {formatBytes(f.size)}
                      {c && <span className="text-[#16A34A] ml-2">→ {formatBytes(c.outputSize)} PNG</span>}
                    </p>
                  </div>
                  {c && (
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(c)}
                      className="text-[#2563EB] hover:text-[#1D4ED8] flex-shrink-0"
                      title="Download PNG"
                    >
                      <Download size={15} />
                    </button>
                  )}
                  {!done && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      className="text-[#94A3B8] hover:text-[#DC2626] flex-shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {!done && (
              <Button variant="primary" loading={processing} leftIcon={<FileImage size={15} />} onClick={handleConvert}>
                {processing ? 'Converting…' : `Convert ${files.length > 1 ? 'All to PNG' : 'to PNG'}`}
              </Button>
            )}
            {done && files.length > 1 && (
              <Button variant="primary" leftIcon={<Archive size={15} />} onClick={handleDownloadAll}>
                Download All PNG
              </Button>
            )}
            {done && <Button variant="ghost" onClick={handleReset}>Convert More Files</Button>}
          </div>
        </div>
      )}

      <ImageFAQ faqs={FAQS} />
    </div>
  );
};

export default JPGtoPNG;
