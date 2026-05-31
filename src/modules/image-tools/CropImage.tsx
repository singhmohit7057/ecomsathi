import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Download, Trash2, RotateCw, Crop } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

type AspectRatio = 'free' | '1:1' | '4:3' | '16:9' | '3:4';

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ASPECT_OPTIONS: { label: string; value: AspectRatio; ratio: number | null }[] = [
  { label: 'Free', value: 'free', ratio: null },
  { label: '1:1', value: '1:1', ratio: 1 },
  { label: '4:3', value: '4:3', ratio: 4 / 3 },
  { label: '16:9', value: '16:9', ratio: 16 / 9 },
  { label: '3:4', value: '3:4', ratio: 3 / 4 },
];

const HANDLE_SIZE = 10;

export const CropImage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('free');
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 600, h: 450 });

  // Drag state
  const dragState = useRef<{
    type: 'move' | 'nw' | 'ne' | 'sw' | 'se' | null;
    startX: number;
    startY: number;
    startRect: CropRect;
  }>({ type: null, startX: 0, startY: 0, startRect: cropRect });

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
      setRotation(0);
      setFile(f);
      const url = URL.createObjectURL(f);
      setImageSrc(url);
    },
  });

  // Compute canvas display size
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(() => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setCanvasSize({ w, h: Math.round(w * 0.6) });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { w: cw, h: ch } = canvasSize;
    canvas.width = cw;
    canvas.height = ch;

    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, cw, ch);

    const img = imageRef.current;
    const rad = (rotation * Math.PI) / 180;
    const rotW = Math.abs(img.naturalWidth * Math.cos(rad)) + Math.abs(img.naturalHeight * Math.sin(rad));
    const rotH = Math.abs(img.naturalWidth * Math.sin(rad)) + Math.abs(img.naturalHeight * Math.cos(rad));
    const scale = Math.min(cw / rotW, ch / rotH) * 0.9;
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const offsetX = (cw - rotW * scale) / 2;
    const offsetY = (ch - rotH * scale) / 2;

    ctx.save();
    ctx.translate(cw / 2, ch / 2);
    ctx.rotate(rad);
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Crop overlay
    const imgLeft = (cw - rotW * scale) / 2;
    const imgTop = (ch - rotH * scale) / 2;
    const imgDisplayW = rotW * scale;
    const imgDisplayH = rotH * scale;

    const cx = imgLeft + cropRect.x * imgDisplayW;
    const cy = imgTop + cropRect.y * imgDisplayH;
    const cw2 = cropRect.w * imgDisplayW;
    const ch2 = cropRect.h * imgDisplayH;

    // Darken outside
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.clearRect(cx, cy, cw2, ch2);
    ctx.fillStyle = 'rgba(0,0,0,0)';

    // Re-draw image inside crop (to restore it from clearRect)
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx, cy, cw2, ch2);
    ctx.clip();
    ctx.translate(cw / 2, ch / 2);
    ctx.rotate(rad);
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Border
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cw2, ch2);

    // Rule of thirds
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + (cw2 * i) / 3, cy);
      ctx.lineTo(cx + (cw2 * i) / 3, cy + ch2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + (ch2 * i) / 3);
      ctx.lineTo(cx + cw2, cy + (ch2 * i) / 3);
      ctx.stroke();
    }

    // Handles
    const handles: [number, number][] = [
      [cx, cy], [cx + cw2, cy], [cx, cy + ch2], [cx + cw2, cy + ch2],
    ];
    ctx.fillStyle = '#2563EB';
    handles.forEach(([hx, hy]) => {
      ctx.beginPath();
      ctx.arc(hx, hy, HANDLE_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Store offsets for hit testing
    (canvas as unknown as Record<string, unknown>).__cropMeta = {
      imgLeft, imgTop, imgDisplayW, imgDisplayH, cx, cy, cw2, ch2,
    };
  }, [canvasSize, rotation, cropRect]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const loadImage = useCallback((src: string) => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      drawCanvas();
    };
    img.src = src;
  }, [drawCanvas]);

  useEffect(() => {
    if (imageSrc) loadImage(imageSrc);
  }, [imageSrc, loadImage]);

  const getCropMeta = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return (canvas as unknown as Record<string, unknown>).__cropMeta as {
      imgLeft: number; imgTop: number; imgDisplayW: number; imgDisplayH: number;
      cx: number; cy: number; cw2: number; ch2: number;
    } | undefined;
  };

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const getHandleType = (mx: number, my: number): 'nw' | 'ne' | 'sw' | 'se' | 'move' | null => {
    const meta = getCropMeta();
    if (!meta) return null;
    const { cx, cy, cw2, ch2 } = meta;
    const tol = HANDLE_SIZE + 4;
    if (Math.abs(mx - cx) < tol && Math.abs(my - cy) < tol) return 'nw';
    if (Math.abs(mx - (cx + cw2)) < tol && Math.abs(my - cy) < tol) return 'ne';
    if (Math.abs(mx - cx) < tol && Math.abs(my - (cy + ch2)) < tol) return 'sw';
    if (Math.abs(mx - (cx + cw2)) < tol && Math.abs(my - (cy + ch2)) < tol) return 'se';
    if (mx > cx && mx < cx + cw2 && my > cy && my < cy + ch2) return 'move';
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasPos(e);
    const type = getHandleType(x, y);
    if (!type) return;
    dragState.current = { type, startX: x, startY: y, startRect: { ...cropRect } };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { type } = dragState.current;
    const { x, y } = getCanvasPos(e);
    const handleType = getHandleType(x, y);
    const cursorMap = {
      nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize', move: 'move',
    };
    if (canvasRef.current) {
      canvasRef.current.style.cursor = handleType ? cursorMap[handleType] : 'default';
    }
    if (!type) return;

    const meta = getCropMeta();
    if (!meta) return;
    const { imgDisplayW, imgDisplayH } = meta;
    const dx = (x - dragState.current.startX) / imgDisplayW;
    const dy = (y - dragState.current.startY) / imgDisplayH;
    const sr = dragState.current.startRect;

    const arOption = ASPECT_OPTIONS.find(a => a.value === aspectRatio);
    const ar = arOption?.ratio ?? null;

    let newRect = { ...sr };
    const minSz = 0.05;

    if (type === 'move') {
      newRect.x = Math.max(0, Math.min(1 - sr.w, sr.x + dx));
      newRect.y = Math.max(0, Math.min(1 - sr.h, sr.y + dy));
    } else if (type === 'se') {
      let nw = Math.max(minSz, sr.w + dx);
      let nh = ar ? nw / ar : Math.max(minSz, sr.h + dy);
      nw = Math.min(1 - sr.x, nw);
      nh = Math.min(1 - sr.y, nh);
      if (ar) nw = nh * ar;
      newRect.w = nw;
      newRect.h = nh;
    } else if (type === 'sw') {
      let nw = Math.max(minSz, sr.w - dx);
      let nh = ar ? nw / ar : Math.max(minSz, sr.h + dy);
      nw = Math.min(sr.x + sr.w, nw);
      nh = Math.min(1 - sr.y, nh);
      if (ar) nw = nh * ar;
      newRect.x = sr.x + sr.w - nw;
      newRect.w = nw;
      newRect.h = nh;
    } else if (type === 'nw') {
      let nw = Math.max(minSz, sr.w - dx);
      let nh = ar ? nw / ar : Math.max(minSz, sr.h - dy);
      nw = Math.min(sr.x + sr.w, nw);
      nh = Math.min(sr.y + sr.h, nh);
      if (ar) nh = nw / ar;
      newRect.x = sr.x + sr.w - nw;
      newRect.y = sr.y + sr.h - nh;
      newRect.w = nw;
      newRect.h = nh;
    } else if (type === 'ne') {
      let nw = Math.max(minSz, sr.w + dx);
      let nh = ar ? nw / ar : Math.max(minSz, sr.h - dy);
      nw = Math.min(1 - sr.x, nw);
      nh = Math.min(sr.y + sr.h, nh);
      if (ar) nh = nw / ar;
      newRect.y = sr.y + sr.h - nh;
      newRect.w = nw;
      newRect.h = nh;
    }
    setCropRect(newRect);
  };

  const handleMouseUp = () => {
    dragState.current.type = null;
  };

  const handleRotate = () => {
    setRotation(r => (r + 90) % 360);
  };

  const handleApplyCrop = () => {
    if (!imageRef.current) return;
    const img = imageRef.current;
    const rad = (rotation * Math.PI) / 180;
    const rotW = Math.abs(img.naturalWidth * Math.cos(rad)) + Math.abs(img.naturalHeight * Math.sin(rad));
    const rotH = Math.abs(img.naturalWidth * Math.sin(rad)) + Math.abs(img.naturalHeight * Math.cos(rad));

    const offscreen = document.createElement('canvas');
    offscreen.width = rotW;
    offscreen.height = rotH;
    const ctx = offscreen.getContext('2d')!;
    ctx.translate(rotW / 2, rotH / 2);
    ctx.rotate(rad);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    const cropX = cropRect.x * rotW;
    const cropY = cropRect.y * rotH;
    const cropW = cropRect.w * rotW;
    const cropH = cropRect.h * rotH;

    const out = document.createElement('canvas');
    out.width = cropW;
    out.height = cropH;
    const octx = out.getContext('2d')!;
    octx.drawImage(offscreen, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    const mimeType = file?.type ?? 'image/jpeg';
    out.toBlob(blob => {
      if (!blob) return;
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    }, mimeType, 0.95);
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    const ext = file.name.split('.').pop() ?? 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '');
    a.download = `${baseName}_cropped.${ext}`;
    a.click();
  };

  const handleReset = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setImageSrc(null);
    setResultUrl(null);
    setRotation(0);
    setCropRect({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  };

  const pixelX = Math.round(cropRect.x * naturalSize.w);
  const pixelY = Math.round(cropRect.y * naturalSize.h);
  const pixelW = Math.round(cropRect.w * naturalSize.w);
  const pixelH = Math.round(cropRect.h * naturalSize.h);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Crop Image</h1>
        <p className="text-sm text-[#64748B] mt-1">Drag the handles to define your crop area.</p>
      </div>

      {!imageSrc && (
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
      )}

      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {imageSrc && (
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex flex-col gap-4">
          {/* Controls */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-medium text-[#64748B]">Aspect Ratio:</span>
              {ASPECT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setAspectRatio(opt.value);
                    if (opt.ratio) {
                      const newH = cropRect.w / opt.ratio;
                      setCropRect(r => ({ ...r, h: Math.min(1 - r.y, newH) }));
                    }
                  }}
                  className={[
                    'px-2.5 py-1 text-xs rounded border font-medium transition-all',
                    aspectRatio === opt.value
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <Button variant="ghost" size="sm" leftIcon={<RotateCw size={13} />} onClick={handleRotate}>
                Rotate 90°
              </Button>
              <button
                type="button"
                onClick={handleReset}
                className="text-[#94A3B8] hover:text-[#DC2626] transition-colors"
                aria-label="Remove"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div ref={containerRef} className="w-full">
            <canvas
              ref={canvasRef}
              width={canvasSize.w}
              height={canvasSize.h}
              className="w-full rounded-[6px]"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          {/* Coordinates */}
          {naturalSize.w > 0 && (
            <div className="flex flex-wrap gap-4 text-xs text-[#64748B]">
              <span>X: <strong className="text-[#0F172A]">{pixelX}px</strong> ({Math.round(cropRect.x * 100)}%)</span>
              <span>Y: <strong className="text-[#0F172A]">{pixelY}px</strong> ({Math.round(cropRect.y * 100)}%)</span>
              <span>W: <strong className="text-[#0F172A]">{pixelW}px</strong> ({Math.round(cropRect.w * 100)}%)</span>
              <span>H: <strong className="text-[#0F172A]">{pixelH}px</strong> ({Math.round(cropRect.h * 100)}%)</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="primary"
              leftIcon={<Crop size={15} />}
              onClick={handleApplyCrop}
            >
              Apply Crop
            </Button>
            {resultUrl && (
              <Button
                variant="ghost"
                leftIcon={<Download size={15} />}
                onClick={handleDownload}
              >
                Download
              </Button>
            )}
          </div>

          {/* Result preview */}
          {resultUrl && (
            <div className="border border-[#E2E8F0] rounded-[6px] p-3">
              <p className="text-xs font-medium text-[#64748B] mb-2">Cropped Result</p>
              <img
                src={resultUrl}
                alt="Cropped"
                className="max-h-48 rounded object-contain"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CropImage;
