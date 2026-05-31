// ============================================================
// EcomSathi — Purchase Order Detail
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, PackageCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/supabase/client';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { useAuth } from '@/hooks/useAuth';
import { adjustStock } from '@/services/inventoryService';
import type { PurchaseOrder, PurchaseOrderItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type POStatus = PurchaseOrder['status'];

interface ReceiveQtyMap {
  [itemId: string]: number;
}

function statusVariant(status: POStatus): 'default' | 'warning' | 'info' | 'success' | 'error' | 'primary' {
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

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

type POWithItems = PurchaseOrder & { items: (PurchaseOrderItem & { variant?: { id: string; sku: string; name: string } | null })[] };

// ─── Receive Modal ─────────────────────────────────────────────────────────────

const ReceiveModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  po: POWithItems;
  onReceived: () => void;
}> = ({ isOpen, onClose, po, onReceived }) => {
  const { user } = useAuth();
  const [qtyMap, setQtyMap] = useState<ReceiveQtyMap>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const init: ReceiveQtyMap = {};
      po.items.forEach(item => {
        init[item.id] = item.quantity_ordered - item.quantity_received;
      });
      setQtyMap(init);
    }
  }, [isOpen, po.items]);

  const handleSubmit = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      let allReceived = true;
      let anyReceived = false;

      for (const item of po.items) {
        const receiveQty = qtyMap[item.id] ?? 0;
        if (receiveQty <= 0) continue;
        anyReceived = true;

        // Create stock movement
        await adjustStock(
          item.variant_id,
          po.warehouse_id,
          receiveQty,
          'purchase',
          `PO: ${po.po_number}`,
          user.id,
        );

        // Update item received qty
        const newReceived = item.quantity_received + receiveQty;
        await supabase
          .from('purchase_order_items')
          .update({ quantity_received: newReceived })
          .eq('id', item.id);

        if (newReceived < item.quantity_ordered) allReceived = false;
      }

      if (!anyReceived) {
        toast.error('Enter at least one received quantity');
        setSaving(false);
        return;
      }

      // Update PO status
      const newStatus = allReceived ? 'received' : 'partial';
      await supabase
        .from('purchase_orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', po.id);

      toast.success(`Stock received — PO marked as ${newStatus}`);
      onReceived();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to receive items';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receive Items" size="lg">
      <div className="space-y-4 text-sm">
        <p className="text-[#64748B]">Enter the quantity received for each line item.</p>

        <div className="border border-[#E2E8F0] rounded-[6px] overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="px-3 py-2 text-left font-medium text-[#64748B]">SKU</th>
                <th className="px-3 py-2 text-right font-medium text-[#64748B]">Ordered</th>
                <th className="px-3 py-2 text-right font-medium text-[#64748B]">Already Received</th>
                <th className="px-3 py-2 text-right font-medium text-[#64748B]">Receive Now</th>
              </tr>
            </thead>
            <tbody>
              {po.items.map(item => {
                const remaining = item.quantity_ordered - item.quantity_received;
                return (
                  <tr key={item.id} className="border-b border-[#F1F5F9] last:border-0">
                    <td className="px-3 py-2 font-mono text-[#475569]">{item.variant?.sku ?? item.variant_id}</td>
                    <td className="px-3 py-2 text-right text-[#64748B]">{item.quantity_ordered}</td>
                    <td className="px-3 py-2 text-right text-[#64748B]">{item.quantity_received}</td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={0}
                        max={remaining}
                        className="w-20 border border-[#E2E8F0] rounded px-1.5 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                        value={qtyMap[item.id] ?? 0}
                        onChange={e => {
                          const val = Math.min(remaining, Math.max(0, parseInt(e.target.value, 10) || 0));
                          setQtyMap(prev => ({ ...prev, [item.id]: val }));
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-[#E2E8F0]">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button leftIcon={<PackageCheck size={14} />} onClick={() => void handleSubmit()} loading={saving}>
            Confirm Receipt
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const PODetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [po, setPO] = useState<POWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchPO = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*, items:purchase_order_items(*, variant:product_variants(id, sku, name))')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPO(data as unknown as POWithItems);
    } catch {
      toast.error('Failed to load PO');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void fetchPO(); }, [fetchPO]);

  const canApprove = po?.status === 'pending' && (user?.role === 'owner' || user?.role === 'admin');
  const canReceive = po?.status === 'approved' || po?.status === 'partial';
  const canCancel = po && !['received', 'cancelled'].includes(po.status);

  const handleApprove = async () => {
    if (!po) return;
    setActionLoading(true);
    try {
      await supabase
        .from('purchase_orders')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', po.id);
      toast.success('PO approved');
      void fetchPO();
    } catch { toast.error('Failed to approve PO'); }
    finally { setActionLoading(false); }
  };

  const handleCancel = async () => {
    if (!po) return;
    if (!confirm('Cancel this purchase order? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      await supabase
        .from('purchase_orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', po.id);
      toast.success('PO cancelled');
      void fetchPO();
    } catch { toast.error('Failed to cancel PO'); }
    finally { setActionLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2563EB] border-t-transparent" />
      </div>
    );
  }

  if (!po) {
    return (
      <div className="text-center py-16">
        <p className="text-[#94A3B8]">Purchase order not found.</p>
        <Button variant="ghost" onClick={() => navigate('/inventory/purchase-orders')} className="mt-4">
          Back to POs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded hover:bg-[#F1F5F9] text-[#64748B] transition-colors"
            onClick={() => navigate('/inventory/purchase-orders')}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#0F172A]">{po.po_number}</h1>
              <Badge variant={statusVariant(po.status)} size="sm">
                {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-[#64748B] mt-0.5">
              Created {formatDate(po.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canApprove && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<CheckCircle size={14} />}
              onClick={() => void handleApprove()}
              loading={actionLoading}
            >
              Approve PO
            </Button>
          )}
          {canReceive && (
            <Button
              size="sm"
              leftIcon={<PackageCheck size={14} />}
              onClick={() => setShowReceiveModal(true)}
            >
              Receive Items
            </Button>
          )}
          {canCancel && (
            <Button
              size="sm"
              variant="danger"
              leftIcon={<XCircle size={14} />}
              onClick={() => void handleCancel()}
              loading={actionLoading}
            >
              Cancel PO
            </Button>
          )}
        </div>
      </div>

      {/* PO Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Supplier', value: po.supplier_name ?? '—' },
          { label: 'Supplier GSTIN', value: po.supplier_gstin ?? '—' },
          { label: 'Expected Date', value: formatDate(po.expected_date) },
          { label: 'Total Amount', value: `₹${po.total_amount.toFixed(2)}` },
        ].map(item => (
          <div key={item.label} className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 shadow-[#1E293B_1px_1px_0px_0px]">
            <p className="text-xs text-[#64748B] uppercase tracking-wide">{item.label}</p>
            <p className="font-semibold text-[#0F172A] mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {po.notes && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[6px] px-4 py-3 text-sm text-[#92400E]">
          <strong>Notes:</strong> {po.notes}
        </div>
      )}

      {/* Line items */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] shadow-[#1E293B_2px_2px_0px_0px] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h2 className="font-semibold text-[#0F172A]">Line Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">SKU</th>
                <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Variant</th>
                <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Ordered</th>
                <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Received</th>
                <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Pending</th>
                <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Unit Cost</th>
                <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Total</th>
              </tr>
            </thead>
            <tbody>
              {po.items.map(item => (
                <tr key={item.id} className="border-b border-[#F1F5F9] last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-[#475569]">
                    {item.variant?.sku ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-[#64748B]">{item.variant?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right">{item.quantity_ordered}</td>
                  <td className="px-4 py-3 text-right text-[#16A34A] font-medium">
                    {item.quantity_received}
                  </td>
                  <td className="px-4 py-3 text-right text-[#D97706]">
                    {item.quantity_ordered - item.quantity_received}
                  </td>
                  <td className="px-4 py-3 text-right">₹{item.unit_cost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-medium">₹{item.total_cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#F8FAFC] border-t border-[#E2E8F0]">
                <td colSpan={6} className="px-4 py-3 text-right font-semibold text-[#0F172A]">
                  Total Amount:
                </td>
                <td className="px-4 py-3 text-right font-bold text-[#2563EB]">
                  ₹{po.total_amount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Receive Modal */}
      {po && (
        <ReceiveModal
          isOpen={showReceiveModal}
          onClose={() => setShowReceiveModal(false)}
          po={po}
          onReceived={() => void fetchPO()}
        />
      )}
    </div>
  );
};

export default PODetail;
