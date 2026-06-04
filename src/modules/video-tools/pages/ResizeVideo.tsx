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
import { resizeVideo, toObjectURL } from '../services/ffmpegService'
import type { FAQItem, RelatedTool } from '../types'

// ─── Constants ────────────────────────────────────────────────────────────────

const RELATED_TOOLS: RelatedTool[] = [
  { label: 'Compress Video',      to: '/tools/video/compress',            description: 'Reduce file size' },
  { label: 'Video Converter',     to: '/tools/video/converter',           description: 'Change format' },
  { label: 'Thumbnail Generator', to: '/tools/video/thumbnail-generator', description: 'Extract thumbnail' },
  { label: 'Video to GIF',        to: '/tools/video/to-gif',        description: 'Convert to GIF' },
  { label: 'Frame Extractor',     to: '/tools/video/frame-extractor',     description: 'Extract frames' },
]

const PRESETS = [
  { label: '1080p',      width: 1920, height: 1080 },
  { label: '720p',       width: 1280, height: 720  },
  { label: '480p',       width: 854,  height: 480  },
  { label: '360p',       width: 640,  height: 360  },
  { label: 'Square 1:1', width: 1080, height: 1080 },
  { label: '9:16 Reel',  width: 1080, height: 1920 },
  { label: '4:3 Classic',width: 1024, height: 768  },
]

const MARKETPLACE_SIZES = [
  { label: 'Amazon Product Video', width: 1280, height: 720,  note: '720p MP4' },
  { label: 'Flipkart Video',       width: 1280, height: 720,  note: 'Max 30s' },
  { label: 'Instagram Reels',      width: 1080, height: 1920, note: '9:16' },
  { label: 'YouTube Shorts',       width: 1080, height: 1920, note: '9:16 vertical' },
  { label: 'Facebook Video',       width: 1280, height: 720,  note: '16:9 landscape' },
]

