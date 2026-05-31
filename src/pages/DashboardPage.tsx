import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Upload,
  Tag,
  Scissors,
  TrendingUp,
  Clock,
  ChevronRight,
  Zap,
  Star,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, Skeleton, Button, Badge } from '@/components/common'
import { ToolCard, ALL_TOOLS } from '@/components/sections/ToolsGrid'
import { supabase } from '@/supabase/client'

// ============================================================
// Types
// ============================================================

interface DashboardStats {
  totalProducts: number
  lowStockAlerts: number
  pendingPOs: number
  pendingReconciliation: number
}

interface ActivityLog {
  id: string
  action: string
  entity_type: string | null
  entity_id: string | null
  meta: Record<string, unknown> | null
  created_at: string
}

// ============================================================
// Helpers
// ============================================================

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function activityLabel(log: ActivityLog): string {
  const type = log.entity_type ?? 'item'
  switch (log.action) {
    case 'create':    return `Created a new ${type}`
    case 'update':    return `Updated ${type}`
    case 'delete':    return `Deleted ${type}`
    case 'import':    return `Imported ${type} data`
    case 'export':    return `Exported ${type} report`
    case 'reconcile': return `Reconciled ${type} orders`
    default:          return log.action.replace(/_/g, ' ')
  }
}

// ============================================================
// StatCard
// ============================================================

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  loading: boolean
  linkTo?: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
}

function StatCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  loading,
  linkTo,
  trend = 'neutral',
  trendLabel,
}: StatCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      variant="shadowed"
      padding="md"
      onClick={linkTo ? () => navigate(linkTo) : undefined}
      className="flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-[8px] ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        {trend === 'up' && (
          <span className="flex items-center gap-0.5 text-xs font-medium text-green-600">
            <ArrowUpRight size={14} />
            {trendLabel ?? ''}
          </span>
        )}
        {trend === 'down' && (
          <span className="flex items-center gap-0.5 text-xs font-medium text-red-500">
            <ArrowDownRight size={14} />
            {trendLabel ?? ''}
          </span>
        )}
      </div>

      {loading ? (
        <>
          <Skeleton height={36} width="40%" rounded="sm" />
          <Skeleton height={14} width="60%" rounded="sm" />
        </>
      ) : (
        <>
          <p className="text-3xl font-bold text-[#0F172A]">{value}</p>
          <p className="text-sm font-medium text-[#64748B]">{label}</p>
        </>
      )}

      {linkTo && !loading && (
        <div className="flex items-center gap-1 text-xs font-semibold text-[#2563EB]">
          View details <ChevronRight size={12} />
        </div>
      )}
    </Card>
  )
}

// ============================================================
// QuickAction
// ============================================================

interface QuickActionProps {
  label: string
  description: string
  icon: React.ReactNode
  to: string
  iconBg: string
  iconColor: string
}

function QuickAction({ label, description, icon, to, iconBg, iconColor }: QuickActionProps) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="group flex flex-col items-center gap-3 rounded-[8px] border border-[#E2E8F0] bg-white p-5 text-center transition-all duration-150 hover:-translate-y-0.5 hover:border-[#2563EB]/40 hover:shadow-[#2563EB_2px_2px_0px_0px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-[10px] transition-transform duration-150 group-hover:scale-110 ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-[#0F172A] group-hover:text-[#2563EB]">{label}</p>
        <p className="mt-0.5 text-xs text-[#94A3B8]">{description}</p>
      </div>
    </button>
  )
}

// ============================================================
// DashboardPage
// ============================================================

