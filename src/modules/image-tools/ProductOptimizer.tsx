import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Download, Trash2, CheckSquare, Square, Info } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';

const MAX_SIZE_BYTES = 20 * 1024 * 1024;
const PROCESSING_API_URL = import.meta.env.VITE_PROCESSING_API_URL as string;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Marketplace = 'amazon' | 'flipkart' | 'myntra' | 'meesho' | 'generic';

interface MarketplaceSpec {
  label: string;
  width: number;
  height: number;
  maxSizeKB: number;
  background: string;
  format: string;
  notes: string[];
}

const MARKETPLACE_SPECS: Record<Marketplace, MarketplaceSpec> = {
  amazon: {
    label: 'Amazon India',
    width: 2000,
    height: 2000,
    maxSizeKB: 10240,
    background: 'White (#FFFFFF)',
    format: 'JPEG',
    notes: ['Pure white background required for main image', 'Minimum 1000px on longest side', 'Max file size 10MB'],
  },
  flipkart: {
    label: 'Flipkart',
    width: 1500,
    height: 1500,
    maxSizeKB: 5120,
    background: 'White (#FFFFFF)',
    format: 'JPEG',
    notes: ['White background preferred', 'Min 500px recommended', 'Max file size 5MB'],
  },
  myntra: {
    label: 'Myntra',
    width: 1080,
    height: 1440,
    maxSizeKB: 5120,
    background: 'White or light grey',
    format: 'JPEG',
    notes: ['3:4 portrait ratio preferred', 'Clean background', 'Max file size 5MB'],
  },
  meesho: {
    label: 'Meesho',
    width: 1080,
    height: 1080,
    maxSizeKB: 5120,
    background: 'White (#FFFFFF)',
    format: 'JPEG',
    notes: ['Square format', 'White background preferred', 'Max file size 5MB'],
  },
  generic: {
    label: 'Generic / Other',
    width: 1200,
    height: 1200,
    maxSizeKB: 5120,
    background: 'White',
    format: 'JPEG',
    notes: ['Standard square format', 'White background'],
  },
};

interface Operations {
  resize: boolean;
  whiteBackground: boolean;
  compress: boolean;
  convertJpeg: boolean;
}

interface ChangeLog {
  operation: string;
  detail: string;
}

