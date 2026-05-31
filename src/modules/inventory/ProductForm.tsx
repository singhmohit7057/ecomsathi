// ============================================================
// EcomSathi — Product Form (Add / Edit)
// ============================================================
import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Zap, ImagePlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuth } from '@/hooks/useAuth';
import {
  createProduct,
  updateProduct,
  createVariant,
  updateVariant,
  deleteVariant,
} from '@/services/productService';
import { generateVariantSKUs } from '@/utils/skuGenerator';
import type { Product, ProductVariant } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Apparel', 'Electronics', 'Footwear', 'Home & Kitchen',
  'Beauty', 'Sports', 'Toys', 'Books', 'Jewelry', 'Other',
];

const GST_RATES = [0, 5, 12, 18, 28] as const;

const COMMON_HSN: { code: string; description: string }[] = [
  { code: '6203', description: 'Men\'s Apparel' },
  { code: '6204', description: 'Women\'s Apparel' },
  { code: '6403', description: 'Footwear' },
  { code: '8471', description: 'Computers & Tablets' },
  { code: '8517', description: 'Mobile Phones' },
  { code: '3304', description: 'Beauty Products' },
  { code: '9503', description: 'Toys' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantRow {
  id?: string;          // existing variant id
  color: string;
  size: string;
  sku: string;
  barcode: string;
  mrp: string;
  cost_price: string;
  weight_grams: string;
}

interface ProductFormProps {
  initialData?: Product;
  onSaved: () => void;
  onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSaved,
  onCancel,
}) => {
  const { user } = useAuth();

  // ── Basic Info ─────────────────────────────────────────────────────────────
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [brand, setBrand] = useState(initialData?.brand ?? '');
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [tagInput, setTagInput] = useState('');

  // ── Pricing ────────────────────────────────────────────────────────────────
  const [mrp, setMrp] = useState(initialData?.mrp?.toString() ?? '');
  const [costPrice, setCostPrice] = useState(initialData?.cost_price?.toString() ?? '');
  const [sellingPrice, setSellingPrice] = useState(initialData?.selling_price?.toString() ?? '');

  // ── Tax ────────────────────────────────────────────────────────────────────
  const [hsnCode, setHsnCode] = useState(initialData?.hsn_code ?? '');
  const [hsnSearch, setHsnSearch] = useState('');
  const [showHsnDropdown, setShowHsnDropdown] = useState(false);
  const [gstRate, setGstRate] = useState<number>(initialData?.gst_rate ?? 18);

  // ── Images (URL placeholders) ──────────────────────────────────────────────
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [isDragging, setIsDragging] = useState(false);

  // ── Variants ───────────────────────────────────────────────────────────────
  const [hasVariants, setHasVariants] = useState(
    (initialData?.variants?.length ?? 0) > 0
  );
  const [colorValues, setColorValues] = useState<string[]>(['Black', 'White']);
  const [sizeValues, setSizeValues] = useState<string[]>(['S', 'M', 'L']);
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');

  const buildInitialRows = (): VariantRow[] => {
    if (!initialData?.variants?.length) return [];
    return initialData.variants.map(v => ({
      id: v.id,
      color: v.attributes?.color ?? '',
      size: v.attributes?.size ?? '',
      sku: v.sku,
      barcode: v.barcode ?? '',
      mrp: v.mrp?.toString() ?? '',
      cost_price: v.cost_price?.toString() ?? '',
      weight_grams: v.weight_grams?.toString() ?? '',
    }));
  };

  const [variantRows, setVariantRows] = useState<VariantRow[]>(buildInitialRows);
  const [saving, setSaving] = useState(false);

  // ── HSN search ─────────────────────────────────────────────────────────────
  const filteredHSN = COMMON_HSN.filter(h =>
    h.code.includes(hsnSearch) ||
    h.description.toLowerCase().includes(hsnSearch.toLowerCase())
  );

  // ── Image drag-drop (placeholder — stores URL strings only) ───────────────
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // In production this would upload and get back a URL.
    // For now, treat dropped text as URL.
    const text = e.dataTransfer.getData('text/plain');
    if (text && text.startsWith('http')) {
      setImages(prev => [...prev, text]);
    } else {
      toast('Image upload: placeholder — URL storage only in this demo');
    }
  };

  const addImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url && url.startsWith('http')) {
      setImages(prev => [...prev, url]);
    }
  };

  // ── Variant generation ────────────────────────────────────────────────────
  const handleGenerateSKUs = useCallback(() => {
    if (!name) {
      toast.error('Enter a product name first');
      return;
    }
    const baseSKU = name.trim().toUpperCase().replace(/\s+/g, '-').slice(0, 8);
    const combinations: { color?: string; size?: string }[] = [];

    if (colorValues.length && sizeValues.length) {
      for (const color of colorValues) {
        for (const size of sizeValues) {
          combinations.push({ color, size });
        }
      }
    } else if (colorValues.length) {
      colorValues.forEach(color => combinations.push({ color }));
    } else if (sizeValues.length) {
      sizeValues.forEach(size => combinations.push({ size }));
    }

    const generated = generateVariantSKUs(baseSKU, combinations);

    const rows: VariantRow[] = generated.map((g, i) => ({
      color: combinations[i]?.color ?? '',
      size: combinations[i]?.size ?? '',
      sku: g.sku,
      barcode: g.barcode ?? '',
      mrp: mrp,
      cost_price: costPrice,
      weight_grams: '',
    }));

    setVariantRows(rows);
    toast.success(`Generated ${rows.length} variant${rows.length !== 1 ? 's' : ''}`);
  }, [name, colorValues, sizeValues, mrp, costPrice]);

  const updateVariantRow = (index: number, field: keyof VariantRow, value: string) => {
    setVariantRows(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeVariantRow = (index: number) => {
    setVariantRows(prev => prev.filter((_, i) => i !== index));
  };

  const addVariantRow = () => {
    setVariantRows(prev => [
      ...prev,
      { color: '', size: '', sku: '', barcode: '', mrp: '', cost_price: '', weight_grams: '' },
    ]);
  };

  // ── Tags ───────────────────────────────────────────────────────────────────
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t]);
    }
    setTagInput('');
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user?.org_id) return;
    if (!name.trim()) { toast.error('Product name is required'); return; }

    setSaving(true);
    try {
      const productPayload = {
        name: name.trim(),
        description: description.trim() || null,
        category: category || null,
        brand: brand.trim() || null,
        tags,
        hsn_code: hsnCode || null,
        gst_rate: gstRate,
        mrp: mrp ? parseFloat(mrp) : null,
        cost_price: costPrice ? parseFloat(costPrice) : null,
        selling_price: sellingPrice ? parseFloat(sellingPrice) : null,
        images,
        is_active: true,
      };

      let productId: string;

      if (initialData) {
        const updated = await updateProduct(initialData.id, productPayload);
        productId = updated.id;
      } else {
        const created = await createProduct(user.org_id, productPayload);
        productId = created.id;
      }

      // Save variants
      if (hasVariants && variantRows.length > 0) {
        await Promise.all(
          variantRows.map(row => {
            const vData = {
              sku: row.sku.trim(),
              barcode: row.barcode || null,
              name: [row.color, row.size].filter(Boolean).join(' / ') || row.sku,
              attributes: { color: row.color, size: row.size },
              mrp: row.mrp ? parseFloat(row.mrp) : null,
              cost_price: row.cost_price ? parseFloat(row.cost_price) : null,
              selling_price: null,
              weight_grams: row.weight_grams ? parseInt(row.weight_grams, 10) : null,
              dimensions: null,
              is_active: true,
            };
            if (row.id) {
              return updateVariant(row.id, vData);
            }
            return createVariant(productId, vData);
          })
        );
      }

      toast.success(initialData ? 'Product updated' : 'Product created');
      onSaved();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 text-sm">
      {/* Basic Info */}
      <section className="space-y-4">
        <h3 className="font-semibold text-[#0F172A] border-b border-[#E2E8F0] pb-2">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Product Name *"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Men's Cotton T-Shirt"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-[#0F172A]">Description</label>
            <textarea
              className="mt-1 w-full border border-[#94A3B8] rounded-[4px] px-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-y min-h-[80px]"
              placeholder="Short product description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#0F172A] block mb-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border border-[#94A3B8] rounded-[4px] px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white"
            >
              <option value="">Select category...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input
            label="Brand"
            value={brand}
            onChange={e => setBrand(e.target.value)}
            placeholder="e.g. Nike"
          />
          {/* Tags */}
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-[#0F172A] block mb-1">Tags</label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              />
              <Button variant="ghost" size="sm" onClick={addTag}>Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 bg-[#EFF6FF] text-[#2563EB] text-xs px-2 py-1 rounded-full">
                    {t}
                    <button type="button" onClick={() => setTags(prev => prev.filter(x => x !== t))} className="hover:text-[#1D4ED8]">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="space-y-4">
        <h3 className="font-semibold text-[#0F172A] border-b border-[#E2E8F0] pb-2">Pricing</h3>
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="MRP (₹)"
            type="number"
            min="0"
            step="0.01"
            value={mrp}
            onChange={e => setMrp(e.target.value)}
            placeholder="0.00"
          />
          <Input
            label="Cost Price (₹)"
            type="number"
            min="0"
            step="0.01"
            value={costPrice}
            onChange={e => setCostPrice(e.target.value)}
            placeholder="0.00"
          />
          <Input
            label="Selling Price (₹)"
            type="number"
            min="0"
            step="0.01"
            value={sellingPrice}
            onChange={e => setSellingPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>
      </section>

      {/* Tax */}
      <section className="space-y-4">
        <h3 className="font-semibold text-[#0F172A] border-b border-[#E2E8F0] pb-2">Tax Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <Input
              label="HSN Code"
              value={hsnCode}
              onChange={e => {
                setHsnCode(e.target.value);
                setHsnSearch(e.target.value);
                setShowHsnDropdown(true);
              }}
              onFocus={() => setShowHsnDropdown(true)}
              onBlur={() => setTimeout(() => setShowHsnDropdown(false), 150)}
              placeholder="Search HSN code..."
            />
            {showHsnDropdown && filteredHSN.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 bg-white border border-[#E2E8F0] rounded-[4px] shadow-lg mt-1 max-h-40 overflow-y-auto">
                {filteredHSN.map(h => (
                  <button
                    key={h.code}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#F8FAFC] flex justify-between gap-2"
                    onClick={() => {
                      setHsnCode(h.code);
                      setHsnSearch('');
                      setShowHsnDropdown(false);
                    }}
                  >
                    <span className="font-mono font-medium">{h.code}</span>
                    <span className="text-[#64748B] truncate">{h.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-[#0F172A] block mb-1">GST Rate</label>
            <select
              value={gstRate}
              onChange={e => setGstRate(Number(e.target.value))}
              className="w-full border border-[#94A3B8] rounded-[4px] px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white"
            >
              {GST_RATES.map(r => (
                <option key={r} value={r}>{r}%</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="space-y-3">
        <h3 className="font-semibold text-[#0F172A] border-b border-[#E2E8F0] pb-2">Images</h3>
        <div
          className={`border-2 border-dashed rounded-[8px] p-6 text-center transition-colors ${isDragging ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#CBD5E1] hover:border-[#94A3B8]'}`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <ImagePlus size={24} className="mx-auto text-[#94A3B8] mb-2" />
          <p className="text-sm text-[#64748B]">Drag & drop images here, or</p>
          <button
            type="button"
            className="mt-2 text-[#2563EB] text-sm font-medium hover:underline"
            onClick={addImageUrl}
          >
            Add image URL
          </button>
          <p className="text-xs text-[#94A3B8] mt-1">Placeholder implementation — stores URLs only</p>
        </div>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((url, idx) => (
              <div key={idx} className="relative group w-16 h-16 rounded-[4px] overflow-hidden border border-[#E2E8F0]">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Variants */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
          <h3 className="font-semibold text-[#0F172A]">Variants</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-[#64748B]">Has Variants</span>
            <button
              type="button"
              onClick={() => setHasVariants(prev => !prev)}
              className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${hasVariants ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]'}`}
            >
              <span
                className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform ${hasVariants ? 'translate-x-4' : 'translate-x-0.5'}`}
              />
            </button>
          </label>
        </div>

        {hasVariants && (
          <div className="space-y-4">
            {/* Attribute builder */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-[#F8FAFC] rounded-[6px] border border-[#E2E8F0]">
              <div>
                <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-2">Color Values</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {colorValues.map(c => (
                    <span key={c} className="inline-flex items-center gap-1 bg-white border border-[#E2E8F0] text-xs px-2 py-1 rounded">
                      {c}
                      <button type="button" onClick={() => setColorValues(p => p.filter(x => x !== c))}>
                        <X size={10} className="text-[#94A3B8] hover:text-[#DC2626]" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-[#94A3B8] rounded-[4px] px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30"
                    placeholder="Add color..."
                    value={colorInput}
                    onChange={e => setColorInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const v = colorInput.trim();
                        if (v && !colorValues.includes(v)) setColorValues(p => [...p, v]);
                        setColorInput('');
                      }
                    }}
                  />
                  <Button variant="ghost" size="sm" onClick={() => {
                    const v = colorInput.trim();
                    if (v && !colorValues.includes(v)) setColorValues(p => [...p, v]);
                    setColorInput('');
                  }}>
                    <Plus size={12} />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-2">Size Values</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {sizeValues.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 bg-white border border-[#E2E8F0] text-xs px-2 py-1 rounded">
                      {s}
                      <button type="button" onClick={() => setSizeValues(p => p.filter(x => x !== s))}>
                        <X size={10} className="text-[#94A3B8] hover:text-[#DC2626]" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-[#94A3B8] rounded-[4px] px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30"
                    placeholder="Add size..."
                    value={sizeInput}
                    onChange={e => setSizeInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const v = sizeInput.trim();
                        if (v && !sizeValues.includes(v)) setSizeValues(p => [...p, v]);
                        setSizeInput('');
                      }
                    }}
                  />
                  <Button variant="ghost" size="sm" onClick={() => {
                    const v = sizeInput.trim();
                    if (v && !sizeValues.includes(v)) setSizeValues(p => [...p, v]);
                    setSizeInput('');
                  }}>
                    <Plus size={12} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Zap size={14} />}
                onClick={handleGenerateSKUs}
              >
                Generate SKUs
              </Button>
              <Button variant="ghost" size="sm" leftIcon={<Plus size={14} />} onClick={addVariantRow}>
                Add Row
              </Button>
            </div>

            {/* Variant grid */}
            {variantRows.length > 0 && (
              <div className="overflow-x-auto border border-[#E2E8F0] rounded-[6px]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <th className="px-2 py-2 text-left font-medium text-[#64748B]">Color</th>
                      <th className="px-2 py-2 text-left font-medium text-[#64748B]">Size</th>
                      <th className="px-2 py-2 text-left font-medium text-[#64748B]">SKU *</th>
                      <th className="px-2 py-2 text-left font-medium text-[#64748B]">Barcode</th>
                      <th className="px-2 py-2 text-left font-medium text-[#64748B]">MRP</th>
                      <th className="px-2 py-2 text-left font-medium text-[#64748B]">Cost</th>
                      <th className="px-2 py-2 text-left font-medium text-[#64748B]">Weight (g)</th>
                      <th className="px-2 py-2 text-center font-medium text-[#64748B]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {variantRows.map((row, idx) => (
                      <tr key={idx} className="border-b border-[#F1F5F9] last:border-0">
                        {(['color', 'size', 'sku', 'barcode', 'mrp', 'cost_price', 'weight_grams'] as const).map(field => (
                          <td key={field} className="px-2 py-1.5">
                            <input
                              className="w-full border border-[#E2E8F0] rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                              value={row[field]}
                              onChange={e => updateVariantRow(idx, field, e.target.value)}
                              placeholder={field === 'sku' ? 'Required' : ''}
                            />
                          </td>
                        ))}
                        <td className="px-2 py-1.5 text-center">
                          <button
                            type="button"
                            className="text-[#DC2626] hover:bg-[#FEF2F2] rounded p-1 transition-colors"
                            onClick={() => removeVariantRow(idx)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-2 border-t border-[#E2E8F0]">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button onClick={() => void handleSave()} loading={saving}>
          {initialData ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>
    </div>
  );
};

export default ProductForm;
