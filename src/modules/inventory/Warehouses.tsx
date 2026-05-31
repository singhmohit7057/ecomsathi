// ============================================================
// EcomSathi — Warehouses Management
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, MapPin, Package, CheckCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { useAuth } from '@/hooks/useAuth';
import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
} from '@/services/inventoryService';
import type { Warehouse } from '@/types';
import { GST_STATE_CODES } from '@/utils/gstData';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WarehouseFormData {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

const defaultForm = (): WarehouseFormData => ({
  name: '', code: '', address: '', city: '', state: '', pincode: '', is_default: false,
});

// ─── WarehouseCard ─────────────────────────────────────────────────────────────

const WarehouseCard: React.FC<{
  warehouse: Warehouse;
  onEdit: (w: Warehouse) => void;
  onDeactivate: (w: Warehouse) => void;
}> = ({ warehouse, onEdit, onDeactivate }) => {
  return (
    <div className={`bg-white border rounded-[8px] shadow-[#1E293B_2px_2px_0px_0px] p-5 space-y-3 ${!warehouse.is_active ? 'opacity-60' : 'border-[#E2E8F0]'} ${warehouse.is_default ? 'border-[#2563EB]' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#0F172A]">{warehouse.name}</h3>
            {warehouse.is_default && (
              <Badge variant="primary" size="sm">
                <Star size={10} className="mr-0.5" />
                Default
              </Badge>
            )}
          </div>
          <p className="text-xs font-mono text-[#64748B] mt-0.5">{warehouse.code}</p>
        </div>
        <Badge variant={warehouse.is_active ? 'success' : 'default'} size="sm">
          {warehouse.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {(warehouse.address || warehouse.city) && (
        <div className="flex items-start gap-2 text-sm text-[#64748B]">
          <MapPin size={14} className="flex-shrink-0 mt-0.5 text-[#94A3B8]" />
          <div>
            {warehouse.address && <p>{warehouse.address}</p>}
            <p>
              {[warehouse.city, warehouse.state, warehouse.pincode].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
        <Package size={12} />
        <span>SKUs tracked here</span>
      </div>

      <div className="flex gap-2 pt-2 border-t border-[#F1F5F9]">
        <Button variant="ghost" size="sm" leftIcon={<Edit2 size={12} />} onClick={() => onEdit(warehouse)}>
          Edit
        </Button>
        <Button
          variant={warehouse.is_active ? 'ghost' : 'outline'}
          size="sm"
          onClick={() => onDeactivate(warehouse)}
        >
          {warehouse.is_active ? 'Deactivate' : 'Activate'}
        </Button>
      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Warehouses: React.FC = () => {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingWh, setEditingWh] = useState<Warehouse | null>(null);
  const [form, setForm] = useState<WarehouseFormData>(defaultForm());
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<WarehouseFormData>>({});

  const stateList = Object.entries(GST_STATE_CODES).map(([, name]) => name).sort();

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchWarehouses = useCallback(async () => {
    if (!user?.org_id) return;
    setLoading(true);
    try {
      const whs = await getWarehouses(user.org_id);
      setWarehouses(whs as unknown as Warehouse[]);
    } catch {
      toast.error('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  }, [user?.org_id]);

  useEffect(() => { void fetchWarehouses(); }, [fetchWarehouses]);

  // ── open form ─────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingWh(null);
    setForm(defaultForm());
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (wh: Warehouse) => {
    setEditingWh(wh);
    setForm({
      name: wh.name,
      code: wh.code,
      address: wh.address ?? '',
      city: wh.city ?? '',
      state: wh.state ?? '',
      pincode: wh.pincode ?? '',
      is_default: wh.is_default,
    });
    setErrors({});
    setShowForm(true);
  };

  // ── validate ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Partial<WarehouseFormData> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.code.trim()) e.code = 'Code is required';
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) e.pincode = 'Must be 6 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user?.org_id || !validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        state: form.state || null,
        pincode: form.pincode.trim() || null,
        is_default: form.is_default,
        is_active: true,
      };

      if (editingWh) {
        await updateWarehouse(editingWh.id, payload);
        toast.success('Warehouse updated');
      } else {
        await createWarehouse(user.org_id, payload);
        toast.success('Warehouse created');
      }
      setShowForm(false);
      void fetchWarehouses();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── toggle active ─────────────────────────────────────────────────────────
  const handleDeactivate = async (wh: Warehouse) => {
    try {
      await updateWarehouse(wh.id, { is_active: !wh.is_active });
      toast.success(wh.is_active ? 'Warehouse deactivated' : 'Warehouse activated');
      void fetchWarehouses();
    } catch {
      toast.error('Failed to update warehouse');
    }
  };

  const updateField = <K extends keyof WarehouseFormData>(key: K, value: WarehouseFormData[K]) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => ({ ...p, [key]: undefined }));
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Warehouses</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Manage storage locations for your inventory</p>
        </div>
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={openAdd}>
          Add Warehouse
        </Button>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2563EB] border-t-transparent" />
        </div>
      ) : warehouses.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-12 text-center">
          <Package size={32} className="mx-auto text-[#CBD5E1] mb-3" />
          <p className="text-[#94A3B8] text-sm">No warehouses yet. Add your first one.</p>
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={openAdd} className="mt-4">
            Add Warehouse
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map(wh => (
            <WarehouseCard
              key={wh.id}
              warehouse={wh}
              onEdit={openEdit}
              onDeactivate={w => void handleDeactivate(w)}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingWh ? 'Edit Warehouse' : 'Add Warehouse'}
        size="md"
      >
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Warehouse Name *"
              value={form.name}
              onChange={e => updateField('name', e.target.value)}
              error={errors.name}
              placeholder="Main Warehouse"
            />
            <Input
              label="Code *"
              value={form.code}
              onChange={e => updateField('code', e.target.value.toUpperCase())}
              error={errors.code}
              placeholder="WH-01"
            />
          </div>
          <Input
            label="Address"
            value={form.address}
            onChange={e => updateField('address', e.target.value)}
            placeholder="Street address..."
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="City"
              value={form.city}
              onChange={e => updateField('city', e.target.value)}
              placeholder="Mumbai"
            />
            <div>
              <label className="text-sm font-medium text-[#0F172A] block mb-1">State</label>
              <select
                value={form.state}
                onChange={e => updateField('state', e.target.value)}
                className="w-full border border-[#94A3B8] rounded-[4px] px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white"
              >
                <option value="">Select state</option>
                {stateList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Input
              label="Pincode"
              value={form.pincode}
              onChange={e => updateField('pincode', e.target.value)}
              error={errors.pincode}
              placeholder="400001"
              maxLength={6}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => updateField('is_default', !form.is_default)}
              className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${form.is_default ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]'}`}
            >
              <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform ${form.is_default ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-sm text-[#0F172A] flex items-center gap-1">
              <CheckCircle size={14} className="text-[#2563EB]" />
              Set as Default Warehouse
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-2 border-t border-[#E2E8F0]">
            <Button variant="ghost" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
            <Button onClick={() => void handleSave()} loading={saving}>
              {editingWh ? 'Save Changes' : 'Create Warehouse'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Warehouses;
