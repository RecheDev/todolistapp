import { Todo, BulkAction } from '@/types/database'
import { safeLocalStorage } from '@/lib/storage'

// No delays for optimal UX - function kept for potential future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const delay = (ms: number) => Promise.resolve()

// Generate unique ID
const generateId = () => crypto.randomUUID()

// Get todos from localStorage
const getTodosFromStorage = (): Todo[] => {
  const todos = safeLocalStorage.getItem<Todo[]>('demo-todos', [])
  // Migrate old todos to include new fields
  const migratedTodos = (todos || []).map((todo, index) => ({
    ...todo,
    priority: todo.priority || 'medium' as const,
    order: todo.order ?? index
  }))
  
  // Save migrated todos back to storage
  if (migratedTodos.length > 0 && migratedTodos.some(t => !todos?.find(old => old.id === t.id))) {
    safeLocalStorage.setItem('demo-todos', migratedTodos)
  }
  
  return migratedTodos
}

// Save todos to localStorage
const saveTodosToStorage = (todos: Todo[]) => {
  safeLocalStorage.setItem('demo-todos', todos)
}

export async function getTodos(userId: string): Promise<Todo[]> {
  const todos = getTodosFromStorage()
  return todos.filter(todo => todo.user_id === userId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export async function createTodo(
  userId: string,
  title: string,
  description?: string,
  priority: 'low' | 'medium' | 'high' = 'medium',
  due_date?: string
): Promise<Todo> {
  
  const todos = getTodosFromStorage().filter(t => t.user_id === userId)
  const maxOrder = todos.length > 0 ? Math.max(...todos.map(t => t.order ?? 0)) : 0
  
  const newTodo: Todo = {
    id: generateId(),
    title,
    description,
    user_id: userId,
    completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    priority,
    due_date,
    order: maxOrder + 1
  }
  
  const allTodos = getTodosFromStorage()
  allTodos.push(newTodo)
  saveTodosToStorage(allTodos)
  
  return newTodo
}


export async function updateTodo(
  id: string,
  updates: Partial<Pick<Todo, 'title' | 'description' | 'completed' | 'priority' | 'due_date' | 'order'>>
): Promise<Todo> {
  
  const todos = getTodosFromStorage()
  const todoIndex = todos.findIndex(todo => todo.id === id)
  
  if (todoIndex === -1) {
    throw new Error('Todo not found')
  }
  
  const updatedTodo = {
    ...todos[todoIndex],
    ...updates,
    updated_at: new Date().toISOString()
  }
  
  todos[todoIndex] = updatedTodo
  saveTodosToStorage(todos)
  
  return updatedTodo
}

export async function deleteTodo(id: string): Promise<void> {
  await deleteTodoWithUndo(id)
  // Regular delete without undo capability for legacy compatibility
}

export async function toggleTodo(id: string, completed: boolean): Promise<Todo> {
  return updateTodo(id, { completed })
}

// New high-impact features
export async function reorderTodos(userId: string, todoIds: string[]): Promise<Todo[]> {
  
  const todos = getTodosFromStorage()
  const userTodos = todos.filter(t => t.user_id === userId)
  const otherTodos = todos.filter(t => t.user_id !== userId)
  
  // Update order based on new positions
  const reorderedTodos = todoIds.map((id, index) => {
    const todo = userTodos.find(t => t.id === id)
    if (!todo) throw new Error(`Todo ${id} not found`)
    return { ...todo, order: index, updated_at: new Date().toISOString() }
  })
  
  const allTodos = [...otherTodos, ...reorderedTodos]
  saveTodosToStorage(allTodos)
  
  return reorderedTodos
}

export async function bulkAction(userId: string, todoIds: string[], action: BulkAction): Promise<Todo[]> {
  
  const todos = getTodosFromStorage()
  const updatedTodos: Todo[] = []
  
  todos.forEach(todo => {
    if (todo.user_id === userId && todoIds.includes(todo.id)) {
      switch (action) {
        case 'delete':
          // Skip this todo (don't add to updatedTodos)
          return
        case 'complete':
          updatedTodos.push({ ...todo, completed: true, updated_at: new Date().toISOString() })
          break
        case 'incomplete':
          updatedTodos.push({ ...todo, completed: false, updated_at: new Date().toISOString() })
          break
      }
    } else {
      updatedTodos.push(todo)
    }
  })
  
  saveTodosToStorage(updatedTodos)
  
  return updatedTodos.filter(t => t.user_id === userId && todoIds.includes(t.id))
}

export async function deleteCompletedTodos(userId: string): Promise<void> {
  
  const todos = getTodosFromStorage()
  const filteredTodos = todos.filter(todo => !(todo.user_id === userId && todo.completed))
  saveTodosToStorage(filteredTodos)
}

// Undo functionality - store last deleted todos
let lastDeletedTodos: { todos: Todo[], timestamp: number } | null = null

export async function deleteTodoWithUndo(id: string): Promise<{ todo: Todo }> {
  
  const todos = getTodosFromStorage()
  const todoToDelete = todos.find(t => t.id === id)
  
  if (!todoToDelete) {
    throw new Error('Todo not found')
  }
  
  const filteredTodos = todos.filter(todo => todo.id !== id)
  saveTodosToStorage(filteredTodos)
  
  // Store for undo
  lastDeletedTodos = { todos: [todoToDelete], timestamp: Date.now() }
  
  return { todo: todoToDelete }
}

export async function undoDelete(): Promise<Todo[]> {
  if (!lastDeletedTodos || Date.now() - lastDeletedTodos.timestamp > 10000) {
    throw new Error('Nothing to undo or undo expired')
  }
  
  
  const todos = getTodosFromStorage()
  const restoredTodos = [...todos, ...lastDeletedTodos.todos]
  saveTodosToStorage(restoredTodos)
  
  const result = lastDeletedTodos.todos
  lastDeletedTodos = null
  
  return result
}