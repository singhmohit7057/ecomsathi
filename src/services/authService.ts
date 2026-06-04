import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { supabase } from '@/supabase/client'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// ─── Sign up a new user and create their profile ────────────────────────────
export async function signUp(
  email: string,
  password: string,
  fullName: string,
): Promise<{ user: User | null; session: Session | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })
  if (error) throw new Error(`signUp failed: ${error.message}`)

  // If email confirmation is disabled, the user is already confirmed — create profile row.
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name: fullName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (profileError) {
      console.error('signUp: profile upsert failed', profileError.message)
    }
  }

  return { user: data.user, session: data.session }
}

// ─── Sign in with email + password ─────────────────────────────────────────
export async function signIn(
  email: string,
  password: string,
): Promise<{ user: User; session: Session }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`signIn failed: ${error.message}`)
  if (!data.user || !data.session) throw new Error('signIn: no user or session returned')
  return { user: data.user, session: data.session }
}

// ─── Sign out ───────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(`signOut failed: ${error.message}`)
}

// ─── Send a password reset email ────────────────────────────────────────────
export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw new Error(`resetPassword failed: ${error.message}`)
}

// ─── Update the authenticated user's password ───────────────────────────────
export async function updatePassword(newPassword: string): Promise<void> {
  // Ensure we have a live session before calling updateUser
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('updatePassword failed: No active session. Please sign in again.')
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(`updatePassword failed: ${error.message}`)
}

// ─── Return the current session (or null) ───────────────────────────────────
export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw new Error(`getSession failed: ${error.message}`)
  return data.session
}

// ─── Return the current user's full profile row ──────────────────────────────
export async function getUser(): Promise<Profile | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) throw new Error(`getUser: auth error — ${authError.message}`)
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw new Error(`getUser: profile fetch failed — ${error.message}`)
  return data
}

// ─── Update profile fields for the currently authenticated user ─────────────
export async function updateProfile(
  updateData: Omit<ProfileUpdate, 'id' | 'created_at'>,
): Promise<Profile> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) throw new Error(`updateProfile: auth error — ${authError.message}`)
  if (!user) throw new Error('updateProfile: no authenticated user')

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select('*')
    .single()

  if (error) throw new Error(`updateProfile failed: ${error.message}`)
  return data
}

// ─── Subscribe to auth state changes ────────────────────────────────────────
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): { unsubscribe: () => void } {
  const { data } = supabase.auth.onAuthStateChange(callback)
  return { unsubscribe: () => data.subscription.unsubscribe() }
}
