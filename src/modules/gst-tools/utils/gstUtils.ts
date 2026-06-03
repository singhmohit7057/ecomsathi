// ============================================================
// GST Tools — Shared Utilities
// ============================================================

import type { GSTBreakdown, GSTSlab, TaxType } from '../types'

/** Calculate GST breakdown from base amount */
export function calculateGSTFromBase(
  baseAmount: number,
  rate: GSTSlab,
  taxType: TaxType,
): GSTBreakdown {
  const totalTax = (baseAmount * rate) / 100
  const half = totalTax / 2
  return {
    baseAmount,
    cgst: taxType === 'intra' ? half : 0,
    sgst: taxType === 'intra' ? half : 0,
    igst: taxType === 'inter' ? totalTax : 0,
    totalTax,
    totalAmount: baseAmount + totalTax,
    taxType,
    rate,
  }
}

/** Reverse-calculate base amount from GST-inclusive total */
export function calculateGSTFromTotal(
  totalAmount: number,
  rate: GSTSlab,
  taxType: TaxType,
): GSTBreakdown {
  const baseAmount = (totalAmount * 100) / (100 + rate)
  return calculateGSTFromBase(baseAmount, rate, taxType)
}

/** Validate a GSTIN string — format only (15 chars, correct structure) */
export function isValidGSTINFormat(gstin: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin.toUpperCase())
}

/** Validate a PAN string */
export function isValidPANFormat(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())
}

/** Get state name from 2-digit GST state code */
export function getStateName(code: string): string {
  return GST_STATES[code] ?? 'Unknown'
}

export const GST_STATES: Record<string, string> = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
  '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
  '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
  '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
  '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
  '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
  '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
  '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '25': 'Daman & Diu', '26': 'Dadra & Nagar Haveli', '27': 'Maharashtra',
  '28': 'Andhra Pradesh (old)', '29': 'Karnataka', '30': 'Goa',
  '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu',
  '34': 'Puducherry', '35': 'Andaman & Nicobar', '36': 'Telangana',
  '37': 'Andhra Pradesh', '38': 'Ladakh',
}

export const GST_SLABS: GSTSlab[] = [0, 5, 12, 18, 28]

export const SITE_URL = 'https://ecomsathi.in'

export function canonical(path: string): string {
  return `${SITE_URL}${path}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
}
