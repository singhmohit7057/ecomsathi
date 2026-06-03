// ============================================================
// GST API Service — GSTIN verification and live lookups
// ============================================================

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'https://api.ecomsathi.in'

async function get<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${endpoint}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { message?: string }).message ?? `Server error ${res.status}`)
  }
  return res.json() as Promise<T>
}

export interface GSTINVerifyResult {
  gstin: string
  legalName: string
  tradeName: string
  stateCode: string
  stateName: string
  registrationDate: string
  status: string
  taxpayerType: string
  isValid: boolean
}

/** Verify a GSTIN against the live GSTN portal via backend proxy */
export async function verifyGSTIN(gstin: string): Promise<GSTINVerifyResult> {
  return get<GSTINVerifyResult>(`/api/gst/verify?gstin=${encodeURIComponent(gstin)}`)
}

export interface HSNLookupResult {
  code: string
  description: string
  gstRate: number
  chapter: string
  section: string
}

/** Fetch HSN code details from backend */
export async function lookupHSN(code: string): Promise<HSNLookupResult> {
  return get<HSNLookupResult>(`/api/gst/hsn?code=${encodeURIComponent(code)}`)
}

export interface SACLookupResult {
  code: string
  description: string
  gstRate: number
  section: string
}

/** Fetch SAC code details from backend */
export async function lookupSAC(code: string): Promise<SACLookupResult> {
  return get<SACLookupResult>(`/api/gst/sac?code=${encodeURIComponent(code)}`)
}
