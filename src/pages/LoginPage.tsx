import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/common/Card'

// ─── Alert component (inline, no separate file needed) ───────────────────────
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
      {/* Icon mark */}
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
      {/* Wordmark */}
      <span className="text-xl font-bold tracking-tight text-[#0F172A]">
        Ecom<span className="text-[#2563EB]">Sathi</span>
      </span>
    </div>
  )
}

// ─── LoginPage ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const redirectTo = searchParams.get('redirect') || '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)
    try {
      // TODO: Add Turnstile widget using VITE_TURNSTILE_SITE_KEY
      // Verify the Turnstile token before calling signIn, e.g.:
      //   const turnstileToken = await getTurnstileToken()
      //   await verifyTurnstile(turnstileToken)

      await signIn(email.trim(), password)
      navigate(redirectTo, { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed. Please try again.'
      // Surface friendly messages for common Supabase errors
      if (msg.toLowerCase().includes('invalid login')) {
        setError('Incorrect email or password. Please try again.')
      } else if (msg.toLowerCase().includes('email not confirmed')) {
        setError('Please verify your email address before signing in.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

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
            <h1 className="text-2xl font-bold text-[#0F172A]">Welcome Back</h1>
            <p className="mt-1 text-sm text-[#64748B]">Sign in to your EcomSathi account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5">
              <Alert message={error} />
            </div>
          )}

          {/* Form */}
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

            {/* Password */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#0F172A] leading-none"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#2563EB] hover:underline"
                  tabIndex={0}
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="pointer-events-auto cursor-pointer text-[#94A3B8] hover:text-[#64748B] focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                disabled={loading}
                required
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
              className="mt-1"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#E2E8F0]" />
            <span className="text-xs font-medium text-[#94A3B8]">OR</span>
            <div className="h-px flex-1 bg-[#E2E8F0]" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-[#64748B]">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-[#2563EB] hover:underline"
            >
              Register
            </Link>
          </p>
        </Card>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-[#94A3B8]">
          &copy; {new Date().getFullYear()} EcomSathi. All rights reserved.
        </p>
      </div>
    </div>
  )
}
