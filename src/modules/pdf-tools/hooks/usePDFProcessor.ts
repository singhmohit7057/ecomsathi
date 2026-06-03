import { useState, useCallback } from 'react'
import type { ProcessingStatus, ProcessingResult } from '../types'

interface UsePDFProcessorReturn<T> {
  status: ProcessingStatus
  error: string | null
  result: T | null
  run: (task: () => Promise<T>) => Promise<void>
  reset: () => void
}

export function usePDFProcessor<T = ProcessingResult>(): UsePDFProcessorReturn<T> {
  const [status, setStatus] = useState<ProcessingStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<T | null>(null)

  const run = useCallback(async (task: () => Promise<T>) => {
    setStatus('processing')
    setError(null)
    setResult(null)
    try {
      const res = await task()
      setResult(res)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed. Please try again.')
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setResult(null)
  }, [])

  return { status, error, result, run, reset }
}
