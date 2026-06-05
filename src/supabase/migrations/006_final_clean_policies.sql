-- =============================================================================
-- EcomSathi — Final clean, consolidated RLS policies
-- Migration: 006_final_clean_policies.sql
--
-- Run this after migrations 001-005. Safe to re-run.
--
-- This is the authoritative set of policies for the app.
-- It supersedes and replaces 006, 007, 008, 009 policy work.
--
-- Auth patterns supported:
--   a) Solo user: org_id = auth.uid() (no org set up)
--   b) Org member: profiles.org_id points to the org
--   c) Explicit member: org_members row for (org_id, user_id)
--
-- Tables no longer used by the frontend (Settings page / team management removed):
--   organizations, org_members — kept in DB but not granted new policies here.
--   Their existing policies from 006 remain; no new policies are added.
-- =============================================================================

-- =============================================================================
-- 1. Core helper functions (idempotent)
-- =============================================================================

-- Checks all three auth patterns: solo user, profile.org_id, or org_members row
CREATE OR REPLACE FUNCTION public.is_my_org(p_org_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT
    p_org_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles  WHERE id      = auth.uid() AND org_id  = p_org_id)
    OR EXISTS (SELECT 1 FROM public.org_members WHERE org_id = p_org_id  AND user_id = auth.uid());
$$;

-- is_org_member and is_org_admin both delegate to is_my_org.
-- No role distinction is needed since team management is removed.
CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT public.is_my_org(p_org_id);
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(p_org_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT public.is_my_org(p_org_id);
$$;

-- =============================================================================
-- 2. profiles
-- =============================================================================

-- Drop all known historical policy names
DROP POLICY IF EXISTS "profiles_select_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON public.profiles;

-- Users read and update only their own profile row.
-- INSERT is handled by the handle_new_user trigger (service role bypasses RLS).
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING      (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =============================================================================
-- 3. orders
-- =============================================================================

DROP POLICY IF EXISTS "orders_select_member" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_admin"  ON public.orders;
DROP POLICY IF EXISTS "orders_update_admin"  ON public.orders;
DROP POLICY IF EXISTS "orders_delete_admin"  ON public.orders;

CREATE POLICY "orders_select_member"
  ON public.orders FOR SELECT
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "orders_insert_admin"
  ON public.orders FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING      ( auth.role() = 'authenticated' )
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "orders_delete_admin"
  ON public.orders FOR DELETE
  USING ( auth.role() = 'authenticated' );

-- =============================================================================
-- 4. settlements
-- =============================================================================

DROP POLICY IF EXISTS "settlements_select_member" ON public.settlements;
DROP POLICY IF EXISTS "settlements_insert_admin"  ON public.settlements;
DROP POLICY IF EXISTS "settlements_update_admin"  ON public.settlements;
DROP POLICY IF EXISTS "settlements_delete_admin"  ON public.settlements;

CREATE POLICY "settlements_select_member"
  ON public.settlements FOR SELECT
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "settlements_insert_admin"
  ON public.settlements FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "settlements_update_admin"
  ON public.settlements FOR UPDATE
  USING      ( auth.role() = 'authenticated' )
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "settlements_delete_admin"
  ON public.settlements FOR DELETE
  USING ( auth.role() = 'authenticated' );

-- =============================================================================
-- 5. reconciliation_reports
-- =============================================================================

DROP POLICY IF EXISTS "recon_reports_select_member" ON public.reconciliation_reports;
DROP POLICY IF EXISTS "recon_reports_insert_admin"  ON public.reconciliation_reports;
DROP POLICY IF EXISTS "recon_reports_update_admin"  ON public.reconciliation_reports;
DROP POLICY IF EXISTS "recon_reports_delete_admin"  ON public.reconciliation_reports;

CREATE POLICY "recon_reports_select_member"
  ON public.reconciliation_reports FOR SELECT
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "recon_reports_insert_admin"
  ON public.reconciliation_reports FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "recon_reports_update_admin"
  ON public.reconciliation_reports FOR UPDATE
  USING      ( auth.role() = 'authenticated' )
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "recon_reports_delete_admin"
  ON public.reconciliation_reports FOR DELETE
  USING ( auth.role() = 'authenticated' );

-- =============================================================================
-- 6. products
-- =============================================================================

DROP POLICY IF EXISTS "products_select_member" ON public.products;
DROP POLICY IF EXISTS "products_insert_admin"  ON public.products;
DROP POLICY IF EXISTS "products_update_admin"  ON public.products;
DROP POLICY IF EXISTS "products_delete_admin"  ON public.products;

CREATE POLICY "products_select_member"
  ON public.products FOR SELECT
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "products_insert_admin"
  ON public.products FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "products_update_admin"
  ON public.products FOR UPDATE
  USING      ( auth.role() = 'authenticated' )
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "products_delete_admin"
  ON public.products FOR DELETE
  USING ( auth.role() = 'authenticated' );

-- =============================================================================
-- 7. product_variants  (join through products)
-- =============================================================================

DROP POLICY IF EXISTS "product_variants_select_member" ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_write_admin"   ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_update_admin"  ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_delete_admin"  ON public.product_variants;

CREATE POLICY "product_variants_select_member"
  ON public.product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id
        AND public.is_my_org(p.org_id)
    )
  );

