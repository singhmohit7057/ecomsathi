import React from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileText, Trash2 } from 'lucide-react'
import type { PDFFile } from '../types'
import { ACCEPTED_PDF } from '../utils/pdfUtils'
import { formatBytes } from '../utils/pdfUtils'

interface PDFUploaderProps {
  pdfFile: PDFFile | null
  isLoading?: boolean
  error?: string | null
  onDrop: (accepted: File[], rejected: { file: File; errors: { message: string }[] }[]) => void
  onReset: () => void
  hint?: string
  maxSizeMB?: number
  accept?: Record<string, string[]>
  multiple?: boolean
  label?: string
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({
  pdfFile,
  isLoading = false,
  error,
  onDrop,
  onReset,
  hint = 'PDF · Max 50 MB',
  maxSizeMB = 50,
  accept = ACCEPTED_PDF,
  multiple = false,
  label,
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted, rejected) =>
      onDrop(accepted, rejected as { file: File; errors: { message: string }[] }[]),
    accept,
    maxSize: maxSizeMB * 1024 * 1024,
    multiple,
  })

  if (pdfFile) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-[6px] bg-[#EFF6FF] flex items-center justify-center shrink-0">
          <FileText size={20} className="text-[#2563EB]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#0F172A] truncate">{pdfFile.name}</p>
          <p className="text-xs text-[#64748B] mt-0.5">
            {formatBytes(pdfFile.size)}
            {pdfFile.pageCount != null && ` · ${pdfFile.pageCount} page${pdfFile.pageCount !== 1 ? 's' : ''}`}
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="text-[#94A3B8] hover:text-[#DC2626] transition-colors p-1"
          aria-label="Remove file"
        >
          <Trash2 size={15} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <p className="text-sm font-medium text-[#0F172A]">{label}</p>
      )}
      <div
        {...getRootProps()}
        className={[
          'border-2 border-dashed rounded-[8px] p-10 flex flex-col items-center gap-3 cursor-pointer transition-all select-none',
          isDragActive
            ? 'border-[#2563EB] bg-[#EFF6FF]'
            : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#2563EB] hover:bg-[#EFF6FF]',
        ].join(' ')}
      >
        <input {...getInputProps()} />

        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin" />
            <p className="text-sm text-[#64748B]">Reading file…</p>
          </div>
        ) : (
          <>
            <UploadCloud size={40} className={isDragActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'} />
            <div className="text-center">
              <p className="text-sm font-medium text-[#0F172A]">
                {isDragActive
                  ? 'Drop your file here'
                  : <><span>Drag file here or </span><span className="text-[#2563EB] underline">click to browse</span></>
                }
              </p>
              <p className="text-xs text-[#64748B] mt-1">{hint}</p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-[#DC2626] flex items-center gap-1.5 px-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

export default PDFUploader
