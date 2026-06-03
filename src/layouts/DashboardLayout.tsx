import { useState, useCallback } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  RefreshCw,
  Package,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Bell,
  ShoppingBag,
  LogOut,
  ShoppingCart,
  Store,
  Layers,
  BarChart2,
  Boxes,
  ClipboardList,
  Truck,
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
      { label: 'Amazon', to: '/reconciliation/amazon', icon: <ShoppingBag size={16} /> },
      { label: 'Flipkart', to: '/reconciliation/flipkart', icon: <ShoppingCart size={16} /> },
      { label: 'Myntra', to: '/reconciliation/myntra', icon: <Store size={16} /> },
      { label: 'Meesho', to: '/reconciliation/meesho', icon: <Layers size={16} /> },
      { label: 'AJIO', to: '/reconciliation/ajio', icon: <BarChart2 size={16} /> },
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
    label: 'Settings',
    to: '/settings',
    icon: <Settings size={18} />,
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
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-gray-700 hover:bg-gray-100',
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
          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100',
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
        <div className="ml-6 mt-1 flex flex-col gap-0.5 border-l border-gray-200 pl-3">
          {item.children!.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] font-semibold text-[var(--color-primary)]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
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
    <div className="flex h-full flex-col bg-white">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center border-b border-gray-100 px-4">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
            <ShoppingBag size={16} />
          </span>
          {!collapsed && (
            <span className="text-base font-bold text-gray-900">EcomSathi</span>
          )}
        </NavLink>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavItemRow item={item} collapsed={collapsed} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer: user info + subscription badge */}
      <div className="shrink-0 border-t border-gray-100 p-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light,#e0f2fe)] text-sm font-semibold text-[var(--color-primary)]">
            {user?.full_name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? '?'}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {user?.full_name ?? 'User'}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <SubscriptionBadge status={user?.subscription_status ?? 'free'} />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            title="Sign out"
            className="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
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
        className="hidden shrink-0 flex-col border-r border-gray-200 transition-[width] duration-200 lg:flex"
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
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 shadow-xl transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar collapsed={false} onNavigate={closeMobile} />
      </aside>

      {/* ── Right column (header + content) ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              type="button"
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Desktop collapse toggle */}
            <button
              type="button"
              className="hidden rounded-md p-1.5 text-gray-400 hover:bg-gray-100 lg:flex"
              onClick={() => setDesktopCollapsed((v) => !v)}
              title={desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {desktopCollapsed ? <ChevronRight size={18} /> : <X size={18} />}
            </button>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              type="button"
              className="relative rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
              title="Notifications"
            >
              <Bell size={18} />
              {/* Unread dot */}
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-light,#e0f2fe)] text-sm font-semibold text-[var(--color-primary)]">
                {user?.full_name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <span className="hidden text-sm font-medium text-gray-700 sm:block">
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
