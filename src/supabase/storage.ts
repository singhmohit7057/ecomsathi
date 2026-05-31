import { supabase } from './client'

export type StorageBucket = 'uploads' | 'pdf' | 'images' | 'videos' | 'labels' | 'exports'

// ─── Upload a file and return its public URL ────────────────────────────────
export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File | Blob,
): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  })
  if (error) throw new Error(`uploadFile failed [${bucket}/${path}]: ${error.message}`)

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// ─── Download a file and return an object URL ───────────────────────────────
export async function downloadFile(bucket: StorageBucket, path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).download(path)
  if (error) throw new Error(`downloadFile failed [${bucket}/${path}]: ${error.message}`)
  if (!data) throw new Error(`downloadFile: no data returned for [${bucket}/${path}]`)
  return URL.createObjectURL(data)
}

// ─── Delete a single file ───────────────────────────────────────────────────
export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw new Error(`deleteFile failed [${bucket}/${path}]: ${error.message}`)
}

// ─── Get a time-limited signed URL ─────────────────────────────────────────
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  if (error) throw new Error(`getSignedUrl failed [${bucket}/${path}]: ${error.message}`)
  if (!data?.signedUrl) throw new Error(`getSignedUrl: no URL returned for [${bucket}/${path}]`)
  return data.signedUrl
}

// ─── Upload with auto-generated unique path ─────────────────────────────────
export async function uploadAndGetUrl(
  bucket: StorageBucket,
  file: File,
  userId?: string,
): Promise<{ url: string; path: string }> {
  const timestamp = Date.now()
  const ext = file.name.split('.').pop() ?? 'bin'
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const folder = userId ? `${userId}` : 'anonymous'
  const path = `${folder}/${timestamp}_${safeName}.${ext}`

  const url = await uploadFile(bucket, path, file)
  return { url, path }
}

// ─── Delete expired / temporary files ──────────────────────────────────────
// Queries uploaded_files for expired rows and removes them from storage.
// Call this after file processing is complete.
export async function deleteExpiredFiles(): Promise<void> {
  const now = new Date().toISOString()

  const { data: expiredFiles, error: fetchError } = await supabase
    .from('uploaded_files')
    .select('id, bucket, storage_path')
    .lt('expires_at', now)
    .eq('is_processed', false)

  if (fetchError) {
    console.error('deleteExpiredFiles: fetch error', fetchError.message)
    return
  }

  if (!expiredFiles || expiredFiles.length === 0) return

  // Group by bucket to batch removals
  const byBucket = expiredFiles.reduce<Record<string, { id: string; path: string }[]>>(
    (acc, row) => {
      const bucket = row.bucket as string
      if (!acc[bucket]) acc[bucket] = []
      acc[bucket].push({ id: row.id as string, path: row.storage_path as string })
      return acc
    },
    {},
  )

  for (const [bucket, files] of Object.entries(byBucket)) {
    const paths = files.map((f) => f.path)
    const { error: removeError } = await supabase.storage
      .from(bucket as StorageBucket)
      .remove(paths)
    if (removeError) {
      console.error(`deleteExpiredFiles: storage remove error [${bucket}]`, removeError.message)
    }
  }

  // Remove records from DB regardless of storage result to keep DB clean
  const ids = expiredFiles.map((f) => f.id as string)
  const { error: deleteError } = await supabase.from('uploaded_files').delete().in('id', ids)
  if (deleteError) {
    console.error('deleteExpiredFiles: db delete error', deleteError.message)
  }
}
