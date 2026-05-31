-- =============================================================================
-- EcomSathi SaaS — Initial Schema
-- Migration: 001_initial_schema.sql
-- =============================================================================

-- -------------------------
-- 1. profiles
-- Extends auth.users (Supabase Auth)
-- -------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                      UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                   TEXT        NOT NULL,
  full_name               TEXT,
  avatar_url              TEXT,
  org_name                TEXT,
  org_id                  UUID,                          -- populated after org creation
  role                    TEXT        NOT NULL DEFAULT 'owner'
                            CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  subscription_status     TEXT        NOT NULL DEFAULT 'free'
                            CHECK (subscription_status IN ('free', 'trial', 'pro', 'enterprise')),
  subscription_expires_at TIMESTAMPTZ,
  gstin                   TEXT,
  phone                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'One-to-one extension of auth.users; holds app-level profile data.';

-- -------------------------
-- 2. organizations
-- -------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    TEXT        NOT NULL,
  slug                    TEXT        NOT NULL UNIQUE,
  owner_id                UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  subscription_status     TEXT        NOT NULL DEFAULT 'free'
                            CHECK (subscription_status IN ('free', 'trial', 'pro', 'enterprise')),
  subscription_expires_at TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.organizations IS 'Tenant/organization unit; slug is URL-safe unique identifier.';

-- Now that organizations exists, add the FK from profiles.org_id
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_org_id_fkey
    FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;

-- -------------------------
-- 3. org_members
-- -------------------------
CREATE TABLE IF NOT EXISTS public.org_members (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL DEFAULT 'member'
               CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);

COMMENT ON TABLE public.org_members IS 'Many-to-many between organizations and profiles with per-org role.';

-- -------------------------
-- 4. products
-- -------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID          NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name         TEXT          NOT NULL,
  description  TEXT,
  category     TEXT,
  brand        TEXT,
  hsn_code     TEXT,
  gst_rate     DECIMAL(5,2)  NOT NULL DEFAULT 18,
  mrp          DECIMAL(12,2),
  cost_price   DECIMAL(12,2),
  selling_price DECIMAL(12,2),
  images       JSONB         NOT NULL DEFAULT '[]'::JSONB,
  tags         TEXT[],
  is_active    BOOLEAN       NOT NULL DEFAULT true,
  created_by   UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.products IS 'Master product catalogue scoped to an organization.';

-- -------------------------
-- 5. product_variants
-- -------------------------
CREATE TABLE IF NOT EXISTS public.product_variants (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID          NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku           TEXT          NOT NULL,
  barcode       TEXT,
  name          TEXT          NOT NULL,   -- e.g. "Red / XL"
  attributes    JSONB         NOT NULL DEFAULT '{}'::JSONB,  -- {"color":"Red","size":"XL"}
  mrp           DECIMAL(12,2),
  cost_price    DECIMAL(12,2),
  selling_price DECIMAL(12,2),
  weight_grams  INTEGER,
  dimensions    JSONB,                    -- {"l": 10, "w": 5, "h": 2} in cm
  is_active     BOOLEAN       NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE (product_id, sku)
);

COMMENT ON TABLE public.product_variants IS 'SKU-level variants of a product; attributes stores key/value pairs like color, size.';

-- -------------------------
-- 6. warehouses
-- -------------------------
CREATE TABLE IF NOT EXISTS public.warehouses (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  code       TEXT        NOT NULL,
  address    TEXT,
  city       TEXT,
  state      TEXT,
  pincode    TEXT,
  is_active  BOOLEAN     NOT NULL DEFAULT true,
  is_default BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, code)
);

COMMENT ON TABLE public.warehouses IS 'Physical or virtual warehouse locations scoped to an organization.';

-- -------------------------
-- 7. inventory
-- -------------------------
CREATE TABLE IF NOT EXISTS public.inventory (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  variant_id          UUID        NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  warehouse_id        UUID        NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  quantity            INTEGER     NOT NULL DEFAULT 0,
  reserved_quantity   INTEGER     NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER              DEFAULT 10,
  last_updated        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (variant_id, warehouse_id)
);

COMMENT ON TABLE public.inventory IS 'Available-on-hand and reserved quantities per variant per warehouse.';

-- -------------------------
-- 8. stock_movements
-- -------------------------
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  variant_id     UUID        NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
  warehouse_id   UUID        NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  movement_type  TEXT        NOT NULL
                   CHECK (movement_type IN ('purchase', 'sale', 'return', 'transfer', 'adjustment', 'write_off', 'initial')),
  quantity       INTEGER     NOT NULL,
  reference_id   UUID,          -- order_id or po_id
  reference_type TEXT,          -- 'order' | 'purchase_order' etc.
  notes          TEXT,
  created_by     UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.stock_movements IS 'Append-only ledger of all inventory movements; source of truth for stock levels.';

