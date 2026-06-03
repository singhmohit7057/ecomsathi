import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import SEO from '@/components/common/SEO';
import { FAQPageSchema, BreadcrumbSchema, WebApplicationSchema } from '@/components/common/SchemaMarkup';
import ImageFAQ from '../components/ImageFAQ';

const FAQS = [
  { q: 'Why do I need square product images?', a: 'Instagram feed posts and many marketplace thumbnail grids display images in a 1:1 square aspect ratio. Non-square images get cropped, which can hide parts of your product.' },
  { q: 'What padding fill options are available?', a: 'White (solid white background, best for marketplaces), Transparent (PNG output only), or a custom color you pick with the color picker.' },
  { q: 'What does the image position control do?', a: 'You can place the original image at any of 9 positions within the square canvas: center, corners, or edge midpoints. Center is best for most product photos.' },
  { q: 'Can I set a custom canvas size?', a: 'Yes. By default the canvas size is set to the longest dimension of your original image (making it the largest possible square without upscaling). Toggle "Custom size" to enter a specific pixel dimension.' },
  { q: 'Is the processing done in the browser?', a: 'Yes, all processing uses the Canvas API locally in your browser. No image data is uploaded to any server.' },
];

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type PaddingColor = 'white' | 'custom' | 'transparent';
type ImagePosition = 'center' | 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
type CanvasSizeMode = 'auto' | 'custom';

const POSITION_OPTIONS: { value: ImagePosition; label: string }[] = [
  { value: 'top-left', label: '↖ Top Left' },
  { value: 'top-center', label: '↑ Top Center' },
  { value: 'top-right', label: '↗ Top Right' },
  { value: 'center', label: '· Center' },
  { value: 'bottom-left', label: '↙ Bottom Left' },
  { value: 'bottom-center', label: '↓ Bottom Center' },
  { value: 'bottom-right', label: '↘ Bottom Right' },
];

function getImageOffset(
  position: ImagePosition,
  canvasSize: number,
  imageW: number,
  imageH: number,
): { x: number; y: number } {
  const map: Record<ImagePosition, { x: number; y: number }> = {
    'top-left':      { x: 0, y: 0 },
    'top-center':    { x: (canvasSize - imageW) / 2, y: 0 },
    'top-right':     { x: canvasSize - imageW, y: 0 },
    'center':        { x: (canvasSize - imageW) / 2, y: (canvasSize - imageH) / 2 },
    'bottom-left':   { x: 0, y: canvasSize - imageH },
    'bottom-center': { x: (canvasSize - imageW) / 2, y: canvasSize - imageH },
    'bottom-right':  { x: canvasSize - imageW, y: canvasSize - imageH },
  };
  return map[position];
}

