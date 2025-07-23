import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high'
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const variants = {
    low: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600',
    medium: 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white border border-blue-600 dark:border-blue-500 shadow-sm',
    high: 'bg-red-600 text-white dark:bg-red-500 dark:text-white border-2 border-red-700 dark:border-red-400 shadow-md font-semibold'
  }

  const icons = {
    low: '⬇️',
    medium: '🔶', 
    high: '🔴'
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'text-xs px-2 py-1',
        variants[priority],
        className
      )}
    >
      <span className="mr-1">{icons[priority]}</span>
      {priority}
    </Badge>
  )
}