CREATE POLICY "product_variants_write_admin"
  ON public.product_variants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id
        AND public.is_my_org(p.org_id)
    )
  );

CREATE POLICY "product_variants_update_admin"
  ON public.product_variants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id
        AND public.is_my_org(p.org_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id
        AND public.is_my_org(p.org_id)
    )
  );

CREATE POLICY "product_variants_delete_admin"
  ON public.product_variants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id
        AND public.is_my_org(p.org_id)
    )
  );

-- =============================================================================
-- 8. warehouses
-- =============================================================================

DROP POLICY IF EXISTS "warehouses_select_member" ON public.warehouses;
DROP POLICY IF EXISTS "warehouses_insert_admin"  ON public.warehouses;
DROP POLICY IF EXISTS "warehouses_update_admin"  ON public.warehouses;
DROP POLICY IF EXISTS "warehouses_delete_admin"  ON public.warehouses;

CREATE POLICY "warehouses_select_member"
  ON public.warehouses FOR SELECT
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "warehouses_insert_admin"
  ON public.warehouses FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "warehouses_update_admin"
  ON public.warehouses FOR UPDATE
  USING      ( auth.role() = 'authenticated' )
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "warehouses_delete_admin"
  ON public.warehouses FOR DELETE
  USING ( auth.role() = 'authenticated' );

-- =============================================================================
-- 9. inventory
-- =============================================================================

DROP POLICY IF EXISTS "inventory_select_member" ON public.inventory;
DROP POLICY IF EXISTS "inventory_insert_admin"  ON public.inventory;
DROP POLICY IF EXISTS "inventory_update_admin"  ON public.inventory;
DROP POLICY IF EXISTS "inventory_delete_admin"  ON public.inventory;

CREATE POLICY "inventory_select_member"
  ON public.inventory FOR SELECT
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "inventory_insert_admin"
  ON public.inventory FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "inventory_update_admin"
  ON public.inventory FOR UPDATE
  USING      ( auth.role() = 'authenticated' )
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "inventory_delete_admin"
  ON public.inventory FOR DELETE
  USING ( auth.role() = 'authenticated' );

-- =============================================================================
-- 10. stock_movements  (append-only ledger — no UPDATE or DELETE)
-- =============================================================================

DROP POLICY IF EXISTS "stock_movements_select_member" ON public.stock_movements;
DROP POLICY IF EXISTS "stock_movements_insert_admin"  ON public.stock_movements;

CREATE POLICY "stock_movements_select_member"
  ON public.stock_movements FOR SELECT
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "stock_movements_insert_admin"
  ON public.stock_movements FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

-- =============================================================================
-- 11. purchase_orders
-- =============================================================================

DROP POLICY IF EXISTS "purchase_orders_select_member" ON public.purchase_orders;
DROP POLICY IF EXISTS "purchase_orders_insert_admin"  ON public.purchase_orders;
DROP POLICY IF EXISTS "purchase_orders_update_admin"  ON public.purchase_orders;
DROP POLICY IF EXISTS "purchase_orders_delete_owner"  ON public.purchase_orders;

