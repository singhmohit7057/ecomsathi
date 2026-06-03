// ============================================================
// Barcode Service
// ============================================================

import JsBarcode from 'jsbarcode'
import type { BarcodeFormat } from '../types'

export interface BarcodeOptions {
  format: BarcodeFormat
  value: string
  displayValue?: boolean
  fontSize?: number
  height?: number
  margin?: number
  lineColor?: string
  background?: string
}

export function renderBarcodeToSVG(
  svgEl: SVGSVGElement,
  options: BarcodeOptions,
): void {
  const { format, value, ...rest } = options

  const opts = {
    displayValue: true,
    fontSize: 14,
    height: 80,
    margin: 10,
    lineColor: '#000000',
    background: '#ffffff',
    ...rest,
  }

  if (format === 'QRCode') return // QR handled separately

  const encodedValue = formatValue(format, value)

  JsBarcode(svgEl, encodedValue, {
    format: jsFormat(format),
    ...opts,
  })
}

function jsFormat(f: BarcodeFormat): string {
  const map: Record<BarcodeFormat, string> = {
    CODE128: 'CODE128',
    EAN13: 'EAN13',
    EAN8: 'EAN8',
    UPC: 'UPC',
    QRCode: 'CODE128',
  }
  return map[f]
}

function formatValue(format: BarcodeFormat, value: string): string {
  const digits = value.replace(/\D/g, '')
  if (format === 'EAN13') {
    const base = digits.padStart(12, '0').slice(0, 12)
    return base + computeEAN13Check(base)
  }
  if (format === 'EAN8') {
    const base = digits.padStart(7, '0').slice(0, 7)
    return base + computeEAN8Check(base)
  }
  if (format === 'UPC') {
    return digits.padStart(11, '0').slice(0, 11)
  }
  return value || '0000000000001'
}

function computeEAN13Check(s: string): string {
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(s[i], 10) * (i % 2 === 0 ? 1 : 3)
  }
  return String((10 - (sum % 10)) % 10)
}

function computeEAN8Check(s: string): string {
  let sum = 0
  for (let i = 0; i < 7; i++) {
    sum += parseInt(s[i], 10) * (i % 2 === 0 ? 3 : 1)
  }
  return String((10 - (sum % 10)) % 10)
}

export function svgToDataURL(svgEl: SVGSVGElement): string {
  const svgData = new XMLSerializer().serializeToString(svgEl)
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
}

export async function svgToPNG(svgEl: SVGSVGElement, scale = 2): Promise<string> {
  const w = (svgEl.width.baseVal.value || 300) * scale
  const h = (svgEl.height.baseVal.value || 120) * scale
  const svgData = svgToDataURL(svgEl)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = svgData
  })
}

export function downloadSVG(svgEl: SVGSVGElement, filename: string): void {
  const data = svgToDataURL(svgEl)
  const a = document.createElement('a')
  a.href = data
  a.download = `${filename}.svg`
  a.click()
}

export async function downloadPNG(svgEl: SVGSVGElement, filename: string): Promise<void> {
  const png = await svgToPNG(svgEl)
  const a = document.createElement('a')
  a.href = png
  a.download = `${filename}.png`
  a.click()
}

export function skuToNumericValue(sku: string): string {
  let num = 0
  for (let i = 0; i < sku.length; i++) {
    num += sku.charCodeAt(i) * (i + 1)
  }
  return String(num % 1_000_000_000_000).padStart(12, '0')
}
