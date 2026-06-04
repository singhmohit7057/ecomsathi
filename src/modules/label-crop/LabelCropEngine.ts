/**
 * LabelCropEngine.ts
 *
 * Strategy-based PDF/image label cropper.
 * Returns crop preview thumbnails alongside blobs so the UI can show
 * a visual confirmation before the user clicks download.
 *
 * Four page strategies:
 *   single_page    → Fixed label + invoice regions on every page (Flipkart, Shopsy, AJIO, Snapdeal, Nykaa)
 *   multi_page     → Page 1 = label, page 2 = invoice, 3+ = blank/skip (Amazon)
 *   full_page      → Every page IS the label — user uploads separate files (Myntra)
 *   dynamic_split  → Auto-detect separator row, label height varies (Meesho)
 */

import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import {
  type MarketplaceCropConfig,
  denormalizeRegion,
} from './platforms/coordinates';
import type { OutputFormat, OutputFileType, ProcessedLabel, CropPreview, BatchMergeResult } from './types';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RENDER_SCALE   = 2.5;
const PREVIEW_SCALE  = 0.8;   // lower scale for fast preview thumbnails
const THERMAL_W_PT   = Math.round(100 * 2.8346); // 283 pt
const THERMAL_H_PT   = Math.round(150 * 2.8346); // 425 pt
const A4_W_PT = 595;
const A4_H_PT = 842;

// ---------------------------------------------------------------------------
// Canvas helpers
// ---------------------------------------------------------------------------

async function renderPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number,
): Promise<HTMLCanvasElement> {
  const page     = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas  = document.createElement('canvas');
  canvas.width  = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true })!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: ctx as CanvasRenderingContext2D,
    viewport,
    canvas,
  } as Parameters<typeof page.render>[0]).promise;

  // Double-draw fix (some PDF renderers like Amazon)
  const final   = document.createElement('canvas');
  final.width   = canvas.width;
  final.height  = canvas.height;
  final.getContext('2d')!.drawImage(canvas, 0, 0);
  return final;
}

async function imageFileToCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas  = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true })!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

function cropCanvas(
  canvas: HTMLCanvasElement,
  region: { x: number; y: number; width: number; height: number },
  rotate?: number,
): HTMLCanvasElement {
  const cropW = Math.round(region.width);
  const cropH = Math.round(region.height);
  const out   = document.createElement('canvas');

  if (rotate && rotate !== 0) {
    const rad  = (rotate * Math.PI) / 180;
    out.width  = (rotate === 90 || rotate === 270) ? cropH : cropW;
    out.height = (rotate === 90 || rotate === 270) ? cropW : cropH;
    const ctx  = out.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.translate(out.width / 2, out.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(canvas, region.x, region.y, cropW, cropH, -cropW / 2, -cropH / 2, cropW, cropH);
  } else {
    out.width  = cropW;
    out.height = cropH;
    const ctx  = out.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, region.x, region.y, cropW, cropH, 0, 0, cropW, cropH);
  }
  return out;
}

// px per mm at render scale: 1pt = 1/72 inch = 25.4/72 mm → 1mm = 72/25.4 pt = 2.8346pt
// at RENDER_SCALE px/pt = RENDER_SCALE, so 1mm = 2.8346 * RENDER_SCALE px
const PX_PER_MM = (72 / 25.4) * RENDER_SCALE; // ≈ 7.087 px/mm

function canvasSizeMm(canvas: HTMLCanvasElement) {
  return {
    widthMm:  Math.round(canvas.width  / PX_PER_MM),
    heightMm: Math.round(canvas.height / PX_PER_MM),
  };
}

function canvasToDataUrl(canvas: HTMLCanvasElement, quality = 1.0): string {
  return canvas.toDataURL('image/png', quality);
}

/** Rotate a canvas 90° clockwise — used to make Meesho landscape strips portrait */
function rotateCanvas90(src: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width  = src.height;
  out.height = src.width;
  const ctx  = out.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.translate(out.width / 2, out.height / 2);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(src, -src.width / 2, -src.height / 2);
  return out;
}

