import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
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

// ─── Password strength helpers ────────────────────────────────────────────────
type StrengthLevel = 'weak' | 'medium' | 'strong'

function getPasswordStrength(pwd: string): StrengthLevel {
  if (pwd.length === 0) return 'weak'
  const hasLength = pwd.length >= 8
  const hasLong = pwd.length >= 12
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd)
  const hasUpperLower = /[A-Z]/.test(pwd) && /[a-z]/.test(pwd)
  const hasNumber = /\d/.test(pwd)

  const score =
    (hasLength ? 1 : 0) +
    (hasLong ? 1 : 0) +
    (hasSpecial ? 1 : 0) +
    (hasUpperLower ? 1 : 0) +
    (hasNumber ? 1 : 0)

  if (score <= 2) return 'weak'
  if (score <= 3) return 'medium'
  return 'strong'
}

const strengthConfig: Record<
  StrengthLevel,
  { label: string; color: string; bars: number }
> = {
  weak:   { label: 'Weak',   color: '#DC2626', bars: 1 },
  medium: { label: 'Medium', color: '#D97706', bars: 2 },
  strong: { label: 'Strong', color: '#16A34A', bars: 3 },
}

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null
  const level = getPasswordStrength(password)
  const { label, color, bars } = strengthConfig[level]

  return (
    <div className="mt-1.5 flex flex-col gap-1">
      <div className="flex gap-1">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: bar <= bars ? color : '#E2E8F0',
            }}
          />
        ))}
      </div>
      <p className="text-xs font-medium" style={{ color }}>
        {label} password
      </p>
    </div>
  )
}

// ─── RegisterPage ─────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Client-side validation
    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy.')
      return
    }

    setLoading(true)
    try {
      // TODO: Add Turnstile widget using VITE_TURNSTILE_SITE_KEY
      // Verify the Turnstile token before calling signUp, e.g.:
      //   const turnstileToken = await getTurnstileToken()
      //   await verifyTurnstile(turnstileToken)

      await signUp(email.trim(), password, fullName.trim())
      setSuccess(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      if (msg.toLowerCase().includes('already registered')) {
        setError('An account with this email already exists. Try signing in.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <EcomSathiLogo />
          </div>
          <Card variant="shadowed" padding="lg">
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F0FDF4]">
                <CheckCircle2 size={32} className="text-[#16A34A]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">Check your email</h2>
                <p className="mt-2 text-sm text-[#64748B]">
                  We&apos;ve sent a verification link to{' '}
                  <span className="font-medium text-[#0F172A]">{email}</span>.
                  Click the link to activate your account.
                </p>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Didn&apos;t get the email? Check your spam folder or{' '}
                <button
                  type="button"
                  onClick={() => { setSuccess(false); setPassword(''); setConfirmPassword('') }}
                  className="font-medium text-[#2563EB] hover:underline"
                >
                  try again
                </button>
                .
              </p>
              <Link
                to="/login"
                className="mt-2 text-sm font-medium text-[#2563EB] hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // ─── Registration form ──────────────────────────────────────────────────────
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
            <h1 className="text-2xl font-bold text-[#0F172A]">Create Your Account</h1>
            <p className="mt-1 text-sm text-[#64748B]">Start managing your eCommerce business</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5">
              <Alert message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Full Name */}
            <Input
              label="Full Name"
              id="full-name"
              type="text"
              autoComplete="name"
              placeholder="Rahul Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User size={16} />}
              disabled={loading}
              required
            />

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

            {/* Password + strength */}
            <div className="flex flex-col gap-1">
              <Input
                label="Password"
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
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
              <PasswordStrengthBar password={password} />
            </div>

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              id="confirm-password"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Re-enter your password"
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
                confirmPassword && confirmPassword !== password
                  ? 'Passwords do not match'
                  : undefined
              }
              disabled={loading}
              required
            />

            {/* Terms checkbox */}
            <label className="flex cursor-pointer items-start gap-3 pt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={loading}
                className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-[#94A3B8] accent-[#2563EB]"
              />
              <span className="text-sm text-[#64748B]">
                I agree to the{' '}
                <Link
                  to="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#2563EB] hover:underline"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#2563EB] hover:underline"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
              className="mt-1"
            >
              Create Account
            </Button>
          </form>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-[#64748B]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-[#2563EB] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </Card>

        <p className="mt-6 text-center text-xs text-[#94A3B8]">
          &copy; {new Date().getFullYear()} EcomSathi. All rights reserved.
        </p>
      </div>
    </div>
  )
}
