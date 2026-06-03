import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import SEO from '../../../components/common/SEO';
import { LabelBreadcrumb } from './LabelBreadcrumb';
import { MarketplaceLabelTool } from './MarketplaceLabelTool';
import { LabelFAQ } from './LabelFAQ';
import { RelatedLabelTools } from './RelatedLabelTools';
import type { MarketplaceInfo } from '../types';

interface MarketplacePageLayoutProps {
  info: MarketplaceInfo;
}

export const MarketplacePageLayout: React.FC<MarketplacePageLayoutProps> = ({ info }) => {
  const {
    slug,
    name,
    emoji,
    h1,
    description,
    seoTitle,
    seoDescription,
    seoKeywords,
    features,
    hasInvoice,
    color,
    bgColor,
    faqs,
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
          { '@type': 'ListItem', position: 1, name: 'Home',       item: 'https://ecomsathi.vercel.app' },
          { '@type': 'ListItem', position: 2, name: 'Label Crop', item: 'https://ecomsathi.vercel.app/label-crop' },
          { '@type': 'ListItem', position: 3, name: `${name} Label Crop`, item: canonicalUrl },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(({ q, a }) => ({
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

        {/* Tool header */}
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div
              className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[8px] text-3xl"
              style={{ backgroundColor: bgColor }}
            >
              {emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-xl font-bold text-[#0F172A] sm:text-2xl">{h1}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2.5 py-0.5 text-xs font-medium text-[#16A34A] ring-1 ring-inset ring-[#BBF7D0]">
                  <CheckCircle2 size={11} /> Free
                </span>
                <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-medium text-[#2563EB]">
                  No login
                </span>
              </div>
              <p className="text-sm text-[#475569] sm:text-base">{description}</p>

              {/* Feature chips */}
              <div className="flex flex-wrap gap-2 mt-3">
                {features.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: bgColor, color }}
                  >
                    <CheckCircle2 size={10} />
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout on large screens */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Main tool */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <MarketplaceLabelTool
              slug={slug}
              marketplaceName={name}
              hasInvoice={hasInvoice}
            />
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4 w-full lg:w-64 xl:w-72 shrink-0">
            <RelatedLabelTools currentSlug={slug} />

            {/* Print tips */}
            <div className="rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wide">Print Tips</h3>
              <ul className="flex flex-col gap-1.5 text-xs text-[#475569]">
                <li>• Select <strong>Thermal</strong> for 100×150 mm (4×6") direct thermal printers</li>
                <li>• Select <strong>A4</strong> for desktop inkjet/laser — 4 labels per sheet</li>
                <li>• Use <strong>PNG</strong> output for high-res archiving or preview images</li>
                <li>• Enable <strong>ZIP download</strong> for batches of 5+ orders</li>
              </ul>
            </div>
          </aside>
        </div>

        {/* FAQ */}
        <LabelFAQ faqs={faqs} marketplaceName={name} />
      </div>
    </>
  );
};

export default MarketplacePageLayout;
