'use client'

import { useState, useCallback } from 'react'
import { Todo } from '@/types/database'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { DueDateBadge } from '@/components/ui/due-date-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Save, X, AlertCircle } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { format } from 'date-fns'
import { updateTodoSchema, type UpdateTodoFormData, validateWithSchema, sanitizeTodoInput } from '@/lib/validations'
import { toast } from 'sonner'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string, completed: boolean) => void
  onUpdate: (id: string, updates: { title: string; description?: string }) => void
  onDelete: (id: string) => void
  onToggleShoppingItem?: (todoId: string, itemId: string, completed: boolean) => void
  isUpdating?: boolean
  isDeleting?: boolean
  isToggling?: boolean
  isDragging?: boolean
  bulkSelectMode?: boolean
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
}

export function TodoItem({
  todo,
  onToggle,
  onUpdate,
  onDelete,
  onToggleShoppingItem,
  isUpdating,
  isDeleting,
  isToggling,
  isDragging,
  bulkSelectMode = false,
  isSelected = false,
  onSelect,
}: TodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDescription, setEditDescription] = useState(todo.description || '')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UpdateTodoFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = useCallback(async () => {
    if (isSubmitting) return // Prevent multiple submissions
    
    setIsSubmitting(true)
    setFieldErrors({})

    // Validate form data
    const validation = validateWithSchema(updateTodoSchema, { 
      title: editTitle, 
      description: editDescription 
    })
    
    if (!validation.success) {
      const errors: Partial<Record<keyof UpdateTodoFormData, string>> = {}
      validation.errors.forEach(error => {
        if (error.includes('título')) errors.title = error
        if (error.includes('descripción')) errors.description = error
      })
      setFieldErrors(errors)
      setIsSubmitting(false)
      toast.error('Por favor corrige los errores en el formulario')
      return
    }

    try {
      // Sanitize input before sending
      const sanitizedData = sanitizeTodoInput(validation.data)
      onUpdate(todo.id, {
        title: sanitizedData.title,
        description: sanitizedData.description,
      })
      setIsEditing(false)
      setFieldErrors({})
      toast.success('✅ Tarea actualizada exitosamente', { duration: 3000 })
    } catch {
      toast.error('⚠️ Error al actualizar la tarea', { duration: 4000 })
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, editTitle, editDescription, todo.id, onUpdate])

  const handleCancel = useCallback(() => {
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
    setFieldErrors({})
    setIsEditing(false)
  }, [todo.title, todo.description])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }, [handleSave, handleCancel])

  const handleToggleWithProtection = useCallback((checked: boolean) => {
    if (isToggling) return // Prevent multiple toggle requests
    onToggle(todo.id, checked)
  }, [isToggling, todo.id, onToggle])

  const handleDeleteWithConfirmation = useCallback(() => {
    if (isDeleting) return // Prevent multiple delete requests
    
    // Simple confirmation for better UX
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${todo.title}"?`)) {
      onDelete(todo.id)
      toast.success('🗑️ Tarea eliminada exitosamente', { duration: 3000 })
    }
  }, [isDeleting, todo.id, todo.title, onDelete])

  if (isEditing) {
    return (
      <Card className="w-full bg-background border-0 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Input
              value={editTitle}
              onChange={(e) => {
                setEditTitle(e.target.value)
                // Clear field error on change
                if (fieldErrors.title) {
                  setFieldErrors(prev => ({ ...prev, title: undefined }))
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Título de la tarea"
              autoFocus
              disabled={isUpdating || isSubmitting}
              required
              aria-label="Editar título de la tarea"
              aria-describedby={fieldErrors.title ? "edit-title-error" : "edit-title-help"}
              className={`h-12 text-base border-0 bg-muted/30 focus:bg-muted/50 transition-all duration-200 focus:shadow-md ${
                fieldErrors.title 
                  ? 'bg-red-50 focus:bg-red-100 dark:bg-red-900/10 dark:focus:bg-red-900/20' 
                  : ''
              }`}
              aria-invalid={fieldErrors.title ? "true" : "false"}
            />
            {fieldErrors.title && (
              <p id="edit-title-error" className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" />
                {fieldErrors.title}
              </p>
            )}
            <div id="edit-title-help" className="sr-only">
              Ingresa un nuevo título para tu tarea. Presiona Ctrl+Enter para guardar, Escape para cancelar.
            </div>
          </div>
          <div className="space-y-2">
            <Textarea
              value={editDescription}
              onChange={(e) => {
                setEditDescription(e.target.value)
                // Clear field error on change
                if (fieldErrors.description) {
                  setFieldErrors(prev => ({ ...prev, description: undefined }))
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Descripción (opcional)"
              disabled={isUpdating || isSubmitting}
              rows={3}
              aria-label="Editar descripción de la tarea (opcional)"
              aria-describedby={fieldErrors.description ? "edit-description-error" : "edit-description-help"}
              className={`text-base border-0 bg-muted/30 focus:bg-muted/50 transition-all duration-200 resize-none focus:shadow-md ${
                fieldErrors.description 
                  ? 'bg-red-50 focus:bg-red-100 dark:bg-red-900/10 dark:focus:bg-red-900/20' 
                  : ''
              }`}
              aria-invalid={fieldErrors.description ? "true" : "false"}
            />
            {fieldErrors.description && (
              <p id="edit-description-error" className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" />
                {fieldErrors.description}
              </p>
            )}
            <div id="edit-description-help" className="sr-only">
              Descripción opcional para tu tarea.
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={!editTitle.trim() || isUpdating || isSubmitting}
              className="flex-1 h-12 text-base"
              size="lg"
            >
              {isSubmitting ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? 'Guardando...' : '💾 Guardar'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating || isSubmitting}
              className="h-12 px-4 border-2 hover:bg-accent transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`w-full transition-all duration-200 hover:shadow-offset-lg hover:-translate-y-1 bg-background shadow-sm hover:shadow-md ${
        isDeleting ? 'opacity-50 scale-95' : ''
      } ${
        isSortableDragging || isDragging ? 'z-50 shadow-2xl scale-105 rotate-2' : ''
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-5">
          {bulkSelectMode ? (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect?.(checked as boolean)}
              className="mt-2 h-7 w-7 transition-all duration-200 hover:scale-110"
              aria-label={`Select "${todo.title}" for bulk actions`}
            />
          ) : (
            <Checkbox
              checked={todo.completed}
              onCheckedChange={(checked) => {
                handleToggleWithProtection(checked as boolean)
                if (checked) {
                  // Add celebration animation for completion
                  setTimeout(() => {
                    const checkbox = document.querySelector(`[aria-label*="${todo.title}"]`)
                    checkbox?.classList.add('animate-success')
                    setTimeout(() => checkbox?.classList.remove('animate-success'), 1000)
                  }, 100)
                }
              }}
              disabled={isToggling}
              className={`mt-2 h-7 w-7 transition-all duration-200 ${
                isToggling ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
              }`}
              aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  className={`break-words text-lg leading-relaxed ${
                    todo.completed
                      ? 'text-tertiary line-through font-medium'
                      : 'text-primary font-semibold'
                  }`}
                >
                  {todo.title}
                </h3>
                {todo.description && (
                  <p
                    className={`text-base mt-2 break-words leading-relaxed font-normal ${
                      todo.completed
                        ? 'text-tertiary line-through'
                        : 'text-secondary-foreground'
                    }`}
                  >
                    {todo.description}
                  </p>
                )}
                {todo.type === 'shopping_list' && todo.shopping_items && (
                  <div className="mt-4 space-y-3 bg-muted/10 p-4 rounded-lg shadow-inset">
                    <div className="text-sm font-semibold mb-3 text-secondary-foreground">Shopping items:</div>
                    {todo.shopping_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-2 rounded hover:bg-accent/50 transition-colors">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={(checked) => 
                            onToggleShoppingItem?.(todo.id, item.id, checked as boolean)
                          }
                          className="h-6 w-6"
                          aria-label={`Mark ${item.text} as ${item.completed ? 'incomplete' : 'complete'}`}
                        />
                        <span
                          className={`text-sm leading-relaxed font-medium ${
                            item.completed
                              ? 'text-tertiary line-through'
                              : 'text-primary'
                            }`}
                        >
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-12 w-12 p-0 hover:bg-accent transition-all duration-200 ${
                      isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                    }`}
                    disabled={isDeleting || isToggling}
                    aria-label="Todo actions menu"
                    aria-haspopup="menu"
                    {...attributes}
                    {...listeners}
                  >
                    <MoreHorizontal className="h-6 w-6" />
                    <span className="sr-only">Open menu for {todo.title} - drag to reorder</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32" role="menu" aria-label="Todo actions">
                  <DropdownMenuItem 
                    onClick={() => setIsEditing(true)} 
                    className="cursor-pointer hover:bg-accent p-4 focus:bg-accent text-lg"
                    role="menuitem"
                  >
                    <Edit className="h-5 w-5 mr-3" />
Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeleteWithConfirmation}
                    className="text-destructive cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/30 p-4 focus:bg-red-50 dark:focus:bg-red-900/30 text-lg"
                    role="menuitem"
                  >
                    <Trash2 className="h-5 w-5 mr-3" />
Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <Badge variant={todo.completed ? 'secondary' : 'default'} className="text-xs font-semibold px-3 py-1">
                {todo.type === 'shopping_list' 
                  ? (todo.completed ? '🛒 Complete' : '🛒 List')
                  : (todo.completed ? '✅ Done' : '⏳ Pending')
                }
              </Badge>
              
              {/* Priority Badge */}
              {todo.priority && (
                <PriorityBadge priority={todo.priority} />
              )}
              
              {/* Due Date Badge */}
              {todo.due_date && (
                <DueDateBadge dueDate={todo.due_date} completed={todo.completed} />
              )}
              
              {todo.type === 'shopping_list' && todo.shopping_items && (
                <span className="text-xs font-medium bg-muted/20 px-2 py-1 rounded text-tertiary">
                  {todo.shopping_items.filter(item => item.completed).length}/{todo.shopping_items.length} items
                </span>
              )}
              <span className="text-xs font-medium text-tertiary">
                {format(new Date(todo.created_at), 'dd/MM/yyyy')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}