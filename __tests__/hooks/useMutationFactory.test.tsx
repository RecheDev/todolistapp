import React from 'react'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { 
  useMutationFactory, 
  useSimpleMutation, 
  useOptimisticMutation,
  useUndoableMutation,
  useBulkMutation
} from '@/hooks/useMutationFactory'
import { Todo } from '@/types/database'
import { mockTodos, createTestQueryClient } from '../utils/test-utils'

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const { toast } = require('sonner')

// Test wrapper
const createWrapper = (queryClient: QueryClient) => 
  ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

describe('useMutationFactory', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    jest.clearAllMocks()
  })

  it('executes basic mutation successfully', async () => {
    const mutationFn = jest.fn().mockResolvedValue({ id: '1', title: 'New Todo' })
    const queryKey = ['todos', 'user-1']

    const { result } = renderHook(
      () => useMutationFactory({
        mutationFn,
        queryKey,
        showSuccessToast: 'Operation completed successfully',
      }),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      result.current.mutate({ title: 'New Todo' })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mutationFn).toHaveBeenCalledWith({ title: 'New Todo' })
    expect(toast.success).toHaveBeenCalledWith('Operation completed successfully')
  })

  it('handles mutation errors correctly', async () => {
    const error = new Error('Mutation failed')
    const mutationFn = jest.fn().mockRejectedValue(error)
    const queryKey = ['todos', 'user-1']
    const onError = jest.fn()

    const { result } = renderHook(
      () => useMutationFactory({
        mutationFn,
        queryKey,
        showErrorToast: 'Custom error message',
        onError,
      }),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      result.current.mutate({ title: 'New Todo' })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(toast.error).toHaveBeenCalledWith('Custom error message')
    expect(onError).toHaveBeenCalledWith(error, { title: 'New Todo' }, expect.any(Object))
  })

  it('performs optimistic updates correctly', async () => {
    const mutationFn = jest.fn().mockResolvedValue({ id: '1', title: 'Updated Todo' })
    const queryKey = ['todos', 'user-1']

    // Set initial data
    queryClient.setQueryData(queryKey, mockTodos)

    const { result } = renderHook(
      () => useMutationFactory({
        mutationFn,
        queryKey,
        rollbackOnError: true,
        onMutate: async (variables) => {
          // Cancel outgoing refetches
          await queryClient.cancelQueries({ queryKey })
          
          // Get previous data
          const previousTodos = queryClient.getQueryData<Todo[]>(queryKey) || []
          
          // Optimistically update
          const updatedTodos = previousTodos.map(todo => 
            todo.id === variables.id ? { ...todo, ...variables.updates } : todo
          )
          
          queryClient.setQueryData(queryKey, updatedTodos)
          
          return { updatedTodos }
        },
      }),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      result.current.mutate({ id: '1', updates: { title: 'Optimistically Updated' } })
    })

    // Check that optimistic update was applied immediately
    const optimisticData = queryClient.getQueryData<Todo[]>(queryKey)
    expect(optimisticData?.[0].title).toBe('Optimistically Updated')

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('handles rollback on error', async () => {
    const error = new Error('Update failed')
    const mutationFn = jest.fn().mockRejectedValue(error)
    const queryKey = ['todos', 'user-1']

    // Set initial data
    queryClient.setQueryData(queryKey, mockTodos)

    const { result } = renderHook(
      () => useMutationFactory({
        mutationFn,
        queryKey,
        rollbackOnError: true,
        onMutate: async (variables) => {
          await queryClient.cancelQueries({ queryKey })
          const previousTodos = queryClient.getQueryData<Todo[]>(queryKey) || []
          
          const updatedTodos = previousTodos.map(todo => 
            todo.id === variables.id ? { ...todo, ...variables.updates } : todo
          )
          
          queryClient.setQueryData(queryKey, updatedTodos)
          return { previousTodos }
        },
        onError: (err, variables, context) => {
          // Rollback on error
          if (context?.previousTodos) {
            queryClient.setQueryData(queryKey, context.previousTodos)
          }
        }
      }),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      result.current.mutate({ id: '1', updates: { title: 'Failed Update' } })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    // Should handle the error properly
    expect(result.current.error).toBeTruthy()
  })
})

describe('useSimpleMutation', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    jest.clearAllMocks()
  })

  it('creates a simple mutation without optimistic updates', async () => {
    const mutationFn = jest.fn().mockResolvedValue({ success: true })
    const queryKey = ['todos', 'user-1']

    const { result } = renderHook(
      () => useSimpleMutation(mutationFn, queryKey, {
        successMessage: 'Operation completed',
        errorMessage: 'Operation failed',
      }),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      result.current.mutate({ data: 'test' })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mutationFn).toHaveBeenCalledWith({ data: 'test' })
    expect(toast.success).toHaveBeenCalledWith('Operation completed')
  })
})

