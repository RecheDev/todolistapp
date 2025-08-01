import { useMemo } from 'react'
import type { Todo } from '@/types/database'

export function useTodoStats(todos: Todo[]) {
  const stats = useMemo(() => {
    const completed = todos.filter((t) => t.completed).length
    return {
      total: todos.length,
      completed,
      pending: todos.length - completed,
    }
  }, [todos])

  return stats
}

