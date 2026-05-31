// ============================================================
// EcomSathi — Stock Adjust Modal
// ============================================================
import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { useAuth } from '@/hooks/useAuth';
import { adjustStock, type MovementType } from '@/services/inventoryService';
import type { InventoryItem, Warehouse } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdjusted: () => void;
  inventoryItem: InventoryItem | null;
  warehouses: Warehouse[];
}

const MOVEMENT_TYPES: { value: MovementType; label: string }[] = [
  { value: 'purchase', label: 'Purchase (stock in)' },
  { value: 'sale', label: 'Sale (stock out)' },
  { value: 'return', label: 'Return (stock in)' },
  { value: 'adjustment', label: 'Manual Adjustment' },
  { value: 'damage', label: 'Write-off / Damage' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  onClose,
  onAdjusted,
  inventoryItem,
  warehouses,
}) => {
  const { user } = useAuth();

  const [movementType, setMovementType] = useState<MovementType>('adjustment');
  const [quantity, setQuantity] = useState('');
  const [warehouseId, setWarehouseId] = useState(inventoryItem?.warehouse_id ?? '');
  const [notes, setNotes] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset when item changes
  React.useEffect(() => {
    if (inventoryItem) {
      setWarehouseId(inventoryItem.warehouse_id);
      setQuantity('');
      setNotes('');
      setReferenceId('');
      setMovementType('adjustment');
    }
  }, [inventoryItem]);

  const qtyNum = quantity ? parseFloat(quantity) : 0;
  const currentStock = inventoryItem?.quantity ?? 0;
  const availableAfter = currentStock + qtyNum;
  const wouldGoNegative = availableAfter < 0;

  const handleSubmit = async () => {
    if (!user?.id || !inventoryItem) return;
    if (!quantity.trim()) { toast.error('Enter a quantity'); return; }
    if (isNaN(qtyNum)) { toast.error('Invalid quantity'); return; }
    if (qtyNum === 0) { toast.error('Quantity cannot be zero'); return; }
    if (wouldGoNegative) {
      const confirmed = window.confirm(
        `This adjustment would result in negative stock (${availableAfter}). Proceed anyway?`
      );
      if (!confirmed) return;
    }
    if (!warehouseId) { toast.error('Select a warehouse'); return; }

    setSaving(true);
    try {
      await adjustStock(
        inventoryItem.variant_id,
        warehouseId,
        qtyNum,
        movementType,
        notes.trim() || null,
        user.id,
      );
      toast.success('Stock adjusted successfully');
      onAdjusted();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Adjustment failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const productName = inventoryItem?.product?.name ?? '—';
  const variantSku = inventoryItem?.variant?.sku ?? '—';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adjust Stock" size="md">
      <div className="space-y-4 text-sm">
        {/* Context info */}
        <div className="bg-[#F8FAFC] rounded-[6px] p-3 border border-[#E2E8F0]">
          <p className="font-medium text-[#0F172A]">{productName}</p>
          <p className="text-[#64748B] text-xs mt-0.5">SKU: {variantSku}</p>
          <p className="text-[#64748B] text-xs">
            Current Stock: <span className="font-semibold text-[#0F172A]">{currentStock}</span>
          </p>
        </div>

        {/* Movement Type */}
        <div>
          <label className="text-sm font-medium text-[#0F172A] block mb-1">Movement Type *</label>
          <select
            value={movementType}
            onChange={e => setMovementType(e.target.value as MovementType)}
            className="w-full border border-[#94A3B8] rounded-[4px] px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white"
          >
            {MOVEMENT_TYPES.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <Input
            label="Quantity * (positive = add, negative = remove)"
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="e.g. 10 or -5"
          />
          {quantity && (
            <p className={`text-xs mt-1 ${wouldGoNegative ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
              Stock after adjustment: <strong>{availableAfter}</strong>
            </p>
          )}
        </div>

        {/* Negative warning */}
        {wouldGoNegative && (
          <div className="flex items-start gap-2 bg-[#FFF1F2] border border-[#FFE4E6] rounded-[6px] p-3">
            <AlertTriangle size={16} className="text-[#DC2626] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#DC2626]">
              Warning: This adjustment will result in negative stock ({availableAfter} units).
              Negative stock is allowed but should be investigated.
            </p>
          </div>
        )}

        {/* Warehouse */}
        <div>
          <label className="text-sm font-medium text-[#0F172A] block mb-1">Warehouse *</label>
          <select
            value={warehouseId}
            onChange={e => setWarehouseId(e.target.value)}
            className="w-full border border-[#94A3B8] rounded-[4px] px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white"
          >
            <option value="">Select warehouse...</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
            ))}
          </select>
        </div>

        {/* Reference ID */}
        <Input
          label="Reference ID (optional)"
          value={referenceId}
          onChange={e => setReferenceId(e.target.value)}
          placeholder="PO number, order ID, etc."
        />

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-[#0F172A] block mb-1">Notes</label>
          <textarea
            className="w-full border border-[#94A3B8] rounded-[4px] px-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
            rows={2}
            placeholder="Reason for adjustment..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-[#E2E8F0]">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={() => void handleSubmit()} loading={saving}>
            Submit Adjustment
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default StockAdjustModal;
