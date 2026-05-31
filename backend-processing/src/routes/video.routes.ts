import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { v4 as uuidv4 } from 'uuid';
import { uploadVideo } from '../middleware/upload';
import { asyncHandler } from '../middleware/validate';
import {
  toGIF,
  compressVideo,
  resizeVideo,
  convertVideo,
  extractFrames,
  generateThumbnail,
  getTempPath,
} from '../services/videoService';
import { bufferToTempFile, cleanupFile } from '../utils/fileUtils';

// Job store is passed in from the main server
export type JobStatus = {
  id: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  createdAt: number;
  completedAt?: number;
  error?: string;
  resultPath?: string;
  resultMime?: string;
  resultFilename?: string;
};

export function createVideoRouter(jobStore: Map<string, JobStatus>) {
  const router = Router();

  // ---------------------------------------------------------------------------
  // Helper: create a job, run the processor async, update job when done
  // ---------------------------------------------------------------------------
  function createJob(): JobStatus {
    const job: JobStatus = {
      id: uuidv4(),
      status: 'pending',
      createdAt: Date.now(),
    };
    jobStore.set(job.id, job);
    return job;
  }

  function runAsync(
    job: JobStatus,
    processor: () => Promise<{ path: string; mime: string; filename: string }>
  ): void {
    job.status = 'processing';
    jobStore.set(job.id, job);

    processor()
      .then(({ path: resultPath, mime, filename }) => {
        job.status = 'done';
        job.completedAt = Date.now();
        job.resultPath = resultPath;
        job.resultMime = mime;
        job.resultFilename = filename;
        jobStore.set(job.id, job);
      })
      .catch((err: Error) => {
        job.status = 'error';
        job.completedAt = Date.now();
        job.error = err.message || 'Processing failed';
        jobStore.set(job.id, job);
        console.error(`[VideoJob ${job.id}] Error:`, err);
      });
  }

  // ---------------------------------------------------------------------------
  // POST /api/video/to-gif
  // ---------------------------------------------------------------------------
  router.post(
    '/to-gif',
    uploadVideo,
    asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'Video file is required' });
        return;
      }

      const startTime = parseFloat((req.body.startTime as string) || '0');
      const duration = parseFloat((req.body.duration as string) || '5');
      const fps = parseInt((req.body.fps as string) || '10', 10);
      const width = parseInt((req.body.width as string) || '480', 10);

      const inputPath = bufferToTempFile(file.buffer, path.extname(file.originalname) || '.mp4');
      const job = createJob();

      runAsync(job, async () => {
        try {
          const outputPath = await toGIF(inputPath, { startTime, duration, fps, width });
          return {
            path: outputPath,
            mime: 'image/gif',
            filename: 'output.gif',
          };
        } finally {
          cleanupFile(inputPath);
        }
      });

      res.json({ jobId: job.id, status: 'processing' });
    })
  );

  // ---------------------------------------------------------------------------
  // POST /api/video/compress
  // ---------------------------------------------------------------------------
  router.post(
    '/compress',
    uploadVideo,
    asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'Video file is required' });
        return;
      }

      const crf = parseInt((req.body.crf as string) || '28', 10);
      const scale = (req.body.scale as string) || 'iw:ih';

      const inputPath = bufferToTempFile(file.buffer, path.extname(file.originalname) || '.mp4');
      const job = createJob();

      runAsync(job, async () => {
        try {
          const outputPath = await compressVideo(inputPath, crf, scale);
          return {
            path: outputPath,
            mime: 'video/mp4',
            filename: 'compressed.mp4',
          };
        } finally {
          cleanupFile(inputPath);
        }
      });

      res.json({ jobId: job.id, status: 'processing' });
    })
  );

  // ---------------------------------------------------------------------------
  // POST /api/video/convert
  // ---------------------------------------------------------------------------
  router.post(
    '/convert',
    uploadVideo,
    asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'Video file is required' });
        return;
      }

      const outputFormat = (req.body.format as string) || 'mp4';
      const quality = ((req.body.quality as string) || 'medium') as 'low' | 'medium' | 'high';

      const inputPath = bufferToTempFile(file.buffer, path.extname(file.originalname) || '.mp4');
      const job = createJob();

      const mimeMap: Record<string, string> = {
        mp4: 'video/mp4',
        webm: 'video/webm',
        avi: 'video/x-msvideo',
        mov: 'video/quicktime',
        mkv: 'video/x-matroska',
        gif: 'image/gif',
      };

      runAsync(job, async () => {
        try {
          const outputPath = await convertVideo(inputPath, outputFormat, quality);
          return {
            path: outputPath,
            mime: mimeMap[outputFormat.toLowerCase()] || 'video/mp4',
            filename: `converted.${outputFormat.toLowerCase()}`,
          };
        } finally {
          cleanupFile(inputPath);
        }
      });

      res.json({ jobId: job.id, status: 'processing' });
    })
  );

  // ---------------------------------------------------------------------------
  // POST /api/video/resize
  // ---------------------------------------------------------------------------
  router.post(
    '/resize',
    uploadVideo,
    asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'Video file is required' });
        return;
      }

      const width = parseInt((req.body.width as string) || '1280', 10);
      const height = parseInt((req.body.height as string) || '720', 10);

      const inputPath = bufferToTempFile(file.buffer, path.extname(file.originalname) || '.mp4');
      const job = createJob();

      runAsync(job, async () => {
        try {
          const outputPath = await resizeVideo(inputPath, width, height);
          return {
            path: outputPath,
            mime: 'video/mp4',
            filename: `resized_${width}x${height}.mp4`,
          };
        } finally {
          cleanupFile(inputPath);
        }
      });

      res.json({ jobId: job.id, status: 'processing' });
    })
  );

  // ---------------------------------------------------------------------------
  // POST /api/video/extract-frames
  // ---------------------------------------------------------------------------
  router.post(
    '/extract-frames',
    uploadVideo,
    asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'Video file is required' });
        return;
      }

      const mode = ((req.body.mode as string) || 'interval') as 'offset' | 'interval' | 'range';
      const value = parseFloat((req.body.value as string) || '1');
      const frameFormat = ((req.body.format as string) || 'jpeg') as 'jpeg' | 'png';
      const rangeStart = parseFloat((req.body.rangeStart as string) || '0');
      const rangeEnd = parseFloat((req.body.rangeEnd as string) || '10');

      const inputPath = bufferToTempFile(file.buffer, path.extname(file.originalname) || '.mp4');
      const job = createJob();

      runAsync(job, async () => {
        let framePaths: string[] = [];
        try {
          framePaths = await extractFrames(inputPath, {
            mode,
            value,
            format: frameFormat,
            rangeStart,
            rangeEnd,
          });

          // Zip all frames
          const zipPath = getTempPath('.zip');

          await new Promise<void>((resolve, reject) => {
            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 6 } });

            output.on('close', resolve);
            archive.on('error', reject);
            archive.pipe(output);

            const ext = frameFormat === 'jpeg' ? 'jpg' : 'png';
            framePaths.forEach((fp, i) => {
              archive.file(fp, {
                name: `frame_${String(i + 1).padStart(4, '0')}.${ext}`,
              });
            });

            archive.finalize();
          });

          return {
            path: zipPath,
            mime: 'application/zip',
            filename: 'frames.zip',
          };
        } finally {
          cleanupFile(inputPath);
          // Clean up individual frames after zipping
          framePaths.forEach(cleanupFile);
        }
      });

      res.json({ jobId: job.id, status: 'processing' });
    })
  );

  // ---------------------------------------------------------------------------
  // POST /api/video/thumbnail
  // Synchronous — returns image directly
  // ---------------------------------------------------------------------------
  router.post(
    '/thumbnail',
    uploadVideo,
    asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'Video file is required' });
        return;
      }

      const timeOffset = parseFloat((req.body.timeOffset as string) || '1');
      const width = parseInt((req.body.width as string) || '320', 10);
      const height = parseInt((req.body.height as string) || '0', 10);

      const inputPath = bufferToTempFile(file.buffer, path.extname(file.originalname) || '.mp4');
      let thumbPath: string | null = null;

      try {
        thumbPath = await generateThumbnail(inputPath, timeOffset, width, height);
        const thumbBuffer = fs.readFileSync(thumbPath);

        res.set({
          'Content-Type': 'image/jpeg',
          'Content-Disposition': 'attachment; filename="thumbnail.jpg"',
          'Content-Length': thumbBuffer.length.toString(),
        });
        res.send(thumbBuffer);
      } finally {
        cleanupFile(inputPath);
        if (thumbPath) cleanupFile(thumbPath);
      }
    })
  );

  return router;
}
