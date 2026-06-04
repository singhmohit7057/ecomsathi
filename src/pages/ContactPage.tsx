import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NewsletterSection from '@/components/sections/NewsletterSection';
import {
  Mail, Clock, MessageSquare, Send, Check,
  Twitter, Linkedin, Github, ArrowRight,
  Zap, Shield, Star, HelpCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Subject = 'General Inquiry' | 'Tool Feedback' | 'Bug Report' | 'Premium Plans' | 'Partnership' | '';
interface FormState { name: string; email: string; subject: Subject; message: string; }
const SUBJECTS: Exclude<Subject, ''>[] = ['General Inquiry', 'Tool Feedback', 'Bug Report', 'Premium Plans', 'Partnership'];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 900);
  };

  const inputCls = "w-full rounded-[8px] border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all";

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          HERO — split: left dark card + right form
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[420px_1fr] items-stretch">

            {/* ── Left: info panel ── */}
            <div
              className="relative overflow-hidden rounded-2xl p-8 sm:p-10 flex flex-col gap-8"
              style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #1e3a5f 100%)' }}
            >
              {/* Decorative blobs */}
              <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[#6366F1]/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#06B6D4]/15 blur-3xl" />

              {/* Header */}
              <div className="relative">
                <span className="mb-3 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                  Get in touch
                </span>
                <h1 className="text-3xl font-bold text-white leading-tight sm:text-4xl">
                  We'd love to<br />hear from you
                </h1>
                <p className="mt-3 text-sm text-white/60 leading-relaxed">
                  Whether it's a feature request, bug report, or just a hello — we're here. Sellers who built EcomSathi are on the other end.
                </p>
              </div>

              {/* Contact details */}
              <div className="relative flex flex-col gap-4">
                {[
                  { icon: Mail,           label: 'Email',     value: 'hello@ecomsathi.in', href: 'mailto:hello@ecomsathi.in' },
                  { icon: Clock,          label: 'Hours',     value: 'Mon–Sat, 10am–7pm IST', href: null },
                  { icon: MessageSquare,  label: 'Response',  value: 'Within 1 business day', href: null },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-white/10 border border-white/10">
                      <Icon size={16} className="text-white/70" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{label}</p>
                      {href
                        ? <a href={href} className="text-sm font-medium text-white hover:text-[#C4B5FD] transition-colors">{value}</a>
                        : <p className="text-sm font-medium text-white">{value}</p>
                      }
                    </div>
                  </div>
                ))}
              </div>

              {/* Social icons */}
              <div className="relative">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">Follow us</p>
                <div className="flex gap-2">
                  {[
                    { icon: Twitter,  href: 'https://twitter.com',  label: 'Twitter' },
                    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
                    { icon: Github,   href: 'https://github.com',   label: 'GitHub' },
                  ].map(({ icon: Icon, href, label }) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-white/15 bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div className="relative mt-auto pt-6 border-t border-white/10">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">Quick links</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Browse Tools', href: '/tools' },
                    { label: 'FAQ', href: '/faq' },
                    { label: 'Pricing', href: '/pricing' },
                  ].map(({ label, href }) => (
                    <Link
                      key={href}
                      to={href}
                      className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/70 hover:bg-white/20 hover:text-white transition-all"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: form ── */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-[#1E293B_3px_3px_0px_0px]">
              <div className="mb-6 h-[3px] rounded-full w-full" style={{ background: 'linear-gradient(90deg, #6366F1, #06B6D4)' }} />

              {submitted ? (
                <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-5 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F0FDF4] border-2 border-[#BBF7D0]">
                    <Check size={36} className="text-[#16A34A]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#0F172A]">Message Sent!</h2>
                    <p className="mt-2 text-sm text-[#64748B] max-w-xs mx-auto">
                      Thanks for reaching out, {form.name.split(' ')[0] || 'there'}! We'll get back to you within one business day.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                      className="rounded-[6px] border border-[#E2E8F0] bg-white px-5 py-2.5 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC] transition-all"
                    >
                      Send another
                    </button>
                    <Link
                      to="/tools"
                      className="rounded-[6px] px-5 py-2.5 text-sm font-semibold text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #6366F1, #06B6D4)' }}
                    >
                      Explore free tools →
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="mb-1 text-xl font-bold text-[#0F172A]">Send a Message</h2>
                  <p className="mb-7 text-sm text-[#64748B]">We respond to every message personally.</p>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Full Name</label>
                        <input type="text" required placeholder="Rahul Sharma" value={form.name}
                          onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                          className={inputCls} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Email Address</label>
                        <input type="email" required placeholder="rahul@yourstore.in" value={form.email}
                          onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                          className={inputCls} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Subject</label>
                      <select required value={form.subject}
                        onChange={(e) => setForm(p => ({ ...p, subject: e.target.value as Subject }))}
                        className={inputCls + " appearance-none cursor-pointer"}
                      >
                        <option value="">Select a subject...</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Message</label>
                      <textarea required rows={5} placeholder="Describe your question, idea or issue in detail..."
                        value={form.message}
                        onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                        className={inputCls + " resize-none"}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center gap-2.5 rounded-[8px] py-3.5 text-sm font-bold text-white shadow-[#1E293B_2px_2px_0px_0px] hover:shadow-[#1E293B_1px_1px_0px_0px] hover:translate-y-[1px] active:translate-y-[2px] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)' }}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" className="opacity-25"/>
                            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="white" className="opacity-75"/>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          Send Message
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-[#94A3B8]">
                      By submitting you agree to our{' '}
                      <Link to="/privacy" className="text-[#6366F1] hover:underline font-medium">Privacy Policy</Link>.
                      We never share your data.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          WHY CONTACT — 3 reason cards
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#F8FAFC] border-y border-[#E2E8F0] py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">How can we help?</h2>
            <p className="mt-2 text-sm text-[#64748B]">Every message goes straight to the people who built the platform</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: Zap,
                color: '#D97706',
                bg: '#FFFBEB',
                border: '#FDE68A',
                title: 'Feature Requests',
                desc: 'Have an idea for a new tool? We\'ve shipped dozens of features based on seller requests. Tell us what you need.',
                tag: 'We build fast',
              },
              {
                icon: Shield,
                color: '#16A34A',
                bg: '#F0FDF4',
                border: '#BBF7D0',
                title: 'Bug Reports',
                desc: 'Found something broken? We take bugs seriously and fix them within 24 hours. Describe what happened.',
                tag: 'Fixed in 24h',
              },
              {
                icon: Star,
                color: '#6366F1',
                bg: '#F5F3FF',
                border: '#DDD6FE',
                title: 'Premium & Partnerships',
                desc: 'Interested in premium modules, white-label solutions, or a partnership? Let\'s talk.',
                tag: 'Always open',
              },
            ].map(({ icon: Icon, color, bg, border, title, desc, tag }) => (
              <div
                key={title}
                className="group flex flex-col gap-4 rounded-xl border bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-[#1E293B_3px_3px_0px_0px]"
                style={{ borderColor: border }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: bg }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold" style={{ borderColor: border, color, background: bg }}>
                    {tag}
                  </span>
                </div>
                <div>
                  <h3 className="mb-1.5 text-base font-bold text-[#0F172A]">{title}</h3>
                  <p className="text-sm leading-relaxed text-[#64748B]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FAQ — compact
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A]">
                <HelpCircle size={20} className="inline mr-2 text-[#6366F1] mb-0.5" />
                Common Questions
              </h2>
            </div>
            <Link to="/faq" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[#6366F1] hover:underline">
              Full FAQ <ArrowRight size={13} />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { q: 'Are the tools really free?',       a: 'Yes — all 50+ tools are completely free. No credit card, no trial, no login required.' },
              { q: 'How do I report a bug?',           a: 'Use the form above with subject "Bug Report". Include the tool name and describe what happened.' },
              { q: 'Can I request a new tool?',        a: "Absolutely. Select 'Tool Feedback' and describe what you need. We've shipped tools within days of requests." },
              { q: 'What are the premium modules?',    a: 'Reconciliation and Inventory Management are premium. Visit our Pricing page for plans and details.' },
            ].map(({ q, a }) => (
              <div key={q} className="flex gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6366F1] text-white text-[10px] font-black">?</span>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">{q}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#64748B]">{a}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 sm:hidden text-center">
            <Link to="/faq" className="inline-flex items-center gap-1 text-sm font-semibold text-[#6366F1] hover:underline">
              View full FAQ <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      <NewsletterSection />
    </>
  );
}
