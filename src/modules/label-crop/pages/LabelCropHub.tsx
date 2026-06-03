import React from 'react';
import { Link } from 'react-router-dom';
import {
  Scissors, CheckCircle2, Zap, Shield, Download,
  Layers, Printer, ChevronRight, ArrowRight,
} from 'lucide-react';
import SEO from '@/components/common/SEO';
import { ALL_MARKETPLACES } from '../platforms/marketplaceMeta';
import { MarketplaceLogo } from '../components/MarketplaceLogos';
import { MarketplaceCard } from '../components/MarketplaceCard';

// ── FAQ ─────────────────────────────────────────────────────────────────────
const HUB_FAQS = [
  { q: 'What is a label crop tool?',         a: 'A label crop tool extracts the shipping label region from a marketplace order PDF, removing the invoice and blank areas so you get a clean print-ready label for thermal or A4 printers.' },
  { q: 'Which marketplaces are supported?',  a: 'Amazon, Flipkart, Shopsy, Myntra, Meesho, AJIO, Nykaa and Snapdeal. Each tool is calibrated with exact crop coordinates for that marketplace\'s label format.' },
  { q: 'Is this tool free?',                 a: 'Yes — completely free, no login required, and no watermarks. It will remain free forever.' },
  { q: 'Does it support batch processing?',  a: 'Yes. Every tool supports single and batch modes. In batch mode all cropped labels can be downloaded as one ZIP archive.' },
  { q: 'Are my files uploaded to a server?', a: 'No. All processing runs in your browser using PDF.js and pdf-lib. Your files never leave your device.' },
  { q: 'What input formats are accepted?',   a: 'PDF, PNG, JPG and JPEG. PDF is recommended since marketplace label PDFs contain all order pages in one file.' },
  { q: 'What output formats are available?', a: 'PDF (thermal 100×150 mm one-per-page, or A4 4-up) and PNG for individual label images.' },
];

const FEATURES = [
  { icon: <Zap size={18} />,        color: '#2563EB', bg: '#EFF6FF', title: 'Instant Crop',       desc: 'Get a print-ready label in seconds — no queue, no server.' },
  { icon: <Shield size={18} />,     color: '#16A34A', bg: '#F0FDF4', title: '100% Private',       desc: 'All processing in your browser. Files never leave your device.' },
  { icon: <Printer size={18} />,    color: '#7C3AED', bg: '#F5F3FF', title: 'Thermal & A4',       desc: 'Thermal 4×6 (100×150 mm) or A4 with 4 labels per page.' },
  { icon: <Layers size={18} />,     color: '#EA580C', bg: '#FFF7ED', title: 'Batch Processing',   desc: 'Process hundreds of orders and download all as one ZIP.' },
  { icon: <Download size={18} />,   color: '#0891B2', bg: '#F0F9FF', title: 'PDF & PNG Export',   desc: 'Download as PDF for printing or PNG for archiving.' },
  { icon: <CheckCircle2 size={18}/>, color: '#D97706', bg: '#FFFBEB', title: 'No Login Required', desc: 'Free forever. No account, no sign-up, no watermarks.' },
];

