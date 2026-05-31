/**
 * LabelCropEngine.ts
 *
 * Client-side PDF label cropping using pdfjs-dist (render) + pdf-lib (pack output).
 * Renders each PDF page to canvas at 300 DPI, crops to the configured region,
 * then packs the cropped images into a new PDF — thermal or A4 layout.
 */

import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import {
  type MarketplaceCropConfig,
  type CropRegion,
  denormalizeRegion,
} from './platforms/coordinates';

// Use CDN worker — avoids bundler worker setup complexity
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Render scale. 2.0 ≈ ~144 DPI on a standard 72 dpi PDF; adjust for quality. */
const RENDER_SCALE = 2.5;

/** PDF point dimensions for thermal 100×150 mm page (1 mm = 2.8346 pt) */
const THERMAL_W_PT = Math.round(100 * 2.8346); // 283 pt
const THERMAL_H_PT = Math.round(150 * 2.8346); // 425 pt

/** A4 dimensions in points */
const A4_W_PT = 595;
const A4_H_PT = 842;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Render a single PDF page to a canvas and return the canvas element.
 */
async function renderPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number,
): Promise<HTMLCanvasElement> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true })!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx as CanvasRenderingContext2D, viewport, canvas } as Parameters<typeof page.render>[0]).promise;

  // Force final draw (Amazon rendering fix — double-draw to canvas)
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = canvas.width;
  finalCanvas.height = canvas.height;
  finalCanvas.getContext('2d')!.drawImage(canvas, 0, 0);

  return finalCanvas;
}

/**
 * Crop a canvas to the given region and return a PNG data URL.
 */
