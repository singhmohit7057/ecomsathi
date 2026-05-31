import React, { useState, useRef } from 'react';
import { RefreshCw, Download, Loader2 } from 'lucide-react';
import { ToolPage } from '../pdf-tools/shared/ToolPage';
import { FileUploader } from '../../components/common/FileUploader';
import { Button } from '../../components/common/Button';

const API = import.meta.env.VITE_PROCESSING_API_URL as string;

type OutputFormat = 'mp4_h264' | 'mp4_h265' | 'webm_vp9' | 'mov' | 'avi';
type Quality = 'low' | 'medium' | 'high';

interface FormatOption {
  label: string;
  ext: string;
  codec: string;
  description: string;
}

const OUTPUT_FORMATS: Record<OutputFormat, FormatOption> = {
  mp4_h264: { label: 'MP4 (H.264)', ext: 'mp4', codec: 'libx264', description: 'Best compatibility — works everywhere' },
  mp4_h265: { label: 'MP4 (H.265)', ext: 'mp4', codec: 'libx265', description: 'Smaller file, modern devices only' },
  webm_vp9: { label: 'WebM (VP9)', ext: 'webm', codec: 'libvpx-vp9', description: 'Open format, great for web' },
  mov: { label: 'MOV', ext: 'mov', codec: 'copy', description: 'Apple format, good for macOS/iOS' },
  avi: { label: 'AVI', ext: 'avi', codec: 'mpeg4', description: 'Legacy format, wide support' },
};

const QUALITY_CRF: Record<Quality, number> = { low: 28, medium: 23, high: 18 };

interface JobResult {
  status: 'pending' | 'processing' | 'done' | 'error';
  resultUrl?: string;
  error?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const VideoConverter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('mp4_h264');
  const [quality, setQuality] = useState<Quality>('medium');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pollJob = (jobId: string) => {
    let elapsed = 0;
    const poll = async () => {
      try {
        const res = await fetch(`${API}/api/jobs/${jobId}`);
        const data: JobResult = await res.json();
        elapsed += 2;
        setProcessingProgress(Math.min(90, Math.round((elapsed / 75) * 100)));
        if (data.status === 'done' && data.resultUrl) {
          setResultUrl(data.resultUrl);
          setPhase('done');
          setProcessingProgress(100);
        } else if (data.status === 'error') {
          setErrorMsg(data.error ?? 'Conversion failed');
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
      const fmt = OUTPUT_FORMATS[outputFormat];
      const formData = new FormData();
      formData.append('video', file);
      formData.append('outputFormat', outputFormat);
      formData.append('codec', fmt.codec);
      formData.append('ext', fmt.ext);
      formData.append('quality', quality);
      formData.append('crf', String(QUALITY_CRF[quality]));

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API}/api/video/convert`);
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

  const fmt = OUTPUT_FORMATS[outputFormat];

  return (
    <ToolPage
      icon={<RefreshCw size={24} />}
      title="Video Converter"
      description="Convert video files to different formats including MP4, WebM, MOV, and AVI."
      category="Video Tools"
    >
      {/* Upload */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-5">
        <h2 className="text-base font-semibold text-[#0F172A]">1. Upload Video</h2>
        <FileUploader
          accept={{ 'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv', '.wmv', '.m4v'] }}
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

      {/* Output Format */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-5">
        <h2 className="text-base font-semibold text-[#0F172A]">2. Output Format</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.entries(OUTPUT_FORMATS) as [OutputFormat, FormatOption][]).map(([key, info]) => (
            <button
              key={key}
              type="button"
              onClick={() => setOutputFormat(key)}
              className={[
                'flex flex-col gap-0.5 rounded-[8px] border p-3 text-left transition-all',
                outputFormat === key
                  ? 'border-[#2563EB] bg-[#EFF6FF]'
                  : 'border-[#E2E8F0] bg-white hover:border-[#93C5FD]',
              ].join(' ')}
            >
              <span className={`text-sm font-semibold ${outputFormat === key ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>
                {info.label}
              </span>
              <span className="text-xs text-[#64748B]">{info.description}</span>
            </button>
          ))}
        </div>

        {/* Quality */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#0F172A]">Quality</label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as Quality[]).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuality(q)}
                className={[
                  'px-4 py-2 rounded-[4px] text-sm font-medium border capitalize transition-colors',
                  quality === q
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB]',
                ].join(' ')}
              >
                {q}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#64748B]">
            CRF {QUALITY_CRF[quality]} &middot; {quality === 'low' ? 'smallest file, lower quality' : quality === 'medium' ? 'balanced (recommended)' : 'largest file, best quality'}
          </p>
        </div>
      </div>

      {/* Progress */}
      {(phase === 'uploading' || phase === 'processing') && (
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0F172A]">
            <Loader2 size={16} className="animate-spin text-[#2563EB]" />
            {phase === 'uploading' ? 'Uploading video…' : `Converting to ${fmt.label}…`}
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
          <h3 className="text-sm font-semibold text-[#166534]">Conversion complete!</h3>
          <p className="text-xs text-[#475569]">
            Your video has been converted to {fmt.label}.
          </p>
          <div className="flex gap-3">
            <a href={resultUrl} download={`converted.${fmt.ext}`}>
              <Button leftIcon={<Download size={16} />}>Download {fmt.label}</Button>
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
            disabled={!file}
            leftIcon={<RefreshCw size={16} />}
          >
            Convert Video
          </Button>
        </div>
      )}
    </ToolPage>
  );
};

export default VideoConverter;
