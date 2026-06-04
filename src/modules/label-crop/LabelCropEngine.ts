/**
 * LabelCropEngine.ts
 *
 * Strategy-based PDF/image label cropper.
 *
 * Four page strategies (set per marketplace in coordinates.ts):
 *
 *  single_page    — Fixed label/invoice regions on EVERY page.
 *                   → Flipkart, Shopsy, AJIO, Snapdeal, Nykaa
 *
 *  multi_page     — Multi-page PDF: page 1 = label, page 2 = invoice, 3+ = blank/skip.
 *                   → Amazon
 *
 *  full_page      — Every page IS the label (full page with margin trim).
 *                   User uploads separate label/invoice PDFs.
 *                   → Myntra
 *
 *  dynamic_split  — Label + invoice share a page but the split row varies.
 *                   Engine auto-detects the separator via pixel analysis.
 *                   → Meesho
 */

import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import {
  type MarketplaceCropConfig,
  denormalizeRegion,
} from './platforms/coordinates';
import type { OutputFormat, OutputFileType, ProcessedLabel } from './types';

// Use local bundled worker via Vite asset handling
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RENDER_SCALE = 2.5;
const THERMAL_W_PT = Math.round(100 * 2.8346); // 283 pt
const THERMAL_H_PT = Math.round(150 * 2.8346); // 425 pt
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
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
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

  // Double-draw fix for some PDF renderers (e.g. Amazon)
  const final = document.createElement('canvas');
  final.width  = canvas.width;
  final.height = canvas.height;
  final.getContext('2d')!.drawImage(canvas, 0, 0);
  return final;
}

async function imageFileToCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
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

function cropCanvasToDataURL(
  canvas: HTMLCanvasElement,
  region: { x: number; y: number; width: number; height: number },
  rotate?: number,
): string {
  const cropW = Math.round(region.width);
  const cropH = Math.round(region.height);
  const out   = document.createElement('canvas');

  if (rotate && rotate !== 0) {
    const rad = (rotate * Math.PI) / 180;
    out.width  = (rotate === 90 || rotate === 270) ? cropH : cropW;
    out.height = (rotate === 90 || rotate === 270) ? cropW : cropH;
    const ctx = out.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.translate(out.width / 2, out.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(canvas, region.x, region.y, cropW, cropH, -cropW / 2, -cropH / 2, cropW, cropH);
  } else {
    out.width  = cropW;
    out.height = cropH;
    const ctx = out.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, region.x, region.y, cropW, cropH, 0, 0, cropW, cropH);
  }

  return out.toDataURL('image/png', 1.0);
}

/** Trim `trim` fraction of each edge (removes printer border noise). */
function fullPageDataURL(
  canvas: HTMLCanvasElement,
  trim: number,
): string {
  const t = Math.round(trim * canvas.height);
  const l = Math.round(trim * canvas.width);
  return cropCanvasToDataURL(canvas, {
    x: l,
    y: t,
    width:  canvas.width  - l * 2,
    height: canvas.height - t * 2,
  });
}

/**
 * Meesho dynamic_split:
 * Scan horizontal rows in the given fraction range looking for a row where
 * the average pixel brightness is very high (white separator / barcode gap).
 * Returns the split Y in pixels.
 */
