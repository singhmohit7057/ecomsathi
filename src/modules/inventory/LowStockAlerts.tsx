// ============================================================
// EcomSathi — Low Stock Alerts
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw, ShoppingCart, Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { useAuth } from '@/hooks/useAuth';
import { getInventory, getWarehouses } from '@/services/inventoryService';
import type { InventoryItem, Warehouse } from '@/types';
import { StockAdjustModal } from './StockAdjustModal';

// ─── helpers ─────────────────────────────────────────────────────────────────

type AlertItem = InventoryItem & {
  urgencyPct: number; // quantity / threshold * 100 (lower = more urgent)
};

function buildAlertItems(items: InventoryItem[]): AlertItem[] {
  return items
    .filter(i => i.quantity <= i.low_stock_threshold)
    .map(i => ({
      ...i,
      urgencyPct: i.low_stock_threshold > 0
        ? Math.round((i.quantity / i.low_stock_threshold) * 100)
        : 0,
    }))
    .sort((a, b) => a.urgencyPct - b.urgencyPct);
}

function urgencyColor(pct: number): string {
  if (pct <= 0) return 'bg-[#DC2626]';
  if (pct <= 25) return 'bg-[#F97316]';
  if (pct <= 50) return 'bg-[#D97706]';
  return 'bg-[#16A34A]';
}

function urgencyBadge(pct: number): 'error' | 'warning' | 'success' {
  if (pct <= 0) return 'error';
  if (pct <= 50) return 'warning';
  return 'success';
}

// ─── Threshold Edit Modal ─────────────────────────────────────────────────────

const ThresholdModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  item: AlertItem | null;
  onSaved: (itemId: string, newThreshold: number) => void;
}> = ({ isOpen, onClose, item, onSaved }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (item) setValue(item.low_stock_threshold.toString());
  }, [item]);

  const handleSave = () => {
    const v = parseInt(value, 10);
    if (isNaN(v) || v < 0) { toast.error('Invalid threshold'); return; }
    if (item) {
      onSaved(item.id, v);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adjust Low Stock Threshold" size="sm">
      <div className="space-y-4 text-sm">
        {item && (
          <div className="bg-[#F8FAFC] rounded p-3 border border-[#E2E8F0]">
            <p className="font-medium text-[#0F172A]">{item.product?.name}</p>
            <p className="text-xs text-[#64748B]">SKU: {item.variant?.sku}</p>
            <p className="text-xs text-[#64748B]">Current stock: {item.quantity}</p>
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-[#0F172A] block mb-1">
            Low Stock Threshold
          </label>
          <input
            type="number"
            min="0"
            className="w-full border border-[#94A3B8] rounded-[4px] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            value={value}
            onChange={e => setValue(e.target.value)}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
          />
          <p className="text-xs text-[#64748B] mt-1">
            Alert will trigger when stock falls at or below this number.
          </p>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#E2E8F0] pt-3">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>Save Threshold</Button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const LowStockAlerts: React.FC = () => {
  const { user } = useAuth();

  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterWarehouse, setFilterWarehouse] = useState('');

  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [thresholdItem, setThresholdItem] = useState<AlertItem | null>(null);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user?.org_id) return;
    setLoading(true);
    try {
      const [inv, whs] = await Promise.all([
        getInventory(user.org_id, filterWarehouse || undefined),
        getWarehouses(user.org_id),
      ]);
      setAllItems(inv as unknown as InventoryItem[]);
      setWarehouses(whs as unknown as Warehouse[]);
    } catch {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [user?.org_id, filterWarehouse]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const alertItems = buildAlertItems(allItems);
  const outOfStock = alertItems.filter(i => i.quantity <= 0).length;
  const critical = alertItems.filter(i => i.quantity > 0 && i.urgencyPct <= 25).length;

  const handleThresholdSaved = (itemId: string, newThreshold: number) => {
    setAllItems(prev =>
      prev.map(i => i.id === itemId ? { ...i, low_stock_threshold: newThreshold } : i)
    );
    toast.success('Threshold updated');
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0F172A]">Low Stock Alerts</h1>
            {alertItems.length > 0 && (
              <span className="bg-[#DC2626] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {alertItems.length}
              </span>
            )}
          </div>
          <p className="text-sm text-[#64748B] mt-0.5">Items at or below reorder threshold</p>
        </div>
        <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={14} />} onClick={() => void fetchData()}>
          Refresh
        </Button>
      </div>

      {/* Summary pills */}
      {alertItems.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FFE4E6] rounded-full px-4 py-1.5">
            <AlertTriangle size={14} className="text-[#DC2626]" />
            <span className="text-sm font-medium text-[#DC2626]">{outOfStock} Out of Stock</span>
          </div>
          <div className="flex items-center gap-2 bg-[#FFFBEB] border border-[#FDE68A] rounded-full px-4 py-1.5">
            <AlertTriangle size={14} className="text-[#D97706]" />
            <span className="text-sm font-medium text-[#D97706]">{critical} Critical (≤25% of threshold)</span>
          </div>
        </div>
      )}

      {/* Warehouse filter */}
      <div className="flex gap-3">
        <select
          value={filterWarehouse}
          onChange={e => setFilterWarehouse(e.target.value)}
          className="border border-[#94A3B8] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
        >
          <option value="">All Warehouses</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2563EB] border-t-transparent" />
        </div>
      ) : alertItems.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-12 text-center">
          <div className="text-[#16A34A] flex justify-center mb-3">
            <AlertTriangle size={32} className="text-[#CBD5E1]" />
          </div>
          <p className="text-[#94A3B8] text-sm font-medium">All items are well-stocked!</p>
          <p className="text-[#CBD5E1] text-xs mt-1">No items are at or below their reorder threshold.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] shadow-[#1E293B_2px_2px_0px_0px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Product</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Warehouse</th>
                  <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Current</th>
                  <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Threshold</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#0F172A]">Stock Level</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#0F172A]">Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#0F172A]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {alertItems.map(item => (
                  <tr key={item.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3 font-medium text-[#0F172A]">
                      {item.product?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#475569]">
                      {item.variant?.sku ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">
                      {item.warehouse?.name ?? '—'}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${item.quantity <= 0 ? 'text-[#DC2626]' : 'text-[#D97706]'}`}>
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-[#64748B]">
                      {item.low_stock_threshold}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[#E2E8F0] rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${urgencyColor(item.urgencyPct)}`}
                            style={{ width: `${Math.min(100, item.urgencyPct)}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#94A3B8] w-8 text-right">
                          {item.urgencyPct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={urgencyBadge(item.urgencyPct)} size="sm">
                        {item.quantity <= 0 ? 'Out of Stock' : item.urgencyPct <= 25 ? 'Critical' : 'Low'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="p-1.5 rounded hover:bg-[#EFF6FF] text-[#2563EB] transition-colors"
                          title="Adjust Threshold"
                          onClick={() => setThresholdItem(item)}
                        >
                          <Settings2 size={13} />
                        </button>
                        <button
                          className="p-1.5 rounded hover:bg-[#F0FDF4] text-[#16A34A] transition-colors"
                          title="Adjust Stock"
                          onClick={() => setAdjustItem(item)}
                        >
                          <ShoppingCart size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <StockAdjustModal
        isOpen={!!adjustItem}
        onClose={() => setAdjustItem(null)}
        onAdjusted={() => void fetchData()}
        inventoryItem={adjustItem}
        warehouses={warehouses}
      />

      <ThresholdModal
        isOpen={!!thresholdItem}
        onClose={() => setThresholdItem(null)}
        item={thresholdItem}
        onSaved={handleThresholdSaved}
      />
    </div>
  );
};

export default LowStockAlerts;
