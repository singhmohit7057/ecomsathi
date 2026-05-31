import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X, Image as ImageIcon } from 'lucide-react';

interface FileUploaderProps {
  accept?: Record<string, string[]>;
  maxSizeMB?: number;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  uploading?: boolean;
  progress?: number;
  preview?: boolean;
  label?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  maxSizeMB = 10,
  multiple = false,
  onFiles,
  uploading = false,
  progress,
  preview = false,
  label,
}) => {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<string[]>([]);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: { file: File; errors: { code: string; message: string }[] }[]) => {
      const newErrors: string[] = [];

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors: fileErrors }) => {
          fileErrors.forEach((err) => {
            if (err.code === 'file-too-large') {
              newErrors.push(`"${file.name}" exceeds ${maxSizeMB}MB limit.`);
            } else if (err.code === 'file-invalid-type') {
              newErrors.push(`"${file.name}" is not an accepted file type.`);
            } else {
              newErrors.push(`"${file.name}": ${err.message}`);
            }
          });
        });
      }

      setErrors(newErrors);

      if (acceptedFiles.length > 0) {
        setSelectedFiles(acceptedFiles);
        onFiles(acceptedFiles);

        if (preview) {
          const newPreviews: string[] = [];
          acceptedFiles.forEach((file) => {
            if (file.type.startsWith('image/')) {
              const url = URL.createObjectURL(file);
              newPreviews.push(url);
            }
          });
          // Revoke old previews
          previews.forEach((url) => URL.revokeObjectURL(url));
          setPreviews(newPreviews);
        }
      }
    },
    [maxSizeMB, onFiles, preview, previews]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxSize: maxSizeBytes,
    disabled: uploading,
  });

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    if (preview && previews[index]) {
      URL.revokeObjectURL(previews[index]);
      setPreviews(previews.filter((_, i) => i !== index));
    }
    setSelectedFiles(newFiles);
    onFiles(newFiles);
  };

  const borderColor = isDragActive
    ? 'border-[#2563EB]'
    : errors.length > 0
    ? 'border-[#DC2626]'
    : 'border-[#CBD5E1]';

  const bgColor = isDragActive ? 'bg-[#EFF6FF]' : 'bg-[#F8FAFC]';

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <label className="text-sm font-medium text-[#0F172A]">{label}</label>
      )}

      <div
        {...getRootProps()}
        className={[
          'border-2 border-dashed rounded-[8px] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-150',
          borderColor,
          bgColor,
          uploading ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#2563EB] hover:bg-[#EFF6FF]',
        ].join(' ')}
      >
        <input {...getInputProps()} />

        <UploadCloud
          size={36}
          className={isDragActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'}
        />

        {isDragActive ? (
          <p className="text-sm font-medium text-[#2563EB]">Drop files here…</p>
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium text-[#0F172A]">
              Drag files here or{' '}
              <span className="text-[#2563EB] underline">click to browse</span>
            </p>
            <p className="text-xs text-[#64748B] mt-1">
              Max size: {maxSizeMB}MB
              {accept
                ? ` · Accepted: ${Object.values(accept)
                    .flat()
                    .join(', ')}`
                : ''}
            </p>
          </div>
        )}
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="flex flex-col gap-1">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-[#DC2626]" role="alert">
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Upload progress */}
      {uploading && progress !== undefined && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Uploading…</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-[#E2E8F0] rounded-full h-1.5">
            <div
              className="bg-[#2563EB] h-1.5 rounded-full transition-all duration-200"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {/* Selected files */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          {selectedFiles.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-[4px] px-3 py-2"
            >
              {preview && file.type.startsWith('image/') && previews[i] ? (
                <img
                  src={previews[i]}
                  alt={file.name}
                  className="w-10 h-10 object-cover rounded-[4px] flex-shrink-0"
                />
              ) : file.type.startsWith('image/') ? (
                <ImageIcon size={16} className="text-[#2563EB] flex-shrink-0" />
              ) : (
                <FileText size={16} className="text-[#64748B] flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#0F172A] truncate">{file.name}</p>
                <p className="text-xs text-[#64748B]">{formatBytes(file.size)}</p>
              </div>
              {!uploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="text-[#94A3B8] hover:text-[#DC2626] transition-colors flex-shrink-0"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
