import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { getTodos, createTodo, updateTodo, deleteTodo, toggleTodo, createShoppingList, updateShoppingItem, reorderTodos, bulkAction, deleteCompletedTodos, deleteTodoWithUndo, undoDelete } from '@/lib/api'
import { Todo, BulkAction } from '@/types/database'
import { toast } from 'sonner'

export function useTodos() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['todos', user?.id],
    queryFn: () => getTodos(user!.id),
    enabled: !!user?.id,
  })

  const createMutation = useMutation({
    mutationFn: ({ title, description, priority, due_date }: { title: string; description?: string; priority?: 'low' | 'medium' | 'high'; due_date?: string }) =>
      createTodo(user!.id, title, description, priority, due_date),
    onSuccess: (newTodo) => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] })
      // Toast already handled in AddTodo component for better UX
    },
    onError: (error) => {
      toast.error('Failed to create todo: ' + (error instanceof Error ? error.message : 'Unknown error'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pick<Todo, 'title' | 'description' | 'completed' | 'priority' | 'due_date' | 'order'>> }) =>
      updateTodo(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['todos', user?.id] })
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', user?.id])
      
      queryClient.setQueryData<Todo[]>(['todos', user?.id], (old) =>
        old?.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo)) || []
      )

      return { previousTodos }
    },
    onSuccess: () => {
      // Toast already handled in TodoItem component for better UX
    },
    onError: (error, _, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', user?.id], context.previousTodos)
      }
      toast.error('Failed to update todo: ' + (error instanceof Error ? error.message : 'Unknown error'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTodoWithUndo,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos', user?.id] })
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', user?.id])
      const todoToDelete = previousTodos?.find(todo => todo.id === id)
      
      queryClient.setQueryData<Todo[]>(['todos', user?.id], (old) =>
        old?.filter((todo) => todo.id !== id) || []
      )

      return { previousTodos, todoTitle: todoToDelete?.title }
    },
    onSuccess: (result, id, context) => {
      toast.success(`Deleted "${result.todo.title}"`, {
        action: {
          label: "Undo",
          onClick: () => undoDeleteMutation.mutate()
        },
        duration: 5000
      })
    },
    onError: (error, _, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', user?.id], context.previousTodos)
      }
      toast.error('Failed to delete todo: ' + (error instanceof Error ? error.message : 'Unknown error'))
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      toggleTodo(id, completed),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['todos', user?.id] })
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', user?.id])
      const todo = previousTodos?.find(t => t.id === id)
      
      queryClient.setQueryData<Todo[]>(['todos', user?.id], (old) =>
        old?.map((todo) => (todo.id === id ? { ...todo, completed } : todo)) || []
      )

      return { previousTodos, todoTitle: todo?.title, completed }
    },
    onSuccess: (_, __, context) => {
      // Provide feedback with celebration for completed tasks
      if (context?.completed) {
        toast.success(`🎉 "${context.todoTitle}" completed!`, { 
          duration: 3000,
          style: { fontSize: '16px' }
        })
      } else {
        toast.success(`⏳ "${context.todoTitle}" marked as pending`, { 
          duration: 2000 
        })
      }
    },
    onError: (error, _, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', user?.id], context.previousTodos)
      }
      toast.error('Failed to update todo: ' + (error instanceof Error ? error.message : 'Unknown error'))
    },
  })

  const createShoppingListMutation = useMutation({
    mutationFn: ({ title, description, items }: { title: string; description?: string; items: string[] }) =>
      createShoppingList({ title, description, shopping_items: items, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] })
    },
    onError: (error) => {
      toast.error('Failed to create shopping list: ' + (error instanceof Error ? error.message : 'Unknown error'))
    },
  })

  const updateShoppingItemMutation = useMutation({
    mutationFn: ({ todoId, itemId, completed }: { todoId: string; itemId: string; completed: boolean }) =>
      updateShoppingItem({ todoId, itemId, completed }),
    onMutate: async ({ todoId, itemId, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['todos', user?.id] })
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', user?.id])
      
      queryClient.setQueryData<Todo[]>(['todos', user?.id], (old) => 
        old?.map((todo) => {
          if (todo.id === todoId && todo.shopping_items) {
            const updatedItems = todo.shopping_items.map(item =>
              item.id === itemId ? { ...item, completed } : item
            )
            const allCompleted = updatedItems.every(item => item.completed)
            return { ...todo, shopping_items: updatedItems, completed: allCompleted }
          }
          return todo
        }) || []
      )

      return { previousTodos }
    },
    onSuccess: () => {
      toast.success('Item updated', { duration: 1000 })
    },
    onError: (error, _, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', user?.id], context.previousTodos)
      }
      toast.error('Failed to update item: ' + (error instanceof Error ? error.message : 'Unknown error'))
    },
  })

  // New high-impact features mutations
  const reorderMutation = useMutation({
    mutationFn: (todoIds: string[]) => reorderTodos(user!.id, todoIds),
    onMutate: async (todoIds) => {
      await queryClient.cancelQueries({ queryKey: ['todos', user?.id] })
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', user?.id])
      
      // Optimistically update order
      queryClient.setQueryData<Todo[]>(['todos', user?.id], (old) => {
        if (!old) return []
        const reordered = todoIds.map((id, index) => {
          const todo = old.find(t => t.id === id)
          return todo ? { ...todo, order: index } : null
        }).filter(Boolean) as Todo[]
        const notReordered = old.filter(t => !todoIds.includes(t.id))
        return [...reordered, ...notReordered]
      })

      return { previousTodos }
    },
    onError: (error, _, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', user?.id], context.previousTodos)
      }
      toast.error('Failed to reorder todos')
    },
  })

  const bulkActionMutation = useMutation({
    mutationFn: ({ todoIds, action }: { todoIds: string[]; action: BulkAction }) =>
      bulkAction(user!.id, todoIds, action),
    onMutate: async ({ todoIds, action }) => {
      await queryClient.cancelQueries({ queryKey: ['todos', user?.id] })
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', user?.id])
      
      queryClient.setQueryData<Todo[]>(['todos', user?.id], (old) => {
        if (!old) return []
        switch (action) {
          case 'delete':
            return old.filter(t => !todoIds.includes(t.id))
          case 'complete':
            return old.map(t => todoIds.includes(t.id) ? { ...t, completed: true } : t)
          case 'incomplete':
            return old.map(t => todoIds.includes(t.id) ? { ...t, completed: false } : t)
          default:
            return old
        }
      })

      return { previousTodos }
    },
    onSuccess: (_, { todoIds, action }) => {
      const actionText = action === 'delete' ? 'deleted' : action === 'complete' ? 'completed' : 'marked as incomplete'
      toast.success(`${todoIds.length} todos ${actionText}`)
    },
    onError: (error, _, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', user?.id], context.previousTodos)
      }
      toast.error('Bulk action failed')
    },
  })

  const deleteCompletedMutation = useMutation({
    mutationFn: () => deleteCompletedTodos(user!.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['todos', user?.id] })
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', user?.id])
      const completedCount = previousTodos?.filter(t => t.completed).length || 0
      
      queryClient.setQueryData<Todo[]>(['todos', user?.id], (old) =>
        old?.filter(t => !t.completed) || []
      )

      return { previousTodos, completedCount }
    },
    onSuccess: (_, __, context) => {
      toast.success(`${context?.completedCount || 0} completed todos deleted`)
    },
    onError: (error, _, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', user?.id], context.previousTodos)
      }
      toast.error('Failed to delete completed todos')
    },
  })

  const undoDeleteMutation = useMutation({
    mutationFn: undoDelete,
    onSuccess: (restoredTodos) => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] })
      const count = restoredTodos.length
      toast.success(`${count} todo${count === 1 ? '' : 's'} restored`)
    },
    onError: () => {
      toast.error('Nothing to undo or undo expired')
    },
  })

  return {
    todos: query.data || [],
    loading: query.isLoading,
    error: query.error,
    createTodo: createMutation.mutate,
    createShoppingList: createShoppingListMutation.mutate,
    updateTodo: updateMutation.mutate,
    deleteTodo: deleteMutation.mutate,
    toggleTodo: toggleMutation.mutate,
    toggleShoppingItem: updateShoppingItemMutation.mutate,
    // New high-impact features
    reorderTodos: reorderMutation.mutate,
    bulkAction: bulkActionMutation.mutate,
    deleteCompleted: deleteCompletedMutation.mutate,
    undoDelete: undoDeleteMutation.mutate,
    // Loading states
    isCreating: createMutation.isPending || createShoppingListMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleMutation.isPending || updateShoppingItemMutation.isPending,
    isReordering: reorderMutation.isPending,
    isBulkAction: bulkActionMutation.isPending || deleteCompletedMutation.isPending,
  }
}