function detectSplitRow(
  canvas: HTMLCanvasElement,
  scanRange: [number, number],
): number {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const [minF, maxF] = scanRange;
  const minY = Math.round(minF * canvas.height);
  const maxY = Math.round(maxF * canvas.height);

  let bestY       = Math.round((minF + maxF) / 2 * canvas.height);
  let bestScore   = -1;

  // Sample every 3px for speed
  for (let y = minY; y <= maxY; y += 3) {
    const data = ctx.getImageData(0, y, canvas.width, 1).data;
    let whiteness = 0;
    for (let i = 0; i < data.length; i += 4) {
      // Pixel is "white" if R+G+B > 690 (close to #ffffff)
      whiteness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    const avg = whiteness / (canvas.width);
    if (avg > bestScore) {
      bestScore = avg;
      bestY     = y;
    }
  }

  return bestY;
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
// PDF pack helpers
// ---------------------------------------------------------------------------

async function packImagesToPdf(images: string[], mode: OutputFormat): Promise<Blob> {
  const pdf = await PDFDocument.create();

  if (mode === 'thermal') {
    for (const dataUrl of images) {
      const pngBytes = Uint8Array.from(atob(dataUrl.split(',')[1]), (c) => c.charCodeAt(0));
      const img  = await pdf.embedPng(pngBytes);
      const page = pdf.addPage([THERMAL_W_PT, THERMAL_H_PT]);
      page.drawImage(img, { x: 0, y: 0, width: THERMAL_W_PT, height: THERMAL_H_PT });
    }
  } else {
    const margin = 12, gap = 8;
    const cellW = (A4_W_PT - margin * 2 - gap) / 2;
    const cellH = (A4_H_PT - margin * 2 - gap) / 2;
    let page = pdf.addPage([A4_W_PT, A4_H_PT]);

    for (let i = 0; i < images.length; i++) {
      if (i > 0 && i % 4 === 0) page = pdf.addPage([A4_W_PT, A4_H_PT]);
      const pngBytes = Uint8Array.from(atob(images[i].split(',')[1]), (c) => c.charCodeAt(0));
      const img  = await pdf.embedPng(pngBytes);
      const slot = i % 4;
      const col  = slot % 2;
      const row  = Math.floor(slot / 2);
      page.drawImage(img, {
        x: margin + col * (cellW + gap),
        y: A4_H_PT - margin - cellH - row * (cellH + gap),
        width: cellW, height: cellH,
      });
    }
  }

  return new Blob([await pdf.save()], { type: 'application/pdf' });
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type { OutputFormat, OutputFileType };

export interface CropResult {
  labelsPdfBlob?:    Blob;
  labelsPngBlobs?:   Blob[];
  invoicesPdfBlob?:  Blob;
  invoicesPngBlobs?: Blob[];
}

// ---------------------------------------------------------------------------
// Core per-file crop — strategy dispatch
// ---------------------------------------------------------------------------

export async function cropFile(
  file: File,
  config: MarketplaceCropConfig,
  outputFormat: OutputFormat,
  outputFileType: OutputFileType,
  includeInvoice: boolean,
  onProgress?: (pct: number) => void,
): Promise<CropResult> {

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  // Load into canvas array
  type CanvasPage = { canvas: HTMLCanvasElement };
  const pages: CanvasPage[] = [];

  if (isPdf) {
    const buffer = await file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      onProgress?.(Math.round(((i - 1) / pdfDoc.numPages) * 70));
      pages.push({ canvas: await renderPageToCanvas(pdfDoc, i, RENDER_SCALE) });
    }
  } else {
    onProgress?.(20);
    pages.push({ canvas: await imageFileToCanvas(file) });
  }

  onProgress?.(75);

  const labelImages:   string[] = [];
  const invoiceImages: string[] = [];
  const trim = config.marginTrim ?? 0.01;

  // ── strategy: multi_page (Amazon) ──────────────────────────────────────
  if (config.pageStrategy === 'multi_page') {
    // Page 0 (index) = label, Page 1 = invoice, rest = blank → skip
    if (pages[0]) {
      labelImages.push(fullPageDataURL(pages[0].canvas, trim));
    }
    if (includeInvoice && pages[1]) {
      invoiceImages.push(fullPageDataURL(pages[1].canvas, trim));
    }
    // pages[2]+ are blank — skip
  }

  // ── strategy: full_page (Myntra) ───────────────────────────────────────
  else if (config.pageStrategy === 'full_page') {
    // Every page is a complete label — invoices come from a separate PDF
    for (const p of pages) {
      labelImages.push(fullPageDataURL(p.canvas, trim));
    }
    // invoiceImages stays empty — Myntra user uploads invoice PDF separately
  }

  // ── strategy: dynamic_split (Meesho) ───────────────────────────────────
  else if (config.pageStrategy === 'dynamic_split') {
    const scanRange = config.splitScanRange ?? [0.20, 0.65];
    for (const p of pages) {
      const { canvas } = p;
      const splitY = detectSplitRow(canvas, scanRange);

      // Label = top portion (y=0 to splitY)
      labelImages.push(cropCanvasToDataURL(canvas, {
        x: Math.round(trim * canvas.width),
        y: Math.round(trim * canvas.height),
        width:  canvas.width  - Math.round(trim * canvas.width * 2),
        height: splitY        - Math.round(trim * canvas.height),
      }));

      // Invoice = bottom portion (splitY to bottom)
      if (includeInvoice) {
        invoiceImages.push(cropCanvasToDataURL(canvas, {
          x: Math.round(trim * canvas.width),
          y: splitY,
          width:  canvas.width  - Math.round(trim * canvas.width * 2),
          height: canvas.height - splitY - Math.round(trim * canvas.height),
        }));
      }
    }
  }

  // ── strategy: single_page (Flipkart, Shopsy, AJIO, Snapdeal, Nykaa) ───
  else {
    for (const p of pages) {
      const { canvas } = p;
      const pw = canvas.width, ph = canvas.height;

      if (config.labelRegion) {
        const px = denormalizeRegion(config.labelRegion, pw, ph);
        labelImages.push(cropCanvasToDataURL(canvas, px, config.labelRegion.rotate));
      }

      if (includeInvoice && config.invoiceRegion) {
        const px = denormalizeRegion(config.invoiceRegion, pw, ph);
        invoiceImages.push(cropCanvasToDataURL(canvas, px, config.invoiceRegion.rotate));
      }
    }
  }

  onProgress?.(88);

  const result: CropResult = {};

  if (outputFileType === 'pdf') {
    if (labelImages.length)   result.labelsPdfBlob   = await packImagesToPdf(labelImages,   outputFormat);
    if (invoiceImages.length) result.invoicesPdfBlob = await packImagesToPdf(invoiceImages, outputFormat);
  } else {
    if (labelImages.length)   result.labelsPngBlobs   = labelImages.map(dataUrlToBlob);
    if (invoiceImages.length) result.invoicesPngBlobs = invoiceImages.map(dataUrlToBlob);
  }

  onProgress?.(100);
  return result;
}

// ---------------------------------------------------------------------------
// Batch → ZIP
// ---------------------------------------------------------------------------

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
    const file   = files[idx];
    const result = await cropFile(file, config, outputFormat, outputFileType, includeInvoice);
    const base   = file.name.replace(/\.(pdf|png|jpe?g)$/i, '');

    if (result.labelsPdfBlob)    zip.file(`labels/${base}-labels.${ext}`,   result.labelsPdfBlob);
    if (result.invoicesPdfBlob)  zip.file(`invoices/${base}-invoices.${ext}`, result.invoicesPdfBlob);
    result.labelsPngBlobs?.forEach((b, i)   => zip.file(`labels/${base}-label-${i + 1}.${ext}`, b));
    result.invoicesPngBlobs?.forEach((b, i) => zip.file(`invoices/${base}-invoice-${i + 1}.${ext}`, b));
  }

  onProgress?.(95);
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  onProgress?.(100);
  return blob;
}

