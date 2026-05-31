import React, { useState, useRef } from 'react';
import { Minimize2, Download, Loader2, Info } from 'lucide-react';
import { ToolPage } from '../pdf-tools/shared/ToolPage';
import { FileUploader } from '../../components/common/FileUploader';
import { Button } from '../../components/common/Button';

const API = import.meta.env.VITE_PROCESSING_API_URL as string;

type Preset = 'small' | 'balanced' | 'high';

interface PresetInfo {
  label: string;
  description: string;
  crf: number;
  resolution: string;
  sizeFactor: number;
}

const PRESETS: Record<Preset, PresetInfo> = {
  small: {
    label: 'Small',
    description: 'CRF 28 · 720p · smallest file',
    crf: 28,
    resolution: '720p',
    sizeFactor: 0.25,
  },
  balanced: {
    label: 'Balanced',
    description: 'CRF 23 · 1080p · good quality',
    crf: 23,
    resolution: '1080p',
    sizeFactor: 0.5,
  },
  high: {
    label: 'High Quality',
    description: 'CRF 18 · original res · best quality',
    crf: 18,
    resolution: 'Original',
    sizeFactor: 0.75,
  },
};

interface JobResult {
  status: 'pending' | 'processing' | 'done' | 'error';
  resultUrl?: string;
  outputSize?: number;
  error?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const CompressVideo: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<Preset>('balanced');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const estimatedSize = file
    ? Math.round(file.size * PRESETS[preset].sizeFactor)
    : null;

  const pollJob = (jobId: string) => {
    let elapsed = 0;
    const poll = async () => {
      try {
        const res = await fetch(`${API}/api/jobs/${jobId}`);
        const data: JobResult = await res.json();
        elapsed += 2;
        setProcessingProgress(Math.min(90, Math.round((elapsed / 90) * 100)));
        if (data.status === 'done' && data.resultUrl) {
          setResultUrl(data.resultUrl);
          if (data.outputSize) setOutputSize(data.outputSize);
          setPhase('done');
          setProcessingProgress(100);
        } else if (data.status === 'error') {
          setErrorMsg(data.error ?? 'Compression failed');
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
    setOutputSize(null);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('preset', preset);
      formData.append('crf', String(PRESETS[preset].crf));

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API}/api/video/compress`);
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
    setOutputSize(null);
  };

  const savingsPercent = file && outputSize
    ? Math.round((1 - outputSize / file.size) * 100)
    : null;

  return (
    <ToolPage
      icon={<Minimize2 size={24} />}
      title="Compress Video"
      description="Reduce video file size using H.264 compression presets without losing quality."
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
        {file && (
          <div className="flex flex-wrap gap-4 text-xs text-[#64748B]">
            <span>File: <strong className="text-[#0F172A]">{file.name}</strong></span>
            <span>Size: <strong className="text-[#0F172A]">{formatBytes(file.size)}</strong></span>
          </div>
        )}
      </div>

      {/* Preset */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-5">
        <h2 className="text-base font-semibold text-[#0F172A]">2. Compression Preset</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(Object.entries(PRESETS) as [Preset, PresetInfo][]).map(([key, info]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPreset(key)}
              className={[
                'flex flex-col gap-1 rounded-[8px] border p-4 text-left transition-all',
                preset === key
                  ? 'border-[#2563EB] bg-[#EFF6FF] shadow-sm'
                  : 'border-[#E2E8F0] bg-white hover:border-[#93C5FD]',
              ].join(' ')}
            >
              <span className={`text-sm font-semibold ${preset === key ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>
                {info.label}
              </span>
              <span className="text-xs text-[#64748B]">{info.description}</span>
            </button>
          ))}
        </div>

        {/* Estimate */}
        {estimatedSize !== null && file && (
          <div className="flex items-start gap-2 rounded-[4px] bg-[#F8FAFC] border border-[#E2E8F0] p-3 text-xs text-[#475569]">
            <Info size={14} className="text-[#94A3B8] mt-0.5 shrink-0" />
            <span>
              Original: <strong>{formatBytes(file.size)}</strong>
              {' '}→ Estimated output: <strong>{formatBytes(estimatedSize)}</strong>
              {' '}(~{Math.round((1 - estimatedSize / file.size) * 100)}% smaller).
              Actual size depends on video content.
            </span>
          </div>
        )}
      </div>

      {/* Progress */}
      {(phase === 'uploading' || phase === 'processing') && (
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0F172A]">
            <Loader2 size={16} className="animate-spin text-[#2563EB]" />
            {phase === 'uploading' ? 'Uploading video…' : 'Compressing video…'}
          </div>
          <div className="w-full bg-[#E2E8F0] rounded-full h-2">
            <div
              className="bg-[#2563EB] h-2 rounded-full transition-all duration-300"
              style={{ width: `${phase === 'uploading' ? uploadProgress : processingProgress}%` }}
            />
          </div>
          <p className="text-xs text-[#64748B]">
            {phase === 'uploading' ? `${uploadProgress}%` : `${processingProgress}% — compression in progress`}
          </p>
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
      {phase === 'done' && resultUrl && file && (
        <div className="rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[#166534]">Compression complete!</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-[4px] border border-[#E2E8F0] bg-white p-3">
              <p className="text-xs text-[#64748B]">Original</p>
              <p className="text-base font-bold text-[#0F172A]">{formatBytes(file.size)}</p>
            </div>
            <div className="rounded-[4px] border border-[#E2E8F0] bg-white p-3">
              <p className="text-xs text-[#64748B]">Compressed</p>
              <p className="text-base font-bold text-[#0F172A]">
                {outputSize !== null ? formatBytes(outputSize) : '—'}
              </p>
            </div>
            <div className="rounded-[4px] border border-[#BBF7D0] bg-[#F0FDF4] p-3">
              <p className="text-xs text-[#166534]">Saved</p>
              <p className="text-base font-bold text-[#16A34A]">
                {savingsPercent !== null ? `${savingsPercent}%` : '—'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <a href={resultUrl} download="compressed.mp4">
              <Button leftIcon={<Download size={16} />}>Download Compressed Video</Button>
            </a>
            <Button variant="ghost" onClick={handleReset}>Compress another</Button>
          </div>
        </div>
      )}

      {/* Submit */}
      {(phase === 'idle' || phase === 'error') && (
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!file}
            leftIcon={<Minimize2 size={16} />}
          >
            Compress Video
          </Button>
        </div>
      )}
    </ToolPage>
  );
};

export default CompressVideo;
