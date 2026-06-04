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
import { compressVideo, toObjectURL } from '../services/ffmpegService'
import type { FAQItem, RelatedTool, VideoQuality } from '../types'

// ─── Constants ────────────────────────────────────────────────────────────────

const RELATED_TOOLS: RelatedTool[] = [
  { label: 'Resize Video',        to: '/tools/video/resize',              description: 'Change resolution' },
  { label: 'Video Converter',     to: '/tools/video/converter',           description: 'Change format' },
  { label: 'Video to GIF',        to: '/tools/video/to-gif',        description: 'Convert to GIF' },
  { label: 'Thumbnail Generator', to: '/tools/video/thumbnail-generator', description: 'Extract thumbnail' },
  { label: 'Frame Extractor',     to: '/tools/video/frame-extractor',     description: 'Extract frames' },
]

const FAQS: FAQItem[] = [
  {
    question: 'How much can I compress a video?',
    answer: 'Typical compression can reduce video size by 40–80% depending on the original encoding and quality setting you choose.',
  },
  {
    question: 'Will compressing reduce video quality?',
    answer: 'The High quality preset (CRF 18) is virtually lossless. Medium (CRF 26) and Low (CRF 34) reduce quality further for smaller files.',
  },
  {
    question: 'What formats are supported for compression?',
    answer: 'You can compress MP4, MOV, AVI, WEBM, and MKV videos. The output is always MP4 (H.264) for maximum compatibility.',
  },
  {
    question: 'Why does compression take a while?',
    answer: 'Video compression runs entirely in your browser using WebAssembly. It is CPU-intensive, and longer or larger videos take more time.',
  },
  {
    question: 'What is CRF?',
    answer: 'CRF (Constant Rate Factor) is an FFmpeg quality setting. Lower values (like 18) produce better quality and larger files. Higher values (like 34) produce smaller files with more quality loss.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Video Compressor',
  url: 'https://ecomsathi.vercel.app/video/compress',
  description: 'Compress MP4 and other video files online for free. Reduce video file size for ecommerce listings and social media.',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CompressResult {
  url: string
  size: number
  filename: string
}

export const CompressVideo: React.FC = () => {
  const { videoFile, error: fileError, isLoading: fileLoading, onDrop, reset } = useVideoFile()
  const { status, progress, error: procError, result, run, reset: resetProc } = useFFmpeg<CompressResult>()

  const [quality, setQuality] = useState<VideoQuality>('medium')

  const handleProcess = async () => {
    if (!videoFile) return
    await run(async (onProgress) => {
      const task = await compressVideo(videoFile.file, { quality }, onProgress)
      const url = toObjectURL(task.result, task.mimeType)
      return { url, size: task.result.byteLength, filename: task.outputName }
    })
  }

  const handleReset = () => {
    if (result) URL.revokeObjectURL(result.url)
    resetProc()
    reset()
  }

  const QUALITY_OPTIONS: { value: VideoQuality; label: string; crf: string; note: string }[] = [
    { value: 'high',   label: 'High',   crf: 'CRF 18', note: 'Best quality, larger file' },
    { value: 'medium', label: 'Medium', crf: 'CRF 26', note: 'Balanced (recommended)' },
    { value: 'low',    label: 'Low',    crf: 'CRF 34', note: 'Smallest file, lower quality' },
  ]

  return (
    <>
      <SEO
        title="Compress Video Online Free — EcomSathi"
        description="Compress MP4 and other video files online for free. Reduce video file size for ecommerce listings and social media without losing too much quality."
        keywords="compress video online free, video compressor, reduce video size, mp4 compressor online, video file size reducer, compress video for upload"
        canonicalUrl="https://ecomsathi.vercel.app/video/compress"
        schema={PAGE_SCHEMA}
      />

      <VideoToolLayout
        title="Compress Video"
        description="Reduce video file size for marketplace uploads, email, and social media."
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
              <h2 className="text-sm font-semibold text-[#0F172A]">Compression Options</h2>

              {/* Quality selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#0F172A]">Quality Preset</label>
                <div className="grid grid-cols-3 gap-3">
                  {QUALITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setQuality(opt.value)}
                      className={[
                        'flex flex-col gap-1 p-3 border rounded-[6px] text-left transition-all',
                        quality === opt.value
                          ? 'border-[#2563EB] bg-[#EFF6FF]'
                          : 'border-[#E2E8F0] bg-white hover:border-[#2563EB]',
                      ].join(' ')}
                    >
                      <span className="text-sm font-semibold text-[#0F172A]">{opt.label}</span>
                      <span className="text-xs font-mono text-[#2563EB]">{opt.crf}</span>
                      <span className="text-[11px] text-[#64748B]">{opt.note}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleProcess}
                disabled={status === 'loading' || status === 'processing'}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Compress Video
              </button>
            </div>
          )}

          {/* Progress */}
          <ProcessingBar
            status={status}
            progress={progress}
            error={procError}
            label="Compressing video…"
          />

          {/* Result */}
          {status === 'done' && result && (
            <VideoDownloader
              url={result.url}
              filename={result.filename}
              size={result.size}
              originalSize={videoFile?.size}
              label="Download Compressed Video"
              onReset={handleReset}
            />
          )}

          {/* Features */}
          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About Video Compressor</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'H.264 Encoding',        body: 'Output uses libx264 — the most compatible codec for all devices and browsers.' },
                { title: '3 Quality Presets',      body: 'High (CRF 18), Medium (CRF 26), and Low (CRF 34) presets for different needs.' },
                { title: 'Supports All Formats',   body: 'Compress MP4, MOV, AVI, WEBM, MKV. Output is always MP4.' },
                { title: 'Up to 80% Size Reduction', body: 'Typical compression ratios of 40–80% without visible quality loss on Medium.' },
                { title: 'Browser Powered',        body: 'FFmpeg WebAssembly runs entirely in your browser. Nothing is uploaded.' },
                { title: 'Ecommerce Ready',        body: 'Perfect for Amazon, Flipkart, Meesho product video size requirements.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-sm text-[#64748B] mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <VideoFAQ items={FAQS} pageUrl="https://ecomsathi.vercel.app/video/compress" />
        </div>
      </VideoToolLayout>
    </>
  )
}

export default CompressVideo
