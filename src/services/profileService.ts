import { supabase } from '@/supabase/client'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer'

// ─── Fetch a profile by user ID ──────────────────────────────────────────────
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(`getProfile failed: ${error.message}`)
  return data
}

// ─── Update arbitrary profile fields ────────────────────────────────────────
export async function updateProfile(
  userId: string,
  updateData: Omit<ProfileUpdate, 'id' | 'created_at'>,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('*')
    .single()

  if (error) throw new Error(`updateProfile failed: ${error.message}`)
  return data
}
