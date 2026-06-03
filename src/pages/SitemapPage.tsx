import { Link } from 'react-router-dom'
import {
  Home, FileType2, Image, Film, Calculator, Tag, Scissors,
  LayoutDashboard, User, Map,
} from 'lucide-react'
import SEO from '@/components/common/SEO'

// ============================================================
// Data
// ============================================================

interface SitemapLink {
  label: string
  path: string
}

interface SitemapSection {
  title: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  links: SitemapLink[]
}

const SECTIONS: SitemapSection[] = [
  {
    title: 'Main Pages',
    icon: Home,
    iconBg: 'bg-[#DBEAFE]',
    iconColor: 'text-[#2563EB]',
    links: [
      { label: 'Home',             path: '/' },
      { label: 'About',            path: '/about' },
      { label: 'Contact',          path: '/contact' },
      { label: 'FAQ',              path: '/faq' },
      { label: 'Privacy Policy',   path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Free Tools Hub',   path: '/tools' },
      { label: 'Sitemap',          path: '/sitemap' },
    ],
  },
  {
    title: 'PDF Tools',
    icon: FileType2,
    iconBg: 'bg-[#DBEAFE]',
    iconColor: 'text-[#2563EB]',
    links: [
      { label: 'PDF Tools Hub',       path: '/pdf' },
      { label: 'Merge PDF',           path: '/pdf/merge' },
      { label: 'Split PDF',           path: '/pdf/split' },
      { label: 'Crop PDF',            path: '/pdf/crop' },
      { label: 'OCR PDF',             path: '/pdf/ocr' },
      { label: 'Compress PDF',        path: '/pdf/compress' },
      { label: 'Remove PDF Password', path: '/pdf/password-remover' },
      { label: 'Rotate PDF',          path: '/pdf/rotate' },
      { label: 'Extract PDF Pages',   path: '/pdf/extract-pages' },
      { label: 'Rearrange PDF Pages', path: '/pdf/rearrange-pages' },
      { label: 'PDF to Image',        path: '/pdf/pdf-to-image' },
      { label: 'Image to PDF',        path: '/pdf/image-to-pdf' },
      { label: 'Watermark PDF',       path: '/pdf/watermark' },
      { label: 'Add Page Numbers',    path: '/pdf/page-numbers' },
    ],
  },
  {
    title: 'Image Tools',
    icon: Image,
    iconBg: 'bg-[#DCFCE7]',
    iconColor: 'text-[#16A34A]',
    links: [
      { label: 'Image Tools Hub',         path: '/image' },
      { label: 'Background Remover',      path: '/image/background-remover' },
      { label: 'Crop Image',              path: '/image/crop-image' },
      { label: 'Resize Image',            path: '/image/resize-image' },
      { label: 'Compress Image',          path: '/image/compress-image' },
      { label: 'JPG to PNG',              path: '/image/jpg-to-png' },
      { label: 'PNG to JPG',              path: '/image/png-to-jpg' },
      { label: 'WEBP Converter',          path: '/image/webp-converter' },
      { label: 'Image Watermark',         path: '/image/image-watermark' },
      { label: 'Product Image Optimizer', path: '/image/product-optimizer' },
      { label: 'White Background',        path: '/image/white-background' },
      { label: 'Square Image Creator',    path: '/image/square-image' },
    ],
  },
  {
    title: 'Video Tools',
    icon: Film,
    iconBg: 'bg-[#FFE4E6]',
    iconColor: 'text-[#E11D48]',
    links: [
      { label: 'Video Tools Hub',  path: '/video' },
      { label: 'Video to GIF',     path: '/video/video-to-gif' },
      { label: 'Frame Extractor',  path: '/video/frame-extractor' },
      { label: 'Compress Video',   path: '/video/compress' },
      { label: 'Resize Video',     path: '/video/resize' },
      { label: 'Video Converter',  path: '/video/converter' },
      { label: 'Thumbnail Generator', path: '/video/thumbnail-generator' },
    ],
  },
  {
    title: 'GST Tools',
    icon: Calculator,
    iconBg: 'bg-[#CFFAFE]',
    iconColor: 'text-[#0891B2]',
    links: [
      { label: 'GST Tools Hub',          path: '/gst' },
      { label: 'GST Verification',       path: '/gst/verification' },
      { label: 'GST Calculator',         path: '/gst/calculator' },
      { label: 'Reverse GST Calculator', path: '/gst/reverse-calculator' },
      { label: 'GST State Finder',       path: '/gst/state-finder' },
      { label: 'HSN Code Search',        path: '/gst/hsn-search' },
      { label: 'SAC Code Search',        path: '/gst/sac-search' },
      { label: 'GST Rate Finder',        path: '/gst/rate-finder' },
    ],
  },
  {
    title: 'SKU Tools',
    icon: Tag,
    iconBg: 'bg-[#EDE9FE]',
    iconColor: 'text-[#7C3AED]',
    links: [
      { label: 'Single SKU Generator',  path: '/tools/sku-generator' },
      { label: 'Bulk SKU Generator',    path: '/tools/bulk-sku' },
      { label: 'Variant SKU Generator', path: '/tools/variant-sku' },
      { label: 'Custom SKU Generator',  path: '/tools/custom-sku' },
      { label: 'Barcode Generator',     path: '/tools/barcode' },
      { label: 'Label Generator',       path: '/tools/label-generator' },
      { label: 'Label Printer',         path: '/tools/label-printer' },
    ],
  },
  {
    title: 'Label Crop Tools',
    icon: Scissors,
    iconBg: 'bg-[#FEF3C7]',
    iconColor: 'text-[#D97706]',
    links: [
      { label: 'Label Crop Hub',      path: '/label-crop' },
      { label: 'Amazon Label Crop',   path: '/label-crop/amazon' },
      { label: 'Flipkart Label Crop', path: '/label-crop/flipkart' },
      { label: 'Myntra Label Crop',   path: '/label-crop/myntra' },
      { label: 'Meesho Label Crop',   path: '/label-crop/meesho' },
      { label: 'AJIO Label Crop',     path: '/label-crop/ajio' },
      { label: 'Nykaa Label Crop',    path: '/label-crop/nykaa' },
      { label: 'Snapdeal Label Crop', path: '/label-crop/snapdeal' },
      { label: 'Shopsy Label Crop',   path: '/label-crop/shopsy' },
    ],
  },
  {
    title: 'Account',
    icon: User,
    iconBg: 'bg-[#F1F5F9]',
    iconColor: 'text-[#64748B]',
    links: [
      { label: 'Login',           path: '/login' },
      { label: 'Register',        path: '/register' },
      { label: 'Forgot Password', path: '/forgot-password' },
      { label: 'Reset Password',  path: '/reset-password' },
    ],
  },
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    iconBg: 'bg-[#F1F5F9]',
    iconColor: 'text-[#64748B]',
    links: [
      { label: 'Dashboard',                    path: '/dashboard' },
      { label: 'Profile',                      path: '/profile' },
      { label: 'Settings',                     path: '/settings' },
      { label: 'Reconciliation',               path: '/reconciliation' },
      { label: 'Reconciliation — Import',      path: '/reconciliation/import' },
      { label: 'Reconciliation — Orders',      path: '/reconciliation/orders' },
      { label: 'Reconciliation — Settlements', path: '/reconciliation/settlements' },
      { label: 'Reconciliation — Report',      path: '/reconciliation/report' },
      { label: 'Reconciliation — Missing',     path: '/reconciliation/missing' },
      { label: 'Inventory',                    path: '/inventory' },
      { label: 'Inventory — Products',         path: '/inventory/products' },
      { label: 'Inventory — Stock Movements',  path: '/inventory/movements' },
      { label: 'Inventory — Warehouses',       path: '/inventory/warehouses' },
      { label: 'Inventory — Purchase Orders',  path: '/inventory/purchase-orders' },
      { label: 'Inventory — Low Stock',        path: '/inventory/low-stock' },
      { label: 'Inventory — Reports',          path: '/inventory/reports' },
    ],
  },
]

