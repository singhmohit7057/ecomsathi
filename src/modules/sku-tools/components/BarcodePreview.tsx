// ============================================================
// Barcode Preview — renders barcode / QR code to SVG/canvas
// ============================================================

import React, { useRef, useEffect, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { renderBarcodeToSVG, downloadSVG, downloadPNG } from '../services/barcodeService'
import type { BarcodeFormat } from '../types'

interface BarcodePreviewProps {
  value: string
  format: BarcodeFormat
  label?: string
}

const BarcodePreview: React.FC<BarcodePreviewProps> = ({ value, format, label }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!value) return
    setError('')

    if (format === 'QRCode') {
      renderQR()
    } else {
      if (!svgRef.current) return
      try {
        renderBarcodeToSVG(svgRef.current, { format, value })
      } catch (e) {
        setError('Cannot encode this value in ' + format)
      }
    }
  }, [value, format])

  const renderQR = async () => {
    try {
      const QRCode = await import('qrcode')
      if (qrCanvasRef.current) {
        await QRCode.toCanvas(qrCanvasRef.current, value || '0', {
          width: 200,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
        })
      }
    } catch {
      setError('QR code generation failed')
    }
  }

  const handleDownloadSVG = () => {
    if (!svgRef.current || format === 'QRCode') return
    downloadSVG(svgRef.current, label || value)
  }

  const handleDownloadPNG = async () => {
    setDownloading(true)
    try {
      if (format === 'QRCode' && qrCanvasRef.current) {
        const a = document.createElement('a')
        a.href = qrCanvasRef.current.toDataURL('image/png')
        a.download = `${label || value}-qr.png`
        a.click()
      } else if (svgRef.current) {
        await downloadPNG(svgRef.current, label || value)
      }
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!value) return null

  return (
    <div className="flex flex-col items-center gap-3 bg-white border border-[#E2E8F0] rounded-[8px] p-5">
      {error ? (
        <p className="text-sm text-[#DC2626]">{error}</p>
      ) : format === 'QRCode' ? (
        <canvas ref={qrCanvasRef} className="max-w-[200px]" />
      ) : (
        <svg ref={svgRef} className="max-w-full" />
      )}

      {label && (
        <p className="text-sm font-mono font-bold text-[#0F172A] tracking-widest">{label}</p>
      )}

      <div className="flex gap-2 flex-wrap justify-center">
        <button
          type="button"
          onClick={handleDownloadPNG}
          disabled={downloading || !!error}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#E2E8F0] rounded-[6px] text-[#374151] hover:bg-[#F8FAFC] disabled:opacity-40 transition-colors"
        >
          <Download size={12} />
          {downloading ? 'Saving...' : 'PNG'}
        </button>

        {format !== 'QRCode' && !error && (
          <button
            type="button"
            onClick={handleDownloadSVG}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#E2E8F0] rounded-[6px] text-[#374151] hover:bg-[#F8FAFC] transition-colors"
          >
            <Download size={12} />
            SVG
          </button>
        )}

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#E2E8F0] rounded-[6px] text-[#374151] hover:bg-[#F8FAFC] transition-colors"
        >
          <Printer size={12} />
          Print
        </button>
      </div>
    </div>
  )
}

export default BarcodePreview
