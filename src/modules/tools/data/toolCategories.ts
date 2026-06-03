import type { ToolCategoryData, PopularToolData, FAQItemData, MarketplaceData } from '../types'

export const TOOL_CATEGORIES: ToolCategoryData[] = [
  {
    id: 'pdf',
    title: 'PDF Tools',
    description: 'Merge, split, crop, compress, and manage PDF files online.',
    href: '/tools/pdf',
    buttonText: 'View All PDF Tools',
    colorScheme: 'blue',
    tools: [
      { name: 'Merge PDF',    path: '/tools/pdf/merge',        iconName: 'FilePlus' },
      { name: 'Split PDF',    path: '/tools/pdf/split',        iconName: 'Scissors' },
      { name: 'OCR PDF',      path: '/tools/pdf/ocr',          iconName: 'ScanText' },
      { name: 'Compress PDF', path: '/tools/pdf/compress',     iconName: 'FileDown' },
      { name: 'PDF To Image', path: '/tools/pdf/to-images',    iconName: 'FileImage' },
      { name: 'Image To PDF', path: '/tools/pdf/images-to-pdf',iconName: 'Images' },
    ],
  },
  {
    id: 'image',
    title: 'Image Tools',
    description: 'Optimize and prepare product images for marketplaces.',
    href: '/tools/image',
    buttonText: 'View All Image Tools',
    colorScheme: 'green',
    tools: [
      { name: 'Background Remover', path: '/tools/image/background-remover', iconName: 'Eraser' },
      { name: 'Resize Image',       path: '/tools/image/resize',             iconName: 'Maximize2' },
      { name: 'Crop Image',         path: '/tools/image/crop',               iconName: 'Crop' },
      { name: 'Compress Image',     path: '/tools/image/compress',           iconName: 'Package' },
      { name: 'JPG To PNG',         path: '/tools/image/jpg-to-png',         iconName: 'ArrowLeftRight' },
      { name: 'WEBP Converter',     path: '/tools/image/webp',               iconName: 'RefreshCw' },
    ],
  },
  {
    id: 'video',
    title: 'Video Tools',
    description: 'Convert and optimize product videos.',
    href: '/tools/video',
    buttonText: 'View All Video Tools',
    colorScheme: 'rose',
    tools: [
      { name: 'Video To GIF',        path: '/tools/video/to-gif',         iconName: 'Film' },
      { name: 'Frame Extractor',     path: '/tools/video/frame-extractor',iconName: 'Camera' },
      { name: 'Compress Video',      path: '/tools/video/compress',       iconName: 'Video' },
      { name: 'Resize Video',        path: '/tools/video/resize',         iconName: 'Maximize' },
      { name: 'Video Converter',     path: '/tools/video/converter',        iconName: 'RefreshCcw' },
      { name: 'Thumbnail Generator', path: '/tools/video/thumbnail-generator',      iconName: 'ImageIcon' },
    ],
  },
  {
    id: 'gst',
    title: 'GST Tools',
    description: 'GST utilities for sellers and businesses.',
    href: '/tools/gst',
    buttonText: 'View All GST Tools',
    colorScheme: 'cyan',
    tools: [
      { name: 'GST Verification',       path: '/tools/gst/verify',      iconName: 'ShieldCheck' },
      { name: 'GST Calculator',         path: '/tools/gst/calculator',  iconName: 'Calculator' },
      { name: 'Reverse GST Calculator', path: '/tools/gst/reverse',     iconName: 'RotateCcw' },
      { name: 'HSN Search',             path: '/tools/gst/hsn-search',  iconName: 'BookOpen' },
      { name: 'GST Rate Finder',        path: '/tools/gst/rate-finder', iconName: 'Percent' },
    ],
  },
  {
    id: 'sku',
    title: 'SKU Tools',
    description: 'Generate and manage product SKUs easily.',
    href: '/tools/sku',
    buttonText: 'View All SKU Tools',
    colorScheme: 'violet',
    tools: [
      { name: 'SKU Generator',         path: '/tools/sku/generator',      iconName: 'Tag' },
      { name: 'Bulk SKU Generator',    path: '/tools/sku/bulk',           iconName: 'Tags' },
      { name: 'Variant SKU Generator', path: '/tools/sku/variant',        iconName: 'Layers' },
      { name: 'Barcode Generator',     path: '/tools/sku/barcode',        iconName: 'Barcode' },
      { name: 'Label Generator',       path: '/tools/sku/label-generator',iconName: 'FileText' },
      { name: 'Label Printer',         path: '/tools/sku/label-printer',  iconName: 'Printer' },
    ],
  },
  {
    id: 'label',
    title: 'Label Crop Tools',
    description: 'Auto-crop shipping labels for all major Indian marketplaces.',
    href: '/label-crop',
    buttonText: 'View All Label Crop Tools',
    colorScheme: 'amber',
    tools: [
      { name: 'Amazon Label Crop',   path: '/label-crop/amazon',   iconName: 'ShoppingCart' },
      { name: 'Flipkart Label Crop', path: '/label-crop/flipkart', iconName: 'Package' },
      { name: 'Myntra Label Crop',   path: '/label-crop/myntra',   iconName: 'Shirt' },
      { name: 'Meesho Label Crop',   path: '/label-crop/meesho',   iconName: 'Store' },
      { name: 'AJIO Label Crop',     path: '/label-crop/ajio',     iconName: 'Tag' },
      { name: 'Nykaa Label Crop',    path: '/label-crop/nykaa',    iconName: 'Heart' },
      { name: 'Snapdeal Label Crop', path: '/label-crop/snapdeal', iconName: 'Zap' },
      { name: 'Shopsy Label Crop',   path: '/label-crop/shopsy',   iconName: 'ShoppingBag' },
    ],
  },
]