function cropCanvasToDataURL(
  canvas: HTMLCanvasElement,
  region: { x: number; y: number; width: number; height: number },
  rotate?: number,
): string {
  const cropW = Math.round(region.width);
  const cropH = Math.round(region.height);

  const out = document.createElement('canvas');

  if (rotate && rotate !== 0) {
    // For 90° rotation: swap canvas dimensions
    const rad = (rotate * Math.PI) / 180;
    if (rotate === 90 || rotate === 270) {
      out.width = cropH;
      out.height = cropW;
    } else {
      out.width = cropW;
      out.height = cropH;
    }
    const ctx = out.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.translate(out.width / 2, out.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(canvas, region.x, region.y, cropW, cropH, -cropW / 2, -cropH / 2, cropW, cropH);
  } else {
    out.width = cropW;
    out.height = cropH;
    const ctx = out.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, region.x, region.y, cropW, cropH, 0, 0, cropW, cropH);
  }

  return out.toDataURL('image/png', 1.0);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface CropResult {
  labelsPdfBlob: Blob;
  invoicesPdfBlob?: Blob;
}

export type OutputType = 'thermal' | 'a4';

/**
 * Pack an array of PNG data URLs into a PDF.
 * - thermal: one image per 100×150 mm page
 * - a4: 4 images per A4 page in a 2×2 grid
 */
async function packImagesToPdf(
  images: string[],
  mode: OutputType,
): Promise<Blob> {
  const pdf = await PDFDocument.create();

  if (mode === 'thermal') {
    for (const dataUrl of images) {
      const pngData = dataUrl.split(',')[1];
      const pngBytes = Uint8Array.from(atob(pngData), (c) => c.charCodeAt(0));
      const embeddedImage = await pdf.embedPng(pngBytes);
      const page = pdf.addPage([THERMAL_W_PT, THERMAL_H_PT]);
      page.drawImage(embeddedImage, { x: 0, y: 0, width: THERMAL_W_PT, height: THERMAL_H_PT });
    }
  } else {
    // A4 — 2×2 grid with margins
    const margin = 12;
    const gap = 8;
    const usableW = A4_W_PT - margin * 2;
    const usableH = A4_H_PT - margin * 2;
    const cellW = (usableW - gap) / 2;
    const cellH = (usableH - gap) / 2;

    let page = pdf.addPage([A4_W_PT, A4_H_PT]);

    for (let i = 0; i < images.length; i++) {
      if (i > 0 && i % 4 === 0) {
        page = pdf.addPage([A4_W_PT, A4_H_PT]);
      }

      const pngData = images[i].split(',')[1];
      const pngBytes = Uint8Array.from(atob(pngData), (c) => c.charCodeAt(0));
      const embeddedImage = await pdf.embedPng(pngBytes);

      const slot = i % 4;
      const col = slot % 2;
      const row = Math.floor(slot / 2);

      const x = margin + col * (cellW + gap);
      // pdf-lib y=0 is bottom; top row is row=0 in our grid
      const y = A4_H_PT - margin - cellH - row * (cellH + gap);

      page.drawImage(embeddedImage, { x, y, width: cellW, height: cellH });
    }
  }

  const bytes = await pdf.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

/**
 * Main entry point.
 *
 * @param file          The uploaded PDF file
 * @param config        Marketplace config with crop coordinates
 * @param outputType    'thermal' or 'a4'
 * @param includeInvoice  Whether to also extract and pack invoices
 * @param onProgress    Optional callback receiving 0–100 progress
 */
export async function cropPDFLabels(
  file: File,
  config: MarketplaceCropConfig,
  outputType: OutputType,
  includeInvoice: boolean,
  onProgress?: (pct: number) => void,
): Promise<CropResult> {
  const buffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
  const numPages = pdfDoc.numPages;

  const labelImages: string[] = [];
  const invoiceImages: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    onProgress?.(Math.round(((i - 1) / numPages) * 80));

    const canvas = await renderPageToCanvas(pdfDoc, i, RENDER_SCALE);
    const pageW = canvas.width;
    const pageH = canvas.height;

    // --- Label ---
    const labelPx = denormalizeRegion(config.labelRegion, pageW, pageH);
    const labelUrl = cropCanvasToDataURL(canvas, labelPx, config.labelRegion.rotate);
    labelImages.push(labelUrl);

    // --- Invoice (if requested and region exists) ---
    if (includeInvoice && config.invoiceRegion) {
      const invoicePx = denormalizeRegion(config.invoiceRegion, pageW, pageH);
      const invoiceUrl = cropCanvasToDataURL(canvas, invoicePx, config.invoiceRegion.rotate);
      invoiceImages.push(invoiceUrl);
    }
  }

  onProgress?.(85);

  const labelsPdfBlob = await packImagesToPdf(labelImages, outputType);

  let invoicesPdfBlob: Blob | undefined;
  if (includeInvoice && invoiceImages.length > 0) {
    invoicesPdfBlob = await packImagesToPdf(invoiceImages, outputType);
  }

  onProgress?.(100);

  return { labelsPdfBlob, invoicesPdfBlob };
}

// ---------------------------------------------------------------------------
// Batch processing (multiple files → ZIP via JSZip)
// ---------------------------------------------------------------------------

export interface BatchCropResult {
  filename: string;
  labelBlob: Blob;
  invoiceBlob?: Blob;
}

/**
 * Process multiple PDF files and return an array of results.
 * The caller is responsible for building the ZIP (keeps engine dependency-light).
 */
export async function cropPDFLabelsBatch(
  files: File[],
  config: MarketplaceCropConfig,
  outputType: OutputType,
  includeInvoice: boolean,
  onProgress?: (pct: number) => void,
): Promise<BatchCropResult[]> {
  const results: BatchCropResult[] = [];

  for (let idx = 0; idx < files.length; idx++) {
    const file = files[idx];
    onProgress?.(Math.round((idx / files.length) * 100));

    const result = await cropPDFLabels(file, config, outputType, includeInvoice);
    const baseName = file.name.replace(/\.pdf$/i, '');

    results.push({
      filename: baseName,
      labelBlob: result.labelsPdfBlob,
      invoiceBlob: result.invoicesPdfBlob,
    });
  }

  onProgress?.(100);
  return results;
}

// ---------------------------------------------------------------------------
// Preview helper
// ---------------------------------------------------------------------------

/**
 * Render only the first page of a PDF and return a data URL for preview.
 */
export async function renderFirstPagePreview(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
  const canvas = await renderPageToCanvas(pdfDoc, 1, 1.5);
  return canvas.toDataURL('image/jpeg', 0.85);
}
