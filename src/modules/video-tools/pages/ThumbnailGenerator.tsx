import React, { useState, useRef } from 'react'
import { Download, Play, Pause } from 'lucide-react'
import SEO from '@/components/common/SEO'
import VideoToolLayout from '../components/VideoToolLayout'
import VideoUploader from '../components/VideoUploader'
import VideoFAQ from '../components/VideoFAQ'
import { useVideoFile } from '../hooks/useVideoFile'
import { captureThumbnail } from '../utils/videoUtils'
import { formatDuration } from '../utils/formatBytes'
import type { FAQItem, RelatedTool } from '../types'

// ─── Constants ────────────────────────────────────────────────────────────────

const RELATED_TOOLS: RelatedTool[] = [
  { label: 'Frame Extractor',  to: '/video/frame-extractor', description: 'Extract many frames' },
  { label: 'Video to GIF',     to: '/video/video-to-gif',    description: 'Animate a clip' },
  { label: 'Compress Video',   to: '/video/compress',        description: 'Reduce file size' },
  { label: 'Resize Video',     to: '/video/resize',          description: 'Change resolution' },
  { label: 'Video Converter',  to: '/video/converter',       description: 'Change format' },
]

const FAQS: FAQItem[] = [
  {
    question: 'What format is the thumbnail saved as?',
    answer: 'Thumbnails are saved as high-quality JPEG images, compatible with all ecommerce platforms.',
  },
  {
    question: 'Can I pick any timestamp for the thumbnail?',
    answer: 'Yes. Use the scrubber or enter a specific time in seconds to capture the thumbnail at exactly the right moment.',
  },
  {
    question: 'What resolution is the thumbnail?',
    answer: 'The thumbnail is captured at the video\'s native resolution, up to a maximum width of 1280px.',
  },
  {
    question: 'Can I generate multiple thumbnails at different times?',
    answer: 'Yes. You can generate multiple thumbnails by moving the slider and clicking "Capture Thumbnail" each time.',
  },
  {
    question: 'Is my video sent to any server?',
    answer: 'No. Thumbnails are extracted directly in your browser using the HTML5 video API. No files are uploaded.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Video Thumbnail Generator',
  url: 'https://ecomsathi.vercel.app/video/thumbnail-generator',
  description: 'Extract the perfect thumbnail from your product video at any timestamp. Free online thumbnail generator.',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Thumbnail {
  url: string
  time: number
}

export const ThumbnailGenerator: React.FC = () => {
  const { videoFile, error: fileError, isLoading: fileLoading, onDrop, reset } = useVideoFile()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureError, setCaptureError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value)
    setCurrentTime(t)
    if (videoRef.current) {
      videoRef.current.currentTime = t
    }
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleCapture = async () => {
    if (!videoFile) return
    setIsCapturing(true)
    setCaptureError(null)
    try {
      const url = await captureThumbnail(videoFile.url, currentTime, 1280)
      if (!url) {
        setCaptureError('Failed to capture thumbnail. Try a different timestamp.')
        return
      }
      setThumbnails((prev) => [...prev, { url, time: currentTime }])
    } catch {
      setCaptureError('An error occurred during capture.')
    } finally {
      setIsCapturing(false)
    }
  }

  const downloadThumbnail = (thumb: Thumbnail, idx: number) => {
    const a = document.createElement('a')
    a.href = thumb.url
    const base = videoFile?.name.replace(/\.[^.]+$/, '') ?? 'thumbnail'
    a.download = `${base}_thumbnail_${String(idx + 1).padStart(2, '0')}.jpg`
    a.click()
  }

  const removeThumbnail = (idx: number) => {
    setThumbnails((prev) => {
      URL.revokeObjectURL(prev[idx].url)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const handleReset = () => {
    thumbnails.forEach((t) => URL.revokeObjectURL(t.url))
    setThumbnails([])
    setCurrentTime(0)
    setIsPlaying(false)
    reset()
  }

  const duration = videoFile?.duration ?? 0

  return (
    <>
      <SEO
        title="Video Thumbnail Generator Free — EcomSathi"
        description="Extract the perfect thumbnail from your product video at any timestamp. Free online video thumbnail generator. Save as JPEG for marketplace listings."
        keywords="video thumbnail generator, extract thumbnail from video, video screenshot free, product video thumbnail, thumbnail maker from video"
        canonicalUrl="https://ecomsathi.vercel.app/video/thumbnail-generator"
        schema={PAGE_SCHEMA}
      />

      <VideoToolLayout
        title="Video Thumbnail Generator"
        description="Extract the perfect product thumbnail from your video at any timestamp."
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

          {/* Video player + scrubber */}
          {videoFile && (
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] overflow-hidden flex flex-col gap-0">
              {/* Video element */}
              <video
                ref={videoRef}
                src={videoFile.url}
                className="w-full max-h-72 bg-black object-contain"
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                preload="metadata"
              />

              {/* Controls */}
              <div className="px-4 py-3 flex flex-col gap-3">
                {/* Play + time */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center hover:bg-[#1D4ED8] transition-colors shrink-0"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <span className="text-xs font-mono text-[#64748B] w-24 shrink-0">
                    {formatDuration(currentTime)} / {formatDuration(duration)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={handleScrub}
                    className="flex-1 accent-[#2563EB]"
                    aria-label="Seek video"
                  />
                </div>

                {/* Direct time input */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-[#0F172A] shrink-0">
                    Capture at
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={duration || 9999}
                    step={0.1}
                    value={currentTime.toFixed(1)}
                    onChange={(e) => {
                      const t = Math.min(Number(e.target.value), duration)
                      setCurrentTime(t)
                      if (videoRef.current) videoRef.current.currentTime = t
                    }}
                    className="border border-[#E2E8F0] rounded-[4px] px-3 py-1.5 text-sm w-24 focus:outline-none focus:border-[#2563EB]"
                  />
                  <span className="text-sm text-[#64748B]">seconds</span>
                </div>

                {captureError && (
                  <p className="text-sm text-[#DC2626]">{captureError}</p>
                )}

                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={isCapturing}
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCapturing ? 'Capturing…' : 'Capture Thumbnail'}
                </button>
              </div>
            </div>
          )}

          {/* Thumbnails gallery */}
          {thumbnails.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#0F172A]">
                  {thumbnails.length} thumbnail{thumbnails.length !== 1 ? 's' : ''} captured
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {thumbnails.map((thumb, idx) => (
                  <div
                    key={idx}
                    className="group relative border border-[#E2E8F0] rounded-[6px] overflow-hidden bg-black"
                  >
                    <img
                      src={thumb.url}
                      alt={`Thumbnail at ${formatDuration(thumb.time)}`}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => downloadThumbnail(thumb, idx)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white text-[#0F172A] rounded"
                      >
                        <Download size={11} />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => removeThumbnail(idx)}
                        className="px-2 py-1 text-xs font-medium bg-[#DC2626] text-white rounded"
                      >
                        ✕
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
                      {formatDuration(thumb.time)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Download all */}
              {thumbnails.length > 1 && (
                <button
                  type="button"
                  onClick={() => thumbnails.forEach((t, i) => setTimeout(() => downloadThumbnail(t, i), i * 100))}
                  className="inline-flex items-center gap-2 self-start px-5 py-2 text-sm font-medium bg-[#16A34A] text-white rounded-[4px] hover:bg-[#15803D] transition-colors"
                >
                  <Download size={14} />
                  Download All {thumbnails.length} Thumbnails
                </button>
              )}
            </div>
          )}

          {/* Features */}
          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About Thumbnail Generator</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Precise Scrubbing', body: 'Drag the timeline or enter a specific second to capture thumbnails at the exact right moment.' },
                { title: 'JPEG Output',       body: 'Thumbnails are saved as high-quality JPEG at the video\'s native resolution (up to 1280px wide).' },
                { title: 'Multiple Captures', body: 'Capture as many thumbnails as you need from different timestamps in a single session.' },
                { title: 'Video Preview',     body: 'Play or pause the video directly in the tool to find the perfect frame visually.' },
                { title: 'Browser Based',     body: 'No server upload needed. Thumbnails are extracted using the HTML5 canvas API.' },
                { title: 'All Formats',       body: 'Works with MP4, MOV, AVI, WEBM, and MKV videos.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-sm text-[#64748B] mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <VideoFAQ items={FAQS} pageUrl="https://ecomsathi.vercel.app/video/thumbnail-generator" />
        </div>
      </VideoToolLayout>
    </>
  )
}

export default ThumbnailGenerator
