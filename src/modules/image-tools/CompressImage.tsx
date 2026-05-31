import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Download, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type OutputFormat = 'same' | 'jpeg' | 'png' | 'webp';

export const CompressImage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('same');
  const [targetSizeKB, setTargetSizeKB] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const previewDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBytes, setPreviewBytes] = useState<number | null>(null);

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
      setResultBytes(null);
      setPreviewUrl(null);
      setPreviewBytes(null);
      setFile(f);
      const url = URL.createObjectURL(f);
      setImageSrc(url);
      const img = new Image();
      img.onload = () => { imageRef.current = img; };
      img.src = url;
    },
    onDropRejected: (r) => setError(r[0]?.errors[0]?.message ?? 'Invalid file'),
  });

  const getOutputMime = useCallback((): string => {
    if (outputFormat === 'same') {
      return file?.type ?? 'image/jpeg';
    }
    return `image/${outputFormat}`;
  }, [outputFormat, file]);

  const renderPreview = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;
    const mime = getOutputMime();
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    if (mime !== 'image/png') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
      setPreviewBytes(blob.size);
    }, mime, quality / 100);
  }, [quality, getOutputMime]);

  // Debounce preview on quality/format change
  const schedulePreview = useCallback(() => {
    if (previewDebounce.current) clearTimeout(previewDebounce.current);
    previewDebounce.current = setTimeout(renderPreview, 300);
  }, [renderPreview]);

  React.useEffect(() => {
    if (imageSrc) schedulePreview();
  }, [quality, outputFormat, imageSrc, schedulePreview]);

  const compressToTargetSize = async (targetBytes: number, mime: string): Promise<Blob | null> => {
    const img = imageRef.current;
    if (!img) return null;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    if (mime !== 'image/png') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);

    let low = 0.1, high = 1.0, best: Blob | null = null;
    for (let i = 0; i < 12; i++) {
      const mid = (low + high) / 2;
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, mime, mid));
      if (!blob) break;
      if (blob.size <= targetBytes) { best = blob; low = mid; }
      else { high = mid; }
      if (high - low < 0.01) break;
    }
    return best;
  };

  const handleProcess = async () => {
    const img = imageRef.current;
    if (!img || !file) return;
    setProcessing(true);
    setError(null);

    try {
      const mime = getOutputMime();
      let blob: Blob | null = null;

      if (targetSizeKB && parseFloat(targetSizeKB) > 0) {
        const targetBytes = parseFloat(targetSizeKB) * 1024;
        blob = await compressToTargetSize(targetBytes, mime);
        if (!blob) throw new Error('Could not reach target size. Try a higher target.');
      } else {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        if (mime !== 'image/png') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        blob = await new Promise<Blob | null>(res => canvas.toBlob(res, mime, quality / 100));
      }

      if (!blob) throw new Error('Compression failed.');
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultBytes(blob.size);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Compression failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const extMap: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
    const mime = getOutputMime();
    const ext = extMap[mime] ?? 'jpg';
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${file.name.replace(/\.[^.]+$/, '')}_compressed.${ext}`;
    a.click();
  };

  const handleReset = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null); setImageSrc(null); setResultUrl(null); setResultBytes(null);
    setPreviewUrl(null); setPreviewBytes(null);
  };

  const compressionRatio = file && resultBytes
    ? (((file.size - resultBytes) / file.size) * 100).toFixed(1)
    : null;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Compress Image</h1>
        <p className="text-sm text-[#64748B] mt-1">Reduce image file size for web, email, or marketplace uploads.</p>
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
          {/* File info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={imageSrc} alt="Preview" className="w-12 h-12 object-cover rounded border border-[#E2E8F0]" />
              <div>
                <p className="text-sm font-medium text-[#0F172A]">{file?.name}</p>
                <p className="text-xs text-[#64748B]">{file ? formatBytes(file.size) : ''}</p>
              </div>
            </div>
            <button type="button" onClick={handleReset} className="text-[#94A3B8] hover:text-[#DC2626]"><Trash2 size={15} /></button>
          </div>

          {/* Quality slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#0F172A]">Quality</label>
              <span className="text-sm font-semibold text-[#2563EB]">{quality}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              onChange={e => setQuality(Number(e.target.value))}
              className="w-full accent-[#2563EB]"
            />
            <div className="flex justify-between text-[11px] text-[#94A3B8]">
              <span>Smallest</span>
              <span>Best Quality</span>
            </div>
          </div>

          {/* Output format */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0F172A]">Output Format</label>
            <div className="flex gap-2 flex-wrap">
              {(['same', 'jpeg', 'png', 'webp'] as OutputFormat[]).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setOutputFormat(f)}
                  className={[
                    'px-3 py-1.5 text-xs font-medium rounded border transition-all uppercase',
                    outputFormat === f
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]',
                  ].join(' ')}
                >
                  {f === 'same' ? 'Same as input' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Target file size */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#0F172A]">Target File Size (optional)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                placeholder="e.g. 200"
                value={targetSizeKB}
                onChange={e => setTargetSizeKB(e.target.value)}
                className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm w-32 focus:outline-none focus:border-[#2563EB]"
              />
              <span className="text-sm text-[#64748B]">KB</span>
            </div>
            <p className="text-xs text-[#94A3B8]">Leave blank to use quality slider.</p>
          </div>

          {/* Live preview comparison */}
          {previewUrl && (
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-[#E2E8F0] rounded-[6px] p-2 flex flex-col gap-1 items-center">
                <p className="text-[11px] font-semibold text-[#64748B]">ORIGINAL</p>
                <img src={imageSrc!} alt="Original" className="max-h-32 object-contain rounded" />
                <p className="text-xs text-[#0F172A] font-medium">{file ? formatBytes(file.size) : ''}</p>
              </div>
              <div className="border border-[#E2E8F0] rounded-[6px] p-2 flex flex-col gap-1 items-center">
                <p className="text-[11px] font-semibold text-[#2563EB]">COMPRESSED (PREVIEW)</p>
                <img src={previewUrl} alt="Preview" className="max-h-32 object-contain rounded" />
                <p className="text-xs text-[#0F172A] font-medium">{previewBytes ? formatBytes(previewBytes) : '—'}</p>
              </div>
            </div>
          )}

          {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

          {/* Stats */}
          {resultBytes !== null && file && (
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-[6px] p-3 flex flex-wrap gap-4 text-xs">
              <div>
                <p className="text-[#64748B]">Original</p>
                <p className="font-semibold text-[#0F172A]">{formatBytes(file.size)}</p>
              </div>
              <div className="text-[#94A3B8]">→</div>
              <div>
                <p className="text-[#64748B]">Compressed</p>
                <p className="font-semibold text-[#0F172A]">{formatBytes(resultBytes)}</p>
              </div>
              <div>
                <p className="text-[#64748B]">Saved</p>
                <p className="font-semibold text-[#16A34A]">{compressionRatio}%</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Button variant="primary" loading={processing} onClick={handleProcess}>
              {processing ? 'Compressing…' : 'Compress Image'}
            </Button>
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

export default CompressImage;
