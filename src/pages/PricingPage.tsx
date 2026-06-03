import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─── Types ───────────────────────────────────────────────────────────────────

type BillingCycle = 'monthly' | 'annual'

// ─── Data ────────────────────────────────────────────────────────────────────

const FREE_FEATURES = [
  'All 50+ free tools',
  'No login required',
  'PDF / Image / Video tools',
  'GST tools',
  'Label Crop',
  'SKU Generator',
  'Barcode Generator',
]

const STARTER_FEATURES = [
  'Everything in Free',
  'Reconciliation module (2 marketplaces)',
  'Inventory management (up to 500 SKUs)',
  '1 warehouse',
  'Email support',
]

const PRO_FEATURES = [
  'Everything in Starter',
  'Reconciliation (all 4 marketplaces)',
  'Unlimited SKUs',
  'Multiple warehouses',
  'Priority support',
  'CSV exports',
  'Reports',
]

const COMPARISON_ROWS = [
  { label: 'Free tools access',  free: 'check',       starter: 'check',     pro: 'check'       },
  { label: 'No login for tools', free: 'check',       starter: 'check',     pro: 'check'       },
  { label: 'Reconciliation',     free: 'cross',       starter: '2 markets', pro: 'All 4'       },
  { label: 'Inventory SKUs',     free: 'cross',       starter: '500',       pro: 'Unlimited'   },
  { label: 'Warehouses',         free: 'cross',       starter: '1',         pro: 'Multiple'    },
  { label: 'API exports',        free: 'cross',       starter: 'CSV',       pro: 'CSV + Excel' },
  { label: 'Support',            free: 'Community',   starter: 'Email',     pro: 'Priority'    },
]

const FAQS = [
  {
    q: 'Can I use free tools without signing up?',
    a: 'Yes, all 50+ free tools work without any account.',
  },
  {
    q: 'Is there a free trial for premium?',
    a: 'Yes, 14-day free trial on all paid plans, no credit card required.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'UPI, Credit/Debit cards, Net banking via Razorpay.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, cancel anytime. No lock-in period.',
  },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`w-5 h-5 ${className}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function CrossIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`w-5 h-5 ${className}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  )
}

