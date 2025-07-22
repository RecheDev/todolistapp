import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { getTodos, createTodo, updateTodo, deleteTodo, toggleTodo, createShoppingList, updateShoppingItem } from '@/lib/api'
import { Todo } from '@/types/database'
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
    mutationFn: ({ title, description }: { title: string; description?: string }) =>
      createTodo(user!.id, title, description),
    onSuccess: (newTodo) => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] })
      // Toast already handled in AddTodo component for better UX
    },
    onError: (error) => {
      toast.error('Failed to create todo: ' + (error instanceof Error ? error.message : 'Unknown error'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pick<Todo, 'title' | 'description' | 'completed'>> }) =>
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos', user?.id] })
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', user?.id])
      const todoToDelete = previousTodos?.find(todo => todo.id === id)
      
      queryClient.setQueryData<Todo[]>(['todos', user?.id], (old) =>
        old?.filter((todo) => todo.id !== id) || []
      )

      return { previousTodos, todoTitle: todoToDelete?.title }
    },
    onSuccess: (_, __, context) => {
      // Toast already handled in TodoItem component for better UX
    },
    onError: (error, _, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', user?.id], context.previousTodos)
      }
      toast.error('Failed to delete todo: ' + (error instanceof Error ? error.message : 'Unknown error'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] })
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
        toast.success(`🎉 ¡"${context.todoTitle}" completada!`, { 
          duration: 3000,
          style: { fontSize: '16px' }
        })
      } else {
        toast.success(`⏳ "${context.todoTitle}" marcada como pendiente`, { 
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] })
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] })
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
    isCreating: createMutation.isPending || createShoppingListMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleMutation.isPending || updateShoppingItemMutation.isPending,
  }
}