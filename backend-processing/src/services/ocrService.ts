import { createWorker, Worker } from 'tesseract.js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { bufferToTempFile, cleanupFile } from '../utils/fileUtils';

// ---------------------------------------------------------------------------
// Worker management
// ---------------------------------------------------------------------------

/**
 * Creates and initializes a Tesseract OCR worker for the given language.
 */
export async function createOCRWorker(lang = 'eng'): Promise<Worker> {
  const worker = await createWorker(lang, 1, {
    logger: () => {}, // suppress verbose logging
    errorHandler: (err: unknown) => console.error('[OCR Worker Error]', err),
  });
  return worker;
}

// ---------------------------------------------------------------------------
// OCR a single image buffer
// ---------------------------------------------------------------------------

/**
 * Runs OCR on a single image buffer and returns the extracted text.
 */
export async function extractText(imageBuffer: Buffer, lang = 'eng'): Promise<string> {
  const worker = await createOCRWorker(lang);
  try {
    const { data } = await worker.recognize(imageBuffer);
    return data.text;
  } finally {
    await worker.terminate();
  }
}

// ---------------------------------------------------------------------------
// OCR a full PDF
// ---------------------------------------------------------------------------

/**
 * OCRs a PDF file:
 * 1. Renders each page to an image via pdfjs-dist
 * 2. Runs Tesseract on each image
 * 3. Builds a searchable PDF with invisible text overlay using pdf-lib
 *
 * Returns: { text, searchablePdfBuffer }
 */
export async function ocrPDF(
  file: Buffer,
  lang = 'eng'
): Promise<{ text: string; searchablePdfBuffer: Buffer }> {
  const sharp = (await import('sharp')).default;
  const pdfjs = await import('pdfjs-dist');

  const uint8 = new Uint8Array(file);
  const loadingTask = pdfjs.getDocument({ data: uint8, useSystemFonts: true });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  // Create output PDF
  const outputPdf = await PDFDocument.create();
  outputPdf.registerFontkit(require('@pdf-lib/fontkit'));

  // Embed the source PDF pages
  const sourcePdf = await PDFDocument.load(file, { ignoreEncryption: true });
  const copiedPages = await outputPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
  copiedPages.forEach((p) => outputPdf.addPage(p));

  // Embed a standard font for invisible text layer
  const font = await outputPdf.embedFont(StandardFonts.Helvetica);

  const worker = await createOCRWorker(lang);
  const allText: string[] = [];

  try {
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // 144 DPI

      const width = Math.ceil(viewport.width);
      const height = Math.ceil(viewport.height);

      // Render page to raw RGBA
      const rawBuffer = Buffer.alloc(width * height * 4, 255); // pre-fill white
      const ctx = createMinimalContext(width, height, rawBuffer);

      await page.render({
        canvasContext: ctx as unknown as CanvasRenderingContext2D,
        viewport,
      }).promise;

      // Convert to JPEG for Tesseract
      const jpegBuffer = await sharp(rawBuffer, {
        raw: { width, height, channels: 4 },
      })
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .jpeg({ quality: 90 })
        .toBuffer();

      // Run OCR
      const {
        data: { text, words },
      } = await worker.recognize(jpegBuffer);

      allText.push(text);

      // Add invisible text layer to the corresponding output page
      const outPage = outputPdf.getPages()[pageNum - 1];
      const pageWidth = outPage.getWidth();
      const pageHeight = outPage.getHeight();

      // Scale factors from rendered image → PDF page coordinates
      const scaleX = pageWidth / width;
      const scaleY = pageHeight / height;

      if (words && words.length > 0) {
        for (const word of words) {
          if (!word.text.trim()) continue;

          const bbox = word.bbox;
          const x = bbox.x0 * scaleX;
          // PDF y-axis is bottom-up; image y-axis is top-down
          const y = pageHeight - bbox.y1 * scaleY;
          const wordWidth = (bbox.x1 - bbox.x0) * scaleX;
          const wordHeight = (bbox.y1 - bbox.y0) * scaleY;
          const fontSize = Math.max(4, wordHeight * 0.9);

          // Draw invisible text (opacity 0 via rendering mode trick)
          outPage.drawText(word.text, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(1, 1, 1), // white — invisible on white bg
            opacity: 0.01, // near-invisible but selectable
            maxWidth: wordWidth,
          });
        }
      }
    }
  } finally {
    await worker.terminate();
  }

  const pdfBytes = await outputPdf.save();
  return {
    text: allText.join('\n\n--- Page Break ---\n\n'),
    searchablePdfBuffer: Buffer.from(pdfBytes),
  };
}

// ---------------------------------------------------------------------------
// Minimal canvas context for pdfjs rendering (same pattern as pdfService)
// ---------------------------------------------------------------------------

function createMinimalContext(
  width: number,
  height: number,
  rawBuffer: Buffer
): Record<string, unknown> {
  const imageData = {
    data: new Uint8ClampedArray(rawBuffer.buffer, rawBuffer.byteOffset, rawBuffer.byteLength),
    width,
    height,
  };

  return {
    canvas: { width, height },
    drawImage: () => {},
    fillRect: (x: number, y: number, w: number, h: number) => {
      for (let row = y; row < Math.min(y + h, height); row++) {
        for (let col = x; col < Math.min(x + w, width); col++) {
          const idx = (row * width + col) * 4;
          rawBuffer[idx] = 255;
          rawBuffer[idx + 1] = 255;
          rawBuffer[idx + 2] = 255;
          rawBuffer[idx + 3] = 255;
        }
      }
    },
    getImageData: () => imageData,
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
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    createPattern: () => null,
    shadowBlur: 0,
    shadowColor: '',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillStyle: '#ffffff',
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
