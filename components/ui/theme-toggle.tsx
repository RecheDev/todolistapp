'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/providers/ThemeProvider'

export function ThemeToggle() {
  const { actualTheme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1">
      {/* Light Mode Button */}
      <Button
        variant={actualTheme === 'light' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('light')}
        className="h-10 w-10 p-0 hover:bg-accent/50 transition-all duration-200"
        aria-label="Switch to light mode"
        aria-pressed={actualTheme === 'light'}
      >
        <Sun className={`h-5 w-5 transition-all duration-200 ${
          actualTheme === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
        }`} />
        <span className="sr-only">Light mode</span>
      </Button>

      {/* Dark Mode Button */}
      <Button
        variant={actualTheme === 'dark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('dark')}
        className="h-10 w-10 p-0 hover:bg-accent/50 transition-all duration-200"
        aria-label="Switch to dark mode"
        aria-pressed={actualTheme === 'dark'}
      >
        <Moon className={`h-5 w-5 transition-all duration-200 ${
          actualTheme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
        }`} />
        <span className="sr-only">Dark mode</span>
      </Button>
    </div>
  )
}

export function SimpleThemeToggle() {
  const { actualTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-10 w-10 p-0 hover:bg-accent/50 transition-all duration-200"
      aria-label={`Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative h-5 w-5">
        <Sun className={`absolute h-5 w-5 transition-all duration-200 ${
          actualTheme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
        }`} />
        <Moon className={`absolute h-5 w-5 transition-all duration-200 ${
          actualTheme === 'dark' ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`} />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}