import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/supabase/client'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'

// ─── Error alert ──────────────────────────────────────────────────────────────

function ErrorAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
    >
      <AlertCircle size={15} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

// ─── Brand panel ──────────────────────────────────────────────────────────────

function BrandPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-[52%] flex-col justify-between overflow-hidden bg-[#1E40AF] px-12 py-14 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-0 h-[320px] w-[320px] rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5" />
      </div>

      {/* Logo */}
      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect x="4" y="6" width="20" height="16" rx="2" stroke="white" strokeWidth="2" />
            <path d="M4 11h20" stroke="white" strokeWidth="2" />
            <path d="M9 6V4M19 6V4" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="9" cy="16" r="1.5" fill="white" />
            <path d="M13 16h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M13 19h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight">EcomSathi</span>
      </div>

      {/* Content */}
      <div className="relative">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
          <ShieldCheck size={26} />
        </div>
        <h2 className="text-4xl font-bold leading-tight">
          Set a new<br />password.
        </h2>
        <p className="mt-4 text-base text-blue-200 leading-relaxed">
          Choose a strong password to keep your account secure.
          You&apos;ll be signed in with the new password immediately.
        </p>

        <ul className="mt-8 flex flex-col gap-3">
          {[
            'At least 8 characters long',
            'Mix of uppercase, lowercase & numbers',
            'A special character makes it stronger',
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-3 text-sm text-blue-100">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative rounded-xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
        <p className="text-sm text-blue-100 leading-relaxed">
          Remember your old password?{' '}
          <Link to="/login" className="font-semibold text-white hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}

// ─── Token states ─────────────────────────────────────────────────────────────
type TokenState = 'checking' | 'valid' | 'expired' | 'missing'

// ─── ResetPasswordPage ────────────────────────────────────────────────────────
export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [tokenState, setTokenState] = useState<TokenState>('checking')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const errorCode = searchParams.get('error_code') || searchParams.get('error')
    if (errorCode) { setTokenState('expired'); return }

    const hasToken =
      searchParams.get('access_token') ||
      searchParams.get('code') ||
      window.location.hash.includes('access_token')

    if (!hasToken) { setTokenState('missing'); return }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setTokenState('valid')
      else if (event === 'SIGNED_OUT') setTokenState('expired')
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setTokenState('valid')
      } else if (tokenState === 'checking') {
        const timer = setTimeout(() => {
          setTokenState((prev) => (prev === 'checking' ? 'expired' : prev))
        }, 3000)
        return () => clearTimeout(timer)
      }
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) { setError('Password must be at least 8 characters long.'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

      if (updateError) {
        if (
          updateError.message.toLowerCase().includes('expired') ||
          updateError.message.toLowerCase().includes('invalid')
        ) {
          setTokenState('expired')
          return
        }
        throw new Error(updateError.message)
      }

      await supabase.auth.signOut()
      toast.success('Password updated successfully')
      navigate('/login', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ─── Checking / loading ─────────────────────────────────────────────────────
  if (tokenState === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 text-[#64748B]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E2E8F0] border-t-[#2563EB]" />
          <p className="text-sm">Verifying reset link&hellip;</p>
        </div>
      </div>
    )
  }

  // ─── Expired / missing ──────────────────────────────────────────────────────
  if (tokenState === 'expired' || tokenState === 'missing') {
    return (
      <div className="flex min-h-screen bg-white">
        <BrandPanel />
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          {/* Mobile logo */}
          <div className="mb-10 flex w-full max-w-[400px] items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB]">
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect x="4" y="6" width="20" height="16" rx="2" stroke="white" strokeWidth="2" />
                <path d="M4 11h20" stroke="white" strokeWidth="2" />
                <path d="M9 6V4M19 6V4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="9" cy="16" r="1.5" fill="white" />
                <path d="M13 16h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M13 19h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#0F172A]">
              Ecom<span className="text-[#2563EB]">Sathi</span>
            </span>
          </div>

          <div className="w-full max-w-[400px] text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertCircle size={34} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A]">
              {tokenState === 'missing' ? 'Invalid reset link' : 'Link expired'}
            </h2>
            <p className="mt-3 text-sm text-[#64748B] leading-relaxed">
              {tokenState === 'missing'
                ? 'This page requires a valid password reset link.'
                : 'This reset link has expired or has already been used. Please request a new one.'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
            >
              Request New Link
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-3 text-sm font-medium text-[#64748B] transition-colors hover:text-[#2563EB]"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Set new password form ──────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-white">
      <BrandPanel />

      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        {/* Mobile logo */}
        <div className="mb-10 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB]">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect x="4" y="6" width="20" height="16" rx="2" stroke="white" strokeWidth="2" />
              <path d="M4 11h20" stroke="white" strokeWidth="2" />
              <path d="M9 6V4M19 6V4" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="9" cy="16" r="1.5" fill="white" />
              <path d="M13 16h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13 19h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-lg font-bold text-[#0F172A]">
            Ecom<span className="text-[#2563EB]">Sathi</span>
          </span>
        </div>

        <div className="mx-auto w-full max-w-[400px]">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#0F172A]">Set new password</h1>
            <p className="mt-1.5 text-sm text-[#64748B]">
              Choose a strong password for your account
            </p>
          </div>

          {error && <div className="mb-5"><ErrorAlert message={error} /></div>}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label="New Password"
              id="new-password"
              type={showNew ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              leftIcon={<Lock size={15} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="pointer-events-auto cursor-pointer text-[#94A3B8] hover:text-[#64748B] focus:outline-none"
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              helper="At least 8 characters"
              disabled={loading}
              required
            />

            <Input
              label="Confirm New Password"
              id="confirm-password"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock size={15} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="pointer-events-auto cursor-pointer text-[#94A3B8] hover:text-[#64748B] focus:outline-none"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              error={
                confirmPassword && confirmPassword !== newPassword
                  ? 'Passwords do not match'
                  : undefined
              }
              disabled={loading}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
              className="mt-1 rounded-lg py-2.5 text-sm font-semibold"
            >
              Update Password
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#64748B]">
            Remember your password?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-semibold text-[#2563EB] hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>

        <p className="mt-12 text-center text-xs text-[#CBD5E1]">
          &copy; {new Date().getFullYear()} EcomSathi. All rights reserved.
        </p>
      </div>
    </div>
  )
}