-- -------------------------
-- 9. purchase_orders
-- -------------------------
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID          NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  po_number       TEXT          NOT NULL,
  supplier_name   TEXT,
  supplier_gstin  TEXT,
  warehouse_id    UUID          REFERENCES public.warehouses(id) ON DELETE SET NULL,
  status          TEXT          NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'pending', 'approved', 'received', 'partial', 'cancelled')),
  total_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes           TEXT,
  expected_date   DATE,
  approved_by     UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by      UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE (org_id, po_number)
);

COMMENT ON TABLE public.purchase_orders IS 'Purchase orders raised to suppliers for restocking inventory.';

-- -------------------------
-- 10. purchase_order_items
-- -------------------------
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id             UUID          NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  variant_id        UUID          NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
  quantity_ordered  INTEGER       NOT NULL CHECK (quantity_ordered > 0),
  quantity_received INTEGER       NOT NULL DEFAULT 0,
  unit_cost         DECIMAL(12,2) NOT NULL CHECK (unit_cost >= 0),
  total_cost        DECIMAL(12,2) GENERATED ALWAYS AS (quantity_ordered * unit_cost) STORED
);

COMMENT ON TABLE public.purchase_order_items IS 'Line items within a purchase order; total_cost is auto-computed.';

-- -------------------------
-- 11. marketplaces  (lookup / reference table)
-- -------------------------
CREATE TABLE IF NOT EXISTS public.marketplaces (
  id        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT    NOT NULL UNIQUE,
  slug      TEXT    NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

COMMENT ON TABLE public.marketplaces IS 'Reference table of supported Indian e-commerce marketplaces.';

-- -------------------------
-- 12. orders
-- -------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID          NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  marketplace_id    UUID          REFERENCES public.marketplaces(id) ON DELETE SET NULL,
  order_id          TEXT          NOT NULL,  -- marketplace-assigned order ID
  order_date        TIMESTAMPTZ,
  status            TEXT,
  total_amount      DECIMAL(12,2),
  settlement_amount DECIMAL(12,2),
  marketplace_fee   DECIMAL(12,2),
  gst_amount        DECIMAL(12,2),
  shipping_amount   DECIMAL(12,2),
  customer_name     TEXT,
  sku               TEXT,
  raw_data          JSONB,
  import_batch_id   UUID,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE (org_id, marketplace_id, order_id)
);

COMMENT ON TABLE public.orders IS 'Orders imported from marketplace reports; raw_data holds original CSV/JSON row.';

-- -------------------------
-- 13. settlements
-- -------------------------
CREATE TABLE IF NOT EXISTS public.settlements (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID          NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  marketplace_id   UUID          REFERENCES public.marketplaces(id) ON DELETE SET NULL,
  settlement_id    TEXT,
  settlement_date  TIMESTAMPTZ,
  amount           DECIMAL(12,2),
  status           TEXT          NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'matched', 'unmatched', 'disputed')),
  order_id         UUID          REFERENCES public.orders(id) ON DELETE SET NULL,
  raw_data         JSONB,
  import_batch_id  UUID,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.settlements IS 'Settlement / remittance records imported from marketplace payment reports.';

