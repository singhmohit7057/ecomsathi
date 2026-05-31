import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Download, Trash2, FileImage, Archive } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ConvertedFile {
  originalName: string;
  originalSize: number;
  outputBlob: Blob;
  outputSize: number;
  outputUrl: string;
}

async function convertToPNG(file: File): Promise<ConvertedFile> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('Conversion failed')); return; }
        resolve({
          originalName: file.name,
          originalSize: file.size,
          outputBlob: blob,
          outputSize: blob.size,
          outputUrl: URL.createObjectURL(blob),
        });
      }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not load image')); };
    img.src = url;
  });
}

export const JPGtoPNG: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [converted, setConverted] = useState<ConvertedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': ['.jpg', '.jpeg'] },
    maxSize: MAX_SIZE_BYTES,
    multiple: true,
    onDrop: (accepted, rejected) => {
      if (rejected.length > 0) setError(`${rejected.length} file(s) were rejected. Only JPG/JPEG, max 20MB each.`);
      setFiles(prev => [...prev, ...accepted]);
      setConverted([]);
      setDone(false);
    },
  });

  const handleRemoveFile = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setConverted([]);
    setDone(false);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    setDone(false);
    converted.forEach(c => URL.revokeObjectURL(c.outputUrl));
    try {
      const results = await Promise.all(files.map(convertToPNG));
      setConverted(results);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Conversion failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadSingle = (c: ConvertedFile) => {
    const a = document.createElement('a');
    a.href = c.outputUrl;
    a.download = c.originalName.replace(/\.(jpg|jpeg)$/i, '') + '.png';
    a.click();
  };

  const handleDownloadAll = async () => {
    if (converted.length === 0) return;
    if (converted.length === 1) { handleDownloadSingle(converted[0]); return; }

    // Lazy-load JSZip from CDN is not available — use sequential downloads for multiple files
    // If JSZip were available we'd zip. For now download all sequentially.
    for (const c of converted) {
      handleDownloadSingle(c);
      await new Promise(r => setTimeout(r, 200));
    }
  };

  const handleReset = () => {
    converted.forEach(c => URL.revokeObjectURL(c.outputUrl));
    setFiles([]);
    setConverted([]);
    setDone(false);
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">JPG to PNG</h1>
        <p className="text-sm text-[#64748B] mt-1">Convert JPG/JPEG images to PNG format. Supports multiple files.</p>
      </div>

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
            Drag JPG files here or <span className="text-[#2563EB] underline">click to browse</span>
          </p>
          <p className="text-xs text-[#64748B] mt-1">JPG, JPEG · Multiple files supported · Max 20MB each</p>
        </div>
      </div>

      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {files.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0F172A]">{files.length} file{files.length > 1 ? 's' : ''} selected</p>
            <button type="button" onClick={handleReset} className="text-xs text-[#94A3B8] hover:text-[#DC2626] flex items-center gap-1">
              <Trash2 size={13} /> Clear all
            </button>
          </div>

          {/* File list */}
          <div className="flex flex-col gap-2">
            {files.map((f, i) => {
              const c = converted[i];
              return (
                <div key={`${f.name}-${i}`} className="flex items-center gap-3 border border-[#E2E8F0] rounded-[6px] px-3 py-2 bg-[#F8FAFC]">
                  <FileImage size={16} className="text-[#F97316] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0F172A] truncate">{f.name}</p>
                    <p className="text-xs text-[#64748B]">
                      {formatBytes(f.size)}
                      {c && <span className="text-[#16A34A] ml-2">→ {formatBytes(c.outputSize)} PNG</span>}
                    </p>
                  </div>
                  {c && (
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(c)}
                      className="text-[#2563EB] hover:text-[#1D4ED8] flex-shrink-0"
                      title="Download PNG"
                    >
                      <Download size={15} />
                    </button>
                  )}
                  {!done && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      className="text-[#94A3B8] hover:text-[#DC2626] flex-shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {!done && (
              <Button variant="primary" loading={processing} leftIcon={<FileImage size={15} />} onClick={handleConvert}>
                {processing ? 'Converting…' : `Convert ${files.length > 1 ? 'All to PNG' : 'to PNG'}`}
              </Button>
            )}
            {done && files.length > 1 && (
              <Button variant="primary" leftIcon={<Archive size={15} />} onClick={handleDownloadAll}>
                Download All PNG
              </Button>
            )}
            {done && <Button variant="ghost" onClick={handleReset}>Convert More Files</Button>}
          </div>
        </div>
      )}
    </div>
  );
};

export default JPGtoPNG;
