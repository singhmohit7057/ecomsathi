import React, { useState, useRef } from 'react';
import { Layers, Download, Loader2 } from 'lucide-react';
import { ToolPage } from '../pdf-tools/shared/ToolPage';
import { FileUploader } from '../../components/common/FileUploader';
import { Button } from '../../components/common/Button';

const API = import.meta.env.VITE_PROCESSING_API_URL ?? 'http://localhost:3001';

type ExtractionMode = 'offset' | 'every_n' | 'range';
type OutputFormat = 'jpeg' | 'png';

interface JobResult {
  status: 'pending' | 'processing' | 'done' | 'error';
  resultUrl?: string;
  frameCount?: number;
  error?: string;
}

function estimateFrameCount(mode: ExtractionMode, offset: number, everyN: number, rangeStart: number, rangeEnd: number, rangeInterval: number): string {
  switch (mode) {
    case 'offset':
      return '1 frame';
    case 'every_n':
      return everyN > 0 ? `~1 frame every ${everyN}s (depends on video length)` : 'Enter interval';
    case 'range': {
      const duration = rangeEnd - rangeStart;
      if (duration <= 0 || rangeInterval <= 0) return 'Invalid range';
      const count = Math.floor(duration / rangeInterval) + 1;
      return `~${count} frame${count !== 1 ? 's' : ''}`;
    }
    default:
      return '';
  }
}

export const FrameExtractor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ExtractionMode>('offset');
  const [offset, setOffset] = useState<number>(0);
  const [everyN, setEveryN] = useState<number>(5);
  const [rangeStart, setRangeStart] = useState<number>(0);
  const [rangeEnd, setRangeEnd] = useState<number>(30);
  const [rangeInterval, setRangeInterval] = useState<number>(5);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [actualFrameCount, setActualFrameCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const frameEstimate = estimateFrameCount(mode, offset, everyN, rangeStart, rangeEnd, rangeInterval);

  const pollJob = (jobId: string) => {
    let elapsed = 0;
    const poll = async () => {
      try {
        const res = await fetch(`${API}/api/jobs/${jobId}`);
        const data: JobResult = await res.json();
        elapsed += 2;
        setProcessingProgress(Math.min(90, Math.round((elapsed / 45) * 100)));
        if (data.status === 'done' && data.resultUrl) {
          setResultUrl(data.resultUrl);
          if (data.frameCount) setActualFrameCount(data.frameCount);
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
    setActualFrameCount(null);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('mode', mode);
      formData.append('format', outputFormat);
      if (mode === 'offset') formData.append('offset', String(offset));
      if (mode === 'every_n') formData.append('everyN', String(everyN));
      if (mode === 'range') {
        formData.append('rangeStart', String(rangeStart));
        formData.append('rangeEnd', String(rangeEnd));
        formData.append('interval', String(rangeInterval));
      }

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API}/api/video/extract-frames`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
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
    setActualFrameCount(null);
  };

  return (
    <ToolPage
      icon={<Layers size={24} />}
      title="Frame Extractor"
      description="Extract frames from a video as JPEG or PNG images. Downloads as a ZIP file."
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
        <h2 className="text-base font-semibold text-[#0F172A]">2. Extraction Settings</h2>

        {/* Mode selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#0F172A]">Extraction Mode</label>
          <div className="flex gap-2 flex-wrap">
            {(['offset', 'every_n', 'range'] as ExtractionMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={[
                  'px-3 py-1.5 rounded-[4px] text-sm font-medium border transition-colors',
                  mode === m
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB]',
                ].join(' ')}
              >
                {m === 'offset' ? 'Specific Time' : m === 'every_n' ? 'Every N Seconds' : 'Range + Interval'}
              </button>
            ))}
          </div>
        </div>

        {/* Mode-specific inputs */}
        {mode === 'offset' && (
          <div className="flex flex-col gap-1.5 max-w-xs">
            <label className="text-sm font-medium text-[#0F172A]">Time Offset (seconds)</label>
            <input
              type="number"
              min={0}
              step={0.1}
              value={offset}
              onChange={(e) => setOffset(parseFloat(e.target.value) || 0)}
              className="rounded-[4px] border border-[#CBD5E1] px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
        )}

        {mode === 'every_n' && (
          <div className="flex flex-col gap-1.5 max-w-xs">
            <label className="text-sm font-medium text-[#0F172A]">Interval (seconds)</label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={everyN}
              onChange={(e) => setEveryN(parseFloat(e.target.value) || 1)}
              className="rounded-[4px] border border-[#CBD5E1] px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
        )}

        {mode === 'range' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Start (s)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={rangeStart}
                onChange={(e) => setRangeStart(parseFloat(e.target.value) || 0)}
                className="rounded-[4px] border border-[#CBD5E1] px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">End (s)</label>
              <input
                type="number"
                min={1}
                step={0.5}
                value={rangeEnd}
                onChange={(e) => setRangeEnd(parseFloat(e.target.value) || 1)}
                className="rounded-[4px] border border-[#CBD5E1] px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Interval (s)</label>
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={rangeInterval}
                onChange={(e) => setRangeInterval(parseFloat(e.target.value) || 1)}
                className="rounded-[4px] border border-[#CBD5E1] px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>
          </div>
        )}

        {/* Output format */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#0F172A]">Output Format</label>
          <div className="flex gap-2">
            {(['jpeg', 'png'] as OutputFormat[]).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setOutputFormat(fmt)}
                className={[
                  'px-4 py-2 rounded-[4px] text-sm font-medium border transition-colors uppercase',
                  outputFormat === fmt
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB]',
                ].join(' ')}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-[#64748B]">Estimated output: {frameEstimate}</p>
      </div>

      {/* Progress */}
      {(phase === 'uploading' || phase === 'processing') && (
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0F172A]">
            <Loader2 size={16} className="animate-spin text-[#2563EB]" />
            {phase === 'uploading' ? 'Uploading video…' : 'Extracting frames…'}
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
          <h3 className="text-sm font-semibold text-[#166534]">
            Frames extracted!{actualFrameCount !== null ? ` (${actualFrameCount} frames)` : ''}
          </h3>
          <p className="text-xs text-[#475569]">Your frames are packaged in a ZIP file. Click below to download.</p>
          <div className="flex gap-3">
            <a href={resultUrl} download="frames.zip">
              <Button leftIcon={<Download size={16} />}>Download ZIP</Button>
            </a>
            <Button variant="ghost" onClick={handleReset}>Extract from another</Button>
          </div>
        </div>
      )}

      {/* Submit */}
      {(phase === 'idle' || phase === 'error') && (
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!file}
            leftIcon={<Layers size={16} />}
          >
            Extract Frames
          </Button>
        </div>
      )}
    </ToolPage>
  );
};

export default FrameExtractor;
