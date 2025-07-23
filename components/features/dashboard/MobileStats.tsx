import { Badge } from '@/components/ui/badge'

interface MobileStatsProps {
  stats: {
    total: number
    pending: number
    completed: number
  }
  isOnline: boolean
}

export function MobileStats({ stats, isOnline }: MobileStatsProps) {
  return (
    <div className="flex sm:hidden items-center gap-2 overflow-x-auto">
      <Badge variant="outline" className="text-xs whitespace-nowrap">{stats.total} total</Badge>
      <Badge variant="default" className="text-xs whitespace-nowrap">{stats.pending} pending</Badge>
      <Badge variant="secondary" className="text-xs whitespace-nowrap">{stats.completed} completed</Badge>
      {!isOnline && (
        <Badge variant="destructive" className="animate-pulse text-xs whitespace-nowrap">
          Offline
        </Badge>
      )}
    </div>
  )
}