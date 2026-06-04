import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, AlertCircle, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
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
          <KeyRound size={26} />
        </div>
        <h2 className="text-4xl font-bold leading-tight">
          Forgot your<br />password?
        </h2>
        <p className="mt-4 text-base text-blue-200 leading-relaxed">
          No worries — it happens to the best of us. Enter your email and
          we&apos;ll send you a secure reset link right away.
        </p>

        <ul className="mt-8 flex flex-col gap-3">
          {[
            'Link expires in 1 hour for your security',
            'Check your spam folder if you don\'t see it',
            'You can request a new link at any time',
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
          Remember your password?{' '}
          <Link to="/login" className="font-semibold text-white hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}

// ─── ForgotPasswordPage ───────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) { setError('Please enter your email address.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      await resetPassword(email.trim())
      setSent(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset link. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ─── Success state ──────────────────────────────────────────────────────────
  if (sent) {
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
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 size={34} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Reset link sent!</h2>
            <p className="mt-3 text-sm text-[#64748B] leading-relaxed">
              Check your inbox at{' '}
              <span className="font-semibold text-[#0F172A]">{email}</span>{' '}
              for a link to reset your password.
            </p>
            <p className="mt-4 text-xs text-[#94A3B8]">
              Didn&apos;t get it? Check your spam folder or{' '}
              <button
                type="button"
                onClick={() => { setSent(false); setError(null) }}
                className="font-medium text-[#2563EB] hover:underline"
              >
                try a different email
              </button>
              .
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:underline"
            >
              <ArrowLeft size={14} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ─── Request form ───────────────────────────────────────────────────────────
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
            <h1 className="text-2xl font-bold text-[#0F172A]">Reset your password</h1>
            <p className="mt-1.5 text-sm text-[#64748B]">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          {error && <div className="mb-5"><ErrorAlert message={error} /></div>}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label="Email address"
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={15} />}
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
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 flex justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] transition-colors hover:text-[#2563EB]"
            >
              <ArrowLeft size={14} />
              Back to Sign In
            </Link>
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-[#CBD5E1]">
          &copy; {new Date().getFullYear()} EcomSathi. All rights reserved.
        </p>
      </div>
    </div>
  )
}
