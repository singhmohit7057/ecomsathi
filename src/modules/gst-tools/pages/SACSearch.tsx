import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { Search } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { SAC_DATA, type SACEntry } from '../data/sacData'
import GSTToolLayout from '../components/GSTToolLayout'

const RATE_BADGE: Record<number, 'success' | 'info' | 'warning' | 'error' | 'default' | 'primary'> = {
  0: 'success', 5: 'info', 12: 'primary', 18: 'warning', 28: 'error',
}

const SAC_FUSE = new Fuse(SAC_DATA, {
  keys: [{ name: 'code', weight: 2 }, { name: 'description', weight: 1 }],
  threshold: 0.35,
  includeScore: true,
})

const FAQS = [
  {
    q: 'What is a SAC code?',
    a: 'SAC (Service Accounting Code) is a 6-digit classification code for services under GST in India. It is equivalent to HSN codes for goods. Every service provider must quote the SAC on GST invoices.',
  },
  {
    q: 'What is the GST rate for most services?',
    a: 'Most services in India attract 18% GST. However, some services have reduced rates: 5% for transport and some construction services, 12% for business support services, and 28% for recreation/hospitality. Healthcare and education are mostly exempt (0%).',
  },
  {
    q: 'Which services are exempt from GST?',
    a: 'Services exempt from GST include: healthcare services by hospitals and doctors, educational services by recognised institutions, transportation of passengers by certain vehicles, agricultural services, and government/charitable services.',
  },
  {
    q: 'How do I find the correct SAC code for my business?',
    a: 'Search by your service name (e.g. "software development", "legal services", "transportation") in this tool. If you offer multiple services, you may need multiple SAC codes on your GST invoices. Consult a CA for complex classifications.',
  },
]

const RELATED_TOOLS = [
  { label: 'HSN Code Search', to: '/gst/hsn-search' },
  { label: 'GST Rate Finder', to: '/gst/rate-finder' },
  { label: 'GST Calculator',  to: '/gst/calculator' },
  { label: 'GST Verification', to: '/gst/verification' },
]

export default function SACSearch() {
  const [query, setQuery] = useState('')

  const results = useMemo<SACEntry[]>(() => {
    const q = query.trim()
    if (!q) return SAC_DATA
    if (/^\d+$/.test(q)) return SAC_DATA.filter(e => e.code.startsWith(q))
    return SAC_FUSE.search(q).map(r => r.item)
  }, [query])

  return (
    <GSTToolLayout
      title="SAC Code Search"
      metaTitle="SAC Code Search Tool | Find GST Rate for Services | EcomSathi"
      metaDescription="Search SAC (Service Accounting Code) by code or service description. Find GST rates for all service categories. Free SAC lookup for businesses and freelancers."
      metaKeywords="SAC code search, SAC code finder, SAC code list, GST rate for services, service accounting code India"
      canonicalPath="/gst/sac-search"
      crumbs={[{ label: 'GST Tools', to: '/gst' }, { label: 'SAC Code Search' }]}
      faqs={FAQS}
    >
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">SAC Code Search</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Search Service Accounting Codes (SAC) by code number or service description.
          </p>
        </div>

        <Card variant="shadowed" padding="md">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by code (e.g. 9965) or service name (e.g. courier, legal, software)"
              className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all"
            />
          </div>
          <p className="text-xs text-[#94A3B8] mt-1.5">
            Showing {results.length} of {SAC_DATA.length} service codes
          </p>
        </Card>

        {results.length === 0 && (
          <Card variant="blush" padding="md">
            <p className="text-sm text-[#991B1B]">No SAC codes found for "{query}".</p>
          </Card>
        )}

        <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-[#374151] w-28">SAC Code</th>
                <th className="text-left py-3 px-4 font-medium text-[#374151]">Service Description</th>
                <th className="text-left py-3 px-4 font-medium text-[#374151] w-28">GST Rate</th>
              </tr>
            </thead>
            <tbody>
              {results.map(entry => (
                <tr key={entry.code} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-[#2563EB]">{entry.code}</td>
                  <td className="py-3 px-4 text-[#0F172A]">{entry.description}</td>
                  <td className="py-3 px-4">
                    <Badge variant={RATE_BADGE[entry.gstRate] ?? 'default'}>{entry.gstRate}%</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Card variant="sky" padding="md">
          <p className="font-medium text-[#0C4A6E] text-sm mb-1">About SAC Codes</p>
          <p className="text-sm text-[#0369A1]">
            SAC codes are used to classify services under GST. Most services attract 18% GST.
            Exempted services include education, healthcare, and certain government services (0%).
          </p>
        </Card>
      </div>
    </GSTToolLayout>
  )
}