/** Generate a JPEG thumbnail. Pass rotate=90 to rotate the canvas 90° clockwise first. */
function canvasToPreviewUrl(canvas: HTMLCanvasElement, rotateDeg = 0): string {
  const MAX = 600;

  let src = canvas;

  if (rotateDeg !== 0) {
    const rad     = (rotateDeg * Math.PI) / 180;
    const swap    = rotateDeg === 90 || rotateDeg === 270;
    const rotated = document.createElement('canvas');
    rotated.width  = swap ? canvas.height : canvas.width;
    rotated.height = swap ? canvas.width  : canvas.height;
    const ctx = rotated.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rotated.width, rotated.height);
    ctx.translate(rotated.width / 2, rotated.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    src = rotated;
  }

  const scale = Math.min(1, MAX / Math.max(src.width, src.height));
  const out   = document.createElement('canvas');
  out.width   = Math.round(src.width  * scale);
  out.height  = Math.round(src.height * scale);
  out.getContext('2d')!.drawImage(src, 0, 0, out.width, out.height);
  return out.toDataURL('image/jpeg', 0.82);
}

function fullPageCanvas(canvas: HTMLCanvasElement, trim: number): HTMLCanvasElement {
  const t = Math.round(trim * canvas.height);
  const l = Math.round(trim * canvas.width);
  return cropCanvas(canvas, {
    x: l, y: t,
    width:  canvas.width  - l * 2,
    height: canvas.height - t * 2,
  });
}

/**
 * Find "Fold Here" text in a PDF page using text extraction.
 * Returns the Y position as a fraction of the page height (0=top, 1=bottom).
 * Falls back to the midpoint of scanRange if text is not found.
 *
 * PDF.js text items use bottom-up coordinates, so we convert:
 *   fractionFromTop = 1 - (textY / pageHeight)
 */
async function findFoldHereFraction(
  page: pdfjsLib.PDFPageProxy,
  fallback: number,
): Promise<number> {
  try {
    const content  = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });

    for (const item of content.items) {
      const textItem = item as { str: string; transform: number[] };
      if (textItem.str && textItem.str.toLowerCase().includes('fold here')) {
        // transform[5] = Y from bottom of page in PDF units
        const yFromBottom = textItem.transform[5];
        const fraction    = 1 - (yFromBottom / viewport.height);
        return Math.max(0.2, Math.min(0.8, fraction));
      }
    }
  } catch {
    // ignore — use fallback
  }
  return fallback;
}

/**
 * Find the last row (from bottom) that has non-white content.
 * Used to trim blank whitespace at the bottom of Meesho invoice crops.
 * Scans upward from `fromFraction` of page height until it finds a row
 * with avg brightness < 245 (has actual content, not blank white).
 */
