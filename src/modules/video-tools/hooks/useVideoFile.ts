import { useState, useCallback, useRef } from 'react'
import type { VideoFile } from '../types'
import { probeVideoFile, ACCEPTED_VIDEO_TYPES, MAX_VIDEO_SIZE_BYTES } from '../utils/videoUtils'

interface UseVideoFileReturn {
  videoFile: VideoFile | null
  error: string | null
  isLoading: boolean
  onDrop: (accepted: File[], rejected: { file: File; errors: { message: string }[] }[]) => void
  reset: () => void
  dropzoneProps: {
    accept: Record<string, string[]>
    maxSize: number
    multiple: false
  }
}

export function useVideoFile(): UseVideoFileReturn {
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const prevUrlRef = useRef<string | null>(null)

  const onDrop = useCallback(
    async (
      accepted: File[],
      rejected: { file: File; errors: { message: string }[] }[],
    ) => {
      if (rejected.length > 0) {
        const msg = rejected[0]?.errors?.[0]?.message ?? 'Invalid file'
        setError(msg.includes('size') ? 'File too large. Maximum size is 500 MB.' : msg)
        return
      }
      const file = accepted[0]
      if (!file) return

      setError(null)
      setIsLoading(true)

      // Revoke previous URL
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current)
        prevUrlRef.current = null
      }

      try {
        const vf = await probeVideoFile(file)
        prevUrlRef.current = vf.url
        setVideoFile(vf)
      } catch {
        setError('Failed to read video file. Please try a different file.')
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const reset = useCallback(() => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current)
      prevUrlRef.current = null
    }
    setVideoFile(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    videoFile,
    error,
    isLoading,
    onDrop,
    reset,
    dropzoneProps: {
      accept: ACCEPTED_VIDEO_TYPES,
      maxSize: MAX_VIDEO_SIZE_BYTES,
      multiple: false,
    },
  }
}
