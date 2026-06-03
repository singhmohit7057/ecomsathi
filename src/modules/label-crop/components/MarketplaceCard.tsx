import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { MarketplaceInfo } from '../types';
import { getMarketplaceLogo } from './MarketplaceLogos';

interface MarketplaceCardProps {
  marketplace: MarketplaceInfo;
}

export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ marketplace }) => {
  const { slug, name, tagline, features, hasInvoice, color } = marketplace;
  const Logo = getMarketplaceLogo(slug);

  return (
    <Link
      to={`/label-crop/${slug}`}
      className="group flex flex-col gap-4 rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all hover:border-[#93C5FD] hover:shadow-md"
      aria-label={`${name} Label Crop Tool`}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <Logo size={44} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
            {name} Label Crop
          </h3>
          <p className="text-xs text-[#64748B] leading-snug mt-0.5">{tagline}</p>
        </div>
      </div>

      {/* Features preview */}
      <ul className="flex flex-col gap-1">
        {features.slice(0, 3).map((f) => (
          <li key={f} className="flex items-center gap-1.5 text-xs text-[#475569]">
            <CheckCircle2 size={11} className="shrink-0" style={{ color }} />
            {f}
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          {hasInvoice && (
            <span className="inline-flex items-center rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-medium text-[#16A34A] ring-1 ring-inset ring-[#BBF7D0]">
              + Invoice
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-medium text-[#2563EB]">
            Free
          </span>
        </div>
        <ArrowRight
          size={14}
          className="text-[#94A3B8] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </Link>
  );
};

export default MarketplaceCard;
