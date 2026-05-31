// ============================================================
// EcomSathi — Application Types
// ============================================================

// -------------------------------------------------------
// User & Auth
// -------------------------------------------------------

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  org_name: string | null;
  org_id: string | null;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  subscription_status: 'free' | 'trial' | 'pro' | 'enterprise';
  subscription_expires_at: string | null;
  gstin: string | null;
  phone: string | null;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  subscription_status: string;
  created_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
  profile?: User;
}

// -------------------------------------------------------
// Products
// -------------------------------------------------------

export interface Product {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  category: string | null;
  brand: string | null;
  hsn_code: string | null;
  gst_rate: number;
  mrp: number | null;
  cost_price: number | null;
  selling_price: number | null;
  images: string[];
  tags: string[];
  is_active: boolean;
  created_at: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  barcode: string | null;
  name: string;
  attributes: Record<string, string>;
  mrp: number | null;
  cost_price: number | null;
  selling_price: number | null;
  weight_grams: number | null;
  dimensions: { l: number; w: number; h: number } | null;
  is_active: boolean;
}

// -------------------------------------------------------
// Inventory
// -------------------------------------------------------

export interface Warehouse {
  id: string;
  org_id: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  is_active: boolean;
  is_default: boolean;
}

export interface InventoryItem {
  id: string;
  variant_id: string;
  warehouse_id: string;
  quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  last_updated: string;
  variant?: ProductVariant;
  warehouse?: Warehouse;
  product?: Product;
}

export interface StockMovement {
  id: string;
  org_id: string;
  variant_id: string;
  warehouse_id: string;
  movement_type:
    | 'purchase'
    | 'sale'
    | 'return'
    | 'transfer'
    | 'adjustment'
    | 'write_off'
    | 'initial';
  quantity: number;
  reference_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  org_id: string;
  po_number: string;
  supplier_name: string | null;
  supplier_gstin: string | null;
  warehouse_id: string;
  status: 'draft' | 'pending' | 'approved' | 'received' | 'partial' | 'cancelled';
  total_amount: number;
  expected_date: string | null;
  notes: string | null;
  created_at: string;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  variant_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;
  variant?: ProductVariant;
}

// -------------------------------------------------------
// Reconciliation
// -------------------------------------------------------

export type MarketplaceName =
  | 'Amazon'
  | 'Flipkart'
  | 'Myntra'
  | 'Meesho'
  | 'AJIO'
  | 'Nykaa'
  | 'Snapdeal';

export interface Marketplace {
  id: string;
  name: MarketplaceName;
  slug: string;
  is_active: boolean;
}

export interface Order {
  id: string;
  org_id: string;
  marketplace_id: string;
  order_id: string;
  order_date: string;
  status: string;
  total_amount: number;
  settlement_amount: number | null;
  marketplace_fee: number | null;
  gst_amount: number | null;
  shipping_amount: number | null;
  sku: string | null;
  raw_data: Record<string, unknown>;
}

export interface Settlement {
  id: string;
  org_id: string;
  marketplace_id: string;
  settlement_id: string | null;
  settlement_date: string;
  amount: number;
  status: 'pending' | 'matched' | 'unmatched' | 'disputed';
  order_id: string | null;
}

export interface ReconciliationReport {
  id: string;
  org_id: string;
  marketplace_id: string;
  report_type: 'orders' | 'settlements' | 'returns' | 'refunds';
  date_from: string;
  date_to: string;
  total_orders: number;
  matched_orders: number;
  unmatched_orders: number;
  total_revenue: number;
  total_fees: number;
  discrepancy_amount: number;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
}

// -------------------------------------------------------
// SKU Tools
// -------------------------------------------------------

export interface SKUTemplate {
  id: string;
  name: string;
  pattern: string;
  separator: string;
  components: SKUComponent[];
}

export interface SKUComponent {
  type: 'brand' | 'category' | 'color' | 'size' | 'sequence' | 'custom' | 'year';
  value?: string;
  digits?: number;
}

export interface GeneratedSKU {
  sku: string;
  barcode?: string;
  productName?: string;
  attributes?: Record<string, string>;
}

// -------------------------------------------------------
// GST
// -------------------------------------------------------

export interface GSTINDetails {
  gstin: string;
  legalName: string;
  tradeName: string;
  address: string;
  state: string;
  stateCode: string;
  registrationDate: string;
  taxpayerType: string;
  status: 'Active' | 'Cancelled' | 'Suspended';
  businessConstitution: string;
}

export interface HSNCode {
  code: string;
  description: string;
  gstRate: number;
  cessRate?: number;
}

export interface SACCode {
  code: string;
  description: string;
  gstRate: number;
}

// -------------------------------------------------------
// Pagination
// -------------------------------------------------------

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// -------------------------------------------------------
// API
// -------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProcessingJob {
  jobId: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  resultUrl?: string;
  error?: string;
}
