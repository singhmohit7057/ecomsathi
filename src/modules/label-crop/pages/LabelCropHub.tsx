import React from 'react';
import { Link } from 'react-router-dom';
import {
  Scissors,
  CheckCircle2,
  Zap,
  Shield,
  Download,
  Layers,
  Printer,
  ChevronRight,
  Home,
} from 'lucide-react';
import SEO from '../../../components/common/SEO';
import { MarketplaceCard } from '../components/MarketplaceCard';
import { ALL_MARKETPLACES } from '../platforms/marketplaceMeta';

const FEATURES = [
  {
    icon: <Zap size={20} className="text-[#2563EB]" />,
    title: 'Instant Crop',
    description: 'Upload your PDF or image and get a print-ready label in seconds. No waiting, no queues.',
  },
  {
    icon: <Shield size={20} className="text-[#16A34A]" />,
    title: '100% Private',
    description: 'All processing happens in your browser. Your files are never uploaded to any server.',
  },
  {
    icon: <Printer size={20} className="text-[#7C3AED]" />,
    title: 'Thermal & A4',
    description: 'Export labels as thermal 4×6 (100×150 mm) or A4 with 4 labels per page.',
  },
  {
    icon: <Layers size={20} className="text-[#EA580C]" />,
    title: 'Batch Processing',
    description: 'Process hundreds of orders at once and download all labels as a single ZIP file.',
  },
  {
    icon: <Download size={20} className="text-[#0891B2]" />,
    title: 'PDF & PNG Export',
    description: 'Download cropped labels as PDF for printing or PNG for archiving and previews.',
  },
  {
    icon: <CheckCircle2 size={20} className="text-[#D97706]" />,
    title: 'No Login Required',
    description: 'Completely free forever. No account, no sign-up, no watermarks.',
  },
];

const HUB_FAQS = [
  {
    q: 'What is a label crop tool?',
    a: 'A label crop tool extracts the shipping label region from a marketplace order PDF, removing the invoice and blank areas, so you get a clean print-ready label for thermal or A4 printers.',
  },
  {
    q: 'Which marketplaces are supported?',
    a: 'Amazon, Flipkart, Myntra, Meesho, AJIO, Nykaa, and Snapdeal. Each tool is calibrated with the exact crop coordinates for that marketplace\'s label format.',
  },
  {
    q: 'Is this tool free?',
    a: 'Yes. All label crop tools on EcomSathi are completely free, require no login, and will remain free forever.',
  },
  {
    q: 'Does the tool support batch processing?',
    a: 'Yes. Every marketplace tool supports single file and batch (multi-file) modes. In batch mode you can download all cropped labels as a single ZIP archive.',
  },
  {
    q: 'Are my files uploaded to a server?',
    a: 'No. All processing runs entirely in your browser using PDF.js and pdf-lib. Your files never leave your device.',
  },
  {
    q: 'What input formats are supported?',
    a: 'PDF, PNG, JPG, and JPEG files are all accepted. PDF is recommended since marketplace label PDFs contain all pages in one file.',
  },
  {
    q: 'What output formats are available?',
    a: 'You can download cropped labels as PDF (thermal 100×150 mm or A4 4-up) or as individual PNG images.',
  },
];

