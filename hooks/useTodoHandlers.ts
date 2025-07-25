import { useCallback } from 'react'
import { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { Todo } from '@/types/database'

interface UseTodoHandlersProps {
  createTodo: (data: { title: string; description?: string; priority?: 'low' | 'medium' | 'high'; due_date?: string }) => void
  updateTodo: (data: { id: string; updates: { title: string; description?: string } }) => void
  deleteTodo: (id: string) => void
  toggleTodo: (data: { id: string; completed: boolean }) => void
  reorderTodos: (todoIds: string[]) => void
  bulkAction: (data: { todoIds: string[]; action: 'complete' | 'incomplete' | 'delete' }) => void
  deleteCompleted: () => void
  signOut: () => Promise<void>
  filteredTodos: Todo[]
  allTodos: Todo[]
}

export function useTodoHandlers({
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  reorderTodos,
  bulkAction,
  deleteCompleted,
  signOut,
  filteredTodos,
  allTodos
}: UseTodoHandlersProps) {
  
  const handleLogout = useCallback(async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [signOut])

  const handleCreateTodo = useCallback((title: string, description?: string, priority?: 'low' | 'medium' | 'high', due_date?: string) => {
    createTodo({ title, description, priority, due_date })
  }, [createTodo])

  const handleToggleTodo = useCallback((id: string, completed: boolean) => {
    toggleTodo({ id, completed })
  }, [toggleTodo])

  const handleUpdateTodo = useCallback((id: string, updates: { title: string; description?: string }) => {
    updateTodo({ id, updates })
  }, [updateTodo])

  const handleDeleteTodo = useCallback((id: string) => {
    deleteTodo(id)
  }, [deleteTodo])
  
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      return
    }
    
    const oldIndex = filteredTodos.findIndex(todo => todo.id === active.id)
    const newIndex = filteredTodos.findIndex(todo => todo.id === over.id)
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedTodos = arrayMove(filteredTodos, oldIndex, newIndex)
      const todoIds = reorderedTodos.map(todo => todo.id)
      reorderTodos(todoIds)
    }
  }, [filteredTodos, reorderTodos])

  const handleBulkComplete = useCallback((selectedTodos: Set<string>, clearSelection: () => void) => {
    if (selectedTodos.size > 0) {
      bulkAction({ todoIds: Array.from(selectedTodos), action: 'complete' })
      clearSelection()
    }
  }, [bulkAction])
  
  const handleBulkIncomplete = useCallback((selectedTodos: Set<string>, clearSelection: () => void) => {
    if (selectedTodos.size > 0) {
      bulkAction({ todoIds: Array.from(selectedTodos), action: 'incomplete' })
      clearSelection()
    }
  }, [bulkAction])
  
  const handleBulkDelete = useCallback((selectedTodos: Set<string>, clearSelection: () => void) => {
    if (selectedTodos.size > 0 && window.confirm(`Delete ${selectedTodos.size} selected todos?`)) {
      bulkAction({ todoIds: Array.from(selectedTodos), action: 'delete' })
      clearSelection()
    }
  }, [bulkAction])
  
  const handleDeleteCompleted = useCallback(() => {
    const completedCount = allTodos.filter(t => t.completed).length
    if (completedCount > 0 && window.confirm(`Delete all ${completedCount} completed todos?`)) {
      deleteCompleted()
    }
  }, [allTodos, deleteCompleted])

  return {
    handleLogout,
    handleCreateTodo,
    handleToggleTodo,
    handleUpdateTodo,
    handleDeleteTodo,
    handleDragEnd,
    handleBulkComplete,
    handleBulkIncomplete,
    handleBulkDelete,
    handleDeleteCompleted
  }
}