// ============================================================
// EcomSathi — Cookie Consent Banner
// ============================================================

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

const STORAGE_KEY = 'ecomsathi_cookies_accepted'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show only if the user hasn't previously accepted
    try {
      const accepted = localStorage.getItem(STORAGE_KEY)
      if (!accepted) setVisible(true)
    } catch {
      // localStorage unavailable (private mode, SSR) — show by default
      setVisible(true)
    }
  }, [])

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore
    }
    setVisible(false)
  }

  const handleDismiss = () => {
    // Dismiss without storing — will show again next visit
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-[#E2E8F0] bg-white px-4 py-3 shadow-md"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        {/* Message */}
        <p className="text-xs text-[#475569] leading-relaxed max-w-2xl">
          We use cookies for analytics to improve your experience. By using EcomSathi you
          accept our{' '}
          <Link
            to="/privacy"
            className="text-[#2563EB] underline underline-offset-2 hover:text-[#1D4ED8] transition-colors"
          >
            cookie policy
          </Link>
          .
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/privacy"
            className="text-xs text-[#64748B] underline underline-offset-2 hover:text-[#0F172A] transition-colors"
          >
            Learn More
          </Link>
          <button
            type="button"
            onClick={handleAccept}
            className="rounded-[4px] bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
          >
            Accept
          </button>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={handleDismiss}
            className="rounded-[4px] p-1 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#64748B] transition-colors focus:outline-none"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
