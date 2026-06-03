import { lazy, Suspense, Fragment } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  type RouteObject,
} from 'react-router-dom'

import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/routes/ProtectedRoute'
import PublicLayout from '@/layouts/PublicLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import ToolsLayout from '@/layouts/ToolsLayout'
import { PageLoader } from '@/components/common/Loader'
import Analytics from '@/components/common/Analytics'
import CookieBanner from '@/components/common/CookieBanner'

// ============================================================
// Suspense wrapper shorthand
// ============================================================

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

// ============================================================
// Root layout — injects Analytics & CookieBanner inside Router
// so useLocation is available inside those components
// ============================================================

function RootLayout() {
  return (
    <Fragment>
      <Analytics />
      <CookieBanner />
      <Outlet />
    </Fragment>
  )
}

// ============================================================
// Lazy imports — Pages
// ============================================================

const HomePage           = lazy(() => import('./pages/HomePage'))
const AboutPage          = lazy(() => import('./pages/AboutPage'))
const ContactPage        = lazy(() => import('./pages/ContactPage'))
const FAQPage            = lazy(() => import('./pages/FAQPage'))
const PrivacyPage        = lazy(() => import('./pages/PrivacyPage'))
const TermsPage          = lazy(() => import('./pages/TermsPage'))
const PricingPage        = lazy(() => import('./pages/PricingPage'))
const LoginPage          = lazy(() => import('./pages/LoginPage'))
const RegisterPage       = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage'))
const DashboardPage      = lazy(() => import('./pages/DashboardPage'))
const ToolsPage          = lazy(() => import('./pages/ToolsPage'))
const ProfilePage        = lazy(() => import('./pages/ProfilePage'))
const SettingsPage       = lazy(() => import('./pages/SettingsPage'))
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage'))
const ToolErrorPage      = lazy(() => import('./pages/ToolErrorPage'))
const SitemapPage        = lazy(() => import('./pages/SitemapPage'))
const UnsubscribePage    = lazy(() => import('./pages/UnsubscribePage'))

// ============================================================
// Lazy imports — SKU Tools
// ============================================================

const SKUToolsIndex      = lazy(() => import('./modules/sku-tools/index'))
const SingleSKUGenerator = lazy(() => import('./modules/sku-tools/pages/SKUGenerator'))
const BulkSKUGenerator   = lazy(() => import('./modules/sku-tools/pages/BulkSKUGenerator'))
const VariantSKUGenerator= lazy(() => import('./modules/sku-tools/pages/VariantSKUGenerator'))
const CustomSKUGenerator = lazy(() => import('./modules/sku-tools/pages/CustomSKUGenerator'))
const BarcodeGenerator   = lazy(() => import('./modules/sku-tools/pages/BarcodeGeneratorPage'))
const LabelGenerator     = lazy(() => import('./modules/sku-tools/pages/LabelGeneratorPage'))
const LabelPrinter       = lazy(() => import('./modules/sku-tools/pages/LabelPrinterPage'))

// ============================================================
// Lazy imports — PDF Tools
// ============================================================

const PDFToolsIndex        = lazy(() => import('./modules/pdf-tools/index'))
const MergePDF             = lazy(() => import('./modules/pdf-tools/pages/MergePDF'))
const SplitPDF             = lazy(() => import('./modules/pdf-tools/pages/SplitPDF'))
const CropPDF              = lazy(() => import('./modules/pdf-tools/pages/CropPDF'))
const OCRPDF               = lazy(() => import('./modules/pdf-tools/pages/OCRPDF'))
const CompressPDF          = lazy(() => import('./modules/pdf-tools/pages/CompressPDF'))
const PasswordRemover      = lazy(() => import('./modules/pdf-tools/pages/PasswordRemover'))
const RotatePDF            = lazy(() => import('./modules/pdf-tools/pages/RotatePDF'))
const ExtractPages         = lazy(() => import('./modules/pdf-tools/pages/ExtractPages'))
const RearrangePages       = lazy(() => import('./modules/pdf-tools/pages/RearrangePages'))
const PDFToImage           = lazy(() => import('./modules/pdf-tools/pages/PDFToImage'))
const ImageToPDF           = lazy(() => import('./modules/pdf-tools/pages/ImageToPDF'))
const WatermarkPDF         = lazy(() => import('./modules/pdf-tools/pages/WatermarkPDF'))
const PageNumbersPDF       = lazy(() => import('./modules/pdf-tools/pages/PageNumbersPDF'))

// ============================================================
// Lazy imports — Image Tools
// ============================================================

const ImageToolsIndex      = lazy(() => import('./modules/image-tools/index'))
const BackgroundRemover    = lazy(() => import('./modules/image-tools/BackgroundRemover'))
const CropImage            = lazy(() => import('./modules/image-tools/CropImage'))
const ResizeImage          = lazy(() => import('./modules/image-tools/ResizeImage'))
const CompressImage        = lazy(() => import('./modules/image-tools/CompressImage'))
const JPGtoPNG             = lazy(() => import('./modules/image-tools/JPGtoPNG'))
const PNGtoJPG             = lazy(() => import('./modules/image-tools/PNGtoJPG'))
const WEBPConverter        = lazy(() => import('./modules/image-tools/WEBPConverter'))
const ImageWatermark       = lazy(() => import('./modules/image-tools/ImageWatermark'))
const ProductOptimizer     = lazy(() => import('./modules/image-tools/ProductOptimizer'))
const WhiteBackground      = lazy(() => import('./modules/image-tools/WhiteBackground'))
const SquareImageCreator   = lazy(() => import('./modules/image-tools/SquareImageCreator'))

// ============================================================
// Lazy imports — Video Tools
// ============================================================

