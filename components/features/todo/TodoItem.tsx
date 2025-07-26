'use client'

import { useState, useCallback } from 'react'
import { Todo } from '@/types/database'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { DueDateBadge } from '@/components/ui/due-date-badge'
import { Edit, Trash2, Save, X, AlertCircle, Flag, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MdPriorityHigh, MdRemove, MdExpandMore } from 'react-icons/md'
import { Spinner } from '@/components/ui/spinner'
import { format } from 'date-fns'
import { updateTodoSchema, type UpdateTodoFormData, validateWithSchema, sanitizeTodoInput } from '@/lib/validations'
import { useThrottleCallback } from '@/hooks/usePerformance'
import { toast } from 'sonner'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string, completed: boolean) => void
  onUpdate: (id: string, updates: { title: string; description?: string; priority?: 'low' | 'medium' | 'high'; due_date?: string }) => void
  onDelete: (id: string) => void
  isUpdating?: boolean
  isDeleting?: boolean
  isToggling?: boolean
  bulkSelectMode?: boolean
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
}

export function TodoItem({
  todo,
  onToggle,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
  isToggling,
  bulkSelectMode = false,
  isSelected = false,
  onSelect,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDescription, setEditDescription] = useState(todo.description || '')
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>(todo.priority || 'medium')
  const [editDueDate, setEditDueDate] = useState(todo.due_date || '')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UpdateTodoFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const handleSave = useCallback(async () => {
    if (isSubmitting) return // Prevent multiple submissions
    
    setIsSubmitting(true)
    setFieldErrors({})

    // Use requestIdleCallback for non-critical validation to improve INP
    const performValidation = () => {
      // Validate form data
      const validation = validateWithSchema(updateTodoSchema, { 
        title: editTitle, 
        description: editDescription 
      })
      
      if (!validation.success) {
        const errors: Partial<Record<keyof UpdateTodoFormData, string>> = {}
        validation.errors.forEach(error => {
          if (error.includes('title')) errors.title = error
          if (error.includes('description')) errors.description = error
        })
        setFieldErrors(errors)
        setIsSubmitting(false)
        toast.error('Please correct the form errors')
        return
      }

      try {
        // Sanitize input before sending
        const sanitizedData = sanitizeTodoInput(validation.data)
        onUpdate(todo.id, {
          title: sanitizedData.title,
          description: sanitizedData.description,
          priority: editPriority,
          due_date: editDueDate || undefined,
        })
        setIsEditing(false)
        setFieldErrors({})
        toast.success('✅ Task updated successfully', { duration: 3000 })
      } catch {
        toast.error('⚠️ Error updating task', { duration: 4000 })
      } finally {
        setIsSubmitting(false)
      }
    }

    // Use scheduler API if available, fallback to setTimeout
    // @ts-expect-error - scheduler API is experimental
    if ('scheduler' in window && 'postTask' in window.scheduler) {
      // @ts-expect-error - scheduler API is experimental
      window.scheduler.postTask(performValidation, { priority: 'user-blocking' })
    } else if ('requestIdleCallback' in window) {
      window.requestIdleCallback(performValidation, { timeout: 100 })
    } else {
      setTimeout(performValidation, 0)
    }
  }, [isSubmitting, editTitle, editDescription, editPriority, editDueDate, todo.id, onUpdate])

  const handleCancel = useCallback(() => {
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
    setEditPriority(todo.priority || 'medium')
    setEditDueDate(todo.due_date || '')
    setFieldErrors({})
    setIsEditing(false)
  }, [todo.title, todo.description, todo.priority, todo.due_date])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }, [handleSave, handleCancel])

  // Throttle toggle to prevent rapid clicks causing INP issues
  const handleToggleWithProtection = useThrottleCallback((checked: boolean) => {
    if (isToggling) return // Prevent multiple toggle requests
    onToggle(todo.id, checked)
  }, 150) // 150ms throttle

  const handleDeleteWithConfirmation = useCallback(() => {
    if (isDeleting) return // Prevent multiple delete requests
    
    // Simple confirmation for better UX
    if (window.confirm(`Are you sure you want to delete "${todo.title}"?`)) {
      onDelete(todo.id)
      toast.success('🗑️ Task deleted successfully', { duration: 3000 })
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
              placeholder="Task title"
              autoFocus
              disabled={isUpdating || isSubmitting}
              required
              aria-label="Edit task title"
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
              Enter a new title for your task. Press Ctrl+Enter to save, Escape to cancel.
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
              placeholder="Description (optional)"
              disabled={isUpdating || isSubmitting}
              rows={3}
              aria-label="Edit task description (optional)"
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
              Optional description for your task.
            </div>
          </div>
          
          {/* Priority and Due Date Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Priority Selection */}
              <div className="space-y-3">
                <Label htmlFor="edit-priority" className="text-sm font-medium flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Priority
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      id="edit-priority"
                      className="w-full h-12 justify-between"
                      disabled={isUpdating || isSubmitting}
                    >
                      <div className="flex items-center gap-2">
                        {editPriority === 'high' ? (
                          <MdPriorityHigh className="h-4 w-4 text-red-600" />
                        ) : editPriority === 'medium' ? (
                          <MdRemove className="h-4 w-4 text-blue-600" />
                        ) : (
                          <MdExpandMore className="h-4 w-4 text-gray-600" />
                        )}
                        <span>{editPriority === 'high' ? 'High' : editPriority === 'medium' ? 'Medium' : 'Low'}</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full" align="start">
                    <DropdownMenuItem onClick={() => setEditPriority('high')} className="cursor-pointer p-3">
                      <div className="flex items-center gap-2">
                        <MdPriorityHigh className="h-4 w-4 text-red-600" />
                        <span>High Priority</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditPriority('medium')} className="cursor-pointer p-3">
                      <div className="flex items-center gap-2">
                        <MdRemove className="h-4 w-4 text-blue-600" />
                        <span>Medium Priority</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditPriority('low')} className="cursor-pointer p-3">
                      <div className="flex items-center gap-2">
                        <MdExpandMore className="h-4 w-4 text-gray-600" />
                        <span>Low Priority</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Due Date Selection */}
              <div className="space-y-3">
                <Label htmlFor="edit-due-date" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Due date (optional)
                </Label>
                <Input
                  id="edit-due-date"
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  disabled={isUpdating || isSubmitting}
                  className="h-12 border-0 bg-muted/30 focus:bg-muted/50 focus:shadow-md"
                  min={new Date().toISOString().split('T')[0]}
                />
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
              {isSubmitting ? 'Saving...' : 'Save'}
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
      className={`w-full transition-all duration-200 hover:shadow-offset-lg hover:-translate-y-1 bg-background shadow-sm hover:shadow-md ${
        isDeleting ? 'opacity-50 scale-95' : ''
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-5">
          <div className="w-7 flex justify-center">
            <Checkbox
              checked={bulkSelectMode ? isSelected : todo.completed}
              onCheckedChange={(checked) => {
                if (bulkSelectMode) {
                  onSelect?.(checked as boolean)
                } else {
                  handleToggleWithProtection(checked as boolean)
                  if (checked) {
                    // Add celebration animation for completion
                    setTimeout(() => {
                      const checkbox = document.querySelector(`[aria-label*="${todo.title}"]`)
                      checkbox?.classList.add('animate-success')
                      setTimeout(() => checkbox?.classList.remove('animate-success'), 1000)
                    }, 100)
                  }
                }
              }}
              disabled={!bulkSelectMode && isToggling}
              className={`mt-2 h-7 w-7 transition-all duration-200 ${
                (!bulkSelectMode && isToggling) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
              }`}
              aria-label={bulkSelectMode 
                ? `Select "${todo.title}" for bulk actions`
                : `Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`
              }
            />
          </div>
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
                    className={`text-base mt-2 break-words leading-relaxed font-normal transition-opacity duration-200 ${
                      isMinimized 
                        ? 'opacity-40' 
                        : 'opacity-100'
                    } ${
                      todo.completed
                        ? 'text-tertiary line-through'
                        : 'text-secondary-foreground'
                    }`}
                  >
                    {todo.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-10 w-10 p-0 hover:bg-accent transition-all duration-200 hover:scale-110"
                  disabled={isDeleting || isToggling}
                  aria-label={`${isMinimized ? 'Expand' : 'Minimize'} ${todo.title}`}
                >
                  {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-10 w-10 p-0 hover:bg-accent transition-all duration-200 hover:scale-110"
                  disabled={isDeleting || isToggling}
                  aria-label={`Edit ${todo.title}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteWithConfirmation}
                  className="h-10 w-10 p-0 text-destructive hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 hover:scale-110"
                  disabled={isDeleting || isToggling}
                  aria-label={`Delete ${todo.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {!isMinimized && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Badge variant={todo.completed ? 'secondary' : 'default'} className="text-xs font-semibold px-3 py-1">
                  {todo.completed ? '✅ Done' : '⏳ Pending'}
                </Badge>
                
                {/* Priority Badge */}
                {todo.priority && (
                  <PriorityBadge priority={todo.priority} />
                )}
                
                {/* Due Date Badge */}
                {todo.due_date && (
                  <DueDateBadge dueDate={todo.due_date} completed={todo.completed} />
                )}
                
                <span className="text-xs font-medium text-tertiary">
                  {format(new Date(todo.created_at), 'dd/MM/yyyy')}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}