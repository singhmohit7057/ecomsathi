// ============================================================
// EcomSathi — Analytics integration
// Google Analytics 4 + Microsoft Clarity
// ============================================================

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Augment the global window object for gtag / Clarity
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
    clarity: (method: string, ...args: unknown[]) => void
  }
}

// ─── Config ──────────────────────────────────────────────────────────────────

const GA_ID      = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined
const CLARITY_ID = import.meta.env.VITE_CLARITY_ID        as string | undefined

// ─── Google Analytics 4 ──────────────────────────────────────────────────────

export function initGA(): void {
  if (!GA_ID) return

  // Inject the gtag.js script
  const script = document.createElement('script')
  script.src   = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  script.async = true
  document.head.appendChild(script)

  // Bootstrap the dataLayer queue
  window.dataLayer = window.dataLayer || []
  window.gtag = function (...args: unknown[]) {
    window.dataLayer.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { anonymize_ip: true })
}

// ─── Microsoft Clarity ───────────────────────────────────────────────────────

export function initClarity(): void {
  if (!CLARITY_ID) return

  // Standard Clarity inline loader
  ;(function (c: Window, l: Document, a: string, r: string, i: string) {
    type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] }
    const cAny = c as Window & { [key: string]: unknown }
    cAny[a] = cAny[a] || function (...args: unknown[]) {
      ;((cAny[a] as ClarityFn).q = (cAny[a] as ClarityFn).q || []).push(args)
    }
    const t = l.createElement(r) as HTMLScriptElement
    t.async = true
    t.src   = 'https://www.clarity.ms/tag/' + i
    const y = l.getElementsByTagName(r)[0]
    y?.parentNode?.insertBefore(t, y)
  })(window, document, 'clarity', 'script', CLARITY_ID)
}

// ─── Page-view tracking ──────────────────────────────────────────────────────

export function trackPageView(path: string): void {
  if (!GA_ID || typeof window.gtag !== 'function') return
  window.gtag('config', GA_ID, { page_path: path, anonymize_ip: true })
}

// ─── Custom event tracking ───────────────────────────────────────────────────

export function trackToolUse(toolName: string, category: string): void {
  if (typeof window.gtag !== 'function') return
  window.gtag('event', 'tool_use', {
    event_category: category,
    event_label:    toolName,
  })
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params ?? {})
}

// ─── Analytics component ─────────────────────────────────────────────────────

/**
 * Drop <Analytics /> inside your router tree (where useLocation works).
 * It initialises GA4 and Clarity on first mount, then fires a page-view
 * event on every route change.
 */
export default function Analytics() {
  const location = useLocation()

  // Initialise once on mount
  useEffect(() => {
    initGA()
    initClarity()
  }, [])

  // Track every navigation
  useEffect(() => {
    trackPageView(location.pathname + location.search)
  }, [location])

  // This component renders nothing — pure side-effects
  return null
}
