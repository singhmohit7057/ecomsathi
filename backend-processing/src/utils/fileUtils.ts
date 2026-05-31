import fs from 'fs';
import path from 'path';
import os from 'os';

const TEMP_DIR = path.join(os.tmpdir(), 'ecomsathi');

/**
 * Ensures the temp directory exists.
 */
export function ensureTempDir(): void {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

/**
 * Deletes a file, silently ignoring errors if it doesn't exist.
 */
export function cleanupFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error(`[fileUtils] Failed to cleanup file ${filePath}:`, err);
  }
}

/**
 * Deletes files in the temp directory older than maxAgeMinutes.
 */
export function cleanupOldTempFiles(maxAgeMinutes: number): void {
  ensureTempDir();
  const now = Date.now();
  const maxAgeMs = maxAgeMinutes * 60 * 1000;

  try {
    const entries = fs.readdirSync(TEMP_DIR);
    let cleaned = 0;
    for (const entry of entries) {
      const fullPath = path.join(TEMP_DIR, entry);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isFile() && now - stat.mtimeMs > maxAgeMs) {
          fs.unlinkSync(fullPath);
          cleaned++;
        }
      } catch {
        // ignore individual file errors
      }
    }
    if (cleaned > 0) {
      console.log(`[fileUtils] Cleaned up ${cleaned} old temp files`);
    }
  } catch (err) {
    console.error('[fileUtils] Failed to cleanup old temp files:', err);
  }
}

/**
 * Writes a buffer to a temp file with the given extension.
 * Returns the full path of the written file.
 */
export function bufferToTempFile(buffer: Buffer, ext: string): string {
  ensureTempDir();
  const { v4: uuidv4 } = require('uuid');
  const fileName = `${uuidv4()}${ext.startsWith('.') ? ext : '.' + ext}`;
  const filePath = path.join(TEMP_DIR, fileName);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

/**
 * Returns the temp directory path.
 */
export function getTempDir(): string {
  return TEMP_DIR;
}

// Schedule automatic cleanup every 5 minutes
setInterval(() => {
  cleanupOldTempFiles(30);
}, 5 * 60 * 1000);
