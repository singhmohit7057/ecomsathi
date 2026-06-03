import { useState, useCallback, useRef } from 'react'
import type { ProcessingStatus } from '../types'
import type { FFmpegProgressEvent } from '../services/ffmpegService'

interface UseFFmpegReturn<TResult> {
  status: ProcessingStatus
  progress: number   // 0–100
  error: string | null
  result: TResult | null
  run: (task: (onProgress: (p: FFmpegProgressEvent) => void) => Promise<TResult>) => Promise<void>
  reset: () => void
}

export function useFFmpeg<TResult>(): UseFFmpegReturn<TResult> {
  const [status, setStatus] = useState<ProcessingStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TResult | null>(null)
  const abortRef = useRef(false)

  const run = useCallback(
    async (task: (onProgress: (p: FFmpegProgressEvent) => void) => Promise<TResult>) => {
      abortRef.current = false
      setStatus('loading')
      setProgress(0)
      setError(null)
      setResult(null)

      const onProgress = (p: FFmpegProgressEvent) => {
        if (abortRef.current) return
        setStatus('processing')
        setProgress(Math.round(p.progress * 100))
      }

      try {
        const res = await task(onProgress)
        if (!abortRef.current) {
          setResult(res)
          setStatus('done')
          setProgress(100)
        }
      } catch (err: unknown) {
        if (!abortRef.current) {
          const msg =
            err instanceof Error
              ? err.message
              : 'Processing failed. Please try again.'
          setError(msg)
          setStatus('error')
        }
      }
    },
    [],
  )

  const reset = useCallback(() => {
    abortRef.current = true
    setStatus('idle')
    setProgress(0)
    setError(null)
    setResult(null)
  }, [])

  return { status, progress, error, result, run, reset }
}
