'use client'

import { useState, useMemo } from 'react'
import { useTodos } from '@/hooks/useTodos'
import { useAuth } from '@/hooks/useAuth'
import { Calendar } from '@/components/features/calendar/Calendar'
import { TodoListContainer } from '@/components/features/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import { CalendarErrorBoundary } from '@/components/ui/feature-error-boundaries'

function CalendarPageInternal() {
  const { user } = useAuth()
  const { todos, toggleTodo, updateTodo, deleteTodo } = useTodos()
  const [selectedDate, setSelectedDate] = useState<Date>()

  // Filter tasks by selected date
  const filteredTodos = useMemo(() => {
    if (!selectedDate) return []
    
    const selectedDateString = selectedDate.toDateString()
    return todos.filter(todo => {
      if (!todo.due_date) return false
      return new Date(todo.due_date).toDateString() === selectedDateString
    })
  }, [todos, selectedDate])

  const handleToggleTodo = (id: string, completed: boolean) => {
    toggleTodo({ id, completed })
  }

  const handleUpdateTodo = (id: string, updates: { title: string; description?: string }) => {
    updateTodo({ id, updates })
  }

  const handleDeleteTodo = (id: string) => {
    deleteTodo(id)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Task Calendar</h1>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {user?.email}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6 md:space-y-8">
        {/* Calendar */}
        <Calendar
          todos={todos}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        {/* Tasks for selected date */}
        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle>
                Tasks for {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTodos.length > 0 ? (
                <TodoListContainer
                  filteredTodos={filteredTodos}
                  allTodos={todos}
                  isUpdating={false}
                  isDeleting={false}
                  isToggling={false}
                  bulkSelectMode={false}
                  selectedTodos={new Set()}
                  onToggleTodo={handleToggleTodo}
                  onUpdateTodo={handleUpdateTodo}
                  onDeleteTodo={handleDeleteTodo}
                  onSelectTodo={() => {}} // No bulk select in calendar view
                />
              ) : (
                <div className="text-center py-12 md:py-16 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks scheduled for this date</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!selectedDate && (
          <Card>
            <CardContent className="text-center py-12 md:py-16">
              <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Select a date</h2>
              <p className="text-muted-foreground">
                Click on any day in the calendar to view scheduled tasks
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default function CalendarPage() {
  return (
    <CalendarErrorBoundary>
      <CalendarPageInternal />
    </CalendarErrorBoundary>
  )
}