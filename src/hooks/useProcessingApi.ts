import { useState, useCallback, useRef } from 'react'

// ============================================================
// Types
// ============================================================

export interface ProcessingOptions {
  endpoint: string
  onProgress?: (percent: number) => void
}

export interface ProcessingResult {
  /** Direct download URL if the API returns one */
  url?: string
  /** Arbitrary JSON payload the API may return */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
}

export interface UseProcessingApiReturn {
  /** True while the XHR request is in flight */
  processing: boolean
  /** 0-100 upload progress */
  progress: number
  /** Parsed result from the backend */
  result: ProcessingResult | null
  /** Error message if the last call failed */
  error: string | null
  /** Submit files (and optional extra fields) to the endpoint */
  submit: (files: File | File[], extra?: Record<string, string>) => Promise<void>
  /** Clear all state */
  reset: () => void
  /** Abort an in-flight request */
  abort: () => void
}

// ============================================================
// Hook
// ============================================================

export function useProcessingApi(options: ProcessingOptions): UseProcessingApiReturn {
  const { endpoint, onProgress } = options

  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Hold a ref to the active XHR so we can abort it
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  // ----------------------------------------------------------
  // submit
  // ----------------------------------------------------------

  const submit = useCallback(
    async (files: File | File[], extra: Record<string, string> = {}) => {
      const BASE_URL = import.meta.env.VITE_PROCESSING_API_URL as string | undefined
      if (!BASE_URL) {
        setError('Processing API URL is not configured (VITE_PROCESSING_API_URL)')
        return
      }

      // Abort any running request
      xhrRef.current?.abort()

      setProcessing(true)
      setProgress(0)
      setResult(null)
      setError(null)

      const formData = new FormData()

      // Append file(s)
      const fileArray = Array.isArray(files) ? files : [files]
      fileArray.forEach((f, idx) => {
        // Use 'file' for single, 'files[]' for multiple
        const key = fileArray.length === 1 ? 'file' : 'files[]'
        formData.append(key, f, f.name)
        // Also append individual named keys for convenience
        formData.append(`file_${idx}`, f, f.name)
      })

      // Append extra fields
      Object.entries(extra).forEach(([key, value]) => {
        formData.append(key, value)
      })

      const url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`

      await new Promise<void>((resolve) => {
        const xhr = new XMLHttpRequest()
        xhrRef.current = xhr

        // Upload progress
        xhr.upload.addEventListener('progress', (ev) => {
          if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 100)
            setProgress(pct)
            onProgress?.(pct)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const parsed = JSON.parse(xhr.responseText) as ProcessingResult
              setResult(parsed)
              setProgress(100)
              onProgress?.(100)
            } catch {
              // Non-JSON response — treat raw text as a URL
              setResult({ url: xhr.responseText.trim() })
              setProgress(100)
            }
          } else {
            let message = `Server error ${xhr.status}`
            try {
              const parsed = JSON.parse(xhr.responseText) as { error?: string; message?: string }
              message = parsed.error ?? parsed.message ?? message
            } catch {
              // keep default message
            }
            setError(message)
          }
          setProcessing(false)
          xhrRef.current = null
          resolve()
        })

        xhr.addEventListener('error', () => {
          setError('Network error — could not reach the processing server')
          setProcessing(false)
          xhrRef.current = null
          resolve()
        })

        xhr.addEventListener('abort', () => {
          setError('Request was cancelled')
          setProcessing(false)
          xhrRef.current = null
          resolve()
        })

        xhr.open('POST', url)
        // Let the browser set Content-Type with boundary for FormData
        xhr.send(formData)
      })
    },
    [endpoint, onProgress],
  )

  // ----------------------------------------------------------
  // abort
  // ----------------------------------------------------------

  const abort = useCallback(() => {
    xhrRef.current?.abort()
  }, [])

  // ----------------------------------------------------------
  // reset
  // ----------------------------------------------------------

  const reset = useCallback(() => {
    xhrRef.current?.abort()
    setProcessing(false)
    setProgress(0)
    setResult(null)
    setError(null)
  }, [])

  return {
    processing,
    progress,
    result,
    error,
    submit,
    reset,
    abort,
  }
}
