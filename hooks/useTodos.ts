// Re-export the new focused hook architecture for backward compatibility
export { useTodos } from './useTodosNew'

// Also export specialized hooks for more focused usage
export { 
  useTodoData, 
  useTodoMutations, 
  useShoppingListMutations, 
  useTodoBulkOperations,
  useTodoQueryKey
} from './useTodosNew'