import { useState, useEffect } from 'react'
import {
  Building2,
  Users,
  Crown,
  Bell,
  Plug2,
  Check,
  X,
  Minus,
  UserPlus,
  Trash2,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, Button, Input, Modal, Badge, Alert } from '@/components/common'
import { supabase } from '@/supabase/client'
import type { Organization, OrgMember } from '@/types'

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
// SettingsPage
// ============================================================

export default function SettingsPage() {
  const { user } = useAuth()

  // ── Organisation state ─────────────────────────────────────
  const [org, setOrg] = useState<Organization | null>(null)
  const [orgName, setOrgName] = useState('')
  const [orgSaving, setOrgSaving] = useState(false)
  const [orgSuccess, setOrgSuccess] = useState(false)
  const [orgError, setOrgError] = useState<string | null>(null)

  // ── Team members state ─────────────────────────────────────
  const [members, setMembers] = useState<OrgMember[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member')

  // ── Notification prefs ─────────────────────────────────────
  const [notifLowStock, setNotifLowStock] = useState(true)
  const [notifReconDone, setNotifReconDone] = useState(true)
  const [notifWeekly, setNotifWeekly] = useState(false)

  // ── Toast ──────────────────────────────────────────────────
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // ── Load org + members ──────────────────────────────────────
  useEffect(() => {
    if (!user?.org_id) {
      setMembersLoading(false)
      return
    }

    async function load() {
      try {
        const [{ data: orgData }, { data: memberData }] = await Promise.all([
          supabase
            .from('organizations')
            .select('*')
            .eq('id', user!.org_id)
            .single(),
          supabase
            .from('org_members')
            .select('*, profile:profiles(id, full_name, email, role)')
            .eq('org_id', user!.org_id),
        ])

        if (orgData) {
          setOrg(orgData as Organization)
          setOrgName(orgData.name ?? '')
        }
        setMembers((memberData as OrgMember[]) ?? [])
      } catch (err) {
        console.error('[Settings] load error', err)
      } finally {
        setMembersLoading(false)
      }
    }

    void load()
  }, [user?.org_id])

  // ── Save org name ──────────────────────────────────────────
  async function handleOrgSave(e: React.FormEvent) {
    e.preventDefault()
    if (!org?.id || !orgName.trim()) return
    setOrgSaving(true)
    setOrgError(null)

    try {
      const { error } = await supabase
        .from('organizations')
        .update({ name: orgName.trim() })
        .eq('id', org.id)

      if (error) throw error
      setOrgSuccess(true)
      setTimeout(() => setOrgSuccess(false), 3000)
    } catch (err) {
      setOrgError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setOrgSaving(false)
    }
  }

  // ── Invite member (placeholder) ────────────────────────────
  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteModalOpen(false)
    setInviteEmail('')
    setInviteRole('member')
    showToast('Invite feature coming soon')
  }

  // ── Remove member (placeholder) ───────────────────────────
  function handleRemoveMember(memberId: string) {
    showToast(`Remove member feature coming soon (id: ${memberId.slice(0, 8)}…)`)
  }

  const planLabel: Record<string, string> = {
    free: 'Free',
    trial: 'Trial',
    pro: 'Pro',
    enterprise: 'Enterprise',
  }

  const currentPlan = user?.subscription_status ?? 'free'

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
        <p className="mt-0.5 text-sm text-[#64748B]">
          Manage your organisation, team, subscription, and preferences
        </p>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-[8px] border border-[#E2E8F0] bg-white px-4 py-3 shadow-lg">
          <CheckCircle2 size={16} className="text-green-500" />
          <span className="text-sm font-medium text-[#0F172A]">{toast}</span>
        </div>
      )}

      {/* ── 1. Organisation Settings ───────────────────────── */}
      <Card variant="shadowed" padding="none" className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#EFF6FF] text-[#2563EB]">
            <Building2 size={16} />
          </div>
          <h2 className="text-base font-bold text-[#0F172A]">Organisation Settings</h2>
        </div>

        <form onSubmit={handleOrgSave} className="flex flex-col gap-4 p-6">
          {orgError && <Alert variant="error" title="Error" message={orgError} />}

          <Input
            label="Organisation Name"
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Your company name"
            leftIcon={<Building2 size={15} />}
          />

          {/* Slug (read-only) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0F172A]">Organisation Slug</label>
            <div className="flex items-center gap-2 rounded-[4px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#64748B]">
              <span className="text-[#94A3B8]">ecomsathi.in/</span>
              <span className="font-mono">{org?.slug ?? '—'}</span>
            </div>
            <p className="text-xs text-[#94A3B8]">Slug is set at creation and cannot be changed.</p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" variant="primary" size="sm" loading={orgSaving}>
              Save Organisation
            </Button>
            {orgSuccess && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <CheckCircle2 size={15} /> Saved!
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* ── 2. Team Members ───────────────────────────────── */}
      <Card variant="shadowed" padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#EFF6FF] text-[#2563EB]">
              <Users size={16} />
            </div>
            <h2 className="text-base font-bold text-[#0F172A]">Team Members</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<UserPlus size={15} />}
            onClick={() => setInviteModalOpen(true)}
          >
            Invite Member
          </Button>
        </div>

        <div className="divide-y divide-[#F1F5F9]">
          {membersLoading ? (
            <div className="px-6 py-8 text-center text-sm text-[#94A3B8]">Loading members…</div>
          ) : members.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Users size={32} className="mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-[#94A3B8]">No team members yet</p>
            </div>
          ) : (
            members.map((member) => {
              const profile = member.profile
              const name = profile?.full_name ?? profile?.email ?? `User ${member.user_id.slice(0, 6)}`
              const email = profile?.email ?? '—'
              const role = member.role ?? 'member'
              const isOwner = role === 'owner'

              return (
                <div key={member.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-sm font-semibold text-[#2563EB]">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#0F172A]">{name}</p>
                    <p className="truncate text-xs text-[#64748B]">{email}</p>
                  </div>
                  <Badge
                    variant={
                      role === 'owner' || role === 'admin' ? 'primary' : 'default'
                    }
                    size="sm"
                  >
                    {role}
                  </Badge>
                  {!isOwner && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      title="Remove member"
                      className="shrink-0 rounded p-1 text-[#94A3B8] hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </Card>

      {/* ── 3. Subscription ───────────────────────────────── */}
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

      {/* ── 4. Notification Preferences ───────────────────── */}
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
              onClick={() => showToast('Notification preferences saved')}
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </Card>

      {/* ── 5. API & Integrations (coming soon) ────────────── */}
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

      {/* ── Invite Member Modal ────────────────────────────── */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Team Member"
        size="sm"
      >
        <form onSubmit={handleInvite} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0F172A]">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
              className="rounded-[4px] border border-[#CBD5E1] px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            >
              <option value="admin">Admin — full access</option>
              <option value="member">Member — standard access</option>
              <option value="viewer">Viewer — read-only access</option>
            </select>
          </div>

          <div className="flex items-center gap-3 rounded-[6px] bg-amber-50 p-3">
            <AlertTriangle size={14} className="shrink-0 text-amber-500" />
            <p className="text-xs text-amber-700">
              Invite feature coming soon. The member will be notified when this is live.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
