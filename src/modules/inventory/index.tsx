// ============================================================
// EcomSathi — Inventory Module Dashboard
// Premium feature — requires login
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Layers, AlertTriangle, Warehouse as WarehouseIcon,
  TrendingUp, ArrowRight, ShoppingCart, BarChart3, ClipboardList,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { getInventory, getWarehouses, getStockMovements } from '@/services/inventoryService';
import { getProducts } from '@/services/productService';
import type { StockMovement } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalProducts: number;
  totalSKUs: number;
  lowStockCount: number;
  warehouseCount: number;
  totalInventoryValue: number;
}

type RecentMovement = StockMovement & {
  variant?: { id: string; sku: string; name: string } | null;
  warehouse?: { id: string; name: string } | null;
};

// ─── Summary Card ─────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  badge?: number;
  accent?: string;
  onClick?: () => void;
}> = ({ icon, label, value, badge, accent = '', onClick }) => (
  <button
    onClick={onClick}
    className={`bg-white border border-[#E2E8F0] rounded-[8px] shadow-[#1E293B_2px_2px_0px_0px] p-5 text-left w-full hover:shadow-[#1E293B_3px_3px_0px_0px] transition-shadow group ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
  >
    <div className="flex items-start justify-between">
      <div className={`p-2.5 rounded-[6px] ${accent || 'bg-[#EFF6FF]'}`}>
        {icon}
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="bg-[#DC2626] text-white text-xs font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </div>
    <p className="text-xs text-[#64748B] uppercase tracking-wide mt-3">{label}</p>
    <p className="text-2xl font-bold text-[#0F172A] mt-0.5">{value}</p>
    {onClick && (
      <p className="text-xs text-[#2563EB] mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        View all <ArrowRight size={10} />
      </p>
    )}
  </button>
);

// ─── Quick Link ───────────────────────────────────────────────────────────────

const QuickLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
  onClick: () => void;
}> = ({ icon, label, description, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white border border-[#E2E8F0] rounded-[8px] shadow-[#1E293B_1px_1px_0px_0px] p-4 text-left hover:shadow-[#1E293B_2px_2px_0px_0px] hover:border-[#2563EB]/30 transition-all group w-full"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-[6px] bg-[#F8FAFC] group-hover:bg-[#EFF6FF] transition-colors text-[#2563EB]">
        {icon}
      </div>
      <div>
        <p className="font-medium text-[#0F172A] text-sm">{label}</p>
        <p className="text-xs text-[#64748B]">{description}</p>
      </div>
      <ArrowRight size={14} className="ml-auto text-[#CBD5E1] group-hover:text-[#2563EB] transition-colors" />
    </div>
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const InventoryDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalSKUs: 0,
    lowStockCount: 0,
    warehouseCount: 0,
    totalInventoryValue: 0,
  });
  const [recentMovements, setRecentMovements] = useState<RecentMovement[]>([]);
  const [loading, setLoading] = useState(true);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    if (!user?.org_id) return;
    setLoading(true);
    try {
      const [products, inventory, warehouses, movements] = await Promise.all([
        getProducts(user.org_id, { pageSize: 1 }),
        getInventory(user.org_id),
        getWarehouses(user.org_id),
        getStockMovements(user.org_id, { pageSize: 10 }),
      ]);

      const inv = inventory as unknown as {
        quantity: number;
        low_stock_threshold: number;
        variant?: { cost_price?: number } | null;
      }[];

      const lowStockCount = inv.filter(i => i.quantity <= i.low_stock_threshold).length;
      const totalValue = inv.reduce((sum, i) => {
        const cost = i.variant?.cost_price ?? 0;
        return sum + i.quantity * cost;
      }, 0);

      setStats({
        totalProducts: products.total,
        totalSKUs: inv.length,
        lowStockCount,
        warehouseCount: warehouses.length,
        totalInventoryValue: totalValue,
      });
      setRecentMovements(movements.data as unknown as RecentMovement[]);
    } catch {
      toast.error('Failed to load inventory dashboard');
    } finally {
      setLoading(false);
    }
  }, [user?.org_id]);

  useEffect(() => { void fetchDashboard(); }, [fetchDashboard]);

  function movTypeColor(type: string): string {
    if (['purchase', 'return', 'transfer_in'].includes(type)) return 'text-[#16A34A]';
    return 'text-[#DC2626]';
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Inventory</h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          Manage products, stock levels, warehouses, and purchase orders
        </p>
      </div>

      {/* Summary Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-[8px] h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Package size={20} className="text-[#2563EB]" />}
            label="Total Products"
            value={stats.totalProducts.toLocaleString()}
            accent="bg-[#EFF6FF]"
            onClick={() => navigate('/inventory/products')}
          />
          <StatCard
            icon={<Layers size={20} className="text-[#7C3AED]" />}
            label="Total SKUs"
            value={stats.totalSKUs.toLocaleString()}
            accent="bg-[#F5F3FF]"
            onClick={() => navigate('/inventory/stock')}
          />
          <StatCard
            icon={<AlertTriangle size={20} className="text-[#DC2626]" />}
            label="Low Stock Alerts"
            value={stats.lowStockCount}
            badge={stats.lowStockCount}
            accent="bg-[#FFF1F2]"
            onClick={() => navigate('/inventory/low-stock')}
          />
          <StatCard
            icon={<WarehouseIcon size={20} className="text-[#0284C7]" />}
            label="Warehouses"
            value={stats.warehouseCount}
            accent="bg-[#F0F9FF]"
            onClick={() => navigate('/inventory/warehouses')}
          />
        </div>
      )}

      {/* Inventory Value banner */}
      {!loading && stats.totalInventoryValue > 0 && (
        <div className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] rounded-[8px] p-5 flex items-center justify-between shadow-[#1E293B_2px_2px_0px_0px]">
          <div>
            <p className="text-blue-200 text-sm">Total Inventory Value</p>
            <p className="text-3xl font-bold text-white mt-0.5">
              ₹{stats.totalInventoryValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <TrendingUp size={40} className="text-blue-300 opacity-60" />
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="text-base font-semibold text-[#0F172A] mb-3">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <QuickLink
            icon={<Package size={18} />}
            label="Product Master"
            description="Add and manage products & variants"
            href="/inventory/products"
            onClick={() => navigate('/inventory/products')}
          />
          <QuickLink
            icon={<Layers size={18} />}
            label="Stock Levels"
            description="View and adjust stock across warehouses"
            href="/inventory/stock"
            onClick={() => navigate('/inventory/stock')}
          />
          <QuickLink
            icon={<WarehouseIcon size={18} />}
            label="Warehouses"
            description="Manage storage locations"
            href="/inventory/warehouses"
            onClick={() => navigate('/inventory/warehouses')}
          />
          <QuickLink
            icon={<ShoppingCart size={18} />}
            label="Purchase Orders"
            description="Create and track supplier POs"
            href="/inventory/purchase-orders"
            onClick={() => navigate('/inventory/purchase-orders')}
          />
          <QuickLink
            icon={<ClipboardList size={18} />}
            label="Stock Movements"
            description="Full history of all stock changes"
            href="/inventory/movements"
            onClick={() => navigate('/inventory/movements')}
          />
          <QuickLink
            icon={<BarChart3 size={18} />}
            label="Reports"
            description="Valuation, movement & reorder reports"
            href="/inventory/reports"
            onClick={() => navigate('/inventory/reports')}
          />
        </div>
      </div>

      {/* Recent Stock Movements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#0F172A]">Recent Stock Movements</h2>
          <button
            className="text-sm text-[#2563EB] hover:underline flex items-center gap-1"
            onClick={() => navigate('/inventory/movements')}
          >
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] shadow-[#1E293B_2px_2px_0px_0px] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#2563EB] border-t-transparent mx-auto" />
            </div>
          ) : recentMovements.length === 0 ? (
            <div className="p-8 text-center text-[#94A3B8] text-sm">
              No stock movements yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">SKU</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Type</th>
                    <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Quantity</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Warehouse</th>
                    <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.map(mov => (
                    <tr key={mov.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                        {new Date(mov.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#475569]">
                        {mov.variant?.sku ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-[#64748B] capitalize">
                        {mov.movement_type.replace('_', ' ')}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${movTypeColor(mov.movement_type)}`}>
                        {mov.quantity > 0 ? '+' : ''}{mov.quantity}
                      </td>
                      <td className="px-4 py-3 text-[#64748B]">{mov.warehouse?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-[#64748B] text-xs max-w-[160px] truncate">
                        {mov.notes ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
