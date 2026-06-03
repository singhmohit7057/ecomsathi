import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Download, Trash2, Link, Unlink } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import SEO from '@/components/common/SEO';
import { FAQPageSchema, BreadcrumbSchema, WebApplicationSchema } from '@/components/common/SchemaMarkup';
import ImageFAQ from '../components/ImageFAQ';

const FAQS = [
  { q: 'What image formats can I resize?', a: 'JPG, PNG, and WEBP images are supported. The output format matches the input format.' },
  { q: 'What are the marketplace preset sizes?', a: 'Presets include Amazon Product (2000×2000), Flipkart Product (1500×1500), Instagram Square (1080×1080), HD (1920×1080), Banner Wide (1200×628), Profile Pic (400×400), and Thumbnail (300×300).' },
  { q: 'What does the aspect ratio lock do?', a: 'When locked, changing the width automatically adjusts the height to maintain the original proportions and vice versa. Unlock it to set arbitrary dimensions.' },
  { q: 'Is there a limit on the resize percentage?', a: 'You can scale images from 1% to 400% of the original size. Scaling above 100% may reduce image sharpness.' },
  { q: 'Does resizing happen in the browser?', a: 'Yes, all resizing is done locally in your browser using the Canvas API. No image data is uploaded to any server.' },
];

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type ResizeMode = 'dimensions' | 'percentage' | 'preset';

interface Preset {
  label: string;
  w: number;
  h: number;
  note?: string;
}

const PRESETS: Preset[] = [
  { label: 'Instagram Square', w: 1080, h: 1080, note: 'Instagram feed' },
  { label: 'Amazon Product', w: 2000, h: 2000, note: 'Amazon main image' },
  { label: 'Thumbnail', w: 300, h: 300, note: 'Generic thumbnail' },
  { label: 'HD', w: 1920, h: 1080, note: '1080p Full HD' },
  { label: 'Flipkart Product', w: 1500, h: 1500, note: 'Flipkart listing' },
  { label: 'Banner Wide', w: 1200, h: 628, note: 'Social share / OG' },
  { label: 'Profile Pic', w: 400, h: 400, note: 'Social profile' },
];

