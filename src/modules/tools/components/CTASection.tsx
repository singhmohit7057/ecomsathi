import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, Package } from 'lucide-react'

const CTA_CARDS = [
  {
    icon: BarChart3,
    label: 'Inventory Management',
    desc: 'Track stock, purchase orders, and warehouses.',
    href: '/inventory',
    bg: 'bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]',
    border: 'border-[#BFDBFE]',
    iconBg: 'bg-[#2563EB]',
    button: 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]',
    shadow: 'shadow-[#1E293B_3px_3px_0px_0px]',
  },
  {
    icon: Package,
    label: 'Reconciliation Software',
    desc: 'Reconcile orders, settlements, and returns.',
    href: '/reconciliation',
    bg: 'bg-gradient-to-br from-[#ECFEFF] to-[#CFFAFE]',
    border: 'border-[#A5F3FC]',
    iconBg: 'bg-[#06B6D4]',
    button: 'bg-[#06B6D4] text-white hover:bg-[#0891B2]',
    shadow: 'shadow-[#1E293B_3px_3px_0px_0px]',
  },
]

export default function CTASection() {
  return (
    <section className="bg-[#F8FAFC] py-14" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[#1E293B_4px_4px_0px_0px]">
          {/* Top bar */}
          <div className="bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#0891B2] px-8 py-6 text-center">
            <h2 id="cta-heading" className="text-xl font-bold text-white md:text-2xl">
              Need More Than Free Tools?
            </h2>
            <p className="mt-1.5 text-sm text-blue-100 md:text-base">
              Upgrade to inventory management and ecommerce reconciliation solutions.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 divide-y divide-[#F1F5F9] p-6 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:p-8 gap-6 sm:gap-0">
            {CTA_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.label} className={`flex flex-col items-center gap-4 sm:px-8 text-center`}>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A]">{card.label}</h3>
                    <p className="mt-1 text-sm text-[#64748B]">{card.desc}</p>
                  </div>
                  <Link
                    to={card.href}
                    className={`inline-flex items-center gap-1.5 rounded-[4px] border border-transparent px-5 py-2 text-sm font-semibold ${card.button} ${card.shadow} transition-all hover:shadow-[#1E293B_1px_1px_0px_0px]`}
                  >
                    {card.label} <ArrowRight size={14} />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
