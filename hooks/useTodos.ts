import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { getTodos, createTodo, updateTodo, deleteTodo, toggleTodo } from '@/lib/api'
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
      toast.success(`"${newTodo.title}" created successfully!`)
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
      toast.success('Todo updated successfully!')
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
      toast.success(`"${context?.todoTitle || 'Todo'}" deleted successfully!`)
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
      const status = context?.completed ? 'completed' : 'marked as pending'
      toast.success(`"${context?.todoTitle || 'Todo'}" ${status}!`)
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

  return {
    todos: query.data || [],
    loading: query.isLoading,
    error: query.error,
    createTodo: createMutation.mutate,
    updateTodo: updateMutation.mutate,
    deleteTodo: deleteMutation.mutate,
    toggleTodo: toggleMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleMutation.isPending,
  }
}