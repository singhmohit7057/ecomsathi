import { useState, useCallback } from 'react'
import type { PDFFile } from '../types'
import { isPDF, formatBytes } from '../utils/pdfUtils'

interface UsePDFFileReturn {
  pdfFile: PDFFile | null
  error: string | null
  isLoading: boolean
  onDrop: (accepted: File[], rejected: { file: File; errors: { message: string }[] }[]) => void
  reset: () => void
}

export function usePDFFile(maxSizeMB = 50): UsePDFFileReturn {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const onDrop = useCallback(
    (accepted: File[], rejected: { file: File; errors: { message: string }[] }[]) => {
      setError(null)

      if (rejected.length > 0) {
        const msg = rejected[0]?.errors[0]?.message
        setError(msg ?? 'Invalid file.')
        return
      }

      const file = accepted[0]
      if (!file) return

      if (!isPDF(file)) {
        setError('Please upload a PDF file.')
        return
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File size must be under ${maxSizeMB}MB. Your file is ${formatBytes(file.size)}.`)
        return
      }

      setIsLoading(true)
      setPdfFile({ file, name: file.name, size: file.size })
      setIsLoading(false)
    },
    [maxSizeMB],
  )

  const reset = useCallback(() => {
    setPdfFile(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return { pdfFile, error, isLoading, onDrop, reset }
}