function CellValue({ value, isProCard = false }: { value: string; isProCard?: boolean }) {
  if (value === 'check') {
    return <CheckIcon className={isProCard ? 'text-[#06B6D4] mx-auto' : 'text-[#2563EB] mx-auto'} />
  }
  if (value === 'cross') {
    return <CrossIcon className={isProCard ? 'text-slate-500 mx-auto' : 'text-slate-300 mx-auto'} />
  }
  return <span className="text-sm font-medium">{value}</span>
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-[#F8FAFC] transition-colors"
        aria-expanded={open}
      >
        <span className="text-[#0F172A] font-medium">{q}</span>
        <svg
          className={`w-5 h-5 text-[#2563EB] flex-shrink-0 ml-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-5 bg-white">
          <p className="text-slate-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>('monthly')

  const starterPrice = billing === 'monthly' ? '₹999' : '₹799'
  const proPrice     = billing === 'monthly' ? '₹2,999' : '₹2,399'

  return (
    <main className="font-['Inter',sans-serif] text-[#0F172A]">

      {/* ───────────────────────────────────────────────────────────────────
          SECTION 1 — HERO
      ─────────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#CFFAFE] py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#0F172A] leading-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-600 mb-10">
            All free tools are forever free. Premium modules for serious sellers.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-white border border-[#E2E8F0] rounded-full p-1 shadow-sm gap-1">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                billing === 'monthly'
                  ? 'bg-[#2563EB] text-white shadow'
                  : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling('annual')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                billing === 'annual'
                  ? 'bg-[#2563EB] text-white shadow'
                  : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              Annual
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  billing === 'annual'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#CFFAFE] text-[#0891B2]'
                }`}
              >
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────
          SECTION 2 — PRICING CARDS
      ─────────────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

            {/* ── Card 1: Free ── */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Free</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-bold text-[#0F172A]">₹0</span>
                  <span className="text-slate-500 mb-1">/month</span>
                </div>
                <p className="text-slate-500 text-sm">For individual sellers</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckIcon className="text-[#2563EB] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className="block text-center py-3 px-6 rounded-xl border-2 border-[#2563EB] text-[#2563EB] font-semibold hover:bg-[#EFF6FF] transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* ── Card 2: Starter (Most Popular) ── */}
            <div className="relative bg-[#EFF6FF] border-2 border-[#2563EB] rounded-2xl p-8 flex flex-col shadow-[#1E293B_4px_4px_0px_0px]">
              {/* Most Popular badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[#2563EB] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow">
                  Most Popular
                </span>
              </div>

              <div className="mb-6 mt-2">
                <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider mb-2">Starter</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-bold text-[#0F172A]">{starterPrice}</span>
                  <span className="text-slate-500 mb-1">/month</span>
                </div>
                {billing === 'annual' && (
                  <p className="text-xs text-[#2563EB] font-medium mb-1">Billed annually — save 20%</p>
                )}
                <p className="text-slate-500 text-sm">For growing sellers</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {STARTER_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckIcon className="text-[#2563EB] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className="block text-center py-3 px-6 rounded-xl bg-[#2563EB] text-white font-semibold hover:bg-[#1D4ED8] transition-colors shadow"
              >
                Start Free Trial
              </Link>
            </div>

            {/* ── Card 3: Pro ── */}
            <div className="bg-[#0F172A] border border-[#0F172A] rounded-2xl p-8 flex flex-col text-white">
              <div className="mb-6">
                <p className="text-sm font-semibold text-[#06B6D4] uppercase tracking-wider mb-2">Pro</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-bold">{proPrice}</span>
                  <span className="text-slate-400 mb-1">/month</span>
                </div>
                {billing === 'annual' && (
                  <p className="text-xs text-[#06B6D4] font-medium mb-1">Billed annually — save 20%</p>
                )}
                <p className="text-slate-400 text-sm">For established businesses</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {PRO_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckIcon className="text-[#06B6D4] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className="block text-center py-3 px-6 rounded-xl bg-[#06B6D4] text-[#0F172A] font-semibold hover:bg-[#0891B2] hover:text-white transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────
          SECTION 3 — FEATURE COMPARISON TABLE
      ─────────────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] text-center mb-10">
            Compare Plans
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0] shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="text-left px-6 py-4 font-semibold text-slate-500 w-1/2">Feature</th>
                  <th className="text-center px-4 py-4 font-semibold text-slate-700">Free</th>
                  <th className="text-center px-4 py-4 font-semibold text-[#2563EB]">Starter</th>
                  <th className="text-center px-4 py-4 font-semibold text-[#0F172A]">Pro</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={row.label}
                    className={`border-b border-[#E2E8F0] last:border-b-0 ${
                      i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'
                    }`}
                  >
                    <td className="px-6 py-4 text-slate-700 font-medium">{row.label}</td>
                    <td className="px-4 py-4 text-center text-slate-600">
                      <CellValue value={row.free} />
                    </td>
                    <td className="px-4 py-4 text-center text-[#2563EB]">
                      <CellValue value={row.starter} />
                    </td>
                    <td className="px-4 py-4 text-center text-[#0F172A]">
                      <CellValue value={row.pro} isProCard />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────
          SECTION 4 — FAQ
      ─────────────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map(faq => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────
          SECTION 5 — CTA
      ─────────────────────────────────────────────────────────────────── */}
      <section className="py-14 bg-gradient-to-r from-[#EFF6FF] to-[#CFFAFE] border-t border-[#E2E8F0]">
        <div className="max-w-xl mx-auto px-4 text-center">
          <p className="text-lg text-slate-600 mb-5">Still not sure?</p>
          <Link
            to="/contact"
            className="inline-block bg-[#0F172A] text-white font-semibold py-3 px-8 rounded-xl hover:bg-[#1E293B] transition-colors shadow-[#0F172A_3px_3px_0px_0px]"
          >
            Contact us
          </Link>
        </div>
      </section>

    </main>
  )
}
