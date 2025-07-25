import { Todo, ShoppingItem, CreateShoppingListInput, UpdateShoppingItemInput, BulkAction } from '@/types/database'
import { safeLocalStorage } from '@/lib/storage'

// Simular delay de red para una mejor UX - reduced for better INP
const delay = (ms: number) => {
  const shouldDelay = process.env.NEXT_PUBLIC_FAKE_DELAY
  // Reduce delays significantly for better INP performance
  const reducedMs = Math.min(ms, 50) // Cap at 50ms max
  return shouldDelay ? new Promise(resolve => setTimeout(resolve, reducedMs)) : Promise.resolve()
}

// Generar ID único
const generateId = () => crypto.randomUUID()

// Obtener todos del localStorage
const getTodosFromStorage = (): Todo[] => {
  const todos = safeLocalStorage.getItem<Todo[]>('demo-todos', [])
  // Migrate old todos to include new fields
  const migratedTodos = (todos || []).map((todo, index) => ({
    ...todo,
    type: todo.type || 'todo' as const,
    priority: todo.priority || 'medium' as const,
    order: todo.order ?? index
  }))
  
  // Save migrated todos back to storage
  if (migratedTodos.length > 0 && migratedTodos.some(t => !todos?.find(old => old.id === t.id && old.type === t.type))) {
    safeLocalStorage.setItem('demo-todos', migratedTodos)
  }
  
  return migratedTodos
}

// Guardar todos en localStorage
const saveTodosToStorage = (todos: Todo[]) => {
  safeLocalStorage.setItem('demo-todos', todos)
}

export async function getTodos(userId: string): Promise<Todo[]> {
  await delay(300) // Simular latencia de red
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
  await delay(400)
  
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
    type: 'todo',
    priority,
    due_date,
    order: maxOrder + 1
  }
  
  const allTodos = getTodosFromStorage()
  allTodos.push(newTodo)
  saveTodosToStorage(allTodos)
  
  return newTodo
}

export async function createShoppingList(
  input: CreateShoppingListInput
): Promise<Todo> {
  await delay(400)
  
  const shoppingItems: ShoppingItem[] = input.shopping_items.map(text => ({
    id: generateId(),
    text: text.trim(),
    completed: false
  }))
  
  const todos = getTodosFromStorage().filter(t => t.user_id === input.user_id)
  const maxOrder = todos.length > 0 ? Math.max(...todos.map(t => t.order ?? 0)) : 0
  
  const newShoppingList: Todo = {
    id: generateId(),
    title: input.title,
    description: input.description,
    user_id: input.user_id,
    completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    type: 'shopping_list',
    shopping_items: shoppingItems,
    priority: 'medium',
    order: maxOrder + 1
  }
  
  const allTodos = getTodosFromStorage()
  allTodos.push(newShoppingList)
  saveTodosToStorage(allTodos)
  
  return newShoppingList
}

export async function updateShoppingItem(
  input: UpdateShoppingItemInput
): Promise<Todo> {
  await delay(300)
  
  const todos = getTodosFromStorage()
  const todoIndex = todos.findIndex(t => t.id === input.todoId)
  
  if (todoIndex === -1) {
    throw new Error('Shopping list not found')
  }
  
  const todo = todos[todoIndex]
  if (todo.type !== 'shopping_list' || !todo.shopping_items) {
    throw new Error('Not a shopping list')
  }
  
  const itemIndex = todo.shopping_items.findIndex(item => item.id === input.itemId)
  if (itemIndex === -1) {
    throw new Error('Shopping item not found')
  }
  
  // Update the shopping item
  todo.shopping_items[itemIndex].completed = input.completed
  todo.updated_at = new Date().toISOString()
  
  // Check if all items are completed to mark the entire list as completed
  const allCompleted = todo.shopping_items.every(item => item.completed)
  todo.completed = allCompleted
  
  todos[todoIndex] = todo
  saveTodosToStorage(todos)
  
  return todo
}

export async function updateTodo(
  id: string,
  updates: Partial<Pick<Todo, 'title' | 'description' | 'completed' | 'priority' | 'due_date' | 'order'>>
): Promise<Todo> {
  await delay(300)
  
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
  await delay(200)
  
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
  await delay(300)
  
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
  await delay(300)
  
  const todos = getTodosFromStorage()
  const filteredTodos = todos.filter(todo => !(todo.user_id === userId && todo.completed))
  saveTodosToStorage(filteredTodos)
}

// Undo functionality - store last deleted todos
let lastDeletedTodos: { todos: Todo[], timestamp: number } | null = null

export async function deleteTodoWithUndo(id: string): Promise<{ todo: Todo }> {
  await delay(300)
  
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
  
  await delay(200)
  
  const todos = getTodosFromStorage()
  const restoredTodos = [...todos, ...lastDeletedTodos.todos]
  saveTodosToStorage(restoredTodos)
  
  const result = lastDeletedTodos.todos
  lastDeletedTodos = null
  
  return result
}