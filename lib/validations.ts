import { z } from 'zod'

// Auth validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(100, 'Email is too long'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password is too long'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Todo validation schemas
export const createTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .trim()
    .optional()
    .or(z.literal('')),
})

export const updateTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .trim()
    .optional()
    .or(z.literal('')),
})

export type CreateTodoFormData = z.infer<typeof createTodoSchema>
export type UpdateTodoFormData = z.infer<typeof updateTodoSchema>

// Search validation
export const searchSchema = z.object({
  query: z
    .string()
    .max(100, 'Search query is too long')
    .trim(),
})

// Utility function to safely validate and return formatted errors
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.safeParse(data)
    
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      const errors = result.error.issues.map(err => err.message)
      return { success: false, errors }
    }
  } catch {
    return { 
      success: false, 
      errors: ['Unexpected validation error']
    }
  }
}

// Sanitization helpers
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export function sanitizeTodoInput(input: { title: string; description?: string }) {
  return {
    title: sanitizeHtml(input.title),
    description: input.description ? sanitizeHtml(input.description) : undefined,
  }
}