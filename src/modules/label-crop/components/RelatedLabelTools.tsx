import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Scissors } from 'lucide-react';
import { ALL_MARKETPLACES } from '../platforms/marketplaceMeta';
import { LOGO_PATHS } from './MarketplaceLogos';

interface RelatedLabelToolsProps {
  currentSlug: string;
}

export const RelatedLabelTools: React.FC<RelatedLabelToolsProps> = ({ currentSlug }) => {
  const others = ALL_MARKETPLACES.filter((m) => m.slug !== currentSlug);

  return (
    <div className="rounded-[10px] border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#F1F5F9] bg-[#F8FAFC]">
        <Scissors size={13} className="text-[#2563EB]" />
        <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">Other Label Crop Tools</h3>
      </div>
      <ul className="divide-y divide-[#F8FAFC]">
        {others.map((m) => (
          <li key={m.slug}>
            <Link
              to={`/label-crop/${m.slug}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8FAFC] transition-colors group"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border border-[#F1F5F9] bg-white p-1">
                <img
                  src={LOGO_PATHS[m.slug]}
                  alt={`${m.name} logo`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <span className="flex-1 text-xs font-medium text-[#475569] group-hover:text-[#2563EB] transition-colors">
                {m.name} Label Crop
              </span>
              <ArrowRight size={12} className="text-[#CBD5E1] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all" />
            </Link>
          </li>
        ))}
      </ul>
      <div className="px-4 py-2.5 border-t border-[#F1F5F9] bg-[#F8FAFC]">
        <Link to="/label-crop" className="text-xs text-[#2563EB] hover:underline font-medium">
          ← All label crop tools
        </Link>
      </div>
    </div>
  );
};

export default RelatedLabelTools;
