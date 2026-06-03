import { Link } from 'react-router-dom'
import {
  Search,
  Shield,
  Calculator,
  Divide,
  MapPin,
  BookOpen,
  FileText,
  Tag,
} from 'lucide-react'

interface SidebarLink {
  label: string
  to: string
  icon: React.ReactNode
}

const ALL_TOOLS: SidebarLink[] = [
  { label: 'GST Search',             to: '/gst/search',            icon: <Search size={14} /> },
  { label: 'GST Verification',       to: '/gst/verification',      icon: <Shield size={14} /> },
  { label: 'GST Calculator',         to: '/gst/calculator',        icon: <Calculator size={14} /> },
  { label: 'Reverse GST Calculator', to: '/gst/reverse-calculator',icon: <Divide size={14} /> },
  { label: 'GST State Finder',       to: '/gst/state-finder',      icon: <MapPin size={14} /> },
  { label: 'HSN Code Search',        to: '/gst/hsn-search',        icon: <BookOpen size={14} /> },
  { label: 'SAC Code Search',        to: '/gst/sac-search',        icon: <FileText size={14} /> },
  { label: 'GST Rate Finder',        to: '/gst/rate-finder',       icon: <Tag size={14} /> },
]

interface GSTSidebarProps {
  currentPath: string
}

export default function GSTSidebar({ currentPath }: GSTSidebarProps) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-[#F1F5F9] bg-[#F8FAFC]">
        <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide">All GST Tools</p>
      </div>
      <ul className="p-2">
        {ALL_TOOLS.map(tool => {
          const active = currentPath === tool.to
          return (
            <li key={tool.to}>
              <Link
                to={tool.to}
                className={[
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-[#EFF6FF] text-[#2563EB] font-medium'
                    : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]',
                ].join(' ')}
              >
                <span className={active ? 'text-[#2563EB]' : 'text-[#94A3B8]'}>
                  {tool.icon}
                </span>
                {tool.label}
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="px-4 py-3 border-t border-[#F1F5F9] bg-[#F8FAFC]">
        <Link
          to="/gst"
          className="text-xs text-[#2563EB] font-medium hover:underline"
        >
          ← Back to GST Hub
        </Link>
      </div>
    </div>
  )
}
