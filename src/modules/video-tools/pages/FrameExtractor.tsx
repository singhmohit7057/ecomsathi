import React, { useState } from 'react'
import { Download, Image as ImageIcon } from 'lucide-react'
import SEO from '@/components/common/SEO'
import VideoToolLayout from '../components/VideoToolLayout'
import VideoUploader from '../components/VideoUploader'
import VideoPreview from '../components/VideoPreview'
import VideoFAQ from '../components/VideoFAQ'
import { useVideoFile } from '../hooks/useVideoFile'
import { extractFrames as extractFramesClient } from '../utils/videoUtils'
import type { FAQItem } from '../types'

// ─── Constants ────────────────────────────────────────────────────────────────


const FAQS: FAQItem[] = [
  {
    question: 'What formats can I extract frames from?',
    answer: 'You can extract frames from MP4, MOV, AVI, WEBM, and MKV video files.',
  },
  {
    question: 'What format are the extracted frames saved as?',
    answer: 'Extracted frames are saved as high-quality JPEG images.',
  },
  {
    question: 'How many frames can I extract?',
    answer: 'You can extract up to 30 frames per session. Adjust the interval to control how many frames are extracted.',
  },
  {
    question: 'What is the frame interval?',
    answer: 'The frame interval controls how often a frame is captured. For example, an interval of 2 captures one frame every 2 seconds.',
  },
  {
    question: 'Is my video uploaded to a server?',
    answer: 'No. Frames are extracted directly in your browser using the HTML5 video API. Your video never leaves your device.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Video Frame Extractor',
  url: 'https://ecomsathi.vercel.app/video/frame-extractor',
  description: 'Extract individual frames from any video file as JPEG images. Free online video frame extractor.',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ExtractOptions {
  frameCount: number
  maxWidth: number
}

export const FrameExtractor: React.FC = () => {
  const { videoFile, error: fileError, isLoading: fileLoading, onDrop, reset } = useVideoFile()

  const [opts, setOpts] = useState<ExtractOptions>({ frameCount: 10, maxWidth: 640 })
  const [frames, setFrames] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [procError, setProcError] = useState<string | null>(null)

  const handleExtract = async () => {
    if (!videoFile) return
    setIsProcessing(true)
    setProcError(null)
    setFrames([])
    try {
      const extracted = await extractFramesClient(videoFile.url, opts.frameCount, opts.maxWidth)
      setFrames(extracted)
      if (extracted.length === 0) {
        setProcError('No frames could be extracted. Try a different video or longer duration.')
      }
    } catch {
      setProcError('Failed to extract frames. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    frames.forEach((f) => URL.revokeObjectURL(f))
    setFrames([])
    setProcError(null)
    reset()
  }

  const downloadFrame = (url: string, idx: number) => {
    const a = document.createElement('a')
    a.href = url
    const baseName = videoFile?.name.replace(/\.[^.]+$/, '') ?? 'frame'
    a.download = `${baseName}_frame_${String(idx + 1).padStart(3, '0')}.jpg`
    a.click()
  }

  const downloadAll = () => {
    frames.forEach((url, idx) => {
      setTimeout(() => downloadFrame(url, idx), idx * 120)
    })
  }

  return (
    <>
      <SEO
        title="Extract Frames from Video Free — EcomSathi"
        description="Extract individual frames from MP4, MOV, AVI, WEBM, MKV videos as JPEG images. Free online video frame extractor. Perfect for product thumbnail creation."
        keywords="extract frames from video, video to images free, video frame extractor online, screenshot from video, frame capture from video"
        canonicalUrl="https://ecomsathi.vercel.app/video/frame-extractor"
        schema={PAGE_SCHEMA}
      />

      <VideoToolLayout
        title="Video Frame Extractor"
        description="Extract individual frames from any video as high-quality JPEG images."
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
          {videoFile && frames.length === 0 && (
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 flex flex-col gap-5">
              <h2 className="text-sm font-semibold text-[#0F172A]">Extraction Options</h2>

              {/* Frame count */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#0F172A]">Number of Frames</label>
                  <span className="text-sm font-semibold text-[#2563EB]">{opts.frameCount}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={opts.frameCount}
                  onChange={(e) => setOpts((p) => ({ ...p, frameCount: Number(e.target.value) }))}
                  className="w-full accent-[#2563EB]"
                />
                <div className="flex justify-between text-[11px] text-[#94A3B8]">
                  <span>1 frame</span>
                  <span>30 frames</span>
                </div>
              </div>

              {/* Output width */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Output Width</label>
                <div className="flex gap-2 flex-wrap">
                  {[320, 640, 1280].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setOpts((p) => ({ ...p, maxWidth: w }))}
                      className={[
                        'px-3 py-1.5 text-xs font-medium rounded border transition-all',
                        opts.maxWidth === w
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]',
                      ].join(' ')}
                    >
                      {w}px
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setOpts((p) => ({ ...p, maxWidth: videoFile.width ?? 1920 }))}
                    className={[
                      'px-3 py-1.5 text-xs font-medium rounded border transition-all',
                      opts.maxWidth === (videoFile.width ?? 1920)
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]',
                    ].join(' ')}
                  >
                    Original
                  </button>
                </div>
              </div>

              {procError && (
                <p className="text-sm text-[#DC2626]">{procError}</p>
              )}

              <button
                type="button"
                onClick={handleExtract}
                disabled={isProcessing}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Extracting…' : `Extract ${opts.frameCount} Frames`}
              </button>
            </div>
          )}

          {/* Processing spinner */}
          {isProcessing && (
            <div className="flex items-center gap-3 text-sm text-[#64748B] bg-white border border-[#E2E8F0] rounded-[6px] p-4">
              <div className="w-5 h-5 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin shrink-0" />
              Extracting frames…
            </div>
          )}

          {/* Frames grid */}
          {frames.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#0F172A]">
                  {frames.length} frame{frames.length !== 1 ? 's' : ''} extracted
                </h2>
                <button
                  type="button"
                  onClick={downloadAll}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#16A34A] text-white rounded-[4px] hover:bg-[#15803D] transition-colors"
                >
                  <Download size={13} />
                  Download All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {frames.map((url, idx) => (
                  <div key={idx} className="group relative border border-[#E2E8F0] rounded-[6px] overflow-hidden bg-black">
                    <img
                      src={url}
                      alt={`Frame ${idx + 1}`}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => downloadFrame(url, idx)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white text-[#0F172A] rounded"
                      >
                        <Download size={11} />
                        Save
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-[#64748B] hover:text-[#0F172A] underline self-start"
              >
                Extract from another video
              </button>
            </div>
          )}

          {/* Features */}
          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About Frame Extractor</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: <ImageIcon size={15} />, title: 'JPEG Output', body: 'Frames are saved as high-quality JPEG images, compatible with all marketplaces.' },
                { icon: <Download size={15} />, title: 'Download All', body: 'Download all extracted frames with a single click in one batch.' },
                { icon: null, title: 'Custom Frame Count', body: 'Extract 1 to 30 frames evenly spread across the video duration.' },
                { icon: null, title: 'Custom Width', body: 'Choose output width: 320px, 640px, 1280px, or original resolution.' },
                { icon: null, title: 'Browser Based', body: 'Runs entirely in your browser using the HTML5 video API. No server uploads.' },
                { icon: null, title: 'Product Thumbnails', body: 'Ideal for creating product thumbnails, social media images, and listing previews.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-sm text-[#64748B] mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <VideoFAQ items={FAQS} pageUrl="https://ecomsathi.vercel.app/video/frame-extractor" />
        </div>
      </VideoToolLayout>
    </>
  )
}

export default FrameExtractor
