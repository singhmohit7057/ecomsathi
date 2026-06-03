import type { MarketplaceInfo } from '../types';

export const MARKETPLACE_META: Record<string, MarketplaceInfo> = {
  amazon: {
    slug: 'amazon',
    name: 'Amazon',
    displayName: 'Amazon',
    emoji: '📦',
    tagline: 'Crop Amazon shipping labels instantly',
    description: 'Extract clean, print-ready shipping labels from Amazon seller-fulfilled and FBA order PDFs. Supports A4 and thermal 4×6 output.',
    seoTitle: 'Amazon Label Crop Tool Online Free',
    seoDescription: 'Free online Amazon shipping label crop tool. Upload your Amazon order PDF and instantly crop, optimize, and download thermal or A4 print-ready labels. No login required.',
    seoKeywords: 'amazon label crop, amazon shipping label, amazon label tool, crop amazon label, amazon thermal label, amazon 4x6 label',
    h1: 'Amazon Shipping Label Crop Tool',
    features: [
      'Amazon label auto-detection',
      'A4 and thermal 4×6 output',
      'Barcode & QR safe cropping',
      'Invoice extraction support',
      'Batch PDF processing',
      'High-resolution export',
    ],
    hasInvoice: true,
    color: '#FF9900',
    bgColor: '#FFF8EC',
    faqs: [
      {
        q: 'How do I crop Amazon shipping labels?',
        a: 'Upload your Amazon order PDF, select Amazon as the marketplace, choose thermal or A4 output, and click Crop Labels. The tool automatically detects and crops the shipping label region.',
      },
      {
        q: 'Can I extract invoices from Amazon PDFs?',
        a: 'Yes. Enable "Include Invoice" before processing to extract both the shipping label and the invoice from each Amazon order PDF page.',
      },
      {
        q: 'What format is the Amazon shipping label?',
        a: 'Amazon seller-fulfilled labels are typically on A4 pages with the label in the top half. This tool crops that region and exports it as thermal (100×150 mm) or 4-up A4.',
      },
      {
        q: 'Is batch processing supported for Amazon labels?',
        a: 'Yes. Switch to Batch mode, upload multiple Amazon PDFs, and download all cropped labels as individual files or a single ZIP.',
      },
      {
        q: 'Does this tool support FBA labels?',
        a: 'Yes. The crop engine handles both FBA and seller-fulfilled Amazon label PDFs.',
      },
    ],
  },

  flipkart: {
    slug: 'flipkart',
    name: 'Flipkart',
    displayName: 'Flipkart',
    emoji: '🛒',
    tagline: 'Crop Flipkart shipping labels in seconds',
    description: 'Extract and crop Flipkart shipping labels from seller hub PDFs. The label is centred in the top half — this tool crops it precisely for thermal and A4 printers.',
    seoTitle: 'Flipkart Label Crop Tool Online Free',
    seoDescription: 'Free online Flipkart shipping label crop tool. Upload your Flipkart order PDF and crop shipping labels to thermal or A4 format instantly. No login required.',
    seoKeywords: 'flipkart label crop, flipkart shipping label, flipkart label tool, crop flipkart label, flipkart thermal label',
    h1: 'Flipkart Shipping Label Crop Tool',
    features: [
      'Flipkart label auto-detection',
      'Centred label extraction',
      'Invoice region extraction',
      'Thermal and A4 output',
      'Bulk PDF processing',
      'High-resolution PNG export',
    ],
    hasInvoice: true,
    color: '#2874F0',
    bgColor: '#EFF4FF',
    faqs: [
      {
        q: 'How do I crop Flipkart shipping labels?',
        a: 'Upload your Flipkart order PDF, select Flipkart as the marketplace, choose your output format, and click Crop Labels. The tool locates and crops the centred label automatically.',
      },
      {
        q: 'Where is the label on a Flipkart PDF?',
        a: 'Flipkart labels are centred horizontally in the upper portion of each A4 page, with the invoice rotated at the bottom. This tool crops the label region precisely.',
      },
      {
        q: 'Can I get the invoice too from Flipkart PDFs?',
        a: 'Yes. Enable "Include Invoice" and the tool extracts the rotated invoice section from the bottom of each page in addition to the label.',
      },
      {
        q: 'What sizes does Flipkart label output support?',
        a: 'Thermal (100×150 mm / 4×6 inch) for direct thermal printers, and A4 with 4 labels per page for desktop printers.',
      },
      {
        q: 'Is bulk label crop supported for Flipkart?',
        a: 'Yes. Upload multiple Flipkart PDFs in Batch mode and download all cropped labels as a ZIP archive.',
      },
    ],
  },

  myntra: {
    slug: 'myntra',
    name: 'Myntra',
    displayName: 'Myntra',
    emoji: '👗',
    tagline: 'Crop Myntra shipping labels effortlessly',
    description: 'Crop Myntra shipping label PDFs to print-ready thermal or A4 format. Myntra labels fill most of the page — the tool trims margins and exports cleanly.',
    seoTitle: 'Myntra Label Crop Tool Online Free',
    seoDescription: 'Free online Myntra shipping label crop tool. Upload your Myntra order PDF and instantly crop labels for thermal or A4 printing. No login needed.',
    seoKeywords: 'myntra label crop, myntra shipping label, myntra label tool, crop myntra label, myntra thermal label',
    h1: 'Myntra Shipping Label Crop Tool',
    features: [
      'Myntra label auto-detection',
      'Full-page label extraction',
      'Margin trimming',
      'Thermal and A4 output',
      'Bulk PDF processing',
      'PNG and PDF export',
    ],
    hasInvoice: true,
    color: '#FF3F6C',
    bgColor: '#FFF0F4',
    faqs: [
      {
        q: 'How do I crop Myntra shipping labels?',
        a: 'Upload your Myntra label PDF, select Myntra as the marketplace, choose thermal or A4 output, and click Crop Labels.',
      },
      {
        q: 'Does Myntra provide labels and invoices in the same PDF?',
        a: 'Myntra may provide separate label and invoice PDFs. If both are in the same file, enable Include Invoice to extract both.',
      },
      {
        q: 'What is the Myntra label format?',
        a: 'Myntra labels nearly fill the full A4 page with small margins. This tool trims those margins for a clean print.',
      },
      {
        q: 'Can I print Myntra labels on a thermal printer?',
        a: 'Yes. Select Thermal output to get labels formatted as 100×150 mm, one per page, ready for direct thermal printers.',
      },
      {
        q: 'Is batch processing supported for Myntra?',
        a: 'Yes. Upload multiple Myntra PDFs at once in Batch mode and download all as a ZIP.',
      },
    ],
  },

  meesho: {
    slug: 'meesho',
    name: 'Meesho',
    displayName: 'Meesho',
    emoji: '🛍️',
    tagline: 'Crop Meesho labels for thermal printing',
    description: 'Crop Meesho shipping label PDFs to compact thermal or A4 format. Meesho labels sit in the centre-top of each page — extract them instantly.',
    seoTitle: 'Meesho Label Crop Tool Online Free',
    seoDescription: 'Free online Meesho shipping label crop tool. Crop and export Meesho labels to thermal or A4 format. No login required, process in your browser.',
    seoKeywords: 'meesho label crop, meesho shipping label, meesho label tool, crop meesho label, meesho thermal label',
    h1: 'Meesho Shipping Label Crop Tool',
    features: [
      'Meesho label auto-detection',
      'Centre-top region extraction',
      'Thermal and A4 output',
      'Bulk PDF processing',
      'PNG and PDF export',
      'High-resolution output',
    ],
    hasInvoice: false,
    color: '#9B2FF7',
    bgColor: '#F6EEFF',
    faqs: [
      {
        q: 'How do I crop Meesho shipping labels?',
        a: 'Upload your Meesho order PDF, select Meesho as the marketplace, choose output format, and click Crop Labels.',
      },
      {
        q: 'Where is the label on a Meesho PDF?',
        a: 'Meesho labels are in the upper-centre area of each A4 page. The tool crops this region automatically.',
      },
      {
        q: 'Does Meesho have an invoice in the same PDF?',
        a: 'Meesho does not include an invoice in the same label PDF. The tool extracts the label region only.',
      },
      {
        q: 'What printer format does Meesho support?',
        a: 'Thermal (100×150 mm) for direct thermal printers, and A4 with 4 labels per page for regular printers.',
      },
      {
        q: 'Can I process multiple Meesho orders at once?',
        a: 'Yes. Use Batch mode to upload multiple PDFs and download all cropped labels in one ZIP file.',
      },
    ],
  },

  ajio: {
    slug: 'ajio',
    name: 'AJIO',
    displayName: 'AJIO',
    emoji: '🎽',
    tagline: 'Crop AJIO labels and invoices from one PDF',
    description: 'AJIO order PDFs contain the shipping label in the top half and invoice in the bottom half. Extract either or both — instantly, in your browser.',
    seoTitle: 'AJIO Label Crop Tool Online Free',
    seoDescription: 'Free online AJIO shipping label crop tool. Extract AJIO shipping labels and invoices from order PDFs. Thermal and A4 output supported. No login required.',
    seoKeywords: 'ajio label crop, ajio shipping label, ajio label tool, crop ajio label, ajio thermal label, ajio invoice crop',
    h1: 'AJIO Shipping Label Crop Tool',
    features: [
      'AJIO label auto-detection',
      'Top-half label extraction',
      'Bottom-half invoice extraction',
      'Thermal and A4 output',
      'Bulk PDF processing',
      'PNG and PDF export',
    ],
    hasInvoice: true,
    color: '#E91E63',
    bgColor: '#FFF0F5',
    faqs: [
      {
        q: 'How do I crop AJIO shipping labels?',
        a: 'Upload your AJIO order PDF, select AJIO as the marketplace, choose your output format, and click Crop Labels.',
      },
      {
        q: 'Where is the label on an AJIO PDF?',
        a: 'AJIO PDFs have the shipping label in the top half of each page and the invoice in the bottom half.',
      },
      {
        q: 'Can I get invoices from AJIO PDFs?',
        a: 'Yes. Enable "Include Invoice" to also extract the invoice from the bottom half of each AJIO page.',
      },
      {
        q: 'What output formats are supported for AJIO?',
        a: 'Thermal (100×150 mm) and A4 (4 per page) PDF output, plus PNG for individual labels.',
      },
      {
        q: 'Does bulk AJIO label processing work?',
        a: 'Yes. Upload multiple AJIO order PDFs in Batch mode and download all labels (and invoices) as a ZIP.',
      },
    ],
  },

  nykaa: {
    slug: 'nykaa',
    name: 'Nykaa',
    displayName: 'Nykaa',
    emoji: '💄',
    tagline: 'Crop Nykaa shipping labels with precision',
    description: 'Extract Nykaa shipping labels from order PDFs. Labels appear in the upper-left area of each page — the tool crops them cleanly for thermal and A4 output.',
    seoTitle: 'Nykaa Label Crop Tool Online Free',
    seoDescription: 'Free online Nykaa shipping label crop tool. Crop Nykaa labels to thermal or A4 format in seconds. No login required, all processing in browser.',
    seoKeywords: 'nykaa label crop, nykaa shipping label, nykaa label tool, crop nykaa label, nykaa thermal label',
    h1: 'Nykaa Shipping Label Crop Tool',
    features: [
      'Nykaa label auto-detection',
      'Upper-left region extraction',
      'Thermal and A4 output',
      'Bulk PDF processing',
      'Barcode preservation',
      'PNG and PDF export',
    ],
    hasInvoice: false,
    color: '#FC2779',
    bgColor: '#FFF0F5',
    faqs: [
      {
        q: 'How do I crop Nykaa shipping labels?',
        a: 'Upload your Nykaa order PDF, select Nykaa as the marketplace, choose output format, and click Crop Labels.',
      },
      {
        q: 'Where is the Nykaa label on the PDF?',
        a: 'Nykaa labels are in the upper-left portion of each A4 page. The tool crops this region automatically.',
      },
      {
        q: 'Does Nykaa include an invoice in the label PDF?',
        a: 'Nykaa label PDFs do not include a separate invoice region. Only the label is extracted.',
      },
      {
        q: 'What printer format is supported for Nykaa labels?',
        a: 'Thermal (100×150 mm) for direct thermal printers, and A4 (4 per page) for desktop printers.',
      },
      {
        q: 'Can I batch process multiple Nykaa PDFs?',
        a: 'Yes. Use Batch mode to process multiple Nykaa PDFs and download all as a ZIP.',
      },
    ],
  },

  snapdeal: {
    slug: 'snapdeal',
    name: 'Snapdeal',
    displayName: 'Snapdeal',
    emoji: '⚡',
    tagline: 'Crop Snapdeal labels and invoices instantly',
    description: 'Snapdeal order PDFs have the shipping label in the top half and invoice in the bottom half. Crop both regions precisely for print-ready output.',
    seoTitle: 'Snapdeal Label Crop Tool Online Free',
    seoDescription: 'Free online Snapdeal shipping label crop tool. Extract Snapdeal labels and invoices from PDFs. Thermal and A4 output. No login required.',
    seoKeywords: 'snapdeal label crop, snapdeal shipping label, snapdeal label tool, crop snapdeal label, snapdeal thermal label',
    h1: 'Snapdeal Shipping Label Crop Tool',
    features: [
      'Snapdeal label auto-detection',
      'Top-half label extraction',
      'Bottom-half invoice extraction',
      'Thermal and A4 output',
      'Bulk PDF processing',
      'PNG and PDF export',
    ],
    hasInvoice: true,
    color: '#E40000',
    bgColor: '#FFF0F0',
    faqs: [
      {
        q: 'How do I crop Snapdeal shipping labels?',
        a: 'Upload your Snapdeal order PDF, select Snapdeal as the marketplace, choose thermal or A4 output, and click Crop Labels.',
      },
      {
        q: 'Where is the label on a Snapdeal PDF?',
        a: 'Snapdeal PDFs have the shipping label in the top half and the invoice in the bottom half of each page.',
      },
      {
        q: 'Can I extract Snapdeal invoices too?',
        a: 'Yes. Enable "Include Invoice" to extract the invoice from the bottom half alongside the shipping label.',
      },
      {
        q: 'What output formats are supported?',
        a: 'Thermal (100×150 mm) and A4 (4 per page) PDF output, plus PNG for individual label images.',
      },
      {
        q: 'Can I batch process multiple Snapdeal PDFs?',
        a: 'Yes. Upload multiple Snapdeal PDFs in Batch mode and download all as a ZIP archive.',
      },
    ],
  },
  shopsy: {
    slug: 'shopsy',
    name: 'Shopsy',
    displayName: 'Shopsy',
    emoji: '🛒',
    tagline: 'Crop Shopsy shipping labels in seconds',
    description: 'Extract and crop Shopsy (by Flipkart) shipping labels from order PDFs. Shopsy uses the same label layout as Flipkart — centred label in the top area with invoice rotated at the bottom.',
    seoTitle: 'Shopsy Label Crop Tool Online Free',
    seoDescription: 'Free online Shopsy shipping label crop tool. Upload your Shopsy order PDF and crop shipping labels to thermal or A4 format instantly. No login required.',
    seoKeywords: 'shopsy label crop, shopsy shipping label, shopsy label tool, crop shopsy label, shopsy thermal label, shopsy by flipkart label',
    h1: 'Shopsy Shipping Label Crop Tool',
    features: [
      'Shopsy label auto-detection',
      'Centred label extraction',
      'Invoice region extraction',
      'Thermal and A4 output',
      'Bulk PDF processing',
      'High-resolution PNG export',
    ],
    hasInvoice: true,
    color: '#F97316',
    bgColor: '#FFF7ED',
    faqs: [
      {
        q: 'How do I crop Shopsy shipping labels?',
        a: 'Upload your Shopsy order PDF, select Shopsy as the marketplace, choose your output format, and click Crop Labels. The tool locates and crops the centred label automatically.',
      },
      {
        q: 'What is Shopsy and how are its labels formatted?',
        a: 'Shopsy is a shopping app by Flipkart. Its shipping labels follow the same layout as Flipkart — centred horizontally in the upper portion of each A4 page, with the invoice rotated at the bottom.',
      },
      {
        q: 'Can I extract invoices from Shopsy PDFs?',
        a: 'Yes. Enable "Include Invoice" and the tool extracts the rotated invoice section from the bottom of each Shopsy page in addition to the label.',
      },
      {
        q: 'What output formats are supported for Shopsy labels?',
        a: 'Thermal (100×150 mm / 4×6 inch) for direct thermal printers, and A4 with 4 labels per page for desktop printers.',
      },
      {
        q: 'Is batch processing supported for Shopsy?',
        a: 'Yes. Upload multiple Shopsy PDFs in Batch mode and download all cropped labels as a ZIP archive.',
      },
    ],
  },
};

export const ALL_MARKETPLACES = Object.values(MARKETPLACE_META);
