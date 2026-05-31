import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ensureTempDir, getTempDir, cleanupFile } from '../utils/fileUtils';

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Returns a unique temp file path with the given extension.
 */
export function getTempPath(ext: string): string {
  ensureTempDir();
  const fileName = `${uuidv4()}${ext.startsWith('.') ? ext : '.' + ext}`;
  return path.join(getTempDir(), fileName);
}

/**
 * Wraps an ffmpeg command in a Promise.
 */
function runFfmpeg(command: ffmpeg.FfmpegCommand): Promise<void> {
  return new Promise((resolve, reject) => {
    command
      .on('end', () => resolve())
      .on('error', (err: Error) => reject(err))
      .run();
  });
}

// ---------------------------------------------------------------------------
// Convert video to GIF
// ---------------------------------------------------------------------------

export interface ToGIFOptions {
  startTime: number;   // seconds
  duration: number;    // seconds
  fps: number;         // output FPS
  width: number;       // output width (-1 = auto)
}

/**
 * Converts a video segment to an animated GIF with palette optimization.
 */
export async function toGIF(inputPath: string, options: ToGIFOptions): Promise<string> {
  const { startTime, duration, fps, width } = options;
  const outputPath = getTempPath('.gif');
  const palettePath = getTempPath('.png');

  try {
    // Step 1: Generate palette
    await runFfmpeg(
      ffmpeg(inputPath)
        .inputOptions([`-ss ${startTime}`, `-t ${duration}`])
        .videoFilters(`fps=${fps},scale=${width}:-1:flags=lanczos,palettegen`)
        .output(palettePath)
        .outputOptions(['-y'])
    );

    // Step 2: Generate GIF using palette
    await runFfmpeg(
      ffmpeg()
        .input(inputPath)
        .inputOptions([`-ss ${startTime}`, `-t ${duration}`])
        .input(palettePath)
        .complexFilter(
          `fps=${fps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse`
        )
        .output(outputPath)
        .outputOptions(['-y'])
    );

    return outputPath;
  } finally {
    cleanupFile(palettePath);
  }
}

// ---------------------------------------------------------------------------
// Extract Frames
// ---------------------------------------------------------------------------

export interface ExtractFramesOptions {
  mode: 'offset' | 'interval' | 'range';
  value: number;        // seconds offset, FPS interval, or unused for range
  format: 'jpeg' | 'png';
  rangeStart?: number;  // for range mode
  rangeEnd?: number;    // for range mode
}

/**
 * Extracts frames from a video. Returns array of output file paths.
 */
export async function extractFrames(
  inputPath: string,
  options: ExtractFramesOptions
): Promise<string[]> {
  const { mode, value, format, rangeStart = 0, rangeEnd = 10 } = options;
  const frameDir = path.join(getTempDir(), `frames_${uuidv4()}`);
  fs.mkdirSync(frameDir, { recursive: true });

  const ext = format === 'jpeg' ? 'jpg' : 'png';
  const outputPattern = path.join(frameDir, `frame_%04d.${ext}`);

  let command = ffmpeg(inputPath);

  switch (mode) {
    case 'offset':
      // Extract a single frame at the given time offset
      command = command
        .inputOptions([`-ss ${value}`])
        .frames(1);
      break;

    case 'interval':
      // Extract frames at given FPS interval (e.g. value=1 = 1 frame per second)
      command = command.videoFilters(`fps=${value}`);
      break;

    case 'range':
      // Extract frames between rangeStart and rangeEnd at 1fps
      command = command
        .inputOptions([`-ss ${rangeStart}`, `-t ${rangeEnd - rangeStart}`])
        .videoFilters('fps=1');
      break;
  }

  await runFfmpeg(command.output(outputPattern));

  // Collect all extracted frame files
  const files = fs.readdirSync(frameDir)
    .filter((f) => f.endsWith(`.${ext}`))
    .sort()
    .map((f) => path.join(frameDir, f));

  return files;
}

// ---------------------------------------------------------------------------
// Compress Video
// ---------------------------------------------------------------------------

/**
 * Compresses a video using H.264 with given CRF and scale.
 * CRF: 0 (lossless) to 51 (worst quality). Typical: 18-28.
 */
