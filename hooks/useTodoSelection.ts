import { useState, useCallback } from 'react'
import type { Todo } from '@/types/database'

export function useTodoSelection() {
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set())
  const [bulkSelectMode, setBulkSelectMode] = useState(false)

  const handleSelectTodo = useCallback((todoId: string, selected: boolean) => {
    setSelectedTodos(prev => {
      const newSelection = new Set(prev)
      if (selected) {
        newSelection.add(todoId)
      } else {
        newSelection.delete(todoId)
      }
      return newSelection
    })
  }, [])
  
  const handleSelectAll = useCallback((filteredTodos: Todo[]) => {
    if (selectedTodos.size === filteredTodos.length) {
      setSelectedTodos(new Set())
    } else {
      setSelectedTodos(new Set(filteredTodos.map(todo => todo.id)))
    }
  }, [selectedTodos.size])

  const clearSelection = useCallback(() => {
    setSelectedTodos(new Set())
    setBulkSelectMode(false)
  }, [])

  return {
    selectedTodos,
    bulkSelectMode,
    setBulkSelectMode,
    handleSelectTodo,
    handleSelectAll,
    clearSelection
  }
}