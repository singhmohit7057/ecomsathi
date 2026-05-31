-- =============================================================================
-- EcomSathi SaaS — Functions and Triggers
-- Migration: 003_functions_triggers.sql
-- =============================================================================

-- =============================================================================
-- 1. update_updated_at()
-- Generic trigger function that stamps updated_at = now() on any table.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at() IS
  'Generic BEFORE UPDATE trigger that refreshes the updated_at column to now().';

-- Apply updated_at trigger to all relevant tables
-- profiles
CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- organizations
CREATE OR REPLACE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- products
CREATE OR REPLACE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- product_variants
CREATE OR REPLACE TRIGGER trg_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- purchase_orders
CREATE OR REPLACE TRIGGER trg_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- subscriptions
CREATE OR REPLACE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 2. handle_new_user()
-- Fires on auth.users INSERT (via Supabase Auth hook).
-- Creates a corresponding profile row and a default personal organization.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id   UUID;
  v_org_slug TEXT;
  v_email    TEXT;
  v_name     TEXT;
BEGIN
  -- Extract email from the new auth.users row
  v_email := NEW.email;

  -- Derive a display name: prefer user metadata, fall back to email prefix
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(v_email, '@', 1)
  );

  -- Build a URL-safe org slug from email prefix + short random suffix
  -- to guarantee uniqueness even when multiple users share a prefix.
  v_org_slug := regexp_replace(
    lower(split_part(v_email, '@', 1)),
    '[^a-z0-9]', '-', 'g'
  ) || '-' || substring(gen_random_uuid()::TEXT, 1, 8);

  -- 1. Create the default organization
  INSERT INTO public.organizations (name, slug)
  VALUES (v_name || '''s Workspace', v_org_slug)
  RETURNING id INTO v_org_id;

  -- 2. Create the profile row
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    org_id,
    org_name,
    role,
    subscription_status
  )
  VALUES (
    NEW.id,
    v_email,
    v_name,
    NEW.raw_user_meta_data->>'avatar_url',
    v_org_id,
    v_name || '''s Workspace',
    'owner',
    'free'
  );

  -- 3. Add user as 'owner' in org_members
  INSERT INTO public.org_members (org_id, user_id, role)
  VALUES (v_org_id, NEW.id, 'owner');

  -- 4. Set org owner back-reference
  UPDATE public.organizations
  SET owner_id = NEW.id
  WHERE id = v_org_id;

  -- 5. Create a default free subscription for the new org
  INSERT INTO public.subscriptions (
    org_id,
    plan,
    status,
    sku_limit,
    marketplace_count
  )
  VALUES (
    v_org_id,
    'free',
    'active',
    100,
    2
  );

  -- 6. Create a default warehouse for the new org
  INSERT INTO public.warehouses (
    org_id,
    name,
    code,
    is_default
  )
  VALUES (
    v_org_id,
    'Primary Warehouse',
    'WH-001',
    true
  );

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Creates profile, default org, org membership, default subscription, and default warehouse when a new auth.users row is inserted.';

-- Attach the trigger to auth.users
-- (Supabase recommends creating this in the auth schema via migration)
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 3. auto_delete_expired_files()
-- Deletes uploaded_files rows where expires_at < now().
-- Called by pg_cron (e.g. every hour) or Supabase Edge Functions / scheduled jobs.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.auto_delete_expired_files()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.uploaded_files
  WHERE expires_at IS NOT NULL
    AND expires_at < now();

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN v_deleted;
END;
$$;

COMMENT ON FUNCTION public.auto_delete_expired_files() IS
  'Purges uploaded_files rows whose expires_at timestamp has passed. Returns the number of rows deleted. Call via pg_cron or a scheduled Edge Function.';

-- Optional: schedule via pg_cron if the extension is enabled in Supabase
-- SELECT cron.schedule(
--   'delete-expired-files',
--   '0 * * * *',          -- every hour at :00
--   'SELECT public.auto_delete_expired_files()'
-- );

-- =============================================================================
-- 4. update_inventory_on_movement()
-- After a new stock_movement row is inserted, adjusts public.inventory.
--
-- Rules:
--   positive quantity  → adds to stock (purchase, return, initial, adjustment+)
--   negative quantity  → reduces stock (sale, write_off, adjustment-)
--   movement_type = 'transfer' is handled by TWO movement rows (out + in).
--
-- Uses INSERT ... ON CONFLICT to upsert the inventory row if it doesn't exist.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_inventory_on_movement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Upsert inventory row for the variant + warehouse combination.
  -- quantity is signed: positive = inbound, negative = outbound.
  INSERT INTO public.inventory (
    org_id,
    variant_id,
    warehouse_id,
    quantity,
    reserved_quantity,
    last_updated
  )
  VALUES (
    NEW.org_id,
    NEW.variant_id,
    NEW.warehouse_id,
    GREATEST(0, NEW.quantity),   -- on first insert, never go below 0
    0,
    now()
  )
  ON CONFLICT (variant_id, warehouse_id)
  DO UPDATE SET
    quantity     = GREATEST(0, inventory.quantity + NEW.quantity),
    last_updated = now();

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_inventory_on_movement() IS
  'AFTER INSERT trigger on stock_movements. Upserts inventory.quantity by the signed movement quantity. Quantity never goes below 0.';

-- Attach the trigger to stock_movements
CREATE OR REPLACE TRIGGER trg_stock_movement_update_inventory
  AFTER INSERT ON public.stock_movements
  FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_movement();

-- =============================================================================
-- 5. (Utility) log_activity()
-- Convenience function called by other server-side functions to write
-- audit entries to activity_logs without repeating boilerplate.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.log_activity(
  p_org_id       UUID,
  p_user_id      UUID,
  p_action       TEXT,
  p_resource_type TEXT  DEFAULT NULL,
  p_resource_id  UUID  DEFAULT NULL,
  p_metadata     JSONB DEFAULT NULL,
  p_ip_address   INET  DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs (
    org_id,
    user_id,
    action,
    resource_type,
    resource_id,
    metadata,
    ip_address
  )
  VALUES (
    p_org_id,
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_metadata,
    p_ip_address
  );
END;
$$;

COMMENT ON FUNCTION public.log_activity(UUID, UUID, TEXT, TEXT, UUID, JSONB, INET) IS
  'Helper to write a row into activity_logs. Intended for use by server-side triggers and Edge Functions.';
