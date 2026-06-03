import { useState, useRef } from 'react'
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
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, Button, Input, Modal, Alert, Badge } from '@/components/common'
import * as authService from '@/services/authService'

// ============================================================
// Toggle (reuse from Settings)
// ============================================================

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

  // ── Delete account modal ───────────────────────────────────
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  // ── GSTIN validation ──────────────────────────────────────
  const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  const gstinError = gstin && !gstinPattern.test(gstin) ? 'Invalid GSTIN format' : undefined

  // ── Initials avatar ───────────────────────────────────────
  const initials = (user?.full_name ?? user?.email ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join('')

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

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      {/* ── Page header ─────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Your Profile</h1>
        <p className="mt-0.5 text-sm text-[#64748B]">
          Manage your personal information, password, and account settings
        </p>
      </div>

      {/* ── Profile card ────────────────────────────────────── */}
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
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EFF6FF] text-2xl font-bold text-[#2563EB]">
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  title="Change avatar (coming soon)"
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#2563EB] text-white shadow hover:bg-[#1D4ED8]"
                >
                  <Camera size={13} />
                </button>
              </div>
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

      {/* ── Change Password card ─────────────────────────────── */}
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

      {/* ── Danger Zone ─────────────────────────────────────── */}
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
