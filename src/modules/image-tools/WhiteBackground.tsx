import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Download, Trash2, Info, Wand2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import SEO from '../../components/common/SEO';
import { FAQPageSchema, BreadcrumbSchema, WebApplicationSchema } from '../../components/common/SchemaMarkup';
import ImageFAQ from './components/ImageFAQ';

const FAQS = [
  { q: 'How does the white background tool work?', a: 'It uses AI background removal on the server to detect and remove the existing background, then fills it with solid white (#FFFFFF).' },
  { q: 'Why do marketplaces require white backgrounds?', a: 'Amazon, Flipkart, and Myntra require main product images to have a pure white background to ensure a consistent look across the platform and improve conversion rates.' },
  { q: 'What is the sensitivity slider?', a: 'Sensitivity (5–100) controls how aggressively the AI detects background pixels. Higher values remove more background but may also affect parts of the product. Start at 30 and adjust.' },
  { q: 'What formats are supported?', a: 'JPG, PNG, and WEBP images up to 20MB are accepted. The output is always a PNG file.' },
  { q: 'Is my image uploaded to a server?', a: 'Yes. This tool uses a server-side AI model to process the background. Your image is sent securely and not stored after processing.' },
];

const MAX_SIZE_BYTES = 20 * 1024 * 1024;
const PROCESSING_API_URL = import.meta.env.VITE_PROCESSING_API_URL as string;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const WhiteBackground: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [sensitivity, setSensitivity] = useState(30);
  const [sliderPos, setSliderPos] = useState(50);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

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
      setSliderPos(50);
      setFile(f);
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      setOriginalUrl(URL.createObjectURL(f));
    },
    onDropRejected: r => setError(r[0]?.errors[0]?.message ?? 'Invalid file'),
  });

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('sensitivity', String(sensitivity));
      const resp = await fetch(`${PROCESSING_API_URL}/api/image/white-background`, {
        method: 'POST',
        body: formData,
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Server error ${resp.status}`);
      }
      const blob = await resp.blob();
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setSliderPos(50);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${file.name.replace(/\.[^.]+$/, '')}_white_bg.png`;
    a.click();
  };

  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setOriginalUrl(null); setResultUrl(null); setError(null); setSliderPos(50);
  };

  // Comparison slider
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      WebApplicationSchema({ name: 'White Background', url: 'https://ecomsathi.vercel.app/image/white-background', description: 'Replace product photo backgrounds with white for Amazon, Flipkart, Myntra compliance.' }),
      BreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Tools', url: '/tools' }, { name: 'White Background', url: '/image/white-background' }]),
      FAQPageSchema(FAQS.map(f => ({ question: f.q, answer: f.a }))),
    ],
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <SEO
        title="White Background Generator — EcomSathi"
        description="Replace product photo backgrounds with white for marketplace compliance. Free AI-powered white background tool for Amazon, Flipkart, Myntra product images."
        keywords="white background product photo, add white background image, amazon white background requirement, ecommerce product photo white bg"
        canonicalUrl="https://ecomsathi.vercel.app/image/white-background"
        schema={schema}
      />
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">White Background</h1>
        <p className="text-sm text-[#64748B] mt-1">Replace image backgrounds with white — ideal for marketplace product photos.</p>
      </div>

      <Alert
        variant="info"
        icon
        message="Works best on product photos with solid or near-solid backgrounds. Results vary on complex scenes."
      />

      {!originalUrl ? (
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
            <p className="text-sm font-medium text-[#0F172A]">Drag image here or <span className="text-[#2563EB] underline">click to browse</span></p>
            <p className="text-xs text-[#64748B] mt-1">JPG, PNG, WEBP · Max 20MB</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex flex-col gap-5">
          {/* File */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">{file?.name}</p>
              <p className="text-xs text-[#64748B]">{file ? formatBytes(file.size) : ''}</p>
            </div>
            <button type="button" onClick={handleReset} className="text-[#94A3B8] hover:text-[#DC2626]"><Trash2 size={15} /></button>
          </div>

          {/* Sensitivity */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-[#0F172A]">Background Sensitivity</label>
              <span className="text-sm font-semibold text-[#2563EB]">{sensitivity}</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              value={sensitivity}
              onChange={e => setSensitivity(Number(e.target.value))}
              className="w-full accent-[#2563EB]"
            />
            <div className="flex justify-between text-[11px] text-[#94A3B8]">
              <span>Conservative (less replacement)</span>
              <span>Aggressive (more replacement)</span>
            </div>
            <p className="text-xs text-[#64748B] flex items-center gap-1">
              <Info size={12} /> Higher values replace more near-white / light-background pixels.
            </p>
          </div>

          {/* Before/After slider */}
          {resultUrl ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-[#64748B] text-center">Drag slider to compare</p>
              <div
                ref={sliderRef}
                className="relative rounded-[6px] overflow-hidden cursor-col-resize select-none"
                style={{ aspectRatio: '4/3', background: '#fff' }}
                onMouseDown={handleSliderMouseDown}
                onTouchMove={handleTouchMove}
              >
                {/* After */}
                <img
                  src={resultUrl}
                  alt="Result"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
                {/* Before */}
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                  <img
                    src={originalUrl!}
                    alt="Original"
                    className="absolute inset-0 h-full object-contain pointer-events-none"
                    style={{ width: sliderRef.current?.offsetWidth ?? 'auto' }}
                  />
                </div>
                {/* Divider */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md"
                  style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                    <div className="w-0.5 h-3 bg-[#94A3B8] rounded-full" />
                  </div>
                </div>
                <span className="absolute top-2 left-2 text-[10px] font-semibold bg-black/50 text-white px-1.5 py-0.5 rounded">BEFORE</span>
                <span className="absolute top-2 right-2 text-[10px] font-semibold bg-[#2563EB]/80 text-white px-1.5 py-0.5 rounded">AFTER</span>
              </div>
            </div>
          ) : (
            <div className="rounded-[6px] overflow-hidden bg-[#F1F5F9]" style={{ aspectRatio: '4/3' }}>
              <img src={originalUrl} alt="Original" className="w-full h-full object-contain" />
            </div>
          )}

          {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

          <div className="flex gap-3 flex-wrap">
            <Button
              variant="primary"
              loading={processing}
              leftIcon={<Wand2 size={15} />}
              onClick={handleProcess}
            >
              {processing ? 'Processing…' : 'Replace Background'}
            </Button>
            {resultUrl && (
              <Button variant="ghost" leftIcon={<Download size={15} />} onClick={handleDownload}>
                Download PNG
              </Button>
            )}
          </div>
        </div>
      )}

      <ImageFAQ faqs={FAQS} />
    </div>
  );
};

export default WhiteBackground;
