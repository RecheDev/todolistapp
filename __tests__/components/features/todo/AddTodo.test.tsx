import React from 'react'
import { render, screen, fireEvent, waitFor, userEvent } from '../../../utils/test-utils'
import { AddTodo } from '@/components/features/todo/AddTodo'

// Mock the validations module
jest.mock('@/lib/validations', () => ({
  createTodoSchema: {},
  validateWithSchema: jest.fn().mockReturnValue({ success: true, data: { title: 'Test Todo', description: 'Test Description' } }),
  sanitizeTodoInput: jest.fn().mockImplementation((data) => data),
}))

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const { toast } = require('sonner')
const { validateWithSchema } = require('@/lib/validations')

describe('AddTodo', () => {
  const mockOnAdd = jest.fn()
  const mockOnAddShoppingList = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders collapsed state initially', () => {
    render(<AddTodo onAdd={mockOnAdd} />)

    expect(screen.getByRole('button', { name: /add new task/i })).toBeInTheDocument()
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
  })

  it('expands when add button is clicked', async () => {
    const user = userEvent.setup()
    render(<AddTodo onAdd={mockOnAdd} />)

    const addButton = screen.getByRole('button', { name: /add new task/i })
    await user.click(addButton)

    expect(screen.getByRole('form')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/what do you need to do/i)).toBeInTheDocument()
  })

  it('shows form fields when expanded', async () => {
    const user = userEvent.setup()
    render(<AddTodo onAdd={mockOnAdd} />)

    await user.click(screen.getByRole('button', { name: /add new task/i }))

    expect(screen.getByPlaceholderText(/what do you need to do/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/description \(optional\)/i)).toBeInTheDocument()
    expect(screen.getByText(/priority/i)).toBeInTheDocument()
    expect(screen.getByText(/due date \(optional\)/i)).toBeInTheDocument()
  })

  it('switches between todo and shopping list modes', async () => {
    const user = userEvent.setup()
    render(<AddTodo onAdd={mockOnAdd} onAddShoppingList={mockOnAddShoppingList} />)

    await user.click(screen.getByRole('button', { name: /add new task/i }))

    // Initially should be in regular todo mode
    expect(screen.getByText('Regular Task')).toBeInTheDocument()
    expect(screen.getByText('A single thing to do')).toBeInTheDocument()

    // Click shopping list option
    const shoppingListButton = screen.getByRole('button', { name: /shopping list/i })
    await user.click(shoppingListButton)

    expect(screen.getByPlaceholderText(/shopping list name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/shopping list items/i)).toBeInTheDocument()
  })

  it('submits regular todo with valid data', async () => {
    const user = userEvent.setup()
    render(<AddTodo onAdd={mockOnAdd} />)

    await user.click(screen.getByRole('button', { name: /add new task/i }))

    // Fill in the form
    const titleInput = screen.getByPlaceholderText(/what do you need to do/i)
    const descriptionInput = screen.getByPlaceholderText(/description \(optional\)/i)

    await user.type(titleInput, 'Test Todo')
    await user.type(descriptionInput, 'Test Description')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create task/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith('Test Todo', 'Test Description', 'medium', undefined)
    })

    expect(toast.success).toHaveBeenCalledWith('✅ Task created successfully!', { duration: 3000 })
  })

  it('submits shopping list with valid data', async () => {
    const user = userEvent.setup()
    render(<AddTodo onAdd={mockOnAdd} onAddShoppingList={mockOnAddShoppingList} />)

    await user.click(screen.getByRole('button', { name: /add new task/i }))

    // Switch to shopping list mode
    await user.click(screen.getByRole('button', { name: /shopping list/i }))

    // Fill in the form
    const titleInput = screen.getByPlaceholderText(/shopping list name/i)
    const itemsInput = screen.getByPlaceholderText(/shopping list items/i)

    await user.type(titleInput, 'Grocery List')
    await user.type(itemsInput, 'milk\nbread\neggs')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create shopping list/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnAddShoppingList).toHaveBeenCalledWith('Grocery List', '', ['milk', 'bread', 'eggs'])
    })

    expect(toast.success).toHaveBeenCalledWith('🛒 ¡Lista de compra creada exitosamente!', { duration: 3000 })
  })

  it('shows validation errors', async () => {
    const user = userEvent.setup()
    validateWithSchema.mockReturnValue({
      success: false,
      errors: ['El título es requerido', 'La descripción es muy larga']
    })

    render(<AddTodo onAdd={mockOnAdd} />)

    await user.click(screen.getByRole('button', { name: /add new task/i }))

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /create task/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('⚠️ Por favor corrige los errores en el formulario', { duration: 4000 })
    })

    expect(mockOnAdd).not.toHaveBeenCalled()
  })

  it('prevents submission of shopping list without items', async () => {
    const user = userEvent.setup()
    render(<AddTodo onAdd={mockOnAdd} onAddShoppingList={mockOnAddShoppingList} />)

    await user.click(screen.getByRole('button', { name: /add new task/i }))
    await user.click(screen.getByRole('button', { name: /shopping list/i }))

    // Fill only title, no items
    const titleInput = screen.getByPlaceholderText(/shopping list name/i)
    await user.type(titleInput, 'Empty List')

    const submitButton = screen.getByRole('button', { name: /create shopping list/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Añade al menos un artículo a la lista de compra')
    })

    expect(mockOnAddShoppingList).not.toHaveBeenCalled()
  })

  it('handles keyboard shortcuts', async () => {
    const user = userEvent.setup()
    render(<AddTodo onAdd={mockOnAdd} />)

    await user.click(screen.getByRole('button', { name: /add new task/i }))

    const titleInput = screen.getByPlaceholderText(/what do you need to do/i)
    await user.type(titleInput, 'Test Todo')

    // Test Cmd+Enter submission
    await user.keyboard('{Meta>}{Enter}{/Meta}')

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalled()
    })
  })

  it('handles escape key to cancel', async () => {
    const user = userEvent.setup()
    render(<AddTodo onAdd={mockOnAdd} />)

    await user.click(screen.getByRole('button', { name: /add new task/i }))

    expect(screen.getByRole('form')).toBeInTheDocument()

    // Press escape to cancel
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add new task/i })).toBeInTheDocument()
  })

  it('resets form after successful submission', async () => {
    const user = userEvent.setup()
    render(<AddTodo onAdd={mockOnAdd} />)

    await user.click(screen.getByRole('button', { name: /add new task/i }))

    const titleInput = screen.getByPlaceholderText(/what do you need to do/i)
    const descriptionInput = screen.getByPlaceholderText(/description \(optional\)/i)

    await user.type(titleInput, 'Test Todo')
    await user.type(descriptionInput, 'Test Description')

    const submitButton = screen.getByRole('button', { name: /create task/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalled()
    })

    // Form should be collapsed and fields reset
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add new task/i })).toBeInTheDocument()
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    render(<AddTodo onAdd={mockOnAdd} isCreating={true} />)

    await user.click(screen.getByRole('button', { name: /add new task/i }))

    const submitButton = screen.getByRole('button', { name: /creating/i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Creating...')).toBeInTheDocument()
  })

  it('disables form during creation', async () => {
    const user = userEvent.setup()
    render(<AddTodo onAdd={mockOnAdd} isCreating={true} />)

    await user.click(screen.getByRole('button', { name: /add new task/i }))

    const titleInput = screen.getByPlaceholderText(/what do you need to do/i)
    const descriptionInput = screen.getByPlaceholderText(/description \(optional\)/i)
    const cancelButton = screen.getByRole('button', { name: '' }) // Cancel button with X icon

    expect(titleInput).toBeDisabled()
    expect(descriptionInput).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })

  it('clears field errors on input change', async () => {
    const user = userEvent.setup()
    validateWithSchema.mockReturnValueOnce({
      success: false,
      errors: ['El título es requerido']
    }).mockReturnValue({
      success: true,
      data: { title: 'Valid Title', description: '' }
    })

    render(<AddTodo onAdd={mockOnAdd} />)

    await user.click(screen.getByRole('button', { name: /add new task/i }))

    // Submit to trigger validation error
    const submitButton = screen.getByRole('button', { name: /create task/i })
    await user.click(submitButton)

    // Now type in the title field to clear the error
    const titleInput = screen.getByPlaceholderText(/what do you need to do/i)
    await user.type(titleInput, 'Valid Title')

    // The error should be cleared and we should be able to submit
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalled()
    })
  })
})