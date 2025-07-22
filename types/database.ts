// Types for the demo todo application using localStorage

export interface ShoppingItem {
  id: string
  text: string
  completed: boolean
}

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  user_id: string
  created_at: string
  updated_at: string
  // New fields for shopping list support
  type: 'todo' | 'shopping_list'
  shopping_items?: ShoppingItem[]
}

export interface User {
  id: string
  email: string
  name: string
}

// Helper types for operations
export type CreateTodoInput = Omit<Todo, 'id' | 'created_at' | 'updated_at'>
export type UpdateTodoInput = Partial<Pick<Todo, 'title' | 'description' | 'completed' | 'shopping_items'>>

// Shopping list specific types
export type CreateShoppingListInput = {
  title: string
  description?: string
  shopping_items: string[] // Array of item texts
  user_id: string
}

export type UpdateShoppingItemInput = {
  todoId: string
  itemId: string
  completed: boolean
}