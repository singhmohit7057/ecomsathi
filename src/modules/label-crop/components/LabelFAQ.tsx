import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQ {
  q: string;
  a: string;
}

interface LabelFAQProps {
  faqs: FAQ[];
  marketplaceName: string;
}

export const LabelFAQ: React.FC<LabelFAQProps> = ({ faqs, marketplaceName }) => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-4">
      <h2 className="text-base font-semibold text-[#0F172A]">
        Frequently Asked Questions — {marketplaceName} Label Crop
      </h2>
      <div className="flex flex-col divide-y divide-[#F1F5F9]">
        {faqs.map((faq, i) => (
          <div key={i} className="py-3">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 text-left"
              aria-expanded={open === i}
            >
              <span className="text-sm font-medium text-[#0F172A]">{faq.q}</span>
              <ChevronDown
                size={16}
                className={[
                  'shrink-0 text-[#64748B] transition-transform duration-200',
                  open === i ? 'rotate-180' : '',
                ].join(' ')}
              />
            </button>
            {open === i && (
              <p className="mt-2 text-sm text-[#475569] leading-relaxed">{faq.a}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default LabelFAQ;
