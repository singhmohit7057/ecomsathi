import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Download, Trash2, Type, ImageIcon } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

type WatermarkType = 'text' | 'image';

type Position =
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

const POSITIONS: { value: Position; label: string }[] = [
  { value: 'top-left', label: '↖' },
  { value: 'top-center', label: '↑' },
  { value: 'top-right', label: '↗' },
  { value: 'middle-left', label: '←' },
  { value: 'center', label: '·' },
  { value: 'middle-right', label: '→' },
  { value: 'bottom-left', label: '↙' },
  { value: 'bottom-center', label: '↓' },
  { value: 'bottom-right', label: '↘' },
];

function getPositionCoords(
  pos: Position,
  canvasW: number,
  canvasH: number,
  elmW: number,
  elmH: number,
  margin: number,
): { x: number; y: number } {
  const map: Record<Position, { x: number; y: number }> = {
    'top-left':      { x: margin, y: margin },
    'top-center':    { x: (canvasW - elmW) / 2, y: margin },
    'top-right':     { x: canvasW - elmW - margin, y: margin },
    'middle-left':   { x: margin, y: (canvasH - elmH) / 2 },
    'center':        { x: (canvasW - elmW) / 2, y: (canvasH - elmH) / 2 },
    'middle-right':  { x: canvasW - elmW - margin, y: (canvasH - elmH) / 2 },
    'bottom-left':   { x: margin, y: canvasH - elmH - margin },
    'bottom-center': { x: (canvasW - elmW) / 2, y: canvasH - elmH - margin },
    'bottom-right':  { x: canvasW - elmW - margin, y: canvasH - elmH - margin },
  };
  return map[pos];
}

