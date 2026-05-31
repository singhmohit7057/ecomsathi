import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '500', 10);

// Storage: keep files in memory
const memStorage = multer.memoryStorage();

// Default file filter: accept all
const defaultFilter = (_req: Request, _file: Express.Multer.File, cb: FileFilterCallback) => {
  cb(null, true);
};

// Image mime types
const imageMimes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
];

// PDF mime types
const pdfMimes = ['application/pdf'];

// Video mime types
const videoMimes = [
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-ms-wmv',
  'video/webm',
  'video/x-matroska',
  'video/3gpp',
  'video/ogg',
];

function makeFilter(allowed: string[]) {
  return (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: ${allowed.join(', ')}`));
    }
  };
}

// Base multer instances by file category
const videoUpload = multer({
  storage: memStorage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: makeFilter(videoMimes),
});

const pdfUpload = multer({
  storage: memStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB for PDFs
  fileFilter: makeFilter(pdfMimes),
});

const imageUpload = multer({
  storage: memStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB for images
  fileFilter: makeFilter(imageMimes),
});

const genericUpload = multer({
  storage: memStorage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: defaultFilter,
});

/**
 * Upload a single file from a named field.
 */
export function uploadSingle(fieldName: string) {
  return genericUpload.single(fieldName);
}

/**
 * Upload multiple files from a named field.
 */
export function uploadMultiple(fieldName: string, maxCount: number) {
  return genericUpload.array(fieldName, maxCount);
}

/**
 * Upload a single video file from the 'file' field.
 */
export const uploadVideo = videoUpload.single('file');

/**
 * Upload a single PDF file from the 'file' field.
 */
export const uploadPDF = pdfUpload.single('file');

/**
 * Upload a single image file from the 'file' field.
 */
export const uploadImage = imageUpload.single('file');

/**
 * Upload multiple image files from the 'files' field.
 */
export const uploadImages = imageUpload.array('files', 50);
