import { useState, useCallback } from 'react'

const MAX_HISTORY = 50

/**
 * Keeps a rolling history of generated SKUs for the current session.
 * Useful for duplicate detection and the recent-SKUs list in the sidebar.
 */
export function useSKUHistory() {
  const [history, setHistory] = useState<string[]>([])

  const add = useCallback((sku: string) => {
    setHistory((prev) => {
      const next = [sku, ...prev.filter((s) => s !== sku)]
      return next.slice(0, MAX_HISTORY)
    })
  }, [])

  const addMany = useCallback((skus: string[]) => {
    setHistory((prev) => {
      const combined = [...skus, ...prev.filter((s) => !skus.includes(s))]
      return combined.slice(0, MAX_HISTORY)
    })
  }, [])

  const clear = useCallback(() => setHistory([]), [])

  const isDuplicate = useCallback(
    (sku: string) => history.some((s) => s.toUpperCase() === sku.toUpperCase()),
    [history],
  )

  return { history, add, addMany, clear, isDuplicate }
}
