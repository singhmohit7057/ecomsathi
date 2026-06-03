import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailX } from 'lucide-react';

export default function UnsubscribePage() {
  const [email, setEmail]           = useState('');
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [loading, setLoading]       = useState(false);

  async function handleUnsubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate async call
    await new Promise((r) => setTimeout(r, 600));
    console.log('[UnsubscribePage] Unsubscribe request for:', email);
    setLoading(false);
    setUnsubscribed(true);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] leading-tight">
          Unsubscribe from Newsletter
        </h1>
      </div>

      {/* Card */}
      <div className="max-w-md mx-auto px-4 sm:px-0">
        <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-8 shadow-[#1E293B_2px_2px_0px_0px] text-center">
          {unsubscribed ? (
            <>
              {/* Success state */}
              <div className="w-14 h-14 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-[#16A34A]">✓</span>
              </div>
              <h2 className="text-lg font-bold text-[#0F172A] mb-2">
                You&apos;ve been unsubscribed.
              </h2>
              <p className="text-sm text-[#64748B] mb-6">
                Sorry to see you go! You&apos;ve been removed from EcomSathi newsletters.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:underline"
              >
                Changed your mind? Go back to homepage
              </Link>
            </>
          ) : (
            <>
              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center mx-auto mb-4">
                <MailX size={24} className="text-[#E11D48]" />
              </div>

              <h2 className="text-lg font-bold text-[#0F172A] mb-2">
                We&apos;re sorry to see you go
              </h2>
              <p className="text-sm text-[#64748B] mb-6">
                Enter your email to unsubscribe from EcomSathi newsletters.
              </p>

              <form onSubmit={handleUnsubscribe} className="flex flex-col gap-4 text-left">
                <div>
                  <label
                    htmlFor="unsub-email"
                    className="block text-sm font-medium text-[#0F172A] mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="unsub-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2.5 text-sm bg-white text-[#0F172A] border border-[#94A3B8] rounded-[6px] outline-none placeholder:text-[#94A3B8] focus:ring-2 focus:border-[#E11D48] focus:ring-[#E11D48]/20 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-5 py-2.5 text-sm font-bold bg-[#E11D48] text-white rounded-[6px] hover:bg-[#BE123C] transition-colors shadow-[#1E293B_2px_2px_0px_0px] hover:shadow-[#1E293B_1px_1px_0px_0px] hover:translate-y-[1px] active:translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Unsubscribe'}
                </button>
              </form>

              <p className="mt-5 text-xs text-[#94A3B8]">
                Changed your mind?{' '}
                <Link to="/" className="text-[#2563EB] hover:underline font-medium">
                  Go back to homepage
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
