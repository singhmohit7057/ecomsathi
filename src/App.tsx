import { lazy, Suspense, Fragment } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
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
const LoginPage          = lazy(() => import('./pages/LoginPage'))
const RegisterPage       = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage'))
const DashboardPage      = lazy(() => import('./pages/DashboardPage'))
const ToolsPage          = lazy(() => import('./pages/ToolsPage'))
const ProfilePage        = lazy(() => import('./pages/ProfilePage'))
const SettingsPage       = lazy(() => import('./pages/SettingsPage'))
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage'))

// ============================================================
// Lazy imports — SKU Tools
// ============================================================

const SKUToolsIndex      = lazy(() => import('./modules/sku-tools/index'))
const SingleSKUGenerator = lazy(() => import('./modules/sku-tools/SingleSKUGenerator'))
const BulkSKUGenerator   = lazy(() => import('./modules/sku-tools/BulkSKUGenerator'))
const VariantSKUGenerator= lazy(() => import('./modules/sku-tools/VariantSKUGenerator'))
const CustomSKUGenerator = lazy(() => import('./modules/sku-tools/CustomSKUGenerator'))
const BarcodeGenerator   = lazy(() => import('./modules/sku-tools/BarcodeGenerator'))
const LabelGenerator     = lazy(() => import('./modules/sku-tools/LabelGenerator'))
const LabelPrinter       = lazy(() => import('./modules/sku-tools/LabelPrinter'))

// ============================================================
// Lazy imports — PDF Tools
// ============================================================

const PDFToolsIndex        = lazy(() => import('./modules/pdf-tools/index'))
const MergePDF             = lazy(() => import('./modules/pdf-tools/MergePDF'))
const SplitPDF             = lazy(() => import('./modules/pdf-tools/SplitPDF'))
const CropPDF              = lazy(() => import('./modules/pdf-tools/CropPDF'))
const OcrPDF               = lazy(() => import('./modules/pdf-tools/OcrPDF'))
const CompressPDF          = lazy(() => import('./modules/pdf-tools/CompressPDF'))
const PasswordRemoverPDF   = lazy(() => import('./modules/pdf-tools/PasswordRemoverPDF'))
const RotatePDF            = lazy(() => import('./modules/pdf-tools/RotatePDF'))
const ExtractPagesPDF      = lazy(() => import('./modules/pdf-tools/ExtractPagesPDF'))
const RearrangePagesPDF    = lazy(() => import('./modules/pdf-tools/RearrangePagesPDF'))
const PDFToImages          = lazy(() => import('./modules/pdf-tools/PDFToImages'))
const ImagesToPDF          = lazy(() => import('./modules/pdf-tools/ImagesToPDF'))
const WatermarkPDF         = lazy(() => import('./modules/pdf-tools/WatermarkPDF'))
const PageNumbersPDF       = lazy(() => import('./modules/pdf-tools/PageNumbersPDF'))

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
const VideoToGIF           = lazy(() => import('./modules/video-tools/VideoToGIF'))
const FrameExtractor       = lazy(() => import('./modules/video-tools/FrameExtractor'))
const CompressVideo        = lazy(() => import('./modules/video-tools/CompressVideo'))
const ResizeVideo          = lazy(() => import('./modules/video-tools/ResizeVideo'))
const VideoConverter       = lazy(() => import('./modules/video-tools/VideoConverter'))
const ThumbnailGenerator   = lazy(() => import('./modules/video-tools/ThumbnailGenerator'))

// ============================================================
// Lazy imports — GST Tools
// ============================================================

const GSTToolsIndex        = lazy(() => import('./modules/gst-tools/index'))
const GSTSearch            = lazy(() => import('./modules/gst-tools/GSTSearch'))
const GSTVerify            = lazy(() => import('./modules/gst-tools/GSTVerify'))
const GSTCalculator        = lazy(() => import('./modules/gst-tools/GSTCalculator'))
const ReverseGSTCalculator = lazy(() => import('./modules/gst-tools/ReverseGSTCalculator'))
const GSTRateFinder        = lazy(() => import('./modules/gst-tools/GSTRateFinder'))
const GSTStateFinder       = lazy(() => import('./modules/gst-tools/GSTStateFinder'))
const GSTINValidator       = lazy(() => import('./modules/gst-tools/GSTINValidator'))
const PANValidator         = lazy(() => import('./modules/gst-tools/PANValidator'))
const HSNSearch            = lazy(() => import('./modules/gst-tools/HSNSearch'))
const SACSearch            = lazy(() => import('./modules/gst-tools/SACSearch'))

// ============================================================
// Lazy imports — Label Crop
// ============================================================

const LabelCropPage        = lazy(() => import('./modules/label-crop/LabelCropPage'))

// ============================================================
// Lazy imports — Reconciliation (premium)
// ============================================================

