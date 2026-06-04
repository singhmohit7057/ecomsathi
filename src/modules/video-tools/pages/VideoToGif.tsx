import React, { useState } from 'react'
import SEO from '@/components/common/SEO'
import VideoToolLayout from '../components/VideoToolLayout'
import VideoUploader from '../components/VideoUploader'
import ProcessingBar from '../components/ProcessingBar'
import VideoDownloader from '../components/VideoDownloader'
import VideoFAQ from '../components/VideoFAQ'
import { useVideoFile } from '../hooks/useVideoFile'
import { useFFmpeg } from '../hooks/useFFmpeg'
import { videoToGif, toObjectURL } from '../services/ffmpegService'
import { formatDuration, formatBytes } from '../utils/formatBytes'
import type { FAQItem, RelatedTool } from '../types'

const RELATED_TOOLS: RelatedTool[] = [
  { label: 'Frame Extractor',     to: '/tools/video/frame-extractor',     description: 'Extract frames as images' },
  { label: 'Compress Video',      to: '/tools/video/compress',             description: 'Reduce video file size' },
  { label: 'Thumbnail Generator', to: '/tools/video/thumbnail-generator', description: 'Extract video thumbnails' },
  { label: 'Video Converter',     to: '/tools/video/converter',           description: 'Convert to MP4, WEBM, AVI…' },
  { label: 'Resize Video',        to: '/tools/video/resize',              description: 'Change resolution' },
]

