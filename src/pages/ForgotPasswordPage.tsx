import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
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

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    // Basic email format check
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
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <EcomSathiLogo />
          </div>

          <Card variant="shadowed" padding="lg">
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              {/* Green checkmark */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F0FDF4]">
                <CheckCircle2 size={32} className="text-[#16A34A]" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">Reset link sent!</h2>
                <p className="mt-2 text-sm text-[#64748B]">
                  Check your email at{' '}
                  <span className="font-medium text-[#0F172A]">{email}</span> for
                  instructions to reset your password.
                </p>
              </div>

              <p className="text-xs text-[#94A3B8]">
                Didn&apos;t receive it? Check your spam folder or{' '}
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
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#2563EB] hover:underline"
              >
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // ─── Request form ───────────────────────────────────────────────────────────
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
            <h1 className="text-2xl font-bold text-[#0F172A]">Reset Password</h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5">
              <Alert message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Email */}
            <Input
              label="Email address"
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
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
              Send Reset Link
            </Button>
          </form>

          {/* Back to login */}
          <div className="mt-6 flex justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#2563EB] transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-[#94A3B8]">
          &copy; {new Date().getFullYear()} EcomSathi. All rights reserved.
        </p>
      </div>
    </div>
  )
}
