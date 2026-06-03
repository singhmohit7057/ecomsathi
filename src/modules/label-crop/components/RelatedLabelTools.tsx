import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Scissors } from 'lucide-react';
import { ALL_MARKETPLACES } from '../platforms/marketplaceMeta';

interface RelatedLabelToolsProps {
  currentSlug: string;
}

export const RelatedLabelTools: React.FC<RelatedLabelToolsProps> = ({ currentSlug }) => {
  const others = ALL_MARKETPLACES.filter((m) => m.slug !== currentSlug);

  return (
    <section className="rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Scissors size={15} className="text-[#2563EB]" />
        <h3 className="text-sm font-semibold text-[#0F172A]">Other Label Crop Tools</h3>
      </div>
      <ul className="flex flex-col gap-1.5">
        {others.map((m) => (
          <li key={m.slug}>
            <Link
              to={`/label-crop/${m.slug}`}
              className="flex items-center justify-between gap-2 rounded-[4px] px-2 py-1.5 text-sm text-[#475569] hover:bg-[#F8FAFC] hover:text-[#2563EB] transition-colors group"
            >
              <span className="flex items-center gap-2">
                <span>{m.emoji}</span>
                <span>{m.name} Label Crop</span>
              </span>
              <ArrowRight size={13} className="text-[#CBD5E1] group-hover:text-[#2563EB]" />
            </Link>
          </li>
        ))}
      </ul>
      <Link
        to="/label-crop"
        className="text-xs text-[#2563EB] hover:underline"
      >
        ← All label crop tools
      </Link>
    </section>
  );
};

export default RelatedLabelTools;
