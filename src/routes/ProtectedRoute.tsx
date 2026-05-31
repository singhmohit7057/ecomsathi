import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

// ============================================================
// Full-page loading spinner shown while session is resolving
// ============================================================

function PageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
    </div>
  )
}

// ============================================================
// ProtectedRoute
// Renders children (Outlet) when authenticated.
// Redirects to /login?redirect=<current-path> otherwise.
// ============================================================

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageSpinner />

  if (!user) {
    const redirectTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirectTo}`} replace />
  }

  return <Outlet />
}
