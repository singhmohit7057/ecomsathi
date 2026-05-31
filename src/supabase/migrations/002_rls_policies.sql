-- =============================================================================
-- EcomSathi SaaS — Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- =============================================================================
-- Design conventions:
--   • "own org" = the caller's user_id exists in org_members for that org_id
--   • "admin or above" = org_members.role IN ('owner', 'admin')
--   • auth.uid() = the authenticated Supabase user ID
-- =============================================================================

-- -------------------------
-- Helper: is the caller a member of an org?
-- (used inline in policies to avoid function-call overhead per row)
-- -------------------------

-- =============================================================================
-- profiles
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users read their own profile only
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Users update their own profile only
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- The handle_new_user trigger (service role) inserts profiles; no policy needed
-- for INSERT because service_role bypasses RLS.

-- =============================================================================
-- organizations
-- =============================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Any member of the org may read it
CREATE POLICY "organizations_select_member"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = organizations.id
        AND om.user_id = auth.uid()
    )
  );

-- Only owner or admin may update org details
CREATE POLICY "organizations_update_admin"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = organizations.id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = organizations.id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

-- =============================================================================
-- org_members
-- =============================================================================
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- Any member can see all members of their own org
CREATE POLICY "org_members_select_same_org"
  ON public.org_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members self
      WHERE self.org_id  = org_members.org_id
        AND self.user_id = auth.uid()
    )
  );

-- Only owner can insert new members (inviting)
CREATE POLICY "org_members_insert_owner"
  ON public.org_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = org_members.org_id
        AND om.user_id = auth.uid()
        AND om.role    = 'owner'
    )
  );

-- Only owner can update member roles
CREATE POLICY "org_members_update_owner"
  ON public.org_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = org_members.org_id
        AND om.user_id = auth.uid()
        AND om.role    = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = org_members.org_id
        AND om.user_id = auth.uid()
        AND om.role    = 'owner'
    )
  );

-- Owner can remove members; members can remove themselves
CREATE POLICY "org_members_delete_owner_or_self"
  ON public.org_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = org_members.org_id
        AND om.user_id = auth.uid()
        AND om.role    = 'owner'
    )
  );

-- =============================================================================
-- products
-- =============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_member"
  ON public.products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = products.org_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "products_insert_admin"
  ON public.products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = products.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

CREATE POLICY "products_update_admin"
  ON public.products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = products.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = products.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

CREATE POLICY "products_delete_admin"
  ON public.products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = products.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

-- =============================================================================
-- product_variants
-- =============================================================================
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_variants_select_member"
  ON public.product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.org_members om ON om.org_id = p.org_id
      WHERE p.id       = product_variants.product_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "product_variants_write_admin"
  ON public.product_variants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.org_members om ON om.org_id = p.org_id
      WHERE p.id       = product_variants.product_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

CREATE POLICY "product_variants_update_admin"
  ON public.product_variants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.org_members om ON om.org_id = p.org_id
      WHERE p.id       = product_variants.product_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.org_members om ON om.org_id = p.org_id
      WHERE p.id       = product_variants.product_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

CREATE POLICY "product_variants_delete_admin"
  ON public.product_variants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.org_members om ON om.org_id = p.org_id
      WHERE p.id       = product_variants.product_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

-- =============================================================================
-- warehouses
-- =============================================================================
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "warehouses_select_member"
  ON public.warehouses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = warehouses.org_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "warehouses_insert_admin"
  ON public.warehouses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = warehouses.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

CREATE POLICY "warehouses_update_admin"
  ON public.warehouses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = warehouses.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = warehouses.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

CREATE POLICY "warehouses_delete_admin"
  ON public.warehouses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = warehouses.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

-- =============================================================================
-- inventory
-- =============================================================================
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_select_member"
  ON public.inventory FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = inventory.org_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "inventory_insert_admin"
  ON public.inventory FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = inventory.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

CREATE POLICY "inventory_update_admin"
  ON public.inventory FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = inventory.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = inventory.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

CREATE POLICY "inventory_delete_admin"
  ON public.inventory FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = inventory.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

-- =============================================================================
-- stock_movements
-- =============================================================================
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_movements_select_member"
  ON public.stock_movements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = stock_movements.org_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "stock_movements_insert_admin"
  ON public.stock_movements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = stock_movements.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

-- stock_movements is an append-only ledger; no UPDATE or DELETE policies.

-- =============================================================================
-- purchase_orders
-- =============================================================================
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchase_orders_select_member"
  ON public.purchase_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = purchase_orders.org_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "purchase_orders_insert_admin"
  ON public.purchase_orders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = purchase_orders.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