export const LabelCropHub: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'Marketplace Shipping Label Crop Tools',
        description: 'Crop and optimize shipping labels for Amazon, Flipkart, Myntra, Meesho, AJIO, Nykaa and Snapdeal.',
        url: 'https://ecomsathi.vercel.app/label-crop',
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ecomsathi.vercel.app' },
            { '@type': 'ListItem', position: 2, name: 'Label Crop', item: 'https://ecomsathi.vercel.app/label-crop' },
          ],
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: HUB_FAQS.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };

  return (
    <>
      <SEO
        title="Marketplace Shipping Label Crop Tools — Amazon, Flipkart, Myntra & More"
        description="Crop and optimize shipping labels for Amazon, Flipkart, Myntra, Meesho, AJIO, Nykaa and Snapdeal. Generate A4 and thermal printer ready labels instantly. Free, no login."
        keywords="label crop tool, shipping label crop, amazon label crop, flipkart label crop, thermal label, A4 label, ecommerce label tool"
        canonicalUrl="https://ecomsathi.vercel.app/label-crop"
        schema={schema}
      />

      <div className="flex flex-col gap-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-sm text-[#64748B]">
          <Link to="/" className="flex items-center gap-1 hover:text-[#0F172A] transition-colors">
            <Home size={13} />
          </Link>
          <ChevronRight size={13} className="shrink-0 text-[#CBD5E1]" />
          <span className="font-medium text-[#0F172A]">Label Crop</span>
        </nav>

        {/* Hero */}
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[8px] bg-[#EFF6FF] text-[#2563EB]">
              <Scissors size={28} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">
                  Marketplace Shipping Label Crop Tools
                </h1>
              </div>
              <p className="text-[#475569] text-sm sm:text-base max-w-2xl">
                Crop and optimize shipping labels for Amazon, Flipkart, Myntra, Meesho, AJIO, Nykaa and Snapdeal.
                Generate A4 and thermal printer ready labels instantly — free, no login required.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-xs font-medium text-[#16A34A] ring-1 ring-inset ring-[#BBF7D0]">
                  <CheckCircle2 size={11} /> No login required
                </span>
                <span className="inline-flex items-center rounded-full bg-[#FFFBEB] px-2.5 py-1 text-xs font-medium text-[#D97706]">
                  Free forever
                </span>
                <span className="inline-flex items-center rounded-full bg-[#F0F9FF] px-2.5 py-1 text-xs font-medium text-[#0891B2]">
                  Browser-only processing
                </span>
                <span className="inline-flex items-center rounded-full bg-[#F5F3FF] px-2.5 py-1 text-xs font-medium text-[#7C3AED]">
                  7 marketplaces
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Marketplace Cards */}
        <section>
          <h2 className="text-lg font-bold text-[#0F172A] mb-4">Select Your Marketplace</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ALL_MARKETPLACES.map((mp) => (
              <MarketplaceCard key={mp.slug} marketplace={mp} />
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0F172A] mb-5">Why Use EcomSathi Label Crop?</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => (
              <div key={feat.title} className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-[#F8FAFC]">
                  {feat.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{feat.title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Supported Platforms */}
        <section className="rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-6">
          <h2 className="text-lg font-bold text-[#0F172A] mb-4">Supported Platforms</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {ALL_MARKETPLACES.map((mp) => (
              <Link
                key={mp.slug}
                to={`/label-crop/${mp.slug}`}
                className="flex flex-col items-center gap-2 rounded-[8px] border border-[#E2E8F0] bg-white p-3 text-center transition-all hover:border-[#93C5FD] hover:shadow-sm group"
              >
                <span className="text-2xl">{mp.emoji}</span>
                <span className="text-xs font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                  {mp.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[#0F172A]">Frequently Asked Questions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {HUB_FAQS.map(({ q, a }) => (
              <div key={q} className="rounded-[6px] border border-[#F1F5F9] bg-[#F8FAFC] p-4">
                <p className="text-sm font-semibold text-[#0F172A] mb-1">{q}</p>
                <p className="text-xs text-[#475569] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Tools */}
        <section className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-base font-semibold text-[#0F172A]">Related Ecommerce Tools</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { label: 'Label Generator',   to: '/tools/label-generator',    emoji: '🏷️' },
              { label: 'Label Printer',      to: '/tools/label-printer',      emoji: '🖨️' },
              { label: 'Barcode Generator',  to: '/tools/barcode',            emoji: '📊' },
              { label: 'Merge PDF',          to: '/tools/pdf-merge',          emoji: '📄' },
              { label: 'Compress PDF',       to: '/tools/pdf-compress',       emoji: '🗜️' },
              { label: 'PDF to Images',      to: '/tools/pdf-to-images',      emoji: '🖼️' },
              { label: 'GST Calculator',     to: '/tools/gst-calculator',     emoji: '🧮' },
              { label: 'Single SKU',         to: '/tools/sku-generator',      emoji: '🔢' },
            ].map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="flex items-center gap-2 rounded-[6px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-xs font-medium text-[#475569] hover:border-[#93C5FD] hover:text-[#2563EB] transition-all group"
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default LabelCropHub;
