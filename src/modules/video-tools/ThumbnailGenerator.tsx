import React, { useState, useRef } from 'react';
import { ImageIcon, Download, Loader2 } from 'lucide-react';
import { ToolPage } from '../pdf-tools/shared/ToolPage';
import { FileUploader } from '../../components/common/FileUploader';
import { Button } from '../../components/common/Button';

const API = import.meta.env.VITE_PROCESSING_API_URL as string;

type ThumbnailMode = 'auto' | 'manual';
type OutputSize = '1280x720' | '1920x1080' | 'custom';
type ImageFormat = 'jpg' | 'png';

interface SizeOption {
  label: string;
  width: number;
  height: number;
}

const OUTPUT_SIZES: Record<Exclude<OutputSize, 'custom'>, SizeOption> = {
  '1280x720': { label: '1280 × 720 (HD)', width: 1280, height: 720 },
  '1920x1080': { label: '1920 × 1080 (Full HD)', width: 1920, height: 1080 },
};

interface JobResult {
  status: 'pending' | 'processing' | 'done' | 'error';
  resultUrl?: string;
  error?: string;
}

export const ThumbnailGenerator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ThumbnailMode>('auto');
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [outputSize, setOutputSize] = useState<OutputSize>('1280x720');
  const [customWidth, setCustomWidth] = useState<number>(1280);
  const [customHeight, setCustomHeight] = useState<number>(720);
  const [imageFormat, setImageFormat] = useState<ImageFormat>('jpg');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const targetWidth = outputSize === 'custom' ? customWidth : OUTPUT_SIZES[outputSize].width;
  const targetHeight = outputSize === 'custom' ? customHeight : OUTPUT_SIZES[outputSize].height;

  const pollJob = (jobId: string) => {
    let elapsed = 0;
    const poll = async () => {
      try {
        const res = await fetch(`${API}/api/jobs/${jobId}`);
        const data: JobResult = await res.json();
        elapsed += 2;
        setProcessingProgress(Math.min(90, Math.round((elapsed / 30) * 100)));
        if (data.status === 'done' && data.resultUrl) {
          setResultUrl(data.resultUrl);
          setPhase('done');
          setProcessingProgress(100);
        } else if (data.status === 'error') {
          setErrorMsg(data.error ?? 'Processing failed');
          setPhase('error');
        } else {
          pollRef.current = setTimeout(poll, 2000);
        }
      } catch {
        pollRef.current = setTimeout(poll, 2000);
      }
    };
    poll();
  };

  const handleSubmit = async () => {
    if (!file) return;
    setPhase('uploading');
    setUploadProgress(0);
    setErrorMsg('');
    setResultUrl('');

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('mode', mode);
      formData.append('width', String(targetWidth));
      formData.append('height', String(targetHeight));
      formData.append('format', imageFormat);
      if (mode === 'manual') formData.append('timeOffset', String(timeOffset));

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API}/api/video/thumbnail`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      };

      const jobId = await new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText).jobId);
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });

      setPhase('processing');
      setProcessingProgress(0);
      pollJob(jobId);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed');
      setPhase('error');
    }
  };

  const handleReset = () => {
    if (pollRef.current) clearTimeout(pollRef.current);
    setFile(null);
    setPhase('idle');
    setUploadProgress(0);
    setProcessingProgress(0);
    setResultUrl('');
    setErrorMsg('');
  };

  return (
    <ToolPage
      icon={<ImageIcon size={24} />}
      title="Thumbnail Generator"
      description="Extract a single frame from a video as a high-quality thumbnail image."
      category="Video Tools"
    >
      {/* Upload */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-5">
        <h2 className="text-base font-semibold text-[#0F172A]">1. Upload Video</h2>
        <FileUploader
          accept={{ 'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv'] }}
          maxSizeMB={500}
          onFiles={(files) => setFile(files[0] ?? null)}
          uploading={phase === 'uploading'}
          progress={uploadProgress}
          label="Select or drag a video file (max 500 MB)"
        />
      </div>

      {/* Settings */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-5">
        <h2 className="text-base font-semibold text-[#0F172A]">2. Thumbnail Settings</h2>

        {/* Mode */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#0F172A]">Extraction Mode</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('auto')}
              className={[
                'px-4 py-2 rounded-[4px] text-sm font-medium border transition-colors',
                mode === 'auto'
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB]',
              ].join(' ')}
            >
              Auto (10% of duration)
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={[
                'px-4 py-2 rounded-[4px] text-sm font-medium border transition-colors',
                mode === 'manual'
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB]',
              ].join(' ')}
            >
              Manual (specify time)
            </button>
          </div>
        </div>

        {/* Time offset */}
        {mode === 'manual' && (
          <div className="flex flex-col gap-1.5 max-w-xs">
            <label className="text-sm font-medium text-[#0F172A]">Time Offset (seconds)</label>
            <input
              type="number"
              min={0}
              step={0.1}
              value={timeOffset}
              onChange={(e) => setTimeOffset(parseFloat(e.target.value) || 0)}
              className="rounded-[4px] border border-[#CBD5E1] px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
        )}

        {/* Output size */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#0F172A]">Output Size</label>
          <div className="flex flex-wrap gap-2">
            {(['1280x720', '1920x1080', 'custom'] as OutputSize[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setOutputSize(s)}
                className={[
                  'px-4 py-2 rounded-[4px] text-sm font-medium border transition-colors',
                  outputSize === s
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB]',
                ].join(' ')}
              >
                {s === 'custom' ? 'Custom' : OUTPUT_SIZES[s].label}
              </button>
            ))}
          </div>
        </div>

        {outputSize === 'custom' && (
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Width (px)</label>
              <input
                type="number"
                min={100}
                value={customWidth}
                onChange={(e) => setCustomWidth(parseInt(e.target.value) || 1280)}
                className="rounded-[4px] border border-[#CBD5E1] px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Height (px)</label>
              <input
                type="number"
                min={100}
                value={customHeight}
                onChange={(e) => setCustomHeight(parseInt(e.target.value) || 720)}
                className="rounded-[4px] border border-[#CBD5E1] px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>
          </div>
        )}

        {/* Image format */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#0F172A]">Output Format</label>
          <div className="flex gap-2">
            {(['jpg', 'png'] as ImageFormat[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setImageFormat(f)}
                className={[
                  'px-4 py-2 rounded-[4px] text-sm font-medium border uppercase transition-colors',
                  imageFormat === f
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB]',
                ].join(' ')}
              >
                {f}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#64748B]">
            {imageFormat === 'jpg' ? 'JPEG — smaller file, slight compression' : 'PNG — lossless, larger file'}
          </p>
        </div>
      </div>

      {/* Progress */}
      {(phase === 'uploading' || phase === 'processing') && (
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0F172A]">
            <Loader2 size={16} className="animate-spin text-[#2563EB]" />
            {phase === 'uploading' ? 'Uploading video…' : 'Generating thumbnail…'}
          </div>
          <div className="w-full bg-[#E2E8F0] rounded-full h-2">
            <div
              className="bg-[#2563EB] h-2 rounded-full transition-all duration-300"
              style={{ width: `${phase === 'uploading' ? uploadProgress : processingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {phase === 'error' && (
        <div className="rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-sm text-[#DC2626]">
          {errorMsg}
          <button onClick={handleReset} className="ml-3 underline hover:text-[#B91C1C]">Try again</button>
        </div>
      )}

      {/* Result */}
      {phase === 'done' && resultUrl && (
        <div className="rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[#166534]">Thumbnail generated!</h3>
          <img
            src={resultUrl}
            alt="Generated thumbnail"
            className="max-w-full max-h-72 rounded-[4px] border border-[#E2E8F0] object-contain"
          />
          <div className="flex gap-3">
            <a href={resultUrl} download={`thumbnail.${imageFormat}`}>
              <Button leftIcon={<Download size={16} />}>
                Download {imageFormat.toUpperCase()}
              </Button>
            </a>
            <Button variant="ghost" onClick={handleReset}>Generate another</Button>
          </div>
        </div>
      )}

      {/* Submit */}
      {(phase === 'idle' || phase === 'error') && (
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!file}
            leftIcon={<ImageIcon size={16} />}
          >
            Generate Thumbnail
          </Button>
        </div>
      )}
    </ToolPage>
  );
};

export default ThumbnailGenerator;
