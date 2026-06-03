// Reusable newsletter signup section
// Used in: HomePage (bottom), ContactPage (after form)

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

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
    <section
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 45%, #0891B2 100%)' }}
    >
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -left-16 -top-16 w-64 h-64 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -right-8 -bottom-12 w-48 h-48 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute left-1/2 top-0 w-96 h-96 -translate-x-1/2 rounded-full bg-white/[0.03]" />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[10px] bg-white/15 mb-5">
            <Mail size={22} className="text-white" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
            Stay updated with new tools &amp; features
          </h2>
          <p className="text-blue-100 text-base mb-8">
            Get notified when we launch new ecommerce tools. No spam, unsubscribe anytime.
          </p>

          {/* Form / Success */}
          {subscribed ? (
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-6 py-3 rounded-[8px]">
              <span className="text-green-200">✓</span>
              You&apos;re subscribed! Thanks.
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row items-stretch gap-3 max-w-md mx-auto"
            >
              <div className="flex-1 relative">
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
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white text-[#0F172A] rounded-[8px] border-0 outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:ring-white/60 shadow-[#1E293B_2px_2px_0px_0px]"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 text-sm font-bold bg-white text-[#2563EB] rounded-[8px] hover:bg-blue-50 transition-colors whitespace-nowrap shadow-[#1E293B_2px_2px_0px_0px] hover:shadow-[#1E293B_1px_1px_0px_0px] hover:translate-y-[1px] active:translate-y-[1px]"
              >
                Subscribe
              </button>
            </form>
          )}

          {/* Trust note */}
          <p className="mt-4 text-xs text-blue-200 flex items-center justify-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-300" />
            Trusted by 1,000+ Indian ecommerce sellers
          </p>

          {/* Unsubscribe link */}
          <p className="mt-2 text-xs text-blue-300">
            <Link to="/unsubscribe" className="hover:text-white underline underline-offset-2 transition-colors">
              Unsubscribe anytime
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;
