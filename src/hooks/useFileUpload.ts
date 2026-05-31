import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/supabase/client'

// ============================================================
// Types
// ============================================================

export interface UseFileUploadOptions {
  bucket: string
  accept?: string[]
  maxSizeMB?: number
  onSuccess?: (url: string, path: string) => void
  onError?: (error: string) => void
}

export interface UseFileUploadReturn {
  /** The currently selected File object */
  file: File | null
  /** Object URL for image previews (revoked automatically on reset) */
  preview: string | null
  /** True while the upload is in progress */
  uploading: boolean
  /** 0-100 upload progress (approximate — Supabase SDK gives binary progress) */
  progress: number
  /** Error message if the last operation failed */
  error: string | null
  /** Trigger the upload manually (e.g. from a button) */
  upload: (file?: File) => Promise<void>
  /** Clear state and revoke preview URL */
  reset: () => void
  /** react-dropzone props to spread onto a drop zone element */
  dropzoneProps: ReturnType<typeof useDropzone>
}

// ============================================================
// Hook
// ============================================================

export function useFileUpload(options: UseFileUploadOptions): UseFileUploadReturn {
  const { bucket, accept, maxSizeMB = 10, onSuccess, onError } = options

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // ----------------------------------------------------------
  // Validation helpers
  // ----------------------------------------------------------

  const validateFile = useCallback(
    (f: File): string | null => {
      if (accept && accept.length > 0) {
        const accepted = accept.some((mime) => {
          if (mime.endsWith('/*')) {
            return f.type.startsWith(mime.slice(0, -1))
          }
          return f.type === mime || f.name.toLowerCase().endsWith(mime.replace(/^\./, ''))
        })
        if (!accepted) return `File type not allowed. Accepted: ${accept.join(', ')}`
      }

      const sizeMB = f.size / (1024 * 1024)
      if (sizeMB > maxSizeMB) {
        return `File too large. Max size: ${maxSizeMB} MB (got ${sizeMB.toFixed(1)} MB)`
      }

      return null
    },
    [accept, maxSizeMB],
  )

  // ----------------------------------------------------------
  // Drop handler (from react-dropzone)
  // ----------------------------------------------------------

  const onDrop = useCallback(
    (accepted: File[]) => {
      const f = accepted[0]
      if (!f) return

      const validationError = validateFile(f)
      if (validationError) {
        setError(validationError)
        onError?.(validationError)
        return
      }

      setError(null)
      setFile(f)
      setProgress(0)

      // Revoke previous preview to avoid memory leaks
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return f.type.startsWith('image/') ? URL.createObjectURL(f) : null
      })
    },
    [validateFile, onError],
  )

  const dropzoneProps = useDropzone({
    onDrop,
    accept: accept
      ? accept.reduce<Record<string, string[]>>((acc, mime) => {
          acc[mime] = []
          return acc
        }, {})
      : undefined,
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false,
  })

  // ----------------------------------------------------------
  // Upload
  // ----------------------------------------------------------

  const upload = useCallback(
    async (overrideFile?: File) => {
      const target = overrideFile ?? file
      if (!target) {
        const msg = 'No file selected'
        setError(msg)
        onError?.(msg)
        return
      }

      const validationError = validateFile(target)
      if (validationError) {
        setError(validationError)
        onError?.(validationError)
        return
      }

      setUploading(true)
      setError(null)
      setProgress(10) // Show immediate feedback

      try {
        const ext = target.name.split('.').pop() ?? 'bin'
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        setProgress(30)

        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, target, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) throw new Error(uploadError.message)

        setProgress(90)

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

        setProgress(100)
        onSuccess?.(urlData.publicUrl, data.path)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setError(msg)
        onError?.(msg)
      } finally {
        setUploading(false)
      }
    },
    [file, bucket, validateFile, onSuccess, onError],
  )

  // ----------------------------------------------------------
  // Reset
  // ----------------------------------------------------------

  const reset = useCallback(() => {
    setFile(null)
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setUploading(false)
    setProgress(0)
    setError(null)
  }, [])

  return {
    file,
    preview,
    uploading,
    progress,
    error,
    upload,
    reset,
    dropzoneProps,
  }
}
