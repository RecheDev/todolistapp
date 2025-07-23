import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high'
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const variants = {
    low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
  }

  const icons = {
    low: '🔽',
    medium: '🔸', 
    high: '🔺'
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'text-xs font-medium px-2 py-0.5 border-0',
        variants[priority],
        className
      )}
    >
      <span className="mr-1">{icons[priority]}</span>
      {priority}
    </Badge>
  )
}