function detectContentBottom(canvas: HTMLCanvasElement, fromFraction = 0.98): number {
  const ctx   = canvas.getContext('2d', { willReadFrequently: true })!;
  const start = Math.round(fromFraction * canvas.height);

  for (let y = start; y > canvas.height * 0.5; y -= 2) {
    const data = ctx.getImageData(0, y, canvas.width, 1).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    const avg = sum / canvas.width;
    // Row has content (not blank white)
    if (avg < 245) return y + 4;
  }
  return start;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mime   = header.match(/:(.*?);/)?.[1] ?? 'image/png';
  const binary = atob(data);
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// ---------------------------------------------------------------------------
// PDF packing
// ---------------------------------------------------------------------------

async function packImagesToPdf(images: string[], mode: OutputFormat): Promise<Blob> {
  const pdf = await PDFDocument.create();

  if (mode === 'thermal') {
    for (const url of images) {
      const bytes = Uint8Array.from(atob(url.split(',')[1]), c => c.charCodeAt(0));
      const img   = await pdf.embedPng(bytes);
      const page  = pdf.addPage([THERMAL_W_PT, THERMAL_H_PT]);
      page.drawImage(img, { x: 0, y: 0, width: THERMAL_W_PT, height: THERMAL_H_PT });
    }
  } else {
    const margin = 12, gap = 8;
    const cellW  = (A4_W_PT - margin * 2 - gap) / 2;
    const cellH  = (A4_H_PT - margin * 2 - gap) / 2;
    let page     = pdf.addPage([A4_W_PT, A4_H_PT]);

    for (let i = 0; i < images.length; i++) {
      if (i > 0 && i % 4 === 0) page = pdf.addPage([A4_W_PT, A4_H_PT]);
      const bytes = Uint8Array.from(atob(images[i].split(',')[1]), c => c.charCodeAt(0));
      const img   = await pdf.embedPng(bytes);
      const slot  = i % 4;
      page.drawImage(img, {
        x: margin + (slot % 2) * (cellW + gap),
        y: A4_H_PT - margin - cellH - Math.floor(slot / 2) * (cellH + gap),
        width: cellW, height: cellH,
      });
    }
  }
  return new Blob([await pdf.save()], { type: 'application/pdf' });
}

// ---------------------------------------------------------------------------
// Internal: process one PDF/image file → canvas crops
// ---------------------------------------------------------------------------

interface PageCrops {
  labelCanvas:   HTMLCanvasElement;
  invoiceCanvas: HTMLCanvasElement | null;
}

async function extractPageCrops(
  file: File,
  config: MarketplaceCropConfig,
  includeInvoice: boolean,
  onProgress?: (pct: number) => void,
): Promise<PageCrops[]> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const crops: PageCrops[] = [];
  const trim  = config.marginTrim ?? 0.01;

  if (isPdf) {
    const buffer = await file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
    const total  = pdfDoc.numPages;

    // ── multi_page (Amazon) ──────────────────────────────────────────────
    // Amazon merged PDFs have 2–3 pages per order:
    //   • Label page   — shipping label
    //   • Invoice page — "Tax Invoice / Bill of Supply / Cash Memo"
    //   • Blank page   — sometimes appended (avg brightness > 252) → skip
    //
    // Strategy:
    //   1. Render each page at low scale
    //   2. If avg brightness > 252 → blank, skip
    //   3. Classify by text: contains "Tax Invoice" or "Bill of Supply" → invoice
    //   4. Pair: label + its matching invoice (next non-blank page after label)
    if (config.pageStrategy === 'multi_page') {
      // Step 1: classify all non-blank pages
      type PageType = 'label' | 'invoice';
      const classified: { pageNum: number; type: PageType; canvas: HTMLCanvasElement }[] = [];

      for (let i = 1; i <= total; i++) {
        onProgress?.(Math.round(((i - 1) / total) * 60));
        const c    = await renderPageToCanvas(pdfDoc, i, RENDER_SCALE);

        // Blank check — sample center strip brightness
        const ctx  = c.getContext('2d', { willReadFrequently: true })!;
        const data = ctx.getImageData(0, Math.floor(c.height * 0.3), c.width, Math.floor(c.height * 0.4)).data;
        let sum = 0;
        for (let p = 0; p < data.length; p += 4) sum += (data[p] + data[p+1] + data[p+2]) / 3;
        const avg = sum / (data.length / 4);
        if (avg > 252) continue; // blank page — skip

        // Classify by text content
        const page     = await pdfDoc.getPage(i);
        const content  = await page.getTextContent();
        const allText  = content.items
          .map((it: { str?: string }) => it.str ?? '')
          .join(' ')
          .toLowerCase();
        const isInvoice = allText.includes('tax invoice') || allText.includes('bill of supply') || allText.includes('cash memo');

        classified.push({ pageNum: i, type: isInvoice ? 'invoice' : 'label', canvas: c });
      }

      // Step 2: pair labels with their invoices
      // Labels and invoices appear in order: label1, invoice1, label2, invoice2, ...
      const labels   = classified.filter(p => p.type === 'label');
      const invoices = classified.filter(p => p.type === 'invoice');

      const maxOrders = labels.length;
      for (let idx = 0; idx < maxOrders; idx++) {
        onProgress?.(60 + Math.round((idx / maxOrders) * 20));
        const labelC   = fullPageCanvas(labels[idx].canvas, trim);
        const invoiceC = (includeInvoice && invoices[idx])
          ? fullPageCanvas(invoices[idx].canvas, trim)
          : null;
        crops.push({ labelCanvas: labelC, invoiceCanvas: invoiceC });
      }
    }

    // ── full_page (Myntra) ───────────────────────────────────────────────
    else if (config.pageStrategy === 'full_page') {
      for (let i = 1; i <= total; i++) {
        onProgress?.(Math.round(((i - 1) / total) * 80));
        const c = await renderPageToCanvas(pdfDoc, i, RENDER_SCALE);
        crops.push({ labelCanvas: fullPageCanvas(c, trim), invoiceCanvas: null });
      }
    }

    // ── dynamic_split (Meesho) ────────────────────────────────────────────
    // Use PDF text extraction to find the exact "Fold Here" Y position.
    else if (config.pageStrategy === 'dynamic_split') {
      const fallback = ((config.splitScanRange?.[0] ?? 0.45) + (config.splitScanRange?.[1] ?? 0.62)) / 2;
      for (let i = 1; i <= total; i++) {
        onProgress?.(Math.round(((i - 1) / total) * 80));

        // 1. Find "Fold Here" fraction via text extraction (fast, exact)
        const page         = await pdfDoc.getPage(i);
        const foldFraction = await findFoldHereFraction(page, fallback);

        // 2. Render page to canvas
        const c    = await renderPageToCanvas(pdfDoc, i, RENDER_SCALE);
        const splitY = Math.round(foldFraction * c.height);
        const t    = Math.round(trim * c.height);
        const l    = Math.round(trim * c.width);
        const w    = c.width - l * 2;

        // 3. Crop label → rotate 90° to portrait
        const labelRaw = cropCanvas(c, { x: l, y: t, width: w, height: splitY - t });
        const labelC   = rotateCanvas90(labelRaw);

        // 4. Crop invoice → rotate 90° to portrait, trim blank bottom
        let invoiceC: HTMLCanvasElement | null = null;
        if (includeInvoice) {
          const contentBottom = detectContentBottom(c);
          const invoiceRaw = cropCanvas(c, { x: l, y: splitY, width: w, height: contentBottom - splitY });
          invoiceC = rotateCanvas90(invoiceRaw);
        }

        crops.push({ labelCanvas: labelC, invoiceCanvas: invoiceC });
      }
    }

    // ── single_page (Flipkart, Shopsy, AJIO, Snapdeal, Nykaa) ───────────
    else {
      for (let i = 1; i <= total; i++) {
        onProgress?.(Math.round(((i - 1) / total) * 80));
        const c = await renderPageToCanvas(pdfDoc, i, RENDER_SCALE);
        const pw = c.width, ph = c.height;

        const labelC = config.labelRegion
          ? cropCanvas(c, denormalizeRegion(config.labelRegion, pw, ph), config.labelRegion.rotate)
          : fullPageCanvas(c, trim);

        const invoiceC = (includeInvoice && config.invoiceRegion)
          ? cropCanvas(c, denormalizeRegion(config.invoiceRegion, pw, ph), config.invoiceRegion.rotate)
          : null;

        crops.push({ labelCanvas: labelC, invoiceCanvas: invoiceC });
      }
    }
  } else {
    // Image file — single page
    onProgress?.(30);
    const c  = await imageFileToCanvas(file);
    const pw = c.width, ph = c.height;
    const labelC = config.labelRegion
      ? cropCanvas(c, denormalizeRegion(config.labelRegion, pw, ph), config.labelRegion.rotate)
      : fullPageCanvas(c, config.marginTrim ?? 0.01);
    const invoiceC = (includeInvoice && config.invoiceRegion)
      ? cropCanvas(c, denormalizeRegion(config.invoiceRegion, pw, ph), config.invoiceRegion.rotate)
      : null;
    crops.push({ labelCanvas: labelC, invoiceCanvas: invoiceC });
  }

  return crops;
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type { OutputFormat, OutputFileType };

export interface CropResult {
  labelBlob:    Blob;           // always present
  invoiceBlob?: Blob;           // present when includeInvoice && hasInvoice
  preview:      CropPreview;    // thumbnail JPEGs for UI display
}

// ---------------------------------------------------------------------------
// Single-file crop  (primary API)
// ---------------------------------------------------------------------------

export async function cropFile(
  file: File,
  config: MarketplaceCropConfig,
  outputFormat: OutputFormat,
  outputFileType: OutputFileType,
  includeInvoice: boolean,
  onProgress?: (pct: number) => void,
): Promise<CropResult> {
  const crops = await extractPageCrops(file, config, includeInvoice, onProgress);
  onProgress?.(85);

  const labelImages   = crops.map(c => canvasToDataUrl(c.labelCanvas));
  const invoiceImages = crops.map(c => c.invoiceCanvas ? canvasToDataUrl(c.invoiceCanvas) : null).filter(Boolean) as string[];

  // Preview thumbnails from first page
  // cropCanvas() already applies rotation internally — canvas is in final orientation
  const lc = crops[0].labelCanvas;
  const ic = crops[0].invoiceCanvas;

  const preview: CropPreview = {
    labelUrl:    canvasToPreviewUrl(lc),
    invoiceUrl:  ic ? canvasToPreviewUrl(ic) : undefined,
    labelSize:   canvasSizeMm(lc),
    invoiceSize: ic ? canvasSizeMm(ic) : undefined,
  };

  let labelBlob: Blob;
  let invoiceBlob: Blob | undefined;

  if (outputFileType === 'pdf') {
    labelBlob   = await packImagesToPdf(labelImages, outputFormat);
    if (invoiceImages.length) invoiceBlob = await packImagesToPdf(invoiceImages, outputFormat);
  } else {
    labelBlob   = dataUrlToBlob(labelImages[0]);
    if (invoiceImages.length) invoiceBlob = dataUrlToBlob(invoiceImages[0]);
  }

  onProgress?.(100);
  return { labelBlob, invoiceBlob, preview };
}

// ---------------------------------------------------------------------------
// Batch crop → merge ALL labels into one PDF, ALL invoices into one PDF
// No ZIP — direct download of merged files
// ---------------------------------------------------------------------------

export async function cropFilesBatchMerge(
  files: File[],
  config: MarketplaceCropConfig,
  outputFormat: OutputFormat,
  includeInvoice: boolean,
  onProgress?: (pct: number) => void,
): Promise<BatchMergeResult> {
  const allLabelImages:   string[] = [];
  const allInvoiceImages: string[] = [];
  let firstLabelCanvas:   HTMLCanvasElement | null = null;
  let firstInvoiceCanvas: HTMLCanvasElement | null = null;

  for (let idx = 0; idx < files.length; idx++) {
    onProgress?.(Math.round((idx / files.length) * 85));
    const crops = await extractPageCrops(files[idx], config, includeInvoice);

    for (const c of crops) {
      allLabelImages.push(canvasToDataUrl(c.labelCanvas));
      if (c.invoiceCanvas) allInvoiceImages.push(canvasToDataUrl(c.invoiceCanvas));
      if (!firstLabelCanvas)   firstLabelCanvas   = c.labelCanvas;
      if (!firstInvoiceCanvas && c.invoiceCanvas) firstInvoiceCanvas = c.invoiceCanvas;
    }
  }

  onProgress?.(90);

  const labelsPdf   = await packImagesToPdf(allLabelImages,   outputFormat);
  const invoicesPdf = allInvoiceImages.length
    ? await packImagesToPdf(allInvoiceImages, outputFormat)
    : undefined;

  // cropCanvas() already applies rotation — canvas is in final orientation
  const preview: CropPreview = {
    labelUrl:    firstLabelCanvas   ? canvasToPreviewUrl(firstLabelCanvas) : '',
    invoiceUrl:  firstInvoiceCanvas ? canvasToPreviewUrl(firstInvoiceCanvas) : undefined,
    labelSize:   firstLabelCanvas   ? canvasSizeMm(firstLabelCanvas) : undefined,
    invoiceSize: firstInvoiceCanvas ? canvasSizeMm(firstInvoiceCanvas) : undefined,
  };

  onProgress?.(100);

  return {
    labelsPdf,
    invoicesPdf,
    preview,
    fileCount:  files.length,
    labelCount: allLabelImages.length,
  };
}

// ---------------------------------------------------------------------------
// PDF Viewer — render all pages as JPEG data URLs for the page viewer UI
// ---------------------------------------------------------------------------

export interface ViewerPage {
  dataUrl:       string;
  width:         number;
  height:        number;
  /** For dynamic_split (Meesho): exact "Fold Here" fraction from PDF text */
  foldFraction?: number;
  /** For multi_page (Amazon): 'label' | 'invoice' — blank pages excluded */
  pageType?:     'label' | 'invoice';
}

const VIEWER_SCALE = 1.2;

export async function loadPdfForViewer(
  file: File,
  config?: MarketplaceCropConfig,
): Promise<ViewerPage[]> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const pages: ViewerPage[] = [];
  const isDynamicSplit = config?.pageStrategy === 'dynamic_split';
  const fallback = isDynamicSplit
    ? ((config!.splitScanRange?.[0] ?? 0.45) + (config!.splitScanRange?.[1] ?? 0.62)) / 2
    : 0.53;

  if (isPdf) {
    const buffer = await file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
    const isMultiPage = config?.pageStrategy === 'multi_page';

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const canvas = await renderPageToCanvas(pdfDoc, i, VIEWER_SCALE);

      // Blank page detection — skip for viewer too
      if (isMultiPage) {
        const ctx  = canvas.getContext('2d', { willReadFrequently: true })!;
        const data = ctx.getImageData(0, Math.floor(canvas.height * 0.3), canvas.width, Math.floor(canvas.height * 0.4)).data;
        let sum = 0;
        for (let p = 0; p < data.length; p += 4) sum += (data[p] + data[p+1] + data[p+2]) / 3;
        if (sum / (data.length / 4) > 252) continue; // blank — skip
      }

      let foldFraction: number | undefined;
      let pageType: ViewerPage['pageType'];

      if (isDynamicSplit) {
        const page   = await pdfDoc.getPage(i);
        foldFraction = await findFoldHereFraction(page, fallback);
      }

      if (isMultiPage) {
        const page    = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        const text    = content.items.map((it: { str?: string }) => it.str ?? '').join(' ').toLowerCase();
        pageType = (text.includes('tax invoice') || text.includes('bill of supply') || text.includes('cash memo'))
          ? 'invoice' : 'label';
      }

      pages.push({
        dataUrl:  canvas.toDataURL('image/jpeg', 0.88),
        width:    canvas.width,
        height:   canvas.height,
        foldFraction,
        pageType,
      });
    }
  } else {
    const canvas = await imageFileToCanvas(file);
    const MAX    = 1000;
    const scale  = Math.min(1, MAX / Math.max(canvas.width, canvas.height));
    const out    = document.createElement('canvas');
    out.width    = Math.round(canvas.width  * scale);
    out.height   = Math.round(canvas.height * scale);
    out.getContext('2d')!.drawImage(canvas, 0, 0, out.width, out.height);
    pages.push({ dataUrl: out.toDataURL('image/jpeg', 0.88), width: out.width, height: out.height });
  }

  return pages;
}

