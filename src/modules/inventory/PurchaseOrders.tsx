// ============================================================
// EcomSathi — Purchase Orders List
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/supabase/client';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Pagination } from '@/components/common/Pagination';
import { useAuth } from '@/hooks/useAuth';
import type { PurchaseOrder } from '@/types';
import { POForm } from './POForm';

// ─── helpers ─────────────────────────────────────────────────────────────────

type POStatus = PurchaseOrder['status'];

function statusVariant(
  status: POStatus
): 'default' | 'warning' | 'info' | 'success' | 'error' | 'primary' {
  switch (status) {
    case 'draft': return 'default';
    case 'pending': return 'warning';
    case 'approved': return 'info';
    case 'received': return 'success';
    case 'partial': return 'primary';
    case 'cancelled': return 'error';
    default: return 'default';
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Component ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export const PurchaseOrders: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<POStatus | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    if (!user?.org_id) return;
    setLoading(true);
    try {
      let query = supabase
        .from('purchase_orders')
        .select(
          '*, items:purchase_order_items(id)',
          { count: 'exact' }
        )
        .eq('org_id', user.org_id);

      if (filterStatus) query = query.eq('status', filterStatus);

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setOrders(data as unknown as PurchaseOrder[]);
      setTotal(count ?? 0);
    } catch {
      toast.error('Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  }, [user?.org_id, filterStatus, page]);

  useEffect(() => { void fetchOrders(); }, [fetchOrders]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handlePOSaved = (poId: string) => {
    setShowCreateModal(false);
    navigate(`/inventory/purchase-orders/${poId}`);
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Purchase Orders</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Manage supplier purchase orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={14} />} onClick={() => void fetchOrders()}>
            Refresh
          </Button>
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowCreateModal(true)}>
            Create PO
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value as POStatus | ''); setPage(1); }}
          className="border border-[#94A3B8] rounded-[4px] px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="received">Received</option>
          <option value="partial">Partial</option>
          <option value="cancelled">Cancelled</option>
        </select>
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
                  <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">PO Number</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Supplier</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Warehouse</th>
                  <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Items</th>
                  <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Total Amount</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#0F172A]">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Expected Date</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#0F172A]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-[#94A3B8]">
                      No purchase orders found.{' '}
                      <button
                        className="text-[#2563EB] font-medium hover:underline"
                        onClick={() => setShowCreateModal(true)}
                      >
                        Create one
                      </button>
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr
                      key={order.id}
                      className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                      onClick={() => navigate(`/inventory/purchase-orders/${order.id}`)}
                    >
                      <td className="px-4 py-3 font-mono font-medium text-[#0F172A]">
                        {order.po_number}
                      </td>
                      <td className="px-4 py-3 text-[#64748B]">
                        {order.supplier_name ?? '—'}
                        {order.supplier_gstin && (
                          <p className="text-xs text-[#94A3B8] font-mono">{order.supplier_gstin}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#64748B]">—</td>
                      <td className="px-4 py-3 text-right text-[#64748B]">
                        {(order.items?.length ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#0F172A]">
                        ₹{order.total_amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={statusVariant(order.status)} size="sm">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[#64748B]">
                        {formatDate(order.expected_date)}
                      </td>
                      <td
                        className="px-4 py-3 text-center"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          className="p-1 rounded hover:bg-[#EFF6FF] text-[#2563EB] transition-colors"
                          onClick={() => navigate(`/inventory/purchase-orders/${order.id}`)}
                          title="View PO"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
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

      {/* Create PO Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Purchase Order"
        size="xl"
      >
        <POForm onSaved={handlePOSaved} onCancel={() => setShowCreateModal(false)} />
      </Modal>
    </div>
  );
};

export default PurchaseOrders;
