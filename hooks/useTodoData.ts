import { useQuery } from '@tanstack/react-query'
import { getTodos } from '@/lib/api'
import { useAuth } from './useAuth'
import { Todo } from '@/types/database'

/**
 * Hook for fetching todo data
 * Responsible only for data fetching and caching
 */
export function useTodoData() {
  const { user } = useAuth()

  const query = useQuery({
    queryKey: ['todos', user?.id],
    queryFn: () => getTodos(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })

  return {
    todos: query.data || [],
    loading: query.isLoading,
    error: query.error,
    isStale: query.isStale,
    isFetching: query.isFetching,
    refetch: query.refetch,
  }
}

/**
 * Hook for accessing todos query key
 * Useful for other hooks that need to reference the same query
 */
export function useTodoQueryKey() {
  const { user } = useAuth()
  return ['todos', user?.id] as const
}