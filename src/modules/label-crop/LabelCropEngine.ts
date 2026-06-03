/**
 * LabelCropEngine.ts
 *
 * Client-side PDF/image label cropping using pdfjs-dist (render) + pdf-lib (pack).
 * Renders each PDF page to canvas at high DPI, crops to the configured region,
 * then packs the cropped images into a new PDF — thermal or A4 layout.
 * Also accepts image files (PNG/JPG/JPEG) directly.
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
// Internal helpers
// ---------------------------------------------------------------------------

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

  // Double-draw for Amazon rendering fix
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = canvas.width;
  finalCanvas.height = canvas.height;
  finalCanvas.getContext('2d')!.drawImage(canvas, 0, 0);

  return finalCanvas;
}

async function imageFileToCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
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

  const out = document.createElement('canvas');

  if (rotate && rotate !== 0) {
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

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// ---------------------------------------------------------------------------
// Pack helpers
// ---------------------------------------------------------------------------

async function packImagesToPdf(
  images: string[],
  mode: OutputFormat,
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
    const margin = 12;
    const gap = 8;
    const usableW = A4_W_PT - margin * 2;
    const usableH = A4_H_PT - margin * 2;
    const cellW = (usableW - gap) / 2;
    const cellH = (usableH - gap) / 2;

    let page = pdf.addPage([A4_W_PT, A4_H_PT]);

    for (let i = 0; i < images.length; i++) {
      if (i > 0 && i % 4 === 0) page = pdf.addPage([A4_W_PT, A4_H_PT]);

      const pngData = images[i].split(',')[1];
      const pngBytes = Uint8Array.from(atob(pngData), (c) => c.charCodeAt(0));
      const embeddedImage = await pdf.embedPng(pngBytes);

      const slot = i % 4;
      const col = slot % 2;
      const row = Math.floor(slot / 2);
      const x = margin + col * (cellW + gap);
      const y = A4_H_PT - margin - cellH - row * (cellH + gap);

      page.drawImage(embeddedImage, { x, y, width: cellW, height: cellH });
    }
  }

  const bytes = await pdf.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type { OutputFormat, OutputFileType };

export interface CropResult {
  labelsPdfBlob?: Blob;
  labelsPngBlobs?: Blob[];
  invoicesPdfBlob?: Blob;
  invoicesPngBlobs?: Blob[];
}

// ---------------------------------------------------------------------------
// Core per-file crop (PDF or image)
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

  const labelImages: string[] = [];
  const invoiceImages: string[] = [];

  if (isPdf) {
    const buffer = await file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
    const numPages = pdfDoc.numPages;

    for (let i = 1; i <= numPages; i++) {
      onProgress?.(Math.round(((i - 1) / numPages) * 80));
      const canvas = await renderPageToCanvas(pdfDoc, i, RENDER_SCALE);
      const { width: pw, height: ph } = canvas;

      const labelPx = denormalizeRegion(config.labelRegion, pw, ph);
      labelImages.push(cropCanvasToDataURL(canvas, labelPx, config.labelRegion.rotate));

      if (includeInvoice && config.invoiceRegion) {
        const invoicePx = denormalizeRegion(config.invoiceRegion, pw, ph);
        invoiceImages.push(cropCanvasToDataURL(canvas, invoicePx, config.invoiceRegion.rotate));
      }
    }
  } else {
    // Image file — treat as a single page
    onProgress?.(20);
    const canvas = await imageFileToCanvas(file);
    const { width: pw, height: ph } = canvas;

    const labelPx = denormalizeRegion(config.labelRegion, pw, ph);
    labelImages.push(cropCanvasToDataURL(canvas, labelPx, config.labelRegion.rotate));

    if (includeInvoice && config.invoiceRegion) {
      const invoicePx = denormalizeRegion(config.invoiceRegion, pw, ph);
      invoiceImages.push(cropCanvasToDataURL(canvas, invoicePx, config.invoiceRegion.rotate));
    }
  }

  onProgress?.(85);

  const result: CropResult = {};

  if (outputFileType === 'pdf') {
    result.labelsPdfBlob = await packImagesToPdf(labelImages, outputFormat);
    if (includeInvoice && invoiceImages.length > 0) {
      result.invoicesPdfBlob = await packImagesToPdf(invoiceImages, outputFormat);
    }
  } else {
    result.labelsPngBlobs = labelImages.map(dataUrlToBlob);
    if (includeInvoice && invoiceImages.length > 0) {
      result.invoicesPngBlobs = invoiceImages.map(dataUrlToBlob);
    }
  }

  onProgress?.(100);
  return result;
}

// ---------------------------------------------------------------------------
// Batch processing → ZIP
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
  const ext = outputFileType === 'pdf' ? 'pdf' : 'png';

  for (let idx = 0; idx < files.length; idx++) {
    const file = files[idx];
    const basePct = Math.round((idx / files.length) * 90);
    onProgress?.(basePct);

    const result = await cropFile(
      file,
      config,
      outputFormat,
      outputFileType,
      includeInvoice,
    );

    const baseName = file.name.replace(/\.(pdf|png|jpe?g)$/i, '');

    if (outputFileType === 'pdf') {
      if (result.labelsPdfBlob) {
        zip.file(`labels/${baseName}-labels.${ext}`, result.labelsPdfBlob);
      }
      if (result.invoicesPdfBlob) {
        zip.file(`invoices/${baseName}-invoices.${ext}`, result.invoicesPdfBlob);
      }
    } else {
      result.labelsPngBlobs?.forEach((blob, i) => {
        zip.file(`labels/${baseName}-label-${i + 1}.${ext}`, blob);
      });
      result.invoicesPngBlobs?.forEach((blob, i) => {
        zip.file(`invoices/${baseName}-invoice-${i + 1}.${ext}`, blob);
      });
    }
  }

  onProgress?.(95);
  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  onProgress?.(100);
  return zipBlob;
}

// ---------------------------------------------------------------------------
// Batch processing → individual ProcessedLabel array (no ZIP)
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
    const file = files[idx];
    const result = await cropFile(file, config, outputFormat, outputFileType, includeInvoice);
    const baseName = file.name.replace(/\.(pdf|png|jpe?g)$/i, '');
    const ext = outputFileType === 'pdf' ? 'pdf' : 'png';

    results.push({
      filename: baseName,
      labelBlob: result.labelsPdfBlob ?? result.labelsPngBlobs?.[0] ?? new Blob(),
      invoiceBlob: result.invoicesPdfBlob ?? result.invoicesPngBlobs?.[0],
    });

    void ext; // ext used for naming context only
  }

  onProgress?.(100);
  return results;
}

// ---------------------------------------------------------------------------
// Preview helper
// ---------------------------------------------------------------------------

export async function renderFirstPagePreview(file: File): Promise<string> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (isPdf) {
    const buffer = await file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
    const canvas = await renderPageToCanvas(pdfDoc, 1, 1.5);
    return canvas.toDataURL('image/jpeg', 0.85);
  } else {
    const canvas = await imageFileToCanvas(file);
    const out = document.createElement('canvas');
    const MAX = 800;
    const scale = Math.min(1, MAX / Math.max(canvas.width, canvas.height));
    out.width = Math.round(canvas.width * scale);
    out.height = Math.round(canvas.height * scale);
    out.getContext('2d')!.drawImage(canvas, 0, 0, out.width, out.height);
    return out.toDataURL('image/jpeg', 0.85);
  }
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