export const SquareImageCreator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [canvasSizeMode, setCanvasSizeMode] = useState<CanvasSizeMode>('auto');
  const [customSize, setCustomSize] = useState('1080');
  const [paddingColor, setPaddingColor] = useState<PaddingColor>('white');
  const [customColor, setCustomColor] = useState('#F8FAFC');
  const [imagePosition, setImagePosition] = useState<ImagePosition>('center');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: MAX_SIZE_BYTES,
    multiple: false,
    onDrop: (accepted, rejected) => {
      if (rejected.length > 0) { setError('Invalid file or too large.'); return; }
      const f = accepted[0];
      if (!f) return;
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      setFile(f);
      setResultUrl(null);
      setResultBytes(null);
      const url = URL.createObjectURL(f);
      setImageUrl(url);
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      };
      img.src = url;
    },
    onDropRejected: r => setError(r[0]?.errors[0]?.message ?? 'Invalid file'),
  });

  const getCanvasSize = useCallback((): number => {
    if (canvasSizeMode === 'auto') {
      return Math.max(naturalSize.w, naturalSize.h);
    }
    return Math.max(1, parseInt(customSize, 10) || 1080);
  }, [canvasSizeMode, naturalSize, customSize]);

  const drawOnCanvas = useCallback((
    canvas: HTMLCanvasElement,
    size: number,
    img: HTMLImageElement,
    forPreview: boolean,
  ) => {
    const previewScale = forPreview ? Math.min(400 / size, 1) : 1;
    const displaySize = size * previewScale;
    canvas.width = displaySize;
    canvas.height = displaySize;
    const ctx = canvas.getContext('2d')!;

    // Fill background
    if (paddingColor === 'transparent') {
      ctx.clearRect(0, 0, displaySize, displaySize);
    } else {
      ctx.fillStyle = paddingColor === 'white' ? '#FFFFFF' : customColor;
      ctx.fillRect(0, 0, displaySize, displaySize);
    }

    // Scale image to fit within square
    const aspect = img.naturalWidth / img.naturalHeight;
    let drawW: number, drawH: number;
    if (aspect > 1) {
      drawW = displaySize;
      drawH = displaySize / aspect;
    } else {
      drawH = displaySize;
      drawW = displaySize * aspect;
    }

    const { x, y } = getImageOffset(imagePosition, displaySize, drawW, drawH);
    ctx.drawImage(img, x, y, drawW, drawH);
  }, [paddingColor, customColor, imagePosition]);

  // Update preview
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || naturalSize.w === 0) return;
    const size = getCanvasSize();
    drawOnCanvas(canvas, size, img, true);
  }, [naturalSize, canvasSizeMode, customSize, paddingColor, customColor, imagePosition, getCanvasSize, drawOnCanvas]);

  const handleCreate = () => {
    const img = imageRef.current;
    if (!img || !file) return;
    setError(null);
    const size = getCanvasSize();
    const canvas = document.createElement('canvas');
    drawOnCanvas(canvas, size, img, false);

    const mime = paddingColor === 'transparent' ? 'image/png' : (file.type === 'image/png' ? 'image/png' : 'image/jpeg');
    canvas.toBlob(blob => {
      if (!blob) { setError('Could not create image.'); return; }
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultBytes(blob.size);
    }, mime, 0.95);
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const isPng = paddingColor === 'transparent' || file.type === 'image/png';
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${file.name.replace(/\.[^.]+$/, '')}_square.${isPng ? 'png' : 'jpg'}`;
    a.click();
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setImageUrl(null); setResultUrl(null); setResultBytes(null);
    setNaturalSize({ w: 0, h: 0 });
  };

  const autoSize = naturalSize.w > 0 ? Math.max(naturalSize.w, naturalSize.h) : '—';
  const targetSize = getCanvasSize();

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      WebApplicationSchema({ name: 'Square Image Creator', url: 'https://ecomsathi.vercel.app/image/square-image', description: 'Add padding to make any image perfectly square. Choose fill color and position.' }),
      BreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Tools', url: '/tools' }, { name: 'Square Image Creator', url: '/image/square-image' }]),
      FAQPageSchema(FAQS.map(f => ({ question: f.q, answer: f.a }))),
    ],
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <SEO
        title="Square Image Creator — Make Image Square Free — EcomSathi"
        description="Add padding to make any image perfectly square. Choose fill color (white, transparent, custom) and image position. Free square image maker for marketplace listings."
        keywords="square image creator, make image square online free, add padding to image, square product photo, instagram square image"
        canonicalUrl="https://ecomsathi.vercel.app/image/square-image"
        schema={schema}
      />
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Square Image Creator</h1>
        <p className="text-sm text-[#64748B] mt-1">Create a perfect square image with custom padding. Ideal for Instagram and marketplace listings.</p>
      </div>

      {!imageUrl ? (
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
              <p className="text-xs text-[#64748B]">
                Original: {naturalSize.w}×{naturalSize.h}px · {file ? formatBytes(file.size) : ''}
              </p>
            </div>
            <button type="button" onClick={handleReset} className="text-[#94A3B8] hover:text-[#DC2626]"><Trash2 size={15} /></button>
          </div>

          {/* Canvas size */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0F172A]">Canvas Size</label>
            <div className="flex gap-3 flex-wrap items-center">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  checked={canvasSizeMode === 'auto'}
                  onChange={() => setCanvasSizeMode('auto')}
                  className="accent-[#2563EB]"
                />
                Auto ({autoSize}px — largest dimension)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  checked={canvasSizeMode === 'custom'}
                  onChange={() => setCanvasSizeMode('custom')}
                  className="accent-[#2563EB]"
                />
                Custom:
              </label>
              {canvasSizeMode === 'custom' && (
                <input
                  type="number"
                  min={50}
                  max={10000}
                  value={customSize}
                  onChange={e => setCustomSize(e.target.value)}
                  className="border border-[#E2E8F0] rounded-[4px] px-3 py-1.5 text-sm w-24 focus:outline-none focus:border-[#2563EB]"
                />
              )}
              {canvasSizeMode === 'custom' && <span className="text-sm text-[#64748B]">px × {customSize}px</span>}
            </div>
          </div>

          {/* Padding color */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0F172A]">Padding Color</label>
            <div className="flex gap-3 flex-wrap items-center">
              {(['white', 'custom', 'transparent'] as PaddingColor[]).map(c => (
                <label key={c} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    checked={paddingColor === c}
                    onChange={() => setPaddingColor(c)}
                    className="accent-[#2563EB]"
                  />
                  {c === 'white' ? 'White' : c === 'transparent' ? 'Transparent' : 'Custom'}
                </label>
              ))}
              {paddingColor === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customColor}
                    onChange={e => setCustomColor(e.target.value)}
                    className="w-9 h-8 rounded border border-[#E2E8F0] p-0.5 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={e => setCustomColor(e.target.value)}
                    maxLength={7}
                    className="border border-[#E2E8F0] rounded-[4px] px-2 py-1.5 text-sm w-24 font-mono focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              )}
            </div>
            {paddingColor === 'transparent' && (
              <p className="text-xs text-[#64748B]">Output will be PNG to preserve transparency.</p>
            )}
          </div>

          {/* Position */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0F172A]">Image Position</label>
            <div className="flex flex-wrap gap-2">
              {POSITION_OPTIONS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setImagePosition(p.value)}
                  className={[
                    'px-3 py-1.5 text-xs border rounded-[4px] transition-all font-medium',
                    imagePosition === p.value
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]',
                  ].join(' ')}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="border border-[#E2E8F0] rounded-[6px] p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#64748B]">Preview</p>
              <p className="text-xs text-[#64748B]">Output: {targetSize}×{targetSize}px</p>
            </div>
            <div className="flex justify-center"
              style={{ background: 'repeating-conic-gradient(#e2e8f0 0% 25%, #fff 0% 50%) 0 0 / 12px 12px' }}
            >
              <canvas
                ref={previewCanvasRef}
                className="max-w-full max-h-64 object-contain"
              />
            </div>
          </div>

          {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

          {resultBytes !== null && (
            <p className="text-xs text-[#64748B]">Output size: <strong className="text-[#0F172A]">{formatBytes(resultBytes)}</strong></p>
          )}

          <div className="flex gap-3 flex-wrap">
            <Button variant="primary" onClick={handleCreate}>Create Square Image</Button>
            {resultUrl && (
              <Button variant="ghost" leftIcon={<Download size={15} />} onClick={handleDownload}>
                Download
              </Button>
            )}
          </div>
        </div>
      )}

      <ImageFAQ faqs={FAQS} />
    </div>
  );
};

export default SquareImageCreator;
