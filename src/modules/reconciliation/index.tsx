import React, { useState, useEffect } from 'react'
import { Lock } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/common'
import { useAuth } from '@/hooks/useAuth'
import ReconciliationDashboard from './ReconciliationDashboard'
import ImportWizard from './ImportWizard'
import ReportView from './ReportView'

type View = 'dashboard' | 'import' | 'report'

const PremiumGate: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
    <div className="w-16 h-16 bg-[#FDF4FF] border-2 border-[#E9D5FF] rounded-2xl flex items-center justify-center mb-5">
      <Lock size={28} className="text-[#7C3AED]" />
    </div>
    <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Premium Feature</h2>
    <p className="text-[#64748B] mb-6 leading-relaxed">
      Reconciliation is available on the Pro and Enterprise plans.
    </p>
    <Button variant="outline" onClick={() => window.location.assign('/pricing')}>
      View Pricing
    </Button>
  </div>
)

const ReconciliationModule: React.FC = () => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [view, setView] = useState<View>('dashboard')
  const [activeReportId, setActiveReportId] = useState<string | null>(null)

  // Derive view from the current URL path so deep links work
  useEffect(() => {
    const path = location.pathname
    if (path.includes('/import')) {
      setView('import')
    } else if (path.includes('/reports/')) {
      // extract report id from path e.g. /reconciliation/reports/<id>
      const match = path.match(/\/reports\/([^/]+)/)
      if (match) {
        setActiveReportId(match[1])
        setView('report')
      }
    } else {
      setView('dashboard')
    }
  }, [location.pathname])

  const orgId = user?.org_id ?? user?.id ?? ''

  const isPremium =
    user?.subscription_status === 'pro' ||
    user?.subscription_status === 'enterprise' ||
    user?.subscription_status === 'trial'

  if (!user) return null
  if (!isPremium) return <PremiumGate />

  if (view === 'import') {
    return (
      <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto">
        <ImportWizard
          orgId={orgId}
          onComplete={() => navigate('/reconciliation')}
          onCancel={() => navigate('/reconciliation')}
        />
      </div>
    )
  }

  if (view === 'report' && activeReportId) {
    return (
      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
        <ReportView
          reportId={activeReportId}
          orgId={orgId}
          onBack={() => navigate('/reconciliation')}
        />
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <ReconciliationDashboard
        orgId={orgId}
        onNewImport={() => navigate('/reconciliation/import')}
        onViewReport={(id) => navigate(`/reconciliation/reports/${id}`)}
      />
    </div>
  )
}

export default ReconciliationModule
