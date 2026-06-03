import { Link } from 'react-router-dom'
import {
  ArrowRight, Zap, UserX, Repeat2, Store, Cpu, ShieldCheck,
  Smartphone, FileType2, Image, Film, Calculator, Tag, Scissors,
  Check,
} from 'lucide-react'
import SEO from '@/components/common/SEO'
import ToolCategorySection from '../components/ToolCategorySection'
import FAQSection from '../components/FAQSection'
import CTASection from '../components/CTASection'
import { TOOL_CATEGORIES, FAQ_ITEMS } from '../data/toolCategories'

// ── JSON-LD ──────────────────────────────────────────────────────────────────

const SITE_URL = 'https://ecomsathi.vercel.app'

const combinedSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Free Tools', item: `${SITE_URL}/tools` },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
    {
      '@type': 'ItemList',
      name: 'Free Ecommerce Tools by EcomSathi',
      url: `${SITE_URL}/tools`,
      numberOfItems: 35,
      itemListElement: TOOL_CATEGORIES.flatMap((cat, ci) =>
        cat.tools.map((tool, ti) => ({
          '@type': 'ListItem',
          position: ci * 6 + ti + 1,
          name: tool.name,
          url: `${SITE_URL}${tool.path}`,
        }))
      ),
    },
  ],
}

// ── Category nav ─────────────────────────────────────────────────────────────

const CAT_NAV = [
  { id: 'pdf',   label: 'PDF',   icon: FileType2,  color: '#2563EB', bg: '#EFF6FF' },
  { id: 'image', label: 'Image', icon: Image,      color: '#16A34A', bg: '#F0FDF4' },
  { id: 'video', label: 'Video', icon: Film,       color: '#E11D48', bg: '#FFF1F2' },
  { id: 'gst',   label: 'GST',   icon: Calculator, color: '#0891B2', bg: '#ECFEFF' },
  { id: 'sku',   label: 'SKU',   icon: Tag,        color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'label', label: 'Label Crop', icon: Scissors, color: '#D97706', bg: '#FFFBEB' },
]

// ── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white border-b border-[#E2E8F0]">
      {/* Gradient bar at top */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #2563EB, #0891B2, #16A34A)' }} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Left */}
          <div>
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <li><Link to="/" className="hover:text-[#2563EB] transition-colors">Home</Link></li>
                <li>/</li>
                <li className="text-[#64748B] font-medium">Free Tools</li>
              </ol>
            </nav>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] px-3 py-1 text-xs font-semibold text-[#2563EB] mb-4">
              <Zap size={11} />
              100% Free · No Account Needed
            </div>

            <h1 className="text-4xl font-bold text-[#0F172A] leading-tight mb-4 md:text-5xl" style={{ letterSpacing: '-0.5px' }}>
              Free Ecommerce<br />
              <span className="text-[#2563EB]">Tools for Sellers</span>
            </h1>

            <p className="text-[#475569] text-base leading-relaxed mb-6 max-w-lg">
              PDF tools, image tools, video tools, GST calculators, SKU generators, and marketplace label crop — all free, no login required.
            </p>

            {/* Feature checklist */}
            <ul className="space-y-2 mb-7">
              {[
                'Merge, split, compress & OCR PDFs',
                'Remove backgrounds & optimize product images',
                'GST calculator, GSTIN verify & HSN search',
                'Auto-crop labels for 7 Indian marketplaces',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-[#334155]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#DCFCE7] flex-shrink-0">
                    <Check size={11} className="text-[#16A34A]" strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <a
                href="#tool-categories"
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-[#1E293B_3px_3px_0px_0px] transition-all hover:bg-[#1D4ED8] hover:shadow-[#1E293B_1px_1px_0px_0px]"
              >
                Explore Tools <ArrowRight size={15} />
              </a>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-5 py-2.5 text-sm font-semibold text-[#0F172A] shadow-[#E2E8F0_2px_2px_0px_0px] transition-all hover:border-[#CBD5E1] hover:shadow-none"
              >
                Get Started Free
              </Link>
            </div>
          </div>

          {/* Right — category pill grid */}
          <div className="hidden lg:grid grid-cols-2 gap-3">
            {CAT_NAV.map((cat) => {
              const Icon = cat.icon
              const href = cat.id === 'label' ? '/label-crop' : `/tools/${cat.id}`
              return (
                <Link
                  key={cat.id}
                  to={href}
                  className="group flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 transition-all hover:border-[#CBD5E1] hover:bg-white hover:shadow-md"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-[10px] flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: cat.bg, color: cat.color }}
                  >
                    <Icon size={19} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">{cat.label} Tools</p>
                    <p className="text-[11px] text-[#94A3B8]">View all →</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-10 pt-8 border-t border-[#F1F5F9] grid grid-cols-3 gap-4 max-w-lg">
          {[
            { value: '50+', label: 'Free Tools' },
            { value: '6',   label: 'Categories' },
            { value: '7',   label: 'Marketplaces' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-[#0F172A]">{s.value}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Category jump nav ─────────────────────────────────────────────────────────

function CategoryNav() {
  return (
    <div className="sticky top-[71px] z-30 bg-white border-b border-[#E2E8F0] shadow-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-hide">
          {CAT_NAV.map((cat) => {
            const Icon = cat.icon
            const href = `#cat-${cat.id}`
            return (
              <a
                key={cat.id}
                href={href}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#475569] transition-all hover:border-current hover:text-[inherit]"
                style={{ '--hover-color': cat.color } as React.CSSProperties}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.borderColor = cat.color
                  el.style.color = cat.color
                  el.style.backgroundColor = cat.bg
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.borderColor = ''
                  el.style.color = ''
                  el.style.backgroundColor = ''
                }}
              >
                <Icon size={13} />
                {cat.label}
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Why section ───────────────────────────────────────────────────────────────

const WHY_ITEMS = [
  { icon: UserX,       title: 'No Login Required',          desc: 'Start instantly — no sign-up for most tools.' },
  { icon: Repeat2,     title: 'Free Forever',               desc: '100% free with no hidden charges.' },
  { icon: Store,       title: 'Built For Sellers',          desc: 'Purpose-built for Amazon, Flipkart & more.' },
  { icon: Cpu,         title: 'Fast Processing',            desc: 'Client-side processing for instant results.' },
  { icon: ShieldCheck, title: 'Secure File Handling',       desc: 'Files never stored after processing.' },
  { icon: Smartphone,  title: 'Mobile Friendly',            desc: 'Fully responsive on any device.' },
]

function WhySection() {
  return (
    <section className="bg-white py-12 border-t border-[#F1F5F9]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Why EcomSathi?</h2>
            <p className="text-sm text-[#64748B] mt-1">Built to help Indian ecommerce sellers work faster</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {WHY_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="flex flex-col items-center text-center gap-2 p-4 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] hover:border-[#E2E8F0] hover:bg-white transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF6FF]">
                  <Icon size={17} className="text-[#2563EB]" strokeWidth={1.8} />
                </div>
                <p className="text-xs font-bold text-[#0F172A] leading-snug">{item.title}</p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ToolsHub() {
  return (
    <>
      <SEO
        title="Free Ecommerce Tools | PDF, Image, Video, GST, SKU & Label Tools"
        description="Access free ecommerce tools including PDF tools, image tools, video tools, GST calculators, SKU generators and marketplace label crop tools."
        keywords="free ecommerce tools, PDF tools online, image tools, GST calculator, SKU generator, label crop, Amazon label crop, Flipkart label crop, ecommerce seller tools India"
        canonicalUrl="https://ecomsathi.vercel.app/tools"
        schema={combinedSchema}
      />

      <HeroSection />
      <CategoryNav />

      {/* Tool categories */}
      <div id="tool-categories" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-5">
        {TOOL_CATEGORIES.map((category) => (
          <ToolCategorySection key={category.id} category={category} />
        ))}
      </div>

      {/* Why + FAQ + CTA */}
      <WhySection />
      <FAQSection />
      <CTASection />
    </>
  )
}
