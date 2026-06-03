import { useState } from 'react'
import { HelpCircle, ChevronDown } from 'lucide-react'
import { FAQ_ITEMS } from '../data/toolCategories'

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <section className="bg-white py-14" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#64748B]">
            <HelpCircle size={13} />
            Frequently Asked
          </div>
          <h2 id="faq-heading" className="text-2xl font-bold text-[#0F172A] md:text-3xl">
            Common Questions
          </h2>
          <p className="mt-2 text-sm text-[#64748B]">
            Everything you need to know about EcomSathi free tools
          </p>
        </div>

        {/* FAQ list */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className={`overflow-hidden rounded-[8px] border transition-all duration-150 ${
                  isOpen
                    ? 'border-[#BFDBFE] bg-[#EFF6FF] shadow-[#BFDBFE_2px_2px_0px_0px]'
                    : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className={`text-sm font-semibold ${isOpen ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>
                    {item.question}
                  </span>
                  <ChevronDown
                    size={17}
                    className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#2563EB]' : 'text-[#94A3B8]'}`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-[#BFDBFE] px-5 py-4">
                    <p className="text-sm leading-relaxed text-[#475569]">{item.answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
