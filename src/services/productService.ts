import { supabase } from '@/supabase/client'
import type { Database } from '@/types/supabase'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']
type Variant = Database['public']['Tables']['product_variants']['Row']
type VariantInsert = Database['public']['Tables']['product_variants']['Insert']
type VariantUpdate = Database['public']['Tables']['product_variants']['Update']

export interface ProductFilters {
  search?: string
  category?: string
  isActive?: boolean
  page?: number
  pageSize?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface CSVProductRow {
  name: string
  sku: string
  category?: string
  description?: string
  price?: number
  cost?: number
  barcode?: string
  weight_grams?: number
  [key: string]: unknown
}

// ─── List products with optional search / filter / pagination ───────────────
export async function getProducts(
  orgId: string,
  filters: ProductFilters = {},
): Promise<PaginatedResult<Product>> {
  const { search, category, isActive, page = 1, pageSize = 20 } = filters
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('org_id', orgId)

  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`)
  }
  if (category) {
    query = query.eq('category', category)
  }
  if (typeof isActive === 'boolean') {
    query = query.eq('is_active', isActive)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error(`getProducts failed: ${error.message}`)

  return {
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  }
}

// ─── Fetch a single product including its variants ───────────────────────────
export async function getProduct(
  id: string,
): Promise<(Product & { variants: Variant[] }) | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`getProduct failed: ${error.message}`)
  return data as (Product & { variants: Variant[] }) | null
}

// ─── Create a new product ────────────────────────────────────────────────────
export async function createProduct(
  orgId: string,
  productData: Omit<ProductInsert, 'org_id' | 'created_at' | 'updated_at'>,
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      ...productData,
      org_id: orgId,
      is_active: productData.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (error) throw new Error(`createProduct failed: ${error.message}`)
  return data
}

// ─── Update a product ────────────────────────────────────────────────────────
export async function updateProduct(
  id: string,
  updateData: Omit<ProductUpdate, 'id' | 'org_id' | 'created_at'>,
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(`updateProduct failed: ${error.message}`)
  return data
}

// ─── Soft-delete a product (set is_active = false) ──────────────────────────
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(`deleteProduct failed: ${error.message}`)
}

// ─── List variants for a product ─────────────────────────────────────────────
export async function getVariants(productId: string): Promise<Variant[]> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`getVariants failed: ${error.message}`)
  return data ?? []
}

// ─── Create a new variant ────────────────────────────────────────────────────
export async function createVariant(
  productId: string,
  variantData: Omit<VariantInsert, 'product_id' | 'created_at' | 'updated_at'>,
): Promise<Variant> {
  const { data, error } = await supabase
    .from('product_variants')
    .insert({
      ...variantData,
      product_id: productId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (error) throw new Error(`createVariant failed: ${error.message}`)
  return data
}

// ─── Update a variant ────────────────────────────────────────────────────────
export async function updateVariant(
  id: string,
  updateData: Omit<VariantUpdate, 'id' | 'product_id' | 'created_at'>,
): Promise<Variant> {
  const { data, error } = await supabase
    .from('product_variants')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(`updateVariant failed: ${error.message}`)
  return data
}

// ─── Delete a variant (hard delete — variants don't need soft delete) ────────
export async function deleteVariant(id: string): Promise<void> {
  const { error } = await supabase.from('product_variants').delete().eq('id', id)
  if (error) throw new Error(`deleteVariant failed: ${error.message}`)
}

// ─── Bulk-import products from parsed CSV rows ───────────────────────────────
export async function importProductsFromCSV(
  orgId: string,
  rows: CSVProductRow[],
): Promise<{ inserted: number; errors: { row: number; message: string }[] }> {
  const errors: { row: number; message: string }[] = []
  const records: ProductInsert[] = []
  const now = new Date().toISOString()

  rows.forEach((row, index) => {
    if (!row.name || typeof row.name !== 'string') {
      errors.push({ row: index + 1, message: 'Missing required field: name' })
      return
    }
    if (!row.sku || typeof row.sku !== 'string') {
      errors.push({ row: index + 1, message: 'Missing required field: sku' })
      return
    }
    records.push({
      org_id: orgId,
      name: row.name.trim(),
      sku: row.sku.trim(),
      category: row.category ? String(row.category).trim() : null,
      description: row.description ? String(row.description).trim() : null,
      price: row.price != null ? Number(row.price) : null,
      cost: row.cost != null ? Number(row.cost) : null,
      barcode: row.barcode ? String(row.barcode).trim() : null,
      weight_grams: row.weight_grams != null ? Number(row.weight_grams) : null,
      is_active: true,
      created_at: now,
      updated_at: now,
    })
  })

  if (records.length === 0) {
    return { inserted: 0, errors }
  }

  // Upsert in chunks of 500 to avoid request size limits
  const CHUNK = 500
  let inserted = 0

  for (let i = 0; i < records.length; i += CHUNK) {
    const chunk = records.slice(i, i + CHUNK)
    const { error } = await supabase
      .from('products')
      .upsert(chunk, { onConflict: 'org_id,sku' })

    if (error) {
      // Mark the entire chunk as errored rather than silently swallowing
      chunk.forEach((_, idx) => {
        errors.push({
          row: i + idx + 1,
          message: `Bulk insert error: ${error.message}`,
        })
      })
    } else {
      inserted += chunk.length
    }
  }

  return { inserted, errors }
}
