import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Github } from 'lucide-react';

// ─── Link column config ───────────────────────────────────────────────────────

const freeToolLinks = [
  { label: 'SKU Generator', href: '/tools/sku-generator' },
  { label: 'PDF Splitter', href: '/tools/pdf-splitter' },
  { label: 'Image Resizer', href: '/tools/image-resizer' },
  { label: 'Video Compressor', href: '/tools/video-compressor' },
  { label: 'Label Crop', href: '/tools/label-crop' },
  { label: 'GST Calculator', href: '/tools/gst-calculator' },
];

const platformLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Reconciliation', href: '/dashboard/reconciliation' },
  { label: 'Inventory', href: '/dashboard/inventory' },
  { label: 'Pricing', href: '/pricing' },
];

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

// ─── Footer Component ─────────────────────────────────────────────────────────

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F8FAFC] border-t border-[#E2E8F0]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Branding + social */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-0 select-none w-fit">
              <span className="text-xl font-bold text-[#2563EB]">Ecom</span>
              <span className="text-xl font-bold text-[#0F172A]">Sathi</span>
            </Link>
            <p className="text-sm text-[#64748B] leading-relaxed max-w-[220px]">
              One Place for All Your Ecommerce Needs
            </p>
            <div className="flex items-center gap-3 mt-1">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-[#64748B] hover:text-[#2563EB] transition-colors"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="text-[#64748B] hover:text-[#2563EB] transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-[#64748B] hover:text-[#2563EB] transition-colors"
              >
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Col 2: Free Tools */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide">
              Free Tools
            </h3>
            <ul className="flex flex-col gap-2">
              {freeToolLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-[#64748B] hover:text-[#2563EB] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Platform */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide">
              Platform
            </h3>
            <ul className="flex flex-col gap-2">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-[#64748B] hover:text-[#2563EB] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Company */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide">
              Company
            </h3>
            <ul className="flex flex-col gap-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-[#64748B] hover:text-[#2563EB] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#94A3B8] text-center sm:text-left">
            &copy; 2025 EcomSathi. Made for Indian Ecommerce Sellers.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs text-[#94A3B8] hover:text-[#64748B] transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-xs text-[#94A3B8] hover:text-[#64748B] transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="text-xs text-[#94A3B8] hover:text-[#64748B] transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
