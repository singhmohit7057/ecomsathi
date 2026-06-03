import React, { useState } from 'react'
import SEO from '@/components/common/SEO'
import VideoToolLayout from '../components/VideoToolLayout'
import VideoUploader from '../components/VideoUploader'
import VideoPreview from '../components/VideoPreview'
import ProcessingBar from '../components/ProcessingBar'
import VideoDownloader from '../components/VideoDownloader'
import VideoFAQ from '../components/VideoFAQ'
import { useVideoFile } from '../hooks/useVideoFile'
import { useFFmpeg } from '../hooks/useFFmpeg'
import { videoToGif, toObjectURL } from '../services/ffmpegService'
import { formatDuration } from '../utils/formatBytes'
import type { FAQItem, RelatedTool } from '../types'

// ─── Defaults ────────────────────────────────────────────────────────────────

const RELATED_TOOLS: RelatedTool[] = [
  { label: 'Frame Extractor',      to: '/video/frame-extractor',     description: 'Extract frames as images' },
  { label: 'Compress Video',       to: '/video/compress',            description: 'Reduce video file size' },
  { label: 'Thumbnail Generator',  to: '/video/thumbnail-generator', description: 'Extract video thumbnails' },
  { label: 'Video Converter',      to: '/video/converter',           description: 'Convert to MP4, WEBM, AVI…' },
  { label: 'Resize Video',         to: '/video/resize',              description: 'Change resolution' },
]

