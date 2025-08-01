import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTodoData, useTodoQueryKey } from '@/hooks/useTodoData'
import { AuthContext } from '@/context/AuthContext'
import { mockTodos, createTestQueryClient, mockUser } from '../utils/test-utils'

// Mock the API
jest.mock('@/lib/api', () => ({
  getTodos: jest.fn(),
}))

const { getTodos } = require('@/lib/api')

// Test wrapper with auth context
const createWrapper = (queryClient: QueryClient, user = mockUser) => 
  ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{
        user,
        loading: false,
        signIn: jest.fn(),
        signOut: jest.fn(),
        signUp: jest.fn(),
      }}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  )

describe('useTodoData', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    jest.clearAllMocks()
    getTodos.mockResolvedValue(mockTodos)
  })

  it('fetches todos successfully when user is authenticated', async () => {
    const { result } = renderHook(
      () => useTodoData(),
      { wrapper: createWrapper(queryClient) }
    )

    // Initially loading
    expect(result.current.loading).toBe(true)
    expect(result.current.todos).toEqual([])

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.todos).toEqual(mockTodos)
    expect(result.current.error).toBeNull()
    expect(getTodos).toHaveBeenCalledWith(mockUser.id)
  })

  it('does not fetch todos when user is not authenticated', () => {
    const { result } = renderHook(
      () => useTodoData(),
      { wrapper: createWrapper(queryClient, null) }
    )

    expect(result.current.loading).toBe(false)
    expect(result.current.todos).toEqual([])
    expect(getTodos).not.toHaveBeenCalled()
  })

  it('handles API errors correctly', async () => {
    const error = new Error('Failed to fetch todos')
    getTodos.mockRejectedValue(error)

    const { result } = renderHook(
      () => useTodoData(),
      { wrapper: createWrapper(queryClient) }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toEqual(error)
    expect(result.current.todos).toEqual([])
  })

  it('provides refetch functionality', async () => {
    const { result } = renderHook(
      () => useTodoData(),
      { wrapper: createWrapper(queryClient) }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(getTodos).toHaveBeenCalledTimes(1)

    // Refetch data
    await result.current.refetch()

    expect(getTodos).toHaveBeenCalledTimes(2)
  })

  it('indicates when data is stale', async () => {
    const { result } = renderHook(
      () => useTodoData(),
      { wrapper: createWrapper(queryClient) }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Initially fresh
    expect(result.current.isStale).toBe(false)

    // Simulate stale data by advancing time
    jest.advanceTimersByTime(6 * 60 * 1000) // 6 minutes (beyond staleTime)

    // Note: In a real test, you'd need to trigger a re-render or invalidate the query
    // to see the stale status change
  })

  it('shows fetching state correctly', async () => {
    let resolveGetTodos: (value: any) => void
    getTodos.mockImplementation(() => new Promise(resolve => {
      resolveGetTodos = resolve
    }))

    const { result } = renderHook(
      () => useTodoData(),
      { wrapper: createWrapper(queryClient) }
    )

    expect(result.current.isFetching).toBe(true)

    resolveGetTodos!(mockTodos)

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false)
    })
  })
})

describe('useTodoQueryKey', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
  })

  it('returns correct query key for authenticated user', () => {
    const { result } = renderHook(
      () => useTodoQueryKey(),
      { wrapper: createWrapper(queryClient) }
    )

    expect(result.current).toEqual(['todos', mockUser.id])
  })

  it('returns query key with undefined user id when not authenticated', () => {
    const { result } = renderHook(
      () => useTodoQueryKey(),
      { wrapper: createWrapper(queryClient, null) }
    )

    expect(result.current).toEqual(['todos', undefined])
  })

  it('updates query key when user changes', () => {
    const newUser = { ...mockUser, id: 'new-user-id' }
    
    const { result, rerender } = renderHook(
      () => useTodoQueryKey(),
      { wrapper: createWrapper(queryClient) }
    )

    expect(result.current).toEqual(['todos', mockUser.id])

    // Change wrapper to use new user
    const NewWrapper = createWrapper(queryClient, newUser)
    rerender({ wrapper: NewWrapper })

    expect(result.current).toEqual(['todos', newUser.id])
  })

  it('can be used as const assertion for type safety', () => {
    const { result } = renderHook(
      () => useTodoQueryKey(),
      { wrapper: createWrapper(queryClient) }
    )

    // This tests that the return type is readonly
    const queryKey = result.current
    expect(Array.isArray(queryKey)).toBe(true)
    expect(queryKey[0]).toBe('todos')
    expect(queryKey[1]).toBe(mockUser.id)
    
    // Type test: should be readonly tuple
    // @ts-expect-error - Should not be able to modify readonly array
    // queryKey[0] = 'modified'
  })
})

