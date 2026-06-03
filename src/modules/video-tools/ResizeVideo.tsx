import React, { useState, useRef } from 'react';
import { Maximize2, Download, Loader2 } from 'lucide-react';
import { ToolPage } from '../pdf-tools/shared/ToolPage';
import { FileUploader } from '../../components/common/FileUploader';
import { Button } from '../../components/common/Button';

const API = import.meta.env.VITE_PROCESSING_API_URL ?? 'http://localhost:3001';

type ResolutionPreset = '480p' | '720p' | '1080p' | '4K' | 'custom';

interface ResolutionOption {
  label: string;
  width: number;
  height: number;
}

const RESOLUTION_PRESETS: Record<Exclude<ResolutionPreset, 'custom'>, ResolutionOption> = {
  '480p': { label: '480p (854×480)', width: 854, height: 480 },
  '720p': { label: '720p (1280×720)', width: 1280, height: 720 },
  '1080p': { label: '1080p (1920×1080)', width: 1920, height: 1080 },
  '4K': { label: '4K (3840×2160)', width: 3840, height: 2160 },
};

interface JobResult {
  status: 'pending' | 'processing' | 'done' | 'error';
  resultUrl?: string;
  error?: string;
}

export const ResizeVideo: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [resolutionPreset, setResolutionPreset] = useState<ResolutionPreset>('720p');
  const [customWidth, setCustomWidth] = useState<number>(1280);
  const [customHeight, setCustomHeight] = useState<number>(720);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const targetWidth = resolutionPreset === 'custom'
    ? customWidth
    : RESOLUTION_PRESETS[resolutionPreset].width;
  const targetHeight = resolutionPreset === 'custom'
    ? customHeight
    : RESOLUTION_PRESETS[resolutionPreset].height;

  const handleCustomWidthChange = (w: number) => {
    setCustomWidth(w);
  };

  const pollJob = (jobId: string) => {
    let elapsed = 0;
    const poll = async () => {
      try {
        const res = await fetch(`${API}/api/jobs/${jobId}`);
        const data: JobResult = await res.json();
        elapsed += 2;
        setProcessingProgress(Math.min(90, Math.round((elapsed / 60) * 100)));
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
      formData.append('width', String(targetWidth));
      formData.append('height', String(maintainAspect ? -2 : targetHeight));
      formData.append('maintainAspect', String(maintainAspect));

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API}/api/video/resize`);
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
      icon={<Maximize2 size={24} />}
      title="Resize Video"
      description="Change video resolution to common presets or a custom size."
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

      {/* Resolution Settings */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-5">
        <h2 className="text-base font-semibold text-[#0F172A]">2. Output Resolution</h2>

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2">
          {(['480p', '720p', '1080p', '4K', 'custom'] as ResolutionPreset[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setResolutionPreset(p)}
              className={[
                'px-4 py-2 rounded-[4px] text-sm font-medium border transition-colors',
                resolutionPreset === p
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB]',
              ].join(' ')}
            >
              {p === 'custom' ? 'Custom' : p}
            </button>
          ))}
        </div>

        {/* Preset info */}
        {resolutionPreset !== 'custom' && (
          <p className="text-xs text-[#64748B]">
            Output: {RESOLUTION_PRESETS[resolutionPreset].width} × {RESOLUTION_PRESETS[resolutionPreset].height} px
          </p>
        )}

        {/* Custom dimensions */}
        {resolutionPreset === 'custom' && (
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Width (px)</label>
              <input
                type="number"
                min={100}
                max={7680}
                step={2}
                value={customWidth}
                onChange={(e) => handleCustomWidthChange(parseInt(e.target.value) || 1280)}
                className="rounded-[4px] border border-[#CBD5E1] px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Height (px)</label>
              <input
                type="number"
                min={100}
                max={4320}
                step={2}
                value={customHeight}
                disabled={maintainAspect}
                onChange={(e) => setCustomHeight(parseInt(e.target.value) || 720)}
                className={[
                  'rounded-[4px] border border-[#CBD5E1] px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20',
                  maintainAspect ? 'bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed' : '',
                ].join(' ')}
              />
            </div>
          </div>
        )}

        {/* Maintain aspect ratio */}
        <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
          <input
            type="checkbox"
            checked={maintainAspect}
            onChange={(e) => setMaintainAspect(e.target.checked)}
            className="h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]/20"
          />
          <span className="text-sm text-[#0F172A]">Maintain aspect ratio</span>
        </label>
        {maintainAspect && (
          <p className="text-xs text-[#64748B]">
            Height will be calculated automatically to preserve the original aspect ratio.
          </p>
        )}
      </div>

      {/* Progress */}
      {(phase === 'uploading' || phase === 'processing') && (
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0F172A]">
            <Loader2 size={16} className="animate-spin text-[#2563EB]" />
            {phase === 'uploading' ? 'Uploading video…' : 'Resizing video…'}
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
          <h3 className="text-sm font-semibold text-[#166534]">Video resized successfully!</h3>
          <div className="flex gap-3">
            <a href={resultUrl} download="resized.mp4">
              <Button leftIcon={<Download size={16} />}>Download Resized Video</Button>
            </a>
            <Button variant="ghost" onClick={handleReset}>Resize another</Button>
          </div>
        </div>
      )}

      {/* Submit */}
      {(phase === 'idle' || phase === 'error') && (
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!file}
            leftIcon={<Maximize2 size={16} />}
          >
            Resize Video
          </Button>
        </div>
      )}
    </ToolPage>
  );
};

export default ResizeVideo;
