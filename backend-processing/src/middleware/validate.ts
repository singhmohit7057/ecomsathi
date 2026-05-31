import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Middleware that checks if the uploaded file(s) exceed maxMB.
 */
export function validateFileSize(maxMB: number): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const maxBytes = maxMB * 1024 * 1024;

    if (req.file && req.file.size > maxBytes) {
      res.status(413).json({
        error: `File size ${(req.file.size / (1024 * 1024)).toFixed(2)} MB exceeds limit of ${maxMB} MB`,
      });
      return;
    }

    if (req.files) {
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      const oversized = files.find((f) => f.size > maxBytes);
      if (oversized) {
        res.status(413).json({
          error: `File "${oversized.originalname}" size ${(oversized.size / (1024 * 1024)).toFixed(2)} MB exceeds limit of ${maxMB} MB`,
        });
        return;
      }
    }

    next();
  };
}

/**
 * Middleware that validates mimetype of uploaded file(s).
 */
export function validateMimeType(allowed: string[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.file && !allowed.includes(req.file.mimetype)) {
      res.status(415).json({
        error: `Unsupported file type: ${req.file.mimetype}. Allowed: ${allowed.join(', ')}`,
      });
      return;
    }

    if (req.files) {
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      const invalid = files.find((f) => !allowed.includes(f.mimetype));
      if (invalid) {
        res.status(415).json({
          error: `Unsupported file type: ${invalid.mimetype}. Allowed: ${allowed.join(', ')}`,
        });
        return;
      }
    }

    next();
  };
}

/**
 * Wraps an async route handler to catch errors and forward to Express error handler.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