const FAQS: FAQItem[] = [
  {
    question: 'What video formats can I convert to GIF?',
    answer: 'You can convert MP4, MOV, AVI, WEBM, and MKV video files to animated GIF.',
  },
  {
    question: 'How do I control the GIF quality?',
    answer: 'You can set the frame rate (FPS) and output width. Higher FPS and larger width produce smoother, larger GIFs.',
  },
  {
    question: 'Can I convert only a part of the video to GIF?',
    answer: 'Yes. Set a start and end time to convert only the selected segment of your video to GIF.',
  },
  {
    question: 'Why is my GIF file so large?',
    answer: 'GIFs are uncompressed per frame. Use a lower width (240–320px) and lower FPS (8–10) to keep the file size manageable.',
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
  url: 'https://ecomsathi.vercel.app/tools/video/to-gif',
  description: 'Free online video to GIF converter. Convert MP4, MOV, AVI, WEBM and MKV clips to animated GIF in your browser.',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

const WIDTH_PRESETS = [240, 320, 480, 640] as const

interface GifResult {
  url: string
  size: number
  filename: string
}

export const VideoToGif: React.FC = () => {
  const { videoFile, error: fileError, isLoading: fileLoading, onDrop, reset } = useVideoFile()
  const { status, progress, error: procError, result, run, reset: resetProc } = useFFmpeg<GifResult>()

  const [fps, setFps]                 = useState(10)
  const [gifWidth, setGifWidth]       = useState(480)
  const [customWidth, setCustomWidth] = useState('')   // only set when user types custom
  const [startTime, setStartTime]     = useState(0)
  const [endTime, setEndTime]         = useState<number | ''>('')

  const handleWidthPreset = (w: number) => {
    setGifWidth(w)
    setCustomWidth('')   // clear custom when preset chosen
  }

  const handleCustomWidth = (val: string) => {
    setCustomWidth(val)
    const n = parseInt(val, 10)
    if (!isNaN(n) && n >= 100 && n <= 1920) setGifWidth(n)
  }

  const handleProcess = async () => {
    if (!videoFile) return
    await run(async (onProgress) => {
      const task = await videoToGif(
        videoFile.file,
        {
          gifFps: fps,
          gifWidth,
          startTime,
          endTime: endTime !== '' ? Number(endTime) : undefined,
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
    setFps(10)
    setGifWidth(480)
    setCustomWidth('')
    setStartTime(0)
    setEndTime('')
  }

  const duration = videoFile?.duration ?? 0

  return (
    <>
      <SEO
        title="Video to GIF Converter Free — EcomSathi"
        description="Convert video clips to animated GIF free online. MP4, MOV, AVI to GIF converter. Set frame rate, width, and trim. Perfect for product showcase animations."
        keywords="video to gif converter free, mp4 to gif online, convert video to gif, animated gif maker, product video to gif, webm to gif"
        canonicalUrl="https://ecomsathi.vercel.app/tools/video/to-gif"
        schema={PAGE_SCHEMA}
      />

      <VideoToolLayout
        title="Video to GIF Converter"
        description="Convert video clips to animated GIF for ecommerce product listings and social media."
        relatedTools={RELATED_TOOLS}
      >
        <div className="flex flex-col gap-6">

          {/* ── Upload ── */}
          <VideoUploader
            videoFile={videoFile}
            isLoading={fileLoading}
            error={fileError}
            onDrop={onDrop}
            onReset={handleReset}
          />

          {/* ── Video preview with clean player ── */}
          {videoFile && (
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] overflow-hidden">
              <video
                src={videoFile.url}
                controls
                preload="metadata"
                className="w-full max-h-56 bg-black object-contain block"
              />
              <div className="px-4 py-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#64748B] border-t border-[#F1F5F9]">
                <span>
                  <span className="text-[#94A3B8]">File: </span>
                  <strong className="text-[#0F172A]">{videoFile.name}</strong>
                </span>
                <span>
                  <span className="text-[#94A3B8]">Size: </span>
                  <strong className="text-[#0F172A]">{formatBytes(videoFile.size)}</strong>
                </span>
                {videoFile.width && videoFile.height && (
                  <span>
                    <span className="text-[#94A3B8]">Resolution: </span>
                    <strong className="text-[#0F172A]">{videoFile.width}×{videoFile.height}</strong>
                  </span>
                )}
                {duration > 0 && (
                  <span>
                    <span className="text-[#94A3B8]">Duration: </span>
                    <strong className="text-[#0F172A]">{formatDuration(duration)}</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── GIF Options ── */}
          {videoFile && status !== 'done' && (
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 flex flex-col gap-5">
              <h2 className="text-sm font-semibold text-[#0F172A]">GIF Options</h2>

              {/* Frame Rate */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#0F172A]">Frame Rate</label>
                  <span className="text-sm font-semibold text-[#2563EB]">{fps} FPS</span>
                </div>
                <input
                  type="range" min={5} max={30} step={1} value={fps}
                  onChange={(e) => setFps(Number(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
                <div className="flex justify-between text-[11px] text-[#94A3B8]">
                  <span>Smaller file (5 FPS)</span>
                  <span>Smoother (30 FPS)</span>
                </div>
              </div>

              {/* GIF Width — preset buttons + dedicated custom input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#0F172A]">
                  GIF Width
                  <span className="ml-2 text-xs font-normal text-[#2563EB]">{gifWidth}px</span>
                </label>
                <div className="flex gap-2 flex-wrap items-center">
                  {WIDTH_PRESETS.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => handleWidthPreset(w)}
                      className={[
                        'px-3 py-1.5 text-xs font-medium rounded-[4px] border transition-all',
                        gifWidth === w && customWidth === ''
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]',
                      ].join(' ')}
                    >
                      {w}px
                    </button>
                  ))}
                  <div className="flex items-center gap-1 border border-[#E2E8F0] rounded-[4px] overflow-hidden focus-within:border-[#2563EB]">
                    <input
                      type="number"
                      min={100}
                      max={1920}
                      value={customWidth}
                      onChange={(e) => handleCustomWidth(e.target.value)}
                      placeholder="Custom"
                      className="px-3 py-1.5 text-xs w-20 focus:outline-none"
                    />
                    <span className="pr-2 text-xs text-[#94A3B8]">px</span>
                  </div>
                </div>
              </div>

              {/* Trim range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#0F172A]">Start Time (s)</label>
                  <input
                    type="number" min={0} step={0.1}
                    max={duration > 0 ? duration - 0.1 : 9999}
                    value={startTime}
                    onChange={(e) => setStartTime(Number(e.target.value))}
                    className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                    placeholder="0"
                  />
                  {duration > 0 && (
                    <p className="text-[11px] text-[#94A3B8]">Duration: {formatDuration(duration)}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#0F172A]">End Time (s)</label>
                  <input
                    type="number" min={0} step={0.1}
                    max={duration > 0 ? duration : 9999}
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value === '' ? '' : Number(e.target.value))}
                    className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                    placeholder="Full video"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="text-xs text-[#64748B] bg-[#F8FAFC] rounded-[4px] px-3 py-2">
                GIF will be <strong className="text-[#0F172A]">{gifWidth}px wide at {fps} FPS</strong>
                {endTime !== '' && Number(endTime) > startTime
                  ? ` · clip from ${startTime}s to ${endTime}s`
                  : ' · full video'}
              </div>

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

          {/* ── Progress ── */}
          <ProcessingBar
            status={status}
            progress={progress}
            error={procError}
            label="Converting to GIF… (two-pass palette encoding)"
          />

          {/* ── GIF result preview + download ── */}
          {status === 'done' && result && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] p-4 flex justify-center">
                <img
                  src={result.url}
                  alt="Generated animated GIF"
                  className="max-h-64 max-w-full object-contain rounded"
                />
              </div>
              <VideoDownloader
                url={result.url}
                filename={result.filename}
                size={result.size}
                originalSize={videoFile?.size}
                label="Download GIF"
                onReset={handleReset}
              />
            </div>
          )}

          {/* ── Features ── */}
          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About Video to GIF Converter</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'All Video Formats',   body: 'Convert MP4, MOV, AVI, WEBM, and MKV files to GIF.' },
                { title: 'Custom Frame Rate',   body: 'Control GIF smoothness by setting FPS from 5 to 30.' },
                { title: 'Trim Before Convert', body: 'Set a start and end time to convert only the segment you need.' },
                { title: 'Custom Width',        body: 'Choose 240, 320, 480, or 640px, or type any custom width.' },
                { title: 'Two-Pass Palette',    body: 'Two-pass palettegen produces sharp colours and smaller file sizes.' },
                { title: 'Privacy First',       body: 'Runs entirely in your browser — videos never leave your device.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-sm text-[#64748B] mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── FAQ ── */}
          <VideoFAQ items={FAQS} pageUrl="https://ecomsathi.vercel.app/tools/video/to-gif" />
        </div>
      </VideoToolLayout>
    </>
  )
}

export default VideoToGif