// ── FAQ accordion ────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-[#F1F5F9] last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-3.5 text-left"
      >
        <span className="text-sm font-medium text-[#0F172A]">{q}</span>
        <ChevronRight
          size={15}
          className={`shrink-0 text-[#94A3B8] transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        />
      </button>
      {open && <p className="pb-3.5 text-sm text-[#475569] leading-relaxed">{a}</p>}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export const LabelCropHub: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'Marketplace Shipping Label Crop Tools',
        description: 'Crop and optimize shipping labels for Amazon, Flipkart, Myntra, Meesho, AJIO, Nykaa, Snapdeal and Shopsy.',
        url: 'https://ecomsathi.vercel.app/label-crop',
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home',       item: 'https://ecomsathi.vercel.app' },
            { '@type': 'ListItem', position: 2, name: 'Label Crop', item: 'https://ecomsathi.vercel.app/label-crop' },
          ],
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: HUB_FAQS.map(({ q, a }) => ({
          '@type': 'Question', name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };

  return (
    <>
      <SEO
        title="Marketplace Shipping Label Crop Tools — Amazon, Flipkart, Myntra & More"
        description="Crop and optimize shipping labels for Amazon, Flipkart, Myntra, Meesho, AJIO, Nykaa, Shopsy and Snapdeal. Generate A4 and thermal printer ready labels instantly. Free, no login."
        keywords="label crop tool, shipping label crop, amazon label crop, flipkart label crop, thermal label, A4 label, ecommerce label tool"
        canonicalUrl="https://ecomsathi.vercel.app/label-crop"
        schema={schema}
      />

      <div className="flex flex-col gap-8">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-sm text-[#64748B]">
          <Link to="/" className="hover:text-[#0F172A] transition-colors">Home</Link>
          <ChevronRight size={13} className="text-[#CBD5E1]" />
          <span className="font-medium text-[#0F172A]">Label Crop</span>
        </nav>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div className="rounded-[12px] border border-[#E2E8F0] bg-gradient-to-br from-[#EFF6FF] via-white to-[#F0FDF4] p-8 shadow-sm overflow-hidden relative">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-[#DBEAFE] opacity-30" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-[#BBF7D0] opacity-25" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[14px] bg-white shadow-md ring-1 ring-[#E2E8F0] text-[#2563EB]">
              <Scissors size={42} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] leading-tight">
                Marketplace Shipping<br className="hidden sm:block" /> Label Crop Tools
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#475569] max-w-xl">
                Crop and download print-ready shipping labels from Amazon, Flipkart, Myntra, Meesho, AJIO, Nykaa, Shopsy and Snapdeal PDFs — free, instant, browser-only.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  { label: '✓ No login',             cls: 'bg-[#F0FDF4] text-[#16A34A] ring-[#BBF7D0]' },
                  { label: '✓ Free forever',          cls: 'bg-[#FFFBEB] text-[#D97706] ring-[#FDE68A]' },
                  { label: '✓ Browser-only',          cls: 'bg-[#F0F9FF] text-[#0891B2] ring-[#BAE6FD]' },
                  { label: '✓ 8 marketplaces',        cls: 'bg-[#F5F3FF] text-[#7C3AED] ring-[#DDD6FE]' },
                  { label: '✓ PDF + PNG + ZIP',        cls: 'bg-[#FFF7ED] text-[#EA580C] ring-[#FED7AA]' },
                ].map(b => (
                  <span key={b.label} className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${b.cls}`}>
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Marketplace Cards ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0F172A]">Select Your Marketplace</h2>
            <span className="text-xs text-[#64748B]">{ALL_MARKETPLACES.length} platforms supported</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ALL_MARKETPLACES.map((mp) => (
              <MarketplaceCard key={mp.slug} marketplace={mp} />
            ))}
          </div>
        </section>

        {/* ── Supported Platforms (logo strip) ─────────────────────────── */}
        <section className="rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#0F172A] mb-5">Supported Platforms</h2>
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-8">
            {ALL_MARKETPLACES.map((mp) => (
              <Link
                key={mp.slug}
                to={`/label-crop/${mp.slug}`}
                title={`${mp.name} Label Crop`}
                className="group flex flex-col items-center gap-3 rounded-[12px] border border-[#F1F5F9] bg-[#F8FAFC] p-4 transition-all hover:border-[#93C5FD] hover:bg-[#EFF6FF] hover:shadow-sm"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-[12px] bg-white shadow-sm border border-[#E2E8F0] p-2">
                  <img
                    src={`${mp.slug === 'meesho' ? '/Meesho.png' : mp.slug === 'shopsy' ? '/Shopsy.jpg' : `/${mp.slug}.png`}`}
                    alt={`${mp.name} logo`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs font-semibold text-[#475569] group-hover:text-[#2563EB] transition-colors text-center leading-tight">
                  {mp.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────────── */}
        <section className="rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#0F172A] mb-5">How it works</h2>
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-4">
            {[
              { n: '1', title: 'Select Marketplace', desc: 'Pick Amazon, Flipkart, Myntra or any of the 8 supported platforms.' },
              { n: '2', title: 'Upload PDF / Image', desc: 'Drag and drop your order PDF, PNG or JPG — single or multiple files.' },
              { n: '3', title: 'Crop & Process',     desc: 'Click Crop Labels. Processing runs entirely in your browser.' },
              { n: '4', title: 'Download',            desc: 'Download thermal, A4, or ZIP with all your cropped labels.' },
            ].map((step, i) => (
              <div key={step.n} className="relative flex sm:flex-col items-start sm:items-center gap-4 sm:gap-2 sm:text-center p-4">
                {/* connector line */}
                {i < 3 && (
                  <div className="hidden sm:block absolute top-[28px] left-[calc(50%+20px)] w-[calc(100%-40px)] h-[2px] bg-[#E2E8F0]" />
                )}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white text-sm font-bold z-10">
                  {step.n}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{step.title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features grid ─────────────────────────────────────────────── */}
        <section className="rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#0F172A] mb-5">Why Use EcomSathi Label Crop?</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-3 rounded-[8px] border border-[#F1F5F9] bg-[#FAFAFA] p-4">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px]"
                  style={{ backgroundColor: f.bg, color: f.color }}
                >
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section className="rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#0F172A] mb-2">Frequently Asked Questions</h2>
          <div className="divide-y divide-[#F1F5F9]">
            {HUB_FAQS.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
          </div>
        </section>

        {/* ── Related Ecommerce Tools ───────────────────────────────────── */}
        <section className="rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#0F172A] mb-4">Related Ecommerce Tools</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { label: 'Label Generator',  to: '/tools/label-generator',  emoji: '🏷️' },
              { label: 'Label Printer',    to: '/tools/label-printer',    emoji: '🖨️' },
              { label: 'Barcode Generator',to: '/tools/barcode',          emoji: '📊' },
              { label: 'Merge PDF',        to: '/tools/pdf-merge',        emoji: '📄' },
              { label: 'Compress PDF',     to: '/tools/pdf-compress',     emoji: '🗜️' },
              { label: 'PDF to Images',    to: '/tools/pdf-to-images',    emoji: '🖼️' },
              { label: 'GST Calculator',   to: '/tools/gst-calculator',   emoji: '🧮' },
              { label: 'SKU Generator',    to: '/tools/sku-generator',    emoji: '🔢' },
            ].map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="flex items-center gap-2 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-xs font-medium text-[#475569] hover:border-[#93C5FD] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-all group"
              >
                <span className="text-base">{t.emoji}</span>
                <span className="flex-1">{t.label}</span>
                <ArrowRight size={12} className="text-[#CBD5E1] group-hover:text-[#2563EB]" />
              </Link>
            ))}
          </div>
        </section>

      </div>
    </>
  );
};

export default LabelCropHub;
