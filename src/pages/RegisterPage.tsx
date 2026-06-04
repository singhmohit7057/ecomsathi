import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  PackageSearch,
  BarChart3,
  ShieldCheck,
  FileText,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

// ─── Password strength ────────────────────────────────────────────────────────

type StrengthLevel = 'weak' | 'medium' | 'strong'

function getPasswordStrength(pwd: string): StrengthLevel {
  if (pwd.length === 0) return 'weak'
  const score =
    (pwd.length >= 8 ? 1 : 0) +
    (pwd.length >= 12 ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(pwd) ? 1 : 0) +
    (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd) ? 1 : 0) +
    (/\d/.test(pwd) ? 1 : 0)
  if (score <= 2) return 'weak'
  if (score <= 3) return 'medium'
  return 'strong'
}

const strengthConfig: Record<StrengthLevel, { label: string; color: string; bars: number }> = {
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
            style={{ backgroundColor: bar <= bars ? color : '#E2E8F0' }}
          />
        ))}
      </div>
      <p className="text-xs font-medium" style={{ color }}>{label} password</p>
    </div>
  )
}

// ─── Brand panel (left side) ──────────────────────────────────────────────────

const features = [
  { icon: PackageSearch, text: 'Smart SKU & barcode generation for every product' },
  { icon: FileText,      text: 'PDF, image & video tools built for sellers' },
  { icon: BarChart3,     text: 'Payment reconciliation & inventory tracking' },
  { icon: ShieldCheck,   text: 'GST lookup, validator & compliance toolkit' },
]

function BrandPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-[52%] flex-col justify-between overflow-hidden bg-[#1E40AF] px-12 py-14 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-0 h-[320px] w-[320px] rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5" />
      </div>

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

      <div className="relative">
        <h2 className="text-4xl font-bold leading-tight">
          Everything you need<br />to sell smarter.
        </h2>
        <p className="mt-4 text-base text-blue-200 leading-relaxed">
          Join thousands of Indian ecommerce sellers who manage their products,
          documents, and business operations with EcomSathi.
        </p>

        <ul className="mt-8 flex flex-col gap-4">
          {features.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/20">
                <Icon size={13} />
              </div>
              <span className="text-sm text-blue-100 leading-snug">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative rounded-xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
        <p className="text-sm text-blue-100 leading-relaxed">
          "From day one, EcomSathi felt like it was built specifically for Indian sellers. The GST and SKU tools alone save us 3–4 hours a day."
        </p>
        <p className="mt-2 text-xs font-medium text-white/70">— Arjun K., Amazon Seller</p>
      </div>
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

    if (!fullName.trim())             { setError('Please enter your full name.'); return }
    if (!email.trim())                { setError('Please enter your email address.'); return }
    if (password.length < 8)          { setError('Password must be at least 8 characters long.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (!agreed)                      { setError('Please agree to the Terms of Service and Privacy Policy.'); return }

    setLoading(true)
    try {
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
      <div className="flex min-h-screen bg-white">
        <BrandPanel />
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-[400px] text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 size={34} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Check your email</h2>
            <p className="mt-3 text-sm text-[#64748B] leading-relaxed">
              We&apos;ve sent a verification link to{' '}
              <span className="font-semibold text-[#0F172A]">{email}</span>.
              Click the link to activate your account.
            </p>
            <p className="mt-4 text-xs text-[#94A3B8]">
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
              className="mt-6 inline-block text-sm font-semibold text-[#2563EB] hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ─── Registration form ──────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-white">
      <BrandPanel />

      {/* Form side */}
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
          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-[#0F172A]">Create your account</h1>
            <p className="mt-1.5 text-sm text-[#64748B]">
              Free to start — no credit card required
            </p>
          </div>

          {/* Error */}
          {error && <div className="mb-5"><ErrorAlert message={error} /></div>}

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
              leftIcon={<User size={15} />}
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
              leftIcon={<Mail size={15} />}
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
                leftIcon={<Lock size={15} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="pointer-events-auto cursor-pointer text-[#94A3B8] hover:text-[#64748B] focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
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
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-[#94A3B8] accent-[#2563EB]"
              />
              <span className="text-sm text-[#64748B]">
                I agree to the{' '}
                <Link to="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-[#2563EB] hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-[#2563EB] hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
              className="mt-1 rounded-lg py-2.5 text-sm font-semibold"
            >
              Create Account
            </Button>
          </form>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-[#64748B]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#2563EB] hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        <p className="mt-12 text-center text-xs text-[#CBD5E1]">
          &copy; {new Date().getFullYear()} EcomSathi. All rights reserved.
        </p>
      </div>
    </div>
  )
}
