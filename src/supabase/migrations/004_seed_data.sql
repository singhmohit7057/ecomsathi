-- =============================================================================
-- EcomSathi SaaS — Seed Data
-- Migration: 004_seed_data.sql
-- =============================================================================
-- Contains only reference / lookup data that must exist before any user signs up.
-- Does NOT contain any user-specific, org-specific, or PII data.
-- =============================================================================

-- =============================================================================
-- 1. Marketplaces
-- Canonical list of supported Indian e-commerce marketplaces.
-- =============================================================================
INSERT INTO public.marketplaces (name, slug, is_active)
VALUES
  ('Amazon',    'amazon',    true),
  ('Flipkart',  'flipkart',  true),
  ('Myntra',    'myntra',    true),
  ('Meesho',    'meesho',    true),
  ('AJIO',      'ajio',      true),
  ('Nykaa',     'nykaa',     true),
  ('Snapdeal',  'snapdeal',  true)
ON CONFLICT (slug) DO UPDATE
  SET
    name      = EXCLUDED.name,
    is_active = EXCLUDED.is_active;

-- =============================================================================
-- 2. Subscription Plan Reference Data
-- Stores the canonical plan definitions as a reference / config table.
-- Because the subscriptions table is per-org (not a plan catalogue), we
-- capture plan metadata in a separate reference table.
-- =============================================================================

-- Create the plan catalogue table if it does not exist yet.
-- (This is a lightweight config table, not user-facing data.)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  plan              TEXT          PRIMARY KEY,   -- 'free' | 'starter' | 'pro' | 'enterprise'
  display_name      TEXT          NOT NULL,
  description       TEXT,
  amount_monthly    DECIMAL(10,2) NOT NULL DEFAULT 0,
  sku_limit         INTEGER       NOT NULL DEFAULT 100,
  marketplace_count INTEGER       NOT NULL DEFAULT 2,
  user_limit        INTEGER       NOT NULL DEFAULT 1,
  features          JSONB         NOT NULL DEFAULT '[]'::JSONB,
  is_active         BOOLEAN       NOT NULL DEFAULT true,
  sort_order        INTEGER       NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.subscription_plans IS 'Reference catalogue of available subscription plans and their feature limits.';

-- Enable RLS on the plan catalogue — public read, service_role write
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscription_plans_select_all"
  ON public.subscription_plans FOR SELECT
  USING (true);

-- Seed the plan catalogue
INSERT INTO public.subscription_plans
  (plan, display_name, description, amount_monthly, sku_limit, marketplace_count, user_limit, features, sort_order)
VALUES
  (
    'free',
    'Free',
    'Get started for free. No credit card required.',
    0.00,
    100,
    2,
    1,
    '["Up to 100 SKUs", "2 marketplaces", "Basic inventory tracking", "Order import (CSV)", "Community support"]'::JSONB,
    1
  ),
  (
    'starter',
    'Starter',
    'For small sellers scaling up their operations.',
    999.00,
    1000,
    4,
    3,
    '["Up to 1,000 SKUs", "4 marketplaces", "Inventory management", "Settlement reconciliation", "Purchase orders", "Email support"]'::JSONB,
    2
  ),
  (
    'pro',
    'Pro',
    'For growing businesses that need full reconciliation and team access.',
    2999.00,
    10000,
    7,
    10,
    '["Up to 10,000 SKUs", "All 7 marketplaces", "Advanced reconciliation", "Bulk CSV import", "Team members (up to 10)", "Warehouse management", "Priority support"]'::JSONB,
    3
  ),
  (
    'enterprise',
    'Enterprise',
    'Unlimited scale with dedicated support and custom integrations.',
    9999.00,
    2147483647,   -- effectively unlimited (MAX INT)
    7,
    2147483647,   -- effectively unlimited
    '["Unlimited SKUs", "All 7 marketplaces", "Custom API integrations", "Dedicated account manager", "SLA guarantee", "On-boarding & training", "Custom reporting"]'::JSONB,
    4
  )
ON CONFLICT (plan) DO UPDATE
  SET
    display_name      = EXCLUDED.display_name,
    description       = EXCLUDED.description,
    amount_monthly    = EXCLUDED.amount_monthly,
    sku_limit         = EXCLUDED.sku_limit,
    marketplace_count = EXCLUDED.marketplace_count,
    user_limit        = EXCLUDED.user_limit,
    features          = EXCLUDED.features,
    sort_order        = EXCLUDED.sort_order;
