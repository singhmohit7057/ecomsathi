/**
 * Edge Function: send-low-stock-alert
 *
 * Queries inventory items whose quantity is at or below their per-item
 * low_stock_threshold, then sends an alert email to the org owner.
 *
 * Body (JSON): { "orgId": "<uuid>" }
 *
 * Email delivery is handled by an external provider (Resend / SendGrid).
 * Replace the `sendEmail` stub below with your provider's SDK call.
 *
 * Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
 *   (or call from a trusted internal cron / database trigger)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LowStockRow {
  quantity: number;
  low_stock_threshold: number;
  variant: { sku: string; name: string } | null;
  warehouse: { name: string } | null;
}

interface OrgRow {
  name: string;
  profiles: { email: string; full_name: string } | null;
}

// ---------------------------------------------------------------------------
// Email stub — replace with Resend / SendGrid / etc.
// ---------------------------------------------------------------------------

async function sendEmail(opts: {
  to: string;
  ownerName: string;
  orgName: string;
  items: LowStockRow[];
}): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    // Fallback: log only (useful during local dev)
    console.log(
      `[EMAIL STUB] Would send low-stock alert to ${opts.to} (${opts.ownerName}) ` +
        `for org "${opts.orgName}" — ${opts.items.length} item(s) below threshold.`,
    );
    return;
  }

  const itemLines = opts.items
    .map(
      (i) =>
        `• ${i.variant?.name ?? "Unknown"} (SKU: ${i.variant?.sku ?? "—"}) ` +
        `| Warehouse: ${i.warehouse?.name ?? "—"} ` +
        `| Qty: ${i.quantity} / Threshold: ${i.low_stock_threshold}`,
    )
    .join("\n");

  const body = `Hi ${opts.ownerName},\n\nThe following items in your organisation "${opts.orgName}" are running low on stock:\n\n${itemLines}\n\nPlease restock at your earliest convenience.\n\n— EcomSathi`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "alerts@ecomsathi.com",
      to: opts.to,
      subject: `[EcomSathi] Low stock alert — ${opts.items.length} item(s) need attention`,
      text: body,
    }),
  });
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

serve(async (req: Request): Promise<Response> => {
  // ------------------------------------------------------------------
  // Parse request body
  // ------------------------------------------------------------------
  let orgId: string | undefined;

  try {
    const body = await req.json();
    orgId = body?.orgId;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!orgId) {
    return new Response(
      JSON.stringify({ error: "orgId is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // ------------------------------------------------------------------
  // Supabase admin client
  // ------------------------------------------------------------------
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // ------------------------------------------------------------------
  // Fetch inventory rows where quantity <= low_stock_threshold
  // ------------------------------------------------------------------
  const { data: lowStockItems, error: invError } = await supabase
    .from("inventory")
    .select(
      `
      quantity,
      low_stock_threshold,
      variant:product_variants ( sku, name ),
      warehouse:warehouses ( name )
    `,
    )
    .eq("org_id", orgId)
    .lte("quantity", supabase.rpc("inventory_threshold"));  // uses DB-side helper

  if (invError) {
    console.error("inventory query failed:", invError.message);
    return new Response(
      JSON.stringify({ error: invError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const items = (lowStockItems ?? []) as LowStockRow[];

  if (items.length === 0) {
    return new Response(
      JSON.stringify({ sent: false, count: 0, reason: "No low-stock items" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  // ------------------------------------------------------------------
  // Fetch organisation owner details
  // ------------------------------------------------------------------
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("name, profiles!organizations_owner_id_fkey ( email, full_name )")
    .eq("id", orgId)
    .single<OrgRow>();

  if (orgError || !org) {
    console.error("org query failed:", orgError?.message);
    return new Response(
      JSON.stringify({ error: orgError?.message ?? "Org not found" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!org.profiles?.email) {
    return new Response(
      JSON.stringify({ error: "Org owner has no email on record" }),
      { status: 422, headers: { "Content-Type": "application/json" } },
    );
  }

  // ------------------------------------------------------------------
  // Send the alert email
  // ------------------------------------------------------------------
  await sendEmail({
    to: org.profiles.email,
    ownerName: org.profiles.full_name ?? org.profiles.email,
    orgName: org.name,
    items,
  });

  const responseBody = { sent: true, count: items.length };
  console.log("send-low-stock-alert result:", responseBody);

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