// ---------------------------------------------------------------------------
// Batch → individual ProcessedLabel array
// ---------------------------------------------------------------------------

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
    const file   = files[idx];
    const result = await cropFile(file, config, outputFormat, outputFileType, includeInvoice);
    results.push({
      filename:    file.name.replace(/\.(pdf|png|jpe?g)$/i, ''),
      labelBlob:   result.labelsPdfBlob ?? result.labelsPngBlobs?.[0]   ?? new Blob(),
      invoiceBlob: result.invoicesPdfBlob ?? result.invoicesPngBlobs?.[0],
    });
  }

  onProgress?.(100);
  return results;
}

// ---------------------------------------------------------------------------
// Preview helper — renders first page to JPEG data URL
// ---------------------------------------------------------------------------

export async function renderFirstPagePreview(file: File): Promise<string> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    const buffer = await file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
    const canvas = await renderPageToCanvas(pdfDoc, 1, 1.5);
    return canvas.toDataURL('image/jpeg', 0.85);
  }

  const canvas = await imageFileToCanvas(file);
  const out    = document.createElement('canvas');
  const MAX    = 800;
  const scale  = Math.min(1, MAX / Math.max(canvas.width, canvas.height));
  out.width    = Math.round(canvas.width  * scale);
  out.height   = Math.round(canvas.height * scale);
  out.getContext('2d')!.drawImage(canvas, 0, 0, out.width, out.height);
  return out.toDataURL('image/jpeg', 0.85);
}

// ---------------------------------------------------------------------------
// Legacy compat exports (used by old LabelCropPage.tsx)
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
  const result = await cropFile(file, config, outputType, 'pdf', includeInvoice, onProgress);
  return { labelsPdfBlob: result.labelsPdfBlob!, invoicesPdfBlob: result.invoicesPdfBlob };
}

export async function cropPDFLabelsBatch(
  files: File[],
  config: MarketplaceCropConfig,
  outputType: OutputType,
  includeInvoice: boolean,
  onProgress?: (pct: number) => void,
): Promise<BatchCropResult[]> {
  return cropFilesBatch(files, config, outputType, 'pdf', includeInvoice, onProgress);
}
