import {
  Shield,
  Calculator,
  Divide,
  MapPin,
  BookOpen,
  FileText,
  Tag,
  CheckCircle,
  Zap,
  Lock,
  Globe,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '@/components/common/SEO'
import GSTToolCard from '../components/GSTToolCard'
import GSTFAQ from '../components/GSTFAQ'

const SITE_URL = 'https://ecomsathi.vercel.app'

const HUB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'GST Tools for Ecommerce Sellers & Businesses',
  description:
    'Free GST tools including GST verification, calculators, HSN lookup, SAC search, GST rate finder and more.',
  url: `${SITE_URL}/gst`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'GST Tools', item: `${SITE_URL}/gst` },
    ],
  },
}

const TOOLS = [
  {
    title: 'GST Verification',
    description: 'Validate GSTIN format, checksum & all structure checks — then verify live on the GSTN portal.',
    icon: <Shield size={22} />,
    to: '/gst/verification',
    badge: 'Live Verify',
    badgeColor: 'blue' as const,
    gradient: 'bg-gradient-to-r from-blue-50 to-indigo-100',
  },
  {
    title: 'GST Calculator',
    description: 'Calculate CGST + SGST (intra-state) or IGST (inter-state) on any base amount.',
    icon: <Calculator size={22} />,
    to: '/gst/calculator',
    badge: 'Offline',
    badgeColor: 'green' as const,
    gradient: 'bg-gradient-to-r from-green-50 to-green-100',
  },
  {
    title: 'Reverse GST Calculator',
    description: 'Enter a GST-inclusive price and extract the original base amount and tax breakdown.',
    icon: <Divide size={22} />,
    to: '/gst/reverse-calculator',
    badge: 'Offline',
    badgeColor: 'green' as const,
    gradient: 'bg-gradient-to-r from-emerald-50 to-emerald-100',
  },
  {
    title: 'GST State Finder',
    description: 'Identify the state/UT from any 2-digit GST state code or full GSTIN.',
    icon: <MapPin size={22} />,
    to: '/gst/state-finder',
    badge: 'Offline',
    badgeColor: 'green' as const,
    gradient: 'bg-gradient-to-r from-orange-50 to-orange-100',
  },
  {
    title: 'HSN Code Search',
    description: 'Find HSN codes for goods by code or keyword, with GST rates and quick calculator.',
    icon: <BookOpen size={22} />,
    to: '/gst/hsn-search',
    badge: 'Offline',
    badgeColor: 'green' as const,
    gradient: 'bg-gradient-to-r from-pink-50 to-pink-100',
  },
  {
    title: 'SAC Code Search',
    description: 'Search Service Accounting Codes by code number or service description.',
    icon: <FileText size={22} />,
    to: '/gst/sac-search',
    badge: 'Offline',
    badgeColor: 'green' as const,
    gradient: 'bg-gradient-to-r from-rose-50 to-rose-100',
  },
  {
    title: 'GST Rate Finder',
    description: 'Find the applicable GST rate for any product (HSN) or service (SAC) by code or name.',
    icon: <Tag size={22} />,
    to: '/gst/rate-finder',
    badge: 'Offline',
    badgeColor: 'green' as const,
    gradient: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
  },
]

const BENEFITS = [
  {
    icon: <Zap size={20} className="text-[#2563EB]" />,
    title: 'Instant Results',
    desc: 'All offline tools work immediately — no waiting, no server calls.',
  },
  {
    icon: <Lock size={20} className="text-[#16A34A]" />,
    title: 'No Login Required',
    desc: 'Use every tool without creating an account.',
  },
  {
    icon: <Globe size={20} className="text-[#D97706]" />,
    title: 'Live GSTN Verification',
    desc: 'GSTIN search and verification connect to the official GSTN portal.',
  },
  {
    icon: <CheckCircle size={20} className="text-[#7C3AED]" />,
    title: 'CBIC Compliant',
    desc: 'Rates based on official CBIC GST notifications.',
  },
]

