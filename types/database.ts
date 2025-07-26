// Types for the demo todo application using localStorage

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  user_id: string
  created_at: string
  updated_at: string
  // High impact features
  priority?: 'low' | 'medium' | 'high'
  due_date?: string
  order: number
}

export interface User {
  id: string
  email: string
  name: string
}

// Helper types for operations
export type CreateTodoInput = Omit<Todo, 'id' | 'created_at' | 'updated_at'>
export type UpdateTodoInput = Partial<Pick<Todo, 'title' | 'description' | 'completed' | 'priority' | 'due_date' | 'order'>>

// New bulk operations
export type BulkAction = 'delete' | 'complete' | 'incomplete'