const VideoToolsIndex      = lazy(() => import('./modules/video-tools/index'))
const VideoToGIF           = lazy(() => import('./modules/video-tools/pages/VideoToGif'))
const FrameExtractor       = lazy(() => import('./modules/video-tools/pages/FrameExtractor'))
const CompressVideo        = lazy(() => import('./modules/video-tools/pages/CompressVideo'))
const ResizeVideo          = lazy(() => import('./modules/video-tools/pages/ResizeVideo'))
const VideoConverter       = lazy(() => import('./modules/video-tools/pages/VideoConverter'))
const ThumbnailGenerator   = lazy(() => import('./modules/video-tools/pages/ThumbnailGenerator'))

// ============================================================
// Lazy imports — GST Tools
// ============================================================

const GSTToolsIndex        = lazy(() => import('./modules/gst-tools/index'))
const GSTCalculator        = lazy(() => import('./modules/gst-tools/GSTCalculator'))
const ReverseGSTCalculator = lazy(() => import('./modules/gst-tools/ReverseGSTCalculator'))
const GSTRateFinder        = lazy(() => import('./modules/gst-tools/GSTRateFinder'))
const GSTStateFinder       = lazy(() => import('./modules/gst-tools/GSTStateFinder'))
const PANValidator         = lazy(() => import('./modules/gst-tools/PANValidator'))
const HSNSearch            = lazy(() => import('./modules/gst-tools/HSNSearch'))
const SACSearch            = lazy(() => import('./modules/gst-tools/SACSearch'))

// GST Verification — unified page (merges search + verify + validator)
const GSTVerificationPage  = lazy(() => import('./modules/gst-tools/pages/GSTVerification'))

// ============================================================
// Lazy imports — Label Crop
// ============================================================

const LabelCropHub         = lazy(() => import('./modules/label-crop/pages/LabelCropHub'))
const AmazonLabelCrop      = lazy(() => import('./modules/label-crop/pages/AmazonLabelCrop'))
const FlipkartLabelCrop    = lazy(() => import('./modules/label-crop/pages/FlipkartLabelCrop'))
const MyntraLabelCrop      = lazy(() => import('./modules/label-crop/pages/MyntraLabelCrop'))
const MeeshoLabelCrop      = lazy(() => import('./modules/label-crop/pages/MeeshoLabelCrop'))
const AjioLabelCrop        = lazy(() => import('./modules/label-crop/pages/AjioLabelCrop'))
const NykaaLabelCrop       = lazy(() => import('./modules/label-crop/pages/NykaaLabelCrop'))
const SnapdealLabelCrop    = lazy(() => import('./modules/label-crop/pages/SnapdealLabelCrop'))

// ============================================================
// Lazy imports — Reconciliation (premium)
// ============================================================

const ReconciliationModule    = lazy(() => import('./modules/reconciliation/index'))
const ReconciliationDashboard = lazy(() => import('./modules/reconciliation/ReconciliationDashboard'))
const ImportWizard            = lazy(() => import('./modules/reconciliation/ImportWizard'))
const OrdersTable             = lazy(() => import('./modules/reconciliation/OrdersTable'))
const SettlementsTable        = lazy(() => import('./modules/reconciliation/SettlementsTable'))
const ReportView              = lazy(() => import('./modules/reconciliation/ReportView'))
const MissingPayments         = lazy(() => import('./modules/reconciliation/MissingPayments'))

// ============================================================
// Lazy imports — Inventory (premium)
// ============================================================

const InventoryModule      = lazy(() => import('./modules/inventory/index'))
const ProductMaster        = lazy(() => import('./modules/inventory/ProductMaster'))
const InventoryView        = lazy(() => import('./modules/inventory/InventoryView'))
const StockMovements       = lazy(() => import('./modules/inventory/StockMovements'))
const Warehouses           = lazy(() => import('./modules/inventory/Warehouses'))
const PurchaseOrders       = lazy(() => import('./modules/inventory/PurchaseOrders'))
const LowStockAlerts       = lazy(() => import('./modules/inventory/LowStockAlerts'))
const InventoryReports     = lazy(() => import('./modules/inventory/InventoryReports'))

// ============================================================
// Route definitions
// ============================================================

