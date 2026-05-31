import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { ensureTempDir } from '../utils/fileUtils';

// ---------------------------------------------------------------------------
// Import routers
// ---------------------------------------------------------------------------
import pdfRouter from '../routes/pdf.routes';
import imageRouter from '../routes/image.routes';
import gstRouter from '../routes/gst.routes';
import { createVideoRouter, JobStatus } from '../routes/video.routes';

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------
const PORT = parseInt(process.env.PORT || '3001', 10);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);

// ---------------------------------------------------------------------------
// In-memory job store for async video processing
// ---------------------------------------------------------------------------
export const jobStore = new Map<string, JobStatus>();

// Clean up completed/errored jobs older than 30 minutes
setInterval(() => {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000;
  let cleaned = 0;
  for (const [id, job] of jobStore.entries()) {
    if (
      (job.status === 'done' || job.status === 'error') &&
      job.completedAt &&
      now - job.completedAt > maxAge
    ) {
      // Clean up result file if present
      if (job.resultPath && fs.existsSync(job.resultPath)) {
        try {
          fs.unlinkSync(job.resultPath);
        } catch {
          // ignore
        }
      }
      jobStore.delete(id);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`[JobStore] Cleaned up ${cleaned} old jobs`);
  }
}, 10 * 60 * 1000);

// ---------------------------------------------------------------------------
// App setup
// ---------------------------------------------------------------------------
const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: [
      'Content-Disposition',
      'Content-Length',
      'X-Original-Size',
      'X-Compressed-Size',
      'X-Size-Reduction-Percent',
      'X-Extracted-Text-Length',
    ],
    credentials: false,
    maxAge: 86400,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again later.',
    retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000 / 60),
  },
  skip: (req) => req.path === '/health',
});
app.use(limiter);

// JSON body parser (for non-file routes like GST)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ecomsathi-processing',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    jobCount: jobStore.size,
  });
});

// PDF routes
app.use('/api/pdf', pdfRouter);

// Image routes
app.use('/api/image', imageRouter);

// Video routes (with access to job store)
const videoRouter = createVideoRouter(jobStore);
app.use('/api/video', videoRouter);

// GST routes
app.use('/api/gst', gstRouter);

// ---------------------------------------------------------------------------
// GET /api/jobs/:jobId — polling endpoint for async video jobs
// ---------------------------------------------------------------------------
app.get('/api/jobs/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = jobStore.get(jobId);

  if (!job) {
    res.status(404).json({ error: 'Job not found or expired' });
    return;
  }

  if (job.status === 'done' && job.resultPath) {
    // Return job metadata; client should call /api/jobs/:jobId/download to get the file
    res.json({
      jobId: job.id,
      status: job.status,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      resultMime: job.resultMime,
      resultFilename: job.resultFilename,
      downloadUrl: `/api/jobs/${job.id}/download`,
    });
    return;
  }

  res.json({
    jobId: job.id,
    status: job.status,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
    error: job.error,
  });
});

// ---------------------------------------------------------------------------
// GET /api/jobs/:jobId/download — download completed job result
// ---------------------------------------------------------------------------
app.get('/api/jobs/:jobId/download', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = jobStore.get(jobId);

  if (!job) {
    res.status(404).json({ error: 'Job not found or expired' });
    return;
  }

  if (job.status !== 'done' || !job.resultPath) {
    res.status(400).json({
      error: 'Job is not complete',
      status: job.status,
      jobError: job.error,
    });
    return;
  }

  if (!fs.existsSync(job.resultPath)) {
    res.status(410).json({ error: 'Result file has been cleaned up' });
    return;
  }

  const fileSize = fs.statSync(job.resultPath).size;

  res.set({
    'Content-Type': job.resultMime || 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${job.resultFilename || 'result'}"`,
    'Content-Length': fileSize.toString(),
  });

  const fileStream = fs.createReadStream(job.resultPath);
  fileStream.pipe(res);

  // Clean up the result file after sending
  fileStream.on('end', () => {
    if (job.resultPath && fs.existsSync(job.resultPath)) {
      try {
        fs.unlinkSync(job.resultPath);
      } catch {
        // ignore
      }
    }
    // Remove job from store
    jobStore.delete(jobId);
  });
});

// ---------------------------------------------------------------------------
// 404 handler
// ---------------------------------------------------------------------------
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err.message);

  // Multer errors
  if (err.message && err.message.includes('LIMIT_FILE_SIZE')) {
    res.status(413).json({ error: 'File too large' });
    return;
  }

  if (err.message && err.message.includes('CORS')) {
    res.status(403).json({ error: err.message });
    return;
  }

  // Unsupported file type from multer filter
  if (err.message && err.message.startsWith('Unsupported file type')) {
    res.status(415).json({ error: err.message });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
ensureTempDir();

const server = app.listen(PORT, () => {
  console.log(`[EcomSathi Processing] Server running on port ${PORT}`);
  console.log(`[EcomSathi Processing] Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
  console.log(`[EcomSathi Processing] Node.js ${process.version}`);
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
function gracefulShutdown(signal: string): void {
  console.log(`\n[EcomSathi Processing] Received ${signal}. Starting graceful shutdown...`);

  server.close((err) => {
    if (err) {
      console.error('[EcomSathi Processing] Error during shutdown:', err);
      process.exit(1);
    }

    console.log('[EcomSathi Processing] HTTP server closed');

    // Clean up any remaining jobs
    for (const [, job] of jobStore.entries()) {
      if (job.resultPath && fs.existsSync(job.resultPath)) {
        try {
          fs.unlinkSync(job.resultPath);
        } catch {
          // ignore
        }
      }
    }

    console.log('[EcomSathi Processing] Cleanup complete. Exiting.');
    process.exit(0);
  });

  // Force exit after 30 seconds
  setTimeout(() => {
    console.error('[EcomSathi Processing] Forced shutdown after timeout');
    process.exit(1);
  }, 30000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
