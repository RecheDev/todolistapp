'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  systemTheme: 'dark' | 'light'
  actualTheme: 'dark' | 'light'
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  systemTheme: 'dark',
  actualTheme: 'dark',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'todoapp-theme',
  disableTransitionOnChange = true,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)

  const actualTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    setMounted(true)
    
    // Get saved theme or use system preference
    const savedTheme = localStorage.getItem(storageKey) as Theme | null
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    setSystemTheme(systemPrefersDark ? 'dark' : 'light')
    
    if (savedTheme) {
      setThemeState(savedTheme)
    } else {
      setThemeState('system')
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [storageKey])

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    
    // Disable transitions during theme change
    if (disableTransitionOnChange) {
      root.classList.add('theme-transition-disable')
      setTimeout(() => {
        root.classList.remove('theme-transition-disable')
      }, 1)
    }

    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    
    // Add new theme class
    if (actualTheme === 'dark') {
      root.classList.add('dark')
    }
    
    // Set attribute for CSS selectors
    root.setAttribute('data-theme', actualTheme)
    
    // Force a style recalculation for better browser compatibility
    root.style.display = 'none'
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    root.offsetHeight // Trigger reflow
    root.style.display = ''
  }, [actualTheme, disableTransitionOnChange, mounted])

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme)
    setThemeState(newTheme)
  }

  const value = {
    theme,
    systemTheme,
    actualTheme,
    setTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}