// ---------------------------------------------------------------------------
// Preview helper (legacy)
// ---------------------------------------------------------------------------

export async function renderFirstPagePreview(file: File): Promise<string> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    const buffer = await file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
    const canvas = await renderPageToCanvas(pdfDoc, 1, PREVIEW_SCALE);
    return canvas.toDataURL('image/jpeg', 0.82);
  }

  const canvas = await imageFileToCanvas(file);
  const out    = document.createElement('canvas');
  const scale  = Math.min(1, 800 / Math.max(canvas.width, canvas.height));
  out.width    = Math.round(canvas.width  * scale);
  out.height   = Math.round(canvas.height * scale);
  out.getContext('2d')!.drawImage(canvas, 0, 0, out.width, out.height);
  return out.toDataURL('image/jpeg', 0.82);
}

// ---------------------------------------------------------------------------
// Legacy compat (old LabelCropPage.tsx)
// ---------------------------------------------------------------------------

export type OutputType = OutputFormat;
export interface BatchCropResult { filename: string; labelBlob: Blob; invoiceBlob?: Blob }

export async function cropPDFLabels(
  file: File,
  config: MarketplaceCropConfig,
  outputType: OutputType,
  includeInvoice: boolean,
  onProgress?: (pct: number) => void,
) {
  const r = await cropFile(file, config, outputType, 'pdf', includeInvoice, onProgress);
  return { labelsPdfBlob: r.labelBlob, invoicesPdfBlob: r.invoiceBlob };
}

