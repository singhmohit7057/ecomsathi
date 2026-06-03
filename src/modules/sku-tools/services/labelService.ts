// ============================================================
// Label Service — PDF generation for product labels
// ============================================================

import { jsPDF } from 'jspdf'
import type { LabelData, LabelConfig, LabelSize } from '../types'

interface LabelDimensions {
  widthMM: number
  heightMM: number
  cols: number
  rows: number
  marginMM: number
}

const SIZE_CONFIG: Record<LabelSize, LabelDimensions> = {
  A4:              { widthMM: 210, heightMM: 297, cols: 3, rows: 8, marginMM: 10 },
  'thermal-80':    { widthMM: 80,  heightMM: 60,  cols: 1, rows: 1, marginMM: 3 },
  'thermal-58':    { widthMM: 58,  heightMM: 40,  cols: 1, rows: 1, marginMM: 2 },
  'sticker-50x25': { widthMM: 50,  heightMM: 25,  cols: 1, rows: 1, marginMM: 2 },
  'sticker-100x50':{ widthMM: 100, heightMM: 50,  cols: 1, rows: 1, marginMM: 3 },
  custom:          { widthMM: 100, heightMM: 60,  cols: 1, rows: 1, marginMM: 3 },
}

export function generateLabelPDF(labels: LabelData[], config: LabelConfig): void {
  const dim = SIZE_CONFIG[config.size]

  const isSheet = config.size === 'A4'

  const docW = isSheet ? dim.widthMM : dim.widthMM
  const docH = isSheet ? dim.heightMM : dim.heightMM

  const doc = new jsPDF({
    unit: 'mm',
    format: isSheet ? 'a4' : [docW, docH],
    orientation: 'portrait',
  })

  const labelW = isSheet
    ? (dim.widthMM - dim.marginMM * 2) / dim.cols - 2
    : dim.widthMM - dim.marginMM * 2

  const labelH = isSheet
    ? (dim.heightMM - dim.marginMM * 2) / dim.rows - 2
    : dim.heightMM - dim.marginMM * 2

  let printed = 0
  const copies = Math.max(1, config.copies)

  for (const label of labels) {
    for (let c = 0; c < copies; c++) {
      if (isSheet) {
        const pos = printed % (dim.cols * dim.rows)
        if (printed > 0 && pos === 0) doc.addPage()
        const col = pos % dim.cols
        const row = Math.floor(pos / dim.cols)
        const x = dim.marginMM + col * (labelW + 2)
        const y = dim.marginMM + row * (labelH + 2)
        drawLabel(doc, label, config, x, y, labelW, labelH)
      } else {
        if (printed > 0) doc.addPage()
        drawLabel(doc, label, config, dim.marginMM, dim.marginMM, labelW, labelH)
      }
      printed++
    }
  }

  const filename = labels.length === 1 ? `${labels[0].sku}-label.pdf` : `labels-${labels.length}.pdf`
  doc.save(filename)
}

function drawLabel(
  doc: jsPDF,
  label: LabelData,
  config: LabelConfig,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  doc.setDrawColor('#CBD5E1')
  doc.rect(x, y, w, h)

  let cursor = y + 3
  const cx = x + w / 2
  const left = x + 2

  doc.setTextColor('#0F172A')

  if (config.showBrand && label.brand) {
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text(label.brand.toUpperCase(), cx, cursor, { align: 'center' })
    cursor += 3.5
  }

  if (label.productName) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    const lines = doc.splitTextToSize(label.productName, w - 4)
    doc.text(lines[0], cx, cursor, { align: 'center' })
    cursor += 4
  }

  doc.setFontSize(9)
  doc.setFont('courier', 'bold')
  doc.text(label.sku, cx, cursor, { align: 'center' })
  cursor += 5

  if (config.showSize && label.size) {
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`Size: ${label.size}`, left, cursor)
    cursor += 3.5
  }

  if (config.showColor && label.color) {
    doc.setFontSize(7)
    doc.text(`Color: ${label.color}`, left, cursor)
    cursor += 3.5
  }

  if (config.showMRP && label.mrp) {
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text(`MRP: ₹${label.mrp}`, cx, cursor, { align: 'center' })
    cursor += 3.5
  }

  if (config.showPrice && label.price) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(`₹${label.price}`, cx, cursor, { align: 'center' })
  }
}
