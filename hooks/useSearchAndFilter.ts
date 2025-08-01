import { useState, useMemo } from 'react'
import { useDebounce } from './useDebounce'
import type { Todo } from '@/types/database'

type FilterType = 'all' | 'pending' | 'completed'

export function useSearchAndFilter(todos: Todo[]) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  
  const debouncedSearchQuery = useDebounce(searchQuery, 150)

  const filteredTodos = useMemo(() => {
    return todos
      .filter((todo) => {
        if (filter === 'completed') return todo.completed
        if (filter === 'pending') return !todo.completed
        return true
      })
      .filter((todo) => {
        const query = debouncedSearchQuery.toLowerCase()
        if (!query) return true
        return todo.title.toLowerCase().includes(query) ||
               (todo.description?.toLowerCase().includes(query) ?? false)
      })
  }, [todos, filter, debouncedSearchQuery])

  return {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    filteredTodos,
    debouncedSearchQuery
  }
}

