import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Film, Layers, Minimize2, Maximize2, RefreshCw, ImageIcon, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ToolCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

const VIDEO_TOOLS: ToolCard[] = [
  {
    icon: <Film size={22} />,
    title: 'Video to GIF',
    description: 'Convert any video clip to an animated GIF with custom frame rate and width.',
    href: '/tools/video/to-gif',
  },
  {
    icon: <Layers size={22} />,
    title: 'Frame Extractor',
    description: 'Extract frames at a specific time, every N seconds, or over a time range.',
    href: '/tools/video/extract-frames',
  },
  {
    icon: <Minimize2 size={22} />,
    title: 'Compress Video',
    description: 'Reduce file size with H.264 presets — Small, Balanced, or High Quality.',
    href: '/tools/video/compress',
  },
  {
    icon: <Maximize2 size={22} />,
    title: 'Resize Video',
    description: 'Resize to 480p, 720p, 1080p, 4K, or any custom resolution.',
    href: '/tools/video/resize',
  },
  {
    icon: <RefreshCw size={22} />,
    title: 'Video Converter',
    description: 'Convert between MP4 (H.264/H.265), WebM (VP9), MOV, and AVI formats.',
    href: '/tools/video/convert',
  },
  {
    icon: <ImageIcon size={22} />,
    title: 'Thumbnail Generator',
    description: 'Extract a single frame as a high-quality JPG or PNG thumbnail.',
    href: '/tools/video/thumbnail',
  },
];

export const VideoToolsIndex: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#64748B]">
        <Link to="/" className="hover:text-[#0F172A] transition-colors">Home</Link>
        <ChevronRight size={14} className="shrink-0" />
        <Link to="/tools" className="hover:text-[#0F172A] transition-colors">Tools</Link>
        <ChevronRight size={14} className="shrink-0" />
        <span className="font-medium text-[#0F172A]">Video Tools</span>
      </nav>

      {/* Header */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-[#EFF6FF] text-[#2563EB]">
            <Film size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-[#0F172A] sm:text-2xl">Video Tools</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2.5 py-0.5 text-xs font-medium text-[#16A34A] ring-1 ring-inset ring-[#BBF7D0]">
                <CheckCircle2 size={11} />
                No login required
              </span>
              <span className="inline-flex items-center rounded-full bg-[#FFFBEB] px-2.5 py-0.5 text-xs font-medium text-[#D97706]">
                Free
              </span>
            </div>
            <p className="mt-1 text-sm text-[#475569] sm:text-base">
              Convert, compress, resize, and extract frames from videos. All processing happens on our secure backend — no software installation needed.
            </p>
          </div>
        </div>
      </div>

      {/* Note about file size */}
      <div className="rounded-[4px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-xs text-[#1E40AF]">
        Files up to 500 MB are supported. Video processing is handled server-side and may take a few minutes for large files.
      </div>

      {/* Tool cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {VIDEO_TOOLS.map((tool) => (
          <Link
            key={tool.href}
            to={tool.href}
            className="group flex flex-col gap-3 rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all hover:border-[#93C5FD] hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#EFF6FF] text-[#2563EB] transition-colors group-hover:bg-[#DBEAFE]">
                {tool.icon}
              </div>
              <ArrowRight
                size={16}
                className="mt-1 shrink-0 text-[#94A3B8] transition-transform group-hover:translate-x-0.5 group-hover:text-[#2563EB]"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                {tool.title}
              </h3>
              <p className="mt-0.5 text-xs text-[#64748B] leading-relaxed">{tool.description}</p>
            </div>
            {tool.badge && (
              <span className="self-start rounded-full bg-[#FFFBEB] px-2 py-0.5 text-xs font-medium text-[#D97706]">
                {tool.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VideoToolsIndex;
