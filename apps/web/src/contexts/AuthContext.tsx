'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { initSupabase, getCurrentUser, onAuthStateChange } from '@timetwin/api-sdk'
import type { User } from '@timetwin/api-sdk'

interface AuthContextType {
  user: User | null
  loading: boolean
  initialized: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  initialized: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '[SET]' : '[MISSING]')
      setLoading(false)
      setInitialized(true)
      return
    }

    initSupabase(supabaseUrl, supabaseAnonKey)
    setInitialized(true)

    // Check current session
    getCurrentUser()
      .then(({ user: currentUser }) => {
        setUser(currentUser)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error getting current user:', error)
        setUser(null)
        setLoading(false)
      })

    // Listen for auth changes
    const { unsubscribe } = onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, initialized }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
