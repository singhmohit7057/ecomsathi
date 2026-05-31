// GST State Codes
export interface GSTState {
  code: string
  name: string
  zone: 'North' | 'South' | 'East' | 'West' | 'Central' | 'Northeast'
}

export const GST_STATE_CODES: GSTState[] = [
  { code: '01', name: 'Jammu & Kashmir', zone: 'North' },
  { code: '02', name: 'Himachal Pradesh', zone: 'North' },
  { code: '03', name: 'Punjab', zone: 'North' },
  { code: '04', name: 'Chandigarh', zone: 'North' },
  { code: '05', name: 'Uttarakhand', zone: 'North' },
  { code: '06', name: 'Haryana', zone: 'North' },
  { code: '07', name: 'Delhi', zone: 'North' },
  { code: '08', name: 'Rajasthan', zone: 'West' },
  { code: '09', name: 'Uttar Pradesh', zone: 'Central' },
  { code: '10', name: 'Bihar', zone: 'East' },
  { code: '11', name: 'Sikkim', zone: 'Northeast' },
  { code: '12', name: 'Arunachal Pradesh', zone: 'Northeast' },
  { code: '13', name: 'Nagaland', zone: 'Northeast' },
  { code: '14', name: 'Manipur', zone: 'Northeast' },
  { code: '15', name: 'Mizoram', zone: 'Northeast' },
  { code: '16', name: 'Tripura', zone: 'Northeast' },
  { code: '17', name: 'Meghalaya', zone: 'Northeast' },
  { code: '18', name: 'Assam', zone: 'Northeast' },
  { code: '19', name: 'West Bengal', zone: 'East' },
  { code: '20', name: 'Jharkhand', zone: 'East' },
  { code: '21', name: 'Odisha', zone: 'East' },
  { code: '22', name: 'Chhattisgarh', zone: 'Central' },
  { code: '23', name: 'Madhya Pradesh', zone: 'Central' },
  { code: '24', name: 'Gujarat', zone: 'West' },
  { code: '25', name: 'Daman & Diu', zone: 'West' },
  { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu', zone: 'West' },
  { code: '27', name: 'Maharashtra', zone: 'West' },
  { code: '28', name: 'Andhra Pradesh', zone: 'South' },
  { code: '29', name: 'Karnataka', zone: 'South' },
  { code: '30', name: 'Goa', zone: 'West' },
  { code: '31', name: 'Lakshadweep', zone: 'South' },
  { code: '32', name: 'Kerala', zone: 'South' },
  { code: '33', name: 'Tamil Nadu', zone: 'South' },
  { code: '34', name: 'Puducherry', zone: 'South' },
  { code: '35', name: 'Andaman & Nicobar Islands', zone: 'East' },
  { code: '36', name: 'Telangana', zone: 'South' },
  { code: '37', name: 'Andhra Pradesh (New)', zone: 'South' },
  { code: '38', name: 'Ladakh', zone: 'North' },
  { code: '97', name: 'Other Territory', zone: 'Central' },
  { code: '99', name: 'Centre Jurisdiction', zone: 'Central' },
]

export const ZONE_COLORS: Record<GSTState['zone'], string> = {
  North: '#3B82F6',
  South: '#10B981',
  East: '#F59E0B',
  West: '#8B5CF6',
  Central: '#EF4444',
  Northeast: '#06B6D4',
}

// GST Rates
export const GST_RATES = [0, 0.1, 0.25, 1.5, 3, 5, 7.5, 12, 18, 28] as const
export type GSTRate = (typeof GST_RATES)[number]

// GSTIN Checksum
const CHECKSUM_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function computeGSTINChecksum(gstin14: string): string {
  let sum = 0
  for (let i = 0; i < 14; i++) {
    const char = gstin14[i]
    const val = CHECKSUM_CHARS.indexOf(char)
    const product = val * (i % 2 === 0 ? 1 : 2)
    sum += Math.floor(product / 36) + (product % 36)
  }
  const remainder = sum % 36
  const check = (36 - remainder) % 36
  return CHECKSUM_CHARS[check]
}

export function validateGSTINChecksum(gstin: string): boolean {
  if (gstin.length !== 15) return false
  const expected = computeGSTINChecksum(gstin.slice(0, 14))
  return expected === gstin[14]
}

// PAN entity types (4th character of PAN = position 3 in GSTIN, i.e. index 5 of GSTIN)
export const PAN_ENTITY_TYPES: Record<string, string> = {
  P: 'Individual / Person',
  C: 'Company (Private/Public)',
  H: 'Hindu Undivided Family (HUF)',
  F: 'Firm / Partnership',
  A: 'Association of Persons (AOP)',
  T: 'Trust',
  B: 'Body of Individuals (BOI)',
  L: 'Local Authority',
  J: 'Artificial Juridical Person',
  G: 'Government Entity',
}

export function getStateByCode(code: string): GSTState | undefined {
  return GST_STATE_CODES.find(s => s.code === code)
}

export function extractGSTINInfo(gstin: string): {
  stateCode: string
  stateName: string
  pan: string
  entityNumber: string
  entityType: string
  checkDigit: string
} | null {
  if (gstin.length !== 15) return null
  const stateCode = gstin.slice(0, 2)
  const pan = gstin.slice(2, 12)
  const entityNumber = gstin[12]
  const checkDigit = gstin[14]
  const stateObj = getStateByCode(stateCode)
  const panType = pan[3]
  return {
    stateCode,
    stateName: stateObj?.name ?? 'Unknown',
    pan,
    entityNumber,
    entityType: PAN_ENTITY_TYPES[panType] ?? 'Unknown',
    checkDigit,
  }
}
