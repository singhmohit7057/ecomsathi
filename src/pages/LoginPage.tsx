import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
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
      {/* Background decoration */}
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

      {/* Headline */}
      <div className="relative">
        <h2 className="text-4xl font-bold leading-tight">
          Your eCommerce toolkit,<br />all in one place.
        </h2>
        <p className="mt-4 text-base text-blue-200 leading-relaxed">
          Trusted by thousands of Indian sellers to manage products,
          documents, GST compliance, and business operations.
        </p>

        {/* Feature list */}
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

      {/* Footer quote */}
      <div className="relative rounded-xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
        <p className="text-sm text-blue-100 leading-relaxed">
          "EcomSathi saves us hours every week — from SKU generation to GST filing, it just works."
        </p>
        <p className="mt-2 text-xs font-medium text-white/70">— Priya M., Flipkart Seller</p>
      </div>
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

    if (!email.trim()) { setError('Please enter your email address.'); return }
    if (!password)      { setError('Please enter your password.');       return }

    setLoading(true)
    try {
      await signIn(email.trim(), password)
      navigate(redirectTo, { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed. Please try again.'
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#0F172A]">Welcome back</h1>
            <p className="mt-1.5 text-sm text-[#64748B]">
              Sign in to your EcomSathi account
            </p>
          </div>

          {/* Error */}
          {error && <div className="mb-5"><ErrorAlert message={error} /></div>}

          {/* Form */}
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

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-[#0F172A] leading-none">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#2563EB] hover:underline"
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
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
              className="mt-1 rounded-lg py-2.5 text-sm font-semibold"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#E2E8F0]" />
            <span className="text-xs text-[#94A3B8]">OR</span>
            <div className="h-px flex-1 bg-[#E2E8F0]" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-[#64748B]">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-[#2563EB] hover:underline">
              Create one free
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-12 text-center text-xs text-[#CBD5E1]">
          &copy; {new Date().getFullYear()} EcomSathi. All rights reserved.
        </p>
      </div>
    </div>
  )
}
