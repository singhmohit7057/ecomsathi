import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Github, ChevronDown, Mail, ArrowRight } from 'lucide-react';

// ─── Data ──────────────────────────────────────────────────────────────────────

const freeToolLinks = [
  { label: 'PDF Tools',   href: '/tools/pdf'   },
  { label: 'Image Tools', href: '/tools/image' },
  { label: 'Video Tools', href: '/tools/video' },
  { label: 'GST Tools',   href: '/tools/gst'   },
  { label: 'SKU Tools',   href: '/tools/sku'   },
  { label: 'Label Crop',  href: '/label-crop'  },
];

const pdfImageLinks = [
  { label: 'Merge PDF',          href: '/tools/pdf/merge'                     },
  { label: 'Compress PDF',       href: '/tools/pdf/compress'                  },
  { label: 'OCR PDF',            href: '/tools/pdf/ocr'                       },
  { label: 'Background Remover', href: '/tools/image/background-remover'      },
  { label: 'Resize Image',       href: '/tools/image/resize'                  },
  { label: 'Product Optimizer',  href: '/tools/image/product-optimizer'       },
  { label: 'White Background',   href: '/tools/image/white-background'        },
];

const gstSkuLinks = [
  { label: 'GST Calculator',    href: '/tools/gst/calculator'   },
  { label: 'GST Search',        href: '/tools/gst/search'       },
  { label: 'HSN Search',        href: '/tools/gst/hsn-search'   },
  { label: 'SKU Generator',     href: '/tools/sku/generator'    },
  { label: 'Barcode Generator', href: '/tools/sku/barcode'      },
  { label: 'Label Generator',   href: '/tools/sku/label-generator' },
  { label: 'Reconciliation',    href: '/reconciliation'         },
];

const companyLinks = [
  { label: 'About',            href: '/about'   },
  { label: 'Contact',          href: '/contact' },
  { label: 'FAQ',              href: '/faq'     },
  { label: 'Privacy Policy',   href: '/privacy' },
  { label: 'Terms of Service', href: '/terms'   },
  { label: 'Dashboard',        href: '/dashboard'},
  { label: 'Pricing',          href: '/pricing' },
];

// ─── LinkColumn ───────────────────────────────────────────────────────────────

interface LinkColumnProps {
  id: string;
  title: string;
  links: { label: string; href: string }[];
  viewAllHref?: string;
  viewAllLabel?: string;
  expandedSections: Set<string>;
  onToggle: (id: string) => void;
}