export const POPULAR_TOOLS: PopularToolData[] = [
  {
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one document instantly.',
    path: '/tools/pdf/merge',
    category: 'PDF Tools',
    colorScheme: 'blue',
  },
  {
    name: 'Background Remover',
    description: 'Remove image backgrounds for marketplace-ready product photos.',
    path: '/tools/image/background-remover',
    category: 'Image Tools',
    colorScheme: 'green',
  },
  {
    name: 'GST Calculator',
    description: 'Calculate GST amounts for any product or service.',
    path: '/tools/gst/calculator',
    category: 'GST Tools',
    colorScheme: 'cyan',
  },
  {
    name: 'SKU Generator',
    description: 'Create structured SKU codes for your product catalogue.',
    path: '/tools/sku/generator',
    category: 'SKU Tools',
    colorScheme: 'violet',
  },
  {
    name: 'Video To GIF',
    description: 'Convert product videos to animated GIFs for listings.',
    path: '/tools/video/to-gif',
    category: 'Video Tools',
    colorScheme: 'rose',
  },
  {
    name: 'Amazon Label Crop',
    description: 'Auto-crop Amazon shipping labels from multi-label PDFs.',
    path: '/label-crop',
    category: 'Label Crop',
    colorScheme: 'amber',
  },
  {
    name: 'Flipkart Label Crop',
    description: 'Auto-crop Flipkart shipping labels in seconds.',
    path: '/label-crop',
    category: 'Label Crop',
    colorScheme: 'amber',
  },
  {
    name: 'OCR PDF',
    description: 'Extract text from scanned PDFs and images.',
    path: '/tools/pdf/ocr',
    category: 'PDF Tools',
    colorScheme: 'blue',
  },
]

export const MARKETPLACES: MarketplaceData[] = [
  { name: 'Amazon',   accentColor: '#FF9900', bgColor: 'bg-[#FFF7ED]', textColor: 'text-[#C05000]', badge: 'Most Popular' },
  { name: 'Flipkart', accentColor: '#2874F0', bgColor: 'bg-[#EFF6FF]', textColor: 'text-[#1D4ED8]', badge: 'High Volume' },
  { name: 'Myntra',   accentColor: '#FF3F6C', bgColor: 'bg-[#FFF1F2]', textColor: 'text-[#BE123C]' },
  { name: 'Meesho',   accentColor: '#9B26AF', bgColor: 'bg-[#FAF5FF]', textColor: 'text-[#7C3AED]' },
  { name: 'AJIO',     accentColor: '#1A1A1A', bgColor: 'bg-[#F8FAFC]', textColor: 'text-[#0F172A]' },
  { name: 'Nykaa',    accentColor: '#FC2779', bgColor: 'bg-[#FDF2F8]', textColor: 'text-[#BE185D]' },
  { name: 'Snapdeal', accentColor: '#E40020', bgColor: 'bg-[#FFF1F2]', textColor: 'text-[#9F1239]' },
  { name: 'Shopsy',   accentColor: '#F0530A', bgColor: 'bg-[#FFF7ED]', textColor: 'text-[#C2410C]' },
]

export const FAQ_ITEMS: FAQItemData[] = [
  {
    question: 'Are these tools free?',
    answer: 'Yes, all tools on EcomSathi are 100% free to use. There are no hidden charges, subscriptions, or usage limits for any of the free tools listed on this page.',
  },
  {
    question: 'Do I need an account?',
    answer: 'No account is required for most tools. You can start using PDF tools, image tools, video tools, GST calculators, SKU generators, and label crop tools directly without signing up.',
  },
  {
    question: 'How long are files stored?',
    answer: 'Uploaded files are processed in your browser and are not stored on our servers. Files are automatically cleared when you close or refresh the page, ensuring your data stays private.',
  },
  {
    question: 'Which marketplaces are supported?',
    answer: 'EcomSathi Label Crop tools support Amazon, Flipkart, Myntra, Meesho, AJIO, Nykaa, and Snapdeal. GST and SKU tools work for all Indian marketplace sellers.',
  },
  {
    question: 'Can I use tools on mobile?',
    answer: 'Yes, all EcomSathi tools are fully mobile-friendly and work on smartphones and tablets. The interface is responsive and optimized for all screen sizes.',
  },
  {
    question: 'Are uploaded files secure?',
    answer: 'Your files are processed securely. Most tools process files directly in your browser without uploading to any server. For tools that require server processing, files are deleted immediately after processing.',
  },
]
