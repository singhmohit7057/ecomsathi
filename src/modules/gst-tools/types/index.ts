// ============================================================
// GST Tools — Shared Types
// ============================================================

export type GSTSlab = 0 | 5 | 12 | 18 | 28

export type TaxType = 'intra' | 'inter'   // intra = CGST+SGST, inter = IGST

export interface GSTBreakdown {
  baseAmount: number
  cgst: number
  sgst: number
  igst: number
  totalTax: number
  totalAmount: number
  taxType: TaxType
  rate: GSTSlab
}

export interface GSTINInfo {
  gstin: string
  legalName: string
  tradeName: string
  stateCode: string
  stateName: string
  registrationDate: string
  status: 'Active' | 'Cancelled' | 'Suspended' | 'Unknown'
  taxpayerType: string
}

export interface HSNEntry {
  code: string
  description: string
  gstRate: number
  chapter: string
}

export interface SACEntry {
  code: string
  description: string
  gstRate: number
  section: string
}

export interface GSTToolCardData {
  icon: React.ReactNode
  title: string
  description: string
  path: string
  accent: string
  badge?: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface RelatedGSTTool {
  label: string
  to: string
  description?: string
}
