import { z } from 'zod'

// Auth validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido')
    .max(100, 'El email es demasiado largo'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña es demasiado larga'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Todo validation schemas
export const createTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(100, 'El título no puede exceder 100 caracteres')
    .trim(),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
})

export const updateTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(100, 'El título no puede exceder 100 caracteres')
    .trim(),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
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
    .max(100, 'La búsqueda es demasiado larga')
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
      errors: ['Error de validación inesperado'] 
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