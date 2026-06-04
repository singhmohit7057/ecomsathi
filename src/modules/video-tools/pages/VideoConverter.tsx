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
import { convertVideo, toObjectURL } from '../services/ffmpegService'
import type { FAQItem, VideoFormat, VideoQuality } from '../types'

// ─── Constants ────────────────────────────────────────────────────────────────


const FORMAT_DETAILS: Record<VideoFormat, { label: string; note: string; accentClass: string }> = {
  mp4:  { label: 'MP4',  note: 'Most compatible, recommended',   accentClass: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]' },
  webm: { label: 'WEBM', note: 'Best for web browsers',          accentClass: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]' },
  mov:  { label: 'MOV',  note: 'Apple / macOS native',           accentClass: 'bg-[#FDF4FF] text-[#9333EA] border-[#E9D5FF]' },
  avi:  { label: 'AVI',  note: 'Windows Media Player format',    accentClass: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' },
  mkv:  { label: 'MKV',  note: 'Container with many codecs',     accentClass: 'bg-[#FFF1F2] text-[#DC2626] border-[#FFE4E6]' },
}

const FAQS: FAQItem[] = [
  {
    question: 'Which video format should I use for Amazon listings?',
    answer: 'Amazon recommends MP4 (H.264) format for product videos. Use a resolution of at least 1280×720 (720p).',
  },
  {
    question: 'Can I convert MOV to MP4?',
    answer: 'Yes. Upload your MOV file, select MP4 as the target format, and click Convert. The output will be a universally compatible MP4 file.',
  },
  {
    question: 'What is the difference between WEBM and MP4?',
    answer: 'WEBM is an open format designed for web use and tends to have smaller file sizes. MP4 (H.264) has broader device compatibility. For ecommerce, MP4 is recommended.',
  },
  {
    question: 'How long does video conversion take?',
    answer: 'Conversion time depends on video length and file size. Short clips (under 60 seconds) typically convert in 1–3 minutes in the browser.',
  },
  {
    question: 'Is my video kept private during conversion?',
    answer: 'Yes. The conversion runs entirely in your browser using FFmpeg WebAssembly. No files are uploaded to any server.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Video Format Converter',
  url: 'https://ecomsathi.vercel.app/video/converter',
  description: 'Convert between MP4, MOV, AVI, WEBM, MKV video formats in your browser. Free online video converter.',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ConvertResult {
  url: string
  size: number
  filename: string
}

export const VideoConverter: React.FC = () => {
  const { videoFile, error: fileError, isLoading: fileLoading, onDrop, reset } = useVideoFile()
  const { status, progress, error: procError, result, run, reset: resetProc } = useFFmpeg<ConvertResult>()

  const [targetFormat, setTargetFormat] = useState<VideoFormat>('mp4')
  const [quality, setQuality] = useState<VideoQuality>('medium')

  const inputExt = videoFile?.name.split('.').pop()?.toLowerCase() ?? ''
  const availableFormats = (Object.keys(FORMAT_DETAILS) as VideoFormat[]).filter(
    (f) => f !== inputExt,
  )

  const handleProcess = async () => {
    if (!videoFile) return
    await run(async (onProgress) => {
      const task = await convertVideo(videoFile.file, targetFormat, { quality }, onProgress)
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
        title="Video Converter Online Free — MP4, MOV, AVI, WEBM — EcomSathi"
        description="Convert between MP4, MOV, AVI, WEBM, MKV video formats online for free. Browser-based video converter. No signup required."
        keywords="video converter online free, mp4 to webm, mov to mp4, convert video format, avi to mp4, webm to mp4, mkv to mp4 online"
        canonicalUrl="https://ecomsathi.vercel.app/video/converter"
        schema={PAGE_SCHEMA}
      />

      <VideoToolLayout
        title="Video Converter"
        description="Convert between MP4, MOV, AVI, WEBM, and MKV formats in your browser."
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
              <h2 className="text-sm font-semibold text-[#0F172A]">Conversion Options</h2>

              {/* Target format */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#0F172A]">Convert To</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {(Object.entries(FORMAT_DETAILS) as [VideoFormat, typeof FORMAT_DETAILS[VideoFormat]][]).map(
                    ([fmt, info]) => {
                      const isCurrent = fmt === inputExt
                      return (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => !isCurrent && setTargetFormat(fmt)}
                          disabled={isCurrent}
                          className={[
                            'flex flex-col gap-1 px-3 py-3 border rounded-[6px] text-left transition-all',
                            isCurrent
                              ? 'opacity-40 cursor-not-allowed border-[#E2E8F0] bg-[#F8FAFC]'
                              : targetFormat === fmt
                              ? `border-2 border-[#2563EB] bg-[#EFF6FF]`
                              : 'border-[#E2E8F0] bg-white hover:border-[#2563EB]',
                          ].join(' ')}
                        >
                          <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded w-fit ${info.accentClass}`}
                          >
                            {info.label}
                          </span>
                          <span className="text-[11px] text-[#64748B] leading-snug">{info.note}</span>
                          {isCurrent && (
                            <span className="text-[10px] text-[#94A3B8]">Current</span>
                          )}
                        </button>
                      )
                    },
                  )}
                </div>
              </div>

              {/* Quality */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#0F172A]">Quality</label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as VideoQuality[]).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuality(q)}
                      className={[
                        'px-4 py-1.5 text-xs font-medium rounded border capitalize transition-all',
                        quality === q
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]',
                      ].join(' ')}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Arrow summary */}
              <div className="flex items-center gap-3 text-sm">
                <span className="px-2 py-1 bg-[#F1F5F9] rounded text-[#64748B] font-mono uppercase">
                  {inputExt || 'source'}
                </span>
                <span className="text-[#94A3B8]">→</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${FORMAT_DETAILS[targetFormat].accentClass}`}
                >
                  {FORMAT_DETAILS[targetFormat].label}
                </span>
              </div>

              <button
                type="button"
                onClick={handleProcess}
                disabled={status === 'loading' || status === 'processing'}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Convert to {FORMAT_DETAILS[targetFormat].label}
              </button>
            </div>
          )}

          {/* Progress */}
          <ProcessingBar
            status={status}
            progress={progress}
            error={procError}
            label={`Converting to ${targetFormat.toUpperCase()}…`}
          />

          {/* Result */}
          {status === 'done' && result && (
            <VideoDownloader
              url={result.url}
              filename={result.filename}
              size={result.size}
              originalSize={videoFile?.size}
              label={`Download ${targetFormat.toUpperCase()}`}
              onReset={handleReset}
            />
          )}

          {/* Format comparison table */}
          {!videoFile && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-[#0F172A]">Video Format Guide</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-[#E2E8F0] rounded-[8px] overflow-hidden">
                  <thead>
                    <tr className="bg-[#F8FAFC]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] border-b border-[#E2E8F0]">Format</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] border-b border-[#E2E8F0]">Best For</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] border-b border-[#E2E8F0]">Compatibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {[
                      { fmt: 'MP4',  best: 'Amazon, Flipkart, all platforms',  compat: '⭐⭐⭐⭐⭐ Universal' },
                      { fmt: 'WEBM', best: 'Web browsers, Google platforms',   compat: '⭐⭐⭐ Web only' },
                      { fmt: 'MOV',  best: 'Apple devices, iMovie, Final Cut', compat: '⭐⭐⭐⭐ Apple + most' },
                      { fmt: 'AVI',  best: 'Windows legacy apps',              compat: '⭐⭐⭐ Windows focus' },
                      { fmt: 'MKV',  best: 'High-quality archival storage',    compat: '⭐⭐⭐ Desktop players' },
                    ].map((row) => (
                      <tr key={row.fmt} className="bg-white hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-[#0F172A]">{row.fmt}</td>
                        <td className="px-4 py-3 text-[#64748B]">{row.best}</td>
                        <td className="px-4 py-3 text-[#64748B]">{row.compat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* FAQ */}
          <VideoFAQ items={FAQS} pageUrl="https://ecomsathi.vercel.app/video/converter" />
        </div>
      </VideoToolLayout>
    </>
  )
}

export default VideoConverter
