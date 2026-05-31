import { supabase } from '@/supabase/client'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
type OrgMember = Database['public']['Tables']['org_members']['Row']

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

// ─── List all members of an organisation ────────────────────────────────────
export async function getOrgMembers(
  orgId: string,
): Promise<(OrgMember & { profile: Pick<Profile, 'id' | 'full_name' | 'email' | 'avatar_url'> | null })[]> {
  const { data, error } = await supabase
    .from('org_members')
    .select('*, profile:profiles(id, full_name, email, avatar_url)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`getOrgMembers failed: ${error.message}`)
  return (data ?? []) as (OrgMember & {
    profile: Pick<Profile, 'id' | 'full_name' | 'email' | 'avatar_url'> | null
  })[]
}

// ─── Invite a new member (placeholder — real invite uses Edge Function / email) ──
export async function inviteMember(
  orgId: string,
  email: string,
  role: OrgRole,
): Promise<{ invited: boolean; message: string }> {
  // Look up existing profile by email
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (!profile) {
    // In a real flow, send an invite email via an Edge Function or third-party service
    return {
      invited: false,
      message: `No account found for ${email}. An invite email would be sent here.`,
    }
  }

  const { error } = await supabase.from('org_members').insert({
    org_id: orgId,
    user_id: profile.id,
    role,
    created_at: new Date().toISOString(),
  })

  if (error) throw new Error(`inviteMember failed: ${error.message}`)
  return { invited: true, message: `${email} added to organisation.` }
}

// ─── Change a member's role ──────────────────────────────────────────────────
export async function updateMemberRole(
  orgId: string,
  userId: string,
  role: OrgRole,
): Promise<OrgMember> {
  const { data, error } = await supabase
    .from('org_members')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) throw new Error(`updateMemberRole failed: ${error.message}`)
  return data
}

// ─── Remove a member from the org ───────────────────────────────────────────
export async function removeMember(orgId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('org_members')
    .delete()
    .eq('org_id', orgId)
    .eq('user_id', userId)

  if (error) throw new Error(`removeMember failed: ${error.message}`)
}
