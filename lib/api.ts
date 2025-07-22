import { Todo, ShoppingItem, CreateShoppingListInput, UpdateShoppingItemInput } from '@/types/database'
import { safeLocalStorage } from '@/lib/storage'

// Simular delay de red para una mejor UX
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Generar ID único
const generateId = () => crypto.randomUUID()

// Obtener todos del localStorage
const getTodosFromStorage = (): Todo[] => {
  const todos = safeLocalStorage.getItem<Todo[]>('demo-todos', [])
  // Migrate old todos to include type field
  const migratedTodos = (todos || []).map(todo => ({
    ...todo,
    type: todo.type || 'todo' as const
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
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function createTodo(
  userId: string,
  title: string,
  description?: string
): Promise<Todo> {
  await delay(400)
  
  const newTodo: Todo = {
    id: generateId(),
    title,
    description,
    user_id: userId,
    completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    type: 'todo'
  }
  
  const todos = getTodosFromStorage()
  todos.push(newTodo)
  saveTodosToStorage(todos)
  
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
  
  const newShoppingList: Todo = {
    id: generateId(),
    title: input.title,
    description: input.description,
    user_id: input.user_id,
    completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    type: 'shopping_list',
    shopping_items: shoppingItems
  }
  
  const todos = getTodosFromStorage()
  todos.push(newShoppingList)
  saveTodosToStorage(todos)
  
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
  updates: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>
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
  await delay(300)
  
  const todos = getTodosFromStorage()
  const filteredTodos = todos.filter(todo => todo.id !== id)
  saveTodosToStorage(filteredTodos)
}

export async function toggleTodo(id: string, completed: boolean): Promise<Todo> {
  return updateTodo(id, { completed })
}