const routes: RouteObject[] = [
  // ----------------------------------------------------------------
  // Root wrapper — provides Analytics + CookieBanner inside Router
  // ----------------------------------------------------------------
  {
    element: <RootLayout />,
    children: [

  // ----------------------------------------------------------------
  // Public pages — wrapped in PublicLayout (Navbar + Footer)
  // ----------------------------------------------------------------
  {
    element: <PublicLayout />,
    children: [
      { path: '/',        element: <S><HomePage /></S> },
      { path: '/about',   element: <S><AboutPage /></S> },
      { path: '/contact', element: <S><ContactPage /></S> },
      { path: '/faq',     element: <S><FAQPage /></S> },
      { path: '/privacy', element: <S><PrivacyPage /></S> },
      { path: '/terms',   element: <S><TermsPage /></S> },
      { path: '/pricing', element: <S><PricingPage /></S> },
      { path: '/sitemap',     element: <S><SitemapPage /></S> },
      { path: '/unsubscribe', element: <S><UnsubscribePage /></S> },
    ],
  },

  // ----------------------------------------------------------------
  // Auth pages — centered, no sidebar/footer chrome
  // ----------------------------------------------------------------
  { path: '/login',           element: <S><LoginPage /></S> },
  { path: '/register',        element: <S><RegisterPage /></S> },
  { path: '/forgot-password', element: <S><ForgotPasswordPage /></S> },
  { path: '/reset-password',  element: <S><ResetPasswordPage /></S> },

  // ----------------------------------------------------------------
  // /tools — overview + all category hubs + individual tools
  // ----------------------------------------------------------------
  {
    path: '/tools',
    element: <ToolsLayout />,
    errorElement: <S><ToolErrorPage /></S>,
    children: [
      // /tools → overview (all tools)
      {
        index: true,
        element: <S><ToolsPage /></S>,
        handle: { tool: 'All Tools', category: 'Tools', crumbs: [] },
      },

      // ── /tools/sku — SKU Tools hub + individual tools ──────────
      {
        path: 'sku',
        children: [
          {
            index: true,
            element: <S><SKUToolsIndex /></S>,
            handle: { tool: 'SKU Tools', category: 'SKU Tools', crumbs: [] },
          },
          {
            path: 'generator',
            element: <S><SingleSKUGenerator /></S>,
            handle: {
              tool: 'SKU Generator',
              category: 'SKU Tools',
              description: 'Generate unique SKUs from brand, category, color and size.',
              crumbs: [{ label: 'SKU Tools', to: '/tools/sku' }],
              relatedTools: [
                { label: 'Bulk SKU Generator',    to: '/tools/sku/bulk-generator' },
                { label: 'Variant SKU Generator', to: '/tools/sku/variant-generator' },
                { label: 'Custom SKU Generator',  to: '/tools/sku/custom-generator' },
                { label: 'Barcode Generator',     to: '/tools/sku/barcode' },
              ],
            },
          },
          // Redirect old path → new path
          { path: 'bulk', element: <Navigate to="/tools/sku/bulk-generator" replace /> },
          {
            path: 'bulk-generator',
            element: <S><BulkSKUGenerator /></S>,
            handle: {
              tool: 'Bulk SKU Generator',
              category: 'SKU Tools',
              description: 'Upload CSV or Excel to generate SKUs for all products at once.',
              crumbs: [{ label: 'SKU Tools', to: '/tools/sku' }],
              relatedTools: [
                { label: 'SKU Generator',          to: '/tools/sku/generator' },
                { label: 'Variant SKU Generator',  to: '/tools/sku/variant-generator' },
                { label: 'Label Generator',        to: '/tools/sku/label-generator' },
                { label: 'Label Printer',          to: '/tools/sku/label-printer' },
              ],
            },
          },
          { path: 'variant', element: <Navigate to="/tools/sku/variant-generator" replace /> },
          {
            path: 'variant-generator',
            element: <S><VariantSKUGenerator /></S>,
            handle: {
              tool: 'Variant SKU Generator',
              category: 'SKU Tools',
              description: 'Generate all Color × Size × Material SKU combinations automatically.',
              crumbs: [{ label: 'SKU Tools', to: '/tools/sku' }],
              relatedTools: [
                { label: 'SKU Generator',         to: '/tools/sku/generator' },
                { label: 'Bulk SKU Generator',    to: '/tools/sku/bulk-generator' },
                { label: 'Custom SKU Generator',  to: '/tools/sku/custom-generator' },
                { label: 'Barcode Generator',     to: '/tools/sku/barcode' },
              ],
            },
          },
          { path: 'custom', element: <Navigate to="/tools/sku/custom-generator" replace /> },
          {
            path: 'custom-generator',
            element: <S><CustomSKUGenerator /></S>,
            handle: {
              tool: 'Custom SKU Generator',
              category: 'SKU Tools',
              description: 'Build your own SKU pattern using token blocks. Save and reuse presets.',
              crumbs: [{ label: 'SKU Tools', to: '/tools/sku' }],
              relatedTools: [
                { label: 'SKU Generator',          to: '/tools/sku/generator' },
                { label: 'Variant SKU Generator',  to: '/tools/sku/variant-generator' },
                { label: 'Bulk SKU Generator',     to: '/tools/sku/bulk-generator' },
                { label: 'Barcode Generator',      to: '/tools/sku/barcode' },
              ],
            },
          },
          {
            path: 'barcode',
            element: <S><BarcodeGenerator /></S>,
            handle: {
              tool: 'Barcode Generator',
              category: 'SKU Tools',
              description: 'Generate Code 128, EAN-13, EAN-8, UPC-A and QR Code barcodes from any SKU.',
              crumbs: [{ label: 'SKU Tools', to: '/tools/sku' }],
              relatedTools: [
                { label: 'SKU Generator',     to: '/tools/sku/generator' },
                { label: 'Label Generator',   to: '/tools/sku/label-generator' },
                { label: 'Label Printer',     to: '/tools/sku/label-printer' },
              ],
            },
          },
          {
            path: 'label-generator',
            element: <S><LabelGenerator /></S>,
            handle: {
              tool: 'Label Generator',
              category: 'SKU Tools',
              description: 'Create printable product labels with SKU, barcode, price and MRP.',
              crumbs: [{ label: 'SKU Tools', to: '/tools/sku' }],
              relatedTools: [
                { label: 'Label Printer',          to: '/tools/sku/label-printer' },
                { label: 'Barcode Generator',      to: '/tools/sku/barcode' },
                { label: 'SKU Generator',          to: '/tools/sku/generator' },
                { label: 'Bulk SKU Generator',     to: '/tools/sku/bulk-generator' },
              ],
            },
          },
          {
            path: 'label-printer',
            element: <S><LabelPrinter /></S>,
            handle: {
              tool: 'Label Printer',
              category: 'SKU Tools',
              description: 'Print barcode labels in bulk — A4, thermal 80mm, thermal 58mm and sticker formats.',
              crumbs: [{ label: 'SKU Tools', to: '/tools/sku' }],
              relatedTools: [
                { label: 'Label Generator',        to: '/tools/sku/label-generator' },
                { label: 'Barcode Generator',      to: '/tools/sku/barcode' },
                { label: 'SKU Generator',          to: '/tools/sku/generator' },
                { label: 'Bulk SKU Generator',     to: '/tools/sku/bulk-generator' },
              ],
            },
          },
        ],
      },

      // ── /tools/pdf — PDF Tools hub + individual tools ──────────
      {
        path: 'pdf',
        children: [
          {
            index: true,
            element: <S><PDFToolsIndex /></S>,
            handle: { tool: 'PDF Tools', category: 'PDF Tools', crumbs: [] },
          },
          {
            path: 'merge',
            element: <S><MergePDF /></S>,
            handle: { tool: 'Merge PDF', category: 'PDF Tools', description: 'Combine multiple PDFs into one. Drag to reorder.', crumbs: [{ label: 'PDF Tools', to: '/tools/pdf' }] },
          },
          {
            path: 'split',
            element: <S><SplitPDF /></S>,
            handle: { tool: 'Split PDF', category: 'PDF Tools', description: 'Split by page ranges, every N pages, or individual pages.', crumbs: [{ label: 'PDF Tools', to: '/tools/pdf' }] },
          },
          {
            path: 'crop',
            element: <S><CropPDF /></S>,
            handle: { tool: 'Crop PDF', category: 'PDF Tools', description: 'Trim PDF page margins on all or selected pages.', crumbs: [{ label: 'PDF Tools', to: '/tools/pdf' }] },
          },
          {
            path: 'ocr',
            element: <S><OCRPDF /></S>,
            handle: { tool: 'OCR PDF', category: 'PDF Tools', description: 'Extract text from scanned PDFs using Tesseract OCR.', crumbs: [{ label: 'PDF Tools', to: '/tools/pdf' }] },
          },
          {
            path: 'compress',
            element: <S><CompressPDF /></S>,
            handle: { tool: 'Compress PDF', category: 'PDF Tools', description: 'Reduce PDF size with Light, Balanced, or Maximum compression.', crumbs: [{ label: 'PDF Tools', to: '/tools/pdf' }] },
          },
          {
            path: 'password',
            element: <S><PasswordRemover /></S>,
            handle: { tool: 'Remove PDF Password', category: 'PDF Tools', description: 'Unlock a password-protected PDF you own.', crumbs: [{ label: 'PDF Tools', to: '/tools/pdf' }] },
          },
          {
            path: 'rotate',
            element: <S><RotatePDF /></S>,
            handle: { tool: 'Rotate PDF', category: 'PDF Tools', description: 'Rotate all or specific pages 90°, 180°, or 270°.', crumbs: [{ label: 'PDF Tools', to: '/tools/pdf' }] },
          },
          {
            path: 'extract',
            element: <S><ExtractPages /></S>,
            handle: { tool: 'Extract PDF Pages', category: 'PDF Tools', description: 'Extract specific pages into a new PDF.', crumbs: [{ label: 'PDF Tools', to: '/tools/pdf' }] },
          },
          {
            path: 'rearrange',
            element: <S><RearrangePages /></S>,
            handle: { tool: 'Rearrange PDF Pages', category: 'PDF Tools', description: 'Reorder, delete, or duplicate PDF pages.', crumbs: [{ label: 'PDF Tools', to: '/tools/pdf' }] },
          },
          {
            path: 'to-images',
            element: <S><PDFToImage /></S>,
            handle: { tool: 'PDF to Images', category: 'PDF Tools', description: 'Convert PDF pages to PNG or JPEG at 72, 150, or 300 DPI.', crumbs: [{ label: 'PDF Tools', to: '/tools/pdf' }] },
          },
          {
            path: 'images-to-pdf',
            element: <S><ImageToPDF /></S>,
            handle: { tool: 'Images to PDF', category: 'PDF Tools', description: 'Combine JPG, PNG, or WEBP images into a single PDF.', crumbs: [{ label: 'PDF Tools', to: '/tools/pdf' }] },
          },
          {
            path: 'watermark',
            element: <S><WatermarkPDF /></S>,
            handle: { tool: 'Watermark PDF', category: 'PDF Tools', description: 'Add text watermark with custom color, opacity, and position.', crumbs: [{ label: 'PDF Tools', to: '/tools/pdf' }] },
          },
          {
            path: 'page-numbers',
            element: <S><PageNumbersPDF /></S>,
            handle: { tool: 'Add Page Numbers', category: 'PDF Tools', description: 'Add page numbers with custom style, position, and font.', crumbs: [{ label: 'PDF Tools', to: '/tools/pdf' }] },
          },
        ],
      },

      // ── /tools/image — Image Tools hub + individual tools ──────
      {
        path: 'image',
        children: [
          {
            index: true,
            element: <S><ImageToolsIndex /></S>,
            handle: { tool: 'Image Tools', category: 'Image Tools', crumbs: [] },
          },
          {
            path: 'background-remover',
            element: <S><BackgroundRemover /></S>,
            handle: {
              tool: 'Background Remover',
              category: 'Image Tools',
              description: 'Remove backgrounds from product images automatically using AI.',
              crumbs: [{ label: 'Image Tools', to: '/tools/image' }],
              relatedTools: [
                { label: 'White Background',     to: '/tools/image/white-background' },
                { label: 'Product Optimizer',    to: '/tools/image/product-optimizer' },
                { label: 'Compress Image',       to: '/tools/image/compress' },
                { label: 'Resize Image',         to: '/tools/image/resize' },
                { label: 'Square Image Creator', to: '/tools/image/square' },
              ],
            },
          },
          {
            path: 'crop',
            element: <S><CropImage /></S>,
            handle: {
              tool: 'Crop Image',
              category: 'Image Tools',
              description: 'Drag-and-drop crop with aspect ratio presets and rotation support.',
              crumbs: [{ label: 'Image Tools', to: '/tools/image' }],
              relatedTools: [
                { label: 'Resize Image',         to: '/tools/image/resize' },
                { label: 'Square Image Creator', to: '/tools/image/square' },
                { label: 'Compress Image',       to: '/tools/image/compress' },
                { label: 'Image Watermark',      to: '/tools/image/watermark' },
              ],
            },
          },
          {
            path: 'resize',
            element: <S><ResizeImage /></S>,
            handle: {
              tool: 'Resize Image',
              category: 'Image Tools',
              description: 'Resize by custom dimensions, percentage, or marketplace presets.',
              crumbs: [{ label: 'Image Tools', to: '/tools/image' }],
              relatedTools: [
                { label: 'Compress Image',       to: '/tools/image/compress' },
                { label: 'Crop Image',           to: '/tools/image/crop' },
                { label: 'Product Optimizer',    to: '/tools/image/product-optimizer' },
                { label: 'Square Image Creator', to: '/tools/image/square' },
              ],
            },
          },
          {
            path: 'compress',
            element: <S><CompressImage /></S>,
            handle: {
              tool: 'Compress Image',
              category: 'Image Tools',
              description: 'Reduce file size with quality control and optional target size input.',
              crumbs: [{ label: 'Image Tools', to: '/tools/image' }],
              relatedTools: [
                { label: 'Resize Image',      to: '/tools/image/resize' },
                { label: 'JPG to PNG',        to: '/tools/image/jpg-to-png' },
                { label: 'WEBP Converter',    to: '/tools/image/webp' },
                { label: 'Product Optimizer', to: '/tools/image/product-optimizer' },
              ],
            },
          },
          {
            path: 'jpg-to-png',
            element: <S><JPGtoPNG /></S>,
            handle: {
              tool: 'JPG to PNG',
              category: 'Image Tools',
              description: 'Convert JPG/JPEG images to PNG format. Supports batch conversion.',
              crumbs: [{ label: 'Image Tools', to: '/tools/image' }],
              relatedTools: [
                { label: 'PNG to JPG',           to: '/tools/image/png-to-jpg' },
                { label: 'WEBP Converter',       to: '/tools/image/webp' },
                { label: 'Compress Image',       to: '/tools/image/compress' },
                { label: 'Background Remover',   to: '/tools/image/background-remover' },
              ],
            },
          },
          {
            path: 'png-to-jpg',
            element: <S><PNGtoJPG /></S>,
            handle: {
              tool: 'PNG to JPG',
              category: 'Image Tools',
              description: 'Convert PNG files to JPEG with custom background color for transparency.',
              crumbs: [{ label: 'Image Tools', to: '/tools/image' }],
              relatedTools: [
                { label: 'JPG to PNG',        to: '/tools/image/jpg-to-png' },
                { label: 'WEBP Converter',    to: '/tools/image/webp' },
                { label: 'Compress Image',    to: '/tools/image/compress' },
                { label: 'White Background',  to: '/tools/image/white-background' },
              ],
            },
          },
          {
            path: 'webp',
            element: <S><WEBPConverter /></S>,
            handle: {
              tool: 'WEBP Converter',
              category: 'Image Tools',
              description: 'Convert between WEBP and PNG/JPG formats in both directions.',
              crumbs: [{ label: 'Image Tools', to: '/tools/image' }],
              relatedTools: [
                { label: 'JPG to PNG',        to: '/tools/image/jpg-to-png' },
                { label: 'PNG to JPG',        to: '/tools/image/png-to-jpg' },
                { label: 'Compress Image',    to: '/tools/image/compress' },
                { label: 'Product Optimizer', to: '/tools/image/product-optimizer' },
              ],
            },
          },
          {
            path: 'watermark',
            element: <S><ImageWatermark /></S>,
            handle: {
              tool: 'Image Watermark',
              category: 'Image Tools',
              description: 'Add text or logo watermarks with opacity, size, and position control.',
              crumbs: [{ label: 'Image Tools', to: '/tools/image' }],
              relatedTools: [
                { label: 'Resize Image',      to: '/tools/image/resize' },
                { label: 'Compress Image',    to: '/tools/image/compress' },
                { label: 'Crop Image',        to: '/tools/image/crop' },
                { label: 'Product Optimizer', to: '/tools/image/product-optimizer' },
              ],
            },
          },
          {
            path: 'product-optimizer',
            element: <S><ProductOptimizer /></S>,
            handle: {
              tool: 'Product Image Optimizer',
              category: 'Image Tools',
              description: 'Optimize product images for Amazon, Flipkart, Myntra, Meesho, and more.',
              crumbs: [{ label: 'Image Tools', to: '/tools/image' }],
              relatedTools: [
                { label: 'Background Remover', to: '/tools/image/background-remover' },
                { label: 'White Background',   to: '/tools/image/white-background' },
                { label: 'Resize Image',       to: '/tools/image/resize' },
                { label: 'Compress Image',     to: '/tools/image/compress' },
              ],
            },
          },
          {
            path: 'white-background',
            element: <S><WhiteBackground /></S>,
            handle: {
              tool: 'White Background',
              category: 'Image Tools',
              description: 'Replace product photo backgrounds with white for marketplace compliance.',
              crumbs: [{ label: 'Image Tools', to: '/tools/image' }],
              relatedTools: [
                { label: 'Background Remover',   to: '/tools/image/background-remover' },
                { label: 'Product Optimizer',    to: '/tools/image/product-optimizer' },
                { label: 'Square Image Creator', to: '/tools/image/square' },
                { label: 'Compress Image',       to: '/tools/image/compress' },
              ],
            },
          },
          {
            path: 'square',
            element: <S><SquareImageCreator /></S>,
            handle: {
              tool: 'Square Image Creator',
              category: 'Image Tools',
              description: 'Add padding to make any image perfectly square. Pick position and fill color.',
              crumbs: [{ label: 'Image Tools', to: '/tools/image' }],
              relatedTools: [
                { label: 'Resize Image',      to: '/tools/image/resize' },
                { label: 'Crop Image',        to: '/tools/image/crop' },
                { label: 'White Background',  to: '/tools/image/white-background' },
                { label: 'Product Optimizer', to: '/tools/image/product-optimizer' },
              ],
            },
          },
        ],
      },

      // ── /tools/video — Video Tools hub + individual tools ──────
      {
        path: 'video',
        children: [
          {
            index: true,
            element: <S><VideoToolsIndex /></S>,
            handle: { tool: 'Video Tools', category: 'Video Tools', crumbs: [] },
          },
          {
            path: 'to-gif',
            element: <S><VideoToGIF /></S>,
            handle: {
              tool: 'Video to GIF',
              category: 'Video Tools',
              description: 'Convert video clips to animated GIF for ecommerce listings.',
              crumbs: [{ label: 'Video Tools', to: '/tools/video' }],
              relatedTools: [
                { label: 'Frame Extractor',      to: '/tools/video/frame-extractor' },
                { label: 'Compress Video',       to: '/tools/video/compress' },
                { label: 'Thumbnail Generator',  to: '/tools/video/thumbnail-generator' },
                { label: 'Video Converter',      to: '/tools/video/converter' },
                { label: 'Resize Video',         to: '/tools/video/resize' },
              ],
            },
          },
          {
            path: 'frame-extractor',
            element: <S><FrameExtractor /></S>,
            handle: {
              tool: 'Frame Extractor',
              category: 'Video Tools',
              description: 'Extract individual frames from any video as JPEG images.',
              crumbs: [{ label: 'Video Tools', to: '/tools/video' }],
              relatedTools: [
                { label: 'Thumbnail Generator', to: '/tools/video/thumbnail-generator' },
                { label: 'Video to GIF',        to: '/tools/video/to-gif' },
                { label: 'Compress Video',      to: '/tools/video/compress' },
                { label: 'Video Converter',     to: '/tools/video/converter' },
                { label: 'Resize Video',        to: '/tools/video/resize' },
              ],
            },
          },
          {
            path: 'compress',
            element: <S><CompressVideo /></S>,
            handle: {
              tool: 'Compress Video',
              category: 'Video Tools',
              description: 'Reduce video file size for marketplace uploads and social media.',
              crumbs: [{ label: 'Video Tools', to: '/tools/video' }],
              relatedTools: [
                { label: 'Resize Video',        to: '/tools/video/resize' },
                { label: 'Video Converter',     to: '/tools/video/converter' },
                { label: 'Video to GIF',        to: '/tools/video/to-gif' },
                { label: 'Thumbnail Generator', to: '/tools/video/thumbnail-generator' },
                { label: 'Frame Extractor',     to: '/tools/video/frame-extractor' },
              ],
            },
          },
          {
            path: 'resize',
            element: <S><ResizeVideo /></S>,
            handle: {
              tool: 'Resize Video',
              category: 'Video Tools',
              description: 'Change video resolution for marketplace requirements.',
              crumbs: [{ label: 'Video Tools', to: '/tools/video' }],
              relatedTools: [
                { label: 'Compress Video',      to: '/tools/video/compress' },
                { label: 'Video Converter',     to: '/tools/video/converter' },
                { label: 'Thumbnail Generator', to: '/tools/video/thumbnail-generator' },
                { label: 'Video to GIF',        to: '/tools/video/to-gif' },
                { label: 'Frame Extractor',     to: '/tools/video/frame-extractor' },
              ],
            },
          },
          {
            path: 'converter',
            element: <S><VideoConverter /></S>,
            handle: {
              tool: 'Video Converter',
              category: 'Video Tools',
              description: 'Convert between MP4, MOV, AVI, WEBM, MKV formats.',
              crumbs: [{ label: 'Video Tools', to: '/tools/video' }],
              relatedTools: [
                { label: 'Compress Video',      to: '/tools/video/compress' },
                { label: 'Resize Video',        to: '/tools/video/resize' },
                { label: 'Video to GIF',        to: '/tools/video/to-gif' },
                { label: 'Thumbnail Generator', to: '/tools/video/thumbnail-generator' },
                { label: 'Frame Extractor',     to: '/tools/video/frame-extractor' },
              ],
            },
          },
          {
            path: 'thumbnail-generator',
            element: <S><ThumbnailGenerator /></S>,
            handle: {
              tool: 'Thumbnail Generator',
              category: 'Video Tools',
              description: 'Extract the perfect thumbnail from your product video.',
              crumbs: [{ label: 'Video Tools', to: '/tools/video' }],
              relatedTools: [
                { label: 'Frame Extractor',  to: '/tools/video/frame-extractor' },
                { label: 'Video to GIF',     to: '/tools/video/to-gif' },
                { label: 'Compress Video',   to: '/tools/video/compress' },
                { label: 'Resize Video',     to: '/tools/video/resize' },
                { label: 'Video Converter',  to: '/tools/video/converter' },
              ],
            },
          },
        ],
      },

      // ── /tools/gst — GST Tools hub + individual tools ──────────
      {
        path: 'gst',
        children: [
          {
            index: true,
            element: <S><GSTToolsIndex /></S>,
            handle: { tool: 'GST Tools', category: 'GST Tools', crumbs: [] },
          },
          {
            // Unified: GST Search + GST Verify + GSTIN Validator merged
            path: 'verify',
            element: <S><GSTVerificationPage /></S>,
            handle: {
              tool: 'GST Verification',
              category: 'GST Tools',
              description: 'Validate GSTIN format, checksum & all 6 structure checks — then verify live on the GSTN portal.',
              crumbs: [{ label: 'GST Tools', to: '/tools/gst' }],
              relatedTools: [
                { label: 'GST State Finder',       to: '/tools/gst/state-finder' },
                { label: 'GST Calculator',         to: '/tools/gst/calculator' },
                { label: 'Reverse GST Calculator', to: '/tools/gst/reverse' },
                { label: 'HSN Code Search',        to: '/tools/gst/hsn-search' },
              ],
            },
          },
          {
            path: 'calculator',
            element: <S><GSTCalculator /></S>,
            handle: {
              tool: 'GST Calculator',
              category: 'GST Tools',
              description: 'Calculate CGST + SGST (intra-state) or IGST (inter-state) for any amount.',
              crumbs: [{ label: 'GST Tools', to: '/tools/gst' }],
              relatedTools: [
                { label: 'Reverse GST Calculator', to: '/tools/gst/reverse' },
                { label: 'GST Rate Finder',        to: '/tools/gst/rate-finder' },
                { label: 'HSN Code Search',        to: '/tools/gst/hsn-search' },
              ],
            },
          },
          {
            path: 'reverse',
            element: <S><ReverseGSTCalculator /></S>,
            handle: {
              tool: 'Reverse GST Calculator',
              category: 'GST Tools',
              description: 'Enter a GST-inclusive price to extract the base amount and tax breakdown.',
              crumbs: [{ label: 'GST Tools', to: '/tools/gst' }],
              relatedTools: [
                { label: 'GST Calculator',  to: '/tools/gst/calculator' },
                { label: 'GST Rate Finder', to: '/tools/gst/rate-finder' },
              ],
            },
          },
          {
            path: 'rate-finder',
            element: <S><GSTRateFinder /></S>,
            handle: {
              tool: 'GST Rate Finder',
              category: 'GST Tools',
              description: 'Find the applicable GST rate for any product (HSN) or service (SAC).',
              crumbs: [{ label: 'GST Tools', to: '/tools/gst' }],
              relatedTools: [
                { label: 'HSN Code Search', to: '/tools/gst/hsn-search' },
                { label: 'SAC Code Search', to: '/tools/gst/sac-search' },
                { label: 'GST Calculator',  to: '/tools/gst/calculator' },
              ],
            },
          },
          {
            path: 'state-finder',
            element: <S><GSTStateFinder /></S>,
            handle: {
              tool: 'GST State Finder',
              category: 'GST Tools',
              description: 'Find state name and code from any 2-digit GST state code or full GSTIN.',
              crumbs: [{ label: 'GST Tools', to: '/tools/gst' }],
              relatedTools: [
                { label: 'GST Verification', to: '/tools/gst/verify' },
                { label: 'GST Verification', to: '/tools/gst/verify' },
                { label: 'GST Calculator',  to: '/tools/gst/calculator' },
              ],
            },
          },
          {
            path: 'pan-validator',
            element: <S><PANValidator /></S>,
            handle: {
              tool: 'PAN Validator',
              category: 'GST Tools',
              description: 'Validate PAN card numbers for individuals and businesses.',
              crumbs: [{ label: 'GST Tools', to: '/tools/gst' }],
              relatedTools: [
                { label: 'GST Verification', to: '/tools/gst/verify' },
                { label: 'GST Verification', to: '/tools/gst/verify' },
              ],
            },
          },
          {
            path: 'hsn-search',
            element: <S><HSNSearch /></S>,
            handle: {
              tool: 'HSN Code Search',
              category: 'GST Tools',
              description: 'Find HSN codes for goods by code or description with GST rates.',
              crumbs: [{ label: 'GST Tools', to: '/tools/gst' }],
              relatedTools: [
                { label: 'SAC Code Search', to: '/tools/gst/sac-search' },
                { label: 'GST Rate Finder', to: '/tools/gst/rate-finder' },
                { label: 'GST Calculator',  to: '/tools/gst/calculator' },
              ],
            },
          },
          {
            path: 'sac-search',
            element: <S><SACSearch /></S>,
            handle: {
              tool: 'SAC Code Search',
              category: 'GST Tools',
              description: 'Search Service Accounting Codes by code or service description.',
              crumbs: [{ label: 'GST Tools', to: '/tools/gst' }],
              relatedTools: [
                { label: 'HSN Code Search', to: '/tools/gst/hsn-search' },
                { label: 'GST Rate Finder', to: '/tools/gst/rate-finder' },
                { label: 'GST Calculator',  to: '/tools/gst/calculator' },
              ],
            },
          },
        ],
      },

    ],
  },

  // ----------------------------------------------------------------
  // Label Crop — standalone /label-crop hub + marketplace pages
  // ----------------------------------------------------------------
  {
    path: '/label-crop',
    element: <ToolsLayout />,
    errorElement: <S><ToolErrorPage /></S>,
    children: [
      {
        index: true,
        element: <S><LabelCropHub /></S>,
        handle: { tool: 'Label Crop', category: 'Label Tools' },
      },
      {
        path: 'amazon',
        element: <S><AmazonLabelCrop /></S>,
        handle: {
          tool: 'Amazon Label Crop',
          category: 'Label Tools',
          description: 'Crop Amazon shipping labels to thermal or A4 format.',
          relatedTools: [
            { label: 'Flipkart Label Crop', to: '/label-crop/flipkart' },
            { label: 'Myntra Label Crop',   to: '/label-crop/myntra' },
            { label: 'Meesho Label Crop',   to: '/label-crop/meesho' },
            { label: 'AJIO Label Crop',     to: '/label-crop/ajio' },
          ],
        },
      },
      {
        path: 'flipkart',
        element: <S><FlipkartLabelCrop /></S>,
        handle: {
          tool: 'Flipkart Label Crop',
          category: 'Label Tools',
          description: 'Crop Flipkart shipping labels to thermal or A4 format.',
          relatedTools: [
            { label: 'Amazon Label Crop',   to: '/label-crop/amazon' },
            { label: 'Myntra Label Crop',   to: '/label-crop/myntra' },
            { label: 'Meesho Label Crop',   to: '/label-crop/meesho' },
            { label: 'AJIO Label Crop',     to: '/label-crop/ajio' },
          ],
        },
      },
      {
        path: 'myntra',
        element: <S><MyntraLabelCrop /></S>,
        handle: {
          tool: 'Myntra Label Crop',
          category: 'Label Tools',
          description: 'Crop Myntra shipping labels to thermal or A4 format.',
          relatedTools: [
            { label: 'Amazon Label Crop',   to: '/label-crop/amazon' },
            { label: 'Flipkart Label Crop', to: '/label-crop/flipkart' },
            { label: 'Meesho Label Crop',   to: '/label-crop/meesho' },
            { label: 'Nykaa Label Crop',    to: '/label-crop/nykaa' },
          ],
        },
      },
      {
        path: 'meesho',
        element: <S><MeeshoLabelCrop /></S>,
        handle: {
          tool: 'Meesho Label Crop',
          category: 'Label Tools',
          description: 'Crop Meesho shipping labels to thermal or A4 format.',
          relatedTools: [
            { label: 'Amazon Label Crop',   to: '/label-crop/amazon' },
            { label: 'Flipkart Label Crop', to: '/label-crop/flipkart' },
            { label: 'AJIO Label Crop',     to: '/label-crop/ajio' },
            { label: 'Snapdeal Label Crop', to: '/label-crop/snapdeal' },
          ],
        },
      },
      {
        path: 'ajio',
        element: <S><AjioLabelCrop /></S>,
        handle: {
          tool: 'AJIO Label Crop',
          category: 'Label Tools',
          description: 'Crop AJIO shipping labels to thermal or A4 format.',
          relatedTools: [
            { label: 'Amazon Label Crop',   to: '/label-crop/amazon' },
            { label: 'Flipkart Label Crop', to: '/label-crop/flipkart' },
            { label: 'Myntra Label Crop',   to: '/label-crop/myntra' },
            { label: 'Snapdeal Label Crop', to: '/label-crop/snapdeal' },
          ],
        },
      },
      {
        path: 'nykaa',
        element: <S><NykaaLabelCrop /></S>,
        handle: {
          tool: 'Nykaa Label Crop',
          category: 'Label Tools',
          description: 'Crop Nykaa shipping labels to thermal or A4 format.',
          relatedTools: [
            { label: 'Myntra Label Crop',   to: '/label-crop/myntra' },
            { label: 'AJIO Label Crop',     to: '/label-crop/ajio' },
            { label: 'Meesho Label Crop',   to: '/label-crop/meesho' },
            { label: 'Amazon Label Crop',   to: '/label-crop/amazon' },
          ],
        },
      },
      {
        path: 'snapdeal',
        element: <S><SnapdealLabelCrop /></S>,
        handle: {
          tool: 'Snapdeal Label Crop',
          category: 'Label Tools',
          description: 'Crop Snapdeal shipping labels to thermal or A4 format.',
          relatedTools: [
            { label: 'Amazon Label Crop',   to: '/label-crop/amazon' },
            { label: 'Flipkart Label Crop', to: '/label-crop/flipkart' },
            { label: 'Meesho Label Crop',   to: '/label-crop/meesho' },
            { label: 'AJIO Label Crop',     to: '/label-crop/ajio' },
          ],
        },
      },
    ],
  },

  // ----------------------------------------------------------------
  // Protected pages — DashboardLayout + auth guard
  // ----------------------------------------------------------------
  {
    element: <ProtectedRoute />,
    errorElement: <S><NotFoundPage /></S>,
    children: [
      {
        element: <DashboardLayout />,
        errorElement: <S><NotFoundPage /></S>,
        children: [
          // Dashboard home
          { path: '/dashboard', element: <S><DashboardPage /></S> },

          // Account
          { path: '/profile',  element: <S><ProfilePage /></S> },
          { path: '/settings', element: <S><SettingsPage /></S> },

          // Reconciliation module
          {
            path: '/reconciliation',
            element: <S><ReconciliationModule /></S>,
            children: [
              { index: true,           element: <S><ReconciliationDashboard /></S> },
              { path: 'import',        element: <S><ImportWizard /></S> },
              { path: 'orders',        element: <S><OrdersTable /></S> },
              { path: 'settlements',   element: <S><SettlementsTable /></S> },
              { path: 'reports/:id',   element: <S><ReportView /></S> },
              { path: 'missing',       element: <S><MissingPayments /></S> },
            ],
          },

          // Inventory module
          {
            path: '/inventory',
            element: <S><InventoryModule /></S>,
            children: [
              { index: true,             element: <S><InventoryView /></S> },
              { path: 'products',        element: <S><ProductMaster /></S> },
              { path: 'stock',           element: <S><InventoryView /></S> },
              { path: 'movements',       element: <S><StockMovements /></S> },
              { path: 'warehouses',      element: <S><Warehouses /></S> },
              { path: 'purchase-orders', element: <S><PurchaseOrders /></S> },
              { path: 'low-stock',       element: <S><LowStockAlerts /></S> },
              { path: 'reports',         element: <S><InventoryReports /></S> },
            ],
          },
        ],
      },
    ],
  },

  // ----------------------------------------------------------------
  // 404 catch-all
  // ----------------------------------------------------------------
  { path: '*', element: <S><NotFoundPage /></S> },

    ], // end RootLayout children
  },   // end RootLayout route
]

const router = createBrowserRouter(routes)

// ============================================================
// App root
// ============================================================

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
