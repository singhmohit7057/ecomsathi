import { useState, useCallback, useMemo } from 'react'
import Fuse from 'fuse.js'

interface SearchItem {
  code: string
  description: string
  [key: string]: unknown
}

interface UseGSTSearchReturn<T> {
  query: string
  results: T[]
  setQuery: (q: string) => void
  reset: () => void
}

/**
 * Generic fuzzy-search hook for HSN/SAC code lists.
 * Uses Fuse.js for tolerant matching on code + description.
 */
export function useGSTSearch<T extends SearchItem>(
  data: T[],
  keys: string[] = ['code', 'description'],
  threshold = 0.3,
): UseGSTSearchReturn<T> {
  const [query, setQuery] = useState('')

  const fuse = useMemo(
    () => new Fuse(data, { keys, threshold, includeScore: true }),
    [data, keys, threshold],
  )

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return []
    return fuse.search(q).map((r) => r.item)
  }, [fuse, query])

  const reset = useCallback(() => setQuery(''), [])

  return { query, results, setQuery, reset }
}
