import { useAuth } from './useAuth'
import { useTodoQueryKey } from './useTodoData'
import { 
  useSimpleMutation,
  useOptimisticMutation,
  useUndoableMutation,
  useBulkMutation,
  type BaseMutationContext
} from './useMutationFactory'
import {
  createTodo,
  updateTodo,
  deleteTodoWithUndo,
  toggleTodo,
  createShoppingList,
  updateShoppingItem,
  reorderTodos,
  bulkAction,
  deleteCompletedTodos,
  undoDelete
} from '@/lib/api'
import { Todo, BulkAction } from '@/types/database'

// Type definitions for mutation variables
interface CreateTodoVariables {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  due_date?: string
}

interface UpdateTodoVariables {
  id: string
  updates: Partial<Pick<Todo, 'title' | 'description' | 'completed' | 'priority' | 'due_date' | 'order'>>
}

interface ToggleTodoVariables {
  id: string
  completed: boolean
}

interface CreateShoppingListVariables {
  title: string
  description?: string
  items: string[]
}

interface UpdateShoppingItemVariables {
  todoId: string
  itemId: string
  completed: boolean
}

interface BulkActionVariables {
  todoIds: string[]
  action: BulkAction
}

interface DeleteTodoContext extends BaseMutationContext {
  todoTitle?: string
}

interface ToggleTodoContext extends BaseMutationContext {
  todoTitle?: string
  completed: boolean
}

/**
 * Hook for todo CRUD mutations
 * Uses standardized mutation factory patterns
 */
