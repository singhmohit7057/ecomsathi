/**
 * coordinates.ts
 *
 * Each marketplace has a unique PDF structure. Rather than one generic
 * "labelRegion + invoiceRegion" approach, we define a `pageStrategy` that
 * tells the engine exactly how to process each platform's PDF.
 *
 * PageStrategy values:
 *
 *  'single_page'    — Label and invoice are regions on EVERY page.
 *                     Engine applies labelRegion + invoiceRegion to each page.
 *                     → Flipkart, Shopsy, AJIO, Snapdeal, Nykaa
 *
 *  'multi_page'     — PDF has multiple pages; each page is a FULL document.
 *                     Page 1 = label, Page 2 = invoice, Page 3+ = skip (blank).
 *                     → Amazon
 *
 *  'full_page'      — User uploads a single-purpose PDF (label-only or
 *                     invoice-only file). Every page = one full label.
 *                     Myntra ships SEPARATE label + invoice PDFs; the user
 *                     uploads whichever file they need.
 *                     → Myntra
 *
 *  'dynamic_split'  — Label and invoice share a page but the split point
 *                     varies because label height depends on address length.
 *                     Engine auto-detects the horizontal separator row.
 *                     → Meesho
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PageStrategy = 'single_page' | 'multi_page' | 'full_page' | 'dynamic_split';

export interface CropRegion {
  /** Fraction of page width from left edge (0–1) */
  x: number;
  /** Fraction of page height from top edge (0–1) */
  y: number;
  /** Fraction of page width (0–1) */
  width: number;
  /** Fraction of page height (0–1) */
  height: number;
  /** Optional rotation in degrees applied after cropping */
  rotate?: number;
}

export interface MarketplaceCropConfig {
  marketplace: string;
  slug: string;

  /** How the engine processes this marketplace's PDF */
  pageStrategy: PageStrategy;

  /**
   * Fixed label crop region (single_page strategy only).
   * For multi_page / full_page / dynamic_split this is ignored.
   */
  labelRegion?: CropRegion;

  /**
   * Fixed invoice crop region (single_page strategy only).
   * Absent → marketplace has no invoice on the label PDF.
   */
  invoiceRegion?: CropRegion;

  /**
   * Edge trim fraction (0–0.05) applied when extracting full pages.
   * Used by multi_page and full_page to remove printer margins.
   * Default: 0.01
   */
  marginTrim: number;

  /**
   * For dynamic_split — scan range within which the separator is searched.
   * [minFraction, maxFraction] of page height. Default: [0.20, 0.70]
   */
  splitScanRange?: [number, number];

  /** Short guidance text shown in the tool UI */
  note?: string;

  outputSizes: {
    thermal: { width: number; height: number };
    a4: { labelsPerPage: number };
  };
}

// ---------------------------------------------------------------------------
// Configs
// ---------------------------------------------------------------------------