describe('useOptimisticMutation', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    jest.clearAllMocks()
  })

  it('applies optimistic updates immediately', async () => {
    const mutationFn = jest.fn().mockResolvedValue({ id: '1', completed: true })
    const queryKey = ['todos', 'user-1']

    queryClient.setQueryData(queryKey, mockTodos)

    const { result } = renderHook(
      () => useOptimisticMutation(
        mutationFn,
        queryKey,
        ({ id, completed }, previousTodos) => {
          return previousTodos?.map(todo => 
            todo.id === id ? { ...todo, completed } : todo
          ) || []
        },
        {
          successToast: (_, variables) => `Todo ${variables.completed ? 'completed' : 'uncompleted'}`,
        }
      ),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      result.current.mutate({ id: '1', completed: true })
    })

    // Check immediate optimistic update
    const optimisticData = queryClient.getQueryData<Todo[]>(queryKey)
    expect(optimisticData?.find(t => t.id === '1')?.completed).toBe(true)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(toast.success).toHaveBeenCalledWith('Todo completed')
  })
})

describe('useUndoableMutation', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    jest.clearAllMocks()
  })

  it('shows undo action in success toast', async () => {
    const mutationFn = jest.fn().mockResolvedValue({ todo: { title: 'Deleted Todo' } })
    const undoAction = jest.fn()
    const queryKey = ['todos', 'user-1']

    queryClient.setQueryData(queryKey, mockTodos)

    const { result } = renderHook(
      () => useUndoableMutation(
        mutationFn,
        queryKey,
        (id, previousTodos) => previousTodos?.filter(todo => todo.id !== id) || [],
        undoAction,
        {
          successMessage: (data) => `Deleted "${data.todo.title}"`,
          undoLabel: 'Undo Delete',
          undoDuration: 5000,
        }
      ),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      result.current.mutate('1')
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(toast.success).toHaveBeenCalledWith(
      'Deleted "Deleted Todo"',
      expect.objectContaining({
        action: expect.objectContaining({
          label: 'Undo Delete',
          onClick: undoAction,
        }),
        duration: 5000,
      })
    )
  })
})

describe('useBulkMutation', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    jest.clearAllMocks()
  })

  it('handles bulk operations correctly', async () => {
    const mutationFn = jest.fn().mockResolvedValue({ updated: 2 })
    const queryKey = ['todos', 'user-1']

    queryClient.setQueryData(queryKey, mockTodos)

    const { result } = renderHook(
      () => useBulkMutation(
        mutationFn,
        queryKey,
        ({ ids, action }, previousTodos) => {
          if (action === 'complete') {
            return previousTodos?.map(todo =>
              ids.includes(todo.id) ? { ...todo, completed: true } : todo
            ) || []
          }
          return previousTodos || []
        },
        {
          successMessage: ({ ids, action }) => `${ids.length} todos ${action}d`,
        }
      ),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      result.current.mutate({ ids: ['1', '2'], action: 'complete' })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mutationFn).toHaveBeenCalledWith({ ids: ['1', '2'], action: 'complete' })
    expect(toast.success).toHaveBeenCalledWith('2 todos completed')
  })
})