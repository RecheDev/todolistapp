'use client'

import { useTheme } from '@/components/providers/ThemeProvider'
import { useEffect, useState } from 'react'

export function ThemeDebug() {
  const { theme, actualTheme, systemTheme } = useTheme()
  const [htmlClasses, setHtmlClasses] = useState('')
  const [dataTheme, setDataTheme] = useState('')
  const [cssVars, setCssVars] = useState<Record<string, string>>({})
  const [localStorage, setLocalStorage] = useState('')

  useEffect(() => {
    const updateDebugInfo = () => {
      const html = document.documentElement
      setHtmlClasses(html.className || 'none')
      setDataTheme(html.getAttribute('data-theme') || 'none')
      
      // Get computed CSS variables
      const computedStyles = getComputedStyle(html)
      const vars = {
        'background': computedStyles.getPropertyValue('--color-background').trim(),
        'foreground': computedStyles.getPropertyValue('--color-foreground').trim(),
        'card': computedStyles.getPropertyValue('--color-card').trim(),
        'primary': computedStyles.getPropertyValue('--color-primary').trim(),
      }
      setCssVars(vars)
      
      // Check localStorage
      const saved = window.localStorage.getItem('todoapp-theme') || 'null'
      setLocalStorage(saved)
    }

    updateDebugInfo()
    
    // Watch for changes
    const observer = new MutationObserver(updateDebugInfo)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    })

    return () => observer.disconnect()
  }, [])

  const testDarkMode = () => {
    const html = document.documentElement
    html.classList.add('dark')
    html.setAttribute('data-theme', 'dark')
    console.log('Manually applied dark mode')
  }

  const testLightMode = () => {
    const html = document.documentElement
    html.classList.remove('dark')
    html.setAttribute('data-theme', 'light')
    console.log('Manually applied light mode')
  }

  return (
    <div className="fixed bottom-4 right-4 p-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-xs space-y-1 font-mono max-w-sm text-black dark:text-white z-50">
      <div className="font-bold text-blue-600 dark:text-blue-400">🐛 Theme Debug</div>
      
      <div>Theme: <span className="text-green-600">{theme}</span></div>
      <div>Actual: <span className="text-green-600">{actualTheme}</span></div>
      <div>System: <span className="text-green-600">{systemTheme}</span></div>
      <div>localStorage: <span className="text-green-600">{localStorage}</span></div>
      
      <div className="text-purple-600 dark:text-purple-400">HTML State:</div>
      <div>Classes: <span className="text-orange-600">{htmlClasses}</span></div>
      <div>Data-theme: <span className="text-orange-600">{dataTheme}</span></div>
      
      <div className="text-purple-600 dark:text-purple-400">CSS Variables:</div>
      {Object.entries(cssVars).map(([key, value]) => (
        <div key={key}>--color-{key}: <span className="text-red-600">{value || 'MISSING'}</span></div>
      ))}
      
      <div className="text-purple-600 dark:text-purple-400">Visual Test:</div>
      <div className="p-2 bg-background text-foreground border">
        Background + Foreground Test
      </div>
      
      <div className="flex gap-1 mt-2">
        <button 
          onClick={testDarkMode}
          className="px-2 py-1 bg-black text-white text-xs rounded"
        >
          Force Dark
        </button>
        <button 
          onClick={testLightMode}
          className="px-2 py-1 bg-white text-black border text-xs rounded"
        >
          Force Light
        </button>
      </div>
    </div>
  )
}

