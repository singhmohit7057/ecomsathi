import { useState, useCallback } from 'react'
import type { ImageFile } from '../types'
import { isImage, formatBytes, getImageDimensions } from '../utils/imageUtils'

interface UseImageFileReturn {
  imageFile: ImageFile | null
  error: string | null
  isLoading: boolean
  onDrop: (accepted: File[], rejected: { file: File; errors: { message: string }[] }[]) => void
  reset: () => void
}

export function useImageFile(maxSizeMB = 20): UseImageFileReturn {
  const [imageFile, setImageFile] = useState<ImageFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const onDrop = useCallback(
    async (accepted: File[], rejected: { file: File; errors: { message: string }[] }[]) => {
      setError(null)

      if (rejected.length > 0) {
        setError(rejected[0]?.errors[0]?.message ?? 'Invalid file.')
        return
      }

      const file = accepted[0]
      if (!file) return

      if (!isImage(file)) {
        setError('Please upload an image file (JPG, PNG, or WEBP).')
        return
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File size must be under ${maxSizeMB}MB. Your file is ${formatBytes(file.size)}.`)
        return
      }

      setIsLoading(true)
      try {
        const url = URL.createObjectURL(file)
        const { width, height } = await getImageDimensions(file)
        setImageFile({ file, name: file.name, size: file.size, width, height, url })
      } catch {
        setError('Could not read the image file.')
      } finally {
        setIsLoading(false)
      }
    },
    [maxSizeMB],
  )

  const reset = useCallback(() => {
    setImageFile((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url)
      return null
    })
    setError(null)
    setIsLoading(false)
  }, [])

  return { imageFile, error, isLoading, onDrop, reset }
}
