// ============================================================
// EcomSathi — SKU Generation Utilities
// ============================================================

import type { SKUComponent, SKUTemplate, GeneratedSKU } from '../types';

// -------------------------------------------------------
// generateSKU
// -------------------------------------------------------

/**
 * Generate a single SKU string from an array of components joined by `separator`.
 *
 * Component rules:
 *  - brand / category / custom / color / size / material → value uppercased, trimmed
 *  - sequence → zero-padded number (uses internal counter; pass via value)
 *  - year → full 4-digit year or last 2 digits (digits=2 → "YY")
 */
export function generateSKU(
  components: SKUComponent[],
  separator = '-',
): string {
  const year = new Date().getFullYear();
  const parts: string[] = [];

  for (const comp of components) {
    let part = '';

    switch (comp.type) {
      case 'brand':
      case 'category':
      case 'color':
      case 'size':
      case 'custom':
        if (comp.value) {
          part = comp.value
            .trim()
            .toUpperCase()
            .replace(/\s+/g, '')
            .slice(0, comp.digits ?? 100);
        }
        break;

      case 'sequence': {
        const seq = parseInt(comp.value ?? '1', 10);
        const digits = comp.digits ?? 4;
        part = String(seq).padStart(digits, '0');
        break;
      }

      case 'year':
        if (comp.digits === 2) {
          part = String(year).slice(-2);
        } else {
          part = String(year);
        }
        break;

      default:
        part = comp.value ?? '';
    }

    if (part) parts.push(part);
  }

  return parts.join(separator);
}

// -------------------------------------------------------
// generateBulkSKUs
// -------------------------------------------------------

/**
 * Generate `count` SKUs from a template, incrementing any sequence component.
 */
export function generateBulkSKUs(
  template: SKUTemplate,
  count: number,
): string[] {
  const skus: string[] = [];

  for (let i = 1; i <= count; i++) {
    const components = template.components.map((comp) => {
      if (comp.type === 'sequence') {
        return { ...comp, value: String(i) };
      }
      return comp;
    });

    skus.push(generateSKU(components, template.separator));
  }

  return skus;
}

// -------------------------------------------------------
// generateVariantSKUs
// -------------------------------------------------------

/**
 * Generate variant SKUs by appending attribute codes to a base SKU.
 *
 * @param baseSKU   The parent product SKU
 * @param variants  Array of variant attributes
 * @returns Array of GeneratedSKU objects
 */
export function generateVariantSKUs(
  baseSKU: string,
  variants: Array<{ color?: string; size?: string; material?: string }>,
): GeneratedSKU[] {
  return variants.map((variant, index) => {
    const parts: string[] = [baseSKU.toUpperCase()];

    if (variant.color) {
      parts.push(
        variant.color.trim().toUpperCase().replace(/\s+/g, '').slice(0, 3),
      );
    }
    if (variant.size) {
      parts.push(variant.size.trim().toUpperCase().replace(/\s+/g, ''));
    }
    if (variant.material) {
      parts.push(
        variant.material.trim().toUpperCase().replace(/\s+/g, '').slice(0, 3),
      );
    }

    // Append sequence suffix if no distinguishing attributes
    if (parts.length === 1) {
      parts.push(String(index + 1).padStart(3, '0'));
    }

    const sku = parts.join('-');

    return {
      sku,
      barcode: skuToBarcode(sku),
      attributes: variant as Record<string, string>,
    };
  });
}

// -------------------------------------------------------
// validateSKU
// -------------------------------------------------------

/**
 * Validate a SKU string against common rules.
 * Returns { valid, errors }.
 */
export function validateSKU(sku: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!sku || sku.trim().length === 0) {
    errors.push('SKU cannot be empty.');
    return { valid: false, errors };
  }

  const trimmed = sku.trim();

  if (trimmed.length < 3) {
    errors.push('SKU must be at least 3 characters long.');
  }

  if (trimmed.length > 64) {
    errors.push('SKU must be 64 characters or fewer.');
  }

  if (/\s/.test(trimmed)) {
    errors.push('SKU must not contain whitespace.');
  }

  if (/[^A-Za-z0-9\-_./]/.test(trimmed)) {
    errors.push(
      'SKU contains invalid characters. Allowed: A-Z, 0-9, hyphen, underscore, period, slash.',
    );
  }

  if (/^[-_./]|[-_./]$/.test(trimmed)) {
    errors.push('SKU must not start or end with a separator character (-, _, ., /).');
  }

  if (/[-_./]{2,}/.test(trimmed)) {
    errors.push('SKU must not contain consecutive separator characters.');
  }

  return { valid: errors.length === 0, errors };
}

// -------------------------------------------------------
// skuToBarcode
// -------------------------------------------------------

/**
 * Convert a SKU string to an EAN-13 compatible numeric barcode.
 *
 * Strategy:
 *  1. Extract digits from the SKU (or hash to produce digits if insufficient)
 *  2. Pad/truncate to 12 digits
 *  3. Compute EAN-13 check digit
 *  4. Return 13-character numeric string
 */
export function skuToBarcode(sku: string): string {
  // Convert SKU chars to numeric representation
  let numeric = '';
  for (const ch of sku.toUpperCase()) {
    const code = ch.charCodeAt(0);
    if (ch >= '0' && ch <= '9') {
      numeric += ch;
    } else if (ch >= 'A' && ch <= 'Z') {
      // A=10 … Z=35, map to 2 digits
      numeric += String(code - 55).padStart(2, '0');
    }
    if (numeric.length >= 12) break;
  }

  // Pad to exactly 12 digits
  numeric = numeric.slice(0, 12).padEnd(12, '0');

  // EAN-13 check digit calculation
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = parseInt(numeric[i], 10);
    sum += i % 2 === 0 ? d : d * 3;
  }
  const check = (10 - (sum % 10)) % 10;

  return numeric + String(check);
}

// -------------------------------------------------------
// SKU_PRESETS
// -------------------------------------------------------

/**
 * Four predefined SKU template presets.
 */
export const SKU_PRESETS: SKUTemplate[] = [
  {
    id: 'preset-simple',
    name: 'Simple',
    pattern: 'CATEGORY-SEQUENCE',
    separator: '-',
    components: [
      { type: 'category', value: 'PROD' },
      { type: 'sequence', digits: 5 },
    ],
  },
  {
    id: 'preset-category-based',
    name: 'Category-Based',
    pattern: 'BRAND-CATEGORY-SEQUENCE',
    separator: '-',
    components: [
      { type: 'brand', value: 'BRD' },
      { type: 'category', value: 'CAT' },
      { type: 'sequence', digits: 4 },
    ],
  },
  {
    id: 'preset-variant-aware',
    name: 'Variant-Aware',
    pattern: 'BRAND-CATEGORY-COLOR-SIZE-SEQUENCE',
    separator: '-',
    components: [
      { type: 'brand', value: 'BRD' },
      { type: 'category', value: 'CAT' },
      { type: 'color', value: 'BLK' },
      { type: 'size', value: 'M' },
      { type: 'sequence', digits: 3 },
    ],
  },
  {
    id: 'preset-brand-category',
    name: 'Brand-Category',
    pattern: 'BRAND-YEAR-CATEGORY-SEQUENCE',
    separator: '-',
    components: [
      { type: 'brand', value: 'BRD' },
      { type: 'year', digits: 2 },
      { type: 'category', value: 'CAT' },
      { type: 'sequence', digits: 4 },
    ],
  },
];
