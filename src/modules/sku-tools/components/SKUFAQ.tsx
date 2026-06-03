// ============================================================
// SKU FAQ Component — accordion with JSON-LD schema
// ============================================================

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { FAQItem } from '../types'

interface SKUFAQProps {
  items: FAQItem[]
  title?: string
}

const SKUFAQ: React.FC<SKUFAQProps> = ({ items, title = 'Frequently Asked Questions' }) => {
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
    <section className="flex flex-col gap-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-[#0F172A]">{title}</h2>
        <p className="text-sm text-[#64748B]">Everything you need to know about SKU generation and labels.</p>
      </div>

      {/* Accordion */}
      <div className="flex flex-col gap-2">
        {items.map((item, idx) => {
          const isOpen = openIdx === idx
          return (
            <div
              key={idx}
              className={`rounded-[8px] border bg-white transition-all duration-200 ${
                isOpen
                  ? 'border-[#2563EB] shadow-sm'
                  : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`shrink-0 text-xs font-bold tabular-nums w-5 transition-colors ${
                    isOpen ? 'text-[#2563EB]' : 'text-[#CBD5E1]'
                  }`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-sm font-semibold transition-colors ${
                    isOpen ? 'text-[#2563EB]' : 'text-[#0F172A]'
                  }`}>
                    {item.question}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`shrink-0 transition-all duration-200 ${
                    isOpen ? 'rotate-180 text-[#2563EB]' : 'text-[#94A3B8]'
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-4 ml-8">
                  <p className="text-sm text-[#64748B] leading-relaxed border-l-2 border-[#BFDBFE] pl-4">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <p className="text-xs text-[#94A3B8] text-center">
        Still have questions?{' '}
        <a href="/contact" className="text-[#2563EB] hover:underline font-medium">
          Contact us
        </a>
      </p>
    </section>
  )
}

export default SKUFAQ
