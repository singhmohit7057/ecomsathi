import sharp, { Sharp } from 'sharp';

// ---------------------------------------------------------------------------
// Remove Background (heuristic approach using Sharp)
// ---------------------------------------------------------------------------

/**
 * Attempts to remove the background from an image using a heuristic approach:
 * - Samples corner pixels to determine the dominant background color
 * - Replaces pixels within a color tolerance with transparency
 *
 * Note: For production-quality results, integrate with remove.bg API.
 * Returns a PNG with alpha channel.
 */
export async function removeBackground(
  buffer: Buffer,
  tolerance = 30
): Promise<Buffer> {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const { width = 0, height = 0, channels } = metadata;

  if (width === 0 || height === 0) {
    throw new Error('Invalid image dimensions');
  }

  // Get raw RGBA pixels
  const { data: rawData } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixelCount = width * height;
  const data = new Uint8ClampedArray(rawData.buffer);

  // Sample corners to determine background color (top-left, top-right, bottom-left, bottom-right)
  const cornerPixels: Array<{ r: number; g: number; b: number }> = [];
  const corners = [
    0,                                // top-left
    (width - 1),                      // top-right
    (height - 1) * width,             // bottom-left
    (height - 1) * width + (width - 1), // bottom-right
  ];

  for (const idx of corners) {
    const offset = idx * 4;
    cornerPixels.push({
      r: data[offset],
      g: data[offset + 1],
      b: data[offset + 2],
    });
  }

  // Average the corner colors
  const bgColor = {
    r: Math.round(cornerPixels.reduce((s, p) => s + p.r, 0) / cornerPixels.length),
    g: Math.round(cornerPixels.reduce((s, p) => s + p.g, 0) / cornerPixels.length),
    b: Math.round(cornerPixels.reduce((s, p) => s + p.b, 0) / cornerPixels.length),
  };

  // Replace pixels close to background color with transparency
  for (let i = 0; i < pixelCount; i++) {
    const offset = i * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];

    const diff = Math.sqrt(
      Math.pow(r - bgColor.r, 2) +
      Math.pow(g - bgColor.g, 2) +
      Math.pow(b - bgColor.b, 2)
    );

    if (diff <= tolerance) {
      data[offset + 3] = 0; // fully transparent
    } else if (diff <= tolerance * 1.5) {
      // Soft edge transition
      const alpha = Math.round(((diff - tolerance) / (tolerance * 0.5)) * 255);
      data[offset + 3] = Math.min(255, alpha);
    }
  }

  // Convert back to PNG with transparency
  const resultBuffer = await sharp(Buffer.from(data.buffer), {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer();

  return resultBuffer;
}

// ---------------------------------------------------------------------------
// Add White Background
// ---------------------------------------------------------------------------

/**
 * Composites the image onto a white background.
 * Useful for images with transparency.
 */
export async function addWhiteBackground(
  buffer: Buffer,
  _sensitivity = 30
): Promise<Buffer> {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const { width = 0, height = 0 } = metadata;

  if (width === 0 || height === 0) {
    throw new Error('Invalid image dimensions');
  }

  // Create a white background and composite the input image on top
  const result = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      {
        input: await sharp(buffer).ensureAlpha().toBuffer(),
        blend: 'over',
      },
    ])
    .png()
    .toBuffer();

  return result;
}

// ---------------------------------------------------------------------------
// Resize Image
// ---------------------------------------------------------------------------

/**
 * Resizes an image to the specified dimensions.
 * If maintainAspect is true, resizes to fit within the box while preserving aspect ratio.
 */
export async function resizeImage(
  buffer: Buffer,
  width: number,
  height: number,
  maintainAspect = true
): Promise<Buffer> {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const format = (metadata.format as 'jpeg' | 'png' | 'webp') || 'jpeg';

  let resized: Sharp;

  if (maintainAspect) {
    resized = image.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: false,
    });
  } else {
    resized = image.resize(width, height, {
      fit: 'fill',
    });
  }

  // Preserve original format
  switch (format) {
    case 'png':
      return resized.png().toBuffer();
    case 'webp':
      return resized.webp({ quality: 85 }).toBuffer();
    default:
      return resized.jpeg({ quality: 90 }).toBuffer();
  }
}

// ---------------------------------------------------------------------------
// Compress Image
// ---------------------------------------------------------------------------

/**
 * Compresses an image to the given quality level.
 * Returns in the specified output format.
 */
export async function compressImage(
  buffer: Buffer,
  quality: number,
  format: 'jpeg' | 'png' | 'webp' = 'jpeg'
): Promise<Buffer> {
  const image = sharp(buffer);

  switch (format) {
    case 'png':
      // PNG quality 1-100 maps to compressionLevel 9-1
      const compressionLevel = Math.max(1, Math.round(9 - (quality / 100) * 8));
      return image.png({ compressionLevel }).toBuffer();

    case 'webp':
      return image.webp({ quality: Math.min(100, Math.max(1, quality)) }).toBuffer();

    case 'jpeg':
    default:
      return image.jpeg({ quality: Math.min(100, Math.max(1, quality)) }).toBuffer();
  }
}

// ---------------------------------------------------------------------------
// Convert Format
// ---------------------------------------------------------------------------

/**
 * Converts an image from one format to another.
 */
export async function convertFormat(
  buffer: Buffer,
  _from: string,
  to: string,
  options: { quality?: number; lossless?: boolean } = {}
): Promise<Buffer> {
  const { quality = 85, lossless = false } = options;
  const image = sharp(buffer);

  switch (to.toLowerCase()) {
    case 'jpeg':
    case 'jpg':
      return image.jpeg({ quality }).toBuffer();

    case 'png':
      return image.png().toBuffer();

    case 'webp':
      return image.webp({ quality, lossless }).toBuffer();

    case 'avif':
      return image.avif({ quality }).toBuffer();

    case 'tiff':
    case 'tif':
      return image.tiff().toBuffer();

    case 'bmp':
      // Sharp doesn't support BMP output natively, convert to PNG
      return image.png().toBuffer();

    default:
      throw new Error(`Unsupported output format: ${to}`);
  }
}