const HUB_FAQS = [
  {
    q: 'What is a GSTIN?',
    a: 'GSTIN (Goods and Services Tax Identification Number) is a unique 15-character alphanumeric identifier assigned to every GST-registered business in India. It encodes the state code, PAN, entity number, and a check digit.',
  },
  {
    q: 'What is the difference between CGST, SGST, and IGST?',
    a: 'For intra-state (within the same state) transactions, GST is split equally into CGST (Central GST) and SGST (State GST). For inter-state transactions, only IGST (Integrated GST) applies, which is collected by the Centre and shared with states.',
  },
  {
    q: 'What is an HSN code?',
    a: 'HSN (Harmonised System of Nomenclature) codes are internationally standardised 6- or 8-digit codes used to classify goods under GST. Indian sellers with turnover above ₹5 crore must mention 6-digit HSN codes on invoices.',
  },
  {
    q: 'What is a SAC code?',
    a: 'SAC (Service Accounting Code) is a system used to classify services under GST, similar to HSN for goods. Each service category has a unique SAC and a corresponding GST rate.',
  },
  {
    q: 'Are these GST tools free?',
    a: 'Yes, all GST tools on EcomSathi are completely free. Most tools work fully offline in your browser. GSTIN live verification uses our secure backend to call the GSTN portal without exposing any API keys.',
  },
  {
    q: 'How accurate are the GST rates shown?',
    a: "GST rates shown are based on official CBIC notifications. However, rates can change with GST Council decisions. Always confirm with a CA or check the official CBIC website for the most current rates before filing returns.",
  },
]

const RELATED_LINKS = [
  { label: 'SKU Generator', to: '/tools/sku/generator' },
  { label: 'Barcode Generator', to: '/tools/sku/barcode' },
  { label: 'Label Generator', to: '/tools/sku/label' },
  { label: 'Invoice PDF Tools', to: '/tools/pdf/merge' },
]

export default function GSTHub() {
  return (
    <>
      <SEO
        title="GST Tools for Ecommerce Sellers & Businesses | EcomSathi"
        description="Free GST tools including GST verification, GST calculators, HSN lookup, SAC search, GST rate finder and more. Made for Indian ecommerce sellers."
        keywords="GST tools, GST calculator, GSTIN verification, HSN code search, SAC code, GST rate finder, free GST tools India"
        canonicalUrl={`${SITE_URL}/gst`}
        schema={HUB_SCHEMA}
      />

      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <CheckCircle size={14} />
              Free · No login required · CBIC compliant
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
              GST Tools for Ecommerce<br className="hidden sm:block" /> Sellers &amp; Businesses
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
              Access free GST tools including GST verification, GST calculators, HSN lookup,
              SAC search, GST rate finder and more — all in one place.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-green-400" /> Offline tools
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-blue-300" /> Live GSTN verify
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-yellow-300" /> No API key needed
              </span>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          {/* Tools Grid */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#0F172A]">All GST Tools</h2>
              <p className="text-[#475569] mt-2">
                Everything you need to handle GST as an Indian ecommerce seller
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TOOLS.map(tool => (
                <GSTToolCard key={tool.to} {...tool} />
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section>
            <h2 className="text-2xl font-bold text-[#0F172A] text-center mb-8">Why Use EcomSathi GST Tools?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFITS.map((b, i) => (
                <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-5 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#F8FAFC] mb-3">
                    {b.icon}
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A] mb-1">{b.title}</h3>
                  <p className="text-xs text-[#64748B]">{b.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <GSTFAQ faqs={HUB_FAQS} title="GST Tools — Frequently Asked Questions" />

          {/* Related Tools */}
          <section>
            <h2 className="text-xl font-bold text-[#0F172A] mb-5">Related Ecommerce Tools</h2>
            <div className="flex flex-wrap gap-3">
              {RELATED_LINKS.map(r => (
                <Link
                  key={r.to}
                  to={r.to}
                  className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm text-[#374151] hover:bg-[#EFF6FF] hover:text-[#2563EB] hover:border-[#BFDBFE] transition-colors"
                >
                  {r.label} →
                </Link>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <p className="text-center text-xs text-[#94A3B8]">
            GST data is based on official CBIC notifications. Rates are indicative — always verify with your CA for specific transactions.
          </p>
        </div>
      </div>
    </>
  )
}
