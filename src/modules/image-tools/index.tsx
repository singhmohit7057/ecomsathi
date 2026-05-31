import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eraser,
  Crop,
  Expand,
  Minimize2,
  FileImage,
  ArrowRightLeft,
  Stamp,
  Package,
  PaintBucket,
  Square,
  Layers,
} from 'lucide-react';

interface ToolCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
  accent: string;
}

const TOOLS: ToolCard[] = [
  {
    icon: <Eraser size={28} />,
    title: 'Background Remover',
    description: 'Remove backgrounds automatically using AI. Outputs transparent PNG.',
    path: '/tools/image/background-remover',
    accent: 'bg-[#FFF1F2] text-[#DC2626] border-[#FFE4E6]',
  },
  {
    icon: <Crop size={28} />,
    title: 'Crop Image',
    description: 'Drag-and-drop crop with aspect ratio presets and rotation support.',
    path: '/tools/image/crop',
    accent: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
  },
  {
    icon: <Expand size={28} />,
    title: 'Resize Image',
    description: 'Resize by custom dimensions, percentage, or marketplace presets.',
    path: '/tools/image/resize',
    accent: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
  },
  {
    icon: <Minimize2 size={28} />,
    title: 'Compress Image',
    description: 'Reduce file size with quality control and optional target size input.',
    path: '/tools/image/compress',
    accent: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  },
  {
    icon: <FileImage size={28} />,
    title: 'JPG to PNG',
    description: 'Convert JPG/JPEG images to PNG format. Supports batch conversion.',
    path: '/tools/image/jpg-to-png',
    accent: 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]',
  },
  {
    icon: <Layers size={28} />,
    title: 'PNG to JPG',
    description: 'Convert PNG files to JPEG with custom background color for transparency.',
    path: '/tools/image/png-to-jpg',
    accent: 'bg-[#FDF4FF] text-[#9333EA] border-[#E9D5FF]',
  },
  {
    icon: <ArrowRightLeft size={28} />,
    title: 'WEBP Converter',
    description: 'Convert between WEBP and PNG/JPG formats in both directions.',
    path: '/tools/image/webp-converter',
    accent: 'bg-[#F0FDF4] text-[#059669] border-[#A7F3D0]',
  },
  {
    icon: <Stamp size={28} />,
    title: 'Image Watermark',
    description: 'Add text or logo watermarks with opacity, size, and position control.',
    path: '/tools/image/watermark',
    accent: 'bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]',
  },
  {
    icon: <Package size={28} />,
    title: 'Product Optimizer',
    description: 'Optimize product images for Amazon, Flipkart, Myntra, Meesho, and more.',
    path: '/tools/image/product-optimizer',
    accent: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
  },
  {
    icon: <PaintBucket size={28} />,
    title: 'White Background',
    description: 'Replace product photo backgrounds with white for marketplace compliance.',
    path: '/tools/image/white-background',
    accent: 'bg-[#F8FAFC] text-[#334155] border-[#CBD5E1]',
  },
  {
    icon: <Square size={28} />,
    title: 'Square Image Creator',
    description: 'Add padding to make any image perfectly square. Pick position and fill color.',
    path: '/tools/image/square-creator',
    accent: 'bg-[#FFF1F2] text-[#BE185D] border-[#FBCFE8]',
  },
];

export const ImageToolsIndex: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A]">Image Tools</h1>
        <p className="text-base text-[#64748B] mt-2">
          Free image editing tools for sellers — resize, compress, watermark, and optimize product photos for Indian marketplaces.
        </p>
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map(tool => (
          <div
            key={tool.path}
            className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 flex flex-col gap-4 hover:shadow-[#1E293B_2px_2px_0px_0px] hover:border-[#CBD5E1] transition-all duration-150"
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-[8px] border flex items-center justify-center flex-shrink-0 ${tool.accent}`}>
              {tool.icon}
            </div>

            {/* Text */}
            <div className="flex flex-col gap-1 flex-1">
              <h2 className="text-base font-semibold text-[#0F172A]">{tool.title}</h2>
              <p className="text-sm text-[#64748B] leading-relaxed">{tool.description}</p>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={() => navigate(tool.path)}
              className="w-full px-4 py-2 text-sm font-medium text-[#2563EB] border border-[#2563EB] rounded-[4px] hover:bg-[#EFF6FF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40"
            >
              Open Tool
            </button>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-xs text-[#94A3B8] text-center">
        All tools process images in your browser. Files are not uploaded unless the tool explicitly requires backend processing (Background Remover, White Background).
      </p>
    </div>
  );
};

export default ImageToolsIndex;