const ReconciliationModule = lazy(() => import('./modules/reconciliation/index'))
const ReconciliationDashboard = lazy(() => import('./modules/reconciliation/ReconciliationDashboard'))
const ImportWizard         = lazy(() => import('./modules/reconciliation/ImportWizard'))
const OrdersTable          = lazy(() => import('./modules/reconciliation/OrdersTable'))
const SettlementsTable     = lazy(() => import('./modules/reconciliation/SettlementsTable'))
const ReportView           = lazy(() => import('./modules/reconciliation/ReportView'))
const MissingPayments      = lazy(() => import('./modules/reconciliation/MissingPayments'))

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
      { path: '/tools',   element: <S><ToolsPage /></S> },
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
  // Tool pages — wrapped in ToolsLayout (Navbar + breadcrumb + Footer)
  // ----------------------------------------------------------------
  {
    path: '/tools',
    element: <ToolsLayout />,
    children: [
      // SKU Tools index
      {
        index: true,
        element: <S><SKUToolsIndex /></S>,
      },

      // SKU Tools
      {
        path: 'sku-generator',
        element: <S><SingleSKUGenerator /></S>,
        handle: { tool: 'Single SKU Generator', category: 'SKU Tools' },
      },
      {
        path: 'bulk-sku',
        element: <S><BulkSKUGenerator /></S>,
        handle: { tool: 'Bulk SKU Generator', category: 'SKU Tools' },
      },
      {
        path: 'variant-sku',
        element: <S><VariantSKUGenerator /></S>,
        handle: { tool: 'Variant SKU Generator', category: 'SKU Tools' },
      },
      {
        path: 'custom-sku',
        element: <S><CustomSKUGenerator /></S>,
        handle: { tool: 'Custom SKU Generator', category: 'SKU Tools' },
      },
      {
        path: 'barcode',
        element: <S><BarcodeGenerator /></S>,
        handle: { tool: 'Barcode Generator', category: 'SKU Tools' },
      },
      {
        path: 'label-generator',
        element: <S><LabelGenerator /></S>,
        handle: { tool: 'Label Generator', category: 'SKU Tools' },
      },
      {
        path: 'label-printer',
        element: <S><LabelPrinter /></S>,
        handle: { tool: 'Label Printer', category: 'SKU Tools' },
      },

      // PDF Tools
      {
        path: 'pdf-merge',
        element: <S><MergePDF /></S>,
        handle: { tool: 'Merge PDF', category: 'PDF Tools' },
      },
      {
        path: 'pdf-split',
        element: <S><SplitPDF /></S>,
        handle: { tool: 'Split PDF', category: 'PDF Tools' },
      },
      {
        path: 'pdf-crop',
        element: <S><CropPDF /></S>,
        handle: { tool: 'Crop PDF', category: 'PDF Tools' },
      },
      {
        path: 'pdf-ocr',
        element: <S><OcrPDF /></S>,
        handle: { tool: 'OCR PDF', category: 'PDF Tools' },
      },
      {
        path: 'pdf-compress',
        element: <S><CompressPDF /></S>,
        handle: { tool: 'Compress PDF', category: 'PDF Tools' },
      },
      {
        path: 'pdf-password',
        element: <S><PasswordRemoverPDF /></S>,
        handle: { tool: 'Remove PDF Password', category: 'PDF Tools' },
      },
      {
        path: 'pdf-rotate',
        element: <S><RotatePDF /></S>,
        handle: { tool: 'Rotate PDF', category: 'PDF Tools' },
      },
      {
        path: 'pdf-extract',
        element: <S><ExtractPagesPDF /></S>,
        handle: { tool: 'Extract PDF Pages', category: 'PDF Tools' },
      },
      {
        path: 'pdf-rearrange',
        element: <S><RearrangePagesPDF /></S>,
        handle: { tool: 'Rearrange PDF Pages', category: 'PDF Tools' },
      },
      {
        path: 'pdf-to-images',
        element: <S><PDFToImages /></S>,
        handle: { tool: 'PDF to Images', category: 'PDF Tools' },
      },
      {
        path: 'images-to-pdf',
        element: <S><ImagesToPDF /></S>,
        handle: { tool: 'Images to PDF', category: 'PDF Tools' },
      },
      {
        path: 'pdf-watermark',
        element: <S><WatermarkPDF /></S>,
        handle: { tool: 'Watermark PDF', category: 'PDF Tools' },
      },
      {
        path: 'pdf-page-numbers',
        element: <S><PageNumbersPDF /></S>,
        handle: { tool: 'Add Page Numbers', category: 'PDF Tools' },
      },

      // Image Tools
      {
        path: 'background-remover',
        element: <S><BackgroundRemover /></S>,
        handle: { tool: 'Background Remover', category: 'Image Tools' },
      },
      {
        path: 'crop-image',
        element: <S><CropImage /></S>,
        handle: { tool: 'Crop Image', category: 'Image Tools' },
      },
      {
        path: 'resize-image',
        element: <S><ResizeImage /></S>,
        handle: { tool: 'Resize Image', category: 'Image Tools' },
      },
      {
        path: 'compress-image',
        element: <S><CompressImage /></S>,
        handle: { tool: 'Compress Image', category: 'Image Tools' },
      },
      {
        path: 'jpg-to-png',
        element: <S><JPGtoPNG /></S>,
        handle: { tool: 'JPG to PNG', category: 'Image Tools' },
      },
      {
        path: 'png-to-jpg',
        element: <S><PNGtoJPG /></S>,
        handle: { tool: 'PNG to JPG', category: 'Image Tools' },
      },
      {
        path: 'webp-converter',
        element: <S><WEBPConverter /></S>,
        handle: { tool: 'WEBP Converter', category: 'Image Tools' },
      },
      {
        path: 'image-watermark',
        element: <S><ImageWatermark /></S>,
        handle: { tool: 'Image Watermark', category: 'Image Tools' },
      },
      {
        path: 'product-optimizer',
        element: <S><ProductOptimizer /></S>,
        handle: { tool: 'Product Image Optimizer', category: 'Image Tools' },
      },
      {
        path: 'white-background',
        element: <S><WhiteBackground /></S>,
        handle: { tool: 'White Background', category: 'Image Tools' },
      },
      {
        path: 'square-image',
        element: <S><SquareImageCreator /></S>,
        handle: { tool: 'Square Image Creator', category: 'Image Tools' },
      },

      // Video Tools
      {
        path: 'video-to-gif',
        element: <S><VideoToGIF /></S>,
        handle: { tool: 'Video to GIF', category: 'Video Tools' },
      },
      {
        path: 'frame-extractor',
        element: <S><FrameExtractor /></S>,
        handle: { tool: 'Frame Extractor', category: 'Video Tools' },
      },
      {
        path: 'compress-video',
        element: <S><CompressVideo /></S>,
        handle: { tool: 'Compress Video', category: 'Video Tools' },
      },
      {
        path: 'resize-video',
        element: <S><ResizeVideo /></S>,
        handle: { tool: 'Resize Video', category: 'Video Tools' },
      },
      {
        path: 'video-converter',
        element: <S><VideoConverter /></S>,
        handle: { tool: 'Video Converter', category: 'Video Tools' },
      },
      {
        path: 'thumbnail-generator',
        element: <S><ThumbnailGenerator /></S>,
        handle: { tool: 'Thumbnail Generator', category: 'Video Tools' },
      },

      // GST Tools
      {
        path: 'gst-search',
        element: <S><GSTSearch /></S>,
        handle: { tool: 'GST Search', category: 'GST Tools' },
      },
      {
        path: 'gst-verify',
        element: <S><GSTVerify /></S>,
        handle: { tool: 'GST Verify', category: 'GST Tools' },
      },
      {
        path: 'gst-calculator',
        element: <S><GSTCalculator /></S>,
        handle: { tool: 'GST Calculator', category: 'GST Tools' },
      },
      {
        path: 'gst-reverse',
        element: <S><ReverseGSTCalculator /></S>,
        handle: { tool: 'Reverse GST Calculator', category: 'GST Tools' },
      },
      {
        path: 'gst-rate',
        element: <S><GSTRateFinder /></S>,
        handle: { tool: 'GST Rate Finder', category: 'GST Tools' },
      },
      {
        path: 'gst-state',
        element: <S><GSTStateFinder /></S>,
        handle: { tool: 'GST State Finder', category: 'GST Tools' },
      },
      {
        path: 'gstin-validator',
        element: <S><GSTINValidator /></S>,
        handle: { tool: 'GSTIN Validator', category: 'GST Tools' },
      },
      {
        path: 'pan-validate',
        element: <S><PANValidator /></S>,
        handle: { tool: 'PAN Validator', category: 'GST Tools' },
      },
      {
        path: 'hsn-search',
        element: <S><HSNSearch /></S>,
        handle: { tool: 'HSN Search', category: 'GST Tools' },
      },
      {
        path: 'sac-search',
        element: <S><SACSearch /></S>,
        handle: { tool: 'SAC Search', category: 'GST Tools' },
      },
    ],
  },

  // ----------------------------------------------------------------
  // Label Crop — standalone route under ToolsLayout
  // ----------------------------------------------------------------
  {
    path: '/label-crop',
    element: <ToolsLayout />,
    children: [
      {
        index: true,
        element: <S><LabelCropPage /></S>,
        handle: { tool: 'Label Crop', category: 'Label Tools' },
      },
    ],
  },

  // ----------------------------------------------------------------
  // Protected pages — DashboardLayout + auth guard
  // ----------------------------------------------------------------
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
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
              { path: 'report',        element: <S><ReportView /></S> },
              { path: 'missing',       element: <S><MissingPayments /></S> },
            ],
          },

          // Inventory module
          {
            path: '/inventory',
            element: <S><InventoryModule /></S>,
            children: [
              { index: true,           element: <S><InventoryView /></S> },
              { path: 'products',      element: <S><ProductMaster /></S> },
              { path: 'movements',     element: <S><StockMovements /></S> },
              { path: 'warehouses',    element: <S><Warehouses /></S> },
              { path: 'purchase-orders', element: <S><PurchaseOrders /></S> },
              { path: 'low-stock',     element: <S><LowStockAlerts /></S> },
              { path: 'reports',       element: <S><InventoryReports /></S> },
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
