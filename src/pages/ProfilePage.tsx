import { useState, useRef, useCallback } from 'react'
import {
  User,
  Mail,
  Phone,
  Building2,
  Lock,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
  Camera,
  Crown,
  Check,
  X,
  Minus,
  ChevronRight,
  Bell,
  Plug2,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, Button, Input, Modal, Alert, Badge } from '@/components/common'
import * as authService from '@/services/authService'
import { uploadFile } from '@/supabase/storage'

// ============================================================
// Toggle Switch
// ============================================================

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}

function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-[#0F172A]">{label}</p>
        {description && <p className="text-xs text-[#64748B]">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/30',
          checked ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]',
        ].join(' ')}
      >
        <span
          className={[
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </label>
  )
}

// ============================================================
// Plan comparison data
// ============================================================

interface PlanFeature {
  label: string
  free: boolean | string
  starter: boolean | string
  pro: boolean | string
  enterprise: boolean | string
}

const PLAN_FEATURES: PlanFeature[] = [
  { label: 'Free Tools Access',          free: true,     starter: true,      pro: true,       enterprise: true },
  { label: 'Reconciliation (orders/mo)', free: '50',     starter: '500',     pro: 'Unlimited', enterprise: 'Unlimited' },
  { label: 'Inventory Products',         free: '100',    starter: '2,000',   pro: 'Unlimited', enterprise: 'Unlimited' },
  { label: 'Team Members',               free: '1',      starter: '3',       pro: '10',       enterprise: 'Unlimited' },
  { label: 'Priority Support',           free: false,    starter: false,     pro: true,       enterprise: true },
  { label: 'Marketplace Integrations',   free: false,    starter: false,     pro: true,       enterprise: true },
  { label: 'API Access',                 free: false,    starter: false,     pro: false,      enterprise: true },
  { label: 'Dedicated Account Manager',  free: false,    starter: false,     pro: false,      enterprise: true },
]

function PlanFeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="text-sm font-medium text-[#0F172A]">{value}</span>
  }
  return value ? (
    <Check size={16} className="mx-auto text-green-600" />
  ) : (
    <Minus size={16} className="mx-auto text-gray-300" />
  )
}

