/**
 * Edge Function: cleanup-files
 *
 * Deletes storage objects and database rows for uploaded files that have
 * passed their expiry date AND have already been processed.
 *
 * Intended to run on a scheduled basis (e.g. daily via pg_cron or an
 * external cron job that calls this endpoint with the service-role key).
 *
 * Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UploadedFile {
  id: string;
  storage_path: string;
  bucket: string;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

serve(async (req: Request): Promise<Response> => {
  // ------------------------------------------------------------------
  // Auth guard — only the service role (or a trusted cron caller) may
  // trigger this cleanup.  The caller must pass the service-role key as
  // a Bearer token in the Authorization header.
  // ------------------------------------------------------------------
  const authHeader = req.headers.get("Authorization");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!serviceRoleKey || authHeader !== `Bearer ${serviceRoleKey}`) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  // ------------------------------------------------------------------
  // Supabase admin client (bypasses RLS)
  // ------------------------------------------------------------------
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    serviceRoleKey,
  );

  // ------------------------------------------------------------------
  // Fetch expired & processed file records
  // ------------------------------------------------------------------
  const { data: expiredFiles, error: fetchError } = await supabase
    .from("uploaded_files")
    .select("id, storage_path, bucket")
    .lt("expires_at", new Date().toISOString())
    .eq("is_processed", true);

  if (fetchError) {
    console.error("Failed to fetch expired files:", fetchError.message);
    return new Response(
      JSON.stringify({ error: fetchError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const files = (expiredFiles ?? []) as UploadedFile[];

  // ------------------------------------------------------------------
  // Delete each file from storage, then remove the DB record
  // ------------------------------------------------------------------
  let deleted = 0;
  const errors: string[] = [];

  for (const file of files) {
    // Remove object from the storage bucket
    const { error: storageError } = await supabase.storage
      .from(file.bucket)
      .remove([file.storage_path]);

    if (storageError) {
      console.error(
        `Storage removal failed for ${file.storage_path}:`,
        storageError.message,
      );
      errors.push(`storage:${file.id}:${storageError.message}`);
      continue; // skip DB deletion if storage removal failed
    }

    // Remove the DB record
    const { error: dbError } = await supabase
      .from("uploaded_files")
      .delete()
      .eq("id", file.id);

    if (dbError) {
      console.error(
        `DB deletion failed for uploaded_file ${file.id}:`,
        dbError.message,
      );
      errors.push(`db:${file.id}:${dbError.message}`);
      continue;
    }

    deleted++;
  }

  // ------------------------------------------------------------------
  // Response
  // ------------------------------------------------------------------
  const responseBody = {
    deleted,
    total: files.length,
    errors: errors.length > 0 ? errors : undefined,
  };

  console.log("cleanup-files result:", responseBody);

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