function LinkColumn({ id, title, links, viewAllHref, viewAllLabel, expandedSections, onToggle }: LinkColumnProps) {
  const isOpen = expandedSections.has(id);

  return (
    <div className="flex flex-col">
      {/* Mobile accordion header */}
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex items-center justify-between w-full py-3 sm:hidden border-b border-[#E2E8F0]"
        aria-expanded={isOpen}
      >
        <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">{title}</span>
        <ChevronDown
          size={15}
          className={`text-[#94A3B8] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Desktop header */}
      <h3 className="hidden sm:block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-4">
        {title}
      </h3>

      {/* Links */}
      <ul
        className={[
          'flex flex-col gap-2.5 overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-[500px] mt-3 mb-2' : 'max-h-0',
          'sm:max-h-none sm:mt-0 sm:mb-0',
        ].join(' ')}
      >
        {links.map((link) => (
          <li key={link.href}>
            <Link
              to={link.href}
              className="text-sm text-[#64748B] hover:text-[#2563EB] transition-colors leading-snug"
            >
              {link.label}
            </Link>
          </li>
        ))}
        {viewAllHref && (
          <li className="sm:hidden">
            <Link to={viewAllHref} className="text-sm font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
              {viewAllLabel ?? 'View All'} <ArrowRight size={13} />
            </Link>
          </li>
        )}
      </ul>

      {/* Desktop view-all */}
      {viewAllHref && (
        <Link
          to={viewAllHref}
          className="hidden sm:inline-flex items-center gap-1 mt-2 text-sm font-semibold text-[#2563EB] hover:underline transition-colors"
        >
          {viewAllLabel ?? 'View All'} <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export const Footer: React.FC = () => {
  const [email, setEmail]             = useState('');
  const [subscribed, setSubscribed]   = useState(false);
  const [expandedSections, setExpanded] = useState<Set<string>>(new Set());

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    console.log('Newsletter subscribe:', email);
    setEmail('');
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };

  const toggleSection = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <footer className="bg-white">

      {/* ── Newsletter Strip ──────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 45%, #0891B2 100%)' }}
      >
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -left-16 -top-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -right-8 -bottom-12 w-48 h-48 rounded-full bg-white/5" />

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
          {/* Centered card layout */}
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

            {/* Form */}
            {subscribed ? (
              <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-6 py-3 rounded-[8px]">
                <span className="text-green-200">✓</span>
                You're subscribed! Thanks.
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
          </div>
        </div>
      </div>

      {/* ── Main Footer ───────────────────────────────────────────────────── */}
      <div className="bg-[#F8FAFC] border-t border-[#E2E8F0]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">

            {/* Brand column */}
            <div className="sm:col-span-2 md:col-span-3 lg:col-span-2 flex flex-col gap-5">
              <Link to="/" className="flex items-center gap-2.5 select-none w-fit group">
                <span
                  className="w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 4h10M3 8h7M3 12h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </span>
                <span className="text-[22px] font-bold leading-none tracking-tight">
                  <span style={{ color: '#2563EB' }}>Ecom</span>
                  <span style={{ color: '#0F172A' }}>Sathi</span>
                </span>
              </Link>

              <div>
                <p className="text-sm font-medium text-[#334155] leading-relaxed mb-1">
                  One Place for All Your Ecommerce Needs
                </p>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Free tools for Amazon, Flipkart, Meesho, Myntra &amp; more Indian marketplace sellers.
                </p>
              </div>

              {/* Social icons */}
              <div className="flex items-center gap-3">
                {[
                  { href: 'https://linkedin.com', label: 'LinkedIn',  icon: <Linkedin size={17} /> },
                  { href: 'https://twitter.com',  label: 'Twitter/X', icon: <Twitter size={17} />  },
                  { href: 'https://github.com',   label: 'GitHub',    icon: <Github size={17} />   },
                ].map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-8 h-8 rounded-[6px] border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:text-[#2563EB] hover:border-[#BFDBFE] hover:bg-[#EFF6FF] transition-all duration-150"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>

              {/* India badge */}
              <span className="inline-flex items-center gap-1.5 bg-white border border-[#E2E8F0] text-xs font-semibold text-[#334155] px-3 py-1.5 rounded-full w-fit shadow-sm">
                🇮🇳 Made in India
              </span>
            </div>

            {/* Link columns */}
            <LinkColumn
              id="free-tools"
              title="Free Tools"
              links={freeToolLinks}
              viewAllHref="/tools"
              viewAllLabel="All Tools"
              expandedSections={expandedSections}
              onToggle={toggleSection}
            />
            <LinkColumn
              id="pdf-image"
              title="PDF & Image"
              links={pdfImageLinks}
              expandedSections={expandedSections}
              onToggle={toggleSection}
            />
            <LinkColumn
              id="gst-sku"
              title="GST & SKU"
              links={gstSkuLinks}
              expandedSections={expandedSections}
              onToggle={toggleSection}
            />
            <LinkColumn
              id="company"
              title="Company"
              links={companyLinks}
              expandedSections={expandedSections}
              onToggle={toggleSection}
            />
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-[#E2E8F0]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Left: single attribution line */}
          <p className="text-xs text-[#94A3B8] order-2 sm:order-1 text-center sm:text-left">
            &copy; {new Date().getFullYear()}{' '}
            <a
              href="https://tmmt.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#2563EB] hover:underline"
            >
              TMMT.in
            </a>
            {' '}— All rights reserved. EcomSathi is a part of TMMT.
          </p>

          {/* Right: legal links */}
          <div className="flex items-center gap-1 text-xs order-1 sm:order-2">
            {[
              { to: '/privacy', label: 'Privacy' },
              { to: '/terms',   label: 'Terms'   },
              { to: '/sitemap', label: 'Sitemap' },
              { to: '/contact', label: 'Contact' },
            ].map((item, i, arr) => (
              <React.Fragment key={item.to}>
                <Link to={item.to} className="text-[#94A3B8] hover:text-[#64748B] transition-colors px-1">
                  {item.label}
                </Link>
                {i < arr.length - 1 && <span className="text-[#E2E8F0] select-none">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
