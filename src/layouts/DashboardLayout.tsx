import { useState, useCallback } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  RefreshCw,
  Package,
  User,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Bell,
  ShoppingBag,
  LogOut,
  BarChart2,
  Boxes,
  ClipboardList,
  Truck,
  Store,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { clsx } from 'clsx'

// ============================================================
// Types
// ============================================================

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  children?: { label: string; to: string; icon: React.ReactNode }[]
}

// ============================================================
// Nav tree
// ============================================================

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: 'Reconciliation',
    to: '/reconciliation',
    icon: <RefreshCw size={18} />,
    children: [
      { label: 'Import',  to: '/reconciliation/import', icon: <ShoppingBag size={16} /> },
      { label: 'Report',  to: '/reconciliation',        icon: <BarChart2 size={16} /> },
    ],
  },
  {
    label: 'Inventory',
    to: '/inventory',
    icon: <Package size={18} />,
    children: [
      { label: 'Products', to: '/inventory/products', icon: <Boxes size={16} /> },
      { label: 'Movements', to: '/inventory/movements', icon: <ClipboardList size={16} /> },
      { label: 'Purchase Orders', to: '/inventory/purchase-orders', icon: <Truck size={16} /> },
      { label: 'Warehouses', to: '/inventory/warehouses', icon: <Store size={16} /> },
    ],
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: <User size={18} />,
  },
]

// ============================================================
// Subscription badge
// ============================================================

const BADGE_MAP: Record<string, { label: string; className: string }> = {
  free: { label: 'Free', className: 'bg-gray-100 text-gray-600' },
  trial: { label: 'Trial', className: 'bg-amber-100 text-amber-700' },
  pro: { label: 'Pro', className: 'bg-[var(--color-primary)] text-white' },
  enterprise: { label: 'Enterprise', className: 'bg-purple-600 text-white' },
}

function SubscriptionBadge({ status }: { status: string }) {
  const badge = BADGE_MAP[status] ?? BADGE_MAP.free
  return (
    <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-semibold', badge.className)}>
      {badge.label}
    </span>
  )
}

// ============================================================
// Single nav link (supports sub-items)
// ============================================================

function NavItemRow({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  collapsed: boolean
  onNavigate: () => void
}) {
  const [open, setOpen] = useState(false)
  const hasChildren = !!item.children?.length

  if (!hasChildren) {
    return (
      <NavLink
        to={item.to}
        end
        onClick={onNavigate}
        className={({ isActive }) =>
          clsx(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isActive
              ? 'bg-white/20 text-white'
              : 'text-blue-100 hover:bg-white/10 hover:text-white',
          )
        }
      >
        <span className="shrink-0">{item.icon}</span>
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-100 transition-colors hover:bg-white/10 hover:text-white',
        )}
      >
        <span className="shrink-0">{item.icon}</span>
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </>
        )}
      </button>

      {open && !collapsed && (
        <div className="ml-6 mt-1 flex flex-col gap-0.5 border-l border-white/20 pl-3">
          {item.children!.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-white/20 font-semibold text-white'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white',
                )
              }
            >
              {child.icon}
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Sidebar (shared between desktop pinned + mobile drawer)
// ============================================================

function Sidebar({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean
  onNavigate: () => void
}) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = useCallback(async () => {
    await signOut()
    navigate('/login')
  }, [signOut, navigate])

  return (
    <div className="flex h-full flex-col bg-[#1E3A8A]">
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center border-b border-white/10 px-4">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <span style={{ background: 'white', color: '#1E40AF' }} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect x="4" y="6" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M4 11h20" stroke="currentColor" strokeWidth="2" />
              <path d="M9 6V4M19 6V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="9" cy="16" r="1.5" fill="currentColor" />
              <path d="M13 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13 19h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          {!collapsed && (
            <span className="text-[15px] font-bold tracking-tight text-white">
              Ecom<span className="text-blue-300">Sathi</span>
            </span>
          )}
        </NavLink>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavItemRow item={item} collapsed={collapsed} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer: user info + sign out */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white ring-2 ring-white/20">
            {user?.full_name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? '?'}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user?.full_name ?? 'User'}
              </p>
              <div className="mt-0.5">
                <SubscriptionBadge status={user?.subscription_status ?? 'free'} />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            title="Sign out"
            className="shrink-0 rounded-md p-1.5 text-blue-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// DashboardLayout
// ============================================================

export default function DashboardLayout() {
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  // Desktop sidebar can be collapsed to icon-only mode
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  const SIDEBAR_W = desktopCollapsed ? 72 : 260

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      {/* ── Desktop sidebar (fixed, never off-screen) ── */}
      <aside
        style={{ width: SIDEBAR_W }}
        className="hidden shrink-0 flex-col border-r border-white/10 transition-[width] duration-200 lg:flex"
      >
        <Sidebar collapsed={desktopCollapsed} onNavigate={() => {}} />
      </aside>

      {/* ── Mobile drawer backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        style={{ width: 260 }}
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 shadow-xl transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar collapsed={false} onNavigate={closeMobile} />
      </aside>

      {/* ── Right column (header + content) ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#1e3a8a] bg-[#1E40AF] px-4 shadow-md lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              type="button"
              className="rounded-md p-1.5 text-blue-200 hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Desktop collapse toggle */}
            <button
              type="button"
              className="hidden rounded-md p-1.5 text-blue-200 hover:bg-white/10 hover:text-white lg:flex"
              onClick={() => setDesktopCollapsed((v) => !v)}
              title={desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu size={18} />
            </button>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button
              type="button"
              className="relative rounded-md p-1.5 text-blue-200 hover:bg-white/10"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-400" />
            </button>

            {/* Divider */}
            <div className="mx-1 h-5 w-px bg-white/20" />

            {/* User avatar + name */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white ring-2 ring-white/30">
                {user?.full_name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <span className="hidden text-sm font-semibold text-white sm:block">
                {user?.full_name ?? user?.email}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