export async function compressVideo(
  inputPath: string,
  crf: number,
  scale: string
): Promise<string> {
  const outputPath = getTempPath('.mp4');

  await runFfmpeg(
    ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        `-crf ${crf}`,
        '-preset medium',
        '-movflags +faststart',
      ])
      .videoFilters(`scale=${scale}`)
      .output(outputPath)
  );

  return outputPath;
}

// ---------------------------------------------------------------------------
// Resize Video
// ---------------------------------------------------------------------------

/**
 * Resizes a video to the specified dimensions.
 * Dimensions are rounded to even numbers (required by H.264).
 */
export async function resizeVideo(
  inputPath: string,
  width: number,
  height: number
): Promise<string> {
  const outputPath = getTempPath('.mp4');

  // Round to even numbers
  const w = width % 2 === 0 ? width : width + 1;
  const h = height % 2 === 0 ? height : height + 1;

  await runFfmpeg(
    ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .videoFilters(`scale=${w}:${h}:flags=lanczos`)
      .outputOptions([
        '-crf 23',
        '-preset medium',
        '-movflags +faststart',
      ])
      .output(outputPath)
  );

  return outputPath;
}

// ---------------------------------------------------------------------------
// Convert Video Format
// ---------------------------------------------------------------------------

export type VideoQuality = 'low' | 'medium' | 'high';

const qualitySettings: Record<VideoQuality, { crf: number; preset: string }> = {
  low: { crf: 32, preset: 'fast' },
  medium: { crf: 23, preset: 'medium' },
  high: { crf: 18, preset: 'slow' },
};

/**
 * Converts a video to the specified format with quality settings.
 */
export async function convertVideo(
  inputPath: string,
  outputFormat: string,
  quality: VideoQuality
): Promise<string> {
  const ext = outputFormat.toLowerCase().replace(/^\./, '');
  const outputPath = getTempPath(`.${ext}`);
  const { crf, preset } = qualitySettings[quality];

  let command = ffmpeg(inputPath);

  switch (ext) {
    case 'mp4':
      command = command
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([`-crf ${crf}`, `-preset ${preset}`, '-movflags +faststart']);
      break;

    case 'webm':
      command = command
        .videoCodec('libvpx-vp9')
        .audioCodec('libopus')
        .outputOptions([`-crf ${crf}`, '-b:v 0']);
      break;

    case 'avi':
      command = command
        .videoCodec('mpeg4')
        .audioCodec('mp3')
        .outputOptions([`-q:v ${Math.round((crf / 51) * 31)}`]);
      break;

    case 'mov':
      command = command
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([`-crf ${crf}`, `-preset ${preset}`]);
      break;

    case 'mkv':
      command = command
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([`-crf ${crf}`, `-preset ${preset}`]);
      break;

    case 'gif':
      // Delegate to toGIF-style processing
      const palettePath = getTempPath('.png');
      try {
        await runFfmpeg(
          ffmpeg(inputPath)
            .videoFilters('fps=10,scale=480:-1:flags=lanczos,palettegen')
            .output(palettePath)
            .outputOptions(['-y'])
        );
        await runFfmpeg(
          ffmpeg()
            .input(inputPath)
            .input(palettePath)
            .complexFilter('fps=10,scale=480:-1:flags=lanczos[x];[x][1:v]paletteuse')
            .output(outputPath)
            .outputOptions(['-y'])
        );
        return outputPath;
      } finally {
        cleanupFile(palettePath);
      }

    default:
      command = command.videoCodec('libx264').audioCodec('aac');
  }

  await runFfmpeg(command.output(outputPath));
  return outputPath;
}

// ---------------------------------------------------------------------------
// Generate Thumbnail
// ---------------------------------------------------------------------------

/**
 * Generates a thumbnail image from a video at a specific time offset.
 */
export async function generateThumbnail(
  inputPath: string,
  timeOffset: number,
  width: number,
  height: number
): Promise<string> {
  const outputPath = getTempPath('.jpg');

  const w = width || 320;
  const h = height || -1;

  await runFfmpeg(
    ffmpeg(inputPath)
      .inputOptions([`-ss ${timeOffset}`])
      .frames(1)
      .videoFilters(`scale=${w}:${h}`)
      .output(outputPath)
  );

  return outputPath;
}