export default function DashboardPage() {
  const { user } = useAuth()

  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockAlerts: 0,
    pendingPOs: 0,
    pendingReconciliation: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [activityLoading, setActivityLoading] = useState(true)

  const popularTools = ALL_TOOLS.filter((t) => t.isPopular).slice(0, 6)
  const isFree = !user?.subscription_status || user.subscription_status === 'free'
  const firstName = user?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'

  // ── Fetch dashboard stats ──────────────────────────────────
  useEffect(() => {
    if (!user?.org_id) {
      setStatsLoading(false)
      return
    }

    const orgId = user.org_id

    async function fetchStats() {
      try {
        const [
          { count: productCount },
          { count: lowStockCount },
          { count: pendingPOCount },
          { count: pendingReconCount },
        ] = await Promise.all([
          supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('org_id', orgId),
          supabase
            .from('inventory')
            .select('id', { count: 'exact', head: true })
            .eq('org_id', orgId)
            .lte('quantity', 10),
          supabase
            .from('purchase_orders')
            .select('id', { count: 'exact', head: true })
            .eq('org_id', orgId)
            .in('status', ['pending', 'approved']),
          supabase
            .from('settlements')
            .select('id', { count: 'exact', head: true })
            .eq('org_id', orgId)
            .eq('status', 'unmatched'),
        ])

        setStats({
          totalProducts: productCount ?? 0,
          lowStockAlerts: lowStockCount ?? 0,
          pendingPOs: pendingPOCount ?? 0,
          pendingReconciliation: pendingReconCount ?? 0,
        })
      } catch (err) {
        console.error('[Dashboard] stats fetch error', err)
      } finally {
        setStatsLoading(false)
      }
    }

    void fetchStats()
  }, [user?.org_id])

  // ── Fetch activity logs ────────────────────────────────────
  useEffect(() => {
    if (!user?.org_id) {
      setActivityLoading(false)
      return
    }

    async function fetchActivity() {
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('id, action, entity_type, entity_id, meta, created_at')
          .eq('org_id', user!.org_id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) throw error
        setActivityLogs((data as ActivityLog[]) ?? [])
      } catch (err) {
        console.error('[Dashboard] activity fetch error', err)
      } finally {
        setActivityLoading(false)
      }
    }

    void fetchActivity()
  }, [user?.org_id])

  return (
    <div className="flex flex-col gap-8">
      {/* ── Welcome header ──────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-0.5 text-sm text-[#64748B]">{formatDate(new Date())}</p>
        </div>
        <Badge
          variant={
            user?.subscription_status === 'pro'
              ? 'primary'
              : user?.subscription_status === 'enterprise'
              ? 'info'
              : user?.subscription_status === 'trial'
              ? 'warning'
              : 'default'
          }
          size="md"
        >
          {user?.subscription_status === 'pro'
            ? 'Pro Plan'
            : user?.subscription_status === 'enterprise'
            ? 'Enterprise'
            : user?.subscription_status === 'trial'
            ? 'Trial'
            : 'Free Plan'}
        </Badge>
      </div>

      {/* ── Upgrade banner (free plan only) ─────────────────── */}
      {isFree && (
        <div className="flex flex-col gap-3 rounded-[8px] border border-[#2563EB]/30 bg-[#EFF6FF] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-[#2563EB] text-white">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E3A8A]">
                Upgrade to Pro for unlimited reconciliation
              </p>
              <p className="text-xs text-[#3B82F6]">
                Process more orders, unlock advanced reports, and remove daily limits
              </p>
            </div>
          </div>
          <Link
            to="/settings"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-[4px] bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
          >
            Upgrade Now <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* ── Quick stats row ──────────────────────────────────── */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Overview statistics</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Products"
            value={stats.totalProducts}
            icon={<Package size={20} />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            loading={statsLoading}
            linkTo="/inventory/products"
            trend="neutral"
          />
          <StatCard
            label="Low Stock Alerts"
            value={stats.lowStockAlerts}
            icon={<AlertTriangle size={20} />}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            loading={statsLoading}
            linkTo="/inventory/low-stock"
            trend={stats.lowStockAlerts > 0 ? 'down' : 'neutral'}
            trendLabel={stats.lowStockAlerts > 0 ? 'needs attention' : undefined}
          />
          <StatCard
            label="Pending Purchase Orders"
            value={stats.pendingPOs}
            icon={<ShoppingCart size={20} />}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            loading={statsLoading}
            linkTo="/inventory/purchase-orders"
          />
          <StatCard
            label="Pending Reconciliation"
            value={stats.pendingReconciliation}
            icon={<RefreshCw size={20} />}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
            loading={statsLoading}
            linkTo="/reconciliation"
            trend={stats.pendingReconciliation > 0 ? 'down' : 'neutral'}
          />
        </div>
      </section>

      {/* ── Quick actions ────────────────────────────────────── */}
      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="mb-4 text-base font-bold text-[#0F172A]">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <QuickAction
            label="Import Reconciliation"
            description="Upload marketplace reports"
            icon={<Upload size={22} />}
            to="/reconciliation"
            iconBg="bg-[#EFF6FF]"
            iconColor="text-[#2563EB]"
          />
          <QuickAction
            label="Add Products"
            description="Create new inventory items"
            icon={<Plus size={22} />}
            to="/inventory"
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <QuickAction
            label="Generate SKUs"
            description="Create product codes fast"
            icon={<Tag size={22} />}
            to="/tools/sku-generator"
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
          <QuickAction
            label="Crop Labels"
            description="Extract shipping labels"
            icon={<Scissors size={22} />}
            to="/label-crop"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
        </div>
      </section>

      {/* ── Main grid: Activity + Tools ─────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <section className="lg:col-span-1" aria-labelledby="activity-heading">
          <Card variant="shadowed" padding="none" className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#64748B]" />
                <h2 id="activity-heading" className="text-sm font-bold text-[#0F172A]">
                  Recent Activity
                </h2>
              </div>
              <TrendingUp size={16} className="text-[#94A3B8]" />
            </div>

            <div className="flex flex-col divide-y divide-[#F1F5F9]">
              {activityLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                    <Skeleton height={32} width={32} rounded="full" />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Skeleton height={14} width="80%" />
                      <Skeleton height={12} width="40%" />
                    </div>
                  </div>
                ))
              ) : activityLogs.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                  <Clock size={32} className="text-gray-200" />
                  <p className="text-sm text-gray-400">No activity yet</p>
                  <p className="text-xs text-gray-300">
                    Actions you take will appear here
                  </p>
                </div>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 px-5 py-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#64748B]">
                      <RefreshCw size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#0F172A]">
                        {activityLabel(log)}
                      </p>
                      <p className="text-xs text-[#94A3B8]">{timeAgo(log.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </section>

        {/* Popular Free Tools */}
        <section className="lg:col-span-2" aria-labelledby="tools-heading">
          <Card variant="shadowed" padding="none" className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-[#64748B]" />
                <h2 id="tools-heading" className="text-sm font-bold text-[#0F172A]">
                  Popular Free Tools
                </h2>
              </div>
              <Link
                to="/tools"
                className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
              >
                View all <ChevronRight size={12} />
              </Link>
            </div>

            {/* Horizontal scroll strip */}
            <div className="overflow-x-auto px-5 py-4">
              <div className="flex gap-3 pb-1" style={{ minWidth: 'max-content' }}>
                {popularTools.map((tool) => (
                  <div key={tool.path} className="w-[200px] shrink-0">
                    <ToolCard tool={tool} compact />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* ── Explore tools CTA strip ──────────────────────────── */}
      <div className="flex flex-col items-center gap-3 rounded-[8px] border border-dashed border-[#E2E8F0] bg-white py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
          <Zap size={24} />
        </div>
        <div>
          <p className="text-base font-bold text-[#0F172A]">50+ Free Ecommerce Tools</p>
          <p className="mt-0.5 text-sm text-[#64748B]">
            SKU generators, PDF utilities, image tools, GST helpers, and more
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          rightIcon={<ChevronRight size={14} />}
          onClick={() => (window.location.href = '/tools')}
        >
          Explore All Tools
        </Button>
      </div>
    </div>
  )
}
