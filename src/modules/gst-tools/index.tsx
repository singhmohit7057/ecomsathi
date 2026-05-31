import React, { useState, Suspense, lazy } from 'react'
import {
  Search,
  Shield,
  Calculator,
  Divide,
  Tag,
  MapPin,
  CheckSquare,
  CreditCard,
  BookOpen,
  FileText,
  ArrowLeft,
} from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { PageLoader } from '../../components/common/Loader'

// Lazy load all tools
const GSTSearch = lazy(() => import('./GSTSearch'))
const GSTVerify = lazy(() => import('./GSTVerify'))
const GSTCalculator = lazy(() => import('./GSTCalculator'))
const ReverseGSTCalculator = lazy(() => import('./ReverseGSTCalculator'))
const GSTRateFinder = lazy(() => import('./GSTRateFinder'))
const GSTStateFinder = lazy(() => import('./GSTStateFinder'))
const GSTINValidator = lazy(() => import('./GSTINValidator'))
const PANValidator = lazy(() => import('./PANValidator'))
const HSNSearch = lazy(() => import('./HSNSearch'))
const SACSearch = lazy(() => import('./SACSearch'))

type ToolId =
  | 'gstin-search'
  | 'gstin-verify'
  | 'gst-calculator'
  | 'reverse-gst-calculator'
  | 'gst-rate-finder'
  | 'gst-state-finder'
  | 'gstin-validator'
  | 'pan-validator'
  | 'hsn-search'
  | 'sac-search'

interface ToolCard {
  id: ToolId
  title: string
  description: string
  icon: React.ReactNode
  badge?: string
  badgeVariant?: 'success' | 'info' | 'warning' | 'error' | 'default' | 'primary'
  color: string
}

const TOOLS: ToolCard[] = [
  {
    id: 'gstin-search',
    title: 'GSTIN Search & Lookup',
    description: 'Search any GSTIN for instant format validation. Optionally verify live on government portal.',
    icon: <Search size={22} />,
    badge: 'Live Verify',
    badgeVariant: 'info',
    color: 'from-blue-50 to-blue-100',
  },
  {
    id: 'gstin-verify',
    title: 'GSTIN Verifier',
    description: 'Step-by-step format, checksum and live portal verification with status badges.',
    icon: <Shield size={22} />,
    badge: 'Live Verify',
    badgeVariant: 'info',
    color: 'from-indigo-50 to-indigo-100',
  },
  {
    id: 'gst-calculator',
    title: 'GST Calculator',
    description: 'Calculate CGST + SGST (intra-state) or IGST (inter-state) on any amount.',
    icon: <Calculator size={22} />,
    badge: 'Offline',
    badgeVariant: 'success',
    color: 'from-green-50 to-green-100',
  },
  {
    id: 'reverse-gst-calculator',
    title: 'Reverse GST Calculator',
    description: 'Enter a GST-inclusive price and extract the base amount and tax breakdown.',
    icon: <Divide size={22} />,
    badge: 'Offline',
    badgeVariant: 'success',
    color: 'from-emerald-50 to-emerald-100',
  },
  {
    id: 'gst-rate-finder',
    title: 'GST Rate Finder',
    description: 'Find the applicable GST rate for any product (HSN) or service (SAC) by code or keyword.',
    icon: <Tag size={22} />,
    badge: 'Offline',
    badgeVariant: 'success',
    color: 'from-yellow-50 to-yellow-100',
  },
  {
    id: 'gst-state-finder',
    title: 'GST State Finder',
    description: 'Find state name and zone from a 2-digit GST state code or full GSTIN.',
    icon: <MapPin size={22} />,
    badge: 'Offline',
    badgeVariant: 'success',
    color: 'from-orange-50 to-orange-100',
  },
  {
    id: 'gstin-validator',
    title: 'GSTIN Validator',
    description: 'Validate GSTIN length, state code, PAN format, entity number, Z-marker and checksum.',
    icon: <CheckSquare size={22} />,
    badge: 'Offline',
    badgeVariant: 'success',
    color: 'from-teal-50 to-teal-100',
  },
  {
    id: 'pan-validator',
    title: 'PAN Validator',
    description: 'Validate PAN card format and extract taxpayer entity type (Individual, Company, etc.).',
    icon: <CreditCard size={22} />,
    badge: 'Offline',
    badgeVariant: 'success',
    color: 'from-purple-50 to-purple-100',
  },
  {
    id: 'hsn-search',
    title: 'HSN Code Search',
    description: 'Search HSN codes for goods by code or description. Click any result for a quick GST calc.',
    icon: <BookOpen size={22} />,
    badge: 'Offline',
    badgeVariant: 'success',
    color: 'from-pink-50 to-pink-100',
  },
  {
    id: 'sac-search',
    title: 'SAC Code Search',
    description: 'Search Service Accounting Codes (SAC) for services by code or service name.',
    icon: <FileText size={22} />,
    badge: 'Offline',
    badgeVariant: 'success',
    color: 'from-rose-50 to-rose-100',
  },
]

function renderTool(id: ToolId) {
  switch (id) {
    case 'gstin-search': return <GSTSearch />
    case 'gstin-verify': return <GSTVerify />
    case 'gst-calculator': return <GSTCalculator />
    case 'reverse-gst-calculator': return <ReverseGSTCalculator />
    case 'gst-rate-finder': return <GSTRateFinder />
    case 'gst-state-finder': return <GSTStateFinder />
    case 'gstin-validator': return <GSTINValidator />
    case 'pan-validator': return <PANValidator />
    case 'hsn-search': return <HSNSearch />
    case 'sac-search': return <SACSearch />
  }
}

export const GSTTools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null)

  if (activeTool) {
    const tool = TOOLS.find(t => t.id === activeTool)!
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => setActiveTool(null)}
            >
              All GST Tools
            </Button>
          </div>
          <Suspense fallback={<PageLoader />}>
            {renderTool(activeTool)}
          </Suspense>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#0F172A]">GST Tools</h1>
          <p className="text-[#475569] mt-2 max-w-2xl mx-auto">
            Free tools for Indian sellers — validate GSTINs, calculate tax, find HSN/SAC codes and more.
            Most tools work offline. Live verification uses the GSTN portal via our secure backend.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#475569]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              Offline — works without internet
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#475569]">
              <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
              Live Verify — calls GSTN portal
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#475569]">
              <span className="w-2 h-2 rounded-full bg-[#D97706]" />
              No login required
            </span>
          </div>
        </div>

        {/* Tool grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOOLS.map(tool => (
            <Card
              key={tool.id}
              variant="shadowed"
              padding="none"
              onClick={() => setActiveTool(tool.id)}
              className="overflow-hidden group hover:shadow-lg transition-shadow"
            >
              {/* Colored top strip */}
              <div className={`bg-gradient-to-r ${tool.color} px-5 pt-5 pb-4`}>
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-white rounded-[8px] shadow-sm text-[#374151]">
                    {tool.icon}
                  </div>
                  {tool.badge && tool.badgeVariant && (
                    <Badge variant={tool.badgeVariant} size="sm">{tool.badge}</Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="px-5 py-4">
                <h2 className="text-sm font-bold text-[#0F172A] mb-1 group-hover:text-[#2563EB] transition-colors">
                  {tool.title}
                </h2>
                <p className="text-xs text-[#64748B] leading-relaxed">{tool.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-10 text-center text-xs text-[#94A3B8]">
          GST data is based on official CBIC notifications. Rates are indicative — always verify with your CA for specific transactions.
        </div>
      </div>
    </div>
  )
}

export default GSTTools