export const MARKETPLACE_CONFIGS: Record<string, MarketplaceCropConfig> = {

  // =========================================================================
  // AMAZON
  // Structure: multi-page PDF.
  //   • Page 1 → full shipping label
  //   • Page 2 → full invoice (only when "Include invoice" is on)
  //   • Page 3+ → blank, skip
  // =========================================================================
  amazon: {
    marketplace: 'Amazon',
    slug: 'amazon',
    pageStrategy: 'multi_page',
    marginTrim: 0.01,
    note: 'Amazon PDFs: odd pages = shipping labels, even pages = invoices. Works with both single orders and merged multi-order PDFs.',
    outputSizes: {
      thermal: { width: 100, height: 150 },
      a4: { labelsPerPage: 4 },
    },
  },

  // =========================================================================
  // FLIPKART
  // Structure: single-page PDF — every page contains BOTH label and invoice.
  //   • Label  — full width, top ~43% (ends just above the dashed separator)
  //   • Dashed separator sits at ~43–47%
  //   • Invoice — full width, bottom 53% (y=0.47 to 1.0), rotated 90° to portrait
  //     The cropped strip is landscape (210×125mm) so rotate:90 makes it portrait.
  // =========================================================================
  flipkart: {
    marketplace: 'Flipkart',
    slug: 'flipkart',
    pageStrategy: 'single_page',
    labelRegion:   { x: 0.31, y: 0.027, width: 0.381, height: 0.428 },
    invoiceRegion: { x: 0.06, y: 0.46, width: 0.88, height: 0.44, rotate: 90 },
    marginTrim: 0.005,
    note: 'Each Flipkart PDF page has the shipping label on the top half and the tax invoice on the bottom half, separated by a dashed line.',
    outputSizes: {
      thermal: { width: 100, height: 150 },
      a4: { labelsPerPage: 4 },
    },
  },

  // =========================================================================
  // MYNTRA
  // Structure: SEPARATE files — Myntra generates a label PDF and an invoice
  // PDF independently. Upload whichever file you need; each page of the
  // uploaded file is treated as one complete label (or invoice).
  // Do NOT enable "Include invoice" — upload the invoice PDF separately.
  // =========================================================================
  myntra: {
    marketplace: 'Myntra',
    slug: 'myntra',
    pageStrategy: 'full_page',
    marginTrim: 0,
    note: 'Myntra provides a separate label PDF and a separate invoice PDF. Upload the label PDF here — each page becomes one print-ready label. For invoices, upload the invoice PDF in a separate session.',
    outputSizes: {
      thermal: { width: 100, height: 150 },
      a4: { labelsPerPage: 4 },
    },
  },

  // =========================================================================
  // MEESHO
  // Structure: single-page PDF — one order per page.
  //   • Label (top ~50–58%) — Customer address, courier, QR code, AWB
  //     barcode, Product Details (SKU/Size/Qty/Color/Order No.)
  //   • "Fold Here" dashed line separator — varies 50–58% based on address
  //     length and courier destination code length
  //   • Invoice (below fold, ends ~85–90%) — TAX INVOICE with Bill To /
  //     Ship To / line items / total
  //   • Blank whitespace — remaining ~10–15% at bottom, excluded from crop
  //
  // Scan range 0.44–0.62 targets the "Fold Here" zone accurately.
  // marginTrim trims page edges and blank bottom space.
  // =========================================================================
  meesho: {
    marketplace: 'Meesho',
    slug: 'meesho',
    pageStrategy: 'dynamic_split',
    marginTrim: 0.008,
    splitScanRange: [0.20, 0.72],
    note: 'Each Meesho page has the shipping label on top and the tax invoice below, separated by a "Fold Here" dashed line. Label height varies per order — the tool auto-detects the separator on each page.',
    outputSizes: {
      thermal: { width: 100, height: 150 },
      a4: { labelsPerPage: 4 },
    },
  },

  // =========================================================================
  // AJIO
  // Structure: single-page PDF.
  //   • Label  — top half of every page (0–50%)
  //   • Invoice — bottom half of every page (50–100%)
  // =========================================================================
  ajio: {
    marketplace: 'AJIO',
    slug: 'ajio',
    pageStrategy: 'single_page',
    labelRegion:   { x: 0, y: 0,   width: 1, height: 0.5 },
    invoiceRegion: { x: 0, y: 0.5, width: 1, height: 0.5 },
    marginTrim: 0,
    note: 'AJIO PDFs have the shipping label in the top half and the invoice in the bottom half of each page.',
    outputSizes: {
      thermal: { width: 100, height: 150 },
      a4: { labelsPerPage: 4 },
    },
  },

  // =========================================================================
  // NYKAA
  // Structure: single-page PDF, label only — no invoice on the label PDF.
  //   • Label — upper-left portion of the page
  // =========================================================================
  nykaa: {
    marketplace: 'Nykaa',
    slug: 'nykaa',
    pageStrategy: 'single_page',
    labelRegion: { x: 0.12, y: 0.08, width: 0.5, height: 0.35 },
    marginTrim: 0,
    note: 'Nykaa label PDFs contain only the shipping label. There is no invoice region on the label PDF.',
    outputSizes: {
      thermal: { width: 100, height: 150 },
      a4: { labelsPerPage: 4 },
    },
  },

  // =========================================================================
  // SNAPDEAL
  // Structure: single-page PDF.
  //   • Label  — top half of every page (0–50%)
  //   • Invoice — bottom half of every page (50–100%)
  // =========================================================================
  snapdeal: {
    marketplace: 'Snapdeal',
    slug: 'snapdeal',
    pageStrategy: 'single_page',
    labelRegion:   { x: 0, y: 0,   width: 1, height: 0.5 },
    invoiceRegion: { x: 0, y: 0.5, width: 1, height: 0.5 },
    marginTrim: 0,
    note: 'Snapdeal PDFs have the shipping label in the top half and the invoice in the bottom half of each page.',
    outputSizes: {
      thermal: { width: 100, height: 150 },
      a4: { labelsPerPage: 4 },
    },
  },

  // =========================================================================
  // SHOPSY (by Flipkart)
  // Identical PDF structure to Flipkart — label top 47%, invoice bottom 53%.
  // =========================================================================
  shopsy: {
    marketplace: 'Shopsy',
    slug: 'shopsy',
    pageStrategy: 'single_page',
    labelRegion:   { x: 0.31, y: 0.027, width: 0.381, height: 0.428 },
    invoiceRegion: { x: 0.06, y: 0.46, width: 0.88, height: 0.44, rotate: 90 },
    marginTrim: 0.005,
    note: 'Shopsy (by Flipkart) uses the same PDF layout as Flipkart — shipping label on the top half, tax invoice on the bottom half.',
    outputSizes: {
      thermal: { width: 100, height: 150 },
      a4: { labelsPerPage: 4 },
    },
  },
};

// ---------------------------------------------------------------------------
// Helper: denormalize a CropRegion to pixel coordinates
// ---------------------------------------------------------------------------
export function denormalizeRegion(
  region: CropRegion,
  pageWidth: number,
  pageHeight: number,
): { x: number; y: number; width: number; height: number } {
  return {
    x: region.x * pageWidth,
    y: region.y * pageHeight,
    width: region.width * pageWidth,
    height: region.height * pageHeight,
  };
}
