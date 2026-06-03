// ============================================================
// SKU Tools — Shared Types
// ============================================================

export type BarcodeFormat = 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'QRCode'

export type Separator = '-' | '_' | '/' | '.'

export type LabelSize = 'A4' | 'thermal-80' | 'thermal-58' | 'sticker-50x25' | 'sticker-100x50' | 'custom'

export type LabelTemplate = 'simple' | 'detailed' | 'barcode-only' | 'qr-label' | 'price-tag'

export interface SKUFormData {
  brand: string
  productName: string
  category: string
  color: string
  size: string
  prefix: string
  suffix: string
  skuLength: number
  separator: Separator
  autoNumber: boolean
  sequence: number
}

export interface VariantSKUInput {
  productName: string
  brand: string
  separator: Separator
  colors: string[]
  sizes: string[]
  materials: string[]
  genders: string[]
}

export interface VariantSKURow {
  sku: string
  color: string
  size: string
  material: string
  gender: string
}

export interface CustomPatternToken {
  id: string
  type: 'BRAND' | 'CATEGORY' | 'COLOR' | 'SIZE' | 'YEAR' | 'NUMBER' | 'PREFIX' | 'SUFFIX' | 'TEXT'
  label: string
  value?: string
}

export interface CustomPattern {
  tokens: CustomPatternToken[]
  separator: Separator
  startNumber: number
  padding: number
}

export interface BulkSKURow {
  productName: string
  brand: string
  color: string
  size: string
  category: string
  generatedSKU?: string
  error?: string
}

export interface LabelData {
  sku: string
  productName: string
  brand: string
  price: string
  mrp: string
  size: string
  color: string
  barcode?: string
  barcodeFormat?: BarcodeFormat
}

export interface LabelConfig {
  template: LabelTemplate
  size: LabelSize
  customWidth?: number
  customHeight?: number
  copies: number
  showBrand: boolean
  showBarcode: boolean
  showPrice: boolean
  showMRP: boolean
  showSize: boolean
  showColor: boolean
}

export interface FAQItem {
  question: string
  answer: string
}

export interface RelatedSKUTool {
  label: string
  to: string
  description?: string
}
