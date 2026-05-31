// ============================================================
// EcomSathi — Core Utility Functions
// ============================================================

import { format, parseISO, isValid } from 'date-fns';
import { enIN } from 'date-fns/locale';

// -------------------------------------------------------
// cn — class name merger (clsx-like, no extra dependency)
// -------------------------------------------------------

type ClassValue = string | number | boolean | null | undefined | ClassValue[];

function flattenClasses(values: ClassValue[]): string[] {
  const result: string[] = [];
  for (const v of values) {
    if (!v) continue;
    if (typeof v === 'string' || typeof v === 'number') {
      result.push(String(v));
    } else if (Array.isArray(v)) {
      result.push(...flattenClasses(v));
    }
  }
  return result;
}

/**
 * Merge class names, filtering out falsy values.
 * Handles strings, arrays, and any falsy value.
 */
export function cn(...classes: ClassValue[]): string {
  return flattenClasses(classes).join(' ').trim();
}

// -------------------------------------------------------
// formatCurrency
// -------------------------------------------------------

/**
 * Format a number as Indian Rupee currency.
 * @example formatCurrency(1234567.89) → "₹12,34,567.89"
 */
export function formatCurrency(amount: number, currency = 'INR'): string {
  if (!isFinite(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// -------------------------------------------------------
// formatDate
// -------------------------------------------------------

/**
 * Format a date string or Date object.
 * @param date  ISO string, timestamp, or Date object
 * @param fmt   date-fns format string (default: "dd MMM yyyy")
 */
export function formatDate(
  date: string | number | Date,
  fmt = 'dd MMM yyyy',
): string {
  try {
    const d =
      typeof date === 'string'
        ? parseISO(date)
        : date instanceof Date
        ? date
        : new Date(date);

    if (!isValid(d)) return '—';
    return format(d, fmt, { locale: enIN });
  } catch {
    return '—';
  }
}

// -------------------------------------------------------
// formatFileSize
// -------------------------------------------------------

/**
 * Convert bytes to a human-readable size string.
 * @example formatFileSize(1234567) → "1.2 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 0 || !isFinite(bytes)) return '0 B';
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const index = Math.min(i, units.length - 1);
  const value = bytes / Math.pow(1024, index);

  return `${value % 1 === 0 ? value : value.toFixed(1)} ${units[index]}`;
}

// -------------------------------------------------------
// generateId
// -------------------------------------------------------

/**
 * Generate a short unique ID using Web Crypto.
 * Returns first 12 hex characters of a UUID v4.
 */
export function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
}

// -------------------------------------------------------
// slugify
// -------------------------------------------------------

/**
 * Convert a string to a URL-safe slug.
 * @example slugify("Hello World!") → "hello-world"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')    // remove non-alphanumeric
    .trim()
    .replace(/\s+/g, '-')             // spaces → hyphens
    .replace(/-+/g, '-')              // collapse multiple hyphens
    .replace(/^-|-$/g, '');           // trim leading/trailing hyphens
}

// -------------------------------------------------------
// truncate
// -------------------------------------------------------

/**
 * Truncate a string at `length` characters, appending "…".
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + '…';
}

// -------------------------------------------------------
// debounce
// -------------------------------------------------------

/**
 * Debounce a function call by `delay` milliseconds.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return function (...args: Parameters<T>) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

// -------------------------------------------------------
// downloadBlob
// -------------------------------------------------------

/**
 * Trigger a browser file download from a Blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// -------------------------------------------------------
// validateGSTIN
// -------------------------------------------------------

/**
 * Validate an Indian GSTIN (format + checksum).
 * Format: 2-digit state code + 10-char PAN + 1-digit entity + 1 Z + 1 checksum
 */
export function validateGSTIN(gstin: string): boolean {
  if (!gstin) return false;
  const cleaned = gstin.trim().toUpperCase();
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!regex.test(cleaned)) return false;

  // Mod-37 checksum
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const charVal = chars.indexOf(cleaned[i]);
    const factor = i % 2 === 0 ? 1 : 2;
    const product = charVal * factor;
    sum += Math.floor(product / 36) + (product % 36);
  }
  const checkDigit = (36 - (sum % 36)) % 36;
  return chars[checkDigit] === cleaned[14];
}

// -------------------------------------------------------
// validatePAN
// -------------------------------------------------------

/**
 * Validate an Indian PAN card number.
 * Format: 5 uppercase letters + 4 digits + 1 uppercase letter
 */
export function validatePAN(pan: string): boolean {
  if (!pan) return false;
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());
}

// -------------------------------------------------------
// parseCSV
// -------------------------------------------------------

/**
 * Parse a CSV string into an array of objects.
 * First row is treated as headers.
 * Handles quoted fields and escaped quotes ("").
 */
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length < 2) return [];

  const parseRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseRow(line);
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = values[idx] ?? '';
    });
    records.push(record);
  }

  return records;
}

// -------------------------------------------------------
// GST Calculation types
// -------------------------------------------------------

export interface GSTBreakdown {
  base: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

// -------------------------------------------------------
// calculateGST
// -------------------------------------------------------

/**
 * Calculate GST components from a base (exclusive) amount.
 * @param amount  Base amount (excluding GST)
 * @param rate    GST rate as percentage (e.g., 18 for 18%)
 * @param type    'intra' for CGST+SGST, 'inter' for IGST
 */
export function calculateGST(
  amount: number,
  rate: number,
  type: 'intra' | 'inter' = 'intra',
): GSTBreakdown {
  const base = round2(amount);
  const totalTax = round2(base * (rate / 100));

  if (type === 'inter') {
    return {
      base,
      cgst: 0,
      sgst: 0,
      igst: totalTax,
      total: round2(base + totalTax),
    };
  }

  const halfTax = round2(totalTax / 2);
  return {
    base,
    cgst: halfTax,
    sgst: halfTax,
    igst: 0,
    total: round2(base + totalTax),
  };
}

// -------------------------------------------------------
// reverseGST
// -------------------------------------------------------

/**
 * Back-calculate GST from a tax-inclusive total.
 * @param totalAmount  Amount inclusive of GST
 * @param rate         GST rate as percentage (e.g., 18)
 * @param type         'intra' for CGST+SGST, 'inter' for IGST
 */
export function reverseGST(
  totalAmount: number,
  rate: number,
  type: 'intra' | 'inter' = 'intra',
): GSTBreakdown {
  const total = round2(totalAmount);
  const base = round2(total / (1 + rate / 100));
  const totalTax = round2(total - base);

  if (type === 'inter') {
    return { base, cgst: 0, sgst: 0, igst: totalTax, total };
  }

  const halfTax = round2(totalTax / 2);
  return { base, cgst: halfTax, sgst: halfTax, igst: 0, total };
}

// -------------------------------------------------------
// Internal helpers
// -------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
