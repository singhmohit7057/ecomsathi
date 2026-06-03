// ============================================================
// Label Preview — renders a product label in the browser
// ============================================================

import React, { useRef, useEffect } from 'react'
import type { LabelData, LabelConfig } from '../types'

interface LabelPreviewProps {
  label: LabelData
  config: LabelConfig
}

const LabelPreview: React.FC<LabelPreviewProps> = ({ label, config }) => {
  const barcodeRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!config.showBarcode || !label.sku || !barcodeRef.current) return
    import('jsbarcode').then((mod) => {
      const JsBarcode = mod.default
      try {
        JsBarcode(barcodeRef.current!, label.sku, {
          format: 'CODE128',
          displayValue: true,
          fontSize: 10,
          height: 40,
          margin: 5,
          background: '#ffffff',
          lineColor: '#000000',
        })
      } catch {
        // silently fail — invalid characters
      }
    })
  }, [label.sku, config.showBarcode])

  return (
    <div className="border-2 border-[#0F172A] rounded-[4px] p-3 bg-white max-w-[240px] mx-auto flex flex-col gap-1 text-[#0F172A]">
      {config.showBrand && label.brand && (
        <p className="text-[9px] font-bold uppercase tracking-wider text-center text-[#64748B]">
          {label.brand}
        </p>
      )}

      {label.productName && (
        <p className="text-[11px] font-semibold text-center leading-tight truncate">
          {label.productName}
        </p>
      )}

      <p className="text-sm font-mono font-bold text-center tracking-widest my-0.5">
        {label.sku}
      </p>

      {(config.showSize && label.size) || (config.showColor && label.color) ? (
        <div className="flex justify-center gap-3 text-[9px] text-[#64748B]">
          {config.showSize && label.size && <span>Size: {label.size}</span>}
          {config.showColor && label.color && <span>Color: {label.color}</span>}
        </div>
      ) : null}

      {config.showBarcode && label.sku && (
        <div className="flex justify-center mt-1">
          <svg ref={barcodeRef} className="max-w-full" />
        </div>
      )}

      {(config.showMRP && label.mrp) || (config.showPrice && label.price) ? (
        <div className="flex justify-center gap-3 text-[10px] border-t border-[#E2E8F0] pt-1 mt-1">
          {config.showMRP && label.mrp && (
            <span className="text-[#64748B] line-through">MRP ₹{label.mrp}</span>
          )}
          {config.showPrice && label.price && (
            <span className="font-bold text-[#059669]">₹{label.price}</span>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default LabelPreview
