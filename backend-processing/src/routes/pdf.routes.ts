import { Router, Request, Response, NextFunction } from 'express';
import archiver from 'archiver';
import { uploadMultiple, uploadSingle } from '../middleware/upload';
import { asyncHandler, validateFileSize, validateMimeType } from '../middleware/validate';
import { mergePDFs, splitPDF, compressPDF, pdfToImages } from '../services/pdfService';
import { ocrPDF } from '../services/ocrService';

const router = Router();

const PDF_MIMES = ['application/pdf'];

// ---------------------------------------------------------------------------
// POST /api/pdf/merge
// Merges multiple uploaded PDFs into one
// ---------------------------------------------------------------------------
router.post(
  '/merge',
  uploadMultiple('files', 20),
  validateFileSize(50),
  validateMimeType(PDF_MIMES),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length < 2) {
      res.status(400).json({ error: 'At least 2 PDF files are required for merging' });
      return;
    }

    const buffers = files.map((f) => f.buffer);
    const merged = await mergePDFs(buffers);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="merged.pdf"',
      'Content-Length': merged.length.toString(),
    });
    res.send(merged);
  })
);

// ---------------------------------------------------------------------------
// POST /api/pdf/split
// Splits a PDF by page ranges like "1-3,4-6"
// ---------------------------------------------------------------------------
router.post(
  '/split',
  uploadSingle('file'),
  validateFileSize(50),
  validateMimeType(PDF_MIMES),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const file = req.file;
    const ranges = (req.body.ranges as string) || '';

    if (!file) {
      res.status(400).json({ error: 'PDF file is required' });
      return;
    }

    const parts = await splitPDF(file.buffer, ranges);

    if (parts.length === 1) {
      // Return single file directly
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="split_1.pdf"',
        'Content-Length': parts[0].length.toString(),
      });
      res.send(parts[0]);
      return;
    }

    // Multiple parts → zip them
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="split_pages.zip"',
    });

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.pipe(res);

    parts.forEach((buf, i) => {
      archive.append(buf, { name: `split_${i + 1}.pdf` });
    });

    await archive.finalize();
  })
);

// ---------------------------------------------------------------------------
// POST /api/pdf/ocr
// OCRs a PDF and returns a searchable PDF
// ---------------------------------------------------------------------------
router.post(
  '/ocr',
  uploadSingle('file'),
  validateFileSize(50),
  validateMimeType(PDF_MIMES),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const file = req.file;
    const lang = (req.body.lang as string) || 'eng';

    if (!file) {
      res.status(400).json({ error: 'PDF file is required' });
      return;
    }

    const { searchablePdfBuffer, text } = await ocrPDF(file.buffer, lang);

    // If the client wants just text
    if (req.body.returnText === 'true' || req.query.returnText === 'true') {
      res.json({ text });
      return;
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="searchable.pdf"',
      'Content-Length': searchablePdfBuffer.length.toString(),
      'X-Extracted-Text-Length': text.length.toString(),
    });
    res.send(searchablePdfBuffer);
  })
);

// ---------------------------------------------------------------------------
// POST /api/pdf/compress
// Compresses a PDF with the given level
// ---------------------------------------------------------------------------
router.post(
  '/compress',
  uploadSingle('file'),
  validateFileSize(50),
  validateMimeType(PDF_MIMES),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const file = req.file;
    const level = (req.body.level as 'light' | 'balanced' | 'maximum') || 'balanced';

    if (!file) {
      res.status(400).json({ error: 'PDF file is required' });
      return;
    }

    if (!['light', 'balanced', 'maximum'].includes(level)) {
      res.status(400).json({ error: 'level must be light, balanced, or maximum' });
      return;
    }

    const compressed = await compressPDF(file.buffer, level);

    const originalSize = file.size;
    const compressedSize = compressed.length;
    const savings = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="compressed.pdf"',
      'Content-Length': compressedSize.toString(),
      'X-Original-Size': originalSize.toString(),
      'X-Compressed-Size': compressedSize.toString(),
      'X-Size-Reduction-Percent': savings,
    });
    res.send(compressed);
  })
);

// ---------------------------------------------------------------------------
// POST /api/pdf/to-images
// Converts PDF pages to images, returns a ZIP archive
// ---------------------------------------------------------------------------
router.post(
  '/to-images',
  uploadSingle('file'),
  validateFileSize(50),
  validateMimeType(PDF_MIMES),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const file = req.file;
    const dpi = parseInt((req.body.dpi as string) || '150', 10);
    const format = ((req.body.format as string) || 'png') as 'png' | 'jpeg';
    const pagesParam = req.body.pages as string | undefined;

    if (!file) {
      res.status(400).json({ error: 'PDF file is required' });
      return;
    }

    let pages: number[] | undefined;
    if (pagesParam) {
      pages = pagesParam
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n >= 1);
    }

    const images = await pdfToImages(file.buffer, dpi, format, pages);

    if (images.length === 0) {
      res.status(500).json({ error: 'No images were generated' });
      return;
    }

    if (images.length === 1) {
      // Return single image directly
      const contentType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const ext = format === 'jpeg' ? 'jpg' : 'png';
      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="page_1.${ext}"`,
        'Content-Length': images[0].length.toString(),
      });
      res.send(images[0]);
      return;
    }

    // Multiple pages → zip
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="pdf_pages.zip"',
    });

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.pipe(res);

    const ext = format === 'jpeg' ? 'jpg' : 'png';
    images.forEach((buf, i) => {
      const pageNum = (pages ? pages[i] : i + 1).toString().padStart(4, '0');
      archive.append(buf, { name: `page_${pageNum}.${ext}` });
    });

    await archive.finalize();
  })
);

export default router;
