import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { bufferToTempFile, cleanupFile, ensureTempDir, getTempDir } from '../utils/fileUtils';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

// ---------------------------------------------------------------------------
// Merge PDFs
// ---------------------------------------------------------------------------

/**
 * Merges multiple PDF buffers into a single PDF buffer.
 */
export async function mergePDFs(files: Buffer[]): Promise<Buffer> {
  const merged = await PDFDocument.create();

  for (const fileBuffer of files) {
    const doc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
    const copiedPages = await merged.copyPages(doc, doc.getPageIndices());
    copiedPages.forEach((page) => merged.addPage(page));
  }

  const mergedBytes = await merged.save();
  return Buffer.from(mergedBytes);
}

// ---------------------------------------------------------------------------
// Split PDF
// ---------------------------------------------------------------------------

/**
 * Parses a range string like "1-3,5,7-9" into zero-based page indices.
 */
function parseRanges(ranges: string, totalPages: number): number[][] {
  const groups: number[][] = [];
  const parts = ranges.split(',').map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Math.max(1, parseInt(startStr, 10));
      const end = Math.min(totalPages, parseInt(endStr, 10));
      const group: number[] = [];
      for (let i = start; i <= end; i++) {
        group.push(i - 1); // zero-based
      }
      if (group.length > 0) groups.push(group);
    } else {
      const page = parseInt(part, 10);
      if (page >= 1 && page <= totalPages) {
        groups.push([page - 1]);
      }
    }
  }

  return groups;
}

/**
 * Splits a PDF by page ranges like "1-3,4-6".
 * Returns an array of PDF buffers, one per range group.
 */
export async function splitPDF(file: Buffer, ranges: string): Promise<Buffer[]> {
  const doc = await PDFDocument.load(file, { ignoreEncryption: true });
  const totalPages = doc.getPageCount();
  const groups = parseRanges(ranges, totalPages);

  if (groups.length === 0) {
    // If no valid ranges provided, return each page as its own document
    const results: Buffer[] = [];
    for (let i = 0; i < totalPages; i++) {
      const single = await PDFDocument.create();
      const [page] = await single.copyPages(doc, [i]);
      single.addPage(page);
      const bytes = await single.save();
      results.push(Buffer.from(bytes));
    }
    return results;
  }

  const results: Buffer[] = [];
  for (const pageIndices of groups) {
    const part = await PDFDocument.create();
    const copied = await part.copyPages(doc, pageIndices);
    copied.forEach((p) => part.addPage(p));
    const bytes = await part.save();
    results.push(Buffer.from(bytes));
  }

  return results;
}

// ---------------------------------------------------------------------------
// Compress PDF
// ---------------------------------------------------------------------------

/**
 * Compresses a PDF using pdf-lib (light) or Ghostscript (balanced/maximum).
 */
export async function compressPDF(
  file: Buffer,
  level: 'light' | 'balanced' | 'maximum'
): Promise<Buffer> {
  if (level === 'light') {
    // Light: re-save with pdf-lib which removes unused objects
    const doc = await PDFDocument.load(file, { ignoreEncryption: true });
    const bytes = await doc.save({ useObjectStreams: true });
    return Buffer.from(bytes);
  }

  // Balanced/Maximum: use Ghostscript for real compression
  const inputPath = bufferToTempFile(file, '.pdf');
  const outputPath = path.join(getTempDir(), `${uuidv4()}.pdf`);

  const pdfSettings = level === 'balanced' ? '/ebook' : '/screen';

  const gsCommand = [
    'gs',
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.4',
    `-dPDFSETTINGS=${pdfSettings}`,
    '-dNOPAUSE',
    '-dBATCH',
    '-dQUIET',
    '-dDetectDuplicateImages=true',
    '-dCompressFonts=true',
    `-sOutputFile=${outputPath}`,
    inputPath,
  ].join(' ');

  try {
    await execAsync(gsCommand);
    const compressed = fs.readFileSync(outputPath);
    return compressed;
  } finally {
    cleanupFile(inputPath);
    cleanupFile(outputPath);
  }
}

// ---------------------------------------------------------------------------
// PDF to Images
// ---------------------------------------------------------------------------

let pdfjsLib: typeof import('pdfjs-dist') | null = null;

async function getPdfjs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
  }
  return pdfjsLib;
}

/**
 * Converts PDF pages to images using pdfjs-dist + Sharp.
 * Returns array of image buffers.
 */