const TOTAL = SECTIONS.reduce((sum, s) => sum + s.links.length, 0)

// ============================================================
// Section card
// ============================================================

function SectionCard({ section }: { section: SitemapSection }) {
  const Icon = section.icon
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-[#E2E8F0_2px_2px_0px_0px]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#F1F5F9] px-5 py-4">
        <div className={`flex h-8 w-8 items-center justify-center rounded-[6px] ${section.iconBg}`}>
          <Icon size={15} className={section.iconColor} strokeWidth={2} />
        </div>
        <h2 className="text-sm font-bold text-[#0F172A]">{section.title}</h2>
        <span className="ml-auto rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#64748B]">
          {section.links.length}
        </span>
      </div>

      {/* Links */}
      <ul className="divide-y divide-[#F8FAFC] px-2 py-2">
        {section.links.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className="flex items-center justify-between gap-2 rounded-[6px] px-3 py-2.5 transition-colors hover:bg-[#F8FAFC] hover:text-[#2563EB]"
            >
              <span className="text-sm text-[#334155]">{link.label}</span>
              <span className="shrink-0 text-[11px] text-[#CBD5E1]">{link.path}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ============================================================
// Page
// ============================================================

export default function SitemapPage() {
  return (
    <>
      <SEO
        title="Sitemap | EcomSathi"
        description="Complete sitemap of EcomSathi — all free tool pages, PDF tools, image tools, video tools, GST tools, SKU tools, label crop tools and more."
        canonicalUrl="https://ecomsathi.vercel.app/sitemap"
        noIndex
      />

      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Hero */}
        <section className="border-b border-[#E2E8F0] bg-white">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#EFF6FF]">
                <Map size={20} className="text-[#2563EB]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">Sitemap</h1>
                <p className="text-sm text-[#64748B]">
                  {TOTAL} pages across {SECTIONS.length} sections
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((section) => (
              <SectionCard key={section.title} section={section} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
