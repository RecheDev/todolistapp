import { useEffect, RefObject } from 'react'

type FilterType = 'all' | 'pending' | 'completed'

interface UseDashboardKeyboardProps {
  searchInputRef: RefObject<HTMLInputElement | null>
  setFilter: (filter: FilterType) => void
}

export function useDashboardKeyboard({ searchInputRef, setFilter }: UseDashboardKeyboardProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      
      // Filter shortcuts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        switch (e.key) {
          case 'A':
            e.preventDefault()
            setFilter('all')
            break
          case 'P':
            e.preventDefault()
            setFilter('pending')
            break
          case 'C':
            e.preventDefault()
            setFilter('completed')
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchInputRef, setFilter])
}