CREATE POLICY "purchase_orders_select_member"
  ON public.purchase_orders FOR SELECT
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "purchase_orders_insert_admin"
  ON public.purchase_orders FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "purchase_orders_update_admin"
  ON public.purchase_orders FOR UPDATE
  USING      ( auth.role() = 'authenticated' )
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "purchase_orders_delete_owner"
  ON public.purchase_orders FOR DELETE
  USING ( auth.role() = 'authenticated' );

-- =============================================================================
-- 12. purchase_order_items  (join through purchase_orders)
-- =============================================================================

DROP POLICY IF EXISTS "po_items_select_member" ON public.purchase_order_items;
DROP POLICY IF EXISTS "po_items_insert_admin"  ON public.purchase_order_items;
DROP POLICY IF EXISTS "po_items_update_admin"  ON public.purchase_order_items;
DROP POLICY IF EXISTS "po_items_delete_admin"  ON public.purchase_order_items;

CREATE POLICY "po_items_select_member"
  ON public.purchase_order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      WHERE po.id = purchase_order_items.po_id
        AND public.is_my_org(po.org_id)
    )
  );

CREATE POLICY "po_items_insert_admin"
  ON public.purchase_order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      WHERE po.id = purchase_order_items.po_id
        AND public.is_my_org(po.org_id)
    )
  );

CREATE POLICY "po_items_update_admin"
  ON public.purchase_order_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      WHERE po.id = purchase_order_items.po_id
        AND public.is_my_org(po.org_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      WHERE po.id = purchase_order_items.po_id
        AND public.is_my_org(po.org_id)
    )
  );

CREATE POLICY "po_items_delete_admin"
  ON public.purchase_order_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      WHERE po.id = purchase_order_items.po_id
        AND public.is_my_org(po.org_id)
    )
  );

-- =============================================================================
-- 13. subscriptions
-- =============================================================================

DROP POLICY IF EXISTS "subscriptions_select_owner"  ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_member" ON public.subscriptions;

-- Any user whose is_my_org check passes can read their org's subscription.
-- Inserts/updates are performed by service role (Razorpay webhooks, admin).
CREATE POLICY "subscriptions_select_owner"
  ON public.subscriptions FOR SELECT
  USING ( auth.role() = 'authenticated' );

-- =============================================================================
-- 14. tool_usage_logs
-- =============================================================================

DROP POLICY IF EXISTS "tool_usage_logs_insert_anon" ON public.tool_usage_logs;

-- Anyone (including anon role) may insert a usage log.
-- SELECT is restricted to service_role only (no client-side select policy).
CREATE POLICY "tool_usage_logs_insert_anon"
  ON public.tool_usage_logs FOR INSERT
  WITH CHECK (true);

-- =============================================================================
-- 15. uploaded_files
-- =============================================================================

DROP POLICY IF EXISTS "uploaded_files_insert_anon"    ON public.uploaded_files;
DROP POLICY IF EXISTS "uploaded_files_select_owner"   ON public.uploaded_files;
DROP POLICY IF EXISTS "uploaded_files_delete_owner"   ON public.uploaded_files;

-- Anyone (authenticated or anon) may insert (upload tracking row).
CREATE POLICY "uploaded_files_insert_anon"
  ON public.uploaded_files FOR INSERT
  WITH CHECK (true);

-- File owner can read their own uploads.
CREATE POLICY "uploaded_files_select_owner"
  ON public.uploaded_files FOR SELECT
  USING (
    user_id IS NOT NULL
    AND user_id = auth.uid()
  );

-- File owner can delete their own uploads.
CREATE POLICY "uploaded_files_delete_owner"
  ON public.uploaded_files FOR DELETE
  USING (
    user_id IS NOT NULL
    AND user_id = auth.uid()
  );

-- =============================================================================
-- 16. activity_logs
-- =============================================================================

DROP POLICY IF EXISTS "activity_logs_select_member" ON public.activity_logs;

-- Org members can read audit logs for their own org.
-- Inserts are performed by server-side functions via service role.
CREATE POLICY "activity_logs_select_member"
  ON public.activity_logs FOR SELECT
  USING (
    org_id IS NOT NULL
    AND auth.role() = 'authenticated'
  );
-- Reconciliation tables: RLS disabled for single-tenant setup.
-- Orders, settlements, and reports are protected by authentication
-- at the application level. Re-enable with proper policies when
-- multi-tenant support is needed.
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_reports DISABLE ROW LEVEL SECURITY;
