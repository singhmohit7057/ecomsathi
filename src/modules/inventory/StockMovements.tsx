// ============================================================
// EcomSathi — Stock Movements History
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { Download, RefreshCw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Pagination } from '@/components/common/Pagination';
import { useAuth } from '@/hooks/useAuth';
import {
  getStockMovements,
  getWarehouses,
  type MovementType,
  type StockMovementFilters,
} from '@/services/inventoryService';
import type { StockMovement, Warehouse } from '@/types';

// ─── constants ────────────────────────────────────────────────────────────────

const MOVEMENT_TYPES: { value: MovementType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'sale', label: 'Sale' },
  { value: 'return', label: 'Return' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'damage', label: 'Write-off / Damage' },
  { value: 'transfer_in', label: 'Transfer In' },
  { value: 'transfer_out', label: 'Transfer Out' },
];

type MovementRow = StockMovement & {
  variant?: { id: string; sku: string; name: string } | null;
  warehouse?: { id: string; name: string } | null;
};

function isInbound(type: MovementType | string): boolean {
  return ['purchase', 'return', 'transfer_in', 'adjustment'].includes(type);
}

function typeBadgeVariant(type: MovementType | string): 'success' | 'error' | 'info' | 'warning' | 'default' {
  if (['purchase', 'return', 'transfer_in'].includes(type)) return 'success';
  if (['sale', 'transfer_out'].includes(type)) return 'error';
  if (type === 'adjustment') return 'info';
  if (type === 'damage') return 'warning';
  return 'default';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function exportMovementsCSV(rows: MovementRow[]): void {
  const headers = ['Date', 'Product/SKU', 'Type', 'Quantity', 'Warehouse', 'Reference', 'Notes'];
  const data = rows.map(r => [
    formatDate(r.created_at),
    r.variant?.sku ?? '',
    r.movement_type,
    r.quantity,
    r.warehouse?.name ?? '',
    r.reference_id ?? '',
    r.notes ?? '',
  ]);
  const csv = [headers, ...data].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stock-movements-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 30;

export const StockMovements: React.FC = () => {
  const { user } = useAuth();

  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [movType, setMovType] = useState<MovementType | ''>('');
  const [warehouseId, setWarehouseId] = useState('');
  const [skuSearch, setSkuSearch] = useState('');

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user?.org_id) return;
    setLoading(true);
    try {
      const filters: StockMovementFilters = {
        warehouseId: warehouseId || undefined,
        type: movType || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo ? `${dateTo}T23:59:59Z` : undefined,
        page,
        pageSize: PAGE_SIZE,
      };
      const result = await getStockMovements(user.org_id, filters);
      let data = result.data as unknown as MovementRow[];
      if (skuSearch) {
        data = data.filter(m => m.variant?.sku?.toLowerCase().includes(skuSearch.toLowerCase()));
      }
      setMovements(data);
      setTotal(result.total);

      if (warehouses.length === 0) {
        const whs = await getWarehouses(user.org_id);
        setWarehouses(whs as unknown as Warehouse[]);
      }
    } catch {
      toast.error('Failed to load movements');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.org_id, dateFrom, dateTo, movType, warehouseId, skuSearch, page]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Stock Movements</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Complete history of all inventory movements</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" leftIcon={<Download size={14} />} onClick={() => exportMovementsCSV(movements)}>
            Export CSV
          </Button>
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={14} />} onClick={() => void fetchData()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] shadow-[#1E293B_2px_2px_0px_0px] p-4">
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Search SKU..."
            value={skuSearch}
            onChange={e => { setSkuSearch(e.target.value); setPage(1); }}
            leftIcon={<Search size={14} />}
            size="sm"
            className="w-48"
          />
          <select
            value={movType}
            onChange={e => { setMovType(e.target.value as MovementType | ''); setPage(1); }}
            className="border border-[#94A3B8] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          >
            {MOVEMENT_TYPES.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={warehouseId}
            onChange={e => { setWarehouseId(e.target.value); setPage(1); }}
            className="border border-[#94A3B8] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          >
            <option value="">All Warehouses</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#64748B] whitespace-nowrap">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1); }}
              className="border border-[#94A3B8] rounded-[4px] px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
            <label className="text-xs text-[#64748B]">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1); }}
              className="border border-[#94A3B8] rounded-[4px] px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
          {(dateFrom || dateTo || movType || warehouseId || skuSearch) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDateFrom(''); setDateTo('');
                setMovType(''); setWarehouseId('');
                setSkuSearch(''); setPage(1);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2563EB] border-t-transparent" />
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] shadow-[#1E293B_2px_2px_0px_0px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Product / SKU</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Type</th>
                  <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Qty</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Warehouse</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Reference</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Notes</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-[#94A3B8]">
                      No movements found
                    </td>
                  </tr>
                ) : (
                  movements.map(mov => {
                    const inbound = isInbound(mov.movement_type);
                    return (
                      <tr key={mov.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3 text-[#64748B] text-xs whitespace-nowrap">
                          {formatDate(mov.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-[#64748B]">{mov.variant?.name ?? '—'}</p>
                          <p className="font-mono text-xs font-medium text-[#475569]">{mov.variant?.sku ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={typeBadgeVariant(mov.movement_type)} size="sm">
                            {mov.movement_type.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold text-base ${inbound && mov.quantity > 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                          {inbound && mov.quantity > 0 ? '+' : ''}{mov.quantity}
                        </td>
                        <td className="px-4 py-3 text-[#64748B]">{mov.warehouse?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-[#64748B] text-xs font-mono">
                          {mov.reference_id ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-[#64748B] text-xs max-w-[180px] truncate">
                          {mov.notes ?? '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        total={total}
      />
    </div>
  );
};

export default StockMovements;
