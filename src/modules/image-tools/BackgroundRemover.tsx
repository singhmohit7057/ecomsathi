import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Download, Trash2, Wand2, Info } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import SEO from '../../components/common/SEO';
import { FAQPageSchema, BreadcrumbSchema, WebApplicationSchema } from '../../components/common/SchemaMarkup';
import ImageFAQ from './components/ImageFAQ';

const FAQS = [
  { q: 'How does the background remover work?', a: 'It uses AI-powered background removal via a server-side model. Your image is sent securely to the processing API, the background is detected and removed, and you receive a PNG with a transparent background.' },
  { q: 'What image formats are supported?', a: 'JPG, PNG, and WEBP images are supported. The output is always a PNG file to preserve transparency.' },
  { q: 'Is my image data stored on the server?', a: 'No. Images are processed and the result is returned immediately. No images are retained after processing.' },
  { q: 'What is the maximum file size?', a: 'The maximum file size is 20MB per image. For best results, use images where the subject is clearly distinct from the background.' },
  { q: 'What should I do if the result is not accurate?', a: 'Results vary based on image complexity. For best quality, use images with a clear subject against a simple background. You can then use the White Background tool to add a clean white background.' },
];

const PROCESSING_API_URL = import.meta.env.VITE_PROCESSING_API_URL ?? 'http://localhost:3001';
const MAX_SIZE_MB = 20;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const BackgroundRemover: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setError(null);
    setResultUrl(null);
    setSliderPos(50);
    setFile(f);
    const url = URL.createObjectURL(f);
    setOriginalUrl(url);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: MAX_SIZE_BYTES,
    multiple: false,
    onDropRejected: (rejected) => {
      const msg = rejected[0]?.errors[0]?.message ?? 'Invalid file';
      setError(msg);
    },
  });

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const resp = await fetch(`${PROCESSING_API_URL}/api/image/remove-background`, {
        method: 'POST',
        body: formData,
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Server error ${resp.status}`);
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
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
    const baseName = file.name.replace(/\.[^.]+$/, '');
    a.download = `${baseName}_no_bg.png`;
    a.click();
  };

  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setError(null);
    setSliderPos(50);
  };

  // Slider drag logic
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
      WebApplicationSchema({ name: 'Background Remover', url: 'https://ecomsathi.vercel.app/image/background-remover', description: 'Remove backgrounds from product images automatically using AI. Outputs transparent PNG.' }),
      BreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Tools', url: '/tools' }, { name: 'Background Remover', url: '/image/background-remover' }]),
      FAQPageSchema(FAQS.map(f => ({ question: f.q, answer: f.a }))),
    ],
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <SEO
        title="Remove Background Free — EcomSathi"
        description="Remove background from product images free. Perfect for Amazon, Flipkart product listings. Get clean transparent PNG product photos instantly."
        keywords="background remover free, remove image background online, product photo background remove, transparent background png"
        canonicalUrl="https://ecomsathi.vercel.app/image/background-remover"
        schema={schema}
      />
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Background Remover</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Remove backgrounds from product images automatically using AI.
        </p>
      </div>

      <Alert
        variant="info"
        icon
        message="Uses AI background removal. Results may vary for complex images. Works best on product photos with clear subjects."
      />

      {/* Upload zone */}
      {!originalUrl && (
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
            <p className="text-xs text-[#64748B] mt-1">JPG, PNG, WEBP · Max {MAX_SIZE_MB}MB</p>
          </div>
        </div>
      )}

      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {/* Preview area */}
      {originalUrl && (
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex flex-col gap-4">
          {/* File info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">{file?.name}</p>
              <p className="text-xs text-[#64748B]">{file ? formatBytes(file.size) : ''}</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-[#94A3B8] hover:text-[#DC2626] transition-colors"
              aria-label="Remove image"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Before / After slider */}
          {resultUrl ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-[#64748B] text-center">Drag slider to compare</p>
              <div
                ref={sliderRef}
                className="relative rounded-[6px] overflow-hidden cursor-col-resize select-none"
                style={{ aspectRatio: '4/3', background: 'repeating-conic-gradient(#e2e8f0 0% 25%, #fff 0% 50%) 0 0 / 16px 16px' }}
                onMouseDown={handleSliderMouseDown}
                onTouchMove={handleTouchMove}
              >
                {/* After (result) */}
                <img
                  src={resultUrl}
                  alt="Result"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
                {/* Before (original) — clipped to left of slider */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    style={{ width: sliderRef.current?.offsetWidth ?? 'auto' }}
                  />
                </div>
                {/* Divider line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md"
                  style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                    <div className="w-0.5 h-3 bg-[#94A3B8] rounded-full" />
                  </div>
                </div>
                {/* Labels */}
                <span className="absolute top-2 left-2 text-[10px] font-semibold bg-black/50 text-white px-1.5 py-0.5 rounded">BEFORE</span>
                <span className="absolute top-2 right-2 text-[10px] font-semibold bg-[#2563EB]/80 text-white px-1.5 py-0.5 rounded">AFTER</span>
              </div>
            </div>
          ) : (
            <div
              className="rounded-[6px] overflow-hidden"
              style={{ aspectRatio: '4/3', background: '#F1F5F9' }}
            >
              <img
                src={originalUrl}
                alt="Original"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="primary"
              loading={processing}
              leftIcon={<Wand2 size={15} />}
              onClick={handleProcess}
            >
              {processing ? 'Removing Background…' : 'Remove Background'}
            </Button>
            {resultUrl && (
              <Button
                variant="ghost"
                leftIcon={<Download size={15} />}
                onClick={handleDownload}
              >
                Download PNG
              </Button>
            )}
          </div>

          {resultUrl && (
            <p className="text-xs text-[#64748B] flex items-center gap-1">
              <Info size={12} />
              Output is PNG with transparent background.
            </p>
          )}
        </div>
      )}

      <ImageFAQ faqs={FAQS} />
    </div>
  );
};

export default BackgroundRemover;
