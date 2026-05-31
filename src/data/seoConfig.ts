import type { SEOProps } from '../components/common/SEO'

export const SEO_CONFIG: Record<string, SEOProps> = {
  // ─── Home ────────────────────────────────────────────────────────────────
  '/': {
    title: 'EcomSathi — One Place for All Your Ecommerce Needs',
    description:
      'Free ecommerce tools for Indian sellers. SKU generator, barcode maker, PDF tools, label crop, background remover, GST calculator and more. No signup needed.',
    keywords:
      'sku generator, label crop, pdf tools, gst calculator, ecommerce tools india, barcode generator, background remover, amazon seller tools, flipkart seller tools, meesho tools',
    ogType: 'website',
  },

  // ─── Tools Overview ───────────────────────────────────────────────────────
  '/tools': {
    title: 'Free Ecommerce Tools — EcomSathi',
    description:
      'Browse all free ecommerce tools: SKU generator, PDF tools, image optimizer, video to GIF, label crop, and GST tools. Built for Amazon, Flipkart, Meesho sellers.',
    keywords:
      'free ecommerce tools, online tools for sellers, ecommerce seller tools india, amazon tools, flipkart tools',
  },

  // ─── SKU Tools ────────────────────────────────────────────────────────────
  '/tools/sku-generator': {
    title: 'Free SKU Generator — EcomSathi',
    description:
      'Generate professional SKU codes for your products. Free online SKU generator for Amazon, Flipkart, Meesho sellers. Customise prefix, category, and numbering.',
    keywords:
      'sku generator, free sku generator, sku code generator online, amazon sku, flipkart sku, product sku generator',
  },
  '/tools/bulk-sku': {
    title: 'Bulk SKU Generator — EcomSathi',
    description:
      'Generate SKU codes in bulk for hundreds of products at once. Upload CSV, generate SKUs, and download. Free bulk SKU generator for ecommerce sellers.',
    keywords:
      'bulk sku generator, sku generator csv, generate multiple skus, batch sku generator',
  },
  '/tools/barcode': {
    title: 'Free Barcode Generator — EcomSathi',
    description:
      'Generate EAN-13, Code 128, QR codes and UPC-A barcodes for free. Download as PNG or SVG. No registration required.',
    keywords:
      'barcode generator free, ean-13 barcode, code 128 barcode, qr code generator, upc-a barcode, online barcode maker',
  },
  '/tools/sku-label': {
    title: 'SKU Label Printer — EcomSathi',
    description:
      'Print SKU labels with barcodes for your products. Customise label size, font, and layout. Free SKU label generator for product stickering.',
    keywords:
      'sku label printer, barcode label maker, product label generator, print sku labels online',
  },
  '/tools/sku-validator': {
    title: 'SKU Validator — EcomSathi',
    description:
      'Validate and check SKU codes for duplicates, invalid characters, and length issues. Free SKU validation tool for inventory management.',
    keywords: 'sku validator, validate sku codes, check sku duplicates, sku format checker',
  },
  '/tools/sku-to-barcode': {
    title: 'SKU to Barcode Converter — EcomSathi',
    description:
      'Convert your existing SKU codes to printable barcodes. Supports EAN-13, Code 128, and QR code formats. Free online converter.',
    keywords:
      'sku to barcode, convert sku to barcode, sku barcode generator, product barcode from sku',
  },

  // ─── PDF Tools ────────────────────────────────────────────────────────────
  '/tools/pdf-merge': {
    title: 'Merge PDF Free — EcomSathi',
    description:
      'Merge multiple PDF files into one. Free online PDF merger, no registration required. Combine invoices, shipping labels, and documents instantly.',
    keywords:
      'merge pdf free, pdf merger online, combine pdf files, join pdf documents, merge pdf no signup',
  },
  '/tools/pdf-split': {
    title: 'Split PDF Free — EcomSathi',
    description:
      'Split a PDF into individual pages or custom page ranges. Free online PDF splitter. Extract specific pages without any software.',
    keywords:
      'split pdf free, pdf splitter online, extract pdf pages, split pdf by page, divide pdf',
  },
  '/tools/pdf-compress': {
    title: 'Compress PDF Free — EcomSathi',
    description:
      'Compress PDF files to reduce file size. Free online PDF compressor. Reduce large PDFs without losing quality.',
    keywords:
      'compress pdf free, reduce pdf size, pdf compressor online, shrink pdf, pdf size reducer',
  },
  '/tools/pdf-ocr': {
    title: 'PDF OCR — Extract Text from PDF — EcomSathi',
    description:
      'Extract text from scanned PDFs using OCR. Free online PDF OCR tool. Convert scanned documents and images to searchable text.',
    keywords:
      'pdf ocr online, extract text from pdf, scanned pdf to text, pdf text recognition, ocr pdf free',
  },
  '/tools/pdf-rotate': {
    title: 'Rotate PDF Pages — EcomSathi',
    description:
      'Rotate PDF pages 90, 180, or 270 degrees. Free online PDF page rotator. Fix orientation of scanned documents.',
    keywords: 'rotate pdf pages free, pdf rotation online, flip pdf pages, pdf page orientation',
  },
  '/tools/pdf-watermark': {
    title: 'Add Watermark to PDF — EcomSathi',
    description:
      'Add text or image watermark to PDF files. Free online PDF watermarking tool. Protect your documents with custom watermarks.',
    keywords:
      'add watermark to pdf, pdf watermark free, watermark pdf online, stamp pdf documents',
  },
  '/tools/pdf-to-image': {
    title: 'PDF to Image Converter — EcomSathi',
    description:
      'Convert PDF pages to PNG or JPG images. Free online PDF to image converter. Extract all pages as high-quality images.',
    keywords:
      'pdf to image converter, pdf to png, pdf to jpg online, convert pdf pages to images free',
  },
  '/tools/image-to-pdf': {
    title: 'Image to PDF Converter — EcomSathi',
    description:
      'Convert JPG, PNG, or WebP images to PDF. Free online image to PDF converter. Combine multiple images into a single PDF.',
    keywords:
      'image to pdf converter free, jpg to pdf online, png to pdf, convert images to pdf',
  },
  '/tools/pdf-reorder': {
    title: 'Reorder PDF Pages — EcomSathi',
    description:
      'Drag and drop to reorder PDF pages. Free online PDF page organiser. Rearrange pages without any software.',
    keywords: 'reorder pdf pages, rearrange pdf pages online, pdf page organiser free',
  },
  '/tools/pdf-extract-pages': {
    title: 'Extract Pages from PDF — EcomSathi',
    description:
      'Extract specific pages from a PDF and save as a new file. Free online PDF page extractor.',
    keywords: 'extract pages from pdf free, pdf page extractor online, save pdf pages',
  },
  '/tools/pdf-delete-pages': {
    title: 'Delete Pages from PDF — EcomSathi',
    description:
      'Delete unwanted pages from a PDF file. Free online PDF page deletion tool. Remove blank or duplicate pages easily.',
    keywords: 'delete pdf pages free, remove pages from pdf online, pdf page remover',
  },
  '/tools/pdf-unlock': {
    title: 'Unlock PDF — Remove PDF Password — EcomSathi',
    description:
      'Remove password protection from PDF files you own. Free online PDF unlocker tool.',
    keywords: 'unlock pdf free, remove pdf password online, pdf password remover',
  },
  '/tools/pdf-protect': {
    title: 'Protect PDF with Password — EcomSathi',
    description:
      'Add password protection to your PDF files. Free online PDF protection tool. Secure sensitive documents.',
    keywords: 'protect pdf with password, pdf password protect online, secure pdf free',
  },

  // ─── Image Tools ──────────────────────────────────────────────────────────
  '/tools/background-remover': {
    title: 'Remove Background Free — EcomSathi',
    description:
      'Remove background from product images free. Perfect for Amazon, Flipkart product listings. Get clean white background product photos instantly.',
    keywords:
      'background remover free, remove image background, product photo background remove, white background product image, amazon product photo',
  },
  '/tools/product-optimizer': {
    title: 'Product Image Optimizer — EcomSathi',
    description:
      'Optimise product images for ecommerce marketplaces. Resize, compress, and format product photos for Amazon, Flipkart, Meesho requirements.',
    keywords:
      'product image optimizer, ecommerce image optimizer, amazon image size, flipkart image requirements, compress product photos',
  },
  '/tools/image-resize': {
    title: 'Image Resize Online Free — EcomSathi',
    description:
      'Resize images to exact pixel dimensions or percentage. Free online image resizer. Supports JPG, PNG, WebP formats.',
    keywords: 'image resize online free, resize image pixels, image resizer tool, resize photo online',
  },
  '/tools/image-compress': {
    title: 'Compress Image Free — EcomSathi',
    description:
      'Compress JPG, PNG, and WebP images online for free. Reduce image file size without visible quality loss.',
    keywords:
      'compress image free, image compressor online, reduce image size, jpg compressor, png compressor',
  },
  '/tools/image-convert': {
    title: 'Image Format Converter — EcomSathi',
    description:
      'Convert images between JPG, PNG, WebP, AVIF, and BMP formats. Free online image format converter.',
    keywords:
      'image converter online, jpg to png, png to webp, convert image format free, webp converter',
  },
  '/tools/image-crop': {
    title: 'Crop Image Online Free — EcomSathi',
    description:
      'Crop images to any size or aspect ratio. Free online image cropping tool. Supports custom dimensions and preset ratios.',
    keywords: 'crop image online free, image cropper, crop photo online, custom image crop',
  },
  '/tools/image-watermark': {
    title: 'Add Watermark to Image — EcomSathi',
    description:
      'Add text or logo watermark to product images. Free online image watermarking tool. Protect your product photography.',
    keywords:
      'add watermark to image free, image watermark online, watermark product photos, brand image watermark',
  },
  '/tools/image-bulk-resize': {
    title: 'Bulk Image Resize — EcomSathi',
    description:
      'Resize multiple images at once to the same dimensions. Free bulk image resizer for ecommerce sellers.',
    keywords: 'bulk image resize, batch image resizer, resize multiple images online free',
  },
  '/tools/image-background-colour': {
    title: 'Change Image Background Colour — EcomSathi',
    description:
      'Change the background colour of product images. Replace transparent or removed backgrounds with white, custom colours, or gradients.',
    keywords:
      'change image background colour, white background product photo, image background replace free',
  },
  '/tools/image-flip-rotate': {
    title: 'Flip and Rotate Image — EcomSathi',
    description:
      'Flip images horizontally or vertically, rotate by custom angle. Free online image flip and rotate tool.',
    keywords: 'flip image online, rotate image free, flip photo horizontally, image rotation tool',
  },
  '/tools/image-metadata': {
    title: 'Image Metadata Viewer — EcomSathi',
    description:
      'View and remove EXIF metadata from images. Check image dimensions, camera settings, GPS data. Free online metadata viewer.',
    keywords: 'image metadata viewer, exif data viewer, remove exif data, image info viewer free',
  },

  // ─── Video Tools ──────────────────────────────────────────────────────────
  '/tools/video-to-gif': {
    title: 'Video to GIF Converter — EcomSathi',
    description:
      'Convert video clips to animated GIF. Free online video to GIF converter. Perfect for product showcase animations on ecommerce listings.',
    keywords:
      'video to gif converter free, mp4 to gif online, convert video to gif, animated gif maker, product video to gif',
  },
  '/tools/video-compress': {
    title: 'Compress Video Online Free — EcomSathi',
    description:
      'Compress MP4 and other video files online for free. Reduce video file size for ecommerce listings and social media.',
    keywords:
      'compress video online free, video compressor, reduce video size, mp4 compressor online',
  },
  '/tools/video-resize': {
    title: 'Resize Video Online — EcomSathi',
    description:
      'Resize video to specific dimensions or aspect ratio. Free online video resizer. Change resolution for marketplace requirements.',
    keywords: 'resize video online free, video resolution changer, mp4 resizer, video dimensions',
  },
  '/tools/video-trim': {
    title: 'Trim Video Online Free — EcomSathi',
    description:
      'Trim and cut video clips online for free. Remove unwanted beginning or end from product videos.',
    keywords:
      'trim video online free, cut video online, video trimmer, mp4 cutter, video clip trimmer',
  },
  '/tools/video-to-frames': {
    title: 'Extract Frames from Video — EcomSathi',
    description:
      'Extract individual frames from video as PNG images. Free online video frame extractor for product thumbnail creation.',
    keywords:
      'extract frames from video, video to images free, video frame extractor, screenshot from video online',
  },
  '/tools/gif-to-video': {
    title: 'GIF to Video Converter — EcomSathi',
    description:
      'Convert animated GIF to MP4 video. Free online GIF to video converter. Create videos from product GIF animations.',
    keywords: 'gif to video converter, gif to mp4 online free, animated gif to video, convert gif',
  },

  // ─── GST Tools ────────────────────────────────────────────────────────────
  '/tools/gst-search': {
    title: 'GST Search — Verify GSTIN Free — EcomSathi',
    description:
      'Search and verify GSTIN numbers instantly. Free GST number verification tool for Indian sellers. Check business name, address, and filing status.',
    keywords:
      'gst search, gstin verification, verify gst number, gst number check, gstin lookup india',
  },
  '/tools/gst-calculator': {
    title: 'GST Calculator — EcomSathi',
    description:
      'Calculate GST for any product. Supports all GST rates: 5%, 12%, 18%, 28%. Calculate GST inclusive and exclusive prices instantly.',
    keywords:
      'gst calculator online, calculate gst india, gst amount calculator, inclusive exclusive gst calculator',
  },
  '/tools/hsn-search': {
    title: 'HSN Code Search — EcomSathi',
    description:
      'Search HSN codes for products. Find the correct HSN/SAC code and applicable GST rate. Free HSN code finder for Indian sellers.',
    keywords:
      'hsn code search, find hsn code, hsn code gst rate, sac code search, product hsn code finder',
  },
  '/tools/gst-return-checker': {
    title: 'GST Return Filing Status Checker — EcomSathi',
    description:
      'Check GST return filing status by GSTIN. Verify if your supplier has filed GSTR-3B and GSTR-1 returns.',
    keywords:
      'gst return status checker, gstr filing status, check gst return filed, gstin compliance check',
  },
  '/tools/pan-validator': {
    title: 'PAN Card Validator — EcomSathi',
    description:
      'Validate PAN card numbers online. Check PAN format, type (individual, company, HUF), and basic details. Free PAN validator.',
    keywords:
      'pan card validator, validate pan number, pan verification online, check pan card free',
  },
  '/tools/tds-calculator': {
    title: 'TDS Calculator — EcomSathi',
    description:
      'Calculate TDS deductions on ecommerce seller payments. Check TDS rates for Amazon, Flipkart seller payouts under Section 194-O.',
    keywords:
      'tds calculator ecommerce, section 194-o tds, amazon tds calculator, flipkart tds rate',
  },
  '/tools/invoice-generator': {
    title: 'GST Invoice Generator — EcomSathi',
    description:
      'Generate professional GST invoices for your business. Free online invoice maker with GSTIN, HSN codes, and tax calculations.',
    keywords:
      'gst invoice generator free, invoice maker online, create gst invoice, tax invoice generator india',
  },
  '/tools/eway-bill': {
    title: 'E-Way Bill Calculator — EcomSathi',
    description:
      'Check e-way bill requirements and calculate thresholds. Know when e-way bill is mandatory for your shipments.',
    keywords:
      'eway bill calculator, e-way bill requirement checker, when is eway bill required, eway bill threshold',
  },
  '/tools/composition-scheme': {
    title: 'GST Composition Scheme Calculator — EcomSathi',
    description:
      'Check eligibility and calculate tax liability under GST composition scheme. Compare regular vs composition scheme for your business.',
    keywords:
      'gst composition scheme calculator, composition scheme eligibility, gst composition tax rate',
  },
  '/tools/reverse-charge': {
    title: 'GST Reverse Charge Calculator — EcomSathi',
    description:
      'Calculate GST under reverse charge mechanism. Find services and goods subject to RCM. Free reverse charge calculator.',
    keywords:
      'gst reverse charge calculator, rcm calculator, reverse charge mechanism gst india',
  },

  // ─── Label Crop ───────────────────────────────────────────────────────────
  '/label-crop': {
    title: 'Shipping Label Crop — Amazon, Flipkart, Meesho — EcomSathi',
    description:
      'Auto-crop shipping labels for Amazon, Flipkart, Myntra, Meesho, AJIO, Nykaa, Snapdeal. Extract labels from multi-page PDFs and print ready-to-paste stickers.',
    keywords:
      'shipping label crop, amazon label crop, flipkart label crop, meesho label crop, myntra label, ajio label, nykaa label crop, label extractor pdf, shipping sticker',
  },

  // ─── Static Pages ─────────────────────────────────────────────────────────
  '/about': {
    title: 'About EcomSathi',
    description:
      'Learn about EcomSathi — the free ecommerce tools platform built for Indian sellers on Amazon, Flipkart, Meesho, and other marketplaces.',
    keywords: 'about ecomsathi, ecommerce tools india, ecomsathi team',
  },
  '/contact': {
    title: 'Contact EcomSathi',
    description:
      'Get in touch with EcomSathi. Report a bug, suggest a feature, or ask us anything. We reply within 24 hours.',
    keywords: 'contact ecomsathi, ecomsathi support, ecomsathi feedback',
  },
  '/faq': {
    title: 'FAQ — EcomSathi',
    description:
      'Frequently asked questions about EcomSathi tools. How to use SKU generator, label crop, PDF tools, and more.',
    keywords: 'ecomsathi faq, ecomsathi help, ecomsathi questions',
  },
  '/privacy': {
    title: 'Privacy Policy — EcomSathi',
    description: 'EcomSathi privacy policy. How we collect, use, and protect your data.',
  },
  '/terms': {
    title: 'Terms of Service — EcomSathi',
    description: 'EcomSathi terms of service. Read our terms and conditions before using the platform.',
  },

  // ─── Auth / Private (noIndex) ─────────────────────────────────────────────
  '/login': {
    title: 'Login — EcomSathi',
    noIndex: true,
  },
  '/register': {
    title: 'Create Account — EcomSathi',
    noIndex: true,
  },
  '/dashboard': {
    title: 'Dashboard — EcomSathi',
    noIndex: true,
  },
  '/reconciliation': {
    title: 'Reconciliation — EcomSathi',
    noIndex: true,
  },
  '/inventory': {
    title: 'Inventory — EcomSathi',
    noIndex: true,
  },
  '/settings': {
    title: 'Settings — EcomSathi',
    noIndex: true,
  },
  '/profile': {
    title: 'Profile — EcomSathi',
    noIndex: true,
  },
  '/reset-password': {
    title: 'Reset Password — EcomSathi',
    noIndex: true,
  },
}
