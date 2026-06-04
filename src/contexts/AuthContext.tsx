import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/supabase/client'
import type { User } from '@/types'

// ============================================================
// Context types
// ============================================================

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

// ============================================================
// Context
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================================
// Provider
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // ----------------------------------------------------------
  // Fetch the profile row that matches the Supabase auth user
  // ----------------------------------------------------------
  const fetchProfile = useCallback(async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('[AuthContext] fetchProfile error:', error.message)
      return null
    }

    return data as User
  }, [])

  // ----------------------------------------------------------
  // Boot: grab the current session and subscribe to changes
  // ----------------------------------------------------------
  useEffect(() => {
    let mounted = true

    // Initialise from persisted session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!mounted) return

      setSession(initialSession)
      setLoading(false) // unblock routing immediately

      if (initialSession?.user) {
        const profile = await fetchProfile(initialSession.user.id)
        if (mounted) setUser(profile)
      }
    })

    // Subscribe to future auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return

      setSession(currentSession)
      setLoading(false) // always unblock routing immediately

      if (currentSession?.user) {
        const profile = await fetchProfile(currentSession.user.id)
        if (mounted) setUser(profile)
      } else {
        setUser(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // ----------------------------------------------------------
  // Actions
  // ----------------------------------------------------------

  const signIn = useCallback(async (email: string, password: string, rememberMe = true) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    // Eagerly set session so ProtectedRoute sees it before navigate() fires
    if (data.session) setSession(data.session)
    // If not remembering, remove the persisted session from localStorage
    // so it clears when the browser tab/window is closed
    if (!rememberMe) {
      const key = `sb-${new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]}-auth-token`
      const raw = localStorage.getItem(key)
      if (raw) {
        sessionStorage.setItem(key, raw)
        localStorage.removeItem(key)
      }
    }
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })
      if (error) throw new Error(error.message)
    },
    [],
  )

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
    setUser(null)
    setSession(null)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw new Error(error.message)
  }, [])

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)

      if (error) throw new Error(error.message)

      // Refresh local state
      const fresh = await fetchProfile(user.id)
      if (fresh) setUser(fresh)
    },
    [user, fetchProfile],
  )

  // ----------------------------------------------------------
  // Value
  // ----------------------------------------------------------

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ============================================================
// Hook
// ============================================================

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}
