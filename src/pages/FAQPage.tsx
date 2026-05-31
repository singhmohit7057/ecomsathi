import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  MessageSquare,
  Package,
  FileText,
  Image,
  Scissors,
  Receipt,
  Star,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface FAQItem {
  q: string;
  a: string | React.ReactNode;
}

interface FAQCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    id: 'general',
    label: 'General',
    icon: <MessageSquare size={18} />,
    items: [
      {
        q: 'What is EcomSathi?',
        a: 'EcomSathi is an Indian ecommerce SaaS platform — your one place for all ecommerce needs. We provide free browser-based tools (SKU generation, barcode printing, PDF processing, image editing, label cropping, and GST utilities) alongside premium modules (reconciliation, inventory management) built specifically for Indian marketplace sellers on Amazon India, Flipkart, Meesho, Myntra, and more.',
      },
      {
        q: 'Is EcomSathi really free?',
        a: (
          <>
            Yes. All core tools — SKU Generator, Barcode Printer, Label Generator, PDF tools, Image
            tools, Label Crop, and GST Lookup — are completely free to use without any subscription.
            Premium modules like Reconciliation and Inventory Management require a paid plan. We
            believe every Indian seller deserves access to professional-grade tools regardless of
            business size.
          </>
        ),
      },
      {
        q: 'Do I need to create an account to use the free tools?',
        a: 'No account is required for any of the free tools. Just open the tool in your browser and start using it immediately. An account (free) is only needed to save your preferences, access your history, or unlock premium modules.',
      },
      {
        q: 'Which marketplaces does EcomSathi support?',
        a: 'EcomSathi is built for Indian ecommerce and supports Amazon India, Flipkart, Meesho, Myntra, Nykaa, JioMart, Snapdeal, and independent Shopify / WooCommerce stores. Label formats, SKU conventions, and compliance tools are tailored to these platforms.',
      },
    ],
  },
  {
    id: 'sku',
    label: 'SKU Tools',
    icon: <Package size={18} />,
    items: [
      {
        q: 'What is a SKU and why do I need one?',
        a: 'A SKU (Stock Keeping Unit) is a unique identifier you assign to each product variant in your inventory. A well-structured SKU helps you track stock levels, process orders quickly, avoid mis-shipments, and reconcile marketplace payouts. EcomSathi's SKU Generator creates structured, human-readable SKUs following marketplace best practices.',
      },
      {
        q: 'What barcode formats does EcomSathi support?',
        a: 'EcomSathi's Barcode Printer supports Code 128 (most common for retail), EAN-13 (standard for Indian FMCG), EAN-8, UPC-A, UPC-E, Code 39, ITF-14 (for carton/shipping barcodes), QR Code, and Data Matrix. You can export barcodes as PNG, SVG, or directly to a printable PDF label sheet.',
      },
      {
        q: 'Can I bulk generate SKUs from a CSV file?',
        a: 'Yes. The SKU Generator supports CSV uploads. Prepare a CSV with columns like Product Name, Category, Brand, Color, and Size, and EcomSathi will generate structured SKUs for all rows in one go. You can then download the enriched CSV with the generated SKUs or download a print-ready label PDF.',
      },
      {
        q: 'What label sizes does the Label Generator support?',
        a: 'The Label Generator supports A4 sheet labels (various grid configurations: 2×4, 2×5, 3×7), A6 thermal labels (100×150 mm — the standard Flipkart/Amazon thermal shipping label size), 40×25 mm product labels, 50×25 mm labels, and custom dimensions. Output is a browser-printable PDF optimised for both desktop laser printers and thermal printers.',
      },
    ],
  },
  {
    id: 'pdf',
    label: 'PDF Tools',
    icon: <FileText size={18} />,
    items: [
      {
        q: 'What is the maximum file size for PDF processing?',
        a: 'For browser-side processing the limit is 50 MB per file. For server-side OCR and heavy processing tasks the limit is 25 MB per file. If your file exceeds this size, try compressing it first using the PDF Compressor tool, which can typically reduce a 50 MB PDF to under 10 MB without visible quality loss.',
      },
      {
        q: 'Is OCR accurate for Hindi text?',
        a: 'Yes. EcomSathi uses Tesseract.js with the hin (Hindi/Devanagari) language pack for Hindi OCR, and the eng pack for English text. Accuracy is typically 85–95% for clearly printed text. Handwritten Hindi or very low-resolution scans may reduce accuracy. Mixed Hindi-English documents (common in invoices) are also supported.',
      },
      {
        q: 'Are my PDF files stored on your servers?',
        a: 'No, your uploaded files are not stored permanently. Browser-side tools process your file entirely in your browser — files never leave your device. For server-assisted tasks, files are uploaded to our secure processing backend, processed, and then deleted within 30 minutes of upload. We do not index, read, or retain the content of your documents.',
      },
    ],
  },
  {
    id: 'image',
    label: 'Image Tools',
    icon: <Image size={18} />,
    items: [
      {
        q: 'How does the Background Remover work?',
        a: 'The Background Remover uses a client-side AI segmentation model (powered by the ONNX Runtime in your browser) to detect the foreground subject and remove the background. Processing happens entirely in your browser — your images are never uploaded to any server. The output is a transparent-background PNG ready for marketplace listings.',
      },
      {
        q: 'What image formats are supported?',
        a: 'EcomSathi's image tools accept JPEG, PNG, WebP, AVIF, GIF (first frame), and HEIC (on supported browsers). Output formats include JPEG, PNG, and WebP. For marketplace uploads, we recommend JPEG at 85–90% quality for the best balance of file size and visual quality.',
      },
      {
        q: 'What is the Product Image Optimizer?',
        a: 'The Product Image Optimizer is a batch tool that resizes, crops to square (1:1), adjusts background to pure white (#FFFFFF) if needed, and compresses your product images to meet Amazon India and Flipkart image specifications (minimum 1000×1000 px, max 10 MB, sRGB colour space). You can process up to 50 images at once and download them as a ZIP.',
      },
    ],
  },
  {
    id: 'label-crop',
    label: 'Label Crop',
    icon: <Scissors size={18} />,
    items: [
      {
        q: 'Which marketplace shipping label formats are supported?',
        a: 'Label Crop currently supports Amazon India (standard A4 invoice + label layout), Flipkart (single-label and 4-up layouts), Meesho (3-up and single), Myntra, and generic A6/A4 thermal formats. If your marketplace is not listed, you can use the Manual Crop tool to define the label region yourself.',
      },
      {
        q: 'What does "Auto Detection" mean?',
        a: 'When Auto Detection is enabled, EcomSathi analyses the PDF page structure and attempts to automatically identify and crop the shipping label region without any manual input. It works by detecting rectangular bordered regions and high-density text blocks characteristic of shipping labels. Success rate is above 90% for standard marketplace formats.',
      },
      {
        q: 'Can I process multiple labels at once?',
        a: 'Yes. You can upload a multi-page PDF (for example, a batch of 50 Amazon shipping labels exported together) and Label Crop will process every page and produce a ZIP of individual cropped label images or a combined thermal-ready PDF. Batch processing supports up to 200 pages per upload.',
      },
      {
        q: 'What is the difference between A4 and Thermal output?',
        a: 'A4 output creates a standard A4 PDF with the cropped label centred — suitable for printing on a regular desktop printer. Thermal output creates a 100×150 mm (A6) PDF optimised for direct thermal printers like Zebra, Citizen, or TSC. Thermal output removes unnecessary whitespace and sets the correct page size so there is no scaling required.',
      },
    ],
  },
  {
    id: 'gst',
    label: 'GST Tools',
    icon: <Receipt size={18} />,
    items: [
      {
        q: 'Is GSTIN verification free?',
        a: 'Yes. GSTIN verification is completely free. Enter any 15-digit GSTIN and EcomSathi will query the official GST portal (via the public API) and return the registered business name, address, filing status, and return filing history. There is no login required and no usage limit for standard verification.',
      },
      {
        q: 'How current is the HSN/SAC data?',
        a: 'Our HSN (Harmonised System of Nomenclature) and SAC (Services Accounting Code) database is sourced from the official CBIC (Central Board of Indirect Taxes and Customs) dataset and is updated quarterly. The current dataset reflects the GST Council notifications as of the latest update. Always verify critical classifications with a chartered accountant for compliance purposes.',
      },
      {
        q: 'Can I validate a PAN number?',
        a: 'Yes. EcomSathi includes a PAN format validator that checks the structure of a PAN (format: AAAAA9999A) and extracts the entity type (Individual, Company, HUF, etc.) from the 4th character. Note that this is a format validation only — we do not connect to Income Tax Department APIs for live PAN status verification.',
      },
    ],
  },
  {
    id: 'premium',
    label: 'Premium',
    icon: <Star size={18} />,
    items: [
      {
        q: 'What is included in the Reconciliation module?',
        a: 'The Reconciliation module helps Amazon India and Flipkart sellers match marketplace settlement reports against their own sales data to identify missing payments, deduction discrepancies, and return-related adjustments. It supports automated import of payment reports via file upload, generates a reconciliation summary with variance highlighting, and exports a dispute-ready report.',
      },
      {
        q: 'How does inventory management work?',
        a: 'The Inventory Management module lets you maintain a master product catalogue with SKUs, HSN codes, MRP, and selling prices. You can track inbound stock, outbound dispatches, returns, and damaged goods across multiple warehouses or fulfilment centres. It integrates with your marketplace order data and generates low-stock alerts and reorder suggestions.',
      },
      {
        q: 'What are the pricing plans?',
        a: (
          <>
            EcomSathi offers a free plan (all core tools, unlimited usage) and a Premium plan that
            includes Reconciliation and Inventory Management modules. Pricing details are listed on
            our{' '}
            <a href="/pricing" className="text-[#2563EB] hover:underline font-medium">
              Pricing page
            </a>
            . We offer monthly and annual billing. Annual billing includes a discount. GST invoice
            is provided for all paid plans.
          </>
        ),
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// FAQPage
// ---------------------------------------------------------------------------

export default function FAQPage() {
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('general');

  function toggleItem(key: string) {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const activeData = FAQ_DATA.find((c) => c.id === activeCategory) ?? FAQ_DATA[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Hero ── */}
      <section className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] rounded-full mb-4">
            Help Centre
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#0F172A] mb-4 leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-[#475569] max-w-xl mx-auto">
            Everything you need to know about EcomSathi's tools and plans.
            Can't find your answer?{' '}
            <Link to="/contact" className="text-[#2563EB] hover:underline font-medium">
              Contact us
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ── Category sidebar ── */}
          <nav className="md:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#94A3B8] mb-3 px-1">
              Categories
            </p>
            <ul className="flex flex-col gap-1">
              {FAQ_DATA.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <li key={cat.id}>
                    <button
                      onClick={() => setActiveCategory(cat.id)}
                      className={[
                        'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-sm font-medium text-left transition-colors',
                        isActive
                          ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                          : 'text-[#475569] hover:bg-white hover:text-[#0F172A]',
                      ].join(' ')}
                    >
                      <span
                        className={
                          isActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'
                        }
                      >
                        {cat.icon}
                      </span>
                      {cat.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* ── Accordion panel ── */}
          <div className="md:col-span-3">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[#2563EB]">{activeData.icon}</span>
              <h2 className="text-xl font-bold text-[#0F172A]">{activeData.label}</h2>
              <span className="text-xs text-[#64748B] bg-[#F1F5F9] border border-[#E2E8F0] rounded-full px-2 py-0.5">
                {activeData.items.length} questions
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {activeData.items.map((item, idx) => {
                const key = `${activeCategory}-${idx}`;
                const isOpen = openKeys.has(key);

                return (
                  <div
                    key={key}
                    className={[
                      'bg-white border rounded-[8px] overflow-hidden transition-shadow',
                      isOpen
                        ? 'border-[#BFDBFE] shadow-[#1E293B_2px_2px_0px_0px]'
                        : 'border-[#E2E8F0]',
                    ].join(' ')}
                  >
                    <button
                      onClick={() => toggleItem(key)}
                      className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40"
                      aria-expanded={isOpen}
                    >
                      <span
                        className={[
                          'text-sm font-semibold leading-snug transition-colors',
                          isOpen ? 'text-[#1D4ED8]' : 'text-[#0F172A]',
                        ].join(' ')}
                      >
                        {item.q}
                      </span>
                      <ChevronDown
                        size={16}
                        className={[
                          'flex-shrink-0 mt-0.5 text-[#64748B] transition-transform duration-200',
                          isOpen ? 'rotate-180 text-[#2563EB]' : '',
                        ].join(' ')}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 border-t border-[#EFF6FF]">
                        <p className="text-sm text-[#475569] leading-relaxed pt-4">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Still need help ── */}
        <div className="mt-16 bg-white border border-[#E2E8F0] rounded-[8px] p-8 text-center shadow-[#1E293B_2px_2px_0px_0px]">
          <h3 className="text-lg font-bold text-[#0F172A] mb-2">Still have questions?</h3>
          <p className="text-sm text-[#64748B] mb-6">
            Our support team is happy to help. Write to us and we will respond within one business
            day.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-medium px-6 py-2.5 rounded-[4px] hover:bg-[#1D4ED8] transition-colors text-sm shadow-[#1E293B_2px_2px_0px_0px]"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
}