// ============================================================
// ProfilePage
// ============================================================

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()

  // ── Profile form state ─────────────────────────────────────
  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [gstin, setGstin] = useState(user?.gstin ?? '')
  const [orgName, setOrgName] = useState(user?.org_name ?? '')

  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // ── Password form state ────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError]   = useState<string | null>(null)

  // ── Avatar upload ─────────────────────────────────────────
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  // Local preview so UI updates instantly without waiting for profile refetch
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // ── Notification prefs ─────────────────────────────────────
  const [notifLowStock, setNotifLowStock] = useState(
    () => localStorage.getItem('notif_low_stock') !== 'false'
  )
  const [notifReconDone, setNotifReconDone] = useState(
    () => localStorage.getItem('notif_recon_done') !== 'false'
  )
  const [notifWeekly, setNotifWeekly] = useState(
    () => localStorage.getItem('notif_weekly') === 'true'
  )
  const [notifSaving, setNotifSaving] = useState(false)

  // ── Toast ──────────────────────────────────────────────────
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // ── Delete account modal ───────────────────────────────────
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  // ── GSTIN validation ──────────────────────────────────────
  const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  const gstinError = gstin && !gstinPattern.test(gstin) ? 'Invalid GSTIN format' : undefined

  // ── Resolve avatar URL (handle stored filename vs full URL) ──
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
  function resolveAvatarUrl(raw: string | null | undefined): string | null {
    if (!raw) return null
    if (raw.startsWith('http')) return raw
    // bare filename like "66ae6e87-...png" — build full public URL
    return `${SUPABASE_URL}/storage/v1/object/public/uploads/avatars/${raw}`
  }
  const resolvedAvatar = avatarPreview ?? resolveAvatarUrl(user?.avatar_url)

  // ── Initials avatar ───────────────────────────────────────
  const initials = (user?.full_name ?? user?.email ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join('')

  // ── Plan helpers ──────────────────────────────────────────
  const planLabel: Record<string, string> = {
    free: 'Free',
    trial: 'Trial',
    pro: 'Pro',
    enterprise: 'Enterprise',
  }
  const currentPlan = user?.subscription_status ?? 'free'

  // ── Avatar change ─────────────────────────────────────────
  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image must be under 2MB.')
      return
    }

    // Show instant local preview
    const localUrl = URL.createObjectURL(file)
    setAvatarPreview(localUrl)

    setAvatarUploading(true)
    setAvatarError(null)
    try {
      // Always use .png extension to avoid duplicate files per user
      const path = `avatars/${user.id}.png`
      const url = await uploadFile('uploads', path, file)
      // Add cache-bust so browser doesn't show stale avatar
      await updateProfile({ avatar_url: `${url}?t=${Date.now()}` })
    } catch (err) {
      setAvatarPreview(null) // revert preview on error
      setAvatarError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setAvatarUploading(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }, [user?.id, updateProfile])

  // ── Save profile ──────────────────────────────────────────
  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    if (gstinError) return

    setProfileSaving(true)
    setProfileError(null)
    setProfileSuccess(false)

    try {
      await updateProfile({ full_name: fullName, phone, gstin: gstin || null, org_name: orgName || null })
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3500)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setProfileSaving(false)
    }
  }

  // ── Change password ───────────────────────────────────────
  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (!newPassword) {
      setPasswordError('New password is required')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setPasswordSaving(true)
    try {
      await authService.updatePassword(newPassword)
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3500)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setPasswordSaving(false)
    }
  }

  // ── Save notification preferences ────────────────────────
  async function handleSavePreferences() {
    setNotifSaving(true)
    try {
      // Persist to localStorage for now (no DB column yet)
      localStorage.setItem('notif_low_stock', String(notifLowStock))
      localStorage.setItem('notif_recon_done', String(notifReconDone))
      localStorage.setItem('notif_weekly', String(notifWeekly))
      showToast('Notification preferences saved')
    } finally {
      setNotifSaving(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      {/* ── Page header ─────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Your Profile</h1>
        <p className="mt-0.5 text-sm text-[#64748B]">
          Manage your personal information, password, subscription, and account settings
        </p>
      </div>

      {/* ── Toast notification ──────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-[8px] border border-[#E2E8F0] bg-white px-4 py-3 shadow-lg">
          <CheckCircle2 size={16} className="text-green-500" />
          <span className="text-sm font-medium text-[#0F172A]">{toast}</span>
        </div>
      )}

      {/* ── 1. Personal Information ──────────────────────────── */}
      <Card variant="shadowed" padding="none" className="overflow-hidden">
        {/* Header strip */}
        <div className="border-b border-[#E2E8F0] px-6 py-4">
          <h2 className="text-base font-bold text-[#0F172A]">Personal Information</h2>
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row">
            {/* Avatar column */}
            <div className="flex shrink-0 flex-col items-center gap-3">
              <div className="relative">
                {resolvedAvatar ? (
                  <img
                    src={resolvedAvatar}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EFF6FF] text-2xl font-bold text-[#2563EB]">
                    {initials}
                  </div>
                )}
                {/* Hidden file input */}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  title="Change avatar"
                  disabled={avatarUploading}
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#2563EB] text-white shadow hover:bg-[#1D4ED8] disabled:opacity-60"
                >
                  {avatarUploading
                    ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    : <Camera size={13} />
                  }
                </button>
              </div>
              {avatarError && (
                <p className="text-xs text-red-500">{avatarError}</p>
              )}
              <div className="text-center">
                <p className="text-sm font-semibold text-[#0F172A]">
                  {user?.full_name ?? '—'}
                </p>
                <Badge
                  variant={
                    user?.subscription_status === 'pro'
                      ? 'primary'
                      : user?.subscription_status === 'enterprise'
                      ? 'info'
                      : 'default'
                  }
                  size="sm"
                >
                  {user?.subscription_status ?? 'free'}
                </Badge>
              </div>
            </div>

            {/* Form column */}
            <form onSubmit={handleProfileSave} className="flex flex-1 flex-col gap-4">
              {profileSuccess && (
                <Alert variant="success" title="Saved!" message="Your profile has been updated." />
              )}
              {profileError && (
                <Alert variant="error" title="Error" message={profileError} />
              )}

              {/* Email (read-only) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Email</label>
                <div className="flex items-center gap-2 rounded-[4px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#64748B]">
                  <Mail size={15} className="shrink-0 text-[#94A3B8]" />
                  <span className="flex-1">{user?.email ?? '—'}</span>
                  <Lock size={13} className="shrink-0 text-[#CBD5E1]" />
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Email address cannot be changed from here.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Full Name */}
                <Input
                  label="Full Name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  leftIcon={<User size={15} />}
                />

                {/* Phone */}
                <Input
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  leftIcon={<Phone size={15} />}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Organisation Name */}
                <Input
                  label="Organisation Name"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Your business name"
                  leftIcon={<Building2 size={15} />}
                />

                {/* GSTIN */}
                <Input
                  label="GSTIN"
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                  error={gstinError}
                  helper="15-character GST identification number"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={profileSaving}
                  disabled={!!gstinError}
                >
                  Save Changes
                </Button>
                {profileSuccess && (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                    <CheckCircle2 size={15} /> Saved!
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </Card>

      {/* ── 2. Change Password ───────────────────────────────── */}
      <Card variant="shadowed" padding="none" className="overflow-hidden">
        <div className="border-b border-[#E2E8F0] px-6 py-4">
          <h2 className="text-base font-bold text-[#0F172A]">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordSave} className="flex flex-col gap-4 p-6">
          {passwordSuccess && (
            <Alert variant="success" title="Password updated!" message="Your new password is active." />
          )}
          {passwordError && (
            <Alert variant="error" title="Error" message={passwordError} />
          )}

          {/* Current password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="currentPwd" className="text-sm font-medium text-[#0F172A]">
              Current Password
            </label>
            <div className="relative">
              <input
                id="currentPwd"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                autoComplete="current-password"
                className="w-full rounded-[4px] border border-[#CBD5E1] px-3 py-2.5 pr-10 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* New password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="newPwd" className="text-sm font-medium text-[#0F172A]">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPwd"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className="w-full rounded-[4px] border border-[#CBD5E1] px-3 py-2.5 pr-10 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPwd" className="text-sm font-medium text-[#0F172A]">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPwd"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                  className={[
                    'w-full rounded-[4px] border px-3 py-2.5 pr-10 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all focus:ring-2',
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                      : 'border-[#CBD5E1] focus:border-[#2563EB] focus:ring-[#2563EB]/20',
                  ].join(' ')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={passwordSaving}
            >
              Update Password
            </Button>
            {passwordSuccess && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <CheckCircle2 size={15} /> Password updated!
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* ── 3. Subscription ───────────────────────────────────── */}
      <Card variant="shadowed" padding="none" className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#EFF6FF] text-[#2563EB]">
            <Crown size={16} />
          </div>
          <h2 className="text-base font-bold text-[#0F172A]">Subscription</h2>
        </div>

        <div className="p-6">
          {/* Current plan card */}
          <div className="mb-6 flex flex-col gap-4 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-[#0F172A]">
                  {planLabel[currentPlan] ?? 'Free'} Plan
                </p>
                <Badge
                  variant={
                    currentPlan === 'pro'
                      ? 'primary'
                      : currentPlan === 'trial'
                      ? 'warning'
                      : currentPlan === 'enterprise'
                      ? 'info'
                      : 'success'
                  }
                  size="sm"
                >
                  {currentPlan === 'free' ? 'Active' : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                </Badge>
              </div>
              {user?.subscription_expires_at && (
                <p className="mt-1 text-xs text-[#64748B]">
                  Expires{' '}
                  {new Date(user.subscription_expires_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
              <ul className="mt-3 flex flex-col gap-1">
                {PLAN_FEATURES.slice(0, 4).map((f) => {
                  const val = f[currentPlan as keyof PlanFeature]
                  return (
                    <li key={f.label} className="flex items-center gap-2 text-xs text-[#64748B]">
                      {val === false ? (
                        <X size={12} className="text-gray-300" />
                      ) : (
                        <Check size={12} className="text-green-500" />
                      )}
                      {f.label}: <span className="font-medium text-[#0F172A]">
                        {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : val}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ChevronRight size={14} />}
              onClick={() => showToast('Payment integration coming soon')}
            >
              {currentPlan === 'free' ? 'Upgrade to Pro' : 'Manage Plan'}
            </Button>
          </div>

          {/* Plan comparison table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="py-2 pr-4 text-left text-xs font-semibold text-[#64748B]">
                    Feature
                  </th>
                  {['Free', 'Starter', 'Pro', 'Enterprise'].map((plan) => (
                    <th
                      key={plan}
                      className={[
                        'px-4 py-2 text-center text-xs font-semibold',
                        plan === 'Pro'
                          ? 'text-[#2563EB]'
                          : 'text-[#64748B]',
                      ].join(' ')}
                    >
                      {plan}
                      {plan === 'Pro' && (
                        <span className="ml-1 rounded-full bg-[#2563EB] px-1.5 py-0.5 text-[9px] font-bold text-white">
                          Popular
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAN_FEATURES.map((feature, i) => (
                  <tr
                    key={feature.label}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}
                  >
                    <td className="py-2.5 pr-4 text-xs text-[#64748B]">{feature.label}</td>
                    <td className="px-4 py-2.5 text-center">
                      <PlanFeatureCell value={feature.free} />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <PlanFeatureCell value={feature.starter} />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <PlanFeatureCell value={feature.pro} />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <PlanFeatureCell value={feature.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* ── 4. Notification Preferences ─────────────────────── */}
      <Card variant="shadowed" padding="none" className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#EFF6FF] text-[#2563EB]">
            <Bell size={16} />
          </div>
          <h2 className="text-base font-bold text-[#0F172A]">Notification Preferences</h2>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <Toggle
            checked={notifLowStock}
            onChange={setNotifLowStock}
            label="Low stock alert emails"
            description="Get notified when products fall below their threshold"
          />
          <Toggle
            checked={notifReconDone}
            onChange={setNotifReconDone}
            label="Reconciliation complete emails"
            description="Receive a summary when a reconciliation run finishes"
          />
          <Toggle
            checked={notifWeekly}
            onChange={setNotifWeekly}
            label="Weekly summary email"
            description="A weekly digest of inventory and reconciliation activity"
          />

          <div className="flex justify-end pt-1">
            <Button
              variant="primary"
              size="sm"
              loading={notifSaving}
              onClick={handleSavePreferences}
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </Card>

      {/* ── 5. API & Integrations (coming soon) ──────────────── */}
      <Card variant="shadowed" padding="none" className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#EFF6FF] text-[#2563EB]">
            <Plug2 size={16} />
          </div>
          <h2 className="text-base font-bold text-[#0F172A]">API & Integrations</h2>
        </div>

        <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Plug2 size={24} className="text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#0F172A]">
              Marketplace API integrations coming soon
            </p>
            <p className="mt-1 text-xs text-[#64748B]">
              Direct connections to Amazon, Flipkart, Myntra, Meesho, and more — no manual
              report uploads required.
            </p>
          </div>
          <Badge variant="warning" size="sm">In development</Badge>
        </div>
      </Card>

      {/* ── 6. Danger Zone ──────────────────────────────────── */}
      <Card variant="blush" padding="md" className="border-red-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-red-100 text-red-600">
              <AlertTriangle size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-red-700">Danger Zone</p>
              <p className="mt-0.5 text-xs text-red-600">
                Permanently delete your account and all associated data. This action cannot
                be undone.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete Account
          </Button>
        </div>
      </Card>

      {/* ── Delete Account Modal ─────────────────────────────── */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Account"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-[6px] bg-red-50 p-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm text-red-700">
              This will permanently delete your account, all products, inventory data, and
              reconciliation history. This action cannot be undone.
            </p>
          </div>
          <p className="text-sm text-[#64748B]">
            To request account deletion please contact support at{' '}
            <a
              href="mailto:support@ecomsathi.in"
              className="font-semibold text-[#2563EB] hover:underline"
            >
              support@ecomsathi.in
            </a>
            .
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                window.location.href = 'mailto:support@ecomsathi.in?subject=Account+Deletion+Request&body=Please+delete+my+EcomSathi+account.+User+ID:+' + user?.id
                setDeleteModalOpen(false)
              }}
            >
              I understand, request deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
