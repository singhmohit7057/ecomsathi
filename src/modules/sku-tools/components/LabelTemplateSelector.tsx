// ============================================================
// Label Template Selector
// ============================================================

import React from 'react'
import { Layout, Tag, QrCode, ReceiptText, AlignCenter } from 'lucide-react'
import type { LabelTemplate, LabelSize } from '../types'

interface TemplateMeta {
  id: LabelTemplate
  label: string
  desc: string
  icon: React.ReactNode
}

interface SizeMeta {
  id: LabelSize
  label: string
  sub: string
}

const TEMPLATES: TemplateMeta[] = [
  { id: 'simple',       label: 'Simple',       desc: 'SKU + Product name',           icon: <Tag size={16} /> },
  { id: 'detailed',     label: 'Detailed',     desc: 'Brand, SKU, price, barcode',   icon: <Layout size={16} /> },
  { id: 'barcode-only', label: 'Barcode Only', desc: 'Just the barcode + SKU',       icon: <AlignCenter size={16} /> },
  { id: 'qr-label',     label: 'QR Label',     desc: 'QR code + SKU text',           icon: <QrCode size={16} /> },
  { id: 'price-tag',    label: 'Price Tag',    desc: 'Product + MRP + Selling price', icon: <ReceiptText size={16} /> },
]

const SIZES: SizeMeta[] = [
  { id: 'A4',               label: 'A4 Sheet',      sub: '210 × 297 mm' },
  { id: 'thermal-80',       label: 'Thermal 80mm',  sub: '80 × 60 mm' },
  { id: 'thermal-58',       label: 'Thermal 58mm',  sub: '58 × 40 mm' },
  { id: 'sticker-50x25',    label: 'Sticker Small', sub: '50 × 25 mm' },
  { id: 'sticker-100x50',   label: 'Sticker Large', sub: '100 × 50 mm' },
]

interface LabelTemplateSelectorProps {
  template: LabelTemplate
  size: LabelSize
  onTemplateChange: (t: LabelTemplate) => void
  onSizeChange: (s: LabelSize) => void
}

const LabelTemplateSelector: React.FC<LabelTemplateSelectorProps> = ({
  template,
  size,
  onTemplateChange,
  onSizeChange,
}) => {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-semibold text-[#0F172A] mb-3">Label Template</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTemplateChange(t.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-[8px] border text-center transition-all ${
                template === t.id
                  ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                  : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#93C5FD]'
              }`}
            >
              {t.icon}
              <span className="text-xs font-medium leading-tight">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-[#0F172A] mb-3">Label Size</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {SIZES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSizeChange(s.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-[8px] border text-center transition-all ${
                size === s.id
                  ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                  : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#93C5FD]'
              }`}
            >
              <span className="text-xs font-semibold">{s.label}</span>
              <span className="text-[10px] text-[#94A3B8]">{s.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LabelTemplateSelector
