import { supabase } from '@/supabase/client'
import type { StorageBucket } from '@/supabase/storage'

export type ToolCategory =
  | 'sku'
  | 'pdf'
  | 'image'
  | 'video'
  | 'label'
  | 'gst'
  | 'reconciliation'
  | 'inventory'
  | 'other'

export type UsageStatus = 'success' | 'error' | 'pending'

export interface UploadedFileRecord {
  id: string
  bucket: string
  storage_path: string
  file_name: string
  file_size: number
  mime_type: string
  user_id: string | null
  is_processed: boolean
  expires_at: string | null
  created_at: string
}

// ─── Log a tool usage event ──────────────────────────────────────────────────
export async function logToolUsage(
  toolName: string,
  category: ToolCategory,
  fileSizeBytes?: number,
  durationMs?: number,
  status: UsageStatus = 'success',
  error?: string,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()

  const { error: insertErr } = await supabase.from('tool_usage_logs').insert({
    tool_name: toolName,
    category,
    file_size_bytes: fileSizeBytes ?? null,
    duration_ms: durationMs ?? null,
    status,
    error_message: error ?? null,
    user_id: user?.id ?? null,
    created_at: new Date().toISOString(),
  })

  if (insertErr) {
    // Non-fatal — log to console but don't throw, so tool flows aren't broken
    console.error('logToolUsage failed:', insertErr.message)
  }
}

// ─── Record an uploaded file in the DB with optional TTL ────────────────────
export async function trackFileUpload(
  bucket: StorageBucket,
  storagePath: string,
  fileName: string,
  fileSize: number,
  mimeType: string,
  userId?: string,
  ttlMinutes: number = 60,
): Promise<UploadedFileRecord> {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('uploaded_files')
    .insert({
      bucket,
      storage_path: storagePath,
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType,
      user_id: userId ?? null,
      is_processed: false,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (error) throw new Error(`trackFileUpload failed: ${error.message}`)
  return data as UploadedFileRecord
}

// ─── Mark a file record as processed ────────────────────────────────────────
export async function markFileProcessed(fileId: string): Promise<void> {
  const { error } = await supabase
    .from('uploaded_files')
    .update({ is_processed: true })
    .eq('id', fileId)

  if (error) throw new Error(`markFileProcessed failed: ${error.message}`)
}

// ─── Return the processing API base URL from environment ────────────────────
export function getProcessingApiUrl(): string {
  const url = import.meta.env.VITE_PROCESSING_API_URL as string | undefined
  if (!url) throw new Error('VITE_PROCESSING_API_URL is not set in environment')
  return url.replace(/\/$/, '') // strip trailing slash
}

// ─── Call the processing API with optional upload-progress tracking ──────────
export async function callProcessingApi<T = unknown>(
  endpoint: string,
  formData: FormData,
  onProgress?: (percent: number) => void,
): Promise<T> {
  const baseUrl = getProcessingApiUrl()
  const url = `${baseUrl}/${endpoint.replace(/^\//, '')}`

  // Use XMLHttpRequest when progress tracking is needed
  if (onProgress) {
    return new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url)

      // Attach auth token if available
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.access_token) {
          xhr.setRequestHeader('Authorization', `Bearer ${data.session.access_token}`)
        }

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100))
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText) as T)
            } catch {
              resolve(xhr.responseText as unknown as T)
            }
          } else {
            let message = `HTTP ${xhr.status}`
            try {
              const body = JSON.parse(xhr.responseText) as { message?: string; error?: string }
              message = body.message ?? body.error ?? message
            } catch { /* ignore */ }
            reject(new Error(`callProcessingApi [${endpoint}] failed: ${message}`))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error(`callProcessingApi [${endpoint}] network error`))
        })

        xhr.send(formData)
      }).catch(reject)
    })
  }

  // Fetch path — no progress needed
  const { data: sessionData } = await supabase.auth.getSession()
  const headers: HeadersInit = {}
  if (sessionData.session?.access_token) {
    headers['Authorization'] = `Bearer ${sessionData.session.access_token}`
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const body = (await response.json()) as { message?: string; error?: string }
      message = body.message ?? body.error ?? message
    } catch { /* ignore */ }
    throw new Error(`callProcessingApi [${endpoint}] failed: ${message}`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return (await response.json()) as T
  }
  return (await response.blob()) as unknown as T
}
