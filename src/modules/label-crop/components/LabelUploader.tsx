import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, X } from 'lucide-react';

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
};

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ file }: { file: File }) {
  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
  return isPdf
    ? <FileText size={14} className="text-[#64748B] shrink-0" />
    : <Image size={14} className="text-[#64748B] shrink-0" />;
}

// ---------------------------------------------------------------------------
// Single uploader
// ---------------------------------------------------------------------------

interface SingleUploaderProps {
  file: File | null;
  onFile: (f: File) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export const SingleUploader: React.FC<SingleUploaderProps> = ({
  file,
  onFile,
  onRemove,
  disabled = false,
}) => {
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) onFile(accepted[0]);
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: false,
    disabled,
  });

  return (
    <div className="flex flex-col gap-3">
      <div
        {...getRootProps()}
        className={[
          'border-2 border-dashed rounded-[8px] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all',
          isDragActive
            ? 'border-[#2563EB] bg-[#EFF6FF]'
            : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#2563EB] hover:bg-[#EFF6FF]',
          disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : '',
        ].join(' ')}
      >
        <input {...getInputProps()} />
        <Upload size={32} className={isDragActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'} />
        <div className="text-center">
          <p className="text-sm font-medium text-[#0F172A]">
            {isDragActive ? 'Drop your file here…' : (
              <>Drag a file here or{' '}
                <span className="text-[#2563EB] underline">click to browse</span>
              </>
            )}
          </p>
          <p className="text-xs text-[#64748B] mt-1">PDF, PNG, JPG, JPEG</p>
        </div>
      </div>

      {file && (
        <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] px-3 py-2">
          <FileIcon file={file} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#0F172A] truncate">{file.name}</p>
            <p className="text-xs text-[#64748B]">{formatBytes(file.size)}</p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={onRemove}
              className="text-[#94A3B8] hover:text-[#DC2626] transition-colors shrink-0"
              aria-label="Remove file"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Batch uploader
// ---------------------------------------------------------------------------

interface BatchUploaderProps {
  files: File[];
  onFiles: (files: File[]) => void;
  onRemove: (index: number) => void;
  onClear: () => void;
  disabled?: boolean;
}

export const BatchUploader: React.FC<BatchUploaderProps> = ({
  files,
  onFiles,
  onRemove,
  onClear,
  disabled = false,
}) => {
  const onDrop = useCallback((accepted: File[]) => {
    onFiles(accepted);
  }, [onFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: true,
    disabled,
  });

  return (
    <div className="flex flex-col gap-3">
      <div
        {...getRootProps()}
        className={[
          'border-2 border-dashed rounded-[8px] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all',
          isDragActive
            ? 'border-[#2563EB] bg-[#EFF6FF]'
            : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#2563EB] hover:bg-[#EFF6FF]',
          disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : '',
        ].join(' ')}
      >
        <input {...getInputProps()} />
        <Upload size={32} className={isDragActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'} />
        <div className="text-center">
          <p className="text-sm font-medium text-[#0F172A]">
            {isDragActive ? 'Drop files here…' : (
              <>Drop multiple files or{' '}
                <span className="text-[#2563EB] underline">click to browse</span>
              </>
            )}
          </p>
          <p className="text-xs text-[#64748B] mt-1">PDF, PNG, JPG — multiple files supported</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#64748B]">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </p>
            {!disabled && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs text-[#DC2626] hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="max-h-52 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {files.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="flex items-center gap-2 text-xs text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] px-3 py-2"
              >
                <FileIcon file={f} />
                <span className="flex-1 truncate">{f.name}</span>
                <span className="text-[#94A3B8] shrink-0">{formatBytes(f.size)}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => onRemove(i)}
                    className="text-[#94A3B8] hover:text-[#DC2626] shrink-0"
                    aria-label={`Remove ${f.name}`}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
