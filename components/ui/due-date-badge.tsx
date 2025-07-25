import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { format, isToday, isTomorrow, isPast, isThisWeek } from 'date-fns'

interface DueDateBadgeProps {
  dueDate: string
  completed?: boolean
  className?: string
}

export function DueDateBadge({ dueDate, completed, className }: DueDateBadgeProps) {
  const date = new Date(dueDate)
  
  const isOverdue = isPast(date) && !isToday(date) && !completed
  const isDueToday = isToday(date)
  const isDueTomorrow = isTomorrow(date)
  const isDueThisWeek = isThisWeek(date)
  
  let displayText = ''
  let variant = ''
  let icon = ''

  if (isOverdue) {
    displayText = `Overdue (${format(date, 'MMM d')})`
    variant = 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
    icon = '🚨'
  } else if (isDueToday) {
    displayText = 'Due today'
    variant = 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
    icon = '⏰'
  } else if (isDueTomorrow) {
    displayText = 'Due tomorrow'
    variant = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
    icon = '📅'
  } else if (isDueThisWeek) {
    displayText = `Due ${format(date, 'EEE')}`
    variant = 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
    icon = '📆'
  } else {
    displayText = format(date, 'MMM d, yyyy')
    variant = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    icon = '📅'
  }

  if (completed) {
    variant = 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'text-xs font-medium px-2 py-0.5 border-0',
        variant,
        className
      )}
    >
      <span className="mr-1">{icon}</span>
      {displayText}
    </Badge>
  )
}