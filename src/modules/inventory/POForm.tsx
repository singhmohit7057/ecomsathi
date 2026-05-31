// ============================================================
// EcomSathi — Purchase Order Form (Create / Edit)
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/supabase/client';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuth } from '@/hooks/useAuth';
import { getWarehouses } from '@/services/inventoryService';
import type { PurchaseOrder, PurchaseOrderItem, Warehouse } from '@/types';

// ─── Auto-generate PO Number ──────────────────────────────────────────────────

function generatePONumber(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `PO-${year}-${seq}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItem {
  variant_id: string;
  sku: string;
  variantName: string;
  quantity_ordered: number | '';
  unit_cost: number | '';
}

interface POFormProps {
  initialData?: PurchaseOrder;
  onSaved: (poId: string) => void;
  onCancel: () => void;
}

// ─── Variant search results type ──────────────────────────────────────────────

interface VariantSearchResult {
  id: string;
  sku: string;
  name: string;
  product?: { name: string } | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const POForm: React.FC<POFormProps> = ({ initialData, onSaved, onCancel }) => {
  const { user } = useAuth();

  const [poNumber, setPoNumber] = useState(initialData?.po_number ?? generatePONumber());
  const [supplierName, setSupplierName] = useState(initialData?.supplier_name ?? '');
  const [supplierGstin, setSupplierGstin] = useState(initialData?.supplier_gstin ?? '');
  const [warehouseId, setWarehouseId] = useState(initialData?.warehouse_id ?? '');
  const [expectedDate, setExpectedDate] = useState(initialData?.expected_date?.slice(0, 10) ?? '');
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [lines, setLines] = useState<LineItem[]>(() =>
    initialData?.items?.map(i => ({
      variant_id: i.variant_id,
      sku: i.variant?.sku ?? '',
      variantName: i.variant?.name ?? '',
      quantity_ordered: i.quantity_ordered,
      unit_cost: i.unit_cost,
    })) ?? []
  );

  // Variant search
  const [variantSearch, setVariantSearch] = useState('');
  const [variantResults, setVariantResults] = useState<VariantSearchResult[]>([]);
  const [showVariantDropdown, setShowVariantDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── fetch warehouses ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.org_id) return;
    getWarehouses(user.org_id)
      .then(whs => {
        setWarehouses(whs as unknown as Warehouse[]);
        if (!warehouseId && whs.length > 0) {
          const def = whs.find(w => (w as unknown as { is_default: boolean }).is_default);
          setWarehouseId(def?.id ?? whs[0].id);
        }
      })
      .catch(() => toast.error('Failed to load warehouses'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.org_id]);

  // ── variant search ────────────────────────────────────────────────────────
  const searchVariants = useCallback(async (q: string) => {
    if (!q.trim() || !user?.org_id) { setVariantResults([]); return; }
    setSearching(true);
    try {
      const { data } = await supabase
        .from('product_variants')
        .select('id, sku, name, product:products(name)')
        .ilike('sku', `%${q}%`)
        .limit(10);
      setVariantResults((data ?? []) as unknown as VariantSearchResult[]);
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  }, [user?.org_id]);

  useEffect(() => {
    const timer = setTimeout(() => void searchVariants(variantSearch), 300);
    return () => clearTimeout(timer);
  }, [variantSearch, searchVariants]);

  // ── line operations ───────────────────────────────────────────────────────
  const addLine = (variant: VariantSearchResult) => {
    const exists = lines.find(l => l.variant_id === variant.id);
    if (exists) { toast('Variant already in list'); return; }
    setLines(prev => [
      ...prev,
      {
        variant_id: variant.id,
        sku: variant.sku,
        variantName: `${variant.product?.name ?? ''} ${variant.name}`.trim(),
        quantity_ordered: 1,
        unit_cost: '',
      },
    ]);
    setVariantSearch('');
    setShowVariantDropdown(false);
  };

  const updateLine = <K extends keyof LineItem>(idx: number, key: K, value: LineItem[K]) => {
    setLines(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
  };

  const removeLine = (idx: number) => {
    setLines(prev => prev.filter((_, i) => i !== idx));
  };

  const totalAmount = lines.reduce((sum, l) => {
    const qty = typeof l.quantity_ordered === 'number' ? l.quantity_ordered : 0;
    const cost = typeof l.unit_cost === 'number' ? l.unit_cost : 0;
    return sum + qty * cost;
  }, 0);

  // ── save ──────────────────────────────────────────────────────────────────
  const handleSave = async (asDraft = true) => {
    if (!user?.org_id) return;
    if (!poNumber.trim()) { toast.error('PO number required'); return; }
    if (!warehouseId) { toast.error('Select a warehouse'); return; }
    if (lines.length === 0) { toast.error('Add at least one line item'); return; }

    const invalidLine = lines.find(l => !l.quantity_ordered || typeof l.quantity_ordered !== 'number' || l.quantity_ordered <= 0);
    if (invalidLine) { toast.error('All line items must have a valid quantity'); return; }

    setSaving(true);
    try {
      const status = asDraft ? 'draft' : 'pending';

      let poId: string;

      if (initialData) {
        const { data, error } = await supabase
          .from('purchase_orders')
          .update({
            po_number: poNumber,
            supplier_name: supplierName || null,
            supplier_gstin: supplierGstin || null,
            warehouse_id: warehouseId,
            expected_date: expectedDate || null,
            notes: notes || null,
            status,
            total_amount: totalAmount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', initialData.id)
          .select('id')
          .single();

        if (error) throw error;
        poId = data.id;

        // Delete old items and re-insert
        await supabase.from('purchase_order_items').delete().eq('po_id', poId);
      } else {
        const { data, error } = await supabase
          .from('purchase_orders')
          .insert({
            org_id: user.org_id,
            po_number: poNumber,
            supplier_name: supplierName || null,
            supplier_gstin: supplierGstin || null,
            warehouse_id: warehouseId,
            expected_date: expectedDate || null,
            notes: notes || null,
            status,
            total_amount: totalAmount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (error) throw error;
        poId = data.id;
      }

      // Insert line items
      const items = lines.map(l => ({
        po_id: poId,
        variant_id: l.variant_id,
        quantity_ordered: Number(l.quantity_ordered),
        quantity_received: 0,
        unit_cost: Number(l.unit_cost) || 0,
        total_cost: Number(l.quantity_ordered) * (Number(l.unit_cost) || 0),
      }));

      const { error: itemsErr } = await supabase.from('purchase_order_items').insert(items);
      if (itemsErr) throw itemsErr;

      toast.success(asDraft ? 'PO saved as draft' : 'PO submitted for approval');
      onSaved(poId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save PO';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 text-sm">
      {/* PO Header */}
      <section className="space-y-4">
        <h3 className="font-semibold text-[#0F172A] border-b border-[#E2E8F0] pb-2">Order Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="PO Number *"
            value={poNumber}
            onChange={e => setPoNumber(e.target.value)}
            placeholder="PO-2025-0001"
          />
          <div>
            <label className="text-sm font-medium text-[#0F172A] block mb-1">Warehouse *</label>
            <select
              value={warehouseId}
              onChange={e => setWarehouseId(e.target.value)}
              className="w-full border border-[#94A3B8] rounded-[4px] px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white"
            >
              <option value="">Select warehouse...</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
            </select>
          </div>
          <Input
            label="Supplier Name"
            value={supplierName}
            onChange={e => setSupplierName(e.target.value)}
            placeholder="ABC Textiles Pvt Ltd"
          />
          <Input
            label="Supplier GSTIN"
            value={supplierGstin}
            onChange={e => setSupplierGstin(e.target.value.toUpperCase())}
            placeholder="27AAAAA0000A1Z5"
            maxLength={15}
          />
          <Input
            label="Expected Date"
            type="date"
            value={expectedDate}
            onChange={e => setExpectedDate(e.target.value)}
          />
          <div>
            <label className="text-sm font-medium text-[#0F172A] block mb-1">Notes</label>
            <textarea
              className="w-full border border-[#94A3B8] rounded-[4px] px-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
              rows={2}
              placeholder="Additional notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Line Items */}
      <section className="space-y-3">
        <h3 className="font-semibold text-[#0F172A] border-b border-[#E2E8F0] pb-2">Line Items</h3>

        {/* Variant search */}
        <div className="relative">
          <Input
            placeholder="Search SKU to add..."
            value={variantSearch}
            onChange={e => {
              setVariantSearch(e.target.value);
              setShowVariantDropdown(true);
            }}
            onFocus={() => setShowVariantDropdown(true)}
            onBlur={() => setTimeout(() => setShowVariantDropdown(false), 150)}
            size="sm"
            leftIcon={<Plus size={14} />}
          />
          {showVariantDropdown && (variantResults.length > 0 || searching) && (
            <div className="absolute z-10 top-full left-0 right-0 bg-white border border-[#E2E8F0] rounded-[4px] shadow-lg mt-1 max-h-40 overflow-y-auto">
              {searching ? (
                <div className="px-3 py-2 text-xs text-[#94A3B8]">Searching...</div>
              ) : (
                variantResults.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#F8FAFC] flex justify-between gap-2"
                    onClick={() => addLine(v)}
                  >
                    <span className="font-mono font-medium">{v.sku}</span>
                    <span className="text-[#64748B] truncate">
                      {v.product?.name ? `${v.product.name} / ` : ''}{v.name}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Line items table */}
        {lines.length > 0 && (
          <div className="border border-[#E2E8F0] rounded-[6px] overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="px-3 py-2 text-left font-medium text-[#64748B]">SKU</th>
                  <th className="px-3 py-2 text-left font-medium text-[#64748B]">Variant</th>
                  <th className="px-3 py-2 text-right font-medium text-[#64748B]">Qty</th>
                  <th className="px-3 py-2 text-right font-medium text-[#64748B]">Unit Cost (₹)</th>
                  <th className="px-3 py-2 text-right font-medium text-[#64748B]">Total</th>
                  <th className="px-3 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => {
                  const lineTotal =
                    typeof line.quantity_ordered === 'number' && typeof line.unit_cost === 'number'
                      ? line.quantity_ordered * line.unit_cost
                      : 0;
                  return (
                    <tr key={idx} className="border-b border-[#F1F5F9] last:border-0">
                      <td className="px-3 py-1.5 font-mono text-[#475569]">{line.sku}</td>
                      <td className="px-3 py-1.5 text-[#64748B] max-w-[140px] truncate">{line.variantName}</td>
                      <td className="px-3 py-1.5">
                        <input
                          type="number"
                          min="1"
                          className="w-16 border border-[#E2E8F0] rounded px-1.5 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                          value={line.quantity_ordered}
                          onChange={e => updateLine(idx, 'quantity_ordered', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-24 border border-[#E2E8F0] rounded px-1.5 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                          value={line.unit_cost}
                          onChange={e => updateLine(idx, 'unit_cost', e.target.value === '' ? '' : parseFloat(e.target.value))}
                        />
                      </td>
                      <td className="px-3 py-1.5 text-right font-medium text-[#0F172A]">
                        ₹{lineTotal.toFixed(2)}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <button
                          type="button"
                          className="text-[#DC2626] hover:bg-[#FEF2F2] rounded p-1 transition-colors"
                          onClick={() => removeLine(idx)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-3 py-2 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end">
              <p className="text-sm font-semibold text-[#0F172A]">
                Total: <span className="text-[#2563EB]">₹{totalAmount.toFixed(2)}</span>
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-2 border-t border-[#E2E8F0]">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button variant="outline" onClick={() => void handleSave(true)} loading={saving}>
          Save as Draft
        </Button>
        <Button onClick={() => void handleSave(false)} loading={saving}>
          Submit for Approval
        </Button>
      </div>
    </div>
  );
};

export default POForm;