const FAQS: FAQItem[] = [
  {
    question: 'Does resizing reduce video quality?',
    answer: 'Downscaling (reducing resolution) generally keeps quality acceptable. Upscaling (increasing resolution) may blur the video as you are adding pixels that did not exist.',
  },
  {
    question: 'What is the output format after resizing?',
    answer: 'The output is always MP4 (H.264) for maximum compatibility across devices and platforms.',
  },
  {
    question: 'Can I resize to any custom resolution?',
    answer: 'Yes. Enter a custom width and height. The tool will scale the video while maintaining the original aspect ratio and pad with black bars if needed.',
  },
  {
    question: 'What resolution does Amazon require for product videos?',
    answer: 'Amazon recommends 1280×720 (720p) at a minimum for product videos, up to 1920×1080 (1080p).',
  },
  {
    question: 'Is my video sent to a server?',
    answer: 'No. Resizing runs entirely in your browser using FFmpeg WebAssembly. Your video never leaves your device.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Video Resizer',
  url: 'https://ecomsathi.vercel.app/video/resize',
  description: 'Resize video to specific dimensions or aspect ratio. Free online video resizer. Change resolution for marketplace requirements.',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ResizeResult {
  url: string
  size: number
  filename: string
}

export const ResizeVideo: React.FC = () => {
  const { videoFile, error: fileError, isLoading: fileLoading, onDrop, reset } = useVideoFile()
  const { status, progress, error: procError, result, run, reset: resetProc } = useFFmpeg<ResizeResult>()

  const [width, setWidth] = useState<number>(1280)
  const [height, setHeight] = useState<number>(720)
  const [activeTab, setActiveTab] = useState<'preset' | 'marketplace' | 'custom'>('preset')

  const applyPreset = (w: number, h: number) => {
    setWidth(w)
    setHeight(h)
  }

  const handleProcess = async () => {
    if (!videoFile) return
    await run(async (onProgress) => {
      const task = await resizeVideo(videoFile.file, width, height, onProgress)
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
        title="Resize Video Online Free — EcomSathi"
        description="Resize video to specific dimensions or aspect ratio. Free online video resizer. Change video resolution for Amazon, Flipkart and other marketplace requirements."
        keywords="resize video online free, video resolution changer, mp4 resizer, change video dimensions, video resolution converter, resize video for amazon"
        canonicalUrl="https://ecomsathi.vercel.app/video/resize"
        schema={PAGE_SCHEMA}
      />

      <VideoToolLayout
        title="Resize Video"
        description="Change video resolution or aspect ratio to meet marketplace requirements."
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
              <h2 className="text-sm font-semibold text-[#0F172A]">Resize Options</h2>

              {/* Tabs */}
              <div className="flex gap-1 bg-[#F1F5F9] p-1 rounded-[6px] w-fit">
                {(['preset', 'marketplace', 'custom'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={[
                      'px-3 py-1.5 text-xs font-medium rounded-[4px] capitalize transition-all',
                      activeTab === tab
                        ? 'bg-white text-[#0F172A] shadow-sm'
                        : 'text-[#64748B] hover:text-[#0F172A]',
                    ].join(' ')}
                  >
                    {tab === 'marketplace' ? 'Marketplace' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {activeTab === 'preset' && (
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p.width, p.height)}
                      className={[
                        'flex flex-col gap-0.5 px-4 py-2 border rounded-[6px] text-left transition-all',
                        width === p.width && height === p.height
                          ? 'border-[#2563EB] bg-[#EFF6FF]'
                          : 'border-[#E2E8F0] bg-white hover:border-[#2563EB]',
                      ].join(' ')}
                    >
                      <span className="text-xs font-semibold text-[#0F172A]">{p.label}</span>
                      <span className="text-[11px] text-[#64748B]">{p.width}×{p.height}</span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'marketplace' && (
                <div className="flex flex-col gap-2">
                  {MARKETPLACE_SIZES.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => applyPreset(m.width, m.height)}
                      className={[
                        'flex items-center justify-between px-4 py-3 border rounded-[6px] transition-all',
                        width === m.width && height === m.height
                          ? 'border-[#2563EB] bg-[#EFF6FF]'
                          : 'border-[#E2E8F0] bg-white hover:border-[#2563EB]',
                      ].join(' ')}
                    >
                      <span className="text-sm font-medium text-[#0F172A]">{m.label}</span>
                      <div className="flex items-center gap-3 text-xs text-[#64748B]">
                        <span>{m.width}×{m.height}</span>
                        <span className="text-[#94A3B8]">{m.note}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-[#0F172A]">Width (px)</label>
                    <input
                      type="number"
                      min={64}
                      max={4096}
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-[#0F172A]">Height (px)</label>
                    <input
                      type="number"
                      min={64}
                      max={4096}
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="border border-[#E2E8F0] rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>
              )}

              {/* Current selection display */}
              <div className="flex items-center gap-2 text-sm text-[#64748B] bg-[#F8FAFC] rounded-[4px] px-3 py-2">
                Target resolution:
                <strong className="text-[#0F172A]">{width}×{height}</strong>
              </div>

              <button
                type="button"
                onClick={handleProcess}
                disabled={status === 'loading' || status === 'processing'}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Resize Video
              </button>
            </div>
          )}

          {/* Progress */}
          <ProcessingBar
            status={status}
            progress={progress}
            error={procError}
            label="Resizing video…"
          />

          {/* Result */}
          {status === 'done' && result && (
            <VideoDownloader
              url={result.url}
              filename={result.filename}
              size={result.size}
              originalSize={videoFile?.size}
              label="Download Resized Video"
              onReset={handleReset}
            />
          )}

          {/* Features */}
          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About Video Resizer</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Marketplace Presets', body: 'One-click presets for Amazon, Flipkart, Instagram Reels, YouTube Shorts, and Facebook.' },
                { title: 'Standard Presets',    body: '1080p, 720p, 480p, 360p, 1:1 Square, 9:16 Vertical and 4:3 Classic presets.' },
                { title: 'Custom Resolution',   body: 'Enter any width and height. Auto-pads with black bars to maintain aspect ratio.' },
                { title: 'H.264 Output',        body: 'Output is MP4 with H.264 for maximum device compatibility.' },
                { title: 'Aspect Ratio Safe',   body: 'Never stretches or distorts your video — adds padding only when needed.' },
                { title: 'Private Processing',  body: 'Runs in your browser. No uploads, no server — complete privacy.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-sm text-[#64748B] mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <VideoFAQ items={FAQS} pageUrl="https://ecomsathi.vercel.app/video/resize" />
        </div>
      </VideoToolLayout>
    </>
  )
}

export default ResizeVideo
