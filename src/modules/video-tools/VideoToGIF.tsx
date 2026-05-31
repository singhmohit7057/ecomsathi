import React, { useState, useRef } from 'react';
import { Film, Download, Loader2 } from 'lucide-react';
import { ToolPage } from '../pdf-tools/shared/ToolPage';
import { FileUploader } from '../../components/common/FileUploader';
import { Button } from '../../components/common/Button';

const API = import.meta.env.VITE_PROCESSING_API_URL as string;
const MAX_CLIP_SECONDS = 30;

interface JobResult {
  status: 'pending' | 'processing' | 'done' | 'error';
  resultUrl?: string;
  error?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const VideoToGIF: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [outputWidth, setOutputWidth] = useState<number>(480);
  const [fps, setFps] = useState<number>(10);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clipDuration = endTime - startTime;
  const clipValid = clipDuration > 0 && clipDuration <= MAX_CLIP_SECONDS && startTime >= 0;

  const pollJob = (jobId: string) => {
    let elapsed = 0;
    const poll = async () => {
      try {
        const res = await fetch(`${API}/api/jobs/${jobId}`);
        const data: JobResult = await res.json();
        elapsed += 2;
        const estimated = Math.min(90, Math.round((elapsed / 60) * 100));
        setProcessingProgress(estimated);
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
    if (!file || !clipValid) return;
    setPhase('uploading');
    setUploadProgress(0);
    setErrorMsg('');
    setResultUrl('');

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('startTime', String(startTime));
      formData.append('endTime', String(endTime));
      formData.append('width', String(outputWidth));
      formData.append('fps', String(fps));

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API}/api/video/to-gif`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      const jobId = await new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.jobId);
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
      icon={<Film size={24} />}
      title="Video to GIF"
      description="Convert a video clip to an animated GIF. Supports MP4, MOV, AVI, WEBM."
      category="Video Tools"
    >
      {/* Upload */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-5">
        <h2 className="text-base font-semibold text-[#0F172A]">1. Upload Video</h2>
        <FileUploader
          accept={{ 'video/*': ['.mp4', '.mov', '.avi', '.webm'] }}
          maxSizeMB={500}
          onFiles={(files) => setFile(files[0] ?? null)}
          uploading={phase === 'uploading'}
          progress={uploadProgress}
          label="Select or drag a video file (max 500 MB)"
        />
        {file && (
          <p className="text-xs text-[#64748B]">
            {file.name} &mdash; {formatBytes(file.size)}
          </p>
        )}
      </div>

      {/* Settings */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-5">
        <h2 className="text-base font-semibold text-[#0F172A]">2. GIF Settings</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Start Time */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0F172A]">Start Time (seconds)</label>
            <input
              type="number"
              min={0}
              step={0.1}
              value={startTime}
              onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
              className="rounded-[4px] border border-[#CBD5E1] px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
          {/* End Time */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0F172A]">End Time (seconds)</label>
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={endTime}
              onChange={(e) => setEndTime(parseFloat(e.target.value) || 1)}
              className="rounded-[4px] border border-[#CBD5E1] px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
          {/* Output Width */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0F172A]">Output Width (px)</label>
            <input
              type="number"
              min={100}
              max={1920}
              step={10}
              value={outputWidth}
              onChange={(e) => setOutputWidth(parseInt(e.target.value) || 480)}
              className="rounded-[4px] border border-[#CBD5E1] px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
          {/* FPS */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0F172A]">Frame Rate (FPS)</label>
            <select
              value={fps}
              onChange={(e) => setFps(parseInt(e.target.value))}
              className="rounded-[4px] border border-[#CBD5E1] px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            >
              <option value={5}>5 FPS</option>
              <option value={10}>10 FPS (default)</option>
              <option value={15}>15 FPS</option>
            </select>
          </div>
        </div>

        {/* Validation hints */}
        {!clipValid && startTime >= 0 && (
          <p className="text-xs text-[#DC2626]">
            {clipDuration <= 0
              ? 'End time must be greater than start time.'
              : `Clip duration is ${clipDuration.toFixed(1)}s — max is ${MAX_CLIP_SECONDS}s.`}
          </p>
        )}
        {clipValid && (
          <p className="text-xs text-[#16A34A]">
            Clip: {clipDuration.toFixed(1)}s &middot; {outputWidth}px wide &middot; {fps} FPS
          </p>
        )}
      </div>

      {/* Progress */}
      {(phase === 'uploading' || phase === 'processing') && (
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0F172A]">
            <Loader2 size={16} className="animate-spin text-[#2563EB]" />
            {phase === 'uploading' ? 'Uploading video…' : 'Converting to GIF…'}
          </div>
          <div className="w-full bg-[#E2E8F0] rounded-full h-2">
            <div
              className="bg-[#2563EB] h-2 rounded-full transition-all duration-300"
              style={{ width: `${phase === 'uploading' ? uploadProgress : processingProgress}%` }}
            />
          </div>
          <p className="text-xs text-[#64748B]">
            {phase === 'uploading'
              ? `Uploading: ${uploadProgress}%`
              : `Processing: ${processingProgress}%`}
          </p>
        </div>
      )}

      {/* Error */}
      {phase === 'error' && (
        <div className="rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-sm text-[#DC2626]">
          {errorMsg}
          <button onClick={handleReset} className="ml-3 underline text-[#DC2626] hover:text-[#B91C1C]">
            Try again
          </button>
        </div>
      )}

      {/* Result */}
      {phase === 'done' && resultUrl && (
        <div className="rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[#166534]">GIF ready!</h3>
          <img
            src={resultUrl}
            alt="Generated GIF preview"
            className="max-w-full rounded-[4px] border border-[#E2E8F0] max-h-64 object-contain"
          />
          <div className="flex gap-3 flex-wrap">
            <a href={resultUrl} download="output.gif">
              <Button leftIcon={<Download size={16} />}>Download GIF</Button>
            </a>
            <Button variant="ghost" onClick={handleReset}>Convert another</Button>
          </div>
        </div>
      )}

      {/* Submit */}
      {(phase === 'idle' || phase === 'error') && (
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!file || !clipValid}
            leftIcon={<Film size={16} />}
          >
            Convert to GIF
          </Button>
        </div>
      )}
    </ToolPage>
  );
};

export default VideoToGIF;
