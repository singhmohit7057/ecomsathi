import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, FileText, Receipt } from 'lucide-react';
import type { MarketplaceInfo } from '../types';
import { LOGO_PATHS } from './MarketplaceLogos';

interface MarketplaceCardProps {
  marketplace: MarketplaceInfo;
}

export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ marketplace }) => {
  const { slug, name, tagline, features, hasInvoice, color, bgColor } = marketplace;

  return (
    <Link
      to={`/label-crop/${slug}`}
      aria-label={`${name} Label Crop Tool`}
      className="group flex flex-col gap-4 rounded-[12px] border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all hover:border-[#93C5FD] hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] border border-[#E2E8F0] shadow-sm p-1.5"
          style={{ backgroundColor: bgColor }}
        >
          <img
            src={LOGO_PATHS[slug]}
            alt={`${name} logo`}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-tight">
            {name} Label Crop
          </h3>
          <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">{tagline}</p>
        </div>
      </div>

      {/* Features */}
      <ul className="flex flex-col gap-1.5">
        {features.slice(0, 3).map((f) => (
          <li key={f} className="flex items-center gap-1.5 text-xs text-[#475569]">
            <CheckCircle2 size={11} className="shrink-0" style={{ color }} />
            {f}
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9] mt-auto">
        <div className="flex items-center gap-1.5">
          {hasInvoice && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-semibold text-[#16A34A] ring-1 ring-inset ring-[#BBF7D0]">
              <Receipt size={9} /> Invoice
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#2563EB]">
            <FileText size={9} /> Free
          </span>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-[#94A3B8] group-hover:text-[#2563EB] transition-colors">
          Open <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
};

export default MarketplaceCard;
