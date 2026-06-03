interface FAQItem {
  q: string
  a: string
}

interface GSTFAQProps {
  faqs: FAQItem[]
  title?: string
}

export default function GSTFAQ({ faqs, title = 'Frequently Asked Questions' }: GSTFAQProps) {
  return (
    <section>
      <h2 className="text-lg font-bold text-[#0F172A] mb-4">{title}</h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details key={i} className="group border border-[#E2E8F0] rounded-lg bg-white">
            <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-medium text-[#0F172A] list-none select-none">
              {faq.q}
              <span className="ml-2 text-[#94A3B8] group-open:rotate-180 transition-transform duration-200">
                ▾
              </span>
            </summary>
            <div className="px-5 pb-4 text-sm text-[#475569] leading-relaxed border-t border-[#F1F5F9]">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
