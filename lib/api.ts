import { supabase } from './supabaseClient'
import { Todo } from '@/types/database'

export async function getTodos(userId: string): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createTodo(
  userId: string,
  title: string,
  description?: string
): Promise<Todo> {
  const { data, error } = await supabase
    .from('todos')
    .insert({
      title,
      description,
      user_id: userId,
      completed: false,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTodo(
  id: string,
  updates: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>
): Promise<Todo> {
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function toggleTodo(id: string, completed: boolean): Promise<Todo> {
  return updateTodo(id, { completed })
}