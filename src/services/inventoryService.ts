import { supabase } from '@/supabase/client'
import type { Database } from '@/types/supabase'

type Inventory = Database['public']['Tables']['inventory']['Row']
type StockMovement = Database['public']['Tables']['stock_movements']['Row']
type Warehouse = Database['public']['Tables']['warehouses']['Row']
type WarehouseInsert = Database['public']['Tables']['warehouses']['Insert']
type WarehouseUpdate = Database['public']['Tables']['warehouses']['Update']

export type MovementType = 'purchase' | 'sale' | 'adjustment' | 'transfer_in' | 'transfer_out' | 'return' | 'damage'

export interface InventoryFilters {
  warehouseId?: string
  variantId?: string
  lowStockThreshold?: number
}

export interface StockMovementFilters {
  warehouseId?: string
  variantId?: string
  type?: MovementType
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// ─── List inventory rows with product / variant / warehouse joins ─────────────
export async function getInventory(
  orgId: string,
  warehouseId?: string,
  variantId?: string,
): Promise<(Inventory & {
  variant: { id: string; sku: string; name: string; product: { id: string; name: string } | null } | null
  warehouse: { id: string; name: string } | null
})[]> {
  let query = supabase
    .from('inventory')
    .select(
      '*, variant:product_variants(id, sku, name, product:products(id, name)), warehouse:warehouses(id, name)',
    )
    .eq('org_id', orgId)

  if (warehouseId) query = query.eq('warehouse_id', warehouseId)
  if (variantId) query = query.eq('variant_id', variantId)

  const { data, error } = await query.order('updated_at', { ascending: false })
  if (error) throw new Error(`getInventory failed: ${error.message}`)
  return (data ?? []) as (Inventory & {
    variant: { id: string; sku: string; name: string; product: { id: string; name: string } | null } | null
    warehouse: { id: string; name: string } | null
  })[]
}

// ─── Items below a given quantity threshold (default: 10) ───────────────────
export async function getLowStockItems(
  orgId: string,
  threshold: number = 10,
): Promise<Inventory[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, variant:product_variants(id, sku, name), warehouse:warehouses(id, name)')
    .eq('org_id', orgId)
    .lte('quantity', threshold)
    .order('quantity', { ascending: true })

  if (error) throw new Error(`getLowStockItems failed: ${error.message}`)
  return data ?? []
}

// ─── Adjust stock: insert a movement record + update inventory quantity ──────
export async function adjustStock(
  variantId: string,
  warehouseId: string,
  quantity: number,        // positive = add, negative = remove
  type: MovementType,
  notes: string | null,
  userId: string,
): Promise<StockMovement> {
  // Insert movement record
  const { data: movement, error: movError } = await supabase
    .from('stock_movements')
    .insert({
      variant_id: variantId,
      warehouse_id: warehouseId,
      quantity,
      type,
      notes,
      created_by: userId,
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (movError) throw new Error(`adjustStock: movement insert failed — ${movError.message}`)

  // Upsert inventory row
  const { error: invError } = await supabase.rpc('upsert_inventory_quantity', {
    p_variant_id: variantId,
    p_warehouse_id: warehouseId,
    p_delta: quantity,
  })

  if (invError) {
    // Fallback: manual upsert if RPC not available
    const { data: existing } = await supabase
      .from('inventory')
      .select('id, quantity')
      .eq('variant_id', variantId)
      .eq('warehouse_id', warehouseId)
      .maybeSingle()

    if (existing) {
      const { error: updateErr } = await supabase
        .from('inventory')
        .update({
          quantity: existing.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
      if (updateErr) throw new Error(`adjustStock: inventory update failed — ${updateErr.message}`)
    } else {
      const { error: insertErr } = await supabase.from('inventory').insert({
        variant_id: variantId,
        warehouse_id: warehouseId,
        quantity,
        updated_at: new Date().toISOString(),
      })
      if (insertErr) throw new Error(`adjustStock: inventory insert failed — ${insertErr.message}`)
    }
  }

  return movement
}

// ─── Transfer stock between two warehouses ───────────────────────────────────
export async function transferStock(
  fromWarehouseId: string,
  toWarehouseId: string,
  variantId: string,
  quantity: number,
  userId: string,
): Promise<{ from: StockMovement; to: StockMovement }> {
  if (quantity <= 0) throw new Error('transferStock: quantity must be positive')
  if (fromWarehouseId === toWarehouseId) throw new Error('transferStock: warehouses must differ')

  const [from, to] = await Promise.all([
    adjustStock(variantId, fromWarehouseId, -quantity, 'transfer_out', `Transfer to ${toWarehouseId}`, userId),
    adjustStock(variantId, toWarehouseId, quantity, 'transfer_in', `Transfer from ${fromWarehouseId}`, userId),
  ])

  return { from, to }
}

// ─── Paginated movement history ──────────────────────────────────────────────
export async function getStockMovements(
  orgId: string,
  filters: StockMovementFilters = {},
): Promise<PaginatedResult<StockMovement>> {
  const { warehouseId, variantId, type, dateFrom, dateTo, page = 1, pageSize = 30 } = filters
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('stock_movements')
    .select(
      '*, variant:product_variants(id, sku, name), warehouse:warehouses(id, name)',
      { count: 'exact' },
    )
    .eq('org_id', orgId)

  if (warehouseId) query = query.eq('warehouse_id', warehouseId)
  if (variantId) query = query.eq('variant_id', variantId)
  if (type) query = query.eq('type', type)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', dateTo)

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error(`getStockMovements failed: ${error.message}`)

  return { data: data ?? [], total: count ?? 0, page, pageSize }
}

// ─── List warehouses ─────────────────────────────────────────────────────────
export async function getWarehouses(orgId: string): Promise<Warehouse[]> {
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .eq('org_id', orgId)
    .order('name', { ascending: true })

  if (error) throw new Error(`getWarehouses failed: ${error.message}`)
  return data ?? []
}

// ─── Create a warehouse ──────────────────────────────────────────────────────
export async function createWarehouse(
  orgId: string,
  warehouseData: Omit<WarehouseInsert, 'org_id' | 'created_at' | 'updated_at'>,
): Promise<Warehouse> {
  const { data, error } = await supabase
    .from('warehouses')
    .insert({
      ...warehouseData,
      org_id: orgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (error) throw new Error(`createWarehouse failed: ${error.message}`)
  return data
}

// ─── Update a warehouse ──────────────────────────────────────────────────────
export async function updateWarehouse(
  id: string,
  updateData: Omit<WarehouseUpdate, 'id' | 'org_id' | 'created_at'>,
): Promise<Warehouse> {
  const { data, error } = await supabase
    .from('warehouses')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(`updateWarehouse failed: ${error.message}`)
  return data
}
