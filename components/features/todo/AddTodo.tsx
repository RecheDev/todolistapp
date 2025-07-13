'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X } from 'lucide-react'

interface AddTodoProps {
  onAdd: (title: string, description?: string) => void
  isCreating?: boolean
}

export function AddTodo({ onAdd, isCreating }: AddTodoProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onAdd(title.trim(), description.trim() || undefined)
      setTitle('')
      setDescription('')
      setIsExpanded(false)
    }
  }

  const handleCancel = () => {
    setTitle('')
    setDescription('')
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
      <Card className="w-full cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
        <CardContent className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => setIsExpanded(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add a new todo...
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full animate-in slide-in-from-top-2 duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Add New Todo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4" role="form" aria-label="Add new todo form">
          <Input
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            disabled={isCreating}
            required
            aria-label="Todo title"
            aria-describedby="title-help"
          />
          <div id="title-help" className="sr-only">
            Enter a title for your todo. Press Cmd+Enter to save, Escape to cancel.
          </div>
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isCreating}
            rows={3}
            aria-label="Todo description (optional)"
            aria-describedby="description-help"
          />
          <div id="description-help" className="sr-only">
            Optional description for your todo.
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!title.trim() || isCreating}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isCreating ? 'Adding...' : 'Add Todo'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isCreating}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}