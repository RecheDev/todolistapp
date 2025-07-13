export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      todos: {
        Row: Todo
        Insert: Omit<Todo, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Todo, 'id' | 'created_at' | 'updated_at'>>
      }
      profiles: {
        Row: User
        Insert: Omit<User, 'created_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
    }
  }
}