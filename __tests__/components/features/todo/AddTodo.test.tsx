import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddTodo } from '@/components/features/todo/AddTodo'

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('AddTodo', () => {
  let mockOnAdd: jest.Mock
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    mockOnAdd = jest.fn()
    user = userEvent.setup()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders collapsed state initially', () => {
    render(<AddTodo onAdd={mockOnAdd} />)
    
    expect(screen.getByRole('button', { name: /add new task/i })).toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/e\.g\., Call dentist/i)).not.toBeInTheDocument()
  })

  it('expands when add button is clicked', async () => {
    render(<AddTodo onAdd={mockOnAdd} />)
    
    await user.click(screen.getByRole('button', { name: /add new task/i }))
    
    expect(screen.getByPlaceholderText(/e\.g\., Call dentist/i)).toBeInTheDocument()
    expect(screen.getByText(/create new task/i)).toBeInTheDocument()
  })

  it('shows form fields when expanded', async () => {
    render(<AddTodo onAdd={mockOnAdd} />)
    
    await user.click(screen.getByRole('button', { name: /add new task/i }))
    
    expect(screen.getByPlaceholderText(/e\.g\., Call dentist/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/add more details/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument()
  })

  it('submits regular todo with valid data', async () => {
    render(<AddTodo onAdd={mockOnAdd} />)
    
    // Expand form
    await user.click(screen.getByRole('button', { name: /add new task/i }))
    
    // Fill in form
    const titleInput = screen.getByPlaceholderText(/e\.g\., Call dentist/i)
    await user.type(titleInput, 'Test Todo')
    
    const descriptionInput = screen.getByPlaceholderText(/add more details/i)
    await user.type(descriptionInput, 'Test Description')
    
    // Submit
    await user.click(screen.getByRole('button', { name: /create task/i }))
    
    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith('Test Todo', 'Test Description', 'medium', undefined)
    })
  })

  it('shows validation errors', async () => {
    render(<AddTodo onAdd={mockOnAdd} />)
    
    // Expand form
    await user.click(screen.getByRole('button', { name: /add new task/i }))
    
    // Try to submit without title
    await user.click(screen.getByRole('button', { name: /create task/i }))
    
    // Form should prevent submission and not call onAdd
    expect(mockOnAdd).not.toHaveBeenCalled()
  })

  it('handles keyboard shortcuts', async () => {
    render(<AddTodo onAdd={mockOnAdd} />)
    
    // Expand form
    await user.click(screen.getByRole('button', { name: /add new task/i }))
    
    // Fill in title
    const titleInput = screen.getByPlaceholderText(/e\.g\., Call dentist/i)
    await user.type(titleInput, 'Test Todo')
    
    // Submit with Ctrl+Enter
    await user.keyboard('{Control>}{Enter}{/Control}')
    
    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith('Test Todo', undefined, 'medium', undefined)
    })
  })

  it('handles escape key to cancel', async () => {
    render(<AddTodo onAdd={mockOnAdd} />)
    
    // Expand form
    await user.click(screen.getByRole('button', { name: /add new task/i }))
    
    // Fill in some data
    const titleInput = screen.getByPlaceholderText(/e\.g\., Call dentist/i)
    await user.type(titleInput, 'Test Todo')
    
    // Press escape
    await user.keyboard('{Escape}')
    
    // Form should collapse and data should be cleared
    expect(screen.getByRole('button', { name: /add new task/i })).toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/e\.g\., Call dentist/i)).not.toBeInTheDocument()
  })

  it('resets form after successful submission', async () => {
    render(<AddTodo onAdd={mockOnAdd} />)
    
    // Expand and fill form
    await user.click(screen.getByRole('button', { name: /add new task/i }))
    
    const titleInput = screen.getByPlaceholderText(/e\.g\., Call dentist/i)
    await user.type(titleInput, 'Test Todo')
    
    // Submit
    await user.click(screen.getByRole('button', { name: /create task/i }))
    
    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalled()
    })
    
    // Wait for form to reset and collapse
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add new task/i })).toBeInTheDocument()
    })
    
    expect(screen.queryByPlaceholderText(/e\.g\., Call dentist/i)).not.toBeInTheDocument()
  })

  it('shows loading state during submission', async () => {
    render(<AddTodo onAdd={mockOnAdd} isCreating={true} />)
    
    // Expand form
    await user.click(screen.getByRole('button', { name: /add new task/i }))
    
    // Button should show loading state
    expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
  })

  it('disables form during creation', async () => {
    render(<AddTodo onAdd={mockOnAdd} isCreating={true} />)
    
    // Expand form
    await user.click(screen.getByRole('button', { name: /add new task/i }))
    
    // Form fields should be disabled
    const titleInput = screen.getByPlaceholderText(/e\.g\., Call dentist/i)
    const submitButton = screen.getByRole('button', { name: /creating/i })
    
    expect(titleInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })

  it('validates and submits form correctly', async () => {
    render(<AddTodo onAdd={mockOnAdd} />)
    
    // Expand form
    await user.click(screen.getByRole('button', { name: /add new task/i }))
    
    // Fill in valid title
    const titleInput = screen.getByPlaceholderText(/e\.g\., Call dentist/i)
    await user.type(titleInput, 'Valid Title')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /create task/i }))
    
    // Should successfully submit
    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith('Valid Title', undefined, 'medium', undefined)
    })
  })
})