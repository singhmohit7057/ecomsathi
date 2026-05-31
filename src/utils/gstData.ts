// ============================================================
// EcomSathi — GST Static Data & Calculation Utilities
// ============================================================

// -------------------------------------------------------
// GST_STATE_CODES
// All 28 States + 8 Union Territories (38 entries)
// -------------------------------------------------------

export const GST_STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman & Diu',
  '26': 'Dadra & Nagar Haveli and Daman & Diu',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh (Old)',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
};

// -------------------------------------------------------
// GST_RATES
// All valid GST rate slabs (percent)
// -------------------------------------------------------

export const GST_RATES: number[] = [
  0, 0.1, 0.25, 1.5, 3, 5, 7.5, 12, 18, 28,
];

// -------------------------------------------------------
// CESS_CATEGORIES
// Selected items that attract GST Cess (non-exhaustive, illustrative)
// -------------------------------------------------------

export interface CessCategory {
  name: string;
  gstRate: number;
  cessRate: number;
  description: string;
}

export const CESS_CATEGORIES: CessCategory[] = [
  {
    name: 'Pan Masala',
    gstRate: 28,
    cessRate: 60,
    description: 'Pan masala and similar products',
  },
  {
    name: 'Tobacco Products',
    gstRate: 28,
    cessRate: 36,
    description: 'Cigarettes, beedis, and chewing tobacco',
  },
  {
    name: 'Aerated Drinks',
    gstRate: 28,
    cessRate: 12,
    description: 'Carbonated beverages with sugar',
  },
  {
    name: 'Coal',
    gstRate: 5,
    cessRate: 1.2,
    description: 'Coal, lignite, peat (per tonne flat cess)',
  },
  {
    name: 'Small Petrol Cars (< 1200cc)',
    gstRate: 28,
    cessRate: 1,
    description: 'Motor vehicles with petrol engine < 1200 cc',
  },
  {
    name: 'Small Diesel Cars (< 1500cc)',
    gstRate: 28,
    cessRate: 3,
    description: 'Motor vehicles with diesel engine < 1500 cc',
  },
  {
    name: 'Large Cars (>= 1500cc)',
    gstRate: 28,
    cessRate: 15,
    description: 'Large and luxury motor vehicles',
  },
  {
    name: 'SUVs',
    gstRate: 28,
    cessRate: 22,
    description: 'Sport utility vehicles exceeding defined parameters',
  },
  {
    name: 'Mid-segment Hybrid Cars',
    gstRate: 28,
    cessRate: 15,
    description: 'Hybrid vehicles (mid segment)',
  },
  {
    name: 'High-end Motorcycles (> 350cc)',
    gstRate: 28,
    cessRate: 3,
    description: 'Motor cycles with engine capacity > 350 cc',
  },
  {
    name: 'Yachts & Personal Watercraft',
    gstRate: 28,
    cessRate: 3,
    description: 'Yachts, pleasure or sporting boats',
  },
  {
    name: 'Aircraft for Personal Use',
    gstRate: 28,
    cessRate: 3,
    description: 'Private aircraft and balloons',
  },
];

// -------------------------------------------------------
// validateGSTINChecksum
// -------------------------------------------------------

/**
 * Validate the check digit of an Indian GSTIN using the
 * mod-37 Luhn-like algorithm specified by GSTN.
 *
 * Character map: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
 * Weights alternate between 1 and 2 for positions 0–13.
 * Each product is reduced: floor(product / 36) + (product % 36).
 * Sum is reduced mod 36, check = (36 - sum % 36) % 36.
 */
export function validateGSTINChecksum(gstin: string): boolean {
  if (!gstin || gstin.length !== 15) return false;

  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const upper = gstin.trim().toUpperCase();

  // Validate all 15 chars are in the character set
  for (const ch of upper) {
    if (!chars.includes(ch)) return false;
  }

  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const charVal = chars.indexOf(upper[i]);
    const factor = i % 2 === 0 ? 1 : 2;
    const product = charVal * factor;
    sum += Math.floor(product / 36) + (product % 36);
  }

  const checkIndex = (36 - (sum % 36)) % 36;
  return chars[checkIndex] === upper[14];
}

// -------------------------------------------------------
// extractStateFromGSTIN
// -------------------------------------------------------

/**
 * Extract the state code and name from a GSTIN.
 * Returns null if the GSTIN is too short or the code is unrecognised.
 */
export function extractStateFromGSTIN(
  gstin: string,
): { code: string; name: string } | null {
  if (!gstin || gstin.length < 2) return null;

  const code = gstin.trim().slice(0, 2);
  const name = GST_STATE_CODES[code];

  if (!name) return null;
  return { code, name };
}

// -------------------------------------------------------
// extractPANFromGSTIN
// -------------------------------------------------------

/**
 * Extract the PAN number embedded in a GSTIN (positions 2–11).
 * Returns null if the GSTIN is too short.
 */
export function extractPANFromGSTIN(gstin: string): string | null {
  if (!gstin || gstin.trim().length < 12) return null;
  return gstin.trim().toUpperCase().slice(2, 12);
}

// -------------------------------------------------------
// GSTBreakdown (full version including cess)
// -------------------------------------------------------

export interface GSTBreakdown {
  base: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  total: number;
}

// -------------------------------------------------------
// calculateGSTBreakdown
// -------------------------------------------------------

/**
 * Calculate GST breakdown from a base (exclusive) amount.
 *
 * @param amount       Base amount (pre-tax)
 * @param rate         GST rate as percentage (e.g., 18)
 * @param isInterState true → IGST only; false → CGST + SGST
 * @param cessRate     Optional cess rate as percentage (default 0)
 */
export function calculateGSTBreakdown(
  amount: number,
  rate: number,
  isInterState: boolean,
  cessRate = 0,
): GSTBreakdown {
  const base = round2(amount);
  const totalGST = round2(base * (rate / 100));
  const cess = round2(base * (cessRate / 100));

  if (isInterState) {
    return {
      base,
      cgst: 0,
      sgst: 0,
      igst: totalGST,
      cess,
      total: round2(base + totalGST + cess),
    };
  }

  const halfGST = round2(totalGST / 2);
  return {
    base,
    cgst: halfGST,
    sgst: halfGST,
    igst: 0,
    cess,
    total: round2(base + totalGST + cess),
  };
}

// -------------------------------------------------------
// reverseGSTCalculation
// -------------------------------------------------------

/**
 * Back-calculate GST components from a tax-inclusive total.
 *
 * @param totalAmount  Amount inclusive of GST (and cess if applicable)
 * @param rate         GST rate as percentage
 * @param isInterState true → IGST only; false → CGST + SGST
 * @param cessRate     Optional cess rate as percentage (default 0)
 */
export function reverseGSTCalculation(
  totalAmount: number,
  rate: number,
  isInterState: boolean,
  cessRate = 0,
): GSTBreakdown {
  const total = round2(totalAmount);
  const combinedRate = rate + cessRate;
  const base = round2(total / (1 + combinedRate / 100));
  const totalGST = round2(base * (rate / 100));
  const cess = round2(base * (cessRate / 100));

  if (isInterState) {
    return {
      base,
      cgst: 0,
      sgst: 0,
      igst: totalGST,
      cess,
      total,
    };
  }

  const halfGST = round2(totalGST / 2);
  return {
    base,
    cgst: halfGST,
    sgst: halfGST,
    igst: 0,
    cess,
    total,
  };
}

// -------------------------------------------------------
// Internal helpers
// -------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
