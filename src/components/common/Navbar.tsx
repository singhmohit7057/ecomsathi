import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronDown, ChevronRight, Menu, X,
  FileType2, Image, Film, Calculator, Tag, Scissors,
  LayoutDashboard, User, Settings, LogOut, Home, Grid, Info,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  description?: string;
}

interface ToolCategory {
  category: string;
  icon: React.ReactNode;
  href: string;
  badgeBg: string;
  badgeColor: string;
  items: NavItem[];
}

// ─── Tool categories config ──────────────────────────────────────────────────

const toolCategories: ToolCategory[] = [
  {
    category: 'PDF Tools',
    icon: <FileType2 size={14} />,
    href: '/tools/pdf',
    badgeBg: '#EFF6FF',
    badgeColor: '#2563EB',
    items: [
      { label: 'Merge PDF',         href: '/tools/pdf/merge',          description: 'Combine multiple PDFs' },
      { label: 'Split PDF',         href: '/tools/pdf/split',          description: 'Split by page ranges' },
      { label: 'Compress PDF',      href: '/tools/pdf/compress',       description: 'Reduce file size' },
      { label: 'OCR PDF',           href: '/tools/pdf/ocr',            description: 'Extract text from scans' },
      { label: 'PDF to Images',     href: '/tools/pdf/to-images',      description: 'Convert pages to PNG/JPEG' },
      { label: 'Images to PDF',     href: '/tools/pdf/images-to-pdf',  description: 'Create PDF from images' },
    ],
  },
  {
    category: 'Image Tools',
    icon: <Image size={14} />,
    href: '/tools/image',
    badgeBg: '#F0FDF4',
    badgeColor: '#16A34A',
    items: [
      { label: 'Background Remover', href: '/tools/image/background-remover', description: 'Remove backgrounds' },
      { label: 'Resize Image',       href: '/tools/image/resize',             description: 'Resize for marketplaces' },
      { label: 'Compress Image',     href: '/tools/image/compress',           description: 'Reduce image size' },
      { label: 'JPG to PNG',         href: '/tools/image/jpg-to-png',         description: 'Convert formats' },
      { label: 'White Background',   href: '/tools/image/white-background',   description: 'Marketplace-ready images' },
      { label: 'Product Optimizer',  href: '/tools/image/product-optimizer',  description: 'Optimize for listings' },
    ],
  },
  {
    category: 'Video Tools',
    icon: <Film size={14} />,
    href: '/tools/video',
    badgeBg: '#FFF1F2',
    badgeColor: '#E11D48',
    items: [
      { label: 'Video to GIF',        href: '/tools/video/to-gif',    description: 'Animated GIF from video' },
      { label: 'Compress Video',      href: '/tools/video/compress',  description: 'Reduce video file size' },
      { label: 'Thumbnail Generator', href: '/tools/video/thumbnail-generator', description: 'Extract video thumbnails' },
      { label: 'Video Converter',     href: '/tools/video/converter',           description: 'Convert video formats' },
    ],
  },
  {
    category: 'GST Tools',
    icon: <Calculator size={14} />,
    href: '/tools/gst',
    badgeBg: '#FFFBEB',
    badgeColor: '#D97706',
    items: [
      { label: 'GST Calculator',         href: '/tools/gst/calculator',  description: 'Calculate CGST/SGST/IGST' },
      { label: 'GST Verification',        href: '/tools/gst/verify',      description: 'Verify any GSTIN' },
      { label: 'Reverse GST Calculator', href: '/tools/gst/reverse',     description: 'Extract base from MRP' },
      { label: 'HSN Code Search',        href: '/tools/gst/hsn-search',  description: 'Find HSN codes & rates' },
      { label: 'GST Rate Finder',        href: '/tools/gst/rate-finder', description: 'Find applicable GST rate' },
    ],
  },
  {
    category: 'SKU Tools',
    icon: <Tag size={14} />,
    href: '/tools/sku',
    badgeBg: '#F5F3FF',
    badgeColor: '#7C3AED',
    items: [
      { label: 'SKU Generator',      href: '/tools/sku/generator',       description: 'Create unique SKU codes' },
      { label: 'Bulk SKU Generator', href: '/tools/sku/bulk',            description: 'Generate SKUs in bulk' },
      { label: 'Barcode Generator',  href: '/tools/sku/barcode',         description: 'Generate EAN/UPC barcodes' },
      { label: 'Label Generator',    href: '/tools/sku/label-generator', description: 'Create product labels' },
    ],
  },
  {
    category: 'Label Crop',
    icon: <Scissors size={14} />,
    href: '/label-crop',
    badgeBg: '#FFF7ED',
    badgeColor: '#EA580C',
    items: [
      { label: 'Amazon Label Crop',   href: '/label-crop',  description: 'Crop Amazon labels' },
      { label: 'Flipkart Label Crop', href: '/label-crop',  description: 'Crop Flipkart labels' },
      { label: 'Meesho Label Crop',   href: '/label-crop',  description: 'Crop Meesho labels' },
      { label: 'All Marketplaces',    href: '/label-crop',  description: '7 marketplaces supported' },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

function truncate(str: string | null | undefined, max: number): string {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

// ─── Mega-menu ────────────────────────────────────────────────────────────────
// 6-column single row: wider (960px) but compact height — show 4 items max per col

const ToolsDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    role="menu"
    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-[#E2E8F0] rounded-[10px] z-50"
    style={{
      width: '960px',
      boxShadow: '0 8px 32px rgba(15,23,42,0.12)',
    }}
  >
    {/* 6-column single row */}
    <div className="grid grid-cols-6 divide-x divide-[#F1F5F9] px-2 py-4">
      {toolCategories.map((cat) => (
        <div key={cat.category} className="flex flex-col gap-0.5 px-3">
          {/* Category header */}
          <Link
            to={cat.href}
            onClick={onClose}
            className="flex items-center gap-1.5 px-1.5 py-1 mb-1.5 rounded-[5px] hover:bg-[#F8FAFC] transition-colors group"
          >
            <span
              className="flex items-center justify-center w-5 h-5 rounded-[3px] flex-shrink-0"
              style={{ background: cat.badgeBg, color: cat.badgeColor }}
            >
              {cat.icon}
            </span>
            <span
              className="text-[9px] font-bold uppercase tracking-widest leading-none"
              style={{ color: cat.badgeColor }}
            >
              {cat.category}
            </span>
          </Link>

          {/* Show max 4 items per column */}
          {cat.items.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className="px-1.5 py-1.5 rounded-[4px] hover:bg-[#F8FAFC] transition-colors group"
            >
              <span className="text-[13px] font-medium text-[#334155] group-hover:text-[#2563EB] leading-tight block">
                {item.label}
              </span>
            </Link>
          ))}

          {/* "View all X" link if more than 4 items */}
          <Link
            to={cat.href}
            onClick={onClose}
            className="px-1.5 py-1 mt-0.5 text-[11px] font-semibold transition-colors"
            style={{ color: cat.badgeColor }}
          >
            All {cat.category} →
          </Link>
        </div>
      ))}
    </div>

    {/* Slim footer bar */}
    <div className="border-t border-[#F1F5F9] px-5 py-2.5 flex items-center justify-between bg-[#FAFAFA] rounded-b-[10px]">
      <span className="text-[11px] text-[#94A3B8] flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
        50+ free tools — no login required
      </span>
      <div className="flex items-center gap-3">
        <Link
          to="/tools"
          onClick={onClose}
          className="text-[11px] font-semibold text-[#2563EB] hover:underline"
        >
          View all tools →
        </Link>
        <Link
          to="/label-crop"
          onClick={onClose}
          className="text-[11px] font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] px-3 py-1.5 rounded-[4px] transition-colors"
        >
          Try Label Crop
        </Link>
      </div>
    </div>
  </div>
);

// ─── User Dropdown ────────────────────────────────────────────────────────────

interface UserDropdownProps {
  userName: string | null | undefined;
  avatarUrl: string | null | undefined;
  onSignOut: () => void;
  onClose: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ userName, onSignOut, onClose }) => (
  <div
    role="menu"
    className="absolute top-full right-0 mt-2 w-52 bg-white border border-[#E2E8F0] rounded-[8px] shadow-[0_8px_24px_rgba(15,23,42,0.10)] z-50 py-1.5 overflow-hidden"
  >
    <div className="px-4 py-2.5 border-b border-[#F1F5F9]">
      <p className="text-sm font-semibold text-[#0F172A] truncate">{userName || 'User'}</p>
    </div>
    <div className="py-1">
      {[
        { to: '/dashboard', icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
        { to: '/profile',   icon: <User size={15} />,            label: 'Profile'   },
        { to: '/settings',  icon: <Settings size={15} />,        label: 'Settings'  },
      ].map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onClose}
          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
          role="menuitem"
        >
          <span className="text-[#64748B]">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </div>
    <div className="border-t border-[#F1F5F9] py-1">
      <button
        type="button"
        onClick={() => { onSignOut(); onClose(); }}
        className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-[#E11D48] hover:bg-[#FFF1F2] transition-colors"
        role="menuitem"
      >
        <LogOut size={15} />
        Sign Out
      </button>
    </div>
  </div>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar: React.FC<{ avatarUrl?: string | null; name?: string | null; size?: number }> = ({
  avatarUrl, name, size = 34,
}) => {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? 'User'}
        className="rounded-full object-cover border border-[#E2E8F0] flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center font-bold text-[#2563EB] flex-shrink-0 select-none"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
};

// ─── Navbar ───────────────────────────────────────────────────────────────────

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const isLoggedIn = Boolean(user);

  const [toolsOpen,      setToolsOpen]      = useState(false);
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [mobileToolsOpen,setMobileToolsOpen]= useState(false);
  const [scrolled,       setScrolled]       = useState(false);

  const toolsRef = useRef<HTMLDivElement>(null);
  const userRef  = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setToolsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setToolsOpen(false); setUserMenuOpen(false); }
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onMouseDown); document.removeEventListener('keydown', onKey); };
  }, []);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setToolsOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = useCallback(async () => {
    try { await signOut(); } catch { /* ignore */ }
  }, [signOut]);

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  const navLinkCls = (href: string) => [
    'text-[15px] font-medium transition-colors duration-150 px-1 py-0.5',
    isActive(href) ? 'text-[#2563EB]' : 'text-[#475569] hover:text-[#0F172A]',
  ].join(' ');

  return (
    <nav
      aria-label="Main navigation"
      className={[
        'sticky top-0 z-40 w-full bg-white/98 backdrop-blur-md border-b transition-all duration-200',
        scrolled
          ? 'border-[#E2E8F0] shadow-[0_4px_20px_rgba(15,23,42,0.08)]'
          : 'border-[#E2E8F0] shadow-none',
      ].join(' ')}
    >
      {/* Top accent line */}
      <div
        className="h-[3px] w-full"
        style={{ background: 'linear-gradient(90deg, #2563EB 0%, #06B6D4 50%, #2563EB 100%)' }}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-6">

        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <Link
          to="/"
          className="flex items-center gap-2.5 select-none flex-shrink-0 group"
          aria-label="EcomSathi home"
        >
          <span
            className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)' }}
            aria-hidden="true"
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

        {/* ── Desktop nav ──────────────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`${navLinkCls('/')} px-3 py-2 rounded-[6px] hover:bg-[#F8FAFC]`}
          >
            Home
          </Link>

          {/* Tools mega-menu trigger */}
          <div ref={toolsRef} className="relative">
            <button
              type="button"
              onClick={() => setToolsOpen((p) => !p)}
              aria-haspopup="true"
              aria-expanded={toolsOpen}
              aria-label="Tools menu"
              className={[
                'flex items-center gap-1.5 text-[15px] font-medium transition-colors duration-150 px-3 py-2 rounded-[6px]',
                toolsOpen
                  ? 'text-[#2563EB] bg-[#EFF6FF]'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]',
              ].join(' ')}
            >
              Tools
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
            {toolsOpen && <ToolsDropdown onClose={() => setToolsOpen(false)} />}
          </div>

          <Link
            to="/label-crop"
            className={`${navLinkCls('/label-crop')} px-3 py-2 rounded-[6px] hover:bg-[#F8FAFC]`}
          >
            Label Crop
          </Link>
          <Link
            to="/pricing"
            className={`${navLinkCls('/pricing')} px-3 py-2 rounded-[6px] hover:bg-[#F8FAFC]`}
          >
            Pricing
          </Link>
          <Link
            to="/about"
            className={`${navLinkCls('/about')} px-3 py-2 rounded-[6px] hover:bg-[#F8FAFC]`}
          >
            About
          </Link>
        </div>

        {/* ── Desktop right ─────────────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-2.5 flex-shrink-0">
          {isLoggedIn ? (
            <div ref={userRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((p) => !p)}
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
                aria-label="User menu"
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-[8px] border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] transition-all duration-150"
              >
                <Avatar avatarUrl={user?.avatar_url} name={user?.full_name} size={30} />
                <span className="text-sm font-semibold text-[#0F172A] max-w-[120px] truncate">
                  {truncate(user?.full_name, 14)}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-[#94A3B8] transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
              {userMenuOpen && (
                <UserDropdown
                  userName={user?.full_name}
                  avatarUrl={user?.avatar_url}
                  onSignOut={handleSignOut}
                  onClose={() => setUserMenuOpen(false)}
                />
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[15px] font-medium text-[#475569] hover:text-[#0F172A] px-4 py-2 rounded-[6px] hover:bg-[#F8FAFC] transition-all duration-150 border border-transparent hover:border-[#E2E8F0]"
                aria-label="Log in"
              >
                Login
              </Link>
              <Link
                to="/register"
                aria-label="Create a free account"
                className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-white px-5 py-2 rounded-[6px] transition-all duration-150 shadow-[#1E293B_2px_2px_0px_0px] hover:shadow-[#1E293B_1px_1px_0px_0px] hover:translate-y-[1px]"
                style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}
              >
                <span aria-hidden="true" className="text-blue-200">✦</span>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ──────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => setMobileOpen((p) => !p)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-drawer"
          className="md:hidden p-2 rounded-[6px] text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] border border-transparent hover:border-[#E2E8F0] transition-all duration-150"
        >
          <span className={`block transition-transform duration-200 ${mobileOpen ? 'rotate-90' : ''}`}>
            {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </span>
        </button>
      </div>

      {/* ── Mobile drawer ──────────────────────────────────────────────────── */}
      <div
        id="mobile-drawer"
        aria-hidden={!mobileOpen}
        className={[
          'md:hidden fixed inset-x-0 top-[71px] bottom-0 z-50 bg-white overflow-y-auto transition-all duration-200 border-t border-[#E2E8F0]',
          mobileOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none',
        ].join(' ')}
      >
        <div className="flex flex-col p-4 gap-1 pb-10">
          {/* Main links */}
          {[
            { to: '/',           icon: <Home size={16} />,     label: 'Home'       },
            { to: '/label-crop', icon: <Scissors size={16} />, label: 'Label Crop' },
            { to: '/about',      icon: <Info size={16} />,     label: 'About'      },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={[
                'flex items-center gap-3 px-3 py-3 rounded-[6px] text-[15px] font-medium transition-colors',
                isActive(item.to) ? 'text-[#2563EB] bg-[#EFF6FF]' : 'text-[#0F172A] hover:bg-[#F8FAFC]',
              ].join(' ')}
            >
              <span className={isActive(item.to) ? 'text-[#2563EB]' : 'text-[#64748B]'}>{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {/* Tools accordion */}
          <div className="rounded-[6px] overflow-hidden border border-[#F1F5F9]">
            <button
              type="button"
              onClick={() => setMobileToolsOpen((p) => !p)}
              aria-expanded={mobileToolsOpen}
              className="w-full flex items-center justify-between px-3 py-3 text-[15px] font-medium text-[#0F172A] bg-white hover:bg-[#F8FAFC] transition-colors"
            >
              <span className="flex items-center gap-3">
                <Grid size={16} className="text-[#64748B]" />
                Tools
              </span>
              <ChevronDown
                size={15}
                className={`text-[#94A3B8] transition-transform duration-200 ${mobileToolsOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-200 ${mobileToolsOpen ? 'max-h-[1600px]' : 'max-h-0'}`}
            >
              <div className="border-t border-[#F1F5F9] px-3 py-3 flex flex-col gap-1">
                {/* Category rows */}
                {toolCategories.map((cat) => (
                  <Link
                    key={cat.category}
                    to={cat.href}
                    className="flex items-center justify-between px-2 py-2.5 rounded-[6px] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className="flex items-center justify-center w-7 h-7 rounded-[5px] flex-shrink-0"
                        style={{ background: cat.badgeBg, color: cat.badgeColor }}
                      >
                        {cat.icon}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: cat.badgeColor }}>
                        {cat.category}
                      </span>
                    </span>
                    <ChevronRight size={14} className="text-[#CBD5E1]" />
                  </Link>
                ))}

                {/* All tools grid */}
                <div className="mt-3 pt-3 border-t border-[#F1F5F9]">
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 px-2">
                    Popular Tools
                  </p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                    {toolCategories.flatMap((cat) =>
                      cat.items.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          className="px-2 py-1.5 text-sm text-[#475569] hover:text-[#2563EB] hover:bg-[#F8FAFC] rounded-[4px] transition-colors truncate"
                        >
                          {item.label}
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                <Link
                  to="/tools"
                  className="mt-2 block text-center rounded-[6px] bg-[#EFF6FF] border border-[#BFDBFE] py-2.5 text-sm font-semibold text-[#2563EB] hover:bg-[#DBEAFE] transition-colors"
                >
                  View All 50+ Tools →
                </Link>
              </div>
            </div>
          </div>

          {/* Auth section */}
          <div className="mt-4 flex flex-col gap-2.5 border-t border-[#E2E8F0] pt-4">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]">
                  <Avatar avatarUrl={user?.avatar_url} name={user?.full_name} size={38} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#0F172A] truncate">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-[#64748B] truncate">{user?.email}</p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-[6px] text-[15px] font-semibold text-white transition-all shadow-[#1E293B_2px_2px_0px_0px]"
                  style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}
                >
                  <LayoutDashboard size={16} />
                  Go to Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#E11D48] border border-[#FECDD3] rounded-[6px] hover:bg-[#FFF1F2] transition-colors"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block w-full text-center py-2.5 px-4 rounded-[6px] text-[15px] font-semibold text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-[6px] text-[15px] font-semibold text-white transition-all shadow-[#1E293B_2px_2px_0px_0px]"
                  style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}
                >
                  <span aria-hidden="true" className="text-blue-200">✦</span>
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
