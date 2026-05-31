import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Clock,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  HelpCircle,
  Send,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SubjectOption =
  | 'General Inquiry'
  | 'Tool Feedback'
  | 'Bug Report'
  | 'Premium Plans'
  | 'Partnership';

interface ContactFormState {
  name: string;
  email: string;
  subject: SubjectOption | '';
  message: string;
}

const SUBJECT_OPTIONS: SubjectOption[] = [
  'General Inquiry',
  'Tool Feedback',
  'Bug Report',
  'Premium Plans',
  'Partnership',
];

// ---------------------------------------------------------------------------
// Placeholder form submit handler
// ---------------------------------------------------------------------------

function handleFormSubmit(data: ContactFormState): void {
  // TODO: Replace with actual API call (e.g., Resend / Supabase Edge Function)
  console.log('[ContactPage] Form submitted:', data);
}

// ---------------------------------------------------------------------------
// ContactPage
// ---------------------------------------------------------------------------

export default function ContactPage() {
  const [form, setForm] = useState<ContactFormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate async submission
    await new Promise((r) => setTimeout(r, 800));
    handleFormSubmit(form);
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Hero ── */}
      <section className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] rounded-full mb-4">
            Support
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#0F172A] mb-4 leading-tight">
            Get in Touch
          </h1>
          <p className="text-lg text-[#475569] max-w-xl mx-auto">
            Have a question, feedback, or partnership inquiry? We would love to hear
            from you. Our team typically responds within one business day.
          </p>
        </div>
      </section>

      {/* ── Two-column body ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* ── LEFT: Contact Form ── */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-8 shadow-[#1E293B_2px_2px_0px_0px]">
              <h2 className="text-xl font-bold text-[#0F172A] mb-6">Send Us a Message</h2>

              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center mx-auto mb-4">
                    <Send size={24} className="text-[#16A34A]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-[#64748B] text-sm">
                    Thank you for reaching out. We will get back to you at{' '}
                    <span className="font-medium text-[#0F172A]">{form.email}</span>{' '}
                    within one business day.
                  </p>
                  <button
                    className="mt-6 text-sm text-[#2563EB] hover:underline"
                    onClick={() => {
                      setForm({ name: '', email: '', subject: '', message: '' });
                      setSubmitted(false);
                    }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="flex flex-col gap-5">
                  {/* Name */}
                  <Input
                    label="Full Name"
                    id="contact-name"
                    name="name"
                    type="text"
                    placeholder="Rahul Sharma"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />

                  {/* Email */}
                  <Input
                    label="Email Address"
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="rahul@yourstore.in"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />

                  {/* Subject dropdown */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="contact-subject"
                      className="text-sm font-medium text-[#0F172A] leading-none"
                    >
                      Subject
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border border-[#94A3B8] rounded-[4px] px-3 py-2.5 text-base text-[#0F172A] focus:outline-none focus:ring-2 focus:border-[#2563EB] focus:ring-[#2563EB]/20 transition-all duration-150"
                    >
                      <option value="" disabled>
                        Select a subject…
                      </option>
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="contact-message"
                      className="text-sm font-medium text-[#0F172A] leading-none"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      placeholder="Describe your question or feedback in detail…"
                      value={form.message}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border border-[#94A3B8] rounded-[4px] px-3 py-2.5 text-base text-[#0F172A] placeholder-[#94A3B8] resize-y focus:outline-none focus:ring-2 focus:border-[#2563EB] focus:ring-[#2563EB]/20 transition-all duration-150"
                    />
                  </div>

                  {/* Cloudflare Turnstile placeholder */}
                  <div>
                    <div
                      id="turnstile-widget"
                      className="bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-[4px] px-4 py-3 text-sm text-[#94A3B8] text-center"
                    >
                      {/* Turnstile widget renders here — load the Cloudflare Turnstile
                          script and call window.turnstile.render('#turnstile-widget', { sitekey: '…' }) */}
                      Cloudflare Turnstile CAPTCHA widget will appear here
                    </div>
                  </div>

                  <Button type="submit" loading={loading} fullWidth rightIcon={<Send size={16} />}>
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* ── RIGHT: Contact Info ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Email card */}
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-6 shadow-[#1E293B_2px_2px_0px_0px]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-[#2563EB]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A] mb-1">Email Us</h3>
                  <a
                    href="mailto:hello@ecomsathi.in"
                    className="text-[#2563EB] font-medium hover:underline text-sm"
                  >
                    hello@ecomsathi.in
                  </a>
                  <p className="text-xs text-[#64748B] mt-1">
                    For all support, feedback, and business inquiries.
                  </p>
                </div>
              </div>
            </div>

            {/* Response time card */}
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-6 shadow-[#1E293B_2px_2px_0px_0px]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-[#D97706]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A] mb-1">
                    Response Time
                  </h3>
                  <p className="text-sm text-[#0F172A] font-medium">
                    Within 1 business day
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">
                    Mon–Fri, 10 AM – 6 PM IST. We are based in India and reply
                    during Indian business hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Social links */}
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-6 shadow-[#1E293B_2px_2px_0px_0px]">
              <h3 className="text-sm font-semibold text-[#0F172A] mb-4">
                Follow EcomSathi
              </h3>
              <div className="flex flex-col gap-3">
                <SocialLink
                  icon={<Twitter size={16} />}
                  label="Twitter / X"
                  href="https://twitter.com/ecomsathi"
                />
                <SocialLink
                  icon={<Linkedin size={16} />}
                  label="LinkedIn"
                  href="https://linkedin.com/company/ecomsathi"
                />
                <SocialLink
                  icon={<Instagram size={16} />}
                  label="Instagram"
                  href="https://instagram.com/ecomsathi"
                />
                <SocialLink
                  icon={<Youtube size={16} />}
                  label="YouTube"
                  href="https://youtube.com/@ecomsathi"
                />
              </div>
            </div>

            {/* FAQ link */}
            <Link
              to="/faq"
              className="flex items-center gap-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[8px] p-5 hover:bg-[#DBEAFE] transition-colors group"
            >
              <HelpCircle size={20} className="text-[#2563EB] flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1E40AF]">
                  Have a question?
                </p>
                <p className="text-xs text-[#3B82F6] mt-0.5">
                  Check our FAQ for instant answers
                </p>
              </div>
              <ChevronRight
                size={16}
                className="text-[#2563EB] group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SocialLink sub-component
// ---------------------------------------------------------------------------

interface SocialLinkProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

function SocialLink({ icon, label, href }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 text-sm text-[#475569] hover:text-[#2563EB] transition-colors group"
    >
      <span className="text-[#64748B] group-hover:text-[#2563EB] transition-colors">
        {icon}
      </span>
      <span className="group-hover:underline">{label}</span>
      <ChevronRight
        size={12}
        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </a>
  );
}
