// ============================================================
// EcomSathi — Product Master
// Premium feature — requires login
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Upload, Search, LayoutGrid, List,
  Edit2, ToggleLeft, ToggleRight, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Pagination } from '@/components/common/Pagination';
import { useAuth } from '@/hooks/useAuth';
import {
  getProducts,
  deleteProduct,
  type ProductFilters,
} from '@/services/productService';
import type { Product } from '@/types';
import { ProductForm } from './ProductForm';

type ViewMode = 'table' | 'grid';

const CATEGORIES = [
  'Apparel', 'Electronics', 'Footwear', 'Home & Kitchen',
  'Beauty', 'Sports', 'Toys', 'Books', 'Jewelry', 'Other',
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function exportProductsCSV(products: Product[]): void {
  const headers = ['Name', 'Category', 'Brand', 'MRP', 'Cost Price', 'Selling Price', 'HSN Code', 'GST Rate', 'Status'];
  const rows = products.map(p => [
    p.name,
    p.category ?? '',
    p.brand ?? '',
    p.mrp ?? '',
    p.cost_price ?? '',
    p.selling_price ?? '',
    p.hsn_code ?? '',
    p.gst_rate ?? '',
    p.is_active ? 'Active' : 'Inactive',
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

const ProductCard: React.FC<{
  product: Product;
  onEdit: (p: Product) => void;
  onToggleStatus: (p: Product) => void;
  onNavigate: (id: string) => void;
}> = ({ product, onEdit, onToggleStatus, onNavigate }) => {
  const variantCount = product.variants?.length ?? 0;

  return (
    <div
      className="bg-white border border-[#E2E8F0] rounded-[8px] shadow-[#1E293B_2px_2px_0px_0px] overflow-hidden hover:shadow-[#1E293B_3px_3px_0px_0px] transition-shadow cursor-pointer"
      onClick={() => onNavigate(product.id)}
    >
      {/* Image */}
      <div className="h-36 bg-[#F1F5F9] flex items-center justify-center overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[#94A3B8] text-xs">No Image</span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <p className="font-semibold text-[#0F172A] text-sm leading-snug line-clamp-2">{product.name}</p>
        {product.category && (
          <p className="text-xs text-[#64748B]">{product.category}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#475569]">{variantCount} variant{variantCount !== 1 ? 's' : ''}</span>
          <Badge variant={product.is_active ? 'success' : 'default'} size="sm">
            {product.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        {product.mrp != null && (
          <p className="text-sm font-medium text-[#0F172A]">MRP ₹{product.mrp.toFixed(2)}</p>
        )}
      </div>

      {/* Actions */}
      <div
        className="border-t border-[#E2E8F0] px-3 py-2 flex gap-2"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="flex-1 flex items-center justify-center gap-1 text-xs text-[#2563EB] hover:bg-[#EFF6FF] rounded-[4px] py-1 transition-colors"
          onClick={() => onEdit(product)}
        >
          <Edit2 size={12} /> Edit
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-1 text-xs text-[#64748B] hover:bg-[#F1F5F9] rounded-[4px] py-1 transition-colors"
          onClick={() => onToggleStatus(product)}
        >
          {product.is_active ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
          {product.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const ProductMaster: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    if (!user?.org_id) return;
    setLoading(true);
    try {
      const filters: ProductFilters = {
        search: search || undefined,
        category: filterCategory || undefined,
        isActive: filterStatus === 'all' ? undefined : filterStatus === 'active',
        page,
        pageSize: PAGE_SIZE,
      };
      const res = await getProducts(user.org_id, filters);
      // Client-side brand filter (service doesn't support it yet)
      let data = res.data as unknown as Product[];
      if (filterBrand) {
        data = data.filter(p => p.brand?.toLowerCase().includes(filterBrand.toLowerCase()));
      }
      setProducts(data);
      setTotal(res.total);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [user?.org_id, search, filterCategory, filterBrand, filterStatus, page]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleToggleStatus = async (product: Product) => {
    try {
      await deleteProduct(product.id); // soft-delete toggles is_active
      toast.success(`Product ${product.is_active ? 'deactivated' : 'activated'}`);
      void fetchProducts();
    } catch {
      toast.error('Failed to update product status');
    }
  };

  const handleFormSaved = () => {
    setShowAddModal(false);
    setEditProduct(null);
    void fetchProducts();
  };

  const handleImportCSV = () => {
    toast('CSV import coming soon', { icon: '📄' });
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Product Master</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Manage your product catalog and variants
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Upload size={14} />}
            onClick={handleImportCSV}
          >
            Import CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Upload size={14} />}
            onClick={() => exportProductsCSV(products)}
          >
            Export CSV
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setShowAddModal(true)}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] shadow-[#1E293B_2px_2px_0px_0px] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by name or SKU..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search size={16} />}
              size="sm"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
            className="border border-[#94A3B8] rounded-[4px] px-3 py-1.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <Input
            placeholder="Filter by brand..."
            value={filterBrand}
            onChange={e => { setFilterBrand(e.target.value); setPage(1); }}
            size="sm"
            className="w-full sm:w-40"
          />
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value as 'all' | 'active' | 'inactive'); setPage(1); }}
            className="border border-[#94A3B8] rounded-[4px] px-3 py-1.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center border border-[#E2E8F0] rounded-[4px] overflow-hidden">
            <button
              className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-[#2563EB] text-white' : 'bg-white text-[#64748B] hover:bg-[#F8FAFC]'}`}
              onClick={() => setViewMode('table')}
              title="Table view"
            >
              <List size={14} />
            </button>
            <button
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#2563EB] text-white' : 'bg-white text-[#64748B] hover:bg-[#F8FAFC]'}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <LayoutGrid size={14} />
            </button>
          </div>

          <Button variant="ghost" size="sm" onClick={() => void fetchProducts()} leftIcon={<RefreshCw size={14} />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2563EB] border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-12 text-center">
          <p className="text-[#94A3B8] text-sm">No products found. Add your first product to get started.</p>
          <Button
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setShowAddModal(true)}
            className="mt-4"
          >
            Add Product
          </Button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] shadow-[#1E293B_2px_2px_0px_0px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Image</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">SKUs</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Brand</th>
                  <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">MRP</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#0F172A]">Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-[#0F172A]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr
                    key={product.id}
                    className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                    onClick={() => navigate(`/inventory/products/${product.id}`)}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="w-10 h-10 bg-[#F1F5F9] rounded-[4px] overflow-hidden flex items-center justify-center">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[#CBD5E1] text-xs">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#0F172A]">{product.name}</td>
                    <td className="px-4 py-3 text-[#64748B]">{product.variants?.length ?? 0}</td>
                    <td className="px-4 py-3 text-[#64748B]">{product.category ?? '—'}</td>
                    <td className="px-4 py-3 text-[#64748B]">{product.brand ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-[#0F172A]">
                      {product.mrp != null ? `₹${product.mrp.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={product.is_active ? 'success' : 'default'} size="sm">
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td
                      className="px-4 py-3 text-center"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="p-1 rounded hover:bg-[#EFF6FF] text-[#2563EB] transition-colors"
                          title="Edit"
                          onClick={() => setEditProduct(product)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="p-1 rounded hover:bg-[#F1F5F9] text-[#64748B] transition-colors"
                          title={product.is_active ? 'Deactivate' : 'Activate'}
                          onClick={() => void handleToggleStatus(product)}
                        >
                          {product.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={setEditProduct}
              onToggleStatus={p => void handleToggleStatus(p)}
              onNavigate={id => navigate(`/inventory/products/${id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        total={total}
      />

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Product"
        size="xl"
      >
        <ProductForm onSaved={handleFormSaved} onCancel={() => setShowAddModal(false)} />
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={!!editProduct}
        onClose={() => setEditProduct(null)}
        title="Edit Product"
        size="xl"
      >
        {editProduct && (
          <ProductForm
            initialData={editProduct}
            onSaved={handleFormSaved}
            onCancel={() => setEditProduct(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default ProductMaster;
