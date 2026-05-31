// Normalized crop coordinates for each marketplace.
// All values are fractions of the page dimensions (0–1).
// Ported and adapted from sku-label-editor/src/components/labelcrop/

export interface CropRegion {
  /** Fraction of page width from left edge */
  x: number;
  /** Fraction of page height from top edge */
  y: number;
  /** Fraction of page width */
  width: number;
  /** Fraction of page height */
  height: number;
  /** Optional rotation in degrees applied after cropping */
  rotate?: number;
}

export interface MarketplaceCropConfig {
  marketplace: string;
  slug: string;
  /** Region containing the shipping label */
  labelRegion: CropRegion;
  /** Region containing the invoice — absent for label-only marketplaces */
  invoiceRegion?: CropRegion;
  /** Describes how label/invoice/blank areas are distributed on each page */
  pagePattern: 'label_only' | 'label_invoice' | 'label_invoice_blank' | 'thermal';
  outputSizes: {
    /** Thermal printer page size in mm */
    thermal: { width: number; height: number };
    /** A4 packing — how many labels fit on one A4 page */
    a4: { labelsPerPage: number };
  };
}

export const MARKETPLACE_CONFIGS: Record<string, MarketplaceCropConfig> = {
  // =====================================================================
  // AMAZON
  // Each A4 page has: label (top half), blank (bottom-right), invoice (right strip)
  // Label occupies the top 46% of the full page width.
  // Invoice is a right-side strip: ~56.5% wide, starting at x=38.5%, top 7%–92%.
  // =====================================================================
  amazon: {
    marketplace: 'Amazon',
    slug: 'amazon',
    labelRegion: { x: 0, y: 0, width: 1, height: 0.46 },
    invoiceRegion: { x: 0.385, y: 0.07, width: 0.565, height: 0.85 },
    pagePattern: 'label_invoice_blank',
    outputSizes: {
      thermal: { width: 100, height: 150 },
      a4: { labelsPerPage: 4 },
    },
  },

  // =====================================================================
  // FLIPKART
  // Each A4 page: label top-centre, invoice rotated at bottom.
  // Adapted from flipkartConfig: label at x=0.31, y=0.027, w=0.381, h=0.428
  // Invoice at x=0.05, y=0.46, w=0.91, h=0.441 (rotate 90°)
  // EcomSathi uses full-width normalized layout:
  // =====================================================================
  flipkart: {
    marketplace: 'Flipkart',
    slug: 'flipkart',
    labelRegion: { x: 0.31, y: 0.027, width: 0.381, height: 0.428 },
    invoiceRegion: { x: 0.05, y: 0.46, width: 0.91, height: 0.441, rotate: 90 },
    pagePattern: 'label_invoice',
    outputSizes: {
      thermal: { width: 100, height: 150 },
      a4: { labelsPerPage: 4 },
    },
  },

  // =====================================================================
  // MYNTRA
  // Label PDF and invoice PDF are separate files.
  // Label: left column, near full page (x=0.003, y=0.002, w=0.93, h=0.99)
  // Invoice: near full page after trimming margins
  // =====================================================================
  myntra: {
    marketplace: 'Myntra',
    slug: 'myntra',
    labelRegion: { x: 0.003, y: 0.002, width: 0.93, height: 0.99 },
    invoiceRegion: { x: 0.04, y: 0.04, width: 0.92, height: 0.92 },
    pagePattern: 'label_invoice',
    outputSizes: {
      thermal: { width: 100, height: 150 },
      a4: { labelsPerPage: 4 },
    },
  },

  // =====================================================================
  // MEESHO
  // Label-only — no separate invoice region.
  // Label region (dynamic in sku-label-editor but fixed here):
  // x=0.12, y=0.04, w=0.76, h=0.22
  // =====================================================================
  meesho: {
    marketplace: 'Meesho',
    slug: 'meesho',
    labelRegion: { x: 0.12, y: 0.04, width: 0.76, height: 0.22 },
    pagePattern: 'label_only',
    outputSizes: {
      thermal: { width: 100, height: 150 },
      a4: { labelsPerPage: 4 },
    },
  },

  // =====================================================================
  // AJIO
  // Label top half, invoice bottom half (full width)
  // =====================================================================
  ajio: {
    marketplace: 'AJIO',
    slug: 'ajio',
    labelRegion: { x: 0, y: 0, width: 1, height: 0.5 },
    invoiceRegion: { x: 0, y: 0.5, width: 1, height: 0.5 },
    pagePattern: 'label_invoice',
    outputSizes: {
      thermal: { width: 100, height: 150 },
      a4: { labelsPerPage: 4 },
    },
  },

  // =====================================================================
  // NYKAA
  // Label only — top portion of each page
  // Adapted from nykaaConfig: x=0.12, y=0.08, w=0.5, h=0.35
  // =====================================================================
  nykaa: {
    marketplace: 'Nykaa',
    slug: 'nykaa',
    labelRegion: { x: 0.12, y: 0.08, width: 0.5, height: 0.35 },
    pagePattern: 'label_only',
    outputSizes: {
      thermal: { width: 100, height: 150 },
      a4: { labelsPerPage: 4 },
    },
  },

  // =====================================================================
  // SNAPDEAL
  // Label top half, invoice bottom half (full width)
  // =====================================================================
  snapdeal: {
    marketplace: 'Snapdeal',
    slug: 'snapdeal',
    labelRegion: { x: 0, y: 0, width: 1, height: 0.5 },
    invoiceRegion: { x: 0, y: 0.5, width: 1, height: 0.5 },
    pagePattern: 'label_invoice',
    outputSizes: {
      thermal: { width: 100, height: 150 },
      a4: { labelsPerPage: 4 },
    },
  },
};

// -----------------------------------------------------------------------
// Helper: denormalize a CropRegion to pixel coordinates
// -----------------------------------------------------------------------
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