export const ProductOptimizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [marketplace, setMarketplace] = useState<Marketplace>('amazon');
  const [ops, setOps] = useState<Operations>({
    resize: true,
    whiteBackground: true,
    compress: true,
    convertJpeg: true,
  });
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<number | null>(null);
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      const url = URL.createObjectURL(f);
      setImageUrl(url);
      setResultUrl(null);
      setResultBytes(null);
      setChangeLogs([]);
      const img = new Image();
      img.onload = () => { imageRef.current = img; };
      img.src = url;
    },
    onDropRejected: r => setError(r[0]?.errors[0]?.message ?? 'Invalid file'),
  });

  const toggleOp = (key: keyof Operations) => {
    setOps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const spec = MARKETPLACE_SPECS[marketplace];

  const handleOptimize = useCallback(async () => {
    const img = imageRef.current;
    if (!img || !file) return;
    setProcessing(true);
    setError(null);
    const logs: ChangeLog[] = [];

    try {
      // If white background needed and we have transparency, use backend
      let sourceImg = img;
      let sourceFile = file;
      const needsBgRemoval = ops.whiteBackground && file.type !== 'image/jpeg';

      if (needsBgRemoval) {
        try {
          const formData = new FormData();
          formData.append('image', sourceFile);
          const resp = await fetch(`${PROCESSING_API_URL}/api/image/white-background`, {
            method: 'POST',
            body: formData,
          });
          if (resp.ok) {
            const blob = await resp.blob();
            const url = URL.createObjectURL(blob);
            const newImg = new Image();
            await new Promise<void>((res, rej) => {
              newImg.onload = () => res();
              newImg.onerror = () => rej();
              newImg.src = url;
            });
            sourceImg = newImg;
            sourceFile = new File([blob], 'processed.png', { type: 'image/png' });
            logs.push({ operation: 'White Background', detail: 'Background replaced with white via backend.' });
            URL.revokeObjectURL(url);
          }
        } catch {
          // fallback: fill white on canvas
          logs.push({ operation: 'White Background', detail: 'Applied white fill on canvas (fallback).' });
        }
      }

      // Draw onto canvas with correct dimensions
      const canvas = document.createElement('canvas');
      const targetW = ops.resize ? spec.width : sourceImg.naturalWidth;
      const targetH = ops.resize ? spec.height : sourceImg.naturalHeight;
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d')!;

      // White background fill
      if (ops.whiteBackground) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetW, targetH);
      }

      // Draw image (cover/contain into target)
      const aspectSrc = sourceImg.naturalWidth / sourceImg.naturalHeight;
      const aspectDst = targetW / targetH;
      let drawW: number, drawH: number, drawX: number, drawY: number;
      if (aspectSrc > aspectDst) {
        drawH = targetH;
        drawW = drawH * aspectSrc;
        drawX = (targetW - drawW) / 2;
        drawY = 0;
      } else {
        drawW = targetW;
        drawH = drawW / aspectSrc;
        drawX = 0;
        drawY = (targetH - drawH) / 2;
      }
      ctx.drawImage(sourceImg, drawX, drawY, drawW, drawH);

      if (ops.resize && (sourceImg.naturalWidth !== targetW || sourceImg.naturalHeight !== targetH)) {
        logs.push({ operation: 'Resize', detail: `${sourceImg.naturalWidth}×${sourceImg.naturalHeight} → ${targetW}×${targetH}px` });
      }

      // Determine output format
      const outputMime = ops.convertJpeg ? 'image/jpeg' : (sourceFile.type || 'image/jpeg');
      if (ops.convertJpeg && sourceFile.type !== 'image/jpeg') {
        logs.push({ operation: 'Format', detail: `Converted to JPEG` });
      }

      // Quality for compression
      let quality = 0.92;
      if (ops.compress) {
        const targetBytes = spec.maxSizeKB * 1024;
        // Binary search for quality
        let low = 0.1, high = 0.95;
        let best: Blob | null = null;
        for (let i = 0; i < 10; i++) {
          const mid = (low + high) / 2;
          const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, outputMime, mid));
          if (!blob) break;
          if (blob.size <= targetBytes) { best = blob; low = mid; quality = mid; }
          else high = mid;
          if (high - low < 0.02) break;
        }
        if (best) {
          logs.push({ operation: 'Compress', detail: `Quality set to ${Math.round(quality * 100)}% to fit under ${spec.maxSizeKB}KB target` });
          if (resultUrl) URL.revokeObjectURL(resultUrl);
          setResultUrl(URL.createObjectURL(best));
          setResultBytes(best.size);
          setChangeLogs(logs.length > 0 ? logs : [{ operation: 'No changes needed', detail: 'Image already meets requirements' }]);
          setProcessing(false);
          return;
        }
      }

      const finalBlob = await new Promise<Blob | null>(res => canvas.toBlob(res, outputMime, quality));
      if (!finalBlob) throw new Error('Could not generate output.');
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(finalBlob));
      setResultBytes(finalBlob.size);
      setChangeLogs(logs.length > 0 ? logs : [{ operation: 'Processed', detail: 'Image optimized successfully.' }]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Optimization failed.');
    } finally {
      setProcessing(false);
    }
  }, [file, marketplace, ops, spec, resultUrl]);

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${file.name.replace(/\.[^.]+$/, '')}_${marketplace}_optimized.jpg`;
    a.click();
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setImageUrl(null); setResultUrl(null); setResultBytes(null); setChangeLogs([]);
  };

  const OpsCheckbox = ({ id, label, checked }: { id: keyof Operations; label: string; checked: boolean }) => (
    <button
      type="button"
      onClick={() => toggleOp(id)}
      className="flex items-center gap-2 text-sm text-[#0F172A]"
    >
      {checked
        ? <CheckSquare size={16} className="text-[#2563EB]" />
        : <Square size={16} className="text-[#94A3B8]" />}
      {label}
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Product Image Optimizer</h1>
        <p className="text-sm text-[#64748B] mt-1">Optimize product images for Indian marketplaces — Amazon, Flipkart, Myntra, and more.</p>
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
            <p className="text-sm font-medium text-[#0F172A]">Drag product image here or <span className="text-[#2563EB] underline">click to browse</span></p>
            <p className="text-xs text-[#64748B] mt-1">JPG, PNG, WEBP · Max 20MB</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex flex-col gap-5">
          {/* File info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={imageUrl} alt="Preview" className="w-14 h-14 object-cover rounded border border-[#E2E8F0]" />
              <div>
                <p className="text-sm font-medium text-[#0F172A]">{file?.name}</p>
                <p className="text-xs text-[#64748B]">{file ? formatBytes(file.size) : ''}</p>
              </div>
            </div>
            <button type="button" onClick={handleReset} className="text-[#94A3B8] hover:text-[#DC2626]"><Trash2 size={15} /></button>
          </div>

          {/* Marketplace selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0F172A]">Target Marketplace</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(MARKETPLACE_SPECS) as Marketplace[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMarketplace(m)}
                  className={[
                    'px-3 py-1.5 text-xs font-medium rounded border transition-all',
                    marketplace === m
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]',
                  ].join(' ')}
                >
                  {MARKETPLACE_SPECS[m].label}
                </button>
              ))}
            </div>
          </div>

          {/* Spec card */}
          <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-[6px] p-3 flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-[#0C4A6E] flex items-center gap-1"><Info size={13} /> {spec.label} Requirements</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div><span className="text-[#64748B]">Size:</span> <strong>{spec.width}×{spec.height}px</strong></div>
              <div><span className="text-[#64748B]">Max:</span> <strong>{spec.maxSizeKB >= 1024 ? `${spec.maxSizeKB / 1024}MB` : `${spec.maxSizeKB}KB`}</strong></div>
              <div><span className="text-[#64748B]">Format:</span> <strong>{spec.format}</strong></div>
              <div><span className="text-[#64748B]">BG:</span> <strong>{spec.background}</strong></div>
            </div>
            <ul className="text-[11px] text-[#0369A1] list-disc list-inside mt-1 flex flex-col gap-0.5">
              {spec.notes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </div>

          {/* Operations */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-[#0F172A]">Operations</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <OpsCheckbox id="resize" label={`Resize to ${spec.width}×${spec.height}px`} checked={ops.resize} />
              <OpsCheckbox id="whiteBackground" label="Add white background" checked={ops.whiteBackground} />
              <OpsCheckbox id="compress" label={`Compress to under ${spec.maxSizeKB >= 1024 ? `${spec.maxSizeKB / 1024}MB` : `${spec.maxSizeKB}KB`}`} checked={ops.compress} />
              <OpsCheckbox id="convertJpeg" label="Convert to JPEG" checked={ops.convertJpeg} />
            </div>
          </div>

          {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Button variant="primary" loading={processing} onClick={handleOptimize}>
              {processing ? 'Optimizing…' : 'Optimize for ' + spec.label}
            </Button>
            {resultUrl && (
              <Button variant="ghost" leftIcon={<Download size={15} />} onClick={handleDownload}>
                Download
              </Button>
            )}
          </div>

          {/* Result + change log */}
          {resultUrl && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-[#E2E8F0] rounded-[6px] p-2 flex flex-col items-center gap-1">
                  <p className="text-[11px] font-semibold text-[#64748B]">ORIGINAL</p>
                  <img src={imageUrl} alt="Original" className="max-h-28 object-contain" />
                  <p className="text-xs text-[#0F172A]">{file ? formatBytes(file.size) : ''}</p>
                </div>
                <div className="border border-[#E2E8F0] rounded-[6px] p-2 flex flex-col items-center gap-1">
                  <p className="text-[11px] font-semibold text-[#2563EB]">OPTIMIZED</p>
                  <img src={resultUrl} alt="Result" className="max-h-28 object-contain" />
                  <p className="text-xs text-[#0F172A]">{resultBytes ? formatBytes(resultBytes) : ''}</p>
                </div>
              </div>
              {changeLogs.length > 0 && (
                <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-[6px] p-3">
                  <p className="text-xs font-semibold text-[#14532D] mb-2">What changed:</p>
                  <ul className="flex flex-col gap-1">
                    {changeLogs.map((l, i) => (
                      <li key={i} className="text-xs text-[#15803D]">
                        <strong>{l.operation}:</strong> {l.detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductOptimizer;
