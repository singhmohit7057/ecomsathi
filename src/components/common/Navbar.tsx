import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Menu,
  X,
  Barcode,
  FileText,
  Image,
  Video,
  Tag,
  Receipt,
  LayoutDashboard,
  User,
} from 'lucide-react';
import { Button } from './Button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  description?: string;
}

interface ToolCategory {
  category: string;
  icon: React.ReactNode;
  items: NavItem[];
}

// ─── Tool categories config ───────────────────────────────────────────────────

const toolCategories: ToolCategory[] = [
  {
    category: 'SKU Tools',
    icon: <Barcode size={16} />,
    items: [
      { label: 'SKU Generator', href: '/tools/sku-generator', description: 'Create unique SKU codes' },
      { label: 'Barcode Generator', href: '/tools/barcode-generator', description: 'Generate EAN/UPC barcodes' },
      { label: 'SKU Validator', href: '/tools/sku-validator', description: 'Validate existing SKUs' },
    ],
  },
  {
    category: 'PDF Tools',
    icon: <FileText size={16} />,
    items: [
      { label: 'PDF Splitter', href: '/tools/pdf-splitter', description: 'Split PDF into pages' },
      { label: 'PDF Merger', href: '/tools/pdf-merger', description: 'Merge multiple PDFs' },
      { label: 'Invoice Generator', href: '/tools/invoice-generator', description: 'Create seller invoices' },
    ],
  },
  {
    category: 'Image Tools',
    icon: <Image size={16} />,
    items: [
      { label: 'Background Remover', href: '/tools/bg-remover', description: 'Remove image background' },
      { label: 'Image Resizer', href: '/tools/image-resizer', description: 'Resize for marketplaces' },
      { label: 'Watermark Adder', href: '/tools/watermark', description: 'Add brand watermarks' },
    ],
  },
  {
    category: 'Video Tools',
    icon: <Video size={16} />,
    items: [
      { label: 'Video Compressor', href: '/tools/video-compressor', description: 'Compress product videos' },
      { label: 'Thumbnail Generator', href: '/tools/thumbnail', description: 'Create video thumbnails' },
    ],
  },
  {
    category: 'Label Crop',
    icon: <Tag size={16} />,
    items: [
      { label: 'Label Cropper', href: '/tools/label-crop', description: 'Crop shipping labels' },
      { label: 'Label Bulk Crop', href: '/tools/label-bulk-crop', description: 'Crop labels in bulk' },
    ],
  },
  {
    category: 'GST Tools',
    icon: <Receipt size={16} />,
    items: [
      { label: 'GST Calculator', href: '/tools/gst-calculator', description: 'Calculate GST amounts' },
      { label: 'GSTIN Validator', href: '/tools/gstin-validator', description: 'Validate GSTIN numbers' },
      { label: 'E-Invoice Generator', href: '/tools/einvoice', description: 'Generate e-invoices' },
    ],
  },
];

// ─── Tools Dropdown ───────────────────────────────────────────────────────────

const ToolsDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[680px] bg-white border border-[#E2E8F0] rounded-[8px] shadow-[#1E293B_4px_4px_0px_0px] z-50 p-4 grid grid-cols-3 gap-2">
      {toolCategories.map((cat) => (
        <div key={cat.category} className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-[#64748B] uppercase tracking-wide">
            <span className="text-[#2563EB]">{cat.icon}</span>
            {cat.category}
          </div>
          {cat.items.map((item) => (
            <Link
              key={item.href}
              to={item.href ?? '#'}
              onClick={onClose}
              className="flex flex-col px-2 py-1.5 rounded-[4px] hover:bg-[#F8FAFC] transition-colors group"
            >
              <span className="text-sm font-medium text-[#0F172A] group-hover:text-[#2563EB]">
                {item.label}
              </span>
              {item.description && (
                <span className="text-xs text-[#94A3B8]">{item.description}</span>
              )}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
};

// ─── Navbar Component ─────────────────────────────────────────────────────────

interface NavbarProps {
  isLoggedIn?: boolean;
  userAvatarUrl?: string;
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  isLoggedIn = false,
  userAvatarUrl,
  userName,
}) => {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  const toolsRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setToolsOpen(false);
  }, [location.pathname]);

  const navLinkBase =
    'text-sm font-medium text-[#475569] hover:text-[#2563EB] transition-colors px-1 py-0.5';

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-sm border-b border-[#E2E8F0] shadow-[#1E293B_0px_1px_0px_0px]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-0 select-none flex-shrink-0">
          <span className="text-xl font-bold text-[#2563EB]">Ecom</span>
          <span className="text-xl font-bold text-[#0F172A]">Sathi</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-5">
          <Link to="/" className={navLinkBase}>
            Home
          </Link>

          {/* Tools dropdown */}
          <div ref={toolsRef} className="relative">
            <button
              type="button"
              className={`${navLinkBase} flex items-center gap-1`}
              onClick={() => setToolsOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={toolsOpen}
            >
              Tools
              <ChevronDown
                size={14}
                className={`transition-transform duration-150 ${toolsOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {toolsOpen && <ToolsDropdown onClose={() => setToolsOpen(false)} />}
          </div>

          <Link to="/tools/label-crop" className={navLinkBase}>
            Label Crop
          </Link>
          <Link to="/pricing" className={navLinkBase}>
            Pricing
          </Link>
        </div>

        {/* Desktop right section */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium text-[#475569] hover:text-[#2563EB] transition-colors"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <div className="flex items-center gap-2 ml-2">
                {userAvatarUrl ? (
                  <img
                    src={userAvatarUrl}
                    alt={userName ?? 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center">
                    <User size={16} className="text-[#2563EB]" />
                  </div>
                )}
                {userName && (
                  <span className="text-sm font-medium text-[#0F172A] max-w-[100px] truncate">
                    {userName}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden text-[#475569] hover:text-[#0F172A] transition-colors p-1"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-white overflow-y-auto">
          <div className="flex flex-col p-4 gap-1">
            <Link to="/" className="px-3 py-2.5 text-sm font-medium text-[#0F172A] rounded-[4px] hover:bg-[#F8FAFC]">
              Home
            </Link>

            {/* Mobile tools accordion */}
            <div>
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[#0F172A] rounded-[4px] hover:bg-[#F8FAFC]"
                onClick={() => setMobileToolsOpen((prev) => !prev)}
              >
                Tools
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-150 ${mobileToolsOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {mobileToolsOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-1">
                  {toolCategories.map((cat) => (
                    <div key={cat.category}>
                      <p className="px-3 py-1 text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">
                        {cat.category}
                      </p>
                      {cat.items.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href ?? '#'}
                          className="px-3 py-2 text-sm text-[#475569] hover:text-[#2563EB] hover:bg-[#F8FAFC] rounded-[4px] block"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link to="/tools/label-crop" className="px-3 py-2.5 text-sm font-medium text-[#0F172A] rounded-[4px] hover:bg-[#F8FAFC]">
              Label Crop
            </Link>
            <Link to="/pricing" className="px-3 py-2.5 text-sm font-medium text-[#0F172A] rounded-[4px] hover:bg-[#F8FAFC]">
              Pricing
            </Link>

            <div className="mt-4 flex flex-col gap-2 border-t border-[#E2E8F0] pt-4">
              {isLoggedIn ? (
                <Link to="/dashboard">
                  <Button variant="primary" fullWidth>
                    <LayoutDashboard size={16} />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" fullWidth>
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="primary" fullWidth>
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