export const ResizeImage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState({ w: 0, h: 0 });
  const [mode, setMode] = useState<ResizeMode>('dimensions');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [percentage, setPercentage] = useState('100');
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<{ w: number; h: number; bytes: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: MAX_SIZE_BYTES,
    multiple: false,
    onDrop: (accepted, rejected) => {
      if (rejected.length > 0) { setError('Invalid file or too large (max 20MB)'); return; }
      const f = accepted[0];
      if (!f) return;
      setError(null);
      setResultUrl(null);
      setResultSize(null);
      setFile(f);
      const url = URL.createObjectURL(f);
      setImageSrc(url);
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setOriginalSize({ w: img.naturalWidth, h: img.naturalHeight });
        setWidth(String(img.naturalWidth));
        setHeight(String(img.naturalHeight));
        setPercentage('100');
        setSelectedPreset(null);
      };
      img.src = url;
    },
    onDropRejected: (rejected) => {
      setError(rejected[0]?.errors[0]?.message ?? 'Invalid file');
    },
  });

  const handleWidthChange = useCallback((val: string) => {
    setWidth(val);
    if (maintainAspect && originalSize.w > 0 && val) {
      const w = parseInt(val, 10);
      if (!isNaN(w)) {
        setHeight(String(Math.round(w * (originalSize.h / originalSize.w))));
      }
    }
  }, [maintainAspect, originalSize]);

  const handleHeightChange = useCallback((val: string) => {
    setHeight(val);
    if (maintainAspect && originalSize.h > 0 && val) {
      const h = parseInt(val, 10);
      if (!isNaN(h)) {
        setWidth(String(Math.round(h * (originalSize.w / originalSize.h))));
      }
    }
  }, [maintainAspect, originalSize]);

  const handlePercentageChange = (val: string) => {
    setPercentage(val);
    const pct = parseFloat(val);
    if (!isNaN(pct) && originalSize.w > 0) {
      setWidth(String(Math.round(originalSize.w * pct / 100)));
      setHeight(String(Math.round(originalSize.h * pct / 100)));
    }
  };

  const handlePresetSelect = (preset: Preset) => {
    setSelectedPreset(preset);
    setWidth(String(preset.w));
    setHeight(String(preset.h));
  };

  const getTargetDimensions = (): { w: number; h: number } | null => {
    if (mode === 'dimensions' || mode === 'percentage') {
      const w = parseInt(width, 10);
      const h = parseInt(height, 10);
      if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return null;
      return { w, h };
    }
    if (mode === 'preset' && selectedPreset) {
      return { w: selectedPreset.w, h: selectedPreset.h };
    }
    return null;
  };

  const handleProcess = () => {
    const img = imageRef.current;
    if (!img || !file) return;
    const dims = getTargetDimensions();
    if (!dims) { setError('Please enter valid target dimensions.'); return; }
    setProcessing(true);
    setError(null);

    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = dims.w;
      canvas.height = dims.h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, dims.w, dims.h);

      const mimeType = file.type === 'image/png' ? 'image/png' : file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
      canvas.toBlob(blob => {
        if (!blob) { setError('Could not process image.'); setProcessing(false); return; }
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultUrl(URL.createObjectURL(blob));
        setResultSize({ w: dims.w, h: dims.h, bytes: blob.size });
        setProcessing(false);
      }, mimeType, 0.92);
    }, 10);
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    const ext = file.name.split('.').pop() ?? 'jpg';
    a.download = `${file.name.replace(/\.[^.]+$/, '')}_resized.${ext}`;
    a.click();
  };

  const handleReset = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setImageSrc(null); setResultUrl(null); setResultSize(null);
    setOriginalSize({ w: 0, h: 0 }); setWidth(''); setHeight(''); setPercentage('100');
  };

  const dims = getTargetDimensions();

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      WebApplicationSchema({ name: 'Resize Image', url: 'https://ecomsathi.vercel.app/image/resize-image', description: 'Resize by custom dimensions, percentage, or marketplace presets. Free online image resizer.' }),
      BreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Tools', url: '/tools' }, { name: 'Resize Image', url: '/image/resize-image' }]),
      FAQPageSchema(FAQS.map(f => ({ question: f.q, answer: f.a }))),
    ],
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <SEO
        title="Resize Image Online Free — EcomSathi"
        description="Resize images to exact pixel dimensions or percentage. Free online image resizer with marketplace presets for Amazon, Flipkart, Instagram."
        keywords="image resize online free, resize image pixels, image resizer tool, resize photo online, resize image for amazon flipkart"
        canonicalUrl="https://ecomsathi.vercel.app/image/resize-image"
        schema={schema}
      />
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Resize Image</h1>
        <p className="text-sm text-[#64748B] mt-1">Resize images by custom dimensions, percentage, or marketplace presets.</p>
      </div>

      {!imageSrc ? (
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
              Drag image here or <span className="text-[#2563EB] underline">click to browse</span>
            </p>
            <p className="text-xs text-[#64748B] mt-1">JPG, PNG, WEBP · Max 20MB</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex flex-col gap-5">
          {/* Original info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={imageSrc} alt="Preview" className="w-12 h-12 object-cover rounded border border-[#E2E8F0]" />
              <div>
                <p className="text-sm font-medium text-[#0F172A]">{file?.name}</p>
                <p className="text-xs text-[#64748B]">
                  {originalSize.w} × {originalSize.h}px · {file ? formatBytes(file.size) : ''}
                </p>
              </div>
            </div>
            <button type="button" onClick={handleReset} className="text-[#94A3B8] hover:text-[#DC2626]"><Trash2 size={15} /></button>
          </div>

          {/* Mode tabs */}
          <div className="flex border-b border-[#E2E8F0]">
            {(['dimensions', 'percentage', 'preset'] as ResizeMode[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={[
                  'px-4 py-2 text-sm font-medium capitalize border-b-2 transition-all -mb-px',
                  mode === m
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-[#64748B] hover:text-[#0F172A]',
                ].join(' ')}
              >
                {m === 'dimensions' ? 'Custom' : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {/* Mode controls */}
          {mode === 'dimensions' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#64748B]">Width (px)</label>
                  <input
                    type="number"
                    min={1}
                    value={width}
                    onChange={e => handleWidthChange(e.target.value)}
                    className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm w-28 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setMaintainAspect(v => !v)}
                  className={`mt-4 p-1.5 rounded border transition-all ${maintainAspect ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]' : 'border-[#E2E8F0] text-[#94A3B8]'}`}
                  title={maintainAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
                >
                  {maintainAspect ? <Link size={14} /> : <Unlink size={14} />}
                </button>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#64748B]">Height (px)</label>
                  <input
                    type="number"
                    min={1}
                    value={height}
                    onChange={e => handleHeightChange(e.target.value)}
                    className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm w-28 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>
              <p className="text-xs text-[#64748B]">
                {maintainAspect ? 'Aspect ratio locked.' : 'Aspect ratio unlocked — enter any dimensions.'}
              </p>
            </div>
          )}

          {mode === 'percentage' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-[#0F172A] w-24">Scale: {percentage}%</label>
                <input
                  type="range"
                  min={1}
                  max={400}
                  value={percentage}
                  onChange={e => handlePercentageChange(e.target.value)}
                  className="flex-1 accent-[#2563EB]"
                />
              </div>
              <input
                type="number"
                min={1}
                max={400}
                value={percentage}
                onChange={e => handlePercentageChange(e.target.value)}
                className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm w-28 focus:outline-none focus:border-[#2563EB]"
              />
              {width && height && (
                <p className="text-xs text-[#64748B]">Output: {width} × {height}px</p>
              )}
            </div>
          )}

          {mode === 'preset' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handlePresetSelect(p)}
                  className={[
                    'text-left px-3 py-2.5 border rounded-[6px] transition-all',
                    selectedPreset?.label === p.label
                      ? 'border-[#2563EB] bg-[#EFF6FF]'
                      : 'border-[#E2E8F0] hover:border-[#2563EB] bg-white',
                  ].join(' ')}
                >
                  <p className="text-xs font-semibold text-[#0F172A]">{p.label}</p>
                  <p className="text-[11px] text-[#64748B]">{p.w}×{p.h} · {p.note}</p>
                </button>
              ))}
            </div>
          )}

          {/* Size comparison */}
          {dims && (
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-3 flex items-center gap-6 flex-wrap text-xs">
              <div>
                <p className="text-[#64748B]">Original</p>
                <p className="font-semibold text-[#0F172A]">{originalSize.w} × {originalSize.h}px</p>
                <p className="text-[#64748B]">{file ? formatBytes(file.size) : ''}</p>
              </div>
              <div className="text-[#94A3B8] text-lg font-light">→</div>
              <div>
                <p className="text-[#64748B]">New Size</p>
                <p className="font-semibold text-[#2563EB]">{dims.w} × {dims.h}px</p>
                {resultSize && <p className="text-[#64748B]">{formatBytes(resultSize.bytes)}</p>}
              </div>
            </div>
          )}

          {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Button variant="primary" loading={processing} onClick={handleProcess}>
              {processing ? 'Resizing…' : 'Resize Image'}
            </Button>
            {resultUrl && (
              <Button variant="ghost" leftIcon={<Download size={15} />} onClick={handleDownload}>
                Download
              </Button>
            )}
          </div>

          {/* Result preview */}
          {resultUrl && (
            <div className="border border-[#E2E8F0] rounded-[6px] p-3">
              <p className="text-xs font-medium text-[#64748B] mb-2">Result Preview</p>
              <img src={resultUrl} alt="Resized" className="max-h-40 rounded object-contain" />
            </div>
          )}
        </div>
      )}

      <ImageFAQ faqs={FAQS} />
    </div>
  );
};

export default ResizeImage;
