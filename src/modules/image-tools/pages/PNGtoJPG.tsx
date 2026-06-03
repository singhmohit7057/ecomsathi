import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Download, Trash2, FileImage, Archive } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import SEO from '@/components/common/SEO';
import { FAQPageSchema, BreadcrumbSchema, WebApplicationSchema } from '@/components/common/SchemaMarkup';
import ImageFAQ from '../components/ImageFAQ';

const FAQS = [
  { q: 'Why convert PNG to JPG?', a: 'JPG files are much smaller than PNG for photographic images, making them better for fast-loading marketplace listings where file size matters.' },
  { q: 'What happens to transparent areas?', a: 'PNG transparency is filled with the background color you choose before conversion. White is the default, which is ideal for marketplace product listings.' },
  { q: 'Does the quality slider affect file size?', a: 'Yes. Lower quality settings produce smaller JPEG files. 90% is a good default that keeps visible quality high while significantly reducing file size versus PNG.' },
  { q: 'Can I convert multiple PNG files at once?', a: 'Yes. Drag and drop multiple PNG files at once. They will all be converted using the same settings.' },
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

async function convertToJPG(file: File, bgColor: string, quality: number): Promise<ConvertedFile> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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
      }, 'image/jpeg', quality / 100);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Could not load ${file.name}`)); };
    img.src = url;
  });
}

export const PNGtoJPG: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [converted, setConverted] = useState<ConvertedFile[]>([]);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [quality, setQuality] = useState(90);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/png': ['.png'] },
    maxSize: MAX_SIZE_BYTES,
    multiple: true,
    onDrop: (accepted, rejected) => {
      if (rejected.length > 0) setError(`${rejected.length} file(s) rejected. Only PNG, max 20MB each.`);
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
      const results = await Promise.all(files.map(f => convertToJPG(f, bgColor, quality)));
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
    a.download = c.originalName.replace(/\.png$/i, '') + '.jpg';
    a.click();
  };

  const handleDownloadAll = async () => {
    if (converted.length === 0) return;
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
      WebApplicationSchema({ name: 'PNG to JPG', url: 'https://ecomsathi.vercel.app/image/png-to-jpg', description: 'Convert PNG images to JPEG with custom background color for transparency. Free batch converter.' }),
      BreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Tools', url: '/tools' }, { name: 'PNG to JPG', url: '/image/png-to-jpg' }]),
      FAQPageSchema(FAQS.map(f => ({ question: f.q, answer: f.a }))),
    ],
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <SEO
        title="PNG to JPG Converter Free — EcomSathi"
        description="Convert PNG images to JPEG online for free. Set custom background color for transparent areas. Control JPEG quality. Supports batch conversion."
        keywords="png to jpg converter free, png to jpeg online, convert png to jpg, batch png to jpg converter"
        canonicalUrl="https://ecomsathi.vercel.app/image/png-to-jpg"
        schema={schema}
      />
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">PNG to JPG</h1>
        <p className="text-sm text-[#64748B] mt-1">Convert PNG images to JPEG. Transparent areas are filled with a background color.</p>
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
            Drag PNG files here or <span className="text-[#2563EB] underline">click to browse</span>
          </p>
          <p className="text-xs text-[#64748B] mt-1">PNG · Multiple files supported · Max 20MB each</p>
        </div>
      </div>

      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {files.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex flex-col gap-5">
          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Background Color (for transparent areas)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className="w-10 h-9 rounded border border-[#E2E8F0] cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  maxLength={7}
                  className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm w-28 font-mono focus:outline-none focus:border-[#2563EB]"
                />
                <button
                  type="button"
                  onClick={() => setBgColor('#FFFFFF')}
                  className="text-xs text-[#64748B] hover:text-[#2563EB] underline"
                >
                  Reset White
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">JPEG Quality: {quality}%</label>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={e => setQuality(Number(e.target.value))}
                className="accent-[#2563EB]"
              />
              <div className="flex justify-between text-[11px] text-[#94A3B8]">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
            </div>
          </div>

          {/* File list header */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0F172A]">{files.length} file{files.length > 1 ? 's' : ''}</p>
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
                  <FileImage size={16} className="text-[#2563EB] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0F172A] truncate">{f.name}</p>
                    <p className="text-xs text-[#64748B]">
                      {formatBytes(f.size)}
                      {c && <span className="text-[#16A34A] ml-2">→ {formatBytes(c.outputSize)} JPG</span>}
                    </p>
                  </div>
                  {c && (
                    <button type="button" onClick={() => handleDownloadSingle(c)} className="text-[#2563EB] hover:text-[#1D4ED8]" title="Download JPG">
                      <Download size={15} />
                    </button>
                  )}
                  {!done && (
                    <button type="button" onClick={() => handleRemoveFile(i)} className="text-[#94A3B8] hover:text-[#DC2626]">
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
                {processing ? 'Converting…' : `Convert ${files.length > 1 ? 'All to JPG' : 'to JPG'}`}
              </Button>
            )}
            {done && files.length > 1 && (
              <Button variant="primary" leftIcon={<Archive size={15} />} onClick={handleDownloadAll}>
                Download All JPG
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

export default PNGtoJPG;
