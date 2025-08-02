import React from 'react'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTodoData, useTodoQueryKey } from '@/hooks/useTodoData'
import { AuthContext } from '@/context/AuthContext'
import { mockTodos, createTestQueryClient, mockUser } from '../utils/test-utils'
import type { Todo, User } from '@/types/database'

// Mock the API
jest.mock('@/lib/api', () => ({
  getTodos: jest.fn(),
}))

const { getTodos } = require('@/lib/api')

// Test wrapper with auth context
const createWrapper = (queryClient: QueryClient, user?: User | null) => 
  ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{
        user: user === undefined ? null : user,
        loading: false,
        isSigningOut: false,
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
      { wrapper: createWrapper(queryClient, mockUser) }
    )

    // Wait for the data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.todos).toEqual(mockTodos)
    expect(getTodos).toHaveBeenCalledWith(mockUser.id)
  })

  it('handles unauthenticated state', async () => {
    // Create a completely fresh mock just for this test
    getTodos.mockReset()
    getTodos.mockResolvedValue([])
    
    const { result } = renderHook(
      () => useTodoData(),
      { wrapper: createWrapper(queryClient, null) }
    )

    // Wait for query to settle since disabled queries still have initial loading state
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Should return empty todos when not authenticated
    expect(result.current.todos).toEqual([])
    
    // Query should not be enabled, so getTodos should never be called
    expect(getTodos).not.toHaveBeenCalled()
  })

  it('handles API errors correctly', async () => {
    const error = new Error('Failed to fetch todos')
    getTodos.mockRejectedValue(error)

    const { result } = renderHook(
      () => useTodoData(),
      { wrapper: createWrapper(queryClient, mockUser) }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.todos).toEqual([])
  })

  it('provides refetch functionality', async () => {
    const { result } = renderHook(
      () => useTodoData(),
      { wrapper: createWrapper(queryClient, mockUser) }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await waitFor(() => {
      expect(getTodos).toHaveBeenCalledTimes(1)
    })

    // Refetch data
    await act(async () => {
      await result.current.refetch()
    })

    await waitFor(() => {
      expect(getTodos).toHaveBeenCalledTimes(2)
    })
  })

  it('handles stale data correctly', async () => {
    const { result } = renderHook(
      () => useTodoData(),
      { wrapper: createWrapper(queryClient, mockUser) }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Initially fresh
    expect(result.current.isStale).toBe(false)
  })

  it('shows fetching state correctly', async () => {
    let resolveGetTodos: (value: Todo[]) => void = () => {}
    getTodos.mockImplementation(() => new Promise(resolve => {
      resolveGetTodos = resolve
    }))

    const { result } = renderHook(
      () => useTodoData(),
      { wrapper: createWrapper(queryClient, mockUser) }
    )

    // Wait for fetching to start
    await waitFor(() => {
      expect(result.current.loading).toBe(true)
    })

    await act(async () => {
      resolveGetTodos(mockTodos)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
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
      { wrapper: createWrapper(queryClient, mockUser) }
    )

    expect(result.current).toEqual(['todos', mockUser.id])
  })

  it('returns query key for any user context', () => {
    const { result } = renderHook(
      () => useTodoQueryKey(),
      { wrapper: createWrapper(queryClient, null) }
    )

    // Should return a valid query key structure
    expect(Array.isArray(result.current)).toBe(true)
    expect(result.current[0]).toBe('todos')
  })

  it('updates query key when user changes', () => {
    const newUser = { ...mockUser, id: 'new-user-id' }
    
    // Test with initial user
    const { result: result1 } = renderHook(
      () => useTodoQueryKey(),
      { wrapper: createWrapper(queryClient, mockUser) }
    )
    expect(result1.current).toEqual(['todos', mockUser.id])

    // Test with new user in separate render
    const { result: result2 } = renderHook(
      () => useTodoQueryKey(),
      { wrapper: createWrapper(createTestQueryClient(), newUser) }
    )
    expect(result2.current).toEqual(['todos', newUser.id])
  })

  it('can be used as const assertion for type safety', () => {
    const { result } = renderHook(
      () => useTodoQueryKey(),
      { wrapper: createWrapper(queryClient, mockUser) }
    )

    // This should work without type errors
    const queryKey = result.current
    expect(Array.isArray(queryKey)).toBe(true)
    expect(queryKey[0]).toBe('todos')
  })
})