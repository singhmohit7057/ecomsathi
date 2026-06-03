import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Download, Trash2, ArrowLeftRight, FileImage } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import SEO from '../../components/common/SEO';
import { FAQPageSchema, BreadcrumbSchema, WebApplicationSchema } from '../../components/common/SchemaMarkup';
import ImageFAQ from './components/ImageFAQ';

const FAQS = [
  { q: 'What is WEBP and why use it?', a: 'WEBP is a modern image format from Google that produces smaller file sizes than JPG and PNG while maintaining similar visual quality, making it ideal for web performance.' },
  { q: 'Can I convert WEBP back to PNG or JPG?', a: 'Yes. Use the "WEBP → PNG/JPG" direction to convert WEBP files to standard formats. Choose PNG to preserve transparency or JPG for smaller file sizes.' },
  { q: 'Do all marketplaces accept WEBP?', a: 'Most marketplaces (Amazon, Flipkart, Myntra) require JPG or PNG product images. Use the WEBP → JPG/PNG direction to convert before uploading to marketplaces.' },
  { q: 'What quality setting should I use for WEBP?', a: '85% is a good default. Values above 90% offer minimal visual difference with noticeably larger files. Values below 75% may show visible compression artifacts.' },
  { q: 'Is conversion done in the browser?', a: 'Yes, all conversions use the Canvas API locally in your browser. No images are uploaded to any server.' },
];

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Direction = 'toWebp' | 'fromWebp';
type FromWebpOutput = 'png' | 'jpeg';

interface ConvertedFile {
  originalName: string;
  originalSize: number;
  outputSize: number;
  outputUrl: string;
  outputExt: string;
}

