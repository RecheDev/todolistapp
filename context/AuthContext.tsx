'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { safeLocalStorage } from '@/lib/storage'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isSigningOut: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Predefined demo user
const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'demo@todoapp.com',
  name: 'Demo User'
}

// Demo credentials
const DEMO_CREDENTIALS = {
  email: 'demo@todoapp.com',
  password: 'demo123'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    // Simulate initial load and check for saved session
    const checkSession = () => {
      const savedUser = safeLocalStorage.getItem<User>('demo-user')
      if (savedUser) {
        setUser(savedUser)
      }
      setLoading(false)
    }

    // Add small delay to simulate network check in demo
    const timer = setTimeout(checkSession, 100)
    return () => clearTimeout(timer)
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Verify demo credentials
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      setUser(DEMO_USER)
      safeLocalStorage.setItem('demo-user', DEMO_USER)
      setLoading(false)
    } else {
      setLoading(false)
      throw new Error('Invalid credentials. Use: demo@todoapp.com / demo123')
    }
  }

  const signUp = async (email: string, password: string) => {
    // For sign up, simply direct the user to use the demo credentials
    throw new Error('For this demo, use the credentials: demo@todoapp.com / demo123')
  }

  const signOut = async () => {
    setIsSigningOut(true)
    
    // Simulate network delay for sign out
    await new Promise(resolve => setTimeout(resolve, 150))
    
    setUser(null)
    safeLocalStorage.removeItem('demo-user')
    // Also clear any todo data
    safeLocalStorage.removeItem('demo-todos')
    
    setIsSigningOut(false)
  }

  const value = {
    user,
    loading,
    isSigningOut,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}