// keep old zip-based batch for backward compat (LabelCropPage.tsx)
import JSZip from 'jszip';

export async function cropFilesAsZip(
  files: File[],
  config: MarketplaceCropConfig,
  outputFormat: OutputFormat,
  outputFileType: OutputFileType,
  includeInvoice: boolean,
  onProgress?: (pct: number) => void,
): Promise<Blob> {
  const zip = new JSZip();
  const ext = outputFileType;

  for (let idx = 0; idx < files.length; idx++) {
    onProgress?.(Math.round((idx / files.length) * 90));
    const r    = await cropFile(files[idx], config, outputFormat, outputFileType, includeInvoice);
    const base = files[idx].name.replace(/\.(pdf|png|jpe?g)$/i, '');
    zip.file(`labels/${base}-labels.${ext}`,     r.labelBlob);
    if (r.invoiceBlob) zip.file(`invoices/${base}-invoices.${ext}`, r.invoiceBlob);
  }

  onProgress?.(95);
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  onProgress?.(100);
  return blob;
}

export async function cropPDFLabelsBatch(
  files: File[],
  config: MarketplaceCropConfig,
  outputType: OutputType,
  includeInvoice: boolean,
  onProgress?: (pct: number) => void,
): Promise<BatchCropResult[]> {
  const results: BatchCropResult[] = [];
  for (let idx = 0; idx < files.length; idx++) {
    onProgress?.(Math.round((idx / files.length) * 100));
    const r = await cropFile(files[idx], config, outputType, 'pdf', includeInvoice);
    results.push({ filename: files[idx].name.replace(/\.(pdf|png|jpe?g)$/i, ''), labelBlob: r.labelBlob, invoiceBlob: r.invoiceBlob });
  }
  onProgress?.(100);
  return results;
}

export async function cropFilesBatch(
  files: File[],
  config: MarketplaceCropConfig,
  outputFormat: OutputFormat,
  outputFileType: OutputFileType,
  includeInvoice: boolean,
  onProgress?: (pct: number) => void,
): Promise<ProcessedLabel[]> {
  const results: ProcessedLabel[] = [];
  for (let idx = 0; idx < files.length; idx++) {
    onProgress?.(Math.round((idx / files.length) * 100));
    const r = await cropFile(files[idx], config, outputFormat, outputFileType, includeInvoice);
    results.push({ filename: files[idx].name.replace(/\.(pdf|png|jpe?g)$/i, ''), labelBlob: r.labelBlob, invoiceBlob: r.invoiceBlob });
  }
  onProgress?.(100);
  return results;
}
