'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Todo } from '@/types/database'

interface CalendarProps {
  todos: Todo[]
  selectedDate?: Date
  onDateSelect: (date: Date) => void
  onClose?: () => void
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function Calendar({ todos, selectedDate, onDateSelect, onClose }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Group tasks by date
  const todosByDate = useMemo(() => {
    const grouped: Record<string, Todo[]> = {}
    
    todos.forEach(todo => {
      if (todo.due_date) {
        const dateKey = new Date(todo.due_date).toDateString()
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(todo)
      }
    })
    
    return grouped
  }, [todos])

  // Get calendar cells
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    // Adjust to start week on Monday (0=Sunday, 1=Monday, etc.)
    const dayOfWeek = firstDay.getDay()
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startDate.setDate(startDate.getDate() - daysFromMonday)
    
    const days = []
    const current = new Date(startDate)
    
    // Generate 6 weeks (42 days)
    for (let i = 0; i < 42; i++) {
      const dateKey = current.toDateString()
      const todosForDay = todosByDate[dateKey] || []
      
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString(),
        isSelected: selectedDate && current.toDateString() === selectedDate.toDateString(),
        todos: todosForDay,
        completedTodos: todosForDay.filter(t => t.completed).length,
        pendingTodos: todosForDay.filter(t => !t.completed).length
      })
      
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [currentDate, todosByDate, selectedDate])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Task Calendar
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[140px] text-center">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b">
          {DAYS.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => onDateSelect(day.date)}
              className={cn(
                "min-h-[100px] p-2 border-r border-b last:border-r-0 hover:bg-accent transition-colors",
                "flex flex-col items-start justify-start text-left",
                !day.isCurrentMonth && "text-muted-foreground bg-muted/20",
                day.isToday && "bg-primary/10 border-primary/20",
                day.isSelected && "bg-primary text-primary-foreground",
                day.todos.length > 0 && "relative"
              )}
            >
              <span className={cn(
                "text-sm font-medium mb-1",
                day.isToday && !day.isSelected && "text-primary font-semibold",
                day.isSelected && "text-primary-foreground font-semibold"
              )}>
                {day.date.getDate()}
              </span>
              
              {day.todos.length > 0 && (
                <div className="flex flex-col gap-1 w-full mt-1">
                  {day.pendingTodos > 0 && (
                    <div className={cn(
                      "text-xs px-1 py-0.5 rounded",
                      day.isSelected 
                        ? "bg-primary-foreground/20 text-primary-foreground" 
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                    )}>
                      {day.pendingTodos} pending
                    </div>
                  )}
                  {day.completedTodos > 0 && (
                    <div className={cn(
                      "text-xs px-1 py-0.5 rounded",
                      day.isSelected 
                        ? "bg-primary-foreground/20 text-primary-foreground" 
                        : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                    )}>
                      {day.completedTodos} complete
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}