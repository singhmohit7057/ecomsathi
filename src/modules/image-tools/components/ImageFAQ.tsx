import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQItem {
  q: string
  a: string
}

interface ImageFAQProps {
  faqs: FAQItem[]
}

export default function ImageFAQ({ faqs }: ImageFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-[#0F172A]">Frequently Asked Questions</h2>
      <div className="flex flex-col divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-[8px] overflow-hidden">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-3 hover:bg-[#F8FAFC] transition-colors"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
            >
              <span className="text-sm font-medium text-[#0F172A]">{faq.q}</span>
              {openIndex === i
                ? <ChevronUp size={16} className="shrink-0 text-[#64748B]" />
                : <ChevronDown size={16} className="shrink-0 text-[#64748B]" />
              }
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 text-sm text-[#64748B] leading-relaxed border-t border-[#F1F5F9]">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