async function convertFile(
  file: File,
  direction: Direction,
  quality: number,
  fromWebpOutput: FromWebpOutput,
  bgColor: string,
): Promise<ConvertedFile> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;

      let outputMime: string;
      let outputExt: string;

      if (direction === 'toWebp') {
        outputMime = 'image/webp';
        outputExt = 'webp';
        ctx.drawImage(img, 0, 0);
      } else {
        // fromWebp: fill bg for jpeg
        outputMime = `image/${fromWebpOutput}`;
        outputExt = fromWebpOutput === 'jpeg' ? 'jpg' : 'png';
        if (fromWebpOutput === 'jpeg') {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
      }

      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error(`Conversion failed for ${file.name}`)); return; }
        resolve({
          originalName: file.name,
          originalSize: file.size,
          outputSize: blob.size,
          outputUrl: URL.createObjectURL(blob),
          outputExt,
        });
      }, outputMime, quality / 100);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Cannot load ${file.name}`)); };
    img.src = url;
  });
}

export const WEBPConverter: React.FC = () => {
  const [direction, setDirection] = useState<Direction>('toWebp');
  const [fromWebpOutput, setFromWebpOutput] = useState<FromWebpOutput>('png');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [quality, setQuality] = useState(85);
  const [files, setFiles] = useState<File[]>([]);
  const [converted, setConverted] = useState<ConvertedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const acceptMap: Record<Direction, Record<string, string[]>> = {
    toWebp: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    fromWebp: { 'image/webp': ['.webp'] },
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptMap[direction],
    maxSize: MAX_SIZE_BYTES,
    multiple: true,
    onDrop: (accepted, rejected) => {
      if (rejected.length > 0) setError(`${rejected.length} file(s) rejected.`);
      setFiles(prev => [...prev, ...accepted]);
      setConverted([]);
      setDone(false);
    },
  });

  const handleDirectionChange = (d: Direction) => {
    setDirection(d);
    setFiles([]);
    setConverted([]);
    setDone(false);
    setError(null);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    setDone(false);
    converted.forEach(c => URL.revokeObjectURL(c.outputUrl));
    try {
      const results = await Promise.all(files.map(f =>
        convertFile(f, direction, quality, fromWebpOutput, bgColor)
      ));
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
    const base = c.originalName.replace(/\.[^.]+$/, '');
    a.download = `${base}.${c.outputExt}`;
    a.click();
  };

  const handleDownloadAll = async () => {
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

  const directionLabel = direction === 'toWebp'
    ? 'PNG/JPG → WEBP'
    : 'WEBP → PNG/JPG';

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      WebApplicationSchema({ name: 'WEBP Converter', url: 'https://ecomsathi.vercel.app/image/webp-converter', description: 'Convert between WEBP and PNG/JPG formats in both directions. Free online WEBP converter.' }),
      BreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Tools', url: '/tools' }, { name: 'WEBP Converter', url: '/image/webp-converter' }]),
      FAQPageSchema(FAQS.map(f => ({ question: f.q, answer: f.a }))),
    ],
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <SEO
        title="WEBP Converter — Convert to/from WEBP Free — EcomSathi"
        description="Convert between WEBP and PNG/JPG formats in both directions. Free online WEBP converter. Reduce file size or convert WEBP to standard formats."
        keywords="webp converter free, jpg to webp, png to webp, webp to jpg, webp to png, convert webp online"
        canonicalUrl="https://ecomsathi.vercel.app/image/webp-converter"
        schema={schema}
      />
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">WEBP Converter</h1>
        <p className="text-sm text-[#64748B] mt-1">Convert between WEBP and PNG/JPG formats.</p>
      </div>

      {/* Direction selector */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex flex-col gap-3">
        <p className="text-sm font-medium text-[#0F172A]">Conversion Direction</p>
        <div className="flex gap-3 flex-wrap">
          {(['toWebp', 'fromWebp'] as Direction[]).map(d => (
            <button
              key={d}
              type="button"
              onClick={() => handleDirectionChange(d)}
              className={[
                'flex items-center gap-2 px-4 py-2 border rounded-[6px] text-sm font-medium transition-all',
                direction === d
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]',
              ].join(' ')}
            >
              <ArrowLeftRight size={14} />
              {d === 'toWebp' ? 'PNG/JPG → WEBP' : 'WEBP → PNG/JPG'}
            </button>
          ))}
        </div>

        {/* Output format for fromWebp */}
        {direction === 'fromWebp' && (
          <div className="flex items-center gap-4 flex-wrap pt-1">
            <p className="text-sm text-[#64748B]">Output format:</p>
            {(['png', 'jpeg'] as FromWebpOutput[]).map(f => (
              <label key={f} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={fromWebpOutput === f}
                  onChange={() => setFromWebpOutput(f)}
                  className="accent-[#2563EB]"
                />
                <span className="text-sm font-medium uppercase text-[#0F172A]">{f === 'jpeg' ? 'JPG' : 'PNG'}</span>
              </label>
            ))}
          </div>
        )}

        {/* Quality for WEBP output */}
        {direction === 'toWebp' && (
          <div className="flex flex-col gap-1 pt-1">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-[#0F172A]">WEBP Quality</label>
              <span className="text-sm font-semibold text-[#2563EB]">{quality}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              onChange={e => setQuality(Number(e.target.value))}
              className="accent-[#2563EB]"
            />
          </div>
        )}

        {/* Bg color for WEBP→JPG */}
        {direction === 'fromWebp' && fromWebpOutput === 'jpeg' && (
          <div className="flex items-center gap-3 pt-1">
            <label className="text-sm text-[#64748B]">Background for transparent:</label>
            <input
              type="color"
              value={bgColor}
              onChange={e => setBgColor(e.target.value)}
              className="w-9 h-8 rounded border border-[#E2E8F0] cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={bgColor}
              onChange={e => setBgColor(e.target.value)}
              maxLength={7}
              className="border border-[#E2E8F0] rounded-[4px] px-2 py-1.5 text-sm w-24 font-mono focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        )}
      </div>

      {/* Upload */}
      <div
        {...getRootProps()}
        className={[
          'border-2 border-dashed rounded-[8px] p-8 flex flex-col items-center gap-3 cursor-pointer transition-all',
          isDragActive ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#2563EB] hover:bg-[#EFF6FF]',
        ].join(' ')}
      >
        <input {...getInputProps()} />
        <UploadCloud size={36} className={isDragActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'} />
        <p className="text-sm font-medium text-[#0F172A] text-center">
          Drag files here or <span className="text-[#2563EB] underline">click to browse</span>
          <br />
          <span className="text-xs text-[#64748B] font-normal">Direction: {directionLabel} · Max 20MB each</span>
        </p>
      </div>

      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {files.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0F172A]">{files.length} file{files.length > 1 ? 's' : ''}</p>
            <button type="button" onClick={handleReset} className="text-xs text-[#94A3B8] hover:text-[#DC2626] flex items-center gap-1">
              <Trash2 size={13} /> Clear all
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {files.map((f, i) => {
              const c = converted[i];
              return (
                <div key={`${f.name}-${i}`} className="flex items-center gap-3 border border-[#E2E8F0] rounded-[6px] px-3 py-2 bg-[#F8FAFC]">
                  <FileImage size={15} className="text-[#2563EB] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0F172A] truncate">{f.name}</p>
                    <p className="text-xs text-[#64748B]">
                      {formatBytes(f.size)}
                      {c && <span className="text-[#16A34A] ml-2">→ {formatBytes(c.outputSize)} .{c.outputExt.toUpperCase()}</span>}
                    </p>
                  </div>
                  {c && (
                    <button type="button" onClick={() => handleDownloadSingle(c)} className="text-[#2563EB] hover:text-[#1D4ED8]">
                      <Download size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 flex-wrap">
            {!done && (
              <Button variant="primary" loading={processing} onClick={handleConvert}>
                {processing ? 'Converting…' : `Convert ${files.length} File${files.length > 1 ? 's' : ''}`}
              </Button>
            )}
            {done && files.length > 1 && (
              <Button variant="primary" leftIcon={<Download size={15} />} onClick={handleDownloadAll}>
                Download All
              </Button>
            )}
            {done && <Button variant="ghost" onClick={handleReset}>Convert More</Button>}
          </div>
        </div>
      )}

      <ImageFAQ faqs={FAQS} />
    </div>
  );
};

export default WEBPConverter;
