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

  // ─── SKU Tools Hub ────────────────────────────────────────────────────────
  '/tools/sku': {
    title: 'Free SKU Tools for Ecommerce Sellers — EcomSathi',
    description:
      'Generate, bulk-create, validate, and print SKU codes and barcodes. Free SKU tools for Amazon, Flipkart, Meesho sellers. No signup needed.',
    keywords:
      'sku generator, bulk sku, barcode generator, sku label printer, sku tools india, ecommerce sku tools',
    ogType: 'website',
  },

  // ─── SKU Tools (individual) ───────────────────────────────────────────────
  '/tools/sku/generator': {
    title: 'Free SKU Generator — EcomSathi',
    description:
      'Generate professional SKU codes for your products. Free online SKU generator for Amazon, Flipkart, Meesho sellers. Customise prefix, category, and numbering.',
    keywords:
      'sku generator, free sku generator, sku code generator online, amazon sku, flipkart sku, product sku generator',
  },
  '/tools/sku/bulk': {
    title: 'Bulk SKU Generator — EcomSathi',
    description:
      'Generate SKU codes in bulk for hundreds of products at once. Upload CSV, generate SKUs, and download. Free bulk SKU generator for ecommerce sellers.',
    keywords:
      'bulk sku generator, sku generator csv, generate multiple skus, batch sku generator',
  },
  '/tools/sku/variant': {
    title: 'Variant SKU Builder — EcomSathi',
    description:
      'Create size, colour, and attribute variant SKUs from a master product code. Free variant SKU generator for ecommerce sellers.',
    keywords:
      'variant sku builder, sku variants, size color sku generator, product variant sku, ecommerce variant codes',
  },
  '/tools/sku/custom': {
    title: 'Custom SKU Format — EcomSathi',
    description:
      'Define your own prefix, suffix, and separator rules to create custom SKU formats. Free custom SKU format tool for Indian sellers.',
    keywords:
      'custom sku format, sku prefix suffix, define sku rules, custom product codes, sku format builder',
  },
  '/tools/sku/barcode': {
    title: 'Free Barcode Generator — EcomSathi',
    description:
      'Generate EAN-13, Code 128, QR codes and UPC-A barcodes for free. Download as PNG or SVG. No registration required.',
    keywords:
      'barcode generator free, ean-13 barcode, code 128 barcode, qr code generator, upc-a barcode, online barcode maker',
  },
  '/tools/sku/label-generator': {
    title: 'SKU Label Generator — EcomSathi',
    description:
      'Create print-ready product labels with barcode, SKU, and price. Free SKU label generator for product stickering.',
    keywords:
      'sku label generator, barcode label maker, product label generator, print sku labels online',
  },
  '/tools/sku/label-printer': {
    title: 'SKU Label Printer — EcomSathi',
    description:
      'Configure and print labels directly to thermal or inkjet printers. Free label printer tool for ecommerce sellers.',
    keywords:
      'sku label printer, thermal label printer, inkjet label print, product label printing online',
  },

  // ─── PDF Tools Hub ────────────────────────────────────────────────────────
  '/tools/pdf': {
    title: 'Free PDF Tools for Ecommerce Sellers — EcomSathi',
    description:
      'Merge, split, compress, OCR, rotate, watermark and convert PDFs online for free. Built for Indian ecommerce sellers. No signup needed.',
    keywords:
      'pdf tools online free, merge pdf, split pdf, compress pdf, pdf ocr, pdf to image, ecommerce pdf tools india',
    ogType: 'website',
  },

  // ─── PDF Tools (individual) ───────────────────────────────────────────────
  '/tools/pdf/merge': {
    title: 'Merge PDF Free — EcomSathi',
    description:
      'Merge multiple PDF files into one. Free online PDF merger, no registration required. Combine invoices, shipping labels, and documents instantly.',
    keywords:
      'merge pdf free, pdf merger online, combine pdf files, join pdf documents, merge pdf no signup',
  },
  '/tools/pdf/split': {
    title: 'Split PDF Free — EcomSathi',
    description:
      'Split a PDF into individual pages or custom page ranges. Free online PDF splitter. Extract specific pages without any software.',
    keywords:
      'split pdf free, pdf splitter online, extract pdf pages, split pdf by page, divide pdf',
  },
  '/tools/pdf/crop': {
    title: 'Crop PDF Pages — EcomSathi',
    description:
      'Crop margins or specific regions from every page of a PDF. Free online PDF cropper. No software required.',
    keywords:
      'crop pdf pages free, pdf cropper online, trim pdf margins, pdf page crop tool',
  },
  '/tools/pdf/ocr': {
    title: 'PDF OCR — Extract Text from PDF — EcomSathi',
    description:
      'Extract text from scanned PDFs using OCR. Free online PDF OCR tool. Convert scanned documents and images to searchable text.',
    keywords:
      'pdf ocr online, extract text from pdf, scanned pdf to text, pdf text recognition, ocr pdf free',
  },
  '/tools/pdf/compress': {
    title: 'Compress PDF Free — EcomSathi',
    description:
      'Compress PDF files to reduce file size. Free online PDF compressor. Reduce large PDFs without losing quality.',
    keywords:
      'compress pdf free, reduce pdf size, pdf compressor online, shrink pdf, pdf size reducer',
  },
  '/tools/pdf/password': {
    title: 'PDF Password Protect — EcomSathi',
    description:
      'Add or remove password protection from PDF documents. Free online PDF password tool. Secure sensitive documents.',
    keywords:
      'pdf password protect, add password to pdf, remove pdf password, pdf protection online, secure pdf free',
  },
  '/tools/pdf/rotate': {
    title: 'Rotate PDF Pages — EcomSathi',
    description:
      'Rotate PDF pages 90, 180, or 270 degrees. Free online PDF page rotator. Fix orientation of scanned documents.',
    keywords: 'rotate pdf pages free, pdf rotation online, flip pdf pages, pdf page orientation',
  },
  '/tools/pdf/extract': {
    title: 'Extract Text from PDF — EcomSathi',
    description:
      'Extract all text content from a PDF into a plain text file. Free online PDF text extractor.',
    keywords: 'extract text from pdf free, pdf text extractor online, pdf to text converter',
  },
  '/tools/pdf/rearrange': {
    title: 'Reorder PDF Pages — EcomSathi',
    description:
      'Drag and drop to reorder PDF pages. Free online PDF page organiser. Rearrange pages without any software.',
    keywords: 'reorder pdf pages, rearrange pdf pages online, pdf page organiser free',
  },
  '/tools/pdf/to-images': {
    title: 'PDF to Image Converter — EcomSathi',
    description:
      'Convert PDF pages to PNG or JPG images. Free online PDF to image converter. Extract all pages as high-quality images.',
    keywords:
      'pdf to image converter, pdf to png, pdf to jpg online, convert pdf pages to images free',
  },
  '/tools/pdf/images-to-pdf': {
    title: 'Image to PDF Converter — EcomSathi',
    description:
      'Convert JPG, PNG, or WebP images to PDF. Free online image to PDF converter. Combine multiple images into a single PDF.',
    keywords:
      'image to pdf converter free, jpg to pdf online, png to pdf, convert images to pdf',
  },
  '/tools/pdf/watermark': {
    title: 'Add Watermark to PDF — EcomSathi',
    description:
      'Add text or image watermark to PDF files. Free online PDF watermarking tool. Protect your documents with custom watermarks.',
    keywords:
      'add watermark to pdf, pdf watermark free, watermark pdf online, stamp pdf documents',
  },
  '/tools/pdf/page-numbers': {
    title: 'Add Page Numbers to PDF — EcomSathi',
    description:
      'Insert page numbers into any position of a PDF document. Free online PDF page numbering tool.',
    keywords:
      'add page numbers to pdf, pdf page numbering, insert page numbers pdf, pdf footer page number',
  },

  // ─── Image Tools Hub ──────────────────────────────────────────────────────
  '/tools/image': {
    title: 'Free Image Tools for Ecommerce Sellers — EcomSathi',
    description:
      'Free image editing tools for sellers — resize, compress, crop, convert, watermark, and optimize product photos for Amazon, Flipkart, Myntra, and Meesho. No signup needed.',
    keywords:
      'image tools online free, resize image, compress image, background remover, crop image, jpg to png, webp converter, product image optimizer, ecommerce image tools india',
    ogType: 'website',
  },

  // ─── Image Tools (individual) ─────────────────────────────────────────────
  '/tools/image/background-remover': {
    title: 'Remove Background Free — EcomSathi',
    description:
      'Remove background from product images free. Perfect for Amazon, Flipkart product listings. Get clean transparent PNG product photos instantly. No signup required.',
    keywords:
      'background remover free, remove image background online, product photo background remove, transparent background png, amazon product photo background',
  },
  '/tools/image/crop': {
    title: 'Crop Image Online Free — EcomSathi',
    description:
      'Crop images to any size or aspect ratio online for free. Drag-and-drop crop with aspect ratio presets (1:1, 4:3, 16:9) and rotation support. No signup needed.',
    keywords:
      'crop image online free, image cropper, crop photo online, custom image crop, aspect ratio crop, free image cropping tool',
  },
  '/tools/image/resize': {
    title: 'Resize Image Online Free — EcomSathi',
    description:
      'Resize images to exact pixel dimensions or percentage. Free online image resizer with marketplace presets for Amazon, Flipkart, Instagram. Supports JPG, PNG, WebP.',
    keywords:
      'image resize online free, resize image pixels, image resizer tool, resize photo online, resize image for amazon flipkart, online image resizer',
  },
  '/tools/image/compress': {
    title: 'Compress Image Free — EcomSathi',
    description:
      'Compress JPG, PNG, and WebP images online for free. Reduce image file size without visible quality loss. Set target file size in KB. No signup required.',
    keywords:
      'compress image free, image compressor online, reduce image size, jpg compressor, png compressor, compress photo online, reduce image file size',
  },
  '/tools/image/jpg-to-png': {
    title: 'JPG to PNG Converter Free — EcomSathi',
    description:
      'Convert JPG/JPEG images to PNG format online for free. Supports batch conversion of multiple files. Preserves image quality. No signup required.',
    keywords:
      'jpg to png converter free, jpeg to png online, convert jpg to png, batch jpg to png, free image format converter',
  },
  '/tools/image/png-to-jpg': {
    title: 'PNG to JPG Converter Free — EcomSathi',
    description:
      'Convert PNG images to JPEG online for free. Set custom background color for transparent areas. Control JPEG quality. Supports batch conversion.',
    keywords:
      'png to jpg converter free, png to jpeg online, convert png to jpg, batch png to jpg converter, transparent png to jpg',
  },
  '/tools/image/webp': {
    title: 'WEBP Converter — Convert to/from WEBP Free — EcomSathi',
    description:
      'Convert between WEBP and PNG/JPG formats in both directions. Free online WEBP converter. Reduce file size with WEBP or convert WEBP to standard formats.',
    keywords:
      'webp converter free, jpg to webp, png to webp, webp to jpg, webp to png, convert webp online, image webp converter',
  },
  '/tools/image/watermark': {
    title: 'Add Watermark to Image Free — EcomSathi',
    description:
      'Add text or logo watermark to product images online for free. Control opacity, font size, position, and color. Protect your product photography.',
    keywords:
      'add watermark to image free, image watermark online, watermark product photos, brand image watermark, text watermark image, logo watermark tool',
  },
  '/tools/image/product-optimizer': {
    title: 'Product Image Optimizer for Ecommerce — EcomSathi',
    description:
      'Optimise product images for ecommerce marketplaces. Resize, add white background, compress, and format product photos for Amazon, Flipkart, Myntra, Meesho requirements.',
    keywords:
      'product image optimizer, ecommerce image optimizer, amazon image size requirements, flipkart image requirements, meesho product photo, compress product photos',
  },
  '/tools/image/white-background': {
    title: 'White Background Generator — EcomSathi',
    description:
      'Replace product photo backgrounds with white for marketplace compliance. Free AI-powered white background tool for Amazon, Flipkart, Myntra product images.',
    keywords:
      'white background product photo, add white background image, remove background add white, amazon white background requirement, ecommerce product photo white bg',
  },
  '/tools/image/square': {
    title: 'Square Image Creator — Make Image Square Free — EcomSathi',
    description:
      'Add padding to make any image perfectly square. Choose fill color (white, transparent, custom) and image position. Free square image maker for marketplace listings.',
    keywords:
      'square image creator, make image square online free, add padding to image, square product photo, instagram square image, 1:1 image ratio tool',
  },

  // ─── Video Tools Hub ──────────────────────────────────────────────────────
  '/tools/video': {
    title: 'Free Video Tools for Ecommerce Sellers — EcomSathi',
    description:
      'Convert, resize, compress and optimize product videos online. Video to GIF, frame extractor, video compression, resize, converter, and thumbnail generator. Free, no signup.',
    keywords:
      'video tools online free, video to gif, compress video online, resize video, video converter, extract frames, thumbnail generator, ecommerce video tools',
    ogType: 'website',
  },

  // ─── Video Tools (individual) ─────────────────────────────────────────────
  '/tools/video/to-gif': {
    title: 'Video to GIF Converter Free — EcomSathi',
    description:
      'Convert video clips to animated GIF free online. MP4, MOV, AVI to GIF converter. Set frame rate, width, and trim. Perfect for product showcase animations.',
    keywords:
      'video to gif converter free, mp4 to gif online, convert video to gif, animated gif maker, product video to gif, webm to gif',
  },
  '/tools/video/frame-extractor': {
    title: 'Extract Frames from Video Free — EcomSathi',
    description:
      'Extract individual frames from MP4, MOV, AVI, WEBM, MKV videos as JPEG images. Free online video frame extractor for product thumbnail creation.',
    keywords:
      'extract frames from video, video to images free, video frame extractor online, screenshot from video, frame capture from video',
  },
  '/tools/video/compress': {
    title: 'Compress Video Online Free — EcomSathi',
    description:
      'Compress MP4 and other video files online for free. Reduce video file size for ecommerce listings and social media without losing too much quality.',
    keywords:
      'compress video online free, video compressor, reduce video size, mp4 compressor online, video file size reducer, compress video for upload',
  },
  '/tools/video/resize': {
    title: 'Resize Video Online Free — EcomSathi',
    description:
      'Resize video to specific dimensions or aspect ratio. Free online video resizer. Change video resolution for Amazon, Flipkart and other marketplace requirements.',
    keywords:
      'resize video online free, video resolution changer, mp4 resizer, change video dimensions, video resolution converter, resize video for amazon',
  },
  '/tools/video/convert': {
    title: 'Video Converter Online Free — MP4, MOV, AVI, WEBM — EcomSathi',
    description:
      'Convert between MP4, MOV, AVI, WEBM, MKV video formats online for free. Browser-based video converter. No signup required.',
    keywords:
      'video converter online free, mp4 to webm, mov to mp4, convert video format, avi to mp4, webm to mp4, mkv to mp4 online',
  },
  '/tools/video/thumbnail': {
    title: 'Video Thumbnail Generator Free — EcomSathi',
    description:
      'Extract the perfect thumbnail from your product video at any timestamp. Free online video thumbnail generator. Save as JPEG for marketplace listings.',
    keywords:
      'video thumbnail generator, extract thumbnail from video, video screenshot free, product video thumbnail, thumbnail maker from video',
  },

  // ─── GST Tools Hub ────────────────────────────────────────────────────────
  '/tools/gst': {
    title: 'Free GST Tools for Ecommerce Sellers — EcomSathi',
    description:
      'Search GSTIN, calculate GST, verify PAN, find HSN/SAC codes, and look up GST rates. Free GST tools for Indian ecommerce sellers. No signup needed.',
    keywords:
      'gst tools online free, gstin search, gst calculator, hsn code search, pan validator, gst rate finder, ecommerce gst tools india',
    ogType: 'website',
  },

  // ─── GST Tools (individual) ───────────────────────────────────────────────
  '/tools/gst/search': {
    title: 'GST Search — Verify GSTIN Free — EcomSathi',
    description:
      'Search and verify GSTIN numbers instantly. Free GST number verification tool for Indian sellers. Check business name, address, and filing status.',
    keywords:
      'gst search, gstin verification, verify gst number, gst number check, gstin lookup india',
  },
  '/tools/gst/verify': {
    title: 'GSTIN Verifier — EcomSathi',
    description:
      'Instantly verify if a GSTIN is valid and active on the GST portal. Free online GSTIN verification tool for Indian sellers.',
    keywords:
      'gstin verifier, verify gstin online, gst number active check, gstin validity checker india',
  },
  '/tools/gst/calculator': {
    title: 'GST Calculator — EcomSathi',
    description:
      'Calculate GST for any product. Supports all GST rates: 5%, 12%, 18%, 28%. Calculate GST inclusive and exclusive prices instantly.',
    keywords:
      'gst calculator online, calculate gst india, gst amount calculator, inclusive exclusive gst calculator',
  },
  '/tools/gst/reverse': {
    title: 'Reverse GST Calculator — EcomSathi',
    description:
      'Find the base price and GST amount from a GST-inclusive total. Free reverse GST calculator for Indian sellers.',
    keywords:
      'reverse gst calculator, gst exclusive price calculator, find base price from gst inclusive, reverse charge gst india',
  },
  '/tools/gst/rate-finder': {
    title: 'GST Rate Finder — EcomSathi',
    description:
      'Find the correct GST rate for any product category or HSN code. Free GST rate finder for Indian sellers.',
    keywords:
      'gst rate finder, find gst rate online, product gst rate, hsn code gst rate, gst slab finder india',
  },
  '/tools/gst/state-finder': {
    title: 'GST State Code Lookup — EcomSathi',
    description:
      'Look up the 2-digit state code used in GSTIN numbers. Free GST state code finder for all Indian states and UTs.',
    keywords:
      'gst state code lookup, gstin state code, indian state gst code, 2 digit state code gstin',
  },
  '/tools/gst/gstin-validator': {
    title: 'GSTIN Validator — EcomSathi',
    description:
      'Validate GSTIN format and checksum without an API call. Free offline GSTIN format validator.',
    keywords:
      'gstin validator, validate gstin format, gstin checksum checker, gstin format validation free',
  },
  '/tools/gst/pan-validator': {
    title: 'PAN Card Validator — EcomSathi',
    description:
      'Validate PAN card numbers online. Check PAN format, type (individual, company, HUF), and basic details. Free PAN validator.',
    keywords:
      'pan card validator, validate pan number, pan verification online, check pan card free',
  },
  '/tools/gst/hsn-search': {
    title: 'HSN Code Search — EcomSathi',
    description:
      'Search HSN codes for products. Find the correct HSN/SAC code and applicable GST rate. Free HSN code finder for Indian sellers.',
    keywords:
      'hsn code search, find hsn code, hsn code gst rate, sac code search, product hsn code finder',
  },
  '/tools/gst/sac-search': {
    title: 'SAC Code Search — EcomSathi',
    description:
      'Look up Service Accounting Codes (SAC) and GST rates for services. Free SAC code search tool for Indian businesses.',
    keywords:
      'sac code search, find sac code, service accounting code gst, sac code lookup india',
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
