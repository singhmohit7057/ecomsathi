import { Outlet } from 'react-router-dom'
import { Suspense, lazy } from 'react'

// Navbar and Footer are shared components — lazily loaded to keep the
// initial bundle tight while still code-splitting the heavy pages.
const Navbar = lazy(() => import('@/components/common/Navbar'))
const Footer = lazy(() => import('@/components/common/Footer'))

// ============================================================
// PublicLayout
// Sticky Navbar → full-width content area → Footer
// ============================================================

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[var(--color-text)]">
      {/* Sticky top navigation */}
      <Suspense fallback={<div className="h-16 bg-white shadow-sm" />}>
        <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
          <Navbar />
        </header>
      </Suspense>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  )
}