-- -------------------------
-- 14. reconciliation_reports
-- -------------------------
CREATE TABLE IF NOT EXISTS public.reconciliation_reports (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id             UUID          NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  marketplace_id     UUID          REFERENCES public.marketplaces(id) ON DELETE SET NULL,
  report_type        TEXT          NOT NULL
                       CHECK (report_type IN ('orders', 'settlements', 'returns', 'refunds')),
  date_from          DATE          NOT NULL,
  date_to            DATE          NOT NULL,
  total_orders       INTEGER       NOT NULL DEFAULT 0,
  matched_orders     INTEGER       NOT NULL DEFAULT 0,
  unmatched_orders   INTEGER       NOT NULL DEFAULT 0,
  total_revenue      DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_fees         DECIMAL(12,2) NOT NULL DEFAULT 0,
  discrepancy_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status             TEXT          NOT NULL DEFAULT 'processing'
                       CHECK (status IN ('processing', 'completed', 'failed')),
  summary            JSONB,
  created_by         UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.reconciliation_reports IS 'Aggregated reconciliation results comparing orders vs settlements.';

-- -------------------------
-- 15. subscriptions
-- -------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                       UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                   UUID          NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan                     TEXT          NOT NULL DEFAULT 'free'
                             CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  status                   TEXT          NOT NULL DEFAULT 'active'
                             CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  started_at               TIMESTAMPTZ   NOT NULL DEFAULT now(),
  expires_at               TIMESTAMPTZ,
  razorpay_subscription_id TEXT,
  razorpay_plan_id         TEXT,
  amount_monthly           DECIMAL(10,2),
  sku_limit                INTEGER       NOT NULL DEFAULT 100,
  marketplace_count        INTEGER       NOT NULL DEFAULT 2,
  created_at               TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.subscriptions IS 'Subscription plan and billing metadata per organization.';

-- -------------------------
-- 16. tool_usage_logs
-- -------------------------
CREATE TABLE IF NOT EXISTS public.tool_usage_logs (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,  -- NULL = anonymous
  ip_address            INET,
  tool_name             TEXT        NOT NULL,
  tool_category         TEXT,
  file_size_bytes       BIGINT,
  processing_duration_ms INTEGER,
  status                TEXT        CHECK (status IN ('success', 'failed', 'timeout')),
  error_message         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tool_usage_logs IS 'Usage telemetry for free/freemium tools; user_id nullable for anonymous access.';

-- -------------------------
-- 17. uploaded_files
-- -------------------------
CREATE TABLE IF NOT EXISTS public.uploaded_files (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,  -- NULL = anonymous
  storage_path TEXT        NOT NULL,
  bucket       TEXT        NOT NULL,
  file_name    TEXT,
  file_size    BIGINT,
  mime_type    TEXT,
  expires_at   TIMESTAMPTZ,
  is_processed BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.uploaded_files IS 'Tracks files uploaded to Supabase Storage; auto-purged when expires_at passes.';

-- -------------------------
-- 18. activity_logs
-- -------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID        REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id       UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  action        TEXT        NOT NULL,
  resource_type TEXT,
  resource_id   UUID,
  metadata      JSONB,
  ip_address    INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.activity_logs IS 'Append-only audit trail of user and system actions scoped to an organization.';

-- =============================================================================
-- INDEXES
-- =============================================================================

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_org_id         ON public.profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email           ON public.profiles(email);

-- organizations
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id  ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug      ON public.organizations(slug);

-- org_members
CREATE INDEX IF NOT EXISTS idx_org_members_org_id      ON public.org_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id     ON public.org_members(user_id);

-- products
CREATE INDEX IF NOT EXISTS idx_products_org_id         ON public.products(org_id);
CREATE INDEX IF NOT EXISTS idx_products_created_by     ON public.products(created_by);
CREATE INDEX IF NOT EXISTS idx_products_created_at     ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category       ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active      ON public.products(is_active);

-- product_variants
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku        ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_barcode    ON public.product_variants(barcode);

-- warehouses
CREATE INDEX IF NOT EXISTS idx_warehouses_org_id       ON public.warehouses(org_id);

-- inventory
CREATE INDEX IF NOT EXISTS idx_inventory_org_id        ON public.inventory(org_id);
CREATE INDEX IF NOT EXISTS idx_inventory_variant_id    ON public.inventory(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_id  ON public.inventory(warehouse_id);

-- stock_movements
CREATE INDEX IF NOT EXISTS idx_stock_movements_org_id       ON public.stock_movements(org_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_variant_id   ON public.stock_movements(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse_id ON public.stock_movements(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at   ON public.stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference_id ON public.stock_movements(reference_id);

-- purchase_orders
CREATE INDEX IF NOT EXISTS idx_purchase_orders_org_id       ON public.purchase_orders(org_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_warehouse_id ON public.purchase_orders(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status       ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_at   ON public.purchase_orders(created_at DESC);

-- purchase_order_items
CREATE INDEX IF NOT EXISTS idx_po_items_po_id        ON public.purchase_order_items(po_id);
CREATE INDEX IF NOT EXISTS idx_po_items_variant_id   ON public.purchase_order_items(variant_id);

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_org_id          ON public.orders(org_id);
CREATE INDEX IF NOT EXISTS idx_orders_marketplace_id  ON public.orders(marketplace_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_id        ON public.orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_date      ON public.orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at      ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_import_batch_id ON public.orders(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_orders_status          ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_sku             ON public.orders(sku);

-- settlements
CREATE INDEX IF NOT EXISTS idx_settlements_org_id          ON public.settlements(org_id);
CREATE INDEX IF NOT EXISTS idx_settlements_marketplace_id  ON public.settlements(marketplace_id);
CREATE INDEX IF NOT EXISTS idx_settlements_order_id        ON public.settlements(order_id);
CREATE INDEX IF NOT EXISTS idx_settlements_settlement_date ON public.settlements(settlement_date DESC);
CREATE INDEX IF NOT EXISTS idx_settlements_created_at      ON public.settlements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_settlements_status          ON public.settlements(status);
CREATE INDEX IF NOT EXISTS idx_settlements_import_batch_id ON public.settlements(import_batch_id);

-- reconciliation_reports
CREATE INDEX IF NOT EXISTS idx_recon_reports_org_id        ON public.reconciliation_reports(org_id);
CREATE INDEX IF NOT EXISTS idx_recon_reports_marketplace_id ON public.reconciliation_reports(marketplace_id);
CREATE INDEX IF NOT EXISTS idx_recon_reports_created_at    ON public.reconciliation_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recon_reports_status        ON public.reconciliation_reports(status);

-- subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id    ON public.subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status    ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON public.subscriptions(expires_at);

-- tool_usage_logs
CREATE INDEX IF NOT EXISTS idx_tool_usage_logs_user_id    ON public.tool_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_logs_tool_name  ON public.tool_usage_logs(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_usage_logs_created_at ON public.tool_usage_logs(created_at DESC);

-- uploaded_files
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id    ON public.uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_expires_at ON public.uploaded_files(expires_at);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_created_at ON public.uploaded_files(created_at DESC);

-- activity_logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_org_id      ON public.activity_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id     ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at  ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_id ON public.activity_logs(resource_id);
