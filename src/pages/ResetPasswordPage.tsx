import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/supabase/client'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/common/Card'

// ─── Alert ───────────────────────────────────────────────────────────────────
function Alert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-[6px] border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]"
    >
      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

// ─── EcomSathi wordmark ───────────────────────────────────────────────────────
function EcomSathiLogo() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#2563EB] shadow-[#1E293B_2px_2px_0px_0px]">
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="4" y="6" width="20" height="16" rx="2" stroke="white" strokeWidth="2" />
          <path d="M4 11h20" stroke="white" strokeWidth="2" />
          <path d="M9 6V4M19 6V4" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="9" cy="16" r="1.5" fill="white" />
          <path d="M13 16h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M13 19h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-xl font-bold tracking-tight text-[#0F172A]">
        Ecom<span className="text-[#2563EB]">Sathi</span>
      </span>
    </div>
  )
}

// ─── Token states ─────────────────────────────────────────────────────────────
type TokenState = 'checking' | 'valid' | 'expired' | 'missing'

// ─── ResetPasswordPage ────────────────────────────────────────────────────────
//
// Supabase sends the reset link in two forms depending on the auth flow:
//  - PKCE flow (default since Supabase JS v2.x): the link contains a `code`
//    query param. supabase.auth.onAuthStateChange fires PASSWORD_RECOVERY.
//  - Implicit flow (legacy): the link contains `#access_token=...` in the hash,
//    which Supabase client auto-detects via detectSessionInUrl: true.
//
// We listen to the onAuthStateChange event so both flows are handled without
// manual token parsing. The PASSWORD_RECOVERY event signals a valid session.
// ─────────────────────────────────────────────────────────────────────────────
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

  // ── Detect the reset session ────────────────────────────────────────────────
  useEffect(() => {
    // Check for error params that Supabase includes when the link is expired
    const errorCode = searchParams.get('error_code') || searchParams.get('error')
    if (errorCode) {
      setTokenState('expired')
      return
    }

    // If there's an access_token in the URL hash or a code param, Supabase will
    // handle it automatically via detectSessionInUrl. We subscribe to the event.
    const hasToken =
      searchParams.get('access_token') ||
      searchParams.get('code') ||
      window.location.hash.includes('access_token')

    if (!hasToken) {
      setTokenState('missing')
      return
    }

    // Listen for PASSWORD_RECOVERY auth event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setTokenState('valid')
      } else if (event === 'SIGNED_OUT') {
        setTokenState('expired')
      }
    })

    // Also handle the case where the session was already set before this
    // component mounted (e.g. INITIAL_SESSION with type == recovery)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setTokenState('valid')
      } else if (tokenState === 'checking') {
        // Give the auth listener a moment before declaring it expired
        const timer = setTimeout(() => {
          setTokenState((prev) => (prev === 'checking' ? 'expired' : prev))
        }, 3000)
        return () => clearTimeout(timer)
      }
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Form submit ─────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

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

      // Sign out after password update so user logs in fresh with new password
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

  // ── Loading / checking state ────────────────────────────────────────────────
  if (tokenState === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3 text-[#64748B]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E2E8F0] border-t-[#2563EB]" />
          <p className="text-sm">Verifying reset link&hellip;</p>
        </div>
      </div>
    )
  }

  // ── Expired / missing token ─────────────────────────────────────────────────
  if (tokenState === 'expired' || tokenState === 'missing') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <EcomSathiLogo />
          </div>

          <Card variant="shadowed" padding="lg">
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2]">
                <AlertCircle size={32} className="text-[#DC2626]" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">
                  {tokenState === 'missing' ? 'Invalid Reset Link' : 'Link Expired'}
                </h2>
                <p className="mt-2 text-sm text-[#64748B]">
                  {tokenState === 'missing'
                    ? 'This page requires a valid password reset link.'
                    : 'This reset link has expired or has already been used. Please request a new one.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="mt-2 inline-flex items-center justify-center rounded-[4px] bg-[#2563EB] px-5 py-2.5 text-base font-medium text-white shadow-[#1E293B_2px_2px_0px_0px] transition-all hover:bg-[#1D4ED8]"
              >
                Request New Link
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-[#64748B] hover:text-[#2563EB] transition-colors"
              >
                Back to Login
              </button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // ── Set new password form ───────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 flex justify-center">
          <EcomSathiLogo />
        </div>

        <Card variant="shadowed" padding="lg">
          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-[#0F172A]">Set New Password</h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Choose a strong password for your account
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5">
              <Alert message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* New password */}
            <Input
              label="New Password"
              id="new-password"
              type={showNew ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="pointer-events-auto cursor-pointer text-[#94A3B8] hover:text-[#64748B] focus:outline-none"
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              helper="At least 8 characters"
              disabled={loading}
              required
            />

            {/* Confirm password */}
            <Input
              label="Confirm New Password"
              id="confirm-password"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="pointer-events-auto cursor-pointer text-[#94A3B8] hover:text-[#64748B] focus:outline-none"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
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

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
              className="mt-1"
            >
              Update Password
            </Button>
          </form>

          {/* Back to login */}
          <p className="mt-6 text-center text-sm text-[#64748B]">
            Remember your password?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-medium text-[#2563EB] hover:underline"
            >
              Sign In
            </button>
          </p>
        </Card>

        <p className="mt-6 text-center text-xs text-[#94A3B8]">
          &copy; {new Date().getFullYear()} EcomSathi. All rights reserved.
        </p>
      </div>
    </div>
  )
}