const FAQS: FAQItem[] = [
  {
    question: 'What video formats can I convert to GIF?',
    answer: 'You can convert MP4, MOV, AVI, WEBM, and MKV video files to animated GIF.',
  },
  {
    question: 'How do I control the GIF quality?',
    answer: 'You can set the frame rate (FPS) and width. Higher FPS and larger width produce smoother, larger GIFs.',
  },
  {
    question: 'Can I convert only a part of the video to GIF?',
    answer: 'Yes. Enter a start and end time to convert only the selected segment of your video to GIF.',
  },
  {
    question: 'Why is my GIF file so large?',
    answer: 'GIFs are uncompressed per frame. Use a lower width (240–320px) and lower FPS (8–12) to keep the file size small.',
  },
  {
    question: 'Is my video uploaded to any server?',
    answer: 'No. All processing runs in your browser via FFmpeg WebAssembly. Your video never leaves your device.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Video to GIF Converter',
  url: 'https://ecomsathi.vercel.app/video/video-to-gif',
  description: 'Free online video to GIF converter. Convert MP4, MOV, AVI, WEBM and MKV clips to animated GIF in your browser.',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

// ─── Component ────────────────────────────────────────────────────────────────

interface GifOptions {
  fps: number
  gifWidth: number
  startTime: number
  endTime: number | ''
}

interface GifResult {
  url: string
  size: number
  filename: string
}

export const VideoToGif: React.FC = () => {
  const { videoFile, error: fileError, isLoading: fileLoading, onDrop, reset } = useVideoFile()
  const { status, progress, error: procError, result, run, reset: resetProc } = useFFmpeg<GifResult>()

  const [opts, setOpts] = useState<GifOptions>({
    fps: 10,
    gifWidth: 480,
    startTime: 0,
    endTime: '',
  })

  const handleProcess = async () => {
    if (!videoFile) return
    await run(async (onProgress) => {
      const task = await videoToGif(
        videoFile.file,
        {
          gifFps: opts.fps,
          gifWidth: opts.gifWidth,
          startTime: opts.startTime,
          endTime: opts.endTime !== '' ? Number(opts.endTime) : undefined,
        },
        onProgress,
      )
      const url = toObjectURL(task.result, task.mimeType)
      return { url, size: task.result.byteLength, filename: task.outputName }
    })
  }

  const handleReset = () => {
    if (result) URL.revokeObjectURL(result.url)
    resetProc()
    reset()
  }

  return (
    <>
      <SEO
        title="Video to GIF Converter Free — EcomSathi"
        description="Convert video clips to animated GIF free online. MP4, MOV, AVI to GIF converter. Perfect for product showcase animations on ecommerce listings."
        keywords="video to gif converter free, mp4 to gif online, convert video to gif, animated gif maker, product video to gif, webm to gif"
        canonicalUrl="https://ecomsathi.vercel.app/video/video-to-gif"
        schema={PAGE_SCHEMA}
      />

      <VideoToolLayout
        title="Video to GIF Converter"
        description="Convert video clips to animated GIF for ecommerce product listings and social media."
        relatedTools={RELATED_TOOLS}
      >
        <div className="flex flex-col gap-6">
          {/* Upload */}
          <VideoUploader
            videoFile={videoFile}
            isLoading={fileLoading}
            error={fileError}
            onDrop={onDrop}
            onReset={handleReset}
          />

          {/* Preview */}
          {videoFile && <VideoPreview videoFile={videoFile} />}

          {/* Options */}
          {videoFile && status !== 'done' && (
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 flex flex-col gap-5">
              <h2 className="text-sm font-semibold text-[#0F172A]">GIF Options</h2>

              {/* FPS */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#0F172A]">Frame Rate</label>
                  <span className="text-sm font-semibold text-[#2563EB]">{opts.fps} FPS</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={opts.fps}
                  onChange={(e) => setOpts((p) => ({ ...p, fps: Number(e.target.value) }))}
                  className="w-full accent-[#2563EB]"
                />
                <div className="flex justify-between text-[11px] text-[#94A3B8]">
                  <span>Smaller file (5)</span>
                  <span>Smoother (30)</span>
                </div>
              </div>

              {/* Width */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#0F172A]">GIF Width</label>
                <div className="flex gap-2 flex-wrap">
                  {[240, 320, 480, 640].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setOpts((p) => ({ ...p, gifWidth: w }))}
                      className={[
                        'px-3 py-1.5 text-xs font-medium rounded border transition-all',
                        opts.gifWidth === w
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]',
                      ].join(' ')}
                    >
                      {w}px
                    </button>
                  ))}
                  <input
                    type="number"
                    min={100}
                    max={1920}
                    value={opts.gifWidth}
                    onChange={(e) => setOpts((p) => ({ ...p, gifWidth: Number(e.target.value) }))}
                    className="border border-[#E2E8F0] rounded-[4px] px-3 py-1.5 text-xs w-24 focus:outline-none focus:border-[#2563EB]"
                    placeholder="Custom"
                  />
                </div>
              </div>

              {/* Trim */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#0F172A]">Start Time (s)</label>
                  <input
                    type="number"
                    min={0}
                    max={videoFile.duration ? videoFile.duration - 0.1 : 9999}
                    step={0.1}
                    value={opts.startTime}
                    onChange={(e) => setOpts((p) => ({ ...p, startTime: Number(e.target.value) }))}
                    className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                    placeholder="0"
                  />
                  {videoFile.duration ? (
                    <p className="text-[11px] text-[#94A3B8]">Duration: {formatDuration(videoFile.duration)}</p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#0F172A]">End Time (s)</label>
                  <input
                    type="number"
                    min={0}
                    max={videoFile.duration ?? 9999}
                    step={0.1}
                    value={opts.endTime}
                    onChange={(e) => setOpts((p) => ({ ...p, endTime: e.target.value === '' ? '' : Number(e.target.value) }))}
                    className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                    placeholder="Full video"
                  />
                </div>
              </div>

              {/* Process button */}
              <button
                type="button"
                onClick={handleProcess}
                disabled={status === 'loading' || status === 'processing'}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Convert to GIF
              </button>
            </div>
          )}

          {/* Progress */}
          <ProcessingBar
            status={status}
            progress={progress}
            error={procError}
            label="Converting to GIF…"
          />

          {/* Result */}
          {status === 'done' && result && (
            <VideoDownloader
              url={result.url}
              filename={result.filename}
              size={result.size}
              originalSize={videoFile?.size}
              label="Download GIF"
              onReset={handleReset}
            />
          )}

          {/* Features */}
          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About Video to GIF Converter</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'All Video Formats', body: 'Convert MP4, MOV, AVI, WEBM, and MKV files to GIF.' },
                { title: 'Custom Frame Rate', body: 'Control GIF smoothness by setting FPS from 5 to 30.' },
                { title: 'Trim Before Convert', body: 'Select a start and end time to convert only the segment you need.' },
                { title: 'Custom Width', body: 'Choose 240, 320, 480, or 640px width, or enter a custom size.' },
                { title: 'Optimised Palette', body: 'Uses FFmpeg palettegen for better colour quality in the GIF.' },
                { title: 'Privacy First', body: 'Runs entirely in your browser — videos never leave your device.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-sm text-[#64748B] mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <VideoFAQ items={FAQS} pageUrl="https://ecomsathi.vercel.app/video/video-to-gif" />
        </div>
      </VideoToolLayout>
    </>
  )
}

export default VideoToGif
