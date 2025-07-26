'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, X, AlertCircle, Calendar, Flag, ChevronDown, Triangle, Minus, Circle } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { createTodoSchema, type CreateTodoFormData, validateWithSchema, sanitizeTodoInput } from '@/lib/validations'
import { toast } from 'sonner'
import { AddTodoErrorBoundary } from '@/components/ui/feature-error-boundaries'

interface AddTodoProps {
  onAdd: (title: string, description?: string, priority?: 'low' | 'medium' | 'high', dueDate?: string) => void
  isCreating?: boolean
}

function AddTodoInternal({ onAdd, isCreating }: AddTodoProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CreateTodoFormData, string>>>({})

  // Detect OS for keyboard shortcut display
  const isMac = useMemo(() => {
    if (typeof window === 'undefined') return false
    return /Mac|iPod|iPhone|iPad/.test(window.navigator.userAgent)
  }, [])
  
  const modifierKey = isMac ? 'Cmd' : 'Ctrl'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    // Validate form data
    const validation = validateWithSchema(createTodoSchema, { title, description })
    if (!validation.success) {
      const errors: Partial<Record<keyof CreateTodoFormData, string>> = {}
      validation.errors.forEach(error => {
        if (error.includes('título')) errors.title = error
        if (error.includes('descripción')) errors.description = error
      })
      setFieldErrors(errors)
      toast.error('⚠️ Por favor corrige los errores en el formulario', { duration: 4000 })
      return
    }

    // Sanitize input before sending
    const sanitizedData = sanitizeTodoInput(validation.data)
    
    onAdd(sanitizedData.title, sanitizedData.description, priority, dueDate || undefined)
    toast.success('✅ Task created successfully!', { duration: 3000 })
    
    // Reset form
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate('')
    setFieldErrors({})
    setIsExpanded(false)
  }

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate('')
    setFieldErrors({})
    setIsExpanded(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e)
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (!isExpanded) {
    return (
      <div className="flex justify-center">
        <Button
          variant="default"
          size="lg"
          className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          onClick={() => setIsExpanded(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Task
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full animate-in slide-in-from-top-2 duration-200 bg-card shadow-offset">
      <CardHeader className="pb-4 p-6">
        <CardTitle className="text-xl text-primary font-semibold">Create New Task</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-label="Add new todo form">
          <div className="space-y-3">
            <Label htmlFor="todo-title" className="text-base font-semibold text-primary">
              What do you need to do?
            </Label>
            <Input
              id="todo-title"
              placeholder="e.g., Call dentist, Finish project report, Buy groceries..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                // Clear field error on change
                if (fieldErrors.title) {
                  setFieldErrors(prev => ({ ...prev, title: undefined }))
                }
              }}
              onKeyDown={handleKeyDown}
              autoFocus
              disabled={isCreating}
              required
              aria-label="Todo title"
              aria-describedby={fieldErrors.title ? "title-error" : "title-help"}
              className={`h-20 text-xl px-6 py-4 font-medium transition-all duration-200 border-2 bg-gradient-to-r from-background to-muted/30 focus:from-primary/5 focus:to-primary/10 focus:bg-background focus:shadow-lg focus:border-primary/50 hover:border-primary/30 rounded-xl ${
                fieldErrors.title 
                  ? 'bg-red-50 focus:bg-red-100 dark:bg-red-900/10 dark:focus:bg-red-900/20 border-red-300 dark:border-red-700' 
                  : 'border-border/60'
              }`}
              aria-invalid={fieldErrors.title ? "true" : "false"}
            />
            {fieldErrors.title && (
              <p id="title-error" className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" />
                {fieldErrors.title}
              </p>
            )}
            <div id="title-help" className="sr-only">
              Enter a title for your todo. Press {modifierKey}+Enter to save, Escape to cancel.
            </div>
          </div>
          <div className="space-y-3">
            <Label htmlFor="todo-description" className="text-base font-medium text-foreground">
              Description (optional)
            </Label>
            <Textarea
              id="todo-description"
              placeholder="Add more details about this task..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                // Clear field error on change
                if (fieldErrors.description) {
                  setFieldErrors(prev => ({ ...prev, description: undefined }))
                }
              }}
              onKeyDown={handleKeyDown}
              disabled={isCreating}
              rows={3}
              aria-label="Todo description (optional)"
              aria-describedby={fieldErrors.description ? "description-error" : "description-help"}
              className={`text-base px-4 py-3 transition-all duration-200 resize-none border-2 bg-gradient-to-r from-background to-muted/30 focus:from-primary/5 focus:to-primary/10 focus:bg-background focus:shadow-md focus:border-primary/50 hover:border-primary/30 rounded-lg ${
                fieldErrors.description 
                  ? 'bg-red-50 focus:bg-red-100 dark:bg-red-900/10 dark:focus:bg-red-900/20 border-red-300 dark:border-red-700' 
                  : 'border-border/60'
              }`}
              aria-invalid={fieldErrors.description ? "true" : "false"}
            />
            {fieldErrors.description && (
              <p id="description-error" className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1" role="alert">
                <AlertCircle className="h-4 w-4" />
                {fieldErrors.description}
              </p>
            )}
            <div id="description-help" className="sr-only">
              Optional description for your todo. Press {modifierKey}+Enter to save, Escape to cancel.
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority Selection */}
            <div className="space-y-3">
              <Label htmlFor="priority" className="text-base font-medium flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Priority
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    id="priority"
                    className="w-full h-14 justify-between text-base border-2 border-border/60 hover:border-primary/30 focus:border-primary/50 bg-gradient-to-r from-background to-muted/30 hover:from-primary/5 hover:to-primary/10 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {priority === 'high' ? (
                        <Triangle className="h-5 w-5 text-red-600 fill-red-600" />
                      ) : priority === 'medium' ? (
                        <Minus className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-600" />
                      )}
                      <span className="font-medium">{priority === 'high' ? 'High Priority' : priority === 'medium' ? 'Medium Priority' : 'Low Priority'}</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full" align="start">
                  <DropdownMenuItem onClick={() => setPriority('high')} className="cursor-pointer p-3">
                    <div className="flex items-center gap-2">
                      <Triangle className="h-4 w-4 text-red-600 fill-red-600" />
                      <span>High Priority</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPriority('medium')} className="cursor-pointer p-3">
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-blue-600" />
                      <span>Medium Priority</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPriority('low')} className="cursor-pointer p-3">
                    <div className="flex items-center gap-2">
                      <Circle className="h-4 w-4 text-gray-600" />
                      <span>Low Priority</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Due Date Selection */}
            <div className="space-y-3">
              <Label htmlFor="due-date" className="text-base font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date (optional)
              </Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isCreating}
                className="h-14 text-base px-4 border-2 border-border/60 bg-gradient-to-r from-background to-muted/30 focus:from-primary/5 focus:to-primary/10 focus:bg-background focus:shadow-md focus:border-primary/50 hover:border-primary/30 rounded-lg"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <div className="flex gap-4 pt-2">
            <Button
              type="submit"
              disabled={!title.trim() || isCreating}
              className="flex-1 h-14 text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              size="lg"
            >
              {isCreating ? (
                <Spinner size="sm" className="mr-3" />
              ) : (
                <Plus className="h-5 w-5 mr-3" />
              )}
              {isCreating ? 'Creating...' : 'Create Task'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isCreating}
              className="h-14 px-6 border-2 border-border/60 hover:border-primary/30 rounded-lg"
              size="lg"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export function AddTodo(props: AddTodoProps) {
  return (
    <AddTodoErrorBoundary>
      <AddTodoInternal {...props} />
    </AddTodoErrorBoundary>
  )
}