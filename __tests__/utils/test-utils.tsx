import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthContext } from '@/context/AuthContext'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Todo, User } from '@/types/database'

// Mock user for testing
export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// Mock todos for testing
export const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Test Todo 1',
    description: 'Test description 1',
    completed: false,
    priority: 'medium',
    due_date: '2024-12-31',
    user_id: 'test-user-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order: 0,
  },
  {
    id: '2',
    title: 'Test Todo 2',
    description: 'Test description 2',
    completed: true,
    priority: 'high',
    due_date: null,
    user_id: 'test-user-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order: 1,
  },
]

// Mock auth context values
interface MockAuthContextValue {
  user?: User | null
  loading?: boolean
  signIn?: jest.Mock
  signOut?: jest.Mock
  signUp?: jest.Mock
}

const createMockAuthValue = (overrides: MockAuthContextValue = {}) => ({
  user: overrides.user !== undefined ? overrides.user : mockUser,
  loading: overrides.loading || false,
  signIn: overrides.signIn || jest.fn().mockResolvedValue(undefined),
  signOut: overrides.signOut || jest.fn(),
  signUp: overrides.signUp || jest.fn().mockResolvedValue(undefined),
})

// Test wrapper component
interface WrapperProps {
  children: React.ReactNode
  authValue?: MockAuthContextValue
  queryClient?: QueryClient
}

function TestWrapper({ children, authValue = {}, queryClient }: WrapperProps) {
  const client = queryClient || new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  const mockAuthContextValue = createMockAuthValue(authValue)

  return (
    <QueryClientProvider client={client}>
      <AuthContext.Provider value={mockAuthContextValue}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  )
}

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: MockAuthContextValue
  queryClient?: QueryClient
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { authValue, queryClient, ...renderOptions } = options

  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper authValue={authValue} queryClient={queryClient}>
        {children}
      </TestWrapper>
    ),
    ...renderOptions,
  })
}

// Mock API functions
export const mockApi = {
  getTodos: jest.fn().mockResolvedValue(mockTodos),
  createTodo: jest.fn().mockImplementation((userId, title, description, priority, due_date) => 
    Promise.resolve({
      id: Date.now().toString(),
      title,
      description,
      completed: false,
      priority: priority || 'medium',
      due_date,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order: mockTodos.length,
    })
  ),
  updateTodo: jest.fn().mockImplementation((id, updates) => 
    Promise.resolve({ ...mockTodos.find(t => t.id === id), ...updates })
  ),
  deleteTodo: jest.fn().mockResolvedValue(undefined),
  toggleTodo: jest.fn().mockImplementation((id, completed) => 
    Promise.resolve({ ...mockTodos.find(t => t.id === id), completed })
  ),
}

// Helper to create a fresh QueryClient for each test
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
  logger: {
    log: console.log,
    warn: console.warn,
    error: () => {}, // Suppress error logs in tests
  },
})

// Helper to wait for async operations
export const waitForAsyncOperations = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock toast
export const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
}

// Mock next/navigation
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
}

// Re-export everything from RTL
export * from '@testing-library/react'
export { customRender as render }
export { userEvent }

// This is a utility file, not a test file, so we include a simple test to avoid Jest warnings
describe('test-utils', () => {
  it('should export testing utilities', () => {
    expect(typeof render).toBe('function')
    expect(typeof userEvent).toBe('object')
  })
})