export function useTodoMutations() {
  const { user } = useAuth()
  const queryKey = useTodoQueryKey()

  // Create todo mutation
  const createMutation = useSimpleMutation(
    ({ title, description, priority, due_date }: CreateTodoVariables) =>
      createTodo(user!.id, title, description, priority, due_date),
    queryKey,
    {
      errorMessage: 'Failed to create todo',
    }
  )

  // Update todo mutation with optimistic updates
  const updateMutation = useOptimisticMutation(
    ({ id, updates }: UpdateTodoVariables) => updateTodo(id, updates),
    queryKey,
    ({ id, updates }, previousTodos) =>
      previousTodos?.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo)) || [],
    {
      errorMessage: 'Failed to update todo',
    }
  )

  // Delete todo mutation with undo
  const deleteMutation = useUndoableMutation(
    (id: string) => deleteTodoWithUndo(id),
    queryKey,
    (id, previousTodos) => previousTodos?.filter((todo) => todo.id !== id) || [],
    () => undoDeleteMutation.mutate(undefined),
    {
      successMessage: (result) => `Deleted "${result.todo.title}"`,
      errorMessage: 'Failed to delete todo',
      additionalContext: (id, previousTodos) => ({
        previousTodos,
        todoTitle: previousTodos?.find(todo => todo.id === id)?.title,
      } as DeleteTodoContext),
    }
  )

  // Toggle todo mutation with optimistic updates and celebration
  const toggleMutation = useOptimisticMutation<Todo, ToggleTodoVariables, ToggleTodoContext>(
    ({ id, completed }) => toggleTodo(id, completed),
    queryKey,
    ({ id, completed }, previousTodos) =>
      previousTodos?.map((todo) => (todo.id === id ? { ...todo, completed } : todo)) || [],
    {
      successToast: (_, variables, context) => {
        if (context?.completed) {
          return `🎉 "${context?.todoTitle || 'Todo'}" completed!`
        } else {
          return `⏳ "${context?.todoTitle || 'Todo'}" marked as pending`
        }
      },
      errorMessage: 'Failed to update todo',
      additionalContext: ({ id, completed }, previousTodos) => ({
        previousTodos,
        todoTitle: previousTodos?.find(t => t.id === id)?.title,
        completed,
      } as ToggleTodoContext),
    }
  )

  // Shopping list creation
  const createShoppingListMutation = useSimpleMutation(
    ({ title, description, items }: CreateShoppingListVariables) =>
      createShoppingList({ title, description, shopping_items: items, user_id: user!.id }),
    queryKey,
    {
      errorMessage: 'Failed to create shopping list',
    }
  )

  // Shopping item update with optimistic updates
  const updateShoppingItemMutation = useOptimisticMutation(
    ({ todoId, itemId, completed }: UpdateShoppingItemVariables) =>
      updateShoppingItem({ todoId, itemId, completed }),
    queryKey,
    ({ todoId, itemId, completed }, previousTodos) =>
      previousTodos?.map((todo) => {
        if (todo.id === todoId && todo.shopping_items) {
          const updatedItems = todo.shopping_items.map(item =>
            item.id === itemId ? { ...item, completed } : item
          )
          const allCompleted = updatedItems.every(item => item.completed)
          return { ...todo, shopping_items: updatedItems, completed: allCompleted }
        }
        return todo
      }) || [],
    {
      successToast: () => 'Item updated',
      errorMessage: 'Failed to update item',
    }
  )

  // Reorder todos with optimistic updates
  const reorderMutation = useOptimisticMutation(
    (todoIds: string[]) => reorderTodos(user!.id, todoIds),
    queryKey,
    (todoIds, previousTodos) => {
      if (!previousTodos) return []
      const reordered = todoIds.map((id, index) => {
        const todo = previousTodos.find(t => t.id === id)
        return todo ? { ...todo, order: index } : null
      }).filter(Boolean) as Todo[]
      const notReordered = previousTodos.filter(t => !todoIds.includes(t.id))
      return [...reordered, ...notReordered]
    },
    {
      errorMessage: 'Failed to reorder todos',
    }
  )

  // Bulk actions
  const bulkActionMutation = useBulkMutation(
    ({ ids, action }: { ids: string[]; action: BulkAction }) => bulkAction(user!.id, ids, action),
    queryKey,
    ({ ids, action }, previousTodos) => {
      if (!previousTodos) return []
      switch (action) {
        case 'delete':
          return previousTodos.filter(t => !ids.includes(t.id))
        case 'complete':
          return previousTodos.map(t => ids.includes(t.id) ? { ...t, completed: true } : t)
        case 'incomplete':
          return previousTodos.map(t => ids.includes(t.id) ? { ...t, completed: false } : t)
        default:
          return previousTodos
      }
    },
    {
      successMessage: ({ ids, action }) => {
        const actionText = action === 'delete' ? 'deleted' : action === 'complete' ? 'completed' : 'marked as incomplete'
        return `${ids.length} todos ${actionText}`
      },
      errorMessage: 'Bulk action failed',
    }
  )

  // Delete completed todos
  const deleteCompletedMutation = useOptimisticMutation(
    () => deleteCompletedTodos(user!.id),
    queryKey,
    (_, previousTodos) => previousTodos?.filter(t => !t.completed) || [],
    {
      successToast: (_, __, context) => {
        const completedCount = context?.previousTodos?.filter(t => t.completed).length || 0
        return `${completedCount} completed todos deleted`
      },
      errorMessage: 'Failed to delete completed todos',
    }
  )

  // Undo delete mutation
  const undoDeleteMutation = useSimpleMutation(
    () => undoDelete(),
    queryKey,
    {
      successMessage: 'Todo restored',
      errorMessage: 'Nothing to undo or undo expired',
    }
  )

  return {
    // Mutation functions
    createTodo: createMutation.mutate,
    updateTodo: updateMutation.mutate,
    deleteTodo: deleteMutation.mutate,
    toggleTodo: toggleMutation.mutate,
    createShoppingList: createShoppingListMutation.mutate,
    updateShoppingItem: updateShoppingItemMutation.mutate,
    reorderTodos: reorderMutation.mutate,
    // Wrapper for bulkAction to match expected interface
    bulkAction: (data: { todoIds: string[]; action: BulkAction }) => 
      bulkActionMutation.mutate({ ids: data.todoIds, action: data.action }),
    // Wrapper for deleteCompleted to match expected interface
    deleteCompleted: () => deleteCompletedMutation.mutate(undefined),
    // Wrapper for undoDelete to match expected interface
    undoDelete: () => undoDeleteMutation.mutate(undefined),

    // Loading states
    isCreating: createMutation.isPending || createShoppingListMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleMutation.isPending || updateShoppingItemMutation.isPending,
    isReordering: reorderMutation.isPending,
    isBulkAction: bulkActionMutation.isPending || deleteCompletedMutation.isPending,

    // Async functions for external control
    createTodoAsync: createMutation.mutateAsync,
    updateTodoAsync: updateMutation.mutateAsync,
    deleteTodoAsync: deleteMutation.mutateAsync,
    toggleTodoAsync: toggleMutation.mutateAsync,
  }
}

/**
 * Specialized hook for shopping list mutations
 */
export function useShoppingListMutations() {
  const todoMutations = useTodoMutations()
  
  return {
    createShoppingList: todoMutations.createShoppingList,
    updateShoppingItem: todoMutations.updateShoppingItem,
    isCreating: todoMutations.isCreating,
    isUpdating: todoMutations.isUpdating,
  }
}

/**
 * Specialized hook for bulk operations
 */
export function useTodoBulkOperations() {
  const todoMutations = useTodoMutations()
  
  return {
    bulkAction: todoMutations.bulkAction,
    deleteCompleted: todoMutations.deleteCompleted,
    reorderTodos: todoMutations.reorderTodos,
    isBulkAction: todoMutations.isBulkAction,
    isReordering: todoMutations.isReordering,
  }
}