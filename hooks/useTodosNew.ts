import { useTodoData } from './useTodoData'
import { useTodoMutations } from './useTodoMutations'

/**
 * Main todos hook that combines data fetching and mutations
 * This is a simplified interface that maintains backward compatibility
 * while using the new focused hook architecture
 */
export function useTodos() {
  const todoData = useTodoData()
  const todoMutations = useTodoMutations()

  return {
    // Data
    ...todoData,
    
    // Mutations
    ...todoMutations,
  }
}

// Re-export specialized hooks for direct use
export { useTodoData } from './useTodoData'
export { useTodoMutations, useShoppingListMutations, useTodoBulkOperations } from './useTodoMutations'
export { useTodoQueryKey } from './useTodoData'