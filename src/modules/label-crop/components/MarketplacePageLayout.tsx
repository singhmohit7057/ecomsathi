import React from 'react';
import { CheckCircle2, Printer, Archive, Image } from 'lucide-react';
import SEO from '@/components/common/SEO';
import { LabelBreadcrumb } from './LabelBreadcrumb';
import { MarketplaceLabelTool } from './MarketplaceLabelTool';
import { LabelFAQ } from './LabelFAQ';
import { LOGO_PATHS } from './MarketplaceLogos';
import type { MarketplaceInfo } from '../types';

interface Props { info: MarketplaceInfo }

export const MarketplacePageLayout: React.FC<Props> = ({ info }) => {
  const {
    slug, name, h1, description,
    seoTitle, seoDescription, seoKeywords,
    features, hasInvoice, color, bgColor, faqs,
  } = info;

  const canonicalUrl = `https://ecomsathi.vercel.app/label-crop/${slug}`;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: `${name} Shipping Label Crop Tool`,
        description: seoDescription,
        url: canonicalUrl,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        featureList: features,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',             item: 'https://ecomsathi.vercel.app' },
          { '@type': 'ListItem', position: 2, name: 'Label Crop',       item: 'https://ecomsathi.vercel.app/label-crop' },
          { '@type': 'ListItem', position: 3, name: `${name} Label Crop`, item: canonicalUrl },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(({ q, a }) => ({
          '@type': 'Question', name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl={canonicalUrl}
        schema={schema}
      />

      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <LabelBreadcrumb
          crumbs={[
            { label: 'Label Crop', to: '/label-crop' },
            { label: `${name} Label Crop` },
          ]}
        />

        {/* ── Hero header ─────────────────────────────────────────────── */}
        <div
          className="rounded-[12px] border border-[#E2E8F0] p-6 shadow-sm overflow-hidden relative"
          style={{ background: `linear-gradient(135deg, ${bgColor} 0%, #ffffff 60%)` }}
        >
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Logo */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[12px] bg-white shadow ring-1 ring-[#E2E8F0] p-2">
              <img
                src={LOGO_PATHS[slug]}
                alt={`${name} logo`}
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">{h1}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2.5 py-0.5 text-xs font-semibold text-[#16A34A] ring-1 ring-inset ring-[#BBF7D0]">
                  <CheckCircle2 size={11} /> Free
                </span>
                <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-semibold text-[#2563EB] ring-1 ring-inset ring-[#BFDBFE]">
                  No login
                </span>
                {hasInvoice && (
                  <span className="inline-flex items-center rounded-full bg-[#FFFBEB] px-2.5 py-0.5 text-xs font-semibold text-[#D97706] ring-1 ring-inset ring-[#FDE68A]">
                    + Invoice extraction
                  </span>
                )}
              </div>
              <p className="text-sm text-[#475569] sm:text-[15px] leading-relaxed">{description}</p>

              {/* Output format chips */}
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { icon: <Printer size={11} />, label: 'Thermal 4×6' },
                  { icon: <Printer size={11} />, label: 'A4 (4/page)' },
                  { icon: <Archive size={11} />, label: 'ZIP export' },
                  { icon: <Image  size={11} />, label: 'PNG export' },
                ].map(chip => (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium border border-[#E2E8F0] bg-white text-[#475569]"
                  >
                    {chip.icon} {chip.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Feature chips row */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/60">
            {features.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{ backgroundColor: bgColor, color }}
              >
                <CheckCircle2 size={10} /> {f}
              </span>
            ))}
          </div>
        </div>

        {/* ── Tool widget — full width ──────────────────────────────────── */}
        <MarketplaceLabelTool
          slug={slug}
          marketplaceName={name}
          hasInvoice={hasInvoice}
        />

        {/* FAQ */}
        <LabelFAQ faqs={faqs} marketplaceName={name} />
      </div>
    </>
  );
};

export default MarketplacePageLayout;
