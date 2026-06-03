import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { FAQItem } from '../types'

interface PDFFAQProps {
  items: FAQItem[]
  title?: string
  pageUrl?: string
}

export const PDFFAQ: React.FC<PDFFAQProps> = ({
  items,
  title = 'Frequently Asked Questions',
  pageUrl,
}) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const toggle = (idx: number) => setOpenIdx((prev) => (prev === idx ? null : idx))

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <section className="flex flex-col gap-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <h2 className="text-xl font-bold text-[#0F172A]">{title}</h2>

      <div className="flex flex-col divide-y divide-[#F1F5F9] border border-[#E2E8F0] rounded-[8px] overflow-hidden">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white">
            <button
              type="button"
              className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 hover:bg-[#F8FAFC] transition-colors"
              onClick={() => toggle(idx)}
              aria-expanded={openIdx === idx}
            >
              <span className="text-sm font-semibold text-[#0F172A]">{item.question}</span>
              {openIdx === idx ? (
                <ChevronUp size={16} className="shrink-0 text-[#64748B]" />
              ) : (
                <ChevronDown size={16} className="shrink-0 text-[#64748B]" />
              )}
            </button>

            {openIdx === idx && (
              <div className="px-5 pb-4 text-sm text-[#64748B] leading-relaxed">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      {pageUrl && (
        <p className="text-xs text-[#94A3B8] text-center">
          Have more questions?{' '}
          <a href="/contact" className="text-[#2563EB] hover:underline">
            Contact us
          </a>
        </p>
      )}
    </section>
  )
}

export default PDFFAQ
