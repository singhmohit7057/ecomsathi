// Reusable newsletter signup section
// Used in: HomePage (bottom), ContactPage (after form)

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Bell, CheckCircle2 } from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail]           = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    console.log('Newsletter subscribe:', email);
    setEmail('');
    setSubscribed(true);
  };

  return (
    <section className="bg-[#F8FAFC] border-t border-[#E2E8F0] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white px-8 py-14 shadow-[#1E293B_4px_4px_0px_0px] md:px-16">

          {/* Decorative background */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background:
                'radial-gradient(ellipse 70% 80% at 50% 110%, rgba(37,99,235,0.06) 0%, rgba(6,182,212,0.03) 60%, transparent 100%)',
            }}
          />
          {/* Dot grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035] rounded-2xl"
            style={{
              backgroundImage: 'radial-gradient(circle, #2563EB 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative flex flex-col items-center text-center gap-6">

            {/* Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] shadow-[#1E293B_2px_2px_0px_0px]">
              <Bell size={24} className="text-[#2563EB]" />
            </div>

            {/* Text */}
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A] sm:text-3xl md:text-4xl">
                Stay updated with new tools &amp; features
              </h2>
              <p className="mt-2 text-base text-[#64748B]">
                Get notified when we launch new ecommerce tools. No spam, unsubscribe anytime.
              </p>
            </div>

            {/* Form / Success */}
            {subscribed ? (
              <div className="inline-flex items-center gap-2.5 rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] px-6 py-3 text-sm font-semibold text-[#16A34A]">
                <CheckCircle2 size={17} className="text-[#16A34A]" />
                You&apos;re subscribed! Thanks — we&apos;ll be in touch.
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex w-full max-w-lg flex-col gap-3 sm:flex-row"
              >
                <div className="relative flex-1">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-[6px] border border-[#E2E8F0] bg-white py-3 pl-10 pr-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 shadow-[#1E293B_2px_2px_0px_0px]"
                  />
                </div>
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-[6px] bg-[#2563EB] px-6 py-3 text-sm font-bold text-white shadow-[#1E293B_2px_2px_0px_0px] transition-all hover:bg-[#1D4ED8] hover:shadow-[#1E293B_1px_1px_0px_0px] hover:translate-y-[1px] active:translate-y-[2px]"
                >
                  Subscribe
                </button>
              </form>
            )}

            {/* Trust + unsubscribe */}
            <div className="flex flex-col items-center gap-1.5">
              <p className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                Trusted by 1,000+ Indian ecommerce sellers
              </p>
              <p className="text-xs text-[#94A3B8]">
                Already subscribed?{' '}
                <Link
                  to="/unsubscribe"
                  className="font-semibold text-[#2563EB] underline underline-offset-2 hover:text-[#1D4ED8] transition-colors"
                >
                  Unsubscribe here →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;