export const ImageWatermark: React.FC = () => {
  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');
  // Text watermark
  const [text, setText] = useState('© EcomSathi');
  const [fontSize, setFontSize] = useState(48);
  const [fontColor, setFontColor] = useState('#FFFFFF');
  const [opacity, setOpacity] = useState(70);
  const [position, setPosition] = useState<Position>('bottom-right');
  // Image watermark
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoSizePct, setLogoSizePct] = useState(20);
  const [logoOpacity, setLogoOpacity] = useState(80);

  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const { getRootProps: getBaseRootProps, getInputProps: getBaseInputProps, isDragActive: isBaseDrag } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: MAX_SIZE_BYTES,
    multiple: false,
    onDrop: (accepted, rejected) => {
      if (rejected.length > 0) { setError('Invalid file or too large.'); return; }
      const f = accepted[0];
      if (!f) return;
      if (baseUrl) URL.revokeObjectURL(baseUrl);
      setBaseFile(f);
      const url = URL.createObjectURL(f);
      setBaseUrl(url);
      const img = new Image();
      img.onload = () => { baseImgRef.current = img; drawPreview(); };
      img.src = url;
    },
  });

  const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    onDrop: (accepted) => {
      const f = accepted[0];
      if (!f) return;
      if (logoUrl) URL.revokeObjectURL(logoUrl);
      setLogoFile(f);
      const url = URL.createObjectURL(f);
      setLogoUrl(url);
      const img = new Image();
      img.onload = () => { logoImgRef.current = img; drawPreview(); };
      img.src = url;
    },
  });

  const drawWatermark = useCallback((
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number,
  ) => {
    if (watermarkType === 'text') {
      ctx.save();
      ctx.globalAlpha = opacity / 100;
      ctx.fillStyle = fontColor;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textBaseline = 'top';
      const metrics = ctx.measureText(text);
      const textW = metrics.width;
      const textH = fontSize * 1.2;
      const { x, y } = getPositionCoords(position, canvasW, canvasH, textW, textH, 20);
      // Shadow for readability
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(text, x, y);
      ctx.restore();
    } else {
      const logoImg = logoImgRef.current;
      if (!logoImg) return;
      ctx.save();
      ctx.globalAlpha = logoOpacity / 100;
      const logoW = canvasW * (logoSizePct / 100);
      const logoH = (logoImg.naturalHeight / logoImg.naturalWidth) * logoW;
      const { x, y } = getPositionCoords(position, canvasW, canvasH, logoW, logoH, 20);
      ctx.drawImage(logoImg, x, y, logoW, logoH);
      ctx.restore();
    }
  }, [watermarkType, text, fontSize, fontColor, opacity, position, logoSizePct, logoOpacity]);

  const drawPreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const img = baseImgRef.current;
    if (!canvas || !img) return;
    const maxW = 560;
    const scale = Math.min(maxW / img.naturalWidth, 1);
    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    drawWatermark(ctx, canvas.width, canvas.height);
  }, [drawWatermark]);

  useEffect(() => {
    if (baseUrl) drawPreview();
  }, [baseUrl, text, fontSize, fontColor, opacity, position, logoSizePct, logoOpacity, watermarkType, logoUrl, drawPreview]);

  const handleApply = () => {
    const img = baseImgRef.current;
    if (!img || !baseFile) return;
    setError(null);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    drawWatermark(ctx, canvas.width, canvas.height);
    const mime = baseFile.type === 'image/png' ? 'image/png' : 'image/jpeg';
    canvas.toBlob(blob => {
      if (!blob) { setError('Failed to process image.'); return; }
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    }, mime, 0.95);
  };

  const handleDownload = () => {
    if (!resultUrl || !baseFile) return;
    const ext = baseFile.name.split('.').pop() ?? 'jpg';
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${baseFile.name.replace(/\.[^.]+$/, '')}_watermarked.${ext}`;
    a.click();
  };

  const handleReset = () => {
    if (baseUrl) URL.revokeObjectURL(baseUrl);
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setBaseFile(null); setBaseUrl(null); setLogoFile(null); setLogoUrl(null); setResultUrl(null);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Image Watermark</h1>
        <p className="text-sm text-[#64748B] mt-1">Add text or logo watermarks to your product images.</p>
      </div>

      {/* Upload base image */}
      {!baseUrl ? (
        <div
          {...getBaseRootProps()}
          className={[
            'border-2 border-dashed rounded-[8px] p-10 flex flex-col items-center gap-3 cursor-pointer transition-all',
            isBaseDrag ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#2563EB] hover:bg-[#EFF6FF]',
          ].join(' ')}
        >
          <input {...getBaseInputProps()} />
          <UploadCloud size={40} className={isBaseDrag ? 'text-[#2563EB]' : 'text-[#94A3B8]'} />
          <div className="text-center">
            <p className="text-sm font-medium text-[#0F172A]">
              Drag image here or <span className="text-[#2563EB] underline">click to browse</span>
            </p>
            <p className="text-xs text-[#64748B] mt-1">JPG, PNG, WEBP · Max 20MB</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex flex-col gap-5">
          {/* File + reset */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#0F172A]">{baseFile?.name}</p>
            <button type="button" onClick={handleReset} className="text-[#94A3B8] hover:text-[#DC2626]"><Trash2 size={15} /></button>
          </div>

          {/* Watermark type toggle */}
          <div className="flex gap-2">
            {(['text', 'image'] as WatermarkType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setWatermarkType(t)}
                className={[
                  'flex items-center gap-2 px-4 py-2 border rounded-[6px] text-sm font-medium transition-all',
                  watermarkType === t
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]',
                ].join(' ')}
              >
                {t === 'text' ? <Type size={14} /> : <ImageIcon size={14} />}
                {t === 'text' ? 'Text' : 'Image Logo'}
              </button>
            ))}
          </div>

          {/* Text controls */}
          {watermarkType === 'text' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#64748B]">Watermark Text</label>
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#64748B]">Font Size: {fontSize}px</label>
                <input type="range" min={10} max={200} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="accent-[#2563EB]" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#64748B]">Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={fontColor} onChange={e => setFontColor(e.target.value)} className="w-9 h-9 rounded border border-[#E2E8F0] p-0.5 cursor-pointer" />
                  <input
                    type="text"
                    value={fontColor}
                    onChange={e => setFontColor(e.target.value)}
                    maxLength={7}
                    className="border border-[#E2E8F0] rounded-[4px] px-2 py-1.5 text-sm w-24 font-mono focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#64748B]">Opacity: {opacity}%</label>
                <input type="range" min={10} max={100} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="accent-[#2563EB]" />
              </div>
            </div>
          )}

          {/* Image logo controls */}
          {watermarkType === 'image' && (
            <div className="flex flex-col gap-4">
              <div
                {...getLogoRootProps()}
                className="border-2 border-dashed border-[#CBD5E1] rounded-[6px] p-4 flex items-center gap-3 cursor-pointer hover:border-[#2563EB] transition-all bg-[#F8FAFC]"
              >
                <input {...getLogoInputProps()} />
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded" />
                ) : (
                  <ImageIcon size={24} className="text-[#94A3B8]" />
                )}
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">
                    {logoFile ? logoFile.name : 'Upload logo image'}
                  </p>
                  <p className="text-xs text-[#64748B]">PNG recommended for transparency</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#64748B]">Logo Size: {logoSizePct}% of image width</label>
                  <input type="range" min={5} max={80} value={logoSizePct} onChange={e => setLogoSizePct(Number(e.target.value))} className="accent-[#2563EB]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#64748B]">Opacity: {logoOpacity}%</label>
                  <input type="range" min={10} max={100} value={logoOpacity} onChange={e => setLogoOpacity(Number(e.target.value))} className="accent-[#2563EB]" />
                </div>
              </div>
            </div>
          )}

          {/* Position picker */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#64748B]">Position</label>
            <div className="grid grid-cols-3 gap-1 w-32">
              {POSITIONS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPosition(p.value)}
                  title={p.value}
                  className={[
                    'w-10 h-10 text-lg border rounded-[4px] transition-all',
                    position === p.value
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#2563EB]',
                  ].join(' ')}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas preview */}
          <div className="border border-[#E2E8F0] rounded-[6px] overflow-hidden">
            <p className="text-xs font-medium text-[#64748B] px-3 py-2 border-b border-[#E2E8F0]">Live Preview</p>
            <canvas ref={previewCanvasRef} className="w-full max-h-64 object-contain" />
          </div>

          {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

          <div className="flex gap-3 flex-wrap">
            <Button variant="primary" onClick={handleApply}>Apply Watermark</Button>
            {resultUrl && (
              <Button variant="ghost" leftIcon={<Download size={15} />} onClick={handleDownload}>
                Download
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageWatermark;
