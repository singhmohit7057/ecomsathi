// ============================================================
// EcomSathi — Reconciliation Module Entry Point
// ============================================================

import React, { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  FileUp,
  ShoppingCart,
  Banknote,
  FileBarChart2,
  AlertCircle,
  Lock,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import ReconciliationDashboard from './ReconciliationDashboard'
import ImportWizard from './ImportWizard'
import OrdersTable from './OrdersTable'
import SettlementsTable from './SettlementsTable'
import ReportView from './ReportView'
import MissingPayments from './MissingPayments'
import * as reconService from '@/services/reconciliationService'

// ─── Types ────────────────────────────────────────────────────────────────────

type View =
  | 'dashboard'
  | 'import'
  | 'orders'
  | 'settlements'
  | 'report'
  | 'missing'

const NAV_ITEMS: { view: Exclude<View, 'import' | 'report'>; label: string; icon: React.ReactNode }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { view: 'orders', label: 'Orders', icon: <ShoppingCart size={16} /> },
  { view: 'settlements', label: 'Settlements', icon: <Banknote size={16} /> },
  { view: 'missing', label: 'Missing Payments', icon: <AlertCircle size={16} /> },
]

// ─── Onboarding Screen ────────────────────────────────────────────────────────

const OnboardingScreen: React.FC<{ onImport: () => void }> = ({ onImport }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
    <div className="w-16 h-16 bg-[#EFF6FF] border-2 border-[#BFDBFE] rounded-2xl flex items-center justify-center mb-5">
      <FileBarChart2 size={28} className="text-[#2563EB]" />
    </div>
    <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
      Start Reconciling Your Sales
    </h2>
    <p className="text-[#64748B] mb-8 leading-relaxed">
      Import your marketplace CSV/Excel reports to match orders against settlements,
      detect missing payments, and audit fees automatically.
    </p>

    <div className="grid grid-cols-1 gap-3 w-full mb-8">
      {['Amazon Settlement Report', 'Flipkart Payment Report', 'Myntra Reconciliation', 'Meesho Payment Report'].map(
        (mp) => (
          <div
            key={mp}
            className="flex items-center gap-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#64748B]"
          >
            <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
            {mp}
          </div>
        ),
      )}
    </div>

    <Button onClick={onImport} size="lg" rightIcon={<ArrowRight size={18} />} fullWidth>
      Import Your First File
    </Button>
  </div>
)

// ─── Premium gate ─────────────────────────────────────────────────────────────

const PremiumGate: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
    <div className="w-16 h-16 bg-[#FDF4FF] border-2 border-[#E9D5FF] rounded-2xl flex items-center justify-center mb-5">
      <Lock size={28} className="text-[#7C3AED]" />
    </div>
    <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Premium Feature</h2>
    <p className="text-[#64748B] mb-6 leading-relaxed">
      Reconciliation is available on the Pro and Enterprise plans. Upgrade to automatically
      match orders, detect discrepancies, and export audit reports.
    </p>
    <Button
      variant="outline"
      onClick={() => window.location.assign('/pricing')}
    >
      View Pricing
    </Button>
  </div>
)

// ─── Module Shell ─────────────────────────────────────────────────────────────

const ReconciliationModule: React.FC = () => {
  const { user } = useAuth()
  const [view, setView] = useState<View>('dashboard')
  const [activeReportId, setActiveReportId] = useState<string | null>(null)
  const [hasData, setHasData] = useState<boolean | null>(null)

  const orgId = user?.org_id ?? user?.id ?? ''

  // Check if org has any reports (to decide onboarding vs dashboard)
  useEffect(() => {
    if (!orgId) return

    reconService
      .getReports(orgId)
      .then((reports) => setHasData(reports.length > 0))
      .catch(() => setHasData(false))
  }, [orgId])

  // ── Premium check ────────────────────────────────────────────────────────
  const isPremium =
    user?.subscription_status === 'pro' ||
    user?.subscription_status === 'enterprise' ||
    user?.subscription_status === 'trial'

  if (!user) return null
  if (!isPremium) return <PremiumGate />

  if (hasData === null) {
    // Loading check
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full" />
      </div>
    )
  }

  // ── Show onboarding if no data and not in import view ────────────────────
  if (!hasData && view !== 'import') {
    return (
      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
        <OnboardingScreen onImport={() => setView('import')} />
      </div>
    )
  }

  // ── Import wizard view ───────────────────────────────────────────────────
  if (view === 'import') {
    return (
      <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto">
        <ImportWizard
          orgId={orgId}
          onComplete={() => {
            setHasData(true)
            setView('dashboard')
          }}
          onCancel={() => setView(hasData ? 'dashboard' : 'dashboard')}
        />
      </div>
    )
  }

  // ── Report detail view ───────────────────────────────────────────────────
  if (view === 'report' && activeReportId) {
    return (
      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
        <ReportView
          reportId={activeReportId}
          orgId={orgId}
          onBack={() => {
            setActiveReportId(null)
            setView('dashboard')
          }}
        />
      </div>
    )
  }

  // ── Main layout ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-52 border-r border-[#E2E8F0] bg-[#F8FAFC] pt-6 pb-4 px-3 shrink-0">
        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider px-3 mb-3">
          Reconciliation
        </p>
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                view === item.view
                  ? 'bg-[#EFF6FF] text-[#2563EB]'
                  : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4 px-2">
          <button
            onClick={() => setView('import')}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-[#2563EB] border border-[#BFDBFE] bg-[#EFF6FF] hover:bg-[#DBEAFE] transition-colors"
          >
            <FileUp size={14} />
            New Import
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center gap-1 bg-[#F1F5F9] border-b border-[#E2E8F0] px-3 py-2 overflow-x-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              view === item.view
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
        <button
          onClick={() => setView('import')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-[#2563EB] border border-[#BFDBFE] whitespace-nowrap ml-1"
        >
          <FileUp size={12} />
          Import
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-8 py-6 overflow-y-auto">
        {view === 'dashboard' && (
          <ReconciliationDashboard
            orgId={orgId}
            onNewImport={() => setView('import')}
            onViewReport={(id) => {
              setActiveReportId(id)
              setView('report')
            }}
          />
        )}
        {view === 'orders' && <OrdersTable orgId={orgId} />}
        {view === 'settlements' && (
          <SettlementsTable
            orgId={orgId}
            onViewLinkedOrder={() => setView('orders')}
          />
        )}
        {view === 'missing' && <MissingPayments orgId={orgId} />}
      </main>
    </div>
  )
}

export default ReconciliationModule
