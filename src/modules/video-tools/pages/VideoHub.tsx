import React from 'react'
import { Link } from 'react-router-dom'
import {
  Clapperboard,
  Layers,
  Minimize2,
  Expand,
  ArrowRightLeft,
  Image,
  CheckCircle2,
  Cpu,
  Lock,
  Zap,
} from 'lucide-react'
import SEO from '@/components/common/SEO'
import VideoBreadcrumb from '../components/VideoBreadcrumb'
import VideoToolCard from '../components/VideoToolCard'
import VideoFAQ from '../components/VideoFAQ'
import type { VideoToolCardData, FAQItem } from '../types'

// ─── Tool list ────────────────────────────────────────────────────────────────

const VIDEO_TOOLS: VideoToolCardData[] = [
  {
    icon: <Clapperboard size={28} />,
    title: 'Video to GIF',
    description: 'Convert product video clips to animated GIF for ecommerce listings and social media.',
    path: '/tools/video/to-gif',
    accent: 'bg-[#FFF1F2] text-[#DC2626] border-[#FFE4E6]',
    badge: 'Popular',
  },
  {
    icon: <Layers size={28} />,
    title: 'Frame Extractor',
    description: 'Extract individual frames from any video as high-quality JPEG images.',
    path: '/tools/video/frame-extractor',
    accent: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
  },
  {
    icon: <Minimize2 size={28} />,
    title: 'Compress Video',
    description: 'Reduce video file size while maintaining quality. Ideal for marketplace uploads.',
    path: '/tools/video/compress',
    accent: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  },
  {
    icon: <Expand size={28} />,
    title: 'Resize Video',
    description: 'Change video resolution or aspect ratio to meet marketplace requirements.',
    path: '/tools/video/resize',
    accent: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
  },
  {
    icon: <ArrowRightLeft size={28} />,
    title: 'Video Converter',
    description: 'Convert between MP4, MOV, AVI, WEBM, MKV video formats in your browser.',
    path: '/tools/video/converter',
    accent: 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]',
  },
  {
    icon: <Image size={28} />,
    title: 'Thumbnail Generator',
    description: 'Extract the perfect thumbnail from your product video at any timestamp.',
    path: '/tools/video/thumbnail-generator',
    accent: 'bg-[#FDF4FF] text-[#9333EA] border-[#E9D5FF]',
  },
]

// ─── Features list ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <Lock size={20} className="text-[#16A34A]" />,
    title: '100% Private',
    description: 'All processing happens in your browser. Your videos never leave your device.',
  },
  {
    icon: <Cpu size={20} className="text-[#2563EB]" />,
    title: 'FFmpeg Powered',
    description: 'Industry-standard FFmpeg engine runs directly in the browser via WebAssembly.',
  },
  {
    icon: <Zap size={20} className="text-[#D97706]" />,
    title: 'No Signup Needed',
    description: 'Free to use without registration. Just upload, process, and download.',
  },
  {
    icon: <CheckCircle2 size={20} className="text-[#9333EA]" />,
    title: 'All Major Formats',
    description: 'Supports MP4, MOV, AVI, WEBM, MKV — the formats used across all marketplaces.',
  },
]

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQS: FAQItem[] = [
  {
    question: 'Are the video tools completely free?',
    answer:
      'Yes. All video tools on EcomSathi are completely free to use. No subscription, no credit card, and no hidden limits.',
  },
  {
    question: 'Are my videos uploaded to a server?',
    answer:
      'No. All processing runs entirely in your browser using WebAssembly (FFmpeg.wasm). Your video files are never uploaded to any server, ensuring complete privacy.',
  },
  {
    question: 'Which video formats are supported?',
    answer:
      'The tools support MP4, MOV, AVI, WEBM, and MKV — the most common formats used by ecommerce sellers on Amazon, Flipkart, Meesho, and other marketplaces.',
  },
  {
    question: 'What is the maximum video size allowed?',
    answer:
      'You can process videos up to 500 MB. For very large files, processing may take a few minutes as it runs entirely in your browser.',
  },
  {
    question: 'Why does FFmpeg need to load first?',
    answer:
      'On first use, the browser downloads the FFmpeg WebAssembly engine (~30 MB). This happens only once per session and is cached by your browser for subsequent uses.',
  },
  {
    question: 'Can I use these tools on mobile?',
    answer:
      'Yes, the tools work on modern mobile browsers. However, for large video files we recommend using a desktop or laptop for faster processing.',
  },
]

// ─── Schema ───────────────────────────────────────────────────────────────────

const HUB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Free Video Tools for Ecommerce Sellers',
  description: 'Convert, resize, compress and optimize product videos online.',
  url: 'https://ecomsathi.vercel.app/tools/video',
  hasPart: VIDEO_TOOLS.map((t) => ({
    '@type': 'SoftwareApplication',
    name: t.title,
    url: `https://ecomsathi.vercel.app${t.path}`,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  })),
}

// ─── Component ────────────────────────────────────────────────────────────────

export const VideoHub: React.FC = () => {
  return (
    <>
      <SEO
        title="Free Video Tools for Ecommerce Sellers — EcomSathi"
        description="Convert, resize, compress and optimize product videos online. Video to GIF, frame extractor, video compression, resize, converter, and thumbnail generator. Free, no signup."
        keywords="video tools online free, video to gif, compress video online, resize video, video converter, extract frames, thumbnail generator, ecommerce video tools"
        canonicalUrl="https://ecomsathi.vercel.app/tools/video"
        schema={HUB_SCHEMA}
      />

      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        {/* Breadcrumb */}
        <VideoBreadcrumb
          crumbs={[
            { label: 'Tools', to: '/tools' },
            { label: 'Video Tools' },
          ]}
        />

        {/* Hero */}
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold w-fit">
            <Clapperboard size={12} />
            Video Tools
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] leading-tight">
            Free Video Tools for<br className="hidden sm:block" /> Ecommerce Sellers
          </h1>
          <p className="text-base text-[#64748B] max-w-2xl">
            Convert, resize, compress and optimize product videos online. All tools run in your browser — no uploads, no signup, completely free.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-2 mt-1">
            {['No signup', '100% free', 'Browser-based', 'FFmpeg powered'].map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E2E8F0] bg-white text-xs text-[#64748B]"
              >
                <CheckCircle2 size={11} className="text-[#16A34A]" />
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Tool cards */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-[#0F172A]">All Video Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VIDEO_TOOLS.map((tool) => (
              <VideoToolCard key={tool.path} tool={tool} />
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-[#0F172A]">Why Use EcomSathi Video Tools?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 flex gap-4"
              >
                <div className="w-9 h-9 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A]">{f.title}</h3>
                  <p className="text-sm text-[#64748B] mt-1">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <VideoFAQ items={FAQS} pageUrl="https://ecomsathi.vercel.app/tools/video" />

        {/* Internal links */}
        <section className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] p-5 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-[#0F172A]">Explore Other Tools</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Image Tools', to: '/tools/image' },
              { label: 'PDF Tools', to: '/tools/pdf' },
              { label: 'SKU Generator', to: '/tools/sku/generator' },
              { label: 'Barcode Generator', to: '/tools/sku/barcode' },
              { label: 'Background Remover', to: '/tools/image/background-remover' },
              { label: 'Compress Image', to: '/tools/image/compress' },
              { label: 'GST Calculator', to: '/tools/gst/calculator' },
              { label: 'Label Crop', to: '/label-crop' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-1.5 text-sm text-[#2563EB] border border-[#BFDBFE] rounded-[4px] bg-white hover:bg-[#EFF6FF] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

export default VideoHub