export async function pdfToImages(
  file: Buffer,
  dpi: number,
  format: 'png' | 'jpeg',
  pages?: number[]
): Promise<Buffer[]> {
  const sharp = (await import('sharp')).default;
  const pdfjs = await getPdfjs();

  // pdfjs-dist needs a Uint8Array
  const uint8 = new Uint8Array(file);

  const loadingTask = pdfjs.getDocument({
    data: uint8,
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  // Determine which pages to render (1-based)
  let pageNumbers: number[];
  if (pages && pages.length > 0) {
    pageNumbers = pages.filter((p) => p >= 1 && p <= totalPages);
  } else {
    pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const scale = dpi / 72; // PDF default is 72 DPI
  const results: Buffer[] = [];

  for (const pageNum of pageNumbers) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const width = Math.ceil(viewport.width);
    const height = Math.ceil(viewport.height);

    // Render to raw RGBA pixel data using pdfjs canvas factory
    // We'll use a NodeCanvasFactory or raw pixel buffer approach
    // Since we don't have a DOM canvas in Node, we create a raw buffer
    const rawBuffer = Buffer.alloc(width * height * 4);

    // Build a minimal canvas-like object pdfjs can render to
    const canvasContext = createNodeCanvas(width, height, rawBuffer);

    await page.render({
      canvasContext: canvasContext as unknown as CanvasRenderingContext2D,
      viewport,
    }).promise;

    // Convert raw RGBA → Sharp → desired format
    let sharpInstance = sharp(rawBuffer, {
      raw: { width, height, channels: 4 },
    });

    if (format === 'jpeg') {
      sharpInstance = sharpInstance.flatten({ background: { r: 255, g: 255, b: 255 } });
      const imgBuffer = await sharpInstance.jpeg({ quality: 85 }).toBuffer();
      results.push(imgBuffer);
    } else {
      const imgBuffer = await sharpInstance.png().toBuffer();
      results.push(imgBuffer);
    }
  }

  return results;
}

/**
 * Creates a minimal canvas-like context for pdfjs-dist rendering.
 * Writes rendered pixels into the provided rawBuffer (RGBA).
 */
function createNodeCanvas(
  width: number,
  height: number,
  rawBuffer: Buffer
): Record<string, unknown> {
  // Minimal 2D context implementation for pdfjs rendering
  const imageData = {
    data: new Uint8ClampedArray(rawBuffer.buffer, rawBuffer.byteOffset, rawBuffer.byteLength),
    width,
    height,
  };

  return {
    canvas: { width, height },
    drawImage: () => {},
    fillRect: (x: number, y: number, w: number, h: number) => {
      // Fill with white (default background)
      for (let row = y; row < y + h; row++) {
        for (let col = x; col < x + w; col++) {
          const idx = (row * width + col) * 4;
          rawBuffer[idx] = 255;
          rawBuffer[idx + 1] = 255;
          rawBuffer[idx + 2] = 255;
          rawBuffer[idx + 3] = 255;
        }
      }
    },
    getImageData: (_x: number, _y: number, _w: number, _h: number) => imageData,
    putImageData: (data: { data: Uint8ClampedArray }, x: number, y: number) => {
      const src = data.data;
      for (let i = 0; i < src.length; i += 4) {
        const pixel = i / 4;
        const row = Math.floor(pixel / width) + y;
        const col = (pixel % width) + x;
        if (row < height && col < width) {
          const dstIdx = (row * width + col) * 4;
          rawBuffer[dstIdx] = src[i];
          rawBuffer[dstIdx + 1] = src[i + 1];
          rawBuffer[dstIdx + 2] = src[i + 2];
          rawBuffer[dstIdx + 3] = src[i + 3];
        }
      }
    },
    save: () => {},
    restore: () => {},
    scale: () => {},
    rotate: () => {},
    translate: () => {},
    transform: () => {},
    setTransform: () => {},
    resetTransform: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    fill: () => {},
    rect: () => {},
    arc: () => {},
    clip: () => {},
    strokeRect: () => {},
    clearRect: () => {},
    createImageData: (w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4),
      width: w,
      height: h,
    }),
    measureText: (text: string) => ({ width: text.length * 6 }),
    fillText: () => {},
    strokeText: () => {},
    createLinearGradient: () => ({
      addColorStop: () => {},
    }),
    createRadialGradient: () => ({
      addColorStop: () => {},
    }),
    createPattern: () => null,
    shadowBlur: 0,
    shadowColor: '',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 10,
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    direction: 'ltr',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'low',
  };
}
