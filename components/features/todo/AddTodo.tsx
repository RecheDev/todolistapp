'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, X, AlertCircle, ShoppingCart, Calendar, Flag, ChevronDown } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { createTodoSchema, type CreateTodoFormData, validateWithSchema, sanitizeTodoInput } from '@/lib/validations'
import { toast } from 'sonner'

interface AddTodoProps {
  onAdd: (title: string, description?: string, priority?: 'low' | 'medium' | 'high', dueDate?: string) => void
  onAddShoppingList?: (title: string, description: string | undefined, items: string[]) => void
  isCreating?: boolean
}

export function AddTodo({ onAdd, onAddShoppingList, isCreating }: AddTodoProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [todoType, setTodoType] = useState<'todo' | 'shopping_list'>('todo')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [shoppingItems, setShoppingItems] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CreateTodoFormData, string>>>({})

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
    
    if (todoType === 'shopping_list') {
      const items = shoppingItems
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0)
      
      if (items.length === 0) {
        toast.error('Añade al menos un artículo a la lista de compra')
        return
      }
      
      onAddShoppingList?.(sanitizedData.title, sanitizedData.description, items)
      toast.success('🛒 ¡Lista de compra creada exitosamente!', { duration: 3000 })
    } else {
      onAdd(sanitizedData.title, sanitizedData.description, priority, dueDate || undefined)
      toast.success('✅ ¡Tarea creada exitosamente!', { duration: 3000 })
    }
    
    // Reset form
    setTitle('')
    setDescription('')
    setShoppingItems('')
    setPriority('medium')
    setDueDate('')
    setFieldErrors({})
    setIsExpanded(false)
  }

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    setShoppingItems('')
    setPriority('medium')
    setDueDate('')
    setTodoType('todo')
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
      <Card className="w-full cursor-pointer hover:shadow-offset transition-all duration-200 hover:scale-[1.01] bg-card/50">
        <CardContent className="p-6">
          <Button
            variant="ghost"
            className="w-full h-16 justify-start text-secondary hover:bg-accent/70 text-lg font-medium transition-all duration-200 border-2 border-dashed border-secondary/30 hover:border-primary/50"
            onClick={() => setIsExpanded(true)}
          >
            <Plus className="h-6 w-6 mr-3" />
Add new task...
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full animate-in slide-in-from-top-2 duration-200 bg-card shadow-offset">
      <CardHeader className="pb-4 p-6">
        <CardTitle className="text-xl text-primary font-semibold">Create New Task</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4" role="form" aria-label="Add new todo form">
          {/* Type selector */}
          <div className="space-y-4">
            <label className="text-lg font-semibold text-primary">What would you like to create?</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTodoType('todo')}
                className={`h-20 p-6 text-left transition-all duration-300 transform hover:scale-[1.02] rounded-lg ${
                  todoType === 'todo'
                    ? 'bg-primary text-primary-foreground shadow-offset-lg scale-[1.02]'
                    : 'bg-background/50 hover:bg-accent/70 shadow-input hover:shadow-offset'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">✅</span>
                  <div>
                    <div className="text-lg font-bold">Regular Task</div>
                    <div className="text-sm opacity-80">A single thing to do</div>
                  </div>
                </div>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setTodoType('shopping_list')}
                className={`h-20 p-6 text-left transition-all duration-300 transform hover:scale-[1.02] rounded-lg ${
                  todoType === 'shopping_list'
                    ? 'bg-primary text-primary-foreground shadow-offset-lg scale-[1.02]'
                    : 'bg-background/50 hover:bg-accent/70 shadow-input hover:shadow-offset'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🛒</span>
                  <div>
                    <div className="text-lg font-bold">Shopping List</div>
                    <div className="text-sm opacity-80">Multiple items to buy</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Input
              placeholder={todoType === 'shopping_list' ? 'Shopping list name...' : 'What do you need to do?'}
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
              className={`h-16 text-lg transition-all duration-200 border-0 bg-muted/30 focus:bg-muted/50 focus:shadow-md ${
                fieldErrors.title 
                  ? 'bg-red-50 focus:bg-red-100 dark:bg-red-900/10 dark:focus:bg-red-900/20' 
                  : ''
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
              Enter a title for your todo. Press Cmd+Enter or Ctrl+Enter to save, Escape to cancel.
            </div>
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Description (optional)"
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
              className={`text-base transition-all duration-200 resize-none border-0 bg-muted/30 focus:bg-muted/50 focus:shadow-md ${
                fieldErrors.description 
                  ? 'bg-red-50 focus:bg-red-100 dark:bg-red-900/10 dark:focus:bg-red-900/20' 
                  : ''
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
              Optional description for your todo. Press Cmd+Enter or Ctrl+Enter to save, Escape to cancel.
            </div>
          </div>
          {todoType === 'shopping_list' && (
            <div className="space-y-2">
              <Textarea
                placeholder="Shopping list items, write each item on a separate line:&#10;potatoes&#10;water&#10;milk&#10;bread"
                value={shoppingItems}
                onChange={(e) => setShoppingItems(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isCreating}
                rows={4}
                aria-label="Shopping list items"
                className="text-base border-0 bg-muted/30 focus:bg-muted/50 transition-all duration-200 resize-none focus:shadow-md"
              />
              <div className="text-xs text-secondary">
                Write one item per line. Example: potatoes, water, milk
              </div>
            </div>
          )}
          
          {todoType === 'todo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority Selection */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Priority
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      id="priority"
                      className="w-full h-12 justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className={priority === 'high' ? 'text-red-600' : priority === 'medium' ? 'text-blue-600' : 'text-gray-600'}>
                          {priority === 'high' ? '🔴' : priority === 'medium' ? '🔶' : '⬇️'}
                        </span>
                        <span>{priority === 'high' ? 'High Priority' : priority === 'medium' ? 'Medium Priority' : 'Low Priority'}</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full" align="start">
                    <DropdownMenuItem onClick={() => setPriority('high')} className="cursor-pointer p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 font-semibold">🔴</span>
                        <span>High Priority</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriority('medium')} className="cursor-pointer p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">🔶</span>
                        <span>Medium Priority</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriority('low')} className="cursor-pointer p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">⬇️</span>
                        <span>Low Priority</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Due Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="due-date" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Due Date (optional)
                </Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isCreating}
                  className="h-12 border-0 bg-muted/30 focus:bg-muted/50 focus:shadow-md"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={!title.trim() || isCreating}
              className="flex-1 h-12 text-base"
              size="lg"
            >
              {isCreating ? (
                <Spinner size="sm" className="mr-2" />
              ) : todoType === 'shopping_list' ? (
                <ShoppingCart className="h-4 w-4 mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {isCreating 
                ? 'Creating...' 
                : todoType === 'shopping_list' 
                  ? '🛒 Create Shopping List' 
                  : '✅ Create Task'
              }
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isCreating}
              className="h-12 px-4"
              size="lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}