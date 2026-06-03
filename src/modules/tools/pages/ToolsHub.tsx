import { Link } from 'react-router-dom'
import { ArrowRight, Zap, UserX, Repeat2, Store, Cpu, ShieldCheck, Smartphone } from 'lucide-react'
import SEO from '@/components/common/SEO'
import ToolCategorySection from '../components/ToolCategorySection'
import MarketplaceBanner from '../components/MarketplaceBanner'
import FAQSection from '../components/FAQSection'
import CTASection from '../components/CTASection'
import { TOOL_CATEGORIES, FAQ_ITEMS } from '../data/toolCategories'

// ── JSON-LD Schemas ─────────────────────────────────────────────────────────

const SITE_URL = 'https://ecomsathi.vercel.app'

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Free Tools', item: `${SITE_URL}/tools` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
}

const toolCollectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Free Ecommerce Tools by EcomSathi',
  description: 'Free PDF tools, image tools, video tools, GST tools, SKU generators, and label crop tools for Indian ecommerce sellers.',
  url: `${SITE_URL}/tools`,
  numberOfItems: 35,
  itemListElement: TOOL_CATEGORIES.flatMap((cat, catIdx) =>
    cat.tools.map((tool, toolIdx) => ({
      '@type': 'ListItem',
      position: catIdx * 6 + toolIdx + 1,
      name: tool.name,
      url: `${SITE_URL}${tool.path}`,
    }))
  ),
}

const combinedSchema = {
  '@context': 'https://schema.org',
  '@graph': [breadcrumbSchema, faqSchema, toolCollectionSchema],
}

// ── Why EcomSathi ───────────────────────────────────────────────────────────

const WHY_CARDS = [
  { icon: UserX,      title: 'No Login Required',          desc: 'Start using tools immediately, no sign-up needed for most tools.' },
  { icon: Repeat2,    title: 'Free Forever',                desc: 'All listed tools are 100% free with no hidden charges.' },
  { icon: Store,      title: 'Built For Ecommerce Sellers', desc: 'Purpose-built for Indian marketplace sellers on Amazon, Flipkart & more.' },
  { icon: Cpu,        title: 'Fast Processing',             desc: 'Most tools process files client-side for instant results.' },
  { icon: ShieldCheck,title: 'Secure File Handling',        desc: 'Files are never stored on our servers after processing.' },
  { icon: Smartphone, title: 'Mobile Friendly',             desc: 'All tools are fully responsive and work on any device.' },
]

function WhyEcomSathi() {
  return (
    <section className="bg-[#F8FAFC] py-14" aria-labelledby="why-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 id="why-heading" className="text-2xl font-bold text-[#0F172A] md:text-3xl">
            Why Use EcomSathi?
          </h2>
          <p className="mt-2 text-sm text-[#64748B]">
            Built to help Indian ecommerce sellers work faster
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_CARDS.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                className="flex items-start gap-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[#E2E8F0_2px_2px_0px_0px]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#EFF6FF] text-[#2563EB]">
                  <Icon size={19} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A]">{card.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#64748B]">{card.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Hero ────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-[#E2E8F0] bg-gradient-to-br from-[#EFF6FF] via-white to-[#F0FDF4] py-16 md:py-24">
      {/* Dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: 'radial-gradient(circle, #94A3B8 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex justify-center">
          <ol className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <li><Link to="/" className="hover:text-[#2563EB]">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-[#64748B] font-medium">Free Tools</li>
          </ol>
        </nav>

        {/* Badge */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white/80 px-4 py-1.5 text-sm font-semibold text-[#2563EB] shadow-sm backdrop-blur-sm">
          <Zap size={13} />
          100% Free — No Account Required
        </div>

        {/* Heading */}
        <h1
          className="mb-4 text-4xl font-bold leading-tight text-[#0F172A] md:text-5xl lg:text-6xl"
          style={{ letterSpacing: '-1px' }}
        >
          Free Ecommerce Tools
        </h1>

        {/* Subheading */}
        <p className="mb-3 text-lg font-medium text-[#475569] md:text-xl">
          Everything you need to manage ecommerce operations, product content, labels, PDFs, GST tasks, and seller workflows.
        </p>

        {/* Description */}
        <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-[#64748B] md:text-base">
          Access free PDF tools, image tools, video tools, GST tools, SKU generators, and marketplace label crop tools without registration.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#tool-categories"
            className="inline-flex items-center gap-2 rounded-[4px] border border-[#2563EB] bg-[#2563EB] px-6 py-3 text-base font-semibold text-white shadow-[#1E293B_3px_3px_0px_0px] transition-all duration-150 hover:bg-[#1D4ED8] hover:shadow-[#1E293B_1px_1px_0px_0px]"
          >
            Explore Tools
            <ArrowRight size={17} />
          </a>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-[4px] border border-[#E2E8F0] bg-white px-6 py-3 text-base font-semibold text-[#0F172A] shadow-[#1E293B_2px_2px_0px_0px] transition-all duration-150 hover:bg-[#F8FAFC] hover:shadow-[#1E293B_1px_1px_0px_0px]"
          >
            Get Started
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
          {[
            { value: '35+', label: 'Free Tools' },
            { value: '6',   label: 'Tool Categories' },
            { value: '7',   label: 'Marketplaces Supported' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-2xl font-bold text-[#2563EB]">{stat.value}</span>
              <span className="text-xs font-medium text-[#64748B]">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

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

      {/* Tool category sections */}
      <div id="tool-categories">
        {TOOL_CATEGORIES.map((category) => (
          <ToolCategorySection key={category.id} category={category} />
        ))}
      </div>

      {/* Label Crop — unique section */}
      <MarketplaceBanner />

      {/* Supporting sections */}
      <WhyEcomSathi />
      <FAQSection />
      <CTASection />
    </>
  )
}
