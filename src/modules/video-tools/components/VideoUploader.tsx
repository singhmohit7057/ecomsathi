import React from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, Video, Trash2 } from 'lucide-react'
import type { VideoFile } from '../types'
import { ACCEPTED_VIDEO_TYPES, MAX_VIDEO_SIZE_BYTES } from '../utils/videoUtils'
import { formatBytes } from '../utils/formatBytes'

interface VideoUploaderProps {
  videoFile: VideoFile | null
  isLoading?: boolean
  error?: string | null
  onDrop: (accepted: File[], rejected: { file: File; errors: { message: string }[] }[]) => void
  onReset: () => void
  /** Optional hint shown beneath the drop area */
  hint?: string
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  videoFile,
  isLoading = false,
  error,
  onDrop,
  onReset,
  hint = 'MP4, MOV, AVI, WEBM, MKV · Max 500 MB',
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted, rejected) => onDrop(accepted, rejected as { file: File; errors: { message: string }[] }[]),
    accept: ACCEPTED_VIDEO_TYPES,
    maxSize: MAX_VIDEO_SIZE_BYTES,
    multiple: false,
  })

  if (videoFile) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-[6px] bg-[#EFF6FF] flex items-center justify-center shrink-0">
          <Video size={20} className="text-[#2563EB]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#0F172A] truncate">{videoFile.name}</p>
          <p className="text-xs text-[#64748B] mt-0.5">
            {formatBytes(videoFile.size)}
            {videoFile.width && videoFile.height
              ? ` · ${videoFile.width}×${videoFile.height}`
              : ''}
            {videoFile.duration && videoFile.duration > 0
              ? ` · ${Math.round(videoFile.duration)}s`
              : ''}
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
            <UploadCloud
              size={40}
              className={isDragActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'}
            />
            <div className="text-center">
              <p className="text-sm font-medium text-[#0F172A]">
                {isDragActive
                  ? 'Drop your video here'
                  : <>Drag video here or <span className="text-[#2563EB] underline">click to browse</span></>}
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

export default VideoUploader