CREATE POLICY "purchase_orders_update_admin"
  ON public.purchase_orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = purchase_orders.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = purchase_orders.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

CREATE POLICY "purchase_orders_delete_owner"
  ON public.purchase_orders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = purchase_orders.org_id
        AND om.user_id = auth.uid()
        AND om.role    = 'owner'
    )
  );

-- =============================================================================
-- purchase_order_items
-- =============================================================================
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "po_items_select_member"
  ON public.purchase_order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      JOIN public.org_members om ON om.org_id = po.org_id
      WHERE po.id      = purchase_order_items.po_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "po_items_insert_admin"
  ON public.purchase_order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      JOIN public.org_members om ON om.org_id = po.org_id
      WHERE po.id      = purchase_order_items.po_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

CREATE POLICY "po_items_update_admin"
  ON public.purchase_order_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      JOIN public.org_members om ON om.org_id = po.org_id
      WHERE po.id      = purchase_order_items.po_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      JOIN public.org_members om ON om.org_id = po.org_id
      WHERE po.id      = purchase_order_items.po_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

CREATE POLICY "po_items_delete_admin"
  ON public.purchase_order_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      JOIN public.org_members om ON om.org_id = po.org_id
      WHERE po.id      = purchase_order_items.po_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

-- =============================================================================
-- marketplaces  (public lookup — everyone can read)
-- =============================================================================
ALTER TABLE public.marketplaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marketplaces_select_all"
  ON public.marketplaces FOR SELECT
  USING (true);

-- Only service role writes marketplace records (seed data / admin ops).

-- =============================================================================
-- orders
-- =============================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_select_member"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = orders.org_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "orders_insert_admin"
  ON public.orders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = orders.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = orders.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = orders.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

-- =============================================================================
-- settlements
-- =============================================================================
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settlements_select_member"
  ON public.settlements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = settlements.org_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "settlements_insert_admin"
  ON public.settlements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = settlements.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

CREATE POLICY "settlements_update_admin"
  ON public.settlements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = settlements.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = settlements.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

-- =============================================================================
-- reconciliation_reports
-- =============================================================================
ALTER TABLE public.reconciliation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recon_reports_select_member"
  ON public.reconciliation_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = reconciliation_reports.org_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "recon_reports_insert_admin"
  ON public.reconciliation_reports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = reconciliation_reports.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

CREATE POLICY "recon_reports_update_admin"
  ON public.reconciliation_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = reconciliation_reports.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = reconciliation_reports.org_id
        AND om.user_id = auth.uid()
        AND om.role    IN ('owner', 'admin')
    )
  );

-- =============================================================================
-- subscriptions
-- =============================================================================
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Only the org owner can view their subscription
CREATE POLICY "subscriptions_select_owner"
  ON public.subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = subscriptions.org_id
        AND om.user_id = auth.uid()
        AND om.role    = 'owner'
    )
  );

-- Inserts and updates are performed by service role (Razorpay webhooks, admin).

-- =============================================================================
-- tool_usage_logs
-- =============================================================================
ALTER TABLE public.tool_usage_logs ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous/anon role) may insert a usage log
CREATE POLICY "tool_usage_logs_insert_anon"
  ON public.tool_usage_logs FOR INSERT
  WITH CHECK (true);

-- SELECT is restricted to service_role only (no client-side select policy).
-- If you need admin dashboard access, add a policy scoped to a specific role.

-- =============================================================================
-- uploaded_files
-- =============================================================================
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- Anonymous and authenticated users may insert (upload tracking)
CREATE POLICY "uploaded_files_insert_anon"
  ON public.uploaded_files FOR INSERT
  WITH CHECK (true);

-- File owner (if authenticated) can read their own files
CREATE POLICY "uploaded_files_select_owner"
  ON public.uploaded_files FOR SELECT
  USING (
    user_id IS NOT NULL
    AND user_id = auth.uid()
  );

-- File owner can delete their own files
CREATE POLICY "uploaded_files_delete_owner"
  ON public.uploaded_files FOR DELETE
  USING (
    user_id IS NOT NULL
    AND user_id = auth.uid()
  );

-- =============================================================================
-- activity_logs
-- =============================================================================
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Org members can read audit logs for their own org
CREATE POLICY "activity_logs_select_member"
  ON public.activity_logs FOR SELECT
  USING (
    org_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.org_id  = activity_logs.org_id
        AND om.user_id = auth.uid()
    )
  );

-- Inserts are performed by server-side functions via service role.
