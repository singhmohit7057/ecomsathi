// ============================================================
// Pattern Builder — drag token blocks to build SKU patterns
// ============================================================

import React, { useState } from 'react'
import { Plus, X, ChevronDown } from 'lucide-react'
import type { CustomPatternToken, Separator } from '../types'

const TOKEN_OPTIONS: Array<{ type: CustomPatternToken['type']; label: string; example: string }> = [
  { type: 'BRAND',    label: 'Brand',    example: 'NIKE' },
  { type: 'CATEGORY', label: 'Category', example: 'TSH' },
  { type: 'COLOR',    label: 'Color',    example: 'BLK' },
  { type: 'SIZE',     label: 'Size',     example: 'M' },
  { type: 'YEAR',     label: 'Year',     example: '2025' },
  { type: 'NUMBER',   label: 'Number',   example: '0001' },
  { type: 'PREFIX',   label: 'Prefix',   example: 'PRE' },
  { type: 'SUFFIX',   label: 'Suffix',   example: 'SFX' },
]

const TOKEN_COLORS: Record<CustomPatternToken['type'], string> = {
  BRAND:    'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
  CATEGORY: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
  COLOR:    'bg-[#FFF7ED] text-[#D97706] border-[#FED7AA]',
  SIZE:     'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]',
  YEAR:     'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
  NUMBER:   'bg-[#FFF1F2] text-[#DC2626] border-[#FECACA]',
  PREFIX:   'bg-[#ECFEFF] text-[#0891B2] border-[#A5F3FC]',
  SUFFIX:   'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]',
  TEXT:     'bg-[#F8FAFC] text-[#374151] border-[#E2E8F0]',
}

interface PatternBuilderProps {
  tokens: CustomPatternToken[]
  separator: Separator
  onChange: (tokens: CustomPatternToken[]) => void
  onSeparatorChange: (sep: Separator) => void
  preview: string
}

const PatternBuilder: React.FC<PatternBuilderProps> = ({
  tokens,
  separator,
  onChange,
  onSeparatorChange,
  preview,
}) => {
  const [showTokenMenu, setShowTokenMenu] = useState(false)

  const addToken = (type: CustomPatternToken['type']) => {
    const info = TOKEN_OPTIONS.find((t) => t.type === type)!
    const newToken: CustomPatternToken = {
      id: `${type}-${Date.now()}`,
      type,
      label: info.label,
      value: type === 'TEXT' ? '' : undefined,
    }
    onChange([...tokens, newToken])
    setShowTokenMenu(false)
  }

  const removeToken = (id: string) => {
    onChange(tokens.filter((t) => t.id !== id))
  }

  const generatePattern = (): string => {
    return tokens.map((t) => {
      if (t.type === 'NUMBER') return '{AUTO_NUMBER}'
      if (t.type === 'YEAR') return '{YEAR}'
      if (t.type === 'TEXT') return t.value || 'TEXT'
      return `{${t.type}}`
    }).join(separator)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Token Palette */}
      <div>
        <p className="text-xs font-semibold text-[#374151] mb-2">Available Tokens</p>
        <div className="flex flex-wrap gap-2">
          {TOKEN_OPTIONS.map((tok) => (
            <button
              key={tok.type}
              type="button"
              onClick={() => addToken(tok.type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all hover:opacity-80 ${TOKEN_COLORS[tok.type]}`}
            >
              + {tok.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pattern Builder Area */}
      <div className="border border-[#E2E8F0] rounded-[8px] p-4 min-h-[60px] bg-[#F8FAFC]">
        {tokens.length === 0 ? (
          <p className="text-xs text-[#94A3B8] text-center py-2">
            Click tokens above to build your pattern
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {tokens.map((token, idx) => (
              <React.Fragment key={token.id}>
                {idx > 0 && (
                  <span className="text-xs font-mono text-[#94A3B8] font-bold">{separator}</span>
                )}
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${TOKEN_COLORS[token.type]}`}>
                  {token.label}
                  <button
                    type="button"
                    onClick={() => removeToken(token.id)}
                    className="ml-0.5 hover:opacity-60"
                  >
                    <X size={10} />
                  </button>
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Separator + Pattern string */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-[#374151]">Separator</label>
          <div className="relative">
            <select
              value={separator}
              onChange={(e) => onSeparatorChange(e.target.value as Separator)}
              className="border border-[#E2E8F0] rounded-[6px] px-3 py-1.5 text-xs bg-white pr-7 appearance-none focus:outline-none focus:border-[#2563EB]"
            >
              <option value="-">Hyphen (-)</option>
              <option value="_">Underscore (_)</option>
              <option value="/">Slash (/)</option>
              <option value=".">Dot (.)</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#64748B]">
            Pattern:{' '}
            <code className="font-mono text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded text-[11px]">
              {generatePattern() || 'Add tokens above'}
            </code>
          </p>
        </div>
      </div>

      {/* Live Preview */}
      {preview && (
        <div className="rounded-[6px] bg-[#FFFBEB] border border-[#FDE68A] px-4 py-3">
          <p className="text-xs font-semibold text-[#92400E] mb-1">Preview</p>
          <p className="font-mono text-base font-bold text-[#0F172A] tracking-widest break-all">
            {preview}
          </p>
        </div>
      )}
    </div>
  )
}

export default PatternBuilder
