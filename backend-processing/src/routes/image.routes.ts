import { Router, Request, Response, NextFunction } from 'express';
import { uploadSingle } from '../middleware/upload';
import { asyncHandler, validateFileSize, validateMimeType } from '../middleware/validate';
import {
  removeBackground,
  addWhiteBackground,
  resizeImage,
  compressImage,
  convertFormat,
} from '../services/imageService';

const router = Router();

const IMAGE_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
];

// ---------------------------------------------------------------------------
// POST /api/image/remove-background
// Removes background from an image using heuristic color detection
// ---------------------------------------------------------------------------
router.post(
  '/remove-background',
  uploadSingle('file'),
  validateFileSize(20),
  validateMimeType(IMAGE_MIMES),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const file = req.file;
    const tolerance = parseInt((req.body.tolerance as string) || '30', 10);

    if (!file) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    const result = await removeBackground(file.buffer, tolerance);

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename="no-background.png"',
      'Content-Length': result.length.toString(),
    });
    res.send(result);
  })
);

// ---------------------------------------------------------------------------
// POST /api/image/white-background
// Composites image onto a solid white background
// ---------------------------------------------------------------------------
router.post(
  '/white-background',
  uploadSingle('file'),
  validateFileSize(20),
  validateMimeType(IMAGE_MIMES),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const file = req.file;
    const sensitivity = parseInt((req.body.sensitivity as string) || '30', 10);

    if (!file) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    const result = await addWhiteBackground(file.buffer, sensitivity);

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename="white-background.png"',
      'Content-Length': result.length.toString(),
    });
    res.send(result);
  })
);

// ---------------------------------------------------------------------------
// POST /api/image/resize
// Resizes an image to specified dimensions
// ---------------------------------------------------------------------------
router.post(
  '/resize',
  uploadSingle('file'),
  validateFileSize(20),
  validateMimeType(IMAGE_MIMES),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const file = req.file;
    const width = parseInt((req.body.width as string) || '0', 10);
    const height = parseInt((req.body.height as string) || '0', 10);
    const maintainAspect = (req.body.maintainAspect as string) !== 'false';

    if (!file) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    if (width <= 0 && height <= 0) {
      res.status(400).json({ error: 'width or height must be a positive integer' });
      return;
    }

    const result = await resizeImage(
      file.buffer,
      width > 0 ? width : undefined as unknown as number,
      height > 0 ? height : undefined as unknown as number,
      maintainAspect
    );

    // Preserve original mimetype
    const contentType = file.mimetype === 'image/png' ? 'image/png' : 'image/jpeg';
    const ext = contentType === 'image/png' ? 'png' : 'jpg';

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="resized.${ext}"`,
      'Content-Length': result.length.toString(),
    });
    res.send(result);
  })
);

// ---------------------------------------------------------------------------
// POST /api/image/compress
// Compresses an image to the given quality level
// ---------------------------------------------------------------------------
router.post(
  '/compress',
  uploadSingle('file'),
  validateFileSize(20),
  validateMimeType(IMAGE_MIMES),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const file = req.file;
    const quality = parseInt((req.body.quality as string) || '80', 10);
    const outputFormat = ((req.body.format as string) || 'jpeg') as 'jpeg' | 'png' | 'webp';

    if (!file) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    if (quality < 1 || quality > 100) {
      res.status(400).json({ error: 'quality must be between 1 and 100' });
      return;
    }

    const result = await compressImage(file.buffer, quality, outputFormat);

    const mimeMap: Record<string, string> = {
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };
    const extMap: Record<string, string> = {
      jpeg: 'jpg',
      png: 'png',
      webp: 'webp',
    };

    const contentType = mimeMap[outputFormat] || 'image/jpeg';
    const ext = extMap[outputFormat] || 'jpg';
    const originalSize = file.size;
    const compressedSize = result.length;
    const savings = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="compressed.${ext}"`,
      'Content-Length': compressedSize.toString(),
      'X-Original-Size': originalSize.toString(),
      'X-Compressed-Size': compressedSize.toString(),
      'X-Size-Reduction-Percent': savings,
    });
    res.send(result);
  })
);

// ---------------------------------------------------------------------------
// POST /api/image/convert
// Converts an image to a different format
// ---------------------------------------------------------------------------
router.post(
  '/convert',
  uploadSingle('file'),
  validateFileSize(20),
  validateMimeType([...IMAGE_MIMES, 'image/svg+xml']),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const file = req.file;
    const toFormat = (req.body.to as string) || 'jpeg';
    const quality = parseInt((req.body.quality as string) || '85', 10);
    const lossless = req.body.lossless === 'true';

    if (!file) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    const fromFormat = file.mimetype.split('/')[1] || 'jpeg';
    const result = await convertFormat(file.buffer, fromFormat, toFormat, { quality, lossless });

    const mimeMap: Record<string, string> = {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
      tiff: 'image/tiff',
    };

    const contentType = mimeMap[toFormat.toLowerCase()] || 'application/octet-stream';
    const ext = toFormat.toLowerCase() === 'jpeg' ? 'jpg' : toFormat.toLowerCase();

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="converted.${ext}"`,
      'Content-Length': result.length.toString(),
    });
    res.send(result);
  })
);

export default router;
